import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

// Initialize Stripe lazily to avoid build-time errors
function getStripe() {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(apiKey, {
    apiVersion: '2025-11-17.clover',
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, billingPeriod, userEmail, successUrl, cancelUrl } = body;

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    // Get the plan from database
    const plan = await prisma.plan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    // Determine which price ID to use (monthly or yearly)
    const isYearly = billingPeriod === 'yearly';
    const stripePriceId = isYearly 
      ? (plan.stripeYearlyPriceId || plan.stripePriceId)
      : plan.stripePriceId;

    if (!stripePriceId) {
      return NextResponse.json(
        { error: 'Stripe price not configured for this plan' },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    // Get trial duration from plan (default to 7 days if not set)
    const trialDays = plan.trialDurationDays || 7;

    // Check if this is a lifetime deal (no trial for lifetime)
    const isLifetime = plan.isLifetime || plan.name?.toLowerCase().includes('lifetime');

    // Create Stripe Checkout Session
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode: isLifetime ? 'payment' : 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://kommentify.com'}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://kommentify.com'}/plans?cancelled=true`,
      // Pre-fill email if provided
      ...(userEmail && { customer_email: userEmail }),
      // Allow promotion codes
      allow_promotion_codes: true,
      // Billing address collection
      billing_address_collection: 'auto',
      // Metadata for webhook processing
      metadata: {
        planId: plan.id,
        planName: plan.name,
        billingPeriod: isLifetime ? 'lifetime' : (isYearly ? 'yearly' : 'monthly'),
        isTrialCheckout: (!isLifetime && trialDays > 0) ? 'true' : 'false',
        isLifetime: isLifetime ? 'true' : 'false',
      },
    };

    // Add subscription-specific options (trial + payment method collection)
    if (!isLifetime) {
      // Only add payment_method_collection for subscriptions (not one-time payments)
      sessionConfig.payment_method_collection = 'always';
      
      if (trialDays > 0) {
        sessionConfig.subscription_data = {
          trial_period_days: trialDays,
          metadata: {
            planId: plan.id,
            planName: plan.name,
          },
        };
      }
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log(`✅ Checkout session created: ${session.id} for plan: ${plan.name}`);
    if (!isLifetime && trialDays > 0) {
      console.log(`📅 Trial period: ${trialDays} days`);
    }

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      trialDays: !isLifetime ? trialDays : 0,
    });

  } catch (error: any) {
    console.error('❌ Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

// GET endpoint to check session status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    });

    return NextResponse.json({
      success: true,
      status: session.status,
      paymentStatus: session.payment_status,
      customerEmail: session.customer_email || (session.customer as Stripe.Customer)?.email,
      subscription: session.subscription ? {
        id: (session.subscription as Stripe.Subscription).id,
        status: (session.subscription as Stripe.Subscription).status,
        trialEnd: (session.subscription as Stripe.Subscription).trial_end,
      } : null,
    });

  } catch (error: any) {
    console.error('❌ Error retrieving checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve session' },
      { status: 500 }
    );
  }
}
