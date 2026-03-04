import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Cron endpoint - runs every minute to process autopilot leads
// 1. Fetch posts for leads that need them
// 2. Generate AI comments for leads with posts
// 3. Mark tasks as complete

export async function GET(request: NextRequest) {
  try {
    // Support both header and query param auth
    const authHeader = request.headers.get('authorization');
    const queryKey = new URL(request.url).searchParams.get('key');
    const cronSecret = process.env.CRON_SECRET || process.env.INTERNAL_API_KEY;

    // Allow if header matches OR query param matches
    const headerValid = authHeader === `Bearer ${cronSecret}`;
    const queryValid = queryKey === cronSecret;

    if (!headerValid && !queryValid) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const results = {
      postsFetchQueued: 0,
      postsFetched: 0,
      aiCommentsGenerated: 0,
      errors: [] as string[],
    };

    // Get all users with autopilot enabled
    const userSettings = await (prisma as any).warmLeadsSettings.findMany({
      where: { autopilotEnabled: true },
    });

    for (const settings of userSettings) {
      try {
        const userId = settings.userId;
        const context = settings.businessContext || '';

        // Step 1: Find scheduled leads that need posts fetched
        // Use try-catch to handle if postsFetched field doesn't exist in older schemas
        let leadsNeedingPosts: any[] = [];
        try {
          leadsNeedingPosts = await (prisma as any).warmLead.findMany({
            where: {
              userId,
              engagementType: 'scheduled',
              OR: [
                { postsFetched: false },
                { postsFetched: null },
              ],
            },
            take: 10,
          });
        } catch (fieldError: any) {
          // If postsFetched field doesn't exist, get all scheduled leads
          if (fieldError.message?.includes('postsFetched')) {
            console.log(`User ${userId}: postsFetched field not found, checking posts instead`);
            leadsNeedingPosts = await (prisma as any).warmLead.findMany({
              where: {
                userId,
                engagementType: 'scheduled',
              },
              include: { posts: { take: 1 } },
              take: 10,
            });
            // Filter to leads without posts
            leadsNeedingPosts = leadsNeedingPosts.filter((l: any) => !l.posts || l.posts.length === 0);
          } else {
            throw fieldError;
          }
        }

        if (leadsNeedingPosts.length > 0) {
          // Check if there's already a recent pending fetch command to avoid duplicates
          const recentFetchCommand = await prisma.activity.findFirst({
            where: {
              userId,
              type: 'extension_command_fetch_lead_posts_bulk',
              timestamp: { gte: new Date(Date.now() - 5 * 60 * 1000) }, // Last 5 min
            },
            orderBy: { timestamp: 'desc' },
          });

          // Only create new command if no pending one exists
          if (!recentFetchCommand) {
            // Queue post fetching command for extension
            const fetchData = leadsNeedingPosts.map((l: any) => ({
              leadId: l.id,
              vanityId: l.vanityId || l.linkedinUrl.match(/linkedin\.com\/in\/([^/?#]+)/i)?.[1],
            })).filter((b: any) => b.vanityId);

            if (fetchData.length > 0) {
              await prisma.activity.create({
                data: {
                  userId,
                  type: 'extension_command_fetch_lead_posts_bulk',
                  metadata: {
                    command: 'fetch_lead_posts_bulk',
                    data: { leads: fetchData },
                    status: 'pending',
                    createdAt: new Date().toISOString(),
                  },
                },
              });
              results.postsFetchQueued += fetchData.length;
            }
          } else {
            console.log(`Skipping duplicate fetch command - recent one exists for user ${userId}`);
          }
        }

        // Step 2: Find scheduled leads that have posts but no AI comments
        let leadsWithPosts: any[] = [];
        try {
          leadsWithPosts = await (prisma as any).warmLead.findMany({
            where: {
              userId,
              engagementType: 'scheduled',
              postsFetched: true,
            },
            include: {
              posts: {
                where: {
                  postText: { not: '' },
                  OR: [
                    { commentText: null },
                    { commentText: '' },
                  ],
                },
                take: 3,
              },
            },
            take: 10,
          });
        } catch (fieldError: any) {
          // Fallback: get all scheduled leads and check if they have posts
          if (fieldError.message?.includes('postsFetched')) {
            const allScheduledLeads = await (prisma as any).warmLead.findMany({
              where: {
                userId,
                engagementType: 'scheduled',
              },
              include: {
                posts: {
                  where: {
                    postText: { not: '' },
                  },
                  take: 3,
                },
              },
              take: 10,
            });
            leadsWithPosts = allScheduledLeads.filter((l: any) => l.posts && l.posts.length > 0);
          } else {
            throw fieldError;
          }
        }

        // Generate AI comments for each lead's posts
        for (const lead of leadsWithPosts) {
          const posts = lead.posts || [];
          if (posts.length === 0) continue;

          // Get user's auth token for AI API calls
          // We'll use a simplified approach - generate comments one by one
          for (const post of posts) {
            if (!post.postText || post.commentText) continue;

            try {
              // Call AI generate comment API internally
              const aiRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/ai/generate-comment`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  // Note: In production, you'd need to handle auth differently
                  // This is a simplified approach
                },
                body: JSON.stringify({
                  postText: post.postText,
                  authorName: lead.firstName || '',
                  goal: 'AddValue',
                  tone: 'Professional',
                  commentLength: 'Short',
                  userBackground: context,
                }),
              });

              if (aiRes.ok) {
                const aiData = await aiRes.json();
                if (aiData.success && aiData.content) {
                  await (prisma as any).warmLeadPost.update({
                    where: { id: post.id },
                    data: { commentText: aiData.content },
                  });
                  results.aiCommentsGenerated++;
                }
              }
            } catch (aiErr) {
              console.error('AI comment generation error:', aiErr);
              results.errors.push(`AI generation failed for post ${post.id}: ${aiErr}`);
            }
          }
        }

        // Step 3: Create pending extension tasks for leads that are ready
        // Get leads with posts and AI comments ready
        let readyLeads: any[] = [];
        try {
          readyLeads = await (prisma as any).warmLead.findMany({
            where: {
              userId,
              engagementType: 'scheduled',
              postsFetched: true,
              status: { in: ['fetched', 'engaged'] },
              nextActionDate: { lte: now },
            },
            include: {
              posts: {
                where: {
                  commentText: { not: null },
                  isCommented: false,
                },
                take: 1,
              },
            },
            take: settings.profilesPerDay || 20,
          });
        } catch (fieldError: any) {
          // Fallback if postsFetched doesn't exist
          if (fieldError.message?.includes('postsFetched')) {
            readyLeads = await (prisma as any).warmLead.findMany({
              where: {
                userId,
                engagementType: 'scheduled',
                status: { in: ['fetched', 'engaged'] },
                nextActionDate: { lte: now },
              },
              include: {
                posts: {
                  take: 5,
                },
              },
              take: settings.profilesPerDay || 20,
            });
            // Filter to leads that have posts with comments
            readyLeads = readyLeads.filter((l: any) => l.posts && l.posts.some((p: any) => p.commentText && !p.isCommented));
          } else {
            throw fieldError;
          }
        }

        for (const lead of readyLeads) {
          if (!lead.posts || lead.posts.length === 0) continue;
          const targetPost = lead.posts[0];

          // Create engagement task
          await prisma.activity.create({
            data: {
              userId,
              type: 'extension_command_engage_lead_post',
              metadata: {
                command: 'engage_lead_post',
                data: {
                  leadId: lead.id,
                  postId: targetPost.id,
                  postUrn: targetPost.postUrn,
                  enableLike: true,
                  enableComment: true,
                  commentText: targetPost.commentText,
                },
                status: 'pending',
                createdAt: new Date().toISOString(),
              },
            },
          });

          // Log the engagement in warmLeadEngagement for Recent Performance
          await (prisma as any).warmLeadEngagement.create({
            data: {
              userId,
              leadId: lead.id,
              action: 'scheduled_engagement',
              status: 'completed',
            },
          });

          // Update lead status
          await (prisma as any).warmLead.update({
            where: { id: lead.id },
            data: {
              status: 'engaged',
              touchCount: { increment: 1 },
              lastEngagedAt: new Date(),
              // Calculate next action date
              nextActionDate: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
            },
          });
        }

      } catch (e: any) {
        results.errors.push(`User ${settings.userId}: ${e.message}`);
      }
    }

    // Check for failed/failed post fetch commands and retry
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const failedFetchCommands = await prisma.activity.findMany({
      where: {
        type: 'extension_command_fetch_lead_posts_bulk',
        metadata: {
          path: ['status'],
          equals: 'failed',
        },
        timestamp: { lt: oneHourAgo },
      },
      take: 5,
    });

    // Retry failed commands by creating new ones
    for (const cmd of failedFetchCommands) {
      try {
        const meta = typeof cmd.metadata === 'string' ? JSON.parse(cmd.metadata) : cmd.metadata;
        await prisma.activity.create({
          data: {
            userId: cmd.userId,
            type: 'extension_command_fetch_lead_posts_bulk',
            metadata: {
              ...meta,
              status: 'pending',
              retryAt: new Date().toISOString(),
            },
          },
        });
      } catch (e) {
        results.errors.push(`Retry failed: ${e}`);
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
      timestamp: now.toISOString(),
    });
  } catch (error: any) {
    console.error('Cron autopilot processor error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
