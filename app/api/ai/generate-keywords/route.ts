import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { verifyToken } from '../../../../lib/auth';

const openai = new OpenAI({
  apiKey: (process.env.OPENAI_API_KEY || '').trim(),
});

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { intent, keywordCount = 15 } = body;

    if (!intent || typeof intent !== 'string') {
      return NextResponse.json(
        { error: 'Intent/niche description is required' },
        { status: 400 }
      );
    }

    // Create structured prompt for keyword generation
    const prompt = `You are a LinkedIn marketing expert. Generate exactly ${keywordCount} highly relevant keywords for LinkedIn content discovery based on this intent:

"${intent}"

Requirements:
- Keywords should be specific to LinkedIn professional content
- Mix of broad and niche terms
- Include industry-specific terminology
- Focus on engagement-driving keywords
- Avoid overly generic terms
- Each keyword should be 1-4 words maximum

Return ONLY a valid JSON object with this exact structure, no additional text:
{"keywords": ["keyword1", "keyword2", "keyword3"]}`;

    console.log('GENERATE-KEYWORDS: Generating keywords for intent:', intent.substring(0, 50));

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'You are a LinkedIn marketing expert. You MUST respond with ONLY valid JSON, no markdown, no code blocks, no explanations.' 
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = completion.choices[0]?.message?.content || '';
    console.log('GENERATE-KEYWORDS: Raw response:', content.substring(0, 200));

    // Clean up response - remove markdown code blocks if present
    let cleanContent = content.trim();
    cleanContent = cleanContent.replace(/```json\s*/gi, '').replace(/```\s*/gi, '');
    cleanContent = cleanContent.trim();

    // Try to parse as JSON
    try {
      const result = JSON.parse(cleanContent);
      if (result.keywords && Array.isArray(result.keywords)) {
        console.log('GENERATE-KEYWORDS: Successfully generated', result.keywords.length, 'keywords');
        return NextResponse.json({
          success: true,
          keywords: result.keywords.slice(0, keywordCount),
        });
      }
    } catch (parseError) {
      console.log('GENERATE-KEYWORDS: JSON parse failed, trying extraction');
    }

    // Fallback: Extract keywords from response using regex
    const arrayMatch = cleanContent.match(/\[([\s\S]*?)\]/);
    if (arrayMatch) {
      const keywords = arrayMatch[1]
        .split(',')
        .map((k: string) => k.trim().replace(/^["']|["']$/g, ''))
        .filter((k: string) => k.length > 0 && k.length < 50);
      
      if (keywords.length > 0) {
        console.log('GENERATE-KEYWORDS: Extracted', keywords.length, 'keywords via regex');
        return NextResponse.json({
          success: true,
          keywords: keywords.slice(0, keywordCount),
        });
      }
    }

    // Last resort: return raw content for client-side parsing
    return NextResponse.json({
      success: true,
      keywords: [],
      rawContent: cleanContent,
    });

  } catch (error: any) {
    console.error('GENERATE-KEYWORDS: Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate keywords' },
      { status: 500 }
    );
  }
}
