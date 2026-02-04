import { elements } from './state.js';

// --- COMPETITOR TRACKING FUNCTIONS --- //
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

export async function deleteCompetitor(id) {
    const competitors = await chrome.storage.local.get('competitors');
    const competitorsList = competitors.competitors || [];
    const updated = competitorsList.filter(c => c.id !== id);
    await chrome.storage.local.set({ competitors: updated });
    loadCompetitors();
}
