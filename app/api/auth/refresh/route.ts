import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, generateToken, extractToken } from '@/lib/auth';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/refresh
 * Refreshes a JWT token if the current one is still valid or recently expired (within 7 days).
 * Returns a new token with fresh expiry.
 */
export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ success: false, error: 'No token provided' }, { status: 401 });
    }

    let payload: any;
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

    // Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Generate a fresh token
    const newToken = generateToken({
      userId: user.id,
      email: user.email,
    });

    return NextResponse.json({ 
      success: true, 
      token: newToken,
      expiresIn: '90d'
    });
  } catch (error: any) {
    console.error('Token refresh error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
