// popup.js - Handles extension popup interactions with authentication

const loginSection = document.getElementById('loginSection');
const mainContent = document.getElementById('mainContent');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const openLinkedInBtn = document.getElementById('openLinkedIn');
const userInfo = document.getElementById('userInfo');
const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');
const userAvatar = document.getElementById('userAvatar');
const requestCount = document.getElementById('requestCount');

// Check authentication status on popup load
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Popup loaded, checking auth status...');

  // Hide all UI initially to prevent flashing
  if (loginSection) loginSection.classList.add('hidden');
  if (mainContent) mainContent.classList.add('hidden');
  if (logoutBtn) logoutBtn.classList.add('hidden');
  if (userInfo) userInfo.classList.remove('visible');

  await checkAuthStatus();
  setupEventListeners();
});

// Check if user is authenticated
async function checkAuthStatus() {
  try {
    console.log('Initializing auth manager...');

    // Wait for auth manager to initialize
    await authManager.init();

    // Also check storage directly to speed up initial display
    const storageResult = await chrome.storage.local.get(['supabase_session']);
    const storedSession = storageResult.supabase_session;

    // Quick check: if we have a valid session in storage, show main content immediately
    if (storedSession && storedSession.access_token && storedSession.user) {
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = storedSession.expires_at;

      // If token hasn't expired, show the user immediately (optimistic UI)
      if (!expiresAt || expiresAt > now) {
        console.log('Valid session in storage, showing user immediately');
        showMainContent(storedSession.user);
        await loadUserStats();
      }
    }

    // Then verify with auth manager
    const user = authManager.getUser();

    console.log('Auth check complete. User:', user ? user.email : 'Not logged in');

    if (user) {
      // User is logged in - update UI in case it changed
      showMainContent(user);
      await loadUserStats();
    } else {
      // User is not logged in
      showLoginSection();
    }
  } catch (error) {
    console.error('Auth check error:', error);
    showLoginSection();
  }
}

// Show login section
function showLoginSection() {
  console.log('Showing login section');
  if (loginSection) loginSection.classList.remove('hidden');
  if (mainContent) mainContent.classList.add('hidden');
  if (userInfo) userInfo.classList.remove('visible');
  if (logoutBtn) {
    logoutBtn.classList.add('hidden');
    console.log('Logout button hidden');
  }
}

// Show main content
function showMainContent(user) {
  console.log('Showing main content for user:', user.email);
  if (loginSection) loginSection.classList.add('hidden');
  if (mainContent) mainContent.classList.remove('hidden');
  if (userInfo) userInfo.classList.add('visible');
  if (logoutBtn) {
    logoutBtn.classList.remove('hidden');
    console.log('Logout button shown');
  }

  // Update user info
  if (userName) userName.textContent = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
  if (userEmail) userEmail.textContent = user.email || '';

  if (userAvatar && user.user_metadata?.avatar_url) {
    userAvatar.src = user.user_metadata.avatar_url;
  } else if (userAvatar && userName) {
    // Use a default avatar or initials
    userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName.textContent)}&background=5170ff&color=fff`;
  }
}

// Load user statistics
async function loadUserStats() {
  try {
    const token = await authManager.getAccessToken();
    if (!token) return;

    const user = authManager.getUser();
    if (!user) return;

    // Check if we have a recent cached count (cache for 5 minutes)
    const result = await chrome.storage.local.get(['lifetimeRequestCount', 'lastStatsUpdate']);
    const now = Date.now();
    const cacheAge = now - (result.lastStatsUpdate || 0);
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

    // Use cached value if it's fresh
    if (result.lifetimeRequestCount !== undefined && cacheAge < CACHE_DURATION) {
      console.log('Using cached request count:', result.lifetimeRequestCount);
      requestCount.textContent = result.lifetimeRequestCount;
      return;
    }

    // Fetch fresh count from Supabase
    console.log('Fetching fresh request count from Supabase...');
    const { count, error } = await authManager.supabase
      .from('request_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching request count from Supabase:', error);
      // Fallback to cached value if available
      requestCount.textContent = result.lifetimeRequestCount || 0;
    } else {
      // Use the count from Supabase
      const lifetimeCount = count || 0;
      requestCount.textContent = lifetimeCount;

      // Update cache with fresh data and timestamp
      await chrome.storage.local.set({
        lifetimeRequestCount: lifetimeCount,
        lastStatsUpdate: now
      });
      console.log('Updated request count cache:', lifetimeCount);
    }
  } catch (error) {
    console.error('Error loading stats:', error);
    // Fallback to cached value
    const result = await chrome.storage.local.get(['lifetimeRequestCount']);
    requestCount.textContent = result.lifetimeRequestCount || 0;
  }
}

// Setup event listeners
function setupEventListeners() {
  // Login button
  loginBtn.addEventListener('click', async () => {
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span class="loading"></span><span>Signing in...</span>';

    try {
      await authManager.signInWithGoogle();

      // Reload popup after successful login
      window.location.reload();
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error details:', error.message, error);

      // Show more specific error message
      const errorMsg = error.message || 'Unknown error occurred';
      alert(`Failed to sign in: ${errorMsg}\n\nCheck the console for details.`);

      loginBtn.disabled = false;
      loginBtn.innerHTML = '<span>🔐</span><span>Sign in with Google</span>';
    }
  });

  // Logout button
  logoutBtn.addEventListener('click', async () => {
    logoutBtn.disabled = true;
    logoutBtn.textContent = 'Signing out...';

    try {
      await authManager.signOut();

      // Reset UI
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to sign out. Please try again.');
      logoutBtn.disabled = false;
      logoutBtn.textContent = 'Sign Out';
    }
  });

  // Settings button
  const settingsBtn = document.getElementById('settingsBtn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
  }

  // Guide button
  const guideBtn = document.getElementById('guideBtn');
  if (guideBtn) {
    guideBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: 'https://replya.vercel.app/' });
    });
  }

  // Having Issues button
  const havingIssuesBtn = document.getElementById('havingIssuesBtn');
  if (havingIssuesBtn) {
    havingIssuesBtn.addEventListener('click', async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url && tab.url.includes('linkedin.com')) {
          chrome.tabs.sendMessage(tab.id, { action: 'startSelectorWizard' }, (response) => {
            if (chrome.runtime.lastError) {
              alert('Could not connect to LinkedIn page. Please refresh the page and try again.');
            } else {
              window.close(); // Close popup so user can interact with the wizard
            }
          });
        } else {
          alert('Please navigate to LinkedIn first, then try again.');
        }
      } catch (error) {
        console.error('Having Issues error:', error);
        alert('Please navigate to LinkedIn first, then try again.');
      }
    });
  }

  // Open LinkedIn button
  openLinkedInBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://www.linkedin.com/feed/' });
  });

  // Setup auth state change listener only after initialization
  setupAuthStateListener();
}

// Setup auth state change listener
let authStateChangeTimeout = null;

async function setupAuthStateListener() {
  try {
    // Wait for auth manager to initialize first
    await authManager.init();

    // Now safe to listen for auth state changes
    authManager.onAuthStateChange((event, session) => {
      console.log('Auth state changed in popup:', event);

      // Debounce rapid auth state changes
      if (authStateChangeTimeout) {
        clearTimeout(authStateChangeTimeout);
      }

      authStateChangeTimeout = setTimeout(() => {
        if (event === 'SIGNED_IN' && session) {
          showMainContent(session.user);
          loadUserStats();
        } else if (event === 'SIGNED_OUT') {
          showLoginSection();
        }
      }, 100); // Wait 100ms before reacting to state change
    });
  } catch (error) {
    console.error('Error setting up auth state listener:', error);
  }
}
