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

    const { content, topic, template, tone, scheduledFor } = await request.json();

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
      },
    });

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

    const { id, content, topic, template, tone, status, scheduledFor } = await request.json();

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
      },
    });

    return NextResponse.json({ success: true, draft });
  } catch (error: any) {
    console.error('Update post draft error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE - Delete a post draft
export async function DELETE(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const payload = verifyToken(token);

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, error: 'Draft ID required' }, { status: 400 });
    }

    const existing = await (prisma as any).postDraft.findFirst({ where: { id, userId: payload.userId } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Draft not found' }, { status: 404 });
    }

    await (prisma as any).postDraft.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete post draft error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
