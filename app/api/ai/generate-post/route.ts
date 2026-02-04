import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';
import { limitService } from '@/lib/limit-service';
import OpenAI from 'openai';
import { OpenAIConfig, generatePostPrompt } from '@/lib/openai-config';
import { formatForLinkedIn } from '@/lib/linkedin-formatter';

// Initialize OpenAI client with proper error handling
let openai: OpenAI | null = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
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
    const { topic, template, tone, length, includeHashtags, includeEmojis, targetAudience, keyMessage, userBackground } = await request.json();

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
    // Generate prompt using shared logic with new elite prompt
    const prompt = generatePostPrompt(topic, template, tone, length, includeHashtags, includeEmojis, targetAudience, keyMessage, userBackground);

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
