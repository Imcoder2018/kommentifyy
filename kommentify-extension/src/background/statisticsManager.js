/**
 * BACKGROUND STATISTICS MANAGER
 * Uses chrome.storage.local directly (no window.postMessage bridge)
 * Now integrated with backend API for usage tracking and limit enforcement
 */

const API_CONFIG = {
    BASE_URL: 'https://kommentify.com'
};

class BackgroundStatisticsManager {
    constructor() {
        this.statsKey = 'engagementStatistics';
        this.syncInProgress = false;
        this.lastSyncTime = 0;
        this.syncDebounceMs = 2000; // Wait 2s before syncing to batch updates
    }
    
    /**
     * Sync local stats to backend API
     * Debounced to avoid excessive API calls
     */
    async syncToBackend() {
        // Skip if sync in progress or synced recently
        const now = Date.now();
        if (this.syncInProgress || (now - this.lastSyncTime) < this.syncDebounceMs) {
            console.log('STATS: Skipping sync (debounce)');
            return;
        }
        
        this.syncInProgress = true;
        
        try {
            const storage = await chrome.storage.local.get(['authToken', 'apiBaseUrl', this.statsKey]);
            const token = storage.authToken;
            const apiUrl = storage.apiBaseUrl || API_CONFIG.BASE_URL;
            const localStats = storage[this.statsKey];
            
            if (!token || !localStats || !localStats.dailyStats) {
                console.log('STATS: No token or stats to sync');
                return;
            }
            
            // Get today's stats
            const now = new Date();
            const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            const todayStats = localStats.dailyStats[dateKey] || {};
            
            // Sync to backend
            const response = await fetch(`${apiUrl}/api/usage/sync`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    likes: todayStats.likes || 0,
                    comments: todayStats.comments || 0,
                    shares: todayStats.shares || 0,
                    follows: todayStats.follows || 0,
                    connections: todayStats.connections || 0,
                    aiPosts: todayStats.aiPosts || 0,
                    aiComments: todayStats.aiComments || 0,
                    aiTopicLines: todayStats.aiTopicLines || 0,
                    date: dateKey
                })
            });
            
            if (response.ok) {
                this.lastSyncTime = now;
                console.log('✅ STATS: Synced to backend successfully');
            } else if (response.status !== 405) {
                console.warn('⚠️ STATS: Sync failed:', response.status);
            }
            
        } catch (error) {
            console.error('❌ STATS: Sync error:', error);
        } finally {
            this.syncInProgress = false;
        }
    }

    /**
     * Initialize statistics structure if not exists
     */
    async initializeStats() {
        return new Promise((resolve) => {
            chrome.storage.local.get(this.statsKey, (result) => {
                const stats = result[this.statsKey];
                
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
                    
                    chrome.storage.local.set({ [this.statsKey]: initialStats }, () => {
                        resolve(initialStats);
                    });
                } else {
                    resolve(stats);
                }
            });
        });
    }

    /**
     * Get current date key (YYYY-MM-DD)
     */
    getDateKey() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }

    /**
     * Get current week key (YYYY-WW)
     */
    getWeekKey() {
        const now = new Date();
        const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
        const pastDaysOfYear = (now - firstDayOfYear) / 86400000;
        const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        return `${now.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
    }

    /**
     * Get current month key (YYYY-MM)
     */
    getMonthKey() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    /**
     * Update statistics
     */
    async updateStats(updateFn) {
        return new Promise((resolve) => {
            chrome.storage.local.get(this.statsKey, (result) => {
                let stats = result[this.statsKey] || {};
                
                // Apply update function
                stats = updateFn(stats);
                stats.lastUpdated = new Date().toISOString();
                
                chrome.storage.local.set({ [this.statsKey]: stats }, () => {
                    console.log('STATS: Updated successfully');
                    resolve(stats);
                });
            });
        });
    }

    /**
     * Check usage limit via backend API before performing action
     */
    async checkAndTrackUsage(actionType) {
        try {
            const storage = await chrome.storage.local.get(['authToken', 'apiBaseUrl']);
            const token = storage.authToken;
            const apiUrl = storage.apiBaseUrl || API_CONFIG.BASE_URL;

            if (!token) {
                console.warn('STATS: No auth token, skipping backend tracking');
                return { allowed: true, local: true }; // Allow local tracking only
            }

            // Call backend to track usage and check limits
            const response = await fetch(`${apiUrl}/api/usage/track`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ actionType })
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 429) {
                    // Limit reached
                    console.error(`STATS: Daily ${actionType} limit reached`);
                    return { 
                        allowed: false, 
                        error: data.error || `Daily ${actionType} limit reached`,
                        usage: data.usage,
                        limits: data.limits
                    };
                }
                console.error('STATS: Backend tracking failed:', data.error);
                return { allowed: true, local: true }; // Allow local tracking on error
            }

            console.log(`STATS: Backend tracked ${actionType}, usage:`, data.usage);
            return { 
                allowed: true, 
                usage: data.usage,
                limits: data.limits,
                backend: true
            };

        } catch (error) {
            console.error('STATS: Error checking backend limit:', error);
            return { allowed: true, local: true }; // Allow local tracking on error
        }
    }

    /**
     * Record a like
     */
    async recordLike(postUrn) {
        // Check backend limit first
        const limitCheck = await this.checkAndTrackUsage('like');
        if (!limitCheck.allowed) {
            throw new Error(limitCheck.error || 'Daily like limit reached');
        }

        await this.initializeStats();
        
        const dateKey = this.getDateKey();
        const weekKey = this.getWeekKey();
        const monthKey = this.getMonthKey();
        const hour = new Date().getHours();
        const day = new Date().getDay();

        await this.updateStats((stats) => {
            stats.totalLikes = (stats.totalLikes || 0) + 1;
            
            // Daily stats
            if (!stats.dailyStats) stats.dailyStats = {};
            if (!stats.dailyStats[dateKey]) {
                stats.dailyStats[dateKey] = { likes: 0, comments: 0, shares: 0, follows: 0 };
            }
            stats.dailyStats[dateKey].likes++;
            
            // Weekly stats
            if (!stats.weeklyStats) stats.weeklyStats = {};
            if (!stats.weeklyStats[weekKey]) {
                stats.weeklyStats[weekKey] = { likes: 0, comments: 0, shares: 0, follows: 0 };
            }
            stats.weeklyStats[weekKey].likes++;
            
            // Monthly stats
            if (!stats.monthlyStats) stats.monthlyStats = {};
            if (!stats.monthlyStats[monthKey]) {
                stats.monthlyStats[monthKey] = { likes: 0, comments: 0, shares: 0, follows: 0 };
            }
            stats.monthlyStats[monthKey].likes++;
            
            // Hour/day distribution
            if (!stats.engagementsByHour) stats.engagementsByHour = Array(24).fill(0);
            if (!stats.engagementsByDay) stats.engagementsByDay = Array(7).fill(0);
            stats.engagementsByHour[hour]++;
            stats.engagementsByDay[day]++;
            
            return stats;
        });
        
        console.log('STATS: Recorded like for', postUrn);
        
        // Sync to backend (debounced)
        setTimeout(() => this.syncToBackend(), 100);
    }

    /**
     * Record a comment
     */
    async recordComment(postUrn, commentText, postText = '', authorName = '') {
        // Check backend limit first
        const limitCheck = await this.checkAndTrackUsage('comment');
        if (!limitCheck.allowed) {
            throw new Error(limitCheck.error || 'Daily comment limit reached');
        }

        await this.initializeStats();

        const dateKey = this.getDateKey();
        const weekKey = this.getWeekKey();
        const monthKey = this.getMonthKey();
        const hour = new Date().getHours();
        const day = new Date().getDay();

        await this.updateStats((stats) => {
            stats.totalComments = (stats.totalComments || 0) + 1;

            // Daily stats
            if (!stats.dailyStats) stats.dailyStats = {};
            if (!stats.dailyStats[dateKey]) {
                stats.dailyStats[dateKey] = { likes: 0, comments: 0, shares: 0, follows: 0 };
            }
            stats.dailyStats[dateKey].comments++;

            // Weekly stats
            if (!stats.weeklyStats) stats.weeklyStats = {};
            if (!stats.weeklyStats[weekKey]) {
                stats.weeklyStats[weekKey] = { likes: 0, comments: 0, shares: 0, follows: 0 };
            }
            stats.weeklyStats[weekKey].comments++;

            // Monthly stats
            if (!stats.monthlyStats) stats.monthlyStats = {};
            if (!stats.monthlyStats[monthKey]) {
                stats.monthlyStats[monthKey] = { likes: 0, comments: 0, shares: 0, follows: 0 };
            }
            stats.monthlyStats[monthKey].comments++;

            // Hour/day distribution
            if (!stats.engagementsByHour) stats.engagementsByHour = Array(24).fill(0);
            if (!stats.engagementsByDay) stats.engagementsByDay = Array(7).fill(0);
            stats.engagementsByHour[hour]++;
            stats.engagementsByDay[day]++;

            // Extract and track hashtags from post
            if (postText) {
                const hashtags = postText.match(/#\w+/g) || [];
                if (!stats.topHashtags) stats.topHashtags = {};
                hashtags.forEach(tag => {
                    const normalized = tag.toLowerCase();
                    stats.topHashtags[normalized] = (stats.topHashtags[normalized] || 0) + 1;
                });
            }

            // Track engaged user
            if (authorName) {
                if (!stats.topEngagedUsers) stats.topEngagedUsers = {};
                stats.topEngagedUsers[authorName] = (stats.topEngagedUsers[authorName] || 0) + 1;
            }

            return stats;
        });

        console.log('STATS: Recorded comment for', postUrn);
        
        // Sync to backend (debounced)
        setTimeout(() => this.syncToBackend(), 100);
    }

    /**
     * Record a share
     */
    async recordShare(postUrn) {
        // Check backend limit first
        const limitCheck = await this.checkAndTrackUsage('share');
        if (!limitCheck.allowed) {
            throw new Error(limitCheck.error || 'Daily share limit reached');
        }

        await this.initializeStats();
        
        const dateKey = this.getDateKey();
        const weekKey = this.getWeekKey();
        const monthKey = this.getMonthKey();
        const hour = new Date().getHours();
        const day = new Date().getDay();

        await this.updateStats((stats) => {
            stats.totalShares = (stats.totalShares || 0) + 1;
            
            // Daily stats
            if (!stats.dailyStats) stats.dailyStats = {};
            if (!stats.dailyStats[dateKey]) {
                stats.dailyStats[dateKey] = { likes: 0, comments: 0, shares: 0, follows: 0 };
            }
            stats.dailyStats[dateKey].shares++;
            
            // Weekly stats
            if (!stats.weeklyStats) stats.weeklyStats = {};
            if (!stats.weeklyStats[weekKey]) {
                stats.weeklyStats[weekKey] = { likes: 0, comments: 0, shares: 0, follows: 0 };
            }
            stats.weeklyStats[weekKey].shares++;
            
            // Monthly stats
            if (!stats.monthlyStats) stats.monthlyStats = {};
            if (!stats.monthlyStats[monthKey]) {
                stats.monthlyStats[monthKey] = { likes: 0, comments: 0, shares: 0, follows: 0 };
            }
            stats.monthlyStats[monthKey].shares++;
            
            // Hour/day distribution
            if (!stats.engagementsByHour) stats.engagementsByHour = Array(24).fill(0);
            if (!stats.engagementsByDay) stats.engagementsByDay = Array(7).fill(0);
            stats.engagementsByHour[hour]++;
            stats.engagementsByDay[day]++;
            
            return stats;
        });
        
        console.log('STATS: Recorded share for', postUrn);
        
        // Sync to backend (debounced)
        setTimeout(() => this.syncToBackend(), 100);
    }

    /**
     * Record a follow
     */
    async recordFollow(userId) {
        // Check backend limit first
        const limitCheck = await this.checkAndTrackUsage('follow');
        if (!limitCheck.allowed) {
            throw new Error(limitCheck.error || 'Daily follow limit reached');
        }

        await this.initializeStats();
        
        const dateKey = this.getDateKey();
        const weekKey = this.getWeekKey();
        const monthKey = this.getMonthKey();
        const hour = new Date().getHours();
        const day = new Date().getDay();

        await this.updateStats((stats) => {
            stats.totalFollows = (stats.totalFollows || 0) + 1;
            
            // Daily stats
            if (!stats.dailyStats) stats.dailyStats = {};
            if (!stats.dailyStats[dateKey]) {
                stats.dailyStats[dateKey] = { likes: 0, comments: 0, shares: 0, follows: 0 };
            }
            stats.dailyStats[dateKey].follows++;
            
            // Weekly stats
            if (!stats.weeklyStats) stats.weeklyStats = {};
            if (!stats.weeklyStats[weekKey]) {
                stats.weeklyStats[weekKey] = { likes: 0, comments: 0, shares: 0, follows: 0 };
            }
            stats.weeklyStats[weekKey].follows++;
            
            // Monthly stats
            if (!stats.monthlyStats) stats.monthlyStats = {};
            if (!stats.monthlyStats[monthKey]) {
                stats.monthlyStats[monthKey] = { likes: 0, comments: 0, shares: 0, follows: 0 };
            }
            stats.monthlyStats[monthKey].follows++;
            
            // Hour/day distribution
            if (!stats.engagementsByHour) stats.engagementsByHour = Array(24).fill(0);
            if (!stats.engagementsByDay) stats.engagementsByDay = Array(7).fill(0);
            stats.engagementsByHour[hour]++;
            stats.engagementsByDay[day]++;
            
            return stats;
        });
        
        console.log('STATS: Recorded follow for', userId);
        
        // Sync to backend (debounced)
        setTimeout(() => this.syncToBackend(), 100);
    }

    /**
     * Record a connection request
     */
    async recordConnectionRequest(userName, userHeadline) {
        // Check backend limit first
        const limitCheck = await this.checkAndTrackUsage('connection');
        if (!limitCheck.allowed) {
            throw new Error(limitCheck.error || 'Daily connection limit reached');
        }

        await this.initializeStats();
        
        const dateKey = this.getDateKey();
        const weekKey = this.getWeekKey();
        const monthKey = this.getMonthKey();

        await this.updateStats((stats) => {
            stats.totalConnectionRequests = (stats.totalConnectionRequests || 0) + 1;
            
            // Daily stats
            if (!stats.dailyStats) stats.dailyStats = {};
            if (!stats.dailyStats[dateKey]) {
                stats.dailyStats[dateKey] = { likes: 0, comments: 0, shares: 0, follows: 0, connections: 0 };
            }
            if (!stats.dailyStats[dateKey].connections) stats.dailyStats[dateKey].connections = 0;
            stats.dailyStats[dateKey].connections++;
            
            // Track connection requests for response rate
            if (!stats.responseRates) stats.responseRates = {};
            if (!stats.responseRates.connectionRequests) {
                stats.responseRates.connectionRequests = { sent: 0, accepted: 0 };
            }
            stats.responseRates.connectionRequests.sent++;
            
            // Track connected users
            if (!stats.connectedUsers) stats.connectedUsers = [];
            stats.connectedUsers.push({
                name: userName,
                headline: userHeadline,
                timestamp: new Date().toISOString()
            });
            
            // Keep only last 500 connections
            if (stats.connectedUsers.length > 500) {
                stats.connectedUsers = stats.connectedUsers.slice(-500);
            }
            
            return stats;
        });
        
        console.log('STATS: Recorded connection request to', userName);
        
        // Sync to backend (debounced)
        setTimeout(() => this.syncToBackend(), 100);
    }

    /**
     * Record a post
     */
    async recordPost(postContent, metadata = {}) {
        await this.initializeStats();

        await this.updateStats((stats) => {
            stats.totalPosts = (stats.totalPosts || 0) + 1;
            
            if (!stats.postsCreated) {
                stats.postsCreated = [];
            }
            
            stats.postsCreated.push({
                content: postContent.substring(0, 100),
                timestamp: new Date().toISOString(),
                ...metadata
            });
            
            // Keep only last 100 posts
            if (stats.postsCreated.length > 100) {
                stats.postsCreated = stats.postsCreated.slice(-100);
            }
            
            return stats;
        });
        
        console.log('STATS: Recorded post creation');
    }

    /**
     * Record an AI-generated post
     */
    async recordAiPost(postContent) {
        // Note: AI post limits are checked separately via backend API
        // We don't need to call checkAndTrackUsage here as it's not a direct action
        
        await this.initializeStats();
        
        const dateKey = this.getDateKey();

        await this.updateStats((stats) => {
            // Daily stats
            if (!stats.dailyStats) stats.dailyStats = {};
            if (!stats.dailyStats[dateKey]) {
                stats.dailyStats[dateKey] = { likes: 0, comments: 0, shares: 0, follows: 0, connections: 0, aiPosts: 0, aiComments: 0, aiTopicLines: 0 };
            }
            if (!stats.dailyStats[dateKey].aiPosts) stats.dailyStats[dateKey].aiPosts = 0;
            stats.dailyStats[dateKey].aiPosts++;
            
            return stats;
        });
        
        console.log('STATS: Recorded AI post generation');
        
        // Sync to backend (debounced)
        setTimeout(() => this.syncToBackend(), 100);
    }

    /**
     * Record an AI-generated comment
     */
    async recordAiComment(commentText) {
        // Note: AI comment limits are checked separately via backend API
        // We don't need to call checkAndTrackUsage here as it's not a direct action
        
        await this.initializeStats();
        
        const dateKey = this.getDateKey();

        await this.updateStats((stats) => {
            // Daily stats
            if (!stats.dailyStats) stats.dailyStats = {};
            if (!stats.dailyStats[dateKey]) {
                stats.dailyStats[dateKey] = { likes: 0, comments: 0, shares: 0, follows: 0, connections: 0, aiPosts: 0, aiComments: 0, aiTopicLines: 0 };
            }
            if (!stats.dailyStats[dateKey].aiComments) stats.dailyStats[dateKey].aiComments = 0;
            stats.dailyStats[dateKey].aiComments++;
            
            return stats;
        });
        
        console.log('STATS: Recorded AI comment generation');
        
        // Sync to backend (debounced)
        setTimeout(() => this.syncToBackend(), 100);
    }

    /**
     * Record AI-generated topic lines
     */
    async recordAiTopicLines(count = 1) {
        // Note: AI topic lines limits are checked separately via backend API
        // We don't need to call checkAndTrackUsage here as it's not a direct action
        
        await this.initializeStats();
        
        const dateKey = this.getDateKey();

        await this.updateStats((stats) => {
            // Daily stats
            if (!stats.dailyStats) stats.dailyStats = {};
            if (!stats.dailyStats[dateKey]) {
                stats.dailyStats[dateKey] = { likes: 0, comments: 0, shares: 0, follows: 0, connections: 0, aiPosts: 0, aiComments: 0, aiTopicLines: 0 };
            }
            if (!stats.dailyStats[dateKey].aiTopicLines) stats.dailyStats[dateKey].aiTopicLines = 0;
            stats.dailyStats[dateKey].aiTopicLines += count;
            
            return stats;
        });
        
        console.log('STATS: Recorded AI topic lines generation:', count);
        
        // Sync to backend (debounced)
        setTimeout(() => this.syncToBackend(), 100);
    }

    /**
     * Get progress analytics for dashboard
     */
    async getProgressAnalytics() {
        await this.initializeStats();
        
        const stats = await storage.getObject('engagementStatistics') || {};
        const today = new Date().toISOString().split('T')[0];
        const thisWeek = this.getWeekStart(new Date()).toISOString().split('T')[0];
        
        // Calculate daily progress
        const dailyEngagements = (stats.dailyCounts?.[today] || {});
        const dailyTotal = (dailyEngagements.likes || 0) + 
                          (dailyEngagements.comments || 0) + 
                          (dailyEngagements.shares || 0) + 
                          (dailyEngagements.follows || 0);
        const dailyGoal = 50; // Configurable daily goal
        
        // Calculate weekly progress
        const weeklyTotal = this.calculateWeeklyTotal(stats.dailyCounts || {});
        const weeklyGoal = 300; // Configurable weekly goal
        
        // Calculate business hours compliance
        const businessHoursCompliance = await this.calculateBusinessHoursCompliance();
        
        return {
            daily: {
                current: dailyTotal,
                goal: dailyGoal,
                percentage: Math.min(100, Math.round((dailyTotal / dailyGoal) * 100))
            },
            weekly: {
                current: weeklyTotal,
                goal: weeklyGoal,
                percentage: Math.min(100, Math.round((weeklyTotal / weeklyGoal) * 100))
            },
            businessHours: {
                compliance: businessHoursCompliance,
                percentage: Math.round(businessHoursCompliance)
            }
        };
    }

    /**
     * Calculate weekly total engagements
     */
    calculateWeeklyTotal(dailyCounts) {
        const weekStart = this.getWeekStart(new Date());
        let total = 0;
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            
            const dayData = dailyCounts[dateStr] || {};
            total += (dayData.likes || 0) + 
                    (dayData.comments || 0) + 
                    (dayData.shares || 0) + 
                    (dayData.follows || 0);
        }
        
        return total;
    }

    /**
     * Get start of current week (Monday)
     */
    getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        return new Date(d.setDate(diff));
    }

    /**
     * Calculate business hours compliance percentage
     */
    async calculateBusinessHoursCompliance() {
        try {
            const executions = await storage.getObject('dailyExecutions') || {};
            const businessHoursSettings = await storage.getObject('businessHoursSettings') || {};
            
            if (!businessHoursSettings.enabled) {
                return 100; // If business hours not enabled, consider 100% compliant
            }
            
            const last7Days = this.getLast7Days();
            let totalActions = 0;
            let businessHoursActions = 0;
            
            last7Days.forEach(dateStr => {
                const dayExecutions = executions[dateStr] || [];
                dayExecutions.forEach(execution => {
                    const hour = new Date(execution.timestamp).getHours();
                    totalActions++;
                    
                    if (hour >= businessHoursSettings.startHour && hour < businessHoursSettings.endHour) {
                        businessHoursActions++;
                    }
                });
            });
            
            return totalActions > 0 ? (businessHoursActions / totalActions) * 100 : 100;
        } catch (error) {
            console.error('Error calculating business hours compliance:', error);
            return 85; // Default fallback
        }
    }

    /**
     * Get last 7 days as date strings
     */
    getLast7Days() {
        const dates = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates.push(date.toISOString().split('T')[0]);
        }
        return dates;
    }

    /**
     * Record automation action with timestamp for business hours tracking
     */
    async recordAutomationAction(type, details = {}) {
        try {
            const today = new Date().toISOString().split('T')[0];
            const automationActions = await storage.getObject('automationActions') || {};
            
            if (!automationActions[today]) {
                automationActions[today] = [];
            }
            
            automationActions[today].push({
                type: type,
                timestamp: new Date().toISOString(),
                hour: new Date().getHours(),
                details: details
            });
            
            // Keep only last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];
            
            Object.keys(automationActions).forEach(date => {
                if (date < cutoffDate) {
                    delete automationActions[date];
                }
            });
            
            await storage.setObject('automationActions', automationActions);
        } catch (error) {
            console.error('Error recording automation action:', error);
        }
    }
}

export const backgroundStatistics = new BackgroundStatisticsManager();
