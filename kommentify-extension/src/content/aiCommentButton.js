/**
 * AI Comment Button - Adds AI comment generation buttons to LinkedIn posts
 * Uses robust fallback selectors for maximum compatibility across LinkedIn versions
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
        this.customDomSelectors = null; // Custom selectors from Having Issues wizard
        this.loadCustomSelectors();
    }

    /**
     * Load custom DOM selectors from storage
     */
    loadCustomSelectors() {
        try {
            chrome.storage.local.get(['customDomSelectors'], (result) => {
                if (result.customDomSelectors) {
                    this.customDomSelectors = result.customDomSelectors;
                    console.log('[AI Comment] Loaded custom DOM selectors:', this.customDomSelectors);
                }
            });
        } catch (e) {
            console.log('[AI Comment] Could not load custom selectors (not in extension context)');
        }
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
        // Also specifically check for preload iframe which appears on profile pages
        setInterval(() => {
            this.scanAndAddButtons();

            // Additional check: specifically look for preload iframe (Shadow DOM on profile pages)
            const preloadIframe = this.findPreloadIframe();
            if (preloadIframe) {
                console.log('[AI Comment] 🔄 Preload iframe detected, ensuring Shadow DOM scan...');
            }
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

        // Also listen for Comment button clicks to scan when comment box opens
        document.addEventListener('click', (e) => {
            const target = e.target;
            // Check if clicked on a Comment button
            if (target.matches('button.comment-button') ||
                target.closest('button.comment-button') ||
                target.getAttribute('aria-label')?.includes('Comment') ||
                target.textContent?.trim() === 'Comment') {
                console.log('[AI Comment] Comment button clicked, scanning for comment box...');
                // Delay slightly to let the comment box render
                setTimeout(() => this.scanAndAddButtons(), 100);
                setTimeout(() => this.scanAndAddButtons(), 300);
                setTimeout(() => this.scanAndAddButtons(), 500);
            }
        }, true);

        // Scroll listener for lazy-loaded content - FAST response
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => this.scanAndAddButtons(), 500); // Fast 500ms debounce
        }, { passive: true });

        console.log('[AI Comment] ✅ FAST scanning started - buttons will appear quickly!');
    }

    /**
     * Get all elements matching a selector, including those inside Shadow DOM
     * @param {string} selector - CSS selector to match
     * @param {Element} root - Root element to search from (default: document)
     * @returns {Element[]} - Array of matching elements
     */
    querySelectorAllDeep(selector, root = document) {
        const results = [];

        // Helper function to query within an element and its shadow roots
        const queryInElement = (element) => {
            try {
                if (element.matches && element.matches(selector)) {
                    results.push(element);
                }
            } catch (e) {
                // Ignore invalid selector errors
            }

            try {
                const matches = element.querySelectorAll(selector);
                matches.forEach(el => results.push(el));
            } catch (e) {
                // Ignore query errors
            }

            // Check for shadowRoot
            if (element.shadowRoot) {
                queryInElement(element.shadowRoot);
            }

            // Check all children for shadow roots
            if (element.children) {
                Array.from(element.children).forEach(child => queryInElement(child));
            }
        };

        queryInElement(root);
        return results;
    }

    /**
     * Find the interop-iframe preload iframe that LinkedIn uses for profile posts
     * @returns {HTMLIFrameElement|null}
     */
    findPreloadIframe() {
        // Look for the interop-iframe used by LinkedIn for profile posts
        const iframe = document.querySelector('iframe[data-testid="interop-iframe"]');
        if (iframe && iframe.contentDocument) {
            return iframe;
        }

        // Fallback: look for any iframe with /preload/ src
        const preloadIframes = document.querySelectorAll('iframe[src*="preload"]');
        for (const iframe of preloadIframes) {
            try {
                if (iframe.contentDocument) {
                    return iframe;
                }
            } catch (e) {
                // Cross-origin iframe - can't access
            }
        }

        return null;
    }

    /**
     * Scan elements within Shadow DOM (including iframe content)
     * @param {Element} rootElement - Root element to scan from
     * @param {Function} scanCallback - Function to call for each found element
     */
    scanShadowDOM(rootElement, scanCallback) {
        // Helper to scan an element and its shadow roots
        const scanElement = (element) => {
            try {
                scanCallback(element);
            } catch (e) {
                // Ignore errors
            }

            // Check shadowRoot
            if (element.shadowRoot) {
                Array.from(element.shadowRoot.children).forEach(child => scanElement(child));
            }

            // Check children
            if (element.children) {
                Array.from(element.children).forEach(child => scanElement(child));
            }
        };

        if (rootElement) {
            scanElement(rootElement);
        }
    }

    /**
     * Scan for comment boxes and add AI comment buttons using robust fallback selectors
     * Uses the same approach as the reference extension for maximum compatibility
     * Now includes Shadow DOM support for LinkedIn profile pages
     */
    scanAndAddButtons() {
        let addedCount = 0;

        // First, scan the regular DOM
        addedCount += this.scanLightDOM();

        // Also scan Shadow DOM (for profile pages with interop-iframe)
        addedCount += this.scanShadowDOMContent();

        if (addedCount > 0) {
            console.log('[AI Comment] ✅ Added', addedCount, 'AI buttons to comment boxes');
        }
    }

    /**
     * Scan regular (light) DOM for comment boxes
     */
    scanLightDOM() {
        let addedCount = 0;

        // Try custom iconContainer selector first (from Having Issues wizard)
        if (this.customDomSelectors && this.customDomSelectors.iconContainer) {
            try {
                const customContainers = document.querySelectorAll(this.customDomSelectors.iconContainer);
                console.log('[AI Comment] Custom iconContainer found:', customContainers.length);
                customContainers.forEach(iconContainer => {
                    if (iconContainer.querySelector('.ai-comment-btn')) return;

                    let postElement = this.findPostElement(iconContainer);
                    this.addSuggestButton(postElement, iconContainer);
                    addedCount++;
                });
            } catch (e) {
                console.warn('[AI Comment] Custom iconContainer selector failed:', e);
            }
        }

        // METHOD 1: Find emoji buttons (when comment box is open)
        const emojiBtns = document.querySelectorAll(
            'button[aria-label*="emoji" i], button[aria-label*="Emoji"], button[aria-label*="Show Emoji Picker"]'
        );
        console.log('[AI Comment] Emoji buttons found:', emojiBtns.length);

        emojiBtns.forEach(btn => {
            const iconContainer = btn.parentElement;

            if (iconContainer.querySelector('.ai-comment-btn')) {
                return;
            }

            let postElement = this.findPostElement(iconContainer);
            this.addSuggestButton(postElement, iconContainer);
            addedCount++;
        });

        // METHOD 2: Find open comment boxes with contenteditable editors
        // This catches comment boxes that are already open (user clicked Comment on a post)
        const commentForms = document.querySelectorAll('.comments-comment-box__form, .comments-comment-box, form[class*="comment"]');
        console.log('[AI Comment] Comment forms found:', commentForms.length);

        commentForms.forEach(form => {
            // Find the toolbar container in this form
            const toolbar = form.querySelector('.display-flex, .comments-comment-box__detour-container, [data-test-id="comment-box-toolbar"]');

            if (toolbar && !toolbar.querySelector('.ai-comment-btn')) {
                let postElement = this.findPostElement(toolbar);
                this.addSuggestButton(postElement, toolbar);
                addedCount++;
            }
        });

        // METHOD 3: Find any flex container with buttons that's inside a comment form
        const flexContainers = document.querySelectorAll('.comments-comment-box form .display-flex');
        console.log('[AI Comment] Flex containers in comment forms found:', flexContainers.length);

        flexContainers.forEach(container => {
            if (container.querySelector('.ai-comment-btn')) return;

            // Check if this is near a comment input
            const hasCommentInput = container.closest('.comments-comment-box, .comments-comment-box__form');
            if (!hasCommentInput) return;

            let postElement = this.findPostElement(container);
            this.addSuggestButton(postElement, container);
            addedCount++;
        });

        return addedCount;
    }

    /**
     * Scan Shadow DOM content (including iframes) for comment boxes
     * This handles LinkedIn profile pages that use interop-iframe with Shadow DOM
     */
    scanShadowDOMContent() {
        let addedCount = 0;

        // Check for the preload iframe used on profile pages
        const preloadIframe = this.findPreloadIframe();
        if (preloadIframe) {
            console.log('[AI Comment] 🔍 Found preload iframe, scanning Shadow DOM content...');
            try {
                const iframeDoc = preloadIframe.contentDocument || preloadIframe.contentWindow?.document;
                if (iframeDoc) {
                    // Scan inside the iframe document for comment elements
                    addedCount += this.scanElementForComments(iframeDoc);

                    // Check for shadow roots inside the iframe
                    const scanShadowInIframe = (element) => {
                        if (element.shadowRoot) {
                            addedCount += this.scanElementForComments(element.shadowRoot);
                        }
                        // Recursively check children
                        if (element.children) {
                            Array.from(element.children).forEach(child => scanShadowInIframe(child));
                        }
                    };
                    scanShadowInIframe(iframeDoc);
                }
            } catch (e) {
                console.log('[AI Comment] Could not access iframe content:', e.message);
            }
        }

        // Also scan for Shadow DOM in the main document
        const scanDocumentShadowDOM = (element) => {
            if (element.shadowRoot) {
                addedCount += this.scanElementForComments(element.shadowRoot);
            }
            if (element.children) {
                Array.from(element.children).forEach(child => scanDocumentShadowDOM(child));
            }
        };

        // Check document.body for shadow roots
        if (document.body) {
            Array.from(document.body.children).forEach(child => scanDocumentShadowDOM(child));
        }

        // Also check for any open shadow DOMs in iframes
        const allIframes = document.querySelectorAll('iframe');
        for (const iframe of allIframes) {
            try {
                if (iframe.contentDocument) {
                    const scanIframeShadow = (element) => {
                        if (element.shadowRoot) {
                            addedCount += this.scanElementForComments(element.shadowRoot);
                        }
                        if (element.children) {
                            Array.from(element.children).forEach(child => scanIframeShadow(child));
                        }
                    };
                    Array.from(iframe.contentDocument.children).forEach(child => scanIframeShadow(child));
                }
            } catch (e) {
                // Cross-origin iframe - skip
            }
        }

        return addedCount;
    }

    /**
     * Scan a specific element (or shadow root) for comment-related elements
     * @param {Element} container - The element or shadowRoot to scan
     * @returns {number} - Number of buttons added
     */
    scanElementForComments(container) {
        let addedCount = 0;

        // Find emoji buttons in this container
        const emojiBtns = container.querySelectorAll(
            'button[aria-label*="emoji" i], button[aria-label*="Emoji"], button[aria-label*="Show Emoji Picker"]'
        );

        emojiBtns.forEach(btn => {
            const iconContainer = btn.parentElement;
            if (!iconContainer || iconContainer.querySelector('.ai-comment-btn')) return;

            let postElement = this.findPostElement(iconContainer);
            this.addSuggestButton(postElement, iconContainer);
            addedCount++;
        });

        // Find comment forms in this container
        const commentForms = container.querySelectorAll('.comments-comment-box__form, .comments-comment-box, form[class*="comment"]');

        commentForms.forEach(form => {
            const toolbar = form.querySelector('.display-flex, .comments-comment-box__detour-container, [data-test-id="comment-box-toolbar"]');
            if (toolbar && !toolbar.querySelector('.ai-comment-btn')) {
                let postElement = this.findPostElement(toolbar);
                this.addSuggestButton(postElement, toolbar);
                addedCount++;
            }
        });

        return addedCount;
    }

    /**
     * Find the post element using robust fallback chain
     */
    findPostElement(iconContainer) {
        // Try main selectors first
        let postElement = iconContainer.closest('.feed-shared-update-v2')
            || iconContainer.closest('[data-urn^="urn:li:activity:"]')
            || iconContainer.closest('[data-view-name="feed-full-update"]')  // NEW: 2025 LinkedIn UI
            || iconContainer.closest('[data-view-name="feed-update"]')  // NEW: 2024+ LinkedIn UI
            || iconContainer.closest('.update-components-actor')?.closest('div')
            || iconContainer.closest('.update-v2-social-activity')?.closest('.feed-shared-update-v2')  // NEW: 2025 UI - go through social activity
            || iconContainer.closest('.social-details-social-counts')?.closest('.feed-shared-update-v2');  // NEW: 2025 UI - go through social counts

        if (!postElement) {
            // Fallback: traverse up the DOM looking for data-id or LI or data-view-name
            let curr = iconContainer;
            let levels = 0;
            while (curr && levels < 20) {  // Increased from 15 to 20 for deeper nesting
                if (curr.hasAttribute('data-id') || curr.hasAttribute('data-urn') ||
                    curr.tagName === 'LI' || curr.hasAttribute('data-view-name')) {
                    postElement = curr;
                    break;
                }
                curr = curr.parentElement;
                levels++;
            }
        }

        if (!postElement) {
            postElement = iconContainer.closest('div[class*="feed-shared"]') || document.body;
        }

        return postElement;
    }

    /**
     * Extract post text from LinkedIn's DOM structure using robust fallback selectors
     */
    extractPostText(postElement, iconContainer = null) {
        let text = '';

        // Try custom selector first (from Having Issues wizard)
        if (this.customDomSelectors && this.customDomSelectors.postContent && postElement && postElement !== document.body) {
            try {
                const customEl = postElement.querySelector(this.customDomSelectors.postContent);
                if (customEl && customEl.textContent.trim().length > 0) {
                    let customText = customEl.textContent
                        .replace(/…\s*more/gi, '')
                        .replace(/\.\.\.\s*more/gi, '')
                        .trim()
                        .replaceAll('hashtag#', '#');
                    if (customText.length > 0) return customText;
                }
            } catch (e) {
                console.warn('[AI Comment] Custom postContent selector failed:', e);
            }
        }

        // Create an array of possible roots to search from
        const rootsToSearch = [];
        if (postElement && postElement !== document.body) rootsToSearch.push(postElement);

        // If we have an icon container, its closest post wrapper is a great place to look
        if (iconContainer) {
            const wrapper = iconContainer.closest('.feed-shared-update-v2')
                || iconContainer.closest('[data-urn^="urn:li:activity:"]')
                || iconContainer.closest('[data-view-name="feed-update"]')
                || iconContainer.closest('[data-view-name="feed-full-update"]')  // NEW: 2025 LinkedIn UI
                || iconContainer.closest('li')
                || iconContainer.closest('div[data-id]');
            if (wrapper && !rootsToSearch.includes(wrapper)) {
                rootsToSearch.push(wrapper);
            }
        }

        if (rootsToSearch.length === 0) return '';

        for (const root of rootsToSearch) {
            // Try new commentary block first (2024+ LinkedIn UI)
            const newCommentaryElement = root.querySelector('[data-testid="expandable-text-box"]')
                || root.querySelector('[data-view-name="feed-commentary"]')
                || root.querySelector('p[data-view-name="feed-commentary"]')  // NEW: 2025 UI
                || root.querySelector('.f20698cc[data-view-name]')  // NEW: 2025 UI - main content wrapper
                || root.querySelector('[data-view-name*="commentary"]')  // NEW: Any element with commentary in view-name
                || root.querySelector('p.componentkey');  // NEW: 2025 UI - p with componentkey
            if (newCommentaryElement && newCommentaryElement.textContent.trim().length > 0) {
                text = newCommentaryElement.textContent;
            } else {
                // FALLBACK: Traditional elements
                const traditionalElements = root.querySelectorAll('.feed-shared-update-v2__description span[dir="ltr"]');
                if (traditionalElements.length > 0) {
                    traditionalElements.forEach(el => {
                        text += el.textContent + ' ';
                    });
                } else {
                    // FALLBACK: Another variation
                    const textWrapper = root.querySelector('.update-components-text span[dir="ltr"]')
                        || root.querySelector('[data-update-actor-name] ~ div span[dir="ltr"]');
                    if (textWrapper) {
                        text = textWrapper.textContent;
                    } else {
                        // FALLBACK: Generic ltr spans, excluding comment boxes
                        const ltrSpans = root.querySelectorAll('span[dir="ltr"]');
                        for (const span of ltrSpans) {
                            if (span.textContent.trim().length > 10
                                && !span.closest('[data-view-name="comment-box"], .comments-comment-box__form')) {
                                text += span.textContent + ' ';
                            }
                        }
                    }
                }
            }

            if (!text.trim()) {
                const altText = root.querySelector('.break-words');
                if (altText) text = altText.textContent;
            }

            if (text.trim()) break; // We found the text!
        }

        // Clean up "... more" truncation markers
        let cleanedText = text.replace(/…\s*more/gi, '');
        cleanedText = cleanedText.replace(/\.\.\.\s*more/gi, '');

        return cleanedText.trim().replaceAll("hashtag#", "#");
    }

    /**
     * Extract poster name from LinkedIn's DOM structure using robust fallback selectors
     */
    extractPosterName(postElement) {
        if (!postElement || postElement === document.body) return null;
        try {
            // Try custom selector first (from Having Issues wizard)
            if (this.customDomSelectors && this.customDomSelectors.authorName) {
                try {
                    const customEl = postElement.querySelector(this.customDomSelectors.authorName);
                    if (customEl) {
                        let name = customEl.textContent?.trim().replace(/<!---->/g, '').trim();
                        if (name && name.length > 0) return name;
                    }
                } catch (e) {
                    console.warn('[AI Comment] Custom authorName selector failed:', e);
                }
            }

            // FALLBACK: Array of name selectors tried in order
            const nameSelectors = [
                // NEW: 2025 LinkedIn UI selectors - most specific first
                '.update-components-actor__title span[dir="ltr"] span[aria-hidden="true"]',  // 2025 UI structure
                '.update-components-actor__single-line-truncate span[dir="ltr"] span[aria-hidden="true"]',
                '.update-components-actor__name span[aria-hidden="true"]',
                '.update-components-actor__name',
                '.feed-shared-actor__name span[aria-hidden="true"]',
                '.feed-shared-actor__name',
                '.feed-shared-actor__title',
                '[data-test-update-actor-title]',
                // NEW: 2025 LinkedIn UI selectors based on provided page structure
                '[data-view-name="feed-header-text"] strong',  // <strong> inside feed-header-text
                'div[data-view-name*="feed-actor"] p strong',  // Any feed actor div with p > strong
                'p.f08c4b93 strong',  // Direct class pattern from page structure
                '[data-view-name="feed-actor-image"] + div p strong'  // Image link + div > p > strong
            ];

            for (const selector of nameSelectors) {
                const nameElement = postElement.querySelector(selector);
                if (nameElement) {
                    let name = nameElement.textContent?.trim() || '';
                    name = name.replace(/<!---->/g, '').trim();
                    if (name && name.length > 0) return name;
                }
            }

            // NEW: Fallback - extract from aria-label on author link (2025 LinkedIn UI)
            // Example: aria-label="View: Ankit Kumar Verified • Following..."
            const authorLink = postElement.querySelector('a[aria-label^="View:"]');
            if (authorLink) {
                const ariaLabel = authorLink.getAttribute('aria-label') || '';
                const match = ariaLabel.match(/^View:\s*([^\s]+)/);
                if (match && match[1]) {
                    return match[1];
                }
            }

            return null;
        } catch (error) {
            console.error('[AI Comment] Error extracting poster name:', error);
            return null;
        }
    }

    /**
     * Extract existing comment text from the comment field
     */
    extractExistingCommentText(postElement, iconContainer = null) {
        try {
            let containerForSearch = postElement;
            if (iconContainer) {
                let wrapper = iconContainer.closest('.comments-comment-box__form')
                    || iconContainer.closest('form')
                    || iconContainer.parentElement;
                if (wrapper) containerForSearch = wrapper;
            }

            if (!containerForSearch || containerForSearch === document.body) return null;

            let prosemirrorEditor = containerForSearch.querySelector('.ProseMirror, [contenteditable="true"]');
            if (!prosemirrorEditor) {
                let curr = containerForSearch;
                let levels = 0;
                while (!prosemirrorEditor && curr && levels < 5) {
                    curr = curr.parentElement;
                    if (curr) prosemirrorEditor = curr.querySelector('.ProseMirror, [contenteditable="true"]');
                    levels++;
                }
            }
            if (prosemirrorEditor) {
                const text = prosemirrorEditor.textContent?.trim();
                if (text && text.length > 0
                    && !text.toLowerCase().includes('add a comment')
                    && !text.toLowerCase().includes('aggiungi un commento')
                    && !text.toLowerCase().includes('ajouter un commentaire')) {
                    return text;
                }
            }
            return null;
        } catch (e) {
            console.warn('[AI Comment] Error extracting existing comment text:', e);
            return null;
        }
    }

    /**
     * Get the appropriate document to create elements in (handles Shadow DOM)
     * @param {Element} element - An element from which to determine the document context
     * @returns {Document} - The document to use for creating elements
     */
    getElementDocument(element) {
        if (!element) return document;

        // Check if element is inside Shadow DOM
        let current = element;
        while (current) {
            if (current.shadowRoot) {
                // Element is in a shadow root, use that document
                return current.ownerDocument;
            }
            current = current.parentElement;
        }

        return document;
    }

    /**
     * Check if an element is inside Shadow DOM
     * @param {Element} element - The element to check
     * @returns {boolean}
     */
    isInShadowDOM(element) {
        let current = element;
        while (current) {
            if (current.shadowRoot) {
                return true;
            }
            current = current.parentElement;
        }
        return false;
    }

    /**
     * Add AI button to the comment box toolbar using robust fallback selectors
     * This is the main entry point for adding buttons to comment boxes
     * Now supports Shadow DOM for LinkedIn profile pages
     */
    addSuggestButton(postElement, providedIconContainer = null) {
        // Check if button already exists
        if (providedIconContainer && providedIconContainer.querySelector('.ai-comment-btn')) {
            return;
        }

        if (!providedIconContainer && postElement && postElement !== document.body
            && postElement.querySelector('.ai-comment-btn')) {
            return;
        }

        let iconContainer = providedIconContainer;

        // FALLBACK: Find icon container if not provided
        if (!iconContainer && postElement && postElement !== document.body) {
            // Try these selectors in order:
            iconContainer = postElement.querySelector('.comments-comment-box__detour-container');

            if (!iconContainer) {
                const emojiBtn = postElement.querySelector('button[aria-label*="emoji" i], button[aria-label*="Emoji"]');
                if (emojiBtn) iconContainer = emojiBtn.parentElement;
            }
            if (!iconContainer) {
                const photoBtn = postElement.querySelector('button[aria-label*="photo" i], button[aria-label*="image" i]');
                if (photoBtn) iconContainer = photoBtn.parentElement;
            }
            if (!iconContainer) {
                const testElement = postElement.querySelector('[data-test-id*="comment"], [data-test*="comment-box"]');
                if (testElement) {
                    const btns = testElement.querySelectorAll('button');
                    if (btns.length > 0) iconContainer = btns[0].parentElement;
                }
            }
        }

        if (!iconContainer) {
            console.log('[AI Comment] ❌ Could not find icon container for this post', { postElement: !!postElement });
            return;
        }

        console.log('[AI Comment] ✅ Found icon container, adding button', {
            inShadowDOM: this.isInShadowDOM(iconContainer)
        });

        // Ensure iconContainer doesn't wrap and elements stay in a single row
        iconContainer.style.display = 'flex';
        iconContainer.style.flexDirection = 'row';
        iconContainer.style.flexWrap = 'nowrap';
        iconContainer.style.alignItems = 'center';

        // Get the correct document for creating elements (handles Shadow DOM)
        const targetDocument = this.getElementDocument(iconContainer);

        // Create our circular icon button matching LinkedIn's native style
        // Use the correct document to create the element
        const aiBtn = targetDocument.createElement('button');
        aiBtn.className = 'ai-comment-btn comments-comment-box__detour-icons artdeco-button artdeco-button--circle artdeco-button--muted artdeco-button--2 artdeco-button--tertiary';
        aiBtn.type = 'button';
        aiBtn.setAttribute('aria-label', 'Generate AI Comment with Kommentify');
        aiBtn.title = 'Kommentify - AI Comment Suggestions';

        // Try to get the logo URL, fallback to emoji if not available
        let logoUrl = '';
        try {
            logoUrl = chrome.runtime.getURL ? chrome.runtime.getURL('assets/kom-logo.jpeg') : '';
        } catch (e) {
            console.log('[AI Comment] Could not get logo URL, using fallback');
        }

        // Kommentify logo icon with white background
        // Using inline SVG as primary (more reliable) with image as fallback
        aiBtn.innerHTML = `
            <span class="artdeco-button__icon" style="display: flex; align-items: center; justify-content: center; background: white; border-radius: 50%; width: 24px; height: 24px; padding: 2px; box-sizing: border-box;">
                ${logoUrl ? `<img src="${logoUrl}" alt="K" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" style="width: 20px; height: 20px; object-fit: contain; border-radius: 50%;" /><span style="display:none;width:16px;height:16px;background:linear-gradient(135deg, #693fe9, #7c4dff);border-radius:50%;color:white;font-size:10px;font-weight:bold;align-items:center;justify-content:center;">K</span>` : `<span style="display:flex;width:16px;height:16px;background:linear-gradient(135deg, #693fe9, #7c4dff);border-radius:50%;color:white;font-size:10px;font-weight:bold;align-items:center;justify-content:center;">K</span>`}
            </span>
            <span class="artdeco-button__text"></span>
        `;

        console.log('[AI Comment] Button created with logo URL:', logoUrl || '(fallback)');

        // Style it to match LinkedIn's native circular buttons
        aiBtn.style.cssText = `
            width: 32px !important;
            height: 32px !important;
            min-width: 32px !important;
            border-radius: 50% !important;
            background-color: transparent !important;
            border: none !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            cursor: pointer !important;
            margin-right: 4px !important;
            transition: background-color 0.2s ease !important;
            line-height: 1 !important;
            padding: 0 !important;
            overflow: hidden !important;
        `;

        // Add the native grey hover effect
        aiBtn.addEventListener('mouseenter', () => aiBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.08)');
        aiBtn.addEventListener('mouseleave', () => aiBtn.style.backgroundColor = 'transparent');

        // Click handler - generate AI comment
        aiBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await this.handleAIButtonClickFromSuggest(postElement, iconContainer, aiBtn);
        });

        // Insert our button at the beginning of that toolbar row
        const firstButton = iconContainer.querySelector('button');
        if (firstButton) {
            iconContainer.insertBefore(aiBtn, firstButton);
        } else {
            iconContainer.appendChild(aiBtn);
        }

        console.log('[AI Comment] Added AI button to comment box toolbar');
    }

    /**
     * Handle AI button click - extract post data and generate comment
     * This is called from the suggest button (new approach)
     */
    async handleAIButtonClickFromSuggest(postElement, iconContainer, aiBtn) {
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
        const originalHTML = aiBtn.innerHTML;
        aiBtn.innerHTML = '<span>⏳</span>';
        aiBtn.style.opacity = '0.7';
        aiBtn.disabled = true;
        aiBtn.style.pointerEvents = 'none';

        // Safety timeout: reset button after 95s no matter what
        const safetyTimer = setTimeout(() => {
            if (aiBtn.innerHTML.includes('⏳')) {
                console.warn('[AI Comment] Safety timeout reached (95s), resetting button');
                aiBtn.innerHTML = originalHTML;
                aiBtn.style.opacity = '1';
                aiBtn.disabled = false;
                aiBtn.style.pointerEvents = 'auto';
                this.isGenerating = false;
            }
        }, 95000);

        try {
            // Extract post data using the robust extractors
            console.log('═══════════════════════════════════════════════════════════════');
            console.log('[AI Comment] 🔍 EXTRACTING POST DATA');
            console.log('═══════════════════════════════════════════════════════════════');

            const postText = this.extractPostText(postElement, iconContainer);
            const posterName = this.extractPosterName(postElement);
            const existingCommentText = this.extractExistingCommentText(postElement, iconContainer);

            console.log('[AI Comment] 👤 POSTER NAME:');
            console.log('   ', posterName || '(not found)');

            console.log('[AI Comment] 📄 POST TEXT:');
            console.log('   Length:', postText?.length || 0);
            console.log('   Content:', postText?.substring(0, 300) + (postText?.length > 300 ? '\n   ...(truncated)' : ''));

            console.log('[AI Comment] 💬 EXISTING COMMENT:');
            console.log('   ', existingCommentText || '(none)');

            console.log('[AI Comment] 🎯 POST ELEMENT FOUND:', !!postElement);
            console.log('═══════════════════════════════════════════════════════════════');

            if (!postText && !existingCommentText) {
                console.error('[AI Comment] ❌ Could not extract post context!');
                throw new Error('Could not extract post context. Please try again.');
            }

            const selectedPostText = postText || '[No specific post text detected]';

            // Get user settings
            const settings = await this.getUserSettings();
            console.log('[AI Comment] ⚙️ Settings loaded:', {
                goal: settings.goal,
                tone: settings.tone,
                length: settings.length,
                style: settings.style,
                aiAutoPost: settings.aiAutoPost
            });

            // Check if auto-decide is enabled
            const isAutoDecide = settings.autoDecideEnabled === true || settings.autoDecideEnabled === 'true';
            let finalSettings = { ...settings };
            let autoDecideReasoning = '';

            // If auto-decide is enabled, call the auto-decide API first
            if (isAutoDecide) {
                console.log('[AI Comment] Auto-decide is ON, calling auto-decide API...');
                try {
                    const autoDecideResult = await this.sendMessageToBackground('autoDecideComment', {
                        authorName: posterName,
                        postText: selectedPostText,
                        model: settings.model || 'gpt-4o-mini'
                    });

                    if (autoDecideResult && autoDecideResult.success && autoDecideResult.settings) {
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

            // Show settings notification
            this.showSettingsNotification(finalSettings, isAutoDecide ? 'auto-decide' : 'manual', autoDecideReasoning);

            // Generate AI comment
            const postData = {
                authorName: posterName || 'there',
                postText: selectedPostText
            };

            console.log('[AI Comment] Calling generateComment with settings:', finalSettings);
            const comment = await this.generateComment(postData, finalSettings);
            console.log('[AI Comment] Got comment response:', comment ? comment.substring(0, 80) + '...' : 'NULL');

            if (comment) {
                // Find the comment input and fill it
                const commentInput = this.findCommentInput(iconContainer, postElement);

                if (commentInput) {
                    commentInput.focus();
                    commentInput.innerHTML = `<p>${comment}</p>`;

                    // Trigger input event
                    commentInput.dispatchEvent(new Event('input', { bubbles: true }));
                    commentInput.dispatchEvent(new Event('change', { bubbles: true }));

                    console.log('[AI Comment] Comment filled in input box');

                    // Check if manual review mode
                    if (settings.aiAutoPost === 'manual') {
                        aiBtn.innerHTML = '✅';
                        aiBtn.style.setProperty('color', 'black', 'important');
                    } else {
                        // Auto-post mode - find and click submit button
                        setTimeout(() => {
                            this.submitComment(iconContainer, postElement);
                        }, 500);
                        aiBtn.innerHTML = '✅';
                        aiBtn.style.setProperty('color', 'black', 'important');
                    }
                } else {
                    console.warn('[AI Comment] Could not find comment input, copying to clipboard');
                    await navigator.clipboard.writeText(comment);
                    alert('Comment copied to clipboard! Paste it in the comment box.');
                    aiBtn.innerHTML = '📋';
                }

                clearTimeout(safetyTimer);
                setTimeout(() => {
                    aiBtn.innerHTML = originalHTML;
                    aiBtn.style.opacity = '1';
                    aiBtn.disabled = false;
                    aiBtn.style.pointerEvents = 'auto';
                }, 2000);
            } else {
                throw new Error('No comment generated (null response)');
            }
        } catch (error) {
            console.error('[AI Comment] Error:', error);
            this.showErrorNotification(error.message || 'Failed to generate comment. Please try again.');
            aiBtn.innerHTML = '❌';
            clearTimeout(safetyTimer);
            setTimeout(() => {
                aiBtn.innerHTML = originalHTML;
                aiBtn.style.opacity = '1';
                aiBtn.disabled = false;
                aiBtn.style.pointerEvents = 'auto';
            }, 2000);
        } finally {
            this.isGenerating = false;
        }
    }

    /**
     * Find the comment input element using robust selectors
     */
    findCommentInput(iconContainer, postElement) {
        // First try near the icon container
        let container = iconContainer.closest('.comments-comment-box__form')
            || iconContainer.closest('form')
            || iconContainer.parentElement?.parentElement;

        if (container) {
            const editor = container.querySelector('.ProseMirror, [contenteditable="true"]');
            if (editor) return editor;
        }

        // Fallback: search in post element
        if (postElement && postElement !== document.body) {
            const editor = postElement.querySelector('.ProseMirror, [contenteditable="true"]');
            if (editor) return editor;
        }

        // Global fallback
        return document.querySelector('.ProseMirror, [contenteditable="true"]');
    }

    /**
     * Submit the comment by clicking the submit button
     */
    submitComment(iconContainer, postElement) {
        let submitBtn = null;

        // Find the comment form
        const form = iconContainer.closest('.comments-comment-box__form')
            || iconContainer.closest('form')
            || iconContainer.parentElement?.parentElement?.parentElement;

        if (form) {
            submitBtn = form.querySelector('.comments-comment-box__submit-button, button[type="submit"].artdeco-button--primary, button.artdeco-button--primary');
        }

        if (submitBtn && !submitBtn.disabled) {
            submitBtn.click();
            console.log('[AI Comment] Comment auto-submitted!');
            // Increment daily comment count
            this.sendMessageToBackground('incrementDailyCount', { actionType: 'comment' })
                .catch(e => console.log('[AI Comment] Could not increment count'));
        }
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
            // Find the post container using editor (user's approach) - Updated with new selectors
            const post = editor.closest('[data-urn], [data-id], [data-view-name="feed-full-update"], [data-view-name="feed-update"]');

            if (!post) {
                // Fallback: traverse up the DOM
                let curr = editor;
                let levels = 0;
                while (curr && levels < 20) {
                    if (curr.hasAttribute('data-id') || curr.hasAttribute('data-urn') || curr.hasAttribute('data-view-name')) {
                        break;
                    }
                    curr = curr.parentElement;
                    levels++;
                }
                if (curr && curr !== document.body) {
                    post = curr;
                }
            }

            if (!post || post === document.body) {
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

                // Close settings notification immediately when comment is generated and filled
                setTimeout(() => {
                    const notification = document.getElementById('ai-settings-notification');
                    if (notification) {
                        notification.style.animation = 'slideOutRight 0.3s ease';
                        setTimeout(() => notification.remove(), 300);
                    }
                }, 500); // Brief 500ms delay to show user the notification appeared

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
     * Extract post data (author name, post text) - uses robust extractors
     */
    extractPostData(post) {
        // Use the robust extractors from this class
        const authorName = this.extractPosterName(post) || 'there';
        const postText = this.extractPostText(post) || '';

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
        // DETAILED LOGGING: Show what data is captured before sending to backend
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('[AI Comment] 📤 DATA CAPTURED FOR BACKEND');
        console.log('═══════════════════════════════════════════════════════════════');

        // Post Data
        console.log('[AI Comment] 📝 POST DATA:');
        console.log('   authorName:', postData.authorName);
        console.log('   postText length:', postData.postText?.length || 0);
        console.log('   postText preview:', postData.postText?.substring(0, 200) + (postData.postText?.length > 200 ? '...' : ''));

        // Settings
        console.log('[AI Comment] ⚙️ SETTINGS:');
        console.log('   goal:', settings.goal);
        console.log('   tone:', settings.tone);
        console.log('   length:', settings.length);
        console.log('   style:', settings.style);
        console.log('   expertise:', settings.expertise || '(none)');
        console.log('   background:', settings.background || '(none)');
        console.log('   model:', settings.model);
        console.log('   aiAutoPost:', settings.aiAutoPost);
        console.log('   autoDecideEnabled:', settings.autoDecideEnabled);

        console.log('═══════════════════════════════════════════════════════════════');

        try {
            console.log('[AI Comment] 🚀 Sending request to background...');

            const requestPayload = {
                authorName: postData.authorName,
                postText: postData.postText,
                goal: settings.goal,
                tone: settings.tone,
                length: settings.length,
                style: settings.style,
                expertise: settings.expertise,
                background: settings.background,
                model: settings.model
            };

            console.log('[AI Comment] 📦 Request payload:', JSON.stringify(requestPayload, null, 2));

            const response = await this.sendMessageToBackground('generateAIComment', requestPayload);

            console.log('[AI Comment] 📥 Background response received:', JSON.stringify(response).substring(0, 500));

            if (response?.comment) {
                console.log('[AI Comment] ✅ Generated comment:', response.comment.substring(0, 100) + '...');
                return response.comment;
            }
            if (response?.content) {
                console.log('[AI Comment] ✅ Generated comment (content):', response.content.substring(0, 100) + '...');
                return response.content;
            }
            console.warn('[AI Comment] ⚠️ No comment in response, keys:', Object.keys(response || {}));
            return null;
        } catch (error) {
            console.error('[AI Comment] ❌ Failed to generate comment:', error);
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

        // Auto-close after 5 seconds
        setTimeout(() => {
            if (popup && popup.parentElement) {
                popup.style.animation = 'slideOutRight 0.3s ease forwards';
                setTimeout(() => {
                    if (popup && popup.parentElement) {
                        popup.remove();
                    }
                }, 300);
            }
        }, 5000);
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
