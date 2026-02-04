/**
 * ENHANCED POPUP SCRIPT
 * Main entry point for the extension popup
 */

import { API_CONFIG } from './shared/config.js';
import { state } from './components/js/state.js';
import { validateJWTToken, showLoginScreen } from './components/js/auth.js';
import { initializeUI } from './components/js/ui.js';

// Global Error Handling
window.onerror = function (msg, url, line, col, error) {
    console.error('Global Error:', { msg, url, line, col, error });
    // Try to show error in UI if possible
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #dc3545;">
                <h3>Something went wrong</h3>
                <p>${msg}</p>
                <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; background: #693fe9; color: white; border: none; borderRadius: 4px; cursor: pointer;">Reload</button>
            </div>
        `;
    }
    return false;
};

window.addEventListener('unhandledrejection', function (event) {
    console.error('Unhandled Promise Rejection:', event.reason);
});

document.addEventListener('DOMContentLoaded', function () {
    function checkApiAndInitialize() {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            initializePopup();
        } else {
            setTimeout(checkApiAndInitialize, 50);
        }
    }
    checkApiAndInitialize();
});

async function initializePopup() {
    console.log('=== INITIALIZING POPUP ===');
    console.log('Chrome storage available:', typeof chrome !== 'undefined' && chrome.storage);

    try {
        // Check if automation is running - if so, use lightweight mode
        const automationState = await chrome.storage.local.get(['bulkProcessingActive', 'peopleSearchActive']);
        const isAutomationRunning = automationState.bulkProcessingActive || automationState.peopleSearchActive;
        
        if (isAutomationRunning) {
            console.log('⚡ LIGHTWEIGHT MODE: Automation is running, skipping heavy initialization');
            // Still show UI but skip heavy operations
            await initializeUI();
            return;
        }
        
        // CLEAR ANY OLD TEST DATA FIRST  
        const storage = await chrome.storage.local.get(['authToken']);
        console.log('Initial storage check:', storage);

        if (storage.authToken && storage.authToken.includes('test-signature')) {
            console.log('Clearing old test data');
            await chrome.storage.local.remove(['authToken', 'userData', 'refreshToken']);
        }

        // Check authentication - MANDATORY now
        const authData = await chrome.storage.local.get(['authToken', 'userData', 'apiBaseUrl']);
        console.log('Auth data from storage:', {
            hasToken: !!authData.authToken,
            tokenLength: authData.authToken ? authData.authToken.length : 0,
            hasUserData: !!authData.userData,
            userData: authData.userData,
            apiBaseUrl: authData.apiBaseUrl
        });

        // Ensure apiBaseUrl is set to production backend
        if (!authData.apiBaseUrl) {
            await chrome.storage.local.set({
                apiBaseUrl: API_CONFIG.BASE_URL
            });
            console.log('Set default API base URL');
        }

        // Validate JWT token if exists
        const isValidToken = await validateJWTToken(authData.authToken);
        console.log('Token validation result:', isValidToken);

        // Update global state
        state.isAuthenticated = isValidToken;
        state.userData = authData.userData || {};

        // If not authenticated, show login screen - STRICT ENFORCEMENT
        if (!isValidToken) {
            console.log('User not authenticated, showing login screen');
            showLoginScreen();
            return;
        }

        console.log('User authenticated, loading main UI');

        // Initialize the main UI since user is authenticated
        await initializeUI();

    } catch (storageError) {
        console.error('Storage access error:', storageError);
        console.log('Showing login screen due to error');
        showLoginScreen();
        return;
    }
}
