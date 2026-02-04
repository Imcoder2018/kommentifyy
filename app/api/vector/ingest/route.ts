import { NextRequest, NextResponse } from 'next/server';
import { Index } from '@upstash/vector';
import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';
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

interface ScrapedPost {
  content: string;
  authorName: string;
  authorUrl: string;
  postUrl?: string;
  likes?: number;
  comments?: number;
  postedAt?: string;
}

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
    const { posts, inspirationSource } = body as { 
      posts: ScrapedPost[]; 
      inspirationSource: { name: string; profileUrl: string; } 
    };

    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      return NextResponse.json({ success: false, error: 'No posts provided' }, { status: 400 });
    }

    if (!inspirationSource?.name || !inspirationSource?.profileUrl) {
      return NextResponse.json({ success: false, error: 'Inspiration source info required' }, { status: 400 });
    }

    console.log(`📥 Ingesting ${posts.length} posts from ${inspirationSource.name} for user ${userId}`);

    const vectors = [];
    
    for (const post of posts) {
      if (!post.content || post.content.trim().length < 50) {
        continue; // Skip very short posts
      }

      // Generate embedding using BGE
      const embeddingResponse = await fetch('https://api.upstash.com/v1/vector/embed', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.UPSTASH_VECTOR_REST_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'BGE_SMALL_EN_V1_5',
          input: post.content.substring(0, 8000)
        })
      });
      
      const embeddingData = await embeddingResponse.json();
      const embedding = embeddingData.data[0].embedding;

      // Create unique ID for this post
      const postId = `${userId}_${inspirationSource.profileUrl.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      vectors.push({
        id: postId,
        vector: embedding,
        metadata: {
          userId,
          content: post.content.substring(0, 5000), // Store truncated content
          authorName: inspirationSource.name,
          authorUrl: inspirationSource.profileUrl,
          postUrl: post.postUrl || '',
          likes: post.likes || 0,
          comments: post.comments || 0,
          postedAt: post.postedAt || new Date().toISOString(),
          ingestedAt: new Date().toISOString(),
        },
      });
    }

    if (vectors.length === 0) {
      return NextResponse.json({ success: false, error: 'No valid posts to ingest' }, { status: 400 });
    }

    // Upsert vectors to Upstash in batches of 100
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await vectorIndex.upsert(batch);
    }

    console.log(`✅ Successfully ingested ${vectors.length} posts for user ${userId}`);

    return NextResponse.json({
      success: true,
      message: `Successfully ingested ${vectors.length} posts from ${inspirationSource.name}`,
      count: vectors.length,
    });

  } catch (error: any) {
    console.error('Vector ingest error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to ingest posts' },
      { status: 500 }
    );
  }
}

// GET - List all inspiration sources for a user
export async function GET(request: NextRequest) {
  try {
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

    // Query vector DB to get unique inspiration sources
    // Note: This is a simplified approach - in production you might want a separate table
    const queryResponse = await vectorIndex.query({
      vector: new Array(1536).fill(0), // Dummy vector for metadata retrieval
      topK: 1000,
      filter: `userId = '${userId}'`,
      includeMetadata: true,
    });

    // Extract unique sources
    const sourcesMap = new Map<string, { name: string; profileUrl: string; postCount: number }>();
    
    for (const result of queryResponse) {
      const authorUrl = result.metadata?.authorUrl as string;
      const authorName = result.metadata?.authorName as string;
      
      if (authorUrl && authorName) {
        if (sourcesMap.has(authorUrl)) {
          sourcesMap.get(authorUrl)!.postCount++;
        } else {
          sourcesMap.set(authorUrl, {
            name: authorName,
            profileUrl: authorUrl,
            postCount: 1,
          });
        }
      }
    }

    const sources = Array.from(sourcesMap.values());

    return NextResponse.json({
      success: true,
      sources,
    });

  } catch (error: any) {
    console.error('Get sources error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get sources' },
      { status: 500 }
    );
  }
}
