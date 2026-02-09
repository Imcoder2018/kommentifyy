import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - User: Get admin-shared trending posts
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const [posts, total] = await Promise.all([
      (prisma as any).scrapedPost.findMany({
        where: { isSharedByAdmin: true },
        orderBy: { likes: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, postContent: true, authorName: true, authorProfileUrl: true,
          likes: true, comments: true, shares: true, postUrl: true, imageUrl: true, scrapedAt: true,
        },
      }),
      (prisma as any).scrapedPost.count({ where: { isSharedByAdmin: true } }),
    ]);

    return NextResponse.json({
      success: true,
      posts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    console.error('Get shared posts error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
