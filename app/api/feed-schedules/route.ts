import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - Get user's feed scraping schedule
export async function GET(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const payload = verifyToken(token);

    const schedule = await (prisma as any).feedScrapeSchedule.findFirst({
      where: { userId: payload.userId },
    });

    return NextResponse.json({ success: true, schedule });
  } catch (error: any) {
    console.error('Get feed schedule error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST - Create or update feed scraping schedule
export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const payload = verifyToken(token);

    const { scheduleTimes, durationMinutes, isActive, minLikes, minComments, keywords } = await request.json();

    // Validate scheduleTimes is array of time strings
    if (!Array.isArray(scheduleTimes) || scheduleTimes.length === 0) {
      return NextResponse.json({ success: false, error: 'At least one schedule time required' }, { status: 400 });
    }

    const existing = await (prisma as any).feedScrapeSchedule.findFirst({
      where: { userId: payload.userId },
    });

    let schedule;
    if (existing) {
      schedule = await (prisma as any).feedScrapeSchedule.update({
        where: { id: existing.id },
        data: {
          scheduleTimes: JSON.stringify(scheduleTimes),
          durationMinutes: durationMinutes || 5,
          isActive: isActive !== undefined ? isActive : true,
          minLikes: minLikes || 0,
          minComments: minComments || 0,
          keywords: keywords || null,
        },
      });
    } else {
      schedule = await (prisma as any).feedScrapeSchedule.create({
        data: {
          userId: payload.userId,
          scheduleTimes: JSON.stringify(scheduleTimes),
          durationMinutes: durationMinutes || 5,
          isActive: isActive !== undefined ? isActive : true,
          minLikes: minLikes || 0,
          minComments: minComments || 0,
          keywords: keywords || null,
        },
      });
    }

    return NextResponse.json({ success: true, schedule });
  } catch (error: any) {
    console.error('Save feed schedule error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE - Delete feed scraping schedule
export async function DELETE(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const payload = verifyToken(token);

    await (prisma as any).feedScrapeSchedule.deleteMany({
      where: { userId: payload.userId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete feed schedule error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
