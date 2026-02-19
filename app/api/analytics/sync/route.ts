import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractToken } from '@/lib/auth';
import { userService } from '@/lib/user-service';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/analytics/sync
 * Receives all analytics data from the extension and stores it in the database.
 * The extension sends: engagementStats, automationRecords, networkingSessions, importRecords, leads
 */
export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    const user = await userService.findUserByEmail(payload.email);

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      engagementStats,
      automationRecords,
      networkingSessions,
      importRecords,
      leads,
    } = body;

    // Upsert analytics data for this user
    await prisma.userAnalyticsSync.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        engagementStats: engagementStats ? JSON.stringify(engagementStats) : '{}',
        automationRecords: automationRecords ? JSON.stringify(automationRecords) : '[]',
        networkingSessions: networkingSessions ? JSON.stringify(networkingSessions) : '[]',
        importRecords: importRecords ? JSON.stringify(importRecords) : '[]',
        leads: leads ? JSON.stringify(leads) : '[]',
        lastSyncedAt: new Date(),
      },
      update: {
        ...(engagementStats !== undefined && { engagementStats: JSON.stringify(engagementStats) }),
        ...(automationRecords !== undefined && { automationRecords: JSON.stringify(automationRecords) }),
        ...(networkingSessions !== undefined && { networkingSessions: JSON.stringify(networkingSessions) }),
        ...(importRecords !== undefined && { importRecords: JSON.stringify(importRecords) }),
        ...(leads !== undefined && { leads: JSON.stringify(leads) }),
        lastSyncedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, message: 'Analytics synced successfully' });
  } catch (error: any) {
    console.error('Analytics sync error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
