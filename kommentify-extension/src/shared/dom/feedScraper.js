
import { waitUntil } from '../dom/waitUntil.js';
import { log } from '../utils/logger.js';

class FeedScraper {

    isCommentElement = (el) => !!el.closest('button.comment-button');
    isReplyElement = (el) => !!el.closest('button.reply');

    getPostText = (el) => this._getText(el, [".update-components-text"]);
    getPostUrn = (el) => this._getAttribute(el, ["[data-urn]"], "data-urn");
    getPostAuthorSeat = (el) => this._getSeat(el, ["a.update-components-actor__meta-link"]);
    getPostAuthor = (el) => this._getAuthorName(el);

    /**
     * [SIMPLIFIED FIX] A more direct way to find the input box for manual clicks.
     */
    async getInputBoxElement(clickedEl) {
        log('log', 'Searching for comment input box...');
        
        // Find the main container for the entire post or comment thread
        const container = clickedEl.closest('.feed-shared-update-v2, .social-details-base-comment-item');
        if (!container) {
            log('error', 'Could not find a parent container for the clicked button.');
            return null;
        }

        // Wait for the input box to appear *within that container*.
        const inputBox = await waitUntil.elementAppears('div[data-placeholder]', 3000, container);
        log(inputBox ? 'success' : 'error', `Input box ${inputBox ? 'found' : 'not found'}.`);
        return inputBox;
    }
    
    /**
     * Get the submit/post button for a comment
     */
    async getSubmitButton(inputBox) {
        log('log', 'Searching for submit button...');
        
        // Find the parent form/container
        const container = inputBox.closest('.comments-comment-box, .comments-comment-box-comment, .comment-form');
        if (!container) {
            log('warning', 'Could not find comment box container');
            // Try to find button in document
            const button = document.querySelector('button.comments-comment-box__submit-button:not(:disabled), button.comments-comment-box__submit-button--cr:not(:disabled)');
            log(button ? 'success' : 'error', `Submit button ${button ? 'found in document' : 'not found'}.`);
            return button;
        }

        // Wait for button to appear and become enabled
        const button = await waitUntil.elementAppears('button.comments-comment-box__submit-button:not(:disabled), button.comments-comment-box__submit-button--cr:not(:disabled)', 3000, container);
        log(button ? 'success' : 'error', `Submit button ${button ? 'found' : 'not found'}.`);
        return button;
    }
    
    // --- Helper & Private Methods --- //
    _getText = (el, selectors) => {
        const container = el.closest('[data-urn]');
        for (const selector of selectors) {
            const element = container?.querySelector(selector);
            if (element) return element.innerText.trim();
        }
        return null;
    }

    _getSeat = (el, selectors) => {
        const container = el.closest('[data-urn]');
        for (const selector of selectors) {
            const element = container?.querySelector(selector);
            if (element?.href) {
                const match = element.href.match(/\/(in|company)\/([^\/\?]+)/i);
                if (match) return decodeURIComponent(match[2]);
            }
        }
        return null;
    }
    
    _getAttribute = (el, selectors, attr) => {
        const element = el.closest(selectors.join(','));
        return element ? element.getAttribute(attr) : null;
    }

    /**
     * Get author's first name using robust multi-strategy approach
     */
    _getAuthorName = (el) => {
        console.log('🔍 SCRAPER: Starting author name extraction...');
        
        const container = el.closest('[data-urn]');
        if (!container) {
            console.warn('⚠️ SCRAPER: No post container found');
            return 'there';
        }

        // STRATEGY 1: aria-label patterns (Most Reliable)
        console.log('📋 SCRAPER: Trying Strategy 1 - aria-label extraction');
        const potentialLinks = container.querySelectorAll('a[aria-label]');
        console.log(`🔗 SCRAPER: Found ${potentialLinks.length} links with aria-label`);

        for (const link of potentialLinks) {
            const rawLabel = link.getAttribute('aria-label');
            if (!rawLabel) continue;

            // Try multiple aria-label patterns
            const patterns = [
                /^View\s+(.+?)['']s\s+profile/i,        // "View John's profile"
                /^View\s+(.+?)['']s/i,                   // "View John's"
                /^(.+?)['']s\s+profile/i,                // "John's profile"
                /^View\s+profile\s+for\s+(.+)/i,        // "View profile for John"
                /^(.+?)\s+\-\s+View\s+profile/i          // "John - View profile"
            ];

            for (const pattern of patterns) {
                const nameMatch = rawLabel.match(pattern);
                if (nameMatch && nameMatch[1]) {
                    const name = nameMatch[1].trim();
                    
                    // Validate it's a real name
                    const invalidTerms = ['comment', 'view', 'profile', 'linkedin', 'activity', 'post'];
                    const isValid = name.length > 1 && 
                                  !invalidTerms.some(term => name.toLowerCase().includes(term));
                    
                    if (isValid) {
                        const firstName = name.split(' ')[0];
                        console.log(`✅ SCRAPER: Author name extracted (aria-label): "${firstName}" from "${rawLabel}"`);
                        return firstName;
                    }
                }
            }
        }
        console.log('⚠️ SCRAPER: Strategy 1 failed - no valid aria-label match');

        // STRATEGY 2: Direct selector for author name container
        console.log('📋 SCRAPER: Trying Strategy 2 - Direct selectors');
        const directSelectors = [
            'div.update-components-actor__meta a span span:nth-child(1) span span:nth-child(1)',
            '.update-components-actor__name span[aria-hidden="true"]',
            '.update-components-actor__title',
            '.feed-shared-actor__name',
            '.feed-shared-actor__title',
            '[data-test-id="actor-name"]'
        ];

        for (const selector of directSelectors) {
            const element = container.querySelector(selector);
            if (element) {
                const text = element.textContent?.trim();
                if (text && text.length > 1 && !text.includes('\n')) {
                    const firstName = text.split(' ')[0];
                    console.log(`✅ SCRAPER: Author name extracted (direct selector): "${firstName}" using "${selector}"`);
                    return firstName;
                }
            }
        }
        console.log('⚠️ SCRAPER: Strategy 2 failed - no direct selector match');

        // STRATEGY 3: Find by relationship (author container -> name element)
        console.log('📋 SCRAPER: Trying Strategy 3 - Relationship-based search');
        const actorContainers = container.querySelectorAll('[class*="actor"], [class*="author"]');
        console.log(`👤 SCRAPER: Found ${actorContainers.length} potential actor containers`);
        
        for (const actorContainer of actorContainers) {
            const spans = actorContainer.querySelectorAll('span[aria-hidden="true"]');
            for (const span of spans) {
                const text = span.textContent?.trim();
                // Name-like text: 2-50 chars, no newlines, starts with capital
                if (text && text.length >= 2 && text.length < 50 && 
                    !text.includes('\n') && /^[A-Z]/.test(text)) {
                    const firstName = text.split(' ')[0];
                    console.log(`✅ SCRAPER: Author name extracted (relationship): "${firstName}"`);
                    return firstName;
                }
            }
        }
        console.log('⚠️ SCRAPER: Strategy 3 failed - no relationship match');

        // STRATEGY 4: Broad search for any name-like text near top of post
        console.log('📋 SCRAPER: Trying Strategy 4 - Broad search');
        const allSpans = container.querySelectorAll('span');
        const topSpans = Array.from(allSpans).slice(0, 20); // Check first 20 spans
        
        for (const span of topSpans) {
            const text = span.textContent?.trim();
            // Very strict validation for broad search
            if (text && text.length >= 2 && text.length < 30 && 
                /^[A-Z][a-z]+/.test(text) && // Starts with capital letter
                !text.includes('\n') &&
                !['View', 'Post', 'Share', 'Like', 'Comment', 'Send'].includes(text)) {
                const firstName = text.split(' ')[0];
                console.log(`⚠️ SCRAPER: Author name extracted (broad search): "${firstName}"`);
                return firstName;
            }
        }
        console.log('⚠️ SCRAPER: Strategy 4 failed - no broad match');

        console.warn('❌ SCRAPER: All strategies failed. Returning default "there"');
        console.log('🔍 SCRAPER: Debug - Post container classes:', container.className);
        return 'there';
    }
}

export const feedScraper = new FeedScraper();