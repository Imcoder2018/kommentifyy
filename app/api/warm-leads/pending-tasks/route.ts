import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - Get pending tasks for user (used by extension on startup)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload?.userId) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const includeMissed = searchParams.get('includeMissed') === 'true';

    const now = new Date();
    const where: any = {
      userId: payload.userId,
      status: 'pending',
    };

    // Include tasks whose scheduled time has passed (missed while offline)
    if (includeMissed) {
      where.OR = [
        { scheduledFor: null },
        { scheduledFor: { lte: now } },
      ];
    }

    const tasks = await (prisma as any).pendingExtensionTask.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { scheduledFor: 'asc' }, { createdAt: 'asc' }],
      take: limit,
    });

    // Mark missed tasks
    const missedTasks = tasks.filter((t: any) => t.scheduledFor && new Date(t.scheduledFor) < now);
    if (missedTasks.length > 0) {
      await (prisma as any).pendingExtensionTask.updateMany({
        where: { id: { in: missedTasks.map((t: any) => t.id) } },
        data: { missedSchedule: true },
      });
    }

    return NextResponse.json({
      success: true,
      tasks,
      missedCount: missedTasks.length,
    });
  } catch (error: any) {
    console.error('GET pending-tasks error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST - Create new pending tasks (bulk)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload?.userId) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });

    const body = await request.json();
    const { tasks } = body;

    if (!tasks || !Array.isArray(tasks)) {
      return NextResponse.json({ success: false, error: 'Tasks array required' }, { status: 400 });
    }

    let created = 0;
    for (const task of tasks) {
      try {
        await (prisma as any).pendingExtensionTask.create({
          data: {
            userId: payload.userId,
            taskType: task.taskType,
            taskData: typeof task.taskData === 'string' ? task.taskData : JSON.stringify(task.taskData),
            priority: task.priority || 0,
            scheduledFor: task.scheduledFor ? new Date(task.scheduledFor) : null,
            maxAttempts: task.maxAttempts || 3,
          },
        });
        created++;
      } catch (e: any) {
        console.error('Create task error:', e.message);
      }
    }

    return NextResponse.json({ success: true, created });
  } catch (error: any) {
    console.error('POST pending-tasks error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT - Update task status (mark as in_progress, completed, failed)
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload?.userId) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });

    const body = await request.json();
    const { taskId, status, result, errorMessage } = body;

    if (!taskId) return NextResponse.json({ success: false, error: 'Task ID required' }, { status: 400 });

    const task = await (prisma as any).pendingExtensionTask.findFirst({
      where: { id: taskId, userId: payload.userId },
    });

    if (!task) return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });

    const updateData: any = { status };

    if (status === 'in_progress') {
      updateData.startedAt = new Date();
      updateData.attempts = task.attempts + 1;
    } else if (status === 'completed') {
      updateData.completedAt = new Date();
      updateData.result = result ? (typeof result === 'string' ? result : JSON.stringify(result)) : null;
    } else if (status === 'failed') {
      updateData.errorMessage = errorMessage || null;
      // Check if should retry
      if (task.attempts < task.maxAttempts) {
        updateData.status = 'pending'; // Reset to pending for retry
      }
    }

    const updated = await (prisma as any).pendingExtensionTask.update({
      where: { id: taskId },
      data: updateData,
    });

    return NextResponse.json({ success: true, task: updated });
  } catch (error: any) {
    console.error('PUT pending-tasks error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE - Delete completed/failed tasks or specific task
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload?.userId) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const clearCompleted = searchParams.get('clearCompleted') === 'true';

    if (clearCompleted) {
      await (prisma as any).pendingExtensionTask.deleteMany({
        where: { userId: payload.userId, status: { in: ['completed', 'failed'] } },
      });
      return NextResponse.json({ success: true, message: 'Completed/failed tasks cleared' });
    }

    if (id) {
      await (prisma as any).pendingExtensionTask.delete({
        where: { id, userId: payload.userId },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Task ID or clearCompleted required' }, { status: 400 });
  } catch (error: any) {
    console.error('DELETE pending-tasks error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
