# Cron Job Setup for Kommentify

## Overview
Kommentify uses cron jobs to handle automated tasks like processing emails and checking failed scheduled posts.

## Available Cron Endpoints

### Primary Endpoint: `/api/cron/process-emails`
**URL**: `https://kommentify.com/api/cron/process-emails`
**Method**: `GET`
**Frequency**: Every minute

This endpoint handles:
1. ✅ **Trigger Scheduled Posts** (every minute)
   - Finds scheduled posts whose time has arrived
   - Creates extension commands for posting
   - Updates task status to "pending"

2. ✅ **Failed Scheduled Posts Check** (every minute)
   - Marks scheduled posts as failed if extension doesn't respond within 15 minutes
   - Updates task status to "failed" with reason "Extension Inactive"

3. ✅ **Trial Expiry Check** (every 10 minutes)
   - Downgrades expired trial users to free plan
   - Sends expiry notification emails

4. ✅ **Email Queue Processing** (every minute)
   - Processes pending email sequences
   - Sends marketing and notification emails

### Authentication
The cron endpoint uses a secret key for authentication:
```bash
# Set in your environment variables
CRON_SECRET=your-secret-key-here

# Use in cron-job.org with Authorization header:
Authorization: Bearer your-secret-key-here
```

## Cron Job Configuration for cron-job.org

### Setup
1. Go to [cron-job.org](https://cron-job.org)
2. Create a new cron job
3. Set URL: `https://kommentify.com/api/cron/process-emails`
4. Set Method: `GET`
5. Set Schedule: `* * * * *` (every minute)
6. Add Headers:
   - `Authorization: Bearer your-secret-key-here`
7. Save and activate

### Expected Response
```json
{
  "success": true,
  "message": "Cron job processed",
  "emails": {
    "processed": 5,
    "failed": 0
  },
  "trials": {
    "downgraded": 2
  },
  "scheduledPosts": {
    "triggered": 3,
    "failed": 1
  },
  "timestamp": "2025-02-18T21:50:00.000Z"
}
```

## Manual Testing
You can test the cron endpoint manually:
```bash
curl -H "Authorization: Bearer your-secret-key-here" \
     https://kommentify.com/api/cron/process-emails
```

## Monitoring
- Check Vercel function logs for cron execution
- Monitor failed scheduled posts in the dashboard
- Email notifications for critical failures

## Security Notes
- Never expose the CRON_SECRET in client-side code
- Use HTTPS for all cron requests
- Monitor for unauthorized cron attempts
- Regularly rotate the cron secret

## Scheduled Posts Workflow

### Complete Lifecycle
1. **Schedule Post** → User creates post with date/time → Status: `pending`
2. **Cron Triggers** → When time arrives, cron creates extension command → Status: `pending` + `📤 Sent`
3. **Extension Picks Up** → Extension receives command → Status: `in_progress`
4. **Success** → Post published → Status: `completed`
5. **Failure** → Extension inactive >15min → Status: `failed`

### Status Indicators
- **⏳ Pending**: Scheduled, waiting for trigger time
- **📤 Sent**: Triggered, waiting for extension pickup
- **🔄 In Progress**: Extension is posting
- **✅ Completed**: Successfully posted
- **❌ Failed**: Extension inactive or error

### Dashboard Features
- **Real-time Status Updates**: Shows current post status
- **🔄 Refresh Button**: Manual refresh for latest status
- **Reschedule Failed**: One-click reschedule for failed posts
- **Delete Option**: Remove unwanted scheduled posts

## Troubleshooting
1. **401 Unauthorized**: Check CRON_SECRET environment variable
2. **No failed posts detected**: Ensure extension is properly marking tasks as sent
3. **High failure rate**: Check extension connectivity and LinkedIn API status
4. **Email issues**: Verify email service configuration
