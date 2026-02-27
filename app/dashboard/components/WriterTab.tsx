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