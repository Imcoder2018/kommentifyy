import { NextRequest, NextResponse } from 'next/server';
import { Index } from '@upstash/vector';
import OpenAI from 'openai';
import { verifyToken } from '@/lib/auth';

// Initialize Upstash Vector
const vectorIndex = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.userId;
    const body = await request.json();
    const { 
      topic, 
      template = 'thought_leadership',
      tone = 'professional',
      length = 1500,
      includeEmojis = true,
      includeHashtags = false,
      useInspirationContext = true,
      selectedSources = [],
      topK = 3,
    } = body;

    if (!topic || topic.trim().length < 3) {
      return NextResponse.json({ success: false, error: 'Topic is required' }, { status: 400 });
    }

    console.log(`🚀 Generating post about "${topic}" for user ${userId} (useContext: ${useInspirationContext})`);

    let contextPosts: string[] = [];

    // If using inspiration context, fetch similar posts from vector DB
    if (useInspirationContext) {
      try {
        // Build filter
        let filter = `userId = '${userId}'`;
        if (selectedSources && selectedSources.length > 0) {
          const sourceFilters = selectedSources
            .map((url: string) => `authorUrl = '${url}'`)
            .join(' OR ');
          filter = `${filter} AND (${sourceFilters})`;
        }

        console.log('🔍 Querying vector DB with filter:', filter);

        // Query using 'data' field - Upstash will auto-embed the query text
        const queryResponse = await vectorIndex.query({
          data: topic, // Upstash auto-embeds this
          topK: Math.min(topK, 5),
          filter,
          includeMetadata: true,
        });

        contextPosts = queryResponse
          .filter((r: any) => r.metadata?.content)
          .map((r: any) => r.metadata.content as string);

        console.log(`📚 Found ${contextPosts.length} context posts for inspiration`);
      } catch (vectorError) {
        console.error('Vector search failed, continuing without context:', vectorError);
      }
    }

    // Build the prompt with context
    let contextSection = '';
    if (contextPosts.length > 0) {
      contextSection = `
Here are ${contextPosts.length} example posts from influencers the user follows. Analyze their writing style, structure, and tone, then create a new post that matches this style:

${contextPosts.map((post, i) => `--- EXAMPLE ${i + 1} ---
${post}
---`).join('\n\n')}

IMPORTANT: Mimic the writing style, structure, and voice from these examples while creating original content about the topic.
`;
    }

    const systemPrompt = `You are a LinkedIn content expert who creates viral, engaging posts. 
${contextSection}

Create a ${template.replace('_', ' ')} style LinkedIn post about the topic.
Tone: ${tone}
Target length: approximately ${length} characters
${includeEmojis ? 'Include relevant emojis to make the post engaging.' : 'Do not use emojis.'}
${includeHashtags ? 'Include 3-5 relevant hashtags at the end.' : 'Do not include hashtags.'}

Guidelines:
- Start with a hook that grabs attention
- Use short paragraphs and line breaks for readability
- Include a clear call-to-action or thought-provoking question
- Make it personal and authentic
- Avoid corporate jargon
- Create something that would get engagement and comments`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Write a LinkedIn post about: ${topic}` },
      ],
      max_tokens: 1500,
      temperature: 0.8,
    });

    const generatedPost = completion.choices[0]?.message?.content || '';

    console.log(`✅ Generated post (${generatedPost.length} chars) with ${contextPosts.length} context examples`);

    return NextResponse.json({
      success: true,
      post: generatedPost,
      contextUsed: contextPosts.length,
      topic,
    });

  } catch (error: any) {
    console.error('Generate with RAG error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate post' },
      { status: 500 }
    );
  }
}
