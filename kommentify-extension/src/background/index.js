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
        (async () => {
            try {
                console.log('🤖 BACKGROUND: Generating AI comment from AI button...');
                console.log('BACKGROUND: Author:', request.authorName);
                console.log('BACKGROUND: Post text length:', request.postText?.length || 0);
                
                // Check if AI comment feature is allowed in plan
                const canUseAiComment = await featureChecker.checkFeature('autoComment');
                if (!canUseAiComment) {
                    console.error("❌ BACKGROUND: AI comment feature not allowed in current plan");
                    sendResponse({ 
                        success: false, 
                        error: 'AI comment generation is not available in your plan. Please upgrade!',
                        requiresUpgrade: true
                    });
                    return;
                }

                // Get auth token and API URL
                const storage = await chrome.storage.local.get(['authToken', 'apiBaseUrl', 'commentSettings']);
                const token = storage.authToken;
                let apiUrl = storage.apiBaseUrl;
                if (!apiUrl || apiUrl.includes('backend-buxx')) {
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
                        authorName: request.authorName || 'there'
                    })
                });

                const data = await response.json();

                if (!response.ok || !data.success) {
                    console.error('BACKGROUND: Backend API error:', data.error || response.statusText);
                    sendResponse({ success: false, error: data.error || 'Failed to generate comment' });
                    return;
                }

                console.log('✅ BACKGROUND: Generated comment:', data.content);
                
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
                console.error('❌ BACKGROUND: Error generating AI comment:', error);
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }

    // Scrape Profile Posts for Inspiration Sources
    if (request.action === "scrapeProfilePosts") {
        (async () => {
            try {
                console.log('✨ BACKGROUND: Scraping profile posts for inspiration...');
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
                
                // Open the profile's activity/posts page in a new tab
                const activityUrl = `https://www.linkedin.com/in/${username}/recent-activity/all/`;
                console.log('BACKGROUND: Opening activity page:', activityUrl);
                
                const tab = await chrome.tabs.create({ url: activityUrl, active: false });
                
                // Wait for page to fully load (LinkedIn needs more time)
                await new Promise(resolve => setTimeout(resolve, 5000));
                
                // Scroll to load more posts
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: () => {
                        window.scrollTo(0, document.body.scrollHeight);
                    }
                });
                
                // Wait for content to load after scroll
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Execute scraping script in the tab
                const results = await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: (maxPosts) => {
                        const posts = [];
                        
                        // Find all post containers with activity URN
                        const postElements = document.querySelectorAll('[data-id^="urn:li:activity:"]');
                        
                        console.log(`Found ${postElements.length} potential post elements`);
                        
                        // Get author name from the first post's actor section
                        let authorName = 'Unknown Author';
                        const firstActorTitle = document.querySelector('.update-components-actor__title span[dir="ltr"] span[aria-hidden="true"]');
                        if (firstActorTitle) {
                            authorName = firstActorTitle.textContent?.trim() || 'Unknown Author';
                        }
                        
                        let count = 0;
                        for (const post of postElements) {
                            if (count >= maxPosts) break;
                            
                            // Get post content - the text is in nested spans within update-components-text
                            const textContainer = post.querySelector('.update-components-text');
                            if (!textContainer) {
                                console.log('No text container found for post', count + 1);
                                continue;
                            }
                            
                            // Get all text content, cleaning up the formatting
                            let content = '';
                            const textSpans = textContainer.querySelectorAll('span[dir="ltr"]');
                            if (textSpans.length > 0) {
                                // Get the main content span (usually the one inside break-words)
                                const mainSpan = textContainer.querySelector('.break-words span[dir="ltr"]');
                                if (mainSpan) {
                                    content = mainSpan.innerText || mainSpan.textContent || '';
                                } else {
                                    // Fallback: join all text spans
                                    content = Array.from(textSpans).map(s => s.textContent).join(' ');
                                }
                            } else {
                                // Fallback to full text content
                                content = textContainer.textContent || '';
                            }
                            
                            // Clean up the content
                            content = content.replace(/\s+/g, ' ').trim();
                            content = content.replace(/…more$/, '').trim();
                            
                            if (!content || content.length < 50) {
                                console.log('Content too short or empty for post', count + 1, '- length:', content.length);
                                continue;
                            }
                            
                            // Get engagement metrics
                            const likesEl = post.querySelector('.social-details-social-counts__reactions-count');
                            const likesBtn = post.querySelector('button[aria-label*="reaction"]');
                            const commentsBtn = post.querySelector('button[aria-label*="comment"]');
                            
                            let likes = 0;
                            if (likesEl) {
                                likes = parseInt(likesEl.textContent?.replace(/[^0-9]/g, '') || '0');
                            } else if (likesBtn) {
                                const match = likesBtn.getAttribute('aria-label')?.match(/(\d+)/);
                                likes = match ? parseInt(match[1]) : 0;
                            }
                            
                            let comments = 0;
                            if (commentsBtn) {
                                const match = commentsBtn.getAttribute('aria-label')?.match(/(\d+)/);
                                comments = match ? parseInt(match[1]) : 0;
                            }
                            
                            console.log(`Post ${count + 1}: Found content (${content.length} chars), ${likes} likes, ${comments} comments`);
                            
                            posts.push({
                                content: content.substring(0, 5000),
                                likes: likes,
                                comments: comments,
                                authorName
                            });
                            
                            count++;
                        }
                        
                        console.log(`Successfully scraped ${posts.length} posts`);
                        return { posts, authorName };
                    },
                    args: [postCount]
                });
                
                // Close the tab
                await chrome.tabs.remove(tab.id);
                
                const scrapedData = results[0]?.result || { posts: [], authorName: 'Unknown' };
                
                if (scrapedData.posts.length === 0) {
                    console.log('BACKGROUND: No posts found after scraping');
                    sendResponse({ 
                        success: false, 
                        error: 'Could not find posts on this profile. The profile may have no recent posts or they may be private.' 
                    });
                    return;
                }
                
                console.log(`✅ BACKGROUND: Scraped ${scrapedData.posts.length} posts from ${scrapedData.authorName}`);
                sendResponse({ 
                    success: true, 
                    posts: scrapedData.posts,
                    authorName: scrapedData.authorName
                });
                
            } catch (error) {
                console.error('❌ BACKGROUND: Error scraping profile posts:', error);
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }

    // Get Comment Settings (for AI button manual review check)
    if (request.action === "getCommentSettings") {
        (async () => {
            try {
                const result = await chrome.storage.local.get('commentSettings');
                const settings = result.commentSettings || {
                    goal: 'AddValue',
                    tone: 'Friendly',
                    commentLength: 'Short',
                    userExpertise: '',
                    userBackground: '',
                    aiAutoPost: 'manual'  // Default to manual review
                };
                console.log('BACKGROUND: Returning comment settings:', settings);
                sendResponse(settings);
            } catch (error) {
                console.error('BACKGROUND: Error getting comment settings:', error);
                sendResponse({
                    goal: 'AddValue',
                    tone: 'Friendly',
                    commentLength: 'Short',
                    aiAutoPost: 'manual'
                });
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
                if (!apiUrl || apiUrl.includes('backend-buxx')) {
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
                if (!apiUrl || apiUrl.includes('backend-buxx') || apiUrl.includes('localhost')) {
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
                if (!apiUrl || apiUrl.includes('backend-buxx')) {
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
                if (!apiUrl || apiUrl.includes('backend-buxx')) {
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
                        authorName: authorName || 'there'
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
