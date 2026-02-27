# Email Automation Setup Guide

This guide explains how to set up the automated email sequences using GoHighLevel.

## Overview

The system has 4 email sequences:
1. **Onboarding Sequence** - 5 emails over 3 days for new trial users
2. **Expired Trial Sequence** - 4 emails over 3 weeks for users who didn't convert
3. **Paid Customer Sequence** - 3 emails for new paying customers
4. **Special Campaigns** - Lifetime deals, feature announcements

---

## Environment Variables Required

Add these to your Vercel Environment Variables:

```env
# GoHighLevel API (already configured)
GHL_API_KEY=pit-xxxxxxxx
GHL_LOCATION_ID=xxxxxxxxxx
GHL_EMAIL_FROM=kommentify@yourdomain.com

# Cron Secret (generate a unique secret)
CRON_SECRET=your-unique-secret-here-make-it-long
```

---

## How It Works

### Triggers

| Event | Email Sequence |
|-------|---------------|
| User signs up | Onboarding (5 emails) |
| Trial expires without purchase | Expired Trial (4 emails) |
| User makes payment | Paid Customer (3 emails) |

### Email Queue

- Emails are stored in `EmailQueue` table with scheduled times
- Cron job processes pending emails every 15 minutes
- Users can be unsubscribed to stop all emails

---

## Cron Job Setup

### Option 1: External Cron Service (Free Plan)

Since Vercel Free plan doesn't have native cron, use an external service:

**Recommended: cron-job.org (Free)**

1. Go to https://cron-job.org
2. Create a free account
3. Create new cron job:
   - **URL**: `https://kommentify.com/api/cron/process-emails?secret=YOUR_CRON_SECRET`
   - **Schedule**: Every 15 minutes (`*/15 * * * *`)
   - **Request Method**: GET
4. Save and enable

**Alternative: EasyCron (Free tier available)**
1. Go to https://www.easycron.com
2. Similar setup as above

### Option 2: Vercel Cron (Pro Plan $20/mo)

If you upgrade to Vercel Pro, add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/process-emails?secret=YOUR_CRON_SECRET",
      "schedule": "*/15 * * * *"
    },
    {
      "path": "/api/cron/check-trial-expiry?secret=YOUR_CRON_SECRET",
      "schedule": "0 0 * * *"
    }
  ]
}
```

---

## API Endpoints

### Process Email Queue
```
GET /api/cron/process-emails?secret=YOUR_CRON_SECRET

# Or with header
GET /api/cron/process-emails
Authorization: Bearer YOUR_CRON_SECRET
```

### Check Trial Expiry (runs daily)
```
GET /api/cron/check-trial-expiry
Authorization: Bearer YOUR_CRON_SECRET
```

### Manual Trigger (Admin)
```
POST /api/cron/process-emails
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "batchSize": 20
}
```

---

## Email Sequence Timing

### Sequence 1: Onboarding (New User)
| Email | Timing | Subject |
|-------|--------|---------|
| 1 | Immediate | Welcome to Kommentify! |
| 2 | +2 hours | Let me help you set up |
| 3 | +24 hours | You're missing 80% of power |
| 4 | +48 hours | Trial ends in 12 hours |
| 5 | +58 hours | Last chance (2 hours left) |

### Sequence 2: Expired Trial
| Email | Timing | Subject |
|-------|--------|---------|
| 1 | +24 hours | Your automation has stopped |
| 2 | +72 hours | Success story (Raj got 47 clients) |
| 3 | +1 week | Feature spotlight |
| 4 | +2 weeks | Final - removing your account |

### Sequence 3: Paid Customer
| Email | Timing | Subject |
|-------|--------|---------|
| 1 | Immediate | Welcome to Pro! VIP onboarding |
| 2 | +7 days | Week 1 check-in |
| 3 | +30 days | Monthly tips |

---

## GHL Tags Used

```
trial_user        - New trial users
paid_customer     - Paid subscribers
expired_trial     - Trial expired without conversion
lifetime_customer - Lifetime deal buyers
engaged_user      - Active users
inactive_user     - Dormant users
vip              - Priority support users
```

---

## Database Tables

### EmailQueue
Stores scheduled emails with:
- `userId` - Target user
- `sequenceType` - onboarding/expired_trial/paid_customer/special
- `emailNumber` - Position in sequence
- `templateId` - Email template ID
- `scheduledFor` - When to send
- `status` - pending/sent/failed/cancelled

### UserEmailState
Tracks sequence state per user:
- `onboardingStarted/Completed`
- `expiredTrialStarted/Completed`
- `paidSequenceStarted/Completed`
- `unsubscribed` - Stop all emails

---

## Customizing Email Templates

Templates are in: `lib/email-automation/templates.ts`

Variables available:
- `{{firstName}}` - User's first name
- `{{planName}}` - Current plan name
- `{{billingType}}` - Monthly/Lifetime

Example:
```typescript
{
  id: 'custom_email',
  subject: 'Hello {{firstName}}!',
  body: 'Your {{planName}} is active.',
  delayHours: 24
}
```

---

## Free vs Pro Plan Comparison

| Feature | Free Plan | Pro Plan ($20/mo) |
|---------|-----------|-------------------|
| Email Processing | External cron | Native Vercel cron |
| Frequency | Every 15 min | Every 1 min if needed |
| Reliability | Good | Better |
| Batch Size | 20/run | 50/run |
| Setup | Manual | Automatic |

**Recommendation**: Start with free plan (external cron). Upgrade to Pro when you have 500+ active users.

---

## Monitoring

### Check Email Queue Status
```sql
-- Pending emails
SELECT * FROM "EmailQueue" WHERE status = 'pending' ORDER BY "scheduledFor";

-- Failed emails
SELECT * FROM "EmailQueue" WHERE status = 'failed';

-- Sent today
SELECT * FROM "EmailQueue" WHERE status = 'sent' AND "sentAt" > NOW() - INTERVAL '1 day';
```

### Logs
Check Vercel Functions logs for:
- `📧 Processing X pending emails...`
- `✅ Sent email X to user Y`
- `❌ Failed to send...`

---

## Troubleshooting

### Emails not sending
1. Check CRON_SECRET matches in Vercel env and cron job URL
2. Check GHL_API_KEY is valid
3. Check Vercel function logs for errors

### Duplicate emails
- System checks `UserEmailState` before scheduling
- Each sequence can only run once per user

### Stop emails for a user
```typescript
import { unsubscribeUser } from '@/lib/email-automation';
await unsubscribeUser(userId);
```

---

## Quick Start Checklist

- [ ] Add CRON_SECRET to Vercel environment variables
- [ ] Set up external cron job (cron-job.org)
- [ ] Verify GHL API credentials work
- [ ] Test by registering a new user
- [ ] Check EmailQueue table for scheduled emails
- [ ] Monitor Vercel logs for processing

---

## Files Created

```
lib/email-automation/
├── index.ts          # Main exports
├── templates.ts      # Email templates
├── ghl-service.ts    # GoHighLevel API
└── scheduler.ts      # Queue management

app/api/cron/
└── process-emails/
    └── route.ts      # Cron endpoint
```
