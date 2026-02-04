import { elements } from './state.js';
import { API_CONFIG, showNotification } from './utils.js';

// ===== AUTHENTICATION & ACCOUNT MANAGEMENT =====

// Validate JWT token - WITH 15-MINUTE CACHING
export async function validateJWTToken(token) {
    if (!token) {
        console.log('No token provided');
        return false;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
        console.log('Invalid token format');
        return false;
    }

    // Check cached validation first (15 minute cache)
    const VALIDATION_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
    const { tokenValidationCache, tokenValidationTimestamp } = await chrome.storage.local.get([
        'tokenValidationCache',
        'tokenValidationTimestamp'
    ]);
    
    if (tokenValidationCache && tokenValidationTimestamp) {
        const cacheAge = Date.now() - tokenValidationTimestamp;
        if (cacheAge < VALIDATION_CACHE_DURATION) {
            console.log(`⚡ Using cached token validation (age: ${Math.round(cacheAge / 1000)}s)`);
            return tokenValidationCache.isValid;
        } else {
            console.log(`⏰ Token validation cache expired (age: ${Math.round(cacheAge / 1000)}s)`);
        }
    }

    // Get API base URL from storage
    const { apiBaseUrl } = await chrome.storage.local.get('apiBaseUrl');
    const apiUrl = apiBaseUrl || API_CONFIG.BASE_URL;

    console.log('Validating token with backend...');

    try {
        const response = await fetch(`${apiUrl}/api/auth/validate`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            console.log('Token validated successfully by backend');
            // Cache the validation result
            await chrome.storage.local.set({
                tokenValidationCache: { isValid: true },
                tokenValidationTimestamp: Date.now()
            });
            console.log('💾 Cached token validation for 15 minutes');
            return true;
        } else {
            console.log('Token validation failed:', data.error);
            await chrome.storage.local.remove(['authToken', 'userData', 'refreshToken', 'tokenValidationCache', 'tokenValidationTimestamp']);
            return false;
        }
    } catch (apiError) {
        console.error('Backend validation failed:', apiError);
        // If backend is unavailable, do basic format validation only
        try {
            const payload = JSON.parse(atob(parts[1]));
            const now = Math.floor(Date.now() / 1000);

            if (payload.exp && payload.exp < now) {
                console.log('Token expired');
                await chrome.storage.local.remove(['authToken', 'userData', 'refreshToken', 'tokenValidationCache', 'tokenValidationTimestamp']);
                return false;
            }

            console.log('Backend unavailable, using basic validation');
            // Cache this as well
            await chrome.storage.local.set({
                tokenValidationCache: { isValid: true },
                tokenValidationTimestamp: Date.now()
            });
            return true;
        } catch (decodeError) {
            console.error('Token decode error:', decodeError);
            return false;
        }
    }
}

// Show login screen for unauthenticated users
export function showLoginScreen() {
    document.body.innerHTML = `
        <div style="
            min-height: 600px;
            background: linear-gradient(135deg, #693fe9 0%, #1a2340 100%);
            color: white;
            padding: 20px;
        ">
            <div style="max-width: 400px; margin: 0 auto;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="font-size: 28px; margin-bottom: 10px;">🚀 Kommentify</h1>
                    <p style="opacity: 0.9; font-size: 14px;">LinkedIn Automation & AI Content</p>
                </div>
                
                <div style="background: white; border-radius: 15px; padding: 30px; color: #333;">
                    <!-- Status Messages -->
                    <div id="auth-status" style="
                        background: #f8f9fa;
                        color: #666;
                        padding: 12px;
                        border-radius: 8px;
                        margin-bottom: 20px;
                        font-size: 14px;
                        text-align: center;
                        display: none;
                    "></div>
                    
                    <div style="text-align: center; margin-bottom: 25px;">
                        <div style="font-size: 50px; margin-bottom: 15px;">🔐</div>
                        <h2 style="font-size: 20px; margin-bottom: 10px; color: #333;">Welcome Back!</h2>
                        <p style="color: #666; font-size: 14px; line-height: 1.5;">
                            Click below to sign in or create an account using our secure authentication.
                        </p>
                    </div>
                    
                    <!-- Primary Login Button -->
                    <button id="clerk-login-btn" style="
                        width: 100%;
                        padding: 16px;
                        background: #693fe9;
                        color: white;
                        border: none;
                        border-radius: 10px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s;
                        margin-bottom: 15px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 10px;
                    ">
                        <span>🚀</span> Sign In / Sign Up
                    </button>
                    
                    <p style="text-align: center; color: #999; font-size: 12px; margin-bottom: 20px;">
                        Opens in a new tab for secure authentication
                    </p>
                    
                </div>
                
                <div style="text-align: center; margin-top: 20px; font-size: 12px; opacity: 0.8;">
                    <p>✅ Automated Engagement • ✅ AI Content • ✅ Smart Scheduling</p>
                </div>
            </div>
        </div>
    `;

    // Add event listeners
    setupLoginScreenListeners();
}

// Setup event listeners for login screen
function setupLoginScreenListeners() {
    // Clerk login button - opens login page in new tab
    document.getElementById('clerk-login-btn').addEventListener('click', handleClerkLogin);
}

// Handle Clerk login - opens sign-in page in new tab and polls for auth token
async function handleClerkLogin() {
    const clerkBtn = document.getElementById('clerk-login-btn');
    const authStatus = document.getElementById('auth-status');
    
    try {
        // Get API base URL
        const storage = await chrome.storage.local.get(['apiBaseUrl']);
        let apiUrl = storage.apiBaseUrl || API_CONFIG.BASE_URL;
        
        if (!apiUrl || apiUrl.includes('localhost')) {
            apiUrl = API_CONFIG.BASE_URL;
        }
        
        // Show loading state
        clerkBtn.disabled = true;
        clerkBtn.innerHTML = '<span>⏳</span> Opening login...';
        
        // Open extension-auth page directly (it will redirect to sign-in if needed)
        const authUrl = `${apiUrl}/extension-auth`;
        console.log('Opening extension auth URL:', authUrl);
        
        const tab = await chrome.tabs.create({ url: authUrl, active: true });
        
        // Show status message
        if (authStatus) {
            authStatus.style.display = 'block';
            authStatus.style.background = '#e8f4fd';
            authStatus.style.color = '#0066cc';
            authStatus.innerHTML = '⏳ Waiting for you to sign in...<br><small>This popup will refresh automatically</small>';
        }
        
        // Poll chrome.storage for auth token (set by content script on extension-auth page)
        let pollCount = 0;
        const maxPolls = 150; // 5 minutes (2 second interval)
        
        const checkAuthInterval = setInterval(async () => {
            pollCount++;
            
            try {
                // Check if auth token is now in storage (set by authBridge content script)
                const authStorage = await chrome.storage.local.get(['authToken', 'userData']);
                
                if (authStorage.authToken) {
                    console.log('✅ Auth token found in storage! User logged in.');
                    clearInterval(checkAuthInterval);
                    
                    // Try to close the login tab
                    try {
                        await chrome.tabs.remove(tab.id);
                    } catch (e) {
                        // Tab might already be closed
                    }
                    
                    // Reload the popup
                    location.reload();
                    return;
                }
            } catch (storageError) {
                console.log('Checking storage for auth...', pollCount);
            }
            
            // Check if tab was closed
            try {
                await chrome.tabs.get(tab.id);
            } catch (e) {
                // Tab was closed, stop polling
                console.log('Login tab closed by user');
                clearInterval(checkAuthInterval);
                
                clerkBtn.disabled = false;
                clerkBtn.innerHTML = '<span>🚀</span> Sign In / Sign Up';
                
                if (authStatus) {
                    authStatus.style.display = 'none';
                }
                return;
            }
            
            // Update status animation
            if (pollCount % 3 === 0 && authStatus) {
                const dots = '.'.repeat((pollCount % 3) + 1);
                authStatus.innerHTML = `⏳ Waiting for sign in${dots}<br><small>Complete sign-in in the opened tab</small>`;
            }
            
            // Timeout after max polls
            if (pollCount >= maxPolls) {
                console.log('Login check timeout');
                clearInterval(checkAuthInterval);
                
                clerkBtn.disabled = false;
                clerkBtn.innerHTML = '<span>🚀</span> Sign In / Sign Up';
                
                if (authStatus) {
                    authStatus.style.background = '#fff3cd';
                    authStatus.style.color = '#856404';
                    authStatus.innerHTML = '⚠️ Login timed out. Please try again.';
                }
            }
        }, 2000); // Poll every 2 seconds
        
    } catch (error) {
        console.error('Clerk login error:', error);
        
        clerkBtn.disabled = false;
        clerkBtn.innerHTML = '<span>🚀</span> Sign In / Sign Up';
        
        if (authStatus) {
            authStatus.style.display = 'block';
            authStatus.style.background = '#f8d7da';
            authStatus.style.color = '#721c24';
            authStatus.textContent = '❌ Failed to open login page. Please try again.';
        }
    }
}

// Handle Send OTP
async function handleSendOTP() {
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const sendOtpBtn = document.getElementById('send-otp-btn');
    const resendOtpBtn = document.getElementById('resend-otp-btn');

    // Hide previous messages
    const authError = document.getElementById('auth-error');
    const authSuccess = document.getElementById('auth-success');
    if (authError) authError.style.display = 'none';
    if (authSuccess) authSuccess.style.display = 'none';

    // Validate inputs
    if (!name) {
        showAuthMessage('Please enter your name');
        return;
    }
    
    if (!email) {
        showAuthMessage('Please enter your email');
        return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showAuthMessage('Please enter a valid email address');
        return;
    }

    // Show loading state
    const btn = sendOtpBtn || resendOtpBtn;
    if (btn) {
        btn.disabled = true;
        btn.textContent = '📤 Sending...';
    }

    try {
        const storage = await chrome.storage.local.get(['apiBaseUrl']);
        let apiUrl = storage.apiBaseUrl || API_CONFIG.BASE_URL;
        
        // Force use of production API
        if (!apiUrl || apiUrl.includes('localhost')) {
            apiUrl = API_CONFIG.BASE_URL;
        }

        const response = await fetch(`${apiUrl}/api/auth/send-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to send verification code');
        }

        // Show success and move to step 2
        showAuthMessage('Verification code sent to your email!', 'success');
        
        // Update email display
        document.getElementById('otp-email-display').textContent = email;
        
        // Switch to step 2
        document.getElementById('signup-step-1').style.display = 'none';
        document.getElementById('signup-step-2').style.display = 'block';
        
        // Focus on OTP input
        document.getElementById('otp-input').focus();

    } catch (error) {
        console.error('Send OTP error:', error);
        showAuthMessage(error.message || 'Failed to send verification code');

        if (sendOtpBtn) {
            sendOtpBtn.disabled = false;
            sendOtpBtn.textContent = '📧 Send Verification Code';
        }
    }
    
    // Reset button states
    if (sendOtpBtn) {
        sendOtpBtn.disabled = false;
        sendOtpBtn.textContent = '📧 Send Verification Code';
    }
    if (resendOtpBtn) {
        resendOtpBtn.disabled = false;
        resendOtpBtn.textContent = '🔄 Resend Code';
    }
}

// Handle Verify OTP
async function handleVerifyOTP() {
    const email = document.getElementById('signup-email').value.trim();
    const otp = document.getElementById('otp-input').value.trim();
    const verifyBtn = document.getElementById('verify-otp-btn');

    // Hide previous messages
    const authError = document.getElementById('auth-error');
    const authSuccess = document.getElementById('auth-success');
    if (authError) authError.style.display = 'none';
    if (authSuccess) authSuccess.style.display = 'none';

    if (!otp || otp.length !== 6) {
        showAuthMessage('Please enter the 6-digit verification code');
        return;
    }

    // Show loading state
    verifyBtn.disabled = true;
    verifyBtn.textContent = '🔄 Verifying...';

    try {
        const storage = await chrome.storage.local.get(['apiBaseUrl']);
        let apiUrl = storage.apiBaseUrl || API_CONFIG.BASE_URL;
        
        if (!apiUrl || apiUrl.includes('localhost')) {
            apiUrl = API_CONFIG.BASE_URL;
        }

        const response = await fetch(`${apiUrl}/api/auth/verify-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, otp }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Invalid verification code');
        }

        // OTP verified - move to step 3 (password)
        showAuthMessage('Email verified successfully!', 'success');
        
        document.getElementById('signup-step-2').style.display = 'none';
        document.getElementById('signup-step-3').style.display = 'block';
        
        // Focus on password input
        document.getElementById('signup-password').focus();

    } catch (error) {
        console.error('Verify OTP error:', error);
        showAuthMessage(error.message || 'Invalid verification code');

        verifyBtn.disabled = false;
        verifyBtn.textContent = '✓ Verify Code';
    }
}

// Handle website-based login (opens login page in new tab)
export async function handleWebsiteLogin() {
    try {
        const storage = await chrome.storage.local.get(['apiBaseUrl']);
        const apiUrl = storage.apiBaseUrl || API_CONFIG.BASE_URL;
        const loginUrl = `${apiUrl}/login`;

        // Open login page
        const tab = await chrome.tabs.create({ url: loginUrl });

        // Set up listener for successful login
        const checkLoginInterval = setInterval(async () => {
            const authStorage = await chrome.storage.local.get(['authToken']);
            if (authStorage.authToken) {
                clearInterval(checkLoginInterval);

                // Close login tab
                try {
                    await chrome.tabs.remove(tab.id);
                } catch (e) {
                    // Tab might already be closed
                }

                // Reload the popup
                location.reload();
            }
        }, 1000);

        // Stop checking after 5 minutes
        setTimeout(() => {
            clearInterval(checkLoginInterval);
        }, 300000);

    } catch (error) {
        console.error('Website login error:', error);
        showAuthMessage('Failed to open website login page');
    }
}

// Handle in-extension login
async function handleInExtensionLogin() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const loginBtn = document.getElementById('login-submit');

    // Hide previous messages
    const authError = document.getElementById('auth-error');
    const authSuccess = document.getElementById('auth-success');
    if (authError) authError.style.display = 'none';
    if (authSuccess) authSuccess.style.display = 'none';

    // Validate inputs
    if (!email || !password) {
        showAuthMessage('Please fill in all fields');
        return;
    }

    // Show loading state
    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in...';

    try {
        const storage = await chrome.storage.local.get(['apiBaseUrl']);
        let apiUrl = storage.apiBaseUrl || API_CONFIG.BASE_URL;
        
        // Force use of production API, never use localhost
        if (!apiUrl || apiUrl.includes('localhost')) {
            apiUrl = API_CONFIG.BASE_URL;
            console.log('🔧 Forcing production API URL for login:', apiUrl);
        }

        const response = await fetch(`${apiUrl}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Login failed');
        }

        // Store auth data
        await chrome.storage.local.set({
            authToken: data.token,
            refreshToken: data.refreshToken,
            userData: data.user,
            apiBaseUrl: apiUrl,
        });

        showAuthMessage('Login successful! Loading dashboard...', 'success');

        // Reload popup after successful login
        setTimeout(() => {
            location.reload();
        }, 1500);

    } catch (error) {
        console.error('Login error:', error);
        showAuthMessage(error.message || 'Login failed. Please try again.');

        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
    }
}

// Handle in-extension signup
async function handleInExtensionSignup() {
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const signupBtn = document.getElementById('signup-submit');

    // Hide previous messages
    const authError = document.getElementById('auth-error');
    const authSuccess = document.getElementById('auth-success');
    if (authError) authError.style.display = 'none';
    if (authSuccess) authSuccess.style.display = 'none';

    // Validate inputs
    if (!name || !email || !password) {
        showAuthMessage('Please fill in all fields');
        return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showAuthMessage('Please enter a valid email address');
        return;
    }

    if (password.length < 8) {
        showAuthMessage('Password must be at least 8 characters');
        return;
    }

    // Show loading state
    signupBtn.disabled = true;
    signupBtn.textContent = 'Creating account...';

    try {
        const storage = await chrome.storage.local.get(['apiBaseUrl']);
        let apiUrl = storage.apiBaseUrl || API_CONFIG.BASE_URL;
        
        // Force use of production API, never use localhost
        if (!apiUrl || apiUrl.includes('localhost')) {
            apiUrl = API_CONFIG.BASE_URL;
            console.log('🔧 Forcing production API URL for signup:', apiUrl);
        }

        const response = await fetch(`${apiUrl}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Registration failed');
        }

        // Store auth data
        await chrome.storage.local.set({
            authToken: data.token,
            refreshToken: data.refreshToken,
            userData: data.user,
            apiBaseUrl: apiUrl,
        });

        showAuthMessage('Account created successfully! Loading dashboard...', 'success');

        // Reload popup after successful signup
        setTimeout(() => {
            location.reload();
        }, 1500);

    } catch (error) {
        console.error('Signup error:', error);

        // Try to extract meaningful error message
        let errorMessage = 'Registration failed. Please try again.';
        if (error.message) {
            errorMessage = error.message;
        }

        showAuthMessage(errorMessage);

        signupBtn.disabled = false;
        signupBtn.textContent = 'Create Account';
    }
}

// Show authentication messages
function showAuthMessage(message, type = 'error') {
    const errorDiv = document.getElementById('auth-error');
    const successDiv = document.getElementById('auth-success');

    if (type === 'error') {
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
        if (successDiv) successDiv.style.display = 'none';
    } else {
        if (successDiv) {
            successDiv.textContent = message;
            successDiv.style.display = 'block';
        }
        if (errorDiv) errorDiv.style.display = 'none';
    }
}

// Refresh user data from backend
export async function refreshUserData() {
    try {
        const storage = await chrome.storage.local.get(['authToken', 'apiBaseUrl']);
        const token = storage.authToken;
        const apiUrl = storage.apiBaseUrl || API_CONFIG.BASE_URL;

        if (!token) return;

        const response = await fetch(`${apiUrl}/api/auth/validate`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success && data.user) {
            // Update stored user data
            await chrome.storage.local.set({
                userData: data.user
            });

            console.log('User data refreshed:', data.user);

            // Update UI
            if (elements.accountPlan && data.user.plan) {
                elements.accountPlan.textContent = data.user.plan.name || 'Free';
            }

            if (data.user.plan) {
                updatePlanLimitsDisplay({
                    monthlyComments: data.user.plan.monthlyComments || 300,
                    monthlyLikes: data.user.plan.monthlyLikes || 600,
                    monthlyShares: data.user.plan.monthlyShares || 150,
                    monthlyFollows: data.user.plan.monthlyFollows || 300,
                    aiPostsPerMonth: data.user.plan.aiPostsPerMonth || 60
                });
            }
        }
    } catch (error) {
        console.error('Error refreshing user data:', error);
    }
}

// Update plan features display in Settings tab
function updateFeaturesDisplay(plan) {
    if (!plan) return;
    
    const featuresIncluded = document.getElementById('features-included');
    const featuresNotIncluded = document.getElementById('features-not-included');
    
    if (!featuresIncluded || !featuresNotIncluded) return;
    
    const allFeatures = [
        { name: 'General Automation', key: 'allowAutomation' },
        { name: 'AI Comment Generation', key: 'allowAiCommentGeneration' },
        { name: 'AI Post Generation', key: 'allowAiPostGeneration' },
        { name: 'AI Topic Lines', key: 'allowAiTopicLines' },
        { name: 'Post Scheduling', key: 'allowPostScheduling' },
        { name: 'Automation Scheduling', key: 'allowAutomationScheduling' },
        { name: 'Networking Features', key: 'allowNetworking' },
        { name: 'Network Scheduling', key: 'allowNetworkScheduling' },
        { name: 'CSV Export', key: 'allowCsvExport' },
        { name: 'Import Profiles Auto Engagement', key: 'allowImportProfiles' },
    ];
    
    const included = allFeatures.filter(f => plan[f.key] !== false);
    const notIncluded = allFeatures.filter(f => plan[f.key] === false);
    
    // Display included features
    if (included.length > 0) {
        featuresIncluded.innerHTML = included.map(f => 
            `<div style="padding: 6px 0; border-bottom: 1px solid #f0f0f0;">
                <span style="color: #28a745; marginRight: 8px; fontWeight: bold;">✓</span>
                ${f.name}
            </div>`
        ).join('');
    } else {
        featuresIncluded.innerHTML = '<div style="padding: 8px; background: #f8f9fa; border-radius: 6px; color: #999;">No features available in this plan</div>';
    }
    
    // Display not included features
    if (notIncluded.length > 0) {
        featuresNotIncluded.innerHTML = notIncluded.map(f => 
            `<div style="padding: 6px 0; border-bottom: 1px solid #f0f0f0; color: #999;">
                <span style="color: #dc3545; marginRight: 8px; fontWeight: bold;">✗</span>
                ${f.name}
                <span style="fontSize: 10px; marginLeft: 8px; color: #ffc107; cursor: pointer;" onclick="document.getElementById('upgrade-plan-btn').click();">⬆️ Upgrade</span>
            </div>`
        ).join('');
    } else {
        featuresNotIncluded.innerHTML = '<div style="padding: 8px; background: #d4edda; border-radius: 6px; color: #28a745;">🎉 You have access to all features!</div>';
    }
}

// Update the authentication UI based on login status
export async function updateAuthenticationUI() {
    console.log('=== UPDATE AUTHENTICATION UI CALLED ===');
    try {
        const storage = await chrome.storage.local.get(['authToken', 'userData', 'apiBaseUrl']);
        const isLoggedIn = !!storage.authToken;
        const userData = storage.userData || {};

        console.log('Authentication UI Update:');
        console.log('- Is Logged In:', isLoggedIn);
        console.log('- Has User Data:', !!userData);
        console.log('- User Data:', userData);
        console.log('- Token exists:', !!storage.authToken);

        // Get elements directly since the elements variable might not be available
        const accountStatus = document.getElementById('account-status');
        const accountPlan = document.getElementById('account-plan');
        const accountEmail = document.getElementById('account-email');
        const headerPlanName = document.getElementById('header-plan-name');
        const loginSection = document.getElementById('login-section');
        const logoutSection = document.getElementById('logout-section');
        const planLimitComments = document.getElementById('plan-limit-comments');
        const planLimitLikes = document.getElementById('plan-limit-likes');
        const planLimitShares = document.getElementById('plan-limit-shares');
        const planLimitFollows = document.getElementById('plan-limit-follows');
        const planLimitConnections = document.getElementById('plan-limit-connections');
        const planLimitAiPosts = document.getElementById('plan-limit-ai-posts');
        const planLimitAiComments = document.getElementById('plan-limit-ai-comments');
        const planLimitAiTopics = document.getElementById('plan-limit-ai-topics');

        // Update status display
        if (accountStatus) {
            accountStatus.textContent = isLoggedIn ? 'Logged In' : 'Not Logged In';
        }

        // Show/hide appropriate sections
        if (loginSection && logoutSection) {
            loginSection.style.display = isLoggedIn ? 'none' : 'block';
            logoutSection.style.display = isLoggedIn ? 'block' : 'none';
        }

        if (isLoggedIn) {
            // Check if we have cached user data (15 min cache)
            const USERDATA_CACHE_DURATION = 15 * 60 * 1000;
            const { userDataCache, userDataCacheTimestamp } = await chrome.storage.local.get([
                'userDataCache',
                'userDataCacheTimestamp'
            ]);
            
            let validateData = null;
            
            if (userDataCache && userDataCacheTimestamp) {
                const cacheAge = Date.now() - userDataCacheTimestamp;
                if (cacheAge < USERDATA_CACHE_DURATION) {
                    console.log(`⚡ Using cached user data (age: ${Math.round(cacheAge / 1000)}s)`);
                    validateData = userDataCache;
                }
            }
            
            // Fetch fresh user data only if cache miss/expired
            if (!validateData) {
                try {
                    const apiUrl = storage.apiBaseUrl || API_CONFIG.BASE_URL;
                    
                    console.log('Fetching fresh user data from backend...');
                    const validateResponse = await fetch(`${apiUrl}/api/auth/validate`, {
                        headers: {
                            'Authorization': `Bearer ${storage.authToken}`
                        }
                    });
                    
                    if (validateResponse.ok) {
                        validateData = await validateResponse.json();
                        console.log('📊 Validate API Response:', validateData);
                        
                        // Cache the result
                        await chrome.storage.local.set({
                            userDataCache: validateData,
                            userDataCacheTimestamp: Date.now()
                        });
                        console.log('💾 Cached user data for 15 minutes');
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            }
            
            // Use validateData (from cache or fresh)
            if (validateData && validateData.success && validateData.user) {
                console.log('👤 User data:', validateData.user);
                console.log('📋 User plan:', validateData.user.plan);
                
                // Update stored userData with fresh data from backend
                await chrome.storage.local.set({
                    userData: validateData.user
                });
                console.log('💾 Updated stored userData with fresh backend data');
                
                // Update email
                if (accountEmail && validateData.user.email) {
                    accountEmail.textContent = validateData.user.email;
                    console.log('✅ Email updated:', validateData.user.email);
                }
                
                if (validateData.user.plan && validateData.user.plan.name) {
                    // Update plan name in Settings
                    if (accountPlan) {
                        accountPlan.textContent = validateData.user.plan.name || 'Free';
                    }
                    // Update plan name in Header badge
                    if (headerPlanName) {
                        headerPlanName.textContent = validateData.user.plan.name || 'Free';
                    }
                    console.log('✅ Plan name updated from backend:', validateData.user.plan.name);
                    
                    // Update plan limits from user.plan
                    if (planLimitComments) planLimitComments.textContent = validateData.user.plan.monthlyComments || '--';
                    if (planLimitLikes) planLimitLikes.textContent = validateData.user.plan.monthlyLikes || '--';
                    if (planLimitShares) planLimitShares.textContent = validateData.user.plan.monthlyShares || '--';
                    if (planLimitFollows) planLimitFollows.textContent = validateData.user.plan.monthlyFollows || '--';
                    if (planLimitConnections) planLimitConnections.textContent = validateData.user.plan.monthlyConnections || '--';
                    if (planLimitAiPosts) planLimitAiPosts.textContent = validateData.user.plan.aiPostsPerMonth || '--';
                    if (planLimitAiComments) planLimitAiComments.textContent = validateData.user.plan.aiCommentsPerMonth || '--';
                    if (planLimitAiTopics) planLimitAiTopics.textContent = validateData.user.plan.aiTopicLinesPerMonth || '--';
                    console.log('✅ Settings plan limits updated from backend:', validateData.user.plan);
                    
                    // Update features display
                    updateFeaturesDisplay(validateData.user.plan);
                } else {
                    console.warn('⚠️ No plan data found in user object');
                    if (accountPlan) {
                        accountPlan.textContent = 'No Plan';
                    }
                    if (headerPlanName) {
                        headerPlanName.textContent = 'No Plan';
                    }
                }
            } else if (userData.email) {
                // Fallback to stored userData if no fresh data
                if (accountEmail) {
                    accountEmail.textContent = userData.email;
                }
                if (userData.plan) {
                    if (accountPlan) accountPlan.textContent = userData.plan.name || 'Free';
                    if (headerPlanName) headerPlanName.textContent = userData.plan.name || 'Free';
                    if (planLimitComments) planLimitComments.textContent = userData.plan.monthlyComments || '--';
                    if (planLimitLikes) planLimitLikes.textContent = userData.plan.monthlyLikes || '--';
                    if (planLimitShares) planLimitShares.textContent = userData.plan.monthlyShares || '--';
                    if (planLimitFollows) planLimitFollows.textContent = userData.plan.monthlyFollows || '--';
                    if (planLimitConnections) planLimitConnections.textContent = userData.plan.monthlyConnections || '--';
                    if (planLimitAiPosts) planLimitAiPosts.textContent = userData.plan.aiPostsPerMonth || '--';
                    if (planLimitAiComments) planLimitAiComments.textContent = userData.plan.aiCommentsPerMonth || '--';
                    if (planLimitAiTopics) planLimitAiTopics.textContent = userData.plan.aiTopicLinesPerMonth || '--';
                }
                
                // Update features display
                updateFeaturesDisplay(userData.plan || validateData?.user?.plan);
            }
        } else {
            // Show that user needs to login - NO DEFAULT LIMITS
            if (accountPlan) {
                accountPlan.textContent = 'Login Required';
            }
            if (headerPlanName) {
                headerPlanName.textContent = 'Free';
            }
            if (accountEmail) {
                accountEmail.textContent = 'Not logged in';
            }

            if (planLimitComments) planLimitComments.textContent = '--';
            if (planLimitLikes) planLimitLikes.textContent = '--';
            if (planLimitShares) planLimitShares.textContent = '--';
            if (planLimitFollows) planLimitFollows.textContent = '--';
            if (planLimitConnections) planLimitConnections.textContent = '--';
            if (planLimitAiPosts) planLimitAiPosts.textContent = '--';
            if (planLimitAiComments) planLimitAiComments.textContent = '--';
            if (planLimitAiTopics) planLimitAiTopics.textContent = '--';
        }
    } catch (error) {
        console.error('Error updating authentication UI:', error);
    }
}

// Prevent multiple simultaneous calls
let isLoadingPlans = false;

// Load available plans from backend with caching
export async function loadPlans() {
    // Prevent multiple simultaneous calls
    if (isLoadingPlans) {
        console.log('⚠️ loadPlans already in progress, skipping...');
        return;
    }
    
    isLoadingPlans = true;
    console.log('Loading plans...');
    
    try {
        // Get elements directly
        const plansLoading = document.getElementById('plans-loading');
        const plansError = document.getElementById('plans-error');
        const plansContainer = document.getElementById('plans-container');

        const storage = await chrome.storage.local.get(['apiBaseUrl', 'cachedPlans', 'plansCacheTime']);
        const apiUrl = storage.apiBaseUrl || API_CONFIG.BASE_URL;

        // Clear any old cached plans to force fresh API call
        await chrome.storage.local.remove(['cachedPlans', 'plansCacheTime', 'fallbackPlans']);

        // Show loading state
        if (plansLoading) plansLoading.style.display = 'block';
        if (plansError) plansError.style.display = 'none';
        if (plansContainer) plansContainer.style.display = 'none';

        // Fetch plans directly from API
        
        const response = await fetch(`${apiUrl}/api/plans`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();

        if (data.success && data.plans) {
            console.log('✅ Plans loaded:', data.plans.length, 'plans');
            
            displayPlans(data.plans);
            
            if (plansLoading) plansLoading.style.display = 'none';
            if (plansContainer) plansContainer.style.display = 'grid';
        } else {
            console.error('API response missing success or plans:', data);
            throw new Error(data.error || 'API response missing plans data');
        }
    } catch (error) {
        console.error('❌ Error loading plans:', error.message);
        
        const plansLoading = document.getElementById('plans-loading');
        const plansError = document.getElementById('plans-error');
        const plansContainer = document.getElementById('plans-container');
        
        if (plansLoading) plansLoading.style.display = 'none';
        if (plansError) {
            plansError.style.display = 'block';
            plansError.innerHTML = `
                <div style="color: #dc3545; text-align: center; padding: 20px;">
                    <h4>❌ Failed to Load Plans</h4>
                    <p>Error: ${error.message}</p>
                    <p>API URL: ${apiUrl}/api/plans</p>
                    <button id="retry-plans" style="margin-top: 10px; padding: 8px 16px; background: #693fe9; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        🔄 Retry
                    </button>
                </div>
            `;
            
            // Add retry functionality
            document.getElementById('retry-plans')?.addEventListener('click', loadPlans);
        }
        if (plansContainer) plansContainer.style.display = 'none';
        
        showNotification(`❌ Failed to load plans: ${error.message}`, 'error');
    } finally {
        isLoadingPlans = false;
    }
}

// Display plans in the modal - SHOWING LIFETIME DEALS ONLY
async function displayPlans(plans) {
    const plansContainer = document.getElementById('plans-container');
    if (!plansContainer) {
        console.error('Plans container not found');
        return;
    }

    plansContainer.innerHTML = '';
    
    // Get user's current plan from backend API
    let userCurrentPlanName = null;
    try {
        const storage = await chrome.storage.local.get(['authToken', 'apiBaseUrl']);
        if (storage.authToken) {
            const apiUrl = storage.apiBaseUrl || API_CONFIG.BASE_URL;
            const response = await fetch(`${apiUrl}/api/auth/validate`, {
                headers: { 'Authorization': `Bearer ${storage.authToken}` }
            });
            const data = await response.json();
            if (data.success && data.user && data.user.plan) {
                userCurrentPlanName = data.user.plan.name;
                console.log('User current plan from API:', userCurrentPlanName);
            }
        }
    } catch (error) {
        console.error('Error fetching user plan:', error);
    }

    // LIFETIME DEALS ONLY - Filter for lifetime plans
    const lifetimeDeals = plans.filter(plan => plan.isLifetime === true);
    
    /* MONTHLY PLANS COMMENTED OUT - Uncomment to show monthly plans again
    const paidPlans = plans.filter(plan => {
        const planName = plan.name.toLowerCase();
        return planName !== 'free' && planName !== 'free trial' && !planName.includes('free trial') && !plan.isLifetime;
    });
    */
    
    // If no lifetime deals found, show message
    if (lifetimeDeals.length === 0) {
        plansContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; grid-column: 1 / -1;">
                <p style="color: #666; margin-bottom: 20px;">Loading lifetime deals...</p>
                <a href="https://kommentify.com/plans" target="_blank" style="
                    display: inline-block;
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #f59e0b, #ef4444);
                    color: white;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: bold;
                ">View Lifetime Deals →</a>
            </div>
        `;
        return;
    }
    
    // Add header for lifetime deals
    const header = document.createElement('div');
    header.style.cssText = 'grid-column: 1 / -1; text-align: center; margin-bottom: 20px;';
    header.innerHTML = `
        <div style="display: inline-block; background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(239, 68, 68, 0.1)); border: 1px solid rgba(245, 158, 11, 0.4); padding: 8px 20px; border-radius: 20px; color: #f59e0b; font-weight: 600; margin-bottom: 10px;">
            🔥 LIMITED TIME — Pay Once, Use Forever
        </div>
    `;
    plansContainer.appendChild(header);
    
    lifetimeDeals.forEach((plan, index) => {
        const isCurrentPlan = userCurrentPlanName && plan.name.toLowerCase() === userCurrentPlanName.toLowerCase();
        const isPopular = plan.popular || plan.name.toLowerCase().includes('growth');
        const planCard = document.createElement('div');
        
        // Calculate savings (assuming yearly equivalent)
        const yearlyCost = plan.price * 12;
        const savings = yearlyCost - (plan.lifetimePrice || plan.price);
        
        planCard.style.cssText = `
            border: 2px solid ${isCurrentPlan ? '#28a745' : (isPopular ? '#f59e0b' : 'rgba(255,255,255,0.1)')};
            border-radius: 16px;
            padding: 24px;
            text-align: center;
            transition: all 0.3s;
            cursor: pointer;
            background: ${isPopular ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(239, 68, 68, 0.05))' : 'rgba(255,255,255,0.02)'};
            ${isPopular ? 'transform: scale(1.02); box-shadow: 0 10px 40px rgba(245, 158, 11, 0.2);' : ''}
            ${isCurrentPlan ? 'box-shadow: 0 4px 12px rgba(40, 167, 69, 0.2);' : ''}
            position: relative;
        `;

        const features = plan.features || {};
        const limits = plan.limits || {};
        const lifetimePrice = plan.lifetimePrice || plan.price;
        
        // Get spots info
        const spotsRemaining = plan.lifetimeSpotsRemaining || plan.lifetimeMaxSpots - (plan.lifetimeSoldSpots || 0);

        planCard.innerHTML = `
            ${isPopular && !isCurrentPlan ? '<div style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; padding: 6px 16px; border-radius: 20px; font-size: 11px; font-weight: 700; white-space: nowrap;">🔥 MOST POPULAR</div>' : ''}
            ${isCurrentPlan ? '<div style="background: #28a745; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-bottom: 10px;">✓ CURRENT PLAN</div>' : ''}
            
            <h3 style="color: ${isPopular ? '#fbbf24' : '#693fe9'}; margin-bottom: 5px; margin-top: ${isPopular ? '10px' : '0'}; font-size: 20px;">${plan.name}</h3>
            <div style="font-size: 12px; color: #888; margin-bottom: 12px;">One-time payment</div>
            
            <div style="font-size: 14px; text-decoration: line-through; color: #888; margin-bottom: 4px;">$${(lifetimePrice * 12).toFixed(0)}/year</div>
            <div style="font-size: 36px; font-weight: 800; color: ${isPopular ? '#fbbf24' : '#693fe9'}; margin-bottom: 4px;">
                $${lifetimePrice}
            </div>
            <div style="font-size: 14px; color: #888; margin-bottom: 8px;">once</div>
            <div style="display: inline-block; background: #22c55e; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 16px;">Save $${((lifetimePrice * 12) - lifetimePrice).toFixed(0)}</div>
            
            ${spotsRemaining ? `<div style="font-size: 12px; color: #f59e0b; margin-bottom: 12px;">⚠️ Only ${spotsRemaining} spots remaining</div>` : ''}
            
            <div style="text-align: left; margin-bottom: 15px; font-size: 13px; border-top: 1px solid rgba(0,0,0,0.1); padding-top: 15px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                    <div>💭 ${limits.aiComments || limits.aiCommentsPerMonth || 0} AI Comments/mo</div>
                    <div>🤖 ${limits.aiPosts || limits.aiPostsPerMonth || 0} AI Posts/mo</div>
                    <div>❤️ ${limits.likes || limits.monthlyLikes || 0} Auto Likes</div>
                    <div>📤 ${limits.shares || limits.monthlyShares || 0} Auto Shares</div>
                    <div>👥 ${limits.follows || limits.monthlyFollows || 0} Auto Follows</div>
                    <div>🔗 ${limits.connections || limits.monthlyConnections || 0} Connections</div>
                </div>
            </div>
            
            <div style="text-align: left; margin-bottom: 16px; font-size: 13px;">
                <div style="color: #10b981;">✅ Lifetime Updates</div>
                <div style="color: #10b981;">✅ Priority Support</div>
                <div style="color: #10b981;">✅ 30-Day Money-Back</div>
            </div>
            
            <button style="
                width: 100%;
                padding: 12px;
                background: ${isCurrentPlan ? '#28a745' : (isPopular ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'linear-gradient(135deg, #693fe9, #8b5cf6)')};
                color: white;
                border: none;
                border-radius: 10px;
                font-weight: bold;
                cursor: pointer;
                font-size: 14px;
                ${isCurrentPlan ? 'opacity: 0.8;' : ''}
            " class="select-plan-btn" data-plan-id="${plan.id}" data-stripe-link="${plan.stripeLink || ''}" ${isCurrentPlan ? 'disabled' : ''}>
                ${isCurrentPlan ? 'Current Plan' : '🚀 Get Lifetime Access'}
            </button>
        `;

        planCard.addEventListener('mouseenter', () => {
            if (!isPopular) {
                planCard.style.borderColor = '#693fe9';
                planCard.style.transform = 'translateY(-2px)';
            }
        });

        planCard.addEventListener('mouseleave', () => {
            if (!isPopular) {
                planCard.style.borderColor = 'rgba(255,255,255,0.1)';
                planCard.style.transform = 'translateY(0)';
            }
        });

        const btn = planCard.querySelector('.select-plan-btn');
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            selectPlan(plan.id, plan.stripeLink || '');
        });

        plansContainer.appendChild(planCard);
    });
    
    // Add footer
    const footer = document.createElement('div');
    footer.style.cssText = 'grid-column: 1 / -1; text-align: center; margin-top: 20px; display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;';
    footer.innerHTML = `
        <span style="color: #888; font-size: 12px;">✅ 30-Day Money-Back</span>
        <span style="color: #888; font-size: 12px;">✅ One-Time Payment</span>
        <span style="color: #888; font-size: 12px;">✅ Lifetime Updates</span>
    `;
    plansContainer.appendChild(footer);
}

// Handle plan selection
export function selectPlan(planId, stripeLink) {
    // Always open the plans page URL
    const plansUrl = 'https://kommentify.com/plans';
    chrome.tabs.create({ url: plansUrl });
    if (elements.planModal) elements.planModal.style.display = 'none';
}

// Update plan limits display
function updatePlanLimitsDisplay(limits) {
    if (elements.planLimitComments) elements.planLimitComments.textContent = limits.monthlyComments || '--';
    if (elements.planLimitLikes) elements.planLimitLikes.textContent = limits.monthlyLikes || '--';
    if (elements.planLimitShares) elements.planLimitShares.textContent = limits.monthlyShares || '--';
    if (elements.planLimitFollows) elements.planLimitFollows.textContent = limits.monthlyFollows || '--';
    if (elements.planLimitConnections) elements.planLimitConnections.textContent = limits.monthlyConnections || '--';
    if (elements.planLimitAiPosts) elements.planLimitAiPosts.textContent = limits.aiPostsPerMonth || '--';
    if (elements.planLimitAiComments) elements.planLimitAiComments.textContent = limits.aiCommentsPerMonth || '--';
    if (elements.planLimitAiTopics) elements.planLimitAiTopics.textContent = limits.aiTopicLinesPerMonth || '--';
}

// Load and display user's plan information
export async function loadUserPlan() {
    try {
        const storage = await chrome.storage.local.get(['userData', 'authToken', 'apiBaseUrl']);
        const userData = storage.userData;
        const token = storage.authToken;
        const apiUrl = storage.apiBaseUrl || API_CONFIG.BASE_URL;

        if (!token || !userData) {
            console.error('No user data found');
            return;
        }

        // Fetch fresh user data from backend to get latest plan info
        const response = await fetch(`${apiUrl}/api/usage/daily`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            const plan = userData.plan || data.plan;
            const limits = data.limits;

            // Update plan display
            if (elements.accountPlan) {
                elements.accountPlan.textContent = plan.name || 'Free';
            }

            // Update plan limits display
            updatePlanLimitsDisplay({
                monthlyComments: limits.comments || 1500,
                monthlyLikes: limits.likes || 3000,
                monthlyShares: limits.shares || 600,
                monthlyFollows: limits.follows || 1500,
                aiPostsPerMonth: limits.aiPosts || 300
            });

            // Update max values in Limits tab
            if (document.getElementById('max-comments-plan')) {
                document.getElementById('max-comments-plan').textContent = limits.comments || 50;
            }
            if (document.getElementById('max-likes-plan')) {
                document.getElementById('max-likes-plan').textContent = limits.likes || 100;
            }
            if (document.getElementById('max-shares-plan')) {
                document.getElementById('max-shares-plan').textContent = limits.shares || 20;
            }
            if (document.getElementById('max-follows-plan')) {
                document.getElementById('max-follows-plan').textContent = limits.follows || 50;
            }

            // Enforce plan limits on input fields with improved validation
            enforcePlanLimits(limits);
            
            // Make function globally available for other modules
            window.enforcePlanLimitsGlobal = enforcePlanLimits;
        }
    } catch (error) {
        console.error('Error loading user plan:', error);
    }
}

/**
 * Enforce plan limits on input fields with real-time validation
 */
export function enforcePlanLimits(limits) {
    const inputConfigs = [
        { 
            id: 'daily-comment-limit-input', 
            limit: limits.comments || 5, 
            type: 'comments',
            warningId: 'comment-limit-warning'
        },
        { 
            id: 'daily-like-limit-input', 
            limit: limits.likes || 10, 
            type: 'likes',
            warningId: 'like-limit-warning'
        },
        { 
            id: 'daily-share-limit-input', 
            limit: limits.shares || 5, 
            type: 'shares',
            warningId: 'share-limit-warning'
        },
        { 
            id: 'daily-follow-limit-input', 
            limit: limits.follows || 5, 
            type: 'follows',
            warningId: 'follow-limit-warning'
        }
    ];

    inputConfigs.forEach(config => {
        const input = document.getElementById(config.id);
        if (!input) return;

        // Remove any existing event listeners to prevent duplicates
        const newInput = input.cloneNode(true);
        input.parentNode.replaceChild(newInput, input);

        // Set max attribute and current value constraint
        newInput.max = config.limit;
        
        // If current value exceeds limit, set to limit
        if (parseInt(newInput.value) > config.limit) {
            newInput.value = config.limit;
        }

        // Create or update warning element
        let warningElement = document.getElementById(config.warningId);
        if (!warningElement) {
            warningElement = document.createElement('div');
            warningElement.id = config.warningId;
            warningElement.style.cssText = 'color: #dc3545; font-size: 12px; margin-top: 3px; display: none;';
            newInput.parentNode.appendChild(warningElement);
        }

        // Real-time validation on input
        newInput.addEventListener('input', function() {
            const value = parseInt(this.value);
            
            if (isNaN(value) || value < 0) {
                this.value = 0;
                warningElement.style.display = 'none';
                return;
            }
            
            if (value > config.limit) {
                this.value = config.limit;
                warningElement.textContent = `⚠️ Plan limit: ${config.limit} ${config.type}/day. Upgrade for higher limits!`;
                warningElement.style.display = 'block';
                
                // Show upgrade modal after a short delay
                setTimeout(() => {
                    if (elements.planModal) {
                        elements.planModal.style.display = 'flex';
                    }
                }, 1000);
            } else {
                warningElement.style.display = 'none';
            }
        });

        // Validation on change (when user leaves the field)
        newInput.addEventListener('change', function() {
            const value = parseInt(this.value);
            
            if (isNaN(value) || value < 0) {
                this.value = 0;
            } else if (value > config.limit) {
                this.value = config.limit;
                warningElement.textContent = `⚠️ Plan limit: ${config.limit} ${config.type}/day. Upgrade for higher limits!`;
                warningElement.style.display = 'block';
            }
        });

        // Prevent pasting values above limit
        newInput.addEventListener('paste', function(e) {
            setTimeout(() => {
                const value = parseInt(this.value);
                if (value > config.limit) {
                    this.value = config.limit;
                    warningElement.textContent = `⚠️ Plan limit: ${config.limit} ${config.type}/day. Upgrade for higher limits!`;
                    warningElement.style.display = 'block';
                }
            }, 0);
        });
    });
}

// Upgrade to plan
export function upgradeToPlan(planId, stripeLink) {
    if (stripeLink && stripeLink !== '') {
        // Open Stripe payment link in new tab
        window.open(stripeLink, '_blank');
    } else {
        alert('Please contact support to upgrade to this plan.');
    }
}

// Show plan modal - Updated to open plans page in new tab
export async function showPlanModal() {
    console.log('⬆️ Opening upgrade plans page');

    try {
        const storage = await chrome.storage.local.get(['apiBaseUrl']);
        const apiUrl = storage.apiBaseUrl || API_CONFIG.BASE_URL;
        const plansUrl = `${apiUrl}/plans`;

        // Open plans page in new tab
        await chrome.tabs.create({ url: plansUrl });
        console.log('🌐 Opened plans page:', plansUrl);

    } catch (error) {
        console.error('❌ Error opening plans page:', error);
        // Fallback to alert
        alert('🔗 Visit the website to view upgrade plans:\nhttps://kommentify.com/plans');
    }
}

// Hide plan modal
export function hidePlanModal() {
    const modal = document.getElementById('plan-modal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

export async function handleLogin() {
    try {
        const storage = await chrome.storage.local.get(['apiBaseUrl']);
        const apiUrl = storage.apiBaseUrl || API_CONFIG.BASE_URL;
        const loginUrl = `${apiUrl}/login`;

        await chrome.tabs.create({ url: loginUrl });
    } catch (error) {
        console.error('Error handling login:', error);
    }
}

export async function handleLogout() {
    try {
        await chrome.storage.local.remove([
            'authToken', 
            'userData', 
            'tokenValidationCache', 
            'tokenValidationTimestamp',
            'userDataCache',
            'userDataCacheTimestamp'
        ]);
        updateAuthenticationUI();
        alert('Logged out successfully');
    } catch (error) {
        console.error('Error handling logout:', error);
    }
}

// Check and show upgrade prompts
export function checkAndShowUpgradePrompts(usage, limits, features) {
    // Check if any limit is reached
    const limitsReached = [];

    if (usage.comments >= limits.comments) limitsReached.push('comments');
    if (usage.likes >= limits.likes) limitsReached.push('likes');
    if (usage.shares >= limits.shares) limitsReached.push('shares');
    if (usage.follows >= limits.follows) limitsReached.push('follows');

    // Show upgrade banner if limits reached
    if (limitsReached.length > 0) {
        showUpgradeBanner(limitsReached);
    }

    // Disable features not available in plan
    if (!features.postScheduling) {
        const scheduleBtn = document.getElementById('schedule-post');
        if (scheduleBtn) {
            scheduleBtn.disabled = true;
            scheduleBtn.title = 'Upgrade to Pro for post scheduling';
        }
    }

    if (!features.networking) {
        const networkingBtn = document.getElementById('start-people-search');
        if (networkingBtn) {
            networkingBtn.disabled = true;
            networkingBtn.title = 'Upgrade to Pro for networking features';
        }
    }
}

// Show upgrade banner
function showUpgradeBanner(limitsReached) {
    const banner = document.createElement('div');
    banner.style.cssText = `
            position: fixed;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #693fe9 0%, #693fe9 100%);
            color: white;
            padding: 15px 25px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 10000;
            font-size: 14px;
            text-align: center;
            max-width: 400px;
        `;

    banner.innerHTML = `
            <strong>⚠️ Daily Limit Reached</strong><br>
            You've reached your daily limit for: ${limitsReached.join(', ')}<br>
            <button style="
                margin-top: 10px;
                padding: 8px 20px;
                background: white;
                color: #693fe9;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
            " onclick="alert('Visit our website to upgrade your plan!')">
                Upgrade Plan
            </button>
        `;

    document.body.appendChild(banner);

    // Auto-remove after 10 seconds
    setTimeout(() => banner.remove(), 10000);
}
