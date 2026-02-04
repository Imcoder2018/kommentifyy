import { NextResponse } from 'next/server';

// Shared OTP store using global
declare global {
    var otpStore: Map<string, { otp: string; expires: number; attempts: number }>;
}

// Initialize global store if not exists
if (!global.otpStore) {
    global.otpStore = new Map();
}

// Generate 6-digit OTP
function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Email sending function using GHL (GoHighLevel) API
async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    // Option 1: Use GHL (GoHighLevel) API - Primary
    if (process.env.GHL_API_KEY && process.env.GHL_LOCATION_ID) {
        try {
            // First, check if contact exists or create one
            let contactId = await getOrCreateGHLContact(to);
            
            if (contactId) {
                // Send email via GHL
                const res = await fetch(`https://services.leadconnectorhq.com/conversations/messages`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.GHL_API_KEY}`,
                        'Version': '2021-07-28',
                    },
                    body: JSON.stringify({
                        type: 'Email',
                        contactId: contactId,
                        subject: subject,
                        html: html,
                        emailFrom: process.env.GHL_EMAIL_FROM || 'noreply@kommentify.com',
                    }),
                });
                
                if (res.ok) {
                    console.log('GHL: Email sent successfully to', to);
                    return true;
                } else {
                    const errorData = await res.json().catch(() => ({}));
                    console.error('GHL: Email send failed:', res.status, errorData);
                }
            }
        } catch (e) {
            console.error('GHL email error:', e);
        }
    }
    
    // Option 2: Use Resend API as fallback
    if (process.env.RESEND_API_KEY) {
        try {
            const res = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                },
                body: JSON.stringify({
                    from: 'Kommentify <noreply@kommentify.com>',
                    to: [to],
                    subject,
                    html,
                }),
            });
            return res.ok;
        } catch (e) {
            console.error('Resend email error:', e);
        }
    }
    
    // Option 3: Use SendGrid API as fallback
    if (process.env.SENDGRID_API_KEY) {
        try {
            const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
                },
                body: JSON.stringify({
                    personalizations: [{ to: [{ email: to }] }],
                    from: { email: 'noreply@kommentify.com', name: 'Kommentify' },
                    subject,
                    content: [{ type: 'text/html', value: html }],
                }),
            });
            return res.ok;
        } catch (e) {
            console.error('SendGrid email error:', e);
        }
    }
    
    // No email service configured - development mode
    return false;
}

// Helper function to get or create GHL contact
async function getOrCreateGHLContact(email: string): Promise<string | null> {
    try {
        // Search for existing contact
        const searchRes = await fetch(
            `https://services.leadconnectorhq.com/contacts/search?locationId=${process.env.GHL_LOCATION_ID}&query=${encodeURIComponent(email)}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${process.env.GHL_API_KEY}`,
                    'Version': '2021-07-28',
                },
            }
        );
        
        if (searchRes.ok) {
            const searchData = await searchRes.json();
            if (searchData.contacts && searchData.contacts.length > 0) {
                return searchData.contacts[0].id;
            }
        }
        
        // Create new contact if not found
        const createRes = await fetch('https://services.leadconnectorhq.com/contacts/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GHL_API_KEY}`,
                'Version': '2021-07-28',
            },
            body: JSON.stringify({
                locationId: process.env.GHL_LOCATION_ID,
                email: email,
                name: email.split('@')[0],
                source: 'Kommentify Signup',
                tags: ['kommentify', 'email-verification'],
            }),
        });
        
        if (createRes.ok) {
            const createData = await createRes.json();
            return createData.contact?.id || null;
        }
        
        return null;
    } catch (e) {
        console.error('GHL contact error:', e);
        return null;
    }
}

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ success: false, error: 'Invalid email format' }, { status: 400 });
        }

        // Check rate limiting (max 5 OTPs per email per 10 minutes)
        const existing = global.otpStore.get(email);
        if (existing && existing.attempts >= 5 && existing.expires > Date.now() - 10 * 60 * 1000) {
            return NextResponse.json({ 
                success: false, 
                error: 'Too many attempts. Please wait 10 minutes.' 
            }, { status: 429 });
        }

        // Generate new OTP
        const otp = generateOTP();
        const expires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

        // Store OTP
        global.otpStore.set(email, { 
            otp, 
            expires, 
            attempts: (existing?.attempts || 0) + 1 
        });

        // Email HTML template
        const emailHtml = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <img src="https://kommentify.com/favicon.png" alt="Kommentify" style="width: 48px; height: 48px; border-radius: 10px;" />
                    <h1 style="color: #1a1a1a; margin-top: 16px; font-size: 24px;">Kommentify</h1>
                </div>
                
                <h2 style="color: #333; text-align: center; margin-bottom: 24px;">Verify Your Email</h2>
                
                <p style="color: #666; font-size: 16px; text-align: center; margin-bottom: 24px;">
                    Use the code below to verify your email address:
                </p>
                
                <div style="background: linear-gradient(135deg, #693fe9, #8b5cf6); padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
                    <span style="font-size: 36px; font-weight: bold; color: white; letter-spacing: 8px;">${otp}</span>
                </div>
                
                <p style="color: #888; font-size: 14px; text-align: center; margin-bottom: 16px;">
                    This code expires in <strong>10 minutes</strong>.
                </p>
                
                <p style="color: #888; font-size: 12px; text-align: center;">
                    If you didn't request this code, please ignore this email.
                </p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="color: #aaa; font-size: 11px; text-align: center;">
                    © 2025 Kommentify. All rights reserved.<br>
                    AI-Powered LinkedIn Growth Suite
                </p>
            </div>
        `;

        // Try to send email
        const emailSent = await sendEmail(email, 'Your Kommentify Verification Code', emailHtml);
        
        if (emailSent) {
            console.log(`OTP sent to ${email}`);
        } else {
            // Development mode - log OTP to console
            console.log(`[DEV MODE] OTP for ${email}: ${otp}`);
        }
        
        return NextResponse.json({ 
            success: true, 
            message: 'Verification code sent to your email' 
        });

    } catch (error) {
        console.error('Send OTP error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to send verification code' 
        }, { status: 500 });
    }
}
