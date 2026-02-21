'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import { useTranslation } from 'react-i18next';

export default function ThankYouPage() {
    const router = useRouter();
    const { user } = useClerk();
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(true);
    const [planName, setPlanName] = useState('');

    useEffect(() => {
        // Get plan info from URL params or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const plan = urlParams.get('plan') || localStorage.getItem('selectedPlan');
        
        if (plan) {
            setPlanName(plan.charAt(0).toUpperCase() + plan.slice(1));
        }
        
        // Simulate loading and verification
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    const goToDashboard = () => {
        router.push('/dashboard');
    };

    if (isLoading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)',
                color: 'white'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                        </svg>
                    </div>
                    <div style={{ fontSize: '18px', opacity: 0.8 }}>Processing your payment...</div>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
            <div style={{
                maxWidth: '600px',
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '60px 40px',
                textAlign: 'center',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
            }}>
                {/* Success Icon */}
                <div style={{
                    width: '80px',
                    height: '80px',
                    margin: '0 auto 30px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'pulse 2s infinite'
                }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5"/>
                    </svg>
                </div>

                {/* Thank You Message */}
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    color: 'white',
                    marginBottom: '20px',
                    lineHeight: '1.2'
                }}>
                    Thank You! 🎉
                </h1>

                <p style={{
                    fontSize: '1.2rem',
                    color: 'rgba(255, 255, 255, 0.8)',
                    marginBottom: '15px',
                    lineHeight: '1.6'
                }}>
                    Your payment was successful and your {planName || 'Premium'} plan is now active!
                </p>

                <p style={{
                    fontSize: '1rem',
                    color: 'rgba(255, 255, 255, 0.6)',
                    marginBottom: '40px',
                    lineHeight: '1.6'
                }}>
                    Welcome to the Kommentify family! You now have access to all premium features including AI-powered comments, advanced automation, and priority support.
                </p>

                {/* User Info */}
                {user && (
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '12px',
                        padding: '20px',
                        marginBottom: '40px',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '15px',
                            marginBottom: '10px'
                        }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '16px'
                            }}>
                                {user.firstName?.charAt(0) || user.emailAddresses[0]?.emailAddress?.charAt(0) || 'U'}
                            </div>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ color: 'white', fontWeight: '600', fontSize: '16px' }}>
                                    {user.firstName || user.emailAddresses[0]?.emailAddress}
                                </div>
                                <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                                    {planName || 'Premium'} Member
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div style={{
                    display: 'flex',
                    gap: '15px',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                }}>
                    <button
                        onClick={goToDashboard}
                        style={{
                            background: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
                            color: 'white',
                            border: 'none',
                            padding: '16px 32px',
                            borderRadius: '12px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 15px rgba(167, 139, 250, 0.3)',
                            minWidth: '200px'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(167, 139, 250, 0.4)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(167, 139, 250, 0.3)';
                        }}
                    >
                        Go to Dashboard
                    </button>

                    <button
                        onClick={() => window.open('https://chromewebstore.google.com/detail/kommentify-linkedin-auto/laeckkpjacbodjglcnenggpdpehkacei', '_blank')}
                        style={{
                            background: 'transparent',
                            color: 'rgba(255, 255, 255, 0.8)',
                            border: '2px solid rgba(255, 255, 255, 0.2)',
                            padding: '14px 30px',
                            borderRadius: '12px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            minWidth: '200px'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                            e.currentTarget.style.color = 'white';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                        }}
                    >
                        Download Extension
                    </button>
                </div>

                {/* Additional Info */}
                <div style={{
                    marginTop: '40px',
                    padding: '20px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(16, 185, 129, 0.2)'
                }}>
                    <h3 style={{
                        color: '#10b981',
                        fontSize: '16px',
                        fontWeight: '600',
                        marginBottom: '10px'
                    }}>
                        What's Next?
                    </h3>
                    <ul style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '14px',
                        lineHeight: '1.8',
                        textAlign: 'left',
                        paddingLeft: '20px'
                    }}>
                        <li>Install the Chrome extension from the Web Store</li>
                        <li>Connect your LinkedIn account</li>
                        <li>Configure your automation settings</li>
                        <li>Start growing your LinkedIn presence!</li>
                    </ul>
                </div>
            </div>

            {/* Add CSS animation */}
            <style jsx>{`
                @keyframes pulse {
                    0% {
                        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
                    }
                    70% {
                        box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
                    }
                    100% {
                        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
                    }
                }
            `}</style>
        </div>
    );
}
