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
    const { messages, currentPost, model: requestedModel } = await request.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json({ success: false, error: 'Messages required' }, { status: 400 });
    }

    const selectedModel = requestedModel || await getUserModel(payload.userId, 'post');

    const lastUserMessage = messages[messages.length - 1]?.content || '';

    // Build context-aware prompt
    const systemPrompt = `You are an AI assistant helping users write better LinkedIn posts.

Current post context:
${currentPost ? `---\n${currentPost}\n---` : '(No post content yet)'}

Your role:
- Help brainstorm ideas and topics
- Suggest improvements to hooks and content
- Provide formatting suggestions
- Offer tone and style advice
- Generate alternative phrasings
- Answer questions about LinkedIn best practices

Keep responses concise, actionable, and conversational. Focus on practical suggestions.`;

    const result = await generateContent({
      model: selectedModel,
      systemPrompt,
      userPrompt: lastUserMessage,
      maxTokens: 1500,
      temperature: 0.8,
      userId: payload.userId,
      trackUsage: true
    });

    return NextResponse.json({
      success: true,
      response: result.content,
      model: selectedModel
    });

  } catch (error: any) {
    console.error('Post helper error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
