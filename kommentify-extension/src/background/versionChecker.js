/**
 * Version Checker Module
 * Checks for extension updates on startup and shows notification if update available
 */

// Use dynamic API URL from config or storage
const getApiBaseUrl = async () => {
    try {
        const { apiBaseUrl } = await chrome.storage.local.get('apiBaseUrl');
        if (apiBaseUrl && !apiBaseUrl.includes('localhost') && !apiBaseUrl.includes('backend-buxx') && !apiBaseUrl.includes('backend-api-orcin') && !apiBaseUrl.includes('backend-4poj')) {
            return apiBaseUrl;
        }
    } catch (e) {}
    // Default to production API
    return 'https://kommentify.com';
};

class VersionChecker {
    constructor() {
        this.checkInterval = 24 * 60 * 60 * 1000; // Check every 24 hours
        this.notificationTimeout = 15000; // 15 seconds
    }

    /**
     * Get current extension version from manifest
     */
    async getCurrentVersion() {
        try {
            const manifest = chrome.runtime.getManifest();
            return manifest.version;
        } catch (error) {
            console.error('VERSION CHECKER: Failed to get current version:', error);
            return '1.0.0';
        }
    }

    /**
     * Check for updates from backend API
     */
    async checkForUpdates() {
        try {
            const currentVersion = await this.getCurrentVersion();
            console.log('VERSION CHECKER: Current version:', currentVersion);

            const apiUrl = await getApiBaseUrl();
            const response = await fetch(`${apiUrl}/api/extension/version?current=${currentVersion}`);
            const data = await response.json();
            
            // Store last check time
            await chrome.storage.local.set({ 
                lastVersionCheck: Date.now(),
                currentExtensionVersion: currentVersion 
            });

            console.log('VERSION CHECKER: API response:', data);

            if (data.hasUpdate) {
                console.log('VERSION CHECKER: New version available:', data.latestVersion);
                await this.showUpdateNotification(data);
                return {
                    hasUpdate: true,
                    currentVersion,
                    latestVersion: data.latestVersion,
                    downloadUrl: data.downloadUrl,
                    features: data.features || [],
                    bugFixes: data.bugFixes || []
                };
            } else {
                console.log('VERSION CHECKER: Extension is up to date');
                // Clear any stored update info since we're up to date
                await this.clearUpdateInfo();
                return { hasUpdate: false, currentVersion };
            }
        } catch (error) {
            console.error('VERSION CHECKER: Failed to check for updates:', error);
            return { hasUpdate: false, error: error.message };
        }
    }

    /**
     * Show update notification with auto-dismiss
     */
    async showUpdateNotification(updateInfo) {
        try {
            const apiUrl = await getApiBaseUrl();
            
            // Store update info for dashboard display
            await chrome.storage.local.set({
                extensionUpdateAvailable: {
                    hasUpdate: true,
                    latestVersion: updateInfo.latestVersion,
                    downloadUrl: updateInfo.downloadUrl || `${apiUrl}/extension-download`,
                    features: updateInfo.features || [],
                    bugFixes: updateInfo.bugFixes || [],
                    releaseNotes: updateInfo.releaseNotes || '',
                    checkedAt: Date.now()
                }
            });

            // Create notification
            const notificationId = 'extension-update-' + Date.now();
            
            if (chrome.notifications) {
                chrome.notifications.create(notificationId, {
                    type: 'basic',
                    iconUrl: chrome.runtime.getURL('assets/icons/icon128.png'),
                    title: '🚀 Extension Update Available!',
                    message: `Version ${updateInfo.latestVersion} is available. Click to download the latest version with new features and improvements.`,
                    priority: 2,
                    buttons: [
                        { title: '📥 Download Now' },
                        { title: 'Later' }
                    ],
                    requireInteraction: false
                });

                // Auto-dismiss after timeout
                setTimeout(() => {
                    chrome.notifications.clear(notificationId);
                }, this.notificationTimeout);

                // Handle notification click
                chrome.notifications.onClicked.addListener((clickedId) => {
                    if (clickedId === notificationId) {
                        this.openDownloadPage(updateInfo.downloadUrl);
                        chrome.notifications.clear(notificationId);
                    }
                });

                // Handle button clicks
                chrome.notifications.onButtonClicked.addListener((clickedId, buttonIndex) => {
                    if (clickedId === notificationId) {
                        if (buttonIndex === 0) {
                            // Download Now
                            this.openDownloadPage(updateInfo.downloadUrl);
                        }
                        chrome.notifications.clear(notificationId);
                    }
                });
            }

            console.log('VERSION CHECKER: Update notification shown');
        } catch (error) {
            console.error('VERSION CHECKER: Failed to show notification:', error);
        }
    }

    /**
     * Open the extension download page
     */
    async openDownloadPage(downloadUrl) {
        const apiUrl = await getApiBaseUrl();
        const url = downloadUrl || `${apiUrl}/extension-download`;
        chrome.tabs.create({ url });
    }

    /**
     * Initialize version checker - run on extension startup
     */
    async initialize() {
        console.log('VERSION CHECKER: Initializing...');
        
        // Check immediately on startup
        await this.checkForUpdates();

        // Set up periodic check alarm
        chrome.alarms.create('versionCheck', {
            periodInMinutes: 60 * 24 // Once per day
        });

        console.log('VERSION CHECKER: Initialized and scheduled');
    }

    /**
     * Handle alarm for periodic version check
     */
    async handleAlarm(alarm) {
        if (alarm.name === 'versionCheck') {
            console.log('VERSION CHECKER: Running scheduled check...');
            await this.checkForUpdates();
        }
    }

    /**
     * Clear stored update info (e.g., after user updates)
     */
    async clearUpdateInfo() {
        await chrome.storage.local.remove('extensionUpdateAvailable');
        console.log('VERSION CHECKER: Update info cleared');
    }

    /**
     * Get stored update info
     */
    async getStoredUpdateInfo() {
        const { extensionUpdateAvailable } = await chrome.storage.local.get('extensionUpdateAvailable');
        return extensionUpdateAvailable || null;
    }
}

// Create and export singleton instance
export const versionChecker = new VersionChecker();
