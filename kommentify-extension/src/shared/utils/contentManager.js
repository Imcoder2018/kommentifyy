/**
 * CONTENT MANAGEMENT MODULE
 * Save posts, track competitors, keyword alerts, and content calendar
 */

import { storage } from '../storage/storage.js';

class ContentManager {
    constructor() {
        this.storageKeys = {
            savedPosts: 'savedPosts',
            competitors: 'competitorProfiles',
            keywordAlerts: 'keywordAlerts',
            contentCalendar: 'contentCalendar',
            postTemplates: 'postTemplates',
            blacklist: 'blacklistedUsers',
            whitelist: 'whitelistedUsers'
        };
    }

    /**
     * Save a post for later reference
     */
    async savePost(postData) {
        const saved = await storage.getArray(this.storageKeys.savedPosts, []);
        const post = {
            id: Date.now(),
            postUrn: postData.postUrn,
            author: postData.author,
            content: postData.content,
            url: postData.url,
            savedAt: new Date().toISOString(),
            tags: postData.tags || [],
            notes: postData.notes || ''
        };
        saved.unshift(post);
        
        // Keep only last 500 saved posts
        if (saved.length > 500) {
            saved.length = 500;
        }
        
        await storage.setArray(this.storageKeys.savedPosts, saved);
        return post;
    }

    /**
     * Get all saved posts
     */
    async getSavedPosts(filters = {}) {
        const saved = await storage.getArray(this.storageKeys.savedPosts, []);
        
        if (filters.tag) {
            return saved.filter(post => post.tags.includes(filters.tag));
        }
        
        if (filters.author) {
            return saved.filter(post => post.author === filters.author);
        }
        
        if (filters.searchTerm) {
            const term = filters.searchTerm.toLowerCase();
            return saved.filter(post => 
                post.content.toLowerCase().includes(term) ||
                post.author.toLowerCase().includes(term) ||
                post.notes.toLowerCase().includes(term)
            );
        }
        
        return saved;
    }

    /**
     * Delete saved post
     */
    async deleteSavedPost(postId) {
        const saved = await storage.getArray(this.storageKeys.savedPosts, []);
        const filtered = saved.filter(post => post.id !== postId);
        await storage.setArray(this.storageKeys.savedPosts, filtered);
    }

    /**
     * Update saved post notes/tags
     */
    async updateSavedPost(postId, updates) {
        const saved = await storage.getArray(this.storageKeys.savedPosts, []);
        const post = saved.find(p => p.id === postId);
        if (post) {
            Object.assign(post, updates);
            await storage.setArray(this.storageKeys.savedPosts, saved);
        }
        return post;
    }

    /**
     * Add competitor to track
     */
    async addCompetitor(profileData) {
        const competitors = await storage.getArray(this.storageKeys.competitors, []);
        const competitor = {
            id: Date.now(),
            name: profileData.name,
            profileUrl: profileData.profileUrl,
            industry: profileData.industry || '',
            addedAt: new Date().toISOString(),
            lastChecked: null,
            postFrequency: 0,
            avgEngagement: 0,
            topHashtags: [],
            notes: profileData.notes || ''
        };
        competitors.push(competitor);
        await storage.setArray(this.storageKeys.competitors, competitors);
        return competitor;
    }

    /**
     * Get all competitors
     */
    async getCompetitors() {
        return await storage.getArray(this.storageKeys.competitors, []);
    }

    /**
     * Update competitor data
     */
    async updateCompetitor(competitorId, updates) {
        const competitors = await storage.getArray(this.storageKeys.competitors, []);
        const competitor = competitors.find(c => c.id === competitorId);
        if (competitor) {
            Object.assign(competitor, updates);
            competitor.lastChecked = new Date().toISOString();
            await storage.setArray(this.storageKeys.competitors, competitors);
        }
        return competitor;
    }

    /**
     * Remove competitor
     */
    async removeCompetitor(competitorId) {
        const competitors = await storage.getArray(this.storageKeys.competitors, []);
        const filtered = competitors.filter(c => c.id !== competitorId);
        await storage.setArray(this.storageKeys.competitors, filtered);
    }

    /**
     * Add keyword alert
     */
    async addKeywordAlert(keyword, settings = {}) {
        const alerts = await storage.getArray(this.storageKeys.keywordAlerts, []);
        const alert = {
            id: Date.now(),
            keyword: keyword.toLowerCase(),
            enabled: true,
            notifyOnPost: settings.notifyOnPost !== false,
            notifyOnComment: settings.notifyOnComment || false,
            frequency: settings.frequency || 'realtime', // realtime, hourly, daily
            lastTriggered: null,
            triggerCount: 0,
            createdAt: new Date().toISOString()
        };
        alerts.push(alert);
        await storage.setArray(this.storageKeys.keywordAlerts, alerts);
        return alert;
    }

    /**
     * Get all keyword alerts
     */
    async getKeywordAlerts() {
        return await storage.getArray(this.storageKeys.keywordAlerts, []);
    }

    /**
     * Check if content matches any keyword alerts
     */
    async checkKeywordAlerts(content) {
        const alerts = await storage.getArray(this.storageKeys.keywordAlerts, []);
        const contentLower = content.toLowerCase();
        const matched = [];

        for (const alert of alerts) {
            if (alert.enabled && contentLower.includes(alert.keyword)) {
                alert.lastTriggered = new Date().toISOString();
                alert.triggerCount++;
                matched.push(alert);
            }
        }

        if (matched.length > 0) {
            await storage.setArray(this.storageKeys.keywordAlerts, alerts);
        }

        return matched;
    }

    /**
     * Delete keyword alert
     */
    async deleteKeywordAlert(alertId) {
        const alerts = await storage.getArray(this.storageKeys.keywordAlerts, []);
        const filtered = alerts.filter(a => a.id !== alertId);
        await storage.setArray(this.storageKeys.keywordAlerts, filtered);
    }

    /**
     * Toggle keyword alert
     */
    async toggleKeywordAlert(alertId, enabled) {
        const alerts = await storage.getArray(this.storageKeys.keywordAlerts, []);
        const alert = alerts.find(a => a.id === alertId);
        if (alert) {
            alert.enabled = enabled;
            await storage.setArray(this.storageKeys.keywordAlerts, alerts);
        }
        return alert;
    }

    /**
     * Add event to content calendar
     */
    async addCalendarEvent(eventData) {
        const calendar = await storage.getArray(this.storageKeys.contentCalendar, []);
        const event = {
            id: Date.now(),
            title: eventData.title,
            description: eventData.description || '',
            scheduledDate: eventData.scheduledDate,
            type: eventData.type || 'post', // post, comment, engagement
            status: 'scheduled', // scheduled, published, cancelled
            content: eventData.content || '',
            hashtags: eventData.hashtags || [],
            createdAt: new Date().toISOString(),
            publishedAt: null
        };
        calendar.push(event);
        await storage.setArray(this.storageKeys.contentCalendar, calendar);
        return event;
    }

    /**
     * Get calendar events
     */
    async getCalendarEvents(filters = {}) {
        const calendar = await storage.getArray(this.storageKeys.contentCalendar, []);
        
        if (filters.status) {
            return calendar.filter(event => event.status === filters.status);
        }
        
        if (filters.startDate && filters.endDate) {
            return calendar.filter(event => {
                const eventDate = new Date(event.scheduledDate);
                return eventDate >= new Date(filters.startDate) && 
                       eventDate <= new Date(filters.endDate);
            });
        }
        
        return calendar.sort((a, b) => 
            new Date(a.scheduledDate) - new Date(b.scheduledDate)
        );
    }

    /**
     * Update calendar event
     */
    async updateCalendarEvent(eventId, updates) {
        const calendar = await storage.getArray(this.storageKeys.contentCalendar, []);
        const event = calendar.find(e => e.id === eventId);
        if (event) {
            Object.assign(event, updates);
            await storage.setArray(this.storageKeys.contentCalendar, calendar);
        }
        return event;
    }

    /**
     * Delete calendar event
     */
    async deleteCalendarEvent(eventId) {
        const calendar = await storage.getArray(this.storageKeys.contentCalendar, []);
        const filtered = calendar.filter(e => e.id !== eventId);
        await storage.setArray(this.storageKeys.contentCalendar, filtered);
    }

    /**
     * Save custom post template
     */
    async saveTemplate(templateData) {
        const templates = await storage.getArray(this.storageKeys.postTemplates, []);
        const template = {
            id: Date.now(),
            name: templateData.name,
            content: templateData.content,
            category: templateData.category || 'general',
            hashtags: templateData.hashtags || [],
            createdAt: new Date().toISOString(),
            usageCount: 0
        };
        templates.push(template);
        await storage.setArray(this.storageKeys.postTemplates, templates);
        return template;
    }

    /**
     * Get all templates
     */
    async getTemplates(category = null) {
        const templates = await storage.getArray(this.storageKeys.postTemplates, []);
        if (category) {
            return templates.filter(t => t.category === category);
        }
        return templates;
    }

    /**
     * Use template (increment usage count)
     */
    async useTemplate(templateId) {
        const templates = await storage.getArray(this.storageKeys.postTemplates, []);
        const template = templates.find(t => t.id === templateId);
        if (template) {
            template.usageCount++;
            await storage.setArray(this.storageKeys.postTemplates, templates);
        }
        return template;
    }

    /**
     * Delete template
     */
    async deleteTemplate(templateId) {
        const templates = await storage.getArray(this.storageKeys.postTemplates, []);
        const filtered = templates.filter(t => t.id !== templateId);
        await storage.setArray(this.storageKeys.postTemplates, filtered);
    }

    /**
     * Add user to blacklist
     */
    async addToBlacklist(userId, reason = '') {
        const blacklist = await storage.getArray(this.storageKeys.blacklist, []);
        if (!blacklist.find(u => u.userId === userId)) {
            blacklist.push({
                userId,
                reason,
                addedAt: new Date().toISOString()
            });
            await storage.setArray(this.storageKeys.blacklist, blacklist);
        }
    }

    /**
     * Remove user from blacklist
     */
    async removeFromBlacklist(userId) {
        const blacklist = await storage.getArray(this.storageKeys.blacklist, []);
        const filtered = blacklist.filter(u => u.userId !== userId);
        await storage.setArray(this.storageKeys.blacklist, filtered);
    }

    /**
     * Check if user is blacklisted
     */
    async isBlacklisted(userId) {
        const blacklist = await storage.getArray(this.storageKeys.blacklist, []);
        return blacklist.some(u => u.userId === userId);
    }

    /**
     * Get blacklist
     */
    async getBlacklist() {
        return await storage.getArray(this.storageKeys.blacklist, []);
    }

    /**
     * Add user to whitelist (priority engagement)
     */
    async addToWhitelist(userId, priority = 'normal') {
        const whitelist = await storage.getArray(this.storageKeys.whitelist, []);
        if (!whitelist.find(u => u.userId === userId)) {
            whitelist.push({
                userId,
                priority, // high, normal, low
                addedAt: new Date().toISOString()
            });
            await storage.setArray(this.storageKeys.whitelist, whitelist);
        }
    }

    /**
     * Remove user from whitelist
     */
    async removeFromWhitelist(userId) {
        const whitelist = await storage.getArray(this.storageKeys.whitelist, []);
        const filtered = whitelist.filter(u => u.userId !== userId);
        await storage.setArray(this.storageKeys.whitelist, filtered);
    }

    /**
     * Check if user is whitelisted
     */
    async isWhitelisted(userId) {
        const whitelist = await storage.getArray(this.storageKeys.whitelist, []);
        return whitelist.find(u => u.userId === userId);
    }

    /**
     * Get whitelist
     */
    async getWhitelist() {
        return await storage.getArray(this.storageKeys.whitelist, []);
    }

    /**
     * Export all content data
     */
    async exportAllData() {
        const data = {
            savedPosts: await this.getSavedPosts(),
            competitors: await this.getCompetitors(),
            keywordAlerts: await this.getKeywordAlerts(),
            contentCalendar: await this.getCalendarEvents(),
            templates: await this.getTemplates(),
            blacklist: await this.getBlacklist(),
            whitelist: await this.getWhitelist(),
            exportedAt: new Date().toISOString()
        };
        return JSON.stringify(data, null, 2);
    }

    /**
     * Import content data
     */
    async importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.savedPosts) {
                await storage.setArray(this.storageKeys.savedPosts, data.savedPosts);
            }
            if (data.competitors) {
                await storage.setArray(this.storageKeys.competitors, data.competitors);
            }
            if (data.keywordAlerts) {
                await storage.setArray(this.storageKeys.keywordAlerts, data.keywordAlerts);
            }
            if (data.contentCalendar) {
                await storage.setArray(this.storageKeys.contentCalendar, data.contentCalendar);
            }
            if (data.templates) {
                await storage.setArray(this.storageKeys.postTemplates, data.templates);
            }
            if (data.blacklist) {
                await storage.setArray(this.storageKeys.blacklist, data.blacklist);
            }
            if (data.whitelist) {
                await storage.setArray(this.storageKeys.whitelist, data.whitelist);
            }
            
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

export const contentManager = new ContentManager();
