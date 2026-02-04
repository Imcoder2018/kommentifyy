/**
 * LINKEDIN PEOPLE SEARCH AUTOMATION
 * Automated user acquisition through keyword-driven search
 * Supports Boolean logic, network filtering, pagination, and profile qualification
 */

import { browser } from '../shared/utils/browser.js';
import { storage } from '../shared/storage/storage.background.js';
import { backgroundStatistics } from './statisticsManager.js';
import { randomDelay } from '../shared/utils/helpers.js';

class PeopleSearchAutomation {
    constructor() {
        this.searchState = {
            currentPage: 1,
            lastSearchKeyword: '',
            processedProfiles: [],
            totalConnected: 0
        };
        this.stopFlag = false;
        this.activeTabId = null;
    }
    
    /**
     * Broadcast status update to the active LinkedIn tab
     * Injects status indicator directly into the page for reliability
     */
    async broadcastStatus(message, type = 'info', showStopButton = true) {
        if (!this.activeTabId) return;
        
        try {
            await chrome.scripting.executeScript({
                target: { tabId: this.activeTabId },
                func: (msg, msgType, showStop, automationType) => {
                    // Colors for different message types
                    const colors = {
                        info: '#0a66c2',
                        success: '#057642',
                        warning: '#b24020',
                        error: '#cc1016'
                    };
                    
                    // Create or get existing container
                    let container = document.getElementById('minify-status-container');
                    if (!container) {
                        container = document.createElement('div');
                        container.id = 'minify-status-container';
                        container.style.cssText = `
                            position: fixed;
                            top: 70px;
                            right: 20px;
                            z-index: 999999;
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        `;
                        document.body.appendChild(container);
                    }
                    
                    // Create indicator structure
                    container.innerHTML = `
                        <div id="minify-status-indicator" style="
                            padding: 10px 16px;
                            border-radius: 6px;
                            font-size: 13px;
                            font-weight: 600;
                            color: white;
                            box-shadow: 0 2px 12px rgba(0,0,0,0.25);
                            max-width: 320px;
                            background-color: ${colors[msgType] || colors.info};
                            display: flex;
                            align-items: center;
                            gap: 10px;
                        ">
                            <span style="flex: 1;">${msg}</span>
                            ${showStop && msgType !== 'success' ? `
                                <button id="minify-stop-btn" style="
                                    background: rgba(255,255,255,0.2);
                                    border: 1px solid rgba(255,255,255,0.5);
                                    color: white;
                                    padding: 4px 10px;
                                    border-radius: 4px;
                                    font-size: 11px;
                                    font-weight: 600;
                                    cursor: pointer;
                                    white-space: nowrap;
                                ">🛑 Stop</button>
                            ` : ''}
                        </div>
                    `;
                    
                    container.style.display = 'block';
                    container.style.opacity = '1';
                    
                    // Add stop button handler
                    const stopBtn = document.getElementById('minify-stop-btn');
                    if (stopBtn) {
                        stopBtn.onclick = () => {
                            chrome.runtime.sendMessage({ action: `stop${automationType}` });
                            stopBtn.textContent = '⏳ Stopping...';
                            stopBtn.disabled = true;
                        };
                    }
                    
                    // Clear existing timeout
                    if (window._minifyStatusTimeout) {
                        clearTimeout(window._minifyStatusTimeout);
                    }
                    
                    // Auto-hide after delay (only for success messages)
                    if (msgType === 'success') {
                        window._minifyStatusTimeout = setTimeout(() => {
                            container.style.opacity = '0';
                            setTimeout(() => { container.style.display = 'none'; }, 300);
                        }, 4000);
                    }
                },
                args: [message, type, showStopButton, 'PeopleSearch']
            });
        } catch (error) {
            // Tab might be closed or not ready, ignore
            console.log('Status broadcast failed (tab may be closed):', error.message);
        }
    }
    
    /**
     * Stop the current processing
     */
    async stopProcessing() {
        console.log("PEOPLE SEARCH: Stop signal received");
        this.stopFlag = true;
        
        // Broadcast stop status
        await this.broadcastStatus('⏹️ Stopping...', 'warning');
        
        // Immediately clear processing state
        await chrome.storage.local.set({ 
            peopleSearchActive: false,
            liveProgress: { active: false }
        });
        console.log("PEOPLE SEARCH: State cleared immediately");
        
        return { success: true, message: "Stop signal sent" };
    }

    /**
     * Build Boolean search query from user input
     * Example: "VP of Sales" -> ("VP" OR "Vice President") AND "Sales" NOT "Intern"
     */
    buildBooleanQuery(keyword, options = {}) {
        let query = keyword;

        // Apply title variations for common roles
        const titleVariations = {
            'VP': ['VP', 'Vice President'],
            'CEO': ['CEO', 'Chief Executive Officer'],
            'CTO': ['CTO', 'Chief Technology Officer'],
            'CFO': ['CFO', 'Chief Financial Officer'],
            'Director': ['Director', 'Head of'],
            'Manager': ['Manager', 'Lead']
        };

        // Apply variations if keyword contains known titles
        for (const [short, variations] of Object.entries(titleVariations)) {
            if (keyword.includes(short)) {
                const orClause = variations.map(v => `"${v}"`).join(' OR ');
                query = query.replace(short, `(${orClause})`);
            }
        }

        // Exclude unwanted terms (configurable)
        if (options.excludeTerms && options.excludeTerms.length > 0) {
            const notClause = options.excludeTerms.map(term => `NOT "${term}"`).join(' ');
            query = `${query} ${notClause}`;
        }

        return query;
    }

    /**
     * Construct LinkedIn people search URL with filters
     * @param {string} keyword - Search keyword/query
     * @param {object} options - Search options
     * @returns {string} Complete search URL
     */
    buildPeopleSearchUrl(keyword, options = {}) {
        const baseUrl = 'https://www.linkedin.com/search/results/people/';
        
        // Add keyword
        const query = options.useBooleanLogic 
            ? this.buildBooleanQuery(keyword, options)
            : keyword;
        
        let url = `${baseUrl}?keywords=${encodeURIComponent(query)}`;

        // Network filter: Target 2nd and 3rd degree connections
        // Using exact filter format: &network=%5B"S"%2C"O"%5D
        if (options.filterNetwork !== false) {
            url += '&network=%5B"S"%2C"O"%5D';
        }

        // Location filter (if provided)
        if (options.location) {
            url += `&geoUrn=${encodeURIComponent(options.location)}`;
        }

        // Current company filter (if provided)
        if (options.currentCompany) {
            url += `&currentCompany=${encodeURIComponent('["' + options.currentCompany + '"]')}`;
        }

        // Page number for pagination
        if (options.page && options.page > 1) {
            url += `&page=${options.page}`;
        }

        return url;
    }

    /**
     * Extract profile data from search result card
     * Injected function that runs in page context
     */
    extractProfileFromCard(cardElement) {
        try {
            // Get profile URL
            const linkElement = cardElement.querySelector('a.app-aware-link[href*="/in/"]');
            const profileUrl = linkElement ? linkElement.href : null;

            // Get name
            const nameElement = cardElement.querySelector('.entity-result__title-text a span[aria-hidden="true"]');
            const name = nameElement ? nameElement.textContent.trim() : 'Unknown';

            // Get headline - using updated selector .t-black
            const headlineElement = cardElement.querySelector('.t-black');
            const headline = headlineElement ? headlineElement.textContent.trim() : '';

            // Get location
            const locationElement = cardElement.querySelector('.entity-result__secondary-subtitle');
            const location = locationElement ? locationElement.textContent.trim() : '';

            // Check if already connected - using updated selectors (buttons only, not links)
            const connectButton = cardElement.querySelector('a[aria-label*="Invite"], button[aria-label*="Follow"]');
            const messageButton = cardElement.querySelector('button[aria-label*="Message"]');
            const followButton = cardElement.querySelector('button[aria-label*="Follow"]');

            let connectionStatus = 'unknown';
            if (messageButton) connectionStatus = 'connected';
            else if (followButton) connectionStatus = 'following';
            else if (connectButton) connectionStatus = 'not_connected';

            return {
                success: true,
                profileUrl,
                name,
                headline,
                location,
                connectionStatus,
                hasConnectButton: !!connectButton
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Qualify profile based on headline filtering
     * @param {object} profile - Profile data
     * @param {object} filters - Qualification filters
     * @returns {boolean} Whether profile qualifies
     */
    qualifyProfile(profile, filters = {}) {
        // Log why profile doesn't qualify for debugging
        if (!profile.success) {
            console.log(`   ❌ No success flag`);
            return false;
        }
        
        if (!profile.headline) {
            console.log(`   ❌ No headline`);
            return false;
        }

        // Must have connect button
        if (!profile.hasConnectButton) {
            console.log(`   ❌ No Connect button (already connected/pending)`);
            return false;
        }

        // Already connected/following
        if (profile.connectionStatus !== 'not_connected') {
            console.log(`   ❌ Already ${profile.connectionStatus}`);
            return false;
        }

        // Headline filtering
        if (filters.requiredTerms && filters.requiredTerms.length > 0) {
            const headlineLower = profile.headline.toLowerCase();
            const hasRequired = filters.requiredTerms.some(term => 
                headlineLower.includes(term.toLowerCase())
            );
            if (!hasRequired) {
                console.log(`   ❌ Missing required terms`);
                return false;
            }
        }

        // Exclude terms in headline
        if (filters.excludeHeadlineTerms && filters.excludeHeadlineTerms.length > 0) {
            const headlineLower = profile.headline.toLowerCase();
            const hasExcluded = filters.excludeHeadlineTerms.some(term => 
                headlineLower.includes(term.toLowerCase())
            );
            if (hasExcluded) {
                console.log(`   ❌ Contains excluded term`);
                return false;
            }
        }

        return true;
    }

    /**
     * Save lead to storage
     * @param {object} lead - Lead data
     */
    async saveLead(lead) {
        try {
            console.log('💾 SAVE LEAD: Starting to save lead:', lead.name);
            console.log('💾 SAVE LEAD: Lead data:', JSON.stringify(lead, null, 2));
            
            // Generate unique ID
            lead.id = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            lead.collectedAt = new Date().toISOString();
            
            console.log('💾 SAVE LEAD: Generated ID:', lead.id);
            
            // Get existing leads
            const allLeads = await storage.getArray('leads', []);
            const leadsByQuery = await storage.getObject('leadsByQuery', {});
            
            console.log(`💾 SAVE LEAD: Current total leads: ${allLeads.length}`);
            console.log(`💾 SAVE LEAD: Current queries:`, Object.keys(leadsByQuery));
            
            // Check if lead already exists
            const existingIndex = allLeads.findIndex(l => l.profileUrl === lead.profileUrl);
            if (existingIndex >= 0) {
                // Update existing lead
                console.log('💾 SAVE LEAD: Updating existing lead at index:', existingIndex);
                allLeads[existingIndex] = { ...allLeads[existingIndex], ...lead, collectedAt: allLeads[existingIndex].collectedAt };
            } else {
                // Add new lead at the beginning (newest first)
                console.log('💾 SAVE LEAD: Adding new lead at top');
                allLeads.unshift(lead);
            }
            
            // Index by query
            if (!leadsByQuery[lead.searchQuery]) {
                console.log(`💾 SAVE LEAD: Creating new query index for "${lead.searchQuery}"`);
                leadsByQuery[lead.searchQuery] = [];
            }
            if (!leadsByQuery[lead.searchQuery].includes(lead.id)) {
                leadsByQuery[lead.searchQuery].push(lead.id);
                console.log(`💾 SAVE LEAD: Added lead to query "${lead.searchQuery}"`);
            }
            
            console.log(`💾 SAVE LEAD: Leads for query "${lead.searchQuery}": ${leadsByQuery[lead.searchQuery].length}`);
            
            // Save to storage
            console.log('💾 SAVE LEAD: Writing to storage...');
            await storage.setArray('leads', allLeads);
            await storage.setObject('leadsByQuery', leadsByQuery);
            
            // Verify save
            const verifyLeads = await storage.getArray('leads', []);
            console.log(`✅ SAVE LEAD: Successfully saved! Total leads now: ${verifyLeads.length}`);
            console.log(`✅ SAVE LEAD: Verified in storage: ${verifyLeads.length} leads`);
        } catch (error) {
            console.error('❌ SAVE LEAD: Error saving lead:', error);
            console.error('❌ SAVE LEAD: Lead data:', lead);
            throw error;
        }
    }

    /**
     * Update lead connection status
     * @param {string} profileUrl - Profile URL
     * @param {string} status - Connection status
     */
    async updateLeadConnectionStatus(profileUrl, status) {
        console.log(`📝 UPDATE STATUS: Updating connection status for ${profileUrl} to ${status}`);
        
        const allLeads = await storage.getArray('leads', []);
        const lead = allLeads.find(l => l.profileUrl === profileUrl);
        
        if (lead) {
            console.log(`📝 UPDATE STATUS: Found lead: ${lead.name}`);
            lead.connectionStatus = status;
            if (status === 'connected' || status === 'pending') {
                lead.connectedAt = new Date().toISOString();
                console.log(`📝 UPDATE STATUS: Set connectedAt: ${lead.connectedAt}`);
            }
            await storage.setArray('leads', allLeads);
            console.log(`✅ UPDATE STATUS: Successfully updated lead status`);
            
            // Record statistics and track backend usage
            try {
                await backgroundStatistics.recordConnectionRequest(lead.name, lead.headline);
                console.log(`📊 UPDATE STATUS: Recorded connection statistics`);
            } catch (statError) {
                console.error(`⚠️ UPDATE STATUS: Failed to record statistics:`, statError.message);
                if (statError.message.includes('limit reached')) {
                    console.error(`🚫 UPDATE STATUS: ${statError.message}`);
                    throw statError; // Propagate error to stop automation
                }
            }
        } else {
            console.warn(`⚠️ UPDATE STATUS: Lead not found for ${profileUrl}`);
        }
    }

    /**
     * Extract contact information from profile
     * @param {string} profileUrl - Profile URL
     */
    async extractContactInfo(profileUrl) {
        const contactUrl = profileUrl.includes('/overlay/contact-info/') 
            ? profileUrl 
            : `${profileUrl}/overlay/contact-info/`;
        
        const tabId = await browser.openTab(contactUrl, false);
        if (!tabId) return { email: null, phone: null };
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const result = await chrome.scripting.executeScript({
            target: { tabId },
            func: () => {
                try {
                    const sectionInfo = document.querySelector('.section-info, .pv-contact-info__contact-type');
                    if (!sectionInfo) {
                        return { email: null, phone: null };
                    }
                    
                    let email = null;
                    let phone = null;
                    
                    // Extract email
                    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
                    if (emailLinks.length > 0) {
                        email = emailLinks[0].href.replace('mailto:', '').trim();
                    }
                    
                    // Extract phone
                    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
                    if (phoneLinks.length > 0) {
                        phone = phoneLinks[0].href.replace('tel:', '').trim();
                    }
                    
                    // Alternative: look in section-info text
                    if (!phone) {
                        const phoneMatch = sectionInfo.textContent.match(/[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}/);
                        if (phoneMatch) {
                            phone = phoneMatch[0].trim();
                        }
                    }
                    
                    return { email, phone };
                } catch (error) {
                    return { email: null, phone: null };
                }
            }
        });
        
        chrome.tabs.remove(tabId).catch(() => {});
        
        return result[0]?.result || { email: null, phone: null };
    }

    /**
     * Send connection request to a profile
     * @param {object} profile - Profile data
     * @param {string} message - Optional connection message
     * @param {boolean} sendWithNote - Whether to send with note or not
     */
    async sendConnectionRequest(profile, message = '', sendWithNote = false) {
        try {
            console.log(`🔗 PEOPLE SEARCH: Sending connection request to ${profile.name}`);
            console.log(`🔗 PEOPLE SEARCH: Profile URL: ${profile.profileUrl}`);
            
            // Extract vanity name from profile URL
            const vanityMatch = profile.profileUrl.match(/\/in\/([^\/]+)/);
            if (!vanityMatch) {
                throw new Error('Invalid LinkedIn profile URL');
            }
            const vanityName = vanityMatch[1];
            
            // Open direct invitation URL (same as Import tab)
            const inviteUrl = `https://www.linkedin.com/preload/custom-invite/?vanityName=${vanityName}`;
            console.log(`🔗 PEOPLE SEARCH: Opening direct invite URL: ${inviteUrl}`);
            
            const tabId = await browser.openTab(inviteUrl, false);
            if (!tabId) {
                throw new Error('Failed to open invite tab');
            }

            // Wait for page load - invitation modal loads faster
            console.log('⏳ PEOPLE SEARCH: Waiting for invitation modal to load...');
            await new Promise(resolve => setTimeout(resolve, 3000));

            const result = await chrome.scripting.executeScript({
                target: { tabId },
                func: (sendWithNote, message) => {
                    try {
                        console.log(`🔗 SCRIPT: Looking for invitation button (sendWithNote: ${sendWithNote})...`);
                        
                        if (sendWithNote && message) {
                            // Look for "Add a note" button first
                            console.log('🔗 SCRIPT: Looking for "Add a note" button...');
                            
                            const addNoteBtnSelectors = [
                                'button[aria-label="Add a note"]',
                                'button[data-control-name="add_note"]'
                            ];
                            
                            let addNoteBtn = null;
                            for (const selector of addNoteBtnSelectors) {
                                addNoteBtn = document.querySelector(selector);
                                if (addNoteBtn) {
                                    console.log(`🔗 SCRIPT: Found "Add a note" button with selector: ${selector}`);
                                    break;
                                }
                            }
                            
                            // Fallback: search by button text
                            if (!addNoteBtn) {
                                const allButtons = document.querySelectorAll('button');
                                for (const btn of allButtons) {
                                    const text = btn.textContent?.trim().toLowerCase();
                                    if (text.includes('add a note') || text.includes('add note')) {
                                        addNoteBtn = btn;
                                        console.log(`🔗 SCRIPT: Found "Add a note" button by text: ${text}`);
                                        break;
                                    }
                                }
                            }
                            
                            if (addNoteBtn) {
                                console.log('🔗 SCRIPT: Clicking "Add a note" button...');
                                addNoteBtn.click();
                                
                                // Wait for note textarea to appear
                                setTimeout(() => {
                                    const textarea = document.querySelector('textarea[name="message"]') || 
                                                   document.querySelector('textarea[placeholder*="note"]') ||
                                                   document.querySelector('textarea');
                                    
                                    if (textarea) {
                                        console.log('🔗 SCRIPT: Adding note message...');
                                        textarea.value = message;
                                        textarea.dispatchEvent(new Event('input', { bubbles: true }));
                                        textarea.dispatchEvent(new Event('change', { bubbles: true }));
                                        
                                        // Look for "Send invitation" button after adding note
                                        setTimeout(() => {
                                            const sendBtn = document.querySelector('button[aria-label="Send invitation"]') ||
                                                          document.querySelector('button[data-control-name="send"]');
                                            
                                            if (sendBtn && !sendBtn.disabled) {
                                                console.log('🔗 SCRIPT: Clicking "Send invitation" button with note...');
                                                sendBtn.click();
                                            }
                                        }, 1000);
                                    }
                                }, 1000);
                                
                                return { success: true, note: 'Sent with note' };
                            }
                        }
                        
                        // Send without note - look for send buttons
                        console.log('🔗 SCRIPT: Looking for "Send without a note" button...');
                        const sendBtnSelectors = [
                            'button[aria-label="Send without a note"]',
                            'button[aria-label="Send invitation"]',
                            'button[data-control-name="invite"]'
                        ];
                        
                        let sendBtn = null;
                        for (const selector of sendBtnSelectors) {
                            sendBtn = document.querySelector(selector);
                            if (sendBtn) {
                                console.log(`🔗 SCRIPT: Found send button with selector: ${selector}`);
                                break;
                            }
                        }
                        
                        // Fallback: search by button text
                        if (!sendBtn) {
                            const allButtons = document.querySelectorAll('button');
                            for (const btn of allButtons) {
                                const text = btn.textContent?.trim().toLowerCase();
                                if (text.includes('send without') || text.includes('send invitation')) {
                                    sendBtn = btn;
                                    console.log(`🔗 SCRIPT: Found send button by text: ${text}`);
                                    break;
                                }
                            }
                        }

                        if (!sendBtn) {
                            console.log('🔗 SCRIPT: Send button not found');
                            return { success: false, error: 'Send button not found' };
                        }

                        console.log('🔗 SCRIPT: Clicking send button...');
                        sendBtn.click();
                        
                        console.log('🔗 SCRIPT: Connection request sent successfully');
                        return { success: true };

                    } catch (error) {
                        console.error('🔗 SCRIPT: Error sending connection:', error);
                        return { success: false, error: error.message };
                    }
                },
                args: [sendWithNote, message]
            });

            // Wait 7 seconds before closing tab to allow connection request to process
            console.log('⏳ PEOPLE SEARCH: Waiting 7 seconds before closing tab...');
            await new Promise(resolve => setTimeout(resolve, 7000));
            
            // Close tab
            await chrome.tabs.remove(tabId);

            return result[0]?.result || { success: false, error: 'No result returned' };

        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * OLD DEPRECATED METHOD - DO NOT USE
     * Kept for reference only
     */
    async _sendConnectionRequestFromCard_OLD(tabId, profile, message = '') {
        console.log(`DEPRECATED: This method is no longer used`);
        return { success: false, reason: 'Deprecated method' };
    }

    /**
     * Scrape profiles from current search results page
     * Uses updated selectors that work with LinkedIn's new HTML structure
     * @param {number} tabId - Tab ID of search page
     * @returns {Array} Array of profile objects
     */
    async scrapeSearchResults(tabId) {
        const result = await chrome.scripting.executeScript({
            target: { tabId },
            func: () => {
                const profiles = [];
                
                // Helper function to clean text
                function cleanText(text) {
                    if (!text) return null;
                    return text
                        .replace(/<!--[\s\S]*?-->/g, '') // Remove HTML comments
                        .replace(/\s+/g, ' ')            // Collapse whitespace
                        .trim();
                }

                // Helper function to extract data from a single card
                function extractSingleCardData(card) {
                    // 1. Find all profile links in the card
                    var allLinks = card.querySelectorAll('a[href*="/in/"]');
                    var nameLink = null;

                    // 2. Filter to find the Text Link (Name) vs Image Link (Avatar)
                    for (var i = 0; i < allLinks.length; i++) {
                        var link = allLinks[i];
                        // Image links usually contain an image
                        // Name links usually contain the text directly or in an aria-hidden span
                        if (!link.querySelector('img') && !link.classList.contains('ivm-image-view-model')) {
                            // Check if it has the aria-hidden span (common for names)
                            if (link.querySelector('[aria-hidden="true"]')) {
                                nameLink = link;
                                break;
                            }
                        }
                    }

                    // Fallback: If strict filter failed, try the second link (usually name)
                    if (!nameLink && allLinks.length > 1) {
                        nameLink = allLinks[1];
                    } else if (!nameLink && allLinks.length === 1) {
                        nameLink = allLinks[0];
                    }

                    if (!nameLink) {
                        return null;
                    }

                    // 3. Extract Name
                    var nameSpan = nameLink.querySelector('[aria-hidden="true"]');
                    var rawName = nameSpan ? nameSpan.textContent : nameLink.textContent;
                    var name = cleanText(rawName);

                    // 4. Find the "Name Row" Container and extract Headline/Location
                    var nameRow = nameLink;
                    var headlineRow = null;
                    var maxLevels = 8;
                    var currentLevel = 0;

                    while (nameRow && nameRow.parentElement !== card && currentLevel < maxLevels) {
                        var sibling = nameRow.nextElementSibling;
                        
                        if (nameRow.tagName === 'DIV' && sibling && sibling.tagName === 'DIV') {
                            var siblingText = cleanText(sibling.textContent);
                            if (siblingText && siblingText.length > 2 && 
                                !siblingText.includes('Connect') && !siblingText.includes('Follow')) {
                                headlineRow = sibling;
                                break;
                            }
                        }
                        nameRow = nameRow.parentElement;
                        currentLevel++;
                    }

                    // 5. Extract Headline & Location
                    var headline = null;
                    var location = null;

                    if (headlineRow) {
                        headline = cleanText(headlineRow.textContent);
                        
                        var nextAfterHeadline = headlineRow.nextElementSibling;
                        if (nextAfterHeadline && nextAfterHeadline.tagName === 'DIV') {
                            location = cleanText(nextAfterHeadline.textContent);
                        }
                    }

                    // Clean profile URL
                    var profileUrl = nameLink.href;
                    if (profileUrl && profileUrl.indexOf('?') > -1) {
                        profileUrl = profileUrl.split('?')[0];
                    }

                    return {
                        name: name,
                        headline: headline,
                        location: location,
                        profileUrl: profileUrl
                    };
                }

                // Use the updated selector for search result cards
                const cards = document.querySelectorAll('div[data-view-name="search-entity-result-universal-template"]');
                
                // Fallback to old selector if new one doesn't work
                const fallbackCards = cards.length === 0 ? 
                    document.querySelectorAll('[data-view-name="people-search-result"]') : [];
                
                const allCards = cards.length > 0 ? cards : fallbackCards;
                
                console.log(`🔍 SCRAPER: Found ${allCards.length} profile cards on page`);
                
                allCards.forEach((card, index) => {
                    try {
                        const profileData = extractSingleCardData(card);
                        
                        if (profileData && profileData.profileUrl) {
                            // Check connection status
                            const connectButton = card.querySelector('button[aria-label*="Invite"], button[aria-label*="Connect"]');
                            const messageButton = card.querySelector('button[aria-label*="Message"]');
                            const followButton = card.querySelector('button[aria-label*="Follow"]:not([aria-label*="Following"])');
                            const pendingButton = card.querySelector('button[aria-label*="Pending"]');

                            let connectionStatus = 'unknown';
                            if (messageButton) connectionStatus = 'connected';
                            else if (pendingButton) connectionStatus = 'pending';
                            else if (followButton && !connectButton) connectionStatus = 'following';
                            else if (connectButton) connectionStatus = 'not_connected';

                            profiles.push({
                                success: true,
                                profileUrl: profileData.profileUrl,
                                name: profileData.name || 'Unknown',
                                headline: profileData.headline || '',
                                location: profileData.location || '',
                                connectionStatus,
                                hasConnectButton: !!connectButton
                            });
                            console.log(`✅ SCRAPER: Extracted profile ${index + 1}: ${profileData.name} (${connectionStatus})`);
                        }
                    } catch (error) {
                        console.error('❌ SCRAPER: Error extracting profile:', error);
                    }
                });

                console.log(`🎯 SCRAPER: Successfully extracted ${profiles.length} profiles`);
                return profiles;
            }
        });

        return result[0].result || [];
    }

    /**
     * Navigate to next page in search results
     * @param {number} tabId - Tab ID of search page
     * @returns {boolean} Whether next page exists
     */
    async goToNextPage(tabId) {
        const result = await chrome.scripting.executeScript({
            target: { tabId },
            func: async () => {
                // First, scroll to bottom of page to ensure pagination is loaded
                console.log('🔍 PAGINATION: Scrolling to bottom to load pagination...');
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                
                // Wait for scroll and content to load
                await new Promise(r => setTimeout(r, 2000));
                
                // Try multiple selectors for next page button
                const nextSelectors = [
                    'button[aria-label="Next"]',
                    'button.artdeco-pagination__button--next',
                    'button[aria-label*="next" i]',
                    'button[data-test-pagination-page-btn][aria-label="Next"]',
                    '.artdeco-pagination button:last-child'
                ];
                
                // Log all pagination buttons found
                const paginationContainer = document.querySelector('.artdeco-pagination');
                const allPaginationBtns = document.querySelectorAll('.artdeco-pagination button, [data-test-pagination-page-btn]');
                console.log(`🔍 PAGINATION: Container found: ${!!paginationContainer}`);
                console.log(`🔍 PAGINATION: Found ${allPaginationBtns.length} pagination buttons total`);
                
                // Log each button for debugging
                allPaginationBtns.forEach((btn, i) => {
                    console.log(`🔍 PAGINATION: Button ${i}: aria-label="${btn.getAttribute('aria-label')}", disabled=${btn.disabled}, text="${btn.textContent.trim().substring(0, 20)}"`);
                });
                
                let nextBtn = null;
                for (const selector of nextSelectors) {
                    const btn = document.querySelector(selector);
                    if (btn) {
                        console.log(`🔍 PAGINATION: Found button with "${selector}" - disabled: ${btn.disabled}`);
                        if (!btn.disabled) {
                            nextBtn = btn;
                            break;
                        }
                    }
                }
                
                // Fallback: try to find by text content
                if (!nextBtn) {
                    const allButtons = document.querySelectorAll('button');
                    for (const btn of allButtons) {
                        if (btn.textContent.includes('Next') || btn.getAttribute('aria-label')?.includes('Next')) {
                            if (!btn.disabled) {
                                console.log(`🔍 PAGINATION: Found Next button by text search`);
                                nextBtn = btn;
                                break;
                            }
                        }
                    }
                }
                
                if (nextBtn && !nextBtn.disabled) {
                    console.log(`🔍 PAGINATION: Clicking next button...`);
                    nextBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    await new Promise(r => setTimeout(r, 500));
                    nextBtn.click();
                    return { success: true };
                }
                
                console.log(`🔍 PAGINATION: No enabled next button found`);
                return { success: false, reason: 'Next button not found or disabled' };
            }
        });

        const success = result[0]?.result?.success || false;
        console.log(`PEOPLE SEARCH: goToNextPage result: ${success}`);
        return success;
    }

    /**
     * Save search state for resume capability
     */
    async saveSearchState() {
        await storage.setObject('peopleSearchState', this.searchState);
    }

    /**
     * Load saved search state
     */
    async loadSearchState() {
        const saved = await storage.getObject('peopleSearchState');
        if (saved) {
            this.searchState = { ...this.searchState, ...saved };
        }
    }

    /**
     * Main automation loop for people search and connect
     * @param {string} keyword - Search keyword
     * @param {number} targetConnections - Number of connections to send
     * @param {object} options - Configuration options
     */
    async autoConnectFromSearch(keyword, targetConnections = 10, options = {}) {
        // Reset stop flag
        this.stopFlag = false;
        
        // Set active flag for dashboard monitoring
        await chrome.storage.local.set({ peopleSearchActive: true });
        
        // Record session start
        const sessionStartTime = Date.now();
        let sessionData = {
            type: 'networking',
            query: keyword,
            target: targetConnections,
            startTime: sessionStartTime,
            options: options
        };
        
        // Record session start immediately for accountability
        const recordSessionStart = async () => {
            console.log('📝 DEBUG: Recording networking session START immediately');
            sessionData.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
            sessionData.status = 'started';
            sessionData.processed = 0;
            sessionData.successful = 0;
            sessionData.endTime = sessionData.startTime;
            sessionData.duration = 0;
            
            try {
                const { processingHistory = [] } = await chrome.storage.local.get('processingHistory');
                processingHistory.unshift({...sessionData});
                if (processingHistory.length > 100) {
                    processingHistory.splice(100);
                }
                await chrome.storage.local.set({ processingHistory });
                console.log('📝 DEBUG: Networking session START recorded to storage');
            } catch (error) {
                console.warn('Failed to record networking session start:', error);
            }
        };
        
        // Helper function to record/update session
        const recordSession = async (status, processed = 0, successful = 0, error = null) => {
            console.log(`📝 DEBUG: Recording networking session - status: ${status}, processed: ${processed}, successful: ${successful}`);
            
            sessionData.endTime = Date.now();
            sessionData.duration = sessionData.endTime - sessionData.startTime;
            sessionData.processed = successful; // For networking, show connections sent, not qualified profiles found
            sessionData.successful = successful;
            sessionData.status = status;
            sessionData.successRate = successful > 0 ? 100 : 0; // For networking, success rate is 100% if any connections sent, 0% if none
            if (error) sessionData.error = error;
            
            try {
                const { processingHistory = [] } = await chrome.storage.local.get('processingHistory');
                
                // Find existing session by ID and update it
                const existingIndex = processingHistory.findIndex(s => s.id === sessionData.id);
                if (existingIndex >= 0) {
                    console.log('📝 DEBUG: Updating existing networking session');
                    processingHistory[existingIndex] = {...sessionData};
                } else {
                    console.log('📝 DEBUG: Adding new networking session');
                    processingHistory.unshift({...sessionData});
                }
                
                if (processingHistory.length > 100) {
                    processingHistory.splice(100);
                }
                await chrome.storage.local.set({ processingHistory });
                console.log(`📝 ${status} networking session recorded to history`);
            } catch (historyError) {
                console.warn('Failed to record networking session:', historyError);
            }
        };
        
        // Record session start immediately
        await recordSessionStart();
        
        console.log('PEOPLE SEARCH: Starting automation');
        console.log(`PEOPLE SEARCH: Source: ${options._source || 'keyword'}`);
        console.log(`PEOPLE SEARCH: Keyword: ${keyword}`);
        console.log(`PEOPLE SEARCH: Search URL: ${options._searchUrl || 'N/A'}`);
        console.log(`PEOPLE SEARCH: Target connections: ${targetConnections}`);
        console.log(`PEOPLE SEARCH: Options:`, options);
        
        // Update session query to reflect source type
        if (options._source === 'url' && options._searchUrl) {
            sessionData.query = `URL: ${options._searchUrl.substring(0, 50)}...`;
        }
        
        // Apply networking start delay from limits settings with stop flag checking
        const { delaySettings } = await chrome.storage.local.get('delaySettings');
        const networkingStartDelay = (delaySettings && delaySettings.networkingStartDelay) || 0;
        if (networkingStartDelay > 0) {
            console.log(`⏰ NETWORKING DELAY: Waiting ${networkingStartDelay}s before starting networking...`);
            
            // Wait in 1-second intervals, checking stop flag each time
            for (let i = 0; i < networkingStartDelay; i++) {
                if (this.stopFlag) {
                    console.log('⏹️ NETWORKING DELAY: Stop requested during start delay');
                    await recordSession('stopped', 0, 0);
                    return { 
                        success: true, 
                        message: 'Stopped during start delay',
                        connected: 0, 
                        target: targetConnections,
                        pagesProcessed: 0
                    };
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        // Check stop flag one final time before opening tab
        if (this.stopFlag) {
            console.log('⏹️ PEOPLE SEARCH: Stop requested before opening tab');
            await recordSession('stopped', 0, 0);
            return { 
                success: true, 
                message: 'Stopped before opening tab',
                connected: 0, 
                target: targetConnections,
                pagesProcessed: 0
            };
        }
        
        let connected = 0;
        const profiles = [];
        let currentPage = 1;
        const maxPages = 5;
        
        try {
            // Build LinkedIn search URL or use provided URL
            let searchUrl;
            
            if (options._source === 'url' && options._searchUrl) {
                // Use the provided search URL directly
                searchUrl = options._searchUrl;
                console.log(`PEOPLE SEARCH: Using provided URL mode`);
            } else {
                // Build URL from keyword
                searchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(keyword)}`;
                
                // Add filters if specified
                if (options.filterNetwork) {
                    searchUrl += '&network=%5B"S"%5D'; // 2nd-degree connections
                }
            }
            
            console.log(`PEOPLE SEARCH: Opening search URL: ${searchUrl}`);
            
            // Open tab and get tab ID immediately (don't wait for full page load)
            const tab = await chrome.tabs.create({
                url: searchUrl,
                active: true
            });
            
            const searchTabId = tab.id;
            
            if (!searchTabId) {
                throw new Error('Failed to open LinkedIn search tab: No tab ID returned');
            }
            
            console.log(`PEOPLE SEARCH: Search tab opened (ID: ${searchTabId})`);
            this.activeTabId = searchTabId;
            
            // Smart wait for search results - up to 60 seconds but proceed early when ready
            console.log(`⏳ PEOPLE SEARCH: Waiting for search page to fully load...`);
            await this.broadcastStatus(`🔍 Searching: "${keyword}"`, 'info');
            
            // Wait for page to load with smart polling (max 60 seconds)
            const maxWaitTime = 60000; // 60 seconds max
            const pollInterval = 2000; // Check every 2 seconds
            const startTime = Date.now();
            let pageReady = false;
            
            while (Date.now() - startTime < maxWaitTime && !pageReady) {
                try {
                    const result = await chrome.scripting.executeScript({
                        target: { tabId: searchTabId },
                        func: () => {
                            // Check if search results container exists and has profiles
                            const resultsContainer = document.querySelector('.search-results-container, [data-view-name="search-entity-result-universal-template"]');
                            const profiles = document.querySelectorAll('[data-chameleon-result-urn]');
                            const spinner = document.querySelector('.artdeco-spinner, .search-results__loading');
                            
                            return {
                                hasContainer: !!resultsContainer,
                                profileCount: profiles.length,
                                isLoading: !!spinner,
                                documentReady: document.readyState === 'complete'
                            };
                        }
                    });
                    
                    const status = result[0]?.result;
                    if (status && status.profileCount > 0 && !status.isLoading && status.documentReady) {
                        console.log(`✅ PEOPLE SEARCH: Page ready with ${status.profileCount} profiles (${Math.round((Date.now() - startTime) / 1000)}s)`);
                        pageReady = true;
                        break;
                    }
                    
                    const elapsed = Math.round((Date.now() - startTime) / 1000);
                    console.log(`⏳ PEOPLE SEARCH: Waiting... ${elapsed}s (profiles: ${status?.profileCount || 0}, loading: ${status?.isLoading})`);
                    await this.broadcastStatus(`⏳ Loading page... ${elapsed}s`, 'info');
                    
                } catch (e) {
                    console.log(`⏳ PEOPLE SEARCH: Page not ready yet...`);
                }
                
                await new Promise(resolve => setTimeout(resolve, pollInterval));
            }
            
            if (!pageReady) {
                console.log(`⚠️ PEOPLE SEARCH: Max wait time reached, proceeding anyway...`);
                await this.broadcastStatus(`⚠️ Page load timeout, proceeding...`, 'warning');
            }
            
            // Additional buffer for any final rendering
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Main search loop
            while (connected < targetConnections && currentPage <= maxPages && !this.stopFlag) {
                console.log(`\n========== PAGE ${currentPage} ==========`);
                console.log(`PEOPLE SEARCH: Connected: ${connected}/${targetConnections}`);
                
                // Scrape profiles with retry logic for slow-loading pages
                let pageProfiles = await this.scrapeSearchResults(searchTabId);
                
                // If no profiles found, wait longer and retry (LinkedIn may still be loading)
                if (pageProfiles.length === 0) {
                    console.log(`⏳ PEOPLE SEARCH: No profiles found, waiting for page to fully load...`);
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    
                    // Scroll down to trigger lazy loading
                    await chrome.scripting.executeScript({
                        target: { tabId: searchTabId },
                        func: () => {
                            window.scrollTo(0, document.body.scrollHeight / 2);
                        }
                    });
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                    // Retry scraping
                    pageProfiles = await this.scrapeSearchResults(searchTabId);
                    console.log(`🔄 PEOPLE SEARCH: Retry found ${pageProfiles.length} profiles`);
                }
                
                console.log(`PEOPLE SEARCH: Found ${pageProfiles.length} profiles on page ${currentPage}`);
                await this.broadcastStatus(`📄 Page ${currentPage}: Found ${pageProfiles.length} profiles`, 'info');
                
                // Process each profile
                for (const profile of pageProfiles) {
                    if (connected >= targetConnections || this.stopFlag) {
                        console.log('PEOPLE SEARCH: Quota reached or stop requested');
                        break;
                    }
                    
                    // Check if already processed
                    if (this.searchState.processedProfiles.includes(profile.profileUrl)) {
                        console.log(`PEOPLE SEARCH: Skipping already processed profile: ${profile.name}`);
                        continue;
                    }
                    
                    // Qualify profile
                    const filters = {
                        requiredTerms: options.requiredTerms || [],
                        excludeHeadlineTerms: options.excludeHeadlineTerms || []
                    };
                    
                    if (!this.qualifyProfile(profile, filters)) {
                        console.log(`PEOPLE SEARCH: Profile does not qualify: ${profile.name} - ${profile.headline}`);
                        continue;
                    }
                    
                    console.log(`\n✅ QUALIFIED PROFILE: ${profile.name}`);
                    console.log(`   Headline: ${profile.headline}`);
                    console.log(`   Location: ${profile.location}`);
                    
                    // Create lead object
                    const lead = {
                        name: profile.name,
                        profileUrl: profile.profileUrl,
                        headline: profile.headline,
                        location: profile.location,
                        searchQuery: keyword,
                        connectionStatus: 'not_connected',
                        email: null,
                        phone: null
                    };
                    
                    // Check if user wants to send connection request
                    // If sendWithNote is true, we MUST send connection (can't send note without connecting)
                    // Default to true if not explicitly set to false
                    const shouldSendConnection = options.sendWithNote === true || 
                                                 options.sendConnectionRequest === true || 
                                                 options.sendConnectionRequest === undefined || 
                                                 options.sendConnectionRequest === null;
                    
                    console.log(`PEOPLE SEARCH: shouldSendConnection=${shouldSendConnection} (sendWithNote=${options.sendWithNote}, sendConnectionRequest=${options.sendConnectionRequest})`);
                    
                    // Extract email/phone if enabled
                    if (options.extractContactInfo) {
                        console.log(`PEOPLE SEARCH: Extracting contact info for ${profile.name}...`);
                        const contactInfo = await this.extractContactInfo(profile.profileUrl);
                        lead.email = contactInfo.email;
                        lead.phone = contactInfo.phone;
                        console.log(`PEOPLE SEARCH: Email: ${lead.email || 'N/A'}, Phone: ${lead.phone || 'N/A'}`);
                    }
                    
                    if (!shouldSendConnection) {
                        // User chose not to send connection requests
                        console.log(`PEOPLE SEARCH: Skipping connection request (sendConnectionRequest is disabled)`);
                        
                        // Save lead
                        await this.saveLead(lead);
                        connected++; // Count toward quota even if not sending connection
                        this.searchState.processedProfiles.push(profile.profileUrl);
                        continue;
                    }
                    
                    // Send connection request
                    console.log(`PEOPLE SEARCH: Sending connection request to ${profile.name}...`);
                    await this.broadcastStatus(`📤 Connecting: ${profile.name} (${connected}/${targetConnections})`, 'info');
                    
                    let message = '';
                    if (options.sendWithNote && options.connectionMessage) {
                        message = options.connectionMessage;
                        // Replace [Name] placeholder with actual name
                        if (message.includes('[Name]')) {
                            message = message.replace(/\[Name\]/g, profile.name);
                            console.log(`PEOPLE SEARCH: Personalized message: "${message.substring(0, 50)}..."`);
                        }
                    } else {
                        console.log(`PEOPLE SEARCH: Sending without personalized note (sendWithNote: ${options.sendWithNote})`);
                    }
                    
                    // Use new method that opens direct invite URL (like Import tab)
                    const sendResult = await this.sendConnectionRequest(profile, message, options.sendWithNote);

                    // COUNT BOTH SUCCESS AND FAILURE toward quota to prevent infinite loop
                    connected++;
                    this.searchState.processedProfiles.push(profile.profileUrl);
                    
                    if (sendResult.success) {
                        this.searchState.totalConnected++;
                        
                        // Save lead to storage ONLY on successful connection
                        lead.connectionStatus = 'pending';
                        await this.saveLead(lead);
                        
                        // Update lead connection status
                        await this.updateLeadConnectionStatus(profile.profileUrl, 'pending');
                        
                        console.log(`✅ SUCCESS: Connection request sent to ${profile.name}`);
                        console.log(`   Total connected: ${this.searchState.totalConnected}`);
                        console.log(`   Remaining: ${targetConnections - connected}`);
                        await this.broadcastStatus(`✅ Connected: ${profile.name} (${connected}/${targetConnections})`, 'success');
                    } else {
                        console.error(`❌ FAILED: Could not send connection to ${profile.name}`);
                        console.error(`   Reason: ${sendResult.reason || sendResult.error || 'Unknown'}`);
                        await this.broadcastStatus(`⚠️ Skipped: ${profile.name}`, 'warning');
                    }
                    
                    // Load networking delay settings from Limits tab
                    const delayData = await chrome.storage.local.get('delaySettings');
                    const delaySettings = delayData.delaySettings || {};
                    const minDelay = (delaySettings.networkingMinDelay || 45) * 1000; // Convert to milliseconds
                    const maxDelay = (delaySettings.networkingMaxDelay || 90) * 1000; // Convert to milliseconds
                    
                    // Random delay between min and max
                    const delay = minDelay + Math.floor(Math.random() * (maxDelay - minDelay));
                    const delaySeconds = Math.round(delay / 1000);
                    console.log(`⏰ NETWORKING DELAY: Waiting ${delaySeconds}s (${minDelay/1000}-${maxDelay/1000}s range) before next profile...`);
                    
                    // Show countdown in status indicator
                    for (let remaining = delaySeconds; remaining > 0; remaining -= 5) {
                        if (this.stopFlag) break;
                        await this.broadcastStatus(`⏳ Next profile in ${remaining}s...`, 'info');
                        await new Promise(resolve => setTimeout(resolve, Math.min(5000, remaining * 1000)));
                    }
                }
                
                // Go to next page if quota not reached
                if (connected < targetConnections && !this.stopFlag) {
                    console.log(`\nPEOPLE SEARCH: Moving to next page...`);
                    const hasNextPage = await this.goToNextPage(searchTabId);
                    
                    if (!hasNextPage) {
                        console.log('PEOPLE SEARCH: No more pages available');
                        break;
                    }
                    
                    currentPage++;
                    await new Promise(resolve => setTimeout(resolve, 4000)); // Wait for page load
                } else {
                    break;
                }
            }
            
            // Broadcast completion before closing tab
            await this.broadcastStatus(`🎉 Complete! ${this.searchState.totalConnected} connected`, 'success');
            await new Promise(resolve => setTimeout(resolve, 2000)); // Let user see the message
            
            // Close search tab
            await chrome.tabs.remove(searchTabId).catch(() => {});
            
            // Record successful completion
            await recordSession('completed', connected, this.searchState.totalConnected);
            
            console.log('\n========== AUTOMATION COMPLETE ==========');
            console.log(`Total connections sent: ${this.searchState.totalConnected}`);
            console.log(`Total profiles processed: ${connected}`);
            
        } catch (error) {
            console.error('PEOPLE SEARCH: Fatal error:', error);
            
            // Record error
            await recordSession('error', connected, this.searchState.totalConnected, error.message);
            
            throw error;
        } finally {
            // Clear active flag
            await chrome.storage.local.set({ peopleSearchActive: false });
            
            // Save final state
            await this.saveSearchState();
        }
    }

    /**
     * Alias for autoConnectFromSearch (backward compatibility)
     * Now supports URL mode via source and searchUrl parameters
     */
    async searchAndConnect(keyword, quota, options = {}, message = '', source = 'keyword', searchUrl = '') {
        if (message) {
            options.sendWithNote = true;
            options.connectionMessage = message;
        }
        
        // Pass source and searchUrl to autoConnectFromSearch
        options._source = source;
        options._searchUrl = searchUrl;
        
        return await this.autoConnectFromSearch(keyword, quota, options);
    }
}

// Create instance for ES6 imports
const peopleSearchAutomation = new PeopleSearchAutomation();

// ES6 module exports
export { peopleSearchAutomation, PeopleSearchAutomation };
export default PeopleSearchAutomation;

// CommonJS exports (for backward compatibility)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PeopleSearchAutomation;
    module.exports.peopleSearchAutomation = peopleSearchAutomation;
} else if (typeof exports !== 'undefined') {
    exports.PeopleSearchAutomation = PeopleSearchAutomation;
    exports.peopleSearchAutomation = peopleSearchAutomation;
}
