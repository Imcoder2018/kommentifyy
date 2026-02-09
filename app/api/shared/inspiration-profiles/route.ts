import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - User: Get admin-shared inspiration profiles
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

    const profiles = await (prisma as any).sharedInspirationProfile.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      profiles: profiles.map((p: any) => ({
        profileUrl: p.profileUrl,
        profileName: p.profileName,
        postCount: p.postCount,
      })),
    });
  } catch (error: any) {
    console.error('Get shared inspiration profiles error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
