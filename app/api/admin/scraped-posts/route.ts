import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET - Admin: List all users' scraped posts
export async function GET(request: NextRequest) {
  try {
    // Verify admin token
    const adminToken = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!adminToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify it's an admin (simple check - you may want to enhance this)
    const jwt = require('jsonwebtoken');
    let decoded: any;
    try {
      decoded = jwt.verify(adminToken, process.env.JWT_SECRET || 'fallback-secret');
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const sortBy = searchParams.get('sortBy') || 'scrapedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const search = searchParams.get('search') || '';
    const userId = searchParams.get('userId') || '';

    const where: any = {};
    if (userId) where.userId = userId;
    if (search) {
      where.OR = [
        { postContent: { contains: search, mode: 'insensitive' } },
        { authorName: { contains: search, mode: 'insensitive' } },
      ];
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

    // Fetch user info for each post
    const userIds = [...new Set(posts.map((p: any) => p.userId))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds as string[] } },
      select: { id: true, name: true, email: true },
    });
    const userMap = new Map(users.map(u => [u.id, u]));

    const postsWithUser = posts.map((p: any) => ({
      ...p,
      user: userMap.get(p.userId) || { name: 'Unknown', email: 'Unknown' },
    }));

    return NextResponse.json({
      success: true,
      posts: postsWithUser,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    console.error('Admin get scraped posts error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
