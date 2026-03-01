'use client';

import { useEffect, useRef } from 'react';
import { SignIn, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import AuthLayout from '../components/AuthLayout';

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
            <AuthLayout>
                <div style={styles.loadingContainer}>
                    <div style={styles.loadingSpinner}></div>
                    <span style={styles.loadingText}>Loading...</span>
                </div>
            </AuthLayout>
        );
    }

    // If signed in, show redirecting message
    if (isSignedIn) {
        return (
            <AuthLayout>
                <div style={styles.loadingContainer}>
                    <div style={styles.loadingSpinner}></div>
                    <span style={styles.loadingText}>Redirecting...</span>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            <SignIn
                appearance={{
                    elements: {
                        rootBox: {
                            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                            borderRadius: '16px',
                            width: '100%',
                        },
                        card: {
                            borderRadius: '16px',
                            border: '1px solid #e5e7eb',
                        },
                        headerTitle: {
                            color: '#111827',
                            fontSize: '24px',
                            fontWeight: 600,
                        },
                        headerSubtitle: {
                            color: '#6b7280',
                            fontSize: '14px',
                        },
                        formButtonPrimary: {
                            background: 'linear-gradient(135deg, #693fe9 0%, #5835c7 100%)',
                            boxShadow: '0 4px 16px rgba(105, 63, 233, 0.3)',
                            fontSize: '14px',
                            fontWeight: 500,
                            padding: '12px 20px',
                            borderRadius: '10px',
                            transition: 'all 0.2s ease',
                        },
                        formButtonPrimaryHover: {
                            background: 'linear-gradient(135deg, #5b36d6 0%, #4a2db3 100%)',
                            boxShadow: '0 6px 20px rgba(105, 63, 233, 0.4)',
                        },
                        footerActionLink: {
                            color: '#693fe9',
                            fontWeight: 500,
                        },
                        footerActionLinkHover: {
                            color: '#5b36d6',
                        },
                        dividerLine: {
                            background: '#e5e7eb',
                        },
                        dividerText: {
                            color: '#6b7280',
                            fontSize: '13px',
                        },
                        socialButtonsBlockButton: {
                            border: '1px solid #e5e7eb',
                            borderRadius: '10px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        },
                        socialButtonsBlockButtonHover: {
                            background: '#f9fafb',
                            border: '1px solid #d1d5db',
                        },
                        formFieldInput: {
                            borderRadius: '10px',
                            border: '1px solid #e5e7eb',
                            fontSize: '14px',
                        },
                        formFieldInputFocus: {
                            borderColor: '#693fe9',
                            boxShadow: '0 0 0 3px rgba(105, 63, 233, 0.1)',
                        },
                        identityPreviewText: {
                            color: '#6b7280',
                        },
                        formFieldLabel: {
                            color: '#374151',
                            fontSize: '14px',
                            fontWeight: 500,
                        },
                    },
                }}
                routing="hash"
                signUpUrl="/signup"
                fallbackRedirectUrl="/auth-callback"
            />
        </AuthLayout>
    );
}

const styles: Record<string, React.CSSProperties> = {
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        minHeight: '200px',
    },
    loadingSpinner: {
        width: '40px',
        height: '40px',
        border: '3px solid #e5e7eb',
        borderTopColor: '#693fe9',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '16px',
    },
    loadingText: {
        color: '#6b7280',
        fontSize: '14px',
    },
};

// Add keyframes for spinner
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }
    `;
    document.head.appendChild(styleSheet);
}
