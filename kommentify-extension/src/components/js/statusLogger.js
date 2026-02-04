/**
 * Status Logger Module
 * Manages status bar updates for automation, networking, and import tabs
 * Shows waiting/delay logs to keep users informed
 */

// Status bar configuration for each tab
const statusBars = {
    automation: {
        bar: 'automation-status-bar',
        icon: 'automation-status-icon',
        text: 'automation-status-text',
        timer: 'automation-status-timer'
    },
    networking: {
        bar: 'networking-status-bar',
        icon: 'networking-status-icon',
        text: 'networking-status-text',
        timer: 'networking-status-timer'
    },
    import: {
        bar: 'import-status-bar',
        icon: 'import-status-icon',
        text: 'import-status-text',
        timer: 'import-status-timer'
    }
};

// Countdown interval storage
const countdownIntervals = {
    automation: null,
    networking: null,
    import: null
};

/**
 * Show status bar for a specific tab
 */
export function showStatusBar(tab, message, icon = '🔄') {
    const config = statusBars[tab];
    if (!config) return;
    
    const barEl = document.getElementById(config.bar);
    const iconEl = document.getElementById(config.icon);
    const textEl = document.getElementById(config.text);
    
    if (barEl) {
        barEl.style.display = 'flex';
    }
    if (iconEl) {
        iconEl.textContent = icon;
    }
    if (textEl) {
        textEl.textContent = message;
    }
}

/**
 * Hide status bar for a specific tab
 */
export function hideStatusBar(tab) {
    const config = statusBars[tab];
    if (!config) return;
    
    const barEl = document.getElementById(config.bar);
    if (barEl) {
        barEl.style.display = 'none';
    }
    
    // Clear any countdown
    clearCountdown(tab);
}

/**
 * Update status bar message
 */
export function updateStatus(tab, message, icon = null) {
    const config = statusBars[tab];
    if (!config) return;
    
    const textEl = document.getElementById(config.text);
    if (textEl) {
        textEl.textContent = message;
    }
    
    if (icon) {
        const iconEl = document.getElementById(config.icon);
        if (iconEl) {
            iconEl.textContent = icon;
        }
    }
}

/**
 * Show waiting/delay countdown
 */
export function showWaitingCountdown(tab, seconds, message) {
    const config = statusBars[tab];
    if (!config) return;
    
    // Show the status bar
    showStatusBar(tab, message, '⏳');
    
    // Clear any existing countdown
    clearCountdown(tab);
    
    let remainingSeconds = seconds;
    const timerEl = document.getElementById(config.timer);
    
    // Update timer display
    const updateTimer = () => {
        if (timerEl) {
            const mins = Math.floor(remainingSeconds / 60);
            const secs = remainingSeconds % 60;
            timerEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        }
    };
    
    updateTimer();
    
    // Start countdown
    countdownIntervals[tab] = setInterval(() => {
        remainingSeconds--;
        updateTimer();
        
        if (remainingSeconds <= 0) {
            clearCountdown(tab);
            if (timerEl) timerEl.textContent = '';
        }
    }, 1000);
}

/**
 * Clear countdown for a tab
 */
export function clearCountdown(tab) {
    if (countdownIntervals[tab]) {
        clearInterval(countdownIntervals[tab]);
        countdownIntervals[tab] = null;
    }
    
    const config = statusBars[tab];
    if (config) {
        const timerEl = document.getElementById(config.timer);
        if (timerEl) timerEl.textContent = '';
    }
}

/**
 * Log status with predefined types
 */
export function logStatus(tab, type, details = {}) {
    const messages = {
        // General
        'starting': { icon: '🚀', text: 'Starting process...' },
        'stopped': { icon: '🛑', text: 'Process stopped' },
        'completed': { icon: '✅', text: 'Process completed!' },
        'error': { icon: '❌', text: `Error: ${details.message || 'Unknown error'}` },
        
        // Automation specific
        'scraping-posts': { icon: '🔍', text: `Scraping posts... Found ${details.count || 0}` },
        'filtering-posts': { icon: '🔬', text: 'Filtering posts by keywords...' },
        'processing-post': { icon: '📝', text: `Processing post ${details.current || 0}/${details.total || 0}` },
        'generating-comment': { icon: '🤖', text: 'Generating AI comment...' },
        'posting-comment': { icon: '💬', text: 'Posting comment...' },
        'liking-post': { icon: '❤️', text: 'Liking post...' },
        'sharing-post': { icon: '📤', text: 'Sharing post...' },
        'following-author': { icon: '👥', text: 'Following author...' },
        
        // Networking specific
        'searching-profiles': { icon: '🔍', text: `Searching profiles... Found ${details.count || 0}` },
        'filtering-profiles': { icon: '🔬', text: 'Filtering profiles...' },
        'processing-profile': { icon: '👤', text: `Processing profile ${details.current || 0}/${details.total || 0}` },
        'sending-connection': { icon: '🤝', text: `Sending connection to ${details.name || 'profile'}...` },
        'extracting-info': { icon: '📧', text: 'Extracting contact info...' },
        
        // Import specific
        'loading-profiles': { icon: '📂', text: `Loading ${details.count || 0} profiles...` },
        'validating-urls': { icon: '🔗', text: 'Validating profile URLs...' },
        'opening-profile': { icon: '🔓', text: `Opening profile ${details.current || 0}/${details.total || 0}` },
        'engaging-profile': { icon: '💫', text: `Engaging with ${details.name || 'profile'}...` },
        
        // Waiting messages
        'waiting-page-load': { icon: '⏳', text: 'Waiting for page to load...' },
        'waiting-action-delay': { icon: '⏳', text: `Waiting ${details.seconds || 0}s (human-like delay)...` },
        'waiting-before-next': { icon: '⏳', text: 'Waiting before next action...' },
        'waiting-scroll': { icon: '📜', text: 'Scrolling to load more...' },
        'waiting-rate-limit': { icon: '⚠️', text: `Rate limit - waiting ${details.seconds || 60}s...` },
        'waiting-cooldown': { icon: '❄️', text: `Cooling down... ${details.seconds || 0}s remaining` }
    };
    
    const msg = messages[type] || { icon: '📌', text: type };
    showStatusBar(tab, msg.text, msg.icon);
    
    // If it's a waiting message with seconds, show countdown
    if (type.startsWith('waiting-') && details.seconds) {
        showWaitingCountdown(tab, details.seconds, msg.text);
    }
    
    // Log to console for debugging
    console.log(`[${tab.toUpperCase()}] ${msg.icon} ${msg.text}`);
}

/**
 * Initialize status logger - listen for messages from content scripts
 */
export function initializeStatusLogger() {
    // Listen for status updates from chrome.runtime messages
    chrome.runtime?.onMessage?.addListener((request, sender, sendResponse) => {
        if (request.action === 'updateTabStatus') {
            const { tab, type, details } = request;
            logStatus(tab, type, details);
            sendResponse({ success: true });
        }
        return true;
    });
    
    console.log('📊 Status Logger initialized');
}

// Export all functions
export default {
    showStatusBar,
    hideStatusBar,
    updateStatus,
    showWaitingCountdown,
    clearCountdown,
    logStatus,
    initializeStatusLogger
};
