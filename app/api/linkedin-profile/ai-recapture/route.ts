import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// POST - Start AI recapture of LinkedIn profile data
// This sends a command to the extension to capture full profile text
// The extension will then send it to OpenAI to restructure into our format
export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token);

    // Create a command for the extension using Activity model (same as other commands)
    const activity = await prisma.activity.create({
      data: {
        userId: payload.userId,
        type: 'extension_command_AI_PROFILE_RECAPTURE',
        metadata: JSON.stringify({
          command: 'AI_PROFILE_RECAPTURE',
          data: {
            instruction: 'Capture full text from LinkedIn profile page and return for AI restructuring',
          },
          status: 'pending',
          createdAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'AI recapture task created. Extension will process and restructure profile data.',
      commandId: activity.id,
    });
  } catch (error: any) {
    console.error('AI recapture error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
