import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateToken, generateRefreshToken } from '@/lib/auth';
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

// Generate a random password for Clerk users
function generateRandomPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 24; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ success: false, error: 'Not authenticated with Clerk' }, { status: 401 });
    }

    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json({ success: false, error: 'Could not fetch Clerk user' }, { status: 400 });
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) {
      return NextResponse.json({ success: false, error: 'No email found' }, { status: 400 });
    }

    const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || email.split('@')[0];

    // Check if user exists by Clerk ID or email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { clerkUserId },
          { email },
        ],
      },
      include: { plan: true },
    });

    if (user) {
      // Update existing user with Clerk ID if not already set
      if (!user.clerkUserId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { clerkUserId },
          include: { plan: true },
        });
      }
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

      user = await prisma.user.create({
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
        include: { plan: true },
      });

      // Schedule onboarding email sequence for new users
      scheduleOnboardingSequence(user.id, email, name).catch(err => {
        console.error('Failed to schedule onboarding emails:', err);
      });
    }

    // Generate JWT tokens for API compatibility
    const token = generateToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token,
      refreshToken,
    });
  } catch (error) {
    console.error('Clerk sync error:', error);
    return NextResponse.json({ success: false, error: 'Failed to sync user' }, { status: 500 });
  }
}
