export const API_CONFIG = {
    BASE_URL: 'https://kommentify.com'
};

// Global Error Handling
window.onerror = function (msg, url, line, col, error) {
    console.error('Global Error:', { msg, url, line, col, error });
    // Try to show error in UI if possible
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #dc3545;">
                <h3>Something went wrong</h3>
                <p>${msg}</p>
                <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; background: #693fe9; color: white; border: none; borderRadius: 4px; cursor: pointer;">Reload</button>
            </div>
        `;
    }
    return false;
};

window.addEventListener('unhandledrejection', function (event) {
    console.error('Unhandled Promise Rejection:', event.reason);
});

// Show authentication messages
export function showAuthMessage(message, type = 'error') {
    const errorDiv = document.getElementById('auth-error');
    const successDiv = document.getElementById('auth-success');

    if (type === 'error') {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        successDiv.style.display = 'none';
    } else {
        successDiv.textContent = message;
        successDiv.style.display = 'block';
        errorDiv.style.display = 'none';
    }
}

// Show notification to user
export function showNotification(message, type = 'info', duration = 3000) {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('extension-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'extension-notification';
        notification.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            padding: 12px 16px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            max-width: 300px;
            word-wrap: break-word;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        document.body.appendChild(notification);
    }

    // Set message and type-specific styling
    notification.textContent = message;

    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#007bff'
    };

    notification.style.backgroundColor = colors[type] || colors.info;

    // Show notification
    notification.style.transform = 'translateX(0)';

    // Hide after duration
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
    }, duration);
}

// Alias for showNotification to maintain compatibility
export function showToast(message, type = 'info', duration = 3000) {
    showNotification(message, type, duration);
}

// Database Status Check Function
export async function checkDatabaseStatus() {
    try {
        const storage = await chrome.storage.local.get(['apiBaseUrl']);
        const apiUrl = storage.apiBaseUrl || API_CONFIG.BASE_URL;

        const response = await fetch(`${apiUrl}/api/database/status`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (data.success && data.status === 'connected') {
            console.log('✅ Database Status: Connected (PostgreSQL)');
            console.log('📊 Database Stats:', data.stats);
        } else {
            console.warn('⚠️ Database Status: Issues detected');
            showDatabaseWarning(data.error || 'Database connection issues');
        }

    } catch (error) {
        console.error('❌ Database Status Check Failed:', error);
        if (error.message.includes('Error code 14')) {
            showDatabaseWarning('SQLite database detected - migration to PostgreSQL required');
        }
    }
}

export function showDatabaseWarning(message) {
    const banner = document.createElement('div');
    banner.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; 
        background: #ffc107; color: #000; padding: 8px; 
        text-align: center; font-size: 11px; z-index: 10000;
        border-bottom: 1px solid #ffb300;
    `;
    banner.innerHTML = `⚠️ Database: ${message}`;
    document.body.insertBefore(banner, document.body.firstChild);
    setTimeout(() => banner.remove(), 8000);
}
