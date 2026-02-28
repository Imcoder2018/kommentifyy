import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';
import { limitService } from '@/lib/limit-service';
import OpenAI from 'openai';
import { formatForLinkedIn } from '@/lib/linkedin-formatter';

// Developer emails that can see token usage and costs
const DEVELOPER_EMAILS = ['alanemarkef199@gmail.com', 'arman@arwebcraftslive.com'];

// Model pricing per 1M tokens (USD)
const MODEL_PRICING: Record<string, { input: number; output: number; name: string }> = {
  'o1': { input: 15.00, output: 60.00, name: 'o1 (Reasoning - Best)' },
  'o1-mini': { input: 3.00, output: 12.00, name: 'o1-mini (Fast Reasoning)' },
  'gpt-4o': { input: 2.50, output: 10.00, name: 'GPT-4o (Best Quality)' },
  'gpt-4o-mini': { input: 0.15, output: 0.60, name: 'GPT-4o Mini (Fast & Cheap)' },
  'gpt-4-turbo': { input: 10.00, output: 30.00, name: 'GPT-4 Turbo (Premium)' },
  'gpt-4': { input: 30.00, output: 60.00, name: 'GPT-4 (Legacy Premium)' },
  'gpt-3.5-turbo': { input: 0.50, output: 1.50, name: 'GPT-3.5 Turbo (Budget)' },
};

let openai: OpenAI | null = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY.trim() });
  }
} catch (error) {
  console.error('Failed to initialize OpenAI for trending:', error);
}

export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const payload = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { plan: true },
    });
    if (!user || !user.plan) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const limitCheck = await limitService.checkLimit(user.id, 'aiPosts');
    if (!limitCheck.allowed) {
      return NextResponse.json({ success: false, error: 'Monthly AI post limit reached' }, { status: 429 });
    }

    const { trendingPosts, customPrompt, includeHashtags, language, model: requestedModel, useProfileData, profileData } = await request.json();

    if (!trendingPosts || trendingPosts.length === 0) {
      return NextResponse.json({ success: false, error: 'No trending posts provided' }, { status: 400 });
    }

    if (!openai) {
      return NextResponse.json({ success: false, error: 'OpenAI not configured' }, { status: 500 });
    }

    // Select model - default to gpt-4o for best quality voice matching
    const selectedModel = requestedModel && MODEL_PRICING[requestedModel] ? requestedModel : 'gpt-4o';
    const isDeveloper = DEVELOPER_EMAILS.includes(user.email || '');

    // Build profile context if profile data is provided and enabled
    let profileContext = '';
    if (useProfileData && profileData) {
      const expText = profileData.experience && profileData.experience.length > 0
        ? `Experience:\n${profileData.experience.slice(0, 3).map((exp: any, i: number) => {
          if (typeof exp === 'string') return `  ${i + 1}. ${exp.substring(0, 200)}`;
          const parts = [exp.title || exp.role, exp.company, exp.dateRange].filter(Boolean);
          return `  ${i + 1}. ${parts.join(' · ')}`;
        }).join('\n')}`
        : '';
      profileContext = `
═══════════════════════════════════════════════════════════
👤 USER PROFILE DATA (Use this to personalize the posts)
═══════════════════════════════════════════════════════════
Name: ${profileData.name || 'Not specified'}
Headline: ${profileData.headline || 'Not specified'}
${profileData.location ? `Location: ${profileData.location}` : ''}
${profileData.followerCount ? `Followers: ${profileData.followerCount.toLocaleString()}` : ''}
${profileData.about ? `About: ${profileData.about.substring(0, 500)}...` : ''}
${expText}
${profileData.skills && profileData.skills.length > 0 ? `Skills: ${profileData.skills.slice(0, 10).join(', ')}` : ''}

⚠️ IMPORTANT: Incorporate the user's real experience, skills, and background into the posts. Make them personal and authentic.
`;
    }

    // Build detailed trending posts context with structural analysis
    const postsContext = trendingPosts.slice(0, 10).map((p: any, i: number) => {
      const content = (p.postContent || '').substring(0, 1200);
      const lines = content.split('\n').filter((l: string) => l.trim());
      const firstLine = lines[0] || '';
      const lastLine = lines[lines.length - 1] || '';

      return `═══ POST ${i + 1} ═══
ENGAGEMENT: ${p.likes || 0} likes, ${p.comments || 0} comments
AUTHOR: ${p.authorName || 'Unknown'}
HOOK (First line): "${firstLine}"
CLOSING (Last line): "${lastLine}"
FULL CONTENT:
${content}`;
    }).join('\n\n');

    const customInstruction = customPrompt ? `\n\n🎯 USER'S SPECIFIC INSTRUCTION (HIGHEST PRIORITY):\n${customPrompt}` : '';

    // Significantly improved system prompt focused on VOICE MATCHING not just topic
    const systemPrompt = `You are an expert LinkedIn voice analyst and ghostwriter. Your specialty is DEEP VOICE CLONING - you don't just write about similar topics, you BECOME the writer.

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
- ${includeHashtags ? 'Add 3-5 relevant hashtags at the very END only' : 'NO hashtags whatsoever'}
- Maximum 2 emojis per post, placed naturally (not at start)
- NO markdown formatting (no **, no *, no #, no _)
- Use UPPERCASE sparingly for emphasis instead of bold
- Plain text only - this goes directly to LinkedIn`;

    const userPrompt = `VOICE ANALYSIS TASK - CRITICAL FOR AUTHENTICITY:

Study these ${trendingPosts.length} high-performing posts from LinkedIn creators. Your job is to DEEPLY ANALYZE their collective voice patterns, then write 3 NEW posts that could have been written by these same authors.

${postsContext}
${profileContext}

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

═══════════════════════════════════════════════════════════
STEP 2: GENERATE 3 POSTS IN THEIR VOICE
═══════════════════════════════════════════════════════════

Now write 3 LinkedIn posts that:
- Sound like they were written by the SAME PERSON(S) who wrote the examples
- Cover DIFFERENT topics/angles (not rehashing the same content)
- Match the voice DNA you extracted: structure, vocabulary, specificity, emotion, rhythm
- Feel 100% human and authentic - zero AI-smell
- Are 150-400 words each
${language ? `- MUST be written entirely in ${language}` : ''}
${customInstruction}

AUTHENTICITY TEST for each post (MUST PASS ALL):
□ Would the original authors recognize this as "their" writing style?
□ Does it have their specific quirks and patterns?
□ Is the specificity level matched (real examples, numbers, or abstract as appropriate)?
□ Does the STRUCTURE match exactly (how they open, build, close)?
□ Does it use their actual vocabulary/fingerprint phrases?
□ Does it feel like a human wrote it, not an AI?

Return ONLY this JSON (no markdown, no explanation):
[
  {"title": "Topic/angle description", "content": "Full post matching their voice"},
  {"title": "Topic/angle description", "content": "Full post matching their voice"},
  {"title": "Topic/angle description", "content": "Full post matching their voice"}
]`;

    // 🐛 DEBUG: Log full prompt for Vercel logs
    console.log('\n' + '='.repeat(80));
    console.log('🔥 AI TRENDING POST GENERATION - FULL PROMPT');
    console.log('='.repeat(80));
    console.log('📋 Request params:', JSON.stringify({
      postsCount: trendingPosts.length,
      customPrompt: customPrompt?.substring(0, 100) || 'none',
      includeHashtags,
      language: language || 'auto',
      useProfileData,
      model: selectedModel
    }, null, 2));
    console.log('-'.repeat(80));
    console.log('📝 SYSTEM PROMPT (length: ' + systemPrompt.length + ' chars):');
    console.log('-'.repeat(80));
    console.log(systemPrompt);
    console.log('-'.repeat(80));
    console.log('📝 USER PROMPT (length: ' + userPrompt.length + ' chars):');
    console.log('-'.repeat(80));
    console.log(userPrompt);
    console.log('='.repeat(80) + '\n');

    const completion = await openai.chat.completions.create({
      model: selectedModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.85,
      max_tokens: 4500,
    });

    let responseText = completion.choices[0].message.content || '';

    // Extract token usage
    const inputTokens = completion.usage?.prompt_tokens || 0;
    const outputTokens = completion.usage?.completion_tokens || 0;
    const pricing = MODEL_PRICING[selectedModel] || MODEL_PRICING['gpt-4o-mini'];
    const inputCost = (inputTokens / 1000000) * pricing.input;
    const outputCost = (outputTokens / 1000000) * pricing.output;
    const totalCost = inputCost + outputCost;

    // Clean up response - extract JSON
    responseText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    let generatedPosts;
    try {
      generatedPosts = JSON.parse(responseText);
    } catch {
      // Try to find JSON array in response
      const match = responseText.match(/\[[\s\S]*\]/);
      if (match) {
        generatedPosts = JSON.parse(match[0]);
      } else {
        return NextResponse.json({ success: false, error: 'Failed to parse AI response' }, { status: 500 });
      }
    }

    // Format each post's content for LinkedIn (convert any remaining markdown to Unicode bold, clean up)
    if (Array.isArray(generatedPosts)) {
      generatedPosts = generatedPosts.map((post: any) => ({
        ...post,
        content: formatForLinkedIn(post.content || ''),
      }));
    }

    // Increment usage by number of posts actually generated (typically 3)
    const postsGenerated = Array.isArray(generatedPosts) ? generatedPosts.length : 1;
    await limitService.incrementUsage(user.id, 'aiPosts', postsGenerated);

    // Build response - include token info only for developers
    const response: any = {
      success: true,
      posts: generatedPosts,
      model: selectedModel,
    };

    if (isDeveloper) {
      response.tokenUsage = {
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        inputCost: `$${inputCost.toFixed(6)}`,
        outputCost: `$${outputCost.toFixed(6)}`,
        totalCost: `$${totalCost.toFixed(6)}`,
        model: selectedModel,
        modelName: pricing.name,
      };
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Generate trending error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
