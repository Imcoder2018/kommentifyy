import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';
import { limitService } from '@/lib/limit-service';
import { generateLinkedInComment, getUserModel, generateContent } from '@/lib/ai-service';
import { generateCommentPrompt } from '@/lib/openai-config';
import { formatCommentForLinkedIn } from '@/lib/linkedin-formatter';

// Developer emails that can see token usage and costs
const DEVELOPER_EMAILS = ['alanemarkef199@gmail.com', 'arman@arwebcraftslive.com'];

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
      useProfileStyle: reqUseProfileStyle,
      model: requestedModel
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

    // Get user's preferred model or use requested model
    let selectedModel = requestedModel || await getUserModel(user.id, 'comment');
    const isDeveloper = DEVELOPER_EMAILS.includes(user.email || '');

    // Validate model exists in database
    try {
      const modelConfig = await (prisma as any).aIModel.findFirst({
        where: { modelId: selectedModel, isEnabled: true }
      });
      if (!modelConfig) {
        console.warn(`⚠️ Model ${selectedModel} not found or disabled, falling back to Claude Sonnet 4.5`);
        selectedModel = 'anthropic/claude-sonnet-4.5';
      }
    } catch (modelErr) {
      console.warn('Could not validate model, using fallback:', modelErr);
      selectedModel = 'anthropic/claude-sonnet-4.5';
    }

    console.log('Generating comment with model:', selectedModel);
    console.log('Parameters:', { tone, goal, commentLength, commentStyle, userExpertise, authorName });
    
    // Fetch global admin settings for AI generation
    let adminProfileStyleMode = true;
    let adminCommentEmbeddingsCount = 5;
    try {
      const globalSettings = await prisma.globalSettings.findFirst();
      if (globalSettings) {
        adminProfileStyleMode = (globalSettings as any).profileStyleMode ?? true;
        adminCommentEmbeddingsCount = (globalSettings as any).commentEmbeddingsCount ?? 5;
      }
      console.log('🔧 Admin settings:', { profileStyleMode: adminProfileStyleMode, commentEmbeddingsCount: adminCommentEmbeddingsCount });
    } catch (adminErr) {
      console.warn('Could not load admin settings, using defaults:', adminErr);
    }

    // Fetch user's saved comment settings from DB
    let finalTone = tone;
    let finalGoal = goal;
    let finalLength = commentLength;
    let finalStyle = commentStyle;
    let finalExpertise = userExpertise;
    let finalBackground = userBackground;
    // Use admin global setting as default, user/request can override
    let useProfileStyle = reqUseProfileStyle === true ? true : adminProfileStyleMode;
    let useProfileData = false;
    try {
      const savedSettings = await (prisma as any).commentSettings.findUnique({
        where: { userId: user.id },
      });
      if (savedSettings) {
        // Request body override takes priority, then DB value, then admin global setting
        useProfileStyle = reqUseProfileStyle === true ? true : (savedSettings.useProfileStyle != null ? savedSettings.useProfileStyle === true : adminProfileStyleMode);
        useProfileData = savedSettings.useProfileData === true;
        finalTone = finalTone || savedSettings.tone;
        finalGoal = finalGoal || savedSettings.goal;
        finalLength = finalLength || savedSettings.commentLength;
        finalStyle = finalStyle || savedSettings.commentStyle;
        finalExpertise = finalExpertise || savedSettings.userExpertise;
        finalBackground = finalBackground || savedSettings.userBackground;
        console.log('📋 Settings from DB:', { useProfileStyle, useProfileData, tone: finalTone, goal: finalGoal, length: finalLength, style: finalStyle });
      }
    } catch (settingsErr) {
      console.error('Error loading saved comment settings:', settingsErr);
    }
    
    // Fetch user's LinkedIn profile data if useProfileData is enabled
    let userProfileContext = '';
    if (useProfileData) {
      try {
        const linkedInProfile = await (prisma as any).linkedInProfile.findFirst({
          where: { userId: user.id },
          orderBy: { updatedAt: 'desc' },
        });
        if (linkedInProfile) {
          const profileParts: string[] = [];
          if (linkedInProfile.headline) profileParts.push(`HEADLINE: ${linkedInProfile.headline}`);
          if (linkedInProfile.about) profileParts.push(`ABOUT: ${linkedInProfile.about}`);
          if (linkedInProfile.skills && Array.isArray(linkedInProfile.skills)) {
            profileParts.push(`SKILLS: ${linkedInProfile.skills.slice(0, 10).join(', ')}`);
          }
          if (linkedInProfile.experience && Array.isArray(linkedInProfile.experience)) {
            profileParts.push(`EXPERIENCE: ${linkedInProfile.experience.slice(0, 3).join('; ')}`);
          }
          if (profileParts.length > 0) {
            userProfileContext = `

═══════════════════════════════════════════════════════════
👤 COMMENTER'S LINKEDIN PROFILE (PERSONALIZE COMMENT)
═══════════════════════════════════════════════════════════

Write the comment as if YOU are this person. Use their background naturally:

${profileParts.join('\n')}

GUIDELINES:
- Reference relevant experience/skills naturally when appropriate
- Match the professional tone of their headline/about
- Write in first person ("I", "my", "me")
`;
            console.log('📋 Using LinkedIn profile data for comment personalization');
          }
        }
      } catch (profileErr) {
        console.warn('Could not load LinkedIn profile for comment:', profileErr);
      }
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
        const maxComments = useProfileStyle ? Math.max(20, adminCommentEmbeddingsCount * 2) : Math.max(10, adminCommentEmbeddingsCount);
        
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
${userProfileContext}
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
      ) + userProfileContext;
    }

    // 🐛 DEBUG: Log full prompt for Vercel logs
    console.log('\n' + '='.repeat(80));
    console.log('� AI COMMENT GENERATION - FULL PROMPT');
    console.log('='.repeat(80));
    console.log('📋 Request params:', JSON.stringify({
      postText: postText.substring(0, 100) + '...',
      goal: finalGoal,
      tone: finalTone,
      length: finalLength,
      style: finalStyle,
      useProfileStyle,
      styleExamplesCount: styleExamples.length,
      useProfileData,
      model: selectedModel
    }, null, 2));
    console.log('-'.repeat(80));
    console.log('📝 FULL PROMPT (length: ' + prompt.length + ' chars):');
    console.log('-'.repeat(80));
    console.log(prompt);
    console.log('='.repeat(80) + '\n');

    // Generate content using unified AI service with FULL prompt
    let content;
    let tokenUsage: any = null;
    let attempts = 0;
    const maxAttempts = 2;
    
    while (attempts < maxAttempts) {
      attempts++;
      try {
        // Use generateContent with full prompt to ensure all context is used
        const result = await generateContent({
          model: selectedModel,
          systemPrompt: 'You are an expert LinkedIn comment writer. Write engaging, authentic comments that add value and spark conversations.',
          userPrompt: prompt,
          maxTokens: 500,
          temperature: 0.7,
          userId: user.id,
          trackUsage: true
        });

        content = result.content;
        console.log('✅ Comment generation attempt', attempts, 'with model:', result.model, 'output length:', content?.length || 0);
        
        // If we got empty content, log and retry with fallback
        if (!content || content.trim().length === 0) {
          console.warn('⚠️ AI returned empty content on attempt', attempts);
          if (attempts < maxAttempts) {
            // Try with a different model on retry
            const fallbackModel = 'anthropic/claude-sonnet-4.5';
            console.log('🔄 Retrying with fallback model:', fallbackModel);
            continue;
          }
        } else {
          // Got valid content, break out of retry loop
          break;
        }
        
        // Extract token usage for developers
        if (isDeveloper && result.usage) {
          tokenUsage = {
            inputTokens: result.usage.promptTokens,
            outputTokens: result.usage.completionTokens,
            totalTokens: result.usage.totalTokens,
            inputCost: `$${((result.usage.promptTokens / 1000000) * (result.cost * 0.7)).toFixed(6)}`,
            outputCost: `$${((result.usage.completionTokens / 1000000) * (result.cost * 0.3)).toFixed(6)}`,
            totalCost: `$${result.cost.toFixed(6)}`,
            model: result.model,
            modelName: result.provider,
          };
        }
        
      } catch (error: any) {
        console.error('AI generation error on attempt', attempts, ':', error.message);
        
        if (attempts >= maxAttempts) {
          // Use fallback when AI service fails after all retries
          console.log('AI service failed after', attempts, 'attempts, using fallback comment');
          const mockComments = [
            "Great insights! This really resonates with my experience in the field.",
            "Thanks for sharing this perspective. I hadn't considered it from this angle before.",
            "Excellent point! I've seen similar results in my own work.",
            "This is valuable information. Looking forward to implementing some of these ideas.",
            "Appreciate you sharing this. It's refreshing to see thought leadership in action."
          ];
          content = mockComments[Math.floor(Math.random() * mockComments.length)];
        }
      }
    }
    
    // Final check - if still empty, use fallback
    if (!content || content.trim().length === 0) {
      console.warn('⚠️ AI still returned empty after retries, using fallback');
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

    // POST-PROCESSING: Enforce structured format if AI ignored it (compatibility with old extension versions)
    if (!useProfileStyle && finalStyle === 'structured') {
      const hasBlankLines = content.includes('\n\n');
      if (!hasBlankLines) {
        console.log('🔧 POST-PROCESS: AI ignored structured format, forcing 2-3 paragraphs with blank lines');
        // Split into sentences first, then group into 2-3 paragraphs
        const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];
        const targetParagraphs = Math.min(Math.max(2, Math.ceil(sentences.length / 2)), 3);
        const sentencesPerPara = Math.ceil(sentences.length / targetParagraphs);
        const paragraphs = [];
        for (let i = 0; i < targetParagraphs; i++) {
          const start = i * sentencesPerPara;
          const paraSentences = sentences.slice(start, start + sentencesPerPara);
          if (paraSentences.length > 0) {
            paragraphs.push(paraSentences.join(' ').trim());
          }
        }
        content = paragraphs.join('\n\n');
        console.log(`🔧 POST-PROCESS: Split into ${paragraphs.length} paragraphs`);
      }
    }
    
    // HARD enforce character limit - truncate if AI exceeded it
    const charLimits: Record<string, number> = {
      Brief: 100,
      Short: 300,
      Mid: 600,
      Long: 900
    };
    const hardLimit = charLimits[finalLength || 'Short'] || 300;
    if (!useProfileStyle && content.length > hardLimit) {
      console.log(`⚠️ Comment exceeded ${hardLimit} char limit (${content.length} chars), truncating...`);
      // Try to truncate at a natural sentence boundary
      let truncated = content.substring(0, hardLimit);
      const lastPeriod = truncated.lastIndexOf('.');
      const lastQuestion = truncated.lastIndexOf('?');
      const lastExclaim = truncated.lastIndexOf('!');
      const lastBreak = Math.max(lastPeriod, lastQuestion, lastExclaim);
      if (lastBreak > hardLimit * 0.5) {
        truncated = truncated.substring(0, lastBreak + 1);
      }
      content = truncated.trim();
    }
    console.log(`Comment formatted for LinkedIn (${content.length} chars, limit: ${hardLimit})`);

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

    // Build response
    const response: any = {
      success: true,
      content,
      model: selectedModel,
      debug: {
        styleExamplesUsed: styleExamples.length,
        selectedProfiles: styleDebugInfo.selectedProfiles,
        topComments: styleDebugInfo.topComments,
        useProfileStyle,
        mode: useProfileStyle && styleExamples.length > 0 ? 'PROFILE_STYLE' : 'NORMAL',
        settingsUsed: useProfileStyle ? { mode: 'profile_style_only' } : { tone: finalTone, goal: finalGoal, length: finalLength, style: finalStyle },
      },
    };

    if (tokenUsage) {
      response.tokenUsage = tokenUsage;
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Generate comment error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
