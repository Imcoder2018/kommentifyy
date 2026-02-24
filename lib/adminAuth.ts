import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractToken } from './auth'; // #9: Import from auth.ts instead of duplicating

// Re-export extractToken for backward compatibility
export { extractToken };

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
    if (error.message === 'Insufficient permissions') {
      throw error; // Re-throw permission errors as-is
    }
    throw new Error(`Invalid or expired token: ${error.message}`);
  }
}

// #10: Proper handler type instead of generic Function
type AdminRouteHandler = (request: NextRequest, ...args: any[]) => Promise<NextResponse>;

/**
 * Middleware wrapper for admin-only routes
 * #11: Returns 401 for auth failures, 403 for insufficient permissions
 */
export function requireAdmin(handler: AdminRouteHandler) {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      const admin = verifyAdminAuth(request);

      // Add admin data to request for use in handler
      (request as any).admin = admin;

      return await handler(request, ...args);
    } catch (error: any) {
      console.error('Admin auth error:', error.message);

      // #11: Distinguish between 401 (no/invalid token) and 403 (insufficient permissions)
      const isPermissionError = error.message === 'Insufficient permissions';
      return NextResponse.json(
        {
          success: false,
          error: isPermissionError ? 'Insufficient permissions' : 'Unauthorized access'
        },
        { status: isPermissionError ? 403 : 401 }
      );
    }
  };
}
