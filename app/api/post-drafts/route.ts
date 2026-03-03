import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - List user's post drafts
export async function GET(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const payload = verifyToken(token);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';

    const where: any = { userId: payload.userId };
    if (status) where.status = status;

    const drafts = await (prisma as any).postDraft.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, drafts });
  } catch (error: any) {
    console.error('Get post drafts error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST - Create a new post draft
export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const payload = verifyToken(token);

    const { content, topic, template, tone, scheduledFor, mediaUrl, mediaType } = await request.json();

    if (!content) {
      return NextResponse.json({ success: false, error: 'Content is required' }, { status: 400 });
    }

    const draft = await (prisma as any).postDraft.create({
      data: {
        userId: payload.userId,
        content,
        topic: topic || null,
        template: template || null,
        tone: tone || null,
        status: scheduledFor ? 'scheduled' : 'draft',
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || null,
      },
    });

    // If this is a scheduled post, just set the status - cron will create the task
    if (scheduledFor) {
      const scheduledTime = new Date(scheduledFor);
      const now = new Date();
      
      // Only set status to scheduled if time is in the future
      if (scheduledTime > now) {
        // Don't create command here - cron will handle it when time arrives
        console.log(`📅 Post scheduled for ${scheduledTime.toISOString()}, cron will create task when time arrives`);
      } else {
        // If scheduled time is in the past, create command immediately using Activity model
        const commandPayload = {
          command: 'post_scheduled_content',
          content: content,
          topic: topic || '',
          template: template || '',
          tone: tone || '',
          scheduledFor: scheduledTime.toISOString(),
          draftId: draft.id,
          mediaUrl: mediaUrl || null,
          mediaType: mediaType || null,
        };

        const activity = await prisma.activity.create({
          data: {
            userId: payload.userId,
            type: 'extension_command_post_scheduled_content',
            metadata: {
              ...commandPayload,
              status: 'pending',
              createdAt: new Date().toISOString(),
            },
            timestamp: new Date(),
          }
        });

        // Update draft with task ID
        await (prisma as any).postDraft.update({
          where: { id: draft.id },
          data: { 
            taskId: activity.id,
            taskSentAt: new Date(),
            taskStatus: 'pending'
          }
        });
      }
    }

    return NextResponse.json({ success: true, draft });
  } catch (error: any) {
    console.error('Create post draft error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT - Update a post draft
export async function PUT(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const payload = verifyToken(token);

    const { id, content, topic, template, tone, status, scheduledFor, taskSentAt } = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, error: 'Draft ID required' }, { status: 400 });
    }

    // Verify ownership
    const existing = await (prisma as any).postDraft.findFirst({ where: { id, userId: payload.userId } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Draft not found' }, { status: 404 });
    }

    const draft = await (prisma as any).postDraft.update({
      where: { id },
      data: {
        ...(content !== undefined && { content }),
        ...(topic !== undefined && { topic }),
        ...(template !== undefined && { template }),
        ...(tone !== undefined && { tone }),
        ...(status !== undefined && { status }),
        ...(scheduledFor !== undefined && { scheduledFor: scheduledFor ? new Date(scheduledFor) : null }),
        ...(taskSentAt !== undefined && { taskSentAt: taskSentAt ? new Date(taskSentAt) : null }),
      },
    });

    return NextResponse.json({ success: true, draft });
  } catch (error: any) {
    console.error('Update post draft error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE - Delete a post draft or multiple drafts
export async function DELETE(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const payload = verifyToken(token);

    const body = await request.json();
    const { id, ids } = body;
    
    // Support both single ID and batch deletion
    const idsToDelete = ids || (id ? [id] : []);
    
    if (idsToDelete.length === 0) {
      return NextResponse.json({ success: false, error: 'Draft ID(s) required' }, { status: 400 });
    }

    // Verify ownership of all drafts before deletion
    const existing = await (prisma as any).postDraft.findMany({ 
      where: { id: { in: idsToDelete }, userId: payload.userId },
      select: { id: true }
    });
    
    if (existing.length !== idsToDelete.length) {
      return NextResponse.json({ success: false, error: 'Some drafts not found or not owned by user' }, { status: 404 });
    }

    // Batch delete
    await (prisma as any).postDraft.deleteMany({ where: { id: { in: idsToDelete } } });
    return NextResponse.json({ success: true, deleted: idsToDelete.length });
  } catch (error: any) {
    console.error('Delete post draft error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
