/**
 * Settings Sync Service
 * Fetches automation settings, commenter config, and import config from the website API
 * and applies them to chrome.storage.local so the extension uses website-configured values.
 */

const API_BASE = 'https://kommentify.com';

/**
 * Sync all settings from the website to chrome.storage.local
 */
export async function syncAllSettingsFromWebsite() {
    try {
        const storage = await chrome.storage.local.get(['authToken', 'apiBaseUrl']);
        const token = storage.authToken;
        const apiUrl = storage.apiBaseUrl || API_BASE;

        if (!token) {
            console.log('⚙️ SYNC: No auth token, skipping settings sync');
            return;
        }

        console.log('⚙️ SYNC: Syncing all settings from website...');

        // Sync in parallel
        await Promise.allSettled([
            syncAutomationSettings(token, apiUrl),
            syncCommenterConfig(token, apiUrl),
            syncImportConfig(token, apiUrl),
        ]);

        console.log('✅ SYNC: All settings synced from website');
    } catch (error) {
        console.error('❌ SYNC: Error syncing settings:', error);
    }
}

/**
 * Sync automation settings (limits & delays) from website
 */
async function syncAutomationSettings(token, apiUrl) {
    try {
        const response = await fetch(`${apiUrl}/api/automation-settings`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) return;

        const data = await response.json();
        if (!data.success || !data.settings) return;

        const s = data.settings;

        // Map website DB fields to extension chrome.storage.local fields
        const delaySettings = {
            automationStartDelay: s.automationStartDelay,
            networkingStartDelay: s.networkingStartDelay,
            importStartDelay: s.importStartDelay,
            searchMinDelay: s.searchDelayMin,
            searchMaxDelay: s.searchDelayMax,
            commentMinDelay: s.commentDelayMin,
            commentMaxDelay: s.commentDelayMax,
            networkingMinDelay: s.networkingDelayMin,
            networkingMaxDelay: s.networkingDelayMax,
            beforeOpeningPostsDelay: s.beforeOpeningDelay,
            postPageLoadDelay: s.postPageLoadDelay,
            beforeLikeDelay: s.beforeLikeDelay,
            beforeCommentDelay: s.beforeCommentDelay,
            beforeShareDelay: s.beforeShareDelay,
            beforeFollowDelay: s.beforeFollowDelay,
            postWriterPageLoadDelay: s.postWriterPageLoad,
            postWriterClickDelay: s.postWriterClick,
            postWriterTypingDelay: s.postWriterTyping,
            postWriterSubmitDelay: s.postWriterSubmit,
        };

        const dailyLimits = {
            comments: s.dailyCommentLimit,
            likes: s.dailyLikeLimit,
            shares: s.dailyShareLimit,
            follows: s.dailyFollowLimit,
        };

        const humanSimulation = {
            mouseMovement: s.mouseMovement,
            scrolling: s.scrollSimulation,
            readingPause: s.readingPause,
        };

        const randomIntervalSettings = {
            minInterval: s.randomIntervalMin,
            maxInterval: s.randomIntervalMax,
            enabled: s.randomDelayEnabled !== false,
        };

        await chrome.storage.local.set({
            delaySettings,
            dailyLimits,
            humanSimulation,
            randomIntervalSettings,
            accountPreset: s.accountPreset,
            baseDelay: s.baseDelay || 5,
            randomDelayEnabled: s.randomDelayEnabled !== false,
            limitsPresetApplied: true,
        });

        console.log('✅ SYNC: Automation settings synced from website');
    } catch (error) {
        console.error('❌ SYNC: Error syncing automation settings:', error);
    }
}

/**
 * Sync commenter config from website
 */
async function syncCommenterConfig(token, apiUrl) {
    try {
        const response = await fetch(`${apiUrl}/api/commenter-config`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) return;

        const data = await response.json();
        if (!data.success || !data.config) return;

        const c = data.config;

        // Store commenter config so the extension can read it
        await chrome.storage.local.set({
            commenterConfig: {
                postSource: c.postSource,
                searchKeywords: c.searchKeywords,
                savePosts: c.savePosts,
                likePosts: c.likePosts,
                commentOnPosts: c.commentOnPosts,
                likeOrComment: c.likeOrComment,
                sharePosts: c.sharePosts,
                followAuthors: c.followAuthors,
                totalPosts: c.totalPosts,
                minLikes: c.minLikes,
                minComments: c.minComments,
                ignoreKeywords: c.ignoreKeywords,
                schedules: c.schedules,
                autoScheduleEnabled: c.autoScheduleEnabled,
            }
        });

        console.log('✅ SYNC: Commenter config synced from website');
    } catch (error) {
        console.error('❌ SYNC: Error syncing commenter config:', error);
    }
}

/**
 * Sync import config from website
 */
async function syncImportConfig(token, apiUrl) {
    try {
        const response = await fetch(`${apiUrl}/api/import-config`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) return;

        const data = await response.json();
        if (!data.success || !data.config) return;

        const c = data.config;

        // Store import config so the extension can read it
        await chrome.storage.local.set({
            importConfig: {
                profileUrls: c.profileUrls,
                profilesPerDay: c.profilesPerDay,
                sendConnections: c.sendConnections,
                engageLikes: c.engageLikes,
                engageComments: c.engageComments,
                engageShares: c.engageShares,
                engageFollows: c.engageFollows,
                smartRandom: c.smartRandom,
                postsPerProfile: c.postsPerProfile,
                schedules: c.schedules,
                autoScheduleEnabled: c.autoScheduleEnabled,
            }
        });

        // Also update pendingImportProfiles if there are URLs
        if (c.profileUrls && c.profileUrls.trim()) {
            const urls = c.profileUrls.split('\n')
                .map(u => u.trim())
                .filter(u => u.includes('linkedin.com/in/'));
            if (urls.length > 0) {
                await chrome.storage.local.set({ pendingImportProfiles: urls });
            }
        }

        console.log('✅ SYNC: Import config synced from website');
    } catch (error) {
        console.error('❌ SYNC: Error syncing import config:', error);
    }
}
