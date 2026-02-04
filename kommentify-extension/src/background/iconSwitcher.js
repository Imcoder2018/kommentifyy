import { browser } from '../shared/utils/browser.js';

class IconSwitcher {
    constructor() {
        this.wasLinkedInPage = null;
    }

    registerChanges() {
        chrome.tabs.onCreated.addListener(() => this.setIcon());
        chrome.tabs.onActivated.addListener(() => this.setIcon());
        chrome.tabs.onUpdated.addListener(() => this.setIcon());
        chrome.windows.onFocusChanged.addListener(() => this.setIcon());
    }

    async setIcon() {
        const isLinkedIn = await browser.isLinkedInPage();
        if (isLinkedIn === this.wasLinkedInPage) {
            return;
        }
        this.wasLinkedInPage = isLinkedIn;

        // [THE FIX] Added leading slashes to make paths absolute.
        const activeIconPath = "/assets/icons/icon48.png";
        const inactiveIconPath = "/assets/icons/icon-inactive.png";

        chrome.action.setIcon({
            path: isLinkedIn ? activeIconPath : inactiveIconPath
        });
    }
}

export const iconSwitcher = new IconSwitcher();