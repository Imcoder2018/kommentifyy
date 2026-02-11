import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token);

    let settings = await (prisma as any).automationSettings.findUnique({ where: { userId: payload.userId } });
    if (!settings) {
      settings = await (prisma as any).automationSettings.create({ data: { userId: payload.userId } });
    }
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token);
    const body = await request.json();

    // Remove fields that shouldn't be updated directly
    delete body.id;
    delete body.userId;
    delete body.createdAt;
    delete body.updatedAt;

    const settings = await (prisma as any).automationSettings.upsert({
      where: { userId: payload.userId },
      update: body,
      create: { userId: payload.userId, ...body },
    });

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
