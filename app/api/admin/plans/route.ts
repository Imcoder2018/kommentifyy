import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

// Get all plans (admin only)
async function handleGet(request: NextRequest) {
  try {
    const plans = await prisma.plan.findMany({
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: {
        price: 'asc',
      },
    });

    console.log('Raw admin plans from database:', JSON.stringify(plans, null, 2));

    // Return raw database data for admin portal (no formatting needed)
    return NextResponse.json({
      success: true,
      plans,
    });
  } catch (error: any) {
    console.log('Database error, using fallback plans:', error);

    // Fallback plans data when database is not available (raw database format)
    const fallbackPlans = [
      {
        id: 'plan-1',
        name: 'Free',
        price: 0,
        stripePaymentLink: null,
        monthlyComments: 150,
        monthlyLikes: 300,
        monthlyShares: 60,
        monthlyFollows: 150,
        monthlyConnections: 300,
        aiPostsPerMonth: 0,
        aiCommentsPerMonth: 0,
        aiTopicLinesPerMonth: 0,
        allowAiTopicLines: false,
        allowAiPostGeneration: false,
        allowAiCommentGeneration: false,
        allowPostScheduling: false,
        allowAutomation: true,
        allowAutomationScheduling: false,
        allowNetworking: false,
        allowNetworkScheduling: false,
        allowCsvExport: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { users: 120 }
      },
      {
        id: 'plan-2',
        name: 'Pro',
        price: 29.99,
        stripePaymentLink: 'https://buy.stripe.com/test_pro_plan',
        monthlyComments: 1500,
        monthlyLikes: 3000,
        monthlyShares: 750,
        monthlyFollows: 1500,
        monthlyConnections: 900,
        aiPostsPerMonth: 150,
        aiCommentsPerMonth: 600,
        aiTopicLinesPerMonth: 150,
        allowAiTopicLines: true,
        allowAiPostGeneration: true,
        allowAiCommentGeneration: true,
        allowPostScheduling: true,
        allowAutomation: true,
        allowAutomationScheduling: true,
        allowNetworking: true,
        allowNetworkScheduling: false,
        allowCsvExport: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { users: 30 }
      }
    ];

    return NextResponse.json({
      success: true,
      plans: fallbackPlans,
      fallback: true,
    });
  }
}

// Create new plan (admin only)
async function handlePost(request: NextRequest) {
  try {
    const data = await request.json();

    const plan = await prisma.plan.create({
      data: {
        name: data.name,
        price: data.price,
        yearlyPrice: data.yearlyPrice || null,
        stripePaymentLink: data.stripePaymentLink || null,
        stripeYearlyPaymentLink: data.stripeYearlyPaymentLink || null,
        stripePriceId: data.stripePriceId || null,
        stripeYearlyPriceId: data.stripeYearlyPriceId || null,
        isTrialPlan: data.isTrialPlan ?? false,
        isDefaultFreePlan: data.isDefaultFreePlan ?? false,
        // Lifetime deal fields
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
    console.error('Create plan error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = requireAdmin(handleGet);
export const POST = requireAdmin(handlePost);
