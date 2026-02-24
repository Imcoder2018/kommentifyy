import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// import { requireAdmin } from '@/lib/adminAuth';

// Get global settings (admin only)
async function handleGet(request: NextRequest) {
  try {
    let settings = await prisma.globalSettings.findFirst();

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.globalSettings.create({
        data: {
          aiCommentsPerDollar: 100,
          postEmbeddingsCount: 8,
          commentEmbeddingsCount: 5,
          profileStyleMode: true,
        } as any,
      });
    }

    return NextResponse.json({
      success: true,
      settings: {
        aiCommentsPerDollar: settings.aiCommentsPerDollar,
        postEmbeddingsCount: (settings as any).postEmbeddingsCount ?? 8,
        commentEmbeddingsCount: (settings as any).commentEmbeddingsCount ?? 5,
        profileStyleMode: (settings as any).profileStyleMode ?? true,
      },
    });
  } catch (error: any) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update global settings (admin only)
async function handlePut(request: NextRequest) {
  try {
    const data = await request.json();
    const { aiCommentsPerDollar, postEmbeddingsCount, commentEmbeddingsCount, profileStyleMode } = data;

    // Build update data - only include provided fields
    const updateData: any = {};
    if (typeof aiCommentsPerDollar === 'number' && aiCommentsPerDollar >= 1) {
      updateData.aiCommentsPerDollar = aiCommentsPerDollar;
    }
    if (typeof postEmbeddingsCount === 'number' && postEmbeddingsCount >= 1 && postEmbeddingsCount <= 20) {
      updateData.postEmbeddingsCount = postEmbeddingsCount;
    }
    if (typeof commentEmbeddingsCount === 'number' && commentEmbeddingsCount >= 1 && commentEmbeddingsCount <= 20) {
      updateData.commentEmbeddingsCount = commentEmbeddingsCount;
    }
    if (typeof profileStyleMode === 'boolean') {
      updateData.profileStyleMode = profileStyleMode;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid settings provided' },
        { status: 400 }
      );
    }

    let settings = await prisma.globalSettings.findFirst();

    if (!settings) {
      settings = await prisma.globalSettings.create({
        data: { aiCommentsPerDollar: 100, ...updateData },
      });
    } else {
      settings = await prisma.globalSettings.update({
        where: { id: settings.id },
        data: updateData,
      });
    }

    return NextResponse.json({
      success: true,
      settings: {
        aiCommentsPerDollar: settings.aiCommentsPerDollar,
        postEmbeddingsCount: (settings as any).postEmbeddingsCount ?? 8,
        commentEmbeddingsCount: (settings as any).commentEmbeddingsCount ?? 5,
        profileStyleMode: (settings as any).profileStyleMode ?? true,
      },
    });
  } catch (error: any) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Temporarily export without admin requirement for testing
export async function GET(request: NextRequest) {
  return handleGet(request);
}

export async function PUT(request: NextRequest) {
  return handlePut(request);
}

// Re-enable admin auth when done:
// export const GET = requireAdmin(handleGet);
// export const PUT = requireAdmin(handlePut);
