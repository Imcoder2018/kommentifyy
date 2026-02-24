import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get global settings (public endpoint)
export async function GET(request: NextRequest) {
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
export async function POST(request: NextRequest) {
  try {
    const { aiCommentsPerDollar } = await request.json();

    // Validate input
    if (typeof aiCommentsPerDollar !== 'number' || aiCommentsPerDollar < 1) {
      return NextResponse.json(
        { success: false, error: 'Invalid aiCommentsPerDollar value' },
        { status: 400 }
      );
    }

    let settings = await prisma.globalSettings.findFirst();

    if (!settings) {
      // Create if doesn't exist
      settings = await prisma.globalSettings.create({
        data: {
          aiCommentsPerDollar,
        },
      });
    } else {
      // Update existing
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
    console.error('Save settings error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
