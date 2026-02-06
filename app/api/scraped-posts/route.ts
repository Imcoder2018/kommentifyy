import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - List scraped posts for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const payload = verifyToken(token);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'scrapedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const search = searchParams.get('search') || '';
    const since = searchParams.get('since') || '';

    const where: any = { userId: payload.userId };
    if (search) {
      where.postContent = { contains: search, mode: 'insensitive' };
    }
    if (since) {
      where.scrapedAt = { gte: new Date(since) };
    }

    const validSortFields = ['scrapedAt', 'likes', 'comments', 'shares', 'createdAt'];
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'scrapedAt';
    const orderDir = sortOrder === 'asc' ? 'asc' : 'desc';

    const [posts, total] = await Promise.all([
      (prisma as any).scrapedPost.findMany({
        where,
        orderBy: { [orderField]: orderDir },
        skip: (page - 1) * limit,
        take: limit,
      }),
      (prisma as any).scrapedPost.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      posts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    console.error('Get scraped posts error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST - Save scraped posts (called by extension)
export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const payload = verifyToken(token);

    const body = await request.json();

    // Support both single post and batch
    const posts = Array.isArray(body.posts) ? body.posts : [body];

    const created = [];
    for (const post of posts) {
      const record = await (prisma as any).scrapedPost.create({
        data: {
          userId: payload.userId,
          postContent: post.postContent || post.content || '',
          authorName: post.authorName || null,
          authorProfileUrl: post.authorProfileUrl || null,
          likes: parseInt(post.likes) || 0,
          comments: parseInt(post.comments) || 0,
          shares: parseInt(post.shares) || 0,
          postUrl: post.postUrl || null,
        },
      });
      created.push(record);
    }

    return NextResponse.json({ success: true, count: created.length, posts: created });
  } catch (error: any) {
    console.error('Save scraped post error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE - Delete a scraped post
export async function DELETE(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const payload = verifyToken(token);

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, error: 'Post ID required' }, { status: 400 });
    }

    // Verify ownership
    const post = await (prisma as any).scrapedPost.findFirst({ where: { id, userId: payload.userId } });
    if (!post) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
    }

    await (prisma as any).scrapedPost.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete scraped post error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
