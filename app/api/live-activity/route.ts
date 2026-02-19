import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';

// GET — fetch recent activity logs for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token);

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500);
    const taskType = searchParams.get('taskType') || undefined;
    const since = searchParams.get('since'); // ISO timestamp

    const where: any = { userId: payload.userId };
    if (taskType) where.taskType = taskType;
    if (since) where.createdAt = { gte: new Date(since) };

    const logs = await (prisma as any).liveActivityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST — extension pushes activity log entries
export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token);

    const body = await request.json();

    // Support batch logging (array of entries) or single entry
    const entries = Array.isArray(body) ? body : [body];

    const created = [];
    for (const entry of entries.slice(0, 50)) { // max 50 per request
      const log = await (prisma as any).liveActivityLog.create({
        data: {
          userId: payload.userId,
          taskType: entry.taskType || 'automation',
          action: entry.action || 'info',
          message: entry.message || '',
          details: typeof entry.details === 'string' ? entry.details : JSON.stringify(entry.details || {}),
          level: entry.level || 'info',
        },
      });
      created.push(log);
    }

    // Auto-cleanup: keep only last 1000 logs per user
    const count = await (prisma as any).liveActivityLog.count({ where: { userId: payload.userId } });
    if (count > 1000) {
      const oldest = await (prisma as any).liveActivityLog.findMany({
        where: { userId: payload.userId },
        orderBy: { createdAt: 'asc' },
        take: count - 1000,
        select: { id: true },
      });
      if (oldest.length > 0) {
        await (prisma as any).liveActivityLog.deleteMany({
          where: { id: { in: oldest.map((l: any) => l.id) } },
        });
      }
    }

    return NextResponse.json({ success: true, count: created.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
