import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractToken } from '@/lib/auth';
import { userService } from '@/lib/user-service';
import { limitService } from '@/lib/limit-service';

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

    // Get usage stats
    const usageStats = await limitService.getUsageStats(user.id);
    const monthlyUsage = (usageStats?.usage as any) || {};

    // Calculate period-based engagements from monthly usage
    const engagements = {
      total: (monthlyUsage.comments || 0) + (monthlyUsage.likes || 0) + (monthlyUsage.shares || 0) + (monthlyUsage.follows || 0),
      comments: monthlyUsage.comments || 0,
      likes: monthlyUsage.likes || 0,
      shares: monthlyUsage.shares || 0,
      follows: monthlyUsage.follows || 0,
      connections: monthlyUsage.connections || 0,
    };

    // These would normally come from extension local storage synced to backend
    // For now return empty arrays that the extension can populate
    const automationHistory: any[] = [];
    const networkingHistory: any[] = [];
    const importHistory: any[] = [];
    const leads: any[] = [];

    return NextResponse.json({
      success: true,
      period,
      engagements,
      automationHistory,
      networkingHistory,
      importHistory,
      leads,
    });
  } catch (error: any) {
    console.error('Get analytics error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
