'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';

// SVG Icon Components
const IconProps = { size: 16, color: 'currentColor' };
type IconType = { size?: number; color?: string };

const IconRocket = ({ size = 16, color = '#693fe9' }: IconType) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
    </svg>
);

const IconCheck = ({ size = 16, color = '#10b981' }: IconType) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5"/>
    </svg>
);

const IconStar = ({ size = 16, color = '#f59e0b' }: IconType) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
);

const IconFire = ({ size = 16, color = '#f59e0b' }: IconType) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
        <path d="M12 23c-3.866 0-7-2.686-7-6 0-2.5 1.5-4.5 3-6 .5 2.5 2 3 2 3s-1-3 1-6c0 0 3 1 4 4 .5-1 1-2 1-2s2.5 3.5 2.5 7c0 3.314-2.634 6-6.5 6z"/>
    </svg>
);

const IconMessage = ({ size = 16, color = 'currentColor' }: IconType) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
    </svg>
);

const IconEdit = ({ size = 16, color = 'currentColor' }: IconType) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
    </svg>
);

const IconUsers = ({ size = 16, color = 'currentColor' }: IconType) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
);

const IconCalendar = ({ size = 16, color = 'currentColor' }: IconType) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>
    </svg>
);

const IconChart = ({ size = 16, color = 'currentColor' }: IconType) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
    </svg>
);

const IconZap = ({ size = 16, color = 'currentColor' }: IconType) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>
    </svg>
);

const IconDownload = ({ size = 16, color = 'currentColor' }: IconType) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>
    </svg>
);

const IconMenu = ({ size = 16, color = 'currentColor' }: IconType) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
    </svg>
);

const IconX = ({ size = 16, color = 'currentColor' }: IconType) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
);

const IconShield = ({ size = 16, color = 'currentColor' }: IconType) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
    </svg>
);

const IconHandshake = ({ size = 16, color = 'currentColor' }: IconType) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88"/><path d="m16 16 2 2"/><path d="M4 6h16v10H4V6z"/>
    </svg>
);

const IconBot = ({ size = 16, color = 'currentColor' }: IconType) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>
    </svg>
);

interface Plan {
    id: string;
    name: string;
    price: number;
    period: string;
    isLifetime: boolean;
    lifetimeMaxSpots: number;
    lifetimeSoldSpots: number;
    lifetimeSpotsRemaining: number | null;
    stripeLink: string | null;
    limits: {
        monthlyComments: number;
        monthlyLikes: number;
        monthlyShares: number;
        monthlyFollows: number;
        monthlyConnections: number;
        aiPostsPerMonth: number;
        aiCommentsPerMonth: number;
        aiTopicLinesPerMonth: number;
    };
    monthlyImportCredits: number;
    features: {
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
    };
}

export default function LifetimeDealPage() {
    const [lifetimeDeals, setLifetimeDeals] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalSpots, setTotalSpots] = useState(200);
    const [soldSpots, setSoldSpots] = useState(0);
    const [timeLeft, setTimeLeft] = useState({ days: 14, hours: 23, minutes: 59, seconds: 59 });
    const [aiCommentsPerDollar, setAiCommentsPerDollar] = useState(100);

    useEffect(() => {
        fetch('/api/plans')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setLifetimeDeals(data.lifetimeDeals || []);
                    const ltdDeals = data.lifetimeDeals || [];
                    const total = ltdDeals.reduce((sum: number, p: Plan) => sum + (p.lifetimeMaxSpots || 100), 0);
                    const sold = ltdDeals.reduce((sum: number, p: Plan) => sum + (p.lifetimeSoldSpots || 0), 0);
                    setTotalSpots(total || 200);
                    setSoldSpots(sold);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));

        // Fetch settings for AI comments per dollar
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setAiCommentsPerDollar(data.settings.aiCommentsPerDollar || 100);
                }
            })
            .catch(() => console.log('Failed to fetch settings'));
    }, []);

    // Countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
                if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
                if (prev.days > 0) return { days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
                return prev;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const spotsRemaining = totalSpots - soldSpots;
    const progressPercent = (soldSpots / totalSpots) * 100;

    return (
        <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', background: 'linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)', color: 'white', minHeight: '100vh' }}>
            <style>{`
                @media (max-width: 1024px) {
                    .lifetime-grid { grid-template-columns: 1fr 1fr !important; }
                    .features-grid { grid-template-columns: 1fr 1fr !important; }
                }
                @media (max-width: 768px) {
                    .desktop-nav { display: none !important; }
                    .mobile-menu-btn { display: flex !important; }
                    .hero-section { padding: 40px 20px !important; }
                    .hero-title { font-size: 32px !important; line-height: 1.2 !important; }
                    .hero-subtitle { font-size: 16px !important; }
                    .countdown-container { flex-wrap: wrap !important; gap: 10px !important; }
                    .countdown-item { padding: 12px 16px !important; min-width: 65px !important; }
                    .countdown-value { font-size: 24px !important; }
                    .countdown-label { font-size: 10px !important; }
                    .section-padding { padding: 50px 20px !important; }
                    .lifetime-grid { grid-template-columns: 1fr !important; }
                    .features-grid { grid-template-columns: 1fr !important; }
                    .plan-card { padding: 25px !important; transform: scale(1) !important; }
                    .plan-card-popular { transform: scale(1) !important; }
                    .plan-title { font-size: 22px !important; }
                    .plan-price { font-size: 42px !important; }
                    .urgency-badge { padding: 10px 16px !important; font-size: 12px !important; }
                    .faq-section { padding: 50px 20px !important; }
                    .faq-title { font-size: 28px !important; }
                    .section-title { font-size: 28px !important; }
                    .final-cta { padding: 60px 20px !important; }
                    .final-cta-title { font-size: 32px !important; }
                    .cta-button { padding: 16px 40px !important; font-size: 16px !important; }
                    .progress-bar-container { margin: 0 auto 40px auto !important; }
                }
                @media (max-width: 480px) {
                    .hero-title { font-size: 26px !important; }
                    .countdown-item { min-width: 55px !important; padding: 10px 12px !important; }
                    .countdown-value { font-size: 20px !important; }
                    .plan-price { font-size: 36px !important; }
                    .section-title { font-size: 24px !important; }
                    .final-cta-title { font-size: 26px !important; }
                }
            `}</style>
            
            {/* Shared Header Component */}
            <Header showBanner={true} />

            {/* Hero Section */}
            <section className="hero-section" style={{ padding: '80px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                {/* Animated background effects */}
                <div style={{ position: 'absolute', top: '10%', left: '5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)' }}></div>
                <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(239, 68, 68, 0.1) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(80px)' }}></div>

                <div style={{ position: 'relative', zIndex: 1, maxWidth: '1000px', margin: '0 auto' }}>
                    {/* Urgency Badge */}
                    <div className="urgency-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(245, 158, 11, 0.2))', border: '1px solid rgba(245, 158, 11, 0.4)', padding: '12px 28px', borderRadius: '30px', marginBottom: '30px' }}>
                        <IconFire size={20} color="#f59e0b" />
                        <span style={{ color: '#f59e0b', fontWeight: '600', fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase' }}>Limited Time Offer — Only {spotsRemaining} Spots Left!</span>
                    </div>

                    <h1 className="hero-title" style={{ fontSize: '64px', fontWeight: '800', marginBottom: '24px', lineHeight: '1.1' }}>
                        <span style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Lifetime Access</span>
                        <br />
                        <span style={{ color: 'white' }}>One Payment. Forever Yours.</span>
                    </h1>

                    <p className="hero-subtitle" style={{ fontSize: '22px', opacity: 0.8, marginBottom: '40px', lineHeight: '1.6', maxWidth: '700px', margin: '0 auto 40px auto' }}>
                        Get unlimited access to Kommentify&apos;s complete LinkedIn automation suite with a single payment. 
                        <strong style={{ color: '#f59e0b' }}> No recurring fees. No surprises. Ever.</strong>
                    </p>

                    {/* Countdown Timer */}
                    <div className="countdown-container" style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '50px' }}>
                        {[
                            { value: timeLeft.days, label: 'Days' },
                            { value: timeLeft.hours, label: 'Hours' },
                            { value: timeLeft.minutes, label: 'Minutes' },
                            { value: timeLeft.seconds, label: 'Seconds' },
                        ].map((item, i) => (
                            <div key={i} className="countdown-item" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '20px 30px', minWidth: '100px' }}>
                                <div className="countdown-value" style={{ fontSize: '48px', fontWeight: '700', color: '#f59e0b' }}>{String(item.value).padStart(2, '0')}</div>
                                <div className="countdown-label" style={{ fontSize: '12px', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '2px' }}>{item.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Progress Bar */}
                    <div className="progress-bar-container" style={{ maxWidth: '600px', margin: '0 auto 60px auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
                            <span style={{ color: '#ef4444', fontWeight: '600' }}>{soldSpots} licenses sold</span>
                            <span style={{ color: '#22c55e', fontWeight: '600' }}>{spotsRemaining} remaining</span>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '10px', height: '16px', overflow: 'hidden' }}>
                            <div style={{ 
                                background: 'linear-gradient(90deg, #ef4444, #f59e0b)', 
                                height: '100%', 
                                width: `${progressPercent}%`,
                                borderRadius: '10px',
                                transition: 'width 0.5s ease',
                                boxShadow: '0 0 20px rgba(245, 158, 11, 0.5)'
                            }}></div>
                        </div>
                        <p style={{ fontSize: '13px', opacity: 0.6, marginTop: '10px' }}>⚠️ When {totalSpots} spots are sold, this deal will never return</p>
                    </div>
                </div>
            </section>

            {/* Lifetime Deal Cards */}
            <section className="section-padding" style={{ padding: '0 60px 100px 60px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px' }}>
                            <div style={{ fontSize: '24px', color: 'rgba(255,255,255,0.5)' }}>Loading lifetime deals...</div>
                        </div>
                    ) : lifetimeDeals.length > 0 ? (
                        <div className="lifetime-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(lifetimeDeals.length, 3)}, 1fr)`, gap: '30px' }}>
                            {lifetimeDeals.sort((a, b) => a.price - b.price).map((plan, index) => {
                                const isPopular = index === Math.floor(lifetimeDeals.length / 2) || lifetimeDeals.length === 1;
                                const spotsLeft = plan.lifetimeSpotsRemaining ?? (plan.lifetimeMaxSpots ? plan.lifetimeMaxSpots - plan.lifetimeSoldSpots : 100);
                                
                                const features = [
                                    plan.features.aiContent ? { icon: <IconEdit size={14} color="#8b5cf6" />, text: 'AI Post Writer' } : null,
                                    { icon: <IconEdit size={14} color="#8b5cf6" />, text: `${plan.limits.aiPostsPerMonth >= 100000 ? 'Unlimited' : plan.limits.aiPostsPerMonth} AI Posts/month` },
                                    { icon: <IconMessage size={14} color="#693fe9" />, text: `${plan.limits.aiCommentsPerMonth >= 100000 ? 'Unlimited' : plan.limits.aiCommentsPerMonth} AI Comments/month` },
                                    { icon: <IconStar size={14} color="#ef4444" />, text: `${plan.limits.monthlyLikes >= 100000 ? 'Unlimited' : plan.limits.monthlyLikes} Auto Likes` },
                                    { icon: <IconChart size={14} color="#10b981" />, text: `${plan.limits.monthlyShares >= 100000 ? 'Unlimited' : plan.limits.monthlyShares} Auto Shares` },
                                    { icon: <IconUsers size={14} color="#3b82f6" />, text: `${plan.limits.monthlyFollows >= 100000 ? 'Unlimited' : plan.limits.monthlyFollows} Auto Follows` },
                                    { icon: <IconHandshake size={14} color="#f59e0b" />, text: `${plan.limits.monthlyConnections >= 100000 ? 'Unlimited' : plan.limits.monthlyConnections} Connection Requests` },
                                    plan.monthlyImportCredits >= 100000 ? { icon: <IconDownload size={14} color="#06b6d4" />, text: 'Unlimited Profile Imports' } : plan.monthlyImportCredits > 0 ? { icon: <IconDownload size={14} color="#06b6d4" />, text: `${plan.monthlyImportCredits} Profile Imports` } : null,
                                    plan.features.scheduling ? { icon: <IconCalendar size={14} color="#a855f7" />, text: 'Post Scheduling' } : null,
                                    plan.features.automationScheduling ? { icon: <IconZap size={14} color="#eab308" />, text: 'Automation Scheduling' } : null,
                                    { icon: <IconRocket size={14} color="#22c55e" />, text: 'Lifetime Updates' },
                                    { icon: <IconShield size={14} color="#3b82f6" />, text: 'Priority Support' },
                                    { icon: <IconCheck size={14} color="#10b981" />, text: 'No Monthly Fees Ever' },
                                ].filter(Boolean) as { icon: JSX.Element; text: string }[];
                                
                                return (
                                    <div key={plan.id} className={`plan-card ${isPopular ? 'plan-card-popular' : ''}`} style={{ 
                                        padding: '40px', 
                                        background: isPopular ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(239, 68, 68, 0.05))' : 'rgba(255,255,255,0.03)', 
                                        border: isPopular ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)', 
                                        borderRadius: '24px', 
                                        position: 'relative',
                                        transform: isPopular ? 'scale(1.05)' : 'scale(1)',
                                        boxShadow: isPopular ? '0 20px 60px rgba(245, 158, 11, 0.2)' : 'none'
                                    }}>
                                        {isPopular && (
                                            <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', padding: '8px 24px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)' }}>
                                                🔥 MOST POPULAR
                                            </div>
                                        )}
                                        
                                        {spotsLeft > 0 && spotsLeft < 50 && (
                                            <div style={{ position: 'absolute', top: '20px', right: '20px', background: spotsLeft < 20 ? '#ef4444' : '#f59e0b', padding: '6px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                                                Only {spotsLeft} left!
                                            </div>
                                        )}

                                        <h3 className="plan-title" style={{ fontSize: '28px', fontWeight: '700', marginBottom: '10px' }}>{plan.name}</h3>
                                        
                                        <div style={{ marginBottom: '20px' }}>
                                            <span style={{ fontSize: '16px', textDecoration: 'line-through', opacity: 0.5, marginRight: '10px' }}>${(plan.price * 12).toFixed(0)}/year</span>
                                            <span style={{ background: '#22c55e', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>Save ${((plan.price * 12) - plan.price).toFixed(0)}</span>
                                        </div>
                                        
                                        <div className="plan-price" style={{ fontSize: '56px', fontWeight: '800', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '24px', verticalAlign: 'top' }}>$</span>{plan.price}
                                        </div>
                                        <div style={{ fontSize: '16px', opacity: 0.7, marginBottom: '30px' }}>One-Time Payment • Forever Access</div>
                                        
                                        {/* AI Comments Refill Info */}
                                        <div style={{
                                            background: 'linear-gradient(135deg, rgba(105, 63, 233, 0.1), rgba(139, 92, 246, 0.1))',
                                            border: '1px solid rgba(105, 63, 233, 0.3)',
                                            borderRadius: '12px',
                                            padding: '16px',
                                            marginBottom: '30px',
                                            textAlign: 'center'
                                        }}>
                                            <div style={{ fontSize: '14px', color: '#a78bfa', marginBottom: '4px' }}>💎 AI Comments Refill</div>
                                            <div style={{ fontSize: '20px', fontWeight: '700', color: '#8b5cf6' }}>
                                                {aiCommentsPerDollar} AI Comments / $1
                                            </div>
                                            <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>
                                                Purchase additional AI comments anytime
                                            </div>
                                        </div>
                                        
                                        <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginBottom: '30px' }}>
                                            {features.map((f, j) => (
                                                <li key={j} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>{f.icon}</span>
                                                    {f.text}
                                                </li>
                                            ))}
                                        </ul>
                                        
                                        <a 
                                            href={plan.stripeLink || '/signup'}
                                            target={plan.stripeLink ? '_blank' : undefined}
                                            rel={plan.stripeLink ? 'noopener noreferrer' : undefined}
                                            style={{ 
                                                display: 'block', 
                                                width: '100%', 
                                                padding: '18px', 
                                                background: isPopular ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'linear-gradient(135deg, #693fe9, #5835c7)', 
                                                color: 'white', 
                                                border: 'none', 
                                                borderRadius: '12px', 
                                                fontSize: '16px', 
                                                fontWeight: '700', 
                                                cursor: 'pointer',
                                                textDecoration: 'none',
                                                textAlign: 'center',
                                                boxShadow: isPopular ? '0 10px 30px rgba(245, 158, 11, 0.3)' : '0 10px 30px rgba(105, 63, 233, 0.3)'
                                            }}
                                        >
                                            🚀 Get Lifetime Access Now
                                        </a>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px' }}>
                            <h3 style={{ fontSize: '32px', marginBottom: '16px' }}>🎉 Lifetime Deal Coming Soon!</h3>
                            <p style={{ fontSize: '18px', opacity: 0.7 }}>We&apos;re preparing an exclusive lifetime offer. Check back soon!</p>
                        </div>
                    )}
                </div>
            </section>

            {/* What's Included Section */}
            <section className="section-padding" style={{ padding: '100px 60px', background: 'rgba(0,0,0,0.3)' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 className="section-title" style={{ fontSize: '42px', fontWeight: '700', marginBottom: '20px' }}>What You Get Forever</h2>
                    <p style={{ fontSize: '18px', opacity: 0.7, marginBottom: '60px' }}>One payment unlocks the entire Kommentify ecosystem</p>
                    
                    <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                        {[
                            { icon: <IconBot size={32} color="#693fe9" />, title: 'AI-Powered Comments', desc: 'Generate contextual, engaging comments automatically using advanced AI' },
                            { icon: <IconEdit size={32} color="#8b5cf6" />, title: 'AI Post Writer', desc: 'Create viral LinkedIn posts with our intelligent content generator' },
                            { icon: <IconChart size={32} color="#10b981" />, title: 'Smart Analytics', desc: 'Track your growth with detailed engagement metrics and insights' },
                            { icon: <IconUsers size={32} color="#3b82f6" />, title: 'Network Automation', desc: 'Automatically connect with your ideal audience on LinkedIn' },
                            { icon: <IconCalendar size={32} color="#a855f7" />, title: 'Post Scheduling', desc: 'Schedule posts for optimal times to maximize reach' },
                            { icon: <IconRocket size={32} color="#22c55e" />, title: 'Lifetime Updates', desc: 'Get all future features and improvements at no extra cost' },
                        ].map((item, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '30px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', width: 'fit-content', margin: '0 auto 16px auto' }}>{item.icon}</div>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px' }}>{item.title}</h3>
                                <p style={{ fontSize: '14px', opacity: 0.7, lineHeight: '1.6' }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="faq-section" style={{ padding: '100px 60px' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 className="faq-title section-title" style={{ fontSize: '42px', fontWeight: '700', marginBottom: '60px', textAlign: 'center' }}>Frequently Asked Questions</h2>
                    
                    {[
                        { q: 'Is this really a one-time payment?', a: 'Yes! You pay once and get lifetime access to Kommentify. No hidden fees, no recurring charges, ever.' },
                        { q: 'Will I get future updates?', a: 'Absolutely! All future features, improvements, and updates are included at no additional cost.' },
                        { q: 'What happens after the spots are sold out?', a: 'Once all lifetime licenses are sold, this offer will never return. Kommentify will only be available as a monthly subscription.' },
                        { q: 'Is there a money-back guarantee?', a: 'Yes, we offer a 30-day money-back guarantee. If you&apos;re not satisfied, we&apos;ll refund your purchase, no questions asked.' },
                        { q: 'Can I use it on multiple LinkedIn accounts?', a: 'Each license is for one LinkedIn account. For multiple accounts, you&apos;ll need separate licenses.' },
                    ].map((item, i) => (
                        <div key={i} style={{ marginBottom: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ padding: '20px 24px', fontWeight: '600', fontSize: '16px' }}>{item.q}</div>
                            <div style={{ padding: '0 24px 20px 24px', opacity: 0.7, fontSize: '14px', lineHeight: '1.6' }}>{item.a}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Final CTA */}
            <section className="final-cta" style={{ padding: '100px 60px', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(239, 68, 68, 0.1))', textAlign: 'center' }}>
                <h2 className="final-cta-title" style={{ fontSize: '48px', fontWeight: '700', marginBottom: '20px' }}>Don&apos;t Miss This Opportunity</h2>
                <p style={{ fontSize: '20px', opacity: 0.8, marginBottom: '40px' }}>
                    Only <span style={{ color: '#f59e0b', fontWeight: '700' }}>{spotsRemaining} spots</span> remaining. Once they&apos;re gone, they&apos;re gone forever.
                </p>
                <a href={lifetimeDeals.length > 0 ? (lifetimeDeals[Math.floor(lifetimeDeals.length / 2)]?.stripeLink || '/signup') : '/signup'} target={lifetimeDeals.length > 0 && lifetimeDeals[Math.floor(lifetimeDeals.length / 2)]?.stripeLink ? '_blank' : undefined} rel={lifetimeDeals.length > 0 && lifetimeDeals[Math.floor(lifetimeDeals.length / 2)]?.stripeLink ? 'noopener noreferrer' : undefined} className="cta-button" style={{ display: 'inline-block', padding: '20px 60px', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: 'white', borderRadius: '12px', fontSize: '18px', fontWeight: '700', textDecoration: 'none', boxShadow: '0 10px 40px rgba(245, 158, 11, 0.4)' }}>
                    🚀 Get Lifetime Access Now
                </a>
            </section>

            {/* Shared Footer Component */}
            <Footer />
            
            {/* WhatsApp Chat Button */}
            <WhatsAppButton />
        </div>
    );
}
