// Script to clear localhost API URLs from chrome storage
// This should be run in the extension's popup console

console.log('🧹 Clearing localhost API URLs from storage...');

// Check current storage
chrome.storage.local.get(['apiBaseUrl'], (result) => {
    console.log('Current apiBaseUrl in storage:', result.apiBaseUrl);
    
    if (result.apiBaseUrl && result.apiBaseUrl.includes('localhost')) {
        console.log('❌ Found localhost URL in storage, removing...');
        
        // Remove the localhost URL
        chrome.storage.local.remove(['apiBaseUrl'], () => {
            console.log('✅ Removed localhost apiBaseUrl from storage');
            console.log('Extension will now use production API from config');
        });
    } else {
        console.log('✅ No localhost URL found in storage');
    }
});

// Also check for any other localhost references
chrome.storage.local.get(null, (allData) => {
    console.log('All storage data:', allData);
    
    const localhostKeys = [];
    for (const [key, value] of Object.entries(allData)) {
        if (typeof value === 'string' && value.includes('localhost')) {
            localhostKeys.push(key);
        }
    }
    
    if (localhostKeys.length > 0) {
        console.log('Found localhost references in keys:', localhostKeys);
        chrome.storage.local.remove(localhostKeys, () => {
            console.log('Removed all localhost references');
        });
    }
});
