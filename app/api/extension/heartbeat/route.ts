import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// POST - Extension pings this to signal it is active and connected
export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false }, { status: 401 });

    const payload = verifyToken(token);

    await prisma.activity.create({
      data: {
        userId: payload.userId,
        type: 'extension_heartbeat',
        timestamp: new Date(),
        metadata: { version: 'active' },
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// GET - Website polls this to check if the extension is currently connected
export async function GET(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ connected: false });

    const payload = verifyToken(token);

    // Check 1: Recent heartbeat
    const latestHeartbeat = await prisma.activity.findFirst({
      where: { userId: payload.userId, type: 'extension_heartbeat' },
      orderBy: { timestamp: 'desc' },
    });

    // Check 2: Recent successful command completion (using Activity model)
    const latestCommand = await prisma.activity.findFirst({
      where: { 
        userId: payload.userId,
        type: { startsWith: 'extension_command_' },
        timestamp: { gte: new Date(Date.now() - 10 * 60 * 1000) } // Within last 10 minutes
      },
      orderBy: { timestamp: 'desc' },
    });

    // Parse command metadata to check if completed
    let commandCompleted = false;
    if (latestCommand) {
      const meta = typeof latestCommand.metadata === 'string' ? JSON.parse(latestCommand.metadata) : latestCommand.metadata;
      commandCompleted = meta.status === 'completed';
    }

    // Check 3: Recent scheduled post activity
    const latestScheduledPost = await (prisma as any).postDraft.findFirst({
      where: { 
        userId: payload.userId,
        taskStatus: 'completed',
        taskCompletedAt: { gte: new Date(Date.now() - 10 * 60 * 1000) } // Within last 10 minutes
      },
      orderBy: { taskCompletedAt: 'desc' },
    });

    let connected = false;
    let lastSeen: Date | null = null;
    let connectionType = '';

    if (latestHeartbeat) {
      const diffMs = Date.now() - new Date(latestHeartbeat.timestamp).getTime();
      if (diffMs < 5 * 60 * 1000) { // 5-minute window
        connected = true;
        lastSeen = latestHeartbeat.timestamp;
        connectionType = 'heartbeat';
      }
    }

    if (!connected && commandCompleted && latestCommand) {
      connected = true;
      lastSeen = latestCommand.timestamp;
      connectionType = 'command';
    }

    if (!connected && latestScheduledPost) {
      connected = true;
      lastSeen = latestScheduledPost.taskCompletedAt;
      connectionType = 'scheduled_post';
    }

    const secondsAgo = lastSeen ? Math.floor((Date.now() - lastSeen.getTime()) / 1000) : null;

    return NextResponse.json({ 
      connected, 
      lastSeen, 
      secondsAgo,
      connectionType,
      checks: {
        heartbeat: !!latestHeartbeat,
        command: !!latestCommand && commandCompleted,
        scheduledPost: !!latestScheduledPost
      }
    });
  } catch {
    return NextResponse.json({ connected: false });
  }
}
