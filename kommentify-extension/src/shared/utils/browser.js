/**
 * A helper class that wraps common chrome.* extension APIs to make them
 * promise-based and easier to use.
 */
class Browser {
    /**
     * Checks if the currently active tab is on linkedin.com.
     * @returns {Promise<boolean>}
     */
    async isLinkedInPage() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        return tab && tab.url ? new URL(tab.url).host.toLowerCase().endsWith("linkedin.com") : false;
    }

    /**
     * Gets the hostname of the currently active tab.
     * @returns {Promise<string>}
     */
    async getCurrentHost() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        return tab && tab.url ? new URL(tab.url).host : "";
    }

    /**
     * Opens a new tab and resolves with the tab ID once it's fully loaded.
     * @param {string} url - The URL to open.
     * @param {boolean} [active=false] - Whether the new tab should be focused.
     * @param {boolean} [useWindow=false] - Whether to open in new window instead of tab.
     * @returns {Promise<number|null>} The tab ID or null if it fails to load.
     */
    openTab(url, active = false, useWindow = false) {
        return new Promise(async (resolve) => {
            try {
                let tab;
                
                if (useWindow) {
                    // Get current window to calculate half width
                    const currentWindow = await chrome.windows.getCurrent();
                    const halfWidth = Math.floor(currentWindow.width / 2);
                    
                    // Create new window with half width on left side
                    const newWindow = await chrome.windows.create({
                        url,
                        focused: active,
                        type: 'normal',
                        left: 0,
                        top: 0,
                        width: halfWidth,
                        height: currentWindow.height
                    });
                    
                    tab = newWindow.tabs[0];
                } else {
                    // Create tab in current window (background by default)
                    tab = await chrome.tabs.create({
                        url,
                        active: active
                    });
                }
                
                if (!tab || !tab.id) {
                    console.error('BROWSER: Failed to create tab');
                    resolve(null);
                    return;
                }
                
                console.log(`BROWSER: Created tab ${tab.id} for ${url}`);
                
                // Increased timeout to 30 seconds for slow connections
                const timeout = setTimeout(() => {
                    console.warn(`BROWSER: Tab ${tab.id} timed out waiting for complete status`);
                    chrome.tabs.onUpdated.removeListener(listener);
                    // Return the tab ID anyway - it might still be usable
                    resolve(tab.id);
                }, 30000);

                const listener = (tabId, changeInfo) => {
                    if (tabId === tab.id && changeInfo.status === 'complete') {
                        console.log(`BROWSER: Tab ${tab.id} fully loaded`);
                        clearTimeout(timeout);
                        chrome.tabs.onUpdated.removeListener(listener);
                        resolve(tab.id);
                    }
                };
                chrome.tabs.onUpdated.addListener(listener);
            } catch (error) {
                console.error('BROWSER: Error opening tab:', error);
                resolve(null);
            }
        });
    }

    /**
     * Executes a function in the context of a specific tab.
     * @param {Function} func - The function to execute.
     * @param {number} tabId - The ID of the target tab.
     * @param {...any} args - Arguments to pass to the function.
     * @returns {Promise<any>} The result of the executed function.
     */
    async contentExecution(func, tabId, ...args) {
        const results = await chrome.scripting.executeScript({
            target: { tabId },
            func: func,
            args: args,
        });
        return results && results[0] ? results[0].result : null;
    }
}

export const browser = new Browser();