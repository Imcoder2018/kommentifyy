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
            let settled = false;
            
            // POLL for hidden DOM elements created by bridge.js (isolated world).
            // DOM is shared between worlds — this is 100% reliable.
            // No events, no postMessage responses, no CustomEvent — just DOM polling.
            const poller = setInterval(() => {
                const els = document.querySelectorAll('[data-commentron-response]');
                for (const el of els) {
                    try {
                        const detail = JSON.parse(el.getAttribute('data-commentron-response'));
                        if (!detail || detail.requestId !== requestId) {
                            continue;
                        }
                        el.remove();
                        clearInterval(poller);
                        settled = true;
                        if (detail.error) {
                            reject(new Error(detail.error));
                        } else {
                            resolve(detail.data);
                        }
                        return;
                    } catch (e) {
                        el.remove();
                    }
                }
            }, 150);
            
            // Send request to bridge via window.postMessage (page→content-script direction works)
            window.postMessage({
                type: 'COMMENTRON_RUNTIME_SEND_MESSAGE',
                action: action,
                payload: payload,
                requestId: requestId
            }, '*');
            
            setTimeout(() => {
                if (!settled) {
                    clearInterval(poller);
                    reject(new Error('Request timeout (90s)'));
                }
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
     * Scan for comment editors and add AI comment buttons to toolbar
     */
    scanAndAddButtons() {
        // Use user's selectors for finding comment editors
        const editorSelectors = [
            '[contenteditable="true"][data-placeholder*="comment" i]',
            '[contenteditable="true"][aria-placeholder*="comment" i]',
            '.ql-editor[contenteditable="true"]'
        ];

        let commentEditors = [];
        let usedSelector = '';

        // Try each selector until we find comment editors
        for (const selector of editorSelectors) {
            const editors = document.querySelectorAll(selector);
            if (editors.length > 0) {
                commentEditors = Array.from(editors);
                usedSelector = selector;
                break;
            }
        }

        if (commentEditors.length === 0) {
            return;
        }

        console.log(`[AI Comment] ✅ Found ${commentEditors.length} comment editors using: ${usedSelector}`);

        let addedCount = 0;
        commentEditors.forEach((editor, index) => {
            // Skip if already processed
            if (editor.hasAttribute('data-ai-processed')) {
                return;
            }

            // Mark as processed
            editor.setAttribute('data-ai-processed', 'true');

            // Create unique ID for this button
            const buttonId = `ai-btn-${index}-${Date.now()}`;

            // Add AI button to the toolbar
            this.addAIButtonToToolbar(editor, buttonId);
            addedCount++;
        });

        if (addedCount > 0) {
            console.log(`[AI Comment] ✅ Added ${addedCount} new AI buttons to toolbar`);
        }
    }

    /**
     * Add AI button to the native toolbar (next to Emoji/Image buttons)
     */
    addAIButtonToToolbar(editor, buttonId) {
        // Find the parent form/container
        const form = editor.closest('form') || editor.closest('.comments-comment-box') || editor.parentElement?.parentElement?.parentElement;
        if (!form) {
            console.log(`[AI Comment] Could not find form container`);
            return;
        }

        // Find the native Emoji or Image buttons to locate their flex container
        const emojiBtn = form.querySelector('button[title*="Emoji" i], button[aria-label*="Emoji" i]');
        const imageBtn = form.querySelector('button[aria-label*="photo" i]');

        // Get the toolbar container holding these buttons
        const toolbar = (emojiBtn && emojiBtn.closest('.display-flex')) || (imageBtn && imageBtn.closest('.display-flex'));

        // If the toolbar hasn't rendered yet or we already injected, skip
        if (!toolbar || toolbar.dataset.rocketInjected) {
            return;
        }
        toolbar.dataset.rocketInjected = 'true';

        // Create our circular icon button matching LinkedIn's native style
        const aiBtn = document.createElement('button');
        aiBtn.className = 'ai-comment-btn';
        aiBtn.id = buttonId;
        aiBtn.innerHTML = '🚀';
        aiBtn.title = 'Generate AI Comment';
        aiBtn.type = 'button';

        // Style it to match LinkedIn's native circular buttons
        aiBtn.style.cssText = `
            width: 48px !important;
            height: 48px !important;
            border-radius: 50% !important;
            background-color: transparent !important;
            border: none !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-size: 32px !important;
            cursor: pointer !important;
            margin-right: 4px !important;
            transition: background-color 0.2s ease !important;
            line-height: 1 !important;
        `;

        // Add the native grey hover effect
        aiBtn.addEventListener('mouseenter', () => aiBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.08)');
        aiBtn.addEventListener('mouseleave', () => aiBtn.style.backgroundColor = 'transparent');

        // Click handler - generate AI comment
        aiBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await this.handleAIButtonClick(editor, aiBtn);
        });

        // Insert our button at the beginning of that toolbar row
        toolbar.prepend(aiBtn);
        console.log(`[AI Comment] ✅ Added AI button to toolbar`);
    }
    
    /**
     * Handle AI button click - extract post data and generate comment
     */
    async handleAIButtonClick(editor, aiBtn) {
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
        aiBtn.innerHTML = '⏳ Thinking...';
        aiBtn.style.setProperty('color', 'black', 'important');
        aiBtn.style.setProperty('font-size', '14px', 'important');
        aiBtn.style.opacity = '0.7';
        aiBtn.disabled = true;
        aiBtn.style.pointerEvents = 'none';
        
        // Safety timeout: reset button after 95s no matter what
        const safetyTimer = setTimeout(() => {
            if (aiBtn.innerHTML === '⏳ Thinking...') {
                console.warn('[AI Comment] Safety timeout reached (95s), resetting button');
                aiBtn.innerHTML = originalText;
                aiBtn.style.opacity = '1';
                aiBtn.style.removeProperty('color');
                aiBtn.style.removeProperty('font-size');
                aiBtn.style.setProperty('font-size', '32px', 'important');
                aiBtn.disabled = false;
                aiBtn.style.pointerEvents = 'auto';
                this.isGenerating = false;
            }
        }, 95000);
        
        try {
            // Find the post container using editor (user's approach)
            const post = editor.closest('div[data-urn], div[data-id]');

            if (!post) {
                throw new Error('Could not find post container');
            }

            // Extract post data
            const postData = this.extractPostData(post);
            console.log('[AI Comment] Extracted post data:', postData);
            
            // Get user settings
            const settings = await this.getUserSettings();
            console.log('[AI Comment] Got settings:', settings);

            // Check if auto-decide is enabled
            console.log('[AI Comment] autoDecideEnabled value:', settings.autoDecideEnabled, 'type:', typeof settings.autoDecideEnabled);
            const isAutoDecide = settings.autoDecideEnabled === true || settings.autoDecideEnabled === 'true';
            console.log('[AI Comment] isAutoDecide:', isAutoDecide);
            let finalSettings = { ...settings };
            let autoDecideReasoning = '';

            // If auto-decide is enabled, call the auto-decide API first
            if (isAutoDecide) {
                console.log('[AI Comment] Auto-decide is ON, calling auto-decide API...');
                try {
                    const autoDecideResult = await this.sendMessageToBackground('autoDecideComment', {
                        authorName: postData.authorName,
                        postText: postData.postText,
                        model: settings.model || 'gpt-4o-mini'
                    });

                    if (autoDecideResult && autoDecideResult.success && autoDecideResult.settings) {
                        // Override settings with auto-decided values
                        finalSettings.goal = autoDecideResult.settings.goal || finalSettings.goal;
                        finalSettings.tone = autoDecideResult.settings.tone || finalSettings.tone;
                        finalSettings.length = autoDecideResult.settings.length || finalSettings.length;
                        finalSettings.style = autoDecideResult.settings.style || finalSettings.style;
                        autoDecideReasoning = autoDecideResult.settings.reasoning || '';
                        console.log('[AI Comment] Auto-decide result:', autoDecideResult.settings);
                    }
                } catch (autoDecideErr) {
                    console.error('[AI Comment] Auto-decide failed, using manual settings:', autoDecideErr);
                }
            }

            // Show settings notification (top-right)
            this.showSettingsNotification(finalSettings, isAutoDecide ? 'auto-decide' : 'manual', autoDecideReasoning);

            // Generate AI comment
            console.log('[AI Comment] Calling generateComment with settings:', finalSettings);
            const comment = await this.generateComment(postData, finalSettings);
            console.log('[AI Comment] Got comment response:', comment ? comment.substring(0, 80) + '...' : 'NULL');
            
            if (comment) {
                // The editor is already open (we're in the comment box toolbar)
                // Just fill the comment directly
                console.log('[AI Comment] Filling comment in open editor...');

                // Find and fill the comment input (pass settings for auto-post check)
                // Use the editor that was clicked
                await this.fillCommentInput(comment, editor, finalSettings);

                // Close settings notification after comment is filled (wait 5 seconds)
                setTimeout(() => {
                    const notification = document.getElementById('ai-settings-notification');
                    if (notification) {
                        notification.style.animation = 'slideOutRight 0.3s ease';
                        setTimeout(() => notification.remove(), 300);
                    }
                }, 5000);

                // Show appropriate message based on auto-post setting
                if (settings.aiAutoPost === 'manual') {
                    aiBtn.innerHTML = '✅ Ready!';
                    aiBtn.style.setProperty('color', 'black', 'important');
                    aiBtn.style.setProperty('font-size', '14px', 'important');
                } else {
                    aiBtn.innerHTML = '✅ Posted!';
                    aiBtn.style.setProperty('color', 'black', 'important');
                    aiBtn.style.setProperty('font-size', '14px', 'important');
                }
                clearTimeout(safetyTimer);
                setTimeout(() => {
                    aiBtn.innerHTML = originalText;
                    aiBtn.style.opacity = '1';
                    aiBtn.style.removeProperty('color');
                    aiBtn.disabled = false;
                    aiBtn.style.pointerEvents = 'auto';
                }, 2000);
            } else {
                throw new Error('No comment generated (null response)');
            }
        } catch (error) {
            console.error('[AI Comment] Error:', error);
            // Show error notification (top-right)
            this.showErrorNotification(error.message || 'Failed to generate comment. Please try again.');
            aiBtn.innerHTML = '❌ Error';
            clearTimeout(safetyTimer);
            setTimeout(() => {
                aiBtn.innerHTML = originalText;
                aiBtn.style.opacity = '1';
                aiBtn.style.removeProperty('color');
                aiBtn.style.removeProperty('font-size');
                aiBtn.style.setProperty('font-size', '32px', 'important');
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
        // Remove duplicated names (LinkedIn nests spans causing "Name Name", "NameName", "Name\nName")
        // First: regex catch-all for exact repeats (with or without whitespace separator)
        authorName = authorName.replace(/^(.{2,})\s*\1$/, '$1').trim();
        // Normalize whitespace
        authorName = authorName.replace(/\s+/g, ' ').trim();
        const half = Math.floor(authorName.length / 2);
        if (authorName.length > 2 && authorName.length % 2 === 0 && authorName.substring(0, half) === authorName.substring(half)) {
            authorName = authorName.substring(0, half).trim();
        }
        // Also handle "Name Name" with a space separator between duplicates
        const words = authorName.split(' ');
        if (words.length >= 2 && words.length % 2 === 0) {
            const firstHalf = words.slice(0, words.length / 2).join(' ');
            const secondHalf = words.slice(words.length / 2).join(' ');
            if (firstHalf === secondHalf) {
                authorName = firstHalf;
            }
        }
        
        // Get post text using user's selectors
        const textElement = post.querySelector('.update-components-text, .feed-shared-update-v2__commentary, div[data-view-name="feed-commentary"]');
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
                style: settings?.commentStyle || 'direct',
                expertise: settings?.userExpertise || '',
                background: settings?.userBackground || '',
                aiAutoPost: settings?.aiAutoPost || 'manual',  // Default to manual (no auto-post)
                autoDecideEnabled: settings?.autoDecide === true,  // Check for true boolean
                model: settings?.model || 'gpt-4o-mini',
                autoDecideReasoning: ''
            };
        } catch (error) {
            console.log('[AI Comment] Could not get settings from background, using defaults');
            return {
                goal: 'AddValue',
                tone: 'Friendly',
                length: 'Short',
                style: 'direct',
                expertise: '',
                background: '',
                aiAutoPost: 'manual',  // Default to manual (no auto-post)
                autoDecideEnabled: false,
                model: 'gpt-4o-mini',
                autoDecideReasoning: ''
            };
        }
    }
    
    /**
     * Generate AI comment using background script
     */
    async generateComment(postData, settings) {
        try {
            console.log('[AI Comment] Sending generateAIComment to background with settings:', settings);
            const response = await this.sendMessageToBackground('generateAIComment', {
                authorName: postData.authorName,
                postText: postData.postText,
                goal: settings.goal,
                tone: settings.tone,
                length: settings.length,
                style: settings.style,
                expertise: settings.expertise,
                background: settings.background,
                model: settings.model
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
     * @param {Element} editor - The comment editor element
     * @param {Object} settings - User settings including aiAutoPost
     */
    async fillCommentInput(comment, editor, settings = {}) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Brief wait

        // Use the passed editor directly - this is the editor where the button was clicked
        let commentInput = editor;

        // If editor is not available, fall back to finding it
        if (!commentInput) {
            const selectors = [
                '.ql-editor[data-placeholder]',
                '.comments-comment-box__form-container .ql-editor',
                '[contenteditable="true"][role="textbox"]',
                '.ql-editor'
            ];

            for (const selector of selectors) {
                commentInput = document.querySelector(selector);
                if (commentInput) break;
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

    /**
     * Show notification with current comment settings (top-right)
     * @param {Object} settings - The settings being used
     * @param {string} mode - 'auto-decide' or 'manual'
     * @param {string} reasoning - Auto-decide reasoning (optional)
     */
    showSettingsNotification(settings, mode = 'manual', reasoning = '') {
        console.log('[AI Comment] Showing settings notification - mode:', mode, 'settings:', settings);
        // Remove existing notification
        const existing = document.getElementById('ai-settings-notification');
        if (existing) existing.remove();

        const popup = document.createElement('div');
        popup.id = 'ai-settings-notification';
        popup.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #1a1a3e 0%, #2d2d5a 100%);
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.4);
            z-index: 2147483647;
            max-width: 350px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            animation: slideInRight 0.3s ease;
            border: 1px solid ${mode === 'auto-decide' ? 'rgba(168,85,247,0.5)' : 'rgba(0,119,181,0.3)'};
        `;

        // Generate settings HTML based on mode
        let settingsHtml = '';
        if (mode === 'auto-decide') {
            settingsHtml = `
                <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px;">
                    <span style="background: rgba(168,85,247,0.2); color: #c4b5fd; padding: 4px 8px; border-radius: 6px; font-size: 11px;">🚀 Auto</span>
                    <span style="background: rgba(168,85,247,0.15); color: #a855f7; padding: 4px 8px; border-radius: 6px; font-size: 11px;">Goal: ${settings.goal || 'AddValue'}</span>
                    <span style="background: rgba(34,197,94,0.15); color: #22c55e; padding: 4px 8px; border-radius: 6px; font-size: 11px;">Tone: ${settings.tone || 'Friendly'}</span>
                    <span style="background: rgba(245,158,11,0.15); color: #f59e0b; padding: 4px 8px; border-radius: 6px; font-size: 11px;">Length: ${settings.length || 'Short'}</span>
                </div>
                ${reasoning ? `<div style="color: rgba(255,255,255,0.6); font-size: 11px; margin-top: 8px; font-style: italic;">"${reasoning}"</div>` : ''}
            `;
        } else {
            settingsHtml = `
                <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px;">
                    <span style="background: rgba(0,119,181,0.2); color: #60a5fa; padding: 4px 8px; border-radius: 6px; font-size: 11px;">Goal: ${settings.goal || 'AddValue'}</span>
                    <span style="background: rgba(34,197,94,0.15); color: #22c55e; padding: 4px 8px; border-radius: 6px; font-size: 11px;">Tone: ${settings.tone || 'Friendly'}</span>
                    <span style="background: rgba(245,158,11,0.15); color: #f59e0b; padding: 4px 8px; border-radius: 6px; font-size: 11px;">${settings.length || 'Short'}</span>
                </div>
            `;
        }

        popup.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                <span style="font-size: 18px;">${mode === 'auto-decide' ? '🚀' : '⚙️'}</span>
                <span style="font-weight: 600; font-size: 14px; color: white;">
                    ${mode === 'auto-decide' ? 'Auto Decide Mode' : 'Comment Settings Applied'}
                </span>
            </div>
            ${settingsHtml}
            <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 11px; color: rgba(255,255,255,0.5);">
                ${settings.aiAutoPost === 'auto' ? '📤 Will auto-post to LinkedIn' : '👀 Waiting for you to review & post'}
            </div>
        `;

        // Add animation keyframes if not already added
        if (!document.getElementById('ai-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'ai-notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(popup);
        console.log('[AI Comment] Notification popup added to DOM');
        // Note: Notification will be closed after comment is generated and filled (see handleAIButtonClick)
    }

    /**
     * Show error notification (top-right)
     * @param {string} errorMessage - The error message to display
     */
    showErrorNotification(errorMessage) {
        // Remove existing notification
        const existing = document.getElementById('ai-error-notification');
        if (existing) existing.remove();

        const popup = document.createElement('div');
        popup.id = 'ai-error-notification';
        popup.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 8px 30px rgba(220,38,38,0.4);
            z-index: 999999;
            max-width: 320px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            animation: slideInRight 0.3s ease;
        `;

        popup.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 12px;">
                <span style="font-size: 20px;">❌</span>
                <div>
                    <div style="font-weight: 600; font-size: 14px; margin-bottom: 6px;">Comment Generation Failed</div>
                    <div style="font-size: 12px; opacity: 0.9; line-height: 1.4;">${errorMessage}</div>
                </div>
            </div>
        `;

        this.positionNotification(popup, 'ai-error-notification');

        // Auto-close after 6 seconds
        setTimeout(() => {
            const el = document.getElementById('ai-error-notification');
            if (el) {
                el.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => el.remove(), 300);
            }
        }, 6000);
    }

    /**
     * Position and show a notification with slide animation
     */
    positionNotification(popup, id) {
        // Add animation keyframes if not already added
        if (!document.getElementById('ai-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'ai-notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(popup);
    }

}

export const aiCommentButton = new AICommentButtonManager();
