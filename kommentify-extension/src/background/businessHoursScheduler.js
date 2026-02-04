/**
 * Business Hours Scheduler - SAF-004
 * Restricts automation to 9:00 AM – 6:00 PM in user's local timezone
 * Mimics behavior of working professional to avoid bot detection
 */

import { storage } from '../shared/storage/storage.background.js';
import { FeatureChecker } from '../shared/utils/featureChecker.js';

const featureChecker = new FeatureChecker();

export class BusinessHoursScheduler {
    constructor() {
        this.defaultBusinessHours = {
            enabled: true,
            startHour: 9,    // 9:00 AM
            endHour: 18,     // 6:00 PM (18:00)
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            workDays: [1, 2, 3, 4, 5], // Monday to Friday (0 = Sunday, 6 = Saturday)
            allowWeekends: false
        };
        
        this.dailySchedule = {
            enabled: false,
            keywords: [],
            quota: 20,
            qualification: { minLikes: 100, minComments: 100 },
            actions: { like: true, comment: true, share: false, follow: false },
            delaySettings: { accountType: 'matured', commentDelay: 180 }
        };
        
        this.init();
    }

    async init() {
        // Load settings from storage
        const settings = await storage.getObject('businessHoursSettings');
        if (settings) {
            this.defaultBusinessHours = { ...this.defaultBusinessHours, ...settings };
        }
        
        const schedule = await storage.getObject('dailyBulkSchedule');
        if (schedule) {
            this.dailySchedule = { ...this.dailySchedule, ...schedule };
        }
        
        // Set up daily check alarm
        this.setupDailyAlarm();
        
        console.log('BUSINESS HOURS: Scheduler initialized');
        console.log('BUSINESS HOURS: Settings:', this.defaultBusinessHours);
        console.log('DAILY SCHEDULE: Settings:', this.dailySchedule);
    }

    /**
     * Check if current time is within business hours
     */
    isWithinBusinessHours() {
        if (!this.defaultBusinessHours.enabled) {
            return true; // Business hours restriction disabled
        }

        const now = new Date();
        const currentHour = now.getHours();
        const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
        
        // Check if it's a work day
        if (!this.defaultBusinessHours.allowWeekends && !this.defaultBusinessHours.workDays.includes(currentDay)) {
            console.log('BUSINESS HOURS: Outside work days (weekend)');
            return false;
        }
        
        // Check if it's within business hours
        const withinHours = currentHour >= this.defaultBusinessHours.startHour && 
                           currentHour < this.defaultBusinessHours.endHour;
        
        if (!withinHours) {
            console.log(`BUSINESS HOURS: Outside business hours (${currentHour}:00 not between ${this.defaultBusinessHours.startHour}:00-${this.defaultBusinessHours.endHour}:00)`);
        }
        
        return withinHours;
    }

    /**
     * Get next business hour start time
     */
    getNextBusinessHourStart() {
        const now = new Date();
        let nextStart = new Date(now);
        
        // If we're in weekend and weekends not allowed, move to Monday
        if (!this.defaultBusinessHours.allowWeekends) {
            const currentDay = now.getDay();
            if (currentDay === 0) { // Sunday
                nextStart.setDate(now.getDate() + 1); // Monday
            } else if (currentDay === 6) { // Saturday
                nextStart.setDate(now.getDate() + 2); // Monday
            } else if (now.getHours() >= this.defaultBusinessHours.endHour) {
                // After business hours on weekday, move to next day
                nextStart.setDate(now.getDate() + 1);
                // If next day is Saturday, move to Monday
                if (nextStart.getDay() === 6) {
                    nextStart.setDate(nextStart.getDate() + 2);
                }
            }
        }
        
        // Set to business hour start time
        nextStart.setHours(this.defaultBusinessHours.startHour, 0, 0, 0);
        
        return nextStart;
    }

    /**
     * Calculate delay until next business hours
     */
    getDelayUntilBusinessHours() {
        if (this.isWithinBusinessHours()) {
            return 0; // No delay needed
        }
        
        const nextStart = this.getNextBusinessHourStart();
        const now = new Date();
        const delay = nextStart.getTime() - now.getTime();
        
        console.log(`BUSINESS HOURS: Next business hours start at ${nextStart.toLocaleString()}`);
        console.log(`BUSINESS HOURS: Delay needed: ${Math.round(delay / 1000 / 60)} minutes`);
        
        return Math.max(0, delay);
    }

    /**
     * Execute function only during business hours
     */
    async executeInBusinessHours(fn, context = 'automation') {
        if (!this.isWithinBusinessHours()) {
            const delay = this.getDelayUntilBusinessHours();
            
            console.log(`BUSINESS HOURS: ${context} scheduled for next business hours`);
            
            // Schedule for next business hours
            setTimeout(async () => {
                if (this.isWithinBusinessHours()) {
                    await fn();
                } else {
                    // Recursive call if still outside business hours
                    await this.executeInBusinessHours(fn, context);
                }
            }, delay);
            
            return false; // Not executed immediately
        }
        
        console.log(`BUSINESS HOURS: ${context} executing within business hours`);
        await fn();
        return true; // Executed immediately
    }

    /**
     * Setup daily alarm for bulk processing
     */
    async setupDailyAlarm() {
        try {
            // Clear existing alarm
            await chrome.alarms.clear('dailyBulkProcessing');
            
            if (this.dailySchedule.enabled && this.dailySchedule.keywords.length > 0) {
                // Create alarm for next business day at start hour
                const nextRun = this.getNextBusinessHourStart();
                
                await chrome.alarms.create('dailyBulkProcessing', {
                    when: nextRun.getTime(),
                    periodInMinutes: 24 * 60 // Repeat daily
                });
                
                console.log(`DAILY SCHEDULE: Next bulk processing scheduled for ${nextRun.toLocaleString()}`);
            }
        } catch (error) {
            console.error('BUSINESS HOURS: Error setting up daily alarm:', error);
        }
    }

    /**
     * Handle daily bulk processing alarm
     */
    async handleDailyAlarm() {
        if (!this.dailySchedule.enabled) {
            console.log('DAILY SCHEDULE: Daily processing disabled');
            return;
        }

        // CHECK AUTOMATION FEATURE
        const canUseAutomation = await featureChecker.checkFeature('autoLike');
        if (!canUseAutomation) {
            console.warn('🚫 DAILY SCHEDULE: General Automation feature not available in current plan');
            console.log('DAILY SCHEDULE: Daily processing blocked - feature disabled');
            return;
        }

        if (!this.isWithinBusinessHours()) {
            console.log('DAILY SCHEDULE: Outside business hours, rescheduling...');
            // Reschedule for next business hours
            const delay = this.getDelayUntilBusinessHours();
            setTimeout(() => this.handleDailyAlarm(), delay);
            return;
        }

        console.log('DAILY SCHEDULE: Starting daily bulk processing...');
        console.log('DAILY SCHEDULE: Keywords:', this.dailySchedule.keywords);
        console.log('DAILY SCHEDULE: Quota:', this.dailySchedule.quota);

        try {
            // Trigger bulk processing with saved settings
            const message = {
                action: 'bulkProcessKeywords',
                keywords: this.dailySchedule.keywords,
                quota: this.dailySchedule.quota,
                qualification: this.dailySchedule.qualification,
                actions: this.dailySchedule.actions,
                delaySettings: this.dailySchedule.delaySettings,
                source: 'dailySchedule'
            };

            // Send message to background script (self)
            chrome.runtime.sendMessage(message);
            
            // Record daily execution
            await this.recordDailyExecution();
            
        } catch (error) {
            console.error('DAILY SCHEDULE: Error executing daily processing:', error);
        }
    }

    /**
     * Update business hours settings
     */
    async updateBusinessHours(settings) {
        this.defaultBusinessHours = { ...this.defaultBusinessHours, ...settings };
        await storage.setObject('businessHoursSettings', this.defaultBusinessHours);
        console.log('BUSINESS HOURS: Settings updated:', this.defaultBusinessHours);
    }

    /**
     * Update daily schedule settings
     */
    async updateDailySchedule(schedule) {
        this.dailySchedule = { ...this.dailySchedule, ...schedule };
        await storage.setObject('dailyBulkSchedule', this.dailySchedule);
        
        // Restart alarm with new settings
        await this.setupDailyAlarm();
        
        console.log('DAILY SCHEDULE: Settings updated:', this.dailySchedule);
    }

    /**
     * Record daily execution for analytics
     */
    async recordDailyExecution() {
        try {
            const today = new Date().toISOString().split('T')[0];
            const executions = await storage.getObject('dailyExecutions') || {};
            
            if (!executions[today]) {
                executions[today] = [];
            }
            
            executions[today].push({
                timestamp: new Date().toISOString(),
                keywords: this.dailySchedule.keywords.length,
                quota: this.dailySchedule.quota,
                actions: this.dailySchedule.actions
            });
            
            // Keep only last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];
            
            Object.keys(executions).forEach(date => {
                if (date < cutoffDate) {
                    delete executions[date];
                }
            });
            
            await storage.setObject('dailyExecutions', executions);
            console.log('DAILY SCHEDULE: Execution recorded for', today);
            
        } catch (error) {
            console.error('DAILY SCHEDULE: Error recording execution:', error);
        }
    }

    /**
     * Get business hours status for UI
     */
    getStatus() {
        const isWithinHours = this.isWithinBusinessHours();
        const nextStart = isWithinHours ? null : this.getNextBusinessHourStart();
        
        return {
            enabled: this.defaultBusinessHours.enabled,
            withinBusinessHours: isWithinHours,
            currentHour: new Date().getHours(),
            businessStart: this.defaultBusinessHours.startHour,
            businessEnd: this.defaultBusinessHours.endHour,
            nextBusinessHours: nextStart?.toLocaleString(),
            dailyScheduleEnabled: this.dailySchedule.enabled,
            dailyKeywords: this.dailySchedule.keywords.length,
            timezone: this.defaultBusinessHours.timezone
        };
    }

    /**
     * Get daily execution history for analytics
     */
    async getDailyExecutionHistory(days = 7) {
        try {
            const executions = await storage.getObject('dailyExecutions') || {};
            const history = [];
            
            for (let i = days - 1; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                
                history.push({
                    date: dateStr,
                    executions: executions[dateStr] || [],
                    count: executions[dateStr]?.length || 0
                });
            }
            
            return history;
        } catch (error) {
            console.error('BUSINESS HOURS: Error getting execution history:', error);
            return [];
        }
    }
}

// Create singleton instance
export const businessHoursScheduler = new BusinessHoursScheduler();
