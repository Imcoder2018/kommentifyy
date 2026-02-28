import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

function verifyAdminToken(token: string) {
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

// GET - Admin: List all comment style profiles across all users
export async function GET(request: NextRequest) {
  try {
    const adminToken = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!adminToken) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    if (!verifyAdminToken(adminToken)) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });

    const profiles = await (prisma as any).commentStyleProfile.findMany({
      orderBy: { commentCount: 'desc' },
      include: { _count: { select: { comments: true } } },
    });

    // Fetch user info
    const userIds = [...new Set(profiles.map((p: any) => p.userId))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds as string[] } },
      select: { id: true, name: true, email: true },
    });
    const userMap = new Map(users.map(u => [u.id, u]));

    const profilesWithUser = profiles.map((p: any) => ({
      ...p,
      user: userMap.get(p.userId) || { name: 'Unknown', email: 'Unknown' },
    }));

    return NextResponse.json({ success: true, profiles: profilesWithUser });
  } catch (error: any) {
    console.error('Admin get comment profiles error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT - Admin: Share/unshare comment profiles with all users
export async function PUT(request: NextRequest) {
  try {
    const adminToken = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!adminToken) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    if (!verifyAdminToken(adminToken)) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });

    const { profileIds, shared } = await request.json();
    if (!profileIds || !Array.isArray(profileIds)) return NextResponse.json({ success: false, error: 'profileIds array required' }, { status: 400 });

    await (prisma as any).commentStyleProfile.updateMany({
      where: { id: { in: profileIds } },
      data: { isSharedByAdmin: shared === true },
    });

    return NextResponse.json({ success: true, updated: profileIds.length, shared: shared === true });
  } catch (error: any) {
    console.error('Admin share comment profiles error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
