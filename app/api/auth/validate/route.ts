import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { userService } from '@/lib/user-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = verifyToken(token);

      if (!decoded || !decoded.userId) {
        return NextResponse.json(
          { success: false, error: 'Invalid token' },
          { status: 401 }
        );
      }

      // Get user from database
      const user = await userService.findUserByEmail(decoded.email);

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }

      const { password: _, ...userWithoutPassword } = user;

      // Extract plan features for easy access
      const planFeatures = user.plan ? {
        autoLike: true, // Basic feature for all plans
        autoComment: user.plan.allowAiCommentGeneration || false,
        autoFollow: user.plan.allowNetworking || false,
        aiContent: user.plan.allowAiPostGeneration || false,
        aiTopicLines: (user.plan as any).allowAiTopicLines !== false,
        scheduling: user.plan.allowPostScheduling || false,
        analytics: user.plan.allowCsvExport || false,
        importProfiles: (user.plan as any).allowImportProfiles !== false
      } : {
        autoLike: false,
        autoComment: false,
        autoFollow: false,
        aiContent: false,
        aiTopicLines: false,
        scheduling: false,
        analytics: false,
        importProfiles: false
      };

      return NextResponse.json({
        success: true,
        user: userWithoutPassword,
        features: planFeatures,
      });
    } catch (error) {
      console.error('Token verification error:', error);
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
