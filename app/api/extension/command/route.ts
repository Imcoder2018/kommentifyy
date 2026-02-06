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

// GET - Extension polls for pending commands
export async function GET(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const payload = verifyToken(token);

    // Get pending commands from last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const commands = await prisma.activity.findMany({
      where: {
        userId: payload.userId,
        type: { startsWith: 'extension_command_' },
        timestamp: { gte: oneDayAgo },
      },
      orderBy: { timestamp: 'desc' },
      take: 10,
    });

    // Filter to only pending ones
    const pendingCommands = commands
      .map((c: any) => {
        const meta = typeof c.metadata === 'string' ? JSON.parse(c.metadata) : c.metadata;
        return { id: c.id, ...meta };
      })
      .filter((c: any) => c.status === 'pending');

    return NextResponse.json({ success: true, commands: pendingCommands });
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
