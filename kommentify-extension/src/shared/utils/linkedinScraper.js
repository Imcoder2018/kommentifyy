/**
 * LinkedIn Post Data Scraper
 * Extracts post content and author information from LinkedIn DOM
 */

// Scrape post content from LinkedIn
export function scrapePostContent(postElement) {
    if (!postElement) {
        console.warn('⚠️ No post element provided for scraping');
        return '';
    }
    
    // Try multiple selectors for post content (LinkedIn changes these frequently)
    const selectors = [
        '.feed-shared-update-v2__description',
        '.feed-shared-text',
        '[data-test-id="main-feed-activity-card__commentary"]',
        '.update-components-text',
        '.feed-shared-inline-show-more-text',
        '[data-test-id="update-v2-social-activity"]'
    ];
    
    for (const selector of selectors) {
        const element = postElement.querySelector(selector);
        if (element) {
            // Get text content, excluding "see more" links
            let text = element.innerText?.trim() || '';
            
            // Clean up common artifacts
            text = text.replace(/\.\.\.\s*see more$/i, '');
            text = text.replace(/see translation$/i, '');
            
            if (text && text.length > 10) {
                console.log('✅ Post content scraped:', text.substring(0, 100) + '...');
                return text;
            }
        }
    }
    
    console.warn('⚠️ Could not scrape post content');
    return '';
}

// Scrape author name using multiple robust strategies
export function scrapeAuthorName(postElement) {
    console.log('🔍 SCRAPER: Starting author name extraction...');
    
    if (!postElement) {
        console.warn('⚠️ SCRAPER: No post element provided for author scraping');
        return 'there';
    }

    // STRATEGY 1: aria-label patterns (Most Reliable)
    console.log('📋 SCRAPER: Trying Strategy 1 - aria-label extraction');
    const potentialLinks = postElement.querySelectorAll('a[aria-label]');
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
                
                // Validate it's a real name (not empty, not too short, not common UI text)
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
        const element = postElement.querySelector(selector);
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
    const actorContainers = postElement.querySelectorAll('[class*="actor"], [class*="author"]');
    console.log(`👤 SCRAPER: Found ${actorContainers.length} potential actor containers`);
    
    for (const container of actorContainers) {
        // Look for spans with visible text that might be the name
        const spans = container.querySelectorAll('span[aria-hidden="true"]');
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
    const allSpans = postElement.querySelectorAll('span');
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
    console.log('🔍 SCRAPER: Debug - Post element classes:', postElement.className);
    return 'there';
}

// Scrape author profile URL (optional, for additional context)
export function scrapeAuthorProfileUrl(postElement) {
    if (!postElement) {
        return '';
    }
    
    const selectors = [
        '.update-components-actor__meta-link',
        '.feed-shared-actor__container-link',
        '[data-control-name="actor"]'
    ];
    
    for (const selector of selectors) {
        const element = postElement.querySelector(selector);
        if (element && element.href) {
            console.log('✅ Author profile URL scraped');
            return element.href;
        }
    }
    
    return '';
}

// Scrape complete post data
export function scrapePostData(postElement) {
    const data = {
        postText: scrapePostContent(postElement),
        authorName: scrapeAuthorName(postElement),
        authorProfileUrl: scrapeAuthorProfileUrl(postElement),
        timestamp: Date.now()
    };
    
    console.log('📊 Post data scraped:', {
        hasContent: !!data.postText,
        authorName: data.authorName,
        contentLength: data.postText.length
    });
    
    return data;
}

// Find the comment box in a post
export function findCommentBox(postElement) {
    if (!postElement) {
        return null;
    }
    
    // Try multiple selectors for comment box
    const selectors = [
        '.comments-comment-box-comment__text-editor div[aria-placeholder="Add a comment…"]',
        '.ql-editor[contenteditable="true"]',
        '[data-placeholder="Add a comment…"]',
        '[data-placeholder="Add a comment..."]',
        '.comments-comment-texteditor',
        '[role="textbox"][contenteditable="true"]'
    ];
    
    for (const selector of selectors) {
        const commentBox = postElement.querySelector(selector);
        if (commentBox) {
            console.log('✅ Comment box found');
            return commentBox;
        }
    }
    
    console.warn('⚠️ Could not find comment box');
    return null;
}

// Insert text into LinkedIn comment box
export function insertCommentText(commentText, postElement) {
    const commentBox = findCommentBox(postElement);
    
    if (!commentBox) {
        console.warn('⚠️ Cannot insert comment - no comment box found');
        return false;
    }
    
    try {
        // Focus the comment box
        commentBox.focus();
        
        // Clear existing content
        commentBox.innerText = '';
        
        // Insert new text
        commentBox.innerText = commentText;
        
        // Trigger input event so LinkedIn recognizes the change
        const inputEvent = new Event('input', { bubbles: true, cancelable: true });
        commentBox.dispatchEvent(inputEvent);
        
        // Also trigger change event
        const changeEvent = new Event('change', { bubbles: true, cancelable: true });
        commentBox.dispatchEvent(changeEvent);
        
        console.log('✅ Comment text inserted successfully');
        return true;
        
    } catch (error) {
        console.error('❌ Error inserting comment:', error);
        return false;
    }
}

// Validate post element is valid LinkedIn post
export function isValidPostElement(element) {
    if (!element) return false;
    
    // Check if element has post-like attributes
    const hasPostClass = element.classList.contains('feed-shared-update-v2') ||
                        element.classList.contains('feed-shared-update');
    
    const hasDataUrn = element.hasAttribute('data-urn') || 
                       element.hasAttribute('data-id');
    
    return hasPostClass || hasDataUrn;
}
