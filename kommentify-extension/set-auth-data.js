// Script to manually set authentication data for testing
// Run this in the extension popup console

const authData = {
    authToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyXzE3NjQwMDQ1OTAxMzBfcDV1NTljNWhxIiwiZW1haWwiOiJ1aXRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE3NjQwMDQ1OTAsImV4cCI6MTc2NDYwOTM5MH0.N2aQk6dW4caPVRHnCJpqYElN_Da3NrU6CPI8kyaj5Qo',
    userData: {
        id: 'user_1764004590130_p5u59c5hq',
        email: 'uitest@example.com',
        name: 'UI Test User',
        createdAt: '2025-11-24T17:16:30.130Z',
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
    apiBaseUrl: 'https://kommentify.com'
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
