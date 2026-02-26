import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractToken } from '@/lib/auth';
import { generateContent, getUserModel } from '@/lib/ai-service';

function authUser(request: NextRequest) {
  const token = extractToken(request.headers.get('authorization'));
  if (!token) return null;
  try { return verifyToken(token); } catch { return null; }
}

const LEAD_WARMING_SYSTEM_PROMPT = `You are a LinkedIn relationship-building specialist.
Your goal is NOT to get likes or impressions.
Your ONLY goal is to make one specific person notice the commenter, feel respected, and want to engage back.
You must write comments that feel like they come from a real professional who actually read the post.
Never use generic praise. Never sound like AI. Never pitch.`;

export async function POST(request: NextRequest) {
  try {
    const payload = authUser(request);
    if (!payload) return NextResponse.json({ success: false, error: 'Unauthorized', shouldReauth: true }, { status: 401 });

    const body = await request.json();
    const {
      postText,
      touchNumber = 1,
      campaignGoal = 'relationship',
      businessContext = '',
      voiceProfile = '',
    } = body;

    if (!postText) return NextResponse.json({ success: false, error: 'Post text is required' }, { status: 400 });

    const modelId = await getUserModel(payload.userId, 'comment');

    let touchRules = '';
    if (touchNumber <= 1) {
      touchRules = `Touch #1 rules:
- Be short (2-3 lines), curious, no agenda. Just be human.
- Do NOT introduce yourself or your work.`;
    } else if (touchNumber === 2) {
      touchRules = `Touch #2 rules:
- Slightly longer (3-5 lines).
- Share a small related insight or experience from your own work.
- Still no pitching or self-promotion.`;
    } else {
      touchRules = `Touch #3+ rules:
- Can be deeper (5-8 lines).
- Introduce who you are organically, ask a relevant question, show expertise naturally.
- Still NO mention of your product, service, or pitch.`;
    }

    const userPrompt = `${voiceProfile ? `My Voice Profile: ${voiceProfile}\n` : ''}${businessContext ? `My business / expertise: ${businessContext}\n` : ''}The prospect's post: ${postText}
Touch number: ${touchNumber} (${touchNumber === 1 ? '1st' : touchNumber === 2 ? '2nd' : touchNumber + 'th'} time interacting with this person)
Campaign goal: ${campaignGoal}

Rules:
1. Start by referencing a SPECIFIC sentence, number, or idea from their post.
2. Add a genuine reaction (agreement, challenge, a related experience, a follow-up question).
${touchRules}
3. On NO touch should you mention your product, service, or pitch.
4. End with either nothing, or a genuine open question about THEIR experience.
${voiceProfile ? '5. Match the Voice Profile tone exactly.' : ''}
Output ONLY the comment text. No explanation, no quotes around it.`;

    const result = await generateContent({
      model: modelId,
      systemPrompt: LEAD_WARMING_SYSTEM_PROMPT,
      userPrompt,
      maxTokens: 500,
      temperature: 0.85,
      userId: payload.userId,
      trackUsage: true,
    });

    return NextResponse.json({
      success: true,
      comment: result.content.trim(),
      model: result.model,
      usage: result.usage,
    });
  } catch (error: any) {
    console.error('Lead warmer comment generation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
