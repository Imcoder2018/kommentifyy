import { showToast } from './utils.js';
import { state } from './state.js';
import { featureChecker } from '/shared/utils/featureChecker.js';
import { loadPlans } from './auth.js';
import { CreditsService } from '../../shared/services/creditsService.js';
import { logStatus, showStatusBar, hideStatusBar } from './statusLogger.js';
import { checkDailyLimit, checkAllDailyLimits, getRemainingActions } from './limits.js';

// ========== IMPORT FUNCTIONALITY ==========

// Import module loading
console.log('🚀 IMPORT MODULE: import.js loaded successfully!');

let importedProfiles = [];
let isConnectionProcessing = false;
let isEngagementProcessing = false;

// Initialize credits service
const creditsService = new CreditsService();
console.log('✅ IMPORT: CreditsService initialized successfully');

// Forward declare window functions (will be defined later)
console.log('🔧 IMPORT MODULE: Declaring window functions...');
window.startConnectionRequests = null;
window.startPostEngagement = null;
window.startCombinedAutomation = null;
console.log('✅ IMPORT MODULE: Window functions declared');

// Flag to track if message listener is already added
let messageListenerAdded = false;

/**
 * Set up import progress message listener early (called on popup open)
 * This allows receiving progress updates even when not on the import tab
 */
// Flag to track if storage listener is already added
let storageListenerAdded = false;

export function setupImportProgressListener() {
    if (messageListenerAdded) {
        console.log('📥 IMPORT: Progress listener already added');
        return;
    }
    
    console.log('📥 IMPORT: Setting up progress listener early...');
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'importProgress') {
            console.log('📥 IMPORT: Received importProgress message:', message.type);
            handleImportProgressUpdate(message);
        }
        return false;
    });
    messageListenerAdded = true;
    console.log('✅ IMPORT: Early progress listener added');
    
    // Also set up storage change listener for when background updates storage directly
    if (!storageListenerAdded) {
        chrome.storage.onChanged.addListener((changes, areaName) => {
            if (areaName !== 'local') return;
            
            // Update profile URLs input when pendingImportProfiles changes
            if (changes.pendingImportProfiles) {
                console.log('💾 IMPORT UI: Storage changed - pendingImportProfiles updated');
                const newProfiles = changes.pendingImportProfiles.newValue || [];
                const input = document.getElementById('profile-urls-input');
                const countEl = document.getElementById('profile-count');
                
                if (input) {
                    input.value = newProfiles.join('\n');
                }
                if (countEl) {
                    countEl.textContent = newProfiles.length;
                }
                importedProfiles = newProfiles;
                updateImportedProfilesDisplay();
            }
            
            // Update progress bar when importProgressState changes
            if (changes.importProgressState) {
                const progressState = changes.importProgressState.newValue;
                if (progressState) {
                    console.log('💾 IMPORT UI: Storage changed - progress state updated');
                    const currentEl = document.getElementById('combined-current');
                    const totalEl = document.getElementById('combined-total');
                    const progressBarEl = document.getElementById('combined-progress-bar');
                    const percentageEl = document.getElementById('combined-percentage');
                    
                    if (currentEl) currentEl.textContent = progressState.current || 0;
                    if (totalEl) totalEl.textContent = progressState.total || 0;
                    
                    if (progressBarEl && progressState.total > 0) {
                        const pct = Math.round((progressState.current / progressState.total) * 100);
                        progressBarEl.style.width = `${pct}%`;
                        if (percentageEl) percentageEl.textContent = `${pct}%`;
                    }
                }
            }
            
            // Reload history when completedImportProfiles changes
            if (changes.completedImportProfiles) {
                console.log('💾 IMPORT UI: Storage changed - completed profiles updated, reloading history');
                loadImportHistory();
            }
        });
        storageListenerAdded = true;
        console.log('✅ IMPORT: Storage change listener added');
    }
}

/**
 * Initialize import functionality
 */
export function initializeImport() {
    console.log('🔧 Initializing Import functionality...');
    
    // Check and restore import automation state
    checkImportAutomationState();
    
    // Sync profile URLs from storage (removes any that were processed while popup was closed)
    syncProfileUrlsFromStorage();
    
    // Load import credits on initialization
    console.log('🔧 IMPORT: About to load import credits...');
    loadImportCredits().then(() => {
        console.log('🔧 IMPORT: Import credits loading completed');
    }).catch((error) => {
        console.error('🔧 IMPORT: Import credits loading failed:', error);
    });
    
    // Set up storage change listener for live history updates
    setupLiveHistoryUpdates();
    
    // Profile input handlers
    const profileInput = document.getElementById('profile-urls-input');
    const csvUpload = document.getElementById('csv-upload');
    const csvUploadBtn = document.getElementById('csv-upload-button');

    if (profileInput) {
        profileInput.addEventListener('input', handleProfileInput);
    }

    if (csvUpload) {
        csvUpload.addEventListener('change', handleCsvUpload);
    }

    if (csvUploadBtn) {
        csvUploadBtn.addEventListener('click', () => {
            csvUpload.click();
        });
    }
    
    // Action button handlers
    const connectionBtn = document.getElementById('start-connection-requests');
    const engagementBtn = document.getElementById('start-post-engagement');
    
    // Event listeners will be set up after functions are defined
    
    // History handlers
    const refreshBtn = document.getElementById('refresh-import-history');
    const clearBtn = document.getElementById('clear-import-history');
    const exportBtn = document.getElementById('export-import-csv');
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadImportHistory);
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', clearImportHistory);
    }
    
    if (exportBtn) {
        exportBtn.addEventListener('click', exportImportHistoryToCSV);
    }
    
    // Show post details toggle
    const showPostDetailsToggle = document.getElementById('show-post-details');
    if (showPostDetailsToggle) {
        showPostDetailsToggle.addEventListener('change', loadImportHistory);
    }
    
    // Import history search functionality
    const importHistorySearch = document.getElementById('import-history-search');
    if (importHistorySearch) {
        importHistorySearch.addEventListener('input', loadImportHistory);
    }
    
    // Load existing history
    loadImportHistory();
    
    // Set up action button event listeners
    console.log('🔗 IMPORT: Setting up event listeners for import buttons...');
    const startConnectionBtn = document.getElementById('start-connection-requests');
    const startEngagementBtn = document.getElementById('start-post-engagement'); 
    const startCombinedBtn = document.getElementById('start-combined-automation');
    
    if (startConnectionBtn) {
        // Button click listener
        startConnectionBtn.addEventListener('click', () => {
            console.log('🔘 IMPORT: Button clicked - calling startConnectionRequests');
            if (window.startConnectionRequests) {
                window.startConnectionRequests();
            } else {
                console.error('❌ IMPORT: window.startConnectionRequests not defined yet!');
            }
        });
        console.log('✅ IMPORT: Connection requests button listener added');
    }
    
    if (startEngagementBtn) {
        startEngagementBtn.addEventListener('click', () => {
            if (window.startPostEngagement) window.startPostEngagement();
        });
        console.log('✅ IMPORT: Post engagement button listener added');
    } else {
        console.error('❌ IMPORT: start-post-engagement button not found');
    }
    
    if (startCombinedBtn) {
        startCombinedBtn.addEventListener('click', () => {
            if (window.startCombinedAutomation) window.startCombinedAutomation();
        });
        console.log('✅ IMPORT: Combined automation button listener added');
    } else {
        console.error('❌ IMPORT: start-combined-automation button not found');
    }
    
    // Set up stop button event listeners
    const stopConnectionBtn = document.getElementById('stop-connection-requests');
    const stopEngagementBtn = document.getElementById('stop-post-engagement');
    const stopCombinedBtn = document.getElementById('stop-combined-automation');
    
    if (stopConnectionBtn) {
        stopConnectionBtn.addEventListener('click', () => stopImportAutomation('connection'));
    }
    if (stopEngagementBtn) {
        stopEngagementBtn.addEventListener('click', () => stopImportAutomation('engagement'));
    }
    if (stopCombinedBtn) {
        stopCombinedBtn.addEventListener('click', () => stopImportAutomation('combined'));
    }
    console.log('✅ IMPORT: Stop button listeners added');
    
    // Ensure progress listener is set up (uses flag to prevent duplicates)
    setupImportProgressListener();
    
    // Initialize import scheduler
    initializeImportScheduler();
    
    console.log('✅ Import functionality initialized');
}

/**
 * Handle live progress updates from background script
 */
function handleImportProgressUpdate(message) {
    const { type, profileUrl, profileName, current, total, status, result } = message;
    
    console.log('📥 IMPORT UI: Received progress update:', type, profileUrl || '');
    
    // Update progress bar
    const currentEl = document.getElementById('combined-current');
    const totalEl = document.getElementById('combined-total');
    const progressBarEl = document.getElementById('combined-progress-bar');
    const percentageEl = document.getElementById('combined-percentage');
    
    if (currentEl) currentEl.textContent = current || 0;
    if (totalEl) totalEl.textContent = total || 0;
    
    if (progressBarEl && total > 0) {
        const pct = Math.round((current / total) * 100);
        progressBarEl.style.width = `${pct}%`;
        if (percentageEl) percentageEl.textContent = `${pct}%`;
    }
    
    // Save progress to storage for persistence
    chrome.storage.local.set({ 
        importProgress: { current, total }
    });
    
    // Handle processing started - start live history refresh
    if (type === 'start') {
        console.log('🚀 IMPORT UI: Automation started, total profiles:', total);
        startLiveHistoryRefresh();
    }
    
    // Handle profile started
    if (type === 'profileStart') {
        console.log('👤 IMPORT UI: Profile started:', profileName, profileUrl);
        addLiveHistoryRow({
            id: Date.now(),
            timestamp: Date.now(),
            profileUrl,
            profileName,
            status: 'processing'
        });
    }
    
    // Handle profile completed
    if (type === 'profileComplete' && result) {
        console.log('✅ IMPORT UI: Profile completed:', profileUrl, 'Success:', result.success);
        
        // Update the live row
        const rowId = document.querySelector(`[id^="import-row-"]`)?.id?.replace('import-row-', '');
        if (rowId) {
            updateLiveHistoryRow(rowId, {
                status: result.success ? 'completed' : 'failed',
                connectionSent: result.connectionSent,
                likes: result.likes,
                comments: result.comments
            });
        }
        
        // Remove completed profile from input box and storage immediately
        if (profileUrl && result.success) {
            console.log('🗑️ IMPORT UI: Removing processed profile from UI:', profileUrl);
            removeProfileByUrl(profileUrl);
            removeProcessedProfile(profileUrl);
        }
        
        // Force reload history table for live updates
        loadImportHistory();
    }
    
    // Handle automation complete
    if (type === 'complete') {
        console.log('🎉 IMPORT UI: Automation complete!');
        // Stop live refresh
        stopLiveHistoryRefresh();
        // Reload history from storage
        loadImportHistory();
        // Reset UI
        resetImportUI('combined');
    }
}

/**
 * Stop import automation
 */
async function stopImportAutomation(type) {
    console.log(`🛑 IMPORT: Stopping ${type} automation...`);
    
    // Disable stop button and show stopping state
    const stopBtn = document.getElementById(`stop-${type === 'connection' ? 'connection-requests' : type === 'engagement' ? 'post-engagement' : 'combined-automation'}`);
    if (stopBtn) {
        stopBtn.textContent = '⏳ Stopping...';
        stopBtn.disabled = true;
    }
    
    try {
        const response = await chrome.runtime.sendMessage({ action: 'stopImportAutomation' });
        if (response && response.success) {
            showToast('Import automation stopped', 'info');
        }
    } catch (error) {
        console.error('Error stopping import:', error);
    }
    
    // Clear processing state from storage
    await chrome.storage.local.set({ 
        importAutomationActive: false, 
        importAutomationType: null,
        importProgress: null 
    });
    
    // Reset UI after a brief delay
    setTimeout(() => {
        resetImportUI(type);
    }, 1000);
}

/**
 * Reset import UI after stop or completion
 */
function resetImportUI(type) {
    const startBtnId = type === 'connection' ? 'start-connection-requests' : 
                       type === 'engagement' ? 'start-post-engagement' : 'start-combined-automation';
    const stopBtnId = type === 'connection' ? 'stop-connection-requests' : 
                      type === 'engagement' ? 'stop-post-engagement' : 'stop-combined-automation';
    const progressId = type === 'connection' ? 'connection-progress' : 
                       type === 'engagement' ? 'engagement-progress' : 'combined-progress';
    
    const startBtn = document.getElementById(startBtnId);
    const stopBtn = document.getElementById(stopBtnId);
    const progress = document.getElementById(progressId);
    
    if (startBtn) {
        startBtn.style.display = 'block';
        startBtn.disabled = false;
    }
    if (stopBtn) {
        stopBtn.style.display = 'none';
        stopBtn.textContent = '🛑 Stop';
        stopBtn.disabled = false;
    }
    if (progress) {
        progress.style.display = 'none';
    }
}

/**
 * Handle profile URLs input
 */
async function handleProfileInput() {
    const input = document.getElementById('profile-urls-input');
    const countEl = document.getElementById('profile-count');
    
    if (!input || !countEl) return;
    
    const text = input.value.trim();
    const urls = text.split('\n').filter(line => {
        const trimmed = line.trim();
        return trimmed && trimmed.includes('linkedin.com/in/');
    });
    
    countEl.textContent = urls.length;
    importedProfiles = urls.map(url => url.trim());
    
    // Save profile URLs to local storage for persistence
    await saveProfileUrlsToStorage(importedProfiles);
    
    updateImportedProfilesDisplay();
}

/**
 * Save profile URLs to local storage
 */
async function saveProfileUrlsToStorage(profiles) {
    try {
        await chrome.storage.local.set({ pendingImportProfiles: profiles });
        console.log('📝 IMPORT: Saved', profiles.length, 'profile URLs to storage');
    } catch (error) {
        console.error('📝 IMPORT: Failed to save profile URLs:', error);
    }
}

/**
 * Load saved profile URLs from storage
 */
async function loadProfileUrlsFromStorage() {
    try {
        const { pendingImportProfiles = [] } = await chrome.storage.local.get('pendingImportProfiles');
        if (pendingImportProfiles.length > 0) {
            const input = document.getElementById('profile-urls-input');
            const countEl = document.getElementById('profile-count');
            
            if (input) {
                input.value = pendingImportProfiles.join('\n');
            }
            if (countEl) {
                countEl.textContent = pendingImportProfiles.length;
            }
            importedProfiles = pendingImportProfiles;
            console.log('📝 IMPORT: Loaded', pendingImportProfiles.length, 'profile URLs from storage');
            updateImportedProfilesDisplay();
        }
    } catch (error) {
        console.error('📝 IMPORT: Failed to load profile URLs:', error);
    }
}

/**
 * Sync profile URLs from storage when popup opens
 * This handles profiles that were processed while popup was closed
 */
async function syncProfileUrlsFromStorage() {
    try {
        console.log('🔄 IMPORT UI: Syncing profile URLs from storage...');
        
        // Load pending profiles (background script removes completed ones)
        const { pendingImportProfiles = [] } = await chrome.storage.local.get('pendingImportProfiles');
        
        const input = document.getElementById('profile-urls-input');
        const countEl = document.getElementById('profile-count');
        
        if (input) {
            input.value = pendingImportProfiles.join('\n');
        }
        if (countEl) {
            countEl.textContent = pendingImportProfiles.length;
        }
        importedProfiles = pendingImportProfiles;
        
        console.log('✅ IMPORT UI: Synced', pendingImportProfiles.length, 'pending profiles from storage');
        updateImportedProfilesDisplay();
        
        // Also load import history to show latest entries
        loadImportHistory();
        
        // Check if automation is still running and update progress bar
        const { importProgressState, importAutomationActive } = await chrome.storage.local.get(['importProgressState', 'importAutomationActive']);
        
        if (importAutomationActive && importProgressState) {
            console.log('🔄 IMPORT UI: Automation still running, updating progress bar');
            const currentEl = document.getElementById('combined-current');
            const totalEl = document.getElementById('combined-total');
            const progressBarEl = document.getElementById('combined-progress-bar');
            const percentageEl = document.getElementById('combined-percentage');
            
            if (currentEl) currentEl.textContent = importProgressState.current || 0;
            if (totalEl) totalEl.textContent = importProgressState.total || 0;
            
            if (progressBarEl && importProgressState.total > 0) {
                const pct = Math.round((importProgressState.current / importProgressState.total) * 100);
                progressBarEl.style.width = `${pct}%`;
                if (percentageEl) percentageEl.textContent = `${pct}%`;
            }
        }
    } catch (error) {
        console.error('❌ IMPORT UI: Failed to sync profile URLs:', error);
    }
}

/**
 * Remove a processed profile URL from storage and textarea
 */
export async function removeProcessedProfile(profileUrl) {
    try {
        console.log('💾 IMPORT UI: removeProcessedProfile called for:', profileUrl);
        const { pendingImportProfiles = [] } = await chrome.storage.local.get('pendingImportProfiles');
        console.log('💾 IMPORT UI: Current pending profiles in storage:', pendingImportProfiles.length);
        
        // Normalize URL for comparison
        const normalizeUrl = (url) => url?.replace(/\/$/, '').toLowerCase().trim();
        const normalizedTarget = normalizeUrl(profileUrl);
        
        const updatedProfiles = pendingImportProfiles.filter(url => {
            const normalizedUrl = normalizeUrl(url);
            return normalizedUrl !== normalizedTarget && 
                   !normalizedUrl.includes(normalizedTarget) && 
                   !normalizedTarget.includes(normalizedUrl);
        });
        
        console.log('💾 IMPORT UI: After filtering, remaining:', updatedProfiles.length);
        
        await chrome.storage.local.set({ pendingImportProfiles: updatedProfiles });
        
        // Also update the textarea
        const input = document.getElementById('profile-urls-input');
        const countEl = document.getElementById('profile-count');
        
        if (input) {
            input.value = updatedProfiles.join('\n');
        }
        if (countEl) {
            countEl.textContent = updatedProfiles.length;
        }
        importedProfiles = updatedProfiles;
        
        console.log('✅ IMPORT UI: Removed processed profile from storage, remaining:', updatedProfiles.length);
    } catch (error) {
        console.error('❌ IMPORT UI: Failed to remove processed profile:', error);
    }
}

/**
 * Handle CSV file upload
 */
function handleCsvUpload(event) {
    const file = event.target.files[0];
    const statusEl = document.getElementById('csv-status');
    
    if (!file || !statusEl) return;
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
        statusEl.innerHTML = '<span style="color: #dc3545;">Please select a valid CSV file</span>';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csv = e.target.result;
            console.log('📄 CSV Content:', csv.substring(0, 500)); // Log first 500 chars

            // Handle different line endings (Windows \r\n, Unix \n, Mac \r)
            const lines = csv.split(/\r?\n/).filter(line => line.trim());
            console.log('📊 Total lines:', lines.length);

            const profiles = [];

            lines.forEach((line, index) => {
                const trimmedLine = line.trim();
                console.log(`Processing line ${index}:`, trimmedLine.substring(0, 100));

                // Skip empty lines
                if (!trimmedLine) {
                    console.log('⏭️ Skipping empty line');
                    return;
                }

                // Only skip header if it's the FIRST line AND looks like a header
                // AND doesn't contain a LinkedIn URL
                if (index === 0 &&
                    !trimmedLine.includes('linkedin.com/in/') &&
                    !trimmedLine.includes('linkedin.com/') &&
                    (trimmedLine.toLowerCase().includes('url') ||
                     trimmedLine.toLowerCase().includes('profile') ||
                     trimmedLine.toLowerCase().includes('name') ||
                     trimmedLine.toLowerCase().includes('linkedin'))) {
                    console.log('⏭️ Skipping header row');
                    return;
                }

                // Check if the entire line is a LinkedIn URL (for line-separated format)
                if (trimmedLine.includes('linkedin.com/in/') || trimmedLine.includes('linkedin.com/')) {
                    profiles.push(trimmedLine);
                    console.log('✅ Valid profile URL found (line format):', trimmedLine);
                    return;
                }

                // Try comma-separated format
                const columns = trimmedLine.split(',');
                const url = columns[0]?.trim().replace(/"/g, '');

                console.log(`Column 0: "${url}"`);

                // Check for LinkedIn profile URLs with various patterns
                if (url && (url.includes('linkedin.com/in/') || url.includes('linkedin.com/'))) {
                    profiles.push(url);
                    console.log('✅ Valid profile URL found (CSV format):', url);
                } else {
                    console.log('❌ Not a valid LinkedIn URL:', trimmedLine.substring(0, 50));
                }
            });

            console.log('🎯 Total profiles found:', profiles.length);

            importedProfiles = profiles;
            statusEl.innerHTML = `<span style="color: #28a745;">✅ Loaded ${profiles.length} profiles</span>`;

            // Update profile count and display
            const countEl = document.getElementById('profile-count');
            if (countEl) countEl.textContent = profiles.length;

            // Also paste URLs into the input box
            const profileInput = document.getElementById('profile-urls-input');
            if (profileInput) {
                profileInput.value = profiles.join('\n');
            }

            updateImportedProfilesDisplay();

        } catch (error) {
            statusEl.innerHTML = '<span style="color: #dc3545;">❌ Error reading CSV file</span>';
            console.error('CSV parsing error:', error);
        }
    };
    
    reader.readAsText(file);
}

/**
 * Update imported profiles display
 */
function updateImportedProfilesDisplay() {
    const section = document.getElementById('imported-profiles-section');
    const countEl = document.getElementById('imported-count');
    const listEl = document.getElementById('imported-profiles-list');
    
    if (!section || !countEl || !listEl) return;
    
    if (importedProfiles.length === 0) {
        section.style.display = 'none';
        return;
    }
    
    section.style.display = 'block';
    countEl.textContent = importedProfiles.length;
    
    listEl.innerHTML = importedProfiles.map((profile, index) => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #e0e0e0;">
            <span style="font-size: 11px; color: #666;">${index + 1}.</span>
            <span style="font-size: 11px; flex: 1; margin-left: 8px; word-break: break-all;">${profile}</span>
            <button onclick="removeProfile(${index})" 
                    style="background: none; border: none; color: #dc3545; cursor: pointer; font-size: 11px;">❌</button>
        </div>
    `).join('');
}

/**
 * Remove profile from imported list
 */
window.removeProfile = function(index) {
    importedProfiles.splice(index, 1);
    updateImportedProfilesDisplay();
    
    // Update count display
    const countEl = document.getElementById('profile-count');
    if (countEl) countEl.textContent = importedProfiles.length;
};

/**
 * Start connection requests automation
 */
window.startConnectionRequests = async function startConnectionRequests() {
    console.log('🔄 IMPORT: startConnectionRequests function called!');
    
    // CHECK FEATURE PERMISSION FIRST
    const canUseImport = await featureChecker.checkFeature('importProfiles');
    if (!canUseImport) {
        console.warn('🚫 Import feature access denied - not available in current plan');
        showToast('⬆️ Import Profiles Auto Engagement requires a paid plan. Please upgrade!', 'error');
        
        // Show plan modal for upgrade
        const planModal = document.getElementById('plan-modal');
        if (planModal) {
            planModal.style.display = 'flex';
            loadPlans();
        }
        return;
    }
    
    if (isConnectionProcessing) {
        showToast('Connection requests are already in progress', 'warning');
        return;
    }
    
    if (importedProfiles.length === 0) {
        showToast('Please import some profiles first', 'warning');
        return;
    }
    
    // CHECK IMPORT CREDITS BEFORE STARTING
    console.log('💳 IMPORT: Checking import credits...');
    const creditsCheck = await creditsService.checkCreditsAvailable(importedProfiles.length);
    if (!creditsCheck.hasCredits) {
        showToast(`❌ Insufficient import credits! You need ${creditsCheck.needed} credits but only have ${creditsCheck.remaining} remaining.`, 'error');
        return;
    }
    console.log(`✅ IMPORT: Credits available - ${creditsCheck.remaining}/${creditsCheck.total}`);
    
    isConnectionProcessing = true;
    
    // Show status bar
    logStatus('import', 'starting');
    
    const btn = document.getElementById('start-connection-requests');
    const stopBtn = document.getElementById('stop-connection-requests');
    const progressSection = document.getElementById('connection-progress');
    const currentEl = document.getElementById('connection-current');
    const totalEl = document.getElementById('connection-total');
    const progressBarEl = document.getElementById('connection-progress-bar');
    
    if (btn) {
        btn.disabled = true;
        btn.textContent = '🔄 Processing...';
        btn.style.background = '#ff9800';
    }
    if (stopBtn) {
        stopBtn.style.display = 'block';
    }
    
    // Show processing message
    logStatus('import', 'loading-profiles', { count: importedProfiles.length });
    showToast('🔄 Processing connection requests in background...', 'info');
    
    if (progressSection) progressSection.style.display = 'block';
    if (totalEl) totalEl.textContent = importedProfiles.length;
    
    const extractContactInfo = document.getElementById('extract-contact-info')?.checked || false;
    console.log('📧 IMPORT: Extract Contact Info checkbox state:', extractContactInfo);
    
    let successful = 0;
    let failed = 0;
    const sessionData = {
        id: Date.now().toString(),
        startTime: Date.now(),
        type: 'connection_requests',
        profiles: importedProfiles.length,
        extractContactInfo
    };
    
    try {
        // Send to background - it will save history automatically
        console.log('📤 IMPORT: Sending connection request to background...');
        console.log('📤 IMPORT: Profiles to send:', importedProfiles);
        console.log('📤 IMPORT: Options to send:', { extractContactInfo });
        
        const response = await chrome.runtime.sendMessage({
            action: 'startImportConnections',
            profiles: importedProfiles,
            options: { extractContactInfo }
        });
        
        console.error('🔥🔥🔥 IMPORT POPUP: Processing response:', response);
        console.error('🔥 IMPORT POPUP: Response type:', typeof response);
        console.error('🔥 IMPORT POPUP: Response success:', response?.success);
        
        if (response && response.success) {
            const result = response.result;
            console.error('🔥 IMPORT POPUP: Result object:', result);
            console.error('🔥 IMPORT POPUP: Result.successful:', result.successful);
            console.error('🔥 IMPORT POPUP: Result.failed:', result.failed);
            
            showToast(`Connection requests completed! Successful: ${result.successful}, Failed: ${result.failed}`, 'success');
            
            // Wait a moment for background to finish saving
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Background has already saved the history, just reload it
            console.error('📊 IMPORT POPUP: Reloading history from storage (saved by background)...');
            await loadImportHistory();
            console.error('✅ IMPORT POPUP: History reloaded');
        } else {
            throw new Error(response.error);
        }
        
    } catch (error) {
        console.error('📥 IMPORT: Connection requests failed:', error);
        console.error('📥 IMPORT: Error details:', error);
        showToast('Connection requests failed: ' + error.message, 'error');
        
        sessionData.status = 'failed';
        sessionData.error = error.message;
        sessionData.endTime = Date.now();
        sessionData.duration = sessionData.endTime - sessionData.startTime;
        await saveImportSession(sessionData);
    } finally {
        isConnectionProcessing = false;
        logStatus('import', 'completed');
        setTimeout(() => hideStatusBar('import'), 3000);
        
        if (btn) {
            btn.disabled = false;
            btn.textContent = '🚀 Start Connection Requests';
            btn.style.background = '';
        }
        if (stopBtn) {
            stopBtn.style.display = 'none';
            stopBtn.textContent = '🛑 Stop';
            stopBtn.disabled = false;
        }
        if (progressSection) progressSection.style.display = 'none';
    }
}
console.log('✅ IMPORT MODULE: window.startConnectionRequests assigned');

// Connection requests are now handled in background script

/**
 * Start post engagement automation
 */
window.startPostEngagement = async function startPostEngagement() {
    // CHECK FEATURE PERMISSION FIRST
    const canUseImport = await featureChecker.checkFeature('importProfiles');
    if (!canUseImport) {
        console.warn('🚫 Import feature access denied - not available in current plan');
        showToast('⬆️ Import Profiles Auto Engagement requires a paid plan. Please upgrade!', 'error');
        
        // Show plan modal for upgrade
        const planModal = document.getElementById('plan-modal');
        if (planModal) {
            planModal.style.display = 'flex';
            loadPlans();
        }
        return;
    }
    
    if (isEngagementProcessing) {
        showToast('Post engagement is already in progress', 'warning');
        return;
    }
    
    if (importedProfiles.length === 0) {
        showToast('Please import some profiles first', 'warning');
        return;
    }
    
    isEngagementProcessing = true;
    const btn = document.getElementById('start-post-engagement');
    const stopBtn = document.getElementById('stop-post-engagement');
    const progressSection = document.getElementById('engagement-progress');
    const currentEl = document.getElementById('engagement-current');
    const totalEl = document.getElementById('engagement-total');
    const progressBarEl = document.getElementById('engagement-progress-bar');
    
    if (btn) {
        btn.disabled = true;
        btn.textContent = '🔄 Processing...';
    }
    if (stopBtn) {
        stopBtn.style.display = 'block';
    }
    
    if (progressSection) progressSection.style.display = 'block';
    if (totalEl) totalEl.textContent = importedProfiles.length;
    
    // Get engagement settings
    const enableLikes = document.getElementById('enable-likes')?.checked || false;
    const enableComments = document.getElementById('enable-comments')?.checked || false;
    const enableShares = document.getElementById('enable-shares')?.checked || false;
    const enableFollows = document.getElementById('enable-follows')?.checked || false;
    const enableRandomMode = document.getElementById('enable-random-mode')?.checked || false;
    const postsPerProfile = parseInt(document.getElementById('posts-per-profile')?.value) || 2;
    
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    let totalFollows = 0;
    
    const sessionData = {
        id: Date.now().toString(),
        startTime: Date.now(),
        type: 'post_engagement',
        profiles: importedProfiles.length,
        postsPerProfile,
        enableLikes,
        enableComments,
        enableShares,
        enableFollows
    };
    
    try {
        // Call background script
        const response = await chrome.runtime.sendMessage({
            action: 'startImportEngagement',
            profiles: importedProfiles,
            options: {
                postsPerProfile,
                randomMode: enableRandomMode,
                actions: {
                    likes: enableLikes,
                    comments: enableComments,
                    shares: enableShares,
                    follows: enableFollows
                }
            }
        });
        
        if (response.success) {
            const result = response.result;
            showToast(`Post engagement completed! Likes: ${result.totalLikes}, Comments: ${result.totalComments}, Shares: ${result.totalShares}, Follows: ${result.totalFollows}`, 'success');
            
            // Save session data
            sessionData.likes = result.totalLikes;
            sessionData.comments = result.totalComments;
            sessionData.shares = result.totalShares;
            sessionData.follows = result.totalFollows;
            sessionData.status = 'completed';
            sessionData.endTime = Date.now();
            sessionData.duration = sessionData.endTime - sessionData.startTime;
            
            await saveImportSession(sessionData);
            await loadImportHistory();
        } else {
            throw new Error(response.error);
        }
        
    } catch (error) {
        console.error('Post engagement failed:', error);
        showToast('Post engagement failed: ' + error.message, 'error');
        
        sessionData.status = 'failed';
        sessionData.error = error.message;
        sessionData.endTime = Date.now();
        sessionData.duration = sessionData.endTime - sessionData.startTime;
        await saveImportSession(sessionData);
    } finally {
        isEngagementProcessing = false;
        if (btn) {
            btn.disabled = false;
            btn.textContent = '🎯 Start Post Engagement';
        }
        if (stopBtn) {
            stopBtn.style.display = 'none';
            stopBtn.textContent = '🛑 Stop';
            stopBtn.disabled = false;
        }
        if (progressSection) progressSection.style.display = 'none';
    }
}

// Post engagement is now handled in background script

// Contact info extraction is now handled in background script

// Lead saving is now handled in background script

// Name extraction is now handled in background script

/**
 * Start combined automation (connection requests + post engagement)
 */
window.startCombinedAutomation = async function startCombinedAutomation() {
    // CHECK FEATURE PERMISSION FIRST
    const canUseImport = await featureChecker.checkFeature('importProfiles');
    if (!canUseImport) {
        console.warn('🚫 Import feature access denied - not available in current plan');
        showToast('⬆️ Import Profiles Auto Engagement requires a paid plan. Please upgrade!', 'error');
        
        // Show plan modal for upgrade
        const planModal = document.getElementById('plan-modal');
        if (planModal) {
            planModal.style.display = 'flex';
            loadPlans();
        }
        return;
    }
    
    // Check daily limits before starting
    const limits = await checkAllDailyLimits();
    const remainingActions = await getRemainingActions();
    
    if (limits.anyLimitReached) {
        let limitMessages = [];
        if (!limits.comments.canProceed) limitMessages.push(`Comments: ${limits.comments.used}/${limits.comments.limit}`);
        if (!limits.likes.canProceed) limitMessages.push(`Likes: ${limits.likes.used}/${limits.likes.limit}`);
        if (!limits.shares.canProceed) limitMessages.push(`Shares: ${limits.shares.used}/${limits.shares.limit}`);
        if (!limits.follows.canProceed) limitMessages.push(`Follows: ${limits.follows.used}/${limits.follows.limit}`);
        if (!limits.connections.canProceed) limitMessages.push(`Connections: ${limits.connections.used}/${limits.connections.limit}`);
        
        const proceed = confirm(
            `⚠️ Daily Limit(s) Reached!\n\n` +
            `${limitMessages.join('\n')}\n\n` +
            `Some actions may be skipped due to limits.\n` +
            `Do you still want to proceed?\n\n` +
            `💡 Tip: Adjust daily limits in the Limits tab.`
        );
        if (!proceed) return;
    }
    
    // Log remaining actions for this session
    console.log('📊 IMPORT: Remaining daily actions:', remainingActions);
    
    if (isConnectionProcessing || isEngagementProcessing) {
        showToast('Another automation is already in progress', 'warning');
        return;
    }
    
    if (importedProfiles.length === 0) {
        showToast('Please import some profiles first', 'warning');
        return;
    }
    
    isConnectionProcessing = true;
    isEngagementProcessing = true;
    
    // Save processing state to storage for persistence across popup reopens
    await chrome.storage.local.set({ importAutomationActive: true, importAutomationType: 'combined' });
    
    const btn = document.getElementById('start-combined-automation');
    const progressSection = document.getElementById('combined-progress');
    const stopBtn = document.getElementById('stop-combined-automation');
    const currentEl = document.getElementById('combined-current');
    const totalEl = document.getElementById('combined-total');
    const progressBarEl = document.getElementById('combined-progress-bar');
    
    if (btn) {
        btn.disabled = true;
        btn.textContent = '🔄 Processing...';
    }
    if (stopBtn) {
        stopBtn.style.display = 'block';
    }
    
    if (progressSection) progressSection.style.display = 'block';
    if (totalEl) totalEl.textContent = importedProfiles.length;
    
    // Get settings
    const sendConnections = document.getElementById('combined-send-connections')?.checked ?? true;
    const extractContactInfo = document.getElementById('combined-extract-contact-info')?.checked || false;
    const enableLikes = document.getElementById('combined-enable-likes')?.checked || false;
    const enableComments = document.getElementById('combined-enable-comments')?.checked || false;
    const enableShares = document.getElementById('combined-enable-shares')?.checked || false;
    const enableFollows = document.getElementById('combined-enable-follows')?.checked || false;
    const enableRandomMode = document.getElementById('combined-enable-random-mode')?.checked || false;
    const postsPerProfile = parseInt(document.getElementById('combined-posts-per-profile')?.value) || 2;
    
    const sessionData = {
        id: Date.now().toString(),
        startTime: Date.now(),
        type: 'combined_automation',
        profiles: importedProfiles.length,
        sendConnections,
        extractContactInfo,
        postsPerProfile,
        enableLikes,
        enableComments,
        enableShares,
        enableFollows
    };
    
    try {
        // Call background script
        const response = await chrome.runtime.sendMessage({
            action: 'startImportCombined',
            profiles: importedProfiles,
            options: {
                sendConnections,
                extractContactInfo,
                postsPerProfile,
                randomMode: enableRandomMode,
                actions: {
                    likes: enableLikes,
                    comments: enableComments,
                    shares: enableShares,
                    follows: enableFollows
                }
            }
        });
        
        if (response.success) {
            const result = response.result;
            showToast(`Combined automation completed! Connections: ${result.connectionsSuccessful}/${result.connectionsSuccessful + result.connectionsFailed}, Likes: ${result.totalLikes}, Comments: ${result.totalComments}, Shares: ${result.totalShares}, Follows: ${result.totalFollows}`, 'success');
            
            // Save session data
            sessionData.connectionsSuccessful = result.connectionsSuccessful;
            sessionData.connectionsFailed = result.connectionsFailed;
            sessionData.likes = result.totalLikes;
            sessionData.comments = result.totalComments;
            sessionData.shares = result.totalShares;
            sessionData.follows = result.totalFollows;
            sessionData.status = 'completed';
            sessionData.endTime = Date.now();
            sessionData.duration = sessionData.endTime - sessionData.startTime;
            
            await saveImportSession(sessionData);
            await loadImportHistory();
        } else {
            throw new Error(response.error);
        }
        
    } catch (error) {
        console.error('Combined automation failed:', error);
        showToast('Combined automation failed: ' + error.message, 'error');
        
        sessionData.status = 'failed';
        sessionData.error = error.message;
        sessionData.endTime = Date.now();
        sessionData.duration = sessionData.endTime - sessionData.startTime;
        await saveImportSession(sessionData);
    } finally {
        isConnectionProcessing = false;
        isEngagementProcessing = false;
        // Clear processing state from storage
        await chrome.storage.local.set({ importAutomationActive: false, importAutomationType: null });
        if (btn) {
            btn.disabled = false;
            btn.textContent = '🚀 Launch Automation';
        }
        if (stopBtn) {
            stopBtn.style.display = 'none';
            stopBtn.textContent = '🛑 Stop';
            stopBtn.disabled = false;
        }
        if (progressSection) progressSection.style.display = 'none';
    }
}

/**
 * Save individual import record (profile-level)
 */
async function saveImportRecord(record) {
    try {
        console.error('💾💾💾 IMPORT POPUP: Saving profile record:', record);
        // Save to import history
        const { importHistory = [] } = await chrome.storage.local.get('importHistory');
        console.error('💾 IMPORT POPUP: Current history length:', importHistory.length);
        console.error('💾 IMPORT POPUP: Current history:', importHistory);
        
        importHistory.unshift(record);
        console.error('💾 IMPORT POPUP: After unshift, length:', importHistory.length);
        
        // Keep only last 200 records
        if (importHistory.length > 200) {
            importHistory.splice(200);
        }
        
        await chrome.storage.local.set({ importHistory });
        console.error('✅✅✅ IMPORT POPUP: Saved profile record, total records:', importHistory.length);
        
    } catch (error) {
        console.error('Failed to save import record:', error);
    }
}

/**
 * Save import session to history (legacy - for processing history)
 */
async function saveImportSession(sessionData) {
    try {
        console.log('💾 IMPORT: Saving session data:', sessionData);
        // Save to import history
        const { importHistory = [] } = await chrome.storage.local.get('importHistory');
        importHistory.unshift(sessionData);
        
        // Keep only last 50 sessions
        if (importHistory.length > 50) {
            importHistory.splice(50);
        }
        
        await chrome.storage.local.set({ importHistory });
        console.log('💾 IMPORT: Saved to importHistory, total sessions:', importHistory.length);
        
        // Also save to main processing history for Analytics tab
        const { processingHistory = [] } = await chrome.storage.local.get('processingHistory');
        
        // Convert import session to processing history format
        const processingSession = {
            id: sessionData.id,
            startTime: sessionData.startTime,
            endTime: sessionData.endTime,
            duration: sessionData.duration,
            type: sessionData.type,
            status: sessionData.status,
            processed: sessionData.profiles || 0,
            successful: sessionData.successful || sessionData.connectionsSuccessful || 0,
            target: sessionData.profiles || 0,
            query: `Import (${sessionData.profiles} profiles)`,
            options: {
                extractContactInfo: sessionData.extractContactInfo,
                postsPerProfile: sessionData.postsPerProfile,
                enableLikes: sessionData.enableLikes,
                enableComments: sessionData.enableComments,
                enableShares: sessionData.enableShares,
                enableFollows: sessionData.enableFollows
            },
            // Add import-specific data
            likes: sessionData.likes || 0,
            comments: sessionData.comments || 0,
            shares: sessionData.shares || 0,
            follows: sessionData.follows || 0,
            connectionsFailed: sessionData.connectionsFailed || sessionData.failed || 0
        };
        
        processingHistory.unshift(processingSession);
        
        // Keep only last 100 sessions
        if (processingHistory.length > 100) {
            processingHistory.splice(100);
        }
        
        await chrome.storage.local.set({ processingHistory });
        
        console.log('💾 Import session saved to both histories:', sessionData);
        
    } catch (error) {
        console.error('Failed to save import session:', error);
    }
}

/**
 * Load import history
 */
async function loadImportHistory() {
    try {
        console.log('📊 IMPORT: Loading import history...');
        const { importHistory = [] } = await chrome.storage.local.get('importHistory');
        console.log('📊 IMPORT: Found', importHistory.length, 'sessions in storage');
        
        // Check if "Show Posts" is enabled
        const showPostDetails = document.getElementById('show-post-details')?.checked || false;
        
        // Update statistics
        const totalProfiles = importHistory.length;
        const totalConnections = importHistory.reduce((sum, record) => 
            sum + (record.connectionsSent || 0), 0);
        const totalPosts = importHistory.reduce((sum, record) => 
            sum + ((record.likes || 0) + (record.comments || 0) + (record.shares || 0)), 0);
        const totalCommentsGenerated = importHistory.reduce((sum, record) => 
            sum + ((record.postDetails || []).filter(p => p.generatedComment).length), 0);
        const successfulProfiles = importHistory.filter(record => 
            record.status === 'completed' || record.status === 'Success').length;
        const successRate = totalProfiles > 0 ? 
            Math.round((successfulProfiles / totalProfiles) * 100) : 0;
        
        // Update UI elements
        updateElement('total-import-sessions', totalProfiles);
        updateElement('total-connections-sent', totalConnections);
        updateElement('total-posts-engaged', totalPosts);
        updateElement('total-comments-generated', totalCommentsGenerated);
        updateElement('import-success-rate', successRate + '%');
        
        // Get search term
        const searchInput = document.getElementById('import-history-search');
        const searchTerm = searchInput?.value?.toLowerCase() || '';
        
        // Filter history by search term
        const filteredHistory = searchTerm ? importHistory.filter(record => {
            const profileName = (record.profileName || '').toLowerCase();
            const profileUrl = (record.profileUrl || '').toLowerCase();
            return profileName.includes(searchTerm) || profileUrl.includes(searchTerm);
        }) : importHistory;
        
        // Update history table
        const tbody = document.getElementById('import-history-table-body');
        if (tbody) {
            if (filteredHistory.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="10" style="padding: 20px; text-align: center; color: #999;">
                            ${searchTerm ? 'No matching profiles found.' : 'No import actions yet. Start automation to see history here.'}
                        </td>
                    </tr>
                `;
            } else {
                let tableHtml = '';
                filteredHistory.forEach((record, idx) => {
                    const date = record.date || new Date(record.timestamp).toLocaleString('en-GB', { 
                        day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' 
                    });
                    const profileLink = record.profileUrl || 'N/A';
                    const profileName = record.profileName || 'Unknown';
                    const hasPostDetails = (record.postDetails || []).length > 0;
                    
                    const profileDisplay = profileLink !== 'N/A' ? 
                        `<a href="${profileLink}" target="_blank" style="color: #0a66c2;">🔗</a>` : '-';
                    
                    const statusBg = record.status === 'completed' || record.status === 'Success' ? '#28a745' : 
                                    record.status === 'failed' ? '#dc3545' : '#6c757d';
                    
                    // Main profile row (removed email column)
                    tableHtml += `
                        <tr style="background: ${idx % 2 === 0 ? '#fff' : '#f9f9f9'};">
                            <td style="padding: 5px; border-bottom: 1px solid #eee; font-size: 9px;">${date}</td>
                            <td style="padding: 5px; border-bottom: 1px solid #eee; font-weight: 600; font-size: 10px;">${profileName}</td>
                            <td style="padding: 5px; border-bottom: 1px solid #eee; text-align: center;">${profileDisplay}</td>
                            <td style="padding: 5px; border-bottom: 1px solid #eee; text-align: center;">${record.connectionsSent || 0}</td>
                            <td style="padding: 5px; border-bottom: 1px solid #eee; text-align: center;">${record.likes || 0}</td>
                            <td style="padding: 5px; border-bottom: 1px solid #eee; text-align: center;">${record.comments || 0}</td>
                            <td style="padding: 5px; border-bottom: 1px solid #eee; text-align: center;">${record.shares || 0}</td>
                            <td style="padding: 5px; border-bottom: 1px solid #eee; text-align: center;">${record.follows || 0}</td>
                            <td style="padding: 5px; border-bottom: 1px solid #eee; text-align: center;">
                                <span style="background: ${statusBg}; color: white; padding: 1px 4px; border-radius: 3px; font-size: 8px;">
                                    ${record.status === 'completed' ? '✓' : record.status === 'failed' ? '✗' : record.status}
                                </span>
                            </td>
                            <td style="padding: 5px; border-bottom: 1px solid #eee; text-align: center;">
                                ${hasPostDetails ? `<button onclick="togglePostDetails('${record.id}')" style="background: #693fe9; color: white; border: none; padding: 2px 6px; border-radius: 3px; font-size: 9px; cursor: pointer;">${(record.postDetails || []).length}</button>` : '-'}
                            </td>
                        </tr>
                    `;
                    
                    // Post details rows (shown if toggle is on and has post details)
                    if (showPostDetails && hasPostDetails) {
                        (record.postDetails || []).forEach(post => {
                            const postUrl = post.postLink || '';
                            const postLink = postUrl ? `<a href="${postUrl}" target="_blank" style="color: #693fe9; font-size: 9px;">View</a>` : '-';
                            const truncate = (text, max) => text && text.length > max ? text.substring(0, max) + '...' : (text || '-');
                            
                            tableHtml += `
                                <tr style="background: #f0f4ff;">
                                    <td colspan="2" style="padding: 4px 5px 4px 20px; border-bottom: 1px solid #ddd; font-size: 9px; color: #666;">↳ Post by: <strong>${post.authorName || 'Unknown'}</strong></td>
                                    <td style="padding: 4px; border-bottom: 1px solid #ddd; text-align: center;">${postLink}</td>
                                    <td colspan="3" style="padding: 4px; border-bottom: 1px solid #ddd; font-size: 9px; color: #333;" title="${(post.postContent || '').replace(/"/g, '&quot;')}">${truncate(post.postContent, 40)}</td>
                                    <td colspan="4" style="padding: 4px; border-bottom: 1px solid #ddd; font-size: 9px; color: #693fe9;" title="${(post.generatedComment || '').replace(/"/g, '&quot;')}">${truncate(post.generatedComment, 40)}</td>
                                </tr>
                            `;
                        });
                    }
                });
                tbody.innerHTML = tableHtml;
            }
        }
        
    } catch (error) {
        console.error('📊 IMPORT: Failed to load import history:', error);
    }
}

// Toggle post details for a specific profile
window.togglePostDetails = function(profileId) {
    const showPostsCheckbox = document.getElementById('show-post-details');
    if (showPostsCheckbox) {
        showPostsCheckbox.checked = !showPostsCheckbox.checked;
        loadImportHistory();
    }
};

/**
 * Clear import history
 */
async function clearImportHistory() {
    if (!confirm('Are you sure you want to clear all import history? This action cannot be undone.')) {
        return;
    }
    
    try {
        await chrome.storage.local.set({ importHistory: [] });
        await loadImportHistory();
        showToast('Import history cleared', 'success');
        
    } catch (error) {
        console.error('Failed to clear import history:', error);
        showToast('Failed to clear import history', 'error');
    }
}

/**
 * Export import history to CSV with post details
 */
async function exportImportHistoryToCSV() {
    try {
        const { importHistory = [] } = await chrome.storage.local.get('importHistory');
        
        if (importHistory.length === 0) {
            showToast('No data to export', 'warning');
            return;
        }
        
        // CSV headers - including post details columns
        const headers = ['Date', 'Profile Name', 'Profile Link', 'Email', 'Phone', 'Connections', 'Likes', 'Comments', 'Shares', 'Follows', 'Status', 'Post Author', 'Post Text', 'AI Comment Generated', 'Post Link'];
        
        // Convert data to CSV rows - one row per post detail or one row per profile if no posts
        const rows = [];
        
        importHistory.forEach(record => {
            const baseRow = [
                record.date || new Date(record.timestamp).toLocaleString(),
                record.profileName || 'Unknown',
                record.profileUrl || 'N/A',
                record.email || 'N/A',
                record.phone || 'N/A',
                record.connectionsSent || 0,
                record.likes || 0,
                record.comments || 0,
                record.shares || 0,
                record.follows || 0,
                record.status || 'unknown'
            ];
            
            // If there are post details, create a row for each post
            if (record.postDetails && record.postDetails.length > 0) {
                record.postDetails.forEach((post, index) => {
                    const postRow = [
                        ...baseRow,
                        post.authorName || 'Unknown',
                        (post.postContent || '').replace(/"/g, '""').replace(/\n/g, ' '), // Escape quotes and newlines
                        (post.generatedComment || '').replace(/"/g, '""').replace(/\n/g, ' '),
                        post.postLink || 'N/A'
                    ];
                    rows.push(postRow);
                });
            } else {
                // No post details, add empty columns
                rows.push([...baseRow, 'N/A', 'N/A', 'N/A', 'N/A']);
            }
        });
        
        // Create CSV content
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `import-history-${Date.now()}.csv`);
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showToast(`Exported ${rows.length} records to CSV`, 'success');
        
    } catch (error) {
        console.error('Failed to export CSV:', error);
        showToast('Failed to export CSV', 'error');
    }
}

/**
 * Helper functions
 */
function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function getStatusColor(status) {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
        case 'success':
        case 'completed':
            return '#28a745'; // Green
        case 'failed':
            return '#dc3545'; // Red
        case 'stopped':
        case 'pending':
            return '#ffc107'; // Yellow
        default:
            return '#6c757d'; // Gray
    }
}

/**
 * Load import credits and update UI
 */
async function loadImportCredits() {
    try {
        console.log('💳 IMPORT: Loading import credits...');
        const credits = await creditsService.getImportCredits();
        creditsService.updateCreditsUI(credits);
        console.log('✅ IMPORT: Credits loaded successfully');
    } catch (error) {
        console.error('❌ IMPORT: Failed to load credits:', error);
        // Show default values if not authenticated
        creditsService.updateCreditsUI({
            remaining: 0,
            total: 0,
            used: 0,
            planName: 'Free'
        });
    }
}

/**
 * Track successful profile processing (call this after each profile is successfully processed)
 */
async function trackProfileSuccess() {
    try {
        await creditsService.trackImportUsage();
        // Refresh credits display
        setTimeout(() => loadImportCredits(), 500);
    } catch (error) {
        console.error('❌ IMPORT: Failed to track profile success:', error);
    }
}

/**
 * Check and restore import automation state on popup open
 */
export async function checkImportAutomationState() {
    try {
        const result = await chrome.storage.local.get(['importAutomationActive', 'importAutomationType', 'importProgress']);
        const isActive = result.importAutomationActive || false;
        const automationType = result.importAutomationType || 'combined';
        const progress = result.importProgress || { current: 0, total: 0 };

        console.log('POPUP: Import automation state:', { isActive, automationType, progress });

        const btn = document.getElementById('start-combined-automation');
        const stopBtn = document.getElementById('stop-combined-automation');
        const progressSection = document.getElementById('combined-progress');
        const currentEl = document.getElementById('combined-current');
        const totalEl = document.getElementById('combined-total');
        const progressBarEl = document.getElementById('combined-progress-bar');
        const percentageEl = document.getElementById('combined-percentage');

        if (isActive) {
            // Show stop button, hide start button
            if (btn) {
                btn.style.display = 'none';
            }
            if (stopBtn) {
                stopBtn.style.display = 'block';
            }
            if (progressSection) {
                progressSection.style.display = 'block';
            }
            // Update progress display
            if (currentEl) currentEl.textContent = progress.current || 0;
            if (totalEl) totalEl.textContent = progress.total || 0;
            if (progressBarEl && progress.total > 0) {
                const pct = Math.round((progress.current / progress.total) * 100);
                progressBarEl.style.width = `${pct}%`;
                if (percentageEl) percentageEl.textContent = `${pct}%`;
            }
            console.log('POPUP: Restored Import automation stop button state');
        } else {
            // Show start button, hide stop button
            if (btn) {
                btn.style.display = 'block';
                btn.disabled = false;
                btn.textContent = '🚀 Launch Automation';
            }
            if (stopBtn) {
                stopBtn.style.display = 'none';
            }
            if (progressSection) {
                progressSection.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('POPUP: Error checking Import automation state:', error);
    }
}

/**
 * Remove a profile from the input box and importedProfiles array by URL
 */
export function removeProfileByUrl(profileUrl) {
    console.log('🗑️ IMPORT UI: removeProfileByUrl called for:', profileUrl);
    console.log('🗑️ IMPORT UI: Current profiles count:', importedProfiles.length);
    
    // Normalize URL for comparison (remove trailing slashes, etc.)
    const normalizeUrl = (url) => url?.replace(/\/$/, '').toLowerCase().trim();
    const normalizedTarget = normalizeUrl(profileUrl);
    
    const index = importedProfiles.findIndex(p => {
        const normalizedP = normalizeUrl(p);
        return normalizedP === normalizedTarget || normalizedP.includes(normalizedTarget) || normalizedTarget.includes(normalizedP);
    });
    
    console.log('🗑️ IMPORT UI: Found at index:', index);
    
    if (index !== -1) {
        const removed = importedProfiles.splice(index, 1);
        console.log('🗑️ IMPORT UI: Removed profile:', removed[0]);
        console.log('🗑️ IMPORT UI: Remaining profiles:', importedProfiles.length);
        
        // Update the input box
        const profileInput = document.getElementById('profile-urls-input');
        if (profileInput) {
            profileInput.value = importedProfiles.join('\n');
            console.log('🗑️ IMPORT UI: Updated input box');
        }
        
        // Update count display
        const countEl = document.getElementById('profile-count');
        if (countEl) {
            countEl.textContent = importedProfiles.length;
            console.log('🗑️ IMPORT UI: Updated count display');
        }
        
        // Update imported profiles display
        updateImportedProfilesDisplay();
    } else {
        console.log('⚠️ IMPORT UI: Profile not found in array. Available profiles:', importedProfiles.slice(0, 3));
    }
}

/**
 * Add a row to import history table for live updates
 */
export function addLiveHistoryRow(record) {
    const tableBody = document.getElementById('import-history-table-body');
    if (!tableBody) return;
    
    // Remove "no data" placeholder if present
    const placeholderRow = tableBody.querySelector('tr td[colspan]');
    if (placeholderRow) {
        placeholderRow.parentElement.remove();
    }
    
    const dateStr = new Date(record.timestamp || Date.now()).toLocaleString();
    const profileName = record.profileName || extractNameFromUrl(record.profileUrl || '');
    const profileUrl = record.profileUrl || '';
    const email = record.email || '-';
    const connectionSent = record.connectionSent ? '✅' : (record.connectionPending ? '⏳' : '-');
    const likes = record.likes || 0;
    const comments = record.comments || 0;
    const shares = record.shares || 0;
    const follows = record.follows || 0;
    const status = record.status || 'pending';
    const statusColor = getStatusColor(status);
    
    const row = document.createElement('tr');
    row.id = `import-row-${record.id || Date.now()}`;
    row.style.background = status === 'processing' ? '#fff8e1' : '';
    row.innerHTML = `
        <td style="padding: 6px; font-size: 10px;">${dateStr}</td>
        <td style="padding: 6px; font-size: 10px;">${profileName}</td>
        <td style="padding: 6px; text-align: center;"><a href="${profileUrl}" target="_blank" style="color: #693fe9;">🔗</a></td>
        <td style="padding: 6px; font-size: 10px;">${email}</td>
        <td style="padding: 6px; text-align: center;">${connectionSent}</td>
        <td style="padding: 6px; text-align: center;">${likes}</td>
        <td style="padding: 6px; text-align: center;">${comments}</td>
        <td style="padding: 6px; text-align: center;">${shares}</td>
        <td style="padding: 6px; text-align: center;">${follows}</td>
        <td style="padding: 6px; text-align: center;"><span style="color: ${statusColor}; font-weight: 600;">${status}</span></td>
        <td style="padding: 6px; text-align: center;">-</td>
    `;
    
    // Insert at top of table
    tableBody.insertBefore(row, tableBody.firstChild);
}

/**
 * Update an existing live history row
 */
export function updateLiveHistoryRow(rowId, updates) {
    const row = document.getElementById(`import-row-${rowId}`);
    if (!row) return;
    
    // Update status and other fields as needed
    if (updates.status) {
        const statusCell = row.querySelector('td:nth-child(10) span');
        if (statusCell) {
            statusCell.textContent = updates.status;
            statusCell.style.color = getStatusColor(updates.status);
        }
        row.style.background = updates.status === 'completed' ? '#e8f5e9' : 
                               updates.status === 'failed' ? '#ffebee' : '';
    }
    if (updates.connectionSent !== undefined) {
        const connCell = row.querySelector('td:nth-child(5)');
        if (connCell) connCell.textContent = updates.connectionSent ? '✅' : '-';
    }
    if (updates.likes !== undefined) {
        const likesCell = row.querySelector('td:nth-child(6)');
        if (likesCell) likesCell.textContent = updates.likes;
    }
    if (updates.comments !== undefined) {
        const commentsCell = row.querySelector('td:nth-child(7)');
        if (commentsCell) commentsCell.textContent = updates.comments;
    }
}

/**
 * Extract name from LinkedIn profile URL
 */
function extractNameFromUrl(url) {
    if (!url) return 'Unknown';
    const match = url.match(/linkedin\.com\/in\/([^\/\?]+)/);
    if (match && match[1]) {
        return match[1].replace(/-/g, ' ').replace(/\d+$/, '').trim();
    }
    return 'Unknown';
}

/**
 * Set up storage change listener for live history updates
 */
function setupLiveHistoryUpdates() {
    // Listen for storage changes to update table in real-time
    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'local') {
            // If importHistory changes, reload the table
            if (changes.importHistory) {
                console.log('📊 IMPORT: Storage changed - reloading history table');
                loadImportHistory();
            }
            
            // If pending profiles change, update the textarea
            if (changes.pendingImportProfiles) {
                const newProfiles = changes.pendingImportProfiles.newValue || [];
                const input = document.getElementById('profile-urls-input');
                const countEl = document.getElementById('profile-count');
                
                if (input && input !== document.activeElement) {
                    input.value = newProfiles.join('\n');
                }
                if (countEl) {
                    countEl.textContent = newProfiles.length;
                }
                importedProfiles = newProfiles;
            }
        }
    });
    
    console.log('📊 IMPORT: Live history updates listener set up');
}

/**
 * Start periodic refresh during processing
 */
let historyRefreshInterval = null;

export function startLiveHistoryRefresh() {
    if (historyRefreshInterval) return;
    
    historyRefreshInterval = setInterval(() => {
        loadImportHistory();
    }, 2000); // Refresh every 2 seconds during processing
    
    console.log('📊 IMPORT: Started live history refresh');
}

export function stopLiveHistoryRefresh() {
    if (historyRefreshInterval) {
        clearInterval(historyRefreshInterval);
        historyRefreshInterval = null;
        console.log('📊 IMPORT: Stopped live history refresh');
    }
}

// ========== IMPORT SCHEDULER FUNCTIONALITY ==========

let importCountdownInterval = null;

/**
 * Initialize import scheduler
 */
export async function initializeImportScheduler() {
    console.log('🕐 IMPORT: Initializing scheduler...');
    
    // Load saved schedules
    loadImportSchedules();
    
    // Set up event listeners
    const addScheduleBtn = document.getElementById('add-import-schedule');
    const schedulerEnabledToggle = document.getElementById('import-scheduler-enabled');
    const profilesPerDaySelect = document.getElementById('import-profiles-per-day');
    
    if (addScheduleBtn) {
        addScheduleBtn.addEventListener('click', addImportSchedule);
    }
    
    if (schedulerEnabledToggle) {
        schedulerEnabledToggle.addEventListener('change', async (e) => {
            // Notify background scheduler
            try {
                await chrome.runtime.sendMessage({
                    action: 'setImportSchedulerEnabled',
                    enabled: e.target.checked
                });
            } catch (err) {
                console.error('IMPORT: Failed to update scheduler enabled state:', err);
            }
            
            if (e.target.checked) {
                startImportCountdown();
            } else {
                stopImportCountdown();
            }
        });
        
        // Load saved state
        chrome.storage.local.get(['importSchedulerEnabled'], (result) => {
            schedulerEnabledToggle.checked = result.importSchedulerEnabled || false;
            if (result.importSchedulerEnabled) {
                startImportCountdown();
            }
        });
    }
    
    if (profilesPerDaySelect) {
        // Load saved value
        chrome.storage.local.get(['importProfilesPerDay'], (result) => {
            if (result.importProfilesPerDay) {
                profilesPerDaySelect.value = result.importProfilesPerDay;
            }
        });
        
        profilesPerDaySelect.addEventListener('change', async (e) => {
            const count = parseInt(e.target.value);
            // Notify background scheduler
            try {
                await chrome.runtime.sendMessage({
                    action: 'setImportProfilesPerDay',
                    count: count
                });
            } catch (err) {
                console.error('IMPORT: Failed to update profiles per day:', err);
            }
        });
    }
    
    // Reload background scheduler to sync state
    try {
        await chrome.runtime.sendMessage({ action: 'reloadImportScheduler' });
        console.log('IMPORT: Background scheduler reloaded');
    } catch (err) {
        console.error('IMPORT: Failed to reload background scheduler:', err);
    }
    
    console.log('✅ IMPORT: Scheduler initialized');
}

/**
 * Add a new import schedule - communicates with background scheduler
 * Saves current automation options with the schedule
 */
async function addImportSchedule() {
    const timeInput = document.getElementById('import-schedule-time-input');
    if (!timeInput || !timeInput.value) {
        showToast('Please select a time', 'error');
        return;
    }
    
    const time = timeInput.value;
    
    // Get current automation options from UI
    const sendConnections = document.getElementById('combined-send-connections')?.checked ?? false;
    const extractContactInfo = document.getElementById('combined-extract-contact-info')?.checked ?? false;
    const enableLikes = document.getElementById('combined-enable-likes')?.checked ?? false;
    const enableComments = document.getElementById('combined-enable-comments')?.checked ?? false;
    const enableFollows = document.getElementById('combined-enable-follows')?.checked ?? false;
    const enableShares = document.getElementById('combined-enable-shares')?.checked ?? false;
    const enableRandomMode = document.getElementById('combined-enable-random-mode')?.checked ?? false;
    const postsPerProfile = parseInt(document.getElementById('combined-posts-per-profile')?.value) || 2;
    
    const options = {
        sendConnections,
        extractContactInfo,
        postsPerProfile,
        randomMode: enableRandomMode,
        actions: {
            like: enableLikes,
            comment: enableComments,
            follow: enableFollows,
            share: enableShares
        }
    };
    
    console.log('IMPORT: Adding schedule with options:', options);
    
    try {
        // Send to background scheduler with options
        const response = await chrome.runtime.sendMessage({
            action: 'addImportSchedule',
            time: time,
            options: options
        });
        
        if (response.success) {
            // Clear input
            timeInput.value = '';
            
            // Reload schedules display
            loadImportSchedules();
            
            // Start countdown if enabled
            const enabledToggle = document.getElementById('import-scheduler-enabled');
            if (enabledToggle && enabledToggle.checked) {
                startImportCountdown();
            }
            
            showToast('Schedule added with current settings', 'success');
        } else {
            showToast(response.error || 'Failed to add schedule', 'error');
        }
    } catch (error) {
        console.error('IMPORT: Error adding schedule:', error);
        showToast('Failed to add schedule', 'error');
    }
}

/**
 * Remove an import schedule - communicates with background scheduler
 */
async function removeImportSchedule(time) {
    try {
        const response = await chrome.runtime.sendMessage({
            action: 'removeImportSchedule',
            time: time
        });
        
        if (response.success) {
            loadImportSchedules();
            showToast('Schedule removed', 'info');
        } else {
            showToast(response.error || 'Failed to remove schedule', 'error');
        }
    } catch (error) {
        console.error('IMPORT: Error removing schedule:', error);
        showToast('Failed to remove schedule', 'error');
    }
}

/**
 * Load and display import schedules with their saved options
 */
async function loadImportSchedules() {
    const listEl = document.getElementById('import-schedule-list');
    if (!listEl) return;
    
    const result = await chrome.storage.local.get(['importSchedules']);
    const schedules = result.importSchedules || [];
    
    if (schedules.length === 0) {
        listEl.innerHTML = '<small style="color: #999;">No schedules</small>';
        return;
    }
    
    // Helper to format schedule options as tags
    const formatOptions = (schedule) => {
        if (typeof schedule === 'string') return ''; // Old format, no options
        
        const opts = schedule.options;
        if (!opts) return '';
        
        const tags = [];
        if (opts.sendConnections) tags.push('📤 Connect');
        if (opts.actions?.comment) tags.push('💬 Comment');
        if (opts.actions?.like) tags.push('❤️ Like');
        if (opts.actions?.follow) tags.push('👤 Follow');
        if (opts.actions?.share) tags.push('🔄 Share');
        if (opts.extractContactInfo) tags.push('📧 Extract');
        
        if (tags.length === 0) return '<span style="color: #999; font-size: 10px;">No actions</span>';
        
        return tags.map(t => `<span style="background: #f0f0f0; padding: 1px 4px; border-radius: 3px; font-size: 9px; margin-right: 2px;">${t}</span>`).join('');
    };
    
    listEl.innerHTML = schedules.map(schedule => {
        const time = typeof schedule === 'string' ? schedule : schedule.time;
        const optionsTags = formatOptions(schedule);
        
        return `
            <div style="display: flex; flex-direction: column; padding: 6px 8px; background: white; border-radius: 6px; margin-bottom: 6px; border: 1px solid #e0e0e0;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 600; color: #693fe9; font-size: 14px;">⏰ ${time}</span>
                    <button class="import-schedule-remove-btn" data-time="${time}" 
                            style="background: none; border: none; color: #dc3545; cursor: pointer; font-size: 14px; padding: 2px 6px;">×</button>
                </div>
                ${optionsTags ? `<div style="margin-top: 4px; display: flex; flex-wrap: wrap; gap: 2px;">${optionsTags}</div>` : ''}
            </div>
        `;
    }).join('');
    
    // Add event listeners for remove buttons (CSP compliant)
    listEl.querySelectorAll('.import-schedule-remove-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const time = btn.getAttribute('data-time');
            if (time) removeImportSchedule(time);
        });
    });
}

/**
 * Start countdown timer for next scheduled import
 */
function startImportCountdown() {
    stopImportCountdown(); // Clear existing
    
    updateImportCountdown(); // Initial update
    
    importCountdownInterval = setInterval(updateImportCountdown, 1000);
}

/**
 * Stop countdown timer
 */
function stopImportCountdown() {
    if (importCountdownInterval) {
        clearInterval(importCountdownInterval);
        importCountdownInterval = null;
    }
    
    const nextTimeEl = document.getElementById('import-next-execution-time');
    const countdownEl = document.getElementById('import-countdown-timer');
    
    if (nextTimeEl) nextTimeEl.textContent = '--';
    if (countdownEl) countdownEl.textContent = '--:--:--';
}

/**
 * Update countdown display
 */
async function updateImportCountdown() {
    const result = await chrome.storage.local.get(['importSchedules', 'importSchedulerEnabled']);
    const schedules = result.importSchedules || [];
    const enabled = result.importSchedulerEnabled;
    
    if (!enabled || schedules.length === 0) {
        stopImportCountdown();
        return;
    }
    
    const nextTimeEl = document.getElementById('import-next-execution-time');
    const countdownEl = document.getElementById('import-countdown-timer');
    
    // Find next scheduled time
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    let nextSchedule = null;
    let nextScheduleMinutes = Infinity;
    
    for (const time of schedules) {
        const [hours, minutes] = time.split(':').map(Number);
        let scheduleMinutes = hours * 60 + minutes;
        
        // If schedule is past for today, add 24 hours
        if (scheduleMinutes <= currentTime) {
            scheduleMinutes += 24 * 60;
        }
        
        if (scheduleMinutes < nextScheduleMinutes) {
            nextScheduleMinutes = scheduleMinutes;
            nextSchedule = time;
        }
    }
    
    if (nextSchedule && nextTimeEl) {
        nextTimeEl.textContent = nextSchedule;
    }
    
    if (countdownEl) {
        const diffMinutes = nextScheduleMinutes - currentTime;
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;
        const seconds = 59 - now.getSeconds();
        
        countdownEl.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Check if it's time to run
        if (diffMinutes === 0 && seconds === 0) {
            triggerScheduledImport();
        }
    }
}

/**
 * Trigger scheduled import automation
 */
async function triggerScheduledImport() {
    console.log('⏰ IMPORT: Scheduled import triggered!');
    
    const result = await chrome.storage.local.get(['importProfilesPerDay', 'pendingImportProfiles']);
    const profilesPerDay = result.importProfilesPerDay || 20;
    const allProfiles = result.pendingImportProfiles || [];
    
    if (allProfiles.length === 0) {
        console.log('⚠️ IMPORT: No profiles to process');
        showToast('No profiles to process', 'warning');
        return;
    }
    
    // Get only the number of profiles we should process today
    const profilesToProcess = allProfiles.slice(0, profilesPerDay);
    
    console.log(`🚀 IMPORT: Processing ${profilesToProcess.length} of ${allProfiles.length} profiles`);
    
    // Store the profiles to process and trigger automation
    importedProfiles = profilesToProcess;
    
    // Trigger the combined automation
    if (window.startCombinedAutomation) {
        window.startCombinedAutomation();
    }
    
    showToast(`Starting scheduled import: ${profilesToProcess.length} profiles`, 'success');
}

// Export loadImportHistory for external use
export { loadImportHistory, syncProfileUrlsFromStorage };

// Export initialization function
export default { initializeImport };
