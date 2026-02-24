/**
 * OPENAI CONFIGURATION
 * Configuration for OpenAI API integration
 */

export const OpenAIConfig = {
    // API Key should be loaded from environment variables in backend
    apiKey: (process.env.OPENAI_API_KEY || '').trim(),
    apiUrl: 'https://api.openai.com/v1/chat/completions',

    // Models based on preferences
    models: {
        // For different tones and lengths
        'Supportive': {
            'SuperShort': 'gpt-4o-mini',
            'Brief': 'gpt-4o-mini',
            'Concise': 'gpt-4o'
        },
        'Gracious': {
            'SuperShort': 'gpt-4o-mini',
            'Brief': 'gpt-4o-mini',
            'Concise': 'gpt-4o'
        },
        'Polite': {
            'SuperShort': 'gpt-4o-mini',
            'Brief': 'gpt-4o-mini',
            'Concise': 'gpt-4o'
        },
        'Witty': {
            'SuperShort': 'gpt-4o-mini',
            'Brief': 'gpt-4o',
            'Concise': 'gpt-4o'
        },
        'Excited': {
            'SuperShort': 'gpt-4o-mini',
            'Brief': 'gpt-4o-mini',
            'Concise': 'gpt-4o'
        },
        'RespectfullyOpposed': {
            'SuperShort': 'gpt-4o-mini',
            'Brief': 'gpt-4o',
            'Concise': 'gpt-4o'
        }
    } as Record<string, Record<string, string>>,

    // Cheaper model option
    cheapModel: 'gpt-4o-mini',

    // Default model
    defaultModel: 'gpt-4o-mini',

    // Premium model for best quality
    premiumModel: 'gpt-4o'
};

/**
 * Get appropriate model based on settings
 */
export function getModelForSettings(tone: string, length: string, useCheapModel: boolean = false): string {
    if (useCheapModel) {
        return OpenAIConfig.cheapModel;
    }

    if (OpenAIConfig.models[tone] && OpenAIConfig.models[tone][length]) {
        return OpenAIConfig.models[tone][length];
    }

    return OpenAIConfig.defaultModel;
}

/**
 * Generate high-quality comment prompt for LinkedIn engagement
 * Strictly enforces the user's selected Comment Style, Comment Goal, and Tone of Voice
 */
export function generateCommentPrompt(
    postText: string,
    tone: string,
    goal: string,
    commentLength: string = 'Short',
    userExpertise: string = '',
    userBackground: string = '',
    authorName: string = 'there',
    commentStyle: string = 'direct',
    styleExamples: string[] = []
): string {
    // ── STYLE: detailed structural instructions per style ──
    const styleInstructions: Record<string, string> = {
        'direct': `STYLE = "Direct & Concise"
STRUCTURE: Write the ENTIRE comment as a SINGLE paragraph. No line breaks. Straight to the point.
EXAMPLE SHAPE: "[Name], [specific reference to their point]. [Your added value in 1-2 sentences]. [Optional short closer]."
DO NOT split into multiple paragraphs. One flowing block of text.`,

        'structured': `STYLE = "Structured"
STRUCTURE: Write EXACTLY 2-3 short paragraphs. MANDATORY: separate each paragraph with a blank line.
Paragraph 1 (required): Acknowledge a specific point from their post. 1-2 sentences.
Paragraph 2 (required): Add your insight, data, or experience. 1-2 sentences.
Paragraph 3 (optional): A question or forward-looking statement. 1 sentence.

OUTPUT MUST LOOK LIKE THIS (blank line between every paragraph):
[First paragraph sentence(s).]

[Second paragraph sentence(s).]

[Optional third paragraph sentence.]

DO NOT merge into one paragraph. If you do not include blank lines, you have failed.`,

        'storyteller': `STYLE = "Storyteller"
STRUCTURE: LEAD with a brief personal anecdote (1-2 sentences). Then connect it back to their post's point.
Opening sentence MUST start with a personal experience: "Last month I...", "A few years ago...", "I remember when...", "Early in my career..."
The story must be specific (names, numbers, timeframes) and directly relevant.
End by tying your story back to the author's message.`,

        'challenger': `STYLE = "Challenger"
STRUCTURE: Respectfully offer a DIFFERENT perspective. You are NOT agreeing - you are adding productive tension.
Opening: Acknowledge their point briefly, then pivot with "However...", "One thing I'd push back on...", "The counterargument worth considering...", "I see this differently because..."
Body: Present your alternative view with specific evidence or reasoning.
Tone: Respectful but firm. You have a clear position.`,

        'supporter': `STYLE = "Supporter"
STRUCTURE: Strongly VALIDATE their message with concrete evidence from your own experience.
Opening: Affirm their specific point (not generic praise).
Body: Back it up with YOUR data, results, or concrete example that proves they're right.
Pattern: "You're spot on about X. In my experience with [specific], I saw [specific result]. This is exactly why..."`,

        'expert': `STYLE = "Expert"
STRUCTURE: Reference data, research, or deep domain experience. Use industry terminology naturally.
Opening: Reference a specific claim from their post.
Body: Add expert-level context - cite a study, share a metric, reference a framework, or provide insider knowledge.
Language: Use precise domain vocabulary. Show you live and breathe this topic.
Pattern: "The data backs this up - [specific stat/study]. In [X] years working in [domain], the pattern I keep seeing is..."`,

        'conversational': `STYLE = "Conversational"
STRUCTURE: Write like you're talking to a colleague over coffee. Casual, warm, human.
Use contractions (I've, don't, it's). Use informal transitions ("honestly", "the thing is", "here's what gets me").
Can include a light rhetorical question. Keep it flowing and natural.
Pattern: "Honestly [Name], this hits home. I've been thinking about [topic] a lot lately and [casual observation]. What's been your take on [specific aspect]?"`
    };

    // ── GOAL: specific behavioral instructions per goal ──
    const goalInstructions: Record<string, string> = {
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

    // ── TONE: voice and personality instructions per tone ──
    const toneInstructions: Record<string, string> = {
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

    const selectedStyleInstr = styleInstructions[commentStyle] || styleInstructions['direct'];
    const selectedGoalInstr = goalInstructions[goal] || goalInstructions['AddValue'];
    const selectedToneInstr = toneInstructions[tone] || toneInstructions['Professional'];

    // Character limits
    const charLimits: Record<string, { max: number; target: string; words: string }> = {
        'Brief': { max: 100, target: '80-100', words: '15-20' },
        'Short': { max: 300, target: '250-300', words: '50-60' },
        'Mid': { max: 600, target: '500-600', words: '100-120' },
        'Long': { max: 900, target: '800-900', words: '150-180' }
    };
    const limit = charLimits[commentLength] || charLimits['Short'];

    // Build style training section if examples are provided
    let styleTrainingSection = '';
    if (styleExamples.length > 0) {
        styleTrainingSection = `
── VOICE REFERENCE EXAMPLES (VOICE ONLY - DO NOT copy their structure/format) ──
⚠️ IMPORTANT: These examples inform VOCABULARY, PERSONALITY, and WORD CHOICE only.
⚠️ The STYLE setting in the MANDATORY SETTINGS section below ALWAYS governs structure/format.
⚠️ If the examples are single paragraphs but STYLE = "Structured", you MUST still write 2-3 paragraphs with blank lines.

${styleExamples.map((ex, i) => `Example ${i + 1}: "${ex}"`).join('\n\n')}

Use their voice patterns (phrasing, energy, vocabulary) but follow the STYLE FORMAT exactly as instructed below.
`;
    }

    return `You are a LinkedIn comment ghostwriter. Write ONE comment on the post below.

── POST TO COMMENT ON ──
Author: ${authorName}
Content: ${postText}

── COMMENTER PROFILE ──
Expertise: ${userExpertise || 'General professional'}
Background: ${userBackground || 'Not specified'}
${styleTrainingSection}
══════════════════════════════════════════════════
MANDATORY SETTINGS - FOLLOW EACH ONE EXACTLY
══════════════════════════════════════════════════

${selectedStyleInstr}

${selectedGoalInstr}

${selectedToneInstr}

── LENGTH ──
HARD MAXIMUM: ${limit.max} characters (${commentLength})
Target: ${limit.target} characters (~${limit.words} words)
${commentLength === 'Brief' ? 'Be extremely concise - one impactful sentence only.' : ''}

══════════════════════════════════════════════════
QUALITY RULES
══════════════════════════════════════════════════

1. SPECIFICITY: Reference at least ONE exact detail from the post (a quote, stat, example, or specific claim). Never write something that could apply to any post.

2. VALUE: Add something NEW - an insight, data point, experience, or question not already in the post.

3. HUMAN VOICE: Write like a real person, not a chatbot. Vary sentence lengths. Use natural phrasing.

4. NO EMOJIS: Zero emojis. None.

5. NO BANNED WORDS: Never use "curious", "intrigued", "fascinating", "insightful", "resonates", "love this", "game-changer", "deep dive", "unpack".

6. NO BANNED PUNCTUATION: No em dashes "—" or en dashes "–". Use commas, periods, or hyphens "-" instead.

7. NO GENERIC OPENERS: Never start with "Great post", "Thanks for sharing", "I agree", "Well said", "This is so true".

8. AUTHOR NAME: Use ${authorName}'s first name naturally (not forced into every sentence).

9. LANGUAGE: Write in the SAME language as the original post. If the post is in Spanish, write in Spanish. Non-negotiable.

══════════════════════════════════════════════════

Output ONLY the comment text. No labels, no quotes, no explanation.`;
}

/**
 * Generate prompt for post generation - Elite LinkedIn Content Strategy
 */
export function generatePostPrompt(
    topic: string,
    template: string,
    tone: string,
    length: string,
    includeHashtags: boolean,
    includeEmojis: boolean,
    targetAudience: string = '',
    keyMessage: string = '',
    userBackground: string = '',
    language: string = ''
): string {
    const postTypeMap: Record<string, string> = {
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

    const toneMap: Record<string, string> = {
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

    const postType = postTypeMap[template] || postTypeMap['advice'];
    const toneStyle = toneMap[tone] || toneMap['professional'];

    return `You are a LinkedIn ghostwriter. Write ONE post about the topic below.

══════════════════════════════════════════════════
USER INPUTS
══════════════════════════════════════════════════

POST TYPE: ${postType}
TONE: ${toneStyle}
TOPIC: ${topic}
TARGET AUDIENCE: ${targetAudience || 'Professionals and business leaders'}
KEY MESSAGE/CTA: ${keyMessage || 'Engage with the content and share thoughts'}
AUTHOR BACKGROUND: ${userBackground || 'Not specified'}

══════════════════════════════════════════════════
POST STRUCTURE
══════════════════════════════════════════════════

1. HOOK (first line): 4-8 words. Stop the scroll. Use a bold claim, specific number, counterintuitive statement, or personal confession. This line alone must make someone click "see more".

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

CHARACTER COUNT: ⚠️ CRITICAL - Your post MUST be between ${Math.max(100, (parseInt(length) || 1200) - 200)} and ${parseInt(length) || 1200} characters. This is a HARD requirement.
- If your post is too short, expand with more specific details and examples
- If your post is too long, trim while keeping the core message
- Target length: ${parseInt(length) || 1200} characters (approximately ${Math.round((parseInt(length) || 1200) / 5)} words)
LINE BREAKS: One sentence per paragraph, blank line between each
EMOJIS: ${includeEmojis ? 'Use 2-4 strategically placed emojis, never in hook' : 'NO emojis - zero allowed'}
HASHTAGS: ${includeHashtags ? 'Add 3-5 relevant hashtags at the VERY END after a blank line' : 'NO hashtags'}

══════════════════════════════════════════════════
AUTHENTICITY RULES (CRITICAL)
══════════════════════════════════════════════════

1. SPECIFICITY OVER GENERALITY: Replace every vague claim with a specific one. Not "many companies" but "3 out of 5 SaaS companies I've worked with." Not "recently" but "last Tuesday."

2. HUMAN VOICE: Write like a real person typing on their phone, not a marketing department. Vary sentence lengths. Use contractions. Start sentences with "And" or "But" when natural.

3. BANNED WORDS (sound AI-generated):
   - "game-changer", "game changing"
   - "unlock", "unlocking"
   - "leverage", "leveraging"
   - "paradigm shift"
   - "deep dive"
   - "resonate", "resonates"
   - "navigate", "navigating"
   - "landscape"
   - "realm"
   - "embark"
   - "tapestry"
   - "synergy"
   - "utilize" (use "use" instead)

4. BANNED PUNCTUATION: No em dashes "—" or en dashes "–". Use commas, periods, or hyphens "-" instead.

5. NO GENERIC STATEMENTS: Every sentence must pass this test - "Could someone who knows nothing about this topic have written this?" If yes, rewrite it with specific knowledge.

6. PERSONAL ANGLE: Include at least one first-person observation or experience tied to the topic. Even if brief: "I noticed this when..." or "In my experience..."

${language ? `\n══════════════════════════════════════════════════\nLANGUAGE: Write the ENTIRE post in ${language}. Non-negotiable.\n══════════════════════════════════════════════════\n` : ''}
Output ONLY the post content. No labels, no explanation, no meta-commentary.`;
}

/**
 * Build profile context from LinkedIn profile data with token optimization
 * Limits the amount of data included to save tokens while preserving key information
 */
export function buildProfileContext(profileData: {
    name?: string | null;
    headline?: string | null;
    about?: string | null;
    posts?: string[];
    experience?: string[];
    education?: string[];
    skills?: string[];
    language?: string | null;
}, options: {
    maxPostsChars?: number;
    maxExperienceItems?: number;
    includeSkills?: boolean;
} = {}): string {
    const {
        maxPostsChars = 3000,
        maxExperienceItems = 3,
        includeSkills = true
    } = options;

    let context = '';

    // Basic profile info (always include - minimal tokens)
    if (profileData.name || profileData.headline) {
        context += `\n══════════════════════════════════════════════════\nAUTHOR PROFILE (for authentic voice matching)\n══════════════════════════════════════════════════\n`;
        if (profileData.name) {
            context += `Name: ${profileData.name}\n`;
        }
        if (profileData.headline) {
            context += `Headline: ${profileData.headline}\n`;
        }
    }

    // About section (token-limited)
    if (profileData.about && profileData.about.length > 0) {
        const aboutLimit = 500; // Limit about section to 500 chars
        const truncatedAbout = profileData.about.length > aboutLimit
            ? profileData.about.substring(0, aboutLimit) + '...'
            : profileData.about;
        context += `\nAbout: ${truncatedAbout}\n`;
    }

    // Experience (limited items, truncated content)
    if (profileData.experience && profileData.experience.length > 0) {
        const limitedExp = profileData.experience.slice(0, maxExperienceItems);
        context += `\nExperience:\n`;
        limitedExp.forEach((exp, i) => {
            const expLimit = 200;
            const truncatedExp = exp.length > expLimit ? exp.substring(0, expLimit) + '...' : exp;
            context += `  ${i + 1}. ${truncatedExp}\n`;
        });
    }

    // Skills (if enabled)
    if (includeSkills && profileData.skills && profileData.skills.length > 0) {
        const skillsLimit = 10;
        const limitedSkills = profileData.skills.slice(0, skillsLimit);
        context += `\nSkills: ${limitedSkills.join(', ')}\n`;
    }

    // Posts (token-limited - most important for voice matching)
    if (profileData.posts && profileData.posts.length > 0) {
        let postsContent = '';
        let currentChars = 0;

        // Take posts in order (most recent first), stop when we hit the limit
        for (const post of profileData.posts) {
            if (currentChars + post.length > maxPostsChars) {
                // If we can't fit the full post, add a truncated version
                const remaining = maxPostsChars - currentChars;
                if (remaining > 100) {
                    postsContent += post.substring(0, remaining) + '...\n';
                }
                break;
            }
            postsContent += post + '\n';
            currentChars += post.length + 1;
        }

        if (postsContent) {
            context += `\n══════════════════════════════════════════════════\nPOSTS BY THIS AUTHOR (for voice/style reference)\n══════════════════════════════════════════════════\n`;
            context += postsContent;
        }
    }

    return context;
}

/**
 * Generate post prompt with LinkedIn profile data integrated
 */
export function generatePostPromptWithProfile(
    topic: string,
    template: string,
    tone: string,
    length: string,
    includeHashtags: boolean,
    includeEmojis: boolean,
    targetAudience: string = '',
    keyMessage: string = '',
    userBackground: string = '',
    language: string = '',
    profileData: {
        name?: string | null;
        headline?: string | null;
        about?: string | null;
        posts?: string[];
        experience?: string[];
        education?: string[];
        skills?: string[];
        language?: string | null;
    } | null = null
): string {
    // Generate base prompt
    const basePrompt = generatePostPrompt(
        topic, template, tone, length, includeHashtags, includeEmojis,
        targetAudience, keyMessage, userBackground, language
    );

    // Add profile context if available
    if (profileData) {
        const profileContext = buildProfileContext(profileData, {
            maxPostsChars: 3000,
            maxExperienceItems: 3,
            includeSkills: true
        });

        // Insert profile context before the structure section
        const insertPoint = basePrompt.indexOf('══════════════════════════════════════════════════\nPOST STRUCTURE');

        if (insertPoint > -1) {
            return basePrompt.substring(0, insertPoint) +
                profileContext +
                basePrompt.substring(insertPoint);
        }
    }

    return basePrompt;
}

/**
 * Fallback comments when AI fails
 */
export function getFallbackComment(tone: string): string {
    const fallbacks: Record<string, string> = {
        'Supportive': 'Great insights! Thanks for sharing this.',
        'Gracious': 'Thank you for sharing this valuable perspective!',
        'Polite': 'This is very interesting. Thank you for posting.',
        'Witty': 'Love this! Great point.',
        'Excited': 'This is amazing! Thanks for sharing!',
        'RespectfullyOpposed': 'Interesting perspective. I see it slightly differently, but appreciate the discussion.'
    };

    return fallbacks[tone] || 'Thanks for sharing this!';
}
