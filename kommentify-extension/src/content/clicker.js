import { feedScraper } from '../shared/dom/feedScraper.js';
import { api } from '../shared/api/api.js';
import { log } from '../shared/utils/logger.js';
import { feedActions } from '../shared/dom/feedActions.js';
import { storage } from '../shared/storage/storage.js';

class Clicker {
    constructor() {
        this.inProgress = false;
    }

    /**
     * Send message to background script via bridge
     */
    async sendMessageToBackground(action, payload) {
        return new Promise((resolve, reject) => {
            const requestId = `req_${Date.now()}_${Math.random()}`;
            
            const listener = (event) => {
                if (event.source !== window || event.data.type !== `COMMENTRON_RUNTIME_RESULT_${requestId}`) {
                    return;
                }
                
                window.removeEventListener('message', listener);
                
                if (event.data.error) {
                    reject(new Error(event.data.error));
                } else {
                    resolve(event.data.data);
                }
            };
            
            window.addEventListener('message', listener);
            
            // Send message to bridge
            window.postMessage({
                type: 'COMMENTRON_RUNTIME_SEND_MESSAGE',
                action: action,
                payload: payload,
                requestId: requestId
            }, '*');
            
            // Timeout after 30 seconds
            setTimeout(() => {
                window.removeEventListener('message', listener);
                reject(new Error('Request timeout'));
            }, 30000);
        });
    }

    click = async (event) => {
        // Find the closest comment button to ensure we are targeting the right action
        // Match all possible comment button selectors
        const commentButton = event.target.closest('button[aria-label*="Comment"], button.comment-button, button[data-control-name="comment_toggle"], button.reply');
        if (!commentButton) return;

        log('log', 'Detected a Comment/Reply button click.');

        // Check if this is from import automation (has data attribute)
        const isFromAutomation = commentButton.hasAttribute('data-import-automation');
        
        // If manual click (not from automation), skip auto-generation
        if (!isFromAutomation) {
            log('log', 'Manual click detected - skipping auto-generation. Use AI Comment button instead.');
            return; // Let user type their own comment
        }
        
        // Remove the automation attribute after checking
        commentButton.removeAttribute('data-import-automation');

        if (this.inProgress) {
            log('warning', "Request already in progress. Aborting.");
            return;
        }

        try {
            this.inProgress = true;
            log('log', 'Starting AI comment generation for automation...');

            // Step 1: Find the comment input box. This is essential.
            log('log', 'Step 1: Finding comment box...');
            const inputBox = await feedScraper.getInputBoxElement(commentButton);
            if (!inputBox) {
                throw new Error("Could not find the comment input box. LinkedIn's page structure may have changed.");
            }
            log('success', 'Step 1: Found comment box.');
            feedActions.displaySpinner(inputBox);

            // Step 2: Scrape the POST details directly from the page.
            log('log', 'Step 2: Scraping post details...');
            const postText = feedScraper.getPostText(commentButton);
            const postUrn = feedScraper.getPostUrn(commentButton); // Needed for logging
            const authorName = feedScraper.getPostAuthor(commentButton); // Get author name
            if (!postText) {
                // We add a fallback to prevent total failure
                log('warning', "Could not read post text, using a generic comment.");
            }
            log('success', 'Step 2: Scraped post details.');
            log('log', '📊 Scraped data - Author:', authorName || 'MISSING', 'Post:', postText ? postText.substring(0, 50) + '...' : 'MISSING');
            
            // Step 3: Load comment settings from storage
            log('log', 'Step 3: Loading comment settings...');
            let commentSettings = {};
            try {
                commentSettings = await storage.get('commentSettings') || {};
                log('log', '⚙️ Comment settings loaded:', commentSettings);
            } catch (error) {
                log('warning', 'Failed to load comment settings, using defaults');
            }
            
            // Step 4: Generate AI comment using OpenAI
            log('log', 'Step 4: Generating AI comment...');
            let generatedComment = "This is a great point, thanks for sharing!";
            
            try {
                // Call OpenAI API via background script through bridge with all settings
                const response = await this.sendMessageToBackground('generateCommentFromContent', {
                    postText: postText || 'Interesting post',
                    authorName: authorName || 'there',
                    goal: commentSettings.goal || 'AddValue',
                    tone: commentSettings.tone || 'Professional',
                    commentLength: commentSettings.commentLength || 'Short',
                    userExpertise: commentSettings.userExpertise || '',
                    userBackground: commentSettings.userBackground || '',
                    postUrn: postUrn
                });
                
                if (response && response.success && response.comment) {
                    generatedComment = response.comment;
                    log('success', 'Step 3: AI comment generated: ' + generatedComment.substring(0, 50) + '...');
                } else {
                    log('warning', 'Step 3: AI generation failed, using fallback comment. Error: ' + (response?.error || 'Unknown'));
                }
            } catch (error) {
                log('error', 'Step 3: Error generating AI comment: ' + error.message);
            }
            
            await new Promise(resolve => setTimeout(resolve, 250)); // Tiny delay for UX

            // Step 4: Paste the comment into the box.
            log('log', 'Step 4: Pasting comment into box...');
            feedActions.pasteCommentText(inputBox, generatedComment);
            log('success', 'Step 4: Comment pasted.');
            
            // Step 5: Wait for submit button and click it
            log('log', 'Step 5: Looking for Post button...');
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for button to enable
            
            const submitButton = await feedScraper.getSubmitButton(inputBox);
            if (submitButton && !submitButton.disabled) {
                log('log', 'Step 5: Found Post button, clicking...');
                submitButton.click();
                log('success', 'Step 5: Post button clicked!');
                
                // Log a generic engagement since we don't have all the profile data
                api.engaged(null, postUrn, 'Comment', false);
                log('success', 'Generation process completed successfully - Comment posted!');
            } else {
                log('warning', 'Step 5: Post button not found or disabled. Comment pasted but not submitted.');
                log('info', 'You can manually click the Post button to submit.');
            }

        } catch (error) {
            log('error', `Error in click handler: ${error.message}`);
            // If the inputBox was found, clear it on error.
            const inputBox = feedScraper.getInputBoxElement(commentButton);
            if (inputBox) feedActions.removeSpinner(inputBox);
            api.logFrontError("clicker.click", error);
        } finally {
            this.inProgress = false;
            log('log', 'Process finished.');
        }
    }
}

export const clicker = new Clicker();