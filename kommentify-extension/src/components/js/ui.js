import { state, elements } from './state.js';
import { showAuthMessage, showNotification, showToast, checkDatabaseStatus } from './utils.js';
import { generateTopicLines, generatePost, analyzePost, copyPost, saveDraft, loadDrafts, postToLinkedIn, initializeCharacterCounter } from './postWriter.js';
import { initializeImport, checkImportAutomationState, setupImportProgressListener, syncProfileUrlsFromStorage } from './import.js';
import { startAutomationFromPage, startAdvancedAutomation, startBulkProcessing, stopBulkProcessing, checkBulkProcessingState } from './automation.js';
import { generateKeywords, clearKeywords, updateKeywordCountDisplay, onKeywordsChange, loadSavedKeywords } from './keywords.js';
import { startPeopleSearchAutomation, stopPeopleSearchAutomation, addKeywordAlert, loadKeywordAlerts, addCompetitor, loadCompetitors, checkPeopleSearchState } from './networking.js';
import { addBulkSchedule, addPeopleSchedule, loadBulkSchedulerStatus, loadPeopleSchedulerStatus, toggleBulkScheduler, togglePeopleScheduler, checkDailyPostStatus } from './scheduler.js';
import { loadPlans, loadUserPlan, handleLogin, handleLogout, showPlanModal, hidePlanModal, updateAuthenticationUI } from './auth.js';
import { loadDashboard, setupDashboardStopButtons, updateActiveWorkings } from './dashboard.js';
import { loadAnalytics, exportStatistics, clearStatistics, loadAutomationHistory, loadNetworkingHistory, clearAutomationHistory, clearNetworkingHistory, exportAutomationHistory, exportNetworkingHistory } from './analytics.js';
import { loadProgressAnalytics, startProgressMonitoring, stopProgressMonitoring } from './progress.js';
import { loadLeads, filterLeads, exportLeadsToCSV, toggleContactColumns, clearAllLeads } from './leads.js';
import { loadSavedPosts, loadScheduledPosts, schedulePost } from './content.js';
import { saveAllFormValues, saveDelaySettings, saveHumanSimulationSettings, updateBusinessHours, updateBusinessHoursStatus, saveDailyScheduleSettings, testAllSystems, updateSystemStatus, updateSliderDisplays, savePreferences, loadAllFormValues } from './settings.js';
import { loadLimitsSettings, saveLimitsSettings, updateDelayDisplay, updateRandomIntervalDisplay, loadDailyLimits, applyAccountPreset, getDelayWithRandomInterval } from './limits.js';
import { initCommentSettings, loadCommentSettings, saveCommentSettings } from './commentSettings.js';
import { getCachedData, setCachedData } from './cache.js';
import { initializeDashboardProgress } from './dashboardProgress.js';
import { initializeProcessingHistory, recordProcessingSession } from './processingHistory.js';
import { featureChecker } from '/shared/utils/featureChecker.js';
import { initializeWalkthrough, resetWalkthrough } from './walkthrough.js';
import { initializeStatusLogger } from './statusLogger.js';

// --- INITIALIZATION --- //
export function initializeElements() {
    // Get all UI elements
    Object.assign(elements, {
        // Master switch
        masterSwitch: document.getElementById('master-switch'),

        // Tabs
        tabs: document.querySelectorAll('.tab-button'),
        tabContents: document.querySelectorAll('.tab-content'),

        // Dashboard
        todayComments: document.getElementById('today-comments'),
        todayLikes: document.getElementById('today-likes'),
        todayShares: document.getElementById('today-shares'),
        todayFollows: document.getElementById('today-follows'),
        weekTotal: document.getElementById('week-total'),
        responseRate: document.getElementById('response-rate'),

        // Quick actions
        quickPostWriter: document.getElementById('quick-post-writer'),
        quickAutomation: document.getElementById('quick-automation'),
        quickNetworking: document.getElementById('quick-networking'),
        quickContent: document.getElementById('quick-content'),
        quickImport: document.getElementById('quick-import'),

        // Schedulers
        bulkSchedulerEnabled: document.getElementById('bulk-scheduler-enabled'),
        bulkScheduleTimeInput: document.getElementById('bulk-schedule-time-input'),
        addBulkSchedule: document.getElementById('add-bulk-schedule'),
        bulkScheduleList: document.getElementById('bulk-schedule-list'),
        bulkNextExecutionTime: document.getElementById('bulk-next-execution-time'),
        bulkCountdownTimer: document.getElementById('bulk-countdown-timer'),

        peopleSchedulerEnabled: document.getElementById('people-scheduler-enabled'),
        peopleScheduleTimeInput: document.getElementById('people-schedule-time-input'),
        addPeopleSchedule: document.getElementById('add-people-schedule'),
        peopleScheduleList: document.getElementById('people-schedule-list'),
        peopleNextExecutionTime: document.getElementById('people-next-execution-time'),
        peopleCountdownTimer: document.getElementById('people-countdown-timer'),

        // Post Writer
        postTopic: document.getElementById('post-topic'),
        generateTopicLines: document.getElementById('generate-topic-lines'),
        topicLinesContainer: document.getElementById('topic-lines-container'),
        topicLinesList: document.getElementById('topic-lines-list'),
        postTemplate: document.getElementById('post-template'),
        postTone: document.getElementById('post-tone'),
        postLength: document.getElementById('post-length'),
        postIncludeHashtags: document.getElementById('post-include-hashtags'),
        postIncludeEmojis: document.getElementById('post-include-emojis'),
        targetAudience: document.getElementById('target-audience'),
        keyMessage: document.getElementById('key-message'),
        userBackground: document.getElementById('user-background'),
        postContent: document.getElementById('post-content'),
        scheduleDate: document.getElementById('schedule-date'),
        scheduleTime: document.getElementById('schedule-time'),
        scheduleStatus: document.getElementById('schedule-status'),
        generatePost: document.getElementById('generate-post'),
        analyzePost: document.getElementById('analyze-post'),
        copyPost: document.getElementById('copy-post'),
        saveDraft: document.getElementById('save-draft'),
        postToLinkedIn: document.getElementById('post-to-linkedin'),
        schedulePostBtn: document.getElementById('schedule-post-btn'),
        upcomingPosts: document.getElementById('upcoming-posts'),
        postAnalysis: document.getElementById('post-analysis'),
        engagementScore: document.getElementById('engagement-score'),
        postRecommendations: document.getElementById('post-recommendations'),
        draftCount: document.getElementById('draft-count'),
        draftsList: document.getElementById('drafts-list'),

        // Automation
        autoQuota: document.getElementById('auto-quota'),
        autoPostAge: document.getElementById('auto-post-age'),
        startPageAutopilot: document.getElementById('start-page-autopilot'),
        automationError: document.getElementById('automation-error'),
        autoLikeQuota: document.getElementById('auto-like-quota'),
        startAutoLike: document.getElementById('start-auto-like'),
        autoShareQuota: document.getElementById('auto-share-quota'),
        startAutoShare: document.getElementById('start-auto-share'),
        autoFollowQuota: document.getElementById('auto-follow-quota'),
        startAutoFollow: document.getElementById('start-auto-follow'),
        // AI Keyword Generation
        keywordIntent: document.getElementById('keyword-intent'),
        keywordCountSlider: document.getElementById('keyword-count-slider'),
        keywordCountDisplay: document.getElementById('keyword-count-display'),
        generateKeywords: document.getElementById('generate-keywords'),
        clearKeywords: document.getElementById('clear-keywords'),

        // Bulk Processing
        bulkUrls: document.getElementById('bulk-urls'),
        stopBulkProcessing: document.getElementById('stop-bulk-processing'),
        bulkQuota: document.getElementById('bulk-quota'),
        bulkQuotaDisplay: document.getElementById('bulk-quota-display'),
        bulkMinLikes: document.getElementById('bulk-min-likes'),
        bulkMinLikesDisplay: document.getElementById('bulk-min-likes-display'),
        bulkMinComments: document.getElementById('bulk-min-comments'),
        bulkMinCommentsDisplay: document.getElementById('bulk-min-comments-display'),
        bulkLike: document.getElementById('bulk-like'),
        bulkComment: document.getElementById('bulk-comment'),
        bulkLikeOrComment: document.getElementById('bulk-like-or-comment'),
        bulkShare: document.getElementById('bulk-share'),
        bulkFollow: document.getElementById('bulk-follow'),
        ignoreKeywords: document.getElementById('ignore-keywords'),
        startBulkProcessing: document.getElementById('start-bulk-processing'),
        startBulkProcessingBottom: document.getElementById('start-bulk-processing-bottom'),
        stopBulkProcessingBottom: document.getElementById('stop-bulk-processing-bottom'),

        // Business Hours & Daily Schedule
        businessHoursEnabled: document.getElementById('business-hours-enabled'),
        businessStartHour: document.getElementById('business-start-hour'),
        businessEndHour: document.getElementById('business-end-hour'),
        allowWeekends: document.getElementById('allow-weekends'),
        businessHoursStatus: document.getElementById('business-hours-status'),
        dailyScheduleEnabled: document.getElementById('daily-schedule-enabled'),
        dailyScheduleInfo: document.getElementById('daily-schedule-info'),

        // People Search
        searchKeyword: document.getElementById('search-keyword'),
        connectQuota: document.getElementById('connect-quota'),
        connectQuotaDisplay: document.getElementById('connect-quota-display'),

        // System Status
        serviceWorkerStatus: document.getElementById('service-worker-status'),
        businessHoursIndicator: document.getElementById('business-hours-indicator'),
        openaiStatus: document.getElementById('openai-status'),
        statusTimestamp: document.getElementById('status-timestamp'),
        testSystems: document.getElementById('test-systems'),
        useBooleanSearch: document.getElementById('use-boolean-search'),
        filterNetwork: document.getElementById('filter-network'),
        sendWithNote: document.getElementById('send-with-note'),
        sendConnectionRequest: document.getElementById('send-connection-request'),
        extractContactInfo: document.getElementById('extract-contact-info'),
        excludeHeadlineTerms: document.getElementById('exclude-headline-terms'),
        connectionMessage: document.getElementById('connection-message'),
        startPeopleSearch: document.getElementById('start-people-search'),
        stopPeopleSearch: document.getElementById('stop-people-search'),
        startPeopleSearchBottom: document.getElementById('start-people-search-bottom'),
        stopPeopleSearchBottom: document.getElementById('stop-people-search-bottom'),
        peopleSearchStatus: document.getElementById('people-search-status'),

        // Trending Post
        dailyPostTime: document.getElementById('daily-post-time'),
        trendingTemplate: document.getElementById('trending-template'),
        trendingTone: document.getElementById('trending-tone'),
        includeHashtags: document.getElementById('include-hashtags'),
        testTrendingPost: document.getElementById('test-trending-post'),
        enableDailyPost: document.getElementById('enable-daily-post'),
        disableDailyPost: document.getElementById('disable-daily-post'),
        dailyPostStatus: document.getElementById('daily-post-status'),
        dailyPostEnabled: document.getElementById('daily-post-enabled'),

        // Account type and delay settings
        accountType: document.getElementById('account-type'),
        commentDelay: document.getElementById('comment-delay'),

        // New delay controls
        searchDelayMin: document.getElementById('search-delay-min'),
        searchDelayMax: document.getElementById('search-delay-max'),
        searchDelayMinDisplay: document.getElementById('search-delay-min-display'),
        searchDelayMaxDisplay: document.getElementById('search-delay-max-display'),
        commentDelayMin: document.getElementById('comment-delay-min'),
        commentDelayMax: document.getElementById('comment-delay-max'),
        commentDelayMinDisplay: document.getElementById('comment-delay-min-display'),
        commentDelayMaxDisplay: document.getElementById('comment-delay-max-display'),

        // Human simulation features
        humanMouseMovement: document.getElementById('human-mouse-movement'),
        humanScrolling: document.getElementById('human-scrolling'),
        humanReadingPause: document.getElementById('human-reading-pause'),

        // Daily limits display and inputs
        limitComments: document.getElementById('limit-comments'),
        limitLikes: document.getElementById('limit-likes'),
        limitShares: document.getElementById('limit-shares'),
        limitFollows: document.getElementById('limit-follows'),
        dailyCommentLimitInput: document.getElementById('daily-comment-limit-input'),
        dailyLikeLimitInput: document.getElementById('daily-like-limit-input'),
        dailyShareLimitInput: document.getElementById('daily-share-limit-input'),
        dailyFollowLimitInput: document.getElementById('daily-follow-limit-input'),

        // Analytics
        analyticsPeriod: document.getElementById('analytics-period'),
        refreshAnalytics: document.getElementById('refresh-analytics'),
        totalComments: document.getElementById('total-comments'),
        totalLikes: document.getElementById('total-likes'),
        totalShares: document.getElementById('total-shares'),
        totalPosts: document.getElementById('total-posts'),
        topHashtags: document.getElementById('top-hashtags'),
        topUsers: document.getElementById('top-users'),
        exportStats: document.getElementById('export-stats'),
        clearStats: document.getElementById('clear-stats'),

        // Content
        savedCount: document.getElementById('saved-count'),
        savedPostsList: document.getElementById('saved-posts-list'),
        newKeyword: document.getElementById('new-keyword'),
        addKeyword: document.getElementById('add-keyword'),
        keywordList: document.getElementById('keyword-list'),
        competitorUrl: document.getElementById('competitor-url'),
        addCompetitor: document.getElementById('add-competitor'),
        competitorList: document.getElementById('competitor-list'),

        // Settings
        commentGoal: document.getElementById('comment-goal'),
        commentTone: document.getElementById('comment-tone'),
        userExpertise: document.getElementById('user-expertise'),
        userBackground: document.getElementById('user-background'),
        useCheapModel: document.getElementById('use-cheap-model'),
        dailyCommentLimit: document.getElementById('daily-comment-limit'),
        dailyLikeLimit: document.getElementById('daily-like-limit'),
        respectBlacklist: document.getElementById('respect-blacklist'),
        prioritizeWhitelist: document.getElementById('prioritize-whitelist'),
        accountStatus: document.getElementById('account-status'),
        accountPlan: document.getElementById('account-plan'),
        accountEmail: document.getElementById('account-email'),
        headerPlanName: document.getElementById('header-plan-name'),

        // Authentication elements
        loginBtn: document.getElementById('login-btn'),
        logoutBtn: document.getElementById('logout-btn'),
        loginSection: document.getElementById('login-section'),
        logoutSection: document.getElementById('logout-section'),
        upgradePlanBtn: document.getElementById('upgrade-plan-btn'),

        // Plan limit elements
        planLimitComments: document.getElementById('plan-limit-comments'),
        planLimitLikes: document.getElementById('plan-limit-likes'),
        planLimitShares: document.getElementById('plan-limit-shares'),
        planLimitFollows: document.getElementById('plan-limit-follows'),
        planLimitConnections: document.getElementById('plan-limit-connections'),
        planLimitAiPosts: document.getElementById('plan-limit-ai-posts'),
        planLimitAiComments: document.getElementById('plan-limit-ai-comments'),
        planLimitAiTopics: document.getElementById('plan-limit-ai-topics'),

        // Plan modal elements
        planModal: document.getElementById('plan-modal'),
        closePlanModal: document.getElementById('close-plan-modal'),
        plansLoading: document.getElementById('plans-loading'),
        plansError: document.getElementById('plans-error'),
        plansContainer: document.getElementById('plans-container'),
        retryPlans: document.getElementById('retry-plans'),

        exportData: document.getElementById('export-data'),
        importData: document.getElementById('import-data'),
        importFile: document.getElementById('import-file'),

        // Import Tab Elements
        profileUrlsInput: document.getElementById('profile-urls-input'),
        importExtractContactInfo: document.getElementById('extract-contact-info'),
        enableLikes: document.getElementById('enable-likes'),
        enableComments: document.getElementById('enable-comments'),
        enableShares: document.getElementById('enable-shares'),
        enableFollows: document.getElementById('enable-follows'),
        enableRandomMode: document.getElementById('enable-random-mode'),
        postsPerProfile: document.getElementById('posts-per-profile'),
        combinedSendConnections: document.getElementById('combined-send-connections'),
        combinedExtractContactInfo: document.getElementById('combined-extract-contact-info'),
        combinedEnableLikes: document.getElementById('combined-enable-likes'),
        combinedEnableComments: document.getElementById('combined-enable-comments'),
        combinedEnableShares: document.getElementById('combined-enable-shares'),
        combinedEnableFollows: document.getElementById('combined-enable-follows'),
        combinedEnableRandomMode: document.getElementById('combined-enable-random-mode'),
        combinedPostsPerProfile: document.getElementById('combined-posts-per-profile'),

        // Automation Tab - Comment Settings
        commentLength: document.getElementById('comment-length'),
        aiAutoPost: document.getElementById('ai-auto-post'),
        openInWindow: document.getElementById('open-in-window'),
        bulkLikeOrComment: document.getElementById('bulk-like-or-comment'),

        // Limits Tab - Starting Delays
        automationStartDelay: document.getElementById('automation-start-delay'),
        networkingStartDelay: document.getElementById('networking-start-delay'),
        importStartDelay: document.getElementById('import-profiles-delay'),
        postWriterPageLoadDelay: document.getElementById('post-writer-page-load-delay'),
        postWriterClickDelay: document.getElementById('post-writer-click-delay'),
        postWriterTypingDelay: document.getElementById('post-writer-typing-delay'),
        postWriterSubmitDelay: document.getElementById('post-writer-submit-delay'),

        // Limits Tab - Post Action Delays
        beforeOpeningPostsDelay: document.getElementById('before-opening-posts-delay'),
        postPageLoadDelay: document.getElementById('post-page-load-delay'),
        beforeLikeDelay: document.getElementById('before-like-delay'),
        beforeCommentDelay: document.getElementById('before-comment-delay'),
        beforeShareDelay: document.getElementById('before-share-delay'),
        beforeFollowDelay: document.getElementById('before-follow-delay'),

        // Limits Tab - Networking Delays
        networkingDelayMin: document.getElementById('networking-delay-min'),
        networkingDelayMax: document.getElementById('networking-delay-max'),

        accordions: document.querySelectorAll('.accordion-header')
    });
}

export async function initializeUI() {
    try {
        initializeElements();
        
        // CRITICAL: Always set up control buttons (Start/Stop) first
        setupCriticalControlListeners();
        
        // Set up dashboard stop buttons
        setupDashboardStopButtons();
        
        // Check if automation is running BEFORE setting up other event listeners
        const automationState = await chrome.storage.local.get(['bulkProcessingActive', 'peopleSearchActive']);
        const isAutomationRunning = automationState.bulkProcessingActive || automationState.peopleSearchActive;
        
        if (!isAutomationRunning) {
            setupEventListeners();
            console.log('🔧 All event listeners set up (normal mode)');
        } else {
            console.log('⏭️ SKIPPED: Non-critical event listeners (automation is running - lightweight mode)');
            console.log('✅ Control buttons (Start/Stop) remain active');
        }

        const [uiData, prefsData, accountData, statsData, limitsData] = await Promise.all([
            chrome.storage.local.get('ui'),
            chrome.storage.local.get('preferences'),
            chrome.storage.local.get('account'),
            chrome.storage.local.get('engagementStatistics'),
            chrome.storage.local.get('dailyCounts')
        ]);

        state.ui = uiData.ui || { activeTab: 'dashboard' };
        state.preferences = prefsData.preferences || {};
        state.account = accountData.account || {};
        state.statistics = statsData.engagementStatistics || {};
        state.dailyLimits = limitsData.dailyCounts || { likes: 0, comments: 0, shares: 0, follows: 0 };

        await renderUI();
        
        // Set up import progress listener EARLY so we can receive messages even when on other tabs
        setupImportProgressListener();
        
        console.log('🚀 Loading with intelligent caching...');
        
        // Try to load from cache first (INSTANT)
        const cachedDashboard = await getCachedData('dashboard');
        const cachedLimits = await getCachedData('limits');
        const cachedKeywords = await getCachedData('keywords');
        
        if (cachedDashboard) {
            // Use cached data immediately
            console.log('\u26a1 Using cached dashboard data');
            // Populate dashboard with cached data
            state.statistics = cachedDashboard.statistics || {};
            state.dailyLimits = cachedDashboard.dailyLimits || {};
        }
        
        // Critical: Load essential data (from cache or fresh)
        loadDashboard().then(data => {
            // Cache fresh data for next time
            setCachedData('dashboard', {
                statistics: state.statistics,
                dailyLimits: state.dailyLimits,
                timestamp: Date.now()
            });
        });
        
        loadDailyLimits();
        loadSavedKeywords();
        await loadAllFormValues();
        
        // Initialize comment settings (load saved values and set up auto-save listeners)
        initCommentSettings();
        updateSliderDisplays();
        
        // Defer non-critical operations
        setTimeout(async () => {
            checkDailyPostStatus();
            
            // Skip business hours update if automation is running
            const automationState = await chrome.storage.local.get(['bulkProcessingActive', 'peopleSearchActive']);
            if (!automationState.bulkProcessingActive && !automationState.peopleSearchActive) {
                updateBusinessHoursStatus();
            } else {
                console.log('⏭️ SKIPPED: Business hours status (automation is running)');
            }
            
            // Load analytics with cache
            const cachedAnalytics = await getCachedData('analytics');
            if (cachedAnalytics) {
                console.log('\u26a1 Using cached analytics');
                // Use cached analytics if available
            }
            loadAnalytics().then(() => {
                setCachedData('analytics', { timestamp: Date.now() });
            });
            
            loadProgressAnalytics();
            updateSystemStatus();
            checkBulkProcessingState();
            checkPeopleSearchState();
            checkImportAutomationState();
        }, 100);
        
        // Defer heavy operations even more
        setTimeout(async () => {
            // Check automation state before loading leads
            const automationCheck = await chrome.storage.local.get(['bulkProcessingActive', 'peopleSearchActive']);
            const isAutomating = automationCheck.bulkProcessingActive || automationCheck.peopleSearchActive;
            
            if (!isAutomating) {
                // Load leads with cache
                const cachedLeads = await getCachedData('leads');
                if (!cachedLeads) {
                    loadLeads().then(() => {
                        setCachedData('leads', { timestamp: Date.now() });
                    });
                } else {
                    console.log('⚡ Skipping leads load (cached)');
                }
            } else {
                console.log('⏭️ SKIPPED: loadLeads (automation is running)');
            }
            
            // Only load scheduler status if automation is not running
            chrome.storage.local.get(['bulkProcessingActive', 'peopleSearchActive'], (state) => {
                const isAutomating = state.bulkProcessingActive || state.peopleSearchActive;
                if (!isAutomating) {
                    loadBulkSchedulerStatus();
                    loadPeopleSchedulerStatus();
                } else {
                    console.log('⏭️ SKIPPED: Scheduler status loads (automation is running)');
                }
            });
            
            loadDrafts();
        }, 500);
        
        // Load scheduled posts IMMEDIATELY (no delay) for instant display
        loadScheduledPosts();

        // Start live progress monitoring
        startProgressMonitoring();

        // Note: Progress tab initializes lazily when first clicked

        // Update system status every 2 minutes (reduced for performance)
        setInterval(() => {
            updateSystemStatus();
        }, 120000);

        // Check database status
        checkDatabaseStatus();
        
        // Initialize enhanced dashboard progress monitoring
        initializeDashboardProgress();
        
        // Initialize processing history tracking
        initializeProcessingHistory();
        
        // Initialize character counter for post writer
        initializeCharacterCounter();
        
        // Initialize tab switching (import will be initialized when tab is clicked)
        initializeTabSwitching();
        
        // Initialize walkthrough for new users
        initializeWalkthrough();
        
        // Initialize status logger for tab status updates
        initializeStatusLogger();
        
        // Initialize version checker UI and check for updates
        initializeVersionChecker();

    } catch (e) {
        console.error("Error loading state:", e);
    }
}

// --- VERSION CHECKER UI --- //
async function initializeVersionChecker() {
    try {
        // Get current version from manifest and display in header
        const manifest = chrome.runtime.getManifest();
        const currentVersion = manifest.version;
        
        const headerVersion = document.getElementById('header-version');
        if (headerVersion) {
            headerVersion.textContent = `v${currentVersion}`;
        }
        
        const currentVersionDisplay = document.getElementById('current-version-display');
        if (currentVersionDisplay) {
            currentVersionDisplay.textContent = `v${currentVersion}`;
        }
        
        // Check for stored update info
        const response = await chrome.runtime.sendMessage({ action: 'getStoredUpdateInfo' });
        if (response && response.success) {
            updateVersionUI(response.updateInfo, response.lastCheck, response.currentVersion);
        }
        
        // Set up check updates button
        const checkUpdatesBtn = document.getElementById('check-updates-btn');
        if (checkUpdatesBtn) {
            checkUpdatesBtn.addEventListener('click', async () => {
                checkUpdatesBtn.disabled = true;
                checkUpdatesBtn.innerHTML = '<span class="icon icon-refresh" style="animation: spin 1s linear infinite;"></span> Checking...';
                
                try {
                    const result = await chrome.runtime.sendMessage({ action: 'checkForUpdates' });
                    if (result && result.success) {
                        updateVersionUI(result.hasUpdate ? {
                            hasUpdate: true,
                            latestVersion: result.latestVersion,
                            downloadUrl: result.downloadUrl,
                            features: result.features,
                            bugFixes: result.bugFixes
                        } : null, Date.now(), result.currentVersion);
                        
                        if (!result.hasUpdate) {
                            showToast('✅ You have the latest version!', 'success');
                        }
                    }
                } catch (error) {
                    console.error('Error checking for updates:', error);
                    showToast('❌ Failed to check for updates', 'error');
                } finally {
                    checkUpdatesBtn.disabled = false;
                    checkUpdatesBtn.innerHTML = '<span class="icon icon-refresh"></span> Check for Updates';
                }
            });
        }
        
        // Set up download update button
        const downloadUpdateBtn = document.getElementById('download-update-btn');
        if (downloadUpdateBtn) {
            downloadUpdateBtn.addEventListener('click', async () => {
                const response = await chrome.runtime.sendMessage({ action: 'getStoredUpdateInfo' });
                if (response && response.updateInfo && response.updateInfo.downloadUrl) {
                    chrome.runtime.sendMessage({ action: 'openDownloadPage', downloadUrl: response.updateInfo.downloadUrl });
                } else {
                    chrome.runtime.sendMessage({ action: 'openDownloadPage' });
                }
            });
        }
        
        // Set up header update badge click
        const headerUpdateBadge = document.getElementById('header-update-badge');
        if (headerUpdateBadge) {
            headerUpdateBadge.addEventListener('click', async () => {
                const response = await chrome.runtime.sendMessage({ action: 'getStoredUpdateInfo' });
                if (response && response.updateInfo && response.updateInfo.downloadUrl) {
                    chrome.runtime.sendMessage({ action: 'openDownloadPage', downloadUrl: response.updateInfo.downloadUrl });
                } else {
                    chrome.runtime.sendMessage({ action: 'openDownloadPage' });
                }
            });
        }
        
        console.log('VERSION CHECKER UI: Initialized');
    } catch (error) {
        console.error('VERSION CHECKER UI: Error initializing:', error);
    }
}

function updateVersionUI(updateInfo, lastCheck, currentVersion) {
    const headerUpdateBadge = document.getElementById('header-update-badge');
    const versionStatusBadge = document.getElementById('version-status-badge');
    const lastCheckTime = document.getElementById('last-check-time');
    const updateAvailableSection = document.getElementById('update-available-section');
    const newVersionNumber = document.getElementById('new-version-number');
    const newFeaturesUl = document.getElementById('new-features-ul');
    
    // Update last check time
    if (lastCheckTime && lastCheck) {
        const checkDate = new Date(lastCheck);
        lastCheckTime.textContent = `Last checked: ${checkDate.toLocaleString()}`;
    }
    
    if (updateInfo && updateInfo.hasUpdate) {
        // Show update available UI
        if (headerUpdateBadge) {
            headerUpdateBadge.style.display = 'block';
        }
        
        if (versionStatusBadge) {
            versionStatusBadge.textContent = '🚀 Update Available';
            versionStatusBadge.style.background = 'rgba(245, 158, 11, 0.3)';
        }
        
        if (updateAvailableSection) {
            updateAvailableSection.style.display = 'block';
        }
        
        if (newVersionNumber) {
            newVersionNumber.textContent = `v${updateInfo.latestVersion}`;
        }
        
        // Populate features list
        if (newFeaturesUl) {
            newFeaturesUl.innerHTML = '';
            const allItems = [...(updateInfo.features || []), ...(updateInfo.bugFixes || [])];
            if (allItems.length > 0) {
                allItems.slice(0, 5).forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = item;
                    newFeaturesUl.appendChild(li);
                });
                if (allItems.length > 5) {
                    const li = document.createElement('li');
                    li.textContent = `...and ${allItems.length - 5} more improvements`;
                    li.style.fontStyle = 'italic';
                    newFeaturesUl.appendChild(li);
                }
            } else {
                const li = document.createElement('li');
                li.textContent = 'Various improvements and bug fixes';
                newFeaturesUl.appendChild(li);
            }
        }
    } else {
        // No update available - show up to date UI
        if (headerUpdateBadge) {
            headerUpdateBadge.style.display = 'none';
        }
        
        if (versionStatusBadge) {
            versionStatusBadge.textContent = '✓ Up to date';
            versionStatusBadge.style.background = 'rgba(255,255,255,0.2)';
        }
        
        if (updateAvailableSection) {
            updateAvailableSection.style.display = 'none';
        }
    }
}

// --- UI RENDER FUNCTIONS --- //
export async function renderUI() {
    // Master Switch
    if (elements.masterSwitch) {
        elements.masterSwitch.checked = state.ui.enabled !== false;
    }

    // Tabs
    const activeTab = state.ui.activeTab || 'dashboard';
    elements.tabs?.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === activeTab);
    });
    elements.tabContents?.forEach(content => {
        content.classList.toggle('active', content.id === `${activeTab}-content`);
    });

    // Preferences
    if (elements.commentTone) elements.commentTone.value = state.preferences.commentTone || 'Polite';
    if (elements.commentLength) elements.commentLength.value = state.preferences.commentLength || 'Brief';
    if (elements.useCheapModel) elements.useCheapModel.checked = state.preferences.useCheapModel || false;

    // Automation
    if (elements.autoQuota) elements.autoQuota.value = state.preferences.automationQuota || 25;
    if (elements.autoPostAge) elements.autoPostAge.value = state.preferences.automationPostAge || 'OneWeek';

    // Account Info & Authentication
    console.log('=== CALLING UPDATE AUTHENTICATION UI ===');
    await updateAuthenticationUI();
}

// Switch tab function
export async function switchTab(tabId) {
    const newActiveTab = tabId;

    // Check feature permission for Import tab
    if (newActiveTab === 'import') {
        const canUseImport = await featureChecker.checkFeature('importProfiles');
        if (!canUseImport) {
            console.warn('🚫 Import tab access denied - feature not available in current plan');
            showNotification('⬆️ Import Profiles Auto Engagement requires a paid plan. Please upgrade!', 'warning');
            
            // Show plan modal for upgrade
            const planModal = document.getElementById('plan-modal');
            if (planModal) {
                planModal.style.display = 'flex';
                loadPlans();
            }
            
            // Don't switch to Import tab - stay on current tab
            return;
        }
    }
    
    // Check feature permission for Automation tab
    if (newActiveTab === 'automation') {
        const canUseAutomation = await featureChecker.checkFeature('autoLike');
        if (!canUseAutomation) {
            console.warn('🚫 Automation tab access denied - General Automation feature not available in current plan');
            showNotification('⬆️ General Automation requires a paid plan. Please upgrade to use bulk processing!', 'warning');
            
            // Show plan modal for upgrade
            const planModal = document.getElementById('plan-modal');
            if (planModal) {
                planModal.style.display = 'flex';
                loadPlans();
            }
            
            // Don't switch to Automation tab - stay on current tab
            return;
        }
    }

    // Update tab buttons - query DOM directly to ensure all tabs are found
    const allTabButtons = document.querySelectorAll('.tab-button');
    console.log(`🔍 Found ${allTabButtons.length} tab buttons`);
    allTabButtons.forEach(t => {
        t.classList.remove('active');
        if (t.getAttribute('data-tab') === newActiveTab) {
            t.classList.add('active');
            console.log(`✅ Activated tab button: ${newActiveTab}`);
        }
    });

    // Update tab contents - use direct style manipulation for reliability
    const allTabContents = document.querySelectorAll('.tab-content');
    console.log(`🔍 Found ${allTabContents.length} tab contents`);
    let foundContent = false;
    allTabContents.forEach(content => {
        const contentTabId = content.id.replace('-content', '');
        if (contentTabId === newActiveTab) {
            content.classList.add('active');
            content.style.display = 'block';
            foundContent = true;
            console.log(`👁️ SHOWING content: ${content.id}`);
        } else {
            content.classList.remove('active');
            content.style.display = 'none';
        }
    });
    
    if (!foundContent) {
        console.error(`❌ Could not find tab content for: ${newActiveTab}-content`);
    }
    
    console.log(`📑 Switched to tab: ${newActiveTab}`);

    state.ui.activeTab = newActiveTab;
    chrome.storage.local.set({ ui: state.ui });

    // Load data for specific tabs
    if (newActiveTab === 'dashboard') {
        loadDashboard();
        loadAnalytics();
        loadProgressAnalytics();
    }
    if (newActiveTab === 'analytics') {
        loadAnalytics();
        loadProgressAnalytics();
        loadLeads();
        loadAutomationHistory();
        loadNetworkingHistory();
    }
    if (newActiveTab === 'post-writer') loadDrafts();
    if (newActiveTab === 'limits') {
        loadLimitsSettings();
        // Plan validation disabled - users manage limits directly in Limits tab
        // setTimeout(() => {
        //     setupPlanLimitValidation();
        // }, 100);
    }
    if (newActiveTab === 'content') {
        loadSavedPosts();
        loadScheduledPosts();
        loadKeywordAlerts();
        loadCompetitors();
    }
    if (newActiveTab === 'import') {
        console.log('📥 TAB SWITCH: Initializing Import tab...');
        initializeImport();
    }
}

/**
 * CRITICAL: Setup control buttons that must ALWAYS work (Start/Stop)
 * These are set up regardless of automation state
 */
export function setupCriticalControlListeners() {
    console.log('🎮 Setting up critical control listeners (Start/Stop buttons, tabs, accordions)...');
    
    // Tabs - MUST work during automation
    elements.tabs?.forEach(tab => {
        tab.addEventListener('click', (event) => {
            switchTab(event.currentTarget.dataset.tab);
        });
    });
    
    // Accordions - MUST work during automation
    elements.accordions?.forEach(header => {
        header.addEventListener('click', () => {
            const contentId = `${header.dataset.accordion}-content`;
            const content = document.getElementById(contentId);

            if (content) {
                content.style.display = ''; // Clear inline display style
                content.classList.toggle('open');
                header.querySelector('.arrow')?.classList.toggle('up');
            }
        });
    });
    
    // Automation Start/Stop
    elements.startBulkProcessing?.addEventListener('click', startBulkProcessing);
    elements.stopBulkProcessing?.addEventListener('click', stopBulkProcessing);
    // Bottom buttons for Automation (duplicate buttons at bottom of page)
    elements.startBulkProcessingBottom?.addEventListener('click', startBulkProcessing);
    elements.stopBulkProcessingBottom?.addEventListener('click', stopBulkProcessing);
    
    // Networking Start/Stop
    elements.startPeopleSearch?.addEventListener('click', startPeopleSearchAutomation);
    elements.stopPeopleSearch?.addEventListener('click', stopPeopleSearchAutomation);
    // Bottom buttons for Networking (duplicate buttons at bottom of page)
    elements.startPeopleSearchBottom?.addEventListener('click', startPeopleSearchAutomation);
    elements.stopPeopleSearchBottom?.addEventListener('click', stopPeopleSearchAutomation);
    
    console.log('✅ Critical control listeners ready (tabs, accordions, Start/Stop)');
}

export function setupEventListeners() {
    console.log('🔧 Setting up event listeners...');

    // Tabs and Accordions are now in setupCriticalControlListeners
    
    // Dashboard quick actions - use direct DOM manipulation for reliability
    elements.quickPostWriter?.addEventListener('click', () => {
        console.log('🚀 Quick Action: AI Writer');
        switchTab('post-writer');
    });
    elements.quickAutomation?.addEventListener('click', () => {
        console.log('🚀 Quick Action: Automation');
        switchTab('automation');
    });
    elements.quickNetworking?.addEventListener('click', () => {
        console.log('🚀 Quick Action: Networking');
        switchTab('networking');
    });
    elements.quickContent?.addEventListener('click', () => {
        console.log('🚀 Quick Action: Content');
        switchTab('content');
    });
    elements.quickImport?.addEventListener('click', () => {
        console.log('🚀 Quick Action: Import');
        switchTab('import');
    });

    // Post Writer
    elements.generateTopicLines?.addEventListener('click', generateTopicLines);
    elements.generatePost?.addEventListener('click', generatePost);
    elements.analyzePost?.addEventListener('click', analyzePost);
    elements.copyPost?.addEventListener('click', copyPost);
    elements.saveDraft?.addEventListener('click', saveDraft);
    elements.schedulePost?.addEventListener('click', schedulePost);
    elements.postToLinkedIn?.addEventListener('click', postToLinkedIn);

    // Post Writer inputs with auto-save
    elements.postTemplate?.addEventListener('change', saveAllFormValues);
    elements.postTone?.addEventListener('change', saveAllFormValues);
    elements.postLength?.addEventListener('change', saveAllFormValues);
    elements.postIncludeHashtags?.addEventListener('change', saveAllFormValues);
    elements.postIncludeEmojis?.addEventListener('change', saveAllFormValues);

    // Post Writer tab switching (Drafts/Calendar)
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Update active state
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Show/hide content
            if (targetTab === 'drafts') {
                document.getElementById('drafts-tab-content').style.display = 'block';
                document.getElementById('calendar-tab-content').style.display = 'none';
            } else if (targetTab === 'calendar') {
                document.getElementById('drafts-tab-content').style.display = 'none';
                document.getElementById('calendar-tab-content').style.display = 'block';
            }
        });
    });

    // Character counter for post content
    const postContentTextarea = document.getElementById('post-content');
    const charCountDisplay = document.getElementById('char-count');
    if (postContentTextarea && charCountDisplay) {
        postContentTextarea.addEventListener('input', function() {
            const length = this.value.length;
            const maxLength = 3000;
            charCountDisplay.textContent = `${length.toLocaleString()} / ${maxLength.toLocaleString()} characters`;
            
            // Change color if approaching limit
            if (length > maxLength * 0.9) {
                charCountDisplay.style.color = '#dc3545';
                charCountDisplay.style.fontWeight = '600';
            } else if (length > maxLength * 0.75) {
                charCountDisplay.style.color = '#ff9800';
                charCountDisplay.style.fontWeight = '600';
            } else {
                charCountDisplay.style.color = '#999';
                charCountDisplay.style.fontWeight = 'normal';
            }
        });
    }

    // Automation (Start/Stop already set up in setupCriticalControlListeners)
    elements.startPageAutopilot?.addEventListener('click', startAutomationFromPage);
    elements.startAutoLike?.addEventListener('click', () => startAdvancedAutomation('like'));
    elements.startAutoShare?.addEventListener('click', () => startAdvancedAutomation('share'));
    elements.startAutoFollow?.addEventListener('click', () => startAdvancedAutomation('follow'));

    // AI Keyword Generation
    elements.generateKeywords?.addEventListener('click', generateKeywords);
    elements.clearKeywords?.addEventListener('click', clearKeywords);
    elements.keywordCountSlider?.addEventListener('input', () => {
        updateKeywordCountDisplay();
        saveAllFormValues();
    });
    elements.bulkUrls?.addEventListener('input', () => {
        onKeywordsChange();
        saveAllFormValues();
    });

    // Action checkboxes with auto-save
    elements.bulkLike?.addEventListener('change', saveAllFormValues);
    elements.bulkComment?.addEventListener('change', saveAllFormValues);
    elements.bulkShare?.addEventListener('change', saveAllFormValues);
    elements.bulkFollow?.addEventListener('change', saveAllFormValues);
    elements.bulkQuota?.addEventListener('change', saveAllFormValues);
    elements.bulkMinLikes?.addEventListener('change', saveAllFormValues);
    elements.bulkMinComments?.addEventListener('change', saveAllFormValues);
    elements.accountType?.addEventListener('change', saveAllFormValues);
    elements.commentDelay?.addEventListener('change', saveAllFormValues);

    // Slider input events for real-time display updates
    elements.bulkQuota?.addEventListener('input', updateSliderDisplays);
    elements.bulkMinLikes?.addEventListener('input', updateSliderDisplays);
    elements.bulkMinComments?.addEventListener('input', updateSliderDisplays);

    // Networking (Start/Stop already set up in setupCriticalControlListeners)
    // Networking inputs with auto-save
    elements.searchKeyword?.addEventListener('change', saveAllFormValues);
    elements.connectQuota?.addEventListener('change', saveAllFormValues);
    elements.useBooleanSearch?.addEventListener('change', saveAllFormValues);
    elements.filterNetwork?.addEventListener('change', saveAllFormValues);
    elements.sendWithNote?.addEventListener('change', saveAllFormValues);
    elements.sendConnectionRequest?.addEventListener('change', saveAllFormValues);
    elements.extractContactInfo?.addEventListener('change', saveAllFormValues);
    elements.excludeHeadlineTerms?.addEventListener('change', saveAllFormValues);
    elements.connectionMessage?.addEventListener('change', saveAllFormValues);

    // All slider input events for real-time display updates
    elements.connectQuota?.addEventListener('input', updateSliderDisplays);
    
    // Daily limits sliders
    elements.dailyCommentLimitInput?.addEventListener('input', updateSliderDisplays);
    elements.dailyLikeLimitInput?.addEventListener('input', updateSliderDisplays);
    elements.dailyShareLimitInput?.addEventListener('input', updateSliderDisplays);
    elements.dailyFollowLimitInput?.addEventListener('input', updateSliderDisplays);
    
    // Start delay sliders  
    elements.automationStartDelay?.addEventListener('input', updateSliderDisplays);
    elements.networkingStartDelay?.addEventListener('input', updateSliderDisplays);
    elements.importStartDelay?.addEventListener('input', updateSliderDisplays);
    
    // Post writer delay sliders
    elements.postWriterPageLoadDelay?.addEventListener('input', updateSliderDisplays);
    elements.postWriterClickDelay?.addEventListener('input', updateSliderDisplays);
    elements.postWriterTypingDelay?.addEventListener('input', updateSliderDisplays);
    elements.postWriterSubmitDelay?.addEventListener('input', updateSliderDisplays);
    
    // Search and automation delay sliders
    elements.searchDelayMin?.addEventListener('input', updateSliderDisplays);
    elements.searchDelayMax?.addEventListener('input', updateSliderDisplays);
    elements.commentDelayMin?.addEventListener('input', updateSliderDisplays);
    elements.commentDelayMax?.addEventListener('input', updateSliderDisplays);
    elements.networkingDelayMin?.addEventListener('input', updateSliderDisplays);
    elements.networkingDelayMax?.addEventListener('input', updateSliderDisplays);
    
    // Post action delay sliders
    elements.beforeOpeningPostsDelay?.addEventListener('input', updateSliderDisplays);
    elements.postPageLoadDelay?.addEventListener('input', updateSliderDisplays);
    elements.beforeLikeDelay?.addEventListener('input', updateSliderDisplays);
    elements.beforeCommentDelay?.addEventListener('input', updateSliderDisplays);
    elements.beforeShareDelay?.addEventListener('input', updateSliderDisplays);
    elements.beforeFollowDelay?.addEventListener('input', updateSliderDisplays);

    // Mutual exclusion for Send with Note and Send Connection Request checkboxes
    elements.sendWithNote?.addEventListener('change', function() {
        if (this.checked && elements.sendConnectionRequest?.checked) {
            elements.sendConnectionRequest.checked = false;
            console.log('UI: Unchecked "Send Connection Request" because "Send with Note" was selected');
            saveAllFormValues(); // Save the change
        }
        if (!this.checked && !elements.sendConnectionRequest?.checked) {
            // If unchecking and the other is also unchecked, default to Send Connection Request
            elements.sendConnectionRequest.checked = true;
            console.log('UI: Auto-checked "Send Connection Request" to prevent both being unchecked');
            saveAllFormValues(); // Save the change
        }
    });

    elements.sendConnectionRequest?.addEventListener('change', function() {
        if (this.checked && elements.sendWithNote?.checked) {
            elements.sendWithNote.checked = false;
            console.log('UI: Unchecked "Send with Note" because "Send Connection Request" was selected');
            saveAllFormValues(); // Save the change
        }
        if (!this.checked && !elements.sendWithNote?.checked) {
            // If unchecking and the other is also unchecked, default to Send with Note
            elements.sendWithNote.checked = true;
            console.log('UI: Auto-checked "Send with Note" to prevent both being unchecked');
            saveAllFormValues(); // Save the change
        }
    });

    // Plan limit enforcement for daily limits inputs - DISABLED (users manage limits directly)
    // setupPlanLimitValidation();

    // Schedulers
    elements.addBulkSchedule?.addEventListener('click', addBulkSchedule);
    elements.addPeopleSchedule?.addEventListener('click', addPeopleSchedule);
    elements.bulkSchedulerEnabled?.addEventListener('change', toggleBulkScheduler);
    elements.peopleSchedulerEnabled?.addEventListener('change', togglePeopleScheduler);

    // Authentication & Plans
    elements.loginBtn?.addEventListener('click', handleLogin);
    elements.logoutBtn?.addEventListener('click', handleLogout);
    elements.upgradePlanBtn?.addEventListener('click', () => {
        console.log('🔥 Upgrade Plan button clicked!');
        if (elements.planModal) {
            elements.planModal.style.display = 'flex';
            console.log('✅ Plan modal opened');
        } else {
            console.error('❌ Plan modal element not found');
        }
        loadPlans();
    });
    elements.closePlanModal?.addEventListener('click', () => {
        if (elements.planModal) elements.planModal.style.display = 'none';
    });
    elements.retryPlans?.addEventListener('click', loadPlans);
    elements.planModal?.addEventListener('click', (e) => {
        if (e.target === elements.planModal) {
            elements.planModal.style.display = 'none';
        }
    });

    // Walkthrough
    document.getElementById('start-walkthrough-btn')?.addEventListener('click', () => {
        console.log('🎓 Starting walkthrough from Settings...');
        resetWalkthrough();
    });

    // Analytics
    elements.refreshAnalytics?.addEventListener('click', loadAnalytics);
    elements.analyticsPeriod?.addEventListener('change', loadAnalytics);
    elements.exportStats?.addEventListener('click', exportStatistics);
    elements.clearStats?.addEventListener('click', clearStatistics);
    
    // Automation History
    document.getElementById('refresh-automation-history')?.addEventListener('click', loadAutomationHistory);
    document.getElementById('export-automation-history')?.addEventListener('click', exportAutomationHistory);
    document.getElementById('clear-automation-history')?.addEventListener('click', clearAutomationHistory);
    document.getElementById('automation-history-filter-status')?.addEventListener('change', loadAutomationHistory);
    document.getElementById('automation-search')?.addEventListener('input', loadAutomationHistory);
    
    // Networking History
    document.getElementById('refresh-networking-history')?.addEventListener('click', loadNetworkingHistory);
    document.getElementById('export-networking-history')?.addEventListener('click', exportNetworkingHistory);
    document.getElementById('clear-networking-history')?.addEventListener('click', clearNetworkingHistory);
    document.getElementById('networking-history-filter-status')?.addEventListener('change', loadNetworkingHistory);
    document.getElementById('networking-search')?.addEventListener('input', loadNetworkingHistory);

    // Leads
    document.getElementById('leads-search')?.addEventListener('input', filterLeads);
    document.getElementById('leads-filter-query')?.addEventListener('change', filterLeads);
    document.getElementById('refresh-leads')?.addEventListener('click', loadLeads);
    document.getElementById('export-leads')?.addEventListener('click', exportLeadsToCSV);
    document.getElementById('show-contact-info')?.addEventListener('change', toggleContactColumns);
    document.getElementById('clear-all-leads')?.addEventListener('click', clearAllLeads);

    // Content
    elements.addKeyword?.addEventListener('click', addKeywordAlert);
    elements.addCompetitor?.addEventListener('click', addCompetitor);
    elements.schedulePostBtn?.addEventListener('click', schedulePost);

    // Settings & Limits
    document.getElementById('save-limits-settings')?.addEventListener('click', saveLimitsSettings);
    elements.testSystems?.addEventListener('click', testAllSystems);

    // Delay sliders
    ['search-delay-min', 'search-delay-max', 'comment-delay-min', 'comment-delay-max',
        'networking-delay-min', 'networking-delay-max',
        'automation-start-delay', 'networking-start-delay',
        'post-writer-page-load-delay', 'post-writer-click-delay', 'post-writer-typing-delay', 'post-writer-submit-delay',
        'before-opening-posts-delay', 'post-page-load-delay', 'before-like-delay', 
        'before-comment-delay', 'before-share-delay', 'before-follow-delay'].forEach(id => {
            const slider = document.getElementById(id);
            if (slider) {
                slider.addEventListener('input', () => updateDelayDisplay(id));
                slider.addEventListener('change', saveLimitsSettings);
            }
        });
    
    // Daily limit sliders
    ['daily-comment-limit-input', 'daily-like-limit-input', 'daily-share-limit-input', 'daily-follow-limit-input'].forEach(id => {
        const slider = document.getElementById(id);
        const displayId = id.replace('-input', '-display');
        if (slider) {
            slider.addEventListener('input', () => {
                const display = document.getElementById(displayId);
                if (display) display.textContent = slider.value;
            });
            slider.addEventListener('change', saveLimitsSettings);
        }
    });

    // Preferences
    const settingsElements = [elements.commentTone, elements.commentLength, elements.useCheapModel, elements.autoQuota, elements.autoPostAge];
    settingsElements.forEach(el => {
        el?.addEventListener('change', savePreferences);
    });

    // Business Hours
    elements.businessHoursEnabled?.addEventListener('change', () => {
        updateBusinessHours();
        saveAllFormValues();
    });
    
    // Daily Schedule - Auto-save
    elements.dailyScheduleEnabled?.addEventListener('change', () => {
        saveDailyScheduleSettings();
    });
    
    // Auto-save on business hours changes
    elements.businessStartHour?.addEventListener('change', saveAllFormValues);
    elements.businessEndHour?.addEventListener('change', saveAllFormValues);
    elements.allowWeekends?.addEventListener('change', saveAllFormValues);
    
    // Missed Post Behavior Setting
    const missedPostBehaviorSelect = document.getElementById('missed-post-behavior');
    if (missedPostBehaviorSelect) {
        // Load saved value
        chrome.storage.local.get('missedPostBehavior').then(result => {
            missedPostBehaviorSelect.value = result.missedPostBehavior || 'wait_manual';
        });
        
        // Save on change
        missedPostBehaviorSelect.addEventListener('change', async function() {
            await chrome.storage.local.set({ missedPostBehavior: this.value });
            console.log('✅ Missed post behavior saved:', this.value);
        });
    }
    
    // Scheduler Logs View Button
    const viewSchedulerLogsBtn = document.getElementById('view-scheduler-logs');
    const schedulerLogsContainer = document.getElementById('scheduler-logs-container');
    if (viewSchedulerLogsBtn && schedulerLogsContainer) {
        viewSchedulerLogsBtn.addEventListener('click', async function() {
            const isVisible = schedulerLogsContainer.style.display !== 'none';
            
            if (isVisible) {
                schedulerLogsContainer.style.display = 'none';
                this.textContent = 'View Logs';
            } else {
                // Fetch logs from background
                try {
                    const response = await chrome.runtime.sendMessage({ action: 'getSchedulerLogs' });
                    if (response && response.success && response.logs) {
                        const logs = response.logs;
                        if (logs.length === 0) {
                            schedulerLogsContainer.innerHTML = '<div style="color: #999;">No scheduler logs yet.</div>';
                        } else {
                            schedulerLogsContainer.innerHTML = logs.map(log => {
                                const color = log.level === 'error' ? '#ff6b6b' : 
                                             log.level === 'warn' ? '#ffc107' : '#00ff00';
                                return `<div style="color: ${color}; margin-bottom: 4px;">[${log.timestamp}] ${log.message}</div>`;
                            }).join('');
                        }
                    }
                } catch (error) {
                    schedulerLogsContainer.innerHTML = `<div style="color: #ff6b6b;">Error loading logs: ${error.message}</div>`;
                }
                
                schedulerLogsContainer.style.display = 'block';
                this.textContent = 'Hide Logs';
            }
        });
    }

    // --- Post Writer Tab Auto-save ---
    elements.postTopic?.addEventListener('change', saveAllFormValues);
    elements.postTopic?.addEventListener('input', saveAllFormValues);
    elements.postTemplate?.addEventListener('change', saveAllFormValues);
    elements.postTone?.addEventListener('change', saveAllFormValues);
    elements.postLength?.addEventListener('change', saveAllFormValues);
    elements.postIncludeHashtags?.addEventListener('change', saveAllFormValues);
    elements.postIncludeEmojis?.addEventListener('change', saveAllFormValues);
    elements.postContent?.addEventListener('change', saveAllFormValues);
    elements.scheduleDate?.addEventListener('change', saveAllFormValues);
    elements.scheduleTime?.addEventListener('change', saveAllFormValues);

    // --- Automation Tab Comment Settings Auto-save ---
    elements.commentGoal?.addEventListener('change', saveAllFormValues);
    elements.commentTone?.addEventListener('change', saveAllFormValues);
    elements.commentLength?.addEventListener('change', saveAllFormValues);
    elements.userExpertise?.addEventListener('change', saveAllFormValues);
    elements.userExpertise?.addEventListener('input', saveAllFormValues);
    elements.userBackground?.addEventListener('change', saveAllFormValues);
    elements.userBackground?.addEventListener('input', saveAllFormValues);
    elements.aiAutoPost?.addEventListener('change', saveAllFormValues);
    elements.openInWindow?.addEventListener('change', saveAllFormValues);
    elements.keywordIntent?.addEventListener('change', saveAllFormValues);
    elements.keywordIntent?.addEventListener('input', saveAllFormValues);
    elements.bulkLikeOrComment?.addEventListener('change', saveAllFormValues);

    // --- Import Tab Auto-save ---
    elements.profileUrlsInput?.addEventListener('change', saveAllFormValues);
    elements.importExtractContactInfo?.addEventListener('change', saveAllFormValues);
    elements.enableLikes?.addEventListener('change', saveAllFormValues);
    elements.enableComments?.addEventListener('change', saveAllFormValues);
    elements.enableShares?.addEventListener('change', saveAllFormValues);
    elements.enableFollows?.addEventListener('change', saveAllFormValues);
    elements.enableRandomMode?.addEventListener('change', saveAllFormValues);
    elements.postsPerProfile?.addEventListener('change', saveAllFormValues);
    elements.combinedSendConnections?.addEventListener('change', saveAllFormValues);
    elements.combinedExtractContactInfo?.addEventListener('change', saveAllFormValues);
    elements.combinedEnableLikes?.addEventListener('change', saveAllFormValues);
    elements.combinedEnableComments?.addEventListener('change', saveAllFormValues);
    elements.combinedEnableShares?.addEventListener('change', saveAllFormValues);
    elements.combinedEnableFollows?.addEventListener('change', saveAllFormValues);
    elements.combinedEnableRandomMode?.addEventListener('change', saveAllFormValues);
    elements.combinedPostsPerProfile?.addEventListener('change', saveAllFormValues);

    // Character counter for networking connection message
    const connectionMessage = document.getElementById('connection-message');
    const messageCharCount = document.getElementById('message-char-count');
    if (connectionMessage && messageCharCount) {
        connectionMessage.addEventListener('input', () => {
            const length = connectionMessage.value.length;
            messageCharCount.textContent = `${length}/300`;
            if (length > 300) {
                messageCharCount.style.color = '#e74c3c';
            } else {
                messageCharCount.style.color = '#693fe9';
            }
        });
        // Initialize count on load
        const initialLength = connectionMessage.value.length;
        messageCharCount.textContent = `${initialLength}/300`;
    }

    // Account type preset selector
    const accountTypeSelect = document.getElementById('account-type');
    if (accountTypeSelect) {
        accountTypeSelect.addEventListener('change', (e) => {
            applyAccountPreset(e.target.value);
        });
    }

    // Random interval min/max selectors
    const randomIntervalMin = document.getElementById('random-interval-min');
    if (randomIntervalMin) {
        randomIntervalMin.addEventListener('change', () => {
            updateRandomIntervalDisplay('random-interval-min');
            saveLimitsSettings();
        });
    }

    const randomIntervalMax = document.getElementById('random-interval-max');
    if (randomIntervalMax) {
        randomIntervalMax.addEventListener('change', () => {
            updateRandomIntervalDisplay('random-interval-max');
            saveLimitsSettings();
        });
    }

    // Import start delay slider
    const importStartDelaySlider = document.getElementById('import-start-delay');
    if (importStartDelaySlider) {
        importStartDelaySlider.addEventListener('input', () => updateDelayDisplay('import-start-delay'));
        importStartDelaySlider.addEventListener('change', saveLimitsSettings);
    }

    // Post Source Toggle (Commenter tab - Keywords vs Feed)
    const sourceKeywords = document.getElementById('source-keywords');
    const sourceFeed = document.getElementById('source-feed');
    const keywordSection = document.getElementById('keyword-section');
    const sourceKeywordsLabel = document.getElementById('source-keywords-label');
    const sourceFeedLabel = document.getElementById('source-feed-label');
    
    if (sourceKeywords && sourceFeed) {
        const updateSourceUI = () => {
            if (sourceKeywords.checked) {
                if (sourceKeywordsLabel) {
                    sourceKeywordsLabel.style.background = '#f0f8ff';
                    sourceKeywordsLabel.style.borderColor = '#693fe9';
                    sourceKeywordsLabel.querySelector('span').style.color = '#693fe9';
                }
                if (sourceFeedLabel) {
                    sourceFeedLabel.style.background = '#f8f9fa';
                    sourceFeedLabel.style.borderColor = '#e0e0e0';
                    sourceFeedLabel.querySelector('span').style.color = '#666';
                }
                if (keywordSection) keywordSection.style.display = 'block';
            } else {
                if (sourceKeywordsLabel) {
                    sourceKeywordsLabel.style.background = '#f8f9fa';
                    sourceKeywordsLabel.style.borderColor = '#e0e0e0';
                    sourceKeywordsLabel.querySelector('span').style.color = '#666';
                }
                if (sourceFeedLabel) {
                    sourceFeedLabel.style.background = '#f0f8ff';
                    sourceFeedLabel.style.borderColor = '#693fe9';
                    sourceFeedLabel.querySelector('span').style.color = '#693fe9';
                }
                if (keywordSection) keywordSection.style.display = 'none';
            }
            // Save preference
            chrome.storage.local.set({ postSource: sourceKeywords.checked ? 'keywords' : 'feed' });
        };
        
        sourceKeywords.addEventListener('change', updateSourceUI);
        sourceFeed.addEventListener('change', updateSourceUI);
        
        // Load saved preference - default to feed if not set
        chrome.storage.local.get('postSource').then(result => {
            if (result.postSource === 'keywords') {
                sourceKeywords.checked = true;
            } else {
                // Default to feed
                sourceFeed.checked = true;
            }
            updateSourceUI();
        });
    }

    // Network Search Source Toggle (Keyword vs URL)
    const searchByKeyword = document.getElementById('search-by-keyword');
    const searchByUrl = document.getElementById('search-by-url');
    const keywordInputSection = document.getElementById('keyword-input-section');
    const urlInputSection = document.getElementById('url-input-section');
    const searchByUrlLabel = document.getElementById('search-by-url-label');
    
    if (searchByKeyword && searchByUrl) {
        const updateSearchSourceUI = () => {
            const keywordLabel = searchByKeyword.closest('label');
            if (searchByKeyword.checked) {
                if (keywordLabel) {
                    keywordLabel.style.background = '#f0f8ff';
                    keywordLabel.style.borderColor = '#693fe9';
                    keywordLabel.querySelector('span').style.color = '#693fe9';
                }
                if (searchByUrlLabel) {
                    searchByUrlLabel.style.background = '#f8f9fa';
                    searchByUrlLabel.style.borderColor = '#e0e0e0';
                    searchByUrlLabel.querySelector('span').style.color = '#666';
                }
                if (keywordInputSection) keywordInputSection.style.display = 'block';
                if (urlInputSection) urlInputSection.style.display = 'none';
            } else {
                if (keywordLabel) {
                    keywordLabel.style.background = '#f8f9fa';
                    keywordLabel.style.borderColor = '#e0e0e0';
                    keywordLabel.querySelector('span').style.color = '#666';
                }
                if (searchByUrlLabel) {
                    searchByUrlLabel.style.background = '#f0f8ff';
                    searchByUrlLabel.style.borderColor = '#693fe9';
                    searchByUrlLabel.querySelector('span').style.color = '#693fe9';
                }
                if (keywordInputSection) keywordInputSection.style.display = 'none';
                if (urlInputSection) urlInputSection.style.display = 'block';
            }
            // Save preference
            chrome.storage.local.set({ searchSource: searchByKeyword.checked ? 'keyword' : 'url' });
        };
        
        searchByKeyword.addEventListener('change', updateSearchSourceUI);
        searchByUrl.addEventListener('change', updateSearchSourceUI);
        
        // Load saved preference
        chrome.storage.local.get('searchSource').then(result => {
            if (result.searchSource === 'url') {
                searchByUrl.checked = true;
                updateSearchSourceUI();
            }
        });
    }

    console.log('✅ Event listeners setup complete');
}

/**
 * Setup plan limit validation for daily limits inputs
 */
function setupPlanLimitValidation() {
    const inputConfigs = [
        { id: 'daily-comment-limit-input', type: 'comments', defaultLimit: 5 },
        { id: 'daily-like-limit-input', type: 'likes', defaultLimit: 10 },
        { id: 'daily-share-limit-input', type: 'shares', defaultLimit: 5 },
        { id: 'daily-follow-limit-input', type: 'follows', defaultLimit: 5 }
    ];

    inputConfigs.forEach(config => {
        const input = document.getElementById(config.id);
        if (!input) return;

        // Get plan limit from the display element
        const getPlanLimit = () => {
            const planElement = document.getElementById(`max-${config.type}-plan`);
            return planElement ? parseInt(planElement.textContent) || config.defaultLimit : config.defaultLimit;
        };

        // Prevent typing numbers that would exceed limit
        input.addEventListener('keydown', function(e) {
            const planLimit = getPlanLimit();
            const currentValue = parseInt(this.value) || 0;
            
            // Allow backspace, delete, tab, escape, enter
            if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
                // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                (e.keyCode === 65 && e.ctrlKey === true) ||
                (e.keyCode === 67 && e.ctrlKey === true) ||
                (e.keyCode === 86 && e.ctrlKey === true) ||
                (e.keyCode === 88 && e.ctrlKey === true) ||
                // Allow home, end, left, right
                (e.keyCode >= 35 && e.keyCode <= 39)) {
                return;
            }
            
            // Ensure that it is a number and stop the keypress
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
                return;
            }
            
            // Check if the new value would exceed limit
            const key = String.fromCharCode(e.keyCode);
            const newValue = parseInt(this.value + key);
            
            if (newValue > planLimit) {
                e.preventDefault();
                showPlanLimitWarning(config.type, planLimit);
                return false;
            }
        });

        // Real-time validation on input
        input.addEventListener('input', function() {
            const planLimit = getPlanLimit();
            const value = parseInt(this.value);
            
            if (isNaN(value) || value < 0) {
                this.value = 0;
                return;
            }
            
            if (value > planLimit) {
                this.value = planLimit;
                
                // Show warning
                showPlanLimitWarning(config.type, planLimit);
            }
        });

        // Validation on change (when user leaves the field)
        input.addEventListener('change', function() {
            const planLimit = getPlanLimit();
            const value = parseInt(this.value);
            
            if (isNaN(value) || value < 0) {
                this.value = 0;
            } else if (value > planLimit) {
                this.value = planLimit;
                showPlanLimitWarning(config.type, planLimit);
            }
        });

        // Prevent pasting values above limit
        input.addEventListener('paste', function(e) {
            setTimeout(() => {
                const planLimit = getPlanLimit();
                const value = parseInt(this.value);
                if (value > planLimit) {
                    this.value = planLimit;
                    showPlanLimitWarning(config.type, planLimit);
                }
            }, 0);
        });
    });
}

/**
 * Show plan limit warning
 */
function showPlanLimitWarning(type, limit) {
    // Create or update warning toast
    if (typeof showToast === 'function') {
        showToast(`${type} limit reached (${limit}).`, 'warning');
    } else {
        console.warn(`Plan limit reached: ${limit} ${type}/day`);
    }
    
    // Upgrade modal removed - users can manage limits directly in Limits tab
}

/**
 * Initialize tab switching functionality
 */
function initializeTabSwitching() {
    console.log('🔧 Initializing tab switching...');
    
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    if (tabButtons.length === 0) {
        console.warn('⚠️ No tab buttons found');
        return;
    }
    
    console.log(`📋 Found ${tabButtons.length} tab buttons and ${tabContents.length} tab contents`);
    
    // Add click listeners to tab buttons
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = button.getAttribute('data-tab');
            console.log(`🔄 Switching to tab: ${targetTab}`);
            switchToTab(targetTab);
        });
    });
    
    // Show the default tab (dashboard) or the active tab from state
    const activeTab = state.ui?.activeTab || 'dashboard';
    switchToTab(activeTab);
    
    console.log('✅ Tab switching initialized');
}

/**
 * Switch to a specific tab
 */
function switchToTab(tabName) {
    console.log(`🎯 Switching to tab: ${tabName}`);
    
    // Update tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        if (button.getAttribute('data-tab') === tabName) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    
    // Update tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        const contentId = content.id.replace('-content', '');
        if (contentId === tabName) {
            content.style.display = 'block';
            console.log(`👁️ Showing content: ${content.id}`);
        } else {
            content.style.display = 'none';
        }
    });
    
    // Update state
    if (state.ui) {
        state.ui.activeTab = tabName;
        chrome.storage.local.set({ ui: state.ui });
    }
    
    // Load tab-specific data
    loadTabData(tabName);
}

/**
 * Load data for specific tab
 */
function loadTabData(tabName) {
    switch (tabName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'analytics':
            loadAnalytics();
            break;
        case 'networking':
            // Networking data is loaded on demand
            break;
        case 'import':
            console.log('📥 TAB DATA: Initializing Import tab...');
            initializeImport();
            break;
        case 'post-writer':
            // Post writer is ready
            break;
        case 'automation':
            // Automation is ready
            break;
        case 'limits':
            // Limits are loaded on demand
            break;
        case 'settings':
            // Settings are loaded on demand
            break;
    }
}
