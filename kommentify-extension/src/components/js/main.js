import { API_CONFIG } from './utils.js';
import { state } from './state.js';
import { validateJWTToken, showLoginScreen } from './auth.js';
import { initializeUI } from './ui.js';

export async function initializePopup() {
    console.log('=== INITIALIZING POPUP ===');
    console.log('Chrome storage available:', typeof chrome !== 'undefined' && chrome.storage);

    const startTime = Date.now();
    const minLoadingTime = 1500; // Minimum 1.5 seconds loading
    
    // Update loading status
    updateLoadingStatus('Checking authentication...', 20);

    try {
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

        // Also log the full token for debugging (first 50 chars)
        if (authData.authToken) {
            console.log('Token preview:', authData.authToken.substring(0, 50) + '...');
        }

        // Ensure apiBaseUrl is set to production backend
        if (!authData.apiBaseUrl) {
            await chrome.storage.local.set({
                apiBaseUrl: API_CONFIG.BASE_URL
            });
            console.log('Set default API base URL');
        }

        updateLoadingStatus('Validating credentials...', 40);
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
        
        updateLoadingStatus('Loading components...', 60);
        // Initialize the main UI since user is authenticated
        await loadComponents();
        
        updateLoadingStatus('Initializing interface...', 80);
        await initializeUI();
        
        updateLoadingStatus('Almost ready...', 95);
        
        // Ensure minimum loading time
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
        
        if (remainingTime > 0) {
            await new Promise(resolve => setTimeout(resolve, remainingTime));
        }
        
        updateLoadingStatus('Ready!', 100);
        
        // Hide loading overlay with fade effect
        setTimeout(() => {
            const loadingOverlay = document.getElementById('loading-overlay');
            if (loadingOverlay) {
                loadingOverlay.style.opacity = '0';
                loadingOverlay.style.transition = 'opacity 0.3s ease';
                setTimeout(() => {
                    loadingOverlay.style.display = 'none';
                }, 300);
            }
        }, 200);

    } catch (storageError) {
        console.error('Storage access error:', storageError);
        console.log('Showing login screen due to error');
        showLoginScreen();
        return;
    }
}

async function loadComponents() {
    console.log('Loading HTML components...');
    const components = [
        { id: 'header-container', path: 'components/html/header.html' },
        { id: 'tabs-container', path: 'components/html/tabs.html' },
        { id: 'dashboard-container', path: 'components/html/dashboard.html' },
        { id: 'post-writer-container', path: 'components/html/post_writer.html' },
        { id: 'automation-container', path: 'components/html/automation.html' },
        { id: 'networking-container', path: 'components/html/networking.html' },
        { id: 'import-container', path: 'components/html/import.html' },
        { id: 'analytics-container', path: 'components/html/analytics.html' },
        { id: 'limits-container', path: 'components/html/limits.html' },
        { id: 'settings-container', path: 'components/html/settings.html' },
        { id: 'footer-container', path: 'components/html/footer.html' },
        { id: 'plan-modal-container', path: 'components/html/plan_modal.html' }
    ];

    await Promise.all(components.map(async (component) => {
        try {
            const response = await fetch(chrome.runtime.getURL(component.path));
            const html = await response.text();
            const container = document.getElementById(component.id);
            if (container) {
                container.innerHTML = html;
            } else {
                console.error(`Container not found: ${component.id}`);
            }
        } catch (error) {
            console.error(`Failed to load component: ${component.path}`, error);
        }
    }));
    console.log('All components loaded');
}

// Update loading status and progress
function updateLoadingStatus(status, progress) {
    const statusElement = document.getElementById('loading-status');
    const progressElement = document.getElementById('loading-progress');
    
    if (statusElement) {
        statusElement.textContent = status;
    }
    
    if (progressElement) {
        progressElement.style.width = `${progress}%`;
    }
    
    console.log(`Loading: ${status} (${progress}%)`);
}

// Start initialization when DOM is ready
document.addEventListener('DOMContentLoaded', initializePopup);
