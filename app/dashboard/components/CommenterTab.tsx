// @ts-nocheck
export default function CommenterTab(props: any) {
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
            {(commenterCfgLoading || csSettingsLoading) ? <div style={{ color: 'rgba(255,255,255,0.5)', padding: '40px', textAlign: 'center' }}>Loading settings...</div> : commenterCfg && (<>

                {/* Row 1: Post Source + Processing side-by-side */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '5px' }}>{miniIcon('M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 7a3 3 0 100 6 3 3 0 000-6z', 'white', 13)} Post Source</h4>
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                            {[{ val: 'search', label: 'Search' }, { val: 'feed', label: 'Feed' }].map(s => (
                                <button key={s.val} onClick={() => setCommenterCfg((p: any) => ({ ...p, postSource: s.val }))}
                                    style={{ flex: 1, padding: '7px', background: commenterCfg.postSource === s.val ? 'linear-gradient(135deg,#693fe9,#8b5cf6)' : 'rgba(255,255,255,0.08)', border: commenterCfg.postSource === s.val ? 'none' : '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontWeight: commenterCfg.postSource === s.val ? '700' : '500', cursor: 'pointer', fontSize: '12px' }}>
                                    {s.label}
                                </button>
                            ))}
                        </div>
                        {commenterCfg.postSource === 'search' && (
                            <textarea value={commenterCfg.searchKeywords} onChange={e => setCommenterCfg((p: any) => ({ ...p, searchKeywords: e.target.value }))}
                                placeholder="AI marketing&#10;SaaS growth&#10;startup tips" rows={2}
                                style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '12px', resize: 'vertical' }} />
                        )}
                        {commenterCfg.postSource === 'feed' && (
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: 0 }}>Processes your home feed, ignores ads</p>
                        )}
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '5px' }}>{miniIcon('M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', 'white', 13)} Processing</h4>
                        {[
                            { key: 'totalPosts', label: 'Total Posts', min: 1, max: 50 },
                            { key: 'minLikes', label: 'Min Likes', min: 0, max: 9999 },
                            { key: 'minComments', label: 'Min Comments', min: 0, max: 9999 },
                        ].map(f => (
                            <div key={f.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>{f.label}</span>
                                <input type="number" min={f.min} max={f.max} value={commenterCfg[f.key]} onChange={e => setCommenterCfg((p: any) => ({ ...p, [f.key]: parseInt(e.target.value) || 0 }))}
                                    style={{ width: '60px', padding: '5px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', fontSize: '12px', textAlign: 'center' }} />
                            </div>
                        ))}
                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px', margin: '2px 0 0 0' }}>0 = no minimum filter</p>
                    </div>
                </div>

                {/* Row 2: Actions + Ignore Keywords side-by-side */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>{miniIcon('M13 2L3 14h9l-1 8 10-12h-9l1-8z', 'white', 13)} Actions</h4>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                {[{ val: true, label: 'Window' }, { val: false, label: 'Tabs' }].map(o => (
                                    <button key={String(o.val)} onClick={() => setCommenterCfg((p: any) => ({ ...p, openInNewWindow: o.val }))}
                                        style={{ padding: '3px 8px', background: commenterCfg.openInNewWindow === o.val ? '#693fe9' : 'rgba(255,255,255,0.08)', border: commenterCfg.openInNewWindow === o.val ? 'none' : '1px solid rgba(255,255,255,0.15)', borderRadius: '5px', color: 'white', fontSize: '10px', fontWeight: commenterCfg.openInNewWindow === o.val ? '700' : '500', cursor: 'pointer' }}>
                                        {o.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                            {[
                                { key: 'savePosts', label: 'Save' },
                                { key: 'likePosts', label: 'Like' },
                                { key: 'commentOnPosts', label: 'Comment' },
                                { key: 'likeOrComment', label: 'Like/Comment' },
                                { key: 'sharePosts', label: 'Share' },
                                { key: 'followAuthors', label: 'Follow' },
                            ].map(f => (
                                <label key={f.key} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'rgba(255,255,255,0.7)', fontSize: '11px', cursor: 'pointer', padding: '6px 7px', background: commenterCfg[f.key] ? 'rgba(105,63,233,0.15)' : 'rgba(255,255,255,0.03)', borderRadius: '6px', border: commenterCfg[f.key] ? '1px solid rgba(105,63,233,0.3)' : '1px solid rgba(255,255,255,0.08)' }}>
                                    <input type="checkbox" checked={commenterCfg[f.key]} onChange={e => setCommenterCfg((p: any) => ({ ...p, [f.key]: e.target.checked }))}
                                        style={{ accentColor: '#693fe9', width: '13px', height: '13px' }} />
                                    {f.label}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: '0 0 6px 0' }}>Ignore Keywords</h4>
                        <textarea value={commenterCfg.ignoreKeywords} onChange={e => setCommenterCfg((p: any) => ({ ...p, ignoreKeywords: e.target.value }))}
                            placeholder="hiring&#10;we're hiring&#10;job opening&#10;apply now" rows={4}
                            style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '11px', resize: 'vertical', fontFamily: 'monospace' }} />
                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px', margin: '3px 0 0 0' }}>One per line. Posts containing these are skipped.</p>
                    </div>
                </div>

                {/* Row 3: Schedule + Save/Start all in one row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: 0 }}>Auto-Schedule</h4>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={commenterCfg.autoScheduleEnabled} onChange={e => setCommenterCfg((p: any) => ({ ...p, autoScheduleEnabled: e.target.checked }))} style={{ accentColor: '#693fe9', width: '14px', height: '14px' }} />
                                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px' }}>Enabled</span>
                            </label>
                        </div>
                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '6px' }}>
                            {(() => {
                                try {
                                    const sches = JSON.parse(commenterCfg.schedules || '[]'); return sches.map((s: any, i: number) => (
                                        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 7px', background: 'rgba(167,139,250,0.15)', borderRadius: '5px', border: '1px solid rgba(167,139,250,0.3)', fontSize: '10px', color: '#a78bfa' }}>
                                            {s.time} {s.ampm}
                                            <button onClick={() => { const arr = [...sches]; arr.splice(i, 1); setCommenterCfg((p: any) => ({ ...p, schedules: JSON.stringify(arr) })); }}
                                                style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '9px', padding: '0 1px' }}>✕</button>
                                        </span>
                                    ));
                                } catch { return null; }
                            })()}
                        </div>
                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                            <input id="commenter-sched-time" type="time" defaultValue="09:00" style={{ padding: '4px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '5px', color: 'white', fontSize: '11px' }} />
                            <select id="commenter-sched-ampm" defaultValue="AM" style={{ padding: '4px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '5px', color: 'white', fontSize: '11px' }}>
                                <option value="AM">AM</option><option value="PM">PM</option>
                            </select>
                            <button onClick={() => { const t = (document.getElementById('commenter-sched-time') as HTMLInputElement)?.value || '09:00'; const ap = (document.getElementById('commenter-sched-ampm') as HTMLSelectElement)?.value || 'AM'; try { const arr = JSON.parse(commenterCfg.schedules || '[]'); arr.push({ time: t, ampm: ap }); setCommenterCfg((p: any) => ({ ...p, schedules: JSON.stringify(arr) })); } catch { setCommenterCfg((p: any) => ({ ...p, schedules: JSON.stringify([{ time: t, ampm: ap }]) })); } }}
                                style={{ padding: '4px 9px', background: 'linear-gradient(135deg,#693fe9,#8b5cf6)', border: 'none', borderRadius: '5px', color: 'white', fontSize: '10px', fontWeight: '600', cursor: 'pointer' }}>+ Add</button>
                        </div>
                    </div>
                    {/* Save + Start Buttons stacked */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button onClick={async () => { await saveCommenterCfg(commenterCfg); await saveCommentSettings(); }} disabled={commenterCfgSaving || csSettingsSaving}
                            style={{ flex: 1, padding: '14px', background: (commenterCfgSaving || csSettingsSaving) ? 'rgba(105,63,233,0.4)' : 'linear-gradient(135deg, #693fe9, #8b5cf6)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: (commenterCfgSaving || csSettingsSaving) ? 'wait' : 'pointer' }}>
                            {(commenterCfgSaving || csSettingsSaving) ? 'Saving...' : 'Save Settings'}
                        </button>
                        <button onClick={async () => { const token = localStorage.getItem('authToken'); if (!token) return; await saveCommenterCfg(commenterCfg); await saveCommentSettings(); showToast('Starting bulk commenting...', 'info'); try { const res = await fetch('/api/extension/command', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ command: 'start_bulk_commenting', data: { ...commenterCfg, commentSettings: { goal: csGoal, tone: csTone, commentLength: csLength, commentStyle: csStyle, userExpertise: csExpertise, userBackground: csBackground, aiAutoPost: csAutoPost } } }) }); const data = await res.json(); if (data.success) showToast('Task sent to extension!', 'success'); else showToast(data.error || 'Failed', 'error'); } catch (e: any) { showToast('Error: ' + e.message, 'error'); } }}
                            style={{ flex: 1, padding: '14px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
                            Start Commenting
                        </button>
                    </div>
                </div>
            </>)}
        </div>

    );
}