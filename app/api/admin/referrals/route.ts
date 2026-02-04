import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Helper to verify admin token (simple check)
function verifyAdminToken(token: string): boolean {
    try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        return payload.role === 'admin' || payload.isAdmin;
    } catch {
        return false;
    }
}

// GET - Get all referral data for admin
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // Get all users who have referred at least one person
        const usersWithReferrals = await prisma.user.findMany({
            where: {
                referrals: {
                    some: {}
                }
            },
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
            },
            orderBy: { createdAt: 'desc' }
        });

        // Get referral settings
        let settings = await prisma.referralSettings.findFirst({
            where: { isActive: true }
        });

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

        // Calculate stats for each user
        const referrersData = usersWithReferrals.map(user => {
            const totalReferrals = user.referrals.length;
            const paidReferrals = user.referrals.filter(r => r.hasPaid);
            const totalPaidReferrals = paidReferrals.length;
            const totalRevenue = paidReferrals.reduce((sum, r) => sum + (r.totalPaid || 0), 0);
            
            let commission = 0;
            if (settings!.usePercentage) {
                commission = totalRevenue * (settings!.commissionPercentage / 100);
            } else {
                commission = totalPaidReferrals * settings!.commissionFlat;
            }

            return {
                id: user.id,
                name: user.name,
                email: user.email,
                referralCode: user.referralCode,
                totalReferrals,
                totalPaidReferrals,
                totalRevenue,
                commission,
                referrals: user.referrals.map(r => ({
                    id: r.id,
                    name: r.name,
                    email: r.email,
                    joinedAt: r.createdAt,
                    hasPaid: r.hasPaid,
                    totalPaid: r.totalPaid,
                    planName: r.plan?.name || 'Free'
                }))
            };
        });

        // Calculate totals
        const totalSignupsFromReferrals = referrersData.reduce((sum, r) => sum + r.totalReferrals, 0);
        const totalPaidFromReferrals = referrersData.reduce((sum, r) => sum + r.totalPaidReferrals, 0);
        const totalRevenueFromReferrals = referrersData.reduce((sum, r) => sum + r.totalRevenue, 0);
        const totalCommissionOwed = referrersData.reduce((sum, r) => sum + r.commission, 0);

        return NextResponse.json({
            success: true,
            settings: {
                commissionPercentage: settings.commissionPercentage,
                commissionFlat: settings.commissionFlat,
                usePercentage: settings.usePercentage,
                minPayoutAmount: settings.minPayoutAmount,
                isActive: settings.isActive
            },
            summary: {
                totalReferrers: referrersData.length,
                totalSignupsFromReferrals,
                totalPaidFromReferrals,
                totalRevenueFromReferrals,
                totalCommissionOwed
            },
            referrers: referrersData
        });
    } catch (error) {
        console.error('Admin referrals API error:', error);
        return NextResponse.json({ success: false, error: 'Failed to get referral data' }, { status: 500 });
    }
}

// PUT - Update referral settings
export async function PUT(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { commissionPercentage, commissionFlat, usePercentage, minPayoutAmount, isActive } = body;

        // Find existing settings or create new
        let settings = await prisma.referralSettings.findFirst();

        if (settings) {
            settings = await prisma.referralSettings.update({
                where: { id: settings.id },
                data: {
                    commissionPercentage: commissionPercentage ?? settings.commissionPercentage,
                    commissionFlat: commissionFlat ?? settings.commissionFlat,
                    usePercentage: usePercentage ?? settings.usePercentage,
                    minPayoutAmount: minPayoutAmount ?? settings.minPayoutAmount,
                    isActive: isActive ?? settings.isActive
                }
            });
        } else {
            settings = await prisma.referralSettings.create({
                data: {
                    commissionPercentage: commissionPercentage ?? 20,
                    commissionFlat: commissionFlat ?? 5,
                    usePercentage: usePercentage ?? true,
                    minPayoutAmount: minPayoutAmount ?? 50,
                    isActive: isActive ?? true
                }
            });
        }

        return NextResponse.json({
            success: true,
            settings: {
                commissionPercentage: settings.commissionPercentage,
                commissionFlat: settings.commissionFlat,
                usePercentage: settings.usePercentage,
                minPayoutAmount: settings.minPayoutAmount,
                isActive: settings.isActive
            }
        });
    } catch (error) {
        console.error('Update referral settings error:', error);
        return NextResponse.json({ success: false, error: 'Failed to update settings' }, { status: 500 });
    }
}
