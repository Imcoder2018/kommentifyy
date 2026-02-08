import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';
import { limitService } from '@/lib/limit-service';
import OpenAI from 'openai';
import { OpenAIConfig, getModelForSettings, generateCommentPrompt } from '@/lib/openai-config';
import { formatCommentForLinkedIn } from '@/lib/linkedin-formatter';

// Initialize OpenAI client with proper error handling
let openai: OpenAI | null = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY.trim(),
    });
    console.log('OpenAI client initialized for comment generation');
  } else {
    console.warn('OPENAI_API_KEY not found for comment generation');
  }
} catch (error) {
  console.error('Failed to initialize OpenAI client for comments:', error);
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
    const { 
      postText, 
      tone, 
      goal, 
      commentLength,
      commentStyle,
      userExpertise, 
      userBackground,
      authorName 
    } = await request.json();

    if (!postText) {
      return NextResponse.json(
        { success: false, error: 'Post text is required' },
        { status: 400 }
      );
    }

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

    // Check if AI generation is allowed
    if (!user.plan.allowAiCommentGeneration) {
      return NextResponse.json(
        { success: false, error: 'AI comment generation not available in your plan' },
        { status: 403 }
      );
    }

    // Check daily limits
    const limitCheck = await limitService.checkLimit(user.id, 'aiComments');
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Monthly AI comment limit reached (${(user.plan as any).aiCommentsPerMonth}/month). Upgrade your plan for more!`,
        },
        { status: 429 }
      );
    }

    // Check if OpenAI API key is available
    if (!openai || !process.env.OPENAI_API_KEY) {
      console.log('Using fallback comment - OpenAI not available');
      // Fallback: Generate mock comment when OpenAI key is not available
      const mockComments = [
        "Great insights! This really resonates with my experience in the field.",
        "Thanks for sharing this perspective. I hadn't considered it from this angle before.",
        "Excellent point! I've seen similar results in my own work.",
        "This is valuable information. Looking forward to implementing some of these ideas.",
        "Appreciate you sharing this. It's refreshing to see thought leadership in action."
      ];
      
      const mockContent = mockComments[Math.floor(Math.random() * mockComments.length)];
      
      return NextResponse.json({
        success: true,
        content: mockContent,
        fallback: true
      });
    }
    
    console.log('Calling OpenAI API for comment generation...');
    console.log('Parameters:', { tone, goal, commentLength, commentStyle, userExpertise, authorName });
    
    // Fetch user's saved comment settings from DB if not provided in request
    let finalTone = tone;
    let finalGoal = goal;
    let finalLength = commentLength;
    let finalStyle = commentStyle;
    let finalExpertise = userExpertise;
    let finalBackground = userBackground;
    try {
      const savedSettings = await (prisma as any).commentSettings.findUnique({
        where: { userId: user.id },
      });
      if (savedSettings) {
        finalTone = finalTone || savedSettings.tone;
        finalGoal = finalGoal || savedSettings.goal;
        finalLength = finalLength || savedSettings.commentLength;
        finalStyle = finalStyle || savedSettings.commentStyle;
        finalExpertise = finalExpertise || savedSettings.userExpertise;
        finalBackground = finalBackground || savedSettings.userBackground;
        console.log('📋 Using saved comment settings from DB:', { tone: finalTone, goal: finalGoal, length: finalLength, style: finalStyle });
      }
    } catch (settingsErr) {
      console.error('Error loading saved comment settings:', settingsErr);
    }
    
    // Fetch comment style examples from selected profiles
    let styleExamples: string[] = [];
    let styleDebugInfo = { selectedProfiles: 0, topComments: 0, totalExamples: 0 };
    try {
      const selectedProfiles = await (prisma as any).commentStyleProfile.findMany({
        where: { userId: user.id, isSelected: true },
        select: { id: true, profileName: true },
      });
      styleDebugInfo.selectedProfiles = selectedProfiles.length;
      console.log(`🎨 STYLE: Found ${selectedProfiles.length} selected profiles for AI training`);
      
      if (selectedProfiles.length > 0) {
        const profileIds = selectedProfiles.map((p: any) => p.id);
        
        // First try top-starred comments
        let comments = await (prisma as any).scrapedComment.findMany({
          where: { 
            profileId: { in: profileIds },
            isTopComment: true,
          },
          select: { commentText: true },
          take: 10,
          orderBy: { createdAt: 'desc' },
        });
        styleDebugInfo.topComments = comments.length;
        console.log(`🎨 STYLE: Found ${comments.length} top-starred comments`);
        
        // If no top comments, use recent ones
        if (comments.length === 0) {
          comments = await (prisma as any).scrapedComment.findMany({
            where: { profileId: { in: profileIds } },
            select: { commentText: true },
            take: 10,
            orderBy: { createdAt: 'desc' },
          });
          console.log(`🎨 STYLE: Falling back to ${comments.length} recent comments`);
        }
        
        styleExamples = comments.map((c: any) => c.commentText).filter((t: string) => t.length > 10);
        styleDebugInfo.totalExamples = styleExamples.length;
        console.log(`🎨 STYLE: Using ${styleExamples.length} style examples for prompt injection`);
        if (styleExamples.length > 0) {
          console.log(`🎨 STYLE: First example preview: "${styleExamples[0].substring(0, 80)}..."`);
        }
      }
    } catch (styleError) {
      console.error('🎨 STYLE ERROR:', styleError);
    }

    // Generate prompt using enhanced world-class logic
    const prompt = generateCommentPrompt(
      postText, 
      finalTone || 'Professional', 
      finalGoal || 'AddValue',
      finalLength || 'Short',
      finalExpertise || '',
      finalBackground || '',
      authorName || 'there',
      finalStyle || 'direct',
      styleExamples
    );
    
    console.log(`📝 PROMPT: Total length: ${prompt.length} chars, style examples injected: ${styleExamples.length > 0 ? 'YES' : 'NO'}`);

    // Use premium model for best quality comments
    const model = 'gpt-4o';

    // Set max tokens based on comment length
    const lengthSettings: Record<string, number> = {
      Brief: 60,   // ~100 characters
      Short: 150,  // ~300 characters
      Mid: 300,    // ~600 characters
      Long: 450    // ~900 characters
    };
    const maxTokens = lengthSettings[commentLength || 'Short'] || 150;

    let content;
    try {
      // Generate comment with OpenAI
      const completion = await openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: 'system',
            content: `You are a world-class LinkedIn engagement specialist. Write high-value comments that drive engagement and position the commenter as a thought leader. Follow the comprehensive framework provided.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: maxTokens,
      });

      content = completion.choices[0].message.content?.trim() || '';
      console.log('✅ OpenAI comment generation successful');
      
    } catch (openaiError: any) {
      console.error('OpenAI API Error for comment:', openaiError);
      
      // Use fallback when OpenAI fails
      console.log('OpenAI failed, using fallback comment');
      const mockComments = [
        "Great insights! This really resonates with my experience in the field.",
        "Thanks for sharing this perspective. I hadn't considered it from this angle before.",
        "Excellent point! I've seen similar results in my own work.",
        "This is valuable information. Looking forward to implementing some of these ideas.",
        "Appreciate you sharing this. It's refreshing to see thought leadership in action."
      ];
      content = mockComments[Math.floor(Math.random() * mockComments.length)];
    }

    // Format comment for LinkedIn
    content = formatCommentForLinkedIn(content);
    console.log('Comment formatted for LinkedIn');

    // Update usage
    await limitService.incrementUsage(user.id, 'aiComments');

    // Log activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        type: 'ai_comment_generated',
        metadata: JSON.stringify({ 
          tone, 
          goal, 
          userExpertise: userExpertise ? 'provided' : 'none',
          authorName: authorName ? 'provided' : 'none'
        }),
      },
    });

    return NextResponse.json({
      success: true,
      content,
      debug: {
        styleExamplesUsed: styleExamples.length,
        selectedProfiles: styleDebugInfo.selectedProfiles,
        topComments: styleDebugInfo.topComments,
        settingsUsed: { tone: finalTone, goal: finalGoal, length: finalLength, style: finalStyle },
      },
    });
  } catch (error: any) {
    console.error('Generate comment error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
