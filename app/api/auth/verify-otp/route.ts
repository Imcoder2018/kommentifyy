import { NextResponse } from 'next/server';

// Shared OTP store - import from send-otp or use global
// In production, use Redis or database
declare global {
    var otpStore: Map<string, { otp: string; expires: number; attempts: number }>;
}

// Initialize global store if not exists
if (!global.otpStore) {
    global.otpStore = new Map();
}

export async function POST(request: Request) {
    try {
        const { email, otp } = await request.json();

        if (!email || !otp) {
            return NextResponse.json({ 
                success: false, 
                error: 'Email and verification code are required' 
            }, { status: 400 });
        }

        // Get stored OTP
        const storedData = global.otpStore.get(email);

        if (!storedData) {
            return NextResponse.json({ 
                success: false, 
                error: 'No verification code found. Please request a new one.' 
            }, { status: 400 });
        }

        // Check if expired
        if (storedData.expires < Date.now()) {
            global.otpStore.delete(email);
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

        // OTP is valid - remove it from store
        global.otpStore.delete(email);

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
