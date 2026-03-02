'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';

export default function AuthCallbackPage() {
    const router = useRouter();
    const { isSignedIn, isLoaded } = useAuth();
    const { user: clerkUser } = useUser();
    const [status, setStatus] = useState('Authenticating...');
    const [error, setError] = useState('');
    const hasSynced = useRef(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        // Prevent multiple syncs
        if (hasSynced.current) return;

        if (!isLoaded) return;

        if (!isSignedIn) {
            router.push('/login');
            return;
        }

        // Skip if already has valid token - redirect to dashboard immediately
        const existingToken = localStorage.getItem('authToken');
        if (existingToken) {
            router.push('/dashboard');
            return;
        }

        // Mark as synced to prevent multiple syncs
        hasSynced.current = true;

        // Set a timeout to redirect to dashboard after 10 seconds
        // This ensures users don't get stuck if the sync hangs
        timeoutRef.current = setTimeout(() => {
            console.log('Auth callback timeout - redirecting to dashboard');
            router.push('/dashboard');
        }, 10000);

        // Sync with our backend
        const syncUser = async () => {
            try {
                setStatus('Syncing your account...');

                const email = clerkUser?.primaryEmailAddress?.emailAddress;
                const name = clerkUser?.fullName || clerkUser?.firstName || email?.split('@')[0];

                if (!email) {
                    setError('No email found in your account');
                    return;
                }

                // Read referral code stored during signup
                const referralCode = localStorage.getItem('referralCode') || undefined;

                // Call our sync API to create/update user and get token
                const response = await fetch('/api/auth/clerk-sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        clerkUserId: clerkUser?.id,
                        email,
                        name,
                        referralCode
                    })
                });

                const data = await response.json();

                if (data.success && data.token) {
                    // Store token in localStorage
                    localStorage.setItem('authToken', data.token);
                    // Clean up referral code after successful sync
                    localStorage.removeItem('referralCode');

                    setStatus('Success! Redirecting...');

                    // Clear the timeout since we're about to redirect
                    if (timeoutRef.current) {
                        clearTimeout(timeoutRef.current);
                    }

                    // Always redirect to dashboard - dashboard will handle plan checks
                    router.push('/dashboard');
                } else {
                    setError(data.error || 'Failed to sync account');
                }
            } catch (err) {
                console.error('Sync error:', err);
                // On error, redirect to dashboard anyway - the user is authenticated with Clerk
                // and can still use the app. The sync will be retried on next visit.
                router.push('/dashboard');
            }
        };

        syncUser();
    }, [isLoaded, isSignedIn, clerkUser, router]);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #693fe9 0%, #5835c7 50%, #4a2db3 100%)',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            <div style={{
                background: 'white',
                padding: '40px',
                borderRadius: '20px',
                textAlign: 'center',
                boxShadow: '0 25px 80px rgba(0,0,0,0.3)',
                maxWidth: '400px',
                width: '90%'
            }}>
                {error ? (
                    <>
                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
                        <h2 style={{ color: '#ef4444', marginBottom: '16px' }}>Authentication Error</h2>
                        <p style={{ color: '#666', marginBottom: '24px' }}>{error}</p>
                        <button 
                            onClick={() => router.push('/login')}
                            style={{
                                padding: '12px 24px',
                                background: 'linear-gradient(135deg, #693fe9 0%, #5835c7 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            Back to Login
                        </button>
                    </>
                ) : (
                    <>
                        <div style={{ 
                            fontSize: '48px', 
                            marginBottom: '20px',
                            animation: 'spin 1s linear infinite'
                        }}>⚡</div>
                        <h2 style={{ color: '#333', marginBottom: '8px' }}>{status}</h2>
                        <p style={{ color: '#666' }}>Please wait while we set up your account...</p>
                    </>
                )}
                <style>{`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        </div>
    );
}
