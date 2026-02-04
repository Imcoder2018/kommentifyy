'use client';

import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Custom SVG Icons
const IconCheck = ({ size = 16, color = '#10b981' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5"/>
    </svg>
);

const IconEdit = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
    </svg>
);

const IconMessage = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
    </svg>
);

const IconSearch = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
    </svg>
);

const IconUsers = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
);

const IconUpload = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>
    </svg>
);

const IconChartBar = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>
    </svg>
);

const IconAdjustments = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="2" x2="6" y1="14" y2="14"/><line x1="10" x2="14" y1="8" y2="8"/><line x1="18" x2="22" y1="16" y2="16"/>
    </svg>
);

const IconActivity = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
);

const IconStar = ({ size = 16, color = '#f59e0b' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
);

const IconRocket = ({ size = 16, color = '#693fe9' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
    </svg>
);

const IconShield = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
    </svg>
);

const IconBolt = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
);

const IconSparkles = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
        <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
    </svg>
);

const IconTarget = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
);

const IconTrendingUp = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
    </svg>
);

const IconClock = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
);

const IconHeart = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
    </svg>
);

export default function FeaturesPage() {
    const features = [
        { 
            icon: <IconEdit size={32} />, 
            num: '01', 
            title: 'AI Post Writer + Advanced Scheduler', 
            desc: 'Enter one keyword → Get 10 unique engaging headlines → Choose tone (Professional, Story, Lead Magnet, Motivational) → AI generates polished, ready-to-publish post → Click "Publish Now" OR schedule it with human-like delays (60–100 seconds).',
            features: ['10 unique headlines per topic', 'Multiple tone options', 'Auto-scroll, auto-draft, auto-publish', 'Human-like posting delays'],
            color: '#3b82f6',
            gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
        },
        { 
            icon: <IconMessage size={32} />, 
            num: '02', 
            title: 'Smart Comment Automation', 
            desc: 'This is not spam commenting. Kommentify opens posts in a new tab, scrolls slowly (human-like), reads the full post, and generates personalized comments with hooks, reactions, and value-adds.',
            features: ['Opens & reads full posts', 'AI-personalized comments', 'Can Like/Share posts too', 'Filter by like/comment count'],
            color: '#8b5cf6',
            gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)'
        },
        { 
            icon: <IconSearch size={32} />, 
            num: '03', 
            title: 'Keyword-Based Post Discovery', 
            desc: 'Add keywords like "Marketing", "AI Tools", "SaaS", "Real Estate" → Kommentify finds relevant posts → Engages automatically. Choose how many posts to scrap (10–500), set limits, choose engagement type.',
            features: ['Multiple keywords support', 'Scrap 10-500 posts', 'Custom engagement limits', 'Auto-engagement'],
            color: '#10b981',
            gradient: 'linear-gradient(135deg, #10b981, #059669)'
        },
        { 
            icon: <IconUsers size={32} />, 
            num: '04', 
            title: 'Human-Like Networking', 
            desc: 'Send personalized connection requests with Boolean search (CEO AND Founder), 1st/2nd/3rd-degree filtering, exclude job seekers/interns, AI-personalized messages, and safe delays.',
            features: ['Boolean search support', 'Degree-based filtering', 'AI-personalized messages', 'Account-age safe limits'],
            color: '#ec4899',
            gradient: 'linear-gradient(135deg, #ec4899, #be185d)'
        },
        { 
            icon: <IconChartBar size={32} />, 
            num: '06', 
            title: 'Full Analytics Dashboard', 
            desc: 'See everything: Total comments, likes, follows, posts written, completed vs pending tasks, activity timeline, import history, connection requests sent, scheduled tasks, and progress tracking.',
            features: ['Real-time activity tracking', 'Task completion status', 'Import history logs', 'Progress visualization'],
            color: '#06b6d4',
            gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)'
        },
        { 
            icon: <IconAdjustments size={32} />, 
            num: '07', 
            title: 'Limit Control System — Most Powerful', 
            desc: 'Pre-set limits for account age: New, Semi-new, Average, Mid-aged, Old, Very old. Manual override available for every delay: before liking, commenting, posting, connection requests, scroll, tab open.',
            features: ['6 account-age presets', 'Full manual override', 'Every delay customizable', 'LinkedIn-safe by default'],
            color: '#f59e0b',
            gradient: 'linear-gradient(135deg, #f59e0b, #d97706)'
        },
        { 
            icon: <IconActivity size={32} />, 
            num: '08', 
            title: 'Organic-Like Behavior Engine', 
            desc: 'Kommentify uses random delay patterns, human scroll speed, interval variation, tab switching, natural reading delays, and non-linear interactions. Keeps your account safe and natural.',
            features: ['Random delay patterns', 'Human scroll simulation', 'Tab switching behavior', 'Non-linear interactions'],
            color: '#ef4444',
            gradient: 'linear-gradient(135deg, #ef4444, #dc2626)'
        },
    ];

    return (
        <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', background: '#0a0a0a', color: 'white', minHeight: '100vh' }}>
            {/* CSS Animations */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes pulse-glow {
                    0%, 100% { box-shadow: 0 0 30px rgba(245, 158, 11, 0.4), 0 0 60px rgba(245, 158, 11, 0.2); }
                    50% { box-shadow: 0 0 50px rgba(245, 158, 11, 0.6), 0 0 100px rgba(245, 158, 11, 0.3); }
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                @keyframes gradient-shift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                .feature-card:hover {
                    transform: translateY(-8px) scale(1.02);
                    box-shadow: 0 25px 50px rgba(0,0,0,0.5);
                }
                .feature-card {
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .golden-card {
                    animation: pulse-glow 3s ease-in-out infinite;
                }
                .golden-card:hover {
                    transform: translateY(-12px) scale(1.03);
                }
                @media (max-width: 968px) {
                    .features-grid { grid-template-columns: 1fr !important; }
                    .hero-title { font-size: 36px !important; }
                    .section-padding { padding: 60px 20px !important; }
                }
                @media (max-width: 640px) {
                    .hero-title { font-size: 28px !important; }
                    .feature-badges { flex-direction: column !important; }
                }
            `}</style>

            <Header />

            {/* Hero Section */}
            <section style={{
                background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 100%)',
                padding: '100px 60px 80px',
                position: 'relative',
                overflow: 'hidden'
            }} className="section-padding">
                {/* Background Decorations */}
                <div style={{ position: 'absolute', top: '10%', left: '5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(105, 63, 233, 0.15) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(80px)' }}></div>
                <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(80px)' }}></div>

                <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        background: 'rgba(105, 63, 233, 0.1)', 
                        border: '1px solid rgba(105, 63, 233, 0.3)', 
                        padding: '10px 20px', 
                        borderRadius: '30px', 
                        fontSize: '14px', 
                        marginBottom: '30px', 
                        color: '#a78bfa' 
                    }}>
                        <IconSparkles size={18} color="#a78bfa" />
                        8 Powerful Features · Built for Serious Growth
                    </div>
                    
                    <h1 className="hero-title" style={{ 
                        fontSize: '56px', 
                        fontWeight: '800', 
                        lineHeight: '1.1', 
                        marginBottom: '24px',
                        background: 'linear-gradient(135deg, #ffffff 0%, #a78bfa 50%, #f59e0b 100%)',
                        backgroundSize: '200% 200%',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        animation: 'gradient-shift 5s ease infinite'
                    }}>
                        Everything You Need to<br/>
                        Dominate LinkedIn
                    </h1>
                    
                    <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', marginBottom: '40px', maxWidth: '700px', margin: '0 auto 40px', lineHeight: '1.7' }}>
                        From AI-powered content creation to intelligent engagement automation — 
                        Kommentify gives you the complete toolkit to grow your LinkedIn presence organically and safely.
                    </p>

                    <div className="feature-badges" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {[
                            { icon: <IconShield size={16} />, text: '100% Safe' },
                            { icon: <IconBolt size={16} />, text: 'AI-Powered' },
                            { icon: <IconClock size={16} />, text: 'Human-Like Delays' },
                            { icon: <IconTarget size={16} />, text: 'Precision Targeting' }
                        ].map((badge, i) => (
                            <div key={i} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                padding: '10px 18px',
                                borderRadius: '30px',
                                fontSize: '13px',
                                color: 'rgba(255,255,255,0.8)'
                            }}>
                                {badge.icon} {badge.text}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* HIGHLIGHTED FEATURE - Manual Import */}
            <section style={{
                background: '#0a0a0a',
                padding: '80px 60px',
                borderTop: '1px solid rgba(255,255,255,0.05)'
            }} className="section-padding">
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div className="golden-card" style={{
                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.08) 100%)',
                        border: '2px solid #f59e0b',
                        borderRadius: '24px',
                        padding: '50px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Shimmer Effect */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(45deg, transparent 30%, rgba(255, 215, 0, 0.08) 50%, transparent 70%)',
                            animation: 'shimmer 3s infinite',
                            pointerEvents: 'none'
                        }}></div>

                        {/* Badge */}
                        <div style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                            color: 'white',
                            padding: '8px 20px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 4px 15px rgba(245, 158, 11, 0.5)'
                        }}>
                            <IconStar size={14} /> MOST VALUABLE FEATURE
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', alignItems: 'center', position: 'relative', zIndex: 1 }} className="features-grid">
                            <div>
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    marginBottom: '24px'
                                }}>
                                    <div style={{
                                        width: '70px',
                                        height: '70px',
                                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                        borderRadius: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 8px 25px rgba(245, 158, 11, 0.4)'
                                    }}>
                                        <IconUpload size={36} color="white" />
                                    </div>
                                    <span style={{
                                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                        color: 'white',
                                        padding: '6px 16px',
                                        borderRadius: '20px',
                                        fontSize: '14px',
                                        fontWeight: '700'
                                    }}>05</span>
                                </div>

                                <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '20px', color: '#fbbf24' }}>
                                    Manual Import
                                </h2>
                                <p style={{ fontSize: '13px', color: '#f59e0b', marginBottom: '16px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    The Feature That Replaces $300-$1000/mo Ghostwriters
                                </p>
                                <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.8', marginBottom: '30px' }}>
                                    Upload your target profiles (up to 500/1000/unlimited). For each profile, Kommentify opens it, 
                                    reads their last 1–5 posts, likes, comments, follows, engages deeply, and builds real relationships automatically.
                                </p>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    {[
                                        'Upload target profile lists',
                                        'Reads their recent posts',
                                        'Deep engagement per profile',
                                        'Builds real relationships',
                                        'Customizable engagement depth',
                                        'Progress tracking & history'
                                    ].map((f, j) => (
                                        <div key={j} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            background: 'rgba(245, 158, 11, 0.15)',
                                            padding: '12px 16px',
                                            borderRadius: '10px',
                                            fontSize: '13px',
                                            color: '#fbbf24'
                                        }}>
                                            <IconCheck size={16} color="#f59e0b" /> {f}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{
                                background: 'rgba(0,0,0,0.3)',
                                borderRadius: '16px',
                                padding: '30px',
                                border: '1px solid rgba(245, 158, 11, 0.3)'
                            }}>
                                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#fbbf24', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <IconTrendingUp size={20} /> How It Works
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {[
                                        { step: '1', text: 'Upload CSV with LinkedIn profile URLs (up to unlimited)' },
                                        { step: '2', text: 'Set engagement depth: posts to read, actions per profile' },
                                        { step: '3', text: 'Kommentify visits each profile with human-like behavior' },
                                        { step: '4', text: 'Reads posts, generates personalized comments, likes, follows' },
                                        { step: '5', text: 'Track all progress in your dashboard' }
                                    ].map((item, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                                            <div style={{
                                                width: '28px',
                                                height: '28px',
                                                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '12px',
                                                fontWeight: '700',
                                                color: 'white',
                                                flexShrink: 0
                                            }}>{item.step}</div>
                                            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: '1.6' }}>{item.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* All Features Grid */}
            <section style={{
                background: '#111111',
                padding: '80px 60px',
                borderTop: '1px solid rgba(255,255,255,0.05)'
            }} className="section-padding">
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <h2 style={{ fontSize: '38px', fontWeight: '700', marginBottom: '16px' }}>
                            More Powerful Features
                        </h2>
                        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)' }}>
                            Every tool you need to automate, engage, and grow on LinkedIn
                        </p>
                    </div>

                    <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                        {features.map((feature, i) => (
                            <div key={i} className="feature-card" style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '20px',
                                padding: '32px',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                {/* Top Gradient Line */}
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '4px',
                                    background: feature.gradient
                                }}></div>

                                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                                    <div style={{
                                        width: '56px',
                                        height: '56px',
                                        background: feature.gradient,
                                        borderRadius: '14px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        boxShadow: `0 8px 20px ${feature.color}40`
                                    }}>
                                        <div style={{ color: 'white' }}>{feature.icon}</div>
                                    </div>
                                    <div>
                                        <span style={{
                                            background: feature.gradient,
                                            color: 'white',
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            marginBottom: '8px',
                                            display: 'inline-block'
                                        }}>{feature.num}</span>
                                        <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: 'white' }}>
                                            {feature.title}
                                        </h3>
                                    </div>
                                </div>

                                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)', lineHeight: '1.7', marginBottom: '20px' }}>
                                    {feature.desc}
                                </p>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {feature.features.map((f, j) => (
                                        <span key={j} style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            background: `${feature.color}15`,
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            color: feature.color
                                        }}>
                                            <IconCheck size={14} color={feature.color} /> {f}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{
                background: 'linear-gradient(180deg, #111111 0%, #0a0a0a 100%)',
                padding: '80px 60px',
                borderTop: '1px solid rgba(255,255,255,0.05)'
            }} className="section-padding">
                <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(105, 63, 233, 0.15), rgba(139, 92, 246, 0.1))',
                        border: '1px solid rgba(105, 63, 233, 0.3)',
                        borderRadius: '24px',
                        padding: '50px'
                    }}>
                        <div style={{ marginBottom: '20px' }}>
                            <IconRocket size={48} color="#693fe9" />
                        </div>
                        <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px' }}>
                            Ready to Transform Your LinkedIn?
                        </h2>
                        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', marginBottom: '30px', maxWidth: '500px', margin: '0 auto 30px' }}>
                            Join thousands of professionals who are growing their LinkedIn presence with Kommentify&apos;s powerful automation suite.
                        </p>
                        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link href="/signup" style={{
                                padding: '16px 32px',
                                background: 'white',
                                color: '#0a0a0a',
                                textDecoration: 'none',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: '600',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 20px rgba(255,255,255,0.2)'
                            }}>
                                🚀 Start with 30-Day Money Back Guarantee <span>→</span>
                            </Link>
                            <Link href="/lifetime-deal" style={{
                                padding: '16px 32px',
                                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: '600',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)'
                            }}>
                                <IconHeart size={18} /> Grab Lifetime Deal
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
