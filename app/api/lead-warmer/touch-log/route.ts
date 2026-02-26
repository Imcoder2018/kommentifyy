import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';

function authUser(request: NextRequest) {
  const token = extractToken(request.headers.get('authorization'));
  if (!token) return null;
  try { return verifyToken(token); } catch { return null; }
}

// GET - Get touch logs for a prospect
export async function GET(request: NextRequest) {
  try {
    const payload = authUser(request);
    if (!payload) return NextResponse.json({ success: false, error: 'Unauthorized', shouldReauth: true }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const prospectId = searchParams.get('prospectId');

    if (!prospectId) return NextResponse.json({ success: false, error: 'Prospect ID required' }, { status: 400 });

    const logs = await (prisma as any).leadWarmerTouchLog.findMany({
      where: { prospectId, userId: payload.userId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST - Record a touch action (called by extension after executing)
export async function POST(request: NextRequest) {
  try {
    const payload = authUser(request);
    if (!payload) return NextResponse.json({ success: false, error: 'Unauthorized', shouldReauth: true }, { status: 401 });

    const body = await request.json();
    const { prospectId, touchNumber, action, status, postText, postUrl, commentText, connectionNote, errorMessage } = body;

    if (!prospectId || !action) return NextResponse.json({ success: false, error: 'prospectId and action required' }, { status: 400 });

    // Verify ownership
    const prospect = await (prisma as any).leadWarmerProspect.findFirst({
      where: { id: prospectId, userId: payload.userId },
      include: { campaign: true },
    });
    if (!prospect) return NextResponse.json({ success: false, error: 'Prospect not found' }, { status: 404 });

    // Create touch log
    const log = await (prisma as any).leadWarmerTouchLog.create({
      data: {
        prospectId,
        userId: payload.userId,
        touchNumber: touchNumber || prospect.touchCount + 1,
        action,
        status: status || 'completed',
        postText: postText || null,
        postUrl: postUrl || null,
        commentText: commentText || null,
        connectionNote: connectionNote || null,
        errorMessage: errorMessage || null,
      },
    });

    // Update prospect status and next touch
    const newTouchCount = prospect.touchCount + 1;
    let newStatus = prospect.status;
    if (newStatus === 'cold' && newTouchCount >= 1) newStatus = 'touched';
    if (action === 'connect' && status === 'completed') newStatus = 'connected';

    // Calculate next touch based on sequence
    let sequenceSteps: any[] = [];
    try { sequenceSteps = JSON.parse(prospect.campaign.sequenceSteps || '[]'); } catch {}
    const enabledSteps = sequenceSteps.filter((s: any) => s.enabled);
    const currentStepIdx = enabledSteps.findIndex((s: any) => s.day > (prospect.touchCount + 1) || enabledSteps.indexOf(s) > prospect.touchCount);
    const nextStep = enabledSteps[newTouchCount] || null;

    let nextTouchDate = null;
    let nextTouchAction = null;
    if (nextStep) {
      nextTouchDate = new Date();
      const dayDiff = nextStep.day - (enabledSteps[newTouchCount - 1]?.day || 0);
      nextTouchDate.setDate(nextTouchDate.getDate() + Math.max(1, dayDiff));
      nextTouchAction = nextStep.action;
    }

    // If warm signals: 3+ touches and engaged-based comments
    if (newTouchCount >= 3 && action === 'comment') newStatus = 'warm';

    await (prisma as any).leadWarmerProspect.update({
      where: { id: prospectId },
      data: {
        touchCount: newTouchCount,
        lastTouchDate: new Date(),
        status: newStatus,
        nextTouchDate,
        nextTouchAction,
      },
    });

    // Update campaign stats
    const campaignId = prospect.campaignId;
    const warmCount = await (prisma as any).leadWarmerProspect.count({ where: { campaignId, status: { in: ['warm', 'connected', 'replied'] } } });
    const connectedCount = await (prisma as any).leadWarmerProspect.count({ where: { campaignId, status: 'connected' } });
    const repliedCount = await (prisma as any).leadWarmerProspect.count({ where: { campaignId, status: 'replied' } });
    await (prisma as any).leadWarmerCampaign.update({
      where: { id: campaignId },
      data: { warmProspects: warmCount, connectedCount, repliedCount },
    });

    return NextResponse.json({ success: true, log, newStatus, nextTouchDate, nextTouchAction });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
