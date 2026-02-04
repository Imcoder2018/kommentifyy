import { clicker } from './/clicker.js';
import * as T from '../shared/storage/constants.js';

class IFrameDetector {
    constructor() {
        this.DETECTION_INTERVAL = 2000; // Check for new iframes every 2 seconds
    }

    /**
     * Starts a recurring interval to detect and register click listeners on new iframes.
     */
    constantlyDetectAndRegisterClicks() {
        setInterval(() => this.detectAndRegister(), this.DETECTION_INTERVAL);
    }

    /**
     * Finds all iframes on the page that haven't been registered yet and adds the click listener.
     */
    detectAndRegister() {
        const iframes = document.querySelectorAll("iframe");
        for (const iframe of iframes) {
            // Skip iframes that are already processed or are internal tools of the extension.
            if (iframe.hasAttribute(T.DataAttribute.AlreadyRegistered) || iframe.hasAttribute(T.DataAttribute.DynamicHiddenIFrame)) {
                continue;
            }

            iframe.addEventListener("load", () => {
                try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    iframeDoc.body.addEventListener("click", clicker.click);
                } catch (error) {
                    // This can fail due to cross-origin policies on some iframes, which is expected.
                }
            });

            iframe.setAttribute(T.DataAttribute.AlreadyRegistered, "true");
        }
    }
}

export const iFrameDetector = new IFrameDetector();
