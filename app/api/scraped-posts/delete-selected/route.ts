import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// POST - Delete selected scraped posts
export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const payload = verifyToken(token);

    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: 'No post IDs provided' }, { status: 400 });
    }

    // Delete posts that belong to the user
    const result = await (prisma as any).scrapedPost.deleteMany({
      where: {
        id: { in: ids },
        userId: payload.userId
      }
    });

    return NextResponse.json({ 
      success: true, 
      deleted: result.count 
    });
  } catch (error: any) {
    console.error('Delete selected posts error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
