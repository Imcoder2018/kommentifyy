/**
 * THE STORAGE AND MESSAGING BRIDGE
 * This script runs in the isolated "content_script" world, which has access
 * to chrome.* APIs. It now handles both storage and runtime messaging.
 */
window.addEventListener('message', (event) => {
    // We only accept messages from ourselves and of the correct type
    if (event.source !== window || !event.data.type || !event.data.type.startsWith('COMMENTRON_')) {
        return;
    }

    const { type, key, value, requestId, action, payload } = event.data;

    // --- Storage Handler ---
    if (type === 'COMMENTRON_GET_STORAGE') {
        chrome.storage.local.get(key, (result) => {
            window.postMessage({
                type: `COMMENTRON_STORAGE_RESULT_${requestId}`,
                data: result ? result[key] : null
            });
        });
    } else if (type === 'COMMENTRON_SET_STORAGE') {
        chrome.storage.local.set({ [key]: value }, () => {
            window.postMessage({
                type: `COMMENTRON_STORAGE_RESULT_${requestId}`,
                data: { success: true }
            });
        });
    }
    // --- Runtime Message Handler (NEW) ---
    else if (type === 'COMMENTRON_RUNTIME_SEND_MESSAGE') {
        // Construct the message to send to background
        const message = { action: action, ...payload };
        
        console.log('BRIDGE: Sending message to background:', message);
        
        chrome.runtime.sendMessage(message, (response) => {
            // Check for errors from the background script
            if (chrome.runtime.lastError) {
                console.error("BRIDGE ERROR:", chrome.runtime.lastError.message);
                window.postMessage({
                    type: `COMMENTRON_RUNTIME_RESULT_${requestId}`,
                    error: chrome.runtime.lastError.message
                });
                return;
            }
            
            console.log('BRIDGE: Received response from background:', response);
            
            // Send the successful response back to the main world
            window.postMessage({
                type: `COMMENTRON_RUNTIME_RESULT_${requestId}`,
                data: response
            });
        });
    }
});