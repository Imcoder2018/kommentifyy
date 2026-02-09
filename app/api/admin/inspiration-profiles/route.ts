import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Index } from '@upstash/vector';

export const dynamic = 'force-dynamic';

let vectorIndex: any = null;
try {
  if (process.env.UPSTASH_VECTOR_REST_URL && process.env.UPSTASH_VECTOR_REST_TOKEN) {
    vectorIndex = new Index({
      url: (process.env.UPSTASH_VECTOR_REST_URL || '').trim(),
      token: (process.env.UPSTASH_VECTOR_REST_TOKEN || '').trim(),
    });
  }
} catch (e) { console.warn('Vector index not available'); }

// GET - Admin: List all inspiration profiles across all users (from vector DB)
export async function GET(request: NextRequest) {
  try {
    const adminToken = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!adminToken) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const jwt = require('jsonwebtoken');
    try { jwt.verify(adminToken, process.env.JWT_SECRET || 'fallback-secret'); } catch { return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 }); }

    if (!vectorIndex) return NextResponse.json({ success: false, error: 'Vector DB not configured' }, { status: 500 });

    // Query vector DB to get all posts (broad query)
    const queryResponse = await vectorIndex.query({
      data: "linkedin posts content inspiration",
      topK: 1000,
      includeMetadata: true,
    });

    // Extract unique profiles grouped by profileUrl + userId
    const profilesMap = new Map<string, { profileUrl: string; profileName: string; userId: string; postCount: number }>();
    for (const result of queryResponse) {
      const authorUrl = result.metadata?.authorUrl as string;
      const authorName = result.metadata?.authorName as string;
      const userId = result.metadata?.userId as string;
      if (authorUrl && authorName && userId) {
        const key = `${userId}_${authorUrl}`;
        if (profilesMap.has(key)) {
          profilesMap.get(key)!.postCount++;
        } else {
          profilesMap.set(key, { profileUrl: authorUrl, profileName: authorName, userId, postCount: 1 });
        }
      }
    }

    const profiles = Array.from(profilesMap.values());

    // Fetch user info
    const userIds = [...new Set(profiles.map(p => p.userId))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });
    const userMap = new Map(users.map(u => [u.id, u]));

    // Check which are already shared
    const shared = await (prisma as any).sharedInspirationProfile.findMany();
    const sharedUrls = new Set(shared.map((s: any) => s.profileUrl));

    const profilesWithUser = profiles.map(p => ({
      ...p,
      user: userMap.get(p.userId) || { name: 'Unknown', email: 'Unknown' },
      isShared: sharedUrls.has(p.profileUrl),
    }));

    return NextResponse.json({ success: true, profiles: profilesWithUser });
  } catch (error: any) {
    console.error('Admin get inspiration profiles error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT - Admin: Share/unshare inspiration profiles with all users
export async function PUT(request: NextRequest) {
  try {
    const adminToken = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!adminToken) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const jwt = require('jsonwebtoken');
    let decoded: any;
    try { decoded = jwt.verify(adminToken, process.env.JWT_SECRET || 'fallback-secret'); } catch { return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 }); }

    const { profiles, shared } = await request.json();
    if (!profiles || !Array.isArray(profiles)) return NextResponse.json({ success: false, error: 'profiles array required' }, { status: 400 });

    if (shared === true) {
      // Add to shared profiles
      for (const p of profiles) {
        await (prisma as any).sharedInspirationProfile.upsert({
          where: { profileUrl: p.profileUrl },
          create: {
            profileUrl: p.profileUrl,
            profileName: p.profileName,
            postCount: p.postCount || 0,
            sourceUserId: p.userId,
            sharedBy: decoded.adminId || decoded.userId || 'admin',
          },
          update: {
            profileName: p.profileName,
            postCount: p.postCount || 0,
          },
        });
      }
    } else {
      // Remove from shared profiles
      const urls = profiles.map((p: any) => p.profileUrl);
      await (prisma as any).sharedInspirationProfile.deleteMany({
        where: { profileUrl: { in: urls } },
      });
    }

    return NextResponse.json({ success: true, updated: profiles.length, shared: shared === true });
  } catch (error: any) {
    console.error('Admin share inspiration profiles error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
