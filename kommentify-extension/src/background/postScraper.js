/**
 * POST SCRAPER
 * Scrapes post content, author, and hashtags from LinkedIn posts
 */

export const scrapePostContent = async () => {
    const _delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    try {
        console.log("POST SCRAPER: Starting to scrape post content");
        
        // Wait for content to load
        await _delay(1500);
        
        // Scrape post text
        let postText = '';
        const textContainer = document.querySelector('div.feed-shared-update-v2__control-menu-container div.update-components-text');
        if (textContainer) {
            const spans = textContainer.querySelectorAll('span');
            postText = Array.from(spans).map(span => span.textContent).join(' ').trim();
            console.log("POST SCRAPER: Found post text:", postText.substring(0, 100) + "...");
        }
        
        // Scrape author name using multiple strategies
        let authorName = '';
        console.log('🔍 POST SCRAPER: Starting author name extraction...');
        
        // Get the main post element
        const postElement = document.querySelector('[data-urn], .feed-shared-update-v2, .feed-shared-update');
        
        if (postElement) {
            // STRATEGY 1: aria-label patterns
            const potentialLinks = postElement.querySelectorAll('a[aria-label]');
            console.log(`🔗 POST SCRAPER: Found ${potentialLinks.length} links with aria-label`);
            
            for (const link of potentialLinks) {
                const rawLabel = link.getAttribute('aria-label');
                if (!rawLabel) continue;
                
                const patterns = [
                    /^View\s+(.+?)['']s\s+profile/i,
                    /^View\s+(.+?)['']s/i,
                    /^(.+?)['']s\s+profile/i
                ];
                
                for (const pattern of patterns) {
                    const match = rawLabel.match(pattern);
                    if (match && match[1]) {
                        const name = match[1].trim();
                        const invalidTerms = ['comment', 'view', 'profile', 'linkedin'];
                        if (name.length > 1 && !invalidTerms.some(t => name.toLowerCase().includes(t))) {
                            authorName = name.split(' ')[0];
                            console.log(`✅ POST SCRAPER: Author name found (aria-label): "${authorName}" from "${rawLabel}"`);
                            break;
                        }
                    }
                }
                if (authorName) break;
            }
            
            // STRATEGY 2: Direct selectors
            if (!authorName) {
                console.log('📋 POST SCRAPER: Trying direct selectors...');
                const selectors = [
                    'div.update-components-actor__meta a span span:nth-child(1) span span:nth-child(1)',
                    '.update-components-actor__name span[aria-hidden="true"]',
                    '.update-components-actor__title',
                    '.feed-shared-actor__name',
                    '.feed-shared-actor__title'
                ];
                
                for (const selector of selectors) {
                    const el = postElement.querySelector(selector);
                    if (el) {
                        const text = el.textContent?.trim();
                        if (text && text.length > 1 && !text.includes('\n')) {
                            authorName = text.split(' ')[0];
                            console.log(`✅ POST SCRAPER: Author name found (selector): "${authorName}"`);
                            break;
                        }
                    }
                }
            }
            
            // STRATEGY 3: Relationship-based search
            if (!authorName) {
                console.log('📋 POST SCRAPER: Trying relationship search...');
                const actorContainers = postElement.querySelectorAll('[class*="actor"]');
                for (const container of actorContainers) {
                    const spans = container.querySelectorAll('span[aria-hidden="true"]');
                    for (const span of spans) {
                        const text = span.textContent?.trim();
                        if (text && text.length >= 2 && text.length < 50 && 
                            !text.includes('\n') && /^[A-Z]/.test(text)) {
                            authorName = text.split(' ')[0];
                            console.log(`✅ POST SCRAPER: Author name found (relationship): "${authorName}"`);
                            break;
                        }
                    }
                    if (authorName) break;
                }
            }
        }
        
        if (!authorName) {
            console.warn('❌ POST SCRAPER: Could not find author name, using fallback');
            authorName = 'there';
        }
        
        // Scrape hashtags
        const hashtags = [];
        const hashtagElements = document.querySelectorAll('a[href*="https://www.linkedin.com/search/results/all/?keywords="]');
        hashtagElements.forEach(el => {
            const hashtagText = el.textContent.trim();
            if (hashtagText.startsWith('#')) {
                hashtags.push(hashtagText);
            }
        });
        console.log("POST SCRAPER: Found hashtags:", hashtags);
        
        // Return scraped data
        return {
            success: true,
            postText: postText || 'No content found',
            authorName: authorName || 'Unknown',
            hashtags: hashtags
        };
        
    } catch (error) {
        console.error("POST SCRAPER: Error scraping post:", error);
        return {
            success: false,
            postText: 'Error scraping content',
            authorName: 'Unknown',
            hashtags: []
        };
    }
};
