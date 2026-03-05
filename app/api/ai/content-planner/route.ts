import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

let openai: OpenAI | null = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY.trim() });
  }
} catch (e) {}

const FALLBACK_TOPICS = [
  'How I went from 0 to 10K followers by sharing what nobody else dared to post',
  'The mistake 90% of professionals make when building their LinkedIn personal brand',
  'I studied 100 top LinkedIn creators for 6 months — here is what actually works',
  'Why your LinkedIn posts get zero engagement (and the exact fix I applied)',
  'The uncomfortable truth about career success nobody tells you until it is too late',
  'How I close high-ticket clients using only organic LinkedIn content — no DM spam',
  'Stop following conventional career advice. Here is what actually works in 2025',
  'The 5-minute LinkedIn daily routine that generates leads while I sleep',
  'What happened when I posted every single day for 30 days on LinkedIn',
  'Why most professionals stay stuck in mediocre positions and how to escape it',
  'The LinkedIn strategy that 10x my inbound in 90 days without paid ads',
  'Lessons from my biggest professional failure that completely changed how I work',
  'The three questions I ask every successful person I meet — and what I learned',
  'I said no to a 6-figure job offer. Here is why it was the best decision I made',
  'How to get promoted faster than your peers without playing office politics',
  'The real reason most people never achieve their professional goals',
  'What 10 years in this industry taught me that no course ever will',
  'How to build genuine authority on LinkedIn without faking expertise',
  'The counterintuitive approach to networking that actually builds real relationships',
  'Why busy professionals stay broke while relaxed ones build wealth',
  'How I restructured my mornings and tripled my output in 60 days',
  'The one mindset shift that changed every conversation I have with clients',
  'Why I stopped optimizing my LinkedIn profile and what I did instead',
  'The brutal truth about what separates top 1% earners from everyone else',
  'How to turn your expertise into a waiting list of high-paying clients',
  'What I wish I knew at 25 about building a career that actually matters',
  'The underrated skill that will make you irreplaceable in any organization',
  'How to negotiate your salary without feeling awkward or desperate',
  'Why most entrepreneurs fail in year two and exactly how to survive it',
  'The daily habit that separates high performers from high-potential professionals',
  'How I built a personal brand that attracts opportunities instead of chasing them',
  'The LinkedIn post format that generates 10x more comments than anything else',
  'Why your expertise alone will never be enough to advance your career',
  'How to stop overthinking and start creating content that actually resonates',
  'The truth about work-life balance that every professional needs to hear',
  'What clients really care about (hint: it is not your credentials or experience)',
  'How to position yourself as the obvious choice in a crowded market',
  'The simple framework I use to turn any idea into a viral LinkedIn post',
  'Why the smartest people in the room are often the last ones to get promoted',
  'How to build a business around your expertise without burning out in 6 months',
];

export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    const { mode, userContext, profileData } = await request.json();

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { plan: true },
    });

    if (!user || !user.plan) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    if (!(user.plan as any).allowAiPostGeneration) {
      return NextResponse.json({ success: false, error: 'AI post generation not available in your plan' }, { status: 403 });
    }

    const topicCount = mode === '30days' ? 40 : mode === '20days' ? 20 : 5;

    let profileContext = '';
    if (profileData) {
      const skills = Array.isArray(profileData.skills) ? profileData.skills.slice(0, 10).join(', ') : '';
      const experience = Array.isArray(profileData.experience) ? profileData.experience.slice(0, 3).join('; ') : '';
      const recentPosts = Array.isArray(profileData.posts)
        ? profileData.posts.slice(0, 2).map((p: any) => (typeof p === 'string' ? p : p.content || '')).join('\n---\n').substring(0, 600)
        : '';
      profileContext = `
LinkedIn Profile:
- Name: ${profileData.name || ''}
- Headline: ${profileData.headline || ''}
- About: ${(profileData.about || '').substring(0, 500)}
- Key Skills: ${skills}
- Experience: ${experience}
${recentPosts ? `\nRecent posts (voice/style reference):\n${recentPosts}` : ''}`;
    }

    if (!openai) {
      return NextResponse.json({ success: true, topics: FALLBACK_TOPICS.slice(0, topicCount), fallback: true });
    }

    const prompt = `You are an elite LinkedIn content strategist. Generate ${topicCount} highly specific, viral-potential LinkedIn post topics for a ${mode === '30days' ? '30-day' : mode === '20days' ? '20-day' : '5-day'} content calendar.
${profileContext}
${userContext ? `\nUser's Goals & Context:\n${userContext}` : ''}

Requirements:
- Each topic = a specific compelling hook/angle (not just a subject area)
- Vary types: personal story, contrarian take, how-to, lessons, case study, mistake, prediction, industry insight
- Authentic to the user's expertise and background
- Scroll-stopping and engagement-worthy, 10-20 words each
- Order from highest viral potential to lowest
- Return ONLY numbered topics, one per line, no extra text

Generate ${topicCount} topics:`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an elite LinkedIn content strategist specializing in viral authentic content.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.9,
      max_tokens: 2500,
    });

    const raw = completion.choices[0].message.content || '';
    const topics = raw
      .split('\n')
      .filter(l => l.trim())
      .map(l => l.replace(/^\d+[\.\)]\s*/, '').replace(/^\*+\s*/, '').trim())
      .filter(l => l.length > 10)
      .slice(0, topicCount);

    return NextResponse.json({ success: true, topics });
  } catch (error: any) {
    console.error('Content planner error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
