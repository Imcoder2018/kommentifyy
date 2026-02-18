import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';
import { limitService } from '@/lib/limit-service';
import OpenAI from 'openai';
import { OpenAIConfig, getModelForSettings, generateCommentPrompt } from '@/lib/openai-config';
import { formatCommentForLinkedIn } from '@/lib/linkedin-formatter';

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
    try {
      const savedSettings = await (prisma as any).commentSettings.findUnique({
        where: { userId: user.id },
      });
      if (savedSettings) {
        // Request body override takes priority, then DB value, then admin global setting
        useProfileStyle = reqUseProfileStyle === true ? true : (savedSettings.useProfileStyle != null ? savedSettings.useProfileStyle === true : adminProfileStyleMode);
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

    // Select model - default to gpt-4o for best quality
    const selectedModel = requestedModel && modelPricing[requestedModel] ? requestedModel : 'gpt-4o';
    const isDeveloper = DEVELOPER_EMAILS.includes(user.email || '');

    // Set max tokens based on comment length (tighter limits to enforce char counts)
    const lengthSettings: Record<string, number> = {
      Brief: 40,   // ~100 characters - very tight
      Short: 120,  // ~300 characters
      Mid: 250,    // ~600 characters
      Long: 400    // ~900 characters
    };
    const styleTokenMultiplier: Record<string, number> = {
      direct: 1.0,
      structured: 1.9,
      storyteller: 1.5,
      challenger: 1.4,
      supporter: 1.4,
      expert: 1.4,
      conversational: 1.2,
    };
    const baseTokens = lengthSettings[finalLength || 'Short'] || 120;
    const maxTokens = useProfileStyle ? 300 : Math.ceil(baseTokens * (styleTokenMultiplier[finalStyle || 'direct'] || 1.0));
    const charLimits: Record<string, number> = {
      Brief: 100,
      Short: 300,
      Mid: 600,
      Long: 900
    };

    let content;
    let tokenUsage: any = null;
    try {
      // Generate comment with OpenAI
      const styleLabel: Record<string, string> = { direct: 'Direct & Concise (single paragraph)', structured: 'Structured (2-3 paragraphs)', storyteller: 'Storyteller (personal anecdote lead)', challenger: 'Challenger (different perspective)', supporter: 'Supporter (validate with evidence)', expert: 'Expert (data/experience refs)', conversational: 'Conversational (casual, colleague-like)' };
      const goalLabel: Record<string, string> = { AddValue: 'Add Value', ShareExperience: 'Share Experience', AskQuestion: 'Ask Question', DifferentPerspective: 'Different Perspective', BuildRelationship: 'Build Relationship', SubtlePitch: 'Subtle Pitch' };
      const toneLabel: Record<string, string> = { Professional: 'Professional', Friendly: 'Friendly', ThoughtProvoking: 'Thought Provoking', Supportive: 'Supportive', Contrarian: 'Contrarian', Humorous: 'Humorous' };
      const lengthLabel: Record<string, string> = { Brief: 'Brief (max 100 chars)', Short: 'Short (max 300 chars)', Mid: 'Medium (max 600 chars)', Long: 'Long (max 900 chars)' };
      // Explicit structural requirements per style (not just labels)
      const styleFormatInstruction: Record<string, string> = {
        direct: 'ONE single paragraph. No line breaks between sentences. Everything in one flowing block.',
        structured: 'EXACTLY 2-3 separate paragraphs with a BLANK LINE between each one. Do NOT put all text in one paragraph. The output MUST look like:\n\nParagraph one text here.\n\nParagraph two text here.\n\nOptional paragraph three.',
        storyteller: 'MUST open with a personal anecdote ("Last month I...", "A few years ago...", "I remember when..."). Then connect to the post.',
        challenger: 'MUST respectfully challenge with a different perspective. Open with brief acknowledgment, then pivot with "However..." or "One thing I\'d push back on...".',
        supporter: 'MUST validate their message with concrete evidence or specific personal experience that proves they\'re right.',
        expert: 'MUST reference specific data, a metric, a study, or deep domain knowledge. Use precise industry vocabulary.',
        conversational: 'Casual and warm, like talking to a colleague over coffee. Use contractions, natural transitions.',
      };
      const systemMsg = useProfileStyle && styleExamples.length > 0
        ? `You are a LinkedIn comment ghostwriter. Your ONLY job: mimic the EXACT writing style from the provided examples. Match their tone, rhythm, vocabulary, structure, and personality precisely. Output ONLY the comment text. No labels, no quotes, no explanation.`
        : `You are a LinkedIn comment ghostwriter. Follow ALL mandatory settings below EXACTLY:

STYLE FORMAT (HIGHEST PRIORITY - structure your output exactly as described):
${styleFormatInstruction[finalStyle || 'direct'] || styleFormatInstruction['direct']}

GOAL: ${goalLabel[finalGoal || 'AddValue'] || finalGoal}
TONE: ${toneLabel[finalTone || 'Professional'] || finalTone}
LENGTH: ${lengthLabel[finalLength || 'Short'] || finalLength}

CRITICAL RULES:
- STYLE FORMAT is non-negotiable. Structured = blank lines between paragraphs. Single paragraph = no line breaks.
- GOAL defines what the comment must achieve. If "Ask Question", end with a question.
- TONE defines the voice. If "Humorous", write with wit. If "Professional", no casual language.
- LENGTH is a hard cap. Do not exceed it.
- NOTE: Any style voice examples in the instructions are for vocabulary/personality ONLY. The STYLE FORMAT above always governs structure.
Output ONLY the comment text. No labels, no quotes, no preamble.`;

      const completion = await openai.chat.completions.create({
        model: selectedModel,
        messages: [
          {
            role: 'system',
            content: systemMsg,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.82,
        max_tokens: maxTokens,
      });

      content = completion.choices[0].message.content?.trim() || '';
      console.log('✅ OpenAI comment generation successful');
      
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
