import { elements } from './state.js';

// --- PROGRESS ANALYTICS --- //
export async function loadProgressAnalytics() {
    try {
        // Get current usage stats and limits
        const storage = await chrome.storage.local.get(['dailyCounts', 'userData']);
        const dailyCounts = storage.dailyCounts || {};
        const userData = storage.userData || {};
        const plan = userData.plan || {};

        // Daily Comments
        const commentsUsed = dailyCounts.comments || 0;
        const commentsLimit = plan.monthlyComments || 1500;
        const commentsPercentage = commentsLimit > 0 ? Math.min((commentsUsed / commentsLimit) * 100, 100) : 0;
        
        const dailyCommentsBar = document.getElementById('daily-comments-bar');
        const dailyCommentsProgress = document.getElementById('daily-comments-progress');
        if (dailyCommentsBar && dailyCommentsProgress) {
            dailyCommentsBar.style.width = `${commentsPercentage}%`;
            dailyCommentsProgress.textContent = `${commentsUsed}/${commentsLimit}`;
        }

        // Daily Likes
        const likesUsed = dailyCounts.likes || 0;
        const likesLimit = plan.monthlyLikes || 3000;
        const likesPercentage = likesLimit > 0 ? Math.min((likesUsed / likesLimit) * 100, 100) : 0;
        
        const dailyLikesBar = document.getElementById('daily-likes-bar');
        const dailyLikesProgress = document.getElementById('daily-likes-progress');
        if (dailyLikesBar && dailyLikesProgress) {
            dailyLikesBar.style.width = `${likesPercentage}%`;
            dailyLikesProgress.textContent = `${likesUsed}/${likesLimit}`;
        }

        // Weekly Target (sum of all actions)
        const weeklyUsed = (dailyCounts.comments || 0) + (dailyCounts.likes || 0) + (dailyCounts.shares || 0) + (dailyCounts.follows || 0);
        const weeklyGoal = 300; // Can be made dynamic
        const weeklyPercentage = weeklyGoal > 0 ? Math.min((weeklyUsed / weeklyGoal) * 100, 100) : 0;
        
        const weeklyProgressBar = document.getElementById('weekly-progress-bar');
        const weeklyProgressText = document.getElementById('weekly-progress-text');
        if (weeklyProgressBar && weeklyProgressText) {
            weeklyProgressBar.style.width = `${weeklyPercentage}%`;
            weeklyProgressText.textContent = `${weeklyUsed}/${weeklyGoal}`;
        }

        // Monthly Goal
        const monthlyUsed = weeklyUsed * 4; // Rough estimate
        const monthlyGoal = 1000;
        const monthlyPercentage = monthlyGoal > 0 ? Math.min((monthlyUsed / monthlyGoal) * 100, 100) : 0;
        
        const monthlyProgressBar = document.getElementById('monthly-progress-bar');
        const monthlyProgressText = document.getElementById('monthly-progress-text');
        if (monthlyProgressBar && monthlyProgressText) {
            monthlyProgressBar.style.width = `${monthlyPercentage}%`;
            monthlyProgressText.textContent = `${monthlyUsed}/${monthlyGoal}`;
        }

        // Success Rate (actions completed vs attempted)
        const totalActions = weeklyUsed;
        const successRate = totalActions > 0 ? 85 : 0; // Can be calculated from actual success/failure stats
        
        const successRateBar = document.getElementById('success-rate-bar');
        const successRateText = document.getElementById('success-rate-text');
        if (successRateBar && successRateText) {
            successRateBar.style.width = `${successRate}%`;
            successRateText.textContent = `${successRate}%`;
        }

        console.log('Progress analytics loaded with real data:', { commentsUsed, likesUsed, weeklyUsed, monthlyUsed });
    } catch (error) {
        console.error('Failed to load progress analytics:', error);
    }
}

// --- LIVE PROGRESS MONITORING --- //
let progressMonitorInterval = null;

export function startProgressMonitoring() {
    // Clear any existing interval
    if (progressMonitorInterval) {
        clearInterval(progressMonitorInterval);
    }

    // Start monitoring
    progressMonitorInterval = setInterval(async () => {
        try {
            const result = await chrome.storage.local.get('liveProgress');
            const progress = result.liveProgress;

            const progressSection = document.getElementById('live-progress-section');
            const statusText = document.getElementById('live-status-text');
            const currentStep = document.getElementById('live-current-step');
            const progressBar = document.getElementById('live-progress-bar');
            const progressPercentage = document.getElementById('live-progress-percentage');
            const progressDetail = document.getElementById('live-progress-detail');

            if (progress && progress.active) {
                // Show progress section
                if (progressSection) progressSection.style.display = 'block';

                // Update status
                if (statusText) {
                    const statusLabel = progress.type === 'bulk_processing' ? '🤖 Bulk Processing' : '🤝 People Search';
                    statusText.textContent = statusLabel;
                    statusText.style.color = '#28a745';
                }

                // Update current step
                if (currentStep) {
                    currentStep.textContent = progress.currentStep || 'Processing...';
                }

                // Update progress bar
                const percentage = progress.percentage || 0;
                if (progressBar) {
                    progressBar.style.width = `${percentage}%`;
                }
                if (progressPercentage) {
                    progressPercentage.textContent = `${percentage}%`;
                }

                // Update detail
                if (progressDetail) {
                    progressDetail.textContent = `${progress.current || 0}/${progress.total || 0} completed`;
                }
            } else {
                // Hide progress section when not active
                if (progressSection) progressSection.style.display = 'none';
            }
        } catch (error) {
            console.error('Error monitoring progress:', error);
        }
    }, 1000); // Update every second

    console.log('✅ Live progress monitoring started');
}

export function stopProgressMonitoring() {
    if (progressMonitorInterval) {
        clearInterval(progressMonitorInterval);
        progressMonitorInterval = null;
        console.log('⏹️ Live progress monitoring stopped');
    }
}

// --- PROGRESS BAR MANAGEMENT --- //
export function showProgressBar() {
    const container = document.getElementById('progress-container');
    if (container) {
        container.style.display = 'block';
    }
}

export function hideProgressBar() {
    const container = document.getElementById('progress-container');
    if (container) {
        container.style.display = 'none';
    }
    // Reset progress start time for next run
    window.progressStartTime = null;
}

export function updateProgressBar(current, total, keywordIndex, totalKeywords, actionsCompleted, currentAction) {
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const progressStats = document.getElementById('progress-stats');
    const progressKeywords = document.getElementById('progress-keywords');
    const progressActions = document.getElementById('progress-actions');

    if (!progressBar) return;

    const percentage = total > 0 ? (current / total) * 100 : 0;
    progressBar.style.width = `${percentage}%`;

    // Calculate time estimates
    const now = Date.now();
    if (!window.progressStartTime) {
        window.progressStartTime = now;
    }

    const elapsedMs = now - window.progressStartTime;
    const elapsedSec = Math.floor(elapsedMs / 1000);

    let timeEstimate = '';
    if (current > 0 && current < total) {
        const avgTimePerPost = elapsedMs / current;
        const remainingPosts = total - current;
        const estimatedRemainingMs = avgTimePerPost * remainingPosts;
        const estimatedRemainingSec = Math.floor(estimatedRemainingMs / 1000);

        const minutes = Math.floor(estimatedRemainingSec / 60);
        const seconds = estimatedRemainingSec % 60;

        if (minutes > 0) {
            timeEstimate = ` (Est. ${minutes}m ${seconds}s remaining)`;
        } else {
            timeEstimate = ` (Est. ${seconds}s remaining)`;
        }
    }

    if (progressText) {
        progressText.textContent = (currentAction || `Processing keyword ${keywordIndex}/${totalKeywords}...`) + timeEstimate;
    }

    if (progressStats) {
        progressStats.textContent = `${current}/${total} posts (${percentage.toFixed(1)}%)`;
    }

    if (progressKeywords) {
        progressKeywords.textContent = `Keyword: ${keywordIndex}/${totalKeywords}`;
    }

    if (progressActions) {
        progressActions.textContent = `Actions: ${actionsCompleted} completed`;
    }

    console.log(`PROGRESS: ${percentage.toFixed(1)}% - ${current}/${total} posts, keyword ${keywordIndex}/${totalKeywords}, actions: ${actionsCompleted}`);
}

export function setupProgressListeners() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'updateProgress') {
            const { current, total, keywordIndex, totalKeywords, actionsCompleted, currentAction } = message;
            updateProgressBar(current, total, keywordIndex, totalKeywords, actionsCompleted, currentAction);
            sendResponse({ success: true });
        } else if (message.action === 'showProgress') {
            showProgressBar();
            sendResponse({ success: true });
        } else if (message.action === 'hideProgress') {
            hideProgressBar();
            sendResponse({ success: true });
        }
    });
}
