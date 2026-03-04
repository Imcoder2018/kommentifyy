// auth.js - Authentication helper for Chrome Extension
// uses local supabase.js file

class AuthManager {
  constructor() {
    this.supabase = null;
    this.currentUser = null;
    this.initialized = false;
    this.initPromise = null;
    this.savingSession = false; // Lock to prevent concurrent session saves
  }

  async init() {
    // Return existing promise if already initializing
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._doInit();
    return this.initPromise;
  }

  async _doInit() {
    // Wait for window and Supabase to be available
    let attempts = 0;
    while (attempts < 10) {
      // Try different ways Supabase might be exported
      let createClient = null;

      // Method 1: window.supabase.createClient (UMD build)
      if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
        createClient = window.supabase.createClient;
        console.log('Found Supabase at: window.supabase.createClient');
      }
      // Method 2: Direct window.createClient
      else if (typeof window.createClient === 'function') {
        createClient = window.createClient;
        console.log('Found Supabase at: window.createClient');
      }
      // Method 3: Check global supabase variable
      else if (typeof supabase !== 'undefined' && typeof supabase.createClient === 'function') {
        createClient = supabase.createClient;
        console.log('Found Supabase at: global supabase.createClient');
      }

      if (createClient) {
        console.log('Supabase CDN loaded, initializing client...');
        console.log('Config URL:', SUPABASE_CONFIG.url);
        console.log('Config has anonKey:', !!SUPABASE_CONFIG.anonKey);

        this.supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        console.log('Client created:', !!this.supabase);

        await this.loadSession();
        this.initialized = true;
        console.log('Supabase client initialized successfully');
        return;
      }

      console.log('Waiting for Supabase CDN to load... attempt', attempts + 1);
      console.log('Checked: window.supabase, window.createClient, global supabase');
      await new Promise(resolve => setTimeout(resolve, 200));
      attempts++;
    }

    console.error('Supabase client not loaded after 10 attempts.');
    console.error('Available on window:', Object.keys(window).filter(k => k.toLowerCase().includes('supabase')));
    throw new Error('Failed to load Supabase client');
  }

  async ensureInitialized() {
    if (!this.initialized) {
      await this.init();
    }
    if (!this.supabase) {
      throw new Error('Supabase client not initialized');
    }
  }

  // Load existing session from storage
  async loadSession() {
    try {
      // First, try to load session from Chrome storage
      const storageResult = await chrome.storage.local.get(['supabase_session']);
      const storedSession = storageResult.supabase_session;

      if (storedSession && storedSession.access_token) {
        // Check if token is still valid (not expired or expiring soon)
        const expiresAt = storedSession.expires_at;
        const now = Math.floor(Date.now() / 1000);
        const PROACTIVE_REFRESH_BUFFER = 1800; // Refresh if expiring within 30 minutes

        // Token is valid if no expiration or expires more than 30 minutes in the future
        if (!expiresAt || expiresAt > (now + PROACTIVE_REFRESH_BUFFER)) {
          // Token is still valid, set session in Supabase client
          const { data, error } = await this.supabase.auth.setSession({
            access_token: storedSession.access_token,
            refresh_token: storedSession.refresh_token
          });

          if (!error && data.session) {
            this.currentUser = data.session.user;
            console.log('User session restored from storage:', this.currentUser.email);
            return this.currentUser;
          } else if (error) {
            console.warn('Failed to restore session from storage:', error.message);
            // Try to refresh the session if we have a refresh token
            if (storedSession.refresh_token) {
              const { data: refreshData, error: refreshError } = await this.supabase.auth.refreshSession({
                refresh_token: storedSession.refresh_token
              });

              if (!refreshError && refreshData.session) {
                this.currentUser = refreshData.session.user;
                console.log('Session refreshed successfully:', this.currentUser.email);
                await this.saveSessionToStorage();
                return this.currentUser;
              }
            }
          }
        } else {
          console.log('Token expired, attempting refresh...');
          // Token expired, try to refresh
          if (storedSession.refresh_token) {
            const { data: refreshData, error: refreshError } = await this.supabase.auth.refreshSession({
              refresh_token: storedSession.refresh_token
            });

            if (!refreshError && refreshData.session) {
              this.currentUser = refreshData.session.user;
              console.log('Session refreshed after expiration:', this.currentUser.email);
              await this.saveSessionToStorage();
              return this.currentUser;
            }
          }
        }
      }

      // If no valid stored session, check Supabase directly
      const { data } = await this.supabase.auth.getSession();
      if (data.session) {
        this.currentUser = data.session.user;
        console.log('User session loaded from Supabase:', this.currentUser.email);

        // Save/update session in Chrome storage
        await this.saveSessionToStorage();

        return this.currentUser;
      }

      // No session found, clear any stale storage
      console.log('No valid session found, clearing storage');
      await chrome.storage.local.remove(['supabase_session']);
      this.currentUser = null;
      return null;
    } catch (error) {
      console.error('Error loading session:', error);
      // Clear potentially corrupted session data
      await chrome.storage.local.remove(['supabase_session']);
      this.currentUser = null;
      return null;
    }
  }

  // Sign in with Google OAuth using Supabase
  async signInWithGoogle() {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('Starting Google OAuth flow...');

        // Ensure Supabase client is initialized
        await this.ensureInitialized();

        console.log('Supabase config:', {
          url: SUPABASE_CONFIG.url,
          hasAnonKey: !!SUPABASE_CONFIG.anonKey
        });

        // Get Chrome extension redirect URL
        const redirectURL = chrome.identity.getRedirectURL();
        console.log('Chrome redirect URL:', redirectURL);

        // Use Supabase's built-in OAuth flow
        const { data, error } = await this.supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectURL,
            skipBrowserRedirect: true, // We'll handle the redirect manually
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            }
          }
        });

        if (error) {
          console.error('OAuth initiation error:', error);
          reject(new Error(`Failed to initialize OAuth: ${error.message}`));
          return;
        }

        if (!data.url) {
          reject(new Error('No OAuth URL received from Supabase. Please check your Supabase Google OAuth configuration.'));
          return;
        }

        console.log('OAuth URL received, launching auth flow...');
        const authUrl = data.url;

        // Open OAuth flow in new window
        chrome.identity.launchWebAuthFlow(
          {
            url: authUrl,
            interactive: true
          },
          async (redirectUrl) => {
            if (chrome.runtime.lastError) {
              console.error('Auth flow error:', chrome.runtime.lastError);
              const errorMessage = chrome.runtime.lastError.message || 'Unknown error';

              // Provide specific error messages
              if (errorMessage.includes('Authorization page could not be loaded')) {
                reject(new Error('Authorization page could not be loaded. This may be due to:\n1. Google OAuth not configured in Supabase\n2. Network connectivity issues\n3. Chrome extension redirect URL not whitelisted in Supabase'));
              } else if (errorMessage.includes('User canceled')) {
                reject(new Error('Sign-in was canceled'));
              } else {
                reject(new Error(`Authentication failed: ${errorMessage}`));
              }
              return;
            }

            if (!redirectUrl) {
              reject(new Error('No redirect URL received from authentication'));
              return;
            }

            console.log('OAuth completed, processing redirect URL...');

            try {
              // Extract tokens from redirect URL
              // Supabase returns tokens in URL hash: #access_token=...&refresh_token=...
              const url = new URL(redirectUrl);
              console.log('Parsed URL hash:', url.hash);

              const hashParams = new URLSearchParams(url.hash.substring(1));
              const access_token = hashParams.get('access_token');
              const refresh_token = hashParams.get('refresh_token');

              console.log('Extracted tokens:', {
                hasAccessToken: !!access_token,
                hasRefreshToken: !!refresh_token
              });

              if (!access_token) {
                console.error('Full redirect URL:', redirectUrl);
                console.error('URL hash:', url.hash);
                console.error('All hash params:', Array.from(hashParams.entries()));
                throw new Error('No access token in redirect URL');
              }

              // Set the session using the tokens
              const { data: sessionData, error: sessionError } = await this.supabase.auth.setSession({
                access_token,
                refresh_token
              });

              if (sessionError) {
                throw sessionError;
              }

              this.currentUser = sessionData.user;
              console.log('Signed in successfully:', this.currentUser.email);

              // Store session info
              await this.saveSessionToStorage();

              resolve({ success: true, user: this.currentUser });
            } catch (error) {
              console.error('Session processing error:', error);
              reject(error);
            }
          }
        );
      } catch (error) {
        console.error('Sign in error:', error);
        reject(error);
      }
    });
  }

  // Sign out
  async signOut() {
    try {
      await this.ensureInitialized();
      await this.supabase.auth.signOut();
      this.currentUser = null;

      await chrome.storage.local.remove(['supabase_session']);
      console.log('User signed out');

      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get current user
  getUser() {
    return this.currentUser;
  }

  // Check if user is signed in
  isSignedIn() {
    return this.currentUser !== null;
  }

  // Get access token for API requests
  async getAccessToken() {
    await this.ensureInitialized();
    const { data } = await this.supabase.auth.getSession();
    return data.session?.access_token || null;
  }

  // Get refresh token
  async getRefreshToken() {
    await this.ensureInitialized();
    const { data } = await this.supabase.auth.getSession();
    return data.session?.refresh_token || null;
  }

  // Refresh session
  async refreshSession() {
    await this.ensureInitialized();
    const { data, error } = await this.supabase.auth.refreshSession();
    if (error) {
      console.error('Session refresh error:', error);
      return null;
    }
    this.currentUser = data.session?.user || null;
    return data.session;
  }

  // Save session to Chrome storage
  async saveSessionToStorage() {
    // Prevent concurrent session saves
    if (this.savingSession) {
      console.log('Session save already in progress, skipping...');
      return;
    }

    this.savingSession = true;

    try {
      const { data } = await this.supabase.auth.getSession();
      if (data.session) {
        await chrome.storage.local.set({
          supabase_session: {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            user: this.currentUser,
            expires_at: data.session.expires_at
          }
        });

        // Notify background script to fetch user settings
        try {
          chrome.runtime.sendMessage({ action: 'fetchUserSettings' });
        } catch (error) {
          console.log('Could not notify background script:', error);
        }
      }
    } finally {
      this.savingSession = false;
    }
  }

  // Listen for auth state changes
  onAuthStateChange(callback) {
    if (!this.initialized || !this.supabase) {
      console.error('Supabase not initialized, cannot listen to auth changes. Please call authManager.init() first.');
      return {
        data: {
          subscription: {
            unsubscribe: () => console.log('No subscription to unsubscribe')
          }
        }
      };
    }
    return this.supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      this.currentUser = session?.user || null;
      callback(event, session);
    });
  }
}

// Create singleton instance
const authManager = new AuthManager();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = authManager;
}
