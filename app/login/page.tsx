'use client';

import { useEffect, useRef } from 'react';
import { SignIn, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const { isSignedIn, isLoaded } = useAuth();
    const router = useRouter();
    const redirecting = useRef(false);

    useEffect(() => {
        // Skip if still loading or already redirecting
        if (!isLoaded || redirecting.current) return;

        if (isSignedIn) {
            // User is already signed in via Clerk
            // Check if we have a valid authToken - if not, go to auth-callback to sync
            const authToken = localStorage.getItem('authToken');

            redirecting.current = true;

            if (authToken) {
                // Token exists, go to dashboard
                router.push('/dashboard');
            } else {
                // No token - need to sync with backend first
                router.push('/auth-callback');
            }
        }
    }, [isLoaded, isSignedIn, router]);

    // Show loading while checking auth state
    if (!isLoaded || redirecting.current) {
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

    // If signed in, show redirecting message
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
            
            <SignIn 
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
                signUpUrl="/signup"
                fallbackRedirectUrl="/auth-callback"
            />
        </div>
    );
}
