import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { scheduleOnboardingSequence } from '@/lib/email-automation/scheduler';

// Generate a unique referral code
function generateReferralCode(userId: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code + userId.slice(-4).toUpperCase();
}

// Generate a random password for Clerk users (they won't use it, but needed for DB)
function generateRandomPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 24; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export async function POST(request: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  // Get the headers
  const svix_id = request.headers.get('svix-id');
  const svix_timestamp = request.headers.get('svix-timestamp');
  const svix_signature = request.headers.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }

  // Get the body
  const payload = await request.text();

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: any;

  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const eventType = evt.type;
  console.log(`Clerk webhook received: ${eventType}`);

  try {
    if (eventType === 'user.created') {
      const { id: clerkUserId, email_addresses, first_name, last_name } = evt.data;
      
      const primaryEmail = email_addresses?.find((e: any) => e.id === evt.data.primary_email_address_id);
      const email = primaryEmail?.email_address;
      
      if (!email) {
        console.error('No email found for Clerk user:', clerkUserId);
        return NextResponse.json({ error: 'No email found' }, { status: 400 });
      }

      const name = [first_name, last_name].filter(Boolean).join(' ') || email.split('@')[0];

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({ where: { email } });
      
      if (existingUser) {
        // Link existing user to Clerk
        await prisma.user.update({
          where: { email },
          data: {
            clerkUserId,
            authProvider: existingUser.authProvider === 'legacy' ? 'legacy' : 'clerk',
          },
        });
        console.log(`Linked existing user ${email} to Clerk`);
      } else {
        // Create new user
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const hashedPassword = await hashPassword(generateRandomPassword());
        const referralCode = generateReferralCode(userId);

        // Get trial plan
        const trialPlan = await prisma.plan.findFirst({ where: { isTrialPlan: true } });
        let trialEndsAt: Date | null = null;
        
        if (trialPlan) {
          trialEndsAt = new Date();
          trialEndsAt.setDate(trialEndsAt.getDate() + trialPlan.trialDurationDays);
        }

        const newUser = await prisma.user.create({
          data: {
            id: userId,
            email,
            name,
            password: hashedPassword,
            clerkUserId,
            authProvider: 'clerk',
            referralCode,
            trialEndsAt,
            planId: trialPlan?.id,
          },
        });

        console.log(`Created new Clerk user: ${email}`);

        // Schedule onboarding email sequence
        scheduleOnboardingSequence(newUser.id, email, name).catch(err => {
          console.error('Failed to schedule onboarding emails:', err);
        });
      }
    } else if (eventType === 'user.updated') {
      const { id: clerkUserId, email_addresses, first_name, last_name } = evt.data;
      
      const primaryEmail = email_addresses?.find((e: any) => e.id === evt.data.primary_email_address_id);
      const email = primaryEmail?.email_address;
      const name = [first_name, last_name].filter(Boolean).join(' ');

      if (clerkUserId) {
        await prisma.user.updateMany({
          where: { clerkUserId },
          data: {
            ...(email && { email }),
            ...(name && { name }),
          },
        });
        console.log(`Updated Clerk user: ${clerkUserId}`);
      }
    } else if (eventType === 'user.deleted') {
      const { id: clerkUserId } = evt.data;
      
      // We don't delete users, just unlink Clerk
      await prisma.user.updateMany({
        where: { clerkUserId },
        data: { clerkUserId: null },
      });
      console.log(`Unlinked Clerk user: ${clerkUserId}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing Clerk webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
