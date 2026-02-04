import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { schedulePaidCustomerSequence } from '@/lib/email-automation/scheduler';

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
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('❌ No Stripe signature found');
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('❌ STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      );
    }

    const stripe = getStripe();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`❌ Webhook signature verification failed: ${err.message}`);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log('✅ Stripe webhook received:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(subscription);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleTrialWillEnd(subscription);
        break;
      }

      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Handle successful checkout
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('💳 Processing checkout completion for session:', session.id);

  const customerEmail = session.customer_email || session.customer_details?.email;
  const stripeCustomerId = session.customer as string;
  const amountPaid = (session.amount_total || 0) / 100; // Convert from cents
  const isTrialCheckout = session.metadata?.isTrialCheckout === 'true';

  if (!customerEmail) {
    console.error('❌ No customer email found in session');
    return;
  }

  try {
    // Get plan from metadata first (more reliable)
    let plan = null;
    const planIdFromMetadata = session.metadata?.planId;
    
    if (planIdFromMetadata) {
      plan = await prisma.plan.findUnique({
        where: { id: planIdFromMetadata }
      });
    }

    // Fall back to price ID lookup
    if (!plan) {
      const stripe = getStripe();
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      const stripePriceId = lineItems.data?.[0]?.price?.id;
      
      if (stripePriceId) {
        plan = await prisma.plan.findFirst({ where: { stripePriceId } });
        if (!plan) {
          plan = await prisma.plan.findFirst({ where: { stripeYearlyPriceId: stripePriceId } });
        }
      }
    }

    if (!plan) {
      console.error(`❌ No plan found for session: ${session.id}`);
      return;
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { email: customerEmail },
      select: { hasPaid: true, totalPaid: true }
    });

    // Calculate trial end date if this is a trial checkout
    let trialEndsAt = null;
    if (isTrialCheckout && plan.trialDurationDays > 0) {
      trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + plan.trialDurationDays);
      console.log(`📅 Trial started - ends at: ${trialEndsAt.toISOString()}`);
    }

    // For trial checkouts, don't mark as paid yet (payment happens after trial)
    const hasPaid = isTrialCheckout ? (currentUser?.hasPaid || false) : true;
    const totalPaid = isTrialCheckout ? (currentUser?.totalPaid || 0) : (currentUser?.totalPaid || 0) + amountPaid;

    // Update user with new plan and payment tracking
    const user = await prisma.user.update({
      where: { email: customerEmail },
      data: {
        planId: plan.id,
        stripeCustomerId,
        trialEndsAt: trialEndsAt,
        hasPaid: hasPaid,
        totalPaid: totalPaid
      }
    });

    if (isTrialCheckout) {
      console.log(`✅ User ${user.email} started trial for ${plan.name} plan (${plan.trialDurationDays} days)`);
    } else {
      console.log(`✅ User ${user.email} upgraded to ${plan.name} plan`);
      console.log(`💰 Payment tracked: $${amountPaid} (Total: $${user.totalPaid})`);
    }
    
    // Log referral info if this user was referred
    if (user.referredById) {
      console.log(`🎁 This is a referred user! Referrer ID: ${user.referredById}`);
    }

    // Schedule paid customer email sequence
    const billingType = plan.name?.toLowerCase().includes('lifetime') ? 'Lifetime' : 'Monthly';
    schedulePaidCustomerSequence(
      user.id,
      user.email,
      user.name || '',
      plan.name || 'Pro',
      billingType
    ).catch(err => {
      console.error('Failed to schedule paid customer emails:', err);
    });
  } catch (error) {
    console.error('❌ Error updating user plan after checkout:', error);
  }
}

// Handle subscription created
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('📝 Processing subscription creation:', subscription.id);

  const stripeCustomerId = subscription.customer as string;
  const stripePriceId = subscription.items.data[0]?.price?.id;

  try {
    // Check both monthly and yearly price IDs
    let plan = await prisma.plan.findFirst({
      where: { stripePriceId }
    });
    
    if (!plan && stripePriceId) {
      plan = await prisma.plan.findFirst({
        where: { stripeYearlyPriceId: stripePriceId }
      });
    }

    if (!plan) {
      console.error(`❌ No plan found for Stripe Price ID: ${stripePriceId}`);
      return;
    }

    const user = await prisma.user.update({
      where: { stripeCustomerId },
      data: {
        planId: plan.id,
        trialEndsAt: null,
      }
    });

    console.log(`✅ Subscription created for ${user.email} - ${plan.name}`);
  } catch (error) {
    console.error('❌ Error handling subscription creation:', error);
  }
}

// Handle subscription updated
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('🔄 Processing subscription update:', subscription.id);

  const stripeCustomerId = subscription.customer as string;
  const stripePriceId = subscription.items.data[0]?.price?.id;

  try {
    // Check both monthly and yearly price IDs
    let plan = await prisma.plan.findFirst({
      where: { stripePriceId }
    });
    
    if (!plan && stripePriceId) {
      plan = await prisma.plan.findFirst({
        where: { stripeYearlyPriceId: stripePriceId }
      });
    }

    if (!plan) {
      console.error(`❌ No plan found for Stripe Price ID: ${stripePriceId}`);
      return;
    }

    const user = await prisma.user.update({
      where: { stripeCustomerId },
      data: {
        planId: plan.id,
      }
    });

    console.log(`✅ Subscription updated for ${user.email} - ${plan.name}`);
  } catch (error) {
    console.error('❌ Error handling subscription update:', error);
  }
}

// Handle subscription canceled
async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  console.log('❌ Processing subscription cancellation:', subscription.id);

  const stripeCustomerId = subscription.customer as string;

  try {
    // Downgrade to free plan
    const freePlan = await prisma.plan.findFirst({
      where: { isDefaultFreePlan: true }
    });

    if (!freePlan) {
      console.error('❌ No free plan found for downgrade');
      return;
    }

    const user = await prisma.user.update({
      where: { stripeCustomerId },
      data: {
        planId: freePlan.id,
      }
    });

    console.log(`✅ User ${user.email} downgraded to Free plan`);
  } catch (error) {
    console.error('❌ Error handling subscription cancellation:', error);
  }
}

// Handle successful payment
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('💰 Payment succeeded for invoice:', invoice.id);
  // Payment tracking can be added here if needed
}

// Handle failed payment - downgrade to free plan after trial if payment fails
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('⚠️ Payment failed for invoice:', invoice.id);
  
  const stripeCustomerId = invoice.customer as string;
  
  try {
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId },
      include: { plan: true }
    });

    if (user) {
      console.log(`⚠️ Payment failed for user: ${user.email}`);
      
      // Check if user is on trial and trial has ended
      const now = new Date();
      const trialEnded = user.trialEndsAt && new Date(user.trialEndsAt) < now;
      
      // If trial ended or this is a recurring payment failure, downgrade to free plan
      if (trialEnded || !user.hasPaid) {
        const freePlan = await prisma.plan.findFirst({
          where: { isDefaultFreePlan: true }
        });

        if (freePlan) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              planId: freePlan.id,
              trialEndsAt: null
            }
          });
          console.log(`✅ User ${user.email} downgraded to Free plan due to payment failure`);
        }
      }
      
      // TODO: Send payment failed email notification
    }
  } catch (error) {
    console.error('❌ Error handling payment failure:', error);
  }
}

// Handle trial ending soon (3 days before trial ends)
async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  console.log('⏰ Trial ending soon for subscription:', subscription.id);
  
  const stripeCustomerId = subscription.customer as string;
  const trialEnd = subscription.trial_end;
  
  try {
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId }
    });

    if (user && trialEnd) {
      const trialEndDate = new Date(trialEnd * 1000);
      console.log(`⏰ Trial ending for ${user.email} on ${trialEndDate.toISOString()}`);
      
      // Update user's trial end date
      await prisma.user.update({
        where: { id: user.id },
        data: {
          trialEndsAt: trialEndDate
        }
      });
      
      // TODO: Send trial ending email notification
      console.log(`📧 Should send trial ending email to ${user.email}`);
    }
  } catch (error) {
    console.error('❌ Error handling trial will end:', error);
  }
}
