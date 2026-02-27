import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

function extractVanityId(url: string): string | null {
  const m = url.match(/linkedin\.com\/in\/([^/?#]+)/i);
  return m ? m[1].replace(/\/$/, '') : null;
}

// GET - List warm leads with their posts
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload?.userId) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = { userId: payload.userId };
    if (status && status !== 'all') where.status = status;

    const [leads, total, settings] = await Promise.all([
      (prisma as any).warmLead.findMany({
        where,
        include: {
          posts: { orderBy: { postDate: 'desc' }, take: 10 },
          engagementLogs: { orderBy: { createdAt: 'desc' }, take: 5 },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      (prisma as any).warmLead.count({ where }),
      (prisma as any).warmLeadsSettings.findUnique({ where: { userId: payload.userId } }),
    ]);

    return NextResponse.json({
      success: true,
      leads,
      total,
      settings: settings || null,
    });
  } catch (error: any) {
    console.error('GET warm-leads error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST - Import new leads
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload?.userId) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });

    const body = await request.json();
    const { leads, action } = body;

    // Save/update settings
    if (action === 'save_settings') {
      const { campaignName, businessContext, campaignGoal, sequenceSteps, profilesPerDay, postsPerLead, bulkTaskLimit, scheduleEnabled, scheduleTimes, autopilotEnabled } = body;
      const settings = await (prisma as any).warmLeadsSettings.upsert({
        where: { userId: payload.userId },
        create: {
          userId: payload.userId,
          campaignName: campaignName || 'My Warm Leads',
          businessContext,
          campaignGoal: campaignGoal || 'relationship',
          sequenceSteps: typeof sequenceSteps === 'string' ? sequenceSteps : JSON.stringify(sequenceSteps),
          profilesPerDay: profilesPerDay || 20,
          postsPerLead: postsPerLead || 10,
          bulkTaskLimit: bulkTaskLimit || 10,
          scheduleEnabled: scheduleEnabled || false,
          scheduleTimes: typeof scheduleTimes === 'string' ? scheduleTimes : JSON.stringify(scheduleTimes || []),
          autopilotEnabled: autopilotEnabled || false,
        },
        update: {
          campaignName: campaignName || undefined,
          businessContext,
          campaignGoal: campaignGoal || undefined,
          sequenceSteps: sequenceSteps ? (typeof sequenceSteps === 'string' ? sequenceSteps : JSON.stringify(sequenceSteps)) : undefined,
          profilesPerDay: profilesPerDay || undefined,
          postsPerLead: postsPerLead || undefined,
          bulkTaskLimit: bulkTaskLimit || undefined,
          scheduleEnabled: scheduleEnabled !== undefined ? scheduleEnabled : undefined,
          scheduleTimes: scheduleTimes ? (typeof scheduleTimes === 'string' ? scheduleTimes : JSON.stringify(scheduleTimes)) : undefined,
          autopilotEnabled: autopilotEnabled !== undefined ? autopilotEnabled : undefined,
        },
      });
      return NextResponse.json({ success: true, settings });
    }

    // Import leads
    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json({ success: false, error: 'No leads provided' }, { status: 400 });
    }

    let created = 0;
    let skipped: string[] = [];

    for (const lead of leads) {
      const url = lead.linkedinUrl || lead.url || '';
      if (!url.includes('linkedin.com/in/')) {
        skipped.push(url || 'invalid');
        continue;
      }

      const vanityId = extractVanityId(url);
      try {
        await (prisma as any).warmLead.create({
          data: {
            userId: payload.userId,
            linkedinUrl: url.split('?')[0].replace(/\/$/, ''),
            vanityId,
            firstName: lead.firstName || null,
            lastName: lead.lastName || null,
            company: lead.company || null,
            jobTitle: lead.jobTitle || null,
            headline: lead.headline || null,
            tags: lead.tags || null,
            notes: lead.notes || null,
            status: 'pending_fetch',
          },
        });
        created++;
      } catch (e: any) {
        if (e.code === 'P2002') skipped.push(url);
        else console.error('Create lead error:', e.message);
      }
    }

    return NextResponse.json({ success: true, created, skipped });
  } catch (error: any) {
    console.error('POST warm-leads error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT - Update lead or save posts
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload?.userId) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });

    const body = await request.json();
    const { action, leadId, vanityId, posts, leadData, engagementLog } = body;

    // Save posts fetched from extension
    if (action === 'save_posts' && (leadId || vanityId) && posts) {
      let lead;
      if (leadId) {
        lead = await (prisma as any).warmLead.findFirst({ where: { id: leadId, userId: payload.userId } });
      } else if (vanityId) {
        lead = await (prisma as any).warmLead.findFirst({ where: { vanityId, userId: payload.userId } });
      }

      if (!lead) return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });

      // Delete existing posts and insert new ones
      await (prisma as any).warmLeadPost.deleteMany({ where: { leadId: lead.id } });

      let insertedCount = 0;
      for (const post of posts) {
        try {
          await (prisma as any).warmLeadPost.create({
            data: {
              leadId: lead.id,
              userId: payload.userId,
              postUrn: post.urn || post.postUrn || null,
              postText: post.text || post.postText || '',
              postDate: post.date ? new Date(post.date) : (post.postDate ? new Date(post.postDate) : null),
              postUrl: post.url || post.postUrl || null,
              likes: post.likes || 0,
              comments: post.comments || 0,
              shares: post.shares || 0,
            },
          });
          insertedCount++;
        } catch (e: any) {
          console.error('Insert post error:', e.message);
        }
      }

      // Update lead status and profile data if provided
      const updateData: any = {
        postsFetched: true,
        postsFetchedAt: new Date(),
        status: 'fetched',
      };
      if (leadData) {
        if (leadData.firstName) updateData.firstName = leadData.firstName;
        if (leadData.lastName) updateData.lastName = leadData.lastName;
        if (leadData.headline) updateData.headline = leadData.headline;
        if (leadData.company) updateData.company = leadData.company;
        if (leadData.jobTitle) updateData.jobTitle = leadData.jobTitle;
        if (leadData.profileUrn) updateData.profileUrn = leadData.profileUrn;
      }

      await (prisma as any).warmLead.update({
        where: { id: lead.id },
        data: updateData,
      });

      return NextResponse.json({ success: true, postsInserted: insertedCount });
    }

    // Log engagement action
    if (action === 'log_engagement' && leadId && engagementLog) {
      const lead = await (prisma as any).warmLead.findFirst({ where: { id: leadId, userId: payload.userId } });
      if (!lead) return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });

      const log = await (prisma as any).warmLeadEngagement.create({
        data: {
          leadId: lead.id,
          postId: engagementLog.postId || null,
          userId: payload.userId,
          action: engagementLog.action,
          status: engagementLog.status || 'completed',
          postUrn: engagementLog.postUrn || null,
          commentText: engagementLog.commentText || null,
          errorMessage: engagementLog.errorMessage || null,
          completedAt: engagementLog.status === 'completed' ? new Date() : null,
        },
      });

      // Update lead touch count and status
      await (prisma as any).warmLead.update({
        where: { id: lead.id },
        data: {
          touchCount: { increment: 1 },
          lastEngagedAt: new Date(),
          status: lead.status === 'pending_fetch' || lead.status === 'fetched' ? 'engaged' : lead.status,
        },
      });

      // If post was liked/commented, update the post record
      if (engagementLog.postId && (engagementLog.action === 'like' || engagementLog.action === 'comment')) {
        const postUpdate: any = {};
        if (engagementLog.action === 'like') {
          postUpdate.isLiked = true;
          postUpdate.likedAt = new Date();
        }
        if (engagementLog.action === 'comment') {
          postUpdate.isCommented = true;
          postUpdate.commentedAt = new Date();
          postUpdate.commentText = engagementLog.commentText;
        }
        await (prisma as any).warmLeadPost.update({
          where: { id: engagementLog.postId },
          data: postUpdate,
        }).catch(() => {});
      }

      return NextResponse.json({ success: true, log });
    }

    // Update lead data
    if (leadId) {
      const lead = await (prisma as any).warmLead.findFirst({ where: { id: leadId, userId: payload.userId } });
      if (!lead) return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });

      const updateData: any = {};
      if (body.firstName !== undefined) updateData.firstName = body.firstName;
      if (body.lastName !== undefined) updateData.lastName = body.lastName;
      if (body.company !== undefined) updateData.company = body.company;
      if (body.jobTitle !== undefined) updateData.jobTitle = body.jobTitle;
      if (body.headline !== undefined) updateData.headline = body.headline;
      if (body.tags !== undefined) updateData.tags = body.tags;
      if (body.notes !== undefined) updateData.notes = body.notes;
      if (body.status !== undefined) updateData.status = body.status;
      if (body.profileUrn !== undefined) updateData.profileUrn = body.profileUrn;

      const updated = await (prisma as any).warmLead.update({
        where: { id: leadId },
        data: updateData,
      });

      return NextResponse.json({ success: true, lead: updated });
    }

    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  } catch (error: any) {
    console.error('PUT warm-leads error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE - Delete leads
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload?.userId) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const deleteAll = searchParams.get('deleteAll') === 'true';

    if (deleteAll) {
      await (prisma as any).warmLead.deleteMany({ where: { userId: payload.userId } });
      return NextResponse.json({ success: true, message: 'All leads deleted' });
    }

    if (!id) return NextResponse.json({ success: false, error: 'Lead ID required' }, { status: 400 });

    await (prisma as any).warmLead.delete({
      where: { id, userId: payload.userId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE warm-leads error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
