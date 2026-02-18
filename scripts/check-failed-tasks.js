// This script can be run by a cron job every 5 minutes
// Usage: node scripts/check-failed-tasks.js

const fetch = require('node-fetch');

async function checkFailedTasks() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/cron/check-failed-tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Checked failed tasks. Marked ${result.failedCount} tasks as failed due to extension inactivity.`);
    } else {
      console.error('❌ Failed to check tasks:', result.error);
    }
  } catch (error) {
    console.error('❌ Error checking failed tasks:', error);
  }
}

// Run the check
checkFailedTasks();
