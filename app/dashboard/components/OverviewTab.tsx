import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// Default theme tokens for consistent styling
const defaultTheme = {
    colors: {
        primary: '#8b5cf6',
        primaryLight: '#a78bfa',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',
        surface: {
            primary: 'rgba(255,255,255,0.08)',
            secondary: 'rgba(255,255,255,0.05)',
            hover: 'rgba(255,255,255,0.12)'
        },
        border: {
            subtle: 'rgba(255,255,255,0.08)',
            default: 'rgba(255,255,255,0.12)',
            strong: 'rgba(255,255,255,0.2)'
        },
        text: {
            primary: '#ffffff',
            secondary: 'rgba(255,255,255,0.7)',
            tertiary: 'rgba(255,255,255,0.5)'
        }
    }
};

// Check for reduced motion preference
const usePrefersReducedMotion = () => {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);

        const handler = (event: MediaQueryListEvent) => {
            setPrefersReducedMotion(event.matches);
        };

        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    return prefersReducedMotion;
};

export default function OverviewTab(props: any) {
    // Hover state for cards
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    // Check for reduced motion
    const prefersReducedMotion = usePrefersReducedMotion();

    // Animated counter hook
    const useAnimatedValue = (targetValue: number, duration: number = 1000) => {
        const [displayValue, setDisplayValue] = useState(0);

        useEffect(() => {
            const startTime = Date.now();
            const startValue = displayValue;
            const difference = targetValue - startValue;

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeOut = 1 - Math.pow(1 - progress, 3);
                setDisplayValue(startValue + difference * easeOut);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };

            requestAnimationFrame(animate);
        }, [targetValue, duration]);

        return displayValue;
    };

    // Icon components for stats cards
    const CardIcons = {
        plan: () => (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
            </svg>
        ),
        earnings: () => (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
        ),
        referrals: () => (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
        ),
        member: () => (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
        )
    };

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
        csUseProfileStyle, setCsUseProfileStyle, csUseProfileData, setCsUseProfileData,
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

    // Click handler for stats cards
    const handleCardClick = useCallback((cardType: string) => {
        // Navigate to relevant section based on card type
        if (cardType === 'plan') {
            handleTabChange?.('settings');
        } else if (cardType === 'earnings' || cardType === 'referrals') {
            handleTabChange?.('referrals');
        } else if (cardType === 'member') {
            handleTabChange?.('settings');
        }
    }, [handleTabChange]);

    // Check if data is loading
    const isLoading = referralData === undefined;

    return (
                    <>
                        {/* Stats Cards Row */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                            gap: '20px',
                            marginBottom: '32px'
                        }}>
                            {/* Loading Skeletons */}
                            {isLoading ? (
                                <>
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} style={{
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            padding: '24px',
                                            borderRadius: '24px',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            animation: 'pulse 1.5s ease-in-out infinite',
                                            animationDelay: `${i * 0.15}s`
                                        }}>
                                            <div style={{
                                                height: '12px',
                                                width: '80px',
                                                background: 'rgba(255, 255, 255, 0.1)',
                                                borderRadius: '4px',
                                                marginBottom: '12px'
                                            }} />
                                            <div style={{
                                                height: '28px',
                                                width: '120px',
                                                background: 'rgba(255, 255, 255, 0.1)',
                                                borderRadius: '4px',
                                                marginBottom: '4px'
                                            }} />
                                            <div style={{
                                                height: '14px',
                                                width: '60px',
                                                background: 'rgba(255, 255, 255, 0.1)',
                                                borderRadius: '4px'
                                            }} />
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <>
                                    {/* Plan Card */}
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        aria-label={`Current Plan: ${user?.plan?.name || 'Free'}. Click to view settings.`}
                                        onClick={() => handleCardClick('plan')}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCardClick('plan')}
                                        onMouseEnter={() => setHoveredCard('plan')}
                                        onMouseLeave={() => setHoveredCard(null)}
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(139,92,246,0.35) 0%, rgba(167,139,250,0.15) 100%)',
                                            backdropFilter: 'blur(10px)',
                                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                            padding: '24px',
                                            borderRadius: '24px',
                                            border: '1px solid rgba(139,92,246,0.3)',
                                            cursor: 'pointer',
                                            transform: prefersReducedMotion ? 'none' : (hoveredCard === 'plan' ? 'translateY(-4px) scale(1.01)' : 'translateY(0)'),
                                            boxShadow: hoveredCard === 'plan' ? 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 20px rgba(0,0,0,0.2), 0 8px 32px rgba(139, 92, 246, 0.3)' : 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 20px rgba(0,0,0,0.2)',
                                            transition: prefersReducedMotion ? 'none' : 'all 0.3s ease'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                            <span style={{ fontSize: '12px', color: defaultTheme.colors.text.tertiary, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>{t('overviewTab.currentPlan')}</span>
                                            <CardIcons.plan />
                                        </div>
                                        <div style={{ fontSize: '32px', fontWeight: '700', color: defaultTheme.colors.text.primary, marginBottom: '8px' }}>{user?.plan?.name || 'Free'}</div>
                                        <div style={{ fontSize: '14px', color: defaultTheme.colors.text.secondary, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span style={{
                                                background: 'rgba(16,185,129,0.15)',
                                                color: defaultTheme.colors.success,
                                                padding: '4px 10px',
                                                borderRadius: '12px',
                                                fontSize: '11px',
                                                fontWeight: '600'
                                            }}>Active</span>
                                            {hoveredCard === 'plan' && !prefersReducedMotion && (
                                                <span style={{ fontSize: '12px', color: defaultTheme.colors.text.secondary }}>Click to view →</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Referral Earnings */}
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        aria-label={`Referral Earnings: $${(referralData?.stats.commission || 0).toFixed(2)}. Click to view referrals.`}
                                        onClick={() => handleCardClick('earnings')}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCardClick('earnings')}
                                        onMouseEnter={() => setHoveredCard('earnings')}
                                        onMouseLeave={() => setHoveredCard(null)}
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(245,158,11,0.35) 0%, rgba(251,191,36,0.15) 100%)',
                                            backdropFilter: 'blur(10px)',
                                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                            padding: '24px',
                                            borderRadius: '24px',
                                            border: '1px solid rgba(245,158,11,0.3)',
                                            cursor: 'pointer',
                                            transform: prefersReducedMotion ? 'none' : (hoveredCard === 'earnings' ? 'translateY(-4px) scale(1.01)' : 'translateY(0)'),
                                            boxShadow: hoveredCard === 'earnings' ? 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 20px rgba(0,0,0,0.2), 0 8px 32px rgba(245, 158, 11, 0.3)' : 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 20px rgba(0,0,0,0.2)',
                                            transition: prefersReducedMotion ? 'none' : 'all 0.3s ease'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                            <span style={{ fontSize: '12px', color: defaultTheme.colors.text.tertiary, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>{t('overviewTab.referralEarnings')}</span>
                                            <CardIcons.earnings />
                                        </div>
                                        <div style={{ fontSize: '32px', fontWeight: '700', color: defaultTheme.colors.text.primary, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            ${(referralData?.stats.commission || 0).toFixed(2)}
                                            {(referralData?.stats.commission || 0) > 0 && (
                                                <span style={{ fontSize: '14px', color: defaultTheme.colors.success, display: 'flex', alignItems: 'center' }}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                                                        <polyline points="17 6 23 6 23 12"/>
                                                    </svg>
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '14px', color: defaultTheme.colors.warning, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span>{referralData?.stats.totalPaidReferrals || 0} {t('overviewTab.paidUsers')}</span>
                                            {hoveredCard === 'earnings' && !prefersReducedMotion && (
                                                <span style={{ fontSize: '12px', color: defaultTheme.colors.text.secondary }}>Click to view →</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Total Referrals */}
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        aria-label={`Total Referrals: ${referralData?.stats.totalReferrals || 0}. Click to view referrals.`}
                                        onClick={() => handleCardClick('referrals')}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCardClick('referrals')}
                                        onMouseEnter={() => setHoveredCard('referrals')}
                                        onMouseLeave={() => setHoveredCard(null)}
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(16,185,129,0.35) 0%, rgba(52,211,153,0.15) 100%)',
                                            backdropFilter: 'blur(10px)',
                                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                            padding: '24px',
                                            borderRadius: '24px',
                                            border: '1px solid rgba(16,185,129,0.3)',
                                            cursor: 'pointer',
                                            transform: prefersReducedMotion ? 'none' : (hoveredCard === 'referrals' ? 'translateY(-4px) scale(1.01)' : 'translateY(0)'),
                                            boxShadow: hoveredCard === 'referrals' ? 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 20px rgba(0,0,0,0.2), 0 8px 32px rgba(16, 185, 129, 0.3)' : 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 20px rgba(0,0,0,0.2)',
                                            transition: prefersReducedMotion ? 'none' : 'all 0.3s ease'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                            <span style={{ fontSize: '12px', color: defaultTheme.colors.text.tertiary, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>{t('overviewTab.totalReferrals')}</span>
                                            <CardIcons.referrals />
                                        </div>
                                        <div style={{ fontSize: '32px', fontWeight: '700', color: defaultTheme.colors.text.primary, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {referralData?.stats.totalReferrals || 0}
                                            {(referralData?.stats.totalReferrals || 0) > 0 && (
                                                <span style={{ fontSize: '14px', color: defaultTheme.colors.success, display: 'flex', alignItems: 'center' }}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                                                        <polyline points="17 6 23 6 23 12"/>
                                                    </svg>
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '14px', color: defaultTheme.colors.success, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span>{t('overviewTab.usersJoined')}</span>
                                            {hoveredCard === 'referrals' && !prefersReducedMotion && (
                                                <span style={{ fontSize: '12px', color: defaultTheme.colors.text.secondary }}>Click to view →</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Member Since */}
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        aria-label={`Member since: ${user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}. Click to view settings.`}
                                        onClick={() => handleCardClick('member')}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCardClick('member')}
                                        onMouseEnter={() => setHoveredCard('member')}
                                        onMouseLeave={() => setHoveredCard(null)}
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(59,130,246,0.35) 0%, rgba(96,165,250,0.15) 100%)',
                                            backdropFilter: 'blur(10px)',
                                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                            padding: '24px',
                                            borderRadius: '24px',
                                            border: '1px solid rgba(59,130,246,0.3)',
                                            cursor: 'pointer',
                                            transform: prefersReducedMotion ? 'none' : (hoveredCard === 'member' ? 'translateY(-4px) scale(1.01)' : 'translateY(0)'),
                                            boxShadow: hoveredCard === 'member' ? 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 20px rgba(0,0,0,0.2), 0 8px 32px rgba(59, 130, 246, 0.3)' : 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 20px rgba(0,0,0,0.2)',
                                            transition: prefersReducedMotion ? 'none' : 'all 0.3s ease'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                            <span style={{ fontSize: '12px', color: defaultTheme.colors.text.tertiary, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>{t('overviewTab.memberSince')}</span>
                                            <CardIcons.member />
                                        </div>
                                        <div style={{ fontSize: '28px', fontWeight: '700', color: defaultTheme.colors.text.primary, marginBottom: '4px' }}>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</div>
                                        <div style={{ fontSize: '14px', color: defaultTheme.colors.text.secondary, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px' }}>{user?.email}</span>
                                            {hoveredCard === 'member' && !prefersReducedMotion && (
                                                <span style={{ fontSize: '12px', color: defaultTheme.colors.text.secondary }}>Click to view →</span>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* LinkedIn Profile Stats (Voyager Data) */}
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(0,119,181,0.15) 0%, rgba(0,77,128,0.08) 100%)',
                            padding: '24px',
                            borderRadius: '24px',
                            border: '1px solid rgba(0,119,181,0.25)',
                            marginBottom: '32px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                    {miniIcon('M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z M2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z', '#0077B5', 16)}
                                    LinkedIn Profile
                                </h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {voyagerData?.voyagerLastSyncAt && (
                                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                                            Synced {new Date(voyagerData.voyagerLastSyncAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    )}
                                    <button
                                        onClick={async () => {
                                            setVoyagerSyncing(true);
                                            try {
                                                showToast('Syncing LinkedIn data via extension...', 'info');
                                                // Trigger sync via extension (if extension is installed, it will handle it)
                                                const token = localStorage.getItem('authToken');
                                                // Attempt to trigger via the extension's content script bridge
                                                window.postMessage({ type: 'COMMENTRON_RUNTIME_SEND_MESSAGE', action: 'VOYAGER_SYNC', payload: {}, requestId: 'voyager_sync_' + Date.now() }, '*');
                                                // Reload data after a short delay
                                                setTimeout(() => { loadVoyagerData(); setVoyagerSyncing(false); showToast('LinkedIn data refreshed!', 'success'); }, 5000);
                                            } catch (e) { setVoyagerSyncing(false); showToast('Sync failed', 'error'); }
                                        }}
                                        disabled={voyagerSyncing}
                                        style={{
                                            background: voyagerSyncing ? 'rgba(0,119,181,0.3)' : 'rgba(0,119,181,0.5)',
                                            border: '1px solid rgba(0,119,181,0.5)',
                                            color: 'white',
                                            padding: '6px 14px',
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            cursor: voyagerSyncing ? 'not-allowed' : 'pointer',
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {voyagerSyncing ? '⟳ Syncing...' : '↻ Sync Now'}
                                    </button>
                                </div>
                            </div>

                            {voyagerData ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
                                    {/* Followers */}
                                    <div style={{ background: 'rgba(0,119,181,0.12)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(0,119,181,0.15)' }}>
                                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Followers</div>
                                        <div style={{ fontSize: '26px', fontWeight: '700', color: '#38bdf8' }}>{voyagerData.followerCount != null ? voyagerData.followerCount.toLocaleString() : '—'}</div>
                                    </div>
                                    {/* Connections */}
                                    <div style={{ background: 'rgba(0,119,181,0.12)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(0,119,181,0.15)' }}>
                                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Connections</div>
                                        <div style={{ fontSize: '26px', fontWeight: '700', color: '#0ea5e9' }}>{voyagerData.connectionCount != null ? voyagerData.connectionCount.toLocaleString() : '—'}</div>
                                    </div>
                                    {/* Profile Views */}
                                    <div style={{ background: 'rgba(0,119,181,0.12)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(0,119,181,0.15)' }}>
                                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Profile Views</div>
                                        <div style={{ fontSize: '26px', fontWeight: '700', color: '#06b6d4' }}>{voyagerData.profileViewsData?.totalViews != null ? voyagerData.profileViewsData.totalViews.toLocaleString() : '—'}</div>
                                    </div>
                                    {/* Recent Posts */}
                                    <div style={{ background: 'rgba(0,119,181,0.12)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(0,119,181,0.15)' }}>
                                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Recent Posts</div>
                                        <div style={{ fontSize: '26px', fontWeight: '700', color: '#22d3ee' }}>{voyagerData.recentPosts?.length || 0}</div>
                                    </div>
                                    {/* Pending Invitations */}
                                    <div style={{ background: 'rgba(16,185,129,0.12)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.15)' }}>
                                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Invitations</div>
                                        <div style={{ fontSize: '26px', fontWeight: '700', color: '#10b981' }}>{voyagerData.invitationsData?.received?.total ?? '—'}</div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
                                    {voyagerLoading ? '⟳ Loading LinkedIn data...' : 'No LinkedIn data yet — click "Sync Now" with the extension active on LinkedIn'}
                                </div>
                            )}

                            {/* Profile info (below the stats) */}
                            {voyagerData?.name && (
                                <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(0,0,0,0.15)', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: voyagerData.about ? '12px' : '0' }}>
                                        {voyagerData.profilePicture ? (
                                            <img src={voyagerData.profilePicture} alt="" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                                        ) : (
                                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #0077B5, #00a0dc)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '18px', color: 'white', flexShrink: 0 }}>
                                                {voyagerData.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: '16px', fontWeight: '700', color: 'white' }}>{voyagerData.name}</div>
                                            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>{voyagerData.headline || ''}</div>
                                            {voyagerData.location && <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>📍 {voyagerData.location}</div>}
                                        </div>
                                        {voyagerData.linkedInUsername && (
                                            <a href={`https://linkedin.com/in/${voyagerData.linkedInUsername}`} target="_blank" rel="noopener noreferrer"
                                                style={{ fontSize: '12px', color: '#38bdf8', textDecoration: 'none', flexShrink: 0, padding: '6px 12px', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '8px' }}>View Profile →</a>
                                        )}
                                    </div>
                                    {voyagerData.about && (
                                        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.5', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
                                            {voyagerData.about.length > 200 ? voyagerData.about.substring(0, 200) + '...' : voyagerData.about}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Recent LinkedIn Posts Card - Moved before Experience */}
                            {voyagerData?.recentPosts && voyagerData.recentPosts.length > 0 && (
                                <div style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    padding: '24px',
                                    borderRadius: '20px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    marginBottom: '20px',
                                    marginTop: '16px'
                                }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {miniIcon('M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z', '#a78bfa', 16)} Recent Posts Engagement ({voyagerData.recentPosts.length})
                                    </h3>
                                    {/* LinkedIn-style 3-column grid */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                                        {voyagerData.recentPosts.map((post: any, idx: number) => (
                                            <div key={idx} style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e0e0e0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                                                {/* LinkedIn-style Post Header - User's Profile */}
                                                <div style={{ padding: '12px 14px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                                    {voyagerData.profilePicture ? (
                                                        <img src={voyagerData.profilePicture} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                                                    ) : (
                                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #0077b5, #00a0dc)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '16px', flexShrink: 0 }}>
                                                            {voyagerData.name?.charAt(0) || '?'}
                                                        </div>
                                                    )}
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ color: '#0a0a0a', fontSize: '13px', fontWeight: '600', marginBottom: '1px', lineHeight: '1.3' }}>{voyagerData.name || 'Your Post'}</div>
                                                        <div style={{ color: '#666666', fontSize: '11px', lineHeight: '1.3' }}>
                                                            {post.date ? new Date(post.date).toLocaleDateString() : 'Recent'} · Post
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Post Content */}
                                                <div style={{ padding: '0 14px 10px 14px' }}>
                                                    <div style={{ color: '#1a1a1a', fontSize: '12px', lineHeight: '1.5', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: '100px', overflowY: 'auto', fontFamily: '-apple-system, system-ui, sans-serif' }}>
                                                        {post.text?.length > 200 ? post.text.substring(0, 200) + '...' : post.text || '(No content)'}
                                                    </div>
                                                </div>

                                                {/* Engagement Stats - LinkedIn style */}
                                                <div style={{ padding: '8px 14px', borderTop: '1px solid #e5e5e5', display: 'flex', gap: '12px', fontSize: '11px', color: '#666666' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <span>👍</span> <span>{post.likes || 0}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <span>💬</span> <span>{post.comments || 0}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <span>🔄</span> <span>{post.shares || 0}</span>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div style={{ padding: '6px 8px 8px 8px', borderTop: '1px solid #e5e5e5' }}>
                                                    {post.url && (
                                                        <a href={post.url} target="_blank" rel="noopener noreferrer"
                                                            style={{ padding: '6px 8px', background: '#0077b5', color: 'white', borderRadius: '4px', fontSize: '11px', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                                            🔗 View on LinkedIn
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}


                            {/* Invitations Section */}
                            {voyagerData?.invitationsData && (
                                <div style={{ marginTop: '16px' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', paddingLeft: '4px' }}>Invitations</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                        <div style={{ background: 'rgba(16,185,129,0.1)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.12)' }}>
                                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>Received</div>
                                            <div style={{ fontSize: '20px', fontWeight: '700', color: '#10b981' }}>{voyagerData.invitationsData?.received?.total ?? '—'}</div>
                                        </div>
                                        <div style={{ background: 'rgba(59,130,246,0.1)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(59,130,246,0.12)' }}>
                                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>Sent</div>
                                            <div style={{ fontSize: '20px', fontWeight: '700', color: '#3b82f6' }}>{voyagerData.invitationsData?.sent?.total ?? '—'}</div>
                                        </div>
                                    </div>
                                    {/* Recent received invitations list */}
                                    {voyagerData.invitationsData?.received?.invitations?.length > 0 && (
                                        <div style={{ marginTop: '8px', display: 'grid', gap: '6px' }}>
                                            {voyagerData.invitationsData.received.invitations.slice(0, 5).map((inv: any, i: number) => (
                                                <div key={i} style={{ background: 'rgba(0,0,0,0.12)', padding: '10px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    {inv.senderPicture ? (
                                                        <img src={inv.senderPicture} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                                                    ) : (
                                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '12px' }}>👤</div>
                                                    )}
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontSize: '12px', fontWeight: '600', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inv.senderName}</div>
                                                        {inv.senderOccupation && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inv.senderOccupation}</div>}
                                                    </div>
                                                    {inv.sentTime && <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>{new Date(inv.sentTime).toLocaleDateString()}</div>}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Profile Viewers Section */}
                            {voyagerData?.profileViewsData?.viewers && voyagerData.profileViewsData.viewers.length > 0 && (
                                <div style={{ marginTop: '16px' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', paddingLeft: '4px' }}>
                                        Profile Viewers {voyagerData.profileViewsData?.totalViews != null && <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: '400' }}>({voyagerData.profileViewsData.totalViews} total)</span>}
                                    </div>
                                    <div style={{ display: 'grid', gap: '6px' }}>
                                        {voyagerData.profileViewsData.viewers.slice(0, 8).map((viewer: any, i: number) => (
                                            <div key={i} style={{ background: 'rgba(0,0,0,0.12)', padding: '10px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {viewer.type === 'identified' && viewer.picture ? (
                                                    <img src={viewer.picture} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                                                ) : (
                                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: viewer.type === 'anonymous' ? 'rgba(255,255,255,0.08)' : 'rgba(6,182,212,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '12px' }}>
                                                        {viewer.type === 'anonymous' ? '🔒' : '👤'}
                                                    </div>
                                                )}
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {viewer.type === 'identified' ? viewer.name : viewer.type === 'obfuscated' ? (viewer.description || viewer.companyName || 'LinkedIn Member') : `${viewer.count || 1} anonymous viewer(s)`}
                                                    </div>
                                                    {viewer.occupation && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{viewer.occupation}</div>}
                                                </div>
                                                {viewer.viewedAt && <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>{new Date(viewer.viewedAt).toLocaleDateString()}</div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Top Connections Section */}
                            {voyagerData?.topConnections && voyagerData.topConnections.length > 0 && (
                                <div style={{ marginTop: '16px' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', paddingLeft: '4px' }}>Recent Connections</div>
                                    <div style={{ display: 'grid', gap: '6px' }}>
                                        {voyagerData.topConnections.slice(0, 6).map((conn: any, i: number) => (
                                            <div key={i} style={{ background: 'rgba(0,0,0,0.12)', padding: '10px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {conn.picture ? (
                                                    <img src={conn.picture} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                                                ) : (
                                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '12px' }}>👤</div>
                                                )}
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conn.name}</div>
                                                    {conn.occupation && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conn.occupation}</div>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Experience Section - Moved after Recent Connections */}
                            {voyagerData?.experience && voyagerData.experience.length > 0 && (
                                <div style={{ marginTop: '16px' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', paddingLeft: '4px' }}>Experience</div>
                                    <div style={{ display: 'grid', gap: '8px' }}>
                                        {voyagerData.experience.map((exp: any, i: number) => (
                                            <div key={i} style={{ background: 'rgba(0,0,0,0.12)', padding: '12px 14px', borderRadius: '10px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '14px' }}>💼</div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'white' }}>{exp.title || exp.companyName || 'Position'}</div>
                                                    {exp.companyName && exp.title && <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>{exp.companyName}</div>}
                                                    {exp.dateRange && (
                                                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '3px' }}>
                                                            {exp.dateRange.startMonth ? `${exp.dateRange.startMonth}/` : ''}{exp.dateRange.startYear || ''}
                                                            {' — '}
                                                            {exp.dateRange.endYear ? `${exp.dateRange.endMonth ? exp.dateRange.endMonth + '/' : ''}${exp.dateRange.endYear}` : 'Present'}
                                                        </div>
                                                    )}
                                                    {exp.location && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>📍 {exp.location}</div>}
                                                    {exp.description && <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px', lineHeight: '1.4' }}>{exp.description.length > 150 ? exp.description.substring(0, 150) + '...' : exp.description}</div>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Education Section - Moved after Recent Connections */}
                            {voyagerData?.education && voyagerData.education.length > 0 && (
                                <div style={{ marginTop: '16px' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', paddingLeft: '4px' }}>Education</div>
                                    <div style={{ display: 'grid', gap: '8px' }}>
                                        {voyagerData.education.map((edu: any, i: number) => (
                                            <div key={i} style={{ background: 'rgba(0,0,0,0.12)', padding: '12px 14px', borderRadius: '10px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '14px' }}>🎓</div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'white' }}>{edu.schoolName || 'School'}</div>
                                                    {(edu.degree || edu.fieldOfStudy) && (
                                                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
                                                            {[edu.degree, edu.fieldOfStudy].filter(Boolean).join(' · ')}
                                                        </div>
                                                    )}
                                                    {edu.dateRange && (
                                                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '3px' }}>
                                                            {edu.dateRange.startYear || ''}{edu.dateRange.endYear ? ` — ${edu.dateRange.endYear}` : ''}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick Usage Summary */}
                        <div style={{
                            background: 'rgba(255,255,255,0.05)',
                            padding: '24px',
                            borderRadius: '20px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            marginBottom: '30px'
                        }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>{miniIcon('M18 20V10 M12 20V4 M6 20v-6', 'white', 16)} Monthly Usage</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                                {[
                                    { icon: 'likes', label: 'Likes', used: usage?.usage?.likes || 0, limit: usage?.limits?.likes || 0 },
                                    { icon: 'ai', label: 'AI Posts', used: usage?.usage?.aiPosts || 0, limit: usage?.limits?.aiPosts || 0 },
                                    {
                                        icon: 'comments',
                                        label: 'AI Comments',
                                        used: usage?.usage?.aiComments || 0,
                                        limit: (usage?.limits?.aiComments || 0) + (usage?.usage?.bonusAiComments || 0),
                                        isTotalAvailable: true
                                    },
                                    { icon: 'follows', label: 'Follows', used: usage?.usage?.follows || 0, limit: usage?.limits?.follows || 0 },
                                ].map((item, i) => {
                                    const pct = item.limit > 0 ? (item.used / item.limit) * 100 : 0;
                                    return (
                                        <div key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '5px' }}>{item.icon === 'likes' ? miniIcon('M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z', 'rgba(255,255,255,0.7)', 13) : item.icon === 'ai' ? miniIcon('M4 4h16v16H4z M9 9h6v6H9z M9 2v2 M15 2v2 M9 20v2 M15 20v2 M2 9h2 M2 15h2 M20 9h2 M20 15h2', 'rgba(255,255,255,0.7)', 13) : item.icon === 'comments' ? miniIcon('M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z', 'rgba(255,255,255,0.7)', 13) : miniIcon('M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M8.5 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M20 8v6 M23 11h-6', 'rgba(255,255,255,0.7)', 13)} {item.label}</span>
                                                <span style={{ fontSize: '14px', fontWeight: '600', color: pct >= 100 ? '#ef4444' : pct > 80 ? '#f59e0b' : '#10b981' }}>{item.used}/{item.limit}</span>
                                            </div>
                                            <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: pct >= 100 ? '#ef4444' : pct > 80 ? '#f59e0b' : '#10b981', borderRadius: '3px', transition: 'width 0.3s' }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                            <a href="https://chromewebstore.google.com/detail/kommentify-linkedin-auto/laeckkpjacbodjglcnenggpdpehkacei" target="_blank" rel="noopener noreferrer" style={{
                                background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(5,150,105,0.1) 100%)',
                                padding: '24px',
                                borderRadius: '20px',
                                border: '1px solid rgba(16,185,129,0.3)',
                                textDecoration: 'none',
                                display: 'block'
                            }}>
                                <div style={{ marginBottom: '12px' }}>{miniIcon('M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z', '#10b981', 32)}</div>
                                <h4 style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>Get Chrome Extension</h4>
                                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>Install our extension to start automating</p>
                            </a>
                            <div onClick={() => setActiveTab('referrals')} style={{
                                background: 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(217,119,6,0.1) 100%)',
                                padding: '24px',
                                borderRadius: '20px',
                                border: '1px solid rgba(245,158,11,0.3)',
                                cursor: 'pointer'
                            }}>
                                <div style={{ marginBottom: '12px' }}>{miniIcon('M20 12v10H4V12 M2 7h20v5H2z M12 22V7 M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z', '#f59e0b', 32)}</div>
                                <h4 style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>Invite Friends</h4>
                                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>Earn 30% commission on every paid referral</p>
                            </div>
                        </div>
                    </>

    );
}