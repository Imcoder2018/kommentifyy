import { domActions } from '../shared/dom/domium.js';
import { storage } from '../shared/storage/storage.js';
import * as T from '../shared/storage/constants.js';
import { api } from '../shared/api/api.js';
import { times } from '../shared/utils/times.js';
import { delay } from '../shared/utils/helpers.js';

class AutomationCollector {
    /**
     * Main function to collect post URNs from a search or hashtag page.
     */
    async collectPosts() {
        const quota = await storage.getNumber(T.StorageKey.AutomationQuota, 25);
        const postAgeLimit = await storage.getEnum(T.StorageKey.AutomationPostAgeLimit, T.PostAge.NotSpecified);
        const collectedUrns = [];

        // Check conditions to ensure this is a valid automation run.
        const isAutomationWindow = window.name === "AutomationPage";
        const isCorrectUrl = window.location.href.startsWith("https://www.linkedin.com/search/results") || window.location.href.startsWith("https://www.linkedin.com/feed/hashtag");
        const isAutomationOn = await storage.getEnum(T.StorageKey.AutomationPageState) === T.SwitchState.On;

        if (isAutomationWindow && isCorrectUrl && isAutomationOn) {
            
            // Safety net: if the user closes the window, cancel the automation.
            sessionStorage.setItem("automation-in-progress", "true");
            window.addEventListener("beforeunload", async () => {
                if (sessionStorage.getItem("automation-in-progress")) {
                    await storage.removeArray(T.StorageKey.AutomationPageUrns);
                    await storage.setEnum(T.StorageKey.AutomationPageState, T.SwitchState.Off);
                }
            });

            domActions.displayMessage(`Gathering information...<br>${collectedUrns.length}/${quota} posts found.`);

            // Loop until the quota is met or the end of the page is reached.
            while (collectedUrns.length < quota) {
                try {
                    const nextUrn = await this.getNextUrn();
                    if (!nextUrn) {
                        domActions.displayMessage(`End of page reached.<br>${collectedUrns.length}/${quota} posts found.`);
                        break; // Exit loop if no new post is found
                    }

                    if (collectedUrns.includes(nextUrn)) continue;

                    // Check post against user's age preference.
                    if (postAgeLimit !== T.PostAge.NotSpecified) {
                        const postTimeSymbol = this.getPostTimeSymbol(nextUrn);
                        if (!times.isTimeSymbolLessThanOrEqualPostAge(postTimeSymbol, postAgeLimit)) {
                            continue; // Skip post if it's too old
                        }
                    }

                    // Check if comments are disabled on the post.
                    if (this.isCommentButtonDisabled(nextUrn)) continue;
                    
                    collectedUrns.push(nextUrn);
                    domActions.displayMessage(`Gathering information...<br>${collectedUrns.length}/${quota} posts found.`);

                    // Allow the automation to be cancelled from the popup.
                    if (await storage.getEnum(T.StorageKey.AutomationPageState) !== T.SwitchState.On) {
                        await storage.removeArray(T.StorageKey.AutomationPageUrns);
                        window.close();
                        return;
                    }

                } catch (error) {
                    api.logFrontError("automationCollector.collectPosts loop", error);
                }
            }

            // Save the final list and close the window.
            await storage.setArray(T.StorageKey.AutomationPageUrns, collectedUrns);
            await delay(3000); // Give user time to see the final count
            sessionStorage.removeItem("automation-in-progress");
            window.close();
        }
    }

    /**
     * Scrolls the page and finds the next uncollected post element.
     * @returns {Promise<string|null>} The URN of the next post, or null if none is found.
     */
    async getNextUrn() {
        let lastHeight = 0;
        let scrollAttempts = 0;

        do {
            lastHeight = document.documentElement.scrollHeight;
            
            // Find the next post that hasn't been marked as collected yet.
            const nextPost = document.querySelector(`main div[data-urn]:not([${T.DataAttribute.AlreadyCollected}])`);
            if (nextPost) {
                const urn = nextPost.getAttribute('data-urn');
                nextPost.setAttribute(T.DataAttribute.AlreadyCollected, 'true');
                if (urn) return urn;
            }
            
            // Scroll down to load more content.
            window.scrollTo(0, document.documentElement.scrollHeight);
            await delay(500); // Wait for content to load

            // If height hasn't changed, we might be at the end.
            if (document.documentElement.scrollHeight === lastHeight) {
                scrollAttempts++;
                // Try clicking a "show more" button if it exists.
                const loadMoreButton = document.querySelector("button.scaffold-finite-scroll__load-button");
                if (loadMoreButton) domActions.performClick(loadMoreButton);
            } else {
                scrollAttempts = 0;
            }

        } while (scrollAttempts < 5); // Exit if the page stops growing

        return null;
    }

    /**
     * Gets the timestamp text (e.g., "1d", "5h") for a given post URN.
     * @param {string} urn - The URN of the post.
     * @returns {string|null}
     */
    getPostTimeSymbol(urn) {
        const postElement = document.querySelector(`div[data-urn="${urn}"]`);
        const timeElement = postElement?.querySelector("span.update-components-actor__sub-description > span:first-child");
        return timeElement ? timeElement.innerText : null;
    }

    /**
     * Checks if the comment button for a post is disabled.
     * @param {string} urn - The URN of the post.
     * @returns {boolean}
     */
    isCommentButtonDisabled(urn) {
        const postElement = document.querySelector(`div[data-urn="${urn}"]`);
        const commentButton = postElement?.querySelector("button.comment-button");
        return commentButton ? commentButton.hasAttribute("disabled") : false;
    }
}

export const automationCollector = new AutomationCollector();
