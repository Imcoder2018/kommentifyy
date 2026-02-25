// Auth Bridge - Listens for auth data on kommentify.com pages
// and sends it to the background script to store in extension storage

(function () {
    const isAuthPage = window.location.pathname.includes('extension-auth');
    const isDashboard = window.location.pathname.includes('dashboard');

    if (!isAuthPage && !isDashboard) {
        console.log('[AUTH BRIDGE] Not on extension-auth or dashboard page, skipping');
        return;
    }

    console.log('[AUTH BRIDGE] Content script loaded on', isAuthPage ? 'extension-auth' : 'dashboard', 'page');

    // Dashboard: Listen for post-to-linkedin events from the website
    if (isDashboard) {
        // Auto-sync auth token from dashboard to extension on every dashboard page load
        // This ensures the extension always uses the same userId as the dashboard
        const syncScript = document.createElement('script');
        syncScript.textContent = `
            (function() {
                try {
                    var authToken = localStorage.getItem('authToken');
                    var refreshToken = localStorage.getItem('refreshToken');
                    if (authToken) {
                        window.postMessage({
                            type: 'KOMMENTIFY_AUTH_SYNC',
                            authToken: authToken,
                            refreshToken: refreshToken || '',
                            apiBaseUrl: window.location.origin
                        }, '*');
                    }
                } catch(e) {}
            })();
        `;
        (document.head || document.documentElement).appendChild(syncScript);
        syncScript.remove();

        // Listen for the auth sync message from the injected page script
        window.addEventListener('message', (event) => {
            if (event.source !== window) return;
            if (event.data?.type === 'KOMMENTIFY_AUTH_SYNC' && event.data?.authToken) {
                chrome.storage.local.get(['authToken'], (stored) => {
                    if (stored.authToken !== event.data.authToken) {
                        console.log('[AUTH BRIDGE] 🔄 Syncing dashboard auth token to extension storage');
                        chrome.storage.local.set({
                            authToken: event.data.authToken,
                            refreshToken: event.data.refreshToken || '',
                            apiBaseUrl: event.data.apiBaseUrl || 'https://kommentify.com'
                        }, () => {
                            console.log('[AUTH BRIDGE] ✅ Auth token synced from dashboard');
                        });
                    }
                });
            }
        });

        // When website dispatches a post event, store image if present and tell background to poll commands
        window.addEventListener('kommentify-post-to-linkedin', async (event) => {
            console.log('[AUTH BRIDGE] Received post-to-linkedin command from dashboard', event.detail);

            // If image data is included in the event, store it in chrome.storage
            if (event.detail?.imageDataUrl) {
                try {
                    await chrome.storage.local.set({ pendingPostImage: event.detail.imageDataUrl });
                    console.log('[AUTH BRIDGE] ✅ Image stored in chrome.storage, size:', event.detail.imageDataUrl.length, 'chars');
                } catch (storageError) {
                    console.error('[AUTH BRIDGE] Failed to store image:', storageError);
                }
            }

            // Small delay to let the API save the command first
            setTimeout(() => {
                try {
                    chrome.runtime.sendMessage({
                        action: 'pollWebsiteCommands'
                    }, (response) => {
                        if (chrome.runtime.lastError) {
                            console.error('[AUTH BRIDGE] Error:', chrome.runtime.lastError.message);
                            return;
                        }
                        console.log('[AUTH BRIDGE] Poll commands response:', response);
                    });
                } catch (error) {
                    console.error('[AUTH BRIDGE] Error forwarding post command:', error);
                }
            }, 1500);
        });

        // Listen for stop-all-tasks event from dashboard
        window.addEventListener('kommentify-stop-all-tasks', async () => {
            console.log('[AUTH BRIDGE] Received stop-all-tasks command from dashboard');
            try {
                chrome.runtime.sendMessage({ action: 'stopAllTasks' }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('[AUTH BRIDGE] Stop error:', chrome.runtime.lastError.message);
                        return;
                    }
                    console.log('[AUTH BRIDGE] Stop all response:', response);
                });
            } catch (error) {
                console.error('[AUTH BRIDGE] Error forwarding stop command:', error);
            }
        });

        // Also poll for website commands every 10 seconds while dashboard is open
        setInterval(() => {
            try {
                chrome.runtime.sendMessage({ action: 'pollWebsiteCommands' }, (response) => {
                    if (chrome.runtime.lastError) return;
                    if (response?.success && response?.commands?.length > 0) {
                        console.log('[AUTH BRIDGE] Processed', response.commands.length, 'commands');
                    }
                });
            } catch (e) { /* ignore */ }
        }, 10000);

        console.log('[AUTH BRIDGE] Dashboard bridge active - listening for post commands & polling every 10s');

        // Listen for postMessage events from the dashboard page (e.g. Voyager sync button)
        window.addEventListener('message', (event) => {
            if (event.source !== window) return;
            if (event.data?.type === 'COMMENTRON_RUNTIME_SEND_MESSAGE' && event.data?.action) {
                console.log('[AUTH BRIDGE] Relaying postMessage to background:', event.data.action);
                try {
                    chrome.runtime.sendMessage(
                        { action: event.data.action, ...(event.data.payload || {}) },
                        (response) => {
                            if (chrome.runtime.lastError) {
                                console.warn('[AUTH BRIDGE] Relay error:', chrome.runtime.lastError.message);
                                return;
                            }
                            console.log('[AUTH BRIDGE] Relay response for', event.data.action, ':', response);
                            // Post response back to the page
                            if (event.data.requestId) {
                                window.postMessage({
                                    type: 'COMMENTRON_RUNTIME_RESPONSE',
                                    requestId: event.data.requestId,
                                    response
                                }, '*');
                            }
                        }
                    );
                } catch (err) {
                    console.error('[AUTH BRIDGE] Error relaying message:', err);
                }
            }
        });

        return; // Don't run auth flow on dashboard
    }

    // Only run auth extraction on extension-auth page

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
