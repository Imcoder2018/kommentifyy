'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Footer from '../components/Footer';

export default function ReferralPage() {
    const [user, setUser] = useState<any>(null);
    const [referralLink, setReferralLink] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            fetch('/api/auth/validate', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setUser(data.user);
                        setReferralLink(`https://kommentify.com/signup?ref=${data.user.referralCode || data.user.id}`);
                    }
                })
                .catch(() => {});
        }
    }, []);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareOnTwitter = () => {
        const text = encodeURIComponent('🚀 I just discovered Kommentify - the best LinkedIn automation tool! Use my link to get started:');
        const url = encodeURIComponent(referralLink);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    };

    const shareOnLinkedIn = () => {
        const url = encodeURIComponent(referralLink);
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
    };

    const shareOnWhatsApp = () => {
        const text = encodeURIComponent(`🚀 Check out Kommentify - the best LinkedIn automation tool! ${referralLink}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    return (
        <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', background: '#0a0a0a', color: 'white', minHeight: '100vh' }}>
            {/* Lifetime Deal Banner */}
            <div style={{
                background: 'linear-gradient(90deg, #dc2626, #ea580c, #dc2626)',
                padding: '12px 20px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                    animation: 'shimmer 2s infinite'
                }}></div>
                <a href="/lifetime-deal" target="_blank" rel="noopener noreferrer" style={{ 
                    fontSize: '14px', 
                    fontWeight: '700', 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    position: 'relative',
                    zIndex: 1,
                    textDecoration: 'none'
                }}>
                    🔥 LIFETIME DEAL AVAILABLE — <span style={{ background: 'rgba(245, 158, 11, 0.3)', padding: '2px 10px', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.5)' }}>Pay Once, Use Forever</span> — Click Here
                </a>
            </div>

            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                @media (max-width: 768px) {
                    .referral-nav { padding: 16px 20px !important; }
                    .referral-nav > div:last-child { display: none !important; }
                    .referral-hero { padding: 60px 20px !important; }
                    .referral-hero h1 { font-size: 32px !important; }
                    .referral-tiers { grid-template-columns: 1fr 1fr !important; }
                    .referral-section { padding: 50px 20px !important; }
                }
                @media (max-width: 480px) {
                    .referral-tiers { grid-template-columns: 1fr !important; }
                    .referral-hero h1 { font-size: 28px !important; }
                }
            `}</style>

            {/* Navigation */}
            <nav className="referral-nav" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 60px',
                background: 'rgba(10, 10, 10, 0.95)',
                backdropFilter: 'blur(10px)',
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
                <Link href="/" style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                    <img src="/favicon.png" alt="Kommentify" style={{ width: '32px', height: '32px', borderRadius: '6px' }} />
                    Kommentify
                </Link>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <Link href="/plans" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px' }}>Pricing</Link>
                    <Link href="/login" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px' }}>Login</Link>
                    <Link href="/signup" style={{
                        padding: '10px 20px',
                        background: 'linear-gradient(135deg, #693fe9, #8b5cf6)',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '600'
                    }}>
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section style={{ 
                padding: '100px 60px', 
                background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 100%)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Background Effects */}
                <div style={{ position: 'absolute', top: '10%', left: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(105, 63, 233, 0.15) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)' }}></div>
                <div style={{ position: 'absolute', bottom: '20%', right: '15%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)' }}></div>

                <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '64px', marginBottom: '20px' }}>🏆</div>
                    <h1 style={{ 
                        fontSize: '52px', 
                        fontWeight: '800', 
                        marginBottom: '20px',
                        background: 'linear-gradient(135deg, #fff 0%, #a78bfa 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Join Our Referral Program
                    </h1>
                    <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.7)', marginBottom: '16px', maxWidth: '700px', margin: '0 auto 40px' }}>
                        Share Kommentify with your network and earn <strong style={{ color: '#22c55e' }}>30% commission</strong> on every paid user you refer!
                    </p>

                    {/* Commission Highlight */}
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '16px',
                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.05))',
                        border: '2px solid #22c55e',
                        borderRadius: '20px',
                        padding: '20px 40px',
                        marginBottom: '60px'
                    }}>
                        <span style={{ fontSize: '48px' }}>💰</span>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '36px', fontWeight: '800', color: '#22c55e' }}>30%</div>
                            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>Commission per referral</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tier Badges */}
            <section style={{ padding: '80px 60px', background: '#111111' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '32px', fontWeight: '700', textAlign: 'center', marginBottom: '50px' }}>
                        Referral <span style={{ color: '#693fe9' }}>Tiers</span>
                    </h2>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '60px' }}>
                        <div style={{ 
                            background: 'linear-gradient(180deg, rgba(205, 127, 50, 0.1), rgba(205, 127, 50, 0.02))',
                            borderRadius: '20px', 
                            padding: '32px', 
                            border: '2px solid rgba(205, 127, 50, 0.3)',
                            textAlign: 'center',
                            transition: 'transform 0.3s'
                        }}>
                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🥉</div>
                            <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>5 Referrals</div>
                            <div style={{ fontSize: '24px', fontWeight: '700', color: '#cd7f32' }}>Bronze</div>
                            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>Starter Level</div>
                        </div>
                        <div style={{ 
                            background: 'linear-gradient(180deg, rgba(192, 192, 192, 0.1), rgba(192, 192, 192, 0.02))',
                            borderRadius: '20px', 
                            padding: '32px', 
                            border: '2px solid rgba(192, 192, 192, 0.3)',
                            textAlign: 'center',
                            transition: 'transform 0.3s'
                        }}>
                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🥈</div>
                            <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>15 Referrals</div>
                            <div style={{ fontSize: '24px', fontWeight: '700', color: '#c0c0c0' }}>Silver</div>
                            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>Growing Advocate</div>
                        </div>
                        <div style={{ 
                            background: 'linear-gradient(180deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.02))',
                            borderRadius: '20px', 
                            padding: '32px', 
                            border: '2px solid rgba(255, 215, 0, 0.3)',
                            textAlign: 'center',
                            transition: 'transform 0.3s'
                        }}>
                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🥇</div>
                            <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>30 Referrals</div>
                            <div style={{ fontSize: '24px', fontWeight: '700', color: '#ffd700' }}>Gold</div>
                            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>Top Performer</div>
                        </div>
                        <div style={{ 
                            background: 'linear-gradient(180deg, rgba(105, 63, 233, 0.2), rgba(105, 63, 233, 0.05))',
                            borderRadius: '20px', 
                            padding: '32px', 
                            border: '2px solid #693fe9',
                            textAlign: 'center',
                            transition: 'transform 0.3s',
                            boxShadow: '0 10px 40px rgba(105, 63, 233, 0.2)'
                        }}>
                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>👑</div>
                            <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>50 Referrals</div>
                            <div style={{ fontSize: '24px', fontWeight: '700', color: '#693fe9' }}>Champion</div>
                            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>Elite Status</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section style={{ padding: '80px 60px', background: '#0a0a0a' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '32px', fontWeight: '700', textAlign: 'center', marginBottom: '50px' }}>
                        How It <span style={{ color: '#693fe9' }}>Works</span>
                    </h2>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
                        <div style={{ 
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '20px',
                            padding: '40px 30px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            textAlign: 'center',
                            position: 'relative'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: '-20px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: 'linear-gradient(135deg, #693fe9, #8b5cf6)',
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '20px',
                                fontWeight: '700',
                                boxShadow: '0 4px 20px rgba(105, 63, 233, 0.4)'
                            }}>1</div>
                            <div style={{ fontSize: '40px', marginTop: '20px', marginBottom: '16px' }}>🔗</div>
                            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>Sign Up & Get Link</h3>
                            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6' }}>
                                Create your free account and get your unique referral link instantly from your dashboard.
                            </p>
                        </div>
                        
                        <div style={{ 
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '20px',
                            padding: '40px 30px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            textAlign: 'center',
                            position: 'relative'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: '-20px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '20px',
                                fontWeight: '700',
                                boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)'
                            }}>2</div>
                            <div style={{ fontSize: '40px', marginTop: '20px', marginBottom: '16px' }}>📢</div>
                            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>Share with Friends</h3>
                            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6' }}>
                                Share your link on social media, email, blog posts, or direct messages to your network.
                            </p>
                        </div>
                        
                        <div style={{ 
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '20px',
                            padding: '40px 30px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            textAlign: 'center',
                            position: 'relative'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: '-20px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '20px',
                                fontWeight: '700',
                                boxShadow: '0 4px 20px rgba(34, 197, 94, 0.4)'
                            }}>3</div>
                            <div style={{ fontSize: '40px', marginTop: '20px', marginBottom: '16px' }}>💵</div>
                            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>Earn 30% Commission</h3>
                            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6' }}>
                                Get paid for every user who upgrades to a paid plan through your referral link.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Get Your Link Section */}
            <section style={{ padding: '80px 60px', background: '#111111' }}>
                <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px' }}>
                        {user ? 'Your Referral Link' : 'Get Your Referral Link'}
                    </h2>
                    <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', marginBottom: '40px' }}>
                        {user ? 'Share this link to start earning commissions!' : 'Sign up or log in to get your unique referral link'}
                    </p>
                    
                    {user ? (
                        <div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '2px solid rgba(105, 63, 233, 0.3)',
                                borderRadius: '12px',
                                padding: '16px 20px',
                                marginBottom: '24px'
                            }}>
                                <input 
                                    type="text" 
                                    value={referralLink} 
                                    readOnly
                                    style={{
                                        flex: 1,
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'white',
                                        fontSize: '14px',
                                        outline: 'none'
                                    }}
                                />
                                <button
                                    onClick={copyToClipboard}
                                    style={{
                                        padding: '10px 20px',
                                        background: copied ? '#22c55e' : 'linear-gradient(135deg, #693fe9, #8b5cf6)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    {copied ? '✓ Copied!' : 'Copy Link'}
                                </button>
                            </div>
                            
                            {/* Social Share Buttons */}
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                <button onClick={shareOnTwitter} style={{
                                    padding: '12px 24px',
                                    background: '#1DA1F2',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    𝕏 Twitter
                                </button>
                                <button onClick={shareOnLinkedIn} style={{
                                    padding: '12px 24px',
                                    background: '#0077B5',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    in LinkedIn
                                </button>
                                <button onClick={shareOnWhatsApp} style={{
                                    padding: '12px 24px',
                                    background: '#25D366',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    💬 WhatsApp
                                </button>
                            </div>
                        </div>
                    ) : (
                        <Link href="/signup" style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '18px 40px',
                            background: 'linear-gradient(135deg, #693fe9, #8b5cf6)',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '12px',
                            fontSize: '18px',
                            fontWeight: '600',
                            boxShadow: '0 4px 20px rgba(105, 63, 233, 0.4)'
                        }}>
                            Start Earning Today →
                        </Link>
                    )}
                </div>
            </section>

            {/* FAQ Section */}
            <section style={{ padding: '80px 60px', background: '#0a0a0a' }}>
                <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '32px', fontWeight: '700', textAlign: 'center', marginBottom: '40px' }}>
                        Frequently Asked <span style={{ color: '#693fe9' }}>Questions</span>
                    </h2>
                    
                    {[
                        { q: 'How much can I earn?', a: 'You earn 30% commission on every paid subscription from users you refer. For example, if someone signs up for a $24.99/month plan, you earn $7.50/month for as long as they stay subscribed!' },
                        { q: 'When do I get paid?', a: 'Commissions are paid out monthly via PayPal or bank transfer once you reach the minimum threshold of $50.' },
                        { q: 'Is there a limit to how much I can earn?', a: 'No limits! The more people you refer, the more you earn. Our top affiliates earn thousands per month.' },
                        { q: 'How do I track my referrals?', a: 'You can track all your referrals, clicks, and earnings in real-time from your dashboard.' },
                        { q: 'Do I need to be a paid user to refer?', a: 'No! Even free users can participate in our referral program and earn commissions.' }
                    ].map((faq, i) => (
                        <div key={i} style={{ 
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '12px',
                            padding: '24px',
                            marginBottom: '16px'
                        }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#a78bfa' }}>{faq.q}</h3>
                            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6', margin: 0 }}>{faq.a}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section style={{ padding: '80px 60px', background: 'linear-gradient(135deg, rgba(105, 63, 233, 0.2), rgba(105, 63, 233, 0.05))', textAlign: 'center' }}>
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>
                        Ready to Start Earning?
                    </h2>
                    <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', marginBottom: '32px' }}>
                        Join thousands of affiliates already earning with Kommentify
                    </p>
                    <Link href="/signup" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '18px 40px',
                        background: 'white',
                        color: '#0a0a0a',
                        textDecoration: 'none',
                        borderRadius: '12px',
                        fontSize: '18px',
                        fontWeight: '600'
                    }}>
                        Get Started Free →
                    </Link>
                </div>
            </section>

            {/* Responsive Styles */}
            <style>{`
                @media (max-width: 900px) {
                    nav { padding: 12px 20px !important; }
                    section { padding: 60px 20px !important; }
                    h1 { font-size: 36px !important; }
                    h2 { font-size: 28px !important; }
                    div[style*="grid-template-columns: repeat(4"] {
                        grid-template-columns: repeat(2, 1fr) !important;
                    }
                    div[style*="grid-template-columns: repeat(3"] {
                        grid-template-columns: 1fr !important;
                    }
                }
                @media (max-width: 600px) {
                    div[style*="grid-template-columns: repeat(2"] {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>

            <Footer />
        </div>
    );
}
