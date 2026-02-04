import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, generateToken } from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    console.log('Admin login attempt for:', email);

    // Fallback admin credentials for production
    const FALLBACK_ADMIN_EMAIL = 'admin@linkedin-automation.com';
    const FALLBACK_ADMIN_PASSWORD = 'Admin@123456';

    // Check if this is the fallback admin
    if (email === FALLBACK_ADMIN_EMAIL && password === FALLBACK_ADMIN_PASSWORD) {
      console.log('Using fallback admin credentials');
      
      // Generate admin token with role
      const token = generateToken({ 
        userId: 'fallback-admin-id', 
        email: FALLBACK_ADMIN_EMAIL,
        role: 'admin' 
      });

      return NextResponse.json({
        success: true,
        admin: {
          id: 'fallback-admin-id',
          email: FALLBACK_ADMIN_EMAIL,
          name: 'Admin User',
          role: 'admin',
        },
        token,
      });
    }

    try {
      // Try to find admin user in database
      const admin = await prisma.admin.findUnique({
        where: { email },
      });

      console.log('Admin found:', admin ? 'Yes' : 'No');

      if (!admin) {
        return NextResponse.json(
          { success: false, error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Verify password
      const isValid = await comparePassword(password, admin.password);
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Generate admin token with role
      const token = generateToken({ 
        userId: admin.id, 
        email: admin.email,
        role: 'admin' 
      });

      // Remove password from response
      const { password: _, ...adminWithoutPassword } = admin;

      return NextResponse.json({
        success: true,
        admin: adminWithoutPassword,
        token,
      });
    } catch (dbError) {
      console.error('Database error, using fallback failed:', dbError);
      return NextResponse.json(
        { success: false, error: 'Database connection failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
