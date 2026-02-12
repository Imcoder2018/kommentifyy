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
                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.6' }}>
                            AI-powered LinkedIn automation to grow your presence effortlessly.
                        </p>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '15px', color: 'rgba(255,255,255,0.8)' }}>Product</h4>
                        <div className="footer-links" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <Link href="/#features" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '13px' }}>Features</Link>
                            <Link href="/#pricing" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '13px' }}>Pricing</Link>
                            <Link href="/#comparison" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '13px' }}>Compare</Link>
                            <Link href="/lifetime-deal" style={{ color: '#f59e0b', textDecoration: 'none', fontSize: '13px' }}>🔥 Lifetime Deal</Link>
                            <a href="https://chromewebstore.google.com/detail/kommentify-linkedin-auto/laeckkpjacbodjglcnenggpdpehkacei" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '13px' }}>Get Extension</a>
                        </div>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '15px', color: 'rgba(255,255,255,0.8)' }}>Company</h4>
                        <div className="footer-links" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <Link href="/about" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '13px' }}>About Us</Link>
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
