/**
 * STATISTICS TRACKING MODULE
 * Tracks all user engagement activities and provides analytics
 */

import { storage } from './storage.js';

class StatisticsManager {
    constructor() {
        this.statsKey = 'engagementStatistics';
    }

    /**
     * Initialize statistics structure if not exists
     */
    async initializeStats() {
        const stats = await storage.getObject(this.statsKey);
        if (!stats || !stats.initialized) {
            const initialStats = {
                initialized: true,
                totalComments: 0,
                totalLikes: 0,
                totalShares: 0,
                totalFollows: 0,
                totalConnectionRequests: 0,
                totalPosts: 0,
                dailyStats: {},
                weeklyStats: {},
                monthlyStats: {},
                engagementsByHour: Array(24).fill(0),
                engagementsByDay: Array(7).fill(0),
                topHashtags: {},
                topEngagedUsers: {},
                responseRates: {
                    comments: { sent: 0, replied: 0 },
                    connectionRequests: { sent: 0, accepted: 0 }
                },
                automationHistory: [],
                postsCreated: [],
                savedPosts: [],
                lastUpdated: new Date().toISOString()
            };
            await storage.setObject(this.statsKey, initialStats);
            return initialStats;
        }
        return stats;
    }

    /**
     * Get current date key (YYYY-MM-DD)
     */
    getDateKey() {
        const now = new Date();
        return now.toISOString().split('T')[0];
    }

    /**
     * Get week key (YYYY-WW)
     */
    getWeekKey() {
        const now = new Date();
        const onejan = new Date(now.getFullYear(), 0, 1);
        const week = Math.ceil((((now - onejan) / 86400000) + onejan.getDay() + 1) / 7);
        return `${now.getFullYear()}-W${week.toString().padStart(2, '0')}`;
    }

    /**
     * Get month key (YYYY-MM)
     */
    getMonthKey() {
        const now = new Date();
        return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    }

    /**
     * Record a comment engagement
     */
    async recordComment(postUrn, postAuthor, hashtags = [], isAutomation = false) {
        const stats = await this.initializeStats();
        const dateKey = this.getDateKey();
        const weekKey = this.getWeekKey();
        const monthKey = this.getMonthKey();
        const hour = new Date().getHours();
        const day = new Date().getDay();

        stats.totalComments++;
        stats.engagementsByHour[hour]++;
        stats.engagementsByDay[day]++;

        // Daily stats
        if (!stats.dailyStats[dateKey]) {
            stats.dailyStats[dateKey] = { comments: 0, likes: 0, shares: 0, follows: 0, posts: 0 };
        }
        stats.dailyStats[dateKey].comments++;

        // Weekly stats
        if (!stats.weeklyStats[weekKey]) {
            stats.weeklyStats[weekKey] = { comments: 0, likes: 0, shares: 0, follows: 0, posts: 0 };
        }
        stats.weeklyStats[weekKey].comments++;

        // Monthly stats
        if (!stats.monthlyStats[monthKey]) {
            stats.monthlyStats[monthKey] = { comments: 0, likes: 0, shares: 0, follows: 0, posts: 0 };
        }
        stats.monthlyStats[monthKey].comments++;

        // Track hashtags
        hashtags.forEach(tag => {
            stats.topHashtags[tag] = (stats.topHashtags[tag] || 0) + 1;
        });

        // Track engaged users
        if (postAuthor) {
            stats.topEngagedUsers[postAuthor] = (stats.topEngagedUsers[postAuthor] || 0) + 1;
        }

        // Automation history
        if (isAutomation) {
            stats.automationHistory.push({
                type: 'comment',
                postUrn,
                timestamp: new Date().toISOString()
            });
            // Keep only last 1000 entries
            if (stats.automationHistory.length > 1000) {
                stats.automationHistory = stats.automationHistory.slice(-1000);
            }
        }

        stats.responseRates.comments.sent++;
        stats.lastUpdated = new Date().toISOString();
        await storage.setObject(this.statsKey, stats);
    }

    /**
     * Record a like engagement
     */
    async recordLike(postUrn, isAutomation = false) {
        const stats = await this.initializeStats();
        const dateKey = this.getDateKey();
        const weekKey = this.getWeekKey();
        const monthKey = this.getMonthKey();

        stats.totalLikes++;
        
        if (!stats.dailyStats[dateKey]) {
            stats.dailyStats[dateKey] = { comments: 0, likes: 0, shares: 0, follows: 0, posts: 0 };
        }
        stats.dailyStats[dateKey].likes++;

        if (!stats.weeklyStats[weekKey]) {
            stats.weeklyStats[weekKey] = { comments: 0, likes: 0, shares: 0, follows: 0, posts: 0 };
        }
        stats.weeklyStats[weekKey].likes++;

        if (!stats.monthlyStats[monthKey]) {
            stats.monthlyStats[monthKey] = { comments: 0, likes: 0, shares: 0, follows: 0, posts: 0 };
        }
        stats.monthlyStats[monthKey].likes++;

        if (isAutomation) {
            stats.automationHistory.push({
                type: 'like',
                postUrn,
                timestamp: new Date().toISOString()
            });
            if (stats.automationHistory.length > 1000) {
                stats.automationHistory = stats.automationHistory.slice(-1000);
            }
        }

        stats.lastUpdated = new Date().toISOString();
        await storage.setObject(this.statsKey, stats);
    }

    /**
     * Record a share/repost
     */
    async recordShare(postUrn) {
        const stats = await this.initializeStats();
        const dateKey = this.getDateKey();
        const weekKey = this.getWeekKey();
        const monthKey = this.getMonthKey();

        stats.totalShares++;
        
        if (!stats.dailyStats[dateKey]) {
            stats.dailyStats[dateKey] = { comments: 0, likes: 0, shares: 0, follows: 0, posts: 0 };
        }
        stats.dailyStats[dateKey].shares++;

        if (!stats.weeklyStats[weekKey]) {
            stats.weeklyStats[weekKey] = { comments: 0, likes: 0, shares: 0, follows: 0, posts: 0 };
        }
        stats.weeklyStats[weekKey].shares++;

        if (!stats.monthlyStats[monthKey]) {
            stats.monthlyStats[monthKey] = { comments: 0, likes: 0, shares: 0, follows: 0, posts: 0 };
        }
        stats.monthlyStats[monthKey].shares++;

        stats.lastUpdated = new Date().toISOString();
        await storage.setObject(this.statsKey, stats);
    }

    /**
     * Record a follow action
     */
    async recordFollow(userId) {
        const stats = await this.initializeStats();
        const dateKey = this.getDateKey();
        const weekKey = this.getWeekKey();
        const monthKey = this.getMonthKey();

        stats.totalFollows++;
        
        if (!stats.dailyStats[dateKey]) {
            stats.dailyStats[dateKey] = { comments: 0, likes: 0, shares: 0, follows: 0, posts: 0 };
        }
        stats.dailyStats[dateKey].follows++;

        if (!stats.weeklyStats[weekKey]) {
            stats.weeklyStats[weekKey] = { comments: 0, likes: 0, shares: 0, follows: 0, posts: 0 };
        }
        stats.weeklyStats[weekKey].follows++;

        if (!stats.monthlyStats[monthKey]) {
            stats.monthlyStats[monthKey] = { comments: 0, likes: 0, shares: 0, follows: 0, posts: 0 };
        }
        stats.monthlyStats[monthKey].follows++;

        stats.lastUpdated = new Date().toISOString();
        await storage.setObject(this.statsKey, stats);
    }

    /**
     * Record a connection request
     */
    async recordConnectionRequest(userId) {
        const stats = await this.initializeStats();
        stats.totalConnectionRequests++;
        stats.responseRates.connectionRequests.sent++;
        stats.lastUpdated = new Date().toISOString();
        await storage.setObject(this.statsKey, stats);
    }

    /**
     * Record a post creation
     */
    async recordPost(postContent, hashtags = []) {
        const stats = await this.initializeStats();
        const dateKey = this.getDateKey();
        const weekKey = this.getWeekKey();
        const monthKey = this.getMonthKey();

        stats.totalPosts++;
        
        if (!stats.dailyStats[dateKey]) {
            stats.dailyStats[dateKey] = { comments: 0, likes: 0, shares: 0, follows: 0, posts: 0 };
        }
        stats.dailyStats[dateKey].posts++;

        if (!stats.weeklyStats[weekKey]) {
            stats.weeklyStats[weekKey] = { comments: 0, likes: 0, shares: 0, follows: 0, posts: 0 };
        }
        stats.weeklyStats[weekKey].posts++;

        if (!stats.monthlyStats[monthKey]) {
            stats.monthlyStats[monthKey] = { comments: 0, likes: 0, shares: 0, follows: 0, posts: 0 };
        }
        stats.monthlyStats[monthKey].posts++;

        stats.postsCreated.push({
            content: postContent.substring(0, 100),
            hashtags,
            timestamp: new Date().toISOString()
        });

        // Keep only last 100 posts
        if (stats.postsCreated.length > 100) {
            stats.postsCreated = stats.postsCreated.slice(-100);
        }

        stats.lastUpdated = new Date().toISOString();
        await storage.setObject(this.statsKey, stats);
    }

    /**
     * Save a post for later
     */
    async savePost(postUrn, postContent, postAuthor) {
        const stats = await this.initializeStats();
        stats.savedPosts.push({
            postUrn,
            content: postContent.substring(0, 200),
            author: postAuthor,
            savedAt: new Date().toISOString()
        });

        // Keep only last 200 saved posts
        if (stats.savedPosts.length > 200) {
            stats.savedPosts = stats.savedPosts.slice(-200);
        }

        stats.lastUpdated = new Date().toISOString();
        await storage.setObject(this.statsKey, stats);
    }

    /**
     * Get all statistics
     */
    async getStats() {
        return await this.initializeStats();
    }

    /**
     * Get daily statistics for last N days
     */
    async getDailyStats(days = 30) {
        const stats = await this.initializeStats();
        const result = [];
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            result.push({
                date: dateKey,
                ...(stats.dailyStats[dateKey] || { comments: 0, likes: 0, shares: 0, follows: 0, posts: 0 })
            });
        }
        
        return result;
    }

    /**
     * Get top hashtags
     */
    async getTopHashtags(limit = 10) {
        const stats = await this.initializeStats();
        return Object.entries(stats.topHashtags)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([tag, count]) => ({ tag, count }));
    }

    /**
     * Get top engaged users
     */
    async getTopEngagedUsers(limit = 10) {
        const stats = await this.initializeStats();
        return Object.entries(stats.topEngagedUsers)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([user, count]) => ({ user, count }));
    }

    /**
     * Get engagement by time of day
     */
    async getEngagementByHour() {
        const stats = await this.initializeStats();
        return stats.engagementsByHour.map((count, hour) => ({ hour, count }));
    }

    /**
     * Get engagement by day of week
     */
    async getEngagementByDay() {
        const stats = await this.initializeStats();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return stats.engagementsByDay.map((count, index) => ({ day: days[index], count }));
    }

    /**
     * Clear all statistics
     */
    async clearStats() {
        await storage.remove(this.statsKey);
        return await this.initializeStats();
    }

    /**
     * Export statistics as JSON
     */
    async exportStats() {
        const stats = await this.getStats();
        return JSON.stringify(stats, null, 2);
    }
}

export const statisticsManager = new StatisticsManager();
