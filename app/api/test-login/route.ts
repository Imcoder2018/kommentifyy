import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    console.log('Test login for:', email);
    
    // Find admin user
    const admin = await prisma.admin.findUnique({
      where: { email },
    });
    
    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'Admin not found',
      });
    }
    
    console.log('Admin found, checking password...');
    
    // Test password comparison
    const isValid = await bcrypt.compare(password, admin.password);
    
    console.log('Password valid:', isValid);
    console.log('Stored hash length:', admin.password.length);
    console.log('Input password length:', password.length);
    
    return NextResponse.json({
      success: true,
      adminFound: true,
      passwordValid: isValid,
      hashLength: admin.password.length,
      passwordLength: password.length,
      env: {
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasRefreshSecret: !!process.env.JWT_REFRESH_SECRET,
      }
    });
  } catch (error) {
    console.error('Test login error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
