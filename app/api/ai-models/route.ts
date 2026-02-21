import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken, extractToken } from '@/lib/auth';

const prisma = new PrismaClient();

// GET - List enabled AI models for users
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    const userId = payload.userId;

    // Get only enabled models that admin has approved
    const models = await prisma.aIModel.findMany({
      where: { isEnabled: true },
      orderBy: [
        { isFeatured: 'desc' },
        { writingScore: 'desc' },
        { name: 'asc' }
      ],
      select: {
        modelId: true,
        name: true,
        provider: true,
        inputCostPer1M: true,
        outputCostPer1M: true,
        maxContextTokens: true,
        maxOutputTokens: true,
        reasoningScore: true,
        writingScore: true,
        codingScore: true,
        speedScore: true,
        category: true,
        isReasoningModel: true,
        isMultimodal: true,
        isFeatured: true,
        description: true
      }
    });

    // Get user's current model settings
    const userSettings = await prisma.userAIModelSettings.findUnique({
      where: { userId }
    });

    return NextResponse.json({
      success: true,
      models,
      userSettings: userSettings || {
        postModelId: null,
        commentModelId: null,
        topicModelId: null,
        fallbackModelId: 'openai/gpt-4o-mini'
      }
    });
  } catch (error) {
    console.error('Error fetching AI models:', error);
    return NextResponse.json({ error: 'Failed to fetch AI models' }, { status: 500 });
  }
}
