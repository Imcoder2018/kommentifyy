'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';

// Icon Components
const IconCheck = ({ size = 16, color = '#10b981' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5"/>
    </svg>
);

const IconX = ({ size = 16, color = '#ef4444' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
);

const IconFire = ({ size = 16, color = '#f59e0b' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
        <path d="M12 23c-3.866 0-7-2.686-7-6 0-2.5 1.5-4.5 3-6 .5 2.5 2 3 2 3s-1-3 1-6c0 0 3 1 4 4 .5-1 1-2 1-2s2.5 3.5 2.5 7c0 3.314-2.634 6-6.5 6z"/>
    </svg>
);

const IconRocket = ({ size = 16, color = '#693fe9' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
    </svg>
);

const IconStar = ({ size = 16, color = '#f59e0b' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
);

const IconCrown = ({ size = 16, color = '#0077b5' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>
    </svg>
);

interface Plan {
    id: string;
    name: string;
    price: number;
    stripeLink: string | null;
    isLifetime: boolean;
    isTrialPlan: boolean;
    isDefaultFreePlan: boolean;
    lifetimeMaxSpots: number;
    lifetimeSoldSpots: number;
    lifetimeSpotsRemaining: number | null;
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

export default function PricingPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [lifetimeDeals, setLifetimeDeals] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [totalSpots, setTotalSpots] = useState(200);
    const [soldSpots, setSoldSpots] = useState(0);
    const [aiCommentsPerDollar, setAiCommentsPerDollar] = useState(100);

    useEffect(() => {
        fetch('/api/plans')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const allPlans = data.plans || [];
                    const isLifetimePlan = (p: Plan) => {
                        const nameLower = p.name.toLowerCase();
                        return p.isLifetime || nameLower.includes('lifetime') || nameLower.includes('life time');
                    };
                    const regularPlans = allPlans.filter((p: Plan) => !isLifetimePlan(p) && !p.isDefaultFreePlan);
                    setPlans(regularPlans);
                    
                    const apiLifetimeDeals = data.lifetimeDeals || [];
                    setLifetimeDeals(apiLifetimeDeals);
                    
                    const total = apiLifetimeDeals.reduce((sum: number, p: Plan) => sum + (p.lifetimeMaxSpots || 100), 0);
                    const sold = apiLifetimeDeals.reduce((sum: number, p: Plan) => sum + (p.lifetimeSoldSpots || 0), 0);
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

    const formatNumber = (num: number) => {
        if (num >= 100000) return 'Unlimited';
        return num.toLocaleString();
    };

    const spotsRemaining = totalSpots - soldSpots;

    const faqItems = [
        { q: 'Can I upgrade from Free to paid?', a: 'Yes! You can upgrade to any paid plan anytime from your dashboard. Your usage limits will be instantly increased.' },
        { q: "What's the difference between monthly and lifetime?", a: 'Monthly plans require recurring payments. Lifetime plans are a one-time payment that gives you permanent access forever with all future updates included.' },
        { q: 'Do lifetime users get updates?', a: 'Yes! Lifetime users receive all future features, improvements, and updates at no additional cost. You\'re locked in forever.' },
        { q: 'Can I cancel my subscription anytime?', a: 'Yes, you can cancel your monthly subscription anytime from your dashboard. No questions asked, no hidden fees.' },
        { q: 'Is my LinkedIn account safe?', a: 'Absolutely! Kommentify uses human-like delays, random intervals, and browser-based automation. Your data never leaves your browser, making it the safest LinkedIn tool available.' },
    ];

    return (
        <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', background: '#0a0a0a', color: 'white', minHeight: '100vh' }}>
            <style>{`
                @media (max-width: 968px) {
                    .pricing-grid { grid-template-columns: 1fr !important; }
                    .lifetime-grid { grid-template-columns: 1fr !important; }
                    .section-padding { padding: 60px 20px !important; }
                    .hero-title { font-size: 32px !important; }
                }
            `}</style>
            
            <Header showBanner={true} />

            {/* Hero Section */}
            <section className="section-padding" style={{ padding: '80px 60px', textAlign: 'center', background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 100%)' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h1 className="hero-title" style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px' }}>
                        Kommentify Pricing<br/>
                        <span style={{ color: '#693fe9' }}>Start Free or Get Lifetime Access</span>
                    </h1>
                    <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.6)', marginBottom: '30px' }}>
                        Choose the perfect plan for your LinkedIn growth. No hidden fees, cancel anytime.
                    </p>
                </div>
            </section>

            {/* Section 1: Monthly Plans */}
            <section className="section-padding" style={{ padding: '60px', background: '#0a0a0a' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '12px' }}>Monthly Plans</h2>
                        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)' }}>Flexible monthly billing, cancel anytime</p>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px' }}>Loading plans...</div>
                    ) : (
                        <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                            {/* Starter Package */}
                            <div style={{ 
                                padding: '32px', 
                                background: 'rgba(255,255,255,0.02)', 
                                border: '1px solid rgba(255,255,255,0.1)', 
                                borderRadius: '20px', 
                                position: 'relative'
                            }}>
                                <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px', color: 'white' }}>Starter</h3>
                                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: '0 0 24px 0' }}>For growing professionals</p>
                                <div style={{ marginBottom: '24px' }}>
                                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through', marginRight: '6px' }}>$29</span>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                                        <span style={{ fontSize: '42px', fontWeight: '800', color: 'white' }}>$9</span>
                                        <span style={{ fontSize: '16px', fontWeight: '400', color: 'rgba(255,255,255,0.5)' }}>/mo</span>
                                    </div>
                                </div>
                                
                                <div style={{ marginBottom: '24px' }}>
                                    <div style={{ fontSize: '10px', fontWeight: '600', color: 'rgba(255,255,255,0.5)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Monthly Limits</div>
                                    {[
                                        { label: 'AI Comments', value: '200' },
                                        { label: 'Monthly Likes', value: '500' },
                                        { label: 'Monthly Shares', value: '500' },
                                        { label: 'Monthly Follows', value: '500' },
                                        { label: 'Connections', value: '100' },
                                        { label: 'AI Posts', value: '15' },
                                        { label: 'Topic Lines', value: '20' },
                                        { label: 'Import Credits', value: '50' },
                                    ].map((item, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                                            <IconCheck size={16} color="#10b981" /> <span style={{ fontWeight: '600' }}>{item.value}</span> {item.label}
                                        </div>
                                    ))}
                                </div>
                                
                                <div style={{ marginBottom: '24px' }}>
                                    <div style={{ fontSize: '10px', fontWeight: '600', color: 'rgba(255,255,255,0.5)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Features</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                        {['Auto Like', 'Auto Comment', 'Auto Follow', 'AI Content', 'AI Topics', 'Viral Posts Writer', 'Added Sources', 'Personalized Posts', 'Content Planner', 'Auto Scheduling', 'Network Scheduling', 'Analytics', 'Import Profiles'].map((feature, i) => (
                                            <span key={i} style={{ 
                                                display: 'inline-flex', 
                                                alignItems: 'center', 
                                                gap: '4px', 
                                                padding: '4px 8px', 
                                                borderRadius: '16px', 
                                                fontSize: '10px',
                                                fontWeight: '500',
                                                background: 'rgba(16, 185, 129, 0.12)',
                                                color: '#10b981',
                                                border: '1px solid rgba(16, 185, 129, 0.25)'
                                            }}>
                                                <IconCheck size={11} color="#10b981" /> {feature}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* AI Comments Refill Info */}
                                <div style={{
                                    background: 'linear-gradient(135deg, rgba(105, 63, 233, 0.1), rgba(139, 92, 246, 0.1))',
                                    border: '1px solid rgba(105, 63, 233, 0.3)',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    marginBottom: '24px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '14px', color: '#a78bfa', marginBottom: '4px' }}>💎 AI Comments Refill</div>
                                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#8b5cf6' }}>
                                        $5 for 200 AI Comments
                                    </div>
                                    <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>
                                        Purchase additional AI comments anytime
                                    </div>
                                </div>
                                
                                <Link href={plans.find(p => p.name.toLowerCase().includes('starter'))?.stripeLink || '/signup'} target={plans.find(p => p.name.toLowerCase().includes('starter'))?.stripeLink ? '_blank' : undefined} style={{
                                    display: 'block',
                                    width: '100%',
                                    padding: '14px',
                                    background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    color: 'white',
                                    textDecoration: 'none',
                                    borderRadius: '12px',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    textAlign: 'center'
                                }}>
                                    Get Started
                                </Link>
                            </div>

                            {/* Professional Package */}
                            <div style={{ 
                                padding: '32px', 
                                background: 'linear-gradient(180deg, rgba(105, 63, 233, 0.12) 0%, rgba(105, 63, 233, 0.04) 100%)', 
                                border: '2px solid #693fe9', 
                                borderRadius: '20px', 
                                position: 'relative'
                            }}>
                                <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #693fe9, #8b5cf6)', color: 'white', padding: '6px 16px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                                    <IconStar size={12} color="white" /> MOST POPULAR
                                </div>
                                
                                <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px', color: '#a78bfa' }}>Professional</h3>
                                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: '0 0 24px 0' }}>For growing professionals</p>
                                <div style={{ marginBottom: '24px' }}>
                                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through', marginRight: '6px' }}>$58</span>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                                        <span style={{ fontSize: '42px', fontWeight: '800', color: '#a78bfa' }}>$29</span>
                                        <span style={{ fontSize: '16px', fontWeight: '400', color: 'rgba(255,255,255,0.5)' }}>/mo</span>
                                    </div>
                                </div>
                                
                                <div style={{ marginBottom: '24px' }}>
                                    <div style={{ fontSize: '10px', fontWeight: '600', color: 'rgba(255,255,255,0.5)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Monthly Limits</div>
                                    {[
                                        { label: 'AI Comments', value: '500' },
                                        { label: 'Monthly Likes', value: '1,000' },
                                        { label: 'Monthly Shares', value: '1,000' },
                                        { label: 'Monthly Follows', value: '1,000' },
                                        { label: 'Connections', value: '1,000' },
                                        { label: 'AI Posts', value: '40' },
                                        { label: 'Topic Lines', value: '60' },
                                        { label: 'Import Credits', value: '500' },
                                    ].map((item, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                                            <IconCheck size={16} color="#10b981" /> <span style={{ fontWeight: '600' }}>{item.value}</span> {item.label}
                                        </div>
                                    ))}
                                </div>
                                
                                <div style={{ marginBottom: '24px' }}>
                                    <div style={{ fontSize: '10px', fontWeight: '600', color: 'rgba(255,255,255,0.5)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Features</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                        {['Auto Like', 'Auto Comment', 'Auto Follow', 'AI Content', 'AI Topics', 'Viral Posts Writer', 'Added Sources', 'Personalized Posts', 'Content Planner', 'Auto Scheduling', 'Network Scheduling', 'Analytics', 'Import Profiles'].map((feature, i) => (
                                            <span key={i} style={{ 
                                                display: 'inline-flex', 
                                                alignItems: 'center', 
                                                gap: '4px', 
                                                padding: '4px 8px', 
                                                borderRadius: '16px', 
                                                fontSize: '10px',
                                                fontWeight: '500',
                                                background: 'rgba(16, 185, 129, 0.12)',
                                                color: '#10b981',
                                                border: '1px solid rgba(16, 185, 129, 0.25)'
                                            }}>
                                                <IconCheck size={11} color="#10b981" /> {feature}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* AI Comments Refill Info */}
                                <div style={{
                                    background: 'linear-gradient(135deg, rgba(105, 63, 233, 0.1), rgba(139, 92, 246, 0.1))',
                                    border: '1px solid rgba(105, 63, 233, 0.3)',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    marginBottom: '24px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '14px', color: '#a78bfa', marginBottom: '4px' }}>💎 AI Comments Refill</div>
                                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#8b5cf6' }}>
                                        $5 for 200 AI Comments
                                    </div>
                                    <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>
                                        Purchase additional AI comments anytime
                                    </div>
                                </div>
                                
                                <Link href={plans.find(p => p.name.toLowerCase().includes('professional') || p.name.toLowerCase().includes('gold'))?.stripeLink || '/signup'} target={plans.find(p => p.name.toLowerCase().includes('professional') || p.name.toLowerCase().includes('gold'))?.stripeLink ? '_blank' : undefined} style={{
                                    display: 'block',
                                    width: '100%',
                                    padding: '14px',
                                    background: 'linear-gradient(135deg, #693fe9, #8b5cf6)',
                                    border: 'none',
                                    color: 'white',
                                    textDecoration: 'none',
                                    borderRadius: '12px',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    textAlign: 'center'
                                }}>
                                    Get Started
                                </Link>
                            </div>

                            {/* Agency Package */}
                            <div style={{ 
                                padding: '32px', 
                                background: 'rgba(255,255,255,0.02)', 
                                border: '1px solid rgba(255,255,255,0.1)', 
                                borderRadius: '20px', 
                                position: 'relative'
                            }}>
                                <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px', color: 'white' }}>Agency</h3>
                                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: '0 0 24px 0' }}>For growing professionals</p>
                                <div style={{ marginBottom: '24px' }}>
                                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through', marginRight: '6px' }}>$78</span>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                                        <span style={{ fontSize: '42px', fontWeight: '800', color: 'white' }}>$39</span>
                                        <span style={{ fontSize: '16px', fontWeight: '400', color: 'rgba(255,255,255,0.5)' }}>/mo</span>
                                    </div>
                                </div>
                                
                                <div style={{ marginBottom: '24px' }}>
                                    <div style={{ fontSize: '10px', fontWeight: '600', color: 'rgba(255,255,255,0.5)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Monthly Limits</div>
                                    {[
                                        { label: 'AI Comments', value: '1,000' },
                                        { label: 'Monthly Likes', value: '3,000' },
                                        { label: 'Monthly Shares', value: '3,000' },
                                        { label: 'Monthly Follows', value: '3,000' },
                                        { label: 'Connections', value: '3,000' },
                                        { label: 'AI Posts', value: '100' },
                                        { label: 'Topic Lines', value: '150' },
                                        { label: 'Import Credits', value: '1,500' },
                                    ].map((item, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                                            <IconCheck size={16} color="#10b981" /> <span style={{ fontWeight: '600' }}>{item.value}</span> {item.label}
                                        </div>
                                    ))}
                                </div>
                                
                                <div style={{ marginBottom: '24px' }}>
                                    <div style={{ fontSize: '10px', fontWeight: '600', color: 'rgba(255,255,255,0.5)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Features</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                        {['Auto Like', 'Auto Comment', 'Auto Follow', 'AI Content', 'AI Topics', 'Viral Posts Writer', 'Added Sources', 'Personalized Posts', 'Content Planner', 'Auto Scheduling', 'Network Scheduling', 'Analytics', 'Import Profiles'].map((feature, i) => (
                                            <span key={i} style={{ 
                                                display: 'inline-flex', 
                                                alignItems: 'center', 
                                                gap: '4px', 
                                                padding: '4px 8px', 
                                                borderRadius: '16px', 
                                                fontSize: '10px',
                                                fontWeight: '500',
                                                background: 'rgba(16, 185, 129, 0.12)',
                                                color: '#10b981',
                                                border: '1px solid rgba(16, 185, 129, 0.25)'
                                            }}>
                                                <IconCheck size={11} color="#10b981" /> {feature}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* AI Comments Refill Info */}
                                <div style={{
                                    background: 'linear-gradient(135deg, rgba(105, 63, 233, 0.1), rgba(139, 92, 246, 0.1))',
                                    border: '1px solid rgba(105, 63, 233, 0.3)',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    marginBottom: '24px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '14px', color: '#a78bfa', marginBottom: '4px' }}>💎 AI Comments Refill</div>
                                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#8b5cf6' }}>
                                        $5 for 200 AI Comments
                                    </div>
                                    <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>
                                        Purchase additional AI comments anytime
                                    </div>
                                </div>
                                
                                <Link href={plans.find(p => p.name.toLowerCase().includes('agency') || p.name.toLowerCase().includes('diamond'))?.stripeLink || '/signup'} target={plans.find(p => p.name.toLowerCase().includes('agency') || p.name.toLowerCase().includes('diamond'))?.stripeLink ? '_blank' : undefined} style={{
                                    display: 'block',
                                    width: '100%',
                                    padding: '14px',
                                    background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    color: 'white',
                                    textDecoration: 'none',
                                    borderRadius: '12px',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    textAlign: 'center'
                                }}>
                                    Get Started
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Section 2: Lifetime Deals */}
            <section className="section-padding" style={{ padding: '80px 60px', background: '#111111', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(245, 158, 11, 0.2))', border: '1px solid rgba(245, 158, 11, 0.4)', padding: '10px 24px', borderRadius: '30px', marginBottom: '20px' }}>
                            <IconFire size={20} color="#f59e0b" />
                            <span style={{ color: '#f59e0b', fontWeight: '600', fontSize: '14px' }}>Limited Time: Pay Once, Use Forever</span>
                        </div>
                        <h2 style={{ fontSize: '38px', fontWeight: '700', marginBottom: '12px' }}>
                            Lifetime Access<br/>
                            <span style={{ color: '#f59e0b' }}>One Payment. Forever Yours.</span>
                        </h2>
                        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '30px' }}>
                            Get unlimited access with a single payment. No recurring fees ever.
                        </p>
                    </div>

                    {/* Progress Bar */}
                    {lifetimeDeals.length > 0 && (
                        <div style={{ maxWidth: '500px', margin: '0 auto 50px auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                                <span style={{ color: '#ef4444', fontWeight: '600' }}>{soldSpots} licenses sold</span>
                                <span style={{ color: '#22c55e', fontWeight: '600' }}>{spotsRemaining} remaining</span>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', height: '12px', overflow: 'hidden' }}>
                                <div style={{ 
                                    background: 'linear-gradient(90deg, #ef4444, #f59e0b)', 
                                    height: '100%', 
                                    width: `${(soldSpots / totalSpots) * 100}%`,
                                    borderRadius: '8px'
                                }}></div>
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px' }}>Loading lifetime deals...</div>
                    ) : lifetimeDeals.length > 0 ? (
                        <div className="lifetime-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(lifetimeDeals.length, 3)}, 1fr)`, gap: '30px' }}>
                            {lifetimeDeals.sort((a, b) => a.price - b.price).map((plan, index) => {
                                const isPopular = index === Math.floor(lifetimeDeals.length / 2) || lifetimeDeals.length === 1;
                                const isPro = index === lifetimeDeals.length - 1; // Highest tier
                                const isGrowth = index === Math.floor(lifetimeDeals.length / 2); // Middle tier
                                const spotsLeft = plan.lifetimeSpotsRemaining ?? (plan.lifetimeMaxSpots - plan.lifetimeSoldSpots);
                                
                                const features = [
                                    { text: `${formatNumber(plan.limits.aiCommentsPerMonth)} AI Comments/mo` },
                                    { text: `${formatNumber(plan.limits.aiPostsPerMonth)} AI Posts/mo` },
                                    { text: `${formatNumber(plan.limits.monthlyLikes)} Auto Likes` },
                                    { text: `${formatNumber(plan.limits.monthlyShares)} Auto Shares` },
                                    { text: `${formatNumber(plan.limits.monthlyFollows)} Auto Follows` },
                                    { text: `${formatNumber(plan.limits.monthlyConnections)} Connections` },
                                    plan.monthlyImportCredits > 0 ? { text: `${formatNumber(plan.monthlyImportCredits)} Imports` } : null,
                                    { text: 'Viral Posts Writer' },
                                    { text: 'Added Sources (AI Posts & Comments)' },
                                    { text: 'Personalized Post Writer (Scan Profile)' },
                                    { text: 'Content Planner (7/30 Days)' },
                                    { text: 'Auto Scheduled Posts (Auto Pilot)' },
                                    { text: 'Lifetime Updates' },
                                    { text: 'Priority Support' },
                                ].filter(Boolean) as { text: string; highlight?: boolean }[];
                                
                                return (
                                    <div key={plan.id} style={{ 
                                        padding: '40px', 
                                        background: isPopular ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(239, 68, 68, 0.05))' : 'rgba(255,255,255,0.02)', 
                                        border: isPopular ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)', 
                                        borderRadius: '24px', 
                                        position: 'relative',
                                        transform: isPopular ? 'scale(1.02)' : 'scale(1)'
                                    }}>
                                        {isPopular && (
                                            <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', padding: '8px 20px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                                                🔥 MOST POPULAR
                                            </div>
                                        )}
                                        
                                        {spotsLeft > 0 && spotsLeft < 50 && (
                                            <div style={{ position: 'absolute', top: '20px', right: '20px', background: spotsLeft < 20 ? '#ef4444' : '#f59e0b', padding: '5px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: '600' }}>
                                                Only {spotsLeft} left!
                                            </div>
                                        )}
                                        
                                        <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>{plan.name}</h3>
                                        
                                        {/* Gift for Agency LTD */}
                                        {plan.name === 'Agency LTD' && (
                                            <div style={{
                                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                color: 'white',
                                                padding: '8px 16px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: '700',
                                                marginBottom: '12px',
                                                textAlign: 'center',
                                                boxShadow: '0 4px 15px rgba(16,185,129,0.3)'
                                            }}>
                                                🎁 Gift: LinkedIn Business 12 Months FREE
                                            </div>
                                        )}
                                        
                                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '20px' }}>One-time payment</p>
                                        
                                        <div style={{ marginBottom: '8px' }}>
                                            <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through' }}>
                                                ${plan.price === 69 ? '828' : plan.price === 149 ? '1788' : plan.price === 299 ? '3588' : (plan.price * 12)}/year
                                            </span>
                                            <span style={{ marginLeft: '10px', background: '#22c55e', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>
                                                Save ${plan.price === 69 ? '759' : plan.price === 149 ? '1639' : plan.price === 299 ? '3289' : (plan.price * 12) - plan.price}
                                            </span>
                                        </div>
                                        <div style={{ marginBottom: '24px' }}>
                                            <span style={{ fontSize: '52px', fontWeight: '800', color: isPopular ? '#fbbf24' : 'white' }}>${plan.price}</span>
                                            <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)' }}> once</span>
                                        </div>
                                        <p style={{ fontSize: '13px', color: '#22c55e', marginBottom: '24px' }}>Forever access • No recurring fees</p>
                                        
                                        <div style={{ marginBottom: '24px' }}>
                                            <div style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.5)', marginBottom: '12px', textTransform: 'uppercase' }}>What's Included</div>
                                            {features.map((f, i) => (
                                                <div key={i} style={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: '10px', 
                                                    padding: f.highlight ? '12px' : '8px 0', 
                                                    fontSize: '14px',
                                                    color: f.highlight ? '#0077b5' : 'rgba(255,255,255,0.8)',
                                                    fontWeight: f.highlight ? '700' : '400',
                                                    background: f.highlight ? 'linear-gradient(135deg, rgba(0, 119, 181, 0.2), rgba(0, 119, 181, 0.1))' : 'transparent',
                                                    border: f.highlight ? '2px solid rgba(0, 119, 181, 0.5)' : 'none',
                                                    borderRadius: f.highlight ? '10px' : '0',
                                                    marginBottom: f.highlight ? '8px' : '0'
                                                }}>
                                                    {f.highlight ? <IconCrown size={18} color="#0077b5" /> : <IconCheck size={16} color="#10b981" />}
                                                    {f.text}
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <a href={plan.stripeLink || '/signup'} target={plan.stripeLink ? '_blank' : undefined} rel={plan.stripeLink ? 'noopener noreferrer' : undefined} style={{
                                            display: 'block',
                                            width: '100%',
                                            padding: '16px',
                                            background: isPopular ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'linear-gradient(135deg, #693fe9, #8b5cf6)',
                                            color: 'white',
                                            textDecoration: 'none',
                                            borderRadius: '12px',
                                            fontSize: '16px',
                                            fontWeight: '700',
                                            textAlign: 'center'
                                        }}>
                                            <IconRocket size={16} color="white" /> Get Lifetime Access
                                        </a>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px' }}>
                            <h3 style={{ fontSize: '24px', marginBottom: '12px' }}>Lifetime Deals Coming Soon!</h3>
                            <p style={{ color: 'rgba(255,255,255,0.5)' }}>Check back soon for exclusive offers.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* LinkedIn Premium Bonus Note */}
            {lifetimeDeals.length > 0 && (
                <div style={{ padding: '0 60px', marginTop: '30px' }}>
                    <div style={{
                        maxWidth: '1200px',
                        margin: '0 auto',
                        background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(5,150,105,0.05) 100%)',
                        border: '1px solid rgba(16,185,129,0.3)',
                        borderRadius: '16px',
                        padding: '20px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '14px', color: '#10b981', fontWeight: '600', marginBottom: '8px' }}>
                            🎁 LinkedIn Premium Bonus
                        </div>
                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>
                            After you buy, connect with our support team through WhatsApp — they'll help you activate the LinkedIn Business plan on your account.
                        </p>
                    </div>
                </div>
            )}

            {/* Section 3: FAQ */}
            <section className="section-padding" style={{ padding: '80px 60px', background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '32px', fontWeight: '700', textAlign: 'center', marginBottom: '40px' }}>
                        Frequently Asked <span style={{ color: '#693fe9' }}>Questions</span>
                    </h2>
                    
                    {faqItems.map((faq, i) => (
                        <div key={i} style={{ marginBottom: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden' }}>
                            <button
                                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                style={{
                                    width: '100%',
                                    padding: '18px 24px',
                                    background: 'transparent',
                                    border: 'none',
                                    textAlign: 'left',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                {faq.q}
                                <span style={{ fontSize: '20px', color: '#693fe9', transition: 'transform 0.3s', transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>+</span>
                            </button>
                            {openFaq === i && (
                                <div style={{ padding: '0 24px 18px', fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.7' }}>
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Trust Badges */}
            <section style={{ padding: '40px 60px', background: '#111111', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
                    {['30-Day Money-Back Guarantee', 'Cancel Anytime', 'Secure Payment'].map((badge, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
                            <IconCheck size={16} color="#10b981" /> {badge}
                        </div>
                    ))}
                </div>
            </section>

            <Footer />
            <WhatsAppButton />
        </div>
    );
}
