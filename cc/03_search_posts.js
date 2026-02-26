/**
 * LinkedIn Browser Script: Search Posts
 * ========================================
 * Mirrors: linkitin/search.py → search_posts()
 *          linkitin/chrome_data.py → extract_search_data()
 *                                  → _extract_posts_from_dom()
 *                                  → _JS_EXTRACT_POSTS_FROM_DOM (inline JS)
 *
 * PURPOSE:
 *   Searches LinkedIn posts by keyword. Navigates to the search results
 *   page and extracts posts via DOM (primary), falling back to the
 *   Voyager search clusters API.
 *
 * HOW TO USE:
 *   1. Open any LinkedIn page in your browser.
 *   2. Open DevTools Console (F12).
 *   3. Set SEARCH_KEYWORDS below (or pass to searchPosts()).
 *   4. Paste and run. The script navigates to search and extracts results.
 *
 * RETURNS:
 *   Posts stored in window._liLastSearch
 */

// ─── Config ───────────────────────────────────────────────────────────────────
const SEARCH_KEYWORDS = "AI startups";   // Change this to your search query
const SEARCH_LIMIT    = 20;

// ─── Endpoints ────────────────────────────────────────────────────────────────
const VOYAGER_BASE = "https://www.linkedin.com/voyager/api";
const SEARCH_URL   = `${VOYAGER_BASE}/search/dash/clusters`;

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

// ─── Feed entity parsers (same as other scripts) ─────────────────────────────
function extractInnerUrn(u) {
  for (const p of ["urn:li:activity:", "urn:li:ugcPost:"]) {
    const i = u.indexOf(p);
    if (i >= 0) {
      const r = u.substring(i);
      let e = r.length;
      for (const s of [",", ")"]) { const pos = r.indexOf(s); if (pos >= 0 && pos < e) e = pos; }
      return r.substring(0, e);
    }
  }
  return "";
}
function extractText(entity) {
  const c = entity.commentary;
  if (c && typeof c === "object") { const t = c.text; if (typeof t === "string") return t; if (t) return t.text || ""; }
  const specific = entity.specificContent;
  if (specific) { const sc = specific["com.linkedin.ugc.ShareContent"]; if (sc && sc.shareCommentary) return sc.shareCommentary.text || ""; }
  const summary = entity.summary;
  if (summary && typeof summary === "object") return summary.text || "";
  if (typeof summary === "string") return summary;
  const title = entity.title;
  if (title && typeof title === "object") return title.text || "";
  if (typeof title === "string") return title;
  return "";
}
function extractAuthor(entity, profiles) {
  const actor = entity.actor;
  if (actor) {
    const nameObj = actor.name;
    const fullName = (typeof nameObj === "string") ? nameObj : (nameObj && nameObj.text) || "";
    if (fullName) { const parts = fullName.split(" "); return { firstName: parts[0], lastName: parts.slice(1).join(" "), urn: actor.urn || "" }; }
  }
  const authorUrn = entity.author;
  if (typeof authorUrn === "string" && profiles[authorUrn]) {
    const p = profiles[authorUrn];
    return { firstName: p.firstName || "", lastName: p.lastName || "", urn: authorUrn };
  }
  return null;
}
function readCounts(e) { return { likes: e.numLikes||0, comments: e.numComments||0, reposts: e.numShares||0, impressions: e.numImpressions||0 }; }
function extractSocialCounts(urn, entity, socialCounts, socialDetails) {
  const a = extractInnerUrn(urn);
  if (a && socialCounts[a]) return readCounts(socialCounts[a]);
  if (socialCounts[urn]) return readCounts(socialCounts[urn]);
  if (a) { for (const [k,v] of Object.entries(socialCounts)) { if (k.includes(a)||a.includes(k)) return readCounts(v); } }
  return { likes: 0, comments: 0, reposts: 0, impressions: 0 };
}
function extractCreatedAt(e) {
  if (e.created && e.created.time > 0) return new Date(e.created.time);
  if (typeof e.createdAt === "number" && e.createdAt > 0) return new Date(e.createdAt);
  return null;
}
function isSearchPostEntity(entityType) {
  return [
    "com.linkedin.voyager.feed.render.UpdateV2",
    "com.linkedin.voyager.feed.Update",
    "com.linkedin.voyager.dash.feed.Update",
    "com.linkedin.voyager.search.SearchContentSerp",
    "com.linkedin.voyager.search.BlendedSearchCluster",
  ].some(pt => entityType.includes(pt));
}

/** mirrors search.py _parse_search_response() */
function parseSearchResponse(data, limit) {
  const included = data.included || [];
  const profiles = {}, socialDetails = {};
  for (const e of included) {
    const t = e.$type || "", u = e.entityUrn || e.urn || "";
    if (t.includes("MiniProfile") || t.includes("Profile")) profiles[u] = e;
    else if (t.includes("SocialDetail")) { const tid = e.threadId || u; socialDetails[tid] = e; }
  }
  const posts = [];
  for (const e of included) {
    if (posts.length >= limit) break;
    const t = e.$type || "";
    if (!isSearchPostEntity(t)) continue;
    const urn = e.entityUrn || e.urn || "";
    if (!urn) continue;
    const text = extractText(e);
    if (!text) continue;
    const author = extractAuthor(e, profiles);
    const counts = extractSocialCounts(urn, e, {}, socialDetails);
    const createdAt = extractCreatedAt(e);
    posts.push({ urn, text, author, ...counts, createdAt });
  }
  return posts;
}

// ─── DOM extraction (mirrors _JS_EXTRACT_POSTS_FROM_DOM + _extract_posts_from_dom) ──

/**
 * Extracts posts from the visible search results DOM.
 * This is a direct port of the inline JS string in chrome_data.py.
 * mirrors: _JS_EXTRACT_POSTS_FROM_DOM
 */
function extractPostsFromDom() {
  console.log("  [DOM] Scanning for posts in search results...");
  
  // Try multiple strategies to find posts
  let postContainers = [];
  
  // Strategy 1: Look for feed-shared-update elements
  postContainers = document.querySelectorAll('.feed-shared-update-v2, .search-results-container .feed-shared-update-v2');
  console.log(`  [DOM] Found ${postContainers.length} posts using feed-shared-update-v2 selector`);
  
  // Strategy 2: If no posts found, try data-urn approach
  if (postContainers.length === 0) {
    postContainers = document.querySelectorAll('[data-urn*="activity"], [data-urn*="ugcPost"]');
    console.log(`  [DOM] Found ${postContainers.length} posts using data-urn selector`);
  }
  
  // Strategy 3: Fallback to reaction buttons
  const reactionBtns = document.querySelectorAll(
    'button[aria-label="Reaction button state: no reaction"], button[aria-label*="Like"], .reactions-react-button'
  );
  console.log(`  [DOM] Found ${reactionBtns.length} reaction buttons`);
  
  const results = [];
  const seen = {};
  
  // First, try to extract from structured post containers
  if (postContainers.length > 0) {
    for (const container of postContainers) {
      const urn = container.getAttribute('data-urn') || "";
      
      // Extract text
      const textEl = container.querySelector('.feed-shared-update-v2__description, .feed-shared-text, .feed-shared-inline-show-more-text, .update-components-text');
      const text = textEl ? textEl.textContent.trim() : "";
      
      if (text.length < 10) continue;
      
      // Extract author
      const authorEl = container.querySelector('.feed-shared-actor__name, .update-components-actor__name, .feed-shared-actor__title');
      const authorName = authorEl ? authorEl.textContent.trim() : "Unknown";
      
      if (seen[authorName]) continue;
      seen[authorName] = true;
      
      // Extract engagement
      let likes = 0, comments = 0, reposts = 0;
      const socialBar = container.querySelector('.social-details-social-counts');
      if (socialBar) {
        const socialText = socialBar.textContent || "";
        const likesMatch = socialText.match(/([\d,]+)\s*reaction/i);
        const commentsMatch = socialText.match(/([\d,]+)\s*comment/i);
        const repostsMatch = socialText.match(/([\d,]+)\s*repost/i);
        
        if (likesMatch) likes = parseInt(likesMatch[1].replace(/,/g, ""), 10);
        if (commentsMatch) comments = parseInt(commentsMatch[1].replace(/,/g, ""), 10);
        if (repostsMatch) reposts = parseInt(repostsMatch[1].replace(/,/g, ""), 10);
      }
      
      results.push({
        urn: urn || "",
        author: authorName,
        text: text.substring(0, 2000),
        likes, comments, reposts,
      });
    }
    
    if (results.length > 0) {
      console.log(`  [DOM] Extracted ${results.length} posts from structured containers`);
      return results;
    }
  }
  
  // Fallback to reaction button walking

  console.log(`  [DOM] Using reaction button fallback method...`);
  
  for (const btn of reactionBtns) {
    let card = btn;
    let postUrn = "";

    // Walk up to card container, collecting data-urn
    for (let j = 0; j < 25; j++) {
      card = card.parentElement;
      if (!card) break;
      const dataUrn = (card.getAttribute && card.getAttribute("data-urn") || "").replace(/\/+$/, "");
      if (!postUrn && dataUrn &&
          (dataUrn.includes("activity") || dataUrn.includes("ugcPost") || dataUrn.includes("fsd_update"))) {
        postUrn = dataUrn;
      }
      // Look for feed-shared-update class as stopping point
      if (card.classList && card.classList.contains('feed-shared-update-v2')) break;
      if ((card.textContent || "").length > 400) break;
    }
    if (!card) continue;

    // Second pass: look for /feed/update/ or /posts/ links
    if (!postUrn) {
      const links = card.querySelectorAll("a[href]");
      for (const link of links) {
        const href = link.getAttribute("href") || "";
        let hrefDecoded = href;
        try { hrefDecoded = decodeURIComponent(href); } catch(_) {}
        if (href.includes("/feed/update/")) {
          const hm = hrefDecoded.match(/(urn:li:[a-zA-Z0-9_]+:[^?&# ]+)/);
          if (hm) {
            const cUrn = hm[1];
            if (cUrn.includes("activity") || cUrn.includes("ugcPost") || cUrn.includes("fsd_update")) {
              postUrn = cUrn; break;
            }
          }
        } else if (href.includes("/posts/")) {
          const am = hrefDecoded.match(/[^a-zA-Z]activity([0-9]{15,})/);
          if (am) { postUrn = "urn:li:activity:" + am[1]; break; }
        }
      }
    }

    const fullText = (card.textContent || "").replace(/\s+/g, " ").trim();

    // Extract author name
    let authorName = "";
    let m = fullText.match(/Feed post\s*(.+?)\s*[·•]\s*Following/);
    if (m) {
      authorName = m[1].trim();
    } else {
      const followBtn = card.querySelector('button[aria-label^="Follow "]');
      if (followBtn) authorName = (followBtn.getAttribute("aria-label") || "").replace("Follow ", "").trim();
    }

    if (!authorName || seen[authorName]) continue;
    seen[authorName] = true;

    // Extract post text (after time marker)
    let postText = "";
    const tm = fullText.match(/\d+[dhwmo]\s*[·•]?\s*/);
    if (tm) {
      postText = fullText.substring(fullText.indexOf(tm[0]) + tm[0].length).trim();
    } else {
      let fi = fullText.indexOf("Following");
      if (fi < 0) fi = fullText.indexOf("Follow");
      if (fi >= 0) postText = fullText.substring(fi + 9).trim();
    }

    // Remove engagement + buttons from end
    postText = postText.replace(/\d[\d,]*\s*(reaction|comment|repost).*$/i, "").trim();
    postText = postText.replace(/Like\s*(Comment|Repost|Send|Share|Celebrate|Support|Love|Insightful|Funny).*$/i, "").trim();
    postText = postText.replace(/[…\.]{1,3}\s*more\s*$/i, "").trim();

    if (postText.length < 10) continue;

    // Extract engagement metrics
    const spans = card.querySelectorAll("span");
    let likes = 0, comments = 0, reposts = 0;
    for (const span of spans) {
      const t = span.textContent.trim();
      let em;
      if ((em = t.match(/^([\d,]+)\s*reaction/i))) likes = parseInt(em[1].replace(/,/g, ""), 10) || 0;
      else if ((em = t.match(/^([\d,]+)\s*comment/i))) comments = parseInt(em[1].replace(/,/g, ""), 10) || 0;
      else if ((em = t.match(/^([\d,]+)\s*repost/i))) reposts = parseInt(em[1].replace(/,/g, ""), 10) || 0;
    }

    results.push({
      urn: postUrn || "",
      author: authorName,
      text: postText.substring(0, 2000),
      likes, comments, reposts,
    });
  }
  return results;
}

/** Converts DOM results to entity format (mirrors Python synthetic entity building) */
function domResultsToEntities(results) {
  const entities = [];
  results.forEach((r, i) => {
    const urn = (r.urn || `urn:li:dom:post:${i}`).replace(/\/+$/, "");
    const authorParts = (r.author || "").split(" ");
    entities.push({
      "$type": "com.linkedin.voyager.dash.feed.Update",
      entityUrn: urn,
      commentary: { text: { text: r.text } },
      actor: { name: { text: r.author }, urn: "", description: { text: "" } },
    });
    entities.push({
      "$type": "com.linkedin.voyager.dash.feed.SocialActivityCounts",
      entityUrn: `urn:li:fsd_socialActivityCounts:${urn}`,
      numLikes: r.likes || 0,
      numComments: r.comments || 0,
      numShares: r.reposts || 0,
      numImpressions: 0,
    });
  });
  return entities;
}

// ─── Voyager search REST API fallback ─────────────────────────────────────────
async function searchPostsViaAPI(keywords, limit) {
  const params = {
    keywords,
    origin: "GLOBAL_SEARCH_HEADER",
    q: "all",
    filters: "List(resultType->CONTENT)",
    count: String(Math.min(limit, 50)),
    start: "0",
  };
  const resp = await liGet(SEARCH_URL, params);
  if (resp.status === 429) throw new Error("Rate limited by LinkedIn");
  if (resp.status === 403) throw new Error("Forbidden — cookies may be expired");
  if (resp.status !== 200) throw new Error(`Search failed: HTTP ${resp.status}`);
  return resp.json();
}

// ─── Main: search_posts() (mirrors client.search_posts()) ─────────────────────

/**
 * NOTE: This function needs to be run AFTER navigating to the search page.
 * If you call searchPosts() and are not on the search results page,
 * it will navigate there and you'll need to re-run the extraction portion.
 */
async function searchPosts(keywords = SEARCH_KEYWORDS, limit = SEARCH_LIMIT) {
  console.log(`\n=== Search Posts: "${keywords}" (limit=${limit}) ===`);

  const currentPath = window.location.pathname;
  const searchPath = `/search/results/content/?keywords=${encodeURIComponent(keywords)}&origin=GLOBAL_SEARCH_HEADER`;

  // If not on search results page, navigate there (mirrors _navigate_to in Python)
  if (!currentPath.includes("/search/results/content/")) {
    console.log(`  Navigating to search results page...`);
    window.location.assign(`https://www.linkedin.com${searchPath}`);
    console.log("  ⚠️  Page navigating — re-run this script after the page loads.");
    return [];
  }

  // Extra wait for XHR-loaded search results (mirrors time.sleep(2.0) in Python)
  console.log("  Waiting for search results to render...");
  await sleep(2000);

  // Strategy 1: DOM extraction (primary — mirrors extract_search_data)
  const domResults = extractPostsFromDom();
  if (domResults.length > 0) {
    console.log(`  [DOM] Found ${domResults.length} posts in DOM`);
    const entities = domResultsToEntities(domResults);
    const posts = parseSearchResponse({ included: entities }, limit);
    console.log(`  ✅ Extracted ${posts.length} posts from DOM\n`);
    printPosts(posts);
    window._liLastSearch = posts;
    return posts;
  }

  // Strategy 2: Voyager REST API fallback
  console.log("  [API] Falling back to Voyager search API...");
  try {
    const data = await searchPostsViaAPI(keywords, limit);
    const posts = parseSearchResponse(data, limit);
    console.log(`  ✅ Fetched ${posts.length} posts via search API\n`);
    printPosts(posts);
    window._liLastSearch = posts;
    return posts;
  } catch (e) {
    console.error("  ❌ Search API failed:", e.message);
    return [];
  }
}

function printPosts(posts) {
  posts.forEach((p, i) => {
    const author = p.author ? `${p.author.firstName} ${p.author.lastName}`.trim() : "?";
    console.log(`[${i+1}] ${author} | ${p.likes} likes  ${p.comments} comments  ${p.reposts} reposts`);
    console.log(`    URN: ${p.urn || "(synthetic)"}`);
    console.log(`    "${p.text.substring(0, 150)}${p.text.length > 150 ? "…" : ""}"`);
    console.log("");
  });
}

// ─── Run ──────────────────────────────────────────────────────────────────────
searchPosts(SEARCH_KEYWORDS, SEARCH_LIMIT);
