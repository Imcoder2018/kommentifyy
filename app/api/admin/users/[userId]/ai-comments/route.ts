import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

// Add AI comments to user (admin only)
async function handlePost(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { additionalAiComments } = await request.json();

    if (typeof additionalAiComments !== 'number' || additionalAiComments < 1) {
      return NextResponse.json(
        { success: false, error: 'Additional AI comments must be a positive number' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      include: { plan: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get current month's usage
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    let apiUsage = await prisma.apiUsage.findUnique({
      where: {
        userId_date: {
          userId: params.userId,
          date: startOfMonth,
        },
      },
    });

    if (!apiUsage) {
      // Create new usage record for this month
      apiUsage = await prisma.apiUsage.create({
        data: {
          userId: params.userId,
          date: startOfMonth,
          aiComments: 0,
          bonusAiComments: 0,
        },
      });
    }

    // Add bonus AI comments to user's account
    const updatedApiUsage = await prisma.apiUsage.update({
      where: { id: apiUsage.id },
      data: {
        bonusAiComments: apiUsage.bonusAiComments + additionalAiComments,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully added ${additionalAiComments} AI comments to user`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        availableAiComments: (user.plan?.aiCommentsPerMonth || 0) - updatedApiUsage.aiComments + updatedApiUsage.bonusAiComments,
      },
    });
  } catch (error: any) {
    console.error('Add AI comments error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = requireAdmin(handlePost);
