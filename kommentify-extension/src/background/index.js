// Clean service worker - all features working
console.log("BACKGROUND: Starting clean service worker...");

// Console log capture for Progress tab
const consoleLogBuffer = [];
const MAX_LOG_BUFFER = 500;

// Override console.log to capture logs
const originalConsoleLog = console.log;
console.log = function(...args) {
    // Call original console.log
    originalConsoleLog.apply(console, args);
    
    // Capture log message
    const message = args.map(arg => {
        if (typeof arg === 'object') {
            try {
                return JSON.stringify(arg);
            } catch (e) {
                return String(arg);
            }
        }
        return String(arg);
    }).join(' ');
    
    // Add to buffer
    consoleLogBuffer.unshift({
        timestamp: new Date().toISOString(),
        message: message
    });
    
    // Keep buffer size limited
    if (consoleLogBuffer.length > MAX_LOG_BUFFER) {
        consoleLogBuffer.pop();
    }
};

// Override console.error to capture errors
const originalConsoleError = console.error;
console.error = function(...args) {
    originalConsoleError.apply(console, args);
    
    const message = '❌ ERROR: ' + args.map(arg => String(arg)).join(' ');
    consoleLogBuffer.unshift({
        timestamp: new Date().toISOString(),
        message: message
    });
    
    if (consoleLogBuffer.length > MAX_LOG_BUFFER) {
        consoleLogBuffer.pop();
    }
};

// Override console.warn to capture warnings
const originalConsoleWarn = console.warn;
console.warn = function(...args) {
    originalConsoleWarn.apply(console, args);
    
    const message = '⚠️ WARNING: ' + args.map(arg => String(arg)).join(' ');
    consoleLogBuffer.unshift({
        timestamp: new Date().toISOString(),
        message: message
    });
    
    if (consoleLogBuffer.length > MAX_LOG_BUFFER) {
        consoleLogBuffer.pop();
    }
};

// Import all modules synchronously
import { iconSwitcher } from './iconSwitcher.js';
import { browser } from '../shared/utils/browser.js';
import { storage } from '../shared/storage/storage.background.js';
import { randomDelay } from '../shared/utils/helpers.js';
import { profileScraper } from './profileScraper.js';
import { publishComment, likePost, postToLinkedIn } from './automationExecutor.js';
import { advancedAutomation } from './advancedAutomation.js';
import { postWriter } from '../shared/api/postWriter.js';
import { backgroundStatistics } from './statisticsManager.js';
import { contentManager } from '../shared/utils/contentManager.js';
import { generateCommentWithOpenAI, generatePostWithOpenAI, generateWithAI } from '../shared/utils/openaiConfig.js';
import { scrapePostContent } from './postScraper.js';
import { scrapePostsFromSearch, keywordToSearchUrl, urnToPostUrl } from './keywordScraper.js';
import { PostScheduler } from '../post-scheduler.js';
import { peopleSearchAutomation } from './peopleSearchAutomation.js';
import { importAutomation } from './importAutomation.js';
import { trendingContentGenerator } from './trendingContentGenerator.js';
import { featureChecker } from '../shared/utils/featureChecker.js';
import { businessHoursScheduler } from './businessHoursScheduler.js';
import { scrapePostsFromSearchEnhanced, ServiceWorkerKeepAlive } from './enhancedScraper.js';
import { bulkScheduler } from './bulkScheduler.js';
import { peopleSearchScheduler } from './peopleSearchScheduler.js';
import { importScheduler } from './importScheduler.js';
import { executeBulkProcessing, stopBulkProcessing } from './bulkProcessingExecutor.js';
import { API_CONFIG } from '../shared/config.js';
import { versionChecker } from './versionChecker.js';

// Force-clean old cached apiBaseUrl on startup (prevents hitting old backend URLs)
(async () => {
    try {
        const { apiBaseUrl } = await chrome.storage.local.get('apiBaseUrl');
        if (apiBaseUrl && (apiBaseUrl.includes('backend-buxx') || apiBaseUrl.includes('backend-api-orcin') || apiBaseUrl.includes('backend-4poj'))) {
            console.log('BACKGROUND: Clearing stale apiBaseUrl:', apiBaseUrl);
            await chrome.storage.local.set({ apiBaseUrl: API_CONFIG.BASE_URL });
        }
    } catch (e) { console.warn('BACKGROUND: Could not clean apiBaseUrl:', e); }
})();

// Initialize immediately
try {
    iconSwitcher.registerChanges();
    console.log("BACKGROUND: Service worker initialized successfully");
} catch (error) {
    console.error("BACKGROUND: Error during initialization:", error);
}

// Initialize Post Scheduler
let postScheduler = null;
try {
    postScheduler = new PostScheduler();
    postScheduler.start();
    console.log("BACKGROUND: Post scheduler initialized");
} catch (error) {
    console.error("BACKGROUND: Failed to initialize post scheduler:", error);
}

// Initialize keep-alive mechanism
const keepAlive = new ServiceWorkerKeepAlive();
keepAlive.start();

// Initialize version checker to check for updates on startup
try {
    versionChecker.initialize();
    console.log("BACKGROUND: Version checker initialized");
} catch (error) {
    console.error("BACKGROUND: Failed to initialize version checker:", error);
}

console.log("BACKGROUND: All modules loaded and ready");

// Helper function to wait for content to load
async function waitForContentLoad(tabId, maxWaitTime = 10000) {
    const startTime = Date.now();
    const checkInterval = 500; // Check every 500ms
    
    while (Date.now() - startTime < maxWaitTime) {
        try {
            const results = await chrome.scripting.executeScript({
                target: { tabId },
                func: () => {
                    // Check if page has basic LinkedIn structure
                    const hasMainContent = document.querySelector('main') || document.querySelector('.scaffold-layout__main');
                    const hasPosts = document.querySelectorAll('[data-id^="urn:li:activity:"]').length > 0;
                    const hasLoading = document.querySelector('.scaffold-layout__show-more') || 
                                     document.querySelector('.feed-skeleton') ||
                                     document.querySelector('[data-test-id="loading"]');
                    
                    return {
                        hasMainContent: !!hasMainContent,
                        hasPosts,
                        hasLoading: !!hasLoading,
                        ready: hasMainContent && !hasLoading
                    };
                }
            });
            
            const state = results[0]?.result;
            if (state?.ready) {
                console.log('BACKGROUND: Page content loaded successfully');
                return true;
            }
            
            if (state?.hasPosts) {
                console.log('BACKGROUND: Posts found, proceeding with scrape');
                return true;
            }
            
            console.log(`BACKGROUND: Waiting for content... hasMain: ${state?.hasMainContent}, hasPosts: ${state?.hasPosts}, hasLoading: ${state?.hasLoading}`);
        } catch (error) {
            console.warn('BACKGROUND: Error checking content load:', error);
        }
        
        await new Promise(resolve => setTimeout(resolve, checkInterval));
    }
    
    console.log('BACKGROUND: Content load timeout, proceeding anyway');
    return false;
}

// Helper function to scroll and load content
async function scrollAndLoadContent(tabId, maxAttempts = 3) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            console.log(`BACKGROUND: Scroll attempt ${attempt}/${maxAttempts}`);
            
            await chrome.scripting.executeScript({
                target: { tabId },
                func: () => {
                    // Smooth scroll to bottom
                    window.scrollTo({
                        top: document.body.scrollHeight,
                        behavior: 'smooth'
                    });
                }
            });
            
            // Wait for content to load after scroll
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Check if new posts loaded
            const results = await chrome.scripting.executeScript({
                target: { tabId },
                func: () => {
                    const posts = document.querySelectorAll('[data-id^="urn:li:activity:"]');
                    return {
                        postCount: posts.length,
                        hasMore: document.querySelector('.scaffold-layout__show-more') !== null
                    };
                }
            });
            
            const state = results[0]?.result;
            console.log(`BACKGROUND: After scroll ${attempt}: ${state?.postCount} posts found`);
            
        } catch (error) {
            console.warn(`BACKGROUND: Scroll attempt ${attempt} failed:`, error);
        }
    }
}

// --- MESSAGE LISTENERS ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("BACKGROUND: Received message:", request.action);

    // Ping test
    if (request.action === "ping") {
        sendResponse({ success: true, message: "Service worker is active" });
        return true;
    }
    
    // Check for extension updates
    if (request.action === "checkForUpdates") {
        (async () => {
            try {
                console.log('BACKGROUND: Checking for extension updates...');
                const result = await versionChecker.checkForUpdates();
                sendResponse({ success: true, ...result });
            } catch (error) {
                console.error('BACKGROUND: Error checking for updates:', error);
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }
    
    // Get stored update info
    if (request.action === "getStoredUpdateInfo") {
        (async () => {
            try {
                const updateInfo = await versionChecker.getStoredUpdateInfo();
                const { lastVersionCheck, currentExtensionVersion } = await chrome.storage.local.get(['lastVersionCheck', 'currentExtensionVersion']);
                sendResponse({ 
                    success: true, 
                    updateInfo,
                    lastCheck: lastVersionCheck,
                    currentVersion: currentExtensionVersion || chrome.runtime.getManifest().version
                });
            } catch (error) {
                console.error('BACKGROUND: Error getting update info:', error);
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }
    
    // Open download page
    if (request.action === "openDownloadPage") {
        (async () => {
            try {
                await versionChecker.openDownloadPage(request.downloadUrl);
                sendResponse({ success: true });
            } catch (error) {
                console.error('BACKGROUND: Error opening download page:', error);
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }
    
    // Clear stored update info (after user updates)
    if (request.action === "clearUpdateInfo") {
        (async () => {
            try {
                await versionChecker.clearUpdateInfo();
                sendResponse({ success: true });
            } catch (error) {
                console.error('BACKGROUND: Error clearing update info:', error);
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }
    
    // Get processing state - check if any automation is currently running
    if (request.action === "getProcessingState") {
        (async () => {
            try {
                // Check bulk processing state
                const bulkState = await chrome.storage.local.get(['bulkProcessingActive', 'bulkProcessingType']);
                if (bulkState.bulkProcessingActive) {
                    sendResponse({ 
                        isProcessing: true, 
                        processingType: bulkState.bulkProcessingType || 'bulk_processing' 
                    });
                    return;
                }
                
                // Check people search state
                const peopleState = await chrome.storage.local.get(['peopleSearchActive']);
                if (peopleState.peopleSearchActive) {
                    sendResponse({ isProcessing: true, processingType: 'people_search' });
                    return;
                }
                
                // Check import automation state
                const importState = await chrome.storage.local.get(['importAutomationActive']);
                if (importState.importAutomationActive) {
                    sendResponse({ isProcessing: true, processingType: 'import' });
                    return;
                }
                
                // No processing active
                sendResponse({ isProcessing: false, processingType: null });
            } catch (error) {
                console.error('BACKGROUND: Error checking processing state:', error);
                sendResponse({ isProcessing: false, processingType: null, error: error.message });
            }
        })();
        return true;
    }

    // Generate AI Comment for posts (from AI button in content script)
    if (request.action === "generateAIComment") {
        const _bridgeRequestId = request._bridgeRequestId;
        const _senderTabId = sender?.tab?.id;
        (async () => {
            try {
                console.log('🤖 BACKGROUND: Generating AI comment from AI button...');
                console.log('BACKGROUND: Author:', request.authorName);
                console.log('BACKGROUND: Post text length:', request.postText?.length || 0);
                console.log('BACKGROUND: bridgeRequestId:', _bridgeRequestId, 'senderTabId:', _senderTabId);
                
                // Check if AI comment feature is allowed in plan
                const canUseAiComment = await featureChecker.checkFeature('autoComment');
                if (!canUseAiComment) {
                    console.error("❌ BACKGROUND: AI comment feature not allowed in current plan");
                    const errResp = { 
                        success: false, 
                        error: 'AI comment generation is not available in your plan. Please upgrade!',
                        requiresUpgrade: true
                    };
                    sendResponse(errResp);
                    if (_senderTabId && _bridgeRequestId) {
                        try { chrome.tabs.sendMessage(_senderTabId, { type: 'AI_COMMENT_RESULT', _bridgeRequestId, data: errResp }); } catch(e) {}
                    }
                    return;
                }

                // Get auth token and API URL
                const storage = await chrome.storage.local.get(['authToken', 'apiBaseUrl', 'commentSettings']);
                const token = storage.authToken;
                let apiUrl = storage.apiBaseUrl;
                if (!apiUrl || apiUrl.includes('backend-buxx') || apiUrl.includes('backend-api-orcin') || apiUrl.includes('backend-4poj')) {
                    apiUrl = API_CONFIG.BASE_URL;
                }

                // Authentication is required
                if (!token) {
                    sendResponse({ success: false, error: 'Please login to use this feature' });
                    return;
                }

                // Use settings from request or defaults
                const storedSettings = storage.commentSettings || {};
                const finalGoal = request.goal || storedSettings.goal || 'AddValue';
                const finalTone = request.tone || storedSettings.tone || 'Friendly';
                const finalLength = request.length || storedSettings.commentLength || 'Short';
                const finalStyle = request.style || storedSettings.commentStyle || 'direct';
                
                console.log('⚙️ BACKGROUND: Using comment settings:', { goal: finalGoal, tone: finalTone, length: finalLength, style: finalStyle });

                // Use the same backend API as automation
                console.log('📡 BACKGROUND: Calling AI API...');
                const response = await fetch(`${apiUrl}/api/ai/generate-comment`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        postText: request.postText,
                        tone: finalTone,
                        goal: finalGoal,
                        commentLength: finalLength,
                        commentStyle: finalStyle,
                        userExpertise: storedSettings.userExpertise || '',
                        userBackground: storedSettings.userBackground || '',
                        authorName: request.authorName || 'there',
                        useProfileStyle: storedSettings.useProfileStyle === true
                    })
                });

                const data = await response.json();

                if (!response.ok || !data.success) {
                    console.error('BACKGROUND: Backend API error:', data.error || response.statusText);
                    sendResponse({ success: false, error: data.error || 'Failed to generate comment' });
                    return;
                }

                console.log('✅ BACKGROUND: Generated comment:', data.content);
                if (data.debug) {
                    console.log('🎨 BACKGROUND: Style debug info:', JSON.stringify(data.debug));
                }
                
                // Track AI comment generation
                if (data.content) {
                    try {
                        await backgroundStatistics.recordAiComment(data.content);
                    } catch (statError) {
                        console.warn('BACKGROUND: Failed to track AI comment:', statError);
                    }
                }
                
                const successResp = { success: true, comment: data.content };
                sendResponse(successResp);
                // FALLBACK: Also send via chrome.tabs.sendMessage (MV3 sendResponse can be unreliable)
                if (_senderTabId && _bridgeRequestId) {
                    try {
                        chrome.tabs.sendMessage(_senderTabId, { type: 'AI_COMMENT_RESULT', _bridgeRequestId, data: successResp });
                        console.log('📨 BACKGROUND: Sent fallback tabs.sendMessage to tab', _senderTabId);
                    } catch(e) { console.warn('BACKGROUND: Fallback tabs.sendMessage failed:', e); }
                }
            } catch (error) {
                console.error('❌ BACKGROUND: Error generating AI comment:', error);
                const errResp = { success: false, error: error.message };
                sendResponse(errResp);
                if (_senderTabId && _bridgeRequestId) {
                    try { chrome.tabs.sendMessage(_senderTabId, { type: 'AI_COMMENT_RESULT', _bridgeRequestId, data: errResp }); } catch(e) {}
                }
            }
        })();
        return true;
    }

    // Scrape Profile Posts for Inspiration Sources - Opens posts one by one for full content
    if (request.action === "scrapeProfilePosts") {
        (async () => {
            try {
                console.log('✨ BACKGROUND: Scraping profile posts for inspiration (post-by-post method)...');
                console.log('BACKGROUND: Profile URL:', request.profileUrl);
                console.log('BACKGROUND: Post count:', request.postCount);
                
                const profileUrl = request.profileUrl;
                const postCount = request.postCount || 10;
                
                // Extract username from URL
                const urlMatch = profileUrl.match(/linkedin\.com\/in\/([^\/\?]+)/);
                if (!urlMatch) {
                    sendResponse({ success: false, error: 'Invalid LinkedIn profile URL' });
                    return;
                }
                const username = urlMatch[1];
                
                // STEP 1: Open the profile's activity page to get post URLs
                const activityUrl = `https://www.linkedin.com/in/${username}/recent-activity/all/`;
                console.log('BACKGROUND: Opening activity page:', activityUrl);
                
                const activityTab = await chrome.tabs.create({ url: activityUrl, active: false });
                
                // Wait for page to load
                await waitForContentLoad(activityTab.id, 12000);
                
                // Scroll to load more posts
                await scrollAndLoadContent(activityTab.id, 3);
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // STEP 2: Extract post URNs and author name from activity page
                const extractResult = await chrome.scripting.executeScript({
                    target: { tabId: activityTab.id },
                    func: (maxPosts) => {
                        const postUrns = [];
                        
                        // Get author name from page
                        let authorName = 'Unknown Author';
                        const authorSelectors = [
                            '.update-components-actor__title span[dir="ltr"] span[aria-hidden="true"]',
                            '.feed-shared-actor__title span[aria-hidden="true"]',
                            'h1.text-heading-xlarge',
                            '.profile-top-card-person-list__name'
                        ];
                        
                        for (const selector of authorSelectors) {
                            const element = document.querySelector(selector);
                            if (element) {
                                authorName = element.textContent?.trim() || 'Unknown Author';
                                break;
                            }
                        }
                        
                        // Find all post elements with URNs
                        const postElements = document.querySelectorAll('[data-urn*="urn:li:activity:"], [data-id*="urn:li:activity:"]');
                        console.log(`Found ${postElements.length} posts with URNs`);
                        
                        for (const post of postElements) {
                            if (postUrns.length >= maxPosts) break;
                            
                            // Get the URN from data-urn or data-id
                            let urn = post.getAttribute('data-urn') || post.getAttribute('data-id');
                            
                            // Skip non-activity URNs
                            if (!urn || !urn.includes('urn:li:activity:')) continue;
                            
                            // Extract the activity ID
                            const activityMatch = urn.match(/urn:li:activity:(\d+)/);
                            if (activityMatch) {
                                const activityId = activityMatch[1];
                                // Check if this looks like original content (not a repost/share)
                                const isRepost = post.querySelector('.feed-shared-reshared-content') || 
                                               post.querySelector('.update-components-mini-update-v2');
                                
                                if (!isRepost) {
                                    postUrns.push({
                                        activityId,
                                        urn
                                    });
                                    console.log(`Found post URN: ${activityId}`);
                                }
                            }
                        }
                        
                        console.log(`Extracted ${postUrns.length} post URNs`);
                        return { postUrns, authorName };
                    },
                    args: [postCount + 5] // Get a few extra in case some fail
                });
                
                // Close activity tab
                await chrome.tabs.remove(activityTab.id);
                
                const { postUrns, authorName } = extractResult[0]?.result || { postUrns: [], authorName: 'Unknown' };
                
                if (postUrns.length === 0) {
                    console.log('BACKGROUND: No post URNs found on activity page');
                    sendResponse({ 
                        success: false, 
                        error: 'Could not find posts on this profile. The profile may have no recent posts or they may be private.'
                    });
                    return;
                }
                
                console.log(`BACKGROUND: Found ${postUrns.length} post URNs, now opening each post...`);
                
                // STEP 3: Open each post individually to get full content
                const scrapedPosts = [];
                let skippedCount = 0;
                
                for (let i = 0; i < Math.min(postUrns.length, postCount); i++) {
                    const { activityId } = postUrns[i];
                    const postUrl = `https://www.linkedin.com/feed/update/urn:li:activity:${activityId}/`;
                    
                    console.log(`BACKGROUND: Opening post ${i + 1}/${Math.min(postUrns.length, postCount)}: ${postUrl}`);
                    
                    try {
                        // Open the individual post page
                        const postTab = await chrome.tabs.create({ url: postUrl, active: false });
                        
                        // Wait for post page to load
                        await new Promise(resolve => setTimeout(resolve, 4000));
                        
                        // Scrape the full post content
                        const postResult = await chrome.scripting.executeScript({
                            target: { tabId: postTab.id },
                            func: () => {
                                // Get full post content from individual post page
                                let content = '';
                                
                                // Try multiple selectors for post text
                                const textSelectors = [
                                    '.feed-shared-update-v2__description .update-components-text',
                                    '.update-components-text',
                                    '.feed-shared-text',
                                    '.feed-shared-inline-show-more-text',
                                    'article .break-words'
                                ];
                                
                                for (const selector of textSelectors) {
                                    const element = document.querySelector(selector);
                                    if (element) {
                                        content = element.innerText || element.textContent || '';
                                        if (content.length > 50) break;
                                    }
                                }
                                
                                // Clean up content
                                content = content
                                    .replace(/\s+/g, ' ')
                                    .replace(/…more$/i, '')
                                    .replace(/See more$/i, '')
                                    .replace(/See translation$/i, '')
                                    .trim();
                                
                                // Get engagement metrics
                                let likes = 0, comments = 0;
                                
                                const likesEl = document.querySelector('.social-details-social-counts__reactions-count');
                                if (likesEl) {
                                    const match = likesEl.textContent?.match(/(\d+(?:,\d+)*)/);
                                    if (match) likes = parseInt(match[1].replace(/,/g, ''));
                                }
                                
                                const commentsBtn = document.querySelector('button[aria-label*="comment"]');
                                if (commentsBtn) {
                                    const match = commentsBtn.getAttribute('aria-label')?.match(/(\d+)/);
                                    if (match) comments = parseInt(match[1]);
                                }
                                
                                return { content, likes, comments };
                            }
                        });
                        
                        // Close the post tab
                        await chrome.tabs.remove(postTab.id);
                        
                        const postData = postResult[0]?.result;
                        
                        if (postData && postData.content && postData.content.length >= 50) {
                            // Skip system messages
                            const skipPatterns = [
                                /^is now/i, /updated their profile/i, /shared this/i,
                                /endorsed/i, /started following/i, /celebrated/i,
                                /has a new profile photo/i, /reacted to this/i
                            ];
                            
                            if (!skipPatterns.some(p => p.test(postData.content))) {
                                scrapedPosts.push({
                                    content: postData.content.substring(0, 5000),
                                    likes: postData.likes || 0,
                                    comments: postData.comments || 0,
                                    authorName,
                                    postUrl
                                });
                                console.log(`✅ BACKGROUND: Scraped post ${i + 1}: ${postData.content.substring(0, 80)}...`);
                            } else {
                                skippedCount++;
                                console.log(`BACKGROUND: Skipped system message post ${i + 1}`);
                            }
                        } else {
                            skippedCount++;
                            console.log(`BACKGROUND: Post ${i + 1} had insufficient content`);
                        }
                        
                        // Small delay between posts to avoid rate limiting
                        await new Promise(resolve => setTimeout(resolve, 1500));
                        
                    } catch (postError) {
                        console.warn(`BACKGROUND: Failed to scrape post ${i + 1}:`, postError.message);
                        skippedCount++;
                    }
                }
                
                if (scrapedPosts.length === 0) {
                    console.log('BACKGROUND: No posts successfully scraped');
                    sendResponse({ 
                        success: false, 
                        error: `Could not extract content from posts. Tried ${postUrns.length} posts, skipped ${skippedCount}.`
                    });
                    return;
                }
                
                console.log(`✅ BACKGROUND: Successfully scraped ${scrapedPosts.length} posts from ${authorName}`);
                
                // STEP 4: Save directly to backend API (don't rely on popup staying open)
                try {
                    const { authToken, apiBaseUrl } = await chrome.storage.local.get(['authToken', 'apiBaseUrl']);
                    const apiUrl = (apiBaseUrl && !apiBaseUrl.includes('backend-buxx') && !apiBaseUrl.includes('backend-api-orcin') && !apiBaseUrl.includes('backend-4poj')) ? apiBaseUrl : (API_CONFIG.BASE_URL || 'https://kommentify.com');
                    
                    if (!authToken) {
                        console.error('BACKGROUND: No auth token, cannot save to backend');
                        sendResponse({ success: false, error: 'Not authenticated. Please log in first.' });
                        return;
                    }
                    
                    console.log(`📤 BACKGROUND: Sending ${scrapedPosts.length} posts to vector DB...`);
                    
                    const ingestResponse = await fetch(`${apiUrl}/api/vector/ingest`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${authToken}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            posts: scrapedPosts,
                            inspirationSource: {
                                name: authorName,
                                profileUrl: request.profileUrl
                            }
                        })
                    });
                    
                    const ingestData = await ingestResponse.json();
                    console.log('📤 BACKGROUND: Ingest response:', ingestData);
                    
                    if (ingestData.success) {
                        // Store success in chrome.storage so UI can detect it
                        await chrome.storage.local.set({
                            lastInspirationResult: {
                                success: true,
                                authorName,
                                postCount: ingestData.count,
                                profileUrl: request.profileUrl,
                                timestamp: Date.now()
                            }
                        });
                        
                        sendResponse({ 
                            success: true, 
                            posts: scrapedPosts,
                            authorName,
                            skippedCount,
                            savedToBackend: true,
                            savedCount: ingestData.count
                        });
                    } else {
                        console.error('BACKGROUND: Ingest failed:', ingestData.error);
                        sendResponse({ 
                            success: true, 
                            posts: scrapedPosts,
                            authorName,
                            skippedCount,
                            savedToBackend: false,
                            backendError: ingestData.error
                        });
                    }
                } catch (apiError) {
                    console.error('BACKGROUND: API call failed:', apiError);
                    sendResponse({ 
                        success: true, 
                        posts: scrapedPosts,
                        authorName,
                        skippedCount,
                        savedToBackend: false,
                        backendError: apiError.message
                    });
                }
                
            } catch (error) {
                console.error('❌ BACKGROUND: Error scraping profile posts:', error);
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }

    // Save scraped posts to normal database (not vector DB)
    if (request.action === "saveScrapedPosts") {
        (async () => {
            try {
                console.log('💾 BACKGROUND: Saving scraped posts to database...');
                const { authToken, apiBaseUrl } = await chrome.storage.local.get(['authToken', 'apiBaseUrl']);
                const apiUrl = (apiBaseUrl && !apiBaseUrl.includes('backend-buxx') && !apiBaseUrl.includes('backend-api-orcin') && !apiBaseUrl.includes('backend-4poj')) ? apiBaseUrl : (API_CONFIG.BASE_URL || 'https://kommentify.com');
                
                if (!authToken) {
                    sendResponse({ success: false, error: 'Not authenticated' });
                    return;
                }
                
                const posts = request.posts || [];
                if (posts.length === 0) {
                    sendResponse({ success: false, error: 'No posts to save' });
                    return;
                }
                
                console.log(`📤 BACKGROUND: Saving ${posts.length} posts to scraped-posts API...`);
                
                const response = await fetch(`${apiUrl}/api/scraped-posts`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ posts })
                });
                
                const data = await response.json();
                console.log('💾 BACKGROUND: Save response:', data);
                sendResponse(data);
            } catch (error) {
                console.error('❌ BACKGROUND: Error saving scraped posts:', error);
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }

    // Track commands currently being processed to prevent duplicates
    if (!globalThis._processingCommandIds) {
        globalThis._processingCommandIds = new Set();
    }
    // Track LinkedIn tabs opened by commands for stop_all cleanup
    if (!globalThis._commandLinkedInTabs) {
        globalThis._commandLinkedInTabs = new Set();
    }
    // Flag to stop all tasks
    if (typeof globalThis._stopAllTasks === 'undefined') {
        globalThis._stopAllTasks = false;
    }
    // Global lock to prevent concurrent poll executions
    if (typeof globalThis._pollCommandsRunning === 'undefined') {
        globalThis._pollCommandsRunning = false;
    }
    // Timestamp when poll lock was acquired (for safety timeout)
    if (typeof globalThis._pollLockTimestamp === 'undefined') {
        globalThis._pollLockTimestamp = 0;
    }

    // Safe tab close helper - wraps chrome.tabs.remove with a timeout to prevent hanging
    const safeTabClose = async (tabId, label = 'tab') => {
        if (!tabId) return;
        try {
            await Promise.race([
                chrome.tabs.remove(tabId),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Tab close timeout')), 5000))
            ]);
            console.log(`BACKGROUND: Closed ${label} (tab ${tabId})`);
        } catch (e) {
            console.log(`BACKGROUND: Could not close ${label} (tab ${tabId}):`, e.message || 'already closed');
        }
    };

    // Stop all tasks handler
    if (request.action === "stopAllTasks") {
        (async () => {
            try {
                console.log('🛑 BACKGROUND: Stopping all tasks...');
                globalThis._stopAllTasks = true;
                
                // Close all LinkedIn tabs opened by commands
                const tabIds = [...globalThis._commandLinkedInTabs];
                for (const tabId of tabIds) {
                    try { await chrome.tabs.remove(tabId); } catch (e) { /* tab may already be closed */ }
                }
                globalThis._commandLinkedInTabs.clear();
                globalThis._processingCommandIds.clear();
                
                // Cancel all pending commands via API
                const { authToken, apiBaseUrl } = await chrome.storage.local.get(['authToken', 'apiBaseUrl']);
                const apiUrl = (apiBaseUrl && !apiBaseUrl.includes('backend-buxx') && !apiBaseUrl.includes('backend-api-orcin') && !apiBaseUrl.includes('backend-4poj')) ? apiBaseUrl : (API_CONFIG.BASE_URL || 'https://kommentify.com');
                if (authToken) {
                    await fetch(`${apiUrl}/api/extension/command/stop-all`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' }
                    });
                }
                
                // Reset flag after a short delay so future commands can work
                setTimeout(() => { globalThis._stopAllTasks = false; }, 2000);
                
                console.log('🛑 BACKGROUND: All tasks stopped, closed', tabIds.length, 'tabs');
                sendResponse({ success: true, closedTabs: tabIds.length });
            } catch (error) {
                console.error('BACKGROUND: Error stopping tasks:', error);
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }

    // Poll for website commands (post to LinkedIn from dashboard)
    if (request.action === "pollWebsiteCommands") {
        (async () => {
            // LOCK: Prevent concurrent poll executions that cause duplicate commands
            // Safety: if lock held > 2 minutes, force release (prevents permanent deadlock)
            if (globalThis._pollCommandsRunning) {
                const lockAge = Date.now() - globalThis._pollLockTimestamp;
                if (lockAge > 120000) {
                    console.log('⚠️ BACKGROUND: Poll lock held for', Math.round(lockAge / 1000), 's - FORCE releasing');
                    globalThis._pollCommandsRunning = false;
                } else {
                    console.log('⏭️ BACKGROUND: Poll already running, skipping');
                    sendResponse({ success: true, commands: [], skipped: true });
                    return;
                }
            }
            globalThis._pollCommandsRunning = true;
            globalThis._pollLockTimestamp = Date.now();
            try {
                const { authToken, apiBaseUrl } = await chrome.storage.local.get(['authToken', 'apiBaseUrl']);
                const apiUrl = (apiBaseUrl && !apiBaseUrl.includes('backend-buxx') && !apiBaseUrl.includes('backend-api-orcin') && !apiBaseUrl.includes('backend-4poj')) ? apiBaseUrl : (API_CONFIG.BASE_URL || 'https://kommentify.com');
                
                if (!authToken) {
                    globalThis._pollCommandsRunning = false;
                    sendResponse({ success: false, commands: [] });
                    return;
                }
                
                const response = await fetch(`${apiUrl}/api/extension/command`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                const data = await response.json();
                
                if (data.success && data.commands && data.commands.length > 0) {
                    console.log(`📥 BACKGROUND: Found ${data.commands.length} pending commands from website`);
                    
                    for (const cmd of data.commands) {
                        // DEDUP: Skip if already being processed
                        if (globalThis._processingCommandIds.has(cmd.id)) {
                            console.log(`⏭️ BACKGROUND: Skipping command ${cmd.id} - already processing`);
                            continue;
                        }
                        // Check stop flag
                        if (globalThis._stopAllTasks) {
                            console.log('🛑 BACKGROUND: Stop flag set, skipping remaining commands');
                            break;
                        }
                        
                        // Mark as processing locally
                        globalThis._processingCommandIds.add(cmd.id);
                        
                        // Mark as in_progress on server immediately
                        try {
                            await fetch(`${apiUrl}/api/extension/command`, {
                                method: 'PUT',
                                headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
                                body: JSON.stringify({ commandId: cmd.id, status: 'in_progress' })
                            });
                        } catch (e) { /* continue anyway */ }

                        if (cmd.command === 'post_to_linkedin' && cmd.data?.content) {
                            console.log('📝 BACKGROUND: Executing post_to_linkedin command...');
                            let postTab = null;
                            
                            try {
                                // Step 1: Open a new LinkedIn tab
                                console.log('BACKGROUND: Opening LinkedIn tab for website command...');
                                postTab = await chrome.tabs.create({
                                    url: 'https://www.linkedin.com/feed/',
                                    active: true
                                });
                                globalThis._commandLinkedInTabs.add(postTab.id);

                                // Step 2: Wait for tab to fully load
                                await new Promise((resolve) => {
                                    const checkComplete = (tabId, changeInfo) => {
                                        if (tabId === postTab.id && changeInfo.status === 'complete') {
                                            chrome.tabs.onUpdated.removeListener(checkComplete);
                                            resolve();
                                        }
                                    };
                                    chrome.tabs.onUpdated.addListener(checkComplete);
                                    setTimeout(() => { chrome.tabs.onUpdated.removeListener(checkComplete); resolve(); }, 30000);
                                });

                                // Check stop flag before continuing
                                if (globalThis._stopAllTasks) { globalThis._processingCommandIds.delete(cmd.id); continue; }

                                console.log('BACKGROUND: LinkedIn tab loaded, waiting 5s for render...');
                                await new Promise(resolve => setTimeout(resolve, 5000));

                                // Step 3: Inject posting script into the LinkedIn tab
                                const content = cmd.data.content;
                                const imageDataUrl = cmd.data.imageDataUrl || null;
                                console.log('BACKGROUND: Injecting post script, hasImage:', !!imageDataUrl);
                                const result = await chrome.scripting.executeScript({
                                    target: { tabId: postTab.id },
                                    func: (postContent, imgDataUrl) => {
                                        return new Promise((resolve) => {
                                            try {
                                            console.log('LinkedIn Post Script: Starting...', { hasImage: !!imgDataUrl });
                                            const SELECTORS = {
                                                startPostButton: 'div.share-box-feed-entry__top-bar button',
                                                postEditor: 'div.editor-container > div > div > div.ql-editor',
                                                postSubmitButton: 'div.share-box_actions button'
                                            };
                                            const startPostBtn = document.querySelector(SELECTORS.startPostButton);
                                            if (!startPostBtn) {
                                                resolve({ success: false, error: 'Start post button not found' });
                                                return;
                                            }
                                            startPostBtn.click();
                                            setTimeout(() => {
                                                try {
                                                const editor = document.querySelector(SELECTORS.postEditor);
                                                if (!editor) {
                                                    resolve({ success: false, error: 'Editor not found' });
                                                    return;
                                                }
                                                editor.innerHTML = '';
                                                editor.focus();
                                                const lines = postContent.split('\n');
                                                lines.forEach((line) => {
                                                    if (line.trim() === '') {
                                                        editor.appendChild(document.createElement('br'));
                                                    } else {
                                                        const p = document.createElement('p');
                                                        p.textContent = line;
                                                        editor.appendChild(p);
                                                    }
                                                });
                                                editor.dispatchEvent(new Event('input', { bubbles: true }));
                                                console.log('LinkedIn Post Script: Text inserted');

                                                // Handle image attachment via clipboard paste
                                                const pasteImage = async () => {
                                                    if (!imgDataUrl) return false;
                                                    try {
                                                        console.log('LinkedIn Post Script: Pasting image via clipboard...');
                                                        // Convert base64 data URL to Blob
                                                        const byteString = atob(imgDataUrl.split(',')[1]);
                                                        const mimeString = imgDataUrl.split(',')[0].split(':')[1].split(';')[0];
                                                        const ab = new ArrayBuffer(byteString.length);
                                                        const ia = new Uint8Array(ab);
                                                        for (let j = 0; j < byteString.length; j++) ia[j] = byteString.charCodeAt(j);
                                                        const blob = new Blob([ab], { type: mimeString });
                                                        const file = new File([blob], 'image.png', { type: mimeString });

                                                        // Write to clipboard first
                                                        try {
                                                            await navigator.clipboard.write([
                                                                new ClipboardItem({ [mimeString]: blob })
                                                            ]);
                                                            console.log('LinkedIn Post Script: Image written to clipboard');
                                                        } catch (clipErr) {
                                                            console.log('LinkedIn Post Script: Clipboard write failed, trying paste event directly:', clipErr.message);
                                                        }

                                                        // Dispatch synthetic paste event with image data
                                                        editor.focus();
                                                        const dt = new DataTransfer();
                                                        dt.items.add(file);
                                                        
                                                        // Create paste event with clipboardData
                                                        const pasteEvt = new ClipboardEvent('paste', {
                                                            bubbles: true,
                                                            cancelable: true,
                                                            clipboardData: dt
                                                        });
                                                        editor.dispatchEvent(pasteEvt);
                                                        console.log('LinkedIn Post Script: Paste event dispatched on editor');

                                                        // Also try on the share box modal container
                                                        const shareBox = document.querySelector('.share-box--is-open') || 
                                                                        document.querySelector('.share-creation-state') ||
                                                                        document.querySelector('[role="dialog"]');
                                                        if (shareBox) {
                                                            shareBox.dispatchEvent(new ClipboardEvent('paste', {
                                                                bubbles: true, cancelable: true, clipboardData: dt
                                                            }));
                                                            console.log('LinkedIn Post Script: Paste event also dispatched on share box');
                                                        }

                                                        await new Promise(r => setTimeout(r, 3000));
                                                        return true;
                                                    } catch (imgErr) {
                                                        console.error('LinkedIn Post Script: Image paste error:', imgErr);
                                                        return false;
                                                    }
                                                };

                                                // Wait for text input, paste image if any, then click post
                                                const finishPost = async () => {
                                                    try {
                                                        const imageAttached = await pasteImage();
                                                        console.log('LinkedIn Post Script: Image attached:', imageAttached);
                                                        // Extra wait for image processing
                                                        const extraWait = imgDataUrl ? 4000 : 0;
                                                        await new Promise(r => setTimeout(r, 3000 + extraWait));
                                                        
                                                        const actionButtons = document.querySelectorAll(SELECTORS.postSubmitButton);
                                                        let postButton = null;
                                                        for (const btn of actionButtons) {
                                                            if ((btn.textContent?.trim().toLowerCase() || '') === 'post') { postButton = btn; break; }
                                                        }
                                                        if (postButton && !postButton.disabled) {
                                                            postButton.click();
                                                            console.log('LinkedIn Post Script: Post button clicked');
                                                            resolve({ success: true, posted: true, imageAttached });
                                                        } else {
                                                            console.log('LinkedIn Post Script: Post button not found or disabled');
                                                            resolve({ success: true, posted: false, message: 'Content inserted, click Post manually', imageAttached });
                                                        }
                                                    } catch (finishErr) {
                                                        console.error('LinkedIn Post Script: finishPost error:', finishErr);
                                                        resolve({ success: false, error: finishErr.message });
                                                    }
                                                };
                                                finishPost();
                                                } catch (innerErr) {
                                                    resolve({ success: false, error: 'Inner error: ' + innerErr.message });
                                                }
                                            }, 3000);
                                            } catch (outerErr) {
                                                resolve({ success: false, error: 'Outer error: ' + outerErr.message });
                                            }
                                        });
                                    },
                                    args: [content, imageDataUrl]
                                });

                                const scriptResult = result?.[0]?.result;
                                console.log('BACKGROUND: Website command script result:', scriptResult);
                                
                                // Wait a moment for LinkedIn to process the post before closing tab
                                console.log('BACKGROUND: Waiting 5s before closing tab...');
                                await new Promise(resolve => setTimeout(resolve, 5000));
                                
                                // Mark command as completed
                                try {
                                    await fetch(`${apiUrl}/api/extension/command`, {
                                        method: 'PUT',
                                        headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ commandId: cmd.id, status: scriptResult?.posted ? 'completed' : 'completed_manual' })
                                    });
                                    console.log('✅ BACKGROUND: Post to LinkedIn command completed');
                                } catch (fetchErr) {
                                    console.error('BACKGROUND: Failed to update command status:', fetchErr.message);
                                }
                            } catch (postError) {
                                console.error('❌ BACKGROUND: Failed to post to LinkedIn:', postError);
                                try {
                                    await fetch(`${apiUrl}/api/extension/command`, {
                                        method: 'PUT',
                                        headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ commandId: cmd.id, status: 'failed' })
                                    });
                                } catch (e) {}
                            } finally {
                                // Always close tab and clean up
                                if (postTab) {
                                    await safeTabClose(postTab.id, 'LinkedIn post tab');
                                    globalThis._commandLinkedInTabs.delete(postTab.id);
                                }
                                globalThis._processingCommandIds.delete(cmd.id);
                            }
                        }

                        // Handle scrape_profile command from website
                        if (cmd.command === 'scrape_profile' && cmd.data?.profileUrl) {
                            console.log('🔍 BACKGROUND: Executing scrape_profile command for:', cmd.data.profileUrl);
                            try {
                                // Use the existing scrapeProfilePosts logic by sending internal message
                                const scrapeResult = await new Promise((resolve) => {
                                    chrome.runtime.sendMessage({
                                        action: 'scrapeProfilePosts',
                                        profileUrl: cmd.data.profileUrl,
                                        postCount: cmd.data.postCount || 10
                                    }, (response) => {
                                        resolve(response || { success: false, error: 'No response' });
                                    });
                                });

                                await fetch(`${apiUrl}/api/extension/command`, {
                                    method: 'PUT',
                                    headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ commandId: cmd.id, status: scrapeResult.success ? 'completed' : 'failed' })
                                });
                                console.log('✅ BACKGROUND: scrape_profile command done:', scrapeResult.success);
                            } catch (scrapeError) {
                                console.error('❌ BACKGROUND: scrape_profile failed:', scrapeError);
                                await fetch(`${apiUrl}/api/extension/command`, {
                                    method: 'PUT',
                                    headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ commandId: cmd.id, status: 'failed' })
                                });
                            } finally {
                                globalThis._processingCommandIds.delete(cmd.id);
                            }
                        }

                        // Handle scrape_feed_now command from website
                        if (cmd.command === 'scrape_feed_now') {
                            console.log('🔍 BACKGROUND: Executing scrape_feed_now command...');
                            let scrapeTab = null;
                            try {
                                // Open LinkedIn feed and scrape posts
                                const tab = await chrome.tabs.create({ url: 'https://www.linkedin.com/feed/', active: true });
                                scrapeTab = tab;
                                globalThis._commandLinkedInTabs.add(tab.id);
                                await new Promise((resolve) => {
                                    const checkComplete = (tabId, changeInfo) => {
                                        if (tabId === tab.id && changeInfo.status === 'complete') {
                                            chrome.tabs.onUpdated.removeListener(checkComplete);
                                            resolve();
                                        }
                                    };
                                    chrome.tabs.onUpdated.addListener(checkComplete);
                                    setTimeout(() => { chrome.tabs.onUpdated.removeListener(checkComplete); resolve(); }, 30000);
                                });
                                await new Promise(resolve => setTimeout(resolve, 5000));

                                // Scroll and scrape posts
                                const durationMs = (cmd.data?.durationMinutes || 5) * 60 * 1000;
                                const minLikes = cmd.data?.minLikes || 0;
                                const minComments = cmd.data?.minComments || 0;
                                const keywords = cmd.data?.keywords ? cmd.data.keywords.split(',').map(k => k.trim().toLowerCase()).filter(Boolean) : [];

                                // Scroll a few times to load posts
                                await scrollAndLoadContent(tab.id, 5);
                                await new Promise(resolve => setTimeout(resolve, 2000));

                                // Scrape visible posts
                                const scrapeResult = await chrome.scripting.executeScript({
                                    target: { tabId: tab.id },
                                    func: (minL, minC, kws) => {
                                        const posts = [];
                                        const postElements = document.querySelectorAll('[data-id^="urn:li:activity:"]');
                                        for (const el of postElements) {
                                            const textEl = el.querySelector('.update-components-text, .feed-shared-text, .feed-shared-inline-show-more-text');
                                            const content = textEl ? (textEl.innerText || '').trim() : '';
                                            if (content.length < 50) continue;

                                            let likes = 0, comments = 0, shares = 0;
                                            const likesEl = el.querySelector('.social-details-social-counts__reactions-count');
                                            if (likesEl) { const m = likesEl.textContent?.match(/(\d+(?:,\d+)*)/); if (m) likes = parseInt(m[1].replace(/,/g, '')); }
                                            const commentsEl = el.querySelector('button[aria-label*="comment"]');
                                            if (commentsEl) { const m = commentsEl.getAttribute('aria-label')?.match(/(\d+)/); if (m) comments = parseInt(m[1]); }

                                            if (likes < minL || comments < minC) continue;
                                            if (kws.length > 0 && !kws.some(kw => content.toLowerCase().includes(kw))) continue;

                                            let authorName = 'Unknown';
                                            const authorEl = el.querySelector('.update-components-actor__title span[aria-hidden="true"], .feed-shared-actor__title span[aria-hidden="true"]');
                                            if (authorEl) authorName = authorEl.textContent?.trim() || 'Unknown';

                                            const urn = el.getAttribute('data-id') || '';
                                            const activityMatch = urn.match(/urn:li:activity:(\d+)/);
                                            const postUrl = activityMatch ? `https://www.linkedin.com/feed/update/urn:li:activity:${activityMatch[1]}/` : '';

                                            // Scrape post image if present
                                            let imageUrl = null;
                                            const imgEl = el.querySelector('.update-components-image img, .feed-shared-image img, img.ivm-view-attr__img--centered[src*="feedshare"]');
                                            if (imgEl && imgEl.src && imgEl.src.includes('media.licdn.com')) {
                                                imageUrl = imgEl.src;
                                            }

                                            posts.push({ postContent: content.substring(0, 5000), authorName, likes, comments, shares, postUrl, imageUrl });
                                        }
                                        return posts;
                                    },
                                    args: [minLikes, minComments, keywords]
                                });

                                const scrapedPosts = scrapeResult?.[0]?.result || [];
                                console.log(`BACKGROUND: Scraped ${scrapedPosts.length} posts from feed`);

                                // Save to backend
                                if (scrapedPosts.length > 0) {
                                    await fetch(`${apiUrl}/api/scraped-posts`, {
                                        method: 'POST',
                                        headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ posts: scrapedPosts })
                                    });
                                }

                                await fetch(`${apiUrl}/api/extension/command`, {
                                    method: 'PUT',
                                    headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ commandId: cmd.id, status: 'completed' })
                                });
                                console.log(`✅ BACKGROUND: scrape_feed_now done, saved ${scrapedPosts.length} posts`);
                            } catch (feedError) {
                                console.error('❌ BACKGROUND: scrape_feed_now failed:', feedError);
                                try {
                                    await fetch(`${apiUrl}/api/extension/command`, {
                                        method: 'PUT',
                                        headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ commandId: cmd.id, status: 'failed' })
                                    });
                                } catch (e) {}
                            } finally {
                                // Always close tab and clean up
                                if (scrapeTab) {
                                    await safeTabClose(scrapeTab.id, 'scrape feed tab');
                                    globalThis._commandLinkedInTabs.delete(scrapeTab.id);
                                }
                                globalThis._processingCommandIds.delete(cmd.id);
                            }
                        }

                        // Handle scrape_comments command - scrape profile owner's comments from activity page
                        if (cmd.command === 'scrape_comments' && cmd.data?.profileUrl) {
                            console.log('💬 BACKGROUND: Executing scrape_comments command for:', cmd.data.profileUrl);
                            let commentTab = null;
                            try {
                                // Extract profile ID from URL
                                const urlMatch = cmd.data.profileUrl.match(/\/in\/([^\/\?]+)/);
                                const targetProfileId = urlMatch ? urlMatch[1] : null;
                                if (!targetProfileId) throw new Error('Could not extract profile ID from URL');

                                // Open the profile's recent activity / comments page
                                const activityUrl = `https://www.linkedin.com/in/${targetProfileId}/recent-activity/comments/`;
                                const tab = await chrome.tabs.create({ url: activityUrl, active: false });
                                commentTab = tab;
                                globalThis._commandLinkedInTabs.add(tab.id);

                                // Wait for page load
                                await new Promise((resolve) => {
                                    const checkComplete = (tabId, changeInfo) => {
                                        if (tabId === tab.id && changeInfo.status === 'complete') {
                                            chrome.tabs.onUpdated.removeListener(checkComplete);
                                            resolve();
                                        }
                                    };
                                    chrome.tabs.onUpdated.addListener(checkComplete);
                                    setTimeout(() => { chrome.tabs.onUpdated.removeListener(checkComplete); resolve(); }, 30000);
                                });
                                await new Promise(resolve => setTimeout(resolve, 5000));

                                // Scroll to load more comments (5 scrolls with 3s delay)
                                const MAX_SCROLLS = cmd.data.maxScrolls || 5;
                                for (let i = 0; i < MAX_SCROLLS; i++) {
                                    await chrome.scripting.executeScript({
                                        target: { tabId: tab.id },
                                        func: () => {
                                            window.scrollTo(0, document.body.scrollHeight);
                                            const loadMore = document.querySelector('.scaffold-finite-scroll__load-button');
                                            if (loadMore) loadMore.click();
                                        }
                                    });
                                    console.log(`💬 BACKGROUND: scrape_comments scroll ${i + 1}/${MAX_SCROLLS}`);
                                    await new Promise(resolve => setTimeout(resolve, 3000));
                                }
                                await new Promise(resolve => setTimeout(resolve, 2000));

                                // Execute the comment extraction script
                                const scrapeResult = await chrome.scripting.executeScript({
                                    target: { tabId: tab.id },
                                    func: (tpId) => {
                                        const clean = (text) => {
                                            if (!text) return "";
                                            return text.replace(/…more|See more/g, '').replace(/\s+/g, ' ').trim();
                                        };
                                        const S = {
                                            feedUpdate: '.feed-shared-update-v2',
                                            postText: '.feed-shared-update-v2__description .update-components-text',
                                            threadContainer: '.comments-comment-list__container',
                                            replyList: '.comments-replies-list',
                                            commentEntity: 'article.comments-comment-entity',
                                            commentBody: '.comments-comment-item__main-content',
                                            profileLink: 'a.comments-comment-meta__image-link',
                                            authorName: '.comments-comment-meta__description-title',
                                        };

                                        const tableData = [];
                                        let detectedName = null;
                                        const feedCards = document.querySelectorAll(S.feedUpdate);

                                        feedCards.forEach((card) => {
                                            const postTextEl = card.querySelector(S.postText);
                                            let mainPostText = postTextEl ? clean(postTextEl.innerText) : "[Media/No Text]";
                                            if (mainPostText.length > 500) mainPostText = mainPostText.substring(0, 500) + "...";

                                            const comments = card.querySelectorAll(S.commentEntity);
                                            comments.forEach((comment) => {
                                                const profileLinkEl = comment.querySelector(S.profileLink);
                                                const profileHref = profileLinkEl ? profileLinkEl.getAttribute('href') : "";
                                                if (profileHref && profileHref.includes(tpId)) {
                                                    const authorBodyEl = comment.querySelector(S.commentBody);
                                                    const authorText = authorBodyEl ? clean(authorBodyEl.innerText) : "";
                                                    if (!authorText) return;

                                                    // Try to detect the profile owner's display name
                                                    if (!detectedName) {
                                                        const nameEl = comment.querySelector(S.authorName);
                                                        if (nameEl) detectedName = clean(nameEl.innerText);
                                                    }

                                                    let contextText = "DIRECT COMMENT ON POST";
                                                    const parentReplyList = comment.closest(S.replyList);
                                                    if (parentReplyList) {
                                                        const threadContainer = comment.closest(S.threadContainer);
                                                        if (threadContainer) {
                                                            const parentComment = threadContainer.querySelector(S.commentEntity);
                                                            if (parentComment && parentComment !== comment) {
                                                                const pNameEl = parentComment.querySelector(S.authorName);
                                                                const pBodyEl = parentComment.querySelector(S.commentBody);
                                                                const pName = pNameEl ? clean(pNameEl.innerText) : "Unknown";
                                                                const pText = pBodyEl ? clean(pBodyEl.innerText) : "[Media]";
                                                                contextText = `REPLY TO [${pName}]: "${pText.substring(0, 200)}..."`;
                                                            }
                                                        }
                                                    }

                                                    tableData.push({
                                                        postText: mainPostText,
                                                        context: contextText,
                                                        commentText: authorText
                                                    });
                                                }
                                            });
                                        });

                                        return { comments: tableData, profileName: detectedName, count: tableData.length };
                                    },
                                    args: [targetProfileId]
                                });

                                const result = scrapeResult?.[0]?.result || { comments: [], profileName: null, count: 0 };
                                console.log(`💬 BACKGROUND: Extracted ${result.count} comments by ${targetProfileId}`);

                                // Save to backend API
                                if (result.comments.length > 0) {
                                    const saveRes = await fetch(`${apiUrl}/api/scraped-comments`, {
                                        method: 'POST',
                                        headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            action: 'saveComments',
                                            profileUrl: cmd.data.profileUrl,
                                            profileIdSlug: targetProfileId,
                                            profileName: result.profileName || targetProfileId,
                                            comments: result.comments
                                        })
                                    });
                                    const saveData = await saveRes.json();
                                    console.log('💬 BACKGROUND: Comments saved:', saveData);
                                }

                                await fetch(`${apiUrl}/api/extension/command`, {
                                    method: 'PUT',
                                    headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ commandId: cmd.id, status: 'completed' })
                                });
                                console.log(`✅ BACKGROUND: scrape_comments done, saved ${result.count} comments for ${targetProfileId}`);
                            } catch (commentError) {
                                console.error('❌ BACKGROUND: scrape_comments failed:', commentError);
                                try {
                                    await fetch(`${apiUrl}/api/extension/command`, {
                                        method: 'PUT',
                                        headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ commandId: cmd.id, status: 'failed' })
                                    });
                                } catch (e) {}
                            } finally {
                                if (commentTab) {
                                    await safeTabClose(commentTab.id, 'scrape comments tab');
                                    globalThis._commandLinkedInTabs.delete(commentTab.id);
                                }
                                globalThis._processingCommandIds.delete(cmd.id);
                            }
                        }
                    }
                }
                
                sendResponse({ success: true, commands: data.commands || [] });
            } catch (error) {
                console.error('BACKGROUND: Error polling website commands:', error);
                sendResponse({ success: false, error: error.message });
            } finally {
                globalThis._pollCommandsRunning = false;
            }
        })();
        return true;
    }

    // Get feed scraping schedule from website
    if (request.action === "getFeedSchedule") {
        (async () => {
            try {
                const { authToken, apiBaseUrl } = await chrome.storage.local.get(['authToken', 'apiBaseUrl']);
                const apiUrl = (apiBaseUrl && !apiBaseUrl.includes('backend-buxx') && !apiBaseUrl.includes('backend-api-orcin') && !apiBaseUrl.includes('backend-4poj')) ? apiBaseUrl : (API_CONFIG.BASE_URL || 'https://kommentify.com');
                
                if (!authToken) {
                    sendResponse({ success: false, error: 'Not authenticated' });
                    return;
                }
                
                const response = await fetch(`${apiUrl}/api/feed-schedules`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                const data = await response.json();
                sendResponse(data);
            } catch (error) {
                console.error('BACKGROUND: Error getting feed schedule:', error);
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }

    // Get Comment Settings (for AI button manual review check)
    if (request.action === "getCommentSettings") {
        const _bridgeRequestId = request._bridgeRequestId;
        const _senderTabId = sender?.tab?.id;
        (async () => {
            const defaults = {
                goal: 'AddValue',
                tone: 'Friendly',
                commentLength: 'Short',
                commentStyle: 'direct',
                userExpertise: '',
                userBackground: '',
                aiAutoPost: 'manual',
                useProfileStyle: false
            };
            try {
                // Try to fetch from website API first
                const storage = await chrome.storage.local.get(['authToken', 'apiBaseUrl']);
                const token = storage.authToken;
                let apiUrl = storage.apiBaseUrl;
                if (!apiUrl || apiUrl.includes('backend-buxx') || apiUrl.includes('backend-api-orcin') || apiUrl.includes('backend-4poj')) apiUrl = API_CONFIG.BASE_URL;
                
                if (token) {
                    try {
                        const res = await fetch(`${apiUrl}/api/comment-settings`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        const data = await res.json();
                        if (data.success && data.settings) {
                            const serverSettings = {
                                goal: data.settings.goal || defaults.goal,
                                tone: data.settings.tone || defaults.tone,
                                commentLength: data.settings.commentLength || defaults.commentLength,
                                commentStyle: data.settings.commentStyle || defaults.commentStyle,
                                userExpertise: data.settings.userExpertise || defaults.userExpertise,
                                userBackground: data.settings.userBackground || defaults.userBackground,
                                aiAutoPost: data.settings.aiAutoPost || defaults.aiAutoPost,
                                useProfileStyle: data.settings.useProfileStyle === true,
                            };
                            // Cache in local storage
                            await chrome.storage.local.set({ commentSettings: serverSettings });
                            console.log('BACKGROUND: Loaded comment settings from server:', serverSettings);
                            sendResponse(serverSettings);
                            // FALLBACK: Also send via chrome.tabs.sendMessage
                            if (_senderTabId && _bridgeRequestId) {
                                try { chrome.tabs.sendMessage(_senderTabId, { type: 'COMMENT_SETTINGS_RESULT', _bridgeRequestId, data: serverSettings }); } catch(e) {}
                            }
                            return;
                        }
                    } catch (fetchErr) {
                        console.warn('BACKGROUND: Could not fetch server settings, using local:', fetchErr.message);
                    }
                }
                
                // Fallback to local storage
                const result = await chrome.storage.local.get('commentSettings');
                const settings = result.commentSettings || defaults;
                console.log('BACKGROUND: Returning local comment settings:', settings);
                sendResponse(settings);
                if (_senderTabId && _bridgeRequestId) {
                    try { chrome.tabs.sendMessage(_senderTabId, { type: 'COMMENT_SETTINGS_RESULT', _bridgeRequestId, data: settings }); } catch(e) {}
                }
            } catch (error) {
                console.error('BACKGROUND: Error getting comment settings:', error);
                sendResponse(defaults);
                if (_senderTabId && _bridgeRequestId) {
                    try { chrome.tabs.sendMessage(_senderTabId, { type: 'COMMENT_SETTINGS_RESULT', _bridgeRequestId, data: defaults }); } catch(e) {}
                }
            }
        })();
        return true;
    }

    // Check Daily Limit (for AI button and automation)
    if (request.action === "checkDailyLimit") {
        (async () => {
            try {
                const actionType = request.actionType;
                const result = await chrome.storage.local.get(['dailyLimits', 'dailyCounts']);
                
                const dailyLimits = result.dailyLimits || {
                    comments: 30,
                    likes: 60,
                    shares: 15,
                    follows: 30
                };
                
                const today = new Date().toISOString().split('T')[0];
                let dailyCounts = result.dailyCounts || {};
                
                // Reset counts if it's a new day
                if (dailyCounts.date !== today) {
                    dailyCounts = {
                        date: today,
                        comments: 0,
                        likes: 0,
                        shares: 0,
                        follows: 0
                    };
                    await chrome.storage.local.set({ dailyCounts });
                }
                
                const keyMap = {
                    'comment': 'comments',
                    'like': 'likes',
                    'share': 'shares',
                    'follow': 'follows'
                };
                
                const key = keyMap[actionType] || actionType;
                const current = dailyCounts[key] || 0;
                const limit = dailyLimits[key] || Infinity;
                const remaining = Math.max(0, limit - current);
                const allowed = current < limit;
                
                console.log('BACKGROUND: Daily limit check:', { actionType, current, limit, allowed });
                sendResponse({ allowed, current, limit, remaining });
            } catch (error) {
                console.error('BACKGROUND: Error checking daily limit:', error);
                sendResponse({ allowed: true, current: 0, limit: Infinity, remaining: Infinity });
            }
        })();
        return true;
    }

    // Increment Daily Count (after action is completed)
    if (request.action === "incrementDailyCount") {
        (async () => {
            try {
                const actionType = request.actionType;
                const result = await chrome.storage.local.get(['dailyCounts']);
                
                const today = new Date().toISOString().split('T')[0];
                let dailyCounts = result.dailyCounts || {};
                
                // Reset counts if it's a new day
                if (dailyCounts.date !== today) {
                    dailyCounts = {
                        date: today,
                        comments: 0,
                        likes: 0,
                        shares: 0,
                        follows: 0
                    };
                }
                
                const keyMap = {
                    'comment': 'comments',
                    'like': 'likes',
                    'share': 'shares',
                    'follow': 'follows'
                };
                
                const key = keyMap[actionType] || actionType;
                dailyCounts[key] = (dailyCounts[key] || 0) + 1;
                
                await chrome.storage.local.set({ dailyCounts });
                
                console.log('BACKGROUND: Incremented daily count:', { actionType, newCount: dailyCounts[key] });
                sendResponse({ success: true, newCount: dailyCounts[key] });
            } catch (error) {
                console.error('BACKGROUND: Error incrementing daily count:', error);
                sendResponse({ success: false, newCount: 0 });
            }
        })();
        return true;
    }

    // Get Console Logs for Progress Tab
    if (request.action === "getConsoleLogs") {
        // Return last 100 logs
        const recentLogs = consoleLogBuffer.slice(0, 100).map(log => log.message);
        sendResponse({ success: true, logs: recentLogs });
        return true;
    }

    // Generate Keywords with AI (dedicated endpoint)
    if (request.action === "generateKeywords") {
        (async () => {
            try {
                console.log('BACKGROUND: Generating keywords...');
                console.log('BACKGROUND: Intent:', request.intent?.substring(0, 50));
                console.log('BACKGROUND: Keyword count:', request.keywordCount);

                // Get auth token
                const storage = await chrome.storage.local.get(['authToken', 'apiBaseUrl']);
                const token = storage.authToken;
                let apiUrl = storage.apiBaseUrl;
                if (!apiUrl || apiUrl.includes('backend-buxx') || apiUrl.includes('backend-api-orcin') || apiUrl.includes('backend-4poj')) {
                    apiUrl = API_CONFIG.BASE_URL;
                }

                if (!token) {
                    sendResponse({ success: false, error: 'Please login to use this feature' });
                    return;
                }

                // Call dedicated keywords endpoint
                const response = await fetch(`${apiUrl}/api/ai/generate-keywords`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        intent: request.intent,
                        keywordCount: request.keywordCount || 15
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `HTTP error: ${response.status}`);
                }

                const data = await response.json();
                console.log('BACKGROUND: Keywords generated:', data.keywords?.length || 0);
                
                sendResponse({ 
                    success: true, 
                    keywords: data.keywords || [],
                    rawContent: data.rawContent 
                });
            } catch (error) {
                console.error('BACKGROUND: Error generating keywords:', error);
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }

    // Generate with OpenAI (generic AI completion - legacy)
    if (request.action === "generateWithOpenAI") {
        (async () => {
            try {
                console.log('BACKGROUND: Generating with AI...');
                console.log('BACKGROUND: Prompt length:', request.prompt?.length || 0);

                const response = await generateWithAI(
                    request.prompt,
                    request.maxTokens || 500,
                    request.temperature || 0.7
                );

                console.log('BACKGROUND: AI response generated:', response.substring(0, 100) + '...');
                sendResponse({ success: true, content: response });
            } catch (error) {
                console.error('BACKGROUND: Error generating with AI:', error);
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }

    // Bulk Process Keywords
    if (request.action === "bulkProcessKeywords") {
        (async () => {
            try {
                console.log("BULK KEYWORDS: Received request from:", request.source || 'manual');
                console.log("BULK KEYWORDS: Received actions:", JSON.stringify(request.actions));

                // CHECK FEATURE PERMISSION (skip check for scheduler since it's already validated)
                if (request.source !== 'scheduler') {
                    const canUseAutomation = await featureChecker.checkFeature('autoLike');
                    if (!canUseAutomation) {
                        console.error("❌ BACKGROUND: General Automation feature not allowed in current plan");
                        sendResponse({ 
                            success: false, 
                            error: 'General Automation requires a paid plan. Please upgrade!',
                            requiresUpgrade: true,
                            feature: 'autoLike'
                        });
                        return;
                    }
                }

                // Send immediate response for manual requests
                if (request.source !== 'scheduler') {
                    sendResponse({ success: true, message: "Enhanced bulk processing started successfully!" });
                }

                // Execute bulk processing using static import
                const result = await executeBulkProcessing({
                    keywords: request.keywords || [],
                    quota: request.quota || 20,
                    minLikes: request.minLikes || 0,
                    minComments: request.minComments || 0,
                    ignoreKeywords: request.ignoreKeywords || 'we\'re hiring\nnow hiring\napply now',
                    actions: request.actions || { like: true, comment: false, share: false, follow: false },
                    accountType: request.accountType || 'matured',
                    commentDelay: request.commentDelay || 180,
                    source: request.source || 'manual'
                });

                console.log("BULK KEYWORDS: Processing completed:", result);

                // Send response for all requests (manual and scheduler)
                sendResponse(result || { success: true, message: "Processing completed" });

            } catch (error) {
                console.error("BULK KEYWORDS: Error:", error);
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }

    // Stop Bulk Processing
    if (request.action === "stopBulkProcessing") {
        (async () => {
            console.log("BACKGROUND: Received stop bulk processing request");
            const result = await stopBulkProcessing();
            sendResponse(result);
        })();
        return true;
    }

    // Stop People Search
    if (request.action === "stopPeopleSearch") {
        (async () => {
            console.log("BACKGROUND: Received stop people search request");
            const result = await peopleSearchAutomation.stopProcessing();
            sendResponse(result);
        })();
        return true;
    }

    // Business Hours Status
    if (request.action === "getBusinessHoursStatus") {
        (async () => {
            try {
                if (!businessHoursScheduler) {
                    sendResponse({ success: false, error: 'Business hours scheduler not available' });
                    return;
                }
                const status = businessHoursScheduler.getStatus();
                const history = await businessHoursScheduler.getDailyExecutionHistory();
                sendResponse({ success: true, status, history });
            } catch (error) {
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }

    // Update Business Hours
    if (request.action === "updateBusinessHours") {
        (async () => {
            try {
                if (businessHoursScheduler) {
                    await businessHoursScheduler.updateBusinessHours(request.settings);
                } else {
                    throw new Error('Business hours scheduler not available');
                }
                sendResponse({ success: true });
            } catch (error) {
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }

    // Daily Post Status
    if (request.action === "getDailyPostStatus") {
        sendResponse({
            success: true,
            status: { enabled: false, nextPost: null, lastPost: null }
        });
        return true;
    }

    // Progress Analytics
    if (request.action === "getProgressAnalytics") {
        (async () => {
            try {
                const analytics = await backgroundStatistics.getProgressAnalytics();
                sendResponse({ success: true, analytics });
            } catch (error) {
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }

    // People Search & Connect
    if (request.action === 'startPeopleSearch') {
        (async () => {
            try {
                console.log('BACKGROUND: Starting people search automation');
                
                // CHECK FEATURE PERMISSION
                const canUseNetworking = await featureChecker.checkFeature('autoFollow');
                if (!canUseNetworking) {
                    console.error("❌ BACKGROUND: Networking feature not allowed in current plan");
                    sendResponse({ 
                        success: false, 
                        error: 'Networking Features require a paid plan. Please upgrade!',
                        requiresUpgrade: true,
                        feature: 'autoFollow'
                    });
                    return;
                }
                
                const { keyword, quota, options, message, source, searchUrl } = request;
                
                console.log('BACKGROUND: People search source:', source || 'keyword');
                console.log('BACKGROUND: Search URL:', searchUrl || 'N/A');
                console.log('BACKGROUND: Keyword:', keyword || 'N/A');

                // Send immediate response to prevent timeout
                sendResponse({ success: true, message: 'People search automation started' });

                // Run automation in background (don't await - let it run independently)
                // Pass source and searchUrl for URL mode support
                peopleSearchAutomation.searchAndConnect(keyword, quota, options, message, source, searchUrl)
                    .then(result => {
                        console.log('BACKGROUND: People search completed:', result);
                    })
                    .catch(error => {
                        console.error('BACKGROUND: People search error:', error);
                    });

            } catch (error) {
                console.error('BACKGROUND: People search startup error:', error);
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }

    // Generate Topic Lines (AI) - Using Backend API ONLY
    if (request.action === 'generateTopicLines') {
        (async () => {
            try {
                console.log('BACKGROUND: Generating topic lines with backend API');
                
                // CHECK FEATURE PERMISSION
                const canUseAiTopicLines = await featureChecker.checkFeature('aiTopicLines');
                if (!canUseAiTopicLines) {
                    console.error("❌ BACKGROUND: AI Topic Lines feature not allowed in current plan");
                    sendResponse({ 
                        success: false, 
                        error: 'AI Topic Lines generation is not available in your plan. Please upgrade!',
                        requiresUpgrade: true,
                        feature: 'aiTopicLines'
                    });
                    return;
                }
                
                const { topic } = request;

                // Get auth token and API URL
                const storage = await chrome.storage.local.get(['authToken', 'apiBaseUrl']);
                const token = storage.authToken;
                // Force use of config URL if storage URL is suspicious, undefined, or localhost
                let apiUrl = storage.apiBaseUrl;
                if (!apiUrl || apiUrl.includes('backend-buxx') || apiUrl.includes('backend-api-orcin') || apiUrl.includes('backend-4poj') || apiUrl.includes('localhost')) {
                    apiUrl = API_CONFIG.BASE_URL;
                }

                console.log('BACKGROUND: Using API URL:', apiUrl);

                // Authentication is required
                if (!token) {
                    sendResponse({ success: false, error: 'Please login to use this feature' });
                    return;
                }

                // Use backend API
                const response = await fetch(`${apiUrl}/api/ai/generate-topics`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        topic,
                        count: 8
                    })
                });

                const data = await response.json();

                if (!response.ok || !data.success) {
                    console.error('BACKGROUND: Backend API error:', data.error || response.statusText);
                    sendResponse({ success: false, error: data.error || 'Failed to generate topics' });
                    return;
                }

                console.log('BACKGROUND: Generated topic lines from backend:', data.topics);
                
                // Track AI topic lines generation
                if (data.topics && data.topics.length > 0) {
                    try {
                        await backgroundStatistics.recordAiTopicLines(data.topics.length);
                    } catch (statError) {
                        console.warn('BACKGROUND: Failed to track AI topic lines:', statError);
                    }
                }
                
                sendResponse({ success: true, topics: data.topics });

            } catch (error) {
                console.error('BACKGROUND: Error generating topic lines:', error);
                const errorMessage = error.message || 'Network error - please check your connection';
                sendResponse({ success: false, error: errorMessage });
            }
        })();
        return true;
    }

    // Generate Post (AI) - Using Backend API ONLY
    if (request.action === 'generatePost') {
        (async () => {
            try {
                // Check if AI content feature is allowed in plan
                const canUseAiContent = await featureChecker.checkFeature('aiContent');
                if (!canUseAiContent) {
                    console.error("❌ BACKGROUND: AI content feature not allowed in current plan");
                    sendResponse({ 
                        success: false, 
                        error: 'AI content generation is not available in your plan. Please upgrade to create posts with AI!',
                        requiresUpgrade: true,
                        feature: 'aiContent'
                    });
                    return;
                }

                console.log('BACKGROUND: Generating post with backend API');
                const { topic, template, tone, length, includeHashtags, includeEmojis, targetAudience, keyMessage, userBackground } = request;

                // Get auth token and API URL
                const storage = await chrome.storage.local.get(['authToken', 'apiBaseUrl']);
                const token = storage.authToken;
                let apiUrl = storage.apiBaseUrl;
                if (!apiUrl || apiUrl.includes('backend-buxx') || apiUrl.includes('backend-api-orcin') || apiUrl.includes('backend-4poj')) {
                    apiUrl = API_CONFIG.BASE_URL;
                }

                // Authentication is required
                if (!token) {
                    sendResponse({ success: false, error: 'Please login to use this feature' });
                    return;
                }

                // Use backend API with all parameters
                const response = await fetch(`${apiUrl}/api/ai/generate-post`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        topic,
                        template,
                        tone,
                        length,
                        includeHashtags,
                        includeEmojis,
                        targetAudience,
                        keyMessage,
                        userBackground
                    })
                });

                const data = await response.json();

                if (!response.ok || !data.success) {
                    console.error('BACKGROUND: Backend API error:', data.error || response.statusText);

                    // Handle specific errors
                    if (response.status === 403 || (data.error && data.error.includes('plan'))) {
                        sendResponse({ success: false, error: data.error || 'AI generation not available in your plan' });
                    } else if (response.status === 429) {
                        sendResponse({ success: false, error: data.error || 'Daily limit reached' });
                    } else {
                        sendResponse({ success: false, error: data.error || 'Failed to generate post' });
                    }
                    return;
                }

                console.log('BACKGROUND: Generated post from backend');
                
                // Track AI post generation
                if (data.content) {
                    try {
                        await backgroundStatistics.recordAiPost(data.content);
                    } catch (statError) {
                        console.warn('BACKGROUND: Failed to track AI post:', statError);
                    }
                }
                
                sendResponse({ success: true, content: data.content });

            } catch (error) {
                console.error('BACKGROUND: Post generation error:', error);
                const errorMessage = error.message || 'Network error - please check your connection';
                sendResponse({ success: false, error: errorMessage });
            }
        })();
        return true;
    }

    // Generate Trending Post
    if (request.action === 'generateTrendingPost') {
        (async () => {
            try {
                console.log('BACKGROUND: Generating trending post');
                const { template, tone, includeHashtags } = request;

                // Use already imported trendingContentGenerator
                const post = await trendingContentGenerator.generatePost(template, tone, includeHashtags);

                sendResponse({ success: true, post });
            } catch (error) {
                console.error('BACKGROUND: Trending post generation error:', error);
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }

    // Post to LinkedIn
    if (request.action === 'postToLinkedIn') {
        (async () => {
            try {
                console.log('BACKGROUND: Posting to LinkedIn');
                const { content } = request;

                // Always create a new tab to ensure clean state
                console.log('BACKGROUND: Creating new LinkedIn tab...');
                const tab = await chrome.tabs.create({
                    url: 'https://www.linkedin.com/feed/',
                    active: true
                });
                console.log('BACKGROUND: Created LinkedIn tab:', tab.id);

                // Wait for tab to fully load
                await new Promise((resolve) => {
                    const checkComplete = (tabId, changeInfo) => {
                        if (tabId === tab.id && changeInfo.status === 'complete') {
                            chrome.tabs.onUpdated.removeListener(checkComplete);
                            resolve();
                        }
                    };
                    chrome.tabs.onUpdated.addListener(checkComplete);
                    // Timeout after 30 seconds
                    setTimeout(() => {
                        chrome.tabs.onUpdated.removeListener(checkComplete);
                        resolve();
                    }, 30000);
                });
                
                console.log('BACKGROUND: Tab loaded, waiting 5s for page to render...');
                await new Promise(resolve => setTimeout(resolve, 5000));

                // Verify tab still exists
                try {
                    await chrome.tabs.get(tab.id);
                } catch (e) {
                    throw new Error('LinkedIn tab was closed');
                }

                // Single script injection - using ONLY the exact working selectors
                console.log('BACKGROUND: Injecting posting script...');
                const result = await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: (postContent) => {
                        return new Promise((resolve) => {
                            console.log('LinkedIn Post Script: Starting...');
                            
                            // EXACT SELECTORS from old working extension
                            const SELECTORS = {
                                startPostButton: 'div.share-box-feed-entry__top-bar button',
                                postEditor: 'div.editor-container > div > div > div.ql-editor',
                                postSubmitButton: 'div.share-box_actions button'
                            };
                            
                            // Step 1: Find and click "Start a post" button
                            const startPostBtn = document.querySelector(SELECTORS.startPostButton);
                            
                            if (!startPostBtn) {
                                console.error('LinkedIn Post Script: Start post button not found with selector:', SELECTORS.startPostButton);
                                resolve({ success: false, error: 'Start post button not found' });
                                return;
                            }
                            
                            console.log('LinkedIn Post Script: Found start button, clicking...');
                            startPostBtn.click();
                            
                            // Step 2: Wait 3s for modal to open, then find editor
                            setTimeout(() => {
                                console.log('LinkedIn Post Script: Looking for editor...');
                                
                                const editor = document.querySelector(SELECTORS.postEditor);
                                
                                if (!editor) {
                                    console.error('LinkedIn Post Script: Editor not found with selector:', SELECTORS.postEditor);
                                    resolve({ success: false, error: 'Editor not found - modal may not have opened' });
                                    return;
                                }
                                
                                console.log('LinkedIn Post Script: Found editor, inserting content...');
                                
                                // Clear and focus editor
                                editor.innerHTML = '';
                                editor.focus();
                                
                                // Insert content with formatting
                                const lines = postContent.split('\n');
                                lines.forEach((line) => {
                                    if (line.trim() === '') {
                                        const br = document.createElement('br');
                                        editor.appendChild(br);
                                    } else {
                                        const p = document.createElement('p');
                                        p.textContent = line;
                                        editor.appendChild(p);
                                    }
                                });
                                
                                // Trigger input event to let LinkedIn know content changed
                                editor.dispatchEvent(new Event('input', { bubbles: true }));
                                console.log('LinkedIn Post Script: Content inserted successfully');
                                
                                // Step 3: Wait 3s then click Post button
                                setTimeout(() => {
                                    console.log('LinkedIn Post Script: Looking for Post button...');
                                    
                                    // Find all buttons in share-box_actions and get the one with "Post" text
                                    const actionButtons = document.querySelectorAll(SELECTORS.postSubmitButton);
                                    let postButton = null;
                                    
                                    for (const btn of actionButtons) {
                                        const text = btn.textContent?.trim().toLowerCase() || '';
                                        if (text === 'post') {
                                            postButton = btn;
                                            break;
                                        }
                                    }
                                    
                                    if (postButton && !postButton.disabled) {
                                        console.log('LinkedIn Post Script: Clicking Post button...');
                                        postButton.click();
                                        resolve({ success: true, posted: true });
                                    } else if (postButton && postButton.disabled) {
                                        console.log('LinkedIn Post Script: Post button is disabled');
                                        resolve({ success: true, posted: false, message: 'Content inserted but Post button disabled - click manually' });
                                    } else {
                                        console.log('LinkedIn Post Script: Post button not found');
                                        resolve({ success: true, posted: false, message: 'Content inserted, please click Post manually' });
                                    }
                                }, 3000);
                                
                            }, 3000); // Wait 3s for modal to open
                        });
                    },
                    args: [content]
                });
                
                const scriptResult = result?.[0]?.result;
                console.log('BACKGROUND: Script result:', scriptResult);

                sendResponse({ 
                    success: scriptResult?.success || false, 
                    tabId: tab.id,
                    posted: scriptResult?.posted || false,
                    message: scriptResult?.message
                });
            } catch (error) {
                console.error('BACKGROUND: LinkedIn posting error:', error);
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }

    // Get Scheduled Posts
    if (request.action === 'getScheduledPosts') {
        (async () => {
            try {
                const posts = await storage.get('scheduledPosts') || [];
                sendResponse({ success: true, posts });
            } catch (error) {
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }

    // Save Draft
    if (request.action === 'saveDraft') {
        (async () => {
            try {
                const drafts = await storage.get('savedDrafts') || [];
                drafts.push({
                    id: Date.now(),
                    content: request.content,
                    topic: request.topic,
                    createdAt: new Date().toISOString()
                });
                await storage.set('savedDrafts', drafts);
                sendResponse({ success: true, drafts });
            } catch (error) {
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }

    // Get Drafts
    if (request.action === 'getDrafts') {
        (async () => {
            try {
                const drafts = await storage.get('savedDrafts') || [];
                sendResponse({ success: true, drafts });
            } catch (error) {
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }

    // Get Profile Data
    if (request.action === 'GET_PROFILE_DATA') {
        (async () => {
            try {
                console.log('BACKGROUND: Getting profile data');

                // Get current active tab
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

                if (!tab || !tab.url || !tab.url.includes('linkedin.com')) {
                    sendResponse({ success: false, error: 'Not on LinkedIn profile page' });
                    return;
                }

                // Execute profileScraper in the tab context
                const results = await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: profileScraper
                });

                const profileData = results && results[0] && results[0].result;

                if (profileData) {
                    sendResponse({ success: true, data: profileData });
                } else {
                    sendResponse({ success: false, error: 'Failed to scrape profile data' });
                }
            } catch (error) {
                console.error('BACKGROUND: Profile data error:', error);
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }

    // ========== BULK SCHEDULER HANDLERS ==========

    if (request.action === "addBulkSchedule") {
        (async () => {
            try {
                const result = await bulkScheduler.addSchedule(request.schedule);
                sendResponse(result);
            } catch (error) {
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }

    if (request.action === "removeBulkSchedule") {
        (async () => {
            try {
                const result = await bulkScheduler.removeSchedule(request.index);
                sendResponse(result);
            } catch (error) {
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }

    if (request.action === "setBulkSchedulerEnabled") {
        (async () => {
            try {
                const result = await bulkScheduler.setEnabled(request.enabled);
                sendResponse(result);
            } catch (error) {
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }

    if (request.action === "getBulkSchedulerStatus") {
        (async () => {
            try {
                const status = await bulkScheduler.getStatus();
                sendResponse({ success: true, status });
            } catch (error) {
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }

    if (request.action === "getBulkSchedulerCountdown") {
        try {
            const countdown = bulkScheduler.getCountdown();
            sendResponse({ success: true, countdown });
        } catch (error) {
            sendResponse({ success: false, error: error.message });
        }
        return true;
    }

    // ========== PEOPLE SEARCH SCHEDULER HANDLERS ==========

    if (request.action === "addPeopleSchedule") {
        (async () => {
            try {
                const result = await peopleSearchScheduler.addSchedule(request.schedule);
                sendResponse(result);
            } catch (error) {
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }

    if (request.action === "removePeopleSchedule") {
        (async () => {
            try {
                const result = await peopleSearchScheduler.removeSchedule(request.index);
                sendResponse(result);
            } catch (error) {
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }

    if (request.action === "setPeopleSchedulerEnabled") {
        (async () => {
            try {
                const result = await peopleSearchScheduler.setEnabled(request.enabled);
                sendResponse(result);
            } catch (error) {
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }

    if (request.action === "getPeopleSchedulerStatus") {
        (async () => {
            try {
                const status = await peopleSearchScheduler.getStatus();
                sendResponse({ success: true, status });
            } catch (error) {
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }

    if (request.action === "getPeopleSchedulerCountdown") {
        try {
            const countdown = peopleSearchScheduler.getCountdown();
            sendResponse({ success: true, countdown });
        } catch (error) {
            sendResponse({ success: false, error: error.message });
        }
        return true;
    }

    // ========== IMPORT SCHEDULER HANDLERS ==========

    if (request.action === "getImportSchedulerStatus") {
        (async () => {
            try {
                const status = await importScheduler.getStatus();
                sendResponse({ success: true, status });
            } catch (error) {
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }

    if (request.action === "reloadImportScheduler") {
        (async () => {
            try {
                const status = await importScheduler.reload();
                sendResponse({ success: true, status });
            } catch (error) {
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }

    if (request.action === "setImportSchedulerEnabled") {
        (async () => {
            try {
                const result = await importScheduler.setEnabled(request.enabled);
                sendResponse(result);
            } catch (error) {
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }

    if (request.action === "setImportProfilesPerDay") {
        (async () => {
            try {
                const result = await importScheduler.setProfilesPerDay(request.count);
                sendResponse(result);
            } catch (error) {
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }

    if (request.action === "addImportSchedule") {
        (async () => {
            try {
                const result = await importScheduler.addSchedule(request.time, request.options);
                sendResponse(result);
            } catch (error) {
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }

    if (request.action === "removeImportSchedule") {
        (async () => {
            try {
                const result = await importScheduler.removeSchedule(request.time);
                sendResponse(result);
            } catch (error) {
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }

    // Update Daily Schedule
    if (request.action === "updateDailySchedule") {
        (async () => {
            try {
                console.log("BACKGROUND: Updating daily schedule:", request.schedule);
                await businessHoursScheduler.updateDailySchedule(request.schedule);
                sendResponse({ success: true, message: 'Daily schedule updated successfully' });
            } catch (error) {
                console.error("BACKGROUND: Failed to update daily schedule:", error);
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }

    // Generate AI comment - Using Backend API ONLY
    if (request.action === "generateCommentFromContent") {
        (async () => {
            console.log("🤖 BACKGROUND: Generating AI comment for post");
            try {
                // Check if AI comment feature is allowed in plan
                const canUseAiComment = await featureChecker.checkFeature('autoComment');
                if (!canUseAiComment) {
                    console.error("❌ BACKGROUND: AI comment feature not allowed in current plan");
                    sendResponse({ 
                        success: false, 
                        error: 'AI comment generation is not available in your plan. Please upgrade to use AI-powered comments.',
                        requiresUpgrade: true,
                        feature: 'autoComment'
                    });
                    return;
                }

                // Extract all parameters from request (sent by content script or automation)
                const { 
                    postText, 
                    authorName,
                    goal,
                    tone,
                    commentLength,
                    userExpertise,
                    userBackground
                } = request;
                
                // Log scraped data from content script
                console.log('📥 BACKGROUND: Received scraped data from page:');
                console.log('   📝 Post text:', postText ? `${postText.substring(0, 100)}...` : 'MISSING');
                console.log('   👤 Author name:', authorName || 'MISSING');

                // Get auth token and API URL
                const storage = await chrome.storage.local.get(['authToken', 'apiBaseUrl', 'commentSettings']);
                const token = storage.authToken;
                let apiUrl = storage.apiBaseUrl;
                if (!apiUrl || apiUrl.includes('backend-buxx') || apiUrl.includes('backend-api-orcin') || apiUrl.includes('backend-4poj')) {
                    apiUrl = API_CONFIG.BASE_URL;
                }

                // Authentication is required
                if (!token) {
                    sendResponse({ success: false, error: 'Please login to use this feature' });
                    return;
                }

                // Use settings from request if provided, otherwise load from storage
                const storedSettings = storage.commentSettings || {};
                const finalGoal = goal || storedSettings.goal || 'AddValue';
                const finalTone = tone || storedSettings.tone || 'Professional';
                const finalLength = commentLength || storedSettings.commentLength || 'Short';
                const finalStyle = storedSettings.commentStyle || 'direct';
                const finalExpertise = userExpertise !== undefined ? userExpertise : (storedSettings.userExpertise || '');
                const finalBackground = userBackground !== undefined ? userBackground : (storedSettings.userBackground || '');
                
                console.log('⚙️ BACKGROUND: Using comment settings:', {
                    goal: finalGoal,
                    tone: finalTone,
                    length: finalLength,
                    style: finalStyle,
                    expertise: finalExpertise || 'none',
                    background: finalBackground || 'none'
                });

                // Use backend API with all parameters including author name
                console.log('📡 BACKGROUND: Calling AI API with author name:', authorName || 'there');
                const response = await fetch(`${apiUrl}/api/ai/generate-comment`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        postText,
                        tone: finalTone,
                        goal: finalGoal,
                        commentLength: finalLength,
                        commentStyle: finalStyle,
                        userExpertise: finalExpertise,
                        userBackground: finalBackground,
                        authorName: authorName || 'there',
                        useProfileStyle: storedSettings.useProfileStyle === true
                    })
                });

                const data = await response.json();

                if (!response.ok || !data.success) {
                    console.error('BACKGROUND: Backend API error:', data.error || response.statusText);

                    // Handle specific errors
                    if (response.status === 403 || (data.error && data.error.includes('plan'))) {
                        sendResponse({ success: false, error: data.error || 'AI comment generation not available in your plan' });
                    } else if (response.status === 429) {
                        sendResponse({ success: false, error: data.error || 'Daily limit reached' });
                    } else {
                        sendResponse({ success: false, error: data.error || 'Failed to generate comment' });
                    }
                    return;
                }

                console.log("✅ BACKGROUND: Generated comment from backend:", data.content);
                
                // Track AI comment generation
                if (data.content) {
                    try {
                        await backgroundStatistics.recordAiComment(data.content);
                    } catch (statError) {
                        console.warn('BACKGROUND: Failed to track AI comment:', statError);
                    }
                }
                
                sendResponse({ success: true, comment: data.content });

            } catch (error) {
                console.error("❌ BACKGROUND: Failed to generate comment:", error);
                sendResponse({
                    success: false,
                    error: error.message,
                    comment: "Great post! Thanks for sharing." // Fallback
                });
            }
        })();
        return true;
    }

    // Check bulk processing state
    if (request.action === "checkBulkProcessingState") {
        (async () => {
            try {
                const { bulkProcessingActive } = await chrome.storage.local.get('bulkProcessingActive');
                const { liveProgress } = await chrome.storage.local.get('liveProgress');
                const isActive = bulkProcessingActive || (liveProgress && liveProgress.active && liveProgress.type === 'bulk_processing');
                sendResponse({ success: true, active: isActive });
            } catch (error) {
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }

    // Check people search state
    if (request.action === "checkPeopleSearchState") {
        (async () => {
            try {
                const { peopleSearchActive } = await chrome.storage.local.get('peopleSearchActive');
                const { liveProgress } = await chrome.storage.local.get('liveProgress');
                const isActive = peopleSearchActive || (liveProgress && liveProgress.active && liveProgress.type === 'people_search');
                sendResponse({ success: true, active: isActive });
            } catch (error) {
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }

    // Get console logs (for dashboard progress monitoring)
    if (request.action === "getConsoleLogs") {
        // Return empty logs since we don't need console log buffering anymore
        sendResponse({ success: true, logs: [] });
        return true;
    }

    // Handle automation progress updates
    if (request.action === "automationProgress") {
        // Store progress data for dashboard to retrieve
        chrome.storage.local.set({
            automationProgressData: {
                type: request.type,
                data: request.data,
                timestamp: Date.now()
            }
        });
        return true;
    }

    // Import Automation - Connection Requests
    if (request.action === "startImportConnections") {
        (async () => {
            try {
                // CHECK FEATURE PERMISSION
                const canUseImport = await featureChecker.checkFeature('importProfiles');
                if (!canUseImport) {
                    console.warn('🚫 BACKGROUND: Import feature denied - not in user plan');
                    sendResponse({ success: false, error: 'Import Profiles Auto Engagement requires a paid plan. Please upgrade!' });
                    return;
                }
                
                console.log('BACKGROUND: Starting import connection requests');
                const { profiles, options } = request;
                const result = await importAutomation.processConnectionRequests(profiles, options);
                console.log('BACKGROUND: Connection requests completed, sending response:', result);
                sendResponse({ success: true, result });
            } catch (error) {
                console.error('BACKGROUND: Import connection requests error:', error);
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }

    // Import Automation - Post Engagement
    if (request.action === "startImportEngagement") {
        (async () => {
            try {
                // CHECK FEATURE PERMISSION
                const canUseImport = await featureChecker.checkFeature('importProfiles');
                if (!canUseImport) {
                    console.warn('🚫 BACKGROUND: Import feature denied - not in user plan');
                    sendResponse({ success: false, error: 'Import Profiles Auto Engagement requires a paid plan. Please upgrade!' });
                    return;
                }
                
                console.log('BACKGROUND: Starting import post engagement');
                const { profiles, options } = request;
                const result = await importAutomation.processPostEngagement(profiles, options);
                sendResponse({ success: true, result });
            } catch (error) {
                console.error('BACKGROUND: Import post engagement error:', error);
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }

    // Import Automation - Get Status
    if (request.action === "getImportStatus") {
        const status = importAutomation.getStatus();
        sendResponse({ success: true, status });
        return true;
    }

    // Import Automation - Combined (Connection + Engagement)
    if (request.action === "startImportCombined") {
        (async () => {
            try {
                // CHECK FEATURE PERMISSION
                const canUseImport = await featureChecker.checkFeature('importProfiles');
                if (!canUseImport) {
                    console.warn('🚫 BACKGROUND: Import feature denied - not in user plan');
                    sendResponse({ success: false, error: 'Import Profiles Auto Engagement requires a paid plan. Please upgrade!' });
                    return;
                }
                
                console.log('BACKGROUND: Starting import combined automation');
                const { profiles, options } = request;
                const result = await importAutomation.processCombinedAutomation(profiles, options);
                sendResponse({ success: true, result });
            } catch (error) {
                console.error('BACKGROUND: Import combined automation error:', error);
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }

    // Import Automation - Stop
    if (request.action === "stopImportAutomation") {
        const result = importAutomation.stop();
        sendResponse(result);
        return true;
    }
    
    // Post Scheduler - Post missed posts manually
    if (request.action === "postMissedPosts") {
        (async () => {
            try {
                if (postScheduler) {
                    const result = await postScheduler.postMissedPosts();
                    sendResponse(result);
                } else {
                    sendResponse({ success: false, error: 'Post scheduler not initialized' });
                }
            } catch (error) {
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }
    
    // Post Scheduler - Reschedule missed posts
    if (request.action === "rescheduleMissedPosts") {
        (async () => {
            try {
                if (postScheduler) {
                    const result = await postScheduler.rescheduleMissedPosts(request.newDateTime);
                    sendResponse(result);
                } else {
                    sendResponse({ success: false, error: 'Post scheduler not initialized' });
                }
            } catch (error) {
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }
    
    // Post Scheduler - Get scheduler logs for debugging
    if (request.action === "getSchedulerLogs") {
        (async () => {
            try {
                const result = await chrome.storage.local.get('schedulerLogs');
                sendResponse({ success: true, logs: result.schedulerLogs || [] });
            } catch (error) {
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }

    // Default response
    console.log("BACKGROUND: Unhandled action:", request.action);
    sendResponse({ success: false, error: `Action '${request.action}' not implemented` });
    return true;
});

// --- ALARM LISTENERS ---
chrome.alarms.onAlarm.addListener(async (alarm) => {
    console.log('BACKGROUND: Alarm triggered:', alarm.name);

    // Daily trending post
    if (alarm.name === 'dailyTrendingPost') {
        await trendingContentGenerator.handleAlarmTrigger(alarm);
    }

    // Daily bulk processing
    if (alarm.name === 'dailyBulkProcessing') {
        if (businessHoursScheduler) {
            await businessHoursScheduler.handleDailyAlarm();
        }
    }

    // Bulk processing scheduler alarms
    if (alarm.name.startsWith('bulkProcess_')) {
        await bulkScheduler.handleAlarm(alarm.name);
    }

    // People search scheduler alarms
    if (alarm.name.startsWith('peopleSearch_')) {
        await peopleSearchScheduler.handleAlarm(alarm.name);
    }
    
    // Post scheduler alarm (for Writer tab scheduled posts)
    if (alarm.name === 'postSchedulerCheck') {
        if (postScheduler) {
            await postScheduler.handleAlarm();
        }
    }
    
    // Version check alarm
    if (alarm.name === 'versionCheck') {
        await versionChecker.handleAlarm(alarm);
    }
});

console.log("BACKGROUND: Clean service worker ready");
