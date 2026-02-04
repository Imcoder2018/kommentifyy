import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/auth';
import { scheduleOnboardingSequence } from '@/lib/email-automation/scheduler';

function generateReferralCode(userId: string): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

export async function GET(request: NextRequest) {
    try {
        console.log('Clerk callback started');
        
        const { userId: clerkUserId } = await auth();
        console.log('Clerk userId:', clerkUserId);
        
        if (!clerkUserId) {
            console.log('No clerkUserId, redirecting to login');
            return NextResponse.redirect(new URL('/login', request.url));
        }

        const clerkUser = await currentUser();
        console.log('Clerk user:', clerkUser?.emailAddresses?.[0]?.emailAddress);
        
        if (!clerkUser) {
            console.log('No clerkUser, redirecting to login');
            return NextResponse.redirect(new URL('/login', request.url));
        }

        const email = clerkUser.emailAddresses[0]?.emailAddress;
        const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || email?.split('@')[0];

        if (!email) {
            console.log('No email found');
            return NextResponse.redirect(new URL('/login?error=no-email', request.url));
        }

        // Check if user already exists by email first (more reliable)
        let user = await prisma.user.findUnique({
            where: { email: email },
            include: { plan: true }
        });

        console.log('Existing user found:', !!user);

        if (user) {
            // Link existing user to Clerk if not already linked
            try {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: { 
                        clerkUserId: clerkUserId,
                        authProvider: 'clerk',
                        name: name || user.name
                    },
                    include: { plan: true }
                });
                console.log('User updated with Clerk ID');
            } catch (updateError) {
                console.log('User already linked or update skipped');
            }
        } else {
            // Create new user
            console.log('Creating new user');
            const trialPlan = await prisma.plan.findFirst({
                where: { isTrialPlan: true }
            });
            console.log('Trial plan found:', !!trialPlan);

            let trialEndsAt: Date | null = null;
            if (trialPlan) {
                trialEndsAt = new Date();
                trialEndsAt.setDate(trialEndsAt.getDate() + trialPlan.trialDurationDays);
            }

            const referralCode = generateReferralCode(clerkUserId);

            user = await prisma.user.create({
                data: {
                    email,
                    name: name || 'User',
                    password: 'clerk-auth-no-password',
                    clerkUserId: clerkUserId,
                    authProvider: 'clerk',
                    referralCode,
                    trialEndsAt,
                    planId: trialPlan?.id
                },
                include: { plan: true }
            });
            console.log('New user created:', user.id);

            // Schedule onboarding emails for new Clerk users
            scheduleOnboardingSequence(user.id, user.email, user.name || '').catch(err => {
                console.error('Failed to schedule onboarding emails:', err);
            });
        }

        // Generate JWT token for API compatibility
        const token = generateToken({ 
            userId: user.id, 
            email: user.email
        });

        // Set token in cookie and redirect - check for paid plans, lifetime deals, or active trials
        const hasPaidPlan = user.plan && (
            (user.plan.price > 0 && !user.plan.isDefaultFreePlan) ||
            user.plan.isLifetime ||
            (user.plan.isTrialPlan && user.trialEndsAt && new Date(user.trialEndsAt) > new Date())
        );
        const redirectUrl = hasPaidPlan ? '/dashboard' : '/plans';
        console.log('Redirecting to:', redirectUrl);
        
        const response = NextResponse.redirect(new URL(redirectUrl, request.url));
        response.cookies.set('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        // Also set in localStorage-compatible way for client
        response.headers.set('X-Auth-Token', token);

        return response;
    } catch (error: any) {
        console.error('Clerk callback error:', error?.message || error);
        console.error('Error stack:', error?.stack);
        return NextResponse.redirect(new URL('/login?error=callback-failed&reason=' + encodeURIComponent(error?.message || 'unknown'), request.url));
    }
}
