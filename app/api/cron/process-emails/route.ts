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
        // Create command for extension using Activity model
        const commandPayload = {
          command: 'post_scheduled_content',
          content: post.content,
          topic: post.topic || '',
          template: post.template || '',
          tone: post.tone || '',
          scheduledFor: post.scheduledFor.toISOString(),
          draftId: post.id
        };

        const activity = await prisma.activity.create({
          data: {
            userId: post.userId,
            type: 'extension_command_post_scheduled_content',
            metadata: JSON.stringify({
              ...commandPayload,
              status: 'pending',
              createdAt: new Date().toISOString(),
            }),
            timestamp: new Date(),
          }
        });

        // Update draft with task ID and mark as sent
        await (prisma as any).postDraft.update({
          where: { id: post.id },
          data: { 
            taskId: activity.id,
            taskSentAt: new Date(),
            taskStatus: 'pending'
          }
        });

        console.log(`✅ Triggered scheduled post for user ${post.user.email}, task ID: ${activity.id}`);
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

// Re-trigger stale 'pending' posts — Activity was created but extension never picked it up (PC was offline)
// Resets taskId so triggerScheduledPosts can re-create a fresh command
async function retriggerStalePendingPosts(): Promise<{ retriggeredCount: number }> {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const stalePending = await (prisma as any).postDraft.findMany({
      where: {
        status: 'scheduled',
        taskStatus: 'pending',
        taskId: { not: null },
        taskSentAt: { lt: thirtyMinutesAgo },
      }
    });

    if (stalePending.length === 0) return { retriggeredCount: 0 };

    // Reset them so triggerScheduledPosts picks them up again
    await (prisma as any).postDraft.updateMany({
      where: {
        id: { in: stalePending.map((p: any) => p.id) }
      },
      data: {
        taskId: null,
        taskSentAt: null,
        taskStatus: 'pending',
      }
    });

    console.log(`🔄 Reset ${stalePending.length} stale pending posts for re-triggering`);
    return { retriggeredCount: stalePending.length };
  } catch (error) {
    console.error('❌ Error retriggering stale pending posts:', error);
    return { retriggeredCount: 0 };
  }
}

// Re-queue failed posts whose schedule time has passed — handles "post instantly when user comes back online"
async function requeueFailedPastDuePosts(): Promise<{ requeuedCount: number }> {
  try {
    const now = new Date();
    const requeuedPosts = await (prisma as any).postDraft.updateMany({
      where: {
        status: 'scheduled',
        taskStatus: 'failed',
        scheduledFor: { lte: now },
        taskFailureReason: { contains: 'Extension Inactive' }
      },
      data: {
        taskId: null,
        taskSentAt: null,
        taskStatus: 'pending',
        taskFailedAt: null,
        taskFailureReason: null,
      }
    });

    if (requeuedPosts.count > 0) {
      console.log(`🔄 Re-queued ${requeuedPosts.count} failed past-due posts for immediate delivery`);
    }

    return { requeuedCount: requeuedPosts.count };
  } catch (error) {
    console.error('❌ Error requeuing failed past-due posts:', error);
    return { requeuedCount: 0 };
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
    
    // 1. Re-queue failed past-due posts (disconnect resilience — runs first so they get picked up below)
    const requeueResult = await requeueFailedPastDuePosts();

    // 2. Re-trigger stale pending posts (extension was offline when Activity was created)
    const retriggerResult = await retriggerStalePendingPosts();

    // 3. Trigger scheduled posts whose time has arrived
    const triggerResult = await triggerScheduledPosts();
    
    // 4. Check failed scheduled posts (runs every minute)
    const failedPostsResult = await checkFailedScheduledPosts();
    
    // 5. Check expired trials (runs every 10 minutes)
    const trialResult = await checkExpiredTrials();
    
    // 6. Process email queue
    const emailResult = await processEmailQueue(20);

    console.log(`✅ Cron complete: ${emailResult.processed} emails sent, ${trialResult.downgradedCount} trials downgraded, ${triggerResult.triggeredCount} posts triggered, ${failedPostsResult.failedCount} posts failed, ${retriggerResult.retriggeredCount} retriggered, ${requeueResult.requeuedCount} requeued`);

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
        failed: failedPostsResult.failedCount,
        retriggered: retriggerResult.retriggeredCount,
        requeued: requeueResult.requeuedCount
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
