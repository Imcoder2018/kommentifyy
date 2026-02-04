import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = extractToken(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);

    // Get user and plan
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { plan: true },
    });

    if (!user || !user.plan) {
      return NextResponse.json(
        { success: false, error: 'User not found or no plan assigned' },
        { status: 404 }
      );
    }

    // Get current month usage
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Get usage for the current month
    const monthUsage = await prisma.apiUsage.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // Sum up import profiles used this month
    const totalImportProfilesUsed = monthUsage.reduce(
      (sum, day) => sum + ((day as any).importProfiles || 0),
      0
    );

    const monthlyLimit = (user.plan as any).monthlyImportCredits ?? 0;
    const remaining = Math.max(0, monthlyLimit - totalImportProfilesUsed);

    return NextResponse.json({
      success: true,
      credits: {
        total: monthlyLimit,
        used: totalImportProfilesUsed,
        remaining: remaining,
        planName: user.plan.name,
      },
    });
  } catch (error: any) {
    console.error('Import credits check error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
