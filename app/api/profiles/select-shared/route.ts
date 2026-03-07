import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// POST - Add a shared profile to user's saved profiles
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
    const { profileId, profileName } = body;

    if (!profileId) {
      return NextResponse.json({ success: false, error: 'Profile ID is required' }, { status: 400 });
    }

    // Find the shared profile
    const sharedProfile = await prisma.commentStyleProfile.findFirst({
      where: { profileId: profileId, isSharedByAdmin: true },
    });

    if (!sharedProfile) {
      return NextResponse.json({ success: false, error: 'Shared profile not found' }, { status: 404 });
    }

    // Check if user already has this profile
    const existingProfile = await prisma.commentStyleProfile.findFirst({
      where: { userId: decoded.userId, profileId: profileId },
    });

    if (existingProfile) {
      // Toggle selection if already exists
      await prisma.commentStyleProfile.update({
        where: { id: existingProfile.id },
        data: { isSelected: !existingProfile.isSelected },
      });
      return NextResponse.json({ success: true, message: 'Profile selection toggled' });
    }

    // Get comments from the shared profile
    const sharedComments = await prisma.scrapedComment.findMany({
      where: { profileId: sharedProfile.id },
    });

    // Create new profile for user
    const newProfile = await prisma.commentStyleProfile.create({
      data: {
        userId: decoded.userId,
        profileUrl: sharedProfile.profileUrl,
        profileId: profileId,
        profileName: profileName || sharedProfile.profileName,
        commentCount: sharedComments.length,
        lastScrapedAt: new Date(),
        isSelected: true,
      },
    });

    // Copy comments to user's profile
    if (sharedComments.length > 0) {
      await prisma.scrapedComment.createMany({
        data: sharedComments.map((c) => ({
          userId: decoded.userId,
          profileId: newProfile.id,
          postText: c.postText,
          context: c.context,
          commentText: c.commentText,
          isTopComment: c.isTopComment,
        })),
      });
    }

    return NextResponse.json({ success: true, profileId: newProfile.id });
  } catch (error: any) {
    console.error('Select shared profile error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
