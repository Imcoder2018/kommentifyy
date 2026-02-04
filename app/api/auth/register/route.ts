import { NextRequest, NextResponse } from 'next/server';
import { generateToken, generateRefreshToken } from '@/lib/auth';
import { userService } from '@/lib/user-service';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { scheduleOnboardingSequence } from '@/lib/email-automation/scheduler';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
  referralCode: z.string().optional(),
});

// Generate a unique referral code
function generateReferralCode(userId: string): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code + userId.slice(-4).toUpperCase();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, referralCode } = registerSchema.parse(body);

    console.log('Registration attempt for:', email);
    console.log('Referral code provided:', referralCode || 'None');
    console.log('Running with Schema Fix v3 (linkedin_automation) - Debug Mode');

    // Log environment status (masked)
    const dbUrl = process.env.DATABASE_URL;
    console.log('DEBUG: DATABASE_URL exists:', !!dbUrl);
    if (dbUrl) {
      console.log('DEBUG: DATABASE_URL schema:', dbUrl.includes('schema=linkedin_automation') ? 'Correct (linkedin_automation)' : 'INCORRECT/MISSING SCHEMA');
      // Log host safely
      const parts = dbUrl.split('@');
      if (parts.length > 1) {
        const hostParts = parts[1].split(':');
        console.log('DEBUG: DATABASE_URL host:', hostParts[0]);
      }
    } else {
      console.error('CRITICAL: DATABASE_URL is missing!');
    }

    // Check if user already exists
    console.log('DEBUG: Checking if user exists...');
    const existingUser = await userService.findUserByEmail(email);
    if (existingUser) {
      console.log('DEBUG: User already exists');
      return NextResponse.json(
        { success: false, error: 'User already exists' },
        { status: 400 }
      );
    }

    // Create user
    console.log('DEBUG: Creating user...');
    const user = await userService.createUser(email, password, name);
    console.log('DEBUG: User created successfully');

    // Generate unique referral code for the new user
    const newUserReferralCode = generateReferralCode(user.id);
    
    // Handle referral - link to referrer if valid code provided
    let referrerId: string | null = null;
    if (referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: referralCode.toUpperCase() }
      });
      if (referrer) {
        referrerId = referrer.id;
        console.log(`User referred by: ${referrer.email}`);
      } else {
        console.log('Invalid referral code provided:', referralCode);
      }
    }

    // Update user with referral code and referrer
    await prisma.user.update({
      where: { id: user.id },
      data: {
        referralCode: newUserReferralCode,
        referredById: referrerId
      }
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
      { success: false, error: 'Registration failed. Please try again. Debug ID: ' + Date.now() },
      { status: 500 }
    );
  }
}
