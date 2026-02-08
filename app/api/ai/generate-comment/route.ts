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
      authorName,
      useProfileStyle: reqUseProfileStyle
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
    
    // Fetch user's saved comment settings from DB
    let finalTone = tone;
    let finalGoal = goal;
    let finalLength = commentLength;
    let finalStyle = commentStyle;
    let finalExpertise = userExpertise;
    let finalBackground = userBackground;
    let useProfileStyle = reqUseProfileStyle === true ? true : false;
    try {
      const savedSettings = await (prisma as any).commentSettings.findUnique({
        where: { userId: user.id },
      });
      if (savedSettings) {
        // Request body override takes priority, then DB value
        useProfileStyle = reqUseProfileStyle === true ? true : (savedSettings.useProfileStyle === true);
        finalTone = finalTone || savedSettings.tone;
        finalGoal = finalGoal || savedSettings.goal;
        finalLength = finalLength || savedSettings.commentLength;
        finalStyle = finalStyle || savedSettings.commentStyle;
        finalExpertise = finalExpertise || savedSettings.userExpertise;
        finalBackground = finalBackground || savedSettings.userBackground;
        console.log('📋 Settings from DB:', { useProfileStyle, tone: finalTone, goal: finalGoal, length: finalLength, style: finalStyle });
      }
    } catch (settingsErr) {
      console.error('Error loading saved comment settings:', settingsErr);
    }
    
    // Fetch comment style examples from selected profiles
    let styleExamples: string[] = [];
    let styleDebugInfo = { selectedProfiles: 0, topComments: 0, totalExamples: 0, useProfileStyle };
    try {
      const selectedProfiles = await (prisma as any).commentStyleProfile.findMany({
        where: { userId: user.id, isSelected: true },
        select: { id: true, profileName: true },
      });
      styleDebugInfo.selectedProfiles = selectedProfiles.length;
      console.log(`🎨 STYLE: Found ${selectedProfiles.length} selected profiles, useProfileStyle=${useProfileStyle}`);
      
      if (selectedProfiles.length > 0) {
        const profileIds = selectedProfiles.map((p: any) => p.id);
        const maxComments = useProfileStyle ? 20 : 10;
        
        // First try top-starred comments
        let comments = await (prisma as any).scrapedComment.findMany({
          where: { 
            profileId: { in: profileIds },
            isTopComment: true,
          },
          select: { commentText: true },
          take: maxComments,
          orderBy: { createdAt: 'desc' },
        });
        styleDebugInfo.topComments = comments.length;
        
        // If not enough top comments, fill with recent ones
        if (comments.length < maxComments) {
          const existingTexts = new Set(comments.map((c: any) => c.commentText));
          const moreComments = await (prisma as any).scrapedComment.findMany({
            where: { profileId: { in: profileIds } },
            select: { commentText: true },
            take: maxComments,
            orderBy: { createdAt: 'desc' },
          });
          for (const c of moreComments) {
            if (!existingTexts.has(c.commentText) && comments.length < maxComments) {
              comments.push(c);
              existingTexts.add(c.commentText);
            }
          }
        }
        
        styleExamples = comments.map((c: any) => c.commentText).filter((t: string) => t.length > 10);
        styleDebugInfo.totalExamples = styleExamples.length;
        console.log(`🎨 STYLE: Using ${styleExamples.length} examples (max ${maxComments})`);
      }
    } catch (styleError) {
      console.error('🎨 STYLE ERROR:', styleError);
    }

    // Build prompt based on mode
    let prompt: string;
    if (useProfileStyle && styleExamples.length > 0) {
      // PROFILE STYLE MODE: AI learns purely from examples, no goal/tone/style instructions
      prompt = `You are a LinkedIn comment ghostwriter. Your ONLY job is to write a comment that sounds EXACTLY like the person who wrote these example comments.

═══════════════════════════════════════════════════════════
🎨 STYLE EXAMPLES FROM SELECTED PROFILES (STUDY CAREFULLY)
═══════════════════════════════════════════════════════════

${styleExamples.map((ex, i) => `[Example ${i + 1}]: "${ex}"`).join('\n\n')}

═══════════════════════════════════════════════════════════
📄 POST TO COMMENT ON
═══════════════════════════════════════════════════════════
Author: ${authorName || 'there'}
Post: ${postText}

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
5. Output ONLY the comment text, nothing else.${finalExpertise ? `\n6. The commenter's expertise: ${finalExpertise}` : ''}${finalBackground ? `\n7. The commenter's background: ${finalBackground}` : ''}`;
      console.log(`📝 PROMPT: PROFILE STYLE MODE, ${styleExamples.length} examples, length: ${prompt.length}`);
    } else {
      // NORMAL MODE: Use goal/tone/style settings + optional style examples
      prompt = generateCommentPrompt(
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
      console.log(`📝 PROMPT: NORMAL MODE, length: ${prompt.length}, style examples: ${styleExamples.length}`);
    }

    // Use premium model for best quality comments
    const model = 'gpt-4o';

    // Set max tokens based on comment length
    const lengthSettings: Record<string, number> = {
      Brief: 60,   // ~100 characters
      Short: 150,  // ~300 characters
      Mid: 300,    // ~600 characters
      Long: 450    // ~900 characters
    };
    const maxTokens = useProfileStyle ? 300 : (lengthSettings[finalLength || 'Short'] || 150);

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
        useProfileStyle,
        mode: useProfileStyle && styleExamples.length > 0 ? 'PROFILE_STYLE' : 'NORMAL',
        settingsUsed: useProfileStyle ? { mode: 'profile_style_only' } : { tone: finalTone, goal: finalGoal, length: finalLength, style: finalStyle },
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
