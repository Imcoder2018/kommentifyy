# Kommentify Plan Cost Estimates

This document provides estimated OpenAI API costs per plan based on full monthly usage.

## OpenAI Models Used

Kommentify uses the following OpenAI models:

| Model | Usage | Input Cost | Output Cost |
|-------|-------|------------|-------------|
| **gpt-4o-mini** | Default model for most operations (comments, posts, topics) | $0.15 / 1M tokens | $0.60 / 1M tokens |
| **gpt-4o** | Premium model for complex/longer content | $2.50 / 1M tokens | $10.00 / 1M tokens |

### Model Selection Logic

- **AI Comments (Short/Brief)**: `gpt-4o-mini`
- **AI Comments (Concise/Long)**: `gpt-4o`
- **AI Post Generation**: `gpt-4o-mini` (default), `gpt-4o` for premium
- **AI Topic Lines**: `gpt-4o-mini`
- **Trending Posts Analysis**: `gpt-4o-mini`
- **Viral Potential Scoring**: `gpt-4o-mini`

---

## Token Estimates Per Operation

Based on typical prompt/response sizes:

| Operation | Input Tokens (avg) | Output Tokens (avg) | Model |
|-----------|-------------------|---------------------|-------|
| AI Comment Generation | ~2,000 | ~100-300 | gpt-4o-mini |
| AI Post Generation | ~1,500 | ~500-800 | gpt-4o-mini |
| AI Topic Lines (5 topics) | ~500 | ~200 | gpt-4o-mini |
| Trending Post Analysis | ~3,000 | ~500 | gpt-4o-mini |

---

## Plan-by-Plan Cost Estimates

### Free Plan ($0/month)

| Feature | Monthly Limit | Est. Cost |
|---------|---------------|-----------|
| Comments | 0 | $0.00 |
| Likes | 0 | $0.00 |
| Shares | 0 | $0.00 |
| Follows | 0 | $0.00 |
| Connections | 0 | $0.00 |
| AI Posts | 0 | $0.00 |
| AI Comments | 0 | $0.00 |
| AI Topics | 0 | $0.00 |
| Import Credits | -1 (disabled) | $0.00 |

**Total Estimated OpenAI Cost**: $0.00/month  
**Plan Price**: $0  
**Margin**: N/A (no AI features)

---

### Starter Plan ($9/month)

| Feature | Monthly Limit | Tokens Used | Est. Cost |
|---------|---------------|-------------|-----------|
| Comments | 500 | - | $0.00 |
| Likes | 500 | - | $0.00 |
| Shares | 500 | - | $0.00 |
| Follows | 500 | - | $0.00 |
| Connections | 100 | - | $0.00 |
| **AI Posts** | 15 | ~30K input + ~12K output | ~$0.012 |
| **AI Comments** | 200 | ~400K input + ~50K output | ~$0.09 |
| **AI Topics** | 20 | ~10K input + ~4K output | ~$0.004 |
| Import Credits | 50 | - | $0.00 |

**Total Estimated OpenAI Cost**: ~$0.11/month  
**Plan Price**: $9/month  
**Gross Margin**: ~98.8%

---

### Growth Plan ($29/month)

| Feature | Monthly Limit | Tokens Used | Est. Cost |
|---------|---------------|-------------|-----------|
| Comments | 1,000 | - | $0.00 |
| Likes | 1,000 | - | $0.00 |
| Shares | 1,000 | - | $0.00 |
| Follows | 1,000 | - | $0.00 |
| Connections | 1,000 | - | $0.00 |
| **AI Posts** | 40 | ~80K input + ~32K output | ~$0.031 |
| **AI Comments** | 500 | ~1M input + ~125K output | ~$0.225 |
| **AI Topics** | 60 | ~30K input + ~12K output | ~$0.012 |
| Import Credits | 500 | - | $0.00 |

**Total Estimated OpenAI Cost**: ~$0.27/month  
**Plan Price**: $29/month  
**Gross Margin**: ~99.1%

---

### Pro Plan ($39/month)

| Feature | Monthly Limit | Tokens Used | Est. Cost |
|---------|---------------|-------------|-----------|
| Comments | 3,000 | - | $0.00 |
| Likes | 3,000 | - | $0.00 |
| Shares | 3,000 | - | $0.00 |
| Follows | 3,000 | - | $0.00 |
| Connections | 3,000 | - | $0.00 |
| **AI Posts** | 100 | ~200K input + ~80K output | ~$0.078 |
| **AI Comments** | 1,000 | ~2M input + ~250K output | ~$0.45 |
| **AI Topics** | 150 | ~75K input + ~30K output | ~$0.029 |
| Import Credits | 1,500 | - | $0.00 |

**Total Estimated OpenAI Cost**: ~$0.56/month  
**Plan Price**: $39/month  
**Gross Margin**: ~98.6%

---

### Pro LTD ($99 one-time) - Same limits as Pro

| Feature | Monthly Limit | Tokens Used | Est. Cost |
|---------|---------------|-------------|-----------|
| **AI Posts** | 100 | ~200K input + ~80K output | ~$0.078 |
| **AI Comments** | 1,000 | ~2M input + ~250K output | ~$0.45 |
| **AI Topics** | 150 | ~75K input + ~30K output | ~$0.029 |

**Total Estimated OpenAI Cost**: ~$0.56/month  
**Break-even**: ~177 months (14.7 years) - highly profitable LTD

---

### Growth LTD ($249 one-time) - Same limits as Growth

| Feature | Monthly Limit | Tokens Used | Est. Cost |
|---------|---------------|-------------|-----------|
| **AI Posts** | 40 | ~80K input + ~32K output | ~$0.031 |
| **AI Comments** | 500 | ~1M input + ~125K output | ~$0.225 |
| **AI Topics** | 60 | ~30K input + ~12K output | ~$0.012 |

**Total Estimated OpenAI Cost**: ~$0.27/month  
**Break-even**: ~922 months (76.8 years) - extremely profitable LTD

---

### Starter LTD ($399 one-time) - Same limits as Starter

| Feature | Monthly Limit | Tokens Used | Est. Cost |
|---------|---------------|-------------|-----------|
| **AI Posts** | 15 | ~30K input + ~12K output | ~$0.012 |
| **AI Comments** | 200 | ~400K input + ~50K output | ~$0.09 |
| **AI Topics** | 20 | ~10K input + ~4K output | ~$0.004 |

**Total Estimated OpenAI Cost**: ~$0.11/month  
**Break-even**: ~3,627 months (302 years) - extremely profitable LTD

---

## Summary Cost Table

| Plan | Price | Monthly AI Cost | Margin | Notes |
|------|-------|-----------------|--------|-------|
| Free | $0 | $0.00 | N/A | No AI features |
| Starter | $9/mo | ~$0.11 | 98.8% | Entry-level |
| Growth | $29/mo | ~$0.27 | 99.1% | Best value |
| Pro | $39/mo | ~$0.56 | 98.6% | Power users |
| Pro LTD | $99 | ~$0.56/mo | Break-even: 177mo | Highly profitable |
| Growth LTD | $249 | ~$0.27/mo | Break-even: 922mo | Extremely profitable |
| Starter LTD | $399 | ~$0.11/mo | Break-even: 3627mo | Most profitable |

---

## Features Tracked in Plans

All extension features are tracked against user plans:

| Feature | Description | Checked Via |
|---------|-------------|-------------|
| `allowAiPostGeneration` | AI Post Generation (Post Writer) | Trending Posts, Post Writer tab |
| `allowAiCommentGeneration` | AI Comment Generation | Commenter, Bulk Processing |
| `allowAiTopicLines` | AI Topic Lines | Post Writer "Generate Topics" |
| `allowAutomation` | General Automation (Likes, Shares, Follows) | Commenter, Bulk Processing |
| `allowAutomationScheduling` | Scheduled Automation | Commenter schedules |
| `allowNetworking` | Networking Features | People Search, Connections |
| `allowNetworkScheduling` | Network Scheduling | Networking schedules |
| `allowPostScheduling` | Post Scheduling | Content Calendar |
| `allowCsvExport` | CSV Export/Analytics | Export buttons |
| `allowImportProfiles` | Import Profiles Auto Engagement | Import tab automation |

---

## Important Notes

1. **Costs are estimates** based on typical usage patterns and may vary based on actual prompt/response lengths.

2. **gpt-4o-mini pricing** is extremely cost-effective at $0.15/$0.60 per 1M tokens.

3. **Server costs** (Vercel, database, etc.) are not included in these estimates.

4. **All LTD plans are extremely profitable** due to the low per-operation cost of AI features.

5. **Non-AI features** (likes, comments, shares, follows, connections) have zero OpenAI cost - they only use LinkedIn automation via the browser extension.

6. **Import Credits** are profile-based, not AI-based, so no OpenAI cost per import.

---

*Last updated: February 2026*
