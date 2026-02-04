/**
 * REGISTER SCRIPT
 * Handles user registration with OTP email verification
 */

// API Configuration
const API_URL = 'https://kommentify.com';

// State
let currentEmail = '';
let resendCooldown = 0;
let cooldownInterval = null;

// DOM Elements
const errorDiv = document.getElementById('error-message');
const successDiv = document.getElementById('success-message');
const stepSubtitle = document.getElementById('step-subtitle');

// Step Elements
const stepEmail = document.getElementById('step-email');
const stepOtp = document.getElementById('step-otp');
const stepDetails = document.getElementById('step-details');

// Progress Indicators
const stepIndicator1 = document.getElementById('step-indicator-1');
const stepIndicator2 = document.getElementById('step-indicator-2');
const stepIndicator3 = document.getElementById('step-indicator-3');

// Helper Functions
function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    successDiv.style.display = 'none';
}

function showSuccess(message) {
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    errorDiv.style.display = 'none';
}

function hideMessages() {
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
}

function goToStep(step) {
    // Hide all steps
    stepEmail.classList.remove('active');
    stepOtp.classList.remove('active');
    stepDetails.classList.remove('active');
    
    // Reset progress indicators
    stepIndicator1.classList.remove('active');
    stepIndicator2.classList.remove('active');
    stepIndicator3.classList.remove('active');
    
    hideMessages();
    
    switch(step) {
        case 1:
            stepEmail.classList.add('active');
            stepIndicator1.classList.add('active');
            stepSubtitle.textContent = 'Enter your email to get started';
            break;
        case 2:
            stepOtp.classList.add('active');
            stepIndicator1.classList.add('active');
            stepIndicator2.classList.add('active');
            stepSubtitle.textContent = `We sent a code to ${currentEmail}`;
            break;
        case 3:
            stepDetails.classList.add('active');
            stepIndicator1.classList.add('active');
            stepIndicator2.classList.add('active');
            stepIndicator3.classList.add('active');
            stepSubtitle.textContent = 'Complete your registration';
            document.getElementById('verified-email').value = currentEmail;
            break;
    }
}

function startResendCooldown() {
    resendCooldown = 60;
    const resendBtn = document.getElementById('resend-btn');
    resendBtn.disabled = true;
    
    if (cooldownInterval) clearInterval(cooldownInterval);
    
    cooldownInterval = setInterval(() => {
        resendCooldown--;
        if (resendCooldown <= 0) {
            clearInterval(cooldownInterval);
            resendBtn.disabled = false;
            resendBtn.textContent = 'Resend Code';
        } else {
            resendBtn.textContent = `Resend code in ${resendCooldown}s`;
        }
    }, 1000);
}

// Step 1: Send OTP
document.getElementById('email-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const sendOtpBtn = document.getElementById('send-otp-btn');
    
    if (!email) {
        showError('Please enter your email');
        return;
    }
    
    sendOtpBtn.disabled = true;
    sendOtpBtn.textContent = 'Sending...';
    hideMessages();
    
    try {
        const response = await fetch(`${API_URL}/api/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to send verification code');
        }
        
        currentEmail = email;
        showSuccess('Verification code sent to your email!');
        startResendCooldown();
        
        setTimeout(() => goToStep(2), 1000);
        
    } catch (error) {
        console.error('Send OTP error:', error);
        showError(error.message || 'Failed to send verification code');
    } finally {
        sendOtpBtn.disabled = false;
        sendOtpBtn.textContent = 'Send Verification Code';
    }
});

// Step 2: Verify OTP
document.getElementById('otp-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const otp = document.getElementById('otp').value.trim();
    const verifyOtpBtn = document.getElementById('verify-otp-btn');
    
    if (!otp || otp.length !== 6) {
        showError('Please enter the 6-digit code');
        return;
    }
    
    verifyOtpBtn.disabled = true;
    verifyOtpBtn.textContent = 'Verifying...';
    hideMessages();
    
    try {
        const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: currentEmail, otp }),
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Invalid verification code');
        }
        
        showSuccess('Email verified! Complete your registration.');
        setTimeout(() => goToStep(3), 1000);
        
    } catch (error) {
        console.error('Verify OTP error:', error);
        showError(error.message || 'Invalid verification code');
    } finally {
        verifyOtpBtn.disabled = false;
        verifyOtpBtn.textContent = 'Verify Code';
    }
});

// OTP input - only allow numbers
document.getElementById('otp').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
});

// Resend OTP
document.getElementById('resend-btn').addEventListener('click', async () => {
    if (resendCooldown > 0) return;
    
    const resendBtn = document.getElementById('resend-btn');
    resendBtn.disabled = true;
    hideMessages();
    
    try {
        const response = await fetch(`${API_URL}/api/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: currentEmail }),
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to resend code');
        }
        
        showSuccess('New verification code sent!');
        startResendCooldown();
        
    } catch (error) {
        console.error('Resend OTP error:', error);
        showError(error.message || 'Failed to resend code');
        resendBtn.disabled = false;
    }
});

// Change email button
document.getElementById('change-email-btn').addEventListener('click', () => {
    goToStep(1);
    document.getElementById('otp').value = '';
    if (cooldownInterval) clearInterval(cooldownInterval);
});

// Step 3: Complete Registration
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const password = document.getElementById('password').value;
    const registerBtn = document.getElementById('register-btn');
    
    if (!name) {
        showError('Please enter your name');
        return;
    }
    
    if (password.length < 8) {
        showError('Password must be at least 8 characters');
        return;
    }
    
    registerBtn.disabled = true;
    registerBtn.textContent = 'Creating account...';
    hideMessages();
    
    try {
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                name, 
                email: currentEmail, 
                password,
                emailVerified: true 
            }),
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
            apiBaseUrl: API_URL,
        });
        
        showSuccess('Account created successfully! Redirecting...');
        
        setTimeout(() => {
            window.location.href = 'popup.html';
        }, 1500);
        
    } catch (error) {
        console.error('Registration error:', error);
        showError(error.message || 'Registration failed. Please try again.');
        registerBtn.disabled = false;
        registerBtn.textContent = 'Create Account';
    }
});

// Check if already logged in
chrome.storage.local.get(['authToken'], (result) => {
    if (result.authToken) {
        window.location.href = 'popup.html';
    }
});
