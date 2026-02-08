import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';

// GET - Fetch comment settings for the user
export async function GET(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token);

    const settings = await (prisma as any).commentSettings.findUnique({
      where: { userId: payload.userId },
    });

    return NextResponse.json({
      success: true,
      settings: settings || {
        goal: 'AddValue',
        tone: 'Friendly',
        commentLength: 'Short',
        commentStyle: 'direct',
        userExpertise: '',
        userBackground: '',
        aiAutoPost: 'manual',
      },
    });
  } catch (error: any) {
    console.error('GET comment-settings error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST - Save/update comment settings
export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token);

    const body = await request.json();
    const { goal, tone, commentLength, commentStyle, userExpertise, userBackground, aiAutoPost } = body;

    const settings = await (prisma as any).commentSettings.upsert({
      where: { userId: payload.userId },
      create: {
        userId: payload.userId,
        goal: goal || 'AddValue',
        tone: tone || 'Friendly',
        commentLength: commentLength || 'Short',
        commentStyle: commentStyle || 'direct',
        userExpertise: userExpertise || '',
        userBackground: userBackground || '',
        aiAutoPost: aiAutoPost || 'manual',
      },
      update: {
        goal: goal !== undefined ? goal : undefined,
        tone: tone !== undefined ? tone : undefined,
        commentLength: commentLength !== undefined ? commentLength : undefined,
        commentStyle: commentStyle !== undefined ? commentStyle : undefined,
        userExpertise: userExpertise !== undefined ? userExpertise : undefined,
        userBackground: userBackground !== undefined ? userBackground : undefined,
        aiAutoPost: aiAutoPost !== undefined ? aiAutoPost : undefined,
      },
    });

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error('POST comment-settings error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
