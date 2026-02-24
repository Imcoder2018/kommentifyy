import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { scheduleExpiredTrialSequence } from '@/lib/email-automation/scheduler';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('CRON_SECRET not configured');
      return NextResponse.json({
        success: false,
        error: 'Cron endpoint not configured'
      }, { status: 503 });
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    console.log('🔄 Starting trial expiry check...');

    // Find users with expired trials
    const expiredTrials = await prisma.user.findMany({
      where: {
        trialEndsAt: {
          lte: new Date()
        },
        plan: {
          isTrialPlan: true
        }
      },
      include: { plan: true }
    });

    if (expiredTrials.length === 0) {
      console.log('✅ No expired trials found');
      return NextResponse.json({
        success: true,
        message: 'No expired trials found',
        downgradedCount: 0
      });
    }

    console.log(`⚠️ Found ${expiredTrials.length} expired trials`);

    // Get default free plan
    const freePlan = await prisma.plan.findFirst({
      where: { isDefaultFreePlan: true }
    });

    if (!freePlan) {
      console.error('❌ Free plan not found in database');
      return NextResponse.json({
        success: false,
        error: 'Starter plan not configured'
      }, { status: 500 });
    }

    // Downgrade all expired trials
    const updates = await Promise.all(
      expiredTrials.map(user =>
        prisma.user.update({
          where: { id: user.id },
          data: {
            planId: freePlan.id,
            trialEndsAt: null
          }
        })
      )
    );

    console.log(`✅ Successfully downgraded ${updates.length} users from trial to starter plan`);
    console.log('Downgraded users:', updates.map(u => u.email).join(', '));

    // Schedule expired trial email sequence for each user
    for (const user of updates) {
      scheduleExpiredTrialSequence(user.id, user.email, user.name || '').catch(err => {
        console.error(`Failed to schedule expired trial emails for ${user.email}:`, err);
      });
    }

    return NextResponse.json({
      success: true,
      message: `Downgraded ${updates.length} users from trial to starter plan`,
      downgradedCount: updates.length
    });
  } catch (error: any) {
    console.error('❌ Error checking trial expiry:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
