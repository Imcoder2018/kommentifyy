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
import { syncAllSettingsFromWebsite } from '../shared/services/settingsSync.js';
import { profileScanner } from './profileScanner.js';
import { startAnalyticsSyncService, forceAnalyticsSync } from '../shared/services/analyticsSync.js';
import { startLiveLogger, liveLog } from '../shared/services/liveActivityLogger.js';

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

// Sync settings from website on startup + every 5 minutes
(async () => {
    try {
        await syncAllSettingsFromWebsite();
        console.log("BACKGROUND: Initial settings sync completed");
    } catch (e) { console.warn("BACKGROUND: Initial settings sync failed:", e); }
})();
setInterval(() => {
    syncAllSettingsFromWebsite().catch(e => console.warn("BACKGROUND: Periodic settings sync failed:", e));
}, 5 * 60 * 1000);

// Start analytics sync service (syncs extension analytics to website backend)
try {
    startAnalyticsSyncService();
    startLiveLogger();
    console.log("BACKGROUND: Analytics sync + live logger started");
} catch (error) {
    console.error("BACKGROUND: Failed to start analytics sync service:", error);
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

// Global helper to get fresh auth token
async function getFreshToken() {
    const storage = await chrome.storage.local.get(['authToken']);
    return storage.authToken;
}

// --- COMMAND POLLING VIA ALARM (independent of content scripts) ---
// This ensures commands from the website are picked up even if the dashboard tab is not open
if (!globalThis._commandPollAlarmCreated) {
    chrome.alarms.create('commandPoller', { periodInMinutes: 0.5 }); // every 30 seconds
    globalThis._commandPollAlarmCreated = true;
    console.log('BACKGROUND: Command poller alarm created (every 30s)');
}

// Standalone command polling function - called by alarm, no dependency on content scripts
async function pollCommandsDirectly() {
    // Reuse the same lock as the message handler
    if (typeof globalThis._pollCommandsRunning === 'undefined') globalThis._pollCommandsRunning = false;
    if (typeof globalThis._pollLockTimestamp === 'undefined') globalThis._pollLockTimestamp = 0;
    if (!globalThis._processingCommandIds) globalThis._processingCommandIds = new Set();
    if (!globalThis._commandLinkedInTabs) globalThis._commandLinkedInTabs = new Set();
    if (typeof globalThis._stopAllTasks === 'undefined') globalThis._stopAllTasks = false;

    if (globalThis._pollCommandsRunning) {
        const lockAge = Date.now() - globalThis._pollLockTimestamp;
        if (lockAge > 120000) {
            console.log('⚠️ POLL-ALARM: Lock held >', Math.round(lockAge / 1000), 's - releasing');
            globalThis._pollCommandsRunning = false;
        } else {
            return; // skip, already running
        }
    }
    globalThis._pollCommandsRunning = true;
    globalThis._pollLockTimestamp = Date.now();
    try {
        const { apiBaseUrl } = await chrome.storage.local.get(['apiBaseUrl']);
        const apiUrl = (apiBaseUrl && !apiBaseUrl.includes('backend-buxx') && !apiBaseUrl.includes('backend-api-orcin') && !apiBaseUrl.includes('backend-4poj')) ? apiBaseUrl : (API_CONFIG.BASE_URL || 'https://kommentify.com');
        
        // authToken now fetched via getFreshToken()
        if (!(await getFreshToken())) { globalThis._pollCommandsRunning = false; return; }

        // Send heartbeat to let dashboard know extension is alive
        try {
            const freshToken = await getFreshToken();
            await fetch(`${apiUrl}/api/extension/heartbeat`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${freshToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ timestamp: new Date().toISOString() })
            });
        } catch (hbErr) { /* heartbeat failure is non-critical */ }

        // Re-fetch token before command fetch to use fresh token
        const freshTokenForCommand = await getFreshToken();
        const response = await fetch(`${apiUrl}/api/extension/command`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${freshTokenForCommand}`, 'Content-Type': 'application/json' }
        });
        
        // Handle 401 authentication errors — attempt token refresh first
        if (response.status === 401) {
            console.warn('🔐 POLL-ALARM: Token expired (401), attempting refresh...');
            try {
                const refreshRes = await fetch(`${apiUrl}/api/auth/refresh`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${freshTokenForCommand}`, 'Content-Type': 'application/json' }
                });
                if (refreshRes.ok) {
                    const refreshData = await refreshRes.json();
                    if (refreshData.success && refreshData.token) {
                        await chrome.storage.local.set({ authToken: refreshData.token });
                        console.log('✅ POLL-ALARM: Token refreshed successfully, retrying command fetch...');
                        // Retry the command fetch immediately with new token
                        const retryResponse = await fetch(`${apiUrl}/api/extension/command`, {
                            method: 'GET',
                            headers: { 'Authorization': `Bearer ${refreshData.token}`, 'Content-Type': 'application/json' }
                        });
                        if (retryResponse.ok) {
                            const retryData = await retryResponse.json();
                            console.log(`📥 POLL-ALARM (retry): status=${retryResponse.status}, commands=${retryData.commands?.length || 0}, queueStatus=${retryData.queueStatus}`);
                            if (retryData.success && retryData.commands && retryData.commands.length > 0) {
                                // Process commands inline (will continue below via data variable)
                                globalThis._pollCommandsRunning = false;
                                // Re-call self to process with fresh token
                                return pollCommandsDirectly();
                            }
                        }
                        globalThis._pollCommandsRunning = false;
                        return;
                    }
                } else {
                    console.error('❌ POLL-ALARM: Refresh endpoint returned:', refreshRes.status);
                }
            } catch (refreshErr) {
                console.error('❌ POLL-ALARM: Token refresh failed:', refreshErr);
            }
            // Refresh failed — clear token and notify user
            console.error('🔐 POLL-ALARM: Token refresh failed, clearing auth');
            await chrome.storage.local.remove(['authToken']);
            try {
                await chrome.notifications.create({
                    type: 'basic',
                    iconUrl: chrome.runtime.getURL('icons/icon128.png'),
                    title: 'Kommentify - Authentication Expired',
                    message: 'Please re-login to the extension to continue.',
                    priority: 2
                });
            } catch (e) { /* notification may fail in MV3 */ }
            globalThis._pollCommandsRunning = false;
            return;
        }
        
        const data = await response.json();
        console.log(`📋 POLL-ALARM: status=${response.status}, commands=${data.commands?.length || 0}, queueStatus=${data.queueStatus || 'unknown'}, pendingCount=${data.pendingCount ?? '?'}`);

        if (data.success && data.commands && data.commands.length > 0) {
            console.log(`📥 POLL-ALARM: Found ${data.commands.length} pending commands`);
            // Trigger the message handler to process them
            // We send a message to ourselves - but in MV3 this doesn't work for service workers
            // So instead, process inline using the same logic
            for (const cmd of data.commands) {
                if (globalThis._processingCommandIds.has(cmd.id)) continue;
                if (globalThis._stopAllTasks) break;
                globalThis._processingCommandIds.add(cmd.id);

                // Mark as in_progress
                try {
                    const token = await getFreshToken();
                    await fetch(`${apiUrl}/api/extension/command`, {
                        method: 'PUT',
                        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({ commandId: cmd.id, status: 'in_progress' })
                    });
                } catch (e) {}

                // --- scrape_profile ---
                if (cmd.command === 'scrape_profile' && cmd.data?.profileUrl) {
                    console.log('🔍 POLL-ALARM: Executing scrape_profile for:', cmd.data.profileUrl);
                    try {
                        const result = await scrapeProfilePostsImpl(cmd.data.profileUrl, cmd.data.postCount || 10);
                        const token = await getFreshToken();
                        await fetch(`${apiUrl}/api/extension/command`, {
                            method: 'PUT',
                            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                            body: JSON.stringify({ commandId: cmd.id, status: result.success ? 'completed' : 'failed' })
                        });
                        console.log('✅ POLL-ALARM: scrape_profile done:', result.success);
                    } catch (e) {
                        console.error('❌ POLL-ALARM: scrape_profile failed:', e);
                        try { 
                            const token = await getFreshToken();
                            await fetch(`${apiUrl}/api/extension/command`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ commandId: cmd.id, status: 'failed' }) }); 
                        } catch (x) {}
                    } finally { globalThis._processingCommandIds.delete(cmd.id); }
                }

                // --- scrape_feed_now (time-based) ---
                else if (cmd.command === 'scrape_feed_now') {
                    console.log('🔍 POLL-ALARM: Executing scrape_feed_now (time-based)...');
                    let scrapeTab = null;
                    let scrapeWindowId = null;
                    try {
                        // Mark as in_progress
                        const token = await getFreshToken();
                        await fetch(`${apiUrl}/api/extension/command`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ commandId: cmd.id, status: 'in_progress', data: { postsFound: 0, scrollCount: 0, message: 'Opening LinkedIn feed...' } }) });
                        // Open in a new focused window (half screen width)
                        const currentWindow = await chrome.windows.getCurrent();
                        const halfWidth = Math.floor((currentWindow.width || 1920) / 2);
                        const newWindow = await chrome.windows.create({
                            url: 'https://www.linkedin.com/feed/',
                            type: 'normal',
                            focused: true,
                            left: 0,
                            top: 0,
                            width: halfWidth,
                            height: currentWindow.height || 1080
                        });
                        scrapeTab = newWindow.tabs[0];
                        scrapeWindowId = newWindow.id;
                        globalThis._commandLinkedInTabs.add(scrapeTab.id);
                        await new Promise((resolve) => {
                            const check = (tabId, info) => { if (tabId === scrapeTab.id && info.status === 'complete') { chrome.tabs.onUpdated.removeListener(check); resolve(); } };
                            chrome.tabs.onUpdated.addListener(check);
                            setTimeout(() => { chrome.tabs.onUpdated.removeListener(check); resolve(); }, 30000);
                        });
                        await new Promise(r => setTimeout(r, 5000));
                        const durationMs = (cmd.data?.durationMinutes || 3) * 60 * 1000;
                        const minLikes = cmd.data?.minLikes || 0;
                        const minComments = cmd.data?.minComments || 0;
                        const keywords = cmd.data?.keywords ? cmd.data.keywords.split(',').map(k => k.trim().toLowerCase()).filter(Boolean) : [];
                        const startTime = Date.now();
                        let scrollCount = 0;
                        console.log(`POLL-ALARM: Scrolling for ${cmd.data?.durationMinutes || 3} minutes...`);
                        // Scroll continuously for the duration
                        while (Date.now() - startTime < durationMs) {
                            // Check if cancelled
                            try {
                                const statusRes = await fetch(`${apiUrl}/api/extension/command/all`, { headers: { 'Authorization': `Bearer ${await getFreshToken()}` } });
                                const statusData = await statusRes.json();
                                const currentCmd = statusData.commands?.find(c => c.id === cmd.id);
                                if (currentCmd && (currentCmd.status === 'cancelled' || currentCmd.status === 'failed')) {
                                    console.log('POLL-ALARM: Scrape cancelled by user');
                                    break;
                                }
                            } catch (e) {}
                            await scrollAndLoadContent(scrapeTab.id, 1);
                            scrollCount++;
                            // Inject/update on-page status overlay
                            const elapsed = Math.floor((Date.now() - startTime) / 1000);
                            const remaining = Math.max(0, Math.floor((durationMs - (Date.now() - startTime)) / 1000));
                            try {
                                const countResult = await chrome.scripting.executeScript({
                                    target: { tabId: scrapeTab.id },
                                    func: (minL, minC, kws, elapsedSec, remainingSec, scrollNum) => {
                                        // Count posts on page
                                        let totalPosts = 0, qualifiedPosts = 0;
                                        const els = document.querySelectorAll('[data-id^="urn:li:activity:"]');
                                        for (const el of els) {
                                            const textEl = el.querySelector('.update-components-text, .feed-shared-text, .feed-shared-inline-show-more-text');
                                            const content = textEl ? (textEl.innerText || '').trim() : '';
                                            if (content.length < 50) continue;
                                            totalPosts++;
                                            let likes = 0, comments = 0;
                                            const likesEl = el.querySelector('.social-details-social-counts__reactions-count');
                                            if (likesEl) { const m = likesEl.textContent?.match(/(\d+(?:,\d+)*)/); if (m) likes = parseInt(m[1].replace(/,/g, '')); }
                                            const commentsEl = el.querySelector('button[aria-label*="comment"]');
                                            if (commentsEl) { const m = commentsEl.getAttribute('aria-label')?.match(/(\d+)/); if (m) comments = parseInt(m[1]); }
                                            if (likes < minL || comments < minC) continue;
                                            if (kws.length > 0 && !kws.some(kw => content.toLowerCase().includes(kw))) continue;
                                            qualifiedPosts++;
                                        }
                                        // Update/create overlay
                                        let overlay = document.getElementById('kommentify-scrape-status');
                                        if (!overlay) {
                                            overlay = document.createElement('div');
                                            overlay.id = 'kommentify-scrape-status';
                                            overlay.style.cssText = 'position:fixed;top:12px;right:12px;z-index:99999;background:linear-gradient(135deg,#1a1a2e,#16213e);color:#fff;padding:16px 20px;border-radius:14px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:13px;line-height:1.6;box-shadow:0 8px 32px rgba(0,0,0,0.4);border:1px solid rgba(105,63,233,0.3);min-width:240px;';
                                            document.body.appendChild(overlay);
                                        }
                                        const mins = Math.floor(remainingSec / 60);
                                        const secs = remainingSec % 60;
                                        overlay.innerHTML = `
                                            <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
                                                <div style="width:10px;height:10px;background:#4ade80;border-radius:50%;animation:kPulse 1.5s infinite;"></div>
                                                <strong style="font-size:14px;color:#a78bfa;">Kommentify Feed Scraper</strong>
                                            </div>
                                            <div style="margin-bottom:6px;">Posts found: <strong style="color:#4ade80;">${totalPosts}</strong></div>
                                            <div style="margin-bottom:6px;">Qualified: <strong style="color:#fbbf24;">${qualifiedPosts}</strong></div>
                                            <div style="margin-bottom:6px;font-size:12px;opacity:0.7;">Filter: ${minL}+ likes, ${minC}+ comments</div>
                                            <div style="margin-bottom:6px;font-size:12px;opacity:0.7;">Scrolls: ${scrollNum}</div>
                                            <div style="font-size:12px;color:#a78bfa;">Time left: <strong>${mins}m ${secs}s</strong></div>
                                            <div style="margin-top:8px;height:4px;background:rgba(255,255,255,0.1);border-radius:2px;overflow:hidden;">
                                                <div style="height:100%;background:linear-gradient(90deg,#693fe9,#a78bfa);border-radius:2px;width:${Math.min(100, (elapsedSec / (elapsedSec + remainingSec)) * 100)}%;transition:width 0.5s;"></div>
                                            </div>
                                            <style>@keyframes kPulse{0%,100%{opacity:1}50%{opacity:0.4}}</style>
                                        `;
                                        return { totalPosts, qualifiedPosts };
                                    },
                                    args: [minLikes, minComments, keywords, elapsed, remaining, scrollCount]
                                });
                                // Update command status with progress
                                const counts = countResult?.[0]?.result || { totalPosts: 0, qualifiedPosts: 0 };
                                if (scrollCount % 3 === 0) {
                                    await fetch(`${apiUrl}/api/extension/command`, { method: 'PUT', headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ commandId: cmd.id, status: 'in_progress', data: { ...cmd.data, postsFound: counts.totalPosts, qualifiedPosts: counts.qualifiedPosts, scrollCount, elapsedSeconds: elapsed, remainingSeconds: remaining, message: `Scrolling feed... ${counts.totalPosts} posts found, ${counts.qualifiedPosts} qualified` } }) });
                                }
                            } catch (overlayErr) { /* tab may have issues */ }
                            await new Promise(r => setTimeout(r, 3000));
                        }
                        await new Promise(r => setTimeout(r, 2000));
                        const scrapeResult = await chrome.scripting.executeScript({
                            target: { tabId: scrapeTab.id },
                            func: (minL, minC, kws) => {
                                const posts = [];
                                const els = document.querySelectorAll('[data-id^="urn:li:activity:"]');
                                for (const el of els) {
                                    const textEl = el.querySelector('.update-components-text, .feed-shared-text, .feed-shared-inline-show-more-text');
                                    let content = textEl ? (textEl.innerText || '').trim() : '';
                                    content = content.replace(/[\s\n]*\.{2,3}more\s*$/i, '').replace(/[\s\n]*\u2026more\s*$/i, '').trim();
                                    if (content.length < 50) continue;
                                    let likes = 0, comments = 0;
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
                                    let imageUrl = null;
                                    const imgEl = el.querySelector('.update-components-image img, .feed-shared-image img, img.ivm-view-attr__img--centered[src*="feedshare"]');
                                    if (imgEl && imgEl.src && imgEl.src.includes('media.licdn.com')) imageUrl = imgEl.src;
                                    posts.push({ postContent: content.substring(0, 5000), authorName, likes, comments, shares: 0, postUrl, imageUrl });
                                }
                                return posts;
                            },
                            args: [minLikes, minComments, keywords]
                        });
                        const scrapedPosts = scrapeResult?.[0]?.result || [];
                        console.log(`POLL-ALARM: Scraped ${scrapedPosts.length} posts from feed`);
                        if (scrapedPosts.length > 0) {
                            await fetch(`${apiUrl}/api/scraped-posts`, { method: 'POST', headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ posts: scrapedPosts }) });
                        }
                        await fetch(`${apiUrl}/api/extension/command`, { method: 'PUT', headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ commandId: cmd.id, status: 'completed', data: { ...cmd.data, postsFound: scrapedPosts.length, scrollCount, message: `Completed! Saved ${scrapedPosts.length} posts from feed.` } }) });
                        console.log(`✅ POLL-ALARM: scrape_feed_now done, saved ${scrapedPosts.length} posts`);
                    } catch (e) {
                        console.error('❌ POLL-ALARM: scrape_feed_now failed:', e);
                        try { await fetch(`${apiUrl}/api/extension/command`, { method: 'PUT', headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ commandId: cmd.id, status: 'failed', data: { ...cmd.data, message: 'Scraping failed: ' + (e.message || 'unknown error') } }) }); } catch (x) {}
                    } finally {
                        if (scrapeWindowId) { try { await chrome.windows.remove(scrapeWindowId); } catch (e) {} }
                        if (scrapeTab) { globalThis._commandLinkedInTabs.delete(scrapeTab.id); }
                        globalThis._processingCommandIds.delete(cmd.id);
                    }
                }

                // --- scrape_comments ---
                else if (cmd.command === 'scrape_comments' && cmd.data?.profileUrl) {
                    console.log('💬 POLL-ALARM: Executing scrape_comments for:', cmd.data.profileUrl);
                    let commentTab = null;
                    // Helper to send live overlay status to the scrape tab
                    const sendOverlay = async (tabId, message, type = 'info') => {
                        try { await chrome.tabs.sendMessage(tabId, { action: 'updateNetworkingStatus', message, type }); } catch (e) {}
                    };
                    try {
                        const profileUrl = cmd.data.profileUrl.replace(/\/+$/, '');
                        const urlMatch = profileUrl.match(/linkedin\.com\/in\/([^\/\?]+)/);
                        const targetProfileId = urlMatch ? urlMatch[1] : 'unknown';
                        const activityUrl = `${profileUrl}/recent-activity/comments/`;
                        const tab = await chrome.tabs.create({ url: activityUrl, active: false });
                        commentTab = tab;
                        globalThis._commandLinkedInTabs.add(tab.id);
                        await new Promise((resolve) => {
                            const check = (tabId, info) => { if (tabId === tab.id && info.status === 'complete') { chrome.tabs.onUpdated.removeListener(check); resolve(); } };
                            chrome.tabs.onUpdated.addListener(check);
                            setTimeout(() => { chrome.tabs.onUpdated.removeListener(check); resolve(); }, 30000);
                        });
                        await new Promise(r => setTimeout(r, 5000));
                        await sendOverlay(tab.id, `🔍 Kommentify: Loading comments for ${targetProfileId}...`, 'info');
                        await scrollAndLoadContent(tab.id, 8);
                        await new Promise(r => setTimeout(r, 2000));
                        await sendOverlay(tab.id, `📝 Kommentify: Extracting comments from ${targetProfileId}...`, 'info');
                        const scrapeResult = await chrome.scripting.executeScript({
                            target: { tabId: tab.id },
                            func: (targetId) => {
                                const results = [];
                                const postCards = document.querySelectorAll('.profile-creator-shared-feed-update__container, [data-urn*="activity"], .feed-shared-update-v2');
                                for (const card of postCards) {
                                    const postTextEl = card.querySelector('.update-components-text, .feed-shared-text');
                                    const postText = postTextEl ? postTextEl.innerText?.trim() : '';
                                    if (!postText || postText.length < 20) continue;
                                    const commentEls = card.querySelectorAll('.comments-comment-item, .comments-comment-entity');
                                    for (const cEl of commentEls) {
                                        const commentTextEl = cEl.querySelector('.comments-comment-item__main-content, .update-components-text');
                                        const commentText = commentTextEl ? commentTextEl.innerText?.trim() : '';
                                        if (!commentText || commentText.length < 5) continue;
                                        const authorEl = cEl.querySelector('.comments-post-meta__name-text a, .comments-comment-item__post-meta a');
                                        const authorName = authorEl ? authorEl.textContent?.trim() : '';
                                        const authorLink = authorEl ? authorEl.href : '';
                                        const isTargetComment = authorLink.includes(`/in/${targetId}`);
                                        if (isTargetComment) {
                                            results.push({ postText: postText.substring(0, 2000), context: 'DIRECT COMMENT ON POST', commentText: commentText.substring(0, 1000) });
                                        }
                                    }
                                }
                                return { comments: results, count: results.length };
                            },
                            args: [targetProfileId]
                        });
                        const result = scrapeResult?.[0]?.result || { comments: [], count: 0 };
                        console.log(`POLL-ALARM: Scraped ${result.count} comments from ${targetProfileId}`);
                        if (result.comments.length > 0) {
                            await sendOverlay(tab.id, `💾 Kommentify: Saving ${result.count} comments for ${targetProfileId}...`, 'info');
                            await fetch(`${apiUrl}/api/scraped-comments`, {
                                method: 'POST',
                                headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' },
                                body: JSON.stringify({ action: 'saveComments', profileUrl: cmd.data.profileUrl, profileIdSlug: targetProfileId, profileName: cmd.data.profileName || targetProfileId, comments: result.comments })
                            });
                            await sendOverlay(tab.id, `✅ Kommentify: Saved ${result.count} comments from ${targetProfileId}!`, 'success');
                        } else {
                            await sendOverlay(tab.id, `⚠️ Kommentify: No comments found for ${targetProfileId}`, 'warning');
                        }
                        await fetch(`${apiUrl}/api/extension/command`, { method: 'PUT', headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ commandId: cmd.id, status: 'completed' }) });
                        console.log(`✅ POLL-ALARM: scrape_comments done, saved ${result.count} comments`);
                    } catch (e) {
                        console.error('❌ POLL-ALARM: scrape_comments failed:', e);
                        if (commentTab) { try { await sendOverlay(commentTab.id, `❌ Kommentify: Comment scraping failed`, 'error'); } catch (x) {} }
                        try { await fetch(`${apiUrl}/api/extension/command`, { method: 'PUT', headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ commandId: cmd.id, status: 'failed' }) }); } catch (x) {}
                    } finally {
                        if (commentTab) { try { await chrome.tabs.remove(commentTab.id); } catch (e) {} globalThis._commandLinkedInTabs.delete(commentTab.id); }
                        globalThis._processingCommandIds.delete(cmd.id);
                    }
                }

                // --- post_to_linkedin ---
                else if (cmd.command === 'post_to_linkedin' && cmd.data?.content) {
                    console.log('📝 POLL-ALARM: Executing post_to_linkedin...');
                    let postTab = null;
                    try {
                        // Log start
                        try {
                            const { liveLog: ll } = await import('../shared/services/liveActivityLogger.js');
                            ll.start('post_writer', `✍️ Posting to LinkedIn...`);
                        } catch (e) {}

                        // Step 1: Open LinkedIn feed tab
                        console.log('📝 POLL-ALARM: Opening LinkedIn tab...');
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

                        if (globalThis._stopAllTasks) {
                            console.log('🛑 POLL-ALARM: Stop flag set, aborting post_to_linkedin');
                            try { await chrome.tabs.remove(postTab.id); } catch (e) {}
                            globalThis._commandLinkedInTabs.delete(postTab.id);
                            globalThis._processingCommandIds.delete(cmd.id);
                            continue;
                        }

                        // Step 3: Apply page load delay from Limits tab
                        const { delaySettings: pwDelays } = await chrome.storage.local.get('delaySettings');
                        const pageLoadWait = ((pwDelays && pwDelays.postWriterPageLoadDelay) || 5) * 1000;
                        console.log(`📝 POLL-ALARM: Page loaded, waiting ${pageLoadWait/1000}s for render...`);
                        try {
                            const { liveLog: ll } = await import('../shared/services/liveActivityLogger.js');
                            ll.delay('post_writer', Math.round(pageLoadWait/1000), 'page load delay');
                        } catch (e) {}
                        await new Promise(resolve => setTimeout(resolve, pageLoadWait));

                        // Step 4: Inject posting script
                        const content = cmd.data.content;
                        // Image is sent via CustomEvent to bypass 4MB API limit
                        // Check storage for pending post with image
                        let imageDataUrl = null;
                        if (cmd.data.hasImage) {
                            const stored = await chrome.storage.local.get('pendingPostImage');
                            imageDataUrl = stored.pendingPostImage || null;
                            console.log('📝 POLL-ALARM: Retrieved image from storage:', !!imageDataUrl);
                            // Clear it after retrieval
                            await chrome.storage.local.remove('pendingPostImage');
                        }
                        console.log('📝 POLL-ALARM: Injecting post script, hasImage:', !!imageDataUrl);
                        
                        // Load click delay from limits
                        const clickDelay = ((pwDelays && pwDelays.postWriterClickDelay) || 3) * 1000;
                        const typingDelay = ((pwDelays && pwDelays.postWriterTypingDelay) || 3) * 1000;
                        const submitDelay = ((pwDelays && pwDelays.postWriterSubmitDelay) || 2) * 1000;
                        
                        const result = await chrome.scripting.executeScript({
                            target: { tabId: postTab.id },
                            func: (postContent, imgDataUrl, clickDelayMs, typingDelayMs, submitDelayMs) => {
                                return new Promise((resolve) => {
                                    const _poll = (fn, interval, timeout) => new Promise(r => {
                                        const start = Date.now();
                                        const check = () => { const el = fn(); if (el) return r(el); if (Date.now() - start > timeout) return r(null); setTimeout(check, interval); };
                                        check();
                                    });
                                    const _findStartBtn = () => {
                                        // Method 1: New LinkedIn UI - data-view-name attribute (most reliable)
                                        const s0 = document.querySelector('[data-view-name="share-sharebox-focus"]');
                                        if (s0) return s0;
                                        // Method 2: Look for any clickable element with "Start a post" text
                                        const clickables = document.querySelectorAll('button, [role="button"]');
                                        for (const el of clickables) {
                                            const txt = (el.textContent || '').toLowerCase();
                                            if (txt.includes('start a post')) return el;
                                        }
                                        // Method 3: aria-label based detection
                                        for (const el of clickables) {
                                            const label = (el.getAttribute('aria-label') || '').toLowerCase();
                                            if (label.includes('start a post')) return el;
                                        }
                                        // Method 4: Legacy selectors (fallback)
                                        const s1 = document.querySelector('div.share-box-feed-entry__top-bar button');
                                        if (s1) return s1;
                                        return document.querySelector('.share-box-feed-entry__trigger');
                                    };
                                    const _findEditor = () => {
                                        const searchInRoot = (root) => {
                                            const selectors = ['.editor-content .ql-editor[contenteditable="true"]', '.ql-editor[contenteditable="true"]', '[role="textbox"][contenteditable="true"]', '[contenteditable="true"][aria-multiline="true"]'];
                                            for (const sel of selectors) { const el = root.querySelector(sel); if (el) return el; }
                                            for (const el of root.querySelectorAll('[contenteditable="true"]')) {
                                                const ph = (el.getAttribute('data-placeholder') || el.getAttribute('aria-placeholder') || '').toLowerCase();
                                                if (ph.includes('want to talk about')) return el;
                                            }
                                            return null;
                                        };
                                        const shadowHost = document.querySelector('#interop-outlet') || document.querySelector('[data-testid="interop-shadowdom"]');
                                        if (shadowHost && shadowHost.shadowRoot) {
                                            console.log('LinkedIn Post Script: Searching in shadow DOM...');
                                            const editor = searchInRoot(shadowHost.shadowRoot);
                                            if (editor) { console.log('LinkedIn Post Script: Editor found in shadow DOM!'); return editor; }
                                        }
                                        const dialog = document.querySelector('[role="dialog"]');
                                        if (dialog) { const editor = searchInRoot(dialog); if (editor) return editor; }
                                        return searchInRoot(document);
                                    };
                                    const _findPostBtn = () => {
                                        const searchForBtn = (root) => {
                                            const allButtons = Array.from(root.querySelectorAll('button'));
                                            return allButtons.find(b => {
                                                const isPrimary = b.classList.contains('share-actions__primary-action');
                                                const hasText = b.innerText && b.innerText.trim() === 'Post';
                                                const isEnabled = !b.disabled && b.getAttribute('aria-disabled') !== 'true';
                                                return (isPrimary || hasText) && isEnabled;
                                            });
                                        };
                                        const shadowHost = document.querySelector('#interop-outlet') || document.querySelector('[data-testid="interop-shadowdom"]');
                                        if (shadowHost && shadowHost.shadowRoot) { const btn = searchForBtn(shadowHost.shadowRoot); if (btn) return btn; }
                                        const dialog = document.querySelector('[role="dialog"]');
                                        return searchForBtn(dialog || document);
                                    };
                                    try {
                                        console.log('LinkedIn Post Script: Starting...', { hasImage: !!imgDataUrl });
                                        const startPostBtn = _findStartBtn();
                                        if (!startPostBtn) {
                                            resolve({ success: false, error: 'Start post button not found' });
                                            return;
                                        }
                                        console.log('LinkedIn Post Script: Start button found, clicking...', {
                                            tagName: startPostBtn.tagName,
                                            className: startPostBtn.className,
                                            text: startPostBtn.textContent?.substring(0, 50)
                                        });
                                        startPostBtn.click();
                                        
                                        // Wait longer for modal to appear and render (increased from 1.5s to 2s)
                                        setTimeout(() => {
                                            // Check if modal appeared
                                            const modal = document.querySelector('[role="dialog"]');
                                            console.log('LinkedIn Post Script: Modal check after 2s:', modal ? 'FOUND ✓' : 'NOT FOUND ✗');
                                            if (modal) {
                                                console.log('LinkedIn Post Script: Modal details:', {
                                                    className: modal.className,
                                                    childCount: modal.children.length
                                                });
                                            }
                                            
                                            const pollTimeout = clickDelayMs + 25000; // Increased to 25s for slower connections
                                            console.log(`LinkedIn Post Script: Polling for editor (timeout ${pollTimeout}ms)...`);
                                            _poll(_findEditor, 500, pollTimeout).then(async (editor) => {
                                                try {
                                                    if (!editor) {
                                                        resolve({ success: false, error: 'Editor not found after polling' });
                                                        return;
                                                    }
                                                    console.log('LinkedIn Post Script: Editor found!', {
                                                        tagName: editor.tagName,
                                                        className: editor.className,
                                                        contentEditable: editor.contentEditable,
                                                        innerHTML: editor.innerHTML.substring(0, 100)
                                                    });
                                                    
                                                    // Try multiple insertion methods
                                                    let insertSuccess = false;
                                                    
                                                    // Method 1: Focus + execCommand (most reliable for contenteditable)
                                                    try {
                                                        editor.focus();
                                                        editor.click();
                                                        await new Promise(r => setTimeout(r, 500));
                                                        
                                                        // Clear existing content
                                                        document.execCommand('selectAll', false, null);
                                                        document.execCommand('delete', false, null);
                                                        
                                                        // Insert text
                                                        document.execCommand('insertText', false, postContent);
                                                        insertSuccess = true;
                                                        console.log('LinkedIn Post Script: Text inserted via execCommand');
                                                    } catch (e1) {
                                                        console.log('LinkedIn Post Script: execCommand failed:', e1.message);
                                                    }
                                                    
                                                    // Method 2: innerHTML manipulation (fallback)
                                                    if (!insertSuccess) {
                                                        try {
                                                            editor.innerHTML = '';
                                                            const lines = postContent.split('\n');
                                                            lines.forEach((line, idx) => {
                                                                if (line.trim() === '') {
                                                                    editor.appendChild(document.createElement('br'));
                                                                } else {
                                                                    const p = document.createElement('p');
                                                                    p.textContent = line;
                                                                    editor.appendChild(p);
                                                                }
                                                            });
                                                            insertSuccess = true;
                                                            console.log('LinkedIn Post Script: Text inserted via innerHTML');
                                                        } catch (e2) {
                                                            console.log('LinkedIn Post Script: innerHTML failed:', e2.message);
                                                        }
                                                    }
                                                    
                                                    // Method 3: Direct textContent (last resort)
                                                    if (!insertSuccess) {
                                                        editor.textContent = postContent;
                                                        console.log('LinkedIn Post Script: Text inserted via textContent');
                                                    }
                                                    
                                                    // Trigger events
                                                    editor.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
                                                    editor.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
                                                    editor.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true }));
                                                    
                                                    console.log('LinkedIn Post Script: Content after insertion:', {
                                                        textContent: editor.textContent.substring(0, 100),
                                                        innerHTML: editor.innerHTML.substring(0, 200),
                                                        innerText: editor.innerText ? editor.innerText.substring(0, 100) : 'N/A'
                                                    });

                                                    // Handle image attachment via clipboard paste
                                                    const pasteImage = async () => {
                                                        if (!imgDataUrl) return false;
                                                        try {
                                                            console.log('LinkedIn Post Script: Pasting image via clipboard...');
                                                            const byteString = atob(imgDataUrl.split(',')[1]);
                                                            const mimeString = imgDataUrl.split(',')[0].split(':')[1].split(';')[0];
                                                            const ab = new ArrayBuffer(byteString.length);
                                                            const ia = new Uint8Array(ab);
                                                            for (let j = 0; j < byteString.length; j++) ia[j] = byteString.charCodeAt(j);
                                                            const blob = new Blob([ab], { type: mimeString });
                                                            const file = new File([blob], 'image.png', { type: mimeString });
                                                            try {
                                                                await navigator.clipboard.write([new ClipboardItem({ [mimeString]: blob })]);
                                                            } catch (clipErr) {
                                                                console.log('LinkedIn Post Script: Clipboard write failed:', clipErr.message);
                                                            }
                                                            editor.focus();
                                                            const dt = new DataTransfer();
                                                            dt.items.add(file);
                                                            const pasteEvt = new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: dt });
                                                            editor.dispatchEvent(pasteEvt);
                                                            const shareBox = document.querySelector('.share-box--is-open') || document.querySelector('.share-creation-state') || document.querySelector('[role="dialog"]');
                                                            if (shareBox) {
                                                                shareBox.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: dt }));
                                                            }
                                                            await new Promise(r => setTimeout(r, 3000));
                                                            return true;
                                                        } catch (imgErr) {
                                                            console.error('LinkedIn Post Script: Image paste error:', imgErr);
                                                            return false;
                                                        }
                                                    };

                                                    const imageAttached = await pasteImage();
                                                    console.log('LinkedIn Post Script: Image attached:', imageAttached);
                                                    const extraWait = imgDataUrl ? 4000 : 2000;
                                                    console.log(`LinkedIn Post Script: Waiting ${(submitDelayMs + extraWait)}ms before clicking Post...`);
                                                    await new Promise(r => setTimeout(r, submitDelayMs + extraWait));

                                                    let postButton = null;
                                                    for (let i = 0; i < 10; i++) {
                                                        postButton = _findPostBtn();
                                                        if (postButton) {
                                                            console.log(`LinkedIn Post Script: Post button found active on attempt ${i+1}`);
                                                            break;
                                                        }
                                                        console.log(`LinkedIn Post Script: Attempt ${i+1}: Waiting for Post button...`);
                                                        await new Promise(r => setTimeout(r, 1000));
                                                    }
                                                    
                                                    if (postButton) {
                                                        postButton.click();
                                                        console.log('LinkedIn Post Script: Post button clicked');
                                                        resolve({ success: true, posted: true, imageAttached });
                                                    } else {
                                                        console.log('LinkedIn Post Script: Post button not found or disabled after polling');
                                                        resolve({ success: true, posted: false, message: 'Content inserted, click Post manually', imageAttached });
                                                    }
                                                } catch (innerErr) {
                                                    resolve({ success: false, error: 'Inner error: ' + innerErr.message });
                                                }
                                            });
                                        }, 1500);
                                    } catch (outerErr) {
                                        resolve({ success: false, error: 'Outer error: ' + outerErr.message });
                                    }
                                });
                            },
                            args: [content, imageDataUrl, clickDelay, typingDelay, submitDelay]
                        });

                        const scriptResult = result?.[0]?.result;
                        console.log('📝 POLL-ALARM: Post script result:', scriptResult);

                        // Wait for LinkedIn to process the post
                        console.log('📝 POLL-ALARM: Waiting 5s before closing tab...');
                        await new Promise(resolve => setTimeout(resolve, 5000));

                        // Mark as completed
                        const finalStatus = scriptResult?.posted ? 'completed' : (scriptResult?.success ? 'completed_manual' : 'failed');
                        await fetch(`${apiUrl}/api/extension/command`, {
                            method: 'PUT',
                            headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' },
                            body: JSON.stringify({ commandId: cmd.id, status: finalStatus })
                        });
                        console.log(`✅ POLL-ALARM: post_to_linkedin ${finalStatus}`);
                        try {
                            const { liveLog: ll } = await import('../shared/services/liveActivityLogger.js');
                            if (scriptResult?.posted) ll.post('post_writer', `✅ Post published to LinkedIn${scriptResult?.imageAttached ? ' (with image)' : ''}`);
                            else if (scriptResult?.success) ll.info('post_writer', `⚠️ Content inserted but needs manual post click`);
                            else ll.error('post_writer', `❌ Post failed: ${scriptResult?.error || 'Unknown error'}`);
                        } catch (e) {}
                    } catch (postError) {
                        console.error('❌ POLL-ALARM: post_to_linkedin failed:', postError);
                        try {
                            const { liveLog: ll } = await import('../shared/services/liveActivityLogger.js');
                            ll.error('post_writer', `❌ Post failed: ${postError.message}`);
                        } catch (e) {}
                        try { await fetch(`${apiUrl}/api/extension/command`, { method: 'PUT', headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ commandId: cmd.id, status: 'failed' }) }); } catch (x) {}
                    } finally {
                        if (postTab) {
                            try { await chrome.tabs.remove(postTab.id); } catch (e) {}
                            globalThis._commandLinkedInTabs.delete(postTab.id);
                        }
                        globalThis._processingCommandIds.delete(cmd.id);
                    }
                }

                // --- start_bulk_commenting ---
                else if (cmd.command === 'start_bulk_commenting') {
                    console.log('💬 POLL-ALARM: Executing start_bulk_commenting from website...');
                    try {
                        // Sync settings from website first
                        const { syncAllSettingsFromWebsite } = await import('../shared/services/settingsSync.js');
                        await syncAllSettingsFromWebsite();

                        // Store commenter config + comment settings into chrome.storage.local
                        const cfgData = cmd.data || {};
                        await chrome.storage.local.set({
                            commenterConfig: {
                                postSource: cfgData.postSource || 'feed',
                                searchKeywords: cfgData.searchKeywords || '',
                                savePosts: cfgData.savePosts || false,
                                likePosts: cfgData.likePosts !== false,
                                commentOnPosts: cfgData.commentOnPosts !== false,
                                likeOrComment: cfgData.likeOrComment || false,
                                sharePosts: cfgData.sharePosts || false,
                                followAuthors: cfgData.followAuthors || false,
                                totalPosts: cfgData.totalPosts || 3,
                                minLikes: cfgData.minLikes || 0,
                                minComments: cfgData.minComments || 0,
                                ignoreKeywords: cfgData.ignoreKeywords || '',
                                openInNewWindow: cfgData.openInNewWindow !== false,
                            }
                        });

                        if (cfgData.commentSettings) {
                            await chrome.storage.local.set({
                                commentSettings: cfgData.commentSettings
                            });
                        }

                        // Trigger bulk commenting via executeBulkProcessing
                        // IMPORTANT: executeBulkProcessing expects: source, keywords, quota, ignoreKeywords (string)
                        const config = {
                            source: cfgData.postSource || 'feed',
                            keywords: cfgData.searchKeywords ? (typeof cfgData.searchKeywords === 'string' ? cfgData.searchKeywords.split('\n').filter(k => k.trim()) : cfgData.searchKeywords) : [],
                            quota: cfgData.totalPosts || 3,
                            actions: {
                                save: cfgData.savePosts || false,
                                like: cfgData.likePosts !== false,
                                comment: cfgData.commentOnPosts !== false,
                                likeOrComment: cfgData.likeOrComment || false,
                                share: cfgData.sharePosts || false,
                                follow: cfgData.followAuthors || false,
                            },
                            minLikes: cfgData.minLikes || 0,
                            minComments: cfgData.minComments || 0,
                            ignoreKeywords: cfgData.ignoreKeywords || '',
                            openInNewWindow: cfgData.openInNewWindow !== false,
                        };

                        console.log('💬 POLL-ALARM: Starting bulk processing with config:', JSON.stringify(config).substring(0, 200));
                        
                        // Mark as in_progress on server (NOT completed — processing is async)
                        await fetch(`${apiUrl}/api/extension/command`, {
                            method: 'PUT',
                            headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' },
                            body: JSON.stringify({ commandId: cmd.id, status: 'in_progress' })
                        });
                        
                        // Fire-and-forget: update status when processing finishes
                        executeBulkProcessing(config).then(async (result) => {
                            const finalStatus = (result && result.success) ? 'completed' : 'failed';
                            console.log(`✅ POLL-ALARM: Bulk processing finished with status: ${finalStatus}`);
                            try {
                                await fetch(`${apiUrl}/api/extension/command`, {
                                    method: 'PUT',
                                    headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ commandId: cmd.id, status: finalStatus })
                                });
                            } catch (x) { console.error('Failed to update command status:', x); }
                            globalThis._processingCommandIds.delete(cmd.id);
                        }).catch(async (err) => {
                            console.error('❌ POLL-ALARM: Bulk processing error:', err);
                            try {
                                await fetch(`${apiUrl}/api/extension/command`, {
                                    method: 'PUT',
                                    headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ commandId: cmd.id, status: 'failed' })
                                });
                            } catch (x) {}
                            globalThis._processingCommandIds.delete(cmd.id);
                        });
                        
                        console.log('✅ POLL-ALARM: start_bulk_commenting launched (in_progress)');
                    } catch (e) {
                        console.error('❌ POLL-ALARM: start_bulk_commenting failed:', e);
                        try { await fetch(`${apiUrl}/api/extension/command`, { method: 'PUT', headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ commandId: cmd.id, status: 'failed' }) }); } catch (x) {}
                        globalThis._processingCommandIds.delete(cmd.id);
                    }
                }

                // --- start_import_automation ---
                else if (cmd.command === 'start_import_automation') {
                    console.log('📥 POLL-ALARM: Executing start_import_automation from website...');
                    try {
                        // Sync settings from website first
                        const { syncAllSettingsFromWebsite } = await import('../shared/services/settingsSync.js');
                        await syncAllSettingsFromWebsite();

                        // Store import config
                        const cfgData = cmd.data || {};
                        const profileUrls = cfgData.profileUrls ? cfgData.profileUrls.split('\n').map(u => u.trim()).filter(u => u.includes('linkedin.com/in/')) : [];

                        await chrome.storage.local.set({
                            importConfig: {
                                profileUrls: cfgData.profileUrls || '',
                                profilesPerDay: cfgData.profilesPerDay || 20,
                                sendConnections: cfgData.sendConnections !== false,
                                engageLikes: cfgData.engageLikes !== false,
                                engageComments: cfgData.engageComments !== false,
                                engageShares: cfgData.engageShares || false,
                                engageFollows: cfgData.engageFollows !== false,
                                smartRandom: cfgData.smartRandom || false,
                                postsPerProfile: cfgData.postsPerProfile || 2,
                                engagementMethod: cfgData.engagementMethod || 'individual',
                            },
                            pendingImportProfiles: profileUrls,
                        });

                        // Mark as in_progress on server immediately
                        await fetch(`${apiUrl}/api/extension/command`, {
                            method: 'PUT',
                            headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' },
                            body: JSON.stringify({ commandId: cmd.id, status: 'in_progress' })
                        });

                        // Trigger import automation
                        if (profileUrls.length > 0) {
                            console.log(`📥 POLL-ALARM: Starting import for ${profileUrls.length} profiles`);
                            // processCombinedAutomation(profiles, options) — profiles is array, options is object
                            importAutomation.processCombinedAutomation(profileUrls, {
                                sendConnections: cfgData.sendConnections !== false,
                                postsPerProfile: cfgData.postsPerProfile || 2,
                                randomMode: cfgData.smartRandom || false,
                                engagementMethod: cfgData.engagementMethod || 'individual',
                                actions: {
                                    like: cfgData.engageLikes !== false,
                                    comment: cfgData.engageComments !== false,
                                    share: cfgData.engageShares || false,
                                    follow: cfgData.engageFollows !== false,
                                },
                            }).then(async (result) => {
                                const finalStatus = (result && (result.profilesProcessed > 0 || result.connectionsSuccessful > 0)) ? 'completed' : 'failed';
                                console.log(`✅ POLL-ALARM: Import automation finished with status: ${finalStatus}`);
                                try {
                                    await fetch(`${apiUrl}/api/extension/command`, {
                                        method: 'PUT',
                                        headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ commandId: cmd.id, status: finalStatus })
                                    });
                                } catch (x) { console.error('Failed to update import command status:', x); }
                                globalThis._processingCommandIds.delete(cmd.id);
                            }).catch(async (err) => {
                                console.error('❌ POLL-ALARM: Import automation error:', err);
                                try {
                                    await fetch(`${apiUrl}/api/extension/command`, {
                                        method: 'PUT',
                                        headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ commandId: cmd.id, status: 'failed' })
                                    });
                                } catch (x) {}
                                globalThis._processingCommandIds.delete(cmd.id);
                            });
                        } else {
                            // No profiles to import — mark as failed
                            await fetch(`${apiUrl}/api/extension/command`, {
                                method: 'PUT',
                                headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' },
                                body: JSON.stringify({ commandId: cmd.id, status: 'failed' })
                            });
                            globalThis._processingCommandIds.delete(cmd.id);
                        }

                        console.log('✅ POLL-ALARM: start_import_automation launched (in_progress)');
                    } catch (e) {
                        console.error('❌ POLL-ALARM: start_import_automation failed:', e);
                        try { await fetch(`${apiUrl}/api/extension/command`, { method: 'PUT', headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ commandId: cmd.id, status: 'failed' }) }); } catch (x) {}
                        globalThis._processingCommandIds.delete(cmd.id);
                    }
                }

                // --- scan_my_linkedin_profile command ---
                else if (cmd.command === 'scan_my_linkedin_profile') {
                    console.log('🔗 POLL-ALARM: Executing scan_my_linkedin_profile...');
                    try {
                        // Mark as in_progress
                        await fetch(`${apiUrl}/api/extension/command`, { method: 'PUT', headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ commandId: cmd.id, status: 'in_progress' }) });

                        // Navigate to LinkedIn profile root (generic /in/ redirects to the user's slug)
                        const profileUrl = 'https://www.linkedin.com/in/';
                        const tab = await chrome.tabs.create({ url: profileUrl, active: true });
                        console.log('🔗 POLL-ALARM: Opened LinkedIn profile tab:', tab.id);

                        // Wait for page to load
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

                        // Give LinkedIn a moment to render
                        await new Promise(resolve => setTimeout(resolve, 2000));

                        // If we've landed on a /details/... subpage, redirect back to canonical profile URL
                        try {
                            const navInfo = await chrome.scripting.executeScript({
                                target: { tabId: tab.id },
                                func: () => {
                                    const canonical = document.querySelector('link[rel="canonical"]')?.href || null;
                                    return { href: window.location.href, canonical };
                                }
                            });
                            const nav = navInfo?.[0]?.result;
                            if (nav?.canonical && nav?.href && nav.href.includes('/details/') && nav.canonical !== nav.href) {
                                console.log('🔗 POLL-ALARM: Redirecting from details page to canonical profile:', nav);
                                await chrome.tabs.update(tab.id, { url: nav.canonical });

                                // Wait again for profile root to load
                                await new Promise((resolve) => {
                                    const checkComplete2 = (tabId, changeInfo) => {
                                        if (tabId === tab.id && changeInfo.status === 'complete') {
                                            chrome.tabs.onUpdated.removeListener(checkComplete2);
                                            resolve();
                                        }
                                    };
                                    chrome.tabs.onUpdated.addListener(checkComplete2);
                                    setTimeout(() => { chrome.tabs.onUpdated.removeListener(checkComplete2); resolve(); }, 30000);
                                });
                                await new Promise(resolve => setTimeout(resolve, 2000));
                            }
                        } catch (navErr) {
                            console.warn('🔗 POLL-ALARM: Could not normalize profile URL:', navErr);
                        }

                        // Final small delay before extraction
                        await new Promise(resolve => setTimeout(resolve, 1000));

                        // Auto-scroll the profile page to load all content
                        console.log('🔗 POLL-ALARM: Auto-scrolling profile page to load all content...');
                        await autoScrollProfilePage(tab.id);

                        // Extract using the combined extraction logic (selector-based posts + text-based profile)
                        const scanData = await scanLinkedInProfileInTab(tab.id);
                        console.log('🔗 POLL-ALARM: Scan result:', scanData);

                        if (scanData?.success) {
                            // Get profile URL from the tab
                            const profileUrl = (await chrome.tabs.get(tab.id)).url.split('?')[0];
                            scanData.data.totalPostsCount = scanData.data.posts?.length || 0;
                            
                            console.log(`🔗 POLL-ALARM: Total posts extracted: ${scanData.data.totalPostsCount}`);
                            
                            // Save to database
                            const saveData = { ...scanData.data, profileUrl };
                            await fetch(`${apiUrl}/api/linkedin-profile`, {
                                method: 'POST',
                                headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' },
                                body: JSON.stringify(saveData)
                            });
                            console.log('🔗 POLL-ALARM: Profile data saved to database');
                            
                            // Keep the LinkedIn tab open after successful scan
                            console.log('🔗 POLL-ALARM: LinkedIn tab kept open for user');
                        } else {
                            // Close the tab if scan failed
                            await chrome.tabs.remove(tab.id);
                            console.log('🔗 POLL-ALARM: Closed LinkedIn tab due to scan failure');
                        }

                        // Mark command as completed
                        await fetch(`${apiUrl}/api/extension/command`, { method: 'PUT', headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ commandId: cmd.id, status: 'completed' }) });
                        console.log('✅ POLL-ALARM: scan_my_linkedin_profile completed');
                    } catch (e) {
                        console.error('❌ POLL-ALARM: scan_my_linkedin_profile failed:', e);
                        // Close the LinkedIn tab on error
                        try { await chrome.tabs.remove(tab.id); } catch (tabError) {}
                        try { await fetch(`${apiUrl}/api/extension/command`, { method: 'PUT', headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ commandId: cmd.id, status: 'failed' }) }); } catch (x) {}
                    } finally {
                        globalThis._processingCommandIds.delete(cmd.id);
                    }
                }

                // --- AI_PROFILE_RECAPTURE command --- (Capture full profile text and restructure with AI)
                else if (cmd.command === 'AI_PROFILE_RECAPTURE') {
                    console.log('🤖 POLL-ALARM: Executing AI_PROFILE_RECAPTURE...');
                    let recaptureTab = null;
                    
                    // Timeout wrapper - max 60 seconds
                    const timeoutPromise = new Promise((_, reject) => {
                        setTimeout(() => reject(new Error('AI_PROFILE_RECAPTURE timeout after 60s')), 60000);
                    });
                    
                    const executeRecapture = async () => {
                        // Mark as in_progress
                        await fetch(`${apiUrl}/api/extension/command`, { method: 'PUT', headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ commandId: cmd.id, status: 'in_progress' }) });

                        // Get the actual profile URL from command params or use current tab
                        const profileUrl = cmd.params?.profileUrl || 'https://www.linkedin.com/in/me/';
                        console.log('🤖 POLL-ALARM: Profile URL:', profileUrl);
                        
                        recaptureTab = await chrome.tabs.create({ url: profileUrl, active: true });
                        console.log('🤖 POLL-ALARM: Opened LinkedIn profile tab for AI recapture:', recaptureTab.id);

                        // Wait for page to load
                        await new Promise((resolve) => {
                            const checkComplete = (tabId, changeInfo) => {
                                if (tabId === recaptureTab.id && changeInfo.status === 'complete') {
                                    chrome.tabs.onUpdated.removeListener(checkComplete);
                                    resolve();
                                }
                            };
                            chrome.tabs.onUpdated.addListener(checkComplete);
                            setTimeout(() => { chrome.tabs.onUpdated.removeListener(checkComplete); resolve(); }, 30000);
                        });

                        await new Promise(resolve => setTimeout(resolve, 3000));

                        // Auto-scroll to load all content
                        console.log('🤖 POLL-ALARM: Auto-scrolling profile page...');
                        await autoScrollProfilePage(recaptureTab.id);

                        // Extract FULL text from the profile page
                        console.log('🤖 POLL-ALARM: Extracting profile data...');
                        
                        // Inject "Processing" overlay
                        await chrome.scripting.executeScript({
                            target: { tabId: recaptureTab.id },
                            func: () => {
                                let overlay = document.getElementById('kommentify-profile-scan');
                                if (!overlay) {
                                    const style = document.createElement('style');
                                    style.textContent = '@keyframes kPulse { 0% {transform:scale(0.95);opacity:0.8} 50% {transform:scale(1.05);opacity:1} 100% {transform:scale(0.95);opacity:0.8} }';
                                    document.head.appendChild(style);
                                    
                                    overlay = document.createElement('div');
                                    overlay.id = 'kommentify-profile-scan';
                                    overlay.style.cssText = 'position:fixed;top:20px;right:20px;z-index:999999;background:linear-gradient(135deg,#1a1a2e,#16213e);color:#fff;padding:20px;border-radius:12px;font-family:-apple-system,system-ui,sans-serif;box-shadow:0 10px 40px rgba(0,0,0,0.5);border:1px solid rgba(105,63,233,0.4);min-width:280px;';
                                    document.body.appendChild(overlay);
                                }
                                overlay.innerHTML = `
                                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
                                        <div style="width:12px;height:12px;background:#8b5cf6;border-radius:50%;animation:kPulse 1.5s infinite;"></div>
                                        <strong style="font-size:15px;color:#a78bfa;margin:0;">Kommentify AI Scanner</strong>
                                    </div>
                                    <div style="font-size:13px;color:#cbd5e1;line-height:1.5;">
                                        Extracting structured profile data...<br/>
                                        <span style="color:#94a3b8;font-size:11px;margin-top:6px;display:block;">This tab will auto-close when complete.</span>
                                    </div>
                                `;
                            }
                        });

                        // Capture full page text and send to backend for AI restructuring
                        const fullTextResult = await chrome.scripting.executeScript({
                            target: { tabId: recaptureTab.id },
                            func: () => {
                                // Get all text content from the page
                                const allText = document.body.innerText;
                                const profileUrl = window.location.href.split('?')[0];
                                return { fullText: allText, profileUrl };
                            }
                        });

                        const { fullText, profileUrl: scannedProfileUrl } = fullTextResult?.[0]?.result || {};
                        console.log('🤖 POLL-ALARM: Full text length:', fullText?.length || 0);

                        if (fullText && fullText.length > 100) {
                            // Update overlay
                            await chrome.scripting.executeScript({
                                target: { tabId: recaptureTab.id },
                                func: () => {
                                    const overlay = document.getElementById('kommentify-profile-scan');
                                    if (overlay) {
                                        overlay.innerHTML = `
                                            <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
                                                <div style="width:12px;height:12px;background:#34d399;border-radius:50%;animation:kPulse 1.5s infinite;"></div>
                                                <strong style="font-size:15px;color:#a78bfa;margin:0;">Kommentify AI Scanner</strong>
                                            </div>
                                            <div style="font-size:13px;color:#cbd5e1;line-height:1.5;">
                                                AI is now structuring your profile data...<br/>
                                                <span style="color:#94a3b8;font-size:11px;margin-top:6px;display:block;">This might take 10-20 seconds. Tab will auto-close when done.</span>
                                            </div>
                                        `;
                                    }
                                }
                            });

                            // Send to backend API for AI restructuring
                            console.log('🤖 POLL-ALARM: Sending to backend for AI restructuring...');
                            
                            const token = await getFreshToken();
                            const aiResponse = await fetch(`${apiUrl}/api/ai/restructure-profile`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify({
                                    profileText: fullText.substring(0, 15000),
                                    profileUrl: scannedProfileUrl
                                })
                            });

                            const aiData = await aiResponse.json();
                            console.log('🤖 POLL-ALARM: Backend AI response received');

                            if (aiData.success && aiData.data) {
                                const structuredData = aiData.data;
                                structuredData.profileUrl = scannedProfileUrl;
                                structuredData.lastScannedAt = new Date().toISOString();
                                structuredData.totalPostsCount = structuredData.posts?.length || 0;
                                // Store full page text for re-scanning missing data
                                structuredData.fullPageText = fullText;

                                // Save to database
                                const saveResponse = await fetch(`${apiUrl}/api/linkedin-profile`, {
                                    method: 'POST',
                                    headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' },
                                    body: JSON.stringify(structuredData)
                                });
                                const saveResult = await saveResponse.json();
                                console.log('🤖 POLL-ALARM: Profile save result:', saveResult);
                                
                                // Mark command as completed
                                const completionResponse = await fetch(`${apiUrl}/api/extension/command`, { 
                                    method: 'PUT', 
                                    headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' }, 
                                    body: JSON.stringify({ commandId: cmd.id, status: 'completed' }) 
                                });
                                const completionResult = await completionResponse.json();
                                console.log('✅ POLL-ALARM: AI_PROFILE_RECAPTURE completed, result:', completionResult);
                            } else {
                                console.error('🤖 POLL-ALARM: AI restructuring failed:', aiData.error);
                                // Mark as failed since AI couldn't restructure
                                await fetch(`${apiUrl}/api/extension/command`, { 
                                    method: 'PUT', 
                                    headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' }, 
                                    body: JSON.stringify({ commandId: cmd.id, status: 'failed', error: 'AI restructuring failed: ' + (aiData.error || 'Unknown error') }) 
                                });
                            }
                        } else {
                            console.error('🤖 POLL-ALARM: No text extracted from profile page');
                            // Mark as failed since we couldn't extract text
                            await fetch(`${apiUrl}/api/extension/command`, { 
                                method: 'PUT', 
                                headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' }, 
                                body: JSON.stringify({ commandId: cmd.id, status: 'failed', error: 'No text extracted from profile page' }) 
                            });
                        }
                        
                        // Close the tab
                        try { await chrome.tabs.remove(recaptureTab.id); } catch (e) {}
                    };
                    
                    // Execute with timeout
                    try {
                        await Promise.race([executeRecapture(), timeoutPromise]);
                    } catch (e) {
                        console.error('❌ POLL-ALARM: AI_PROFILE_RECAPTURE timeout or error:', e);
                        try { await chrome.tabs.remove(recaptureTab.id); } catch (tabError) {}
                        try { await fetch(`${apiUrl}/api/extension/command`, { method: 'PUT', headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ commandId: cmd.id, status: 'failed' }) }); } catch (x) {}
                    } finally {
                        globalThis._processingCommandIds.delete(cmd.id);
                    }
                }

                // --- post_scheduled_content command ---
                else if (cmd.command === 'post_scheduled_content') {
                    console.log('📅 POLL-ALARM: Executing post_scheduled_content...');
                    let postTab = null;
                    try {
                        // Mark as in_progress
                        await fetch(`${apiUrl}/api/extension/command`, { method: 'PUT', headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ commandId: cmd.id, status: 'in_progress' }) });
                        
                        // Get payload from cmd - content/draftId are at root level from API
                        // API returns { id, ...meta } so content/draftId/etc are directly on cmd
                        const payload = cmd.data || {
                            content: cmd.content,
                            draftId: cmd.draftId,
                            scheduledFor: cmd.scheduledFor,
                            topic: cmd.topic,
                            template: cmd.template,
                            tone: cmd.tone
                        };
                        console.log('📅 POLL-ALARM: Payload:', payload);
                        console.log('📅 POLL-ALARM: Content length:', payload.content?.length || 0);
                        
                        // Verify the scheduled post still exists before executing
                        if (payload.draftId) {
                            try {
                                const verifyRes = await fetch(`${apiUrl}/api/scheduled-posts?draftId=${payload.draftId}`, {
                                    headers: { 'Authorization': `Bearer ${await getFreshToken()}` }
                                });
                                const verifyData = await verifyRes.json();
                                if (!verifyData.success || !verifyData.scheduledPosts?.find(p => p.id === payload.draftId)) {
                                    console.log('📅 POLL-ALARM: Scheduled post no longer exists, skipping execution');
                                    await fetch(`${apiUrl}/api/extension/command`, { 
                                        method: 'PUT', 
                                        headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' }, 
                                        body: JSON.stringify({ commandId: cmd.id, status: 'cancelled' }) 
                                    });
                                    globalThis._processingCommandIds.delete(cmd.id);
                                    continue;
                                }
                            } catch (verifyErr) {
                                console.error('📅 POLL-ALARM: Failed to verify scheduled post:', verifyErr);
                            }
                            
                            await fetch(`${apiUrl}/api/scheduled-posts`, {
                                method: 'POST',
                                headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' },
                                body: JSON.stringify({ 
                                    taskId: cmd.id, 
                                    status: 'in_progress' 
                                })
                            });
                        }

                        // Log start
                        try {
                            const { liveLog: ll } = await import('../shared/services/liveActivityLogger.js');
                            ll.start('post_writer', `✍️ Posting scheduled content to LinkedIn...`);
                        } catch (e) {}

                        // Step 1: Open LinkedIn feed tab
                        console.log('📅 POLL-ALARM: Opening LinkedIn tab...');
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

                        if (globalThis._stopAllTasks) {
                            console.log('🛑 POLL-ALARM: Stop flag set, aborting post_scheduled_content');
                            try { await chrome.tabs.remove(postTab.id); } catch (e) {}
                            globalThis._commandLinkedInTabs.delete(postTab.id);
                            globalThis._processingCommandIds.delete(cmd.id);
                            continue;
                        }

                        // Step 3: Apply page load delay from Limits tab
                        const { delaySettings: pwDelays } = await chrome.storage.local.get('delaySettings');
                        const pageLoadWait = ((pwDelays && pwDelays.postWriterPageLoadDelay) || 5) * 1000;
                        console.log(`📅 POLL-ALARM: Page loaded, waiting ${pageLoadWait/1000}s for render...`);
                        try {
                            const { liveLog: ll } = await import('../shared/services/liveActivityLogger.js');
                            ll.delay('post_writer', Math.round(pageLoadWait/1000), 'page load delay');
                        } catch (e) {}
                        await new Promise(resolve => setTimeout(resolve, pageLoadWait));

                        // Step 4: Inject posting script (same as post_to_linkedin)
                        const content = payload.content || '';
                        const imageDataUrl = payload.imageDataUrl || null;
                        console.log('📅 POLL-ALARM: Injecting post script, content length:', content.length, 'hasImage:', !!imageDataUrl);
                        
                        // Load click delay from limits
                        const clickDelay = ((pwDelays && pwDelays.postWriterClickDelay) || 3) * 1000;
                        const typingDelay = ((pwDelays && pwDelays.postWriterTypingDelay) || 3) * 1000;
                        const submitDelay = ((pwDelays && pwDelays.postWriterSubmitDelay) || 2) * 1000;
                        
                        const result = await chrome.scripting.executeScript({
                            target: { tabId: postTab.id },
                            func: (postContent, imgDataUrl, clickDelayMs, typingDelayMs, submitDelayMs) => {
                                return new Promise((resolve) => {
                                    const _poll = (fn, interval, timeout) => new Promise(r => {
                                        const start = Date.now();
                                        const check = () => { const el = fn(); if (el) return r(el); if (Date.now() - start > timeout) return r(null); setTimeout(check, interval); };
                                        check();
                                    });
                                    const _findStartBtn = () => {
                                        // Method 1: New LinkedIn UI - data-view-name attribute (most reliable)
                                        const s0 = document.querySelector('[data-view-name="share-sharebox-focus"]');
                                        if (s0) return s0;
                                        // Method 2: Look for any clickable element with "Start a post" text
                                        const clickables = document.querySelectorAll('button, [role="button"]');
                                        for (const el of clickables) {
                                            const txt = (el.textContent || '').toLowerCase();
                                            if (txt.includes('start a post')) return el;
                                        }
                                        // Method 3: aria-label based detection
                                        for (const el of clickables) {
                                            const label = (el.getAttribute('aria-label') || '').toLowerCase();
                                            if (label.includes('start a post')) return el;
                                        }
                                        // Method 4: Legacy selectors (fallback)
                                        const s1 = document.querySelector('div.share-box-feed-entry__top-bar button');
                                        if (s1) return s1;
                                        return document.querySelector('.share-box-feed-entry__trigger');
                                    };
                                    const _findEditor = () => {
                                        const searchInRoot = (root) => {
                                            const selectors = ['.editor-content .ql-editor[contenteditable="true"]', '.ql-editor[contenteditable="true"]', '[role="textbox"][contenteditable="true"]', '[contenteditable="true"][aria-multiline="true"]'];
                                            for (const sel of selectors) { const el = root.querySelector(sel); if (el) return el; }
                                            for (const el of root.querySelectorAll('[contenteditable="true"]')) {
                                                const ph = (el.getAttribute('data-placeholder') || el.getAttribute('aria-placeholder') || '').toLowerCase();
                                                if (ph.includes('want to talk about')) return el;
                                            }
                                            return null;
                                        };
                                        const shadowHost = document.querySelector('#interop-outlet') || document.querySelector('[data-testid="interop-shadowdom"]');
                                        if (shadowHost && shadowHost.shadowRoot) {
                                            console.log('LinkedIn Post Script: Searching in shadow DOM...');
                                            const editor = searchInRoot(shadowHost.shadowRoot);
                                            if (editor) { console.log('LinkedIn Post Script: Editor found in shadow DOM!'); return editor; }
                                        }
                                        const dialog = document.querySelector('[role="dialog"]');
                                        if (dialog) { const editor = searchInRoot(dialog); if (editor) return editor; }
                                        return searchInRoot(document);
                                    };
                                    const _findPostBtn = () => {
                                        const searchForBtn = (root) => {
                                            const allButtons = Array.from(root.querySelectorAll('button'));
                                            return allButtons.find(b => {
                                                const isPrimary = b.classList.contains('share-actions__primary-action');
                                                const hasText = b.innerText && b.innerText.trim() === 'Post';
                                                const isEnabled = !b.disabled && b.getAttribute('aria-disabled') !== 'true';
                                                return (isPrimary || hasText) && isEnabled;
                                            });
                                        };
                                        const shadowHost = document.querySelector('#interop-outlet') || document.querySelector('[data-testid="interop-shadowdom"]');
                                        if (shadowHost && shadowHost.shadowRoot) { const btn = searchForBtn(shadowHost.shadowRoot); if (btn) return btn; }
                                        const dialog = document.querySelector('[role="dialog"]');
                                        return searchForBtn(dialog || document);
                                    };
                                    try {
                                        console.log('LinkedIn Post Script: Starting...', { hasImage: !!imgDataUrl });
                                        const startPostBtn = _findStartBtn();
                                        if (!startPostBtn) {
                                            resolve({ success: false, error: 'Start post button not found' });
                                            return;
                                        }
                                        startPostBtn.click();
                                        
                                        setTimeout(() => {
                                            const pollTimeout = clickDelayMs + 20000;
                                            console.log(`LinkedIn Post Script: Polling for editor (timeout ${pollTimeout}ms)...`);
                                            _poll(_findEditor, 500, pollTimeout).then(async (editor) => {
                                                try {
                                                    if (!editor) {
                                                        resolve({ success: false, error: 'Editor not found after polling' });
                                                        return;
                                                    }
                                                    console.log('LinkedIn Post Script: Editor found via logic-based detection');
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
                                                            const byteString = atob(imgDataUrl.split(',')[1]);
                                                            const mimeString = imgDataUrl.split(',')[0].split(':')[1].split(';')[0];
                                                            const ab = new ArrayBuffer(byteString.length);
                                                            const ia = new Uint8Array(ab);
                                                            for (let j = 0; j < byteString.length; j++) ia[j] = byteString.charCodeAt(j);
                                                            const blob = new Blob([ab], { type: mimeString });
                                                            const file = new File([blob], 'image.png', { type: mimeString });
                                                            try {
                                                                await navigator.clipboard.write([new ClipboardItem({ [mimeString]: blob })]);
                                                            } catch (clipErr) {
                                                                console.log('LinkedIn Post Script: Clipboard write failed:', clipErr.message);
                                                            }
                                                            editor.focus();
                                                            const dt = new DataTransfer();
                                                            dt.items.add(file);
                                                            const pasteEvt = new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: dt });
                                                            editor.dispatchEvent(pasteEvt);
                                                            const shareBox = document.querySelector('.share-box--is-open') || document.querySelector('.share-creation-state') || document.querySelector('[role="dialog"]');
                                                            if (shareBox) {
                                                                shareBox.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: dt }));
                                                            }
                                                            await new Promise(r => setTimeout(r, 3000));
                                                            return true;
                                                        } catch (imgErr) {
                                                            console.error('LinkedIn Post Script: Image paste error:', imgErr);
                                                            return false;
                                                        }
                                                    };

                                                    const imageAttached = await pasteImage();
                                                    console.log('LinkedIn Post Script: Image attached:', imageAttached);
                                                    const extraWait = imgDataUrl ? 4000 : 2000;
                                                    console.log(`LinkedIn Post Script: Waiting ${(submitDelayMs + extraWait)}ms before clicking Post...`);
                                                    await new Promise(r => setTimeout(r, submitDelayMs + extraWait));

                                                    let postButton = null;
                                                    for (let i = 0; i < 10; i++) {
                                                        postButton = _findPostBtn();
                                                        if (postButton) {
                                                            console.log(`LinkedIn Post Script: Post button found active on attempt ${i+1}`);
                                                            break;
                                                        }
                                                        console.log(`LinkedIn Post Script: Attempt ${i+1}: Waiting for Post button...`);
                                                        await new Promise(r => setTimeout(r, 1000));
                                                    }
                                                    
                                                    if (postButton) {
                                                        postButton.click();
                                                        console.log('LinkedIn Post Script: Post button clicked');
                                                        resolve({ success: true, posted: true, imageAttached });
                                                    } else {
                                                        console.log('LinkedIn Post Script: Post button not found or disabled after polling');
                                                        resolve({ success: true, posted: false, message: 'Content inserted, click Post manually', imageAttached });
                                                    }
                                                } catch (innerErr) {
                                                    resolve({ success: false, error: 'Inner error: ' + innerErr.message });
                                                }
                                            });
                                        }, 1500);
                                    } catch (outerErr) {
                                        resolve({ success: false, error: 'Outer error: ' + outerErr.message });
                                    }
                                });
                            },
                            args: [content, imageDataUrl, clickDelay, typingDelay, submitDelay]
                        });

                        const scriptResult = result?.[0]?.result;
                        console.log('📅 POLL-ALARM: Post script result:', scriptResult);

                        // Wait for LinkedIn to process the post
                        console.log('📅 POLL-ALARM: Waiting 5s before closing tab...');
                        await new Promise(resolve => setTimeout(resolve, 5000));

                        // Mark as completed
                        const finalStatus = scriptResult?.posted ? 'completed' : (scriptResult?.success ? 'completed_manual' : 'failed');
                        
                        if (payload.draftId) {
                            await fetch(`${apiUrl}/api/scheduled-posts`, {
                                method: 'POST',
                                headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' },
                                body: JSON.stringify({ 
                                    taskId: cmd.id, 
                                    status: finalStatus === 'completed' ? 'completed' : 'failed',
                                    failureReason: scriptResult?.error || null
                                })
                            });
                        }
                        
                        await fetch(`${apiUrl}/api/extension/command`, {
                            method: 'PUT',
                            headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' },
                            body: JSON.stringify({ commandId: cmd.id, status: finalStatus })
                        });
                        console.log(`✅ POLL-ALARM: post_scheduled_content ${finalStatus}`);
                        
                        try {
                            const { liveLog: ll } = await import('../shared/services/liveActivityLogger.js');
                            if (scriptResult?.posted) ll.post('post_writer', `✅ Scheduled post published to LinkedIn`);
                            else if (scriptResult?.success) ll.info('post_writer', `⚠️ Content inserted but needs manual post click`);
                            else ll.error('post_writer', `❌ Scheduled post failed: ${scriptResult?.error || 'Unknown error'}`);
                        } catch (e) {}
                    } catch (e) {
                        console.error('❌ POLL-ALARM: post_scheduled_content failed:', e);
                        try {
                            const { liveLog: ll } = await import('../shared/services/liveActivityLogger.js');
                            ll.error('post_writer', `❌ Scheduled post failed: ${e.message}`);
                        } catch (logErr) {}
                        try { await fetch(`${apiUrl}/api/extension/command`, { method: 'PUT', headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ commandId: cmd.id, status: 'failed' }) }); } catch (x) {}
                    } finally {
                        if (postTab) {
                            try { await chrome.tabs.remove(postTab.id); } catch (e) {}
                            globalThis._commandLinkedInTabs.delete(postTab.id);
                        }
                        globalThis._processingCommandIds.delete(cmd.id);
                    }
                }
                else {
                    console.log('⚠️ POLL-ALARM: Unknown command:', cmd.command);
                    globalThis._processingCommandIds.delete(cmd.id);
                }
            }
        }
    } catch (error) {
        console.error('POLL-ALARM: Error polling commands:', error);
    } finally {
        globalThis._pollCommandsRunning = false;
    }
}

// Auto-scroll profile page to load all content
async function autoScrollProfilePage(tabId) {
    try {
        console.log('🔗 SCROLL: Starting auto-scroll...');
        
        const maxScrollAttempts = 10;
        let lastHeight = 0;
        let noChangeCount = 0;
        
        for (let i = 0; i < maxScrollAttempts; i++) {
            // Get current scroll height
            const heightResult = await chrome.scripting.executeScript({
                target: { tabId: tabId },
                func: () => document.body.scrollHeight
            });
            const currentHeight = heightResult?.[0]?.result || 0;
            
            // Scroll down
            await chrome.scripting.executeScript({
                target: { tabId: tabId },
                func: () => {
                    window.scrollTo({
                        top: document.body.scrollHeight,
                        behavior: 'smooth'
                    });
                }
            });
            
            // Wait for content to load
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Check if new content loaded
            const newHeightResult = await chrome.scripting.executeScript({
                target: { tabId: tabId },
                func: () => document.body.scrollHeight
            });
            const newHeight = newHeightResult?.[0]?.result || 0;
            
            console.log(`🔗 SCROLL: Attempt ${i+1}, height: ${currentHeight} -> ${newHeight}`);
            
            if (newHeight === lastHeight) {
                noChangeCount++;
                if (noChangeCount >= 2) {
                    console.log('🔗 SCROLL: No new content, stopping');
                    break;
                }
            } else {
                noChangeCount = 0;
            }
            lastHeight = newHeight;
        }
        
        // Scroll back to top
        await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => window.scrollTo(0, 0)
        });
        
        console.log('🔗 SCROLL: Auto-scroll complete');
    } catch (error) {
        console.error('🔗 SCROLL: Error during auto-scroll:', error);
    }
}

// LinkedIn profile scan helper - selector-based posts + text-based profile extraction
async function scanLinkedInProfileInTab(tabId) {
    const execResult = await chrome.scripting.executeScript({
        target: { tabId },
        func: () => {
            console.clear();
            console.log("🚀 Starting Combined Extraction...");

            // Helper function to sanitize text
            function clean(text) {
                if (!text) return "";
                return text.replace(/…\s*more/gi, "").replace(/^\s*[\r\n]/gm, "").replace(/\s+/g, " ").trim();
            }

            const data = {
                name: "", headline: "", location: "", connections: "", about: "",
                posts: [], experience: [], education: [], certifications: [], projects: [],
                skills: [], interests: [], language: "", profileViews: "", profileUrl: ""
            };

            // Get profile URL
            data.profileUrl = window.location.href.split('?')[0];

            // ========== STEP 1: TRY SELECTOR-BASED POSTS EXTRACTION ==========
            console.log("🚀 Step 1: Trying selector-based posts extraction...");
            
            const postEls = document.querySelectorAll('[data-view-name="feed-commentary"], .update-components-text');
            const selectorPosts = [];
            
            postEls.forEach(el => {
                const clone = el.cloneNode(true);
                // Destroy the "… more" button before reading text
                clone.querySelectorAll('button, .see-more').forEach(b => b.remove());
                
                let txt = clean(clone.textContent);
                
                // Filter out empty, short, or junk strings
                if (txt && !txt.startsWith("http") && txt !== "# | # | #" && txt.length > 20 && !txt.startsWith("#")) {
                    selectorPosts.push(txt);
                }
            });
            
            // Remove exact duplicates
            const uniqueSelectorPosts = [...new Set(selectorPosts)];
            console.log(`🚀 Selector-based posts found: ${uniqueSelectorPosts.length}`);
            
            if (uniqueSelectorPosts.length > 0) {
                data.posts = uniqueSelectorPosts;
                console.log("🚀 Using selector-based posts (successful)");
            } else {
                console.log("🚀 Selector-based posts failed, will fallback to text-based");
            }

            // ========== STEP 2: TEXT-BASED PROFILE EXTRACTION ==========
            console.log("🚀 Step 2: Text-based profile extraction...");
            
            // Get raw text from the entire page
            const rawText = document.body.innerText || "";

            // Define exact UI noise to completely destroy
            const exactJunk = new Set([
                "0 notifications", "Skip to main content", "Home", "My Network", "Jobs",
                "Messaging", "Notifications", "Me", "For Business", "Create a post",
                "Posts", "Comments", "Videos", "Images", "Top Voices", "Companies",
                "Groups", "Newsletters", "Schools", "Show all", "Like", "Comment",
                "Repost", "Send", "Show credential", "Show project", "Add section",
                "Enhance profile", "Open to", "Get started", "Add services", "Private to you",
                "Discover who's viewed your profile.", "Check out who's engaging with your posts.",
                "See how often you appear in search results.", "Add verification badge",
                "LinkedIn helped me get this job", "helped me get this job", "Contact info",
                "Profile language", "Who your viewers also viewed", "People you may know", "You might like",
                "Received", "Given", "Ask for a recommendation", "Message", "View", "Connect", "Follow"
            ]);

            // Clean the text line-by-line using smart filters
            let lines = rawText.split('\n').map(l => l.trim()).filter(l => {
                if (!l) return false;
                if (exactJunk.has(l)) return false;
                if (/^\d+$/.test(l)) return false;
                if (/^\d+\s+(reactions?|comments?|reposts?|views|followers)$/i.test(l)) return false;
                if (l.includes("Reactivate Premium") || l.includes("Try Premium")) return false;
                if (l.endsWith(".jpg") || l.endsWith(".png") || l.endsWith(".pdf")) return false;
                if (l === "• You" || l === "You" || l.toLowerCase().includes("reposted this")) return false;
                if (l.toLowerCase().startsWith("show all ")) return false;
                if (l === "·" || l === "•") return false;
                return true;
            });

            lines = lines.map(l => clean(l));
            lines = lines.filter((l, i, a) => i === 0 || l !== a[i-1]);

            const sectionHeaders = [
                "About", "Activity", "Experience", "Education", 
                "Licenses & certifications", "Projects", "Skills", 
                "Recommendations", "Interests"
            ];

            // --- EXTRACT TOP SKILLS FIRST ---
            const topSkillsIdx = lines.findIndex(l => l === "Top skills");
            if (topSkillsIdx !== -1) {
                if (lines[topSkillsIdx + 1]) {
                    data.skills.push(...lines[topSkillsIdx + 1].split(/[•·]/).map(s => clean(s)).filter(Boolean));
                }
                lines.splice(topSkillsIdx, 2); 
            }

            // --- EXTRACT TOP CARD ---
            let topBound = lines.findIndex(l => sectionHeaders.includes(l));
            if (topBound === -1) topBound = lines.length;
            let topLines = lines.slice(0, topBound);

            const connIdx = topLines.findIndex(l => l.toLowerCase().includes("connections"));
            if (connIdx !== -1) data.connections = topLines[connIdx];

            const viewIdx = topLines.findIndex(l => l.toLowerCase().includes("profile views"));
            if (viewIdx !== -1) data.profileViews = topLines[viewIdx];

            const cleanTop = topLines.filter(l => !l.toLowerCase().includes("connections") && !l.toLowerCase().includes("profile views") && !l.toLowerCase().includes("search appearances") && !l.toLowerCase().includes("post impressions") && !l.includes("Past 7 days"));
            
            if (cleanTop.length > 0) data.name = cleanTop[0];
            if (cleanTop.length > 1) data.headline = cleanTop[1];
            if (cleanTop.length > 2) data.location = cleanTop[2];

            lines = lines.filter(l => l !== data.name && l !== data.headline);

            // --- SECTION PARSER ---
            function getSectionLines(header) {
                let start = lines.findIndex(l => l === header);
                if (start === -1) return [];
                let end = lines.length;
                for (let i = start + 1; i < lines.length; i++) {
                    if (sectionHeaders.includes(lines[i])) {
                        end = i;
                        break;
                    }
                }
                return lines.slice(start + 1, end);
            }

            // --- ABOUT ---
            data.about = getSectionLines("About").join(" ");

            // --- FALLBACK: TEXT-BASED POSTS (only if selector-based failed) ---
            if (data.posts.length === 0) {
                console.log("🚀 Fallback: Using text-based posts extraction...");
                const actLines = getSectionLines("Activity");
                let currentPost = [];
                const timeRegex = /^\d+[dwmoqy]\s*•/i;
                
                actLines.forEach(l => {
                    if (timeRegex.test(l)) {
                        if (currentPost.length > 0 && currentPost.join(" ").length > 20) {
                            data.posts.push(currentPost.join(" "));
                        }
                        currentPost = [];
                    } else {
                        currentPost.push(l);
                    }
                });
                if (currentPost.length > 0 && currentPost.join(" ").length > 20) data.posts.push(currentPost.join(" "));
                data.posts = [...new Set(data.posts)];
            }

            // --- GENERIC LIST CHUNKER ---
            function chunkList(linesArray) {
                let items = [];
                let current = [];
                const dateRegex = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{4}|\b\d{4}\s*[–-]\s*(?:Present|\d{4})\b/i;
                
                for (let i = 0; i < linesArray.length; i++) {
                    let l = linesArray[i];
                    
                    if (l.includes("skills") && l.includes("+")) continue;
                    if (l.startsWith("Issued ")) continue;
                    
                    let hasDate = current.some(x => dateRegex.test(x));
                    let nextLinesHaveDate = linesArray.slice(i, i+3).some(x => dateRegex.test(x));

                    if (hasDate && l.length < 60 && nextLinesHaveDate && !dateRegex.test(l) && !l.startsWith("•") && !l.startsWith("-")) {
                        items.push(current.join(" | "));
                        current = [];
                    }
                    current.push(l);
                }
                if (current.length > 0) items.push(current.join(" | "));
                return items;
            }

            data.experience = chunkList(getSectionLines("Experience"));
            data.education = chunkList(getSectionLines("Education"));
            data.certifications = chunkList(getSectionLines("Licenses & certifications"));
            data.projects = chunkList(getSectionLines("Projects"));

            // --- SKILLS ---
            const skillLines = getSectionLines("Skills");
            skillLines.forEach(l => {
                if (l.length < 50 && !l.includes("Endorsed by")) {
                    data.skills.push(...l.split(/[•·]/).map(s => clean(s)).filter(Boolean));
                }
            });

            // --- INTERESTS ---
            const intLines = getSectionLines("Interests");
            intLines.forEach(l => {
                if (l.length < 40 && !l.includes("Managing General") && !l.includes("stuff")) {
                    data.interests.push(l);
                }
            });

            // --- FINAL CLEANUP ---
            for(let key in data) {
                if(Array.isArray(data[key])) {
                    data[key] = [...new Set(data[key].map(clean).filter(Boolean))];
                }
            }

            console.log(`🚀 Final posts count: ${data.posts.length}`);
            console.log(JSON.stringify(data, null, 2));
            return {
                success: true,
                data: { ...data, lastScannedAt: new Date().toISOString() }
            };
        },
    });

    return execResult?.[0]?.result;
}

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

// Standalone scrape function (extracted so command handler can call directly - chrome.runtime.sendMessage to self doesn't work in MV3)
async function scrapeProfilePostsImpl(profileUrl, postCount) {
    try {
        console.log('✨ BACKGROUND: Scraping comprehensive profile data...');
        console.log('BACKGROUND: Profile URL:', profileUrl);
        console.log('BACKGROUND: Post count:', postCount);

        const urlMatch = profileUrl.match(/linkedin\.com\/in\/([^\/\?]+)/);
        if (!urlMatch) return { success: false, error: 'Invalid LinkedIn profile URL' };
        const username = urlMatch[1];

        // Open the main profile page to extract comprehensive data
        const mainProfileUrl = `https://www.linkedin.com/in/${username}/`;
        console.log('BACKGROUND: Opening profile page:', mainProfileUrl);
        // Open in a new focused window so LinkedIn renders the full SDUI top card (name/headline)
        const profileWindow = await chrome.windows.create({ url: mainProfileUrl, type: 'popup', focused: true, width: 1200, height: 800 });
        const profileTab = profileWindow.tabs[0];
        const profileWindowId = profileWindow.id;
        await waitForContentLoad(profileTab.id, 12000);
        await scrollAndLoadContent(profileTab.id, 3);
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Extract comprehensive profile data using the new scraper
        const profileResult = await chrome.scripting.executeScript({
            target: { tabId: profileTab.id },
            func: profileScraper
        });

        const profileData = profileResult[0]?.result;
        if (!profileData) {
            try { await chrome.windows.remove(profileWindowId); } catch(e) {}
            return { success: false, error: 'Failed to extract profile data' };
        }

        console.log('BACKGROUND: Profile data extracted:', { name: profileData.name, headline: profileData.headline, skillsCount: profileData.skills.length, experienceCount: profileData.experience.length });

        // Now extract posts from the activity page if posts are requested
        let scrapedPosts = [];
        if (postCount > 0 && profileData.posts && profileData.posts.length > 0) {
            // Use posts extracted directly from the profile page
            scrapedPosts = profileData.posts.slice(0, postCount).map(postContent => ({
                content: postContent.substring(0, 5000),
                authorName: profileData.name || 'Unknown',
                postUrl: profileUrl
            }));
            console.log(`BACKGROUND: Found ${profileData.posts.length} posts on profile, using ${scrapedPosts.length}`);
            try { await chrome.windows.remove(profileWindowId); } catch(e) {}
        } else if (postCount > 0) {
            // Fallback to activity page scraping if no posts found on main profile
            console.log('BACKGROUND: No posts found on main profile, checking activity page...');
            try { await chrome.windows.remove(profileWindowId); } catch(e) {}
            
            const activityUrl = `https://www.linkedin.com/in/${username}/recent-activity/all/`;
            const activityTab = await chrome.tabs.create({ url: activityUrl, active: false });
            await waitForContentLoad(activityTab.id, 12000);
            await scrollAndLoadContent(activityTab.id, 3);
            await new Promise(resolve => setTimeout(resolve, 2000));

            const extractResult = await chrome.scripting.executeScript({
                target: { tabId: activityTab.id },
                func: (maxPosts) => {
                    const postUrns = [];
                    const postElements = document.querySelectorAll('[data-urn*="urn:li:activity:"], [data-id*="urn:li:activity:"]');
                    for (const post of postElements) {
                        if (postUrns.length >= maxPosts) break;
                        let urn = post.getAttribute('data-urn') || post.getAttribute('data-id');
                        if (!urn || !urn.includes('urn:li:activity:')) continue;
                        const activityMatch = urn.match(/urn:li:activity:(\d+)/);
                        if (activityMatch) {
                            const isRepost = post.querySelector('.feed-shared-reshared-content') || post.querySelector('.update-components-mini-update-v2');
                            if (!isRepost) postUrns.push({ activityId: activityMatch[1], urn });
                        }
                    }
                    return postUrns;
                },
                args: [postCount + 5]
            });

            await chrome.tabs.remove(activityTab.id);
            const postUrns = extractResult[0]?.result || [];
            if (postUrns.length > 0) {
                console.log(`BACKGROUND: Found ${postUrns.length} post URNs in activity, extracting content...`);
                
                for (let i = 0; i < Math.min(postUrns.length, postCount); i++) {
                    const { activityId } = postUrns[i];
                    const postUrl = `https://www.linkedin.com/feed/update/urn:li:activity:${activityId}/`;
                    try {
                        const postTab = await chrome.tabs.create({ url: postUrl, active: false });
                        await new Promise(resolve => setTimeout(resolve, 4000));
                        const postResult = await chrome.scripting.executeScript({
                            target: { tabId: postTab.id },
                            func: () => {
                                let content = '';
                                for (const sel of ['.feed-shared-update-v2__description .update-components-text','.update-components-text','.feed-shared-text','.feed-shared-inline-show-more-text','article .break-words']) {
                                    const el = document.querySelector(sel);
                                    if (el) { content = el.innerText || el.textContent || ''; if (content.length > 50) break; }
                                }
                                content = content.replace(/\s+/g, ' ').replace(/…more$/i, '').replace(/See more$/i, '').replace(/See translation$/i, '').trim();
                                let likes = 0, comments = 0;
                                const likesEl = document.querySelector('.social-details-social-counts__reactions-count');
                                if (likesEl) { const m = likesEl.textContent?.match(/(\d+(?:,\d+)*)/); if (m) likes = parseInt(m[1].replace(/,/g, '')); }
                                const commentsBtn = document.querySelector('button[aria-label*="comment"]');
                                if (commentsBtn) { const m = commentsBtn.getAttribute('aria-label')?.match(/(\d+)/); if (m) comments = parseInt(m[1]); }
                                return { content, likes, comments };
                            }
                        });
                        await chrome.tabs.remove(postTab.id);
                        const postData = postResult[0]?.result;
                        if (postData && postData.content && postData.content.length >= 50) {
                            const skipPatterns = [/^is now/i, /updated their profile/i, /shared this/i, /endorsed/i, /started following/i, /celebrated/i, /has a new profile photo/i, /reacted to this/i];
                            if (!skipPatterns.some(p => p.test(postData.content))) {
                                scrapedPosts.push({ content: postData.content.substring(0, 5000), likes: postData.likes || 0, comments: postData.comments || 0, authorName: profileData.name || 'Unknown', postUrl });
                            }
                        }
                        await new Promise(resolve => setTimeout(resolve, 1500));
                    } catch (postError) { console.warn(`BACKGROUND: Failed to scrape post ${i + 1}:`, postError.message); }
                }
            }
        } else {
            try { await chrome.windows.remove(profileWindowId); } catch(e) {}
        }

        console.log(`✅ BACKGROUND: Successfully extracted profile data and ${scrapedPosts.length} posts`);

        // Save to backend
        try {
            const { apiBaseUrl } = await chrome.storage.local.get(['apiBaseUrl']);
            const apiUrl = (apiBaseUrl && !apiBaseUrl.includes('backend-buxx') && !apiBaseUrl.includes('backend-api-orcin') && !apiBaseUrl.includes('backend-4poj')) ? apiBaseUrl : (API_CONFIG.BASE_URL || 'https://kommentify.com');
            if (!(await getFreshToken())) return { success: false, error: 'Not authenticated.' };
            const ingestResponse = await fetch(`${apiUrl}/api/vector/ingest`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ posts: scrapedPosts, inspirationSource: { name: profileData.name, profileUrl } })
            });
            const ingestData = await ingestResponse.json();
            if (ingestData.success) {
                await chrome.storage.local.set({ lastInspirationResult: { success: true, authorName: profileData.name, postCount: ingestData.count, profileUrl, timestamp: Date.now() } });
                return { success: true, posts: scrapedPosts, profileData, skippedCount, savedToBackend: true, savedCount: ingestData.count };
            }
            return { success: true, posts: scrapedPosts, profileData, skippedCount, savedToBackend: false, backendError: ingestData.error };
        } catch (apiError) {
            return { success: true, posts: scrapedPosts, profileData, skippedCount, savedToBackend: false, backendError: apiError.message };
        }
    } catch (error) {
        console.error('❌ BACKGROUND: Error scraping profile posts:', error);
        return { success: false, error: error.message };
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
    
    // Force sync analytics to backend
    if (request.action === "syncAnalytics") {
        (async () => {
            try {
                console.log('BACKGROUND: Manual analytics sync triggered');
                forceAnalyticsSync();
                sendResponse({ success: true, message: 'Analytics sync triggered' });
            } catch (error) {
                console.error('BACKGROUND: Error syncing analytics:', error);
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
                const token = await getFreshToken();
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
                    const { apiBaseUrl } = await chrome.storage.local.get(['apiBaseUrl']);
                    const apiUrl = (apiBaseUrl && !apiBaseUrl.includes('backend-buxx') && !apiBaseUrl.includes('backend-api-orcin') && !apiBaseUrl.includes('backend-4poj')) ? apiBaseUrl : (API_CONFIG.BASE_URL || 'https://kommentify.com');
                    
                    if (!(await getFreshToken())) {
                        console.error('BACKGROUND: No auth token, cannot save to backend');
                        sendResponse({ success: false, error: 'Not authenticated. Please log in first.' });
                        return;
                    }
                    
                    console.log(`📤 BACKGROUND: Sending ${scrapedPosts.length} posts to vector DB...`);
                    
                    const ingestResponse = await fetch(`${apiUrl}/api/vector/ingest`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${await getFreshToken()}`,
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
                const { apiBaseUrl } = await chrome.storage.local.get(['apiBaseUrl']);
                const apiUrl = (apiBaseUrl && !apiBaseUrl.includes('backend-buxx') && !apiBaseUrl.includes('backend-api-orcin') && !apiBaseUrl.includes('backend-4poj')) ? apiBaseUrl : (API_CONFIG.BASE_URL || 'https://kommentify.com');
                
                if (!(await getFreshToken())) {
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
                        'Authorization': `Bearer ${await getFreshToken()}`,
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
                
                // Stop all running automation modules immediately
                try { importAutomation.stop(); } catch (e) {}
                try { await stopBulkProcessing(); } catch (e) {}
                try { await peopleSearchAutomation.stopProcessing(); } catch (e) {}
                
                // Log the stop event
                try {
                    const { liveLog } = await import('../shared/services/liveActivityLogger.js');
                    liveLog.stop('automation', '🛑 All tasks stopped by user');
                } catch (e) {}
                
                // Close scraper window/tab if it exists (registered by enhancedScraper)
                if (globalThis._scrapingWindowId) {
                    try {
                        await chrome.windows.remove(globalThis._scrapingWindowId);
                        console.log(`🛑 BACKGROUND: Closed scraper window ${globalThis._scrapingWindowId}`);
                    } catch (e) { /* window may already be closed */ }
                    globalThis._scrapingWindowId = null;
                }
                if (globalThis._scrapingTabId) {
                    try {
                        await chrome.tabs.remove(globalThis._scrapingTabId);
                        console.log(`🛑 BACKGROUND: Closed scraper tab ${globalThis._scrapingTabId}`);
                    } catch (e) { /* tab may already be closed */ }
                    globalThis._scrapingTabId = null;
                }
                
                // Close all LinkedIn tabs opened by commands
                const tabIds = [...globalThis._commandLinkedInTabs];
                for (const tabId of tabIds) {
                    try { await chrome.tabs.remove(tabId); } catch (e) { /* tab may already be closed */ }
                }
                globalThis._commandLinkedInTabs.clear();
                globalThis._processingCommandIds.clear();
                
                // Cancel all pending commands via API
                const { apiBaseUrl } = await chrome.storage.local.get(['apiBaseUrl']);
                const apiUrl = (apiBaseUrl && !apiBaseUrl.includes('backend-buxx') && !apiBaseUrl.includes('backend-api-orcin') && !apiBaseUrl.includes('backend-4poj')) ? apiBaseUrl : (API_CONFIG.BASE_URL || 'https://kommentify.com');
                if (authToken) {
                    await fetch(`${apiUrl}/api/extension/command/stop-all`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' }
                    });
                }
                
                // Reset flag after longer delay so all running tasks have time to see the flag
                setTimeout(() => { globalThis._stopAllTasks = false; }, 30000);
                
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
                const { apiBaseUrl } = await chrome.storage.local.get(['apiBaseUrl']);
                const apiUrl = (apiBaseUrl && !apiBaseUrl.includes('backend-buxx') && !apiBaseUrl.includes('backend-api-orcin') && !apiBaseUrl.includes('backend-4poj')) ? apiBaseUrl : (API_CONFIG.BASE_URL || 'https://kommentify.com');
                
                if (!(await getFreshToken())) {
                    globalThis._pollCommandsRunning = false;
                    sendResponse({ success: false, commands: [] });
                    return;
                }
                
                const response = await fetch(`${apiUrl}/api/extension/command`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${await getFreshToken()}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                const data = await response.json();
                
                if (data.success && data.commands && data.commands.length > 0) {
                    console.log(`📥 BACKGROUND: Found ${data.commands.length} pending commands from website`);
                    
                    // Commands handled by alarm-based commandPoller — skip them here
                    const alarmOnlyCommands = ['start_bulk_commenting', 'start_import_automation', 'AI_PROFILE_RECAPTURE'];
                    
                    for (const cmd of data.commands) {
                        // Skip commands that are handled by the alarm-based poller
                        if (alarmOnlyCommands.includes(cmd.command)) {
                            console.log(`⏭️ BACKGROUND: Skipping ${cmd.command} - handled by alarm poller`);
                            continue;
                        }
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
                                headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' },
                                body: JSON.stringify({ commandId: cmd.id, status: 'in_progress' })
                            });
                        } catch (e) { /* continue anyway */ }

                        if (cmd.command === 'post_to_linkedin' && cmd.data?.content) {
                            console.log('📝 BACKGROUND: Executing post_to_linkedin command...');
                            try {
                                const { liveLog: ll } = await import('../shared/services/liveActivityLogger.js');
                                ll.start('post_writer', `✍️ Posting to LinkedIn...`);
                            } catch (e) {}
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

                                // Load post writer delay settings from Limits tab
                                const { delaySettings: pwDelays } = await chrome.storage.local.get('delaySettings');
                                const pageLoadWait = ((pwDelays && pwDelays.postWriterPageLoadDelay) || 5) * 1000;
                                console.log(`BACKGROUND: LinkedIn tab loaded, waiting ${pageLoadWait/1000}s for render (from Limits)...`);
                                await new Promise(resolve => setTimeout(resolve, pageLoadWait));

                                // Step 3: Inject posting script into the LinkedIn tab
                                const content = cmd.data.content;
                                const imageDataUrl = cmd.data.imageDataUrl || null;
                                console.log('BACKGROUND: Injecting post script, hasImage:', !!imageDataUrl);
                                const result = await chrome.scripting.executeScript({
                                    target: { tabId: postTab.id },
                                    func: (postContent, imgDataUrl) => {
                                        return new Promise((resolve) => {
                                            const _poll = (fn, interval, timeout) => new Promise(r => {
                                                const start = Date.now();
                                                const check = () => { const el = fn(); if (el) return r(el); if (Date.now() - start > timeout) return r(null); setTimeout(check, interval); };
                                                check();
                                            });
                                            const _findStartBtn = () => {
                                                // Method 1: New LinkedIn UI - data-view-name attribute (most reliable)
                                                const s0 = document.querySelector('[data-view-name="share-sharebox-focus"]');
                                                if (s0) return s0;
                                                // Method 2: Look for any clickable element with "Start a post" text
                                                const clickables = document.querySelectorAll('button, [role="button"]');
                                                for (const el of clickables) {
                                                    const txt = (el.textContent || '').toLowerCase();
                                                    if (txt.includes('start a post')) return el;
                                                }
                                                // Method 3: aria-label based detection
                                                for (const el of clickables) {
                                                    const label = (el.getAttribute('aria-label') || '').toLowerCase();
                                                    if (label.includes('start a post')) return el;
                                                }
                                                // Method 4: Legacy selectors (fallback)
                                                const s1 = document.querySelector('div.share-box-feed-entry__top-bar button');
                                                if (s1) return s1;
                                                return document.querySelector('.share-box-feed-entry__trigger');
                                            };
                                            const _findEditor = () => {
                                                const searchInRoot = (root) => {
                                                    const selectors = ['.editor-content .ql-editor[contenteditable="true"]', '.ql-editor[contenteditable="true"]', '[role="textbox"][contenteditable="true"]', '[contenteditable="true"][aria-multiline="true"]'];
                                                    for (const sel of selectors) { const el = root.querySelector(sel); if (el) return el; }
                                                    for (const el of root.querySelectorAll('[contenteditable="true"]')) {
                                                        const ph = (el.getAttribute('data-placeholder') || el.getAttribute('aria-placeholder') || '').toLowerCase();
                                                        if (ph.includes('want to talk about')) return el;
                                                    }
                                                    return null;
                                                };
                                                const shadowHost = document.querySelector('#interop-outlet');
                                                if (shadowHost && shadowHost.shadowRoot) {
                                                    console.log('LinkedIn Post Script: Searching in shadow DOM...');
                                                    const editor = searchInRoot(shadowHost.shadowRoot);
                                                    if (editor) { console.log('LinkedIn Post Script: Editor found in shadow DOM!'); return editor; }
                                                }
                                                const dialog = document.querySelector('[role="dialog"]');
                                                if (dialog) { const editor = searchInRoot(dialog); if (editor) return editor; }
                                                return searchInRoot(document);
                                            };
                                            const _findPostBtn = () => {
                                                const searchForBtn = (root) => {
                                                    for (const btn of root.querySelectorAll('button')) {
                                                        const txt = (btn.textContent || '').trim().toLowerCase();
                                                        if (txt === 'post') return btn;
                                                    }
                                                    return null;
                                                };
                                                const shadowHost = document.querySelector('#interop-outlet');
                                                if (shadowHost && shadowHost.shadowRoot) { const btn = searchForBtn(shadowHost.shadowRoot); if (btn) return btn; }
                                                const dialog = document.querySelector('[role="dialog"]');
                                                return searchForBtn(dialog || document);
                                            };
                                            try {
                                            console.log('LinkedIn Post Script: Starting...', { hasImage: !!imgDataUrl });
                                            const startPostBtn = _findStartBtn();
                                            if (!startPostBtn) {
                                                resolve({ success: false, error: 'Start post button not found' });
                                                return;
                                            }
                                            console.log('LinkedIn Post Script: Start button found, clicking...', {
                                                tagName: startPostBtn.tagName,
                                                className: startPostBtn.className,
                                                text: startPostBtn.textContent?.substring(0, 50)
                                            });
                                            startPostBtn.click();
                                            
                                            setTimeout(() => {
                                                const modal = document.querySelector('[role="dialog"]');
                                                console.log('LinkedIn Post Script: Modal check after 1.5s:', modal ? 'FOUND ✓' : 'NOT FOUND ✗');
                                                if (modal) {
                                                    console.log('LinkedIn Post Script: Modal details:', {
                                                        className: modal.className,
                                                        childCount: modal.children.length
                                                    });
                                                }
                                                
                                                const pollTimeout = 20000; // 20 seconds
                                                console.log(`LinkedIn Post Script: Polling for editor (timeout ${pollTimeout}ms)...`);
                                                _poll(_findEditor, 500, pollTimeout).then(async (editor) => {
                                                try {
                                                if (!editor) {
                                                    resolve({ success: false, error: 'Editor not found after polling' });
                                                    return;
                                                }
                                                console.log('LinkedIn Post Script: Editor found via logic-based detection');
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
                                                        const byteString = atob(imgDataUrl.split(',')[1]);
                                                        const mimeString = imgDataUrl.split(',')[0].split(':')[1].split(';')[0];
                                                        const ab = new ArrayBuffer(byteString.length);
                                                        const ia = new Uint8Array(ab);
                                                        for (let j = 0; j < byteString.length; j++) ia[j] = byteString.charCodeAt(j);
                                                        const blob = new Blob([ab], { type: mimeString });
                                                        const file = new File([blob], 'image.png', { type: mimeString });
                                                        try {
                                                            await navigator.clipboard.write([new ClipboardItem({ [mimeString]: blob })]);
                                                        } catch (clipErr) {
                                                            console.log('LinkedIn Post Script: Clipboard write failed:', clipErr.message);
                                                        }
                                                        editor.focus();
                                                        const dt = new DataTransfer();
                                                        dt.items.add(file);
                                                        const pasteEvt = new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: dt });
                                                        editor.dispatchEvent(pasteEvt);
                                                        const shareBox = document.querySelector('.share-box--is-open') || document.querySelector('.share-creation-state') || document.querySelector('[role="dialog"]');
                                                        if (shareBox) {
                                                            shareBox.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: dt }));
                                                        }
                                                        await new Promise(r => setTimeout(r, 3000));
                                                        return true;
                                                    } catch (imgErr) {
                                                        console.error('LinkedIn Post Script: Image paste error:', imgErr);
                                                        return false;
                                                    }
                                                };

                                                const imageAttached = await pasteImage();
                                                console.log('LinkedIn Post Script: Image attached:', imageAttached);
                                                const extraWait = imgDataUrl ? 4000 : 0;
                                                await new Promise(r => setTimeout(r, 3000 + extraWait));
                                                
                                                const postButton = _findPostBtn();
                                                if (postButton && !postButton.disabled) {
                                                    postButton.click();
                                                    console.log('LinkedIn Post Script: Post button clicked');
                                                    resolve({ success: true, posted: true, imageAttached });
                                                } else {
                                                    console.log('LinkedIn Post Script: Post button not found or disabled');
                                                    resolve({ success: true, posted: false, message: 'Content inserted, click Post manually', imageAttached });
                                                }
                                                } catch (innerErr) {
                                                    resolve({ success: false, error: 'Inner error: ' + innerErr.message });
                                                }
                                            });
                                            }, 1500);
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
                                        headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ commandId: cmd.id, status: scriptResult?.posted ? 'completed' : 'completed_manual' })
                                    });
                                    console.log('✅ BACKGROUND: Post to LinkedIn command completed');
                                    try {
                                        const { liveLog: ll } = await import('../shared/services/liveActivityLogger.js');
                                        ll.post('post_writer', `✅ Post published to LinkedIn${scriptResult?.imageAttached ? ' (with image)' : ''}`);
                                    } catch (e) {}
                                } catch (fetchErr) {
                                    console.error('BACKGROUND: Failed to update command status:', fetchErr.message);
                                }
                            } catch (postError) {
                                console.error('❌ BACKGROUND: Failed to post to LinkedIn:', postError);
                                try {
                                    const { liveLog: ll } = await import('../shared/services/liveActivityLogger.js');
                                    ll.error('post_writer', `❌ Post failed: ${postError.message}`);
                                } catch (e) {}
                                try {
                                    await fetch(`${apiUrl}/api/extension/command`, {
                                        method: 'PUT',
                                        headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' },
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
                                // Call extracted function directly (chrome.runtime.sendMessage to self doesn't work in MV3)
                                const scrapeResult = await scrapeProfilePostsImpl(cmd.data.profileUrl, cmd.data.postCount || 10);

                                await fetch(`${apiUrl}/api/extension/command`, {
                                    method: 'PUT',
                                    headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ commandId: cmd.id, status: scrapeResult.success ? 'completed' : 'failed' })
                                });
                                console.log('✅ BACKGROUND: scrape_profile command done:', scrapeResult.success);
                            } catch (scrapeError) {
                                console.error('❌ BACKGROUND: scrape_profile failed:', scrapeError);
                                await fetch(`${apiUrl}/api/extension/command`, {
                                    method: 'PUT',
                                    headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ commandId: cmd.id, status: 'failed' })
                                });
                            } finally {
                                globalThis._processingCommandIds.delete(cmd.id);
                            }
                        }

                        // Handle scrape_feed_now command from website (time-based)
                        if (cmd.command === 'scrape_feed_now') {
                            console.log('🔍 BACKGROUND: Executing scrape_feed_now (time-based)...');
                            let scrapeTab = null;
                            let scrapeWindowId = null;
                            try {
                                // Mark as in_progress
                                await fetch(`${apiUrl}/api/extension/command`, { method: 'PUT', headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ commandId: cmd.id, status: 'in_progress', data: { postsFound: 0, scrollCount: 0, message: 'Opening LinkedIn feed...' } }) });
                                // Open in a new focused window (half screen width)
                                const currentWindow = await chrome.windows.getCurrent();
                                const halfWidth = Math.floor((currentWindow.width || 1920) / 2);
                                const newWindow = await chrome.windows.create({
                                    url: 'https://www.linkedin.com/feed/',
                                    type: 'normal',
                                    focused: true,
                                    left: 0,
                                    top: 0,
                                    width: halfWidth,
                                    height: currentWindow.height || 1080
                                });
                                scrapeTab = newWindow.tabs[0];
                                scrapeWindowId = newWindow.id;
                                globalThis._commandLinkedInTabs.add(scrapeTab.id);
                                await new Promise((resolve) => {
                                    const checkComplete = (tabId, changeInfo) => {
                                        if (tabId === scrapeTab.id && changeInfo.status === 'complete') {
                                            chrome.tabs.onUpdated.removeListener(checkComplete);
                                            resolve();
                                        }
                                    };
                                    chrome.tabs.onUpdated.addListener(checkComplete);
                                    setTimeout(() => { chrome.tabs.onUpdated.removeListener(checkComplete); resolve(); }, 30000);
                                });
                                await new Promise(resolve => setTimeout(resolve, 5000));

                                const durationMs = (cmd.data?.durationMinutes || 3) * 60 * 1000;
                                const minLikes = cmd.data?.minLikes || 0;
                                const minComments = cmd.data?.minComments || 0;
                                const keywords = cmd.data?.keywords ? cmd.data.keywords.split(',').map(k => k.trim().toLowerCase()).filter(Boolean) : [];
                                const startTime = Date.now();
                                let scrollCount = 0;
                                console.log(`BACKGROUND: Scrolling for ${cmd.data?.durationMinutes || 3} minutes...`);

                                // Scroll continuously for the duration
                                while (Date.now() - startTime < durationMs) {
                                    // Check if cancelled
                                    try {
                                        const statusRes = await fetch(`${apiUrl}/api/extension/command/all`, { headers: { 'Authorization': `Bearer ${await getFreshToken()}` } });
                                        const statusData = await statusRes.json();
                                        const currentCmd = statusData.commands?.find(c => c.id === cmd.id);
                                        if (currentCmd && (currentCmd.status === 'cancelled' || currentCmd.status === 'failed')) {
                                            console.log('BACKGROUND: Scrape cancelled by user');
                                            break;
                                        }
                                    } catch (e) {}
                                    await scrollAndLoadContent(scrapeTab.id, 1);
                                    scrollCount++;
                                    // Inject/update on-page status overlay
                                    const elapsed = Math.floor((Date.now() - startTime) / 1000);
                                    const remaining = Math.max(0, Math.floor((durationMs - (Date.now() - startTime)) / 1000));
                                    try {
                                        const countResult = await chrome.scripting.executeScript({
                                            target: { tabId: scrapeTab.id },
                                            func: (minL, minC, kws, elapsedSec, remainingSec, scrollNum) => {
                                                let totalPosts = 0, qualifiedPosts = 0;
                                                const els = document.querySelectorAll('[data-id^="urn:li:activity:"]');
                                                for (const el of els) {
                                                    const textEl = el.querySelector('.update-components-text, .feed-shared-text, .feed-shared-inline-show-more-text');
                                                    const content = textEl ? (textEl.innerText || '').trim() : '';
                                                    if (content.length < 50) continue;
                                                    totalPosts++;
                                                    let likes = 0, comments = 0;
                                                    const likesEl = el.querySelector('.social-details-social-counts__reactions-count');
                                                    if (likesEl) { const m = likesEl.textContent?.match(/(\d+(?:,\d+)*)/); if (m) likes = parseInt(m[1].replace(/,/g, '')); }
                                                    const commentsEl = el.querySelector('button[aria-label*="comment"]');
                                                    if (commentsEl) { const m = commentsEl.getAttribute('aria-label')?.match(/(\d+)/); if (m) comments = parseInt(m[1]); }
                                                    if (likes < minL || comments < minC) continue;
                                                    if (kws.length > 0 && !kws.some(kw => content.toLowerCase().includes(kw))) continue;
                                                    qualifiedPosts++;
                                                }
                                                let overlay = document.getElementById('kommentify-scrape-status');
                                                if (!overlay) {
                                                    overlay = document.createElement('div');
                                                    overlay.id = 'kommentify-scrape-status';
                                                    overlay.style.cssText = 'position:fixed;top:12px;right:12px;z-index:99999;background:linear-gradient(135deg,#1a1a2e,#16213e);color:#fff;padding:16px 20px;border-radius:14px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:13px;line-height:1.6;box-shadow:0 8px 32px rgba(0,0,0,0.4);border:1px solid rgba(105,63,233,0.3);min-width:240px;';
                                                    document.body.appendChild(overlay);
                                                }
                                                const mins = Math.floor(remainingSec / 60);
                                                const secs = remainingSec % 60;
                                                overlay.innerHTML = `
                                                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
                                                        <div style="width:10px;height:10px;background:#4ade80;border-radius:50%;animation:kPulse 1.5s infinite;"></div>
                                                        <strong style="font-size:14px;color:#a78bfa;">Kommentify Feed Scraper</strong>
                                                    </div>
                                                    <div style="margin-bottom:6px;">Posts found: <strong style="color:#4ade80;">${totalPosts}</strong></div>
                                                    <div style="margin-bottom:6px;">Qualified: <strong style="color:#fbbf24;">${qualifiedPosts}</strong></div>
                                                    <div style="margin-bottom:6px;font-size:12px;opacity:0.7;">Filter: ${minL}+ likes, ${minC}+ comments</div>
                                                    <div style="margin-bottom:6px;font-size:12px;opacity:0.7;">Scrolls: ${scrollNum}</div>
                                                    <div style="font-size:12px;color:#a78bfa;">Time left: <strong>${mins}m ${secs}s</strong></div>
                                                    <div style="margin-top:8px;height:4px;background:rgba(255,255,255,0.1);border-radius:2px;overflow:hidden;">
                                                        <div style="height:100%;background:linear-gradient(90deg,#693fe9,#a78bfa);border-radius:2px;width:${Math.min(100, (elapsedSec / (elapsedSec + remainingSec)) * 100)}%;transition:width 0.5s;"></div>
                                                    </div>
                                                    <style>@keyframes kPulse{0%,100%{opacity:1}50%{opacity:0.4}}</style>
                                                `;
                                                return { totalPosts, qualifiedPosts };
                                            },
                                            args: [minLikes, minComments, keywords, elapsed, remaining, scrollCount]
                                        });
                                        const counts = countResult?.[0]?.result || { totalPosts: 0, qualifiedPosts: 0 };
                                        if (scrollCount % 3 === 0) {
                                            await fetch(`${apiUrl}/api/extension/command`, { method: 'PUT', headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ commandId: cmd.id, status: 'in_progress', data: { ...cmd.data, postsFound: counts.totalPosts, qualifiedPosts: counts.qualifiedPosts, scrollCount, elapsedSeconds: elapsed, remainingSeconds: remaining, message: `Scrolling feed... ${counts.totalPosts} posts found, ${counts.qualifiedPosts} qualified` } }) });
                                        }
                                    } catch (overlayErr) { /* tab may have issues */ }
                                    await new Promise(resolve => setTimeout(resolve, 3000));
                                }
                                await new Promise(resolve => setTimeout(resolve, 2000));

                                // Scrape visible posts
                                const scrapeResult = await chrome.scripting.executeScript({
                                    target: { tabId: scrapeTab.id },
                                    func: (minL, minC, kws) => {
                                        const posts = [];
                                        const postElements = document.querySelectorAll('[data-id^="urn:li:activity:"]');
                                        for (const el of postElements) {
                                            const textEl = el.querySelector('.update-components-text, .feed-shared-text, .feed-shared-inline-show-more-text');
                                            let content = textEl ? (textEl.innerText || '').trim() : '';
                                            content = content.replace(/[\s\n]*\.{2,3}more\s*$/i, '').replace(/[\s\n]*\u2026more\s*$/i, '').trim();
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

                                if (scrapedPosts.length > 0) {
                                    await fetch(`${apiUrl}/api/scraped-posts`, {
                                        method: 'POST',
                                        headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ posts: scrapedPosts })
                                    });
                                }

                                await fetch(`${apiUrl}/api/extension/command`, {
                                    method: 'PUT',
                                    headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ commandId: cmd.id, status: 'completed', data: { ...cmd.data, postsFound: scrapedPosts.length, scrollCount, message: `Completed! Saved ${scrapedPosts.length} posts from feed.` } })
                                });
                                console.log(`✅ BACKGROUND: scrape_feed_now done, saved ${scrapedPosts.length} posts`);
                            } catch (feedError) {
                                console.error('❌ BACKGROUND: scrape_feed_now failed:', feedError);
                                try {
                                    await fetch(`${apiUrl}/api/extension/command`, {
                                        method: 'PUT',
                                        headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ commandId: cmd.id, status: 'failed', data: { ...cmd.data, message: 'Scraping failed: ' + (feedError.message || 'unknown error') } })
                                    });
                                } catch (e) {}
                            } finally {
                                // Always close window and clean up
                                if (scrapeWindowId) { try { await chrome.windows.remove(scrapeWindowId); } catch (e) {} }
                                if (scrapeTab) { globalThis._commandLinkedInTabs.delete(scrapeTab.id); }
                                globalThis._processingCommandIds.delete(cmd.id);
                            }
                        }

                        // Handle scrape_comments command - scrape profile owner's comments from activity page
                        if (cmd.command === 'scrape_comments' && cmd.data?.profileUrl) {
                            console.log('💬 BACKGROUND: Executing scrape_comments command for:', cmd.data.profileUrl);
                            let commentTab = null;
                            const sendOverlayLegacy = async (tabId, message, type = 'info') => {
                                try { await chrome.tabs.sendMessage(tabId, { action: 'updateNetworkingStatus', message, type }); } catch (e) {}
                            };
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
                                await sendOverlayLegacy(tab.id, `🔍 Kommentify: Loading comments for ${targetProfileId}...`, 'info');

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
                                await sendOverlayLegacy(tab.id, `📝 Kommentify: Extracting comments from ${targetProfileId}...`, 'info');

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
                                    await sendOverlayLegacy(tab.id, `💾 Kommentify: Saving ${result.count} comments...`, 'info');
                                    const saveRes = await fetch(`${apiUrl}/api/scraped-comments`, {
                                        method: 'POST',
                                        headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' },
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
                                    await sendOverlayLegacy(tab.id, `✅ Kommentify: Saved ${result.count} comments from ${targetProfileId}!`, 'success');
                                } else {
                                    await sendOverlayLegacy(tab.id, `⚠️ Kommentify: No comments found for ${targetProfileId}`, 'warning');
                                }

                                await fetch(`${apiUrl}/api/extension/command`, {
                                    method: 'PUT',
                                    headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ commandId: cmd.id, status: 'completed' })
                                });
                                console.log(`✅ BACKGROUND: scrape_comments done, saved ${result.count} comments for ${targetProfileId}`);
                            } catch (commentError) {
                                console.error('❌ BACKGROUND: scrape_comments failed:', commentError);
                                if (commentTab) { try { await sendOverlayLegacy(commentTab.id, `❌ Kommentify: Comment scraping failed`, 'error'); } catch (x) {} }
                                try {
                                    await fetch(`${apiUrl}/api/extension/command`, {
                                        method: 'PUT',
                                        headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' },
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

                        // Handle scan_my_linkedin_profile command
                        if (cmd.command === 'scan_my_linkedin_profile') {
                            console.log('🔗 BACKGROUND: Executing scan_my_linkedin_profile...');
                            let scanTab = null;
                            try {
                                // Mark as in_progress
                                await fetch(`${apiUrl}/api/extension/command`, { method: 'PUT', headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ commandId: cmd.id, status: 'in_progress' }) });

                                // Navigate to LinkedIn profile root
                                const profileUrl = 'https://www.linkedin.com/in/';
                                scanTab = await chrome.tabs.create({ url: profileUrl, active: true });
                                console.log('🔗 BACKGROUND: Opened LinkedIn profile tab:', scanTab.id);

                                // Wait for page to load
                                await new Promise((resolve) => {
                                    const checkComplete = (tabId, changeInfo) => {
                                        if (tabId === scanTab.id && changeInfo.status === 'complete') {
                                            chrome.tabs.onUpdated.removeListener(checkComplete);
                                            resolve();
                                        }
                                    };
                                    chrome.tabs.onUpdated.addListener(checkComplete);
                                    setTimeout(() => { chrome.tabs.onUpdated.removeListener(checkComplete); resolve(); }, 30000);
                                });

                                // Give LinkedIn a moment to render
                                await new Promise(resolve => setTimeout(resolve, 2000));

                                // Normalize URL back to canonical profile if we landed on a details subpage
                                try {
                                    const navInfo = await chrome.scripting.executeScript({
                                        target: { tabId: scanTab.id },
                                        func: () => {
                                            const canonical = document.querySelector('link[rel="canonical"]')?.href || null;
                                            return { href: window.location.href, canonical };
                                        }
                                    });
                                    const nav = navInfo?.[0]?.result;
                                    if (nav?.canonical && nav?.href && nav.href.includes('/details/') && nav.canonical !== nav.href) {
                                        console.log('🔗 BACKGROUND: Redirecting from details page to canonical profile:', nav);
                                        await chrome.tabs.update(scanTab.id, { url: nav.canonical });

                                        // Wait again for profile root to load
                                        await new Promise((resolve) => {
                                            const checkComplete2 = (tabId, changeInfo) => {
                                                if (tabId === scanTab.id && changeInfo.status === 'complete') {
                                                    chrome.tabs.onUpdated.removeListener(checkComplete2);
                                                    resolve();
                                                }
                                            };
                                            chrome.tabs.onUpdated.addListener(checkComplete2);
                                            setTimeout(() => { chrome.tabs.onUpdated.removeListener(checkComplete2); resolve(); }, 30000);
                                        });
                                        await new Promise(resolve => setTimeout(resolve, 2000));
                                    }
                                } catch (navErr) {
                                    console.warn('🔗 BACKGROUND: Could not normalize profile URL:', navErr);
                                }

                                // Final small delay before extraction
                                await new Promise(resolve => setTimeout(resolve, 1000));

                                // Extract profile data using the same logic as your working browser script
                                const scanData = await scanLinkedInProfileInTab(scanTab.id);
                                console.log('🔗 BACKGROUND: Scan result:', scanData);

                                if (scanData?.success) {
                                    // Save to database - add profileUrl from the tab
                                    const profileUrl = (await chrome.tabs.get(scanTab.id)).url;
                                    const saveData = { ...scanData.data, profileUrl };
                                    await fetch(`${apiUrl}/api/linkedin-profile`, {
                                        method: 'POST',
                                        headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' },
                                        body: JSON.stringify(saveData)
                                    });
                                    console.log('🔗 BACKGROUND: Profile data saved to database');
                                    
                                    // Keep the LinkedIn tab open after successful scan
                                    console.log('🔗 BACKGROUND: LinkedIn tab kept open for user');
                                } else {
                                    // Close the tab if scan failed
                                    await chrome.tabs.remove(scanTab.id);
                                    console.log('🔗 BACKGROUND: Closed LinkedIn tab due to scan failure');
                                }

                                // Mark command as completed
                                await fetch(`${apiUrl}/api/extension/command`, { method: 'PUT', headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ commandId: cmd.id, status: 'completed' }) });
                                console.log('✅ BACKGROUND: scan_my_linkedin_profile completed');
                            } catch (e) {
                                console.error('❌ BACKGROUND: scan_my_linkedin_profile failed:', e);
                                // Close the LinkedIn tab on error
                                try { await chrome.tabs.remove(scanTab.id); } catch (tabError) {}
                                try { await fetch(`${apiUrl}/api/extension/command`, { method: 'PUT', headers: { 'Authorization': `Bearer ${await getFreshToken()}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ commandId: cmd.id, status: 'failed' }) }); } catch (x) {}
                            } finally {
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
                const { apiBaseUrl } = await chrome.storage.local.get(['apiBaseUrl']);
                const apiUrl = (apiBaseUrl && !apiBaseUrl.includes('backend-buxx') && !apiBaseUrl.includes('backend-api-orcin') && !apiBaseUrl.includes('backend-4poj')) ? apiBaseUrl : (API_CONFIG.BASE_URL || 'https://kommentify.com');
                
                if (!(await getFreshToken())) {
                    sendResponse({ success: false, error: 'Not authenticated' });
                    return;
                }
                
                const response = await fetch(`${apiUrl}/api/feed-schedules`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${await getFreshToken()}`,
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
                const token = await getFreshToken();
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
                const token = await getFreshToken();
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
                const token = await getFreshToken();
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
                const token = await getFreshToken();
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
                            const _poll = (fn, interval, timeout) => new Promise(r => {
                                const start = Date.now();
                                const check = () => { const el = fn(); if (el) return r(el); if (Date.now() - start > timeout) return r(null); setTimeout(check, interval); };
                                check();
                            });
                            const _findStartBtn = () => {
                                // Method 1: New LinkedIn UI - data-view-name attribute (most reliable)
                                const s0 = document.querySelector('[data-view-name="share-sharebox-focus"]');
                                if (s0) return s0;
                                // Method 2: Look for any clickable element with "Start a post" text
                                const clickables = document.querySelectorAll('button, [role="button"]');
                                for (const el of clickables) {
                                    const txt = (el.textContent || '').toLowerCase();
                                    if (txt.includes('start a post')) return el;
                                }
                                // Method 3: aria-label based detection
                                for (const el of clickables) {
                                    const label = (el.getAttribute('aria-label') || '').toLowerCase();
                                    if (label.includes('start a post')) return el;
                                }
                                // Method 4: Legacy selectors (fallback)
                                const s1 = document.querySelector('div.share-box-feed-entry__top-bar button');
                                if (s1) return s1;
                                return document.querySelector('.share-box-feed-entry__trigger');
                            };
                            const _findEditor = () => {
                                const dialog = document.querySelector('[role="dialog"]');
                                if (dialog) {
                                    const e1 = dialog.querySelector('[role="textbox"][contenteditable="true"]');
                                    if (e1) return e1;
                                    const e2 = dialog.querySelector('[contenteditable="true"][aria-multiline="true"]');
                                    if (e2) return e2;
                                    const e3 = dialog.querySelector('.ql-editor[contenteditable="true"]');
                                    if (e3) return e3;
                                }
                                const e4 = document.querySelector('.ql-editor[contenteditable="true"]');
                                if (e4) return e4;
                                for (const el of document.querySelectorAll('[contenteditable="true"]')) {
                                    const ph = (el.getAttribute('data-placeholder') || el.getAttribute('aria-placeholder') || '').toLowerCase();
                                    if (ph.includes('want to talk about')) return el;
                                }
                                return null;
                            };
                            const _findPostBtn = () => {
                                const dialog = document.querySelector('[role="dialog"]');
                                const scope = dialog || document;
                                for (const btn of scope.querySelectorAll('button')) {
                                    const txt = (btn.textContent || '').trim().toLowerCase();
                                    if (txt === 'post') return btn;
                                }
                                return null;
                            };
                            console.log('LinkedIn Post Script: Starting...');
                            const startPostBtn = _findStartBtn();
                            if (!startPostBtn) {
                                resolve({ success: false, error: 'Start post button not found' });
                                return;
                            }
                            console.log('LinkedIn Post Script: Found start button, clicking...');
                            startPostBtn.click();
                            _poll(_findEditor, 500, 11000).then(async (editor) => {
                                try {
                                    if (!editor) {
                                        resolve({ success: false, error: 'Editor not found after polling' });
                                        return;
                                    }
                                    console.log('LinkedIn Post Script: Editor found via logic-based detection');
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
                                    console.log('LinkedIn Post Script: Content inserted successfully');
                                    await new Promise(r => setTimeout(r, 3000));
                                    const postButton = _findPostBtn();
                                    if (postButton && !postButton.disabled) {
                                        console.log('LinkedIn Post Script: Clicking Post button...');
                                        postButton.click();
                                        resolve({ success: true, posted: true });
                                    } else if (postButton && postButton.disabled) {
                                        resolve({ success: true, posted: false, message: 'Content inserted but Post button disabled - click manually' });
                                    } else {
                                        resolve({ success: true, posted: false, message: 'Content inserted, please click Post manually' });
                                    }
                                } catch (err) {
                                    resolve({ success: false, error: err.message });
                                }
                            });
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
                const token = await getFreshToken();
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
    
    // Handle authComplete from authBridge - authentication was successful
    if (request.action === "authComplete") {
        (async () => {
            console.log('🔐 BACKGROUND: Auth complete received, token stored');
            // Clear any cached token state
            globalThis._lastTokenFetch = 0;
            // Verify token is stored
            const { authToken } = await chrome.storage.local.get(['authToken']);
            if (authToken) {
                console.log('🔐 BACKGROUND: ✅ Token verified in storage');
                sendResponse({ success: true, message: 'Authentication complete' });
            } else {
                console.log('🔐 BACKGROUND: ❌ Token not found in storage');
                sendResponse({ success: false, error: 'Token not stored' });
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

    // Command poller alarm - polls for website commands every 30s
    if (alarm.name === 'commandPoller') {
        await pollCommandsDirectly();
    }
});

console.log("BACKGROUND: Clean service worker ready");
