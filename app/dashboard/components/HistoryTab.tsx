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
                                    try { if (item.metadata) parsedMeta = JSON.parse(item.metadata); } catch (error) {
                                      console.warn('Failed to parse item metadata:', error);
                                    }

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