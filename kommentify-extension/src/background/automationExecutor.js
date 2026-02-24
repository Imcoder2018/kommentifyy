/**
 * AUTOMATION EXECUTOR
 * Based on the user-provided script that is known to work for writing text.
 * The only change is to the submit button selector to make it more flexible.
 */

// This helper function will be injected along with the main task.
const waitForElement = (selector, timeout = 7000) => {
    return new Promise(resolve => {
        const interval = setInterval(() => {
            const element = document.querySelector(selector);
            if (element) { clearInterval(interval); clearTimeout(timeoutId); resolve(element); }
        }, 100);
        const timeoutId = setTimeout(() => { clearInterval(interval); resolve(null); }, timeout);
    });
};

// Task 1: Find the URN of the first post on an activity page.
export const getFirstPostUrn = async () => {
    const postElement = await waitForElement("main ul > li:first-child div[data-urn], div.scaffold-finite-scroll__content > div:first-child div[data-urn]");
    return postElement ? postElement.getAttribute("data-urn") : null;
};

// Task 2: Open the comment box, paste text, and click "Post".
export const publishComment = async (commentText) => {
    // Re-define helper inside the function to ensure it's always injected
    const _waitForElement = (selector, timeout = 7000) => {
        return new Promise(resolve => {
            const intervalId = setInterval(() => {
                const element = document.querySelector(selector);
                if (element) { clearInterval(intervalId); clearTimeout(timeoutId); resolve(element); }
            }, 100);
            const timeoutId = setTimeout(() => { clearInterval(intervalId); resolve(null); }, timeout);
        });
    };
    
    const _delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    try {
        console.log("EXECUTOR: Starting publishComment task.");

        // Step 1: Find and click the main "Comment" button
        const commentButton = await _waitForElement("button.comment-button");
        if (!commentButton) {
            console.error("EXECUTOR: FAILED - Could not find comment button.");
            return false;
        }
        commentButton.click();
        console.log("EXECUTOR: Step 1 - Clicked comment button.");
        
        await _delay(1500); // Wait for comment box to animate open.

        // Step 2: Wait for the editor and write the text
        const commentBox = await _waitForElement("div.ql-editor");
        if (!commentBox) {
            console.error("EXECUTOR: FAILED - Could not find comment editor box.");
            return false;
        }
        commentBox.innerHTML = `<p>${commentText}</p>`;
        console.log("EXECUTOR: Step 2 - Text pasted into editor.");

        // Step 3: Fire events to enable the button
        commentBox.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        commentBox.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
        console.log("EXECUTOR: Step 3 - Dispatched events to enable post button.");

        await _delay(1000); // Wait for the button to become enabled.

        // Step 4: Wait for the "Post" button to become enabled and click it
        const submitButtonSelector = "button.comments-comment-box__submit-button:not(:disabled), button.comments-comment-box__submit-button--cr:not(:disabled)";
        const submitButton = await _waitForElement(submitButtonSelector);
        if (!submitButton) {
            console.error("EXECUTOR: FAILED - Post button did not become enabled.");
            return false;
        }
        submitButton.click();
        console.log("EXECUTOR: Step 4 - Clicked post button. Success!");

        await _delay(3000); // Wait for submission to process
        return true;

    } catch (error) {
        console.error("EXECUTOR: An unexpected error occurred in publishComment.", error);
        return false;
    }
};

// Task 3: Like a post
export const likePost = async () => {
    const _waitForElement = (selector, timeout = 5000) => {
        return new Promise(resolve => {
            const intervalId = setInterval(() => {
                const element = document.querySelector(selector);
                if (element) { clearInterval(intervalId); clearTimeout(timeoutId); resolve(element); }
            }, 100);
            const timeoutId = setTimeout(() => { clearInterval(intervalId); resolve(null); }, timeout);
        });
    };
    
    const _delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    try {
        console.log("EXECUTOR: Starting likePost task.");
        
        // Find like button using the correct selector
        const likeButton = await _waitForElement('button[aria-label*="React Like"]');
        if (!likeButton) {
            console.error("EXECUTOR: FAILED - Could not find like button.");
            return false;
        }
        
        // Check if already liked
        if (likeButton.getAttribute('aria-pressed') === 'true') {
            console.log("EXECUTOR: Post already liked.");
            return false;
        }
        
        likeButton.click();
        console.log("EXECUTOR: Clicked like button. Success!");
        
        await _delay(1000);
        return true;

    } catch (error) {
        console.error("EXECUTOR: An unexpected error occurred in likePost.", error);
        return false;
    }
};

// Task 4: Post to LinkedIn (with configurable delays)
export const postToLinkedIn = async (content, delaySettings = null) => {
    const _pollForElement = (finderFn, timeout = 10000) => {
        return new Promise(resolve => {
            const start = Date.now();
            const check = () => {
                const el = finderFn();
                if (el) return resolve(el);
                if (Date.now() - start > timeout) return resolve(null);
                setTimeout(check, 500);
            };
            check();
        });
    };
    
    const _delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const _findStartBtn = () => {
        // Method 1: New LinkedIn UI - data-view-name attribute (most reliable)
        const s0 = document.querySelector('[data-view-name="share-sharebox-focus"]');
        if (s0) return s0;
        // Method 2: Look for any clickable element with "Start a post" text
        const clickables = document.querySelectorAll('button, [role="button"]');
        for (const el of clickables) {
            const txt = (el.textContent || '').toLowerCase();
            if (txt.includes('start a post')) return el;
        }
        // Method 3: aria-label based detection
        for (const el of clickables) {
            const label = (el.getAttribute('aria-label') || '').toLowerCase();
            if (label.includes('start a post')) return el;
        }
        // Method 4: Legacy selectors (fallback)
        const s1 = document.querySelector('div.share-box-feed-entry__top-bar button');
        if (s1) return s1;
        return document.querySelector('.share-box-feed-entry__trigger');
    };

    const _findEditor = () => {
        const dialog = document.querySelector('[role="dialog"]');
        if (dialog) {
            // Method 1: New LinkedIn UI - .editor-content .ql-editor (most common)
            const e1 = dialog.querySelector('.editor-content .ql-editor[contenteditable="true"]');
            if (e1) return e1;
            // Method 2: Direct .ql-editor
            const e2 = dialog.querySelector('.ql-editor[contenteditable="true"]');
            if (e2) return e2;
            // Method 3: Role-based detection
            const e3 = dialog.querySelector('[role="textbox"][contenteditable="true"]');
            if (e3) return e3;
            // Method 4: Aria-multiline
            const e4 = dialog.querySelector('[contenteditable="true"][aria-multiline="true"]');
            if (e4) return e4;
        }
        // Fallback: Search entire document
        const e5 = document.querySelector('.editor-content .ql-editor[contenteditable="true"]');
        if (e5) return e5;
        const e6 = document.querySelector('.ql-editor[contenteditable="true"]');
        if (e6) return e6;
        // Method 5: Logic-based detection via placeholder text
        for (const el of document.querySelectorAll('[contenteditable="true"]')) {
            const ph = (el.getAttribute('data-placeholder') || el.getAttribute('aria-placeholder') || '').toLowerCase();
            if (ph.includes('want to talk about')) return el;
        }
        return null;
    };

    const _findPostBtn = () => {
        const dialog = document.querySelector('[role="dialog"]');
        const scope = dialog || document;
        for (const btn of scope.querySelectorAll('button')) {
            const txt = (btn.textContent || '').trim().toLowerCase();
            if (txt === 'post') return btn;
        }
        return null;
    };

    // Default delays if not provided
    const delays = delaySettings || {
        postWriterPageLoadDelay: 10,
        postWriterClickDelay: 5,
        postWriterTypingDelay: 5,
        postWriterSubmitDelay: 3
    };

    try {
        console.log("EXECUTOR: Starting postToLinkedIn task with delays:", delays);

        // Wait for page to load (after opening LinkedIn)
        await _delay(delays.postWriterPageLoadDelay * 1000);
        console.log(`EXECUTOR: Waited ${delays.postWriterPageLoadDelay}s for page load.`);

        // Step 1: Click start post button
        const startPostButton = await _pollForElement(_findStartBtn, 10000);
        if (!startPostButton) {
            console.error("EXECUTOR: FAILED - Could not find start post button.");
            return false;
        }
        startPostButton.click();
        console.log("EXECUTOR: Step 1 - Clicked start post button.");
        
        // Step 2: Poll for editor (with click delay as extra timeout)
        const editorTimeout = (delays.postWriterClickDelay * 1000) + 8000;
        console.log(`EXECUTOR: Polling for editor (timeout ${editorTimeout}ms)...`);
        const editor = await _pollForElement(_findEditor, editorTimeout);
        if (!editor) {
            console.error("EXECUTOR: FAILED - Could not find post editor after polling.");
            return false;
        }
        console.log("EXECUTOR: Editor found via logic-based detection.");
        
        // Wait before typing content
        await _delay(delays.postWriterTypingDelay * 1000);
        console.log(`EXECUTOR: Waited ${delays.postWriterTypingDelay}s before typing.`);
        
        // Insert content line by line
        editor.innerHTML = '';
        editor.focus();
        const lines = content.split('\n');
        lines.forEach((line) => {
            if (line.trim() === '') {
                editor.appendChild(document.createElement('br'));
            } else {
                const p = document.createElement('p');
                p.textContent = line;
                editor.appendChild(p);
            }
        });
        
        // Dispatch events
        editor.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        editor.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
        console.log("EXECUTOR: Step 2 - Content written to editor.");

        await _delay(1500); // Wait for post button to enable

        // Wait before submitting post
        await _delay(delays.postWriterSubmitDelay * 1000);
        console.log(`EXECUTOR: Waited ${delays.postWriterSubmitDelay}s before submitting.`);

        // Step 3: Find post button by text content
        const postButton = _findPostBtn();
        if (!postButton) {
            console.error("EXECUTOR: FAILED - Could not find post button.");
            return false;
        }
        
        // Check if button is enabled
        if (postButton.disabled) {
            console.error("EXECUTOR: FAILED - Post button is disabled.");
            return false;
        }
        
        postButton.click();
        console.log("EXECUTOR: Step 3 - Clicked post button. Success!");

        await _delay(3000); // Wait for post to be created
        return true;

    } catch (error) {
        console.error("EXECUTOR: An unexpected error occurred in postToLinkedIn.", error);
        return false;
    }
};