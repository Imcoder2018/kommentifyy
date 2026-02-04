/**
 * Limit Checker Utility
 * Enforces daily limits across all automation features
 * Shows popup when limits are reached
 */

/**
 * Check if a specific action type limit has been reached
 * @param {string} actionType - 'comment', 'like', 'share', or 'follow'
 * @returns {Promise<{allowed: boolean, current: number, limit: number, remaining: number}>}
 */
export async function checkDailyLimit(actionType) {
    try {
        const result = await chrome.storage.local.get(['dailyLimits', 'dailyCounts']);
        
        const dailyLimits = result.dailyLimits || {
            comments: 30,
            likes: 60,
            shares: 15,
            follows: 30
        };
        
        // Get today's date key
        const today = new Date().toISOString().split('T')[0];
        const dailyCounts = result.dailyCounts || {};
        
        // Reset counts if it's a new day
        if (dailyCounts.date !== today) {
            dailyCounts.date = today;
            dailyCounts.comments = 0;
            dailyCounts.likes = 0;
            dailyCounts.shares = 0;
            dailyCounts.follows = 0;
            await chrome.storage.local.set({ dailyCounts });
        }
        
        // Map action type to storage key
        const keyMap = {
            'comment': 'comments',
            'like': 'likes',
            'share': 'shares',
            'follow': 'follows'
        };
        
        const key = keyMap[actionType] || actionType;
        const current = dailyCounts[key] || 0;
        const limit = dailyLimits[key] || Infinity;
        const remaining = Math.max(0, limit - current);
        const allowed = current < limit;
        
        return { allowed, current, limit, remaining };
    } catch (error) {
        console.error('Error checking daily limit:', error);
        return { allowed: true, current: 0, limit: Infinity, remaining: Infinity };
    }
}

/**
 * Increment daily count for an action type
 * @param {string} actionType - 'comment', 'like', 'share', or 'follow'
 * @returns {Promise<{success: boolean, newCount: number}>}
 */
export async function incrementDailyCount(actionType) {
    try {
        const result = await chrome.storage.local.get(['dailyCounts']);
        
        const today = new Date().toISOString().split('T')[0];
        let dailyCounts = result.dailyCounts || {};
        
        // Reset counts if it's a new day
        if (dailyCounts.date !== today) {
            dailyCounts = {
                date: today,
                comments: 0,
                likes: 0,
                shares: 0,
                follows: 0
            };
        }
        
        const keyMap = {
            'comment': 'comments',
            'like': 'likes',
            'share': 'shares',
            'follow': 'follows'
        };
        
        const key = keyMap[actionType] || actionType;
        dailyCounts[key] = (dailyCounts[key] || 0) + 1;
        
        await chrome.storage.local.set({ dailyCounts });
        
        return { success: true, newCount: dailyCounts[key] };
    } catch (error) {
        console.error('Error incrementing daily count:', error);
        return { success: false, newCount: 0 };
    }
}

/**
 * Check if any limit will be exceeded for multiple actions
 * @param {Object} actions - {comment: true, like: true, share: false, follow: false}
 * @returns {Promise<{allowed: boolean, exceeded: string[]}>}
 */
export async function checkMultipleActions(actions) {
    const exceeded = [];
    
    for (const [actionType, enabled] of Object.entries(actions)) {
        if (enabled) {
            const check = await checkDailyLimit(actionType);
            if (!check.allowed) {
                exceeded.push(actionType);
            }
        }
    }
    
    return {
        allowed: exceeded.length === 0,
        exceeded
    };
}

/**
 * Get all current daily counts and limits
 * @returns {Promise<{counts: Object, limits: Object}>}
 */
export async function getDailyStatus() {
    try {
        const result = await chrome.storage.local.get(['dailyLimits', 'dailyCounts']);
        
        const dailyLimits = result.dailyLimits || {
            comments: 30,
            likes: 60,
            shares: 15,
            follows: 30
        };
        
        const today = new Date().toISOString().split('T')[0];
        let dailyCounts = result.dailyCounts || {};
        
        // Reset counts if it's a new day
        if (dailyCounts.date !== today) {
            dailyCounts = {
                date: today,
                comments: 0,
                likes: 0,
                shares: 0,
                follows: 0
            };
        }
        
        return {
            counts: {
                comments: dailyCounts.comments || 0,
                likes: dailyCounts.likes || 0,
                shares: dailyCounts.shares || 0,
                follows: dailyCounts.follows || 0
            },
            limits: dailyLimits
        };
    } catch (error) {
        console.error('Error getting daily status:', error);
        return {
            counts: { comments: 0, likes: 0, shares: 0, follows: 0 },
            limits: { comments: 30, likes: 60, shares: 15, follows: 30 }
        };
    }
}

/**
 * Show limit reached popup notification
 * @param {string} actionType - The action type that exceeded limit
 * @param {number} limit - The limit that was reached
 */
export function showLimitReachedNotification(actionType, limit) {
    const actionNames = {
        'comment': 'Comments',
        'like': 'Likes',
        'share': 'Shares',
        'follow': 'Follows'
    };
    
    const actionName = actionNames[actionType] || actionType;
    
    // Create popup element
    const popup = document.createElement('div');
    popup.id = 'limit-reached-popup';
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
        color: white;
        padding: 20px 30px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        z-index: 999999;
        text-align: center;
        min-width: 300px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    popup.innerHTML = `
        <div style="font-size: 32px; margin-bottom: 10px;">⚠️</div>
        <div style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">Daily Limit Reached</div>
        <div style="font-size: 14px; margin-bottom: 15px;">
            Your daily ${actionName} limit of <strong>${limit}</strong> has been reached.
        </div>
        <div style="font-size: 12px; opacity: 0.9; margin-bottom: 15px;">
            Limits reset at midnight. You can adjust limits in the Limits tab.
        </div>
        <button id="close-limit-popup" style="
            background: white;
            color: #ee5a5a;
            border: none;
            padding: 10px 25px;
            border-radius: 6px;
            font-weight: bold;
            cursor: pointer;
            font-size: 14px;
        ">Got it</button>
    `;
    
    document.body.appendChild(popup);
    
    // Close button handler
    document.getElementById('close-limit-popup').addEventListener('click', () => {
        popup.remove();
    });
    
    // Auto-close after 5 seconds
    setTimeout(() => {
        if (document.getElementById('limit-reached-popup')) {
            popup.remove();
        }
    }, 5000);
}

/**
 * Get delay settings from storage
 * @returns {Promise<Object>} Delay settings
 */
export async function getDelaySettings() {
    try {
        const result = await chrome.storage.local.get('delaySettings');
        return result.delaySettings || {
            automationStartDelay: 30,
            networkingStartDelay: 30,
            importStartDelay: 10,
            searchMinDelay: 30,
            searchMaxDelay: 60,
            commentMinDelay: 60,
            commentMaxDelay: 120,
            networkingMinDelay: 30,
            networkingMaxDelay: 60,
            beforeOpeningPostsDelay: 4,
            postPageLoadDelay: 3,
            beforeLikeDelay: 2,
            beforeCommentDelay: 3,
            beforeShareDelay: 2,
            beforeFollowDelay: 2,
            postWriterPageLoadDelay: 5,
            postWriterClickDelay: 2,
            postWriterTypingDelay: 2,
            postWriterSubmitDelay: 2
        };
    } catch (error) {
        console.error('Error getting delay settings:', error);
        return {};
    }
}

/**
 * Get a random delay within a range
 * @param {number} min - Minimum delay in seconds
 * @param {number} max - Maximum delay in seconds
 * @returns {number} Random delay in milliseconds
 */
export function getRandomDelay(min, max) {
    return (Math.floor(Math.random() * (max - min + 1)) + min) * 1000;
}

/**
 * Wait for a specified delay
 * @param {number} ms - Delay in milliseconds
 * @returns {Promise<void>}
 */
export function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const limitChecker = {
    checkDailyLimit,
    incrementDailyCount,
    checkMultipleActions,
    getDailyStatus,
    showLimitReachedNotification,
    getDelaySettings,
    getRandomDelay,
    wait
};
