import { elements, state } from './state.js';
import { loadAnalytics } from './analytics.js';
import { loadLeads } from './leads.js';
import { loadDrafts } from './postWriter.js';
import { loadSavedPosts, loadScheduledPosts, loadKeywordAlerts, loadCompetitors } from './content.js';
import { loadBulkSchedulerStatus, loadPeopleSchedulerStatus } from './scheduler.js';
import { updateKeywordCountDisplay } from './keywords.js';

// Update all slider displays
export function updateSliderDisplays() {
    // Automation sliders
    if (elements.keywordCountDisplay && elements.keywordCountSlider) {
        elements.keywordCountDisplay.textContent = elements.keywordCountSlider.value;
    }
    if (elements.bulkQuotaDisplay && elements.bulkQuota) {
        elements.bulkQuotaDisplay.textContent = elements.bulkQuota.value;
    }
    if (elements.bulkMinLikesDisplay && elements.bulkMinLikes) {
        elements.bulkMinLikesDisplay.textContent = elements.bulkMinLikes.value;
    }
    if (elements.bulkMinCommentsDisplay && elements.bulkMinComments) {
        elements.bulkMinCommentsDisplay.textContent = elements.bulkMinComments.value;
    }
    
    // Networking sliders
    if (elements.connectQuotaDisplay && elements.connectQuota) {
        elements.connectQuotaDisplay.textContent = elements.connectQuota.value;
    }

    // Daily limits sliders
    if (elements.dailyCommentLimitDisplay && elements.dailyCommentLimitInput) {
        elements.dailyCommentLimitDisplay.textContent = elements.dailyCommentLimitInput.value;
    }
    if (elements.dailyLikeLimitDisplay && elements.dailyLikeLimitInput) {
        elements.dailyLikeLimitDisplay.textContent = elements.dailyLikeLimitInput.value;
    }
    if (elements.dailyShareLimitDisplay && elements.dailyShareLimitInput) {
        elements.dailyShareLimitDisplay.textContent = elements.dailyShareLimitInput.value;
    }
    if (elements.dailyFollowLimitDisplay && elements.dailyFollowLimitInput) {
        elements.dailyFollowLimitDisplay.textContent = elements.dailyFollowLimitInput.value;
    }

    // Start delay sliders (with 's' suffix)
    if (elements.automationStartDelayDisplay && elements.automationStartDelay) {
        elements.automationStartDelayDisplay.textContent = elements.automationStartDelay.value + 's';
    }
    if (elements.networkingStartDelayDisplay && elements.networkingStartDelay) {
        elements.networkingStartDelayDisplay.textContent = elements.networkingStartDelay.value + 's';
    }
    if (elements.importStartDelayDisplay && elements.importStartDelay) {
        elements.importStartDelayDisplay.textContent = elements.importStartDelay.value + 's';
    }

    // Post writer delay sliders (with 's' suffix)
    if (elements.postWriterPageLoadDelayDisplay && elements.postWriterPageLoadDelay) {
        elements.postWriterPageLoadDelayDisplay.textContent = elements.postWriterPageLoadDelay.value + 's';
    }
    if (elements.postWriterClickDelayDisplay && elements.postWriterClickDelay) {
        elements.postWriterClickDelayDisplay.textContent = elements.postWriterClickDelay.value + 's';
    }
    if (elements.postWriterTypingDelayDisplay && elements.postWriterTypingDelay) {
        elements.postWriterTypingDelayDisplay.textContent = elements.postWriterTypingDelay.value + 's';
    }
    if (elements.postWriterSubmitDelayDisplay && elements.postWriterSubmitDelay) {
        elements.postWriterSubmitDelayDisplay.textContent = elements.postWriterSubmitDelay.value + 's';
    }

    // Search delay displays (with proper time formatting)
    if (elements.searchDelayMin && elements.searchDelayMinDisplay) {
        const value = parseInt(elements.searchDelayMin.value);
        elements.searchDelayMinDisplay.textContent = value >= 60 ? Math.round(value / 60) + 'm' : value + 's';
    }
    if (elements.searchDelayMax && elements.searchDelayMaxDisplay) {
        const value = parseInt(elements.searchDelayMax.value);
        elements.searchDelayMaxDisplay.textContent = value >= 60 ? Math.round(value / 60) + 'm' : value + 's';
    }

    // Comment delay displays (with proper time formatting)
    if (elements.commentDelayMin && elements.commentDelayMinDisplay) {
        const value = parseInt(elements.commentDelayMin.value);
        elements.commentDelayMinDisplay.textContent = value >= 60 ? Math.round(value / 60) + 'm' : value + 's';
    }
    if (elements.commentDelayMax && elements.commentDelayMaxDisplay) {
        const value = parseInt(elements.commentDelayMax.value);
        elements.commentDelayMaxDisplay.textContent = value >= 60 ? Math.round(value / 60) + 'm' : value + 's';
    }
    
    // Networking delay displays (with proper time formatting)
    if (elements.networkingDelayMin && elements.networkingDelayMinDisplay) {
        const value = parseInt(elements.networkingDelayMin.value);
        elements.networkingDelayMinDisplay.textContent = value >= 60 ? Math.round(value / 60) + 'm' : value + 's';
    }
    if (elements.networkingDelayMax && elements.networkingDelayMaxDisplay) {
        const value = parseInt(elements.networkingDelayMax.value);
        elements.networkingDelayMaxDisplay.textContent = value >= 60 ? Math.round(value / 60) + 'm' : value + 's';
    }

    // Post action delays (with proper time formatting)
    if (elements.beforeOpeningPostsDelay && elements.beforeOpeningPostsDelayDisplay) {
        const value = parseInt(elements.beforeOpeningPostsDelay.value);
        elements.beforeOpeningPostsDelayDisplay.textContent = value >= 60 ? Math.round(value / 60) + 'm' : value + 's';
    }
    if (elements.postPageLoadDelay && elements.postPageLoadDelayDisplay) {
        const value = parseInt(elements.postPageLoadDelay.value);
        elements.postPageLoadDelayDisplay.textContent = value >= 60 ? Math.round(value / 60) + 'm' : value + 's';
    }
    if (elements.beforeLikeDelay && elements.beforeLikeDelayDisplay) {
        const value = parseInt(elements.beforeLikeDelay.value);
        elements.beforeLikeDelayDisplay.textContent = value >= 60 ? Math.round(value / 60) + 'm' : value + 's';
    }
    if (elements.beforeCommentDelay && elements.beforeCommentDelayDisplay) {
        const value = parseInt(elements.beforeCommentDelay.value);
        elements.beforeCommentDelayDisplay.textContent = value >= 60 ? Math.round(value / 60) + 'm' : value + 's';
    }
    if (elements.beforeShareDelay && elements.beforeShareDelayDisplay) {
        const value = parseInt(elements.beforeShareDelay.value);
        elements.beforeShareDelayDisplay.textContent = value >= 60 ? Math.round(value / 60) + 'm' : value + 's';
    }
    if (elements.beforeFollowDelay && elements.beforeFollowDelayDisplay) {
        const value = parseInt(elements.beforeFollowDelay.value);
        elements.beforeFollowDelayDisplay.textContent = value >= 60 ? Math.round(value / 60) + 'm' : value + 's';
    }
}

// Save delay settings
export async function saveDelaySettings() {
    try {
        const searchDelaySettings = {
            minDelay: parseInt(elements.searchDelayMin?.value || 30),
            maxDelay: parseInt(elements.searchDelayMax?.value || 60)
        };

        const commentDelaySettings = {
            minDelay: parseInt(elements.commentDelayMin?.value || 60),
            maxDelay: parseInt(elements.commentDelayMax?.value || 180)
        };

        await chrome.storage.local.set({
            searchDelay: searchDelaySettings,
            commentDelayRange: commentDelaySettings
        });

        console.log('POPUP: Delay settings saved:', { searchDelaySettings, commentDelaySettings });
    } catch (error) {
        console.error('POPUP: Error saving delay settings:', error);
    }
}

// Save human simulation settings
export async function saveHumanSimulationSettings() {
    try {
        const humanSimulation = {
            mouseMovement: elements.humanMouseMovement?.checked || false,
            scrolling: elements.humanScrolling?.checked || false,
            readingPause: elements.humanReadingPause?.checked || false
        };

        await chrome.storage.local.set({ humanSimulation });
        console.log('POPUP: Human simulation settings saved:', humanSimulation);
    } catch (error) {
        console.error('POPUP: Error saving human simulation settings:', error);
    }
}

// Auto-save all form values to local storage
export async function saveAllFormValues() {
    // CRITICAL: Skip if automation is running to prevent message flooding
    const automationState = await chrome.storage.local.get(['bulkProcessingActive', 'peopleSearchActive']);
    if (automationState.bulkProcessingActive || automationState.peopleSearchActive) {
        console.log('⏭️ SKIPPED: saveAllFormValues (automation is running)');
        return; // Bail out immediately
    }
    
    try {
        const formData = {
            // Bulk processing settings
            bulkUrls: elements.bulkUrls?.value || '',
            bulkQuota: elements.bulkQuota?.value || '3',
            bulkMinLikes: elements.bulkMinLikes?.value || '0',
            bulkMinComments: elements.bulkMinComments?.value || '0',
            bulkLike: elements.bulkLike?.checked ?? false,
            bulkComment: elements.bulkComment?.checked ?? true,
            bulkLikeOrComment: elements.bulkLikeOrComment?.checked ?? false,
            bulkShare: elements.bulkShare?.checked ?? false,
            bulkFollow: elements.bulkFollow?.checked ?? false,
            ignoreKeywords: elements.ignoreKeywords?.value || 'hiring\nwe\'re hiring\njob opening\njoin our team\nwe are hiring\nlooking for\nopen position\nnow hiring\napply now',

            // Account and delay settings
            accountType: elements.accountType?.value || 'matured',

            // Search delay settings
            searchDelayMin: elements.searchDelayMin?.value || '30',
            searchDelayMax: elements.searchDelayMax?.value || '60',

            // Comment delay settings
            commentDelayMin: elements.commentDelayMin?.value || '60',
            commentDelayMax: elements.commentDelayMax?.value || '180',

            // Human simulation settings
            humanMouseMovement: elements.humanMouseMovement?.checked || false,
            humanScrolling: elements.humanScrolling?.checked || false,
            humanReadingPause: elements.humanReadingPause?.checked || false,

            // Business hours settings
            businessHoursEnabled: elements.businessHoursEnabled?.checked || false,
            businessStartHour: elements.businessStartHour?.value || '9',
            businessEndHour: elements.businessEndHour?.value || '18',
            allowWeekends: elements.allowWeekends?.checked || false,

            // Daily automation
            enableDailyProcessing: elements.enableDailyProcessing?.checked || false,

            // Keyword generation
            keywordCountSlider: elements.keywordCountSlider?.value || '15',

            // People Search settings
            searchKeyword: elements.searchKeyword?.value || '',
            connectQuota: elements.connectQuota?.value || '10',
            useBooleanSearch: elements.useBooleanSearch?.checked || false,
            filterNetwork: elements.filterNetwork?.checked || false,
            sendWithNote: elements.sendWithNote?.checked || false,
            sendConnectionRequest: elements.sendConnectionRequest?.checked ?? true, // Default true if not found
            extractContactInfo: elements.extractContactInfo?.checked || false,
            excludeHeadlineTerms: elements.excludeHeadlineTerms?.value || '',
            connectionMessage: elements.connectionMessage?.value || 'Hi, [Name]\n\nI just saw your profile, and I\'m amazed with your experience and would love to connect with you.',

            // Post Writer settings
            postTopic: elements.postTopic?.value || '',
            postTemplate: elements.postTemplate?.value || 'custom',
            postTone: elements.postTone?.value || 'professional',
            postLength: elements.postLength?.value || '1500',
            postIncludeHashtags: elements.postIncludeHashtags?.checked ?? false,
            postIncludeEmojis: elements.postIncludeEmojis?.checked !== false,
            postContent: elements.postContent?.value || '',
            scheduleDate: elements.scheduleDate?.value || '',
            scheduleTime: elements.scheduleTime?.value || '',

            // Automation Tab - Comment Settings
            commentGoal: elements.commentGoal?.value || 'value',
            commentTone: elements.commentTone?.value || 'professional',
            commentLength: elements.commentLength?.value || 'short',
            userExpertise: elements.userExpertise?.value || '',
            userBackground: elements.userBackground?.value || '',
            aiAutoPost: elements.aiAutoPost?.value || 'manual',
            openInWindow: elements.openInWindow?.value || 'window',
            keywordIntent: elements.keywordIntent?.value || '',
            bulkLikeOrComment: elements.bulkLikeOrComment?.checked || false,

            // Import Tab Settings
            profileUrlsInput: elements.profileUrlsInput?.value || '',
            importExtractContactInfo: elements.importExtractContactInfo?.checked || false,
            enableLikes: elements.enableLikes?.checked !== false,
            enableComments: elements.enableComments?.checked !== false,
            enableShares: elements.enableShares?.checked || false,
            enableFollows: elements.enableFollows?.checked || false,
            enableRandomMode: elements.enableRandomMode?.checked || false,
            postsPerProfile: elements.postsPerProfile?.value || '2',
            combinedSendConnections: elements.combinedSendConnections?.checked ?? true,
            combinedExtractContactInfo: elements.combinedExtractContactInfo?.checked || false,
            combinedEnableLikes: elements.combinedEnableLikes?.checked !== false,
            combinedEnableComments: elements.combinedEnableComments?.checked !== false,
            combinedEnableShares: elements.combinedEnableShares?.checked || false,
            combinedEnableFollows: elements.combinedEnableFollows?.checked || false,
            combinedEnableRandomMode: elements.combinedEnableRandomMode?.checked || false,
            combinedPostsPerProfile: elements.combinedPostsPerProfile?.value || '2',

            // Timestamp for tracking
            lastSaved: Date.now()
        };

        await chrome.storage.local.set({ formData });
        console.log('POPUP: All form values auto-saved');
    } catch (error) {
        console.error('POPUP: Error auto-saving form values:', error);
    }
}

// Load all saved form values
export async function loadAllFormValues() {
    try {
        const result = await chrome.storage.local.get('formData');
        const formData = result.formData;

        if (!formData) {
            console.log('POPUP: No saved form data found');
            return;
        }

        console.log('POPUP: Loading saved form values:', formData);

        // Restore bulk processing settings
        if (elements.bulkUrls) elements.bulkUrls.value = formData.bulkUrls || '';
        if (elements.bulkQuota) elements.bulkQuota.value = formData.bulkQuota || '3';
        if (elements.bulkMinLikes) elements.bulkMinLikes.value = formData.bulkMinLikes || '0';
        if (elements.bulkMinComments) elements.bulkMinComments.value = formData.bulkMinComments || '0';
        if (elements.bulkLike) elements.bulkLike.checked = formData.bulkLike ?? false;
        if (elements.bulkComment) elements.bulkComment.checked = formData.bulkComment ?? true;
        if (elements.bulkLikeOrComment) elements.bulkLikeOrComment.checked = formData.bulkLikeOrComment ?? false;
        if (elements.bulkShare) elements.bulkShare.checked = formData.bulkShare ?? false;
        if (elements.bulkFollow) elements.bulkFollow.checked = formData.bulkFollow ?? false;
        if (elements.ignoreKeywords) elements.ignoreKeywords.value = formData.ignoreKeywords || 'hiring\nwe\'re hiring\njob opening\njoin our team\nwe are hiring\nlooking for\nopen position\nnow hiring\napply now';

        // Restore account and delay settings
        if (elements.accountType) elements.accountType.value = formData.accountType || 'matured';

        // Restore search delay settings
        if (elements.searchDelayMin) elements.searchDelayMin.value = formData.searchDelayMin || '30';
        if (elements.searchDelayMax) elements.searchDelayMax.value = formData.searchDelayMax || '60';

        // Restore comment delay settings
        if (elements.commentDelayMin) elements.commentDelayMin.value = formData.commentDelayMin || '60';
        if (elements.commentDelayMax) elements.commentDelayMax.value = formData.commentDelayMax || '180';

        // Restore human simulation settings
        if (elements.humanMouseMovement) elements.humanMouseMovement.checked = formData.humanMouseMovement || false;
        if (elements.humanScrolling) elements.humanScrolling.checked = formData.humanScrolling || false;
        if (elements.humanReadingPause) elements.humanReadingPause.checked = formData.humanReadingPause || false;

        // Restore business hours settings
        if (elements.businessHoursEnabled) elements.businessHoursEnabled.checked = formData.businessHoursEnabled || false;
        if (elements.businessStartHour) elements.businessStartHour.value = formData.businessStartHour || '9';
        if (elements.businessEndHour) elements.businessEndHour.value = formData.businessEndHour || '18';
        if (elements.allowWeekends) elements.allowWeekends.checked = formData.allowWeekends || false;

        // Restore daily automation
        if (elements.enableDailyProcessing) elements.enableDailyProcessing.checked = formData.enableDailyProcessing || false;

        // Restore keyword generation
        if (elements.keywordCountSlider) elements.keywordCountSlider.value = formData.keywordCountSlider || '15';

        // Restore People Search settings
        if (elements.searchKeyword) elements.searchKeyword.value = formData.searchKeyword || '';
        if (elements.connectQuota) elements.connectQuota.value = formData.connectQuota || '10';
        if (elements.useBooleanSearch) elements.useBooleanSearch.checked = formData.useBooleanSearch || false;
        if (elements.filterNetwork) elements.filterNetwork.checked = formData.filterNetwork || false;
        // Handle mutually exclusive checkboxes - only one should be selected
        const savedSendWithNote = formData.sendWithNote || false;
        const savedSendConnectionRequest = formData.sendConnectionRequest;
        
        if (savedSendWithNote) {
            // If sendWithNote was saved as true, only check that one
            if (elements.sendWithNote) elements.sendWithNote.checked = true;
            if (elements.sendConnectionRequest) elements.sendConnectionRequest.checked = false;
        } else {
            // Default to sendConnectionRequest if neither is specifically saved
            if (elements.sendWithNote) elements.sendWithNote.checked = false;
            if (elements.sendConnectionRequest) elements.sendConnectionRequest.checked = savedSendConnectionRequest ?? true;
        }
        if (elements.extractContactInfo) elements.extractContactInfo.checked = formData.extractContactInfo || false;
        if (elements.excludeHeadlineTerms) elements.excludeHeadlineTerms.value = formData.excludeHeadlineTerms || '';
        if (elements.connectionMessage) elements.connectionMessage.value = formData.connectionMessage || 'Hi, [Name]\n\nI just saw your profile, and I\'m amazed with your experience and would love to connect with you.';

        // Restore Post Writer settings
        if (elements.postTopic) elements.postTopic.value = formData.postTopic || '';
        if (elements.postTemplate) elements.postTemplate.value = formData.postTemplate || 'custom';
        if (elements.postTone) elements.postTone.value = formData.postTone || 'professional';
        if (elements.postLength) elements.postLength.value = formData.postLength || '1500';
        if (elements.postIncludeHashtags) elements.postIncludeHashtags.checked = formData.postIncludeHashtags ?? false;
        if (elements.postIncludeEmojis) elements.postIncludeEmojis.checked = formData.postIncludeEmojis !== false;
        if (elements.postContent) elements.postContent.value = formData.postContent || '';
        if (elements.scheduleDate) elements.scheduleDate.value = formData.scheduleDate || '';
        if (elements.scheduleTime) elements.scheduleTime.value = formData.scheduleTime || '';

        // Restore Automation Tab - Comment Settings
        if (elements.commentGoal) elements.commentGoal.value = formData.commentGoal || 'value';
        if (elements.commentTone) elements.commentTone.value = formData.commentTone || 'professional';
        if (elements.commentLength) elements.commentLength.value = formData.commentLength || 'short';
        if (elements.userExpertise) elements.userExpertise.value = formData.userExpertise || '';
        if (elements.userBackground) elements.userBackground.value = formData.userBackground || '';
        if (elements.aiAutoPost) elements.aiAutoPost.value = formData.aiAutoPost || 'manual';
        if (elements.openInWindow) elements.openInWindow.value = formData.openInWindow || 'window';
        if (elements.keywordIntent) elements.keywordIntent.value = formData.keywordIntent || '';
        if (elements.bulkLikeOrComment) elements.bulkLikeOrComment.checked = formData.bulkLikeOrComment || false;

        // Restore Import Tab Settings
        if (elements.profileUrlsInput) elements.profileUrlsInput.value = formData.profileUrlsInput || '';
        if (elements.importExtractContactInfo) elements.importExtractContactInfo.checked = formData.importExtractContactInfo || false;
        if (elements.enableLikes) elements.enableLikes.checked = formData.enableLikes !== false;
        if (elements.enableComments) elements.enableComments.checked = formData.enableComments !== false;
        if (elements.enableShares) elements.enableShares.checked = formData.enableShares || false;
        if (elements.enableFollows) elements.enableFollows.checked = formData.enableFollows || false;
        if (elements.enableRandomMode) elements.enableRandomMode.checked = formData.enableRandomMode || false;
        if (elements.postsPerProfile) elements.postsPerProfile.value = formData.postsPerProfile || '2';
        if (elements.combinedSendConnections) elements.combinedSendConnections.checked = formData.combinedSendConnections ?? true;
        if (elements.combinedExtractContactInfo) elements.combinedExtractContactInfo.checked = formData.combinedExtractContactInfo || false;
        if (elements.combinedEnableLikes) elements.combinedEnableLikes.checked = formData.combinedEnableLikes !== false;
        if (elements.combinedEnableComments) elements.combinedEnableComments.checked = formData.combinedEnableComments !== false;
        if (elements.combinedEnableShares) elements.combinedEnableShares.checked = formData.combinedEnableShares || false;
        if (elements.combinedEnableFollows) elements.combinedEnableFollows.checked = formData.combinedEnableFollows || false;
        if (elements.combinedEnableRandomMode) elements.combinedEnableRandomMode.checked = formData.combinedEnableRandomMode || false;
        if (elements.combinedPostsPerProfile) elements.combinedPostsPerProfile.value = formData.combinedPostsPerProfile || '2';

        // Update all displays
        updateSliderDisplays();
        updateKeywordCountDisplay();

        console.log('POPUP: Form values restored successfully');
    } catch (error) {
        console.error('POPUP: Error loading saved form values:', error);
    }
}

// --- BUSINESS HOURS MANAGEMENT --- //
export async function updateBusinessHours() {
    // Skip if automation is running
    const automationState = await chrome.storage.local.get(['bulkProcessingActive', 'peopleSearchActive']);
    if (automationState.bulkProcessingActive || automationState.peopleSearchActive) {
        console.log('⏭️ SKIPPED: updateBusinessHours (automation is running)');
        return;
    }
    
    const settings = {
        enabled: elements.businessHoursEnabled?.checked || false,
        startHour: parseInt(elements.businessStartHour?.value, 10) || 9,
        endHour: parseInt(elements.businessEndHour?.value, 10) || 18,
        allowWeekends: elements.allowWeekends?.checked || false
    };

    try {
        const response = await chrome.runtime.sendMessage({
            action: 'updateBusinessHours',
            settings: settings
        });

        if (response && response.success) {
            console.log('Business hours updated successfully');
            await updateBusinessHoursStatus();
        }
    } catch (error) {
        console.error('Failed to update business hours:', error);
    }
}

export async function updateBusinessHoursStatus() {
    try {
        const response = await chrome.runtime.sendMessage({
            action: 'getBusinessHoursStatus'
        });

        if (response && response.success) {
            const status = response.status;
            const statusText = status.withinBusinessHours
                ? `✅ Active (${status.currentHour}:00 within ${status.businessStart}:00-${status.businessEnd}:00)`
                : `⏰ Inactive (Next: ${status.nextBusinessHours})`;

            if (elements.businessHoursStatus) {
                elements.businessHoursStatus.textContent = statusText;
            }

            // Update daily schedule info
            if (elements.dailyScheduleInfo) {
                const scheduleText = status.dailyScheduleEnabled
                    ? `📅 Daily processing enabled with ${status.dailyKeywords} keywords`
                    : '📅 Daily processing disabled';
                elements.dailyScheduleInfo.textContent = scheduleText;
            }
        }
    } catch (error) {
        console.error('Failed to get business hours status:', error);
    }
}

export async function saveDailyScheduleSettings() {
    // Skip if automation is running
    const automationState = await chrome.storage.local.get(['bulkProcessingActive', 'peopleSearchActive']);
    if (automationState.bulkProcessingActive || automationState.peopleSearchActive) {
        console.log('⏭️ SKIPPED: saveDailyScheduleSettings (automation is running)');
        return;
    }
    
    const keywords = elements.bulkUrls.value.trim().split('\n').filter(k => k.trim());
    const isEnabled = elements.dailyScheduleEnabled?.checked || false;

    // Allow disabling even without keywords, but require keywords to enable
    if (isEnabled && keywords.length === 0) {
        alert('Please add some keywords first before enabling daily schedule');
        elements.dailyScheduleEnabled.checked = false;
        return;
    }

    const schedule = {
        enabled: isEnabled,
        keywords: keywords,
        quota: parseInt(elements.bulkQuota?.value, 10) || 20,
        qualification: {
            minLikes: parseInt(elements.bulkMinLikes?.value, 10) || 0,
            minComments: parseInt(elements.bulkMinComments?.value, 10) || 0
        },
        actions: {
            like: elements.bulkLike?.checked || false,
            comment: elements.bulkComment?.checked || false,
            share: elements.bulkShare?.checked || false,
            follow: elements.bulkFollow?.checked || false
        },
        delaySettings: {
            accountType: elements.accountType?.value || 'matured',
            commentDelay: parseInt(elements.commentDelay?.value, 10) || 180
        }
    };

    try {
        const response = await chrome.runtime.sendMessage({
            action: 'updateDailySchedule',
            schedule: schedule
        });

        if (response && response.success) {
            console.log(`✅ Daily schedule ${schedule.enabled ? 'enabled' : 'disabled'} successfully!`);
            await updateBusinessHoursStatus();
        }
    } catch (error) {
        console.error('Failed to save daily schedule:', error);
        alert('❌ Failed to save daily schedule. Check console for errors.');
    }
}

// --- SYSTEM TESTING --- //
export async function testAllSystems() {
    if (elements.testSystems) {
        elements.testSystems.disabled = true;
        elements.testSystems.textContent = '🔄 Testing...';
    }

    let allPassed = true;

    // Test 1: Service Worker
    try {
        const response = await chrome.runtime.sendMessage({ action: 'ping' });
        if (elements.serviceWorkerStatus) {
            elements.serviceWorkerStatus.innerHTML = '✅ Active';
            elements.serviceWorkerStatus.style.color = '#28a745';
        }
    } catch (error) {
        allPassed = false;
        if (elements.serviceWorkerStatus) {
            elements.serviceWorkerStatus.innerHTML = '❌ Inactive';
            elements.serviceWorkerStatus.style.color = '#dc3545';
        }
    }

    // Test 2: Business Hours
    try {
        const response = await chrome.runtime.sendMessage({ action: 'getBusinessHoursStatus' });
        if (response && response.success) {
            const status = response.status;
            const indicator = status.withinBusinessHours ? '✅ Active' : '⏰ Outside Hours';
            const color = status.withinBusinessHours ? '#28a745' : '#ffc107';

            if (elements.businessHoursIndicator) {
                elements.businessHoursIndicator.textContent = indicator;
                elements.businessHoursIndicator.style.color = color;
            }
        }
    } catch (error) {
        allPassed = false;
        if (elements.businessHoursIndicator) {
            elements.businessHoursIndicator.innerHTML = '❌ Error';
            elements.businessHoursIndicator.style.color = '#dc3545';
        }
    }

    // Test 3: OpenAI Integration
    try {
        const response = await chrome.runtime.sendMessage({
            action: 'generateWithOpenAI',
            prompt: 'Generate 3 test keywords for LinkedIn marketing',
            maxTokens: 100
        });

        if (response && response.success) {
            if (elements.openaiStatus) {
                elements.openaiStatus.innerHTML = '✅ Working';
                elements.openaiStatus.style.color = '#28a745';
            }
        } else {
            throw new Error('OpenAI test failed');
        }
    } catch (error) {
        allPassed = false;
        if (elements.openaiStatus) {
            elements.openaiStatus.innerHTML = '❌ Error';
            elements.openaiStatus.style.color = '#dc3545';
        }
    }

    // Update timestamp
    if (elements.statusTimestamp) {
        elements.statusTimestamp.textContent = new Date().toLocaleTimeString();
    }

    // Reset button
    if (elements.testSystems) {
        elements.testSystems.disabled = false;
        elements.testSystems.textContent = allPassed ? '✅ All Systems OK' : '⚠️ Issues Found';

        setTimeout(() => {
            elements.testSystems.textContent = '🧪 Test All Systems';
        }, 3000);
    }

    return allPassed;
}

// Auto-test systems on load
export async function updateSystemStatus() {
    // Quick status check without user interaction
    try {
        // Check business hours
        const bhResponse = await chrome.runtime.sendMessage({ action: 'getBusinessHoursStatus' });
        if (bhResponse && bhResponse.success && elements.businessHoursIndicator) {
            const status = bhResponse.status;
            const indicator = status.withinBusinessHours ? '✅ Active' : '⏰ Outside Hours';
            const color = status.withinBusinessHours ? '#28a745' : '#ffc107';
            elements.businessHoursIndicator.textContent = indicator;
            elements.businessHoursIndicator.style.color = color;
        }

        // Update timestamp
        if (elements.statusTimestamp) {
            elements.statusTimestamp.textContent = new Date().toLocaleTimeString();
        }
    } catch (error) {
        console.error('System status update failed:', error);
    }
}

export function savePreferences() {
    state.preferences.commentTone = elements.commentTone?.value;
    state.preferences.commentLength = elements.commentLength?.value;
    state.preferences.useCheapModel = elements.useCheapModel?.checked || false;
    state.preferences.automationQuota = parseInt(elements.autoQuota?.value, 10);
    state.preferences.automationPostAge = elements.autoPostAge?.value;
    chrome.storage.local.set({ preferences: state.preferences });
}
