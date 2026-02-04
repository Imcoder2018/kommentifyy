/**
 * ADVANCED AUTOMATION FEATURES
 * Auto-like, auto-share, auto-follow, and more
 */

import { browser } from '../shared/utils/browser.js';
import { storage } from '../shared/storage/storage.background.js';
import { backgroundStatistics } from './statisticsManager.js';
import { randomDelay } from '../shared/utils/helpers.js';

class AdvancedAutomation {
    constructor() {
        this.dailyLimits = {
            likes: 100,
            comments: 50,
            shares: 20,
            follows: 50,
            connectionRequests: 20,
            profileViews: 100
        };

        this.currentCounts = {
            likes: 0,
            comments: 0,
            shares: 0,
            follows: 0,
            connectionRequests: 0,
            profileViews: 0
        };

        this.resetCountsDaily();
    }

    /**
     * Reset daily counts at midnight
     */
    async resetCountsDaily() {
        try {
            const result = await chrome.storage.local.get(['lastDailyReset', 'dailyCounts']);
            const lastReset = result.lastDailyReset || '';
            const today = new Date().toDateString();

            if (lastReset !== today) {
                this.currentCounts = {
                    likes: 0,
                    comments: 0,
                    shares: 0,
                    follows: 0,
                    connectionRequests: 0,
                    profileViews: 0
                };
                await chrome.storage.local.set({
                    lastDailyReset: today,
                    dailyCounts: this.currentCounts
                });
            } else {
                const saved = result.dailyCounts;
                if (saved) {
                    this.currentCounts = saved;
                }
            }
        } catch (error) {
            console.error('AUTO: Error resetting daily counts:', error);
        }
    }

    /**
     * Check if action is within daily limit
     */
    async canPerformAction(actionType) {
        await this.resetCountsDaily();
        return this.currentCounts[actionType] < this.dailyLimits[actionType];
    }

    /**
     * Increment action count
     */
    async incrementAction(actionType) {
        this.currentCounts[actionType]++;
        try {
            await chrome.storage.local.set({ dailyCounts: this.currentCounts });
        } catch (error) {
            console.error('AUTO: Error incrementing action:', error);
        }
    }

    /**
     * Auto-like posts on feed
     */
    async autoLikePosts(quota = 10) {
        console.log('AUTO-LIKE: Starting automation with quota:', quota);
        
        // Step 1: Scrape posts from current LinkedIn page
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || !tab.url.includes('linkedin.com')) {
            console.log('AUTO-LIKE: Not on LinkedIn page');
            return { liked: 0, total: quota, error: 'Not on LinkedIn' };
        }

        console.log('AUTO-LIKE: Scraping posts from current page...');
        const urns = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                const posts = document.querySelectorAll('div[data-urn]');
                return Array.from(posts).map(post => post.getAttribute('data-urn')).filter(Boolean);
            }
        }).then(r => r[0].result);

        if (!urns || urns.length === 0) {
            console.log('AUTO-LIKE: No posts found to like');
            return { liked: 0, total: quota, error: 'No posts found' };
        }

        console.log(`AUTO-LIKE: Found ${urns.length} posts, will like ${Math.min(quota, urns.length)}`);

        // Step 2: Like posts one by one in background tabs
        let liked = 0;
        const toProcess = urns.slice(0, quota);

        for (let i = 0; i < toProcess.length; i++) {
            if (!await this.canPerformAction('likes')) {
                console.log('AUTO-LIKE: Daily like limit reached');
                break;
            }

            try {
                const urn = toProcess[i];
                const postUrl = `https://www.linkedin.com/feed/update/${urn}`;
                
                console.log(`AUTO-LIKE: Processing ${i + 1}/${toProcess.length}: ${urn}`);

                // Open in background tab
                const likeTabId = await browser.openTab(postUrl, false);
                if (!likeTabId) {
                    console.error('AUTO-LIKE: Failed to open tab');
                    continue;
                }

                await new Promise(resolve => setTimeout(resolve, 2000));

                // Like the post
                const result = await chrome.scripting.executeScript({
                    target: { tabId: likeTabId },
                    func: () => {
                        const likeBtn = document.querySelector('button[aria-label*="React Like"]');
                        if (likeBtn && !likeBtn.classList.contains('react-button__trigger--active')) {
                            likeBtn.click();
                            return { success: true };
                        }
                        return { success: false, reason: 'Button not found or already liked' };
                    }
                });

                await new Promise(resolve => setTimeout(resolve, 1000));
                chrome.tabs.remove(likeTabId);

                if (result && result[0].result.success) {
                    liked++;
                    await this.incrementAction('likes');
                    await backgroundStatistics.recordLike(urn);
                    console.log(`AUTO-LIKE: Successfully liked post ${i + 1}/${toProcess.length}`);
                } else {
                    console.log(`AUTO-LIKE: Failed to like post: ${result?.[0]?.result?.reason || 'Unknown'}`);
                }

                await randomDelay(3000, 7000);
            } catch (error) {
                console.error('AUTO-LIKE: Error:', error);
            }
        }

        console.log(`AUTO-LIKE: Complete! Liked ${liked} out of ${toProcess.length} posts`);
        return { liked, total: toProcess.length };
    }

    /**
     * Like next unliked post (injected function)
     */
    likeNextPost() {
        const posts = document.querySelectorAll('div[data-urn]');
        
        for (const post of posts) {
            const likeButton = post.querySelector('button[aria-label*="Like"]');
            if (likeButton && !likeButton.classList.contains('react-button__trigger--active')) {
                likeButton.click();
                const postUrn = post.getAttribute('data-urn');
                return { success: true, postUrn };
            }
        }
        
        return { success: false };
    }

    /**
     * Auto-share/repost posts
     */
    async autoSharePosts(quota = 5) {
        console.log('AUTO-SHARE: Starting automation with quota:', quota);
        
        // Step 1: Scrape posts from current LinkedIn page
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || !tab.url.includes('linkedin.com')) {
            console.log('AUTO-SHARE: Not on LinkedIn page');
            return { shared: 0, total: quota, error: 'Not on LinkedIn' };
        }

        console.log('AUTO-SHARE: Scraping posts from current page...');
        const urns = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                const posts = document.querySelectorAll('div[data-urn]');
                return Array.from(posts).map(post => post.getAttribute('data-urn')).filter(Boolean);
            }
        }).then(r => r[0].result);

        if (!urns || urns.length === 0) {
            console.log('AUTO-SHARE: No posts found to share');
            return { shared: 0, total: quota, error: 'No posts found' };
        }

        console.log(`AUTO-SHARE: Found ${urns.length} posts, will share ${Math.min(quota, urns.length)}`);

        // Step 2: Share posts one by one in background tabs
        let shared = 0;
        const toProcess = urns.slice(0, quota);

        for (let i = 0; i < toProcess.length; i++) {
            if (!await this.canPerformAction('shares')) {
                console.log('AUTO-SHARE: Daily share limit reached');
                break;
            }

            try {
                const urn = toProcess[i];
                const postUrl = `https://www.linkedin.com/feed/update/${urn}`;
                
                console.log(`AUTO-SHARE: Processing ${i + 1}/${toProcess.length}: ${urn}`);

                // Open in background tab
                const shareTabId = await browser.openTab(postUrl, false);
                if (!shareTabId) {
                    console.error('AUTO-SHARE: Failed to open tab');
                    continue;
                }

                await new Promise(resolve => setTimeout(resolve, 3000));

                // Click share button
                const result = await chrome.scripting.executeScript({
                    target: { tabId: shareTabId },
                    func: () => {
                        return new Promise((resolve) => {
                            // Find the repost dropdown button
                            const shareBtn = document.querySelector('button.social-reshare-button');
                            if (!shareBtn) {
                                resolve({ success: false, reason: 'Share button not found' });
                                return;
                            }
                            
                            shareBtn.click();
                            
                            // Wait for dropdown menu to appear
                            setTimeout(() => {
                                const dropdownItems = document.querySelectorAll('div.artdeco-dropdown__item');
                                if (dropdownItems && dropdownItems.length >= 2) {
                                    // Click the second item (index 1) to repost
                                    dropdownItems[1].click();
                                    resolve({ success: true });
                                } else {
                                    resolve({ success: false, reason: 'Dropdown items not found' });
                                }
                            }, 800);
                        });
                    }
                });

                await new Promise(resolve => setTimeout(resolve, 2000));
                chrome.tabs.remove(shareTabId);

                if (result && result[0].result.success) {
                    shared++;
                    await this.incrementAction('shares');
                    await backgroundStatistics.recordShare(urn);
                    console.log(`AUTO-SHARE: Successfully shared post ${i + 1}/${toProcess.length}`);
                } else {
                    console.log(`AUTO-SHARE: Failed to share post: ${result?.[0]?.result?.reason || 'Unknown'}`);
                }

                await randomDelay(10000, 20000);
            } catch (error) {
                console.error('AUTO-SHARE: Error:', error);
            }
        }

        console.log(`AUTO-SHARE: Complete! Shared ${shared} out of ${toProcess.length} posts`);
        return { shared, total: toProcess.length };
    }

    /**
     * Share next post (injected function)
     */
    shareNextPost() {
        const posts = document.querySelectorAll('div[data-urn]');
        
        for (const post of posts) {
            const shareButton = post.querySelector('button.social-reshare-button');
            if (shareButton) {
                shareButton.click();
                
                // Wait for dropdown menu and click second item (repost)
                setTimeout(() => {
                    const dropdownItems = document.querySelectorAll('div.artdeco-dropdown__item');
                    if (dropdownItems && dropdownItems.length >= 2) {
                        dropdownItems[1].click(); // Click second item
                    }
                }, 800);
                
                const postUrn = post.getAttribute('data-urn');
                return { success: true, postUrn };
            }
        }
        
        return { success: false };
    }

    /**
     * Auto-follow post authors
     */
    async autoFollowAuthors(quota = 10) {
        console.log('AUTO-FOLLOW: Starting automation with quota:', quota);
        
        // Step 1: Scrape posts from current LinkedIn page
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || !tab.url.includes('linkedin.com')) {
            console.log('AUTO-FOLLOW: Not on LinkedIn page');
            return { followed: 0, total: quota, error: 'Not on LinkedIn' };
        }

        console.log('AUTO-FOLLOW: Scraping posts from current page...');
        const urns = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                const posts = document.querySelectorAll('div[data-urn]');
                return Array.from(posts).map(post => post.getAttribute('data-urn')).filter(Boolean);
            }
        }).then(r => r[0].result);

        if (!urns || urns.length === 0) {
            console.log('AUTO-FOLLOW: No posts found');
            return { followed: 0, total: quota, error: 'No posts found' };
        }

        console.log(`AUTO-FOLLOW: Found ${urns.length} posts, will follow ${Math.min(quota, urns.length)} authors`);

        // Step 2: Follow authors one by one in background tabs
        let followed = 0;
        const toProcess = urns.slice(0, quota);

        for (let i = 0; i < toProcess.length; i++) {
            if (!await this.canPerformAction('follows')) {
                console.log('AUTO-FOLLOW: Daily follow limit reached');
                break;
            }

            try {
                const urn = toProcess[i];
                const postUrl = `https://www.linkedin.com/feed/update/${urn}`;
                
                console.log(`AUTO-FOLLOW: Processing ${i + 1}/${toProcess.length}: ${urn}`);

                // Open in background tab
                const followTabId = await browser.openTab(postUrl, false);
                if (!followTabId) {
                    console.error('AUTO-FOLLOW: Failed to open tab');
                    continue;
                }

                await new Promise(resolve => setTimeout(resolve, 3000));

                // Click follow button
                const result = await chrome.scripting.executeScript({
                    target: { tabId: followTabId },
                    func: () => {
                        const followBtn = document.querySelector('button.follow');
                        if (followBtn && !followBtn.textContent.includes('Following')) {
                            followBtn.click();
                            return { success: true };
                        }
                        return { success: false, reason: 'Follow button not found or already following' };
                    }
                });

                await new Promise(resolve => setTimeout(resolve, 1500));
                chrome.tabs.remove(followTabId);

                if (result && result[0].result.success) {
                    followed++;
                    await this.incrementAction('follows');
                    await backgroundStatistics.recordFollow('Unknown');
                    console.log(`AUTO-FOLLOW: Successfully followed author ${i + 1}/${toProcess.length}`);
                } else {
                    console.log(`AUTO-FOLLOW: Failed to follow: ${result?.[0]?.result?.reason || 'Unknown'}`);
                }

                await randomDelay(5000, 10000);
            } catch (error) {
                console.error('AUTO-FOLLOW: Error:', error);
            }
        }

        console.log(`AUTO-FOLLOW: Complete! Followed ${followed} out of ${toProcess.length} authors`);
        return { followed, total: toProcess.length };
    }

    /**
     * Follow next author (injected function)
     */
    followNextAuthor() {
        const posts = document.querySelectorAll('div[data-urn]');
        
        for (const post of posts) {
            const followButton = post.querySelector('button[aria-label*="Follow"]');
            if (followButton && !followButton.classList.contains('artdeco-button--tertiary')) {
                followButton.click();
                const authorElement = post.querySelector('span.update-components-actor__name');
                const userId = authorElement ? authorElement.textContent : 'unknown';
                return { success: true, userId };
            }
        }
        
        return { success: false };
    }

    /**
     * Auto-send connection requests with personalized message
     */
    async autoConnectWithMessage(profiles, message) {
        console.log('Starting auto-connect automation...');
        let sent = 0;

        for (const profileUrl of profiles) {
            if (!await this.canPerformAction('connectionRequests')) {
                console.log('Daily connection request limit reached');
                break;
            }

            try {
                const tabId = await browser.openTab(profileUrl, false);
                if (!tabId) continue;

                await new Promise(resolve => setTimeout(resolve, 3000));

                const result = await chrome.scripting.executeScript({
                    target: { tabId },
                    func: this.sendConnectionRequest,
                    args: [message]
                });

                chrome.tabs.remove(tabId);

                if (result && result[0].result) {
                    sent++;
                    await this.incrementAction('connectionRequests');
                    // Connection request tracking (not implemented yet)
                    console.log(`Sent connection request ${sent}`);
                }

                await randomDelay(15000, 30000); // Longer delay for connection requests
            } catch (error) {
                console.error('Error in auto-connect:', error);
            }
        }

        return { sent, total: profiles.length };
    }

    /**
     * Send connection request (injected function)
     */
    sendConnectionRequest(message) {
        const connectButton = document.querySelector('button[aria-label*="Connect"]');
        if (!connectButton) return { success: false };

        connectButton.click();

        setTimeout(() => {
            const addNoteButton = document.querySelector('button[aria-label="Add a note"]');
            if (addNoteButton && message) {
                addNoteButton.click();

                setTimeout(() => {
                    const textarea = document.querySelector('textarea[name="message"]');
                    if (textarea) {
                        textarea.value = message;
                        textarea.dispatchEvent(new Event('input', { bubbles: true }));

                        setTimeout(() => {
                            const sendButton = document.querySelector('button[aria-label="Send now"]');
                            if (sendButton) {
                                sendButton.click();
                            }
                        }, 500);
                    }
                }, 500);
            } else {
                const sendButton = document.querySelector('button[aria-label="Send now"]');
                if (sendButton) {
                    sendButton.click();
                }
            }
        }, 1000);

        return { success: true };
    }

    /**
     * Auto-endorse skills on profiles
     */
    async autoEndorseSkills(profileUrls, skillsPerProfile = 3) {
        console.log('Starting auto-endorse automation...');
        let endorsed = 0;

        for (const profileUrl of profileUrls) {
            try {
                const tabId = await browser.openTab(profileUrl, false);
                if (!tabId) continue;

                await new Promise(resolve => setTimeout(resolve, 3000));

                const result = await chrome.scripting.executeScript({
                    target: { tabId },
                    func: this.endorseSkills,
                    args: [skillsPerProfile]
                });

                chrome.tabs.remove(tabId);

                if (result && result[0].result) {
                    endorsed += result[0].result.endorsed;
                    console.log(`Endorsed ${result[0].result.endorsed} skills`);
                }

                await randomDelay(10000, 20000);
            } catch (error) {
                console.error('Error in auto-endorse:', error);
            }
        }

        return { endorsed };
    }

    /**
     * Endorse skills (injected function)
     */
    endorseSkills(count) {
        const skillButtons = document.querySelectorAll('button[aria-label*="Endorse"]');
        let endorsed = 0;

        for (let i = 0; i < Math.min(count, skillButtons.length); i++) {
            skillButtons[i].click();
            endorsed++;
        }

        return { success: true, endorsed };
    }

    /**
     * Get daily activity summary
     */
    async getDailyActivitySummary() {
        await this.resetCountsDaily();
        return {
            counts: this.currentCounts,
            limits: this.dailyLimits,
            percentages: {
                likes: (this.currentCounts.likes / this.dailyLimits.likes * 100).toFixed(1),
                comments: (this.currentCounts.comments / this.dailyLimits.comments * 100).toFixed(1),
                shares: (this.currentCounts.shares / this.dailyLimits.shares * 100).toFixed(1),
                follows: (this.currentCounts.follows / this.dailyLimits.follows * 100).toFixed(1),
                connectionRequests: (this.currentCounts.connectionRequests / this.dailyLimits.connectionRequests * 100).toFixed(1)
            }
        };
    }

    /**
     * Update daily limits
     */
    async updateDailyLimits(newLimits) {
        this.dailyLimits = { ...this.dailyLimits, ...newLimits };
        await storage.setObject('dailyLimits', this.dailyLimits);
    }

    /**
     * Get recommended daily limits based on account age
     */
    getRecommendedLimits(accountAgeMonths) {
        if (accountAgeMonths < 3) {
            return {
                likes: 50,
                comments: 25,
                shares: 10,
                follows: 25,
                connectionRequests: 10,
                profileViews: 50
            };
        } else if (accountAgeMonths < 12) {
            return {
                likes: 100,
                comments: 50,
                shares: 20,
                follows: 50,
                connectionRequests: 20,
                profileViews: 100
            };
        } else {
            return {
                likes: 150,
                comments: 75,
                shares: 30,
                follows: 75,
                connectionRequests: 30,
                profileViews: 150
            };
        }
    }
}

export const advancedAutomation = new AdvancedAutomation();
