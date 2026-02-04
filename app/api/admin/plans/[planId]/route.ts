import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

// Update plan (admin only)
async function handlePut(
  request: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    const data = await request.json();

    const plan = await prisma.plan.update({
      where: { id: params.planId },
      data: {
        name: data.name,
        price: data.price,
        yearlyPrice: data.yearlyPrice ?? null,
        stripePaymentLink: data.stripePaymentLink,
        stripeYearlyPaymentLink: data.stripeYearlyPaymentLink ?? null,
        stripePriceId: data.stripePriceId,
        stripeYearlyPriceId: data.stripeYearlyPriceId ?? null,
        isTrialPlan: data.isTrialPlan ?? false,
        isDefaultFreePlan: data.isDefaultFreePlan ?? false,
        // Lifetime deal fields - THIS WAS MISSING!
        isLifetime: data.isLifetime ?? false,
        lifetimeMaxSpots: data.lifetimeMaxSpots ?? 0,
        lifetimeSoldSpots: data.lifetimeSoldSpots ?? 0,
        trialDurationDays: data.trialDurationDays ?? 7,
        monthlyImportCredits: data.monthlyImportCredits ?? 100,
        monthlyComments: data.monthlyComments ?? 0,
        monthlyLikes: data.monthlyLikes ?? 0,
        monthlyShares: data.monthlyShares ?? 0,
        monthlyFollows: data.monthlyFollows ?? 0,
        monthlyConnections: data.monthlyConnections ?? 0,
        aiPostsPerMonth: data.aiPostsPerMonth ?? 0,
        aiCommentsPerMonth: data.aiCommentsPerMonth ?? 0,
        aiTopicLinesPerMonth: data.aiTopicLinesPerMonth ?? 0,
        allowAiPostGeneration: data.allowAiPostGeneration ?? true,
        allowAiCommentGeneration: data.allowAiCommentGeneration ?? true,
        allowAiTopicLines: data.allowAiTopicLines ?? true,
        allowPostScheduling: data.allowPostScheduling ?? true,
        allowAutomation: data.allowAutomation ?? true,
        allowAutomationScheduling: data.allowAutomationScheduling ?? true,
        allowNetworking: data.allowNetworking ?? true,
        allowNetworkScheduling: data.allowNetworkScheduling ?? true,
        allowCsvExport: data.allowCsvExport ?? true,
        allowImportProfiles: data.allowImportProfiles ?? true,
      },
    });

    return NextResponse.json({
      success: true,
      plan,
    });
  } catch (error: any) {
    console.error('Update plan error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete plan (admin only)
async function handleDelete(
  request: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    // Check if any users are using this plan
    const usersCount = await prisma.user.count({
      where: { planId: params.planId },
    });

    if (usersCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete plan. ${usersCount} users are currently using this plan.`,
        },
        { status: 400 }
      );
    }

    await prisma.plan.delete({
      where: { id: params.planId },
    });

    return NextResponse.json({
      success: true,
      message: 'Plan deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete plan error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export const PUT = requireAdmin(handlePut);
export const DELETE = requireAdmin(handleDelete);
