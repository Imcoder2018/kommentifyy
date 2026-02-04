import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './auth';

/**
 * Extract token from Authorization header
 */
export function extractToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Verify admin authentication
 * Returns admin data if valid, throws error if not
 */
export function verifyAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = extractToken(authHeader);

  if (!token) {
    throw new Error('No authentication token provided');
  }

  try {
    const payload = verifyToken(token);

    // Check if user has admin role
    if (payload.role !== 'admin') {
      throw new Error('Insufficient permissions');
    }

    return payload;
  } catch (error: any) {
    console.error('Token verification detailed error:', error);
    throw new Error(`Invalid or expired token: ${error.message}`);
  }
}

/**
 * Middleware wrapper for admin-only routes
 */
export function requireAdmin(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      const admin = verifyAdminAuth(request);

      // Add admin data to request for use in handler
      (request as any).admin = admin;

      return await handler(request, ...args);
    } catch (error: any) {
      console.log('Admin auth error:', error.message);

      // For fallback admin, check if token exists and is valid format
      const authHeader = request.headers.get('authorization');
      const token = extractToken(authHeader);

      if (token) {
        try {
          const payload = verifyToken(token);
          if (payload.userId === 'fallback-admin-id' && payload.role === 'admin') {
            // Allow fallback admin
            (request as any).admin = payload;
            return await handler(request, ...args);
          }
        } catch (tokenError) {
          console.log('Token verification failed:', tokenError);
        }
      }

      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Unauthorized access'
        },
        { status: 403 }
      );
    }
  };
}
