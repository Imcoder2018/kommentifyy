/**
 * KEYWORD-BASED BULK PROCESSING
 * Scrapes posts from LinkedIn search results for given keywords
 */

/**
 * Scrape posts from a search results page with qualification criteria
 * @param {number} tabId - The tab ID of the search page
 * @param {number} targetCount - Number of posts to scrape
 * @param {Object} qualification - Post qualification criteria {minLikes, minComments, ignoreKeywords}
 * @returns {Promise<Array>} Array of qualified post URNs
 */
export async function scrapePostsFromSearch(tabId, targetCount, qualification = {}) {
    console.log(`SCRAPER: Starting to scrape ${targetCount} posts from search page`);
    console.log(`SCRAPER: Ignore keywords: ${qualification.ignoreKeywords?.length || 0} keywords configured`);
    
    const startTime = Date.now();
    const maxWaitTime = 3 * 60 * 1000; // 3 minutes
    let scrapedPosts = [];
    let lastCount = 0;
    let noChangeCount = 0;
    
    while (scrapedPosts.length < targetCount) {
        // Check if we've exceeded max wait time
        if (Date.now() - startTime > maxWaitTime) {
            console.log(`SCRAPER: Timeout reached (3 minutes). Scraped ${scrapedPosts.length} posts.`);
            break;
        }
        
        // Scrape current posts with qualification criteria
        const result = await chrome.scripting.executeScript({
            target: { tabId },
            func: (qualificationCriteria) => {
                // Find all post containers
                const posts = [];
                const postElements = document.querySelectorAll('[data-urn*="urn:li:activity:"]');
                
                postElements.forEach(el => {
                    const urn = el.getAttribute('data-urn');
                    if (urn && urn.includes('urn:li:activity:')) {
                        // Extract the activity URN
                        const match = urn.match(/urn:li:activity:\d+/);
                        if (match && !posts.find(p => p.urn === match[0])) {
                            // Check if post meets qualification criteria
                            const postData = extractPostEngagementData(el, qualificationCriteria);
                            if (postData.qualified) {
                                posts.push({
                                    urn: match[0],
                                    likes: postData.likes,
                                    comments: postData.comments
                                });
                            }
                        }
                    }
                });
                
                // Also check for posts in feed-shared-update-v2
                const feedPosts = document.querySelectorAll('.feed-shared-update-v2');
                feedPosts.forEach(el => {
                    const urnEl = el.querySelector('[data-urn]');
                    if (urnEl) {
                        const urn = urnEl.getAttribute('data-urn');
                        const match = urn?.match(/urn:li:activity:\d+/);
                        if (match && !posts.find(p => p.urn === match[0])) {
                            // Check if post meets qualification criteria
                            const postData = extractPostEngagementData(el, qualificationCriteria);
                            if (postData.qualified) {
                                posts.push({
                                    urn: match[0],
                                    likes: postData.likes,
                                    comments: postData.comments
                                });
                            }
                        }
                    }
                });
                
                // Helper function to extract engagement data and check qualification
                function extractPostEngagementData(postElement, criteria) {
                    const minLikes = criteria.minLikes || 0;
                    const minComments = criteria.minComments || 0;
                    const ignoreKeywords = criteria.ignoreKeywords || [];
                    
                    let likes = 0;
                    let comments = 0;
                    
                    // Get post text content for ignore keyword check
                    const postText = (postElement.textContent || '').toLowerCase();
                    
                    // Check if post contains any ignore keywords (e.g., hiring posts)
                    const containsIgnoreKeyword = ignoreKeywords.some(keyword => {
                        const kw = keyword.toLowerCase().trim();
                        return kw && postText.includes(kw);
                    });
                    
                    if (containsIgnoreKeyword) {
                        console.log('SCRAPER: Post ignored - contains ignore keyword');
                        return { likes: 0, comments: 0, qualified: false, ignored: true };
                    }
                    
                    // Try to find likes count
                    const likeElements = postElement.querySelectorAll(
                        'button[aria-label*="Like"], button[aria-label*="React"], .social-counts-reactions__count, .social-detail-counts__reactions'
                    );
                    
                    for (const el of likeElements) {
                        const text = el.textContent || el.getAttribute('aria-label') || '';
                        const likeMatch = text.match(/(\d+(?:,\d+)*)\s*(?:like|reaction)/i);
                        if (likeMatch) {
                            likes = parseInt(likeMatch[1].replace(/,/g, ''), 10) || 0;
                            break;
                        }
                    }
                    
                    // Try to find comments count
                    const commentElements = postElement.querySelectorAll(
                        'button[aria-label*="Comment"], .social-counts-comments__count, .social-detail-counts__comments'
                    );
                    
                    for (const el of commentElements) {
                        const text = el.textContent || el.getAttribute('aria-label') || '';
                        const commentMatch = text.match(/(\d+(?:,\d+)*)\s*comment/i);
                        if (commentMatch) {
                            comments = parseInt(commentMatch[1].replace(/,/g, ''), 10) || 0;
                            break;
                        }
                    }
                    
                    // Also check for engagement counts in social-counts-social-proof
                    const socialProofEl = postElement.querySelector('.social-counts-social-proof');
                    if (socialProofEl) {
                        const socialText = socialProofEl.textContent || '';
                        
                        // Extract likes from social proof text
                        const socialLikeMatch = socialText.match(/(\d+(?:,\d+)*)\s*(?:like|reaction)/i);
                        if (socialLikeMatch && !likes) {
                            likes = parseInt(socialLikeMatch[1].replace(/,/g, ''), 10) || 0;
                        }
                        
                        // Extract comments from social proof text
                        const socialCommentMatch = socialText.match(/(\d+(?:,\d+)*)\s*comment/i);
                        if (socialCommentMatch && !comments) {
                            comments = parseInt(socialCommentMatch[1].replace(/,/g, ''), 10) || 0;
                        }
                    }
                    
                    // Check if post meets criteria
                    const qualified = (minLikes === 0 || likes >= minLikes) && 
                                     (minComments === 0 || comments >= minComments);
                    
                    return { likes, comments, qualified, ignored: false };
                }
                
                return posts;
            },
            args: [qualification]
        });
        
        if (result && result[0] && result[0].result) {
            const currentPosts = result[0].result;
            
            // Add new posts that we haven't seen before
            currentPosts.forEach(postData => {
                const existingPost = scrapedPosts.find(p => p.urn === postData.urn);
                if (!existingPost) {
                    scrapedPosts.push(postData);
                }
            });
            
            console.log(`SCRAPER: Found ${scrapedPosts.length}/${targetCount} posts`);
            
            // Check if we got new posts
            if (scrapedPosts.length === lastCount) {
                noChangeCount++;
                
                // If no new posts after 3 scroll attempts, break
                if (noChangeCount >= 3) {
                    console.log(`SCRAPER: No new posts after 3 scroll attempts. Stopping.`);
                    break;
                }
            } else {
                noChangeCount = 0;
                lastCount = scrapedPosts.length;
            }
            
            // If we have enough posts, break
            if (scrapedPosts.length >= targetCount) {
                break;
            }
            
            // Scroll down to load more posts
            await chrome.scripting.executeScript({
                target: { tabId },
                func: () => {
                    window.scrollTo(0, document.body.scrollHeight);
                }
            });
            
            // Wait for posts to load
            await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
            console.log('SCRAPER: Failed to scrape posts from page');
            break;
        }
    }
    
    console.log(`SCRAPER: Finished scraping. Total posts: ${scrapedPosts.length}`);
    return scrapedPosts.slice(0, targetCount);
}

/**
 * Convert keyword to LinkedIn search URL
 * @param {string} keyword - The search keyword
 * @returns {string} LinkedIn search URL
 */
export function keywordToSearchUrl(keyword) {
    const encodedKeyword = encodeURIComponent(keyword);
    return `https://www.linkedin.com/search/results/content/?keywords=${encodedKeyword}&origin=SWITCH_SEARCH_VERTICAL`;
}

/**
 * Convert URN to LinkedIn post URL
 * @param {string} urn - The post URN (e.g., "urn:li:activity:1234567890")
 * @returns {string} LinkedIn post URL
 */
export function urnToPostUrl(urn) {
    // Extract the activity ID from the URN
    const match = urn.match(/urn:li:activity:(\d+)/);
    if (match) {
        const activityId = match[1];
        return `https://www.linkedin.com/feed/update/${urn}`;
    }
    return null;
}
