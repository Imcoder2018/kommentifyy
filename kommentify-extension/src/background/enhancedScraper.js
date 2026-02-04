// Enhanced scraper with unlimited scrolling and human simulation
console.log("ENHANCED SCRAPER: Module loaded");

// Enhanced scraping function with unlimited scrolling until qualified posts found
async function scrapePostsFromSearchEnhanced(keyword, targetCount, qualification = {}, humanSimulation = {}) {
    console.log(`ENHANCED SCRAPER: Starting enhanced scraping for ${targetCount} QUALIFIED posts with keyword: "${keyword}"`);
    console.log(`ENHANCED SCRAPER: Qualification criteria - minLikes: ${qualification.minLikes || 0}, minComments: ${qualification.minComments || 0}`);
    
    const startTime = Date.now();
    const maxScrollTime = 10 * 60 * 1000; // 10 minutes max
    const scrollInterval = 2000; // 2 seconds between scrolls
    const noNewPostsTimeout = 90000; // 90 seconds without new posts
    
    let allPosts = []; // All scraped posts
    let qualifiedPosts = []; // Posts that meet criteria
    let lastPostCount = 0;
    let noNewPostsTimer = 0;
    let scrollAttempts = 0;
    let tabId = null;
    
    try {
        // Create search URL
        const searchUrl = `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(keyword)}&sortBy=date_posted`;
        console.log(`ENHANCED SCRAPER: Creating window/tab for URL: ${searchUrl}`);
        
        // Load automation preferences
        const prefsResult = await chrome.storage.local.get('automationPreferences');
        const automationPreferences = prefsResult.automationPreferences || { openSearchInWindow: true };
        const useWindow = automationPreferences.openSearchInWindow;
        
        console.log(`ENHANCED SCRAPER: Opening in ${useWindow ? 'window' : 'background tab'}`);
        
        if (useWindow) {
            // Get screen dimensions
            const screenWidth = 1920; // Default, will be overridden by actual screen
            const screenHeight = 1080;
            
            // Create a new window (left half of screen) for scraping
            const window = await chrome.windows.create({
                url: searchUrl,
                type: 'normal',
                state: 'normal',
                focused: false,
                left: 0,
                top: 0,
                width: Math.floor(screenWidth / 2),
                height: screenHeight
            });
            
            tabId = window.tabs[0].id;
            console.log(`ENHANCED SCRAPER: Created window with tab ${tabId}`);
        } else {
            // Create background tab
            const tab = await chrome.tabs.create({
                url: searchUrl,
                active: false
            });
            
            tabId = tab.id;
            console.log(`ENHANCED SCRAPER: Created background tab ${tabId}`);
        }
        
        // Wait for page to load
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // For background window processing - content should already be loaded
        console.log("ENHANCED SCRAPER: Starting scraping in background window");
        
        // Small wait to ensure scripts are ready
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Inject the scraping script into the page
        await chrome.scripting.executeScript({
            target: { tabId },
            func: initializeEnhancedScraper,
            args: [qualification, humanSimulation]
        });
        
        console.log("ENHANCED SCRAPER: Scraper initialized in page");
        
        // Start the scrolling and scraping loop - continue until we have enough QUALIFIED posts
        while (qualifiedPosts.length < targetCount && (Date.now() - startTime) < maxScrollTime) {
            // Check if stop signal was sent
            const storageCheck = await chrome.storage.local.get(['bulkProcessingActive']);
            if (storageCheck.bulkProcessingActive === false) {
                console.log('ENHANCED SCRAPER: Stop signal detected, halting scraper');
                try {
                    if (useWindow && tabId) {
                        const tab = await chrome.tabs.get(tabId);
                        if (tab && tab.windowId) {
                            await chrome.windows.remove(tab.windowId);
                        }
                    } else if (tabId) {
                        await chrome.tabs.remove(tabId);
                    }
                } catch (e) {
                    console.log('ENHANCED SCRAPER: Tab/window already closed');
                }
                return { posts: qualifiedPosts, stopped: true, message: 'Scraping stopped by user' };
            }
            
            scrollAttempts++;
            
            // Perform human-like scrolling and scraping
            console.log(`ENHANCED SCRAPER: Executing scroll attempt ${scrollAttempts}`);
            
            // First, test if we can execute a simple function
            try {
                const testResult = await chrome.scripting.executeScript({
                    target: { tabId },
                    func: () => {
                        console.log("TEST: Simple function executed successfully");
                        return { test: true, url: window.location.href, title: document.title };
                    }
                });
                console.log(`ENHANCED SCRAPER: Test result:`, testResult[0]?.result);
            } catch (testError) {
                console.error("ENHANCED SCRAPER: Test function failed:", testError);
            }
            
            let scrapedData = null;
            try {
                const result = await chrome.scripting.executeScript({
                    target: { tabId },
                    func: performEnhancedScroll,
                    args: [scrollAttempts, humanSimulation]
                });
                
                console.log(`ENHANCED SCRAPER: Scroll result:`, result[0]?.result);
                scrapedData = result[0]?.result;
                
                // Log debug info if available
                if (scrapedData?.debug) {
                    console.log(`ENHANCED SCRAPER: 🔍 DEBUG INFO:`, scrapedData.debug);
                    console.log(`ENHANCED SCRAPER: 📄 Page: ${scrapedData.debug.title}`);
                    console.log(`ENHANCED SCRAPER: 🔍 Selector: "${scrapedData.debug.selectorUsed}" found ${scrapedData.debug.elementsFound} elements`);
                    console.log(`ENHANCED SCRAPER: 📊 Total page elements: ${scrapedData.debug.totalElements}`);
                    console.log(`ENHANCED SCRAPER: 🔄 Processed: ${scrapedData.debug.processedElements} elements`);
                    console.log(`ENHANCED SCRAPER: ✅ Valid posts: ${scrapedData.debug.validPosts}`);
                    if (scrapedData.debug.processingErrors.length > 0) {
                        console.log(`ENHANCED SCRAPER: ❌ Issues:`, scrapedData.debug.processingErrors);
                    }
                    if (scrapedData.debug.postDetails && scrapedData.debug.postDetails.length > 0) {
                        console.log(`ENHANCED SCRAPER: 📋 Post Details:`);
                        scrapedData.debug.postDetails.forEach((post, index) => {
                            const status = post.qualified ? '✅' : '❌';
                            console.log(`  ${index + 1}. ${status} Post ${post.urn}: ${post.likes}L/${post.comments}C`);
                        });
                    }
                }
                
                if (!scrapedData) {
                    console.log("ENHANCED SCRAPER: No result from scroll execution, creating empty result");
                    scrapedData = { posts: [], scrollPosition: 0, totalHeight: 0, scrollAttempt: scrollAttempts };
                }
            } catch (error) {
                console.error("ENHANCED SCRAPER: Error executing scroll script:", error);
                scrapedData = { posts: [], scrollPosition: 0, totalHeight: 0, scrollAttempt: scrollAttempts };
            }
            
            // Wait for content to load after scrolling
            console.log("ENHANCED SCRAPER: Waiting for content to load...");
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Use debug data to track processed posts if available
            let processedPostsCount = 0;
            let validPostsCount = 0;
            
            if (scrapedData?.debug) {
                processedPostsCount = scrapedData.debug.processedElements || 0;
                validPostsCount = scrapedData.debug.validPosts || 0;
                
                // Use debug postDetails if available for more accurate tracking
                if (scrapedData.debug.postDetails && scrapedData.debug.postDetails.length > 0) {
                    const minLikes = qualification.minLikes || 0;
                    const minComments = qualification.minComments || 0;
                    
                    for (const postDetail of scrapedData.debug.postDetails) {
                        // Skip duplicates
                        if (allPosts.find(p => p.urn === postDetail.urn)) {
                            continue;
                        }
                        
                        // Create post object from debug data
                        const post = {
                            urn: postDetail.urn,
                            likes: postDetail.likes || 0,
                            comments: postDetail.comments || 0,
                            qualified: postDetail.qualified || false
                        };
                        
                        // Add to all posts
                        allPosts.push(post);
                        
                        // Check if qualified
                        if (post.qualified || (post.likes >= minLikes && post.comments >= minComments)) {
                            qualifiedPosts.push(post);
                            console.log(`✅ ENHANCED SCRAPER: QUALIFIED post ${post.urn} (${post.likes} likes, ${post.comments} comments)`);
                        } else {
                            console.log(`❌ ENHANCED SCRAPER: Rejected post ${post.urn} (${post.likes} likes, ${post.comments} comments) - needs ${minLikes}+ likes AND ${minComments}+ comments`);
                        }
                        
                        // Stop if we have enough qualified posts
                        if (qualifiedPosts.length >= targetCount) {
                            console.log(`ENHANCED SCRAPER: Found ${targetCount} qualified posts!`);
                            break;
                        }
                    }
                }
            }
            
            // Fallback to original posts data if no debug info
            if (scrapedData && scrapedData.posts && scrapedData.posts.length > 0) {
                // Add new unique posts and check qualification
                const minLikes = qualification.minLikes || 0;
                const minComments = qualification.minComments || 0;
                
                for (const post of scrapedData.posts) {
                    // Skip duplicates
                    if (allPosts.find(p => p.urn === post.urn)) {
                        continue;
                    }
                    
                    // Add to all posts
                    allPosts.push(post);
                    
                    // Check if post qualifies
                    const meetsLikes = post.likes >= minLikes;
                    const meetsComments = post.comments >= minComments;
                    const isQualified = meetsLikes && meetsComments;
                    
                    if (isQualified) {
                        qualifiedPosts.push(post);
                        console.log(`✅ ENHANCED SCRAPER: QUALIFIED post ${post.urn} (${post.likes} likes, ${post.comments} comments)`);
                    } else {
                        console.log(`❌ ENHANCED SCRAPER: Rejected post ${post.urn} (${post.likes} likes, ${post.comments} comments) - needs ${minLikes}+ likes AND ${minComments}+ comments`);
                    }
                    
                    // Stop if we have enough qualified posts
                    if (qualifiedPosts.length >= targetCount) {
                        console.log(`ENHANCED SCRAPER: Found ${targetCount} qualified posts!`);
                        break;
                    }
                }
            }
            
            // Check if we got new posts
            if (allPosts.length > lastPostCount) {
                lastPostCount = allPosts.length;
                noNewPostsTimer = 0;
            } else {
                noNewPostsTimer += scrollInterval;
            }
            
            console.log(`ENHANCED SCRAPER: Progress - ${qualifiedPosts.length}/${targetCount} qualified posts (${allPosts.length} total scraped, ${scrollAttempts} scrolls)`);
            
            // Update progress data in storage (since we're in background context)
            try {
                await chrome.storage.local.set({
                    automationProgressData: {
                        type: 'scraping',
                        data: {
                            postsScraped: allPosts.length,
                            postsSelected: qualifiedPosts.length,
                            targetPosts: targetCount,
                            scrollAttempts: scrollAttempts,
                            currentStep: `Scraping posts - ${qualifiedPosts.length}/${targetCount} qualified`
                        },
                        timestamp: Date.now()
                    }
                });
            } catch (e) {
                // Silent fail
            }
            
            // Break if we have enough qualified posts
            if (qualifiedPosts.length >= targetCount) {
                console.log("ENHANCED SCRAPER: Target qualified count reached!");
                break;
            }
            
            // Break if no new posts for 90 seconds
            if (noNewPostsTimer >= noNewPostsTimeout) {
                console.log(`ENHANCED SCRAPER: No new posts found for ${noNewPostsTimeout/1000} seconds, stopping`);
                console.log(`ENHANCED SCRAPER: Found ${qualifiedPosts.length}/${targetCount} qualified posts from ${allPosts.length} total posts`);
                break;
            }
            
            // Wait between scroll attempts
            await new Promise(resolve => setTimeout(resolve, scrollInterval));
            
            // Safety check - if we're not making progress at all, break
            if (scrollAttempts > 2000 && allPosts.length === 0) {
                console.log("ENHANCED SCRAPER: No posts found after 2000 attempts, stopping");
                break;
            }
        }
        
        console.log(`ENHANCED SCRAPER: Scraping completed!`);
        console.log(`ENHANCED SCRAPER: - Qualified posts: ${qualifiedPosts.length}/${targetCount}`);
        console.log(`ENHANCED SCRAPER: - Total posts scraped: ${allPosts.length}`);
        console.log(`ENHANCED SCRAPER: - Scroll attempts: ${scrollAttempts}`);
        console.log(`ENHANCED SCRAPER: - Time elapsed: ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
        
        // Close the window
        if (tabId) {
            try {
                const tab = await chrome.tabs.get(tabId);
                await chrome.windows.remove(tab.windowId);
                console.log(`ENHANCED SCRAPER: Closed window for tab ${tabId}`);
            } catch (e) {
                console.error(`ENHANCED SCRAPER: Error closing window for tab ${tabId}:`, e);
            }
        }
        
        // Return only the qualified posts
        return qualifiedPosts;
        
    } catch (error) {
        console.error("ENHANCED SCRAPER: Error during scraping:", error);
        
        // Close the window on error
        if (tabId) {
            try {
                const tab = await chrome.tabs.get(tabId);
                await chrome.windows.remove(tab.windowId);
                console.log(`ENHANCED SCRAPER: Closed window for tab ${tabId} after error`);
            } catch (e) {
                console.error(`ENHANCED SCRAPER: Error closing window for tab ${tabId}:`, e);
            }
        }
        
        return allPosts;
    }
}

// Helper function to extract number from text like "3 comments" or "5 reactions"
function extractNumberFromText(text) {
    if (!text) return 0;
    
    const cleaned = text.trim();
    
    // Handle "3 comments", "5 reactions", etc.
    const match = cleaned.match(/(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:comment|reaction|like|share)?s?/i);
    if (match) {
        return parseInt(match[1].replace(/,/g, ''), 10);
    }
    
    // Handle "1.2K", "5.3M" format
    const suffixMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*([KMB])/i);
    if (suffixMatch) {
        const num = parseFloat(suffixMatch[1]);
        const suffix = suffixMatch[2].toUpperCase();
        
        switch (suffix) {
            case 'K': return Math.floor(num * 1000);
            case 'M': return Math.floor(num * 1000000);
            case 'B': return Math.floor(num * 1000000000);
        }
    }
    
    // Handle plain numbers
    const plainMatch = cleaned.match(/(\d+)/);
    if (plainMatch) {
        return parseInt(plainMatch[1], 10);
    }
    
    return 0;
}

// Function to inject into the page for initialization
function initializeEnhancedScraper(qualification, humanSimulation) {
    console.log("PAGE SCRAPER: Initializing enhanced scraper");
    
    // Store configuration globally
    window.scraperConfig = {
        qualification,
        humanSimulation,
        processedUrns: new Set(),
        lastScrollPosition: 0
    };
    
    // Add human simulation styles if mouse movement is enabled
    if (humanSimulation.mouseMovement) {
        const style = document.createElement('style');
        style.textContent = `
            .human-cursor-path {
                position: absolute;
                width: 2px;
                height: 2px;
                background: rgba(255, 0, 0, 0.3);
                border-radius: 50%;
                pointer-events: none;
                z-index: 10000;
                transition: all 0.1s ease-out;
            }
        `;
        document.head.appendChild(style);
    }
    
    return { initialized: true };
}

// Function to inject into the page for scrolling and scraping
function performEnhancedScroll(scrollAttempt, humanSimulation) {
    try {
        console.log(`PAGE SCRAPER: performEnhancedScroll called with attempt ${scrollAttempt}`);
        
        const config = window.scraperConfig;
        if (!config) {
            console.error("PAGE SCRAPER: Configuration not found");
            return { posts: [], error: "Configuration not found" };
        }
    
    console.log(`PAGE SCRAPER: Performing scroll ${scrollAttempt}`);
    console.log(`PAGE SCRAPER: Current scroll position: ${window.pageYOffset}`);
    console.log(`PAGE SCRAPER: Document height: ${document.body.scrollHeight}`);
    
    // Force focus on window to ensure scrolling works
    window.focus();
    
    // Log to on-page logger if available
    if (window.logger && window.logger.log) {
        window.logger.log(`PAGE SCRAPER: Performing scroll ${scrollAttempt}`);
    }
    
    // Get current position before scrolling
    const beforeScroll = window.pageYOffset;
    
    // Human-like scrolling behavior
    if (humanSimulation.scrolling) {
        // Random scroll patterns
        const scrollTypes = ['smooth', 'auto'];
        const scrollType = scrollTypes[Math.floor(Math.random() * scrollTypes.length)];
        
        // Sometimes scroll up a bit (reading behavior)
        if (Math.random() < 0.3 && scrollAttempt > 3) {
            const upScroll = -200 - Math.random() * 300;
            console.log(`PAGE SCRAPER: Scrolling up ${Math.abs(upScroll)}px`);
            window.scrollBy({
                top: upScroll,
                behavior: scrollType
            });
            
            // Wait a bit then scroll down more
            setTimeout(() => {
                const downScroll = 1000 + Math.random() * 600;
                console.log(`PAGE SCRAPER: Scrolling down ${downScroll}px after reading pause`);
                window.scrollBy({
                    top: downScroll,
                    behavior: 'smooth'
                });
            }, 500 + Math.random() * 1000);
        } else {
            // Normal scroll down
            const scrollAmount = 800 + Math.random() * 400;
            console.log(`PAGE SCRAPER: Scrolling down ${scrollAmount}px`);
            window.scrollBy({
                top: scrollAmount,
                behavior: scrollType
            });
        }
    } else {
        // Simple scroll
        console.log(`PAGE SCRAPER: Simple scroll down 800px`);
        window.scrollBy(0, 800);
    }
    
    // Check if scroll actually happened and handle "Load more" button
    setTimeout(() => {
        const afterScroll = window.pageYOffset;
        const scrollDiff = afterScroll - beforeScroll;
        console.log(`PAGE SCRAPER: Scroll difference: ${scrollDiff}px`);
        
        if (Math.abs(scrollDiff) < 50) {
            console.log("PAGE SCRAPER: Warning - minimal scroll detected, may have reached bottom");
        }
        
        // Check for "Load more" button and click it if present
        const loadMoreButton = document.querySelector('button.scaffold-finite-scroll__load-button');
        if (loadMoreButton && !loadMoreButton.disabled) {
            console.log("PAGE SCRAPER: Found 'Load more' button, clicking it");
            try {
                loadMoreButton.click();
                console.log("PAGE SCRAPER: Successfully clicked 'Load more' button");
            } catch (error) {
                console.error("PAGE SCRAPER: Error clicking 'Load more' button:", error);
            }
        }
        
        // Trigger lazy loading events
        const events = ['scroll', 'resize', 'focus'];
        events.forEach(eventType => {
            const event = new Event(eventType, { bubbles: true });
            window.dispatchEvent(event);
            document.dispatchEvent(event);
        });
        
        // Also trigger on document body
        if (document.body) {
            document.body.dispatchEvent(new Event('scroll', { bubbles: true }));
        }
    }, 200);
    
    // Human reading pause
    if (humanSimulation.readingPause && Math.random() < 0.4) {
        const pauseTime = 1000 + Math.random() * 2000;
        console.log(`PAGE SCRAPER: Reading pause for ${pauseTime}ms`);
    }
    
    // Immediate scraping (we'll handle timing in the main loop)
    console.log('PAGE SCRAPER: Starting post scraping immediately');
    
    // Log to on-page logger if available
    if (window.logger && window.logger.log) {
        window.logger.log('PAGE SCRAPER: Starting post scraping');
    }
    
    // Scrape posts from current view (embedded function)
    const posts = (function scrapeVisiblePosts(qualification, processedUrns) {
        try {
            const posts = [];
            
            console.log('PAGE SCRAPER: Starting to scrape visible posts');
            console.log('PAGE SCRAPER: Current URL:', window.location.href);
            console.log('PAGE SCRAPER: Qualification criteria:', qualification);
        
            // Log to on-page logger if available
            if (window.logger && window.logger.log) {
                window.logger.log('PAGE SCRAPER: Starting to scrape visible posts');
                window.logger.log(`PAGE SCRAPER: URL: ${window.location.href}`);
                window.logger.log(`PAGE SCRAPER: Criteria: ${qualification.minLikes}+ likes, ${qualification.minComments}+ comments`);
            }
            
            // Use multiple selectors for both search results and feed pages
            const isFeedPage = window.location.href.includes('/feed');
            console.log(`PAGE SCRAPER: Is feed page: ${isFeedPage}`);
            
            // Log all potential container elements for debugging
            if (isFeedPage) {
                console.log('PAGE SCRAPER: FEED DEBUG - Checking for feed containers...');
                console.log('PAGE SCRAPER: .feed-shared-update-v2:', document.querySelectorAll('.feed-shared-update-v2').length);
                console.log('PAGE SCRAPER: [data-id*="activity"]:', document.querySelectorAll('[data-id*="activity"]').length);
                console.log('PAGE SCRAPER: .occludable-update:', document.querySelectorAll('.occludable-update').length);
                console.log('PAGE SCRAPER: div.feed-shared-update-v2__description-wrapper:', document.querySelectorAll('div.feed-shared-update-v2__description-wrapper').length);
                console.log('PAGE SCRAPER: div[data-urn]:', document.querySelectorAll('div[data-urn]').length);
                console.log('PAGE SCRAPER: .update-components-actor:', document.querySelectorAll('.update-components-actor').length);
                
                // Check main feed container
                const mainFeed = document.querySelector('.scaffold-finite-scroll__content') || 
                                 document.querySelector('.core-rail') ||
                                 document.querySelector('main');
                if (mainFeed) {
                    console.log('PAGE SCRAPER: Main feed container found, children:', mainFeed.children.length);
                }
            }
            
            const postSelectors = isFeedPage ? [
                // Feed page selectors - most specific first
                '.feed-shared-update-v2',
                'div[data-id*="urn:li:activity"]',
                '.occludable-update[data-id]',
                '.occludable-update',
                'div[data-urn*="urn:li:activity"]',
                'article[data-urn]',
                // Fallback - broader selectors
                '.scaffold-finite-scroll__content > div[data-id]',
                '.scaffold-finite-scroll__content > div'
            ] : [
                // Search page selectors
                'div[data-urn*="urn:li:activity"]'
            ];
            
            let postElements = [];
            let selectorUsed = '';
            
            // Try each selector and log results
            for (const selector of postSelectors) {
                const elements = document.querySelectorAll(selector);
                console.log(`PAGE SCRAPER: Selector "${selector}" found ${elements.length} elements`);
                
                // Extra debugging - check if elements are visible
                if (elements.length > 0) {
                    console.log(`PAGE SCRAPER: First element:`, elements[0]);
                    console.log(`PAGE SCRAPER: Element visible:`, elements[0].offsetHeight > 0);
                    console.log(`PAGE SCRAPER: Element in viewport:`, elements[0].getBoundingClientRect().top < window.innerHeight);
                }
                
                if (elements.length > 0) {
                    postElements = Array.from(elements);
                    selectorUsed = selector;
                    break;
                }
            }
            
            console.log(`PAGE SCRAPER: Using selector "${selectorUsed}" - Found ${postElements.length} post elements`);
            
            // Log page content for debugging
            console.log('PAGE SCRAPER: Page title:', document.title);
            console.log('PAGE SCRAPER: Body classes:', document.body?.className);
            console.log('PAGE SCRAPER: Total elements on page:', document.querySelectorAll('*').length);
            
            // Create debug info to return to service worker
            const debugInfo = {
                url: window.location.href,
                title: document.title,
                totalElements: document.querySelectorAll('*').length,
                selectorUsed: selectorUsed,
                elementsFound: postElements.length,
                bodyClasses: document.body?.className || 'none',
                processedElements: 0,
                validPosts: 0,
                processingErrors: [],
                postDetails: []
            };
            
            // Log to on-page logger if available
            if (window.logger && window.logger.log) {
                window.logger.log(`PAGE SCRAPER: Found ${postElements.length} post elements using "${selectorUsed}"`);
                window.logger.log(`PAGE SCRAPER: Page title: ${document.title}`);
                window.logger.log(`PAGE SCRAPER: Total elements: ${document.querySelectorAll('*').length}`);
            }
            
            for (const element of postElements) {
                try {
                    debugInfo.processedElements++;
                    
                    // Extract URN - try multiple sources for feed compatibility
                    let urn = element.getAttribute('data-urn') || 
                             element.getAttribute('data-id') || 
                             element.querySelector('[data-urn]')?.getAttribute('data-urn') ||
                             element.querySelector('[data-id]')?.getAttribute('data-id');
                    
                    // For feed posts, also check parent/child elements
                    if (!urn) {
                        const activityElement = element.querySelector('[data-activity-urn]') ||
                                               element.closest('[data-activity-urn]');
                        if (activityElement) {
                            urn = activityElement.getAttribute('data-activity-urn');
                        }
                    }
                    
                    // Try to extract URN from any link containing activity ID
                    if (!urn) {
                        const activityLink = element.querySelector('a[href*="activity"]');
                        if (activityLink) {
                            const href = activityLink.getAttribute('href');
                            const match = href.match(/activity[:\-](\d+)/);
                            if (match) {
                                urn = `urn:li:activity:${match[1]}`;
                            }
                        }
                    }
                    
                    // Generate fallback URN if none found
                    if (!urn) {
                        const textContent = element.textContent?.substring(0, 50) || '';
                        const timestamp = Date.now();
                        const randomId = Math.random().toString(36).substring(2, 8);
                        urn = `generated-${timestamp}-${randomId}`;
                        console.log(`PAGE SCRAPER: Generated fallback URN: ${urn}`);
                        debugInfo.processingErrors.push(`No URN found, generated: ${urn.substring(0, 30)}...`);
                    }
                    
                    if (processedUrns.has(urn)) {
                        console.log(`PAGE SCRAPER: Skipping duplicate URN: ${urn}`);
                        debugInfo.processingErrors.push(`Duplicate URN: ${urn.substring(0, 30)}...`);
                        continue;
                    }
                    
                    console.log(`PAGE SCRAPER: Processing element with URN: ${urn}`);
                    
                    // Extract engagement metrics using full CSS selectors
                    // Try multiple selectors for better compatibility
                    const likesSelectors = [
                        '[aria-label*="reaction"] span:nth-child(2)',
                        '[aria-label*="reaction"] span',
                        '.social-details-social-counts__reactions-count',
                        'button[aria-label*="reaction"]'
                    ];
                    
                    const commentsSelectors = [
                        '[aria-label*="comment"] span',
                        '.social-details-social-counts__comments-count',
                        'button[aria-label*="comment"]'
                    ];
                    
                    let likes = 0, comments = 0;
                    let likesElement = null, commentsElement = null;
                    
                    // Try to find likes element with detailed logging
                    console.log(`PAGE SCRAPER: Searching for likes in post ${urn}`);
                    for (const selector of likesSelectors) {
                        likesElement = element.querySelector(selector);
                        console.log(`PAGE SCRAPER: Likes selector "${selector}" -> ${likesElement ? 'FOUND' : 'NOT FOUND'}`);
                        if (likesElement) {
                            console.log(`PAGE SCRAPER: ✅ Found likes with selector: ${selector}`);
                            break;
                        }
                    }
                    
                    // Try to find comments element with detailed logging
                    console.log(`PAGE SCRAPER: Searching for comments in post ${urn}`);
                    for (const selector of commentsSelectors) {
                        commentsElement = element.querySelector(selector);
                        console.log(`PAGE SCRAPER: Comments selector "${selector}" -> ${commentsElement ? 'FOUND' : 'NOT FOUND'}`);
                        if (commentsElement) {
                            console.log(`PAGE SCRAPER: ✅ Found comments with selector: ${selector}`);
                            break;
                        }
                    }
                    
                    // Extract likes
                    if (likesElement) {
                        const likesText = likesElement.textContent || likesElement.getAttribute('aria-label') || '';
                        likes = extractNumber(likesText);
                        console.log(`PAGE SCRAPER: Likes element text: "${likesText}" -> ${likes}`);
                    } else {
                        console.log('PAGE SCRAPER: No likes element found');
                    }
                    
                    // Extract comments
                    if (commentsElement) {
                        const commentsText = commentsElement.textContent || commentsElement.getAttribute('aria-label') || '';
                        comments = extractNumber(commentsText);
                        console.log(`PAGE SCRAPER: Comments element text: "${commentsText}" -> ${comments}`);
                    } else {
                        // Try to find comments in text content
                        const allText = element.textContent || '';
                        const commentMatch = allText.match(/(\d+)\s*comment/i);
                        if (commentMatch) {
                            comments = parseInt(commentMatch[1], 10);
                            console.log(`PAGE SCRAPER: Found comments in text: "${commentMatch[0]}" -> ${comments}`);
                        } else {
                            console.log('PAGE SCRAPER: No comments element found');
                        }
                    }
                    
                    // Check qualification criteria (handle undefined values)
                    const minLikes = qualification.minLikes || 0;
                    const minComments = qualification.minComments || 0;
                    const ignoreKeywords = qualification.ignoreKeywords || [];
                    
                    // Get full post text for keyword filtering
                    const fullPostText = element.textContent?.toLowerCase() || '';
                    
                    // Check if post contains any ignore keywords (e.g., hiring posts)
                    const containsIgnoreKeyword = ignoreKeywords.some(keyword => {
                        const kw = (keyword || '').toLowerCase().trim();
                        return kw && fullPostText.includes(kw);
                    });
                    
                    console.log(`PAGE SCRAPER: Post ${urn} - ${likes}L/${comments}C (need ${minLikes}L/${minComments}C)${containsIgnoreKeyword ? ' [IGNORED - contains ignore keyword]' : ''}`);
                    
                    // Add post details to debug info
                    debugInfo.postDetails.push({
                        urn: urn, // Use full URN, not truncated
                        likes: likes,
                        comments: comments,
                        qualified: likes >= minLikes && comments >= minComments && !containsIgnoreKeyword,
                        ignored: containsIgnoreKeyword
                    });
                    
                    // Skip if post contains ignore keywords
                    if (containsIgnoreKeyword) {
                        debugInfo.processingErrors.push(`Ignored: contains ignore keyword`);
                        if (window.logger && window.logger.log) {
                            window.logger.log(`PAGE SCRAPER: 🚫 Ignored post - contains ignore keyword`);
                        }
                        continue;
                    }
                    
                    if (likes >= minLikes && comments >= minComments) {
                        // Extract post content
                        const contentElement = element.querySelector('.feed-shared-text, .feed-shared-update-v2__description, .update-components-text');
                        const postText = contentElement ? contentElement.textContent.trim() : '';
                        
                        // Extract author info using multiple strategies
                        let authorName = '';
                        
                        // Try aria-label first
                        const authorLinks = element.querySelectorAll('a[aria-label]');
                        for (const link of authorLinks) {
                            const label = link.getAttribute('aria-label');
                            if (label) {
                                const match = label.match(/^View\s+(.+?)['']s/i);
                                if (match && match[1]) {
                                    authorName = match[1].trim().split(' ')[0];
                                    break;
                                }
                            }
                        }
                        
                        // Fallback to direct selectors
                        if (!authorName) {
                            const selectors = [
                                '.update-components-actor__name span[aria-hidden="true"]',
                                '.feed-shared-actor__name',
                                '.update-components-actor__title'
                            ];
                            for (const sel of selectors) {
                                const el = element.querySelector(sel);
                                if (el) {
                                    const text = el.textContent?.trim();
                                    if (text && !text.includes('\n')) {
                                        authorName = text.split(' ')[0];
                                        break;
                                    }
                                }
                            }
                        }
                        
                        if (!authorName) authorName = 'there';
                        
                        posts.push({
                            urn,
                            likes,
                            comments,
                            postText: postText.substring(0, 500), // Limit text length
                            authorName,
                            timestamp: Date.now()
                        });
                        
                        debugInfo.validPosts++;
                        console.log(`PAGE SCRAPER: Qualified post found - ${likes} likes, ${comments} comments`);
                        
                        // Log to on-page logger if available
                        if (window.logger && window.logger.log) {
                            window.logger.log(`PAGE SCRAPER: ✅ Qualified post - ${likes} likes, ${comments} comments`);
                        }
                    } else {
                        debugInfo.processingErrors.push(`Unqualified: ${likes}L/${comments}C (need ${minLikes}L/${minComments}C)`);
                        // Log unqualified posts too
                        if (window.logger && window.logger.log) {
                            window.logger.log(`PAGE SCRAPER: ❌ Unqualified post - ${likes} likes, ${comments} comments (need ${minLikes}+ likes, ${minComments}+ comments)`);
                        }
                    }
                    
                } catch (error) {
                    debugInfo.processingErrors.push(`Error: ${error.message}`);
                    console.error("PAGE SCRAPER: Error processing post element:", error);
                    if (window.logger && window.logger.log) {
                        window.logger.log(`PAGE SCRAPER: ❌ Error processing post: ${error.message}`);
                    }
                }
            }
            
            console.log(`PAGE SCRAPER: Scraping complete - Found ${posts.length} qualified posts out of ${postElements.length} total elements`);
            console.log('PAGE SCRAPER: Qualified posts:', posts.map(p => `${p.urn} (${p.likes}L, ${p.comments}C)`));
            
            // Final summary to on-page logger
            if (window.logger && window.logger.log) {
                window.logger.log(`PAGE SCRAPER: 📊 SUMMARY: ${posts.length}/${postElements.length} posts qualified`);
                if (posts.length > 0) {
                    posts.forEach(p => {
                        window.logger.log(`PAGE SCRAPER: 📝 ${p.likes}L, ${p.comments}C - ${p.postText.substring(0, 50)}...`);
                    });
                }
            }
            
            // Return posts with debug info
            return { posts: posts, debug: debugInfo };
            
        } catch (error) {
            console.error("PAGE SCRAPER: Error in scrapeVisiblePosts:", error);
            
            // Log to on-page logger if available
            if (window.logger && window.logger.log) {
                window.logger.log(`PAGE SCRAPER: ❌ ERROR in scraping: ${error.message}`);
            }
            
            return [];
        }
        
        // Helper function to extract numbers from text (embedded)
        function extractNumber(text) {
            if (!text) return 0;
            
            console.log(`EXTRACT NUMBER: Input text: "${text}"`);
            
            // Clean the text
            const cleanText = text.trim();
            
            // Handle "2 comments", "5 reactions", etc.
            const wordMatch = cleanText.match(/(\d+(?:\.\d+)?)\s*(comment|reaction|like|share)/i);
            if (wordMatch) {
                const num = parseFloat(wordMatch[1]);
                console.log(`EXTRACT NUMBER: Found word format "${wordMatch[0]}" -> ${num}`);
                return Math.floor(num);
            }
            
            // Handle "1.2K", "5.3M" format
            const suffixMatch = cleanText.match(/(\d+(?:\.\d+)?)\s*([KMB])?/i);
            if (suffixMatch) {
                const num = parseFloat(suffixMatch[1]);
                const suffix = suffixMatch[2]?.toUpperCase();
                
                let result;
                switch (suffix) {
                    case 'K': result = Math.floor(num * 1000); break;
                    case 'M': result = Math.floor(num * 1000000); break;
                    case 'B': result = Math.floor(num * 1000000000); break;
                    default: result = Math.floor(num); break;
                }
                
                console.log(`EXTRACT NUMBER: Found suffix format "${suffixMatch[0]}" -> ${result}`);
                return result;
            }
            
            // Handle plain numbers
            const plainMatch = cleanText.match(/(\d+)/);
            if (plainMatch) {
                const result = parseInt(plainMatch[1], 10);
                console.log(`EXTRACT NUMBER: Found plain number "${plainMatch[0]}" -> ${result}`);
                return result;
            }
            
            console.log(`EXTRACT NUMBER: No number found in "${text}" -> 0`);
            return 0;
        }
    })(config.qualification, config.processedUrns);
    
    // Extract posts and debug info from result
    const actualPosts = posts.posts || posts; // Handle both old and new format
    const debugInfo = posts.debug || null;
    
    // Update processed URNs
    actualPosts.forEach(post => config.processedUrns.add(post.urn));
    
    // Log results to on-page logger
    if (window.logger && window.logger.log) {
        window.logger.log(`PAGE SCRAPER: Found ${actualPosts.length} posts`);
    }
    
    return { 
        posts: actualPosts,
        debug: debugInfo,
        scrollPosition: window.pageYOffset,
        totalHeight: document.body.scrollHeight,
        scrollAttempt
    };
    
    } catch (error) {
        console.error("PAGE SCRAPER: Error in performEnhancedScroll:", error);
        
        // Log to on-page logger if available
        if (window.logger && window.logger.log) {
            window.logger.log(`PAGE SCRAPER: ❌ ERROR: ${error.message}`);
        }
        
        return { 
            posts: [], 
            error: error.message,
            scrollPosition: window.pageYOffset || 0,
            totalHeight: document.body?.scrollHeight || 0,
            scrollAttempt
        };
    }
}

// Function to scrape visible posts (injected into page)
function scrapeVisiblePosts(qualification, processedUrns) {
    try {
        const posts = [];
        
        console.log('PAGE SCRAPER: Starting to scrape visible posts');
        console.log('PAGE SCRAPER: Current URL:', window.location.href);
        console.log('PAGE SCRAPER: Qualification criteria:', qualification);
    
    // Log to on-page logger if available
    if (window.logger && window.logger.log) {
        window.logger.log('PAGE SCRAPER: Starting to scrape visible posts');
        window.logger.log(`PAGE SCRAPER: URL: ${window.location.href}`);
        window.logger.log(`PAGE SCRAPER: Criteria: ${qualification.minLikes}+ likes, ${qualification.minComments}+ comments`);
    }
    
    // Use only the correct selector as confirmed by user
    const postSelectors = [
        'div[data-urn*="urn:li:activity"]'
    ];
    
    let postElements = [];
    let selectorUsed = '';
    
    // Try each selector and log results
    for (const selector of postSelectors) {
        const elements = document.querySelectorAll(selector);
        console.log(`PAGE SCRAPER: Selector "${selector}" found ${elements.length} elements`);
        if (elements.length > 0) {
            postElements = Array.from(elements);
            selectorUsed = selector;
            break;
        }
    }
    
    console.log(`PAGE SCRAPER: Using selector "${selectorUsed}" - Found ${postElements.length} post elements`);
    
    // Log page content for debugging
    console.log('PAGE SCRAPER: Page title:', document.title);
    console.log('PAGE SCRAPER: Body classes:', document.body?.className);
    console.log('PAGE SCRAPER: Total elements on page:', document.querySelectorAll('*').length);
    
    // Log to on-page logger if available
    if (window.logger && window.logger.log) {
        window.logger.log(`PAGE SCRAPER: Found ${postElements.length} post elements using "${selectorUsed}"`);
        window.logger.log(`PAGE SCRAPER: Page title: ${document.title}`);
        window.logger.log(`PAGE SCRAPER: Total elements: ${document.querySelectorAll('*').length}`);
    }
    
    // If no posts found with specific selectors, try broader search
    if (postElements.length === 0) {
        console.log('PAGE SCRAPER: No posts found with specific selectors, trying broader search...');
        const broadSelectors = [
            '[data-urn]',
            '.artdeco-card',
            '.feed-shared-update-v2',
            '.update-components-update-v2'
        ];
        
        for (const selector of broadSelectors) {
            const elements = document.querySelectorAll(selector);
            console.log(`PAGE SCRAPER: Broad selector "${selector}" found ${elements.length} elements`);
            if (elements.length > 0) {
                postElements = Array.from(elements);
                selectorUsed = selector + ' (broad)';
                break;
            }
        }
    }
    
    for (const element of postElements) {
        try {
            // Extract URN
            let urn = element.getAttribute('data-urn') || 
                     element.getAttribute('data-id') || 
                     element.querySelector('[data-urn]')?.getAttribute('data-urn');
            
            // Generate fallback URN if none found
            if (!urn) {
                const textContent = element.textContent?.substring(0, 50) || '';
                const timestamp = Date.now();
                urn = `generated-${timestamp}-${textContent.replace(/\s+/g, '-').toLowerCase()}`;
                console.log(`PAGE SCRAPER: Generated fallback URN: ${urn}`);
            }
            
            if (processedUrns.has(urn)) {
                console.log(`PAGE SCRAPER: Skipping duplicate URN: ${urn}`);
                continue;
            }
            
            console.log(`PAGE SCRAPER: Processing element with URN: ${urn}`);
            
            // Extract engagement metrics using full CSS selectors
            // Try multiple selectors for better compatibility
            const likesSelectors = [
                '[aria-label*="reaction"] span:nth-child(2)',
                '[aria-label*="reaction"] span',
                '.social-details-social-counts__reactions-count',
                'button[aria-label*="reaction"]'
            ];
            
            const commentsSelectors = [
                '[aria-label*="comment"] span',
                '.social-details-social-counts__comments-count',
                'button[aria-label*="comment"]'
            ];
            
            let likes = 0, comments = 0;
            let likesElement = null, commentsElement = null;
            
            // Try to find likes element with detailed logging
            console.log(`PAGE SCRAPER: Searching for likes in post ${urn}`);
            for (const selector of likesSelectors) {
                likesElement = element.querySelector(selector);
                console.log(`PAGE SCRAPER: Likes selector "${selector}" -> ${likesElement ? 'FOUND' : 'NOT FOUND'}`);
                if (likesElement) {
                    console.log(`PAGE SCRAPER: ✅ Found likes with selector: ${selector}`);
                    break;
                }
            }
            
            // Try to find comments element with detailed logging
            console.log(`PAGE SCRAPER: Searching for comments in post ${urn}`);
            for (const selector of commentsSelectors) {
                commentsElement = element.querySelector(selector);
                console.log(`PAGE SCRAPER: Comments selector "${selector}" -> ${commentsElement ? 'FOUND' : 'NOT FOUND'}`);
                if (commentsElement) {
                    console.log(`PAGE SCRAPER: ✅ Found comments with selector: ${selector}`);
                    break;
                }
            }
            
            // Extract likes
            if (likesElement) {
                const likesText = likesElement.textContent || likesElement.getAttribute('aria-label') || '';
                likes = extractNumber(likesText);
                console.log(`PAGE SCRAPER: Likes element text: "${likesText}" -> ${likes}`);
            } else {
                console.log('PAGE SCRAPER: No likes element found');
            }
            
            // Extract comments - try multiple approaches
            if (commentsElement) {
                const commentsText = commentsElement.textContent || commentsElement.getAttribute('aria-label') || '';
                comments = extractNumber(commentsText);
                console.log(`PAGE SCRAPER: Comments element text: "${commentsText}" -> ${comments}`);
            } else {
                // Try to find comments in text content
                const allText = element.textContent || '';
                const commentMatch = allText.match(/(\d+)\s*comment/i);
                if (commentMatch) {
                    comments = parseInt(commentMatch[1], 10);
                    console.log(`PAGE SCRAPER: Found comments in text: "${commentMatch[0]}" -> ${comments}`);
                } else {
                    console.log('PAGE SCRAPER: No comments element found');
                }
            }
            
            // Check qualification criteria
            if (likes >= qualification.minLikes && comments >= qualification.minComments) {
                // Extract post content
                const contentElement = element.querySelector('.feed-shared-text, .feed-shared-update-v2__description, .update-components-text');
                const postText = contentElement ? contentElement.textContent.trim() : '';
                
                // Extract author info
                const authorElement = element.querySelector('.feed-shared-actor__name, .update-components-actor__name');
                const authorName = authorElement ? authorElement.textContent.trim() : '';
                
                posts.push({
                    urn,
                    likes,
                    comments,
                    postText: postText.substring(0, 500), // Limit text length
                    authorName,
                    timestamp: Date.now()
                });
                
                console.log(`PAGE SCRAPER: Qualified post found - ${likes} likes, ${comments} comments`);
                
                // Log to on-page logger if available
                if (window.logger && window.logger.log) {
                    window.logger.log(`PAGE SCRAPER: ✅ Qualified post - ${likes} likes, ${comments} comments`);
                }
            } else {
                // Log unqualified posts too
                if (window.logger && window.logger.log) {
                    window.logger.log(`PAGE SCRAPER: ❌ Unqualified post - ${likes} likes, ${comments} comments (need ${qualification.minLikes}+ likes, ${qualification.minComments}+ comments)`);
                }
            }
            
        } catch (error) {
            console.error("PAGE SCRAPER: Error processing post element:", error);
            if (window.logger && window.logger.log) {
                window.logger.log(`PAGE SCRAPER: ❌ Error processing post: ${error.message}`);
            }
        }
    }
    
    console.log(`PAGE SCRAPER: Scraping complete - Found ${posts.length} qualified posts out of ${postElements.length} total elements`);
    console.log('PAGE SCRAPER: Qualified posts:', posts.map(p => `${p.urn} (${p.likes}L, ${p.comments}C)`));
    
    // Final summary to on-page logger
    if (window.logger && window.logger.log) {
        window.logger.log(`PAGE SCRAPER: 📊 SUMMARY: ${posts.length}/${postElements.length} posts qualified`);
        if (posts.length > 0) {
            posts.forEach(p => {
                window.logger.log(`PAGE SCRAPER: 📝 ${p.likes}L, ${p.comments}C - ${p.postText.substring(0, 50)}...`);
            });
        }
    }
    
    return posts;
    
    } catch (error) {
        console.error("PAGE SCRAPER: Error in scrapeVisiblePosts:", error);
        
        // Log to on-page logger if available
        if (window.logger && window.logger.log) {
            window.logger.log(`PAGE SCRAPER: ❌ ERROR in scraping: ${error.message}`);
        }
        
        return [];
    }
}

// Helper function to extract numbers from text
function extractNumber(text) {
    if (!text) return 0;
    
    console.log(`EXTRACT NUMBER: Input text: "${text}"`);
    
    // Clean the text
    const cleanText = text.trim();
    
    // Handle "2 comments", "5 reactions", etc.
    const wordMatch = cleanText.match(/(\d+(?:\.\d+)?)\s*(comment|reaction|like|share)/i);
    if (wordMatch) {
        const num = parseFloat(wordMatch[1]);
        console.log(`EXTRACT NUMBER: Found word format "${wordMatch[0]}" -> ${num}`);
        return Math.floor(num);
    }
    
    // Handle "1.2K", "5.3M" format
    const suffixMatch = cleanText.match(/(\d+(?:\.\d+)?)\s*([KMB])?/i);
    if (suffixMatch) {
        const num = parseFloat(suffixMatch[1]);
        const suffix = suffixMatch[2]?.toUpperCase();
        
        let result;
        switch (suffix) {
            case 'K': result = Math.floor(num * 1000); break;
            case 'M': result = Math.floor(num * 1000000); break;
            case 'B': result = Math.floor(num * 1000000000); break;
            default: result = Math.floor(num); break;
        }
        
        console.log(`EXTRACT NUMBER: Found suffix format "${suffixMatch[0]}" -> ${result}`);
        return result;
    }
    
    // Handle plain numbers
    const plainMatch = cleanText.match(/(\d+)/);
    if (plainMatch) {
        const result = parseInt(plainMatch[1], 10);
        console.log(`EXTRACT NUMBER: Found plain number "${plainMatch[0]}" -> ${result}`);
        return result;
    }
    
    console.log(`EXTRACT NUMBER: No number found in "${text}" -> 0`);
    return 0;
}

// Service Worker keep-alive mechanism
class ServiceWorkerKeepAlive {
    constructor() {
        this.alarmName = 'keepAlive';
        this.heartbeatInterval = 25000; // 25 seconds (before 30s timeout)
        this.isActive = false;
    }
    
    start() {
        if (this.isActive) return;
        
        this.isActive = true;
        console.log("KEEP-ALIVE: Starting heartbeat mechanism");
        
        // Create recurring alarm
        chrome.alarms.create(this.alarmName, {
            delayInMinutes: 0.4, // ~25 seconds
            periodInMinutes: 0.4
        });
        
        // Listen for alarm
        chrome.alarms.onAlarm.addListener((alarm) => {
            if (alarm.name === this.alarmName) {
                console.log("KEEP-ALIVE: Heartbeat ping");
                // Perform minimal work to keep service worker alive
                chrome.storage.local.get('keepAliveTimestamp').then(result => {
                    chrome.storage.local.set({
                        keepAliveTimestamp: Date.now()
                    });
                });
            }
        });
    }
    
    stop() {
        if (!this.isActive) return;
        
        this.isActive = false;
        chrome.alarms.clear(this.alarmName);
        console.log("KEEP-ALIVE: Stopped heartbeat mechanism");
    }
    
    // Save scraping progress to storage
    async saveProgress(keyword, posts, currentIndex) {
        const progressData = {
            keyword,
            posts,
            currentIndex,
            timestamp: Date.now(),
            status: 'in_progress'
        };
        
        await chrome.storage.local.set({
            scrapingProgress: progressData
        });
        
        console.log(`KEEP-ALIVE: Progress saved - ${posts.length} posts for "${keyword}"`);
    }
    
    // Resume scraping from saved progress
    async resumeProgress() {
        const result = await chrome.storage.local.get('scrapingProgress');
        const progress = result.scrapingProgress;
        
        if (progress && progress.status === 'in_progress') {
            const timeDiff = Date.now() - progress.timestamp;
            
            // If less than 10 minutes old, resume
            if (timeDiff < 10 * 60 * 1000) {
                console.log(`KEEP-ALIVE: Resuming scraping for "${progress.keyword}"`);
                return progress;
            }
        }
        
        return null;
    }
    
    // Clear progress when complete
    async clearProgress() {
        await chrome.storage.local.remove('scrapingProgress');
        console.log("KEEP-ALIVE: Progress cleared");
    }
}

/**
 * Scrape posts from LinkedIn home feed (Feed mode)
 * Similar to scrapePostsFromSearchEnhanced but scrapes from feed page
 * Automatically ignores ads/promoted posts
 */
async function scrapePostsFromFeed(targetCount, qualification = {}, humanSimulation = {}) {
    console.log(`FEED SCRAPER: Starting feed scraping for ${targetCount} QUALIFIED posts`);
    console.log(`FEED SCRAPER: Qualification criteria - minLikes: ${qualification.minLikes || 0}, minComments: ${qualification.minComments || 0}`);
    
    const startTime = Date.now();
    const maxScrollTime = 10 * 60 * 1000; // 10 minutes max
    const scrollInterval = 2000; // 2 seconds between scrolls
    const noNewPostsTimeout = 90000; // 90 seconds without new posts
    
    let allPosts = [];
    let qualifiedPosts = [];
    let lastPostCount = 0;
    let noNewPostsTimer = 0;
    let scrollAttempts = 0;
    let tabId = null;
    
    try {
        // LinkedIn feed URL
        const feedUrl = 'https://www.linkedin.com/feed/';
        console.log(`FEED SCRAPER: Creating window/tab for URL: ${feedUrl}`);
        
        // Load automation preferences
        const prefsResult = await chrome.storage.local.get('automationPreferences');
        const automationPreferences = prefsResult.automationPreferences || { openSearchInWindow: true };
        const useWindow = automationPreferences.openSearchInWindow;
        
        console.log(`FEED SCRAPER: Opening in ${useWindow ? 'window' : 'background tab'}`);
        
        if (useWindow) {
            const screenWidth = 1920;
            const screenHeight = 1080;
            
            const window = await chrome.windows.create({
                url: feedUrl,
                type: 'normal',
                state: 'normal',
                focused: false,
                left: 0,
                top: 0,
                width: Math.floor(screenWidth / 2),
                height: screenHeight
            });
            
            tabId = window.tabs[0].id;
            console.log(`FEED SCRAPER: Created window with tab ${tabId}`);
        } else {
            const tab = await chrome.tabs.create({
                url: feedUrl,
                active: false
            });
            
            tabId = tab.id;
            console.log(`FEED SCRAPER: Created background tab ${tabId}`);
        }
        
        // Wait for page to fully load - feed pages may take longer
        console.log("FEED SCRAPER: Waiting for page to load...");
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Additional wait for dynamic content
        let contentLoaded = false;
        for (let i = 0; i < 10; i++) {
            const checkResults = await chrome.scripting.executeScript({
                target: { tabId },
                func: () => {
                    // Check if feed content exists
                    const feedItems = document.querySelectorAll('.feed-shared-update-v2, .occludable-update, [data-id*="activity"]');
                    console.log('FEED SCRAPER: Content check - found', feedItems.length, 'items');
                    return feedItems.length > 0;
                }
            });
            
            if (checkResults && checkResults[0] && checkResults[0].result) {
                contentLoaded = true;
                console.log("FEED SCRAPER: Feed content detected, proceeding...");
                break;
            }
            
            console.log(`FEED SCRAPER: Waiting for content... attempt ${i + 1}/10`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        if (!contentLoaded) {
            console.warn("FEED SCRAPER: No content detected after waiting, proceeding anyway...");
        }
        
        console.log("FEED SCRAPER: Starting scraping from LinkedIn feed");
        
        // Add ignore keywords for ads/promoted posts
        const adKeywords = ['Promoted', 'Sponsored', 'Ad ·', '· Ad', 'advertisement'];
        const ignoreKeywords = [...(qualification.ignoreKeywords || []), ...adKeywords];
        const qualificationWithAds = { ...qualification, ignoreKeywords };
        
        // Inject the scraping script
        await chrome.scripting.executeScript({
            target: { tabId },
            func: initializeEnhancedScraper,
            args: [qualificationWithAds, humanSimulation]
        });
        
        console.log("FEED SCRAPER: Scraper initialized in page");
        
        // Start the scrolling and scraping loop
        while (qualifiedPosts.length < targetCount && (Date.now() - startTime) < maxScrollTime) {
            // Check if stop signal was sent
            const storageCheck = await chrome.storage.local.get(['bulkProcessingActive']);
            if (storageCheck.bulkProcessingActive === false) {
                console.log('FEED SCRAPER: Stop signal detected, halting scraper');
                try {
                    if (useWindow && tabId) {
                        const tab = await chrome.tabs.get(tabId);
                        if (tab && tab.windowId) {
                            await chrome.windows.remove(tab.windowId);
                        }
                    } else if (tabId) {
                        await chrome.tabs.remove(tabId);
                    }
                } catch (e) {
                    console.log('FEED SCRAPER: Tab/window already closed');
                }
                return { posts: qualifiedPosts, stopped: true, message: 'Scraping stopped by user' };
            }
            
            // Execute scroll and scrape
            scrollAttempts++;
            try {
                const results = await chrome.scripting.executeScript({
                    target: { tabId },
                    func: performEnhancedScroll,
                    args: [scrollAttempts, humanSimulation]
                });
                
                if (results && results[0] && results[0].result) {
                    const pageData = results[0].result;
                    
                    // Filter new posts that aren't already in our list
                    const newPosts = pageData.posts.filter(post => 
                        !allPosts.some(existing => existing.urn === post.urn)
                    );
                    
                    allPosts.push(...newPosts);
                    
                    // Get qualified posts from new posts
                    const newQualified = newPosts.filter(post => 
                        !qualifiedPosts.some(existing => existing.urn === post.urn) &&
                        (post.qualified || post.likes >= (qualification.minLikes || 0) && post.comments >= (qualification.minComments || 0))
                    );
                    
                    qualifiedPosts.push(...newQualified);
                    
                    console.log(`FEED SCRAPER: Progress - Total posts: ${allPosts.length}, Qualified: ${qualifiedPosts.length}/${targetCount}`);
                    
                    // Update progress in storage
                    await chrome.storage.local.set({
                        scrapingProgress: {
                            total: allPosts.length,
                            qualified: qualifiedPosts.length,
                            target: targetCount,
                            source: 'feed'
                        }
                    });
                    
                    // Check for no new posts
                    if (allPosts.length === lastPostCount) {
                        noNewPostsTimer += scrollInterval;
                        if (noNewPostsTimer >= noNewPostsTimeout) {
                            console.log("FEED SCRAPER: No new posts found for 90 seconds, ending...");
                            break;
                        }
                    } else {
                        noNewPostsTimer = 0;
                        lastPostCount = allPosts.length;
                    }
                }
            } catch (scrollError) {
                console.error("FEED SCRAPER: Scroll error:", scrollError);
            }
            
            scrollAttempts++;
            
            // Wait before next scroll
            await new Promise(resolve => setTimeout(resolve, scrollInterval));
        }
        
        // Close the tab/window
        try {
            if (useWindow && tabId) {
                const tab = await chrome.tabs.get(tabId);
                if (tab && tab.windowId) {
                    await chrome.windows.remove(tab.windowId);
                }
            } else if (tabId) {
                await chrome.tabs.remove(tabId);
            }
        } catch (e) {
            console.log('FEED SCRAPER: Tab/window already closed');
        }
        
        console.log(`FEED SCRAPER: Completed - Found ${qualifiedPosts.length} qualified posts from feed`);
        
        return qualifiedPosts;
        
    } catch (error) {
        console.error("FEED SCRAPER: Error:", error);
        
        // Try to close tab on error
        try {
            if (tabId) {
                await chrome.tabs.remove(tabId);
            }
        } catch (e) {}
        
        return [];
    }
}

// Export functions
export { 
    scrapePostsFromSearchEnhanced,
    scrapePostsFromFeed,
    ServiceWorkerKeepAlive,
    initializeEnhancedScraper,
    performEnhancedScroll 
};
