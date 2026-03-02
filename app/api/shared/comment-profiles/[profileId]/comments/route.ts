import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - User: Get comments for a specific admin-shared comment style profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
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

    const { profileId } = await params;

    // First find the shared profile by profileId slug
    const sharedProfile = await (prisma as any).commentStyleProfile.findFirst({
      where: { profileId: profileId, isSharedByAdmin: true },
    });

    if (!sharedProfile) {
      return NextResponse.json({ success: false, error: 'Shared profile not found' }, { status: 404 });
    }

    // Then get comments for this profile
    const comments = await prisma.scrapedComment.findMany({
      where: { profileId: sharedProfile.id },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    return NextResponse.json({
      success: true,
      comments,
      profile: {
        id: sharedProfile.id,
        profileId: sharedProfile.profileId,
        profileName: sharedProfile.profileName,
        commentCount: comments.length,
      },
    });
  } catch (error: any) {
    console.error('Get shared profile comments error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
