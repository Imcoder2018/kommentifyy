export default function AnalyticsTab(props: any) {
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

    // Export function for analytics data
    const exportAnalyticsData = (dataType: 'leads' | 'automation' | 'networking' | 'import') => {
        try {
            let data: any[] = [];
            let filename = '';
            
            switch (dataType) {
                case 'leads':
                    data = analyticsData.leads || [];
                    filename = 'leads-database.csv';
                    break;
                case 'automation':
                    data = analyticsData.automation || [];
                    filename = 'automation-history.csv';
                    break;
                case 'networking':
                    data = analyticsData.networking || [];
                    filename = 'networking-history.csv';
                    break;
                case 'import':
                    data = analyticsData.import || [];
                    filename = 'import-profiles.csv';
                    break;
            }
            
            if (data.length === 0) {
                showToast('No data to export', 'info');
                return;
            }
            
            // Convert to CSV
            const headers = Object.keys(data[0] || {});
            const csvContent = [
                headers.join(','),
                ...data.map(row => headers.map(header => {
                    const value = row[header];
                    // Handle nested objects and arrays
                    if (typeof value === 'object' && value !== null) {
                        return JSON.stringify(value).replace(/"/g, '""');
                    }
                    // Escape commas and quotes in strings
                    if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value || '';
                }).join(','))
            ].join('\n');
            
            // Create and download file
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            showToast(`Exported ${data.length} ${dataType} records`, 'success');
        } catch (error: any) {
            console.error('Export error:', error);
            showToast('Failed to export data: ' + error.message, 'error');
        }
    };

    return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Engagement Analytics Card */}
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <h3 style={{ color: '#a78bfa', fontSize: '16px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>{miniIcon('M18 20V10 M12 20V4 M6 20v-6', '#a78bfa', 16)} Engagement Analytics</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <select value={analyticsPeriod} onChange={e => { const newPeriod = e.target.value; setAnalyticsPeriod(newPeriod); loadAnalytics(newPeriod); }}
                                        style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '13px' }}>
                                        <option value="today">Today</option>
                                        <option value="yesterday">Yesterday</option>
                                        <option value="3days">Last 3 Days</option>
                                        <option value="7days">Last 7 Days</option>
                                        <option value="30days">Last 30 Days</option>
                                        <option value="90days">Last 90 Days</option>
                                    </select>
                                    <button onClick={() => loadAnalytics()} style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center' }}>{miniIcon('M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0 0 20.49 15', 'white', 13)}</button>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                                {[
                                    { label: 'Total', value: analyticsData.engagements?.total || 0, color: '#693fe9', bg: 'linear-gradient(135deg, #693fe9 0%, #7c4dff 100%)' },
                                    { label: 'Comments', value: analyticsData.engagements?.comments || 0, color: '#4CAF50', bg: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)' },
                                    { label: 'Likes', value: analyticsData.engagements?.likes || 0, color: '#2196F3', bg: 'linear-gradient(135deg, #2196F3 0%, #42A5F5 100%)' },
                                    { label: 'Shares', value: analyticsData.engagements?.shares || 0, color: '#FF9800', bg: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)' },
                                    { label: 'Follows', value: analyticsData.engagements?.follows || 0, color: '#E91E63', bg: 'linear-gradient(135deg, #E91E63 0%, #F06292 100%)' },
                                ].map(s => (
                                    <div key={s.label} style={{ padding: '16px', textAlign: 'center', background: s.bg, borderRadius: '12px', boxShadow: `0 2px 10px ${s.color}40` }}>
                                        <div style={{ fontSize: '24px', color: 'white', fontWeight: '700' }}>{s.value}</div>
                                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.9)' }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Leads Database */}
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <h3 style={{ color: 'white', fontSize: '14px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>{miniIcon('M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M8.5 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M20 8v6 M23 11h-6', 'white', 14)} Leads Database</h3>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <button onClick={() => loadAnalytics()} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', cursor: 'pointer', fontSize: '11px' }}>Refresh</button>
                                    <button onClick={() => exportAnalyticsData('leads')} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', cursor: 'pointer', fontSize: '11px' }}>Export</button>
                                </div>
                            </div>
                            <input type="text" value={analyticsLeadsSearch} onChange={e => setAnalyticsLeadsSearch(e.target.value)} placeholder="Search leads..."
                                style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '13px', marginBottom: '12px' }} />
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                                <span>Total: <strong style={{ color: 'white' }}>{analyticsData.leads?.length || 0}</strong></span>
                                <span>Email: <strong style={{ color: 'white' }}>{analyticsData.leads?.filter((l: any) => l.email).length || 0}</strong></span>
                                <span>Phone: <strong style={{ color: 'white' }}>{analyticsData.leads?.filter((l: any) => l.phone).length || 0}</strong></span>
                                <span>Connected: <strong style={{ color: 'white' }}>{analyticsData.leads?.filter((l: any) => l.connected).length || 0}</strong></span>
                            </div>
                            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                                    <thead style={{ background: 'linear-gradient(135deg, #693fe9 0%, #7c4dff 100%)', position: 'sticky', top: 0 }}>
                                        <tr>
                                            {['Name', 'Headline', 'Location', 'Query', 'Date', 'Actions'].map(h => (
                                                <th key={h} style={{ padding: '10px', textAlign: 'left', color: 'white', fontWeight: '600' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(!analyticsData.leads || analyticsData.leads.length === 0) ? (
                                            <tr><td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>No leads found. Start a People Search to collect leads.</td></tr>
                                        ) : analyticsData.leads.filter((l: any) => !analyticsLeadsSearch || l.name?.toLowerCase().includes(analyticsLeadsSearch.toLowerCase())).map((lead: any, i: number) => (
                                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                                <td style={{ padding: '10px', color: 'white', fontWeight: '600' }}>{lead.name || '-'}</td>
                                                <td style={{ padding: '10px', color: 'rgba(255,255,255,0.7)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.headline || '-'}</td>
                                                <td style={{ padding: '10px', color: 'rgba(255,255,255,0.6)' }}>{lead.location || '-'}</td>
                                                <td style={{ padding: '10px', color: 'rgba(255,255,255,0.6)' }}>{lead.query || '-'}</td>
                                                <td style={{ padding: '10px', color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>{lead.date ? new Date(lead.date).toLocaleDateString() : '-'}</td>
                                                <td style={{ padding: '10px' }}>{lead.profileUrl && <a href={lead.profileUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#693fe9', fontSize: '11px' }}>View</a>}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Automation History */}
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <h3 style={{ color: 'white', fontSize: '14px', fontWeight: '700', margin: 0 }}>Automation History</h3>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <select value={analyticsAutoFilter} onChange={e => setAnalyticsAutoFilter(e.target.value)} style={{ padding: '5px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', fontSize: '11px' }}>
                                        <option value="all">All</option>
                                        <option value="success">Success</option>
                                        <option value="failed">Failed</option>
                                    </select>
                                    <button onClick={() => loadAnalytics()} style={{ padding: '5px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', cursor: 'pointer', fontSize: '11px' }}>Refresh</button>
                                    <button onClick={() => exportAnalyticsData('automation')} style={{ padding: '5px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', cursor: 'pointer', fontSize: '11px' }}>Export</button>
                                </div>
                            </div>
                            <input type="text" value={analyticsAutoSearch} onChange={e => setAnalyticsAutoSearch(e.target.value)} placeholder="Search by keyword, author..."
                                style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '13px', marginBottom: '12px' }} />
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                                <span>Sessions: <strong style={{ color: 'white' }}>{analyticsData.automationHistory?.length || 0}</strong></span>
                                <span>Posts: <strong style={{ color: 'white' }}>{analyticsData.automationHistory?.reduce((sum: number, s: any) => sum + (s.postsProcessed || 0), 0) || 0}</strong></span>
                                <span>Comments: <strong style={{ color: 'white' }}>{analyticsData.automationHistory?.reduce((sum: number, s: any) => sum + (s.commentsGenerated || 0), 0) || 0}</strong></span>
                                <span>Rate: <strong style={{ color: 'white' }}>{analyticsData.automationHistory?.length > 0 ? Math.round((analyticsData.automationHistory.filter((s: any) => s.status === 'success').length / analyticsData.automationHistory.length) * 100) : 0}%</strong></span>
                            </div>
                            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                                    <thead style={{ background: 'linear-gradient(135deg, #693fe9 0%, #7c4dff 100%)', position: 'sticky', top: 0 }}>
                                        <tr>
                                            {['Keywords', 'Author', 'Post Content', 'Generated Comment', 'Actions', 'Status', 'Date'].map(h => (
                                                <th key={h} style={{ padding: '10px', textAlign: 'left', color: 'white', fontWeight: '600' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(!analyticsData.automationHistory || analyticsData.automationHistory.length === 0) ? (
                                            <tr><td colSpan={7} style={{ padding: '30px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>No automation history found. Start Bulk Processing to see post details here.</td></tr>
                                        ) : analyticsData.automationHistory.filter((r: any) => analyticsAutoFilter === 'all' || r.status === analyticsAutoFilter).filter((r: any) => !analyticsAutoSearch || r.keywords?.toLowerCase().includes(analyticsAutoSearch.toLowerCase()) || r.authorName?.toLowerCase().includes(analyticsAutoSearch.toLowerCase())).slice(0, 100).map((record: any, i: number) => (
                                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                                <td style={{ padding: '8px', color: 'rgba(255,255,255,0.7)' }}>{(record.keywords || '-').substring(0, 30)}</td>
                                                <td style={{ padding: '8px', color: 'white', fontWeight: '600' }}>{(record.authorName || '-').substring(0, 20)}</td>
                                                <td style={{ padding: '8px', color: 'rgba(255,255,255,0.6)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={record.postContent}>{(record.postContent || '-').substring(0, 50)}</td>
                                                <td style={{ padding: '8px', color: '#a78bfa', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={record.generatedComment}>{(record.generatedComment || '-').substring(0, 50)}</td>
                                                <td style={{ padding: '8px', textAlign: 'center' }}>{record.actions?.liked && 'L'}{record.actions?.commented && 'C'}{record.postUrl && <a href={record.postUrl} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '4px', background: '#693fe9', color: 'white', padding: '2px 6px', borderRadius: '3px', fontSize: '10px', textDecoration: 'none' }}>View</a>}</td>
                                                <td style={{ padding: '8px', textAlign: 'center' }}>{record.status === 'success' ? 'OK' : record.status === 'failed' ? 'X' : '...'}</td>
                                                <td style={{ padding: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>{record.timestamp ? new Date(record.timestamp).toLocaleString() : '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Networking History */}
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <h3 style={{ color: 'white', fontSize: '14px', fontWeight: '700', margin: 0 }}>Networking History</h3>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <select value={analyticsNetworkFilter} onChange={e => setAnalyticsNetworkFilter(e.target.value)} style={{ padding: '5px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', fontSize: '11px' }}>
                                        <option value="all">All</option>
                                        <option value="completed">Done</option>
                                        <option value="stopped">Stopped</option>
                                        <option value="failed">Failed</option>
                                    </select>
                                    <button onClick={() => loadAnalytics()} style={{ padding: '5px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', cursor: 'pointer', fontSize: '11px' }}>Refresh</button>
                                    <button onClick={() => exportAnalyticsData('networking')} style={{ padding: '5px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', cursor: 'pointer', fontSize: '11px' }}>Export</button>
                                </div>
                            </div>
                            <input type="text" value={analyticsNetworkSearch} onChange={e => setAnalyticsNetworkSearch(e.target.value)} placeholder="Search by query..."
                                style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '13px', marginBottom: '12px' }} />
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                                <span>Sessions: <strong style={{ color: 'white' }}>{analyticsData.networkingHistory?.length || 0}</strong></span>
                                <span>Sent: <strong style={{ color: 'white' }}>{analyticsData.networkingHistory?.reduce((sum: number, s: any) => sum + (s.successful || 0), 0) || 0}</strong></span>
                                <span>Found: <strong style={{ color: 'white' }}>{analyticsData.networkingHistory?.reduce((sum: number, s: any) => sum + (s.processed || 0), 0) || 0}</strong></span>
                                <span>Rate: <strong style={{ color: 'white' }}>{analyticsData.networkingHistory?.length > 0 ? Math.round((analyticsData.networkingHistory.filter((s: any) => s.status === 'completed').length / analyticsData.networkingHistory.length) * 100) : 0}%</strong></span>
                            </div>
                            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                                    <thead style={{ background: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)', position: 'sticky', top: 0 }}>
                                        <tr>
                                            {['Search Query', 'Target', 'Found', 'Sent', 'Success Rate', 'Duration', 'Status', 'Date'].map(h => (
                                                <th key={h} style={{ padding: '10px', textAlign: h === 'Search Query' ? 'left' : 'center', color: 'white', fontWeight: '600' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(!analyticsData.networkingHistory || analyticsData.networkingHistory.length === 0) ? (
                                            <tr><td colSpan={8} style={{ padding: '30px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>No networking history found. Start People Search to see history here.</td></tr>
                                        ) : analyticsData.networkingHistory.filter((s: any) => analyticsNetworkFilter === 'all' || s.status === analyticsNetworkFilter).filter((s: any) => !analyticsNetworkSearch || s.query?.toLowerCase().includes(analyticsNetworkSearch.toLowerCase())).slice(0, 50).map((session: any, i: number) => (
                                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                                <td style={{ padding: '8px', color: 'white' }}>{session.query || session.keywords || '-'}</td>
                                                <td style={{ padding: '8px', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>{session.target || 0}</td>
                                                <td style={{ padding: '8px', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>{session.processed || 0}</td>
                                                <td style={{ padding: '8px', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>{session.successful || 0}</td>
                                                <td style={{ padding: '8px', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>{session.processed > 0 ? Math.round((session.successful / session.processed) * 100) : 0}%</td>
                                                <td style={{ padding: '8px', textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>{session.duration ? (session.duration > 60000 ? `${Math.floor(session.duration / 60000)}m ${Math.floor((session.duration % 60000) / 1000)}s` : `${Math.floor(session.duration / 1000)}s`) : '< 1s'}</td>
                                                <td style={{ padding: '8px', textAlign: 'center' }}>{session.status === 'completed' ? 'OK' : session.status === 'stopped' ? '--' : session.status === 'failed' ? 'X' : '...'} <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>{session.status}</span></td>
                                                <td style={{ padding: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>{session.startTime ? new Date(session.startTime).toLocaleString() : '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                                <div>
                                    <span>Profiles: <strong style={{ color: 'white' }}>{analyticsData.importHistory?.length || 0}</strong></span>
                                    <span>Connects: <strong style={{ color: 'white' }}>{analyticsData.importHistory?.reduce((sum: number, r: any) => sum + (r.connectionsSent || 0), 0) || 0}</strong></span>
                                    <span>Posts: <strong style={{ color: 'white' }}>{analyticsData.importHistory?.reduce((sum: number, r: any) => sum + (r.likes || 0) + (r.comments || 0), 0) || 0}</strong></span>
                                    <span>Comments: <strong style={{ color: 'white' }}>{analyticsData.importHistory?.reduce((sum: number, r: any) => sum + (r.comments || 0), 0) || 0}</strong></span>
                                    <span>Rate: <strong style={{ color: 'white' }}>{analyticsData.importHistory?.length > 0 ? Math.round((analyticsData.importHistory.filter((r: any) => r.status === 'completed' || r.status === 'Success').length / analyticsData.importHistory.length) * 100) : 0}%</strong></span>
                                </div>
                            </div>
                            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                                    <thead style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', position: 'sticky', top: 0 }}>
                                        <tr>
                                            {['Date', 'Profile', 'Link', 'Connect', 'Likes', 'Comments', 'Status'].map(h => (
                                                <th key={h} style={{ padding: '10px', textAlign: h === 'Profile' || h === 'Date' ? 'left' : 'center', color: 'white', fontWeight: '600' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(!analyticsData.importHistory || analyticsData.importHistory.length === 0) ? (
                                            <tr><td colSpan={7} style={{ padding: '30px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>No actions yet. Launch Import to see history here.</td></tr>
                                        ) : analyticsData.importHistory.filter((r: any) => !analyticsImportSearch || r.profileName?.toLowerCase().includes(analyticsImportSearch.toLowerCase())).map((record: any, i: number) => (
                                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                                                <td style={{ padding: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>{record.date || (record.timestamp ? new Date(record.timestamp).toLocaleDateString() : '-')}</td>
                                                <td style={{ padding: '8px', color: 'white', fontWeight: '600' }}>{record.profileName || 'Unknown'}</td>
                                                <td style={{ padding: '8px', textAlign: 'center' }}>{record.profileUrl ? <a href={record.profileUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#0a66c2', textDecoration: 'none' }}>Link</a> : '-'}</td>
                                                <td style={{ padding: '8px', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>{record.connectionsSent || 0}</td>
                                                <td style={{ padding: '8px', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>{record.likes || 0}</td>
                                                <td style={{ padding: '8px', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>{record.comments || 0}</td>
                                                <td style={{ padding: '8px', textAlign: 'center' }}>
                                                    <span style={{ background: record.status === 'completed' || record.status === 'Success' ? '#28a745' : record.status === 'failed' ? '#dc3545' : '#6c757d', color: 'white', padding: '2px 6px', borderRadius: '3px', fontSize: '9px' }}>
                                                        {record.status === 'completed' || record.status === 'Success' ? '✓' : record.status === 'failed' ? '✗' : record.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

    );
}