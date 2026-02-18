import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';
import { limitService } from '@/lib/limit-service';
import OpenAI from 'openai';
import { formatTopicsForLinkedIn } from '@/lib/linkedin-formatter';

// Initialize OpenAI client with proper error handling
let openai: OpenAI | null = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY.trim(),
    });
    console.log('OpenAI client initialized successfully');
  } else {
    console.warn('OPENAI_API_KEY not found in environment variables');
  }
} catch (error) {
  console.error('Failed to initialize OpenAI client:', error);
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
    const { topic, count = 8, profileData } = await request.json();

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

    // Check if AI generation is allowed (default to true if field doesn't exist)
    const allowAiTopicLines = (user.plan as any).allowAiTopicLines !== false; // Default to true
    if (!allowAiTopicLines) {
      return NextResponse.json(
        { success: false, error: 'AI topic generation not available in your plan' },
        { status: 403 }
      );
    }

    // Check daily limit
    const limitCheck = await limitService.checkLimit(user.id, 'aiTopicLines');
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Daily AI topic generation limit reached', remaining: 0 },
        { status: 429 }
      );
    }

    // Handle profile-based topic generation
    if (profileData) {
      console.log('Generating topics from LinkedIn profile data...');
      
      const keywords: string[] = [];
      
      // Extract keywords from profile data
      if (profileData.headline) {
        keywords.push(...profileData.headline.split(/[,;]/).map((w: string) => w.trim()).filter(Boolean));
      }
      if (profileData.skills && Array.isArray(profileData.skills)) {
        keywords.push(...profileData.skills.slice(0, 5));
      }
      if (profileData.experience && Array.isArray(profileData.experience)) {
        profileData.experience.slice(0, 3).forEach((exp: string) => {
          const words = exp.split(/[,;]/).map((w: string) => w.trim()).filter(Boolean);
          keywords.push(...words);
        });
      }

      const topicTemplates = [
        `How ${keywords[0] || 'professionals'} are changing the industry`,
        `The future of ${keywords[0] || 'technology'} in 2025`,
        `Lessons learned from ${keywords[0] || 'years'} of experience`,
        `Why ${keywords[0] || 'this skill'} matters more than ever`,
        `Common mistakes in ${keywords[0] || 'this field'} and how to avoid them`,
        `The secret to success in ${keywords[0] || 'my industry'}`,
        `What I wish I knew when starting in ${keywords[0] || 'this field'}`,
        `5 insights about ${keywords[0] || 'modern business'}`,
        `Why ${keywords[0] || 'this approach'} is underrated`,
        `The truth about ${keywords[0] || 'success'} nobody tells you`,
      ];

      const genericTopics = [
        "Building a personal brand on LinkedIn",
        "How to stand out in your industry",
        "Lessons from my career journey",
        "The power of continuous learning",
        "Networking tips that actually work",
      ];

      const allTopics = [...topicTemplates, ...genericTopics];
      const shuffled = allTopics.sort(() => Math.random() - 0.5);
      const uniqueTopics = [...new Set(shuffled)];
      const suggestions = uniqueTopics.slice(0, count);

      await limitService.incrementUsage(user.id, 'aiTopicLines');
      
      return NextResponse.json({
        success: true,
        topics: suggestions,
        fromProfile: true
      });
    }

    // Original topic-based generation
    if (!topic) {
      return NextResponse.json(
        { success: false, error: 'Topic is required' },
        { status: 400 }
      );
    }

    // Check if OpenAI API key is available
    if (!openai || !process.env.OPENAI_API_KEY) {
      console.log('Using fallback topics - OpenAI not available');
      // Fallback: Generate mock topics when OpenAI key is not available
      const mockTopics = [
        `How ${topic} is transforming the way we work in 2025`,
        `5 proven strategies for ${topic} that deliver real results`,
        `The biggest mistakes people make with ${topic} (and how to avoid them)`,
        `Why ${topic} matters more than ever in today's market`,
        `Expert insights: The future of ${topic}`,
        `Case study: How we achieved success with ${topic}`,
        `${topic}: What the data tells us about best practices`,
        `Common myths about ${topic} debunked`
      ].slice(0, count);
      
      return NextResponse.json({
        success: true,
        topics: mockTopics,
        fallback: true
      });
    }
    
    console.log('Calling OpenAI API for topic generation...');
    console.log('OpenAI API Key present:', !!process.env.OPENAI_API_KEY);
    console.log('OpenAI API Key prefix:', process.env.OPENAI_API_KEY?.substring(0, 7));
    
    let completion;
    try {
      // Generate topics with OpenAI (using gpt-3.5-turbo for better compatibility)
      completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a LinkedIn content expert. Generate engaging, specific topic lines that will make great LinkedIn posts. Each topic line should be clear, actionable, and attention-grabbing.',
          },
          {
            role: 'user',
            content: `Generate ${count} compelling LinkedIn post topic lines based on this general idea: "${topic}"

Requirements:
- Each topic line should be specific and actionable
- Make them attention-grabbing and valuable
- Vary the angles (how-to, insights, mistakes, trends, etc.)
- Keep each line between 10-20 words
- Return ONLY the topic lines, one per line, numbered 1-${count}

Example format:
1. [First topic line]
2. [Second topic line]
...
${count}. [${count}th topic line]`,
          },
        ],
        temperature: 0.8,
        max_tokens: 500,
      });
      console.log('✅ OpenAI API call successful');
    } catch (openaiError: any) {
      console.error('OpenAI API Error:', openaiError);
      console.error('OpenAI Error Message:', openaiError.message);
      console.error('OpenAI Error Status:', openaiError.status);
      console.error('OpenAI Error Code:', openaiError.code);
      
      // Use fallback when OpenAI fails
      console.log('OpenAI failed, using fallback topics');
      const mockTopics = [
        `How ${topic} is transforming the way we work in 2025`,
        `5 proven strategies for ${topic} that deliver real results`,
        `The biggest mistakes people make with ${topic} (and how to avoid them)`,
        `Why ${topic} matters more than ever in today's market`,
        `Expert insights: The future of ${topic}`,
        `Case study: How we achieved success with ${topic}`,
        `${topic}: What the data tells us about best practices`,
        `Common myths about ${topic} debunked`
      ].slice(0, count);
      
      // Update usage even for fallback
      await limitService.incrementUsage(user.id, 'aiTopicLines');
      
      return NextResponse.json({
        success: true,
        topics: mockTopics,
        fallback: true,
        reason: 'OpenAI API unavailable'
      });
    }

    const content = completion.choices[0].message.content || '';

    // Parse the response to extract topic lines
    let topics = content
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(line => line.length > 0);

    // Format topics for LinkedIn
    topics = formatTopicsForLinkedIn(topics);
    console.log('Topics formatted for LinkedIn');

    // Update usage
    await limitService.incrementUsage(user.id, 'aiTopicLines');

    // Log activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        type: 'ai_topics_generated',
        metadata: JSON.stringify({ topic, count: topics.length }),
      },
    });

    return NextResponse.json({
      success: true,
      topics,
    });
  } catch (error: any) {
    console.error('Generate topics error:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      status: error.status,
      type: error.type
    });
    
    // Return detailed error for debugging
    const errorMessage = error.message || 'Internal server error';
    const errorDetails = process.env.NODE_ENV === 'development' ? {
      name: error.name,
      type: error.type,
      status: error.status
    } : {};
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: errorDetails,
        hasOpenAIKey: !!process.env.OPENAI_API_KEY 
      },
      { status: 500 }
    );
  }
}
