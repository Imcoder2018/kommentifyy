import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

// Get global settings (admin only)
async function handleGet(request: NextRequest) {
  try {
    let settings = await prisma.globalSettings.findFirst();

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.globalSettings.create({
        data: {
          aiCommentsPerDollar: 100,
        },
      });
    }

    return NextResponse.json({
      success: true,
      settings: {
        aiCommentsPerDollar: settings.aiCommentsPerDollar,
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
    const { aiCommentsPerDollar } = data;

    if (typeof aiCommentsPerDollar !== 'number' || aiCommentsPerDollar < 1) {
      return NextResponse.json(
        { success: false, error: 'AI comments per dollar must be a positive number' },
        { status: 400 }
      );
    }

    let settings = await prisma.globalSettings.findFirst();

    if (!settings) {
      settings = await prisma.globalSettings.create({
        data: {
          aiCommentsPerDollar,
        },
      });
    } else {
      settings = await prisma.globalSettings.update({
        where: { id: settings.id },
        data: {
          aiCommentsPerDollar,
        },
      });
    }

    return NextResponse.json({
      success: true,
      settings: {
        aiCommentsPerDollar: settings.aiCommentsPerDollar,
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

export const GET = requireAdmin(handleGet);
export const PUT = requireAdmin(handlePut);
