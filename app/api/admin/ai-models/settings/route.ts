import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminAuth } from '@/lib/adminAuth';

// Get admin AI model settings - public for all authenticated users
async function handleGet(request: NextRequest) {
  try {
    // Just verify any valid token (user or admin)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let settings = await prisma.adminAIModelSettings.findFirst();

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.adminAIModelSettings.create({
        data: {
          postModelId: 'anthropic/claude-sonnet-4.5',
          hookModelId: 'anthropic/claude-sonnet-4.5',
          commentModelId: 'anthropic/claude-sonnet-4.5',
          topicModelId: 'anthropic/claude-sonnet-4.5',
          chatbotModelId: 'gpt-4o',
          trendingModelId: 'anthropic/claude-sonnet-4.5',
          fallbackModelId: 'anthropic/claude-sonnet-4.5',
          allowUserModelSelection: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      settings: {
        postModelId: settings.postModelId,
        hookModelId: settings.hookModelId,
        commentModelId: settings.commentModelId,
        topicModelId: settings.topicModelId,
        chatbotModelId: settings.chatbotModelId,
        trendingModelId: settings.trendingModelId,
        fallbackModelId: settings.fallbackModelId,
        allowUserModelSelection: settings.allowUserModelSelection,
      },
    });
  } catch (error: any) {
    console.error('Get admin AI model settings error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update admin AI model settings
async function handlePut(request: NextRequest) {
  try {
    // Verify admin auth
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const {
      postModelId,
      hookModelId,
      commentModelId,
      topicModelId,
      chatbotModelId,
      trendingModelId,
      fallbackModelId,
      allowUserModelSelection
    } = data;

    // Build update data - only include provided fields
    const updateData: any = {};
    if (typeof postModelId === 'string' && postModelId) {
      updateData.postModelId = postModelId;
    }
    if (typeof hookModelId === 'string' && hookModelId) {
      updateData.hookModelId = hookModelId;
    }
    if (typeof commentModelId === 'string' && commentModelId) {
      updateData.commentModelId = commentModelId;
    }
    if (typeof topicModelId === 'string' && topicModelId) {
      updateData.topicModelId = topicModelId;
    }
    if (typeof chatbotModelId === 'string' && chatbotModelId) {
      updateData.chatbotModelId = chatbotModelId;
    }
    if (typeof trendingModelId === 'string' && trendingModelId) {
      updateData.trendingModelId = trendingModelId;
    }
    if (typeof fallbackModelId === 'string' && fallbackModelId) {
      updateData.fallbackModelId = fallbackModelId;
    }
    if (typeof allowUserModelSelection === 'boolean') {
      updateData.allowUserModelSelection = allowUserModelSelection;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid settings provided' },
        { status: 400 }
      );
    }

    let settings = await prisma.adminAIModelSettings.findFirst();

    if (!settings) {
      settings = await prisma.adminAIModelSettings.create({
        data: {
          postModelId: postModelId || 'anthropic/claude-sonnet-4.5',
          hookModelId: hookModelId || 'anthropic/claude-sonnet-4.5',
          commentModelId: commentModelId || 'anthropic/claude-sonnet-4.5',
          topicModelId: topicModelId || 'anthropic/claude-sonnet-4.5',
          chatbotModelId: chatbotModelId || 'gpt-4o',
          trendingModelId: trendingModelId || 'anthropic/claude-sonnet-4.5',
          fallbackModelId: fallbackModelId || 'anthropic/claude-sonnet-4.5',
          allowUserModelSelection: allowUserModelSelection ?? false,
        },
      });
    } else {
      settings = await prisma.adminAIModelSettings.update({
        where: { id: settings.id },
        data: updateData,
      });
    }

    return NextResponse.json({
      success: true,
      settings: {
        postModelId: settings.postModelId,
        hookModelId: settings.hookModelId,
        commentModelId: settings.commentModelId,
        topicModelId: settings.topicModelId,
        chatbotModelId: settings.chatbotModelId,
        trendingModelId: settings.trendingModelId,
        fallbackModelId: settings.fallbackModelId,
        allowUserModelSelection: settings.allowUserModelSelection,
      },
    });
  } catch (error: any) {
    console.error('Update admin AI model settings error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleGet(request);
}

export async function PUT(request: NextRequest) {
  return handlePut(request);
}
