import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - Get all commands (all statuses) for the Tasks tab
export async function GET(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const payload = verifyToken(token);

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const commands = await prisma.activity.findMany({
      where: {
        userId: payload.userId,
        type: { startsWith: 'extension_command_' },
        timestamp: { gte: oneDayAgo },
      },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });

    const allCommands = commands.map((c: any) => {
      const meta = typeof c.metadata === 'string' ? JSON.parse(c.metadata) : c.metadata;
      return { id: c.id, ...meta, timestamp: c.timestamp };
    });

    return NextResponse.json({ success: true, commands: allCommands });
  } catch (error: any) {
    console.error('Get all commands error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
