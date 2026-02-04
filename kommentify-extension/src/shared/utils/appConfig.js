// This file can no longer import browser.js because it runs in a context
// where chrome.* APIs are not available.

const isProduction = true; // Set to false for development

const appConfig = {
    environment: isProduction ? "production" : "development",
    appName: "auto-engagement-extension",
    // [FIX] Hardcoded the version. The content script cannot access chrome.runtime.getManifest().
    appVersion: "1.3.4",
    doormanKey: "ec7847b48a0426a1ca41d3582bd43f52",

    // --- URLs --- //
    host: isProduction ? "https://services.ai" : "http://localhost:5000",
    
    // --- Assets --- //
    // Getter function to ensure chrome.runtime is available when accessed
    get spinnerUrl() { 
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
            return chrome.runtime.getURL('assets/images/spinner.gif');
        }
        return '../assets/images/spinner.gif'; // Fallback
    },
    
    // API Endpoints
    get refreshTokensUrl() { return `${this.host}/api/auth/refresh-tokens` },
    get generateCompletionUrl() { return `${this.host}/api/commentron/generate-completion` },
    get engagementsUrl() { return `${this.host}/api/commentron/engagements` },
    get peepUrl() { return `${this.host}/api/commentron/peep` },
    get frontErrorUrl() { return `${this.host}/api/logging/front-error` },
};

export { appConfig };