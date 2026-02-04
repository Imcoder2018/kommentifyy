/**
 * LOGIN SCRIPT
 * Handles user authentication
 */

const API_URL = 'https://kommentify.com'; // Change to your Vercel URL after deployment

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('login-btn');
    const errorDiv = document.getElementById('error-message');
    const successDiv = document.getElementById('success-message');
    
    // Hide messages
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    
    // Validate
    if (!email || !password) {
        errorDiv.textContent = 'Please fill in all fields';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Disable button
    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in...';
    
    try {
        // Call backend API
        const response = await fetch(`${API_URL}/api/auth/login`, {
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
            apiBaseUrl: API_URL,
        });
        
        // Show success
        successDiv.textContent = 'Login successful! Redirecting...';
        successDiv.style.display = 'block';
        
        // Redirect to main popup
        setTimeout(() => {
            window.location.href = 'popup.html';
        }, 1000);
        
    } catch (error) {
        console.error('Login error:', error);
        errorDiv.textContent = error.message || 'Login failed. Please try again.';
        errorDiv.style.display = 'block';
        
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
    }
});

// Check if already logged in
chrome.storage.local.get(['authToken'], (result) => {
    if (result.authToken) {
        window.location.href = 'popup.html';
    }
});
