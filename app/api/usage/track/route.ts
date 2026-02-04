import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
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
    const { actionType } = await request.json();

    if (!actionType) {
      return NextResponse.json(
        { success: false, error: 'Action type is required' },
        { status: 400 }
      );
    }

    // Validate action type
    const validActions = ['comment', 'like', 'share', 'follow', 'connection', 'importProfile'];
    if (!validActions.includes(actionType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action type' },
        { status: 400 }
      );
    }

    // Get user and plan
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { plan: true },
    });

    if (!user || !user.plan) {
      return NextResponse.json(
        { success: false, error: 'User not found or no plan assigned' },
        { status: 404 }
      );
    }

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get or create usage record
    const usage = await prisma.apiUsage.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
    });

    // Check limits before incrementing
    const limits: Record<string, number> = {
      comment: (user.plan as any).monthlyComments,
      like: (user.plan as any).monthlyLikes,
      share: (user.plan as any).monthlyShares,
      follow: (user.plan as any).monthlyFollows,
      connection: (user.plan as any).monthlyConnections,
      importProfile: (user.plan as any).monthlyImportCredits,
    };

    const currentUsage: Record<string, number> = {
      comment: usage?.comments || 0,
      like: usage?.likes || 0,
      share: usage?.shares || 0,
      follow: usage?.follows || 0,
      connection: usage?.connections || 0,
      importProfile: (usage as any)?.importProfiles || 0,
    };

    if (currentUsage[actionType] >= limits[actionType]) {
      return NextResponse.json(
        {
          success: false,
          error: `Monthly ${actionType} limit reached (${limits[actionType]}/month)`,
          limitReached: true,
        },
        { status: 429 }
      );
    }

    // Map action type to database field
    const fieldMap: Record<string, string> = {
      comment: 'comments',
      like: 'likes',
      share: 'shares',
      follow: 'follows',
      connection: 'connections',
      importProfile: 'importProfiles',
    };

    // Update usage
    await prisma.apiUsage.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
      update: {
        [fieldMap[actionType]]: {
          increment: 1,
        },
      },
      create: {
        userId: user.id,
        date: today,
        [fieldMap[actionType]]: 1,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        type: actionType,
        metadata: JSON.stringify({ timestamp: new Date().toISOString() }),
      },
    });

    // Get updated usage
    const updatedUsage = await prisma.apiUsage.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
    });

    return NextResponse.json({
      success: true,
      usage: {
        comments: updatedUsage?.comments || 0,
        likes: updatedUsage?.likes || 0,
        shares: updatedUsage?.shares || 0,
        follows: updatedUsage?.follows || 0,
        connections: updatedUsage?.connections || 0,
        importProfiles: (updatedUsage as any)?.importProfiles || 0,
      },
      limits: {
        comments: (user.plan as any).monthlyComments,
        likes: (user.plan as any).monthlyLikes,
        shares: (user.plan as any).monthlyShares,
        follows: (user.plan as any).monthlyFollows,
        connections: (user.plan as any).monthlyConnections,
        importProfiles: (user.plan as any).monthlyImportCredits,
      },
    });
  } catch (error: any) {
    console.error('Track usage error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
