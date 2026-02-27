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