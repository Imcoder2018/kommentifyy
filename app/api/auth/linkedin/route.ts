import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractToken } from '@/lib/auth';
import { getLinkedInAuthUrl } from '@/lib/linkedin-service';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/linkedin
 * Initiates LinkedIn OAuth flow. Returns the authorization URL.
 */
export async function GET(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const payload = verifyToken(token);

    // Check if user already has LinkedIn connected
    const existing = await (prisma as any).linkedInOAuth.findUnique({
      where: { userId: payload.userId },
    });

    if (existing && existing.isActive) {
      return NextResponse.json({
        success: true,
        connected: true,
        displayName: existing.displayName,
        email: existing.email,
        linkedinId: existing.linkedinId,
        tokenExpired: existing.tokenExpiresAt ? new Date(existing.tokenExpiresAt) < new Date() : false,
      });
    }

    // Generate OAuth URL with user ID as state
    const state = Buffer.from(JSON.stringify({ userId: payload.userId, ts: Date.now() })).toString('base64');
    const authUrl = getLinkedInAuthUrl(state);

    return NextResponse.json({ success: true, connected: false, authUrl });
  } catch (error: any) {
    console.error('LinkedIn OAuth init error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/auth/linkedin
 * Disconnect LinkedIn account
 */
export async function DELETE(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const payload = verifyToken(token);

    await (prisma as any).linkedInOAuth.deleteMany({
      where: { userId: payload.userId },
    });

    return NextResponse.json({ success: true, message: 'LinkedIn disconnected' });
  } catch (error: any) {
    console.error('LinkedIn disconnect error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
