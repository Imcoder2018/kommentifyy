/**
 * POST SCHEDULER MODULE
 * Handles automatic posting of scheduled content using Chrome alarms
 * 
 * MISSED POST HANDLING OPTIONS:
 * - 'auto_post': Automatically post missed content when system comes online
 * - 'wait_manual': Mark as missed and wait for user to manually trigger
 * - 'reschedule': Reschedule to next available time slot
 */

class PostScheduler {
    constructor() {
        this.alarmName = 'postSchedulerCheck';
        this.isRunning = false;
        this.logPrefix = '📅 POST SCHEDULER';
    }

    /**
     * Enhanced logging with timestamp
     */
    log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const logMessage = `${this.logPrefix} [${timestamp}] ${message}`;
        
        if (level === 'error') {
            console.error(logMessage, data || '');
        } else if (level === 'warn') {
            console.warn(logMessage, data || '');
        } else {
            console.log(logMessage, data || '');
        }
        
        // Also store recent logs for debugging
        this.storeLog(level, message, data);
    }
    
    /**
     * Store logs in chrome.storage for debugging
     */
    async storeLog(level, message, data) {
        try {
            const result = await chrome.storage.local.get('schedulerLogs');
            const logs = result.schedulerLogs || [];
            
            logs.push({
                timestamp: new Date().toISOString(),
                level,
                message,
                data: data ? JSON.stringify(data).substring(0, 500) : null
            });
            
            // Keep only last 100 logs
            if (logs.length > 100) {
                logs.splice(0, logs.length - 100);
            }
            
            await chrome.storage.local.set({ schedulerLogs: logs });
        } catch (error) {
            // Silent fail - logging shouldn't break the scheduler
        }
    }

    async start() {
        if (this.isRunning) return;
        
        this.log('info', '🚀 Starting Post Scheduler...');
        this.isRunning = true;
        
        // Check for missed posts on startup
        await this.checkForMissedPosts();
        
        // Check immediately
        await this.checkAndPostScheduled();
        
        // Create alarm to check every minute (Chrome alarms work even when service worker sleeps)
        await chrome.alarms.create(this.alarmName, {
            periodInMinutes: 1
        });
        
        this.log('info', '✅ Alarm created for periodic checks (every 1 minute)');
    }
    
    /**
     * Get missed post behavior setting
     * Options: 'auto_post', 'wait_manual', 'reschedule'
     */
    async getMissedPostBehavior() {
        try {
            const result = await chrome.storage.local.get('missedPostBehavior');
            return result.missedPostBehavior || 'wait_manual'; // Default to wait for manual action
        } catch (error) {
            return 'wait_manual';
        }
    }

    /**
     * Check for missed posts (past due) and handle based on user settings
     */
    async checkForMissedPosts() {
        try {
            this.log('info', '🔍 Checking for missed posts...');
            
            const result = await chrome.storage.local.get('scheduledPosts');
            const scheduledPosts = result.scheduledPosts || [];
            
            if (scheduledPosts.length === 0) {
                this.log('info', 'No scheduled posts found');
                return;
            }
            
            const now = new Date();
            const missedPosts = scheduledPosts.filter(post => {
                if (post.status === 'missed' || post.status === 'failed') return false; // Already handled
                const scheduledDate = new Date(post.scheduledFor || post.scheduledDate);
                // Consider missed if more than 5 minutes past due
                return scheduledDate < new Date(now.getTime() - 5 * 60 * 1000);
            });
            
            if (missedPosts.length === 0) {
                this.log('info', 'No missed posts found');
                return;
            }
            
            this.log('warn', `⚠️ Found ${missedPosts.length} missed post(s)`, { ids: missedPosts.map(p => p.id) });
            
            // Get user's preferred behavior for missed posts
            const behavior = await this.getMissedPostBehavior();
            this.log('info', `Missed post behavior: ${behavior}`);
            
            let updatedPosts = [...scheduledPosts];
            
            switch (behavior) {
                case 'auto_post':
                    // Automatically post all missed content now
                    this.log('info', '🚀 Auto-posting missed posts...');
                    for (const post of missedPosts) {
                        this.log('info', `Auto-posting missed post: ${post.id}`);
                        await this.publishPost(post);
                        // Remove from queue after posting
                        updatedPosts = updatedPosts.filter(p => p.id !== post.id);
                    }
                    this.showNotification('Missed Posts Published', `${missedPosts.length} missed post(s) have been auto-published.`);
                    break;
                    
                case 'reschedule':
                    // Reschedule to next available slot (next hour)
                    this.log('info', '🔄 Rescheduling missed posts...');
                    const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
                    nextHour.setMinutes(0, 0, 0);
                    
                    updatedPosts = scheduledPosts.map(post => {
                        const scheduledDate = new Date(post.scheduledFor || post.scheduledDate);
                        if (scheduledDate < new Date(now.getTime() - 5 * 60 * 1000) && post.status !== 'missed') {
                            const rescheduledTime = new Date(nextHour.getTime() + (updatedPosts.filter(p => p.status === 'rescheduled').length * 15 * 60 * 1000));
                            this.log('info', `Rescheduled post ${post.id} to ${rescheduledTime.toLocaleString()}`);
                            return { 
                                ...post, 
                                status: 'rescheduled',
                                originalScheduledFor: post.scheduledFor || post.scheduledDate,
                                scheduledFor: rescheduledTime.toISOString()
                            };
                        }
                        return post;
                    });
                    this.showNotification('Posts Rescheduled', `${missedPosts.length} missed post(s) have been rescheduled.`);
                    break;
                    
                case 'wait_manual':
                default:
                    // Mark as missed and wait for user action
                    this.log('info', '⏸️ Marking posts as missed (waiting for manual action)...');
                    updatedPosts = scheduledPosts.map(post => {
                        const scheduledDate = new Date(post.scheduledFor || post.scheduledDate);
                        if (scheduledDate < new Date(now.getTime() - 5 * 60 * 1000) && post.status !== 'missed') {
                            return { ...post, status: 'missed', missedAt: now.toISOString() };
                        }
                        return post;
                    });
                    this.notifyMissedPosts(missedPosts.length);
                    break;
            }
            
            await chrome.storage.local.set({ scheduledPosts: updatedPosts });
            this.log('info', '✅ Missed posts handled');
            
        } catch (error) {
            this.log('error', 'Error checking missed posts:', error.message);
        }
    }
    
    /**
     * Manually post all missed posts (called from UI)
     */
    async postMissedPosts() {
        try {
            this.log('info', '📤 Manually posting all missed posts...');
            
            const result = await chrome.storage.local.get('scheduledPosts');
            const scheduledPosts = result.scheduledPosts || [];
            
            const missedPosts = scheduledPosts.filter(p => p.status === 'missed');
            
            if (missedPosts.length === 0) {
                this.log('info', 'No missed posts to publish');
                return { success: true, published: 0 };
            }
            
            let publishedCount = 0;
            let remainingPosts = [...scheduledPosts];
            
            for (const post of missedPosts) {
                this.log('info', `Publishing missed post: ${post.id}`);
                await this.publishPost(post);
                remainingPosts = remainingPosts.filter(p => p.id !== post.id);
                publishedCount++;
            }
            
            await chrome.storage.local.set({ scheduledPosts: remainingPosts });
            
            this.log('info', `✅ Published ${publishedCount} missed posts`);
            return { success: true, published: publishedCount };
            
        } catch (error) {
            this.log('error', 'Error posting missed posts:', error.message);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Reschedule all missed posts to a new time
     */
    async rescheduleMissedPosts(newDateTime) {
        try {
            this.log('info', `🔄 Rescheduling missed posts to ${newDateTime}...`);
            
            const result = await chrome.storage.local.get('scheduledPosts');
            const scheduledPosts = result.scheduledPosts || [];
            
            const updatedPosts = scheduledPosts.map((post, index) => {
                if (post.status === 'missed') {
                    // Stagger by 15 minutes each
                    const rescheduledTime = new Date(new Date(newDateTime).getTime() + (index * 15 * 60 * 1000));
                    return {
                        ...post,
                        status: 'pending',
                        originalScheduledFor: post.scheduledFor || post.scheduledDate,
                        scheduledFor: rescheduledTime.toISOString()
                    };
                }
                return post;
            });
            
            await chrome.storage.local.set({ scheduledPosts: updatedPosts });
            
            const rescheduledCount = scheduledPosts.filter(p => p.status === 'missed').length;
            this.log('info', `✅ Rescheduled ${rescheduledCount} posts`);
            
            return { success: true, rescheduled: rescheduledCount };
            
        } catch (error) {
            this.log('error', 'Error rescheduling posts:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Notify user about missed posts
     */
    notifyMissedPosts(count) {
        try {
            chrome.notifications.create('missed-posts-' + Date.now(), {
                type: 'basic',
                iconUrl: chrome.runtime.getURL('assets/images/icon128.png'),
                title: '⚠️ Missed Scheduled Posts',
                message: `You have ${count} scheduled post(s) that missed their time. Open the extension to post them manually.`,
                priority: 2,
                requireInteraction: true
            });
        } catch (error) {
            console.error('Post Scheduler: Notification error:', error);
        }
    }

    stop() {
        chrome.alarms.clear(this.alarmName);
        this.isRunning = false;
        this.log('info', '🛑 Post Scheduler Stopped');
    }

    /**
     * Handle alarm trigger - called from background script
     */
    async handleAlarm() {
        this.log('info', '⏰ Alarm triggered, checking scheduled posts...');
        await this.checkAndPostScheduled();
    }

    /**
     * Check if current time is within business hours and active days
     */
    async isWithinBusinessHours() {
        try {
            const { businessHoursSettings } = await chrome.storage.local.get('businessHoursSettings');
            
            // If no settings or disabled, allow posting
            if (!businessHoursSettings || !businessHoursSettings.enabled) {
                this.log('info', 'Business hours disabled, allowing post');
                return true;
            }
            
            const now = new Date();
            const currentHour = now.getHours();
            const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
            
            // Check active days (workDays is array like [1,2,3,4,5] for Mon-Fri)
            const workDays = businessHoursSettings.workDays || [1, 2, 3, 4, 5];
            if (!workDays.includes(currentDay)) {
                this.log('info', `Day ${currentDay} not in active days [${workDays}]`);
                return false;
            }
            
            // Check business hours
            const startHour = businessHoursSettings.startHour || 9;
            const endHour = businessHoursSettings.endHour || 18;
            
            if (currentHour < startHour || currentHour >= endHour) {
                this.log('info', `Hour ${currentHour} outside business hours (${startHour}-${endHour})`);
                return false;
            }
            
            this.log('info', '✅ Within business hours');
            return true;
        } catch (error) {
            this.log('error', 'Error checking business hours:', error.message);
            return true; // Default to allowing if error
        }
    }

    async checkAndPostScheduled() {
        try {
            this.log('info', '🔄 Checking scheduled posts...');
            
            const result = await chrome.storage.local.get('scheduledPosts');
            const scheduledPosts = result.scheduledPosts || [];
            
            if (scheduledPosts.length === 0) {
                this.log('info', 'No scheduled posts in queue');
                return;
            }
            
            this.log('info', `Found ${scheduledPosts.length} scheduled post(s) in queue`);

            const now = new Date();
            const postsToPublish = [];
            const remainingPosts = [];

            for (const post of scheduledPosts) {
                // Skip already processed posts
                if (post.status === 'missed' || post.status === 'failed') {
                    this.log('info', `Skipping post ${post.id} with status: ${post.status}`);
                    remainingPosts.push(post);
                    continue;
                }
                
                // Support both scheduledFor (new format) and scheduledDate (legacy)
                const scheduledDateStr = post.scheduledFor || post.scheduledDate;
                const scheduledDate = new Date(scheduledDateStr);
                
                // Skip invalid dates
                if (isNaN(scheduledDate.getTime())) {
                    console.error(`Post Scheduler: Invalid date for post "${post.content?.substring(0, 30)}..." - raw value: "${scheduledDateStr}"`);
                    remainingPosts.push(post); // Keep in queue for manual review
                    continue;
                }
                
                console.log(`Post Scheduler: Post "${post.content?.substring(0, 30)}..." scheduled for ${scheduledDate.toLocaleString()} (raw: ${scheduledDateStr}), now is ${now.toLocaleString()}`);
                
                if (scheduledDate <= now) {
                    postsToPublish.push(post);
                } else {
                    remainingPosts.push(post);
                }
            }

            if (postsToPublish.length > 0) {
                console.log(`Post Scheduler: Found ${postsToPublish.length} post(s) due for publishing`);
                
                // Check business hours before posting
                const canPost = await this.isWithinBusinessHours();
                
                if (!canPost) {
                    console.log('Post Scheduler: Outside business hours, skipping posts for now');
                    // Notify user that posts are waiting
                    await this.notifyOutsideBusinessHours();
                    // Don't remove from queue, will try again next check
                    return;
                }
                
                // Mark as currently posting
                await chrome.storage.local.set({ postSchedulerActive: true });
                
                for (const post of postsToPublish) {
                    console.log(`Post Scheduler: Publishing post ID ${post.id}...`);
                    await this.publishPost(post);
                }

                // Update storage with remaining posts (remove published ones)
                await chrome.storage.local.set({ scheduledPosts: remainingPosts });
                console.log(`Post Scheduler: Updated storage, ${remainingPosts.length} posts remaining`);
            } else {
                console.log('Post Scheduler: No posts due yet');
            }
        } catch (error) {
            console.error('Post Scheduler: Error checking scheduled posts:', error);
        }
    }

    async publishPost(post) {
        try {
            console.log('Post Scheduler: Publishing post:', post.id);
            
            // Broadcast posting started
            await this.broadcastPostingStatus({
                status: 'posting',
                postId: post.id,
                content: post.content?.substring(0, 50) + '...'
            });

            // ALWAYS create a NEW LinkedIn tab to avoid state issues
            console.log('Post Scheduler: Creating new LinkedIn tab for posting...');
            const linkedinTab = await chrome.tabs.create({ url: 'https://www.linkedin.com/feed/', active: true });
            
            // Wait for tab to fully load
            await this.waitForTabLoad(linkedinTab.id);
            console.log('Post Scheduler: New LinkedIn tab created and loaded:', linkedinTab.id);
            
            // Wait for LinkedIn to fully initialize (important for reliable posting)
            const isReady = await this.waitForLinkedInReady(linkedinTab.id, 30000);
            if (!isReady) {
                throw new Error('LinkedIn page did not load properly - Start Post button not found');
            }

            // Additional stabilization wait
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Use single script injection with setTimeout delays (like old working extension)
            console.log('Post Scheduler: Injecting post script...');
            const result = await chrome.scripting.executeScript({
                target: { tabId: linkedinTab.id },
                func: (content) => {
                    return new Promise((resolve) => {
                        const _poll = (fn, interval, timeout) => new Promise(r => {
                            const start = Date.now();
                            const check = () => { const el = fn(); if (el) return r(el); if (Date.now() - start > timeout) return r(null); setTimeout(check, interval); };
                            check();
                        });
                        const _findStartBtn = () => {
                            const s1 = document.querySelector('div.share-box-feed-entry__top-bar button');
                            if (s1) return s1;
                            for (const btn of document.querySelectorAll('button')) {
                                if ((btn.getAttribute('aria-label') || '').toLowerCase().includes('start a post')) return btn;
                            }
                            return document.querySelector('.share-box-feed-entry__trigger');
                        };
                        const _findEditor = () => {
                            const dialog = document.querySelector('[role="dialog"]');
                            if (dialog) {
                                const e1 = dialog.querySelector('[role="textbox"][contenteditable="true"]');
                                if (e1) return e1;
                                const e2 = dialog.querySelector('[contenteditable="true"][aria-multiline="true"]');
                                if (e2) return e2;
                                const e3 = dialog.querySelector('.ql-editor[contenteditable="true"]');
                                if (e3) return e3;
                            }
                            const e4 = document.querySelector('.ql-editor[contenteditable="true"]');
                            if (e4) return e4;
                            for (const el of document.querySelectorAll('[contenteditable="true"]')) {
                                const ph = (el.getAttribute('data-placeholder') || el.getAttribute('aria-placeholder') || '').toLowerCase();
                                if (ph.includes('want to talk about')) return el;
                            }
                            return null;
                        };
                        const _findPostBtn = () => {
                            const dialog = document.querySelector('[role="dialog"]');
                            const scope = dialog || document;
                            for (const btn of scope.querySelectorAll('button')) {
                                const txt = (btn.textContent || '').trim().toLowerCase();
                                if (txt === 'post') return btn;
                            }
                            return null;
                        };
                        try {
                            console.log('Post Scheduler Script: Starting...');
                            const startPostBtn = _findStartBtn();
                            if (!startPostBtn) {
                                resolve({ success: false, error: 'Start post button not found' });
                                return;
                            }
                            console.log('Post Scheduler Script: Clicking start post button...');
                            startPostBtn.click();
                            _poll(_findEditor, 500, 11000).then(async (editor) => {
                                try {
                                    if (!editor) {
                                        resolve({ success: false, error: 'Editor not found after polling' });
                                        return;
                                    }
                                    console.log('Post Scheduler Script: Editor found via logic-based detection');
                                    editor.innerHTML = '';
                                    editor.focus();
                                    const lines = content.split('\n');
                                    lines.forEach((line) => {
                                        if (line.trim() === '') {
                                            editor.appendChild(document.createElement('br'));
                                        } else {
                                            const p = document.createElement('p');
                                            p.textContent = line;
                                            editor.appendChild(p);
                                        }
                                    });
                                    editor.dispatchEvent(new Event('input', { bubbles: true }));
                                    console.log('Post Scheduler Script: Content inserted successfully');
                                    await new Promise(r => setTimeout(r, 3000));
                                    const postButton = _findPostBtn();
                                    if (postButton && !postButton.disabled) {
                                        console.log('Post Scheduler Script: Clicking Post button...');
                                        postButton.click();
                                        resolve({ success: true, posted: true });
                                    } else {
                                        resolve({ success: true, posted: false, message: 'Content inserted, please click Post manually' });
                                    }
                                } catch (err) {
                                    resolve({ success: false, error: err.message });
                                }
                            });
                        } catch (error) {
                            console.error('Post Scheduler Script: Error:', error);
                            resolve({ success: false, error: error.message });
                        }
                    });
                },
                args: [post.content]
            });

            const scriptResult = result?.[0]?.result;
            console.log('Post Scheduler: Script result:', scriptResult);

            if (scriptResult?.success) {
                if (scriptResult.posted) {
                    console.log('Post Scheduler: Successfully published post:', post.id);
                    this.showNotification('Post Published!', 'Your scheduled post has been published to LinkedIn!');
                    
                    // Broadcast success
                    await this.broadcastPostingStatus({
                        status: 'completed',
                        postId: post.id,
                        success: true
                    });
                } else {
                    console.log('Post Scheduler: Content inserted but could not auto-post. Post ID:', post.id);
                    this.showNotification('Post Ready', scriptResult.message || 'Content inserted. Please click the Post button manually.');
                    
                    // Broadcast partial success
                    await this.broadcastPostingStatus({
                        status: 'manual_required',
                        postId: post.id,
                        message: 'Content inserted, click Post button'
                    });
                }
            } else {
                throw new Error(scriptResult?.error || 'Unknown error during posting');
            }
            
            // Clear active flag
            await chrome.storage.local.set({ postSchedulerActive: false });

        } catch (error) {
            console.error('Post Scheduler: Error publishing post:', error);
            
            // Broadcast failure
            await this.broadcastPostingStatus({
                status: 'failed',
                postId: post.id,
                error: error.message
            });
            
            // Mark post as failed instead of removing
            await this.markPostAsFailed(post, error.message);
            
            // Clear active flag
            await chrome.storage.local.set({ postSchedulerActive: false });
            
            // Show error notification
            this.showNotification('Post Failed', `Failed to publish: ${error.message}`);
        }
    }

    /**
     * Mark a post as failed so user can retry manually
     */
    async markPostAsFailed(post, errorMessage) {
        try {
            const result = await chrome.storage.local.get('scheduledPosts');
            const scheduledPosts = result.scheduledPosts || [];
            
            const updatedPosts = scheduledPosts.map(p => {
                if (p.id === post.id) {
                    return { ...p, status: 'failed', error: errorMessage, failedAt: new Date().toISOString() };
                }
                return p;
            });
            
            // If post was already removed, add it back as failed
            if (!updatedPosts.find(p => p.id === post.id)) {
                updatedPosts.unshift({ ...post, status: 'failed', error: errorMessage, failedAt: new Date().toISOString() });
            }
            
            await chrome.storage.local.set({ scheduledPosts: updatedPosts });
            console.log('Post Scheduler: Marked post as failed:', post.id);
        } catch (error) {
            console.error('Post Scheduler: Error marking post as failed:', error);
        }
    }

    /**
     * Show notification with proper icon path
     */
    showNotification(title, message) {
        try {
            chrome.notifications.create('post-scheduler-' + Date.now(), {
                type: 'basic',
                iconUrl: chrome.runtime.getURL('assets/images/icon128.png'),
                title: title,
                message: message,
                priority: 2
            });
        } catch (error) {
            console.error('Post Scheduler: Notification error:', error);
        }
    }
    
    /**
     * Broadcast posting status for dashboard display
     */
    async broadcastPostingStatus(statusData) {
        try {
            await chrome.storage.local.set({
                postSchedulerStatus: {
                    ...statusData,
                    timestamp: Date.now()
                }
            });
            console.log('Post Scheduler: Status broadcast:', statusData.status);
        } catch (error) {
            console.error('Post Scheduler: Failed to broadcast status:', error);
        }
    }
    
    /**
     * Show popup notification when outside business hours
     */
    async notifyOutsideBusinessHours() {
        try {
            const { businessHoursSettings } = await chrome.storage.local.get('businessHoursSettings');
            const startHour = businessHoursSettings?.startHour || 9;
            const endHour = businessHoursSettings?.endHour || 18;
            const workDays = businessHoursSettings?.workDays || [1, 2, 3, 4, 5];
            
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const activeDays = workDays.map(d => dayNames[d]).join(', ');
            
            this.showNotification(
                '⏰ Outside Business Hours',
                `Scheduled posts will run during business hours: ${startHour}:00-${endHour}:00 on ${activeDays}`
            );
            
            // Store notification flag to show in UI
            await chrome.storage.local.set({
                outsideBusinessHoursNotification: {
                    shown: true,
                    message: `Posts scheduled outside business hours. Active hours: ${startHour}:00-${endHour}:00 on ${activeDays}`,
                    timestamp: Date.now()
                }
            });
        } catch (error) {
            console.error('Post Scheduler: Failed to notify outside business hours:', error);
        }
    }

    /**
     * Wait for LinkedIn page to be ready (post button visible)
     */
    async waitForLinkedInReady(tabId, timeout = 60000) {
        const startTime = Date.now();
        const pollInterval = 3000; // Check every 3 seconds
        
        while (Date.now() - startTime < timeout) {
            try {
                const results = await chrome.scripting.executeScript({
                    target: { tabId },
                    func: () => {
                        // Logic-based detection: try multiple strategies
                        const s1 = document.querySelector('div.share-box-feed-entry__top-bar button');
                        if (s1) return { found: true, method: 'share-box-top-bar' };
                        for (const btn of document.querySelectorAll('button')) {
                            if ((btn.getAttribute('aria-label') || '').toLowerCase().includes('start a post')) return { found: true, method: 'aria-label' };
                        }
                        const s2 = document.querySelector('.share-box-feed-entry__trigger');
                        if (s2) return { found: true, method: 'trigger' };
                        return { found: false };
                    }
                });
                
                const result = results?.[0]?.result;
                if (result?.found) {
                    console.log('Post Scheduler: LinkedIn page ready - button found via:', result.selector);
                    return true;
                }
                
                console.log(`Post Scheduler: Waiting for LinkedIn... (${Math.round((Date.now() - startTime) / 1000)}s elapsed)`);
            } catch (error) {
                console.log('Post Scheduler: Page not ready yet:', error.message);
            }
            
            await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
        
        console.error('Post Scheduler: Timeout waiting for LinkedIn page to be ready');
        return false;
    }

    async waitForTabLoad(tabId, timeout = 30000) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                chrome.tabs.onUpdated.removeListener(listener);
                resolve();
            }, timeout);

            const listener = (updatedTabId, changeInfo) => {
                if (updatedTabId === tabId && changeInfo.status === 'complete') {
                    clearTimeout(timer);
                    chrome.tabs.onUpdated.removeListener(listener);
                    resolve();
                }
            };

            chrome.tabs.onUpdated.addListener(listener);
        });
    }

}


// Export for use in background script
export { PostScheduler };
