import { elements } from './state.js';
import { featureChecker } from '../../shared/utils/featureChecker.js';
import { loadPlans } from './auth.js';

// ========== SCHEDULER FUNCTIONS ==========

/**
 * Add bulk processing schedule
 */
export async function addBulkSchedule() {
    // ⚠️ STRICT CHECK: Automation Scheduling feature is REQUIRED for scheduling
    const canScheduleAutomation = await featureChecker.checkFeature('automationScheduling');
    if (!canScheduleAutomation) {
        console.error('🚫 BLOCKED: Automation Scheduling feature not available in current plan');
        alert('⬆️ Automation Scheduling requires a paid plan.\n\nScheduling automated bulk processing is only available with a paid subscription. Please upgrade to use this feature!');
        
        // Show plan modal for upgrade
        const planModal = document.getElementById('plan-modal');
        if (planModal) {
            planModal.style.display = 'flex';
            loadPlans();
        }
        return;
    }
    
    const time = elements.bulkScheduleTimeInput?.value;
    if (!time) {
        alert('Please select a time for the schedule');
        return;
    }

    // Get current settings from the form
    // Check which source is selected
    const sourceFeed = document.getElementById('source-feed');
    const isUsingFeed = sourceFeed?.checked || false;
    const source = isUsingFeed ? 'feed' : 'keywords';
    
    const keywords = elements.bulkUrls?.value?.trim().split('\n').filter(k => k.trim()) || [];
    const quota = parseInt(elements.bulkQuota?.value, 10) || 20;
    const minLikes = parseInt(elements.bulkMinLikes?.value, 10) || 0;
    const minComments = parseInt(elements.bulkMinComments?.value, 10) || 0;
    const actions = {
        like: elements.bulkLike?.checked || false,
        comment: elements.bulkComment?.checked || false,
        likeOrComment: elements.bulkLikeOrComment?.checked || false,
        share: elements.bulkShare?.checked || false,
        follow: elements.bulkFollow?.checked || false
    };

    // Validate based on source
    if (!isUsingFeed && keywords.length === 0) {
        alert('Please enter keywords in the "Keywords to Process" field, or switch to Feed mode');
        return;
    }

    // Get ignore keywords from UI
    const ignoreKeywordsText = elements.ignoreKeywords?.value || 'we\'re hiring\nnow hiring\napply now';
    
    const schedule = {
        time,
        source,  // 'feed' or 'keywords'
        keywords: isUsingFeed ? [] : keywords,
        quota,
        minLikes,
        minComments,
        ignoreKeywords: ignoreKeywordsText,
        actions,
        accountType: elements.accountType?.value || 'matured',
        commentDelay: parseInt(elements.commentDelay?.value, 10) || 180
    };

    // Debug logging
    console.log('SCHEDULER UI: Adding schedule with source:', source);
    console.log('SCHEDULER UI: isUsingFeed:', isUsingFeed);
    console.log('SCHEDULER UI: sourceFeed element:', sourceFeed);
    console.log('SCHEDULER UI: Full schedule object:', JSON.stringify(schedule, null, 2));

    try {
        const response = await chrome.runtime.sendMessage({
            action: 'addBulkSchedule',
            schedule
        });

        if (response?.success) {
            elements.bulkScheduleTimeInput.value = '';
            await loadBulkSchedulerStatus();
            const sourceText = source === 'feed' ? 'LinkedIn Feed' : `${keywords.length} keywords`;
            const actionsText = Object.entries(actions).filter(([k,v]) => v).map(([k]) => k).join(', ') || 'none';
            alert(`✅ Schedule added for ${time}\n\nSource: ${sourceText}\nQuota: ${quota} posts\nActions: ${actionsText}`);
        } else {
            alert('Failed to add schedule: ' + (response?.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Failed to add bulk schedule:', error);
        alert('Failed to add schedule: ' + error.message);
    }
}

/**
 * Add people search schedule
 */
export async function addPeopleSchedule() {
    // CHECK NETWORK SCHEDULING PERMISSION
    const canScheduleNetworking = await featureChecker.checkFeature('autoFollow');
    if (!canScheduleNetworking) {
        console.warn('🚫 Network Scheduling feature access denied - not available in current plan');
        alert('⬆️ Network Scheduling requires a paid plan. Please upgrade to schedule networking automation!');
        
        // Show plan modal for upgrade
        const planModal = document.getElementById('plan-modal');
        if (planModal) {
            planModal.style.display = 'flex';
            loadPlans();
        }
        return;
    }
    
    const time = elements.peopleScheduleTimeInput?.value;
    if (!time) {
        alert('Please select a time for the schedule');
        return;
    }

    // Get current settings from the form
    // Check which search source is selected
    const searchByUrl = document.getElementById('search-by-url');
    const isUsingUrl = searchByUrl?.checked || false;
    const source = isUsingUrl ? 'url' : 'keyword';
    
    const keyword = elements.searchKeyword?.value?.trim() || '';
    const searchUrl = document.getElementById('people-search-url')?.value?.trim() || '';
    const quota = parseInt(elements.connectQuota?.value, 10) || 10;
    const useBooleanLogic = elements.useBooleanSearch?.checked || false;
    const filterNetwork = elements.filterNetwork?.checked || false;
    const sendWithNote = elements.sendWithNote?.checked || false;
    const sendConnectionRequest = elements.sendConnectionRequest?.checked || false;
    const extractContactInfo = elements.extractContactInfo?.checked || false;
    const excludeHeadlineTerms = elements.excludeHeadlineTerms?.value?.split(',').map(t => t.trim()).filter(t => t) || [];
    const connectionMessage = elements.connectionMessage?.value?.trim() || '';

    // Validate based on source
    if (isUsingUrl) {
        if (!searchUrl) {
            alert('Please paste a LinkedIn people search URL');
            return;
        }
        if (!searchUrl.includes('linkedin.com/search/results/people')) {
            alert('Please enter a valid LinkedIn people search URL');
            return;
        }
    } else {
        if (!keyword) {
            alert('Please enter a search keyword in the "Search Keyword" field, or switch to URL mode');
            return;
        }
    }

    const schedule = {
        time,
        source,  // 'keyword' or 'url'
        keyword: isUsingUrl ? '' : keyword,
        searchUrl: isUsingUrl ? searchUrl : '',
        quota,
        useBooleanLogic,
        filterNetwork,
        sendWithNote,
        sendConnectionRequest,
        extractContactInfo,
        excludeHeadlineTerms,
        connectionMessage
    };

    try {
        const response = await chrome.runtime.sendMessage({
            action: 'addPeopleSchedule',
            schedule
        });

        if (response?.success) {
            elements.peopleScheduleTimeInput.value = '';
            await loadPeopleSchedulerStatus();
            const sourceText = source === 'url' ? `URL: ${searchUrl.substring(0, 40)}...` : `Keyword: "${keyword}"`;
            alert(`✅ Schedule added for ${time}\n\n${sourceText}\nQuota: ${quota} connections`);
        } else {
            alert('Failed to add schedule: ' + (response?.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Failed to add people schedule:', error);
        alert('Failed to add schedule');
    }
}

/**
 * Load bulk scheduler status
 */
export async function loadBulkSchedulerStatus() {
    try {
        const response = await chrome.runtime.sendMessage({
            action: 'getBulkSchedulerStatus'
        });

        if (response?.success) {
            const status = response.status;

            // Update toggle
            if (elements.bulkSchedulerEnabled) {
                elements.bulkSchedulerEnabled.checked = status.enabled;
            }

            // Render schedule list
            renderBulkSchedules(status.schedules || []);

            // Update next execution
            if (status.nextExecution) {
                if (elements.bulkNextExecutionTime) elements.bulkNextExecutionTime.textContent = `${status.nextExecution.time} - ${status.nextExecution.keywords?.length || 0} keywords`;
                startBulkCountdownTimer();
            } else {
                if (elements.bulkNextExecutionTime) elements.bulkNextExecutionTime.textContent = 'Not scheduled';
                if (elements.bulkCountdownTimer) elements.bulkCountdownTimer.textContent = '--:--:--';
            }
        }
    } catch (error) {
        console.error('Failed to load bulk scheduler status:', error);
    }
}

/**
 * Load people scheduler status
 */
export async function loadPeopleSchedulerStatus() {
    try {
        const response = await chrome.runtime.sendMessage({
            action: 'getPeopleSchedulerStatus'
        });

        if (response?.success) {
            const status = response.status;

            // Update toggle
            if (elements.peopleSchedulerEnabled) {
                elements.peopleSchedulerEnabled.checked = status.enabled;
            }

            // Render schedule list
            renderPeopleSchedules(status.schedules || []);

            // Update next execution
            if (status.nextExecution) {
                if (elements.peopleNextExecutionTime) elements.peopleNextExecutionTime.textContent = `${status.nextExecution.time} - ${status.nextExecution.keyword}`;
                startPeopleCountdownTimer();
            } else {
                if (elements.peopleNextExecutionTime) elements.peopleNextExecutionTime.textContent = 'Not scheduled';
                if (elements.peopleCountdownTimer) elements.peopleCountdownTimer.textContent = '--:--:--';
            }
        }
    } catch (error) {
        console.error('Failed to load people scheduler status:', error);
    }
}

/**
 * Render bulk schedules list - Compact version with tooltip
 */
function renderBulkSchedules(schedules) {
    if (!elements.bulkScheduleList) return;

    if (schedules.length === 0) {
        elements.bulkScheduleList.innerHTML = '<small style="color: #6c757d;">No schedules</small>';
        return;
    }

    elements.bulkScheduleList.innerHTML = schedules.map((sched, index) => {
        const keywordsDisplay = sched.keywords?.slice(0, 2).join(', ') + (sched.keywords?.length > 2 ? ` +${sched.keywords.length - 2}` : '');
        const actionsDisplay = Object.entries(sched.actions || {}).filter(([k, v]) => v).map(([k]) => k[0].toUpperCase()).join('') || '-';
        const minL = sched.minLikes || 0;
        const minC = sched.minComments || 0;
        const filtersDisplay = (minL > 0 || minC > 0) ? ` L${minL}C${minC}` : '';
        
        // Build tooltip content
        const allKeywords = sched.keywords?.join(', ') || 'None';
        const allActions = Object.entries(sched.actions || {}).filter(([k, v]) => v).map(([k]) => k).join(', ') || 'None';
        const tooltipText = `Time: ${sched.time}
Keywords: ${allKeywords}
Quota: ${sched.quota} posts
Actions: ${allActions}
Min Likes: ${minL}
Min Comments: ${minC}
Account Type: ${sched.accountType || 'matured'}`;

        return `
                <div style="background: #fff; padding: 6px 8px; border: 1px solid #dee2e6; border-radius: 4px; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; cursor: help;" title="${tooltipText.replace(/"/g, '&quot;')}">
                    <strong style="font-size: 11px; color: #693fe9; min-width: 45px;">⏰ ${sched.time}</strong>
                    <div style="flex: 1; font-size: 9px; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${keywordsDisplay || '-'} • ${sched.quota}p • ${actionsDisplay}${filtersDisplay}
                    </div>
                    <button class="remove-bulk-schedule-btn" data-index="${index}" style="background: none; border: none; cursor: pointer; font-size: 12px; padding: 0; color: #dc3545;">✕</button>
                </div>
            `;
    }).join('');

    // Add event listeners
    document.querySelectorAll('.remove-bulk-schedule-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const index = parseInt(btn.dataset.index);
            await removeBulkSchedule(index);
        });
    });
}

/**
 * Render people schedules list - Compact version with tooltip
 */
function renderPeopleSchedules(schedules) {
    if (!elements.peopleScheduleList) return;

    if (schedules.length === 0) {
        elements.peopleScheduleList.innerHTML = '<small style="color: #6c757d;">No schedules</small>';
        return;
    }

    elements.peopleScheduleList.innerHTML = schedules.map((sched, index) => {
        const keywordShort = sched.keyword?.length > 15 ? sched.keyword.substring(0, 15) + '...' : sched.keyword;
        
        // Build compact flags: B=Boolean, N=Network, M=Message, E=Extract
        let flags = '';
        if (sched.useBooleanLogic) flags += 'B';
        if (sched.filterNetwork) flags += 'N';
        if (sched.sendWithNote) flags += 'M';
        if (sched.extractContactInfo) flags += 'E';
        const flagsDisplay = flags ? ` ${flags}` : '';
        
        // Build tooltip content
        const excludeTerms = sched.excludeHeadlineTerms?.join(', ') || 'None';
        const tooltipText = `Time: ${sched.time}
Keyword: ${sched.keyword}
Connections: ${sched.quota}
Boolean Logic: ${sched.useBooleanLogic ? 'Yes' : 'No'}
2nd/3rd Degree: ${sched.filterNetwork ? 'Yes' : 'No'}
Send with Note: ${sched.sendWithNote ? 'Yes' : 'No'}
Extract Contact: ${sched.extractContactInfo ? 'Yes' : 'No'}
Exclude Terms: ${excludeTerms}
Message: ${sched.connectionMessage ? sched.connectionMessage.substring(0, 50) + '...' : 'None'}`;
        
        return `
                <div style="background: #fff; padding: 6px 8px; border: 1px solid #dee2e6; border-radius: 4px; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; cursor: help;" title="${tooltipText.replace(/"/g, '&quot;')}">
                    <strong style="font-size: 11px; color: #693fe9; min-width: 45px;">⏰ ${sched.time}</strong>
                    <div style="flex: 1; font-size: 9px; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        "${keywordShort}" • ${sched.quota}c${flagsDisplay}
                    </div>
                    <button class="remove-people-schedule-btn" data-index="${index}" style="background: none; border: none; cursor: pointer; font-size: 12px; padding: 0; color: #dc3545;">✕</button>
                </div>
            `;
    }).join('');

    // Add event listeners
    document.querySelectorAll('.remove-people-schedule-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const index = parseInt(btn.dataset.index);
            await removePeopleSchedule(index);
        });
    });
}

/**
 * Remove bulk schedule
 */
async function removeBulkSchedule(index) {
    if (!confirm('Remove this schedule?')) return;

    try {
        const response = await chrome.runtime.sendMessage({
            action: 'removeBulkSchedule',
            index
        });

        if (response?.success) {
            await loadBulkSchedulerStatus();
        }
    } catch (error) {
        console.error('Failed to remove bulk schedule:', error);
    }
}

/**
 * Remove people schedule
 */
async function removePeopleSchedule(index) {
    if (!confirm('Remove this schedule?')) return;

    try {
        const response = await chrome.runtime.sendMessage({
            action: 'removePeopleSchedule',
            index
        });

        if (response?.success) {
            await loadPeopleSchedulerStatus();
        }
    } catch (error) {
        console.error('Failed to remove people schedule:', error);
    }
}

/**
 * Toggle bulk scheduler
 */
export async function toggleBulkScheduler() {
    // Skip if automation is running
    const automationState = await chrome.storage.local.get(['bulkProcessingActive', 'peopleSearchActive']);
    if (automationState.bulkProcessingActive || automationState.peopleSearchActive) {
        console.log('⏭️ SKIPPED: toggleBulkScheduler (automation is running)');
        return;
    }
    
    const enabled = elements.bulkSchedulerEnabled?.checked;

    try {
        const response = await chrome.runtime.sendMessage({
            action: 'setBulkSchedulerEnabled',
            enabled
        });

        if (response?.success) {
            await loadBulkSchedulerStatus();
            // Silently update - no alert popup
            console.log(enabled ? '✅ Bulk Processing scheduler enabled!' : '⏸️ Bulk Processing scheduler disabled');
        }
    } catch (error) {
        console.error('Failed to toggle bulk scheduler:', error);
        if (elements.bulkSchedulerEnabled) {
            elements.bulkSchedulerEnabled.checked = !enabled;
        }
    }
}

/**
 * Toggle people scheduler
 */
export async function togglePeopleScheduler() {
    // Skip if automation is running
    const automationState = await chrome.storage.local.get(['bulkProcessingActive', 'peopleSearchActive']);
    if (automationState.bulkProcessingActive || automationState.peopleSearchActive) {
        console.log('⏭️ SKIPPED: togglePeopleScheduler (automation is running)');
        return;
    }
    
    const enabled = elements.peopleSchedulerEnabled?.checked;

    try {
        const response = await chrome.runtime.sendMessage({
            action: 'setPeopleSchedulerEnabled',
            enabled
        });

        if (response?.success) {
            await loadPeopleSchedulerStatus();
            // Silently update - no alert popup
            console.log(enabled ? '✅ People Search scheduler enabled!' : '⏸️ People Search scheduler disabled');
        }
    } catch (error) {
        console.error('Failed to toggle people scheduler:', error);
        if (elements.peopleSchedulerEnabled) {
            elements.peopleSchedulerEnabled.checked = !enabled;
        }
    }
}

// --- COUNTDOWN TIMER FUNCTIONS --- //
/**
 * Start countdown timers
 */
function startBulkCountdownTimer() {
    if (window.bulkCountdownInterval) {
        clearInterval(window.bulkCountdownInterval);
    }

    window.bulkCountdownInterval = setInterval(async () => {
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'getBulkSchedulerCountdown'
            });

            if (response?.success && elements.bulkCountdownTimer) {
                elements.bulkCountdownTimer.textContent = response.countdown;
            }
        } catch (error) {
            // Ignore
        }
    }, 1000);
}

function startPeopleCountdownTimer() {
    if (window.peopleCountdownInterval) {
        clearInterval(window.peopleCountdownInterval);
    }

    window.peopleCountdownInterval = setInterval(async () => {
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'getPeopleSchedulerCountdown'
            });

            if (response?.success && elements.peopleCountdownTimer) {
                elements.peopleCountdownTimer.textContent = response.countdown;
            }
        } catch (error) {
            // Ignore
        }
    }, 1000);
}

export async function checkDailyPostStatus() {
    chrome.runtime.sendMessage({
        action: 'getDailyPostStatus'
    }, (response) => {
        if (response && response.success) {
            const status = response.status;
            if (status.enabled && status.nextRun) {
                const nextRun = new Date(status.nextRun);
                if (elements.dailyPostEnabled) {
                    elements.dailyPostEnabled.textContent =
                        `✅ Enabled (Next: ${nextRun.toLocaleString()})`;
                    elements.dailyPostEnabled.style.color = '#28a745';
                }
                if (elements.dailyPostTime) {
                    elements.dailyPostTime.value = status.postTime;
                }
            } else {
                if (elements.dailyPostEnabled) {
                    elements.dailyPostEnabled.textContent = 'Not Scheduled';
                    elements.dailyPostEnabled.style.color = '#6c757d';
                }
            }
        }
    });
}
