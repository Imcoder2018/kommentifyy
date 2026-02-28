import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';

function authUser(request: NextRequest) {
  const token = extractToken(request.headers.get('authorization'));
  if (!token) return null;
  try { return verifyToken(token); } catch { return null; }
}

function extractVanityId(url: string): string | null {
  const match = url.match(/linkedin\.com\/in\/([^/?#]+)/i);
  return match ? match[1].replace(/\/$/, '') : null;
}

// GET - List prospects for a campaign
export async function GET(request: NextRequest) {
  try {
    const payload = authUser(request);
    if (!payload) return NextResponse.json({ success: false, error: 'Unauthorized', shouldReauth: true }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');
    const status = searchParams.get('status');

    const where: any = { userId: payload.userId };
    if (campaignId) where.campaignId = campaignId;
    if (status) where.status = status;

    const prospects = await (prisma as any).leadWarmerProspect.findMany({
      where,
      include: { touchLogs: { orderBy: { createdAt: 'desc' }, take: 10 } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, prospects });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST - Add prospects (single or CSV bulk)
export async function POST(request: NextRequest) {
  try {
    const payload = authUser(request);
    if (!payload) return NextResponse.json({ success: false, error: 'Unauthorized', shouldReauth: true }, { status: 401 });

    const body = await request.json();
    const { campaignId, prospects: prospectList } = body;

    if (!campaignId) return NextResponse.json({ success: false, error: 'Campaign ID required' }, { status: 400 });

    // Verify campaign ownership
    const campaign = await (prisma as any).leadWarmerCampaign.findFirst({ where: { id: campaignId, userId: payload.userId } });
    if (!campaign) return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });

    if (!prospectList || !Array.isArray(prospectList) || prospectList.length === 0) {
      return NextResponse.json({ success: false, error: 'At least one prospect required' }, { status: 400 });
    }

    // Parse sequence to determine first touch
    let sequenceSteps: any[] = [];
    try { sequenceSteps = JSON.parse(campaign.sequenceSteps || '[]'); } catch (error) {
      console.error('Failed to parse sequenceSteps:', error);
    }
    const firstStep = sequenceSteps.find((s: any) => s.enabled);
    const firstTouchAction = firstStep?.action || 'follow';
    const firstTouchDay = firstStep?.day || 1;

    const created: any[] = [];
    const skipped: string[] = [];

    for (const p of prospectList) {
      const url = (p.linkedinUrl || p.url || '').trim();
      if (!url.includes('linkedin.com/in/')) { skipped.push(url || 'empty'); continue; }

      const vanityId = extractVanityId(url);
      const normalizedUrl = vanityId ? `https://www.linkedin.com/in/${vanityId}` : url;

      try {
        const nextTouchDate = new Date();
        nextTouchDate.setDate(nextTouchDate.getDate() + (firstTouchDay - 1));

        const prospect = await (prisma as any).leadWarmerProspect.create({
          data: {
            campaignId,
            userId: payload.userId,
            linkedinUrl: normalizedUrl,
            vanityId,
            firstName: p.firstName || p.first_name || null,
            lastName: p.lastName || p.last_name || null,
            company: p.company || null,
            jobTitle: p.jobTitle || p.job_title || null,
            campaignTag: p.campaignTag || p.tag || null,
            notes: p.notes || null,
            nextTouchDate,
            nextTouchAction: firstTouchAction,
          },
        });
        created.push(prospect);
      } catch (err: any) {
        if (err.code === 'P2002') { skipped.push(normalizedUrl + ' (duplicate)'); }
        else { skipped.push(normalizedUrl + ': ' + err.message); }
      }
    }

    // Update campaign total count
    const totalProspects = await (prisma as any).leadWarmerProspect.count({ where: { campaignId } });
    await (prisma as any).leadWarmerCampaign.update({ where: { id: campaignId }, data: { totalProspects } });

    return NextResponse.json({ success: true, created: created.length, skipped, total: totalProspects });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT - Update prospect (profile data from extension, status change, etc.)
export async function PUT(request: NextRequest) {
  try {
    const payload = authUser(request);
    if (!payload) return NextResponse.json({ success: false, error: 'Unauthorized', shouldReauth: true }, { status: 401 });

    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ success: false, error: 'Prospect ID required' }, { status: 400 });

    const existing = await (prisma as any).leadWarmerProspect.findFirst({ where: { id, userId: payload.userId } });
    if (!existing) return NextResponse.json({ success: false, error: 'Prospect not found' }, { status: 404 });

    delete updates.userId; delete updates.campaignId; delete updates.createdAt; delete updates.updatedAt;

    if (updates.recentPosts && typeof updates.recentPosts !== 'string') {
      updates.recentPosts = JSON.stringify(updates.recentPosts);
    }

    const prospect = await (prisma as any).leadWarmerProspect.update({ where: { id }, data: updates });
    return NextResponse.json({ success: true, prospect });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE - Remove prospect
export async function DELETE(request: NextRequest) {
  try {
    const payload = authUser(request);
    if (!payload) return NextResponse.json({ success: false, error: 'Unauthorized', shouldReauth: true }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Prospect ID required' }, { status: 400 });

    const existing = await (prisma as any).leadWarmerProspect.findFirst({ where: { id, userId: payload.userId } });
    if (!existing) return NextResponse.json({ success: false, error: 'Prospect not found' }, { status: 404 });

    await (prisma as any).leadWarmerProspect.delete({ where: { id } });

    // Update campaign count
    const totalProspects = await (prisma as any).leadWarmerProspect.count({ where: { campaignId: existing.campaignId } });
    await (prisma as any).leadWarmerCampaign.update({ where: { id: existing.campaignId }, data: { totalProspects } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
