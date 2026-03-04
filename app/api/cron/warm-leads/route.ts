import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || process.env.INTERNAL_API_KEY;
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const results = { processed: 0, tasksCreated: 0, errors: [] as string[] };

    // Find all users with autopilot enabled
    const userSettings = await (prisma as any).warmLeadsSettings.findMany({
      where: { autopilotEnabled: true },
    });

    for (const settings of userSettings) {
      try {
        const userId = settings.userId;
        let sequenceSteps: any[] = [];
        try { sequenceSteps = JSON.parse(settings.sequenceSteps || '[]'); } catch (error) {
          console.error('Failed to parse sequenceSteps:', error);
        }
        const enabledSteps = sequenceSteps.filter((s: any) => s.enabled);
        if (enabledSteps.length === 0) continue;

        // Find leads that need action today
        // Include posts both unengaged AND those with AI comments (for autopilot)
        const leads = await (prisma as any).warmLead.findMany({
          where: {
            userId,
            status: { in: ['fetched', 'engaged'] },
            nextActionDate: { lte: now },
          },
          include: {
            posts: {
              where: {
                OR: [
                  { isLiked: false, isCommented: false },
                  { commentText: { not: null } } // Include posts with AI comments
                ]
              },
              take: 5, // Get more posts to find one with AI comment
              orderBy: { postDate: 'desc' }
            },
          },
          take: settings.profilesPerDay || 20,
        });

        for (const lead of leads) {
          const currentStep = lead.currentSequenceStep || 0;
          if (currentStep >= enabledSteps.length) continue;

          const stepConfig = enabledSteps[currentStep];
          if (!stepConfig) continue;

          // Get actions from step config (can be object or string)
          const actions = stepConfig.actions || {};
          const actionStr = typeof actions === 'string' ? actions : '';
          const hasLike = actions.like === true || actionStr === 'like';
          const hasComment = actions.comment === true || actionStr === 'comment';
          const hasConnect = actions.connect === true || actionStr === 'connect';

          // Get post to use - prefer one with stored AI comment
          const postWithComment = lead.posts?.find((p: any) => p.commentText);
          const targetPost = postWithComment || lead.posts?.[0];

          // Handle like action
          if (hasLike && targetPost) {
            let taskData: any = {
              leadId: lead.id,
              action: 'like',
              taskType: 'engage_lead_post',
              postId: targetPost.id,
              postUrn: targetPost.postUrn,
              enableLike: true,
              enableComment: false,
            };

            // Create activity entry for extension
            await prisma.activity.create({
              data: {
                userId,
                type: 'extension_command_engage_lead_post',
                metadata: {
                  command: 'engage_lead_post',
                  data: taskData,
                  status: 'pending',
                  createdAt: new Date().toISOString(),
                },
              },
            });
            results.tasksCreated++;
          }

          // Handle comment action
          if (hasComment && targetPost) {
            let taskData: any = {
              leadId: lead.id,
              action: 'comment',
              taskType: 'engage_lead_post',
              postId: targetPost.id,
              postUrn: targetPost.postUrn,
              enableLike: false,
              enableComment: true,
              // Use stored AI comment if available, otherwise generate on-the-fly
              commentText: targetPost.commentText || '',
            };

            // Create activity entry for extension
            await prisma.activity.create({
              data: {
                userId,
                type: 'extension_command_engage_lead_post',
                metadata: {
                  command: 'engage_lead_post',
                  data: taskData,
                  status: 'pending',
                  createdAt: new Date().toISOString(),
                },
              },
            });
            results.tasksCreated++;
          }

          // Handle connect action
          if (hasConnect) {
            let taskData: any = {
              leadId: lead.id,
              action: 'connect',
              taskType: 'linkedin_send_connection',
              profileUrl: lead.linkedinUrl,
              vanityId: lead.vanityId,
            };

            // Create activity entry for extension
            await prisma.activity.create({
              data: {
                userId,
                type: 'extension_command_send_connection',
                metadata: {
                  command: 'send_connection',
                  data: taskData,
                  status: 'pending',
                  createdAt: new Date().toISOString(),
                },
              },
            });
            results.tasksCreated++;
          }

          // Calculate next action date based on next step
          const nextStepIndex = currentStep + 1;
          let nextActionDate = null;
          let nextAction = null;
          if (nextStepIndex < enabledSteps.length) {
            const nextStep = enabledSteps[nextStepIndex];
            const daysUntilNext = nextStep.day - stepConfig.day;
            nextActionDate = new Date(now.getTime() + daysUntilNext * 24 * 60 * 60 * 1000);
            nextAction = 'like'; // Default next action
          }

          // Update lead
          await (prisma as any).warmLead.update({
            where: { id: lead.id },
            data: {
              currentSequenceStep: nextStepIndex,
              nextActionDate,
              nextAction,
            },
          });
        }

        results.processed++;
      } catch (e: any) {
        results.errors.push(`User ${settings.userId}: ${e.message}`);
      }
    }

    // Also check for missed tasks and mark them
    const missedTasks = await (prisma as any).pendingExtensionTask.updateMany({
      where: {
        status: 'pending',
        scheduledFor: { lt: new Date(now.getTime() - 60 * 60 * 1000) }, // More than 1 hour late
        missedSchedule: false,
      },
      data: { missedSchedule: true },
    });

    return NextResponse.json({
      success: true,
      ...results,
      missedTasksMarked: missedTasks.count,
      timestamp: now.toISOString(),
    });
  } catch (error: any) {
    console.error('Warm leads cron error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
