/**
 * Returns 's' if the count is not 1, otherwise returns an empty string.
 * Useful for pluralizing words.
 * @param {number} count 
 * @returns {'s' | ''}
 */
export function s(count) {
    return count === 1 ? '' : 's';
}
