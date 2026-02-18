import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';
import { limitService } from '@/lib/limit-service';
import OpenAI from 'openai';
import { OpenAIConfig, generatePostPrompt } from '@/lib/openai-config';
import { formatForLinkedIn } from '@/lib/linkedin-formatter';
import { Index } from '@upstash/vector';

// Developer emails that can see token usage and costs
const DEVELOPER_EMAILS = ['alanemarkef199@gmail.com', 'arman@arwebcraftslive.com'];

// Model pricing per 1M tokens (USD)
const modelPricing: Record<string, { input: number; output: number; name: string }> = {
  'o1': { input: 15.00, output: 60.00, name: 'o1 (Reasoning - Best)' },
  'o1-mini': { input: 3.00, output: 12.00, name: 'o1-mini (Fast Reasoning)' },
  'gpt-4o': { input: 2.50, output: 10.00, name: 'GPT-4o (Best Quality)' },
  'gpt-4o-mini': { input: 0.15, output: 0.60, name: 'GPT-4o Mini (Fast & Cheap)' },
  'gpt-4-turbo': { input: 10.00, output: 30.00, name: 'GPT-4 Turbo (Premium)' },
  'gpt-3.5-turbo': { input: 0.50, output: 1.50, name: 'GPT-3.5 Turbo (Budget)' },
};

let vectorIndex: any = null;
try {
  if (process.env.UPSTASH_VECTOR_REST_URL && process.env.UPSTASH_VECTOR_REST_TOKEN) {
    vectorIndex = new Index({
      url: (process.env.UPSTASH_VECTOR_REST_URL || '').trim(),
      token: (process.env.UPSTASH_VECTOR_REST_TOKEN || '').trim(),
    });
  }
} catch (e) { console.warn('Vector index not available for post generation'); }

// Initialize OpenAI client with proper error handling
let openai: OpenAI | null = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY.trim(),
    });
    console.log('OpenAI client initialized for post generation');
  } else {
    console.warn('OPENAI_API_KEY not found for post generation');
  }
} catch (error) {
  console.error('Failed to initialize OpenAI client for posts:', error);
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = extractToken(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    const { topic, template, tone, length, includeHashtags, includeEmojis, language, targetAudience, keyMessage, userBackground, useInspirationSources, inspirationSourceNames, model: requestedModel } = await request.json();

    // Get user and check limits
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { plan: true },
    });

    if (!user || !user.plan) {
      return NextResponse.json(
        { success: false, error: 'User not found or no plan assigned' },
        { status: 404 }
      );
    }

    // Check if AI post generation is allowed
    if (!user.plan.allowAiPostGeneration) {
      return NextResponse.json(
        { success: false, error: 'AI post generation not available in your plan' },
        { status: 403 }
      );
    }

    // Check daily limit
    const limitCheck = await limitService.checkLimit(user.id, 'aiPosts');
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Daily AI post limit reached', remaining: 0 },
        { status: 429 }
      );
    }

    // Check if OpenAI API key is available
    if (!openai || !process.env.OPENAI_API_KEY) {
      console.log('Using fallback post - OpenAI not available');
      // Fallback: Generate mock post when OpenAI key is not available
      const mockContent = `${topic}

I've been thinking a lot about this topic lately, and wanted to share some insights.

${topic} is becoming increasingly important in today's professional landscape. Here are a few key observations:

• It's transforming the way we work and collaborate
• The impact on productivity and efficiency is significant  
• Organizations that embrace this see measurable results

What's your experience with ${topic}? I'd love to hear your thoughts in the comments.

${includeHashtags ? `#${topic.replace(/\s+/g, '')} #ProfessionalDevelopment #Innovation` : ''}`;
      
      return NextResponse.json({
        success: true,
        content: mockContent,
        fallback: true
      });
    }
    
    console.log('Calling OpenAI API for post generation...');
    
    // Fetch global admin settings for AI generation
    let adminPostEmbeddingsCount = 8;
    try {
      const globalSettings = await prisma.globalSettings.findFirst();
      if (globalSettings) {
        adminPostEmbeddingsCount = (globalSettings as any).postEmbeddingsCount ?? 8;
      }
      console.log('🔧 Admin settings for posts:', { postEmbeddingsCount: adminPostEmbeddingsCount });
    } catch (adminErr) {
      console.warn('Could not load admin settings, using defaults:', adminErr);
    }

    // Fetch inspiration sources if enabled
    let inspirationContext = '';
    if (useInspirationSources && vectorIndex) {
      try {
        let filter = `userId = '${payload.userId}'`;
        const queryResponse = await vectorIndex.query({
          data: topic,
          topK: Math.max(15, adminPostEmbeddingsCount * 2),
          filter,
          includeMetadata: true,
          includeVectors: false,
        });
        const inspirationPosts = (queryResponse || []).filter((r: any) => {
          if (!inspirationSourceNames || inspirationSourceNames.length === 0) return true;
          const authorName = r.metadata?.authorName || r.metadata?.sourceName || '';
          return inspirationSourceNames.some((name: string) => authorName.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(authorName.toLowerCase()));
        });
        if (inspirationPosts.length > 0) {
          const postsToUse = inspirationPosts.slice(0, adminPostEmbeddingsCount);
          const postsContext = postsToUse.map((r: any, i: number) => {
            const content = (r.metadata?.content || '').substring(0, 1500);
            const lines = content.split('\n').filter((l: string) => l.trim());
            const firstLine = lines[0] || '';
            const lastLine = lines[lines.length - 1] || '';
            return `[Post ${i + 1} by ${r.metadata?.authorName || 'Unknown'}]:
HOOK: "${firstLine}"
CLOSING: "${lastLine}"
FULL POST:
${content}`;
          }).join('\n\n');

          inspirationContext = `

═══════════════════════════════════════════════════════════
🎨 VOICE DNA - DEEP STYLE ANALYSIS (HIGHEST PRIORITY)
═══════════════════════════════════════════════════════════

Before writing, DEEPLY ANALYZE these ${postsToUse.length} posts from profiles the user admires. Extract their complete "voice DNA":

${postsContext}

═══════════════════════════════════════════════════════════
VOICE EXTRACTION CHECKLIST - Analyze BEFORE writing:
═══════════════════════════════════════════════════════════

1. STRUCTURAL PATTERNS (most important):
   - How do they OPEN? (Question? Bold claim? Story? "I" statement? Statistic?)
   - How do they BUILD? (List? Story arc? Problem-Solution? Data-driven? Examples?)
   - How do they CLOSE? (Question? CTA? Mic-drop? Reflection? Call to action?)
   - COPY their exact structure - if they open with a bold claim, YOU open with a bold claim.

2. VOCABULARY FINGERPRINT:
   - What specific phrases do they repeat?
   - Jargon level? (Technical? Simple? Mixed?)
   - Do they use "I" or "you" more? First-person stories or second-person advice?
   - Any signature expressions or verbal tics?
   - AVOID generic LinkedIn words: "game-changer", "unlock", "resonates", "deep dive"

3. SPECIFICITY LEVEL:
   - Do they cite specific numbers, names, dates, events, companies?
   - Or do they speak in abstract concepts?
   - YOU MUST match their specificity exactly.

4. EMOTIONAL TEXTURE:
   - Reflective/introspective or declarative/confident?
   - Story-led emotional or data-led logical?
   - Vulnerable admissions or authoritative pronouncements?

5. RHYTHM & FORMATTING:
   - Sentence length patterns (all short? mixed? flowing?)
   - Line break frequency and whitespace usage
   - Lists vs paragraphs, emoji placement, ALL CAPS usage

CRITICAL: Every sentence in your output should pass this test: "Would the authors of these example posts write it THIS way?" If not, rewrite it.
`;
          console.log(`✅ Found ${inspirationPosts.length} inspiration posts, using ${postsToUse.length} for voice context`);
        }
      } catch (vecErr: any) {
        console.warn('Failed to fetch inspiration sources:', vecErr.message);
      }
    }

    // Generate prompt using shared logic with new elite prompt
    const prompt = generatePostPrompt(topic, template, tone, length, includeHashtags, includeEmojis, targetAudience, keyMessage, userBackground, language) + inspirationContext;

    // Select model - default to gpt-4o for best quality
    const selectedModel = requestedModel && modelPricing[requestedModel] ? requestedModel : 'gpt-4o';
    const isDeveloper = DEVELOPER_EMAILS.includes(user.email || '');

    let content;
    let tokenUsage: any = null;
    try {
      const completion = await openai.chat.completions.create({
        model: selectedModel,
        messages: [
          { role: 'system', content: 'You are an elite LinkedIn ghostwriter who specializes in voice cloning and authentic content creation. When inspiration source posts are provided, your TOP priority is matching their exact voice DNA - structural patterns, vocabulary fingerprint, specificity level, emotional texture, and rhythm. Every sentence must pass this test: "Would the original authors write it this way?" Write like a real human. No AI-sounding language. Follow all formatting instructions exactly.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.85,
        max_tokens: 2000,
      });

      content = completion.choices[0].message.content;
      console.log('✅ OpenAI post generation successful');
      
      // Extract token usage for developers
      if (isDeveloper && completion.usage) {
        const inputTokens = completion.usage.prompt_tokens || 0;
        const outputTokens = completion.usage.completion_tokens || 0;
        const pricing = modelPricing[selectedModel] || modelPricing['gpt-4o-mini'];
        const inputCost = (inputTokens / 1000000) * pricing.input;
        const outputCost = (outputTokens / 1000000) * pricing.output;
        tokenUsage = {
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens,
          inputCost: `$${inputCost.toFixed(6)}`,
          outputCost: `$${outputCost.toFixed(6)}`,
          totalCost: `$${(inputCost + outputCost).toFixed(6)}`,
          model: selectedModel,
          modelName: pricing.name,
        };
      }
      
    } catch (openaiError: any) {
      console.error('OpenAI API Error for post:', openaiError);
      
      // Use fallback when OpenAI fails
      console.log('OpenAI failed, using fallback post');
      content = `${topic}

I've been thinking a lot about this topic lately, and wanted to share some insights.

${topic} is becoming increasingly important in today's professional landscape. Here are a few key observations:

• It's transforming the way we work and collaborate
• The impact on productivity and efficiency is significant  
• Organizations that embrace this see measurable results

What's your experience with ${topic}? I'd love to hear your thoughts in the comments.

${includeHashtags ? `#${topic.replace(/\s+/g, '')} #ProfessionalDevelopment #Innovation` : ''}`;
    }

    // Format content for LinkedIn (fix hashtags, clean up markdown)
    content = formatForLinkedIn(content || '');
    console.log('Content formatted for LinkedIn');

    // Update usage
    await limitService.incrementUsage(user.id, 'aiPosts');

    // Log activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        type: 'ai_post_generated',
        metadata: JSON.stringify({ topic, template, model: selectedModel }),
      },
    });

    const remaining = (user.plan as any).aiPostsPerMonth - ((limitCheck.usage || 0) + 1);

    // Build response
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
    console.error('Generate post error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
