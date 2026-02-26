import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';
import { generateContent } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    const { postText, authorName, model } = await request.json();

    if (!postText) {
      return NextResponse.json({ success: false, error: 'Post text is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { plan: true },
    });

    if (!user || !user.plan) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Fetch user's LinkedIn profile for context
    let profileContext = '';
    try {
      const linkedInProfile = await (prisma as any).linkedInProfileData.findFirst({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' },
      });
      if (linkedInProfile) {
        const parts: string[] = [];
        if (linkedInProfile.headline) parts.push(`Headline: ${linkedInProfile.headline}`);
        if (linkedInProfile.about) parts.push(`About: ${(linkedInProfile.about as string).substring(0, 300)}`);
        if (linkedInProfile.skills && Array.isArray(linkedInProfile.skills)) {
          parts.push(`Skills: ${linkedInProfile.skills.slice(0, 8).join(', ')}`);
        }
        if (linkedInProfile.experience && Array.isArray(linkedInProfile.experience)) {
          const expTexts = linkedInProfile.experience.slice(0, 2).map((exp: any) => {
            if (typeof exp === 'string') return exp;
            return [exp.title || exp.role, exp.company].filter(Boolean).join(' at ');
          });
          parts.push(`Experience: ${expTexts.join('; ')}`);
        }
        profileContext = parts.join('\n');
      }
    } catch (profileErr) {
      console.warn('Could not load profile for auto-decide:', profileErr);
    }

    // Also try voyager data
    if (!profileContext) {
      try {
        const voyager = await (prisma as any).voyagerProfileData.findFirst({
          where: { userId: user.id },
          orderBy: { updatedAt: 'desc' },
        });
        if (voyager) {
          const parts: string[] = [];
          if (voyager.headline) parts.push(`Headline: ${voyager.headline}`);
          if (voyager.about) parts.push(`About: ${(voyager.about as string).substring(0, 300)}`);
          if (voyager.skills && Array.isArray(voyager.skills)) {
            parts.push(`Skills: ${voyager.skills.slice(0, 8).join(', ')}`);
          }
          profileContext = parts.join('\n');
        }
      } catch (voyagerErr) {
        // ignore
      }
    }

    const selectedModel = model || 'gpt-4o-mini';

    const systemPrompt = `You are a LinkedIn engagement strategist. Analyze posts and decide optimal comment settings. Return ONLY valid JSON.`;

    const userPrompt = `Analyze this LinkedIn post and decide the OPTIMAL comment settings for maximum engagement.

POST TO COMMENT ON:
Author: ${authorName || 'Unknown'}
Content: ${postText.substring(0, 1500)}

${profileContext ? `COMMENTER'S PROFILE:\n${profileContext}` : 'COMMENTER: Professional on LinkedIn'}

DECIDE THE OPTIMAL SETTINGS based on the post content, tone, and commenter's profile:

1. GOAL - Pick ONE: AddValue | ShareExperience | AskQuestion | DifferentPerspective | BuildRelationship | SubtlePitch
   - Controversial/opinion posts -> DifferentPerspective or AskQuestion
   - Personal stories -> BuildRelationship or ShareExperience
   - Educational/how-to -> AddValue
   - Industry news -> AddValue or AskQuestion
   - Achievements -> BuildRelationship

2. TONE - Pick ONE: Professional | Friendly | ThoughtProvoking | Supportive | Contrarian | Humorous
   - Match the energy of the post but add your own flavor

3. LENGTH - Pick ONE: Brief | Short | Mid | Long
   - Simple/short posts -> Brief or Short
   - Deep analysis posts -> Mid or Long
   - Personal stories -> Short or Mid

4. STYLE - Pick ONE: direct | structured | storyteller | challenger | supporter | expert | conversational
   - Match what would create the most natural engagement

Return ONLY this JSON (no markdown, no explanation):
{"goal":"...","tone":"...","length":"...","style":"...","reasoning":"One sentence explaining why"}`;

    const result = await generateContent({
      model: selectedModel,
      systemPrompt,
      userPrompt,
      maxTokens: 200,
      temperature: 0.3,
      userId: user.id,
      trackUsage: false
    });

    let settings;
    try {
      let jsonStr = result.content.trim();
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      settings = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.error('Failed to parse auto-decide JSON:', result.content);
      // Return sensible defaults
      settings = {
        goal: 'AddValue',
        tone: 'Professional',
        length: 'Short',
        style: 'direct',
        reasoning: 'Using defaults due to parsing error'
      };
    }

    // Validate settings
    const validGoals = ['AddValue', 'ShareExperience', 'AskQuestion', 'DifferentPerspective', 'BuildRelationship', 'SubtlePitch'];
    const validTones = ['Professional', 'Friendly', 'ThoughtProvoking', 'Supportive', 'Contrarian', 'Humorous'];
    const validLengths = ['Brief', 'Short', 'Mid', 'Long'];
    const validStyles = ['direct', 'structured', 'storyteller', 'challenger', 'supporter', 'expert', 'conversational'];

    if (!validGoals.includes(settings.goal)) settings.goal = 'AddValue';
    if (!validTones.includes(settings.tone)) settings.tone = 'Professional';
    if (!validLengths.includes(settings.length)) settings.length = 'Short';
    if (!validStyles.includes(settings.style)) settings.style = 'direct';

    return NextResponse.json({
      success: true,
      settings,
      model: result.model,
    });
  } catch (error: any) {
    console.error('Auto-decide comment error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
