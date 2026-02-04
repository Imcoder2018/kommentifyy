/**
 * INSPIRATION SOURCES MODULE
 * Handles profile scraping, vector storage, and RAG-based content generation
 */

import { API_CONFIG, showNotification } from './utils.js';

// State for inspiration sources
let inspirationSources = [];
let selectedSourceUrls = [];
let useInspirationContext = true;

// Initialize inspiration sources functionality
export function initializeInspirationSources() {
    console.log('🎨 Initializing inspiration sources...');
    
    // Toggle panel button
    const toggleBtn = document.getElementById('toggle-inspiration-panel');
    const panel = document.getElementById('inspiration-panel');
    
    if (toggleBtn && panel) {
        toggleBtn.addEventListener('click', () => {
            const isHidden = panel.style.display === 'none';
            panel.style.display = isHidden ? 'block' : 'none';
            toggleBtn.innerHTML = isHidden 
                ? '<span class="icon icon-chevron-up"></span> Collapse' 
                : '<span class="icon icon-chevron-down"></span> Expand';
        });
    }
    
    // Add inspiration source button
    const addSourceBtn = document.getElementById('add-inspiration-source');
    if (addSourceBtn) {
        addSourceBtn.addEventListener('click', handleAddInspirationSource);
    }
    
    // Refresh sources button
    const refreshBtn = document.getElementById('refresh-sources');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadInspirationSources);
    }
    
    // Use context toggle
    const contextToggle = document.getElementById('use-inspiration-context');
    if (contextToggle) {
        contextToggle.addEventListener('change', (e) => {
            useInspirationContext = e.target.checked;
            const selectorContainer = document.getElementById('source-selector-container');
            if (selectorContainer) {
                selectorContainer.style.display = useInspirationContext ? 'block' : 'none';
            }
            console.log('Use inspiration context:', useInspirationContext);
        });
    }
    
    // Use all sources checkbox
    const useAllCheckbox = document.getElementById('use-all-sources');
    if (useAllCheckbox) {
        useAllCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                selectedSourceUrls = inspirationSources.map(s => s.profileUrl);
            } else {
                selectedSourceUrls = [];
            }
            updateSourceCheckboxes();
        });
    }
    
    // Load existing sources
    loadInspirationSources();
}

// Load inspiration sources from backend
async function loadInspirationSources() {
    try {
        const { authToken, apiBaseUrl } = await chrome.storage.local.get(['authToken', 'apiBaseUrl']);
        const apiUrl = apiBaseUrl || API_CONFIG.BASE_URL;
        
        const response = await fetch(`${apiUrl}/api/vector/ingest`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success && data.sources) {
            inspirationSources = data.sources;
            selectedSourceUrls = inspirationSources.map(s => s.profileUrl);
            renderSourcesList();
            updateSourceCheckboxes();
            console.log(`📚 Loaded ${inspirationSources.length} inspiration sources`);
        }
    } catch (error) {
        console.error('Failed to load inspiration sources:', error);
    }
}

// Render the sources list
function renderSourcesList() {
    const listContainer = document.getElementById('inspiration-sources-list');
    if (!listContainer) return;
    
    if (inspirationSources.length === 0) {
        listContainer.innerHTML = `
            <p style="text-align: center; color: #999; font-size: 13px; padding: 20px;">
                No sources added yet. Add a LinkedIn profile above to get started!
            </p>
        `;
        return;
    }
    
    listContainer.innerHTML = inspirationSources.map(source => `
        <div class="source-item">
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 18px;">👤</span>
                <div>
                    <div style="font-weight: 600; color: #333; font-size: 13px;">${source.name}</div>
                    <div style="font-size: 11px; color: #666;">${source.postCount} posts saved</div>
                </div>
            </div>
            <button class="delete-source-btn" data-url="${source.profileUrl}" 
                    style="background: none; border: none; color: #dc3545; cursor: pointer; font-size: 14px;">
                🗑️
            </button>
        </div>
    `).join('');
    
    // Add delete handlers
    listContainer.querySelectorAll('.delete-source-btn').forEach(btn => {
        btn.addEventListener('click', () => handleDeleteSource(btn.dataset.url));
    });
}

// Update source checkboxes
function updateSourceCheckboxes() {
    const container = document.getElementById('source-checkboxes');
    if (!container) return;
    
    const useAllChecked = selectedSourceUrls.length === inspirationSources.length;
    
    let html = `
        <label class="source-checkbox ${useAllChecked ? 'selected' : ''}">
            <input type="checkbox" id="use-all-sources" ${useAllChecked ? 'checked' : ''}>
            <span>Use All Sources</span>
        </label>
    `;
    
    inspirationSources.forEach(source => {
        const isSelected = selectedSourceUrls.includes(source.profileUrl);
        html += `
            <label class="source-checkbox ${isSelected ? 'selected' : ''}" data-url="${source.profileUrl}">
                <input type="checkbox" ${isSelected ? 'checked' : ''}>
                <span>${source.name}</span>
            </label>
        `;
    });
    
    container.innerHTML = html;
    
    // Re-attach event listeners
    const useAllCheckbox = document.getElementById('use-all-sources');
    if (useAllCheckbox) {
        useAllCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                selectedSourceUrls = inspirationSources.map(s => s.profileUrl);
            } else {
                selectedSourceUrls = [];
            }
            updateSourceCheckboxes();
        });
    }
    
    container.querySelectorAll('.source-checkbox[data-url]').forEach(label => {
        const checkbox = label.querySelector('input');
        checkbox.addEventListener('change', (e) => {
            const url = label.dataset.url;
            if (e.target.checked) {
                if (!selectedSourceUrls.includes(url)) {
                    selectedSourceUrls.push(url);
                }
            } else {
                selectedSourceUrls = selectedSourceUrls.filter(u => u !== url);
            }
            updateSourceCheckboxes();
        });
    });
}

// Handle adding a new inspiration source
async function handleAddInspirationSource() {
    const urlInput = document.getElementById('inspiration-profile-url');
    const countSelect = document.getElementById('scrape-post-count');
    const statusDiv = document.getElementById('scrape-status');
    const addBtn = document.getElementById('add-inspiration-source');
    
    const profileUrl = urlInput?.value?.trim();
    const postCount = parseInt(countSelect?.value || '10');
    
    if (!profileUrl) {
        showStatus('Please enter a LinkedIn profile URL', 'error');
        return;
    }
    
    // Validate LinkedIn URL
    if (!profileUrl.includes('linkedin.com/in/')) {
        showStatus('Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/username)', 'error');
        return;
    }
    
    // Disable button and show loading
    if (addBtn) {
        addBtn.disabled = true;
        addBtn.innerHTML = '<span class="icon icon-loader"></span> Scraping posts...';
    }
    showStatus('Opening profile and scraping posts...', 'info');
    
    try {
        // Send message to background script to handle scraping
        const response = await chrome.runtime.sendMessage({
            action: 'scrapeProfilePosts',
            profileUrl,
            postCount
        });
        
        if (response.success) {
            showStatus(`✅ Successfully scraped ${response.posts.length} posts!`, 'success');
            
            // Now send to backend for vector storage
            showStatus('Saving to your inspiration library...', 'info');
            
            const { authToken, apiBaseUrl } = await chrome.storage.local.get(['authToken', 'apiBaseUrl']);
            const apiUrl = apiBaseUrl || API_CONFIG.BASE_URL;
            
            const ingestResponse = await fetch(`${apiUrl}/api/vector/ingest`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    posts: response.posts,
                    inspirationSource: {
                        name: response.authorName || 'Unknown Author',
                        profileUrl: profileUrl
                    }
                })
            });
            
            const ingestData = await ingestResponse.json();
            
            if (ingestData.success) {
                showStatus(`✅ Added ${ingestData.count} posts from ${response.authorName}!`, 'success');
                urlInput.value = '';
                loadInspirationSources();
            } else {
                throw new Error(ingestData.error || 'Failed to save posts');
            }
        } else {
            throw new Error(response.error || 'Failed to scrape posts');
        }
    } catch (error) {
        console.error('Add inspiration source error:', error);
        showStatus(`❌ ${error.message}`, 'error');
    } finally {
        if (addBtn) {
            addBtn.disabled = false;
            addBtn.innerHTML = '<span class="icon icon-plus"></span> Scrape & Add Profile';
        }
    }
}

// Handle deleting a source
async function handleDeleteSource(profileUrl) {
    // For now, just remove from local state
    // In production, you'd want to delete from the vector DB as well
    inspirationSources = inspirationSources.filter(s => s.profileUrl !== profileUrl);
    selectedSourceUrls = selectedSourceUrls.filter(u => u !== profileUrl);
    renderSourcesList();
    updateSourceCheckboxes();
    showNotification('Source removed', 'success');
}

// Show status message
function showStatus(message, type = 'info') {
    const statusDiv = document.getElementById('scrape-status');
    if (!statusDiv) return;
    
    statusDiv.style.display = 'block';
    statusDiv.style.color = type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#666';
    statusDiv.textContent = message;
    
    if (type === 'success') {
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);
    }
}

// Get current inspiration settings for post generation
export function getInspirationSettings() {
    return {
        useInspirationContext,
        selectedSources: selectedSourceUrls,
        topK: 3
    };
}

// Export for use in post writer
export { useInspirationContext, selectedSourceUrls };
