/**
 * Shared Configuration
 * Central source of truth for API URLs, defaults, and limits.
 */

// API Configuration
export const API_CONFIG = {
    // Use production server
    BASE_URL: 'https://kommentify.com',
    // Local development URL: 'http://localhost:3000'
    ENDPOINTS: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        VALIDATE: '/api/auth/validate',
        GENERATE_TOPICS: '/api/ai/generate-topics',
        PLANS: '/api/plans'
    }
};

// Default Delay Settings (in seconds)
export const DEFAULT_DELAYS = {
    postWriterPageLoadDelay: 10,
    postWriterClickDelay: 5,
    postWriterTypingDelay: 5,
    postWriterSubmitDelay: 3
};

// Default Daily Limits
export const DEFAULT_LIMITS = {
    dailyComments: 50,
    dailyLikes: 100,
    dailyShares: 20,
    dailyFollows: 50
};
