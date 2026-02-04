// shared/dom/feedActions.js

import { domActions as baseDomActions } from '../dom/domium.js';
import { appConfig } from '../utils/appConfig.js';
import * as T from '../storage/constants.js';

class FeedActions {
    /**
     * Displays a loading spinner inside the comment input box.
     * @param {HTMLElement} inputBox - The target input box element.
     */
    displaySpinner(inputBox) {
        // Clear any placeholder text or existing content
        const placeholder = inputBox.querySelector('[data-placeholder]');
        if (placeholder) placeholder.style.display = 'none';
        inputBox.innerHTML = "";
        
        // appConfig.spinnerUrl is now a getter that handles chrome.runtime
        const spinner = baseDomActions.createThumbnailSpinner(appConfig.spinnerUrl);
        inputBox.appendChild(spinner);
    }

    /**
     * Removes the loading spinner from the input box.
     * @param {HTMLElement} inputBox - The target input box element.
     */
    removeSpinner(inputBox) {
        const spinner = inputBox.querySelector(`img[${T.DataAttribute.DynamicSpinnerImage}]`);
        if (spinner) {
            spinner.parentElement.removeChild(spinner);
        }
    }

    /**
     * Pastes the generated text into the comment box using a reliable method.
     * @param {HTMLElement} inputBox - The target input box element (the editor).
     * @param {string} text - The generated text to paste.
     */
    pasteCommentText(inputBox, text) {
        // Remove spinner first
        this.removeSpinner(inputBox);
        
        // The editor element is usually the first child of the box we find.
        const editor = inputBox.querySelector('div[contenteditable="true"]') || inputBox;

        // Clear existing content
        editor.innerHTML = '';
        
        // Focus the editor to prepare it for input.
        editor.focus();
        
        // Use insertHTML which is more robust for rich-text editors.
        // We convert newlines to paragraphs for proper formatting.
        const html = `<p>${text.replace(/\n/g, '</p><p>')}</p>`;
        document.execCommand('insertHTML', false, html);

        // Dispatch an input event to make sure LinkedIn's framework recognizes the change.
        editor.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    }

    /**
     * Pastes the generated text for a reply, preserving any @mentions.
     * @param {HTMLElement} inputBox - The target input box element.
     * @param {NodeListOf<HTMLElement>} mentionElements - Existing mention elements to preserve.
     * @param {string} text - The generated text to paste.
     */
    pasteReplyText(inputBox, mentionElements, text) {
        const editor = inputBox.querySelector('div[contenteditable="true"]') || inputBox;
        editor.focus();

        // Clear existing content but preserve mentions
        let existingMentionsHTML = "";
        if (mentionElements && mentionElements.length > 0) {
            for (const mention of mentionElements) {
                existingMentionsHTML += mention.outerHTML + '&nbsp;'; // Add a space
            }
        }
        
        const newTextHTML = text.replace(/\n/g, '</p><p>');
        const finalHTML = `<p>${existingMentionsHTML}${newTextHTML}</p>`;

        document.execCommand('insertHTML', false, finalHTML);
        editor.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    }
}

export const feedActions = new FeedActions();