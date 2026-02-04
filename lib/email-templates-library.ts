// Pre-designed Email Templates
export const emailTemplates = [
  {
    id: 'modern_welcome',
    name: 'Modern Welcome Email',
    category: 'Onboarding',
    subject: 'Welcome to {{productName}}! 🎉 Let\'s get started',
    body: 'Hi {{firstName}},\n\nWelcome to {{productName}}! We\'re thrilled to have you join our community.\n\nHere\'s what you can do right now:\n\n✅ **Complete your profile** - Add your details and preferences\n✅ **Explore key features** - Discover what makes us special\n✅ **Get instant support** - We\'re here 24/7 to help\n\n🚀 **Quick Start Guide**: {{dashboardUrl}}\n\nQuestions? Just reply to this email - we read every message!\n\nTo your success,\n{{productName}} Team\n\nP.S. Check out our onboarding video: {{onboardingUrl}}',
    variables: ['firstName', 'productName', 'dashboardUrl', 'onboardingUrl']
  },
  {
    id: 'trial_ending',
    name: 'Trial Ending Urgency',
    category: 'Trial',
    subject: '⏰ Only {{hoursLeft}} hours left in your trial!',
    body: `Hi {{firstName}},\n\nYour {{productName}} trial ends in just {{hoursLeft}} hours.\n\nDon't lose access to:\n✅ **All your data and progress**\n✅ **Premium features you love**\n✅ **Priority 24/7 support**\n✅ **Advanced integrations**\n\n🎯 **Upgrade now and save 20%**: {{upgradeUrl}}\nUse code: TRIAL20\n\nQuestions? We're here to help!\n\nBest,\n{{productName}} Team`,
  },
  {
    id: 'thank_you',
    name: 'Thank You for Subscribing',
    category: 'Success',
    subject: '🎉 Welcome to {{planName}} - You\'re all set!',
    body: `Hi {{firstName}},\n\nThank you for choosing {{productName}} {{planName}}! 🎉\n\nYou now have full access to:\n\n✅ **All premium features**\n✅ **Priority support**\n✅ **Advanced analytics**\n✅ **Unlimited usage**\n\n🚀 **Get started**: {{dashboardUrl}}\n\nNeed help? Our team is standing by:\n📧 Email: {{supportEmail}}\n💬 Live chat: {{chatUrl}}\n\nTo your success,\n{{productName}} Team\n\nP.S. Your invoice and receipt: {{invoiceUrl}}`,
  },
  {
    id: 'tips_email',
    name: '5 Power User Tips',
    category: 'Engagement',
    subject: '💡 5 tips to master {{productName}} (2 min read)',
    body: `Hi {{firstName}},\n\nHere are 5 quick tips to get 10x more value from {{productName}}:\n\n1. **Complete your profile** - Unlock personalized recommendations\n2. **Connect integrations** - Sync with your favorite tools\n3. **Set up automation** - Save hours every week\n4. **Use templates** - Get started faster\n5. **Join our community** - Learn from 10,000+ users\n\n📚 **Full guide**: {{helpUrl}}\n🎥 **Video tutorials**: {{tutorialsUrl}}\n\nQuestions? Hit reply!\n\nCheers,\n{{productName}} Team`,
  },
  {
    id: 'feature_announcement',
    name: 'New Feature Launch',
    category: 'Engagement',
    subject: '🚀 NEW: {{featureName}} is here!',
    body: `Hi {{firstName}},\n\nExciting news! We just launched **{{featureName}}** - our most requested feature.\n\n✨ **What it does**:\n{{featureDescription}}\n\n💪 **Why you'll love it**:\n• Saves you time\n• More powerful\n• Easy to use\n\n🎯 **Try it now**: {{learnMoreUrl}}\n📹 **Watch demo**: {{demoUrl}}\n\nThis is available on your {{planName}} plan right now!\n\nHappy building,\n{{productName}} Team`,
  },
  {
    id: 're_engagement',
    name: 'We Miss You - Win Back',
    category: 'Win-back',
    subject: 'We miss you, {{firstName}} 💙 (Special offer inside)',
    body: `Hi {{firstName}},\n\nWe noticed you haven't logged into {{productName}} lately.\n\nWe miss you! ❤️\n\n**Come back and get 30% off** with code: **WELCOME30**\n\n✨ **What's new since you left**:\n✅ {{feature1}} - Game changer!\n✅ {{feature2}} - Much faster\n✅ {{feature3}} - More integrations\n\n🎁 **Special offer**: Use code WELCOME30 for 30% off any plan\n⏰ **Expires**: {{expiryDate}}\n\n👉 **Reactivate now**: {{dashboardUrl}}\n\nWe'd love to have you back!\n\n{{productName}} Team`,
  },
  {
    id: 'feedback_request',
    name: 'Feedback & Survey Request',
    category: 'Engagement',
    subject: 'Quick question: How are we doing? (2 min)',
    body: `Hi {{firstName}},\n\nYour opinion matters to us! 🙏\n\nWould you take 2 minutes to share your thoughts?\n\n**We want to know**:\n• What you love about {{productName}}\n• What we can improve\n• Feature requests\n• Overall experience (1-10)\n\n📋 **Take survey**: {{surveyUrl}}\n\n🎁 **Thank you gift**: Complete the survey and get a free month! (We'll email you the code)\n\nEvery response helps us serve you better.\n\nThanks in advance!\n{{productName}} Team`,
  },
  {
    id: 'milestone',
    name: 'Milestone Celebration',
    category: 'Success',
    subject: '🎊 Congratulations! You hit {{milestone}}!',
    body: `🎉 **Amazing work**, {{firstName}}!\n\nYou just reached **{{milestone}}** - that's incredible!\n\n🏆 **Your achievements**:\n• Total: {{totalCount}}\n• Completed: {{completedCount}}\n• Success rate: {{successRate}}%\n\n📈 **Keep the momentum going**:\n{{nextGoalUrl}}\n\n📣 **Share your success**:\nProud of this achievement? Share it with your team!\n{{shareUrl}}\n\nYou're crushing it! 💪\n\n{{productName}} Team`,
  },
  {
    id: 'weekly_digest',
    name: 'Weekly Activity Summary',
    category: 'Engagement',
    subject: '📊 Your {{productName}} week in review',
    body: `Hi {{firstName}},\n\nHere's your activity for the week:\n\n📊 **This Week's Stats**:\n• Total items: {{totalCount}}\n• Completed: {{completedCount}} ✅\n• In progress: {{activeCount}} ⏳\n• Pending: {{pendingCount}}\n\n📈 **Compared to last week**: {{trend}}\n\n🌟 **Highlights**:\n• {{highlight1}}\n• {{highlight2}}\n• {{highlight3}}\n\n👉 **View full report**: {{dashboardUrl}}\n\nHave a productive week ahead!\n\n{{productName}} Team`,
  },
  {
    id: 'upgrade_offer',
    name: 'Limited Time Upgrade Offer',
    category: 'Conversion',
    subject: '⚡ FLASH SALE: 40% off {{planName}} (48 hours only!)',
    body: `Hi {{firstName}},

🔥 **FLASH SALE - 40% OFF!**
⏰ **Expires in 48 hours**

Upgrade to **{{planName}}** and unlock:

✅ **{{feature1}}** - Save hours every week
✅ **{{feature2}}** - 10x more power
✅ **{{feature3}}** - Priority support
✅ **{{feature4}}** - Advanced analytics

💰 **Your special price**:
Regular: $99/month → Sale: $59/month

🎯 **Use code**: FLASH40

👉 **Upgrade now**: {{upgradeUrl}}

This offer expires {{expiryDate}} at midnight.

Best regards,
{{productName}} Team`,
  },
];
