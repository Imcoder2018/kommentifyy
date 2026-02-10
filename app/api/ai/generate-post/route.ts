import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';
import { limitService } from '@/lib/limit-service';
import OpenAI from 'openai';
import { OpenAIConfig, generatePostPrompt } from '@/lib/openai-config';
import { formatForLinkedIn } from '@/lib/linkedin-formatter';
import { Index } from '@upstash/vector';

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
    const { topic, template, tone, length, includeHashtags, includeEmojis, language, targetAudience, keyMessage, userBackground, useInspirationSources, inspirationSourceNames } = await request.json();

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
    // Fetch inspiration sources if enabled
    let inspirationContext = '';
    if (useInspirationSources && vectorIndex) {
      try {
        let filter = `userId = '${payload.userId}'`;
        const queryResponse = await vectorIndex.query({
          data: topic,
          topK: 8,
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
          inspirationContext = `\n\n═══════════════════════════════════════════════════════════\n🎨 WRITING STYLE INSPIRATION - MIMIC THIS STYLE\n═══════════════════════════════════════════════════════════\n\nThe user has saved posts from LinkedIn profiles they admire. Study these examples and mimic their:\n- Writing style, voice, and tone\n- Sentence structure and rhythm\n- Use of hooks, storytelling, and formatting\n- How they open and close posts\n- Their unique personality and energy\n\nINSPIRATION POSTS:\n${inspirationPosts.slice(0, 5).map((r: any, i: number) => `[Example ${i + 1} by ${r.metadata?.authorName || 'Unknown'}]:\n"${(r.metadata?.content || '').substring(0, 800)}"`).join('\n\n')}\n\nCRITICAL: Your generated post should feel like it was written by someone with a SIMILAR style to these examples. Match their energy, vocabulary level, formatting patterns, and overall vibe while writing about the requested topic.\n`;
          console.log(`✅ Found ${inspirationPosts.length} inspiration posts for style context`);
        }
      } catch (vecErr: any) {
        console.warn('Failed to fetch inspiration sources:', vecErr.message);
      }
    }

    // Generate prompt using shared logic with new elite prompt
    const prompt = generatePostPrompt(topic, template, tone, length, includeHashtags, includeEmojis, targetAudience, keyMessage, userBackground, language) + inspirationContext;

    // Determine model (could add logic to check user plan for premium model access if needed)
    const model = OpenAIConfig.defaultModel;

    let content;
    try {
      const completion = await openai.chat.completions.create({
        model: model,
        messages: [
          { role: 'system', content: 'You are an elite LinkedIn content strategist with 15+ years of experience creating viral posts. Follow the instructions exactly and create compelling, high-engagement content.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.85,
        max_tokens: 2000,
      });

      content = completion.choices[0].message.content;
      console.log('✅ OpenAI post generation successful');
      
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
        metadata: JSON.stringify({ topic, template }),
      },
    });

    const remaining = (user.plan as any).aiPostsPerMonth - ((limitCheck.usage || 0) + 1);

    return NextResponse.json({
      success: true,
      content,
      usage: { remaining },
    });
  } catch (error: any) {
    console.error('Generate post error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
