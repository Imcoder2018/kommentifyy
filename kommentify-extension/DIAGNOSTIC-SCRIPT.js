// DIAGNOSTIC SCRIPT - Run this in the extension popup console (F12)
// Copy and paste this entire script and press Enter

console.log('🔍 DIAGNOSTIC: Starting Import Tab Diagnostics...');
console.log('='.repeat(60));

// 1. Check if import module loaded
console.log('\n1️⃣ Checking if import.js module loaded:');
if (window.startConnectionRequests !== undefined) {
    console.log('✅ window.startConnectionRequests exists:', typeof window.startConnectionRequests);
} else {
    console.error('❌ window.startConnectionRequests is undefined!');
}

// 2. Check if button exists
console.log('\n2️⃣ Checking if button exists:');
const btn = document.getElementById('start-connection-requests');
if (btn) {
    console.log('✅ Button found:', btn);
    console.log('   - Button text:', btn.textContent);
    console.log('   - Button disabled:', btn.disabled);
} else {
    console.error('❌ Button NOT found! ID: start-connection-requests');
}

// 3. Check if Import tab content is loaded
console.log('\n3️⃣ Checking if Import tab content is loaded:');
const importContainer = document.getElementById('import-container');
if (importContainer) {
    console.log('✅ import-container found');
    console.log('   - Has content:', importContainer.innerHTML.length > 0);
} else {
    console.error('❌ import-container NOT found!');
}

// 4. Check current active tab
console.log('\n4️⃣ Checking current active tab:');
const activeTabs = document.querySelectorAll('.tab-button.active');
if (activeTabs.length > 0) {
    activeTabs.forEach(tab => {
        console.log('✅ Active tab:', tab.getAttribute('data-tab'));
    });
} else {
    console.warn('⚠️  No active tab found');
}

// 5. Try to manually trigger the button
console.log('\n5️⃣ Attempting to manually trigger button click:');
if (btn && window.startConnectionRequests) {
    console.log('🔘 Clicking button programmatically...');
    btn.click();
} else {
    console.error('❌ Cannot click - missing button or function');
}

// 6. Check storage for import history
console.log('\n6️⃣ Checking chrome.storage for importHistory:');
chrome.storage.local.get('importHistory', (result) => {
    if (result.importHistory) {
        console.log('✅ importHistory found in storage:');
        console.log('   - Total sessions:', result.importHistory.length);
        console.log('   - Sessions:', result.importHistory);
    } else {
        console.warn('⚠️  No importHistory in storage');
    }
});

console.log('\n' + '='.repeat(60));
console.log('🔍 DIAGNOSTIC: Complete! Review results above.');
console.log('If button click triggered, check for "🔄 IMPORT: startConnectionRequests function called!"');
