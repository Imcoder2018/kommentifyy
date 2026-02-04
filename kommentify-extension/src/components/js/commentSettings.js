/**
 * AI Comment Settings Management
 * Handles save/load/sync of comment generation settings
 */

// Save comment settings to storage
export async function saveCommentSettings() {
    const goal = document.getElementById('comment-goal')?.value;
    const tone = document.getElementById('comment-tone')?.value;
    const commentLength = document.getElementById('comment-length')?.value;
    const commentStyle = document.getElementById('comment-style')?.value;
    const userExpertise = document.getElementById('user-expertise')?.value;
    const userBackground = document.getElementById('user-background')?.value;
    const aiAutoPost = document.getElementById('ai-auto-post')?.value;
    
    const settings = {
        goal: goal || 'AddValue',
        tone: tone || 'Friendly',
        commentLength: commentLength || 'Short',
        commentStyle: commentStyle || 'direct',
        userExpertise: userExpertise || '',
        userBackground: userBackground || '',
        aiAutoPost: aiAutoPost || 'manual'
    };
    
    await chrome.storage.local.set({ commentSettings: settings });
    console.log('💾 Comment settings saved:', settings);
    
    return settings;
}

// Load comment settings from storage
export async function loadCommentSettings() {
    const result = await chrome.storage.local.get('commentSettings');
    const settings = result.commentSettings || {
        goal: 'AddValue',
        tone: 'Friendly',
        commentLength: 'Short',
        commentStyle: 'direct',
        userExpertise: '',
        userBackground: '',
        aiAutoPost: 'manual'
    };
    
    // Update UI elements
    const goalSelect = document.getElementById('comment-goal');
    const toneSelect = document.getElementById('comment-tone');
    const lengthSelect = document.getElementById('comment-length');
    const styleSelect = document.getElementById('comment-style');
    const expertiseInput = document.getElementById('user-expertise');
    const backgroundTextarea = document.getElementById('user-background');
    const aiAutoPostSelect = document.getElementById('ai-auto-post');
    
    if (goalSelect) goalSelect.value = settings.goal;
    if (toneSelect) toneSelect.value = settings.tone;
    if (lengthSelect) lengthSelect.value = settings.commentLength || 'Short';
    if (styleSelect) styleSelect.value = settings.commentStyle || 'direct';
    if (expertiseInput) expertiseInput.value = settings.userExpertise || '';
    if (backgroundTextarea) backgroundTextarea.value = settings.userBackground || '';
    if (aiAutoPostSelect) aiAutoPostSelect.value = settings.aiAutoPost || 'manual';
    
    console.log('📂 Comment settings loaded:', settings);
    
    return settings;
}

// Get current comment settings
export async function getCommentSettings() {
    const result = await chrome.storage.local.get('commentSettings');
    return result.commentSettings || {
        goal: 'AddValue',
        tone: 'Friendly',
        commentLength: 'Short',
        commentStyle: 'direct',
        userExpertise: '',
        userBackground: '',
        aiAutoPost: 'manual'
    };
}

// Initialize comment settings listeners
export function initCommentSettings() {
    console.log('🎯 Initializing comment settings...');
    
    // Load settings on init
    loadCommentSettings();
    
    // Add change listeners for auto-save
    const goalSelect = document.getElementById('comment-goal');
    const toneSelect = document.getElementById('comment-tone');
    const lengthSelect = document.getElementById('comment-length');
    const styleSelect = document.getElementById('comment-style');
    const expertiseInput = document.getElementById('user-expertise');
    const backgroundTextarea = document.getElementById('user-background');
    
    if (goalSelect) {
        goalSelect.addEventListener('change', saveCommentSettings);
    }
    
    if (toneSelect) {
        toneSelect.addEventListener('change', saveCommentSettings);
    }
    
    if (lengthSelect) {
        lengthSelect.addEventListener('change', saveCommentSettings);
    }
    
    if (styleSelect) {
        styleSelect.addEventListener('change', saveCommentSettings);
    }
    
    if (expertiseInput) {
        expertiseInput.addEventListener('blur', saveCommentSettings);
        expertiseInput.addEventListener('keyup', debounce(saveCommentSettings, 1000));
    }
    
    if (backgroundTextarea) {
        backgroundTextarea.addEventListener('blur', saveCommentSettings);
        backgroundTextarea.addEventListener('keyup', debounce(saveCommentSettings, 1000));
    }
    
    const aiAutoPostSelect = document.getElementById('ai-auto-post');
    if (aiAutoPostSelect) {
        aiAutoPostSelect.addEventListener('change', saveCommentSettings);
    }
    
    console.log('✅ Comment settings initialized');
}

// Debounce helper for auto-save
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
