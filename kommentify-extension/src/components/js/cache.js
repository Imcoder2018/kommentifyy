// --- INTELLIGENT CACHING SYSTEM --- //
// Cache data for 15 minutes to speed up popup loading

const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

/**
 * Get cached data if still valid
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} Cached data or null if expired
 */
export async function getCachedData(key) {
    try {
        const cacheKey = `cache_${key}`;
        const timestampKey = `cache_${key}_timestamp`;
        
        const result = await chrome.storage.local.get([cacheKey, timestampKey]);
        
        if (!result[cacheKey] || !result[timestampKey]) {
            return null; // No cache
        }
        
        const now = Date.now();
        const cacheAge = now - result[timestampKey];
        
        if (cacheAge > CACHE_DURATION) {
            // Cache expired
            console.log(`\u23f0 Cache expired for ${key} (age: ${Math.round(cacheAge / 1000)}s)`);
            return null;
        }
        
        console.log(`\u2705 Using cached ${key} (age: ${Math.round(cacheAge / 1000)}s)`);
        return result[cacheKey];
    } catch (error) {
        console.error(`Error getting cached data for ${key}:`, error);
        return null;
    }
}

/**
 * Set cached data with timestamp
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 */
export async function setCachedData(key, data) {
    try {
        const cacheKey = `cache_${key}`;
        const timestampKey = `cache_${key}_timestamp`;
        
        await chrome.storage.local.set({
            [cacheKey]: data,
            [timestampKey]: Date.now()
        });
        
        console.log(`\ud83d\udcbe Cached ${key}`);
    } catch (error) {
        console.error(`Error setting cached data for ${key}:`, error);
    }
}

/**
 * Clear specific cache
 * @param {string} key - Cache key to clear
 */
export async function clearCache(key) {
    try {
        const cacheKey = `cache_${key}`;
        const timestampKey = `cache_${key}_timestamp`;
        
        await chrome.storage.local.remove([cacheKey, timestampKey]);
        console.log(`\ud83d\uddd1\ufe0f Cleared cache for ${key}`);
    } catch (error) {
        console.error(`Error clearing cache for ${key}:`, error);
    }
}

/**
 * Clear all caches
 */
export async function clearAllCaches() {
    try {
        const allData = await chrome.storage.local.get(null);
        const cacheKeys = Object.keys(allData).filter(k => k.startsWith('cache_'));
        
        if (cacheKeys.length > 0) {
            await chrome.storage.local.remove(cacheKeys);
            console.log(`\ud83d\uddd1\ufe0f Cleared ${cacheKeys.length / 2} caches`);
        }
    } catch (error) {
        console.error('Error clearing all caches:', error);
    }
}

/**
 * Get cache info
 */
export async function getCacheInfo() {
    try {
        const allData = await chrome.storage.local.get(null);
        const cacheEntries = {};
        
        Object.keys(allData).forEach(key => {
            if (key.startsWith('cache_') && key.endsWith('_timestamp')) {
                const dataKey = key.replace('_timestamp', '');
                const cacheName = dataKey.replace('cache_', '');
                const age = Date.now() - allData[key];
                const ageMinutes = Math.round(age / 60000);
                const isExpired = age > CACHE_DURATION;
                
                cacheEntries[cacheName] = {
                    age: ageMinutes,
                    expired: isExpired,
                    timestamp: allData[key]
                };
            }
        });
        
        return cacheEntries;
    } catch (error) {
        console.error('Error getting cache info:', error);
        return {};
    }
}

// Export cache duration for reference
export { CACHE_DURATION };
