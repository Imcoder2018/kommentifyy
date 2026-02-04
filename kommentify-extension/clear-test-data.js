// Clear test data and reset import history for real testing
console.log('🧹 CLEARING TEST DATA...');

chrome.storage.local.set({ importHistory: [] }, () => {
    console.log('✅ CLEARED: Import history reset to empty array');
    
    // Also check what else is in storage
    chrome.storage.local.get(null, (allData) => {
        console.log('📦 CURRENT STORAGE CONTENTS:');
        Object.keys(allData).forEach(key => {
            if (key === 'importHistory') {
                console.log(`- ${key}:`, allData[key]);
            } else {
                console.log(`- ${key}: [${typeof allData[key]}] ${Array.isArray(allData[key]) ? allData[key].length + ' items' : 'data'}`);
            }
        });
    });
});

// Also clear any auto-save form data
chrome.storage.local.remove('formInputsAutoSave', () => {
    console.log('✅ CLEARED: Auto-save form data');
});
