import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { postToLinkedIn, postWithImageToLinkedIn, postWithVideoToLinkedIn } from '@/lib/linkedin-service';

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

if (!process.env.CRON_SECRET) {
  throw new Error('CRITICAL: CRON_SECRET environment variable is not set');
}

// Cron secret for security
const CRON_SECRET = process.env.CRON_SECRET;

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

    // 3. Process due posts — try LinkedIn API first, then extension fallback
    for (const post of duePosts) {
      try {
        let posted = false;

        // Try LinkedIn API posting first (server-side, no extension needed)
        if (post.postMethod === 'api' || !post.postMethod || post.postMethod === 'extension') {
          const linkedInOAuth = await (prisma as any).linkedInOAuth.findFirst({
            where: { userId: post.userId, isActive: true },
          });

          if (linkedInOAuth && linkedInOAuth.tokenExpiresAt && new Date(linkedInOAuth.tokenExpiresAt) > now) {
            try {
              let apiResult;
              if (post.mediaUrl && post.mediaType === 'video') {
                apiResult = await postWithVideoToLinkedIn(linkedInOAuth.accessToken, linkedInOAuth.linkedinId, post.content, post.mediaUrl);
              } else if (post.mediaUrl && post.mediaType === 'image') {
                apiResult = await postWithImageToLinkedIn(linkedInOAuth.accessToken, linkedInOAuth.linkedinId, post.content, post.mediaUrl);
              } else {
                apiResult = await postToLinkedIn(linkedInOAuth.accessToken, linkedInOAuth.linkedinId, post.content);
              }

              await (prisma as any).postDraft.update({
                where: { id: post.id },
                data: {
                  status: 'posted',
                  taskStatus: 'completed',
                  taskCompletedAt: now,
                  postedAt: now,
                  linkedinPostId: apiResult?.id || null,
                  postMethod: 'api',
                },
              });

              // Update last used timestamp
              await (prisma as any).linkedInOAuth.update({
                where: { userId: post.userId },
                data: { lastUsedAt: now },
              });

              posted = true;
              results.sent++;
              console.log(`✅ [CRON] Posted via LinkedIn API: ${post.id} for user ${post.userId}`);
            } catch (apiErr: any) {
              console.error(`⚠️ [CRON] LinkedIn API posting failed for ${post.id}:`, apiErr.message);
              // If 401, mark token as expired
              if (apiErr.message?.includes('401')) {
                await (prisma as any).linkedInOAuth.update({
                  where: { userId: post.userId },
                  data: { isActive: false },
                });
              }
              // Fall through to extension-based posting
            }
          }
        }

        // Fallback: Extension-based posting
        if (!posted) {
          const heartbeat = await (prisma as any).extensionHeartbeat.findFirst({
            where: {
              userId: post.userId,
              lastSeen: { gte: new Date(now.getTime() - 2 * 60 * 1000) }
            },
            orderBy: { lastSeen: 'desc' }
          });

          if (!heartbeat) {
            console.log(`⏳ [CRON] No API token & extension offline for user ${post.userId}, skipping post ${post.id}`);
            continue;
          }

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
                mediaUrl: post.mediaUrl || null,
                mediaType: post.mediaType || null,
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
                postMethod: 'extension',
              }
            });
            results.sent++;
            console.log(`✅ [CRON] Sent scheduled post ${post.id} to extension, taskId: ${commandData.commandId}`);
          } else {
            results.failed++;
            results.errors.push(`Failed to send post ${post.id}: ${commandData.error}`);
          }
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
