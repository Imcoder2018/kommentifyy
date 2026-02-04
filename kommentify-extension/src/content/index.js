import { clicker } from './/clicker.js';
// [MODIFIED] Import your existing, powerful automationCollector
import { automationCollector } from './/automationCollector.js';
import { iFrameDetector } from './/iFrameDetector.js';
import { profiler } from '../shared/dom/profiler.js';
import { api, initApi } from '../shared/api/api.js';
import { alerts } from './/alerts.js';
import { aiCommentButton } from './/aiCommentButton.js';

// --- NETWORKING STATUS INDICATOR ---
const networkingStatus = {
    element: null,
    hideTimeout: null,
    
    createIndicator() {
        // Remove existing if any
        const existing = document.getElementById('minify-networking-status');
        if (existing) {
            this.element = existing;
            return existing;
        }
        
        const indicator = document.createElement('div');
        indicator.id = 'minify-networking-status';
        indicator.style.cssText = `
            position: fixed;
            top: 70px;
            right: 20px;
            padding: 10px 16px;
            border-radius: 6px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 12px;
            font-weight: 600;
            color: white;
            z-index: 999999;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            display: none;
            max-width: 300px;
            animation: slideIn 0.3s ease;
        `;
        
        // Add animation keyframes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(indicator);
        this.element = indicator;
        return indicator;
    },
    
    show(message, type = 'info') {
        // Ensure body exists
        if (!document.body) {
            console.log('[STATUS] Body not ready, waiting...');
            setTimeout(() => this.show(message, type), 100);
            return;
        }
        
        const indicator = this.createIndicator();
        
        // Clear any existing hide timeout
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }
        
        // Set color based on type
        const colors = {
            info: '#0a66c2',      // LinkedIn blue
            success: '#057642',   // LinkedIn green
            warning: '#b24020',   // LinkedIn orange
            error: '#cc1016'      // LinkedIn red
        };
        
        indicator.style.backgroundColor = colors[type] || colors.info;
        indicator.style.color = '#fff';
        indicator.textContent = message;
        indicator.style.display = 'block';
        
        // Reset animation
        indicator.style.animation = 'none';
        indicator.offsetHeight; // Trigger reflow
        indicator.style.animation = 'slideIn 0.3s ease';
        
        // Auto-hide after delay
        const hideDelay = type === 'success' ? 4000 : 6000;
        this.hideTimeout = setTimeout(() => {
            indicator.style.display = 'none';
        }, hideDelay);
        
        console.log(`[STATUS INDICATOR] ${type}: ${message}`);
    },
    
    hide() {
        if (this.element) {
            this.element.style.display = 'none';
        }
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }
    }
};

// Listen for status updates from background script - MUST be outside load event
// Check if chrome.runtime exists (it won't exist when script is injected via <script> tag)
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'updateNetworkingStatus') {
            console.log('[CONTENT] Received status update:', request.message);
            networkingStatus.show(request.message, request.type);
            sendResponse({ success: true });
            return true;
        }
    });
} else {
    console.log('[CONTENT] Running in page context - chrome.runtime not available');
}

async function initializeContentScript() {
    try {
        initApi();
        console.log('[CONTENT] Content script loaded.');

        // Check if this is the special collector window
        if (window.name === "AutomationPage") {
            console.log('[CONTENT] AutomationPage detected. Starting collector...');
            // [MODIFIED] Call the 'collectPosts' method from the imported object
            automationCollector.collectPosts();
            return; // Stop further execution for this page
        }

        // Standard setup for normal pages
        console.log('[CONTENT] Setting up main click listener and alert checker.');
        document.body.addEventListener("click", clicker.click);
        iFrameDetector.constantlyDetectAndRegisterClicks();
        profiler.updateProfileOccasionally();
        alerts.outputAutomationAlertsIfNeeded();
        // Initialize AI Comment buttons on posts
        console.log('[CONTENT] Initializing AI Comment buttons...');
        aiCommentButton.init();

    } catch (error) {
        console.error('[CONTENT] Initialization failed:', error.message);
        console.error('Content Script Initialization Error:', error);
        api.logFrontError("Content Script Initializer", error);
    }
}

// Initialize when page loads OR if page is already loaded
if (document.readyState === 'complete') {
    console.log('[CONTENT] Page already loaded, initializing immediately...');
    initializeContentScript();
} else {
    window.addEventListener("load", initializeContentScript);
}