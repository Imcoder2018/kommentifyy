import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Verify admin token
function verifyAdminToken(token: string): boolean {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return payload.role === 'admin' || payload.isAdmin;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check admin authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!verifyAdminToken(token)) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Fetch emails from queue by status
    const queueItems = await prisma.emailQueue.findMany({
      where: { status },
      orderBy: { scheduledFor: 'desc' },
      take: limit,
    });

    // Fetch user emails separately
    const userIds = [...new Set(queueItems.map(q => q.userId))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, email: true, name: true }
    });
    
    const userMap = Object.fromEntries(users.map(u => [u.id, u]));

    // Transform to include recipient email and subject
    const emails = queueItems.map(item => {
      const metadata = item.metadata ? JSON.parse(item.metadata) : {};
      const user = userMap[item.userId];
      return {
        id: item.id,
        userId: item.userId,
        recipientEmail: user?.email || 'Unknown',
        recipientName: user?.name || 'Unknown',
        subject: metadata.subject || `${item.sequenceType} - Email #${item.emailNumber}`,
        sequenceType: item.sequenceType,
        emailNumber: item.emailNumber,
        scheduledFor: item.scheduledFor,
        sentAt: item.sentAt,
        status: item.status,
        error: item.error,
      };
    });

    return NextResponse.json({ success: true, emails });
  } catch (error) {
    console.error('Queue fetch error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch queue details' 
    }, { status: 500 });
  }
}
