import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'linkedin-automation-super-secret-jwt-key-min-32-characters-long-2024';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'linkedin-automation-super-secret-refresh-key-min-32-characters-long-2024';

// CORS headers for extension access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Not authenticated',
        loggedIn: false 
      }, { status: 401, headers: corsHeaders });
    }

    // Get user from Clerk
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found',
        loggedIn: false 
      }, { status: 401, headers: corsHeaders });
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress;
    const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User';

    // Find or create user in our database
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { clerkUserId },
          { email }
        ]
      },
      include: { plan: true }
    });

    if (!user && email) {
      // Create new user with trial plan
      const trialPlan = await prisma.plan.findFirst({
        where: { name: 'Trial' }
      });

      const newUser = await prisma.user.create({
        data: {
          email,
          name,
          clerkUserId,
          password: `clerk_${clerkUserId}_${Date.now()}`,
          planId: trialPlan?.id || null,
          trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
      
      user = await prisma.user.findUnique({
        where: { id: newUser.id },
        include: { plan: true }
      });
    } else if (user && !user.clerkUserId) {
      // Link existing user to Clerk
      await prisma.user.update({
        where: { id: user.id },
        data: { clerkUserId },
      });
      
      user = await prisma.user.findUnique({
        where: { id: user.id },
        include: { plan: true }
      });
    }

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User creation failed' 
      }, { status: 500, headers: corsHeaders });
    }

    // Generate JWT tokens for the extension
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        clerkUserId: user.clerkUserId 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: '30d' }
    );

    // Return auth data for the extension
    return NextResponse.json({
      success: true,
      loggedIn: true,
      authToken: token,
      refreshToken: refreshToken,
      userData: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        trialEndsAt: user.trialEndsAt,
      },
      apiBaseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://kommentify.com'
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Extension token error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Authentication error' 
    }, { status: 500, headers: corsHeaders });
  }
}
