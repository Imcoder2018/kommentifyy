// --- PROCESSING HISTORY MANAGER --- //
// Tracks and displays all automation and networking processing sessions

let historyData = [];
let filteredHistory = [];

/**
 * Initialize processing history functionality
 */
export function initializeProcessingHistory() {
    console.log('📝 Initializing processing history...');
    
    try {
        // Set up event listeners
        setupHistoryEventListeners();
        
        // Load existing history
        loadProcessingHistory();
        
        // Also refresh periodically to catch new sessions
        setInterval(() => {
            loadProcessingHistory();
        }, 5000);
        
        console.log('✅ Processing history initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing processing history:', error);
        
        // Try to show basic message in UI
        const tbody = document.getElementById('history-table-body');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" style="padding: 20px; text-align: center; color: #dc3545;">
                        Error initializing processing history: ${error.message}
                    </td>
                </tr>
            `;
        }
    }
}

/**
 * Set up event listeners for history controls
 */
function setupHistoryEventListeners() {
    // Filter controls
    const typeFilter = document.getElementById('history-filter-type');
    const statusFilter = document.getElementById('history-filter-status');
    
    if (typeFilter) {
        typeFilter.addEventListener('change', updateHistoryDisplay);
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', updateHistoryDisplay);
    }
    
    // Action buttons
    const refreshBtn = document.getElementById('refresh-history');
    const exportBtn = document.getElementById('export-history');
    const clearBtn = document.getElementById('clear-history');
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            console.log('📝 DEBUG: Manual refresh button clicked');
            loadProcessingHistory();
        });
    }
    
    if (exportBtn) {
        exportBtn.addEventListener('click', exportHistoryCSV);
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', clearProcessingHistory);
    }
}

/**
 * Record a new processing session
 */
export async function recordProcessingSession(sessionData) {
    const session = {
        id: generateSessionId(),
        type: sessionData.type, // 'automation' | 'networking'
        query: sessionData.query || sessionData.keywords || 'Unknown',
        target: sessionData.target || 0,
        processed: sessionData.processed || 0,
        successful: sessionData.successful || 0,
        status: sessionData.status || 'completed', // 'completed' | 'stopped' | 'failed'
        startTime: sessionData.startTime || Date.now(),
        endTime: sessionData.endTime || Date.now(),
        duration: sessionData.duration || 0,
        actions: sessionData.actions || {},
        error: sessionData.error || null,
        details: sessionData.details || {}
    };
    
    // Calculate success rate
    session.successRate = session.processed > 0 ? Math.round((session.successful / session.processed) * 100) : 0;
    
    // Calculate duration if not provided
    if (session.duration === 0 && session.endTime > session.startTime) {
        session.duration = session.endTime - session.startTime;
    }
    
    console.log('📝 Recording processing session:', session);
    
    // Load existing history
    await loadProcessingHistory();
    
    // Add new session
    historyData.unshift(session); // Add to beginning
    
    // Limit to last 100 sessions to prevent storage bloat
    if (historyData.length > 100) {
        historyData = historyData.slice(0, 100);
    }
    
    // Save to storage
    await saveProcessingHistory();
    
    // Update UI
    updateHistoryDisplay();
}

/**
 * Load processing history from storage
 */
async function loadProcessingHistory() {
    try {
        console.log('📝 DEBUG: Starting to load processing history...');
        
        // Check if chrome.storage is available
        if (!chrome || !chrome.storage || !chrome.storage.local) {
            throw new Error('Chrome storage API not available');
        }
        
        const result = await chrome.storage.local.get('processingHistory');
        console.log('📝 DEBUG: Raw storage result:', result);
        
        historyData = result.processingHistory || [];
        
        console.log(`📝 DEBUG: Loaded ${historyData.length} processing sessions from storage`);
        if (historyData.length > 0) {
            console.log('📝 DEBUG: Latest session:', JSON.stringify(historyData[0], null, 2));
            console.log('📝 DEBUG: All sessions:', historyData.map(s => ({ id: s.id, type: s.type, status: s.status, processed: s.processed })));
        } else {
            console.log('📝 DEBUG: No processing history found in storage');
        }
        
        // Update display
        updateHistoryDisplay();
        
    } catch (error) {
        console.error('❌ Error loading processing history:', error);
        historyData = [];
        
        // Show error in UI
        const tbody = document.getElementById('history-table-body');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" style="padding: 20px; text-align: center; color: #dc3545;">
                        Error loading history: ${error.message}
                    </td>
                </tr>
            `;
        }
    }
}

/**
 * Save processing history to storage
 */
async function saveProcessingHistory() {
    try {
        await chrome.storage.local.set({ processingHistory: historyData });
        console.log(`📝 Saved ${historyData.length} processing sessions to storage`);
    } catch (error) {
        console.error('Error saving processing history:', error);
    }
}

/**
 * Apply filters to history data
 */
function applyFilters() {
    const typeFilter = document.getElementById('history-filter-type')?.value || 'all';
    const statusFilter = document.getElementById('history-filter-status')?.value || 'all';
    
    filteredHistory = historyData.filter(session => {
        const typeMatch = typeFilter === 'all' || session.type === typeFilter;
        const statusMatch = statusFilter === 'all' || session.status === statusFilter;
        return typeMatch && statusMatch;
    });
    
    // Don't call updateHistoryDisplay here - this was causing infinite recursion
}

/**
 * Update the history display with current data
 */
function updateHistoryDisplay() {
    // Apply current filters (without calling updateHistoryDisplay)
    applyFilters();
    
    // Update stats
    updateHistoryStats();
    
    // Update table
    updateHistoryTable();
}

/**
 * Update history statistics
 */
function updateHistoryStats() {
    const totalSessions = historyData.length;
    const automationSessions = historyData.filter(s => s.type === 'automation').length;
    const networkingSessions = historyData.filter(s => s.type === 'networking').length;
    const completedSessions = historyData.filter(s => s.status === 'completed').length;
    const successRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
    
    // Update UI elements
    updateElement('total-sessions-count', totalSessions);
    updateElement('automation-sessions', automationSessions);
    updateElement('networking-sessions', networkingSessions);
    updateElement('success-rate', `${successRate}%`);
}

/**
 * Update history table with filtered data
 */
function updateHistoryTable() {
    const tbody = document.getElementById('history-table-body');
    if (!tbody) return;
    
    if (filteredHistory.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="padding: 20px; text-align: center; color: #6c757d;">
                    No processing sessions match the current filters.
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filteredHistory.map(session => {
        const statusIcon = getStatusIcon(session.status);
        const typeIcon = session.type === 'automation' ? '🤖' : '👔';
        const duration = formatDuration(session.duration);
        const date = new Date(session.startTime).toLocaleDateString() + ' ' + 
                    new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        return `
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">
                    ${typeIcon} ${session.type.charAt(0).toUpperCase() + session.type.slice(1)}
                </td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; max-width: 150px; overflow: hidden; text-overflow: ellipsis;" title="${session.query}">
                    ${session.query}
                </td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">
                    ${session.target}
                </td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">
                    ${session.processed}
                </td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">
                    ${session.successRate !== undefined ? session.successRate + '%' : (session.processed > 0 ? Math.round((session.successful / session.processed) * 100) + '%' : '0%')}
                </td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">
                    ${duration}
                </td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">
                    ${statusIcon} ${session.status}
                </td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; font-size: 11px;">
                    ${date}
                </td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">
                    <button onclick="viewSessionDetails('${session.id}')" style="background: none; border: 1px solid #ddd; padding: 2px 6px; border-radius: 3px; font-size: 10px; cursor: pointer;" title="View Details">
                        👁️
                    </button>
                    <button onclick="deleteSession('${session.id}')" style="background: none; border: 1px solid #ddd; padding: 2px 6px; border-radius: 3px; font-size: 10px; cursor: pointer; margin-left: 2px;" title="Delete">
                        🗑️
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Export history as CSV
 */
function exportHistoryCSV() {
    if (historyData.length === 0) {
        alert('No processing history to export.');
        return;
    }
    
    const headers = ['Type', 'Query/Keywords', 'Target', 'Processed', 'Successful', 'Success Rate', 'Status', 'Duration', 'Start Time', 'End Time'];
    
    const csvContent = [
        headers.join(','),
        ...historyData.map(session => [
            session.type,
            `"${session.query.replace(/"/g, '""')}"`, // Escape quotes
            session.target,
            session.processed,
            session.successful,
            `${session.successRate}%`,
            session.status,
            formatDuration(session.duration),
            new Date(session.startTime).toISOString(),
            new Date(session.endTime).toISOString()
        ].join(','))
    ].join('\n');
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `processing_history_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('📥 Processing history exported as CSV');
}

/**
 * Clear all processing history
 */
async function clearProcessingHistory() {
    if (!confirm('Are you sure you want to clear all processing history? This action cannot be undone.')) {
        return;
    }
    
    historyData = [];
    filteredHistory = [];
    
    await saveProcessingHistory();
    updateHistoryDisplay();
    
    console.log('🗑️ Processing history cleared');
}

/**
 * Helper functions
 */
function generateSessionId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function getStatusIcon(status) {
    switch (status) {
        case 'completed': return '✅';
        case 'stopped': return '⏹️';
        case 'failed': return '❌';
        default: return '❓';
    }
}

function formatDuration(milliseconds) {
    if (!milliseconds || milliseconds < 1000) return '< 1s';
    
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    } else {
        return `${seconds}s`;
    }
}

function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

/**
 * Global functions for button actions (called from HTML)
 */
window.viewSessionDetails = function(sessionId) {
    console.log('👁️ View details clicked for session:', sessionId);
    
    // Try to find session in current data
    let session = historyData.find(s => s.id === sessionId);
    
    // If not found, try to reload from storage
    if (!session) {
        chrome.storage.local.get('processingHistory').then(result => {
            const allSessions = result.processingHistory || [];
            session = allSessions.find(s => s.id === sessionId);
            
            if (session) {
                showSessionDetails(session);
            } else {
                alert('Session not found.');
            }
        });
        return;
    }
    
    showSessionDetails(session);
};

function showSessionDetails(session) {
    const successRate = session.successRate !== undefined ? session.successRate : 
        (session.processed > 0 ? Math.round((session.successful / session.processed) * 100) : 0);
    
    const details = `Session Details:

Type: ${session.type?.charAt(0).toUpperCase() + session.type?.slice(1) || 'Unknown'}
Query/Keywords: ${session.query || 'N/A'}
Target: ${session.target || 0}
Processed: ${session.processed || 0}
Successful: ${session.successful || 0}
Success Rate: ${successRate}%
Status: ${session.status || 'Unknown'}
Duration: ${formatDuration(session.duration)}
Start Time: ${new Date(session.startTime).toLocaleString()}
End Time: ${new Date(session.endTime).toLocaleString()}

${session.actions ? 'Actions: ' + JSON.stringify(session.actions) : ''}
${session.error ? 'Error: ' + session.error : ''}`;

    alert(details);
}

window.deleteSession = function(sessionId) {
    if (!confirm('Are you sure you want to delete this session?')) {
        return;
    }
    
    const index = historyData.findIndex(s => s.id === sessionId);
    if (index !== -1) {
        historyData.splice(index, 1);
        saveProcessingHistory();
        updateHistoryDisplay();
        console.log('🗑️ Processing session deleted');
    }
};

/**
 * Manual test function to add sample data and test the system
 */
export async function testProcessingHistory() {
    console.log('🧪 Testing processing history system...');
    
    // Clear existing data
    await chrome.storage.local.set({ processingHistory: [] });
    console.log('🧹 Cleared existing history');
    
    // Add test sessions
    const testSessions = [
        {
            id: 'test-1-' + Date.now(),
            type: 'automation',
            query: 'test SEO keywords',
            target: 10,
            processed: 5,
            successful: 5,
            status: 'stopped',
            startTime: Date.now() - 120000,
            endTime: Date.now() - 90000,
            duration: 30000,
            successRate: 100
        },
        {
            id: 'test-2-' + Date.now(),
            type: 'networking',
            query: 'Marketing Manager',
            target: 15,
            processed: 12,
            successful: 10,
            status: 'completed',
            startTime: Date.now() - 300000,
            endTime: Date.now() - 180000,
            duration: 120000,
            successRate: 83
        }
    ];
    
    // Save test sessions
    await chrome.storage.local.set({ processingHistory: testSessions });
    console.log('📝 Added test sessions:', testSessions);
    
    // Reload and display
    await loadProcessingHistory();
    
    console.log('✅ Test completed. Check the Processing History section.');
}

/**
 * Function to force refresh the processing history UI
 */
export async function forceRefreshHistory() {
    console.log('🔄 Force refreshing processing history...');
    await loadProcessingHistory();
}

// Make test functions available globally for console debugging
if (typeof window !== 'undefined') {
    window.testProcessingHistory = testProcessingHistory;
    window.forceRefreshHistory = forceRefreshHistory;
    window.loadProcessingHistory = loadProcessingHistory;
}
