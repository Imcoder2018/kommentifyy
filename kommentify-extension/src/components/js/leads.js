import { state, elements } from './state.js';
import { featureChecker } from '../../shared/utils/featureChecker.js';
import { loadPlans } from './auth.js';
import { API_CONFIG } from './utils.js';

// ========== LEADS DATABASE FUNCTIONS ==========

/**
 * Load and display leads from storage
 */
export async function loadLeads() {
    try {
        console.log('📊 LOAD LEADS: Starting to load leads from storage...');
        const result = await chrome.storage.local.get(['leads', 'leadsByQuery']);

        console.log('📊 LOAD LEADS: Raw storage result:', result);

        // Handle multiple data formats: array, object, or JSON string
        let leads = result.leads || [];

        console.log('📊 LOAD LEADS: Initial leads value:', leads);
        console.log('📊 LOAD LEADS: Type of leads:', typeof leads);
        console.log('📊 LOAD LEADS: Is array?', Array.isArray(leads));

        // If leads is a string (old JSON format), parse it
        if (typeof leads === 'string') {
            console.log('📊 LOAD LEADS: Leads is a string, parsing JSON...');
            try {
                leads = JSON.parse(leads);
                console.log('📊 LOAD LEADS: Successfully parsed JSON string');
            } catch (e) {
                console.error('❌ LOAD LEADS: Failed to parse JSON string:', e);
                leads = [];
            }
        }

        // If leads is an object with a 'data' property (from storage wrapper), extract it
        if (leads && typeof leads === 'object' && !Array.isArray(leads)) {
            console.log('📊 LOAD LEADS: Leads is an object, checking for data property...');
            if (leads.data && Array.isArray(leads.data)) {
                console.log('📊 LOAD LEADS: Found data array, extracting...');
                leads = leads.data;
            } else {
                console.warn('⚠️ LOAD LEADS: Leads is an object, not an array. Converting to empty array.');
                console.warn('⚠️ LOAD LEADS: Object keys:', Object.keys(leads));
                leads = [];
            }
        }

        // Final safety check - ensure leads is always an array
        if (!Array.isArray(leads)) {
            console.error('❌ LOAD LEADS: Leads is still not an array after conversion! Type:', typeof leads);
            console.error('❌ LOAD LEADS: Value:', leads);
            leads = [];
        }

        let leadsByQuery = result.leadsByQuery || {};

        // Ensure leadsByQuery is an object
        if (typeof leadsByQuery !== 'object' || Array.isArray(leadsByQuery)) {
            // Silent auto-fix: reset to empty object (this is expected on first run)
            leadsByQuery = {};
        }

        console.log(`📊 LOAD LEADS: Found ${leads.length} total leads in storage`);
        console.log('📊 LOAD LEADS: Leads data:', leads);
        console.log('📊 LOAD LEADS: Leads by query:', leadsByQuery);

        // Update statistics - with safety checks
        const totalLeads = leads.length;
        const withEmail = Array.isArray(leads) ? leads.filter(lead => lead && lead.email).length : 0;
        const withPhone = Array.isArray(leads) ? leads.filter(lead => lead && lead.phone).length : 0;
        const connected = Array.isArray(leads) ? leads.filter(lead => lead && (lead.connectionStatus === 'connected' || lead.connectionStatus === 'pending')).length : 0;

        // Update UI elements
        console.log('📊 LOAD LEADS: Updating statistics display...');
        const totalLeadsEl = document.getElementById('total-leads-count');
        if (totalLeadsEl) totalLeadsEl.textContent = totalLeads;

        const leadsWithEmailEl = document.getElementById('leads-with-email');
        if (leadsWithEmailEl) leadsWithEmailEl.textContent = withEmail;

        const leadsWithPhoneEl = document.getElementById('leads-with-phone');
        if (leadsWithPhoneEl) leadsWithPhoneEl.textContent = withPhone;

        const leadsConnectedEl = document.getElementById('leads-connected');
        if (leadsConnectedEl) leadsConnectedEl.textContent = connected;
        console.log(`📊 LOAD LEADS: Stats updated - Total: ${totalLeads}, Email: ${withEmail}, Phone: ${withPhone}, Connected: ${connected}`);

        // Populate query filter dropdown
        const queryFilter = document.getElementById('leads-filter-query');
        if (queryFilter) {
            queryFilter.innerHTML = '<option value="all">All Search Queries</option>';
            Object.keys(leadsByQuery).forEach(query => {
                const count = leadsByQuery[query].length;
                queryFilter.innerHTML += `<option value="${query}">${query} (${count})</option>`;
            });
        }

        // Display leads in table
        console.log('📊 LOAD LEADS: Displaying leads in table...');
        displayLeads(leads);
        console.log('✅ LOAD LEADS: Leads loaded successfully!');

    } catch (error) {
        console.error('❌ LOAD LEADS: Error loading leads:', error);
    }
}

/**
 * Display leads in the table
 */
function displayLeads(leads) {
    console.log(`📋 DISPLAY LEADS: Displaying ${leads.length} leads in table...`);
    const tableBody = document.getElementById('leads-table-body');

    if (!tableBody) {
        console.error('❌ DISPLAY LEADS: Table body element not found!');
        return;
    }

    if (leads.length === 0) {
        console.log('📋 DISPLAY LEADS: No leads to display');
        tableBody.innerHTML = '<tr><td colspan="8" style="padding: 20px; text-align: center; color: #6c757d;">No leads found. Start a People Search to collect leads.</td></tr>';
        return;
    }

    // Check current visibility state of contact columns
    const showContactInfo = document.getElementById('show-contact-info')?.checked || false;
    const contactDisplay = showContactInfo ? 'table-cell' : 'none';
    
    console.log('📋 DISPLAY LEADS: Rendering table rows...');

    tableBody.innerHTML = leads.map(lead => `
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">
                <strong>${lead.name || 'Unknown'}</strong>
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #dee2e6; max-width: 200px; overflow: hidden; text-overflow: ellipsis;">
                ${lead.headline || 'N/A'}
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">
                ${lead.location || 'N/A'}
            </td>
            <td class="contact-column" style="padding: 8px; border-bottom: 1px solid #dee2e6; display: ${contactDisplay};">
                ${lead.email ? `<a href="mailto:${lead.email}" style="color: #0066cc;">${lead.email}</a>` : 'N/A'}
            </td>
            <td class="contact-column" style="padding: 8px; border-bottom: 1px solid #dee2e6; display: ${contactDisplay};">
                ${lead.phone ? `<a href="tel:${lead.phone}" style="color: #0066cc;">${lead.phone}</a>` : 'N/A'}
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">
                <span style="background: #e3f2fd; padding: 2px 6px; border-radius: 3px; font-size: 11px;">
                    ${lead.searchQuery || 'Unknown'}
                </span>
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-size: 11px;">
                ${lead.collectedAt ? new Date(lead.collectedAt).toLocaleDateString() : 'N/A'}
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #dee2e6; text-align: center;">
                <a href="${lead.profileUrl}" target="_blank" style="color: #0066cc; text-decoration: none; font-size: 12px;">
                    🔗 View
                </a>
            </td>
        </tr>
    `).join('');
}

/**
 * Filter leads based on search and query filter
 */
export async function filterLeads() {
    try {
        const result = await chrome.storage.local.get(['leads', 'leadsByQuery']);
        let leads = result.leads || [];

        // Handle string format
        if (typeof leads === 'string') {
            try {
                leads = JSON.parse(leads);
            } catch (e) {
                leads = [];
            }
        }

        // Handle object format
        if (leads && typeof leads === 'object' && !Array.isArray(leads)) {
            if (leads.data && Array.isArray(leads.data)) {
                leads = leads.data;
            } else {
                leads = [];
            }
        }

        // Final check
        if (!Array.isArray(leads)) {
            leads = [];
        }

        // Get filter values
        const searchTerm = document.getElementById('leads-search')?.value?.toLowerCase() || '';
        const queryFilter = document.getElementById('leads-filter-query')?.value || 'all';

        // Apply query filter
        if (queryFilter !== 'all') {
            leads = leads.filter(lead => lead.searchQuery === queryFilter);
        }

        // Apply search filter
        if (searchTerm) {
            leads = leads.filter(lead =>
                (lead.name || '').toLowerCase().includes(searchTerm) ||
                (lead.headline || '').toLowerCase().includes(searchTerm) ||
                (lead.location || '').toLowerCase().includes(searchTerm) ||
                (lead.email || '').toLowerCase().includes(searchTerm)
            );
        }

        displayLeads(leads);

    } catch (error) {
        console.error('POPUP: Error filtering leads:', error);
    }
}

/**
 * Export leads to CSV
 */
export async function exportLeadsToCSV() {
    try {
        // CHECK FEATURE PERMISSION
        const canExport = await featureChecker.checkFeature('analytics');
        if (!canExport) {
            console.warn('🚫 CSV Export feature access denied - not available in current plan');
            alert('⬆️ CSV Export requires a paid plan. Please upgrade to export leads data!');
            
            // Show plan modal for upgrade
            const planModal = document.getElementById('plan-modal');
            if (planModal) {
                planModal.style.display = 'flex';
                loadPlans();
            }
            return;
        }
        
        const result = await chrome.storage.local.get('leads');
        let leads = result.leads || [];

        // Handle string format
        if (typeof leads === 'string') {
            try {
                leads = JSON.parse(leads);
            } catch (e) {
                leads = [];
            }
        }

        // Handle object format
        if (leads && typeof leads === 'object' && !Array.isArray(leads)) {
            if (leads.data && Array.isArray(leads.data)) {
                leads = leads.data;
            } else {
                leads = [];
            }
        }

        // Final check
        if (!Array.isArray(leads)) {
            leads = [];
        }

        if (leads.length === 0) {
            alert('No leads to export');
            return;
        }

        // Create CSV content
        const headers = ['Name', 'Headline', 'Location', 'Email', 'Phone', 'Search Query', 'Date Collected', 'Profile URL'];
        const csvContent = [
            headers.join(','),
            ...leads.map(lead => [
                `"${(lead.name || '').replace(/"/g, '""')}"`,
                `"${(lead.headline || '').replace(/"/g, '""')}"`,
                `"${(lead.location || '').replace(/"/g, '""')}"`,
                lead.email || '',
                lead.phone || '',
                `"${(lead.searchQuery || '').replace(/"/g, '""')}"`,
                lead.collectedAt ? new Date(lead.collectedAt).toLocaleDateString() : '',
                lead.profileUrl || ''
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

        console.log('POPUP: Exported', leads.length, 'leads to CSV');

    } catch (error) {
        console.error('POPUP: Error exporting leads:', error);
        alert('Error exporting leads: ' + error.message);
    }
}

/**
 * Toggle visibility of email and phone columns
 */
export function toggleContactColumns() {
    const checkbox = document.getElementById('show-contact-info');
    const contactColumns = document.querySelectorAll('.contact-column');
    const isChecked = checkbox?.checked || false;
    
    contactColumns.forEach(column => {
        column.style.display = isChecked ? 'table-cell' : 'none';
    });
    
    console.log('📊 LEADS: Contact columns visibility:', isChecked ? 'shown' : 'hidden');
}

/**
 * Clear all leads from storage
 */
export async function clearAllLeads() {
    if (!confirm('Are you sure you want to clear ALL leads data? This action cannot be undone.')) {
        return;
    }
    
    try {
        await chrome.storage.local.remove(['leads', 'leadsByQuery']);
        
        // Reload the leads display
        await loadLeads();
        
        console.log('🗑️ LEADS: All leads cleared');
        alert('✅ All leads data has been cleared.');
        
    } catch (error) {
        console.error('❌ LEADS: Error clearing leads:', error);
        alert('Error clearing leads: ' + error.message);
    }
}
