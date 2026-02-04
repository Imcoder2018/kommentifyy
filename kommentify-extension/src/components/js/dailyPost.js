import { elements } from './state.js';

// --- DAILY POST SCHEDULE --- //
export async function enableDailyPostSchedule() {
    const time = elements.dailyPostTime.value;
    if (!time) {
        alert('Please select a time for the daily post');
        return;
    }

    const template = elements.postTemplate.value;
    const tone = elements.postTone.value;
    const includeHashtags = elements.postIncludeHashtags.checked;

    elements.enableDailyPost.disabled = true;

    chrome.runtime.sendMessage({
        action: 'scheduleDailyPost',
        time,
        options: {
            template,
            tone,
            includeHashtags
        }
    }, (response) => {
        if (elements.enableDailyPost) {
            elements.enableDailyPost.disabled = false;
        }

        if (response && response.success) {
            const nextRun = new Date(response.result.nextRun);
            if (elements.dailyPostEnabled) {
                elements.dailyPostEnabled.textContent =
                    `✅ Enabled (Next: ${nextRun.toLocaleString()})`;
                elements.dailyPostEnabled.style.color = '#28a745';
            }
            alert(`Daily post scheduled for ${time} every day!\n\nNext post: ${nextRun.toLocaleString()}`);
        } else {
            alert(`Failed to schedule daily post: ${response?.error || 'Unknown error'}`);
        }
    });
}

export async function disableDailyPostSchedule() {
    chrome.runtime.sendMessage({
        action: 'cancelDailyPost'
    }, (response) => {
        if (response && response.success) {
            if (elements.dailyPostEnabled) {
                elements.dailyPostEnabled.textContent = 'Not Scheduled';
                elements.dailyPostEnabled.style.color = '#6c757d';
            }
            alert('Daily post schedule cancelled');
        } else {
            alert(`Failed to cancel schedule: ${response?.error || 'Unknown error'}`);
        }
    });
}

export async function checkDailyPostStatus() {
    chrome.runtime.sendMessage({
        action: 'getDailyPostStatus'
    }, (response) => {
        if (response && response.success) {
            const status = response.status;
            if (status.enabled && status.nextRun) {
                const nextRun = new Date(status.nextRun);
                if (elements.dailyPostEnabled) {
                    elements.dailyPostEnabled.textContent =
                        `✅ Enabled (Next: ${nextRun.toLocaleString()})`;
                    elements.dailyPostEnabled.style.color = '#28a745';
                }
                if (elements.dailyPostTime) {
                    elements.dailyPostTime.value = status.postTime;
                }
            } else {
                if (elements.dailyPostEnabled) {
                    elements.dailyPostEnabled.textContent = 'Not Scheduled';
                    elements.dailyPostEnabled.style.color = '#6c757d';
                }
            }
        }
    });
}
