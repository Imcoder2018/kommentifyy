# Kommentify AI Prompts Documentation

This document lists all AI prompts used in Kommentify, including the exact variables injected into each prompt.

---

## 1. Post Writer Tab — `generatePostPrompt()` 

**File:** `lib/openai-config.ts` → `generatePostPrompt()`  
**API Route:** `app/api/ai/generate-post/route.ts`  
**Model:** `gpt-4o-mini` (default)  
**Temperature:** 0.85  
**Max Tokens:** 2000

### Variables

| Variable | Source | Description |
|---|---|---|
| `topic` | User input | The post topic/subject |
| `template` | Dropdown selection | Post type: `lead_magnet`, `thought_leadership`, `personal_story`, `question`, `advice`, `insight`, `controversial`, `case_study`, `announcement`, `achievement`, `tip`, `story`, `poll`, `motivation`, `how_to` |
| `tone` | Dropdown selection | `professional`, `friendly`, `inspirational`, `bold`, `educational`, `conversational`, `authoritative`, `humorous`, `casual`, `enthusiastic`, `thoughtful` |
| `length` | Dropdown selection | Target character count: `500`, `900`, `1500`, `2500` |
| `includeHashtags` | Checkbox (off by default) | Whether to add 3-5 hashtags at the end |
| `includeEmojis` | Checkbox (on by default) | Whether to use 2-4 emojis |
| `language` | Dropdown (empty = auto) | Force output language: `English`, `Spanish`, `French`, `German`, `Portuguese`, `Italian`, `Dutch`, `Russian`, `Chinese`, `Japanese`, `Korean`, `Arabic`, `Hindi`, `Urdu`, `Turkish`, `Polish`, `Swedish`, `Indonesian`, `Thai`, `Vietnamese` |
| `targetAudience` | Text input (advanced) | e.g., "Startup founders" |
| `keyMessage` | Text input (advanced) | e.g., "Book a call" |
| `userBackground` | Text input (advanced) | e.g., "CEO at TechCorp" |
| `inspirationContext` | Auto-fetched from vector DB | Style examples from selected inspiration source profiles |

### System Message
```
You are an elite LinkedIn content strategist with 15+ years of experience creating viral posts. Follow the instructions exactly and create compelling, high-engagement content.
```

### User Prompt (abbreviated structure)
```
You are an elite LinkedIn content strategist and ghostwriter with 15+ years of experience...

═══ USER INPUTS ═══
POST_TYPE: ${postType}
TONE: ${toneStyle}
TOPIC: ${topic}
TARGET_AUDIENCE: ${targetAudience || 'Professionals and business leaders'}
KEY_MESSAGE_OR_CTA: ${keyMessage || 'Engage with the content and share thoughts'}
USER_BACKGROUND: ${userBackground || 'Not specified'}

═══ PSYCHOLOGICAL PRINCIPLES ═══
1. CURIOSITY GAP
2. PATTERN INTERRUPT
3. SOCIAL PROOF
4. PERSONAL VULNERABILITY
5. RECIPROCITY
6. SPECIFICITY
7. RELATABILITY

═══ 2025 LINKEDIN ALGORITHM OPTIMIZATION ═══
RELEVANCE (40%), EXPERTISE (30%), ENGAGEMENT QUALITY (30%)

═══ POST STRUCTURE ═══
HOOK → OPENING → BODY → CLOSING → CTA

═══ FORMATTING RULES ═══
CHARACTER COUNT: Target ${length} characters
EMOJIS: ${includeEmojis ? '2-4 strategically placed' : 'NO emojis'}
HASHTAGS: ${includeHashtags ? '3-5 at VERY END' : 'NO hashtags'}

═══ LANGUAGE REQUIREMENT ═══
${language ? `Write ENTIRE post in ${language}` : 'Not specified (default English)'}

═══ INSPIRATION STYLE (if enabled) ═══
${inspirationContext}

Now create a viral LinkedIn post...
```

---

## 2. Trending Posts AI — `generate-trending` 

**File:** `app/api/ai/generate-trending/route.ts`  
**Model:** `gpt-4o-mini`  
**Temperature:** 0.9  
**Max Tokens:** 4000

### Variables

| Variable | Source | Description |
|---|---|---|
| `trendingPosts` | Selected posts from trending list | Array of posts with `postContent`, `likes`, `comments` |
| `customPrompt` | Text input | Optional custom AI instruction |
| `includeHashtags` | Checkbox (off by default) | Whether to add hashtags |
| `language` | Dropdown (empty = auto) | Force output language |

### System Prompt
```
You are an elite LinkedIn ghostwriter who has studied thousands of viral posts. Your job is to analyze trending posts and create NEW posts that will go viral.

RULES:
- Write like a REAL human, not AI. No corporate jargon. No fluff.
- Use pattern interrupts, bold opening hooks, and emotional storytelling
- Keep sentences short. Use line breaks liberally.
- Include a strong call-to-action or thought-provoking question at the end
- ${includeHashtags ? 'Include 3-5 relevant hashtags at END' : 'NO hashtags'}
- NO emojis overload (1-2 max per post)
- Each post MUST be unique in angle, structure, and voice
- Study the PATTERNS in the trending posts
- CRITICAL: No markdown formatting (**, *, #, _)
- Use UPPERCASE for emphasis instead
- Never output asterisks around words
```

### User Prompt
```
Here are ${trendingPosts.length} currently trending LinkedIn posts with high engagement:

POST 1 (${likes} likes, ${comments} comments):
${postContent}

---

POST 2...

Based on the patterns, generate EXACTLY 3 new LinkedIn posts that would go viral.

Each post should:
1. Use a different angle/perspective
2. Have a killer opening hook
3. Feel genuinely human and authentic
4. Be 150-400 words
5. Include natural engagement triggers
${language ? '6. CRITICAL: Write ENTIRE post in ${language}' : ''}

${customPrompt ? 'ADDITIONAL USER INSTRUCTION: ${customPrompt}' : ''}

Return as JSON: [{"title": "...", "content": "..."}, ...]
```

**Post-processing:** Each generated post's content is run through `formatForLinkedIn()` from `lib/linkedin-formatter.ts`.

---

## 3. AI Comment Generation — `generateCommentPrompt()` 

**File:** `lib/openai-config.ts` → `generateCommentPrompt()`  
**API Route:** `app/api/ai/generate-comment/route.ts`  
**Model:** `gpt-4o`  
**Temperature:** 0.8  
**Max Tokens:** Varies by length (Brief=40, Short=120, Mid=250, Long=400)

### Variables

| Variable | Source | Description |
|---|---|---|
| `postText` | LinkedIn post content | The post being commented on |
| `tone` | Settings or per-request | `Professional`, `Friendly`, `ThoughtProvoking`, `Supportive`, `Contrarian`, `Humorous` |
| `goal` | Settings or per-request | `AddValue`, `ShareExperience`, `AskQuestion`, `DifferentPerspective`, `BuildRelationship`, `SubtlePitch` |
| `commentLength` | Settings or per-request | `Brief` (100 chars), `Short` (300 chars), `Mid` (600 chars), `Long` (900 chars) |
| `commentStyle` | Settings or per-request | `direct`, `structured`, `storyteller`, `challenger`, `supporter`, `expert`, `conversational` |
| `userExpertise` | Settings | User's area of expertise |
| `userBackground` | Settings | User's professional background |
| `authorName` | Auto-detected | Name of the post author |
| `styleExamples` | Auto-fetched from DB | Comment examples from selected comment style profiles |
| `useProfileStyle` | Toggle | If ON, ignores goal/tone/style and mimics profile examples only |

### Mode A: Profile Style Mode (useProfileStyle = true)
```
You are a LinkedIn comment ghostwriter. Your ONLY job is to write a comment that sounds EXACTLY like the person who wrote these example comments.

═══ STYLE EXAMPLES ═══
[Example 1]: "${styleExample1}"
[Example 2]: "${styleExample2}"
...

═══ POST TO COMMENT ON ═══
Author: ${authorName}
Post: ${postText}

═══ INSTRUCTIONS ═══
1. Study examples. Mimic their EXACT tone, voice, structure, humor, personality
2. Write a NEW comment that sounds like the SAME PERSON
3. Must be relevant to post content
4. No hashtags, no quotation marks around response
5. Output ONLY the comment text
```

### Mode B: Normal Mode (useProfileStyle = false)
```
You are a world-class LinkedIn engagement specialist and "comment ghostwriter"...

═══ USER INPUTS ═══
ORIGINAL_POST_CONTENT: ${postText}
COMMENTER_EXPERTISE: ${userExpertise}
COMMENTER_BACKGROUND: ${userBackground}
COMMENT_GOAL: ${goal}
TONE: ${tone}
POST_AUTHOR_NAME: ${authorName}

═══ PSYCHOLOGY OF HIGH-IMPACT COMMENTS ═══
(5 principles: Specificity Signal, Value Addition, Credibility Markers, Engagement Invitation, Profile Curiosity)

═══ THE 5-PART COMMENT FRAMEWORK ═══
PART 1: Specific Acknowledgment (1 sentence)
PART 2: Value Bomb (2-3 sentences)
PART 3: Subtle Credibility Marker (optional)
PART 4: Engagement Hook (optional)
PART 5: Soft CTA (only for SubtlePitch)

═══ FORMATTING RULES ═══
LENGTH - CRITICAL:
${commentLength === 'Brief' ? 'HARD MAX: 100 characters' : ''}
${commentLength === 'Short' ? 'HARD MAX: 300 characters' : ''}
${commentLength === 'Mid' ? 'HARD MAX: 600 characters' : ''}
${commentLength === 'Long' ? 'HARD MAX: 900 characters' : ''}

STYLE: ${selectedStyle}
EMOJIS: ABSOLUTELY FORBIDDEN
BANNED WORDS: "curious", "intrigued", "fascinating", "insightful", "resonates"
BANNED PUNCTUATION: em dash "—", en dash "–"

═══ LANGUAGE DETECTION ═══
Write in the SAME language as the original post (auto-detected).

NEVER exceed ${charLimit} characters.
```

**Post-processing:**
1. `formatCommentForLinkedIn()` applied
2. **Hard character limit enforced** — if output exceeds the limit, it's truncated at the nearest sentence boundary

### Character Limits (enforced server-side)

| Setting | Max Characters | Max Tokens |
|---|---|---|
| Brief | 100 | 40 |
| Short | 300 | 120 |
| Mid | 600 | 250 |
| Long | 900 | 400 |

---

## 4. Post Analysis — `analyze-posts`

**File:** `app/api/ai/analyze-posts/route.ts`  
**Model:** `gpt-4o-mini`

Scores generated posts for viral potential. Returns JSON with `score`, `feedback`, and `improvements` for each post.

---

## LinkedIn Formatting Pipeline

All AI-generated content passes through `lib/linkedin-formatter.ts`:

- `formatForLinkedIn(text)` — Converts `**bold**` markdown to Unicode bold, cleans up `*`, `#`, `_` markers, fixes hashtag placement, normalizes line breaks
- `formatCommentForLinkedIn(text)` — Strips quotes, removes hashtags, cleans banned characters, enforces no-emoji policy
- `toBoldUnicode(text)` — Converts ASCII to Unicode Mathematical Bold characters for LinkedIn-compatible bold text
