import { NextRequest, NextResponse } from 'next/server';
import { processEmailQueue, scheduleExpiredTrialSequence } from '@/lib/email-automation/scheduler';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Secret key for cron authentication (set in Vercel environment)
const CRON_SECRET = process.env.CRON_SECRET || 'kommentify-cron-secret-2024';

// Trigger scheduled posts whose time has arrived
async function triggerScheduledPosts(): Promise<{ triggeredCount: number }> {
  try {
    const now = new Date();
    
    // Find scheduled posts that are due and still pending
    const duePosts = await (prisma as any).postDraft.findMany({
      where: {
        status: 'scheduled',
        taskStatus: 'pending',
        scheduledFor: { lte: now },
        taskId: null // Not yet sent to extension
      },
      include: { user: true }
    });

    if (duePosts.length === 0) {
      return { triggeredCount: 0 };
    }

    console.log(`📅 Found ${duePosts.length} scheduled posts due for posting`);

    let triggeredCount = 0;
    
    for (const post of duePosts) {
      try {
        // Create command for extension
        const commandPayload = {
          command: 'post_scheduled_content',
          content: post.content,
          topic: post.topic || '',
          template: post.template || '',
          tone: post.tone || '',
          scheduledFor: post.scheduledFor.toISOString(),
          draftId: post.id
        };

        const command = await (prisma as any).command.create({
          data: {
            userId: post.userId,
            command: 'post_scheduled_content',
            payload: JSON.stringify(commandPayload),
            status: 'pending',
            scheduledFor: post.scheduledFor
          }
        });

        // Update draft with task ID and mark as sent
        await (prisma as any).postDraft.update({
          where: { id: post.id },
          data: { 
            taskId: command.id,
            taskSentAt: new Date(),
            taskStatus: 'pending'
          }
        });

        console.log(`✅ Triggered scheduled post for user ${post.user.email}, task ID: ${command.id}`);
        triggeredCount++;
      } catch (error) {
        console.error(`❌ Failed to trigger scheduled post ${post.id}:`, error);
      }
    }

    return { triggeredCount };
  } catch (error) {
    console.error('❌ Error triggering scheduled posts:', error);
    return { triggeredCount: 0 };
  }
}
async function checkFailedScheduledPosts(): Promise<{ failedCount: number }> {
  try {
    // Find tasks that were sent more than 15 minutes ago but not completed
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    
    const failedTasks = await (prisma as any).postDraft.updateMany({
      where: {
        taskStatus: 'in_progress',
        taskSentAt: { lt: fifteenMinutesAgo }
      },
      data: {
        taskStatus: 'failed',
        taskFailedAt: new Date(),
        taskFailureReason: 'Extension Inactive - No response received within 15 minutes'
      }
    });

    if (failedTasks.count > 0) {
      console.log(`⚠️ Marked ${failedTasks.count} scheduled posts as failed due to extension inactivity`);
    }

    return { failedCount: failedTasks.count };
  } catch (error) {
    console.error('❌ Error checking failed scheduled posts:', error);
    return { failedCount: 0 };
  }
}

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
      console.error('❌ Starter plan not found in database');
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

    console.log(`✅ Downgraded ${updates.length} users from trial to starter plan`);

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
    
    // 1. Trigger scheduled posts whose time has arrived
    const triggerResult = await triggerScheduledPosts();
    
    // 2. Check failed scheduled posts (runs every minute)
    const failedPostsResult = await checkFailedScheduledPosts();
    
    // 3. Check expired trials (runs every 10 minutes)
    const trialResult = await checkExpiredTrials();
    
    // 4. Process email queue
    const emailResult = await processEmailQueue(20);

    console.log(`✅ Cron complete: ${emailResult.processed} emails sent, ${emailResult.failed} failed, ${trialResult.downgradedCount} trials downgraded, ${triggerResult.triggeredCount} posts triggered, ${failedPostsResult.failedCount} posts failed`);

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
      scheduledPosts: {
        triggered: triggerResult.triggeredCount,
        failed: failedPostsResult.failedCount
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
