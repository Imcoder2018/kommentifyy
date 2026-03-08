import { useState, useEffect, useCallback } from 'react';

// ============================================
// THEME-AWARE COLOR HELPERS
// ============================================
const getThemeColors = (theme: string) => ({
    isLight: theme === 'light',
    bg: theme === 'light' ? '#ffffff' : 'rgba(17, 24, 39, 0.98)',
    bgSubtle: theme === 'light' ? '#f9fafb' : 'rgba(255,255,255,0.03)',
    text: theme === 'light' ? '#111827' : 'white',
    textMuted: theme === 'light' ? '#4b5563' : 'rgba(255,255,255,0.7)',
    textDim: theme === 'light' ? '#6b7280' : 'rgba(255,255,255,0.5)',
    textDimmest: theme === 'light' ? '#9ca3af' : 'rgba(255,255,255,0.4)',
    border: theme === 'light' ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.08)',
    borderStrong: theme === 'light' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.12)',
    shadow: theme === 'light' ? '0 8px 32px rgba(0, 0, 0, 0.12)' : '0 8px 32px rgba(0, 0, 0, 0.4)',
    inputBg: theme === 'light' ? '#f9fafb' : 'rgba(255,255,255,0.05)',
    inputBorder: theme === 'light' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.1)',
});

// ============================================
// STYLE CONSTANTS (UI/UX Improvements)
// ============================================

// Spacing tokens - improved with md: 16px, lg: 20px, xl: 24px
const SPACING = {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '20px',
    xl: '24px',
    xxl: '28px',
    xxxl: '32px',
};

// Color constants - updated with primary purple
const COLORS = {
    primary: '#693fe9',
    primaryLight: '#8b5cf6',
    primaryDark: '#553c9a',
    blue: '#3b82f6',
    blueDark: '#2563eb',
    blueLight: '#60a5fa',
    green: '#10b981',
    greenDark: '#059669',
    greenLight: '#34d399',
    purple: '#a855f7',
    purpleDark: '#7c3aed',
    purpleLight: '#c4b5fd',
    violet: '#8b5cf6',
    violetLight: '#a78bfa',
    yellow: '#f59e0b',
    yellowDark: '#d97706',
    yellowLight: '#fbbf24',
    red: '#ef4444',
    redLight: '#f87171',
    white: 'white',
    whiteMuted: 'rgba(255,255,255,0.7)',
    whiteDim: 'rgba(255,255,255,0.5)',
    whiteDimmest: 'rgba(255,255,255,0.4)',
    whiteSubtle: 'rgba(255,255,255,0.15)',
    whiteSubtleBorder: 'rgba(255,255,255,0.1)',
    bgSubtle: 'rgba(255,255,255,0.03)',
    bgCard: 'rgba(255,255,255,0.04)',
};

// Typography
const TYPOGRAPHY = {
    fontSizeXs: '11px',
    fontSizeSm: '12px',
    fontSizeMd: '14px',
    fontSizeLg: '16px',
    fontSizeXl: '18px',
    fontSizeXxl: '20px',
    fontSizeTitle: '24px',
    fontWeightNormal: '400',
    fontWeightMedium: '500',
    fontWeightSemibold: '600',
    fontWeightBold: '700',
};

// Animation keyframes (injected via globalStyles)
const ANIMATIONS = {
    fadeIn: 'fadeIn 0.3s ease-out',
    slideIn: 'slideIn 0.3s ease-out',
    shimmer: 'shimmer 1.5s infinite',
};

// Reusable style objects - improved with all UI/UX updates
const styles = {
    // Card styles - reduced border-radius to 12px, more subtle backgrounds
    card: {
        background: 'rgba(255,255,255,0.03)',
        padding: SPACING.lg,
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.08)',
        marginBottom: SPACING.lg,
        transition: 'all 0.2s ease',
    },
    cardSmall: {
        background: 'rgba(255,255,255,0.03)',
        padding: SPACING.md,
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.08)',
    },
    cardHover: {
        background: 'rgba(255,255,255,0.05)',
        borderColor: 'rgba(255,255,255,0.12)',
        transform: 'translateY(-1px)',
    },
    // Section titles - increased font sizes (18-24px)
    sectionTitle: {
        color: 'white',
        fontSize: TYPOGRAPHY.fontSizeXl,
        fontWeight: TYPOGRAPHY.fontWeightBold,
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    sectionSubtitle: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: TYPOGRAPHY.fontSizeSm,
    },
    // Labels - improved (12px, 600 weight, uppercase)
    label: {
        display: 'block',
        color: 'rgba(255,255,255,0.7)',
        fontSize: '12px',
        fontWeight: TYPOGRAPHY.fontWeightSemibold,
        marginBottom: '6px',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px',
    },
    // Input styles - increased padding to 10px 14px
    input: {
        width: '100%',
        padding: '10px 14px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        color: 'white',
        fontSize: TYPOGRAPHY.fontSizeSm,
        outline: 'none',
        transition: 'all 0.2s ease',
    },
    inputFocus: {
        borderColor: '#693fe9',
        boxShadow: '0 0 0 3px rgba(105,63,233,0.2)',
    },
    // Select styles - with custom arrow
    select: {
        width: '100%',
        padding: '10px 14px',
        paddingRight: '36px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        color: 'white',
        fontSize: TYPOGRAPHY.fontSizeSm,
        outline: 'none',
        transition: 'all 0.2s ease',
        appearance: 'none' as const,
        cursor: 'pointer',
    },
    // Primary button - gradient, shadows, hover transforms
    buttonPrimary: {
        padding: '12px 24px',
        background: 'linear-gradient(135deg, #693fe9 0%, #8b5cf6 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        fontWeight: TYPOGRAPHY.fontWeightBold,
        fontSize: TYPOGRAPHY.fontSizeMd,
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(105,63,233,0.4)',
        transition: 'all 0.2s ease',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
    },
    buttonPrimaryHover: {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(105,63,233,0.5)',
    },
    buttonSecondary: {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '8px',
        color: 'rgba(255,255,255,0.7)',
        padding: '8px 16px',
        fontSize: TYPOGRAPHY.fontSizeSm,
        cursor: 'pointer',
        fontWeight: TYPOGRAPHY.fontWeightSemibold,
        transition: 'all 0.2s ease',
    },
    buttonSmall: {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '6px',
        color: 'rgba(255,255,255,0.6)',
        padding: '6px 12px',
        fontSize: TYPOGRAPHY.fontSizeSm,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    // Loading and error states
    loadingText: {
        textAlign: 'center' as const,
        padding: '24px 0',
        color: 'rgba(255,255,255,0.5)',
    },
    errorText: {
        color: '#f87171',
        fontSize: TYPOGRAPHY.fontSizeSm,
    },
    successText: {
        color: '#34d399',
        fontSize: TYPOGRAPHY.fontSizeSm,
    },
    // Toggle styles - larger tracks (44x24px) with smoother transitions
    toggleTrack: (isActive: boolean, color: string) => ({
        width: '44px',
        height: '24px',
        borderRadius: '12px',
        background: isActive ? color : 'rgba(255,255,255,0.1)',
        position: 'relative' as const,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        flexShrink: 0,
    }),
    toggleThumb: (isActive: boolean) => ({
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: 'white',
        position: 'absolute' as const,
        top: '2px',
        left: isActive ? '22px' : '2px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    }),
    toggleContainer: (isActive: boolean, activeColor: string, activeBgColor: string) => ({
        background: isActive ? activeBgColor : 'rgba(255,255,255,0.02)',
        padding: SPACING.md,
        borderRadius: '12px',
        border: `1px solid ${isActive ? activeColor : 'rgba(255,255,255,0.08)'}`,
        marginBottom: SPACING.md,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    }),
    // Focus indicator with purple glow
    focusIndicator: {
        outline: '2px solid #693fe9',
        outlineOffset: '2px',
    },
    // Spinner animation
    spinner: {
        display: 'inline-block',
        width: '14px',
        height: '14px',
        border: '2px solid rgba(255,255,255,0.3)',
        borderTopColor: 'white',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    },
    // Badge styles
    badge: (variant: 'success' | 'warning' | 'error' | 'info' | 'default') => {
        const variants = {
            success: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', color: '#34d399' },
            warning: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', color: '#fbbf24' },
            error: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', color: '#f87171' },
            info: { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)', color: '#60a5fa' },
            default: { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' },
        };
        const v = variants[variant] || variants.default;
        return {
            background: v.bg,
            padding: '4px 10px',
            borderRadius: '6px',
            border: `1px solid ${v.border}`,
            color: v.color,
            fontSize: TYPOGRAPHY.fontSizeXs,
            fontWeight: TYPOGRAPHY.fontWeightSemibold,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
        };
    },
    // Skeleton loader with shimmer
    skeleton: {
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '8px',
        animation: 'shimmer 1.5s infinite',
        backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)',
        backgroundSize: '200% 100%',
    },
    // Empty state
    emptyState: {
        textAlign: 'center' as const,
        padding: '48px 24px',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '12px',
        border: '1px dashed rgba(255,255,255,0.1)',
    },
    emptyStateIcon: {
        width: '64px',
        height: '64px',
        margin: '0 auto 16px',
        background: 'rgba(105,63,233,0.1)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyStateTitle: {
        color: 'white',
        fontSize: TYPOGRAPHY.fontSizeLg,
        fontWeight: TYPOGRAPHY.fontWeightBold,
        marginBottom: '8px',
    },
    emptyStateDesc: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: TYPOGRAPHY.fontSizeSm,
        marginBottom: '16px',
    },
    // Profile card
    profileCard: {
        background: 'rgba(255,255,255,0.03)',
        padding: '16px 20px',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.08)',
        transition: 'all 0.2s ease',
    },
    profileCardSelected: {
        background: 'rgba(105,63,233,0.08)',
        borderColor: 'rgba(105,63,233,0.25)',
    },
    avatar: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #693fe9 0%, #8b5cf6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: TYPOGRAPHY.fontWeightBold,
        fontSize: TYPOGRAPHY.fontSizeMd,
    },
    // Divider
    divider: {
        height: '1px',
        background: 'rgba(255,255,255,0.08)',
        margin: SPACING.md + ' 0',
    },

    // ============================================
    // SIDEBAR STYLES (Comment Style Sources - Below Header)
    // ============================================
    sidebar: {
        width: '360px',
        background: 'rgba(17, 24, 39, 0.98)',
        backdropFilter: 'blur(12px)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.08)',
        borderLeft: '3px solid #8b5cf6',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(139, 92, 246, 0.1)',
        padding: SPACING.lg,
        maxHeight: 'calc(100vh - 300px)',
        overflowY: 'auto' as const,
        zIndex: 50,
    },
    // RIGHT SIDEBAR STYLES (Comment Settings - Below Header)
    rightSidebar: {
        width: '400px',
        background: 'rgba(17, 24, 39, 0.98)',
        backdropFilter: 'blur(12px)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.08)',
        borderLeft: '3px solid #3b82f6',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(59, 130, 246, 0.1)',
        padding: SPACING.lg,
        maxHeight: 'calc(100vh - 300px)',
        overflowY: 'auto' as const,
        zIndex: 50,
    },
    sidebarHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    sidebarTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    sidebarTitleText: {
        color: 'white',
        fontSize: TYPOGRAPHY.fontSizeLg,
        fontWeight: TYPOGRAPHY.fontWeightBold,
        margin: 0,
    },
    profileCountBadge: {
        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        color: 'white',
        fontSize: TYPOGRAPHY.fontSizeXs,
        fontWeight: TYPOGRAPHY.fontWeightSemibold,
        padding: '2px 8px',
        borderRadius: '12px',
        minWidth: '24px',
        textAlign: 'center' as const,
    },
    refreshButton: {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        padding: '8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        color: 'rgba(255,255,255,0.6)',
    },
    inputLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        color: 'rgba(255,255,255,0.7)',
        fontSize: TYPOGRAPHY.fontSizeXs,
        fontWeight: TYPOGRAPHY.fontWeightSemibold,
        marginBottom: '8px',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px',
    },
    inputWithIcon: {
        position: 'relative' as const,
        marginBottom: SPACING.md,
    },
    inputIcon: {
        position: 'absolute' as const,
        left: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: 'rgba(255,255,255,0.4)',
        pointerEvents: 'none' as const,
    },
    addButton: {
        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '10px 16px',
        fontWeight: TYPOGRAPHY.fontWeightSemibold,
        fontSize: TYPOGRAPHY.fontSizeSm,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
    },
    accordionHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 0',
        cursor: 'pointer',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        marginBottom: '12px',
    },
    accordionTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    accordionTitleText: {
        color: 'white',
        fontSize: TYPOGRAPHY.fontSizeSm,
        fontWeight: TYPOGRAPHY.fontWeightSemibold,
    },
    accordionBadge: {
        background: 'rgba(255,255,255,0.08)',
        color: 'rgba(255,255,255,0.5)',
        fontSize: TYPOGRAPHY.fontSizeXs,
        padding: '2px 6px',
        borderRadius: '6px',
    },
    chevron: {
        color: 'rgba(255,255,255,0.4)',
        transition: 'transform 0.2s ease',
    },
    sidebarProfileCard: {
        background: 'rgba(255,255,255,0.03)',
        padding: '12px 14px',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.06)',
        transition: 'all 0.2s ease',
        marginBottom: '8px',
    },
    sidebarProfileCardHover: {
        transform: 'translateX(4px)',
        borderColor: 'rgba(139, 92, 246, 0.3)',
        background: 'rgba(139, 92, 246, 0.05)',
    },
    profileAvatar: {
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: TYPOGRAPHY.fontWeightBold,
        fontSize: TYPOGRAPHY.fontSizeSm,
        flexShrink: 0,
    },
    profileName: {
        color: 'white',
        fontSize: '13px',
        fontWeight: TYPOGRAPHY.fontWeightMedium,
    },
    profileCommentCount: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: '11px',
    },
    actionButton: {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '6px',
        padding: '6px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        color: 'rgba(255,255,255,0.5)',
    },
    deleteButton: {
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '6px',
        padding: '6px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        color: '#f87171',
    },
    trainingBanner: {
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.1) 100%)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        borderRadius: '10px',
        padding: '12px 14px',
        marginTop: SPACING.md,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    trainingDot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: '#10b981',
        animation: 'pulse 2s ease-in-out infinite',
        flexShrink: 0,
    },
    trainingText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: TYPOGRAPHY.fontSizeSm,
    },
    sharedProfileChip: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(245, 158, 11, 0.08)',
        padding: '6px 10px',
        borderRadius: '8px',
        border: '1px solid rgba(245, 158, 11, 0.2)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
};

// ============================================
// KEYBOARD HANDLER FOR TOGGLES
// ============================================
const handleToggleKeyDown = (e: React.KeyboardEvent, onToggle: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onToggle();
    }
};

// ============================================
// CSS FOR ANIMATIONS AND RESPONSIVE
// ============================================
const globalStyles = `
    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
    }

    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }

    @keyframes pulseGreen {
        0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
        50% { opacity: 0.8; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0); }
    }

    .fade-in {
        animation: fadeIn 0.3s ease-out forwards;
    }

    .slide-in {
        animation: slideIn 0.3s ease-out forwards;
    }

    .stagger-1 { animation-delay: 0.05s; }
    .stagger-2 { animation-delay: 0.1s; }
    .stagger-3 { animation-delay: 0.15s; }
    .stagger-4 { animation-delay: 0.2s; }
    .stagger-5 { animation-delay: 0.25s; }

    .skeleton {
        background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        border-radius: 8px;
    }

    @media (max-width: 768px) {
        .comment-tab-grid {
            grid-template-columns: 1fr !important;
        }
        .comment-tab-toggle {
            padding: 10px 12px !important;
        }
        .comment-tab-card {
            padding: 12px 14px !important;
        }
    }

    /* Sidebar responsive styles */
    @media (max-width: 1200px) {
        .style-sources-sidebar {
            position: relative !important;
            width: 100% !important;
            max-width: 100% !important;
            top: 0 !important;
            margin-bottom: 24px;
        }
    }

    /* Custom scrollbar */
    ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
    }
    ::-webkit-scrollbar-track {
        background: rgba(255,255,255,0.02);
        border-radius: 3px;
    }
    ::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.15);
        border-radius: 3px;
    }
    ::-webkit-scrollbar-thumb:hover {
        background: rgba(255,255,255,0.25);
    }

    /* Select arrow */
    .select-arrow {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        pointer-events: none;
        color: rgba(255,255,255,0.5);
    }
`;

export default function CommentsTab(props: any) {
    // Destructure everything from props to keep variable names identical to original
    const {
        // Core
        t, user, usage, router, miniIcon, showToast, setActiveTab, isFreePlan, showUpgradeModal, setShowUpgradeModal, dashLang, isDeveloper,
        // Writer
        writerTopic, setWriterTopic, writerTemplate, setWriterTemplate, writerTone, setWriterTone,
        writerLength, setWriterLength, writerHashtags, setWriterHashtags, writerEmojis, setWriterEmojis,
        writerLanguage, setWriterLanguage, writerAdvancedOpen, setWriterAdvancedOpen,
        writerTargetAudience, setWriterTargetAudience, writerKeyMessage, setWriterKeyMessage,
        writerBackground, setWriterBackground, writerContent, setWriterContent,
        writerGenerating, writerScheduleDate, setWriterScheduleDate, writerScheduleTime, setWriterScheduleTime,
        writerDrafts, writerScheduledPosts, writerTokenUsage, writerImageFile, setWriterImageFile,
        writerImageUrl, setWriterImageUrl, writerMediaBlobUrl, setWriterMediaBlobUrl,
        writerMediaType, setWriterMediaType, writerUploading, setWriterUploading,
        writerPreviewMode, setWriterPreviewMode, writerPreviewExpanded, setWriterPreviewExpanded,
        writerUseLinkedInAPI, setWriterUseLinkedInAPI, fileInputRef, writerStatus, writerModel,
        writerUseInspirationSources, setWriterUseInspirationSources, writerInspirationSourceNames,
        writerPosting, MODEL_OPTIONS, handleWriterModelChange,
        generatePost, saveDraft, loadDrafts, loadScheduledPosts, sendToExtension, schedulePost, deleteDraft,
        // Saved posts
        savedPosts, savedPostsLoading, savedPostsPage, setSavedPostsPage, savedPostsTotal,
        savedPostsSortBy, setSavedPostsSortBy, savedPostsSortOrder, setSavedPostsSortOrder,
        savedPostsSearch, setSavedPostsSearch, loadSavedPosts, deleteSavedPost,
        // Feed schedule
        feedSchedule, feedScheduleLoading, scheduleTimesInput, setScheduleTimesInput,
        scheduleDuration, setScheduleDuration, scheduleMinLikes, setScheduleMinLikes,
        scheduleMinComments, setScheduleMinComments, scheduleKeywords, setScheduleKeywords,
        scheduleActive, setScheduleActive, loadFeedSchedule, saveFeedSchedule,
        feedScrapeCommandId, feedScrapeStatus, feedScrapePolling, startFeedScrapePolling, stopFeedScrape,
        // Tasks
        tasks, tasksLoading, taskNotifications, taskStatusExpanded, setTaskStatusExpanded,
        taskCounts, loadTasks, addTaskNotification, stopAllTasks,
        // Trending
        trendingPeriod, setTrendingPeriod, trendingSelectedPosts, setTrendingSelectedPosts,
        trendingGenerating, trendingCustomPrompt, setTrendingCustomPrompt,
        trendingIncludeHashtags, setTrendingIncludeHashtags, trendingLanguage, setTrendingLanguage,
        trendingGeneratedPosts, trendingShowGenPreview, setTrendingShowGenPreview,
        trendingStatus, trendingModel, setTrendingModel, trendingTokenUsage,
        trendingUseProfileData, setTrendingUseProfileData,
        generateTrendingPosts, analyzePosts, analysisResults, analysisLoading, showAnalysis, setShowAnalysis,
        generatedPostImages, setGeneratedPostImages, postingToLinkedIn, postGeneratedToLinkedIn, handleImageAttach,
        // History
        historyItems, historyLoading, historyFilter, setHistoryFilter, historyPage, setHistoryPage,
        historyTotal, loadHistory, deleteHistoryItem,
        // Inspiration
        inspirationProfiles, setInspirationProfiles, inspirationPostCount, setInspirationPostCount,
        inspirationScraping, inspirationStatus, inspirationSources, inspirationLoading,
        inspirationUseAll, setInspirationUseAll, inspirationSelected, setInspirationSelected,
        inspirationDeleteMode, setInspirationDeleteMode, inspirationDeleteSelected, setInspirationDeleteSelected,
        useProfileData, setUseProfileData, showInspirationPopup, setShowInspirationPopup,
        showSharedProfilesPopup, setShowSharedProfilesPopup,
        loadInspirationSources, scrapeInspirationProfiles, deleteInspirationSource,
        selectedInspirationPosts, setSelectedInspirationPosts, toggleInspirationPost,
        viewingProfilePosts, setViewingProfilePosts, profilePostsData, setProfilePostsData, profilePostsLoading, loadProfilePosts,
        // Comment style
        commentStyleProfiles, commentStyleLoading, commentStyleUrl, setCommentStyleUrl,
        commentStyleScraping, commentStyleStatus, commentStyleExpanded, setCommentStyleExpanded,
        commentStyleComments, commentStyleCommentsLoading,
        csUseProfileStyle, setCsUseProfileStyle,
        csGoal, setCsGoal, csTone, setCsTone, csLength, setCsLength, csStyle, setCsStyle,
        csModel, setCsModel, csExpertise, setCsExpertise, csBackground, setCsBackground,
        csAutoPost, setCsAutoPost, csSettingsLoading, csSettingsSaving, autoDecideEnabled, setAutoDecideEnabled,
        loadCommentStyleProfiles, scrapeCommentStyle, loadProfileComments, toggleCommentTop,
        toggleProfileSelect, deleteCommentStyleProfile, loadCommentSettings, saveCommentSettings,
        handleCommentModelChange,
        // Shared content
        sharedPosts, sharedPostsLoading, sharedInspProfiles, sharedCommentProfiles,
        loadSharedPosts, loadSharedInspProfiles, loadSharedCommentProfiles,
        // Automation settings
        autoSettings, autoSettingsLoading, autoSettingsSaving, loadAutoSettings, saveAutoSettings,
        // Activity
        liveActivityLogs, liveActivityLoading, showLogsPopup, setShowLogsPopup, loadLiveActivity,
        // Commenter
        commenterCfg, commenterCfgLoading, commenterCfgSaving, loadCommenterCfg, saveCommenterCfg,
        // Import
        importCfg, importCfgLoading, importCfgSaving, loadImportCfg, saveImportCfg,
        // LinkedIn profile
        linkedInProfile, linkedInProfileLoading, linkedInProfileScanning, linkedInProfileStatus,
        linkedInUseProfileData, setLinkedInUseProfileData, linkedInTopicSuggestions, linkedInGeneratingTopics,
        showLinkedInDataModal, setShowLinkedInDataModal, showFullPageText, setShowFullPageText,
        rescanningMissing, setRescanningMissing, editingSection, setEditingSection, editValue, setEditValue,
        loadLinkedInProfile, deleteLinkedInProfile, scanLinkedInProfile,
        generateTopicSuggestions, selectTopicSuggestion, toggleLinkedInProfileData,
        // Planner
        plannerOpen, setPlannerOpen, plannerMode, setPlannerMode, plannerStep, setPlannerStep,
        plannerContext, setPlannerContext, plannerTopics, setPlannerTopics,
        plannerSelected, setPlannerSelected, plannerGeneratingTopics,
        plannerPublishTime, setPlannerPublishTime, plannerStartDate, setPlannerStartDate,
        plannerTemplate, setPlannerTemplate, plannerTone, setPlannerTone,
        plannerLength, setPlannerLength, plannerGenerating, plannerDoneCount, plannerTotal,
        plannerStatusMsg, plannerAbortRef,
        openPlanner, generatePlannerTopics, startPlannerGeneration,
        // Voyager
        voyagerData, voyagerLoading, voyagerSyncing, setVoyagerSyncing, loadVoyagerData,
        // Analytics
        analyticsData, analyticsLoading, analyticsPeriod, setAnalyticsPeriod,
        analyticsAutoSearch, setAnalyticsAutoSearch, analyticsNetworkSearch, setAnalyticsNetworkSearch,
        analyticsImportSearch, setAnalyticsImportSearch, analyticsLeadsSearch, setAnalyticsLeadsSearch,
        analyticsAutoFilter, setAnalyticsAutoFilter, analyticsNetworkFilter, setAnalyticsNetworkFilter,
        loadAnalytics,
        // Referral
        referralData, copied, setCopied, showReferrals, setShowReferrals, copyToClipboard, loadReferralData,
        // Extension
        extensionConnected, extensionLastSeen, checkExtensionConnectivity,
        // Account
        linkedInOAuth, linkedInOAuthLoading, theme, setTheme,
        calendarMonth, setCalendarMonth, calendarYear, setCalendarYear,
        // Other
        signOut, loggingOut, setLoggingOut, sidebarCollapsed,
        // Additional (used by specific tabs)
        changeDashboardLanguage, setLinkedInOAuth, setLinkedInProfileScanning, setLinkedInProfile,
        SUPPORTED_LANGUAGES, setLiveActivityLogs, setLiveActivityLoading,
        setCommenterCfg, setCommentStyleComments, setImportCfg, setAutoSettings, setTrendingStatus, setFeedScrapeStatus, setFeedScrapeCommandId, setTrendingGeneratedPosts, setPlannerGenerating,
        handleTabChange, cleanLinkedInProfileUrls,
    } = props;

    // Get theme-aware colors
    const themeColors = getThemeColors(theme || 'dark');

    // Auto Decide state - use props from parent (page.tsx manages this state)
    const [autoDeciding, setAutoDeciding] = useState(false);
    const [autoDecideReasoning, setAutoDecideReasoning] = useState('');

    // Search/filter state for comment library
    const [commentSearchQuery, setCommentSearchQuery] = useState('');
    const [commentFilterType, setCommentFilterType] = useState<'all' | 'direct' | 'reply'>('all');

    // Auto-save state tracking
    const [isAutoSaving, setIsAutoSaving] = useState(false);
    const [autoSaveError, setAutoSaveError] = useState<string | null>(null);

    // Auto-fill background from profile data on mount
    useEffect(() => {
        if (!csBackground && (voyagerData?.headline || linkedInProfile?.headline)) {
            const profileBg = voyagerData?.headline || linkedInProfile?.headline || '';
            if (profileBg) setCsBackground(profileBg);
        }
    }, [voyagerData, linkedInProfile]);

    // Track whether initial load is complete to avoid auto-saving on mount
    const [settingsLoaded, setSettingsLoaded] = useState(false);

    // Accordion state for Comment Style Sources sidebar
    const [sharedProfilesOpen, setSharedProfilesOpen] = useState(true);
    const [savedProfilesOpen, setSavedProfilesOpen] = useState(true);

    // State for shared profile comments popup
    const [viewingSharedProfile, setViewingSharedProfile] = useState<any>(null);
    const [sharedProfileComments, setSharedProfileComments] = useState<any[]>([]);
    const [sharedCommentsLoading, setSharedCommentsLoading] = useState(false);

    useEffect(() => {
        if (!csSettingsLoading && !settingsLoaded) {
            // Mark loaded after a short delay to skip the initial state hydration
            const t = setTimeout(() => setSettingsLoaded(true), 1500);
            return () => clearTimeout(t);
        }
    }, [csSettingsLoading]);

    // Auto-save comment settings on any change (debounced)
    useEffect(() => {
        if (!settingsLoaded || csSettingsLoading) return;
        const timer = setTimeout(() => {
            saveCommentSettings();
        }, 800);
        return () => clearTimeout(timer);
    }, [csUseProfileStyle, csGoal, csTone, csLength, csStyle, csModel, csExpertise, csBackground, csAutoPost, autoDecideEnabled]);

    // Auto Decide function - calls AI to decide optimal settings
    const runAutoDecide = async (postText: string, authorName: string) => {
        if (isFreePlan) { setShowUpgradeModal(true); return; }
        setAutoDeciding(true);
        setAutoDecideReasoning('');
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('/api/ai/auto-decide-comment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ postText, authorName, model: csModel }),
            });
            const data = await res.json();
            if (data.success && data.settings) {
                setCsGoal(data.settings.goal);
                setCsTone(data.settings.tone);
                setCsLength(data.settings.length);
                setCsStyle(data.settings.style);
                setAutoDecideReasoning(data.settings.reasoning || '');
                showToast('AI auto-decided optimal settings!', 'success');
            }
        } catch (e) {
            console.error('Auto-decide error:', e);
        } finally {
            setAutoDeciding(false);
        }
    };

    // Filtered comments based on search query
    const getFilteredComments = useCallback((comments: any[]) => {
        if (!commentSearchQuery && commentFilterType === 'all') return comments;
        return comments.filter((comment: any) => {
            const matchesSearch = !commentSearchQuery ||
                comment.commentText?.toLowerCase().includes(commentSearchQuery.toLowerCase()) ||
                comment.postText?.toLowerCase().includes(commentSearchQuery.toLowerCase());
            const matchesFilter = commentFilterType === 'all' ||
                (commentFilterType === 'direct' && comment.context === 'DIRECT COMMENT ON POST') ||
                (commentFilterType === 'reply' && comment.context !== 'DIRECT COMMENT ON POST');
            return matchesSearch && matchesFilter;
        });
    }, [commentSearchQuery, commentFilterType]);

    // Copy to clipboard function
    const handleCopyToClipboard = useCallback(async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            showToast(`${label} copied to clipboard!`, 'success');
        } catch (err) {
            showToast('Failed to copy to clipboard', 'error');
        }
    }, [showToast]);

    // Load shared profile comments for popup
    const loadSharedProfileComments = async (profile: any) => {
        setViewingSharedProfile(profile);
        setSharedCommentsLoading(true);
        setSharedProfileComments([]);
        
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;
            
            const res = await fetch('/api/shared/comment-profiles/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ profileId: profile.profileId }),
            });
            const data = await res.json();
            if (data.success) {
                setSharedProfileComments(data.comments || []);
            }
        } catch (e) {
            console.error('Failed to load shared profile comments:', e);
            showToast('Failed to load comments', 'error');
        } finally {
            setSharedCommentsLoading(false);
        }
    };

    return (
        <div className="fade-in">
            <style>{globalStyles}</style>

            {/* Page Header with Breadcrumbs */}
            <div style={{
                marginBottom: SPACING.xl,
                paddingBottom: SPACING.lg,
                borderBottom: `1px solid ${themeColors.border}`,
            }}>
            {/* Breadcrumbs */}
            <div style={{
                display: 'flex',
                    alignItems: 'center',
                    gap: SPACING.sm,
                    marginBottom: SPACING.md,
                    fontSize: TYPOGRAPHY.fontSizeSm,
                    color: themeColors.textDim,
                }}>
                    <span
                        onClick={() => setActiveTab?.('overview')}
                        style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.color = themeColors.text}
                        onMouseOut={e => e.currentTarget.style.color = themeColors.textDim}
                    >Dashboard</span>
                    <span style={{ color: themeColors.textDimmest }}>/</span>
                    <span style={{ color: themeColors.textMuted }}>Comments</span>
                </div>

                {/* Title and Description */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: SPACING.lg }}>
                    <div>
                        <h1 style={{
                            color: themeColors.text,
                            fontSize: TYPOGRAPHY.fontSizeTitle,
                            fontWeight: TYPOGRAPHY.fontWeightBold,
                            margin: 0,
                            marginBottom: SPACING.sm,
                            display: 'flex',
                            alignItems: 'center',
                            gap: SPACING.md,
                        }}>
                            {miniIcon('M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', '#693fe9', 24)}
                            Comment Settings
                        </h1>
                        <p style={{
                            color: themeColors.textDim,
                            fontSize: TYPOGRAPHY.fontSizeMd,
                            margin: 0,
                            maxWidth: '500px',
                        }}>
                            Configure AI-powered comment generation. Control goals, tone, length, and style for authentic engagement.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: SPACING.sm }}>
                        <button
                            onClick={loadCommentStyleProfiles}
                            style={styles.buttonSecondary as React.CSSProperties}
                        >
                            {miniIcon('M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', 'rgba(255,255,255,0.7)', 14)}
                            <span style={{ marginLeft: '6px' }}>Refresh</span>
                        </button>
                        <button
                            onClick={saveCommentSettings}
                            disabled={csSettingsSaving}
                            style={{
                                ...styles.buttonPrimary,
                                opacity: csSettingsSaving ? 0.7 : 1,
                            } as React.CSSProperties}
                        >
                            {csSettingsSaving ? (
                                <>
                                    <div style={styles.spinner} />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    {miniIcon('M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z M17 21v-8H7v8 M7 3v5h8', 'white', 14)}
                                    Save Settings
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Sidebars Container - Below Header */}
            <div style={{ display: 'flex', gap: SPACING.lg, marginBottom: SPACING.xl, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                {/* Comment Settings */}
                <div className="comment-settings-sidebar" style={{
                    ...styles.rightSidebar,
                    background: themeColors.bg,
                    border: `1px solid ${themeColors.border}`,
                    boxShadow: themeColors.shadow,
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
                    <h3 style={{ color: 'white', fontSize: TYPOGRAPHY.fontSizeLg, fontWeight: TYPOGRAPHY.fontWeightBold, margin: 0, display: 'flex', alignItems: 'center', gap: SPACING.sm }}>
                        {miniIcon('M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', '#3b82f6', 18)}
                        <span>Settings</span>
                    </h3>
                </div>
                {csSettingsLoading ? (
                    <div style={{ textAlign: 'center', padding: '20px 0', color: 'rgba(255,255,255,0.5)' }}>Loading settings...</div>
                ) : (
                    <>
                        {/* Use Profile Style Toggle - improved styling */}
                        <div
                            role="switch"
                            aria-checked={csUseProfileStyle}
                            aria-label="Use selected profiles comment style"
                            tabIndex={0}
                            onClick={() => { const newVal = !csUseProfileStyle; setCsUseProfileStyle(newVal); setTimeout(() => { const token = localStorage.getItem('authToken'); if (!token) return; setIsAutoSaving(true); setAutoSaveError(null); fetch('/api/comment-settings', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ useProfileStyle: newVal, goal: csGoal, tone: csTone, commentLength: csLength, commentStyle: csStyle, userExpertise: csExpertise, userBackground: csBackground, aiAutoPost: csAutoPost }) }).then(r => r.json()).then(d => { setIsAutoSaving(false); if (d.success) { showToast('Settings auto-saved!', 'success'); } else { setAutoSaveError(d.error || 'Failed to save'); showToast('Failed to save settings', 'error'); } }).catch(() => { setIsAutoSaving(false); setAutoSaveError('Network error'); showToast('Failed to save settings', 'error'); }); }, 100); }}
                            onKeyDown={(e) => handleToggleKeyDown(e, () => { const newVal = !csUseProfileStyle; setCsUseProfileStyle(newVal); setTimeout(() => { const token = localStorage.getItem('authToken'); if (!token) return; setIsAutoSaving(true); setAutoSaveError(null); fetch('/api/comment-settings', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ useProfileStyle: newVal, goal: csGoal, tone: csTone, commentLength: csLength, commentStyle: csStyle, userExpertise: csExpertise, userBackground: csBackground, aiAutoPost: csAutoPost }) }).then(r => r.json()).then(d => { setIsAutoSaving(false); if (d.success) { showToast('Settings auto-saved!', 'success'); } else { setAutoSaveError(d.error || 'Failed to save'); showToast('Failed to save settings', 'error'); } }).catch(() => { setIsAutoSaving(false); setAutoSaveError('Network error'); showToast('Failed to save settings', 'error'); }); }, 100); })}
                            style={styles.toggleContainer(csUseProfileStyle, 'rgba(59,130,246,0.4)', 'rgba(59,130,246,0.08)') as React.CSSProperties}
                        >
                            <div style={styles.toggleTrack(csUseProfileStyle, 'linear-gradient(135deg, #3b82f6, #2563eb)') as React.CSSProperties}>
                                <div style={styles.toggleThumb(csUseProfileStyle) as React.CSSProperties} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ color: 'white', fontWeight: TYPOGRAPHY.fontWeightBold, fontSize: TYPOGRAPHY.fontSizeMd }}>
                                    {miniIcon('M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', 'white', 14)}
                                    <span style={{ marginLeft: '6px' }}>Use Selected Profiles' Comment Style</span>
                                </div>
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: TYPOGRAPHY.fontSizeSm, marginTop: '4px' }}>
                                    {csUseProfileStyle
                                        ? 'AI learns ONLY from scraped comments. Settings below disabled.'
                                        : 'Turn ON to mimic commenting style of selected profiles.'}
                                </div>
                            </div>
                        </div>
                        {csUseProfileStyle && (
                            <div className="slide-in stagger-2" style={{
                                background: 'rgba(59,130,246,0.08)',
                                padding: SPACING.md,
                                borderRadius: '12px',
                                border: '1px solid rgba(59,130,246,0.2)',
                                marginBottom: SPACING.lg,
                            }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: SPACING.sm }}>
                                    <div style={styles.badge('info')}>
                                        {miniIcon('M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', '#60a5fa', 12)}
                                        <span>Active</span>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ color: '#93c5fd', fontSize: TYPOGRAPHY.fontSizeSm, margin: 0, lineHeight: 1.5, marginBottom: SPACING.sm }}>
                                            <strong style={{ color: '#60a5fa' }}>Profile Style Active:</strong> AI analyzes up to 20 comments from selected profiles. Goal, Tone, Length & Style ignored.
                                        </p>
                                        {commentStyleProfiles.length > 0 ? (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                {commentStyleProfiles.filter((p: any) => p.isSelected).length === 0 && (
                                                    <span style={{ color: '#fbbf24', fontSize: TYPOGRAPHY.fontSizeXs }}>No profiles selected — select profiles below</span>
                                                )}
                                                {commentStyleProfiles.filter((p: any) => p.isSelected).map((p: any) => (
                                                    <span key={p.id} style={styles.badge('info') as React.CSSProperties}>
                                                        {miniIcon('M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z', '#60a5fa', 10)}
                                                        <span>{p.profileName || p.profileId}</span>
                                                        <span style={{ opacity: 0.6 }}>({p._count?.comments || p.commentCount || 0})</span>
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p style={{ color: '#fbbf24', fontSize: TYPOGRAPHY.fontSizeXs, margin: 0 }}>No comment style profiles yet. Add profiles below.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Profile data is now always used - removed toggle */}
                        <div style={{ opacity: csUseProfileStyle ? 0.4 : 1, pointerEvents: csUseProfileStyle ? 'none' : 'auto', transition: 'opacity 0.3s' }}>

                            {/* Goal + Tone side by side - Dropdowns */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: SPACING.lg, marginBottom: SPACING.lg }}>
                                <div>
                                    <label style={styles.label}>Comment Goal</label>
                                    <div style={{ position: 'relative' }}>
                                        <select
                                            value={csGoal}
                                            onChange={e => setCsGoal(e.target.value)}
                                            style={{ ...styles.select, appearance: 'none', WebkitAppearance: 'none' } as React.CSSProperties}
                                        >
                                            <option value="AddValue" style={{ background: '#1a1a3e' }}>Add Value</option>
                                            <option value="ShareExperience" style={{ background: '#1a1a3e' }}>Experience</option>
                                            <option value="AskQuestion" style={{ background: '#1a1a3e' }}>Question</option>
                                            <option value="DifferentPerspective" style={{ background: '#1a1a3e' }}>Perspective</option>
                                            <option value="BuildRelationship" style={{ background: '#1a1a3e' }}>Relationship</option>
                                            <option value="SubtlePitch" style={{ background: '#1a1a3e' }}>Subtle Pitch</option>
                                        </select>
                                        <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'rgba(255,255,255,0.5)' }}>
                                            {miniIcon('M19 9l-7 7-7-7', 'rgba(255,255,255,0.5)', 14)}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label style={styles.label}>Tone of Voice</label>
                                    <div style={{ position: 'relative' }}>
                                        <select
                                            value={csTone}
                                            onChange={e => setCsTone(e.target.value)}
                                            style={{ ...styles.select, appearance: 'none', WebkitAppearance: 'none' } as React.CSSProperties}
                                        >
                                            <option value="Professional" style={{ background: '#1a1a3e' }}>Professional</option>
                                            <option value="Friendly" style={{ background: '#1a1a3e' }}>Friendly</option>
                                            <option value="ThoughtProvoking" style={{ background: '#1a1a3e' }}>Thought Provoking</option>
                                            <option value="Supportive" style={{ background: '#1a1a3e' }}>Supportive</option>
                                            <option value="Contrarian" style={{ background: '#1a1a3e' }}>Contrarian</option>
                                            <option value="Humorous" style={{ background: '#1a1a3e' }}>Humorous</option>
                                        </select>
                                        <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'rgba(255,255,255,0.5)' }}>
                                            {miniIcon('M19 9l-7 7-7-7', 'rgba(255,255,255,0.5)', 14)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Length + Style side by side - Dropdowns */}
                            <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: SPACING.lg, marginBottom: SPACING.lg }}>
                                <div>
                                    <label style={styles.label}>Length</label>
                                    <div style={{ position: 'relative' }}>
                                        <select
                                            value={csLength}
                                            onChange={e => setCsLength(e.target.value)}
                                            style={{ ...styles.select, appearance: 'none', WebkitAppearance: 'none' } as React.CSSProperties}
                                        >
                                            <option value="Brief" style={{ background: '#1a1a3e' }}>Brief (≤100)</option>
                                            <option value="Short" style={{ background: '#1a1a3e' }}>Short (≤300)</option>
                                            <option value="Mid" style={{ background: '#1a1a3e' }}>Medium (≤600)</option>
                                            <option value="Long" style={{ background: '#1a1a3e' }}>Long (≤900)</option>
                                        </select>
                                        <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'rgba(255,255,255,0.5)' }}>
                                            {miniIcon('M19 9l-7 7-7-7', 'rgba(255,255,255,0.5)', 14)}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label style={styles.label}>Style</label>
                                    <div style={{ position: 'relative' }}>
                                        <select
                                            value={csStyle}
                                            onChange={e => setCsStyle(e.target.value)}
                                            style={{ ...styles.select, appearance: 'none', WebkitAppearance: 'none' } as React.CSSProperties}
                                        >
                                            <option value="direct" style={{ background: '#1a1a3e' }}>Direct (Single paragraph)</option>
                                            <option value="structured" style={{ background: '#1a1a3e' }}>Structured (2-3 paragraphs)</option>
                                            <option value="storyteller" style={{ background: '#1a1a3e' }}>Storyteller (Personal anecdote)</option>
                                            <option value="challenger" style={{ background: '#1a1a3e' }}>Challenger (Different view)</option>
                                            <option value="supporter" style={{ background: '#1a1a3e' }}>Supporter (Validate)</option>
                                            <option value="expert" style={{ background: '#1a1a3e' }}>Expert (Data refs)</option>
                                            <option value="conversational" style={{ background: '#1a1a3e' }}>Casual (Colleague-like)</option>
                                        </select>
                                        <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'rgba(255,255,255,0.5)' }}>
                                            {miniIcon('M19 9l-7 7-7-7', 'rgba(255,255,255,0.5)', 14)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Auto Decide Toggle - improved styling */}
                        <div
                            role="switch"
                            aria-checked={autoDecideEnabled}
                            aria-label="Auto decide for each post"
                            tabIndex={0}
                            onClick={() => setAutoDecideEnabled(!autoDecideEnabled)}
                            onKeyDown={(e) => handleToggleKeyDown(e, () => setAutoDecideEnabled(!autoDecideEnabled))}
                            style={styles.toggleContainer(autoDecideEnabled, 'rgba(168,85,247,0.4)', 'rgba(168,85,247,0.08)') as React.CSSProperties}
                        >
                            <div style={styles.toggleTrack(autoDecideEnabled, 'linear-gradient(135deg, #a855f7, #7c3aed)') as React.CSSProperties}>
                                <div style={styles.toggleThumb(autoDecideEnabled) as React.CSSProperties} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ color: 'white', fontWeight: TYPOGRAPHY.fontWeightBold, fontSize: TYPOGRAPHY.fontSizeMd }}>
                                    {miniIcon('M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', autoDecideEnabled ? '#c4b5fd' : 'white', 14)}
                                    <span style={{ marginLeft: '6px' }}>Auto Decide for Each Post</span>
                                </div>
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: TYPOGRAPHY.fontSizeSm, marginTop: '4px' }}>
                                    {autoDecideEnabled
                                        ? 'AI reads each post + your profile to pick optimal Goal, Tone, Length & Style automatically.'
                                        : 'Turn ON to let AI auto-select the best settings per post.'}
                                </div>
                            </div>
                            {autoDeciding && (
                                <div style={{ color: '#c4b5fd', fontSize: TYPOGRAPHY.fontSizeXs, fontWeight: TYPOGRAPHY.fontWeightSemibold, flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={styles.spinner} />
                                    Deciding...
                                </div>
                            )}
                        </div>
                        {autoDecideEnabled && autoDecideReasoning && (
                            <div className="slide-in" style={{ marginTop: SPACING.sm, padding: SPACING.md, background: 'rgba(168,85,247,0.08)', borderRadius: '12px', border: '1px solid rgba(168,85,247,0.2)' }}>
                                <div style={{ color: '#c4b5fd', fontSize: TYPOGRAPHY.fontSizeXs, fontWeight: TYPOGRAPHY.fontWeightSemibold, marginBottom: '4px' }}>AI Reasoning</div>
                                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: TYPOGRAPHY.fontSizeSm, lineHeight: 1.5 }}>{autoDecideReasoning}</div>
                            </div>
                        )}

                        {/* Auto-save status indicator */}
                        {(isAutoSaving || autoSaveError) && (
                            <div className="fade-in" style={{
                                marginTop: SPACING.md,
                                padding: SPACING.sm + ' ' + SPACING.md,
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: SPACING.sm,
                                background: autoSaveError ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)',
                                border: `1px solid ${autoSaveError ? 'rgba(239,68,68,0.3)' : 'rgba(59,130,246,0.3)'}`,
                            }}>
                                {isAutoSaving && (
                                    <>
                                        <div style={styles.spinner} />
                                        <span style={{ color: '#60a5fa', fontSize: TYPOGRAPHY.fontSizeSm }}>Auto-saving settings...</span>
                                    </>
                                )}
                                {autoSaveError && (
                                    <>
                                        <span style={{ color: '#f87171', fontSize: TYPOGRAPHY.fontSizeSm }}>Error: {autoSaveError}</span>
                                        <button onClick={() => setAutoSaveError(null)} aria-label="Dismiss error" style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '16px', padding: '0 4px' }}>x</button>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Expertise, Background, AI Behavior — improved styling */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: SPACING.md, marginTop: SPACING.md }}>
                            <div>
                                <label style={{ ...styles.label, marginBottom: '6px' }}>Your Expertise</label>
                                <input
                                    value={csExpertise}
                                    onChange={e => setCsExpertise(e.target.value)}
                                    placeholder="e.g., SaaS Marketing, AI Dev"
                                    style={styles.input as React.CSSProperties}
                                />
                            </div>
                            <div>
                                <label style={{ ...styles.label, marginBottom: '6px' }}>Background (Optional)</label>
                                <input
                                    value={csBackground}
                                    onChange={e => setCsBackground(e.target.value)}
                                    placeholder="e.g., Scaled 3 startups"
                                    style={styles.input as React.CSSProperties}
                                />
                            </div>
                            <div>
                                <label style={{ ...styles.label, marginBottom: '6px' }}>AI Button Behavior</label>
                                <div style={{ position: 'relative' }}>
                                    <select
                                        value={csAutoPost}
                                        onChange={e => setCsAutoPost(e.target.value)}
                                        style={{ ...styles.select, paddingRight: '36px' } as React.CSSProperties}
                                    >
                                        <option value="manual" style={{ background: '#1a1a3e' }}>Manual Review</option>
                                        <option value="auto" style={{ background: '#1a1a3e' }}>Auto Post</option>
                                    </select>
                                    <span className="select-arrow" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'rgba(255,255,255,0.5)' }}>
                                        {miniIcon('M19 9l-7 7-7-7', 'rgba(255,255,255,0.5)', 14)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
                {/* Save button - removed from here since it's in the header now */}
            </div>

        {/* ============================================ */}
        {/* STYLE SOURCES SIDEBAR - Below Header */}
        {/* ============================================ */}
        <div className="style-sources-sidebar" style={{
            ...styles.sidebar,
            background: themeColors.bg,
            border: `1px solid ${themeColors.border}`,
            boxShadow: themeColors.shadow,
        }}>
                {/* Sidebar Header */}
                <div style={styles.sidebarHeader}>
                    <div style={styles.sidebarTitle}>
                        {miniIcon('M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', '#8b5cf6', 18)}
                        <span style={styles.sidebarTitleText}>Style Sources</span>
                        <span style={styles.profileCountBadge}>{commentStyleProfiles.length}</span>
                    </div>
                    <button
                        onClick={loadCommentStyleProfiles}
                        style={styles.refreshButton as React.CSSProperties}
                        onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white'; }}
                        onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                        title="Refresh profiles"
                    >
                        {miniIcon('M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', 'rgba(255,255,255,0.6)', 14)}
                    </button>
                </div>

                {/* Add Profile Input */}
                <div style={styles.inputWithIcon}>
                    <label style={styles.inputLabel}>
                        {miniIcon('M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9', 'rgba(255,255,255,0.5)', 12)}
                        Add LinkedIn Profile
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <span style={styles.inputIcon}>
                                {miniIcon('M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9', 'rgba(255,255,255,0.4)', 14)}
                            </span>
                            <input
                                value={commentStyleUrl}
                                onChange={e => setCommentStyleUrl(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') scrapeCommentStyle(); }}
                                placeholder="linkedin.com/in/username"
                                style={{ ...styles.input, paddingLeft: '36px', flex: 1 } as React.CSSProperties}
                            />
                        </div>
                        <button
                            onClick={scrapeCommentStyle}
                            disabled={commentStyleScraping}
                            style={styles.addButton as React.CSSProperties}
                            onMouseOver={e => { if (!commentStyleScraping) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.4)'; } }}
                            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)'; }}
                        >
                            {commentStyleScraping ? (
                                <div style={styles.spinner} />
                            ) : (
                                <>
                                    {miniIcon('M12 4v16m8-8H4', 'white', 14)}
                                    Add
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Status Message */}
                {commentStyleStatus && (
                    <div style={{
                        marginBottom: '12px',
                        padding: '8px 12px',
                        background: commentStyleStatus.includes('Error') || commentStyleStatus.includes('Failed') ? 'rgba(239,68,68,0.1)' : 'rgba(139, 92, 246, 0.1)',
                        border: `1px solid ${commentStyleStatus.includes('Error') ? 'rgba(239,68,68,0.3)' : 'rgba(139, 92, 246, 0.3)'}`,
                        borderRadius: '8px',
                        color: commentStyleStatus.includes('Error') ? '#f87171' : '#a78bfa',
                        fontSize: TYPOGRAPHY.fontSizeXs,
                    }}>
                        {commentStyleStatus}
                    </div>
                )}

                {/* Training Banner */}
                {commentStyleProfiles.some((p: any) => p.isSelected) && (
                    <div style={styles.trainingBanner}>
                        <span style={styles.trainingDot} />
                        <span style={styles.trainingText}>
                            <strong>{commentStyleProfiles.filter((p: any) => p.isSelected).length}</strong> profile{commentStyleProfiles.filter((p: any) => p.isSelected).length > 1 ? 's' : ''} training active
                        </span>
                    </div>
                )}

                {/* Collapsible: Kommentify Shared */}
                {sharedCommentProfiles.length > 0 && (
                    <div style={{ marginTop: '16px' }}>
                        <div
                            style={styles.accordionHeader}
                            onClick={() => setSharedProfilesOpen(!sharedProfilesOpen)}
                        >
                            <div style={styles.accordionTitle}>
                                {miniIcon('M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', '#fbbf24', 14)}
                                <span style={styles.accordionTitleText}>Kommentify Shared</span>
                                <span style={styles.accordionBadge}>{sharedCommentProfiles.length}</span>
                            </div>
                            <span style={{ ...styles.chevron, transform: sharedProfilesOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                {miniIcon('M19 9l-7 7-7-7', 'rgba(255,255,255,0.4)', 14)}
                            </span>
                        </div>
                        {sharedProfilesOpen && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingBottom: '12px' }}>
                                {sharedCommentProfiles.map((p: any, i: number) => {
                                    const profileMatch = commentStyleProfiles.find((cp: any) => cp.profileId === p.profileId || cp.profileName === (p.profileName || p.profileId));
                                    const isSelected = profileMatch?.isSelected || false;
                                    return (
                                        <div
                                            key={i}
                                            onClick={async () => { 
                                                if (profileMatch) {
                                                    toggleProfileSelect(profileMatch.id);
                                                } else {
                                                    // Add shared profile to user's saved profiles and select it
                                                    const token = localStorage.getItem('authToken');
                                                    if (!token) return;
                                                    try {
                                                        // First, get the comments from the shared profile
                                                        const sharedRes = await fetch('/api/shared/comment-profiles/comments', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                                            body: JSON.stringify({ profileId: p.profileId }),
                                                        });
                                                        const sharedData = await sharedRes.json();
                                                        const comments = sharedData.success ? sharedData.comments : [];
                                                        
                                                        // Now add the profile with its comments
                                                        const res = await fetch('/api/scraped-comments', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                                            body: JSON.stringify({ 
                                                                action: 'saveComments',
                                                                profileUrl: p.profileUrl,
                                                                profileIdSlug: p.profileId,
                                                                profileName: p.profileName,
                                                                comments: comments // Include the shared comments
                                                            }),
                                                        });
                                                        const data = await res.json();
                                                        if (data.success && data.profileId) {
                                                            // Reload profiles to get the new one
                                                            await loadCommentStyleProfiles();
                                                            // Then select the new profile for training
                                                            setTimeout(() => {
                                                                toggleProfileSelect(data.profileId);
                                                            }, 500);
                                                            // Show success message
                                                            showToast(`Added ${p.profileName} to your profiles`, 'success');
                                                        }
                                                    } catch (e) {
                                                        console.error('Failed to add shared profile:', e);
                                                        showToast('Failed to add profile', 'error');
                                                    }
                                                }
                                            }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                background: isSelected ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.03)',
                                                padding: '6px 10px',
                                                borderRadius: '8px',
                                                border: `1px solid ${isSelected ? 'rgba(245, 158, 11, 0.5)' : 'rgba(255,255,255,0.08)'}`,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                            }}
                                            onMouseOver={(e: any) => {
                                                e.currentTarget.style.background = isSelected ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255,255,255,0.06)';
                                            }}
                                            onMouseOut={(e: any) => {
                                                e.currentTarget.style.background = isSelected ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.03)';
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                readOnly
                                                style={{ accentColor: '#f59e0b', width: '12px', height: '12px', cursor: 'pointer', margin: 0 }}
                                            />
                                            <span style={{ color: isSelected ? '#fbbf24' : 'rgba(255,255,255,0.7)', fontSize: TYPOGRAPHY.fontSizeXs, fontWeight: TYPOGRAPHY.fontWeightMedium }}>
                                                {p.profileName || p.profileId}
                                            </span>
                                            <button
                                                title="View all comments"
                                                onClick={(e: any) => {
                                                    e.stopPropagation();
                                                    loadSharedProfileComments(p);
                                                }}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: 'rgba(255,255,255,0.4)',
                                                    cursor: 'pointer',
                                                    padding: '2px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    marginLeft: '4px'
                                                }}
                                                onMouseOver={(e: any) => {
                                                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                                                }}
                                                onMouseOut={(e: any) => {
                                                    e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
                                                }}
                                            >
                                                {miniIcon('M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', 'rgba(255,255,255,0.5)', 12)}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Collapsible: Saved Profiles */}
                <div style={{ marginTop: '8px' }}>
                    <div
                        style={styles.accordionHeader}
                        onClick={() => setSavedProfilesOpen(!savedProfilesOpen)}
                    >
                        <div style={styles.accordionTitle}>
                            {miniIcon('M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', 'white', 14)}
                            <span style={styles.accordionTitleText}>Saved Profiles</span>
                            <span style={styles.accordionBadge}>{commentStyleProfiles.length}</span>
                        </div>
                        <span style={{ ...styles.chevron, transform: savedProfilesOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                            {miniIcon('M19 9l-7 7-7-7', 'rgba(255,255,255,0.4)', 14)}
                        </span>
                    </div>

                    {savedProfilesOpen && (
                        <>
                            {commentStyleLoading ? (
                                <div className="fade-in" style={styles.emptyState}>
                                    <div className="skeleton" style={{ width: '100%', height: '60px', marginBottom: '8px' }} />
                                    <div className="skeleton" style={{ width: '80%', height: '20px', margin: '0 auto' }} />
                                </div>
                            ) : commentStyleProfiles.length === 0 ? (
                                <div className="fade-in" style={{ ...styles.emptyState, padding: '24px 16px' }}>
                                    <div style={{ ...styles.emptyStateIcon, width: '48px', height: '48px', marginBottom: '12px' }}>
                                        {miniIcon('M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', '#693fe9', 20)}
                                    </div>
                                    <h4 style={{ ...styles.emptyStateTitle, fontSize: '14px' }}>No Profiles Yet</h4>
                                    <p style={{ ...styles.emptyStateDesc, fontSize: '12px', marginBottom: '0' }}>Add a LinkedIn profile above to start.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }}>
                                    {commentStyleProfiles.map((profile: any) => {
                                        const getInitials = (name: string) => {
                                            return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                                        };
                                        return (
                                            <div key={profile.id}>
                                                <div
                                                    className="slide-in"
                                                    style={{
                                                        ...styles.sidebarProfileCard,
                                                        ...(profile.isSelected ? styles.sidebarProfileCardHover : {}),
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '10px',
                                                        padding: '10px 12px',
                                                    }}
                                                    onMouseOver={e => {
                                                        e.currentTarget.style.transform = 'translateX(4px)';
                                                        e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                                                        e.currentTarget.style.background = 'rgba(139, 92, 246, 0.05)';
                                                    }}
                                                    onMouseOut={e => {
                                                        e.currentTarget.style.transform = 'translateX(0)';
                                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                                                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                                    }}
                                                >
                                                    {/* Avatar with initials */}
                                                    <div style={styles.profileAvatar}>
                                                        {getInitials(profile.profileName || profile.profileId || 'U')}
                                                    </div>

                                                    {/* Profile info */}
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={styles.profileName}>
                                                            {profile.profileName || profile.profileId}
                                                        </div>
                                                        <div style={styles.profileCommentCount}>
                                                            {profile._count?.comments || profile.commentCount || 0} comments
                                                        </div>
                                                    </div>

                                                    {/* Train toggle switch */}
                                                    <label
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            cursor: 'pointer',
                                                            fontSize: '10px',
                                                            color: profile.isSelected ? '#8b5cf6' : 'rgba(255,255,255,0.4)',
                                                            fontWeight: TYPOGRAPHY.fontWeightSemibold,
                                                            whiteSpace: 'nowrap',
                                                        }}
                                                    >
                                                        <div
                                                            onClick={() => toggleProfileSelect(profile.id)}
                                                            style={{
                                                                ...styles.toggleTrack(profile.isSelected, '#8b5cf6'),
                                                                width: '32px',
                                                                height: '18px',
                                                            }}
                                                        >
                                                            <div style={{
                                                                ...styles.toggleThumb(profile.isSelected),
                                                                width: '14px',
                                                                height: '14px',
                                                                left: profile.isSelected ? '16px' : '2px',
                                                            }} />
                                                        </div>
                                                        Train
                                                    </label>

                                                    {/* Action buttons */}
                                                    <button
                                                        onClick={() => {
                                                            if (commentStyleExpanded === profile.id) {
                                                                setCommentStyleExpanded(null);
                                                                setCommentStyleComments([]);
                                                            } else {
                                                                setCommentStyleExpanded(profile.id);
                                                                loadProfileComments(profile.id);
                                                            }
                                                        }}
                                                        style={styles.actionButton as React.CSSProperties}
                                                        onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white'; }}
                                                        onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
                                                        title="View comments"
                                                    >
                                                        {commentStyleExpanded === profile.id
                                                            ? miniIcon('M19 9l-7 7-7-7', 'rgba(255,255,255,0.5)', 12)
                                                            : miniIcon('M9 5l7 7-7 7', 'rgba(255,255,255,0.5)', 12)
                                                        }
                                                    </button>
                                                    <button
                                                        onClick={() => deleteCommentStyleProfile(profile.id)}
                                                        style={styles.deleteButton as React.CSSProperties}
                                                        onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
                                                        onMouseOut={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                                                        title="Delete profile"
                                                    >
                                                        {miniIcon('M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', 'rgba(239,68,68,0.7)', 12)}
                                                    </button>
                                                </div>

                                                {/* Expanded comments */}
                                                {commentStyleExpanded === profile.id && (
                                                    <div style={{
                                                        background: 'rgba(0,0,0,0.2)',
                                                        borderRadius: '0 0 10px 10px',
                                                        padding: '12px',
                                                        border: '1px solid rgba(255,255,255,0.06)',
                                                        borderTop: 'none',
                                                        maxHeight: '300px',
                                                        overflowY: 'auto',
                                                        marginBottom: '8px',
                                                    }}>
                                                        {commentStyleCommentsLoading ? (
                                                            <div style={{ textAlign: 'center', padding: '16px 0', color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Loading...</div>
                                                        ) : commentStyleComments.length === 0 ? (
                                                            <div style={{ textAlign: 'center', padding: '16px 0', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>No comments found.</div>
                                                        ) : (
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                                {commentStyleComments.slice(0, 5).map((comment: any) => (
                                                                    <div key={comment.id} style={{
                                                                        background: comment.isTopComment ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.03)',
                                                                        padding: '10px',
                                                                        borderRadius: '8px',
                                                                        border: `1px solid ${comment.isTopComment ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.06)'}`,
                                                                    }}>
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                                                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                                                <div style={{
                                                                                    ...styles.badge(comment.context === 'DIRECT COMMENT ON POST' ? 'success' : 'info'),
                                                                                    fontSize: '9px',
                                                                                    padding: '2px 6px',
                                                                                } as React.CSSProperties}>
                                                                                    {comment.context === 'DIRECT COMMENT ON POST' ? 'Direct' : 'Reply'}
                                                                                </div>
                                                                                <div style={{
                                                                                    color: 'rgba(255,255,255,0.8)',
                                                                                    fontSize: '11px',
                                                                                    lineHeight: '1.4',
                                                                                    marginTop: '6px',
                                                                                    overflow: 'hidden',
                                                                                    textOverflow: 'ellipsis',
                                                                                    display: '-webkit-box',
                                                                                    WebkitLineClamp: 2,
                                                                                    WebkitBoxOrient: 'vertical',
                                                                                }}>
                                                                                    {comment.commentText}
                                                                                </div>
                                                                            </div>
                                                                            <button
                                                                                onClick={() => toggleCommentTop(comment.id)}
                                                                                style={{
                                                                                    background: comment.isTopComment ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.08)',
                                                                                    border: 'none',
                                                                                    borderRadius: '6px',
                                                                                    padding: '4px',
                                                                                    cursor: 'pointer',
                                                                                    flexShrink: 0,
                                                                                }}
                                                                            >
                                                                                {miniIcon('M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', comment.isTopComment ? '#fbbf24' : 'rgba(255,255,255,0.3)', 10)}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                {commentStyleComments.length > 5 && (
                                                                    <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '11px', paddingTop: '4px' }}>
                                                                        +{commentStyleComments.length - 5} more comments
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
            </div>
            </div>
        </div>

        {/* Shared Profile Comments Popup */}
        {viewingSharedProfile && (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: theme === 'light' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px'
            }}>
                <div style={{
                    background: theme === 'light' ? '#ffffff' : '#1a1a3e',
                    borderRadius: '12px',
                    padding: '24px',
                    maxWidth: '600px',
                    width: '100%',
                    maxHeight: '80vh',
                    overflowY: 'auto',
                    border: theme === 'light' ? '1px solid rgba(0,0,0,0.12)' : '1px solid rgba(255,255,255,0.1)',
                    boxShadow: theme === 'light' ? '0 8px 32px rgba(0,0,0,0.2)' : 'none'
                }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div>
                            <h3 style={{ color: theme === 'light' ? '#1a1a2e' : 'white', margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                                {viewingSharedProfile.profileName || viewingSharedProfile.profileId}
                            </h3>
                            <p style={{ color: theme === 'light' ? '#6b7280' : 'rgba(255,255,255,0.6)', margin: '4px 0 0', fontSize: '12px' }}>
                                Shared Profile Comments ({sharedProfileComments.length})
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setViewingSharedProfile(null);
                                setSharedProfileComments([]);
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: theme === 'light' ? '#6b7280' : 'rgba(255,255,255,0.6)',
                                cursor: 'pointer',
                                fontSize: '20px',
                                padding: '0'
                            }}
                            onMouseOver={(e: any) => {
                                e.currentTarget.style.color = theme === 'light' ? '#1a1a2e' : 'white';
                            }}
                            onMouseOut={(e: any) => {
                                e.currentTarget.style.color = theme === 'light' ? '#6b7280' : 'rgba(255,255,255,0.6)';
                            }}
                        >
                            ×
                        </button>
                    </div>

                    {/* Comments */}
                    {sharedCommentsLoading ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: theme === 'light' ? '#6b7280' : 'rgba(255,255,255,0.5)' }}>
                            <div style={{ ...styles.spinner, margin: '0 auto 12px' }} />
                            Loading comments...
                        </div>
                    ) : sharedProfileComments.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: theme === 'light' ? '#9ca3af' : 'rgba(255,255,255,0.4)' }}>
                            No comments found for this profile.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {sharedProfileComments.map((comment: any, i: number) => (
                                <div key={i} style={{
                                    background: comment.isTopComment ? (theme === 'light' ? 'rgba(245,158,11,0.1)' : 'rgba(245,158,11,0.1)') : (theme === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)'),
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: `1px solid ${comment.isTopComment ? 'rgba(245,158,11,0.3)' : (theme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)')}`,
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                background: comment.context === 'DIRECT COMMENT ON POST' ? (theme === 'light' ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.2)') : (theme === 'light' ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.2)'),
                                                color: comment.context === 'DIRECT COMMENT ON POST' ? (theme === 'light' ? '#059669' : '#34d399') : (theme === 'light' ? '#2563eb' : '#60a5fa'),
                                                fontSize: '9px',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                display: 'inline-block',
                                                marginBottom: '6px',
                                                fontWeight: '500'
                                            }}>
                                                {comment.context === 'DIRECT COMMENT ON POST' ? 'Direct' : 'Reply'}
                                            </div>
                                            {comment.isTopComment && (
                                                <div style={{
                                                    background: theme === 'light' ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.2)',
                                                    color: theme === 'light' ? '#d97706' : '#fbbf24',
                                                    fontSize: '9px',
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    display: 'inline-block',
                                                    marginBottom: '6px',
                                                    marginLeft: '6px',
                                                    fontWeight: '500'
                                                }}>
                                                    TOP
                                                </div>
                                            )}
                                            <div style={{
                                                color: theme === 'light' ? '#1f2937' : 'rgba(255,255,255,0.9)',
                                                fontSize: '12px',
                                                lineHeight: '1.5',
                                                marginBottom: '8px'
                                            }}>
                                                {comment.commentText}
                                            </div>
                                            {comment.postText && (
                                                <div style={{
                                                    color: theme === 'light' ? '#6b7280' : 'rgba(255,255,255,0.5)',
                                                    fontSize: '11px',
                                                    lineHeight: '1.4',
                                                    padding: '8px',
                                                    background: theme === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.2)',
                                                    borderRadius: '6px',
                                                    borderLeft: theme === 'light' ? '3px solid rgba(0,0,0,0.1)' : '3px solid rgba(255,255,255,0.1)'
                                                }}>
                                                    <div style={{ color: theme === 'light' ? '#9ca3af' : 'rgba(255,255,255,0.4)', fontSize: '9px', marginBottom: '4px' }}>POST:</div>
                                                    {comment.postText}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )}
        </div>

    );
}