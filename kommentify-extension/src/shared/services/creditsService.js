// Credits Service for Import Tab
export class CreditsService {
    constructor() {
        this.baseUrl = 'https://kommentify.com/api';
    }

    /**
     * Get import credits status for current user
     */
    async getImportCredits() {
        try {
            const token = await this.getAuthToken();
            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await fetch(`${this.baseUrl}/usage/import-credits`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || 'Failed to get credits');
            }

            console.log('📊 CREDITS: Current status:', data.credits);
            return data.credits;
        } catch (error) {
            console.error('❌ CREDITS: Failed to get credits:', error);
            throw error;
        }
    }

    /**
     * Check if user has enough credits for import processing
     * @param {number} profileCount - Number of profiles to process
     */
    async checkCreditsAvailable(profileCount = 1) {
        try {
            const credits = await this.getImportCredits();
            return {
                hasCredits: credits.remaining >= profileCount,
                remaining: credits.remaining,
                needed: profileCount,
                total: credits.total,
                used: credits.used
            };
        } catch (error) {
            console.error('❌ CREDITS: Failed to check credits:', error);
            return {
                hasCredits: false,
                remaining: 0,
                needed: profileCount,
                error: error.message
            };
        }
    }

    /**
     * Track import profile usage (increment by 1)
     */
    async trackImportUsage() {
        try {
            const token = await this.getAuthToken();
            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await fetch(`${this.baseUrl}/usage/track`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    actionType: 'importProfile'
                })
            });

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || 'Failed to track usage');
            }

            console.log('✅ CREDITS: Import usage tracked, remaining credits:', data.usage.importProfiles);
            return data;
        } catch (error) {
            console.error('❌ CREDITS: Failed to track usage:', error);
            throw error;
        }
    }

    /**
     * Get authentication token from storage
     */
    async getAuthToken() {
        return new Promise(async (resolve) => {
            // Try local storage first
            chrome.storage.local.get(['authToken'], (localResult) => {
                if (localResult.authToken) {
                    resolve(localResult.authToken);
                } else {
                    // Fallback to sync storage
                    chrome.storage.sync.get(['authToken'], (syncResult) => {
                        resolve(syncResult.authToken || null);
                    });
                }
            });
        });
    }

    /**
     * Update UI with credits information
     */
    updateCreditsUI(credits) {
        try {
            const remainingEl = document.getElementById('import-credits-remaining');
            const totalEl = document.getElementById('import-credits-total');
            const usedEl = document.getElementById('import-credits-used');
            const planEl = document.getElementById('import-plan-name');

            if (remainingEl) remainingEl.textContent = credits.remaining || '0';
            if (totalEl) totalEl.textContent = credits.total || '0';
            if (usedEl) usedEl.textContent = credits.used || '0';
            if (planEl) planEl.textContent = credits.planName || 'Free';

            // Update colors based on remaining credits
            if (remainingEl) {
                if (credits.remaining <= 0) {
                    remainingEl.style.color = '#f44336'; // Red
                } else if (credits.remaining <= 5) {
                    remainingEl.style.color = '#ff9800'; // Orange
                } else {
                    remainingEl.style.color = '#4caf50'; // Green
                }
            }
        } catch (error) {
            console.error('❌ CREDITS: Failed to update UI:', error);
        }
    }
}
