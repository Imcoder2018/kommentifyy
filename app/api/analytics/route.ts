import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractToken } from '@/lib/auth';
import { userService } from '@/lib/user-service';
import { limitService } from '@/lib/limit-service';
import { prisma } from '@/lib/prisma';

/**
 * Calculate the date range for a given period string.
 * Returns an array of YYYY-MM-DD date keys within the period.
 */
function getDateKeysForPeriod(period: string): string[] {
  const now = new Date();
  let days = 1;
  switch (period) {
    case 'today': days = 1; break;
    case 'yesterday': days = 1; break;
    case '3days': days = 3; break;
    case '7days': days = 7; break;
    case '30days': days = 30; break;
    case '90days': days = 90; break;
    default: days = 1;
  }

  const keys: string[] = [];
  const startOffset = period === 'yesterday' ? 1 : 0;
  const endOffset = period === 'yesterday' ? 1 : days - 1;

  for (let i = startOffset; i <= endOffset; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    keys.push(d.toISOString().split('T')[0]);
  }
  return keys;
}

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'today';

    // Fetch synced analytics from DB
    const syncData = await prisma.userAnalyticsSync.findUnique({
      where: { userId: user.id },
    });

    // Parse synced engagement stats (contains dailyStats, totalComments, etc.)
    let engagementStatsRaw: any = {};
    try { engagementStatsRaw = syncData?.engagementStats ? JSON.parse(syncData.engagementStats) : {}; } catch { engagementStatsRaw = {}; }

    // Calculate period-based engagements from synced dailyStats
    const dateKeys = getDateKeysForPeriod(period);
    const dailyStats = engagementStatsRaw.dailyStats || {};
    let comments = 0, likes = 0, shares = 0, follows = 0;

    for (const key of dateKeys) {
      const day = dailyStats[key];
      if (day) {
        comments += day.comments || 0;
        likes += day.likes || 0;
        shares += day.shares || 0;
        follows += day.follows || 0;
      }
    }

    // If no synced data for the period, fall back to monthly usage from limitService
    if (comments === 0 && likes === 0 && shares === 0 && follows === 0) {
      const usageStats = await limitService.getUsageStats(user.id);
      const monthlyUsage = (usageStats?.usage as any) || {};
      comments = monthlyUsage.comments || 0;
      likes = monthlyUsage.likes || 0;
      shares = monthlyUsage.shares || 0;
      follows = monthlyUsage.follows || 0;
    }

    const engagements = {
      total: comments + likes + shares + follows,
      comments,
      likes,
      shares,
      follows,
    };

    // Parse synced history data
    let automationHistory: any[] = [];
    let networkingHistory: any[] = [];
    let importHistory: any[] = [];
    let leads: any[] = [];

    try { automationHistory = syncData?.automationRecords ? JSON.parse(syncData.automationRecords) : []; } catch { automationHistory = []; }
    try { networkingHistory = syncData?.networkingSessions ? JSON.parse(syncData.networkingSessions) : []; } catch { networkingHistory = []; }
    try { importHistory = syncData?.importRecords ? JSON.parse(syncData.importRecords) : []; } catch { importHistory = []; }
    try { leads = syncData?.leads ? JSON.parse(syncData.leads) : []; } catch { leads = []; }

    return NextResponse.json({
      success: true,
      period,
      engagements,
      automationHistory,
      networkingHistory,
      importHistory,
      leads,
      lastSyncedAt: syncData?.lastSyncedAt || null,
    });
  } catch (error: any) {
    console.error('Get analytics error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
