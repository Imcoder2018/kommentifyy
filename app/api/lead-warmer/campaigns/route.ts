import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';

function authUser(request: NextRequest) {
  const token = extractToken(request.headers.get('authorization'));
  if (!token) return null;
  try { return verifyToken(token); } catch { return null; }
}

export async function GET(request: NextRequest) {
  try {
    const payload = authUser(request);
    if (!payload) return NextResponse.json({ success: false, error: 'Unauthorized', shouldReauth: true }, { status: 401 });

    const campaigns = await (prisma as any).leadWarmerCampaign.findMany({
      where: { userId: payload.userId },
      include: { prospects: { select: { id: true, status: true, firstName: true, lastName: true, linkedinUrl: true, touchCount: true, nextTouchDate: true, engagedBack: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, campaigns });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = authUser(request);
    if (!payload) return NextResponse.json({ success: false, error: 'Unauthorized', shouldReauth: true }, { status: 401 });

    const body = await request.json();
    const { name, businessContext, campaignGoal, sequenceSteps, profilesPerDay } = body;

    if (!name) return NextResponse.json({ success: false, error: 'Campaign name is required' }, { status: 400 });

    const campaign = await (prisma as any).leadWarmerCampaign.create({
      data: {
        userId: payload.userId,
        name,
        businessContext: businessContext || null,
        campaignGoal: campaignGoal || 'relationship',
        sequenceSteps: sequenceSteps ? JSON.stringify(sequenceSteps) : undefined,
        profilesPerDay: profilesPerDay || 20,
      },
    });
    return NextResponse.json({ success: true, campaign });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const payload = authUser(request);
    if (!payload) return NextResponse.json({ success: false, error: 'Unauthorized', shouldReauth: true }, { status: 401 });

    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ success: false, error: 'Campaign ID required' }, { status: 400 });

    // Verify ownership
    const existing = await (prisma as any).leadWarmerCampaign.findFirst({ where: { id, userId: payload.userId } });
    if (!existing) return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });

    if (updates.sequenceSteps && typeof updates.sequenceSteps !== 'string') {
      updates.sequenceSteps = JSON.stringify(updates.sequenceSteps);
    }
    delete updates.userId; delete updates.createdAt; delete updates.updatedAt; delete updates.prospects;

    const campaign = await (prisma as any).leadWarmerCampaign.update({ where: { id }, data: updates });
    return NextResponse.json({ success: true, campaign });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const payload = authUser(request);
    if (!payload) return NextResponse.json({ success: false, error: 'Unauthorized', shouldReauth: true }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Campaign ID required' }, { status: 400 });

    const existing = await (prisma as any).leadWarmerCampaign.findFirst({ where: { id, userId: payload.userId } });
    if (!existing) return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });

    await (prisma as any).leadWarmerCampaign.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
