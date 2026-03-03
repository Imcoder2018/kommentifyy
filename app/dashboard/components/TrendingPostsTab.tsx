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
                                                window.dispatchEvent(new CustomEvent('kommentify-task-created'));
                                            } else if (data.success) {
                                                setTrendingStatus('Scrape task sent! Extension will open a new window and start scraping.');
                                                window.dispatchEvent(new CustomEvent('kommentify-task-created'));
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
                                {scheduleTimesInput.map((time: string, i: number) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(105,63,233,0.2)', border: '1px solid rgba(105,63,233,0.35)', borderRadius: '6px', padding: '2px 6px' }}>
                                        <input type="time" value={time} onChange={e => { const arr = [...scheduleTimesInput]; arr[i] = e.target.value; setScheduleTimesInput(arr); }}
                                            style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '11px', outline: 'none', width: '62px' }} />
                                        <button onClick={() => setScheduleTimesInput(scheduleTimesInput.filter((item: string, idx: number) => idx !== i))}
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
                                            <div key={p.id || i} onClick={() => { setTrendingSelectedPosts((prev: string[]) => prev.includes(p.id) ? prev.filter((x: string) => x !== p.id) : [...prev, p.id]); }}
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
                            {[{ id: 'today', label: 'Today' }, { id: 'week', label: 'Week' }, { id: 'month', label: 'Month' }, { id: 'all', label: 'All' }].map((p: any) => (
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
                                    <button onClick={() => { if (trendingSelectedPosts.length >= 10) setTrendingSelectedPosts([]); else setTrendingSelectedPosts(savedPosts.slice(0, 10).map((p: any) => p.id)); }}
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
                                        {MODEL_OPTIONS.map((m: any) => (<option key={m.id} value={m.id}>{m.name}</option>))}
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
                                                            const selected = savedPosts.filter((p: any) => trendingSelectedPosts.includes(p.id));
                                                            const allMixed = [...selected.map((p: any) => p.postContent || ''), ...trendingGeneratedPosts.map((p: any) => p.content || '')];
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
                                                        <button onClick={() => setGeneratedPostImages((prev: any) => { const n = { ...prev }; delete n[i]; return n; })}
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
                                            if (isSelected) setTrendingSelectedPosts(trendingSelectedPosts.filter((id: string) => id !== post.id));
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