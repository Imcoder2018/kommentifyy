# AI Post Generation Prompts

This document details the full AI prompts, variables, and relevant script files for LinkedIn post generation in Kommentify.

## Overview

Post generation uses OpenAI GPT models to create LinkedIn posts based on user inputs, inspiration sources, and optional profile data.

---

## API Endpoint

**File:** `app/api/ai/generate-post/route.ts`

**Lines:** 1-317

### Request Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `topic` | string | The main topic/idea for the post |
| `template` | string | Post type (see templates below) |
| `tone` | string | Writing tone (see tones below) |
| `length` | number | Target character count |
| `includeHashtags` | boolean | Whether to include hashtags |
| `includeEmojis` | boolean | Whether to include emojis |
| `language` | string | Target language for output |
| `targetAudience` | string | Intended audience |
| `keyMessage` | string | Key message/CTA to convey |
| `userBackground` | string | Author's background context |
| `useInspirationSources` | boolean | Whether to use inspiration sources |
| `inspirationSourceNames` | string[] | Names of selected inspiration sources |
| `useProfileData` | boolean | Whether to include user's LinkedIn profile |
| `profileData` | object | User's LinkedIn profile data |
| `model` | string | AI model to use |

---

## Prompt Building Functions

### Base Post Prompt

**File:** `lib/openai-config.ts`  
**Function:** `generatePostPrompt()`  
**Lines:** 302-421

#### Post Templates (Lines 314-330)

```typescript
const postTypeMap = {
    'lead_magnet': 'Lead Magnet - Offer valuable free resource/download to capture leads',
    'thought_leadership': 'Thought Leadership - Share unique industry opinion, prediction, or controversial take',
    'personal_story': 'Personal Story - Vulnerable narrative with transformation and lesson learned',
    'question': 'Question/Poll - Spark discussion, debate, and diverse perspectives',
    'advice': 'Advice/Tips - Actionable list of insights, frameworks, or strategies',
    'insight': 'Industry Insight - News analysis, trend breakdown, or market commentary',
    'controversial': 'Controversial Opinion - Challenge widely-accepted beliefs or practices',
    'case_study': 'Case Study - Detailed results, transformation story, before/after',
    'announcement': 'Announcement - Share news, launch, or milestone',
    'achievement': 'Achievement - Share success or milestone with lessons',
    'tip': 'Pro Tip - Single actionable insight',
    'story': 'Story - Compelling narrative with lesson',
    'poll': 'Poll - Create engagement with options',
    'motivation': 'Motivation - Inspiring and empowering message',
    'how_to': 'How-To Guide - Step-by-step tutorial'
};
```

#### Tone Options (Lines 332-344)

```typescript
const toneMap = {
    'professional': 'Professional - Formal, polished, corporate-appropriate, authoritative',
    'friendly': 'Friendly - Warm, approachable, conversational, like talking to a colleague',
    'inspirational': 'Inspirational - Motivational, uplifting, encouraging, empowering',
    'bold': 'Bold/Provocative - Challenging, edgy, pushes boundaries, contrarian',
    'educational': 'Educational - Teaching-focused, informative, professor-like, methodical',
    'conversational': 'Conversational - Casual, relatable, everyday language, authentic',
    'authoritative': 'Authoritative - Expert, credible, backed by data and experience, confident',
    'humorous': 'Humorous - Light-hearted, entertaining, witty, uses tasteful humor',
    'casual': 'Casual - Relaxed and informal',
    'enthusiastic': 'Enthusiastic - Energetic and excited',
    'thoughtful': 'Thoughtful - Deep and reflective'
};
```

---

## Full Base Prompt Template

**File:** `lib/openai-config.ts:349-420`

```
You are a LinkedIn ghostwriter. Write ONE post about the topic below.

══════════════════════════════════════════════════
USER INPUTS
══════════════════════════════════════════════════

POST TYPE: {postType}
TONE: {toneStyle}
TOPIC: {topic}
TARGET AUDIENCE: {targetAudience}
KEY MESSAGE/CTA: {keyMessage}
AUTHOR BACKGROUND: {userBackground}

══════════════════════════════════════════════════
POST STRUCTURE
══════════════════════════════════════════════════

1. HOOK (first line): 4-8 words. Stop the scroll. Use a bold claim, specific number, counterintuitive statement, or personal confession.

2. OPENING (lines 2-4): Bridge to the body. Add specific context - a timeframe, situation, or problem. Front-load value before the "see more" fold (~150 chars).

3. BODY: Deliver substance based on the post type.
   - Short paragraphs (1-2 sentences each), separated by blank lines
   - Include at least 2 SPECIFIC details: numbers, names, timeframes, named companies, real examples
   - For stories: use concrete sensory details, not abstract summaries
   - For advice: give actionable frameworks with steps, not platitudes
   - For insights: cite specific data points or observable trends

4. CLOSING: One memorable takeaway line. Quotable. Screenshot-worthy.

5. CTA: Ask an open-ended question that requires a thoughtful answer (not yes/no).

══════════════════════════════════════════════════
FORMATTING
══════════════════════════════════════════════════

CHARACTER COUNT: Target {length} characters
LINE BREAKS: One sentence per paragraph, blank line between each
EMOJIS: {includeEmojis ? 'Use 2-4 strategically placed emojis, never in hook' : 'NO emojis - zero allowed'}
HASHTAGS: {includeHashtags ? 'Add 3-5 relevant hashtags at the VERY END after a blank line' : 'NO hashtags'}

══════════════════════════════════════════════════
AUTHENTICITY RULES (CRITICAL)
══════════════════════════════════════════════════

1. SPECIFICITY OVER GENERALITY: Replace every vague claim with a specific one.

2. HUMAN VOICE: Write like a real person typing on their phone, not a marketing department.

3. BANNED WORDS: "game-changer", "unlock", "leverage", "paradigm shift", "deep dive", "resonate", "navigate", "landscape", "realm", "embark", "tapestry", "synergy", "utilize"

4. BANNED PUNCTUATION: No em dashes "—" or en dashes "–".

5. NO GENERIC STATEMENTS: Every sentence must pass the specificity test.

6. PERSONAL ANGLE: Include at least one first-person observation or experience.

Output ONLY the post content. No labels, no explanation, no meta-commentary.
```

---

## Inspiration Sources Context

**File:** `app/api/ai/generate-post/route.ts:86-165`

When `useInspirationSources` is enabled and inspiration sources are selected, the following context is appended to the prompt:

```
═══════════════════════════════════════════════════════════
🎨 VOICE DNA - DEEP STYLE ANALYSIS (HIGHEST PRIORITY)
═══════════════════════════════════════════════════════════

Before writing, DEEPLY ANALYZE these {count} posts from profiles the user admires. Extract their complete "voice DNA":

[Post 1 by {authorName}]:
HOOK: "{firstLine}"
CLOSING: "{lastLine}"
FULL POST:
{content}

═══════════════════════════════════════════════════════════
VOICE EXTRACTION CHECKLIST - Analyze BEFORE writing:
═══════════════════════════════════════════════════════════

1. STRUCTURAL PATTERNS (most important):
   - How do they OPEN? (Question? Bold claim? Story? "I" statement? Statistic?)
   - How do they BUILD? (List? Story arc? Problem-Solution? Data-driven? Examples?)
   - How do they CLOSE? (Question? CTA? Mic-drop? Reflection? Call to action?)
   - COPY their exact structure.

2. VOCABULARY FINGERPRINT:
   - What specific phrases do they repeat?
   - Jargon level? (Technical? Simple? Mixed?)
   - Do they use "I" or "you" more?
   - Any signature expressions or verbal tics?
   - AVOID generic LinkedIn words.

3. SPECIFICITY LEVEL:
   - Do they cite specific numbers, names, dates, events, companies?
   - YOU MUST match their specificity exactly.

4. EMOTIONAL TEXTURE:
   - Reflective/introspective or declarative/confident?
   - Story-led emotional or data-led logical?
   - Vulnerable admissions or authoritative pronouncements?

5. RHYTHM & FORMATTING:
   - Sentence length patterns
   - Line break frequency and whitespace usage
   - Lists vs paragraphs, emoji placement, ALL CAPS usage

CRITICAL: Every sentence in your output should pass this test: "Would the authors of these example posts write it THIS way?"
```

---

## Profile Data Context

**File:** `app/api/ai/generate-post/route.ts:167-216`

When `useProfileData` is enabled and profile data is provided, the following context is appended:

```
═══════════════════════════════════════════════════════════
👤 USER'S LINKEDIN PROFILE DATA (PERSONALIZE CONTENT)
═══════════════════════════════════════════════════════════

Use this profile information to personalize the post content. Write as if YOU are this person:

HEADLINE: {headline}
ABOUT: {about}
SKILLS: {skills}
EXPERIENCE:
{experience}
EDUCATION: {education}
RECENT POSTS:
[Post 1]: "{post1}"
[Post 2]: "{post2}"
[Post 3]: "{post3}"

═══════════════════════════════════════════════════════════
PERSONALIZATION GUIDELINES:
═══════════════════════════════════════════════════════════
1. Write in FIRST PERSON - use "I", "my", "me" as if you are this person
2. Reference specific experiences, skills, or background naturally
3. Match the tone and style of their recent posts
4. Include relevant details from their headline/about when appropriate
5. Make the content feel authentic to their professional identity
```

---

## AI Service Integration

**File:** `lib/ai-service.ts`

The `generateLinkedInPost()` function handles the actual API call to OpenAI or other configured providers.

### Model Selection

- Default: `gpt-4o-mini`
- Premium: `gpt-4o`
- User can select model via `writerModel` setting

---

## Frontend Integration

**File:** `app/dashboard/page.tsx`

### State Variables (Lines ~251-254)

```typescript
const [inspirationUseAll, setInspirationUseAll] = useState(true);
const [inspirationSelected, setInspirationSelected] = useState<string[]>([]);
const [useProfileData, setUseProfileData] = useState(false);
```

### Generate Post Function (Lines 447-480)

```typescript
const generatePost = async () => {
    const res = await fetch('/api/ai/generate-post', {
        method: 'POST',
        body: JSON.stringify({
            topic: writerTopic,
            template: writerTemplate,
            tone: writerTone,
            length: writerLength,
            includeHashtags: writerHashtags,
            includeEmojis: writerEmojis,
            language: writerLanguage,
            targetAudience: writerTargetAudience,
            keyMessage: writerKeyMessage,
            userBackground: writerBackground,
            useInspirationSources: inspirationSources.length > 0 && (inspirationUseAll || inspirationSelected.length > 0),
            inspirationSourceNames: inspirationUseAll ? inspirationSources.map(s => s.name) : inspirationSelected,
            useProfileData: useProfileData && linkedInProfile,
            profileData: useProfileData && linkedInProfile ? {
                headline: linkedInProfile.headline,
                about: linkedInProfile.about,
                skills: linkedInProfile.skills,
                experience: linkedInProfile.experience,
                education: linkedInProfile.education,
                posts: linkedInProfile.posts
            } : null,
            model: writerModel
        }),
    });
};
```

---

## Related Files

| File | Purpose |
|------|---------|
| `app/api/ai/generate-post/route.ts` | API endpoint for post generation |
| `lib/openai-config.ts` | Prompt templates and configuration |
| `lib/ai-service.ts` | AI service abstraction layer |
| `lib/linkedin-formatter.ts` | Post formatting for LinkedIn |
| `app/dashboard/page.tsx` | Frontend UI and state management |
| `lib/prisma.ts` | Database client for user/plan data |
| `lib/limit-service.ts` | Usage limit checking |
