// Bulk Processing Executor - Direct function calls for scheduler
import { storage } from '../shared/storage/storage.background.js';
import { scrapePostsFromSearchEnhanced, scrapePostsFromFeed } from './enhancedScraper.js';
import { businessHoursScheduler } from './businessHoursScheduler.js';
import { backgroundStatistics } from './statisticsManager.js';
import { featureChecker } from '../shared/utils/featureChecker.js';
import { liveLog } from '../shared/services/liveActivityLogger.js';

// Global stop flag and processing state
let stopProcessingFlag = false;
let isProcessing = false;
let activeTabId = null;

/**
 * Save automation post record to permanent storage
 * Records each processed post with details for analytics display
 */
async function saveAutomationPostRecord(record) {
    try {
        const { automationPostRecords = [] } = await chrome.storage.local.get('automationPostRecords');
        
        // Add new record at the beginning
        automationPostRecords.unshift({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            ...record,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 500 records to prevent storage bloat
        if (automationPostRecords.length > 500) {
            automationPostRecords.splice(500);
        }
        
        await chrome.storage.local.set({ automationPostRecords });
        console.log('📝 BULK PROCESSING: Saved automation post record:', record.authorName);
    } catch (error) {
        console.warn('Failed to save automation post record:', error);
    }
}

/**
 * Broadcast status update to the active LinkedIn tab
 */
async function broadcastStatus(message, type = 'info', showStopButton = true) {
    if (!activeTabId) return;
    
    try {
        await chrome.scripting.executeScript({
            target: { tabId: activeTabId },
            func: (msg, msgType, showStop, automationType) => {
                const colors = {
                    info: '#0a66c2',
                    success: '#057642',
                    warning: '#b24020',
                    error: '#cc1016'
                };
                
                let container = document.getElementById('minify-status-container');
                if (!container) {
                    container = document.createElement('div');
                    container.id = 'minify-status-container';
                    container.style.cssText = `
                        position: fixed;
                        top: 70px;
                        right: 20px;
                        z-index: 999999;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    `;
                    document.body.appendChild(container);
                }
                
                container.innerHTML = `
                    <div id="minify-status-indicator" style="
                        padding: 10px 16px;
                        border-radius: 6px;
                        font-size: 13px;
                        font-weight: 600;
                        color: white;
                        box-shadow: 0 2px 12px rgba(0,0,0,0.25);
                        max-width: 320px;
                        background-color: ${colors[msgType] || colors.info};
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    ">
                        <span style="flex: 1;">${msg}</span>
                        ${showStop && msgType !== 'success' ? `
                            <button id="minify-stop-btn" style="
                                background: rgba(255,255,255,0.2);
                                border: 1px solid rgba(255,255,255,0.5);
                                color: white;
                                padding: 4px 10px;
                                border-radius: 4px;
                                font-size: 11px;
                                font-weight: 600;
                                cursor: pointer;
                                white-space: nowrap;
                            ">🛑 Stop</button>
                        ` : ''}
                    </div>
                `;
                
                container.style.display = 'block';
                container.style.opacity = '1';
                
                const stopBtn = document.getElementById('minify-stop-btn');
                if (stopBtn) {
                    stopBtn.onclick = () => {
                        chrome.runtime.sendMessage({ action: `stop${automationType}` });
                        stopBtn.textContent = '⏳ Stopping...';
                        stopBtn.disabled = true;
                    };
                }
                
                if (window._minifyStatusTimeout) {
                    clearTimeout(window._minifyStatusTimeout);
                }
                
                if (msgType === 'success') {
                    window._minifyStatusTimeout = setTimeout(() => {
                        container.style.opacity = '0';
                        setTimeout(() => { container.style.display = 'none'; }, 300);
                    }, 4000);
                }
            },
            args: [message, type, showStopButton, 'BulkProcessing']
        });
    } catch (error) {
        // Tab might be closed
    }
}

/**
 * Stop the current bulk processing
 */
export async function stopBulkProcessing() {
    console.log("BULK PROCESSING: Stop signal received");
    console.log("📝 DEBUG: Setting stopProcessingFlag to true");
    stopProcessingFlag = true;
    
    // Immediately clear processing state
    isProcessing = false;
    await chrome.storage.local.set({ 
        bulkProcessingActive: false,
        liveProgress: { active: false }
    });
    console.log("BULK PROCESSING: State cleared immediately");
    
    return { success: true, message: "Stop signal sent" };
}

/**
 * Check if processing is currently running
 */
export function isProcessingActive() {
    return isProcessing;
}

/**
 * Execute bulk processing with given settings
 * @param {Object} settings - Processing settings
 * @returns {Promise<Object>} Execution result
 */
export async function executeBulkProcessing(settings) {
    // Check if already processing
    if (isProcessing) {
        console.warn("⚠️ BULK PROCESSING: Already processing, ignoring duplicate request");
        return { success: false, error: "Processing already in progress" };
    }
    
    // Set processing flag
    isProcessing = true;
    stopProcessingFlag = false;
    
    // Set storage flag for dashboard monitoring
    await chrome.storage.local.set({ bulkProcessingActive: true });
    
    // Record session start
    const sessionStartTime = Date.now();
    let sessionData = {
        type: 'automation',
        keywords: settings.keywords,
        target: settings.quota || 0,
        startTime: sessionStartTime,
        actions: settings.actions || {}
    };
    
    console.log("BULK PROCESSING: Starting bulk processing with settings:", JSON.stringify(settings, null, 2));
    
    // Record session start immediately for accountability
    const recordSessionStart = async () => {
        console.log('📝 DEBUG: Recording session START immediately');
        sessionData.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        sessionData.status = 'started';
        sessionData.query = Array.isArray(settings.keywords) ? settings.keywords.join(', ') : settings.keywords;
        sessionData.processed = 0;
        sessionData.successful = 0;
        sessionData.endTime = sessionData.startTime; // Same as start for now
        sessionData.duration = 0;
        
        try {
            const { processingHistory = [] } = await chrome.storage.local.get('processingHistory');
            processingHistory.unshift({...sessionData});
            if (processingHistory.length > 100) {
                processingHistory.splice(100);
            }
            await chrome.storage.local.set({ processingHistory });
            console.log('📝 DEBUG: Session START recorded to storage');
        } catch (error) {
            console.warn('Failed to record session start:', error);
        }
    };

    // Helper function to record session to history (update existing or create new)
    const recordSession = async (status, processedCount = 0, error = null) => {
        console.log(`📝 DEBUG: recordSession called with status: ${status}, processedCount: ${processedCount}, error: ${error}`);
        
        sessionData.endTime = Date.now();
        sessionData.duration = sessionData.endTime - sessionData.startTime;
        sessionData.processed = processedCount;
        sessionData.successful = processedCount; // Assume all processed are successful for now
        sessionData.status = status;
        sessionData.query = Array.isArray(settings.keywords) ? settings.keywords.join(', ') : settings.keywords;
        sessionData.successRate = processedCount > 0 ? Math.round((processedCount / processedCount) * 100) : 0; // 100% since we assume all are successful
        if (error) sessionData.error = error;
        
        console.log('📝 DEBUG: Final session data to be recorded:', JSON.stringify(sessionData, null, 2));
        
        try {
            const { processingHistory = [] } = await chrome.storage.local.get('processingHistory');
            
            // Find existing session by ID and update it, or add new one
            const existingIndex = processingHistory.findIndex(s => s.id === sessionData.id);
            if (existingIndex >= 0) {
                console.log('📝 DEBUG: Updating existing session in history');
                processingHistory[existingIndex] = {...sessionData};
            } else {
                console.log('📝 DEBUG: Adding new session to history');
                processingHistory.unshift({...sessionData});
            }
            
            if (processingHistory.length > 100) {
                processingHistory.splice(100);
            }
            await chrome.storage.local.set({ processingHistory });
            console.log(`📝 ${status} automation session recorded to history`);
        } catch (historyError) {
            console.warn('Failed to record session to history:', historyError);
        }
    };
    
    // Initialize processedCount at the top level
    let processedCount = 0;
    
    // Record session start immediately - this ensures we capture even immediate stops
    await recordSessionStart();
    
    try {
        console.log("🚀 BULK PROCESSING: Starting enhanced processing...");
        console.log("BULK PROCESSING: Source:", settings.source || 'direct');
        console.log("BULK PROCESSING: Keywords:", settings.keywords);
        console.log("BULK PROCESSING: Target quota:", settings.quota);
        
        // Check plan features before processing
        const requestedActions = settings.actions || {};
        console.log("🔒 BULK PROCESSING: Checking plan features...");
        
        try {
            // Check autoComment feature if comments enabled
            if (requestedActions.comment) {
                const canComment = await featureChecker.checkFeature('autoComment');
                if (!canComment) {
                    isProcessing = false;
                    return {
                        success: false,
                        error: 'Auto-comment feature is not available in your plan. Please upgrade to use AI-powered comments.',
                        requiresUpgrade: true,
                        feature: 'autoComment'
                    };
                }
            }
            
            // Check autoFollow feature if follow enabled
            if (requestedActions.follow) {
                const canFollow = await featureChecker.checkFeature('autoFollow');
                if (!canFollow) {
                    isProcessing = false;
                    return {
                        success: false,
                        error: 'Auto-follow feature is not available in your plan. Please upgrade to grow your network automatically.',
                        requiresUpgrade: true,
                        feature: 'autoFollow'
                    };
                }
            }
            
            console.log("✅ BULK PROCESSING: Plan features verified");
        } catch (featureError) {
            console.error("❌ BULK PROCESSING: Feature check failed:", featureError);
            isProcessing = false;
            return {
                success: false,
                error: featureError.message || 'Failed to verify plan features. Please try again.',
                requiresUpgrade: true
            };
        }
        
        // Check business hours (only if enabled and not from scheduler)
        if (settings.source !== 'scheduler') {
            const businessHoursSettings = await storage.getObject('businessHours') || { enabled: true };
            console.log("BULK PROCESSING: Business hours settings:", businessHoursSettings);
            
            if (businessHoursSettings.enabled && businessHoursScheduler && !businessHoursScheduler.isWithinBusinessHours()) {
                console.log("BULK PROCESSING: Outside business hours");
                return { 
                    success: false, 
                    error: "Outside business hours (9 AM - 6 PM). Please disable business hours or try during business hours." 
                };
            }
        }
        
        console.log("BULK PROCESSING: Business hours check passed, proceeding...");
        
        // Load delay settings, automation preferences, and random interval settings
        const storageResult = await chrome.storage.local.get(['delaySettings', 'automationPreferences', 'randomIntervalSettings', 'randomDelayEnabled']);
        const delaySettings = storageResult.delaySettings || {
            automationStartDelay: 0,
            searchMinDelay: 15,
            searchMaxDelay: 30,
            commentMinDelay: 25,
            commentMaxDelay: 60,
            postPageLoadDelay: 3,
            beforeOpeningPostsDelay: 2,
            beforeLikeDelay: 1,
            beforeCommentDelay: 2,
            beforeShareDelay: 1,
            beforeFollowDelay: 1,
            baseDelay: 0,
            taskInitDelay: 0,
            warmupDelay: 5
        };
        const automationPreferences = storageResult.automationPreferences || { openSearchInWindow: true };
        const randomIntervalSettings = storageResult.randomIntervalSettings || { minInterval: 15, maxInterval: 35, enabled: true };
        const randomDelayEnabled = storageResult.randomDelayEnabled !== false;
        
        // Helper: add random jitter + baseDelay to a delay if enabled
        const userBaseDelay = (delaySettings.baseDelay || 0) * 1000;
        const applyRandomJitter = (actionDelayMs, label = 'generic') => {
            let total = actionDelayMs + userBaseDelay;
            let jitter = 0;
            if (randomDelayEnabled && randomIntervalSettings.enabled) {
                const jitterMin = (randomIntervalSettings.minInterval || 15) * 1000;
                const jitterMax = (randomIntervalSettings.maxInterval || 35) * 1000;
                jitter = Math.floor(Math.random() * (jitterMax - jitterMin + 1)) + jitterMin;
                total += jitter;
            }
            console.log(`⏱️ BULK DELAY [${label}]: action=${actionDelayMs}ms + base=${userBaseDelay}ms + jitter=${jitter}ms = TOTAL ${total}ms (${(total/1000).toFixed(1)}s)`);
            return total;
        };
        
        console.log("🔧 BULK PROCESSING: Delay settings loaded:", JSON.stringify(delaySettings));
        console.log("🪟 BULK PROCESSING: Automation preferences:", automationPreferences);
        console.log("🎲 BULK PROCESSING: Random interval settings:", JSON.stringify(randomIntervalSettings));
        liveLog.start('automation', `🚀 Bulk processing started — ${settings.keywords?.length || 0} keywords, ${settings.quota || 20} posts target`);
        
        // Apply task init delay
        const taskInitDelay = delaySettings.taskInitDelay || 0;
        if (taskInitDelay > 0) {
            console.log(`⏱️ BULK PROCESSING: Task init delay: ${taskInitDelay}s...`);
            liveLog.delay('automation', taskInitDelay, 'task init delay');
            await new Promise(resolve => setTimeout(resolve, taskInitDelay * 1000));
            console.log('✅ BULK PROCESSING: Task init delay complete');
        }
        
        // Apply starting delay
        const startDelay = delaySettings.automationStartDelay || 0;
        if (startDelay > 0) {
            console.log(`⏰ BULK PROCESSING: Applying start delay of ${startDelay} seconds...`);
            liveLog.delay('automation', startDelay, 'automation start delay');
            await new Promise(resolve => setTimeout(resolve, startDelay * 1000));
            console.log('✅ BULK PROCESSING: Start delay complete, beginning automation');
        } else {
            console.log('⏩ BULK PROCESSING: No start delay configured, starting immediately');
        }
        
        // Process all keywords or feed
        const allPostUrns = [];
        
        // Parse ignore keywords from settings (string or array)
        const rawIgnoreKw = settings.ignoreKeywords || 'we\'re hiring\nnow hiring\napply now';
        const ignoreKeywords = Array.isArray(rawIgnoreKw) ? rawIgnoreKw.map(k => k.trim()).filter(k => k.length > 0) : rawIgnoreKw.split('\n').map(k => k.trim()).filter(k => k.length > 0);
        
        const qualification = {
            minLikes: settings.minLikes || 0,
            minComments: settings.minComments || 0,
            ignoreKeywords: ignoreKeywords
        };
        
        // Check if using Feed mode
        if (settings.source === 'feed') {
            console.log("📰 BULK PROCESSING: Using FEED mode - scraping from LinkedIn home feed");
            await broadcastStatus(`📰 Scraping posts from your LinkedIn Feed...`, 'info');
            
            try {
                // Scrape posts from LinkedIn feed instead of keyword search
                const qualifiedPosts = await scrapePostsFromFeed(
                    settings.quota || 20,
                    qualification
                );
                
                if (stopProcessingFlag || (qualifiedPosts && qualifiedPosts.stopped)) {
                    console.log("BULK PROCESSING: Stopped during feed scraping");
                    await chrome.storage.local.set({ liveProgress: { active: false }, bulkProcessingActive: false });
                    await recordSession('stopped', processedCount);
                    return { success: true, stopped: true, processed: processedCount, message: `Processing stopped. Completed ${processedCount} posts.` };
                }
                
                console.log(`✅ BULK PROCESSING: Found ${qualifiedPosts.length} qualified posts from Feed`);
                await broadcastStatus(`📄 Found ${qualifiedPosts.length} posts from Feed`, 'info');
                allPostUrns.push(...qualifiedPosts);
                
            } catch (error) {
                console.error(`BULK PROCESSING: Error scraping feed:`, error);
            }
        } else {
            // Keywords mode - process each keyword
            for (const keyword of settings.keywords) {
                // Check stop flag
                if (stopProcessingFlag) {
                    console.log("BULK PROCESSING: Stopped by user");
                    console.log("📝 DEBUG: About to record stopped session with processedCount:", processedCount);
                    await recordSession('stopped', processedCount);
                    console.log("📝 DEBUG: Stopped session recording completed");
                    return { success: false, stopped: true, message: "Processing stopped by user" };
                }
                
                console.log(`BULK PROCESSING: Processing keyword: "${keyword}"`);
                await broadcastStatus(`🔍 Searching: "${keyword}"`, 'info');
                liveLog.info('automation', `🔍 Searching for posts: "${keyword}"`);
                
                try {
                    console.log(`🔍 BULK PROCESSING: Scraping with qualification - minLikes: ${qualification.minLikes}, minComments: ${qualification.minComments}, ignoreKeywords: ${ignoreKeywords.length} keywords`);
                    
                    const qualifiedPosts = await scrapePostsFromSearchEnhanced(
                        keyword, 
                        settings.quota || 20,
                        qualification
                    );
                    
                    // Check if scraping was stopped
                    if (stopProcessingFlag || (qualifiedPosts && qualifiedPosts.stopped)) {
                        console.log("BULK PROCESSING: Stopped during scraping");
                        await chrome.storage.local.set({ liveProgress: { active: false }, bulkProcessingActive: false });
                        await recordSession('stopped', processedCount);
                        return { success: true, stopped: true, processed: processedCount, message: `Processing stopped. Completed ${processedCount} posts.` };
                    }
                    
                    console.log(`✅ BULK PROCESSING: Found ${qualifiedPosts.length} qualified posts for "${keyword}"`);
                    await broadcastStatus(`📄 Found ${qualifiedPosts.length} posts for "${keyword}"`, 'info');
                    liveLog.info('automation', `📄 Found ${qualifiedPosts.length} qualified posts for "${keyword}"`);
                    allPostUrns.push(...qualifiedPosts);
                    
                    // Check stop flag before delay
                    if (stopProcessingFlag) {
                        console.log("BULK PROCESSING: Stopped before keyword delay");
                        await chrome.storage.local.set({ liveProgress: { active: false }, bulkProcessingActive: false });
                        await recordSession('stopped', processedCount);
                        return { success: true, stopped: true, processed: processedCount, message: `Processing stopped. Completed ${processedCount} posts.` };
                    }
                    
                    // Add delay between keywords if there are more to process
                    if (settings.keywords.indexOf(keyword) < settings.keywords.length - 1) {
                        const minDelay = (delaySettings.searchMinDelay || 30) * 1000;
                        const maxDelay = (delaySettings.searchMaxDelay || 60) * 1000;
                        const delayTime = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
                        console.log(`⏱️ BULK PROCESSING: Waiting ${Math.floor(delayTime/1000)}s before next keyword...`);
                        await new Promise(resolve => setTimeout(resolve, delayTime));
                    }
                    
                } catch (error) {
                    console.error(`BULK PROCESSING: Error processing keyword "${keyword}":`, error);
                }
            }
        }
        
        console.log(`BULK PROCESSING: Total posts to process: ${allPostUrns.length}`);
        
        if (allPostUrns.length === 0) {
            // Clear processing state
            await chrome.storage.local.set({ bulkProcessingActive: false });
            return {
                success: false,
                error: "No posts found matching the criteria"
            };
        }
        
        // Check stop flag before opening posts
        if (stopProcessingFlag) {
            console.log("BULK PROCESSING: Stopped before opening posts");
            await chrome.storage.local.set({ liveProgress: { active: false }, bulkProcessingActive: false });
            await recordSession('stopped', processedCount);
            return { success: true, stopped: true, processed: processedCount, message: `Processing stopped. Completed ${processedCount} posts.` };
        }
        
        // Apply delay before opening posts
        const beforeOpeningPostsDelay = (delaySettings.beforeOpeningPostsDelay || 5) * 1000;
        console.log(`⏰ BULK PROCESSING: Waiting ${beforeOpeningPostsDelay/1000}s before opening posts...`);
        liveLog.delay('automation', Math.round(beforeOpeningPostsDelay/1000), 'before opening posts');
        await new Promise(resolve => setTimeout(resolve, beforeOpeningPostsDelay));
        console.log(`✅ BULK PROCESSING: Delay complete, starting to open posts`);
        
        // Process each post
        const actions = settings.actions || { like: true, comment: false, share: false, follow: false };
        const commentDelay = settings.commentDelay || 180;
        
        console.log("📋 BULK PROCESSING: Actions to perform:", JSON.stringify(actions));
        
        for (let i = 0; i < allPostUrns.length; i++) {
            // Check stop flag
            if (stopProcessingFlag) {
                console.log("BULK PROCESSING: Stopped by user");
                // Clear live progress
                await chrome.storage.local.set({ liveProgress: { active: false } });
                await recordSession('stopped', processedCount);
                return { 
                    success: true, 
                    stopped: true, 
                    processed: processedCount,
                    message: `Processing stopped. Completed ${processedCount} posts.` 
                };
            }
            
            const postData = allPostUrns[i];
            console.log(`BULK PROCESSING: Processing post ${i + 1}/${allPostUrns.length}: ${postData.urn}`);
            
            // Update live progress
            const percentage = Math.round(((i + 1) / allPostUrns.length) * 100);
            await chrome.storage.local.set({
                liveProgress: {
                    active: true,
                    type: 'bulk_processing',
                    current: i + 1,
                    total: allPostUrns.length,
                    currentStep: `Processing post ${i + 1}/${allPostUrns.length}`,
                    percentage: percentage
                }
            });
            
            // Send progress update to dashboard
            try {
                chrome.runtime.sendMessage({
                    action: 'automationProgress',
                    type: 'processing',
                    data: {
                        currentPostNumber: i + 1,
                        totalPosts: allPostUrns.length,
                        currentStep: `Processing post ${i + 1}/${allPostUrns.length}`,
                        percentage: percentage
                    }
                });
            } catch (e) {
                // Silent fail if no listeners
            }
            
            try{
                // Convert URN to post URL - ensure proper URN format
                let urn = postData.urn;
                
                // Log what we received for debugging
                console.log(`BULK PROCESSING: Processing post ${i + 1}/${allPostUrns.length}`);
                console.log(`BULK PROCESSING: Raw URN received: ${urn}`);
                console.log(`BULK PROCESSING: URN type: ${typeof urn}`);
                console.log(`BULK PROCESSING: Full postData:`, postData);
                
                // Handle different URN formats
                if (typeof urn === 'string') {
                    // If it's already a full URN, use it as is
                    if (urn.startsWith('urn:li:activity:')) {
                        // Already correct format
                    } else if (urn.match(/^\d+$/)) {
                        // Just a number, convert to full URN
                        urn = `urn:li:activity:${urn}`;
                    } else if (urn.startsWith('generated-')) {
                        // Generated URN, try to extract number or use as is
                        const numberMatch = urn.match(/\d+/);
                        if (numberMatch) {
                            urn = `urn:li:activity:${numberMatch[0]}`;
                        }
                    }
                } else if (typeof urn === 'number') {
                    // Convert number to full URN
                    urn = `urn:li:activity:${urn}`;
                }
                
                const postUrl = `https://www.linkedin.com/feed/update/${urn}/`;
                console.log(`BULK PROCESSING: Opening post: ${postUrl}`);
                
                // Open post in background tab with retries
                let postTab = null;
                let openAttempts = 0;
                const maxOpenRetries = 5;
                
                while (!postTab && openAttempts < maxOpenRetries) {
                    openAttempts++;
                    console.log(`BULK PROCESSING: Attempt ${openAttempts}/${maxOpenRetries} to open post tab`);
                    
                    try {
                        // Create tab as active first to prevent auto-discard, then make inactive
                        postTab = await chrome.tabs.create({
                            url: postUrl,
                            active: true // Create as active to prevent discard
                        });
                        
                        if (!postTab) {
                            console.warn(`BULK PROCESSING: Failed to create tab on attempt ${openAttempts}`);
                            if (openAttempts < maxOpenRetries) {
                                const retryDelay = 20000 * openAttempts;
                                console.log(`BULK PROCESSING: Waiting ${retryDelay}ms before retry`);
                                await new Promise(resolve => setTimeout(resolve, retryDelay));
                            }
                        } else {
                            console.log(`✅ BULK PROCESSING: Successfully created tab ${postTab.id} on attempt ${openAttempts}`);
                            activeTabId = postTab.id; // Set for status broadcasts
                            await broadcastStatus(`📄 Processing post ${i + 1}/${allPostUrns.length}`, 'info');
                            
                            // Wait for tab to fully initialize
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            console.log(`📌 BULK PROCESSING: Tab ${postTab.id} created and stabilized`);
                        }
                    } catch (error) {
                        console.error(`BULK PROCESSING: Error creating tab on attempt ${openAttempts}:`, error);
                        if (openAttempts < maxOpenRetries) {
                            await new Promise(resolve => setTimeout(resolve, 2000 * openAttempts));
                        }
                    }
                }
                
                if (!postTab) {
                    console.error(`BULK PROCESSING: Failed to open post ${postData.urn} after all retries`);
                    continue;
                }
                
                console.log(`BULK PROCESSING: Created background tab ${postTab.id}`);
                
                // Wait for post to load with verification
                const postPageLoadDelay = (delaySettings.postPageLoadDelay || 3) * 1000;
                console.log(`⏱️ BULK PROCESSING: Waiting ${postPageLoadDelay/1000}s for post page to load...`);
                await new Promise(resolve => setTimeout(resolve, postPageLoadDelay));
                
                console.log('BULK PROCESSING: Verifying post page loaded...');
                let pageLoadAttempts = 0;
                const maxLoadRetries = 5;
                let pageLoaded = false;
                
                while (!pageLoaded && pageLoadAttempts < maxLoadRetries) {
                    pageLoadAttempts++;
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds per check
                    
                    // Verify page is loaded by checking for content
                    try {
                        const verification = await chrome.scripting.executeScript({
                            target: { tabId: postTab.id },
                            func: () => {
                                const hasLikeButton = document.querySelector('button[aria-label*="React Like"], button[data-control-name="like"]') !== null;
                                const isLoaded = document.readyState === 'complete';
                                return { hasLikeButton, isLoaded, readyState: document.readyState };
                            }
                        });
                        
                        if (verification && verification[0]?.result) {
                            const result = verification[0].result;
                            console.log(`BULK PROCESSING: Page load check ${pageLoadAttempts}: readyState=${result.readyState}, hasLikeButton=${result.hasLikeButton}`);
                            
                            if (result.isLoaded || result.hasLikeButton) {
                                pageLoaded = true;
                                console.log('BULK PROCESSING: Post page verified as loaded');
                            } else if (pageLoadAttempts < maxLoadRetries) {
                                console.log(`BULK PROCESSING: Post page not ready yet, waiting... (attempt ${pageLoadAttempts}/${maxLoadRetries})`);
                            }
                        }
                    } catch (error) {
                        console.warn(`BULK PROCESSING: Error verifying page load on attempt ${pageLoadAttempts}:`, error);
                    }
                }
                
                if (!pageLoaded) {
                    console.warn('⚠️ BULK PROCESSING: Post page may not be fully loaded, continuing anyway...');
                }
                
                // Perform actions
                let actionResults = {
                    liked: false,
                    commented: false,
                    shared: false,
                    followed: false
                };
                
                // Check stop flag before like action
                if (stopProcessingFlag) {
                    console.log("BULK PROCESSING: Stopped by user before like action");
                    await chrome.storage.local.set({ liveProgress: { active: false }, bulkProcessingActive: false });
                    try { await chrome.tabs.remove(postTab.id); } catch (e) {}
                    await recordSession('stopped', processedCount);
                    return { success: true, stopped: true, processed: processedCount, message: `Processing stopped. Completed ${processedCount} posts.` };
                }
                
                // Like post with retry
                if (actions.like) {
                    const beforeLikeDelay = (delaySettings.beforeLikeDelay || 2) * 1000;
                    console.log(`⏱️ BULK PROCESSING: Waiting ${beforeLikeDelay/1000}s before liking...`);
                    liveLog.delay('automation', Math.round(beforeLikeDelay/1000), 'before like action');
                    await new Promise(resolve => setTimeout(resolve, beforeLikeDelay));
                    
                    let likeAttempts = 0;
                    const maxLikeRetries = 3;
                    let likeSuccess = false;
                    
                    while (!likeSuccess && likeAttempts < maxLikeRetries) {
                        likeAttempts++;
                        console.log(`👍 BULK PROCESSING: Liking post ${postData.urn} (attempt ${likeAttempts}/${maxLikeRetries})`);
                        
                        try {
                            // Verify tab still exists
                            const tab = await chrome.tabs.get(postTab.id);
                            if (!tab) {
                                console.error(`❌ BULK PROCESSING: Tab ${postTab.id} no longer exists`);
                                break;
                            }
                            
                            await chrome.scripting.executeScript({
                                target: { tabId: postTab.id },
                                func: () => {
                                    const likeButton = document.querySelector('button[aria-label*="React Like"], button[data-control-name="like"]');
                                    if (likeButton && !likeButton.classList.contains('active')) {
                                        likeButton.click();
                                        return true;
                                    }
                                    return false;
                                }
                            });
                            
                            actionResults.liked = true;
                            likeSuccess = true;
                            console.log(`✅ BULK PROCESSING: Liked post ${postData.urn}`);
                            await broadcastStatus(`👍 Liked post ${i + 1}/${allPostUrns.length}`, 'success');
                            liveLog.like('automation', `Liked post ${i + 1}/${allPostUrns.length}`, { postUrn: postData.urn });
                            
                            // Record statistics and track backend usage
                            try {
                                await backgroundStatistics.recordLike(postData.urn);
                                console.log(`📊 BULK PROCESSING: Recorded like statistics for ${postData.urn}`);
                            } catch (statError) {
                                console.error(`⚠️ BULK PROCESSING: Failed to record statistics:`, statError.message);
                                if (statError.message.includes('limit reached')) {
                                    console.error(`🚫 BULK PROCESSING: ${statError.message} - Stopping automation`);
                                    throw statError; // Stop processing if limit reached
                                }
                            }
                            
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        } catch (error) {
                            console.error(`❌ BULK PROCESSING: Failed to like post (attempt ${likeAttempts}):`, error.message);
                            if (error.message.includes('No tab with id')) {
                                console.log(`🚫 BULK PROCESSING: Tab ${postTab.id} was closed, skipping remaining actions`);
                                break;
                            }
                            if (likeAttempts < maxLikeRetries) {
                                console.log(`🔄 BULK PROCESSING: Retrying like in 2 seconds...`);
                                await new Promise(resolve => setTimeout(resolve, 2000));
                            }
                        }
                    }
                    
                    if (!likeSuccess) {
                        console.warn(`⚠️ BULK PROCESSING: Failed to like post after ${maxLikeRetries} attempts`);
                    }
                }
                
                // Comment on post with AI-generated comment
                if (actions.comment) {
                    const beforeCommentDelay = (delaySettings.beforeCommentDelay || 3) * 1000;
                    console.log(`⏱️ BULK PROCESSING: Waiting ${beforeCommentDelay/1000}s before commenting...`);
                    liveLog.delay('automation', Math.round(beforeCommentDelay/1000), 'before comment action');
                    await new Promise(resolve => setTimeout(resolve, beforeCommentDelay));
                    
                    console.log(`💬 BULK PROCESSING: Generating AI comment for post ${postData.urn}`);
                    try {
                        // Get comment settings
                        const storage = await chrome.storage.local.get(['commentSettings']);
                        const commentSettings = storage.commentSettings || {
                            goal: 'AddValue',
                            tone: 'Professional',
                            commentLength: 'Short',
                            userExpertise: '',
                            userBackground: ''
                        };
                        
                        // Execute script to click comment button, scrape content, generate AI comment, and post
                        const commentResult = await chrome.scripting.executeScript({
                            target: { tabId: postTab.id },
                            func: async (commentSettings) => {
                                try {
                                    console.log('💬 COMMENT SCRIPT: Starting AI comment generation...');
                                    
                                    // Helper function to get author name (same as feedScraper.js)
                                    const getAuthorName = (container) => {
                                        // Strategy 1: aria-label patterns
                                        const potentialLinks = container.querySelectorAll('a[aria-label]');
                                        for (const link of potentialLinks) {
                                            const rawLabel = link.getAttribute('aria-label');
                                            if (!rawLabel) continue;
                                            const patterns = [
                                                /^View\s+(.+?)['']s\s+profile/i,
                                                /^View\s+(.+?)['']s/i,
                                                /^(.+?)['']s\s+profile/i
                                            ];
                                            for (const pattern of patterns) {
                                                const nameMatch = rawLabel.match(pattern);
                                                if (nameMatch && nameMatch[1]) {
                                                    const name = nameMatch[1].trim();
                                                    if (name.length > 1 && !name.toLowerCase().includes('comment')) {
                                                        return name.split(' ')[0];
                                                    }
                                                }
                                            }
                                        }
                                        // Strategy 2: Direct selectors
                                        const selectors = [
                                            '.update-components-actor__name span[aria-hidden="true"]',
                                            '.feed-shared-actor__name',
                                            '.update-components-actor__title'
                                        ];
                                        for (const selector of selectors) {
                                            const el = container.querySelector(selector);
                                            if (el && el.textContent?.trim().length > 1) {
                                                return el.textContent.trim().split(' ')[0];
                                            }
                                        }
                                        return 'there';
                                    };

                                    // Helper function to get post text
                                    const getPostText = (container) => {
                                        const textElement = container.querySelector('.update-components-text');
                                        if (textElement) {
                                            return textElement.innerText.trim().substring(0, 500);
                                        }
                                        const fallbacks = ['.feed-shared-update-v2__description', '.feed-shared-text'];
                                        for (const sel of fallbacks) {
                                            const el = container.querySelector(sel);
                                            if (el && el.innerText.trim().length > 10) {
                                                return el.innerText.trim().substring(0, 500);
                                            }
                                        }
                                        return 'Interesting professional content';
                                    };

                                    // Find post container
                                    const post = document.querySelector('[data-urn*="urn:li:activity"]') || 
                                                document.querySelector('.feed-shared-update-v2') ||
                                                document.body;
                                    
                                    // Click comment button
                                    const commentButton = document.querySelector('button[aria-label*="Comment"], button[data-control-name="comment"]');
                                    if (!commentButton) {
                                        return { success: false, error: 'Comment button not found' };
                                    }
                                    
                                    commentButton.click();
                                    await new Promise(r => setTimeout(r, 2000));
                                    
                                    // Find comment box
                                    let commentBox = document.querySelector('div[data-placeholder]');
                                    if (!commentBox) {
                                        commentBox = document.querySelector('div.ql-editor, div[contenteditable="true"]');
                                    }
                                    
                                    if (!commentBox) {
                                        return { success: false, error: 'Comment box not found' };
                                    }
                                    
                                    // Scrape post content
                                    const postText = getPostText(post);
                                    const authorName = getAuthorName(post);
                                    
                                    console.log(`💬 COMMENT SCRIPT: Post by "${authorName}": "${postText.substring(0, 50)}..."`);
                                    
                                    // Generate AI comment via background script
                                    let commentText = '';
                                    try {
                                        const response = await new Promise((resolve, reject) => {
                                            chrome.runtime.sendMessage({
                                                action: 'generateCommentFromContent',
                                                postText: postText,
                                                authorName: authorName,
                                                goal: commentSettings.goal || 'AddValue',
                                                tone: commentSettings.tone || 'Professional',
                                                commentLength: commentSettings.commentLength || 'Short',
                                                userExpertise: commentSettings.userExpertise || '',
                                                userBackground: commentSettings.userBackground || ''
                                            }, (response) => {
                                                if (chrome.runtime.lastError) {
                                                    reject(chrome.runtime.lastError);
                                                } else {
                                                    resolve(response);
                                                }
                                            });
                                        });
                                        
                                        if (response && response.success && response.comment) {
                                            commentText = response.comment;
                                            console.log(`💬 COMMENT SCRIPT: AI generated: "${commentText.substring(0, 50)}..."`);
                                        }
                                    } catch (aiError) {
                                        console.error('💬 COMMENT SCRIPT: AI generation failed:', aiError);
                                    }
                                    
                                    // Fallback if AI failed
                                    if (!commentText) {
                                        const templates = [
                                            `Great insights, ${authorName}! Thanks for sharing.`,
                                            `Really valuable content. Appreciate this, ${authorName}!`,
                                            `Excellent points! Looking forward to more.`
                                        ];
                                        commentText = templates[Math.floor(Math.random() * templates.length)];
                                    }
                                    
                                    // Insert comment
                                    commentBox.focus();
                                    commentBox.innerHTML = `<p>${commentText}</p>`;
                                    commentBox.dispatchEvent(new Event('input', { bubbles: true }));
                                    
                                    await new Promise(r => setTimeout(r, 1500));
                                    
                                    // Find and click submit button
                                    const submitSelectors = [
                                        'button.comments-comment-box__submit-button:not(:disabled)',
                                        'button.comments-comment-box__submit-button--cr:not(:disabled)',
                                        '.comments-comment-box button.artdeco-button--primary:not(:disabled)'
                                    ];
                                    
                                    let submitBtn = null;
                                    for (const selector of submitSelectors) {
                                        submitBtn = document.querySelector(selector);
                                        if (submitBtn) break;
                                    }
                                    
                                    if (submitBtn) {
                                        submitBtn.click();
                                        console.log('💬 COMMENT SCRIPT: Comment submitted!');
                                        await new Promise(r => setTimeout(r, 2000));
                                        return { success: true, comment: commentText, authorName, postText };
                                    } else {
                                        return { success: false, error: 'Submit button not found' };
                                    }
                                    
                                } catch (err) {
                                    return { success: false, error: err.message };
                                }
                            },
                            args: [commentSettings]
                        });
                        
                        const result = commentResult && commentResult[0] && commentResult[0].result;
                        if (result && result.success) {
                            actionResults.commented = true;
                            console.log(`BULK PROCESSING: ✅ Posted AI comment on ${postData.urn}`);
                            await broadcastStatus(`💬 Commented on post ${i + 1}/${allPostUrns.length}`, 'success');
                            liveLog.comment('automation', `Commented on post ${i + 1}/${allPostUrns.length}: "${(result.comment || '').substring(0, 60)}..."`, { postUrn: postData.urn });
                            
                            // Save automation post record for analytics display
                            await saveAutomationPostRecord({
                                keywords: Array.isArray(settings.keywords) ? settings.keywords.join(', ') : settings.keywords,
                                authorName: result.authorName || 'Unknown',
                                postContent: result.postText || '',
                                generatedComment: result.comment || '',
                                actions: {
                                    liked: actionResults.liked,
                                    commented: true,
                                    shared: actionResults.shared,
                                    followed: actionResults.followed
                                },
                                status: 'success',
                                postUrn: postData.urn
                            });
                            
                            // Record statistics and track backend usage
                            try {
                                await backgroundStatistics.recordComment(postData.urn, result.comment || 'AI comment', '', result.authorName || '');
                                console.log(`📊 BULK PROCESSING: Recorded comment statistics for ${postData.urn}`);
                            } catch (statError) {
                                console.error(`⚠️ BULK PROCESSING: Failed to record statistics:`, statError.message);
                                if (statError.message.includes('limit reached')) {
                                    console.error(`🚫 BULK PROCESSING: ${statError.message} - Stopping automation`);
                                    throw statError;
                                }
                            }
                        } else {
                            console.error(`BULK PROCESSING: ❌ Failed to comment: ${result?.error || 'Unknown error'}`);
                        }
                        
                        // Small delay after commenting before next action (not the full commentDelay)
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    } catch (error) {
                        console.error(`BULK PROCESSING: Failed to comment on post:`, error);
                        if (error.message.includes('No tab with id')) {
                            console.log(`BULK PROCESSING: Tab ${postTab.id} was closed, skipping remaining actions`);
                        }
                    }
                }
                
                // Share/Repost post (same as import automation)
                if (actions.share) {
                    const beforeShareDelay = (delaySettings.beforeShareDelay || 2) * 1000;
                    console.log(`⏱️ BULK PROCESSING: Waiting ${beforeShareDelay/1000}s before resharing...`);
                    liveLog.delay('automation', Math.round(beforeShareDelay/1000), 'before share action');
                    await new Promise(resolve => setTimeout(resolve, beforeShareDelay));
                    
                    console.log(`🔄 BULK PROCESSING: Resharing post ${postData.urn}`);
                    try {
                        const shareResult = await chrome.scripting.executeScript({
                            target: { tabId: postTab.id },
                            func: async () => {
                                try {
                                    console.log('🔍 SHARE: Looking for share/repost button...');
                                    
                                    // Find the share/repost button
                                    let shareButton = document.querySelector('button[aria-label*="Repost"]');
                                    if (!shareButton) {
                                        shareButton = document.querySelector('button.social-reshare-button');
                                    }
                                    if (!shareButton) {
                                        shareButton = document.querySelector('button[aria-label*="Share"]');
                                    }
                                    if (!shareButton) {
                                        shareButton = document.querySelector('button[data-control-name="share_toggle"]');
                                    }
                                    
                                    if (!shareButton) {
                                        console.error('❌ SHARE: No share button found');
                                        return { success: false, error: 'Share button not found' };
                                    }
                                    
                                    console.log('✅ SHARE: Clicking share button...');
                                    shareButton.click();
                                    
                                    // Wait for dropdown to appear
                                    await new Promise(r => setTimeout(r, 1500));
                                    
                                    // Click "Instant Repost" option in the dropdown
                                    // STRATEGY 1: Exact CSS Path - targets 2nd list item (Instant Repost)
                                    let repostOption = document.querySelector('li:nth-child(2) div.artdeco-dropdown__item');
                                    
                                    // STRATEGY 2: Text Content Search (Fallback)
                                    if (!repostOption) {
                                        console.log('⚠️ SHARE: Exact selector failed, trying text search...');
                                        const items = document.querySelectorAll('.artdeco-dropdown__item, [role="menuitem"]');
                                        for (const item of items) {
                                            const text = item.innerText.toLowerCase();
                                            // Search for 'instant' which only appears in the Instant Repost option
                                            if (text.includes('instant')) {
                                                repostOption = item;
                                                break;
                                            }
                                        }
                                    }
                                    
                                    if (repostOption) {
                                        console.log('✅ SHARE: Found Instant Repost option, clicking...');
                                        repostOption.click();
                                        await new Promise(r => setTimeout(r, 1500));
                                        return { success: true };
                                    } else {
                                        console.log('⚠️ SHARE: Repost dropdown option not found, share button was clicked');
                                        return { success: true, partial: true };
                                    }
                                    
                                } catch (err) {
                                    return { success: false, error: err.message };
                                }
                            }
                        });
                        
                        const result = shareResult && shareResult[0] && shareResult[0].result;
                        if (result && result.success) {
                            actionResults.shared = true;
                            console.log(`BULK PROCESSING: ✅ Reposted ${postData.urn}`);
                            liveLog.share('automation', `Reposted post ${i + 1}/${allPostUrns.length}`, { postUrn: postData.urn });
                            
                            // Record statistics and track backend usage
                            try {
                                await backgroundStatistics.recordShare(postData.urn);
                                console.log(`📊 BULK PROCESSING: Recorded share statistics for ${postData.urn}`);
                            } catch (statError) {
                                console.error(`⚠️ BULK PROCESSING: Failed to record statistics:`, statError.message);
                                if (statError.message.includes('limit reached')) {
                                    console.error(`🚫 BULK PROCESSING: ${statError.message} - Stopping automation`);
                                    throw statError;
                                }
                            }
                            
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        } else {
                            console.warn(`⚠️ BULK PROCESSING: Share failed for ${postData.urn}: ${result?.error || 'Unknown'}`);
                        }
                    } catch (error) {
                        console.error(`BULK PROCESSING: Failed to share post:`, error);
                        if (error.message.includes('No tab with id')) {
                            console.log(`BULK PROCESSING: Tab ${postTab.id} was closed, skipping remaining actions`);
                        }
                    }
                }
                
                // Follow author
                if (actions.follow) {
                    const beforeFollowDelay = (delaySettings.beforeFollowDelay || 2) * 1000;
                    console.log(`⏱️ BULK PROCESSING: Waiting ${beforeFollowDelay/1000}s before following...`);
                    liveLog.delay('automation', Math.round(beforeFollowDelay/1000), 'before follow action');
                    await new Promise(resolve => setTimeout(resolve, beforeFollowDelay));
                    
                    console.log(`➕ BULK PROCESSING: Following author of post ${postData.urn}`);
                    try {
                        const followResult = await chrome.scripting.executeScript({
                            target: { tabId: postTab.id },
                            func: () => {
                                console.log('🔍 FOLLOW: Looking for follow button...');
                                
                                // Multiple selectors for follow button on post pages
                                const followSelectors = [
                                    'button[aria-label*="Follow"]:not([aria-label*="Following"])',
                                    'button.follow-button',
                                    'button[data-control-name="follow"]',
                                    '.feed-shared-actor__sub-description button',
                                    '.update-components-actor button[aria-label*="Follow"]',
                                    'button.artdeco-button--secondary[aria-label*="Follow"]'
                                ];
                                
                                let followButton = null;
                                for (const selector of followSelectors) {
                                    followButton = document.querySelector(selector);
                                    if (followButton) {
                                        console.log(`🔍 FOLLOW: Found with selector: ${selector}`);
                                        break;
                                    }
                                }
                                
                                // If not found, look for any button with "Follow" text that's not "Following"
                                if (!followButton) {
                                    const allButtons = document.querySelectorAll('button');
                                    for (const btn of allButtons) {
                                        const text = btn.textContent?.trim().toLowerCase();
                                        const ariaLabel = btn.getAttribute('aria-label')?.toLowerCase() || '';
                                        if ((text === 'follow' || ariaLabel.includes('follow')) && 
                                            !text.includes('following') && !ariaLabel.includes('following')) {
                                            followButton = btn;
                                            console.log('🔍 FOLLOW: Found by text content');
                                            break;
                                        }
                                    }
                                }
                                
                                if (followButton) {
                                    // Check if already following
                                    const buttonText = followButton.textContent?.trim().toLowerCase();
                                    const ariaLabel = followButton.getAttribute('aria-label')?.toLowerCase() || '';
                                    const isFollowing = buttonText === 'following' || 
                                                       ariaLabel.includes('following') ||
                                                       followButton.classList.contains('artdeco-button--primary');
                                    
                                    console.log(`🔍 FOLLOW: Button text: "${buttonText}", Already following: ${isFollowing}`);
                                    
                                    if (!isFollowing) {
                                        console.log('✅ FOLLOW: Clicking follow button...');
                                        followButton.click();
                                        return { success: true };
                                    } else {
                                        console.log('ℹ️ FOLLOW: Already following this author');
                                        return { success: true, alreadyFollowing: true };
                                    }
                                }
                                
                                console.error('❌ FOLLOW: No follow button found on page');
                                return { success: false, error: 'Follow button not found' };
                            }
                        });
                        
                        const result = followResult && followResult[0] && followResult[0].result;
                        if (result && result.success) {
                            actionResults.followed = true;
                            console.log(`BULK PROCESSING: ✅ Followed author of post ${postData.urn}`);
                            liveLog.follow('automation', `Followed author of post ${i + 1}/${allPostUrns.length}`, { postUrn: postData.urn });
                            
                            // Record statistics and track backend usage
                            try {
                                await backgroundStatistics.recordFollow('Unknown Author');
                                console.log(`📊 BULK PROCESSING: Recorded follow statistics for ${postData.urn}`);
                            } catch (statError) {
                                console.error(`⚠️ BULK PROCESSING: Failed to record statistics:`, statError.message);
                                if (statError.message.includes('limit reached')) {
                                    console.error(`🚫 BULK PROCESSING: ${statError.message} - Stopping automation`);
                                    throw statError; // Stop processing if limit reached
                                }
                            }
                            
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        } else {
                            console.warn(`⚠️ BULK PROCESSING: Follow button not found for ${postData.urn}`);
                        }
                    } catch (error) {
                        console.error(`BULK PROCESSING: Failed to follow author:`, error);
                        if (error.message.includes('No tab with id')) {
                            console.log(`BULK PROCESSING: Tab ${postTab.id} was closed, skipping remaining actions`);
                            continue;
                        }
                    }
                }
                
                // Save record for posts that were only liked (no comment was posted)
                if (actionResults.liked && !actionResults.commented) {
                    await saveAutomationPostRecord({
                        keywords: Array.isArray(settings.keywords) ? settings.keywords.join(', ') : settings.keywords,
                        authorName: postData.authorName || 'Unknown',
                        postContent: postData.text || '',
                        generatedComment: '',
                        actions: {
                            liked: actionResults.liked,
                            commented: false,
                            shared: actionResults.shared,
                            followed: actionResults.followed
                        },
                        status: 'success',
                        postUrn: postData.urn
                    });
                }
                
                // Close tab
                try {
                    await chrome.tabs.remove(postTab.id);
                    console.log(`BULK PROCESSING: Closed tab ${postTab.id}`);
                } catch (error) {
                    console.warn(`BULK PROCESSING: Failed to close tab ${postTab.id}:`, error);
                }
                
                processedCount++;
                console.log(`BULK PROCESSING: Completed post ${i + 1}/${allPostUrns.length} - Actions: ${JSON.stringify(actionResults)}`);
                liveLog.info('automation', `✅ Post ${i + 1}/${allPostUrns.length} done — ${[actionResults.liked&&'👍',actionResults.commented&&'💬',actionResults.shared&&'🔄',actionResults.followed&&'➕'].filter(Boolean).join(' ') || 'no actions'}`);
                
                // Wait between posts — apply random jitter from Limits tab
                if (i < allPostUrns.length - 1) {
                    let betweenPostDelay;
                    if (actionResults.commented) {
                        // Use comment delay range from Limits tab
                        const minDelay = (delaySettings.commentMinDelay || 60) * 1000;
                        const maxDelay = (delaySettings.commentMaxDelay || 180) * 1000;
                        betweenPostDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
                    } else {
                        // Use search delay range from Limits tab for non-comment posts
                        const minDelay = (delaySettings.searchMinDelay || 30) * 1000;
                        const maxDelay = (delaySettings.searchMaxDelay || 60) * 1000;
                        betweenPostDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
                    }
                    // Apply random jitter on top if enabled
                    betweenPostDelay = applyRandomJitter(betweenPostDelay, 'betweenPosts');
                    const delaySec = Math.round(betweenPostDelay / 1000);
                    console.log(`⏱️ BULK PROCESSING: Waiting ${delaySec}s before next post (random jitter: ${randomDelayEnabled ? 'ON' : 'OFF'})...`);
                    liveLog.delay('automation', delaySec, 'between posts');
                    for (let remaining = delaySec; remaining > 0; remaining -= 5) {
                        if (stopProcessingFlag) break;
                        await broadcastStatus(`⏳ Next post in ${remaining}s...`, 'info');
                        await new Promise(resolve => setTimeout(resolve, Math.min(5000, remaining * 1000)));
                    }
                }
                
            } catch (error) {
                console.error(`BULK PROCESSING: Error processing post ${postData.urn}:`, error);
            }
        }
        
        console.log(`BULK PROCESSING: Processing complete! Processed ${processedCount}/${allPostUrns.length} posts.`);
        await broadcastStatus(`🎉 Complete! Processed ${processedCount} posts`, 'success', false);
        liveLog.stop('automation', `✅ Bulk processing complete — ${processedCount}/${allPostUrns.length} posts processed`);
        
        // Clear processing state
        await chrome.storage.local.set({ bulkProcessingActive: false });
        
        // Record successful session
        await recordSession('completed', processedCount);
        
        return {
            success: true,
            message: `Bulk processing completed successfully! Processed ${processedCount} posts.`,
            processed: processedCount,
            total: allPostUrns.length
        };
        
    } catch (error) {
        console.error('🚨 BULK PROCESSING: Fatal error:', error);
        liveLog.error('automation', `🚨 Fatal error: ${error.message}`);
        // Clear processing state
        await chrome.storage.local.set({ bulkProcessingActive: false });
        
        // Record failed session
        await recordSession('failed', processedCount, error.message);
        
        return {
            success: false,
            error: error.message
        };
    } finally {
        // Always reset processing flag
        isProcessing = false;
        console.log("✅ BULK PROCESSING: Processing flag reset");
        
        // Clear live progress and processing active flag
        await chrome.storage.local.set({ 
            liveProgress: { active: false },
            bulkProcessingActive: false 
        });
        console.log("✅ BULK PROCESSING: Live progress cleared");
    }
}
