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
                                { label: 'Pending', count: tasks.filter((t: any) => t.status === 'pending').length, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
                                { label: 'In Progress', count: tasks.filter((t: any) => t.status === 'in_progress').length, color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
                                { label: 'Completed', count: tasks.filter((t: any) => t.status === 'completed' || t.status === 'completed_manual').length, color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
                                { label: 'Failed/Cancelled', count: tasks.filter((t: any) => t.status === 'failed' || t.status === 'cancelled').length, color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
                            ].map((s, i) => (
                                <div key={i} style={{ background: s.bg, padding: '20px', borderRadius: '16px', textAlign: 'center', border: `1px solid ${s.color}33` }}>
                                    <div style={{ fontSize: '28px', fontWeight: '700', color: s.color }}>{s.count}</div>
                                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{s.label}</div>
                                </div>
                            ))}
                        </div>
                        {/* Queue Info Banner */}
                        {tasks.filter((t: { status: string }) => t.status === 'pending').length > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', background: 'rgba(245,158,11,0.1)', borderRadius: '10px', border: '1px solid rgba(245,158,11,0.25)', marginBottom: '16px' }}>
                                <span>{miniIcon('M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 6v6l4 2', '#f59e0b', 14)}</span>
                                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                                    <strong style={{ color: '#fbbf24' }}>{tasks.filter((t: { status: string }) => t.status === 'pending').length} task(s) queued</strong> — only one task runs at a time. Each pending task waits for the current one to finish before starting.
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
                                        const startDelaySec = 0; // No delay - start immediately
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