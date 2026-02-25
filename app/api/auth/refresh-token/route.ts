import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRefreshToken, generateToken, generateRefreshToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/refresh-token
 * Accepts a refresh token in the request body and returns a new access token + refresh token.
 * This is the endpoint the extension's apiService.js calls.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { refreshToken } = body;

        if (!refreshToken) {
            return NextResponse.json(
                { success: false, error: 'Refresh token is required' },
                { status: 400 }
            );
        }

        // Verify the refresh token
        let payload: any;
        try {
            payload = verifyRefreshToken(refreshToken);
        } catch (err: any) {
            if (err.name === 'TokenExpiredError') {
                return NextResponse.json(
                    { success: false, error: 'Refresh token has expired. Please re-login.', shouldReauth: true },
                    { status: 401 }
                );
            }
            return NextResponse.json(
                { success: false, error: 'Invalid refresh token', shouldReauth: true },
                { status: 401 }
            );
        }

        // Verify user still exists
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { id: true, email: true },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        // Generate fresh tokens
        const newToken = generateToken({ userId: user.id, email: user.email });
        const newRefreshToken = generateRefreshToken({ userId: user.id, email: user.email });

        return NextResponse.json({
            success: true,
            token: newToken,
            refreshToken: newRefreshToken,
        });
    } catch (error: any) {
        console.error('Refresh token error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
