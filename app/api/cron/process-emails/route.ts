import { NextRequest, NextResponse } from 'next/server';
import { processEmailQueue, scheduleExpiredTrialSequence } from '@/lib/email-automation/scheduler';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Secret key for cron authentication (set in Vercel environment)
const CRON_SECRET = process.env.CRON_SECRET || 'kommentify-cron-secret-2024';

// Check and downgrade expired trials
async function checkExpiredTrials(): Promise<{ downgradedCount: number }> {
  try {
    // Only run trial check every 10 minutes (check if current minute is divisible by 10)
    const currentMinute = new Date().getMinutes();
    if (currentMinute % 10 !== 0) {
      return { downgradedCount: 0 };
    }

    console.log('🔄 Checking for expired trials...');

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
      return { downgradedCount: 0 };
    }

    console.log(`⚠️ Found ${expiredTrials.length} expired trials`);

    // Get default free plan
    const freePlan = await prisma.plan.findFirst({
      where: { isDefaultFreePlan: true }
    });

    if (!freePlan) {
      console.error('❌ Free plan not found in database');
      return { downgradedCount: 0 };
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

    console.log(`✅ Downgraded ${updates.length} users from trial to free plan`);

    // Schedule expired trial email sequence for each user
    for (const user of updates) {
      scheduleExpiredTrialSequence(user.id, user.email, user.name || '').catch(err => {
        console.error(`Failed to schedule expired trial emails for ${user.email}:`, err);
      });
    }

    return { downgradedCount: updates.length };
  } catch (error) {
    console.error('❌ Error checking expired trials:', error);
    return { downgradedCount: 0 };
  }
}

// GET - Process email queue (called by cron job)
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const urlSecret = request.nextUrl.searchParams.get('secret');
    
    const providedSecret = authHeader?.replace('Bearer ', '') || urlSecret;
    
    if (providedSecret !== CRON_SECRET) {
      console.warn('⚠️ Unauthorized cron attempt');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🕐 Starting cron job processing...');
    
    // 1. Check expired trials (runs every 10 minutes)
    const trialResult = await checkExpiredTrials();
    
    // 2. Process email queue
    const emailResult = await processEmailQueue(20);

    console.log(`✅ Cron complete: ${emailResult.processed} emails sent, ${emailResult.failed} failed, ${trialResult.downgradedCount} trials downgraded`);

    return NextResponse.json({
      success: true,
      message: 'Cron job processed',
      emails: {
        processed: emailResult.processed,
        failed: emailResult.failed
      },
      trials: {
        downgraded: trialResult.downgradedCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Cron process-emails error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// POST - Manually trigger email processing (for testing)
export async function POST(request: NextRequest) {
  try {
    // Verify admin token or cron secret
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Check if it's cron secret or admin token
    if (token !== CRON_SECRET) {
      // Verify admin token
      try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        if (!payload.isAdmin && payload.role !== 'admin') {
          return NextResponse.json(
            { success: false, error: 'Admin access required' },
            { status: 403 }
          );
        }
      } catch {
        return NextResponse.json(
          { success: false, error: 'Invalid token' },
          { status: 401 }
        );
      }
    }

    const body = await request.json().catch(() => ({}));
    const batchSize = body.batchSize || 20;

    console.log(`🕐 Manual email processing triggered (batch: ${batchSize})...`);
    
    const result = await processEmailQueue(batchSize);

    return NextResponse.json({
      success: true,
      message: 'Email queue processed manually',
      processed: result.processed,
      failed: result.failed,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Manual email processing error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
