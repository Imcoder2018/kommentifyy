import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminAuth } from '@/lib/adminAuth';

// GET - List all AI models with filtering
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const provider = searchParams.get('provider');
    const enabled = searchParams.get('enabled');
    const featured = searchParams.get('featured');

    const where: any = {};
    if (category) where.category = category;
    if (provider) where.provider = provider;
    if (enabled !== null) where.isEnabled = enabled === 'true';
    if (featured !== null) where.isFeatured = featured === 'true';

    const models = await prisma.aIModel.findMany({
      where,
      orderBy: [
        { isFeatured: 'desc' },
        { category: 'asc' },
        { writingScore: 'desc' },
        { name: 'asc' }
      ]
    });

    // Get stats
    const stats = await prisma.aIModel.aggregate({
      _count: { id: true },
      where: { isEnabled: true }
    });

    const categoryStats = await prisma.aIModel.groupBy({
      by: ['category'],
      _count: { id: true }
    });

    const providerStats = await prisma.aIModel.groupBy({
      by: ['provider'],
      _count: { id: true }
    });

    return NextResponse.json({
      success: true,
      models,
      stats: {
        total: stats._count.id,
        byCategory: categoryStats.reduce((acc, s) => ({ ...acc, [s.category]: s._count.id }), {}),
        byProvider: providerStats.reduce((acc, s) => ({ ...acc, [s.provider]: s._count.id }), {})
      }
    });
  } catch (error) {
    console.error('Error fetching AI models:', error);
    return NextResponse.json({ error: 'Failed to fetch AI models' }, { status: 500 });
  }
}

// POST - Create new AI model
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    const model = await prisma.aIModel.create({
      data: {
        modelId: data.modelId,
        name: data.name,
        provider: data.provider,
        apiSource: data.apiSource || 'openrouter',
        inputCostPer1M: data.inputCostPer1M || 0,
        outputCostPer1M: data.outputCostPer1M || 0,
        maxContextTokens: data.maxContextTokens || 4096,
        maxOutputTokens: data.maxOutputTokens || 4096,
        supportsSystemPrompt: data.supportsSystemPrompt ?? true,
        supportsVision: data.supportsVision ?? false,
        supportsTools: data.supportsTools ?? false,
        supportsStreaming: data.supportsStreaming ?? true,
        reasoningScore: data.reasoningScore || 5,
        writingScore: data.writingScore || 5,
        codingScore: data.codingScore || 5,
        speedScore: data.speedScore || 5,
        category: data.category || 'standard',
        isReasoningModel: data.isReasoningModel ?? false,
        isMultimodal: data.isMultimodal ?? false,
        isEnabled: data.isEnabled ?? true,
        isFeatured: data.isFeatured ?? false,
        description: data.description || null,
        releaseDate: data.releaseDate ? new Date(data.releaseDate) : null
      }
    });

    return NextResponse.json({ success: true, model });
  } catch (error) {
    console.error('Error creating AI model:', error);
    return NextResponse.json({ error: 'Failed to create AI model' }, { status: 500 });
  }
}

// PUT - Update AI model (toggle enable/disable, featured, etc.)
export async function PUT(request: NextRequest) {
  try {
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { modelId, ...updates } = data;

    if (!modelId) {
      return NextResponse.json({ error: 'Model ID required' }, { status: 400 });
    }

    const model = await prisma.aIModel.update({
      where: { modelId },
      data: {
        ...updates,
        lastUpdated: new Date()
      }
    });

    return NextResponse.json({ success: true, model });
  } catch (error) {
    console.error('Error updating AI model:', error);
    return NextResponse.json({ error: 'Failed to update AI model' }, { status: 500 });
  }
}

// DELETE - Remove AI model
export async function DELETE(request: NextRequest) {
  try {
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const modelId = searchParams.get('modelId');

    if (!modelId) {
      return NextResponse.json({ error: 'Model ID required' }, { status: 400 });
    }

    await prisma.aIModel.delete({
      where: { modelId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting AI model:', error);
    return NextResponse.json({ error: 'Failed to delete AI model' }, { status: 500 });
  }
}
