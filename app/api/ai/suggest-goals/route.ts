import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';
import OpenAI from 'openai';

let openai: OpenAI | null = null;
try {
    if (process.env.OPENAI_API_KEY) {
        openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY.trim() });
    }
} catch (error) {
    console.error('Failed to initialize OpenAI client:', error);
}

export async function POST(request: NextRequest) {
    try {
        const token = extractToken(request.headers.get('authorization'));
        if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        verifyToken(token); // Just verify it's valid, payload not needed
        const { profileData } = await request.json();

        if (!profileData) {
            return NextResponse.json({ success: false, error: 'Profile data is required' }, { status: 400 });
        }

        // Default suggestions if OpenAI fails or missing
        const defaultGoal = "Share professional insights and build personal brand";
        const defaultAudience = "Professionals in my industry";

        if (!openai || !process.env.OPENAI_API_KEY) {
            return NextResponse.json({
                success: true,
                goal: defaultGoal,
                targetAudience: defaultAudience
            });
        }

        // Prepare context
        const profileContext = `
      Headline: ${profileData.headline || 'None'}
      About: ${profileData.about || 'None'}
      Skills: ${Array.isArray(profileData.skills) ? profileData.skills.slice(0, 10).join(', ') : 'None'}
      Experience: ${Array.isArray(profileData.experience) ? profileData.experience.map((e: any) => e.title + " at " + e.companyName).slice(0, 3).join(' | ') : 'None'}
    `;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert LinkedIn strategist. Based on a user\'s profile data, suggest their primary goal for writing LinkedIn posts, and their target audience. Keep each suggestion to 1 short sentence or phrase (under 10 words). Return the response as JSON with "goal" and "targetAudience" keys.'
                },
                {
                    role: 'user',
                    content: `Profile Data:\n${profileContext}`
                }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }
        });

        const responseContent = completion.choices[0]?.message?.content || '{}';
        let result;
        try {
            result = JSON.parse(responseContent);
        } catch (e) {
            result = { goal: defaultGoal, targetAudience: defaultAudience };
        }

        return NextResponse.json({
            success: true,
            goal: result.goal || defaultGoal,
            targetAudience: result.targetAudience || defaultAudience
        });

    } catch (error: any) {
        console.error('Suggest goals error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
