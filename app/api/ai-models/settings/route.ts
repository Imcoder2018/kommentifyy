import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken, extractToken } from '@/lib/auth';

const prisma = new PrismaClient();

// GET - Get user's AI model settings
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    const userId = payload.userId;

    const settings = await prisma.userAIModelSettings.findUnique({
      where: { userId }
    });

    return NextResponse.json({
      success: true,
      settings: settings || {
        postModelId: null,
        commentModelId: null,
        topicModelId: null,
        fallbackModelId: 'openai/gpt-4o-mini'
      }
    });
  } catch (error) {
    console.error('Error fetching AI model settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT - Update user's AI model settings
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    const userId = payload.userId;

    const data = await request.json();
    const { postModelId, commentModelId, topicModelId, postModelSettings, commentModelSettings, topicModelSettings } = data;

    // Verify that selected models are enabled
    const modelIds = [postModelId, commentModelId, topicModelId].filter(Boolean);
    if (modelIds.length > 0) {
      const enabledModels = await prisma.aIModel.findMany({
        where: {
          modelId: { in: modelIds },
          isEnabled: true
        }
      });

      const enabledModelIds = enabledModels.map(m => m.modelId);
      const invalidModels = modelIds.filter(id => !enabledModelIds.includes(id!));
      
      if (invalidModels.length > 0) {
        return NextResponse.json({
          error: `Models not available: ${invalidModels.join(', ')}`
        }, { status: 400 });
      }
    }

    const settings = await prisma.userAIModelSettings.upsert({
      where: { userId },
      create: {
        userId,
        postModelId: postModelId || null,
        commentModelId: commentModelId || null,
        topicModelId: topicModelId || null,
        postModelSettings: postModelSettings || '{}',
        commentModelSettings: commentModelSettings || '{}',
        topicModelSettings: topicModelSettings || '{}'
      },
      update: {
        postModelId: postModelId || null,
        commentModelId: commentModelId || null,
        topicModelId: topicModelId || null,
        postModelSettings: postModelSettings || '{}',
        commentModelSettings: commentModelSettings || '{}',
        topicModelSettings: topicModelSettings || '{}'
      }
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error updating AI model settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
