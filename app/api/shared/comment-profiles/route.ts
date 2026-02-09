import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - User: Get admin-shared comment style profiles
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const profiles = await (prisma as any).commentStyleProfile.findMany({
      where: { isSharedByAdmin: true },
      orderBy: { commentCount: 'desc' },
      select: {
        id: true, profileUrl: true, profileId: true, profileName: true,
        commentCount: true, userId: true,
      },
    });

    return NextResponse.json({
      success: true,
      profiles: profiles.map((p: any) => ({
        id: p.id,
        profileUrl: p.profileUrl,
        profileId: p.profileId,
        profileName: p.profileName,
        commentCount: p.commentCount,
      })),
    });
  } catch (error: any) {
    console.error('Get shared comment profiles error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
