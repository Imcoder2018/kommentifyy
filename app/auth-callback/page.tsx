'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';

export default function AuthCallbackPage() {
    const router = useRouter();
    const { isSignedIn, isLoaded } = useAuth();
    const { user: clerkUser } = useUser();
    const [status, setStatus] = useState('Authenticating...');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isLoaded) return;

        if (!isSignedIn) {
            router.push('/login');
            return;
        }

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

                // Call our sync API to create/update user and get token
                const response = await fetch('/api/auth/clerk-sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        clerkUserId: clerkUser?.id,
                        email,
                        name
                    })
                });

                const data = await response.json();

                if (data.success && data.token) {
                    // Store token in localStorage
                    localStorage.setItem('authToken', data.token);
                    
                    setStatus('Success! Redirecting...');
                    
                    // Redirect based on plan - check for paid plans, lifetime deals, or active trials
                    const userPlan = data.user?.plan;
                    const hasPaidPlan = userPlan && (
                        (userPlan.price > 0 && !userPlan.isDefaultFreePlan) ||
                        userPlan.isLifetime ||
                        (userPlan.isTrialPlan && data.user?.trialEndsAt && new Date(data.user.trialEndsAt) > new Date())
                    );
                    router.push(hasPaidPlan ? '/dashboard' : '/plans');
                } else {
                    setError(data.error || 'Failed to sync account');
                }
            } catch (err) {
                console.error('Sync error:', err);
                setError('Failed to sync your account. Please try again.');
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
