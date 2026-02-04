import { storage } from '../storage/storage.js';

/**
 * Sends a message to the content script bridge, which then securely forwards
 * it to the background script. This is now a FALLBACK method.
 */
function sendMessageToBackground(action) {
    return new Promise((resolve, reject) => {
        const requestId = Date.now() + Math.random();
        const listener = (event) => {
            if (event.source === window && event.data.type === `COMMENTRON_RUNTIME_RESULT_${requestId}`) {
                window.removeEventListener('message', listener);
                event.data.error ? reject(new Error(event.data.error)) : resolve(event.data.data);
            }
        };
        window.addEventListener('message', listener);
        window.postMessage({ type: 'COMMENTRON_RUNTIME_SEND_MESSAGE', action, requestId });
    });
}

/**
 * The new, robust profiler. It tries to find profile info on the current page first,
 * which is much faster and more reliable.
 */
class Profiler {

    /**
     * Tries to find profile information on the currently active page.
     * This is the primary and fastest method.
     */
    async _scrapeCurrentPage() {
        console.log("Profiler: Attempting to scrape profile from current page...");
        
        // Helper to wait for an element to appear on the current page
        const waitForElement = (selector, timeout = 1000) => {
            return new Promise(resolve => {
                // Check immediately in case it's already there
                const immediateEl = document.querySelector(selector);
                if (immediateEl) return resolve(immediateEl);
                // If not, wait a bit
                const interval = setInterval(() => {
                    const element = document.querySelector(selector);
                    if (element) { clearInterval(interval); clearTimeout(timeoutId); resolve(element); }
                }, 100);
                const timeoutId = setTimeout(() => { clearInterval(interval); resolve(null); }, timeout);
            });
        };

        // First, try to get the 'seat' from the URL if we are on a profile page
        const urlMatch = window.location.href.match(/\/in\/([^\/\?]+)/);
        if (urlMatch) {
            const seat = urlMatch[1];
            const profileImageEl = await waitForElement("img.pv-top-card-profile-picture__image, .profile-photo-edit__preview");
            if (profileImageEl) {
                console.log("Profiler: Success scraping from profile page URL and image.");
                return { seat, me: profileImageEl.alt, imageUrl: profileImageEl.src };
            }
        }

        // If not on a profile page, look for the main navigation elements
        const navImageEl = await waitForElement("img.global-nav__me-photo");
        const navLinkEl = await waitForElement("a.global-nav__me-view-profile-link");

        if (navImageEl && navLinkEl) {
            const linkMatch = navLinkEl.href.match(/\/in\/([^\/\?]+)/);
            if (linkMatch) {
                console.log("Profiler: Success scraping from main navigation elements.");
                return { seat: linkMatch[1], me: navImageEl.alt, imageUrl: navImageEl.src };
            }
        }

        console.log("Profiler: Failed to find profile info on current page.");
        return null; // Scraping failed
    }

    /**
     * The main function to get the user's profile.
     */
    async loadProfile() {
        // Step 1: Try the fast, local scraping method first.
        let profile = await this._scrapeCurrentPage();

        if (profile && profile.seat) {
            await storage.setObject('profile', profile);
            return profile;
        }

        // Step 2: If local scraping fails, use the background script as a fallback.
        console.log("Profiler: Local scrape failed. Trying background fallback...");
        try {
            profile = await sendMessageToBackground('GET_PROFILE_DATA');
            if (profile && profile.seat) {
                console.log("Profiler: Success scraping from background fallback.");
                await storage.setObject('profile', profile);
                return profile;
            }
        } catch (error) {
            console.error("Profiler: Background scraping fallback failed:", error);
        }

        // Step 3: If both methods fail, return an empty object.
        console.error("Profiler: CRITICAL - Both local and background scraping failed.");
        return {};
    }

    // The update function can be simplified as loadProfile handles the logic
    async updateProfileOccasionally() {
        const usageCount = await storage.getNumber('updateProfileUsage', 0);
        await storage.setNumber('updateProfileUsage', usageCount + 1);
        if (usageCount % 10 === 0) { // Check more often
            console.log("Profiler: Performing occasional profile update...");
            await this.loadProfile();
        }
    }
}

export const profiler = new Profiler();