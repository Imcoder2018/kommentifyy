/**
 * IMPORT PROFILE SCHEDULER
 * Handles scheduled execution of import profile automation at multiple times per day
 * Works in background service worker - runs even when popup is closed
 */

import { storage } from '../shared/storage/storage.background.js';
import { importAutomation } from './importAutomation.js';

class ImportScheduler {
    constructor() {
        this.schedules = [];
        this.enabled = false;
        this.profilesPerDay = 20;
        this.nextExecutionAlarm = 'import-schedule-execution';
        this.initialize();
    }

    /**
     * Initialize scheduler and load saved schedules
     */
    async initialize() {
        console.log('IMPORT SCHEDULER: Initializing...');
        
        // Clear any stale alarms from previous sessions
        await chrome.alarms.clear(this.nextExecutionAlarm);
        console.log('IMPORT SCHEDULER: Cleared any existing alarms');
        
        // Load saved schedules from storage
        await this.loadSchedules();
        
        // Set up next execution
        await this.scheduleNextExecution();
        
        // Listen for alarm events
        chrome.alarms.onAlarm.addListener((alarm) => {
            if (alarm.name === this.nextExecutionAlarm) {
                console.log('IMPORT SCHEDULER: ⏰ Alarm triggered!');
                this.executeScheduledImport();
            }
        });
        
        console.log('IMPORT SCHEDULER: Initialized with', this.schedules.length, 'schedules, enabled:', this.enabled);
    }

    /**
     * Load schedules from storage
     */
    async loadSchedules() {
        const result = await chrome.storage.local.get(['importSchedules', 'importSchedulerEnabled', 'importProfilesPerDay']);
        this.schedules = result.importSchedules || [];
        this.enabled = result.importSchedulerEnabled || false;
        this.profilesPerDay = result.importProfilesPerDay || 20;
        
        // Sort schedules by time
        this.schedules.sort();
        
        console.log('IMPORT SCHEDULER: Loaded settings', {
            enabled: this.enabled,
            schedules: this.schedules.length,
            profilesPerDay: this.profilesPerDay
        });
        
        return { enabled: this.enabled, schedules: this.schedules, profilesPerDay: this.profilesPerDay };
    }

    /**
     * Save schedules to storage
     */
    async saveSchedules() {
        await chrome.storage.local.set({
            importSchedules: this.schedules,
            importSchedulerEnabled: this.enabled,
            importProfilesPerDay: this.profilesPerDay
        });
        console.log('IMPORT SCHEDULER: Saved schedules');
    }

    /**
     * Add a new schedule time with options
     * @param {string} time - Time in HH:MM format
     * @param {object} options - Automation options for this schedule
     */
    async addSchedule(time, options = {}) {
        if (!time || !/^\d{2}:\d{2}$/.test(time)) {
            return { success: false, error: 'Invalid time format. Use HH:MM' };
        }
        
        // Check if schedule with this time already exists
        const existingIndex = this.schedules.findIndex(s => 
            typeof s === 'string' ? s === time : s.time === time
        );
        if (existingIndex !== -1) {
            return { success: false, error: 'Schedule already exists for this time' };
        }
        
        // Create schedule object with time and options
        const scheduleObj = {
            time: time,
            options: {
                sendConnections: options.sendConnections ?? false,
                extractContactInfo: options.extractContactInfo ?? false,
                postsPerProfile: options.postsPerProfile ?? 2,
                randomMode: options.randomMode ?? false,
                actions: {
                    like: options.actions?.like ?? false,
                    comment: options.actions?.comment ?? false,
                    follow: options.actions?.follow ?? false,
                    share: options.actions?.share ?? false
                }
            },
            createdAt: Date.now()
        };
        
        this.schedules.push(scheduleObj);
        // Sort by time
        this.schedules.sort((a, b) => {
            const timeA = typeof a === 'string' ? a : a.time;
            const timeB = typeof b === 'string' ? b : b.time;
            return timeA.localeCompare(timeB);
        });
        
        await this.saveSchedules();
        await this.scheduleNextExecution();
        
        console.log('IMPORT SCHEDULER: Added schedule:', time, 'with options:', scheduleObj.options);
        return { success: true, message: `Schedule added for ${time}`, schedule: scheduleObj };
    }

    /**
     * Remove a schedule by time
     * @param {string} time - Time to remove
     */
    async removeSchedule(time) {
        // Handle both old string format and new object format
        const index = this.schedules.findIndex(s => 
            typeof s === 'string' ? s === time : s.time === time
        );
        if (index > -1) {
            this.schedules.splice(index, 1);
            await this.saveSchedules();
            await this.scheduleNextExecution();
            console.log('IMPORT SCHEDULER: Removed schedule:', time);
            return { success: true, message: `Schedule removed for ${time}` };
        }
        return { success: false, error: 'Schedule not found' };
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
            console.log('IMPORT SCHEDULER: Disabled - alarm cleared');
        }
        
        return { success: true, enabled: this.enabled };
    }

    /**
     * Update profiles per day setting
     * @param {number} count - Number of profiles to process per day
     */
    async setProfilesPerDay(count) {
        this.profilesPerDay = Math.max(1, Math.min(100, count));
        await this.saveSchedules();
        console.log('IMPORT SCHEDULER: Profiles per day set to:', this.profilesPerDay);
        return { success: true, profilesPerDay: this.profilesPerDay };
    }

    /**
     * Get next scheduled time info
     */
    getNextSchedule() {
        if (!this.enabled || this.schedules.length === 0) {
            console.log('IMPORT SCHEDULER: getNextSchedule - disabled or no schedules');
            return null;
        }
        
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        
        // Helper to get time string from schedule (handles both string and object)
        const getTimeStr = (schedule) => typeof schedule === 'string' ? schedule : schedule.time;
        const getOptions = (schedule) => typeof schedule === 'string' ? null : schedule.options;
        
        // Find the next schedule after current time
        for (const schedule of this.schedules) {
            const timeStr = getTimeStr(schedule);
            const [hours, minutes] = timeStr.split(':').map(Number);
            const scheduleMinutes = hours * 60 + minutes;
            
            if (scheduleMinutes > currentMinutes) {
                // This schedule is later today
                const nextExecution = new Date(now);
                nextExecution.setHours(hours, minutes, 0, 0);
                return { time: timeStr, nextExecution, isToday: true, options: getOptions(schedule), schedule };
            }
        }
        
        // All schedules are past for today, return the first one for tomorrow
        if (this.schedules.length > 0) {
            const firstSchedule = this.schedules[0];
            const timeStr = getTimeStr(firstSchedule);
            const [hours, minutes] = timeStr.split(':').map(Number);
            const nextExecution = new Date(now);
            nextExecution.setDate(nextExecution.getDate() + 1);
            nextExecution.setHours(hours, minutes, 0, 0);
            return { time: timeStr, nextExecution, isToday: false, options: getOptions(firstSchedule), schedule: firstSchedule };
        }
        
        return null;
    }

    /**
     * Schedule the next execution alarm
     */
    async scheduleNextExecution() {
        const next = this.getNextSchedule();
        
        if (!next) {
            console.log('IMPORT SCHEDULER: No schedules to set');
            return;
        }
        
        // Calculate delay in minutes
        const delayMs = next.nextExecution.getTime() - Date.now();
        const delayMinutes = Math.max(0.1, delayMs / (1000 * 60)); // Minimum 6 seconds
        
        // Clear existing alarm and set new one
        await chrome.alarms.clear(this.nextExecutionAlarm);
        await chrome.alarms.create(this.nextExecutionAlarm, {
            delayInMinutes: delayMinutes
        });
        
        console.log(`IMPORT SCHEDULER: ⏰ Next execution scheduled for ${next.time} (${next.isToday ? 'today' : 'tomorrow'}) in ${Math.round(delayMinutes)} minutes`);
    }

    /**
     * Execute the scheduled import automation
     */
    async executeScheduledImport() {
        console.log('IMPORT SCHEDULER: 🚀 Executing scheduled import...');
        
        // Reload settings in case they changed
        await this.loadSchedules();
        
        if (!this.enabled) {
            console.log('IMPORT SCHEDULER: Skipping - scheduler disabled');
            await this.scheduleNextExecution();
            return;
        }
        
        // Find the schedule that just triggered (closest to current time)
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        let executingSchedule = null;
        
        for (const schedule of this.schedules) {
            const timeStr = typeof schedule === 'string' ? schedule : schedule.time;
            const [hours, minutes] = timeStr.split(':').map(Number);
            const scheduleMinutes = hours * 60 + minutes;
            
            // Allow 2 minute window for execution
            if (Math.abs(scheduleMinutes - currentMinutes) <= 2) {
                executingSchedule = schedule;
                break;
            }
        }
        
        // Get schedule-specific options or use defaults
        const scheduleOptions = executingSchedule && typeof executingSchedule === 'object' 
            ? executingSchedule.options 
            : null;
        
        console.log('IMPORT SCHEDULER: Executing schedule:', executingSchedule);
        console.log('IMPORT SCHEDULER: Schedule options:', scheduleOptions);
        
        // Get pending profiles
        const result = await chrome.storage.local.get(['pendingImportProfiles']);
        const allProfiles = result.pendingImportProfiles || [];
        
        if (allProfiles.length === 0) {
            console.log('IMPORT SCHEDULER: ⚠️ No profiles to process');
            await this.scheduleNextExecution();
            return;
        }
        
        // Get only the number of profiles we should process
        const profilesToProcess = allProfiles.slice(0, this.profilesPerDay);
        
        console.log(`IMPORT SCHEDULER: Processing ${profilesToProcess.length} of ${allProfiles.length} profiles`);
        
        // Check if automation is already running
        if (importAutomation.isProcessing) {
            console.log('IMPORT SCHEDULER: ⚠️ Import automation already running, skipping');
            await this.scheduleNextExecution();
            return;
        }
        
        try {
            // Use schedule-specific options if available, otherwise use defaults (all disabled)
            const automationOptions = {
                postsPerProfile: scheduleOptions?.postsPerProfile ?? 2,
                randomMode: scheduleOptions?.randomMode ?? false,
                extractContactInfo: scheduleOptions?.extractContactInfo ?? false,
                sendConnections: scheduleOptions?.sendConnections ?? false,
                actions: scheduleOptions?.actions ?? { like: false, comment: false, follow: false, share: false }
            };
            
            console.log('IMPORT SCHEDULER: Starting combined automation with options:', automationOptions);
            
            // Execute the automation
            const automationResult = await importAutomation.processCombinedAutomation(profilesToProcess, automationOptions);
            
            console.log('IMPORT SCHEDULER: ✅ Automation completed:', automationResult);
            
            // Record today's execution
            await chrome.storage.local.set({
                lastImportScheduleExecution: {
                    timestamp: Date.now(),
                    profilesProcessed: automationResult.profilesProcessed,
                    successful: automationResult.connectionsSuccessful,
                    failed: automationResult.connectionsFailed
                }
            });
            
        } catch (error) {
            console.error('IMPORT SCHEDULER: ❌ Automation failed:', error);
        }
        
        // Schedule next execution
        await this.scheduleNextExecution();
    }

    /**
     * Get current status
     */
    async getStatus() {
        await this.loadSchedules();
        const next = this.getNextSchedule();
        
        const { pendingImportProfiles = [], lastImportScheduleExecution } = await chrome.storage.local.get(['pendingImportProfiles', 'lastImportScheduleExecution']);
        
        return {
            enabled: this.enabled,
            schedules: this.schedules,
            profilesPerDay: this.profilesPerDay,
            pendingProfiles: pendingImportProfiles.length,
            nextExecution: next ? {
                time: next.time,
                timestamp: next.nextExecution.getTime(),
                isToday: next.isToday
            } : null,
            lastExecution: lastImportScheduleExecution || null,
            isProcessing: importAutomation.isProcessing
        };
    }

    /**
     * Force reload schedules from storage
     */
    async reload() {
        await this.loadSchedules();
        await this.scheduleNextExecution();
        return await this.getStatus();
    }
}

// Export singleton instance
export const importScheduler = new ImportScheduler();
