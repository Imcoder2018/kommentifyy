import { elements } from './state.js';
import { logStatus, showStatusBar, hideStatusBar } from './statusLogger.js';

// --- BUSINESS HOURS CHECK ---
async function checkBusinessHoursBeforeProcessing() {
    try {
        const response = await chrome.runtime.sendMessage({ action: 'getBusinessHoursStatus' });
        if (response && response.success) {
            const status = response.status;
            
            // If business hours is enabled and we're outside business hours
            if (status.enabled && !status.withinBusinessHours) {
                const proceed = confirm(
                    `⚠️ Outside Business Hours!\n\n` +
                    `Current time: ${status.currentHour}:00\n` +
                    `Business hours: ${status.businessStart}:00 - ${status.businessEnd}:00\n\n` +
                    `Do you still want to proceed?\n\n` +
                    `💡 Tip: Adjust business hours in Settings tab.`
                );
                return proceed;
            }
        }
        return true; // Proceed if check fails or business hours disabled
    } catch (error) {
        console.warn('Failed to check business hours:', error);
        return true; // Proceed on error
    }
}

// --- PEOPLE SEARCH AUTOMATION ---
export async function startPeopleSearchAutomation() {
    // Check business hours first
    const canProceed = await checkBusinessHoursBeforeProcessing();
    if (!canProceed) {
        return;
    }
    
    // Check which search source is selected (keyword or URL)
    const searchByUrl = document.getElementById('search-by-url');
    const isUsingUrl = searchByUrl?.checked || false;
    
    let keyword = '';
    let searchUrl = '';
    
    if (isUsingUrl) {
        // Using direct URL mode
        const urlInput = document.getElementById('people-search-url');
        searchUrl = urlInput?.value.trim() || '';
        
        if (!searchUrl) {
            alert('Please paste a LinkedIn people search URL');
            return;
        }
        
        if (!searchUrl.includes('linkedin.com/search/results/people')) {
            alert('Please enter a valid LinkedIn people search URL\n\nExample: https://www.linkedin.com/search/results/people/?keywords=...');
            return;
        }
        
        console.log('NETWORKING: Using URL mode with URL:', searchUrl);
    } else {
        // Using keyword mode
        keyword = elements.searchKeyword.value.trim();
        
        if (!keyword) {
            alert('Please enter a search keyword');
            return;
        }
        
        console.log('NETWORKING: Using keyword mode with keyword:', keyword);
    }
    
    const quota = parseInt(elements.connectQuota.value, 10);

    if (quota < 1 || quota > 50) {
        alert('Please enter a quota between 1 and 50');
        return;
    }

    // Parse exclude terms - only use what user entered, no defaults
    const excludeTermsStr = elements.excludeHeadlineTerms.value.trim();
    const excludeHeadlineTerms = excludeTermsStr
        ? excludeTermsStr.split(',').map(t => t.trim()).filter(Boolean)
        : []; // Empty array if user didn't enter anything

    // Get checkbox values - these are now mutually exclusive
    const sendWithNote = elements.sendWithNote.checked;
    const sendConnectionRequest = elements.sendConnectionRequest?.checked ?? false;
    
    // Validation: Only one option should be selected
    if (!sendWithNote && !sendConnectionRequest) {
        alert('Please select either "Send with Note" or "Send Connection Request"');
        return;
    }
    
    if (sendWithNote && sendConnectionRequest) {
        alert('Please select only one option: either "Send with Note" OR "Send Connection Request"');
        return;
    }
    
    console.log('NETWORKING: sendWithNote:', sendWithNote);
    console.log('NETWORKING: sendConnectionRequest:', sendConnectionRequest);
    
    const options = {
        useBooleanLogic: elements.useBooleanSearch.checked,
        filterNetwork: elements.filterNetwork.checked,
        sendWithNote: sendWithNote,
        sendConnectionRequest: sendConnectionRequest,
        extractContactInfo: elements.extractContactInfo.checked,
        excludeHeadlineTerms: excludeHeadlineTerms,
        connectionMessage: elements.connectionMessage.value.trim()
    };
    
    console.log('NETWORKING: Options being sent:', options);

    // Show status bar and status
    logStatus('networking', 'starting');
    elements.peopleSearchStatus.textContent = 'Starting people search automation...';
    elements.peopleSearchStatus.style.color = '#ffc107';

    // Show stop button, hide start button (both top and bottom)
    elements.startPeopleSearch.style.display = 'none';
    elements.stopPeopleSearch.style.display = 'block';
    if (elements.startPeopleSearchBottom) elements.startPeopleSearchBottom.style.display = 'none';
    if (elements.stopPeopleSearchBottom) elements.stopPeopleSearchBottom.style.display = 'block';

    // Save processing state to storage
    await chrome.storage.local.set({ peopleSearchActive: true });

    try {
        // Send message with timeout protection (10 seconds)
        const searchSource = isUsingUrl ? 'url' : 'keyword';
        console.log('NETWORKING: Starting people search with source:', searchSource);
        
        const response = await Promise.race([
            new Promise((resolve) => {
                chrome.runtime.sendMessage({
                    action: 'startPeopleSearch',
                    source: searchSource,  // 'url' or 'keyword'
                    keyword: isUsingUrl ? '' : keyword,
                    searchUrl: isUsingUrl ? searchUrl : '',
                    quota,
                    options,
                    message: elements.connectionMessage.value.trim()
                }, resolve);
            }),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Start automation timeout')), 10000)
            )
        ]);

        if (response && response.success) {
            elements.peopleSearchStatus.textContent =
                `✅ Automation started! Processing ${quota} connections...`;
            elements.peopleSearchStatus.style.color = '#28a745';
            
            // Let user know it's running
            console.log('NETWORKING: Automation started successfully');
        } else {
            throw new Error(response?.error || 'Failed to start automation');
        }
    } catch (error) {
        console.error('NETWORKING: Failed to start automation:', error);
        
        // Show error
        elements.peopleSearchStatus.textContent = `❌ Failed: ${error.message}`;
        elements.peopleSearchStatus.style.color = '#dc3545';
        
        // Restore buttons (both top and bottom)
        elements.startPeopleSearch.style.display = 'block';
        elements.stopPeopleSearch.style.display = 'none';
        if (elements.startPeopleSearchBottom) elements.startPeopleSearchBottom.style.display = 'block';
        if (elements.stopPeopleSearchBottom) elements.stopPeopleSearchBottom.style.display = 'none';
        
        // Clear processing state
        await chrome.storage.local.set({ peopleSearchActive: false });
        
        alert(`Failed to start automation: ${error.message}`);
        return;
    }
}

export async function stopPeopleSearchAutomation() {
    console.log('POPUP: Stopping people search...');
    logStatus('networking', 'stopped');

    // Send stop message to background script
    chrome.runtime.sendMessage({
        action: 'stopPeopleSearch'
    }, (response) => {
        console.log('POPUP: Stop response:', response);

        // Hide stop button, show start button (both top and bottom)
        elements.stopPeopleSearch.style.display = 'none';
        elements.startPeopleSearch.style.display = 'block';
        if (elements.stopPeopleSearchBottom) elements.stopPeopleSearchBottom.style.display = 'none';
        if (elements.startPeopleSearchBottom) elements.startPeopleSearchBottom.style.display = 'block';

        // Hide status bar
        hideStatusBar('networking');

        // Clear processing state from storage
        chrome.storage.local.set({ peopleSearchActive: false });

        if (response && response.success) {
            elements.peopleSearchStatus.textContent = '⏸️ People search stopped';
            elements.peopleSearchStatus.style.color = '#6c757d';
            alert('✅ People search stopped successfully!');
        } else {
            alert('⚠️ Stop signal sent. Processing will stop after current profile.');
        }
    });
}

// --- KEYWORD ALERTS ---

export async function addKeywordAlert() {
    const keyword = elements.newKeyword.value.trim();
    if (!keyword) {
        alert('Please enter a keyword');
        return;
    }

    const alerts = await chrome.storage.local.get('keywordAlerts');
    const alertsList = alerts.keywordAlerts || [];

    alertsList.push({
        id: Date.now(),
        keyword: keyword.toLowerCase(),
        enabled: true,
        createdAt: new Date().toISOString()
    });

    await chrome.storage.local.set({ keywordAlerts: alertsList });
    elements.newKeyword.value = '';
    loadKeywordAlerts();
}

export async function loadKeywordAlerts() {
    try {
        const alerts = await chrome.storage.local.get('keywordAlerts');
        const alertsList = alerts.keywordAlerts || [];

        if (alertsList.length > 0 && elements.keywordList) {
            elements.keywordList.innerHTML = alertsList.map(alert => `
                    <div class="content-item">
                        <div class="content-item-header">
                            <span class="content-item-title">${alert.keyword}</span>
                            <button class="content-item-action" data-id="${alert.id}">Delete</button>
                        </div>
                    </div>
                `).join('');

            // Add event listeners to delete buttons
            elements.keywordList.querySelectorAll('.content-item-action').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = parseInt(btn.dataset.id);
                    await deleteKeywordAlert(id);
                });
            });
        } else if (elements.keywordList) {
            elements.keywordList.innerHTML = '<p class="empty-state">No keyword alerts</p>';
        }
    } catch (error) {
        console.error('Error loading keyword alerts:', error);
    }
}

async function deleteKeywordAlert(id) {
    const alerts = await chrome.storage.local.get('keywordAlerts');
    const alertsList = alerts.keywordAlerts || [];
    const updated = alertsList.filter(a => a.id !== id);
    await chrome.storage.local.set({ keywordAlerts: updated });
    loadKeywordAlerts();
}

// --- COMPETITOR TRACKING ---

export async function addCompetitor() {
    const url = elements.competitorUrl.value.trim();
    if (!url) {
        alert('Please enter a competitor LinkedIn URL');
        return;
    }

    if (!url.includes('linkedin.com')) {
        alert('Please enter a valid LinkedIn URL');
        return;
    }

    const competitors = await chrome.storage.local.get('competitors');
    const competitorsList = competitors.competitors || [];

    competitorsList.push({
        id: Date.now(),
        url: url,
        name: url.split('/').pop() || 'Unknown',
        addedAt: new Date().toISOString()
    });

    await chrome.storage.local.set({ competitors: competitorsList });
    elements.competitorUrl.value = '';
    loadCompetitors();
    alert('Competitor added successfully!');
}

export async function loadCompetitors() {
    try {
        const competitors = await chrome.storage.local.get('competitors');
        const competitorsList = competitors.competitors || [];

        if (competitorsList.length > 0 && elements.competitorList) {
            elements.competitorList.innerHTML = competitorsList.map(comp => `
                    <div class="content-item">
                        <div class="content-item-header">
                            <span class="content-item-title">${comp.name}</span>
                            <button class="content-item-action" data-id="${comp.id}">Delete</button>
                        </div>
                        <small><a href="${comp.url}" target="_blank">${comp.url.substring(0, 50)}...</a></small>
                    </div>
                `).join('');

            // Add event listeners to delete buttons
            elements.competitorList.querySelectorAll('.content-item-action').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = parseInt(btn.dataset.id);
                    await deleteCompetitor(id);
                });
            });
        } else if (elements.competitorList) {
            elements.competitorList.innerHTML = '<p class="empty-state">No competitors tracked</p>';
        }
    } catch (error) {
        console.error('Error loading competitors:', error);
    }
}

async function deleteCompetitor(id) {
    const competitors = await chrome.storage.local.get('competitors');
    const competitorsList = competitors.competitors || [];
    const updated = competitorsList.filter(c => c.id !== id);
    await chrome.storage.local.set({ competitors: updated });
    loadCompetitors();
}

export async function checkPeopleSearchState() {
    try {
        const result = await chrome.storage.local.get('peopleSearchActive');
        const isActive = result.peopleSearchActive || false;

        console.log('POPUP: People search active state:', isActive);

        if (isActive) {
            // Show stop button, hide start button (both top and bottom)
            if (elements.startPeopleSearch) elements.startPeopleSearch.style.display = 'none';
            if (elements.stopPeopleSearch) elements.stopPeopleSearch.style.display = 'block';
            if (elements.startPeopleSearchBottom) elements.startPeopleSearchBottom.style.display = 'none';
            if (elements.stopPeopleSearchBottom) elements.stopPeopleSearchBottom.style.display = 'block';
            console.log('POPUP: Restored People Search stop button state');
        } else {
            // Show start button, hide stop button (both top and bottom)
            if (elements.startPeopleSearch) elements.startPeopleSearch.style.display = 'block';
            if (elements.stopPeopleSearch) elements.stopPeopleSearch.style.display = 'none';
            if (elements.startPeopleSearchBottom) elements.startPeopleSearchBottom.style.display = 'block';
            if (elements.stopPeopleSearchBottom) elements.stopPeopleSearchBottom.style.display = 'none';
        }
    } catch (error) {
        console.error('POPUP: Error checking People Search state:', error);
    }
}
