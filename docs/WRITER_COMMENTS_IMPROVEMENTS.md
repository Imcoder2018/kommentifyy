# Writer & Comments Tab Improvements

## Date: Feb 26, 2026

---

## Part 1: Writer Tab UI Simplification

### Problem
The Writer tab has too many overlapping selection options that confuse users:
- **Post Goal** (6 options) AND **Outcome Focus** (5 options) overlap significantly (e.g., "Conversation" appears in both)
- **Post Type** (8 options) AND **Template** dropdown (5 options) serve the same purpose — double-selection
- **Depth** (3 options) AND **Length** dropdown (3 options) are redundant
- **Tone** dropdown in Config section is rarely needed when Post Goal + Post Type already imply tone
- Total clickable options before generating: ~25+ choices across 6 different selectors

### Solution: Merge & Reduce
1. **Remove Outcome Focus** — merge its intent into Post Goal descriptions (e.g., "Reach" already implies shares/impressions)
2. **Remove Template dropdown** — Post Type already maps to templates internally
3. **Remove Length dropdown** — Depth selector already controls length
4. **Remove Tone dropdown** — AI infers tone from Post Goal + Post Type. Keep only in advanced/collapsed section
5. **Result**: User picks **Post Goal** (6) + **Post Type** (8) + **Depth** (3) = 17 options, down from 25+

### Move "Analyze Post" Button
- Remove from "High Performance Post Generator" header
- Place inside "AI Post Helper" column as a dedicated action
- Use AI model to provide honest, detailed feedback with:
  - **Human Score** (0-100): How human does this sound?
  - **Performance Strength** (0-100): How strong is hook, body, CTA?
  - **Reach Potential** (0-100): Algorithm alignment score
  - **AI Pattern Risk** (0-100): Likelihood of AI detection
  - Reasoning and honest feedback for each metric
  - Built to compare against current LinkedIn algorithm research

---

## Part 2: Comments Tab Improvements

### Problem
- 26 manual button selections (6 goals + 6 tones + 4 lengths + 7 styles + 3 inputs) before AI generates
- "Background" field requires manual input even though user profile data is available
- No way for AI to auto-decide optimal settings per post
- Prompt doesn't analyze the post before commenting

### Solution
1. **Add "Auto Decide" toggle** — AI reads the post + user profile and picks optimal Goal, Tone, Length, Style automatically
2. **Auto-fill Background** from user's LinkedIn profile data (headline/about)
3. **Add post analysis to comment prompt** — Before commenting, briefly analyze: what is the main point, what angle can I add?
4. **Add relationship-aware rules** to prompt

### New Comment Prompt Rules (Added)
```
Pre-Analysis (internal, 1-2 bullets):
- What is the main point of this post?
- What angle can I uniquely add based on my profile?

Rules:
1. Use my Voice Profile tone and formatting.
2. Explicitly reference a specific sentence or idea from the post so it's clear I read it.
3. For "prospect" relationships, subtly show expertise — no hard selling.
4. No generic "great post" / "thanks for sharing" without specifics.
```

---

## Part 3: Updated AI Prompts

### 3A. Post Generation Prompt (Updated)

Changes:
- Added Q1 2026 algorithm signals (dwell time, saves, meaningful comments)
- Stronger anti-AI detection rules
- Better specificity enforcement
- Mobile-first formatting guidance

The prompt in `lib/openai-config.ts` `generatePostPrompt()` is already well-optimized. Minor improvements:

1. **Add "SAVE-WORTHY" directive** — Tell AI to include frameworks/checklists people bookmark
2. **Strengthen banned words list** — Add "harness", "foster", "spearhead", "delve", "cutting-edge"
3. **Add sentence variety rule** — "Vary sentence length: 3 words. Then twenty-five."

### 3B. AI Post Analysis Prompt (NEW)

```
You are a LinkedIn post analyst. Evaluate this post against the Q1 2026 LinkedIn algorithm and provide HONEST, critical feedback.

POST TO ANALYZE:
{postContent}

AUTHOR PROFILE:
{authorHeadline}

EVALUATE THESE 4 METRICS (0-100 each) WITH REASONING:

1. HUMAN SCORE (Does this sound like a real person wrote it?)
   - Check for: AI-typical phrases, natural voice, personal details, varied sentence length
   - Red flags: "game-changer", "leverage", "navigate", em dashes, generic statements
   - Green flags: Contractions, specific names/numbers/dates, verbal tics, first-person stories

2. PERFORMANCE STRENGTH (Is the hook, body, and CTA strong?)
   - Hook: Does the first line force a "see more" click? (4-8 words, pattern interrupt)
   - Body: Are there specific details, frameworks, or save-worthy content?
   - CTA: Does the closing question require a 15+ word thoughtful response?
   - Structure: Short paragraphs, blank lines, mobile-optimized?

3. REACH POTENTIAL (Will the algorithm amplify this?)
   - Dwell time: Does content reward reading to the end?
   - Save-worthy: Frameworks, checklists, insights people want to return to?
   - Comment quality: Will this generate meaningful (not generic) comments?
   - No external links in body? No engagement bait?

4. AI PATTERN RISK (Will LinkedIn's AI detector flag this?)
   - Banned word count
   - Sentence structure variety
   - Specificity vs vagueness ratio
   - Personal angle present?
   - Em dash / en dash usage?

Return JSON:
{
  "humanScore": { "score": 0-100, "reasoning": "..." },
  "performanceStrength": { "score": 0-100, "reasoning": "..." },
  "reachPotential": { "score": 0-100, "reasoning": "..." },
  "aiPatternRisk": { "score": 0-100, "reasoning": "..." },
  "topImprovements": ["improvement1", "improvement2", "improvement3"],
  "overallVerdict": "One sentence honest summary"
}
```

### 3C. Auto-Decide Comment Settings Prompt (NEW)

```
You are a LinkedIn engagement strategist. Analyze this post and the commenter's profile to decide the OPTIMAL comment settings.

POST TO COMMENT ON:
Author: {authorName}
Content: {postText}

COMMENTER'S PROFILE:
Headline: {headline}
About: {about}
Skills: {skills}

DECIDE THE OPTIMAL SETTINGS:

1. GOAL — Pick ONE: AddValue | ShareExperience | AskQuestion | DifferentPerspective | BuildRelationship | SubtlePitch
   Consider: What would create the most meaningful engagement with this specific post?

2. TONE — Pick ONE: Professional | Friendly | ThoughtProvoking | Supportive | Contrarian | Humorous
   Consider: What tone matches both the post's energy and the commenter's brand?

3. LENGTH — Pick ONE: Brief | Short | Mid | Long
   Consider: How much depth does this post warrant? Simple posts = Brief. Deep analysis = Mid/Long.

4. STYLE — Pick ONE: direct | structured | storyteller | challenger | supporter | expert | conversational
   Consider: What structure best delivers the chosen goal?

Return ONLY this JSON (no explanation):
{
  "goal": "...",
  "tone": "...",
  "length": "...",
  "style": "...",
  "reasoning": "One sentence explaining why these settings fit this post"
}
```

### 3D. Comment Generation Prompt (Updated)

Added to the existing prompt in `lib/openai-config.ts` `generateCommentPrompt()`:

```
══════════════════════════════════════════════════
PRE-ANALYSIS (Do this internally before writing)
══════════════════════════════════════════════════

Before writing, briefly analyze:
1. What is the main point of this post?
2. What specific sentence or idea can I reference to show I read it?
3. What unique angle can I add based on my expertise/background?

══════════════════════════════════════════════════
ENGAGEMENT RULES (NON-NEGOTIABLE)
══════════════════════════════════════════════════

1. REFERENCE RULE: Explicitly reference a specific sentence, stat, or idea from the post. Show you READ it.
2. VOICE RULE: Use the commenter's natural voice and formatting style.
3. NO GENERIC OPENERS: Never start with "Great post", "Thanks for sharing", "I agree", "Well said", "This is so true", "Love this".
4. PROSPECT RULE: For professional relationships, subtly demonstrate expertise. No hard selling. No "DM me".
5. SPECIFICITY RULE: Every sentence must pass: "Could this comment apply to ANY post?" If yes, rewrite.
```

---

## Part 4: Implementation Checklist

### Writer Tab
- [x] Remove Outcome Focus section
- [x] Remove Template dropdown (Post Type handles it)
- [x] Remove Length dropdown (Depth handles it)
- [x] Collapse Tone dropdown into Config section
- [x] Move "Analyze Post" into AI Post Helper with AI-powered analysis
- [x] Create `/api/ai/analyze-post-deep` API endpoint

### Comments Tab
- [x] Add "Auto Decide" toggle with AI model
- [x] Create `/api/ai/auto-decide-comment` API endpoint
- [x] Auto-fill Background from user profile data
- [x] Update comment prompt with post analysis + engagement rules
- [x] Update `generateCommentPrompt()` in openai-config.ts

### AI Prompts Updated
- [x] Post generation: Already optimized, minor banned word additions
- [x] Post analysis: New AI-powered analysis prompt (replaces heuristic)
- [x] Auto-decide: New prompt for optimal comment settings
- [x] Comment generation: Added pre-analysis + engagement rules
