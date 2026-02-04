/**
 * A collection of low-level, reusable DOM utility functions.
 */

// --- conditionChecker --- //
class ConditionChecker {
    isParent = (child, parent) => parent.contains(child);
    hasCssClass = (el, className) => el?.classList?.contains(className);
    isTag = (el, tagName) => el?.nodeName?.toLowerCase() === tagName.toLowerCase();

    /** Checks if an element or its ancestors (up to a limit) match a tag and class */
    existTagWithCssClass(startEl, tagName, className, depth = 10) {
        let current = startEl;
        for (let i = 0; i < depth && current && current.nodeName !== 'BODY'; i++) {
            if (this.isTag(current, tagName) && this.hasCssClass(current, className)) {
                return true;
            }
            current = current.parentElement;
        }
        return false;
    }
}
export const conditionChecker = new ConditionChecker();


// --- elementsCounter --- //
class ElementsCounter {
    /** Counts how many parents of a given tag name an element has */
    countParents(startEl, tagName) {
        let count = 0;
        let current = startEl.parentElement;
        while (current) {
            if (conditionChecker.isTag(current, tagName)) {
                count++;
            }
            current = current.parentElement;
        }
        return count;
    }
}
export const elementsCounter = new ElementsCounter();


// --- relativeFinder --- //
class RelativeFinder {
    _find(startEl, selectors, direction, method) {
        let current = startEl.parentElement;
        while (current && current.nodeName !== 'BODY') {
            const matches = Array.from(current.querySelectorAll(selectors.join(',')));
            if (matches.length > 0) {
                if (method === 'first') return matches[0];
                if (method === 'closest') {
                    // Simplified 'closest' logic: find the one with the smallest vertical distance.
                    const startRect = startEl.getBoundingClientRect();
                    let closestEl = null;
                    let minDistance = Infinity;
                    for (const match of matches) {
                        const matchRect = match.getBoundingClientRect();
                        if (direction === 'above' && matchRect.bottom > startRect.top) continue;
                        if (direction === 'below' && matchRect.top < startRect.bottom) continue;
                        const distance = Math.abs(startRect.top - matchRect.top);
                        if (distance < minDistance) {
                            minDistance = distance;
                            closestEl = match;
                        }
                    }
                    if (closestEl) return closestEl;
                }
            }
            current = current.parentElement;
        }
        return null;
    }

    getFirstMatchingElementAboveMe = (el, selectors) => this._find(el, selectors, 'above', 'first');
    getFirstMatchingElementBelowMe = (el, selectors) => this._find(el, selectors, 'below', 'first');
    getClosestMatchingElementAboveMe = (el, selectors) => this._find(el, selectors, 'above', 'closest');

    getParent = (el, tagName) => {
        let current = el.parentElement;
        while (current && current.nodeName !== 'BODY') {
            if (conditionChecker.isTag(current, tagName)) return current;
            current = current.parentElement;
        }
        return null;
    };
    
    getFirstMatchingChild = (el, selectors) => el.querySelector(selectors.join(','));
}
export const relativeFinder = new RelativeFinder();


// --- domActions --- //
class DomActions {
    performClick = (el) => el.click();
    
    createThumbnailSpinner = (src) => {
        const img = document.createElement("img");
        img.src = src;
        img.style.width = "25px";
        img.style.height = "25px";
        img.setAttribute('data-rocket-dynamic-spinner-image', "true");
        return img;
    };

    createHiddenIframe = (src) => {
        const iframe = document.createElement("iframe");
        iframe.src = src;
        iframe.style.width = "1px";
        iframe.style.height = "1px";
        iframe.style.position = "absolute";
        iframe.style.left = "-9999px";
        iframe.setAttribute('data-rocket-dynamic-hidden-iframe', "true");
        document.body.appendChild(iframe);
        return iframe;
    };

    displayMessage(html) {
        let msgDiv = document.querySelector('[data-rocket-dynamic-message]');
        if (!msgDiv) {
            msgDiv = document.createElement('div');
            msgDiv.setAttribute('data-rocket-dynamic-message', 'true');
            Object.assign(msgDiv.style, {
                position: 'fixed',
                top: '60px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(0,0,0,0.75)',
                color: 'white',
                padding: '15px',
                borderRadius: '8px',
                zIndex: '99999',
                textAlign: 'center',
                fontSize: '16px',
                lineHeight: '1.4',
            });
            document.body.appendChild(msgDiv);
        }
        msgDiv.innerHTML = html;
    }
}
export const domActions = new DomActions();