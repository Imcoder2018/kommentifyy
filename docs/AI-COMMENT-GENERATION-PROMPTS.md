# AI Comment Generation Prompts

This document details the full AI prompts, variables, and relevant script files for LinkedIn comment generation in Kommentify.

## Overview

Comment generation uses OpenAI GPT models to create LinkedIn comments based on post content, user settings, and optional profile/style data.

---

## API Endpoint

**File:** `app/api/ai/generate-comment/route.ts`

**Lines:** 1-413

### Request Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `postText` | string | The LinkedIn post content to comment on |
| `authorName` | string | Author's first name for personalization |
| `tone` | string | Writing tone (see tones below) |
| `goal` | string | Comment goal (see goals below) |
| `commentLength` | string | Length category (Brief/Short/Mid/Long) |
| `commentStyle` | string | Comment style (see styles below) |
| `userExpertise` | string | User's area of expertise |
| `userBackground` | string | User's professional background |
| `useProfileStyle` | boolean | Whether to use scraped comment style examples |
| `model` | string | AI model to use |

---

## Prompt Building Functions

### Comment Prompt Generator

**File:** `lib/openai-config.ts`  
**Function:** `generateCommentPrompt()`  
**Lines:** 75-297

### Comment Styles (Lines 87-138)

```typescript
const styleInstructions = {
    'direct': `STYLE = "Direct & Concise"
STRUCTURE: Write the ENTIRE comment as a SINGLE paragraph. No line breaks. Straight to the point.
EXAMPLE SHAPE: "[Name], [specific reference to their point]. [Your added value in 1-2 sentences]. [Optional short closer]."
DO NOT split into multiple paragraphs. One flowing block of text.`,

    'structured': `STYLE = "Structured"
STRUCTURE: Write EXACTLY 2-3 short paragraphs. MANDATORY: separate each paragraph with a blank line.
Paragraph 1 (required): Acknowledge a specific point from their post. 1-2 sentences.
Paragraph 2 (required): Add your insight, data, or experience. 1-2 sentences.
Paragraph 3 (optional): A question or forward-looking statement. 1 sentence.`,

    'storyteller': `STYLE = "Storyteller"
STRUCTURE: LEAD with a brief personal anecdote (1-2 sentences). Then connect it back to their post's point.
Opening sentence MUST start with a personal experience: "Last month I...", "A few years ago...", "I remember when...", "Early in my career..."
The story must be specific (names, numbers, timeframes) and directly relevant.
End by tying your story back to the author's message.`,

    'challenger': `STYLE = "Challenger"
STRUCTURE: Respectfully offer a DIFFERENT perspective. You are NOT agreeing - you are adding productive tension.
Opening: Acknowledge their point briefly, then pivot with "However...", "One thing I'd push back on...", "The counterargument worth considering..."
Body: Present your alternative view with specific evidence or reasoning.
Tone: Respectful but firm. You have a clear position.`,

    'supporter': `STYLE = "Supporter"
STRUCTURE: Strongly VALIDATE their message with concrete evidence from your own experience.
Opening: Affirm their specific point (not generic praise).
Body: Back it up with YOUR data, results, or concrete example that proves they're right.
Pattern: "You're spot on about X. In my experience with [specific], I saw [specific result]."`,

    'expert': `STYLE = "Expert"
STRUCTURE: Reference data, research, or deep domain experience. Use industry terminology naturally.
Opening: Reference a specific claim from their post.
Body: Add expert-level context - cite a study, share a metric, reference a framework.
Language: Use precise domain vocabulary. Show you live and breathe this topic.`,

    'conversational': `STYLE = "Conversational"
STRUCTURE: Write like you're talking to a colleague over coffee. Casual, warm, human.
Use contractions (I've, don't, it's). Use informal transitions ("honestly", "the thing is", "here's what gets me").
Can include a light rhetorical question. Keep it flowing and natural.`
};
```

### Comment Goals (Lines 141-177)

```typescript
const goalInstructions = {
    'AddValue': `GOAL = "Add Value"
YOUR MISSION: Contribute something genuinely USEFUL that wasn't in the original post. Zero self-promotion.
You must add ONE of: a complementary data point, a tactical tip, an alternative framework, a relevant resource, or an insight from adjacent experience.
The reader should think "That's a great point I hadn't considered."
DO NOT mention yourself, your company, or anything self-serving.`,

    'ShareExperience': `GOAL = "Share Experience"
YOUR MISSION: Tell a brief, specific personal story that adds perspective to their point.
Your story MUST include at least 2 of: a specific timeframe, a named company/person/event, a measurable outcome, a concrete lesson learned.
Pattern: "When I [specific experience], I learned that [specific insight]. The result was [specific outcome]."
The story must DIRECTLY relate to the post's topic.`,

    'AskQuestion': `GOAL = "Ask Question"
YOUR MISSION: Deepen the discussion by asking a genuinely thought-provoking question the author hasn't addressed.
Your question should make the author AND other readers stop and think. It should NOT be answerable with yes/no.
Pattern: Briefly reference what they said, then ask something that extends the conversation into new territory.
The question should reveal YOUR expertise through what you choose to ask about.`,

    'DifferentPerspective': `GOAL = "Different Perspective"
YOUR MISSION: Respectfully challenge or add important nuance. You are NOT here to agree.
Present a specific counterpoint backed by evidence or reasoning. Be constructive, not combative.
Pattern: "I'd add one nuance here - [your counterpoint]. In [context], I've seen [different outcome] because [reasoning]."
Make the reader think "That's a fair point" even if they initially disagreed.`,

    'BuildRelationship': `GOAL = "Build Relationship"
YOUR MISSION: Warm, supportive engagement that makes the author feel seen and valued.
Reference something SPECIFIC about their journey, growth, or perspective that shows you pay attention.
Pattern: "[Name], the way you framed [specific point] really captures something most people miss. [Add personal connection or genuine observation]."
Feel like a trusted peer, not a fan.`,

    'SubtlePitch': `GOAL = "Subtle Pitch"
YOUR MISSION: Position yourself strategically with a soft CTA. No hard selling.
Lead with genuine value first (80% of the comment). Then naturally mention your relevant expertise.
Pattern: "[Value-adding observation]. This is something I work on with [audience] - [soft CTA like 'happy to share the framework' or 'wrote about this recently']."
The value must stand alone even without the CTA.`
};
```

### Comment Tones (Lines 180-217)

```typescript
const toneInstructions = {
    'Professional': `TONE = "Professional"
VOICE: Polished, formal, business-appropriate. Like a senior executive writing to peers.
Vocabulary: precise, measured, authoritative. No slang, no casual phrases.
Sentence structure: well-constructed, grammatically impeccable.
Energy: calm confidence, not enthusiastic. Statements over exclamations.`,

    'Friendly': `TONE = "Friendly"
VOICE: Warm, conversational, approachable. Like a helpful colleague.
Use contractions naturally (I've, don't, that's). Occasional exclamation is OK.
Energy: genuinely warm but not over-the-top. Supportive without being sycophantic.
Feel: "This person seems really nice and smart."`,

    'ThoughtProvoking': `TONE = "Thought Provoking"
VOICE: Intellectual, contemplative, philosophical. Makes people pause and reflect.
Use conditional language: "What if...", "Consider that...", "The interesting tension here is..."
Energy: measured, deliberate. Every word chosen carefully.
Feel: "This person thinks deeply about things."`,

    'Supportive': `TONE = "Supportive"
VOICE: Encouraging, validating, positive. Champion the author's message.
Acknowledge their effort/insight specifically. Amplify what they said well.
Energy: warm enthusiasm but backed with substance (not just "great post!").
Feel: "This person genuinely cares and also knows their stuff."`,

    'Contrarian': `TONE = "Contrarian"
VOICE: Respectfully challenging, intellectually provocative, constructive disagreement.
Use "devil's advocate" framing. Push back with evidence, not attitude.
Energy: confident but not aggressive. Firm but fair.
Feel: "This person disagrees but makes a compelling case."`,

    'Humorous': `TONE = "Humorous"
VOICE: Light, witty, entertaining. Smart humor, not forced jokes.
Use observational humor, gentle irony, or clever wordplay related to the topic.
Energy: playful but still substantive underneath. The humor serves the point.
Feel: "This person is funny AND insightful."
IMPORTANT: Humor must fit the post's topic. Never joke about serious/sensitive topics.`
};
```

### Character Limits (Lines 224-230)

```typescript
const charLimits = {
    'Brief': { max: 100, target: '80-100', words: '15-20' },
    'Short': { max: 300, target: '250-300', words: '50-60' },
    'Mid': { max: 600, target: '500-600', words: '100-120' },
    'Long': { max: 900, target: '800-900', words: '150-180' }
};
```

---

## Full Normal Mode Prompt Template

**File:** `lib/openai-config.ts:247-296`

```
You are a LinkedIn comment ghostwriter. Write ONE comment on the post below.

── POST TO COMMENT ON ──
Author: {authorName}
Content: {postText}

── COMMENTER PROFILE ──
Expertise: {userExpertise}
Background: {userBackground}

── VOICE REFERENCE EXAMPLES (VOICE ONLY - DO NOT copy their structure/format) ──
⚠️ IMPORTANT: These examples inform VOCABULARY, PERSONALITY, and WORD CHOICE only.
⚠️ The STYLE setting in the MANDATORY SETTINGS section below ALWAYS governs structure/format.

Example 1: "{example1}"
Example 2: "{example2}"
...

Use their voice patterns (phrasing, energy, vocabulary) but follow the STYLE FORMAT exactly as instructed below.

══════════════════════════════════════════════════
MANDATORY SETTINGS - FOLLOW EACH ONE EXACTLY
══════════════════════════════════════════════════

{selectedStyleInstr}

{selectedGoalInstr}

{selectedToneInstr}

── LENGTH ──
HARD MAXIMUM: {max} characters ({commentLength})
Target: {target} characters (~{words} words)

══════════════════════════════════════════════════
QUALITY RULES
══════════════════════════════════════════════════

1. SPECIFICITY: Reference at least ONE exact detail from the post (a quote, stat, example, or specific claim).

2. VALUE: Add something NEW - an insight, data point, experience, or question not already in the post.

3. HUMAN VOICE: Write like a real person, not a chatbot. Vary sentence lengths. Use natural phrasing.

4. NO EMOJIS: Zero emojis. None.

5. NO BANNED WORDS: Never use "curious", "intrigued", "fascinating", "insightful", "resonates", "love this", "game-changer", "deep dive", "unpack".

6. NO BANNED PUNCTUATION: No em dashes "—" or en dashes "–". Use commas, periods, or hyphens "-" instead.

7. NO GENERIC OPENERS: Never start with "Great post", "Thanks for sharing", "I agree", "Well said", "This is so true".

8. AUTHOR NAME: Use {authorName}'s first name naturally (not forced into every sentence).

9. LANGUAGE: Write in the SAME language as the original post. Non-negotiable.

══════════════════════════════════════════════════

Output ONLY the comment text. No labels, no quotes, no explanation.
```

---

## Profile Style Mode Prompt

**File:** `app/api/ai/generate-comment/route.ts:224-253`

When `useProfileStyle` is enabled and style examples are available, the prompt switches to pure style learning mode:

```
You are a LinkedIn comment ghostwriter. Your ONLY job is to write a comment that sounds EXACTLY like the person who wrote these example comments.

═══════════════════════════════════════════════════════════
🎨 STYLE EXAMPLES FROM SELECTED PROFILES (STUDY CAREFULLY)
═══════════════════════════════════════════════════════════

[Example 1]: "{example1}"

[Example 2]: "{example2}"

...

═══════════════════════════════════════════════════════════
👤 COMMENTER'S LINKEDIN PROFILE (PERSONALIZE COMMENT)
═══════════════════════════════════════════════════════════

Write the comment as if YOU are this person. Use their background naturally:

HEADLINE: {headline}
ABOUT: {about}
SKILLS: {skills}
EXPERIENCE: {experience}

GUIDELINES:
- Reference relevant experience/skills naturally when appropriate
- Match the professional tone of their headline/about
- Write in first person ("I", "my", "me")

═══════════════════════════════════════════════════════════
📄 POST TO COMMENT ON
═══════════════════════════════════════════════════════════
Author: {authorName}
Post: {postText}

═══════════════════════════════════════════════════════════
📝 INSTRUCTIONS
═══════════════════════════════════════════════════════════
1. Study the example comments above. Mimic their EXACT:
   - Tone and voice (casual vs formal, witty vs serious)
   - Sentence structure and rhythm
   - Use of humor, sarcasm, emojis, or directness
   - How they reference the original post
   - Their unique personality markers
   - Length patterns and formatting choices
2. Write a NEW comment on the post above that sounds like the SAME PERSON wrote it.
3. The comment must be relevant to the post content.
4. Do NOT use hashtags. Do NOT include quotation marks around your response.
5. Output ONLY the comment text, nothing else.
```

---

## Comment Settings Storage

**File:** `app/api/comment-settings/route.ts`

### Database Fields

| Field | Type | Description |
|-------|------|-------------|
| `useProfileStyle` | boolean | Use scraped comment style examples |
| `useProfileData` | boolean | Include user's LinkedIn profile in prompts |
| `goal` | string | Comment goal (AddValue, ShareExperience, etc.) |
| `tone` | string | Comment tone (Professional, Friendly, etc.) |
| `commentLength` | string | Length category (Brief, Short, Mid, Long) |
| `commentStyle` | string | Style (direct, structured, storyteller, etc.) |
| `model` | string | AI model preference |
| `userExpertise` | string | User's expertise area |
| `userBackground` | string | User's professional background |
| `aiAutoPost` | string | Auto-posting mode |

---

## Extension Integration

### Background Script Handler

**File:** `kommentify-extension/src/background/index.js:4281-4394`

```javascript
if (request.action === "generateCommentFromContent") {
    const { postText, authorName, goal, tone, commentLength, userExpertise, userBackground } = request;
    
    // Load settings from storage
    const storage = await chrome.storage.local.get(['commentSettings']);
    const storedSettings = storage.commentSettings || {};
    
    // Merge request params with stored settings
    const finalGoal = goal || storedSettings.goal || 'AddValue';
    const finalTone = tone || storedSettings.tone || 'Professional';
    const finalLength = commentLength || storedSettings.commentLength || 'Short';
    const finalStyle = storedSettings.commentStyle || 'direct';
    
    // Call API
    const response = await fetch(`${apiUrl}/api/ai/generate-comment`, {
        method: 'POST',
        body: JSON.stringify({
            postText,
            tone: finalTone,
            goal: finalGoal,
            commentLength: finalLength,
            commentStyle: finalStyle,
            userExpertise: finalExpertise,
            userBackground: finalBackground,
            authorName: authorName || 'there',
            useProfileStyle: storedSettings.useProfileStyle === true
        })
    });
}
```

### Import Automation

**File:** `kommentify-extension/src/background/importAutomation.js:139-153`

```javascript
// Generate AI comment via background script
const response = await new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
        action: 'generateCommentFromContent',
        postText, 
        authorName,
        goal: commentSettings.goal || 'AddValue',
        tone: commentSettings.tone || 'Professional',
        commentLength: commentSettings.commentLength || 'Short',
        userExpertise: commentSettings.userExpertise || '',
        userBackground: commentSettings.userBackground || ''
    }, (resp) => {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
        else resolve(resp);
    });
});
```

### Bulk Processing Executor

**File:** `kommentify-extension/src/background/bulkProcessingExecutor.js:897-903`

```javascript
const response = await new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
        action: 'generateCommentFromContent',
        postText: postText,
        authorName: authorName,
        goal: commentSettings.goal || 'AddValue',
        tone: commentSettings.tone || 'Professional',
        commentLength: commentSettings.commentLength || 'Short'
    }, ...);
});
```

---

## Frontend Integration

**File:** `app/dashboard/page.tsx`

### Comment Settings State (Lines 288-300)

```typescript
const [csUseProfileStyle, setCsUseProfileStyle] = useState(false);
const [csUseProfileData, setCsUseProfileData] = useState(false);
const [csGoal, setCsGoal] = useState('AddValue');
const [csTone, setCsTone] = useState('Friendly');
const [csLength, setCsLength] = useState('Short');
const [csStyle, setCsStyle] = useState('direct');
const [csModel, setCsModel] = useState<string>('gpt-4o');
const [csExpertise, setCsExpertise] = useState('');
const [csBackground, setCsBackground] = useState('');
```

### Load Settings Function (Lines 875-894)

```typescript
const loadCommentSettings = async () => {
    const res = await fetch('/api/comment-settings', { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await res.json();
    if (data.success && data.settings) {
        setCsUseProfileStyle(data.settings.useProfileStyle === true);
        setCsUseProfileData(data.settings.useProfileData === true);
        setCsGoal(data.settings.goal || 'AddValue');
        // ... other settings
    }
};
```

---

## Related Files

| File | Purpose |
|------|---------|
| `app/api/ai/generate-comment/route.ts` | API endpoint for comment generation |
| `lib/openai-config.ts` | Prompt templates and configuration |
| `lib/ai-service.ts` | AI service abstraction layer |
| `lib/linkedin-formatter.ts` | Comment formatting for LinkedIn |
| `app/api/comment-settings/route.ts` | Comment settings CRUD |
| `app/dashboard/page.tsx` | Frontend UI and state management |
| `kommentify-extension/src/background/index.js` | Extension background handler |
| `kommentify-extension/src/background/importAutomation.js` | Import profile automation |
| `kommentify-extension/src/background/bulkProcessingExecutor.js` | Bulk processing automation |
| `prisma/schema.prisma` | CommentSettings model definition |
