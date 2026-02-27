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