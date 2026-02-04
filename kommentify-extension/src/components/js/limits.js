import { state, elements } from './state.js';
import { showNotification, API_CONFIG } from './utils.js';

/**
 * Check if daily limit is reached for a specific action type
 * @param {string} actionType - 'comments', 'likes', 'shares', 'follows', 'connections'
 * @returns {Object} { canProceed: boolean, used: number, limit: number, remaining: number }
 */
export async function checkDailyLimit(actionType) {
    try {
        const storage = await chrome.storage.local.get(['dailyLimits', 'engagementStatistics']);
        const dailyLimits = storage.dailyLimits || {
            comments: 30,
            likes: 60,
            shares: 15,
            follows: 30,
            connections: 50
        };
        
        // Get today's usage
        const now = new Date();
        const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const todayStats = storage.engagementStatistics?.dailyStats?.[dateKey] || {};
        
        const limit = dailyLimits[actionType] || 999;
        const used = todayStats[actionType] || 0;
        const remaining = Math.max(0, limit - used);
        const canProceed = used < limit;
        
        console.log(`📊 LIMITS: ${actionType} - Used: ${used}/${limit}, Remaining: ${remaining}, Can proceed: ${canProceed}`);
        
        return { canProceed, used, limit, remaining };
    } catch (error) {
        console.error('Error checking daily limit:', error);
        return { canProceed: true, used: 0, limit: 999, remaining: 999 };
    }
}

/**
 * Check all daily limits and return status
 * @returns {Object} Status of all limits
 */
export async function checkAllDailyLimits() {
    const comments = await checkDailyLimit('comments');
    const likes = await checkDailyLimit('likes');
    const shares = await checkDailyLimit('shares');
    const follows = await checkDailyLimit('follows');
    const connections = await checkDailyLimit('connections');
    
    return {
        comments,
        likes,
        shares,
        follows,
        connections,
        anyLimitReached: !comments.canProceed || !likes.canProceed || !shares.canProceed || !follows.canProceed || !connections.canProceed
    };
}

/**
 * Get remaining actions before limits are reached
 * @returns {Object} Remaining counts for each action type
 */
export async function getRemainingActions() {
    const limits = await checkAllDailyLimits();
    return {
        comments: limits.comments.remaining,
        likes: limits.likes.remaining,
        shares: limits.shares.remaining,
        follows: limits.follows.remaining,
        connections: limits.connections.remaining
    };
}

// Track usage before performing action
export async function trackUsageBeforeAction(actionType) {
    try {
        const storage = await chrome.storage.local.get(['authToken', 'apiBaseUrl', 'userData']);
        const token = storage.authToken;
        const apiUrl = storage.apiBaseUrl || API_CONFIG.BASE_URL;

        if (!token) {
            showNotification('❌ Please login to use this feature', 'error');
            throw new Error('Please login to use this feature');
        }

        // Check if user has required plan for this action
        const userData = storage.userData || {};
        const userPlan = userData.plan || { name: 'Free' };

        const planRestrictions = {
            'Free': { aiContent: false, scheduling: false, analytics: false },
            'Pro': { aiContent: true, scheduling: true, analytics: false },
            'Enterprise': { aiContent: true, scheduling: true, analytics: true }
        };

        const userRestrictions = planRestrictions[userPlan.name] || planRestrictions['Free'];

        // Check feature restrictions
        if (actionType === 'ai_post' && !userRestrictions.aiContent) {
            showNotification('⬆️ Upgrade to Pro plan for AI content generation', 'warning');
            if (elements.planModal) elements.planModal.style.display = 'flex';
            throw new Error('Feature not available in current plan');
        }

        if (actionType === 'schedule' && !userRestrictions.scheduling) {
            showNotification('⬆️ Upgrade to Pro plan for post scheduling', 'warning');
            if (elements.planModal) elements.planModal.style.display = 'flex';
            throw new Error('Feature not available in current plan');
        }

        // Track usage with backend
        const response = await fetch(`${apiUrl}/api/usage/track`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ actionType })
        });

        if (!response.ok) {
            throw new Error('Usage tracking failed');
        }

        const data = await response.json();

        if (!data.success) {
            if (data.error && data.error.includes('limit')) {
                showNotification('⬆️ Daily limit reached! Upgrade for higher limits', 'warning');
                if (elements.planModal) elements.planModal.style.display = 'flex';
            }
            throw new Error(data.error || 'Usage limit exceeded');
        }

        return data;
    } catch (error) {
        console.error('Usage tracking error:', error);
        throw error;
    }
}

export async function loadDailyLimits() {
    try {
        console.log('⚙️ LIMITS: Loading daily limits...');

        // Get auth token
        const storage = await chrome.storage.local.get(['authToken', 'apiBaseUrl', 'accountType', 'accountLimits', 'commentDelay']);
        const token = storage.authToken;
        const apiUrl = storage.apiBaseUrl || API_CONFIG.BASE_URL;

        const accountType = storage.accountType || 'matured';
        const accountLimits = storage.accountLimits || { comments: 150, likes: Infinity, shares: Infinity, follows: Infinity };
        const commentDelay = storage.commentDelay || { base: 180, randomMin: 1, randomMax: 60 };

        // Set dropdown values
        if (elements.accountType) elements.accountType.value = accountType;
        if (elements.commentDelay) {
            elements.commentDelay.value = commentDelay.base.toString();
        }

        let counts = { comments: 0, likes: 0, shares: 0, follows: 0 };
        let limits = accountLimits;

        if (token) {
            try {
                // Fetch daily usage from backend
                const response = await fetch(`${apiUrl}/api/usage/daily`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        counts = data.usage || counts;
                        // Backend limits might be different from local accountLimits preference
                        // We can display backend limits or local preference. 
                        // The UI seems to want to show "Limit: X". 
                        // Let's use the backend limits if available as they are the hard limits.
                        if (data.limits) {
                            limits = data.limits;
                        }
                    }
                }
            } catch (apiError) {
                console.error('Error fetching limits from API:', apiError);
            }
        } else {
            // Fallback to local storage if not logged in (legacy support or just show zeros)
            const localData = await chrome.storage.local.get('dailyCounts');
            if (localData.dailyCounts) {
                counts = localData.dailyCounts;
            }
        }

        // Update limits display - show AI comments instead of normal comments
        const aiCommentsUsed = counts.aiComments || 0;
        const aiCommentsLimit = limits.aiComments || 0;
        const bonusAiComments = counts.bonusAiComments || 0;
        const totalAiCommentsAvailable = aiCommentsLimit + bonusAiComments;

        if (elements.limitComments) elements.limitComments.textContent = `${aiCommentsUsed}/${totalAiCommentsAvailable}`;
        if (elements.limitLikes) elements.limitLikes.textContent = `${counts.likes}/${limits.likes === Infinity ? '∞' : limits.likes}`;
        if (elements.limitShares) elements.limitShares.textContent = `${counts.shares}/${limits.shares === Infinity ? '∞' : limits.shares}`;
        if (elements.limitFollows) elements.limitFollows.textContent = `${counts.follows}/${limits.follows === Infinity ? '∞' : limits.follows}`;

    } catch (error) {
        console.error('Error loading limits:', error);
    }
}

// --- LIMITS SETTINGS FUNCTIONS ---

/**
 * Update random interval display for dropdowns
 */
export function updateRandomIntervalDisplay(selectId) {
    const select = document.getElementById(selectId);
    const displayId = `${selectId}-display`;
    const display = document.getElementById(displayId);
    
    if (!select || !display) return;
    
    const value = parseInt(select.value);
    
    if (value === 0) {
        display.textContent = 'Off';
    } else if (value < 60) {
        display.textContent = `${value}s`;
    } else {
        const minutes = Math.floor(value / 60);
        display.textContent = `${minutes}m`;
    }
}

/**
 * Get random delay to add to actions based on random interval settings
 * @returns {Promise<number>} Random delay in seconds to add
 */
export async function getRandomIntervalDelay() {
    try {
        const storage = await chrome.storage.local.get('randomIntervalSettings');
        const settings = storage.randomIntervalSettings || { minInterval: 0, maxInterval: 0 };
        
        const min = parseInt(settings.minInterval) || 0;
        const max = parseInt(settings.maxInterval) || 0;
        
        if (min === 0 && max === 0) {
            return 0; // Disabled
        }
        
        // Ensure min <= max
        const actualMin = Math.min(min, max);
        const actualMax = Math.max(min, max);
        
        // Generate random delay between min and max
        const randomDelay = Math.floor(Math.random() * (actualMax - actualMin + 1)) + actualMin;
        
        console.log(`🎲 Random interval: ${randomDelay}s (range: ${actualMin}s - ${actualMax}s)`);
        
        return randomDelay;
    } catch (error) {
        console.error('Error getting random interval delay:', error);
        return 0;
    }
}

/**
 * Get delay with random interval added
 * @param {number} baseDelay - Base delay in seconds
 * @returns {Promise<number>} Total delay with random interval added
 */
export async function getDelayWithRandomInterval(baseDelay) {
    const randomDelay = await getRandomIntervalDelay();
    const totalDelay = baseDelay + randomDelay;
    
    if (randomDelay > 0) {
        console.log(`⏱️ Total delay: ${totalDelay}s (base: ${baseDelay}s + random: ${randomDelay}s)`);
    }
    
    return totalDelay;
}

/**
 * Update delay display for sliders
 */
export function updateDelayDisplay(sliderId) {
    const slider = document.getElementById(sliderId);
    const display = document.getElementById(`${sliderId}-display`);

    if (!slider || !display) return;

    const value = parseInt(slider.value);

    // Format display based on value
    if (value < 60) {
        display.textContent = `${value}s`;
    } else if (value < 3600) {
        const minutes = Math.floor(value / 60);
        const seconds = value % 60;
        display.textContent = seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
    } else {
        const hours = Math.floor(value / 3600);
        const minutes = Math.floor((value % 3600) / 60);
        display.textContent = minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
}

/**
 * Load limits settings from storage
 */
export async function loadLimitsSettings() {
    try {
        console.log('⚙️ LIMITS: Loading limits settings...');

        const result = await chrome.storage.local.get([
            'delaySettings',
            'automationPreferences',
            'humanSimulation',
            'dailyLimits',
            'randomIntervalSettings',
            'user',
            'limitsPresetApplied'
        ]);
        
        // Apply default preset for new users if not already applied
        if (!result.limitsPresetApplied) {
            console.log('⚙️ LIMITS: First time user - applying default matured-safe preset');
            // Mark as applied to avoid reapplying on every load
            await chrome.storage.local.set({ limitsPresetApplied: true, accountPreset: 'matured-safe' });
            // Apply the preset after a short delay to ensure DOM is ready
            setTimeout(() => {
                const accountTypeSelect = document.getElementById('account-type');
                if (accountTypeSelect) {
                    accountTypeSelect.value = 'matured-safe';
                }
                applyAccountPreset('matured-safe');
            }, 100);
        } else {
            // Load saved preset selection
            const savedPreset = await chrome.storage.local.get('accountPreset');
            if (savedPreset.accountPreset) {
                const accountTypeSelect = document.getElementById('account-type');
                if (accountTypeSelect) {
                    accountTypeSelect.value = savedPreset.accountPreset;
                }
            }
        }

        const delaySettings = result.delaySettings || {
            automationStartDelay: 0,
            networkingStartDelay: 0,
            searchMinDelay: 30,
            searchMaxDelay: 60,
            commentMinDelay: 60,
            commentMaxDelay: 180,
            networkingMinDelay: 30,
            networkingMaxDelay: 60,
            beforeOpeningPostsDelay: 5,
            postPageLoadDelay: 3,
            beforeLikeDelay: 2,
            beforeCommentDelay: 3,
            beforeShareDelay: 2,
            beforeFollowDelay: 2,
            postWriterPageLoadDelay: 3,
            postWriterClickDelay: 2,
            postWriterTypingDelay: 2,
            postWriterSubmitDelay: 3
        };

        const automationPreferences = result.automationPreferences || {
            openSearchInWindow: true
        };

        const humanSimulation = result.humanSimulation || {
            mouseMovement: true,
            scrolling: true,
            readingPause: true
        };

        // Set starting delays
        const automationStartDelay = document.getElementById('automation-start-delay');
        if (automationStartDelay) automationStartDelay.value = delaySettings.automationStartDelay;

        const networkingStartDelay = document.getElementById('networking-start-delay');
        if (networkingStartDelay) networkingStartDelay.value = delaySettings.networkingStartDelay;

        const importStartDelay = document.getElementById('import-start-delay');
        if (importStartDelay) importStartDelay.value = delaySettings.importStartDelay;

        // Set delay sliders
        const searchDelayMin = document.getElementById('search-delay-min');
        if (searchDelayMin) searchDelayMin.value = delaySettings.searchMinDelay;

        const searchDelayMax = document.getElementById('search-delay-max');
        if (searchDelayMax) searchDelayMax.value = delaySettings.searchMaxDelay;

        const commentDelayMin = document.getElementById('comment-delay-min');
        if (commentDelayMin) commentDelayMin.value = delaySettings.commentMinDelay;

        const commentDelayMax = document.getElementById('comment-delay-max');
        if (commentDelayMax) commentDelayMax.value = delaySettings.commentMaxDelay;

        const networkingDelayMin = document.getElementById('networking-delay-min');
        if (networkingDelayMin) networkingDelayMin.value = delaySettings.networkingMinDelay;

        const networkingDelayMax = document.getElementById('networking-delay-max');
        if (networkingDelayMax) networkingDelayMax.value = delaySettings.networkingMaxDelay;

        // Set post action delays
        const beforeOpeningPostsDelay = document.getElementById('before-opening-posts-delay');
        if (beforeOpeningPostsDelay) beforeOpeningPostsDelay.value = delaySettings.beforeOpeningPostsDelay;

        const postPageLoadDelay = document.getElementById('post-page-load-delay');
        if (postPageLoadDelay) postPageLoadDelay.value = delaySettings.postPageLoadDelay;

        const beforeLikeDelay = document.getElementById('before-like-delay');
        if (beforeLikeDelay) beforeLikeDelay.value = delaySettings.beforeLikeDelay;

        const beforeCommentDelay = document.getElementById('before-comment-delay');
        if (beforeCommentDelay) beforeCommentDelay.value = delaySettings.beforeCommentDelay;

        const beforeShareDelay = document.getElementById('before-share-delay');
        if (beforeShareDelay) beforeShareDelay.value = delaySettings.beforeShareDelay;

        const beforeFollowDelay = document.getElementById('before-follow-delay');
        if (beforeFollowDelay) beforeFollowDelay.value = delaySettings.beforeFollowDelay;

        // Set post writer delays
        const postWriterPageLoadDelay = document.getElementById('post-writer-page-load-delay');
        if (postWriterPageLoadDelay) postWriterPageLoadDelay.value = delaySettings.postWriterPageLoadDelay;

        const postWriterClickDelay = document.getElementById('post-writer-click-delay');
        if (postWriterClickDelay) postWriterClickDelay.value = delaySettings.postWriterClickDelay;

        const postWriterTypingDelay = document.getElementById('post-writer-typing-delay');
        if (postWriterTypingDelay) postWriterTypingDelay.value = delaySettings.postWriterTypingDelay;

        const postWriterSubmitDelay = document.getElementById('post-writer-submit-delay');
        if (postWriterSubmitDelay) postWriterSubmitDelay.value = delaySettings.postWriterSubmitDelay;

        // Update displays for all delay sliders
        updateDelayDisplay('search-delay-min');
        updateDelayDisplay('search-delay-max');
        updateDelayDisplay('comment-delay-min');
        updateDelayDisplay('comment-delay-max');
        updateDelayDisplay('networking-delay-min');
        updateDelayDisplay('networking-delay-max');
        updateDelayDisplay('automation-start-delay');
        updateDelayDisplay('networking-start-delay');
        updateDelayDisplay('import-start-delay');
        updateDelayDisplay('post-writer-page-load-delay');
        updateDelayDisplay('post-writer-click-delay');
        updateDelayDisplay('post-writer-typing-delay');
        updateDelayDisplay('post-writer-submit-delay');
        updateDelayDisplay('before-opening-posts-delay');
        updateDelayDisplay('post-page-load-delay');
        updateDelayDisplay('before-like-delay');
        updateDelayDisplay('before-comment-delay');
        updateDelayDisplay('before-share-delay');
        updateDelayDisplay('before-follow-delay');
        
        // Update daily limit displays
        const dailyLimitInputs = ['daily-comment-limit-input', 'daily-like-limit-input', 'daily-share-limit-input', 'daily-follow-limit-input'];
        dailyLimitInputs.forEach(id => {
            const slider = document.getElementById(id);
            const displayId = id.replace('-input', '-display');
            const display = document.getElementById(displayId);
            if (slider && display) {
                display.textContent = slider.value;
            }
        });

        // Set automation preferences
        const openSearchInWindow = document.getElementById('open-search-in-window');
        if (openSearchInWindow) openSearchInWindow.checked = automationPreferences.openSearchInWindow;

        // Set human simulation
        const humanMouseMovement = document.getElementById('human-mouse-movement');
        if (humanMouseMovement) humanMouseMovement.checked = humanSimulation.mouseMovement;

        const humanScrolling = document.getElementById('human-scrolling');
        if (humanScrolling) humanScrolling.checked = humanSimulation.scrolling;

        const humanReadingPause = document.getElementById('human-reading-pause');
        if (humanReadingPause) humanReadingPause.checked = humanSimulation.readingPause;

        // Set random interval settings
        const randomIntervalSettings = result.randomIntervalSettings || {
            minInterval: 30,
            maxInterval: 60
        };

        const randomIntervalMin = document.getElementById('random-interval-min');
        if (randomIntervalMin) {
            randomIntervalMin.value = randomIntervalSettings.minInterval;
            updateRandomIntervalDisplay('random-interval-min');
        }

        const randomIntervalMax = document.getElementById('random-interval-max');
        if (randomIntervalMax) {
            randomIntervalMax.value = randomIntervalSettings.maxInterval;
            updateRandomIntervalDisplay('random-interval-max');
        }

        // Set daily limits
        const dailyLimits = result.dailyLimits || {
            comments: 50,
            likes: 100,
            shares: 20,
            follows: 50
        };

        const dailyCommentLimitInput = document.getElementById('daily-comment-limit-input');
        if (dailyCommentLimitInput) dailyCommentLimitInput.value = dailyLimits.comments;

        const dailyLikeLimitInput = document.getElementById('daily-like-limit-input');
        if (dailyLikeLimitInput) dailyLikeLimitInput.value = dailyLimits.likes;

        const dailyShareLimitInput = document.getElementById('daily-share-limit-input');
        if (dailyShareLimitInput) dailyShareLimitInput.value = dailyLimits.shares;

        const dailyFollowLimitInput = document.getElementById('daily-follow-limit-input');
        if (dailyFollowLimitInput) dailyFollowLimitInput.value = dailyLimits.follows;

        // Apply plan limit validation after setting values
        await applyPlanLimitValidation();

        console.log('✅ LIMITS: Settings loaded successfully');

    } catch (error) {
        console.error('❌ LIMITS: Error loading settings:', error);
    }
}

/**
 * Apply plan limit validation by fetching current user plan limits
 */
async function applyPlanLimitValidation() {
    try {
        const storage = await chrome.storage.local.get(['authToken', 'apiBaseUrl', 'userData']);
        const token = storage.authToken;
        const apiUrl = storage.apiBaseUrl || API_CONFIG.BASE_URL;
        const userData = storage.userData;

        if (!token || !userData) {
            console.log('LIMITS: No auth data, skipping plan validation');
            return;
        }

        // Fetch current plan limits from backend
        const response = await fetch(`${apiUrl}/api/usage/daily`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success && data.limits) {
                // Update plan limit displays
                const maxCommentsSpan = document.getElementById('max-comments-plan');
                if (maxCommentsSpan) maxCommentsSpan.textContent = data.limits.comments || 50;
                
                const maxLikesSpan = document.getElementById('max-likes-plan');
                if (maxLikesSpan) maxLikesSpan.textContent = data.limits.likes || 100;
                
                const maxSharesSpan = document.getElementById('max-shares-plan');
                if (maxSharesSpan) maxSharesSpan.textContent = data.limits.shares || 20;
                
                const maxFollowsSpan = document.getElementById('max-follows-plan');
                if (maxFollowsSpan) maxFollowsSpan.textContent = data.limits.follows || 50;
                
                console.log('✅ LIMITS: Plan limits updated:', data.limits);
                
                // Call the plan limit enforcement directly
                window.enforcePlanLimitsGlobal?.(data.limits);
            }
        }
    } catch (error) {
        console.error('LIMITS: Error applying plan validation:', error);
    }
}

/**
 * Save limits settings to storage
 */
export async function saveLimitsSettings() {
    try {
        console.log('💾 LIMITS: Saving limits settings...');

        const delaySettings = {
            automationStartDelay: parseInt(document.getElementById('automation-start-delay').value) || 0,
            networkingStartDelay: parseInt(document.getElementById('networking-start-delay').value) || 0,
            importStartDelay: parseInt(document.getElementById('import-start-delay').value) || 0,
            searchMinDelay: parseInt(document.getElementById('search-delay-min').value) || 30,
            searchMaxDelay: parseInt(document.getElementById('search-delay-max').value) || 60,
            commentMinDelay: parseInt(document.getElementById('comment-delay-min').value) || 60,
            commentMaxDelay: parseInt(document.getElementById('comment-delay-max').value) || 180,
            networkingMinDelay: parseInt(document.getElementById('networking-delay-min').value) || 30,
            networkingMaxDelay: parseInt(document.getElementById('networking-delay-max').value) || 60,
            beforeOpeningPostsDelay: parseInt(document.getElementById('before-opening-posts-delay').value) || 5,
            postPageLoadDelay: parseInt(document.getElementById('post-page-load-delay').value) || 3,
            beforeLikeDelay: parseInt(document.getElementById('before-like-delay').value) || 2,
            beforeCommentDelay: parseInt(document.getElementById('before-comment-delay').value) || 3,
            beforeShareDelay: parseInt(document.getElementById('before-share-delay').value) || 2,
            beforeFollowDelay: parseInt(document.getElementById('before-follow-delay').value) || 2,
            postWriterPageLoadDelay: parseInt(document.getElementById('post-writer-page-load-delay').value) || 3,
            postWriterClickDelay: parseInt(document.getElementById('post-writer-click-delay').value) || 2,
            postWriterTypingDelay: parseInt(document.getElementById('post-writer-typing-delay').value) || 2,
            postWriterSubmitDelay: parseInt(document.getElementById('post-writer-submit-delay').value) || 3
        };

        const automationPreferences = {
            openSearchInWindow: document.getElementById('open-search-in-window').checked
        };

        const humanSimulation = {
            mouseMovement: document.getElementById('human-mouse-movement').checked,
            scrolling: document.getElementById('human-scrolling').checked,
            readingPause: document.getElementById('human-reading-pause').checked
        };

        const dailyLimits = {
            comments: parseInt(document.getElementById('daily-comment-limit-input').value) || 50,
            likes: parseInt(document.getElementById('daily-like-limit-input').value) || 100,
            shares: parseInt(document.getElementById('daily-share-limit-input').value) || 20,
            follows: parseInt(document.getElementById('daily-follow-limit-input').value) || 50
        };

        const randomIntervalSettings = {
            minInterval: parseInt(document.getElementById('random-interval-min')?.value) || 30,
            maxInterval: parseInt(document.getElementById('random-interval-max')?.value) || 60
        };

        await chrome.storage.local.set({
            delaySettings,
            automationPreferences,
            humanSimulation,
            dailyLimits,
            randomIntervalSettings
        });

        // Settings saved silently (removed annoying popup)

    } catch (error) {
        console.error('❌ LIMITS: Error saving settings:', error);
        alert('Error saving settings');
    }
}

/**
 * Account Type Presets - LinkedIn-safe automation limits
 * Optimized for safety while minimizing user wait time
 */
const ACCOUNT_PRESETS = {
    'your-choice': null, // User's custom settings - don't change anything
    
    'new-conservative': {
        // For brand new accounts (0-2 weeks old) - Very cautious to build trust
        dailyLimits: { comments: 5, likes: 15, shares: 3, follows: 8 },
        startingDelays: { automation: 60, networking: 60, import: 60 },
        postWriterDelays: { pageLoad: 20, click: 12, typing: 15, submit: 10 },
        automationDelays: { searchMin: 180, searchMax: 300, commentMin: 240, commentMax: 420 },
        networkingDelays: { min: 120, max: 180 },
        postActionDelays: { opening: 20, page: 15, like: 12, comment: 18, share: 15, follow: 12 }
    },
    
    'new-moderate': {
        // For newer accounts (2-8 weeks old) - Building activity gradually
        dailyLimits: { comments: 15, likes: 35, shares: 8, follows: 18 },
        startingDelays: { automation: 45, networking: 45, import: 45 },
        postWriterDelays: { pageLoad: 18, click: 10, typing: 12, submit: 8 },
        automationDelays: { searchMin: 120, searchMax: 240, commentMin: 180, commentMax: 360 },
        networkingDelays: { min: 90, max: 150 },
        postActionDelays: { opening: 18, page: 12, like: 10, comment: 15, share: 12, follow: 10 }
    },
    
    'matured-safe': {
        // For established accounts (3+ months) - Safe daily use with human-like delays
        dailyLimits: { comments: 30, likes: 60, shares: 15, follows: 30 },
        startingDelays: { automation: 30, networking: 30, import: 30 },
        postWriterDelays: { pageLoad: 15, click: 8, typing: 10, submit: 8 },
        automationDelays: { searchMin: 90, searchMax: 180, commentMin: 120, commentMax: 300 },
        networkingDelays: { min: 60, max: 120 },
        postActionDelays: { opening: 15, page: 10, like: 8, comment: 12, share: 10, follow: 8 }
    },
    
    'matured-aggressive': {
        // For mature accounts (6+ months) - Higher activity, still safe
        dailyLimits: { comments: 50, likes: 100, shares: 25, follows: 50 },
        startingDelays: { automation: 20, networking: 20, import: 20 },
        postWriterDelays: { pageLoad: 12, click: 6, typing: 8, submit: 5 },
        automationDelays: { searchMin: 60, searchMax: 120, commentMin: 90, commentMax: 180 },
        networkingDelays: { min: 45, max: 90 },
        postActionDelays: { opening: 12, page: 8, like: 6, comment: 10, share: 8, follow: 6 }
    },
    
    'premium-user': {
        // For LinkedIn Premium users - Higher limits expected
        dailyLimits: { comments: 60, likes: 120, shares: 30, follows: 60 },
        startingDelays: { automation: 15, networking: 15, import: 15 },
        postWriterDelays: { pageLoad: 10, click: 5, typing: 6, submit: 4 },
        automationDelays: { searchMin: 45, searchMax: 90, commentMin: 75, commentMax: 150 },
        networkingDelays: { min: 40, max: 75 },
        postActionDelays: { opening: 10, page: 6, like: 5, comment: 8, share: 6, follow: 5 }
    },
    
    'sales-navigator': {
        // For Sales Navigator users - Professional high volume
        dailyLimits: { comments: 75, likes: 150, shares: 40, follows: 75 },
        startingDelays: { automation: 10, networking: 10, import: 10 },
        postWriterDelays: { pageLoad: 8, click: 4, typing: 5, submit: 3 },
        automationDelays: { searchMin: 35, searchMax: 75, commentMin: 60, commentMax: 120 },
        networkingDelays: { min: 35, max: 60 },
        postActionDelays: { opening: 8, page: 5, like: 4, comment: 7, share: 5, follow: 4 }
    },
    
    'speed-mode': {
        // Fast processing - Use at your own risk (still with some delay)
        dailyLimits: { comments: 100, likes: 200, shares: 50, follows: 100 },
        startingDelays: { automation: 5, networking: 5, import: 5 },
        postWriterDelays: { pageLoad: 5, click: 3, typing: 3, submit: 2 },
        automationDelays: { searchMin: 25, searchMax: 45, commentMin: 45, commentMax: 90 },
        networkingDelays: { min: 25, max: 45 },
        postActionDelays: { opening: 5, page: 3, like: 3, comment: 5, share: 3, follow: 3 }
    }
};

/**
 * Apply account type preset to all limit and delay sliders
 */
export function applyAccountPreset(presetType) {
    const preset = ACCOUNT_PRESETS[presetType];
    
    // Save the selected preset
    chrome.storage.local.set({ accountPreset: presetType });
    
    if (!preset) {
        // "Your Choice" selected - don't change anything
        console.log('Custom preset selected - keeping user values');
        return;
    }
    
    console.log(`Applying preset: ${presetType}`, preset);
    
    // Helper function to update slider and display
    const updateSlider = (id, value, displayId) => {
        const slider = document.getElementById(id);
        const display = document.getElementById(displayId);
        if (slider) {
            slider.value = value;
            if (display) {
                display.textContent = value;
            }
            // Trigger display update for formatted values
            updateDelayDisplay(id);
        }
    };
    
    // 1. Update Daily Limits
    if (preset.dailyLimits) {
        updateSlider('daily-comment-limit-input', preset.dailyLimits.comments, 'daily-comment-limit-display');
        updateSlider('daily-like-limit-input', preset.dailyLimits.likes, 'daily-like-limit-display');
        updateSlider('daily-share-limit-input', preset.dailyLimits.shares, 'daily-share-limit-display');
        updateSlider('daily-follow-limit-input', preset.dailyLimits.follows, 'daily-follow-limit-display');
    }
    
    // 2. Update Starting Delays
    if (preset.startingDelays) {
        updateSlider('automation-start-delay', preset.startingDelays.automation, 'automation-start-delay-display');
        updateSlider('networking-start-delay', preset.startingDelays.networking, 'networking-start-delay-display');
        updateSlider('import-start-delay', preset.startingDelays.import, 'import-start-delay-display');
    }
    
    // 3. Update Post Writer Delays
    if (preset.postWriterDelays) {
        updateSlider('post-writer-page-load-delay', preset.postWriterDelays.pageLoad, 'post-writer-page-load-delay-display');
        updateSlider('post-writer-click-delay', preset.postWriterDelays.click, 'post-writer-click-delay-display');
        updateSlider('post-writer-typing-delay', preset.postWriterDelays.typing, 'post-writer-typing-delay-display');
        updateSlider('post-writer-submit-delay', preset.postWriterDelays.submit, 'post-writer-submit-delay-display');
    }
    
    // 4. Update Automation Delay Intervals
    if (preset.automationDelays) {
        updateSlider('search-delay-min', preset.automationDelays.searchMin, 'search-delay-min-display');
        updateSlider('search-delay-max', preset.automationDelays.searchMax, 'search-delay-max-display');
        updateSlider('comment-delay-min', preset.automationDelays.commentMin, 'comment-delay-min-display');
        updateSlider('comment-delay-max', preset.automationDelays.commentMax, 'comment-delay-max-display');
    }
    
    // 5. Update Networking Delay Intervals
    if (preset.networkingDelays) {
        updateSlider('networking-delay-min', preset.networkingDelays.min, 'networking-delay-min-display');
        updateSlider('networking-delay-max', preset.networkingDelays.max, 'networking-delay-max-display');
    }
    
    // 6. Update Post Action Delays
    if (preset.postActionDelays) {
        updateSlider('before-opening-posts-delay', preset.postActionDelays.opening, 'before-opening-posts-delay-display');
        updateSlider('post-page-load-delay', preset.postActionDelays.page, 'post-page-load-delay-display');
        updateSlider('before-like-delay', preset.postActionDelays.like, 'before-like-delay-display');
        updateSlider('before-comment-delay', preset.postActionDelays.comment, 'before-comment-delay-display');
        updateSlider('before-share-delay', preset.postActionDelays.share, 'before-share-delay-display');
        updateSlider('before-follow-delay', preset.postActionDelays.follow, 'before-follow-delay-display');
    }
    
    // Auto-save the new settings
    setTimeout(() => {
        saveLimitsSettings();
    }, 300);
}
