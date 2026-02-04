import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Get all plans (public endpoint for displaying pricing)
export async function GET(request: NextRequest) {
  console.log('📋 Plans API called at:', new Date().toISOString());
  
  try {
    // Force fresh database query - no caching
    const plans = await prisma.plan.findMany({
      orderBy: {
        price: 'asc',
      },
    });

    console.log('✅ Database plans found:', plans.length);
    console.log('📊 Plan names:', plans.map(p => p.name).join(', '));

    // Format plans for the extension
    const formattedPlans = plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      price: plan.price,
      yearlyPrice: (plan as any).yearlyPrice || null,
      period: (plan as any).isLifetime ? 'lifetime' : 'monthly',
      isLifetime: (plan as any).isLifetime || false,
      isTrialPlan: plan.isTrialPlan || false,
      isDefaultFreePlan: plan.isDefaultFreePlan || false,
      trialDurationDays: plan.trialDurationDays || 7,
      lifetimeMaxSpots: (plan as any).lifetimeMaxSpots || 0,
      lifetimeSoldSpots: (plan as any).lifetimeSoldSpots || 0,
      lifetimeSpotsRemaining: (plan as any).lifetimeMaxSpots ? (plan as any).lifetimeMaxSpots - ((plan as any).lifetimeSoldSpots || 0) : null,
      lifetimeExpiresAt: (plan as any).lifetimeExpiresAt || null,
      stripeLink: plan.stripePaymentLink,
      stripeYearlyLink: (plan as any).stripeYearlyPaymentLink || null,
      displayOrder: (plan as any).displayOrder || 0,
      limits: {
        monthlyComments: (plan as any).monthlyComments || 0,
        monthlyLikes: (plan as any).monthlyLikes || 0,
        monthlyShares: (plan as any).monthlyShares || 0,
        monthlyFollows: (plan as any).monthlyFollows || 0,
        monthlyConnections: (plan as any).monthlyConnections || 0,
        aiPostsPerMonth: (plan as any).aiPostsPerMonth || 0,
        aiCommentsPerMonth: (plan as any).aiCommentsPerMonth || 0,
        aiTopicLinesPerMonth: (plan as any).aiTopicLinesPerMonth || 0
      },
      monthlyImportCredits: (plan as any).monthlyImportCredits || 100,
      features: {
        autoLike: (plan as any).allowGeneralAutomation !== false,
        autoComment: plan.allowAiCommentGeneration || false,
        autoFollow: plan.allowNetworking || false,
        aiContent: plan.allowAiPostGeneration || false,
        aiTopicLines: (plan as any).allowAiTopicLines !== false,
        scheduling: plan.allowPostScheduling || false,
        automationScheduling: (plan as any).allowAutomationScheduling || false,
        networkScheduling: (plan as any).allowNetworkScheduling || false,
        analytics: plan.allowCsvExport || false,
        importProfiles: (plan as any).allowImportProfiles !== false
      }
    }));

    // Separate regular plans from lifetime deals (check both isLifetime flag AND name containing "lifetime" or "life time")
    const isLifetimeDeal = (p: typeof formattedPlans[0]) => {
      const nameLower = p.name.toLowerCase();
      return p.isLifetime || nameLower.includes('lifetime') || nameLower.includes('life time');
    };
    const regularPlans = formattedPlans.filter(p => !isLifetimeDeal(p));
    const lifetimeDeals = formattedPlans.filter(p => isLifetimeDeal(p));

    console.log('📋 Returning', regularPlans.length, 'regular plans and', lifetimeDeals.length, 'lifetime deals');

    // Return with no-cache headers
    return NextResponse.json({
      success: true,
      plans: regularPlans,
      lifetimeDeals: lifetimeDeals,
      allPlans: formattedPlans,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error: any) {
    console.log('Database error, using fallback plans:', error);

    // Fallback plans data when database is not available
    const fallbackPlans = [
      {
        id: 'plan-free',
        name: 'Free',
        price: 0,
        period: 'monthly',
        stripeLink: null,
        limits: {
          monthlyComments: 150,
          monthlyLikes: 300,
          monthlyShares: 60,
          monthlyFollows: 150,
          aiPostsPerMonth: 0,
          aiCommentsPerMonth: 0,
          aiTopicLinesPerMonth: 0
        },
        monthlyImportCredits: 50,
        features: {
          autoLike: true,
          autoComment: false,
          autoFollow: false,
          aiContent: false,
          aiTopicLines: true,
          scheduling: false,
          analytics: false,
          importProfiles: false
        }
      },
      {
        id: 'plan-starter',
        name: 'Starter',
        price: 9,
        period: 'monthly',
        stripeLink: null,
        limits: {
          monthlyComments: 750,
          monthlyLikes: 1500,
          monthlyShares: 300,
          monthlyFollows: 750,
          aiPostsPerMonth: 60,
          aiCommentsPerMonth: 300,
          aiTopicLinesPerMonth: 150
        },
        monthlyImportCredits: 200,
        features: {
          autoLike: true,
          autoComment: true,
          autoFollow: true,
          aiContent: true,
          aiTopicLines: true,
          scheduling: true,
          analytics: false,
          importProfiles: true
        }
      },
      {
        id: 'plan-pro',
        name: 'Pro',
        price: 29,
        period: 'monthly',
        stripeLink: 'https://buy.stripe.com/test_pro_plan',
        limits: {
          monthlyComments: 3000,
          monthlyLikes: 6000,
          monthlyShares: 1500,
          monthlyFollows: 3000,
          aiPostsPerMonth: 300,
          aiCommentsPerMonth: 1500,
          aiTopicLinesPerMonth: 600
        },
        monthlyImportCredits: 500,
        features: {
          autoLike: true,
          autoComment: true,
          autoFollow: true,
          aiContent: true,
          aiTopicLines: true,
          scheduling: true,
          analytics: true,
          importProfiles: true
        }
      }
    ];

    return NextResponse.json({
      success: true,
      plans: fallbackPlans,
      fallback: true,
    });
  }
}
