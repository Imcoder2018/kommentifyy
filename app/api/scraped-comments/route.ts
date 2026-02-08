import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';

// GET - Fetch comment style profiles and their comments
export async function GET(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token);

    const profileId = request.nextUrl.searchParams.get('profileId');
    const topOnly = request.nextUrl.searchParams.get('topOnly') === 'true';

    // If profileId specified, return comments for that profile
    if (profileId) {
      const where: any = { userId: payload.userId, profileId };
      if (topOnly) where.isTopComment = true;

      const comments = await prisma.scrapedComment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 200,
      });
      return NextResponse.json({ success: true, comments });
    }

    // Otherwise return all profiles with comment counts
    const profiles = await prisma.commentStyleProfile.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { comments: true } } },
    });

    return NextResponse.json({ success: true, profiles });
  } catch (error: any) {
    console.error('GET scraped-comments error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST - Save scraped comments or create/update a profile
export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token);

    const body = await request.json();

    // Action: toggle top comment
    if (body.action === 'toggleTop') {
      const comment = await prisma.scrapedComment.findFirst({
        where: { id: body.commentId, userId: payload.userId },
      });
      if (!comment) return NextResponse.json({ success: false, error: 'Comment not found' }, { status: 404 });
      await prisma.scrapedComment.update({
        where: { id: body.commentId },
        data: { isTopComment: !comment.isTopComment },
      });
      return NextResponse.json({ success: true });
    }

    // Action: toggle profile selection for AI training
    if (body.action === 'toggleSelect') {
      const profile = await prisma.commentStyleProfile.findFirst({
        where: { id: body.profileId, userId: payload.userId },
      });
      if (!profile) return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
      await prisma.commentStyleProfile.update({
        where: { id: body.profileId },
        data: { isSelected: !profile.isSelected },
      });
      return NextResponse.json({ success: true });
    }

    // Action: save bulk comments from extension scrape
    if (body.action === 'saveComments') {
      const { profileUrl, profileIdSlug, profileName, comments } = body;
      if (!profileIdSlug || !comments || !Array.isArray(comments)) {
        return NextResponse.json({ success: false, error: 'Missing profileIdSlug or comments array' }, { status: 400 });
      }

      // Upsert the profile
      const profile = await prisma.commentStyleProfile.upsert({
        where: { userId_profileId: { userId: payload.userId, profileId: profileIdSlug } },
        create: {
          userId: payload.userId,
          profileUrl: profileUrl || `https://www.linkedin.com/in/${profileIdSlug}/`,
          profileId: profileIdSlug,
          profileName: profileName || profileIdSlug,
          commentCount: comments.length,
          lastScrapedAt: new Date(),
        },
        update: {
          profileName: profileName || undefined,
          commentCount: { increment: comments.length },
          lastScrapedAt: new Date(),
        },
      });

      // Delete old comments for this profile to avoid duplicates on re-scrape
      await prisma.scrapedComment.deleteMany({
        where: { userId: payload.userId, profileId: profile.id },
      });

      // Bulk create comments
      if (comments.length > 0) {
        await prisma.scrapedComment.createMany({
          data: comments.map((c: any) => ({
            userId: payload.userId,
            profileId: profile.id,
            postText: (c.postText || '').substring(0, 5000),
            context: (c.context || 'DIRECT COMMENT ON POST').substring(0, 5000),
            commentText: (c.commentText || '').substring(0, 5000),
          })),
        });
      }

      // Update accurate count
      const count = await prisma.scrapedComment.count({ where: { profileId: profile.id } });
      await prisma.commentStyleProfile.update({
        where: { id: profile.id },
        data: { commentCount: count },
      });

      return NextResponse.json({ success: true, profileId: profile.id, savedCount: comments.length });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('POST scraped-comments error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE - Delete a profile and all its comments, or a single comment
export async function DELETE(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token);

    const profileId = request.nextUrl.searchParams.get('profileId');
    const commentId = request.nextUrl.searchParams.get('commentId');

    if (commentId) {
      await prisma.scrapedComment.deleteMany({
        where: { id: commentId, userId: payload.userId },
      });
      return NextResponse.json({ success: true });
    }

    if (profileId) {
      // Cascade delete handles comments via relation
      await prisma.commentStyleProfile.deleteMany({
        where: { id: profileId, userId: payload.userId },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Provide profileId or commentId' }, { status: 400 });
  } catch (error: any) {
    console.error('DELETE scraped-comments error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
