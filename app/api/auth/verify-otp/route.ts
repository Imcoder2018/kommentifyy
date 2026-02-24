import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { email, otp } = await request.json();

        if (!email || !otp) {
            return NextResponse.json({ 
                success: false, 
                error: 'Email and verification code are required' 
            }, { status: 400 });
        }

        // Clean up expired OTPs first
        await prisma.oTPVerification.deleteMany({
            where: { expiresAt: { lt: new Date() } }
        });

        // Get stored OTP from database
        const storedData = await prisma.oTPVerification.findFirst({
            where: { email },
            orderBy: { createdAt: 'desc' }
        });

        if (!storedData) {
            return NextResponse.json({ 
                success: false, 
                error: 'No verification code found. Please request a new one.' 
            }, { status: 400 });
        }

        // Check if expired
        if (storedData.expiresAt < new Date()) {
            await prisma.oTPVerification.delete({
                where: { id: storedData.id }
            });
            return NextResponse.json({ 
                success: false, 
                error: 'Verification code has expired. Please request a new one.' 
            }, { status: 400 });
        }

        // Verify OTP
        if (storedData.otp !== otp) {
            return NextResponse.json({ 
                success: false, 
                error: 'Invalid verification code. Please try again.' 
            }, { status: 400 });
        }

        // OTP is valid - remove it from database
        await prisma.oTPVerification.delete({
            where: { id: storedData.id }
        });

        return NextResponse.json({ 
            success: true, 
            message: 'Email verified successfully' 
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Verification failed' 
        }, { status: 500 });
    }
}
