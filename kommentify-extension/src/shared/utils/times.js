import * as T from '../storage/constants.js';

class Times {
    /**
     * Checks if a LinkedIn time string (e.g., "5h", "1d", "3w") is within a specified PostAge enum.
     * @param {string} timeSymbol - The time string from LinkedIn.
     * @param {T.PostAge} postAge - The maximum age allowed.
     * @returns {boolean}
     */
    isTimeSymbolLessThanOrEqualPostAge(timeSymbol, postAge) {
        if (!timeSymbol) return false;

        const checks = {
            [T.PostAge.NotSpecified]: () => true,
            [T.PostAge.OneDay]: (s) => /^(?:\d{1,2}[smh]|1d)\b/.test(s),
            [T.PostAge.ThreeDays]: (s) => /^(?:\d{1,2}[smh]|[1-3]d)\b/.test(s),
            [T.PostAge.OneWeek]: (s) => /^(?:\d{1,2}[smhd]|1w)\b/.test(s),
            [T.PostAge.OneMonth]: (s) => /^(?:\d{1,2}[smhdw]|1mo)\b/.test(s),
            [T.PostAge.ThreeMonths]: (s) => /^(?:\d{1,2}[smhdw]|[1-3]mo)\b/.test(s),
        };

        const checkFunc = checks[postAge];
        return checkFunc ? checkFunc(timeSymbol) : false;
    }
}

export const times = new Times();
