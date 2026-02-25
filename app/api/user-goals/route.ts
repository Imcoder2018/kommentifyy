import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const token = extractToken(request.headers.get('authorization'));
        if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        const payload = verifyToken(token);

        const profileData = await (prisma as any).linkedInProfileData.findUnique({
            where: { userId: payload.userId },
            select: { language: true }
        });

        if (!profileData || !profileData.language) {
            return NextResponse.json({ success: true, data: null });
        }

        try {
            const goals = JSON.parse(profileData.language);
            return NextResponse.json({ success: true, data: goals });
        } catch (e) {
            return NextResponse.json({ success: true, data: null });
        }
    } catch (error: any) {
        console.error('Get user goals error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = extractToken(request.headers.get('authorization'));
        if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        const payload = verifyToken(token);

        const data = await request.json();
        const { goal, targetAudience, writingStyle, writingStyleSource } = data;

        const goalsJson = JSON.stringify({
            goal,
            targetAudience,
            writingStyle,
            writingStyleSource
        });

        await (prisma as any).linkedInProfileData.upsert({
            where: { userId: payload.userId },
            update: { language: goalsJson },
            create: {
                userId: payload.userId,
                language: goalsJson,
                posts: "[]",
                experience: "[]",
                education: "[]",
                certifications: "[]",
                projects: "[]",
                skills: "[]",
                interests: "[]",
                recentPosts: "[]"
            }
        });

        return NextResponse.json({ success: true, message: 'Goals updated successfully' });
    } catch (error: any) {
        console.error('Save user goals error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
