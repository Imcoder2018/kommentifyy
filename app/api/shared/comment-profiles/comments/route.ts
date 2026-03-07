import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// POST - Get comments for a specific shared profile
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { profileId } = body;

    if (!profileId) {
      return NextResponse.json({ success: false, error: 'Missing profileId' }, { status: 400 });
    }

    // Find the shared profile
    const sharedProfile = await (prisma as any).commentStyleProfile.findFirst({
      where: { 
        profileId: profileId,
        isSharedByAdmin: true 
      },
      include: {
        comments: {
          select: {
            postText: true,
            context: true,
            commentText: true,
            isTopComment: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!sharedProfile) {
      return NextResponse.json({ success: false, error: 'Shared profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      comments: sharedProfile.comments || []
    });
  } catch (error: any) {
    console.error('Get shared profile comments error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
