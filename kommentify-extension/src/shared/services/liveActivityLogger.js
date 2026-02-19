/**
 * Live Activity Logger — sends task actions to website dashboard in real-time
 * Batches logs and flushes periodically or when buffer is full
 */

const API_BASE_URL = 'https://kommentify.com';
const FLUSH_INTERVAL_MS = 5000;  // flush every 5 seconds
const MAX_BUFFER_SIZE = 20;      // flush when buffer has 20 entries

let logBuffer = [];
let flushTimer = null;
let isStarted = false;

/**
 * Log a live activity entry
 * @param {string} taskType - 'automation' | 'networking' | 'import' | 'post_writer'
 * @param {string} action - 'like' | 'comment' | 'share' | 'follow' | 'connect' | 'post' | 'delay' | 'start' | 'stop' | 'error' | 'info'
 * @param {string} message - Human-readable description
 * @param {object} [details] - Extra data (post URL, delay duration, etc.)
 * @param {string} [level] - 'info' | 'success' | 'warning' | 'error'
 */
export function logActivity(taskType, action, message, details = {}, level = 'info') {
    logBuffer.push({
        taskType,
        action,
        message,
        details: typeof details === 'string' ? details : JSON.stringify(details),
        level,
        timestamp: new Date().toISOString(),
    });

    // Also log to console for debugging
    const icon = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' }[level] || 'ℹ️';
    console.log(`${icon} LIVE LOG [${taskType}/${action}]: ${message}`);

    // Auto-flush if buffer is full
    if (logBuffer.length >= MAX_BUFFER_SIZE) {
        flushLogs();
    }
}

/**
 * Convenience loggers for common actions
 */
export const liveLog = {
    start: (taskType, message, details) => logActivity(taskType, 'start', message, details, 'info'),
    stop: (taskType, message, details) => logActivity(taskType, 'stop', message, details, 'warning'),
    like: (taskType, message, details) => logActivity(taskType, 'like', message, details, 'success'),
    comment: (taskType, message, details) => logActivity(taskType, 'comment', message, details, 'success'),
    share: (taskType, message, details) => logActivity(taskType, 'share', message, details, 'success'),
    follow: (taskType, message, details) => logActivity(taskType, 'follow', message, details, 'success'),
    connect: (taskType, message, details) => logActivity(taskType, 'connect', message, details, 'success'),
    post: (taskType, message, details) => logActivity(taskType, 'post', message, details, 'success'),
    delay: (taskType, seconds, reason) => logActivity(taskType, 'delay', `⏳ Waiting ${seconds}s — ${reason || 'between actions'}`, { delaySeconds: seconds, reason }, 'info'),
    error: (taskType, message, details) => logActivity(taskType, 'error', message, details, 'error'),
    info: (taskType, message, details) => logActivity(taskType, 'info', message, details, 'info'),
};

/**
 * Flush buffered logs to the server
 */
async function flushLogs() {
    if (logBuffer.length === 0) return;

    // Take current buffer and reset
    const entries = [...logBuffer];
    logBuffer = [];

    try {
        const storage = await chrome.storage.local.get(['authToken', 'apiBaseUrl']);
        const token = storage.authToken;
        if (!token) return; // Not logged in, discard

        const apiUrl = (storage.apiBaseUrl && !storage.apiBaseUrl.includes('backend-buxx')) 
            ? storage.apiBaseUrl : API_BASE_URL;

        const response = await fetch(`${apiUrl}/api/live-activity`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(entries),
        });

        if (!response.ok) {
            console.warn('LIVE LOG: Failed to flush logs, status:', response.status);
        }
    } catch (error) {
        console.warn('LIVE LOG: Error flushing logs:', error.message);
        // Don't re-add to buffer to avoid infinite growth
    }
}

/**
 * Start the periodic flush timer
 */
export function startLiveLogger() {
    if (isStarted) return;
    isStarted = true;

    flushTimer = setInterval(flushLogs, FLUSH_INTERVAL_MS);
    console.log('📡 LIVE LOG: Logger started (flush every 5s)');
}

/**
 * Stop the logger and flush remaining
 */
export function stopLiveLogger() {
    if (flushTimer) {
        clearInterval(flushTimer);
        flushTimer = null;
    }
    isStarted = false;
    flushLogs(); // flush remaining
    console.log('📡 LIVE LOG: Logger stopped');
}
