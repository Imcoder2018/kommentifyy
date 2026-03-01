/**
 * LinkedIn Engagement - Voyager API + Fallback Implementation
 * ==========================================================
 * Uses LinkedIn's internal Voyager API for likes/comments with
 * fallback to DOM-based automation if API fails.
 */

import { browser } from '../shared/utils/browser.js';
import { liveLog } from '../shared/services/liveActivityLogger.js';

/**
 * Execute like on a LinkedIn post using Voyager API with fallback
 */
export async function executeVoyagerLike(tabId, postUrn) {
  console.log('[VoyagerLike] Starting Voyager API like for:', postUrn);

  const result = await chrome.scripting.executeScript({
    target: { tabId },
    func: async (urn) => {
      try {
        // === Voyager API Implementation ===
        function getCsrf() {
          for (const c of document.cookie.split('; ')) {
            if (c.startsWith('JSESSIONID=')) return c.substring(11).replace(/"/g, '');
          }
          return null;
        }

        function genPageInstanceId() {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
          return Array.from({ length: 22 }, () => chars[Math.floor(Math.random() * 64)]).join('') + '==';
        }

        function liTrack(overrides = {}) {
          return JSON.stringify({
            clientVersion: '1.13.42546',
            mpVersion: '1.13.42546',
            osName: 'web',
            timezoneOffset: -(new Date().getTimezoneOffset() / 60),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            deviceFormFactor: 'DESKTOP',
            mpName: 'voyager-web',
            displayDensity: window.devicePixelRatio || 1.25,
            displayWidth: window.screen.width || 1920,
            displayHeight: window.screen.height || 1080,
            ...overrides,
          });
        }

        function voyagerHeaders(extra = {}) {
          const csrf = getCsrf();
          if (!csrf) throw new Error('JSESSIONID not found — are you logged in?');
          const pageInstanceId = genPageInstanceId();
          return {
            'accept': 'application/vnd.linkedin.normalized+json+2.1',
            'content-type': 'application/json; charset=utf-8',
            'csrf-token': csrf,
            'x-li-lang': 'en_US',
            'x-li-track': liTrack(),
            'x-li-page-instance': `urn:li:page:d_flagship3_detail_base;${pageInstanceId}`,
            'x-restli-protocol-version': '2.0.0',
            ...extra,
          };
        }

        const wait = ms => new Promise(r => setTimeout(r, ms));
        const jitter = (base, pct = 0.4) => base + Math.floor((Math.random() - 0.5) * 2 * base * pct);

        // Resolve URN from various formats
        function resolveUrn(target) {
          const match = String(target).match(/([0-9]{19})/);
          if (match) return `urn:li:activity:${match[1]}`;
          if (target.includes('urn:li:activity:')) return target;
          throw new Error('Could not find a 19-digit post ID');
        }

        const POST_URN = resolveUrn(urn);

        // Step 1: Send like signal
        console.log('[VoyagerLike] Step 1: Sending like signal...');
        try {
          await fetch('/voyager/api/graphql?action=execute&queryId=inSessionRelevanceVoyagerFeedDashClientSignal.c1c9c08097afa4e02954945e9df54091', {
            method: 'POST',
            headers: voyagerHeaders(),
            credentials: 'include',
            body: JSON.stringify({
              variables: { backendUpdateUrn: POST_URN, actionType: 'likeUpdate' },
              queryId: 'inSessionRelevanceVoyagerFeedDashClientSignal.c1c9c08097afa4e02954945e9df54091',
              includeWebMetadata: true,
            }),
          });
        } catch (e) {
          console.log('[VoyagerLike] Signal failed, continuing...', e.message);
        }

        await wait(jitter(220));

        // Step 2: Send LIKE reaction
        console.log('[VoyagerLike] Step 2: Sending LIKE reaction...');
        const likeResponse = await fetch('/voyager/api/graphql?action=execute&queryId=voyagerSocialDashReactions.b731222600772fd42464c0fe19bd722b', {
          method: 'POST',
          headers: voyagerHeaders(),
          credentials: 'include',
          body: JSON.stringify({
            variables: { entity: { reactionType: 'LIKE' }, threadUrn: POST_URN },
            queryId: 'voyagerSocialDashReactions.b731222600772fd42464c0fe19bd722b',
            includeWebMetadata: true,
          }),
        });

        console.log('[VoyagerLike] Like response status:', likeResponse.status);

        if (likeResponse.status === 200 || likeResponse.status === 201) {
          return { success: true, method: 'voyager', status: likeResponse.status };
        }

        if (likeResponse.status === 422) {
          const text = await likeResponse.text();
          if (text.includes('already')) {
            return { success: true, method: 'voyager', status: likeResponse.status, alreadyLiked: true };
          }
        }

        // Voyager API failed, throw to trigger fallback
        throw new Error(`Voyager API failed with status ${likeResponse.status}`);

      } catch (error) {
        console.log('[VoyagerLike] Voyager API failed:', error.message);
        // Return special marker to trigger fallback
        return { success: false, needsFallback: true, error: error.message };
      }
    },
    args: [postUrn]
  });

  const scriptResult = result?.[0]?.result;

  // If Voyager API succeeded, return result
  if (scriptResult?.success) {
    console.log('[VoyagerLike] Voyager API succeeded');
    return scriptResult;
  }

  // If Voyager failed and needs fallback, execute DOM fallback
  console.log('[VoyagerLike] Falling back to DOM method...');
  return await executeDomLike(tabId, postUrn);
}

/**
 * DOM-based fallback for liking a LinkedIn post
 */
async function executeDomLike(tabId, postUrn) {
  console.log('[DomLike] Executing DOM fallback like for:', postUrn);

  const result = await chrome.scripting.executeScript({
    target: { tabId },
    func: async (urn) => {
      try {
        await new Promise(r => setTimeout(r, 1500));

        // Find the like button - multiple selectors for robustness
        const likeSelectors = [
          'button[aria-label*="Like"]',
          'button[aria-label*="React"]',
          'button.react-button__trigger',
          'button[data-control-name="like"]',
          'button.social-actions-button--reaction',
          '.social-actions-button[aria-label*="Like"]'
        ];

        let likeButton = null;
        for (const selector of likeSelectors) {
          likeButton = document.querySelector(selector);
          if (likeButton && !likeButton.getAttribute('aria-pressed')) break;
        }

        if (!likeButton) throw new Error('Like button not found on page');

        // Check if already liked
        const isLiked = likeButton.getAttribute('aria-pressed') === 'true' ||
          likeButton.classList.contains('active') ||
          likeButton.querySelector('.reactions-icon--active');

        if (isLiked) {
          return { success: true, method: 'dom', alreadyLiked: true };
        }

        // Click the like button
        likeButton.click();
        await new Promise(r => setTimeout(r, 800));

        return { success: true, method: 'dom' };
      } catch (e) {
        return { success: false, method: 'dom', error: e.message };
      }
    },
    args: [postUrn]
  });

  return result?.[0]?.result;
}

/**
 * Execute comment on a LinkedIn post using Voyager API with fallback
 */
export async function executeVoyagerComment(tabId, postUrn, commentText) {
  console.log('[VoyagerComment] Starting Voyager API comment for:', postUrn);

  const result = await chrome.scripting.executeScript({
    target: { tabId },
    func: async (urn, text) => {
      try {
        // === Voyager API Implementation ===
        function getCsrf() {
          for (const c of document.cookie.split('; ')) {
            if (c.startsWith('JSESSIONID=')) return c.substring(11).replace(/"/g, '');
          }
          return null;
        }

        function genPageInstanceId() {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
          return Array.from({ length: 22 }, () => chars[Math.floor(Math.random() * 64)]).join('') + '==';
        }

        function liTrack(overrides = {}) {
          return JSON.stringify({
            clientVersion: '1.13.42546',
            mpVersion: '1.13.42546',
            osName: 'web',
            timezoneOffset: -(new Date().getTimezoneOffset() / 60),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            deviceFormFactor: 'DESKTOP',
            mpName: 'voyager-web',
            displayDensity: window.devicePixelRatio || 1.25,
            displayWidth: window.screen.width || 1920,
            displayHeight: window.screen.height || 1080,
            ...overrides,
          });
        }

        function voyagerHeaders(extra = {}) {
          const csrf = getCsrf();
          if (!csrf) throw new Error('JSESSIONID not found — are you logged in?');
          const pageInstanceId = genPageInstanceId();
          return {
            'accept': 'application/vnd.linkedin.normalized+json+2.1',
            'content-type': 'application/json; charset=utf-8',
            'csrf-token': csrf,
            'x-li-lang': 'en_US',
            'x-li-track': liTrack(),
            'x-li-page-instance': `urn:li:page:d_flagship3_detail_base;${pageInstanceId}`,
            'x-restli-protocol-version': '2.0.0',
            ...extra,
          };
        }

        const wait = ms => new Promise(r => setTimeout(r, ms));
        const jitter = (base, pct = 0.4) => base + Math.floor((Math.random() - 0.5) * 2 * base * pct);

        // Resolve URN from various formats
        function resolveUrn(target) {
          const match = String(target).match(/([0-9]{19})/);
          if (match) return `urn:li:activity:${match[1]}`;
          if (target.includes('urn:li:activity:')) return target;
          throw new Error('Could not find a 19-digit post ID');
        }

        const POST_URN = resolveUrn(urn);

        // Step 1: Comment friction check
        console.log('[VoyagerComment] Step 1: Comment friction check...');
        try {
          await fetch('/voyager/api/graphql?includeWebMetadata=true&variables=()&queryId=voyagerFeedDashCommentPreSubmitFriction.b31c213182bef51fe7dd771542efa5e2', {
            method: 'GET',
            headers: voyagerHeaders(),
            credentials: 'include',
          });
        } catch (e) { /* ignore */ }

        await wait(jitter(600));

        // Step 2: Courtesy reminder / tone check
        console.log('[VoyagerComment] Step 2: Courtesy reminder...');
        try {
          await fetch(`/voyager/api/voyagerFeedDashCourtesyReminder?q=courtesyReminder&text=${encodeURIComponent(text)}`, {
            method: 'GET',
            headers: voyagerHeaders(),
            credentials: 'include',
          });
        } catch (e) { /* ignore */ }

        await wait(jitter(400));

        // Step 3: Comment signal
        console.log('[VoyagerComment] Step 3: Sending comment signal...');
        try {
          await fetch('/voyager/api/graphql?action=execute&queryId=inSessionRelevanceVoyagerFeedDashClientSignal.c1c9c08097afa4e02954945e9df54091', {
            method: 'POST',
            headers: voyagerHeaders(),
            credentials: 'include',
            body: JSON.stringify({
              variables: { backendUpdateUrn: POST_URN, actionType: 'submitComment' },
              queryId: 'inSessionRelevanceVoyagerFeedDashClientSignal.c1c9c08097afa4e02954945e9df54091',
            }),
          });
        } catch (e) { /* ignore */ }

        await wait(jitter(120));

        // Step 4: Post comment
        console.log('[VoyagerComment] Step 4: Posting comment...');
        const commentPath = '/voyager/api/voyagerSocialDashNormComments?decorationId=com.linkedin.voyager.dash.deco.social.NormComment-43';

        const headers = voyagerHeaders({
          'x-li-pem-metadata': 'Voyager - Feed - Comments=create-a-comment',
          'x-li-deco-include-micro-schema': 'true',
        });

        const commentResponse = await fetch(commentPath, {
          method: 'POST',
          headers: headers,
          credentials: 'include',
          body: JSON.stringify({
            commentary: {
              text: text,
              attributesV2: [],
              '$type': 'com.linkedin.voyager.dash.common.text.TextViewModel',
            },
            threadUrn: POST_URN,
          }),
        });

        console.log('[VoyagerComment] Comment response status:', commentResponse.status);

        if (commentResponse.status === 201 || commentResponse.status === 200) {
          try {
            const j = await commentResponse.json();
            const entityUrn = j?.data?.entityUrn || j?.entityUrn || '(unknown urn)';
            return { success: true, method: 'voyager', entityUrn };
          } catch {
            return { success: true, method: 'voyager' };
          }
        }

        // Voyager API failed, throw to trigger fallback
        throw new Error(`Voyager API failed with status ${commentResponse.status}`);

      } catch (error) {
        console.log('[VoyagerComment] Voyager API failed:', error.message);
        return { success: false, needsFallback: true, error: error.message };
      }
    },
    args: [postUrn, commentText]
  });

  const scriptResult = result?.[0]?.result;

  // If Voyager API succeeded, return result
  if (scriptResult?.success) {
    console.log('[VoyagerComment] Voyager API succeeded');
    return scriptResult;
  }

  // If Voyager failed and needs fallback, execute DOM fallback
  console.log('[VoyagerComment] Falling back to DOM method...');
  return await executeDomComment(tabId, postUrn, commentText);
}

/**
 * DOM-based fallback for commenting on a LinkedIn post
 */
async function executeDomComment(tabId, postUrn, commentText) {
  console.log('[DomComment] Executing DOM fallback comment for:', postUrn);

  const result = await chrome.scripting.executeScript({
    target: { tabId },
    func: async (urn, text) => {
      try {
        await new Promise(r => setTimeout(r, 1500));

        // Find the comment box - multiple selectors for robustness
        const commentSelectors = [
          '.comments-comment-box__form textarea',
          '.comments-comment-texteditor',
          'div[role="textbox"][contenteditable="true"]',
          '.ql-editor[contenteditable="true"]',
          'div.ql-editor',
          '.comments-comment-box-comment__text-editor'
        ];

        let commentBox = null;
        for (const selector of commentSelectors) {
          commentBox = document.querySelector(selector);
          if (commentBox) break;
        }

        if (!commentBox) {
          // Try clicking "Add a comment" to open the box
          const addCommentBtn = document.querySelector('button[aria-label*="comment"]') ||
            document.querySelector('.comments-comment-box__open-button');
          if (addCommentBtn) {
            addCommentBtn.click();
            await new Promise(r => setTimeout(r, 1000));
            for (const selector of commentSelectors) {
              commentBox = document.querySelector(selector);
              if (commentBox) break;
            }
          }
        }

        if (!commentBox) throw new Error('Comment box not found on page');

        // Focus and type the comment
        commentBox.focus();
        await new Promise(r => setTimeout(r, 300));

        // Set the text content
        if (commentBox.tagName === 'TEXTAREA') {
          commentBox.value = text;
          commentBox.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
          commentBox.textContent = text;
          commentBox.dispatchEvent(new Event('input', { bubbles: true }));
        }

        await new Promise(r => setTimeout(r, 500));

        // Find and click the submit button
        const submitSelectors = [
          'button.comments-comment-box__submit-button:not([disabled])',
          'button[type="submit"][aria-label*="Post"]',
          'button.comments-comment-box-comment__submit-button',
          'button[data-control-name="comment.post"]'
        ];

        let submitButton = null;
        for (const selector of submitSelectors) {
          submitButton = document.querySelector(selector);
          if (submitButton && !submitButton.disabled) break;
        }

        if (!submitButton) throw new Error('Submit button not found or disabled');

        submitButton.click();
        await new Promise(r => setTimeout(r, 1500));

        return { success: true, method: 'dom' };
      } catch (e) {
        return { success: false, method: 'dom', error: e.message };
      }
    },
    args: [postUrn, commentText]
  });

  return result?.[0]?.result;
}

/**
 * Execute both like and comment in sequence (for Lead Warmer)
 */
export async function executeVoyagerEngagement(tabId, postUrn, options = {}) {
  const { doLike = true, doComment = false, commentText = '' } = options;
  const results = { likedOk: false, commentUrn: null, errors: [] };

  if (doLike) {
    const likeResult = await executeVoyagerLike(tabId, postUrn);
    results.likedOk = likeResult?.success || false;
    if (!likeResult?.success) {
      results.errors.push(`Like failed: ${likeResult?.error}`);
    }
  }

  if (doComment && commentText) {
    const commentResult = await executeVoyagerComment(tabId, postUrn, commentText);
    results.commentUrn = commentResult?.entityUrn || (commentResult?.success ? 'success' : null);
    if (!commentResult?.success) {
      results.errors.push(`Comment failed: ${commentResult?.error}`);
    }
  }

  return results;
}
