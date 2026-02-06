import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// POST - Cancel all pending and in_progress commands for the user
export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const payload = verifyToken(token);

    // Get all recent commands
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const commands = await prisma.activity.findMany({
      where: {
        userId: payload.userId,
        type: { startsWith: 'extension_command_' },
        timestamp: { gte: oneDayAgo },
      },
    });

    let cancelled = 0;
    for (const cmd of commands) {
      const meta = typeof cmd.metadata === 'string' ? JSON.parse(cmd.metadata) : cmd.metadata;
      if (meta.status === 'pending' || meta.status === 'in_progress') {
        meta.status = 'cancelled';
        meta.cancelledAt = new Date().toISOString();
        await prisma.activity.update({
          where: { id: cmd.id },
          data: { metadata: JSON.stringify(meta) },
        });
        cancelled++;
      }
    }

    return NextResponse.json({ success: true, cancelled });
  } catch (error: any) {
    console.error('Stop all commands error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
