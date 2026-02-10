import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';
import { limitService } from '@/lib/limit-service';
import OpenAI from 'openai';
import { formatForLinkedIn } from '@/lib/linkedin-formatter';

let openai: OpenAI | null = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY.trim() });
  }
} catch (error) {
  console.error('Failed to initialize OpenAI for trending:', error);
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

    const limitCheck = await limitService.checkLimit(user.id, 'aiPosts');
    if (!limitCheck.allowed) {
      return NextResponse.json({ success: false, error: 'Daily AI post limit reached' }, { status: 429 });
    }

    const { trendingPosts, customPrompt, includeHashtags, language } = await request.json();

    if (!trendingPosts || trendingPosts.length === 0) {
      return NextResponse.json({ success: false, error: 'No trending posts provided' }, { status: 400 });
    }

    if (!openai) {
      return NextResponse.json({ success: false, error: 'OpenAI not configured' }, { status: 500 });
    }

    // Build the trending posts context
    const postsContext = trendingPosts.slice(0, 10).map((p: any, i: number) => 
      `POST ${i + 1} (${p.likes || 0} likes, ${p.comments || 0} comments):\n${(p.postContent || '').substring(0, 800)}`
    ).join('\n\n---\n\n');

    const customInstruction = customPrompt ? `\n\nADDITIONAL USER INSTRUCTION: ${customPrompt}` : '';

    const systemPrompt = `You are an elite LinkedIn ghostwriter who has studied thousands of viral posts. Your job is to analyze trending posts and create NEW posts that will go viral.

RULES:
- Write like a REAL human, not AI. No corporate jargon. No fluff.
- Use pattern interrupts, bold opening hooks, and emotional storytelling
- Keep sentences short. Use line breaks liberally. White space is your friend.
- Include a strong call-to-action or thought-provoking question at the end
- ${includeHashtags ? 'Include 3-5 relevant hashtags at the END of each post, separated by spaces' : 'NO hashtags at all. Do not include any # symbols.'}
- NO emojis overload (1-2 max per post)
- Each post MUST be unique in angle, structure, and voice
- Study the PATTERNS in the trending posts: what hooks work, what structures get engagement, what topics resonate
- Then create something BETTER and MORE AUTHENTIC than what's trending
- CRITICAL: Do NOT use any markdown formatting. No ** for bold, no * for italic, no # for headers, no _ for underline. LinkedIn does not support markdown.
- Instead of bold markers, use UPPERCASE for emphasis or just write naturally without any special formatting characters.
- Never output asterisks (*) around words. Write plain text only.`;

    const userPrompt = `Here are ${trendingPosts.length} currently trending LinkedIn posts with high engagement:

${postsContext}

Based on the patterns, hooks, structures, and topics you see in these trending posts, generate EXACTLY 3 new LinkedIn posts that would go viral.

Each post should:
1. Use a different angle/perspective than the others
2. Have a killer opening hook (first line must stop the scroll)
3. Feel genuinely human and authentic - not AI-generated
4. Be 150-400 words
5. Include natural engagement triggers (questions, controversial takes, relatable stories)
${language ? `6. CRITICAL: Write the ENTIRE post in ${language}. Every word must be in ${language}.` : ''}

${customInstruction}

Return your response in this EXACT JSON format (no markdown, no code blocks, just raw JSON):
[
  {"title": "Brief descriptive title", "content": "Full post content here"},
  {"title": "Brief descriptive title", "content": "Full post content here"},
  {"title": "Brief descriptive title", "content": "Full post content here"}
]`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.9,
      max_tokens: 4000,
    });

    let responseText = completion.choices[0].message.content || '';
    
    // Clean up response - extract JSON
    responseText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    
    let generatedPosts;
    try {
      generatedPosts = JSON.parse(responseText);
    } catch {
      // Try to find JSON array in response
      const match = responseText.match(/\[[\s\S]*\]/);
      if (match) {
        generatedPosts = JSON.parse(match[0]);
      } else {
        return NextResponse.json({ success: false, error: 'Failed to parse AI response' }, { status: 500 });
      }
    }

    // Format each post's content for LinkedIn (convert any remaining markdown to Unicode bold, clean up)
    if (Array.isArray(generatedPosts)) {
      generatedPosts = generatedPosts.map((post: any) => ({
        ...post,
        content: formatForLinkedIn(post.content || ''),
      }));
    }

    await limitService.incrementUsage(user.id, 'aiPosts');

    return NextResponse.json({
      success: true,
      posts: generatedPosts,
    });
  } catch (error: any) {
    console.error('Generate trending error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
