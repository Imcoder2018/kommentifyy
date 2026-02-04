import { elements } from './state.js';
import { updateProgressBar, showProgressBar, hideProgressBar } from './progress.js';
import { savePreferences } from './settings.js';
import { featureChecker } from '../../shared/utils/featureChecker.js';
import { loadPlans } from './auth.js';
import { logStatus, showStatusBar, hideStatusBar } from './statusLogger.js';
import { checkDailyLimit, checkAllDailyLimits } from './limits.js';

// --- BUSINESS HOURS CHECK ---
async function checkBusinessHoursBeforeProcessing() {
    try {
        const response = await chrome.runtime.sendMessage({ action: 'getBusinessHoursStatus' });
        if (response && response.success) {
            const status = response.status;
            
            // If business hours is enabled and we're outside business hours
            if (status.enabled && !status.withinBusinessHours) {
                const proceed = confirm(
                    `⚠️ Outside Business Hours!\n\n` +
                    `Current time: ${status.currentHour}:00\n` +
                    `Business hours: ${status.businessStart}:00 - ${status.businessEnd}:00\n\n` +
                    `Do you still want to proceed?\n\n` +
                    `💡 Tip: Adjust business hours in Settings tab.`
                );
                return proceed;
            }
        }
        return true; // Proceed if check fails or business hours disabled
    } catch (error) {
        console.warn('Failed to check business hours:', error);
        return true; // Proceed on error
    }
}

// --- BULK PROCESSING AUTOMATION --- //

export async function checkBulkProcessingState() {
    try {
        const result = await chrome.storage.local.get('bulkProcessingActive');
        const isActive = result.bulkProcessingActive || false;

        console.log('POPUP: Bulk processing active state:', isActive);

        if (isActive) {
            // Show stop button, hide start button (both top and bottom)
            if (elements.startBulkProcessing) elements.startBulkProcessing.style.display = 'none';
            if (elements.stopBulkProcessing) elements.stopBulkProcessing.style.display = 'inline-block';
            if (elements.startBulkProcessingBottom) elements.startBulkProcessingBottom.style.display = 'none';
            if (elements.stopBulkProcessingBottom) elements.stopBulkProcessingBottom.style.display = 'inline-block';
            console.log('POPUP: Restored stop button state');
        } else {
            // Show start button, hide stop button (both top and bottom)
            if (elements.startBulkProcessing) elements.startBulkProcessing.style.display = 'inline-block';
            if (elements.stopBulkProcessing) elements.stopBulkProcessing.style.display = 'none';
            if (elements.startBulkProcessingBottom) elements.startBulkProcessingBottom.style.display = 'inline-block';
            if (elements.stopBulkProcessingBottom) elements.stopBulkProcessingBottom.style.display = 'none';
        }
    } catch (error) {
        console.error('POPUP: Error checking processing state:', error);
    }
}

export async function stopBulkProcessing() {
    console.log('POPUP: Stopping bulk processing...');
    logStatus('automation', 'stopped');

    // Send stop message to background script
    chrome.runtime.sendMessage({
        action: 'stopBulkProcessing'
    }, (response) => {
        console.log('POPUP: Stop response:', response);

        // Hide stop button, show start button (both top and bottom)
        elements.stopBulkProcessing.style.display = 'none';
        elements.startBulkProcessing.style.display = 'inline-block';
        if (elements.stopBulkProcessingBottom) elements.stopBulkProcessingBottom.style.display = 'none';
        if (elements.startBulkProcessingBottom) elements.startBulkProcessingBottom.style.display = 'inline-block';

        // Hide progress bar and status bar
        hideProgressBar();
        hideStatusBar('automation');

        // Clear processing state from storage
        chrome.storage.local.set({ bulkProcessingActive: false });

        if (response && response.success) {
            alert('✅ Bulk processing stopped successfully!');
        } else {
            alert('⚠️ Stop signal sent. Processing will stop after current post.');
        }
    });
}

export async function startBulkProcessing() {
    // Check business hours first
    const canProceed = await checkBusinessHoursBeforeProcessing();
    if (!canProceed) {
        return;
    }
    
    // Check daily limits before starting
    const limits = await checkAllDailyLimits();
    if (limits.anyLimitReached) {
        let limitMessages = [];
        if (!limits.comments.canProceed) limitMessages.push(`Comments: ${limits.comments.used}/${limits.comments.limit}`);
        if (!limits.likes.canProceed) limitMessages.push(`Likes: ${limits.likes.used}/${limits.likes.limit}`);
        if (!limits.shares.canProceed) limitMessages.push(`Shares: ${limits.shares.used}/${limits.shares.limit}`);
        if (!limits.follows.canProceed) limitMessages.push(`Follows: ${limits.follows.used}/${limits.follows.limit}`);
        
        const proceed = confirm(
            `⚠️ Daily Limit(s) Reached!\n\n` +
            `${limitMessages.join('\n')}\n\n` +
            `Some actions may be skipped due to limits.\n` +
            `Do you still want to proceed?\n\n` +
            `💡 Tip: Adjust daily limits in the Limits tab.`
        );
        if (!proceed) return;
    }
    
    // ⚠️ STRICT CHECK: General Automation feature is REQUIRED for ALL bulk processing
    const canUseAutomation = await featureChecker.checkFeature('autoLike');
    if (!canUseAutomation) {
        console.error('🚫 BLOCKED: General Automation feature not available in current plan');
        alert('⬆️ General Automation requires a paid plan.\n\nBulk processing is only available with a paid subscription. Please upgrade to use this feature!');
        const planModal = document.getElementById('plan-modal');
        if (planModal) {
            planModal.style.display = 'flex';
            loadPlans();
        }
        return;
    }

    // Check which post source is selected (keywords or feed)
    const sourceFeed = document.getElementById('source-feed');
    const isUsingFeed = sourceFeed?.checked || false;
    
    const keywords = elements.bulkUrls.value.trim().split('\n').filter(k => k.trim());
    const quota = parseInt(elements.bulkQuota?.value, 10) || 20;
    const minLikes = parseInt(elements.bulkMinLikes?.value, 10) || 0;
    const minComments = parseInt(elements.bulkMinComments?.value, 10) || 0;

    // Only require keywords if NOT using feed mode
    if (!isUsingFeed && keywords.length === 0) {
        alert('Please enter at least one keyword to search');
        return;
    }

    if (quota < 1 || quota > 1000) {
        alert('Please enter a quota between 1 and 1000');
        return;
    }

    const doLike = elements.bulkLike.checked;
    const doComment = elements.bulkComment.checked;
    const doLikeOrComment = elements.bulkLikeOrComment.checked;
    const doShare = elements.bulkShare.checked;
    const doFollow = elements.bulkFollow.checked;

    if (!doLike && !doComment && !doLikeOrComment && !doShare && !doFollow) {
        alert('Please select at least one action (Like, Comment, Like+Comment Random, Share, or Follow)');
        return;
    }

    // CHECK ADDITIONAL FEATURE PERMISSIONS FOR SPECIFIC ACTIONS
    if (doLike || doShare || doLikeOrComment) {
        const canUseAutomation = await featureChecker.checkFeature('autoLike');
        if (!canUseAutomation) {
            console.warn('🚫 General Automation feature access denied');
            alert('⬆️ General Automation (Like/Share) requires a paid plan. Please upgrade!');
            const planModal = document.getElementById('plan-modal');
            if (planModal) {
                planModal.style.display = 'flex';
                loadPlans();
            }
            return;
        }
    }

    if (doComment || doLikeOrComment) {
        const canUseComment = await featureChecker.checkFeature('autoComment');
        if (!canUseComment) {
            console.warn('🚫 AI Comment feature access denied');
            alert('⬆️ AI Comment Generation is required for commenting. Please upgrade or uncheck the Comment option!');
            const planModal = document.getElementById('plan-modal');
            if (planModal) {
                planModal.style.display = 'flex';
                loadPlans();
            }
            return;
        }
    }

    if (doFollow) {
        const canUseFollow = await featureChecker.checkFeature('autoFollow');
        if (!canUseFollow) {
            console.warn('🚫 Networking (Follow) feature access denied');
            alert('⬆️ Networking Features (Follow) requires a paid plan. Please upgrade or uncheck the Follow option!');
            const planModal = document.getElementById('plan-modal');
            if (planModal) {
                planModal.style.display = 'flex';
                loadPlans();
            }
            return;
        }
    }

    // Get current delay settings from Daily Limits
    const accountType = elements.accountType?.value || 'matured';
    const commentDelay = parseInt(elements.commentDelay?.value, 10) || 180;

    // Get ignore keywords (one per line) - reduced list to avoid over-filtering
    const ignoreKeywordsText = elements.ignoreKeywords?.value || 'we\'re hiring\nnow hiring\napply now';
    const ignoreKeywords = ignoreKeywordsText.split('\n').map(k => k.trim()).filter(k => k.length > 0);

    console.log('Bulk processing keywords:', keywords);
    console.log('Total quota:', quota);
    console.log('Post qualification - Min likes:', minLikes, 'Min comments:', minComments);
    console.log('Ignore keywords:', ignoreKeywords.length, 'keywords configured');
    console.log('Actions: Like:', doLike, 'Comment:', doComment, 'Like/Comment Random:', doLikeOrComment, 'Share:', doShare, 'Follow:', doFollow);
    console.log('Account type:', accountType, 'Comment delay:', commentDelay);

    // Show progress UI (both top and bottom buttons)
    if (elements.startBulkProcessing) {
        elements.startBulkProcessing.style.display = 'none';
    }
    if (elements.stopBulkProcessing) {
        elements.stopBulkProcessing.style.display = 'block';
    }
    if (elements.startBulkProcessingBottom) {
        elements.startBulkProcessingBottom.style.display = 'none';
    }
    if (elements.stopBulkProcessingBottom) {
        elements.stopBulkProcessingBottom.style.display = 'block';
    }

    // Show status bar and progress bar immediately
    logStatus('automation', 'starting');
    showProgressBar();
    updateProgressBar(0, quota, 0, keywords.length, 0, 'Initializing...');

    // Save processing state to storage
    await chrome.storage.local.set({ bulkProcessingActive: true });

    // Send to background script
    const sourceType = isUsingFeed ? 'feed' : 'keywords';
    console.log('POPUP: Starting bulk processing with source:', sourceType);
    
    chrome.runtime.sendMessage({
        action: 'bulkProcessKeywords',
        source: sourceType,  // 'feed' or 'keywords'
        keywords: isUsingFeed ? [] : keywords,
        quota: quota,
        minLikes: minLikes,
        minComments: minComments,
        ignoreKeywords: ignoreKeywordsText, // Pass as text to be parsed in background
        actions: {
            like: doLike,
            comment: doComment,
            likeOrComment: doLikeOrComment,
            share: doShare,
            follow: doFollow
        },
        accountType: accountType,
        commentDelay: commentDelay
    }, (response) => {
        console.log('POPUP: Bulk processing response:', response);

        if (response && response.success) {
            const qualificationText = (minLikes > 0 || minComments > 0)
                ? `\nPost criteria: ${minLikes}+ likes, ${minComments}+ comments`
                : '';

            const sourceText = isUsingFeed ? 'Source: LinkedIn Feed' : `Keywords: ${keywords.length}`;
            const message = response.message || 'Bulk processing started successfully!';
            alert(`Bulk processing will start in 30 seconds!\n\n${sourceText}\nTarget posts: ${quota}${qualificationText}\n\nDo not close LinkedIn!`);

            // Don't clear keywords - they are now persistent
            window.close();
        } else {
            hideProgressBar();
            const errorMsg = response?.error || 'Unknown error occurred';
            console.error('POPUP: Bulk processing failed:', errorMsg);
            alert(`Failed to start bulk processing:\n\n${errorMsg}`);
        }
    });
}

export async function startAutomationFromPage() {
    savePreferences();

    const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const isLinkedInPage = currentTab.url && (currentTab.url.includes('linkedin.com/search/results') || currentTab.url.includes('linkedin.com/feed/hashtag'));

    if (!isLinkedInPage) {
        elements.automationError.style.display = 'block';
        setTimeout(() => { elements.automationError.style.display = 'none'; }, 3000);
        return;
    }

    await chrome.storage.local.set({
        'AutomationPageState': 'On',
        'AutomationQuota': parseInt(elements.autoQuota.value, 10),
        'AutomationPostAgeLimit': elements.autoPostAge.value
    });

    chrome.runtime.sendMessage({
        action: "startPageAutopilot",
        url: currentTab.url
    });

    window.close();
}

export async function startAdvancedAutomation(type) {
    const quotas = {
        like: parseInt(elements.autoLikeQuota?.value, 10) || 20,
        share: parseInt(elements.autoShareQuota?.value, 10) || 5,
        follow: parseInt(elements.autoFollowQuota?.value, 10) || 10
    };

    console.log(`Starting ${type} automation with quota:`, quotas[type]);

    chrome.runtime.sendMessage({
        action: 'startAdvancedAutomation',
        type,
        quota: quotas[type]
    }, (response) => {
        if (response && response.success) {
            alert(`${type.charAt(0).toUpperCase() + type.slice(1)} automation started!`);
        } else {
            alert(`Failed to start ${type} automation. Check console for errors.`);
        }
    });

    window.close();
}
