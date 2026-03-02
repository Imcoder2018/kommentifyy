import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

function getUserFromToken(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(authHeader.split(' ')[1], JWT_SECRET) as any;
  } catch { return null; }
}

// GET - Fetch AI generated posts
export async function GET(request: Request) {
  try {
    const payload = getUserFromToken(request);
    if (!payload) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const [items, total] = await Promise.all([
      (prisma as any).userHistory.findMany({
        where: {
          userId: payload.userId,
          type: 'ai_generated'
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      (prisma as any).userHistory.count({
        where: {
          userId: payload.userId,
          type: 'ai_generated'
        }
      }),
    ]);

    return NextResponse.json({ success: true, items, total, page });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST - Save AI generated post
export async function POST(request: Request) {
  try {
    const payload = getUserFromToken(request);
    if (!payload) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { title, content, metadata } = body;

    if (!content) {
      return NextResponse.json({ success: false, error: 'content is required' }, { status: 400 });
    }

    const item = await (prisma as any).userHistory.create({
      data: {
        userId: payload.userId,
        type: 'ai_generated',
        title: title || null,
        content: typeof content === 'string' ? content : JSON.stringify(content),
        metadata: metadata ? (typeof metadata === 'string' ? metadata : JSON.stringify(metadata)) : null,
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
