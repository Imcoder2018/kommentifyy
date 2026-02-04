import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, generateToken, generateRefreshToken } from '@/lib/auth';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
});

// In-memory user storage for fallback (production should use proper database)
const users = new Map();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = registerSchema.parse(body);
    
    console.log('Fallback registration attempt for:', email);

    // Check if user exists in memory
    if (users.has(email)) {
      return NextResponse.json(
        { success: false, error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user object
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user = {
      id: userId,
      email,
      name,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      plan: {
        id: 'free_plan',
        name: 'Free',
        price: 0,
        dailyComments: 10,
        dailyLikes: 20,
        dailyShares: 5,
        dailyFollows: 10,
        dailyConnections: 5,
        aiPostsPerDay: 2,
        aiCommentsPerDay: 10,
        allowAiPostGeneration: true,
        allowAiCommentGeneration: true,
        allowPostScheduling: false,
        allowAutomation: true,
        allowAutomationScheduling: false,
        allowNetworking: false,
        allowNetworkScheduling: false,
        allowCsvExport: false,
      }
    };

    // Store user in memory
    users.set(email, user);

    // Generate tokens
    const token = generateToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    console.log('User registered successfully:', email);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        plan: user.plan,
      },
      token,
      refreshToken,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => e.message).join(', ');
      console.error('Validation error:', error.errors);
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    
    if (error instanceof Error) {
      console.error('Specific error:', error.message);
      console.error('Error stack:', error.stack);
    }

    return NextResponse.json(
      { success: false, error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
