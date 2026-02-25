import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractToken } from '@/lib/auth';
import { generateContent, getUserModel } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    const { topic, voiceProfile, goal, model: requestedModel } = await request.json();

    if (!topic?.trim()) {
      return NextResponse.json({ success: false, error: 'Topic is required' }, { status: 400 });
    }

    const selectedModel = requestedModel || await getUserModel(payload.userId, 'post');

    const hookPrompt = `You are a LinkedIn hook generator.
Your only job is to create scroll-stopping first lines for LinkedIn posts.
The first 130 characters must create curiosity and tension, not give away the whole value.

Voice Profile: ${voiceProfile || 'Professional, engaging, authentic'}
Topic / idea: ${topic}
Goal: ${goal || 'Maximize engagement and curiosity'}

Generate 10 hook options, evenly split across these categories:

1-2. Thought-provoking question
3-4. Surprising or bold statement
5-6. Personal anecdote opener
7-8. Counterintuitive insight
9-10. "Mistake I made" teaser

Rules:
- Max 130 characters per hook.
- No buzzwords like "game-changer", "unlock", "resonate", "deep dive".
- No generic "In today's world…" garbage.
- Each hook must match the Voice Profile style.
- Each hook should stand alone and make sense.

Output ONLY as a JSON array of objects with this structure:
[
  {"category": "question", "text": "hook text here"},
  {"category": "bold_statement", "text": "hook text here"},
  ...
]

Categories to use: "question", "bold_statement", "anecdote", "counterintuitive", "mistake"`;

    const result = await generateContent({
      model: selectedModel,
      systemPrompt: 'You are an expert at writing viral LinkedIn hooks. Output only valid JSON.',
      userPrompt: hookPrompt,
      maxTokens: 2000,
      temperature: 0.9,
      userId: payload.userId,
      trackUsage: true
    });

    let hooks;
    try {
      // Try to parse JSON from the response
      const jsonMatch = result.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        hooks = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback parsing if not proper JSON
        hooks = result.content.split('\n')
          .filter(line => line.trim() && !line.startsWith('#') && !line.startsWith('```'))
          .slice(0, 10)
          .map((line, i) => {
            const categories = ['question', 'bold_statement', 'anecdote', 'counterintuitive', 'mistake'];
            const text = line.replace(/^\d+[\.\)]\s*/, '').replace(/^["\-\*]\s*/, '').replace(/["\s]*$/, '');
            return {
              category: categories[Math.floor(i / 2)] || 'question',
              text
            };
          });
      }
    } catch (parseErr) {
      console.error('Failed to parse hooks JSON:', parseErr);
      // Fallback: split by lines
      hooks = result.content.split('\n')
        .filter(line => line.trim() && line.length > 10)
        .slice(0, 10)
        .map((line, i) => ({
          category: i < 2 ? 'question' : i < 4 ? 'bold_statement' : i < 6 ? 'anecdote' : i < 8 ? 'counterintuitive' : 'mistake',
          text: line.replace(/^\d+[\.\)]\s*/, '').trim()
        }));
    }

    return NextResponse.json({
      success: true,
      hooks,
      model: selectedModel
    });

  } catch (error: any) {
    console.error('Generate hooks error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
