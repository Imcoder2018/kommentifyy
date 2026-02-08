/**
 * THE STORAGE AND MESSAGING BRIDGE
 * This script runs in the isolated "content_script" world, which has access
 * to chrome.* APIs. It now handles both storage and runtime messaging.
 *
 * CROSS-WORLD COMMUNICATION:
 * CustomEvent.detail does NOT cross the isolated/MAIN world boundary.
 * We pass data via hidden DOM elements (DOM is shared) + plain Event dispatch.
 */

// Helper: send a response to the MAIN world via a hidden DOM element + plain Event
function bridgeSendToMainWorld(payload) {
    const el = document.createElement('div');
    el.style.display = 'none';
    el.setAttribute('data-commentron-response', JSON.stringify(payload));
    document.documentElement.appendChild(el);
    document.dispatchEvent(new Event('COMMENTRON_BRIDGE_RESPONSE'));
}

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
    // --- Runtime Message Handler ---
    else if (type === 'COMMENTRON_RUNTIME_SEND_MESSAGE') {
        const message = { action: action, ...payload, _bridgeRequestId: requestId };
        
        console.log('BRIDGE: Sending message to background:', message.action, 'requestId:', requestId);
        
        chrome.runtime.sendMessage(message, (response) => {
            if (chrome.runtime.lastError) {
                console.error("BRIDGE ERROR:", chrome.runtime.lastError.message);
                bridgeSendToMainWorld({ requestId: requestId, error: chrome.runtime.lastError.message });
                return;
            }
            
            console.log('BRIDGE: Received response from background:', response);
            bridgeSendToMainWorld({ requestId: requestId, data: response });
        });
    }
});

// --- Fallback Response Channel ---
// Listen for direct messages from background via chrome.tabs.sendMessage
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'AI_COMMENT_RESULT' && message._bridgeRequestId) {
        console.log('BRIDGE FALLBACK: Received AI_COMMENT_RESULT for requestId:', message._bridgeRequestId);
        bridgeSendToMainWorld({ requestId: message._bridgeRequestId, data: message.data });
    }
    if (message.type === 'COMMENT_SETTINGS_RESULT' && message._bridgeRequestId) {
        console.log('BRIDGE FALLBACK: Received COMMENT_SETTINGS_RESULT for requestId:', message._bridgeRequestId);
        bridgeSendToMainWorld({ requestId: message._bridgeRequestId, data: message.data });
    }
});