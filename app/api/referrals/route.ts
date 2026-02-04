import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Generate a unique referral code
function generateReferralCode(userId: string): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Add last 4 chars of userId for uniqueness
    return code + userId.slice(-4).toUpperCase();
}

// GET - Get user's referral info (their code, referrals, earnings)
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const payload = verifyToken(token);
        if (!payload) {
            return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
        }

        // Get user with their referrals
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            include: {
                referrals: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        createdAt: true,
                        hasPaid: true,
                        totalPaid: true,
                        plan: {
                            select: {
                                name: true,
                                price: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        // Get referral settings
        let settings = await prisma.referralSettings.findFirst({
            where: { isActive: true }
        });

        // Create default settings if none exist
        if (!settings) {
            settings = await prisma.referralSettings.create({
                data: {
                    commissionPercentage: 20,
                    commissionFlat: 5,
                    usePercentage: true,
                    minPayoutAmount: 50,
                    isActive: true
                }
            });
        }

        // Generate referral code if user doesn't have one
        let referralCode = user.referralCode;
        if (!referralCode) {
            referralCode = generateReferralCode(user.id);
            await prisma.user.update({
                where: { id: user.id },
                data: { referralCode }
            });
        }

        // Calculate stats
        const totalReferrals = user.referrals.length;
        const paidReferrals = user.referrals.filter(r => r.hasPaid);
        const totalPaidReferrals = paidReferrals.length;
        const totalRevenue = paidReferrals.reduce((sum, r) => sum + (r.totalPaid || 0), 0);
        
        // Calculate commission
        let commission = 0;
        if (settings.usePercentage) {
            commission = totalRevenue * (settings.commissionPercentage / 100);
        } else {
            commission = totalPaidReferrals * settings.commissionFlat;
        }

        // Get base URL for referral link
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kommentify.com';
        const referralLink = `${baseUrl}/signup?ref=${referralCode}`;

        return NextResponse.json({
            success: true,
            referralCode,
            referralLink,
            stats: {
                totalReferrals,
                totalPaidReferrals,
                totalRevenue,
                commission,
                commissionRate: settings.usePercentage 
                    ? `${settings.commissionPercentage}%` 
                    : `$${settings.commissionFlat} per paid user`,
                minPayout: settings.minPayoutAmount,
                canRequestPayout: commission >= settings.minPayoutAmount
            },
            referrals: user.referrals.map(r => ({
                id: r.id,
                name: r.name,
                joinedAt: r.createdAt,
                hasPaid: r.hasPaid,
                totalPaid: r.totalPaid,
                planName: r.plan?.name || 'Free'
            }))
        });
    } catch (error) {
        console.error('Referral API error:', error);
        return NextResponse.json({ success: false, error: 'Failed to get referral info' }, { status: 500 });
    }
}

// POST - Validate a referral code (used during signup)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { referralCode } = body;

        if (!referralCode) {
            return NextResponse.json({ success: false, error: 'Referral code required' }, { status: 400 });
        }

        // Find user with this referral code
        const referrer = await prisma.user.findUnique({
            where: { referralCode: referralCode.toUpperCase() },
            select: {
                id: true,
                name: true
            }
        });

        if (!referrer) {
            return NextResponse.json({ 
                success: false, 
                error: 'Invalid referral code',
                valid: false 
            }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            valid: true,
            referrerName: referrer.name?.split(' ')[0] || 'A friend' // First name only
        });
    } catch (error) {
        console.error('Referral validation error:', error);
        return NextResponse.json({ success: false, error: 'Failed to validate code' }, { status: 500 });
    }
}
