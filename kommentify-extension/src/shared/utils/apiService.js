/**
 * API SERVICE
 * Handles all communication with the backend API
 */

// API Configuration
const API_CONFIG = {
    // Production Vercel URL
    baseUrl: 'https://kommentify.com',
    endpoints: {
        register: '/api/auth/register',
        login: '/api/auth/login',
        refreshToken: '/api/auth/refresh-token',
        me: '/api/auth/me',
        profile: '/api/auth/profile',
        generatePost: '/api/ai/generate-post',
        generateComment: '/api/ai/generate-comment',
        generateTopics: '/api/ai/generate-topics',
        dailyUsage: '/api/usage/daily',
        trackUsage: '/api/usage/track',
    }
};

/**
 * Get stored auth token
 */
async function getAuthToken() {
    const result = await chrome.storage.local.get('authToken');
    return result.authToken || null;
}

/**
 * Store auth token
 */
async function setAuthToken(token) {
    await chrome.storage.local.set({ authToken: token });
}

/**
 * Get refresh token
 */
async function getRefreshToken() {
    const result = await chrome.storage.local.get('refreshToken');
    return result.refreshToken || null;
}

/**
 * Store refresh token
 */
async function setRefreshToken(token) {
    await chrome.storage.local.set({ refreshToken: token });
}

/**
 * Clear all auth data
 */
async function clearAuth() {
    await chrome.storage.local.remove(['authToken', 'refreshToken', 'userData']);
}

/**
 * Make API request with authentication
 */
async function apiRequest(endpoint, options = {}) {
    const token = await getAuthToken();
    const url = `${API_CONFIG.baseUrl}${endpoint}`;
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });
        
        const data = await response.json();
        
        // Handle token expiration
        if (response.status === 401 && token) {
            // Try to refresh token
            const refreshed = await refreshAuthToken();
            if (refreshed) {
                // Retry the request with new token
                return apiRequest(endpoint, options);
            } else {
                // Refresh failed, clear auth and throw error
                await clearAuth();
                throw new Error('Session expired. Please login again.');
            }
        }
        
        if (!response.ok) {
            throw new Error(data.error || `API error: ${response.status}`);
        }
        
        return data;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

/**
 * Refresh authentication token
 */
async function refreshAuthToken() {
    try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) return false;
        
        const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.refreshToken}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });
        
        if (!response.ok) return false;
        
        const data = await response.json();
        if (data.success && data.token) {
            await setAuthToken(data.token);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Token refresh failed:', error);
        return false;
    }
}

/**
 * Register new user
 */
export async function registerUser(email, password, name) {
    const data = await apiRequest(API_CONFIG.endpoints.register, {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
    });
    
    if (data.success) {
        await setAuthToken(data.token);
        await setRefreshToken(data.refreshToken);
        await chrome.storage.local.set({ userData: data.user });
    }
    
    return data;
}

/**
 * Login user
 */
export async function loginUser(email, password) {
    const data = await apiRequest(API_CONFIG.endpoints.login, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
    
    if (data.success) {
        await setAuthToken(data.token);
        await setRefreshToken(data.refreshToken);
        await chrome.storage.local.set({ userData: data.user });
    }
    
    return data;
}

/**
 * Logout user
 */
export async function logoutUser() {
    await clearAuth();
}

/**
 * Get current user data
 */
export async function getCurrentUser() {
    const result = await chrome.storage.local.get('userData');
    return result.userData || null;
}

/**
 * Check if user is logged in
 */
export async function isLoggedIn() {
    const token = await getAuthToken();
    return !!token;
}

/**
 * Generate LinkedIn post using backend API
 */
export async function generatePost(topic, template, tone, length, includeHashtags, includeEmojis) {
    return await apiRequest(API_CONFIG.endpoints.generatePost, {
        method: 'POST',
        body: JSON.stringify({
            topic,
            template,
            tone,
            length,
            includeHashtags,
            includeEmojis,
        }),
    });
}

/**
 * Generate comment using backend API
 */
export async function generateComment(postText, tone, length) {
    return await apiRequest(API_CONFIG.endpoints.generateComment, {
        method: 'POST',
        body: JSON.stringify({
            postText,
            tone,
            length,
        }),
    });
}

/**
 * Generate topic lines using backend API
 */
export async function generateTopics(topic, count = 8) {
    return await apiRequest(API_CONFIG.endpoints.generateTopics, {
        method: 'POST',
        body: JSON.stringify({
            topic,
            count,
        }),
    });
}

/**
 * Get daily usage and limits
 */
export async function getDailyUsage() {
    return await apiRequest(API_CONFIG.endpoints.dailyUsage, {
        method: 'GET',
    });
}

/**
 * Track usage (increment counters)
 */
export async function trackUsage(actionType) {
    return await apiRequest(API_CONFIG.endpoints.trackUsage, {
        method: 'POST',
        body: JSON.stringify({
            actionType, // 'comment', 'like', 'share', 'follow', 'connection'
        }),
    });
}

/**
 * Check if action is allowed based on daily limits
 */
export async function canPerformAction(actionType) {
    try {
        const usage = await getDailyUsage();
        if (!usage.success) return false;
        
        const actionMap = {
            'comment': { used: usage.usage.comments, limit: usage.limits.comments },
            'like': { used: usage.usage.likes, limit: usage.limits.likes },
            'share': { used: usage.usage.shares, limit: usage.limits.shares },
            'follow': { used: usage.usage.follows, limit: usage.limits.follows },
            'connection': { used: usage.usage.connections, limit: usage.limits.connections },
            'aiPost': { used: usage.usage.aiPosts, limit: usage.limits.aiPosts },
            'aiComment': { used: usage.usage.aiComments, limit: usage.limits.aiComments },
        };
        
        const action = actionMap[actionType];
        if (!action) return true; // Unknown action, allow it
        
        return action.used < action.limit;
    } catch (error) {
        console.error('Error checking action limit:', error);
        return true; // On error, allow the action
    }
}

/**
 * Get feature availability based on user's plan
 */
export async function getFeatureAvailability() {
    try {
        const usage = await getDailyUsage();
        return usage.success ? usage.features : null;
    } catch (error) {
        console.error('Error getting features:', error);
        return null;
    }
}

/**
 * Update API base URL (for production deployment)
 */
export function updateApiBaseUrl(newUrl) {
    API_CONFIG.baseUrl = newUrl;
    chrome.storage.local.set({ apiBaseUrl: newUrl });
}

/**
 * Load API base URL from storage
 */
export async function loadApiBaseUrl() {
    const result = await chrome.storage.local.get('apiBaseUrl');
    if (result.apiBaseUrl) {
        API_CONFIG.baseUrl = result.apiBaseUrl;
    }
}

// Load API URL on initialization
loadApiBaseUrl();
