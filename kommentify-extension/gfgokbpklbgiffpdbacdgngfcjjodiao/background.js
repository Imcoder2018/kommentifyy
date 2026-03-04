// background.js - Service worker for handling API requests

// Import config
importScripts('config.js');

const API_URL = 'https://replya.vercel.app/api/suggest';

// Store active abort controller
let activeAbortController = null;
let activeRequestTimeout = null;

// Token refresh configuration
const TOKEN_REFRESH_ALARM = 'tokenRefreshAlarm';
const TOKEN_REFRESH_INTERVAL = 10; // Check every 10 minutes
const TOKEN_EXPIRY_BUFFER = 1200; // Refresh if expiring within 20 minutes (in seconds)

// Initialize periodic token refresh on extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log('Extension started, setting up token refresh alarm...');
  setupTokenRefreshAlarm();
});

// Also set up alarm when extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed/updated, setting up token refresh alarm...');
  setupTokenRefreshAlarm();
});

// Set up periodic alarm for token refresh
async function setupTokenRefreshAlarm() {
  // Clear any existing alarm
  await chrome.alarms.clear(TOKEN_REFRESH_ALARM);

  // Create new alarm that fires every 15 minutes
  await chrome.alarms.create(TOKEN_REFRESH_ALARM, {
    periodInMinutes: TOKEN_REFRESH_INTERVAL
  });

  console.log(`Token refresh alarm set to check every ${TOKEN_REFRESH_INTERVAL} minutes`);

  // Also do an immediate check
  await checkAndRefreshToken();
}

// Listen for alarm events
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === TOKEN_REFRESH_ALARM) {
    console.log('Token refresh alarm triggered');
    checkAndRefreshToken();
  }
});

// Check token status and refresh if needed
async function checkAndRefreshToken() {
  try {
    const result = await chrome.storage.local.get(['supabase_session']);
    const session = result.supabase_session;

    if (!session || !session.access_token) {
      console.log('No session found, skipping token refresh');
      return;
    }

    const expiresAt = session.expires_at;
    const now = Math.floor(Date.now() / 1000);

    // Check if token is expired or expiring soon
    if (expiresAt && expiresAt < (now + TOKEN_EXPIRY_BUFFER)) {
      console.log('Token expiring soon, refreshing proactively...');
      const refreshedToken = await refreshAuthToken(session.refresh_token);

      if (refreshedToken) {
        console.log('Token refreshed successfully via periodic check');
        // Notify user if they have the popup open
        try {
          chrome.runtime.sendMessage({ action: 'tokenRefreshed' });
        } catch (e) {
          // Popup might not be open, ignore
        }
      } else {
        console.warn('Periodic token refresh failed');
      }
    } else {
      const minutesUntilExpiry = Math.floor((expiresAt - now) / 60);
      console.log(`Token still valid, expires in ${minutesUntilExpiry} minutes`);
    }
  } catch (error) {
    console.error('Error in periodic token refresh:', error);
  }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'suggestComments') {
    handleSuggestComments(message.postText, sender.tab.id, message.tone, message.length, message.posterName, message.usePersonalization, message.useEmojis, message.askQuestions, message.existingCommentText);
  } else if (message.action === 'cancelRequest') {
    cancelActiveRequest();
  } else if (message.action === 'checkAuth') {
    // Check if user is authenticated
    checkAuthStatus().then(isAuthenticated => {
      sendResponse({ isAuthenticated });
    });
    return true; // Keep channel open for async response
  } else if (message.action === 'openSettings') {
    // Open settings page
    chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
  } else if (message.action === 'openPopup') {
    // Open popup in a new window (since we can't programmatically open the actual popup)
    chrome.windows.create({
      url: chrome.runtime.getURL('popup.html'),
      type: 'popup',
      width: 400,
      height: 600
    });
  } else if (message.action === 'fetchUserSettings') {
    // Fetch and cache user settings from Supabase
    fetchAndCacheUserSettings().then(settings => {
      console.log('User settings fetched on authentication:', settings);
    });
  } else if (message.action === 'saveDomStructure') {
    // Save DOM structure config to backend
    saveDomStructureToBackend(message.selectors).then(result => {
      console.log('DOM structure save result:', result);
      sendResponse(result);
    }).catch(err => {
      console.error('DOM structure save error:', err);
      sendResponse({ success: false, error: err.message });
    });
  }
  return true; // Keep channel open for async response
});

// Cancel active API request
function cancelActiveRequest() {
  if (activeAbortController) {
    console.log('Cancelling active request...');
    activeAbortController.abort();
    activeAbortController = null;
  }
  if (activeRequestTimeout) {
    clearTimeout(activeRequestTimeout);
    activeRequestTimeout = null;
  }
}

// Get auth token from storage, refresh if expired
async function getAuthToken() {
  try {
    const result = await chrome.storage.local.get(['supabase_session']);
    const session = result.supabase_session;

    if (!session || !session.access_token) {
      console.log('No session found in storage');
      return null;
    }

    // Check if token is expired or about to expire (within 10 minutes)
    const expiresAt = session.expires_at;
    const now = Math.floor(Date.now() / 1000);
    const bufferTime = 1200; // 20 minutes in seconds (matches TOKEN_EXPIRY_BUFFER)

    if (expiresAt && expiresAt < (now + bufferTime)) {
      console.log('Token expired or expiring soon, attempting refresh...');

      // Try to refresh the token
      const refreshedToken = await refreshAuthToken(session.refresh_token);
      if (refreshedToken) {
        return refreshedToken;
      }

      console.warn('Token refresh failed, session may be invalid');
      return null;
    }

    return session.access_token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

// Refresh auth token using refresh token with retry logic
async function refreshAuthToken(refreshToken, retryCount = 0) {
  const MAX_RETRIES = 2;

  if (!refreshToken) {
    console.log('No refresh token available');
    return null;
  }

  try {
    console.log(`Attempting token refresh (attempt ${retryCount + 1}/${MAX_RETRIES + 1})...`);

    // Call Supabase token endpoint
    const response = await fetch(`${SUPABASE_CONFIG.url}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_CONFIG.anonKey
      },
      body: JSON.stringify({
        refresh_token: refreshToken
      })
    });

    if (!response.ok) {
      console.error('Token refresh failed:', response.status, response.statusText);

      // Only clear session on 401/403 (unauthorized), not on network errors
      if (response.status === 401 || response.status === 403) {
        console.warn('Refresh token invalid or expired, clearing session');
        await chrome.storage.local.remove(['supabase_session']);

        // Notify user about session expiration
        try {
          chrome.runtime.sendMessage({
            action: 'sessionExpired',
            message: 'Your session has expired. Please sign in again.'
          });
        } catch (e) {
          // Popup might not be open
        }

        return null;
      }

      // For 5xx errors or network issues, retry
      if (response.status >= 500 && retryCount < MAX_RETRIES) {
        console.log(`Server error, retrying in ${(retryCount + 1) * 2} seconds...`);
        await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 2000));
        return refreshAuthToken(refreshToken, retryCount + 1);
      }

      return null;
    }

    const data = await response.json();

    if (data.access_token) {
      console.log('Token refreshed successfully');

      // Update storage with new tokens
      await chrome.storage.local.set({
        supabase_session: {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: data.expires_at,
          user: data.user
        }
      });

      return data.access_token;
    }

    return null;
  } catch (error) {
    console.error('Error refreshing token:', error);

    // Network error - retry if we haven't exceeded max retries
    if (retryCount < MAX_RETRIES && (error.name === 'TypeError' || error.message.includes('fetch'))) {
      console.log(`Network error, retrying in ${(retryCount + 1) * 2} seconds...`);
      await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 2000));
      return refreshAuthToken(refreshToken, retryCount + 1);
    }

    // Don't clear session on network errors, only on auth errors
    return null;
  }
}

// Check if user is authenticated
async function checkAuthStatus() {
  const token = await getAuthToken();
  return token !== null;
}

// Update request count in storage
async function updateRequestCount() {
  try {
    const result = await chrome.storage.local.get(['todayRequestCount', 'lastRequestDate']);
    const today = new Date().toDateString();

    let count = 0;
    if (result.lastRequestDate === today) {
      count = (result.todayRequestCount || 0) + 1;
    } else {
      count = 1;
    }

    await chrome.storage.local.set({
      todayRequestCount: count,
      lastRequestDate: today
    });

    console.log('Request count updated:', count);
  } catch (error) {
    console.error('Error updating request count:', error);
  }
}

// Notify all LinkedIn tabs about auth state change
async function notifyAuthStateChange(isAuthenticated) {
  try {
    const tabs = await chrome.tabs.query({ url: 'https://www.linkedin.com/*' });
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, {
        action: 'authStateChanged',
        isAuthenticated: isAuthenticated
      }).catch(err => {
        // Tab might not have content script loaded yet, ignore error
        console.log('Could not notify tab:', tab.id, err.message);
      });
    });
  } catch (error) {
    console.error('Error notifying tabs:', error);
  }
}

// Fetch user settings from Supabase and cache them locally
async function fetchAndCacheUserSettings() {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.log('No auth token available, cannot fetch user settings');
      return null;
    }

    console.log('Fetching user settings from Supabase...');

    const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/users?select=comment_tone,comment_length,use_emojis,ask_questions`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_CONFIG.anonKey,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch user settings:', response.status);
      return null;
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const userSettings = {
        tone: data[0].comment_tone || 'professional',
        length: data[0].comment_length || 'medium',
        useEmojis: data[0].use_emojis || false,
        askQuestions: data[0].ask_questions || false,
        usePersonalization: true // Always default to true
      };

      // Cache settings in local storage
      await chrome.storage.local.set({ userSettings });
      console.log('User settings cached:', userSettings);

      return userSettings;
    }

    return null;
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return null;
  }
}

// Get user settings from cache or fetch from Supabase
async function getUserSettings() {
  try {
    // First, try to get from cache
    const result = await chrome.storage.local.get(['userSettings']);

    if (result.userSettings) {
      console.log('Using cached user settings:', result.userSettings);
      return result.userSettings;
    }

    // If not in cache, fetch from Supabase
    console.log('No cached settings found, fetching from Supabase...');
    const settings = await fetchAndCacheUserSettings();

    if (settings) {
      return settings;
    }

    // Return default settings if nothing found
    console.log('No user settings found, using defaults');
    return {
      tone: 'professional',
      length: 'medium',
      useEmojis: false,
      askQuestions: false,
      usePersonalization: true
    };
  } catch (error) {
    console.error('Error getting user settings:', error);
    // Return defaults on error
    return {
      tone: 'professional',
      length: 'medium',
      useEmojis: false,
      askQuestions: false,
      usePersonalization: true
    };
  }
}

// Handle comment suggestion request
async function handleSuggestComments(postText, tabId, tone = null, length = null, posterName = null, usePersonalization = null, useEmojis = null, askQuestions = null, existingCommentText = null) {
  try {
    // Get user's default settings
    const userSettings = await getUserSettings();

    // Use provided values or fall back to user's settings
    const finalTone = tone || userSettings.tone;
    const finalLength = length || userSettings.length;
    const finalUsePersonalization = usePersonalization !== null ? usePersonalization : userSettings.usePersonalization;
    const finalUseEmojis = useEmojis !== null ? useEmojis : userSettings.useEmojis;
    const finalAskQuestions = askQuestions !== null ? askQuestions : userSettings.askQuestions;
    const finalExistingCommentText = existingCommentText || null;

    console.log('Sending request to API:', API_URL);
    console.log('Post text:', postText);
    console.log('Tone:', finalTone);
    console.log('Length:', finalLength);
    console.log('Poster name:', posterName);
    console.log('Use personalization:', finalUsePersonalization);
    console.log('Use emojis:', finalUseEmojis);
    console.log('Ask questions:', finalAskQuestions);
    console.log('Existing comment text:', finalExistingCommentText);

    // Cancel any existing request
    cancelActiveRequest();

    // Create new abort controller
    activeAbortController = new AbortController();

    // Set 15-second timeout
    activeRequestTimeout = setTimeout(() => {
      if (activeAbortController) {
        console.log('Request timeout - cancelling...');
        activeAbortController.abort();
        activeAbortController = null;
        chrome.tabs.sendMessage(tabId, {
          action: 'showError',
          error: 'Request timed out after 30 seconds. Please try again.'
        });
      }
    }, 30000);

    // Get auth token (will auto-refresh if expired)
    const token = await getAuthToken();
    console.log('Auth token:', token ? 'Present' : 'Missing');

    // Check if user is authenticated
    if (!token) {
      cancelActiveRequest();
      chrome.tabs.sendMessage(tabId, {
        action: 'showError',
        error: 'Your session has expired. Please sign in again by clicking the extension icon.'
      });
      return;
    }

    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // Prepare request body
    const requestBody = {
      postText: postText,
      tone: finalTone,
      length: finalLength,
      count: 5, // Always generate 5 suggestions
      usePersonalization: finalUsePersonalization,
      useEmojis: finalUseEmojis,
      askQuestions: finalAskQuestions
    };

    // Add poster name if available
    if (posterName) {
      requestBody.posterName = posterName;
    }

    // Add existing comment text if available
    if (existingCommentText) {
      requestBody.existingCommentText = existingCommentText;
    }

    // Call backend API with abort signal
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody),
      signal: activeAbortController.signal
    });

    // Clear timeout since request completed
    if (activeRequestTimeout) {
      clearTimeout(activeRequestTimeout);
      activeRequestTimeout = null;
    }
    activeAbortController = null;

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API error:', errorData);

      // Handle authentication errors specifically
      if (response.status === 403) {
        throw new Error('Please sign in to use AI comment suggestions. Click the extension icon to sign in.');
      }

      // Handle rate limit errors (429 Too Many Requests)
      if (response.status === 429) {
        const details = errorData.details || {};
        const resetTime = details.resetTime ? new Date(details.resetTime).toLocaleTimeString() : 'midnight';
        throw new Error(`Daily limit reached! You've used ${details.currentCount || 'all'} of your ${details.limit || 100} daily requests. Limit resets at ${resetTime}.`);
      }

      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const data = await response.json();

    // Update request count
    await updateRequestCount();

    // Send suggestions back to content script with current settings
    chrome.tabs.sendMessage(tabId, {
      action: 'showSuggestions',
      suggestions: data.suggestions,
      tone: finalTone,
      length: finalLength,
      usePersonalization: finalUsePersonalization,
      useEmojis: finalUseEmojis,
      askQuestions: finalAskQuestions
    });

  } catch (error) {
    // Clear timeout and controller
    cancelActiveRequest();

    // Check if error is due to abort
    if (error.name === 'AbortError') {
      console.log('Request was cancelled');
      // Don't show error if user manually cancelled
      return;
    }

    console.error('Error fetching suggestions:', error);
    chrome.tabs.sendMessage(tabId, {
      action: 'showError',
      error: error.message || 'Failed to generate suggestions. Please try again.'
    });
  }
}

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Open popup (default behavior)
});

// Listen for storage changes to detect auth state changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.supabase_session) {
    const isAuthenticated = changes.supabase_session.newValue !== undefined &&
      changes.supabase_session.newValue !== null;
    console.log('Auth state changed, notifying tabs...');
    notifyAuthStateChange(isAuthenticated);
  }
});

console.log('Replya - LinkedIn AI Assistant extension loaded');
console.log('Replya API URL:', API_URL);

const DOM_STRUCTURE_API_URL = 'https://replya.vercel.app/api/dom-structure';

// Save DOM structure config to backend
async function saveDomStructureToBackend(selectors) {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.log('No auth token, saving DOM structure locally only');
      return { success: true, local: true };
    }

    const response = await fetch(DOM_STRUCTURE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ selectors })
    });

    if (!response.ok) {
      console.warn('Failed to save DOM structure to backend:', response.status);
      return { success: false, error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    console.log('DOM structure saved to backend:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error saving DOM structure to backend:', error);
    return { success: false, error: error.message };
  }
}

// Fetch community DOM config from backend on startup (if none exists locally)
async function fetchCommunityDomConfig() {
  try {
    const result = await chrome.storage.local.get(['customDomSelectors']);
    if (result.customDomSelectors) {
      console.log('Local DOM selectors already exist, skipping community fetch');
      return;
    }

    const token = await getAuthToken();
    if (!token) return;

    const response = await fetch(DOM_STRUCTURE_API_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.selectors) {
        await chrome.storage.local.set({ customDomSelectors: data.selectors });
        console.log('Community DOM config loaded:', data.selectors);

        // Notify LinkedIn tabs to reload selectors
        const tabs = await chrome.tabs.query({ url: 'https://www.linkedin.com/*' });
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, { action: 'customSelectorsUpdated' }).catch(() => {});
        });
      }
    }
  } catch (error) {
    console.error('Error fetching community DOM config:', error);
  }
}

// Fetch community config on startup
chrome.runtime.onStartup.addListener(() => {
  setTimeout(() => fetchCommunityDomConfig(), 5000); // Delay to let auth settle
});
