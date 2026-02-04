/**
 * AUTOMATION STATE MANAGER
 * Prevents popup message flooding during active automation
 */

// Global state flag
let isAutomationActive = false;
let lastCheck = 0;
const THROTTLE_MS = 1000; // Only check once per second

/**
 * Check if any automation is currently running
 * @returns {Promise<boolean>}
 */
export async function isAutomationRunning() {
    // Throttle checks to prevent excessive storage reads
    const now = Date.now();
    if (now - lastCheck < THROTTLE_MS) {
        return isAutomationActive;
    }
    
    lastCheck = now;
    
    try {
        const state = await chrome.storage.local.get(['bulkProcessingActive', 'peopleSearchActive']);
        isAutomationActive = state.bulkProcessingActive || state.peopleSearchActive || false;
        return isAutomationActive;
    } catch (error) {
        console.warn('Failed to check automation state:', error);
        return false;
    }
}

/**
 * Skip non-critical operations during automation
 * @param {Function} operation - Function to run
 * @param {string} name - Operation name for logging
 * @returns {Promise}
 */
export async function runIfNotAutomating(operation, name = 'operation') {
    const isRunning = await isAutomationRunning();
    
    if (isRunning) {
        console.log(`⏭️ SKIPPED: ${name} (automation is running)`);
        return null;
    }
    
    return await operation();
}

/**
 * Force refresh the automation state
 */
export function refreshAutomationState() {
    lastCheck = 0;
}
