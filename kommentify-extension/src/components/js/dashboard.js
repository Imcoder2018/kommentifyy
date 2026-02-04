import { elements } from './state.js';
import { API_CONFIG } from './utils.js';
import { checkAndShowUpgradePrompts, loadPlans } from './auth.js';
import { showNotification } from './utils.js';

/**
 * Sync local storage statistics to backend API
 * This ensures backend always has the latest local values
 */
export async function syncLocalStatsToBackend() {
    try {
        console.log('📤 DASHBOARD: Syncing local stats to backend...');
        
        const storage = await chrome.storage.local.get([
            'authToken',
            'apiBaseUrl',
            'engagementStatistics'
        ]);
        
        const token = storage.authToken;
        const apiUrl = storage.apiBaseUrl || API_CONFIG.BASE_URL;
        const localStats = storage.engagementStatistics;
        
        if (!token) {
            console.log('⚠️ DASHBOARD: No auth token, skipping sync');
            return false;
        }
        
        if (!localStats || !localStats.dailyStats) {
            console.log('⚠️ DASHBOARD: No local stats to sync');
            return false;
        }
        
        // Get today's date key
        const now = new Date();
        const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        
        // Get today's stats from local storage
        const todayStats = localStats.dailyStats?.[dateKey] || {};
        const localLikes = todayStats.likes || 0;
        const localComments = todayStats.comments || 0;
        const localShares = todayStats.shares || 0;
        const localFollows = todayStats.follows || 0;
        const localConnections = todayStats.connections || 0;
        
        // Also get AI stats if available
        const localAiPosts = todayStats.aiPosts || 0;
        const localAiComments = todayStats.aiComments || 0;
        const localAiTopics = todayStats.aiTopicLines || 0;
        
        console.log('📊 DASHBOARD: Local stats for', dateKey, '-', {
            likes: localLikes,
            comments: localComments,
            shares: localShares,
            follows: localFollows,
            connections: localConnections,
            aiPosts: localAiPosts,
            aiComments: localAiComments,
            aiTopics: localAiTopics
        });
        
        // Sync to backend API - SET the values to match local
        const response = await fetch(`${apiUrl}/api/usage/sync`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                likes: localLikes,
                comments: localComments,
                shares: localShares,
                follows: localFollows,
                connections: localConnections,
                aiPosts: localAiPosts,
                aiComments: localAiComments,
                aiTopicLines: localAiTopics,
                date: dateKey
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ DASHBOARD: Local stats synced to backend successfully', result);
            
            // Save last sync timestamp
            await chrome.storage.local.set({ 
                lastSyncTimestamp: Date.now(),
                lastSyncedStats: {
                    likes: localLikes,
                    comments: localComments,
                    shares: localShares,
                    follows: localFollows,
                    connections: localConnections
                }
            });
            
            return true;
        } else {
            // Silently fail for 405 (Method Not Allowed) - endpoint may not be implemented
            if (response.status !== 405) {
                const errorText = await response.text();
                console.warn('⚠️ DASHBOARD: Sync response not OK:', response.status, errorText);
            }
            return false;
        }
        
    } catch (error) {
        console.error('❌ DASHBOARD: Failed to sync local stats to backend:', error);
        return false;
    }
}

/**
 * Auto-sync stats periodically in background
 * Call this from background script or after major actions
 */
export async function startAutoSync() {
    // Sync immediately
    await syncLocalStatsToBackend();
    
    // Then sync every 5 minutes
    setInterval(async () => {
        console.log('🔄 AUTO-SYNC: Running periodic sync...');
        await syncLocalStatsToBackend();
    }, 5 * 60 * 1000); // 5 minutes
}

// --- ACTIVE WORKINGS FUNCTIONS --- //
export async function updateActiveWorkings() {
    try {
        const storage = await chrome.storage.local.get([
            'bulkProcessingActive',
            'peopleSearchActive',
            'importAutomationActive',
            'importProgress'
        ]);
        
        const activeWorkingsSection = document.getElementById('active-workings-section');
        const activeCommenter = document.getElementById('active-commenter');
        const activeNetworking = document.getElementById('active-networking');
        const activeImport = document.getElementById('active-import');
        
        let hasAnyActive = false;
        
        // Update Commenter
        if (activeCommenter) {
            if (storage.bulkProcessingActive) {
                activeCommenter.style.display = 'block';
                hasAnyActive = true;
            } else {
                activeCommenter.style.display = 'none';
            }
        }
        
        // Update Networking
        if (activeNetworking) {
            if (storage.peopleSearchActive) {
                activeNetworking.style.display = 'block';
                hasAnyActive = true;
            } else {
                activeNetworking.style.display = 'none';
            }
        }
        
        // Update Import
        if (activeImport) {
            if (storage.importAutomationActive) {
                activeImport.style.display = 'block';
                hasAnyActive = true;
                // Update status text
                const statusEl = document.getElementById('active-import-status');
                if (statusEl && storage.importProgress) {
                    statusEl.textContent = `Processing: ${storage.importProgress.current || 0}/${storage.importProgress.total || 0}`;
                }
            } else {
                activeImport.style.display = 'none';
            }
        }
        
        // Show/hide the whole section
        if (activeWorkingsSection) {
            activeWorkingsSection.style.display = hasAnyActive ? 'block' : 'none';
        }
        
    } catch (error) {
        console.error('Failed to update active workings:', error);
    }
}

// Set up dashboard stop button listeners
export function setupDashboardStopButtons() {
    const stopCommenter = document.getElementById('stop-commenter-dashboard');
    const stopNetworking = document.getElementById('stop-networking-dashboard');
    const stopImport = document.getElementById('stop-import-dashboard');
    
    if (stopCommenter) {
        stopCommenter.addEventListener('click', async () => {
            chrome.runtime.sendMessage({ action: 'stopBulkProcessing' }, (response) => {
                if (response && response.success) {
                    showNotification('✅ Bulk commenting stopped', 'success');
                }
            });
            await chrome.storage.local.set({ bulkProcessingActive: false });
            updateActiveWorkings();
        });
    }
    
    if (stopNetworking) {
        stopNetworking.addEventListener('click', async () => {
            chrome.runtime.sendMessage({ action: 'stopPeopleSearch' }, (response) => {
                if (response && response.success) {
                    showNotification('✅ Networking stopped', 'success');
                }
            });
            await chrome.storage.local.set({ peopleSearchActive: false });
            updateActiveWorkings();
        });
    }
    
    if (stopImport) {
        stopImport.addEventListener('click', async () => {
            chrome.runtime.sendMessage({ action: 'stopImportAutomation' }, (response) => {
                if (response && response.success) {
                    showNotification('✅ Import automation stopped', 'success');
                }
            });
            await chrome.storage.local.set({ importAutomationActive: false, importAutomationType: null });
            updateActiveWorkings();
        });
    }
}

// --- DASHBOARD FUNCTIONS --- //
export async function loadDashboard() {
    try {
        console.log('📊 DASHBOARD: Loading stats from local storage...');
        
        // Update active workings display
        updateActiveWorkings();
        const storage = await chrome.storage.local.get(['authToken', 'apiBaseUrl', 'userData', 'engagementStatistics']);
        const token = storage.authToken;
        const apiUrl = storage.apiBaseUrl || API_CONFIG.BASE_URL;
        const localStats = storage.engagementStatistics;
        console.log('📊 DASHBOARD: Local stats:', localStats);

        if (!token) {
            console.error('No auth token found');
            return;
        }
        
        // STEP 1: Show local stats immediately for instant feedback (with daily limits)
        // Get daily limits from storage
        const limitsStorage = await chrome.storage.local.get(['dailyLimits']);
        const dailyLimits = limitsStorage.dailyLimits || {
            comments: 30,
            likes: 60,
            shares: 15,
            follows: 30
        };
        
        // Update daily limits display
        const dailyCommentsLimitEl = document.getElementById('daily-comments-limit');
        const dailyLikesLimitEl = document.getElementById('daily-likes-limit');
        const dailySharesLimitEl = document.getElementById('daily-shares-limit');
        const dailyFollowsLimitEl = document.getElementById('daily-follows-limit');
        const dailyConnectionsLimitEl = document.getElementById('daily-connections-limit');
        
        if (dailyCommentsLimitEl) dailyCommentsLimitEl.textContent = dailyLimits.comments || 30;
        if (dailyLikesLimitEl) dailyLikesLimitEl.textContent = dailyLimits.likes || 60;
        if (dailySharesLimitEl) dailySharesLimitEl.textContent = dailyLimits.shares || 15;
        if (dailyFollowsLimitEl) dailyFollowsLimitEl.textContent = dailyLimits.follows || 30;
        if (dailyConnectionsLimitEl) dailyConnectionsLimitEl.textContent = dailyLimits.connections || 50;
        
        if (localStats) {
            const now = new Date();
            const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            const todayStats = localStats.dailyStats?.[dateKey] || {};
            
            // Update local activity boxes (just numbers, limits already set above)
            const localCommentsEl = document.getElementById('local-comments');
            const localLikesEl = document.getElementById('local-likes');
            const localSharesEl = document.getElementById('local-shares');
            const localFollowsEl = document.getElementById('local-follows');
            const localConnectionsEl = document.getElementById('local-connections');
            
            if (localCommentsEl) localCommentsEl.textContent = todayStats.comments || 0;
            if (localLikesEl) localLikesEl.textContent = todayStats.likes || 0;
            if (localSharesEl) localSharesEl.textContent = todayStats.shares || 0;
            if (localFollowsEl) localFollowsEl.textContent = todayStats.follows || 0;
            if (localConnectionsEl) localConnectionsEl.textContent = todayStats.connections || 0;
            
            console.log('⚡ DASHBOARD: Showing local stats instantly with daily limits:', dailyLimits);
        }
        
        // STEP 2: Sync local stats to backend
        await syncLocalStatsToBackend();

        // Fetch daily usage from backend
        const response = await fetch(`${apiUrl}/api/usage/daily`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch usage data');
        }

        const usageData = await response.json();

        if (!usageData.success) {
            throw new Error(usageData.error || 'Failed to load usage');
        }

        // Update dashboard with backend data
        const usage = usageData.usage;
        const limits = usageData.limits;
        const plan = storage.userData?.plan;

        // Update dashboard numbers with limits
        const todayComments = usage.comments || 0;
        const todayLikes = usage.likes || 0;
        const todayShares = usage.shares || 0;
        const todayFollows = usage.follows || 0;
        const todayConnections = usage.connections || 0;
        const todayAiPosts = usage.aiPosts || 0;
        const todayAiComments = usage.aiComments || 0;
        const todayBonusAiComments = usage.bonusAiComments || 0;
        const todayAiTopics = usage.aiTopicLines || 0;

        // Update API usage progress bars with backend data
        const apiCommentsProgress = document.getElementById('api-comments-progress');
        const apiCommentsBar = document.getElementById('api-comments-bar');
        const apiLikesProgress = document.getElementById('api-likes-progress');
        const apiLikesBar = document.getElementById('api-likes-bar');
        const apiSharesProgress = document.getElementById('api-shares-progress');
        const apiSharesBar = document.getElementById('api-shares-bar');
        const apiFollowsProgress = document.getElementById('api-follows-progress');
        const apiFollowsBar = document.getElementById('api-follows-bar');
        const apiConnectionsProgress = document.getElementById('api-connections-progress');
        const apiConnectionsBar = document.getElementById('api-connections-bar');
        const apiAiPostsProgress = document.getElementById('api-ai-posts-progress');
        const apiAiPostsBar = document.getElementById('api-ai-posts-bar');
        const apiAiCommentsProgress = document.getElementById('api-ai-comments-progress');
        const apiAiCommentsBar = document.getElementById('api-ai-comments-bar');
        const apiAiTopicsProgress = document.getElementById('api-ai-topics-progress');
        const apiAiTopicsBar = document.getElementById('api-ai-topics-bar');
        
        // Helper function to get limit value (handles 0 as valid value)
        const getLimit = (value, fallback) => value !== undefined && value !== null ? value : fallback;
        
        // Comments
        const commentsLimit = getLimit(limits.comments, 0);
        if (apiCommentsProgress) apiCommentsProgress.textContent = `${todayComments}/${commentsLimit}`;
        if (apiCommentsBar) apiCommentsBar.style.width = commentsLimit > 0 ? `${Math.min((todayComments / commentsLimit) * 100, 100)}%` : '0%';
        
        // Likes
        const likesLimit = getLimit(limits.likes, 0);
        if (apiLikesProgress) apiLikesProgress.textContent = `${todayLikes}/${likesLimit}`;
        if (apiLikesBar) apiLikesBar.style.width = likesLimit > 0 ? `${Math.min((todayLikes / likesLimit) * 100, 100)}%` : '0%';
        
        // Shares
        const sharesLimit = getLimit(limits.shares, 0);
        if (apiSharesProgress) apiSharesProgress.textContent = `${todayShares}/${sharesLimit}`;
        if (apiSharesBar) apiSharesBar.style.width = sharesLimit > 0 ? `${Math.min((todayShares / sharesLimit) * 100, 100)}%` : '0%';
        
        // Follows
        const followsLimit = getLimit(limits.follows, 0);
        if (apiFollowsProgress) apiFollowsProgress.textContent = `${todayFollows}/${followsLimit}`;
        if (apiFollowsBar) apiFollowsBar.style.width = followsLimit > 0 ? `${Math.min((todayFollows / followsLimit) * 100, 100)}%` : '0%';
        
        // Connections
        const connectionsLimit = getLimit(limits.connections, 0);
        if (apiConnectionsProgress) apiConnectionsProgress.textContent = `${todayConnections}/${connectionsLimit}`;
        if (apiConnectionsBar) apiConnectionsBar.style.width = connectionsLimit > 0 ? `${Math.min((todayConnections / connectionsLimit) * 100, 100)}%` : '0%';
        
        // AI Posts
        const aiPostsLimit = getLimit(limits.aiPosts, 0);
        if (apiAiPostsProgress) apiAiPostsProgress.textContent = `${todayAiPosts}/${aiPostsLimit}`;
        if (apiAiPostsBar) apiAiPostsBar.style.width = aiPostsLimit > 0 ? `${Math.min((todayAiPosts / aiPostsLimit) * 100, 100)}%` : '0%';
        
        // AI Comments
        const aiCommentsLimit = getLimit(limits.aiComments, 0);
        const totalAvailableAiComments = aiCommentsLimit + todayBonusAiComments;
        if (apiAiCommentsProgress) apiAiCommentsProgress.textContent = `${todayAiComments}/${totalAvailableAiComments}`;
        if (apiAiCommentsBar) apiAiCommentsBar.style.width = totalAvailableAiComments > 0 ? `${Math.min((todayAiComments / totalAvailableAiComments) * 100, 100)}%` : '0%';
        
        // AI Topics
        const aiTopicsLimit = getLimit(limits.aiTopicLines, 0);
        if (apiAiTopicsProgress) apiAiTopicsProgress.textContent = `${todayAiTopics}/${aiTopicsLimit}`;
        if (apiAiTopicsBar) apiAiTopicsBar.style.width = aiTopicsLimit > 0 ? `${Math.min((todayAiTopics / aiTopicsLimit) * 100, 100)}%` : '0%';

        // Import Profiles
        const apiImportProfilesProgress = document.getElementById('api-import-profiles-progress');
        const apiImportProfilesBar = document.getElementById('api-import-profiles-bar');
        const todayImportProfiles = usage.importProfiles || 0;
        const importProfilesLimit = getLimit(limits.importProfiles, 0);
        if (apiImportProfilesProgress) apiImportProfilesProgress.textContent = `${todayImportProfiles}/${importProfilesLimit}`;
        if (apiImportProfilesBar) apiImportProfilesBar.style.width = `${Math.min((todayImportProfiles / importProfilesLimit) * 100, 100)}%`;

        // Calculate weekly total (approximate from today's usage)
        const weekTotal = (todayComments + todayLikes + todayShares + todayFollows) * 7;
        if (elements.weekTotal) elements.weekTotal.textContent = weekTotal;

        // Calculate response rate based on engagement
        const totalEngagements = todayComments + todayLikes + todayShares + todayFollows;
        const responseRate = totalEngagements > 0 ? Math.min(Math.round((todayComments / totalEngagements) * 100), 100) : 0;
        if (elements.responseRate) elements.responseRate.textContent = `${responseRate}%`;

        // Display plan name
        if (plan && elements.accountPlan) {
            elements.accountPlan.textContent = plan.name;
        }

        // Show upgrade prompt if limits reached
        checkAndShowUpgradePrompts(usage, limits, usageData.features);

        console.log('✅ DASHBOARD: Backend data loaded (synced from local) -', {
            today: { comments: todayComments, likes: todayLikes, shares: todayShares, follows: todayFollows, connections: todayConnections },
            limits,
            plan: plan?.name,
            features: usageData.features
        });
        
        // Load scheduled posts display
        loadScheduledPosts();

    } catch (error) {
        console.error('Failed to load dashboard:', error);
    }
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
            loadPlans();
            throw new Error('Feature not available in current plan');
        }

        if (actionType === 'schedule' && !userRestrictions.scheduling) {
            showNotification('⬆️ Upgrade to Pro plan for post scheduling', 'warning');
            if (elements.planModal) elements.planModal.style.display = 'flex';
            loadPlans();
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
                loadPlans();
            }
            throw new Error(data.error || 'Usage limit exceeded');
        }

        return data;
    } catch (error) {
        console.error('Usage tracking error:', error);
        throw error;
    }
}

// --- SCHEDULED POSTS FUNCTIONS --- //

/**
 * Load and display scheduled posts on dashboard
 */
export async function loadScheduledPosts() {
    try {
        console.log('📅 DASHBOARD: Loading scheduled posts...');
        const storage = await chrome.storage.local.get(['scheduledPosts', 'contentCalendar', 'postSchedulerActive', 'postSchedulerStatus', 'outsideBusinessHoursNotification']);
        
        // Merge scheduledPosts and contentCalendar (Content Calendar from Writer tab)
        const scheduledPosts = storage.scheduledPosts || [];
        const contentCalendar = storage.contentCalendar || [];
        
        // Convert contentCalendar items to match scheduledPosts format
        const calendarPosts = contentCalendar
            .filter(event => event.status === 'scheduled' && event.type === 'post')
            .map(event => ({
                id: event.id,
                content: event.content || event.description || event.title,
                scheduledFor: event.scheduledDate,
                scheduledDate: event.scheduledDate,
                status: 'pending',
                source: 'contentCalendar'
            }));
        
        // Combine both sources
        const allScheduledPosts = [...scheduledPosts, ...calendarPosts];
        
        console.log('📅 DASHBOARD: Found scheduled posts:', allScheduledPosts.length, '(scheduledPosts:', scheduledPosts.length, ', contentCalendar:', calendarPosts.length, ')');
        
        const section = document.getElementById('scheduled-posts-section');
        const countEl = document.getElementById('scheduled-posts-count');
        const listEl = document.getElementById('scheduled-posts-list');
        
        // Always show the section
        if (section) {
            section.style.display = 'block';
        }
        
        // Filter to show only pending posts from all sources
        const pendingPosts = allScheduledPosts.filter(p => !p.status || p.status === 'pending' || p.status === 'rescheduled' || p.status === 'scheduled');
        
        if (countEl) countEl.textContent = pendingPosts.length;
        
        if (listEl) {
            if (pendingPosts.length > 0) {
                listEl.innerHTML = pendingPosts.map(post => {
                    const scheduledDate = new Date(post.scheduledFor || post.scheduledDate);
                    const now = new Date();
                    const timeUntil = scheduledDate - now;
                    
                    let timeText = '';
                    if (timeUntil <= 0) {
                        timeText = '<span style="color: #f59e0b;">Due now</span>';
                    } else if (timeUntil < 60000) {
                        timeText = '<span style="color: #22c55e;">< 1 min</span>';
                    } else if (timeUntil < 3600000) {
                        timeText = `<span style="color: #693fe9;">${Math.round(timeUntil / 60000)} min</span>`;
                    } else if (timeUntil < 86400000) {
                        const hours = Math.floor(timeUntil / 3600000);
                        const mins = Math.round((timeUntil % 3600000) / 60000);
                        timeText = `<span style="color: #666;">${hours}h ${mins}m</span>`;
                    } else {
                        const days = Math.floor(timeUntil / 86400000);
                        const hours = Math.floor((timeUntil % 86400000) / 3600000);
                        timeText = `<span style="color: #999;">${days}d ${hours}h</span>`;
                    }
                    
                    const contentPreview = (post.content || '').substring(0, 60) + (post.content?.length > 60 ? '...' : '');
                    const statusBadge = post.status === 'rescheduled' ? '<span style="background: #fff3cd; color: #856404; padding: 2px 6px; border-radius: 4px; font-size: 9px; margin-left: 5px;">Rescheduled</span>' : '';
                    
                    return `
                        <div style="padding: 10px; background: #f8f9fa; border-radius: 8px; margin-bottom: 8px; border-left: 3px solid #a855f7;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                <span style="font-size: 10px; color: #666;">
                                    <span class="icon icon-calendar"></span> ${scheduledDate.toLocaleDateString()} ${scheduledDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    ${statusBadge}
                                </span>
                                <span style="font-size: 11px; font-weight: 600;">${timeText}</span>
                            </div>
                            <div style="font-size: 11px; color: #333; line-height: 1.4;">${contentPreview}</div>
                        </div>
                    `;
                }).join('');
            } else {
                listEl.innerHTML = `
                    <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; text-align: center; color: #999; font-size: 11px;">
                        <span class="icon icon-calendar" style="font-size: 20px; display: block; margin-bottom: 6px; opacity: 0.5;"></span>
                        No scheduled posts yet.<br>
                        <span style="font-size: 10px;">Go to Writer tab to schedule posts.</span>
                    </div>
                `;
            }
        }
        
        // Update post scheduler active status
        updatePostSchedulerStatus(storage);
        
        // Update business hours warning
        updateBusinessHoursWarning(storage);
        
    } catch (error) {
        console.error('Failed to load scheduled posts:', error);
    }
}

/**
 * Update post scheduler active status on dashboard
 */
function updatePostSchedulerStatus(storage) {
    const activePostScheduler = document.getElementById('active-post-scheduler');
    const activeWorkingsSection = document.getElementById('active-workings-section');
    const statusEl = document.getElementById('active-post-scheduler-status');
    
    if (activePostScheduler) {
        if (storage.postSchedulerActive) {
            activePostScheduler.style.display = 'block';
            if (activeWorkingsSection) activeWorkingsSection.style.display = 'block';
            
            // Update status text based on postSchedulerStatus
            if (statusEl && storage.postSchedulerStatus) {
                const status = storage.postSchedulerStatus;
                if (status.status === 'posting') {
                    statusEl.textContent = `Posting: ${status.content || 'Publishing to LinkedIn...'}`;
                } else if (status.status === 'completed') {
                    statusEl.textContent = 'Post published successfully!';
                } else if (status.status === 'failed') {
                    statusEl.textContent = `Failed: ${status.error || 'Unknown error'}`;
                }
            }
        } else {
            activePostScheduler.style.display = 'none';
        }
    }
}

/**
 * Update business hours warning display
 */
function updateBusinessHoursWarning(storage) {
    const warningEl = document.getElementById('business-hours-warning');
    const messageEl = document.getElementById('business-hours-message');
    
    if (warningEl && storage.outsideBusinessHoursNotification) {
        const notification = storage.outsideBusinessHoursNotification;
        // Show warning if notification was shown in the last 30 minutes
        if (notification.shown && (Date.now() - notification.timestamp) < 30 * 60 * 1000) {
            warningEl.style.display = 'block';
            if (messageEl) messageEl.textContent = notification.message;
        } else {
            warningEl.style.display = 'none';
        }
    } else if (warningEl) {
        warningEl.style.display = 'none';
    }
}

/**
 * Start periodic refresh of scheduled posts
 */
export function startScheduledPostsRefresh() {
    // Initial load
    loadScheduledPosts();
    
    // Refresh every 30 seconds
    setInterval(() => {
        loadScheduledPosts();
    }, 30000);
}
