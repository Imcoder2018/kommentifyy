import { state, elements } from './state.js';
import { featureChecker } from '../../shared/utils/featureChecker.js';
import { loadPlans } from './auth.js';
import { loadDashboard } from './dashboard.js';
import { checkDatabaseStatus } from './utils.js';

// --- ANALYTICS FUNCTIONS --- //

/**
 * Load and display automation history (post records)
 */
export async function loadAutomationHistory() {
    try {
        const { automationPostRecords = [] } = await chrome.storage.local.get('automationPostRecords');
        const { processingHistory = [] } = await chrome.storage.local.get('processingHistory');
        
        // Filter automation sessions only
        const automationSessions = processingHistory.filter(s => s.type === 'automation');
        
        // Update stats
        const totalSessions = automationSessions.length;
        const totalPosts = automationPostRecords.length;
        const commentsGenerated = automationPostRecords.filter(r => r.generatedComment && r.generatedComment.length > 0).length;
        const successRate = totalPosts > 0 ? Math.round((automationPostRecords.filter(r => r.status === 'success').length / totalPosts) * 100) : 0;
        
        // Update stats display
        const totalSessionsEl = document.getElementById('automation-total-sessions');
        const postsProcessedEl = document.getElementById('automation-posts-processed');
        const commentsGeneratedEl = document.getElementById('automation-comments-generated');
        const successRateEl = document.getElementById('automation-success-rate');
        
        if (totalSessionsEl) totalSessionsEl.textContent = totalSessions;
        if (postsProcessedEl) postsProcessedEl.textContent = totalPosts;
        if (commentsGeneratedEl) commentsGeneratedEl.textContent = commentsGenerated;
        if (successRateEl) successRateEl.textContent = successRate + '%';
        
        // Render table
        const tableBody = document.getElementById('automation-history-table-body');
        if (!tableBody) return;
        
        if (automationPostRecords.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="padding: 20px; text-align: center; color: #6c757d;">
                        No automation history found. Start Bulk Processing to see post details here.
                    </td>
                </tr>
            `;
            return;
        }
        
        // Get search term and filter status
        const searchInput = document.getElementById('automation-search');
        const searchTerm = searchInput?.value?.toLowerCase() || '';
        const filterStatus = document.getElementById('automation-history-filter-status')?.value || 'all';
        
        let filteredRecords = automationPostRecords;
        if (filterStatus !== 'all') {
            filteredRecords = filteredRecords.filter(r => r.status === filterStatus);
        }
        if (searchTerm) {
            filteredRecords = filteredRecords.filter(r => {
                const keywords = (r.keywords || '').toLowerCase();
                const author = (r.authorName || '').toLowerCase();
                const content = (r.postContent || '').toLowerCase();
                const comment = (r.generatedComment || '').toLowerCase();
                return keywords.includes(searchTerm) || author.includes(searchTerm) || 
                       content.includes(searchTerm) || comment.includes(searchTerm);
            });
        }
        
        tableBody.innerHTML = filteredRecords.slice(0, 100).map(record => {
            const date = new Date(record.timestamp);
            const dateStr = date.toLocaleDateString('en-GB') + ' ' + date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
            
            // Truncate long text
            const truncate = (text, maxLen) => {
                if (!text) return '-';
                return text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
            };
            
            // Format actions with view button if post link exists
            const actionsArr = [];
            if (record.actions?.liked) actionsArr.push('👍');
            if (record.actions?.commented) actionsArr.push('💬');
            if (record.actions?.shared) actionsArr.push('🔄');
            if (record.actions?.followed) actionsArr.push('👤');
            
            // Build post URL from URN
            let postUrl = '';
            if (record.postUrn) {
                const urn = record.postUrn.includes('urn:li:activity:') ? record.postUrn : `urn:li:activity:${record.postUrn}`;
                postUrl = `https://www.linkedin.com/feed/update/${urn}/`;
            }
            
            // Actions column with icons and view button
            const actionsHtml = `
                <span style="margin-right: 4px;">${actionsArr.join(' ')}</span>
                ${postUrl ? `<a href="${postUrl}" target="_blank" style="background: #693fe9; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px; text-decoration: none;" title="View Post">👁️</a>` : ''}
            `;
            
            const statusIcon = record.status === 'success' ? '✅' : record.status === 'failed' ? '❌' : '⏳';
            
            return `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 8px; font-size: 11px;">${truncate(record.keywords, 30)}</td>
                    <td style="padding: 8px; font-size: 11px; font-weight: 600;">${truncate(record.authorName, 20)}</td>
                    <td style="padding: 8px; font-size: 10px; max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${(record.postContent || '').replace(/"/g, '&quot;')}">${truncate(record.postContent, 50)}</td>
                    <td style="padding: 8px; font-size: 10px; max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #693fe9;" title="${(record.generatedComment || '').replace(/"/g, '&quot;')}">${truncate(record.generatedComment, 50)}</td>
                    <td style="padding: 8px; text-align: center; font-size: 12px;">${actionsHtml}</td>
                    <td style="padding: 8px; text-align: center; font-size: 11px;">${statusIcon}</td>
                    <td style="padding: 8px; font-size: 10px;">${dateStr}</td>
                </tr>
            `;
        }).join('');
        
        console.log('✅ Automation history loaded:', automationPostRecords.length, 'records');
    } catch (error) {
        console.error('Error loading automation history:', error);
    }
}

/**
 * Load and display networking history
 */
export async function loadNetworkingHistory() {
    try {
        const { processingHistory = [] } = await chrome.storage.local.get('processingHistory');
        
        // Filter networking sessions only
        const networkingSessions = processingHistory.filter(s => s.type === 'networking');
        
        // Calculate stats
        const totalSessions = networkingSessions.length;
        const connectionsSent = networkingSessions.reduce((sum, s) => sum + (s.successful || 0), 0);
        const profilesFound = networkingSessions.reduce((sum, s) => sum + (s.processed || 0), 0);
        const completedSessions = networkingSessions.filter(s => s.status === 'completed').length;
        const successRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
        
        // Update stats display
        const totalSessionsEl = document.getElementById('networking-total-sessions');
        const connectionsSentEl = document.getElementById('networking-connections-sent');
        const profilesFoundEl = document.getElementById('networking-profiles-found');
        const successRateEl = document.getElementById('networking-success-rate');
        
        if (totalSessionsEl) totalSessionsEl.textContent = totalSessions;
        if (connectionsSentEl) connectionsSentEl.textContent = connectionsSent;
        if (profilesFoundEl) profilesFoundEl.textContent = profilesFound;
        if (successRateEl) successRateEl.textContent = successRate + '%';
        
        // Render table
        const tableBody = document.getElementById('networking-history-table-body');
        if (!tableBody) return;
        
        // Get search term
        const searchInput = document.getElementById('networking-search');
        const searchTerm = searchInput?.value?.toLowerCase() || '';
        
        // Get filter status
        const filterStatus = document.getElementById('networking-history-filter-status')?.value || 'all';
        
        // Filter sessions by search and status
        let filteredSessions = networkingSessions;
        if (filterStatus !== 'all') {
            filteredSessions = filteredSessions.filter(s => s.status === filterStatus);
        }
        if (searchTerm) {
            filteredSessions = filteredSessions.filter(s => {
                const query = (s.query || s.keywords || '').toLowerCase();
                return query.includes(searchTerm);
            });
        }
        
        if (filteredSessions.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="padding: 20px; text-align: center; color: #6c757d;">
                        ${searchTerm || filterStatus !== 'all' ? 'No matching sessions found.' : 'No networking history found. Start People Search to see history here.'}
                    </td>
                </tr>
            `;
            return;
        }
        
        tableBody.innerHTML = filteredSessions.slice(0, 50).map(session => {
            const date = new Date(session.startTime || session.endTime);
            const dateStr = date.toLocaleDateString('en-GB') + ' ' + date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
            
            const duration = session.duration ? formatDuration(session.duration) : '< 1s';
            const successRate = session.processed > 0 ? Math.round((session.successful / session.processed) * 100) + '%' : '0%';
            
            const statusIcon = session.status === 'completed' ? '✅' : 
                              session.status === 'stopped' ? '⏹️' : 
                              session.status === 'failed' ? '❌' : '⏳';
            
            return `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 8px; font-size: 11px;">${session.query || session.keywords || '-'}</td>
                    <td style="padding: 8px; text-align: center; font-size: 11px;">${session.target || 0}</td>
                    <td style="padding: 8px; text-align: center; font-size: 11px;">${session.processed || 0}</td>
                    <td style="padding: 8px; text-align: center; font-size: 11px;">${session.successful || 0}</td>
                    <td style="padding: 8px; text-align: center; font-size: 11px;">${successRate}</td>
                    <td style="padding: 8px; text-align: center; font-size: 11px;">${duration}</td>
                    <td style="padding: 8px; text-align: center; font-size: 11px;">${statusIcon} ${session.status}</td>
                    <td style="padding: 8px; font-size: 10px;">${dateStr}</td>
                </tr>
            `;
        }).join('');
        
        console.log('✅ Networking history loaded:', networkingSessions.length, 'sessions');
    } catch (error) {
        console.error('Error loading networking history:', error);
    }
}

/**
 * Format duration from milliseconds to readable string
 */
function formatDuration(ms) {
    if (!ms || ms < 1000) return '< 1s';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
        return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
}

/**
 * Clear automation history
 */
export async function clearAutomationHistory() {
    if (!confirm('Are you sure you want to clear all automation post records? This cannot be undone.')) {
        return;
    }
    
    await chrome.storage.local.remove('automationPostRecords');
    
    // Also remove automation sessions from processing history
    const { processingHistory = [] } = await chrome.storage.local.get('processingHistory');
    const filtered = processingHistory.filter(s => s.type !== 'automation');
    await chrome.storage.local.set({ processingHistory: filtered });
    
    alert('Automation history cleared successfully!');
    loadAutomationHistory();
}

/**
 * Clear networking history
 */
export async function clearNetworkingHistory() {
    if (!confirm('Are you sure you want to clear all networking history? This cannot be undone.')) {
        return;
    }
    
    // Remove networking sessions from processing history
    const { processingHistory = [] } = await chrome.storage.local.get('processingHistory');
    const filtered = processingHistory.filter(s => s.type !== 'networking');
    await chrome.storage.local.set({ processingHistory: filtered });
    
    alert('Networking history cleared successfully!');
    loadNetworkingHistory();
}

/**
 * Export automation history to CSV
 */
export async function exportAutomationHistory() {
    const { automationPostRecords = [] } = await chrome.storage.local.get('automationPostRecords');
    
    if (automationPostRecords.length === 0) {
        alert('No automation records to export.');
        return;
    }
    
    const headers = ['Date', 'Keywords', 'Author', 'Post Content', 'Generated Comment', 'Liked', 'Commented', 'Shared', 'Followed', 'Status'];
    const rows = automationPostRecords.map(r => [
        new Date(r.timestamp).toISOString(),
        r.keywords || '',
        r.authorName || '',
        `"${(r.postContent || '').replace(/"/g, '""')}"`,
        `"${(r.generatedComment || '').replace(/"/g, '""')}"`,
        r.actions?.liked ? 'Yes' : 'No',
        r.actions?.commented ? 'Yes' : 'No',
        r.actions?.shared ? 'Yes' : 'No',
        r.actions?.followed ? 'Yes' : 'No',
        r.status || ''
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `automation-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert('Automation history exported successfully!');
}

/**
 * Export networking history to CSV
 */
export async function exportNetworkingHistory() {
    const { processingHistory = [] } = await chrome.storage.local.get('processingHistory');
    const networkingSessions = processingHistory.filter(s => s.type === 'networking');
    
    if (networkingSessions.length === 0) {
        alert('No networking sessions to export.');
        return;
    }
    
    const headers = ['Date', 'Query', 'Target', 'Found', 'Sent', 'Success Rate', 'Duration', 'Status'];
    const rows = networkingSessions.map(s => [
        new Date(s.startTime || s.endTime).toISOString(),
        s.query || s.keywords || '',
        s.target || 0,
        s.processed || 0,
        s.successful || 0,
        s.processed > 0 ? Math.round((s.successful / s.processed) * 100) + '%' : '0%',
        formatDuration(s.duration),
        s.status || ''
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `networking-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert('Networking history exported successfully!');
}

// Make delete functions available globally
window.deleteAutomationRecord = async (id) => {
    const { automationPostRecords = [] } = await chrome.storage.local.get('automationPostRecords');
    const filtered = automationPostRecords.filter(r => r.id !== id);
    await chrome.storage.local.set({ automationPostRecords: filtered });
    loadAutomationHistory();
};

window.deleteNetworkingSession = async (id) => {
    const { processingHistory = [] } = await chrome.storage.local.get('processingHistory');
    const filtered = processingHistory.filter(s => s.id !== id);
    await chrome.storage.local.set({ processingHistory: filtered });
    loadNetworkingHistory();
};

window.viewNetworkingSession = (id) => {
    alert('Session details view coming soon!');
};

export async function loadAnalytics() {
    try {
        console.log('📊 ANALYTICS: Loading stats from local storage...');
        const stats = await chrome.storage.local.get('engagementStatistics');
        let data = stats.engagementStatistics;
        console.log('📊 ANALYTICS: Raw storage data:', data);

        // Initialize if doesn't exist
        if (!data || !data.initialized) {
            console.log('✅ Full extension initialized');
            checkDatabaseStatus();
            data = {
                initialized: true,
                totalComments: 0,
                totalLikes: 0,
                totalShares: 0,
                totalFollows: 0,
                totalPosts: 0,
                dailyStats: {},
                topHashtags: {},
                topEngagedUsers: {},
                lastUpdated: new Date().toISOString()
            };
            await chrome.storage.local.set({ engagementStatistics: data });
        }

        console.log('Analytics: Loading data:', data);
        
        // Get selected period from dropdown
        const periodSelect = document.getElementById('analytics-period');
        const period = parseInt(periodSelect?.value || '7');
        
        // Calculate stats based on period
        let comments = 0, likes = 0, shares = 0, follows = 0;
        
        if (period === 0) {
            // Today only
            const today = new Date().toISOString().split('T')[0];
            const todayStats = data.dailyStats?.[today] || {};
            comments = todayStats.comments || 0;
            likes = todayStats.likes || 0;
            shares = todayStats.shares || 0;
            follows = todayStats.follows || 0;
        } else if (period === 1) {
            // Yesterday only
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            const yesterdayStats = data.dailyStats?.[yesterday] || {};
            comments = yesterdayStats.comments || 0;
            likes = yesterdayStats.likes || 0;
            shares = yesterdayStats.shares || 0;
            follows = yesterdayStats.follows || 0;
        } else if (data.dailyStats && Object.keys(data.dailyStats).length > 0) {
            // Calculate from daily stats for the period
            const now = new Date();
            const cutoffDate = new Date(now - (period * 86400000));
            
            Object.entries(data.dailyStats).forEach(([dateStr, dayStats]) => {
                const date = new Date(dateStr);
                if (date >= cutoffDate) {
                    comments += dayStats.comments || 0;
                    likes += dayStats.likes || 0;
                    shares += dayStats.shares || 0;
                    follows += dayStats.follows || 0;
                }
            });
        } else {
            // Fallback to total stats
            comments = data.totalComments || 0;
            likes = data.totalLikes || 0;
            shares = data.totalShares || 0;
            follows = data.totalFollows || 0;
        }
        
        // Calculate total engagements
        const totalEngagements = comments + likes + shares + follows;

        // Update totals in Analytics tab - USE DIRECT DOM IDs
        const totalEngagementsEl = document.getElementById('total-engagements');
        const totalCommentsEl = document.getElementById('total-comments');
        const totalLikesEl = document.getElementById('total-likes');
        const totalSharesEl = document.getElementById('total-shares');
        const totalFollowsEl = document.getElementById('total-follows');
        
        if (totalEngagementsEl) totalEngagementsEl.textContent = totalEngagements;
        if (totalCommentsEl) totalCommentsEl.textContent = comments;
        if (totalLikesEl) totalLikesEl.textContent = likes;
        if (totalSharesEl) totalSharesEl.textContent = shares;
        if (totalFollowsEl) totalFollowsEl.textContent = follows;
        
        console.log('Analytics: Updated stats display:', { totalEngagements, comments, likes, shares, follows });

        // Update Dashboard local stats - USE DIRECT DOM IDs
        const localCommentsEl = document.getElementById('local-comments');
        const localLikesEl = document.getElementById('local-likes');
        const localSharesEl = document.getElementById('local-shares');
        const localFollowsEl = document.getElementById('local-follows');
        const localConnectionsEl = document.getElementById('local-connections');
        
        // Get today's stats for dashboard
        const today = new Date().toISOString().split('T')[0];
        const todayStats = data.dailyStats?.[today] || {};
        
        if (localCommentsEl) localCommentsEl.textContent = todayStats.comments || 0;
        if (localLikesEl) localLikesEl.textContent = todayStats.likes || 0;
        if (localSharesEl) localSharesEl.textContent = todayStats.shares || 0;
        if (localFollowsEl) localFollowsEl.textContent = todayStats.follows || 0;
        if (localConnectionsEl) localConnectionsEl.textContent = todayStats.connections || 0;

        // Top hashtags
        if (elements.topHashtags && data.topHashtags) {
            const hashtags = Object.entries(data.topHashtags)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10);

            if (hashtags.length > 0) {
                elements.topHashtags.innerHTML = hashtags
                    .map(([tag, count]) => `<span class="tag">${tag} (${count})</span>`)
                    .join(' ');
            } else {
                elements.topHashtags.innerHTML = '<p class="empty-state">No hashtag data yet</p>';
            }
        }

        // Top users
        if (elements.topUsers && data.topEngagedUsers) {
            const users = Object.entries(data.topEngagedUsers)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10);

            if (users.length > 0) {
                elements.topUsers.innerHTML = users
                    .map(([user, count]) => `<div class="content-item"><strong>${user}</strong>: ${count} engagements</div>`)
                    .join('');
            } else {
                elements.topUsers.innerHTML = '<p class="empty-state">No user data yet</p>';
            }
        }
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

export async function exportStatistics() {
    try {
        // CHECK FEATURE PERMISSION
        const canExport = await featureChecker.checkFeature('analytics');
        if (!canExport) {
            console.warn('🚫 CSV Export feature access denied - not available in current plan');
            alert('⬆️ CSV Export requires a paid plan. Please upgrade to export analytics data!');
            
            // Show plan modal for upgrade
            const planModal = document.getElementById('plan-modal');
            if (planModal) {
                planModal.style.display = 'flex';
                loadPlans();
            }
            return;
        }
        
        console.log('📥 EXPORT: Starting statistics export...');
        const stats = await chrome.storage.local.get('engagementStatistics');
        console.log('📥 EXPORT: Retrieved statistics:', stats);

        const data = JSON.stringify(stats.engagementStatistics || {}, null, 2);
        console.log(`📥 EXPORT: Data size: ${data.length} characters`);

        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `linkedin-stats-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        console.log('✅ EXPORT: Statistics exported successfully');
        alert('Statistics exported successfully!');
    } catch (error) {
        console.error('❌ EXPORT: Error exporting stats:', error);
        alert('Failed to export statistics');
    }
}

export async function clearStatistics() {
    console.log('🗑️ CLEAR: User requested to clear statistics');

    if (!confirm('Are you sure you want to clear all statistics? This cannot be undone.')) {
        console.log('🗑️ CLEAR: User cancelled clear operation');
        return;
    }

    console.log('🗑️ CLEAR: Clearing engagement statistics...');
    await chrome.storage.local.remove('engagementStatistics');

    console.log('🗑️ CLEAR: Clearing leads data...');
    await chrome.storage.local.remove('leads');
    await chrome.storage.local.remove('leadsByQuery');

    console.log('✅ CLEAR: All data cleared successfully');
    alert('Statistics and leads cleared successfully');

    console.log('🔄 CLEAR: Refreshing UI...');
    loadAnalytics();
    loadDashboard();
}
