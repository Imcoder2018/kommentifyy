import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyToken } from '@/lib/auth';
import { scheduleOnboardingSequence } from '@/lib/email-automation/scheduler';
import { z } from 'zod';

// Generate a unique referral code
function generateReferralCode(userId: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code + userId.slice(-4).toUpperCase();
}

const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
  planId: z.string().optional(),
  sendWelcomeEmail: z.boolean().optional().default(true),
});

export async function POST(request: NextRequest) {
  try {
    // Verify admin token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    // Verify admin exists - check for fallback admin first
    const FALLBACK_ADMIN_EMAIL = 'admin@linkedin-automation.com';
    const isFallbackAdmin = payload.email === FALLBACK_ADMIN_EMAIL;
    
    if (!isFallbackAdmin) {
      const admin = await prisma.admin.findUnique({ where: { email: payload.email } });
      if (!admin) {
        return NextResponse.json({ success: false, error: 'Admin not found' }, { status: 403 });
      }
    }

    const body = await request.json();
    const { email, password, name, planId, sendWelcomeEmail } = createUserSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'User with this email already exists' }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const referralCode = generateReferralCode(userId);

    // Get the plan to assign
    let assignedPlanId = planId;
    let trialEndsAt: Date | null = null;

    if (!assignedPlanId) {
      // Default to trial plan if available
      const trialPlan = await prisma.plan.findFirst({ where: { isTrialPlan: true } });
      if (trialPlan) {
        assignedPlanId = trialPlan.id;
        trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + trialPlan.trialDurationDays);
      }
    }

    // Create the user
    const user = await prisma.user.create({
      data: {
        id: userId,
        email,
        name,
        password: hashedPassword,
        authProvider: 'admin',
        referralCode,
        trialEndsAt,
        planId: assignedPlanId,
      },
      include: { plan: true },
    });

    console.log(`Admin created new user: ${email}`);

    // Schedule onboarding emails if requested
    if (sendWelcomeEmail) {
      scheduleOnboardingSequence(user.id, email, name).catch(err => {
        console.error('Failed to schedule onboarding emails:', err);
      });
    }

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: `User ${email} created successfully. They can login with the password you provided.`,
      credentials: {
        email,
        password, // Return the plain password so admin can share it
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors.map(e => e.message).join(', ') },
        { status: 400 }
      );
    }

    console.error('Error creating user:', error);
    return NextResponse.json({ success: false, error: 'Failed to create user' }, { status: 500 });
  }
}
