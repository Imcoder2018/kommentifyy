/**
 * Lead Warmer - LinkedIn API-based profile engagement
 * Uses the same internal LinkedIn APIs that the browser uses.
 * Runs in background service worker context via chrome.scripting.executeScript
 * on a LinkedIn tab where the user is logged in.
 */

import { browser } from '../shared/utils/browser.js';
import { liveLog } from '../shared/services/liveActivityLogger.js';

class LeadWarmer {
  constructor() {
    this.isProcessing = false;
    this.stopFlag = false;
    this.activeTabId = null;
  }

  stop() {
    this.stopFlag = true;
    liveLog.stop('lead_warmer', 'Lead Warmer stopped by user');
  }

  /**
   * Execute a single lead warming touch on a LinkedIn tab.
   * The tab must be on linkedin.com and the user must be logged in.
   */
  async executeTouchOnTab(tabId, params) {
    const {
      vanityId,
      linkedinUrl,
      action,       // follow, like, comment, like_2, comment_2, connect
      touchNumber,
      campaignGoal,
      businessContext,
      firstName,
      lastName,
      prospectId,
    } = params;

    console.log(`[LeadWarmer] Executing touch #${touchNumber} (${action}) on ${vanityId || linkedinUrl}`);
    liveLog.info('lead_warmer', `Touch #${touchNumber}: ${action} on ${firstName || vanityId}`, { vanityId, action });

    try {
      const result = await chrome.scripting.executeScript({
        target: { tabId },
        func: async (vanityId, action, touchNumber) => {
          // === Helpers (must be defined inside executeScript func) ===
          function getCsrf() {
            for (const c of document.cookie.split('; '))
              if (c.startsWith('JSESSIONID=')) return c.substring(11).replace(/"/g, '');
            return null;
          }

          function hdrs(extra = {}) {
            const csrf = getCsrf();
            if (!csrf) throw new Error('JSESSIONID not found');
            return {
              'accept': 'application/vnd.linkedin.normalized+json+2.1',
              'content-type': 'application/json',
              'csrf-token': csrf,
              'x-restli-protocol-version': '2.0.0',
              'x-li-lang': 'en_US',
              ...extra,
            };
          }

          async function liGet(url, params = {}) {
            const qs = new URLSearchParams(params).toString();
            return fetch(qs ? `${url}?${qs}` : url, { headers: hdrs(), credentials: 'include' });
          }

          const wait = ms => new Promise(r => setTimeout(r, ms));

          // === Step 1: Get profile URN and name ===
          async function getProfile(vid) {
            const r = await liGet('https://www.linkedin.com/voyager/api/identity/dash/profiles', {
              q: 'memberIdentity', memberIdentity: vid,
            });
            if (!r.ok) throw new Error(`Profile lookup HTTP ${r.status}`);
            const json = await r.json();
            const all = [...(json.included || []), ...(json.data?.elements || []), ...(json.elements || [])];
            const p = all.find(e => (e.$type || '').toLowerCase().includes('profile') && (e.firstName || e.lastName));
            if (!p) throw new Error(`No profile found for ${vid}`);
            const urn = p.entityUrn || p.urn || '';
            return { urn, firstName: p.firstName || '', lastName: p.lastName || '', headline: p.headline || '' };
          }

          // === Step 2: Get recent posts ===
          async function getRecentPosts(profileUrn, count = 5) {
            const r = await liGet('https://www.linkedin.com/voyager/api/identity/profileUpdatesV2', {
              q: 'memberShareFeed', moduleKey: 'member-shares:phone',
              count: String(count), start: '0', profileUrn,
            });
            if (!r.ok) return [];
            const json = await r.json();
            const UPDATE_TYPES = [
              'com.linkedin.voyager.feed.render.UpdateV2',
              'com.linkedin.voyager.feed.Update',
              'com.linkedin.voyager.dash.feed.Update',
              'com.linkedin.voyager.identity.profile.ProfileUpdate',
            ];
            const included = json.included || [];
            const posts = [];
            for (const e of included) {
              const t = e.$type || '';
              if (!UPDATE_TYPES.some(pt => t.includes(pt))) continue;
              if (!(e.entityUrn || e.urn)) continue;
              const postUrn = e.entityUrn || e.urn;
              const actM = postUrn.match(/urn:li:activity:(\d+)/);
              const actUrn = actM ? `urn:li:activity:${actM[1]}` : postUrn;
              let text = '';
              const comm = e.commentary;
              if (comm?.text) text = typeof comm.text === 'string' ? comm.text : (comm.text?.text || '');
              if (!text) {
                const sc = e.specificContent?.['com.linkedin.ugc.ShareContent'];
                text = sc?.shareCommentary?.text || '';
              }
              if (text) posts.push({ actUrn, text, postUrn });
              if (posts.length >= count) break;
            }
            return posts;
          }

          // === Step 3: Get ugcPost URN from post page ===
          async function getUgcPostUrn(actUrn) {
            try {
              const r = await fetch(
                `https://www.linkedin.com/feed/update/${encodeURIComponent(actUrn)}/`,
                { headers: { accept: 'text/html,application/xhtml+xml' }, credentials: 'include' }
              );
              if (!r.ok) return null;
              const html = await r.text();
              const m = html.match(/urn:li:ugcPost:(\d+)/);
              return m ? `urn:li:ugcPost:${m[1]}` : null;
            } catch { return null; }
          }

          // === Actions ===
          async function doFollow(profileUrn) {
            const r = await fetch('https://www.linkedin.com/voyager/api/feed/follows', {
              method: 'POST', headers: hdrs(), credentials: 'include',
              body: JSON.stringify({ followerUrn: profileUrn }),
            });
            return r.status === 201 || r.status === 200 || r.status === 422;
          }

          async function doLike(actUrn) {
            const r = await fetch('https://www.linkedin.com/voyager/api/voyagerSocialDashReactions', {
              method: 'POST', headers: hdrs(), credentials: 'include',
              body: JSON.stringify({ reactionType: 'LIKE', entityUrn: actUrn }),
            });
            return r.status === 201 || r.status === 200 || r.status === 422;
          }

          async function doComment(actUrn, ugcPostUrn, text) {
            // Send GraphQL signal first
            try {
              await fetch('https://www.linkedin.com/voyager/api/graphql?action=execute&queryId=inSessionRelevanceVoyagerFeedDashClientSignal.c1c9c08097afa4e02954945e9df54091', {
                method: 'POST', headers: hdrs(), credentials: 'include',
                body: JSON.stringify({
                  variables: { backendUpdateUrn: actUrn, actionType: 'submitComment' },
                  queryId: 'inSessionRelevanceVoyagerFeedDashClientSignal.c1c9c08097afa4e02954945e9df54091',
                  includeWebMetadata: true,
                }),
              });
            } catch (error) {
              console.error('Failed to submit comment via API:', error);
            }

            const endpoint = 'https://www.linkedin.com/voyager/api/voyagerSocialDashNormComments?decorationId=com.linkedin.voyager.dash.deco.social.NormComment-43';
            const threadUrns = [ugcPostUrn, actUrn].filter(Boolean);
            for (const threadUrn of threadUrns) {
              try {
                const r = await fetch(endpoint, {
                  method: 'POST',
                  headers: hdrs({ 'content-type': 'application/json; charset=UTF-8' }),
                  credentials: 'include',
                  body: JSON.stringify({
                    commentary: { text, attributesV2: [], '$type': 'com.linkedin.voyager.dash.common.text.TextViewModel' },
                    threadUrn,
                  }),
                });
                if (r.status === 201 || r.status === 200) return true;
              } catch (error) {
                console.error('Failed to submit comment:', error);
              }
            }
            return false;
          }

          // === MAIN EXECUTION ===
          try {
            const profile = await getProfile(vanityId);
            await wait(500 + Math.random() * 500);

            const result = {
              success: false,
              profile,
              posts: [],
              actionResult: null,
              error: null,
            };

            const posts = await getRecentPosts(profile.urn, 5);
            result.posts = posts.map(p => ({ text: p.text.substring(0, 300), actUrn: p.actUrn }));
            await wait(300 + Math.random() * 400);

            // Execute the specific action
            if (action === 'follow') {
              const ok = await doFollow(profile.urn);
              result.success = ok;
              result.actionResult = { action: 'follow', success: ok };
            } else if (action === 'like' || action === 'like_2') {
              const postIdx = action === 'like_2' ? 1 : 0;
              const post = posts[postIdx] || posts[0];
              if (post) {
                const ok = await doLike(post.actUrn);
                result.success = ok;
                result.actionResult = { action: 'like', postUrl: post.actUrn, success: ok };
              } else {
                result.error = 'No posts found to like';
              }
            } else if (action === 'comment' || action === 'comment_2') {
              const postIdx = action === 'comment_2' ? 2 : 1;
              const post = posts[postIdx] || posts[0];
              if (post) {
                const ugcUrn = await getUgcPostUrn(post.actUrn);
                // Return post info - actual comment text will be generated server-side
                result.success = true;
                result.actionResult = {
                  action: 'comment_ready',
                  postText: post.text,
                  postUrl: post.actUrn,
                  ugcPostUrn: ugcUrn,
                  needsCommentText: true,
                };
              } else {
                result.error = 'No posts found to comment on';
              }
            } else if (action === 'connect') {
              // Connection request is done via DOM since Voyager connect API is complex
              result.success = true;
              result.actionResult = { action: 'connect_ready', needsNavigation: true };
            }

            return result;
          } catch (err) {
            return { success: false, error: err.message, profile: null, posts: [] };
          }
        },
        args: [vanityId, action, touchNumber],
      });

      return result?.[0]?.result || { success: false, error: 'No result from script' };
    } catch (err) {
      console.error(`[LeadWarmer] executeScript error:`, err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Execute a comment action - gets comment text from server, then posts it
   */
  async executeComment(tabId, actUrn, ugcPostUrn, commentText) {
    try {
      const result = await chrome.scripting.executeScript({
        target: { tabId },
        func: async (actUrn, ugcPostUrn, commentText) => {
          function getCsrf() {
            for (const c of document.cookie.split('; '))
              if (c.startsWith('JSESSIONID=')) return c.substring(11).replace(/"/g, '');
            return null;
          }
          function hdrs(extra = {}) {
            const csrf = getCsrf();
            return { 'accept': 'application/vnd.linkedin.normalized+json+2.1', 'content-type': 'application/json', 'csrf-token': csrf, 'x-restli-protocol-version': '2.0.0', ...extra };
          }

          // Signal
          try {
            await fetch('https://www.linkedin.com/voyager/api/graphql?action=execute&queryId=inSessionRelevanceVoyagerFeedDashClientSignal.c1c9c08097afa4e02954945e9df54091', {
              method: 'POST', headers: hdrs(), credentials: 'include',
              body: JSON.stringify({ variables: { backendUpdateUrn: actUrn, actionType: 'submitComment' }, queryId: 'inSessionRelevanceVoyagerFeedDashClientSignal.c1c9c08097afa4e02954945e9df54091', includeWebMetadata: true }),
            });
          } catch (error) {
            console.error('Failed to send comment signal:', error);
          }

          const endpoint = 'https://www.linkedin.com/voyager/api/voyagerSocialDashNormComments?decorationId=com.linkedin.voyager.dash.deco.social.NormComment-43';
          const threadUrns = [ugcPostUrn, actUrn].filter(Boolean);
          for (const threadUrn of threadUrns) {
            try {
              const r = await fetch(endpoint, {
                method: 'POST',
                headers: hdrs({ 'content-type': 'application/json; charset=UTF-8' }),
                credentials: 'include',
                body: JSON.stringify({ commentary: { text: commentText, attributesV2: [], '$type': 'com.linkedin.voyager.dash.common.text.TextViewModel' }, threadUrn }),
              });
              if (r.status === 201 || r.status === 200) return { success: true };
            } catch (error) {
              console.error('Failed to post comment:', error);
            }
          }
          return { success: false, error: 'Comment failed with all threadUrn formats' };
        },
        args: [actUrn, ugcPostUrn, commentText],
      });
      return result?.[0]?.result || { success: false };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Execute a connection request via DOM navigation
   */
  async executeConnect(linkedinUrl, connectionNote) {
    console.log(`[LeadWarmer] Sending connection request to ${linkedinUrl}`);
    liveLog.info('lead_warmer', `Sending connection request to ${linkedinUrl}`);

    const tabId = await browser.openTab(linkedinUrl, true);
    if (!tabId) return { success: false, error: 'Failed to open tab' };

    try {
      await new Promise(r => setTimeout(r, 4000));

      const result = await chrome.scripting.executeScript({
        target: { tabId },
        func: async (note) => {
          const wait = ms => new Promise(r => setTimeout(r, ms));

          // Look for Connect button
          const buttons = Array.from(document.querySelectorAll('button'));
          let connectBtn = buttons.find(b => {
            const text = b.textContent?.trim().toLowerCase() || '';
            const label = b.getAttribute('aria-label')?.toLowerCase() || '';
            return (text === 'connect' || label.includes('connect')) && !text.includes('disconnect');
          });

          // Try "More" dropdown if no direct connect button
          if (!connectBtn) {
            const moreBtn = buttons.find(b => (b.textContent?.trim().toLowerCase() || '').includes('more'));
            if (moreBtn) {
              moreBtn.click();
              await wait(1000);
              const menuItems = Array.from(document.querySelectorAll('[role="menuitem"], .artdeco-dropdown__item, li'));
              const connectItem = menuItems.find(i => (i.textContent?.trim().toLowerCase() || '').includes('connect'));
              if (connectItem) { connectItem.click(); await wait(1000); }
            }
          } else {
            connectBtn.click();
            await wait(1000);
          }

          // Handle "Add a note" modal
          if (note) {
            const addNoteBtn = Array.from(document.querySelectorAll('button')).find(b =>
              (b.textContent?.trim().toLowerCase() || '').includes('add a note'));
            if (addNoteBtn) {
              addNoteBtn.click();
              await wait(800);
              const textarea = document.querySelector('textarea[name="message"], textarea#custom-message, textarea');
              if (textarea) {
                textarea.value = note;
                textarea.dispatchEvent(new Event('input', { bubbles: true }));
                await wait(500);
              }
            }
          }

          // Click Send
          await wait(500);
          const sendBtn = Array.from(document.querySelectorAll('button')).find(b => {
            const text = b.textContent?.trim().toLowerCase() || '';
            const label = b.getAttribute('aria-label')?.toLowerCase() || '';
            return (text === 'send' || text === 'send now' || label.includes('send')) && !b.disabled;
          });
          if (sendBtn) {
            sendBtn.click();
            await wait(1000);
            return { success: true };
          }
          return { success: false, error: 'Send button not found' };
        },
        args: [connectionNote || null],
      });

      return result?.[0]?.result || { success: false };
    } finally {
      try { await chrome.tabs.remove(tabId); } catch (error) {
        console.warn('Failed to remove tab:', error);
      }
    }
  }

  /**
   * Fetch profile data for a list of vanity IDs (used on CSV upload for instant loading)
   */
  async fetchProfileData(tabId, vanityId) {
    try {
      const result = await chrome.scripting.executeScript({
        target: { tabId },
        func: async (vanityId) => {
          function getCsrf() {
            for (const c of document.cookie.split('; '))
              if (c.startsWith('JSESSIONID=')) return c.substring(11).replace(/"/g, '');
            return null;
          }
          function hdrs() {
            const csrf = getCsrf();
            return { 'accept': 'application/vnd.linkedin.normalized+json+2.1', 'content-type': 'application/json', 'csrf-token': csrf, 'x-restli-protocol-version': '2.0.0' };
          }
          async function liGet(url, params = {}) {
            const qs = new URLSearchParams(params).toString();
            return fetch(qs ? `${url}?${qs}` : url, { headers: hdrs(), credentials: 'include' });
          }

          try {
            // Get profile
            const r = await liGet('https://www.linkedin.com/voyager/api/identity/dash/profiles', {
              q: 'memberIdentity', memberIdentity: vanityId,
            });
            if (!r.ok) return { success: false, error: `HTTP ${r.status}` };
            const json = await r.json();
            const all = [...(json.included || []), ...(json.data?.elements || []), ...(json.elements || [])];
            const p = all.find(e => (e.$type || '').toLowerCase().includes('profile') && (e.firstName || e.lastName));
            if (!p) return { success: false, error: 'Profile not found' };

            const profileUrn = p.entityUrn || p.urn || '';

            // Get recent posts
            await new Promise(r => setTimeout(r, 300));
            const postsR = await liGet('https://www.linkedin.com/voyager/api/identity/profileUpdatesV2', {
              q: 'memberShareFeed', moduleKey: 'member-shares:phone', count: '5', start: '0', profileUrn,
            });
            let posts = [];
            if (postsR.ok) {
              const pJson = await postsR.json();
              const included = pJson.included || [];
              const updateTypes = ['UpdateV2', 'feed.Update', 'dash.feed.Update', 'ProfileUpdate'];
              for (const e of included) {
                const t = e.$type || '';
                if (!updateTypes.some(ut => t.includes(ut))) continue;
                if (!(e.entityUrn || e.urn)) continue;
                const postUrn = e.entityUrn || e.urn;
                const actM = postUrn.match(/urn:li:activity:(\d+)/);
                const actUrn = actM ? `urn:li:activity:${actM[1]}` : postUrn;
                let text = '';
                const comm = e.commentary;
                if (comm?.text) text = typeof comm.text === 'string' ? comm.text : (comm.text?.text || '');
                if (!text) {
                  const sc = e.specificContent?.['com.linkedin.ugc.ShareContent'];
                  text = sc?.shareCommentary?.text || '';
                }
                if (text) posts.push({ actUrn, text: text.substring(0, 500) });
                if (posts.length >= 5) break;
              }
            }

            return {
              success: true,
              firstName: p.firstName || '',
              lastName: p.lastName || '',
              headline: p.headline || '',
              profileUrn,
              recentPosts: posts,
            };
          } catch (err) {
            return { success: false, error: err.message };
          }
        },
        args: [vanityId],
      });
      return result?.[0]?.result || { success: false, error: 'Script failed' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Process a batch of profile fetches for CSV upload instant loading
   */
  async fetchProfilesBatch(vanityIds) {
    // Find or open a LinkedIn tab
    let tabId = null;
    try {
      const tabs = await chrome.tabs.query({ url: '*://*.linkedin.com/*' });
      if (tabs.length > 0) {
        tabId = tabs[0].id;
      } else {
        tabId = await browser.openTab('https://www.linkedin.com/feed/', true);
        await new Promise(r => setTimeout(r, 3000));
      }
    } catch {
      return { success: false, error: 'No LinkedIn tab available' };
    }

    if (!tabId) return { success: false, error: 'No LinkedIn tab' };

    const results = [];
    for (const vanityId of vanityIds) {
      if (this.stopFlag) break;
      try {
        const data = await this.fetchProfileData(tabId, vanityId);
        results.push({ vanityId, ...data });
        // Random delay between fetches
        await new Promise(r => setTimeout(r, 800 + Math.random() * 1200));
      } catch (err) {
        results.push({ vanityId, success: false, error: err.message });
      }
    }
    return { success: true, results };
  }
}

export const leadWarmer = new LeadWarmer();
