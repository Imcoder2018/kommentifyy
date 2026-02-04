# ⚡ Quick Start: Stripe & Cron Setup

## 🎯 ANSWERS TO YOUR QUESTIONS

### ❓ **Is it necessary to add stripe webhook secret in .env?**
✅ **YES** - Required for security. It verifies webhook requests are really from Stripe.

### ❓ **Is it from stripe account?**
✅ **YES** - You get it from Stripe Dashboard when you create the webhook endpoint.

### ❓ **How to configure stripe webhook?**
✅ **See Step 2 below** - One webhook endpoint handles ALL plans.

### ❓ **Do we have to create each plan new webhook?**
✅ **NO** - You create **ONE webhook** that handles **ALL plans** automatically.

---

## 🚀 3-STEP SETUP

### **STEP 1: Deploy Your Backend**

```bash
cd backend-api
vercel --prod
```

Copy your deployment URL (e.g., `https://backend-xyz.vercel.app`)

---

### **STEP 2: Configure Stripe Webhook**

1. Go to: **https://dashboard.stripe.com/webhooks**
2. Click **"Add endpoint"**
3. **Endpoint URL:** `https://your-backend-url.vercel.app/api/webhooks/stripe`
4. **Select events:**
   - ✅ checkout.session.completed
   - ✅ customer.subscription.created
   - ✅ customer.subscription.updated
   - ✅ customer.subscription.deleted
   - ✅ invoice.payment_succeeded
   - ✅ invoice.payment_failed
5. Click **"Add endpoint"**
6. **Copy the "Signing secret"** (starts with `whsec_...`)

---

### **STEP 3: Add Environment Variables to Vercel**

1. Go to: **https://vercel.com/your-project/settings/environment-variables**
2. Add these variables:

   **STRIPE_SECRET_KEY**
   - Get from: https://dashboard.stripe.com/apikeys
   - Value: `sk_test_...` (your Secret key)
   
   **STRIPE_WEBHOOK_SECRET**
   - Value: `whsec_...` (the signing secret from Step 2)
   
   **CRON_SECRET** (optional but recommended)
   - Value: Any random string (e.g., `my-secret-cron-key-12345`)

3. **Redeploy:**
   ```bash
   vercel --prod
   ```

---

## ✅ THAT'S IT!

Your system now:
- ✅ Auto-assigns 3-day Pro Trial to new users
- ✅ Auto-downgrades to Free after trial (via cron job)
- ✅ Auto-upgrades users when they pay (via Stripe webhook)
- ✅ One webhook handles ALL plans automatically

---

## 🧪 TEST IT

### **Test New User Signup:**
```bash
# Register a new user
# Check database: should have Pro Trial plan
# Check trialEndsAt: should be 3 days from now
```

### **Test Payment (Test Mode):**
1. Create payment link in Stripe for your Pro plan
2. Use test card: `4242 4242 4242 4242`
3. Complete checkout
4. Check database: user should be upgraded to Pro
5. Check Stripe Dashboard → Webhooks: should show successful delivery

---

## 📚 FULL DOCUMENTATION

For complete details, see: **STRIPE_WEBHOOK_SETUP_GUIDE.md**

---

## 🐛 TROUBLESHOOTING

### Build Error Fixed ✅
Changed Stripe API version from `2024-11-20.acacia` to `2025-11-17.clover`

### Cron Job Created ✅
- File: `/api/cron/check-trial-expiry/route.ts`
- Config: `vercel.json` with `"schedule": "0 0 * * *"` (daily at midnight)
- FREE on Vercel Hobby plan!

### TypeScript Errors (Normal)
The lint errors you see are expected. They'll disappear after you run:
```bash
cd backend-api
npx prisma generate
```

These occur because Prisma Client needs to regenerate with the new schema fields.

---

## 🎉 READY TO MONETIZE!

Your complete plan & billing system is now live! 💰
