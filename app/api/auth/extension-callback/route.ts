import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'linkedin-automation-super-secret-jwt-key-min-32-characters-long-2024';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'linkedin-automation-super-secret-refresh-key-min-32-characters-long-2024';

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      // Not logged in - redirect to sign-in
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kommentify.com';
      return NextResponse.redirect(`${baseUrl}/sign-in`);
    }

    // Get user from Clerk
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/sign-in`);
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress;
    const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User';

    // Find or create user in our database
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { clerkUserId },
          { email }
        ]
      },
      include: { plan: true }
    });

    if (!user && email) {
      // Create new user with trial plan
      const trialPlan = await prisma.plan.findFirst({
        where: { name: 'Trial' }
      });

      const newUser = await prisma.user.create({
        data: {
          email,
          name,
          clerkUserId,
          password: `clerk_${clerkUserId}_${Date.now()}`, // Placeholder for Clerk users
          planId: trialPlan?.id || null,
          trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });
      
      // Refetch with plan included
      user = await prisma.user.findUnique({
        where: { id: newUser.id },
        include: { plan: true }
      });
    } else if (user && !user.clerkUserId) {
      // Link existing user to Clerk
      await prisma.user.update({
        where: { id: user.id },
        data: { clerkUserId },
      });
      
      // Refetch with plan included
      user = await prisma.user.findUnique({
        where: { id: user.id },
        include: { plan: true }
      });
    }

    if (!user) {
      return new NextResponse('User creation failed', { status: 500 });
    }

    // Generate JWT tokens for the extension
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        clerkUserId: user.clerkUserId 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: '30d' }
    );

    // Prepare user data for the extension
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      trialEndsAt: user.trialEndsAt,
    };

    // Return HTML page that sends data to extension and closes itself
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Login Successful - Kommentify</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #693fe9 0%, #1a2340 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
      color: white;
    }
    .container {
      text-align: center;
      padding: 40px;
      background: rgba(255,255,255,0.1);
      border-radius: 20px;
      backdrop-filter: blur(10px);
    }
    .success-icon {
      font-size: 60px;
      margin-bottom: 20px;
    }
    h1 {
      margin: 0 0 10px 0;
      font-size: 24px;
    }
    p {
      opacity: 0.9;
      margin: 0;
    }
    .loading {
      margin-top: 20px;
      opacity: 0.7;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="success-icon">✅</div>
    <h1>Login Successful!</h1>
    <p>Sending credentials to extension...</p>
    <p class="loading">This tab will close automatically.</p>
  </div>
  
  <script>
    // Store auth data in extension storage
    const authData = {
      authToken: ${JSON.stringify(token)},
      refreshToken: ${JSON.stringify(refreshToken)},
      userData: ${JSON.stringify(userData)},
      apiBaseUrl: ${JSON.stringify(process.env.NEXT_PUBLIC_SITE_URL || 'https://kommentify.com')}
    };
    
    // Try to communicate with extension
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set(authData, function() {
        console.log('Auth data saved to extension storage');
        // Close tab after a short delay
        setTimeout(() => {
          window.close();
        }, 1500);
      });
    } else {
      // Fallback: try using postMessage or localStorage
      try {
        localStorage.setItem('kommentify_auth', JSON.stringify(authData));
        console.log('Auth data saved to localStorage as fallback');
      } catch (e) {
        console.error('Could not save auth data:', e);
      }
      
      // Show manual instructions if extension storage not available
      document.querySelector('.loading').innerHTML = 
        'Please return to the Kommentify extension.<br>You may need to click the extension icon again.';
    }
    
    // Auto-close after 3 seconds regardless
    setTimeout(() => {
      window.close();
    }, 3000);
  </script>
</body>
</html>
    `;

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('Extension callback error:', error);
    return new NextResponse('Authentication error', { status: 500 });
  }
}
