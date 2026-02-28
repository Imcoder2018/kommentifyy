import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';
import { limitService } from '@/lib/limit-service';
import { generateContent, getUserModel } from '@/lib/ai-service';
import { formatForLinkedIn } from '@/lib/linkedin-formatter';
import { Index } from '@upstash/vector';

const DEVELOPER_EMAILS = ['alanemarkef199@gmail.com', 'arman@arwebcraftslive.com'];

let vectorIndex: any = null;
try {
  if (process.env.UPSTASH_VECTOR_REST_URL && process.env.UPSTASH_VECTOR_REST_TOKEN) {
    vectorIndex = new Index({
      url: (process.env.UPSTASH_VECTOR_REST_URL || '').trim(),
      token: (process.env.UPSTASH_VECTOR_REST_TOKEN || '').trim(),
    });
  }
} catch (e) { console.warn('Vector index not available'); }

export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    const {
      selectedHook,
      topic,
      template,
      tone,
      length,
      includeHashtags,
      includeEmojis,
      language,
      targetAudience,
      keyMessage,
      userBackground,
      useInspirationSources,
      inspirationSourceNames,
      useProfileData,
      profileData,
      model: requestedModel,
      userGoal,
      userWritingStyleSource,
      postGoal,
      postType,
      postDepth,
      outcomeF
    } = await request.json();

    if (!topic) {
      return NextResponse.json({ success: false, error: 'Topic is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { plan: true },
    });

    if (!user || !user.plan) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    if (!user.plan.allowAiPostGeneration) {
      return NextResponse.json({ success: false, error: 'AI post generation not available' }, { status: 403 });
    }

    const limitCheck = await limitService.checkLimit(user.id, 'aiPosts');
    if (!limitCheck.allowed) {
      return NextResponse.json({ success: false, error: 'Monthly AI post limit reached' }, { status: 429 });
    }

    const selectedModel = requestedModel || await getUserModel(user.id, 'post');
    const isDeveloper = DEVELOPER_EMAILS.includes(user.email || '');

    // Fetch inspiration context (same as generate-post)
    let inspirationContext = '';
    if (useInspirationSources && vectorIndex) {
      try {
        const userIdPattern = /^[a-z0-9_-]+$/i;
        if (!userIdPattern.test(payload.userId)) {
          throw new Error('Invalid user ID');
        }

        let filter = `userId = '${payload.userId}'`;
        const queryResponse = await vectorIndex.query({
          data: topic,
          topK: 15,
          filter,
          includeMetadata: true,
          includeVectors: false,
        });

        const inspirationPosts = (queryResponse || []).filter((r: any) => {
          if (!inspirationSourceNames || inspirationSourceNames.length === 0) return true;
          const authorName = r.metadata?.authorName || r.metadata?.sourceName || '';
          return inspirationSourceNames.some((name: string) => authorName.toLowerCase().includes(name.toLowerCase()));
        });

        if (inspirationPosts.length > 0) {
          const postsToUse = inspirationPosts.slice(0, 8);
          const postsContext = postsToUse.map((r: any, i: number) => {
            const content = (r.metadata?.content || '').substring(0, 1500);
            return `[Post ${i + 1} by ${r.metadata?.authorName || 'Unknown'}]:\n${content}`;
          }).join('\n\n');

          inspirationContext = `\n\nVOICE DNA - Analyze these posts for style patterns:\n${postsContext}`;
        }
      } catch (vecErr: any) {
        console.warn('Failed to fetch inspiration sources:', vecErr.message);
      }
    }

    // Build profile context
    let profileDataContext = '';
    if (useProfileData && profileData) {
      const profileParts: string[] = [];
      if (profileData.headline) profileParts.push(`HEADLINE: ${profileData.headline}`);
      if (profileData.about) profileParts.push(`ABOUT: ${profileData.about}`);
      if (profileData.location) profileParts.push(`LOCATION: ${profileData.location}`);
      if (profileData.skills && profileData.skills.length > 0) {
        profileParts.push(`SKILLS: ${profileData.skills.slice(0, 10).join(', ')}`);
      }
      if (profileData.experience && profileData.experience.length > 0) {
        const expTexts = profileData.experience.slice(0, 3).map((exp: any) => {
          if (typeof exp === 'string') return exp;
          const parts = [exp.title || exp.role, exp.company, exp.dateRange].filter(Boolean);
          return parts.join(' · ');
        });
        profileParts.push(`EXPERIENCE:\n${expTexts.join('\n')}`);
      }
      if (profileData.recentPosts && profileData.recentPosts.length > 0) {
        const postsSample = profileData.recentPosts.slice(0, 2).map((p: any, i: number) => {
          const text = typeof p === 'string' ? p : (p.text || p.content || '');
          return `[Post ${i + 1}]: "${text.substring(0, 200)}..."`;
        }).join('\n');
        profileParts.push(`RECENT POSTS STYLE:\n${postsSample}`);
      }
      if (profileParts.length > 0) {
        profileDataContext = `

══════════════════════════════════════════════════
👤 USER'S LINKEDIN PROFILE (Write as this person)
══════════════════════════════════════════════════
${profileParts.join('\n\n')}

Write in FIRST PERSON as if you ARE this person. Reference their experience naturally.`;
      }
    }

    // Build High Performance Post Generator context
    let hpgContext = '';
    if (postGoal || postType || postDepth || outcomeF) {
      const hpgParts: string[] = [];
      if (postGoal) hpgParts.push(`POST GOAL: ${postGoal} (optimize content for this outcome)`);
      if (postType) hpgParts.push(`POST TYPE: ${postType} (use this format/structure)`);
      if (postDepth) hpgParts.push(`DEPTH: ${postDepth}`);
      if (outcomeF) hpgParts.push(`OUTCOME FOCUS: ${outcomeF} (craft CTA to drive this)`);
      if (hpgParts.length > 0) {
        hpgContext = `

══════════════════════════════════════════════════
⚡ HIGH PERFORMANCE POST SETTINGS
══════════════════════════════════════════════════
${hpgParts.join('\n')}`;
      }
    }

    // Build hook section conditionally
    const hookSection = selectedHook ? `
══════════════════════════════════════════════════
HOOK (MUST USE EXACTLY - FIRST LINE):
══════════════════════════════════════════════════
"${selectedHook}"` : '';

    const hookInstruction = selectedHook 
      ? '1. HOOK: Use the EXACT hook provided above as your first line'
      : '1. HOOK: Create a compelling, scroll-stopping opening line (question, bold statement, or surprising fact)';

    const postPrompt = `You are a LinkedIn ghostwriter optimized for the Q1 2026 LinkedIn algorithm.

══════════════════════════════════════════════════
🎯 LINKEDIN ALGORITHM Q1 2026 - KEY SIGNALS
══════════════════════════════════════════════════

The algorithm prioritizes (in order):
1. DWELL TIME - Content that keeps readers engaged to the end
2. SAVES/BOOKMARKS - "Save-worthy" frameworks, checklists, insights
3. MEANINGFUL COMMENTS - Questions that spark 15+ word responses
4. EARLY ENGAGEMENT - First hour is critical (hook must stop scroll)
5. NATIVE CONTENT - No external links in body (kills reach 50%+)

⚠️ LinkedIn's LLM actively suppresses AI-generated/generic content.
${hookSection}

══════════════════════════════════════════════════
USER INPUTS
══════════════════════════════════════════════════
TOPIC: ${topic}
TEMPLATE: ${template}
TONE: ${tone}
TARGET LENGTH: ${length} characters
TARGET AUDIENCE: ${targetAudience || 'General professional audience'}
${keyMessage ? `KEY MESSAGE/CTA: ${keyMessage}` : ''}
${userBackground ? `AUTHOR BACKGROUND: ${userBackground}` : ''}
${userGoal ? `CONTENT GOAL: ${userGoal}` : ''}
${language ? `LANGUAGE: Write entire post in ${language}` : ''}

══════════════════════════════════════════════════
POST STRUCTURE (Optimized for Dwell Time)
══════════════════════════════════════════════════

${hookInstruction}
2. OPENING (lines 2-4): Bridge naturally from hook. Add specific context.
3. BODY: Deliver substance that justifies the hook.
   - SHORT paragraphs (1-2 sentences max) - mobile optimization critical
   - Blank line between EVERY paragraph
   - Include 2-3 SPECIFIC details: real numbers, names, dates
   - Add "save-worthy" elements: frameworks, steps, templates
4. CLOSING: One memorable, quotable takeaway line
5. CTA: Ask a THOUGHT-PROVOKING question (not "Thoughts?" or "Agree?")
   - Goal: Generate 15+ word comments

══════════════════════════════════════════════════
FORMATTING
══════════════════════════════════════════════════
- Keep total length around ${length} characters
- ${includeHashtags ? 'Include 3-5 relevant hashtags at the VERY END' : 'No hashtags'}
- ${includeEmojis ? 'Use 2-4 emojis strategically as visual anchors (never in hook)' : 'No emojis'}
- NEVER include URLs in post body - they kill reach

══════════════════════════════════════════════════
AUTHENTICITY (AI Detection Avoidance)
══════════════════════════════════════════════════
BANNED WORDS: "game-changer", "unlock", "leverage", "paradigm shift", "deep dive", "resonate", "navigate", "landscape", "realm", "embark", "synergy", "utilize", "delve", "harness"
- Write like a human texting a smart colleague
- Use contractions, vary sentence lengths
- Be SPECIFIC: real numbers, names, dates - not vague claims

${hpgContext}
${inspirationContext}
${profileDataContext}

Write the complete post now.${selectedHook ? ' Start with the exact hook provided.' : ''}`;

    const result = await generateContent({
      model: selectedModel,
      systemPrompt: 'You are an expert LinkedIn content writer. Create engaging posts that drive engagement.',
      userPrompt: postPrompt,
      maxTokens: Math.min(4096, Math.ceil((parseInt(length) || 1500) * 2)),
      temperature: 0.8,
      userId: user.id,
      trackUsage: true
    });

    let content = formatForLinkedIn(result.content || '');

    // Update usage
    await limitService.incrementUsage(user.id, 'aiPosts');

    // Log activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        type: 'ai_post_generated',
        metadata: JSON.stringify({ topic, template, hook: selectedHook, model: selectedModel }),
      },
    });

    const remaining = (user.plan as any).aiPostsPerMonth - ((limitCheck.usage || 0) + 1);
    
    let tokenUsage: any = null;
    if (isDeveloper && result.usage) {
      const modelConfig = await (await import('@/lib/ai-service')).getModelConfig(result.model);
      const inputCostPer1M = modelConfig?.inputCostPer1M || 0;
      const outputCostPer1M = modelConfig?.outputCostPer1M || 0;

      tokenUsage = {
        inputTokens: result.usage.promptTokens,
        outputTokens: result.usage.completionTokens,
        totalTokens: result.usage.totalTokens,
        inputCost: `$${((result.usage.promptTokens / 1_000_000) * inputCostPer1M).toFixed(6)}`,
        outputCost: `$${((result.usage.completionTokens / 1_000_000) * outputCostPer1M).toFixed(6)}`,
        totalCost: `$${result.cost.toFixed(6)}`,
        model: result.model,
        modelName: result.provider,
      };
    }

    const response: any = {
      success: true,
      content,
      model: selectedModel,
      usage: { remaining },
    };

    if (tokenUsage) {
      response.tokenUsage = tokenUsage;
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Generate post with hook error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
