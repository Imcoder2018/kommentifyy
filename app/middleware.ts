import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from './lib/auth';

// This middleware runs on every request
export async function middleware(request: NextRequest) {
  // Only apply to dashboard route
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Get token from cookie
    const token = request.cookies.get('authToken')?.value;

    // If no token, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Verify token
      const payload = await verifyJWT(token);
      
      // If user doesn't have a plan ID (free user), redirect to plans page
      if (!payload.planId || payload.planId === 'free') {
        return NextResponse.redirect(new URL('/plans', request.url));
      }
      
      // User has a valid token and a paid plan, proceed to dashboard
      return NextResponse.next();
    } catch (error) {
      // Invalid token, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}

// Configure the paths that need this middleware
export const config = {
  matcher: ['/dashboard/:path*']
};
