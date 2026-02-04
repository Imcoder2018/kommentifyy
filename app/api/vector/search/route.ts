import { NextRequest, NextResponse } from 'next/server';
import { Index } from '@upstash/vector';
import OpenAI from 'openai';
import { verifyToken } from '@/lib/auth';

// Initialize Upstash Vector
const vectorIndex = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

// Initialize OpenAI for embeddings
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
      topK = 5, 
      selectedSources = [] 
    } = body as { 
      topic: string; 
      topK?: number; 
      selectedSources?: string[]; 
    };

    if (!topic || topic.trim().length < 3) {
      return NextResponse.json({ success: false, error: 'Topic is required (min 3 chars)' }, { status: 400 });
    }

    console.log(`🔍 Searching for "${topic}" with top ${topK} results for user ${userId}`);

    // Generate embedding for the search topic using BGE
    const embeddingResponse = await fetch('https://api.upstash.com/v1/vector/embed', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.UPSTASH_VECTOR_REST_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'BGE_SMALL_EN_V1_5',
        input: topic
      })
    });
    
    const embeddingData = await embeddingResponse.json();
    const queryVector = embeddingData.data[0].embedding;

    // Build filter for user and optionally specific sources
    let filter = `userId = '${userId}'`;
    
    if (selectedSources && selectedSources.length > 0) {
      const sourceFilters = selectedSources
        .map(url => `authorUrl = '${url}'`)
        .join(' OR ');
      filter = `${filter} AND (${sourceFilters})`;
    }

    // Query vector DB for similar posts
    const queryResponse = await vectorIndex.query({
      vector: queryVector,
      topK: Math.min(topK, 10),
      filter,
      includeMetadata: true,
      includeVectors: false,
    });

    // Format results
    const results = queryResponse.map((result) => ({
      id: result.id,
      score: result.score,
      content: result.metadata?.content as string,
      authorName: result.metadata?.authorName as string,
      authorUrl: result.metadata?.authorUrl as string,
      postUrl: result.metadata?.postUrl as string,
      likes: result.metadata?.likes as number,
      comments: result.metadata?.comments as number,
    }));

    console.log(`✅ Found ${results.length} similar posts for "${topic}"`);

    return NextResponse.json({
      success: true,
      results,
      query: topic,
    });

  } catch (error: any) {
    console.error('Vector search error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to search posts' },
      { status: 500 }
    );
  }
}
