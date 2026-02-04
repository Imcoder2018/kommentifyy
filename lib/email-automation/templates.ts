// Email Templates for GoHighLevel Automation

export interface EmailTemplate {
  id: string;
  subject: string;
  body: string;
  delayHours: number; // Delay from previous email in sequence
}

export interface EmailSequence {
  type: string;
  emails: EmailTemplate[];
}

// Helper to replace variables in templates
export function replaceVariables(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
  }
  return result;
}

// SEQUENCE 1: NEW USER ONBOARDING
export const ONBOARDING_SEQUENCE: EmailSequence = {
  type: 'onboarding',
  emails: [
    {
      id: 'onboarding_1',
      delayHours: 0, // Immediate
      subject: 'Welcome to Kommentify! Your LinkedIn growth starts now 🚀',
      body: `Hi {{firstName}},

Welcome to Kommentify! 🎉

Your 3-day free trial is now active, and you're about to save 20+ hours every week on LinkedIn.

Here's how to get started in 2 minutes:

1. Install the Chrome Extension: https://chromewebstore.google.com/detail/kommentify-linkedin-auto/laeckkpjacbodjglcnenggpdpehkacei
2. Connect your LinkedIn account
3. Set your daily limits (we recommend starting slow)
4. Add keywords for your industry
5. Watch Kommentify work its magic!

Quick Start Video (2 min): https://www.loom.com/share/0f5fd7b490e840609f

Your trial includes FULL access to:
✅ AI Comment Generation
✅ Smart Connection Requests
✅ Post Scheduling
✅ CSV Import & Bulk Actions
✅ Advanced Analytics

Need help? Just reply to this email or WhatsApp us: +92 300 1234567

Let's grow your LinkedIn!

Team Kommentify`
    },
    {
      id: 'onboarding_2',
      delayHours: 2, // After 2 hours
      subject: '{{firstName}}, let me help you set up Kommentify in 5 minutes',
      body: `Hi {{firstName}},

I noticed you just joined Kommentify! Let's make sure you're getting maximum value from Day 1.

Here's your personalized setup checklist:

📌 Step 1: Safety First
Set conservative daily limits:
- Comments: 10-20/day
- Connections: 10-15/day
- Likes: 20-30/day
(You can increase these after 1 week)

📌 Step 2: Target Your Audience
Add 3-5 keywords like:
- Your industry (e.g., "SaaS", "Real Estate")
- Your target role (e.g., "CEO", "Founder")
- Your location (e.g., "Mumbai", "Karachi")

📌 Step 3: Import Your Prospects
Have a list of ideal connections?
Upload CSV → Kommentify will engage with each profile automatically

Watch this 3-minute setup tutorial: https://kommentify.com/tutorials

💡 Pro Tip: Start with commenting only for first 2 days. It's the safest way to test and see immediate engagement!

Questions? Just hit reply!

Happy automating,
Team Kommentify`
    },
    {
      id: 'onboarding_3',
      delayHours: 22, // Day 2 (24 hours from start - 2 hours already passed)
      subject: "{{firstName}}, you're missing 80% of Kommentify's power",
      body: `Hi {{firstName}},

Day 2 with Kommentify! Here are insider tips our power users swear by:

🎯 The "Influence Targeting" Strategy
Instead of random connections, target:
1. People who comment on influencer posts
2. Active members in your industry groups
3. Second-degree connections of your ideal clients

💡 AI Comment Settings That Work
- Turn ON "Contextual Comments"
- Set comment length to "Medium"
- Enable "Question Mode" for 30% of comments
- This gets 3x more replies!

📈 The CSV Import Secret
Upload your Sales Navigator exports directly!
Kommentify will:
- Visit each profile
- Read their recent posts
- Like, comment, and connect
- All with natural delays

⚡ Quick Win for Today:
Import 50 target profiles and let Kommentify engage with them throughout the day.

See the full strategy guide: https://kommentify.com/strategies

Your trial ends tomorrow - ready to continue growing?

Best,
Team Kommentify`
    },
    {
      id: 'onboarding_4',
      delayHours: 24, // Day 3 Morning
      subject: '⏰ {{firstName}}, your trial ends in 12 hours',
      body: `Hi {{firstName}},

Your Kommentify trial ends tonight at midnight.

During your trial, you've had access to powerful automation that saves 20+ hours weekly.

Don't lose momentum! 

Choose your plan:
- Starter ($4.99/mo) - Perfect for individuals
- Pro ($9.99/mo) - For serious networkers
- Scale ($19.99/mo) - For agencies & teams

💰 Launch Week Special:
Get LIFETIME access (no monthly fees ever!)
- Starter Lifetime: $39 (save $60/year)
- Pro Lifetime: $79 (save $120/year)
- Scale Lifetime: $139 (save $240/year)

👉 UPGRADE NOW: https://kommentify.com/lifetime-deal

Questions? Reply to this email or WhatsApp: +92 300 1234567

Don't let your LinkedIn growth stop,
Team Kommentify`
    },
    {
      id: 'onboarding_5',
      delayHours: 10, // Day 3 Evening
      subject: 'Last chance, {{firstName}} (trial ends in 2 hours)',
      body: `{{firstName}},

Quick reminder - your Kommentify trial expires in 2 hours.

After that:
❌ Automation stops
❌ You're back to manual work
❌ 3+ hours daily on LinkedIn

Continue your growth for less than a coffee/day:
👉 ACTIVATE SUBSCRIPTION: https://kommentify.com/plans

Or grab lifetime access (ending soon):
👉 GET LIFETIME DEAL: https://kommentify.com/lifetime-deal

This is your last reminder.

Team Kommentify

P.S. Join 100+ professionals already growing with Kommentify`
    }
  ]
};

// SEQUENCE 2: EXPIRED TRIAL (NON-BUYERS)
export const EXPIRED_TRIAL_SEQUENCE: EmailSequence = {
  type: 'expired_trial',
  emails: [
    {
      id: 'expired_1',
      delayHours: 24, // Day 1 after expiry
      subject: '{{firstName}}, your LinkedIn automation has stopped',
      body: `Hi {{firstName}},

Your Kommentify trial ended yesterday, and your automation has paused.

We understand monthly subscriptions can add up. That's why we created something special...

🎁 One-Time Offer (24 hours only):
Get 50% OFF your first month
Use code: COMEBACK50

👉 CLAIM YOUR DISCOUNT: https://kommentify.com/plans?code=COMEBACK50

Or go lifetime and never pay monthly:
- Lifetime access from just $39
- No recurring fees ever
- All future updates included

👉 VIEW LIFETIME OPTIONS: https://kommentify.com/lifetime-deal

Your LinkedIn growth shouldn't stop here.

Best,
Team Kommentify`
    },
    {
      id: 'expired_2',
      delayHours: 48, // Day 3 after expiry
      subject: 'How Raj got 47 clients using Kommentify',
      body: `{{firstName}},

Quick story:

Raj from Mumbai was spending 3 hours daily on LinkedIn.
Zero results.

Then he tried Kommentify:
- Week 1: 200 targeted comments
- Week 2: 50 quality connections
- Week 3: 12 inbound inquiries
- Week 4: 3 new clients

Investment: $79 lifetime
Return: $4,000 in new business

Ready to write your success story?

👉 START AGAIN WITH 30% OFF: https://kommentify.com/plans?code=SUCCESS30

Limited time offer ends tomorrow.

Team Kommentify`
    },
    {
      id: 'expired_3',
      delayHours: 168, // Week 2 (7 days later)
      subject: 'The feature you missed that could 10x your LinkedIn',
      body: `Hi {{firstName}},

Did you know Kommentify's CSV Import feature is basically like hiring a VA for $39?

Here's what you missed:
1. Upload any LinkedIn profile list
2. Kommentify visits each profile
3. Reads their recent content
4. Engages intelligently
5. Builds relationships on autopilot

Our users call this the "Secret Weapon" feature.

Want to try it again?

Special offer: Lifetime access $39 (usually $79)

👉 GRAB LIFETIME DEAL: https://kommentify.com/lifetime-deal?code=SECRET39

Offer expires in 48 hours.

Best,
Team Kommentify`
    },
    {
      id: 'expired_4',
      delayHours: 168, // Week 3 (another 7 days)
      subject: "{{firstName}}, we're removing you from Kommentify",
      body: `Hi {{firstName}},

This is our final email.

We're cleaning up inactive accounts next week.

Before we remove your account, here's one last offer:

Lifetime Access: Just $29 (lowest ever)
Valid for next 24 hours only.

👉 ACTIVATE LIFETIME - $29: https://kommentify.com/lifetime-deal?code=FINAL29

After this, you'll need to sign up again at regular prices.

If LinkedIn growth isn't your priority right now, we understand.

Wishing you success,
Team Kommentify

P.S. This truly is the last email. We won't bother you again.`
    }
  ]
};

// SEQUENCE 3: NEW CUSTOMER (PAID)
export const PAID_CUSTOMER_SEQUENCE: EmailSequence = {
  type: 'paid_customer',
  emails: [
    {
      id: 'paid_1',
      delayHours: 0, // Immediate
      subject: "Welcome to Kommentify Pro! Here's your VIP onboarding",
      body: `{{firstName}}, you're in! 🎉

Welcome to the Kommentify family!

Your {{planName}} is now active.

VIP Resources for You:
📹 Advanced Strategies Masterclass: https://kommentify.com/masterclass
📚 LinkedIn Growth Playbook (PDF): https://kommentify.com/playbook
💬 Private Telegram Community: https://t.me/kommentify
📞 Priority WhatsApp Support: +92 300 1234567

Your Account Details:
- Plan: {{planName}}
- Status: Active
- Billing: {{billingType}}

Quick Start Actions:
1. Join our Telegram community (500+ members)
2. Watch the Advanced Strategies video
3. Set up your first campaign
4. Introduce yourself in the community!

Need anything? Just reply to this email for priority support.

Let's grow together!
Team Kommentify`
    },
    {
      id: 'paid_2',
      delayHours: 168, // Day 7
      subject: "{{firstName}}, how's your first week going?",
      body: `Hi {{firstName}},

You've been using Kommentify for a week now!

Quick check-in:
✓ Is automation running smoothly?
✓ Any features you need help with?
✓ Getting good engagement?

Pro Tips for Week 2:
- Increase daily limits by 20%
- Try the CSV import feature
- Test different comment styles
- Join our weekly growth workshop (Thursdays 3 PM IST)

If you haven't already, join our community:
👉 Telegram Group: https://t.me/kommentify

500+ members sharing strategies daily!

Happy growing,
Team Kommentify`
    },
    {
      id: 'paid_3',
      delayHours: 672, // Month 1 (30 days - 7 already passed)
      subject: 'Your monthly LinkedIn growth report + tips',
      body: `Hi {{firstName}},

Monthly Kommentify Update!

New Features This Month:
- Advanced boolean search
- Emoji support in comments
- Bulk message templates

Top Strategy This Month:
"The Conference Attendee Hack"
1. Find recent conference in your industry
2. Search attendee list on LinkedIn
3. Import to Kommentify
4. Engage with personalized comments about the event
5. 70% connection acceptance rate!

Upcoming:
- Live Workshop: Thursday 3 PM IST
- New feature launch next week

Keep growing!
Team Kommentify`
    }
  ]
};

// SEQUENCE 4: SPECIAL CAMPAIGNS
export const LIFETIME_DEAL_EMAIL: EmailTemplate = {
  id: 'lifetime_promo',
  delayHours: 0,
  subject: '🔥 48-Hour Flash Sale: Lifetime Deal Returns!',
  body: `{{firstName}},

By popular demand, lifetime deals are BACK!

But only for 48 hours.

Regular Price → Flash Sale:
- Starter: $79 → $39 (save $40)
- Pro: $159 → $79 (save $80)
- Scale: $279 → $139 (save $140)

Why lifetime?
✓ Never pay monthly again
✓ All future updates included
✓ Grandfather pricing forever
✓ Transfer to team members

👉 GRAB LIFETIME ACCESS: https://kommentify.com/lifetime-deal

Timer: 47:59:58 remaining

Don't miss out again!
Team Kommentify`
};

export const FEATURE_ANNOUNCEMENT_EMAIL: EmailTemplate = {
  id: 'feature_announcement',
  delayHours: 0,
  subject: 'NEW: AI Post Writer is here!',
  body: `Hi {{firstName}},

Big update for you!

Kommentify now writes viral LinkedIn posts!

How it works:
1. Enter a topic
2. Choose tone (Professional/Story/Educational)
3. Get 10 variations instantly
4. Schedule or post immediately

This feature alone is worth $50/month elsewhere.
You get it FREE with your plan!

Try it now: https://kommentify.com/dashboard

What's next:
- Voice message automation
- InMail templates
- Analytics dashboard v2

Your feedback shapes Kommentify!

Best,
Team Kommentify`
};

// Special campaign sequence for one-off emails
export const SPECIAL_SEQUENCE: EmailSequence = {
  type: 'special',
  emails: [
    LIFETIME_DEAL_EMAIL,
    FEATURE_ANNOUNCEMENT_EMAIL
  ]
};

// Get all sequences
export const EMAIL_SEQUENCES: Record<string, EmailSequence> = {
  onboarding: ONBOARDING_SEQUENCE,
  expired_trial: EXPIRED_TRIAL_SEQUENCE,
  paid_customer: PAID_CUSTOMER_SEQUENCE,
  special: SPECIAL_SEQUENCE
};
