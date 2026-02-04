/**
 * SAFE MESSAGE HANDLER
 * Wraps chrome.runtime.sendMessage with timeout protection
 * Prevents UI freeze when service worker is busy or unresponsive
 */

/**
 * Send message to background with timeout protection
 * @param {object} message - Message to send
 * @param {number} timeout - Timeout in milliseconds (default: 5000ms)
 * @returns {Promise} Response from background script
 */
export async function sendMessageSafe(message, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            console.warn(`⚠️ Message timeout (${timeout}ms):`, message.action);
            resolve({ success: false, error: 'Timeout', timeout: true });
        }, timeout);

        try {
            chrome.runtime.sendMessage(message, (response) => {
                clearTimeout(timeoutId);
                
                // Check for errors
                if (chrome.runtime.lastError) {
                    console.warn('❌ Chrome runtime error:', chrome.runtime.lastError.message);
                    resolve({ success: false, error: chrome.runtime.lastError.message });
                    return;
                }
                
                resolve(response || { success: false, error: 'No response' });
            });
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('❌ Message send error:', error);
            resolve({ success: false, error: error.message });
        }
    });
}

/**
 * Send message with automatic retry on failure
 * @param {object} message - Message to send
 * @param {number} maxRetries - Maximum retry attempts (default: 2)
 * @param {number} timeout - Timeout per attempt in ms (default: 5000ms)
 * @returns {Promise} Response from background script
 */
export async function sendMessageWithRetry(message, maxRetries = 2, timeout = 5000) {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        if (attempt > 0) {
            console.log(`🔄 Retry attempt ${attempt}/${maxRetries} for:`, message.action);
            await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms between retries
        }
        
        try {
            const response = await sendMessageSafe(message, timeout);
            
            // If we got a valid response, return it
            if (response && !response.timeout) {
                return response;
            }
            
            lastError = response.error || 'Timeout';
        } catch (error) {
            lastError = error.message;
        }
    }
    
    // All retries failed
    console.error(`❌ All retries failed for ${message.action}:`, lastError);
    return { success: false, error: lastError, allRetriesFailed: true };
}

/**
 * Send message and handle common error cases gracefully
 * @param {object} message - Message to send
 * @param {object} options - Options { timeout, retries, fallback }
 * @returns {Promise} Response or fallback value
 */
export async function sendMessageGraceful(message, options = {}) {
    const {
        timeout = 5000,
        retries = 1,
        fallback = null,
        silent = false
    } = options;
    
    const response = await sendMessageWithRetry(message, retries, timeout);
    
    if (!response.success && !silent) {
        console.warn(`⚠️ Message failed (using fallback):`, message.action, response.error);
    }
    
    return response.success ? response : (fallback || response);
}
