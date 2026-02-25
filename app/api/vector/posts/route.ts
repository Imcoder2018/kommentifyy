import { NextRequest, NextResponse } from 'next/server';
import { Index } from '@upstash/vector';
import { verifyToken } from '@/lib/auth';

const vectorIndex = new Index({
  url: (process.env.UPSTASH_VECTOR_REST_URL || '').trim(),
  token: (process.env.UPSTASH_VECTOR_REST_TOKEN || '').trim(),
});

// GET - Fetch all posts for a specific source/profile
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
    const { searchParams } = new URL(request.url);
    const sourceName = searchParams.get('sourceName');

    if (!sourceName) {
      return NextResponse.json({ success: false, error: 'sourceName parameter required' }, { status: 400 });
    }

    // Query vector DB to get all posts from this source
    const queryResponse = await vectorIndex.query({
      data: "posts content from profile", // Generic query
      topK: 1000,
      filter: `userId = '${userId}' AND authorName = '${sourceName.replace(/'/g, "''")}'`,
      includeMetadata: true,
    });

    const posts = queryResponse.map((result: any) => ({
      content: result.metadata?.content || '',
      postUrl: result.metadata?.postUrl || '',
      engagement: {
        likes: result.metadata?.likes || 0,
        comments: result.metadata?.comments || 0,
      },
      postedAt: result.metadata?.postedAt || '',
    }));

    return NextResponse.json({
      success: true,
      posts,
      count: posts.length,
    });

  } catch (error: any) {
    console.error('Get posts error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get posts' },
      { status: 500 }
    );
  }
}
