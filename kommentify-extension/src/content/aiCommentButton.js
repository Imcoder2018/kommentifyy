/**
 * AI Comment Button - Adds AI comment generation buttons to LinkedIn posts
 * Users can click this button to generate AI comments using their settings
 */

// Module-level log to confirm this file loads
console.log('[AI Comment] ⚡ Module loaded at:', new Date().toISOString());

import { feedScraper } from '../shared/dom/feedScraper.js';
import { feedActions } from '../shared/dom/feedActions.js';
import { storage } from '../shared/storage/storage.js';
import { log } from '../shared/utils/logger.js';

class AICommentButtonManager {
    constructor() {
        this.addedButtons = new Set();
        this.isGenerating = false;
    }

    /**
     * Send message to background script via bridge
     */
    async sendMessageToBackground(action, payload) {
        return new Promise((resolve, reject) => {
            const requestId = `req_${Date.now()}_${Math.random()}`;
            
            const listener = (event) => {
                // Note: Do NOT check event.source===window here — it fails for
                // cross-world messages from content script bridge to MAIN world.
                // The unique requestId is sufficient to filter our messages.
                if (!event.data || event.data.type !== `COMMENTRON_RUNTIME_RESULT_${requestId}`) {
                    return;
                }
                
                window.removeEventListener('message', listener);
                
                if (event.data.error) {
                    reject(new Error(event.data.error));
                } else {
                    resolve(event.data.data);
                }
            };
            
            window.addEventListener('message', listener);
            
            window.postMessage({
                type: 'COMMENTRON_RUNTIME_SEND_MESSAGE',
                action: action,
                payload: payload,
                requestId: requestId
            }, '*');
            
            setTimeout(() => {
                window.removeEventListener('message', listener);
                reject(new Error('Request timeout (90s)'));
            }, 90000);
        });
    }

    /**
     * Initialize and start observing for new posts
     */
    init() {
        try {
            console.log('[AI Comment] 🚀 Initializing AI Comment Button Manager...');
            console.log('[AI Comment] Current URL:', window.location.href);
            console.log('[AI Comment] Document ready state:', document.readyState);
            
            // Only run on LinkedIn
            if (!window.location.href.includes('linkedin.com')) {
                console.log('[AI Comment] Not on LinkedIn, skipping...');
                return;
            }
            
            // Inject styles for AI button
            this.injectStyles();
            
            // Debug: Log all buttons on page after a delay
            setTimeout(() => {
                const allButtons = document.querySelectorAll('button');
                console.log('[AI Comment] Total buttons on page:', allButtons.length);
                
                // Log buttons with Comment or Reply in aria-label
                const relevantButtons = Array.from(allButtons).filter(btn => {
                    const label = btn.getAttribute('aria-label') || '';
                    return label.includes('Comment') || label.includes('Reply');
                });
                console.log('[AI Comment] Comment/Reply buttons found:', relevantButtons.length);
                relevantButtons.forEach((btn, i) => {
                    console.log(`[AI Comment] Button ${i}:`, btn.getAttribute('aria-label'), btn.className);
                });
            }, 3000);
            
            // Start aggressive scanning with delay to wait for Ember.js to render
            this.startAggressiveScanning();
        } catch (error) {
            console.error('[AI Comment] ❌ Init error:', error);
        }
    }
    
    /**
     * Inject CSS styles for the AI button
     */
    injectStyles() {
        if (document.getElementById('ai-comment-btn-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'ai-comment-btn-styles';
        style.textContent = `
            .ai-comment-btn {
                background: linear-gradient(135deg, #693fe9 0%, #7c4dff 100%) !important;
                color: white !important;
                border: none !important;
                border-radius: 20px !important;
                padding: 6px 12px !important;
                font-size: 12px !important;
                font-weight: bold !important;
                cursor: pointer !important;
                margin-left: 4px !important;
                display: inline-flex !important;
                align-items: center !important;
                gap: 4px !important;
                box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4) !important;
                transition: all 0.3s ease !important;
                z-index: 9999 !important;
                vertical-align: middle !important;
            }
            .ai-comment-btn:hover {
                transform: scale(1.05) !important;
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.6) !important;
            }
        `;
        document.head.appendChild(style);
        console.log('[AI Comment] Styles injected');
    }
    
    /**
     * Start aggressive scanning for comment buttons
     */
    startAggressiveScanning() {
        console.log('[AI Comment] Starting FAST scanning for dynamically loaded content...');
        
        // Immediate scan - start right away
        this.scanAndAddButtons();
        
        // Quick follow-up scans for fast loading
        setTimeout(() => this.scanAndAddButtons(), 300);
        setTimeout(() => this.scanAndAddButtons(), 600);
        setTimeout(() => this.scanAndAddButtons(), 1000);
        setTimeout(() => this.scanAndAddButtons(), 1500);
        setTimeout(() => this.scanAndAddButtons(), 2500);
        
        // Continuous interval scan every 2 seconds (faster than before)
        setInterval(() => {
            this.scanAndAddButtons();
        }, 2000);
        
        // Mutation observer for dynamic Ember.js content - FAST response
        let scanPending = false;
        const observer = new MutationObserver((mutations) => {
            // Debounce scanning but keep it fast
            if (!scanPending) {
                scanPending = true;
                setTimeout(() => {
                    this.scanAndAddButtons();
                    scanPending = false;
                }, 200); // Fast 200ms debounce
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Scroll listener for lazy-loaded content - FAST response
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => this.scanAndAddButtons(), 500); // Fast 500ms debounce
        }, { passive: true });
        
        console.log('[AI Comment] ✅ FAST scanning started - buttons will appear quickly!');
    }

    /**
     * Scan for posts and add AI comment buttons
     */
    scanAndAddButtons() {
        // Try multiple selectors for comment AND reply buttons
        // LinkedIn frequently changes their DOM, so we try many selectors
        const selectors = [
            // 2024-2025 LinkedIn selectors
            '.feed-shared-social-action-bar__action-button[aria-label*="Comment"]',
            '.feed-shared-social-action-bar button[aria-label*="Comment"]',
            '.social-actions-button[aria-label*="Comment"]',
            'button.comment-button',
            'button[aria-label*="Comment"]',
            'button[aria-label*="Reply"]',
            // Class-based selectors
            '.comments-comment-social-bar__reply-action-button--cr',
            '.feed-shared-social-actions button[aria-label*="Comment"]',
            // Data attribute selectors
            '[data-control-name="comment"]',
            '[data-test-id="social-actions-comment"]',
            // Artdeco buttons
            '.artdeco-button[aria-label*="Comment"]',
            '.artdeco-button[aria-label*="Reply"]',
            // Generic social action buttons
            '.social-actions button:nth-child(2)',
            '.feed-shared-social-action-bar > button:nth-child(2)'
        ];
        
        let commentButtons = [];
        let usedSelector = '';
        
        // Try each selector until we find comment buttons
        for (const selector of selectors) {
            const buttons = document.querySelectorAll(selector);
            if (buttons.length > 0) {
                commentButtons = Array.from(buttons);
                usedSelector = selector;
                break;
            }
        }
        
        // Also try to find by text content as fallback
        if (commentButtons.length === 0) {
            const allButtons = document.querySelectorAll('button');
            commentButtons = Array.from(allButtons).filter(btn => {
                const text = btn.textContent?.toLowerCase() || '';
                const label = btn.getAttribute('aria-label')?.toLowerCase() || '';
                return text.includes('comment') || label.includes('comment');
            });
            if (commentButtons.length > 0) {
                usedSelector = 'text/aria-label search';
            }
        }
        
        if (commentButtons.length === 0) {
            // Debug: Log what we can find on the page
            const posts = document.querySelectorAll('[data-id*="urn:li:activity"]');
            if (posts.length > 0) {
                console.log(`[AI Comment] Found ${posts.length} posts but no comment buttons yet (Ember.js still loading)`);
            }
            return;
        }
        
        console.log(`[AI Comment] ✅ Found ${commentButtons.length} comment buttons using: ${usedSelector}`);
        
        let addedCount = 0;
        commentButtons.forEach((commentBtn, index) => {
            // Skip if already processed
            if (commentBtn.hasAttribute('data-ai-processed')) {
                return;
            }
            
            // Mark as processed
            commentBtn.setAttribute('data-ai-processed', 'true');
            
            // Create unique ID for this button
            const buttonId = `ai-btn-${index}-${Date.now()}`;
            
            // Add AI button directly after comment button
            this.addAIButtonSimple(commentBtn, buttonId);
            addedCount++;
        });
        
        if (addedCount > 0) {
            console.log(`[AI Comment] ✅ Added ${addedCount} new AI buttons`);
        }
    }

    /**
     * Simple method to add AI button directly after comment button
     */
    addAIButtonSimple(commentBtn, buttonId) {
        // Check if AI button already exists next to this comment button
        if (commentBtn.nextElementSibling?.classList?.contains('ai-comment-btn')) {
            return;
        }
        
        // Also check if AI button exists anywhere near this button
        const parent = commentBtn.parentElement;
        if (parent && parent.querySelector('.ai-comment-btn')) {
            return;
        }
        
        const aiBtn = document.createElement('button');
        aiBtn.className = 'ai-comment-btn';
        aiBtn.id = buttonId;
        aiBtn.innerHTML = '🤖 AI';
        aiBtn.title = 'Generate AI Comment';
        aiBtn.type = 'button';
        
        // Click handler - generate AI comment
        aiBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await this.handleAIButtonClick(commentBtn, aiBtn);
        });
        
        // Try to insert the button
        try {
            // Strategy 1: Insert directly after comment button
            if (commentBtn.parentNode) {
                commentBtn.parentNode.insertBefore(aiBtn, commentBtn.nextSibling);
                console.log(`[AI Comment] ✅ Added AI button after comment button`);
                return;
            }
        } catch (e) {
            console.log(`[AI Comment] Strategy 1 failed:`, e.message);
        }
        
        try {
            // Strategy 2: Append to parent
            if (commentBtn.parentElement) {
                commentBtn.parentElement.appendChild(aiBtn);
                console.log(`[AI Comment] ✅ Added AI button to parent element`);
                return;
            }
        } catch (e) {
            console.log(`[AI Comment] Strategy 2 failed:`, e.message);
        }
        
        console.log(`[AI Comment] ❌ Failed to add AI button`);
    }
    
    /**
     * Handle AI button click - extract post data and generate comment
     */
    async handleAIButtonClick(commentBtn, aiBtn) {
        if (this.isGenerating) {
            console.log('[AI Comment] Already generating, please wait...');
            return;
        }
        
        // Check daily comment limit before proceeding
        try {
            const limitCheck = await this.sendMessageToBackground('checkDailyLimit', { actionType: 'comment' });
            if (limitCheck && !limitCheck.allowed) {
                console.log('[AI Comment] Daily comment limit reached:', limitCheck);
                this.showLimitReachedPopup('Comments', limitCheck.limit);
                return;
            }
        } catch (e) {
            console.log('[AI Comment] Could not check limit, proceeding...');
        }
        
        this.isGenerating = true;
        const originalText = aiBtn.innerHTML;
        aiBtn.innerHTML = '⏳ Generating...';
        aiBtn.style.opacity = '0.7';
        aiBtn.disabled = true;
        aiBtn.style.pointerEvents = 'none';
        
        // Safety timeout: reset button after 95s no matter what
        const safetyTimer = setTimeout(() => {
            if (aiBtn.innerHTML === '⏳ Generating...') {
                console.warn('[AI Comment] Safety timeout reached (95s), resetting button');
                aiBtn.innerHTML = originalText;
                aiBtn.style.opacity = '1';
                aiBtn.disabled = false;
                aiBtn.style.pointerEvents = 'auto';
                this.isGenerating = false;
            }
        }, 95000);
        
        try {
            // Find the post container
            const post = commentBtn.closest('[data-id*="urn:li:activity:"]') ||
                        commentBtn.closest('.feed-shared-update-v2') ||
                        commentBtn.closest('.occludable-update') ||
                        commentBtn.closest('div[data-urn]');
            
            if (!post) {
                throw new Error('Could not find post container');
            }
            
            // Extract post data
            const postData = this.extractPostData(post);
            console.log('[AI Comment] Extracted post data:', postData);
            
            // Get user settings
            const settings = await this.getUserSettings();
            console.log('[AI Comment] Got settings:', settings);
            
            // Generate AI comment
            console.log('[AI Comment] Calling generateComment...');
            const comment = await this.generateComment(postData, settings);
            console.log('[AI Comment] Got comment response:', comment ? comment.substring(0, 80) + '...' : 'NULL');
            
            if (comment) {
                // Click the comment button to open comment box
                console.log('[AI Comment] Clicking comment button to open input...');
                commentBtn.click();
                
                // Wait for comment box to appear
                try {
                    await this.waitForElement('.ql-editor, .comments-comment-box__form-container textarea, [contenteditable="true"]', post.parentElement || document.body, 8000);
                    console.log('[AI Comment] Comment box appeared');
                } catch (waitErr) {
                    console.warn('[AI Comment] waitForElement timed out, trying to fill anyway:', waitErr.message);
                }
                
                // Find and fill the comment input (pass settings for auto-post check)
                await this.fillCommentInput(comment, post, settings);
                
                // Show appropriate message based on auto-post setting
                if (settings.aiAutoPost === 'manual') {
                    aiBtn.innerHTML = '✅ Ready!';
                } else {
                    aiBtn.innerHTML = '✅ Posted!';
                }
                clearTimeout(safetyTimer);
                setTimeout(() => {
                    aiBtn.innerHTML = originalText;
                    aiBtn.style.opacity = '1';
                    aiBtn.disabled = false;
                    aiBtn.style.pointerEvents = 'auto';
                }, 2000);
            } else {
                throw new Error('No comment generated (null response)');
            }
        } catch (error) {
            console.error('[AI Comment] Error:', error);
            aiBtn.innerHTML = '❌ Error';
            clearTimeout(safetyTimer);
            setTimeout(() => {
                aiBtn.innerHTML = originalText;
                aiBtn.style.opacity = '1';
                aiBtn.disabled = false;
                aiBtn.style.pointerEvents = 'auto';
            }, 2000);
        } finally {
            this.isGenerating = false;
        }
    }
    
    /**
     * Extract post data (author name, post text)
     */
    extractPostData(post) {
        // Get author name
        const authorElement = post.querySelector('.update-components-actor__name span[aria-hidden="true"], .feed-shared-actor__name span[aria-hidden="true"], .update-components-actor__title span[aria-hidden="true"]') 
            || post.querySelector('.update-components-actor__name .visually-hidden, .feed-shared-actor__name .visually-hidden');
        let authorName = authorElement?.innerText?.trim() || authorElement?.textContent?.trim() || 'Unknown Author';
        // Remove duplicated names (LinkedIn sometimes nests spans)
        const half = Math.floor(authorName.length / 2);
        if (authorName.length > 2 && authorName.length % 2 === 0 && authorName.substring(0, half) === authorName.substring(half)) {
            authorName = authorName.substring(0, half);
        }
        
        // Get post text
        const textElement = post.querySelector('.feed-shared-update-v2__description, .update-components-text, .feed-shared-text__text-view span');
        const postText = textElement?.textContent?.trim() || '';
        
        return {
            authorName,
            postText: postText.substring(0, 1000) // Limit to 1000 chars
        };
    }
    
    /**
     * Get user settings from storage via background script
     */
    async getUserSettings() {
        try {
            // Get settings from background script
            const settings = await this.sendMessageToBackground('getCommentSettings', {});
            return {
                goal: settings?.goal || 'AddValue',
                tone: settings?.tone || 'Friendly', 
                length: settings?.commentLength || 'Short',
                expertise: settings?.userExpertise || '',
                background: settings?.userBackground || '',
                aiAutoPost: settings?.aiAutoPost || 'manual'  // Default to manual (no auto-post)
            };
        } catch (error) {
            console.log('[AI Comment] Could not get settings from background, using defaults');
            return {
                goal: 'AddValue',
                tone: 'Friendly', 
                length: 'Short',
                expertise: '',
                background: '',
                aiAutoPost: 'manual'  // Default to manual (no auto-post)
            };
        }
    }
    
    /**
     * Generate AI comment using background script
     */
    async generateComment(postData, settings) {
        try {
            console.log('[AI Comment] Sending generateAIComment to background...');
            const response = await this.sendMessageToBackground('generateAIComment', {
                authorName: postData.authorName,
                postText: postData.postText,
                goal: settings.goal,
                tone: settings.tone,
                length: settings.length,
                expertise: settings.expertise
            });
            
            console.log('[AI Comment] Background response:', JSON.stringify(response).substring(0, 200));
            
            if (response?.comment) {
                return response.comment;
            }
            if (response?.content) {
                return response.content;
            }
            console.warn('[AI Comment] No comment in response, keys:', Object.keys(response || {}));
            return null;
        } catch (error) {
            console.error('[AI Comment] Failed to generate comment:', error);
            return this.generateFallbackComment(postData, settings);
        }
    }
    
    /**
     * Fallback comment generation if AI fails
     */
    generateFallbackComment(postData, settings) {
        const templates = [
            `Great insights, ${postData.authorName}! Thanks for sharing this.`,
            `Really interesting perspective! 🙌`,
            `This is valuable content. Thanks for posting!`,
            `Appreciate you sharing this, ${postData.authorName}!`,
            `Excellent point! This resonates a lot. 👍`
        ];
        return templates[Math.floor(Math.random() * templates.length)];
    }
    
    /**
     * Wait for element to appear
     */
    async waitForElement(selector, container = document.body, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const element = container.querySelector(selector);
            if (element) {
                resolve(element);
                return;
            }
            
            const observer = new MutationObserver(() => {
                const el = container.querySelector(selector);
                if (el) {
                    observer.disconnect();
                    resolve(el);
                }
            });
            
            observer.observe(container, { childList: true, subtree: true });
            
            setTimeout(() => {
                observer.disconnect();
                reject(new Error('Element not found: ' + selector));
            }, timeout);
        });
    }
    
    /**
     * Fill the comment input with generated comment
     * @param {string} comment - The generated comment
     * @param {Element} post - The post container element
     * @param {Object} settings - User settings including aiAutoPost
     */
    async fillCommentInput(comment, post, settings = {}) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for comment box
        
        // Find comment input WITHIN the post container first, then fall back to nearby elements
        // This ensures we paste in the correct post's comment box
        const selectors = [
            '.ql-editor[data-placeholder]',
            '.comments-comment-box__form-container .ql-editor',
            '[contenteditable="true"][role="textbox"]',
            '.ql-editor'
        ];
        
        let commentInput = null;
        
        // Strategy 1: Search within the post container
        for (const selector of selectors) {
            commentInput = post.querySelector(selector);
            if (commentInput) {
                console.log('[AI Comment] Found comment input within post container');
                break;
            }
        }
        
        // Strategy 2: Search in post's parent (comment section often appended after post)
        if (!commentInput && post.parentElement) {
            for (const selector of selectors) {
                commentInput = post.parentElement.querySelector(selector);
                if (commentInput) {
                    console.log('[AI Comment] Found comment input in parent container');
                    break;
                }
            }
        }
        
        // Strategy 3: Find the most recently opened/focused comment box
        if (!commentInput) {
            // Get all comment inputs and find the one that's visible and closest to viewport
            const allInputs = document.querySelectorAll('.ql-editor[data-placeholder], .comments-comment-box__form-container .ql-editor, [contenteditable="true"][role="textbox"]');
            let closestInput = null;
            let closestDistance = Infinity;
            
            const postRect = post.getBoundingClientRect();
            
            allInputs.forEach(input => {
                const inputRect = input.getBoundingClientRect();
                // Check if input is visible
                if (inputRect.height > 0 && inputRect.width > 0) {
                    // Calculate distance from post to this input
                    const distance = Math.abs(inputRect.top - postRect.bottom);
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestInput = input;
                    }
                }
            });
            
            if (closestInput && closestDistance < 500) { // Within 500px of the post
                commentInput = closestInput;
                console.log('[AI Comment] Found closest comment input at distance:', closestDistance);
            }
        }
        
        if (commentInput) {
            commentInput.focus();
            commentInput.innerHTML = `<p>${comment}</p>`;
            
            // Trigger input event
            commentInput.dispatchEvent(new Event('input', { bubbles: true }));
            commentInput.dispatchEvent(new Event('change', { bubbles: true }));
            
            console.log('[AI Comment] Comment filled in input box');
            
            // Check if manual review mode - if so, DON'T auto-submit
            if (settings.aiAutoPost === 'manual') {
                console.log('[AI Comment] Manual review mode - waiting for user to submit');
                return;  // Don't auto-submit, let user review and submit manually
            }
            
            // Auto-post mode - find and click submit button
            setTimeout(() => {
                // Search for submit button near the comment input
                const commentBox = commentInput.closest('.comments-comment-box, .comments-comment-box-comment__form, form');
                let submitBtn = null;
                
                if (commentBox) {
                    submitBtn = commentBox.querySelector('.comments-comment-box__submit-button, button[type="submit"].artdeco-button--primary, button.artdeco-button--primary');
                }
                
                // Fallback to searching near the input
                if (!submitBtn) {
                    const parent = commentInput.parentElement?.parentElement?.parentElement;
                    if (parent) {
                        submitBtn = parent.querySelector('.comments-comment-box__submit-button, button[type="submit"].artdeco-button--primary');
                    }
                }
                
                if (submitBtn && !submitBtn.disabled) {
                    submitBtn.click();
                    console.log('[AI Comment] Comment auto-submitted!');
                    // Increment daily comment count
                    this.sendMessageToBackground('incrementDailyCount', { actionType: 'comment' })
                        .catch(e => console.log('[AI Comment] Could not increment count'));
                }
            }, 500);
        } else {
            console.error('[AI Comment] Could not find comment input for this post');
        }
    }

    /**
     * Show limit reached popup notification
     * @param {string} actionName - The action type name (e.g., 'Comments')
     * @param {number} limit - The limit that was reached
     */
    showLimitReachedPopup(actionName, limit) {
        // Remove existing popup if any
        const existing = document.getElementById('ai-limit-reached-popup');
        if (existing) existing.remove();
        
        const popup = document.createElement('div');
        popup.id = 'ai-limit-reached-popup';
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
            color: white;
            padding: 20px 30px;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            z-index: 999999;
            text-align: center;
            min-width: 300px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        
        popup.innerHTML = `
            <div style="font-size: 32px; margin-bottom: 10px;">⚠️</div>
            <div style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">Daily Limit Reached</div>
            <div style="font-size: 14px; margin-bottom: 15px;">
                Your daily ${actionName} limit of <strong>${limit}</strong> has been reached.
            </div>
            <div style="font-size: 12px; opacity: 0.9; margin-bottom: 15px;">
                Limits reset at midnight. You can adjust limits in the Limits tab.
            </div>
            <button id="close-ai-limit-popup" style="
                background: white;
                color: #ee5a5a;
                border: none;
                padding: 10px 25px;
                border-radius: 6px;
                font-weight: bold;
                cursor: pointer;
                font-size: 14px;
            ">Got it</button>
        `;
        
        document.body.appendChild(popup);
        
        document.getElementById('close-ai-limit-popup').addEventListener('click', () => {
            popup.remove();
        });
        
        // Auto-close after 5 seconds
        setTimeout(() => {
            if (document.getElementById('ai-limit-reached-popup')) {
                popup.remove();
            }
        }, 5000);
    }

}

export const aiCommentButton = new AICommentButtonManager();
