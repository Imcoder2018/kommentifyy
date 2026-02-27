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
                                        .then(r => {
                                            if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
                                            return r.json();
                                        })
                                        .then(d => { 
                                            if (d.success) setLiveActivityLogs(d.logs || []); 
                                            else throw new Error(d.error || 'Failed to fetch activity logs');
                                        })
                                        .catch(error => {
                                            console.error('Error fetching activity logs:', error);
                                            showToast('Failed to fetch activity logs', 'error');
                                        })
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
                                        const res = await fetch('/api/live-activity', { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                                        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
                                        const data = await res.json();
                                        if (data.success) {
                                            setLiveActivityLogs([]);
                                            showToast('Activity logs cleared successfully', 'success');
                                        } else {
                                            throw new Error(data.error || 'Failed to clear activity logs');
                                        }
                                    } catch (error: any) {
                                        console.error('Error clearing activity logs:', error);
                                        showToast('Failed to clear activity logs: ' + error.message, 'error');
                                    }
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