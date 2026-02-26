// @ts-nocheck
export default function ImportTab(props: any) {
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
                        {importCfgLoading ? <div style={{ color: 'rgba(255,255,255,0.5)', padding: '40px', textAlign: 'center' }}>Loading settings...</div> : importCfg && (<>

                            {/* Profile URLs + CSV upload merged */}
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: 0 }}>Profile URLs</h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <input type="file" accept=".csv" id="import-csv-upload" style={{ display: 'none' }}
                                            onChange={e => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = (ev) => { const text = ev.target?.result as string; if (!text) return; const lines = text.split('\n').map(l => l.split(',')[0]?.trim()).filter(l => l.includes('linkedin.com/in/')); if (lines.length > 0) { const existing = importCfg.profileUrls ? importCfg.profileUrls.trim() : ''; const combined = existing ? existing + '\n' + lines.join('\n') : lines.join('\n'); setImportCfg((p: any) => ({ ...p, profileUrls: combined })); showToast(`Imported ${lines.length} profiles from CSV`, 'success'); } else { showToast('No LinkedIn URLs found in CSV', 'error'); } }; reader.readAsText(file); e.target.value = ''; }} />
                                        <button onClick={() => document.getElementById('import-csv-upload')?.click()}
                                            style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>
                                            CSV
                                        </button>
                                        <span style={{ color: '#a78bfa', fontSize: '12px', fontWeight: '700' }}>{importCfg.profileUrls ? importCfg.profileUrls.split('\n').filter((u: string) => u.trim().includes('linkedin.com/in/')).length : 0} detected</span>
                                    </div>
                                </div>
                                <textarea value={importCfg.profileUrls}
                                    onChange={e => setImportCfg((p: any) => ({ ...p, profileUrls: e.target.value }))}
                                    onBlur={e => {
                                        const cleaned = cleanLinkedInProfileUrls(e.target.value).join('\n');
                                        if (cleaned !== e.target.value) {
                                            setImportCfg((p: any) => ({ ...p, profileUrls: cleaned }));
                                        }
                                    }}
                                    placeholder="https://www.linkedin.com/in/john-doe/&#10;https://www.linkedin.com/in/jane-smith/" rows={4}
                                    style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '12px', resize: 'vertical', fontFamily: 'monospace' }} />
                            </div>

                            {/* Credits + Settings side-by-side */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                {/* Import Credits */}
                                <div style={{ background: 'rgba(105,63,233,0.1)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(105,63,233,0.3)' }}>
                                    <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: '0 0 10px 0' }}>Credits {user?.plan ? `(${user.plan.name})` : ''}</h4>
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '20px', fontWeight: '800', color: '#34d399' }}>{Math.max(0, (user?.plan?.monthlyImportCredits || 50) - (usage?.usage?.importProfiles || 0))}</div>
                                            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)' }}>Left</div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '20px', fontWeight: '800', color: '#a78bfa' }}>{user?.plan?.monthlyImportCredits || 50}</div>
                                            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)' }}>Total</div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '20px', fontWeight: '800', color: 'white' }}>{usage?.usage?.importProfiles || 0}</div>
                                            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)' }}>Used</div>
                                        </div>
                                    </div>
                                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', margin: '8px 0 0 0' }}>1 credit per profile</p>
                                </div>

                                {/* Automation Config */}
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: '0 0 10px 0' }}>Config</h4>
                                    {[
                                        { key: 'profilesPerDay', label: 'Profiles/Day', min: 1, max: 100 },
                                        { key: 'postsPerProfile', label: 'Posts/Profile', min: 1, max: 10 },
                                    ].map(f => (
                                        <div key={f.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>{f.label}</span>
                                            <input type="number" min={f.min} max={f.max} value={importCfg[f.key]} onChange={e => setImportCfg((p: any) => ({ ...p, [f.key]: parseInt(e.target.value) || f.min }))}
                                                style={{ width: '60px', padding: '5px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', fontSize: '13px', textAlign: 'center' }} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Engagement Method + Actions side-by-side */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: '0 0 8px 0' }}>Engagement Method</h4>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        {[
                                            { value: 'individual', label: 'Individual Posts', desc: 'More reliable, AI comments' },
                                            { value: 'activity', label: 'Activity Page', desc: 'Faster, less reliable' },
                                        ].map(m => {
                                            const isActive = (importCfg.engagementMethod || 'individual') === m.value;
                                            return (
                                                <button key={m.value} onClick={() => setImportCfg((p: any) => ({ ...p, engagementMethod: m.value }))}
                                                    style={{ flex: 1, padding: '8px', background: isActive ? 'rgba(105,63,233,0.2)' : 'rgba(255,255,255,0.03)', border: isActive ? '2px solid rgba(105,63,233,0.6)' : '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', textAlign: 'left' }}>
                                                    <div style={{ color: 'white', fontSize: '11px', fontWeight: '700', marginBottom: '2px' }}>{m.label}</div>
                                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', lineHeight: '1.2' }}>{m.desc}</div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '5px' }}>{miniIcon('M13 2L3 14h9l-1 8 10-12h-9l1-8z', 'white', 13)} Actions</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                                        {[
                                            { key: 'sendConnections', label: 'Connect' },
                                            { key: 'engageLikes', label: 'Like' },
                                            { key: 'engageComments', label: 'Comment' },
                                            { key: 'engageShares', label: 'Share' },
                                            { key: 'engageFollows', label: 'Follow' },
                                            { key: 'smartRandom', label: 'Random' },
                                        ].map(f => (
                                            <label key={f.key} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'rgba(255,255,255,0.7)', fontSize: '11px', cursor: 'pointer', padding: '6px 7px', background: importCfg[f.key] ? 'rgba(105,63,233,0.15)' : 'rgba(255,255,255,0.03)', borderRadius: '6px', border: importCfg[f.key] ? '1px solid rgba(105,63,233,0.3)' : '1px solid rgba(255,255,255,0.08)' }}>
                                                <input type="checkbox" checked={importCfg[f.key]} onChange={e => setImportCfg((p: any) => ({ ...p, [f.key]: e.target.checked }))}
                                                    style={{ accentColor: '#693fe9', width: '13px', height: '13px' }} />
                                                {f.label}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Schedule + Save/Launch in one row */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: 0 }}>Auto-Schedule</h4>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                                            <input type="checkbox" checked={importCfg.autoScheduleEnabled} onChange={e => setImportCfg((p: any) => ({ ...p, autoScheduleEnabled: e.target.checked }))} style={{ accentColor: '#693fe9', width: '14px', height: '14px' }} />
                                            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px' }}>Enabled</span>
                                        </label>
                                    </div>
                                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '6px' }}>
                                        {(() => {
                                            try {
                                                const sches = JSON.parse(importCfg.schedules || '[]'); return sches.map((s: any, i: number) => (
                                                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 7px', background: 'rgba(167,139,250,0.15)', borderRadius: '5px', border: '1px solid rgba(167,139,250,0.3)', fontSize: '10px', color: '#a78bfa' }}>
                                                        {s.time} {s.ampm}
                                                        <button onClick={() => { const arr = [...sches]; arr.splice(i, 1); setImportCfg((p: any) => ({ ...p, schedules: JSON.stringify(arr) })); }}
                                                            style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '9px', padding: '0 1px' }}>✕</button>
                                                    </span>
                                                ));
                                            } catch { return null; }
                                        })()}
                                    </div>
                                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                        <input id="import-sched-time" type="time" defaultValue="09:00" style={{ padding: '4px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '5px', color: 'white', fontSize: '11px' }} />
                                        <select id="import-sched-ampm" defaultValue="AM" style={{ padding: '4px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '5px', color: 'white', fontSize: '11px' }}>
                                            <option value="AM">AM</option><option value="PM">PM</option>
                                        </select>
                                        <button onClick={() => { const t = (document.getElementById('import-sched-time') as HTMLInputElement)?.value || '09:00'; const ap = (document.getElementById('import-sched-ampm') as HTMLSelectElement)?.value || 'AM'; try { const arr = JSON.parse(importCfg.schedules || '[]'); arr.push({ time: t, ampm: ap }); setImportCfg((p: any) => ({ ...p, schedules: JSON.stringify(arr) })); } catch { setImportCfg((p: any) => ({ ...p, schedules: JSON.stringify([{ time: t, ampm: ap }]) })); } }}
                                            style={{ padding: '4px 9px', background: 'linear-gradient(135deg,#693fe9,#8b5cf6)', border: 'none', borderRadius: '5px', color: 'white', fontSize: '10px', fontWeight: '600', cursor: 'pointer' }}>+ Add</button>
                                    </div>
                                </div>
                                {/* Save + Launch stacked */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <button onClick={() => saveImportCfg(importCfg)} disabled={importCfgSaving}
                                        style={{ flex: 1, padding: '14px', background: importCfgSaving ? 'rgba(105,63,233,0.4)' : 'linear-gradient(135deg, #693fe9, #8b5cf6)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: importCfgSaving ? 'wait' : 'pointer' }}>
                                        {importCfgSaving ? 'Saving...' : 'Save Settings'}
                                    </button>
                                    <button onClick={async () => { const token = localStorage.getItem('authToken'); if (!token) return; await saveImportCfg(importCfg); showToast('Launching import...', 'info'); try { const res = await fetch('/api/extension/command', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ command: 'start_import_automation', data: importCfg }) }); const data = await res.json(); if (data.success) showToast('Task sent to extension!', 'success'); else showToast(data.error || 'Failed', 'error'); } catch (e: any) { showToast('Error: ' + e.message, 'error'); } }}
                                        style={{ flex: 1, padding: '14px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
                                        Launch Import
                                    </button>
                                </div>
                            </div>

                            {/* Quick Engage via Extension API */}
                            <div style={{ background: 'linear-gradient(135deg, rgba(0,119,181,0.1), rgba(0,160,220,0.05))', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(0,119,181,0.2)' }}>
                                <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {miniIcon('M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71', '#60a5fa', 14)} Quick Engage via API
                                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', fontWeight: '400' }}>Follow/Like/Comment using LinkedIn Voyager API</span>
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                                    <button onClick={async () => {
                                        const token = localStorage.getItem('authToken');
                                        if (!token) return;
                                        const urls = (importCfg?.profileUrls || '').split('\n').map((u: string) => u.trim()).filter((u: string) => u.includes('linkedin.com/in/'));
                                        if (urls.length === 0) { showToast('Add LinkedIn profile URLs first', 'error'); return; }
                                        showToast(`Batch engaging ${urls.length} profiles via API...`, 'info');
                                        try {
                                            const res = await fetch('/api/extension/command', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                                body: JSON.stringify({
                                                    command: 'linkedin_batch_engage',
                                                    data: {
                                                        profiles: urls.map((u: string) => ({ url: u })),
                                                        actions: {
                                                            follow: importCfg?.engageFollows || false,
                                                            like: importCfg?.engageLikes || false,
                                                            comment: importCfg?.engageComments || false,
                                                            commentText: importCfg?.defaultComment || 'Great post! Thanks for sharing.'
                                                        }
                                                    }
                                                })
                                            });
                                            const data = await res.json();
                                            if (data.success) showToast(`Batch engage task queued for ${urls.length} profiles!`, 'success');
                                            else showToast(data.error || 'Failed', 'error');
                                        } catch (e: any) { showToast('Error: ' + e.message, 'error'); }
                                    }}
                                        style={{ padding: '10px 12px', background: 'linear-gradient(135deg, #0077b5, #00a0dc)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                        {miniIcon('M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75', 'white', 12)} Batch Engage All
                                    </button>
                                    <button onClick={async () => {
                                        const token = localStorage.getItem('authToken');
                                        if (!token) return;
                                        const urls = (importCfg?.profileUrls || '').split('\n').map((u: string) => u.trim()).filter((u: string) => u.includes('linkedin.com/in/'));
                                        if (urls.length === 0) { showToast('Add LinkedIn profile URLs first', 'error'); return; }
                                        showToast(`Following ${urls.length} profiles via API...`, 'info');
                                        for (const url of urls.slice(0, 10)) {
                                            try {
                                                await fetch('/api/extension/command', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                                    body: JSON.stringify({ command: 'linkedin_follow_profile', data: { profileUrl: url } })
                                                });
                                            } catch (e) { }
                                        }
                                        showToast(`Follow tasks queued for ${Math.min(urls.length, 10)} profiles!`, 'success');
                                    }}
                                        style={{ padding: '10px 12px', background: 'linear-gradient(135deg, #693fe9, #8b5cf6)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                        {miniIcon('M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M8.5 3A4 4 0 1 0 8.5 11 4 4 0 0 0 8.5 3z M20 8v6 M23 11h-6', 'white', 12)} Follow Only
                                    </button>
                                </div>
                                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '9px', margin: '6px 0 0 0' }}>Uses LinkedIn Voyager API via extension. Faster than UI automation. Check Tasks tab for progress.</p>
                            </div>

                            {/* Import History — compact inline stats + table */}
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: 0 }}>History</h4>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        {(() => {
                                            const importHist = analyticsData?.importHistory || [];
                                            const totalProfiles = importHist.length;
                                            const totalConnects = importHist.filter((h: any) => h.connected).length;
                                            const totalLikes = importHist.reduce((sum: number, h: any) => sum + (h.liked || 0), 0);
                                            const totalComments = importHist.reduce((sum: number, h: any) => sum + (h.commented || 0), 0);
                                            const successRate = totalProfiles > 0 ? Math.round((totalConnects / totalProfiles) * 100) : 0;
                                            return [
                                                { label: 'Profiles', val: totalProfiles, color: '#a78bfa' },
                                                { label: 'Connects', val: totalConnects, color: '#34d399' },
                                                { label: 'Likes', val: totalLikes, color: '#60a5fa' },
                                                { label: 'Comments', val: totalComments, color: '#fbbf24' },
                                                { label: 'Rate', val: `${successRate}%`, color: '#f472b6' },
                                            ].map(s => (
                                                <div key={s.label} style={{ textAlign: 'center' }}>
                                                    <div style={{ fontSize: '14px', fontWeight: '800', color: s.color }}>{s.val}</div>
                                                    <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.45)' }}>{s.label}</div>
                                                </div>
                                            ));
                                        })()}
                                    </div>
                                </div>
                                <div style={{ overflowX: 'auto', maxHeight: '300px', overflowY: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                                        <thead style={{ position: 'sticky', top: 0, background: '#1a1a3e', zIndex: 1 }}>
                                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                                {['Date', 'Profile', 'Connect', 'Likes', 'Comments', 'Status'].map(h => (
                                                    <th key={h} style={{ padding: '5px 4px', color: 'rgba(255,255,255,0.5)', fontWeight: '600', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(analyticsData?.importHistory || []).length === 0 ? (
                                                <tr><td colSpan={6} style={{ padding: '10px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>No actions yet. Launch to see history.</td></tr>
                                            ) : (
                                                (analyticsData?.importHistory || []).slice(0, 50).map((entry: any, idx: number) => (
                                                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <td style={{ padding: '6px 4px', color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap' }}>{new Date(entry.timestamp).toLocaleDateString()}</td>
                                                        <td style={{ padding: '6px 4px', color: 'white', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.profileName || 'Unknown'}</td>
                                                        <td style={{ padding: '6px 4px', textAlign: 'center' }}>{entry.connected ? <span style={{ color: '#34d399' }}>✓</span> : <span style={{ color: 'rgba(255,255,255,0.2)' }}>-</span>}</td>
                                                        <td style={{ padding: '6px 4px', textAlign: 'center', color: '#60a5fa' }}>{entry.liked || 0}</td>
                                                        <td style={{ padding: '6px 4px', textAlign: 'center', color: '#fbbf24' }}>{entry.commented || 0}</td>
                                                        <td style={{ padding: '6px 4px' }}>
                                                            <span style={{ padding: '2px 6px', background: entry.status === 'completed' ? 'rgba(16,185,129,0.15)' : entry.status === 'failed' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', border: `1px solid ${entry.status === 'completed' ? 'rgba(16,185,129,0.3)' : entry.status === 'failed' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`, borderRadius: '4px', color: entry.status === 'completed' ? '#34d399' : entry.status === 'failed' ? '#f87171' : '#fbbf24', fontSize: '9px', fontWeight: '600' }}>
                                                                {entry.status || 'pending'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>)}
                    </div>

    );
}