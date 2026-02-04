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
    
    // Post creation
    startPostButton: 'div.share-box-feed-entry__top-bar button',
    postEditor: 'div.editor-container > div > div > div.ql-editor',
    postSubmitButton: 'div.share-box_actions button',
    
    // Post elements
    postContainer: 'div[data-urn]',
    postUrn: 'data-urn',
    postText: 'div.fie-impression-container div.update-components-text',
    postTextSpans: 'div.fie-impression-container div.update-components-text span',
    postAuthor: 'div.update-components-actor__meta a span span:nth-child(1) span span:nth-child(1)',
    postHashtags: 'a[href*="https://www.linkedin.com/search/results/all/?keywords="]',
    
    // Comment elements
    commentEditor: 'div.ql-editor',
    commentSubmitButton: 'button.comments-comment-box__submit-button:not(:disabled), button.comments-comment-box__submit-button--cr:not(:disabled)',
    
    // Feed
    feedPosts: 'main div[data-urn]',
    
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
