import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// This endpoint should be called by a cron job every 5 minutes
export async function POST(request: NextRequest) {
  try {
    // Find tasks that were sent more than 15 minutes ago but not completed
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    
    const failedTasks = await (prisma as any).postDraft.updateMany({
      where: {
        taskStatus: 'in_progress',
        taskSentAt: { lt: fifteenMinutesAgo }
      },
      data: {
        taskStatus: 'failed',
        taskFailedAt: new Date(),
        taskFailureReason: 'Extension Inactive - No response received within 15 minutes'
      }
    });

    console.log(`Marked ${failedTasks.count} tasks as failed due to extension inactivity`);

    return NextResponse.json({ 
      success: true, 
      failedCount: failedTasks.count 
    });
  } catch (error: any) {
    console.error('Check failed tasks error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Also allow GET for manual testing
export async function GET(request: NextRequest) {
  return POST(request);
}
