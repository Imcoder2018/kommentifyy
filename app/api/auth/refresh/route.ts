import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, verifyRefreshToken, generateToken, generateRefreshToken, extractToken } from '@/lib/auth';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/refresh
 * Refreshes a JWT token. Supports two modes:
 * 1. Body contains { refreshToken } — verify the refresh token (preferred, more secure)
 * 2. Authorization header with expired access token — decode and reissue if expired <7 days (legacy)
 * Returns a new access token + refresh token.
 */
export async function POST(request: NextRequest) {
  try {
    // Try to parse body for refreshToken
    let bodyRefreshToken: string | null = null;
    try {
      const body = await request.json();
      bodyRefreshToken = body?.refreshToken || null;
    } catch {
      // Body may be empty or not JSON — that's fine, fall through to header-based flow
    }

    let payload: any;

    // Mode 1: Refresh token in body (preferred)
    if (bodyRefreshToken) {
      try {
        payload = verifyRefreshToken(bodyRefreshToken);
      } catch (err: any) {
        if (err.name === 'TokenExpiredError') {
          return NextResponse.json({
            success: false,
            error: 'Refresh token has expired. Please re-login.',
            shouldReauth: true
          }, { status: 401 });
        }
        return NextResponse.json({ success: false, error: 'Invalid refresh token', shouldReauth: true }, { status: 401 });
      }
    } else {
      // Mode 2: Expired access token in Authorization header (legacy fallback)
      const token = extractToken(request.headers.get('authorization'));
      if (!token) {
        return NextResponse.json({ success: false, error: 'No token provided' }, { status: 401 });
      }

      try {
        // First try normal verification
        payload = verifyToken(token);
      } catch (err: any) {
        // If expired, decode without verification to get payload
        if (err.name === 'TokenExpiredError') {
          const decoded = jwt.decode(token) as any;
          if (!decoded || !decoded.userId || !decoded.email) {
            return NextResponse.json({ success: false, error: 'Invalid token structure' }, { status: 401 });
          }
          // Only allow refresh if expired within last 7 days
          const expiredAt = new Date((decoded.exp || 0) * 1000);
          const daysSinceExpiry = (Date.now() - expiredAt.getTime()) / (1000 * 60 * 60 * 24);
          if (daysSinceExpiry > 7) {
            return NextResponse.json({
              success: false,
              error: 'Token expired too long ago. Please re-login.',
              shouldReauth: true
            }, { status: 401 });
          }
          payload = decoded;
        } else {
          return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
        }
      }
    }

    // Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Generate fresh tokens
    const newToken = generateToken({
      userId: user.id,
      email: user.email,
    });
    const newRefreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    return NextResponse.json({
      success: true,
      token: newToken,
      refreshToken: newRefreshToken,
      expiresIn: '7d'
    });
  } catch (error: any) {
    console.error('Token refresh error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
