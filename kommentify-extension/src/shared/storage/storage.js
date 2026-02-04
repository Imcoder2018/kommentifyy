/**
 * This is the new Storage module for the "main world" scripts.
 * It does NOT access chrome.storage directly. Instead, it sends a message
 * to the `bridge.js` content script and waits for a response.
 */

function sendMessageToBridge(payload) {
    return new Promise((resolve) => {
        const requestId = Date.now() + Math.random();
        payload.requestId = requestId;

        const listener = (event) => {
            if (event.source === window && event.data.type === `COMMENTRON_STORAGE_RESULT_${requestId}`) {
                window.removeEventListener('message', listener);
                resolve(event.data.data);
            }
        };
        window.addEventListener('message', listener);

        window.postMessage(payload);
    });
}

class Storage {
    async get(key) {
        return await sendMessageToBridge({ type: 'COMMENTRON_GET_STORAGE', key: key });
    }

    async set(key, value) {
        await sendMessageToBridge({ type: 'COMMENTRON_SET_STORAGE', key: key, value: value });
    }

    async remove(key) {
        // Removing is just setting the value to null/undefined
        await this.set(key, null);
    }

    // --- Type-specific Helpers --- //

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
        await this.setObject(key, value); // Arrays are also JSON
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

export const storage = new Storage();