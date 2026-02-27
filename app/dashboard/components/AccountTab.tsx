export default function AccountTab(props: any) {
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
        // Additional (used in Account tab)
        changeDashboardLanguage, setLinkedInOAuth, setLinkedInProfileScanning, setLinkedInProfile,
        SUPPORTED_LANGUAGES, setLiveActivityLogs, setLiveActivityLoading,
        setCommenterCfg, setCommentStyleComments, setImportCfg, setAutoSettings, setTrendingStatus, setFeedScrapeStatus, setFeedScrapeCommandId, setTrendingGeneratedPosts, setPlannerGenerating,
        handleTabChange, cleanLinkedInProfileUrls,
    } = props;

    return (
        <>
            <div style={{ display: 'grid', gap: '24px' }}>
                {/* Account Info Card */}
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    padding: '30px',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <div style={{ display: 'grid', gap: '20px', maxWidth: '500px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>{t('accountTab.fullName')}</label>
                            <div style={{ padding: '14px 18px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', color: 'white', fontSize: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>{user?.name || t('accountTab.na')}</div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>{t('accountTab.emailAddress')}</label>
                            <div style={{ padding: '14px 18px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', color: 'white', fontSize: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>{user?.email || t('accountTab.na')}</div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>{t('accountTab.currentPlan')}</label>
                            <div style={{ padding: '14px 18px', background: 'linear-gradient(135deg, rgba(105,63,233,0.2), rgba(139,92,246,0.1))', borderRadius: '12px', color: 'white', fontSize: '15px', border: '1px solid rgba(105,63,233,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>{user?.plan?.name || t('common.free')}</span>
                                <button onClick={() => router.push('/plans')} style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #693fe9, #8b5cf6)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>{t('accountTab.changePlan')}</button>
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>{t('accountTab.memberSince')}</label>
                            <div style={{ padding: '14px 18px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', color: 'white', fontSize: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString(dashLang === 'en' ? 'en-US' : dashLang, { month: 'long', day: 'numeric', year: 'numeric' }) : t('accountTab.na')}</div>
                        </div>
                    </div>
                </div>

                {/* Language Selector Card */}
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    padding: '30px',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {miniIcon('M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z', '#a78bfa', 20)}
                        {t('accountTab.language')}
                    </h3>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '20px', marginTop: 0 }}>{t('accountTab.selectLanguage')}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px', maxWidth: '600px' }}>
                        {SUPPORTED_LANGUAGES.map((lang: any) => (
                            <button
                                key={lang.code}
                                onClick={() => changeDashboardLanguage(lang.code)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '12px 16px',
                                    background: dashLang === lang.code
                                        ? 'linear-gradient(135deg, rgba(105,63,233,0.3) 0%, rgba(139,92,246,0.2) 100%)'
                                        : 'rgba(255,255,255,0.05)',
                                    border: dashLang === lang.code
                                        ? '2px solid rgba(105,63,233,0.6)'
                                        : '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    color: dashLang === lang.code ? 'white' : 'rgba(255,255,255,0.7)',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: dashLang === lang.code ? '600' : '400',
                                    transition: 'all 0.2s ease',
                                    textAlign: 'left',
                                }}
                            >
                                <span style={{ fontSize: '16px', fontWeight: '700', opacity: 0.8 }}>{lang.nativeName}</span>
                                {dashLang === lang.code && (
                                    <span style={{ marginLeft: 'auto', color: '#a78bfa', display: 'flex' }}>
                                        {miniIcon('M9 11l3 3L22 4', '#a78bfa', 14)}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* LinkedIn API Connection Card */}
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    padding: '30px',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '10px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {miniIcon('M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71', '#0077b5', 20)}
                            LinkedIn API Connection
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {extensionConnected ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(16,185,129,0.15)', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.3)' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
                                    <span style={{ color: '#34d399', fontSize: '12px', fontWeight: '600' }}>Extension Online</span>
                                </div>
                            ) : (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(239,68,68,0.15)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)' }}>
                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></span>
                                        <span style={{ color: '#f87171', fontSize: '12px', fontWeight: '600' }}>Extension Offline</span>
                                    </div>
                                    <button onClick={async () => { const token = localStorage.getItem('authToken'); await fetch('/api/extension/command', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ command: 'ping' }) }); showToast('Retry sent', 'info'); }}
                                        style={{ padding: '6px 12px', background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.4)', borderRadius: '8px', color: '#c4b5fd', fontWeight: '600', fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Retry</button>
                                    <button onClick={() => window.open('https://kommentify.com/extension', '_blank')}
                                        style={{ padding: '6px 12px', background: 'linear-gradient(135deg, #693fe9, #8b5cf6)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Get Extension</button>
                                </>
                            )}
                        </div>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '16px', marginTop: '6px' }}>Connect your LinkedIn account to post directly via API — no extension needed. Scheduled posts will be published even when your laptop is off.</p>
                    {linkedInOAuthLoading ? (
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Loading...</div>
                    ) : linkedInOAuth?.connected ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', background: 'rgba(16,185,129,0.1)', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.3)' }}>
                                <span style={{ color: '#34d399', fontSize: '18px' }}>✓</span>
                                <div>
                                    <div style={{ color: '#34d399', fontWeight: '700', fontSize: '14px' }}>Connected as {linkedInOAuth.displayName}</div>
                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{linkedInOAuth.email || ''} {linkedInOAuth.tokenExpired ? '⚠️ Token expired — reconnect' : ''}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {linkedInOAuth.tokenExpired && (
                                    <button onClick={() => { fetch('/api/auth/linkedin', { headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` } }).then(r => r.json()).then(d => { if (d.authUrl) window.location.href = d.authUrl; }); }}
                                        style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #0077b5, #00a0dc)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>Reconnect LinkedIn</button>
                                )}
                                <button onClick={async () => { const token = localStorage.getItem('authToken'); await fetch('/api/auth/linkedin', { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); setLinkedInOAuth(null); showToast('LinkedIn disconnected', 'success'); }}
                                    style={{ padding: '10px 20px', background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>Disconnect</button>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => { const token = localStorage.getItem('authToken'); fetch('/api/auth/linkedin', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()).then(d => { if (d.authUrl) window.location.href = d.authUrl; else showToast('Failed to get LinkedIn auth URL', 'error'); }); }}
                            style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #0077b5, #00a0dc)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,119,181,0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {miniIcon('M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71', 'white', 16)} Connect LinkedIn Account
                        </button>
                    )}
                </div>

                {/* Profile Scan Method Card */}
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    padding: '30px',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {miniIcon('M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', '#a78bfa', 20)}
                        Profile Scan Method
                    </h3>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '20px', marginTop: 0 }}>Choose how your LinkedIn profile is scanned</p>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => {
                                localStorage.setItem('profileScanMethod', 'ai');
                                showToast('Profile scan method set to AI', 'success');
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '14px 20px',
                                background: (typeof window !== 'undefined' && localStorage.getItem('profileScanMethod') !== 'classic')
                                    ? 'linear-gradient(135deg, rgba(105,63,233,0.3) 0%, rgba(139,92,246,0.2) 100%)'
                                    : 'rgba(255,255,255,0.05)',
                                border: (typeof window !== 'undefined' && localStorage.getItem('profileScanMethod') !== 'classic')
                                    ? '2px solid rgba(105,63,233,0.6)'
                                    : '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {miniIcon('M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', '#a78bfa', 16)}
                            AI Scan (Recommended)
                        </button>
                        <button
                            onClick={() => {
                                localStorage.setItem('profileScanMethod', 'classic');
                                showToast('Profile scan method set to Classic', 'success');
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '14px 20px',
                                background: (typeof window !== 'undefined' && localStorage.getItem('profileScanMethod') === 'classic')
                                    ? 'linear-gradient(135deg, rgba(105,63,233,0.3) 0%, rgba(139,92,246,0.2) 100%)'
                                    : 'rgba(255,255,255,0.05)',
                                border: (typeof window !== 'undefined' && localStorage.getItem('profileScanMethod') === 'classic')
                                    ? '2px solid rgba(105,63,233,0.6)'
                                    : '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {miniIcon('M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7z M2 12h20', '#a78bfa', 16)}
                            Classic Scan
                        </button>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '16px' }}>
                        AI Scan: Captures full profile text and uses AI to restructure data (more accurate).<br />
                        Classic Scan: Uses pattern matching to extract data (faster but less accurate).
                    </p>
                </div>
            </div>

            {/* Responsive Styles */}
            <style>{`
                @media (max-width: 1200px) {
                    div[style*="gridTemplateColumns: repeat(4"] { grid-template-columns: repeat(2, 1fr) !important; }
                }
                @media (max-width: 768px) {
                    div[style*="gridTemplateColumns: repeat(4"] { grid-template-columns: 1fr !important; }
                    div[style*="gridTemplateColumns: repeat(2"] { grid-template-columns: 1fr !important; }
                    .dashboard-sidebar { 
                        position: fixed !important;
                        width: 100% !important;
                        height: auto !important;
                        bottom: 0 !important;
                        top: auto !important;
                        left: 0 !important;
                        flex-direction: row !important;
                        padding: 10px !important;
                        border-top: 1px solid rgba(255,255,255,0.1) !important;
                        border-right: none !important;
                    }
                    .dashboard-main {
                        margin-left: 0 !important;
                        padding: 20px 15px 100px 15px !important;
                    }
                    .dashboard-header {
                        flex-direction: column !important;
                        gap: 16px !important;
                        align-items: flex-start !important;
                    }
                    .dashboard-header h1 {
                        font-size: 24px !important;
                    }
                    .stats-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
                @media (max-width: 480px) {
                    .dashboard-main {
                        padding: 15px 10px 100px 10px !important;
                    }
                }
            `}</style>
            {/* WhatsApp Button */}
            <button
                onClick={() => { window.open(`https://wa.me/13072784862?text=${encodeURIComponent("Hi, I'm interested in Kommentify (from kommentify.com). I have a question about: ")}`, '_blank'); }}
                style={{ position: 'fixed', bottom: '24px', right: '24px', width: '56px', height: '56px', background: '#25D366', borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(37, 211, 102, 0.4)', zIndex: 9999, cursor: 'pointer', transition: 'transform 0.3s ease' }}
                onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                title="Chat with us on WhatsApp"
            >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
            </button>
        </>
    );
}
