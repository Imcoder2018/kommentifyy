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
