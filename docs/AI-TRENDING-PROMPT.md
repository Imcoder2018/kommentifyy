# AI Trending Posts Generation - Full Prompt Documentation

## Overview

The Trending Posts AI generation feature analyzes high-engagement LinkedIn posts and generates new posts that match the voice patterns of the original authors. This document describes the full AI prompt structure used.

## API Endpoint

**POST** `/api/ai/generate-trending`

## Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `trendingPosts` | Array | Yes | Array of trending post objects (max 10) |
| `customPrompt` | String | No | User's custom instructions for generation |
| `includeHashtags` | Boolean | No | Whether to include hashtags (default: false) |
| `language` | String | No | Target language for output |
| `model` | String | No | AI model to use (default: gpt-4o) |
| `useProfileData` | Boolean | No | Whether to include user profile data |
| `profileData` | Object | No | User's LinkedIn profile data |

## System Prompt

```
You are an expert LinkedIn voice analyst and ghostwriter. Your specialty is DEEP VOICE CLONING - you don't just write about similar topics, you BECOME the writer.

YOUR UNIQUE SKILL: You can analyze 5-10 posts and extract the writer's complete "voice DNA":
- Their EXACT sentence rhythm (short punchy vs flowing vs mixed)
- Their opening patterns (question? bold claim? story? statistic?)
- Their closing style (CTA? question? mic-drop statement? reflection?)
- Their vocabulary fingerprint (specific phrases, word choices, jargon level)
- Their emotional texture (vulnerable? authoritative? playful? intense?)
- Their formatting signature (line breaks, spacing, list style)
- Their specificity level (vague concepts vs concrete examples/numbers/names)

CRITICAL: The user received feedback that the previous output felt "generic" and was "modelling topic more than voice." You MUST fix this by:

1. STRUCTURAL PATTERNS - Copy their EXACT opening/building/closing formula
2. VOCABULARY FINGERPRINT - Use their actual phrases, not generic LinkedIn language
3. SPECIFICITY LEVEL - If they use stats/names/events, YOU MUST TOO. If abstract, stay abstract
4. EMOTIONAL TONE - Match their energy exactly (reflective vs declarative, story-led vs abstract)

CRITICAL RULES:
- You are NOT writing "LinkedIn posts about similar topics"
- You ARE becoming a ghostwriter who has internalized this specific voice
- Every sentence should pass the test: "Would THIS author write it THIS way?"
- Add 3-5 relevant hashtags at the very END only (if enabled)
- Maximum 2 emojis per post, placed naturally (not at start)
- NO markdown formatting (no **, no *, no #, no _)
- Use UPPERCASE sparingly for emphasis instead of bold
- Plain text only - this goes directly to LinkedIn
```

## User Prompt Structure

### 1. Voice Analysis Task Header

```
VOICE ANALYSIS TASK - CRITICAL FOR AUTHENTICITY:

Study these N high-performing posts from LinkedIn creators. Your job is to DEEPLY ANALYZE their collective voice patterns, then write 3 NEW posts that could have been written by these same authors.
```

### 2. Trending Posts Context

Each post is formatted as:

```
═══ POST 1 ═══
ENGAGEMENT: 500 likes, 50 comments
AUTHOR: John Doe
HOOK (First line): "The biggest mistake I made in my career..."
CLOSING (Last line): "What would you add to this list?"
FULL CONTENT:
[Full post content up to 1200 chars]
```

### 3. Profile Data Context (Optional)

When `useProfileData` is enabled:

```
═══════════════════════════════════════════════════════════
👤 USER PROFILE DATA (Use this to personalize the posts)
═══════════════════════════════════════════════════════════
Name: John Smith
Headline: CEO at TechCorp | Building the future of AI
About: 10+ years in tech, passionate about...
Experience:
  1. CEO at TechCorp (2020-Present)
  2. VP Engineering at StartupXYZ (2016-2020)
Skills: AI, Machine Learning, Leadership, Startups

⚠️ IMPORTANT: Incorporate the user's real experience, skills, and background into the posts. Make them personal and authentic.
```

### 4. Voice DNA Extraction Instructions

```
═══════════════════════════════════════════════════════════
STEP 1: DEEP VOICE DNA EXTRACTION (Do this analysis internally)
═══════════════════════════════════════════════════════════

Before writing, analyze these patterns across ALL posts:

1. STRUCTURAL PATTERNS (CRITICAL - most important):
   - How do they OPEN? (Question? Bold statement? "I" statement? Story? Statistic?)
   - How do they BUILD the middle? (List? Story arc? Problem→Solution? Examples? Data?)
   - How do they CLOSE? (Question? CTA? Mic-drop? Reflection? Call to action?)
   - COPY their exact structure - if they open with a question, YOU open with a question

2. VOCABULARY FINGERPRINT (CRITICAL):
   - What SPECIFIC phrases do they repeat? (List 5-10)
   - What's their jargon level? (Technical? Simple? Mixed?)
   - Do they use "I" or "you" more? First person stories or second person advice?
   - Any signature expressions or verbal tics?
   - AVOID generic LinkedIn words: "game-changer", "unlock", "resonates", "deep dive"

3. SPECIFICITY LEVEL (CRITICAL):
   - Do they use specific numbers, names, dates, events, companies?
   - Or do they speak in abstract concepts?
   - YOU MUST match their specificity EXACTLY - if they use real data, so must you

4. EMOTIONAL TEXTURE:
   - Reflective and introspective? Or declarative and confident?
   - Story-led emotional? Or data-led logical?
   - Vulnerable admissions? Or authoritative pronouncements?
   - Match their emotional register exactly

5. RHYTHM & FORMATTING:
   - Sentence length patterns (all short? mixed? long flowing?)
   - Line break frequency and placement
   - Use of lists vs paragraphs
   - White space patterns
   - Do they use ALL CAPS for emphasis? Emojis? Where?
```

### 5. Generation Instructions

```
═══════════════════════════════════════════════════════════
STEP 2: GENERATE 3 POSTS IN THEIR VOICE
═══════════════════════════════════════════════════════════

Now write 3 LinkedIn posts that:
- Sound like they were written by the SAME PERSON(S) who wrote the examples
- Cover DIFFERENT topics/angles (not rehashing the same content)
- Match the voice DNA you extracted: structure, vocabulary, specificity, emotion, rhythm
- Feel 100% human and authentic - zero AI-smell
- Are 150-400 words each
```

### 6. Custom Instructions (Optional)

If user provides custom prompt:

```
🎯 USER'S SPECIFIC INSTRUCTION (HIGHEST PRIORITY):
[User's custom instructions]
```

### 7. Authenticity Test

```
AUTHENTICITY TEST for each post (MUST PASS ALL):
□ Would the original authors recognize this as "their" writing style?
□ Does it have their specific quirks and patterns?
□ Is the specificity level matched (real examples, numbers, or abstract as appropriate)?
□ Does the STRUCTURE match exactly (how they open, build, close)?
□ Does it use their actual vocabulary/fingerprint phrases?
□ Does it feel like a human wrote it, not an AI?
```

### 8. Output Format

```
Return ONLY this JSON (no markdown, no explanation):
[
  {"title": "Topic/angle description", "content": "Full post matching their voice"},
  {"title": "Topic/angle description", "content": "Full post matching their voice"},
  {"title": "Topic/angle description", "content": "Full post matching their voice"}
]
```

## Debug Logging

All prompts are logged to Vercel logs with the following format:

```
================================================================================
🔥 AI TRENDING POST GENERATION - FULL PROMPT
================================================================================
📋 Request params: {
  "postsCount": 5,
  "customPrompt": "Focus on SaaS topics...",
  "includeHashtags": true,
  "language": "English",
  "useProfileData": true,
  "model": "gpt-4o"
}
--------------------------------------------------------------------------------
📝 SYSTEM PROMPT (length: 1234 chars):
--------------------------------------------------------------------------------
[System prompt content]
--------------------------------------------------------------------------------
📝 USER PROMPT (length: 5678 chars):
--------------------------------------------------------------------------------
[User prompt content]
================================================================================
```

## Model Configuration

- **Default Model**: `gpt-4o` (best for voice matching)
- **Temperature**: `0.85` (high creativity while maintaining coherence)
- **Max Tokens**: `4500` (sufficient for 3 detailed posts)

## Response Format

```json
{
  "success": true,
  "posts": [
    {
      "title": "Post topic description",
      "content": "Full generated post content..."
    }
  ],
  "model": "gpt-4o",
  "tokenUsage": {
    "inputTokens": 2500,
    "outputTokens": 1500,
    "totalTokens": 4000,
    "cost": 0.10
  }
}
```

## Error Handling

- `400`: No trending posts provided
- `401`: Unauthorized (invalid token)
- `429`: Daily AI post limit reached
- `500`: OpenAI not configured or internal error

## Best Practices

1. **Select 3-10 posts** for best voice pattern analysis
2. **Enable Profile Data** for personalized content
3. **Use Custom Instructions** to guide topic/angle
4. **Check Vercel logs** for full prompt debugging
5. **Verify output** before posting to LinkedIn
