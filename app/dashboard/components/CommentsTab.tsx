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
                                    {MODEL_OPTIONS.map((m: any) => (
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