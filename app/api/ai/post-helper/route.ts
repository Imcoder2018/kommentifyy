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
    const userWantsToModify = /^(fix|edit|update|improve|rewrite|make it|change|revise|modify|rephrase|shorten|longer|better|apply|use this|this is|the post|add.*emoji|remove.*emoji|add.*hashtag|remove.*hashtag|tone|more.*formal|more.*casual|professional|personal)/i.test(lastUserMessage);

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
- When user asks to "fix", "edit", "update", "improve", "rewrite" or similar, provide the modified post content
- Be specific about what changes you made (e.g., "I shortened your post from 300 to 200 characters", "I added 3 emojis to make it more engaging", "I changed the tone to be more professional")

${userWantsToModify && currentPost ? `IMPORTANT: The user wants to modify the post. At the end of your response, include the modified post in this format:

---MODIFIED_POST_START---
[Your improved version of the post here]
---MODIFIED_POST_END---

Also include a brief description of what changed:
---CHANGE_DESCRIPTION_START---
[Example: "Shortened by 100 characters, added 2 emojis"]
---CHANGE_DESCRIPTION_END---` : ''}

Keep responses concise, actionable, and conversational. Focus on practical suggestions.`;

    const result = await generateContent({
      model: selectedModel,
      systemPrompt,
      userPrompt: lastUserMessage,
      maxTokens: 2000,
      temperature: 0.8,
      userId: payload.userId,
      trackUsage: true
    });

    // Extract modified post if present
    let modifiedPost = null;
    let changeDescription = null;
    const modifiedMatch = result.content.match(/---MODIFIED_POST_START---\s*([\s\S]*?)\s*---MODIFIED_POST_END---/);
    const changeMatch = result.content.match(/---CHANGE_DESCRIPTION_START---\s*([\s\S]*?)\s*---CHANGE_DESCRIPTION_END---/);

    if (modifiedMatch) {
      modifiedPost = modifiedMatch[1].trim();
      // Remove the modified post section from the displayed response
      result.content = result.content.replace(/---MODIFIED_POST_START---[\s\S]*?---MODIFIED_POST_END---/g, '').trim();
    }

    if (changeMatch) {
      changeDescription = changeMatch[1].trim();
      // Remove the change description from the displayed response
      result.content = result.content.replace(/---CHANGE_DESCRIPTION_START---[\s\S]*?---CHANGE_DESCRIPTION_END---/g, '').trim();
    }

    // Generate change description if not provided
    if (modifiedPost && !changeDescription && currentPost) {
      const changes: string[] = [];
      if (modifiedPost.length < currentPost.length) {
        changes.push(`Shortened from ${currentPost.length} to ${modifiedPost.length} characters (${currentPost.length - modifiedPost.length} fewer)`);
      } else if (modifiedPost.length > currentPost.length) {
        changes.push(`Expanded from ${currentPost.length} to ${modifiedPost.length} characters (${modifiedPost.length - currentPost.length} more)`);
      }

      // Check for emoji changes
      const oldEmojiCount = (currentPost.match(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []).length;
      const newEmojiCount = (modifiedPost.match(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []).length;
      if (newEmojiCount > oldEmojiCount) {
        changes.push(`Added ${newEmojiCount - oldEmojiCount} emoji(s)`);
      } else if (newEmojiCount < oldEmojiCount) {
        changes.push(`Removed ${oldEmojiCount - newEmojiCount} emoji(s)`);
      }

      // Check for hashtag changes
      const oldHashtagCount = (currentPost.match(/#\w+/g) || []).length;
      const newHashtagCount = (modifiedPost.match(/#\w+/g) || []).length;
      if (newHashtagCount > oldHashtagCount) {
        changes.push(`Added ${newHashtagCount - oldHashtagCount} hashtag(s)`);
      } else if (newHashtagCount < oldHashtagCount) {
        changes.push(`Removed ${oldHashtagCount - newHashtagCount} hashtag(s)`);
      }

      changeDescription = changes.length > 0 ? changes.join(', ') : 'Post updated';
    }

    return NextResponse.json({
      success: true,
      response: result.content,
      modifiedPost,
      changeDescription,
      originalLength: currentPost?.length || 0,
      newLength: modifiedPost?.length || 0,
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
