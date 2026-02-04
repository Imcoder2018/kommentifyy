/**
 * ADD THIS JAVASCRIPT TO popup.js
 * Handles Leads Database and People Search Scheduler
 */

// ========== ADD TO ELEMENTS OBJECT ==========

// Leads Database
leadsSearch: document.getElementById('leads-search'),
leadsFilterQuery: document.getElementById('leads-filter-query'),
refreshLeads: document.getElementById('refresh-leads'),
exportLeads: document.getElementById('export-leads'),
totalLeadsCount: document.getElementById('total-leads-count'),
leadsWithEmail: document.getElementById('leads-with-email'),
leadsWithPhone: document.getElementById('leads-with-phone'),
leadsConnected: document.getElementById('leads-connected'),
leadsTableBody: document.getElementById('leads-table-body'),

// People Search Scheduler
peopleSchedulerEnabled: document.getElementById('people-scheduler-enabled'),
peopleScheduleTimeInput: document.getElementById('people-schedule-time-input'),
peopleScheduleKeywordInput: document.getElementById('people-schedule-keyword-input'),
peopleScheduleQuotaInput: document.getElementById('people-schedule-quota-input'),
peopleScheduleBooleanInput: document.getElementById('people-schedule-boolean-input'),
peopleScheduleNetworkInput: document.getElementById('people-schedule-network-input'),
peopleScheduleNoteInput: document.getElementById('people-schedule-note-input'),
peopleScheduleExtractInput: document.getElementById('people-schedule-extract-input'),
peopleScheduleMessageInput: document.getElementById('people-schedule-message-input'),
addPeopleSchedule: document.getElementById('add-people-schedule'),
peopleScheduleList: document.getElementById('people-schedule-list'),
peopleNextExecutionTime: document.getElementById('people-next-execution-time'),
peopleCountdownTimer: document.getElementById('people-countdown-timer'),

// Bulk Scheduler Additional Elements
scheduleKeywordsInput: document.getElementById('schedule-keywords-input'),
scheduleQuotaInput: document.getElementById('schedule-quota-input'),
scheduleMinLikesInput: document.getElementById('schedule-min-likes-input'),
scheduleMinCommentsInput: document.getElementById('schedule-min-comments-input'),
scheduleLikeInput: document.getElementById('schedule-like-input'),
scheduleCommentInput: document.getElementById('schedule-comment-input'),
scheduleShareInput: document.getElementById('schedule-share-input'),
scheduleFollowInput: document.getElementById('schedule-follow-input'),


// ========== LEADS DATABASE FUNCTIONS ==========

/**
 * Load all leads from storage
 */
async function loadLeads() {
    try {
        const response = await chrome.runtime.sendMessage({ action: 'getLeads' });
        
        if (response.success) {
            const leads = response.leads || [];
            const queries = response.queries || [];
            
            // Update statistics
            const withEmail = leads.filter(l => l.email).length;
            const withPhone = leads.filter(l => l.phone).length;
            const connected = leads.filter(l => l.connectionStatus === 'pending' || l.connectionStatus === 'connected').length;
            
            elements.totalLeadsCount.textContent = leads.length;
            elements.leadsWithEmail.textContent = withEmail;
            elements.leadsWithPhone.textContent = withPhone;
            elements.leadsConnected.textContent = connected;
            
            // Update query filter dropdown
            elements.leadsFilterQuery.innerHTML = '<option value="all">All Search Queries</option>';
            queries.forEach(query => {
                const option = document.createElement('option');
                option.value = query;
                option.textContent = query;
                elements.leadsFilterQuery.appendChild(option);
            });
            
            // Render table
            renderLeadsTable(leads);
        }
    } catch (error) {
        console.error('Failed to load leads:', error);
    }
}

/**
 * Render leads table
 * @param {Array} leads - Array of lead objects
 */
function renderLeadsTable(leads) {
    if (!elements.leadsTableBody) return;
    
    if (leads.length === 0) {
        elements.leadsTableBody.innerHTML = `
            <tr>
                <td colspan="8" style="padding: 20px; text-align: center; color: #6c757d;">
                    No leads found. Start a People Search to collect leads.
                </td>
            </tr>
        `;
        return;
    }
    
    elements.leadsTableBody.innerHTML = leads.map(lead => {
        const date = new Date(lead.collectedAt).toLocaleDateString();
        const statusIcon = {
            'connected': '✅',
            'pending': '⏳',
            'not_connected': '➖'
        }[lead.connectionStatus] || '❓';
        
        return `
            <tr style="border-bottom: 1px solid #e0e0e0;">
                <td style="padding: 8px;">
                    <a href="${lead.profileUrl}" target="_blank" style="color: #0073b1; text-decoration: none;">
                        ${lead.name}
                    </a>
                </td>
                <td style="padding: 8px; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${lead.headline}">
                    ${lead.headline}
                </td>
                <td style="padding: 8px;">${lead.location || '-'}</td>
                <td style="padding: 8px;">${lead.email || '-'}</td>
                <td style="padding: 8px;">${lead.phone || '-'}</td>
                <td style="padding: 8px;">${lead.searchQuery}</td>
                <td style="padding: 8px;">${date}</td>
                <td style="padding: 8px; text-align: center;">
                    <span title="${lead.connectionStatus}">${statusIcon}</span>
                    <button class="delete-lead-btn" data-url="${lead.profileUrl}" style="margin-left: 5px; padding: 2px 6px; font-size: 11px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer;">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-lead-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            if (confirm('Delete this lead?')) {
                const url = e.target.dataset.url;
                await chrome.runtime.sendMessage({ action: 'deleteLead', profileUrl: url });
                await loadLeads();
            }
        });
    });
}

/**
 * Export leads to CSV
 */
async function exportLeadsCSV() {
    try {
        const response = await chrome.runtime.sendMessage({ action: 'getLeads' });
        
        if (response.success) {
            const leads = response.leads || [];
            
            // Create CSV content
            const headers = ['Name', 'Headline', 'Location', 'Email', 'Phone', 'Search Query', 'Status', 'Collected Date', 'Connected Date', 'Profile URL'];
            const csvContent = [
                headers.join(','),
                ...leads.map(lead => [
                    `"${lead.name}"`,
                    `"${lead.headline}"`,
                    `"${lead.location || ''}"`,
                    `"${lead.email || ''}"`,
                    `"${lead.phone || ''}"`,
                    `"${lead.searchQuery}"`,
                    `"${lead.connectionStatus}"`,
                    `"${new Date(lead.collectedAt).toISOString()}"`,
                    `"${lead.connectedAt ? new Date(lead.connectedAt).toISOString() : ''}"`,
                    `"${lead.profileUrl}"`
                ].join(','))
            ].join('\n');
            
            // Download CSV
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `linkedin-leads-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    } catch (error) {
        console.error('Failed to export leads:', error);
        alert('Failed to export leads');
    }
}

/**
 * Search leads
 */
async function searchLeads() {
    const searchTerm = elements.leadsSearch.value.toLowerCase();
    const filterQuery = elements.leadsFilterQuery.value;
    
    try {
        const response = await chrome.runtime.sendMessage({
            action: 'getLeads',
            search: searchTerm,
            query: filterQuery
        });
        
        if (response.success) {
            renderLeadsTable(response.leads || []);
        }
    } catch (error) {
        console.error('Failed to search leads:', error);
    }
}


// ========== PEOPLE SEARCH SCHEDULER FUNCTIONS ==========

/**
 * Load people search scheduler status
 */
async function loadPeopleSchedulerStatus() {
    try {
        const response = await chrome.runtime.sendMessage({ 
            action: 'getPeopleSchedulerStatus' 
        });
        
        if (response.success) {
            const status = response.status;
            
            // Update toggle
            if (elements.peopleSchedulerEnabled) {
                elements.peopleSchedulerEnabled.checked = status.enabled;
            }
            
            // Render schedule list
            renderPeopleSchedules(status.schedules);
            
            // Update next execution
            if (status.nextExecution) {
                const date = new Date(status.nextExecution.date);
                elements.peopleNextExecutionTime.textContent = `${status.nextExecution.time} - ${status.nextExecution.keyword}`;
                startPeopleCountdownTimer();
            } else {
                elements.peopleNextExecutionTime.textContent = 'Not scheduled';
                elements.peopleCountdownTimer.textContent = '--:--:--';
            }
        }
    } catch (error) {
        console.error('Failed to load people scheduler status:', error);
    }
}

/**
 * Render people search schedules
 * @param {Array} schedules - Array of schedule objects
 */
function renderPeopleSchedules(schedules) {
    if (!elements.peopleScheduleList) return;
    
    if (schedules.length === 0) {
        elements.peopleScheduleList.innerHTML = '<small style="color: #6c757d;">No schedules set. Add schedules above.</small>';
        return;
    }
    
    elements.peopleScheduleList.innerHTML = schedules.map((sched, index) => `
        <div style="background: #fff; padding: 8px; border: 1px solid #dee2e6; border-radius: 4px; margin-bottom: 5px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                <strong style="font-size: 13px;">⏰ ${sched.time}</strong>
                <button class="remove-people-schedule-btn action-button secondary" data-index="${index}" style="padding: 3px 8px; font-size: 11px;">🗑️ Remove</button>
            </div>
            <div style="font-size: 11px; color: #6c757d;">
                <div><strong>Keyword:</strong> ${sched.keyword}</div>
                <div><strong>Quota:</strong> ${sched.quota} | ${sched.useBooleanLogic ? '✓' : '✗'} Boolean | ${sched.filterNetwork ? '✓' : '✗'} Network Filter | ${sched.extractContactInfo ? '✓' : '✗'} Email/Phone</div>
                ${sched.connectionMessage ? `<div><strong>Message:</strong> ${sched.connectionMessage.substring(0, 50)}...</div>` : ''}
            </div>
        </div>
    `).join('');
    
    // Add event listeners
    document.querySelectorAll('.remove-people-schedule-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const index = parseInt(btn.dataset.index);
            await removePeopleSchedule(index);
        });
    });
}

/**
 * Add people search schedule
 */
async function addPeopleSchedule() {
    const time = elements.peopleScheduleTimeInput.value;
    const keyword = elements.peopleScheduleKeywordInput.value.trim();
    const quota = parseInt(elements.peopleScheduleQuotaInput.value) || 10;
    
    if (!time || !keyword) {
        alert('Please enter both time and keyword');
        return;
    }
    
    const schedule = {
        time,
        keyword,
        quota,
        useBooleanLogic: elements.peopleScheduleBooleanInput.checked,
        filterNetwork: elements.peopleScheduleNetworkInput.checked,
        sendWithNote: elements.peopleScheduleNoteInput.checked,
        extractContactInfo: elements.peopleScheduleExtractInput.checked,
        connectionMessage: elements.peopleScheduleMessageInput.value.trim()
    };
    
    try {
        const response = await chrome.runtime.sendMessage({
            action: 'addPeopleSchedule',
            schedule
        });
        
        if (response.success) {
            // Clear form
            elements.peopleScheduleTimeInput.value = '';
            elements.peopleScheduleKeywordInput.value = '';
            elements.peopleScheduleMessageInput.value = '';
            
            await loadPeopleSchedulerStatus();
            alert(`Schedule added for ${time}`);
        } else {
            alert('Failed to add schedule: ' + (response.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Failed to add people schedule:', error);
        alert('Failed to add schedule');
    }
}

/**
 * Remove people search schedule
 * @param {number} index - Schedule index
 */
async function removePeopleSchedule(index) {
    if (!confirm('Remove this schedule?')) return;
    
    try {
        const response = await chrome.runtime.sendMessage({
            action: 'removePeopleSchedule',
            index
        });
        
        if (response.success) {
            await loadPeopleSchedulerStatus();
        }
    } catch (error) {
        console.error('Failed to remove schedule:', error);
    }
}

/**
 * Toggle people search scheduler
 */
async function togglePeopleScheduler() {
    const enabled = elements.peopleSchedulerEnabled.checked;
    
    try {
        const response = await chrome.runtime.sendMessage({
            action: 'setPeopleSchedulerEnabled',
            enabled
        });
        
        if (response.success) {
            await loadPeopleSchedulerStatus();
            
            if (enabled) {
                alert('✅ People Search scheduler enabled!');
            } else {
                alert('⏸️ People Search scheduler disabled');
            }
        }
    } catch (error) {
        console.error('Failed to toggle scheduler:', error);
        elements.peopleSchedulerEnabled.checked = !enabled;
    }
}

/**
 * Start people countdown timer
 */
function startPeopleCountdownTimer() {
    if (window.peopleCountdownInterval) {
        clearInterval(window.peopleCountdownInterval);
    }
    
    window.peopleCountdownInterval = setInterval(async () => {
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'getPeopleSchedulerCountdown'
            });
            
            if (response.success && elements.peopleCountdownTimer) {
                elements.peopleCountdownTimer.textContent = response.countdown;
            }
        } catch (error) {
            // Ignore
        }
    }, 1000);
}


// ========== EVENT LISTENERS (Add to setupEventListeners) ==========

// Leads Database
elements.refreshLeads?.addEventListener('click', loadLeads);
elements.exportLeads?.addEventListener('click', exportLeadsCSV);
elements.leadsSearch?.addEventListener('input', searchLeads);
elements.leadsFilterQuery?.addEventListener('change', searchLeads);

// People Search Scheduler
elements.peopleSchedulerEnabled?.addEventListener('change', togglePeopleScheduler);
elements.addPeopleSchedule?.addEventListener('click', addPeopleSchedule);

// ========== TAB ACTIVATION (Add to tab click handler) ==========

// Load leads when Analytics tab is opened
if (newActiveTab === 'analytics') {
    loadAnalytics();
    loadLeads(); // Add this
}

// Load scheduler status when Networking tab is opened
if (newActiveTab === 'networking') {
    loadPeopleSchedulerStatus(); // Add this
}

// Load scheduler status when Automation tab is opened
if (newActiveTab === 'automation') {
    loadSchedulerStatus(); // Already have this for bulk scheduler
}
