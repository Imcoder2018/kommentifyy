'use client';

import React from 'react';
import Link from 'next/link';

// SVG Icon Components
const IconFire = ({ size = 16, color = '#f59e0b' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
        <path d="M12 23c-3.866 0-7-2.686-7-6 0-2.5 1.5-4.5 3-6 .5 2.5 2 3 2 3s-1-3 1-6c0 0 3 1 4 4 .5-1 1-2 1-2s2.5 3.5 2.5 7c0 3.314-2.634 6-6.5 6z"/>
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

const IconStar = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
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

// Types
interface PlanLimits {
    aiCommentsPerMonth: number;
    aiPostsPerMonth: number;
    monthlyLikes: number;
    monthlyShares: number;
    monthlyFollows: number;
    monthlyConnections: number;
}

interface LifetimeDeal {
    id: string;
    name: string;
    price: number;
    stripeLink?: string | null;
    limits: PlanLimits;
    monthlyImportCredits: number;
    lifetimeMaxSpots?: number | null;
    lifetimeSoldSpots?: number | null;
    lifetimeSpotsRemaining?: number | null;
}

interface LifetimeDealsProps {
    lifetimeDeals: LifetimeDeal[];
    loading: boolean;
    formatNumber: (num: number) => string;
    soldLifetimeSpots?: number;
    totalLifetimeSpots?: number;
}

export default function LifetimeDeals({ lifetimeDeals, loading, formatNumber, soldLifetimeSpots = 0, totalLifetimeSpots = 500 }: LifetimeDealsProps) {
    return (
        <section id="pricing" className="section-padding" style={{ background: '#0a0a0a', padding: '80px 60px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(245, 158, 11, 0.2))', border: '1px solid rgba(245, 158, 11, 0.4)', padding: '8px 20px', borderRadius: '20px', marginBottom: '20px' }}>
                        <IconFire size={18} color="#f59e0b" />
                        <span style={{ color: '#f59e0b', fontWeight: '600', fontSize: '13px' }}>🎁 30-Day Money-Back Guarantee — Pay Once, Use Forever</span>
                    </div>
                </div>
                <h2 className="section-title" style={{ fontSize: '38px', fontWeight: '700', textAlign: 'center', marginBottom: '16px' }}>
                    Lifetime Access<br/>
                    <span style={{ color: '#f59e0b' }}>One Payment. Forever Yours.</span>
                </h2>
                <p style={{ textAlign: 'center', fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '20px' }}>
                    Get unlimited access to Kommentify with a single payment. No recurring fees. No surprises. Ever.
                </p>

                {/* Progress Bar for Spots */}
                {lifetimeDeals.length > 0 && (
                    <div style={{ maxWidth: '500px', margin: '0 auto 40px auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                            <span style={{ color: '#ef4444', fontWeight: '600' }}>{soldLifetimeSpots} licenses sold</span>
                            <span style={{ color: '#22c55e', fontWeight: '600' }}>{totalLifetimeSpots - soldLifetimeSpots} remaining</span>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', height: '12px', overflow: 'hidden' }}>
                            <div style={{
                                background: 'linear-gradient(90deg, #ef4444, #f59e0b)',
                                height: '100%',
                                width: `${(soldLifetimeSpots / totalLifetimeSpots) * 100}%`,
                                borderRadius: '8px',
                                transition: 'width 0.5s ease',
                                boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)'
                            }}></div>
                        </div>
                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '8px', textAlign: 'center' }}>⚠️ When all spots are sold, this deal will never return</p>
                    </div>
                )}

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px' }}>
                        <div style={{ fontSize: '20px', color: 'rgba(255,255,255,0.5)' }}>Loading lifetime deals...</div>
                    </div>
                ) : lifetimeDeals.length > 0 ? (
                    <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(lifetimeDeals.length, 3)}, 1fr)`, gap: '24px', marginBottom: '40px' }}>
                        {lifetimeDeals.sort((a, b) => a.price - b.price).map((plan, index) => {
                            const isPopular = index === Math.floor(lifetimeDeals.length / 2) || lifetimeDeals.length === 1;
                            const spotsLeft = plan.lifetimeSpotsRemaining ?? (plan.lifetimeMaxSpots ? plan.lifetimeMaxSpots - (plan.lifetimeSoldSpots ?? 0) : 100);

                            const features = [
                                { icon: <IconMessage size={14} color="#693fe9" />, text: `${plan.limits.aiCommentsPerMonth >= 100000 ? 'Unlimited' : formatNumber(plan.limits.aiCommentsPerMonth)} AI Comments/mo` },
                                { icon: <IconEdit size={14} color="#8b5cf6" />, text: `${plan.limits.aiPostsPerMonth >= 100000 ? 'Unlimited' : formatNumber(plan.limits.aiPostsPerMonth)} AI Posts/mo` },
                                { icon: <IconStar size={14} color="#ef4444" />, text: `${plan.limits.monthlyLikes >= 100000 ? 'Unlimited' : formatNumber(plan.limits.monthlyLikes)} Auto Likes` },
                                { icon: <IconChart size={14} color="#10b981" />, text: `${plan.limits.monthlyShares >= 100000 ? 'Unlimited' : formatNumber(plan.limits.monthlyShares)} Auto Shares` },
                                { icon: <IconUsers size={14} color="#3b82f6" />, text: `${plan.limits.monthlyFollows >= 100000 ? 'Unlimited' : formatNumber(plan.limits.monthlyFollows)} Auto Follows` },
                                { icon: <IconHandshake size={14} color="#f59e0b" />, text: `${plan.limits.monthlyConnections >= 100000 ? 'Unlimited' : formatNumber(plan.limits.monthlyConnections)} Connections` },
                                plan.monthlyImportCredits > 0 ? { icon: <IconDownload size={14} color="#06b6d4" />, text: plan.monthlyImportCredits >= 100000 ? 'Unlimited Imports' : `${formatNumber(plan.monthlyImportCredits)} Imports` } : null,
                                { icon: <IconRocket size={14} color="#22c55e" />, text: 'Viral Posts Writer' },
                                { icon: <IconDatabase size={14} color="#8b5cf6" />, text: 'Added Sources (AI Posts & Comments)' },
                                { icon: <IconUser size={14} color="#f59e0b" />, text: 'Personalized Post Writer (Scan Profile)' },
                                { icon: <IconCalendar size={14} color="#3b82f6" />, text: 'Content Planner (7/30 Days)' },
                                { icon: <IconClock size={14} color="#10b981" />, text: 'Auto Scheduled Posts (Auto Pilot)' },
                                { icon: <IconRocket size={14} color="#22c55e" />, text: 'Lifetime Updates' },
                                { icon: <IconShield size={14} color="#3b82f6" />, text: 'Priority Support' },
                            ].filter(Boolean) as { icon: React.ReactNode; text: string; highlight?: boolean }[];

                            return (
                                <div key={plan.id} className="pricing-card" style={{
                                    padding: '32px',
                                    background: isPopular ? 'linear-gradient(180deg, rgba(245, 158, 11, 0.12) 0%, rgba(245, 158, 11, 0.03) 100%)' : 'rgba(255,255,255,0.02)',
                                    border: isPopular ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '20px',
                                    position: 'relative',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    boxShadow: isPopular ? '0 12px 40px rgba(245, 158, 11, 0.2)' : 'none'
                                }}>
                                    {isPopular && (
                                        <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: 'white', padding: '6px 18px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)' }}>
                                            <IconFire size={14} color="white" /> MOST POPULAR
                                        </div>
                                    )}

                                    {spotsLeft > 0 && spotsLeft < 50 && (
                                        <div style={{ position: 'absolute', top: '16px', right: '16px', background: spotsLeft < 20 ? '#ef4444' : '#f59e0b', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '600' }}>
                                            Only {spotsLeft} left!
                                        </div>
                                    )}

                                    <div style={{ marginBottom: '16px', paddingTop: isPopular ? '10px' : '0' }}>
                                        <div style={{ fontSize: '22px', fontWeight: '700', marginBottom: '4px', color: isPopular ? '#fbbf24' : 'white' }}>{plan.name}</div>
                                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>One-time payment</p>
                                    </div>

                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                            <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through' }}>
                                                ${plan.price === 69 ? '828' : plan.price === 149 ? '1788' : plan.price === 299 ? '3588' : (plan.price * 12).toFixed(0)}/year
                                            </span>
                                            <span style={{ background: '#22c55e', color: 'white', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>
                                                Save ${plan.price === 69 ? '759' : plan.price === 149 ? '1639' : plan.price === 299 ? '3289' : ((plan.price * 12) - plan.price).toFixed(0)}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                                            <span style={{ fontSize: '42px', fontWeight: '800', color: isPopular ? '#fbbf24' : 'white' }}>${plan.price}</span>
                                            <span style={{ fontSize: '14px', fontWeight: '400', color: 'rgba(255,255,255,0.5)' }}>once</span>
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#22c55e', marginTop: '4px' }}>Forever access • No recurring fees</div>
                                    </div>

                                    <div style={{ marginBottom: '20px', flex: 1 }}>
                                        <div style={{ fontSize: '10px', fontWeight: '600', color: 'rgba(255,255,255,0.5)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>What&apos;s Included</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {features.map((feat, i) => (
                                                <div key={i} style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    fontSize: '13px',
                                                    color: feat.highlight ? '#0077b5' : 'rgba(255,255,255,0.8)',
                                                    fontWeight: feat.highlight ? '600' : '400',
                                                    background: feat.highlight ? 'rgba(0, 119, 181, 0.1)' : 'transparent',
                                                    padding: feat.highlight ? '8px 10px' : '0',
                                                    borderRadius: feat.highlight ? '8px' : '0',
                                                    border: feat.highlight ? '1px solid rgba(0, 119, 181, 0.3)' : 'none'
                                                }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', background: feat.highlight ? 'rgba(0, 119, 181, 0.2)' : 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>{feat.icon}</span>
                                                    {feat.text}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* AI Comments Refill Info */}
                                    <div style={{
                                        background: 'linear-gradient(135deg, rgba(105, 63, 233, 0.1), rgba(139, 92, 246, 0.1))',
                                        border: '1px solid rgba(105, 63, 233, 0.3)',
                                        borderRadius: '12px',
                                        padding: '12px',
                                        marginBottom: '16px',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ fontSize: '12px', color: '#a78bfa', marginBottom: '2px' }}>💎 AI Comments Refill</div>
                                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#8b5cf6' }}>
                                            $5 for 200 AI Comments
                                        </div>
                                        <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '2px' }}>
                                            Purchase additional AI comments anytime
                                        </div>
                                    </div>

                                    <Link
                                        href={plan.stripeLink || '/signup'}
                                        target={plan.stripeLink ? '_blank' : undefined}
                                        rel={plan.stripeLink ? 'noopener noreferrer' : undefined}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            padding: '16px',
                                            background: isPopular ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'linear-gradient(135deg, #693fe9, #8b5cf6)',
                                            color: 'white',
                                            textDecoration: 'none',
                                            borderRadius: '12px',
                                            fontWeight: '700',
                                            fontSize: '14px',
                                            marginTop: 'auto',
                                            boxShadow: isPopular ? '0 6px 20px rgba(245, 158, 11, 0.3)' : '0 6px 20px rgba(105, 63, 233, 0.3)'
                                        }}>
                                        🚀 Get Lifetime Access
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                ) : null}

                <div className="trust-badges" style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginTop: '40px', flexWrap: 'wrap' }}>
                    {['30-Day Money-Back', 'Cancel Anytime', 'Secure Payment'].map((badge, i) => (
                        <div key={i} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12" />
                            </svg> {badge}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
