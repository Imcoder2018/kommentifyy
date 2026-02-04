// Auth Bridge - Listens for auth data on kommentify.com/extension-auth page
// and sends it to the background script to store in extension storage

(function() {
    console.log('[AUTH BRIDGE] Content script loaded on extension-auth page');

    // Function to extract and send auth data
    async function extractAndSendAuthData() {
        // Try to find the auth data element
        const authDataElement = document.getElementById('kommentify-extension-auth-data');
        
        if (authDataElement) {
            const authDataStr = authDataElement.getAttribute('data-auth');
            if (authDataStr) {
                try {
                    const authData = JSON.parse(authDataStr);
                    console.log('[AUTH BRIDGE] Found auth data, sending to extension...');
                    
                    // Store in extension storage
                    await chrome.storage.local.set({
                        authToken: authData.authToken,
                        refreshToken: authData.refreshToken,
                        userData: authData.userData,
                        apiBaseUrl: authData.apiBaseUrl
                    });
                    
                    console.log('[AUTH BRIDGE] ✅ Auth data saved to extension storage!');
                    
                    // Notify background script
                    chrome.runtime.sendMessage({
                        action: 'authComplete',
                        success: true,
                        userData: authData.userData
                    });
                    
                    return true;
                } catch (error) {
                    console.error('[AUTH BRIDGE] Error parsing auth data:', error);
                }
            }
        }
        return false;
    }

    // Listen for the custom event from the page
    window.addEventListener('kommentify-auth-ready', async (event) => {
        console.log('[AUTH BRIDGE] Received kommentify-auth-ready event');
        
        if (event.detail && event.detail.authToken) {
            try {
                // Store in extension storage
                await chrome.storage.local.set({
                    authToken: event.detail.authToken,
                    refreshToken: event.detail.refreshToken,
                    userData: event.detail.userData,
                    apiBaseUrl: event.detail.apiBaseUrl
                });
                
                console.log('[AUTH BRIDGE] ✅ Auth data saved to extension storage!');
                
                // Notify background script
                chrome.runtime.sendMessage({
                    action: 'authComplete',
                    success: true,
                    userData: event.detail.userData
                });
            } catch (error) {
                console.error('[AUTH BRIDGE] Error saving auth data:', error);
            }
        }
    });

    // Also try to extract immediately in case event was already fired
    // Use MutationObserver to watch for the auth data element
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.id === 'kommentify-extension-auth-data') {
                    console.log('[AUTH BRIDGE] Auth data element detected via mutation');
                    extractAndSendAuthData();
                    observer.disconnect();
                    return;
                }
            }
        }
    });

    // Start observing
    observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true
    });

    // Also check immediately
    setTimeout(() => {
        extractAndSendAuthData();
    }, 500);

    // And check again after a delay in case React is slow
    setTimeout(() => {
        extractAndSendAuthData();
    }, 2000);

    console.log('[AUTH BRIDGE] Waiting for auth data...');
})();
