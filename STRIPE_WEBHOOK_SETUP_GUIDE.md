# 🔐 Stripe Webhook Setup Guide

## Complete Step-by-Step Instructions

---

## ❓ YOUR QUESTIONS ANSWERED

### **Q1: Is it necessary to add Stripe webhook secret in .env?**
**A: YES, absolutely required!**

The webhook secret is how your backend verifies that webhook requests are actually coming from Stripe and not from a malicious attacker. Without it, anyone could send fake payment notifications to your API.

### **Q2: Is it from Stripe account?**
**A: YES, you get it from your Stripe Dashboard**

When you create a webhook endpoint in Stripe, Stripe generates a unique signing secret (starts with `whsec_...`). You copy this secret and add it to your `.env` file.

### **Q3: How to configure Stripe webhook?**
**A: Follow the steps below** ⬇️

### **Q4: Do we have to create each plan new webhook?**
**A: NO! You only need ONE webhook endpoint**

You create **ONE webhook endpoint** in Stripe that points to your backend API. This single endpoint handles ALL plans and ALL payment events. You do NOT need separate webhooks for each plan.

**Flow:**
```
Stripe Dashboard
    ↓
Create 1 Webhook Endpoint → https://your-api.vercel.app/api/webhooks/stripe
    ↓
All payment events (for all plans) → This single endpoint
    ↓
Your backend determines which plan based on stripePriceId
```

---

## 🚀 COMPLETE SETUP PROCESS

### **Step 1: Get Your Stripe API Keys**

1. Go to: https://dashboard.stripe.com/
2. Click **Developers** in left sidebar
3. Click **API keys**
4. You'll see two keys:
   - **Publishable key** (starts with `pk_test_...`) - Not needed for backend
   - **Secret key** (starts with `sk_test_...`) - **Copy this!**

5. Add to your `.env` file:
```env
STRIPE_SECRET_KEY="sk_test_51Abc123..."
```

⚠️ **Never commit this to Git!** Add `.env` to `.gitignore`

---

### **Step 2: Deploy Your Backend First**

Before configuring webhooks, deploy your backend so you have a live URL:

```bash
cd backend-api
vercel --prod
```

You'll get a URL like: `https://backend-a4ebwnso8-arwebcrafts-projects-eca5234b.vercel.app`

**Copy this URL** - you'll need it for the webhook!

---

### **Step 3: Create Webhook Endpoint in Stripe**

1. Go to: https://dashboard.stripe.com/
2. Click **Developers** → **Webhooks**
3. Click **Add endpoint** button

4. **Endpoint URL:** Enter your deployed URL + webhook path:
   ```
   https://your-backend-url.vercel.app/api/webhooks/stripe
   ```
   
   Example:
   ```
   https://backend-a4ebwnso8-arwebcrafts-projects-eca5234b.vercel.app/api/webhooks/stripe
   ```

5. **Description:** (Optional) "LinkedIn Automation Payment Webhooks"

6. **Version:** Select latest API version (should match your code, currently `2025-11-17.clover`)

7. **Select events to listen to:**
   Click **Select events** and choose these:

   ✅ **checkout.session.completed** - When customer completes payment
   ✅ **customer.subscription.created** - When subscription starts
   ✅ **customer.subscription.updated** - When subscription changes
   ✅ **customer.subscription.deleted** - When subscription cancels
   ✅ **invoice.payment_succeeded** - When renewal payment succeeds
   ✅ **invoice.payment_failed** - When payment fails

8. Click **Add endpoint**

---

### **Step 4: Get Webhook Signing Secret**

After creating the webhook:

1. You'll see your new webhook in the list
2. Click on it to view details
3. Find **Signing secret** section
4. Click **Reveal** (or **Click to reveal**)
5. Copy the secret (starts with `whsec_...`)

Example: `whsec_1234567890abcdefghijklmnopqrstuvwxyz`

6. Add to your `.env`:
```env
STRIPE_WEBHOOK_SECRET="whsec_1234567890abcdefghijklmnopqrstuvwxyz"
```

---

### **Step 5: Add Environment Variables to Vercel**

Your local `.env` is not deployed. You need to add environment variables to Vercel:

**Option A: Via Vercel Dashboard**
1. Go to: https://vercel.com/
2. Select your project: `backend-api`
3. Click **Settings**
4. Click **Environment Variables**
5. Add these variables:

   **Variable 1:**
   - **Name:** `STRIPE_SECRET_KEY`
   - **Value:** `sk_test_...` (your secret key)
   - **Environment:** ✅ Production, ✅ Preview, ✅ Development

   **Variable 2:**
   - **Name:** `STRIPE_WEBHOOK_SECRET`
   - **Value:** `whsec_...` (your webhook secret)
   - **Environment:** ✅ Production, ✅ Preview, ✅ Development

6. Click **Save**

**Option B: Via CLI**
```bash
cd backend-api
vercel env add STRIPE_SECRET_KEY
# Paste your sk_test_... when prompted
# Select: Production, Preview, Development

vercel env add STRIPE_WEBHOOK_SECRET
# Paste your whsec_... when prompted
# Select: Production, Preview, Development
```

---

### **Step 6: Redeploy**

After adding environment variables, redeploy:

```bash
cd backend-api
vercel --prod
```

---

### **Step 7: Create Stripe Products & Prices**

Now create your actual products in Stripe:

#### **Create Pro Plan Product**

1. Go to: https://dashboard.stripe.com/products
2. Click **Add product**
3. **Product name:** `LinkedIn Automation - Pro Plan`
4. **Description:** `Monthly subscription for Pro features`
5. **Pricing:**
   - **Price:** `29.00` USD
   - **Billing period:** `Monthly`
   - **Pricing model:** `Standard pricing`
6. Click **Save product**

7. **Copy the Price ID** (starts with `price_...`)
   Example: `price_1Abc123DefGhi456Jkl789`

8. **Create Payment Link:**
   - Click **Create payment link** button
   - Configure checkout page settings
   - Click **Create link**
   - Copy the payment link URL
   
   Example: `https://buy.stripe.com/test_abc123def456`

#### **Update Database with Stripe IDs**

Now connect your database plan to Stripe:

**Option A: Via Prisma Studio**
```bash
cd backend-api
npx prisma studio
```

1. Click **Plan** table
2. Find your "Pro" plan
3. Click on it to edit
4. Set `stripePriceId`: `price_1Abc123...` (the Price ID you copied)
5. Set `stripePaymentLink`: `https://buy.stripe.com/test_abc123...`
6. Click **Save**

**Option B: Via Admin API** (if you have admin panel)
```bash
PUT /api/admin/plans/{planId}
{
  "stripePriceId": "price_1Abc123...",
  "stripePaymentLink": "https://buy.stripe.com/test_abc123..."
}
```

---

### **Step 8: Test the Webhook**

#### **Test with Stripe CLI (Recommended)**

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli

2. Login:
```bash
stripe login
```

3. Forward webhooks to your local backend:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

4. In another terminal, trigger a test event:
```bash
stripe trigger checkout.session.completed
```

5. Check your backend logs - you should see the webhook received!

#### **Test with Real Payment (Test Mode)**

1. Get your payment link from Stripe Dashboard
2. Open it in browser
3. Use test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Any ZIP code
4. Complete payment
5. Check Stripe Dashboard → Webhooks → Your endpoint
6. You should see successful webhook deliveries
7. Check your database - user should be upgraded!

---

## 🔐 CRON JOB FOR TRIAL EXPIRY

### **Vercel Cron Configuration** (FREE PLAN COMPATIBLE)

I've created `vercel.json` with cron configuration:

```json
{
  "crons": [
    {
      "path": "/api/cron/check-trial-expiry",
      "schedule": "0 0 * * *"
    }
  ]
}
```

**Schedule:** `0 0 * * *` = Every day at midnight (UTC)

### **What It Does:**
1. Runs automatically every 24 hours
2. Finds users with `trialEndsAt < now()` and `plan.isTrialPlan = true`
3. Downgrades them to Free plan
4. Clears `trialEndsAt`
5. Logs all downgraded users

### **How It Works on Vercel Free Plan:**

✅ **FREE on Vercel Hobby Plan!**
- Vercel allows 1 cron job per project on free plan
- Runs reliably every day
- No additional cost

⚠️ **Security:** The cron endpoint checks for authorization header to prevent abuse.

### **Add CRON_SECRET to Environment Variables:**

1. Generate a random secret:
```bash
# On Linux/Mac:
openssl rand -base64 32

# On Windows PowerShell:
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})

# Or just use any random string:
# Example: "my-super-secret-cron-key-12345"
```

2. Add to Vercel Environment Variables:
   - **Name:** `CRON_SECRET`
   - **Value:** Your generated secret
   - **Environment:** Production

3. Redeploy:
```bash
vercel --prod
```

### **Manual Testing:**

Test the cron endpoint manually:

```bash
curl -X GET https://your-backend-url.vercel.app/api/cron/check-trial-expiry \
  -H "Authorization: Bearer your-cron-secret"
```

---

## 📋 COMPLETE .ENV FILE

Your final `.env` file should have:

```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/database?schema=linkedin_automation"

# JWT
JWT_SECRET="your-jwt-secret-key-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-secret-key-min-32-chars"

# Admin
ADMIN_EMAIL="admin@yourdomain.com"
ADMIN_PASSWORD="your-secure-admin-password"

# Stripe
STRIPE_SECRET_KEY="sk_test_51Abc123..."
STRIPE_WEBHOOK_SECRET="whsec_1234567890abcdefghijklmnopqrstuvwxyz"

# Cron
CRON_SECRET="your-random-secret-for-cron-jobs"

# OpenAI (if using AI features)
OPENAI_API_KEY="sk-proj-..."
```

---

## ✅ VERIFICATION CHECKLIST

After setup, verify everything works:

### **Environment Variables**
- [ ] `STRIPE_SECRET_KEY` added to Vercel
- [ ] `STRIPE_WEBHOOK_SECRET` added to Vercel
- [ ] `CRON_SECRET` added to Vercel
- [ ] Redeployed after adding env vars

### **Database**
- [ ] Migration ran successfully: `npx prisma migrate dev`
- [ ] Prisma Client generated: `npx prisma generate`
- [ ] Free plan exists with `isDefaultFreePlan = true`
- [ ] Pro Trial plan exists with `isTrialPlan = true`
- [ ] Pro plan exists with correct `stripePriceId` and `stripePaymentLink`

### **Stripe**
- [ ] Webhook endpoint created in Stripe Dashboard
- [ ] Webhook URL points to: `https://your-api.vercel.app/api/webhooks/stripe`
- [ ] All 6 events selected (checkout, subscription, invoice)
- [ ] Webhook signing secret copied to `.env`
- [ ] Product created for Pro plan
- [ ] Price created ($29/month recurring)
- [ ] Payment link created
- [ ] Price ID added to database plan

### **Vercel**
- [ ] `vercel.json` created with cron configuration
- [ ] Cron endpoint deployed: `/api/cron/check-trial-expiry`
- [ ] Backend deployed successfully: `vercel --prod`

### **Testing**
- [ ] New user signup → Gets Pro Trial plan
- [ ] Pro Trial has `trialEndsAt` 3 days from now
- [ ] Test payment with `4242 4242 4242 4242` → User upgraded
- [ ] Webhook appears in Stripe Dashboard as successful
- [ ] Cron endpoint responds to manual test
- [ ] Check Vercel logs for cron execution (after 24 hours)

---

## 🐛 TROUBLESHOOTING

### **Webhook Not Receiving Events**

**Problem:** Stripe sends webhook but your API doesn't receive it.

**Solutions:**
1. Check webhook URL is correct in Stripe Dashboard
2. Verify endpoint is deployed: `https://your-api.vercel.app/api/webhooks/stripe`
3. Check Vercel logs: `vercel logs --prod`
4. Test webhook signature verification is working

### **Signature Verification Failed**

**Problem:** `Webhook signature verification failed`

**Solutions:**
1. Verify `STRIPE_WEBHOOK_SECRET` is correct in Vercel env vars
2. Ensure you copied the secret from the correct webhook endpoint
3. Check you're using the signing secret, not the webhook ID
4. Redeploy after adding/updating env var

### **User Not Upgraded After Payment**

**Problem:** Payment succeeds but user stays on trial/free plan.

**Solutions:**
1. Check Stripe Dashboard → Webhooks → See if event was delivered
2. Look for errors in webhook delivery attempts
3. Verify `stripePriceId` in database matches Stripe Price ID
4. Check Vercel function logs for errors
5. Ensure user email in Stripe matches database email

### **Cron Not Running**

**Problem:** Trial users not being downgraded.

**Solutions:**
1. Verify `vercel.json` is in root of backend-api folder
2. Check Vercel Dashboard → Project → Settings → Cron
3. Manually trigger: `curl` the endpoint with `Authorization` header
4. Check Vercel logs after 24 hours
5. Ensure `CRON_SECRET` env var is set

---

## 🔄 WORKFLOW SUMMARY

### **New User Signup Flow:**
```
1. User registers
2. Backend assigns Pro Trial plan (3 days)
3. User gets full Pro features immediately
4. After 3 days, cron job downgrades to Free
```

### **Payment Flow:**
```
1. User clicks payment link (from your extension/website)
2. Stripe checkout page opens
3. User enters card: 4242 4242 4242 4242 (test) or real card (production)
4. Payment succeeds
5. Stripe sends webhook: checkout.session.completed
6. Your backend receives webhook
7. Backend verifies signature
8. Backend finds plan by stripePriceId
9. Backend upgrades user to that plan
10. Backend clears trialEndsAt
11. User now has Pro features
```

### **Subscription Cancel Flow:**
```
1. User cancels subscription in Stripe
2. Stripe sends webhook: customer.subscription.deleted
3. Backend receives webhook
4. Backend downgrades user to Free plan
5. User loses Pro features
```

---

## 🎉 YOU'RE DONE!

Your complete billing system is now live with:
- ✅ Automatic trial assignment
- ✅ Automatic trial expiry
- ✅ Stripe payment integration
- ✅ Automatic plan upgrades
- ✅ Automatic plan downgrades
- ✅ One webhook handles everything
- ✅ Free Vercel cron job

**Start monetizing! 💰**
