import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// TEMPORARY diagnostic endpoint - remove after debugging
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  
  // Simple protection
  if (key !== 'diag_2026_temp') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const userId = searchParams.get('userId') || 'user_1770223918257_cqudq9n2w';
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  try {
    // Exact same query as GET /api/extension/command
    const commands = await prisma.activity.findMany({
      where: {
        userId,
        type: { startsWith: 'extension_command_' },
        timestamp: { gte: oneDayAgo },
      },
      orderBy: { timestamp: 'asc' },
      take: 50,
      select: { id: true, userId: true, type: true, timestamp: true, metadata: true },
    });

    const parsed = commands.map((c: any) => {
      let meta = c.metadata;
      if (typeof meta === 'string') {
        try { meta = JSON.parse(meta); if (typeof meta === 'string') meta = JSON.parse(meta); } catch { meta = {}; }
      }
      if (!meta || typeof meta !== 'object') meta = {};
      return { id: c.id, type: c.type, status: (meta as any).status, command: (meta as any).command, timestamp: c.timestamp, metaType: typeof c.metadata };
    });

    // Also check user exists
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true } });

    return NextResponse.json({
      userId,
      userExists: !!user,
      userEmail: user?.email,
      oneDayAgo: oneDayAgo.toISOString(),
      now: new Date().toISOString(),
      rawCount: commands.length,
      commands: parsed,
      dbUrl: (process.env.DATABASE_URL || '').substring(0, 30) + '...',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, stack: error.stack?.substring(0, 500) }, { status: 500 });
  }
}
