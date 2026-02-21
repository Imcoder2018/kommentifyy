import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';
import { limitService } from '@/lib/limit-service';
import { generateLinkedInPost, getUserModel, generateContent } from '@/lib/ai-service';
import { generatePostPrompt } from '@/lib/openai-config';
import { formatForLinkedIn } from '@/lib/linkedin-formatter';
import { Index } from '@upstash/vector';

// Developer emails that can see token usage and costs
const DEVELOPER_EMAILS = ['alanemarkef199@gmail.com', 'arman@arwebcraftslive.com'];

let vectorIndex: any = null;
try {
  if (process.env.UPSTASH_VECTOR_REST_URL && process.env.UPSTASH_VECTOR_REST_TOKEN) {
    vectorIndex = new Index({
      url: (process.env.UPSTASH_VECTOR_REST_URL || '').trim(),
      token: (process.env.UPSTASH_VECTOR_REST_TOKEN || '').trim(),
    });
  }
} catch (e) { console.warn('Vector index not available for post generation'); }

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
    const { topic, template, tone, length, includeHashtags, includeEmojis, language, targetAudience, keyMessage, userBackground, useInspirationSources, inspirationSourceNames, useProfileData, profileData, model: requestedModel } = await request.json();

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

    // Get user's preferred model or use requested model
    const selectedModel = requestedModel || await getUserModel(user.id, 'post');
    const isDeveloper = DEVELOPER_EMAILS.includes(user.email || '');

    console.log('Generating post with model:', selectedModel);
    
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

    // Build profile data context if enabled
    let profileDataContext = '';
    if (useProfileData && profileData) {
      console.log('📋 Using LinkedIn profile data for personalization');
      const profileParts: string[] = [];
      
      if (profileData.headline) {
        profileParts.push(`HEADLINE: ${profileData.headline}`);
      }
      if (profileData.about) {
        profileParts.push(`ABOUT: ${profileData.about}`);
      }
      if (profileData.skills && profileData.skills.length > 0) {
        profileParts.push(`SKILLS: ${profileData.skills.slice(0, 10).join(', ')}`);
      }
      if (profileData.experience && profileData.experience.length > 0) {
        profileParts.push(`EXPERIENCE:\n${profileData.experience.slice(0, 3).join('\n')}`);
      }
      if (profileData.education && profileData.education.length > 0) {
        profileParts.push(`EDUCATION: ${profileData.education.slice(0, 2).join(', ')}`);
      }
      if (profileData.posts && profileData.posts.length > 0) {
        const postsSample = profileData.posts.slice(0, 3).map((p: string, i: number) => 
          `[Post ${i + 1}]: "${p.substring(0, 300)}${p.length > 300 ? '...' : ''}"`
        ).join('\n\n');
        profileParts.push(`RECENT POSTS:\n${postsSample}`);
      }
      
      if (profileParts.length > 0) {
        profileDataContext = `

═══════════════════════════════════════════════════════════
👤 USER'S LINKEDIN PROFILE DATA (PERSONALIZE CONTENT)
═══════════════════════════════════════════════════════════

Use this profile information to personalize the post content. Write as if YOU are this person:

${profileParts.join('\n\n')}

═══════════════════════════════════════════════════════════
PERSONALIZATION GUIDELINES:
═══════════════════════════════════════════════════════════
1. Write in FIRST PERSON - use "I", "my", "me" as if you are this person
2. Reference specific experiences, skills, or background naturally
3. Match the tone and style of their recent posts
4. Include relevant details from their headline/about when appropriate
5. Make the content feel authentic to their professional identity
`;
      }
    }

    // Generate prompt using shared logic with new elite prompt
    const basePrompt = generatePostPrompt(topic, template, tone, length, includeHashtags, includeEmojis, targetAudience, keyMessage, userBackground, language);
    const fullPrompt = basePrompt + inspirationContext + profileDataContext;
    
    // 🐛 DEBUG: Log full prompt for Vercel logs
    console.log('\n' + '='.repeat(80));
    console.log('🤖 AI POST GENERATION - FULL PROMPT');
    console.log('='.repeat(80));
    console.log('📋 Request params:', JSON.stringify({
      topic,
      template,
      tone,
      length,
      includeHashtags,
      includeEmojis,
      language,
      targetAudience,
      keyMessage,
      useInspirationSources,
      inspirationSourceNames,
      useProfileData,
      model: selectedModel
    }, null, 2));
    console.log('-'.repeat(80));
    console.log('📝 FULL PROMPT (length: ' + fullPrompt.length + ' chars):');
    console.log('-'.repeat(80));
    console.log(fullPrompt);
    console.log('='.repeat(80) + '\n');

    // Generate content using unified AI service with FULL prompt
    let content;
    let tokenUsage: any = null;
    try {
      // Use generateContent with full prompt instead of generateLinkedInPost
      // This ensures the full prompt with inspiration sources and profile data is used
      const result = await generateContent({
        model: selectedModel,
        systemPrompt: 'You are an expert LinkedIn content writer. Create engaging, professional posts that drive engagement and establish thought leadership.',
        userPrompt: fullPrompt,
        maxTokens: Math.min(4096, Math.ceil((parseInt(length) || 1500) * 2)),
        temperature: 0.8,
        userId: user.id,
        trackUsage: true
      });

      content = result.content;
      console.log('✅ Post generation successful with model:', result.model, 'output length:', content?.length || 0);
      
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
      console.error('AI generation error:', error);
      
      // Use fallback when AI service fails
      console.log('AI service failed, using fallback post');
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
