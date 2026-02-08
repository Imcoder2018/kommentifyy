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
            }, '*');
        });
    } else if (type === 'COMMENTRON_SET_STORAGE') {
        chrome.storage.local.set({ [key]: value }, () => {
            window.postMessage({
                type: `COMMENTRON_STORAGE_RESULT_${requestId}`,
                data: { success: true }
            }, '*');
        });
    }
    // --- Runtime Message Handler (NEW) ---
    else if (type === 'COMMENTRON_RUNTIME_SEND_MESSAGE') {
        // Construct the message to send to background (include requestId for fallback channel)
        const message = { action: action, ...payload, _bridgeRequestId: requestId };
        
        console.log('BRIDGE: Sending message to background:', message.action, 'requestId:', requestId);
        
        chrome.runtime.sendMessage(message, (response) => {
            // Check for errors from the background script
            if (chrome.runtime.lastError) {
                console.error("BRIDGE ERROR:", chrome.runtime.lastError.message);
                window.postMessage({
                    type: `COMMENTRON_RUNTIME_RESULT_${requestId}`,
                    error: chrome.runtime.lastError.message
                }, '*');
                return;
            }
            
            console.log('BRIDGE: Received response from background:', response);
            
            // Send the successful response back to the main world
            window.postMessage({
                type: `COMMENTRON_RUNTIME_RESULT_${requestId}`,
                data: response
            }, '*');
        });
    }
});

// --- Fallback Response Channel ---
// Listen for direct messages from background via chrome.tabs.sendMessage
// This handles cases where chrome.runtime.sendMessage callback doesn't fire (MV3 issue)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'AI_COMMENT_RESULT' && message._bridgeRequestId) {
        console.log('BRIDGE FALLBACK: Received AI_COMMENT_RESULT for requestId:', message._bridgeRequestId);
        window.postMessage({
            type: `COMMENTRON_RUNTIME_RESULT_${message._bridgeRequestId}`,
            data: message.data
        }, '*');
    }
    if (message.type === 'COMMENT_SETTINGS_RESULT' && message._bridgeRequestId) {
        console.log('BRIDGE FALLBACK: Received COMMENT_SETTINGS_RESULT for requestId:', message._bridgeRequestId);
        window.postMessage({
            type: `COMMENTRON_RUNTIME_RESULT_${message._bridgeRequestId}`,
            data: message.data
        }, '*');
    }
});