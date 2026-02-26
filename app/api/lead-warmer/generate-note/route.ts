import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractToken } from '@/lib/auth';
import { generateContent, getUserModel } from '@/lib/ai-service';

function authUser(request: NextRequest) {
  const token = extractToken(request.headers.get('authorization'));
  if (!token) return null;
  try { return verifyToken(token); } catch { return null; }
}

const CONNECTION_NOTE_SYSTEM = `You write LinkedIn connection request notes that get accepted.
The note must reference a real interaction that already happened.`;

export async function POST(request: NextRequest) {
  try {
    const payload = authUser(request);
    if (!payload) return NextResponse.json({ success: false, error: 'Unauthorized', shouldReauth: true }, { status: 401 });

    const body = await request.json();
    const {
      prospectName = '',
      prospectRole = '',
      prospectCompany = '',
      priorEngagement = '',
      campaignGoal = 'relationship',
      businessContext = '',
      voiceProfile = '',
    } = body;

    const modelId = await getUserModel(payload.userId, 'comment');

    const userPrompt = `${voiceProfile ? `My Voice Profile: ${voiceProfile}\n` : ''}${businessContext ? `My business context: ${businessContext}\n` : ''}This person's name: ${prospectName}
This person's role / company: ${prospectRole}${prospectCompany ? ' at ' + prospectCompany : ''}
What we've already done: ${priorEngagement || 'Liked and commented on their recent posts'}
Campaign goal: ${campaignGoal}

Write a connection request note:
- Max 200 characters (LinkedIn's limit for notes)
- Reference the prior engagement specifically
- NO pitch, NO "I'd love to explore synergies"
- Sound like a human who actually paid attention
Output ONLY the note text. Nothing else.`;

    const result = await generateContent({
      model: modelId,
      systemPrompt: CONNECTION_NOTE_SYSTEM,
      userPrompt,
      maxTokens: 100,
      temperature: 0.8,
      userId: payload.userId,
      trackUsage: true,
    });

    let note = result.content.trim().replace(/^["']|["']$/g, '');
    if (note.length > 200) note = note.substring(0, 197) + '...';

    return NextResponse.json({
      success: true,
      note,
      model: result.model,
      usage: result.usage,
    });
  } catch (error: any) {
    console.error('Connection note generation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
