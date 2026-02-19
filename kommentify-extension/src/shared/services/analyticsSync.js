/**
 * ANALYTICS SYNC SERVICE
 * Syncs all analytics data from chrome.storage.local to the website backend.
 * This ensures the website dashboard displays the same analytics as the extension.
 *
 * Data synced:
 * - engagementStatistics (daily/weekly/monthly engagement counts)
 * - automationPostRecords (bulk processing post-level records)
 * - processingHistory (automation & networking sessions)
 * - importHistory (import profile records)
 * - leads (leads database)
 */

const ANALYTICS_API_BASE = 'https://kommentify.com';
const SYNC_DEBOUNCE_MS = 5000; // Wait 5s after last change before syncing
const SYNC_INTERVAL_MS = 2 * 60 * 1000; // Sync every 2 minutes as fallback

let syncTimer = null;
let periodicSyncInterval = null;
let isSyncing = false;

/**
 * Get API URL and auth token from storage
 */
async function getApiConfig() {
    const storage = await chrome.storage.local.get(['authToken', 'apiBaseUrl']);
    const token = storage.authToken;
    const apiUrl = (storage.apiBaseUrl &&
        !storage.apiBaseUrl.includes('backend-buxx') &&
        !storage.apiBaseUrl.includes('backend-api-orcin') &&
        !storage.apiBaseUrl.includes('backend-4poj'))
        ? storage.apiBaseUrl
        : ANALYTICS_API_BASE;
    return { token, apiUrl };
}

/**
 * Collect all analytics data from chrome.storage.local
 */
async function collectAnalyticsData() {
    const result = await chrome.storage.local.get([
        'engagementStatistics',
        'automationPostRecords',
        'processingHistory',
        'importHistory',
        'leads',
    ]);

    // Split processingHistory into automation and networking sessions
    const processingHistory = result.processingHistory || [];
    const networkingSessions = processingHistory.filter(s => s.type === 'networking');

    return {
        engagementStats: result.engagementStatistics || {},
        automationRecords: result.automationPostRecords || [],
        networkingSessions: networkingSessions,
        importRecords: result.importHistory || [],
        leads: Array.isArray(result.leads) ? result.leads : [],
    };
}

/**
 * Push analytics data to the backend
 */
async function pushAnalyticsToBackend() {
    if (isSyncing) {
        console.log('📊 ANALYTICS SYNC: Already syncing, skipping...');
        return;
    }

    isSyncing = true;
    try {
        const { token, apiUrl } = await getApiConfig();
        if (!token) {
            console.log('📊 ANALYTICS SYNC: No auth token, skipping sync');
            return;
        }

        const data = await collectAnalyticsData();

        const response = await fetch(`${apiUrl}/api/analytics/sync`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ ANALYTICS SYNC: Data synced to backend successfully');
            // Store last sync time
            await chrome.storage.local.set({ lastAnalyticsSyncTime: Date.now() });
        } else {
            const errorData = await response.json().catch(() => ({}));
            console.warn('⚠️ ANALYTICS SYNC: Sync failed:', response.status, errorData.error || '');
        }
    } catch (error) {
        console.error('❌ ANALYTICS SYNC: Error syncing:', error.message || error);
    } finally {
        isSyncing = false;
    }
}

/**
 * Debounced sync - waits SYNC_DEBOUNCE_MS after the last call before actually syncing.
 * This batches rapid changes (e.g. during bulk automation) into a single API call.
 */
export function triggerAnalyticsSync() {
    if (syncTimer) {
        clearTimeout(syncTimer);
    }
    syncTimer = setTimeout(() => {
        syncTimer = null;
        pushAnalyticsToBackend();
    }, SYNC_DEBOUNCE_MS);
}

/**
 * Force immediate sync (e.g. when user opens analytics tab)
 */
export function forceAnalyticsSync() {
    if (syncTimer) {
        clearTimeout(syncTimer);
        syncTimer = null;
    }
    pushAnalyticsToBackend();
}

/**
 * Start periodic background sync.
 * Also listens for chrome.storage changes to trigger debounced syncs.
 */
export function startAnalyticsSyncService() {
    console.log('📊 ANALYTICS SYNC: Service starting...');

    // Sync immediately on startup
    setTimeout(() => pushAnalyticsToBackend(), 10000); // Wait 10s after startup

    // Set up periodic sync every 2 minutes
    if (periodicSyncInterval) {
        clearInterval(periodicSyncInterval);
    }
    periodicSyncInterval = setInterval(() => {
        pushAnalyticsToBackend();
    }, SYNC_INTERVAL_MS);

    // Listen for storage changes to trigger debounced sync
    if (!globalThis._analyticsSyncListenerAttached) {
        chrome.storage.onChanged.addListener((changes, areaName) => {
            if (areaName !== 'local') return;

            // Only sync when analytics-related keys change
            const analyticsKeys = [
                'engagementStatistics',
                'automationPostRecords',
                'processingHistory',
                'importHistory',
                'leads',
            ];

            const hasAnalyticsChange = analyticsKeys.some(key => key in changes);
            if (hasAnalyticsChange) {
                console.log('📊 ANALYTICS SYNC: Storage change detected, scheduling sync...');
                triggerAnalyticsSync();
            }
        });
        globalThis._analyticsSyncListenerAttached = true;
    }

    console.log('✅ ANALYTICS SYNC: Service started (periodic + on-change)');
}

/**
 * Stop the periodic sync service
 */
export function stopAnalyticsSyncService() {
    if (periodicSyncInterval) {
        clearInterval(periodicSyncInterval);
        periodicSyncInterval = null;
    }
    if (syncTimer) {
        clearTimeout(syncTimer);
        syncTimer = null;
    }
    console.log('📊 ANALYTICS SYNC: Service stopped');
}
