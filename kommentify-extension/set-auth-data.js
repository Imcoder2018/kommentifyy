// Script to manually set authentication data for testing
// Run this in the extension popup console
// NOTE: Replace these values with actual test user credentials

const AUTH_TOKEN = 'YOUR_AUTH_TOKEN_HERE'; // Replace with actual auth token
const USER_EMAIL = 'test@example.com'; // Replace with test user email
const API_BASE_URL = 'http://localhost:3000'; // Or 'https://kommentify.com' for production

const authData = {
    authToken: AUTH_TOKEN,
    userData: {
        id: 'user_test_id',
        email: USER_EMAIL,
        name: 'Test User',
        createdAt: new Date().toISOString(),
        plan: {
            id: 'free_plan',
            name: 'Free',
            price: 0,
            dailyComments: 10,
            dailyLikes: 20,
            dailyShares: 5,
            dailyFollows: 10,
            dailyConnections: 5,
            aiPostsPerDay: 2,
            aiCommentsPerDay: 10,
            allowAiPostGeneration: true,
            allowAiCommentGeneration: true,
            allowPostScheduling: false,
            allowAutomation: true,
            allowAutomationScheduling: false,
            allowNetworking: false,
            allowNetworkScheduling: false,
            allowCsvExport: false
        }
    },
    apiBaseUrl: API_BASE_URL
};

// Set the auth data
chrome.storage.local.set(authData, () => {
    console.log('Auth data set successfully!');
    console.log('Now call: initializePopup() to reload the extension');
});

// Function to test authentication UI update
async function testAuthUI() {
    console.log('Testing authentication UI...');
    await updateAuthenticationUI();
}

// Function to check storage
async function checkStorage() {
    const result = await chrome.storage.local.get(['authToken', 'userData', 'apiBaseUrl']);
    console.log('Current storage:', result);
}

console.log('Run these commands in the console:');
console.log('1. checkStorage() - Check current storage');
console.log('2. testAuthUI() - Test authentication UI update');
console.log('3. initializePopup() - Reinitialize the extension');
console.log('');
console.log('IMPORTANT: Edit this file and replace AUTH_TOKEN with a valid token before running!');
