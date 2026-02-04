/**
 * PEOPLE SEARCH SCHEDULER
 * Automated scheduling for LinkedIn People Search & Connect
 */

import { storage } from '../shared/storage/storage.background.js';
import { peopleSearchAutomation } from './peopleSearchAutomation.js';

class PeopleSearchScheduler {
    constructor() {
        this.schedules = [];
        this.enabled = false;
        this.activeAlarms = new Set();
        this.init();
    }

    async init() {
        await this.loadSettings();
        await this.setupAlarms();
        console.log('PEOPLE SCHEDULER: Initialized');
    }

    /**
     * Load scheduler settings from storage
     */
    async loadSettings() {
        try {
            const settings = await storage.getObject('peopleSearchScheduler', {
                enabled: false,
                schedules: []
            });
            
            this.enabled = settings.enabled;
            this.schedules = settings.schedules || [];
            
            console.log('PEOPLE SCHEDULER: Loaded settings', { 
                enabled: this.enabled, 
                schedules: this.schedules.length 
            });
        } catch (error) {
            console.error('PEOPLE SCHEDULER: Failed to load settings:', error);
        }
    }

    /**
     * Save scheduler settings to storage
     */
    async saveSettings() {
        try {
            await storage.setObject('peopleSearchScheduler', {
                enabled: this.enabled,
                schedules: this.schedules
            });
            console.log('PEOPLE SCHEDULER: Settings saved');
        } catch (error) {
            console.error('PEOPLE SCHEDULER: Failed to save settings:', error);
        }
    }

    /**
     * Add new schedule
     */
    async addSchedule(schedule) {
        try {
            // Validate schedule - require time and either keyword OR searchUrl
            if (!schedule.time) {
                throw new Error('Schedule time is required');
            }
            
            const isUrlMode = schedule.source === 'url';
            if (isUrlMode) {
                if (!schedule.searchUrl) {
                    throw new Error('Search URL is required when using URL mode');
                }
            } else {
                if (!schedule.keyword) {
                    throw new Error('Keyword is required when using keyword mode');
                }
            }
            
            console.log('PEOPLE SCHEDULER: Adding schedule with source:', schedule.source || 'keyword');

            // Check for duplicate time
            const existingIndex = this.schedules.findIndex(s => s.time === schedule.time);
            if (existingIndex >= 0) {
                // Update existing schedule
                this.schedules[existingIndex] = { ...schedule };
                console.log('PEOPLE SCHEDULER: Updated existing schedule at', schedule.time);
            } else {
                // Add new schedule
                this.schedules.push({ ...schedule });
                console.log('PEOPLE SCHEDULER: Added new schedule at', schedule.time);
            }

            await this.saveSettings();
            await this.setupAlarms();
            
            return { success: true };
        } catch (error) {
            console.error('PEOPLE SCHEDULER: Failed to add schedule:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Remove schedule by index
     */
    async removeSchedule(index) {
        try {
            if (index >= 0 && index < this.schedules.length) {
                const removed = this.schedules.splice(index, 1)[0];
                console.log('PEOPLE SCHEDULER: Removed schedule at', removed.time);
                
                await this.saveSettings();
                await this.setupAlarms();
                
                return { success: true };
            } else {
                throw new Error('Invalid schedule index');
            }
        } catch (error) {
            console.error('PEOPLE SCHEDULER: Failed to remove schedule:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Enable/disable scheduler
     */
    async setEnabled(enabled) {
        try {
            this.enabled = enabled;
            await this.saveSettings();
            
            if (enabled) {
                await this.setupAlarms();
                console.log('PEOPLE SCHEDULER: Enabled');
            } else {
                await this.clearAllAlarms();
                console.log('PEOPLE SCHEDULER: Disabled');
            }
            
            return { success: true };
        } catch (error) {
            console.error('PEOPLE SCHEDULER: Failed to set enabled state:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Setup Chrome alarms for all schedules
     */
    async setupAlarms() {
        if (!this.enabled || this.schedules.length === 0) {
            await this.clearAllAlarms();
            return;
        }

        try {
            // Clear existing alarms
            await this.clearAllAlarms();

            const now = new Date();
            
            for (const schedule of this.schedules) {
                const alarmName = `peopleSearch_${schedule.time}`;
                
                // Parse time (HH:MM format)
                const [hours, minutes] = schedule.time.split(':').map(Number);
                
                // Create alarm time for today
                const alarmTime = new Date();
                alarmTime.setHours(hours, minutes, 0, 0);
                
                // If time has passed today, schedule for tomorrow
                if (alarmTime <= now) {
                    alarmTime.setDate(alarmTime.getDate() + 1);
                }
                
                // Create Chrome alarm
                await chrome.alarms.create(alarmName, {
                    when: alarmTime.getTime(),
                    periodInMinutes: 24 * 60 // Repeat daily
                });
                
                this.activeAlarms.add(alarmName);
                
                console.log(`PEOPLE SCHEDULER: Created alarm "${alarmName}" for ${alarmTime.toLocaleString()}`);
            }
        } catch (error) {
            console.error('PEOPLE SCHEDULER: Failed to setup alarms:', error);
        }
    }

    /**
     * Clear all Chrome alarms
     */
    async clearAllAlarms() {
        try {
            for (const alarmName of this.activeAlarms) {
                await chrome.alarms.clear(alarmName);
                console.log('PEOPLE SCHEDULER: Cleared alarm', alarmName);
            }
            this.activeAlarms.clear();
        } catch (error) {
            console.error('PEOPLE SCHEDULER: Failed to clear alarms:', error);
        }
    }

    /**
     * Handle alarm trigger
     */
    async handleAlarm(alarmName) {
        if (!alarmName.startsWith('peopleSearch_')) return false;
        
        if (!this.enabled) {
            console.log('PEOPLE SCHEDULER: Alarm triggered but scheduler is disabled');
            return true;
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
                    console.log(`PEOPLE SCHEDULER: Skipping - Day ${currentDay} not in active days`);
                    await this.notifyOutsideBusinessHours(businessHoursSettings);
                    return true;
                }
                
                if (currentHour < startHour || currentHour >= endHour) {
                    console.log(`PEOPLE SCHEDULER: Skipping - Hour ${currentHour} outside business hours (${startHour}-${endHour})`);
                    await this.notifyOutsideBusinessHours(businessHoursSettings);
                    return true;
                }
            }
            
            // Extract time from alarm name
            const time = alarmName.replace('peopleSearch_', '');
            
            // Find matching schedule
            const schedule = this.schedules.find(s => s.time === time);
            if (!schedule) {
                console.error('PEOPLE SCHEDULER: No schedule found for time', time);
                return true;
            }

            console.log('PEOPLE SCHEDULER: Executing scheduled people search at', time);
            console.log('PEOPLE SCHEDULER: Schedule details:', schedule);

            // Prepare options for people search
            const options = {
                useBooleanLogic: schedule.useBooleanLogic,
                filterNetwork: schedule.filterNetwork,
                excludeHeadlineTerms: schedule.excludeHeadlineTerms,
                connectionMessage: schedule.connectionMessage,
                extractContactInfo: schedule.extractContactInfo,
                sendWithNote: schedule.sendWithNote,
                sendConnectionRequest: schedule.sendConnectionRequest
            };

            // Determine source type (URL or keyword)
            const source = schedule.source || 'keyword';
            const searchUrl = schedule.searchUrl || '';
            const keyword = schedule.keyword || '';
            
            console.log('PEOPLE SCHEDULER: Source:', source);
            console.log('PEOPLE SCHEDULER: URL:', searchUrl || 'N/A');
            console.log('PEOPLE SCHEDULER: Keyword:', keyword || 'N/A');

            // Execute people search with source and URL support
            const result = await peopleSearchAutomation.searchAndConnect(
                keyword,
                schedule.quota,
                options,
                schedule.connectionMessage,
                source,  // 'keyword' or 'url'
                searchUrl
            );

            console.log('PEOPLE SCHEDULER: Execution completed:', result);

            // Send notification
            const searchDesc = source === 'url' ? 'URL search' : `"${keyword}"`;
            if (chrome.notifications) {
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: '/icons/icon48.png',
                    title: 'People Search Completed',
                    message: `Scheduled ${searchDesc} completed. Connected: ${result.connected}/${result.target}`
                });
            }

            return true;
        } catch (error) {
            console.error('PEOPLE SCHEDULER: Execution failed:', error);
            
            // Send error notification
            if (chrome.notifications) {
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: '/icons/icon48.png',
                    title: 'People Search Failed',
                    message: `Scheduled search failed: ${error.message}`
                });
            }
            
            return true;
        }
    }

    /**
     * Get scheduler status for UI
     */
    async getStatus() {
        const nextExecution = this.getNextExecution();
        
        return {
            enabled: this.enabled,
            schedules: this.schedules,
            nextExecution,
            activeAlarms: Array.from(this.activeAlarms)
        };
    }

    /**
     * Get next execution time
     */
    getNextExecution() {
        if (!this.enabled || this.schedules.length === 0) {
            return null;
        }

        const now = new Date();
        let nextExecution = null;
        let minTimeDiff = Infinity;

        for (const schedule of this.schedules) {
            const [hours, minutes] = schedule.time.split(':').map(Number);
            
            // Create execution time for today
            const execTime = new Date();
            execTime.setHours(hours, minutes, 0, 0);
            
            // If time has passed today, check tomorrow
            if (execTime <= now) {
                execTime.setDate(execTime.getDate() + 1);
            }
            
            const timeDiff = execTime.getTime() - now.getTime();
            
            if (timeDiff < minTimeDiff) {
                minTimeDiff = timeDiff;
                nextExecution = {
                    time: schedule.time,
                    keyword: schedule.keyword,
                    date: execTime.toISOString(),
                    timeUntil: timeDiff
                };
            }
        }

        return nextExecution;
    }

    /**
     * Get countdown string for next execution
     */
    getCountdown() {
        const nextExecution = this.getNextExecution();
        if (!nextExecution) {
            return '--:--:--';
        }

        const timeUntil = nextExecution.timeUntil;
        const hours = Math.floor(timeUntil / (1000 * 60 * 60));
        const minutes = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeUntil % (1000 * 60)) / 1000);

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
                chrome.notifications.create('people-scheduler-business-hours-' + Date.now(), {
                    type: 'basic',
                    iconUrl: '/icons/icon48.png',
                    title: '⏰ Outside Business Hours',
                    message: `Networking scheduled tasks will run during: ${startHour}:00-${endHour}:00 on ${activeDays}`,
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
            console.error('PEOPLE SCHEDULER: Failed to notify outside business hours:', error);
        }
    }
}

// Create and export instance
export const peopleSearchScheduler = new PeopleSearchScheduler();
