/**
 * A collection of general-purpose helper functions.
 */

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @returns {number}
 */
export const random = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Pauses execution for a specified duration.
 * @param {number} ms - The number of milliseconds to wait.
 * @returns {Promise<void>}
 */
export const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Pauses execution for a random duration within a specified range.
 * @param {number} minMs - The minimum number of milliseconds to wait.
 * @param {number} maxMs - The maximum number of milliseconds to wait.
 * @returns {Promise<void>}
 */
export const randomDelay = async (minMs, maxMs) => {
    const waitTime = random(minMs, maxMs);
    await delay(waitTime);
};
