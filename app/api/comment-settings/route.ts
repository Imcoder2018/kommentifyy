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
        useProfileStyle: false,
        useProfileData: false,
        goal: 'AddValue',
        tone: 'Friendly',
        commentLength: 'Short',
        commentStyle: 'direct',
        model: 'gpt-4o',
        userExpertise: '',
        userBackground: '',
        aiAutoPost: 'manual',
        autoDecide: false,
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
    const { useProfileStyle, useProfileData, goal, tone, commentLength, commentStyle, model, userExpertise, userBackground, aiAutoPost, autoDecide } = body;

    const settings = await (prisma as any).commentSettings.upsert({
      where: { userId: payload.userId },
      create: {
        userId: payload.userId,
        useProfileStyle: useProfileStyle === true,
        useProfileData: useProfileData === true,
        goal: goal || 'AddValue',
        tone: tone || 'Friendly',
        commentLength: commentLength || 'Short',
        commentStyle: commentStyle || 'direct',
        model: model || 'gpt-4o',
        userExpertise: userExpertise || '',
        userBackground: userBackground || '',
        aiAutoPost: aiAutoPost || 'manual',
        autoDecide: autoDecide === true,
      },
      update: {
        useProfileStyle: useProfileStyle !== undefined ? useProfileStyle : undefined,
        useProfileData: useProfileData !== undefined ? useProfileData : undefined,
        goal: goal !== undefined ? goal : undefined,
        tone: tone !== undefined ? tone : undefined,
        commentLength: commentLength !== undefined ? commentLength : undefined,
        commentStyle: commentStyle !== undefined ? commentStyle : undefined,
        model: model !== undefined ? model : undefined,
        userExpertise: userExpertise !== undefined ? userExpertise : undefined,
        userBackground: userBackground !== undefined ? userBackground : undefined,
        aiAutoPost: aiAutoPost !== undefined ? aiAutoPost : undefined,
        autoDecide: autoDecide !== undefined ? autoDecide : undefined,
      },
    });

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error('POST comment-settings error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
