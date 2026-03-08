'use client';

import React from 'react';
import Link from 'next/link';

// SVG Icon Components
const IconStar = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

const IconRocket = ({ size = 16, color = '#693fe9' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
);

const IconMessage = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);

const IconEdit = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const IconChart = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
);

const IconUsers = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const IconHandshake = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
    </svg>
);

const IconDownload = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

const IconDatabase = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
);

const IconUser = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const IconCalendar = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const IconClock = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const IconShield = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

// Types - using any to accept different limit structures
type PlanLimits = Record<string, number | undefined>;

interface PlanFeatures {
    autoLike: boolean;
    autoComment: boolean;
    autoFollow: boolean;
    aiContent: boolean;
    aiTopicLines: boolean;
    scheduling: boolean;
    automationScheduling: boolean;
    networkScheduling: boolean;
    analytics: boolean;
    importProfiles: boolean;
}

interface Plan {
    id: string;
    name: string;
    price: number;
    stripeLink?: string | null;
    stripeYearlyLink?: string | null;
    limits: PlanLimits;
    features: PlanFeatures;
    monthlyImportCredits: number;
    isDefaultFreePlan?: boolean;
    isTrialPlan?: boolean;
}

interface MonthlyPlansProps {
    plans: Plan[];
    billingCycle: 'monthly' | 'yearly';
    formatNumber: (num: number) => string;
    getYearlyDiscount: (planIndex: number) => number;
}

export default function MonthlyPlans({ plans, billingCycle, formatNumber, getYearlyDiscount }: MonthlyPlansProps) {
    const filteredPlans = plans.filter(p => !p.isDefaultFreePlan).sort((a, b) => a.price - b.price);

    return (
        <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            {filteredPlans.map((plan, index) => {
                const planIndex = filteredPlans.findIndex(p => p.id === plan.id);
                const isPopular = planIndex === Math.floor(filteredPlans.length / 2) || filteredPlans.length === 1;
                const isDiamond = plan.name.toLowerCase().includes('agency') || plan.name.toLowerCase().includes('enterprise');
                const isFree = plan.price === 0 && !plan.isTrialPlan;
                const isTrial = plan.isTrialPlan;

                // Calculate yearly pricing with discounts
                const isPaidPlan = plan.price > 0 && !plan.isTrialPlan;
                const yearlyDiscount = isPaidPlan ? getYearlyDiscount(planIndex) : 0;
                const yearlyPrice = isPaidPlan ? Math.round(plan.price * 12 * (1 - yearlyDiscount)) : 0;
                const monthlyEquivalent = isPaidPlan ? Math.round(yearlyPrice / 12) : 0;
                const discountPercent = Math.round(yearlyDiscount * 100);

                // Build comprehensive feature list from ALL API data with SVG icons
                const aiComments = (plan.limits.aiCommentsPerMonth ?? 0) >= 100000 ? 'Unlimited' : formatNumber(plan.limits.aiCommentsPerMonth ?? 0);
                const aiPosts = (plan.limits.aiPostsPerMonth ?? 0) >= 100000 ? 'Unlimited' : formatNumber(plan.limits.aiPostsPerMonth ?? 0);
                const monthlyLikes = (plan.limits.monthlyLikes ?? 0) >= 100000 ? 'Unlimited' : formatNumber(plan.limits.monthlyLikes ?? 0);
                const monthlyShares = (plan.limits.monthlyShares ?? 0) >= 100000 ? 'Unlimited' : formatNumber(plan.limits.monthlyShares ?? 0);
                const monthlyFollows = (plan.limits.monthlyFollows ?? 0) >= 100000 ? 'Unlimited' : formatNumber(plan.limits.monthlyFollows ?? 0);
                const connections = (plan.limits.monthlyConnections ?? 0) >= 100000 ? 'Unlimited' : formatNumber(plan.limits.monthlyConnections ?? 0);
                const imports = (plan.monthlyImportCredits ?? 0) >= 100000 ? 'Unlimited' : (plan.monthlyImportCredits === -1 ? '—' : formatNumber(plan.monthlyImportCredits ?? 0));

                const allFeatures = [
                    { label: 'AI Comments/mo', value: aiComments, icon: <IconMessage size={14} color="#693fe9" /> },
                    { label: 'AI Posts/mo', value: aiPosts, icon: <IconEdit size={14} color="#8b5cf6" /> },
                    { label: 'Auto Likes', value: monthlyLikes, icon: <IconStar size={14} color="#ef4444" /> },
                    { label: 'Auto Shares', value: monthlyShares, icon: <IconChart size={14} color="#10b981" /> },
                    { label: 'Auto Follows', value: monthlyFollows, icon: <IconUsers size={14} color="#3b82f6" /> },
                    { label: 'Connections', value: connections, icon: <IconHandshake size={14} color="#f59e0b" /> },
                    { label: 'Warm Leads Imports', value: imports, icon: <IconDownload size={14} color="#06b6d4" /> },
                ];

                // Additional features to match lifetime deals format
                const hasContentPlanner = plan.price > 0;
                const hasViralPosts = (plan.features?.aiContent ?? false);
                const hasAddedSources = (plan.limits.aiPostsPerMonth ?? 0) > 0;
                const hasPersonalizedWriter = (plan.limits.aiPostsPerMonth ?? 0) > 0;
                const hasPrioritySupport = plan.price >= 29;

                const booleanFeatures = [
                    { label: 'Viral Posts Writer', enabled: hasViralPosts, icon: <IconRocket size={14} color="#22c55e" /> },
                    { label: 'Added Sources (AI Posts & Comments)', enabled: hasAddedSources, icon: <IconDatabase size={14} color="#8b5cf6" /> },
                    { label: 'Personalized Post Writer (Scan Profile)', enabled: hasPersonalizedWriter, icon: <IconUser size={14} color="#f59e0b" /> },
                    { label: 'Content Planner (7/30 Days)', enabled: hasContentPlanner, icon: <IconCalendar size={14} color="#3b82f6" /> },
                    { label: 'Auto Scheduled Posts (Auto Pilot)', enabled: plan.features.automationScheduling || plan.features.scheduling, icon: <IconClock size={14} color="#10b981" /> },
                    { label: 'Lifetime Updates', enabled: true, icon: <IconRocket size={14} color="#22c55e" /> },
                    { label: 'Priority Support', enabled: hasPrioritySupport, icon: <IconShield size={14} color="#3b82f6" /> },
                ];

                return (
                    <div key={plan.id} className="pricing-card" style={{
                        padding: '24px',
                        background: isPopular ? 'linear-gradient(180deg, rgba(105, 63, 233, 0.12) 0%, rgba(105, 63, 233, 0.04) 100%)' : isDiamond ? 'linear-gradient(180deg, rgba(245, 158, 11, 0.12) 0%, rgba(245, 158, 11, 0.03) 100%)' : 'rgba(255,255,255,0.02)',
                        border: isPopular ? '2px solid #693fe9' : isDiamond ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '16px',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: isPopular ? '0 8px 32px rgba(105, 63, 233, 0.2)' : isDiamond ? '0 8px 32px rgba(245, 158, 11, 0.15)' : 'none'
                    }}>
                        {isPopular && (
                            <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #693fe9, #8b5cf6)', color: 'white', padding: '5px 14px', borderRadius: '16px', fontSize: '10px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 4px 12px rgba(105, 63, 233, 0.4)' }}>
                                <IconStar size={12} color="white" /> Most Popular
                            </div>
                        )}
                        {isDiamond && (
                            <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', padding: '5px 14px', borderRadius: '16px', fontSize: '10px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)' }}>
                                <IconRocket size={12} color="white" /> Best Value
                            </div>
                        )}

                        <div style={{ marginBottom: '16px', paddingTop: isPopular || isDiamond ? '6px' : '0' }}>
                            <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px', color: isPopular ? '#a78bfa' : isDiamond ? '#fbbf24' : 'white' }}>{plan.name}</div>
                            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                                {isFree ? 'Perfect for getting started' : isTrial ? 'Try all features free' : 'For growing professionals'}
                            </p>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            {billingCycle === 'monthly' ? (
                                <>
                                    {plan.price > 0 && (
                                        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through', marginRight: '6px' }}>
                                            ${plan.name.toLowerCase().includes('starter') ? '19' : plan.name.toLowerCase().includes('gold') || plan.name.toLowerCase().includes('professional') ? '59' : plan.name.toLowerCase().includes('pro') && !plan.name.toLowerCase().includes('professional') ? '60' : plan.name.toLowerCase().includes('diamond') || plan.name.toLowerCase().includes('agency') ? '79' : plan.name.toLowerCase().includes('enterprise') ? '200' : Math.round(plan.price * 2)}
                                        </span>
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                                        <span style={{ fontSize: '36px', fontWeight: '800', color: isPopular ? '#a78bfa' : isDiamond ? '#fbbf24' : 'white' }}>${plan.price}</span>
                                        <span style={{ fontSize: '14px', fontWeight: '400', color: 'rgba(255,255,255,0.5)' }}>/mo</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {isPaidPlan && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through' }}>${plan.price * 12}/yr</span>
                                            <span style={{ background: '#10b981', color: 'white', padding: '2px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '600' }}>
                                                {discountPercent}% OFF
                                            </span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                                        <span style={{ fontSize: '36px', fontWeight: '800', color: isPopular ? '#a78bfa' : isDiamond ? '#fbbf24' : 'white' }}>
                                            ${isPaidPlan ? yearlyPrice : plan.price}
                                        </span>
                                        <span style={{ fontSize: '14px', fontWeight: '400', color: 'rgba(255,255,255,0.5)' }}>/yr</span>
                                    </div>
                                    {isPaidPlan && (
                                        <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>
                                            ~${monthlyEquivalent}/mo billed yearly
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div style={{ marginBottom: '20px', flex: 1 }}>
                            <div style={{ fontSize: '10px', fontWeight: '600', color: 'rgba(255,255,255,0.5)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>What&apos;s Included</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {allFeatures.filter(f => f.value !== '—' && f.value !== '0' && !String(f.value).startsWith('-')).map((feat, i) => (
                                    <div key={i} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        fontSize: '13px',
                                        color: 'rgba(255,255,255,0.8)',
                                        fontWeight: '400',
                                        background: 'transparent',
                                        padding: '0',
                                        borderRadius: '0',
                                        border: 'none'
                                    }}>
                                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>{feat.icon}</span>
                                        {`${feat.value} ${feat.label}`}
                                    </div>
                                ))}
                                {booleanFeatures.filter(f => f.enabled).map((feat, i) => (
                                    <div key={`bool-${i}`} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        fontSize: '13px',
                                        color: 'rgba(255,255,255,0.8)',
                                        fontWeight: '400',
                                        background: 'transparent',
                                        padding: '0',
                                        borderRadius: '0',
                                        border: 'none'
                                    }}>
                                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>{feat.icon}</span>
                                        {feat.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Link
                            href={(billingCycle === 'yearly' && plan.stripeYearlyLink) ? plan.stripeYearlyLink : (plan.stripeLink || '/signup')}
                            target={(billingCycle === 'yearly' && plan.stripeYearlyLink) || plan.stripeLink ? '_blank' : undefined}
                            rel={(billingCycle === 'yearly' && plan.stripeYearlyLink) || plan.stripeLink ? 'noopener noreferrer' : undefined}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                padding: '14px',
                                background: isPopular ? 'linear-gradient(135deg, #693fe9, #8b5cf6)' : isDiamond ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'transparent',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '10px',
                                fontWeight: '600',
                                fontSize: '13px',
                                border: (isPopular || isDiamond) ? 'none' : '1px solid rgba(255,255,255,0.2)',
                                marginTop: 'auto',
                                boxShadow: isPopular ? '0 4px 16px rgba(105, 63, 233, 0.3)' : isDiamond ? '0 4px 16px rgba(245, 158, 11, 0.3)' : 'none'
                            }}>
                            {isFree ? 'Start Free' : isTrial ? 'Start Trial' : 'Get Started'} <IconRocket size={14} />
                        </Link>
                    </div>
                );
            })}
        </div>
    );
}
