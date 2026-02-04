/**
 * ADD THESE FUNCTIONS AND ELEMENTS TO popup.js
 */

// ==================== ADD TO ELEMENTS OBJECT (around line 44) ====================

// Bulk Scheduler elements
bulkSchedulerEnabled: document.getElementById('bulk-scheduler-enabled'),
scheduleTimeInput: document.getElementById('schedule-time-input'),
addScheduleTime: document.getElementById('add-schedule-time'),
scheduleTimesList: document.getElementById('schedule-times-list'),
schedulerControls: document.getElementById('scheduler-controls'),
nextExecutionTime: document.getElementById('next-execution-time'),
countdownTimer: document.getElementById('countdown-timer'),

// ==================== ADD THESE FUNCTIONS ====================

/**
 * Load bulk scheduler status
 */
async function loadSchedulerStatus() {
    try {
        const response = await chrome.runtime.sendMessage({ 
            action: 'getBulkSchedulerStatus' 
        });
        
        if (response.success) {
            const status = response.status;
            
            // Update toggle
            if (elements.bulkSchedulerEnabled) {
                elements.bulkSchedulerEnabled.checked = status.enabled;
            }
            
            // Show/hide controls
            if (elements.schedulerControls) {
                elements.schedulerControls.style.display = status.enabled ? 'block' : 'none';
            }
            
            // Render schedule times
            renderScheduleTimes(status.schedules);
            
            // Update next execution
            if (status.nextExecution) {
                const date = new Date(status.nextExecution.date);
                const timeStr = `${status.nextExecution.time} (${date.toLocaleDateString()})`;
                elements.nextExecutionTime.textContent = timeStr;
                
                // Start countdown timer
                startCountdownTimer();
            } else {
                elements.nextExecutionTime.textContent = 'Not scheduled';
                elements.countdownTimer.textContent = '--:--:--';
            }
        }
    } catch (error) {
        console.error('Failed to load scheduler status:', error);
    }
}

/**
 * Render schedule times list
 * @param {Array} times - Array of time strings
 */
function renderScheduleTimes(times) {
    if (!elements.scheduleTimesList) return;
    
    if (times.length === 0) {
        elements.scheduleTimesList.innerHTML = '<small style="color: #6c757d;">No schedules set. Add times above.</small>';
        return;
    }
    
    elements.scheduleTimesList.innerHTML = times.map(time => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: #fff; border: 1px solid #dee2e6; border-radius: 4px; margin-bottom: 5px;">
            <span style="font-weight: 500;">⏰ ${time}</span>
            <button class="action-button secondary remove-schedule-btn" data-time="${time}" style="padding: 3px 8px; font-size: 11px;">🗑️ Remove</button>
        </div>
    `).join('');
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-schedule-btn').forEach(btn => {
        btn.addEventListener('click', () => removeScheduleTime(btn.dataset.time));
    });
}

/**
 * Add a schedule time
 */
async function addScheduleTime() {
    const time = elements.scheduleTimeInput.value;
    if (!time) {
        alert('Please select a time');
        return;
    }
    
    try {
        const response = await chrome.runtime.sendMessage({
            action: 'addBulkSchedule',
            time: time
        });
        
        if (response.success) {
            elements.scheduleTimeInput.value = '';
            await loadSchedulerStatus();
            alert(`Schedule added for ${time}`);
        } else {
            alert('Failed to add schedule: ' + (response.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Failed to add schedule:', error);
        alert('Failed to add schedule');
    }
}

/**
 * Remove a schedule time
 * @param {string} time - Time to remove
 */
async function removeScheduleTime(time) {
    if (!confirm(`Remove schedule for ${time}?`)) {
        return;
    }
    
    try {
        const response = await chrome.runtime.sendMessage({
            action: 'removeBulkSchedule',
            time: time
        });
        
        if (response.success) {
            await loadSchedulerStatus();
        }
    } catch (error) {
        console.error('Failed to remove schedule:', error);
    }
}

/**
 * Toggle bulk scheduler enabled/disabled
 */
async function toggleBulkScheduler() {
    const enabled = elements.bulkSchedulerEnabled.checked;
    
    if (enabled) {
        // Save current bulk processing settings
        const keywords = elements.bulkUrls.value.trim().split('\n').filter(k => k.trim());
        
        if (keywords.length === 0) {
            alert('Please add keywords first');
            elements.bulkSchedulerEnabled.checked = false;
            return;
        }
        
        const settings = {
            keywords: keywords,
            quota: parseInt(elements.bulkQuota?.value, 10) || 20,
            qualification: {
                minLikes: parseInt(elements.bulkMinLikes?.value, 10) || 0,
                minComments: parseInt(elements.bulkMinComments?.value, 10) || 0
            },
            actions: {
                like: elements.bulkLike?.checked || false,
                comment: elements.bulkComment?.checked || false,
                share: elements.bulkShare?.checked || false,
                follow: elements.bulkFollow?.checked || false
            },
            delaySettings: {
                accountType: elements.accountType?.value || 'matured',
                commentDelay: parseInt(elements.commentDelay?.value, 10) || 180
            }
        };
        
        // Check at least one action is selected
        if (!settings.actions.like && !settings.actions.comment && !settings.actions.share && !settings.actions.follow) {
            alert('Please select at least one action (Like, Comment, Share, or Follow)');
            elements.bulkSchedulerEnabled.checked = false;
            return;
        }
        
        await chrome.runtime.sendMessage({
            action: 'updateBulkScheduleSettings',
            settings: settings
        });
    }
    
    try {
        const response = await chrome.runtime.sendMessage({
            action: 'setBulkSchedulerEnabled',
            enabled: enabled
        });
        
        if (response.success) {
            await loadSchedulerStatus();
            
            if (enabled) {
                alert('✅ Bulk processing scheduler enabled! Make sure to add schedule times.');
            } else {
                alert('⏸️ Bulk processing scheduler disabled');
            }
        }
    } catch (error) {
        console.error('Failed to toggle scheduler:', error);
        elements.bulkSchedulerEnabled.checked = !enabled;
        alert('Failed to toggle scheduler');
    }
}

/**
 * Start countdown timer
 */
function startCountdownTimer() {
    // Clear existing interval
    if (window.countdownInterval) {
        clearInterval(window.countdownInterval);
    }
    
    // Update every second
    window.countdownInterval = setInterval(async () => {
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'getBulkSchedulerCountdown'
            });
            
            if (response.success && elements.countdownTimer) {
                elements.countdownTimer.textContent = response.countdown;
            }
        } catch (error) {
            // Ignore errors during countdown updates
        }
    }, 1000);
}

// ==================== ADD TO setupEventListeners() FUNCTION ====================

// Bulk Scheduler event listeners
elements.bulkSchedulerEnabled?.addEventListener('change', toggleBulkScheduler);
elements.addScheduleTime?.addEventListener('click', addScheduleTime);

// ==================== ADD TO TAB CLICK HANDLER ====================

// Add this to the tab click handler where other tabs load data:
// if (newActiveTab === 'analytics') loadAnalytics();
// if (newActiveTab === 'post-writer') loadDrafts();
// Add this:
if (newActiveTab === 'automation') {
    loadSchedulerStatus();
}

// ==================== CLEANUP ON WINDOW UNLOAD ====================

// Add this at the end of initializePopup() function:
window.addEventListener('beforeunload', () => {
    if (window.countdownInterval) {
        clearInterval(window.countdownInterval);
    }
});
