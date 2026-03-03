import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// POST - Extension pings this to signal it is active and connected
export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    let payload;
    try {
      payload = verifyToken(token);
    } catch (authError: any) {
      console.error('Heartbeat auth error:', authError.message);
      return NextResponse.json({ success: false, error: 'token_expired', shouldReauth: true }, { status: 401 });
    }

    // Resolve canonical userId from database to handle JWT userId mismatches
    let userId = payload.userId;
    try {
      const user = await prisma.user.findUnique({ where: { email: payload.email }, select: { id: true } });
      if (user) userId = user.id;
    } catch {}

    const now = new Date();

    // Update ExtensionHeartbeat model (used by cron job to check if extension is online)
    try {
      await (prisma as any).extensionHeartbeat.upsert({
        where: { userId },
        update: { lastSeen: now, status: 'online' },
        create: { userId, lastSeen: now, status: 'online' },
      });
    } catch (hbErr: any) {
      console.error('ExtensionHeartbeat upsert error:', hbErr.message);
    }

    // Also update Activity model (used by dashboard to check connectivity)
    const existing = await prisma.activity.findFirst({
      where: { userId, type: 'extension_heartbeat' },
      orderBy: { timestamp: 'desc' },
    });

    if (existing) {
      await prisma.activity.update({
        where: { id: existing.id },
        data: { timestamp: now, metadata: { version: 'active', updatedAt: now.toISOString() } },
      });
    } else {
      await prisma.activity.create({
        data: {
          userId,
          type: 'extension_heartbeat',
          timestamp: now,
          metadata: { version: 'active' },
        },
      });
    }

    // Cleanup: delete any extra old heartbeat records (keep only the latest)
    const allHeartbeats = await prisma.activity.findMany({
      where: { userId, type: 'extension_heartbeat' },
      orderBy: { timestamp: 'desc' },
      skip: 1,
    });
    if (allHeartbeats.length > 0) {
      await prisma.activity.deleteMany({
        where: { id: { in: allHeartbeats.map(h => h.id) } },
      });
    }

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

    // Resolve canonical userId from database to handle JWT userId mismatches
    let userId = payload.userId;
    try {
      const user = await prisma.user.findUnique({ where: { email: payload.email }, select: { id: true } });
      if (user) userId = user.id;
    } catch {}

    // Check 1: Recent heartbeat
    const latestHeartbeat = await prisma.activity.findFirst({
      where: { userId, type: 'extension_heartbeat' },
      orderBy: { timestamp: 'desc' },
    });

    // Check 2: Recent successful command completion (using Activity model)
    const latestCommand = await prisma.activity.findFirst({
      where: { 
        userId,
        type: { startsWith: 'extension_command_' },
        timestamp: { gte: new Date(Date.now() - 10 * 60 * 1000) } // Within last 10 minutes
      },
      orderBy: { timestamp: 'desc' },
    });

    // Parse command metadata to check if completed
    let commandCompleted = false;
    if (latestCommand) {
      let meta: any = latestCommand.metadata;
      if (typeof meta === 'string') { try { meta = JSON.parse(meta); if (typeof meta === 'string') meta = JSON.parse(meta); } catch(e) { meta = {}; } }
      commandCompleted = meta?.status === 'completed';
    }

    // Check 3: Recent scheduled post activity
    const latestScheduledPost = await (prisma as any).postDraft.findFirst({
      where: { 
        userId,
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
      if (diffMs < 2 * 60 * 1000) { // 2-minute window (heartbeat sent every 15s, generous buffer)
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
