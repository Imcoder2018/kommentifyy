import { feedActions } from '../shared/dom/feedActions.js';
import { feedScraper } from '../shared/dom/feedScraper.js';
import { api } from '../shared/api/api.js';
import * as T from '../shared/storage/constants.js';
import { log } from '../shared/utils/logger.js';

class CommentCreator {
    async create(clickedElement, inputBox, preferences, profile, account) {
        try {
            log('log', 'Starting CommentCreator...');
            feedActions.displaySpinner(inputBox);

            // 1. Scrape data
            const postAuthor = preferences.commentMentionPostAuthor ? feedScraper.getPostAuthor(clickedElement) : null;
            let postText = feedScraper.getPostText(clickedElement);

            const articleUrl = feedScraper.getPostInnerArticleUrlIfExist(clickedElement);
            if (articleUrl) {
                postText = await feedScraper.getArticleText(articleUrl) || postText;
            }

            if (!postText) throw new Error("Failed to read post text.");

            const engageeSeat = feedScraper.getPostAuthorSeat(clickedElement);
            const postUrn = feedScraper.getPostUrn(clickedElement);
            log('log', 'Scraping complete.');

            // 2. Call API
            log('log', 'Calling API to generate comment...');
            const generatedText = await api.generateComment(engageeSeat, postUrn, postAuthor, postText, preferences);
            log('success', 'API returned generated text.');

            // 3. Update UI
            feedActions.pasteCommentText(inputBox, generatedText);

            const submitButton = await feedScraper.getSubmitButton(inputBox);
            if (!submitButton || submitButton.hasAttribute(T.DataAttribute.AlreadyRegistered)) return;

            submitButton.setAttribute(T.DataAttribute.AlreadyRegistered, "true");
            submitButton.addEventListener("click", () => {
                log('log', 'Submit button clicked. Logging engagement.');
                const isAutomation = clickedElement.hasAttribute(T.DataAttribute.IsAutomation);
                api.engaged(engageeSeat, postUrn, T.EngagementType.Comment, isAutomation);
                if (!isAutomation) {
                     const engagementUrl = postUrn ? `https://www.linkedin.com/feed/update/${postUrn}` : window.location.href;
                     api.peep(profile.me, profile.imageUrl, T.EngagementType.Comment, engagementUrl);
                }
            });
            log('success', 'CommentCreator finished.');

        } finally {
            feedActions.removeSpinner(inputBox);
        }
    }
}

export const commentCreator = new CommentCreator();