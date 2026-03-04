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

    // Include posts scheduled via LinkedIn API (these are already scheduled on LinkedIn)
    // But exclude ones that have passed their scheduled time (those are auto-cleaned by cron)
    if (status) {
      where.taskStatus = status;
    }

    // Get regular scheduled posts (extension-based)
    const scheduledPosts = await (prisma as any).postDraft.findMany({
      where: {
        ...where,
        NOT: { postMethod: 'linkedin_api_scheduled' }
      },
      orderBy: { scheduledFor: 'asc' },
    });

    // Get LinkedIn API scheduled posts that haven't passed their scheduled time yet
    const linkedInScheduledPosts = await (prisma as any).postDraft.findMany({
      where: {
        userId: payload.userId,
        status: 'scheduled',
        postMethod: 'linkedin_api_scheduled',
        scheduledFor: { gt: new Date() } // Only future scheduled posts
      },
      orderBy: { scheduledFor: 'asc' },
    });

    // Merge both lists
    const allPosts = [...scheduledPosts, ...linkedInScheduledPosts];

    // Get task status counts (for extension-scheduled posts)
    const taskCounts = await (prisma as any).postDraft.groupBy({
      by: ['taskStatus'],
      where: {
        userId: payload.userId,
        status: 'scheduled',
        NOT: { postMethod: 'linkedin_api_scheduled' }
      },
      _count: { id: true }
    });

    // Get count of LinkedIn API scheduled posts (pending)
    const linkedInCount = await (prisma as any).postDraft.count({
      where: {
        userId: payload.userId,
        status: 'scheduled',
        postMethod: 'linkedin_api_scheduled',
        scheduledFor: { gt: new Date() }
      }
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

    // Add LinkedIn scheduled posts to pending count
    counts.pending += linkedInCount;

    // Also include posts that have been triggered (have taskId but not completed) - exclude LinkedIn API scheduled
    const triggeredPosts = await (prisma as any).postDraft.findMany({
      where: {
        userId: payload.userId,
        status: 'scheduled',
        taskId: { not: null },
        NOT: { postMethod: 'linkedin_api_scheduled' }
      },
      orderBy: { scheduledFor: 'asc' },
    });

    // Merge triggered posts with scheduled posts (which already includes LinkedIn scheduled)
    const mergedPosts = [...allPosts, ...triggeredPosts.filter((p: any) => !allPosts.find((sp: any) => sp.id === p.id))];

    return NextResponse.json({
      success: true,
      scheduledPosts: mergedPosts,
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
