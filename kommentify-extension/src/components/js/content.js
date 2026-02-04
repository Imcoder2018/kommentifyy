import { elements } from './state.js';
import { loadKeywordAlerts, loadCompetitors } from './networking.js';
import { featureChecker } from '../../shared/utils/featureChecker.js';
import { loadPlans } from './auth.js';

// Re-export for UI usage
export { loadKeywordAlerts, loadCompetitors };

export async function loadSavedPosts() {
    try {
        const result = await chrome.storage.local.get('engagementStatistics');
        const stats = result.engagementStatistics || {};
        const saved = stats.savedPosts || [];

        if (elements.savedCount) elements.savedCount.textContent = saved.length;

        if (saved.length > 0 && elements.savedPostsList) {
            elements.savedPostsList.innerHTML = saved.slice(0, 10).map(post => `
                    <div class="content-item">
                        <div class="content-item-header">
                            <span class="content-item-title">${post.author || 'Unknown'}</span>
                        </div>
                        <p style="font-size: 11px; margin: 4px 0;">${post.content.substring(0, 100)}...</p>
                        <small>${new Date(post.savedAt).toLocaleDateString()}</small>
                    </div>
                `).join('');
        }
    } catch (error) {
        console.error('Error loading saved posts:', error);
    }
}

export async function schedulePost() {
    try {
        // CHECK FEATURE PERMISSION
        const canSchedule = await featureChecker.checkFeature('scheduling');
        if (!canSchedule) {
            console.warn('🚫 Post Scheduling feature access denied - not available in current plan');
            const statusDiv = elements.scheduleStatus;
            if (statusDiv) {
                statusDiv.style.display = 'block';
                statusDiv.style.backgroundColor = '#f8d7da';
                statusDiv.style.color = '#721c24';
                statusDiv.textContent = '⬆️ Post Scheduling requires a paid plan. Please upgrade!';
            }
            
            // Show plan modal for upgrade
            const planModal = document.getElementById('plan-modal');
            if (planModal) {
                planModal.style.display = 'flex';
                loadPlans();
            }
            return;
        }
        
        const content = elements.postContent?.value?.trim();
        const topic = elements.postTopic?.value?.trim();
        const scheduleDate = elements.scheduleDate?.value;
        const scheduleTime = elements.scheduleTime?.value;
        const statusDiv = elements.scheduleStatus;

        // Validation
        if (!content) {
            statusDiv.style.display = 'block';
            statusDiv.style.backgroundColor = '#f8d7da';
            statusDiv.style.color = '#721c24';
            statusDiv.textContent = '❌ Please generate or write post content first';
            return;
        }

        if (!scheduleDate || !scheduleTime) {
            statusDiv.style.display = 'block';
            statusDiv.style.backgroundColor = '#fff3cd';
            statusDiv.style.color = '#856404';
            statusDiv.textContent = '⚠️ Please select both date and time';
            return;
        }

        // Combine date and time
        const scheduledFor = new Date(`${scheduleDate}T${scheduleTime}`);
        const now = new Date();

        if (scheduledFor <= now) {
            statusDiv.style.display = 'block';
            statusDiv.style.backgroundColor = '#f8d7da';
            statusDiv.style.color = '#721c24';
            statusDiv.textContent = '❌ Scheduled time must be in the future';
            return;
        }

        const post = {
            id: Date.now().toString(),
            content,
            topic: topic || 'Untitled Post',
            scheduledFor: scheduledFor.toISOString(),
            createdAt: new Date().toISOString(),
            status: 'scheduled'
        };

        // Get existing posts
        const storage = await chrome.storage.local.get('scheduledPosts');
        const posts = storage.scheduledPosts || [];
        posts.push(post);

        // Save back to storage
        await chrome.storage.local.set({ scheduledPosts: posts });

        // Show success message
        statusDiv.style.display = 'block';
        statusDiv.style.backgroundColor = '#d4edda';
        statusDiv.style.color = '#155724';
        statusDiv.textContent = `✅ Post scheduled for ${scheduledFor.toLocaleString()}`;

        // Clear inputs
        elements.scheduleDate.value = '';
        elements.scheduleTime.value = '';

        // Refresh scheduled posts list
        loadScheduledPosts();

        // Hide success message after 3 seconds
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);

    } catch (error) {
        console.error('Error scheduling post:', error);
        const statusDiv = elements.scheduleStatus;
        statusDiv.style.display = 'block';
        statusDiv.style.backgroundColor = '#f8d7da';
        statusDiv.style.color = '#721c24';
        statusDiv.textContent = '❌ Failed to schedule post';
    }
}

export async function loadScheduledPosts() {
    try {
        console.log('📅 Displaying scheduled posts');

        // Fetch and render posts
        const storage = await chrome.storage.local.get('scheduledPosts');
        let posts = storage.scheduledPosts || [];
        const container = elements.upcomingPosts;

        if (!container) return;

        container.innerHTML = '';

        if (posts.length === 0) {
            container.innerHTML = '<div style="padding: 15px; text-align: center; color: #666; font-size: 13px;">No scheduled posts</div>';
            return;
        }

        // Sort by date (earliest first)
        posts.sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor));

        posts.forEach(post => {
            const scheduledDate = new Date(post.scheduledFor);
            const now = new Date();
            const isPast = scheduledDate < now;

            const item = document.createElement('div');
            item.className = 'content-item';
            item.style.cssText = `
                padding: 10px;
                border: 1px solid ${isPast ? '#ffc107' : '#e0e0e0'};
                border-left: 3px solid ${isPast ? '#ff9800' : '#693fe9'};
                border-radius: 6px;
                margin-bottom: 8px;
                background: ${isPast ? '#fffbf0' : 'white'};
                box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                transition: box-shadow 0.2s;
            `;
            
            item.onmouseenter = () => item.style.boxShadow = '0 2px 6px rgba(0,0,0,0.1)';
            item.onmouseleave = () => item.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';

            const contentPreview = post.content.length > 80
                ? post.content.substring(0, 80) + '...'
                : post.content;

            item.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                    <div style="flex: 1; min-width: 0; overflow: hidden;">
                        <div style="font-weight: 600; font-size: 12px; color: #693fe9; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            ${post.topic || 'Untitled Post'}
                        </div>
                        <div style="display: flex; align-items: center; gap: 4px; font-size: 10px; margin-bottom: 4px; flex-wrap: wrap;">
                            <span style="background: ${isPast ? '#ff9800' : '#693fe9'}; color: white; padding: 2px 6px; border-radius: 3px; font-weight: 500; white-space: nowrap;">
                                📅 ${scheduledDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                            <span style="background: ${isPast ? '#ff9800' : '#693fe9'}; color: white; padding: 2px 6px; border-radius: 3px; font-weight: 500; white-space: nowrap;">
                                🕐 ${scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            ${isPast ? '<span style="background: #dc3545; color: white; padding: 2px 6px; border-radius: 3px; font-weight: 600; font-size: 9px; white-space: nowrap;">⚠️ Past Due</span>' : ''}
                        </div>
                        <div style="font-size: 11px; color: #666; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            ${contentPreview}
                        </div>
                    </div>
                    <button class="action-button secondary" 
                            style="padding: 5px 8px; font-size: 10px; min-width: 55px; max-width: 55px; flex-shrink: 0; background: #dc3545; color: white; border: none; font-weight: 600; border-radius: 4px;" 
                            data-post-id="${post.id}">
                        🗑️
                    </button>
                </div>
            `;

            // Add delete event listener
            const deleteBtn = item.querySelector('button');
            deleteBtn.addEventListener('click', () => deleteScheduledPost(post.id));

            container.appendChild(item);
        });

    } catch (error) {
        console.error('Error displaying scheduled posts:', error);
    }
}

async function deleteScheduledPost(id) {
    try {
        const storage = await chrome.storage.local.get('scheduledPosts');
        let posts = storage.scheduledPosts || [];
        posts = posts.filter(p => p.id !== id);
        await chrome.storage.local.set({ scheduledPosts: posts });
        loadScheduledPosts(); // Refresh view

        // Show notification
        const statusDiv = elements.scheduleStatus;
        if (statusDiv) {
            statusDiv.style.display = 'block';
            statusDiv.style.backgroundColor = '#d4edda';
            statusDiv.style.color = '#155724';
            statusDiv.textContent = '🗑️ Post deleted successfully';
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 2000);
        }
    } catch (error) {
        console.error('Error deleting post:', error);
    }
}
