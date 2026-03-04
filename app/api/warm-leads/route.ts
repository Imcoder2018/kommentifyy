import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

function extractVanityId(url: string): string | null {
  const m = url.match(/linkedin\.com\/in\/([^/?#]+)/i);
  return m ? m[1].replace(/\/$/, '') : null;
}

function cleanLinkedInUrl(url: string): string {
  // Extract just the base profile URL, removing query params, hash, and trailing slash
  const match = url.match(/(https:\/\/(?:www\.)?linkedin\.com\/in\/[^/?#\s]+)/i);
  if (match) return match[1].replace(/\/$/, '');
  return url.split('?')[0].split('#')[0].replace(/\/$/, '');
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
    const action = searchParams.get('action');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Overview action - return execution history, autopilot sessions, upcoming tasks
    if (action === 'overview') {
      const now = new Date();

      // Get user settings for sequence and autopilot time
      const settings = await (prisma as any).warmLeadsSettings.findUnique({
        where: { userId: payload.userId },
      });

      // Parse sequence steps
      let sequenceSteps: any[] = [];
      try { sequenceSteps = JSON.parse(settings?.sequenceSteps || '[]'); } catch {}
      const enabledSteps = sequenceSteps.filter((s: any) => s.enabled);

      // Get autopilot time (default 09:00)
      const autopilotTime = settings?.autopilotTime || '09:00';
      const [autopilotHour, autopilotMinute] = autopilotTime.split(':').map(Number);

      // Get engagement logs as execution history
      const engagementLogs = await (prisma as any).warmLeadEngagement.findMany({
        where: { userId: payload.userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { lead: { select: { firstName: true, lastName: true } } },
      });

      // Build execution history from engagement logs
      const executionHistory: any[] = [];
      const logsByDate: Record<string, any> = {};
      for (const log of engagementLogs) {
        const dateKey = new Date(log.createdAt).toISOString().split('T')[0];
        if (!logsByDate[dateKey]) {
          logsByDate[dateKey] = {
            id: log.id,
            date: log.createdAt,
            type: log.action === 'bulk' ? 'scheduled' : 'instant',
            leadsProcessed: 0,
            likesGiven: 0,
            commentsGiven: 0,
            status: log.status === 'completed' ? 'completed' : log.status === 'failed' ? 'failed' : 'running',
          };
        }
        logsByDate[dateKey].leadsProcessed++;
        if (log.action === 'like') logsByDate[dateKey].likesGiven++;
        if (log.action === 'comment') logsByDate[dateKey].commentsGiven++;
      }
      Object.values(logsByDate).forEach((e: any) => executionHistory.push(e));

      // Get autopilot sessions from leads with engagementType 'scheduled'
      // Include posts for target post info
      const scheduledLeads = await (prisma as any).warmLead.findMany({
        where: { userId: payload.userId, engagementType: 'scheduled' },
        include: {
          posts: {
            orderBy: { postDate: 'desc' },
            take: 3,
            select: { id: true, postText: true, postDate: true, commentText: true }
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Count comments generated per session
      const commentsBySession: Record<string, number> = {};
      for (const lead of scheduledLeads) {
        const sessionKey = new Date(lead.createdAt).toISOString().slice(0, 13);
        const commentCount = (lead.posts || []).filter((p: any) => p.commentText).length;
        commentsBySession[sessionKey] = (commentsBySession[sessionKey] || 0) + commentCount;
      }

      // Group leads by session (roughly by same createdAt hour)
      const sessionsMap: Record<string, any> = {};
      for (const lead of scheduledLeads) {
        const sessionKey = new Date(lead.createdAt).toISOString().slice(0, 13); // Group by hour
        if (!sessionsMap[sessionKey]) {
          sessionsMap[sessionKey] = {
            id: sessionKey,
            createdAt: lead.createdAt,
            leadIds: [],
            leadCount: 0,
            commentsGenerated: 0,
            status: lead.status === 'engaged' ? 'completed' : 'scheduled',
            tasks: [],
          };
        }
        if (!sessionsMap[sessionKey].leadIds.includes(lead.id)) {
          sessionsMap[sessionKey].leadIds.push(lead.id);
          sessionsMap[sessionKey].leadCount++;
        }
      }

      // Add comment counts
      Object.keys(sessionsMap).forEach(key => {
        sessionsMap[key].commentsGenerated = commentsBySession[key] || 0;
      });

      // Get upcoming tasks (leads with nextActionDate in future)
      const upcomingLeads = await (prisma as any).warmLead.findMany({
        where: {
          userId: payload.userId,
          engagementType: 'scheduled',
          nextActionDate: { gte: now },
        },
        include: {
          posts: {
            orderBy: { postDate: 'desc' },
            take: 1,
            select: { id: true, postText: true, postDate: true }
          }
        },
        orderBy: { nextActionDate: 'asc' },
        take: 20,
      });

      const upcomingTasks = upcomingLeads.map((lead: any) => ({
        id: lead.id,
        day: (lead.currentSequenceStep || 0) + 1,
        action: 'engagement',
        scheduledFor: lead.nextActionDate,
        status: 'pending',
        leadName: [lead.firstName, lead.lastName].filter(Boolean).join(' ') || 'Unknown',
        targetPost: lead.posts?.[0]?.postText ? lead.posts[0].postText.substring(0, 80) + '...' : null,
      }));

      // Build autopilot sessions with tasks based on sequence steps
      const autopilotSessions = Object.values(sessionsMap).map((session: any) => {
        const sessionDate = new Date(session.createdAt);

        // Build tasks from sequence steps for each lead in the session
        const tasks: any[] = [];

        // For each lead in session, create tasks based on sequence steps
        for (let leadIdx = 0; leadIdx < Math.min(session.leadIds.length, 5); leadIdx++) {
          // Get lead info
          const leadInfo = scheduledLeads.find((l: any) => l.id === session.leadIds[leadIdx]);
          const leadName = leadInfo ? [leadInfo.firstName, leadInfo.lastName].filter(Boolean).join(' ') : `Lead ${leadIdx + 1}`;

          // Each sequence step creates a task
          for (let stepIdx = 0; stepIdx < enabledSteps.length; stepIdx++) {
            const step = enabledSteps[stepIdx];
            const stepDay = step.day || (stepIdx + 1);

            // Calculate scheduled time based on autopilot time setting
            const scheduledDate = new Date(sessionDate);
            scheduledDate.setDate(scheduledDate.getDate() + stepDay - 1);
            scheduledDate.setHours(autopilotHour, autopilotMinute, 0, 0);

            // Get actions from step
            const actions: string[] = [];
            if (step.actions?.like) actions.push('like');
            if (step.actions?.comment) actions.push('comment');
            if (step.actions?.connect) actions.push('connect');

            // Get target post info
            const targetPost = leadInfo?.posts?.[stepIdx];

            // Get AI comment if available
            const aiComment = targetPost?.commentText;
            const aiCommentPreview = aiComment ? (aiComment.length > 40 ? aiComment.substring(0, 40) + '...' : aiComment) : null;

            tasks.push({
              id: `${session.id}-lead${leadIdx}-step${stepIdx}`,
              day: stepDay,
              leadIndex: leadIdx + 1,
              leadName: leadName,
              action: actions.join('/') || 'engagement',
              scheduledFor: scheduledDate.toISOString(),
              status: scheduledDate < now ? 'due' : 'pending',
              // Full text for hover
              targetPostFull: targetPost?.postText || null,
              targetPostPreview: targetPost?.postText ? (targetPost.postText.length > 50 ? targetPost.postText.substring(0, 50) + '...' : targetPost.postText) : null,
              // AI comment
              aiCommentFull: aiComment,
              aiCommentPreview: aiCommentPreview,
              postDate: targetPost?.postDate,
            });
          }
        }

        // Sort tasks by day
        tasks.sort((a, b) => a.day - b.day);

        session.tasks = tasks;
        return session;
      });

      return NextResponse.json({
        success: true,
        executionHistory,
        autopilotSessions,
        upcomingTasks,
      });
    }

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

    // Bulk update engagementType for multiple leads
    if (action === 'bulk_update_type') {
      const { leadIds, engagementType } = body;
      if (!leadIds || !Array.isArray(leadIds) || !engagementType) {
        return NextResponse.json({ success: false, error: 'leadIds and engagementType required' }, { status: 400 });
      }
      await (prisma as any).warmLead.updateMany({
        where: { id: { in: leadIds }, userId: payload.userId },
        data: { engagementType },
      });
      return NextResponse.json({ success: true, updated: leadIds.length });
    }

    // Save/update settings
    if (action === 'save_settings') {
      const { campaignName, businessContext, campaignGoal, sequenceSteps, profilesPerDay, postsPerLead, bulkTaskLimit, scheduleEnabled, scheduleTimes, autopilotEnabled, bulkTaskDelay } = body;
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
          bulkTaskDelay: bulkTaskDelay || 5,
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
          bulkTaskDelay: bulkTaskDelay !== undefined ? bulkTaskDelay : undefined,
        },
      });
      return NextResponse.json({ success: true, settings });
    }

    // Generate AI comments for lead posts (when setting on autopilot)
    if (action === 'generate_ai_comments') {
      const { leadIds, businessContext, postsPerLead = 3 } = body;
      if (!leadIds || !Array.isArray(leadIds)) {
        return NextResponse.json({ success: false, error: 'leadIds array required' }, { status: 400 });
      }

      // Get settings for business context
      const settings = await (prisma as any).warmLeadsSettings.findUnique({
        where: { userId: payload.userId },
      });
      const context = businessContext || settings?.businessContext || '';

      // Get leads with their posts
      const leads = await (prisma as any).warmLead.findMany({
        where: { id: { in: leadIds }, userId: payload.userId },
        include: { posts: { orderBy: { postDate: 'desc' }, take: postsPerLead } },
      });

      const results = [];
      // For each lead and their posts, generate AI comments
      for (const lead of leads) {
        const posts = lead.posts || [];
        for (const post of posts) {
          if (!post.postText || post.commentText) continue; // Skip if no text or already has comment

          try {
            // Call AI generate comment API
            const aiRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/ai/generate-comment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
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
            const aiData = await aiRes.json();

            if (aiData.success && aiData.content) {
              // Store the generated comment in the post
              await (prisma as any).warmLeadPost.update({
                where: { id: post.id },
                data: { commentText: aiData.content },
              });
              results.push({ postId: post.id, leadId: lead.id, success: true, comment: aiData.content });
            }
          } catch (aiErr) {
            console.error('AI comment generation error:', aiErr);
            results.push({ postId: post.id, leadId: lead.id, success: false, error: 'AI generation failed' });
          }
        }
      }

      return NextResponse.json({
        success: true,
        generated: results.filter((r: any) => r.success).length,
        total: results.length,
        results,
      });
    }

    // Setup autopilot: generate AI comments and schedule leads
    if (action === 'setup_autopilot') {
      const { leadIds, businessContext, postsPerLead = 3 } = body;
      if (!leadIds || !Array.isArray(leadIds)) {
        return NextResponse.json({ success: false, error: 'leadIds array required' }, { status: 400 });
      }

      // Get settings for business context and sequence
      const settings = await (prisma as any).warmLeadsSettings.findUnique({
        where: { userId: payload.userId },
      });
      const context = businessContext || settings?.businessContext || '';

      // Get leads - filter those that need posts fetched
      const leads = await (prisma as any).warmLead.findMany({
        where: { id: { in: leadIds }, userId: payload.userId },
        include: { posts: { orderBy: { postDate: 'desc' }, take: postsPerLead } },
      });

      // Identify leads that need posts fetched
      const leadsNeedingPosts = leads.filter((l: any) => !l.postsFetched || !l.posts || l.posts.length === 0);
      const leadsWithPosts = leads.filter((l: any) => l.postsFetched && l.posts && l.posts.length > 0);

      // Queue post fetching command for extension if there are leads needing posts
      let postsFetchQueued = false;
      if (leadsNeedingPosts.length > 0) {
        const fetchData = leadsNeedingPosts.map((l: any) => ({
          leadId: l.id,
          vanityId: l.vanityId || l.linkedinUrl.match(/linkedin\.com\/in\/([^/?#]+)/i)?.[1],
        })).filter((b: any) => b.vanityId);

        if (fetchData.length > 0) {
          // Create fetch_lead_posts_bulk command for extension
          await prisma.activity.create({
            data: {
              userId: payload.userId,
              type: 'extension_command_fetch_lead_posts_bulk',
              metadata: {
                command: 'fetch_lead_posts_bulk',
                data: { leads: fetchData },
                status: 'pending',
                createdAt: new Date().toISOString(),
              },
            },
          });
          postsFetchQueued = true;
        }
      }

      // If no leads have posts yet, return early with fetch queued
      // The frontend will poll and trigger AI generation after posts are fetched
      if (leadsWithPosts.length === 0) {
        // Update leads to scheduled type but mark as pending posts
        await (prisma as any).warmLead.updateMany({
          where: { id: { in: leadIds }, userId: payload.userId },
          data: {
            engagementType: 'scheduled',
            status: 'fetched',
            nextActionDate: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
            currentSequenceStep: 0,
          },
        });

        return NextResponse.json({
          success: true,
          postsFetchQueued: true,
          leadsNeedingPosts: leadsNeedingPosts.length,
          commentsGenerated: 0,
          leadsScheduled: leadIds.length,
          message: 'Posts fetch queued. AI comments will be generated after posts are fetched.',
        });
      }

      let commentsGenerated = 0;

      // Generate AI comments for each lead's posts
      for (const lead of leadsWithPosts) {
        const posts = lead.posts || [];
        for (const post of posts) {
          if (!post.postText || post.commentText) continue; // Skip if no text or already has comment

          try {
            // Call AI generate comment API
            const aiRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/ai/generate-comment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
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
            const aiData = await aiRes.json();

            if (aiData.success && aiData.content) {
              // Store the generated comment in the post
              await (prisma as any).warmLeadPost.update({
                where: { id: post.id },
                data: { commentText: aiData.content },
              });
              commentsGenerated++;
            }
          } catch (aiErr) {
            console.error('AI comment generation error:', aiErr);
          }
        }
      }

      // Update leads to scheduled type and set next action date
      const now = new Date();
      await (prisma as any).warmLead.updateMany({
        where: { id: { in: leadIds }, userId: payload.userId },
        data: {
          engagementType: 'scheduled',
          status: 'engaged',
          nextActionDate: now,
          currentSequenceStep: 0,
        },
      });

      return NextResponse.json({
        success: true,
        commentsGenerated,
        leadsScheduled: leadIds.length,
        postsFetchQueued,
      });
    }

    // Generate AI comments for scheduled leads (after posts are fetched)
    if (action === 'generate_for_scheduled') {
      const { postsPerLead = 3 } = body;

      // Get all scheduled leads that have posts but no AI comments
      const scheduledLeads = await (prisma as any).warmLead.findMany({
        where: {
          userId: payload.userId,
          engagementType: 'scheduled',
          postsFetched: true,
        },
        include: {
          posts: {
            where: {
              postText: { not: '' },
              commentText: null,
            },
            orderBy: { postDate: 'desc' },
            take: postsPerLead,
          },
        },
      });

      const settings = await (prisma as any).warmLeadsSettings.findUnique({
        where: { userId: payload.userId },
      });
      const context = settings?.businessContext || '';

      let totalCommentsGenerated = 0;

      // Generate AI comments for each lead's posts
      for (const lead of scheduledLeads) {
        const posts = lead.posts || [];
        for (const post of posts) {
          if (!post.postText || post.commentText) continue;

          try {
            const aiRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/ai/generate-comment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
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
            const aiData = await aiRes.json();

            if (aiData.success && aiData.content) {
              await (prisma as any).warmLeadPost.update({
                where: { id: post.id },
                data: { commentText: aiData.content },
              });
              totalCommentsGenerated++;
            }
          } catch (aiErr) {
            console.error('AI comment generation error:', aiErr);
          }
        }
      }

      return NextResponse.json({
        success: true,
        commentsGenerated: totalCommentsGenerated,
        leadsProcessed: scheduledLeads.length,
      });
    }

    // Get autopilot processing status
    if (action === 'autopilot_status') {
      const scheduledLeads = await (prisma as any).warmLead.findMany({
        where: {
          userId: payload.userId,
          engagementType: 'scheduled',
        },
        select: {
          id: true,
          postsFetched: true,
          status: true,
        },
      });

      const leadsNeedingPosts = scheduledLeads.filter((l: any) => !l.postsFetched);
      const leadsWithPosts = scheduledLeads.filter((l: any) => l.postsFetched);

      // Check for pending post fetch commands (recent ones)
      const pendingFetchCommands = await prisma.activity.count({
        where: {
          userId: payload.userId,
          type: 'extension_command_fetch_lead_posts_bulk',
          timestamp: { gte: new Date(Date.now() - 30 * 60 * 1000) }, // Last 30 min
        },
      });

      // Get posts with AI comments
      const postsWithComments = await (prisma as any).warmLeadPost.count({
        where: {
          userId: payload.userId,
          commentText: { not: null },
        },
      });

      // Get posts without AI comments
      const postsWithoutComments = await (prisma as any).warmLeadPost.count({
        where: {
          userId: payload.userId,
          commentText: null,
          postText: { not: '' },
        },
      });

      return NextResponse.json({
        success: true,
        totalScheduledLeads: scheduledLeads.length,
        leadsNeedingPosts: leadsNeedingPosts.length,
        leadsWithPosts: leadsWithPosts.length,
        pendingFetchCommands,
        postsWithComments,
        postsWithoutComments,
        isProcessing: pendingFetchCommands > 0 || postsWithoutComments > 0,
      });
    }

    // Cancel/stop autopilot processing for leads
    if (action === 'autopilot_cancel') {
      const { leadIds } = body;

      // Delete pending fetch commands
      if (leadIds && Array.isArray(leadIds)) {
        // Get lead vanityIds
        const leads = await (prisma as any).warmLead.findMany({
          where: { id: { in: leadIds }, userId: payload.userId },
          select: { vanityId: true },
        });
        const vanityIds = leads.map((l: any) => l.vanityId).filter(Boolean);

        // Delete recent pending commands for these leads (simple approach)
        await prisma.activity.deleteMany({
          where: {
            userId: payload.userId,
            type: 'extension_command_fetch_lead_posts_bulk',
            timestamp: { gte: new Date(Date.now() - 30 * 60 * 1000) }, // Last 30 min
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Autopilot processing stopped',
      });
    }

    // Import leads
    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json({ success: false, error: 'No leads provided' }, { status: 400 });
    }

    let created = 0;
    let skipped: string[] = [];

    // Deduplicate URLs within this batch
    const seenUrls = new Set<string>();

    for (const lead of leads) {
      const rawUrl = lead.linkedinUrl || lead.url || '';
      if (!rawUrl.includes('linkedin.com/in/')) {
        skipped.push(rawUrl || 'invalid');
        continue;
      }

      // Clean the URL properly
      const cleanUrl = cleanLinkedInUrl(rawUrl);
      if (!cleanUrl) {
        skipped.push(rawUrl + ' (failed to clean)');
        continue;
      }

      // Skip duplicates within the same batch
      if (seenUrls.has(cleanUrl)) {
        skipped.push(cleanUrl + ' (duplicate in batch)');
        continue;
      }
      seenUrls.add(cleanUrl);

      const vanityId = extractVanityId(cleanUrl);
      try {
        await (prisma as any).warmLead.create({
          data: {
            userId: payload.userId,
            linkedinUrl: cleanUrl,
            vanityId,
            firstName: lead.firstName || null,
            lastName: lead.lastName || null,
            company: lead.company || null,
            jobTitle: lead.jobTitle || null,
            headline: lead.headline || null,
            tags: lead.tags || null,
            notes: lead.notes || null,
            status: 'pending_fetch',
            engagementType: 'unassigned',
          },
        });
        created++;
      } catch (e: any) {
        if (e.code === 'P2002') {
          skipped.push(cleanUrl + ' (already exists)');
        } else {
          console.error('Create lead error:', e.message);
          skipped.push(cleanUrl + ' (error: ' + e.message + ')');
        }
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
