'use client';

import { useState } from 'react';
import Link from 'next/link';

// Icon Components
const IconFire = ({ size = 16, color = '#f59e0b' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
        <path d="M12 23c-3.866 0-7-2.686-7-6 0-2.5 1.5-4.5 3-6 .5 2.5 2 3 2 3s-1-3 1-6c0 0 3 1 4 4 .5-1 1-2 1-2s2.5 3.5 2.5 7c0 3.314-2.634 6-6.5 6z"/>
    </svg>
);

const IconRocket = ({ size = 16, color = '#693fe9' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
    </svg>
);

const IconMenu = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
    </svg>
);

const IconX = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
);

interface HeaderProps {
    showBanner?: boolean;
}

export default function Header({ showBanner = true }: HeaderProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            {/* Launch Week Banner */}
            {showBanner && (
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
            )}

            {/* Navigation */}
            <nav className="nav-padding" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 60px',
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                position: 'sticky',
                top: 0,
                zIndex: 1000
            }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                    <img src="/favicon.png" alt="Kommentify" style={{ width: '36px', height: '36px', borderRadius: '8px' }} />
                    <span style={{ fontSize: '20px', fontWeight: '700', color: 'white' }}>Kommentify</span>
                </Link>
                
                <div className="desktop-nav" style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
                    <Link href="/features" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }}>Features</Link>
                    <Link href="/#pricing" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }}>Pricing</Link>
                    <Link href="/#comparison" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }}>Compare</Link>
                    <Link href="/lifetime-deal" style={{ color: '#f59e0b', textDecoration: 'none', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <IconFire size={14} color="#f59e0b" /> Lifetime Deal
                    </Link>
                    <Link href="/login" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }}>Login</Link>
                    <Link href="/signup" style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        padding: '10px 20px', 
                        background: 'linear-gradient(135deg, #693fe9, #8b5cf6)', 
                        color: 'white', 
                        textDecoration: 'none', 
                        borderRadius: '8px', 
                        fontSize: '14px', 
                        fontWeight: '600',
                        boxShadow: '0 4px 15px rgba(105, 63, 233, 0.3)',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                    }}>
                        Get Started <IconRocket size={14} color="white" />
                    </Link>
                </div>
                
                <button 
                    className="mobile-menu-btn" 
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                    style={{ display: 'none', background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '8px' }}
                >
                    {mobileMenuOpen ? <IconX size={24} /> : <IconMenu size={24} />}
                </button>
            </nav>
            
            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div style={{ 
                    position: 'fixed', 
                    top: '70px', 
                    left: 0, 
                    right: 0, 
                    bottom: 0, 
                    background: 'rgba(0,0,0,0.95)', 
                    zIndex: 999, 
                    padding: '20px' 
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <Link href="/" onClick={() => setMobileMenuOpen(false)} style={{ color: 'white', textDecoration: 'none', fontSize: '18px', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Home</Link>
                        <Link href="/features" onClick={() => setMobileMenuOpen(false)} style={{ color: 'white', textDecoration: 'none', fontSize: '18px', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Features</Link>
                        <Link href="/#pricing" onClick={() => setMobileMenuOpen(false)} style={{ color: 'white', textDecoration: 'none', fontSize: '18px', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Pricing</Link>
                        <Link href="/lifetime-deal" onClick={() => setMobileMenuOpen(false)} style={{ color: '#f59e0b', textDecoration: 'none', fontSize: '18px', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <IconFire size={18} /> Lifetime Deal
                        </Link>
                        <Link href="/login" onClick={() => setMobileMenuOpen(false)} style={{ color: 'white', textDecoration: 'none', fontSize: '18px', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Login</Link>
                        <Link href="/signup" onClick={() => setMobileMenuOpen(false)} style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '8px', 
                            padding: '14px', 
                            background: 'linear-gradient(135deg, #693fe9, #8b5cf6)', 
                            color: 'white', 
                            textDecoration: 'none', 
                            borderRadius: '8px', 
                            fontSize: '16px', 
                            fontWeight: '600', 
                            marginTop: '12px' 
                        }}>
                            Get Started <IconRocket size={16} color="white" />
                        </Link>
                    </div>
                </div>
            )}
        </>
    );
}
