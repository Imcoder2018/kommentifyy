import { NextRequest, NextResponse } from 'next/server';
import { Index } from '@upstash/vector';
import { verifyToken } from '@/lib/auth';

// Initialize Upstash Vector (with built-in embeddings)
const vectorIndex = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
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

    const upsertItems = [];
    
    for (const post of posts) {
      if (!post.content || post.content.trim().length < 50) {
        continue; // Skip very short posts
      }

      // Create unique ID for this post
      const postId = `${userId}_${inspirationSource.profileUrl.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      // Use 'data' field for Upstash Vector with built-in embeddings
      upsertItems.push({
        id: postId,
        data: post.content.substring(0, 8000), // Upstash will auto-embed this
        metadata: {
          userId,
          content: post.content.substring(0, 5000), // Store truncated content for retrieval
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

    if (upsertItems.length === 0) {
      return NextResponse.json({ success: false, error: 'No valid posts to ingest' }, { status: 400 });
    }

    console.log(`📤 Upserting ${upsertItems.length} posts to Upstash Vector...`);
    console.log(`📤 Upstash URL configured: ${process.env.UPSTASH_VECTOR_REST_URL ? 'Yes' : 'NO - MISSING!'}`);
    console.log(`📤 Upstash Token configured: ${process.env.UPSTASH_VECTOR_REST_TOKEN ? 'Yes' : 'NO - MISSING!'}`);

    // Upsert to Upstash in batches of 100
    const batchSize = 100;
    for (let i = 0; i < upsertItems.length; i += batchSize) {
      const batch = upsertItems.slice(i, i + batchSize);
      try {
        const result = await vectorIndex.upsert(batch);
        console.log(`📤 Batch ${i / batchSize + 1} upsert result:`, result);
      } catch (upsertError: any) {
        console.error(`❌ Batch ${i / batchSize + 1} upsert failed:`, upsertError.message);
        throw upsertError;
      }
    }

    console.log(`✅ Successfully ingested ${upsertItems.length} posts for user ${userId}`);

    return NextResponse.json({
      success: true,
      message: `Successfully ingested ${upsertItems.length} posts from ${inspirationSource.name}`,
      count: upsertItems.length,
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
    // Use a generic query to retrieve all user's posts
    const queryResponse = await vectorIndex.query({
      data: "inspiration sources content posts", // Generic query to match all content
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
