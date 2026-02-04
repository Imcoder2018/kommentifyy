/**
 * BULK PROCESSING SCHEDULER
 * Handles scheduled execution of bulk keyword processing at multiple times per day
 */

import { storage } from '../shared/storage/storage.background.js';
import { executeBulkProcessing } from './bulkProcessingExecutor.js';
import { FeatureChecker } from '../shared/utils/featureChecker.js';

const featureChecker = new FeatureChecker();

class BulkScheduler {
    constructor() {
        this.schedules = [];
        this.nextExecutionAlarm = 'bulk-schedule-execution';
        this.countdownInterval = null;
        this.initialize();
    }

    /**
     * Initialize scheduler and load saved schedules
     */
    async initialize() {
        console.log('BULK SCHEDULER: Initializing...');
        
        // Clear any stale alarms from previous sessions
        await chrome.alarms.clear(this.nextExecutionAlarm);
        console.log('BULK SCHEDULER: Cleared any existing alarms');
        
        // Load saved schedules from storage
        await this.loadSchedules();
        
        // Set up next execution
        await this.scheduleNextExecution();
        
        // Listen for alarm events
        chrome.alarms.onAlarm.addListener((alarm) => {
            if (alarm.name === this.nextExecutionAlarm) {
                this.executeScheduledBulkProcessing();
            }
        });
        
        console.log('BULK SCHEDULER: Initialized with', this.schedules.length, 'schedules');
    }

    /**
     * Load schedules from storage
     */
    async loadSchedules() {
        const saved = await storage.getObject('bulkSchedules', { enabled: false, times: [], settings: null });
        this.schedules = saved.times || [];
        this.enabled = saved.enabled || false;
        this.settings = saved.settings || null;
        
        // Migrate legacy schedules - ensure all have source field
        let needsSave = false;
        this.schedules = this.schedules.map(schedule => {
            if (!schedule.source) {
                needsSave = true;
                console.log('BULK SCHEDULER: Migrating legacy schedule:', schedule.time, '-> setting source to keywords');
                return { ...schedule, source: 'keywords' };
            }
            return schedule;
        });
        
        // Save migrated schedules if changes were made
        if (needsSave) {
            await this.saveSchedules();
            console.log('BULK SCHEDULER: Migrated legacy schedules saved');
        }
        
        // Sort schedules by time after loading
        this.schedules.sort((a, b) => a.time.localeCompare(b.time));
        
        console.log('BULK SCHEDULER: Loaded schedules:', this.schedules);
        console.log('BULK SCHEDULER: First schedule after sort:', this.schedules[0]?.time, 'source:', this.schedules[0]?.source);
        return saved;
    }

    /**
     * Save schedules to storage
     */
    async saveSchedules() {
        await storage.setObject('bulkSchedules', {
            enabled: this.enabled,
            times: this.schedules,
            settings: this.settings
        });
        console.log('BULK SCHEDULER: Saved schedules');
    }

    /**
     * Add a new schedule with full settings
     * @param {Object} schedule - Schedule object with time and settings
     */
    async addSchedule(schedule) {
        // Debug: log full schedule object
        console.log('BULK SCHEDULER: Received schedule to add:', JSON.stringify(schedule, null, 2));
        console.log('BULK SCHEDULER: Schedule source:', schedule.source);
        
        // Check if schedule with this time already exists
        const existingIndex = this.schedules.findIndex(s => s.time === schedule.time);
        
        if (existingIndex >= 0) {
            // Update existing schedule
            this.schedules[existingIndex] = schedule;
            console.log('BULK SCHEDULER: Updated existing schedule:', schedule.time, 'with source:', schedule.source);
        } else {
            // Add new schedule
            this.schedules.push(schedule);
            console.log('BULK SCHEDULER: Added new schedule:', schedule.time, 'with source:', schedule.source);
        }
        
        // Sort schedules by time
        this.schedules.sort((a, b) => a.time.localeCompare(b.time));
        
        await this.saveSchedules();
        await this.scheduleNextExecution();
        
        return { success: true, message: `Schedule ${existingIndex >= 0 ? 'updated' : 'added'} for ${schedule.time}` };
    }

    /**
     * Remove a schedule by index
     * @param {number} index - Index of schedule to remove
     */
    async removeSchedule(index) {
        if (index >= 0 && index < this.schedules.length) {
            const removedSchedule = this.schedules.splice(index, 1)[0];
            await this.saveSchedules();
            await this.scheduleNextExecution();
            console.log('BULK SCHEDULER: Removed schedule:', removedSchedule.time);
            return { success: true, message: `Schedule removed for ${removedSchedule.time}` };
        } else {
            return { success: false, error: 'Invalid schedule index' };
        }
    }

    /**
     * Update bulk processing settings
     * @param {Object} settings - Bulk processing settings
     */
    async updateSettings(settings) {
        this.settings = settings;
        await this.saveSchedules();
        console.log('BULK SCHEDULER: Updated settings');
    }

    /**
     * Enable or disable scheduling
     * @param {boolean} enabled - Whether scheduling is enabled
     */
    async setEnabled(enabled) {
        this.enabled = enabled;
        await this.saveSchedules();
        
        if (enabled) {
            await this.scheduleNextExecution();
        } else {
            await chrome.alarms.clear(this.nextExecutionAlarm);
        }
        
        console.log('BULK SCHEDULER: Enabled:', enabled);
    }

    /**
     * Get next scheduled time
     * @returns {Object|null} Next schedule info
     */
    getNextSchedule() {
        if (!this.enabled || this.schedules.length === 0) {
            console.log('BULK SCHEDULER: getNextSchedule - disabled or no schedules');
            return null;
        }

        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentTime = currentHours * 60 + currentMinutes; // Minutes since midnight
        
        console.log(`BULK SCHEDULER: getNextSchedule - Current time: ${currentHours}:${currentMinutes} (${currentTime} mins)`);
        console.log(`BULK SCHEDULER: getNextSchedule - Schedules count: ${this.schedules.length}`);
        console.log(`BULK SCHEDULER: getNextSchedule - First 3 schedules:`, this.schedules.slice(0, 3).map(s => `${s.time} (${s.source})`));

        // Find next schedule today
        for (const schedule of this.schedules) {
            const [hours, minutes] = schedule.time.split(':').map(Number);
            const scheduleTime = hours * 60 + minutes;
            
            if (scheduleTime > currentTime) {
                console.log(`BULK SCHEDULER: getNextSchedule - Found today: ${schedule.time} (source: ${schedule.source})`);
                const nextExecution = new Date(now);
                nextExecution.setHours(hours, minutes, 0, 0);
                return {
                    time: schedule.time,
                    schedule: schedule,
                    date: nextExecution,
                    timeUntil: scheduleTime - currentTime
                };
            }
        }

        // If no schedule today, get first one tomorrow
        if (this.schedules.length > 0) {
            const firstSchedule = this.schedules[0];
            const [hours, minutes] = firstSchedule.time.split(':').map(Number);
            const nextExecution = new Date(now);
            nextExecution.setDate(nextExecution.getDate() + 1);
            nextExecution.setHours(hours, minutes, 0, 0);
            
            const minutesUntilTomorrow = (24 * 60) - currentTime;
            const minutesAfterMidnight = hours * 60 + minutes;
            
            console.log(`BULK SCHEDULER: getNextSchedule - Tomorrow: ${firstSchedule.time} (source: ${firstSchedule.source})`);
            
            return {
                time: firstSchedule.time,
                schedule: firstSchedule,
                date: nextExecution,
                timeUntil: minutesUntilTomorrow + minutesAfterMidnight
            };
        }

        return null;
    }

    /**
     * Schedule next execution using Chrome alarms
     */
    async scheduleNextExecution() {
        if (!this.enabled) {
            return;
        }

        const next = this.getNextSchedule();
        if (!next) {
            console.log('BULK SCHEDULER: No schedules to set');
            return;
        }

        // Clear existing alarm
        await chrome.alarms.clear(this.nextExecutionAlarm);

        // Create new alarm
        await chrome.alarms.create(this.nextExecutionAlarm, {
            when: next.date.getTime()
        });

        console.log(`BULK SCHEDULER: Next execution scheduled for ${next.time} (${next.date.toLocaleString()})`);
    }

    /**
     * Execute scheduled bulk processing
     */
    async executeScheduledBulkProcessing() {
        console.log('BULK SCHEDULER: Executing scheduled bulk processing');
        
        // Get current time to find matching schedule
        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentTimeStr = `${String(currentHours).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`;
        
        console.log(`BULK SCHEDULER: Current time is ${currentTimeStr}`);
        
        // Find schedule that matches current time (within 2 minute window)
        let currentSchedule = null;
        for (const schedule of this.schedules) {
            const [schedHours, schedMinutes] = schedule.time.split(':').map(Number);
            const schedTimeInMins = schedHours * 60 + schedMinutes;
            const currentTimeInMins = currentHours * 60 + currentMinutes;
            const timeDiff = Math.abs(schedTimeInMins - currentTimeInMins);
            
            // Check if schedule is within 2 minutes of current time
            if (timeDiff <= 2 || timeDiff >= (24 * 60 - 2)) {
                currentSchedule = schedule;
                console.log(`BULK SCHEDULER: Found matching schedule: ${schedule.time} (source: ${schedule.source})`);
                break;
            }
        }
        
        // If no matching schedule found, this might be a stale alarm - reschedule
        if (!currentSchedule) {
            console.warn('BULK SCHEDULER: No schedule matches current time - possible stale alarm, rescheduling');
            await this.scheduleNextExecution();
            return;
        }
        
        console.log('BULK SCHEDULER: Executing schedule:', currentSchedule.time, 'with settings:', currentSchedule);

        // Validate schedule has required data (unless using feed mode)
        const isUsingFeed = currentSchedule.source === 'feed';
        if (!isUsingFeed && (!currentSchedule.keywords || currentSchedule.keywords.length === 0)) {
            console.error('BULK SCHEDULER: Schedule has no keywords configured (and not using feed mode)');
            await this.scheduleNextExecution();
            return;
        }

        try {
            // Check business hours before executing
            const { businessHoursSettings } = await chrome.storage.local.get('businessHoursSettings');
            if (businessHoursSettings?.enabled) {
                const now = new Date();
                const currentHour = now.getHours();
                const currentDay = now.getDay();
                const workDays = businessHoursSettings.workDays || [1, 2, 3, 4, 5];
                const startHour = businessHoursSettings.startHour || 9;
                const endHour = businessHoursSettings.endHour || 18;
                
                if (!workDays.includes(currentDay)) {
                    console.log(`BULK SCHEDULER: Skipping - Day ${currentDay} not in active days`);
                    await this.notifyOutsideBusinessHours(businessHoursSettings);
                    await this.scheduleNextExecution();
                    return;
                }
                
                if (currentHour < startHour || currentHour >= endHour) {
                    console.log(`BULK SCHEDULER: Skipping - Hour ${currentHour} outside business hours (${startHour}-${endHour})`);
                    await this.notifyOutsideBusinessHours(businessHoursSettings);
                    await this.scheduleNextExecution();
                    return;
                }
            }
            
            // ⚠️ STRICT CHECK: Automation Scheduling feature is REQUIRED
            const canScheduleAutomation = await featureChecker.checkFeature('automationScheduling');
            if (!canScheduleAutomation) {
                console.error('🚫 BLOCKED: Automation Scheduling feature not available in current plan');
                console.log('BULK SCHEDULER: Schedule execution blocked - feature disabled');
                await this.scheduleNextExecution();
                return;
            }
            
            // Execute bulk processing directly (no message passing needed)
            console.log('BULK SCHEDULER: Starting bulk processing with settings:', currentSchedule);
            
            // Call executeBulkProcessing directly since we're in the same context
            // Include source from schedule (feed or keywords)
            const response = await executeBulkProcessing({
                source: currentSchedule.source || 'keywords',  // 'feed' or 'keywords'
                keywords: currentSchedule.keywords || [],
                quota: currentSchedule.quota || 20,
                minLikes: currentSchedule.minLikes || 0,
                minComments: currentSchedule.minComments || 0,
                ignoreKeywords: currentSchedule.ignoreKeywords || 'we\'re hiring\nnow hiring\napply now',
                actions: currentSchedule.actions || { like: true, comment: false, share: false, follow: false },
                accountType: currentSchedule.accountType || 'matured',
                commentDelay: currentSchedule.commentDelay || 180,
                schedulerSource: 'scheduler'  // Mark as triggered by scheduler
            });

            console.log('BULK SCHEDULER: Execution completed:', response);

            // Save execution history
            await this.saveExecutionHistory({
                timestamp: new Date().toISOString(),
                success: response?.success || false,
                schedule: currentSchedule
            });

        } catch (error) {
            console.error('BULK SCHEDULER: Execution failed:', error);
            
            // Save failed execution
            await this.saveExecutionHistory({
                timestamp: new Date().toISOString(),
                success: false,
                error: error.message,
                schedule: currentSchedule
            });
        }

        // Schedule next execution
        await this.scheduleNextExecution();
    }

    /**
     * Save execution history
     * @param {Object} execution - Execution details
     */
    async saveExecutionHistory(execution) {
        const history = await storage.getArray('bulkScheduleHistory', []);
        history.unshift(execution); // Add to beginning
        
        // Keep only last 50 executions
        if (history.length > 50) {
            history.splice(50);
        }
        
        await storage.setArray('bulkScheduleHistory', history);
    }

    /**
     * Get execution history
     * @param {number} limit - Max number of records to return
     * @returns {Array} Execution history
     */
    async getExecutionHistory(limit = 10) {
        const history = await storage.getArray('bulkScheduleHistory', []);
        return history.slice(0, limit);
    }

    /**
     * Get scheduler status
     * @returns {Object} Status information
     */
    getStatus() {
        const next = this.getNextSchedule();
        
        return {
            enabled: this.enabled,
            schedules: this.schedules,
            nextExecution: next ? {
                time: next.time,
                date: next.date.toISOString(),
                timeUntilMinutes: next.timeUntil,
                keywords: next.schedule?.keywords || [],
                quota: next.schedule?.quota || 0
            } : null,
            hasSettings: this.schedules.length > 0
        };
    }

    /**
     * Get countdown to next execution (real-time)
     * @returns {string} Formatted countdown string
     */
    getCountdown() {
        const next = this.getNextSchedule();
        if (!next) {
            return 'No schedule set';
        }

        const now = new Date();
        const diff = next.date.getTime() - now.getTime();
        
        if (diff < 0) {
            return 'Starting soon...';
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (hours > 0) {
            return `${hours}h ${minutes}m ${seconds}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        } else {
            return `${seconds}s`;
        }
    }
    
    /**
     * Notify user when scheduled task is outside business hours
     */
    async notifyOutsideBusinessHours(settings) {
        try {
            const startHour = settings?.startHour || 9;
            const endHour = settings?.endHour || 18;
            const workDays = settings?.workDays || [1, 2, 3, 4, 5];
            
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const activeDays = workDays.map(d => dayNames[d]).join(', ');
            
            // Show notification
            if (chrome.notifications) {
                chrome.notifications.create('bulk-scheduler-business-hours-' + Date.now(), {
                    type: 'basic',
                    iconUrl: chrome.runtime.getURL('assets/images/icon128.png'),
                    title: '⏰ Outside Business Hours',
                    message: `Automation scheduled tasks will run during: ${startHour}:00-${endHour}:00 on ${activeDays}`,
                    priority: 1
                });
            }
            
            // Store notification for dashboard display
            await chrome.storage.local.set({
                outsideBusinessHoursNotification: {
                    shown: true,
                    message: `Scheduled tasks paused. Active hours: ${startHour}:00-${endHour}:00 on ${activeDays}`,
                    timestamp: Date.now()
                }
            });
        } catch (error) {
            console.error('BULK SCHEDULER: Failed to notify outside business hours:', error);
        }
    }
}

// Export singleton instance
export const bulkScheduler = new BulkScheduler();
