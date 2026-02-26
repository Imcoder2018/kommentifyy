/**
 * LinkedIn Browser Script: Get Home Feed
 * ========================================
 * Mirrors: linkitin/feed.py → get_feed()
 *          linkitin/chrome_data.py → extract_feed_data(), _extract_page_entities()
 *
 * PURPOSE:
 *   Fetches your LinkedIn home feed and displays posts with engagement metrics.
 *   Tries the fast <code> entity extraction first (same as Python's Chrome data
 *   extraction), then falls back to the Voyager REST API.
 *
 * HOW TO USE:
 *   1. Open https://www.linkedin.com/feed/ in your browser.
 *   2. Open DevTools Console (F12).
 *   3. Paste and run this entire script.
 *
 * RETURNS:
 *   An array of Post objects logged to the console, and stored in
 *   window._liLastFeed for further use.
 */

// ─── Config ──────────────────────────────────────────────────────────────────
const FEED_LIMIT = 20; // mirrors client.get_feed(limit=20)

// ─── Endpoints (mirrors linkitin/endpoints.py) ────────────────────────────────
const VOYAGER_BASE = "https://www.linkedin.com/voyager/api";
const FEED_UPDATES_URL = `${VOYAGER_BASE}/feed/dash/feedUpdates`;

// ─── Auth helpers (inline — mirrors linkitin/session.py) ─────────────────────
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

// ─── Entity parsers (mirrors linkitin/feed.py _parse_feed_response + helpers) ──

/** mirrors _extract_inner_urn() */
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

/** mirrors _extract_text() */
function extractText(entity) {
  const commentary = entity.commentary;
  if (commentary && typeof commentary === "object") {
    const t = commentary.text;
    if (typeof t === "string") return t;
    if (t && typeof t === "object") return t.text || "";
  }
  const content = entity.content;
  if (content && typeof content === "object") {
    const tc = content["com.linkedin.voyager.feed.render.TextComponent"];
    if (tc && typeof tc === "object") {
      const t = tc.text;
      return (typeof t === "string") ? t : (t && t.text) || "";
    }
  }
  const specific = entity.specificContent;
  if (specific && typeof specific === "object") {
    const shareContent = specific["com.linkedin.ugc.ShareContent"];
    if (shareContent && typeof shareContent === "object") {
      const shareCommentary = shareContent.shareCommentary;
      if (shareCommentary && typeof shareCommentary === "object") {
        return shareCommentary.text || "";
      }
    }
  }
  return "";
}

/** mirrors _extract_author() */
function extractAuthor(entity, profiles) {
  const actor = entity.actor;
  if (actor && typeof actor === "object") {
    const nameObj = actor.name;
    const fullName = (typeof nameObj === "string") ? nameObj : (nameObj && nameObj.text) || "";
    if (fullName) {
      const parts = fullName.split(" ");
      const descObj = actor.description;
      const headline = (descObj && typeof descObj === "object") ? (descObj.text || "") : "";
      return {
        urn: actor.urn || "",
        firstName: parts[0] || "",
        lastName: parts.slice(1).join(" "),
        headline: headline || null,
        profileUrl: actor.navigationUrl || null,
      };
    }
  }
  const authorUrn = entity.author;
  if (typeof authorUrn === "string" && profiles[authorUrn]) {
    const p = profiles[authorUrn];
    return {
      urn: authorUrn,
      firstName: p.firstName || "",
      lastName: p.lastName || "",
      headline: p.occupation || null,
      profileUrl: null,
    };
  }
  return null;
}

/** mirrors _read_counts() */
function readCounts(entity) {
  return {
    likes:       entity.numLikes       || 0,
    comments:    entity.numComments    || 0,
    reposts:     entity.numShares      || 0,
    impressions: entity.numImpressions || 0,
  };
}

/** mirrors _extract_social_counts() */
function extractSocialCounts(urn, entity, socialCounts, socialDetails) {
  const activityUrn = extractInnerUrn(urn);

  if (activityUrn && socialCounts[activityUrn]) return readCounts(socialCounts[activityUrn]);
  if (socialCounts[urn]) return readCounts(socialCounts[urn]);
  if (activityUrn) {
    for (const [key, val] of Object.entries(socialCounts)) {
      if (key.includes(activityUrn) || activityUrn.includes(key)) return readCounts(val);
    }
  }

  let social = entity.socialDetail || entity["*socialDetail"];
  if (typeof social === "string") social = socialDetails[social] || {};
  if (!social || typeof social !== "object") social = {};
  if (!Object.keys(social).length && socialDetails[urn]) social = socialDetails[urn];
  if (!Object.keys(social).length) {
    for (const [key, detail] of Object.entries(socialDetails)) {
      if (urn.includes(key) || key.includes(urn)) { social = detail; break; }
    }
  }

  const totalRef = social["*totalSocialActivityCounts"];
  if (typeof totalRef === "string" && socialCounts[totalRef]) return readCounts(socialCounts[totalRef]);

  const totalSocial = social.totalSocialActivityCounts;
  if (totalSocial && typeof totalSocial === "object") return readCounts(totalSocial);

  return { likes: 0, comments: 0, reposts: 0, impressions: 0 };
}

/** mirrors _extract_created_at() */
function extractCreatedAt(entity) {
  const created = entity.created;
  if (created && typeof created === "object" && created.time > 0) {
    return new Date(created.time);
  }
  const createdAt = entity.createdAt;
  if (typeof createdAt === "number" && createdAt > 0) {
    return new Date(createdAt);
  }
  return null;
}

/** mirrors _extract_share_urn() */
function extractShareUrn(entity) {
  const metadata = entity.metadata;
  if (metadata && typeof metadata === "object") {
    const shareUrn = metadata.shareUrn;
    if (typeof shareUrn === "string" && shareUrn.startsWith("urn:li:share:")) {
      return shareUrn;
    }
  }
  return null;
}

/** mirrors _is_post_entity() */
function isPostEntity(entityType) {
  return [
    "com.linkedin.voyager.feed.render.UpdateV2",
    "com.linkedin.voyager.feed.Update",
    "com.linkedin.voyager.dash.feed.Update",
    "com.linkedin.voyager.identity.profile.ProfileUpdate",
    "com.linkedin.voyager.feed.FeedUpdate",
    "com.linkedin.feed.update",
    "Update",
  ].some(pt => {
    if (!entityType) return false;
    const normalized = entityType.toLowerCase();
    return normalized.includes("update") || normalized.includes("post") || normalized.includes("share");
  });
}

/** mirrors _parse_feed_response() — the core feed parser */
function parseFeedResponse(data, limit) {
  const included = data.included || [];

  const profiles = {};
  const socialCounts = {};
  const socialDetails = {};
  const threadUrnMap = {};

  for (const entity of included) {
    const entityType = entity.$type || "";
    const entityUrn = entity.entityUrn || entity.urn || "";

    if (entityType.includes("MiniProfile") || entityType.includes("Profile")) {
      profiles[entityUrn] = entity;
    } else if (entityType.includes("SocialActivityCounts")) {
      const parts = entityUrn.split("fsd_socialActivityCounts:");
      if (parts.length === 2) socialCounts[parts[1]] = entity;
      socialCounts[entityUrn] = entity;
    } else if (entityType.includes("SocialDetail")) {
      const threadId = entity.threadId || entityUrn;
      socialDetails[threadId] = entity;
      const ugcUrn = entity.threadUrn || "";
      if (ugcUrn.startsWith("urn:li:ugcPost:")) {
        const activityUrn = extractInnerUrn(entityUrn);
        if (activityUrn) threadUrnMap[activityUrn] = ugcUrn;
      }
    }
  }

  const posts = [];
  for (const entity of included) {
    if (posts.length >= limit) break;
    const entityType = entity.$type || "";
    if (!isPostEntity(entityType)) continue;

    const urn = entity.entityUrn || entity.urn || "";
    if (!urn) continue;

    const text = extractText(entity);
    if (!text) continue;

    const author = extractAuthor(entity, profiles);
    const counts = extractSocialCounts(urn, entity, socialCounts, socialDetails);
    const createdAt = extractCreatedAt(entity);
    const shareUrn = extractShareUrn(entity);
    const innerUrn = extractInnerUrn(urn);
    const threadUrn = innerUrn ? (threadUrnMap[innerUrn] || null) : null;

    posts.push({ urn, text, author, ...counts, createdAt, shareUrn, threadUrn });
  }
  return posts;
}

// ─── Strategy 1: <code> entity extraction (mirrors chrome_data.extract_feed_data) ──

/**
 * Extract Voyager entities from the page's embedded <code id="bpr-guid-*"> stores.
 * Mirrors: chrome_data._extract_page_entities()
 * This is the PRIMARY extraction method used by the Python lib.
 */
function extractPageEntities() {
  const codeElements = document.querySelectorAll('code[id^="bpr-guid-"]');
  const entities = [];
  let totalElements = 0;
  let parsedElements = 0;
  
  for (const el of codeElements) {
    totalElements++;
    try {
      const data = JSON.parse(el.textContent);
      if (data.included && data.included.length > 0) {
        parsedElements++;
        entities.push(...data.included);
      } else if (data.data) {
        // Handle GraphQL responses
        parsedElements++;
        if (Array.isArray(data.data)) {
          entities.push(...data.data);
        } else if (data.data.included) {
          entities.push(...data.data.included);
        }
      }
    } catch (_) {}
  }
  
  console.log(`  [DEBUG] Scanned ${totalElements} code elements, parsed ${parsedElements}, found ${entities.length} entities`);
  
  // Log entity types for debugging
  if (entities.length > 0) {
    const types = [...new Set(entities.map(e => e.$type || "unknown"))].slice(0, 15);
    console.log(`  [DEBUG] Entity types: ${types.join(", ")}`);
  }
  
  return entities;
}

// ─── Strategy 1.5: DOM Extraction Fallback ────────────────────────────────────

function extractPostsFromDOM(limit) {
  console.log(`  [DOM] Attempting to extract posts from feed DOM...`);
  const posts = [];
  
  // Find all post containers - LinkedIn uses various class patterns
  const feedItems = document.querySelectorAll('.feed-shared-update-v2, [data-urn*="activity"], [data-urn*="ugcPost"]');
  console.log(`  [DOM] Found ${feedItems.length} potential post containers`);
  
  for (const item of feedItems) {
    if (posts.length >= limit) break;
    
    try {
      const urn = item.getAttribute('data-urn') || item.getAttribute('data-id') || "";
      if (!urn) continue;
      
      // Extract text content
      const textElement = item.querySelector('.feed-shared-update-v2__description, .feed-shared-text, .feed-shared-inline-show-more-text');
      const text = textElement ? textElement.textContent.trim() : "";
      if (!text) continue;
      
      // Extract author
      const authorElement = item.querySelector('.feed-shared-actor__name, .update-components-actor__name');
      const authorName = authorElement ? authorElement.textContent.trim() : "Unknown";
      const [firstName = "", ...lastNameParts] = authorName.split(" ");
      const author = { firstName, lastName: lastNameParts.join(" ") };
      
      // Extract engagement counts
      const socialBar = item.querySelector('.social-details-social-counts');
      let likes = 0, comments = 0, reposts = 0;
      
      if (socialBar) {
        const reactionsText = socialBar.textContent || "";
        const likesMatch = reactionsText.match(/([\d,]+)\s*reaction/i);
        const commentsMatch = reactionsText.match(/([\d,]+)\s*comment/i);
        const repostsMatch = reactionsText.match(/([\d,]+)\s*repost/i);
        
        if (likesMatch) likes = parseInt(likesMatch[1].replace(/,/g, ""), 10);
        if (commentsMatch) comments = parseInt(commentsMatch[1].replace(/,/g, ""), 10);
        if (repostsMatch) reposts = parseInt(repostsMatch[1].replace(/,/g, ""), 10);
      }
      
      // Extract timestamp
      const timeElement = item.querySelector('time, .feed-shared-actor__sub-description');
      let createdAt = null;
      if (timeElement) {
        const datetime = timeElement.getAttribute('datetime');
        if (datetime) createdAt = new Date(datetime);
      }
      
      posts.push({
        urn,
        text,
        author,
        likes,
        comments,
        reposts,
        impressions: 0,
        createdAt,
        shareUrn: null,
        threadUrn: null,
        source: "DOM"
      });
    } catch (e) {
      console.warn(`  [DOM] Failed to parse post:`, e.message);
    }
  }
  
  return posts;
}

// ─── Strategy 2: Voyager REST API (mirrors get_feed REST fallback) ────────────

async function getFeedViaAPI(limit) {
  const params = {
    q: "DECORATED_FEED",
    count: String(Math.min(limit, 50)),
    start: "0",
  };
  const resp = await liGet(FEED_UPDATES_URL, params);
  if (resp.status === 429) throw new Error("Rate limited by LinkedIn — try again later");
  if (resp.status === 403) throw new Error("Forbidden — cookies may be expired");
  if (resp.status !== 200) throw new Error(`Failed to fetch feed: HTTP ${resp.status}`);
  return resp.json();
}

// ─── Main: get_feed() (mirrors client.get_feed()) ─────────────────────────────

async function getFeed(limit = FEED_LIMIT) {
  console.log(`\n=== Get Home Feed (limit=${limit}) ===`);

  // Strategy 1: <code> store extraction (primary, same as Python)
  const entities = extractPageEntities();
  if (entities.length > 0) {
    console.log(`  [code store] Found ${entities.length} entities on page`);
    const posts = parseFeedResponse({ included: entities }, limit);
    if (posts.length > 0) {
      console.log(`  ✅ Extracted ${posts.length} posts from page data\n`);
      printPosts(posts);
      window._liLastFeed = posts;
      return posts;
    } else {
      console.log(`  ⚠️ Found entities but no posts - trying DOM extraction...`);
      const domPosts = extractPostsFromDOM(limit);
      if (domPosts.length > 0) {
        console.log(`  ✅ Extracted ${domPosts.length} posts from DOM\n`);
        printPosts(domPosts);
        window._liLastFeed = domPosts;
        return domPosts;
      }
    }
  }

  // Strategy 2: REST API fallback
  console.log("  [API] Falling back to Voyager REST API...");
  try {
    const data = await getFeedViaAPI(limit);
    const posts = parseFeedResponse(data, limit);
    console.log(`  ✅ Fetched ${posts.length} posts via REST API\n`);
    printPosts(posts);
    window._liLastFeed = posts;
    return posts;
  } catch (e) {
    console.error("  ❌ REST API failed:", e.message);
    return [];
  }
}

function printPosts(posts) {
  posts.forEach((p, i) => {
    const author = p.author ? `${p.author.firstName} ${p.author.lastName}` : "?";
    const date = p.createdAt ? p.createdAt.toISOString().slice(0,16) : "?";
    console.log(`[${i+1}] ${author} | ${p.likes} likes  ${p.comments} comments  ${p.reposts} reposts | ${date}`);
    console.log(`    URN: ${p.urn}`);
    console.log(`    thread_urn: ${p.threadUrn || "(none)"}`);
    console.log(`    share_urn: ${p.shareUrn || "(none)"}`);
    console.log(`    "${p.text.substring(0, 150)}${p.text.length > 150 ? "…" : ""}"`);
    console.log("");
  });
}

// ─── Run ──────────────────────────────────────────────────────────────────────
getFeed(FEED_LIMIT);
