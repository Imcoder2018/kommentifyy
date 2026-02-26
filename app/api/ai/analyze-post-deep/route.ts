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
    const { postContent, authorHeadline, model } = await request.json();

    if (!postContent || postContent.trim().length < 20) {
      return NextResponse.json({ success: false, error: 'Post content too short to analyze' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { plan: true },
    });

    if (!user || !user.plan) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const selectedModel = model || 'gpt-4o';

    const systemPrompt = `You are a LinkedIn post analyst and algorithm researcher. You provide HONEST, critical, data-driven feedback. Never sugarcoat. Your analysis is built on current Q1 2026 LinkedIn algorithm research. Return ONLY valid JSON.`;

    const userPrompt = `Analyze this LinkedIn post against the Q1 2026 LinkedIn algorithm. Be BRUTALLY HONEST.

POST TO ANALYZE:
${postContent}

${authorHeadline ? `AUTHOR: ${authorHeadline}` : ''}

EVALUATE THESE 4 METRICS (0-100 each) WITH SPECIFIC REASONING:

1. HUMAN SCORE (Does this sound like a real person wrote it?)
   - Check for: AI-typical phrases, natural voice, personal details, varied sentence length
   - Red flags: "game-changer", "leverage", "navigate", "landscape", em dashes, generic statements, perfect grammar throughout
   - Green flags: Contractions, specific names/numbers/dates, verbal tics ("honestly", "look", "here's the thing"), first-person stories, sentence length variety
   - Score 90+ ONLY if it genuinely reads like someone typed it on their phone

2. PERFORMANCE STRENGTH (Hook + Body + CTA quality)
   - Hook (40%): Does the first line force a "see more" click? 4-8 words, pattern interrupt, curiosity gap?
   - Body (40%): Specific details (numbers, names, dates)? Save-worthy frameworks/checklists? Short paragraphs?
   - CTA (20%): Thought-provoking question requiring 15+ word response? (Not "Agree?" or "Thoughts?")
   - Score 90+ ONLY if all three are strong

3. REACH POTENTIAL (Algorithm alignment)
   - Dwell time: Does content reward reading to the end? Progressive revelation of value?
   - Save-worthy: Contains frameworks, checklists, or insights people bookmark?
   - Comment quality: Will this generate meaningful (not generic) responses?
   - No external links in body? No engagement bait? Optimal length (800-1500 chars)?
   - Score 90+ ONLY if algorithmically optimized

4. AI PATTERN RISK (LinkedIn AI detector flags - LOWER is better)
   - Count banned AI words: game-changer, unlock, leverage, navigate, landscape, resonate, deep dive, synergy, utilize, delve, harness, foster, spearhead
   - Check: em dashes, uniform sentence length, lack of personal details, generic statements
   - Score 0-20 = safe, 21-50 = moderate risk, 51+ = high risk
   - Score below 20 ONLY if genuinely human-sounding

Return ONLY this JSON (no markdown, no explanation outside JSON):
{
  "humanScore": { "score": 0, "reasoning": "specific explanation" },
  "performanceStrength": { "score": 0, "reasoning": "specific explanation" },
  "reachPotential": { "score": 0, "reasoning": "specific explanation" },
  "aiPatternRisk": { "score": 0, "reasoning": "specific explanation" },
  "topImprovements": ["specific improvement 1", "specific improvement 2", "specific improvement 3"],
  "overallVerdict": "One sentence honest summary"
}`;

    const result = await generateContent({
      model: selectedModel,
      systemPrompt,
      userPrompt,
      maxTokens: 1000,
      temperature: 0.3,
      userId: user.id,
      trackUsage: false
    });

    let analysis;
    try {
      // Extract JSON from response (handle markdown code blocks)
      let jsonStr = result.content.trim();
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      analysis = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.error('Failed to parse analysis JSON:', result.content);
      return NextResponse.json({ success: false, error: 'AI returned invalid analysis format' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      analysis,
      model: result.model,
    });
  } catch (error: any) {
    console.error('Analyze post deep error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
