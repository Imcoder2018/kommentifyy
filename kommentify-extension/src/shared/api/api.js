import { appConfig } from '../utils/appConfig.js';
import { storage } from '../storage/storage.js';
import * as T from '../storage/constants.js';

// --- Axios Interceptor Setup --- //
const isTokenAboutToExpire = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiryTime = payload.exp * 1000;
        const oneMinute = 60 * 1000;
        return Date.now() >= expiryTime - oneMinute;
    } catch {
        return true;
    }
};

class ApiService {
    constructor() {
        // The axios instance is attached later by initApi()
        this.axiosInstance = null;
    }

    async generateComment(engagee, urn, postAuthor, postText, preferences) {
        const profile = await storage.getObject('profile');
        const payload = {
            seat: profile.seat, engagee, urn,
            engagementType: T.EngagementType.Comment,
            postAuthor, postText, ...preferences
        };
        const response = await this.axiosInstance.post(appConfig.generateCompletionUrl, payload);
        return response.data;
    }

    async generateReply(engagee, urn, postAuthor, postText, commentText, me, preferences) {
        const profile = await storage.getObject('profile');
        const payload = {
            seat: profile.seat, engagee, urn,
            engagementType: T.EngagementType.Reply,
            postAuthor, postText, commentText, me, ...preferences
        };
        const response = await this.axiosInstance.post(appConfig.generateCompletionUrl, payload);
        return response.data;
    }
    
    async engaged(engagee, urn, engagementType, isAutomation = false) {
        // Old API endpoint removed - statistics are now tracked locally
        console.log('ENGAGEMENT:', engagementType, urn);
    }

    async peep(me, imageUrl, engagementType, engagementUrl) {
       const account = await storage.getObject('account');
       const isSignIn = !!(account && account.subscriberId);
       await this.axiosInstance.post(appConfig.peepUrl, {
           me, imageUrl, isSignIn, engagementType, engagementUrl
       });
    }

    async logFrontError(caughtAt, error) {
        try {
            const profile = await storage.getObject('profile');
            const payload = {
                environment: appConfig.environment,
                app: appConfig.appName,
                version: appConfig.appVersion,
                url: window.location.href,
                caughtAt,
                name: error.name,
                message: error.message,
                stack: error.stack,
                seat: profile ? profile.seat : 'unknown'
            };
            // Use the global window.axios for logging to avoid interceptor loops
            await window.axios.post(appConfig.frontErrorUrl, payload, { headers: {'x-doorman': appConfig.doormanKey } });
        } catch (loggingError) {
            console.error("Failed to log error:", loggingError);
        }
    }
}

// Export a single, uninitialized instance of the service
export const api = new ApiService();

// Export the initializer function. This is the key to fixing the race condition.
export function initApi() {
    // This function is called only AFTER axios is loaded.
    const axiosInstance = window.axios;
    api.axiosInstance = axiosInstance; // Attach the ready instance to our service object

    axiosInstance.interceptors.request.use(async(config) => {
        config.headers['x-doorman'] = appConfig.doormanKey;
        let account = await storage.getObject('account');

        if (account && account.accessToken && isTokenAboutToExpire(account.accessToken)) {
            try {
                const response = await window.axios.post(appConfig.refreshTokensUrl, null, {
                    headers: { 'x-refresh-token': account.refreshToken, 'x-doorman': appConfig.doormanKey }
                });
                account.accessToken = response.data.accessToken;
                account.refreshToken = response.data.refreshToken;
                await storage.setObject('account', account);
            } catch (error) {
                console.error("Token refresh failed:", error);
                await storage.setObject('account', {});
            }
        }

        account = await storage.getObject('account');
        if (account && account.accessToken) {
            config.headers.Authorization = `Bearer ${account.accessToken}`;
        }
        return config;
    });
}