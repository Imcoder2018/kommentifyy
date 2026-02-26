/**
 * LinkedIn Browser Script: Get My Posts
 * ========================================
 * Mirrors: linkitin/feed.py → get_my_posts()
 *          linkitin/chrome_data.py → extract_my_posts_data()
 *                                  → _extract_activity_posts_from_dom()
 *                                  → _scroll_and_collect_activity()
 *                                  → _expand_truncated_posts()
 *
 * PURPOSE:
 *   Fetches the authenticated user's own posts.
 *   Navigates to /in/me/recent-activity/all/ and extracts posts using
 *   [data-urn] DOM elements (scrolling to load more), falling back to
 *   <code> entity stores or the Voyager REST API.
 *
 * HOW TO USE:
 *   1. Open any LinkedIn page in your browser (logged in).
 *   2. Open DevTools Console (F12).
 *   3. Paste and run this script. It will navigate to your activity page
 *      and begin collecting posts.
 *
 * RETURNS:
 *   Posts stored in window._liMyPosts
 */

// ─── Config ───────────────────────────────────────────────────────────────────
const MY_POSTS_LIMIT  = 20;  // mirrors client.get_my_posts(limit=20)
const SCROLL_COUNT    = 3;   // mirrors max(1, limit // 5)

// ─── Endpoints ────────────────────────────────────────────────────────────────
const VOYAGER_BASE    = "https://www.linkedin.com/voyager/api";
const USER_POSTS_URL  = `${VOYAGER_BASE}/identity/profileUpdatesV2`;

// ─── Auth helpers ─────────────────────────────────────────────────────────────
function getCsrfToken() {
  for (const c of document.cookie.split("; ")) {
    if (c.startsWith("JSESSIONID=")) return c.substring(11).replace(/"/g, "");
  }
  throw new Error("JSESSIONID not found — are you logged into LinkedIn?");
}
function buildHeaders(extra = {}) {
  return {
    "Accept": "application/vnd.linkedin.normalized+json+2.1",
    "Accept-Language": "en-US,en;q=0.9",
    "csrf-token": getCsrfToken(),
    "x-li-lang": "en_US",
    "x-restli-protocol-version": "2.0.0",
    ...extra,
  };
}
async function liGet(url, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const fullUrl = qs ? `${url}?${qs}` : url;
  return fetch(fullUrl, { method: "GET", headers: buildHeaders(), credentials: "include" });
}
async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── Feed entity parsers (same as 01_get_feed.js) ────────────────────────────
function extractInnerUrn(updateUrn) {
  for (const prefix of ["urn:li:activity:", "urn:li:ugcPost:"]) {
    const idx = updateUrn.indexOf(prefix);
    if (idx >= 0) {
      const rest = updateUrn.substring(idx);
      let end = rest.length;
      for (const sep of [",", ")"]) {
        const pos = rest.indexOf(sep);
        if (pos >= 0 && pos < end) end = pos;
      }
      return rest.substring(0, end);
    }
  }
  return "";
}
function extractText(entity) {
  const c = entity.commentary;
  if (c && typeof c === "object") {
    const t = c.text;
    if (typeof t === "string") return t;
    if (t && typeof t === "object") return t.text || "";
  }
  const specific = entity.specificContent;
  if (specific) {
    const sc = specific["com.linkedin.ugc.ShareContent"];
    if (sc && sc.shareCommentary) return sc.shareCommentary.text || "";
  }
  return "";
}
function extractAuthor(entity, profiles) {
  const actor = entity.actor;
  if (actor) {
    const nameObj = actor.name;
    const fullName = (typeof nameObj === "string") ? nameObj : (nameObj && nameObj.text) || "";
    if (fullName) {
      const parts = fullName.split(" ");
      return { urn: actor.urn || "", firstName: parts[0], lastName: parts.slice(1).join(" ") };
    }
  }
  const authorUrn = entity.author;
  if (typeof authorUrn === "string" && profiles[authorUrn]) {
    const p = profiles[authorUrn];
    return { urn: authorUrn, firstName: p.firstName || "", lastName: p.lastName || "" };
  }
  return null;
}
function readCounts(e) {
  return { likes: e.numLikes || 0, comments: e.numComments || 0, reposts: e.numShares || 0, impressions: e.numImpressions || 0 };
}
function extractSocialCounts(urn, entity, socialCounts, socialDetails) {
  const actUrn = extractInnerUrn(urn);
  if (actUrn && socialCounts[actUrn]) return readCounts(socialCounts[actUrn]);
  if (socialCounts[urn]) return readCounts(socialCounts[urn]);
  if (actUrn) {
    for (const [k, v] of Object.entries(socialCounts)) {
      if (k.includes(actUrn) || actUrn.includes(k)) return readCounts(v);
    }
  }
  return { likes: 0, comments: 0, reposts: 0, impressions: 0 };
}
function extractCreatedAt(entity) {
  if (entity.created && entity.created.time > 0) return new Date(entity.created.time);
  if (typeof entity.createdAt === "number" && entity.createdAt > 0) return new Date(entity.createdAt);
  return null;
}
function extractShareUrn(entity) {
  const m = entity.metadata;
  if (m && typeof m.shareUrn === "string" && m.shareUrn.startsWith("urn:li:share:")) return m.shareUrn;
  return null;
}
function isPostEntity(t) {
  return ["com.linkedin.voyager.feed.render.UpdateV2","com.linkedin.voyager.feed.Update","com.linkedin.voyager.dash.feed.Update","com.linkedin.voyager.identity.profile.ProfileUpdate"].some(pt => t.includes(pt));
}
function parseFeedResponse(data, limit) {
  const included = data.included || [];
  const profiles = {}, socialCounts = {}, socialDetails = {}, threadUrnMap = {};
  for (const e of included) {
    const t = e.$type || "", u = e.entityUrn || e.urn || "";
    if (t.includes("MiniProfile") || t.includes("Profile")) { profiles[u] = e; }
    else if (t.includes("SocialActivityCounts")) { const p = u.split("fsd_socialActivityCounts:"); if(p.length===2) socialCounts[p[1]]=e; socialCounts[u]=e; }
    else if (t.includes("SocialDetail")) { const tid = e.threadId || u; socialDetails[tid]=e; if((e.threadUrn||"").startsWith("urn:li:ugcPost:")) { const a=extractInnerUrn(u); if(a) threadUrnMap[a]=e.threadUrn; } }
  }
  const posts = [];
  for (const e of included) {
    if (posts.length >= limit) break;
    const t = e.$type || "";
    if (!isPostEntity(t)) continue;
    const urn = e.entityUrn || e.urn || "";
    if (!urn) continue;
    const text = extractText(e);
    if (!text) continue;
    const author = extractAuthor(e, profiles);
    const counts = extractSocialCounts(urn, e, socialCounts, socialDetails);
    const createdAt = extractCreatedAt(e);
    const shareUrn = extractShareUrn(e);
    const innerUrn = extractInnerUrn(urn);
    const threadUrn = innerUrn ? (threadUrnMap[innerUrn] || null) : null;
    posts.push({ urn, text, author, ...counts, createdAt, shareUrn, threadUrn });
  }
  return posts;
}

// ─── <code> store extraction (mirrors chrome_data._extract_page_entities) ────
function extractPageEntities() {
  const els = document.querySelectorAll('code[id^="bpr-guid-"]');
  const entities = [];
  for (const el of els) {
    try { const d = JSON.parse(el.textContent); if (d.included) entities.push(...d.included); } catch(_) {}
  }
  return entities;
}

// ─── DOM extraction from [data-urn] (mirrors _extract_activity_posts_from_dom) ──

/** mirrors chrome_data._expand_truncated_posts() */
function expandTruncatedPosts() {
  const btns = document.querySelectorAll("button.see-more");
  btns.forEach(b => b.click());
  return btns.length;
}

/**
 * mirrors _JS_EXTRACT_ACTIVITY_POSTS inline script in chrome_data.py
 * Extracts posts from [data-urn] elements on the activity page.
 */
function extractActivityPostsFromDom() {
  const results = [];
  
  // Try multiple selectors for LinkedIn's varying markup
  const selectors = [
    "[data-urn*='activity']",
    "[data-urn*='ugcPost']",
    ".profile-creator-shared-feed-update__container",
    ".feed-shared-update-v2",
    "article.feed-shared-update-v2"
  ];
  
  let postCards = [];
  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      console.log(`  [DOM] Found ${elements.length} elements with selector: ${selector}`);
      postCards = elements;
      break;
    }
  }
  
  if (postCards.length === 0) {
    console.warn(`  [DOM] No post cards found with any selector`);
    return [];
  }

  for (const el of postCards) {
    const urn = el.getAttribute("data-urn") || el.getAttribute("data-id") || "";
    if (!urn) {
      console.log(`  [DOM] Skipping element without URN`);
      continue;
    }

    // Try multiple text selectors
    let textEl = el.querySelector(".feed-shared-update-v2__description, .feed-shared-text, .feed-shared-inline-show-more-text, .update-components-text");
    if (!textEl) textEl = el.querySelector(".visually-hidden");
    if (!textEl) textEl = el.querySelector("[dir='ltr']");
    
    let text = textEl ? textEl.textContent.trim() : "";
    
    // Clean up text
    text = text.replace(/\s+/g, " ").trim();
    
    if (text.length < 10) {
      console.log(`  [DOM] Skipping post with short text (${text.length} chars)`);
      continue;
    }

    let likes = 0, comments = 0, reposts = 0;
    
    // Try social counts container first
    const socialBar = el.querySelector('.social-details-social-counts, .social-details-social-activity');
    if (socialBar) {
      const socialText = socialBar.textContent || "";
      const likesMatch = socialText.match(/([\d,]+)\s*reaction/i);
      const commentsMatch = socialText.match(/([\d,]+)\s*comment/i);
      const repostsMatch = socialText.match(/([\d,]+)\s*repost/i);
      
      if (likesMatch) likes = parseInt(likesMatch[1].replace(/,/g, ""), 10);
      if (commentsMatch) comments = parseInt(commentsMatch[1].replace(/,/g, ""), 10);
      if (repostsMatch) reposts = parseInt(repostsMatch[1].replace(/,/g, ""), 10);
    } else {
      // Fallback: scan all spans
      const spans = el.querySelectorAll("span");
      for (const s of spans) {
        const t = s.textContent.trim();
        let m;
        if ((m = t.match(/^([\d,]+)\s*comment/i))) comments = parseInt(m[1].replace(/,/g, ""), 10);
        else if ((m = t.match(/^([\d,]+)\s*repost/i))) reposts = parseInt(m[1].replace(/,/g, ""), 10);
        else if ((m = t.match(/^([\d,]+)$/))) likes = parseInt(m[1].replace(/,/g, ""), 10);
      }
    }
    
    if (likes === 0) {
      const reactBtn = el.querySelector("button.social-details-social-counts__reactions-count, button[aria-label*='reaction']");
      if (reactBtn) {
        const rm = reactBtn.textContent.trim().match(/([\d,]+)/);
        if (rm) likes = parseInt(rm[1].replace(/,/g, ""), 10);
      }
    }

    results.push({ urn, text: text.substring(0, 2000), likes, comments, reposts });
  }
  
  console.log(`  [DOM] Extracted ${results.length} posts from DOM`);
  return results;
}

/** mirrors _scroll_and_collect_activity() */
async function scrollAndCollectActivity(scrolls = 3) {
  // Wait for initial posts - try multiple selectors
  let attempts = 0;
  while (attempts++ < 10) {
    const hasActivity = document.querySelectorAll("[data-urn*='activity']").length > 0;
    const hasPosts = document.querySelectorAll(".feed-shared-update-v2").length > 0;
    if (hasActivity || hasPosts) break;
    console.log(`  [scroll] Waiting for posts to load... (attempt ${attempts}/10)`);
    await sleep(1000);
  }
  
  if (attempts >= 10) {
    console.warn(`  [scroll] No posts found after waiting. Page may not have loaded properly.`);
  }

  const allResults = [];
  const seenUrns = new Set();

  for (let i = 0; i <= scrolls; i++) {
    if (i > 0) {
      window.scrollTo(0, document.body.scrollHeight);
      await sleep(2500);
    }
    expandTruncatedPosts();

    const results = extractActivityPostsFromDom();
    for (const r of results) {
      if (r.urn && !seenUrns.has(r.urn)) {
        seenUrns.add(r.urn);
        allResults.push(r);
      }
    }
    console.log(`  [scroll ${i}] collected ${allResults.length} unique posts so far...`);
  }

  return allResults;
}

/** Convert raw results to Voyager-style entity format (mirrors Python synthetic entity building) */
function resultsToEntities(results) {
  const entities = [];
  for (const r of results) {
    entities.push({
      "$type": "com.linkedin.voyager.dash.feed.Update",
      entityUrn: r.urn,
      commentary: { text: { text: r.text } },
      actor: { name: { text: "" }, urn: "", description: { text: "" } },
    });
    entities.push({
      "$type": "com.linkedin.voyager.dash.feed.SocialActivityCounts",
      entityUrn: `urn:li:fsd_socialActivityCounts:${r.urn}`,
      numLikes: r.likes || 0,
      numComments: r.comments || 0,
      numShares: r.reposts || 0,
      numImpressions: 0,
    });
  }
  return entities;
}

// ─── REST API fallback (mirrors get_my_posts REST path) ───────────────────────
async function getMyPostsViaAPI(limit) {
  const params = {
    q: "memberShareFeed",
    moduleKey: "member-shares:phone",
    count: String(Math.min(limit, 50)),
    start: "0",
  };
  const resp = await liGet(USER_POSTS_URL, params);
  if (resp.status === 429) throw new Error("Rate limited by LinkedIn");
  if (resp.status === 403) throw new Error("Forbidden — cookies may be expired");
  if (resp.status !== 200) throw new Error(`Failed to fetch posts: HTTP ${resp.status}`);
  return resp.json();
}

// ─── Navigation helper (mirrors chrome_data._navigate_to) ────────────────────
async function navigateToActivityPage() {
  const current = window.location.pathname;
  if (current.includes("/recent-activity")) {
    console.log("  Already on activity page");
    return;
  }
  console.log("  Navigating to /in/me/recent-activity/all/ ...");
  window.location.assign("https://www.linkedin.com/in/me/recent-activity/all/");
  // Wait for navigation
  await sleep(3000);
}

// ─── Main: get_my_posts() (mirrors client.get_my_posts()) ─────────────────────
async function getMyPosts(limit = MY_POSTS_LIMIT) {
  console.log(`\n=== Get My Posts (limit=${limit}) ===`);

  const currentPath = window.location.pathname + window.location.search;
  if (currentPath.includes("/uas/login") || currentPath.includes("/checkpoint")) {
    console.error("❌ LinkedIn session expired — please log in");
    return [];
  }

  // Check if we need to navigate to the activity page
  if (!currentPath.includes("/recent-activity")) {
    console.log("  ℹ️  Navigate to https://www.linkedin.com/in/me/recent-activity/all/ first.");
    console.log("  Or this script will attempt to do it automatically...");
    await navigateToActivityPage();
    return; // Script will need to be re-run after navigation completes
  }

  // Strategy 1: <code> entity stores (mirrors Python's primary path)
  await sleep(1000);
  const entities = extractPageEntities();
  const hasUpdateEntities = entities.some(e => (e.$type || "").includes("Update"));
  if (hasUpdateEntities) {
    console.log(`  [code store] Found ${entities.length} entities including Update types`);
    const posts = parseFeedResponse({ included: entities }, limit);
    if (posts.length > 0) {
      console.log(`  ✅ Extracted ${posts.length} posts from page code stores\n`);
      printPosts(posts);
      window._liMyPosts = posts;
      return posts;
    }
  }

  // Strategy 2: [data-urn] DOM extraction with scrolling
  console.log("  [DOM] Using activity page DOM extraction with scrolling...");
  const scrolls = Math.max(1, Math.floor(limit / 5));
  const results = await scrollAndCollectActivity(scrolls);
  const entities2 = resultsToEntities(results);
  const posts = parseFeedResponse({ included: entities2 }, limit);

  if (posts.length > 0) {
    console.log(`\n  ✅ Extracted ${posts.length} posts from DOM\n`);
    printPosts(posts);
    window._liMyPosts = posts;
    return posts;
  }

  // Strategy 3: REST API fallback
  console.log("  [API] Falling back to Voyager REST API...");
  try {
    const data = await getMyPostsViaAPI(limit);
    const apiPosts = parseFeedResponse(data, limit);
    console.log(`  ✅ Fetched ${apiPosts.length} posts via REST API\n`);
    printPosts(apiPosts);
    window._liMyPosts = apiPosts;
    return apiPosts;
  } catch (e) {
    console.error("  ❌ REST API failed:", e.message);
    return [];
  }
}

function printPosts(posts) {
  posts.forEach((p, i) => {
    const date = p.createdAt ? p.createdAt.toISOString().slice(0, 16) : "?";
    const mediaTag = "";
    console.log(`[${i+1}] ${date} | ${p.likes} likes  ${p.comments} comments  ${p.reposts} reposts`);
    console.log(`    URN: ${p.urn}`);
    console.log(`    "${p.text.substring(0, 200)}${p.text.length > 200 ? "…" : ""}"`);
    console.log("");
  });
}

// ─── Run ──────────────────────────────────────────────────────────────────────
getMyPosts(MY_POSTS_LIMIT);
