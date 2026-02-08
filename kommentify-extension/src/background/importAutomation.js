/**
 * Import Automation Handler
 * Handles bulk connection requests and post engagement for imported LinkedIn profiles
 */

import { browser } from '../shared/utils/browser.js';
import { backgroundStatistics } from './statisticsManager.js';

class ImportAutomation {
    constructor() {
        this.isProcessing = false;
        this.currentOperation = null;
        this.stopFlag = false;
        this.activeTabId = null;
    }
    
    /**
     * Track import profile usage (send to backend API)
     */
    async trackImportCredit() {
        try {
            // Get auth token from storage (using both localStorage and chrome.storage)
            let authToken = null;
            
            // First try chrome.storage.local (where it should be stored)
            const result = await chrome.storage.local.get(['authToken']);
            if (result.authToken) {
                authToken = result.authToken;
            } else {
                // Fallback to sync storage
                const syncResult = await chrome.storage.sync.get(['authToken']);
                authToken = syncResult.authToken;
            }
            
            if (!authToken) {
                console.warn('⚠️ IMPORT: No auth token found in storage, skipping credit tracking');
                return;
            }

            const response = await fetch('https://kommentify.com/api/usage/track', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    actionType: 'importProfile'
                })
            });

            const data = await response.json();
            if (!data.success) {
                console.warn('⚠️ IMPORT: Failed to track credit:', data.error);
            } else {
                console.log('✅ IMPORT: Credit tracked, remaining:', data.usage.importProfiles);
            }
        } catch (error) {
            console.error('❌ IMPORT: Credit tracking error:', error);
        }
    }
    
    /**
     * Send progress update to popup (for live UI updates)
     * Also saves to storage so popup can sync when opened
     */
    async sendProgressToPopup(data) {
        try {
            console.log('📤 IMPORT: Sending progress to popup:', data.type, data.profileUrl || '');
            
            // ALWAYS save to storage first (for when popup is closed)
            await this.saveProgressToStorage(data);
            
            // Try to send message to popup (may fail if closed)
            await chrome.runtime.sendMessage({
                action: 'importProgress',
                ...data
            });
            console.log('✅ IMPORT: Progress sent to popup');
        } catch (error) {
            console.log('⚠️ IMPORT: Popup not open, progress saved to storage for sync');
            // Popup might be closed, but progress is saved to storage
        }
    }
    
    /**
     * Save progress to storage so popup can sync when opened
     */
    async saveProgressToStorage(data) {
        try {
            const { type, profileUrl, profileName, current, total, result } = data;
            
            // Save current progress state
            await chrome.storage.local.set({
                importProgressState: {
                    current: current || 0,
                    total: total || 0,
                    lastUpdate: Date.now()
                }
            });
            
            // If profile completed successfully, remove from pending profiles
            if (type === 'profileComplete' && result?.success && profileUrl) {
                console.log('💾 IMPORT BG: Removing completed profile from storage:', profileUrl);
                const { pendingImportProfiles = [] } = await chrome.storage.local.get('pendingImportProfiles');
                
                // Normalize URL for comparison
                const normalizeUrl = (url) => url?.replace(/\/$/, '').toLowerCase().trim();
                const normalizedTarget = normalizeUrl(profileUrl);
                
                const updatedProfiles = pendingImportProfiles.filter(url => {
                    const normalizedUrl = normalizeUrl(url);
                    return normalizedUrl !== normalizedTarget && 
                           !normalizedUrl.includes(normalizedTarget) && 
                           !normalizedTarget.includes(normalizedUrl);
                });
                
                await chrome.storage.local.set({ pendingImportProfiles: updatedProfiles });
                console.log('✅ IMPORT BG: Removed from storage, remaining:', updatedProfiles.length);
                
                // Also add to completed profiles list for history
                const { completedImportProfiles = [] } = await chrome.storage.local.get('completedImportProfiles');
                completedImportProfiles.push({
                    url: profileUrl,
                    name: profileName,
                    timestamp: Date.now(),
                    result: result
                });
                // Keep only last 100 completed profiles
                if (completedImportProfiles.length > 100) {
                    completedImportProfiles.shift();
                }
                await chrome.storage.local.set({ completedImportProfiles });
            }
            
            // If automation complete, clear progress state
            if (type === 'complete') {
                await chrome.storage.local.set({
                    importProgressState: null,
                    importAutomationActive: false
                });
            }
            
            // If automation started, mark as active
            if (type === 'start') {
                await chrome.storage.local.set({
                    importAutomationActive: true
                });
            }
        } catch (error) {
            console.error('❌ IMPORT BG: Failed to save progress to storage:', error);
        }
    }

    /**
     * Broadcast status update to the active LinkedIn tab
     */
    async broadcastStatus(message, type = 'info', showStopButton = true) {
        if (!this.activeTabId) return;
        
        try {
            await chrome.scripting.executeScript({
                target: { tabId: this.activeTabId },
                func: (msg, msgType, showStop, automationType) => {
                    const colors = {
                        info: '#0a66c2',
                        success: '#057642',
                        warning: '#b24020',
                        error: '#cc1016'
                    };
                    
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
                    
                    const stopBtn = document.getElementById('minify-stop-btn');
                    if (stopBtn) {
                        stopBtn.onclick = () => {
                            chrome.runtime.sendMessage({ action: `stop${automationType}` });
                            stopBtn.textContent = '⏳ Stopping...';
                            stopBtn.disabled = true;
                        };
                    }
                    
                    if (window._minifyStatusTimeout) {
                        clearTimeout(window._minifyStatusTimeout);
                    }
                    
                    if (msgType === 'success') {
                        window._minifyStatusTimeout = setTimeout(() => {
                            container.style.opacity = '0';
                            setTimeout(() => { container.style.display = 'none'; }, 300);
                        }, 4000);
                    }
                },
                args: [message, type, showStopButton, 'ImportAutomation']
            });
        } catch (error) {
            // Tab might be closed
        }
    }

    /**
     * Process bulk connection requests
     */
    async processConnectionRequests(profiles, options = {}) {
        if (this.isProcessing) {
            throw new Error('Import automation is already running');
        }

        this.isProcessing = true;
        this.currentOperation = 'connection_requests';
        this.stopFlag = false;

        const results = {
            successful: 0,
            failed: 0,
            leads: [],
            errors: []
        };

        console.log(`🤝 IMPORT: Starting connection requests for ${profiles.length} profiles`);
        await this.broadcastStatus(`🤝 Starting: ${profiles.length} profiles`, 'info');
        
        // Send start progress to popup
        await this.sendProgressToPopup({ type: 'start', total: profiles.length, current: 0 });

        // Apply import start delay from limits settings
        const { delaySettings } = await chrome.storage.local.get('delaySettings');
        const importStartDelay = (delaySettings && delaySettings.importStartDelay) || 0;
        if (importStartDelay > 0) {
            console.log(`⏰ IMPORT DELAY: Waiting ${importStartDelay}s before starting import...`);
            await new Promise(resolve => setTimeout(resolve, importStartDelay * 1000));
        }

        // Get connection request delay settings from limits
        const networkingMinDelay = (delaySettings && delaySettings.networkingMinDelay) || 45;
        const networkingMaxDelay = (delaySettings && delaySettings.networkingMaxDelay) || 90;

        try {
            for (let i = 0; i < profiles.length; i++) {
                // Check stop flag
                if (this.stopFlag) {
                    console.log('🛑 IMPORT: Stopped by user');
                    await this.broadcastStatus(`🛑 Stopped. ${results.successful} connected`, 'warning', false);
                    break;
                }
                
                const profile = profiles[i];
                const profileName = this.extractNameFromUrl(profile);
                console.log(`🔗 IMPORT: Processing profile ${i + 1}/${profiles.length}: ${profile}`);
                await this.broadcastStatus(`📤 Connecting: ${profileName} (${i + 1}/${profiles.length})`, 'info');
                
                // Send profile start to popup
                await this.sendProgressToPopup({
                    type: 'profileStart',
                    profileUrl: profile,
                    profileName,
                    current: i + 1,
                    total: profiles.length
                });

                try {
                    // Extract contact info if requested
                    let contactInfo = { email: null, phone: null };
                    if (options.extractContactInfo) {
                        const contactUrl = profile.endsWith('/') 
                            ? profile + 'overlay/contact-info/' 
                            : profile + '/overlay/contact-info/';
                        
                        console.log('📧 IMPORT: Extracting contact info from:', contactUrl);
                        contactInfo = await this.extractContactInfo(contactUrl);
                        console.log('📧 IMPORT: Contact info result:', contactInfo);
                    }

                    // Send connection request
                    const connectionResult = await this.sendConnectionRequest(profile);
                    
                    if (connectionResult.success) {
                        results.successful++;
                        this.activeTabId = connectionResult.tabId; // Set for status broadcasts
                        
                        // Create lead record
                        const lead = {
                            id: `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                            profileUrl: profile,
                            name: profileName,
                            email: contactInfo.email,
                            phone: contactInfo.phone,
                            source: 'import_automation',
                            connectionStatus: 'pending',
                            collectedAt: new Date().toISOString()
                        };
                        
                        results.leads.push(lead);
                        await this.saveLead(lead);
                        
                        console.log(`✅ IMPORT: Connection request sent to: ${profile}`);
                        await this.broadcastStatus(`✅ Connected: ${profileName} (${results.successful}/${profiles.length})`, 'success');
                        
                        // Track import credit usage
                        await this.trackImportCredit();
                        
                        // Send profile complete to popup (success)
                        await this.sendProgressToPopup({
                            type: 'profileComplete',
                            profileUrl: profile,
                            profileName,
                            current: i + 1,
                            total: profiles.length,
                            result: { success: true, connectionSent: true }
                        });
                    } else {
                        results.failed++;
                        results.errors.push(`${profile}: ${connectionResult.error}`);
                        console.log(`❌ IMPORT: Failed to send connection to: ${profile} - ${connectionResult.error}`);
                        await this.broadcastStatus(`⚠️ Skipped: ${profileName}`, 'warning');
                        
                        // Send profile complete to popup (failed)
                        await this.sendProgressToPopup({
                            type: 'profileComplete',
                            profileUrl: profile,
                            profileName,
                            current: i + 1,
                            total: profiles.length,
                            result: { success: false, error: connectionResult.error }
                        });
                    }

                    // Apply connection request delay from limits settings with countdown
                    if (i < profiles.length - 1 && !this.stopFlag) {
                        const delaySeconds = Math.round(networkingMinDelay + Math.random() * (networkingMaxDelay - networkingMinDelay));
                        console.log(`⏳ IMPORT: Waiting ${delaySeconds}s (${networkingMinDelay}-${networkingMaxDelay}s range) before next profile...`);
                        
                        // Show countdown
                        for (let remaining = delaySeconds; remaining > 0; remaining -= 5) {
                            if (this.stopFlag) break;
                            await this.broadcastStatus(`⏳ Next profile in ${remaining}s...`, 'info');
                            await new Promise(resolve => setTimeout(resolve, Math.min(5000, remaining * 1000)));
                        }
                    }

                } catch (error) {
                    results.failed++;
                    results.errors.push(`${profile}: ${error.message}`);
                    console.error(`❌ IMPORT: Error processing profile ${profile}:`, error);
                }
            }

        } finally {
            this.isProcessing = false;
            this.currentOperation = null;
            console.log(`🎉 IMPORT: Connection requests completed. Success: ${results.successful}, Failed: ${results.failed}`);
            if (!this.stopFlag) {
                await this.broadcastStatus(`🎉 Complete! ${results.successful} connected`, 'success', false);
            }
            this.stopFlag = false;
            
            // Send complete message to popup
            await this.sendProgressToPopup({
                type: 'complete',
                total: profiles.length,
                successful: results.successful,
                failed: results.failed
            });
            
            // Save import history for ALL profiles (successful and failed)
            await this.saveImportHistory(profiles, results, options);
        }

        return results;
    }

    /**
     * Process combined automation (connection requests + post engagement)
     */
    async processCombinedAutomation(profiles, options = {}) {
        if (this.isProcessing) {
            throw new Error('Import automation is already running');
        }

        this.isProcessing = true;
        this.currentOperation = 'combined_automation';
        this.stopFlag = false;
        
        // Set active flag for processing state tracking
        await chrome.storage.local.set({ importAutomationActive: true });

        const results = {
            profilesProcessed: 0,
            connectionsSuccessful: 0,
            connectionsFailed: 0,
            totalLikes: 0,
            totalComments: 0,
            totalShares: 0,
            totalFollows: 0,
            leads: [],
            errors: [],
            profilePostDetails: {} // Store post details keyed by profile URL
        };

        const { postsPerProfile = 2, randomMode = false, actions = {}, extractContactInfo = false, sendConnections = true } = options;

        console.log(`🚀 IMPORT: Starting combined automation for ${profiles.length} profiles`);
        console.log('🚀 IMPORT: Actions enabled:', actions);
        console.log('🔗 IMPORT: Send connections:', sendConnections ? 'ENABLED' : 'DISABLED');
        console.log('🎲 IMPORT: Random mode:', randomMode ? 'ENABLED (pick one action per post)' : 'DISABLED (all selected actions)');
        await this.broadcastStatus(`🚀 Starting: ${profiles.length} profiles (combined)`, 'info');
        
        // Send start progress to popup
        await this.sendProgressToPopup({ type: 'start', total: profiles.length, current: 0 });

        // Apply import start delay from limits settings
        const { delaySettings } = await chrome.storage.local.get('delaySettings');
        const importStartDelay = (delaySettings && delaySettings.importStartDelay) || 0;
        if (importStartDelay > 0) {
            console.log(`⏰ IMPORT DELAY: Waiting ${importStartDelay}s before starting import...`);
            await new Promise(resolve => setTimeout(resolve, importStartDelay * 1000));
        }

        // Get comment delay settings from limits (used for combined automation between profiles)
        const commentMinDelay = (delaySettings && delaySettings.commentMinDelay) || 60;
        const commentMaxDelay = (delaySettings && delaySettings.commentMaxDelay) || 180;

        try {
            for (let i = 0; i < profiles.length; i++) {
                // Check stop flag
                if (this.stopFlag) {
                    console.log('🛑 IMPORT: Stopped by user');
                    await this.broadcastStatus(`🛑 Stopped. ${results.profilesProcessed} processed`, 'warning', false);
                    break;
                }
                
                const profile = profiles[i];
                const profileName = this.extractNameFromUrl(profile);
                console.log(`🔄 IMPORT: Processing profile ${i + 1}/${profiles.length}: ${profile}`);
                await this.broadcastStatus(`🔄 Processing: ${profileName} (${i + 1}/${profiles.length})`, 'info');
                
                // Send profile start to popup
                await this.sendProgressToPopup({
                    type: 'profileStart',
                    profileUrl: profile,
                    profileName,
                    current: i + 1,
                    total: profiles.length
                });

                try {
                    // Step 1: Extract contact info if requested
                    let contactInfo = { email: null, phone: null };
                    if (extractContactInfo) {
                        const contactUrl = profile.endsWith('/') 
                            ? profile + 'overlay/contact-info/' 
                            : profile + '/overlay/contact-info/';
                        
                        console.log('📧 IMPORT: Extracting contact info from:', contactUrl);
                        contactInfo = await this.extractContactInfo(contactUrl);
                        console.log('📧 IMPORT: Contact info result:', contactInfo);
                    }

                    // Step 2: Send connection request (if enabled)
                    let connectionResult = { success: false, skipped: true };
                    if (sendConnections) {
                        console.log('🤝 IMPORT: Sending connection request...');
                        connectionResult = await this.sendConnectionRequest(profile);
                        this.activeTabId = connectionResult.tabId;
                        
                        if (connectionResult.success) {
                            results.connectionsSuccessful++;
                            
                            // Create lead record
                            const lead = {
                                id: `combined_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                                profileUrl: profile,
                                name: this.extractNameFromUrl(profile),
                                email: contactInfo.email,
                                phone: contactInfo.phone,
                                source: 'combined_automation',
                                connectionStatus: 'pending',
                                collectedAt: new Date().toISOString()
                            };
                            
                            results.leads.push(lead);
                            await this.saveLead(lead);
                            
                            console.log(`✅ IMPORT: Connection request sent to: ${profile}`);
                        } else {
                            results.connectionsFailed++;
                            console.log(`❌ IMPORT: Failed to send connection to: ${profile} - ${connectionResult.error}`);
                        }
                    } else {
                        console.log('⏭️ IMPORT: Skipping connection request (disabled by user)');
                    }

                    // Step 3: Engage with posts
                    console.log('❤️ IMPORT: Starting post engagement...');
                    const activityUrl = profile.replace(/\/$/, '') + '/recent-activity/all/';
                    
                    const engagementResult = await this.engageWithProfilePosts(activityUrl, postsPerProfile, actions, randomMode);
                    
                    results.totalLikes += engagementResult.likes || 0;
                    results.totalComments += engagementResult.comments || 0;
                    results.totalShares += engagementResult.shares || 0;
                    results.totalFollows += engagementResult.follows || 0;
                    
                    // Store post details for this profile
                    if (engagementResult.postDetails && engagementResult.postDetails.length > 0) {
                        results.profilePostDetails[profile] = engagementResult.postDetails;
                        console.log(`📝 IMPORT: Stored ${engagementResult.postDetails.length} post details for: ${profileName}`);
                    }

                    results.profilesProcessed++;
                    console.log(`✅ IMPORT: Combined automation completed for: ${profile}`, {
                        connection: connectionResult.skipped ? 'skipped' : connectionResult.success,
                        engagement: engagementResult
                    });
                    await this.broadcastStatus(`✅ Completed: ${profileName} (${results.profilesProcessed}/${profiles.length})`, 'success');
                    
                    // Send profile complete to popup (success)
                    await this.sendProgressToPopup({
                        type: 'profileComplete',
                        profileUrl: profile,
                        profileName,
                        current: i + 1,
                        total: profiles.length,
                        result: {
                            success: true,
                            connectionSent: connectionResult.success && !connectionResult.skipped,
                            likes: engagementResult.likes || 0,
                            comments: engagementResult.comments || 0,
                            shares: engagementResult.shares || 0,
                            follows: engagementResult.follows || 0
                        }
                    });
                    
                    // RECORD STATISTICS FOR COMBINED AUTOMATION
                    try {
                        // Record connection if sent
                        if (connectionResult.success && !connectionResult.skipped) {
                            await backgroundStatistics.recordConnectionRequest(profileName, lead?.headline || '');
                        }
                        // Record likes
                        for (let j = 0; j < (engagementResult.likes || 0); j++) {
                            await backgroundStatistics.recordLike(`import-combined-${profile}-${Date.now()}`);
                        }
                        // Record comments
                        for (let j = 0; j < (engagementResult.comments || 0); j++) {
                            const postDetail = engagementResult.postDetails?.[j] || {};
                            await backgroundStatistics.recordComment(
                                `import-combined-${profile}-${Date.now()}`,
                                postDetail.generatedComment || 'AI comment',
                                postDetail.postContent || '',
                                postDetail.authorName || profileName
                            );
                        }
                        // Record shares
                        for (let j = 0; j < (engagementResult.shares || 0); j++) {
                            await backgroundStatistics.recordShare(`import-combined-${profile}-${Date.now()}`);
                        }
                        // Record follows
                        for (let j = 0; j < (engagementResult.follows || 0); j++) {
                            await backgroundStatistics.recordFollow(profileName);
                        }
                        console.log(`📊 IMPORT: Statistics recorded for combined automation on ${profile}`);
                    } catch (statError) {
                        console.warn(`⚠️ IMPORT: Failed to record statistics:`, statError.message);
                    }
                    
                    // Track import credit usage
                    await this.trackImportCredit();

                    // Apply comment delay from limits settings with countdown
                    if (i < profiles.length - 1 && !this.stopFlag) {
                        const delaySeconds = Math.round(commentMinDelay + Math.random() * (commentMaxDelay - commentMinDelay));
                        console.log(`⏳ IMPORT: Waiting ${delaySeconds}s (${commentMinDelay}-${commentMaxDelay}s range) before next profile...`);
                        
                        for (let remaining = delaySeconds; remaining > 0; remaining -= 5) {
                            if (this.stopFlag) break;
                            await this.broadcastStatus(`⏳ Next profile in ${remaining}s...`, 'info');
                            await new Promise(resolve => setTimeout(resolve, Math.min(5000, remaining * 1000)));
                        }
                    }

                } catch (error) {
                    results.errors.push(`${profile}: ${error.message}`);
                    console.error(`❌ IMPORT: Error processing profile ${profile}:`, error);
                }
            }

        } finally {
            this.isProcessing = false;
            this.currentOperation = null;
            this.stopFlag = false;
            
            // Clear active flag for processing state tracking
            await chrome.storage.local.set({ importAutomationActive: false });
            
            console.log(`🎉 IMPORT: Combined automation completed:`, results);
            await this.broadcastStatus(`🎉 Complete! ${results.profilesProcessed} processed`, 'success', false);
            
            // Send complete message to popup
            await this.sendProgressToPopup({
                type: 'complete',
                total: profiles.length,
                successful: results.profilesProcessed,
                failed: results.errors.length
            });
            
            // Save import history with post details
            await this.saveImportHistory(profiles, results, options);
        }

        return results;
    }

    /**
     * Process bulk post engagement
     */
    async processPostEngagement(profiles, options = {}) {
        if (this.isProcessing) {
            throw new Error('Import automation is already running');
        }

        this.isProcessing = true;
        this.currentOperation = 'post_engagement';
        this.stopFlag = false;
        
        // Set active flag for processing state tracking
        await chrome.storage.local.set({ importAutomationActive: true });

        const results = {
            profilesProcessed: 0,
            totalLikes: 0,
            totalComments: 0,
            totalShares: 0,
            totalFollows: 0,
            errors: []
        };

        const { postsPerProfile = 2, randomMode = false, actions = {} } = options;

        console.log(`❤️ IMPORT: Starting post engagement for ${profiles.length} profiles`);
        console.log('❤️ IMPORT: Actions enabled:', actions);
        console.log('🎲 IMPORT: Random mode:', randomMode ? 'ENABLED (pick one action per post)' : 'DISABLED (all selected actions)');
        await this.broadcastStatus(`❤️ Starting: ${profiles.length} profiles (engagement)`, 'info');

        // Apply import start delay from limits settings
        const { delaySettings } = await chrome.storage.local.get('delaySettings');
        const importStartDelay = (delaySettings && delaySettings.importStartDelay) || 0;
        if (importStartDelay > 0) {
            console.log(`⏰ IMPORT DELAY: Waiting ${importStartDelay}s before starting import...`);
            await new Promise(resolve => setTimeout(resolve, importStartDelay * 1000));
        }

        // Get comment delay settings from limits (used for engagement between profiles)
        const commentMinDelay = (delaySettings && delaySettings.commentMinDelay) || 60;
        const commentMaxDelay = (delaySettings && delaySettings.commentMaxDelay) || 180;

        try {
            for (let i = 0; i < profiles.length; i++) {
                // Check stop flag
                if (this.stopFlag) {
                    console.log('🛑 IMPORT: Stopped by user');
                    await this.broadcastStatus(`🛑 Stopped. ${results.profilesProcessed} processed`, 'warning', false);
                    break;
                }
                
                const profile = profiles[i];
                const profileName = this.extractNameFromUrl(profile);
                console.log(`📱 IMPORT: Processing profile ${i + 1}/${profiles.length}: ${profile}`);
                await this.broadcastStatus(`❤️ Engaging: ${profileName} (${i + 1}/${profiles.length})`, 'info');

                try {
                    // Convert to recent activity URL
                    const activityUrl = profile.replace(/\/$/, '') + '/recent-activity/all/';
                    
                    const engagementResult = await this.engageWithProfilePosts(activityUrl, postsPerProfile, actions, randomMode);
                    
                    results.profilesProcessed++;
                    results.totalLikes += engagementResult.likes || 0;
                    results.totalComments += engagementResult.comments || 0;
                    results.totalShares += engagementResult.shares || 0;
                    results.totalFollows += engagementResult.follows || 0;

                    console.log(`✅ IMPORT: Engagement completed for: ${profile}`, engagementResult);
                    await this.broadcastStatus(`✅ Engaged: ${profileName} (${results.profilesProcessed}/${profiles.length})`, 'success');
                    
                    // RECORD STATISTICS FOR EACH ACTION
                    try {
                        // Record likes
                        for (let i = 0; i < (engagementResult.likes || 0); i++) {
                            await backgroundStatistics.recordLike(`import-${profile}-${Date.now()}`);
                        }
                        // Record comments
                        for (let i = 0; i < (engagementResult.comments || 0); i++) {
                            const postDetail = engagementResult.postDetails?.[i] || {};
                            await backgroundStatistics.recordComment(
                                `import-${profile}-${Date.now()}`,
                                postDetail.generatedComment || 'AI comment',
                                postDetail.postContent || '',
                                postDetail.authorName || profileName
                            );
                        }
                        // Record shares
                        for (let i = 0; i < (engagementResult.shares || 0); i++) {
                            await backgroundStatistics.recordShare(`import-${profile}-${Date.now()}`);
                        }
                        // Record follows
                        for (let i = 0; i < (engagementResult.follows || 0); i++) {
                            await backgroundStatistics.recordFollow(profileName);
                        }
                        console.log(`📊 IMPORT: Statistics recorded for ${profile}`);
                    } catch (statError) {
                        console.warn(`⚠️ IMPORT: Failed to record statistics:`, statError.message);
                    }
                    
                    // Track import credit usage
                    await this.trackImportCredit();

                    // Apply comment delay from limits settings with countdown
                    if (i < profiles.length - 1 && !this.stopFlag) {
                        const delaySeconds = Math.round(commentMinDelay + Math.random() * (commentMaxDelay - commentMinDelay));
                        console.log(`⏳ IMPORT: Waiting ${delaySeconds}s (${commentMinDelay}-${commentMaxDelay}s range) before next profile...`);
                        
                        for (let remaining = delaySeconds; remaining > 0; remaining -= 5) {
                            if (this.stopFlag) break;
                            await this.broadcastStatus(`⏳ Next profile in ${remaining}s...`, 'info');
                            await new Promise(resolve => setTimeout(resolve, Math.min(5000, remaining * 1000)));
                        }
                    }

                } catch (error) {
                    results.errors.push(`${profile}: ${error.message}`);
                    console.error(`❌ IMPORT: Error engaging with profile ${profile}:`, error);
                }
            }

        } finally {
            this.isProcessing = false;
            this.currentOperation = null;
            this.stopFlag = false;
            
            // Clear active flag for processing state tracking
            await chrome.storage.local.set({ importAutomationActive: false });
            
            console.log(`🎉 IMPORT: Post engagement completed:`, results);
            await this.broadcastStatus(`🎉 Complete! ${results.profilesProcessed} engaged`, 'success', false);
            
            // Save import history for post engagement
            await this.savePostEngagementHistory(profiles, results, options);
        }

        return results;
    }

    /**
     * Send connection request to profile
     */
    async sendConnectionRequest(profileUrl) {
        try {
            console.log(`🔗 IMPORT: Sending connection request to: ${profileUrl}`);
            
            // Extract vanity name from profile URL
            const vanityMatch = profileUrl.match(/\/in\/([^\/]+)/);
            if (!vanityMatch) {
                throw new Error('Invalid LinkedIn profile URL');
            }
            const vanityName = vanityMatch[1];
            
            // Open direct invitation URL
            const inviteUrl = `https://www.linkedin.com/preload/custom-invite/?vanityName=${vanityName}`;
            console.log(`🔗 IMPORT: Opening direct invite URL: ${inviteUrl}`);
            
            const tabId = await browser.openTab(inviteUrl, false);
            if (!tabId) {
                throw new Error('Failed to open invite tab');
            }

            // Wait for page load - invitation modal loads faster
            console.log('⏳ IMPORT: Waiting for invitation modal to load...');
            await new Promise(resolve => setTimeout(resolve, 3000));

            const result = await chrome.scripting.executeScript({
                target: { tabId },
                func: () => {
                    try {
                        console.log('🔗 SCRIPT: Looking for send invitation button...');
                        
                        // Direct invitation page - look for send buttons
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
                }
            });

            // Wait 7 seconds before closing tab to allow connection request to process
            console.log('⏳ IMPORT: Waiting 7 seconds before closing tab...');
            await new Promise(resolve => setTimeout(resolve, 7000));
            
            // Close tab
            await chrome.tabs.remove(tabId);

            return result[0]?.result || { success: false, error: 'No result returned' };

        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Engage with posts from a profile's activity page
     */
    async engageWithProfilePosts(activityUrl, postsCount, actions, randomMode = false) {
        try {
            console.log(`📱 IMPORT: Opening activity page: ${activityUrl}`);
            
            const tabId = await browser.openTab(activityUrl, false);
            if (!tabId) {
                throw new Error('Failed to open activity tab');
            }

            // Wait for page load - longer wait for proper rendering
            console.log('📱 IMPORT: Waiting for page to fully load...');
            await new Promise(resolve => setTimeout(resolve, 6000));

            // Get auth token and comment settings for AI generation
            const storage = await chrome.storage.local.get(['authToken', 'apiBaseUrl', 'commentSettings']);
            const authToken = storage.authToken;
            const apiBaseUrl = (storage.apiBaseUrl && !storage.apiBaseUrl.includes('backend-buxx') && !storage.apiBaseUrl.includes('backend-api-orcin') && !storage.apiBaseUrl.includes('backend-4poj')) ? storage.apiBaseUrl : 'https://kommentify.com';
            const commentSettings = storage.commentSettings || {
                goal: 'AddValue',
                tone: 'Friendly',
                commentLength: 'Short',
                userExpertise: '',
                userBackground: ''
            };
            
            // Get profile name from URL for fallback
            const profileMatch = activityUrl.match(/linkedin\.com\/in\/([^\/]+)/);
            const profileSlug = profileMatch ? profileMatch[1].replace(/-/g, ' ') : '';

            console.log('📱 IMPORT: Executing script in tab...');
            
            let result;
            try {
                result = await chrome.scripting.executeScript({
                    target: { tabId },
                    // Use ISOLATED world so we can use chrome.runtime.sendMessage
                    func: async (postsCount, actions, randomMode, commentSettings, profileSlug) => {
                    return new Promise(async (resolve) => {
                        try {
                            console.log('📱 SCRIPT: Import automation script started');
                            
                            let likes = 0;
                            let comments = 0;
                            let shares = 0;
                            let follows = 0;
                            let postDetails = []; // Collect details for each post processed

                            // Helper function to get author name (same logic as feedScraper.js)
                            const getAuthorName = (container) => {
                                console.log('🔍 SCRIPT: Extracting author name...');
                                
                                // STRATEGY 1: aria-label patterns (Most Reliable)
                                const potentialLinks = container.querySelectorAll('a[aria-label]');
                                for (const link of potentialLinks) {
                                    const rawLabel = link.getAttribute('aria-label');
                                    if (!rawLabel) continue;

                                    const patterns = [
                                        /^View\s+(.+?)['']s\s+profile/i,
                                        /^View\s+(.+?)['']s/i,
                                        /^(.+?)['']s\s+profile/i,
                                        /^View\s+profile\s+for\s+(.+)/i,
                                        /^(.+?)\s+\-\s+View\s+profile/i
                                    ];

                                    for (const pattern of patterns) {
                                        const nameMatch = rawLabel.match(pattern);
                                        if (nameMatch && nameMatch[1]) {
                                            const name = nameMatch[1].trim();
                                            const invalidTerms = ['comment', 'view', 'profile', 'linkedin', 'activity', 'post'];
                                            const isValid = name.length > 1 && 
                                                          !invalidTerms.some(term => name.toLowerCase().includes(term));
                                            if (isValid) {
                                                console.log(`✅ SCRIPT: Author found (aria-label): "${name.split(' ')[0]}"`);
                                                return name.split(' ')[0];
                                            }
                                        }
                                    }
                                }

                                // STRATEGY 2: Direct selectors
                                const directSelectors = [
                                    '.update-components-actor__name span[aria-hidden="true"]',
                                    '.update-components-actor__title',
                                    '.feed-shared-actor__name',
                                    '.feed-shared-actor__title',
                                    'div.update-components-actor__meta a span span:nth-child(1) span span:nth-child(1)'
                                ];

                                for (const selector of directSelectors) {
                                    const element = container.querySelector(selector);
                                    if (element) {
                                        const text = element.textContent?.trim();
                                        if (text && text.length > 1 && !text.includes('\n')) {
                                            console.log(`✅ SCRIPT: Author found (selector): "${text.split(' ')[0]}"`);
                                            return text.split(' ')[0];
                                        }
                                    }
                                }

                                // STRATEGY 3: Relationship-based
                                const actorContainers = container.querySelectorAll('[class*="actor"], [class*="author"]');
                                for (const actorContainer of actorContainers) {
                                    const spans = actorContainer.querySelectorAll('span[aria-hidden="true"]');
                                    for (const span of spans) {
                                        const text = span.textContent?.trim();
                                        if (text && text.length >= 2 && text.length < 50 && 
                                            !text.includes('\n') && /^[A-Z]/.test(text)) {
                                            console.log(`✅ SCRIPT: Author found (relationship): "${text.split(' ')[0]}"`);
                                            return text.split(' ')[0];
                                        }
                                    }
                                }

                                // Fallback to profile slug
                                if (profileSlug) {
                                    const name = profileSlug.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                                    console.log(`⚠️ SCRIPT: Using profile slug as fallback: "${name}"`);
                                    return name.split(' ')[0];
                                }

                                return 'there';
                            };

                            // Helper function to get post text (same logic as feedScraper.js)
                            const getPostText = (container) => {
                                const textElement = container.querySelector('.update-components-text');
                                if (textElement) {
                                    const text = textElement.innerText.trim();
                                    console.log(`✅ SCRIPT: Post text found: "${text.substring(0, 50)}..."`);
                                    return text.substring(0, 500);
                                }
                                
                                // Fallback selectors
                                const fallbackSelectors = [
                                    '.feed-shared-update-v2__description',
                                    '.feed-shared-text',
                                    '.feed-shared-inline-show-more-text',
                                    'span.break-words'
                                ];
                                
                                for (const selector of fallbackSelectors) {
                                    const el = container.querySelector(selector);
                                    if (el && el.innerText.trim().length > 10) {
                                        console.log(`✅ SCRIPT: Post text found (fallback): "${el.innerText.trim().substring(0, 50)}..."`);
                                        return el.innerText.trim().substring(0, 500);
                                    }
                                }
                                
                                return 'Interesting professional content shared on LinkedIn';
                            };

                            // Wait a bit more for dynamic content
                            await new Promise(r => setTimeout(r, 2000));
                            
                            // Scroll to load posts
                            window.scrollBy(0, 500);
                            await new Promise(r => setTimeout(r, 1500));

                            // Find posts - use data-urn which is most reliable
                            let posts = document.querySelectorAll('[data-urn*="urn:li:activity"]');
                            if (posts.length === 0) {
                                posts = document.querySelectorAll('.feed-shared-update-v2');
                            }
                            if (posts.length === 0) {
                                posts = document.querySelectorAll('.occludable-update');
                            }
                            
                            const postsToProcess = Array.from(posts).slice(0, postsCount);

                            console.log(`📱 SCRIPT: Found ${posts.length} posts, processing ${postsToProcess.length}`);
                            console.log(`🎲 SCRIPT: Random mode: ${randomMode ? 'ENABLED' : 'DISABLED'}`);

                            if (postsToProcess.length === 0) {
                                resolve({ likes: 0, comments: 0, shares: 0, follows: 0, error: 'No posts found' });
                                return;
                            }

                            // Follow user first (if enabled)
                            if (actions.follows) {
                                setTimeout(() => {
                                    const followBtn = document.querySelector('button.follow');
                                    if (followBtn && !followBtn.getAttribute('data-followed')) {
                                        followBtn.click();
                                        follows++;
                                        console.log(`📱 SCRIPT: Followed user`);
                                    }
                                }, 500);
                            }

                            // Process each post sequentially
                            async function processPostsSequentially() {
                                for (let index = 0; index < postsToProcess.length; index++) {
                                    const post = postsToProcess[index];
                                    console.log(`📱 SCRIPT: Processing post ${index + 1} of ${postsToProcess.length}`);
                                    
                                    // If random mode is enabled, pick ONE random action
                                    let postActions = actions;
                                    if (randomMode) {
                                        const availableActions = [];
                                        if (actions.likes) availableActions.push('likes');
                                        if (actions.comments) availableActions.push('comments');
                                        if (actions.shares) availableActions.push('shares');
                                        
                                        if (availableActions.length > 0) {
                                            const randomAction = availableActions[Math.floor(Math.random() * availableActions.length)];
                                            postActions = {
                                                likes: randomAction === 'likes',
                                                comments: randomAction === 'comments',
                                                shares: randomAction === 'shares',
                                                follows: actions.follows // Keep follow as-is
                                            };
                                            console.log(`🎲 SCRIPT: Random mode selected action: ${randomAction}`);
                                        }
                                    }
                                    
                                    try {
                                        // Like post
                                        if (postActions.likes) {
                                            const likeBtn = post.querySelector('button[aria-label*="React Like"], button[aria-label*="Like"], button[data-control-name="like_toggle"]');
                                            if (likeBtn && likeBtn.getAttribute('aria-pressed') !== 'true') {
                                                likeBtn.click();
                                                likes++;
                                                console.log(`📱 SCRIPT: Liked post ${index + 1}`);
                                                await new Promise(resolve => setTimeout(resolve, 1000));
                                            }
                                        }

                                        // Comment on post - Generate AI comment and post it
                                        if (postActions.comments) {
                                            const commentBtn = post.querySelector('button[aria-label*="Comment"], button.comment-button, button[data-control-name="comment_toggle"]');
                                            if (commentBtn) {
                                                // Click to open comment box
                                                console.log(`📱 SCRIPT: Clicking comment button for post ${index + 1}...`);
                                                commentBtn.click();
                                                await new Promise(resolve => setTimeout(resolve, 2000));
                                                
                                                // Find comment box - use data-placeholder which is most reliable
                                                let commentBox = post.querySelector('div[data-placeholder]');
                                                if (!commentBox) {
                                                    commentBox = document.querySelector('div[data-placeholder]');
                                                }
                                                if (!commentBox) {
                                                    commentBox = post.querySelector('div.ql-editor, div[contenteditable="true"]');
                                                }
                                                if (!commentBox) {
                                                    commentBox = document.querySelector('div.ql-editor, div[contenteditable="true"]');
                                                }
                                                
                                                console.log(`📱 SCRIPT: Comment box found: ${!!commentBox}`);
                                                
                                                if (commentBox) {
                                                    // Use helper functions to scrape content (same as feedScraper.js)
                                                    const postText = getPostText(post);
                                                    const authorName = getAuthorName(post);
                                                    
                                                    console.log(`📱 SCRIPT: Generating AI comment for post by "${authorName}"`);
                                                    console.log(`📱 SCRIPT: Post text: "${postText.substring(0, 100)}..."`);
                                                    
                                                    let commentText = '';
                                                    
                                                    // Generate AI comment using chrome.runtime.sendMessage (same as AI button)
                                                    try {
                                                        console.log(`📱 SCRIPT: Requesting AI comment from background...`);
                                                        const response = await new Promise((resolve, reject) => {
                                                            chrome.runtime.sendMessage({
                                                                action: 'generateCommentFromContent',
                                                                postText: postText,
                                                                authorName: authorName,
                                                                goal: commentSettings.goal || 'AddValue',
                                                                tone: commentSettings.tone || 'Professional',
                                                                commentLength: commentSettings.commentLength || 'Short',
                                                                userExpertise: commentSettings.userExpertise || '',
                                                                userBackground: commentSettings.userBackground || ''
                                                            }, (response) => {
                                                                if (chrome.runtime.lastError) {
                                                                    reject(chrome.runtime.lastError);
                                                                } else {
                                                                    resolve(response);
                                                                }
                                                            });
                                                        });
                                                        
                                                        if (response && response.success && response.comment) {
                                                            commentText = response.comment;
                                                            console.log(`📱 SCRIPT: AI generated comment: ${commentText.substring(0, 50)}...`);
                                                        } else {
                                                            console.log(`📱 SCRIPT: AI response error:`, response?.error || 'No comment returned');
                                                        }
                                                    } catch (aiError) {
                                                        console.error(`📱 SCRIPT: AI comment generation failed:`, aiError);
                                                    }
                                                    
                                                    // Fallback to smart template if AI failed
                                                    if (!commentText) {
                                                        const templates = [
                                                            `Great insights, ${authorName}! Thanks for sharing this perspective.`,
                                                            `Really valuable content here. Appreciate you sharing this, ${authorName}!`,
                                                            `This resonates with me. Thanks for the thoughtful post, ${authorName}!`,
                                                            `Excellent points! Looking forward to more content like this.`,
                                                            `Well articulated thoughts. Thanks for sharing your expertise!`
                                                        ];
                                                        commentText = templates[Math.floor(Math.random() * templates.length)];
                                                        console.log(`📱 SCRIPT: Using template comment (AI fallback)`);
                                                    }
                                                    
                                                    // Capture post details for history
                                                    const postUrn = post.getAttribute('data-urn') || '';
                                                    postDetails.push({
                                                        authorName: authorName,
                                                        postContent: postText,
                                                        generatedComment: commentText,
                                                        postLink: postUrn ? `https://www.linkedin.com/feed/update/${postUrn}` : '',
                                                        timestamp: Date.now()
                                                    });
                                                    
                                                    // Insert comment using different methods
                                                    commentBox.focus();
                                                    commentBox.innerHTML = `<p>${commentText}</p>`;
                                                    commentBox.dispatchEvent(new Event('input', { bubbles: true }));
                                                    commentBox.dispatchEvent(new Event('change', { bubbles: true }));
                                                    commentBox.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'a' }));
                                                    
                                                    console.log(`📱 SCRIPT: Inserted comment text, waiting for submit button...`);
                                                    await new Promise(resolve => setTimeout(resolve, 1500));
                                                    
                                                    // Find and click submit button - multiple selector options
                                                    const submitSelectors = [
                                                        'button.comments-comment-box__submit-button:not(:disabled)',
                                                        'button.comments-comment-box__submit-button--cr:not(:disabled)',
                                                        'form.comments-comment-box__form button[type="submit"]:not(:disabled)',
                                                        'button[data-control-name="add_comment"]:not(:disabled)',
                                                        '.comments-comment-box button.artdeco-button--primary:not(:disabled)',
                                                        'button.comments-comment-texteditor__submit-button:not(:disabled)'
                                                    ];
                                                    
                                                    let submitBtn = null;
                                                    for (const selector of submitSelectors) {
                                                        submitBtn = document.querySelector(selector);
                                                        if (submitBtn) {
                                                            console.log(`📱 SCRIPT: Found submit button with selector: ${selector}`);
                                                            break;
                                                        }
                                                    }
                                                    
                                                    if (submitBtn) {
                                                        submitBtn.click();
                                                        comments++;
                                                        console.log(`📱 SCRIPT: Posted comment on post ${index + 1}`);
                                                        await new Promise(resolve => setTimeout(resolve, 2500));
                                                    } else {
                                                        console.log(`📱 SCRIPT: Submit button not found for post ${index + 1}, trying alternative...`);
                                                        // Try to find any enabled button in the comment form area
                                                        const anySubmitBtn = post.querySelector('button.artdeco-button--primary:not(:disabled)') ||
                                                                           document.querySelector('.comments-comment-box button:not(:disabled)');
                                                        if (anySubmitBtn) {
                                                            anySubmitBtn.click();
                                                            comments++;
                                                            console.log(`📱 SCRIPT: Posted with alternative button on post ${index + 1}`);
                                                            await new Promise(resolve => setTimeout(resolve, 2500));
                                                        }
                                                    }
                                                }
                                            }
                                        }

                                        // Share post
                                        if (postActions.shares) {
                                            const shareBtn = post.querySelector('button[aria-label*="Repost"], button.social-reshare-button, button[data-control-name="share_toggle"]');
                                            if (shareBtn) {
                                                shareBtn.click();
                                                await new Promise(resolve => setTimeout(resolve, 1500));
                                                
                                                // STRATEGY 1: Exact CSS Path - targets 2nd list item (Instant Repost)
                                                let repostOption = document.querySelector('li:nth-child(2) div.artdeco-dropdown__item');
                                                
                                                // STRATEGY 2: Text Content Search (Fallback)
                                                if (!repostOption) {
                                                    console.log('⚠️ SHARE: Exact selector failed, trying text search...');
                                                    const items = document.querySelectorAll('.artdeco-dropdown__item, [role="menuitem"]');
                                                    for (const item of items) {
                                                        const text = item.innerText.toLowerCase();
                                                        // Search for 'instant' which only appears in the Instant Repost option
                                                        if (text.includes('instant')) {
                                                            repostOption = item;
                                                            break;
                                                        }
                                                    }
                                                }
                                                
                                                if (repostOption) {
                                                    repostOption.click();
                                                    shares++;
                                                    console.log(`📱 SCRIPT: Shared post ${index + 1}`);
                                                    await new Promise(resolve => setTimeout(resolve, 1500));
                                                }
                                            }
                                        }

                                        // Wait between posts
                                        if (index < postsToProcess.length - 1) {
                                            console.log(`📱 SCRIPT: Waiting before next post...`);
                                            await new Promise(resolve => setTimeout(resolve, 2000));
                                        }

                                    } catch (error) {
                                        console.error(`📱 SCRIPT: Error processing post ${index + 1}:`, error);
                                    }
                                }
                            }
                            
                            // Start processing posts
                            await processPostsSequentially();

                            // Resolve immediately after processing is complete
                            resolve({ likes, comments, shares, follows, postDetails });

                        } catch (error) {
                            resolve({ likes: 0, comments: 0, shares: 0, follows: 0, postDetails: [], error: error.message });
                        }
                    });
                },
                args: [postsCount, actions, randomMode, commentSettings, profileSlug]
                });
                
                console.log('📱 IMPORT: Script executed, result:', result);
                
            } catch (scriptError) {
                console.error('📱 IMPORT: Script execution failed:', scriptError);
                return { likes: 0, comments: 0, shares: 0, follows: 0, postDetails: [], error: scriptError.message };
            }

            // Wait for script to complete before closing
            console.log('⏳ IMPORT: Waiting 10 seconds for actions to complete...');
            await new Promise(resolve => setTimeout(resolve, 10000));

            // Close tab
            try {
                await chrome.tabs.remove(tabId);
            } catch (e) {
                console.log('📱 IMPORT: Tab already closed');
            }

            return result?.[0]?.result || { likes: 0, comments: 0, shares: 0, follows: 0, postDetails: [] };

        } catch (error) {
            console.error('📱 IMPORT: Error in engageWithProfilePosts:', error);
            return { likes: 0, comments: 0, shares: 0, follows: 0, postDetails: [], error: error.message };
        }
    }

    /**
     * Extract contact info from profile contact overlay
     */
    async extractContactInfo(contactUrl) {
        try {
            console.log('📧 IMPORT: Opening contact info page:', contactUrl);
            
            const tabId = await browser.openTab(contactUrl, false);
            if (!tabId) return { email: null, phone: null };

            await new Promise(resolve => setTimeout(resolve, 3000));

            const result = await chrome.scripting.executeScript({
                target: { tabId },
                func: () => {
                    try {
                        let email = null;
                        let phone = null;

                        // Look for email
                        const emailSelectors = [
                            'a[href^="mailto:"]',
                            'span:contains("@")',
                            '.ci-email'
                        ];
                        
                        for (const selector of emailSelectors) {
                            const emailEl = document.querySelector(selector);
                            if (emailEl) {
                                if (selector === 'a[href^="mailto:"]') {
                                    email = emailEl.href.replace('mailto:', '');
                                } else {
                                    const text = emailEl.textContent;
                                    if (text.includes('@')) {
                                        email = text.trim();
                                    }
                                }
                                if (email) break;
                            }
                        }

                        // Look for phone
                        const phoneSelectors = [
                            'a[href^="tel:"]',
                            '.ci-phone',
                            'span[aria-label*="phone" i]',
                            'span:contains("+")'
                        ];
                        
                        for (const selector of phoneSelectors) {
                            const phoneEl = document.querySelector(selector);
                            if (phoneEl) {
                                if (selector === 'a[href^="tel:"]') {
                                    phone = phoneEl.href.replace('tel:', '');
                                } else {
                                    const text = phoneEl.textContent.trim();
                                    if (text.match(/[\d\+\-\(\)\s]{7,}/)) {
                                        phone = text;
                                    }
                                }
                                if (phone) break;
                            }
                        }

                        console.log('📧 SCRIPT: Extracted contact info:', { email, phone });
                        return { email, phone };

                    } catch (error) {
                        console.error('📧 SCRIPT: Contact info extraction error:', error);
                        return { email: null, phone: null };
                    }
                }
            });

            await chrome.tabs.remove(tabId);

            return result[0]?.result || { email: null, phone: null };

        } catch (error) {
            console.error('📧 IMPORT: Contact info extraction failed:', error);
            return { email: null, phone: null };
        }
    }

    /**
     * Save lead to storage
     */
    async saveLead(lead) {
        try {
            const { leads = [] } = await chrome.storage.local.get('leads');
            
            // Check for duplicates
            const existingIndex = leads.findIndex(l => l.profileUrl === lead.profileUrl);
            if (existingIndex >= 0) {
                leads[existingIndex] = { ...leads[existingIndex], ...lead };
            } else {
                leads.unshift(lead); // Add at top
            }
            
            await chrome.storage.local.set({ leads });
            console.log('💾 IMPORT: Lead saved:', lead.name);
            
        } catch (error) {
            console.error('💾 IMPORT: Failed to save lead:', error);
        }
    }

    /**
     * Extract name from LinkedIn profile URL
     */
    extractNameFromUrl(url) {
        try {
            const match = url.match(/\/in\/([^\/]+)/);
            if (match) {
                return match[1].split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ').replace(/\d+/g, '').trim();
            }
            return 'Unknown Profile';
        } catch (error) {
            return 'Unknown Profile';
        }
    }

    /**
     * Save import history records for each profile
     */
    async saveImportHistory(profiles, results, options) {
        try {
            console.log('💾 BACKGROUND: Saving import history for', profiles.length, 'profiles...');
            
            const storage = await chrome.storage.local.get('importHistory');
            const importHistory = storage.importHistory || [];
            
            // Create a record for each profile (both successful and failed)
            for (let i = 0; i < profiles.length; i++) {
                const profile = profiles[i];
                const error = results.errors.find(e => e.startsWith(profile));
                const lead = results.leads.find(l => l.profileUrl === profile);
                
                // Get post details for this profile if available
                const profilePostDetails = results.profilePostDetails?.[profile] || [];
                
                // For combined automation, success is based on post engagement OR connection
                const hasPostEngagement = profilePostDetails.length > 0 || 
                    (results.totalLikes > 0 || results.totalComments > 0 || results.totalShares > 0);
                const hasConnection = !!lead;
                const isSuccess = hasPostEngagement || hasConnection;
                const status = error ? 'Failed' : (isSuccess ? 'Success' : 'Pending');
                const errorMsg = error ? error.split(': ')[1] : '';
                
                // Calculate engagement stats from post details or divide totals
                const likesCount = profilePostDetails.length > 0 ? 
                    Math.round(results.totalLikes / Math.max(results.profilesProcessed, 1)) : 0;
                const commentsCount = profilePostDetails.filter(p => p.generatedComment).length || 
                    Math.round(results.totalComments / Math.max(results.profilesProcessed, 1));
                const sharesCount = profilePostDetails.length > 0 ? 
                    Math.round(results.totalShares / Math.max(results.profilesProcessed, 1)) : 0;
                const followsCount = profilePostDetails.length > 0 ? 
                    Math.round(results.totalFollows / Math.max(results.profilesProcessed, 1)) : 0;
                
                // Get profile name from post details author if available
                const profileNameFromPosts = profilePostDetails.length > 0 ? 
                    (profilePostDetails[0]?.authorName || null) : null;
                
                const record = {
                    id: `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    timestamp: Date.now(),
                    date: new Date().toLocaleString(),
                    action: 'Combined',
                    profileUrl: profile,
                    profileName: lead?.name || profileNameFromPosts || this.extractNameFromUrl(profile),
                    email: lead?.email || null,
                    phone: lead?.phone || null,
                    connectionsSent: hasConnection ? 1 : 0,
                    likes: likesCount,
                    comments: commentsCount,
                    shares: sharesCount,
                    follows: followsCount,
                    status: status,
                    errorMessage: errorMsg || null,
                    extractContactInfo: options.extractContactInfo || false,
                    postDetails: profilePostDetails // Include post details with author, text, and comments
                };
                
                console.log('💾 BACKGROUND: Creating record with postDetails:', profilePostDetails.length, 'posts');
                
                importHistory.unshift(record); // Add at top
                console.log('💾 BACKGROUND: Saved import record for:', profile, 'Status:', status);
            }
            
            await chrome.storage.local.set({ importHistory });
            console.log('✅ BACKGROUND: Import history saved! Total records:', importHistory.length);
            
        } catch (error) {
            console.error('❌ BACKGROUND: Failed to save import history:', error);
        }
    }

    /**
     * Save post engagement history records for each profile
     */
    async savePostEngagementHistory(profiles, results, options) {
        try {
            console.log('💾 BACKGROUND: Saving post engagement history for', profiles.length, 'profiles...');
            
            const storage = await chrome.storage.local.get('importHistory');
            const importHistory = storage.importHistory || [];
            
            // Create a record for each profile
            for (let i = 0; i < profiles.length; i++) {
                const profile = profiles[i];
                const error = results.errors.find(e => e.startsWith(profile));
                const status = error ? 'Failed' : 'Success';
                const errorMsg = error ? error.split(': ')[1] : '';
                
                // Calculate stats per profile (divide totals by profiles processed)
                const likesPerProfile = results.profilesProcessed > 0 ? Math.round(results.totalLikes / results.profilesProcessed) : 0;
                const commentsPerProfile = results.profilesProcessed > 0 ? Math.round(results.totalComments / results.profilesProcessed) : 0;
                const sharesPerProfile = results.profilesProcessed > 0 ? Math.round(results.totalShares / results.profilesProcessed) : 0;
                const followsPerProfile = results.profilesProcessed > 0 ? Math.round(results.totalFollows / results.profilesProcessed) : 0;
                
                const record = {
                    id: `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    timestamp: Date.now(),
                    date: new Date().toLocaleString(),
                    action: 'Post Engagement',
                    profileUrl: profile,
                    profileName: this.extractNameFromUrl(profile),
                    connections: 0,
                    likes: error ? 0 : likesPerProfile,
                    comments: error ? 0 : commentsPerProfile,
                    shares: error ? 0 : sharesPerProfile,
                    follows: error ? 0 : followsPerProfile,
                    status: status,
                    errorMessage: errorMsg || null,
                    postsEngaged: options.postsPerProfile || 2
                };
                
                importHistory.unshift(record); // Add at top
                console.log('💾 BACKGROUND: Saved post engagement record for:', profile, 'Status:', status);
            }
            
            await chrome.storage.local.set({ importHistory });
            console.log('✅ BACKGROUND: Post engagement history saved! Total records:', importHistory.length);
            
        } catch (error) {
            console.error('❌ BACKGROUND: Failed to save post engagement history:', error);
        }
    }

    /**
     * Get current processing status
     */
    getStatus() {
        return {
            isProcessing: this.isProcessing,
            currentOperation: this.currentOperation
        };
    }

    /**
     * Stop current operation
     */
    stop() {
        if (this.isProcessing) {
            console.log('🛑 IMPORT: Stopping current operation...');
            this.stopFlag = true;
            this.isProcessing = false;
            this.currentOperation = null;
            return { success: true, message: 'Import automation stopped' };
        }
        return { success: false, message: 'No operation running' };
    }
}

export const importAutomation = new ImportAutomation();
export default ImportAutomation;
