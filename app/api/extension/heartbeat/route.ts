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

    const latest = await prisma.activity.findFirst({
      where: { userId: payload.userId, type: 'extension_heartbeat' },
      orderBy: { timestamp: 'desc' },
    });

    if (!latest) return NextResponse.json({ connected: false, lastSeen: null });

    const diffMs = Date.now() - new Date(latest.timestamp).getTime();
    const connected = diffMs < 5 * 60 * 1000; // 5-minute window for more reliability

    return NextResponse.json({ connected, lastSeen: latest.timestamp, secondsAgo: Math.floor(diffMs / 1000) });
  } catch {
    return NextResponse.json({ connected: false });
  }
}
