import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractToken } from '@/lib/auth';
import { userService } from '@/lib/user-service';
import { limitService } from '@/lib/limit-service';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = extractToken(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);

    // Get user with plan using UserService
    const user = await userService.findUserByEmail(payload.email);

    if (!user || !user.plan) {
      return NextResponse.json(
        { success: false, error: 'User not found or no plan assigned' },
        { status: 404 }
      );
    }

    // Get actual MONTHLY usage stats from limit service
    const usageStats = await limitService.getUsageStats(user.id);
    const monthlyUsage = usageStats?.usage as any || {};
    
    return NextResponse.json({
      success: true,
      usage: {
        comments: monthlyUsage.comments || 0,
        likes: monthlyUsage.likes || 0,
        shares: monthlyUsage.shares || 0,
        follows: monthlyUsage.follows || 0,
        connections: monthlyUsage.connections || 0,
        importProfiles: monthlyUsage.importProfiles || 0,
        aiPosts: monthlyUsage.aiPosts || 0,
        aiComments: monthlyUsage.aiComments || 0,
        bonusAiComments: monthlyUsage.bonusAiComments || 0,
        aiTopicLines: monthlyUsage.aiTopicLines || 0,
      },
      limits: {
        comments: (user.plan as any).monthlyComments ?? 0,
        likes: (user.plan as any).monthlyLikes ?? 0,
        shares: (user.plan as any).monthlyShares ?? 0,
        follows: (user.plan as any).monthlyFollows ?? 0,
        connections: (user.plan as any).monthlyConnections ?? 0,
        importProfiles: (user.plan as any).monthlyImportCredits ?? 0,
        aiPosts: (user.plan as any).aiPostsPerMonth ?? 0,
        aiComments: (user.plan as any).aiCommentsPerMonth ?? 0,
        aiTopicLines: (user.plan as any).aiTopicLinesPerMonth ?? 0,
      },
      features: {
        aiPostGeneration: user.plan.allowAiPostGeneration,
        aiCommentGeneration: user.plan.allowAiCommentGeneration,
        aiTopicLines: (user.plan as any).allowAiTopicLines || true,
        postScheduling: user.plan.allowPostScheduling,
        automation: user.plan.allowAutomation,
        automationScheduling: user.plan.allowAutomationScheduling,
        networking: user.plan.allowNetworking,
        networkScheduling: user.plan.allowNetworkScheduling,
        csvExport: user.plan.allowCsvExport,
        importProfiles: (user.plan as any).allowImportProfiles || false,
      },
    });
  } catch (error: any) {
    console.error('Get usage error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
