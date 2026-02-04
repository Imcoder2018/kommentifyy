import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Verify admin token
function verifyAdminToken(token: string): boolean {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return payload.role === 'admin' || payload.isAdmin;
  } catch {
    return false;
  }
}

// GET - Get all email sequences
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!verifyAdminToken(token)) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    // Get all sequences with their email nodes
    const sequences = await prisma.emailSequence.findMany({
      include: {
        emails: {
          orderBy: { position: 'asc' }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Get automation settings
    let settings = await prisma.emailAutomationSettings.findFirst();
    if (!settings) {
      settings = await prisma.emailAutomationSettings.create({
        data: {
          batchSize: 50,
          cronIntervalMins: 1,
          maxRetriesPerEmail: 3,
          retryDelayMins: 30,
          isEnabled: true
        }
      });
    }

    // Get queue stats
    const queueStats = await prisma.emailQueue.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    const stats = {
      pending: 0,
      sent: 0,
      failed: 0,
      cancelled: 0
    };

    queueStats.forEach(s => {
      stats[s.status as keyof typeof stats] = s._count.status;
    });

    return NextResponse.json({
      success: true,
      sequences,
      settings,
      stats
    });
  } catch (error) {
    console.error('Get email sequences error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sequences' },
      { status: 500 }
    );
  }
}

// POST - Create or update sequence
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!verifyAdminToken(token)) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, type, description, trigger, isActive, nodes, edges, emails } = body;

    if (id) {
      // Update existing sequence
      const sequence = await prisma.emailSequence.update({
        where: { id },
        data: {
          name,
          description,
          trigger,
          isActive,
          nodes: JSON.stringify(nodes),
          edges: JSON.stringify(edges)
        }
      });

      // Delete existing email nodes and recreate
      await prisma.emailTemplateNode.deleteMany({
        where: { sequenceId: id }
      });

      // Create new email nodes
      if (emails && emails.length > 0) {
        await prisma.emailTemplateNode.createMany({
          data: emails.map((email: any, index: number) => ({
            sequenceId: id,
            nodeId: email.nodeId || `email_${index}`,
            position: index,
            subject: email.subject,
            body: email.body,
            delayHours: email.delayHours || 0,
            delayMinutes: email.delayMinutes || 0,
            isActive: email.isActive !== false,
            conditions: email.conditions ? JSON.stringify(email.conditions) : null
          }))
        });
      }

      return NextResponse.json({
        success: true,
        sequence,
        message: 'Sequence updated successfully'
      });
    } else {
      // Create new sequence
      const sequence = await prisma.emailSequence.create({
        data: {
          name,
          type,
          description,
          trigger,
          isActive: isActive !== false,
          nodes: JSON.stringify(nodes || []),
          edges: JSON.stringify(edges || [])
        }
      });

      // Create email nodes
      if (emails && emails.length > 0) {
        await prisma.emailTemplateNode.createMany({
          data: emails.map((email: any, index: number) => ({
            sequenceId: sequence.id,
            nodeId: email.nodeId || `email_${index}`,
            position: index,
            subject: email.subject,
            body: email.body,
            delayHours: email.delayHours || 0,
            delayMinutes: email.delayMinutes || 0,
            isActive: email.isActive !== false,
            conditions: email.conditions ? JSON.stringify(email.conditions) : null
          }))
        });
      }

      return NextResponse.json({
        success: true,
        sequence,
        message: 'Sequence created successfully'
      });
    }
  } catch (error: any) {
    console.error('Save email sequence error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save sequence' },
      { status: 500 }
    );
  }
}

// PUT - Update automation settings
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!verifyAdminToken(token)) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { batchSize, cronIntervalMins, maxRetriesPerEmail, retryDelayMins, isEnabled } = body;

    // Get or create settings
    let settings = await prisma.emailAutomationSettings.findFirst();
    
    if (settings) {
      settings = await prisma.emailAutomationSettings.update({
        where: { id: settings.id },
        data: {
          batchSize: batchSize ?? settings.batchSize,
          cronIntervalMins: cronIntervalMins ?? settings.cronIntervalMins,
          maxRetriesPerEmail: maxRetriesPerEmail ?? settings.maxRetriesPerEmail,
          retryDelayMins: retryDelayMins ?? settings.retryDelayMins,
          isEnabled: isEnabled ?? settings.isEnabled
        }
      });
    } else {
      settings = await prisma.emailAutomationSettings.create({
        data: {
          batchSize: batchSize ?? 50,
          cronIntervalMins: cronIntervalMins ?? 1,
          maxRetriesPerEmail: maxRetriesPerEmail ?? 3,
          retryDelayMins: retryDelayMins ?? 30,
          isEnabled: isEnabled ?? true
        }
      });
    }

    return NextResponse.json({
      success: true,
      settings,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a sequence
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!verifyAdminToken(token)) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const sequenceId = searchParams.get('id');

    if (!sequenceId) {
      return NextResponse.json({ success: false, error: 'Sequence ID required' }, { status: 400 });
    }

    await prisma.emailSequence.delete({
      where: { id: sequenceId }
    });

    return NextResponse.json({
      success: true,
      message: 'Sequence deleted successfully'
    });
  } catch (error) {
    console.error('Delete sequence error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete sequence' },
      { status: 500 }
    );
  }
}
