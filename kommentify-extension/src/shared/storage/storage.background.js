/**
 * BACKGROUND STORAGE MODULE
 * This is a simplified storage wrapper designed ONLY for the background service worker.
 * It accesses the chrome.storage.local API directly, as it has permission to do so.
 * It does NOT use the window.postMessage bridge.
 */
class BackgroundStorage {

    async get(key) {
        return new Promise((resolve) => {
            chrome.storage.local.get(key, (result) => resolve(result[key]));
        });
    }

    async set(key, value) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ [key]: value }, resolve);
        });
    }

    // --- Type-specific Helpers ---

    async getObject(key, defaultValue = {}) {
        const jsonValue = await this.get(key);
        if (jsonValue == null) return defaultValue;
        try {
            return JSON.parse(jsonValue);
        } catch (e) {
            return defaultValue;
        }
    }
    
    async setObject(key, value) {
        await this.set(key, JSON.stringify(value));
    }

    async setArray(key, value) {
        // Store array directly, not as JSON string
        await this.set(key, value);
    }

    async getArray(key, defaultValue = []) {
        const value = await this.get(key);
        if (value == null) return defaultValue;
        // If it's already an array, return it
        if (Array.isArray(value)) return value;
        // If it's a string (old format), try to parse it
        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);
                return Array.isArray(parsed) ? parsed : defaultValue;
            } catch (e) {
                return defaultValue;
            }
        }
        // If it's an object with data property, extract it
        if (value && typeof value === 'object' && Array.isArray(value.data)) {
            return value.data;
        }
        return defaultValue;
    }
    
    async getString(key, defaultValue = null) {
        const value = await this.get(key);
        return value == null ? defaultValue : String(value);
    }
}

// Export a single instance for the background script to use
export const storage = new BackgroundStorage();