'use client';

import { SignUp, useAuth } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef } from 'react';

export default function SignupPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #693fe9 0%, #5835c7 50%, #4a2db3 100%)' }}><div style={{ color: 'white', fontSize: '18px' }}>Loading...</div></div>}>
            <SignupContent />
        </Suspense>
    );
}

function SignupContent() {
    const { isSignedIn, isLoaded } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const hasRedirected = useRef(false);

    // Capture referral code from URL and persist in localStorage
    useEffect(() => {
        const ref = searchParams.get('ref');
        if (ref) {
            localStorage.setItem('referralCode', ref);
        }
    }, [searchParams]);

    useEffect(() => {
        // Prevent multiple redirects
        if (hasRedirected.current) return;
        hasRedirected.current = true;

        if (isLoaded && isSignedIn) {
            // User already signed in - redirect to auth-callback to complete sync
            // Don't redirect to /plans here as it conflicts with fallbackRedirectUrl
            router.push('/auth-callback');
        }
    }, [isLoaded, isSignedIn]);

    if (!isLoaded) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #693fe9 0%, #5835c7 50%, #4a2db3 100%)',
            }}>
                <div style={{ color: 'white', fontSize: '18px' }}>Loading...</div>
            </div>
        );
    }

    if (isSignedIn) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #693fe9 0%, #5835c7 50%, #4a2db3 100%)',
            }}>
                <div style={{ color: 'white', fontSize: '18px' }}>Redirecting...</div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #693fe9 0%, #5835c7 50%, #4a2db3 100%)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            position: 'relative',
            overflow: 'hidden',
            padding: '20px'
        }}>
            {/* Decorative Elements */}
            <div style={{ position: 'absolute', top: '10%', left: '10%', width: '300px', height: '300px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', filter: 'blur(60px)' }}></div>
            <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '400px', height: '400px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%', filter: 'blur(80px)' }}></div>
            
            <SignUp 
                appearance={{
                    elements: {
                        rootBox: {
                            boxShadow: '0 25px 80px rgba(0,0,0,0.3)',
                            borderRadius: '20px',
                        },
                        card: {
                            borderRadius: '20px',
                        },
                        headerTitle: {
                            color: '#333',
                        },
                        headerSubtitle: {
                            color: '#666',
                        },
                        formButtonPrimary: {
                            background: 'linear-gradient(135deg, #693fe9 0%, #5835c7 100%)',
                            boxShadow: '0 4px 16px rgba(105, 63, 233, 0.3)',
                        },
                        footerActionLink: {
                            color: '#693fe9',
                        },
                    },
                }}
                routing="hash"
                signInUrl="/login"
                fallbackRedirectUrl="/auth-callback"
            />
        </div>
    );
}
