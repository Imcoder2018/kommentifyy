/**
 * Import Automation Handler
 * Handles bulk connection requests and post engagement for imported LinkedIn profiles
 */

import { browser } from '../shared/utils/browser.js';
import { backgroundStatistics } from './statisticsManager.js';
import { liveLog } from '../shared/services/liveActivityLogger.js';

class ImportAutomation {
    constructor() {
        this.isProcessing = false;
        this.currentOperation = null;
        this.stopFlag = false;
        this.activeTabId = null;
    }

    // Engage with a single post URL (used by individual method and fallback)
    async engageSinglePostUrl(postUrl, actions, randomMode, commentSettings, delays = {}) {
        console.log(`📱 INDIVIDUAL: Opening post: ${postUrl}`);
        liveLog.info('import', `📄 Opening post: ${postUrl.split('/').pop()}`, { postUrl });
        const normalizedActions = {
            likes: !!(actions?.likes ?? actions?.like),
            comments: !!(actions?.comments ?? actions?.comment),
            shares: !!(actions?.shares ?? actions?.share),
            follows: !!(actions?.follows ?? actions?.follow)
        };

        // Random mode: pick ONE action per post
        let postActions = { ...normalizedActions };
        if (randomMode) {
            const available = [];
            if (normalizedActions.likes) available.push('likes');
            if (normalizedActions.comments) available.push('comments');
            if (normalizedActions.shares) available.push('shares');
            if (available.length > 0) {
                const picked = available[Math.floor(Math.random() * available.length)];
                postActions = { likes: picked === 'likes', comments: picked === 'comments', shares: picked === 'shares', follows: normalizedActions.follows };
                console.log(`🎲 INDIVIDUAL: Random mode picked: ${picked}`);
            }
        }
        console.log('📱 INDIVIDUAL: Actions for this post:', JSON.stringify(postActions));

        const tabId = await browser.openTab(postUrl, true);
        if (!tabId) { console.error('📱 INDIVIDUAL: Failed to open tab'); return { likes: 0, comments: 0, shares: 0, follows: 0, postDetails: [] }; }

        try {
            await this.waitForLinkedInReady(tabId, 20000);
            const res = await chrome.scripting.executeScript({
                target: { tabId },
                func: async (postActions, commentSettings, delays) => {
                    // Jitter helper with debug logs
                    const jitter = async (ms = 0, label = 'generic') => {
                        const { randomMin = 0, randomMax = 0, baseDelay = 0 } = delays || {};
                        const extra = randomMax > 0 ? Math.floor(Math.random() * (randomMax - randomMin + 1)) + randomMin : 0;
                        const total = ms + baseDelay + extra;
                        console.log(`⏱️ INDIVIDUAL [${label}]: action=${ms}ms + base=${baseDelay}ms + jitter=${extra}ms = TOTAL ${total}ms (${(total/1000).toFixed(1)}s)`);
                        if (total > 0) await new Promise(r => setTimeout(r, total));
                        console.log(`✅ INDIVIDUAL [${label}]: Done`);
                    };

                    let likes = 0, comments = 0, shares = 0, follows = 0;
                    const postDetails = [];

                    // Wait for page to fully settle
                    await jitter(delays.postPageLoadDelay || 2000, 'postPageLoad');

                    // --- LIKE ---
                    if (postActions.likes) {
                        await jitter(delays.beforeLikeDelay || 0, 'beforeLike');
                        const likeSelectors = [
                            'button[aria-label*="React Like"]',
                            'span.reactions-react-button button',
                            'button.react-button__trigger',
                            'button[aria-label*="like" i]',
                            'button[data-control-name="like_toggle"]'
                        ];
                        let likeBtn = null;
                        for (const sel of likeSelectors) {
                            likeBtn = document.querySelector(sel);
                            if (likeBtn) { console.log(`📱 INDIVIDUAL: Like btn matched: ${sel}`); break; }
                        }
                        console.log(`📱 INDIVIDUAL: Like button found: ${!!likeBtn}, aria-pressed=${likeBtn?.getAttribute('aria-pressed')}`);
                        if (likeBtn && likeBtn.getAttribute('aria-pressed') !== 'true') {
                            likeBtn.click();
                            likes++;
                            console.log('📱 INDIVIDUAL: ✅ Liked post');
                            await jitter(1000, 'afterLike');
                        } else if (!likeBtn) {
                            console.warn('📱 INDIVIDUAL: ⚠️ No like button found on page');
                        }
                    }

                    // --- COMMENT with AI generation ---
                    if (postActions.comments) {
                        await jitter(delays.beforeCommentDelay || 0, 'beforeComment');
                        const commentBtnSelectors = [
                            'button[aria-label*="Comment" i]',
                            'button.comment-button',
                            'button[data-control-name="comment_toggle"]'
                        ];
                        let commentBtn = null;
                        for (const sel of commentBtnSelectors) {
                            commentBtn = document.querySelector(sel);
                            if (commentBtn) { console.log(`📱 INDIVIDUAL: Comment btn matched: ${sel}`); break; }
                        }
                        if (commentBtn) {
                            commentBtn.click();
                            await jitter(2000, 'afterCommentBtnClick');

                            let commentBox = document.querySelector('div[data-placeholder]') || document.querySelector('div.ql-editor, div[contenteditable="true"]');
                            console.log(`📱 INDIVIDUAL: Comment box found: ${!!commentBox}`);

                            if (commentBox) {
                                // Extract post text
                                const postTextEl = document.querySelector('.update-components-text');
                                const postText = postTextEl ? postTextEl.innerText.trim().substring(0, 500) : 'Interesting professional content';

                                // Extract author name
                                let authorName = 'there';
                                const authorLinks = document.querySelectorAll('a[aria-label]');
                                for (const link of authorLinks) {
                                    const label = link.getAttribute('aria-label') || '';
                                    const match = label.match(/^View\s+(.+?)[''\u2019]s/i) || label.match(/^(.+?)[''\u2019]s\s+profile/i);
                                    if (match && match[1] && match[1].length > 1 && match[1].length < 40) {
                                        const invalidTerms = ['comment', 'view', 'profile', 'linkedin'];
                                        if (!invalidTerms.some(t => match[1].toLowerCase().includes(t))) {
                                            authorName = match[1].trim().split(' ')[0];
                                            break;
                                        }
                                    }
                                }

                                console.log(`📱 INDIVIDUAL: Author="${authorName}", Post="${postText.substring(0, 80)}..."`);

                                // Generate AI comment via background script
                                let commentText = '';
                                try {
                                    console.log('📱 INDIVIDUAL: Requesting AI comment from background...');
                                    const response = await new Promise((resolve, reject) => {
                                        chrome.runtime.sendMessage({
                                            action: 'generateCommentFromContent',
                                            postText, authorName,
                                            goal: commentSettings.goal || 'AddValue',
                                            tone: commentSettings.tone || 'Professional',
                                            commentLength: commentSettings.commentLength || 'Short',
                                            userExpertise: commentSettings.userExpertise || '',
                                            userBackground: commentSettings.userBackground || ''
                                        }, (resp) => {
                                            if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
                                            else resolve(resp);
                                        });
                                    });
                                    if (response?.success && response?.comment) {
                                        commentText = response.comment;
                                        console.log(`📱 INDIVIDUAL: AI comment: "${commentText.substring(0, 60)}..."`);
                                    } else {
                                        console.log('📱 INDIVIDUAL: AI response error:', response?.error || 'No comment');
                                    }
                                } catch (aiErr) {
                                    console.error('📱 INDIVIDUAL: AI comment failed:', aiErr);
                                }

                                // Fallback template
                                if (!commentText) {
                                    const templates = [
                                        `Great insights, ${authorName}! Thanks for sharing this perspective.`,
                                        `Really valuable content here. Appreciate you sharing this, ${authorName}!`,
                                        `This resonates with me. Thanks for the thoughtful post, ${authorName}!`,
                                        `Excellent points! Looking forward to more content like this.`,
                                        `Well articulated thoughts. Thanks for sharing your expertise!`
                                    ];
                                    commentText = templates[Math.floor(Math.random() * templates.length)];
                                    console.log('📱 INDIVIDUAL: Using template comment (AI fallback)');
                                }

                                // Store post details for history
                                postDetails.push({
                                    authorName, postContent: postText, generatedComment: commentText,
                                    postLink: location.href, timestamp: Date.now()
                                });

                                // Insert comment
                                commentBox.focus();
                                commentBox.innerHTML = `<p>${commentText}</p>`;
                                commentBox.dispatchEvent(new Event('input', { bubbles: true }));
                                commentBox.dispatchEvent(new Event('change', { bubbles: true }));
                                commentBox.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'a' }));

                                console.log('📱 INDIVIDUAL: Comment inserted, looking for submit button...');
                                await jitter(1500, 'beforeCommentSubmit');

                                const submitSelectors = [
                                    'button.comments-comment-box__submit-button:not(:disabled)',
                                    'button.comments-comment-box__submit-button--cr:not(:disabled)',
                                    'form.comments-comment-box__form button[type="submit"]:not(:disabled)',
                                    'button[data-control-name="add_comment"]:not(:disabled)',
                                    '.comments-comment-box button.artdeco-button--primary:not(:disabled)',
                                    'button.comments-comment-texteditor__submit-button:not(:disabled)'
                                ];
                                let submitBtn = null;
                                for (const sel of submitSelectors) {
                                    submitBtn = document.querySelector(sel);
                                    if (submitBtn) { console.log(`📱 INDIVIDUAL: Submit btn matched: ${sel}`); break; }
                                }
                                if (submitBtn) {
                                    submitBtn.click();
                                    comments++;
                                    console.log('📱 INDIVIDUAL: ✅ Posted comment');
                                    await jitter(2500, 'afterCommentSubmit');
                                } else {
                                    const altBtn = document.querySelector('button.artdeco-button--primary:not(:disabled)');
                                    if (altBtn) {
                                        altBtn.click(); comments++;
                                        console.log('📱 INDIVIDUAL: ✅ Posted with alt button');
                                        await jitter(2500, 'afterAltCommentSubmit');
                                    } else {
                                        console.warn('📱 INDIVIDUAL: ⚠️ No submit button found');
                                    }
                                }
                            }
                        } else {
                            console.warn('📱 INDIVIDUAL: ⚠️ No comment button found on page');
                        }
                    }

                    // --- SHARE ---
                    if (postActions.shares) {
                        await jitter(delays.beforeShareDelay || 0, 'beforeShare');
                        const shareBtn = document.querySelector('button[aria-label*="Repost" i], button.social-reshare-button, button[data-control-name="share_toggle"]');
                        if (shareBtn) {
                            shareBtn.click();
                            await jitter(1500, 'afterShareBtnClick');
                            let repostOption = document.querySelector('li:nth-child(2) div.artdeco-dropdown__item');
                            if (!repostOption) {
                                const items = document.querySelectorAll('.artdeco-dropdown__item, [role="menuitem"]');
                                for (const item of items) {
                                    if (item.innerText.toLowerCase().includes('instant')) { repostOption = item; break; }
                                }
                            }
                            if (repostOption) {
                                repostOption.click(); shares++;
                                console.log('📱 INDIVIDUAL: ✅ Shared post');
                                await jitter(1500, 'afterShare');
                            }
                        }
                    }

                    // --- FOLLOW ---
                    if (postActions.follows) {
                        await jitter(delays.beforeFollowDelay || 0, 'beforeFollow');
                        const followBtn = document.querySelector('button.follow');
                        if (followBtn && !followBtn.getAttribute('data-followed')) {
                            followBtn.click(); follows++;
                            console.log('📱 INDIVIDUAL: ✅ Followed user');
                            await jitter(1000, 'afterFollow');
                        }
                    }

                    console.log(`📱 INDIVIDUAL: Post result: L=${likes} C=${comments} S=${shares} F=${follows}`);
                    return { likes, comments, shares, follows, postDetails };
                },
                args: [postActions, commentSettings, delays]
            });

            const engagement = res?.[0]?.result || { likes: 0, comments: 0, shares: 0, follows: 0, postDetails: [] };
            console.log('📱 INDIVIDUAL: Engagement result:', JSON.stringify({ likes: engagement.likes, comments: engagement.comments, shares: engagement.shares, follows: engagement.follows }));
            // Log each action result to live activity
            if (engagement.likes > 0) liveLog.like('import', `👍 Liked post: ${postUrl.split('/').pop()}`, { postUrl });
            if (engagement.comments > 0) {
                const commentText = engagement.postDetails?.[0]?.generatedComment || '';
                liveLog.comment('import', `💬 Commented on post: "${commentText.substring(0, 60)}..."`, { postUrl });
            }
            if (engagement.shares > 0) liveLog.share('import', `🔄 Shared post: ${postUrl.split('/').pop()}`, { postUrl });
            if (engagement.follows > 0) liveLog.follow('import', `➕ Followed author`, { postUrl });
            return engagement;
        } finally {
            try { await chrome.tabs.remove(tabId); } catch {}
        }
    }

    // Individual method: collect URLs from activity page, then engage each post in its own tab
    async engagePostsIndividualMethod(activityUrl, postsCount, actions, randomMode, commentSettings, delays) {
        console.log('📱 IMPORT [INDIVIDUAL METHOD]: Collecting post URLs from activity page...');
        liveLog.info('import', `🔍 Collecting post URLs from activity page...`, { activityUrl });

        // Step 1: Open activity page and collect post URLs
        const tabId = await browser.openTab(activityUrl, true);
        if (!tabId) throw new Error('Failed to open activity tab');

        await this.waitForLinkedInReady(tabId, 25000);
        await this.ensureLinkedInPosts(tabId, 5);

        // Extract URLs only (lightweight script)
        const urlResult = await chrome.scripting.executeScript({
            target: { tabId },
            func: (maxPosts) => {
                // Scroll to load more posts
                for (let i = 0; i < 5; i++) {
                    window.scrollBy(0, 1500);
                }
                // Brute-force URN scan
                const allElements = document.getElementsByTagName('*');
                const postLinks = new Set();
                for (let i = 0; i < allElements.length; i++) {
                    const el = allElements[i];
                    if (el.hasAttribute('data-urn')) {
                        const urn = el.getAttribute('data-urn') || '';
                        if (urn.includes('urn:li:activity:') || urn.includes('urn:li:ugcPost:') || urn.includes('urn:li:share:')) {
                            postLinks.add(`https://www.linkedin.com/feed/update/${urn}`);
                        }
                    }
                }
                const urls = Array.from(postLinks).slice(0, maxPosts);
                console.log(`📱 URL COLLECTOR: Found ${postLinks.size} total, returning ${urls.length}`);
                return urls;
            },
            args: [postsCount]
        });

        const postUrls = urlResult?.[0]?.result || [];
        console.log(`📱 IMPORT [INDIVIDUAL METHOD]: Collected ${postUrls.length} post URLs:`, postUrls);
        liveLog.info('import', `📄 Found ${postUrls.length} posts to engage with`, { count: postUrls.length });

        // Close activity page tab
        try { await chrome.tabs.remove(tabId); } catch {}

        if (postUrls.length === 0) {
            console.warn('📱 IMPORT [INDIVIDUAL METHOD]: No post URLs found');
            return { likes: 0, comments: 0, shares: 0, follows: 0, postDetails: [], error: 'No posts found on activity page' };
        }

        // Task init delay
        if (delays.taskInitDelay > 0) {
            console.log(`⏱️ IMPORT [INDIVIDUAL METHOD]: Task init delay: ${delays.taskInitDelay}ms`);
            await new Promise(r => setTimeout(r, delays.taskInitDelay));
        }

        // Step 2: Engage each post individually
        let totalLikes = 0, totalComments = 0, totalShares = 0, totalFollows = 0;
        const allPostDetails = [];

        for (let i = 0; i < postUrls.length; i++) {
            // Check stop flag before each post
            if (this.stopFlag) {
                console.log('🛑 IMPORT [INDIVIDUAL METHOD]: Stopped by user');
                liveLog.stop('import', `🛑 Stopped during post engagement (${i}/${postUrls.length} done)`);
                break;
            }
            const url = postUrls[i];
            console.log(`📱 IMPORT [INDIVIDUAL METHOD]: === Post ${i + 1}/${postUrls.length} === ${url}`);
            liveLog.info('import', `📄 Processing post ${i + 1}/${postUrls.length}`, { postUrl: url });

            // Delay between posts (not before first)
            if (i > 0 && delays.beforeOpeningPostsDelay > 0) {
                const delaySec = Math.round(delays.beforeOpeningPostsDelay / 1000);
                console.log(`⏱️ IMPORT [INDIVIDUAL METHOD]: Before-opening delay: ${delays.beforeOpeningPostsDelay}ms`);
                liveLog.delay('import', delaySec, 'before opening next post');
                await new Promise(r => setTimeout(r, delays.beforeOpeningPostsDelay));
            }

            try {
                const res = await this.engageSinglePostUrl(url, actions, randomMode, commentSettings, delays);
                totalLikes += res.likes || 0;
                totalComments += res.comments || 0;
                totalShares += res.shares || 0;
                totalFollows += res.follows || 0;
                if (res.postDetails?.length) allPostDetails.push(...res.postDetails);
                console.log(`📱 IMPORT [INDIVIDUAL METHOD]: Post ${i + 1} done: L=${res.likes} C=${res.comments} S=${res.shares} F=${res.follows}`);
            } catch (e) {
                console.error(`📱 IMPORT [INDIVIDUAL METHOD]: Post ${i + 1} failed:`, e?.message || e);
            }
        }

        console.log(`📱 IMPORT [INDIVIDUAL METHOD]: All posts done. Total: L=${totalLikes} C=${totalComments} S=${totalShares} F=${totalFollows}`);
        liveLog.info('import', `✅ All ${postUrls.length} posts processed — L:${totalLikes} C:${totalComments} S:${totalShares} F:${totalFollows}`);
        return { likes: totalLikes, comments: totalComments, shares: totalShares, follows: totalFollows, postDetails: allPostDetails };
    }

    async waitForLinkedInReady(tabId, timeoutMs = 25000) {
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
            try {
                const [res] = await chrome.scripting.executeScript({
                    target: { tabId },
                    func: () => {
                        const ready = document.readyState;
                        const hasMain = !!document.querySelector('main');
                        const hasArticle = document.querySelectorAll('article').length > 0;
                        const hasFeed = hasMain || hasArticle || !!document.querySelector('[data-urn]');
                        return { ready, hasFeed, articles: document.querySelectorAll('article').length };
                    }
                });
                const info = res?.result;
                if (info && info.ready === 'complete' && info.hasFeed) return true;
            } catch (e) {
                console.warn('IMPORT: waitForLinkedInReady error', e?.message || e);
            }
            await new Promise(r => setTimeout(r, 800));
        }
        console.warn('IMPORT: LinkedIn page not fully ready after timeout, proceeding');
        return false;
    }

    async ensureLinkedInPosts(tabId, maxAttempts = 12) {
        for (let i = 0; i < maxAttempts; i++) {
            try {
                const [res] = await chrome.scripting.executeScript({
                    target: { tabId },
                    func: () => {
                        // Scroll aggressively to force feed rendering
                        window.scrollBy(0, 1600);
                        window.scrollTo(0, document.body.scrollHeight * 0.9);
                        const urnNodes = Array.from(document.querySelectorAll('[data-urn]')).filter((el) => {
                            const urn = el.getAttribute('data-urn') || '';
                            return urn.includes('urn:li:activity:') || urn.includes('urn:li:ugcPost:') || urn.includes('urn:li:share:');
                        });
                        const hasFeed = urnNodes.length > 0;
                        return { count: urnNodes.length, hasFeed };
                    }
                });
                const info = res?.result;
                if (info?.hasFeed && info.count > 0) {
                    console.log(`IMPORT: Found ${info.count} URN posts after scroll attempt ${i + 1}`);
                    return true;
                }
            } catch (e) {
                console.warn('IMPORT: ensureLinkedInPosts error', e?.message || e);
            }
            await new Promise(r => setTimeout(r, 2000));
        }
        console.warn('IMPORT: No URN posts detected after retries; continuing anyway');
        return false;
    }
    
    /**
     * Track import profile usage (send to backend API)
     */
    async trackImportCredit() {
        try {
            // Get auth token from storage (using both localStorage and chrome.storage)
            let authToken = null;
            
            // First try chrome.storage.local (where it should be stored)
            const result = await chrome.storage.local.get(['authToken']);
            if (result.authToken) {
                authToken = result.authToken;
            } else {
                // Fallback to sync storage
                const syncResult = await chrome.storage.sync.get(['authToken']);
                authToken = syncResult.authToken;
            }
            
            if (!authToken) {
                console.warn('⚠️ IMPORT: No auth token found in storage, skipping credit tracking');
                return;
            }

            const response = await fetch('https://kommentify.com/api/usage/track', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    actionType: 'importProfile'
                })
            });

            const data = await response.json();
            if (!data.success) {
                console.warn('⚠️ IMPORT: Failed to track credit:', data.error);
            } else {
                console.log('✅ IMPORT: Credit tracked, remaining:', data.usage.importProfiles);
            }
        } catch (error) {
            console.error('❌ IMPORT: Credit tracking error:', error);
        }
    }
    
    /**
     * Send progress update to popup (for live UI updates)
     * Also saves to storage so popup can sync when opened
     */
    async sendProgressToPopup(data) {
        try {
            console.log('📤 IMPORT: Sending progress to popup:', data.type, data.profileUrl || '');
            
            // ALWAYS save to storage first (for when popup is closed)
            await this.saveProgressToStorage(data);
            
            // Try to send message to popup (may fail if closed)
            await chrome.runtime.sendMessage({
                action: 'importProgress',
                ...data
            });
            console.log('✅ IMPORT: Progress sent to popup');
        } catch (error) {
            console.log('⚠️ IMPORT: Popup not open, progress saved to storage for sync');
            // Popup might be closed, but progress is saved to storage
        }
    }
    
    /**
     * Save progress to storage so popup can sync when opened
     */
    async saveProgressToStorage(data) {
        try {
            const { type, profileUrl, profileName, current, total, result } = data;
            
            // Save current progress state
            await chrome.storage.local.set({
                importProgressState: {
                    current: current || 0,
                    total: total || 0,
                    lastUpdate: Date.now()
                }
            });
            
            // If profile completed successfully, remove from pending profiles
            if (type === 'profileComplete' && result?.success && profileUrl) {
                console.log('💾 IMPORT BG: Removing completed profile from storage:', profileUrl);
                const { pendingImportProfiles = [] } = await chrome.storage.local.get('pendingImportProfiles');
                
                // Normalize URL for comparison
                const normalizeUrl = (url) => url?.replace(/\/$/, '').toLowerCase().trim();
                const normalizedTarget = normalizeUrl(profileUrl);
                
                const updatedProfiles = pendingImportProfiles.filter(url => {
                    const normalizedUrl = normalizeUrl(url);
                    return normalizedUrl !== normalizedTarget && 
                           !normalizedUrl.includes(normalizedTarget) && 
                           !normalizedTarget.includes(normalizedUrl);
                });
                
                await chrome.storage.local.set({ pendingImportProfiles: updatedProfiles });
                console.log('✅ IMPORT BG: Removed from storage, remaining:', updatedProfiles.length);
                
                // Also add to completed profiles list for history
                const { completedImportProfiles = [] } = await chrome.storage.local.get('completedImportProfiles');
                completedImportProfiles.push({
                    url: profileUrl,
                    name: profileName,
                    timestamp: Date.now(),
                    result: result
                });
                // Keep only last 100 completed profiles
                if (completedImportProfiles.length > 100) {
                    completedImportProfiles.shift();
                }
                await chrome.storage.local.set({ completedImportProfiles });
            }
            
            // If automation complete, clear progress state
            if (type === 'complete') {
                await chrome.storage.local.set({
                    importProgressState: null,
                    importAutomationActive: false
                });
            }
            
            // If automation started, mark as active
            if (type === 'start') {
                await chrome.storage.local.set({
                    importAutomationActive: true
                });
            }
        } catch (error) {
            console.error('❌ IMPORT BG: Failed to save progress to storage:', error);
        }
    }

    /**
     * Broadcast status update to the active LinkedIn tab
     */
    async broadcastStatus(message, type = 'info', showStopButton = true) {
        if (!this.activeTabId) return;
        
        try {
            await chrome.scripting.executeScript({
                target: { tabId: this.activeTabId },
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
                args: [message, type, showStopButton, 'ImportAutomation']
            });
        } catch (error) {
            // Tab might be closed
        }
    }

    /**
     * Process bulk connection requests
     */
    async processConnectionRequests(profiles, options = {}) {
        if (this.isProcessing) {
            throw new Error('Import automation is already running');
        }

        this.isProcessing = true;
        this.currentOperation = 'connection_requests';
        this.stopFlag = false;

        const results = {
            successful: 0,
            failed: 0,
            leads: [],
            errors: []
        };

        console.log(`🤝 IMPORT: Starting connection requests for ${profiles.length} profiles`);
        await this.broadcastStatus(`🤝 Starting: ${profiles.length} profiles`, 'info');
        liveLog.start('import', `🤝 Import started — ${profiles.length} profiles`);
        
        // Send start progress to popup
        await this.sendProgressToPopup({ type: 'start', total: profiles.length, current: 0 });

        // Apply import start delay from limits settings
        const { delaySettings } = await chrome.storage.local.get('delaySettings');
        const importStartDelay = (delaySettings && delaySettings.importStartDelay) || 0;
        if (importStartDelay > 0) {
            console.log(`⏰ IMPORT DELAY: Waiting ${importStartDelay}s before starting import...`);
            await new Promise(resolve => setTimeout(resolve, importStartDelay * 1000));
        }

        // Get connection request delay settings from limits
        const networkingMinDelay = (delaySettings && delaySettings.networkingMinDelay) || 20;
        const networkingMaxDelay = (delaySettings && delaySettings.networkingMaxDelay) || 45;

        try {
            for (let i = 0; i < profiles.length; i++) {
                // Check stop flag
                if (this.stopFlag) {
                    console.log('🛑 IMPORT: Stopped by user');
                    await this.broadcastStatus(`🛑 Stopped. ${results.successful} connected`, 'warning', false);
                    break;
                }
                
                const profile = profiles[i];
                const profileName = this.extractNameFromUrl(profile);
                console.log(`🔗 IMPORT: Processing profile ${i + 1}/${profiles.length}: ${profile}`);
                await this.broadcastStatus(`📤 Connecting: ${profileName} (${i + 1}/${profiles.length})`, 'info');
                
                // Send profile start to popup
                await this.sendProgressToPopup({
                    type: 'profileStart',
                    profileUrl: profile,
                    profileName,
                    current: i + 1,
                    total: profiles.length
                });

                try {
                    // Extract contact info if requested
                    let contactInfo = { email: null, phone: null };
                    if (options.extractContactInfo) {
                        const contactUrl = profile.endsWith('/') 
                            ? profile + 'overlay/contact-info/' 
                            : profile + '/overlay/contact-info/';
                        
                        console.log('📧 IMPORT: Extracting contact info from:', contactUrl);
                        contactInfo = await this.extractContactInfo(contactUrl);
                        console.log('📧 IMPORT: Contact info result:', contactInfo);
                    }

                    // Send connection request
                    const connectionResult = await this.sendConnectionRequest(profile);
                    
                    if (connectionResult.success) {
                        results.successful++;
                        this.activeTabId = connectionResult.tabId; // Set for status broadcasts
                        
                        // Create lead record
                        const lead = {
                            id: `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                            profileUrl: profile,
                            name: profileName,
                            email: contactInfo.email,
                            phone: contactInfo.phone,
                            source: 'import_automation',
                            connectionStatus: 'pending',
                            collectedAt: new Date().toISOString()
                        };
                        
                        results.leads.push(lead);
                        await this.saveLead(lead);
                        
                        console.log(`✅ IMPORT: Connection request sent to: ${profile}`);
                        await this.broadcastStatus(`✅ Connected: ${profileName} (${results.successful}/${profiles.length})`, 'success');
                        liveLog.connect('import', `Connected: ${profileName} (${results.successful}/${profiles.length})`, { profileUrl: profile });
                        
                        // Track import credit usage
                        await this.trackImportCredit();
                        
                        // Send profile complete to popup (success)
                        await this.sendProgressToPopup({
                            type: 'profileComplete',
                            profileUrl: profile,
                            profileName,
                            current: i + 1,
                            total: profiles.length,
                            result: { success: true, connectionSent: true }
                        });
                    } else {
                        results.failed++;
                        results.errors.push(`${profile}: ${connectionResult.error}`);
                        console.log(`❌ IMPORT: Failed to send connection to: ${profile} - ${connectionResult.error}`);
                        await this.broadcastStatus(`⚠️ Skipped: ${profileName}`, 'warning');
                        
                        // Send profile complete to popup (failed)
                        await this.sendProgressToPopup({
                            type: 'profileComplete',
                            profileUrl: profile,
                            profileName,
                            current: i + 1,
                            total: profiles.length,
                            result: { success: false, error: connectionResult.error }
                        });
                    }

                    // Apply connection request delay from limits settings with countdown
                    if (i < profiles.length - 1 && !this.stopFlag) {
                        const delaySeconds = Math.round(networkingMinDelay + Math.random() * (networkingMaxDelay - networkingMinDelay));
                        console.log(`⏳ IMPORT: Waiting ${delaySeconds}s (${networkingMinDelay}-${networkingMaxDelay}s range) before next profile...`);
                        liveLog.delay('import', delaySeconds, 'between connections');
                        
                        // Show countdown
                        for (let remaining = delaySeconds; remaining > 0; remaining -= 5) {
                            if (this.stopFlag) break;
                            await this.broadcastStatus(`⏳ Next profile in ${remaining}s...`, 'info');
                            await new Promise(resolve => setTimeout(resolve, Math.min(5000, remaining * 1000)));
                        }
                    }

                } catch (error) {
                    results.failed++;
                    results.errors.push(`${profile}: ${error.message}`);
                    console.error(`❌ IMPORT: Error processing profile ${profile}:`, error);
                }
            }

        } finally {
            this.isProcessing = false;
            this.currentOperation = null;
            console.log(`🎉 IMPORT: Connection requests completed. Success: ${results.successful}, Failed: ${results.failed}`);
            if (!this.stopFlag) {
                await this.broadcastStatus(`🎉 Complete! ${results.successful} connected`, 'success', false);
            }
            liveLog.stop('import', `✅ Import complete — ${results.successful} connected, ${results.failed} failed`);
            this.stopFlag = false;
            
            // Send complete message to popup
            await this.sendProgressToPopup({
                type: 'complete',
                total: profiles.length,
                successful: results.successful,
                failed: results.failed
            });
            
            // Save import history for ALL profiles (successful and failed)
            await this.saveImportHistory(profiles, results, options);
        }

        return results;
    }

    /**
     * Process combined automation (connection requests + post engagement)
     */
    async processCombinedAutomation(profiles, options = {}) {
        if (this.isProcessing) {
            throw new Error('Import automation is already running');
        }

        this.isProcessing = true;
        this.currentOperation = 'combined_automation';
        this.stopFlag = false;
        
        // Set active flag for processing state tracking
        await chrome.storage.local.set({ importAutomationActive: true });

        const results = {
            profilesProcessed: 0,
            connectionsSuccessful: 0,
            connectionsFailed: 0,
            totalLikes: 0,
            totalComments: 0,
            totalShares: 0,
            totalFollows: 0,
            leads: [],
            errors: [],
            profilePostDetails: {} // Store post details keyed by profile URL
        };

        const { postsPerProfile = 2, randomMode = false, actions = {}, extractContactInfo = false, sendConnections = true, engagementMethod = 'individual' } = options;

        console.log(`🚀 IMPORT: Starting combined automation for ${profiles.length} profiles`);
        console.log('🚀 IMPORT: Actions enabled:', actions);
        console.log('🔗 IMPORT: Send connections:', sendConnections ? 'ENABLED' : 'DISABLED');
        console.log('🎲 IMPORT: Random mode:', randomMode ? 'ENABLED (pick one action per post)' : 'DISABLED (all selected actions)');
        console.log('📱 IMPORT: Engagement method:', engagementMethod);
        await this.broadcastStatus(`🚀 Starting: ${profiles.length} profiles (combined)`, 'info');
        liveLog.start('import', `🚀 Import started — ${profiles.length} profiles, actions: ${Object.entries(actions).filter(([,v])=>v).map(([k])=>k).join(', ')}`);
        
        // Send start progress to popup
        await this.sendProgressToPopup({ type: 'start', total: profiles.length, current: 0 });

        // Apply import start delay from limits settings
        const { delaySettings } = await chrome.storage.local.get('delaySettings');
        const importStartDelay = (delaySettings && delaySettings.importStartDelay) || 0;
        if (importStartDelay > 0) {
            console.log(`⏰ IMPORT DELAY: Waiting ${importStartDelay}s before starting import...`);
            liveLog.delay('import', importStartDelay, 'import start delay');
            await new Promise(resolve => setTimeout(resolve, importStartDelay * 1000));
        }

        // Get comment delay settings from limits (used for combined automation between profiles)
        const commentMinDelay = (delaySettings && delaySettings.commentMinDelay) || 25;
        const commentMaxDelay = (delaySettings && delaySettings.commentMaxDelay) || 60;

        try {
            for (let i = 0; i < profiles.length; i++) {
                // Check stop flag
                if (this.stopFlag) {
                    console.log('🛑 IMPORT: Stopped by user');
                    await this.broadcastStatus(`🛑 Stopped. ${results.profilesProcessed} processed`, 'warning', false);
                    break;
                }
                
                const profile = profiles[i];
                const profileName = this.extractNameFromUrl(profile);
                console.log(`🔄 IMPORT: Processing profile ${i + 1}/${profiles.length}: ${profile}`);
                await this.broadcastStatus(`🔄 Processing: ${profileName} (${i + 1}/${profiles.length})`, 'info');
                liveLog.info('import', `👤 Processing profile ${i + 1}/${profiles.length}: ${profileName}`, { profileUrl: profile });
                
                // Send profile start to popup
                await this.sendProgressToPopup({
                    type: 'profileStart',
                    profileUrl: profile,
                    profileName,
                    current: i + 1,
                    total: profiles.length
                });

                try {
                    // Step 1: Extract contact info if requested
                    let contactInfo = { email: null, phone: null };
                    if (extractContactInfo) {
                        const contactUrl = profile.endsWith('/') 
                            ? profile + 'overlay/contact-info/' 
                            : profile + '/overlay/contact-info/';
                        
                        console.log('📧 IMPORT: Extracting contact info from:', contactUrl);
                        contactInfo = await this.extractContactInfo(contactUrl);
                        console.log('📧 IMPORT: Contact info result:', contactInfo);
                    }

                    // Step 2: Send connection request (if enabled)
                    let connectionResult = { success: false, skipped: true };
                    if (sendConnections) {
                        console.log('🤝 IMPORT: Sending connection request...');
                        liveLog.info('import', `🤝 Sending connection request to ${profileName}...`);
                        connectionResult = await this.sendConnectionRequest(profile);
                        this.activeTabId = connectionResult.tabId;
                        
                        if (connectionResult.success) {
                            results.connectionsSuccessful++;
                            liveLog.connect('import', `✅ Connection sent to ${profileName}`, { profileUrl: profile });
                            
                            // Create lead record
                            const lead = {
                                id: `combined_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                                profileUrl: profile,
                                name: this.extractNameFromUrl(profile),
                                email: contactInfo.email,
                                phone: contactInfo.phone,
                                source: 'combined_automation',
                                connectionStatus: 'pending',
                                collectedAt: new Date().toISOString()
                            };
                            
                            results.leads.push(lead);
                            await this.saveLead(lead);
                            
                            console.log(`✅ IMPORT: Connection request sent to: ${profile}`);
                        } else {
                            results.connectionsFailed++;
                            console.log(`❌ IMPORT: Failed to send connection to: ${profile} - ${connectionResult.error}`);
                            liveLog.error('import', `❌ Connection failed: ${profileName} — ${connectionResult.error}`);
                        }
                    } else {
                        console.log('⏭️ IMPORT: Skipping connection request (disabled by user)');
                    }

                    // Step 3: Engage with posts
                    console.log('❤️ IMPORT: Starting post engagement...');
                    liveLog.info('import', `❤️ Starting post engagement for ${profileName} (${postsPerProfile} posts)`);
                    const activityUrl = profile.replace(/\/$/, '') + '/recent-activity/all/';
                    
                    const engagementResult = await this.engageWithProfilePosts(activityUrl, postsPerProfile, actions, randomMode, engagementMethod);
                    
                    results.totalLikes += engagementResult.likes || 0;
                    results.totalComments += engagementResult.comments || 0;
                    results.totalShares += engagementResult.shares || 0;
                    results.totalFollows += engagementResult.follows || 0;
                    
                    // Store post details for this profile
                    if (engagementResult.postDetails && engagementResult.postDetails.length > 0) {
                        results.profilePostDetails[profile] = engagementResult.postDetails;
                        console.log(`📝 IMPORT: Stored ${engagementResult.postDetails.length} post details for: ${profileName}`);
                    }

                    results.profilesProcessed++;
                    console.log(`✅ IMPORT: Combined automation completed for: ${profile}`, {
                        connection: connectionResult.skipped ? 'skipped' : connectionResult.success,
                        engagement: engagementResult
                    });
                    await this.broadcastStatus(`✅ Completed: ${profileName} (${results.profilesProcessed}/${profiles.length})`, 'success');
                    liveLog.info('import', `✅ Profile done: ${profileName} (${results.profilesProcessed}/${profiles.length}) — L:${engagementResult.likes||0} C:${engagementResult.comments||0} S:${engagementResult.shares||0}`);
                    
                    // Send profile complete to popup (success)
                    await this.sendProgressToPopup({
                        type: 'profileComplete',
                        profileUrl: profile,
                        profileName,
                        current: i + 1,
                        total: profiles.length,
                        result: {
                            success: true,
                            connectionSent: connectionResult.success && !connectionResult.skipped,
                            likes: engagementResult.likes || 0,
                            comments: engagementResult.comments || 0,
                            shares: engagementResult.shares || 0,
                            follows: engagementResult.follows || 0
                        }
                    });
                    
                    // RECORD STATISTICS FOR COMBINED AUTOMATION
                    try {
                        // Record connection if sent
                        if (connectionResult.success && !connectionResult.skipped) {
                            await backgroundStatistics.recordConnectionRequest(profileName, lead?.headline || '');
                        }
                        // Record likes
                        for (let j = 0; j < (engagementResult.likes || 0); j++) {
                            await backgroundStatistics.recordLike(`import-combined-${profile}-${Date.now()}`);
                        }
                        // Record comments
                        for (let j = 0; j < (engagementResult.comments || 0); j++) {
                            const postDetail = engagementResult.postDetails?.[j] || {};
                            await backgroundStatistics.recordComment(
                                `import-combined-${profile}-${Date.now()}`,
                                postDetail.generatedComment || 'AI comment',
                                postDetail.postContent || '',
                                postDetail.authorName || profileName
                            );
                        }
                        // Record shares
                        for (let j = 0; j < (engagementResult.shares || 0); j++) {
                            await backgroundStatistics.recordShare(`import-combined-${profile}-${Date.now()}`);
                        }
                        // Record follows
                        for (let j = 0; j < (engagementResult.follows || 0); j++) {
                            await backgroundStatistics.recordFollow(profileName);
                        }
                        console.log(`📊 IMPORT: Statistics recorded for combined automation on ${profile}`);
                    } catch (statError) {
                        console.warn(`⚠️ IMPORT: Failed to record statistics:`, statError.message);
                    }
                    
                    // Track import credit usage
                    await this.trackImportCredit();

                    // Apply comment delay from limits settings with countdown
                    if (i < profiles.length - 1 && !this.stopFlag) {
                        const delaySeconds = Math.round(commentMinDelay + Math.random() * (commentMaxDelay - commentMinDelay));
                        console.log(`⏳ IMPORT: Waiting ${delaySeconds}s (${commentMinDelay}-${commentMaxDelay}s range) before next profile...`);
                        liveLog.delay('import', delaySeconds, 'between profiles');
                        
                        for (let remaining = delaySeconds; remaining > 0; remaining -= 5) {
                            if (this.stopFlag) break;
                            await this.broadcastStatus(`⏳ Next profile in ${remaining}s...`, 'info');
                            await new Promise(resolve => setTimeout(resolve, Math.min(5000, remaining * 1000)));
                        }
                    }

                } catch (error) {
                    results.errors.push(`${profile}: ${error.message}`);
                    console.error(`❌ IMPORT: Error processing profile ${profile}:`, error);
                    liveLog.error('import', `❌ Error on ${this.extractNameFromUrl(profile)}: ${error.message}`);
                }
            }

        } finally {
            this.isProcessing = false;
            this.currentOperation = null;
            this.stopFlag = false;
            
            // Clear active flag for processing state tracking
            await chrome.storage.local.set({ importAutomationActive: false });
            
            console.log(`🎉 IMPORT: Combined automation completed:`, results);
            await this.broadcastStatus(`🎉 Complete! ${results.profilesProcessed} processed`, 'success', false);
            liveLog.info('import', `🎉 Import complete — ${results.profilesProcessed} profiles, L:${results.totalLikes} C:${results.totalComments} S:${results.totalShares}`, 'success');
            
            // Send complete message to popup
            await this.sendProgressToPopup({
                type: 'complete',
                total: profiles.length,
                successful: results.profilesProcessed,
                failed: results.errors.length
            });
            
            // Save import history with post details
            await this.saveImportHistory(profiles, results, options);
        }

        return results;
    }

    /**
     * Process bulk post engagement
     */
    async processPostEngagement(profiles, options = {}) {
        if (this.isProcessing) {
            throw new Error('Import automation is already running');
        }

        this.isProcessing = true;
        this.currentOperation = 'post_engagement';
        this.stopFlag = false;
        
        // Set active flag for processing state tracking
        await chrome.storage.local.set({ importAutomationActive: true });

        const results = {
            profilesProcessed: 0,
            totalLikes: 0,
            totalComments: 0,
            totalShares: 0,
            totalFollows: 0,
            errors: []
        };

        const { postsPerProfile = 2, randomMode = false, actions = {}, engagementMethod = 'individual' } = options;

        console.log(`❤️ IMPORT: Starting post engagement for ${profiles.length} profiles`);
        console.log('❤️ IMPORT: Actions enabled:', actions);
        console.log('🎲 IMPORT: Random mode:', randomMode ? 'ENABLED (pick one action per post)' : 'DISABLED (all selected actions)');
        console.log('📱 IMPORT: Engagement method:', engagementMethod);
        await this.broadcastStatus(`❤️ Starting: ${profiles.length} profiles (engagement)`, 'info');

        // Apply import start delay from limits settings
        const { delaySettings } = await chrome.storage.local.get('delaySettings');
        const importStartDelay = (delaySettings && delaySettings.importStartDelay) || 0;
        if (importStartDelay > 0) {
            console.log(`⏰ IMPORT DELAY: Waiting ${importStartDelay}s before starting import...`);
            await new Promise(resolve => setTimeout(resolve, importStartDelay * 1000));
        }

        // Get comment delay settings from limits (used for engagement between profiles)
        const commentMinDelay = (delaySettings && delaySettings.commentMinDelay) || 60;
        const commentMaxDelay = (delaySettings && delaySettings.commentMaxDelay) || 180;

        try {
            for (let i = 0; i < profiles.length; i++) {
                // Check stop flag
                if (this.stopFlag) {
                    console.log('🛑 IMPORT: Stopped by user');
                    await this.broadcastStatus(`🛑 Stopped. ${results.profilesProcessed} processed`, 'warning', false);
                    break;
                }
                
                const profile = profiles[i];
                const profileName = this.extractNameFromUrl(profile);
                console.log(`📱 IMPORT: Processing profile ${i + 1}/${profiles.length}: ${profile}`);
                await this.broadcastStatus(`❤️ Engaging: ${profileName} (${i + 1}/${profiles.length})`, 'info');

                try {
                    // Convert to recent activity URL
                    const activityUrl = profile.replace(/\/$/, '') + '/recent-activity/all/';
                    
                    const engagementResult = await this.engageWithProfilePosts(activityUrl, postsPerProfile, actions, randomMode, engagementMethod);
                    
                    results.profilesProcessed++;
                    results.totalLikes += engagementResult.likes || 0;
                    results.totalComments += engagementResult.comments || 0;
                    results.totalShares += engagementResult.shares || 0;
                    results.totalFollows += engagementResult.follows || 0;

                    console.log(`✅ IMPORT: Engagement completed for: ${profile}`, engagementResult);
                    await this.broadcastStatus(`✅ Engaged: ${profileName} (${results.profilesProcessed}/${profiles.length})`, 'success');
                    
                    // RECORD STATISTICS FOR EACH ACTION
                    try {
                        // Record likes
                        for (let i = 0; i < (engagementResult.likes || 0); i++) {
                            await backgroundStatistics.recordLike(`import-${profile}-${Date.now()}`);
                        }
                        // Record comments
                        for (let i = 0; i < (engagementResult.comments || 0); i++) {
                            const postDetail = engagementResult.postDetails?.[i] || {};
                            await backgroundStatistics.recordComment(
                                `import-${profile}-${Date.now()}`,
                                postDetail.generatedComment || 'AI comment',
                                postDetail.postContent || '',
                                postDetail.authorName || profileName
                            );
                        }
                        // Record shares
                        for (let i = 0; i < (engagementResult.shares || 0); i++) {
                            await backgroundStatistics.recordShare(`import-${profile}-${Date.now()}`);
                        }
                        // Record follows
                        for (let i = 0; i < (engagementResult.follows || 0); i++) {
                            await backgroundStatistics.recordFollow(profileName);
                        }
                        console.log(`📊 IMPORT: Statistics recorded for ${profile}`);
                    } catch (statError) {
                        console.warn(`⚠️ IMPORT: Failed to record statistics:`, statError.message);
                    }
                    
                    // Track import credit usage
                    await this.trackImportCredit();

                    // Apply comment delay from limits settings with countdown
                    if (i < profiles.length - 1 && !this.stopFlag) {
                        const delaySeconds = Math.round(commentMinDelay + Math.random() * (commentMaxDelay - commentMinDelay));
                        console.log(`⏳ IMPORT: Waiting ${delaySeconds}s (${commentMinDelay}-${commentMaxDelay}s range) before next profile...`);
                        
                        for (let remaining = delaySeconds; remaining > 0; remaining -= 5) {
                            if (this.stopFlag) break;
                            await this.broadcastStatus(`⏳ Next profile in ${remaining}s...`, 'info');
                            await new Promise(resolve => setTimeout(resolve, Math.min(5000, remaining * 1000)));
                        }
                    }

                } catch (error) {
                    results.errors.push(`${profile}: ${error.message}`);
                    console.error(`❌ IMPORT: Error engaging with profile ${profile}:`, error);
                }
            }

        } finally {
            this.isProcessing = false;
            this.currentOperation = null;
            this.stopFlag = false;
            
            // Clear active flag for processing state tracking
            await chrome.storage.local.set({ importAutomationActive: false });
            
            console.log(`🎉 IMPORT: Post engagement completed:`, results);
            await this.broadcastStatus(`🎉 Complete! ${results.profilesProcessed} engaged`, 'success', false);
            
            // Save import history for post engagement
            await this.savePostEngagementHistory(profiles, results, options);
        }

        return results;
    }

    /**
     * Send connection request to profile
     */
    async sendConnectionRequest(profileUrl) {
        try {
            console.log(`🔗 IMPORT: Sending connection request to: ${profileUrl}`);
            
            // Extract vanity name from profile URL
            const vanityMatch = profileUrl.match(/\/in\/([^\/]+)/);
            if (!vanityMatch) {
                throw new Error('Invalid LinkedIn profile URL');
            }
            const vanityName = vanityMatch[1];
            
            // Open direct invitation URL
            const inviteUrl = `https://www.linkedin.com/preload/custom-invite/?vanityName=${vanityName}`;
            console.log(`🔗 IMPORT: Opening direct invite URL: ${inviteUrl}`);
            
            // Open invite URL in active tab so LinkedIn content fully loads in foreground
            const tabId = await browser.openTab(inviteUrl, true);
            if (!tabId) {
                throw new Error('Failed to open invite tab');
            }

            // Wait for page load - invitation modal loads faster
            console.log('⏳ IMPORT: Waiting for invitation modal to load...');
            await this.waitForLinkedInReady(tabId, 20000);

            const result = await chrome.scripting.executeScript({
                target: { tabId },
                func: () => {
                    try {
                        console.log('🔗 SCRIPT: Looking for send invitation button...');
                        
                        // Direct invitation page - look for send buttons
                        const sendBtnSelectors = [
                            'button[aria-label="Send without a note"]',
                            'button[aria-label="Send invitation"]',
                            'button[data-control-name="invite"]'
                        ];
                        
                        let sendBtn = null;
                        for (const selector of sendBtnSelectors) {
                            sendBtn = document.querySelector(selector);
                            if (sendBtn) {
                                console.log(`🔗 SCRIPT: Found send button with selector: ${selector}`);
                                break;
                            }
                        }
                        
                        // Fallback: search by button text
                        if (!sendBtn) {
                            const allButtons = document.querySelectorAll('button');
                            for (const btn of allButtons) {
                                const text = btn.textContent?.trim().toLowerCase();
                                if (text.includes('send without') || text.includes('send invitation')) {
                                    sendBtn = btn;
                                    console.log(`🔗 SCRIPT: Found send button by text: ${text}`);
                                    break;
                                }
                            }
                        }

                        if (!sendBtn) {
                            console.log('🔗 SCRIPT: Send button not found');
                            return { success: false, error: 'Send button not found' };
                        }

                        console.log('🔗 SCRIPT: Clicking send button...');
                        sendBtn.click();
                        
                        console.log('🔗 SCRIPT: Connection request sent successfully');
                        return { success: true };

                    } catch (error) {
                        console.error('🔗 SCRIPT: Error sending connection:', error);
                        return { success: false, error: error.message };
                    }
                }
            });

            // Wait 7 seconds before closing tab to allow connection request to process
            console.log('⏳ IMPORT: Waiting 7 seconds before closing tab...');
            await new Promise(resolve => setTimeout(resolve, 7000));
            
            // Close tab
            await chrome.tabs.remove(tabId);

            return result[0]?.result || { success: false, error: 'No result returned' };

        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Engage with posts from a profile's activity page
     * @param {string} engagementMethod - 'individual' (default, opens each post URL) or 'activity' (engages on activity page)
     */
    async engageWithProfilePosts(activityUrl, postsCount, actions, randomMode = false, engagementMethod = 'individual') {
        try {
            console.log(`📱 IMPORT: Engagement method: ${engagementMethod}`);
            console.log(`📱 IMPORT: Activity URL: ${activityUrl}`);
            console.log(`📱 IMPORT: Posts to process: ${postsCount}, Random mode: ${randomMode}`);

            // Load delay settings
            const { delaySettings = {}, randomIntervalSettings = {} } = await chrome.storage.local.get(['delaySettings', 'randomIntervalSettings']);
            const delays = {
                baseDelay: (delaySettings.baseDelay || 0) * 1000,
                randomMin: (randomIntervalSettings?.minInterval || 0) * 1000,
                randomMax: (randomIntervalSettings?.maxInterval || 0) * 1000,
                beforeOpeningPostsDelay: (delaySettings.beforeOpeningPostsDelay || 0) * 1000,
                postPageLoadDelay: (delaySettings.postPageLoadDelay || 0) * 1000,
                beforeLikeDelay: (delaySettings.beforeLikeDelay || 0) * 1000,
                beforeCommentDelay: (delaySettings.beforeCommentDelay || 0) * 1000,
                beforeShareDelay: (delaySettings.beforeShareDelay || 0) * 1000,
                beforeFollowDelay: (delaySettings.beforeFollowDelay || 0) * 1000,
                taskInitDelay: (delaySettings.taskInitDelay || 0) * 1000
            };
            console.log('⚙️ IMPORT DELAYS LOADED (ms):', JSON.stringify(delays, null, 2));

            // Load comment settings
            const storage = await chrome.storage.local.get(['authToken', 'apiBaseUrl', 'commentSettings']);
            const commentSettings = storage.commentSettings || {
                goal: 'AddValue',
                tone: 'Friendly',
                commentLength: 'Short',
                userExpertise: '',
                userBackground: ''
            };

            // === INDIVIDUAL METHOD (default — most reliable) ===
            if (engagementMethod === 'individual') {
                console.log('📱 IMPORT: Using INDIVIDUAL method (open each post URL separately)');
                return await this.engagePostsIndividualMethod(activityUrl, postsCount, actions, randomMode, commentSettings, delays);
            }

            // === ACTIVITY METHOD (engage directly on activity page) ===
            console.log('📱 IMPORT: Using ACTIVITY method (engage on activity page)');
            console.log(`📱 IMPORT: Opening activity page: ${activityUrl}`);
            
            // Open activity page in active tab to ensure feed loads properly
            const tabId = await browser.openTab(activityUrl, true);
            if (!tabId) {
                throw new Error('Failed to open activity tab');
            }

            // Wait for page load - longer wait for proper rendering
            console.log('📱 IMPORT: Waiting for page to fully load...');
            await this.waitForLinkedInReady(tabId, 25000);

            // Extra safeguard: scroll to ensure posts render before executing actions
            await this.ensureLinkedInPosts(tabId, 5);

            // Get profile name from URL for fallback
            const profileMatch = activityUrl.match(/linkedin\.com\/in\/([^\/]+)/);
            const profileSlug = profileMatch ? profileMatch[1].replace(/-/g, ' ') : '';

            console.log('📱 IMPORT: Executing script in tab...');

            let result;
            try {
                result = await chrome.scripting.executeScript({
                    target: { tabId },
                    // Use ISOLATED world so we can use chrome.runtime.sendMessage
                    func: async (postsCount, actions, randomMode, commentSettings, profileSlug, delays) => {
                    return new Promise(async (resolve) => {
                        try {
                            console.log('📱 SCRIPT: Import automation script started');

                            // Normalize action keys because different callers use both singular and plural
                            const normalizedActions = {
                                likes: !!(actions?.likes ?? actions?.like),
                                comments: !!(actions?.comments ?? actions?.comment),
                                shares: !!(actions?.shares ?? actions?.share),
                                follows: !!(actions?.follows ?? actions?.follow)
                            };
                            console.log('📱 SCRIPT: Normalized actions:', normalizedActions);
                            
                            let likes = 0;
                            let comments = 0;
                            let shares = 0;
                            let follows = 0;
                            let postDetails = []; // Collect details for each post processed
                            let totalLinksFound = 0;

                            // Helper function to get author name (same logic as feedScraper.js)
                            const getAuthorName = (container) => {
                                console.log('🔍 SCRIPT: Extracting author name...');
                                
                                // STRATEGY 1: aria-label patterns (Most Reliable)
                                const potentialLinks = container.querySelectorAll('a[aria-label]');
                                for (const link of potentialLinks) {
                                    const rawLabel = link.getAttribute('aria-label');
                                    if (!rawLabel) continue;

                                    const patterns = [
                                        /^View\s+(.+?)['']s\s+profile/i,
                                        /^View\s+(.+?)['']s/i,
                                        /^(.+?)['']s\s+profile/i,
                                        /^View\s+profile\s+for\s+(.+)/i,
                                        /^(.+?)\s+\-\s+View\s+profile/i
                                    ];

                                    for (const pattern of patterns) {
                                        const nameMatch = rawLabel.match(pattern);
                                        if (nameMatch && nameMatch[1]) {
                                            const name = nameMatch[1].trim();
                                            const invalidTerms = ['comment', 'view', 'profile', 'linkedin', 'activity', 'post'];
                                            const isValid = name.length > 1 && 
                                                          !invalidTerms.some(term => name.toLowerCase().includes(term));
                                            if (isValid) {
                                                console.log(`✅ SCRIPT: Author found (aria-label): "${name.split(' ')[0]}"`);
                                                return name.split(' ')[0];
                                            }
                                        }
                                    }
                                }

                                // STRATEGY 2: Direct selectors
                                const directSelectors = [
                                    '.update-components-actor__name span[aria-hidden="true"]',
                                    '.update-components-actor__title',
                                    '.feed-shared-actor__name',
                                    '.feed-shared-actor__title',
                                    'div.update-components-actor__meta a span span:nth-child(1) span span:nth-child(1)'
                                ];

                                for (const selector of directSelectors) {
                                    const element = container.querySelector(selector);
                                    if (element) {
                                        const text = element.textContent?.trim();
                                        if (text && text.length > 1 && !text.includes('\n')) {
                                            console.log(`✅ SCRIPT: Author found (selector): "${text.split(' ')[0]}"`);
                                            return text.split(' ')[0];
                                        }
                                    }
                                }

                                // STRATEGY 3: Relationship-based
                                const actorContainers = container.querySelectorAll('[class*="actor"], [class*="author"]');
                                for (const actorContainer of actorContainers) {
                                    const spans = actorContainer.querySelectorAll('span[aria-hidden="true"]');
                                    for (const span of spans) {
                                        const text = span.textContent?.trim();
                                        if (text && text.length >= 2 && text.length < 50 && 
                                            !text.includes('\n') && /^[A-Z]/.test(text)) {
                                            console.log(`✅ SCRIPT: Author found (relationship): "${text.split(' ')[0]}"`);
                                            return text.split(' ')[0];
                                        }
                                    }
                                }

                                // Fallback to profile slug
                                if (profileSlug) {
                                    const name = profileSlug.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                                    console.log(`⚠️ SCRIPT: Using profile slug as fallback: "${name}"`);
                                    return name.split(' ')[0];
                                }

                                return 'there';
                            };

                            // Helper function to get post text (same logic as feedScraper.js)
                            const getPostText = (container) => {
                                const textElement = container.querySelector('.update-components-text');
                                if (textElement) {
                                    const text = textElement.innerText.trim();
                                    console.log(`✅ SCRIPT: Post text found: "${text.substring(0, 50)}..."`);
                                    return text.substring(0, 500);
                                }
                                
                                // Fallback selectors
                                const fallbackSelectors = [
                                    '.feed-shared-update-v2__description',
                                    '.feed-shared-text',
                                    '.feed-shared-inline-show-more-text',
                                    'span.break-words'
                                ];
                                
                                for (const selector of fallbackSelectors) {
                                    const el = container.querySelector(selector);
                                    if (el && el.innerText.trim().length > 10) {
                                        console.log(`✅ SCRIPT: Post text found (fallback): "${el.innerText.trim().substring(0, 50)}..."`);
                                        return el.innerText.trim().substring(0, 500);
                                    }
                                }
                                
                                return 'Interesting professional content shared on LinkedIn';
                            };

                            // Wait a bit more for dynamic content
                            const jitter = async (ms = 0, label = 'generic') => {
                                const { randomMin = 0, randomMax = 0, baseDelay = 0 } = delays || {};
                                const extra = randomMax > 0 ? Math.floor(Math.random() * (randomMax - randomMin + 1)) + randomMin : 0;
                                const total = ms + baseDelay + extra;
                                console.log(`⏱️ DELAY [${label}]: action=${ms}ms + base=${baseDelay}ms + jitter=${extra}ms = TOTAL ${total}ms (${(total/1000).toFixed(1)}s)`);
                                if (total > 0) await new Promise(r => setTimeout(r, total));
                                console.log(`✅ DELAY [${label}]: Done waiting ${total}ms`);
                            };

                            await jitter(delays.postPageLoadDelay || 2000, 'postPageLoad');
                            
                            // Brute-force URN scan (exact provided logic)
                            const extractLinkedInPosts = () => {
                                const allElements = document.getElementsByTagName('*');
                                const postLinks = new Set();
                                for (let i = 0; i < allElements.length; i++) {
                                    const element = allElements[i];
                                    if (element.hasAttribute('data-urn')) {
                                        const urn = element.getAttribute('data-urn') || '';
                                        if (urn.includes('urn:li:activity:') || urn.includes('urn:li:ugcPost:') || urn.includes('urn:li:share:')) {
                                            postLinks.add(`https://www.linkedin.com/feed/update/${urn}`);
                                        }
                                    }
                                }
                                return Array.from(postLinks);
                            };

                            const collectUrnNodes = () => {
                                const urnNodes = Array.from(document.querySelectorAll('[data-urn]'));
                                const seen = new Set();
                                const items = [];
                                for (const node of urnNodes) {
                                    const urn = (node.getAttribute('data-urn') || '').match(/urn:li:(activity|ugcPost|share):\d+/)?.[0];
                                    if (!urn || seen.has(urn)) continue;
                                    seen.add(urn);
                                    items.push({ urn, element: node.closest('article') || node.closest('.feed-shared-update-v2') || node.closest('.occludable-update') || node });
                                }
                                return items;
                            };

                            // Retry with scroll and brute-force scan
                            let posts = [];
                            let urnNodesCache = [];
                            for (let attempt = 0; attempt < 8; attempt++) {
                                window.scrollBy(0, 1500);
                                window.scrollTo(0, document.body.scrollHeight * 0.9);
                                await new Promise(r => setTimeout(r, 1500));
                                const links = extractLinkedInPosts();
                                totalLinksFound = Math.max(totalLinksFound, links.length);
                                urnNodesCache = collectUrnNodes();
                                console.log(`📱 SCRIPT: Brute URN scan attempt ${attempt + 1}, found ${links.length} links, urn nodes ${urnNodesCache.length}`);
                                if (links.length > 0 || urnNodesCache.length > 0) {
                                    if (links.length > 0) {
                                        posts = links.map(url => {
                                            const urnMatch = url.match(/urn:li:(activity|ugcPost|share):\d+/);
                                            const urn = urnMatch ? urnMatch[0] : '';
                                            const fromUrnNodes = urn ? urnNodesCache.find(n => n.urn === urn) : null;
                                            const element = fromUrnNodes?.element || null;
                                            return { url, urn, element };
                                        });
                                    }
                                    if (posts.length === 0 && urnNodesCache.length > 0) {
                                        posts = urnNodesCache.map(n => ({ url: `https://www.linkedin.com/feed/update/${n.urn}`, urn: n.urn, element: n.element }));
                                    }
                                    console.log(`📱 SCRIPT: Mapped ${posts.filter(p => !!p.element).length}/${posts.length} items to post containers`);
                                    break;
                                }
                            }

                            // Second pass: wait longer and scan again (LinkedIn lazy-renders posts)
                            if (posts.length === 0) {
                                console.log('📱 SCRIPT: First pass found no mapped posts, running second pass...');
                                await new Promise(r => setTimeout(r, 3000));
                                for (let attempt = 0; attempt < 6; attempt++) {
                                    window.scrollBy(0, 1800);
                                    await new Promise(r => setTimeout(r, 1800));
                                    const links = extractLinkedInPosts();
                                    totalLinksFound = Math.max(totalLinksFound, links.length);
                                    urnNodesCache = collectUrnNodes();
                                    console.log(`📱 SCRIPT: Second-pass URN scan ${attempt + 1}, found ${links.length} links, urn nodes ${urnNodesCache.length}`);
                                    if (links.length > 0 || urnNodesCache.length > 0) {
                                        if (links.length > 0) {
                                            posts = links.map(url => {
                                                const urnMatch = url.match(/urn:li:(activity|ugcPost|share):\d+/);
                                                const urn = urnMatch ? urnMatch[0] : '';
                                                const fromUrnNodes = urn ? urnNodesCache.find(n => n.urn === urn) : null;
                                                const element = fromUrnNodes?.element || null;
                                                return { url, urn, element };
                                            });
                                        }
                                        if (posts.length === 0 && urnNodesCache.length > 0) {
                                            posts = urnNodesCache.map(n => ({ url: `https://www.linkedin.com/feed/update/${n.urn}`, urn: n.urn, element: n.element }));
                                        }
                                        console.log(`📱 SCRIPT: Second-pass mapped ${posts.filter(p => !!p.element).length}/${posts.length} items to post containers`);
                                        break;
                                    }
                                }
                            }

                            const postsToProcess = posts.slice(0, postsCount);
                            console.log(`📱 SCRIPT: Found ${posts.length} posts (brute URN), processing ${postsToProcess.length}`);
                            console.log(`🎲 SCRIPT: Random mode: ${randomMode ? 'ENABLED' : 'DISABLED'}`);

                            if (postsToProcess.length === 0) {
                                resolve({ likes: 0, comments: 0, shares: 0, follows: 0, postDetails: [], error: 'No posts found', debug: { totalLinksFound, mappedPosts: posts.length, links: posts.map(p => p.url) } });
                                return;
                            }

                            // Task initialization delay
                            if (delays.taskInitDelay > 0) {
                                await jitter(delays.taskInitDelay, 'taskInit');
                            }

                            // Follow user first (if enabled)
                            if (normalizedActions.follows) {
                                await jitter(delays.beforeFollowDelay || 0, 'beforeFollow-user');
                                const followBtn = document.querySelector('button.follow');
                                if (followBtn && !followBtn.getAttribute('data-followed')) {
                                    followBtn.click();
                                    follows++;
                                    console.log(`📱 SCRIPT: Followed user`);
                                    await jitter(1000, 'afterFollow-user');
                                }
                            }

                            // Process each post sequentially
                            async function processPostsSequentially() {
                                for (let index = 0; index < postsToProcess.length; index++) {
                                    const postItem = postsToProcess[index];
                                    let post = postItem.element;
                                    console.log(`📱 SCRIPT: Processing post ${index + 1} of ${postsToProcess.length}`);
                                    if (!post) {
                                        const fallbackSource = postItem.urn
                                            ? Array.from(document.querySelectorAll('[data-urn]')).find(el => (el.getAttribute('data-urn') || '').includes(postItem.urn))
                                            : null;
                                        post = fallbackSource ? (fallbackSource.closest('article') || fallbackSource.closest('.feed-shared-update-v2') || fallbackSource.closest('.occludable-update') || fallbackSource) : null;
                                    }
                                    if (!post) {
                                        console.warn(`📱 SCRIPT: Missing post element for index ${index + 1}, urn=${postItem.urn}`);
                                        continue;
                                    }
                                    
                                    // If random mode is enabled, pick ONE random action
                                    let postActions = normalizedActions;
                                    if (randomMode) {
                                        const availableActions = [];
                                        if (normalizedActions.likes) availableActions.push('likes');
                                        if (normalizedActions.comments) availableActions.push('comments');
                                        if (normalizedActions.shares) availableActions.push('shares');
                                        
                                        if (availableActions.length > 0) {
                                            const randomAction = availableActions[Math.floor(Math.random() * availableActions.length)];
                                            postActions = {
                                                likes: randomAction === 'likes',
                                                comments: randomAction === 'comments',
                                                shares: randomAction === 'shares',
                                                follows: normalizedActions.follows // Keep follow as-is
                                            };
                                            console.log(`🎲 SCRIPT: Random mode selected action: ${randomAction}`);
                                        }
                                    }
                                    
                                    try {
                                        // Like post
                                        if (postActions.likes) {
                                            await jitter(delays.beforeLikeDelay || 0, `beforeLike-post${index+1}`);
                                            const likeBtn = post.querySelector('button[aria-label*="React Like"], button[aria-label*="Like"], button[data-control-name="like_toggle"]');
                                            if (likeBtn && likeBtn.getAttribute('aria-pressed') !== 'true') {
                                                likeBtn.click();
                                                likes++;
                                                console.log(`📱 SCRIPT: Liked post ${index + 1}`);
                                                await jitter(1000, `afterLike-post${index+1}`);
                                            }
                                        }

                                        // Comment on post - Generate AI comment and post it
                                        if (postActions.comments) {
                                            await jitter(delays.beforeCommentDelay || 0, `beforeComment-post${index+1}`);
                                            const commentBtn = post.querySelector('button[aria-label*="Comment"], button.comment-button, button[data-control-name="comment_toggle"]');
                                            if (commentBtn) {
                                                // Click to open comment box
                                                console.log(`📱 SCRIPT: Clicking comment button for post ${index + 1}...`);
                                                commentBtn.click();
                                                await jitter(2000, `afterCommentBtnClick-post${index+1}`);
                                                
                                                // Find comment box - use data-placeholder which is most reliable
                                                let commentBox = post.querySelector('div[data-placeholder]');
                                                if (!commentBox) {
                                                    commentBox = document.querySelector('div[data-placeholder]');
                                                }
                                                if (!commentBox) {
                                                    commentBox = post.querySelector('div.ql-editor, div[contenteditable="true"]');
                                                }
                                                if (!commentBox) {
                                                    commentBox = document.querySelector('div.ql-editor, div[contenteditable="true"]');
                                                }
                                                
                                                console.log(`📱 SCRIPT: Comment box found: ${!!commentBox}`);
                                                
                                                if (commentBox) {
                                                    // Use helper functions to scrape content (same as feedScraper.js)
                                                    const postText = getPostText(post);
                                                    const authorName = getAuthorName(post);
                                                    
                                                    console.log(`📱 SCRIPT: Generating AI comment for post by "${authorName}"`);
                                                    console.log(`📱 SCRIPT: Post text: "${postText.substring(0, 100)}..."`);
                                                    
                                                    let commentText = '';
                                                    
                                                    // Generate AI comment using chrome.runtime.sendMessage (same as AI button)
                                                    try {
                                                        console.log(`📱 SCRIPT: Requesting AI comment from background...`);
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
                                                            console.log(`📱 SCRIPT: AI generated comment: ${commentText.substring(0, 50)}...`);
                                                        } else {
                                                            console.log(`📱 SCRIPT: AI response error:`, response?.error || 'No comment returned');
                                                        }
                                                    } catch (aiError) {
                                                        console.error(`📱 SCRIPT: AI comment generation failed:`, aiError);
                                                    }
                                                    
                                                    // Fallback to smart template if AI failed
                                                    if (!commentText) {
                                                        const templates = [
                                                            `Great insights, ${authorName}! Thanks for sharing this perspective.`,
                                                            `Really valuable content here. Appreciate you sharing this, ${authorName}!`,
                                                            `This resonates with me. Thanks for the thoughtful post, ${authorName}!`,
                                                            `Excellent points! Looking forward to more content like this.`,
                                                            `Well articulated thoughts. Thanks for sharing your expertise!`
                                                        ];
                                                        commentText = templates[Math.floor(Math.random() * templates.length)];
                                                        console.log(`📱 SCRIPT: Using template comment (AI fallback)`);
                                                    }
                                                    
                                                    // Capture post details for history
                                                    const postUrn = post.getAttribute('data-urn') || postItem.urn || '';
                                                    postDetails.push({
                                                        authorName: authorName,
                                                        postContent: postText,
                                                        generatedComment: commentText,
                                                        postLink: postItem.url || (postUrn ? `https://www.linkedin.com/feed/update/${postUrn}` : ''),
                                                        timestamp: Date.now()
                                                    });
                                                    
                                                    // Insert comment using different methods
                                                    commentBox.focus();
                                                    commentBox.innerHTML = `<p>${commentText}</p>`;
                                                    commentBox.dispatchEvent(new Event('input', { bubbles: true }));
                                                    commentBox.dispatchEvent(new Event('change', { bubbles: true }));
                                                    commentBox.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'a' }));
                                                    
                                                    console.log(`📱 SCRIPT: Inserted comment text, waiting for submit button...`);
                                                    await jitter(1500, `beforeCommentSubmit-post${index+1}`);
                                                    
                                                    // Find and click submit button - multiple selector options
                                                    const submitSelectors = [
                                                        'button.comments-comment-box__submit-button:not(:disabled)',
                                                        'button.comments-comment-box__submit-button--cr:not(:disabled)',
                                                        'form.comments-comment-box__form button[type="submit"]:not(:disabled)',
                                                        'button[data-control-name="add_comment"]:not(:disabled)',
                                                        '.comments-comment-box button.artdeco-button--primary:not(:disabled)',
                                                        'button.comments-comment-texteditor__submit-button:not(:disabled)'
                                                    ];
                                                    
                                                    let submitBtn = null;
                                                    for (const selector of submitSelectors) {
                                                        submitBtn = document.querySelector(selector);
                                                        if (submitBtn) {
                                                            console.log(`📱 SCRIPT: Found submit button with selector: ${selector}`);
                                                            break;
                                                        }
                                                    }
                                                    
                                                    if (submitBtn) {
                                                        submitBtn.click();
                                                        comments++;
                                                        console.log(`📱 SCRIPT: Posted comment on post ${index + 1}`);
                                                        await jitter(2500, `afterCommentSubmit-post${index+1}`);
                                                    } else {
                                                        console.log(`📱 SCRIPT: Submit button not found for post ${index + 1}, trying alternative...`);
                                                        // Try to find any enabled button in the comment form area
                                                        const anySubmitBtn = post.querySelector('button.artdeco-button--primary:not(:disabled)') ||
                                                                           document.querySelector('.comments-comment-box button:not(:disabled)');
                                                        if (anySubmitBtn) {
                                                            anySubmitBtn.click();
                                                            comments++;
                                                            console.log(`📱 SCRIPT: Posted with alternative button on post ${index + 1}`);
                                                            await jitter(2500, `afterAltCommentSubmit-post${index+1}`);
                                                        }
                                                    }
                                                }
                                            }
                                        }

                                        // Share post
                                        if (postActions.shares) {
                                            await jitter(delays.beforeShareDelay || 0, `beforeShare-post${index+1}`);
                                            const shareBtn = post.querySelector('button[aria-label*="Repost"], button.social-reshare-button, button[data-control-name="share_toggle"]');
                                            if (shareBtn) {
                                                shareBtn.click();
                                                await jitter(1500, `afterShareBtnClick-post${index+1}`);
                                                
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
                                                    repostOption.click();
                                                    shares++;
                                                    console.log(`📱 SCRIPT: Shared post ${index + 1}`);
                                                    await jitter(1500, `afterShare-post${index+1}`);
                                                }
                                            }
                                        }
                                    } catch (error) {
                                        console.error(`📱 SCRIPT: Error processing post ${index + 1}:`, error);
                                    }
                                }
                            }
                            
                            // Start processing posts
                            await processPostsSequentially();

                            // Resolve immediately after processing is complete
                            resolve({ likes, comments, shares, follows, postDetails, debug: { totalLinksFound, mappedPosts: postsToProcess.length, links: postsToProcess.map(p => p.url) } });

                        } catch (error) {
                            resolve({ likes: 0, comments: 0, shares: 0, follows: 0, postDetails: [], error: error.message });
                        }
                    });
                },
                args: [postsCount, actions, randomMode, commentSettings, profileSlug, delays]
                });
                
                console.log('📱 IMPORT: Script executed, result:', result);
                
            } catch (scriptError) {
                console.error('📱 IMPORT: Script execution failed:', scriptError);
                return { likes: 0, comments: 0, shares: 0, follows: 0, postDetails: [], error: scriptError.message };
            }

            // Wait for script to complete before closing
            console.log('⏳ IMPORT: Waiting 10 seconds for actions to complete...');
            await new Promise(resolve => setTimeout(resolve, 10000));

            // Close tab
            try {
                await chrome.tabs.remove(tabId);
            } catch (e) {
                console.log('📱 IMPORT: Tab already closed');
            }

            let engagement = result?.[0]?.result || { likes: 0, comments: 0, shares: 0, follows: 0, postDetails: [], debug: null };

            // Fallback: if we found links but didn’t act (0 actions), open each post URL directly and engage
            if ((engagement.likes + engagement.comments + engagement.shares + engagement.follows) === 0 && engagement.debug?.links?.length) {
                console.log('📱 IMPORT: Fallback engaging directly on feed/update pages');
                const links = engagement.debug.links.slice(0, postsCount);
                const fallbackDetails = [];
                for (const link of links) {
                    try {
                        const res = await this.engageSinglePostUrl(link, actions, randomMode, commentSettings, delays);
                        engagement.likes += res.likes || 0;
                        engagement.comments += res.comments || 0;
                        engagement.shares += res.shares || 0;
                        engagement.follows += res.follows || 0;
                        if (res.postDetails?.length) fallbackDetails.push(...res.postDetails);
                    } catch (e) {
                        console.warn('📱 IMPORT: Fallback post engage failed for', link, e?.message || e);
                    }
                }
                engagement.postDetails = (engagement.postDetails || []).concat(fallbackDetails);
            }

            return engagement;

        } catch (error) {
            console.error('📱 IMPORT: Error in engageWithProfilePosts:', error);
            return { likes: 0, comments: 0, shares: 0, follows: 0, postDetails: [], error: error.message };
        }
    }

    /**
     * Extract contact info from profile contact overlay
     */
    async extractContactInfo(contactUrl) {
        try {
            console.log('📧 IMPORT: Opening contact info page:', contactUrl);
            
            // Open contact info page in active tab for reliable rendering
            const tabId = await browser.openTab(contactUrl, true);
            if (!tabId) return { email: null, phone: null };

            await new Promise(resolve => setTimeout(resolve, 3000));

            const result = await chrome.scripting.executeScript({
                target: { tabId },
                func: () => {
                    try {
                        let email = null;
                        let phone = null;

                        // Look for email
                        const emailSelectors = [
                            'a[href^="mailto:"]',
                            'span:contains("@")',
                            '.ci-email'
                        ];
                        
                        for (const selector of emailSelectors) {
                            const emailEl = document.querySelector(selector);
                            if (emailEl) {
                                if (selector === 'a[href^="mailto:"]') {
                                    email = emailEl.href.replace('mailto:', '');
                                } else {
                                    const text = emailEl.textContent;
                                    if (text.includes('@')) {
                                        email = text.trim();
                                    }
                                }
                                if (email) break;
                            }
                        }

                        // Look for phone
                        const phoneSelectors = [
                            'a[href^="tel:"]',
                            '.ci-phone',
                            'span[aria-label*="phone" i]',
                            'span:contains("+")'
                        ];
                        
                        for (const selector of phoneSelectors) {
                            const phoneEl = document.querySelector(selector);
                            if (phoneEl) {
                                if (selector === 'a[href^="tel:"]') {
                                    phone = phoneEl.href.replace('tel:', '');
                                } else {
                                    const text = phoneEl.textContent.trim();
                                    if (text.match(/[\d\+\-\(\)\s]{7,}/)) {
                                        phone = text;
                                    }
                                }
                                if (phone) break;
                            }
                        }

                        console.log('📧 SCRIPT: Extracted contact info:', { email, phone });
                        return { email, phone };

                    } catch (error) {
                        console.error('📧 SCRIPT: Contact info extraction error:', error);
                        return { email: null, phone: null };
                    }
                }
            });

            await chrome.tabs.remove(tabId);

            return result[0]?.result || { email: null, phone: null };

        } catch (error) {
            console.error('📧 IMPORT: Contact info extraction failed:', error);
            return { email: null, phone: null };
        }
    }

    /**
     * Save lead to storage
     */
    async saveLead(lead) {
        try {
            const { leads = [] } = await chrome.storage.local.get('leads');
            
            // Check for duplicates
            const existingIndex = leads.findIndex(l => l.profileUrl === lead.profileUrl);
            if (existingIndex >= 0) {
                leads[existingIndex] = { ...leads[existingIndex], ...lead };
            } else {
                leads.unshift(lead); // Add at top
            }
            
            await chrome.storage.local.set({ leads });
            console.log('💾 IMPORT: Lead saved:', lead.name);
            
        } catch (error) {
            console.error('💾 IMPORT: Failed to save lead:', error);
        }
    }

    /**
     * Extract name from LinkedIn profile URL
     */
    extractNameFromUrl(url) {
        try {
            const match = url.match(/\/in\/([^\/]+)/);
            if (match) {
                return match[1].split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ').replace(/\d+/g, '').trim();
            }
            return 'Unknown Profile';
        } catch (error) {
            return 'Unknown Profile';
        }
    }

    /**
     * Save import history records for each profile
     */
    async saveImportHistory(profiles, results, options) {
        try {
            console.log('💾 BACKGROUND: Saving import history for', profiles.length, 'profiles...');
            
            const storage = await chrome.storage.local.get('importHistory');
            const importHistory = storage.importHistory || [];
            
            // Create a record for each profile (both successful and failed)
            for (let i = 0; i < profiles.length; i++) {
                const profile = profiles[i];
                const error = results.errors.find(e => e.startsWith(profile));
                const lead = results.leads.find(l => l.profileUrl === profile);
                
                // Get post details for this profile if available
                const profilePostDetails = results.profilePostDetails?.[profile] || [];
                
                // For combined automation, success is based on post engagement OR connection
                const hasPostEngagement = profilePostDetails.length > 0 || 
                    (results.totalLikes > 0 || results.totalComments > 0 || results.totalShares > 0);
                const hasConnection = !!lead;
                const isSuccess = hasPostEngagement || hasConnection;
                const status = error ? 'Failed' : (isSuccess ? 'Success' : 'Pending');
                const errorMsg = error ? error.split(': ')[1] : '';
                
                // Calculate engagement stats from post details or divide totals
                const likesCount = profilePostDetails.length > 0 ? 
                    Math.round(results.totalLikes / Math.max(results.profilesProcessed, 1)) : 0;
                const commentsCount = profilePostDetails.filter(p => p.generatedComment).length || 
                    Math.round(results.totalComments / Math.max(results.profilesProcessed, 1));
                const sharesCount = profilePostDetails.length > 0 ? 
                    Math.round(results.totalShares / Math.max(results.profilesProcessed, 1)) : 0;
                const followsCount = profilePostDetails.length > 0 ? 
                    Math.round(results.totalFollows / Math.max(results.profilesProcessed, 1)) : 0;
                
                // Get profile name from post details author if available
                const profileNameFromPosts = profilePostDetails.length > 0 ? 
                    (profilePostDetails[0]?.authorName || null) : null;
                
                const record = {
                    id: `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    timestamp: Date.now(),
                    date: new Date().toLocaleString(),
                    action: 'Combined',
                    profileUrl: profile,
                    profileName: lead?.name || profileNameFromPosts || this.extractNameFromUrl(profile),
                    email: lead?.email || null,
                    phone: lead?.phone || null,
                    connectionsSent: hasConnection ? 1 : 0,
                    likes: likesCount,
                    comments: commentsCount,
                    shares: sharesCount,
                    follows: followsCount,
                    status: status,
                    errorMessage: errorMsg || null,
                    extractContactInfo: options.extractContactInfo || false,
                    postDetails: profilePostDetails // Include post details with author, text, and comments
                };
                
                console.log('💾 BACKGROUND: Creating record with postDetails:', profilePostDetails.length, 'posts');
                
                importHistory.unshift(record); // Add at top
                console.log('💾 BACKGROUND: Saved import record for:', profile, 'Status:', status);
            }
            
            await chrome.storage.local.set({ importHistory });
            console.log('✅ BACKGROUND: Import history saved! Total records:', importHistory.length);
            
        } catch (error) {
            console.error('❌ BACKGROUND: Failed to save import history:', error);
        }
    }

    /**
     * Save post engagement history records for each profile
     */
    async savePostEngagementHistory(profiles, results, options) {
        try {
            console.log('💾 BACKGROUND: Saving post engagement history for', profiles.length, 'profiles...');
            
            const storage = await chrome.storage.local.get('importHistory');
            const importHistory = storage.importHistory || [];
            
            // Create a record for each profile
            for (let i = 0; i < profiles.length; i++) {
                const profile = profiles[i];
                const error = results.errors.find(e => e.startsWith(profile));
                const status = error ? 'Failed' : 'Success';
                const errorMsg = error ? error.split(': ')[1] : '';
                
                // Calculate stats per profile (divide totals by profiles processed)
                const likesPerProfile = results.profilesProcessed > 0 ? Math.round(results.totalLikes / results.profilesProcessed) : 0;
                const commentsPerProfile = results.profilesProcessed > 0 ? Math.round(results.totalComments / results.profilesProcessed) : 0;
                const sharesPerProfile = results.profilesProcessed > 0 ? Math.round(results.totalShares / results.profilesProcessed) : 0;
                const followsPerProfile = results.profilesProcessed > 0 ? Math.round(results.totalFollows / results.profilesProcessed) : 0;
                
                const record = {
                    id: `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    timestamp: Date.now(),
                    date: new Date().toLocaleString(),
                    action: 'Post Engagement',
                    profileUrl: profile,
                    profileName: this.extractNameFromUrl(profile),
                    connections: 0,
                    likes: error ? 0 : likesPerProfile,
                    comments: error ? 0 : commentsPerProfile,
                    shares: error ? 0 : sharesPerProfile,
                    follows: error ? 0 : followsPerProfile,
                    status: status,
                    errorMessage: errorMsg || null,
                    postsEngaged: options.postsPerProfile || 2
                };
                
                importHistory.unshift(record); // Add at top
                console.log('💾 BACKGROUND: Saved post engagement record for:', profile, 'Status:', status);
            }
            
            await chrome.storage.local.set({ importHistory });
            console.log('✅ BACKGROUND: Post engagement history saved! Total records:', importHistory.length);
            
        } catch (error) {
            console.error('❌ BACKGROUND: Failed to save post engagement history:', error);
        }
    }

    /**
     * Get current processing status
     */
    getStatus() {
        return {
            isProcessing: this.isProcessing,
            currentOperation: this.currentOperation
        };
    }

    /**
     * Stop current operation
     */
    stop() {
        if (this.isProcessing) {
            console.log('🛑 IMPORT: Stopping current operation...');
            this.stopFlag = true;
            this.isProcessing = false;
            this.currentOperation = null;
            return { success: true, message: 'Import automation stopped' };
        }
        return { success: false, message: 'No operation running' };
    }
}

export const importAutomation = new ImportAutomation();
export default ImportAutomation;
