// background/automationJobs.js

import { browser } from '../shared/utils/browser.js';
import { storage } from '../shared/storage/storage.js';
import * as T from '../shared/storage/constants.js';
import { automationExecutor } from '/background/automationExecutor.js';
import { randomDelay } from '../shared/utils/helpers.js';

/**
 * Base class with shared logic for automation jobs.
 */
class BaseAutomationJob {
    constructor() {
        this.totalCommentsDone = 0;
        this.randomCommentsBeforeLargeDelay = this.getRandomCommentsBeforeLargeDelay();
    }

    getRandomCommentsBeforeLargeDelay = () => Math.floor(Math.random() * (30 - 20 + 1)) + 20;

    async handleSuccessActions() {
        this.totalCommentsDone++;
        await randomDelay(30000, 40000); // Wait 30-40 seconds after a success
        this.randomCommentsBeforeLargeDelay--;
        if (this.randomCommentsBeforeLargeDelay <= 0) {
            this.randomCommentsBeforeLargeDelay = this.getRandomCommentsBeforeLargeDelay();
            await randomDelay(120000, 300000); // Wait 2-5 minutes after a batch of successes
        }
    }

    async handleCompleteActions() {
        await storage.setEnum(T.StorageKey.AutomationListState, T.SwitchState.Off);
        await storage.setEnum(T.StorageKey.AutomationPageState, T.SwitchState.Off);
        const pluralS = this.totalCommentsDone === 1 ? "" : "s";
        await storage.setString(
            T.StorageKey.AutomationCompleteMessage,
            `Auto-Pilot successfully completed with ${this.totalCommentsDone} comment${pluralS} done.`
        );
        this.totalCommentsDone = 0; // Reset for the next run
    }
}

/**
 * Handles automation from a list of collected post URNs (from a search/hashtag page).
 */
class AutomationPageJob extends BaseAutomationJob {
    async watch() {
        for (;;) { // Loop indefinitely
            await randomDelay(20000, 30000); // Wait 20-30 seconds between activities
            try {
                const urns = await storage.getArray(T.StorageKey.AutomationPageUrns, []);
                if (urns.length === 0) continue;

                const urn = urns.shift(); // Get the first URN
                await storage.setArray(T.StorageKey.AutomationPageUrns, urns); // Update the list

                const postUrl = `https://www.linkedin.com/feed/update/${urn}`;
                const success = await this.publishComment(postUrl);

                if (success) {
                    await this.handleSuccessActions();
                }

                if (urns.length === 0) {
                    await this.handleCompleteActions();
                }
            } catch (error) {
                console.error("AutomationPageJob Error:", error);
            }
        }
    }

    async publishComment(url) {
        let tabId = null;
        try {
            tabId = await browser.openTab(url, false); // Open in a background tab
            if (!tabId) return false;
            return await browser.contentExecution(automationExecutor.publishComment, tabId);
        } catch (error) {
            console.error(`Failed to publish comment at ${url}:`, error);
            return false;
        } finally {
            if (tabId) {
                chrome.tabs.remove(tabId);
            }
        }
    }
}

/**
 * Handles automation from a user-defined list of profile/company activity URLs.
 */
class AutomationListJob extends AutomationPageJob { // Extends PageJob as the final step is the same
    async watch() {
        for (;;) { // Loop indefinitely
             await randomDelay(20000, 30000);
            try {
                const activityUrls = await storage.getArray(T.StorageKey.AutomationListActivityUrls, []);
                if (activityUrls.length === 0) continue;

                const activityUrl = activityUrls.shift();
                await storage.setArray(T.StorageKey.AutomationListActivityUrls, activityUrls);

                const firstPostUrn = await this.getFirstPostUrn(activityUrl);
                if (!firstPostUrn) {
                    if (activityUrls.length === 0) await this.handleCompleteActions();
                    continue;
                }

                const postUrl = `https://www.linkedin.com/feed/update/${firstPostUrn}`;
                const success = await this.publishComment(postUrl);

                if (success) {
                    await this.handleSuccessActions();
                }

                if (activityUrls.length === 0) {
                    await this.handleCompleteActions();
                }
            } catch (error) {
                console.error("AutomationListJob Error:", error);
            }
        }
    }

    async getFirstPostUrn(url) {
        let tabId = null;
        try {
            tabId = await browser.openTab(url, false);
            if (!tabId) return null;
            return await browser.contentExecution(automationExecutor.getFirstPostUrn, tabId);
        } catch (error) {
            console.error(`Failed to get first post URN from ${url}:`, error);
            return null;
        } finally {
            if (tabId) {
                chrome.tabs.remove(tabId);
            }
        }
    }
}

export const automationPageJob = new AutomationPageJob();
export const automationListJob = new AutomationListJob();