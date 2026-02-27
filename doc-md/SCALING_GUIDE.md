# Email Automation Scaling Guide

## Current Setup (Free Plan)

| Component | Configuration |
|-----------|--------------|
| **Cron Service** | cron-job.org (every 1 minute) |
| **Batch Size** | 50 emails/run |
| **Processing Rate** | 3,000 emails/hour |
| **Database** | Supabase PostgreSQL (Free tier) |
| **Email Provider** | GoHighLevel API |

---

## Scaling Scenarios

### 📊 1,000 Users

**Current Capacity**: ✅ **SUPPORTED**

| Metric | Value |
|--------|-------|
| **Daily Emails** | ~300-500 emails |
| **Processing Time** | < 10 minutes |
| **Queue Backlog** | None |
| **Database Load** | Minimal (<5% utilization) |

**No changes needed.** Current setup handles this easily.

---

### 📊 10,000 Users

**Current Capacity**: ✅ **SUPPORTED** (with minor optimization)

| Metric | Value |
|--------|-------|
| **Daily Emails** | ~3,000-5,000 emails |
| **Processing Time** | ~1-2 hours |
| **Queue Backlog** | Possible during peak times |
| **Database Load** | Moderate (10-20% utilization) |

**Recommended Changes**:

1. **Increase Batch Size to 100** in Settings
   - Go to Admin → Email Sequences → Settings
   - Set Batch Size: 100
   - Processing rate: 6,000 emails/hour

2. **Add Database Indexing** (Already done ✅)
   ```sql
   -- These are already in schema
   @@index([status, scheduledFor])
   @@index([userId])
   @@index([sequenceType])
   ```

3. **Monitor Failed Emails**
   - Check Admin → Email Sequences dashboard weekly
   - Review failed emails and retry

**Cost**: $0 (still free)

---

### 📊 100,000 Users

**Current Capacity**: ⚠️ **REQUIRES UPGRADES**

| Metric | Value |
|--------|-------|
| **Daily Emails** | ~30,000-50,000 emails |
| **Processing Time** | ~8-16 hours with current setup |
| **Queue Backlog** | Significant (4-8 hour delays) |
| **Database Load** | High (60-80% utilization) |

**Required Changes**:

### Option A: Optimize Current Stack ($20-50/month)

1. **Upgrade to Vercel Pro** ($20/month)
   - Native cron (more reliable)
   - Better function performance
   - Add to `vercel.json`:
     ```json
     {
       "crons": [
         {
           "path": "/api/cron/process-emails?secret=YOUR_SECRET",
           "schedule": "* * * * *"
         }
       ]
     }
     ```

2. **Increase Batch Size to 500**
   - Processing rate: 30,000 emails/hour
   - Clears queue in ~2 hours

3. **Upgrade Supabase** (Free → Pro $25/month)
   - Better database performance
   - More connections
   - Auto-scaling

4. **Add Email Queue Priority**
   ```typescript
   // In EmailQueue model
   priority Int @default(0) // 0=normal, 1=high, 2=urgent
   
   // Process high priority first
   WHERE status = 'pending' ORDER BY priority DESC, scheduledFor ASC
   ```

**Total Cost**: ~$45/month
**Processing Time**: 1-2 hours

---

### Option B: Dedicated Email Service ($100-300/month)

For 100K+ users, consider a specialized email automation platform:

1. **SendGrid** + **Twilio Segment**
   - 100K emails/month: $89.95
   - Better deliverability
   - Advanced analytics

2. **Customer.io**
   - Unlimited emails
   - Starting at $150/month
   - Visual workflow builder included

3. **Keep GHL for Contacts**, outsource email sending

**Migration Steps**:
1. Keep GHL for contact management
2. Export email sequences to SendGrid/Customer.io
3. Use webhooks to trigger sequences
4. Maintain database for tracking

**Total Cost**: $100-300/month
**Processing Time**: Real-time

---

## Performance Optimization Checklist

### Database Optimization

- [ ] Add composite indexes for common queries
  ```sql
  CREATE INDEX idx_queue_processing ON "EmailQueue"(status, "scheduledFor", "sequenceType");
  CREATE INDEX idx_user_email_state ON "UserEmailState"("userId", "unsubscribed");
  ```

- [ ] Archive old sent emails (>90 days)
  ```typescript
  // Monthly cleanup job
  await prisma.emailQueue.deleteMany({
    where: {
      status: 'sent',
      sentAt: { lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
    }
  });
  ```

- [ ] Use database connection pooling
  ```javascript
  // In prisma/schema.prisma datasource
  connection_limit = 10
  pool_timeout = 20
  ```

### Cron Optimization

- [ ] Implement exponential backoff for failures
  ```typescript
  const retryDelay = Math.min(30 * Math.pow(2, retryCount), 480); // Max 8 hours
  ```

- [ ] Add circuit breaker for GHL API
  ```typescript
  if (failureRate > 0.5) {
    // Pause processing for 15 minutes
    await pauseProcessing(15);
  }
  ```

- [ ] Parallel processing (for Vercel Pro)
  ```typescript
  const batches = chunk(emails, 50);
  await Promise.all(batches.map(batch => processBatch(batch)));
  ```

### Email Deliverability

- [ ] Implement rate limiting per domain
  ```typescript
  // Max 10 emails/minute to same domain
  const domainCounts = new Map<string, number>();
  ```

- [ ] Add SPF, DKIM, DMARC records
- [ ] Monitor bounce rate (keep < 5%)
- [ ] Implement re-engagement campaigns for inactive users

---

## Monitoring & Alerts

### Key Metrics to Track

1. **Queue Health**
   ```sql
   SELECT 
     status,
     COUNT(*) as count,
     AVG(EXTRACT(EPOCH FROM (NOW() - "scheduledFor"))/3600) as avg_delay_hours
   FROM "EmailQueue"
   GROUP BY status;
   ```

2. **Sequence Performance**
   ```sql
   SELECT 
     "sequenceType",
     COUNT(*) as total_sent,
     COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count,
     ROUND(100.0 * COUNT(CASE WHEN status = 'failed' THEN 1 END) / COUNT(*), 2) as failure_rate
   FROM "EmailQueue"
   WHERE "sentAt" > NOW() - INTERVAL '7 days'
   GROUP BY "sequenceType";
   ```

3. **User Engagement**
   ```sql
   SELECT 
     COUNT(*) as total_users,
     COUNT(CASE WHEN "onboardingCompleted" THEN 1 END) as completed_onboarding,
     COUNT(CASE WHEN "unsubscribed" THEN 1 END) as unsubscribed
   FROM "UserEmailState";
   ```

### Alert Thresholds

| Metric | Threshold | Action |
|--------|-----------|--------|
| **Pending Queue** | > 1,000 emails | Increase batch size |
| **Failure Rate** | > 10% | Check GHL API status |
| **Average Delay** | > 2 hours | Add more cron frequency |
| **Unsubscribe Rate** | > 5% | Review email content |

---

## Cost Breakdown by User Count

| Users | Emails/Day | Monthly Cost | Setup |
|-------|-----------|--------------|-------|
| **1K** | 500 | $0 | Current (Free) |
| **10K** | 5,000 | $0 | Optimize batch size |
| **50K** | 25,000 | $45 | Vercel Pro + Supabase Pro |
| **100K** | 50,000 | $100-300 | Dedicated email service |
| **500K+** | 250,000+ | $500-1,000 | Enterprise (Customer.io/Braze) |

---

## Emergency Procedures

### Queue Stuck (Too Many Pending)

```typescript
// Temporarily increase batch size
await prisma.emailAutomationSettings.update({
  where: { id: settingsId },
  data: { batchSize: 200 }
});

// Manually trigger cron multiple times
for (let i = 0; i < 10; i++) {
  await fetch('/api/cron/process-emails?secret=YOUR_SECRET');
  await new Promise(resolve => setTimeout(resolve, 5000));
}
```

### GHL API Rate Limited

```typescript
// Pause automation
await prisma.emailAutomationSettings.update({
  where: { id: settingsId },
  data: { isEnabled: false }
});

// Wait 1 hour, then resume with lower batch size
```

### Database Connection Issues

```bash
# Restart Prisma connection
npx prisma generate
npm run build
vercel --prod
```

---

## Migration Path: Free → Enterprise

### Phase 1: Current (0-1K users)
- Free tier everything
- External cron
- Manual monitoring

### Phase 2: Growing (1K-10K users)
- Increase batch size
- Weekly monitoring
- Database cleanup scripts

### Phase 3: Scaling (10K-50K users)
- Upgrade to Vercel Pro ($20/month)
- Upgrade to Supabase Pro ($25/month)
- Automated monitoring
- Priority queues

### Phase 4: Enterprise (50K-100K users)
- Consider dedicated email service
- Multiple cron workers
- Advanced analytics
- A/B testing

### Phase 5: Massive Scale (100K+ users)
- Migrate to Customer.io or Braze
- Keep visual builder for design
- Export sequences via API
- Real-time processing

---

## Current System Limits

| Component | Current Limit | How to Increase |
|-----------|--------------|-----------------|
| **Vercel Function** | 10s timeout (Free) | Upgrade to Pro (300s) |
| **Database Connections** | 5 (Supabase Free) | Upgrade to Pro (15-100) |
| **GHL API** | 500 req/min | Contact support |
| **Cron Frequency** | 1 minute (external) | Native Vercel cron (Pro) |
| **Batch Size** | 50 (configurable) | Increase via Settings |

---

## Testing Scale

### Load Test Script

```bash
# Create 100 test email queue entries
curl -X POST https://your-api.vercel.app/api/admin/test/create-queue \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"count": 100}'

# Monitor processing time
time curl https://your-api.vercel.app/api/cron/process-emails?secret=$CRON_SECRET

# Check queue status
curl https://your-api.vercel.app/api/admin/email-sequences \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## Summary

| User Count | Status | Action Required | Monthly Cost |
|------------|--------|-----------------|--------------|
| **1,000** | ✅ Ready | None | $0 |
| **10,000** | ✅ Ready | Increase batch size to 100 | $0 |
| **50,000** | ⚠️ Upgrades needed | Vercel Pro + Supabase Pro | ~$45 |
| **100,000** | ⚠️ Major changes | Dedicated email service | $100-300 |

**Current setup handles 10K users with no additional cost.** Beyond that, you'll need to invest in infrastructure.
