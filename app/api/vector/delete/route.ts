import { NextRequest, NextResponse } from 'next/server';
import { Index } from '@upstash/vector';
import { verifyToken } from '@/lib/auth';

// Initialize Upstash Vector
const vectorIndex = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

// DELETE - Remove all posts from a specific inspiration source
export async function POST(request: NextRequest) {
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
    const body = await request.json();
    const { profileUrl } = body as { profileUrl: string };

    if (!profileUrl) {
      return NextResponse.json({ success: false, error: 'Profile URL is required' }, { status: 400 });
    }

    console.log(`🗑️ Deleting posts from ${profileUrl} for user ${userId}`);

    // Query to find all vectors for this user and source
    const queryResponse = await vectorIndex.query({
      data: "posts content", // Generic query to match all
      topK: 1000,
      filter: `userId = '${userId}' AND authorUrl = '${profileUrl}'`,
      includeMetadata: true,
    });

    if (queryResponse.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No posts found for this source',
        deleted: 0,
      });
    }

    // Extract IDs to delete
    const idsToDelete = queryResponse.map(r => r.id);

    // Delete vectors in batches
    const batchSize = 100;
    for (let i = 0; i < idsToDelete.length; i += batchSize) {
      const batch = idsToDelete.slice(i, i + batchSize) as string[];
      await vectorIndex.delete(batch);
    }

    console.log(`✅ Deleted ${idsToDelete.length} posts from ${profileUrl}`);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${idsToDelete.length} posts`,
      deleted: idsToDelete.length,
    });

  } catch (error: any) {
    console.error('Delete source error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete source' },
      { status: 500 }
    );
  }
}
