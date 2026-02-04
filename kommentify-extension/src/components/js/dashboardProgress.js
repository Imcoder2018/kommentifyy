// --- SIMPLIFIED DASHBOARD PROGRESS TRACKING --- //
// Simple progress bar and stop button only

import { sendMessageSafe } from '../../shared/utils/messageHandler.js';

let progressMonitorInterval = null;
let currentProcessType = null; // 'automation' | 'networking' | null
let hideProgressTimeout = null;
let lastActiveState = { automation: false, networking: false };
let lastUpdateData = {}; // For change detection

/**
 * Initialize dashboard progress monitoring
 */
export function initializeDashboardProgress() {
    console.log('🎯 Initializing enhanced dashboard progress...');
    
    // Set up stop button
    const stopBtn = document.getElementById('dashboard-stop-btn');
    if (stopBtn) {
        stopBtn.addEventListener('click', handleDashboardStop);
    }
    
    // Start monitoring
    startProgressMonitoring();
    
    console.log('✅ Dashboard progress initialized');
}

/**
 * Start monitoring for active processes
 */
function startProgressMonitoring() {
    // Clean up any existing intervals or timeouts
    if (progressMonitorInterval) {
        clearInterval(progressMonitorInterval);
    }
    if (hideProgressTimeout) {
        clearTimeout(hideProgressTimeout);
        hideProgressTimeout = null;
    }
    
    progressMonitorInterval = setInterval(async () => {
        await checkActiveProcesses();
    }, 3000); // Check every 3 seconds - simple state check only
}

/**
 * Stop progress monitoring and cleanup
 */
export function stopProgressMonitoring() {
    if (progressMonitorInterval) {
        clearInterval(progressMonitorInterval);
        progressMonitorInterval = null;
    }
    if (hideProgressTimeout) {
        clearTimeout(hideProgressTimeout);
        hideProgressTimeout = null;
    }
    console.log('⏹️ Progress monitoring stopped');
}

/**
 * Check for active automation/networking processes (with debouncing to prevent blinking)
 */
async function checkActiveProcesses() {
    try {
        // Check automation state with timeout
        const automationResponse = await sendMessageSafe({ action: 'checkBulkProcessingState' }, 2000);
        const automationActive = automationResponse?.active || false;
        
        // Check networking state with timeout
        const networkingResponse = await sendMessageSafe({ action: 'checkPeopleSearchState' }, 2000);
        const networkingActive = networkingResponse?.active || false;
        
        // Clear any pending hide timeout if processes are active
        if ((automationActive || networkingActive) && hideProgressTimeout) {
            clearTimeout(hideProgressTimeout);
            hideProgressTimeout = null;
        }
        
        // Only update UI if state actually changed
        const stateChanged = (
            lastActiveState.automation !== automationActive || 
            lastActiveState.networking !== networkingActive
        );
        
        if (stateChanged) {
            console.log(`🔄 Process state changed - Automation: ${automationActive}, Networking: ${networkingActive}`);
            
            // Update last known states
            lastActiveState.automation = automationActive;
            lastActiveState.networking = networkingActive;
            
            // Show progress section immediately if processes are active
            if (automationActive && !networkingActive) {
                showProgressSection('automation');
                updateSimpleProgress();
            } else if (networkingActive && !automationActive) {
                showProgressSection('networking');
                updateSimpleProgress();
            } else if (automationActive && networkingActive) {
                // Both running - show automation as primary
                showProgressSection('automation');
                updateSimpleProgress();
            } else if (!automationActive && !networkingActive) {
                // Both inactive - debounce hiding to prevent blinking
                if (hideProgressTimeout) {
                    clearTimeout(hideProgressTimeout);
                }
                hideProgressTimeout = setTimeout(() => {
                    console.log('🔄 Hiding progress section after debounce');
                    hideProgressSection();
                    hideProgressTimeout = null;
                }, 5000); // Wait 5 seconds before hiding to prevent blinking
            }
        }
        
    } catch (error) {
        console.warn('⚠️ Error checking process states:', error);
        // Don't hide progress section on error - keep current state
    }
}

/**
 * Simple progress update - just show a generic progress bar
 */
function updateSimpleProgress() {
    if (currentProcessType === 'automation') {
        updateProgressBar(50); // Show 50% as generic progress
        updateProgressDetail('Automation in progress...');
    } else if (currentProcessType === 'networking') {
        updateProgressBar(50); // Show 50% as generic progress
        updateProgressDetail('Networking in progress...');
    }
}

/**
 * Show progress section based on process type
 */
function showProgressSection(processType) {
    const progressSection = document.getElementById('live-progress-section');
    if (!progressSection) return;
    
    currentProcessType = processType;
    progressSection.style.display = 'block';
    
    // Update section title based on process type
    const statusElement = document.getElementById('live-status-text');
    if (statusElement) {
        if (processType === 'automation') {
            statusElement.textContent = 'Automation Running';
        } else if (processType === 'networking') {
            statusElement.textContent = 'Networking Running';
        }
    }
    
    // Show stop button
    const stopBtn = document.getElementById('dashboard-stop-btn');
    if (stopBtn) {
        stopBtn.style.display = 'inline-block';
    }
}

/**
 * Hide progress section
 */
function hideProgressSection() {
    const progressSection = document.getElementById('live-progress-section');
    if (progressSection) {
        progressSection.style.display = 'none';
    }
    
    // Hide stop button
    const stopBtn = document.getElementById('dashboard-stop-btn');
    if (stopBtn) {
        stopBtn.style.display = 'none';
    }
    
    // Reset status text
    const statusElement = document.getElementById('live-status-text');
    if (statusElement) {
        statusElement.textContent = 'Idle';
    }
    
    currentProcessType = null;
}


/**
 * Update progress bar percentage (with change detection)
 */
function updateProgressBar(percentage) {
    const roundedPercentage = Math.round(percentage);
    
    // Only update if percentage changed
    if (!lastUpdateData.progressPercentage || lastUpdateData.progressPercentage !== roundedPercentage) {
        const progressBar = document.getElementById('live-progress-bar');
        const progressText = document.getElementById('live-progress-percentage');
        
        if (progressBar) {
            progressBar.style.width = `${Math.min(100, Math.max(0, roundedPercentage))}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${roundedPercentage}%`;
        }
        
        lastUpdateData.progressPercentage = roundedPercentage;
    }
}

/**
 * Update progress detail text (with change detection)
 */
function updateProgressDetail(text) {
    // Only update if text changed
    if (!lastUpdateData.progressDetail || lastUpdateData.progressDetail !== text) {
        const element = document.getElementById('live-progress-detail');
        if (element) {
            element.textContent = text;
        }
        lastUpdateData.progressDetail = text;
    }
}

/**
 * Handle dashboard stop button click
 */
async function handleDashboardStop() {
    if (!currentProcessType) return;
    
    const stopBtn = document.getElementById('dashboard-stop-btn');
    if (stopBtn) {
        stopBtn.disabled = true;
        stopBtn.textContent = '⏳ Stopping...';
    }
    
    try {
        if (currentProcessType === 'automation') {
            await sendMessageSafe({ action: 'stopBulkProcessing' }, 3000);
            console.log('🛑 Stopped automation from dashboard');
        } else if (currentProcessType === 'networking') {
            await sendMessageSafe({ action: 'stopPeopleSearch' }, 3000);
            console.log('🛑 Stopped networking from dashboard');
        }
        
        // Hide progress section after short delay
        setTimeout(() => {
            hideProgressSection();
        }, 2000);
        
    } catch (error) {
        console.error('❌ Error stopping process:', error);
    } finally {
        if (stopBtn) {
            stopBtn.disabled = false;
            stopBtn.textContent = '🛑 Stop';
        }
    }
}

/**
 * Manually update progress (simplified)
 */
export function updateProgress(type, data) {
    // Simple progress update - just show generic progress
    updateSimpleProgress();
}

// Export for external use
export { showProgressSection, hideProgressSection, updateProgressBar, updateProgressDetail };
