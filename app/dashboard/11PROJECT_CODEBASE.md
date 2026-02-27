# Project Codebase: dashboard

## 1. Project Structure

```text
.
    ├── AccountTab.tsx
    ├── ActivityTab.tsx
    ├── AnalyticsTab.tsx
    ├── CommenterTab.tsx
    ├── CommentsTab.tsx
    ├── ExtensionTab.tsx
    ├── HistoryTab.tsx
    ├── ImportTab.tsx
    ├── LeadWarmerTab.tsx
    ├── LimitsTab.tsx
    ├── OverviewTab.tsx
    ├── ReferralsTab.tsx
    ├── TasksTab.tsx
    ├── TrendingPostsTab.tsx
    ├── UsageTab.tsx
    ├── WriterTab.tsx
    ├── WriterTabNew.tsx
├── page.tsx
```

## 2. File Contents

### components\AccountTab.tsx

```
// @ts-nocheck
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

```

---

### components\ActivityTab.tsx

```
// @ts-nocheck
export default function ActivityTab(props: any) {
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

    return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>{miniIcon('M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7z M2 12h20', 'white', 20)} Activity Logs</h2>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: '4px 0 0' }}>Real-time activity from your extension — newest logs appear on top</p>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <select onChange={e => {
                                    const token = localStorage.getItem('authToken');
                                    if (!token) return;
                                    const taskType = e.target.value;
                                    setLiveActivityLoading(true);
                                    fetch(`/api/live-activity?limit=200${taskType ? `&taskType=${taskType}` : ''}`, { headers: { 'Authorization': `Bearer ${token}` } })
                                        .then(r => r.json()).then(d => { if (d.success) setLiveActivityLogs(d.logs || []); })
                                        .finally(() => setLiveActivityLoading(false));
                                }}
                                    style={{ padding: '7px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '11px' }}>
                                    <option value="">All Tasks</option>
                                    <option value="automation">Automation</option>
                                    <option value="import">Import</option>
                                    <option value="networking">Networking</option>
                                    <option value="post_writer">Post Writer</option>
                                    <option value="trending">Trending</option>
                                </select>
                                <button onClick={() => loadLiveActivity()} disabled={liveActivityLoading}
                                    style={{ padding: '7px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                                    {liveActivityLoading ? 'Loading...' : 'Refresh'}
                                </button>
                                <button onClick={async () => {
                                    const token = localStorage.getItem('authToken');
                                    if (!token) return;
                                    if (!confirm('Clear all activity logs?')) return;
                                    try {
                                        await fetch('/api/live-activity', { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                                        setLiveActivityLogs([]);
                                    } catch { }
                                }}
                                    style={{ padding: '7px 14px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#f87171', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                                    Clear
                                </button>
                            </div>
                        </div>

                        {/* Stats summary */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
                            {(() => {
                                const counts: Record<string, number> = {};
                                liveActivityLogs.forEach((l: any) => { counts[l.action] = (counts[l.action] || 0) + 1; });
                                return [
                                    { action: 'start', label: 'Started', icon: 'M5 12l5 5L20 7', color: '#3b82f6' },
                                    { action: 'like', label: 'Likes', icon: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z', color: '#f59e0b' },
                                    { action: 'comment', label: 'Comments', icon: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z', color: '#10b981' },
                                    { action: 'connect', label: 'Connects', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75', color: '#8b5cf6' },
                                    { action: 'delay', label: 'Delays', icon: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2', color: '#6b7280' },
                                    { action: 'error', label: 'Errors', icon: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01', color: '#ef4444' },
                                ].map(s => (
                                    <div key={s.action} style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                                        <div style={{ marginBottom: '4px', display: 'flex', justifyContent: 'center' }}>{miniIcon(s.icon, s.color, 14)}</div>
                                        <div style={{ fontSize: '18px', fontWeight: '800', color: s.color }}>{counts[s.action] || 0}</div>
                                        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>{s.label}</div>
                                    </div>
                                ));
                            })()}
                        </div>

                        {/* Log entries — newest first */}
                        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                            <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: '600' }}>
                                    {liveActivityLogs.length} log entries — newest first
                                </span>
                                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>
                                    {liveActivityLogs.length > 0 ? `Latest: ${new Date(liveActivityLogs[0]?.createdAt).toLocaleString()}` : ''}
                                </span>
                            </div>
                            <div style={{ maxHeight: '600px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '11px', lineHeight: '1.7' }}>
                                {liveActivityLoading ? (
                                    <div style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '40px', fontSize: '13px' }}>Loading logs...</div>
                                ) : liveActivityLogs.length === 0 ? (
                                    <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '60px 20px' }}>
                                        <div style={{ marginBottom: '12px' }}>{miniIcon('M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7z M2 12h20', 'rgba(255,255,255,0.3)', 40)}</div>
                                        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>No activity logs yet</div>
                                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>When the extension performs actions (commenting, liking, connecting, etc.), logs will appear here in real-time.</div>
                                    </div>
                                ) : (
                                    liveActivityLogs.map((log: any, idx: number) => {
                                        const icons: any = {
                                            like: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
                                            comment: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z',
                                            share: 'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8 M16 6l-4-4-4 4 M12 2v13',
                                            follow: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 11l-3-3m0 0l-3 3m3-3v6',
                                            connect: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
                                            post: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
                                            delay: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2',
                                            start: 'M5 12l5 5L20 7',
                                            stop: 'M18 6L6 18 M6 6l12 12',
                                            error: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01',
                                            info: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 16v-4 M12 8h.01'
                                        };
                                        const levelColors: any = { success: '#34d399', warning: '#fbbf24', error: '#f87171', info: 'rgba(255,255,255,0.6)' };
                                        const taskColors: any = { automation: '#3b82f6', import: '#8b5cf6', networking: '#f59e0b', post_writer: '#10b981', trending: '#ec4899' };
                                        const iconPath = icons[log.action] || icons.info;
                                        const color = levelColors[log.level] || levelColors.info;
                                        const taskColor = taskColors[log.taskType] || 'rgba(255,255,255,0.4)';
                                        const dt = new Date(log.createdAt);
                                        const time = dt.toLocaleTimeString();
                                        const isToday = new Date().toDateString() === dt.toDateString();
                                        const dateStr = isToday ? 'Today' : dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                                        const isNew = idx === 0;
                                        return (
                                            <div key={log.id} style={{ display: 'flex', gap: '8px', padding: '6px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: isNew ? 'rgba(139,92,246,0.06)' : idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)', alignItems: 'flex-start' }}>
                                                <span style={{ color: 'rgba(255,255,255,0.2)', minWidth: '38px', fontSize: '9px', paddingTop: '2px' }}>{dateStr}</span>
                                                <span style={{ color: 'rgba(255,255,255,0.3)', minWidth: '55px', fontSize: '10px' }}>{time}</span>
                                                <span style={{ minWidth: '18px', display: 'flex', alignItems: 'center' }}>{miniIcon(iconPath, color, 12)}</span>
                                                <span style={{ color: taskColor, fontSize: '9px', minWidth: '65px', fontWeight: '600', textTransform: 'uppercase', paddingTop: '2px' }}>{log.taskType}</span>
                                                <span style={{ color, flex: 1, wordBreak: 'break-word' }}>{log.message}</span>
                                                {isNew && <span style={{ background: 'rgba(139,92,246,0.3)', color: '#a78bfa', fontSize: '8px', padding: '1px 5px', borderRadius: '3px', fontWeight: '700', flexShrink: 0 }}>NEW</span>}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

    );
}
```

---

### components\AnalyticsTab.tsx

```
// @ts-nocheck
export default function AnalyticsTab(props: any) {
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

    return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Engagement Analytics Card */}
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <h3 style={{ color: '#a78bfa', fontSize: '16px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>{miniIcon('M18 20V10 M12 20V4 M6 20v-6', '#a78bfa', 16)} Engagement Analytics</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <select value={analyticsPeriod} onChange={e => { const newPeriod = e.target.value; setAnalyticsPeriod(newPeriod); loadAnalytics(newPeriod); }}
                                        style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '13px' }}>
                                        <option value="today">Today</option>
                                        <option value="yesterday">Yesterday</option>
                                        <option value="3days">Last 3 Days</option>
                                        <option value="7days">Last 7 Days</option>
                                        <option value="30days">Last 30 Days</option>
                                        <option value="90days">Last 90 Days</option>
                                    </select>
                                    <button onClick={() => loadAnalytics()} style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center' }}>{miniIcon('M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0 0 20.49 15', 'white', 13)}</button>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                                {[
                                    { label: 'Total', value: analyticsData.engagements?.total || 0, color: '#693fe9', bg: 'linear-gradient(135deg, #693fe9 0%, #7c4dff 100%)' },
                                    { label: 'Comments', value: analyticsData.engagements?.comments || 0, color: '#4CAF50', bg: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)' },
                                    { label: 'Likes', value: analyticsData.engagements?.likes || 0, color: '#2196F3', bg: 'linear-gradient(135deg, #2196F3 0%, #42A5F5 100%)' },
                                    { label: 'Shares', value: analyticsData.engagements?.shares || 0, color: '#FF9800', bg: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)' },
                                    { label: 'Follows', value: analyticsData.engagements?.follows || 0, color: '#E91E63', bg: 'linear-gradient(135deg, #E91E63 0%, #F06292 100%)' },
                                ].map(s => (
                                    <div key={s.label} style={{ padding: '16px', textAlign: 'center', background: s.bg, borderRadius: '12px', boxShadow: `0 2px 10px ${s.color}40` }}>
                                        <div style={{ fontSize: '24px', color: 'white', fontWeight: '700' }}>{s.value}</div>
                                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.9)' }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Leads Database */}
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <h3 style={{ color: 'white', fontSize: '14px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>{miniIcon('M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M8.5 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M20 8v6 M23 11h-6', 'white', 14)} Leads Database</h3>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <button onClick={() => loadAnalytics()} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', cursor: 'pointer', fontSize: '11px' }}>Refresh</button>
                                    <button style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', cursor: 'pointer', fontSize: '11px' }}>Export</button>
                                </div>
                            </div>
                            <input type="text" value={analyticsLeadsSearch} onChange={e => setAnalyticsLeadsSearch(e.target.value)} placeholder="Search leads..."
                                style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '13px', marginBottom: '12px' }} />
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                                <span>Total: <strong style={{ color: 'white' }}>{analyticsData.leads?.length || 0}</strong></span>
                                <span>Email: <strong style={{ color: 'white' }}>{analyticsData.leads?.filter((l: any) => l.email).length || 0}</strong></span>
                                <span>Phone: <strong style={{ color: 'white' }}>{analyticsData.leads?.filter((l: any) => l.phone).length || 0}</strong></span>
                                <span>Connected: <strong style={{ color: 'white' }}>{analyticsData.leads?.filter((l: any) => l.connected).length || 0}</strong></span>
                            </div>
                            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                                    <thead style={{ background: 'linear-gradient(135deg, #693fe9 0%, #7c4dff 100%)', position: 'sticky', top: 0 }}>
                                        <tr>
                                            {['Name', 'Headline', 'Location', 'Query', 'Date', 'Actions'].map(h => (
                                                <th key={h} style={{ padding: '10px', textAlign: 'left', color: 'white', fontWeight: '600' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(!analyticsData.leads || analyticsData.leads.length === 0) ? (
                                            <tr><td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>No leads found. Start a People Search to collect leads.</td></tr>
                                        ) : analyticsData.leads.filter((l: any) => !analyticsLeadsSearch || l.name?.toLowerCase().includes(analyticsLeadsSearch.toLowerCase())).map((lead: any, i: number) => (
                                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                                <td style={{ padding: '10px', color: 'white', fontWeight: '600' }}>{lead.name || '-'}</td>
                                                <td style={{ padding: '10px', color: 'rgba(255,255,255,0.7)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.headline || '-'}</td>
                                                <td style={{ padding: '10px', color: 'rgba(255,255,255,0.6)' }}>{lead.location || '-'}</td>
                                                <td style={{ padding: '10px', color: 'rgba(255,255,255,0.6)' }}>{lead.query || '-'}</td>
                                                <td style={{ padding: '10px', color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>{lead.date ? new Date(lead.date).toLocaleDateString() : '-'}</td>
                                                <td style={{ padding: '10px' }}>{lead.profileUrl && <a href={lead.profileUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#693fe9', fontSize: '11px' }}>View</a>}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Automation History */}
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <h3 style={{ color: 'white', fontSize: '14px', fontWeight: '700', margin: 0 }}>Automation History</h3>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <select value={analyticsAutoFilter} onChange={e => setAnalyticsAutoFilter(e.target.value)} style={{ padding: '5px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', fontSize: '11px' }}>
                                        <option value="all">All</option>
                                        <option value="success">Success</option>
                                        <option value="failed">Failed</option>
                                    </select>
                                    <button onClick={() => loadAnalytics()} style={{ padding: '5px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', cursor: 'pointer', fontSize: '11px' }}>Refresh</button>
                                    <button style={{ padding: '5px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', cursor: 'pointer', fontSize: '11px' }}>Export</button>
                                </div>
                            </div>
                            <input type="text" value={analyticsAutoSearch} onChange={e => setAnalyticsAutoSearch(e.target.value)} placeholder="Search by keyword, author..."
                                style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '13px', marginBottom: '12px' }} />
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                                <span>Sessions: <strong style={{ color: 'white' }}>{analyticsData.automationHistory?.length || 0}</strong></span>
                                <span>Posts: <strong style={{ color: 'white' }}>{analyticsData.automationHistory?.reduce((sum: number, s: any) => sum + (s.postsProcessed || 0), 0) || 0}</strong></span>
                                <span>Comments: <strong style={{ color: 'white' }}>{analyticsData.automationHistory?.reduce((sum: number, s: any) => sum + (s.commentsGenerated || 0), 0) || 0}</strong></span>
                                <span>Rate: <strong style={{ color: 'white' }}>{analyticsData.automationHistory?.length > 0 ? Math.round((analyticsData.automationHistory.filter((s: any) => s.status === 'success').length / analyticsData.automationHistory.length) * 100) : 0}%</strong></span>
                            </div>
                            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                                    <thead style={{ background: 'linear-gradient(135deg, #693fe9 0%, #7c4dff 100%)', position: 'sticky', top: 0 }}>
                                        <tr>
                                            {['Keywords', 'Author', 'Post Content', 'Generated Comment', 'Actions', 'Status', 'Date'].map(h => (
                                                <th key={h} style={{ padding: '10px', textAlign: 'left', color: 'white', fontWeight: '600' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(!analyticsData.automationHistory || analyticsData.automationHistory.length === 0) ? (
                                            <tr><td colSpan={7} style={{ padding: '30px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>No automation history found. Start Bulk Processing to see post details here.</td></tr>
                                        ) : analyticsData.automationHistory.filter((r: any) => analyticsAutoFilter === 'all' || r.status === analyticsAutoFilter).filter((r: any) => !analyticsAutoSearch || r.keywords?.toLowerCase().includes(analyticsAutoSearch.toLowerCase()) || r.authorName?.toLowerCase().includes(analyticsAutoSearch.toLowerCase())).slice(0, 100).map((record: any, i: number) => (
                                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                                <td style={{ padding: '8px', color: 'rgba(255,255,255,0.7)' }}>{(record.keywords || '-').substring(0, 30)}</td>
                                                <td style={{ padding: '8px', color: 'white', fontWeight: '600' }}>{(record.authorName || '-').substring(0, 20)}</td>
                                                <td style={{ padding: '8px', color: 'rgba(255,255,255,0.6)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={record.postContent}>{(record.postContent || '-').substring(0, 50)}</td>
                                                <td style={{ padding: '8px', color: '#a78bfa', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={record.generatedComment}>{(record.generatedComment || '-').substring(0, 50)}</td>
                                                <td style={{ padding: '8px', textAlign: 'center' }}>{record.actions?.liked && 'L'}{record.actions?.commented && 'C'}{record.postUrl && <a href={record.postUrl} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '4px', background: '#693fe9', color: 'white', padding: '2px 6px', borderRadius: '3px', fontSize: '10px', textDecoration: 'none' }}>View</a>}</td>
                                                <td style={{ padding: '8px', textAlign: 'center' }}>{record.status === 'success' ? 'OK' : record.status === 'failed' ? 'X' : '...'}</td>
                                                <td style={{ padding: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>{record.timestamp ? new Date(record.timestamp).toLocaleString() : '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Networking History */}
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <h3 style={{ color: 'white', fontSize: '14px', fontWeight: '700', margin: 0 }}>Networking History</h3>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <select value={analyticsNetworkFilter} onChange={e => setAnalyticsNetworkFilter(e.target.value)} style={{ padding: '5px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', fontSize: '11px' }}>
                                        <option value="all">All</option>
                                        <option value="completed">Done</option>
                                        <option value="stopped">Stopped</option>
                                        <option value="failed">Failed</option>
                                    </select>
                                    <button onClick={() => loadAnalytics()} style={{ padding: '5px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', cursor: 'pointer', fontSize: '11px' }}>Refresh</button>
                                    <button style={{ padding: '5px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', cursor: 'pointer', fontSize: '11px' }}>Export</button>
                                </div>
                            </div>
                            <input type="text" value={analyticsNetworkSearch} onChange={e => setAnalyticsNetworkSearch(e.target.value)} placeholder="Search by query..."
                                style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '13px', marginBottom: '12px' }} />
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                                <span>Sessions: <strong style={{ color: 'white' }}>{analyticsData.networkingHistory?.length || 0}</strong></span>
                                <span>Sent: <strong style={{ color: 'white' }}>{analyticsData.networkingHistory?.reduce((sum: number, s: any) => sum + (s.successful || 0), 0) || 0}</strong></span>
                                <span>Found: <strong style={{ color: 'white' }}>{analyticsData.networkingHistory?.reduce((sum: number, s: any) => sum + (s.processed || 0), 0) || 0}</strong></span>
                                <span>Rate: <strong style={{ color: 'white' }}>{analyticsData.networkingHistory?.length > 0 ? Math.round((analyticsData.networkingHistory.filter((s: any) => s.status === 'completed').length / analyticsData.networkingHistory.length) * 100) : 0}%</strong></span>
                            </div>
                            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                                    <thead style={{ background: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)', position: 'sticky', top: 0 }}>
                                        <tr>
                                            {['Search Query', 'Target', 'Found', 'Sent', 'Success Rate', 'Duration', 'Status', 'Date'].map(h => (
                                                <th key={h} style={{ padding: '10px', textAlign: h === 'Search Query' ? 'left' : 'center', color: 'white', fontWeight: '600' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(!analyticsData.networkingHistory || analyticsData.networkingHistory.length === 0) ? (
                                            <tr><td colSpan={8} style={{ padding: '30px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>No networking history found. Start People Search to see history here.</td></tr>
                                        ) : analyticsData.networkingHistory.filter((s: any) => analyticsNetworkFilter === 'all' || s.status === analyticsNetworkFilter).filter((s: any) => !analyticsNetworkSearch || s.query?.toLowerCase().includes(analyticsNetworkSearch.toLowerCase())).slice(0, 50).map((session: any, i: number) => (
                                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                                <td style={{ padding: '8px', color: 'white' }}>{session.query || session.keywords || '-'}</td>
                                                <td style={{ padding: '8px', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>{session.target || 0}</td>
                                                <td style={{ padding: '8px', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>{session.processed || 0}</td>
                                                <td style={{ padding: '8px', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>{session.successful || 0}</td>
                                                <td style={{ padding: '8px', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>{session.processed > 0 ? Math.round((session.successful / session.processed) * 100) : 0}%</td>
                                                <td style={{ padding: '8px', textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>{session.duration ? (session.duration > 60000 ? `${Math.floor(session.duration / 60000)}m ${Math.floor((session.duration % 60000) / 1000)}s` : `${Math.floor(session.duration / 1000)}s`) : '< 1s'}</td>
                                                <td style={{ padding: '8px', textAlign: 'center' }}>{session.status === 'completed' ? 'OK' : session.status === 'stopped' ? '--' : session.status === 'failed' ? 'X' : '...'} <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>{session.status}</span></td>
                                                <td style={{ padding: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>{session.startTime ? new Date(session.startTime).toLocaleString() : '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Import History */}
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <h3 style={{ color: 'white', fontSize: '14px', fontWeight: '700', margin: 0 }}>Import Profile History</h3>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <button onClick={() => loadAnalytics()} style={{ padding: '5px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', cursor: 'pointer', fontSize: '11px' }}>Refresh</button>
                                    <button style={{ padding: '5px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', cursor: 'pointer', fontSize: '11px' }}>Export</button>
                                </div>
                            </div>
                            <input type="text" value={analyticsImportSearch} onChange={e => setAnalyticsImportSearch(e.target.value)} placeholder="Search profiles..."
                                style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '13px', marginBottom: '12px' }} />
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                                <span>Profiles: <strong style={{ color: 'white' }}>{analyticsData.importHistory?.length || 0}</strong></span>
                                <span>Connects: <strong style={{ color: 'white' }}>{analyticsData.importHistory?.reduce((sum: number, r: any) => sum + (r.connectionsSent || 0), 0) || 0}</strong></span>
                                <span>Posts: <strong style={{ color: 'white' }}>{analyticsData.importHistory?.reduce((sum: number, r: any) => sum + (r.likes || 0) + (r.comments || 0), 0) || 0}</strong></span>
                                <span>Comments: <strong style={{ color: 'white' }}>{analyticsData.importHistory?.reduce((sum: number, r: any) => sum + (r.comments || 0), 0) || 0}</strong></span>
                                <span>Rate: <strong style={{ color: 'white' }}>{analyticsData.importHistory?.length > 0 ? Math.round((analyticsData.importHistory.filter((r: any) => r.status === 'completed' || r.status === 'Success').length / analyticsData.importHistory.length) * 100) : 0}%</strong></span>
                            </div>
                            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                                    <thead style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', position: 'sticky', top: 0 }}>
                                        <tr>
                                            {['Date', 'Profile', 'Link', 'Connect', 'Likes', 'Comments', 'Status'].map(h => (
                                                <th key={h} style={{ padding: '10px', textAlign: h === 'Profile' || h === 'Date' ? 'left' : 'center', color: 'white', fontWeight: '600' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(!analyticsData.importHistory || analyticsData.importHistory.length === 0) ? (
                                            <tr><td colSpan={7} style={{ padding: '30px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>No actions yet. Launch Import to see history here.</td></tr>
                                        ) : analyticsData.importHistory.filter((r: any) => !analyticsImportSearch || r.profileName?.toLowerCase().includes(analyticsImportSearch.toLowerCase())).map((record: any, i: number) => (
                                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                                                <td style={{ padding: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>{record.date || (record.timestamp ? new Date(record.timestamp).toLocaleDateString() : '-')}</td>
                                                <td style={{ padding: '8px', color: 'white', fontWeight: '600' }}>{record.profileName || 'Unknown'}</td>
                                                <td style={{ padding: '8px', textAlign: 'center' }}>{record.profileUrl ? <a href={record.profileUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#0a66c2', textDecoration: 'none' }}>Link</a> : '-'}</td>
                                                <td style={{ padding: '8px', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>{record.connectionsSent || 0}</td>
                                                <td style={{ padding: '8px', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>{record.likes || 0}</td>
                                                <td style={{ padding: '8px', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>{record.comments || 0}</td>
                                                <td style={{ padding: '8px', textAlign: 'center' }}>
                                                    <span style={{ background: record.status === 'completed' || record.status === 'Success' ? '#28a745' : record.status === 'failed' ? '#dc3545' : '#6c757d', color: 'white', padding: '2px 6px', borderRadius: '3px', fontSize: '9px' }}>
                                                        {record.status === 'completed' || record.status === 'Success' ? '✓' : record.status === 'failed' ? '✗' : record.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

    );
}
```

---

### components\CommenterTab.tsx

```
// @ts-nocheck
import { useState, useEffect } from 'react';

export default function CommenterTab(props: any) {
    const {
        t, user, usage, router, miniIcon, showToast, setActiveTab, isFreePlan, showUpgradeModal, setShowUpgradeModal, dashLang, isDeveloper,
        commenterCfg, commenterCfgLoading, commenterCfgSaving, loadCommenterCfg, saveCommenterCfg, setCommenterCfg,
        csGoal, setCsGoal, csTone, setCsTone, csLength, setCsLength, csStyle, setCsStyle,
        csModel, setCsModel, csExpertise, setCsExpertise, csBackground, setCsBackground,
        csAutoPost, setCsAutoPost, csSettingsLoading, csSettingsSaving, saveCommentSettings,
    } = props;

    const [capturedPosts, setCapturedPosts] = useState<any[]>([]);
    const [capturedLoading, setCapturedLoading] = useState(false);
    const [capturedPage, setCapturedPage] = useState(1);
    const [actionStates, setActionStates] = useState<Record<string, any>>({});

    useEffect(() => {
        loadCapturedPosts();
    }, [capturedPage]);

    const loadCapturedPosts = async () => {
        setCapturedLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`/api/scraped-posts?page=${capturedPage}&limit=20`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setCapturedPosts(data.posts || []);
            }
        } catch (e) {
            console.error('Failed to load captured posts:', e);
        } finally {
            setCapturedLoading(false);
        }
    };

    const handleAction = async (postId: string, action: string, post: any, commentText?: string) => {
        const token = localStorage.getItem('authToken');
        setActionStates(prev => ({ ...prev, [`${postId}-${action}`]: 'loading' }));
        
        try {
            const commandMap: Record<string, any> = {
                like: { command: 'linkedin_like_post', data: { activityUrn: post.urn } },
                comment: { command: 'linkedin_comment_on_post', data: { activityUrn: post.urn, commentText } },
                follow: { command: 'linkedin_follow_profile', data: { profileUrl: post.authorUrl } }
            };
            
            const payload = commandMap[action];
            if (!payload) return;
            
            const res = await fetch('/api/extension/command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            
            if (data.success) {
                setActionStates(prev => ({ ...prev, [`${postId}-${action}`]: 'success' }));
                showToast(`${action.charAt(0).toUpperCase() + action.slice(1)} task sent!`, 'success');
                setTimeout(() => loadCapturedPosts(), 2000);
            } else {
                setActionStates(prev => ({ ...prev, [`${postId}-${action}`]: 'error' }));
                showToast(data.error || 'Failed', 'error');
            }
        } catch (e: any) {
            setActionStates(prev => ({ ...prev, [`${postId}-${action}`]: 'error' }));
            showToast('Error: ' + e.message, 'error');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(commenterCfgLoading || csSettingsLoading) ? (
                <div style={{ color: 'rgba(255,255,255,0.5)', padding: '40px', textAlign: 'center' }}>Loading settings...</div>
            ) : commenterCfg && (<>
                {/* Simplified Controls Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: '0 0 8px 0' }}>Filters</h4>
                        {[
                            { key: 'minLikes', label: 'Min Likes', min: 0, max: 9999 },
                            { key: 'minComments', label: 'Min Comments', min: 0, max: 9999 },
                        ].map(f => (
                            <div key={f.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>{f.label}</span>
                                <input type="number" min={f.min} max={f.max} value={commenterCfg[f.key]} onChange={e => setCommenterCfg((p: any) => ({ ...p, [f.key]: parseInt(e.target.value) || 0 }))}
                                    style={{ width: '60px', padding: '5px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', fontSize: '12px', textAlign: 'center' }} />
                            </div>
                        ))}
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: '0 0 8px 0' }}>Search Keywords</h4>
                        <textarea value={commenterCfg.searchKeywords} onChange={e => setCommenterCfg((p: any) => ({ ...p, searchKeywords: e.target.value }))}
                            placeholder="AI marketing&#10;SaaS growth" rows={2}
                            style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '11px', resize: 'vertical' }} />
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: '0 0 8px 0' }}>Count</h4>
                        <input type="number" min={1} max={50} value={commenterCfg.totalPosts || 20} onChange={e => setCommenterCfg((p: any) => ({ ...p, totalPosts: parseInt(e.target.value) || 20 }))}
                            style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', fontSize: '12px', textAlign: 'center' }} />
                    </div>
                </div>

                {/* Quick Capture Buttons */}
                <div style={{ background: 'linear-gradient(135deg, rgba(0,119,181,0.1), rgba(0,160,220,0.05))', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(0,119,181,0.2)' }}>
                    <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {miniIcon('M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71', '#60a5fa', 14)} Quick Capture
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                        <button onClick={async () => {
                            const token = localStorage.getItem('authToken');
                            if (!token) return;
                            showToast('Capturing feed posts...', 'info');
                            try {
                                const res = await fetch('/api/extension/command', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                    body: JSON.stringify({ command: 'linkedin_get_feed_api', data: { count: commenterCfg?.totalPosts || 20, minLikes: commenterCfg?.minLikes || 0, minComments: commenterCfg?.minComments || 0 } })
                                });
                                const data = await res.json();
                                if (data.success) showToast('Feed capture sent!', 'success');
                                else showToast(data.error || 'Failed', 'error');
                            } catch (e: any) { showToast('Error: ' + e.message, 'error'); }
                        }}
                            style={{ padding: '10px 12px', background: 'linear-gradient(135deg, #0077b5, #00a0dc)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>
                            {miniIcon('M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4', 'white', 12)} Capture Feed
                        </button>
                        <button onClick={async () => {
                            const token = localStorage.getItem('authToken');
                            if (!token) return;
                            const kw = commenterCfg?.searchKeywords?.split('\n')?.[0]?.trim() || '';
                            if (!kw) { showToast('Enter search keywords first', 'error'); return; }
                            showToast(`Searching "${kw}"...`, 'info');
                            try {
                                const res = await fetch('/api/extension/command', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                    body: JSON.stringify({ command: 'linkedin_search_posts_api', data: { keyword: kw, count: commenterCfg?.totalPosts || 20, minLikes: commenterCfg?.minLikes || 0, minComments: commenterCfg?.minComments || 0 } })
                                });
                                const data = await res.json();
                                if (data.success) showToast('Search sent!', 'success');
                                else showToast(data.error || 'Failed', 'error');
                            } catch (e: any) { showToast('Error: ' + e.message, 'error'); }
                        }}
                            style={{ padding: '10px 12px', background: 'linear-gradient(135deg, #693fe9, #8b5cf6)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>
                            {miniIcon('M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', 'white', 12)} Search Posts
                        </button>
                        <button onClick={async () => {
                            const token = localStorage.getItem('authToken');
                            if (!token) return;
                            const kw = commenterCfg?.searchKeywords?.split('\n')?.[0]?.trim() || 'trending';
                            showToast(`Fetching trending...`, 'info');
                            try {
                                const res = await fetch('/api/extension/command', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                    body: JSON.stringify({ command: 'linkedin_get_trending_api', data: { keyword: kw, count: 20 } })
                                });
                                const data = await res.json();
                                if (data.success) showToast('Trending sent!', 'success');
                                else showToast(data.error || 'Failed', 'error');
                            } catch (e: any) { showToast('Error: ' + e.message, 'error'); }
                        }}
                            style={{ padding: '10px 12px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>
                            {miniIcon('M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', 'white', 12)} Trending
                        </button>
                    </div>
                </div>

                {/* Save Settings Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={async () => { await saveCommenterCfg(commenterCfg); await saveCommentSettings(); }} disabled={commenterCfgSaving || csSettingsSaving}
                        style={{ padding: '12px 24px', background: (commenterCfgSaving || csSettingsSaving) ? 'rgba(105,63,233,0.4)' : 'linear-gradient(135deg, #693fe9, #8b5cf6)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: (commenterCfgSaving || csSettingsSaving) ? 'wait' : 'pointer' }}>
                        {(commenterCfgSaving || csSettingsSaving) ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>

                {/* Captured Posts Feed */}
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '700', margin: 0 }}>Captured Posts ({capturedPosts.length})</h3>
                        <button onClick={loadCapturedPosts} disabled={capturedLoading}
                            style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #0077b5, #00a0dc)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '12px', cursor: capturedLoading ? 'wait' : 'pointer' }}>
                            {capturedLoading ? 'Loading...' : 'Refresh'}
                        </button>
                    </div>

                    {capturedLoading ? (
                        <div style={{ color: 'rgba(255,255,255,0.5)', padding: '40px', textAlign: 'center' }}>Loading posts...</div>
                    ) : capturedPosts.length === 0 ? (
                        <div style={{ color: 'rgba(255,255,255,0.4)', padding: '40px', textAlign: 'center' }}>
                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
                            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>No posts captured yet</div>
                            <div style={{ fontSize: '12px' }}>Click "Capture Feed", "Search Posts", or "Trending" above to start</div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {capturedPosts.map((post: any, idx: number) => {
                                const postId = post.id || idx;
                                const likeState = actionStates[`${postId}-like`];
                                const commentState = actionStates[`${postId}-comment`];
                                const followState = actionStates[`${postId}-follow`];
                                
                                return (
                                    <div key={postId} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', overflow: 'hidden' }}>
                                        {/* Post Header */}
                                        <div style={{ padding: '12px 16px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #0077b5, #00a0dc)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '18px', flexShrink: 0 }}>
                                                {post.authorName?.charAt(0) || '?'}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ color: 'white', fontSize: '14px', fontWeight: '600', marginBottom: '2px' }}>{post.authorName || 'Unknown Author'}</div>
                                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>
                                                    {new Date(post.createdAt).toLocaleDateString()} · {post.source || 'feed'}
                                                </div>
                                            </div>
                                            {post.postUrl && (
                                                <a href={post.postUrl} target="_blank" rel="noopener noreferrer"
                                                    style={{ padding: '6px 12px', background: 'rgba(0,119,181,0.2)', color: '#60a5fa', border: '1px solid rgba(0,119,181,0.3)', borderRadius: '6px', fontSize: '11px', fontWeight: '600', textDecoration: 'none' }}>
                                                    View on LinkedIn
                                                </a>
                                            )}
                                        </div>

                                        {/* Post Content with Scrollbar */}
                                        <div style={{ padding: '0 16px 12px 16px' }}>
                                            <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', lineHeight: '1.5', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: '200px', overflowY: 'auto' }}>
                                                {post.postContent || '(No content)'}
                                            </div>
                                        </div>

                                        {/* Engagement Stats */}
                                        <div style={{ padding: '8px 16px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '16px', fontSize: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'rgba(255,255,255,0.6)' }}>
                                                <span style={{ color: '#60a5fa' }}>👍</span> {post.likes || 0} likes
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'rgba(255,255,255,0.6)' }}>
                                                <span style={{ color: '#a78bfa' }}>💬</span> {post.comments || 0} comments
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'rgba(255,255,255,0.6)' }}>
                                                <span style={{ color: '#10b981' }}>🔄</span> {post.shares || 0} shares
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div style={{ padding: '8px 16px 12px 16px', display: 'flex', gap: '8px' }}>
                                            <button 
                                                onClick={() => handleAction(postId, 'like', post)}
                                                disabled={likeState === 'loading' || likeState === 'success'}
                                                style={{ flex: 1, padding: '8px', background: likeState === 'success' ? 'rgba(96,165,250,0.4)' : 'rgba(96,165,250,0.15)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: likeState === 'loading' || likeState === 'success' ? 'not-allowed' : 'pointer', opacity: likeState === 'success' ? 0.7 : 1 }}>
                                                {likeState === 'loading' ? '⏳ Liking...' : likeState === 'success' ? '✓ Liked' : '👍 Like'}
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    const comment = prompt('Enter your comment:');
                                                    if (comment) handleAction(postId, 'comment', post, comment);
                                                }}
                                                disabled={commentState === 'loading' || commentState === 'success'}
                                                style={{ flex: 1, padding: '8px', background: commentState === 'success' ? 'rgba(167,139,250,0.4)' : 'rgba(167,139,250,0.15)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: commentState === 'loading' || commentState === 'success' ? 'not-allowed' : 'pointer', opacity: commentState === 'success' ? 0.7 : 1 }}>
                                                {commentState === 'loading' ? '⏳ Commenting...' : commentState === 'success' ? '✓ Commented' : '💬 Comment'}
                                            </button>
                                            {post.authorUrl && (
                                                <button 
                                                    onClick={() => handleAction(postId, 'follow', post)}
                                                    disabled={followState === 'loading' || followState === 'success'}
                                                    style={{ flex: 1, padding: '8px', background: followState === 'success' ? 'rgba(16,185,129,0.4)' : 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: followState === 'loading' || followState === 'success' ? 'not-allowed' : 'pointer', opacity: followState === 'success' ? 0.7 : 1 }}>
                                                    {followState === 'loading' ? '⏳ Following...' : followState === 'success' ? '✓ Followed' : '➕ Follow'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </>)}
        </div>
    );
}

```

---

### components\CommentsTab.tsx

```
// @ts-nocheck
import { useState, useEffect } from 'react';

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

    // Auto Decide state
    const [autoDecideEnabled, setAutoDecideEnabled] = useState(false);
    const [autoDeciding, setAutoDeciding] = useState(false);
    const [autoDecideReasoning, setAutoDecideReasoning] = useState('');

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
    }, [csUseProfileStyle, csUseProfileData, csGoal, csTone, csLength, csStyle, csModel, csExpertise, csBackground, csAutoPost, autoDecideEnabled]);

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

    return (
        <div>
            {/* Comment Settings Section */}
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h3 style={{ color: 'white', fontSize: '15px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {miniIcon('M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', 'white', 15)} Comment Settings
                    </h3>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Controls AI comments — manual button & auto-commenting</span>
                </div>
                {csSettingsLoading ? (
                    <div style={{ textAlign: 'center', padding: '20px 0', color: 'rgba(255,255,255,0.5)' }}>Loading settings...</div>
                ) : (
                    <>
                        {/* Use Profile Style Toggle */}
                        <div style={{ background: csUseProfileStyle ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.04)', padding: '12px 16px', borderRadius: '10px', border: `1px solid ${csUseProfileStyle ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.1)'}`, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
                            onClick={() => { const newVal = !csUseProfileStyle; setCsUseProfileStyle(newVal); setTimeout(() => { const token = localStorage.getItem('authToken'); if (!token) return; fetch('/api/comment-settings', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ useProfileStyle: newVal, goal: csGoal, tone: csTone, commentLength: csLength, commentStyle: csStyle, userExpertise: csExpertise, userBackground: csBackground, aiAutoPost: csAutoPost }) }).then(r => r.json()).then(d => { if (d.success) showToast('Settings auto-saved!', 'success'); }); }, 100); }}>
                            <div style={{ width: '42px', height: '24px', borderRadius: '12px', background: csUseProfileStyle ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'rgba(255,255,255,0.15)', position: 'relative', transition: 'all 0.3s', flexShrink: 0 }}>
                                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: csUseProfileStyle ? '20px' : '2px', transition: 'all 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ color: 'white', fontWeight: '700', fontSize: '13px' }}>
                                    {miniIcon('M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', 'white', 13)} Use Selected Profiles&apos; Comment Style
                                </div>
                                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px' }}>
                                    {csUseProfileStyle
                                        ? 'AI learns ONLY from scraped comments. Settings below disabled.'
                                        : 'Turn ON to mimic commenting style of selected profiles.'}
                                </div>
                            </div>
                        </div>
                        {csUseProfileStyle && (
                            <div style={{ background: 'rgba(59,130,246,0.08)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.2)', marginBottom: '14px' }}>
                                <p style={{ color: '#60a5fa', fontSize: '12px', margin: '0 0 8px 0', lineHeight: '1.4' }}>
                                    <strong>Profile Style Active:</strong> AI analyzes up to 20 comments from selected profiles. Goal, Tone, Length & Style ignored.
                                </p>
                                {commentStyleProfiles.length > 0 ? (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {commentStyleProfiles.filter((p: any) => p.isSelected).length === 0 && (
                                            <span style={{ color: '#fbbf24', fontSize: '11px' }}>⚠️ No profiles selected — select profiles below in "Comment Style Sources"</span>
                                        )}
                                        {commentStyleProfiles.filter((p: any) => p.isSelected).map((p: any) => (
                                            <span key={p.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(59,130,246,0.15)', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(59,130,246,0.3)', fontSize: '10px', color: '#93c5fd' }}>
                                                {miniIcon('M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z', '#60a5fa', 10)} {p.profileName || p.profileId} <span style={{ color: 'rgba(255,255,255,0.4)' }}>({p._count?.comments || p.commentCount || 0})</span>
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ color: '#fbbf24', fontSize: '11px', margin: 0 }}>⚠️ No comment style profiles yet. Add profiles below in "Comment Style Sources" section.</p>
                                )}
                            </div>
                        )}
                        {/* Use Profile Data Toggle */}
                        {linkedInProfile ? (
                            <div style={{ background: csUseProfileData ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)', padding: '12px 16px', borderRadius: '10px', border: `1px solid ${csUseProfileData ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}`, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
                                onClick={() => { const newVal = !csUseProfileData; setCsUseProfileData(newVal); setTimeout(() => { const token = localStorage.getItem('authToken'); if (!token) return; fetch('/api/comment-settings', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ useProfileStyle: csUseProfileStyle, useProfileData: newVal, goal: csGoal, tone: csTone, commentLength: csLength, commentStyle: csStyle, userExpertise: csExpertise, userBackground: csBackground, aiAutoPost: csAutoPost }) }).then(r => r.json()).then(d => { if (d.success) showToast('Settings auto-saved!', 'success'); }); }, 100); }}>
                                <div style={{ width: '42px', height: '24px', borderRadius: '12px', background: csUseProfileData ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.15)', position: 'relative', transition: 'all 0.3s', flexShrink: 0 }}>
                                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: csUseProfileData ? '20px' : '2px', transition: 'all 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ color: 'white', fontWeight: '700', fontSize: '13px' }}>
                                        {miniIcon('M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', 'white', 13)} Use My Profile Data
                                    </div>
                                    <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px' }}>
                                        {csUseProfileData
                                            ? 'AI uses your LinkedIn profile to personalize comments.'
                                            : 'Turn ON to include your profile headline, about, skills in AI prompts.'}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '42px', height: '24px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', position: 'relative', flexShrink: 0, opacity: 0.5 }}>
                                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: '2px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontWeight: '700', fontSize: '13px' }}>
                                        {miniIcon('M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', 'rgba(255,255,255,0.5)', 13)} Use My Profile Data
                                    </div>
                                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>
                                        No LinkedIn profile scanned yet. Go to the <strong style={{ color: '#a78bfa', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); handleTabChange('writer'); }}>Writer tab</strong> and click "Scan My Profile" first.
                                    </div>
                                </div>
                            </div>
                        )}
                        <div style={{ opacity: csUseProfileStyle ? 0.4 : 1, pointerEvents: csUseProfileStyle ? 'none' : 'auto', transition: 'opacity 0.3s' }}>

                            {/* Goal + Tone side by side */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                                <div>
                                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Comment Goal</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                        {[{ v: 'AddValue', l: 'Add Value', icon: 'M12 5v14 M5 12h14' }, { v: 'ShareExperience', l: 'Experience', icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' }, { v: 'AskQuestion', l: 'Question', icon: 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3 M12 17h.01' }, { v: 'DifferentPerspective', l: 'Perspective', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' }, { v: 'BuildRelationship', l: 'Relationship', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75' }, { v: 'SubtlePitch', l: 'Subtle Pitch', icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 11l-3-3m0 0l-3 3m3-3v6' }].map(o => (
                                            <button key={o.v} onClick={() => setCsGoal(o.v)} style={{ padding: '6px 10px', background: csGoal === o.v ? 'linear-gradient(135deg,rgba(105,63,233,0.4),rgba(139,92,246,0.3))' : 'rgba(255,255,255,0.05)', border: csGoal === o.v ? '1px solid rgba(105,63,233,0.6)' : '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: csGoal === o.v ? 'white' : 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: csGoal === o.v ? '700' : '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                {miniIcon(o.icon, csGoal === o.v ? 'white' : 'rgba(255,255,255,0.6)', 12)}<span>{o.l}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tone of Voice</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                        {[{ v: 'Professional', l: 'Professional', icon: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z M3.27 6.96L12 12.01l8.73-5.05 M12 22.08V12' }, { v: 'Friendly', l: 'Friendly', icon: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' }, { v: 'ThoughtProvoking', l: 'Thought Provoking', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' }, { v: 'Supportive', l: 'Supportive', icon: 'M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3' }, { v: 'Contrarian', l: 'Contrarian', icon: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01' }, { v: 'Humorous', l: 'Humorous', icon: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M8 14s1.5 2 4 2 4-2 4-2 M9 9h.01 M15 9h.01' }].map(o => (
                                            <button key={o.v} onClick={() => setCsTone(o.v)} style={{ padding: '6px 10px', background: csTone === o.v ? 'linear-gradient(135deg,rgba(59,130,246,0.4),rgba(37,99,235,0.3))' : 'rgba(255,255,255,0.05)', border: csTone === o.v ? '1px solid rgba(59,130,246,0.6)' : '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: csTone === o.v ? 'white' : 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: csTone === o.v ? '700' : '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                {miniIcon(o.icon, csTone === o.v ? 'white' : 'rgba(255,255,255,0.6)', 12)}<span>{o.l}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Length + Style side by side */}
                            <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: '14px', marginBottom: '14px' }}>
                                <div>
                                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Length</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                                        {[{ v: 'Brief', l: 'Brief', d: '≤100' }, { v: 'Short', l: 'Short', d: '≤300' }, { v: 'Mid', l: 'Medium', d: '≤600' }, { v: 'Long', l: 'Long', d: '≤900' }].map(o => (
                                            <button key={o.v} onClick={() => setCsLength(o.v)} style={{ padding: '7px 6px', background: csLength === o.v ? 'linear-gradient(135deg,rgba(16,185,129,0.3),rgba(5,150,105,0.2))' : 'rgba(255,255,255,0.05)', border: csLength === o.v ? '1px solid rgba(16,185,129,0.5)' : '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: csLength === o.v ? '#34d399' : 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: csLength === o.v ? '700' : '500', cursor: 'pointer', textAlign: 'center' }}>
                                                <div>{o.l}</div><div style={{ fontSize: '9px', opacity: 0.6 }}>{o.d}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Style</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '5px' }}>
                                        {[{ v: 'direct', l: 'Direct', d: 'Single paragraph', icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' }, { v: 'structured', l: 'Structured', d: '2-3 paragraphs', icon: 'M4 7h16 M4 12h16 M4 17h10' }, { v: 'storyteller', l: 'Storyteller', d: 'Personal anecdote', icon: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z' }, { v: 'challenger', l: 'Challenger', d: 'Different view', icon: 'M18 20V10 M12 20V4 M6 20v-6' }, { v: 'supporter', l: 'Supporter', d: 'Validate', icon: 'M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3' }, { v: 'expert', l: 'Expert', d: 'Data refs', icon: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z' }, { v: 'conversational', l: 'Casual', d: 'Colleague-like', icon: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z' }].map(o => (
                                            <button key={o.v} onClick={() => setCsStyle(o.v)} style={{ padding: '7px 8px', background: csStyle === o.v ? 'linear-gradient(135deg,rgba(245,158,11,0.3),rgba(217,119,6,0.2))' : 'rgba(255,255,255,0.05)', border: csStyle === o.v ? '1px solid rgba(245,158,11,0.6)' : '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: csStyle === o.v ? '#fbbf24' : 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: csStyle === o.v ? '700' : '500', cursor: 'pointer', textAlign: 'left' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>{miniIcon(o.icon, csStyle === o.v ? '#fbbf24' : 'rgba(255,255,255,0.6)', 12)}<span>{o.l}</span></div>
                                                <div style={{ fontSize: '9px', opacity: 0.55 }}>{o.d}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* AI Model */}
                            <div style={{ marginBottom: '4px' }}>
                                <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '10px', fontWeight: '700', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AI Model</label>
                                <select value={csModel} onChange={e => handleCommentModelChange(e.target.value)}
                                    style={{ width: '100%', maxWidth: '350px', padding: '8px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '12px', outline: 'none' }}>
                                    {MODEL_OPTIONS.map(m => (
                                        <option key={m.id} value={m.id} style={{ background: '#1a1a3e' }}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        {/* Auto Decide Toggle */}
                        <div style={{ background: autoDecideEnabled ? 'rgba(168,85,247,0.12)' : 'rgba(255,255,255,0.04)', padding: '12px 16px', borderRadius: '10px', border: `1px solid ${autoDecideEnabled ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.1)'}`, marginTop: '14px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
                            onClick={() => setAutoDecideEnabled(!autoDecideEnabled)}>
                            <div style={{ width: '42px', height: '24px', borderRadius: '12px', background: autoDecideEnabled ? 'linear-gradient(135deg, #a855f7, #7c3aed)' : 'rgba(255,255,255,0.15)', position: 'relative', transition: 'all 0.3s', flexShrink: 0 }}>
                                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: autoDecideEnabled ? '20px' : '2px', transition: 'all 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ color: 'white', fontWeight: '700', fontSize: '13px' }}>
                                    {miniIcon('M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', autoDecideEnabled ? '#c4b5fd' : 'white', 13)} Auto Decide for Each Post
                                </div>
                                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px' }}>
                                    {autoDecideEnabled
                                        ? 'AI reads each post + your profile to pick optimal Goal, Tone, Length & Style automatically.'
                                        : 'Turn ON to let AI auto-select the best settings per post.'}
                                </div>
                            </div>
                            {autoDeciding && (
                                <div style={{ color: '#c4b5fd', fontSize: '10px', fontWeight: '600', flexShrink: 0 }}>Deciding...</div>
                            )}
                        </div>
                        {autoDecideEnabled && autoDecideReasoning && (
                            <div style={{ marginTop: '8px', padding: '8px 14px', background: 'rgba(168,85,247,0.08)', borderRadius: '8px', border: '1px solid rgba(168,85,247,0.2)' }}>
                                <div style={{ color: '#c4b5fd', fontSize: '10px', fontWeight: '600', marginBottom: '2px' }}>AI Reasoning</div>
                                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', lineHeight: '1.4' }}>{autoDecideReasoning}</div>
                            </div>
                        )}

                        {/* Expertise, Background, AI Behavior — compact 3-col */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '12px' }}>
                            <div>
                                <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Your Expertise</label>
                                <input value={csExpertise} onChange={e => setCsExpertise(e.target.value)}
                                    placeholder="e.g., SaaS Marketing, AI Dev"
                                    style={{ width: '100%', padding: '8px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '12px', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Background (Optional)</label>
                                <input value={csBackground} onChange={e => setCsBackground(e.target.value)}
                                    placeholder="e.g., Scaled 3 startups"
                                    style={{ width: '100%', padding: '8px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '12px', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>AI Button Behavior</label>
                                <select value={csAutoPost} onChange={e => setCsAutoPost(e.target.value)}
                                    style={{ width: '100%', padding: '8px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '12px', outline: 'none' }}>
                                    <option value="manual" style={{ background: '#1a1a3e' }}>Manual Review</option>
                                    <option value="auto" style={{ background: '#1a1a3e' }}>Auto Post</option>
                                </select>
                            </div>
                        </div>
                    </>
                )}
                <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={saveCommentSettings} disabled={csSettingsSaving}
                        style={{ padding: '10px 24px', background: csSettingsSaving ? 'rgba(105,63,233,0.4)' : 'linear-gradient(135deg, #693fe9 0%, #8b5cf6 100%)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: csSettingsSaving ? 'wait' : 'pointer', boxShadow: '0 4px 15px rgba(105,63,233,0.4)', opacity: csSettingsSaving ? 0.7 : 1 }}>
                        {csSettingsSaving ? 'Saving...' : <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>{miniIcon('M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z M17 21v-8H7v8 M7 3v5h8', 'white', 13)} Save Settings</span>}
                    </button>
                </div>
            </div>

            {/* Comment Style Sources Section — compact */}
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px 18px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h3 style={{ color: 'white', fontSize: '14px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {miniIcon('M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', 'white', 14)} Comment Style Sources
                    </h3>
                    <button onClick={loadCommentStyleProfiles}
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'rgba(255,255,255,0.6)', padding: '4px 10px', fontSize: '10px', cursor: 'pointer', fontWeight: '600' }}>
                        Refresh
                    </button>
                </div>
                {/* Add Profile Input — inline */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', alignItems: 'center' }}>
                    <input value={commentStyleUrl} onChange={e => setCommentStyleUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                        style={{ flex: 1, padding: '7px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '12px', outline: 'none' }} />
                    <button onClick={scrapeCommentStyle} disabled={commentStyleScraping}
                        style={{ padding: '7px 14px', background: commentStyleScraping ? 'rgba(59,130,246,0.3)' : 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '11px', cursor: commentStyleScraping ? 'wait' : 'pointer', whiteSpace: 'nowrap' }}>
                        {commentStyleScraping ? '...' : <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>{miniIcon('M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z', 'white', 11)} Scrape</span>}
                    </button>
                </div>
                {commentStyleStatus && (
                    <div style={{ marginBottom: '10px', padding: '8px 14px', background: commentStyleStatus.includes('Error') || commentStyleStatus.includes('Failed') ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)', border: `1px solid ${commentStyleStatus.includes('Error') ? 'rgba(239,68,68,0.3)' : 'rgba(59,130,246,0.3)'}`, borderRadius: '8px', color: commentStyleStatus.includes('Error') ? '#f87171' : '#60a5fa', fontSize: '12px' }}>
                        {commentStyleStatus}
                    </div>
                )}
                {/* Kommentify Shared Comment Profiles — compact inline */}
                {sharedCommentProfiles.length > 0 && (
                    <div style={{ marginBottom: '12px', padding: '10px 14px', background: 'rgba(245,158,11,0.06)', borderRadius: '10px', border: '1px solid rgba(245,158,11,0.15)' }}>
                        <div style={{ color: '#fbbf24', fontSize: '11px', fontWeight: '700', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>{miniIcon('M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', '#fbbf24', 11)} Kommentify Shared ({sharedCommentProfiles.length})</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {sharedCommentProfiles.map((p: any, i: number) => {
                                const profileMatch = commentStyleProfiles.find((cp: any) => cp.profileId === p.profileId || cp.profileName === (p.profileName || p.profileId));
                                const isSelected = profileMatch?.isSelected || false;
                                return (
                                    <div key={i} onClick={() => { if (profileMatch) toggleProfileSelect(profileMatch.id); }}
                                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: isSelected ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.04)', padding: '5px 10px', borderRadius: '8px', border: isSelected ? '1px solid rgba(245,158,11,0.4)' : '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={isSelected} readOnly style={{ accentColor: '#f59e0b', width: '13px', height: '13px', cursor: 'pointer' }} />
                                        <span style={{ color: isSelected ? '#fbbf24' : 'rgba(255,255,255,0.7)', fontSize: '11px', fontWeight: '600' }}>{p.profileName || p.profileId}</span>
                                        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px' }}>{p.commentCount}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                {/* Saved Profiles — compact */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>{miniIcon('M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', 'white', 13)} Saved Profiles ({commentStyleProfiles.length})</h4>
                </div>
                {commentStyleLoading ? (
                    <div style={{ textAlign: 'center', padding: '16px 0', color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Loading profiles...</div>
                ) : commentStyleProfiles.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '16px 0' }}>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>No comment style profiles yet. Add a LinkedIn profile above.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {commentStyleProfiles.map((profile: any) => (
                            <div key={profile.id}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: profile.isSelected ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.04)', padding: '10px 14px', borderRadius: '10px', border: `1px solid ${profile.isSelected ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.06)'}` }}>
                                    <span style={{ flexShrink: 0 }}>{miniIcon('M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z', profile.isSelected ? '#60a5fa' : 'rgba(255,255,255,0.5)', 16)}</span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ color: 'white', fontWeight: '600', fontSize: '13px' }}>{profile.profileName || profile.profileId}</div>
                                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>{profile._count?.comments || profile.commentCount} comments{profile.lastScrapedAt ? ` · ${new Date(profile.lastScrapedAt).toLocaleDateString()}` : ''}</div>
                                    </div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '10px', color: profile.isSelected ? '#60a5fa' : 'rgba(255,255,255,0.5)', fontWeight: '600' }}>
                                        <input type="checkbox" checked={profile.isSelected} onChange={() => toggleProfileSelect(profile.id)}
                                            style={{ accentColor: '#3b82f6', width: '14px', height: '14px' }} />
                                        Train
                                    </label>
                                    <button onClick={() => { if (commentStyleExpanded === profile.id) { setCommentStyleExpanded(null); setCommentStyleComments([]); } else { setCommentStyleExpanded(profile.id); loadProfileComments(profile.id); } }}
                                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: 'rgba(255,255,255,0.6)', padding: '4px 10px', fontSize: '10px', cursor: 'pointer' }}>
                                        {commentStyleExpanded === profile.id ? '▲' : '▼'}
                                    </button>
                                    <button onClick={() => deleteCommentStyleProfile(profile.id)}
                                        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', color: '#f87171', padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}>
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
                                                                {/* Comment Type Badge */}
                                                                <div style={{ display: 'inline-block', background: comment.context === 'DIRECT COMMENT ON POST' ? 'rgba(16,185,129,0.15)' : 'rgba(139,92,246,0.15)', padding: '4px 10px', borderRadius: '6px', marginBottom: '8px', border: `1px solid ${comment.context === 'DIRECT COMMENT ON POST' ? 'rgba(16,185,129,0.3)' : 'rgba(139,92,246,0.3)'}` }}>
                                                                    <span style={{ color: comment.context === 'DIRECT COMMENT ON POST' ? '#34d399' : '#a78bfa', fontSize: '10px', fontWeight: '700' }}>
                                                                        {comment.context === 'DIRECT COMMENT ON POST' ? 'Direct comment' : 'Reply'}
                                                                    </span>
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
                {/* AI Training Info — compact */}
                {commentStyleProfiles.some((p: any) => p.isSelected) && (
                    <div style={{ background: 'rgba(59,130,246,0.08)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(59,130,246,0.2)', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ flexShrink: 0 }}>{miniIcon('M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 18a6 6 0 100-12 6 6 0 000 12z M12 14a2 2 0 100-4 2 2 0 000 4z', '#60a5fa', 14)}</span>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', margin: 0 }}>
                            <strong style={{ color: '#60a5fa' }}>Training Active:</strong> AI uses {commentStyleProfiles.filter((p: any) => p.isSelected).length} profile(s) with starred comments to match commenting style.
                        </p>
                    </div>
                )}

                {/* Kommentify Shared Profiles */}
                {sharedCommentProfiles.length > 0 && (
                    <div style={{ marginTop: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <h4 style={{ color: 'white', fontSize: '14px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {miniIcon('M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', '#a78bfa', 14)}
                                Kommentify Shared ({sharedCommentProfiles.length})
                            </h4>
                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Curated by Kommentify team</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
                            {sharedCommentProfiles.map((profile: any) => (
                                <div key={profile.id} onClick={() => {
                                    setCommentStyleExpanded(commentStyleExpanded === profile.id ? null : profile.id);
                                    if (commentStyleExpanded !== profile.id) loadProfileComments(profile.id);
                                }}
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(105,63,233,0.1) 0%, rgba(139,92,246,0.05) 100%)',
                                        padding: '14px 12px',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(105,63,233,0.25)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        textAlign: 'center'
                                    }}
                                    onMouseOver={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(105,63,233,0.2) 0%, rgba(139,92,246,0.1) 100%)'; e.currentTarget.style.borderColor = 'rgba(105,63,233,0.4)'; }}
                                    onMouseOut={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(105,63,233,0.1) 0%, rgba(139,92,246,0.05) 100%)'; e.currentTarget.style.borderColor = 'rgba(105,63,233,0.25)'; }}
                                >
                                    <div style={{ color: 'white', fontWeight: '700', fontSize: '13px', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {profile.profileName || profile.profileId}
                                    </div>
                                    <div style={{ color: '#a78bfa', fontSize: '16px', fontWeight: '800', marginBottom: '2px' }}>
                                        {profile._count?.comments || profile.commentCount || 0}
                                    </div>
                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>comments</div>
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
                                                <div style={{ display: 'inline-block', background: comment.context === 'DIRECT COMMENT ON POST' ? 'rgba(16,185,129,0.15)' : 'rgba(139,92,246,0.15)', padding: '4px 10px', borderRadius: '6px', marginBottom: '8px', border: `1px solid ${comment.context === 'DIRECT COMMENT ON POST' ? 'rgba(16,185,129,0.3)' : 'rgba(139,92,246,0.3)'}` }}>
                                                    <span style={{ color: comment.context === 'DIRECT COMMENT ON POST' ? '#34d399' : '#a78bfa', fontSize: '10px', fontWeight: '700' }}>
                                                        {comment.context === 'DIRECT COMMENT ON POST' ? 'Direct comment' : 'Reply'}
                                                    </span>
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
```

---

### components\ExtensionTab.tsx

```
// @ts-nocheck
export default function ExtensionTab(props: any) {
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

    return (
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(5,150,105,0.1) 100%)',
                        padding: '40px',
                        borderRadius: '20px',
                        border: '1px solid rgba(16,185,129,0.3)',
                        textAlign: 'center'
                    }}>
                        <div style={{ marginBottom: '24px' }}>{miniIcon('M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-2 .9-2 2v3.8h1.5c1.38 0 2.5 1.12 2.5 2.5S4.88 15.8 3.5 15.8H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z', '#10b981', 64)}</div>
                        <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'white', marginBottom: '12px' }}>Kommentify Chrome Extension</h2>
                        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>Install our Chrome extension to automate your LinkedIn engagement and grow your network faster.</p>
                        <a href="https://chromewebstore.google.com/detail/kommentify-linkedin-auto/laeckkpjacbodjglcnenggpdpehkacei" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '16px 40px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', borderRadius: '14px', textDecoration: 'none', fontWeight: '700', fontSize: '16px', boxShadow: '0 4px 20px rgba(16,185,129,0.4)' }}>Add to Chrome - Free</a>
                        <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', textAlign: 'left' }}>
                            {['Click "Add to Chrome"', 'Confirm installation', 'Pin to toolbar', 'Start automating!'].map((step, i) => (
                                <div key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px' }}>
                                    <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', marginBottom: '12px' }}>{i + 1}</div>
                                    <div style={{ color: 'white', fontSize: '14px' }}>{step}</div>
                                </div>
                            ))}
                        </div>
                    </div>

    );
}
```

---

### components\HistoryTab.tsx

```
// @ts-nocheck
export default function HistoryTab(props: any) {
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

    return (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>{miniIcon('M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', 'white', 18)} History</h3>
                            <button onClick={() => loadHistory(1)}
                                style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                                Refresh
                            </button>
                        </div>
                        {/* Filter Buttons */}
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                            {[{ id: 'all', label: 'All', color: '#8b5cf6' }, { id: 'ai_generated', label: 'AI Generated', color: '#a78bfa' }, { id: 'viral_analysis', label: 'Analysis', color: '#fbbf24' }, { id: 'published_post', label: 'Published', color: '#10b981' }].map(f => (
                                <button key={f.id} onClick={() => { setHistoryFilter(f.id); loadHistory(1, f.id); }}
                                    style={{ padding: '10px 20px', background: historyFilter === f.id ? `${f.color}33` : 'rgba(255,255,255,0.08)', border: `1px solid ${historyFilter === f.id ? f.color + '66' : 'rgba(255,255,255,0.15)'}`, borderRadius: '12px', color: historyFilter === f.id ? f.color : 'rgba(255,255,255,0.7)', fontWeight: historyFilter === f.id ? '700' : '500', cursor: 'pointer', fontSize: '14px' }}>
                                    {f.label}
                                </button>
                            ))}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '16px' }}>
                            Total: <strong style={{ color: 'white' }}>{historyTotal}</strong> entries
                        </div>
                        {/* History Items */}
                        {historyLoading ? (
                            <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.5)' }}>Loading history...</div>
                        ) : historyItems.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 0' }}>
                                <div style={{ marginBottom: '16px' }}>{miniIcon('M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', 'rgba(255,255,255,0.5)', 48)}</div>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px' }}>No history yet. Generate posts, run analysis, or publish to LinkedIn to build your history.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {historyItems.map((item: any) => {
                                    const typeConfig: Record<string, { icon: string; color: string; bg: string; label: string }> = {
                                        ai_generated: { icon: 'AI', color: '#a78bfa', bg: 'rgba(105,63,233,0.15)', label: 'AI Generated Posts' },
                                        viral_analysis: { icon: 'AN', color: '#fbbf24', bg: 'rgba(245,158,11,0.15)', label: 'Viral Analysis' },
                                        published_post: { icon: 'PB', color: '#10b981', bg: 'rgba(16,185,129,0.15)', label: 'Published Post' },
                                    };
                                    const tc = typeConfig[item.type] || { icon: '--', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)', label: item.type };
                                    let parsedContent: any = null;
                                    try { parsedContent = JSON.parse(item.content); } catch { parsedContent = item.content; }
                                    let parsedMeta: any = null;
                                    try { if (item.metadata) parsedMeta = JSON.parse(item.metadata); } catch { }

                                    return (
                                        <div key={item.id} style={{ background: tc.bg, padding: '20px', borderRadius: '16px', border: `1px solid ${tc.color}33` }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                                        <span style={{ fontSize: '18px' }}>{tc.icon}</span>
                                                        <span style={{ color: tc.color, fontWeight: '700', fontSize: '15px' }}>{item.title || tc.label}</span>
                                                        <span style={{ padding: '2px 10px', background: `${tc.color}22`, borderRadius: '10px', fontSize: '11px', color: tc.color, fontWeight: '600', border: `1px solid ${tc.color}33` }}>{tc.label}</span>
                                                    </div>
                                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
                                                        {new Date(item.createdAt).toLocaleString()}
                                                        {parsedMeta?.selectedCount && <span> · {parsedMeta.selectedCount} posts selected</span>}
                                                        {parsedMeta?.postCount && <span> · {parsedMeta.postCount} posts analyzed</span>}
                                                    </div>
                                                </div>
                                                <button onClick={() => deleteHistoryItem(item.id)}
                                                    style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#f87171', padding: '4px 10px', fontSize: '11px', cursor: 'pointer' }}>
                                                    ×
                                                </button>
                                            </div>
                                            {/* Content display based on type */}
                                            {item.type === 'ai_generated' && Array.isArray(parsedContent) && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                    {parsedContent.map((post: any, pi: number) => (
                                                        <div key={pi} style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '10px' }}>
                                                            <div style={{ color: '#a78bfa', fontWeight: '600', fontSize: '13px', marginBottom: '6px' }}>{post.title || `Post ${pi + 1}`}</div>
                                                            <div style={{ maxHeight: '100px', overflowY: 'auto', paddingRight: '4px' }}>
                                                                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', lineHeight: '1.5', margin: 0, whiteSpace: 'pre-wrap' }}>{post.content}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {item.type === 'viral_analysis' && Array.isArray(parsedContent) && (
                                                <div style={{ overflowX: 'auto' }}>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                                                        <thead>
                                                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                                                <th style={{ padding: '8px', textAlign: 'left', color: 'rgba(255,255,255,0.5)' }}>Rank</th>
                                                                <th style={{ padding: '8px', textAlign: 'left', color: 'rgba(255,255,255,0.5)' }}>Score</th>
                                                                <th style={{ padding: '8px', textAlign: 'left', color: 'rgba(255,255,255,0.5)' }}>Feedback</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {parsedContent.map((r: any, ri: number) => (
                                                                <tr key={ri} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                                    <td style={{ padding: '8px', color: 'white', fontWeight: '700' }}>#{ri + 1}</td>
                                                                    <td style={{ padding: '8px' }}>
                                                                        <span style={{ padding: '2px 8px', borderRadius: '10px', fontWeight: '600', background: r.score >= 80 ? 'rgba(16,185,129,0.2)' : r.score >= 60 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)', color: r.score >= 80 ? '#34d399' : r.score >= 60 ? '#fbbf24' : '#f87171' }}>{r.score}/100</span>
                                                                    </td>
                                                                    <td style={{ padding: '8px', color: 'rgba(255,255,255,0.6)', maxWidth: '300px' }}>{r.feedback}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                            {item.type === 'published_post' && parsedContent && (
                                                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '10px' }}>
                                                    <div style={{ maxHeight: '100px', overflowY: 'auto', paddingRight: '4px' }}>
                                                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', lineHeight: '1.5', margin: 0, whiteSpace: 'pre-wrap' }}>{parsedContent.content || (typeof parsedContent === 'string' ? parsedContent : '')}</p>
                                                    </div>
                                                    {parsedContent.hasImage && <span style={{ color: '#a78bfa', fontSize: '11px', marginTop: '6px', display: 'inline-block' }}>Image attached</span>}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                {/* Pagination */}
                                {historyTotal > 20 && (
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', paddingTop: '20px' }}>
                                        <button onClick={() => loadHistory(historyPage - 1)} disabled={historyPage <= 1}
                                            style={{ padding: '10px 20px', background: historyPage <= 1 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: historyPage <= 1 ? 'rgba(255,255,255,0.3)' : 'white', cursor: historyPage <= 1 ? 'not-allowed' : 'pointer', fontSize: '14px' }}>
                                            ← Previous
                                        </button>
                                        <span style={{ color: 'rgba(255,255,255,0.6)', alignSelf: 'center', fontSize: '14px' }}>Page {historyPage} of {Math.ceil(historyTotal / 20)}</span>
                                        <button onClick={() => loadHistory(historyPage + 1)} disabled={historyPage >= Math.ceil(historyTotal / 20)}
                                            style={{ padding: '10px 20px', background: historyPage >= Math.ceil(historyTotal / 20) ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: historyPage >= Math.ceil(historyTotal / 20) ? 'rgba(255,255,255,0.3)' : 'white', cursor: historyPage >= Math.ceil(historyTotal / 20) ? 'not-allowed' : 'pointer', fontSize: '14px' }}>
                                            Next →
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>


    );
}
```

---

### components\ImportTab.tsx

```
// @ts-nocheck
import { useState, useEffect, useRef } from 'react';

const STATUS_COLORS = {
  pending_fetch: { bg: 'rgba(148,163,184,0.15)', border: 'rgba(148,163,184,0.3)', text: '#94a3b8', label: 'Pending' },
  fetched: { bg: 'rgba(96,165,250,0.15)', border: 'rgba(96,165,250,0.3)', text: '#60a5fa', label: 'Fetched' },
  engaged: { bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.3)', text: '#fbbf24', label: 'Engaged' },
  connected: { bg: 'rgba(52,211,153,0.15)', border: 'rgba(52,211,153,0.3)', text: '#34d399', label: 'Connected' },
};

const ACTION_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  follow: { label: 'Follow', icon: '👤', color: '#60a5fa' },
  like: { label: 'Like Post', icon: '👍', color: '#34d399' },
  comment: { label: 'Comment', icon: '💬', color: '#a78bfa' },
  connect: { label: 'Connect', icon: '🤝', color: '#10b981' },
};

const DEFAULT_SEQUENCE = [
  { day: 1, action: 'follow', enabled: true },
  { day: 3, action: 'like', enabled: true },
  { day: 5, action: 'comment', enabled: true },
  { day: 7, action: 'like', enabled: true },
  { day: 10, action: 'connect', enabled: false },
];

export default function ImportTab(props: any) {
    const { t, user, miniIcon, showToast, extensionConnected } = props;

    const [leads, setLeads] = useState<any[]>([]);
    const [leadsLoading, setLeadsLoading] = useState(true);
    const [settings, setSettings] = useState<any>(null);
    const [settingsSaving, setSettingsSaving] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);
    const [fetchingPosts, setFetchingPosts] = useState(false);
    const [fetchProgress, setFetchProgress] = useState('');
    const [engagingPost, setEngagingPost] = useState<string | null>(null);
    const [showSettings, setShowSettings] = useState(false);

    const [importText, setImportText] = useState('');
    const csvFileRef = useRef<HTMLInputElement>(null);

    const [campaignName, setCampaignName] = useState('My Warm Leads');
    const [businessContext, setBusinessContext] = useState('');
    const [campaignGoal, setCampaignGoal] = useState('relationship');
    const [profilesPerDay, setProfilesPerDay] = useState(20);
    const [sequenceSteps, setSequenceSteps] = useState(DEFAULT_SEQUENCE);
    const [autopilotEnabled, setAutopilotEnabled] = useState(false);

    const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

    const apiGet = async (url: string) => {
        const res = await fetch(url, { headers: { Authorization: `Bearer ${authToken}` } });
        return res.json();
    };
    const apiPost = async (url: string, body: any) => {
        const res = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        return res.json();
    };
    const apiDelete = async (url: string) => {
        const res = await fetch(url, { method: 'DELETE', headers: { Authorization: `Bearer ${authToken}` } });
        return res.json();
    };

    const loadLeads = async () => {
        setLeadsLoading(true);
        try {
            const data = await apiGet('/api/warm-leads');
            if (data.success) {
                setLeads(data.leads || []);
                if (data.settings) {
                    setSettings(data.settings);
                    setCampaignName(data.settings.campaignName || 'My Warm Leads');
                    setBusinessContext(data.settings.businessContext || '');
                    setCampaignGoal(data.settings.campaignGoal || 'relationship');
                    setProfilesPerDay(data.settings.profilesPerDay || 20);
                    setAutopilotEnabled(data.settings.autopilotEnabled || false);
                    try { setSequenceSteps(JSON.parse(data.settings.sequenceSteps)); } catch { setSequenceSteps(DEFAULT_SEQUENCE); }
                }
            }
        } catch (e) { console.error('Load leads error:', e); }
        finally { setLeadsLoading(false); }
    };

    const saveSettings = async () => {
        setSettingsSaving(true);
        try {
            const data = await apiPost('/api/warm-leads', {
                action: 'save_settings',
                campaignName, businessContext, campaignGoal, profilesPerDay,
                sequenceSteps, autopilotEnabled,
            });
            if (data.success) {
                setSettings(data.settings);
                showToast('Settings saved!', 'success');
            } else { showToast(data.error || 'Failed to save', 'error'); }
        } catch (e: any) { showToast('Error: ' + e.message, 'error'); }
        finally { setSettingsSaving(false); }
    };

    const handleImportLeads = async () => {
        const urls = importText.split('\n').map(l => l.trim()).filter(l => l.includes('linkedin.com/in/'));
        if (urls.length === 0) { showToast('No LinkedIn URLs found', 'error'); return; }
        const leadsList = urls.map(url => ({ linkedinUrl: url.split('?')[0].replace(/\/$/, '') }));
        const data = await apiPost('/api/warm-leads', { leads: leadsList });
        if (data.success) {
            showToast(`Added ${data.created} leads (${data.skipped?.length || 0} duplicates)`, 'success');
            setImportText('');
            loadLeads();
        } else { showToast(data.error || 'Import failed', 'error'); }
    };

    const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const text = ev.target?.result as string;
            if (!text) return;
            const lines = text.split('\n');
            const header = lines[0]?.toLowerCase() || '';
            const urlCol = header.split(',').findIndex(h => h.includes('url') || h.includes('linkedin'));
            const leadsList: any[] = [];
            for (let i = 1; i < lines.length; i++) {
                const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
                const url = cols[urlCol >= 0 ? urlCol : 0] || '';
                if (url.includes('linkedin.com/in/')) {
                    leadsList.push({ linkedinUrl: url.split('?')[0].replace(/\/$/, '') });
                }
            }
            if (leadsList.length > 0) {
                apiPost('/api/warm-leads', { leads: leadsList }).then(data => {
                    if (data.success) { showToast(`Imported ${data.created} leads`, 'success'); loadLeads(); }
                });
            } else { showToast('No LinkedIn URLs found in CSV', 'error'); }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const fetchPostsForLeads = async (leadIds?: string[]) => {
        if (!extensionConnected) { showToast('Extension not connected. Please open LinkedIn.', 'error'); return; }
        setFetchingPosts(true);
        setFetchProgress('Starting...');
        const targetLeads = leadIds ? leads.filter(l => leadIds.includes(l.id)) : leads.filter(l => !l.postsFetched);
        if (targetLeads.length === 0) { showToast('No leads to fetch', 'info'); setFetchingPosts(false); return; }
        const bulkLimit = settings?.bulkTaskLimit || 10;
        const batch = targetLeads.slice(0, bulkLimit);
        try {
            const batchData = batch.map(l => ({
                leadId: l.id,
                vanityId: l.vanityId || l.linkedinUrl.match(/linkedin\.com\/in\/([^/?#]+)/i)?.[1],
            })).filter(b => b.vanityId);
            const res = await fetch('/api/extension/command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
                body: JSON.stringify({ command: 'fetch_lead_posts_bulk', data: { leads: batchData } })
            });
            const data = await res.json();
            if (data.success) {
                showToast(`Fetching posts for ${batchData.length} leads...`, 'info');
                const pollInterval = setInterval(async () => {
                    try {
                        const statusRes = await fetch(`/api/extension/command?commandId=${data.commandId}`, { headers: { Authorization: `Bearer ${authToken}` } });
                        const statusData = await statusRes.json();
                        if (statusData.command?.status === 'completed') {
                            clearInterval(pollInterval);
                            setFetchingPosts(false);
                            setFetchProgress('');
                            showToast(`Fetched posts for ${statusData.command.data?.success || 0} leads!`, 'success');
                            loadLeads();
                        } else if (statusData.command?.status === 'failed') {
                            clearInterval(pollInterval);
                            setFetchingPosts(false);
                            showToast('Fetch failed', 'error');
                        } else if (statusData.command?.data?.progress) {
                            setFetchProgress(statusData.command.data.progress);
                        }
                    } catch (e) {}
                }, 3000);
                setTimeout(() => clearInterval(pollInterval), 300000);
            } else { showToast(data.error || 'Failed', 'error'); setFetchingPosts(false); }
        } catch (e: any) { showToast('Error: ' + e.message, 'error'); setFetchingPosts(false); }
    };

    const engageWithPost = async (lead: any, post: any, action: 'like' | 'comment', commentText?: string) => {
        if (!extensionConnected) { showToast('Extension not connected', 'error'); return; }
        setEngagingPost(post.id);
        try {
            const res = await fetch('/api/extension/command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
                body: JSON.stringify({
                    command: 'engage_lead_post',
                    data: { postUrn: post.postUrn, enableLike: action === 'like', enableComment: action === 'comment', commentText: commentText || '', leadId: lead.id, postId: post.id }
                })
            });
            const data = await res.json();
            if (data.success) {
                showToast(`${action === 'like' ? 'Liking' : 'Commenting on'} post...`, 'info');
                setTimeout(() => { loadLeads(); setEngagingPost(null); }, 5000);
            } else { showToast(data.error || 'Failed', 'error'); setEngagingPost(null); }
        } catch (e: any) { showToast('Error: ' + e.message, 'error'); setEngagingPost(null); }
    };

    const deleteLead = async (id: string) => {
        const data = await apiDelete(`/api/warm-leads?id=${id}`);
        if (data.success) loadLeads();
    };

    useEffect(() => { loadLeads(); }, []);

    const filteredLeads = leads.filter(l => {
        if (statusFilter !== 'all' && l.status !== statusFilter) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return (l.firstName || '').toLowerCase().includes(q) || (l.lastName || '').toLowerCase().includes(q) ||
                (l.company || '').toLowerCase().includes(q) || (l.linkedinUrl || '').toLowerCase().includes(q);
        }
        return true;
    });

    const statusCounts = {
        pending_fetch: leads.filter(l => l.status === 'pending_fetch').length,
        fetched: leads.filter(l => l.status === 'fetched').length,
        engaged: leads.filter(l => l.status === 'engaged').length,
        connected: leads.filter(l => l.status === 'connected').length,
    };

    const card = { background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' };
    const btn = (bg: string, disabled = false) => ({
        padding: '8px 16px', background: disabled ? 'rgba(255,255,255,0.1)' : bg, color: 'white',
        border: 'none', borderRadius: '8px', fontWeight: '700' as const, fontSize: '12px',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
    });
    const input = { padding: '8px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '12px', width: '100%' };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Header */}
            <div style={{ ...card, background: 'linear-gradient(135deg, rgba(105,63,233,0.15) 0%, rgba(139,92,246,0.08) 100%)', border: '1px solid rgba(105,63,233,0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                        <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '800', margin: 0 }}>Warm Leads</h3>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', margin: '4px 0 0 0' }}>Import → Fetch Posts → Engage → Connect</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {fetchingPosts && <span style={{ color: '#a78bfa', fontSize: '11px' }}>{fetchProgress || 'Fetching...'}</span>}
                        <button onClick={() => setShowSettings(!showSettings)} style={btn('rgba(255,255,255,0.1)')}>Settings</button>
                        <button onClick={() => fetchPostsForLeads()} disabled={fetchingPosts || !extensionConnected}
                            style={btn('linear-gradient(135deg, #0077b5, #00a0dc)', fetchingPosts || !extensionConnected)}>
                            {fetchingPosts ? 'Fetching...' : 'Fetch All Posts'}
                        </button>
                    </div>
                </div>
                {/* Pipeline Stats */}
                <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end' }}>
                    {Object.entries(STATUS_COLORS).map(([key, val]) => {
                        const count = statusCounts[key as keyof typeof statusCounts] || 0;
                        const maxCount = Math.max(...Object.values(statusCounts), 1);
                        const height = Math.max(20, (count / maxCount) * 50);
                        return (
                            <div key={key} onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}
                                style={{ flex: 1, textAlign: 'center', cursor: 'pointer', padding: '6px 4px',
                                    background: statusFilter === key ? val.bg : 'transparent',
                                    border: statusFilter === key ? `1px solid ${val.border}` : '1px solid transparent',
                                    borderRadius: '8px', transition: 'all 0.2s' }}>
                                <div style={{ height: `${height}px`, background: val.bg, borderRadius: '4px 4px 0 0', margin: '0 auto 4px', width: '60%', border: `1px solid ${val.border}` }} />
                                <div style={{ fontSize: '16px', fontWeight: '800', color: val.text }}>{count}</div>
                                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>{val.label}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div style={card}>
                    <h4 style={{ color: 'white', fontSize: '14px', fontWeight: '700', margin: '0 0 12px 0' }}>Engagement Settings</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                        <div>
                            <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginBottom: '4px', display: 'block' }}>Campaign Name</label>
                            <input value={campaignName} onChange={e => setCampaignName(e.target.value)} style={input} placeholder="Q1 SaaS Founders Outreach" />
                        </div>
                        <div>
                            <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginBottom: '4px', display: 'block' }}>Profiles/Day</label>
                            <input type="number" value={profilesPerDay} onChange={e => setProfilesPerDay(parseInt(e.target.value) || 20)} min={1} max={50} style={input} />
                        </div>
                    </div>
                    <div style={{ marginTop: '12px' }}>
                        <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginBottom: '4px', display: 'block' }}>Your Business / Offer</label>
                        <textarea value={businessContext} onChange={e => setBusinessContext(e.target.value)} rows={2}
                            style={{ ...input, resize: 'vertical' }} placeholder="I help SaaS founders reduce churn through onboarding audits..." />
                    </div>
                    <div style={{ marginTop: '12px' }}>
                        <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginBottom: '6px', display: 'block' }}>Campaign Goal</label>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {[
                                { key: 'relationship', icon: '🤝', label: 'Relationship' },
                                { key: 'authority', icon: '👑', label: 'Authority' },
                                { key: 'warm_pitch', icon: '🎯', label: 'Warm Pitch' },
                                { key: 'recruit', icon: '🔍', label: 'Recruit' },
                            ].map(g => (
                                <button key={g.key} onClick={() => setCampaignGoal(g.key)}
                                    style={{ padding: '8px 14px', background: campaignGoal === g.key ? 'rgba(105,63,233,0.2)' : 'rgba(255,255,255,0.05)',
                                        border: campaignGoal === g.key ? '2px solid rgba(105,63,233,0.6)' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px', cursor: 'pointer', color: 'white', fontSize: '11px', fontWeight: '600' }}>
                                    {g.icon} {g.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div style={{ marginTop: '12px' }}>
                        <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginBottom: '6px', display: 'block' }}>Warm Sequence Timeline</label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                            {sequenceSteps.map((step, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <div style={{ padding: '8px 12px', background: step.enabled ? 'rgba(105,63,233,0.15)' : 'rgba(255,255,255,0.05)',
                                        border: `1px solid ${step.enabled ? 'rgba(105,63,233,0.3)' : 'rgba(255,255,255,0.1)'}`,
                                        borderRadius: '8px', cursor: 'pointer', opacity: step.enabled ? 1 : 0.5 }}
                                        onClick={() => { const newSteps = [...sequenceSteps]; newSteps[idx].enabled = !newSteps[idx].enabled; setSequenceSteps(newSteps); }}>
                                        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)' }}>Day {step.day}</div>
                                        <div style={{ fontSize: '11px', color: 'white', fontWeight: '600' }}>
                                            {ACTION_LABELS[step.action]?.icon} {ACTION_LABELS[step.action]?.label}
                                        </div>
                                    </div>
                                    {idx < sequenceSteps.length - 1 && <span style={{ color: 'rgba(255,255,255,0.2)' }}>→</span>}
                                </div>
                            ))}
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '9px', margin: '6px 0 0 0' }}>Click to enable/disable steps. Follow & Connect are in beta.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px', alignItems: 'center' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                            <input type="checkbox" checked={autopilotEnabled} onChange={e => setAutopilotEnabled(e.target.checked)} style={{ accentColor: '#693fe9' }} />
                            <span style={{ color: 'white', fontSize: '11px', fontWeight: '600' }}>Autopilot Mode</span>
                        </label>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>Runs sequences automatically via cron</span>
                        <div style={{ flex: 1 }} />
                        <button onClick={saveSettings} disabled={settingsSaving} style={btn('linear-gradient(135deg, #693fe9, #8b5cf6)', settingsSaving)}>
                            {settingsSaving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </div>
            )}

            {/* Import Section */}
            <div style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: 0 }}>Import Leads</h4>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input ref={csvFileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleCsvUpload} />
                        <button onClick={() => csvFileRef.current?.click()} style={btn('rgba(255,255,255,0.08)')}>Upload CSV</button>
                        <span style={{ color: '#a78bfa', fontSize: '11px', alignSelf: 'center' }}>
                            {importText.split('\n').filter(l => l.includes('linkedin.com/in/')).length} detected
                        </span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <textarea value={importText} onChange={e => setImportText(e.target.value)}
                        placeholder="Paste LinkedIn profile URLs (one per line)" rows={3}
                        style={{ ...input, flex: 1, fontFamily: 'monospace', resize: 'vertical' }} />
                    <button onClick={handleImportLeads} disabled={!importText.trim()} style={{ ...btn('linear-gradient(135deg, #10b981, #059669)', !importText.trim()), alignSelf: 'flex-end' }}>
                        Import
                    </button>
                </div>
            </div>

            {/* Search */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search leads..." style={{ ...input, width: '250px' }} />
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{filteredLeads.length} of {leads.length} leads</span>
            </div>

            {/* Leads Table */}
            {leadsLoading ? (
                <div style={{ ...card, textAlign: 'center', padding: '40px' }}>
                    <div style={{ color: 'rgba(255,255,255,0.5)' }}>Loading leads...</div>
                </div>
            ) : leads.length === 0 ? (
                <div style={{ ...card, textAlign: 'center', padding: '40px' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📋</div>
                    <div style={{ color: 'white', fontWeight: '600', marginBottom: '4px' }}>No leads yet</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Import LinkedIn profile URLs to get started</div>
                </div>
            ) : (
                <div style={{ ...card, padding: '0', overflow: 'hidden' }}>
                    <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                            <thead style={{ position: 'sticky', top: 0, background: '#1a1a3e', zIndex: 1 }}>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    {['Name', 'Company', 'Status', 'Posts', 'Engaged', 'Actions'].map(h => (
                                        <th key={h} style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.5)', fontWeight: '600', textAlign: 'left' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLeads.map(lead => {
                                    const sc = STATUS_COLORS[lead.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.pending_fetch;
                                    const isExpanded = expandedLeadId === lead.id;
                                    return (
                                        <>
                                            <tr key={lead.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
                                                onClick={() => setExpandedLeadId(isExpanded ? null : lead.id)}>
                                                <td style={{ padding: '10px 12px' }}>
                                                    <a href={lead.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'none', fontWeight: '600' }}
                                                        onClick={e => e.stopPropagation()}>
                                                        {lead.firstName || lead.vanityId || 'Unknown'} {lead.lastName || ''}
                                                    </a>
                                                    {lead.headline && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', marginTop: '2px' }}>{lead.headline.slice(0, 50)}...</div>}
                                                </td>
                                                <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.6)' }}>{lead.company || '-'}</td>
                                                <td style={{ padding: '10px 12px' }}>
                                                    <span style={{ padding: '3px 8px', background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: '6px', color: sc.text, fontSize: '10px', fontWeight: '600' }}>
                                                        {sc.label}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '10px 12px', color: '#a78bfa', fontWeight: '600' }}>{lead.posts?.length || 0}</td>
                                                <td style={{ padding: '10px 12px', color: '#34d399', fontWeight: '600' }}>{lead.touchCount || 0}</td>
                                                <td style={{ padding: '10px 12px' }}>
                                                    <div style={{ display: 'flex', gap: '6px' }} onClick={e => e.stopPropagation()}>
                                                        {!lead.postsFetched && (
                                                            <button onClick={() => fetchPostsForLeads([lead.id])} disabled={fetchingPosts}
                                                                style={{ ...btn('rgba(0,119,181,0.2)', fetchingPosts), padding: '4px 8px', fontSize: '10px' }}>
                                                                Fetch
                                                            </button>
                                                        )}
                                                        <button onClick={() => deleteLead(lead.id)}
                                                            style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '14px', padding: '4px' }}>✕</button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {/* Expanded Posts Row */}
                                            {isExpanded && lead.posts?.length > 0 && (
                                                <tr key={`${lead.id}-posts`}>
                                                    <td colSpan={6} style={{ padding: '0', background: 'rgba(0,0,0,0.2)' }}>
                                                        <div style={{ padding: '12px 16px', maxHeight: '300px', overflowY: 'auto' }}>
                                                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: '600', marginBottom: '8px' }}>
                                                                Recent Posts ({lead.posts.length})
                                                            </div>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                                {lead.posts.map((post: any) => (
                                                                    <div key={post.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                                                                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>
                                                                                {post.postDate ? new Date(post.postDate).toLocaleDateString() : 'Unknown date'}
                                                                            </span>
                                                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                                                {post.isLiked && <span style={{ color: '#34d399', fontSize: '10px' }}>✓ Liked</span>}
                                                                                {post.isCommented && <span style={{ color: '#a78bfa', fontSize: '10px' }}>✓ Commented</span>}
                                                                            </div>
                                                                        </div>
                                                                        <div style={{ color: 'white', fontSize: '11px', lineHeight: '1.4', maxHeight: '60px', overflow: 'auto', marginBottom: '8px' }}>
                                                                            {post.postText || '(No text)'}
                                                                        </div>
                                                                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px' }}>
                                                                                👍 {post.likes || 0} · 💬 {post.comments || 0}
                                                                            </span>
                                                                            <div style={{ flex: 1 }} />
                                                                            {!post.isLiked && (
                                                                                <button onClick={() => engageWithPost(lead, post, 'like')} disabled={engagingPost === post.id}
                                                                                    style={{ ...btn('rgba(52,211,153,0.2)', engagingPost === post.id), padding: '4px 10px', fontSize: '10px' }}>
                                                                                    👍 Like
                                                                                </button>
                                                                            )}
                                                                            {!post.isCommented && (
                                                                                <button onClick={() => {
                                                                                    const comment = prompt('Enter your comment:');
                                                                                    if (comment) engageWithPost(lead, post, 'comment', comment);
                                                                                }} disabled={engagingPost === post.id}
                                                                                    style={{ ...btn('rgba(167,139,250,0.2)', engagingPost === post.id), padding: '4px 10px', fontSize: '10px' }}>
                                                                                    💬 Comment
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Safety Notice */}
            <div style={{ ...card, background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>🛡️</span>
                    <div>
                        <div style={{ color: '#fbbf24', fontSize: '11px', fontWeight: '700' }}>LinkedIn Safety Built-In</div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>
                            Max 20-30 profiles/day · Actions spaced across days · No same-session like+comment · Auto-pause on warnings
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

```

---

### components\LeadWarmerTab.tsx

```
// @ts-nocheck
import { useState, useEffect, useRef } from 'react';

const STATUS_COLORS = {
  cold: { bg: 'rgba(148,163,184,0.15)', border: 'rgba(148,163,184,0.3)', text: '#94a3b8', label: 'Cold' },
  touched: { bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.3)', text: '#fbbf24', label: 'Touched' },
  warm: { bg: 'rgba(251,146,60,0.15)', border: 'rgba(251,146,60,0.3)', text: '#fb923c', label: 'Warm' },
  connected: { bg: 'rgba(52,211,153,0.15)', border: 'rgba(52,211,153,0.3)', text: '#34d399', label: 'Connected' },
  replied: { bg: 'rgba(167,139,250,0.15)', border: 'rgba(167,139,250,0.3)', text: '#a78bfa', label: 'Replied' },
};

const ACTION_LABELS: Record<string, string> = {
  follow: 'Follow', like: 'Like Post', comment: 'Comment on Post',
  like_2: 'Like Another Post', comment_2: 'Second Comment', connect: 'Connection Request',
};

const DEFAULT_SEQUENCE = [
  { day: 1, action: 'follow', enabled: true },
  { day: 3, action: 'like', enabled: true },
  { day: 5, action: 'comment', enabled: true },
  { day: 7, action: 'like_2', enabled: true },
  { day: 10, action: 'connect', enabled: true },
];

export default function LeadWarmerTab(props: any) {
  const { t, user, miniIcon, showToast, extensionConnected } = props;

  // State
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [prospects, setProspects] = useState<any[]>([]);
  const [prospectsLoading, setProspectsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [showTouchHistory, setShowTouchHistory] = useState<string | null>(null);
  const [touchLogs, setTouchLogs] = useState<any[]>([]);
  const [touchLogsLoading, setTouchLogsLoading] = useState(false);
  const [fetchingProfiles, setFetchingProfiles] = useState(false);
  const [executingTouch, setExecutingTouch] = useState<string | null>(null);

  // New campaign form
  const [newName, setNewName] = useState('');
  const [newGoal, setNewGoal] = useState('relationship');
  const [newBizContext, setNewBizContext] = useState('');
  const [newProfilesPerDay, setNewProfilesPerDay] = useState(20);
  const [newSequence, setNewSequence] = useState(DEFAULT_SEQUENCE);

  // CSV import
  const [csvText, setCsvText] = useState('');
  const csvFileRef = useRef<HTMLInputElement>(null);

  const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  // ── API helpers ──
  const apiGet = async (url: string) => {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${authToken}` } });
    return res.json();
  };
  const apiPost = async (url: string, body: any) => {
    const res = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return res.json();
  };
  const apiPut = async (url: string, body: any) => {
    const res = await fetch(url, { method: 'PUT', headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return res.json();
  };
  const apiDelete = async (url: string) => {
    const res = await fetch(url, { method: 'DELETE', headers: { Authorization: `Bearer ${authToken}` } });
    return res.json();
  };

  // ── Load campaigns ──
  const loadCampaigns = async () => {
    setCampaignsLoading(true);
    try {
      const data = await apiGet('/api/lead-warmer/campaigns');
      if (data.success) {
        setCampaigns(data.campaigns || []);
        if (!activeCampaignId && data.campaigns?.length > 0) {
          setActiveCampaignId(data.campaigns[0].id);
        }
      }
    } catch {} finally { setCampaignsLoading(false); }
  };

  // ── Load prospects for active campaign ──
  const loadProspects = async (campId?: string) => {
    const cid = campId || activeCampaignId;
    if (!cid) return;
    setProspectsLoading(true);
    try {
      const data = await apiGet(`/api/lead-warmer/prospects?campaignId=${cid}`);
      if (data.success) setProspects(data.prospects || []);
    } catch {} finally { setProspectsLoading(false); }
  };

  // ── Create campaign ──
  const handleCreateCampaign = async () => {
    if (!newName.trim()) { showToast('Campaign name required', 'error'); return; }
    const data = await apiPost('/api/lead-warmer/campaigns', {
      name: newName, campaignGoal: newGoal, businessContext: newBizContext,
      sequenceSteps: newSequence, profilesPerDay: newProfilesPerDay,
    });
    if (data.success) {
      showToast('Campaign created!', 'success');
      setShowCreateCampaign(false);
      setNewName(''); setNewBizContext('');
      setActiveCampaignId(data.campaign.id);
      loadCampaigns();
    } else { showToast(data.error || 'Failed', 'error'); }
  };

  // ── Pause/Resume campaign ──
  const toggleCampaignStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    const data = await apiPut('/api/lead-warmer/campaigns', { id, status: newStatus });
    if (data.success) { loadCampaigns(); showToast(`Campaign ${newStatus}`, 'success'); }
  };

  // ── Delete campaign ──
  const deleteCampaign = async (id: string) => {
    if (!confirm('Delete this campaign and all its prospects?')) return;
    const data = await apiDelete(`/api/lead-warmer/campaigns?id=${id}`);
    if (data.success) {
      if (activeCampaignId === id) setActiveCampaignId(null);
      loadCampaigns(); showToast('Campaign deleted', 'success');
    }
  };

  // ── Extract vanity ID from URL ──
  function extractVanityId(url: string): string | null {
    const m = url.match(/linkedin\.com\/in\/([^/?#]+)/i);
    return m ? m[1].replace(/\/$/, '') : null;
  }

  // ── CSV import handler ──
  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (!text) return;
      const lines = text.split('\n');
      const header = lines[0]?.toLowerCase() || '';
      const urlCol = header.split(',').findIndex(h => h.includes('url') || h.includes('linkedin'));
      const nameCol = header.split(',').findIndex(h => h.includes('first') || h.includes('name'));
      const companyCol = header.split(',').findIndex(h => h.includes('company'));
      const titleCol = header.split(',').findIndex(h => h.includes('title') || h.includes('job'));
      const tagCol = header.split(',').findIndex(h => h.includes('tag') || h.includes('campaign'));
      const noteCol = header.split(',').findIndex(h => h.includes('note'));

      const prospects: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        const url = cols[urlCol >= 0 ? urlCol : 0] || '';
        if (!url.includes('linkedin.com/in/')) continue;
        prospects.push({
          linkedinUrl: url,
          firstName: nameCol >= 0 ? cols[nameCol] : '',
          company: companyCol >= 0 ? cols[companyCol] : '',
          jobTitle: titleCol >= 0 ? cols[titleCol] : '',
          campaignTag: tagCol >= 0 ? cols[tagCol] : '',
          notes: noteCol >= 0 ? cols[noteCol] : '',
        });
      }
      if (prospects.length > 0) {
        importProspects(prospects);
      } else {
        showToast('No LinkedIn URLs found in CSV', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ── Import prospects from parsed data ──
  const importProspects = async (prospectList: any[]) => {
    if (!activeCampaignId) { showToast('Select or create a campaign first', 'error'); return; }
    const data = await apiPost('/api/lead-warmer/prospects', { campaignId: activeCampaignId, prospects: prospectList });
    if (data.success) {
      showToast(`Added ${data.created} prospects (${data.skipped?.length || 0} skipped)`, 'success');
      loadProspects();
      loadCampaigns();
      // Auto-fetch profile data via extension
      const newVanityIds = prospectList.map(p => extractVanityId(p.linkedinUrl || p.url || '')).filter(Boolean);
      if (newVanityIds.length > 0 && extensionConnected) {
        fetchProfilesFromExtension(newVanityIds as string[]);
      }
    } else { showToast(data.error || 'Import failed', 'error'); }
  };

  // ── Add profiles from text input ──
  const handleAddFromText = () => {
    const urls = csvText.split('\n').map(l => l.trim()).filter(l => l.includes('linkedin.com/in/'));
    if (urls.length === 0) { showToast('No LinkedIn URLs found', 'error'); return; }
    const prospectList = urls.map(url => ({ linkedinUrl: url }));
    importProspects(prospectList);
    setCsvText('');
  };

  // ── Fetch profile data from extension (Voyager API) ──
  const fetchProfilesFromExtension = async (vanityIds: string[]) => {
    setFetchingProfiles(true);
    showToast(`Fetching profile data for ${vanityIds.length} profiles via extension...`, 'info');
    try {
      // Send message to extension
      if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
        const extId = await getExtensionId();
        if (extId) {
          chrome.runtime.sendMessage(extId, { action: 'leadWarmer_fetchProfiles', vanityIds }, async (response: any) => {
            if (response?.success && response.results) {
              let updated = 0;
              for (const r of response.results) {
                if (!r.success) continue;
                // Find matching prospect and update
                const prospect = prospects.find(p => p.vanityId === r.vanityId);
                if (prospect) {
                  await apiPut('/api/lead-warmer/prospects', {
                    id: prospect.id, firstName: r.firstName, lastName: r.lastName,
                    profileUrn: r.profileUrn, recentPosts: r.recentPosts || [],
                  });
                  updated++;
                }
              }
              showToast(`Updated ${updated} profiles with LinkedIn data`, 'success');
              loadProspects();
            } else {
              showToast('Extension fetch failed: ' + (response?.error || 'Unknown'), 'error');
            }
            setFetchingProfiles(false);
          });
          return;
        }
      }
      showToast('Extension not available. Profile data will be fetched when touches execute.', 'info');
    } catch (err: any) {
      showToast('Fetch error: ' + err.message, 'error');
    }
    setFetchingProfiles(false);
  };

  const getExtensionId = async (): Promise<string | null> => {
    try {
      const extIds = ['your-extension-id']; // Will auto-detect
      // Check if extension is installed by trying known pattern
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        return null; // Will use internal messaging if on same extension
      }
    } catch {}
    return null;
  };

  // ── Execute a touch manually ──
  const executeManualTouch = async (prospect: any) => {
    if (!extensionConnected) { showToast('Extension not connected. Please open LinkedIn and ensure extension is active.', 'error'); return; }
    setExecutingTouch(prospect.id);
    showToast(`Executing ${prospect.nextTouchAction || 'touch'} on ${prospect.firstName || prospect.vanityId}...`, 'info');

    const campaign = campaigns.find(c => c.id === prospect.campaignId);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/extension/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          command: 'lead_warmer_touch',
          data: {
            prospectId: prospect.id,
            vanityId: prospect.vanityId,
            linkedinUrl: prospect.linkedinUrl,
            action: prospect.nextTouchAction || 'follow',
            touchNumber: prospect.touchCount + 1,
            campaignGoal: campaign?.campaignGoal || 'relationship',
            businessContext: campaign?.businessContext || '',
            firstName: prospect.firstName,
            lastName: prospect.lastName,
            company: prospect.company,
            jobTitle: prospect.jobTitle,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Touch command sent to extension!', 'success');
        setTimeout(() => loadProspects(), 5000);
      } else {
        showToast(data.error || 'Failed to send command', 'error');
      }
    } catch (err: any) { showToast('Error: ' + err.message, 'error'); }
    setExecutingTouch(null);
  };

  // ── Load touch history ──
  const loadTouchHistory = async (prospectId: string) => {
    setShowTouchHistory(prospectId);
    setTouchLogsLoading(true);
    try {
      const data = await apiGet(`/api/lead-warmer/touch-log?prospectId=${prospectId}`);
      if (data.success) setTouchLogs(data.logs || []);
    } catch {} finally { setTouchLogsLoading(false); }
  };

  // ── Delete prospect ──
  const deleteProspect = async (id: string) => {
    const data = await apiDelete(`/api/lead-warmer/prospects?id=${id}`);
    if (data.success) { loadProspects(); loadCampaigns(); }
  };

  // ── Export warm leads to CSV ──
  const exportWarmLeads = () => {
    const warm = prospects.filter(p => ['warm', 'connected', 'replied'].includes(p.status));
    if (warm.length === 0) { showToast('No warm leads to export', 'error'); return; }
    const header = 'LinkedIn URL,First Name,Last Name,Company,Job Title,Status,Touch Count\n';
    const rows = warm.map(p => `${p.linkedinUrl},${p.firstName || ''},${p.lastName || ''},${p.company || ''},${p.jobTitle || ''},${p.status},${p.touchCount}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'warm-leads.csv'; a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${warm.length} warm leads`, 'success');
  };

  // ── Initial load ──
  useEffect(() => { loadCampaigns(); }, []);
  useEffect(() => { if (activeCampaignId) loadProspects(activeCampaignId); }, [activeCampaignId]);

  // ── Computed ──
  const activeCampaign = campaigns.find(c => c.id === activeCampaignId);
  const filteredProspects = prospects.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (p.firstName || '').toLowerCase().includes(q) || (p.lastName || '').toLowerCase().includes(q) ||
        (p.company || '').toLowerCase().includes(q) || (p.linkedinUrl || '').toLowerCase().includes(q);
    }
    return true;
  });

  const hotSignals = prospects.filter(p => p.engagedBack);
  const pipelineCounts = {
    cold: prospects.filter(p => p.status === 'cold').length,
    touched: prospects.filter(p => p.status === 'touched').length,
    warm: prospects.filter(p => p.status === 'warm').length,
    connected: prospects.filter(p => p.status === 'connected').length,
    replied: prospects.filter(p => p.status === 'replied').length,
  };

  // ── Styles ──
  const card = { background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' };
  const btn = (bg: string, disabled = false) => ({
    padding: '8px 16px', background: disabled ? 'rgba(255,255,255,0.1)' : bg, color: 'white',
    border: 'none', borderRadius: '8px', fontWeight: '700' as const, fontSize: '12px',
    cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
  });
  const input = { padding: '8px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '12px', width: '100%' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {/* ── Header with funnel visualization ── */}
      <div style={{ ...card, background: 'linear-gradient(135deg, rgba(105,63,233,0.15) 0%, rgba(139,92,246,0.08) 100%)', border: '1px solid rgba(105,63,233,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '800', margin: 0 }}>Lead Warmer</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', margin: '4px 0 0 0' }}>
              Cold prospect → Warm lead → Conversation → Sale
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={exportWarmLeads} style={btn('rgba(255,255,255,0.1)')}>Export Warm Leads</button>
            <button onClick={() => setShowCreateCampaign(true)} style={btn('linear-gradient(135deg, #693fe9, #8b5cf6)')}>+ New Campaign</button>
          </div>
        </div>

        {/* Pipeline Funnel */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end' }}>
          {Object.entries(STATUS_COLORS).map(([key, val]) => {
            const count = pipelineCounts[key as keyof typeof pipelineCounts] || 0;
            const maxCount = Math.max(...Object.values(pipelineCounts), 1);
            const height = Math.max(20, (count / maxCount) * 60);
            return (
              <div key={key} onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}
                style={{ flex: 1, textAlign: 'center', cursor: 'pointer', padding: '6px 4px',
                  background: statusFilter === key ? val.bg : 'transparent',
                  border: statusFilter === key ? `1px solid ${val.border}` : '1px solid transparent',
                  borderRadius: '8px', transition: 'all 0.2s' }}>
                <div style={{ height: `${height}px`, background: val.bg, borderRadius: '4px 4px 0 0', margin: '0 auto 4px', width: '60%', border: `1px solid ${val.border}` }} />
                <div style={{ fontSize: '18px', fontWeight: '800', color: val.text }}>{count}</div>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>{val.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Hot Signals Alert ── */}
      {hotSignals.length > 0 && (
        <div style={{ ...card, background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.3)' }}>
          <h4 style={{ color: '#fb923c', fontSize: '13px', fontWeight: '700', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {miniIcon('M13 2L3 14h9l-1 8 10-12h-9l1-8z', '#fb923c', 14)} Hot Signals — Follow Up Now!
          </h4>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {hotSignals.map(p => (
              <div key={p.id} style={{ padding: '6px 12px', background: 'rgba(251,146,60,0.15)', borderRadius: '8px', border: '1px solid rgba(251,146,60,0.3)' }}>
                <span style={{ color: 'white', fontSize: '12px', fontWeight: '600' }}>{p.firstName} {p.lastName}</span>
                <span style={{ color: '#fb923c', fontSize: '10px', marginLeft: '8px' }}>engaged back!</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Campaign Selector ── */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {campaignsLoading ? (
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', padding: '8px' }}>Loading campaigns...</div>
        ) : campaigns.length === 0 ? (
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', padding: '8px' }}>No campaigns yet. Create one to get started.</div>
        ) : campaigns.map(c => (
          <div key={c.id} onClick={() => setActiveCampaignId(c.id)}
            style={{ padding: '8px 14px', background: activeCampaignId === c.id ? 'rgba(105,63,233,0.2)' : 'rgba(255,255,255,0.05)',
              border: activeCampaignId === c.id ? '2px solid rgba(105,63,233,0.6)' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div>
              <div style={{ color: 'white', fontSize: '12px', fontWeight: '700' }}>{c.name}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px' }}>
                {c.totalProspects} prospects · {c.status}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={(e) => { e.stopPropagation(); toggleCampaignStatus(c.id, c.status); }}
                style={{ background: 'none', border: 'none', color: c.status === 'active' ? '#fbbf24' : '#34d399', cursor: 'pointer', fontSize: '10px', padding: '2px 6px' }}>
                {c.status === 'active' ? 'Pause' : 'Resume'}
              </button>
              <button onClick={(e) => { e.stopPropagation(); deleteCampaign(c.id); }}
                style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '10px', padding: '2px 6px' }}>✕</button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Create Campaign Modal ── */}
      {showCreateCampaign && (
        <div style={{ ...card, border: '2px solid rgba(105,63,233,0.4)', background: 'linear-gradient(180deg, rgba(105,63,233,0.08) 0%, rgba(255,255,255,0.03) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #693fe9, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {miniIcon('M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z', 'white', 18)}
            </div>
            <div>
              <h4 style={{ color: 'white', fontSize: '16px', fontWeight: '800', margin: 0 }}>Create New Campaign</h4>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', margin: '2px 0 0 0' }}>Set up a multi-touch warm outreach sequence</p>
            </div>
            <button onClick={() => setShowCreateCampaign(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '18px' }}>✕</button>
          </div>

          {/* Campaign Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', fontWeight: '700', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Campaign Name *</label>
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Q1 SaaS Founders Outreach" style={{ ...input, fontSize: '13px', padding: '10px 14px' }} />
              </div>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', fontWeight: '700', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your Business / Offer</label>
                <textarea value={newBizContext} onChange={e => setNewBizContext(e.target.value)}
                  placeholder="I help SaaS founders reduce churn through onboarding audits. Our tool saved $2M+ in revenue for 50+ companies." rows={2} style={{ ...input, resize: 'vertical', lineHeight: '1.5' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', fontWeight: '700', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Campaign Goal</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {[
                    { value: 'relationship', label: 'Relationship', icon: '🤝', desc: 'Build trust' },
                    { value: 'authority', label: 'Authority', icon: '👑', desc: 'Thought leader' },
                    { value: 'warm_pitch', label: 'Warm Pitch', icon: '🎯', desc: 'Sales ready' },
                    { value: 'recruit', label: 'Recruit', icon: '🔍', desc: 'Hire talent' },
                  ].map(g => (
                    <button key={g.value} onClick={() => setNewGoal(g.value)}
                      style={{ padding: '8px 6px', background: newGoal === g.value ? 'rgba(105,63,233,0.2)' : 'rgba(255,255,255,0.04)', border: newGoal === g.value ? '2px solid rgba(105,63,233,0.5)' : '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', textAlign: 'center' }}>
                      <div style={{ fontSize: '16px', marginBottom: '2px' }}>{g.icon}</div>
                      <div style={{ color: 'white', fontSize: '10px', fontWeight: '700' }}>{g.label}</div>
                      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '8px' }}>{g.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', fontWeight: '700', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Profiles/Day</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="range" min={1} max={30} value={newProfilesPerDay} onChange={e => setNewProfilesPerDay(parseInt(e.target.value))}
                    style={{ flex: 1, accentColor: '#693fe9' }} />
                  <span style={{ color: '#a78bfa', fontSize: '16px', fontWeight: '800', minWidth: '28px', textAlign: 'center' }}>{newProfilesPerDay}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Sequence Builder */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', fontWeight: '700', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Warm Sequence Timeline</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0', padding: '12px 8px', background: 'rgba(0,0,0,0.15)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', overflowX: 'auto' }}>
              {newSequence.map((step, idx) => {
                const actionIcons: Record<string, string> = { follow: '👤', like: '👍', comment: '💬', like_2: '❤️', comment_2: '✍️', connect: '🤝' };
                const actionColors: Record<string, string> = { follow: '#60a5fa', like: '#34d399', comment: '#a78bfa', like_2: '#f472b6', comment_2: '#fbbf24', connect: '#10b981' };
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
                    <div onClick={() => {
                      const ns = [...newSequence]; ns[idx] = { ...ns[idx], enabled: !ns[idx].enabled }; setNewSequence(ns);
                    }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '10px 12px', background: step.enabled ? 'rgba(105,63,233,0.12)' : 'rgba(255,255,255,0.03)', borderRadius: '10px', border: step.enabled ? `2px solid ${actionColors[step.action] || '#693fe9'}40` : '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', minWidth: '80px', opacity: step.enabled ? 1 : 0.4, transition: 'all 0.2s' }}>
                      <div style={{ fontSize: '20px' }}>{actionIcons[step.action] || '📌'}</div>
                      <select value={step.action} onClick={e => e.stopPropagation()} onChange={e => {
                        const ns = [...newSequence]; ns[idx] = { ...ns[idx], action: e.target.value }; setNewSequence(ns);
                      }} style={{ background: 'transparent', border: 'none', color: actionColors[step.action] || '#a78bfa', fontSize: '10px', fontWeight: '700', textAlign: 'center', cursor: 'pointer', outline: 'none', width: '100%' }}>
                        {Object.entries(ACTION_LABELS).map(([k, v]) => <option key={k} value={k} style={{ background: '#1a1a3e' }}>{v}</option>)}
                      </select>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px' }}>Day</span>
                        <input type="number" value={step.day} min={1} max={30} onClick={e => e.stopPropagation()} onChange={e => {
                          const ns = [...newSequence]; ns[idx] = { ...ns[idx], day: parseInt(e.target.value) || 1 }; setNewSequence(ns);
                        }} style={{ width: '30px', background: 'transparent', border: 'none', color: 'white', fontSize: '12px', fontWeight: '700', textAlign: 'center', outline: 'none' }} />
                      </div>
                    </div>
                    {idx < newSequence.length - 1 && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 2px' }}>
                        <div style={{ width: '20px', height: '2px', background: 'linear-gradient(90deg, rgba(105,63,233,0.4), rgba(105,63,233,0.1))' }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px', margin: '4px 0 0 8px' }}>Click to enable/disable steps. Dropdown to change action. Edit day numbers inline.</p>
          </div>

          {/* Quick Add Profiles */}
          <div style={{ marginBottom: '14px', padding: '12px', background: 'rgba(0,119,181,0.06)', borderRadius: '10px', border: '1px solid rgba(0,119,181,0.15)' }}>
            <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {miniIcon('M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75', '#60a5fa', 12)} Quick Add Profiles (optional — add more after creating)
            </label>
            <textarea value={csvText} onChange={e => setCsvText(e.target.value)}
              placeholder="Paste LinkedIn profile URLs (one per line):&#10;https://www.linkedin.com/in/john-doe&#10;https://www.linkedin.com/in/jane-smith" rows={3}
              style={{ ...input, fontFamily: 'monospace', fontSize: '11px', resize: 'vertical', lineHeight: '1.6' }} />
            {csvText.trim() && (() => {
              const count = csvText.split('\n').filter(l => l.trim().includes('linkedin.com/in/')).length;
              return <p style={{ color: count > 0 ? '#34d399' : '#f87171', fontSize: '10px', margin: '4px 0 0 0' }}>{count} profile{count !== 1 ? 's' : ''} detected</p>;
            })()}
          </div>

          {/* LinkedIn Post Preview Mockup */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', fontWeight: '700', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Preview: How your outreach will look</label>
            <div style={{ maxWidth: '380px', background: '#1b1f23', borderRadius: '10px', border: '1px solid #38434f', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
              <div style={{ padding: '10px 14px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #0077b5, #00a0dc)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '14px' }}>
                  {(user?.name?.[0] || 'Y').toUpperCase()}
                </div>
                <div>
                  <div style={{ color: 'white', fontSize: '12px', fontWeight: '600' }}>{user?.name || 'Your Name'}</div>
                  <div style={{ color: '#ffffffb3', fontSize: '10px' }}>Just now</div>
                </div>
              </div>
              <div style={{ padding: '0 14px 10px', color: '#ffffffe6', fontSize: '12px', lineHeight: '1.5' }}>
                {newGoal === 'relationship' && "Great insights on scaling SaaS! Your approach to customer success resonated with me. Would love to connect and exchange ideas."}
                {newGoal === 'authority' && "This is an excellent breakdown. I've seen similar patterns in my work with 50+ SaaS companies. The churn reduction framework is spot on."}
                {newGoal === 'warm_pitch' && "Impressive growth numbers! We helped similar companies save $2M+ with our approach. Would love to share some relevant case studies."}
                {newGoal === 'recruit' && "Your work at this company is impressive! We're building something exciting and your expertise would be invaluable. Let's connect!"}
              </div>
              <div style={{ padding: '6px 14px', borderTop: '1px solid #38434f', display: 'flex', justifyContent: 'space-around' }}>
                {['👍 Like', '💬 Comment', '🔄 Repost'].map(a => (
                  <span key={a} style={{ color: '#ffffff60', fontSize: '10px', padding: '4px' }}>{a}</span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={async () => {
              await handleCreateCampaign();
              if (csvText.trim()) {
                const urls = csvText.split('\n').map(l => l.trim()).filter(l => l.includes('linkedin.com/in/'));
                if (urls.length > 0) {
                  const prospectList = urls.map(url => ({ linkedinUrl: url }));
                  setTimeout(() => importProspects(prospectList), 500);
                }
              }
            }} style={{ ...btn('linear-gradient(135deg, #693fe9, #8b5cf6)'), padding: '12px 24px', fontSize: '13px', boxShadow: '0 4px 15px rgba(105,63,233,0.3)' }}>
              {miniIcon('M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z', 'white', 12)} Create Campaign{csvText.trim() ? ' & Import Profiles' : ''}
            </button>
            <button onClick={() => setShowCreateCampaign(false)} style={{ ...btn('rgba(255,255,255,0.1)'), padding: '12px 20px' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── Add Prospects Section ── */}
      {activeCampaignId && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: 0 }}>Add Prospects</h4>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input ref={csvFileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleCsvFileUpload} />
              <button onClick={() => csvFileRef.current?.click()} style={btn('rgba(255,255,255,0.08)')}>
                Upload CSV
              </button>
              {fetchingProfiles && <span style={{ color: '#a78bfa', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>Fetching profiles...</span>}
            </div>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', marginBottom: '6px' }}>
            CSV columns: LinkedIn Profile URL (required), First Name, Company, Job Title, Campaign Tag, Notes
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <textarea value={csvText} onChange={e => setCsvText(e.target.value)}
              placeholder="https://www.linkedin.com/in/john-doe&#10;https://www.linkedin.com/in/jane-smith" rows={3}
              style={{ ...input, flex: 1, fontFamily: 'monospace', resize: 'vertical' }} />
            <button onClick={handleAddFromText} disabled={!csvText.trim()} style={{ ...btn('linear-gradient(135deg, #10b981, #059669)', !csvText.trim()), alignSelf: 'flex-end' }}>
              Add
            </button>
          </div>
        </div>
      )}

      {/* ── Prospects Table ── */}
      {activeCampaignId && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: 0 }}>
              Prospects ({filteredProspects.length})
            </h4>
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search..."
              style={{ ...input, width: '200px' }} />
          </div>

          {/* Status filter pills */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <button onClick={() => setStatusFilter('all')}
              style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '600', cursor: 'pointer',
                background: statusFilter === 'all' ? 'rgba(255,255,255,0.15)' : 'transparent', color: 'rgba(255,255,255,0.7)',
                border: statusFilter === 'all' ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.1)' }}>All</button>
            {Object.entries(STATUS_COLORS).map(([key, val]) => (
              <button key={key} onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}
                style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '600', cursor: 'pointer',
                  background: statusFilter === key ? val.bg : 'transparent', color: val.text,
                  border: statusFilter === key ? `1px solid ${val.border}` : '1px solid rgba(255,255,255,0.08)' }}>
                {val.label}
              </button>
            ))}
          </div>

          {prospectsLoading ? (
            <div style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '20px', fontSize: '12px' }}>Loading prospects...</div>
          ) : filteredProspects.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '30px', fontSize: '12px' }}>
              {prospects.length === 0 ? 'No prospects yet. Add LinkedIn URLs or upload a CSV above.' : 'No matches for current filter.'}
            </div>
          ) : (
            <div style={{ overflowX: 'auto', maxHeight: '500px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#1a1a3e', zIndex: 1 }}>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    {['Name', 'Company', 'Status', 'Touches', 'Next Touch', 'Recent Post', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '6px 8px', color: 'rgba(255,255,255,0.5)', fontWeight: '600', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredProspects.map(p => {
                    const sc = STATUS_COLORS[p.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.cold;
                    let posts: any[] = [];
                    try { posts = JSON.parse(p.recentPosts || '[]'); } catch {}
                    const latestPost = posts[0]?.text || '';
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '8px', minWidth: '120px' }}>
                          <a href={p.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'none', fontWeight: '600' }}>
                            {p.firstName || p.vanityId || 'Unknown'} {p.lastName || ''}
                          </a>
                          {p.jobTitle && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px' }}>{p.jobTitle}</div>}
                        </td>
                        <td style={{ padding: '8px', color: 'rgba(255,255,255,0.6)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.company || '-'}</td>
                        <td style={{ padding: '8px' }}>
                          <span style={{ padding: '2px 8px', background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: '4px', color: sc.text, fontSize: '9px', fontWeight: '600' }}>
                            {sc.label}
                          </span>
                          {p.engagedBack && <span style={{ marginLeft: '4px', color: '#fb923c', fontSize: '9px' }}>🔥</span>}
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          <button onClick={() => loadTouchHistory(p.id)} style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>
                            {p.touchCount}
                          </button>
                        </td>
                        <td style={{ padding: '8px', fontSize: '10px' }}>
                          {p.nextTouchAction ? (
                            <div>
                              <span style={{ color: '#a78bfa' }}>{ACTION_LABELS[p.nextTouchAction] || p.nextTouchAction}</span>
                              {p.nextTouchDate && <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px' }}>{new Date(p.nextTouchDate).toLocaleDateString()}</div>}
                            </div>
                          ) : <span style={{ color: 'rgba(255,255,255,0.3)' }}>Done</span>}
                        </td>
                        <td style={{ padding: '8px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>
                          {latestPost ? latestPost.substring(0, 80) + '...' : <span style={{ color: 'rgba(255,255,255,0.2)' }}>No posts fetched</span>}
                        </td>
                        <td style={{ padding: '8px' }}>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {p.nextTouchAction && (
                              <button onClick={() => executeManualTouch(p)} disabled={!!executingTouch}
                                style={{ ...btn('linear-gradient(135deg,#693fe9,#8b5cf6)', !!executingTouch), padding: '4px 8px', fontSize: '10px' }}>
                                {executingTouch === p.id ? '...' : 'Execute'}
                              </button>
                            )}
                            <button onClick={() => deleteProspect(p.id)}
                              style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '12px', padding: '4px' }}>✕</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Touch History Modal ── */}
      {showTouchHistory && (
        <>
          <div onClick={() => setShowTouchHistory(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000, background: 'rgba(0,0,0,0.5)' }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10001, background: '#1a1a3e', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '16px', padding: '20px', width: '500px', maxHeight: '500px', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h4 style={{ color: 'white', fontSize: '14px', fontWeight: '700', margin: 0 }}>Touch History</h4>
              <button onClick={() => setShowTouchHistory(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>
            {touchLogsLoading ? (
              <div style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '20px' }}>Loading...</div>
            ) : touchLogs.length === 0 ? (
              <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '20px' }}>No touches recorded yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {touchLogs.map(log => (
                  <div key={log.id} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ color: '#a78bfa', fontSize: '11px', fontWeight: '700' }}>
                        Touch #{log.touchNumber} — {ACTION_LABELS[log.action] || log.action}
                      </span>
                      <span style={{ color: log.status === 'completed' ? '#34d399' : log.status === 'failed' ? '#f87171' : '#fbbf24', fontSize: '10px', fontWeight: '600' }}>
                        {log.status}
                      </span>
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px' }}>{new Date(log.createdAt).toLocaleString()}</div>
                    {log.commentText && (
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', marginTop: '4px', padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontStyle: 'italic' }}>
                        &ldquo;{log.commentText}&rdquo;
                      </div>
                    )}
                    {log.connectionNote && (
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', marginTop: '4px' }}>
                        Note: &ldquo;{log.connectionNote}&rdquo;
                      </div>
                    )}
                    {log.postUrl && (
                      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px', marginTop: '2px' }}>Post: {log.postUrl}</div>
                    )}
                    {log.errorMessage && (
                      <div style={{ color: '#f87171', fontSize: '10px', marginTop: '2px' }}>Error: {log.errorMessage}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Campaign Sequence Preview ── */}
      {activeCampaign && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: 0 }}>Warm Sequence — {activeCampaign.name}</h4>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>Goal: {activeCampaign.campaignGoal}</span>
          </div>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {(() => {
              try {
                const steps = JSON.parse(activeCampaign.sequenceSteps || '[]');
                return steps.filter((s: any) => s.enabled).map((step: any, idx: number, arr: any[]) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ padding: '6px 10px', background: 'rgba(105,63,233,0.1)', borderRadius: '8px', border: '1px solid rgba(105,63,233,0.2)', textAlign: 'center' }}>
                      <div style={{ color: '#a78bfa', fontSize: '9px', fontWeight: '600' }}>Day {step.day}</div>
                      <div style={{ color: 'white', fontSize: '10px', fontWeight: '700' }}>{ACTION_LABELS[step.action] || step.action}</div>
                    </div>
                    {idx < arr.length - 1 && <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '16px' }}>→</span>}
                  </div>
                ));
              } catch { return null; }
            })()}
          </div>
          {activeCampaign.businessContext && (
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', marginTop: '8px', fontStyle: 'italic' }}>
              Business: {activeCampaign.businessContext}
            </div>
          )}
        </div>
      )}

      {/* ── Safety Notice ── */}
      <div style={{ ...card, background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {miniIcon('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', '#fbbf24', 14)}
          <div>
            <div style={{ color: '#fbbf24', fontSize: '11px', fontWeight: '700' }}>LinkedIn Safety Built-In</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>
              Max 20-30 profiles/day · Actions spaced across days · No same-session like+comment · Skips inactive profiles · Auto-pause on warnings
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

```

---

### components\LimitsTab.tsx

```
// @ts-nocheck
export default function LimitsTab(props: any) {
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

    return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {autoSettingsLoading ? <div style={{ color: 'rgba(255,255,255,0.5)', padding: '40px', textAlign: 'center' }}>Loading settings...</div> : autoSettings && (<>

                            {/* Preset + Delay Mode */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontWeight: '700', display: 'block', marginBottom: '5px', textTransform: 'uppercase' }}>Account Preset</label>
                                    <select value={autoSettings.accountPreset} onChange={e => setAutoSettings((p: any) => ({ ...p, accountPreset: e.target.value }))}
                                        style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '12px' }}>
                                        <option value="your-choice">Custom (Your Settings)</option>
                                        <option value="new-conservative">New Account (0-2 wk) — Cautious</option>
                                        <option value="new-moderate">New Account (2-8 wk) — Moderate</option>
                                        <option value="matured-safe">Matured (3+ mo) — Recommended</option>
                                        <option value="matured-aggressive">Matured (6+ mo) — Faster</option>
                                        <option value="premium-user">LinkedIn Premium</option>
                                        <option value="sales-navigator">Sales Navigator</option>
                                        <option value="speed-mode">Speed Mode (Use Carefully)</option>
                                    </select>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontWeight: '700', display: 'block', marginBottom: '5px', textTransform: 'uppercase' }}>Delay Mode</label>
                                    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                                        {[{ v: 'fixed', l: 'Fixed Delay' }, { v: 'random', l: 'Random Range' }].map(o => (
                                            <button key={o.v} onClick={() => setAutoSettings((p: any) => ({ ...p, delayMode: o.v, randomDelayEnabled: o.v === 'random' }))}
                                                style={{ flex: 1, padding: '7px', background: (autoSettings.delayMode ?? 'random') === o.v ? 'linear-gradient(135deg,#693fe9,#8b5cf6)' : 'rgba(255,255,255,0.06)', border: (autoSettings.delayMode ?? 'random') === o.v ? 'none' : '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: 'white', fontSize: '11px', fontWeight: (autoSettings.delayMode ?? 'random') === o.v ? '700' : '500', cursor: 'pointer' }}>{o.l}</button>
                                        ))}
                                    </div>
                                    {(autoSettings.delayMode ?? 'random') === 'fixed' ? (
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>Fixed delay for all actions:</span>
                                                <input type="number" min="1" max="120" value={autoSettings.baseDelay ?? 5} onChange={e => {
                                                    const v = parseInt(e.target.value) || 1;
                                                    setAutoSettings((p: any) => ({
                                                        ...p, baseDelay: v,
                                                        searchDelayMin: v * 3, searchDelayMax: v * 3, commentDelayMin: v * 5, commentDelayMax: v * 5, networkingDelayMin: v * 4, networkingDelayMax: v * 4,
                                                        beforeOpeningDelay: Math.max(1, Math.round(v * 0.4)), postPageLoadDelay: Math.max(1, Math.round(v * 0.6)),
                                                        beforeLikeDelay: Math.max(1, Math.round(v * 0.2)), beforeCommentDelay: Math.max(1, Math.round(v * 0.4)),
                                                        beforeShareDelay: Math.max(1, Math.round(v * 0.2)), beforeFollowDelay: Math.max(1, Math.round(v * 0.2)),
                                                        postWriterPageLoad: Math.max(1, Math.round(v * 0.6)), postWriterClick: Math.max(1, Math.round(v * 0.2)),
                                                        postWriterTyping: Math.max(1, Math.round(v * 0.2)), postWriterSubmit: Math.max(1, Math.round(v * 0.4)),
                                                        automationStartDelay: v * 2, networkingStartDelay: v * 2, importStartDelay: v * 2,
                                                        randomIntervalMin: 0, randomIntervalMax: 0
                                                    }));
                                                }}
                                                    style={{ width: '50px', padding: '5px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#34d399', fontSize: '14px', textAlign: 'center', fontWeight: '700' }} />
                                                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>sec</span>
                                            </div>
                                            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px', marginTop: '4px' }}>All delays below auto-calculated from this value. No random jitter.</div>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>Jitter</span>
                                            <input type="number" min="0" max="60" value={autoSettings.randomIntervalMin ?? 3} onChange={e => setAutoSettings((p: any) => ({ ...p, randomIntervalMin: parseInt(e.target.value) || 0 }))}
                                                style={{ width: '42px', padding: '4px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', fontSize: '12px', textAlign: 'center' }} />
                                            <span style={{ color: 'rgba(255,255,255,0.3)' }}>–</span>
                                            <input type="number" min="0" max="60" value={autoSettings.randomIntervalMax ?? 10} onChange={e => setAutoSettings((p: any) => ({ ...p, randomIntervalMax: parseInt(e.target.value) || 0 }))}
                                                style={{ width: '42px', padding: '4px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', fontSize: '12px', textAlign: 'center' }} />
                                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>sec extra</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Daily Limits */}
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <h4 style={{ color: 'white', fontSize: '12px', fontWeight: '700', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '5px' }}>{miniIcon('M18 20V10 M12 20V4 M6 20v-6', 'white', 12)} Daily Limits — stops when reached</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                                    {[
                                        { key: 'dailyCommentLimit', label: 'Comments', icon: 'C' },
                                        { key: 'dailyLikeLimit', label: 'Likes', icon: 'L' },
                                        { key: 'dailyShareLimit', label: 'Shares', icon: 'S' },
                                        { key: 'dailyFollowLimit', label: 'Follows', icon: 'F' },
                                    ].map(f => (
                                        <div key={f.key} style={{ textAlign: 'center' }}>
                                            <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', display: 'block', marginBottom: '3px' }}>{f.icon} {f.label}</label>
                                            <input type="number" min="0" max="500" value={autoSettings[f.key]} onChange={e => setAutoSettings((p: any) => ({ ...p, [f.key]: parseInt(e.target.value) || 0 }))}
                                                style={{ width: '100%', padding: '6px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '14px', textAlign: 'center', fontWeight: '700' }} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Start Delays — before each task type begins */}
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <h4 style={{ color: 'white', fontSize: '12px', fontWeight: '700', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '5px' }}>{miniIcon('M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7z', 'white', 12)} Start Delays — wait before task begins (sec)</h4>
                                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', marginBottom: '8px' }}>How long to wait before each task type starts running. Set 0 to start immediately.</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                                    {[
                                        { key: 'automationStartDelay', label: 'Automation' },
                                        { key: 'networkingStartDelay', label: 'Networking' },
                                        { key: 'importStartDelay', label: 'Import' },
                                        { key: 'taskInitDelay', label: 'Task Init' },
                                    ].map(f => (
                                        <div key={f.key} style={{ textAlign: 'center' }}>
                                            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '9px', marginBottom: '2px' }}>{f.label}</div>
                                            <input type="number" min="0" max="120" value={autoSettings[f.key] ?? 0} onChange={e => setAutoSettings((p: any) => ({ ...p, [f.key]: parseInt(e.target.value) || 0 }))}
                                                style={{ width: '100%', padding: '5px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fbbf24', fontSize: '13px', textAlign: 'center', fontWeight: '700' }} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Between-Actions Delays — MOST IMPORTANT for safety */}
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(139,92,246,0.2)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <h4 style={{ color: 'white', fontSize: '12px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>{miniIcon('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', 'white', 12)} Between-Actions Delays — keeps account safe</h4>
                                    <span style={{ color: '#a78bfa', fontSize: '10px', fontWeight: '600', background: 'rgba(139,92,246,0.15)', padding: '2px 8px', borderRadius: '4px' }}>SAFETY CRITICAL</span>
                                </div>
                                {(autoSettings.delayMode ?? 'random') === 'fixed' ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                                        {[
                                            { label: 'Between Posts (search)', key: 'searchDelayMin' },
                                            { label: 'Between Posts (comment)', key: 'commentDelayMin' },
                                            { label: 'Between Connections', key: 'networkingDelayMin' },
                                        ].map(d => (
                                            <div key={d.label} style={{ textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', marginBottom: '4px' }}>{d.label}</div>
                                                <div style={{ color: '#34d399', fontSize: '16px', fontWeight: '700' }}>{autoSettings[d.key] ?? 15}s</div>
                                                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px' }}>fixed (no range)</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                                        {[
                                            { label: 'Between Posts (search)', minKey: 'searchDelayMin', maxKey: 'searchDelayMax', presets: [[5, 12], [10, 25], [15, 30], [30, 60], [60, 120]] },
                                            { label: 'Between Posts (comment)', minKey: 'commentDelayMin', maxKey: 'commentDelayMax', presets: [[8, 20], [15, 35], [25, 60], [45, 90], [60, 120]] },
                                            { label: 'Between Connections', minKey: 'networkingDelayMin', maxKey: 'networkingDelayMax', presets: [[8, 20], [15, 35], [20, 45], [30, 60], [60, 120]] },
                                        ].map(d => (
                                            <div key={d.label}>
                                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', marginBottom: '5px' }}>{d.label} (sec)</div>
                                                <div style={{ display: 'flex', gap: '4px', marginBottom: '6px', flexWrap: 'wrap' }}>
                                                    {d.presets.map(([mn, mx]) => {
                                                        const on = autoSettings[d.minKey] === mn && autoSettings[d.maxKey] === mx;
                                                        return <button key={`${mn}-${mx}`} onClick={() => setAutoSettings((p: any) => ({ ...p, [d.minKey]: mn, [d.maxKey]: mx }))} style={{ padding: '3px 7px', background: on ? 'linear-gradient(135deg,#693fe9,#8b5cf6)' : 'rgba(255,255,255,0.06)', border: on ? 'none' : '1px solid rgba(255,255,255,0.1)', borderRadius: '5px', color: 'white', fontSize: '10px', cursor: 'pointer', fontWeight: on ? '700' : '400' }}>{mn}–{mx}</button>;
                                                    })}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <input type="number" min="1" max="600" value={autoSettings[d.minKey]} onChange={e => setAutoSettings((p: any) => ({ ...p, [d.minKey]: parseInt(e.target.value) || 1 }))}
                                                        style={{ width: '50px', padding: '4px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', fontSize: '12px', textAlign: 'center' }} />
                                                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>–</span>
                                                    <input type="number" min="1" max="600" value={autoSettings[d.maxKey]} onChange={e => setAutoSettings((p: any) => ({ ...p, [d.maxKey]: parseInt(e.target.value) || 1 }))}
                                                        style={{ width: '50px', padding: '4px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', fontSize: '12px', textAlign: 'center' }} />
                                                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>sec</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Per-Action Delays + Post Writer Delays — two columns */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <h4 style={{ color: 'white', fontSize: '12px', fontWeight: '700', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '5px' }}>{miniIcon('M13 2L3 14h9l-1 8 10-12h-9l1-8z', 'white', 12)} Per-Action Delays (sec)</h4>
                                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', marginBottom: '8px' }}>{(autoSettings.delayMode ?? 'random') === 'fixed' ? 'Auto-set from fixed delay value above' : 'Small pauses before each click — keep low (1-5s)'}</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                                        {[
                                            { key: 'beforeOpeningDelay', label: 'Open Post' },
                                            { key: 'postPageLoadDelay', label: 'Page Load' },
                                            { key: 'beforeLikeDelay', label: 'Like' },
                                            { key: 'beforeCommentDelay', label: 'Comment' },
                                            { key: 'beforeShareDelay', label: 'Reshare' },
                                            { key: 'beforeFollowDelay', label: 'Follow' },
                                        ].map(f => (
                                            <div key={f.key} style={{ textAlign: 'center' }}>
                                                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '9px', marginBottom: '2px' }}>{f.label}</div>
                                                <input type="number" min="0" max="60" value={autoSettings[f.key] ?? 1}
                                                    readOnly={(autoSettings.delayMode ?? 'random') === 'fixed'}
                                                    onChange={e => { if ((autoSettings.delayMode ?? 'random') !== 'fixed') setAutoSettings((p: any) => ({ ...p, [f.key]: parseInt(e.target.value) || 0 })); }}
                                                    style={{ width: '100%', padding: '4px', background: (autoSettings.delayMode ?? 'random') === 'fixed' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#34d399', fontSize: '13px', textAlign: 'center', fontWeight: '700', cursor: (autoSettings.delayMode ?? 'random') === 'fixed' ? 'default' : 'text' }} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <h4 style={{ color: 'white', fontSize: '12px', fontWeight: '700', margin: '0 0 8px 0' }}>Post Writer Delays (sec)</h4>
                                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', marginBottom: '8px' }}>{(autoSettings.delayMode ?? 'random') === 'fixed' ? 'Auto-set from fixed delay value above' : 'For AI post writing — minimal DOM waits'}</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                                        {[
                                            { key: 'postWriterPageLoad', label: 'Page Load' },
                                            { key: 'postWriterClick', label: 'Click Compose' },
                                            { key: 'postWriterTyping', label: 'Before Type' },
                                            { key: 'postWriterSubmit', label: 'Before Submit' },
                                        ].map(f => (
                                            <div key={f.key} style={{ textAlign: 'center' }}>
                                                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '9px', marginBottom: '2px' }}>{f.label}</div>
                                                <input type="number" min="0" max="60" value={autoSettings[f.key] ?? 1}
                                                    readOnly={(autoSettings.delayMode ?? 'random') === 'fixed'}
                                                    onChange={e => { if ((autoSettings.delayMode ?? 'random') !== 'fixed') setAutoSettings((p: any) => ({ ...p, [f.key]: parseInt(e.target.value) || 0 })); }}
                                                    style={{ width: '100%', padding: '4px', background: (autoSettings.delayMode ?? 'random') === 'fixed' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#34d399', fontSize: '13px', textAlign: 'center', fontWeight: '700', cursor: (autoSettings.delayMode ?? 'random') === 'fixed' ? 'default' : 'text' }} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Human Simulation */}
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                                <span style={{ color: 'white', fontSize: '12px', fontWeight: '700' }}>Human Simulation</span>
                                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                                    {[
                                        { key: 'mouseMovement', label: 'Mouse Curves' },
                                        { key: 'scrollSimulation', label: 'Random Scroll' },
                                        { key: 'readingPause', label: 'Reading Pause' },
                                    ].map(f => (
                                        <label key={f.key} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'rgba(255,255,255,0.7)', fontSize: '11px', cursor: 'pointer' }}>
                                            <input type="checkbox" checked={autoSettings[f.key]} onChange={e => setAutoSettings((p: any) => ({ ...p, [f.key]: e.target.checked }))}
                                                style={{ accentColor: '#693fe9', width: '14px', height: '14px' }} />
                                            {f.label}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Save Button */}
                            <button onClick={() => saveAutoSettings(autoSettings)} disabled={autoSettingsSaving}
                                style={{ width: '100%', padding: '13px', background: autoSettingsSaving ? 'rgba(105,63,233,0.4)' : 'linear-gradient(135deg, #693fe9, #8b5cf6)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: autoSettingsSaving ? 'wait' : 'pointer', boxShadow: '0 4px 20px rgba(105,63,233,0.3)' }}>
                                {autoSettingsSaving ? 'Saving...' : 'Save All Settings'}
                            </button>

                            {/* Live Activity Timeline */}
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <h4 style={{ color: 'white', fontSize: '12px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>{miniIcon('M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7z M2 12h20', 'white', 12)} Live Activity Log</h4>
                                    <button onClick={() => loadLiveActivity()} disabled={liveActivityLoading}
                                        style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: 'rgba(255,255,255,0.7)', fontSize: '10px', cursor: 'pointer' }}>
                                        {liveActivityLoading ? '...' : 'Refresh'}
                                    </button>
                                </div>
                                <div style={{ maxHeight: '280px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '11px', lineHeight: '1.6' }}>
                                    {liveActivityLogs.length === 0 ? (
                                        <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '20px', fontSize: '11px' }}>
                                            No activity yet. Extension will log actions here in real-time.
                                        </div>
                                    ) : (
                                        liveActivityLogs.map((log: any) => {
                                            const icons: any = { like: 'L', comment: 'C', share: 'S', follow: 'F', connect: 'K', post: 'P', delay: 'D', start: '>', stop: 'X', error: '!', info: 'i' };
                                            const colors: any = { success: '#34d399', warning: '#fbbf24', error: '#f87171', info: 'rgba(255,255,255,0.6)' };
                                            const icon = icons[log.action] || 'i';
                                            const color = colors[log.level] || colors.info;
                                            const time = new Date(log.createdAt).toLocaleTimeString();
                                            return (
                                                <div key={log.id} style={{ display: 'flex', gap: '8px', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                    <span style={{ color: 'rgba(255,255,255,0.3)', minWidth: '65px', fontSize: '10px' }}>{time}</span>
                                                    <span>{icon}</span>
                                                    <span style={{ color, flex: 1 }}>{log.message}</span>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                        </>)}
                    </div>

    );
}
```

---

### components\OverviewTab.tsx

```
// @ts-nocheck
export default function OverviewTab(props: any) {
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

    return (
                    <>
                        {/* Stats Cards Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                            {/* Plan Card */}
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(105,63,233,0.2) 0%, rgba(139,92,246,0.1) 100%)',
                                padding: '24px',
                                borderRadius: '20px',
                                border: '1px solid rgba(105,63,233,0.3)'
                            }}>
                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>{t('overviewTab.currentPlan')}</div>
                                <div style={{ fontSize: '28px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>{user?.plan?.name || 'Free'}</div>
                                <div style={{ fontSize: '14px', color: '#10b981' }}>{t('overviewTab.activePlan')}</div>
                            </div>

                            {/* Referral Earnings */}
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(217,119,6,0.1) 100%)',
                                padding: '24px',
                                borderRadius: '20px',
                                border: '1px solid rgba(245,158,11,0.3)'
                            }}>
                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>{t('overviewTab.referralEarnings')}</div>
                                <div style={{ fontSize: '28px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>${(referralData?.stats.commission || 0).toFixed(2)}</div>
                                <div style={{ fontSize: '14px', color: '#f59e0b' }}>{referralData?.stats.totalPaidReferrals || 0} {t('overviewTab.paidUsers')}</div>
                            </div>

                            {/* Total Referrals */}
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(5,150,105,0.1) 100%)',
                                padding: '24px',
                                borderRadius: '20px',
                                border: '1px solid rgba(16,185,129,0.3)'
                            }}>
                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>{t('overviewTab.totalReferrals')}</div>
                                <div style={{ fontSize: '28px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>{referralData?.stats.totalReferrals || 0}</div>
                                <div style={{ fontSize: '14px', color: '#10b981' }}>{t('overviewTab.usersJoined')}</div>
                            </div>

                            {/* Member Since */}
                            <div style={{
                                background: 'rgba(255,255,255,0.05)',
                                padding: '24px',
                                borderRadius: '20px',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>{t('overviewTab.memberSince')}</div>
                                <div style={{ fontSize: '20px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</div>
                                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>{user?.email}</div>
                            </div>
                        </div>

                        {/* LinkedIn Profile Stats (Voyager Data) */}
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(0,119,181,0.15) 0%, rgba(0,77,128,0.08) 100%)',
                            padding: '24px',
                            borderRadius: '20px',
                            border: '1px solid rgba(0,119,181,0.25)',
                            marginBottom: '30px'
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

                            {/* Experience Section */}
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

                            {/* Education Section */}
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
                        </div>

                        {/* Recent LinkedIn Posts Card */}
                        {voyagerData?.recentPosts && voyagerData.recentPosts.length > 0 && (
                            <div style={{
                                background: 'rgba(255,255,255,0.05)',
                                padding: '24px',
                                borderRadius: '20px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                marginBottom: '30px'
                            }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {miniIcon('M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z', '#a78bfa', 16)} Recent Posts Engagement
                                </h3>
                                <div style={{ display: 'grid', gap: '10px' }}>
                                    {voyagerData.recentPosts.map((post: any, i: number) => (
                                        <div key={i} style={{ background: 'rgba(255,255,255,0.04)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    {post.date && <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginBottom: '4px' }}>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>}
                                                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>
                                                        {post.text || '(No text preview)'}
                                                    </div>
                                                    {post.url && (
                                                        <a href={post.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: '#38bdf8', textDecoration: 'none', marginTop: '4px', display: 'inline-block' }}>View on LinkedIn →</a>
                                                    )}
                                                </div>
                                                <div style={{ display: 'flex', gap: '14px', flexShrink: 0, alignItems: 'center' }}>
                                                    <span style={{ fontSize: '12px', color: '#f87171', display: 'flex', alignItems: 'center', gap: '4px' }}>♥ {post.likes || 0}</span>
                                                    <span style={{ fontSize: '12px', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '4px' }}>💬 {post.comments || 0}</span>
                                                    <span style={{ fontSize: '12px', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>↗ {post.shares || 0}</span>
                                                    {post.views != null && <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '4px' }}>👁 {post.views.toLocaleString()}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quick Usage Summary */}
                        <div style={{
                            background: 'rgba(255,255,255,0.05)',
                            padding: '24px',
                            borderRadius: '20px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            marginBottom: '30px'
                        }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>{miniIcon('M18 20V10 M12 20V4 M6 20v-6', 'white', 16)} Today&apos;s Usage</h3>
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
```

---

### components\ReferralsTab.tsx

```
// @ts-nocheck
export default function ReferralsTab(props: any) {
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

    return (
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(105,63,233,0.15) 0%, rgba(139,92,246,0.1) 100%)',
                        padding: '30px',
                        borderRadius: '20px',
                        border: '1px solid rgba(105,63,233,0.2)'
                    }}>
                        <div style={{ marginBottom: '30px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'white', marginBottom: '12px' }}>Your Referral Link</h3>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <input type="text" readOnly value={referralData?.referralLink || ''} style={{ flex: 1, minWidth: '250px', padding: '14px 18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '14px' }} />
                                <button onClick={() => copyToClipboard(referralData?.referralLink || '')} style={{ padding: '14px 28px', background: copied ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>{copied ? 'Copied!' : 'Copy'}</button>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                                <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=Check out Kommentify!&url=${encodeURIComponent(referralData?.referralLink || '')}`, '_blank')} style={{ padding: '10px 20px', background: 'rgba(29,161,242,0.2)', color: '#1DA1F2', border: '1px solid rgba(29,161,242,0.3)', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>𝕏 Twitter</button>
                                <button onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralData?.referralLink || '')}`, '_blank')} style={{ padding: '10px 20px', background: 'rgba(10,102,194,0.2)', color: '#0A66C2', border: '1px solid rgba(10,102,194,0.3)', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>LinkedIn</button>
                                <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent('Check out Kommentify! ' + (referralData?.referralLink || ''))}`, '_blank')} style={{ padding: '10px 20px', background: 'rgba(37,211,102,0.2)', color: '#25D366', border: '1px solid rgba(37,211,102,0.3)', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>WhatsApp</button>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '30px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
                                <div style={{ fontSize: '32px', fontWeight: '700', color: 'white' }}>{referralData?.stats.totalReferrals || 0}</div>
                                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Total Referrals</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
                                <div style={{ fontSize: '32px', fontWeight: '700', color: 'white' }}>{referralData?.stats.totalPaidReferrals || 0}</div>
                                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Paid Users</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
                                <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b' }}>${(referralData?.stats.commission || 0).toFixed(2)}</div>
                                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Your Earnings</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
                                <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>30%</div>
                                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Commission Rate</div>
                            </div>
                        </div>
                        {referralData && referralData.referrals.length > 0 && (
                            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                                            <th style={{ padding: '16px', textAlign: 'left', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '600' }}>Name</th>
                                            <th style={{ padding: '16px', textAlign: 'left', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '600' }}>Joined</th>
                                            <th style={{ padding: '16px', textAlign: 'left', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '600' }}>Plan</th>
                                            <th style={{ padding: '16px', textAlign: 'right', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '600' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {referralData.referrals.map((ref) => (
                                            <tr key={ref.id} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                                                <td style={{ padding: '16px', color: 'white', fontSize: '14px' }}>{ref.name || 'Anonymous'}</td>
                                                <td style={{ padding: '16px', color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>{new Date(ref.joinedAt).toLocaleDateString()}</td>
                                                <td style={{ padding: '16px', color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>{ref.planName}</td>
                                                <td style={{ padding: '16px', textAlign: 'right' }}>
                                                    {ref.hasPaid ? (
                                                        <span style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>Paid</span>
                                                    ) : (
                                                        <span style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', padding: '6px 12px', borderRadius: '20px', fontSize: '12px' }}>Free</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

    );
}
```

---

### components\TasksTab.tsx

```
// @ts-nocheck
export default function TasksTab(props: any) {
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

    return (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>{miniIcon('M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2 M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z', 'white', 18)} Extension Tasks</h3>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => loadTasks()}
                                    style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.15s ease', transform: 'scale(1)' }}
                                    onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.93)')}
                                    onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
                                    Refresh
                                </button>
                                <button onClick={stopAllTasks}
                                    style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 15px rgba(239,68,68,0.4)', transition: 'all 0.15s ease', transform: 'scale(1)' }}
                                    onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.93)')}
                                    onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
                                    Stop All Tasks
                                </button>
                            </div>
                        </div>
                        {/* Task Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                            {[
                                { label: 'Pending', count: tasks.filter(t => t.status === 'pending').length, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
                                { label: 'In Progress', count: tasks.filter(t => t.status === 'in_progress').length, color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
                                { label: 'Completed', count: tasks.filter(t => t.status === 'completed' || t.status === 'completed_manual').length, color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
                                { label: 'Failed/Cancelled', count: tasks.filter(t => t.status === 'failed' || t.status === 'cancelled').length, color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
                            ].map((s, i) => (
                                <div key={i} style={{ background: s.bg, padding: '20px', borderRadius: '16px', textAlign: 'center', border: `1px solid ${s.color}33` }}>
                                    <div style={{ fontSize: '28px', fontWeight: '700', color: s.color }}>{s.count}</div>
                                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{s.label}</div>
                                </div>
                            ))}
                        </div>
                        {/* Queue Info Banner */}
                        {tasks.filter(t => t.status === 'pending').length > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', background: 'rgba(245,158,11,0.1)', borderRadius: '10px', border: '1px solid rgba(245,158,11,0.25)', marginBottom: '16px' }}>
                                <span>{miniIcon('M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 6v6l4 2', '#f59e0b', 14)}</span>
                                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                                    <strong style={{ color: '#fbbf24' }}>{tasks.filter(t => t.status === 'pending').length} task(s) queued</strong> — only one task runs at a time. Each pending task waits for the current one to finish before starting.
                                </span>
                            </div>
                        )}
                        {/* Task List */}
                        {tasksLoading ? (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.5)' }}>Loading tasks...</div>
                        ) : tasks.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 0' }}>
                                <div style={{ marginBottom: '16px' }}>{miniIcon('M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2 M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z', 'rgba(255,255,255,0.5)', 48)}</div>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px' }}>No tasks in the last 24 hours.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {tasks.map((task: any, taskIdx: number) => {
                                    const statusConfig: Record<string, { icon: string; color: string; bg: string }> = {
                                        pending: { icon: 'P', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
                                        in_progress: { icon: '>', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
                                        completed: { icon: 'OK', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
                                        completed_manual: { icon: 'OK', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
                                        failed: { icon: 'X', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
                                        cancelled: { icon: '--', color: '#6b7280', bg: 'rgba(107,114,128,0.15)' },
                                    };
                                    const sc = statusConfig[task.status] || statusConfig.pending;
                                    const cmdLabel = task.command === 'post_to_linkedin' ? 'Post to LinkedIn' :
                                        task.command === 'scrape_feed_now' ? 'Scrape Feed' :
                                            task.command === 'scrape_profile' ? 'Scrape Profile' :
                                                task.command === 'bulk_comment' ? 'Bulk Comment' :
                                                    task.command === 'networking' ? 'Networking' :
                                                        task.command === 'import_profiles' ? 'Import Profiles' : task.command;
                                    // Calculate pending countdown
                                    let pendingCountdown = '';
                                    if (task.status === 'pending' && task.createdAt) {
                                        const startDelaySec = autoSettings?.automationStartDelay ?? 30;
                                        const created = new Date(task.createdAt).getTime();
                                        const executeAt = created + (startDelaySec * 1000);
                                        const remaining = Math.max(0, Math.round((executeAt - Date.now()) / 1000));
                                        pendingCountdown = remaining > 0 ? `Starts in ${remaining}s` : 'Starting soon...';
                                    }
                                    return (
                                        <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', background: task.status === 'pending' ? 'rgba(245,158,11,0.07)' : 'rgba(255,255,255,0.05)', padding: '16px 20px', borderRadius: '14px', border: task.status === 'pending' ? '1px solid rgba(245,158,11,0.2)' : '1px solid rgba(255,255,255,0.08)' }}>
                                            {task.status === 'in_progress' ? (
                                                <span style={{ fontSize: '20px', animation: 'spin 1s linear infinite', display: 'inline-block' }}>{sc.icon}</span>
                                            ) : (
                                                <span style={{ fontSize: '20px' }}>{sc.icon}</span>
                                            )}
                                            <div style={{ flex: 1 }}>
                                                <div style={{ color: 'white', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {cmdLabel}
                                                    {taskIdx === 0 && task.status === 'pending' && <span style={{ fontSize: '10px', background: 'rgba(245,158,11,0.2)', color: '#fbbf24', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>NEXT</span>}
                                                </div>
                                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '2px' }}>
                                                    {task.createdAt ? new Date(task.createdAt).toLocaleString() : ''}
                                                    {task.data?.content && <span> · {task.data.content.substring(0, 50)}…</span>}
                                                    {task.data?.profileUrl && <span> · {task.data.profileUrl}</span>}
                                                </div>
                                                {task.status === 'pending' && pendingCountdown && (
                                                    <div style={{ color: '#fbbf24', fontSize: '11px', marginTop: '3px', fontWeight: '600' }}>{pendingCountdown}</div>
                                                )}
                                            </div>
                                            <span style={{ padding: '4px 12px', background: sc.bg, color: sc.color, borderRadius: '20px', fontSize: '12px', fontWeight: '600', border: `1px solid ${sc.color}33`, whiteSpace: 'nowrap' }}>
                                                {task.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

    );
}
```

---

### components\TrendingPostsTab.tsx

```
// @ts-nocheck
export default function TrendingPostsTab(props: any) {
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

    return (
                    <div>
                        {/* Scrape Feed Now — compact */}
                        <div style={{ background: 'rgba(16,185,129,0.08)', padding: '14px 16px', borderRadius: '14px', border: '1px solid rgba(16,185,129,0.2)', marginBottom: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <h3 style={{ color: '#34d399', fontSize: '14px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>{miniIcon('M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z', '#34d399', 14)} Scrape Feed Now</h3>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    {feedScrapePolling && (
                                        <button onClick={stopFeedScrape}
                                            style={{ padding: '7px 14px', background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {miniIcon('M6 4h4v16H6z M14 4h4v16h-4z', '#f87171', 12)} Stop
                                        </button>
                                    )}
                                    <button disabled={feedScrapePolling} onClick={async () => {
                                        try {
                                            const token = localStorage.getItem('authToken');
                                            if (!token) { setTrendingStatus('Not authenticated'); return; }
                                            setTrendingStatus('Sending scrape task to extension...');
                                            await saveFeedSchedule();
                                            const res = await fetch('/api/extension/command', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                                body: JSON.stringify({ command: 'scrape_feed_now', data: { durationMinutes: scheduleDuration, minLikes: scheduleMinLikes, minComments: scheduleMinComments, keywords: scheduleKeywords } }),
                                            });
                                            const data = await res.json();
                                            if (data.success && data.commandId) {
                                                setTrendingStatus('');
                                                startFeedScrapePolling(data.commandId);
                                            } else if (data.success) {
                                                setTrendingStatus('Scrape task sent! Extension will open a new window and start scraping.');
                                            } else {
                                                setTrendingStatus(data.error || 'Failed to send task');
                                            }
                                        } catch (e: any) { setTrendingStatus('Error: ' + e.message); }
                                    }} style={{ padding: '7px 16px', background: feedScrapePolling ? 'rgba(105,63,233,0.3)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: feedScrapePolling ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', boxShadow: feedScrapePolling ? 'none' : '0 2px 8px rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', gap: '4px', opacity: feedScrapePolling ? 0.5 : 1 }}>{miniIcon('M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z', 'white', 12)} {feedScrapePolling ? 'Scraping...' : 'Start Now'}</button>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'auto auto auto 1fr', gap: '8px', alignItems: 'end', marginBottom: '10px' }}>
                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontWeight: '600', marginBottom: '3px' }}>{miniIcon('M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 6v6l4 2', 'rgba(255,255,255,0.5)', 11)} Duration</label>
                                    <select value={scheduleDuration} onChange={e => setScheduleDuration(parseInt(e.target.value))} style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', fontSize: '12px' }}>
                                        <option value="1">1 min</option><option value="2">2 min</option><option value="3">3 min</option><option value="5">5 min</option><option value="10">10 min</option><option value="15">15 min</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontWeight: '600', marginBottom: '3px' }}>{miniIcon('M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z', '#ec4899', 11)} Min Likes</label>
                                    <input type="number" value={scheduleMinLikes} onChange={e => setScheduleMinLikes(parseInt(e.target.value) || 0)} min={0} style={{ width: '60px', padding: '6px 8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', fontSize: '12px', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontWeight: '600', marginBottom: '3px' }}>{miniIcon('M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z', '#8b5cf6', 11)} Min Comments</label>
                                    <input type="number" value={scheduleMinComments} onChange={e => setScheduleMinComments(parseInt(e.target.value) || 0)} min={0} style={{ width: '60px', padding: '6px 8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', fontSize: '12px', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontWeight: '600', marginBottom: '3px' }}>{miniIcon('M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4', 'rgba(255,255,255,0.5)', 11)} Keywords</label>
                                    <input type="text" value={scheduleKeywords} onChange={e => setScheduleKeywords(e.target.value)} placeholder="AI, startup, SaaS..." style={{ width: '100%', padding: '6px 8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', fontSize: '12px', outline: 'none' }} />
                                </div>
                            </div>
                            {/* Daily Schedule — compact inline */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', paddingTop: '8px', borderTop: '1px solid rgba(16,185,129,0.15)' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontWeight: '700', whiteSpace: 'nowrap', textTransform: 'uppercase' as any }}>{miniIcon('M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 6v6l4 2', 'rgba(255,255,255,0.5)', 10)} Daily:</span>
                                {scheduleTimesInput.map((time, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(105,63,233,0.2)', border: '1px solid rgba(105,63,233,0.35)', borderRadius: '6px', padding: '2px 6px' }}>
                                        <input type="time" value={time} onChange={e => { const arr = [...scheduleTimesInput]; arr[i] = e.target.value; setScheduleTimesInput(arr); }}
                                            style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '11px', outline: 'none', width: '62px' }} />
                                        <button onClick={() => setScheduleTimesInput(scheduleTimesInput.filter((_, idx) => idx !== i))}
                                            style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '12px', padding: '0 1px', lineHeight: 1 }}>×</button>
                                    </div>
                                ))}
                                <button onClick={() => {
                                    const now = new Date(); now.setMinutes(now.getMinutes() + 2);
                                    setScheduleTimesInput([...scheduleTimesInput, `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`]);
                                }}
                                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px dashed rgba(255,255,255,0.25)', borderRadius: '6px', padding: '3px 8px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '10px' }}>+ Add</button>
                                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div onClick={() => setScheduleActive(!scheduleActive)} style={{ width: '32px', height: '18px', background: scheduleActive ? '#10b981' : 'rgba(255,255,255,0.2)', borderRadius: '9px', padding: '2px', cursor: 'pointer', transition: 'background 0.2s' }}>
                                        <div style={{ width: '14px', height: '14px', background: 'white', borderRadius: '7px', transition: 'transform 0.2s', transform: scheduleActive ? 'translateX(14px)' : 'translateX(0)' }} />
                                    </div>
                                    <span style={{ color: scheduleActive ? '#10b981' : 'rgba(255,255,255,0.4)', fontSize: '10px', fontWeight: '600' }}>{scheduleActive ? 'ON' : 'OFF'}</span>
                                    <button onClick={saveFeedSchedule} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 10px', background: 'rgba(105,63,233,0.25)', border: '1px solid rgba(105,63,233,0.4)', borderRadius: '6px', color: '#a78bfa', cursor: 'pointer', fontSize: '10px', fontWeight: '600' }}>{miniIcon('M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z M17 21v-8H7v8 M7 3v5h8', '#a78bfa', 11)} Save</button>
                                </div>
                            </div>
                        </div>
                        {/* Live Feed Scrape Status */}
                        {feedScrapeStatus && (
                            <div style={{
                                background: feedScrapeStatus.status === 'completed' ? 'rgba(16,185,129,0.1)' : feedScrapeStatus.status === 'failed' ? 'rgba(239,68,68,0.1)' : 'rgba(105,63,233,0.08)',
                                padding: '16px 18px', borderRadius: '14px', marginBottom: '14px',
                                border: `1px solid ${feedScrapeStatus.status === 'completed' ? 'rgba(16,185,129,0.3)' : feedScrapeStatus.status === 'failed' ? 'rgba(239,68,68,0.3)' : 'rgba(105,63,233,0.25)'}`,
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {feedScrapeStatus.status === 'in_progress' && (
                                            <div style={{ width: '10px', height: '10px', background: '#4ade80', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />
                                        )}
                                        {feedScrapeStatus.status === 'completed' && miniIcon('M9 11l3 3L22 4', '#10b981', 16)}
                                        {feedScrapeStatus.status === 'failed' && miniIcon('M18 6L6 18 M6 6l12 12', '#ef4444', 16)}
                                        {feedScrapeStatus.status === 'pending' && miniIcon('M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 6v6l4 2', '#fbbf24', 16)}
                                        <span style={{ color: 'white', fontSize: '14px', fontWeight: '700' }}>
                                            {feedScrapeStatus.status === 'in_progress' ? 'Scraping LinkedIn Feed...' : feedScrapeStatus.status === 'completed' ? 'Scrape Complete' : feedScrapeStatus.status === 'failed' ? 'Scrape Failed' : 'Waiting for Extension...'}
                                        </span>
                                    </div>
                                    {(feedScrapeStatus.status === 'completed' || feedScrapeStatus.status === 'failed' || feedScrapeStatus.status === 'cancelled') && (
                                        <button onClick={() => { setFeedScrapeStatus(null); setFeedScrapeCommandId(null); }}
                                            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '16px', cursor: 'pointer', padding: '0 4px' }}>✕</button>
                                    )}
                                </div>
                                {/* Progress details */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '10px' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#4ade80' }}>{feedScrapeStatus.data?.postsFound ?? 0}</div>
                                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>Posts Found</div>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#fbbf24' }}>{feedScrapeStatus.data?.qualifiedPosts ?? 0}</div>
                                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>Qualified</div>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#a78bfa' }}>{feedScrapeStatus.data?.scrollCount ?? 0}</div>
                                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>Scrolls</div>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '18px', fontWeight: '800', color: 'rgba(255,255,255,0.8)' }}>
                                            {feedScrapeStatus.data?.remainingSeconds != null
                                                ? `${Math.floor(feedScrapeStatus.data.remainingSeconds / 60)}:${String(feedScrapeStatus.data.remainingSeconds % 60).padStart(2, '0')}`
                                                : '--:--'}
                                        </div>
                                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>Time Left</div>
                                    </div>
                                </div>
                                {/* Progress bar */}
                                {feedScrapeStatus.status === 'in_progress' && feedScrapeStatus.data?.elapsedSeconds != null && feedScrapeStatus.data?.remainingSeconds != null && (
                                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden', marginBottom: '8px' }}>
                                        <div style={{
                                            height: '100%', borderRadius: '2px', transition: 'width 0.5s ease',
                                            background: 'linear-gradient(90deg, #693fe9, #a78bfa)',
                                            width: `${Math.min(100, (feedScrapeStatus.data.elapsedSeconds / (feedScrapeStatus.data.elapsedSeconds + feedScrapeStatus.data.remainingSeconds)) * 100)}%`
                                        }} />
                                    </div>
                                )}
                                {/* Status message */}
                                {feedScrapeStatus.data?.message && (
                                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontStyle: 'italic' }}>{feedScrapeStatus.data.message}</div>
                                )}
                                <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
                            </div>
                        )}
                        {/* Kommentify Shared Posts — compact */}
                        {sharedPosts.length > 0 && (
                            <div style={{ background: 'rgba(105,63,233,0.06)', padding: '14px 16px', borderRadius: '14px', border: '1px solid rgba(105,63,233,0.2)', marginBottom: '14px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <h3 style={{ color: '#a78bfa', fontSize: '13px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>{miniIcon('M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', '#a78bfa', 13)} Kommentify Curated ({sharedPosts.length})</h3>
                                    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px' }}>Select posts for AI generation</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px', overflowY: 'auto' }}>
                                    {sharedPosts.slice(0, 10).map((p: any, i: number) => {
                                        const sel = trendingSelectedPosts.includes(p.id);
                                        return (
                                            <div key={p.id || i} onClick={() => { setTrendingSelectedPosts(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id]); }}
                                                style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: sel ? 'rgba(105,63,233,0.12)' : 'rgba(255,255,255,0.04)', padding: '10px 12px', borderRadius: '8px', border: sel ? '1px solid rgba(105,63,233,0.4)' : '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}>
                                                <input type="checkbox" checked={sel} readOnly style={{ accentColor: '#693fe9', width: '14px', height: '14px', marginTop: '1px', flexShrink: 0, cursor: 'pointer' }} />
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '10px', marginBottom: '2px' }}>{p.authorName || 'Unknown'} · {miniIcon('M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z', '#ec4899', 10)} {p.likes} · {miniIcon('M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z', '#8b5cf6', 10)} {p.comments}</div>
                                                    <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px', lineHeight: '1.4', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>{p.postContent?.substring(0, 180)}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        {sharedPostsLoading && <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '12px' }}>Loading Kommentify posts...</div>}

                        {/* Period Filters + Search — combined compact row */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                            {[{ id: 'today', label: 'Today' }, { id: 'week', label: 'Week' }, { id: 'month', label: 'Month' }, { id: 'all', label: 'All' }].map(p => (
                                <button key={p.id} onClick={() => { setTrendingPeriod(p.id); loadSavedPosts(1, p.id); }}
                                    style={{ padding: '6px 14px', background: trendingPeriod === p.id ? 'linear-gradient(135deg, #693fe9, #8b5cf6)' : 'rgba(255,255,255,0.06)', border: trendingPeriod === p.id ? 'none' : '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: 'white', fontWeight: trendingPeriod === p.id ? '700' : '500', cursor: 'pointer', fontSize: '12px' }}>
                                    {p.label}
                                </button>
                            ))}
                            <div style={{ flex: 1 }} />
                            <input type="text" value={savedPostsSearch} onChange={e => setSavedPostsSearch(e.target.value)} placeholder="Search posts..."
                                onKeyDown={e => e.key === 'Enter' && loadSavedPosts(1)}
                                style={{ minWidth: '160px', maxWidth: '280px', padding: '7px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(105,63,233,0.25)', borderRadius: '8px', color: 'white', fontSize: '12px', outline: 'none' }} />
                            <select value={savedPostsSortBy} onChange={e => { setSavedPostsSortBy(e.target.value); }}
                                style={{ padding: '7px 8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: 'white', fontSize: '11px' }}>
                                <option value="comments">Comments</option>
                                <option value="likes">Likes</option>
                                <option value="scrapedAt">Date</option>
                            </select>
                            <button onClick={() => loadSavedPosts(1)}
                                style={{ padding: '7px 14px', background: 'linear-gradient(135deg, #693fe9, #8b5cf6)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {miniIcon('M11 17.25a6.25 6.25 0 1 1 0-12.5 6.25 6.25 0 0 1 0 12.5z M16 16l4.5 4.5', 'white', 12)} Search
                            </button>
                        </div>
                        {/* AI Actions Panel — compact */}
                        <div style={{ background: 'rgba(105,63,233,0.06)', padding: '14px 16px', borderRadius: '14px', border: '1px solid rgba(105,63,233,0.2)', marginBottom: '14px' }}>
                            {/* Header row: stats + action buttons */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
                                    <strong style={{ color: 'white' }}>{savedPostsTotal}</strong> posts
                                    {trendingSelectedPosts.length > 0 && <span style={{ marginLeft: '10px', color: '#a78bfa', fontWeight: '600' }}>{trendingSelectedPosts.length} selected <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>(max 10)</span></span>}
                                </div>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                    <button onClick={() => { if (trendingSelectedPosts.length >= 10) setTrendingSelectedPosts([]); else setTrendingSelectedPosts(savedPosts.slice(0, 10).map(p => p.id)); }}
                                        style={{ padding: '6px 12px', background: trendingSelectedPosts.length >= 10 ? 'rgba(105,63,233,0.2)' : 'rgba(255,255,255,0.06)', border: trendingSelectedPosts.length >= 10 ? '1px solid rgba(105,63,233,0.4)' : '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: trendingSelectedPosts.length >= 10 ? '#a78bfa' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '11px' }}>
                                        {trendingSelectedPosts.length >= 10 ? 'Deselect All' : 'Select All'}
                                    </button>
                                    {trendingSelectedPosts.length > 0 && (
                                        <button onClick={async () => {
                                            if (!confirm(`Delete ${trendingSelectedPosts.length} selected posts?`)) return;
                                            const token = localStorage.getItem('authToken');
                                            if (!token) return;
                                            try {
                                                const res = await fetch('/api/scraped-posts/delete-selected', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                                    body: JSON.stringify({ ids: trendingSelectedPosts })
                                                });
                                                if (res.ok) { setTrendingSelectedPosts([]); loadSavedPosts(1); }
                                            } catch (e) { console.error(e); }
                                        }} style={{ padding: '6px 12px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#f87171', cursor: 'pointer', fontSize: '11px' }}>Delete Selected</button>
                                    )}
                                    <button onClick={generateTrendingPosts} disabled={trendingGenerating || trendingSelectedPosts.length === 0}
                                        style={{ padding: '6px 14px', background: trendingGenerating ? 'rgba(105,63,233,0.3)' : 'linear-gradient(135deg, #693fe9, #8b5cf6)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: trendingGenerating ? 'wait' : 'pointer', fontSize: '11px', boxShadow: '0 2px 8px rgba(105,63,233,0.3)' }}>
                                        {trendingGenerating ? 'Generating...' : <><span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>{miniIcon('M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z', 'white', 11)} AI Generate</span></>}
                                    </button>
                                    <button onClick={analyzePosts} disabled={analysisLoading || trendingGeneratedPosts.length === 0}
                                        style={{ padding: '6px 14px', background: analysisLoading ? 'rgba(245,158,11,0.3)' : 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: analysisLoading ? 'wait' : 'pointer', fontSize: '11px' }}>
                                        {analysisLoading ? 'Analyzing...' : <><span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>{miniIcon('M18 20V10 M12 20V4 M6 20v-6', 'white', 11)} Analyze</span></>}
                                    </button>
                                </div>
                            </div>
                            {/* Custom AI Instructions — compact textarea */}
                            <div style={{ marginBottom: '10px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#a78bfa', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>{miniIcon('M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z', '#a78bfa', 12)} Custom AI Instructions</label>
                                <textarea value={trendingCustomPrompt} onChange={e => setTrendingCustomPrompt(e.target.value)}
                                    placeholder="e.g., Focus on SaaS topics, write for startup founders, keep under 200 words, use storytelling..."
                                    rows={2}
                                    style={{ width: '100%', padding: '8px 12px', background: 'rgba(105,63,233,0.08)', border: '1px solid rgba(105,63,233,0.2)', borderRadius: '8px', color: 'white', fontSize: '12px', outline: 'none', resize: 'vertical', lineHeight: '1.5', fontFamily: 'inherit' }} />
                            </div>
                            {/* Model + Language + Hashtags + Profile Data — single compact row */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: '8px', alignItems: 'end' }}>
                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontWeight: '600', marginBottom: '3px' }}>{miniIcon('M4 4h16v16H4z M9 9h6v6H9z M9 2v2 M15 2v2 M9 20v2 M15 20v2 M2 9h2 M2 15h2 M20 9h2 M20 15h2', 'rgba(255,255,255,0.5)', 11)} AI Model</label>
                                    <select value={trendingModel} onChange={e => setTrendingModel(e.target.value)}
                                        style={{ width: '100%', padding: '7px 8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', fontSize: '11px' }}>
                                        {MODEL_OPTIONS.map(m => (<option key={m.id} value={m.id}>{m.name}</option>))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontWeight: '600', marginBottom: '3px' }}>{miniIcon('M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z', 'rgba(255,255,255,0.5)', 11)} Language</label>
                                    <select value={trendingLanguage} onChange={e => setTrendingLanguage(e.target.value)}
                                        style={{ width: '100%', padding: '7px 8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', fontSize: '11px' }}>
                                        <option value="">Auto-detect</option>
                                        <option value="English">English</option><option value="Spanish">Spanish</option><option value="French">French</option>
                                        <option value="German">German</option><option value="Portuguese">Portuguese</option><option value="Italian">Italian</option>
                                        <option value="Dutch">Dutch</option><option value="Russian">Russian</option><option value="Chinese">Chinese</option>
                                        <option value="Japanese">Japanese</option><option value="Korean">Korean</option><option value="Arabic">Arabic</option>
                                        <option value="Hindi">Hindi</option><option value="Urdu">Urdu</option><option value="Turkish">Turkish</option>
                                        <option value="Polish">Polish</option><option value="Swedish">Swedish</option><option value="Indonesian">Indonesian</option>
                                        <option value="Thai">Thai</option><option value="Vietnamese">Vietnamese</option>
                                    </select>
                                </div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.6)', fontSize: '11px', cursor: 'pointer', padding: '7px 0' }}>
                                    <input type="checkbox" checked={trendingIncludeHashtags} onChange={e => setTrendingIncludeHashtags(e.target.checked)} style={{ accentColor: '#693fe9', width: '14px', height: '14px' }} />
                                    {miniIcon('M4 9h16 M4 15h16 M10 3l-2 18 M16 3l-2 18', 'rgba(255,255,255,0.6)', 12)} Tags
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: trendingUseProfileData ? '#10b981' : 'rgba(255,255,255,0.6)', fontSize: '11px', cursor: 'pointer', padding: '7px 0' }}>
                                    <input type="checkbox" checked={trendingUseProfileData} onChange={e => setTrendingUseProfileData(e.target.checked)} style={{ accentColor: '#10b981', width: '14px', height: '14px' }} />
                                    {miniIcon('M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8', trendingUseProfileData ? '#10b981' : 'rgba(255,255,255,0.6)', 12)} Profile
                                </label>
                            </div>
                        </div>
                        {/* Status */}
                        {trendingStatus && (
                            <div style={{ marginBottom: '16px', padding: '10px 16px', background: trendingStatus.includes('Error') || trendingStatus.includes('fail') ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', border: `1px solid ${trendingStatus.includes('Error') || trendingStatus.includes('fail') ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`, borderRadius: '10px', color: trendingStatus.includes('Error') || trendingStatus.includes('fail') ? '#f87171' : '#34d399', fontSize: '13px' }}>
                                {trendingStatus}
                            </div>
                        )}
                        {/* Token Usage Display - Developer Only */}
                        {isDeveloper && trendingTokenUsage && (
                            <div style={{ marginBottom: '16px', padding: '14px 18px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                    {miniIcon('M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z', '#60a5fa', 16)}
                                    <span style={{ color: '#60a5fa', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>{miniIcon('M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z', '#60a5fa', 13)} Developer Token Usage</span>
                                </div>
                                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                    <div>
                                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Model</span>
                                        <div style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>{trendingTokenUsage.modelName}</div>
                                    </div>
                                    <div>
                                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Input Tokens</span>
                                        <div style={{ color: '#34d399', fontSize: '13px', fontWeight: '600' }}>{trendingTokenUsage.inputTokens?.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Output Tokens</span>
                                        <div style={{ color: '#fbbf24', fontSize: '13px', fontWeight: '600' }}>{trendingTokenUsage.outputTokens?.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Input Cost</span>
                                        <div style={{ color: '#34d399', fontSize: '13px', fontWeight: '600' }}>{trendingTokenUsage.inputCost}</div>
                                    </div>
                                    <div>
                                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Output Cost</span>
                                        <div style={{ color: '#fbbf24', fontSize: '13px', fontWeight: '600' }}>{trendingTokenUsage.outputCost}</div>
                                    </div>
                                    <div>
                                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Total Cost</span>
                                        <div style={{ color: '#a78bfa', fontSize: '14px', fontWeight: '700' }}>{trendingTokenUsage.totalCost}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Analysis Results — compact */}
                        {showAnalysis && analysisResults.length > 0 && (
                            <div style={{ marginBottom: '14px', background: 'rgba(245,158,11,0.08)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(245,158,11,0.25)' }}>
                                <h4 style={{ color: '#fbbf24', fontSize: '14px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>{miniIcon('M18 20V10 M12 20V4 M6 20v-6', '#fbbf24', 14)} Viral Potential Analysis</h4>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.15)' }}>
                                                <th style={{ padding: '12px', textAlign: 'left', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '600' }}>Rank</th>
                                                <th style={{ padding: '12px', textAlign: 'left', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '600' }}>Score</th>
                                                <th style={{ padding: '12px', textAlign: 'left', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '600' }}>Post Preview</th>
                                                <th style={{ padding: '12px', textAlign: 'left', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '600' }}>Brutal Feedback</th>
                                                <th style={{ padding: '12px', textAlign: 'left', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '600' }}>Viral Reason</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {analysisResults.map((item: any, i: number) => (
                                                <tr key={i} style={{
                                                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                                                    background: item.isAiGenerated ? 'rgba(105,63,233,0.15)' : 'transparent'
                                                }}>
                                                    <td style={{ padding: '12px', color: 'white', fontWeight: '700', fontSize: '16px' }}>#{i + 1}</td>
                                                    <td style={{ padding: '12px' }}>
                                                        <span style={{
                                                            padding: '4px 12px', borderRadius: '20px', fontWeight: '700', fontSize: '14px',
                                                            background: item.score >= 80 ? 'rgba(16,185,129,0.2)' : item.score >= 60 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)',
                                                            color: item.score >= 80 ? '#34d399' : item.score >= 60 ? '#fbbf24' : '#f87171',
                                                            border: `1px solid ${item.score >= 80 ? 'rgba(16,185,129,0.4)' : item.score >= 60 ? 'rgba(245,158,11,0.4)' : 'rgba(239,68,68,0.4)'}`
                                                        }}>{item.score}/100</span>
                                                    </td>
                                                    <td style={{ padding: '12px', color: 'rgba(255,255,255,0.7)', fontSize: '13px', maxWidth: '250px' }}>
                                                        {item.isAiGenerated && <span style={{ color: '#a78bfa', fontWeight: '700', fontSize: '11px', marginRight: '6px', background: 'rgba(105,63,233,0.3)', padding: '2px 8px', borderRadius: '10px' }}>AI</span>}
                                                        {(() => {
                                                            const idx = (item.postIndex || 1) - 1;
                                                            const selected = savedPosts.filter(p => trendingSelectedPosts.includes(p.id));
                                                            const allMixed = [...selected.map(p => p.postContent || ''), ...trendingGeneratedPosts.map(p => p.content || '')];
                                                            return (allMixed[idx] || '').substring(0, 100) + '...';
                                                        })()}
                                                    </td>
                                                    <td style={{ padding: '12px', color: '#fbbf24', fontSize: '13px', fontWeight: '500', maxWidth: '250px' }}>{item.feedback}</td>
                                                    <td style={{ padding: '12px', color: 'rgba(255,255,255,0.6)', fontSize: '12px', maxWidth: '200px' }}>{item.viralReason}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        {/* Generated Posts Preview — compact */}
                        {trendingShowGenPreview && trendingGeneratedPosts.length > 0 && (
                            <div style={{ marginBottom: '14px', background: 'rgba(105,63,233,0.08)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(105,63,233,0.25)' }}>
                                <h4 style={{ color: '#a78bfa', fontSize: '14px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>{miniIcon('M12 8V4l8 8-8 8v-4H4V8h8z', '#a78bfa', 14)} AI Generated ({trendingGeneratedPosts.length})</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {trendingGeneratedPosts.map((gp: any, i: number) => (
                                        <div key={i} style={{ background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(105,63,233,0.15)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                <span style={{ color: '#a78bfa', fontWeight: '700', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>{miniIcon('M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', '#a78bfa', 12)} {gp.title || `Post ${i + 1}`}</span>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '10px' }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>{miniIcon('M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'rgba(255,255,255,0.6)', 11)} {generatedPostImages[i] ? 'Change' : 'Image'}</span>
                                                        <input type="file" accept="image/*" style={{ display: 'none' }}
                                                            onChange={(e) => { if (e.target.files?.[0]) handleImageAttach(i, e.target.files[0]); }} />
                                                    </label>
                                                    {generatedPostImages[i] && (
                                                        <button onClick={() => setGeneratedPostImages(prev => { const n = { ...prev }; delete n[i]; return n; })}
                                                            style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '12px', padding: '0 2px' }}>✕</button>
                                                    )}
                                                    <button onClick={() => postGeneratedToLinkedIn(gp.content, generatedPostImages[i], i)}
                                                        disabled={postingToLinkedIn[i]}
                                                        style={{ padding: '5px 12px', background: postingToLinkedIn[i] ? 'rgba(105,63,233,0.3)' : 'linear-gradient(135deg, #693fe9, #8b5cf6)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: postingToLinkedIn[i] ? 'wait' : 'pointer', fontSize: '11px' }}>
                                                        {postingToLinkedIn[i] ? '...' : <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>{miniIcon('M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12', 'white', 11)} Post</span>}
                                                    </button>
                                                </div>
                                            </div>
                                            <textarea value={gp.content} onChange={(e) => {
                                                const updated = [...trendingGeneratedPosts];
                                                updated[i] = { ...updated[i], content: e.target.value };
                                                setTrendingGeneratedPosts(updated);
                                            }}
                                                style={{ width: '100%', minHeight: '180px', color: 'rgba(255,255,255,0.8)', fontSize: '13px', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(105,63,233,0.15)', borderRadius: '8px', padding: '10px 12px', outline: 'none', resize: 'vertical', fontFamily: 'system-ui, sans-serif' }} />
                                            {generatedPostImages[i] && (
                                                <img src={generatedPostImages[i]} alt="Attached" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(105,63,233,0.3)', marginTop: '6px' }} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* Posts List — compact cards */}
                        {savedPostsLoading ? (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Loading trending posts...</div>
                        ) : savedPosts.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <div style={{ marginBottom: '10px' }}>{miniIcon('M13 2L3 14h9l-1 8 10-12h-9l1-8z', '#a78bfa', 36)}</div>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>No trending posts yet. Enable post saving in the extension commenter tab.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {savedPosts.map((post: any) => {
                                    const isSelected = trendingSelectedPosts.includes(post.id);
                                    return (
                                        <div key={post.id} onClick={() => {
                                            if (isSelected) setTrendingSelectedPosts(trendingSelectedPosts.filter(id => id !== post.id));
                                            else if (trendingSelectedPosts.length < 10) setTrendingSelectedPosts([...trendingSelectedPosts, post.id]);
                                        }}
                                            style={{ background: isSelected ? 'rgba(105,63,233,0.12)' : 'rgba(255,255,255,0.04)', padding: '14px 16px', borderRadius: '12px', border: isSelected ? '2px solid rgba(105,63,233,0.4)' : '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}>
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                                <input type="checkbox" checked={isSelected} readOnly
                                                    style={{ width: '15px', height: '15px', accentColor: '#693fe9', cursor: 'pointer', marginTop: '2px', flexShrink: 0 }} />
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            {post.authorName && <span style={{ fontWeight: '600', color: 'white', fontSize: '13px' }}>{post.authorName}</span>}
                                                            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px' }}>{new Date(post.scrapedAt).toLocaleDateString()}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                            <span style={{ color: '#ec4899', fontSize: '11px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>{miniIcon('M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z', '#ec4899', 11)} {post.likes}</span>
                                                            <span style={{ color: '#8b5cf6', fontSize: '11px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>{miniIcon('M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z', '#8b5cf6', 11)} {post.comments}</span>
                                                            {post.postUrl && (
                                                                <a href={post.postUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                                                                    style={{ color: '#693fe9', fontSize: '10px', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>{miniIcon('M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6 M15 3h6v6 M10 14L21 3', '#693fe9', 11)}</a>
                                                            )}
                                                            <button onClick={(e) => { e.stopPropagation(); deleteSavedPost(post.id); }}
                                                                style={{ background: 'none', border: 'none', color: '#f87171', padding: '0 2px', fontSize: '14px', cursor: 'pointer', lineHeight: 1 }}>×</button>
                                                        </div>
                                                    </div>
                                                    <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                                                        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', lineHeight: '1.5', margin: 0, whiteSpace: 'pre-wrap' }}>
                                                            {post.postContent}
                                                        </p>
                                                    </div>
                                                    {post.imageUrl && (
                                                        <img src={post.imageUrl} alt="Post" style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', marginTop: '8px' }} />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {savedPostsTotal > 20 && (
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', paddingTop: '12px' }}>
                                        <button onClick={() => loadSavedPosts(savedPostsPage - 1)} disabled={savedPostsPage <= 1}
                                            style={{ padding: '7px 16px', background: savedPostsPage <= 1 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: savedPostsPage <= 1 ? 'rgba(255,255,255,0.3)' : 'white', cursor: savedPostsPage <= 1 ? 'not-allowed' : 'pointer', fontSize: '12px' }}>
                                            ← Prev
                                        </button>
                                        <span style={{ color: 'rgba(255,255,255,0.5)', alignSelf: 'center', fontSize: '12px' }}>{savedPostsPage}/{Math.ceil(savedPostsTotal / 20)}</span>
                                        <button onClick={() => loadSavedPosts(savedPostsPage + 1)} disabled={savedPostsPage >= Math.ceil(savedPostsTotal / 20)}
                                            style={{ padding: '7px 16px', background: savedPostsPage >= Math.ceil(savedPostsTotal / 20) ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: savedPostsPage >= Math.ceil(savedPostsTotal / 20) ? 'rgba(255,255,255,0.3)' : 'white', cursor: savedPostsPage >= Math.ceil(savedPostsTotal / 20) ? 'not-allowed' : 'pointer', fontSize: '12px' }}>
                                            Next →
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

    );
}
```

---

### components\UsageTab.tsx

```
// @ts-nocheck
export default function UsageTab(props: any) {
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

    return (
                    <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        padding: '30px',
                        borderRadius: '20px',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                            {[
                                { icon: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z', label: 'Likes', used: usage?.usage?.likes || 0, limit: usage?.limits?.likes || 0, color: '#f59e0b' },
                                { icon: 'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8 M16 6l-4-4-4 4 M12 2v13', label: 'Shares', used: usage?.usage?.shares || 0, limit: usage?.limits?.shares || 0, color: '#3b82f6' },
                                { icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 11l-3-3m0 0l-3 3m3-3v6', label: 'Follows', used: usage?.usage?.follows || 0, limit: usage?.limits?.follows || 0, color: '#10b981' },
                                { icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75', label: 'Connections', used: usage?.usage?.connections || 0, limit: usage?.limits?.connections || 0, color: '#8b5cf6' },
                                { icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8', label: 'AI Posts', used: usage?.usage?.aiPosts || 0, limit: usage?.limits?.aiPosts || 0, color: '#a78bfa' },
                                {
                                    icon: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z',
                                    label: 'AI Comments',
                                    used: usage?.usage?.aiComments || 0,
                                    limit: (usage?.limits?.aiComments || 0) + (usage?.usage?.bonusAiComments || 0),
                                    isTotalAvailable: true,
                                    color: '#ec4899'
                                },
                                { icon: 'M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z', label: 'AI Topics', used: usage?.usage?.aiTopicLines || 0, limit: usage?.limits?.aiTopicLines || 0, color: '#fbbf24' },
                            ].map((item, i) => {
                                const pct = item.limit > 0 ? (item.used / item.limit) * 100 : 0;
                                return (
                                    <div key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                        <div style={{ marginBottom: '12px' }}>{miniIcon(item.icon, item.color, 24)}</div>
                                        <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>{item.label}</div>
                                        <div style={{ fontSize: '24px', fontWeight: '700', color: 'white', marginBottom: '12px' }}>{item.used} / {item.limit}</div>
                                        <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: pct >= 100 ? '#ef4444' : pct > 80 ? '#f59e0b' : 'linear-gradient(90deg, #693fe9, #8b5cf6)', borderRadius: '4px' }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

    );
}
```

---

### components\WriterTab.tsx

```
// @ts-nocheck
export default function WriterTab(props: any) {
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
        userGoal, setUserGoal, userTargetAudience, setUserTargetAudience,
        userWritingStyle, setUserWritingStyle, userWritingStyleSource, setUserWritingStyleSource,
        goalsLoading, goalsSuggesting, loadUserGoals, saveUserGoals, suggestGoals,
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

    return (
        <>
            {/* LinkedIn Profile — Voyager API data banner */}
            <div style={{ background: 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)', padding: '14px 18px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.15)', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                        {typeof voyagerData?.profilePicture === 'string' && voyagerData.profilePicture ? (
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0, border: '2px solid rgba(255,255,255,0.3)', background: `url(${voyagerData.profilePicture}) center/cover no-repeat` }} />
                        ) : (
                            <span style={{ flexShrink: 0 }}>{miniIcon('M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71', 'white', 18)}</span>
                        )}
                        {voyagerData ? (
                            <div style={{ minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ color: 'white', fontSize: '14px', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{voyagerData.name || 'LinkedIn Profile'}</span>
                                    {voyagerData.followerCount && <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', flexShrink: 0 }}>{voyagerData.followerCount.toLocaleString()} followers</span>}
                                    {voyagerData.voyagerLastSyncAt && <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', flexShrink: 0 }}>synced {new Date(voyagerData.voyagerLastSyncAt).toLocaleDateString()}</span>}
                                </div>
                                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{voyagerData.headline || ''}</div>
                            </div>
                        ) : (
                            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>{voyagerLoading ? 'Loading Voyager data...' : 'Connect your extension to sync LinkedIn profile data'}</span>
                        )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, marginLeft: '12px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                            <input type="checkbox" checked={linkedInUseProfileData} onChange={e => toggleLinkedInProfileData(e.target.checked)}
                                style={{ width: '14px', height: '14px', accentColor: '#0077b5' }} />
                            <span style={{ color: 'white', fontSize: '11px' }}>Use in AI</span>
                        </label>
                        {voyagerData && <button onClick={generateTopicSuggestions} disabled={linkedInGeneratingTopics}
                            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '6px', padding: '5px 10px', color: 'white', fontSize: '10px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            {linkedInGeneratingTopics ? '...' : <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>{miniIcon('M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', 'white', 11)} Topics</span>}
                        </button>}
                        {voyagerData && <button onClick={() => setShowLinkedInDataModal(true)}
                            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '6px', padding: '5px 10px', color: 'white', fontSize: '10px', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '3px' }}>{miniIcon('M18 20V10 M12 20V4 M6 20v-6', 'white', 10)} Data</button>}
                        <button onClick={() => loadVoyagerData()} disabled={voyagerLoading}
                            style={{ background: 'white', color: '#0077b5', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: voyagerLoading ? 'wait' : 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {voyagerLoading ? '...' : <>{miniIcon('M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0 0 20.49 15', '#0077b5', 12)} Sync</>}
                        </button>
                    </div>
                </div>
            </div>



            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px 20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ color: 'white', fontSize: '14px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {miniIcon('M13 10V3L4 14h7v7l9-11h-7z', '#fbbf24', 16)} Personal Brand Strategy
                    </h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {(!userGoal && !userTargetAudience) ? (
                            <button onClick={suggestGoals} disabled={goalsSuggesting || !props.voyagerData}
                                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', borderRadius: '8px', padding: '6px 14px', color: 'white', fontSize: '11px', fontWeight: 'bold', cursor: (goalsSuggesting || !props.voyagerData) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', opacity: props.voyagerData ? 1 : 0.5 }}>
                                {goalsSuggesting ? 'Suggesting...' : '✨ Suggest Strategy'}
                            </button>
                        ) : (
                            <button onClick={saveUserGoals}
                                style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: '6px', padding: '6px 12px', color: '#34d399', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                                Save Strategy
                            </button>
                        )}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>Content Goal</label>
                        <input type="text" value={userGoal} onChange={e => setUserGoal(e.target.value)} placeholder="e.g. Build authority in B2B SaaS"
                            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: 'white', fontSize: '12px', width: '100%', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>Target Audience</label>
                        <input type="text" value={userTargetAudience} onChange={e => setUserTargetAudience(e.target.value)} placeholder="e.g. Startup Founders & VCs"
                            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: 'white', fontSize: '12px', width: '100%', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>Writing Style (Inspiration)</label>
                        <select value={userWritingStyleSource} onChange={e => setUserWritingStyleSource(e.target.value)}
                            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: 'white', fontSize: '12px', width: '100%', outline: 'none', cursor: 'pointer' }}>
                            <option value="user_default">My Own Top Posts</option>
                            {props.inspirationSources && props.inspirationSources.map((s: any, idx: number) => (
                                <option key={idx} value={`insp_${s.name}`}>{s.name} (My Inspiration)</option>
                            ))}
                            {props.sharedInspProfiles && props.sharedInspProfiles.map((s: any, idx: number) => (
                                <option key={`shared_${idx}`} value={`shared_${s.profileName}`}>{s.profileName} (Kommentify List)</option>
                            ))}
                        </select>
                    </div>
                </div>
                {!props.voyagerData && (!userGoal && !userTargetAudience) && (
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontStyle: 'italic' }}>Connect your LinkedIn profile (Sync button above) to enable AI Strategy Suggestion.</p>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: '16px' }}>
                {/* Left Column: Settings */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Post Settings */}
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h3 style={{ color: 'white', fontSize: '14px', fontWeight: '700', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {miniIcon('M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', 'white', 14)} Post Settings
                        </h3>
                        {/* Source Selection Buttons — prominent */}
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                            {(inspirationSources.length > 0 || inspirationSelected.length > 0) && (
                                <button onClick={() => { setInspirationUseAll(!inspirationUseAll); if (!inspirationUseAll) setInspirationSelected([...inspirationSources.map((s: any) => s.name), ...sharedInspProfiles.map((p: any) => p.profileName)]); }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', background: inspirationUseAll ? 'linear-gradient(135deg, rgba(105,63,233,0.3), rgba(139,92,246,0.2))' : 'rgba(255,255,255,0.06)', border: inspirationUseAll ? '1px solid rgba(105,63,233,0.5)' : '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: inspirationUseAll ? '#a78bfa' : 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                                    {miniIcon('M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11', inspirationUseAll ? '#a78bfa' : 'rgba(255,255,255,0.6)', 13)}
                                    {inspirationUseAll ? 'All Sources Active' : 'Use All Sources'}
                                </button>
                            )}
                            {linkedInProfile && (
                                <button onClick={() => setUseProfileData(!useProfileData)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', background: useProfileData ? 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(34,197,94,0.2))' : 'rgba(255,255,255,0.06)', border: useProfileData ? '1px solid rgba(16,185,129,0.5)' : '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: useProfileData ? '#34d399' : 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                                    {miniIcon('M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', useProfileData ? '#34d399' : 'rgba(255,255,255,0.6)', 13)}
                                    {useProfileData ? 'Profile Data Active' : 'Use Profile Data'}
                                </button>
                            )}
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'white', fontSize: '13px', fontWeight: '600' }}>
                                    {miniIcon('M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', '#f59e0b', 14)} {linkedInTopicSuggestions.length > 0 ? `${linkedInTopicSuggestions.length} Topics/Ideas` : 'Topic/Idea'}
                                </label>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    {linkedInProfile && (
                                        <button onClick={generateTopicSuggestions} disabled={linkedInGeneratingTopics}
                                            style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '5px', color: '#fbbf24', fontSize: '10px', padding: '4px 8px', cursor: linkedInGeneratingTopics ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {linkedInGeneratingTopics ? '...' : <>{miniIcon('M12 4v16m8-8H4', '#fbbf24', 10)} New Ideas</>}
                                        </button>
                                    )}
                                </div>
                            </div>
                            <textarea value={writerTopic} onChange={e => setWriterTopic(e.target.value)}
                                placeholder="What do you want to write about? (e.g. 5 tips for remote work productivity)"
                                style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none', resize: 'vertical', minHeight: '80px', fontFamily: 'system-ui, sans-serif' }} />

                            {/* Topic Suggestions List */}
                            {linkedInTopicSuggestions.length > 0 && (
                                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Click to use an AI-generated idea based on your profile:</div>
                                    {linkedInTopicSuggestions.map((topic, i) => (
                                        <div key={i} onClick={() => selectTopicSuggestion(topic)}
                                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '10px 12px', color: '#cbd5e1', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: '8px', transition: 'all 0.2s', lineHeight: '1.4' }}
                                            onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                                            onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
                                            <span style={{ color: '#a78bfa', marginTop: '2px' }}>{miniIcon('M12 4v16m8-8H4', '#a78bfa', 12)}</span>
                                            <span style={{ flex: 1 }}>{topic}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.6)', fontSize: '10px', fontWeight: '600', marginBottom: '3px' }}>{miniIcon('M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8', 'rgba(255,255,255,0.6)', 11)} Template</label>
                                <select value={writerTemplate} onChange={e => setWriterTemplate(e.target.value)}
                                    style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '12px' }}>
                                    <option value="lead_magnet">Lead Magnet</option>
                                    <option value="thought_leadership">Thought Leadership</option>
                                    <option value="personal_story">Personal Story</option>
                                    <option value="advice">Advice/Tips</option>
                                    <option value="case_study">Case Study</option>
                                    <option value="controversial">Controversial Opinion</option>
                                    <option value="question">Question/Poll</option>
                                    <option value="insight">Industry Insight</option>
                                    <option value="announcement">Announcement</option>
                                    <option value="achievement">Achievement</option>
                                    <option value="tip">Pro Tip</option>
                                    <option value="story">Story</option>
                                    <option value="motivation">Motivation</option>
                                    <option value="how_to">How-To Guide</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.6)', fontSize: '10px', fontWeight: '600', marginBottom: '3px' }}>{miniIcon('M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z M20 12h2 M2 12h2 M12 2v2 M12 20v2 M4.93 4.93l1.41 1.41 M17.66 17.66l1.41 1.41 M4.93 19.07l1.41-1.41 M17.66 6.34l1.41-1.41', 'rgba(255,255,255,0.6)', 11)} Tone</label>
                                <select value={writerTone} onChange={e => setWriterTone(e.target.value)}
                                    style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '12px' }}>
                                    <option value="professional">Professional</option>
                                    <option value="friendly">Friendly</option>
                                    <option value="inspirational">Inspirational</option>
                                    <option value="bold">Bold/Provocative</option>
                                    <option value="educational">Educational</option>
                                    <option value="conversational">Conversational</option>
                                    <option value="authoritative">Authoritative</option>
                                    <option value="humorous">Humorous</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.6)', fontSize: '10px', fontWeight: '600', marginBottom: '3px' }}>{miniIcon('M21 10H3 M21 6H3 M21 14H3 M21 18H3', 'rgba(255,255,255,0.6)', 11)} Length</label>
                                <select value={writerLength} onChange={e => setWriterLength(e.target.value)}
                                    style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '12px' }}>
                                    <option value="500">Short (500)</option>
                                    <option value="900">Medium (900)</option>
                                    <option value="1500">Long (1500)</option>
                                    <option value="2500">Extra Long (2500)</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.6)', fontSize: '10px', fontWeight: '600', marginBottom: '3px' }}>{miniIcon('M4 4h16v16H4z M9 9h6v6H9z M9 2v2 M15 2v2 M9 20v2 M15 20v2 M2 9h2 M2 15h2 M20 9h2 M20 15h2', 'rgba(255,255,255,0.6)', 11)} AI Model</label>
                                <select value={writerModel} onChange={e => handleWriterModelChange(e.target.value)}
                                    style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '12px' }}>
                                    {MODEL_OPTIONS.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        {/* Options row */}
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'rgba(255,255,255,0.7)', fontSize: '11px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={writerHashtags} onChange={e => setWriterHashtags(e.target.checked)} style={{ accentColor: '#693fe9', width: '13px', height: '13px' }} />
                                {miniIcon('M4 9h16 M4 15h16 M10 3l-2 18 M16 3l-2 18', 'rgba(255,255,255,0.7)', 11)} Hashtags
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'rgba(255,255,255,0.7)', fontSize: '11px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={writerEmojis} onChange={e => setWriterEmojis(e.target.checked)} style={{ accentColor: '#693fe9', width: '13px', height: '13px' }} />
                                {miniIcon('M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M8 14s1.5 2 4 2 4-2 4-2 M9 9h.01 M15 9h.01', 'rgba(255,255,255,0.7)', 11)} Emojis
                            </label>
                            <select value={writerLanguage} onChange={e => setWriterLanguage(e.target.value)}
                                style={{ padding: '5px 8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', fontSize: '11px', marginLeft: 'auto' }}>
                                <option value="">Auto</option>
                                <option value="English">English</option>
                                <option value="Spanish">Spanish</option>
                                <option value="French">French</option>
                                <option value="German">German</option>
                                <option value="Portuguese">Portuguese</option>
                                <option value="Italian">Italian</option>
                                <option value="Dutch">Dutch</option>
                                <option value="Russian">Russian</option>
                                <option value="Chinese">Chinese</option>
                                <option value="Japanese">Japanese</option>
                                <option value="Korean">Korean</option>
                                <option value="Arabic">Arabic</option>
                                <option value="Hindi">Hindi</option>
                                <option value="Urdu">Urdu</option>
                                <option value="Turkish">Turkish</option>
                                <option value="Polish">Polish</option>
                                <option value="Swedish">Swedish</option>
                                <option value="Indonesian">Indonesian</option>
                                <option value="Thai">Thai</option>
                                <option value="Vietnamese">Vietnamese</option>
                            </select>
                        </div>
                        {/* Advanced Settings */}
                        <div style={{ marginBottom: '10px' }}>
                            <button onClick={() => setWriterAdvancedOpen(!writerAdvancedOpen)}
                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '7px 12px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '11px', fontWeight: '600', width: '100%', textAlign: 'left' }}>
                                {miniIcon('M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', 'rgba(255,255,255,0.6)', 11)} Advanced Settings {writerAdvancedOpen ? '▲' : '▼'}
                            </button>
                            {writerAdvancedOpen && (
                                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <input type="text" value={writerTargetAudience} onChange={e => setWriterTargetAudience(e.target.value)} placeholder="Target Audience (e.g., Startup founders)"
                                        style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '12px', outline: 'none' }} />
                                    <input type="text" value={writerKeyMessage} onChange={e => setWriterKeyMessage(e.target.value)} placeholder="Key Message/CTA (e.g., Book a call)"
                                        style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '12px', outline: 'none' }} />
                                    <input type="text" value={writerBackground} onChange={e => setWriterBackground(e.target.value)} placeholder="Your Background (e.g., CEO at TechCorp)"
                                        style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '12px', outline: 'none' }} />
                                </div>
                            )}
                        </div>
                        <button onClick={generatePost} disabled={writerGenerating}
                            style={{ width: '100%', padding: '12px', background: writerGenerating ? 'rgba(105,63,233,0.5)' : 'linear-gradient(135deg, #693fe9 0%, #8b5cf6 100%)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: writerGenerating ? 'wait' : 'pointer', boxShadow: '0 4px 15px rgba(105,63,233,0.4)' }}>
                            {writerGenerating ? 'Generating...' : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>{miniIcon('M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z', 'white', 14)} Generate AI Post</span>}
                        </button>
                    </div>
                </div>
                {/* Right Column: Content Editor */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {/* LinkedIn API Toggle */}
                        <div style={{ marginBottom: '16px', padding: '12px 14px', background: 'rgba(0,119,181,0.1)', borderRadius: '10px', border: '1px solid rgba(0,119,181,0.25)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ color: '#60a5fa', fontSize: '13px', fontWeight: '700', marginBottom: '3px' }}>Publishing Method</div>
                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>
                                        {writerUseLinkedInAPI ? 'Using LinkedIn API (instant, works offline)' : 'Using Extension (requires browser)'}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setWriterUseLinkedInAPI(!writerUseLinkedInAPI)}
                                    style={{
                                        position: 'relative',
                                        width: '52px',
                                        height: '28px',
                                        borderRadius: '14px',
                                        background: writerUseLinkedInAPI ? 'linear-gradient(135deg, #0077b5, #00a0dc)' : 'rgba(255,255,255,0.15)',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        flexShrink: 0
                                    }}
                                >
                                    <div style={{
                                        position: 'absolute',
                                        top: '3px',
                                        left: writerUseLinkedInAPI ? '26px' : '3px',
                                        width: '22px',
                                        height: '22px',
                                        borderRadius: '50%',
                                        background: 'white',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                    }}></div>
                                </button>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <h3 style={{ color: 'white', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                {miniIcon('M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8', 'white', 14)} Post Content
                            </h3>
                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{writerContent.length} / 3,000</span>
                        </div>
                        <textarea value={writerContent} onChange={e => setWriterContent(e.target.value)}
                            placeholder="Your AI-generated post will appear here... or start writing your own!"
                            style={{ flex: 1, minHeight: '300px', width: '100%', padding: '14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'white', fontSize: '14px', lineHeight: '1.7', resize: 'vertical', outline: 'none', fontFamily: 'system-ui, sans-serif' }} />
                        {/* Status */}
                        {writerStatus && (
                            <div style={{ marginTop: '12px', padding: '10px 16px', background: writerStatus.includes('Error') || writerStatus.includes('Failed') ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', border: `1px solid ${writerStatus.includes('Error') || writerStatus.includes('Failed') ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`, borderRadius: '10px', color: writerStatus.includes('Error') || writerStatus.includes('Failed') ? '#f87171' : '#34d399', fontSize: '13px', fontWeight: '500' }}>
                                {writerStatus}
                            </div>
                        )}
                        {/* Token Usage Display - Developer Only */}
                        {isDeveloper && writerTokenUsage && (
                            <div style={{ marginTop: '12px', padding: '14px 18px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                    {miniIcon('M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z', '#60a5fa', 16)}
                                    <span style={{ color: '#60a5fa', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>{miniIcon('M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z', '#60a5fa', 13)} Developer Token Usage</span>
                                </div>
                                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                    <div>
                                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Model</span>
                                        <div style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>{writerTokenUsage.modelName}</div>
                                    </div>
                                    <div>
                                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Input Tokens</span>
                                        <div style={{ color: '#34d399', fontSize: '13px', fontWeight: '600' }}>{writerTokenUsage.inputTokens?.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Output Tokens</span>
                                        <div style={{ color: '#fbbf24', fontSize: '13px', fontWeight: '600' }}>{writerTokenUsage.outputTokens?.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Input Cost</span>
                                        <div style={{ color: '#34d399', fontSize: '13px', fontWeight: '600' }}>{writerTokenUsage.inputCost}</div>
                                    </div>
                                    <div>
                                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Output Cost</span>
                                        <div style={{ color: '#fbbf24', fontSize: '13px', fontWeight: '600' }}>{writerTokenUsage.outputCost}</div>
                                    </div>
                                    <div>
                                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Total Cost</span>
                                        <div style={{ color: '#a78bfa', fontSize: '14px', fontWeight: '700' }}>{writerTokenUsage.totalCost}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* LinkedIn Post Preview */}
                        {writerContent.trim() && (
                            <div style={{ marginTop: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>LinkedIn Preview</span>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        {(['desktop', 'mobile'] as const).map(mode => (
                                            <button key={mode} onClick={() => { setWriterPreviewMode(writerPreviewMode === mode ? 'off' : mode); setWriterPreviewExpanded(false); }}
                                                style={{ padding: '3px 8px', background: writerPreviewMode === mode ? 'rgba(0,119,181,0.3)' : 'rgba(255,255,255,0.06)', border: writerPreviewMode === mode ? '1px solid rgba(0,119,181,0.5)' : '1px solid rgba(255,255,255,0.12)', borderRadius: '4px', color: writerPreviewMode === mode ? '#60a5fa' : 'rgba(255,255,255,0.5)', fontSize: '10px', cursor: 'pointer', fontWeight: '600' }}>
                                                {mode === 'desktop' ? '🖥 Desktop' : '📱 Mobile'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {writerPreviewMode !== 'off' && (() => {
                                    const isMobile = writerPreviewMode === 'mobile';
                                    const maxW = isMobile ? '375px' : '555px';
                                    const TRUNCATE_LINES = isMobile ? 3 : 5;
                                    const lines = writerContent.split('\n');
                                    const truncated = lines.length > TRUNCATE_LINES && !writerPreviewExpanded;
                                    const displayText = truncated ? lines.slice(0, TRUNCATE_LINES).join('\n') : writerContent;
                                    const profileName = linkedInProfile?.name || user?.name || 'Your Name';
                                    const profileHeadline = linkedInProfile?.headline || 'Your Headline';
                                    return (
                                        <div style={{ maxWidth: maxW, margin: '0 auto', background: '#1b1f23', borderRadius: '10px', border: '1px solid #38434f', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                                            {/* Post header */}
                                            <div style={{ padding: isMobile ? '10px 12px' : '12px 16px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                                <div style={{ width: isMobile ? '36px' : '48px', height: isMobile ? '36px' : '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #0077b5, #00a0dc)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: isMobile ? '14px' : '18px', flexShrink: 0 }}>{(profileName?.[0] || 'U').toUpperCase()}</div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ color: 'white', fontWeight: '600', fontSize: isMobile ? '13px' : '14px', lineHeight: '1.3' }}>{profileName}</div>
                                                    <div style={{ color: '#ffffffb3', fontSize: isMobile ? '11px' : '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profileHeadline}</div>
                                                    <div style={{ color: '#ffffff80', fontSize: '11px', marginTop: '2px' }}>Just now · {miniIcon('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', '#ffffff80', 10)}</div>
                                                </div>
                                            </div>
                                            {/* Post text */}
                                            <div style={{ padding: isMobile ? '0 12px 10px' : '0 16px 12px' }}>
                                                <div style={{ color: '#ffffffe6', fontSize: isMobile ? '13px' : '14px', lineHeight: '1.5', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                                    {displayText}
                                                    {truncated && <span onClick={() => setWriterPreviewExpanded(true)} style={{ color: '#ffffff80', cursor: 'pointer' }}>... <span style={{ color: '#70b5f9' }}>see more</span></span>}
                                                </div>
                                                {writerPreviewExpanded && lines.length > TRUNCATE_LINES && (
                                                    <span onClick={() => setWriterPreviewExpanded(false)} style={{ color: '#70b5f9', cursor: 'pointer', fontSize: '13px' }}>show less</span>
                                                )}
                                            </div>
                                            {/* Image/video preview */}
                                            {writerImageUrl && (
                                                <div style={{ borderTop: '1px solid #38434f' }}>
                                                    {writerMediaType === 'video' ? (
                                                        <video src={writerImageUrl} controls style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', background: '#000' }} />
                                                    ) : (
                                                        <img src={writerImageUrl} alt="Post media" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }} />
                                                    )}
                                                </div>
                                            )}
                                            {/* Engagement bar */}
                                            <div style={{ padding: isMobile ? '8px 12px' : '8px 16px', borderTop: '1px solid #38434f' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ffffff80', fontSize: isMobile ? '11px' : '12px' }}>
                                                    <span>👍 ❤️ 💡</span>
                                                    <span>0 comments · 0 reposts</span>
                                                </div>
                                            </div>
                                            {/* Action buttons */}
                                            <div style={{ display: 'flex', justifyContent: 'space-around', padding: '4px 0', borderTop: '1px solid #38434f' }}>
                                                {['Like', 'Comment', 'Repost', 'Send'].map(action => (
                                                    <div key={action} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '10px 8px', color: '#ffffff80', fontSize: isMobile ? '11px' : '12px', fontWeight: '600' }}>
                                                        {action === 'Like' && '👍'}{action === 'Comment' && '💬'}{action === 'Repost' && '🔄'}{action === 'Send' && '✈️'} {action}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>);
                                })()}
                            </div>
                        )}

                        {/* Media Upload & Action Buttons */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/jpeg,image/png,image/gif,image/webp,video/webm,video/mp4"
                                    style={{ display: 'none' }}
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const isVideo = file.type.startsWith('video/');
                                        setWriterImageFile(file);
                                        setWriterMediaType(isVideo ? 'video' : 'image');
                                        // Show local preview
                                        const reader = new FileReader();
                                        reader.onload = (ev) => setWriterImageUrl(ev.target?.result as string);
                                        reader.readAsDataURL(file);
                                        // Upload to Vercel Blob
                                        setWriterUploading(true);
                                        try {
                                            const token = localStorage.getItem('authToken');
                                            const formData = new FormData();
                                            formData.append('file', file);
                                            const res = await fetch('/api/upload', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
                                            const data = await res.json();
                                            if (data.success) {
                                                setWriterMediaBlobUrl(data.url);
                                                showToast(`${isVideo ? 'Video' : 'Image'} uploaded!`, 'success');
                                            } else {
                                                showToast(data.error || 'Upload failed', 'error');
                                            }
                                        } catch (err: any) { showToast('Upload failed: ' + err.message, 'error'); }
                                        finally { setWriterUploading(false); }
                                    }}
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={writerUploading}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: writerUploading ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '12px', cursor: writerUploading ? 'wait' : 'pointer', transition: 'all 0.2s' }}
                                    onMouseOver={e => { if (!writerUploading) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                                    onMouseOut={e => { if (!writerUploading) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                                >
                                    {miniIcon('M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'rgba(255,255,255,0.7)', 14)}
                                    {writerUploading ? 'Uploading...' : writerImageFile ? 'Change Media' : 'Attach Image / Video'}
                                </button>

                                {writerImageUrl && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        {writerMediaType === 'video' ? (
                                            <div style={{ width: '30px', height: '30px', background: 'rgba(59,130,246,0.2)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>🎬</div>
                                        ) : (
                                            <img src={writerImageUrl} alt="Attachment" style={{ width: '30px', height: '30px', objectFit: 'cover', borderRadius: '4px' }} />
                                        )}
                                        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{writerImageFile?.name}</span>
                                        {writerMediaBlobUrl && <span style={{ color: '#34d399', fontSize: '10px' }}>✓</span>}
                                        <button
                                            onClick={() => { setWriterImageFile(null); setWriterImageUrl(''); setWriterMediaBlobUrl(''); setWriterMediaType(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                            style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons — Row 1: Post to LinkedIn + Draft */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '8px' }}>
                                <button onClick={sendToExtension} disabled={writerPosting}
                                    style={{ padding: '11px 6px', background: writerPosting ? 'rgba(105,63,233,0.4)' : 'linear-gradient(135deg, #693fe9 0%, #8b5cf6 100%)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '12px', cursor: writerPosting ? 'wait' : 'pointer', boxShadow: writerPosting ? 'none' : '0 4px 12px rgba(105,63,233,0.3)', opacity: writerPosting ? 0.7 : 1 }}>
                                    {writerPosting ? '...' : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>{miniIcon('M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7z', 'white', 12)} Post to LinkedIn</span>}
                                </button>
                                <button onClick={saveDraft}
                                    style={{ padding: '11px 6px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', color: 'white', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}>
                                    {miniIcon('M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z M17 21v-8H7v8 M7 3v5h8', 'white', 12)} Draft
                                </button>
                            </div>
                        </div>
                        {/* Row 2: Date + Time + Schedule button */}
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', alignItems: 'center' }}>
                            <input type="date" value={writerScheduleDate} onChange={e => setWriterScheduleDate(e.target.value)}
                                style={{ flex: 1, padding: '6px 8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: 'white', fontSize: '11px' }} />
                            <input type="time" value={writerScheduleTime} onChange={e => setWriterScheduleTime(e.target.value)}
                                style={{ flex: 1, padding: '6px 8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: 'white', fontSize: '11px' }} />
                            <button onClick={schedulePost}
                                style={{ padding: '6px 12px', background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.4)', borderRadius: '8px', color: '#c4b5fd', fontWeight: '600', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                {miniIcon('M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', '#c4b5fd', 11)} Schedule
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Planner — mode selector above calendar */}
            <div style={{ background: 'linear-gradient(135deg, rgba(105,63,233,0.15) 0%, rgba(139,92,246,0.1) 100%)', padding: '14px 18px', borderRadius: '14px', border: '1px solid rgba(105,63,233,0.3)', marginTop: '16px', marginBottom: '0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {miniIcon('M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', '#a78bfa', 16)}
                        <span style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>AI Content Planner</span>
                        <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px' }}>Generate &amp; schedule a full content calendar with one click</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => openPlanner('7days')}
                            style={{ padding: '8px 18px', background: 'linear-gradient(135deg, #693fe9, #8b5cf6)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', boxShadow: '0 3px 10px rgba(105,63,233,0.4)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {miniIcon('M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', 'white', 13)} 7 Days Planner
                        </button>
                        <button onClick={() => openPlanner('30days')}
                            style={{ padding: '8px 18px', background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', boxShadow: '0 3px 10px rgba(16,185,129,0.4)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {miniIcon('M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', 'white', 13)} 30 Days Planner
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Planner Wizard Modal */}
            {plannerOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                    <div style={{ background: '#13132b', borderRadius: '20px', border: '1px solid rgba(105,63,233,0.4)', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', padding: '28px' }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div>
                                <h2 style={{ color: 'white', fontSize: '18px', fontWeight: '800', margin: 0 }}>
                                    {plannerMode === '7days' ? '7-Day' : '30-Day'} AI Content Planner
                                </h2>
                                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', marginTop: '3px' }}>
                                    {plannerStep === 'context' && 'Step 1 of 3 — Add context & generate topics'}
                                    {plannerStep === 'select' && 'Step 2 of 3 — Select your topics'}
                                    {plannerStep === 'time' && 'Step 3 of 3 — Set schedule & generate posts'}
                                    {plannerStep === 'generating' && `Generating posts… ${plannerDoneCount}/${plannerTotal}`}
                                    {plannerStep === 'done' && '✅ All posts generated & scheduled!'}
                                </div>
                            </div>
                            {plannerStep !== 'generating' && (
                                <button onClick={() => { plannerAbortRef.current = true; setPlannerOpen(false); }}
                                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', padding: '8px 12px', color: 'white', fontSize: '16px', cursor: 'pointer' }}>✕</button>
                            )}
                        </div>

                        {/* Step 1: Context */}
                        {plannerStep === 'context' && (
                            <div>
                                {linkedInProfile ? (
                                    <div style={{ padding: '12px 14px', background: 'rgba(0,119,181,0.15)', border: '1px solid rgba(0,119,181,0.3)', borderRadius: '10px', marginBottom: '16px' }}>
                                        <div style={{ color: '#60a5fa', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>📋 Profile Data Available</div>
                                        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>{linkedInProfile.name} · {linkedInProfile.headline}</div>
                                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '3px' }}>AI will use your profile data to personalise topics to your niche and expertise.</div>
                                    </div>
                                ) : (
                                    <div style={{ padding: '12px 14px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '10px', marginBottom: '16px' }}>
                                        <div style={{ color: '#fbbf24', fontSize: '12px' }}>⚠️ No LinkedIn profile scanned. Topics will be generic. Scan your profile for personalised results.</div>
                                    </div>
                                )}
                                <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                                    Your context, goals &amp; target audience <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: '400' }}>(optional but highly recommended)</span>
                                </label>
                                <textarea value={plannerContext} onChange={e => setPlannerContext(e.target.value)}
                                    placeholder={`Example:\n"I'm a SaaS founder targeting startup CTOs. My goal is to generate inbound leads for our DevOps tool. I want to position myself as a thought leader in developer productivity."`}
                                    rows={5} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'white', fontSize: '13px', outline: 'none', resize: 'vertical', lineHeight: '1.6', boxSizing: 'border-box' }} />
                                {plannerStatusMsg && <div style={{ marginTop: '10px', color: '#f87171', fontSize: '12px' }}>{plannerStatusMsg}</div>}
                                <button onClick={generatePlannerTopics} disabled={plannerGeneratingTopics}
                                    style={{ marginTop: '16px', width: '100%', padding: '13px', background: plannerGeneratingTopics ? 'rgba(105,63,233,0.4)' : 'linear-gradient(135deg, #693fe9, #8b5cf6)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '15px', cursor: plannerGeneratingTopics ? 'wait' : 'pointer' }}>
                                    {plannerGeneratingTopics ? `Generating ${plannerMode === '7days' ? '12' : '40'} topics…` : `✨ Generate ${plannerMode === '7days' ? '12' : '40'} Topic Ideas`}
                                </button>
                            </div>
                        )}

                        {/* Step 2: Topic Selection */}
                        {plannerStep === 'select' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
                                        {plannerSelected.filter(Boolean).length} of {plannerTopics.length} selected (need {plannerMode === '7days' ? '7' : '30'})
                                    </span>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => setPlannerSelected(plannerTopics.map((_, i) => i < (plannerMode === '7days' ? 7 : 30)))}
                                            style={{ padding: '5px 12px', background: 'rgba(105,63,233,0.2)', border: '1px solid rgba(105,63,233,0.4)', borderRadius: '6px', color: '#a78bfa', fontSize: '11px', cursor: 'pointer' }}>Auto-select Top</button>
                                        <button onClick={() => setPlannerSelected(plannerTopics.map(() => true))}
                                            style={{ padding: '5px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'rgba(255,255,255,0.6)', fontSize: '11px', cursor: 'pointer' }}>All</button>
                                        <button onClick={() => setPlannerSelected(plannerTopics.map(() => false))}
                                            style={{ padding: '5px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'rgba(255,255,255,0.6)', fontSize: '11px', cursor: 'pointer' }}>None</button>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
                                    {plannerTopics.map((topic, i) => (
                                        <div key={i} onClick={() => { const s = [...plannerSelected]; s[i] = !s[i]; setPlannerSelected(s); }}
                                            style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 14px', background: plannerSelected[i] ? 'rgba(105,63,233,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${plannerSelected[i] ? 'rgba(105,63,233,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '10px', cursor: 'pointer' }}>
                                            <input type="checkbox" checked={!!plannerSelected[i]} readOnly style={{ accentColor: '#693fe9', marginTop: '2px', flexShrink: 0 }} />
                                            <span style={{ color: plannerSelected[i] ? '#c4b5fd' : 'rgba(255,255,255,0.75)', fontSize: '13px', lineHeight: '1.5' }}><strong style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', marginRight: '6px' }}>Day {i + 1}</strong>{topic}</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                                    <button onClick={() => setPlannerStep('context')}
                                        style={{ padding: '11px 20px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'white', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>← Back</button>
                                    <button onClick={() => setPlannerStep('time')} disabled={plannerSelected.filter(Boolean).length === 0}
                                        style={{ flex: 1, padding: '11px', background: plannerSelected.filter(Boolean).length === 0 ? 'rgba(105,63,233,0.3)' : 'linear-gradient(135deg, #693fe9, #8b5cf6)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: plannerSelected.filter(Boolean).length === 0 ? 'default' : 'pointer' }}>
                                        Continue with {plannerSelected.filter(Boolean).length} topics →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Schedule Settings */}
                        {plannerStep === 'time' && (
                            <div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                                    <div>
                                        <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>📅 Start Date</label>
                                        <input type="date" value={plannerStartDate} onChange={e => setPlannerStartDate(e.target.value)}
                                            style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '14px', boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                        <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>🕐 Daily Publish Time</label>
                                        <input type="time" value={plannerPublishTime} onChange={e => setPlannerPublishTime(e.target.value)}
                                            style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '14px', boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                        <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Template</label>
                                        <select value={plannerTemplate} onChange={e => setPlannerTemplate(e.target.value)}
                                            style={{ width: '100%', padding: '9px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '12px' }}>
                                            <option value="thought_leadership">Thought Leadership</option>
                                            <option value="personal_story">Personal Story</option>
                                            <option value="advice">Advice/Tips</option>
                                            <option value="case_study">Case Study</option>
                                            <option value="how_to">How-To Guide</option>
                                            <option value="insight">Industry Insight</option>
                                            <option value="lead_magnet">Lead Magnet</option>
                                            <option value="controversial">Controversial Opinion</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Tone</label>
                                        <select value={plannerTone} onChange={e => setPlannerTone(e.target.value)}
                                            style={{ width: '100%', padding: '9px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '12px' }}>
                                            <option value="professional">Professional</option>
                                            <option value="friendly">Friendly</option>
                                            <option value="inspirational">Inspirational</option>
                                            <option value="bold">Bold/Provocative</option>
                                            <option value="educational">Educational</option>
                                            <option value="conversational">Conversational</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Post Length</label>
                                        <select value={plannerLength} onChange={e => setPlannerLength(e.target.value)}
                                            style={{ width: '100%', padding: '9px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '12px' }}>
                                            <option value="500">Short (500)</option>
                                            <option value="900">Medium (900)</option>
                                            <option value="1500">Long (1500)</option>
                                            <option value="2500">Extra Long (2500)</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ padding: '12px 14px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '10px', marginBottom: '16px' }}>
                                    <div style={{ color: '#34d399', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>📌 Disconnect Resilience</div>
                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>If your browser closes during generation, re-open the planner to resume. All already-scheduled posts will auto-post at their time even if you are offline — the server handles delivery. If a post time passes while offline, it will be sent instantly when your browser reconnects.</div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => setPlannerStep('select')}
                                        style={{ padding: '11px 20px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'white', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>← Back</button>
                                    <button onClick={startPlannerGeneration} disabled={!plannerStartDate || !plannerPublishTime}
                                        style={{ flex: 1, padding: '13px', background: (!plannerStartDate || !plannerPublishTime) ? 'rgba(16,185,129,0.3)' : 'linear-gradient(135deg, #059669, #10b981)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '15px', cursor: (!plannerStartDate || !plannerPublishTime) ? 'default' : 'pointer', boxShadow: '0 4px 15px rgba(16,185,129,0.35)' }}>
                                        🚀 Generate &amp; Schedule {plannerSelected.filter(Boolean).length} Posts
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Generating */}
                        {plannerStep === 'generating' && (
                            <div>
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>Generating &amp; Scheduling Posts</span>
                                        <span style={{ color: '#a78bfa', fontSize: '14px', fontWeight: '700' }}>{plannerDoneCount}/{plannerTotal}</span>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', height: '10px', overflow: 'hidden' }}>
                                        <div style={{ background: 'linear-gradient(90deg, #693fe9, #10b981)', height: '100%', borderRadius: '8px', width: `${plannerTotal > 0 ? (plannerDoneCount / plannerTotal) * 100 : 0}%`, transition: 'width 0.5s ease' }} />
                                    </div>
                                </div>
                                {plannerStatusMsg && (
                                    <div style={{ padding: '12px 14px', background: 'rgba(105,63,233,0.12)', border: '1px solid rgba(105,63,233,0.3)', borderRadius: '10px', color: '#c4b5fd', fontSize: '12px', marginBottom: '16px', lineHeight: '1.5' }}>
                                        {plannerStatusMsg}
                                    </div>
                                )}
                                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', textAlign: 'center', marginBottom: '16px' }}>
                                    Posts appear on your calendar below as they are generated. You can close this modal and watch the calendar update live.
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '6px', marginBottom: '20px' }}>
                                    {plannerTopics.filter((_, i) => plannerSelected[i]).map((topic, i) => (
                                        <div key={i} style={{ padding: '6px', background: i < plannerDoneCount ? 'rgba(16,185,129,0.2)' : i === plannerDoneCount && plannerGenerating ? 'rgba(105,63,233,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${i < plannerDoneCount ? 'rgba(16,185,129,0.4)' : i === plannerDoneCount && plannerGenerating ? 'rgba(105,63,233,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '8px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '10px', color: i < plannerDoneCount ? '#34d399' : i === plannerDoneCount && plannerGenerating ? '#a78bfa' : 'rgba(255,255,255,0.3)' }}>
                                                {i < plannerDoneCount ? '✓' : i === plannerDoneCount && plannerGenerating ? '⟳' : '○'}
                                            </div>
                                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px' }}>Day {i + 1}</div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => { plannerAbortRef.current = true; setPlannerOpen(false); }}
                                        style={{ flex: 1, padding: '11px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'rgba(255,255,255,0.6)', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                                        Close (runs in background)
                                    </button>
                                    <button onClick={() => { plannerAbortRef.current = true; setPlannerGenerating(false); }}
                                        style={{ padding: '11px 20px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: '#f87171', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                                        Stop
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step: Done */}
                        {plannerStep === 'done' && (
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
                                <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Content Calendar Ready!</h3>
                                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', marginBottom: '20px' }}>
                                    {plannerDoneCount} posts have been generated and auto-scheduled on your calendar. They will be automatically posted at your chosen time each day.
                                </p>
                                <button onClick={() => setPlannerOpen(false)}
                                    style={{ padding: '12px 32px', background: 'linear-gradient(135deg, #693fe9, #8b5cf6)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}>
                                    View Calendar →
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Calendar View — real month grid */}
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px 18px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button onClick={() => { if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(calendarYear - 1); } else setCalendarMonth(calendarMonth - 1); }}
                            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '4px 10px', color: 'white', fontSize: '14px', cursor: 'pointer' }}>‹</button>
                        <h3 style={{ color: 'white', fontSize: '15px', fontWeight: '700', margin: 0, minWidth: '160px', textAlign: 'center' }}>
                            {miniIcon('M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', 'white', 14)} {new Date(calendarYear, calendarMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h3>
                        <button onClick={() => { if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(calendarYear + 1); } else setCalendarMonth(calendarMonth + 1); }}
                            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '4px 10px', color: 'white', fontSize: '14px', cursor: 'pointer' }}>›</button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* Task status mini badges */}
                        {[
                            { label: 'Pending', count: taskCounts.pending, color: '#f59e0b' },
                            { label: 'Done', count: taskCounts.completed, color: '#10b981' },
                            { label: 'Failed', count: taskCounts.failed, color: '#ef4444' },
                        ].filter(s => s.count > 0).map(s => (
                            <span key={s.label} style={{ background: `${s.color}22`, border: `1px solid ${s.color}44`, borderRadius: '4px', padding: '2px 8px', color: s.color, fontSize: '10px', fontWeight: '700' }}>{s.count} {s.label}</span>
                        ))}
                        <button onClick={loadScheduledPosts} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '5px', color: 'rgba(255,255,255,0.6)', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>{miniIcon('M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0 0 20.49 15', 'rgba(255,255,255,0.6)', 10)}</button>
                    </div>
                </div>
                {/* Day headers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '10px', fontWeight: '700', padding: '4px 0', textTransform: 'uppercase' }}>{d}</div>
                    ))}
                </div>
                {/* Calendar grid */}
                {(() => {
                    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
                    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
                    const today = new Date();
                    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                    const statusColors: Record<string, string> = { pending: '#f59e0b', in_progress: '#3b82f6', completed: '#10b981', failed: '#ef4444' };
                    const postsByDay: Record<number, any[]> = {};
                    writerScheduledPosts.forEach((p: any) => {
                        const d = new Date(p.scheduledFor);
                        if (d.getMonth() === calendarMonth && d.getFullYear() === calendarYear) {
                            const day = d.getDate();
                            if (!postsByDay[day]) postsByDay[day] = [];
                            postsByDay[day].push(p);
                        }
                    });
                    const cells = [];
                    for (let i = 0; i < firstDay; i++) cells.push(<div key={`e${i}`} />);
                    for (let day = 1; day <= daysInMonth; day++) {
                        const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const isToday = dateStr === todayStr;
                        const posts = postsByDay[day] || [];
                        cells.push(
                            <div key={day} style={{ minHeight: '62px', padding: '4px', background: isToday ? 'rgba(105,63,233,0.12)' : posts.length > 0 ? 'rgba(255,255,255,0.04)' : 'transparent', borderRadius: '8px', border: isToday ? '1px solid rgba(105,63,233,0.4)' : '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                                <div style={{ fontSize: '11px', fontWeight: isToday ? '800' : '600', color: isToday ? '#a78bfa' : 'rgba(255,255,255,0.6)', marginBottom: '2px' }}>{day}</div>
                                {posts.slice(0, 2).map((p: any, pi: number) => {
                                    const col = statusColors[p.taskStatus || 'pending'] || '#f59e0b';
                                    return (
                                        <div key={pi} title={`${p.taskStatus || 'pending'} — ${(p.content || '').substring(0, 80)}...`}
                                            style={{ fontSize: '9px', color: col, background: `${col}15`, borderLeft: `2px solid ${col}`, padding: '1px 4px', borderRadius: '2px', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                                            onClick={() => { setWriterContent(p.content || ''); setWriterTopic(p.topic || ''); }}>
                                            {p.mediaUrl && (p.mediaType === 'video' ? miniIcon('M23 7l-7 5 7 5V7z M16 5H3a2 2 0 00-2 2v10a2 2 0 002 2h13a2 2 0 002-2V7a2 2 0 00-2-2z', col, 8) : miniIcon('M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5-5 5 5 M12 5v12', col, 8))}
                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{new Date(p.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {p.topic ? p.topic.substring(0, 10) : p.content?.substring(0, 10)}</span>
                                        </div>
                                    );
                                })}
                                {posts.length > 2 && <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>+{posts.length - 2}</div>}
                            </div>
                        );
                    }
                    return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>{cells}</div>;
                })()}
                {/* Selected day detail — show posts for today or any day with posts */}
                {writerScheduledPosts.length > 0 && (
                    <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase' }}>Upcoming Posts</div>
                            <button onClick={async () => { if (confirm('Delete ALL scheduled posts? This cannot be undone.')) { const token = localStorage.getItem('authToken'); const ids = writerScheduledPosts.map((p: any) => p.id); const res = await fetch('/api/post-drafts', { method: 'DELETE', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ ids }) }); const data = await res.json(); if (data.success) { loadScheduledPosts(); showToast(`Deleted ${data.deleted} scheduled posts`, 'success'); } else { showToast('Failed to delete posts', 'error'); } } }}
                                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '4px', padding: '3px 8px', color: '#ef4444', fontSize: '9px', cursor: 'pointer', fontWeight: '600' }}>Delete All</button>
                        </div>
                        <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {writerScheduledPosts
                                .sort((a: any, b: any) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())
                                .slice(0, 8)
                                .map((post: any, idx: number) => {
                                    const scheduledDate = new Date(post.scheduledFor);
                                    const statusColors2: Record<string, string> = { pending: '#f59e0b', in_progress: '#3b82f6', completed: '#10b981', failed: '#ef4444' };
                                    const col = statusColors2[post.taskStatus || 'pending'] || '#f59e0b';
                                    return (
                                        <div key={idx} onClick={() => { setWriterContent(post.content || ''); setWriterTopic(post.topic || ''); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', borderLeft: `3px solid ${col}`, cursor: 'pointer' }}>
                                            <span style={{ background: col, color: 'white', padding: '1px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: '600', textTransform: 'uppercase', flexShrink: 0 }}>{post.taskStatus || 'pending'}</span>
                                            {post.mediaUrl && (
                                                <span style={{ flexShrink: 0 }}>
                                                    {post.mediaType === 'video' ? miniIcon('M23 7l-7 5 7 5V7z M16 5H3a2 2 0 00-2 2v10a2 2 0 002 2h13a2 2 0 002-2V7a2 2 0 00-2-2z', '#60a5fa', 12) : miniIcon('M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5-5 5 5 M12 5v12', '#10b981', 12)}
                                                </span>
                                            )}
                                            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', flexShrink: 0, minWidth: '100px' }}>{scheduledDate.toLocaleDateString()} {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.topic || post.content?.substring(0, 60)}</span>
                                            <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                                                {post.taskStatus === 'failed' && (
                                                    <button onClick={() => { const nd = new Date(); nd.setDate(nd.getDate() + 1); setWriterScheduleDate(nd.toISOString().split('T')[0]); setWriterScheduleTime('12:00'); setWriterContent(post.content); setWriterTopic(post.topic || ''); }}
                                                        style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '4px', padding: '2px 6px', color: '#ef4444', fontSize: '9px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>{miniIcon('M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0 0 20.49 15', '#ef4444', 9)}</button>
                                                )}
                                                <button onClick={() => { if (confirm('Delete this scheduled post?')) { fetch('/api/post-drafts', { method: 'DELETE', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }, body: JSON.stringify({ id: post.id }) }).then(() => loadScheduledPosts()); } }}
                                                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '4px', padding: '2px 6px', color: '#ef4444', fontSize: '9px', cursor: 'pointer' }}>×</button>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                )}
            </div>

            {/* Saved Drafts — below calendar */}
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '14px 18px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', marginTop: '14px' }}>
                <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>
                    {miniIcon('M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z M17 21v-8H7v8 M7 3v5h8', 'white', 13)} Saved Drafts ({writerDrafts.length})
                </h4>
                {writerDrafts.length === 0 ? (
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', textAlign: 'center', padding: '10px 0' }}>No saved drafts yet</p>
                ) : (
                    <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {writerDrafts.map((draft: any) => (
                            <div key={draft.id} style={{ background: 'rgba(255,255,255,0.04)', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                    <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '10px' }}>
                                        {draft.status === 'scheduled' ? miniIcon('M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', 'rgba(255,255,255,0.45)', 10) : miniIcon('M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8', 'rgba(255,255,255,0.45)', 10)} {new Date(draft.createdAt).toLocaleDateString()}
                                    </span>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button onClick={() => { setWriterContent(draft.content); setWriterTopic(draft.topic || ''); }}
                                            style={{ background: 'rgba(105,63,233,0.2)', border: '1px solid rgba(105,63,233,0.4)', borderRadius: '5px', color: '#a78bfa', padding: '3px 8px', fontSize: '10px', cursor: 'pointer' }}>
                                            Load
                                        </button>
                                        <button onClick={() => deleteDraft(draft.id)}
                                            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '5px', color: '#f87171', padding: '3px 8px', fontSize: '10px', cursor: 'pointer' }}>
                                            ×
                                        </button>
                                    </div>
                                </div>
                                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '12px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {draft.content.substring(0, 100)}...
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* Added Sources — clickable toggles for all sources */}
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {miniIcon('M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z', '#a78bfa', 14)}
                        <span style={{ color: 'white', fontSize: '13px', fontWeight: '700' }}>Added Sources</span>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>({inspirationSources.length + sharedInspProfiles.length} profiles)</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={loadInspirationSources} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '5px', color: 'rgba(255,255,255,0.5)', padding: '4px 7px', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>{miniIcon('M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0 0 20.49 15', 'rgba(255,255,255,0.5)', 10)}</button>
                        <button onClick={() => setShowInspirationPopup(true)} style={{ background: 'linear-gradient(135deg, #693fe9, #8b5cf6)', border: 'none', borderRadius: '5px', color: 'white', padding: '5px 10px', fontSize: '10px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>{miniIcon('M12 5v14 M5 12h14', 'white', 10)} Scrape</button>
                    </div>
                </div>
                {/* Select All / Deselect All / Delete Mode */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
                    <button onClick={() => { setInspirationUseAll(true); setInspirationSelected([...inspirationSources.map((s: any) => s.name), ...sharedInspProfiles.map((p: any) => p.profileName)]); }} style={{ padding: '4px 8px', background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: '4px', color: '#34d399', fontSize: '10px', cursor: 'pointer' }}>Select All</button>
                    <button onClick={() => { setInspirationUseAll(false); setInspirationSelected([]); }} style={{ padding: '4px 8px', background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '4px', color: '#f87171', fontSize: '10px', cursor: 'pointer' }}>Deselect All</button>
                    {inspirationSources.length > 0 && (
                        <button onClick={() => {
                            if (inspirationDeleteMode) {
                                // Exit delete mode
                                setInspirationDeleteMode(false);
                                setInspirationDeleteSelected([]);
                            } else {
                                // Enter delete mode
                                setInspirationDeleteMode(true);
                                setInspirationDeleteSelected([]);
                            }
                        }} style={{ padding: '4px 8px', background: inspirationDeleteMode ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.1)', border: inspirationDeleteMode ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', color: inspirationDeleteMode ? '#f87171' : 'rgba(255,255,255,0.6)', fontSize: '10px', cursor: 'pointer' }}>
                            {inspirationDeleteMode ? 'Cancel Delete' : 'Delete'}
                        </button>
                    )}
                    {inspirationDeleteMode && inspirationDeleteSelected.length > 0 && (
                        <button onClick={async () => {
                            for (const name of inspirationDeleteSelected) {
                                await deleteInspirationSource(name);
                            }
                            setInspirationDeleteMode(false);
                            setInspirationDeleteSelected([]);
                            showToast(`Deleted ${inspirationDeleteSelected.length} source(s)`, 'success');
                        }} style={{ padding: '4px 8px', background: 'rgba(239,68,68,0.4)', border: '1px solid rgba(239,68,68,0.6)', borderRadius: '4px', color: '#fca5a5', fontSize: '10px', cursor: 'pointer', fontWeight: '600' }}>
                            Delete Selected ({inspirationDeleteSelected.length})
                        </button>
                    )}
                </div>
                {/* My Sources - clickable toggles */}
                {inspirationSources.length > 0 && (
                    <div style={{ marginBottom: '8px' }}>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', marginBottom: '6px', fontWeight: '600' }}>My Sources</div>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {inspirationSources.map((src: any, i: number) => {
                                const isChecked = inspirationUseAll || inspirationSelected.includes(src.name);
                                const isDeleteChecked = inspirationDeleteSelected.includes(src.name);
                                return (
                                    <div key={`own-${i}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: inspirationDeleteMode ? (isDeleteChecked ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.04)') : (isChecked ? 'rgba(105,63,233,0.2)' : 'rgba(255,255,255,0.04)'), border: inspirationDeleteMode ? (isDeleteChecked ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.1)') : (isChecked ? '1px solid rgba(105,63,233,0.4)' : '1px solid rgba(255,255,255,0.1)'), borderRadius: '6px', padding: '4px 8px' }}>
                                        <div onClick={() => {
                                            if (inspirationDeleteMode) {
                                                // In delete mode - toggle delete selection
                                                if (isDeleteChecked) setInspirationDeleteSelected(inspirationDeleteSelected.filter((n: string) => n !== src.name));
                                                else setInspirationDeleteSelected([...inspirationDeleteSelected, src.name]);
                                            } else {
                                                // Normal mode - toggle selection
                                                if (inspirationUseAll) { setInspirationUseAll(false); setInspirationSelected([src.name]); }
                                                else if (isChecked) setInspirationSelected(inspirationSelected.filter((n: string) => n !== src.name));
                                                else setInspirationSelected([...inspirationSelected, src.name]);
                                            }
                                        }} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', flex: 1 }}>
                                            <input type="checkbox" checked={inspirationDeleteMode ? isDeleteChecked : isChecked} readOnly style={{ accentColor: inspirationDeleteMode ? '#ef4444' : '#693fe9', width: '12px', height: '12px' }} />
                                            <span style={{ color: inspirationDeleteMode ? (isDeleteChecked ? '#f87171' : 'rgba(255,255,255,0.6)') : (isChecked ? '#a78bfa' : 'rgba(255,255,255,0.6)'), fontSize: '11px', fontWeight: '500' }}>{src.name}</span>
                                            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px' }}>{src.count}p</span>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); loadProfilePosts(src.name); }} style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '4px', padding: '2px 6px', color: '#60a5fa', fontSize: '9px', cursor: 'pointer', fontWeight: '600' }}>
                                            {miniIcon('M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', '#60a5fa', 9)}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                {/* Shared Profiles - clickable toggles */}
                {sharedInspProfiles.length > 0 && (
                    <div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', marginBottom: '6px', fontWeight: '600' }}>Kommentify Shared Profiles</div>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {sharedInspProfiles.map((p: any, i: number) => {
                                const isChecked = inspirationSelected.includes(p.profileName);
                                return (
                                    <div key={`shared-${i}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: isChecked ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)', border: isChecked ? '1px solid rgba(245,158,11,0.35)' : '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '4px 8px' }}>
                                        <div onClick={() => {
                                            if (isChecked) setInspirationSelected(inspirationSelected.filter((n: string) => n !== p.profileName));
                                            else { setInspirationUseAll(false); setInspirationSelected([...inspirationSelected, p.profileName]); }
                                        }} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', flex: 1 }}>
                                            <input type="checkbox" checked={isChecked} readOnly style={{ accentColor: '#f59e0b', width: '12px', height: '12px' }} />
                                            <span style={{ color: isChecked ? '#fbbf24' : 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: '500' }}>{p.profileName}</span>
                                            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px' }}>{p.postCount}p</span>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); loadProfilePosts(p.profileName); }} style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '4px', padding: '2px 6px', color: '#fbbf24', fontSize: '9px', cursor: 'pointer', fontWeight: '600' }}>
                                            {miniIcon('M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', '#fbbf24', 9)}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                {inspirationSources.length === 0 && sharedInspProfiles.length === 0 && (
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', textAlign: 'center', padding: '12px 0' }}>No sources yet. Click "Scrape" to add LinkedIn profiles.</div>
                )}
            </div>

            {/* Scrape Popup Modal - simplified for adding new profiles */}
            {showInspirationPopup && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowInspirationPopup(false)}>
                    <div onClick={e => e.stopPropagation()} style={{ background: '#1a1a3e', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.15)', padding: '24px', maxWidth: '500px', width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>{miniIcon('M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z', 'white', 16)} Add LinkedIn Profiles</h3>
                            <button onClick={() => setShowInspirationPopup(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', padding: '6px 10px', color: 'white', fontSize: '14px', cursor: 'pointer' }}>✕</button>
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', marginBottom: '12px' }}>Add LinkedIn profiles to learn from their writing style. AI will mimic them when generating posts.</p>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', marginBottom: '12px' }}>
                            <textarea value={inspirationProfiles} onChange={e => setInspirationProfiles(e.target.value)} placeholder={"https://linkedin.com/in/username1\nhttps://linkedin.com/in/username2"} rows={3}
                                style={{ flex: 1, padding: '10px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '12px', outline: 'none', resize: 'vertical', fontFamily: 'monospace', lineHeight: '1.5' }} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <select value={inspirationPostCount} onChange={e => setInspirationPostCount(parseInt(e.target.value))} style={{ padding: '6px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', fontSize: '11px' }}>
                                    <option value="5">5</option><option value="10">10</option><option value="15">15</option><option value="20">20</option><option value="30">30</option>
                                </select>
                                <button onClick={scrapeInspirationProfiles} disabled={inspirationScraping} style={{ padding: '10px 16px', background: inspirationScraping ? 'rgba(105,63,233,0.3)' : 'linear-gradient(135deg, #693fe9, #8b5cf6)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: inspirationScraping ? 'wait' : 'pointer', whiteSpace: 'nowrap' }}>
                                    {inspirationScraping ? 'Scraping...' : 'Scrape'}
                                </button>
                            </div>
                        </div>
                        {inspirationStatus && <div style={{ marginBottom: '12px', padding: '8px 12px', background: inspirationStatus.includes('Error') || inspirationStatus.includes('Failed') ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', border: `1px solid ${inspirationStatus.includes('Error') || inspirationStatus.includes('Failed') ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`, borderRadius: '8px', color: inspirationStatus.includes('Error') || inspirationStatus.includes('Failed') ? '#f87171' : '#34d399', fontSize: '12px' }}>{inspirationStatus}</div>}
                        <button onClick={() => setShowInspirationPopup(false)} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '12px', cursor: 'pointer' }}>Done</button>
                    </div>
                </div>
            )}

            {/* View Profile Posts Popup Modal */}
            {viewingProfilePosts && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => { setViewingProfilePosts(null); setProfilePostsData([]); }}>
                    <div onClick={e => e.stopPropagation()} style={{ background: '#1a1a3e', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.15)', padding: '24px', maxWidth: '800px', width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '700', margin: 0 }}>{viewingProfilePosts} - Posts</h3>
                            <button onClick={() => { setViewingProfilePosts(null); setProfilePostsData([]); }} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', padding: '6px 10px', color: 'white', fontSize: '14px', cursor: 'pointer' }}>✕</button>
                        </div>
                        {profilePostsLoading ? (
                            <div style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '40px 0' }}>Loading posts...</div>
                        ) : profilePostsData.length === 0 ? (
                            <div style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '40px 0' }}>No posts found for this profile.</div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                    <button onClick={() => setSelectedInspirationPosts(profilePostsData.map((_: any, i: number) => `${viewingProfilePosts}-${i}`))} style={{ padding: '6px 12px', background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: '6px', color: '#34d399', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>Select All</button>
                                    <button onClick={() => setSelectedInspirationPosts([])} style={{ padding: '6px 12px', background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '6px', color: '#f87171', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>Deselect All</button>
                                </div>
                                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {profilePostsData.map((post: any, idx: number) => {
                                        const postId = `${viewingProfilePosts}-${idx}`;
                                        const isSelected = selectedInspirationPosts.includes(postId);
                                        return (
                                            <div key={idx} onClick={() => toggleInspirationPost(postId)} style={{ background: isSelected ? 'rgba(105,63,233,0.15)' : 'rgba(255,255,255,0.05)', border: isSelected ? '1px solid rgba(105,63,233,0.4)' : '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '14px', cursor: 'pointer', transition: 'all 0.2s' }}>
                                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                                    <input type="checkbox" checked={isSelected} readOnly style={{ accentColor: '#693fe9', width: '16px', height: '16px', marginTop: '2px', flexShrink: 0 }} />
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', lineHeight: '1.6', maxHeight: '120px', overflowY: 'auto', marginBottom: '8px' }}>
                                                            {post.content || post.text || 'No content'}
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '12px', fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
                                                            {post.engagement && <span>{miniIcon('M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z', '#ec4899', 9)} {post.engagement.likes || 0}</span>}
                                                            {post.engagement && <span>{miniIcon('M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z', '#8b5cf6', 9)} {post.engagement.comments || 0}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>

    );
}
```

---

### components\WriterTabNew.tsx

```
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// High Performance Post Generator - Goal options
const POST_GOALS = [
    { id: 'reach', label: 'Reach', icon: '📈', desc: 'Maximize impressions & views' },
    { id: 'authority', label: 'Authority', icon: '👑', desc: 'Build thought leadership' },
    { id: 'conversation', label: 'Conversation', icon: '💬', desc: 'Drive comments & discussion' },
    { id: 'follower_growth', label: 'Followers', icon: '👥', desc: 'Gain new followers' },
    { id: 'trust', label: 'Trust', icon: '🤝', desc: 'Build credibility' },
    { id: 'lead_gen', label: 'Leads', icon: '🎯', desc: 'Generate business leads' },
];

// Post Types based on HIGH PERFORMANCE POST GENERATOR
const POST_TYPES = [
    { id: 'operator_insight', label: 'Operator Insight', desc: 'Behind-the-scenes knowledge' },
    { id: 'personal_story', label: 'Personal Story', desc: 'Vulnerable narrative with lesson' },
    { id: 'contrarian_take', label: 'Contrarian Take', desc: 'Challenge conventional wisdom' },
    { id: 'framework', label: 'Framework', desc: 'Step-by-step system or process' },
    { id: 'mistake_lesson', label: 'Mistake / Lesson', desc: 'What you learned the hard way' },
    { id: 'commentary', label: 'Commentary', desc: 'Industry news analysis' },
    { id: 'question_post', label: 'Question Post', desc: 'Spark discussion & debate' },
    { id: 'proof_case', label: 'Proof / Case Study', desc: 'Results with evidence' },
];

// Depth options
const DEPTH_OPTIONS = [
    { id: 'short', label: 'Short', chars: '500', desc: '~100 words' },
    { id: 'standard', label: 'Standard', chars: '1200', desc: '~250 words' },
    { id: 'deep', label: 'Deep', chars: '2500', desc: '~500 words' },
];

// Outcome Focus options
const OUTCOME_OPTIONS = [
    { id: 'conversation', label: 'Conversation', icon: '💬' },
    { id: 'saves', label: 'Saves', icon: '🔖' },
    { id: 'shares', label: 'Shares', icon: '🔄' },
    { id: 'profile_interest', label: 'Profile Interest', icon: '👤' },
    { id: 'followers', label: 'Followers', icon: '➕' },
];

export default function WriterTabNew(props: any) {
    const {
        // Core
        t, user, usage, router, miniIcon, showToast, setActiveTab, isFreePlan, showUpgradeModal, setShowUpgradeModal, dashLang, isDeveloper,
        // All other props
        writerTopic, setWriterTopic, writerTemplate, setWriterTemplate, writerTone, setWriterTone,
        writerLength, setWriterLength, writerHashtags, setWriterHashtags, writerEmojis, setWriterEmojis,
        writerLanguage, setWriterLanguage, writerContent, setWriterContent,
        writerGenerating, setWriterGenerating, writerScheduleDate, setWriterScheduleDate, writerScheduleTime, setWriterScheduleTime,
        writerDrafts, writerScheduledPosts, writerTokenUsage, writerImageFile, setWriterImageFile,
        writerImageUrl, setWriterImageUrl, writerMediaBlobUrl, setWriterMediaBlobUrl,
        writerMediaType, setWriterMediaType, writerUploading, setWriterUploading,
        writerPreviewMode, setWriterPreviewMode, writerPreviewExpanded, setWriterPreviewExpanded,
        writerUseLinkedInAPI, setWriterUseLinkedInAPI, fileInputRef, writerStatus, setWriterStatus, writerModel,
        writerPosting, MODEL_OPTIONS, handleWriterModelChange,
        userGoal, setUserGoal, userTargetAudience, setUserTargetAudience,
        userWritingStyle, setUserWritingStyle, userWritingStyleSource, setUserWritingStyleSource,
        goalsLoading, goalsSuggesting, loadUserGoals, saveUserGoals, suggestGoals,
        generatePost, saveDraft, loadDrafts, loadScheduledPosts, sendToExtension, schedulePost, deleteDraft,
        savedPosts, savedPostsLoading, inspirationSources, inspirationLoading, inspirationSelected, setInspirationSelected,
        useProfileData, setUseProfileData, loadInspirationSources, sharedInspProfiles, linkedInProfile,
        voyagerData, voyagerLoading, loadVoyagerData, generateTopicSuggestions,
        linkedInUseProfileData, setLinkedInUseProfileData, linkedInTopicSuggestions, linkedInGeneratingTopics,
        showLinkedInDataModal, setShowLinkedInDataModal, toggleLinkedInProfileData, selectTopicSuggestion,
        taskCounts, calendarMonth, setCalendarMonth, calendarYear, setCalendarYear,
        showInspirationPopup, setShowInspirationPopup, plannerOpen, setPlannerOpen
    } = props;

    // High Performance Post Generator state
    const [postGoal, setPostGoal] = useState<string>('reach');
    const [postType, setPostType] = useState<string>('operator_insight');
    const [postDepth, setPostDepth] = useState<string>('standard');
    const [outcomeF, setOutcomeF] = useState<string>('conversation');
    const [postStrength, setPostStrength] = useState<number>(50); // 0-100 slider

    // Analysis state
    const [analysisData, setAnalysisData] = useState<any>(null);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);

    // Hook generator state
    const [hooks, setHooks] = useState<any[]>([]);
    const [hooksGenerating, setHooksGenerating] = useState(false);
    const [selectedHook, setSelectedHook] = useState<string>('');
    const [hookCategory, setHookCategory] = useState<string>('all');
    const [hooksStatus, setHooksStatus] = useState('');

    // AI Chatbot state
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [chatSending, setChatSending] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Auto-fill from profile data
    const [writerTargetAudience, setWriterTargetAudience] = useState(userTargetAudience || '');
    const [writerKeyMessage, setWriterKeyMessage] = useState('');
    const [writerBackground, setWriterBackground] = useState(
        voyagerData?.headline || linkedInProfile?.headline || ''
    );

    // Sync depth to length
    useEffect(() => {
        const depthOpt = DEPTH_OPTIONS.find(d => d.id === postDepth);
        if (depthOpt) setWriterLength(depthOpt.chars);
    }, [postDepth]);

    // Sync post type to template
    useEffect(() => {
        const typeMap: Record<string, string> = {
            'operator_insight': 'thought_leadership',
            'personal_story': 'personal_story',
            'contrarian_take': 'controversial',
            'framework': 'how_to',
            'mistake_lesson': 'personal_story',
            'commentary': 'insight',
            'question_post': 'question',
            'proof_case': 'case_study'
        };
        if (typeMap[postType]) setWriterTemplate(typeMap[postType]);
    }, [postType]);

    // AI-powered post analysis (replaces heuristic)
    const analyzePost = async () => {
        if (!writerContent.trim()) {
            showToast('Please generate or write a post first', 'error');
            return;
        }
        if (isFreePlan) { 
            setShowUpgradeModal(true); 
            return; 
        }
        
        setAnalyzing(true);
        setShowAnalysis(true);
        setAnalysisData(null);
        
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setAnalysisData({ error: 'Not authenticated. Please refresh and log in again.' });
                setAnalyzing(false);
                return;
            }

            const res = await fetch('/api/ai/analyze-post-deep', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    postContent: writerContent,
                    authorHeadline: voyagerData?.headline || linkedInProfile?.headline || '',
                    model: writerModel
                }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error('Analyze API error:', res.status, errorText);
                setAnalysisData({ 
                    error: `API Error (${res.status}): ${errorText.substring(0, 100)}` 
                });
                showToast(`Analysis failed: ${res.status}`, 'error');
                setAnalyzing(false);
                return;
            }

            const data = await res.json();
            if (data.success && data.analysis) {
                setAnalysisData(data.analysis);
                showToast('Analysis complete!', 'success');
            } else {
                const errorMsg = data.error || 'Analysis failed - no data returned';
                setAnalysisData({ error: errorMsg });
                showToast(errorMsg, 'error');
                console.error('Analysis failed:', data);
            }
        } catch (e: any) {
            const errorMsg = 'Network error: ' + (e.message || 'Could not connect to server');
            setAnalysisData({ error: errorMsg });
            showToast(errorMsg, 'error');
            console.error('Analyze post exception:', e);
        } finally {
            setAnalyzing(false);
        }
    };

    // Generate hooks
    const generateHooks = async () => {
        if (isFreePlan) { 
            setShowUpgradeModal(true); 
            return; 
        }
        if (!writerTopic.trim()) { 
            setHooksStatus('Please enter a topic first'); 
            showToast('Please enter a topic first', 'error');
            return; 
        }

        setHooksGenerating(true);
        setHooksStatus('Generating 10 hook variations...');
        
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setHooksStatus('Not authenticated. Please refresh and log in again.');
                showToast('Authentication error', 'error');
                setHooksGenerating(false);
                return;
            }

            const res = await fetch('/api/ai/generate-hooks', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    topic: writerTopic,
                    voiceProfile: `${writerTone}, ${userGoal || 'engaging'}`,
                    goal: userGoal || 'Maximize engagement',
                    model: writerModel
                }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error('Generate hooks API error:', res.status, errorText);
                const errorMsg = `API Error (${res.status}): ${errorText.substring(0, 100)}`;
                setHooksStatus(errorMsg);
                showToast(`Hook generation failed: ${res.status}`, 'error');
                setHooksGenerating(false);
                return;
            }

            const data = await res.json();
            if (data.success && data.hooks) {
                setHooks(data.hooks);
                setHooksStatus(`Generated ${data.hooks.length} hooks! Click one to select.`);
                showToast(`${data.hooks.length} hooks generated!`, 'success');
            } else {
                const errorMsg = data.error || 'Failed to generate hooks - no data returned';
                setHooksStatus(errorMsg);
                showToast(errorMsg, 'error');
                console.error('Hook generation failed:', data);
            }
        } catch (e: any) {
            const errorMsg = 'Network error: ' + (e.message || 'Could not connect to server');
            setHooksStatus(errorMsg);
            showToast(errorMsg, 'error');
            console.error('Generate hooks exception:', e);
        } finally {
            setHooksGenerating(false);
        }
    };

    // Generate full post (with or without selected hook)
    const generatePostWithHook = async () => {
        if (isFreePlan) { 
            setShowUpgradeModal(true); 
            return; 
        }
        if (!writerTopic.trim()) { 
            setWriterStatus('Please enter a topic first'); 
            showToast('Please enter a topic first', 'error');
            return; 
        }

        setWriterGenerating(true);
        setWriterStatus(selectedHook ? 'Generating post with selected hook...' : 'Generating post...');
        
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setWriterStatus('Not authenticated. Please refresh and log in again.');
                showToast('Authentication error', 'error');
                setWriterGenerating(false);
                return;
            }

            const res = await fetch('/api/ai/generate-post-with-hook', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    selectedHook,
                    topic: writerTopic,
                    template: writerTemplate,
                    tone: writerTone,
                    length: writerLength,
                    includeHashtags: writerHashtags,
                    includeEmojis: writerEmojis,
                    language: writerLanguage,
                    targetAudience: writerTargetAudience || userTargetAudience,
                    keyMessage: writerKeyMessage,
                    userBackground: writerBackground,
                    useInspirationSources: userWritingStyleSource !== 'user_default',
                    inspirationSourceNames: userWritingStyleSource.startsWith('insp_')
                        ? [userWritingStyleSource.replace('insp_', '')]
                        : userWritingStyleSource.startsWith('shared_')
                            ? [userWritingStyleSource.replace('shared_', '')]
                            : [],
                    useProfileData: linkedInUseProfileData && voyagerData,
                    profileData: linkedInUseProfileData && voyagerData ? {
                        headline: voyagerData.headline,
                        about: voyagerData.about,
                        location: voyagerData.location,
                        skills: voyagerData.skills,
                        experience: voyagerData.experience,
                        recentPosts: voyagerData.recentPosts,
                    } : null,
                    model: writerModel,
                    userGoal,
                    postGoal,
                    postType,
                    postDepth,
                    outcomeF,
                }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error('Generate post API error:', res.status, errorText);
                const errorMsg = `API Error (${res.status}): ${errorText.substring(0, 100)}`;
                setWriterStatus(errorMsg);
                showToast(`Post generation failed: ${res.status}`, 'error');
                setWriterGenerating(false);
                return;
            }

            const data = await res.json();
            if (data.success && data.content) {
                setWriterContent(data.content);
                setWriterStatus('Post generated! Review and edit as needed.');
                setWriterPreviewMode('desktop');
                setWriterPreviewExpanded(false);
                showToast('Post generated successfully!', 'success');
            } else {
                const errorMsg = data.error || 'Generation failed - no content returned';
                setWriterStatus(errorMsg);
                showToast(errorMsg, 'error');
                console.error('Post generation failed:', data);
            }
        } catch (e: any) {
            const errorMsg = 'Network error: ' + (e.message || 'Could not connect to server');
            setWriterStatus(errorMsg);
            showToast(errorMsg, 'error');
            console.error('Generate post exception:', e);
        } finally {
            setWriterGenerating(false);
        }
    };

    // AI Chatbot send message
    const sendChatMessage = async () => {
        if (!chatInput.trim() || chatSending) return;

        const userMsg = { role: 'user', content: chatInput };
        setChatMessages([...chatMessages, userMsg]);
        setChatInput('');
        setChatSending(true);

        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('/api/ai/post-helper', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    messages: [...chatMessages, userMsg],
                    currentPost: writerContent,
                    model: writerModel
                }),
            });
            const data = await res.json();
            if (data.success) {
                setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
                setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            }
        } catch (e) {
            console.error('Chat error:', e);
        } finally {
            setChatSending(false);
        }
    };

    const filteredHooks = hookCategory === 'all' ? hooks : hooks.filter((h: any) => h.category === hookCategory);

    return (
        <div style={{ padding: 0 }}>
            {/* Voyager LinkedIn Profile Banner */}
            <div style={{ background: 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)', padding: '14px 18px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.15)', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                        {typeof voyagerData?.profilePicture === 'string' && voyagerData.profilePicture ? (
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0, border: '2px solid rgba(255,255,255,0.3)', background: `url(${voyagerData.profilePicture}) center/cover no-repeat` }} />
                        ) : (
                            <span style={{ flexShrink: 0 }}>{miniIcon('M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71', 'white', 18)}</span>
                        )}
                        {voyagerData ? (
                            <div style={{ minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ color: 'white', fontSize: '14px', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{voyagerData.name || 'LinkedIn Profile'}</span>
                                    {voyagerData.followerCount && <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', flexShrink: 0 }}>{voyagerData.followerCount.toLocaleString()} followers</span>}
                                </div>
                                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{voyagerData.headline || ''}</div>
                            </div>
                        ) : (
                            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>{voyagerLoading ? 'Loading...' : 'Connect extension to sync profile'}</span>
                        )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, marginLeft: '12px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                            <input type="checkbox" checked={linkedInUseProfileData} onChange={e => toggleLinkedInProfileData(e.target.checked)}
                                style={{ width: '14px', height: '14px', accentColor: '#0077b5' }} />
                            <span style={{ color: 'white', fontSize: '11px' }}>Profile Data Active</span>
                        </label>
                        {voyagerData && <button onClick={generateTopicSuggestions} disabled={linkedInGeneratingTopics}
                            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '6px', padding: '5px 10px', color: 'white', fontSize: '10px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            {linkedInGeneratingTopics ? '...' : <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>{miniIcon('M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', 'white', 11)} Topics</span>}
                        </button>}
                        {voyagerData && <button onClick={() => setShowLinkedInDataModal(true)}
                            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '6px', padding: '5px 10px', color: 'white', fontSize: '10px', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '3px' }}>{miniIcon('M18 20V10 M12 20V4 M6 20v-6', 'white', 10)} Data</button>}
                        <button onClick={() => loadVoyagerData()} disabled={voyagerLoading}
                            style={{ background: 'white', color: '#0077b5', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: voyagerLoading ? 'wait' : 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {voyagerLoading ? '...' : <>{miniIcon('M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0 0 20.49 15', '#0077b5', 12)} Sync</>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Personal Brand Strategy */}
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px 20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ color: 'white', fontSize: '14px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {miniIcon('M13 10V3L4 14h7v7l9-11h-7z', '#fbbf24', 16)} Personal Brand Strategy
                    </h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {(!userGoal && !userTargetAudience) ? (
                            <button onClick={suggestGoals} disabled={goalsSuggesting || !voyagerData}
                                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', borderRadius: '8px', padding: '6px 14px', color: 'white', fontSize: '11px', fontWeight: 'bold', cursor: (goalsSuggesting || !voyagerData) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', opacity: voyagerData ? 1 : 0.5 }}>
                                {goalsSuggesting ? 'Suggesting...' : '✨ Suggest Strategy'}
                            </button>
                        ) : (
                            <button onClick={saveUserGoals}
                                style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: '6px', padding: '6px 12px', color: '#34d399', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                                Save Strategy
                            </button>
                        )}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>Content Goal</label>
                        <input type="text" value={userGoal} onChange={e => setUserGoal(e.target.value)} placeholder="e.g. Build authority in B2B SaaS"
                            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: 'white', fontSize: '12px', width: '100%', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>Target Audience</label>
                        <input type="text" value={writerTargetAudience} onChange={e => setWriterTargetAudience(e.target.value)} placeholder="e.g. Startup Founders"
                            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: 'white', fontSize: '12px', width: '100%', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>Your Background</label>
                        <input type="text" value={writerBackground} onChange={e => setWriterBackground(e.target.value)} placeholder="e.g. CEO at TechCorp"
                            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: 'white', fontSize: '12px', width: '100%', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>Writing Style (Inspiration)</label>
                        <select value={userWritingStyleSource} onChange={e => setUserWritingStyleSource(e.target.value)}
                            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: 'white', fontSize: '12px', width: '100%', outline: 'none', cursor: 'pointer' }}>
                            <option value="user_default">My Own Top Posts</option>
                            {inspirationSources && inspirationSources.map((s: any, idx: number) => (
                                <option key={idx} value={`insp_${s.name}`}>{s.name}</option>
                            ))}
                            {sharedInspProfiles && sharedInspProfiles.map((s: any, idx: number) => (
                                <option key={`shared_${idx}`} value={`shared_${s.profileName}`}>{s.profileName} (Shared)</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* High Performance Post Generator Flow */}
            <div style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(59,130,246,0.08) 100%)', padding: '16px 20px', borderRadius: '14px', border: '1px solid rgba(139,92,246,0.2)', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <h3 style={{ color: 'white', fontSize: '14px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {miniIcon('M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', '#a78bfa', 16)} High Performance Post Generator
                    </h3>
                </div>

                {/* Goal & Post Type Selection */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
                    {/* Goal Selection */}
                    <div>
                        <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginBottom: '8px', display: 'block' }}>🎯 Post Goal</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                            {POST_GOALS.map(goal => (
                                <button key={goal.id} onClick={() => setPostGoal(goal.id)}
                                    style={{ padding: '8px 6px', background: postGoal === goal.id ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.05)', border: postGoal === goal.id ? '1px solid rgba(139,92,246,0.6)' : '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: postGoal === goal.id ? '#a78bfa' : 'rgba(255,255,255,0.7)', fontSize: '10px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', transition: 'all 0.2s' }}>
                                    <span style={{ fontSize: '14px' }}>{goal.icon}</span>
                                    <span style={{ fontWeight: '600' }}>{goal.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Post Type Selection */}
                    <div>
                        <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginBottom: '8px', display: 'block' }}>📝 Post Type</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                            {POST_TYPES.map(type => (
                                <button key={type.id} onClick={() => setPostType(type.id)}
                                    style={{ padding: '6px 4px', background: postType === type.id ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.05)', border: postType === type.id ? '1px solid rgba(59,130,246,0.6)' : '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: postType === type.id ? '#60a5fa' : 'rgba(255,255,255,0.7)', fontSize: '9px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s', textAlign: 'center' }}>
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Depth Selection - single row */}
                <div>
                    <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginBottom: '8px', display: 'block' }}>📏 Depth</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        {DEPTH_OPTIONS.map(depth => (
                            <button key={depth.id} onClick={() => setPostDepth(depth.id)}
                                style={{ flex: 1, padding: '8px 6px', background: postDepth === depth.id ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.05)', border: postDepth === depth.id ? '1px solid rgba(16,185,129,0.6)' : '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: postDepth === depth.id ? '#34d399' : 'rgba(255,255,255,0.7)', fontSize: '10px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}>
                                {depth.label} <span style={{ opacity: 0.6, fontSize: '9px' }}>({depth.desc})</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* AI-Powered Analysis Panel - moved to AI Post Helper column */}
            </div>

            {/* 3 Column Layout: AI Post Helper, Hook Generator + Config, LinkedIn Preview */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.3fr', gap: '16px', marginBottom: '16px' }}>
                {/* Column 1: AI Post Helper with scrollbar */}
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', maxHeight: '650px' }}>
                    <h3 style={{ color: 'white', fontSize: '13px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        {miniIcon('M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z', '#60a5fa', 13)} AI Post Helper
                    </h3>

                    {/* Analyze Post Button */}
                    {writerContent.trim() && (
                        <button onClick={analyzePost} disabled={analyzing}
                            style={{ width: '100%', padding: '10px', background: analyzing ? 'rgba(139,92,246,0.3)' : 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(59,130,246,0.2))', border: '1px solid rgba(139,92,246,0.4)', borderRadius: '8px', color: '#a78bfa', fontSize: '11px', fontWeight: '700', cursor: analyzing ? 'wait' : 'pointer', marginBottom: '10px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s' }}>
                            {miniIcon('M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', '#a78bfa', 12)}
                            {analyzing ? 'Analyzing with AI...' : 'Analyze Post'}
                        </button>
                    )}

                    {/* AI Analysis Results Panel */}
                    {showAnalysis && (
                        <div style={{ marginBottom: '10px', flexShrink: 0, maxHeight: '350px', overflowY: 'auto' }}>
                            {analyzing ? (
                                <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', border: '1px solid rgba(139,92,246,0.2)' }}>
                                    <div style={{ color: '#a78bfa', fontSize: '12px', marginBottom: '8px' }}>Analyzing your post against Q1 2026 LinkedIn algorithm...</div>
                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>Built to compare against current algorithm research</div>
                                </div>
                            ) : analysisData?.error ? (
                                <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: '11px' }}>
                                    {analysisData.error}
                                    <button onClick={() => setShowAnalysis(false)} style={{ float: 'right', background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>×</button>
                                </div>
                            ) : analysisData ? (
                                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '10px', border: '1px solid rgba(139,92,246,0.2)', overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                        <span style={{ color: 'white', fontSize: '11px', fontWeight: '700' }}>📊 AI Post Analysis</span>
                                        <button onClick={() => setShowAnalysis(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '12px' }}>×</button>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', padding: '10px' }}>
                                        {[
                                            { label: 'Human Score', data: analysisData.humanScore, good: (s: number) => s >= 70 },
                                            { label: 'Performance', data: analysisData.performanceStrength, good: (s: number) => s >= 70 },
                                            { label: 'Reach Potential', data: analysisData.reachPotential, good: (s: number) => s >= 70 },
                                            { label: 'AI Pattern Risk', data: analysisData.aiPatternRisk, good: (s: number) => s <= 30 },
                                        ].map((metric, idx) => {
                                            const score = metric.data?.score ?? 0;
                                            const isGood = metric.good(score);
                                            const isMid = metric.label === 'AI Pattern Risk' ? (score > 30 && score <= 50) : (score >= 50 && score < 70);
                                            const color = isGood ? '#34d399' : isMid ? '#fbbf24' : '#f87171';
                                            return (
                                                <div key={idx} style={{ padding: '8px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '9px', fontWeight: '600' }}>{metric.label}</span>
                                                        <span style={{ color, fontSize: '16px', fontWeight: '700' }}>{score}</span>
                                                    </div>
                                                    {metric.data?.reasoning && (
                                                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px', lineHeight: '1.4' }}>{metric.data.reasoning.substring(0, 120)}{metric.data.reasoning.length > 120 ? '...' : ''}</div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {analysisData.overallVerdict && (
                                        <div style={{ padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(139,92,246,0.08)' }}>
                                            <div style={{ color: '#c4b5fd', fontSize: '10px', fontWeight: '600', marginBottom: '2px' }}>Verdict</div>
                                            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px', lineHeight: '1.4' }}>{analysisData.overallVerdict}</div>
                                        </div>
                                    )}
                                    {analysisData.topImprovements && analysisData.topImprovements.length > 0 && (
                                        <div style={{ padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '9px', fontWeight: '600', marginBottom: '4px' }}>💡 Top Improvements</div>
                                            {analysisData.topImprovements.slice(0, 3).map((tip: string, i: number) => (
                                                <div key={i} style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px', padding: '3px 0', lineHeight: '1.3' }}>• {tip}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </div>
                    )}

                    <div style={{ flex: 1, overflowY: 'auto', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: 0 }}>
                        {chatMessages.length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center' }}>
                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '12px' }}>Ask me anything about your post:</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                                    {['Help me find ideas', 'Make it casual', 'More formal', 'Shorter version'].map(q => (
                                        <button key={q} onClick={() => { setChatInput(q); setTimeout(() => sendChatMessage(), 100); }}
                                            style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'rgba(255,255,255,0.6)', fontSize: '11px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}
                                            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                                            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}>
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                {chatMessages.map((msg, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: msg.role === 'user' ? 'linear-gradient(135deg, #693fe9, #8b5cf6)' : 'linear-gradient(135deg, #0077b5, #00a0dc)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '11px', fontWeight: '700', flexShrink: 0 }}>
                                            {msg.role === 'user' ? 'U' : 'AI'}
                                        </div>
                                        <div style={{ flex: 1, background: msg.role === 'user' ? 'rgba(105,63,233,0.1)' : 'rgba(59,130,246,0.1)', padding: '10px 14px', borderRadius: '10px', color: 'rgba(255,255,255,0.85)', fontSize: '12px', lineHeight: '1.6' }}>
                                            {msg.role === 'user' ? (
                                                msg.content
                                            ) : (
                                                <div className="prose prose-invert prose-sm" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                        {msg.content}
                                                    </ReactMarkdown>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <div ref={chatEndRef} />
                            </>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && sendChatMessage()}
                            placeholder="Ask for help or ideas..."
                            style={{ flex: 1, padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '12px', outline: 'none' }} />
                        <button onClick={sendChatMessage} disabled={!chatInput.trim() || chatSending}
                            style={{ padding: '10px 16px', background: chatSending ? 'rgba(59,130,246,0.3)' : 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', border: 'none', borderRadius: '8px', cursor: chatSending || !chatInput.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {chatSending ? '...' : <>{miniIcon('M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7z', 'white', 12)}</>}
                        </button>
                    </div>
                </div>

                {/* Column 2: Hook Generator + Config (merged) */}
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', maxHeight: '650px' }}>
                    <h3 style={{ color: 'white', fontSize: '13px', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        {miniIcon('M13 10V3L4 14h7v7l9-11h-7z', '#fbbf24', 14)} Hook Generator & Config
                    </h3>

                    {/* Topic Input */}
                    <div style={{ marginBottom: '10px', flexShrink: 0 }}>
                        <textarea value={writerTopic} onChange={e => setWriterTopic(e.target.value)}
                            placeholder="What do you want to write about?"
                            style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '12px', outline: 'none', resize: 'none', minHeight: '50px', fontFamily: 'system-ui, sans-serif' }} />
                    </div>

                    <button onClick={generateHooks} disabled={hooksGenerating || !writerTopic.trim()}
                        style={{ width: '100%', padding: '10px', background: hooksGenerating ? 'rgba(245,158,11,0.5)' : 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: hooksGenerating || !writerTopic.trim() ? 'not-allowed' : 'pointer', marginBottom: '10px', flexShrink: 0 }}>
                        {hooksGenerating ? 'Generating...' : '⚡ Generate Hooks'}
                    </button>

                    {hooks.length > 0 && (
                        <>
                            <div style={{ display: 'flex', gap: '4px', marginBottom: '8px', flexWrap: 'wrap', flexShrink: 0 }}>
                                {['all', 'question', 'bold', 'story'].map(cat => (
                                    <button key={cat} onClick={() => setHookCategory(cat === 'bold' ? 'bold_statement' : cat === 'story' ? 'anecdote' : cat)}
                                        style={{ padding: '4px 8px', background: (hookCategory === cat || (cat === 'bold' && hookCategory === 'bold_statement') || (cat === 'story' && hookCategory === 'anecdote')) ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '4px', color: 'rgba(255,255,255,0.7)', fontSize: '9px', cursor: 'pointer', textTransform: 'capitalize' }}>
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            <div style={{ maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                                {filteredHooks.map((hook, i) => (
                                    <div key={i} onClick={() => setSelectedHook(hook.text)}
                                        style={{ padding: '8px', background: selectedHook === hook.text ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.04)', border: selectedHook === hook.text ? '2px solid #fbbf24' : '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' }}>
                                        <div style={{ color: 'white', fontSize: '11px', lineHeight: '1.4' }}>{hook.text}</div>
                                        {selectedHook === hook.text && <span style={{ color: '#34d399', fontSize: '10px' }}>✓ Selected</span>}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {hooks.length === 0 && (
                        <div style={{ padding: '10px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginBottom: '10px' }}>
                            Enter a topic and generate hooks
                        </div>
                    )}

                    {/* Config Section - simplified */}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px', marginTop: 'auto' }}>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-end' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', marginBottom: '4px', display: 'block' }}>AI Model</label>
                                <select value={writerModel} onChange={e => handleWriterModelChange(e.target.value)}
                                    style={{ width: '100%', padding: '6px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: 'white', fontSize: '10px', cursor: 'pointer', outline: 'none' }}>
                                    {MODEL_OPTIONS.map((m: any) => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', paddingBottom: '4px' }}>
                                <input type="checkbox" checked={writerHashtags} onChange={e => setWriterHashtags(e.target.checked)} 
                                    style={{ width: '12px', height: '12px', accentColor: '#a78bfa', cursor: 'pointer' }} />
                                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '10px' }}>Hashtags</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', paddingBottom: '4px' }}>
                                <input type="checkbox" checked={writerEmojis} onChange={e => setWriterEmojis(e.target.checked)} 
                                    style={{ width: '12px', height: '12px', accentColor: '#a78bfa', cursor: 'pointer' }} />
                                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '10px' }}>Emojis</span>
                            </label>
                        </div>

                        <button onClick={generatePostWithHook} 
                            disabled={writerGenerating || !writerTopic.trim()}
                            style={{ width: '100%', padding: '12px', background: writerGenerating ? 'rgba(105,63,233,0.5)' : 'linear-gradient(135deg, #693fe9 0%, #8b5cf6 100%)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: (writerGenerating || !writerTopic.trim()) ? 'not-allowed' : 'pointer', boxShadow: '0 4px 15px rgba(105,63,233,0.4)', transition: 'all 0.2s' }}
                            onMouseOver={e => { if (!writerGenerating && writerTopic.trim()) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                            onMouseOut={e => e.currentTarget.style.transform = 'none'}>
                            {writerGenerating ? 'Generating Post...' : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>{miniIcon('M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z', 'white', 14)} {selectedHook ? 'Generate Full Post with Hook' : 'Generate Post'}</span>}
                        </button>

                        {writerStatus && (
                            <div style={{ marginTop: '8px', padding: '8px 12px', background: writerStatus.includes('Error') || writerStatus.includes('failed') ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', border: `1px solid ${writerStatus.includes('Error') || writerStatus.includes('failed') ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`, borderRadius: '8px', color: writerStatus.includes('Error') || writerStatus.includes('failed') ? '#f87171' : '#34d399', fontSize: '11px' }}>
                                {writerStatus}
                            </div>
                        )}
                    </div>
                </div>

                {/* Column 3: LinkedIn Preview */}
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', maxHeight: '650px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexShrink: 0 }}>
                        <span style={{ color: 'white', fontSize: '13px', fontWeight: '700' }}>LinkedIn Preview</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            {(['desktop', 'mobile'] as const).map(mode => (
                                <button key={mode} onClick={() => setWriterPreviewMode(writerPreviewMode === mode ? 'desktop' : mode)}
                                    style={{ padding: '3px 8px', background: writerPreviewMode === mode ? 'rgba(0,119,181,0.3)' : 'rgba(255,255,255,0.06)', border: writerPreviewMode === mode ? '1px solid rgba(0,119,181,0.5)' : '1px solid rgba(255,255,255,0.12)', borderRadius: '4px', color: writerPreviewMode === mode ? '#60a5fa' : 'rgba(255,255,255,0.5)', fontSize: '10px', cursor: 'pointer', fontWeight: '600' }}>
                                    {mode === 'desktop' ? '🖥 Desktop' : '📱 Mobile'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {
                        writerContent.trim() ? (() => {
                            const isMobile = writerPreviewMode === 'mobile';
                            const maxW = isMobile ? '375px' : '100%';
                            const TRUNCATE_LINES = isMobile ? 3 : 5;
                            const lines = writerContent.split('\n');
                            const truncated = lines.length > TRUNCATE_LINES && !writerPreviewExpanded;
                            const displayText = truncated ? lines.slice(0, TRUNCATE_LINES).join('\n') : writerContent;
                            
                            // Use fresh user-specific data with proper fallbacks
                            const profileName = voyagerData?.name || linkedInProfile?.name || user?.name || user?.email?.split('@')[0] || 'Your Name';
                            const profileHeadline = voyagerData?.headline || linkedInProfile?.headline || user?.email || 'Your Headline';
                            const profilePicture = voyagerData?.profilePicture || null;
                            
                            // Log for debugging data isolation
                            if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
                                console.log('[LinkedIn Preview] Using data for:', { 
                                    name: profileName, 
                                    headline: profileHeadline?.substring(0, 30),
                                    userId: user?.id,
                                    hasVoyager: !!voyagerData,
                                    hasLinkedIn: !!linkedInProfile
                                });
                            }
                            
                            return (
                                <div style={{ maxWidth: maxW, margin: '0 auto', background: '#1b1f23', borderRadius: '10px', border: '1px solid #38434f', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                                    <div style={{ padding: isMobile ? '10px 12px' : '12px 16px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                        <div style={{ width: isMobile ? '36px' : '48px', height: isMobile ? '36px' : '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #0077b5, #00a0dc)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: isMobile ? '14px' : '18px', flexShrink: 0 }}>{(profileName?.[0] || 'U').toUpperCase()}</div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ color: 'white', fontWeight: '600', fontSize: isMobile ? '13px' : '14px', lineHeight: '1.3' }}>{profileName}</div>
                                            <div style={{ color: '#ffffffb3', fontSize: isMobile ? '11px' : '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profileHeadline}</div>
                                            <div style={{ color: '#ffffff80', fontSize: '11px', marginTop: '2px' }}>Just now · {miniIcon('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', '#ffffff80', 10)}</div>
                                        </div>
                                    </div>
                                    <div style={{ padding: isMobile ? '0 12px 10px' : '0 16px 12px' }}>
                                        <div contentEditable suppressContentEditableWarning onBlur={e => setWriterContent(e.currentTarget.textContent || '')}
                                            style={{ color: '#ffffffe6', fontSize: isMobile ? '13px' : '14px', lineHeight: '1.5', whiteSpace: 'pre-wrap', wordBreak: 'break-word', outline: 'none', cursor: 'text' }}>
                                            {displayText}
                                        </div>
                                        {truncated && <span onClick={() => setWriterPreviewExpanded(true)} style={{ color: '#ffffff80', cursor: 'pointer' }}>... <span style={{ color: '#70b5f9' }}>see more</span></span>}
                                        {writerPreviewExpanded && lines.length > TRUNCATE_LINES && (
                                            <span onClick={() => setWriterPreviewExpanded(false)} style={{ color: '#70b5f9', cursor: 'pointer', fontSize: '13px' }}>show less</span>
                                        )}
                                    </div>
                                    {writerImageUrl && (
                                        <div style={{ borderTop: '1px solid #38434f' }}>
                                            {writerMediaType === 'video' ? (
                                                <video src={writerImageUrl} controls style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', background: '#000' }} />
                                            ) : (
                                                <img src={writerImageUrl} alt="Post media" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }} />
                                            )}
                                        </div>
                                    )}
                                    <div style={{ padding: isMobile ? '8px 12px' : '8px 16px', borderTop: '1px solid #38434f' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ffffff80', fontSize: isMobile ? '11px' : '12px' }}>
                                            <span>👍 ❤️ 💡</span>
                                            <span>0 comments · 0 reposts</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-around', padding: '4px 0', borderTop: '1px solid #38434f' }}>
                                        {['👍 Like', '💬 Comment', '🔄 Repost', '✈️ Send'].map(action => (
                                            <div key={action} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '10px 8px', color: '#ffffff80', fontSize: isMobile ? '11px' : '12px', fontWeight: '600' }}>{action}</div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })() : (
                            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
                                Generate a post to see live preview
                            </div>
                        )
                    }

                    {/* Publishing Actions */}
                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input type="file" ref={fileInputRef} accept="image/jpeg,image/png,image/gif,image/webp,video/webm,video/mp4" style={{ display: 'none' }}
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const isVideo = file.type.startsWith('video/');
                                    setWriterImageFile(file);
                                    setWriterMediaType(isVideo ? 'video' : 'image');
                                    const reader = new FileReader();
                                    reader.onload = (ev) => setWriterImageUrl(ev.target?.result as string);
                                    reader.readAsDataURL(file);
                                    setWriterUploading(true);
                                    try {
                                        const token = localStorage.getItem('authToken');
                                        const formData = new FormData();
                                        formData.append('file', file);
                                        const res = await fetch('/api/upload', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
                                        const data = await res.json();
                                        if (data.success) {
                                            setWriterMediaBlobUrl(data.url);
                                            showToast(`${isVideo ? 'Video' : 'Image'} uploaded!`, 'success');
                                        }
                                    } catch (err: any) { showToast('Upload failed', 'error'); }
                                    finally { setWriterUploading(false); }
                                }} />
                            <button onClick={() => fileInputRef.current?.click()} disabled={writerUploading}
                                style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', padding: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '11px', cursor: writerUploading ? 'wait' : 'pointer' }}>
                                {miniIcon('M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'rgba(255,255,255,0.7)', 12)}
                                {writerUploading ? 'Uploading...' : writerImageFile ? 'Change Media' : 'Attach Media'}
                            </button>
                            {writerImageUrl && (
                                <button onClick={() => { setWriterImageFile(null); setWriterImageUrl(''); setWriterMediaBlobUrl(''); setWriterMediaType(''); }}
                                    style={{ background: 'rgba(239,68,68,0.2)', border: 'none', padding: '10px', borderRadius: '8px', color: '#f87171', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                            )}
                        </div>

                        {/* Post via Extension API (Voyager) - default for non-OAuth users */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={async () => {
                                if (!writerContent.trim()) return;
                                const token = localStorage.getItem('authToken');
                                if (!token) return;
                                setWriterStatus('Posting via extension API...');
                                try {
                                    const res = await fetch('/api/extension/command', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                        body: JSON.stringify({
                                            command: 'linkedin_post_via_api',
                                            data: { content: writerContent, mediaUrl: writerMediaBlobUrl || null }
                                        })
                                    });
                                    const data = await res.json();
                                    if (data.success) {
                                        showToast('Post sent to extension! Publishing via LinkedIn API...', 'success');
                                        setWriterStatus('Task queued - extension will post via LinkedIn API');
                                    } else {
                                        showToast(data.error || 'Failed to queue post', 'error');
                                        setWriterStatus('Failed: ' + (data.error || 'Unknown error'));
                                    }
                                } catch (e: any) { showToast('Error: ' + e.message, 'error'); setWriterStatus('Error: ' + e.message); }
                            }} disabled={writerPosting || !writerContent.trim()}
                                style={{ flex: 1, padding: '12px', background: writerPosting ? 'rgba(0,119,181,0.3)' : 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '12px', cursor: writerPosting || !writerContent.trim() ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(0,119,181,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                {miniIcon('M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71', 'white', 12)} Post via API
                            </button>
                            <button onClick={sendToExtension} disabled={writerPosting || !writerContent.trim()}
                                style={{ flex: 1, padding: '12px', background: writerPosting ? 'rgba(105,63,233,0.4)' : 'linear-gradient(135deg, #693fe9 0%, #8b5cf6 100%)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '12px', cursor: writerPosting || !writerContent.trim() ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(105,63,233,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                {miniIcon('M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7z', 'white', 12)} Post via UI
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={saveDraft}
                                style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', fontSize: '11px', cursor: 'pointer', transition: 'all 0.2s' }}
                                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}>
                                {miniIcon('M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z', 'white', 11)} Save Draft
                            </button>
                            <div style={{ display: 'flex', flex: 2, gap: '4px' }}>
                                <input type="date" value={writerScheduleDate} onChange={e => setWriterScheduleDate(e.target.value)}
                                    style={{ flex: 1, padding: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: 'white', fontSize: '10px', width: '100%', minWidth: 0 }} />
                                <input type="time" value={writerScheduleTime} onChange={e => setWriterScheduleTime(e.target.value)}
                                    style={{ flex: 1, padding: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: 'white', fontSize: '10px', width: '100%', minWidth: 0 }} />
                                <button onClick={schedulePost}
                                    style={{ padding: '8px', background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.4)', borderRadius: '8px', color: '#c4b5fd', fontSize: '10px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                    {miniIcon('M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', '#c4b5fd', 10)} Schedule
                                </button>
                                <button onClick={async () => {
                                    if (!writerContent.trim() || !writerScheduleDate || !writerScheduleTime) { showToast('Set date/time first', 'error'); return; }
                                    const token = localStorage.getItem('authToken');
                                    if (!token) return;
                                    const scheduledTime = new Date(`${writerScheduleDate}T${writerScheduleTime}`).toISOString();
                                    setWriterStatus('Scheduling via LinkedIn API...');
                                    try {
                                        const res = await fetch('/api/extension/command', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                            body: JSON.stringify({ command: 'linkedin_schedule_via_api', data: { content: writerContent, scheduledTime } })
                                        });
                                        const data = await res.json();
                                        if (data.success) { showToast('Schedule task sent to extension!', 'success'); setWriterStatus('Scheduling via LinkedIn native scheduler...'); }
                                        else { showToast(data.error || 'Failed', 'error'); setWriterStatus('Failed: ' + (data.error || '')); }
                                    } catch (e: any) { showToast('Error: ' + e.message, 'error'); }
                                }}
                                    title="Schedule directly on LinkedIn via API"
                                    style={{ padding: '8px', background: 'rgba(0,119,181,0.2)', border: '1px solid rgba(0,119,181,0.4)', borderRadius: '8px', color: '#60a5fa', fontSize: '10px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                    {miniIcon('M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71', '#60a5fa', 9)} LI
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Planner */}
                <div style={{ background: 'linear-gradient(135deg, rgba(105,63,233,0.15) 0%, rgba(139,92,246,0.1) 100%)', padding: '14px 18px', borderRadius: '14px', border: '1px solid rgba(105,63,233,0.3)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {miniIcon('M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', '#a78bfa', 16)}
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>AI Content Planner</span>
                                <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px' }}>Generate & schedule full calendar</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => props.openPlanner?.('7days')}
                                style={{ flex: 1, padding: '8px 12px', background: 'linear-gradient(135deg, #693fe9, #8b5cf6)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer', boxShadow: '0 3px 10px rgba(105,63,233,0.4)', transition: 'transform 0.1s' }}
                                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                                onMouseUp={e => e.currentTarget.style.transform = 'none'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                                7 Days
                            </button>
                            <button onClick={() => props.openPlanner?.('30days')}
                                style={{ flex: 1, padding: '8px 12px', background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer', boxShadow: '0 3px 10px rgba(16,185,129,0.4)', transition: 'transform 0.1s' }}
                                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                                onMouseUp={e => e.currentTarget.style.transform = 'none'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                                30 Days
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Calendar Display */}
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '18px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <h3 style={{ color: 'white', fontSize: '14px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {miniIcon('M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', '#60a5fa', 14)} Content Calendar
                        </h3>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <button onClick={() => {
                                const newMonth = calendarMonth === 0 ? 11 : calendarMonth - 1;
                                const newYear = calendarMonth === 0 ? calendarYear - 1 : calendarYear;
                                setCalendarMonth(newMonth);
                                setCalendarYear(newYear);
                            }}
                                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '4px 8px', color: 'white', fontSize: '12px', cursor: 'pointer' }}>
                                ‹
                            </button>
                            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px', fontWeight: '600', minWidth: '120px', textAlign: 'center' }}>
                                {new Date(calendarYear, calendarMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>
                            <button onClick={() => {
                                const newMonth = calendarMonth === 11 ? 0 : calendarMonth + 1;
                                const newYear = calendarMonth === 11 ? calendarYear + 1 : calendarYear;
                                setCalendarMonth(newMonth);
                                setCalendarYear(newYear);
                            }}
                                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '4px 8px', color: 'white', fontSize: '12px', cursor: 'pointer' }}>
                                ›
                            </button>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} style={{ textAlign: 'center', padding: '6px', color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontWeight: '600' }}>
                                {day}
                            </div>
                        ))}
                        {(() => {
                            const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
                            const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
                            const today = new Date();
                            const cells = [];
                            
                            // Empty cells before first day
                            for (let i = 0; i < firstDay; i++) {
                                cells.push(<div key={`empty-${i}`} style={{ padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }} />);
                            }
                            
                            // Calendar days
                            for (let day = 1; day <= daysInMonth; day++) {
                                const date = new Date(calendarYear, calendarMonth, day);
                                const isToday = date.toDateString() === today.toDateString();
                                const dateStr = date.toISOString().split('T')[0];
                                const scheduledCount = writerScheduledPosts?.filter((p: any) => p.scheduledAt?.startsWith(dateStr)).length || 0;
                                
                                cells.push(
                                    <div key={day}
                                        style={{
                                            padding: '8px',
                                            background: isToday ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)',
                                            border: isToday ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.05)',
                                            borderRadius: '6px',
                                            textAlign: 'center',
                                            cursor: scheduledCount > 0 ? 'pointer' : 'default',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={e => { if (scheduledCount > 0) e.currentTarget.style.background = 'rgba(59,130,246,0.2)'; }}
                                        onMouseOut={e => { if (!isToday && scheduledCount > 0) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}>
                                        <div style={{ color: isToday ? '#60a5fa' : 'rgba(255,255,255,0.7)', fontSize: '11px', fontWeight: isToday ? '700' : '500', marginBottom: '2px' }}>
                                            {day}
                                        </div>
                                        {scheduledCount > 0 && (
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', margin: '0 auto' }} />
                                        )}
                                    </div>
                                );
                            }
                            
                            return cells;
                        })()}
                    </div>

                    {/* Scheduled Posts Summary */}
                    {writerScheduledPosts && writerScheduledPosts.length > 0 && (
                        <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px' }}>
                            <div style={{ color: '#34d399', fontSize: '11px', fontWeight: '600', marginBottom: '6px' }}>
                                {writerScheduledPosts.length} Post{writerScheduledPosts.length !== 1 ? 's' : ''} Scheduled
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '120px', overflowY: 'auto' }}>
                                {writerScheduledPosts.slice(0, 5).map((post: any, idx: number) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px' }}>
                                        <span style={{ color: 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                            {post.content?.substring(0, 40)}...
                                        </span>
                                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px', marginLeft: '8px', flexShrink: 0 }}>
                                            {new Date(post.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Inspiration Sources Section */}
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '18px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h3 style={{ color: 'white', fontSize: '14px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {miniIcon('M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', '#fbbf24', 14)} Inspiration Sources
                        </h3>
                        <button onClick={() => setShowInspirationPopup?.(true)}
                            style={{ padding: '6px 12px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', borderRadius: '6px', color: 'white', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                            + Add Source
                        </button>
                    </div>
                    {inspirationLoading ? (
                        <div style={{ textAlign: 'center', padding: '12px', color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Loading sources...</div>
                    ) : inspirationSources && inspirationSources.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {inspirationSources.map((source: any, idx: number) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '13px' }}>
                                            {(source.name?.[0] || 'S').toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ color: 'white', fontSize: '12px', fontWeight: '600' }}>{source.name}</div>
                                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>{source.count || 0} posts scraped</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ padding: '3px 8px', background: userWritingStyleSource === `insp_${source.name}` ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)', border: `1px solid ${userWritingStyleSource === `insp_${source.name}` ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '4px', color: userWritingStyleSource === `insp_${source.name}` ? '#34d399' : 'rgba(255,255,255,0.5)', fontSize: '9px', fontWeight: '600' }}>
                                            {userWritingStyleSource === `insp_${source.name}` ? 'Active' : 'Available'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {sharedInspProfiles && sharedInspProfiles.length > 0 && (
                                <>
                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', fontWeight: '600', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Shared by Admin</div>
                                    {sharedInspProfiles.map((source: any, idx: number) => (
                                        <div key={`shared-${idx}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '13px' }}>
                                                    {(source.profileName?.[0] || 'S').toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ color: 'white', fontSize: '12px', fontWeight: '600' }}>{source.profileName} <span style={{ color: '#a78bfa', fontSize: '10px' }}>(Shared)</span></div>
                                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>{source.postCount || 0} posts</div>
                                                </div>
                                            </div>
                                            <span style={{ padding: '3px 8px', background: userWritingStyleSource === `shared_${source.profileName}` ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)', border: `1px solid ${userWritingStyleSource === `shared_${source.profileName}` ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '4px', color: userWritingStyleSource === `shared_${source.profileName}` ? '#34d399' : 'rgba(255,255,255,0.5)', fontSize: '9px', fontWeight: '600' }}>
                                                {userWritingStyleSource === `shared_${source.profileName}` ? 'Active' : 'Available'}
                                            </span>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
                            <div style={{ marginBottom: '8px' }}>No inspiration sources added yet.</div>
                            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>Add LinkedIn profiles to learn their writing style for AI post generation.</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

```

---

### page.tsx

```
'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, getLanguageDir } from '@/lib/i18n';
import { cleanLinkedInProfileUrl, cleanLinkedInProfileUrls } from '@/lib/linkedin-url-cleaner';
import OverviewTab from './components/OverviewTab';
import WriterTab from './components/WriterTabNew';
import CommentsTab from './components/CommentsTab';
import TrendingPostsTab from './components/TrendingPostsTab';
import TasksTab from './components/TasksTab';
import HistoryTab from './components/HistoryTab';
import LimitsTab from './components/LimitsTab';
import ActivityTab from './components/ActivityTab';
import CommenterTab from './components/CommenterTab';
import ImportTab from './components/ImportTab';
import LeadWarmerTab from './components/LeadWarmerTab';
import AnalyticsTab from './components/AnalyticsTab';
import UsageTab from './components/UsageTab';
import ReferralsTab from './components/ReferralsTab';
import ExtensionTab from './components/ExtensionTab';
import AccountTab from './components/AccountTab';


interface ReferralData {
    referralCode: string;
    referralLink: string;
    stats: {
        totalReferrals: number;
        totalPaidReferrals: number;
        totalRevenue: number;
        commission: number;
        commissionRate: string;
        minPayout: number;
        canRequestPayout: boolean;
    };
    referrals: Array<{
        id: string;
        name: string;
        joinedAt: string;
        hasPaid: boolean;
        totalPaid: number;
        planName: string;
    }>;
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)' }}><div style={{ textAlign: 'center', color: 'white' }}><div style={{ marginBottom: '20px' }}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg></div><div style={{ fontSize: '18px', opacity: 0.8 }}>Loading your dashboard...</div></div></div>}>
            <DashboardContent />
        </Suspense>
    );
}

function DashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t, i18n } = useTranslation();
    const [dashLang, setDashLang] = useState<string>(() => {
        if (typeof window !== 'undefined') return localStorage.getItem('dashboard-language') || 'en';
        return 'en';
    });
    const changeDashboardLanguage = (lang: string) => {
        setDashLang(lang);
        i18n.changeLanguage(lang);
        localStorage.setItem('dashboard-language', lang);
        document.documentElement.dir = getLanguageDir(lang);
        document.documentElement.lang = lang;
    };
    const [user, setUser] = useState<any>(null);
    const [usage, setUsage] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [referralData, setReferralData] = useState<ReferralData | null>(null);
    const [copied, setCopied] = useState(false);
    const [showReferrals, setShowReferrals] = useState(false);
    const [activeTab, setActiveTab] = useState<string>(searchParams.get('tab') || 'overview');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const { signOut } = useClerk();

    // Check if user is on a free plan (no AI access)
    // Also treat expired trial users as free (trial plan with past trialEndsAt)
    const isTrialExpired = user?.plan?.isTrialPlan && user?.trialEndsAt && new Date(user.trialEndsAt) < new Date();
    const isFreePlan = user?.plan && (
        user.plan.isDefaultFreePlan ||
        (user.plan.price === 0 && !user.plan.isLifetime && !user.plan.isTrialPlan) ||
        isTrialExpired
    );

    // Writer tab state
    const [writerTopic, setWriterTopic] = useState('');
    const [writerTemplate, setWriterTemplate] = useState('lead_magnet');
    const [writerTone, setWriterTone] = useState('professional');
    const [writerLength, setWriterLength] = useState('1500');
    const [writerHashtags, setWriterHashtags] = useState(false);
    const [writerEmojis, setWriterEmojis] = useState(true);
    const [writerLanguage, setWriterLanguage] = useState('');
    const [writerAdvancedOpen, setWriterAdvancedOpen] = useState(true);
    const [writerTargetAudience, setWriterTargetAudience] = useState('');
    const [writerKeyMessage, setWriterKeyMessage] = useState('');
    const [writerBackground, setWriterBackground] = useState('');
    const [writerContent, setWriterContent] = useState('');
    const [writerGenerating, setWriterGenerating] = useState(false);
    const [writerScheduleDate, setWriterScheduleDate] = useState('');
    const [writerScheduleTime, setWriterScheduleTime] = useState('');
    const [writerDrafts, setWriterDrafts] = useState<any[]>([]);
    const [writerScheduledPosts, setWriterScheduledPosts] = useState<any[]>([]);
    const [writerTokenUsage, setWriterTokenUsage] = useState<any>(null);
    const [writerImageFile, setWriterImageFile] = useState<File | null>(null);
    const [writerImageUrl, setWriterImageUrl] = useState<string>('');
    const [writerMediaBlobUrl, setWriterMediaBlobUrl] = useState<string>('');
    const [writerMediaType, setWriterMediaType] = useState<string>('');
    const [writerUploading, setWriterUploading] = useState(false);
    const [writerPreviewMode, setWriterPreviewMode] = useState<'off' | 'desktop' | 'mobile'>('off');
    const [writerPreviewExpanded, setWriterPreviewExpanded] = useState(false);
    const [writerUseLinkedInAPI, setWriterUseLinkedInAPI] = useState(true); // Default to LinkedIn API
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [taskCounts, setTaskCounts] = useState({ pending: 0, in_progress: 0, completed: 0, failed: 0 });
    const [writerStatus, setWriterStatus] = useState('');
    const [writerModel, setWriterModel] = useState<string>('gpt-4o');
    const [writerUseInspirationSources, setWriterUseInspirationSources] = useState(true);
    const [writerInspirationSourceNames, setWriterInspirationSourceNames] = useState<string[]>([]);

    // User goals state
    const [userGoal, setUserGoal] = useState<string>('');
    const [userTargetAudience, setUserTargetAudience] = useState<string>('');
    const [userWritingStyle, setUserWritingStyle] = useState<string>('');
    const [userWritingStyleSource, setUserWritingStyleSource] = useState<string>('user_default');
    const [goalsLoading, setGoalsLoading] = useState(false);
    const [goalsSuggesting, setGoalsSuggesting] = useState(false);

    // Saved posts tab state
    const [savedPosts, setSavedPosts] = useState<any[]>([]);
    const [savedPostsLoading, setSavedPostsLoading] = useState(false);
    const [savedPostsPage, setSavedPostsPage] = useState(1);
    const [savedPostsTotal, setSavedPostsTotal] = useState(0);
    const [savedPostsSortBy, setSavedPostsSortBy] = useState('comments');
    const [savedPostsSortOrder, setSavedPostsSortOrder] = useState('desc');
    const [savedPostsSearch, setSavedPostsSearch] = useState('');

    // Feed schedule state
    const [feedSchedule, setFeedSchedule] = useState<any>(null);
    const [feedScheduleLoading, setFeedScheduleLoading] = useState(false);
    const [scheduleTimesInput, setScheduleTimesInput] = useState<string[]>(['09:00']);
    const [scheduleDuration, setScheduleDuration] = useState(5);
    const [scheduleMinLikes, setScheduleMinLikes] = useState(0);
    const [scheduleMinComments, setScheduleMinComments] = useState(0);
    const [scheduleKeywords, setScheduleKeywords] = useState('');
    const [scheduleActive, setScheduleActive] = useState(true);

    // Tasks tab state
    const [tasks, setTasks] = useState<any[]>([]);
    const [tasksLoading, setTasksLoading] = useState(false);
    const [taskNotifications, setTaskNotifications] = useState<Array<{ id: string; message: string; type: 'info' | 'success' | 'error'; time: number }>>([]);
    const [taskStatusExpanded, setTaskStatusExpanded] = useState<string | null>(null);
    const prevTasksRef = useRef<any[]>([]);
    const notifiedTaskIds = useRef<Set<string>>(new Set());

    // Trending Posts AI generation state
    const [trendingPeriod, setTrendingPeriod] = useState<string>('all');
    const [trendingSelectedPosts, setTrendingSelectedPosts] = useState<string[]>([]);
    const [trendingGenerating, setTrendingGenerating] = useState(false);
    const [trendingCustomPrompt, setTrendingCustomPrompt] = useState('');
    const [trendingIncludeHashtags, setTrendingIncludeHashtags] = useState(false);
    const [trendingLanguage, setTrendingLanguage] = useState('');
    const [trendingGeneratedPosts, setTrendingGeneratedPosts] = useState<any[]>([]);
    const [trendingShowGenPreview, setTrendingShowGenPreview] = useState(false);
    const [trendingStatus, setTrendingStatus] = useState('');
    const [trendingModel, setTrendingModel] = useState<string>('gpt-4o');
    const [trendingTokenUsage, setTrendingTokenUsage] = useState<any>(null);
    const [trendingUseProfileData, setTrendingUseProfileData] = useState(false); // Profile data toggle for trending
    // Feed scrape live status
    const [feedScrapeCommandId, setFeedScrapeCommandId] = useState<string | null>(null);
    const [feedScrapeStatus, setFeedScrapeStatus] = useState<any>(null);
    const [feedScrapePolling, setFeedScrapePolling] = useState(false);
    const feedScrapeIntervalRef = useRef<any>(null);

    // Developer emails for showing token costs
    const DEVELOPER_EMAILS = ['alanemarkef199@gmail.com', 'arman@arwebcraftslive.com'];
    const isDeveloper = user?.email ? DEVELOPER_EMAILS.includes(user.email) : false;

    // AI Models state - fetched from database (admin-controlled)
    const [aiModels, setAiModels] = useState<any[]>([]);
    const [aiModelsLoading, setAiModelsLoading] = useState(false);
    const [userModelSettings, setUserModelSettings] = useState<any>(null);

    // Model options derived from fetched models - sorted by writing score
    const MODEL_OPTIONS = aiModels.length > 0
        ? aiModels.map(m => ({
            id: m.modelId,
            name: m.name,
            inputCost: `$${m.inputCostPer1M.toFixed(2)}/1M`,
            outputCost: `$${m.outputCostPer1M.toFixed(2)}/1M`,
            category: m.category,
            isFeatured: m.isFeatured,
            writingScore: m.writingScore,
            speedScore: m.speedScore,
            provider: m.provider,
            isReasoningModel: m.isReasoningModel
        }))
        : [
            { id: 'gpt-4o', name: 'GPT-4o (Best Quality)', inputCost: '$2.50/1M', outputCost: '$10.00/1M', category: 'premium', isFeatured: true, writingScore: 9, speedScore: 8, provider: 'openai', isReasoningModel: false },
            { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Fast)', inputCost: '$0.15/1M', outputCost: '$0.60/1M', category: 'budget', isFeatured: true, writingScore: 8, speedScore: 10, provider: 'openai', isReasoningModel: false },
        ];

    // Fetch AI models from database
    const fetchAIModels = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setAiModelsLoading(true);
        try {
            const res = await fetch('/api/ai-models', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setAiModels(data.models || []);
                setUserModelSettings(data.userSettings);
                // Set default models from user settings
                if (data.userSettings?.postModelId) setWriterModel(data.userSettings.postModelId);
                if (data.userSettings?.commentModelId) setCsModel(data.userSettings.commentModelId);
            }
        } catch (e) {
            console.error('Failed to fetch AI models:', e);
        } finally {
            setAiModelsLoading(false);
        }
    };

    // Save user model preferences when changed
    const handleWriterModelChange = async (modelId: string) => {
        setWriterModel(modelId);
        await saveUserModelSettings({ postModelId: modelId });
    };

    const handleCommentModelChange = async (modelId: string) => {
        setCsModel(modelId);
        await saveUserModelSettings({ commentModelId: modelId });
    };

    // Save user model preferences
    const saveUserModelSettings = async (settings: { postModelId?: string; commentModelId?: string; topicModelId?: string }) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            const res = await fetch('/api/ai-models/settings', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            });
            const data = await res.json();
            if (data.success) {
                setUserModelSettings(data.settings);
                showToast('Model preferences saved!', 'success');
            }
        } catch (e) {
            console.error('Failed to save model settings:', e);
        }
    };
    // Analysis state
    const [analysisResults, setAnalysisResults] = useState<any[]>([]);
    const [analysisLoading, setAnalysisLoading] = useState(false);
    const [showAnalysis, setShowAnalysis] = useState(false);
    // Image attachment for generated posts (index -> base64 data URL)
    const [generatedPostImages, setGeneratedPostImages] = useState<Record<number, string>>({});
    // Button loading states for Post to LinkedIn (index -> loading)
    const [postingToLinkedIn, setPostingToLinkedIn] = useState<Record<number, boolean>>({});
    // Toast notification
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    // History tab state
    const [historyItems, setHistoryItems] = useState<any[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyFilter, setHistoryFilter] = useState<string>('all');
    const [historyPage, setHistoryPage] = useState(1);
    const [historyTotal, setHistoryTotal] = useState(0);

    // Inspiration Sources state
    const [inspirationProfiles, setInspirationProfiles] = useState<string>('');
    const [inspirationPostCount, setInspirationPostCount] = useState(10);
    const [inspirationScraping, setInspirationScraping] = useState(false);
    const [inspirationStatus, setInspirationStatus] = useState('');
    const [inspirationSources, setInspirationSources] = useState<any[]>([]);
    const [inspirationLoading, setInspirationLoading] = useState(false);
    const [inspirationUseAll, setInspirationUseAll] = useState(true);
    const [inspirationSelected, setInspirationSelected] = useState<string[]>([]);
    const [inspirationDeleteMode, setInspirationDeleteMode] = useState(false);
    const [inspirationDeleteSelected, setInspirationDeleteSelected] = useState<string[]>([]);
    const [useProfileData, setUseProfileData] = useState(false);
    const [showInspirationPopup, setShowInspirationPopup] = useState(false);
    const [showSharedProfilesPopup, setShowSharedProfilesPopup] = useState(false);
    const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
    const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

    // Content Planner state
    const [plannerOpen, setPlannerOpen] = useState(false);
    const [plannerMode, setPlannerMode] = useState<'7days' | '30days'>('7days');
    const [plannerStep, setPlannerStep] = useState<'context' | 'select' | 'time' | 'generating' | 'done'>('context');
    const [plannerContext, setPlannerContext] = useState('');
    const [plannerTopics, setPlannerTopics] = useState<string[]>([]);
    const [plannerSelected, setPlannerSelected] = useState<boolean[]>([]);
    const [plannerGeneratingTopics, setPlannerGeneratingTopics] = useState(false);
    const [plannerPublishTime, setPlannerPublishTime] = useState('09:00');
    const [plannerStartDate, setPlannerStartDate] = useState('');
    const [plannerTemplate, setPlannerTemplate] = useState('thought_leadership');
    const [plannerTone, setPlannerTone] = useState('professional');
    const [plannerLength, setPlannerLength] = useState('1500');
    const [plannerGenerating, setPlannerGenerating] = useState(false);
    const [plannerDoneCount, setPlannerDoneCount] = useState(0);
    const [plannerTotal, setPlannerTotal] = useState(0);
    const [plannerStatusMsg, setPlannerStatusMsg] = useState('');
    const plannerAbortRef = useRef<boolean>(false);

    // LinkedIn OAuth state
    const [linkedInOAuth, setLinkedInOAuth] = useState<any>(null);
    const [linkedInOAuthLoading, setLinkedInOAuthLoading] = useState(true);

    // Comment Style Sources state
    const [commentStyleProfiles, setCommentStyleProfiles] = useState<any[]>([]);
    const [commentStyleLoading, setCommentStyleLoading] = useState(false);
    const [commentStyleUrl, setCommentStyleUrl] = useState('');
    const [commentStyleScraping, setCommentStyleScraping] = useState(false);
    const [commentStyleStatus, setCommentStyleStatus] = useState('');
    const [commentStyleExpanded, setCommentStyleExpanded] = useState<string | null>(null);
    const [commentStyleComments, setCommentStyleComments] = useState<any[]>([]);
    const [commentStyleCommentsLoading, setCommentStyleCommentsLoading] = useState(false);

    // Comment settings state (synced to server)
    const [csUseProfileStyle, setCsUseProfileStyle] = useState(false);
    const [csUseProfileData, setCsUseProfileData] = useState(false);
    const [csGoal, setCsGoal] = useState('AddValue');
    const [csTone, setCsTone] = useState('Friendly');
    const [csLength, setCsLength] = useState('Short');
    const [csStyle, setCsStyle] = useState('direct');
    const [csModel, setCsModel] = useState<string>('gpt-4o');
    const [csExpertise, setCsExpertise] = useState('');
    const [csBackground, setCsBackground] = useState('');
    const [csAutoPost, setCsAutoPost] = useState('manual');
    const [csSettingsLoading, setCsSettingsLoading] = useState(false);
    const [csSettingsSaving, setCsSettingsSaving] = useState(false);

    // Kommentify shared content state
    const [sharedPosts, setSharedPosts] = useState<any[]>([]);
    const [sharedPostsLoading, setSharedPostsLoading] = useState(false);
    const [sharedInspProfiles, setSharedInspProfiles] = useState<any[]>([]);
    const [sharedCommentProfiles, setSharedCommentProfiles] = useState<any[]>([]);

    // Automation settings (limits & delays) state
    const [autoSettings, setAutoSettings] = useState<any>(null);
    const [autoSettingsLoading, setAutoSettingsLoading] = useState(false);
    const [autoSettingsSaving, setAutoSettingsSaving] = useState(false);

    // Live activity log state
    const [liveActivityLogs, setLiveActivityLogs] = useState<any[]>([]);
    const [liveActivityLoading, setLiveActivityLoading] = useState(false);
    const [showLogsPopup, setShowLogsPopup] = useState(false);

    // Commenter config state
    const [commenterCfg, setCommenterCfg] = useState<any>(null);
    const [commenterCfgLoading, setCommenterCfgLoading] = useState(false);
    const [commenterCfgSaving, setCommenterCfgSaving] = useState(false);

    // Import config state
    const [importCfg, setImportCfg] = useState<any>(null);
    const [importCfgLoading, setImportCfgLoading] = useState(false);
    const [importCfgSaving, setImportCfgSaving] = useState(false);

    // LinkedIn Profile Data state
    const [linkedInProfile, setLinkedInProfile] = useState<any>(null);
    const [linkedInProfileLoading, setLinkedInProfileLoading] = useState(false);
    const [linkedInProfileScanning, setLinkedInProfileScanning] = useState(false);
    const [linkedInProfileStatus, setLinkedInProfileStatus] = useState('');
    const [linkedInUseProfileData, setLinkedInUseProfileData] = useState(true);
    const [linkedInTopicSuggestions, setLinkedInTopicSuggestions] = useState<string[]>([]);
    const [linkedInGeneratingTopics, setLinkedInGeneratingTopics] = useState(false);
    const [showLinkedInDataModal, setShowLinkedInDataModal] = useState(false);
    const [selectedInspirationPosts, setSelectedInspirationPosts] = useState<string[]>([]);
    const [showFullPageText, setShowFullPageText] = useState(false);
    const [rescanningMissing, setRescanningMissing] = useState(false);
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const [viewingProfilePosts, setViewingProfilePosts] = useState<string | null>(null);
    const [profilePostsData, setProfilePostsData] = useState<any[]>([]);
    const [profilePostsLoading, setProfilePostsLoading] = useState(false);
    // Voyager data state
    const [voyagerData, setVoyagerData] = useState<any>(null);
    const [voyagerLoading, setVoyagerLoading] = useState(false);
    const [voyagerSyncing, setVoyagerSyncing] = useState(false);

    // Toggle inspiration post selection
    const toggleInspirationPost = (post: string) => {
        setSelectedInspirationPosts(prev =>
            prev.includes(post)
                ? prev.filter(p => p !== post)
                : [...prev, post]
        );
    };

    // Load individual posts from a profile
    const loadProfilePosts = async (profileName: string) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setProfilePostsLoading(true);
        setViewingProfilePosts(profileName);
        try {
            const res = await fetch(`/api/vector/posts?sourceName=${encodeURIComponent(profileName)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setProfilePostsData(data.posts || []);
            }
        } catch (e) {
            console.error('Failed to load profile posts:', e);
        } finally {
            setProfilePostsLoading(false);
        }
    };

    // Analytics tab state
    const [analyticsData, setAnalyticsData] = useState<any>({ engagements: { total: 0, comments: 0, likes: 0, shares: 0, follows: 0 }, automationHistory: [], networkingHistory: [], importHistory: [], leads: [] });
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [analyticsPeriod, setAnalyticsPeriod] = useState('today');
    const [analyticsAutoSearch, setAnalyticsAutoSearch] = useState('');
    const [analyticsNetworkSearch, setAnalyticsNetworkSearch] = useState('');
    const [analyticsImportSearch, setAnalyticsImportSearch] = useState('');
    const [analyticsLeadsSearch, setAnalyticsLeadsSearch] = useState('');
    const [analyticsAutoFilter, setAnalyticsAutoFilter] = useState('all');
    const [analyticsNetworkFilter, setAnalyticsNetworkFilter] = useState('all');

    // Extension connectivity state
    const [extensionConnected, setExtensionConnected] = useState(false);
    const [extensionLastSeen, setExtensionLastSeen] = useState<Date | null>(null);

    // Theme state
    const [theme, setTheme] = useState<'current' | 'light' | 'dark'>('current');

    useEffect(() => {
        const savedTheme = localStorage.getItem('dashboard-theme') as 'current' | 'light' | 'dark' | null;
        if (savedTheme) setTheme(savedTheme);
    }, []);

    useEffect(() => {
        if (loggingOut) return;
        const token = localStorage.getItem('authToken');
        if (!token) {
            router.push('/login');
            return;
        }

        let isRedirecting = false;

        // Validate token and get user info
        const validateAndLoad = async () => {
            try {
                const validateRes = await fetch('/api/auth/validate', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const validateData = await validateRes.json();

                if (!validateData.success) {
                    // Token invalid - clear and redirect to login
                    localStorage.removeItem('authToken');
                    isRedirecting = true;
                    router.push('/login');
                    return;
                }

                setUser(validateData.user);

                // Check if user has paid plan
                const userPlan = validateData.user?.plan;
                const hasPaidPlan = userPlan && (
                    (userPlan.price > 0 && !userPlan.isDefaultFreePlan) ||
                    userPlan.isLifetime ||
                    (userPlan.isTrialPlan && validateData.user?.trialEndsAt && new Date(validateData.user.trialEndsAt) > new Date())
                );

                // For free users: redirect to plans ONCE after login, then let them use dashboard
                if (!hasPaidPlan) {
                    const redirectKey = 'kommentify_plans_redirect_done';
                    if (!sessionStorage.getItem(redirectKey)) {
                        sessionStorage.setItem(redirectKey, 'true');
                        isRedirecting = true;
                        router.push('/plans');
                        return;
                    }
                }

                // Fetch usage data (non-blocking)
                try {
                    const usageRes = await fetch('/api/usage/daily', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const usageData = await usageRes.json();
                    if (usageData?.success) {
                        setUsage(usageData);
                    }
                } catch (usageErr) {
                    console.error('Failed to fetch usage:', usageErr);
                }
            } catch (err) {
                console.error('Dashboard auth error:', err);
                // Only redirect to login on auth failure, not network errors
                // Check if token is still valid by trying refresh
                try {
                    const refreshRes = await fetch('/api/auth/refresh', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token })
                    });
                    const refreshData = await refreshRes.json();
                    if (refreshData.success && refreshData.token) {
                        localStorage.setItem('authToken', refreshData.token);
                        // Retry validation with new token
                        window.location.reload();
                        return;
                    }
                } catch (refreshErr) {
                    // Refresh also failed
                }
                localStorage.removeItem('authToken');
                isRedirecting = true;
                router.push('/login');
            } finally {
                if (!isRedirecting) {
                    setLoading(false);
                }
            }
        };

        validateAndLoad();
        loadVoyagerData(); // Load LinkedIn Voyager data on overview tab
        loadUserGoals();

        // Fetch referral data
        fetch('/api/referrals', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setReferralData(data);
                }
            })
            .catch(() => { });
    }, [router]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Writer functions
    const generatePost = async () => {
        if (isFreePlan) { setShowUpgradeModal(true); return; }
        const token = localStorage.getItem('authToken');
        if (!token || !writerTopic.trim()) { setWriterStatus('Please enter a topic'); return; }
        setWriterGenerating(true);
        setWriterStatus('Analyzing inspiration sources and generating post...');
        setWriterTokenUsage(null);
        try {
            const res = await fetch('/api/ai/generate-post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    topic: writerTopic, template: writerTemplate, tone: writerTone,
                    length: writerLength, includeHashtags: writerHashtags, includeEmojis: writerEmojis,
                    language: writerLanguage,
                    targetAudience: writerTargetAudience || userTargetAudience,
                    userGoal: userGoal,
                    userWritingStyleSource: userWritingStyleSource,
                    keyMessage: writerKeyMessage, userBackground: writerBackground,
                    useInspirationSources: userWritingStyleSource.startsWith('insp_') || userWritingStyleSource.startsWith('shared_') || (inspirationSources.length > 0 && (inspirationUseAll || inspirationSelected.length > 0)),
                    inspirationSourceNames: userWritingStyleSource.startsWith('insp_') ? [userWritingStyleSource.replace('insp_', '')] : userWritingStyleSource.startsWith('shared_') ? [userWritingStyleSource.replace('shared_', '')] : (inspirationUseAll ? inspirationSources.map(s => s.name) : inspirationSelected),
                    useProfileData: useProfileData && voyagerData,
                    profileData: useProfileData && voyagerData ? {
                        headline: voyagerData.headline,
                        about: voyagerData.about,
                        skills: [],
                        experience: voyagerData.experience || [],
                        education: voyagerData.education || [],
                        posts: (voyagerData.recentPosts || []).map((p: any) => typeof p === 'string' ? p : (p.text || p.content || '')).filter(Boolean),
                        location: voyagerData.location,
                        followerCount: voyagerData.followerCount,
                        connectionCount: voyagerData.connectionCount
                    } : null,
                    model: writerModel
                }),
            });
            const data = await res.json();
            if (data.success && data.content) {
                setWriterContent(data.content);
                // Auto-save to localStorage for persistence
                localStorage.setItem('savedWriterContent', data.content);
                localStorage.setItem('savedWriterTopic', writerTopic);
                setWriterStatus(`Post generated using ${data.model || writerModel}! Review and edit as needed.`);
                // Capture token usage for developers
                if (data.tokenUsage) {
                    setWriterTokenUsage(data.tokenUsage);
                }
                await saveToHistory('ai_generated', `AI Generated Post: ${writerTopic}`, data.content, { template: writerTemplate, tone: writerTone, length: writerLength, model: data.model });
            } else setWriterStatus(data.error || 'Generation failed');
        } catch (e: any) { setWriterStatus('Error: ' + e.message); }
        finally { setWriterGenerating(false); }
    };

    const saveDraft = async () => {
        const token = localStorage.getItem('authToken');
        if (!token || !writerContent.trim()) { setWriterStatus('No content to save'); return; }
        try {
            const res = await fetch('/api/post-drafts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ content: writerContent, topic: writerTopic, template: writerTemplate, tone: writerTone }),
            });
            const data = await res.json();
            if (data.success) { setWriterStatus('Draft saved!'); loadDrafts(); }
            else setWriterStatus(data.error || 'Failed to save');
        } catch (e: any) { setWriterStatus('Error: ' + e.message); }
    };

    const loadDrafts = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            const res = await fetch('/api/post-drafts', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) {
                const drafts = data.drafts || [];
                // Separate scheduled posts from regular drafts
                const scheduled = drafts.filter((d: any) => d.status === 'scheduled' && d.scheduledFor);
                const regularDrafts = drafts.filter((d: any) => d.status !== 'scheduled' || !d.scheduledFor);
                setWriterScheduledPosts(scheduled);
                setWriterDrafts(regularDrafts);
            }
        } catch { }
    };

    const loadScheduledPosts = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            const res = await fetch('/api/scheduled-posts', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) {
                setWriterScheduledPosts(data.scheduledPosts || []);
                setTaskCounts(data.taskCounts || { pending: 0, in_progress: 0, completed: 0, failed: 0 });
            }
        } catch { }
    };

    const [writerPosting, setWriterPosting] = useState(false);
    const sendToExtension = async () => {
        const token = localStorage.getItem('authToken');
        if (!token || !writerContent.trim()) { setWriterStatus('No content to post'); return; }
        setWriterPosting(true);

        // Check if using LinkedIn API
        if (writerUseLinkedInAPI) {
            showToast('Posting via LinkedIn API...', 'info');
            setWriterStatus('Posting via LinkedIn API...');
            try {
                const res = await fetch('/api/linkedin/post', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({
                        content: writerContent,
                        mediaUrl: writerMediaBlobUrl || null,
                        mediaType: writerMediaType || null
                    }),
                });
                if (!res.ok && res.headers.get('content-type')?.includes('text/html')) {
                    throw new Error('LinkedIn API endpoint not available. Please try again later.');
                }
                const data = await res.json();
                if (data.success) {
                    setWriterStatus('✅ Posted to LinkedIn via API!');
                    showToast('Posted to LinkedIn successfully!', 'success');
                    await saveToHistory('published_post', 'LinkedIn Post (API)', { content: writerContent, source: 'writer_api', postId: data.postId });
                    setWriterContent('');
                    setWriterImageFile(null);
                    setWriterImageUrl('');
                    setWriterMediaBlobUrl('');
                    setWriterMediaType('');
                } else {
                    setWriterStatus(data.error || 'Failed to post via API');
                    showToast(data.error || 'Failed to post via API', 'error');
                }
            } catch (e: any) {
                setWriterStatus('Error: ' + e.message);
                showToast('Error: ' + e.message, 'error');
            } finally { setWriterPosting(false); }
            return;
        }

        // Use extension method
        showToast('Sending post to extension...', 'info');
        setWriterStatus('Sending to extension...');
        try {
            const cmdData: any = { content: writerContent };

            // For media, include blob URL and type
            if (writerMediaBlobUrl) {
                cmdData.mediaUrl = writerMediaBlobUrl;
                cmdData.mediaType = writerMediaType;
                cmdData.hasImage = writerMediaType === 'image';
                cmdData.hasVideo = writerMediaType === 'video';
            } else if (writerImageUrl) {
                cmdData.hasImage = true;
            }

            window.dispatchEvent(new CustomEvent('kommentify-post-to-linkedin', {
                detail: { content: writerContent, hasImage: !!writerImageUrl, imageDataUrl: writerImageUrl, mediaUrl: writerMediaBlobUrl, mediaType: writerMediaType }
            }));
            const res = await fetch('/api/extension/command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ command: 'post_to_linkedin', data: cmdData }),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text.includes('413') || text.includes('Too Large') ? 'Image too large. Please use a smaller image.' : 'Server error');
            }

            const data = await res.json();
            if (data.success) {
                setWriterStatus('Command sent! Extension will auto-open LinkedIn and post your content.');
                showToast('Post sent to extension! It will auto-open LinkedIn.', 'success');
                await saveToHistory('published_post', 'LinkedIn Post (Writer)', { content: writerContent, source: 'writer', hasImage: !!writerImageUrl });
            } else {
                setWriterStatus(data.error || 'Failed to send');
                showToast(data.error || 'Failed to send', 'error');
            }
        } catch (e: any) {
            setWriterStatus('Error: ' + e.message);
            showToast('Error: ' + e.message, 'error');
        } finally { setWriterPosting(false); }
    };

    const schedulePost = async () => {
        const token = localStorage.getItem('authToken');
        if (!token || !writerContent.trim()) { setWriterStatus('No content to schedule'); return; }
        if (!writerScheduleDate || !writerScheduleTime) { setWriterStatus('Please set date and time'); return; }
        try {
            const scheduledFor = new Date(`${writerScheduleDate}T${writerScheduleTime}`).toISOString();
            const res = await fetch('/api/post-drafts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ content: writerContent, topic: writerTopic, template: writerTemplate, tone: writerTone, scheduledFor, mediaUrl: writerMediaBlobUrl || null, mediaType: writerMediaType || null }),
            });
            const data = await res.json();
            if (data.success) {
                setWriterStatus('Post scheduled! Task created for extension.');
                loadScheduledPosts(); // Refresh scheduled posts
                // Clear schedule inputs
                setWriterScheduleDate('');
                setWriterScheduleTime('');
                // Clear content
                setWriterContent('');
                setWriterTopic('');
            }
            else setWriterStatus(data.error || 'Failed to schedule');
        } catch (e: any) { setWriterStatus('Error: ' + e.message); }
    };

    const deleteDraft = async (id: string) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            await fetch('/api/post-drafts', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ id }),
            });
            loadDrafts();
        } catch { }
    };

    // Saved posts functions
    const loadSavedPosts = async (page = 1, periodOverride?: string) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setSavedPostsLoading(true);
        try {
            // Calculate date filter based on trending period
            const activePeriod = periodOverride !== undefined ? periodOverride : trendingPeriod;
            let periodFilter = '';
            if (activePeriod === 'today') {
                const d = new Date(); d.setHours(0, 0, 0, 0);
                periodFilter = d.toISOString();
            } else if (activePeriod === 'week') {
                const d = new Date(); d.setDate(d.getDate() - 7);
                periodFilter = d.toISOString();
            } else if (activePeriod === 'month') {
                const d = new Date(); d.setMonth(d.getMonth() - 1);
                periodFilter = d.toISOString();
            }
            const params = new URLSearchParams({
                page: page.toString(), limit: '20',
                sortBy: savedPostsSortBy, sortOrder: savedPostsSortOrder,
                ...(savedPostsSearch && { search: savedPostsSearch }),
                ...(periodFilter && { since: periodFilter }),
            });
            const res = await fetch(`/api/scraped-posts?${params}`, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) {
                setSavedPosts(data.posts || []);
                setSavedPostsTotal(data.pagination?.total || 0);
                setSavedPostsPage(page);
            }
        } catch { } finally { setSavedPostsLoading(false); }
    };

    const deleteSavedPost = async (id: string) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            await fetch('/api/scraped-posts', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ id }),
            });
            loadSavedPosts(savedPostsPage);
        } catch { }
    };

    // Feed schedule functions
    const loadFeedSchedule = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setFeedScheduleLoading(true);
        try {
            const res = await fetch('/api/feed-schedules', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success && data.schedule) {
                setFeedSchedule(data.schedule);
                const times = JSON.parse(data.schedule.scheduleTimes || '["09:00"]');
                setScheduleTimesInput(times);
                setScheduleDuration(data.schedule.durationMinutes || 5);
                setScheduleMinLikes(data.schedule.minLikes || 0);
                setScheduleMinComments(data.schedule.minComments || 0);
                setScheduleKeywords(data.schedule.keywords || '');
                setScheduleActive(data.schedule.isActive);
            }
        } catch { } finally { setFeedScheduleLoading(false); }
    };

    const saveFeedSchedule = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            const res = await fetch('/api/feed-schedules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    scheduleTimes: scheduleTimesInput, durationMinutes: scheduleDuration,
                    isActive: scheduleActive, minLikes: scheduleMinLikes,
                    minComments: scheduleMinComments, keywords: scheduleKeywords,
                }),
            });
            const data = await res.json();
            if (data.success) { setFeedSchedule(data.schedule); setWriterStatus('Schedule saved!'); }
        } catch { }
    };

    // Inspiration Sources functions
    const loadInspirationSources = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setInspirationLoading(true);
        try {
            const res = await fetch('/api/vector/ingest', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success && data.sources) {
                setInspirationSources(data.sources.map((s: any) => ({ name: s.name, profileUrl: s.profileUrl, count: s.postCount || 0 })));
            }
        } catch { } finally { setInspirationLoading(false); }
    };

    const scrapeInspirationProfiles = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) { setInspirationStatus('Not authenticated'); return; }
        const urls = cleanLinkedInProfileUrls(inspirationProfiles);
        if (urls.length === 0) { setInspirationStatus('Please enter valid LinkedIn profile URLs (one per line)'); return; }
        setInspirationScraping(true);
        setInspirationStatus(`Scraping ${urls.length} profile(s)... Extension will open tabs.`);
        try {
            for (let i = 0; i < urls.length; i++) {
                setInspirationStatus(`Scraping profile ${i + 1}/${urls.length}: ${urls[i].split('/in/')[1]?.split('/')[0] || 'profile'}...`);
                // Send command to extension via API
                const res = await fetch('/api/extension/command', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ command: 'scrape_profile', data: { profileUrl: urls[i], postCount: inspirationPostCount } }),
                });
                const data = await res.json();
                if (!data.success) {
                    setInspirationStatus(`Failed to queue profile ${i + 1}: ${data.error}`);
                    continue;
                }
            }
            // Trigger extension to pick up commands immediately
            window.dispatchEvent(new CustomEvent('kommentify-post-to-linkedin', { detail: { command: 'scrape_profile' } }));
            setInspirationStatus(`${urls.length} profile(s) queued for scraping! Extension will process them.`);
            setInspirationProfiles('');
            // Reload sources after a delay
            setTimeout(() => loadInspirationSources(), 15000);
        } catch (e: any) { setInspirationStatus('Error: ' + e.message); }
        finally { setInspirationScraping(false); }
    };

    const deleteInspirationSource = async (sourceName: string) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            await fetch('/api/vector/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ sourceName }),
            });
            loadInspirationSources();
        } catch { }
    };

    // Kommentify shared content functions
    const loadSharedPosts = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setSharedPostsLoading(true);
        try {
            const res = await fetch('/api/shared/posts?limit=50', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setSharedPosts(data.posts || []);
        } catch { } finally { setSharedPostsLoading(false); }
    };
    const loadSharedInspProfiles = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            const res = await fetch('/api/shared/inspiration-profiles', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setSharedInspProfiles(data.profiles || []);
        } catch { }
    };
    const loadSharedCommentProfiles = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            const res = await fetch('/api/shared/comment-profiles', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setSharedCommentProfiles(data.profiles || []);
        } catch { }
    };

    // Comment Style Sources functions
    const loadCommentStyleProfiles = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setCommentStyleLoading(true);
        try {
            const res = await fetch('/api/scraped-comments', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setCommentStyleProfiles(data.profiles || []);
        } catch { } finally { setCommentStyleLoading(false); }
    };

    const commentScrapeIntervalRef = useRef<any>(null);
    const scrapeCommentStyle = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        const url = cleanLinkedInProfileUrl(commentStyleUrl);
        if (!url.includes('linkedin.com/in/')) { setCommentStyleStatus('Please enter a valid LinkedIn profile URL'); return; }
        setCommentStyleScraping(true);
        setCommentStyleStatus('Sending scrape command to extension...');
        try {
            const res = await fetch('/api/extension/command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ command: 'scrape_comments', data: { profileUrl: url } }),
            });
            const data = await res.json();
            if (data.success) {
                setCommentStyleStatus('Scraping in progress... Extension is collecting comments.');
                showToast('Comment scraping started!', 'info');
                setCommentStyleUrl('');
                // Poll for command completion every 5 seconds
                if (commentScrapeIntervalRef.current) clearInterval(commentScrapeIntervalRef.current);
                const commandId = data.commandId;
                let pollCount = 0;
                commentScrapeIntervalRef.current = setInterval(async () => {
                    pollCount++;
                    try {
                        const statusRes = await fetch('/api/extension/command/all', { headers: { 'Authorization': `Bearer ${token}` } });
                        const statusData = await statusRes.json();
                        const cmd = statusData.commands?.find((c: any) => c.id === commandId);
                        if (cmd) {
                            if (cmd.status === 'completed') {
                                clearInterval(commentScrapeIntervalRef.current);
                                commentScrapeIntervalRef.current = null;
                                setCommentStyleScraping(false);
                                setCommentStyleStatus('Scraping complete! Comments saved.');
                                showToast('Comment scraping complete!', 'success');
                                loadCommentStyleProfiles();
                            } else if (cmd.status === 'failed' || cmd.status === 'cancelled') {
                                clearInterval(commentScrapeIntervalRef.current);
                                commentScrapeIntervalRef.current = null;
                                setCommentStyleScraping(false);
                                setCommentStyleStatus(`Scraping ${cmd.status}.`);
                                showToast(`Comment scraping ${cmd.status}`, 'error');
                            } else {
                                setCommentStyleStatus(`Scraping in progress... (${pollCount * 5}s elapsed)`);
                            }
                        }
                    } catch { }
                    // Timeout after 3 minutes
                    if (pollCount > 36) {
                        clearInterval(commentScrapeIntervalRef.current);
                        commentScrapeIntervalRef.current = null;
                        setCommentStyleScraping(false);
                        setCommentStyleStatus('Scraping timed out. Check extension logs.');
                        loadCommentStyleProfiles(); // Try loading anyway
                    }
                }, 5000);
            } else {
                setCommentStyleScraping(false);
                setCommentStyleStatus(data.error || 'Failed to send command');
                showToast(data.error || 'Failed', 'error');
            }
        } catch (e: any) { setCommentStyleScraping(false); setCommentStyleStatus('Error: ' + e.message); }
    };

    const loadProfileComments = async (profileId: string) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setCommentStyleCommentsLoading(true);
        try {
            const res = await fetch(`/api/scraped-comments?profileId=${profileId}`, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setCommentStyleComments(data.comments || []);
        } catch { } finally { setCommentStyleCommentsLoading(false); }
    };

    const toggleCommentTop = async (commentId: string) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            await fetch('/api/scraped-comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ action: 'toggleTop', commentId }),
            });
            // Refresh comments
            setCommentStyleComments(prev => prev.map(c => c.id === commentId ? { ...c, isTopComment: !c.isTopComment } : c));
        } catch { }
    };

    const toggleProfileSelect = async (profileId: string) => {
        // Optimistic update - immediately update UI
        const profile = commentStyleProfiles.find(p => p.id === profileId);
        if (!profile) return;

        const newSelectedState = !profile.isSelected;
        setCommentStyleProfiles(prev => prev.map(p => p.id === profileId ? { ...p, isSelected: newSelectedState } : p));

        // Sync with server in background
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            await fetch('/api/scraped-comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ action: 'toggleSelect', profileId }),
            });
        } catch (e) {
            // Revert on error
            setCommentStyleProfiles(prev => prev.map(p => p.id === profileId ? { ...p, isSelected: !newSelectedState } : p));
        }
    };

    const deleteCommentStyleProfile = async (profileId: string) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            await fetch(`/api/scraped-comments?profileId=${profileId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            setCommentStyleProfiles(prev => prev.filter(p => p.id !== profileId));
            if (commentStyleExpanded === profileId) { setCommentStyleExpanded(null); setCommentStyleComments([]); }
            showToast('Profile and comments deleted', 'success');
        } catch { }
    };

    const loadCommentSettings = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setCsSettingsLoading(true);
        try {
            const res = await fetch('/api/comment-settings', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success && data.settings) {
                setCsUseProfileStyle(data.settings.useProfileStyle === true);
                setCsUseProfileData(data.settings.useProfileData === true);
                setCsGoal(data.settings.goal || 'AddValue');
                setCsTone(data.settings.tone || 'Friendly');
                setCsLength(data.settings.commentLength || 'Short');
                setCsStyle(data.settings.commentStyle || 'direct');
                setCsModel(data.settings.model || 'gpt-4o');
                setCsExpertise(data.settings.userExpertise || '');
                setCsBackground(data.settings.userBackground || '');
                setCsAutoPost(data.settings.aiAutoPost || 'manual');
            }
        } catch { } finally { setCsSettingsLoading(false); }
    };

    const saveCommentSettings = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setCsSettingsSaving(true);
        try {
            const res = await fetch('/api/comment-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    useProfileStyle: csUseProfileStyle,
                    useProfileData: csUseProfileData,
                    goal: csGoal,
                    tone: csTone,
                    commentLength: csLength,
                    commentStyle: csStyle,
                    model: csModel,
                    userExpertise: csExpertise,
                    userBackground: csBackground,
                    aiAutoPost: csAutoPost
                }),
            });
            const data = await res.json();
            if (data.success) showToast('Comment settings saved!', 'success');
            else showToast('Failed to save settings', 'error');
        } catch (e: any) { showToast('Error: ' + e.message, 'error'); }
        finally { setCsSettingsSaving(false); }
    };

    // LinkedIn Profile Data functions
    const loadLinkedInProfile = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setLinkedInProfileLoading(true);
        try {
            const res = await fetch('/api/linkedin-profile', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success && data.data) {
                setLinkedInProfile(data.data);
                setLinkedInUseProfileData(data.data.isSelected !== false);
                // Select all items by default for AI inspiration
                const allItems: string[] = [
                    ...(data.data.posts || []),
                    ...(data.data.experience || []),
                    ...(data.data.education || []),
                    ...(data.data.skills || []),
                    ...(data.data.certifications || []),
                    ...(data.data.projects || []),
                    ...(data.data.interests || [])
                ];
                setSelectedInspirationPosts(allItems);

                // Auto-fill Target Audience and Background if they are currently empty
                if (!writerTargetAudience && data.data.skills && Array.isArray(data.data.skills) && data.data.skills.length > 0) {
                    setWriterTargetAudience(`Professionals interested in ${data.data.skills.slice(0, 3).join(', ')}`);
                }
                if (!writerBackground && data.data.headline) {
                    setWriterBackground(data.data.headline);
                }
            }
        } catch { } finally { setLinkedInProfileLoading(false); }
    };

    // User goals functions
    const loadUserGoals = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setGoalsLoading(true);
        try {
            const res = await fetch('/api/user-goals', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success && data.data) {
                setUserGoal(data.data.goal || '');
                setUserTargetAudience(data.data.targetAudience || '');
                setUserWritingStyle(data.data.writingStyle || '');
                setUserWritingStyleSource(data.data.writingStyleSource || 'user_default');
            }
        } catch (e) {
            console.error('Failed to load goals:', e);
        } finally {
            setGoalsLoading(false);
        }
    };

    const saveUserGoals = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        const savedData = {
            goal: userGoal,
            targetAudience: userTargetAudience,
            writingStyle: userWritingStyle,
            writingStyleSource: userWritingStyleSource
        };
        try {
            const res = await fetch('/api/user-goals', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(savedData)
            });
            const data = await res.json();
            if (data.success) {
                showToast('Goals saved successfully!', 'success');
            } else {
                showToast(data.error || 'Failed to save goals', 'error');
            }
        } catch (e) {
            showToast('Failed to save goals', 'error');
        }
    };

    const suggestGoals = async () => {
        if (!voyagerData) {
            showToast('Please sync LinkedIn data first', 'error');
            return;
        }
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setGoalsSuggesting(true);
        try {
            const res = await fetch('/api/ai/suggest-goals', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ profileData: voyagerData })
            });
            const data = await res.json();
            if (data.success) {
                setUserGoal(data.goal || '');
                setUserTargetAudience(data.targetAudience || '');
                showToast('Suggested goals applied. Review and save!', 'success');
            } else {
                showToast(data.error || 'Failed to suggest goals', 'error');
            }
        } catch (e) {
            showToast('Failed to suggest goals', 'error');
        } finally {
            setGoalsSuggesting(false);
        }
    };

    // Voyager data functions
    const loadVoyagerData = async () => {
        const token = localStorage.getItem('authToken');
        console.log('[VOYAGER UI] loadVoyagerData called, token exists:', !!token);
        if (!token) return;
        setVoyagerLoading(true);
        try {
            const res = await fetch('/api/linkedin-profile', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            console.log('[VOYAGER UI] API response:', { success: data.success, hasData: !!data.data, fields: data.data ? Object.keys(data.data) : [], linkedInUrn: data.data?.linkedInUrn, followerCount: data.data?.followerCount, voyagerLastSyncAt: data.data?.voyagerLastSyncAt });
            if (data.success && data.data) {
                const d = data.data;
                const recentPosts = Array.isArray(d.recentPosts) ? d.recentPosts : (typeof d.recentPosts === 'string' ? JSON.parse(d.recentPosts || '[]') : []);
                const experience = Array.isArray(d.experience) ? d.experience : (typeof d.experience === 'string' ? JSON.parse(d.experience || '[]') : []);
                const education = Array.isArray(d.education) ? d.education : (typeof d.education === 'string' ? JSON.parse(d.education || '[]') : []);
                const profileViewsData = d.profileViewsData
                    ? (typeof d.profileViewsData === 'string' ? JSON.parse(d.profileViewsData) : d.profileViewsData)
                    : null;
                const invitationsData = d.interests
                    ? (typeof d.interests === 'string' ? (() => { try { return JSON.parse(d.interests); } catch { return null; } })() : d.interests)
                    : null;
                const profileMetadata = d.certifications
                    ? (typeof d.certifications === 'string' ? (() => { try { return JSON.parse(d.certifications); } catch { return null; } })() : d.certifications)
                    : null;
                const topConnections = d.voyagerEmail
                    ? (typeof d.voyagerEmail === 'string' ? (() => { try { return JSON.parse(d.voyagerEmail); } catch { return null; } })() : d.voyagerEmail)
                    : null;
                const voyagerState = {
                    linkedInUrn: d.linkedInUrn,
                    linkedInUsername: d.linkedInUsername,
                    name: d.name,
                    headline: d.headline,
                    location: d.location,
                    about: d.about,
                    profileUrl: d.profileUrl,
                    profilePicture: typeof profileViewsData?.profilePicture === 'string' ? profileViewsData.profilePicture : (profileViewsData?.profilePicture?.url || profileViewsData?.profilePicture?.rootUrl || ''),
                    backgroundImage: typeof profileViewsData?.backgroundImage === 'string' ? profileViewsData.backgroundImage : (profileViewsData?.backgroundImage?.url || ''),
                    followerCount: d.followerCount,
                    connectionCount: d.connectionCount,
                    profileViewsData,
                    recentPosts,
                    experience,
                    education,
                    voyagerLastSyncAt: d.voyagerLastSyncAt,
                    // New comprehensive data
                    invitationsData,
                    profileMetadata,
                    topConnections: Array.isArray(topConnections) ? topConnections : [],
                };
                console.log('[VOYAGER UI] Setting voyagerData state:', { 
                    name: voyagerState.name, 
                    followers: voyagerState.followerCount, 
                    posts: voyagerState.recentPosts?.length, 
                    experience: voyagerState.experience?.length, 
                    education: voyagerState.education?.length, 
                    invitations: voyagerState.invitationsData, 
                    lastSync: voyagerState.voyagerLastSyncAt 
                });
                setVoyagerData(voyagerState);
            } else {
                console.warn('[VOYAGER UI] No data returned from API:', data);
                if (!data.success) {
                    showToast(data.error || 'Failed to load profile data', 'error');
                }
            }
        } catch (e: any) { 
            console.error('[VOYAGER UI] Failed to load data:', e); 
            showToast('Error loading profile: ' + (e.message || 'Unknown error'), 'error');
        } finally { 
            setVoyagerLoading(false); 
        }
    };

    const deleteLinkedInProfile = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        if (!confirm('Are you sure you want to delete your LinkedIn profile data?')) return;

        try {
            const res = await fetch('/api/linkedin-profile', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setLinkedInProfile(null);
                setLinkedInTopicSuggestions([]);
                showToast('LinkedIn profile data deleted successfully', 'success');
            } else {
                showToast(data.error || 'Failed to delete profile data', 'error');
            }
        } catch (e: any) {
            showToast('Error: ' + e.message, 'error');
        }
    };

    const scanLinkedInProfile = async (forceUseAI?: boolean) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        // Check localStorage for user preference (default to AI)
        const scanMethod = localStorage.getItem('profileScanMethod') || 'ai';
        const useAI = forceUseAI !== undefined ? forceUseAI : scanMethod === 'ai';

        setLinkedInProfileScanning(true);
        setLinkedInProfileStatus(useAI
            ? 'Scanning LinkedIn profile with AI... Extension will capture and restructure your profile data.'
            : 'Scanning LinkedIn profile... Extension will open LinkedIn feed, find your profile, and extract data.');
        try {
            // Send command to extension to scan profile
            const command = useAI ? 'AI_PROFILE_RECAPTURE' : 'scan_my_linkedin_profile';
            const res = await fetch('/api/extension/command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ command }),
            });
            const data = await res.json();
            if (data.success) {
                setLinkedInProfileStatus('Profile scan started! Check extension popup for progress. Data will appear here when complete.');
                showToast('Profile scan started! Check extension popup.', 'info');

                // Track polling state with a flag to avoid stale closure issues
                let isPollingActive = true;
                let pollIntervalId: ReturnType<typeof setInterval> | null = null;
                let timeoutId: ReturnType<typeof setTimeout> | null = null;

                // Poll for completion to update UI automatically
                pollIntervalId = setInterval(async () => {
                    try {
                        const statusRes = await fetch('/api/extension/command/all', {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        const statusData = await statusRes.json();
                        console.log('📊 Dashboard polling - commands:', statusData.commands?.length, 'looking for:', data.commandId);
                        const cmd = statusData.commands?.find((c: any) => c.id === data.commandId);
                        console.log('📊 Found command:', cmd?.command, 'status:', cmd?.status);

                        if (cmd && isPollingActive) {
                            if (cmd.status === 'completed') {
                                isPollingActive = false;
                                if (pollIntervalId) clearInterval(pollIntervalId);
                                if (timeoutId) clearTimeout(timeoutId);
                                setLinkedInProfileScanning(false);
                                setLinkedInProfileStatus('Scan completed successfully!');
                                showToast('Profile scan complete! Data loaded.', 'success');
                                loadLinkedInProfile(); // Auto-load the new data
                            } else if (cmd.status === 'failed' || cmd.status === 'cancelled') {
                                isPollingActive = false;
                                if (pollIntervalId) clearInterval(pollIntervalId);
                                if (timeoutId) clearTimeout(timeoutId);
                                setLinkedInProfileScanning(false);
                                setLinkedInProfileStatus(`Scan ${cmd.status}`);
                                showToast(`Profile scan ${cmd.status}`, 'error');
                            }
                        }
                    } catch (e) {
                        // Ignore polling errors
                    }
                }, 2000);

                // Timeout polling after 2 minutes
                timeoutId = setTimeout(() => {
                    if (isPollingActive && pollIntervalId) {
                        isPollingActive = false;
                        clearInterval(pollIntervalId);
                        setLinkedInProfileScanning(false);
                        setLinkedInProfileStatus('Scan timed out waiting for response.');
                        loadLinkedInProfile(); // Try loading anyway
                    }
                }, 120000);

            } else {
                setLinkedInProfileScanning(false);
                setLinkedInProfileStatus(data.error || 'Failed to start scan');
            }
        } catch (e: any) {
            setLinkedInProfileScanning(false);
            setLinkedInProfileStatus('Error: ' + e.message);
        }
    };

    const generateTopicSuggestions = async () => {
        if (isFreePlan) { setShowUpgradeModal(true); return; }
        if (!linkedInProfile) return;
        setLinkedInGeneratingTopics(true);
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            // Use arrays directly - they're already parsed by the API
            const experience = Array.isArray(linkedInProfile.experience) ? linkedInProfile.experience : [];
            const skills = Array.isArray(linkedInProfile.skills) ? linkedInProfile.skills : [];

            const res = await fetch('/api/ai/generate-topics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    profileData: {
                        headline: linkedInProfile.headline,
                        about: linkedInProfile.about,
                        experience,
                        skills
                    }
                }),
            });
            const data = await res.json();
            if (data.success && data.topics) {
                setLinkedInTopicSuggestions(data.topics);
            } else {
                showToast(data.error || 'Failed to generate topics', 'error');
            }
        } catch (e: any) {
            showToast('Error: ' + e.message, 'error');
        } finally { setLinkedInGeneratingTopics(false); }
    };

    const selectTopicSuggestion = (topic: string) => {
        setWriterTopic(topic);
        showToast('Topic added to input!', 'success');
    };

    // Content Planner functions
    const openPlanner = (mode: '7days' | '30days') => {
        if (isFreePlan) { setShowUpgradeModal(true); return; }
        const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
        const dd = String(tomorrow.getDate()).padStart(2, '0');
        const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
        setPlannerMode(mode);
        setPlannerStep('context');
        setPlannerTopics([]);
        setPlannerSelected([]);
        setPlannerContext('');
        setPlannerDoneCount(0);
        setPlannerStatusMsg('');
        setPlannerStartDate(`${tomorrow.getFullYear()}-${mm}-${dd}`);
        plannerAbortRef.current = false;
        // Check localStorage for incomplete session
        const key = `planner_${user?.id}_${mode}`;
        try {
            const saved = localStorage.getItem(key);
            if (saved) {
                const s = JSON.parse(saved);
                if (s.step === 'generating' && s.doneCount < s.total) {
                    setPlannerTopics(s.topics || []);
                    setPlannerSelected(s.selected || []);
                    setPlannerPublishTime(s.publishTime || '09:00');
                    setPlannerStartDate(s.startDate || `${tomorrow.getFullYear()}-${mm}-${dd}`);
                    setPlannerTemplate(s.template || 'thought_leadership');
                    setPlannerTone(s.tone || 'professional');
                    setPlannerLength(s.length || '1500');
                    setPlannerDoneCount(s.doneCount || 0);
                    setPlannerTotal(s.total || 0);
                    setPlannerStep('generating');
                    setPlannerOpen(true);
                    return;
                }
            }
        } catch { }
        setPlannerOpen(true);
    };

    const generatePlannerTopics = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setPlannerGeneratingTopics(true);
        setPlannerStatusMsg('');
        try {
            const profileData = linkedInProfile ? {
                name: linkedInProfile.name,
                headline: linkedInProfile.headline,
                about: linkedInProfile.about,
                skills: Array.isArray(linkedInProfile.skills) ? linkedInProfile.skills : [],
                experience: Array.isArray(linkedInProfile.experience) ? linkedInProfile.experience : [],
                posts: Array.isArray(linkedInProfile.posts) ? linkedInProfile.posts : [],
            } : null;
            const res = await fetch('/api/ai/content-planner', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ mode: plannerMode, userContext: plannerContext, profileData }),
            });
            const data = await res.json();
            if (data.success) {
                setPlannerTopics(data.topics);
                const count = plannerMode === '7days' ? 7 : 30;
                setPlannerSelected(data.topics.map((_: string, i: number) => i < count));
                setPlannerStep('select');
            } else {
                setPlannerStatusMsg('Error: ' + data.error);
            }
        } catch (e: any) {
            setPlannerStatusMsg('Error: ' + e.message);
        } finally {
            setPlannerGeneratingTopics(false);
        }
    };

    const startPlannerGeneration = async () => {
        const token = localStorage.getItem('authToken');
        if (!token || !plannerStartDate || !plannerPublishTime) return;
        const topics = plannerTopics.filter((_, i) => plannerSelected[i]);
        if (topics.length === 0) return;
        plannerAbortRef.current = false;
        setPlannerGenerating(true);
        setPlannerDoneCount(0);
        setPlannerTotal(topics.length);
        setPlannerStep('generating');
        // Save session for disconnect resilience
        const key = `planner_${user?.id}_${plannerMode}`;
        const session = { step: 'generating', topics: plannerTopics, selected: plannerSelected, publishTime: plannerPublishTime, startDate: plannerStartDate, template: plannerTemplate, tone: plannerTone, length: plannerLength, doneCount: 0, total: topics.length };
        try { localStorage.setItem(key, JSON.stringify(session)); } catch { }
        for (let i = 0; i < topics.length; i++) {
            if (plannerAbortRef.current) break;
            const topic = topics[i];
            const scheduledDate = new Date(plannerStartDate + 'T' + plannerPublishTime + ':00');
            scheduledDate.setDate(scheduledDate.getDate() + i);
            setPlannerStatusMsg(`Generating post ${i + 1} of ${topics.length}: "${topic.substring(0, 60)}..."`);
            try {
                const genRes = await fetch('/api/ai/generate-post', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ topic, template: plannerTemplate, tone: plannerTone, length: plannerLength, includeHashtags: writerHashtags, includeEmojis: writerEmojis, userBackground: linkedInProfile?.headline || '', useInspirationSources: writerUseInspirationSources, model: writerModel }),
                });
                const genData = await genRes.json();
                if (!genData.success) { setPlannerStatusMsg(`Post ${i + 1} failed: ${genData.error}`); continue; }
                const schedRes = await fetch('/api/post-drafts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ content: genData.content, topic, template: plannerTemplate, tone: plannerTone, scheduledFor: scheduledDate.toISOString() }),
                });
                const schedData = await schedRes.json();
                if (schedData.success) {
                    const newCount = i + 1;
                    setPlannerDoneCount(newCount);
                    try { localStorage.setItem(key, JSON.stringify({ ...session, doneCount: newCount })); } catch { }
                    loadScheduledPosts();
                }
            } catch (e: any) {
                setPlannerStatusMsg(`Error on post ${i + 1}: ${e.message}`);
            }
            await new Promise(r => setTimeout(r, 400));
        }
        setPlannerGenerating(false);
        setPlannerStep('done');
        setPlannerStatusMsg('');
        try { localStorage.removeItem(key); } catch { }
        loadScheduledPosts();
    };

    const toggleLinkedInProfileData = async (enabled: boolean) => {
        setLinkedInUseProfileData(enabled);
        const token = localStorage.getItem('authToken');
        if (!token || !linkedInProfile) return;
        try {
            await fetch('/api/linkedin-profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ isSelected: enabled }),
            });
        } catch { }
    };

    // Automation settings functions
    const loadAutoSettings = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setAutoSettingsLoading(true);
        try {
            const res = await fetch('/api/automation-settings', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setAutoSettings(data.settings);
        } catch { } finally { setAutoSettingsLoading(false); }
    };
    const saveAutoSettings = async (updates: any) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setAutoSettingsSaving(true);
        try {
            const res = await fetch('/api/automation-settings', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(updates) });
            const data = await res.json();
            if (data.success) { setAutoSettings(data.settings); showToast('Settings saved!', 'success'); }
            else showToast('Failed to save', 'error');
        } catch (e: any) { showToast('Error: ' + e.message, 'error'); }
        finally { setAutoSettingsSaving(false); }
    };

    // Live activity log functions
    const loadLiveActivity = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setLiveActivityLoading(true);
        try {
            const res = await fetch('/api/live-activity?limit=100', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setLiveActivityLogs(data.logs || []);
        } catch { } finally { setLiveActivityLoading(false); }
    };

    // Commenter config functions
    const loadCommenterCfg = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setCommenterCfgLoading(true);
        try {
            const res = await fetch('/api/commenter-config', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setCommenterCfg(data.config);
        } catch { } finally { setCommenterCfgLoading(false); }
    };
    const saveCommenterCfg = async (updates: any) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setCommenterCfgSaving(true);
        try {
            const res = await fetch('/api/commenter-config', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(updates) });
            const data = await res.json();
            if (data.success) { setCommenterCfg(data.config); showToast('Commenter settings saved!', 'success'); }
            else showToast('Failed to save', 'error');
        } catch (e: any) { showToast('Error: ' + e.message, 'error'); }
        finally { setCommenterCfgSaving(false); }
    };

    // Import config functions
    const loadImportCfg = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setImportCfgLoading(true);
        try {
            const res = await fetch('/api/import-config', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setImportCfg(data.config);
        } catch { } finally { setImportCfgLoading(false); }
    };
    const saveImportCfg = async (updates: any) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setImportCfgSaving(true);
        try {
            const res = await fetch('/api/import-config', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(updates) });
            const data = await res.json();
            if (data.success) { setImportCfg(data.config); showToast('Import settings saved!', 'success'); }
            else showToast('Failed to save', 'error');
        } catch (e: any) { showToast('Error: ' + e.message, 'error'); }
        finally { setImportCfgSaving(false); }
    };

    // Tasks functions
    const addTaskNotification = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
        setTaskNotifications(prev => [...prev.slice(-4), { id, message, type, time: Date.now() }]);
        setTimeout(() => setTaskNotifications(prev => prev.filter(n => n.id !== id)), 5000);
    };

    const loadTasks = async (silent = false) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        if (!silent) setTasksLoading(true);
        try {
            const res = await fetch('/api/extension/command/all', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) {
                const newTasks = data.commands || [];
                // Detect changes for notifications - use refs to avoid duplicates
                if (prevTasksRef.current.length > 0) {
                    for (const nt of newTasks) {
                        const notifKey = `${nt.id}_${nt.status}`;
                        if (notifiedTaskIds.current.has(notifKey)) continue;
                        const prev = prevTasksRef.current.find((t: any) => t.id === nt.id);
                        const cmdName = nt.command === 'post_to_linkedin' ? 'Post to LinkedIn' : nt.command === 'scrape_feed_now' ? 'Scrape Feed' : nt.command === 'scrape_profile' ? 'Scrape Profile' : nt.command;
                        if (!prev) {
                            notifiedTaskIds.current.add(notifKey);
                            addTaskNotification(`New task: ${cmdName}`, 'info');
                        } else if (prev.status !== nt.status) {
                            notifiedTaskIds.current.add(notifKey);
                            if (nt.status === 'completed' || nt.status === 'completed_manual') addTaskNotification(`Completed: ${cmdName}`, 'success');
                            else if (nt.status === 'failed' || nt.status === 'cancelled') addTaskNotification(`Failed: ${cmdName}`, 'error');
                            else if (nt.status === 'in_progress') addTaskNotification(`Processing: ${cmdName}`, 'info');
                        }
                    }
                }
                prevTasksRef.current = newTasks;
                setTasks(newTasks);

                // Connectivity is handled by heartbeat polling (see checkExtensionConnectivity)
            }
        } catch { } finally { if (!silent) setTasksLoading(false); }
    };

    const loadReferralData = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            const res = await fetch('/api/referrals', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) {
                setReferralData(data);
            }
        } catch { }
    };

    const loadAccountSettings = async () => {
        // Account settings are loaded in the main auth useEffect
    };

    // Check extension connectivity via heartbeat endpoint and recent activity
    const checkExtensionConnectivity = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            const res = await fetch('/api/extension/heartbeat', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();

            const isConnected = !!data.connected;
            setExtensionConnected(isConnected);

            // Always update last seen from server data if available
            if (data.lastSeen) {
                setExtensionLastSeen(new Date(data.lastSeen));
            } else if (isConnected) {
                setExtensionLastSeen(new Date());
            }
        } catch { }
    };

    // Poll tasks every 15 seconds for live notifications - empty deps so interval is created once
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        checkExtensionConnectivity();
        const taskInterval = setInterval(() => loadTasks(true), 15000);
        const heartbeatInterval = setInterval(() => checkExtensionConnectivity(), 15000); // Check every 15 seconds
        return () => { clearInterval(taskInterval); clearInterval(heartbeatInterval); };
    }, []);

    // Load LinkedIn OAuth status on mount
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) { setLinkedInOAuthLoading(false); return; }
        fetch('/api/auth/linkedin', { headers: { 'Authorization': `Bearer ${token}` } })
            .then(r => r.json())
            .then(d => { if (d.success) setLinkedInOAuth(d); })
            .catch(() => { })
            .finally(() => setLinkedInOAuthLoading(false));
    }, []);

    // Load saved writer content from localStorage on mount
    useEffect(() => {
        const savedContent = localStorage.getItem('savedWriterContent');
        const savedTopic = localStorage.getItem('savedWriterTopic');
        if (savedContent) setWriterContent(savedContent);
        if (savedTopic) setWriterTopic(savedTopic);
    }, []);

    // Auto-fill expertise and background from LinkedIn profile data for both Writer and Comments tabs
    useEffect(() => {
        if (!linkedInProfile) return;

        // Auto-fill writer background if empty
        if (!writerBackground && linkedInProfile.headline) {
            setWriterBackground(linkedInProfile.headline);
        }

        // Auto-fill comment settings expertise and background if empty
        if (!csExpertise && linkedInProfile.headline) {
            const expertise = linkedInProfile.headline.split('|')[0]?.trim() || linkedInProfile.headline.substring(0, 50);
            setCsExpertise(expertise);
        }
        if (!csBackground && linkedInProfile.about) {
            const background = linkedInProfile.about.substring(0, 100);
            setCsBackground(background);
        }
    }, [linkedInProfile]);

    // Load tab-specific data on initial mount when auth completes (fixes ?tab=import reload)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (loading || !user) return;
        const tab = activeTab;
        if (tab === 'writer') { loadDrafts(); loadInspirationSources(); loadSharedInspProfiles(); loadLinkedInProfile(); loadScheduledPosts(); fetchAIModels(); }
        if (tab === 'comments') { loadCommentSettings(); loadCommentStyleProfiles(); loadSharedCommentProfiles(); loadLinkedInProfile(); fetchAIModels(); }
        if (tab === 'commenter') { loadCommenterCfg(); loadCommentSettings(); }
        if (tab === 'trending-posts') { loadSavedPosts(); loadSharedPosts(); loadFeedSchedule(); }
        if (tab === 'tasks') loadTasks();
        if (tab === 'history') loadHistory();
        if (tab === 'analytics') loadAnalytics();
        if (tab === 'limits') { loadAutoSettings(); loadLiveActivity(); }
        if (tab === 'activity') loadLiveActivity();
        if (tab === 'import') loadImportCfg();
        if (tab === 'referrals') loadReferralData();
        if (tab === 'account') loadAccountSettings();
    }, [loading, user, activeTab]);

    // Feed scrape polling - poll command status every 3 seconds while scraping
    const startFeedScrapePolling = (commandId: string) => {
        setFeedScrapeCommandId(commandId);
        setFeedScrapePolling(true);
        setFeedScrapeStatus({ status: 'pending', data: { message: 'Waiting for extension to pick up task...' } });
        if (feedScrapeIntervalRef.current) clearInterval(feedScrapeIntervalRef.current);
        feedScrapeIntervalRef.current = setInterval(async () => {
            const token = localStorage.getItem('authToken');
            if (!token) return;
            try {
                const res = await fetch('/api/extension/command/all', { headers: { 'Authorization': `Bearer ${token}` } });
                const data = await res.json();
                if (data.success && data.commands) {
                    const cmd = data.commands.find((c: any) => c.id === commandId);
                    if (cmd) {
                        setFeedScrapeStatus(cmd);
                        if (cmd.status === 'completed' || cmd.status === 'failed' || cmd.status === 'cancelled') {
                            clearInterval(feedScrapeIntervalRef.current);
                            feedScrapeIntervalRef.current = null;
                            setFeedScrapePolling(false);
                            if (cmd.status === 'completed') {
                                showToast(`Feed scrape complete! ${cmd.data?.postsFound || 0} posts saved.`, 'success');
                                loadSavedPosts();
                            } else if (cmd.status === 'failed') {
                                showToast(cmd.data?.message || 'Feed scrape failed', 'error');
                            }
                        }
                    }
                }
            } catch { }
        }, 3000);
    };
    const stopFeedScrape = async () => {
        if (!feedScrapeCommandId) return;
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            await fetch('/api/extension/command', { method: 'PUT', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ commandId: feedScrapeCommandId, status: 'cancelled' }) });
            if (feedScrapeIntervalRef.current) { clearInterval(feedScrapeIntervalRef.current); feedScrapeIntervalRef.current = null; }
            setFeedScrapePolling(false);
            setFeedScrapeStatus(null);
            setFeedScrapeCommandId(null);
            showToast('Feed scrape stopped', 'info');
        } catch { }
    };
    useEffect(() => {
        return () => {
            if (feedScrapeIntervalRef.current) clearInterval(feedScrapeIntervalRef.current);
            if (commentScrapeIntervalRef.current) clearInterval(commentScrapeIntervalRef.current);
        };
    }, []);

    const stopAllTasks = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            // Tell extension to stop
            window.dispatchEvent(new CustomEvent('kommentify-stop-all-tasks'));
            // Cancel on server
            await fetch('/api/extension/command/stop-all', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            });
            // Reload tasks
            setTimeout(() => loadTasks(), 1000);
        } catch { }
    };

    // Trending AI generation
    const generateTrendingPosts = async () => {
        if (isFreePlan) { setShowUpgradeModal(true); return; }
        const token = localStorage.getItem('authToken');
        if (!token) return;
        const selected = savedPosts.filter(p => trendingSelectedPosts.includes(p.id));
        if (selected.length === 0) { setTrendingStatus('Please select at least 1 trending post'); return; }
        if (selected.length > 10) { setTrendingStatus('Maximum 10 posts allowed'); return; }
        setTrendingGenerating(true);
        setTrendingStatus('Analyzing voice patterns and generating posts...');
        setTrendingShowGenPreview(false);
        setTrendingTokenUsage(null);
        try {
            const res = await fetch('/api/ai/generate-trending', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    trendingPosts: selected,
                    customPrompt: trendingCustomPrompt,
                    includeHashtags: trendingIncludeHashtags,
                    language: trendingLanguage,
                    model: trendingModel,
                    useProfileData: trendingUseProfileData,
                    profileData: trendingUseProfileData ? linkedInProfile : null
                }),
            });
            const data = await res.json();
            if (data.success && data.posts) {
                setTrendingGeneratedPosts(data.posts);
                setTrendingShowGenPreview(true);
                setTrendingStatus(`Generated ${data.posts.length} viral posts using ${data.model || trendingModel}!`);
                setGeneratedPostImages({});
                // Capture token usage for developers
                if (data.tokenUsage) {
                    setTrendingTokenUsage(data.tokenUsage);
                }
                // Save to history
                await saveToHistory('ai_generated', `AI Generated ${data.posts.length} Posts`, data.posts, { customPrompt: trendingCustomPrompt, selectedCount: selected.length, model: data.model });
            } else setTrendingStatus(data.error || 'Generation failed');
        } catch (e: any) { setTrendingStatus('Error: ' + e.message); }
        finally { setTrendingGenerating(false); }
    };

    // Analysis function
    const analyzePosts = async () => {
        if (isFreePlan) { setShowUpgradeModal(true); return; }
        const token = localStorage.getItem('authToken');
        if (!token) return;
        if (trendingGeneratedPosts.length === 0) { setTrendingStatus('Generate posts first before analyzing'); return; }
        const selected = savedPosts.filter(p => trendingSelectedPosts.includes(p.id));
        if (selected.length === 0) { setTrendingStatus('Select some trending posts first'); return; }
        setAnalysisLoading(true);
        setShowAnalysis(false);
        setTrendingStatus('Analyzing posts for viral potential...');
        try {
            // Mix AI posts with trending posts - AI posts go at the end
            const allPosts = [
                ...selected.map(p => ({ content: p.postContent, source: 'trending' })),
                ...trendingGeneratedPosts.map(p => ({ content: p.content, source: 'ai' })),
            ];
            const aiPostIndices = allPosts.map((p, i) => p.source === 'ai' ? i : -1).filter(i => i >= 0);

            const res = await fetch('/api/ai/analyze-posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ allPosts, aiPostIndices }),
            });
            const data = await res.json();
            if (data.success && data.analysis) {
                setAnalysisResults(data.analysis);
                setShowAnalysis(true);
                setTrendingStatus('Analysis complete!');
                // Save to history
                await saveToHistory('viral_analysis', 'Viral Potential Analysis', data.analysis, { postCount: allPosts.length, aiPostCount: aiPostIndices.length });
            } else setTrendingStatus(data.error || 'Analysis failed');
        } catch (e: any) { setTrendingStatus('Error: ' + e.message); }
        finally { setAnalysisLoading(false); }
    };

    // Toast notification helper
    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    // Analytics functions
    const loadAnalytics = async (periodOverride?: string) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setAnalyticsLoading(true);
        try {
            const period = periodOverride || analyticsPeriod;
            const res = await fetch(`/api/analytics?period=${period}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setAnalyticsData(data);
            }
        } catch (e) { console.error('Failed to load analytics:', e); }
        finally { setAnalyticsLoading(false); }
    };

    // History functions
    const loadHistory = async (page = 1, filterOverride?: string) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setHistoryLoading(true);
        try {
            const activeFilter = filterOverride !== undefined ? filterOverride : historyFilter;
            const typeParam = activeFilter === 'all' ? '' : activeFilter;
            const res = await fetch(`/api/history?page=${page}&limit=20${typeParam ? `&type=${typeParam}` : ''}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setHistoryItems(data.items || []);
                setHistoryTotal(data.total || 0);
                setHistoryPage(page);
            }
        } catch { } finally { setHistoryLoading(false); }
    };

    const saveToHistory = async (type: string, title: string, content: any, metadata?: any) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            await fetch('/api/history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ type, title, content: JSON.stringify(content), metadata: metadata ? JSON.stringify(metadata) : null }),
            });
        } catch { }
    };

    const deleteHistoryItem = async (id: string) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            await fetch(`/api/history?id=${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            loadHistory(historyPage);
        } catch { }
    };

    const postGeneratedToLinkedIn = async (content: string, imageDataUrl?: string, postIndex?: number) => {
        const token = localStorage.getItem('authToken');
        if (!token || !content.trim()) return;
        if (postIndex !== undefined) setPostingToLinkedIn(prev => ({ ...prev, [postIndex]: true }));
        showToast('Sending post to extension...', 'info');
        try {
            const cmdData: any = { content };

            // For images, send via CustomEvent to content script which can access chrome.storage
            if (imageDataUrl) {
                cmdData.hasImage = true;
                window.dispatchEvent(new CustomEvent('kommentify-post-to-linkedin', {
                    detail: { content, hasImage: true, imageDataUrl }
                }));
            } else {
                window.dispatchEvent(new CustomEvent('kommentify-post-to-linkedin', { detail: cmdData }));
            }

            const res = await fetch('/api/extension/command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ command: 'post_to_linkedin', data: cmdData }),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text.includes('413') || text.includes('Too Large') ? 'Image too large. Please use a smaller image.' : 'Server error');
            }

            const data = await res.json();
            if (data.success) {
                showToast('Post sent to extension! It will auto-open LinkedIn.', 'success');
                setTrendingStatus('Post sent to extension! It will auto-open LinkedIn.');
                // Save to history as published post
                await saveToHistory('published_post', 'LinkedIn Post', { content, hasImage: !!imageDataUrl });
            } else {
                showToast(data.error || 'Failed to send', 'error');
                setTrendingStatus(data.error || 'Failed');
            }
        } catch (e: any) {
            console.error("Post error:", e);
            showToast('Error: ' + e.message, 'error');
            setTrendingStatus('Error: ' + e.message);
        } finally {
            if (postIndex !== undefined) setPostingToLinkedIn(prev => ({ ...prev, [postIndex]: false }));
        }
    };

    const handleImageAttach = (index: number, file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            setGeneratedPostImages(prev => ({ ...prev, [index]: e.target?.result as string }));
        };
        reader.readAsDataURL(file);
    };

    // Load data when tabs become active
    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        // Update URL without full navigation so reload preserves tab
        window.history.replaceState(null, '', `/dashboard?tab=${tabId}`);
        if (tabId === 'overview') { loadVoyagerData(); loadUserGoals(); }
        if (tabId === 'writer') { loadDrafts(); loadInspirationSources(); loadSharedInspProfiles(); loadLinkedInProfile(); loadVoyagerData(); loadUserGoals(); loadScheduledPosts(); fetchAIModels(); }
        if (tabId === 'comments') { loadCommentSettings(); loadCommentStyleProfiles(); loadSharedCommentProfiles(); loadLinkedInProfile(); fetchAIModels(); }
        if (tabId === 'commenter') { loadCommenterCfg(); loadCommentSettings(); }
        if (tabId === 'trending-posts') { loadSavedPosts(); loadSharedPosts(); loadFeedSchedule(); }
        if (tabId === 'tasks') loadTasks();
        if (tabId === 'history') loadHistory();
        if (tabId === 'limits') { loadAutoSettings(); loadLiveActivity(); }
        if (tabId === 'activity') loadLiveActivity();
        if (tabId === 'import') loadImportCfg();
        if (tabId === 'analytics') loadAnalytics();
        if (tabId === 'referrals') loadReferralData();
        if (tabId === 'account') loadAccountSettings();
    };

    const svgIcon = (path: string, color = 'currentColor') => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={path} />
        </svg>
    );

    const miniIcon = (path: string, color = 'currentColor', size = 14) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
            <path d={path} />
        </svg>
    );

    if (loggingOut) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)'
            }}>
                <div style={{ textAlign: 'center', color: 'white' }}>
                    <div style={{ marginBottom: '20px' }}>{miniIcon('M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9', '#a78bfa', 48)}</div>
                    <div style={{ fontSize: '18px', opacity: 0.8 }}>{t('common.loggingOut')}</div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)'
            }}>
                <div style={{ textAlign: 'center', color: 'white' }}>
                    <div style={{ marginBottom: '20px', animation: 'spin 1s linear infinite' }}>{miniIcon('M13 2L3 14h9l-1 8 10-12h-9l1-8z', '#a78bfa', 48)}</div>
                    <div style={{ fontSize: '18px', opacity: 0.8 }}>{t('common.loading')}</div>
                </div>
                <style>{`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    // Navigation items with grouped sections
    const navItems = [
        { id: 'overview', label: t('nav.overview'), icon: svgIcon('M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10'), section: 'dashboard' },
        // Posts section - Rearranged with Personalized first
        { id: 'writer', label: t('nav.personalizedPostWriter'), icon: svgIcon('M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z'), section: 'posts' },
        { id: 'trending-posts', label: t('nav.viralPostsWriter'), icon: svgIcon('M13 2L3 14h9l-1 8 10-12h-9l1-8z'), section: 'posts', badge: 'BETA' },
        // Comments section
        { id: 'commenter', label: t('nav.autoCommenter'), icon: svgIcon('M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'), section: 'comments' },
        { id: 'comments', label: t('nav.commentsSettings'), icon: svgIcon('M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z'), section: 'comments' },
        { id: 'import', label: t('nav.leadWarmer'), icon: svgIcon('M13 2L3 14h9l-1 8 10-12h-9l1-8z'), section: 'outreach' },
        // Other
        { id: 'limits', label: t('nav.limitsDelays'), icon: svgIcon('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'), section: 'management' },
        { id: 'tasks', label: t('nav.tasks'), icon: svgIcon('M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11'), section: 'management' },
        { id: 'activity', label: t('nav.activityLogs'), icon: svgIcon('M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8'), section: 'management' },
        { id: 'history', label: t('nav.history'), icon: svgIcon('M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z'), section: 'management' },
    ];

    const accountItems = [
        { id: 'analytics', label: t('nav.analytics'), icon: svgIcon('M3 3v18h18 M9 17V9 M13 17V5 M17 17v-4 M5 17v-2') },
        { id: 'usage', label: t('nav.usageLimits'), icon: svgIcon('M18 20V10 M12 20V4 M6 20v-6') },
        { id: 'referrals', label: t('nav.referrals'), icon: svgIcon('M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z') },
        { id: 'extension', label: t('nav.extension'), icon: svgIcon('M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z') },
    ];

    const settingsItems = [
        { id: 'account', label: t('nav.account'), icon: svgIcon('M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z') },
        { id: 'billing', label: t('nav.billing'), icon: svgIcon('M1 4h22v16H1z M1 10h22'), action: () => router.push('/plans') },
    ];


    // ---- Tab Props: pass all state and functions to tab components ----
    const tabProps = {
        // Core
        t, user, usage, router, miniIcon, showToast, setActiveTab, isFreePlan, showUpgradeModal, setShowUpgradeModal, dashLang, isDeveloper,
        // Writer
        writerTopic, setWriterTopic, writerTemplate, setWriterTemplate, writerTone, setWriterTone,
        writerLength, setWriterLength, writerHashtags, setWriterHashtags, writerEmojis, setWriterEmojis,
        writerLanguage, setWriterLanguage, writerAdvancedOpen, setWriterAdvancedOpen,
        writerTargetAudience, setWriterTargetAudience, writerKeyMessage, setWriterKeyMessage,
        writerBackground, setWriterBackground, writerContent, setWriterContent,
        writerGenerating, setWriterGenerating, writerScheduleDate, setWriterScheduleDate, writerScheduleTime, setWriterScheduleTime,
        writerDrafts, writerScheduledPosts, writerTokenUsage, writerImageFile, setWriterImageFile,
        writerImageUrl, setWriterImageUrl, writerMediaBlobUrl, setWriterMediaBlobUrl,
        writerMediaType, setWriterMediaType, writerUploading, setWriterUploading,
        writerPreviewMode, setWriterPreviewMode, writerPreviewExpanded, setWriterPreviewExpanded,
        writerUseLinkedInAPI, setWriterUseLinkedInAPI, fileInputRef, writerStatus, setWriterStatus, writerModel,
        writerUseInspirationSources, setWriterUseInspirationSources, writerInspirationSourceNames,
        writerPosting, MODEL_OPTIONS, handleWriterModelChange,
        userGoal, setUserGoal, userTargetAudience, setUserTargetAudience,
        userWritingStyle, setUserWritingStyle, userWritingStyleSource, setUserWritingStyleSource,
        goalsLoading, goalsSuggesting, loadUserGoals, saveUserGoals, suggestGoals,
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
        // Additional (used by AccountTab and ActivityTab)
        changeDashboardLanguage, setLinkedInOAuth, setLinkedInProfileScanning, setLinkedInProfile,
        SUPPORTED_LANGUAGES, setLiveActivityLogs, setLiveActivityLoading,
        setCommenterCfg, setCommentStyleComments, setImportCfg, setAutoSettings,
        setTrendingStatus, setFeedScrapeStatus, setFeedScrapeCommandId, setTrendingGeneratedPosts, setPlannerGenerating,
    };
    return (
        <div data-theme={theme} style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            minHeight: '100vh',
            background: theme === 'light' ? 'linear-gradient(135deg, #f8f9fc 0%, #eef1f8 100%)' : theme === 'dark' ? 'linear-gradient(135deg, #0a0a1a 0%, #111128 100%)' : 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)',
            color: theme === 'light' ? '#1a1a2e' : 'white',
            display: 'flex'
        }}>
            {/* Upgrade Plan Modal for Free Users */}
            {showUpgradeModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10001,
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }} onClick={() => setShowUpgradeModal(false)}>
                    <div onClick={(e) => e.stopPropagation()} style={{
                        background: 'linear-gradient(135deg, #1a1a3e 0%, #0f0f23 100%)',
                        borderRadius: '24px', padding: '40px', maxWidth: '480px', width: '90%',
                        border: '2px solid rgba(105,63,233,0.4)', boxShadow: '0 25px 80px rgba(105,63,233,0.3)',
                        textAlign: 'center', position: 'relative'
                    }}>
                        <button onClick={() => setShowUpgradeModal(false)} style={{
                            position: 'absolute', top: '16px', right: '16px', background: 'none',
                            border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '20px', cursor: 'pointer'
                        }}>✕</button>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
                        <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'white', marginBottom: '12px' }}>
                            Upgrade Your Plan
                        </h2>
                        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', marginBottom: '24px' }}>
                            AI features like post generation, topic suggestions, and content analysis require a paid plan. Upgrade now to unlock the full power of Kommentify!
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button onClick={() => { setShowUpgradeModal(false); router.push('/plans'); }}
                                style={{
                                    padding: '14px 32px', background: 'linear-gradient(135deg, #693fe9 0%, #8b5cf6 100%)',
                                    color: 'white', border: 'none', borderRadius: '14px', fontSize: '16px',
                                    fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 20px rgba(105,63,233,0.4)',
                                    transition: 'transform 0.2s'
                                }}>
                                View Plans
                            </button>
                            <button onClick={() => setShowUpgradeModal(false)}
                                style={{
                                    padding: '14px 24px', background: 'rgba(255,255,255,0.1)',
                                    color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '14px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
                                }}>
                                Maybe Later
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Toast Notification */}
            {toast && (
                <div style={{
                    position: 'fixed', top: '24px', right: '24px', zIndex: 10000,
                    padding: '14px 24px', borderRadius: '14px', fontSize: '14px', fontWeight: '600',
                    color: 'white', boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                    animation: 'slideIn 0.3s ease-out',
                    background: toast.type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' :
                        toast.type === 'error' ? 'linear-gradient(135deg, #ef4444, #dc2626)' :
                            'linear-gradient(135deg, #3b82f6, #2563eb)',
                    border: `1px solid ${toast.type === 'success' ? 'rgba(16,185,129,0.5)' : toast.type === 'error' ? 'rgba(239,68,68,0.5)' : 'rgba(59,130,246,0.5)'}`,
                    display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '400px',
                }}>
                    {toast.message}
                    <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '16px', opacity: 0.7, marginLeft: '8px' }}>✕</button>
                </div>
            )}
            {/* Task Notification Popups */}
            {taskNotifications.map((tn, idx) => (
                <div key={tn.id} style={{
                    position: 'fixed', top: `${70 + idx * 52}px`, right: '24px', zIndex: 9999,
                    padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: '600',
                    color: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    animation: 'slideIn 0.3s ease-out',
                    background: tn.type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' :
                        tn.type === 'error' ? 'linear-gradient(135deg, #ef4444, #dc2626)' :
                            'linear-gradient(135deg, #3b82f6, #2563eb)',
                    display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '340px',
                }}>
                    <span>{tn.type === 'success' ? miniIcon('M9 11l3 3L22 4', 'white', 13) : tn.type === 'error' ? miniIcon('M18 6L6 18 M6 6l12 12', 'white', 13) : miniIcon('M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0 0 20.49 15', 'white', 13)}</span>
                    {tn.message}
                    <button onClick={() => setTaskNotifications(prev => prev.filter(n => n.id !== tn.id))} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '14px', opacity: 0.7, marginLeft: '4px' }}>✕</button>
                </div>
            ))}

            {/* Persistent Task Status Boxes (top-center) */}
            <div style={{
                position: 'fixed',
                top: '18px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 9998,
                display: 'flex',
                gap: '6px',
                padding: '6px 10px',
                background: 'rgba(0,0,0,0.25)',
                borderRadius: '12px',
                backdropFilter: 'blur(6px)'
            }}>
                {[
                    { key: 'pending', label: 'Pending', count: tasks.filter(t => t.status === 'pending').length, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)' },
                    { key: 'in_progress', label: 'In Progress', count: tasks.filter(t => t.status === 'in_progress').length, color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)' },
                    { key: 'completed', label: 'Completed', count: tasks.filter(t => t.status === 'completed' || t.status === 'completed_manual').length, color: '#10b981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)' },
                    { key: 'failed', label: 'Failed', count: tasks.filter(t => t.status === 'failed' || t.status === 'cancelled').length, color: '#ef4444', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)' },
                ].map(s => (
                    <div key={s.key} onClick={() => setTaskStatusExpanded(taskStatusExpanded === s.key ? null : s.key)}
                        style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '10px', padding: '6px 12px', cursor: 'pointer', textAlign: 'center', minWidth: '60px', transition: 'all 0.2s', backdropFilter: 'blur(10px)', transform: taskStatusExpanded === s.key ? 'scale(1.05)' : 'scale(1)' }}>
                        <div style={{ fontSize: '16px', fontWeight: '800', color: s.color, lineHeight: 1 }}>{s.count}</div>
                        <div style={{ fontSize: '9px', color: s.color, fontWeight: '600', opacity: 0.8, whiteSpace: 'nowrap' }}>{s.label}</div>
                    </div>
                ))}
                {/* Logs box */}
                <div onClick={() => { if (liveActivityLogs.length === 0) loadLiveActivity(); setShowLogsPopup(true); }}
                    style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '10px', padding: '6px 12px', cursor: 'pointer', textAlign: 'center', minWidth: '60px', transition: 'all 0.2s', backdropFilter: 'blur(10px)', transform: showLogsPopup ? 'scale(1.05)' : 'scale(1)' }}>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#a78bfa', lineHeight: 1 }}>{liveActivityLogs.length > 0 ? liveActivityLogs.length : miniIcon('M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7z M2 12h20', '#a78bfa', 16)}</div>
                    <div style={{ fontSize: '9px', color: '#a78bfa', fontWeight: '600', opacity: 0.8, whiteSpace: 'nowrap' }}>Logs</div>
                </div>
            </div>

            {/* Live Activity Logs Popup */}
            {showLogsPopup && (
                <>
                    <div onClick={() => setShowLogsPopup(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9997 }} />
                    <div style={{ position: 'fixed', top: '72px', left: '50%', transform: 'translateX(-50%)', zIndex: 9998, background: theme === 'light' ? '#fff' : '#1a1a3e', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '14px', padding: '16px', width: '520px', maxHeight: '480px', overflowY: 'auto', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ color: theme === 'light' ? '#1a1a2e' : 'white', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>{miniIcon('M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7z M2 12h20', theme === 'light' ? '#1a1a2e' : 'white', 14)} Live Activity Logs</span>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <button onClick={() => loadLiveActivity()} disabled={liveActivityLoading}
                                    style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: 'rgba(255,255,255,0.7)', fontSize: '10px', cursor: 'pointer' }}>
                                    {liveActivityLoading ? '...' : 'Refresh'}
                                </button>
                                <button onClick={() => { handleTabChange('activity'); setShowLogsPopup(false); }}
                                    style={{ padding: '4px 10px', background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '6px', color: '#a78bfa', fontSize: '10px', cursor: 'pointer', fontWeight: '600' }}>
                                    Open Full View
                                </button>
                                <button onClick={() => setShowLogsPopup(false)} style={{ background: 'none', border: 'none', color: theme === 'light' ? '#666' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '18px' }}>✕</button>
                            </div>
                        </div>
                        <div style={{ fontFamily: 'monospace', fontSize: '11px', lineHeight: '1.6' }}>
                            {liveActivityLogs.length === 0 ? (
                                <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '30px', fontSize: '12px' }}>
                                    No activity logs yet. Extension will log actions here in real-time.
                                </div>
                            ) : (
                                liveActivityLogs.slice(0, 50).map((log: any) => {
                                    const icons: any = { like: 'L', comment: 'C', share: 'S', follow: 'F', connect: 'K', post: 'P', delay: 'D', start: '>', stop: 'X', error: '!', info: 'i' };
                                    const colors: any = { success: '#34d399', warning: '#fbbf24', error: '#f87171', info: 'rgba(255,255,255,0.6)' };
                                    const icon = icons[log.action] || 'i';
                                    const color = colors[log.level] || colors.info;
                                    const time = new Date(log.createdAt).toLocaleTimeString();
                                    const date = new Date(log.createdAt).toLocaleDateString();
                                    return (
                                        <div key={log.id} style={{ display: 'flex', gap: '8px', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                            <span style={{ color: 'rgba(255,255,255,0.25)', minWidth: '55px', fontSize: '9px' }}>{time}</span>
                                            <span>{icon}</span>
                                            <span style={{ color: '#a78bfa', fontSize: '9px', minWidth: '55px' }}>{log.taskType}</span>
                                            <span style={{ color, flex: 1 }}>{log.message}</span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Expanded Task List Popup */}
            {taskStatusExpanded && (
                <>
                    <div onClick={() => setTaskStatusExpanded(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9997 }} />
                    <div style={{ position: 'fixed', top: '72px', right: '440px', zIndex: 9998, background: theme === 'light' ? '#fff' : '#1a1a3e', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '14px', padding: '16px', width: '380px', maxHeight: '400px', overflowY: 'auto', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ color: theme === 'light' ? '#1a1a2e' : 'white', fontWeight: '700', fontSize: '14px' }}>
                                {taskStatusExpanded === 'pending' ? 'Pending' : taskStatusExpanded === 'in_progress' ? 'In Progress' : taskStatusExpanded === 'completed' ? 'Completed' : 'Failed/Cancelled'} Tasks
                            </span>
                            <button onClick={() => setTaskStatusExpanded(null)} style={{ background: 'none', border: 'none', color: theme === 'light' ? '#666' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '18px' }}>✕</button>
                        </div>
                        {tasks.filter(t => {
                            if (taskStatusExpanded === 'pending') return t.status === 'pending';
                            if (taskStatusExpanded === 'in_progress') return t.status === 'in_progress';
                            if (taskStatusExpanded === 'completed') return t.status === 'completed' || t.status === 'completed_manual';
                            if (taskStatusExpanded === 'failed') return t.status === 'failed' || t.status === 'cancelled';
                            return false;
                        }).length === 0 ? (
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>No tasks</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {tasks.filter(t => {
                                    if (taskStatusExpanded === 'pending') return t.status === 'pending';
                                    if (taskStatusExpanded === 'in_progress') return t.status === 'in_progress';
                                    if (taskStatusExpanded === 'completed') return t.status === 'completed' || t.status === 'completed_manual';
                                    if (taskStatusExpanded === 'failed') return t.status === 'failed' || t.status === 'cancelled';
                                    return false;
                                }).map((task: any) => (
                                    <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ color: theme === 'light' ? '#1a1a2e' : 'white', fontWeight: '600', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {task.command === 'post_to_linkedin' ? 'Post to LinkedIn' : task.command === 'scrape_feed_now' ? 'Scrape Feed' : task.command === 'scrape_profile' ? 'Scrape Profile' : task.command === 'start_bulk_commenting' ? 'Bulk Commenting' : task.command === 'start_import_automation' ? 'Import Automation' : task.command}
                                            </div>
                                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>{task.createdAt ? new Date(task.createdAt).toLocaleString() : ''}</div>
                                        </div>
                                        {(task.status === 'pending' || task.status === 'in_progress') && (
                                            <button onClick={async (e) => {
                                                e.stopPropagation();
                                                const btn = e.currentTarget;
                                                btn.textContent = 'Stopping...';
                                                btn.style.opacity = '0.6';
                                                const token = localStorage.getItem('authToken');
                                                if (!token) return;
                                                try {
                                                    window.dispatchEvent(new CustomEvent('kommentify-stop-all-tasks'));
                                                    await fetch('/api/extension/command', { method: 'PUT', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ commandId: task.id, status: 'cancelled' }) });
                                                    await loadTasks(true);
                                                    addTaskNotification(`Stopped: ${task.command === 'post_to_linkedin' ? 'Post to LinkedIn' : task.command === 'scrape_feed_now' ? 'Scrape Feed' : task.command === 'start_bulk_commenting' ? 'Bulk Commenting' : task.command === 'start_import_automation' ? 'Import Automation' : task.command}`, 'error');
                                                } catch { } finally { btn.style.opacity = '1'; }
                                            }}
                                                onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.9)')}
                                                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                                                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                                                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', color: '#f87171', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap', transition: 'all 0.15s ease' }}>
                                                Stop
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            <style>{`
                @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                /* Fix select dropdown options for dark/current themes */
                [data-theme="current"] select option,
                [data-theme="dark"] select option {
                    background: #1a1a3e !important;
                    color: white !important;
                }
                /* ===== LIGHT THEME OVERRIDES ===== */
                [data-theme="light"] { color: #1a1a2e !important; }
                [data-theme="light"] h1, [data-theme="light"] h2, [data-theme="light"] h3, [data-theme="light"] h4, [data-theme="light"] h5 { color: #1a1a2e !important; }
                [data-theme="light"] p, [data-theme="light"] span, [data-theme="light"] label, [data-theme="light"] div { color: inherit; }
                /* Main content area text */
                [data-theme="light"] input, [data-theme="light"] textarea {
                    background: white !important; color: #1a1a2e !important; border-color: rgba(0,0,0,0.2) !important;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.06) !important;
                }
                [data-theme="light"] input::placeholder, [data-theme="light"] textarea::placeholder { color: #999 !important; }
                [data-theme="light"] select {
                    background: white !important; color: #1a1a2e !important; border-color: rgba(0,0,0,0.2) !important;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.06) !important;
                }
                [data-theme="light"] select option { background: white !important; color: #1a1a2e !important; }
                /* SVG icons in sidebar */
                [data-theme="light"] svg { stroke: currentColor !important; }
                /* Fix all white text to dark - comprehensive */
                [data-theme="light"] [style*="color: white"],
                [data-theme="light"] [style*="color: rgb(255, 255, 255)"] { color: #1a1a2e !important; }
                [data-theme="light"] [style*="color: rgba(255, 255, 255, 0.8)"],
                [data-theme="light"] [style*="color: rgba(255, 255, 255, 0.85)"],
                [data-theme="light"] [style*="color: rgba(255, 255, 255, 0.7)"] { color: #333 !important; }
                [data-theme="light"] [style*="color: rgba(255, 255, 255, 0.6)"],
                [data-theme="light"] [style*="color: rgba(255, 255, 255, 0.5)"] { color: #666 !important; }
                [data-theme="light"] [style*="color: rgba(255, 255, 255, 0.4)"],
                [data-theme="light"] [style*="color: rgba(255, 255, 255, 0.3)"],
                [data-theme="light"] [style*="color: rgba(255, 255, 255, 0.35)"] { color: #888 !important; }
                /* Cards, containers and boxes - make visible */
                [data-theme="light"] [style*="background: rgba(255, 255, 255, 0.05)"],
                [data-theme="light"] [style*="background: rgba(255,255,255,0.05)"] { background: white !important; box-shadow: 0 1px 4px rgba(0,0,0,0.08) !important; }
                [data-theme="light"] [style*="background: rgba(255, 255, 255, 0.08)"],
                [data-theme="light"] [style*="background: rgba(255,255,255,0.08)"] { background: rgba(245,245,250,0.9) !important; box-shadow: 0 1px 4px rgba(0,0,0,0.06) !important; }
                [data-theme="light"] [style*="background: rgba(255, 255, 255, 0.03)"],
                [data-theme="light"] [style*="background: rgba(255,255,255,0.03)"] { background: rgba(248,248,252,0.8) !important; }
                [data-theme="light"] [style*="background: rgba(255, 255, 255, 0.04)"],
                [data-theme="light"] [style*="background: rgba(255,255,255,0.04)"] { background: rgba(245,245,250,0.6) !important; }
                [data-theme="light"] [style*="background: rgba(0, 0, 0, 0.2)"],
                [data-theme="light"] [style*="background: rgba(0,0,0,0.2)"],
                [data-theme="light"] [style*="background: rgba(0, 0, 0, 0.15)"],
                [data-theme="light"] [style*="background: rgba(0,0,0,0.15)"] { background: rgba(240,240,248,0.8) !important; }
                /* Borders */
                [data-theme="light"] [style*="border: 1px solid rgba(255, 255, 255"],
                [data-theme="light"] [style*="border: 1px solid rgba(255,255,255"] { border-color: rgba(0,0,0,0.1) !important; }
                [data-theme="light"] [style*="border: 2px solid rgba(255, 255, 255"],
                [data-theme="light"] [style*="border: 2px solid rgba(255,255,255"] { border-color: rgba(0,0,0,0.12) !important; }
                [data-theme="light"] [style*="border-top: 1px solid rgba(255, 255, 255"],
                [data-theme="light"] [style*="border-top: 1px solid rgba(255,255,255"] { border-top-color: rgba(0,0,0,0.08) !important; }
                [data-theme="light"] [style*="border-right: 1px solid rgba(255, 255, 255"],
                [data-theme="light"] [style*="borderRight"] { border-right-color: rgba(0,0,0,0.08) !important; }
                /* Gradient cards - keep visible */
                [data-theme="light"] [style*="background: linear-gradient(135deg, rgba(105,63,233"] { background: linear-gradient(135deg, rgba(105,63,233,0.08), rgba(139,92,246,0.05)) !important; border-color: rgba(105,63,233,0.2) !important; }
                [data-theme="light"] [style*="background: linear-gradient(135deg, rgba(16,185,129"] { background: linear-gradient(135deg, rgba(16,185,129,0.08), rgba(5,150,105,0.05)) !important; border-color: rgba(16,185,129,0.2) !important; }
                [data-theme="light"] [style*="background: linear-gradient(135deg, rgba(245,158,11"] { background: linear-gradient(135deg, rgba(245,158,11,0.08), rgba(217,119,6,0.05)) !important; border-color: rgba(245,158,11,0.2) !important; }
                /* Table styling */
                [data-theme="light"] table { color: #1a1a2e !important; }
                [data-theme="light"] th { color: #555 !important; }
                [data-theme="light"] td { color: #333 !important; }
                /* Buttons - keep gradient buttons white text */
                [data-theme="light"] button[style*="linear-gradient"] { color: white !important; }
                /* Toast text */
                [data-theme="light"] [style*="animation: slideIn"] { color: white !important; }
                /* Progress bars */
                [data-theme="light"] [style*="background: rgba(255, 255, 255, 0.1)"],
                [data-theme="light"] [style*="background: rgba(255,255,255,0.1)"] { background: rgba(0,0,0,0.08) !important; }
                /* Logout border */
                [data-theme="light"] [style*="border-top: 1px solid rgba(255,255,255,0.08)"] { border-top-color: rgba(0,0,0,0.08) !important; }
                /* Sidebar collapse divider */
                [data-theme="light"] [style*="borderTop: 1px solid rgba(255,255,255,0.1)"] { border-top-color: rgba(0,0,0,0.1) !important; }
                /* Colored status badges - keep readable */
                [data-theme="light"] [style*="rgba(16,185,129,0.08)"] { background: rgba(16,185,129,0.08) !important; }
                [data-theme="light"] [style*="rgba(105,63,233,0.08)"],
                [data-theme="light"] [style*="rgba(105,63,233,0.06)"] { background: rgba(105,63,233,0.06) !important; }
                [data-theme="light"] [style*="rgba(245,158,11,0.08)"] { background: rgba(245,158,11,0.06) !important; }
                [data-theme="light"] [style*="rgba(59,130,246,0.12)"] { background: rgba(59,130,246,0.08) !important; }
                [data-theme="light"] [style*="rgba(59,130,246,0.08)"] { background: rgba(59,130,246,0.06) !important; }
            `}</style>
            {/* Professional Sidebar */}
            <div style={{
                width: sidebarCollapsed ? '80px' : '260px',
                background: theme === 'light' ? 'rgba(255,255,255,0.97)' : 'rgba(15, 15, 35, 0.95)',
                borderRight: theme === 'light' ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.08)',
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
                display: 'flex',
                flexDirection: 'column',
                transition: 'width 0.3s ease',
                zIndex: 100,
                backdropFilter: 'blur(20px)'
            }}>
                {/* Logo Section */}
                <div style={{
                    padding: sidebarCollapsed ? '24px 16px' : '24px 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: sidebarCollapsed ? 'center' : 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src="/logo32x32-2.png" alt="Kommentify" style={{ width: '36px', height: '36px' }} />
                        {!sidebarCollapsed && (
                            <span style={{
                                fontSize: '20px',
                                fontWeight: '700',
                                background: 'linear-gradient(135deg, #fff 0%, #a78bfa 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>Kommentify</span>
                        )}
                    </div>
                    {!sidebarCollapsed && (
                        <button
                            onClick={() => setSidebarCollapsed(true)}
                            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '18px' }}
                        >
                            ◀
                        </button>
                    )}
                </div>

                {/* Collapsed User Avatar */}
                {sidebarCollapsed && (
                    <div style={{ padding: '20px 0', display: 'flex', justifyContent: 'center' }}>
                        <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #693fe9 0%, #8b5cf6 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '18px',
                            fontWeight: '700'
                        }}>
                            {user?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div style={{ flex: 1, padding: '0 12px', overflowY: 'auto' }}>
                    {!sidebarCollapsed && (
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', color: theme === 'light' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)', marginBottom: '8px', paddingLeft: '12px', letterSpacing: '1.5px', fontWeight: '600' }}>
                            {t('sidebar.dashboard')}
                        </div>
                    )}
                    {navItems.filter(i => i.section === 'dashboard').map(item => (
                        <button key={item.id} onClick={() => handleTabChange(item.id)} title={sidebarCollapsed ? item.label : undefined}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start', width: '100%', padding: sidebarCollapsed ? '14px' : '12px 16px', background: activeTab === item.id ? 'linear-gradient(135deg, rgba(105,63,233,0.3) 0%, rgba(139,92,246,0.2) 100%)' : 'transparent', color: activeTab === item.id ? (theme === 'light' ? '#693fe9' : 'white') : (theme === 'light' ? '#555' : 'rgba(255,255,255,0.6)'), border: activeTab === item.id ? '1px solid rgba(105,63,233,0.4)' : '1px solid transparent', borderRadius: '12px', cursor: 'pointer', marginBottom: '6px', transition: 'all 0.2s ease', fontWeight: activeTab === item.id ? '600' : '500', fontSize: '14px', gap: '12px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', flexShrink: 0 }}>{item.icon}</span>
                            {!sidebarCollapsed && item.label}
                        </button>
                    ))}

                    {!sidebarCollapsed && <div style={{ fontSize: '11px', textTransform: 'uppercase', color: theme === 'light' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)', margin: '18px 0 8px 12px', letterSpacing: '1.5px', fontWeight: '600' }}>{t('sidebar.posts')}</div>}
                    {sidebarCollapsed && <div style={{ margin: '10px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }} />}
                    {navItems.filter(i => i.section === 'posts').map(item => (
                        <button key={item.id} onClick={() => handleTabChange(item.id)} title={sidebarCollapsed ? item.label : undefined}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start', width: '100%', padding: sidebarCollapsed ? '14px' : '12px 16px', background: activeTab === item.id ? 'linear-gradient(135deg, rgba(105,63,233,0.3) 0%, rgba(139,92,246,0.2) 100%)' : 'transparent', color: activeTab === item.id ? (theme === 'light' ? '#693fe9' : 'white') : (theme === 'light' ? '#555' : 'rgba(255,255,255,0.6)'), border: activeTab === item.id ? '1px solid rgba(105,63,233,0.4)' : '1px solid transparent', borderRadius: '12px', cursor: 'pointer', marginBottom: '6px', transition: 'all 0.2s ease', fontWeight: activeTab === item.id ? '600' : '500', fontSize: '14px', gap: '12px', position: 'relative' }}>
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', flexShrink: 0 }}>{item.icon}</span>
                            {!sidebarCollapsed && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                                    {item.label}
                                    {(item as any).badge && (
                                        <span style={{ padding: '2px 6px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', borderRadius: '4px', fontSize: '8px', fontWeight: '800', color: 'white', letterSpacing: '0.5px' }}>
                                            {(item as any).badge}
                                        </span>
                                    )}
                                </span>
                            )}
                        </button>
                    ))}

                    {!sidebarCollapsed && <div style={{ fontSize: '11px', textTransform: 'uppercase', color: theme === 'light' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)', margin: '18px 0 8px 12px', letterSpacing: '1.5px', fontWeight: '600' }}>{t('sidebar.comments')}</div>}
                    {sidebarCollapsed && <div style={{ margin: '10px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }} />}
                    {navItems.filter(i => i.section === 'comments').map(item => (
                        <button key={item.id} onClick={() => handleTabChange(item.id)} title={sidebarCollapsed ? item.label : undefined}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start', width: '100%', padding: sidebarCollapsed ? '14px' : '12px 16px', background: activeTab === item.id ? 'linear-gradient(135deg, rgba(105,63,233,0.3) 0%, rgba(139,92,246,0.2) 100%)' : 'transparent', color: activeTab === item.id ? (theme === 'light' ? '#693fe9' : 'white') : (theme === 'light' ? '#555' : 'rgba(255,255,255,0.6)'), border: activeTab === item.id ? '1px solid rgba(105,63,233,0.4)' : '1px solid transparent', borderRadius: '12px', cursor: 'pointer', marginBottom: '6px', transition: 'all 0.2s ease', fontWeight: activeTab === item.id ? '600' : '500', fontSize: '14px', gap: '12px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', flexShrink: 0 }}>{item.icon}</span>
                            {!sidebarCollapsed && item.label}
                        </button>
                    ))}

                    {!sidebarCollapsed && <div style={{ fontSize: '11px', textTransform: 'uppercase', color: theme === 'light' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)', margin: '18px 0 8px 12px', letterSpacing: '1.5px', fontWeight: '600' }}>{t('sidebar.outreach')}</div>}
                    {sidebarCollapsed && <div style={{ margin: '10px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }} />}
                    {navItems.filter(i => i.section === 'outreach').map(item => (
                        <button key={item.id} onClick={() => handleTabChange(item.id)} title={sidebarCollapsed ? item.label : undefined}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start', width: '100%', padding: sidebarCollapsed ? '14px' : '12px 16px', background: activeTab === item.id ? 'linear-gradient(135deg, rgba(105,63,233,0.3) 0%, rgba(139,92,246,0.2) 100%)' : 'transparent', color: activeTab === item.id ? (theme === 'light' ? '#693fe9' : 'white') : (theme === 'light' ? '#555' : 'rgba(255,255,255,0.6)'), border: activeTab === item.id ? '1px solid rgba(105,63,233,0.4)' : '1px solid transparent', borderRadius: '12px', cursor: 'pointer', marginBottom: '6px', transition: 'all 0.2s ease', fontWeight: activeTab === item.id ? '600' : '500', fontSize: '14px', gap: '12px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', flexShrink: 0 }}>{item.icon}</span>
                            {!sidebarCollapsed && item.label}
                        </button>
                    ))}

                    {!sidebarCollapsed && <div style={{ fontSize: '11px', textTransform: 'uppercase', color: theme === 'light' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)', margin: '18px 0 8px 12px', letterSpacing: '1.5px', fontWeight: '600' }}>{t('sidebar.management')}</div>}
                    {sidebarCollapsed && <div style={{ margin: '10px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }} />}
                    {navItems.filter(i => i.section === 'management').map(item => (
                        <button key={item.id} onClick={() => handleTabChange(item.id)} title={sidebarCollapsed ? item.label : undefined}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start', width: '100%', padding: sidebarCollapsed ? '14px' : '12px 16px', background: activeTab === item.id ? 'linear-gradient(135deg, rgba(105,63,233,0.3) 0%, rgba(139,92,246,0.2) 100%)' : 'transparent', color: activeTab === item.id ? (theme === 'light' ? '#693fe9' : 'white') : (theme === 'light' ? '#555' : 'rgba(255,255,255,0.6)'), border: activeTab === item.id ? '1px solid rgba(105,63,233,0.4)' : '1px solid transparent', borderRadius: '12px', cursor: 'pointer', marginBottom: '6px', transition: 'all 0.2s ease', fontWeight: activeTab === item.id ? '600' : '500', fontSize: '14px', gap: '12px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', flexShrink: 0 }}>{item.icon}</span>
                            {!sidebarCollapsed && item.label}
                        </button>
                    ))}

                    {!sidebarCollapsed && (
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', color: theme === 'light' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)', margin: '24px 0 12px 12px', letterSpacing: '1.5px', fontWeight: '600' }}>
                            {t('sidebar.account')}
                        </div>
                    )}

                    {sidebarCollapsed && <div style={{ margin: '20px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}></div>}

                    {accountItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => handleTabChange(item.id)}
                            title={sidebarCollapsed ? item.label : undefined}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                                width: '100%',
                                padding: sidebarCollapsed ? '14px' : '12px 16px',
                                background: activeTab === item.id
                                    ? 'linear-gradient(135deg, rgba(105,63,233,0.3) 0%, rgba(139,92,246,0.2) 100%)'
                                    : 'transparent',
                                color: activeTab === item.id ? (theme === 'light' ? '#693fe9' : 'white') : (theme === 'light' ? '#555' : 'rgba(255,255,255,0.6)'),
                                border: activeTab === item.id ? '1px solid rgba(105,63,233,0.4)' : '1px solid transparent',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                marginBottom: '6px',
                                transition: 'all 0.2s ease',
                                fontWeight: activeTab === item.id ? '600' : '500',
                                fontSize: '14px',
                                gap: '12px'
                            }}
                        >
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', flexShrink: 0 }}>{item.icon}</span>
                            {!sidebarCollapsed && item.label}
                        </button>
                    ))}

                    {!sidebarCollapsed && (
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', color: theme === 'light' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)', margin: '24px 0 12px 12px', letterSpacing: '1.5px', fontWeight: '600' }}>
                            Settings
                        </div>
                    )}

                    {sidebarCollapsed && <div style={{ margin: '20px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}></div>}

                    {settingsItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => item.action ? item.action() : handleTabChange(item.id)}
                            title={sidebarCollapsed ? item.label : undefined}
                            data-settings-btn="true"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                                width: '100%',
                                padding: sidebarCollapsed ? '14px' : '12px 16px',
                                background: activeTab === item.id
                                    ? 'linear-gradient(135deg, rgba(105,63,233,0.3) 0%, rgba(139,92,246,0.2) 100%)'
                                    : 'transparent',
                                color: activeTab === item.id ? (theme === 'light' ? '#693fe9' : 'white') : (theme === 'light' ? '#555' : 'rgba(255,255,255,0.6)'),
                                border: activeTab === item.id ? '1px solid rgba(105,63,233,0.4)' : '1px solid transparent',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                marginBottom: '6px',
                                transition: 'all 0.2s ease',
                                fontWeight: activeTab === item.id ? '600' : '500',
                                fontSize: '14px',
                                gap: '12px'
                            }}
                        >
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', flexShrink: 0 }}>{item.icon}</span>
                            {!sidebarCollapsed && item.label}
                        </button>
                    ))}
                </div>

                {/* Logout Button */}
                <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <button
                        onClick={async () => {
                            setLoggingOut(true);
                            try {
                                localStorage.removeItem('authToken');
                                document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
                                await signOut();
                            } catch (e) {
                                console.error('Sign out error:', e);
                            }
                            window.location.href = '/login';
                        }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                            width: '100%',
                            padding: sidebarCollapsed ? '14px' : '12px 16px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#f87171',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            gap: '12px',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <span>{miniIcon('M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9', sidebarCollapsed ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.7)', 18)}</span>
                        {!sidebarCollapsed && t('common.logout')}
                    </button>

                    {sidebarCollapsed && (
                        <button
                            onClick={() => setSidebarCollapsed(false)}
                            style={{
                                width: '100%',
                                marginTop: '12px',
                                padding: '12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                color: 'rgba(255,255,255,0.6)',
                                cursor: 'pointer',
                                fontSize: '18px'
                            }}
                        >
                            ▶
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div style={{
                flex: 1,
                marginLeft: sidebarCollapsed ? '80px' : '260px',
                padding: '30px 40px',
                transition: 'margin-left 0.3s ease',
                minHeight: '100vh'
            }}>
                {/* Page Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '30px'
                }}>
                    <div>
                        <h1 style={{
                            fontSize: '32px',
                            fontWeight: '800',
                            color: 'white',
                            margin: '0 0 8px 0',
                        }}>
                            {t(`headers.${activeTab}`, activeTab)}
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', margin: 0 }}>
                            {t(`descriptions.${activeTab}`, '')}
                        </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Extension Connection Status */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {extensionConnected ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(16,185,129,0.1)', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.3)' }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px rgba(16,185,129,0.6)', animation: 'pulse 2s infinite' }} />
                                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#34d399' }}>Extension Connected</span>
                                    {extensionLastSeen && <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)' }}>· {extensionLastSeen.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)' }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
                                        <span style={{ fontSize: '11px', fontWeight: '600', color: '#f87171' }}>Extension Offline</span>
                                        {extensionLastSeen && (() => {
                                            const ago = Math.floor((Date.now() - extensionLastSeen.getTime()) / 1000);
                                            const label = ago < 60 ? `${ago}s ago` : ago < 3600 ? `${Math.floor(ago / 60)}m ago` : ago < 86400 ? `${Math.floor(ago / 3600)}h ago` : `${Math.floor(ago / 86400)}d ago`;
                                            return <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)' }}>· last seen {label}</span>;
                                        })()}
                                    </div>
                                    <button
                                        onClick={checkExtensionConnectivity}
                                        style={{
                                            padding: '4px 8px',
                                            background: 'rgba(255,255,255,0.1)',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            borderRadius: '6px',
                                            color: 'rgba(255,255,255,0.8)',
                                            fontSize: '10px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
                                        onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                                        title="Auto-checks every 15s. Click to check now."
                                    >
                                        {miniIcon('M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0 0 20.49 15', 'white', 11)} Retry
                                    </button>
                                </div>
                            )}
                            <button
                                onClick={() => window.open('https://chromewebstore.google.com/detail/kommentify-linkedin-auto/laeckkpjacbodjglcnenggpdpehkacei', '_blank')}
                                style={{
                                    padding: '4px 8px',
                                    background: 'rgba(59,130,246,0.1)',
                                    border: '1px solid rgba(59,130,246,0.3)',
                                    borderRadius: '6px',
                                    color: '#60a5fa',
                                    fontSize: '10px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.2)'; }}
                                onMouseOut={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; }}
                            >
                                {miniIcon('M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z', 'white', 12)} Get Extension
                            </button>
                            {/* LinkedIn Connect Button */}
                            <button
                                onClick={() => {
                                    if (linkedInOAuth?.connected && !linkedInOAuth?.tokenExpired) {
                                        showToast('LinkedIn already connected!', 'success');
                                    } else {
                                        const token = localStorage.getItem('authToken');
                                        fetch('/api/auth/linkedin', { headers: { 'Authorization': `Bearer ${token}` } })
                                            .then(r => r.json())
                                            .then(d => {
                                                if (d.authUrl) window.location.href = d.authUrl;
                                                else showToast('Failed to get LinkedIn auth URL', 'error');
                                            });
                                    }
                                }}
                                style={{
                                    padding: '4px 10px',
                                    background: linkedInOAuth?.connected && !linkedInOAuth?.tokenExpired ? 'rgba(16,185,129,0.15)' : 'rgba(0,119,181,0.15)',
                                    border: linkedInOAuth?.connected && !linkedInOAuth?.tokenExpired ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(0,119,181,0.4)',
                                    borderRadius: '6px',
                                    color: linkedInOAuth?.connected && !linkedInOAuth?.tokenExpired ? '#34d399' : '#0ea5e9',
                                    fontSize: '10px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                                onMouseOver={e => {
                                    e.currentTarget.style.background = linkedInOAuth?.connected && !linkedInOAuth?.tokenExpired ? 'rgba(16,185,129,0.25)' : 'rgba(0,119,181,0.25)';
                                }}
                                onMouseOut={e => {
                                    e.currentTarget.style.background = linkedInOAuth?.connected && !linkedInOAuth?.tokenExpired ? 'rgba(16,185,129,0.15)' : 'rgba(0,119,181,0.15)';
                                }}
                            >
                                {linkedInOAuth?.connected && !linkedInOAuth?.tokenExpired ? (
                                    <>{miniIcon('M9 12l2 2 4-4', '#34d399', 11)} LinkedIn Connected</>
                                ) : (
                                    <>{miniIcon('M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71', '#0ea5e9', 11)} Connect LinkedIn</>
                                )}
                            </button>
                            {/* Profile Sync Button */}
                            {extensionConnected && (
                                <button
                                    onClick={voyagerData ? () => setShowLinkedInDataModal(true) : () => loadVoyagerData()}
                                    disabled={voyagerLoading}
                                    style={{
                                        padding: '4px 10px',
                                        background: voyagerData ? 'rgba(16,185,129,0.15)' : 'rgba(0,119,181,0.15)',
                                        border: voyagerData ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(0,119,181,0.4)',
                                        borderRadius: '6px',
                                        color: voyagerData ? '#34d399' : '#38bdf8',
                                        fontSize: '10px',
                                        fontWeight: '600',
                                        cursor: voyagerLoading ? 'wait' : 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                    onMouseOver={e => { e.currentTarget.style.background = voyagerData ? 'rgba(16,185,129,0.25)' : 'rgba(0,119,181,0.25)'; }}
                                    onMouseOut={e => { e.currentTarget.style.background = voyagerData ? 'rgba(16,185,129,0.15)' : 'rgba(0,119,181,0.15)'; }}
                                >
                                    {voyagerLoading ? (
                                        <>Syncing...</>
                                    ) : voyagerData ? (
                                        <>{miniIcon('M18 20V10 M12 20V4 M6 20v-6', '#34d399', 11)} View Data</>
                                    ) : (
                                        <>{miniIcon('M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0 0 20.49 15', '#38bdf8', 11)} Sync Profile</>
                                    )}
                                </button>
                            )}
                        </div>
                        {/* Theme Toggle */}
                        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.08)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', overflow: 'hidden' }}>
                            {(['current', 'light', 'dark'] as const).map(t => (
                                <button key={t} onClick={() => { setTheme(t); localStorage.setItem('dashboard-theme', t); }}
                                    style={{ padding: '8px 14px', background: theme === t ? 'rgba(105,63,233,0.6)' : 'transparent', color: theme === t ? 'white' : 'rgba(255,255,255,0.6)', border: 'none', fontSize: '12px', fontWeight: theme === t ? '700' : '500', cursor: 'pointer', transition: 'all 0.2s' }}>
                                    {t === 'current' ? 'Current' : t === 'light' ? 'Light' : 'Dark'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tab Content â€” rendered via extracted components */}
                {activeTab === 'overview' && <OverviewTab {...tabProps} />}
                {activeTab === 'writer' && <WriterTab {...tabProps} />}
                {activeTab === 'comments' && <CommentsTab {...tabProps} />}
                {activeTab === 'trending-posts' && <TrendingPostsTab {...tabProps} />}
                {activeTab === 'tasks' && <TasksTab {...tabProps} />}
                {activeTab === 'history' && <HistoryTab {...tabProps} />}
                {activeTab === 'limits' && <LimitsTab {...tabProps} />}
                {activeTab === 'activity' && <ActivityTab {...tabProps} />}
                {activeTab === 'commenter' && <CommenterTab {...tabProps} />}
                {activeTab === 'import' && <ImportTab {...tabProps} />}
                {activeTab === 'analytics' && <AnalyticsTab {...tabProps} />}
                {activeTab === 'usage' && <UsageTab {...tabProps} />}
                {activeTab === 'referrals' && <ReferralsTab {...tabProps} />}
                {activeTab === 'extension' && <ExtensionTab {...tabProps} />}
                {activeTab === 'account' && <AccountTab {...tabProps} />}
            </div>

            {/* Voyager LinkedIn Data Modal — renders on any tab */}
            {showLinkedInDataModal && voyagerData && (() => {
                try {
                    // Safely parse arrays that might be JSON strings
                    const safeArr = (v: any): any[] => {
                        if (Array.isArray(v)) return v;
                        if (typeof v === 'string') { try { const p = JSON.parse(v); return Array.isArray(p) ? p : []; } catch { return []; } }
                        return [];
                    };
                    const safeStr = (v: any): string => {
                        if (typeof v === 'string') return v;
                        if (v == null) return '';
                        try { return JSON.stringify(v); } catch { return String(v); }
                    };
                    const expArr = safeArr(voyagerData.experience);
                    const eduArr = safeArr(voyagerData.education);
                    const postsArr = safeArr(voyagerData.recentPosts);
                    const fCount = Number(voyagerData.followerCount) || 0;
                    const cCount = Number(voyagerData.connectionCount) || 0;
                    const nameStr = safeStr(voyagerData.name) || 'LinkedIn Profile';
                    const headlineStr = safeStr(voyagerData.headline);
                    const locationStr = safeStr(voyagerData.location);
                    const aboutStr = safeStr(voyagerData.about);
                    const urnStr = safeStr(voyagerData.linkedInUrn);
                    const picUrl = typeof voyagerData.profilePicture === 'string' ? voyagerData.profilePicture : '';

                    return (
                        <div style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000
                        }} onClick={() => setShowLinkedInDataModal(false)}>
                            <div onClick={(e: any) => e.stopPropagation()} style={{
                                background: '#13132b', borderRadius: '16px', border: '1px solid rgba(0,119,181,0.3)',
                                padding: '24px', maxWidth: '700px', maxHeight: '85vh', overflow: 'auto', color: 'white', width: '90%'
                            }}>
                                {/* Header — using div avatar only, no img tag */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: picUrl ? `url(${picUrl}) center/cover no-repeat` : 'linear-gradient(135deg, #0077b5, #00a0dc)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '22px', border: '3px solid rgba(0,119,181,0.4)', flexShrink: 0 }}>{picUrl ? '' : (nameStr[0] || 'U').toUpperCase()}</div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>{nameStr}</h3>
                                            {headlineStr && <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginTop: '2px' }}>{headlineStr}</div>}
                                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '4px', display: 'flex', gap: '12px' }}>
                                                {locationStr && <span>📍 {locationStr}</span>}
                                                {fCount > 0 && <span>👥 {fCount.toLocaleString()} followers</span>}
                                                {cCount > 0 && <span>🔗 {cCount.toLocaleString()} connections</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowLinkedInDataModal(false)}
                                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', padding: '6px 12px', color: 'white', fontSize: '16px', cursor: 'pointer' }}>✕</button>
                                </div>

                                {/* Voyager badge */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', padding: '8px 12px', background: 'rgba(0,119,181,0.1)', borderRadius: '8px', border: '1px solid rgba(0,119,181,0.2)', flexWrap: 'wrap' }}>
                                    <span style={{ color: '#00a0dc', fontSize: '11px', fontWeight: '600' }}>⚡ Voyager API Data</span>
                                    {voyagerData.voyagerLastSyncAt && <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>Last synced: {new Date(voyagerData.voyagerLastSyncAt).toLocaleString()}</span>}
                                    {urnStr && <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px' }}>URN: {urnStr}</span>}
                                </div>

                                <div style={{ display: 'grid', gap: '16px' }}>
                                    {/* About */}
                                    {aboutStr && (
                                        <div>
                                            <strong style={{ color: '#0077b5', fontSize: '13px' }}>About</strong>
                                            <p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,0.8)', fontSize: '12px', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{aboutStr}</p>
                                        </div>
                                    )}

                                    {/* Experience */}
                                    {expArr.length > 0 && (
                                        <div>
                                            <strong style={{ color: '#0077b5', fontSize: '13px' }}>Experience ({expArr.length})</strong>
                                            <div style={{ maxHeight: '200px', overflow: 'auto', marginTop: '6px' }}>
                                                {expArr.map((exp: any, idx: number) => (
                                                    <div key={idx} style={{ padding: '8px 10px', margin: '4px 0', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>
                                                        {typeof exp === 'string' ? exp : (
                                                            <div>
                                                                <div style={{ fontWeight: '600', color: 'white' }}>{safeStr(exp?.title || exp?.role)}</div>
                                                                {exp?.company && <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>{safeStr(exp.company)}</div>}
                                                                {exp?.dateRange && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>{safeStr(exp.dateRange)}</div>}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Education */}
                                    {eduArr.length > 0 && (
                                        <div>
                                            <strong style={{ color: '#0077b5', fontSize: '13px' }}>Education ({eduArr.length})</strong>
                                            <div style={{ maxHeight: '150px', overflow: 'auto', marginTop: '6px' }}>
                                                {eduArr.map((edu: any, idx: number) => (
                                                    <div key={idx} style={{ padding: '8px 10px', margin: '4px 0', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>
                                                        {typeof edu === 'string' ? edu : (
                                                            <div>
                                                                <div style={{ fontWeight: '600', color: 'white' }}>{safeStr(edu?.school || edu?.institution)}</div>
                                                                {edu?.degree && <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>{safeStr(edu.degree)}{edu.field ? ` · ${safeStr(edu.field)}` : ''}</div>}
                                                                {edu?.dateRange && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>{safeStr(edu.dateRange)}</div>}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Recent Posts */}
                                    {postsArr.length > 0 && (
                                        <div>
                                            <strong style={{ color: '#0077b5', fontSize: '13px' }}>Recent Posts ({postsArr.length})</strong>
                                            <div style={{ maxHeight: '300px', overflow: 'auto', marginTop: '6px' }}>
                                                {postsArr.map((post: any, idx: number) => {
                                                    const postText = safeStr(typeof post === 'string' ? post : (post?.text || post?.content || ''));
                                                    const likes = typeof post === 'object' && post ? (Number(post.likes || post.numLikes) || 0) : 0;
                                                    const cmts = typeof post === 'object' && post ? (Number(post.comments || post.numComments) || 0) : 0;
                                                    return (
                                                        <div key={idx} style={{ padding: '10px 12px', margin: '4px 0', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', fontSize: '12px' }}>
                                                            <div style={{ color: 'rgba(255,255,255,0.8)', whiteSpace: 'pre-wrap', lineHeight: '1.5', maxHeight: '80px', overflow: 'hidden' }}>
                                                                {postText.length > 300 ? postText.substring(0, 300) + '...' : postText}
                                                            </div>
                                                            {(likes > 0 || cmts > 0) && (
                                                                <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
                                                                    {likes > 0 && <span>👍 {likes}</span>}
                                                                    {cmts > 0 && <span>💬 {cmts}</span>}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                } catch (modalErr: any) {
                    console.error('[VOYAGER MODAL] Render error:', modalErr);
                    return (
                        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }} onClick={() => setShowLinkedInDataModal(false)}>
                            <div onClick={(e: any) => e.stopPropagation()} style={{ background: '#13132b', borderRadius: '16px', border: '1px solid rgba(239,68,68,0.3)', padding: '24px', maxWidth: '500px', color: 'white', width: '90%' }}>
                                <h3 style={{ margin: '0 0 12px', color: '#ef4444' }}>Error Loading Data</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>{String(modalErr?.message || modalErr)}</p>
                                <pre style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', maxHeight: '200px', overflow: 'auto', margin: '12px 0 0' }}>{JSON.stringify(voyagerData, null, 2).substring(0, 2000)}</pre>
                                <button onClick={() => setShowLinkedInDataModal(false)} style={{ marginTop: '12px', padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Close</button>
                            </div>
                        </div>
                    );
                }
            })()}
        </div>
    );
}
```

---

