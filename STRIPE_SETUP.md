# Stripe Payment Integration Setup Guide

This guide explains how to connect your Stripe account to enable automatic plan upgrades when users pay.

## Overview

The system already has Stripe integration built-in. When properly configured:
1. Users click a payment link on the Plans page
2. They complete payment on Stripe's checkout page
3. Stripe sends a webhook to your server
4. User's plan is automatically upgraded
5. Referral commissions are tracked (if the user was referred)

---

## Step 1: Create a Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Sign up or log in to your account
3. Complete account verification (required for live payments)

---

## Step 2: Get Your API Keys

### From Stripe Dashboard:

1. Go to **Developers** → **API Keys**
2. Copy your keys:
   - **Publishable key**: `pk_live_...` (for production) or `pk_test_...` (for testing)
   - **Secret key**: `sk_live_...` (for production) or `sk_test_...` (for testing)

### Add to Environment Variables:

Add these to your `.env` file (local) and Vercel environment variables (production):

```env
STRIPE_SECRET_KEY=sk_live_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key_here
```

---

## Step 3: Create Products and Prices in Stripe

For each plan in your app:

1. Go to **Products** → **Add Product**
2. Create a product for each plan (e.g., "Starter Plan", "Pro Plan", "Enterprise Plan")
3. Set the pricing (monthly/yearly)
4. After creating, copy the **Price ID** (starts with `price_...`)

---

## Step 4: Create Payment Links

For each plan:

1. Go to **Products** → Select your product
2. Click **Create payment link**
3. Configure:
   - **Collect email**: Yes (required to match with user)
   - **Confirmation page**: Redirect to your site (e.g., `https://kommentify.com/dashboard?payment=success`)
4. Copy the payment link URL

---

## Step 5: Add Price IDs and Payment Links to Plans (Admin Portal)

In your Admin Portal (`/admin/plans`):

1. Edit each plan
2. Add the **Stripe Price ID** (e.g., `price_1234567890`)
3. Add the **Stripe Payment Link** (full URL)
4. Save the plan

---

## Step 6: Set Up Webhooks (CRITICAL!)

This is how Stripe notifies your app when a payment is complete.

### In Stripe Dashboard:

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL:
   ```
   https://kommentify.com/api/webhooks/stripe
   ```
4. Select events to listen to:
   - `checkout.session.completed` ✓
   - `customer.subscription.created` ✓
   - `customer.subscription.updated` ✓
   - `customer.subscription.deleted` ✓
   - `invoice.payment_succeeded` ✓
   - `invoice.payment_failed` ✓
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_...`)

### Add Webhook Secret to Environment:

```env
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_signing_secret_here
```

---

## Step 7: Update Vercel Environment Variables

In Vercel Dashboard:

1. Go to your project
2. Click **Settings** → **Environment Variables**
3. Add these variables:

| Variable | Value |
|----------|-------|
| `STRIPE_SECRET_KEY` | `sk_live_...` |
| `STRIPE_PUBLISHABLE_KEY` | `pk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |

4. Redeploy your application

---

## Step 8: Test the Integration

### Using Stripe Test Mode:

1. Use test API keys (start with `sk_test_` and `pk_test_`)
2. Use Stripe test card numbers:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
3. Any future expiry date and any 3-digit CVC

### Test Flow:

1. Create a test user account
2. Go to the Plans page
3. Click on a plan's payment link
4. Complete checkout with test card
5. Check if user's plan was upgraded in the database/dashboard

---

## How Payment Flow Works

```
User clicks "Subscribe" on Plans page
         ↓
Redirected to Stripe Checkout (using Payment Link)
         ↓
User enters payment details
         ↓
Payment successful
         ↓
Stripe sends webhook to /api/webhooks/stripe
         ↓
Webhook handler:
  1. Verifies signature
  2. Finds plan by Stripe Price ID
  3. Updates user's plan in database
  4. Marks user as "paid" for referral tracking
  5. Updates totalPaid amount
         ↓
User is now on the new plan!
```

---

## Referral Commission Tracking

When a referred user makes a payment:

1. The `hasPaid` field is set to `true`
2. The `totalPaid` amount is updated
3. The referrer's commission is calculated automatically
4. Admin can view all commissions in Admin Portal → Referrals

---

## Troubleshooting

### Webhook not receiving events:

1. Check the webhook URL is correct
2. Verify the webhook secret matches
3. Check Vercel logs for errors
4. Ensure the endpoint is accessible (not blocked)

### User plan not updating:

1. Check that the Stripe Price ID matches in your Plan settings
2. Verify the user's email in Stripe matches their account email
3. Check webhook logs in Stripe Dashboard

### Testing locally:

Use Stripe CLI to forward webhooks to localhost:
```bash
stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

---

## Environment Variables Summary

Add these to both `.env` (local) and Vercel:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_xxxxx          # Your Stripe secret key
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx     # Your Stripe publishable key  
STRIPE_WEBHOOK_SECRET=whsec_xxxxx        # Webhook signing secret

# Site URL (for referral links)
NEXT_PUBLIC_SITE_URL=https://kommentify.com
```

---

## Quick Checklist

- [ ] Stripe account created and verified
- [ ] API keys added to environment variables
- [ ] Products and prices created in Stripe
- [ ] Payment links created for each plan
- [ ] Price IDs and payment links added to plans in Admin Portal
- [ ] Webhook endpoint created in Stripe
- [ ] Webhook secret added to environment variables
- [ ] Vercel redeployed with new environment variables
- [ ] Test payment completed successfully

---

## Support

If you encounter issues:
1. Check Stripe Dashboard → Developers → Logs for API errors
2. Check Stripe Dashboard → Developers → Webhooks for webhook delivery status
3. Check Vercel function logs for server-side errors
