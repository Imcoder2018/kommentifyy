import { useState, useEffect, useCallback } from 'react';

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
        csAutoPost, setCsAutoPost, csSettingsLoading, csSettingsSaving,
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

    // Auto Decide state
    const [autoDecideEnabled, setAutoDecideEnabled] = useState(false);
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

    return (
        <div className="fade-in">
            <style>{globalStyles}</style>

            {/* Page Header with Breadcrumbs */}
            <div style={{
                marginBottom: SPACING.xl,
                paddingBottom: SPACING.lg,
                borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}>
                {/* Breadcrumbs */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: SPACING.sm,
                    marginBottom: SPACING.md,
                    fontSize: TYPOGRAPHY.fontSizeSm,
                    color: 'rgba(255,255,255,0.5)',
                }}>
                    <span
                        onClick={() => setActiveTab?.('overview')}
                        style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.color = 'white'}
                        onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                    >Dashboard</span>
                    <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
                    <span style={{ color: 'rgba(255,255,255,0.7)' }}>Comments</span>
                </div>

                {/* Title and Description */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: SPACING.lg }}>
                    <div>
                        <h1 style={{
                            color: 'white',
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
                            color: 'rgba(255,255,255,0.5)',
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

            {/* Comment Settings Section */}
            <div className="slide-in stagger-1" style={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
                    <h3 style={styles.sectionTitle}>
                        {miniIcon('M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', 'white', 18)}
                        <span>Comment Settings</span>
                    </h3>
                    <span style={styles.sectionSubtitle}>Controls AI comments — manual button & auto-commenting</span>
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

            {/* Comment Style Sources Section - improved styling */}
            <div className="slide-in stagger-2" style={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
                    <h3 style={styles.sectionTitle}>
                        {miniIcon('M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', 'white', 16)}
                        <span>Comment Style Sources</span>
                    </h3>
                    <button
                        onClick={loadCommentStyleProfiles}
                        style={styles.buttonSecondary as React.CSSProperties}
                    >
                        {miniIcon('M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', 'rgba(255,255,255,0.7)', 12)}
                        <span>Refresh</span>
                    </button>
                </div>
                {/* Add Profile Input — improved */}
                <div style={{ display: 'flex', gap: SPACING.sm, marginBottom: SPACING.md, alignItems: 'center' }}>
                    <input
                        value={commentStyleUrl}
                        onChange={e => setCommentStyleUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                        style={{ ...styles.input, flex: 1 } as React.CSSProperties}
                    />
                    <button
                        onClick={scrapeCommentStyle}
                        disabled={commentStyleScraping}
                        style={{
                            padding: '10px 16px',
                            background: commentStyleScraping ? 'rgba(59,130,246,0.4)' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: TYPOGRAPHY.fontWeightBold,
                            fontSize: TYPOGRAPHY.fontSizeSm,
                            cursor: commentStyleScraping ? 'wait' : 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        {commentStyleScraping ? (
                            <div style={styles.spinner} />
                        ) : (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {miniIcon('M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z', 'white', 14)}
                                Scrape
                            </span>
                        )}
                    </button>
                </div>
                {commentStyleStatus && (
                    <div style={{
                        marginBottom: SPACING.md,
                        padding: SPACING.sm + ' ' + SPACING.md,
                        background: commentStyleStatus.includes('Error') || commentStyleStatus.includes('Failed') ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)',
                        border: `1px solid ${commentStyleStatus.includes('Error') ? 'rgba(239,68,68,0.3)' : 'rgba(59,130,246,0.3)'}`,
                        borderRadius: '8px',
                        color: commentStyleStatus.includes('Error') ? '#f87171' : '#60a5fa',
                        fontSize: TYPOGRAPHY.fontSizeSm,
                    }}>
                        {commentStyleStatus}
                    </div>
                )}
                {/* Kommentify Shared Comment Profiles - improved */}
                {sharedCommentProfiles.length > 0 && (
                    <div style={{ marginBottom: SPACING.md, padding: SPACING.md, background: 'rgba(245,158,11,0.05)', borderRadius: '12px', border: '1px solid rgba(245,158,11,0.15)' }}>
                        <div style={{ color: '#fbbf24', fontSize: TYPOGRAPHY.fontSizeSm, fontWeight: TYPOGRAPHY.fontWeightBold, marginBottom: SPACING.sm, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {miniIcon('M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', '#fbbf24', 12)}
                            <span>Kommentify Shared</span>
                            <span style={{ opacity: 0.6, fontWeight: TYPOGRAPHY.fontWeightNormal }}>({sharedCommentProfiles.length})</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {sharedCommentProfiles.map((p: any, i: number) => {
                                const profileMatch = commentStyleProfiles.find((cp: any) => cp.profileId === p.profileId || cp.profileName === (p.profileName || p.profileId));
                                const isSelected = profileMatch?.isSelected || false;
                                return (
                                    <div key={i} onClick={() => { if (profileMatch) toggleProfileSelect(profileMatch.id); }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            background: isSelected ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.03)',
                                            padding: '6px 12px',
                                            borderRadius: '8px',
                                            border: isSelected ? '1px solid rgba(245,158,11,0.5)' : '1px solid rgba(255,255,255,0.08)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                        }}>
                                        <input type="checkbox" checked={isSelected} readOnly style={{ accentColor: '#f59e0b', width: '14px', height: '14px', cursor: 'pointer' }} />
                                        <span style={{ color: isSelected ? '#fbbf24' : 'rgba(255,255,255,0.7)', fontSize: TYPOGRAPHY.fontSizeSm, fontWeight: TYPOGRAPHY.fontWeightSemibold }}>{p.profileName || p.profileId}</span>
                                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: TYPOGRAPHY.fontSizeXs }}>{p.commentCount}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                {/* Saved Profiles - improved */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
                    <h4 style={{ color: 'white', fontSize: TYPOGRAPHY.fontSizeMd, fontWeight: TYPOGRAPHY.fontWeightBold, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {miniIcon('M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', 'white', 14)}
                        <span>Saved Profiles</span>
                        <span style={{ opacity: 0.5, fontWeight: TYPOGRAPHY.fontWeightNormal }}>({commentStyleProfiles.length})</span>
                    </h4>
                </div>
                {commentStyleLoading ? (
                    <div className="fade-in" style={styles.emptyState}>
                        <div className="skeleton" style={{ width: '100%', height: '60px', marginBottom: '8px' }} />
                        <div className="skeleton" style={{ width: '80%', height: '20px', margin: '0 auto' }} />
                    </div>
                ) : commentStyleProfiles.length === 0 ? (
                    <div className="fade-in" style={styles.emptyState}>
                        <div style={styles.emptyStateIcon}>
                            {miniIcon('M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', '#693fe9', 24)}
                        </div>
                        <h4 style={styles.emptyStateTitle}>No Comment Profiles</h4>
                        <p style={styles.emptyStateDesc}>Add a LinkedIn profile above to get started with AI-powered comments.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {commentStyleProfiles.map((profile: any) => (
                            <div key={profile.id}>
                                <div
                                    className="slide-in"
                                    style={{
                                        ...styles.profileCard,
                                        ...(profile.isSelected ? styles.profileCardSelected : {}),
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: SPACING.md,
                                        padding: SPACING.md,
                                    }}
                                >
                                    <span style={{ flexShrink: 0 }}>{miniIcon('M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z', profile.isSelected ? '#60a5fa' : 'rgba(255,255,255,0.5)', 18)}</span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ color: 'white', fontWeight: TYPOGRAPHY.fontWeightSemibold, fontSize: TYPOGRAPHY.fontSizeMd }}>{profile.profileName || profile.profileId}</div>
                                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: TYPOGRAPHY.fontSizeXs, marginTop: '2px' }}>{profile._count?.comments || profile.commentCount} comments{profile.lastScrapedAt ? ` · ${new Date(profile.lastScrapedAt).toLocaleDateString()}` : ''}</div>
                                    </div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: TYPOGRAPHY.fontSizeXs, color: profile.isSelected ? '#60a5fa' : 'rgba(255,255,255,0.5)', fontWeight: TYPOGRAPHY.fontWeightSemibold }}>
                                        <input type="checkbox" checked={profile.isSelected} onChange={() => toggleProfileSelect(profile.id)}
                                            style={{ accentColor: '#3b82f6', width: '16px', height: '16px' }} />
                                        Train
                                    </label>
                                    <button
                                        onClick={() => { if (commentStyleExpanded === profile.id) { setCommentStyleExpanded(null); setCommentStyleComments([]); } else { setCommentStyleExpanded(profile.id); loadProfileComments(profile.id); } }}
                                        style={styles.buttonSmall as React.CSSProperties}
                                    >
                                        {commentStyleExpanded === profile.id ? '▲' : '▼'}
                                    </button>
                                    <button onClick={() => deleteCommentStyleProfile(profile.id)}
                                        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', color: '#f87171', padding: '6px 10px', fontSize: TYPOGRAPHY.fontSizeSm, cursor: 'pointer' }}>
                                        ×
                                    </button>
                                </div>
                                {/* Expanded comments list */}
                                {commentStyleExpanded === profile.id && (
                                    <div style={{ background: 'rgba(0,0,0,0.15)', borderRadius: '0 0 12px 12px', padding: '16px', border: '1px solid rgba(255,255,255,0.06)', borderTop: 'none', maxHeight: '500px', overflowY: 'auto' }}>
                                        {commentStyleCommentsLoading ? (
                                            <div style={{ textAlign: 'center', padding: '20px 0', color: 'rgba(255,255,255,0.5)' }}>Loading comments...</div>
                                        ) : commentStyleComments.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '20px 0', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>No comments found. Try scraping again.</div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{commentStyleComments.length} comments · {commentStyleComments.filter((c: any) => c.isTopComment).length} marked as top</span>
                                                </div>
                                                {commentStyleComments.map((comment: any) => (
                                                    <div key={comment.id} style={{ background: comment.isTopComment ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: `1px solid ${comment.isTopComment ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.06)'}` }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                                {/* Comment Type Badge - improved */}
                                                                <div style={comment.context === 'DIRECT COMMENT ON POST' ? styles.badge('success') : styles.badge('info') as React.CSSProperties}>
                                                                    {miniIcon(comment.context === 'DIRECT COMMENT ON POST' ? 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' : 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6', comment.context === 'DIRECT COMMENT ON POST' ? '#34d399' : '#a78bfa', 10)}
                                                                    <span>{comment.context === 'DIRECT COMMENT ON POST' ? 'Direct comment' : 'Reply'}</span>
                                                                </div>
                                                                {/* Reply To (if applicable) */}
                                                                {comment.context !== 'DIRECT COMMENT ON POST' && (
                                                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 10px', borderRadius: '8px', marginBottom: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                                                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontWeight: '700', marginBottom: '4px', textTransform: 'uppercase' }}>REPLY TO:</div>
                                                                        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', lineHeight: '1.5', maxHeight: '120px', overflowY: 'auto', paddingRight: '4px' }}>
                                                                            {comment.context.replace('REPLY TO [', '').replace(/]:.*/, '')} said: {comment.context.match(/]: "(.*)"$/)?.[1] || 'N/A'}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {/* Post Text */}
                                                                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '8px 10px', borderRadius: '8px', marginBottom: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontWeight: '700', marginBottom: '4px', textTransform: 'uppercase' }}>POST:</div>
                                                                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', lineHeight: '1.5', maxHeight: '150px', overflowY: 'auto', paddingRight: '4px', fontStyle: 'italic' }}>
                                                                        {comment.postText || 'N/A'}
                                                                    </div>
                                                                </div>
                                                                {/* Comment Text */}
                                                                <div style={{ background: 'rgba(105,63,233,0.08)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(105,63,233,0.2)' }}>
                                                                    <div style={{ color: '#a78bfa', fontSize: '10px', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase' }}>COMMENT:</div>
                                                                    <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', lineHeight: '1.6', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px', whiteSpace: 'pre-wrap' }}>
                                                                        {comment.commentText}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <button onClick={() => toggleCommentTop(comment.id)}
                                                                title={comment.isTopComment ? 'Remove from top comments' : 'Mark as top comment for AI training'}
                                                                style={{ background: comment.isTopComment ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.08)', border: `1px solid ${comment.isTopComment ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.15)'}`, borderRadius: '8px', padding: '6px 12px', fontSize: '14px', cursor: 'pointer', flexShrink: 0, color: comment.isTopComment ? '#fbbf24' : 'rgba(255,255,255,0.5)', transition: 'all 0.2s' }}>
                                                                {comment.isTopComment ? miniIcon('M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', '#fbbf24', 14) : miniIcon('M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', 'rgba(255,255,255,0.3)', 14)}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                {/* AI Training Info - improved */}
                {commentStyleProfiles.some((p: any) => p.isSelected) && (
                    <div className="fade-in" style={{ background: 'rgba(59,130,246,0.08)', padding: SPACING.md, borderRadius: '12px', border: '1px solid rgba(59,130,246,0.2)', marginTop: SPACING.md, display: 'flex', alignItems: 'flex-start', gap: SPACING.sm }}>
                        <span style={{ flexShrink: 0, marginTop: '2px' }}>{miniIcon('M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 18a6 6 0 100-12 6 6 0 000 12z M12 14a2 2 0 100-4 2 2 0 000 4z', '#60a5fa', 16)}</span>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: TYPOGRAPHY.fontSizeSm, margin: 0, lineHeight: 1.5 }}>
                            <strong style={{ color: '#60a5fa' }}>Training Active:</strong> AI uses {commentStyleProfiles.filter((p: any) => p.isSelected).length} profile(s) with starred comments to match commenting style.
                        </p>
                    </div>
                )}

                {/* Kommentify Shared Profiles - improved */}
                {sharedCommentProfiles.length > 0 && (
                    <div style={{ marginTop: SPACING.xl }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md }}>
                            <h4 style={{ color: 'white', fontSize: TYPOGRAPHY.fontSizeLg, fontWeight: TYPOGRAPHY.fontWeightBold, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {miniIcon('M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', '#a78bfa', 16)}
                                <span>Kommentify Shared</span>
                                <span style={{ opacity: 0.5, fontWeight: TYPOGRAPHY.fontWeightNormal }}>({sharedCommentProfiles.length})</span>
                            </h4>
                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: TYPOGRAPHY.fontSizeSm }}>Curated by Kommentify team</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: SPACING.md }}>
                            {sharedCommentProfiles.map((profile: any) => (
                                <div key={profile.id} onClick={() => {
                                    setCommentStyleExpanded(commentStyleExpanded === profile.id ? null : profile.id);
                                    if (commentStyleExpanded !== profile.id) loadProfileComments(profile.id);
                                }}
                                    className="slide-in"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(105,63,233,0.1) 0%, rgba(139,92,246,0.03) 100%)',
                                        padding: SPACING.md,
                                        borderRadius: '12px',
                                        border: '1px solid rgba(105,63,233,0.2)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        textAlign: 'center'
                                    }}
                                    onMouseOver={e => {
                                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(105,63,233,0.2) 0%, rgba(139,92,246,0.08) 100%)';
                                        e.currentTarget.style.borderColor = 'rgba(105,63,233,0.4)';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseOut={e => {
                                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(105,63,233,0.1) 0%, rgba(139,92,246,0.03) 100%)';
                                        e.currentTarget.style.borderColor = 'rgba(105,63,233,0.2)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <div style={{ color: 'white', fontWeight: TYPOGRAPHY.fontWeightBold, fontSize: TYPOGRAPHY.fontSizeMd, marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {profile.profileName || profile.profileId}
                                    </div>
                                    <div style={{ color: '#a78bfa', fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>
                                        {profile._count?.comments || profile.commentCount || 0}
                                    </div>
                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: TYPOGRAPHY.fontSizeXs }}>comments</div>
                                </div>
                            ))}
                        </div>
                        {/* Expanded shared profile comments */}
                        {commentStyleExpanded && sharedCommentProfiles.find((p: any) => p.id === commentStyleExpanded) && (
                            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(105,63,233,0.2)', marginTop: '12px', maxHeight: '500px', overflowY: 'auto' }}>
                                {commentStyleCommentsLoading ? (
                                    <div style={{ textAlign: 'center', padding: '20px 0', color: 'rgba(255,255,255,0.5)' }}>Loading comments...</div>
                                ) : commentStyleComments.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '20px 0', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>No comments found.</div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <h5 style={{ color: '#a78bfa', fontSize: '13px', fontWeight: '700', margin: 0 }}>
                                                {sharedCommentProfiles.find((p: any) => p.id === commentStyleExpanded)?.profileName} - Comments
                                            </h5>
                                            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>{commentStyleComments.length} total</span>
                                        </div>
                                        {commentStyleComments.map((comment: any) => (
                                            <div key={comment.id} style={{ background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                                <div style={comment.context === 'DIRECT COMMENT ON POST' ? styles.badge('success') : styles.badge('info') as React.CSSProperties}>
                                                    {miniIcon(comment.context === 'DIRECT COMMENT ON POST' ? 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' : 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6', comment.context === 'DIRECT COMMENT ON POST' ? '#34d399' : '#a78bfa', 10)}
                                                    <span>{comment.context === 'DIRECT COMMENT ON POST' ? 'Direct comment' : 'Reply'}</span>
                                                </div>
                                                {comment.context !== 'DIRECT COMMENT ON POST' && (
                                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 10px', borderRadius: '8px', marginBottom: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontWeight: '700', marginBottom: '4px', textTransform: 'uppercase' }}>REPLY TO:</div>
                                                        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', lineHeight: '1.5', maxHeight: '120px', overflowY: 'auto', paddingRight: '4px' }}>
                                                            {comment.context.replace('REPLY TO [', '').replace(/]:.*/, '')} said: {comment.context.match(/]: "(.*)"$/)?.[1] || 'N/A'}
                                                        </div>
                                                    </div>
                                                )}
                                                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '8px 10px', borderRadius: '8px', marginBottom: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontWeight: '700', marginBottom: '4px', textTransform: 'uppercase' }}>POST:</div>
                                                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', lineHeight: '1.5', maxHeight: '150px', overflowY: 'auto', paddingRight: '4px', fontStyle: 'italic' }}>
                                                        {comment.postText || 'N/A'}
                                                    </div>
                                                </div>
                                                <div style={{ background: 'rgba(105,63,233,0.08)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(105,63,233,0.2)' }}>
                                                    <div style={{ color: '#a78bfa', fontSize: '10px', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase' }}>COMMENT:</div>
                                                    <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', lineHeight: '1.6', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px', whiteSpace: 'pre-wrap' }}>
                                                        {comment.commentText}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>

    );
}