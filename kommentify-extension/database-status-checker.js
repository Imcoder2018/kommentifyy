// Database Status Checker
// Add this to popup.js to show database status

async function checkDatabaseStatus() {
    try {
        const storage = await chrome.storage.local.get(['authToken', 'apiBaseUrl']);
        const apiUrl = storage.apiBaseUrl || 'https://kommentify.com';
        
        const response = await fetch(`${apiUrl}/api/auth/validate`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${storage.authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        return { status: 'connected', message: 'Database is working' };
        
    } catch (error) {
        if (error.message.includes('Error code 14') || error.message.includes('database file')) {
            return { 
                status: 'database_error', 
                message: 'Database file issue - SQLite not compatible with serverless' 
            };
        }
        return { 
            status: 'connection_error', 
            message: `Backend connection failed: ${error.message}` 
        };
    }
}

// Show database status banner
async function showDatabaseStatusBanner() {
    const status = await checkDatabaseStatus();
    
    if (status.status !== 'connected') {
        const banner = document.createElement('div');
        banner.id = 'database-status-banner';
        banner.style.cssText = `
            position: fixed; 
            top: 0; 
            left: 0; 
            right: 0; 
            background: #dc3545; 
            color: white; 
            padding: 10px; 
            text-align: center; 
            font-size: 12px; 
            z-index: 10000;
            border-bottom: 2px solid #b02a37;
        `;
        banner.innerHTML = `
            ⚠️ <strong>Database Issue:</strong> ${status.message}
            <br><small>Some features may not work. Contact support if this persists.</small>
        `;
        
        document.body.insertBefore(banner, document.body.firstChild);
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            banner.remove();
        }, 10000);
    }
}

console.log('📊 Database status checker loaded');
