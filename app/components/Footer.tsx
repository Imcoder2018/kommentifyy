'use client';

import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="footer-section" style={{ 
            padding: '50px 60px 30px', 
            background: '#050505', 
            borderTop: '1px solid rgba(255,255,255,0.05)',
            color: 'white'
        }}>
            <style>{`
                @media (max-width: 768px) {
                    .footer-section {
                        padding: 40px 20px 25px !important;
                    }
                    .footer-grid {
                        grid-template-columns: 1fr 1fr !important;
                        gap: 30px !important;
                    }
                    .footer-brand {
                        grid-column: 1 / -1 !important;
                        text-align: center !important;
                    }
                    .footer-brand > div:first-child {
                        justify-content: center !important;
                    }
                    .footer-bottom {
                        flex-direction: column !important;
                        text-align: center !important;
                        gap: 10px !important;
                    }
                }
                @media (max-width: 480px) {
                    .footer-grid {
                        grid-template-columns: 1fr !important;
                        gap: 25px !important;
                        text-align: center !important;
                    }
                    .footer-links {
                        align-items: center !important;
                    }
                }
            `}</style>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Main Footer Content */}
                <div className="footer-grid" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(4, 1fr)', 
                    gap: '40px',
                    marginBottom: '40px'
                }}>
                    {/* Brand */}
                    <div className="footer-brand">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                            <img src="/favicon.png" alt="Kommentify" style={{ width: '32px', height: '32px', borderRadius: '6px' }} />
                            <span style={{ fontSize: '18px', fontWeight: '600' }}>Kommentify</span>
                        </div>
                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.6', marginBottom: '12px' }}>
                            AI-powered LinkedIn automation to grow your presence effortlessly.
                        </p>
                        {/* Trust Badges */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <a href="https://chromewebstore.google.com/detail/kommentify-linkedin-auto/laeckkpjacbodjglcnenggpdpehkacei" target="_blank" rel="noopener noreferrer" style={{ color: '#fbbf24', textDecoration: 'none', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                ★★★★★ 5.0 Rated | 500+ Users
                            </a>
                        </div>
                        
                        {/* Social Media Buttons */}
                        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                            <a 
                                href="https://www.linkedin.com/company/kommentify/" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    width: '32px', 
                                    height: '32px', 
                                    borderRadius: '6px', 
                                    background: '#0077B5', 
                                    color: 'white', 
                                    textDecoration: 'none',
                                    transition: 'transform 0.2s ease, background 0.2s ease'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.background = '#005885';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.background = '#0077B5';
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                                </svg>
                            </a>
                            <a 
                                href="https://www.facebook.com/Kommentify" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    width: '32px', 
                                    height: '32px', 
                                    borderRadius: '6px', 
                                    background: '#1877F2', 
                                    color: 'white', 
                                    textDecoration: 'none',
                                    transition: 'transform 0.2s ease, background 0.2s ease'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.background = '#0C5ADB';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.background = '#1877F2';
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '15px', color: 'rgba(255,255,255,0.8)' }}>Product</h4>
                        <div className="footer-links" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <Link href="/#features" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '13px' }}>Features</Link>
                            <Link href="/pricing" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '13px' }}>Pricing</Link>
                            <Link href="/#comparison" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '13px' }}>Compare</Link>
                            <Link href="/lifetime-deal" style={{ color: '#f59e0b', textDecoration: 'none', fontSize: '13px' }}>🔥 Lifetime Deal</Link>
                            <a href="https://chromewebstore.google.com/detail/kommentify-linkedin-auto/laeckkpjacbodjglcnenggpdpehkacei" target="_blank" rel="noopener noreferrer" style={{ color: '#10b981', textDecoration: 'none', fontSize: '13px', fontWeight: '500' }}>🌐 Download Extension</a>
                        </div>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '15px', color: 'rgba(255,255,255,0.8)' }}>Company</h4>
                        <div className="footer-links" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <Link href="/about" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '13px' }}>About Us</Link>
                            <Link href="/blog" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '13px' }}>Blog</Link>
                            <Link href="/contact" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '13px' }}>Contact Us</Link>
                            <Link href="/#faq" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '13px' }}>FAQ</Link>
                            <Link href="/referral" style={{ color: '#22c55e', textDecoration: 'none', fontSize: '13px' }}>🏆 Referral Program</Link>
                        </div>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '15px', color: 'rgba(255,255,255,0.8)' }}>Legal</h4>
                        <div className="footer-links" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <Link href="/privacy-policy" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '13px' }}>Privacy Policy</Link>
                            <Link href="/terms" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '13px' }}>Terms & Conditions</Link>
                            <Link href="/refund-policy" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '13px' }}>Refund Policy</Link>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="footer-bottom" style={{ 
                    borderTop: '1px solid rgba(255,255,255,0.08)', 
                    paddingTop: '20px', 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '15px'
                }}>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
                        © 2026 Kommentify. All rights reserved.
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>
                        Developed by <a href="https://www.arwebcrafts.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'underline' }}>AR Webcrafts LLC</a>.
                    </div>
                </div>
            </div>
        </footer>
    );
}
