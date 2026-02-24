// Kommentify Extension Comment Scraping Test Script
// This script replicates the comment scraping logic used in the extension
// Run this in the browser console on a LinkedIn profile's recent-activity/comments page

console.log('🔍 Kommentify Comment Scraping Test Script');
console.log('==========================================');

// Configuration
const config = {
    // Target profile ID (extracted from URL)
    targetProfileId: window.location.pathname.includes('/in/') ? 
        window.location.pathname.split('/in/')[1].split('/')[0] : 'unknown',
    
    // Selectors used by the extension
    selectors: {
        postCards: '.profile-creator-shared-feed-update__container, [data-urn*="activity"], .feed-shared-update-v2',
        postText: '.update-components-text, .feed-shared-text',
        commentItems: '.comments-comment-item, .comments-comment-entity',
        commentText: '.comments-comment-item__main-content, .update-components-text',
        commentAuthor: '.comments-post-meta__name-text a, .comments-comment-item__post-meta a'
    },
    
    // Filters
    filters: {
        minPostTextLength: 20,
        minCommentTextLength: 5,
        maxPostTextLength: 2000,
        maxCommentTextLength: 1000
    }
};

console.log('📋 Configuration:', config);

// Helper functions (copied from extension)
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

// Main scraping function (replicated from extension)
function scrapeCommentsFromProfile(targetId) {
    console.log(`🔍 Starting comment scraping for profile: ${targetId}`);
    console.log(`📍 Current URL: ${window.location.href}`);
    
    const results = [];
    const processedPosts = new Set();
    let totalPosts = 0;
    let totalComments = 0;
    let targetComments = 0;
    
    // Find all post cards
    const postCards = document.querySelectorAll(config.selectors.postCards);
    console.log(`📊 Found ${postCards.length} post cards`);
    
    // Debug: Log all potential post containers
    console.log('🔍 DEBUG - Post container selectors:');
    Object.entries(config.selectors.postCards.split(', ')).forEach(([index, selector]) => {
        const elements = document.querySelectorAll(selector.trim());
        console.log(`  ${selector.trim()}: ${elements.length} elements`);
    });
    
    // Process each post card
    for (let i = 0; i < postCards.length; i++) {
        const card = postCards[i];
        totalPosts++;
        
        try {
            // Extract post text
            const postTextEl = card.querySelector(config.selectors.postText);
            const postText = postTextEl ? postTextEl.innerText?.trim() : '';
            
            // Skip if post text is too short
            if (!postText || postText.length < config.filters.minPostTextLength) {
                console.log(`⏭️  Skipping post ${i + 1} - insufficient text (${postText.length} chars)`);
                continue;
            }
            
            // Get post URN for tracking
            const postUrn = card.getAttribute('data-urn') || 
                           card.getAttribute('data-id') || 
                           `post-${i}`;
            
            if (processedPosts.has(postUrn)) {
                console.log(`⏭️  Skipping duplicate post: ${postUrn}`);
                continue;
            }
            processedPosts.add(postUrn);
            
            console.log(`📝 Processing post ${i + 1}/${postCards.length}: "${postText.substring(0, 50)}..."`);
            
            // Find all comments in this post
            const commentEls = card.querySelectorAll(config.selectors.commentItems);
            console.log(`💬 Found ${commentEls.length} comments in post ${i + 1}`);
            
            // Process each comment
            for (let j = 0; j < commentEls.length; j++) {
                const cEl = commentEls[j];
                totalComments++;
                
                try {
                    // Extract comment text
                    const commentTextEl = cEl.querySelector(config.selectors.commentText);
                    const commentText = commentTextEl ? commentTextEl.innerText?.trim() : '';
                    
                    // Skip if comment text is too short
                    if (!commentText || commentText.length < config.filters.minCommentTextLength) {
                        continue;
                    }
                    
                    // Extract author information
                    const authorEl = cEl.querySelector(config.selectors.commentAuthor);
                    const authorName = authorEl ? authorEl.textContent?.trim() : '';
                    const authorLink = authorEl ? authorEl.href : '';
                    
                    // Check if this is the target user's comment
                    const isTargetComment = authorLink.includes(`/in/${targetId}`) || 
                                          authorName.toLowerCase().includes(targetId.toLowerCase());
                    
                    if (isTargetComment) {
                        targetComments++;
                        
                        const commentData = {
                            postText: postText.substring(0, config.filters.maxPostTextLength),
                            postUrn: postUrn,
                            context: 'DIRECT COMMENT ON POST',
                            commentText: commentText.substring(0, config.filters.maxCommentTextLength),
                            authorName: authorName,
                            authorLink: authorLink,
                            postIndex: i + 1,
                            commentIndex: j + 1
                        };
                        
                        results.push(commentData);
                        console.log(`✅ TARGET COMMENT FOUND #${targetComments}:`);
                        console.log(`   Author: ${authorName}`);
                        console.log(`   Comment: "${commentText.substring(0, 100)}..."`);
                        console.log(`   Post: "${postText.substring(0, 80)}..."`);
                    } else {
                        console.log(`💬 Other comment by ${authorName}: "${commentText.substring(0, 50)}..."`);
                    }
                    
                } catch (commentError) {
                    console.warn(`⚠️ Error processing comment ${j + 1}:`, commentError.message);
                }
            }
            
        } catch (postError) {
            console.warn(`⚠️ Error processing post ${i + 1}:`, postError.message);
        }
    }
    
    return {
        comments: results,
        stats: {
            totalPosts: totalPosts,
            totalComments: totalComments,
            targetComments: targetComments,
            processedPosts: processedPosts.size,
            success: true
        }
    };
}

// Scroll and load content function (replicated from extension)
async function scrollAndLoadContent(maxAttempts = 3) {
    console.log(`🔄 Starting scroll and load content (${maxAttempts} attempts)`);
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            console.log(`📜 Scroll attempt ${attempt}/${maxAttempts}`);
            
            // Get current stats before scroll
            const beforeScroll = document.querySelectorAll(config.selectors.postCards).length;
            
            // Smooth scroll to bottom
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
            
            // Wait for content to load
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Check if new posts loaded
            const afterScroll = document.querySelectorAll(config.selectors.postCards).length;
            const newPosts = afterScroll - beforeScroll;
            
            console.log(`📊 After scroll ${attempt}: ${afterScroll} posts found (${newPosts} new)`);
            
            // Look for "Load more" button
            const loadMoreButton = document.querySelector('button.scaffold-finite-scroll__load-button, .scaffold-layout__show-more');
            if (loadMoreButton && !loadMoreButton.disabled) {
                console.log('🔘 Found "Load more" button, clicking...');
                loadMoreButton.click();
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
            
            // Trigger lazy loading events
            ['scroll', 'resize', 'focus'].forEach(eventType => {
                window.dispatchEvent(new Event(eventType, { bubbles: true }));
                document.dispatchEvent(new Event(eventType, { bubbles: true }));
            });
            
        } catch (error) {
            console.warn(`⚠️ Scroll attempt ${attempt} failed:`, error);
        }
    }
    
    const finalPostCount = document.querySelectorAll(config.selectors.postCards).length;
    console.log(`🏁 Scroll complete: ${finalPostCount} posts loaded`);
    return finalPostCount;
}

// Enhanced scraper with more selectors (from enhancedScraper.js)
function enhancedScrapeComments(targetId) {
    console.log(`🚀 Starting enhanced comment scraping for: ${targetId}`);
    
    const results = [];
    const stats = {
        totalPosts: 0,
        totalComments: 0,
        targetComments: 0,
        selectorsTested: {}
    };
    
    // Enhanced post selectors (from enhancedScraper.js)
    const postSelectors = [
        '.profile-creator-shared-feed-update__container',
        '[data-urn*="activity"]',
        '.feed-shared-update-v2',
        '.occludable-update[data-id]',
        '.occludable-update',
        'div[data-urn*="urn:li:activity"]',
        'article[data-urn]',
        '.scaffold-finite-scroll__content > div[data-id]',
        '.scaffold-finite-scroll__content > div'
    ];
    
    // Find the best selector
    let postElements = [];
    let selectorUsed = '';
    
    for (const selector of postSelectors) {
        const elements = document.querySelectorAll(selector);
        stats.selectorsTested[selector] = elements.length;
        console.log(`🔍 Selector "${selector}": ${elements.length} elements`);
        
        if (elements.length > 0 && !selectorUsed) {
            postElements = Array.from(elements);
            selectorUsed = selector;
        }
    }
    
    console.log(`📊 Using selector "${selectorUsed}" - Found ${postElements.length} posts`);
    
    // Enhanced comment selectors
    const commentSelectors = [
        '.comments-comment-item',
        '.comments-comment-entity',
        '.comments-comment-item__content',
        '.feed-shared-comment',
        '.social-details__comment'
    ];
    
    const commentTextSelectors = [
        '.comments-comment-item__main-content',
        '.update-components-text',
        '.feed-shared-text',
        '.comments-comment-item__text-content'
    ];
    
    const commentAuthorSelectors = [
        '.comments-post-meta__name-text a',
        '.comments-comment-item__post-meta a',
        '.feed-shared-comment__author a',
        '.social-details__comment-author a'
    ];
    
    // Process each post
    postElements.forEach((card, postIndex) => {
        stats.totalPosts++;
        
        try {
            // Extract post text with multiple selectors
            let postText = '';
            const postTextSelectors = ['.update-components-text', '.feed-shared-text', '.feed-shared-update-v2__description'];
            for (const sel of postTextSelectors) {
                const el = card.querySelector(sel);
                if (el && el.innerText?.trim()) {
                    postText = el.innerText.trim();
                    break;
                }
            }
            
            if (postText.length < config.filters.minPostTextLength) return;
            
            // Try each comment selector
            for (const commentSel of commentSelectors) {
                const commentEls = card.querySelectorAll(commentSel);
                if (commentEls.length === 0) continue;
                
                console.log(`💬 Post ${postIndex + 1}: Found ${commentEls.length} comments with "${commentSel}"`);
                
                commentEls.forEach((cEl, commentIndex) => {
                    stats.totalComments++;
                    
                    try {
                        // Extract comment text
                        let commentText = '';
                        for (const textSel of commentTextSelectors) {
                            const textEl = cEl.querySelector(textSel);
                            if (textEl && textEl.innerText?.trim()) {
                                commentText = textEl.innerText.trim();
                                break;
                            }
                        }
                        
                        if (commentText.length < config.filters.minCommentTextLength) return;
                        
                        // Extract author
                        let authorName = '';
                        let authorLink = '';
                        for (const authorSel of commentAuthorSelectors) {
                            const authorEl = cEl.querySelector(authorSel);
                            if (authorEl) {
                                authorName = authorEl.textContent?.trim() || '';
                                authorLink = authorEl.href || '';
                                break;
                            }
                        }
                        
                        // Check if target comment
                        const isTargetComment = authorLink.includes(`/in/${targetId}`) || 
                                              authorName.toLowerCase().includes(targetId.toLowerCase());
                        
                        if (isTargetComment) {
                            stats.targetComments++;
                            results.push({
                                postText: postText.substring(0, config.filters.maxPostTextLength),
                                context: 'DIRECT COMMENT ON POST',
                                commentText: commentText.substring(0, config.filters.maxCommentTextLength),
                                authorName: authorName,
                                authorLink: authorLink,
                                selectorUsed: `${selectorUsed} + ${commentSel}`,
                                postIndex: postIndex + 1,
                                commentIndex: commentIndex + 1
                            });
                            
                            console.log(`✅ TARGET COMMENT #${stats.targetComments}: ${authorName}`);
                            console.log(`   "${commentText.substring(0, 80)}..."`);
                        }
                        
                    } catch (err) {
                        console.warn(`⚠️ Error processing comment:`, err.message);
                    }
                });
                
                // If we found comments with this selector, don't try others for this post
                if (commentEls.length > 0) break;
            }
            
        } catch (err) {
            console.warn(`⚠️ Error processing post ${postIndex}:`, err.message);
        }
    });
    
    return { comments: results, stats };
}

// Main execution function
async function runCommentScrapingTest() {
    console.log('🎯 Starting Comment Scraping Test');
    console.log('===================================');
    
    // Verify we're on the right page
    if (!window.location.href.includes('linkedin.com/in/') || !window.location.href.includes('/recent-activity/comments')) {
        console.warn('⚠️ WARNING: This script is designed to run on a LinkedIn profile\'s recent-activity/comments page');
        console.log('📍 Current URL:', window.location.href);
        console.log('💡 Navigate to: https://www.linkedin.com/in/[username]/recent-activity/comments/');
    }
    
    // Step 1: Scroll to load content
    console.log('\n📜 Step 1: Loading content...');
    await scrollAndLoadContent(3);
    
    // Step 2: Basic scraping
    console.log('\n🔍 Step 2: Basic scraping...');
    const basicResults = scrapeCommentsFromProfile(config.targetProfileId);
    
    // Step 3: Enhanced scraping
    console.log('\n🚀 Step 3: Enhanced scraping...');
    const enhancedResults = enhancedScrapeComments(config.targetProfileId);
    
    // Step 4: Display results
    console.log('\n📊 RESULTS SUMMARY');
    console.log('==================');
    console.log('🎯 Target Profile:', config.targetProfileId);
    console.log('📄 Basic Scraping:');
    console.log(`   - Total posts: ${basicResults.stats.totalPosts}`);
    console.log(`   - Total comments: ${basicResults.stats.totalComments}`);
    console.log(`   - Target comments: ${basicResults.stats.targetComments}`);
    console.log('📄 Enhanced Scraping:');
    console.log(`   - Total posts: ${enhancedResults.stats.totalPosts}`);
    console.log(`   - Total comments: ${enhancedResults.stats.totalComments}`);
    console.log(`   - Target comments: ${enhancedResults.stats.targetComments}`);
    console.log('🔍 Selectors tested:', enhancedResults.stats.selectorsTested);
    
    // Display actual comments found
    if (enhancedResults.comments.length > 0) {
        console.log('\n💬 TARGET COMMENTS FOUND:');
        console.log('========================');
        enhancedResults.comments.forEach((comment, index) => {
            console.log(`\n${index + 1}. Author: ${comment.authorName}`);
            console.log(`   Context: ${comment.context}`);
            console.log(`   Post: "${comment.postText.substring(0, 100)}..."`);
            console.log(`   Comment: "${comment.commentText}"`);
            console.log(`   Selector: ${comment.selectorUsed || 'N/A'}`);
        });
    } else {
        console.log('\n❌ No target comments found');
        console.log('💡 This could mean:');
        console.log('   - The user hasn\'t commented on any posts');
        console.log('   - Comments are hidden/private');
        console.log('   - Selectors need updating');
        console.log('   - Page hasn\'t fully loaded');
    }
    
    // Export results for further analysis
    window.kommentifyScrapingResults = {
        basic: basicResults,
        enhanced: enhancedResults,
        config: config,
        timestamp: new Date().toISOString()
    };
    
    console.log('\n💾 Results saved to window.kommentifyScrapingResults');
    console.log('✅ Test complete!');
    
    return { basicResults, enhancedResults };
}

// Auto-run if on correct page
if (window.location.href.includes('linkedin.com/in/') && window.location.href.includes('/recent-activity/comments')) {
    console.log('🚀 Auto-running comment scraping test...');
    runCommentScrapingTest();
} else {
    console.log('📋 Script loaded. Call runCommentScrapingTest() to execute.');
    console.log('💡 Make sure you\'re on a LinkedIn profile\'s recent-activity/comments page');
}

// Export functions for manual testing
window.kommentifyTest = {
    runTest: runCommentScrapingTest,
    scrapeBasic: scrapeCommentsFromProfile,
    scrapeEnhanced: enhancedScrapeComments,
    scrollAndLoad: scrollAndLoadContent,
    config: config
};

console.log('\n🔧 Available functions:');
console.log('  - runCommentScrapingTest() - Full test');
console.log('  - kommentifyTest.runTest() - Full test');
console.log('  - kommentifyTest.scrapeBasic(targetId) - Basic scraping');
console.log('  - kommentifyTest.scrapeEnhanced(targetId) - Enhanced scraping');
console.log('  - kommentifyTest.scrollAndLoad(attempts) - Scroll to load content');
