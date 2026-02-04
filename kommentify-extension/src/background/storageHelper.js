/**
 * BACKGROUND STORAGE HELPER
 * Direct chrome.storage.local wrapper for background scripts
 * Does NOT use window.postMessage bridge
 */

class BackgroundStorage {
    async get(key) {
        return new Promise((resolve) => {
            chrome.storage.local.get(key, (result) => {
                resolve(result[key]);
            });
        });
    }

    async set(key, value) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ [key]: value }, () => {
                resolve();
            });
        });
    }

    async remove(key) {
        return new Promise((resolve) => {
            chrome.storage.local.remove(key, () => {
                resolve();
            });
        });
    }

    // Type-specific helpers
    async setObject(key, value) {
        const jsonValue = value !== null ? JSON.stringify(value) : null;
        await this.set(key, jsonValue);
    }

    async getObject(key, defaultValue = {}) {
        const jsonValue = await this.get(key);
        if (jsonValue == null || jsonValue === "undefined") {
            return defaultValue;
        }
        try {
            return JSON.parse(jsonValue);
        } catch (e) {
            console.error(`Failed to parse JSON for key "${key}"`, e);
            return defaultValue;
        }
    }

    async setArray(key, value) {
        await this.setObject(key, value);
    }

    async getArray(key, defaultValue = []) {
        return await this.getObject(key, defaultValue);
    }

    async setString(key, value) {
        await this.set(key, value);
    }

    async getString(key, defaultValue = null) {
        const value = await this.get(key);
        return value == null ? defaultValue : String(value);
    }

    async setNumber(key, value) {
        await this.set(key, value);
    }

    async getNumber(key, defaultValue = null) {
        const value = await this.get(key);
        return value == null || isNaN(Number(value)) ? defaultValue : Number(value);
    }

    async setEnum(key, value) {
        await this.set(key, value);
    }

    async getEnum(key, defaultValue = null) {
        const value = await this.get(key);
        return value == null ? defaultValue : value;
    }
}

export const storage = new BackgroundStorage();
