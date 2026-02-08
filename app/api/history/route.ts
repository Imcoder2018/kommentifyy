import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

function getUserFromToken(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET || 'kommentify-secret-key-2024') as any;
  } catch { return null; }
}

// GET - Fetch user history with optional type filter
export async function GET(request: Request) {
  try {
    const payload = getUserFromToken(request);
    if (!payload) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = { userId: payload.userId };
    if (type) where.type = type;

    const [items, total] = await Promise.all([
      (prisma as any).userHistory.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      (prisma as any).userHistory.count({ where }),
    ]);

    return NextResponse.json({ success: true, items, total, page });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST - Save history entry
export async function POST(request: Request) {
  try {
    const payload = getUserFromToken(request);
    if (!payload) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { type, title, content, metadata } = body;

    if (!type || !content) {
      return NextResponse.json({ success: false, error: 'type and content are required' }, { status: 400 });
    }

    const item = await (prisma as any).userHistory.create({
      data: {
        userId: payload.userId,
        type,
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

// DELETE - Delete a history entry
export async function DELETE(request: Request) {
  try {
    const payload = getUserFromToken(request);
    if (!payload) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });

    await (prisma as any).userHistory.deleteMany({
      where: { id, userId: payload.userId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
