import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { exchangeCodeForToken, getLinkedInProfile } from '@/lib/linkedin-service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/linkedin/callback
 * LinkedIn OAuth callback - exchanges code for token and stores it.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      console.error('LinkedIn OAuth error:', error, searchParams.get('error_description'));
      return NextResponse.redirect(new URL('/dashboard?tab=account&linkedin=error', request.url));
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL('/dashboard?tab=account&linkedin=missing_params', request.url));
    }

    // Decode state to get userId
    let stateData: { userId: string; ts: number };
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    } catch {
      return NextResponse.redirect(new URL('/dashboard?tab=account&linkedin=invalid_state', request.url));
    }

    // Verify state is not too old (10 minutes)
    if (Date.now() - stateData.ts > 10 * 60 * 1000) {
      return NextResponse.redirect(new URL('/dashboard?tab=account&linkedin=expired', request.url));
    }

    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(code);

    // Fetch LinkedIn profile
    const profile = await getLinkedInProfile(tokenData.access_token);

    // Calculate token expiry (LinkedIn tokens last 60 days)
    const tokenExpiresAt = new Date(Date.now() + (tokenData.expires_in || 5184000) * 1000);

    // Store or update LinkedIn OAuth data
    await (prisma as any).linkedInOAuth.upsert({
      where: { userId: stateData.userId },
      create: {
        userId: stateData.userId,
        linkedinId: profile.sub,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || null,
        tokenExpiresAt,
        scopes: 'openid,profile,email,w_member_social',
        displayName: profile.name,
        email: profile.email || null,
        profileUrl: `https://www.linkedin.com/in/${profile.sub}`,
        isActive: true,
      },
      update: {
        linkedinId: profile.sub,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || null,
        tokenExpiresAt,
        scopes: 'openid,profile,email,w_member_social',
        displayName: profile.name,
        email: profile.email || null,
        isActive: true,
      },
    });

    console.log(`✅ LinkedIn OAuth connected for user ${stateData.userId}: ${profile.name}`);

    return NextResponse.redirect(new URL('/dashboard?tab=account&linkedin=connected', request.url));
  } catch (error: any) {
    console.error('LinkedIn OAuth callback error:', error);
    return NextResponse.redirect(new URL(`/dashboard?tab=account&linkedin=error&msg=${encodeURIComponent(error.message)}`, request.url));
  }
}
