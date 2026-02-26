/**
 * LinkedIn Browser Script: Get Trending Posts
 * =============================================
 * Mirrors: linkitin/feed.py → get_trending_posts()
 *          linkitin/chrome_data.py → extract_trending_via_api()
 *                                  → extract_trending_data()
 *                                  → _scroll_and_collect()
 *                                  → resolve_thread_urn()
 *
 * PURPOSE:
 *   Fetches trending LinkedIn posts sorted by engagement.
 *   Strategy 1: Direct Voyager search API call (real URNs + thread_urn data).
 *   Strategy 2: DOM scraping fallback — navigate to search page, scroll,
 *               rank by engagement (same as Python's DOM fallback).
 *
 * HOW TO USE:
 *   1. Open any LinkedIn page in your browser (logged in).
 *   2. Open DevTools Console (F12).
 *   3. Configure TOPIC, PERIOD, LIMIT below.
 *   4. Paste and run.
 *
 * RETURNS:
 *   Posts sorted by engagement stored in window._liTrending
 */

// ─── Config ───────────────────────────────────────────────────────────────────
const TOPIC         = "";            // e.g. "AI" or "" for broadly trending
const PERIOD        = "past-week";   // "past-24h" | "past-week" | "past-month"
const TRENDING_LIMIT = 10;
const FROM_FOLLOWED = true;          // Only posts from people you follow
const SCROLLS       = 3;            // Extra page scrolls for more results

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

// ─── Feed entity parsers (shared logic) ──────────────────────────────────────
function extractInnerUrn(updateUrn) {
  for (const prefix of ["urn:li:activity:", "urn:li:ugcPost:"]) {
    const idx = updateUrn.indexOf(prefix);
    if (idx >= 0) {
      const rest = updateUrn.substring(idx);
      let end = rest.length;
      for (const sep of [",", ")"]) { const pos = rest.indexOf(sep); if (pos >= 0 && pos < end) end = pos; }
      return rest.substring(0, end);
    }
  }
  return "";
}
function extractText(entity) {
  const c = entity.commentary;
  if (c && typeof c === "object") { const t = c.text; if (typeof t === "string") return t; if (t) return t.text || ""; }
  const specific = entity.specificContent;
  if (specific) { const sc = specific["com.linkedin.ugc.ShareContent"]; if (sc && sc.shareCommentary) return sc.shareCommentary.text || ""; }
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
  let social = entity.socialDetail || entity["*socialDetail"];
  if (typeof social === "string") social = socialDetails[social] || {};
  if (!social || typeof social !== "object") social = {};
  const totalRef = social["*totalSocialActivityCounts"];
  if (typeof totalRef === "string" && socialCounts[totalRef]) return readCounts(socialCounts[totalRef]);
  const totalSocial = social.totalSocialActivityCounts;
  if (totalSocial && typeof totalSocial === "object") return readCounts(totalSocial);
  return { likes: 0, comments: 0, reposts: 0, impressions: 0 };
}
function extractCreatedAt(e) {
  if (e.created && e.created.time > 0) return new Date(e.created.time);
  if (typeof e.createdAt === "number" && e.createdAt > 0) return new Date(e.createdAt);
  return null;
}
function extractShareUrn(e) {
  const m = e.metadata;
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
    if (t.includes("MiniProfile") || t.includes("Profile")) profiles[u] = e;
    else if (t.includes("SocialActivityCounts")) { const p = u.split("fsd_socialActivityCounts:"); if(p.length===2) socialCounts[p[1]]=e; socialCounts[u]=e; }
    else if (t.includes("SocialDetail")) {
      const tid = e.threadId || u; socialDetails[tid] = e;
      if ((e.threadUrn||"").startsWith("urn:li:ugcPost:")) { const a=extractInnerUrn(u); if(a) threadUrnMap[a]=e.threadUrn; }
    }
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

// ─── Strategy 1: Voyager search API (mirrors extract_trending_via_api) ────────

/**
 * Directly queries the Voyager search clusters API with RESTLi tuple syntax.
 * Mirrors: chrome_data.extract_trending_via_api()
 *
 * NOTE: LinkedIn may have migrated search from Voyager REST to RSC endpoints.
 * If this returns no post entities, the DOM fallback (Strategy 2) kicks in.
 */
async function fetchTrendingViaAPI(topic, period, fromFollowed, limit) {
  // Build RESTLi query tuple — mirrors Python's qp_parts construction
  const qpParts = ["resultType:List(CONTENT)"];
  if (period) qpParts.push(`datePosted:List(${period})`);
  if (fromFollowed) qpParts.push("postedBy:List(following)");
  const queryParams = qpParts.join(",");
  const kwPart = topic ? `keywords:${topic},` : "";
  const query = `(${kwPart}flagshipSearchIntent:SEARCH_SRP,queryParameters:(${queryParams}),includeFiltersInResponse:true)`;

  // NOTE: Using URLSearchParams would percent-encode the tuple syntax
  // and break the LinkedIn API — we must NOT encode the query param.
  // Mirrors: chrome_voyager_request() direct URL construction.
  const params = {
    q: "all",
    origin: "FACETED_SEARCH",
    count: String(Math.min(limit, 50)),
    start: "0",
  };
  const qs = new URLSearchParams(params).toString();
  const fullUrl = `${SEARCH_URL}?${qs}&query=${query}`; // query NOT encoded

  const resp = await fetch(fullUrl, {
    method: "GET",
    headers: buildHeaders(),
    credentials: "include",
  });

  if (resp.status === 429) throw new Error("Rate limited by LinkedIn");
  if (resp.status === 403) throw new Error("Forbidden — cookies may be expired");
  if (resp.status !== 200) throw new Error(`Trending API failed: HTTP ${resp.status}`);

  const data = await resp.json();
  if (!data.included) throw new Error("Voyager search API returned no post entities");
  return data;
}

// ─── Strategy 2: DOM scraping (mirrors extract_trending_data) ─────────────────

/** mirrors _JS_EXTRACT_POSTS_FROM_DOM — extracts posts from search result cards */
function extractPostsFromDom() {
  console.log("  [DOM] Scanning for trending posts in search results...");
  
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
      
      // Extract engagement metrics for sorting
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
        engagement: likes + comments + reposts
      });
    }
    
    if (results.length > 0) {
      console.log(`  [DOM] Extracted ${results.length} posts from structured containers`);
      // Sort by engagement for trending
      results.sort((a, b) => b.engagement - a.engagement);
      return results;
    }
  }
  
  // Fallback to reaction button walking
  console.log(`  [DOM] Using reaction button fallback method...`);

  for (const btn of reactionBtns) {
    let card = btn;
    let postUrn = "";

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

    if (!postUrn) {
      const links = card.querySelectorAll("a[href]");
      for (const link of links) {
        const href = link.getAttribute("href") || "";
        let hrefDecoded = href;
        try { hrefDecoded = decodeURIComponent(href); } catch(_) {}
        if (href.includes("/feed/update/")) {
          const hm = hrefDecoded.match(/(urn:li:[a-zA-Z0-9_]+:[^?&# ]+)/);
          if (hm) { const cUrn = hm[1]; if (cUrn.includes("activity")||cUrn.includes("ugcPost")||cUrn.includes("fsd_update")) { postUrn = cUrn; break; } }
        } else if (href.includes("/posts/")) {
          const am = hrefDecoded.match(/[^a-zA-Z]activity([0-9]{15,})/);
          if (am) { postUrn = "urn:li:activity:" + am[1]; break; }
        }
      }
    }

    const fullText = (card.textContent || "").replace(/\s+/g, " ").trim();
    let authorName = "";
    let m = fullText.match(/Feed post\s*(.+?)\s*[·•]\s*Following/);
    if (m) authorName = m[1].trim();
    else {
      const followBtn = card.querySelector('button[aria-label^="Follow "]');
      if (followBtn) authorName = (followBtn.getAttribute("aria-label") || "").replace("Follow ", "").trim();
    }

    if (!authorName || seen[authorName]) continue;
    seen[authorName] = true;

    let postText = "";
    const tm = fullText.match(/\d+[dhwmo]\s*[·•]?\s*/);
    if (tm) postText = fullText.substring(fullText.indexOf(tm[0]) + tm[0].length).trim();
    else {
      let fi = fullText.indexOf("Following");
      if (fi < 0) fi = fullText.indexOf("Follow");
      if (fi >= 0) postText = fullText.substring(fi + 9).trim();
    }
    postText = postText.replace(/\d[\d,]*\s*(reaction|comment|repost).*$/i, "").trim();
    postText = postText.replace(/Like\s*(Comment|Repost|Send|Share|Celebrate|Support|Love|Insightful|Funny).*$/i, "").trim();
    postText = postText.replace(/[…\.]{1,3}\s*more\s*$/i, "").trim();

    if (postText.length < 10) continue;

    const spans = card.querySelectorAll("span");
    let likes = 0, comments = 0, reposts = 0;
    for (const span of spans) {
      const t = span.textContent.trim();
      let em;
      if ((em = t.match(/^([\d,]+)\s*reaction/i))) likes = parseInt(em[1].replace(/,/g,""),10)||0;
      else if ((em = t.match(/^([\d,]+)\s*comment/i))) comments = parseInt(em[1].replace(/,/g,""),10)||0;
      else if ((em = t.match(/^([\d,]+)\s*repost/i))) reposts = parseInt(em[1].replace(/,/g,""),10)||0;
    }

    results.push({ 
      urn: postUrn || "", 
      author: authorName, 
      text: postText.substring(0, 2000), 
      likes, comments, reposts,
      engagement: likes + comments + reposts
    });
  }
  
  // Sort by engagement for trending
  results.sort((a, b) => b.engagement - a.engagement);
  console.log(`  [DOM] Extracted ${results.length} posts using reaction button method`);
  
  return results;
}

/** Wait for search result cards — mirrors _wait_for_search_results() */
async function waitForSearchResults(maxWait = 10000) {
  console.log("  [Wait] Waiting for search results to load...");
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    const feedCount = document.querySelectorAll('.feed-shared-update-v2').length;
    const btnCount = document.querySelectorAll('button[aria-label="Reaction button state: no reaction"]').length;
    if (feedCount > 0 || btnCount > 0) {
      console.log(`  [Wait] Found ${feedCount} feed items or ${btnCount} reaction buttons`);
      return true;
    }
    await sleep(1000);
  }
  console.warn("  [Wait] Timeout waiting for search results");
  return false;
}

/** Scroll and collect — mirrors _scroll_and_collect() */
async function scrollAndCollect(scrolls = 3) {
  await waitForSearchResults(10000);
  const allResults = [];
  const seenKeys = new Set();

  for (let i = 0; i <= scrolls; i++) {
    if (i > 0) {
      window.scrollTo(0, document.body.scrollHeight);
      await sleep(2500);
    }
    const results = extractPostsFromDom();
    for (const r of results) {
      const key = r.author + "|" + r.text.substring(0, 80);
      if (!seenKeys.has(key)) { seenKeys.add(key); allResults.push(r); }
    }
    console.log(`  [scroll ${i}] ${allResults.length} unique posts collected...`);
  }
  return allResults;
}

function domResultsToEntities(results) {
  const entities = [];
  results.forEach((r, i) => {
    const urn = (r.urn || `urn:li:dom:post:${i}`).replace(/\/+$/, "");
    entities.push({ "$type": "com.linkedin.voyager.dash.feed.Update", entityUrn: urn, commentary: { text: { text: r.text } }, actor: { name: { text: r.author }, urn: "", description: { text: "" } } });
    entities.push({ "$type": "com.linkedin.voyager.dash.feed.SocialActivityCounts", entityUrn: `urn:li:fsd_socialActivityCounts:${urn}`, numLikes: r.likes||0, numComments: r.comments||0, numShares: r.reposts||0, numImpressions: 0 });
  });
  return entities;
}

// ─── resolve_thread_urn (mirrors chrome_data.resolve_thread_urn) ──────────────
/**
 * Navigate to a post page and extract its ugcPost thread_urn.
 * Needed by comment_post() API.
 * mirrors: resolve_thread_urn(post_urn)
 */
async function resolveThreadUrn(postUrn) {
  return new Promise(async (resolve) => {
    if (!postUrn || postUrn.includes("dom:post")) { resolve(""); return; }
    const oldUrl = window.location.href;
    window.location.assign(`https://www.linkedin.com/feed/update/${postUrn}/`);
    // Wait for page load
    await sleep(4000);
    const codeEls = document.querySelectorAll('code[id^="bpr-guid-"]');
    for (const el of codeEls) {
      try {
        const data = JSON.parse(el.textContent);
        for (const entity of (data.included || [])) {
          if ((entity.$type || "").includes("SocialDetail")) {
            const threadUrn = entity.threadUrn || "";
            if (threadUrn.startsWith("urn:li:ugcPost:")) {
              resolve(threadUrn);
              return;
            }
          }
        }
      } catch(_) {}
    }
    resolve("");
  });
}

// ─── Main: get_trending_posts() ───────────────────────────────────────────────
async function getTrendingPosts(
  topic = TOPIC,
  period = PERIOD,
  limit = TRENDING_LIMIT,
  fromFollowed = FROM_FOLLOWED,
  scrolls = SCROLLS,
) {
  console.log(`\n=== Get Trending Posts (topic="${topic}", period=${period}, limit=${limit}, from_followed=${fromFollowed}) ===`);

  // ── Strategy 1: Voyager search API (mirrors extract_trending_via_api) ──
  console.log("  [Strategy 1] Trying Voyager search API...");
  try {
    const data = await fetchTrendingViaAPI(topic, period, fromFollowed, Math.max(limit * 4, 50));
    const posts = parseFeedResponse(data, limit);
    if (posts.length > 0) {
      // Sort by engagement
      posts.sort((a, b) => (b.likes + b.comments + b.reposts) - (a.likes + a.comments + a.reposts));
      console.log(`  ✅ Got ${posts.length} posts from Voyager API\n`);
      printTrendingPosts(posts);
      window._liTrending = posts;
      return posts;
    }
    console.log("  ⚠️  API returned entities but no post content — falling back to DOM");
  } catch (e) {
    console.log(`  ⚠️  Voyager API unavailable (${e.message}) — falling back to DOM scraping`);
  }

  // ── Strategy 2: DOM scraping (mirrors extract_trending_data) ──
  console.log("  [Strategy 2] DOM scraping — navigating to trending search...");
  const kw = encodeURIComponent(topic);
  let path = `/search/results/content/?keywords=${kw}&sortBy=%22relevance%22&datePosted=%22${period}%22&origin=FACETED_SEARCH`;
  if (fromFollowed) path += '&postedBy=%5B%22following%22%5D';

  const currentPath = window.location.pathname + window.location.search;
  if (!currentPath.includes("/search/results/content/")) {
    console.log(`  Navigating to: ${path}`);
    console.log("  ⚠️  Re-run the extraction portion after page loads.");
    window.location.assign(`https://www.linkedin.com${path}`);
    return [];
  }

  console.log("  Waiting for page to load...");
  await sleep(3000);

  const rawResults = await scrollAndCollect(scrolls);
  if (!rawResults.length) {
    console.error("  ❌ No trending posts found");
    return [];
  }

  // Sort by engagement — mirrors Python's results.sort(key=engagement)
  rawResults.sort((a, b) => (b.likes + b.comments + b.reposts) - (a.likes + a.comments + a.reposts));

  const entities = domResultsToEntities(rawResults);
  const posts = parseFeedResponse({ included: entities }, limit);

  console.log(`\n  ✅ Got ${posts.length} trending posts from DOM\n`);
  printTrendingPosts(posts);
  window._liTrending = posts;
  return posts;
}

function printTrendingPosts(posts) {
  posts.forEach((p, i) => {
    const author = p.author ? `${p.author.firstName} ${p.author.lastName}`.trim() : "?";
    const urnType = p.urn.includes("dom:post") ? "SYNTHETIC" : (p.urn.includes("fsd_update") ? "fsd_update" : (p.urn.includes("activity") ? "activity" : "other"));
    console.log(`[${i+1}] ${author} | ${p.likes} likes  ${p.comments} comments  ${p.reposts} reposts`);
    console.log(`    URN: ${p.urn.substring(0, 80)} [${urnType}]`);
    console.log(`    thread_urn: ${p.threadUrn || "(none)"}`);
    console.log(`    "${p.text.substring(0, 150)}${p.text.length > 150 ? "…" : ""}"`);
    console.log("");
  });
}

// ─── Run ──────────────────────────────────────────────────────────────────────
getTrendingPosts(TOPIC, PERIOD, TRENDING_LIMIT, FROM_FOLLOWED, SCROLLS);
