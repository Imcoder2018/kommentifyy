/**
 * ADD THESE MESSAGE HANDLERS TO background/index.js
 * Location: Around line 800, before the closing of chrome.runtime.onMessage.addListener
 */

// ==================== BULK SCHEDULER HANDLERS ====================

// Get Bulk Scheduler Status
if (request.action === 'getBulkSchedulerStatus') {
    sendResponse({ success: true, status: bulkScheduler.getStatus() });
    return true;
}

// Add Bulk Schedule
if (request.action === 'addBulkSchedule') {
    (async () => {
        try {
            await bulkScheduler.addSchedule(request.time);
            sendResponse({ success: true });
        } catch (error) {
            console.error('BULK SCHEDULER: Failed to add schedule:', error);
            sendResponse({ success: false, error: error.message });
        }
    })();
    return true;
}

// Remove Bulk Schedule
if (request.action === 'removeBulkSchedule') {
    (async () => {
        try {
            await bulkScheduler.removeSchedule(request.time);
            sendResponse({ success: true });
        } catch (error) {
            console.error('BULK SCHEDULER: Failed to remove schedule:', error);
            sendResponse({ success: false, error: error.message });
        }
    })();
    return true;
}

// Set Bulk Scheduler Enabled
if (request.action === 'setBulkSchedulerEnabled') {
    (async () => {
        try {
            await bulkScheduler.setEnabled(request.enabled);
            sendResponse({ success: true });
        } catch (error) {
            console.error('BULK SCHEDULER: Failed to set enabled:', error);
            sendResponse({ success: false, error: error.message });
        }
    })();
    return true;
}

// Update Bulk Schedule Settings
if (request.action === 'updateBulkScheduleSettings') {
    (async () => {
        try {
            await bulkScheduler.updateSettings(request.settings);
            sendResponse({ success: true });
        } catch (error) {
            console.error('BULK SCHEDULER: Failed to update settings:', error);
            sendResponse({ success: false, error: error.message });
        }
    })();
    return true;
}

// Get Bulk Scheduler Countdown
if (request.action === 'getBulkSchedulerCountdown') {
    sendResponse({ success: true, countdown: bulkScheduler.getCountdown() });
    return true;
}

// Get Bulk Scheduler Execution History
if (request.action === 'getBulkSchedulerHistory') {
    (async () => {
        try {
            const history = await bulkScheduler.getExecutionHistory(request.limit || 10);
            sendResponse({ success: true, history });
        } catch (error) {
            console.error('BULK SCHEDULER: Failed to get history:', error);
            sendResponse({ success: false, error: error.message });
        }
    })();
    return true;
}
