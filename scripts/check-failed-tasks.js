// This script can be run by a cron job every 5 minutes
// Usage: node scripts/check-failed-tasks.js

// Use native fetch (available in Node 18+)

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const CRON_ENDPOINT = `${APP_URL}/api/cron/check-failed-tasks`;
const TIMEOUT_MS = 10000; // 10 second timeout

async function checkFailedTasks() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    console.log(`Checking failed tasks at ${CRON_ENDPOINT}...`);

    const response = await fetch(CRON_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      console.log(`✅ Checked failed tasks. Marked ${result.failedCount} tasks as failed due to extension inactivity.`);
    } else {
      console.error('❌ Failed to check tasks:', result.error || 'Unknown error');
      process.exit(1);
    }
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error('❌ Error: Request timed out after 10 seconds');
    } else {
      console.error('❌ Error checking failed tasks:', error.message);
    }
    process.exit(1);
  }
}

// Run the check
checkFailedTasks();
