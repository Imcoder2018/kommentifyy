/**
 * LINKEDIN SELECTORS CONFIGURATION
 * All CSS selectors for LinkedIn interactions - Updated with user-provided selectors
 */

export const LinkedInSelectors = {
    // Post interaction buttons
    likeButton: 'button[aria-label*="React Like"]',
    commentButton: 'button.comment-button',
    shareButton: 'button.social-reshare-button',
    shareDropdownItems: 'li:nth-child(2) div.artdeco-dropdown__item',
    followButton: 'button.follow',
    
    // Post creation (logic-based detection is preferred — see _findStartBtn helpers)
    // PRIMARY: New LinkedIn UI uses data-view-name attribute (most reliable)
    startPostButton: '[data-view-name="share-sharebox-focus"]',
    startPostButtonFallbacks: [
        '[data-view-name="share-sharebox-focus"]',      // New LinkedIn UI (2024+)
        'div.share-box-feed-entry__top-bar button',     // Legacy
        '.share-box-feed-entry__trigger'                // Legacy fallback
    ],
    postEditor: '[role="dialog"] [role="textbox"][contenteditable="true"]',
    postEditorFallbacks: [
        '[role="dialog"] [role="textbox"][contenteditable="true"]',
        '.ql-editor[contenteditable="true"]',
        '[role="dialog"] [contenteditable="true"][aria-multiline="true"]',
        '[role="dialog"] .ql-editor',
        'div.editor-content .ql-editor',
        'div.editor-container .ql-editor',
    ],
    postSubmitButton: 'div.share-box_actions button',
    
    // Post elements
    postContainer: 'div[data-urn]',
    postUrn: 'data-urn',
    postText: 'div.fie-impression-container div.update-components-text',
    postTextSpans: 'div.fie-impression-container div.update-components-text span',
    // Updated postAuthor selectors - 2025 LinkedIn UI structure
    postAuthor: 'span.update-components-actor__title span[dir="ltr"] span[aria-hidden="true"]',
    postAuthorFallbacks: [
        'span.update-components-actor__title span[dir="ltr"] span[aria-hidden="true"]',  // 2025 UI
        'div.update-components-actor__meta a span span:nth-child(1) span span:nth-child(1)',  // Legacy
        '.update-components-actor__title',  // Simple fallback
        '[aria-label^="View:"]',  // From aria-label on author link
    ],
    postHashtags: 'a[href*="https://www.linkedin.com/search/results/all/?keywords="]',

    // Post content selectors (updated with new LinkedIn UI - 2024+)
    postContentSelectors: [
        '[data-testid="expandable-text-box"]',           // New LinkedIn UI
        '[data-view-name="feed-commentary"]',              // New LinkedIn UI
        '.feed-shared-update-v2__description span[dir="ltr"]',
        '.update-components-text span[dir="ltr"]',
        '[data-update-actor-name] ~ div span[dir="ltr"]',
        '.feed-shared-update-v2__description',
        '.feed-shared-text',
        '.update-components-text',
        '.break-words',
        // NEW: 2025 LinkedIn UI - Based on provided page structure
        'p[data-view-name="feed-commentary"]',           // Post text container (legacy fallback)
        'p[data-view-name="feed-commentary"] span',     // Spans inside post text (legacy fallback)
        'span[data-view-name="feed-commentary"] span',  // Alternative span structure (legacy fallback)
        // Corrected selectors matching actual Element.md structure
        'div.update-components-text .break-words',      // Actual post text container
        'div.update-components-text .break-words span[dir="ltr"]', // Actual text spans
    ],

    // Post container selectors (updated with new LinkedIn UI - 2024+)
    postContainerSelectors: [
        '.feed-shared-update-v2',
        '[data-urn^="urn:li:activity:"]',                 // More specific URN pattern
        '[data-view-name="feed-update"]',                  // New feed wrapper
        '[data-view-name="feed-full-update"]',             // NEW: 2025 LinkedIn UI - Based on provided page structure
        'li',
        'div[data-id]'
    ],
    
    // Comment elements
    commentEditor: 'div.ql-editor',
    commentSubmitButton: 'button.comments-comment-box__submit-button:not(:disabled), button.comments-comment-box__submit-button--cr:not(:disabled)',
    
    // Feed
    feedPosts: 'main div[data-urn]',

    // NEW: Profile link selectors (2025 LinkedIn UI)
    profileLinkSelectors: [
        'a[href*="/in/"]',                                  // Standard profile links
        '[data-view-name="feed-header-actor-image"]',      // Profile image link
        '[data-view-name="feed-actor-image"]',              // Alternative profile image
        'a[data-view-name="feed-header-text"]',            // Author name link
    ],
    
    // LinkedIn URLs
    feedUrl: 'https://www.linkedin.com/feed/',
    searchResults: 'https://www.linkedin.com/search/results',
    hashtagPage: 'https://www.linkedin.com/feed/hashtag',
    
    // People Search & Connection (UPDATED December 2024 - New LinkedIn structure)
    peopleSearchUrl: 'https://www.linkedin.com/search/results/people/',
    networkFilter2nd3rd: '&network=%5B"S"%2C"O"%5D', 
    // People Search Results - NEW WORKING SELECTORS (Dec 2024)
    searchResultCard: 'div[data-view-name="search-entity-result-universal-template"]',
    profileCard: 'div[data-view-name="search-entity-result-universal-template"]',
    profileCardFallback: '[data-view-name="people-search-result"]',
    profileLink: 'a[href*="/in/"]',
    profileNameSpan: '[aria-hidden="true"]',
    connectButton: 'button[aria-label*="Invite"], button[aria-label*="Connect"]',
    messageButton: 'button[aria-label*="Message"]',
    followButton: 'button[aria-label*="Follow"]:not([aria-label*="Following"])',
    pendingButton: 'button[aria-label*="Pending"]',
    moreActionsButton: 'button.artdeco-dropdown__trigger',
    paginationNext: 'button[data-testid="pagination-controls-next-button-visible"]',
    paginationIndicator: 'button[aria-current="true"] span',
    addNoteButton: 'button[aria-label="Add a note"]',
    connectionMessageTextarea: '.ember-text-area',
    sendInviteWithNoteButton: 'button[aria-label="Send invitation"]',
    sendInviteWithoutNoteButton: 'button[aria-label="Send without a note"]',
    
    // Trending Content & News (NEW)
    newsModule: '.news-module, aside.right-rail .feed-news-module',
    newsModuleItem: '.news-module__item, .feed-news-module__item',
    newsHeadline: '.news-module__headline, .feed-news-module__headline',
    newsMetadata: '.news-module__metadata, .feed-news-module__metadata',
    trendingHashtags: '.social-details-trending-hashtags a, [data-id="trending-hashtags"] a, .trending-hashtag',
    rightRail: 'aside.right-rail'
};

export default LinkedInSelectors;
