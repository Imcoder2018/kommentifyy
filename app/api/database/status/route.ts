import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { prisma } = require('@/lib/prisma');

    // Simple query to check database connection
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      success: true,
      status: 'connected',
      message: 'Database connection is healthy'
    });
  } catch (error: any) {
    console.error('Database status check failed:', error);

    return NextResponse.json({
      success: false,
      status: 'error',
      error: error.message || 'Database connection failed'
    }, { status: 500 });
  }
}
