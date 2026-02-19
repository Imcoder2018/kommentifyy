import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// POST - Queue a command for the extension (e.g., post to LinkedIn)
export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const payload = verifyToken(token);

    const { command, data } = await request.json();

    if (!command) {
      return NextResponse.json({ success: false, error: 'Command is required' }, { status: 400 });
    }

    // Store the command for the extension to pick up
    // We use Activity model as a lightweight command queue
    const activity = await prisma.activity.create({
      data: {
        userId: payload.userId,
        type: `extension_command_${command}`,
        metadata: JSON.stringify({
          command,
          data,
          status: 'pending',
          createdAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({ success: true, commandId: activity.id, command });
  } catch (error: any) {
    console.error('Extension command error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// GET - Extension polls for pending commands (queue: one at a time)
export async function GET(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const payload = verifyToken(token);

    // Get recent commands from last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const commands = await prisma.activity.findMany({
      where: {
        userId: payload.userId,
        type: { startsWith: 'extension_command_' },
        timestamp: { gte: oneDayAgo },
      },
      orderBy: { timestamp: 'asc' }, // oldest first (FIFO queue)
      take: 50,
    });

    const parsed = commands.map((c: any) => {
      const meta = typeof c.metadata === 'string' ? JSON.parse(c.metadata) : c.metadata;
      return { id: c.id, ...meta, createdAt: c.timestamp };
    });

    // Check if any command is currently in_progress
    const inProgressCommand = parsed.find((c: any) => c.status === 'in_progress');

    // Auto-expire stuck in_progress commands (older than 30 minutes)
    if (inProgressCommand) {
      const cmdAge = Date.now() - new Date(inProgressCommand.createdAt).getTime();
      if (cmdAge > 30 * 60 * 1000) {
        // Mark as failed (stuck)
        try {
          const activity = await prisma.activity.findFirst({ where: { id: inProgressCommand.id } });
          if (activity) {
            const meta = typeof activity.metadata === 'string' ? JSON.parse(activity.metadata as string) : activity.metadata;
            meta.status = 'failed';
            meta.error = 'Timed out (stuck for 30+ minutes)';
            meta.completedAt = new Date().toISOString();
            await prisma.activity.update({ where: { id: inProgressCommand.id }, data: { metadata: JSON.stringify(meta) } });
          }
        } catch (e) {}
        // Fall through to send next pending command
      } else {
        // A task is currently running — don't send any more
        return NextResponse.json({ success: true, commands: [], queueStatus: 'busy', currentTask: inProgressCommand.command });
      }
    }

    // No task in progress — send only the NEXT pending command (FIFO)
    const pendingCommands = parsed.filter((c: any) => c.status === 'pending');
    const nextCommand = pendingCommands.length > 0 ? [pendingCommands[0]] : [];

    return NextResponse.json({
      success: true,
      commands: nextCommand,
      queueStatus: nextCommand.length > 0 ? 'dispatching' : 'idle',
      pendingCount: pendingCommands.length,
    });
  } catch (error: any) {
    console.error('Get extension commands error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT - Mark a command as completed
export async function PUT(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const payload = verifyToken(token);

    const { commandId, status } = await request.json();

    if (!commandId) {
      return NextResponse.json({ success: false, error: 'Command ID required' }, { status: 400 });
    }

    const activity = await prisma.activity.findFirst({
      where: { id: commandId, userId: payload.userId },
    });

    if (!activity) {
      return NextResponse.json({ success: false, error: 'Command not found' }, { status: 404 });
    }

    const meta = typeof activity.metadata === 'string' ? JSON.parse(activity.metadata as string) : activity.metadata;
    meta.status = status || 'completed';
    meta.completedAt = new Date().toISOString();

    await prisma.activity.update({
      where: { id: commandId },
      data: { metadata: JSON.stringify(meta) },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update extension command error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
