import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

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

        // #39: Brute-force protection — limit verification attempts
        if (storedData.attempts >= 5) {
            // Too many wrong attempts — invalidate the OTP
            await prisma.oTPVerification.delete({
                where: { id: storedData.id }
            });
            return NextResponse.json({
                success: false,
                error: 'Too many incorrect attempts. Please request a new code.'
            }, { status: 429 });
        }

        // #40: Use timing-safe comparison for OTP verification
        const storedOtpBuffer = Buffer.from(storedData.otp, 'utf8');
        const providedOtpBuffer = Buffer.from(String(otp), 'utf8');
        const isOtpValid = storedOtpBuffer.length === providedOtpBuffer.length &&
            crypto.timingSafeEqual(storedOtpBuffer, providedOtpBuffer);

        if (!isOtpValid) {
            // #39: Increment attempt counter on wrong OTP
            await prisma.oTPVerification.update({
                where: { id: storedData.id },
                data: { attempts: storedData.attempts + 1 }
            });
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
