import { feedActions } from '../shared/dom/feedActions.js';
import { feedScraper } from '../shared/dom/feedScraper.js';
import { api } from '../shared/api/api.js';
import * as T from '../shared/storage/constants.js';
import { log } from '../shared/utils/logger.js';

class ReplyCreator {
    async create(clickedElement, inputBox, preferences, profile, account) {
        try {
            log('log', 'Starting ReplyCreator...');
            const mentionElements = await feedScraper.getMentionElements(inputBox);
            feedActions.displaySpinner(inputBox);

            // 1. Scrape data
            const postAuthor = feedScraper.getPostAuthor(clickedElement);
            const postText = feedScraper.getPostText(clickedElement);
            if (!postText) throw new Error("Failed to read post text.");

            const commentText = feedScraper.getCommentText(clickedElement);
            if (!commentText) throw new Error("Failed to read comment text.");

            const engageeSeat = feedScraper.getCommentAuthorSeat(clickedElement);
            const commentUrn = feedScraper.getCommentUrn(clickedElement);
            log('log', 'Scraping complete.');

            // 2. Call API
            log('log', 'Calling API to generate reply...');
            const generatedText = await api.generateReply(engageeSeat, commentUrn, postAuthor, postText, commentText, profile.me, preferences);
            log('success', 'API returned generated text.');

            // 3. Update UI
            feedActions.pasteReplyText(inputBox, mentionElements, generatedText);

            const submitButton = await feedScraper.getSubmitButton(inputBox);
            if (!submitButton || submitButton.hasAttribute(T.DataAttribute.AlreadyRegistered)) return;

            submitButton.setAttribute(T.DataAttribute.AlreadyRegistered, "true");
            submitButton.addEventListener("click", () => {
                 log('log', 'Submit button clicked. Logging engagement.');
                 const isAutomation = clickedElement.hasAttribute(T.DataAttribute.IsAutomation);
                 api.engaged(engageeSeat, commentUrn, T.EngagementType.Reply, isAutomation);
                 if(!isAutomation) {
                    const engagementUrl = commentUrn ? `https://www.linkedin.com/feed/update/${commentUrn}` : window.location.href;
                    api.peep(profile.me, profile.imageUrl, T.EngagementType.Reply, engagementUrl);
                 }
            });
            log('success', 'ReplyCreator finished.');

        } finally {
            feedActions.removeSpinner(inputBox);
        }
    }
}

export const replyCreator = new ReplyCreator();