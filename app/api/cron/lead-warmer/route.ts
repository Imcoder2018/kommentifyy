import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Cron endpoint - called by cron-job.org to process due lead warming touches
// This finds prospects whose nextTouchDate <= now and sends commands to the extension
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret or internal key
    const { searchParams } = new URL(request.url);
    const cronSecret = searchParams.get('key') || request.headers.get('x-cron-key');
    const internalKey = process.env.INTERNAL_API_KEY || process.env.CRON_SECRET;
    if (internalKey && cronSecret !== internalKey) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();

    // Find all prospects with due touches across all active campaigns
    const dueProspects = await (prisma as any).leadWarmerProspect.findMany({
      where: {
        nextTouchDate: { lte: now },
        nextTouchAction: { not: null },
        status: { notIn: ['connected', 'replied'] },
        campaign: { status: 'active' },
      },
      include: {
        campaign: { select: { id: true, userId: true, businessContext: true, campaignGoal: true, sequenceSteps: true, profilesPerDay: true } },
      },
      orderBy: { nextTouchDate: 'asc' },
    });

    if (dueProspects.length === 0) {
      return NextResponse.json({ success: true, message: 'No due prospects', processed: 0 });
    }

    // Group by user and campaign, enforce daily limits
    const userCampaignMap: Record<string, Record<string, any[]>> = {};
    for (const p of dueProspects) {
      const userId = p.campaign.userId;
      const campId = p.campaignId;
      if (!userCampaignMap[userId]) userCampaignMap[userId] = {};
      if (!userCampaignMap[userId][campId]) userCampaignMap[userId][campId] = [];
      userCampaignMap[userId][campId].push(p);
    }

    let totalQueued = 0;
    const results: any[] = [];

    for (const userId of Object.keys(userCampaignMap)) {
      for (const campaignId of Object.keys(userCampaignMap[userId])) {
        const prospects = userCampaignMap[userId][campaignId];
        const campaign = prospects[0].campaign;
        const dailyLimit = Math.min(campaign.profilesPerDay || 20, 30); // Hard cap at 30

        // Count how many already processed today
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayCount = await (prisma as any).leadWarmerTouchLog.count({
          where: { userId, createdAt: { gte: todayStart } },
        });

        const remaining = Math.max(0, dailyLimit - todayCount);
        const batch = prospects.slice(0, remaining);

        if (batch.length === 0) continue;

        // Queue command for extension via extension command API
        for (const prospect of batch) {
          try {
            // Create a pending touch log
            await (prisma as any).leadWarmerTouchLog.create({
              data: {
                prospectId: prospect.id,
                userId,
                touchNumber: prospect.touchCount + 1,
                action: prospect.nextTouchAction,
                status: 'pending',
              },
            });

            // Send command to extension
            const commandData = {
              command: 'lead_warmer_touch',
              data: {
                prospectId: prospect.id,
                vanityId: prospect.vanityId,
                linkedinUrl: prospect.linkedinUrl,
                action: prospect.nextTouchAction,
                touchNumber: prospect.touchCount + 1,
                campaignGoal: campaign.campaignGoal,
                businessContext: campaign.businessContext,
                firstName: prospect.firstName,
                lastName: prospect.lastName,
                company: prospect.company,
                jobTitle: prospect.jobTitle,
              },
            };

            // Store command for extension polling
            await (prisma as any).activity.create({
              data: {
                userId,
                type: 'lead_warmer_command',
                metadata: commandData,
              },
            });

            totalQueued++;
          } catch (err: any) {
            console.error(`Cron lead-warmer: Error queueing ${prospect.id}:`, err.message);
          }
        }

        results.push({
          userId,
          campaignId,
          campaignName: campaign.name,
          dueCount: prospects.length,
          queuedCount: batch.length,
          skippedByLimit: prospects.length - batch.length,
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: totalQueued,
      results,
      timestamp: now.toISOString(),
    });
  } catch (error: any) {
    console.error('Cron lead-warmer error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
