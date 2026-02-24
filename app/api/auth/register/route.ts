import { NextRequest, NextResponse } from 'next/server';
import { generateToken, generateRefreshToken } from '@/lib/auth';
import { userService } from '@/lib/user-service';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { scheduleOnboardingSequence } from '@/lib/email-automation/scheduler';
import { generateReferralCode } from '@/lib/referral-utils';

// #31: Simple in-memory rate limiter for registration
const registerAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_REGISTER_ATTEMPTS = 3;
const REGISTER_WINDOW_MS = 60 * 60 * 1000; // 1 hour

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
  referralCode: z.string().optional(),
});


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, referralCode } = registerSchema.parse(body);

    // #31: Rate limiting based on email
    const now = Date.now();
    const key = email.toLowerCase();
    const entry = registerAttempts.get(key);
    if (entry && now < entry.resetAt && entry.count >= MAX_REGISTER_ATTEMPTS) {
      return NextResponse.json(
        { success: false, error: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      );
    }
    if (!entry || now > entry.resetAt) {
      registerAttempts.set(key, { count: 1, resetAt: now + REGISTER_WINDOW_MS });
    } else {
      entry.count++;
    }

    // Check if user already exists
    const existingUser = await userService.findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User already exists' },
        { status: 400 }
      );
    }

    // Handle referral - find referrer if valid code provided
    let referrerId: string | null = null;
    if (referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: referralCode.toUpperCase() }
      });
      if (referrer) {
        referrerId = referrer.id;
        console.log(`User will be referred by: ${referrer.email}`);
      } else {
        console.log('Invalid referral code provided:', referralCode);
      }
    }

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const newUserReferralCode = generateReferralCode(tempId);

    const user = await userService.createUser(email, password, name, {
      referralCode: newUserReferralCode,
      referredById: referrerId
    });

    // Generate tokens
    const token = generateToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    console.log('User registered successfully:', email);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Schedule onboarding email sequence (async, don't wait)
    scheduleOnboardingSequence(user.id, user.email, user.name || '').catch(err => {
      console.error('Failed to schedule onboarding emails:', err);
    });

    return NextResponse.json({
      success: true,
      user: { ...userWithoutPassword, referralCode: newUserReferralCode },
      token,
      refreshToken,
    });
  } catch (error) {
    console.error('CRITICAL REGISTRATION ERROR:', error);
    if (error instanceof Error) {
      console.error('Error Name:', error.name);
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);
      // Log cause if available
      if ((error as any).cause) console.error('Error Cause:', (error as any).cause);
    }

    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => e.message).join(', ');
      console.error('Validation error:', error.errors);
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
