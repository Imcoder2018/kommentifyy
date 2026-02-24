import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';
import { postToLinkedIn, postWithImageToLinkedIn, postWithVideoToLinkedIn } from '@/lib/linkedin-service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/linkedin/post
 * Posts content to LinkedIn via the LinkedIn API using the user's stored OAuth token.
 * Supports text-only, image, and video posts.
 *
 * Request body: { content: string, mediaUrl?: string, mediaType?: 'image' | 'video' }
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Authenticate user
        const token = extractToken(request.headers.get('authorization'));
        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const payload = verifyToken(token);
        const { content, mediaUrl, mediaType } = await request.json();

        if (!content || !content.trim()) {
            return NextResponse.json(
                { success: false, error: 'Post content is required' },
                { status: 400 }
            );
        }

        // 2. Get user's LinkedIn OAuth credentials
        const linkedInOAuth = await (prisma as any).linkedInOAuth.findUnique({
            where: { userId: payload.userId },
        });

        if (!linkedInOAuth || !linkedInOAuth.isActive) {
            return NextResponse.json(
                { success: false, error: 'LinkedIn account not connected. Please connect your LinkedIn account in the Account tab.' },
                { status: 400 }
            );
        }

        // 3. Check if token has expired
        if (linkedInOAuth.tokenExpiresAt && new Date(linkedInOAuth.tokenExpiresAt) < new Date()) {
            // Mark as inactive so the user knows to reconnect
            await (prisma as any).linkedInOAuth.update({
                where: { userId: payload.userId },
                data: { isActive: false },
            });

            return NextResponse.json(
                { success: false, error: 'LinkedIn token has expired. Please reconnect your LinkedIn account in the Account tab.' },
                { status: 401 }
            );
        }

        // 4. Post to LinkedIn using the appropriate method
        let result;
        try {
            if (mediaUrl && mediaType === 'video') {
                console.log(`📹 Posting video to LinkedIn for user ${payload.userId}`);
                result = await postWithVideoToLinkedIn(
                    linkedInOAuth.accessToken,
                    linkedInOAuth.linkedinId,
                    content,
                    mediaUrl
                );
            } else if (mediaUrl && mediaType === 'image') {
                console.log(`🖼️ Posting image to LinkedIn for user ${payload.userId}`);
                result = await postWithImageToLinkedIn(
                    linkedInOAuth.accessToken,
                    linkedInOAuth.linkedinId,
                    content,
                    mediaUrl
                );
            } else {
                console.log(`📝 Posting text to LinkedIn for user ${payload.userId}`);
                result = await postToLinkedIn(
                    linkedInOAuth.accessToken,
                    linkedInOAuth.linkedinId,
                    content
                );
            }
        } catch (apiError: any) {
            console.error('LinkedIn API error:', apiError.message);

            // If 401 unauthorized, mark token as expired
            if (apiError.message?.includes('401')) {
                await (prisma as any).linkedInOAuth.update({
                    where: { userId: payload.userId },
                    data: { isActive: false },
                });
                return NextResponse.json(
                    { success: false, error: 'LinkedIn token expired or revoked. Please reconnect your LinkedIn account.' },
                    { status: 401 }
                );
            }

            return NextResponse.json(
                { success: false, error: `LinkedIn posting failed: ${apiError.message}` },
                { status: 500 }
            );
        }

        // 5. Update last used timestamp
        await (prisma as any).linkedInOAuth.update({
            where: { userId: payload.userId },
            data: { lastUsedAt: new Date() },
        });

        console.log(`✅ Posted to LinkedIn via API for user ${payload.userId}, postId: ${result?.id}`);

        return NextResponse.json({
            success: true,
            postId: result?.id || null,
            message: 'Posted to LinkedIn successfully!',
        });
    } catch (error: any) {
        console.error('LinkedIn post error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to post to LinkedIn' },
            { status: 500 }
        );
    }
}
