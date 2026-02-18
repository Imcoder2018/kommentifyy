import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - Get scheduled posts with task status
export async function GET(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const payload = verifyToken(token);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';

    const where: any = { 
      userId: payload.userId,
      status: 'scheduled'
    };
    
    if (status) where.taskStatus = status;

    const scheduledPosts = await (prisma as any).postDraft.findMany({
      where,
      orderBy: { scheduledFor: 'asc' },
    });

    // Get task status counts
    const taskCounts = await (prisma as any).postDraft.groupBy({
      by: ['taskStatus'],
      where: { 
        userId: payload.userId,
        status: 'scheduled'
      },
      _count: { id: true }
    });

    const counts = {
      pending: 0,
      in_progress: 0,
      completed: 0,
      failed: 0
    };

    taskCounts.forEach((group: any) => {
      counts[group.taskStatus as keyof typeof counts] = group._count.id;
    });

    // Also include posts that have been triggered (have taskId but not completed)
    const triggeredPosts = await (prisma as any).postDraft.findMany({
      where: {
        userId: payload.userId,
        status: 'scheduled',
        taskId: { not: null }
      },
      orderBy: { scheduledFor: 'asc' },
    });

    // Merge triggered posts with scheduled posts
    const allPosts = [...scheduledPosts, ...triggeredPosts.filter((p: any) => !scheduledPosts.find((sp: any) => sp.id === p.id))];

    return NextResponse.json({ 
      success: true, 
      scheduledPosts: allPosts, 
      taskCounts: counts 
    });
  } catch (error: any) {
    console.error('Get scheduled posts error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST - Update task status (called by extension)
export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const payload = verifyToken(token);

    const { taskId, status, failureReason } = await request.json();

    if (!taskId || !status) {
      return NextResponse.json({ success: false, error: 'Task ID and status required' }, { status: 400 });
    }

    const updateData: any = {
      taskStatus: status,
      updatedAt: new Date()
    };

    if (status === 'completed') {
      updateData.taskCompletedAt = new Date();
      updateData.postedAt = new Date();
      updateData.status = 'posted';
    } else if (status === 'failed') {
      updateData.taskFailedAt = new Date();
      updateData.taskFailureReason = failureReason || 'Unknown error';
    }

    const updated = await (prisma as any).postDraft.updateMany({
      where: { 
        userId: payload.userId,
        taskId: taskId
      },
      data: updateData
    });

    return NextResponse.json({ success: true, updated });
  } catch (error: any) {
    console.error('Update task status error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
