/**
 * TRENDING CONTENT GENERATOR
 * Scrapes trending topics from LinkedIn and generates engaging posts
 * Uses LinkedIn News sidebar, trending hashtags, and external sources
 */

import { storage } from '../shared/storage/storage.background.js';
import { browser } from '../shared/utils/browser.js';
import { generatePostWithOpenAI } from '../shared/utils/openaiConfig.js';
import { postToLinkedIn } from './automationExecutor.js';
import { backgroundStatistics } from './statisticsManager.js';

class TrendingContentGenerator {
    constructor() {
        this.trendingTopics = [];
        this.lastScrapedDate = null;
        this.dailyPostSettings = {
            enabled: false,
            postTime: '09:00', // Default 9 AM
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    }

    /**
     * Scrape trending topics from LinkedIn News sidebar
     * Injected function that runs in page context
     */
    scrapeTrendingFromNews() {
        try {
            const topics = [];
            
            // Target the LinkedIn News module
            const newsModules = document.querySelectorAll('.news-module, aside.right-rail .feed-news-module');
            
            newsModules.forEach(module => {
                const items = module.querySelectorAll('.news-module__item, .feed-news-module__item');
                
                items.forEach(item => {
                    // Get headline
                    const headlineEl = item.querySelector('.news-module__headline, .feed-news-module__headline');
                    const headline = headlineEl ? headlineEl.textContent.trim() : null;
                    
                    // Get reader count (validation metric)
                    const metadataEl = item.querySelector('.news-module__metadata, .feed-news-module__metadata');
                    const metadata = metadataEl ? metadataEl.textContent.trim() : '';
                    
                    // Extract reader count number
                    const readerMatch = metadata.match(/([\d,]+)\s*(readers?|hours?|days?)/i);
                    const readerCount = readerMatch ? parseInt(readerMatch[1].replace(/,/g, '')) : 0;
                    
                    if (headline) {
                        topics.push({
                            headline,
                            readerCount,
                            source: 'linkedin_news',
                            scrapedAt: new Date().toISOString()
                        });
                    }
                });
            });
            
            return {
                success: true,
                topics,
                count: topics.length
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                topics: []
            };
        }
    }

    /**
     * Scrape trending hashtags from LinkedIn
     * Injected function that runs in page context
     */
    scrapeTrendingHashtags() {
        try {
            const hashtags = [];
            
            // Look for trending hashtags section
            const hashtagElements = document.querySelectorAll(
                '.social-details-trending-hashtags a, ' +
                '[data-id="trending-hashtags"] a, ' +
                '.trending-hashtag'
            );
            
            hashtagElements.forEach(el => {
                const hashtagText = el.textContent.trim();
                const hashtagMatch = hashtagText.match(/#(\w+)/);
                
                if (hashtagMatch) {
                    hashtags.push({
                        hashtag: hashtagMatch[0],
                        name: hashtagMatch[1],
                        source: 'linkedin_hashtags',
                        scrapedAt: new Date().toISOString()
                    });
                }
            });
            
            return {
                success: true,
                hashtags,
                count: hashtags.length
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                hashtags: []
            };
        }
    }

    /**
     * Scrape all trending topics from LinkedIn
     * Opens LinkedIn feed and extracts trending content
     */
    async scrapeTrendingTopics(minReaderCount = 5000) {
        console.log('TRENDING: Scraping trending topics...');
        
        // Open LinkedIn feed
        const feedTabId = await browser.openTab('https://www.linkedin.com/feed/', false);
        if (!feedTabId) {
            console.error('TRENDING: Failed to open LinkedIn feed');
            return { success: false, topics: [] };
        }

        // Wait for page to load
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Scroll to make sure news module loads
        await chrome.scripting.executeScript({
            target: { tabId: feedTabId },
            func: () => {
                window.scrollTo(0, 500);
            }
        });

        await new Promise(resolve => setTimeout(resolve, 2000));

        // Scrape news topics
        const newsResult = await chrome.scripting.executeScript({
            target: { tabId: feedTabId },
            func: this.scrapeTrendingFromNews
        });

        const newsTopics = newsResult[0].result.topics || [];
        console.log(`TRENDING: Found ${newsTopics.length} news topics`);

        // Scrape trending hashtags
        const hashtagResult = await chrome.scripting.executeScript({
            target: { tabId: feedTabId },
            func: this.scrapeTrendingHashtags
        });

        const hashtags = hashtagResult[0].result.hashtags || [];
        console.log(`TRENDING: Found ${hashtags.length} trending hashtags`);

        // Close tab
        chrome.tabs.remove(feedTabId);

        // Filter topics by reader count
        const filteredTopics = newsTopics.filter(topic => topic.readerCount >= minReaderCount);
        console.log(`TRENDING: ${filteredTopics.length} topics meet reader threshold (${minReaderCount}+)`);

        // Combine and save
        this.trendingTopics = filteredTopics;
        this.lastScrapedDate = new Date().toISOString();

        await storage.setObject('trendingTopics', {
            topics: this.trendingTopics,
            hashtags: hashtags,
            scrapedAt: this.lastScrapedDate
        });

        return {
            success: true,
            topics: filteredTopics,
            hashtags: hashtags,
            count: filteredTopics.length
        };
    }

    /**
     * Get a random trending topic for content generation
     */
    async getRandomTrendingTopic() {
        // Check if we need to refresh trending topics
        const today = new Date().toDateString();
        const lastScraped = this.lastScrapedDate ? new Date(this.lastScrapedDate).toDateString() : null;

        if (!lastScraped || lastScraped !== today || this.trendingTopics.length === 0) {
            console.log('TRENDING: Refreshing trending topics...');
            await this.scrapeTrendingTopics();
        }

        if (this.trendingTopics.length === 0) {
            // Fallback topics if scraping failed
            const fallbackTopics = [
                { headline: 'The Future of Remote Work', source: 'fallback' },
                { headline: 'AI in Business', source: 'fallback' },
                { headline: 'Leadership Skills', source: 'fallback' },
                { headline: 'Professional Development', source: 'fallback' },
                { headline: 'Innovation and Technology', source: 'fallback' }
            ];
            return fallbackTopics[Math.floor(Math.random() * fallbackTopics.length)];
        }

        // Return random topic
        const randomIndex = Math.floor(Math.random() * this.trendingTopics.length);
        return this.trendingTopics[randomIndex];
    }

    /**
     * Generate post content based on trending topic using LLM
     * @param {object} topic - Trending topic object
     * @param {object} options - Generation options
     */
    async generateTrendingPost(topic, options = {}) {
        console.log('TRENDING: Generating post for:', topic.headline);

        const template = options.template || 'insight';
        const tone = options.tone || 'professional';
        const includeHashtags = options.includeHashtags !== false;

        // Build enhanced prompt for trending content
        const enhancedTopic = `${topic.headline} (Currently trending on LinkedIn${topic.readerCount ? ` with ${topic.readerCount}+ readers` : ''})`;

        try {
            // Generate post using OpenAI
            let post = await generatePostWithOpenAI(
                enhancedTopic,
                template,
                tone,
                options.useCheapModel || false
            );

            // Add relevant hashtags if enabled
            if (includeHashtags) {
                const hashtagsData = await storage.getObject('trendingTopics');
                const availableHashtags = hashtagsData?.hashtags || [];
                
                // Pick 2-3 relevant hashtags
                const selectedHashtags = availableHashtags
                    .slice(0, 3)
                    .map(h => h.hashtag)
                    .join(' ');
                
                if (selectedHashtags) {
                    post = `${post}\n\n${selectedHashtags}`;
                }
            }

            console.log('TRENDING: Post generated successfully');
            return {
                success: true,
                content: post,
                topic: topic.headline,
                source: topic.source
            };
        } catch (error) {
            console.error('TRENDING: Error generating post:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Generate and publish a trending post
     * Complete pipeline from topic selection to posting
     */
    async generateAndPublishTrendingPost(options = {}) {
        console.log('TRENDING: Starting auto-post generation...');

        try {
            // Step 1: Get trending topic
            const topic = await this.getRandomTrendingTopic();
            console.log('TRENDING: Selected topic:', topic.headline);

            // Step 2: Generate post content
            const postResult = await this.generateTrendingPost(topic, options);
            
            if (!postResult.success) {
                throw new Error(`Failed to generate post: ${postResult.error}`);
            }

            console.log('TRENDING: Post content ready');

            // Step 3: Publish to LinkedIn
            const feedTabId = await browser.openTab('https://www.linkedin.com/feed/', false);
            if (!feedTabId) {
                throw new Error('Failed to open LinkedIn feed');
            }

            await new Promise(resolve => setTimeout(resolve, 4000));

            const publishResult = await chrome.scripting.executeScript({
                target: { tabId: feedTabId },
                func: postToLinkedIn,
                args: [postResult.content]
            });

            await new Promise(resolve => setTimeout(resolve, 5000));
            chrome.tabs.remove(feedTabId);

            if (publishResult && publishResult[0].result) {
                // Record statistics
                await backgroundStatistics.recordPost(postResult.content, {
                    topic: topic.headline,
                    source: topic.source,
                    automated: true
                });

                console.log('TRENDING: Post published successfully!');
                return {
                    success: true,
                    topic: topic.headline,
                    content: postResult.content
                };
            } else {
                throw new Error('Failed to publish post');
            }
        } catch (error) {
            console.error('TRENDING: Error in auto-post:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Schedule daily trending post using Chrome Alarms API
     * @param {string} time - Time in HH:MM format (24-hour)
     */
    async scheduleDailyPost(time = '09:00', options = {}) {
        console.log('TRENDING: Scheduling daily post for', time);

        this.dailyPostSettings = {
            enabled: true,
            postTime: time,
            ...options
        };

        await storage.setObject('dailyPostSettings', this.dailyPostSettings);

        // Calculate next run time
        const [hours, minutes] = time.split(':').map(Number);
        const now = new Date();
        const scheduledTime = new Date();
        scheduledTime.setHours(hours, minutes, 0, 0);

        // If time has passed today, schedule for tomorrow
        if (scheduledTime <= now) {
            scheduledTime.setDate(scheduledTime.getDate() + 1);
        }

        const delayInMinutes = (scheduledTime - now) / 60000;

        // Create alarm using Chrome Alarms API
        await chrome.alarms.create('dailyTrendingPost', {
            delayInMinutes: delayInMinutes,
            periodInMinutes: 24 * 60 // Repeat every 24 hours
        });

        console.log(`TRENDING: Daily post scheduled for ${scheduledTime.toLocaleString()}`);
        
        return {
            success: true,
            nextRun: scheduledTime.toISOString(),
            settings: this.dailyPostSettings
        };
    }

    /**
     * Cancel daily post schedule
     */
    async cancelDailyPost() {
        await chrome.alarms.clear('dailyTrendingPost');
        this.dailyPostSettings.enabled = false;
        await storage.setObject('dailyPostSettings', this.dailyPostSettings);
        
        console.log('TRENDING: Daily post schedule cancelled');
        return { success: true };
    }

    /**
     * Handle alarm trigger
     * This should be called from the background script's alarm listener
     */
    async handleAlarmTrigger(alarm) {
        if (alarm.name === 'dailyTrendingPost') {
            console.log('TRENDING: Daily post alarm triggered');
            
            // Check if still enabled
            const settings = await storage.getObject('dailyPostSettings');
            if (!settings || !settings.enabled) {
                console.log('TRENDING: Daily posts disabled, skipping');
                return;
            }

            // Generate and publish post
            await this.generateAndPublishTrendingPost(settings);

            // Queue next post if browser was closed
            // The alarm will handle periodic execution
        }
    }

    /**
     * Get daily post status
     */
    async getDailyPostStatus() {
        const settings = await storage.getObject('dailyPostSettings');
        const alarms = await chrome.alarms.getAll();
        const dailyAlarm = alarms.find(a => a.name === 'dailyTrendingPost');

        return {
            enabled: settings?.enabled || false,
            postTime: settings?.postTime || '09:00',
            nextRun: dailyAlarm ? new Date(dailyAlarm.scheduledTime).toISOString() : null,
            alarmActive: !!dailyAlarm
        };
    }
}

export const trendingContentGenerator = new TrendingContentGenerator();
