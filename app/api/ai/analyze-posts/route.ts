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
  console.error('Failed to initialize OpenAI for analysis:', error);
}

export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const payload = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { plan: true },
    });
    if (!user || !user.plan) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const { allPosts, aiPostIndices } = await request.json();

    if (!allPosts || allPosts.length === 0) {
      return NextResponse.json({ success: false, error: 'No posts provided' }, { status: 400 });
    }

    if (!openai) {
      return NextResponse.json({ success: false, error: 'OpenAI not configured' }, { status: 500 });
    }

    // Build posts list WITHOUT revealing which are AI-generated
    const postsForAnalysis = allPosts.map((p: any, i: number) =>
      `POST ${i + 1}:\n${(p.content || p.postContent || '').substring(0, 1000)}`
    ).join('\n\n---\n\n');

    const systemPrompt = `You are a brutally honest LinkedIn content analyst and viral content expert. You have analyzed over 50,000 LinkedIn posts and can predict virality with high accuracy. You do NOT sugarcoat. You give real, actionable feedback.`;

    const userPrompt = `I have ${allPosts.length} LinkedIn posts. I need you to rank them by viral potential and give brutal honest feedback.

Here are the posts:

${postsForAnalysis}

For EACH post, provide:
1. A virality score from 1-100
2. A brutal honest feedback in 1-2 sentences (be REAL, don't be nice if the post is weak)
3. Why it would or wouldn't go viral

Return your response in this EXACT JSON format (no markdown, no code blocks, just raw JSON):
[
  {"postIndex": 1, "score": 85, "feedback": "Your brutal feedback here", "viralReason": "Why it would/wouldn't go viral"},
  {"postIndex": 2, "score": 72, "feedback": "Your brutal feedback here", "viralReason": "Why it would/wouldn't go viral"}
]

Sort by score DESCENDING (highest score first). Be brutally honest - if a post is generic corporate garbage, say so.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    let responseText = completion.choices[0].message.content || '';
    responseText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    let analysis;
    try {
      analysis = JSON.parse(responseText);
    } catch {
      const match = responseText.match(/\[[\s\S]*\]/);
      if (match) {
        analysis = JSON.parse(match[0]);
      } else {
        return NextResponse.json({ success: false, error: 'Failed to parse AI analysis' }, { status: 500 });
      }
    }

    // Add isAiGenerated flag to each result based on the indices the client sent
    const enrichedAnalysis = analysis.map((item: any) => ({
      ...item,
      isAiGenerated: (aiPostIndices || []).includes(item.postIndex - 1),
    }));

    return NextResponse.json({
      success: true,
      analysis: enrichedAnalysis,
    });
  } catch (error: any) {
    console.error('Analyze posts error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
