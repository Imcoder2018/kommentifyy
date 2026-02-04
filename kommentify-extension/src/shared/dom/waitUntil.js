/**
 * A utility class to asynchronously wait for DOM elements to appear.
 */
class WaitUntil {
    constructor() {
        this.TIMEOUT = 5000;
        this.DELAY = 100;
    }

    /**
     * Waits for a condition to become true, polling at intervals.
     * @param {Function} condition - A function that returns true when the condition is met.
     * @param {number} [timeout=this.TIMEOUT] - The maximum time to wait.
     * @returns {Promise<boolean>} True if the condition was met, false if it timed out.
     */
    delay(condition, timeout = this.TIMEOUT) {
        return new Promise(resolve => {
            let elapsed = 0;
            const interval = setInterval(() => {
                if (condition()) {
                    clearInterval(interval);
                    resolve(true);
                }
                elapsed += this.DELAY;
                if (elapsed > timeout) {
                    clearInterval(interval);
                    resolve(false);
                }
            }, this.DELAY);
        });
    }

    /**
     * Waits for an element matching a selector to appear in the DOM.
     * @param {string} selector - The CSS selector for the element.
     * @param {number} [timeout=this.TIMEOUT] - The maximum time to wait.
     * @param {Document|HTMLElement} [doc=document] - The document or element to search within.
     * @returns {Promise<HTMLElement|null>} The element if found, otherwise null.
     */
    async elementAppears(selector, timeout = this.TIMEOUT, doc = document) {
        let element = null;
        await this.delay(() => {
            element = doc.querySelector(selector);
            return element !== null;
        }, timeout);
        return element;
    }
}

export const waitUntil = new WaitUntil();
