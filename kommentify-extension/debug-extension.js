/**
 * DEBUG SCRIPT FOR EXTENSION INITIALIZATION
 * Use this to test the extension loading without backend dependencies
 */

console.log('🔧 DEBUG: Starting extension debug session...');

// Clear any problematic storage data first
async function clearAndSetDebugData() {
    try {
        // Clear everything
        await chrome.storage.local.clear();
        console.log('🧹 Cleared all storage');

        // Set minimal test data
        await chrome.storage.local.set({
            authToken: 'debug.test.token',  // Simple test token
            userData: {
                id: 'debug-user',
                email: 'debug@test.com', 
                name: 'Debug User',
                plan: { name: 'Debug Plan' }
            },
            apiBaseUrl: 'https://kommentify.com'
        });
        
        console.log('✅ Set debug auth data');
        
        // Now try to initialize
        if (window.UI && window.UI.initializePopup) {
            console.log('🚀 Calling UI.initializePopup()...');
            await window.UI.initializePopup();
        } else {
            console.error('❌ UI module not available');
        }
        
    } catch (error) {
        console.error('❌ Debug setup failed:', error);
    }
}

// Export for console use
window.debugExtension = clearAndSetDebugData;

console.log('✅ Debug script loaded. Call debugExtension() to test initialization.');
