import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * CRON ENDPOINT: /api/cron/scheduled-posts
 * Add this URL to cron-job.org to trigger every minute
 * 
 * This endpoint:
 * 1. Finds scheduled posts that are due
 * 2. Sends tasks to online extensions
 * 3. Retries failed posts when extension comes online
 * 4. Checks extension online status via heartbeat
 */

// Cron secret for security
const CRON_SECRET = process.env.CRON_SECRET || 'kommentify-cron-secret-2024';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const urlSecret = new URL(request.url).searchParams.get('secret');
    
    if (authHeader !== `Bearer ${CRON_SECRET}` && urlSecret !== CRON_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const results = {
      processed: 0,
      sent: 0,
      failed: 0,
      retried: 0,
      errors: [] as string[]
    };

    // 1. Find scheduled posts that are due (scheduledFor <= now) and not yet sent
    const duePosts = await (prisma as any).postDraft.findMany({
      where: {
        status: 'scheduled',
        taskStatus: 'pending',
        scheduledFor: { lte: now },
        taskId: null
      },
      take: 50 // Process max 50 per run
    });

    console.log(`🕐 [CRON] Found ${duePosts.length} scheduled posts due`);

    // 2. Find failed posts that can be retried (extension might be back online)
    const failedPosts = await (prisma as any).postDraft.findMany({
      where: {
        status: 'scheduled',
        taskStatus: 'failed',
        taskFailedAt: { 
          gte: new Date(now.getTime() - 30 * 60 * 1000) // Failed within last 30 mins
        },
        // Only retry if not too many attempts
        taskFailureReason: { not: 'Max retries exceeded' }
      },
      take: 20
    });

    console.log(`🕐 [CRON] Found ${failedPosts.length} failed posts to retry`);

    // 3. Process due posts
    for (const post of duePosts) {
      try {
        // Check if user's extension is online (heartbeat within last 2 minutes)
        const heartbeat = await (prisma as any).extensionHeartbeat.findFirst({
          where: {
            userId: post.userId,
            lastSeen: { gte: new Date(now.getTime() - 2 * 60 * 1000) }
          },
          orderBy: { lastSeen: 'desc' }
        });

        if (!heartbeat) {
          console.log(`⏳ [CRON] Extension offline for user ${post.userId}, skipping post ${post.id}`);
          continue;
        }

        // Send task to extension via command API
        const commandRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/extension/command`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.INTERNAL_API_KEY || 'internal-api-key'}`
          },
          body: JSON.stringify({
            command: 'post_scheduled_content',
            targetUserId: post.userId,
            data: {
              draftId: post.id,
              content: post.content,
              scheduledFor: post.scheduledFor
            }
          })
        });

        const commandData = await commandRes.json();

        if (commandData.success && commandData.commandId) {
          // Update post with task info
          await (prisma as any).postDraft.update({
            where: { id: post.id },
            data: {
              taskId: commandData.commandId,
              taskStatus: 'in_progress',
              taskSentAt: now
            }
          });
          results.sent++;
          console.log(`✅ [CRON] Sent scheduled post ${post.id} to extension, taskId: ${commandData.commandId}`);
        } else {
          results.failed++;
          results.errors.push(`Failed to send post ${post.id}: ${commandData.error}`);
          console.error(`❌ [CRON] Failed to send post ${post.id}:`, commandData.error);
        }
        
        results.processed++;
      } catch (err: any) {
        results.failed++;
        results.errors.push(`Error processing post ${post.id}: ${err.message}`);
        console.error(`❌ [CRON] Error processing post ${post.id}:`, err);
      }
    }

    // 4. Retry failed posts
    for (const post of failedPosts) {
      try {
        // Check if extension is now online
        const heartbeat = await (prisma as any).extensionHeartbeat.findFirst({
          where: {
            userId: post.userId,
            lastSeen: { gte: new Date(now.getTime() - 2 * 60 * 1000) }
          },
          orderBy: { lastSeen: 'desc' }
        });

        if (!heartbeat) continue;

        // Retry sending
        const commandRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/extension/command`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.INTERNAL_API_KEY || 'internal-api-key'}`
          },
          body: JSON.stringify({
            command: 'post_scheduled_content',
            targetUserId: post.userId,
            data: {
              draftId: post.id,
              content: post.content,
              scheduledFor: post.scheduledFor,
              isRetry: true
            }
          })
        });

        const commandData = await commandRes.json();

        if (commandData.success && commandData.commandId) {
          await (prisma as any).postDraft.update({
            where: { id: post.id },
            data: {
              taskId: commandData.commandId,
              taskStatus: 'in_progress',
              taskSentAt: now,
              taskFailureReason: null
            }
          });
          results.retried++;
          console.log(`🔄 [CRON] Retried failed post ${post.id}`);
        }
      } catch (err: any) {
        results.errors.push(`Error retrying post ${post.id}: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      results
    });
  } catch (error: any) {
    console.error('[CRON] Scheduled posts error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
