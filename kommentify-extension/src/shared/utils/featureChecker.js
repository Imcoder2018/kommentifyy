/**
 * FEATURE PERMISSION CHECKER
 * Checks if user's plan allows specific features
 */

const API_CONFIG = {
    BASE_URL: 'https://kommentify.com'
};

export class FeatureChecker {
    constructor() {
        this.features = null;
        this.lastChecked = null;
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Get user's plan features from backend
     */
    async getUserFeatures(forceRefresh = false) {
        try {
            // Return cached features if available and fresh
            if (!forceRefresh && this.features && this.lastChecked) {
                const timeSinceCheck = Date.now() - this.lastChecked;
                if (timeSinceCheck < this.cacheTimeout) {
                    console.log('FEATURES: Using cached features');
                    return this.features;
                }
            }

            const storage = await chrome.storage.local.get(['authToken', 'apiBaseUrl', 'userData']);
            const token = storage.authToken;
            const apiUrl = storage.apiBaseUrl || API_CONFIG.BASE_URL;

            if (!token) {
                console.warn('FEATURES: No auth token found');
                return this.getDefaultFeatures(false);
            }

            // Try to get from userData first (faster)
            if (storage.userData && storage.userData.plan && !forceRefresh) {
                const plan = storage.userData.plan;
                this.features = {
                    autoLike: plan.allowAutomation !== false,
                    autoComment: plan.allowAiCommentGeneration || false,
                    autoFollow: plan.allowNetworking || false,
                    aiContent: plan.allowAiPostGeneration || false,
                    aiPostGeneration: plan.allowAiPostGeneration || false,
                    aiTopicLines: plan.allowAiTopicLines !== false,
                    scheduling: plan.allowPostScheduling || false,
                    automationScheduling: plan.allowAutomationScheduling || false,
                    analytics: plan.allowCsvExport || false,
                    importProfiles: plan.allowImportProfiles !== false
                };
                this.lastChecked = Date.now();
                console.log('FEATURES: Loaded from userData:', this.features);
                return this.features;
            }

            // Fetch from backend
            const response = await fetch(`${apiUrl}/api/auth/validate`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                console.error('FEATURES: Failed to fetch from backend');
                return this.getDefaultFeatures(false);
            }

            const data = await response.json();
            
            if (data.success && data.features) {
                this.features = data.features;
                this.lastChecked = Date.now();
                console.log('FEATURES: Loaded from backend:', this.features);
                return this.features;
            }

            console.warn('FEATURES: No features in response');
            return this.getDefaultFeatures(false);

        } catch (error) {
            console.error('FEATURES: Error getting features:', error);
            return this.getDefaultFeatures(false);
        }
    }

    /**
     * Get default features (all disabled for security)
     */
    getDefaultFeatures(allEnabled = false) {
        return {
            autoLike: allEnabled,
            autoComment: allEnabled,
            autoFollow: allEnabled,
            aiContent: allEnabled,
            aiPostGeneration: allEnabled,
            aiTopicLines: allEnabled,
            scheduling: allEnabled,
            automationScheduling: allEnabled,
            analytics: allEnabled,
            importProfiles: allEnabled
        };
    }

    /**
     * Check if a specific feature is allowed
     */
    async checkFeature(featureName) {
        const features = await this.getUserFeatures();
        const isAllowed = features[featureName] === true;
        
        if (!isAllowed) {
            console.warn(`FEATURES: Feature "${featureName}" is not allowed in current plan`);
        }
        
        return isAllowed;
    }

    /**
     * Check and throw error if feature not allowed
     */
    async requireFeature(featureName, customMessage = null) {
        const isAllowed = await this.checkFeature(featureName);
        
        if (!isAllowed) {
            const message = customMessage || `This feature requires a plan upgrade. "${featureName}" is not available in your current plan.`;
            throw new Error(message);
        }
        
        return true;
    }

    /**
     * Get upgrade message for a feature
     */
    getUpgradeMessage(featureName) {
        const messages = {
            autoLike: 'General Automation feature requires a paid plan. Upgrade to automate your LinkedIn engagement!',
            autoComment: 'Auto-comment feature requires a paid plan. Upgrade to use AI-powered comments!',
            autoFollow: 'Auto-follow feature requires a paid plan. Upgrade to grow your network automatically!',
            aiContent: 'AI content generation requires a paid plan. Upgrade to create posts with AI!',
            aiTopicLines: 'AI topic lines require a paid plan. Upgrade to get AI-generated topic suggestions!',
            scheduling: 'Post scheduling requires a paid plan. Upgrade to schedule your content!',
            automationScheduling: 'Automation Scheduling requires a paid plan. Upgrade to schedule automated bulk processing!',
            analytics: 'Analytics and CSV export require a paid plan. Upgrade for detailed insights!',
            importProfiles: 'Import Profiles Auto Engagement requires a paid plan. Upgrade to automate engagement with imported profiles!'
        };
        
        return messages[featureName] || `This feature requires a plan upgrade.`;
    }

    /**
     * Show upgrade prompt for a feature
     */
    async showUpgradePrompt(featureName) {
        const message = this.getUpgradeMessage(featureName);
        
        // Try to show in extension UI
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'showUpgradePrompt',
                feature: featureName,
                message: message
            });
            console.log('FEATURES: Upgrade prompt shown:', featureName);
        } catch (error) {
            console.error('FEATURES: Failed to show upgrade prompt:', error);
        }
    }

    /**
     * Clear cached features (call when plan changes)
     */
    clearCache() {
        this.features = null;
        this.lastChecked = null;
        console.log('FEATURES: Cache cleared');
    }
}

// Export singleton instance
export const featureChecker = new FeatureChecker();
