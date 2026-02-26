/**
 * LinkedIn Browser Script: Create Text Post + Delete Post
 * ========================================================
 * Mirrors: linkitin/poster.py → create_post()
 *                             → delete_post()
 *
 * PURPOSE:
 *   Creates a text post on LinkedIn via the normShares endpoint.
 *   Optionally deletes it afterward (useful for testing).
 *
 * HOW TO USE:
 *   1. Open any LinkedIn page in your browser (logged in).
 *   2. Open DevTools Console (F12).
 *   3. Set POST_TEXT and VISIBILITY below.
 *   4. Paste and run.
 *
 * RETURNS:
 *   The created post's URN, stored in window._liLastPostUrn
 */

// ─── Config ───────────────────────────────────────────────────────────────────
const POST_TEXT   = "Hello LinkedIn! (browser script test)";
const VISIBILITY  = "PUBLIC";     // "PUBLIC" or "CONNECTIONS"
const AUTO_DELETE = false;        // Set true to delete the post after creating

// ─── Endpoints ────────────────────────────────────────────────────────────────
const CREATE_POST_URL = "https://www.linkedin.com/voyager/api/contentcreation/normShares";

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
    "Content-Type": "application/json",
    "csrf-token": getCsrfToken(),
    "x-li-lang": "en_US",
    "x-restli-protocol-version": "2.0.0",
    ...extra,
  };
}

async function liPost(url, body) {
  return fetch(url, {
    method: "POST",
    headers: buildHeaders(),
    credentials: "include",
    body: JSON.stringify(body),
  });
}

async function liDelete(url) {
  return fetch(url, {
    method: "DELETE",
    headers: buildHeaders(),
    credentials: "include",
  });
}

// ─── URN extraction (mirrors poster._extract_post_urn()) ──────────────────────

/**
 * Extract the post URN from a create-post response.
 * mirrors: poster._extract_post_urn(data, response)
 *
 * Handles both:
 *  - Normalized JSON: { "data": { "urn": "..." } }
 *  - Direct JSON: { "urn": "..." }
 *  - Header: x-restli-id (not accessible via fetch; handled in response check)
 */
function extractPostUrn(data, respHeaders = {}) {
  const inner = (data.data && typeof data.data === "object") ? data.data : {};
  for (const src of [data, inner, data.value || {}]) {
    const urn = src.urn || "";
    if (urn) return urn;
  }
  // x-restli-id header (CORS may block this in browser — try anyway)
  const headerUrn = respHeaders["x-restli-id"] || "";
  if (headerUrn) return headerUrn;
  return "";
}

// ─── create_post (mirrors poster.create_post()) ──────────────────────────────

/**
 * Create a LinkedIn text post via the normShares endpoint.
 * Mirrors: poster.create_post(session, text, visibility)
 *
 * Payload mirrors the exact structure from poster.py:
 *   - visibleToConnectionsOnly
 *   - externalAudienceProviderUnion
 *   - commentaryV2 with text + attributes
 *   - origin, allowedCommentersScope, postState
 */
async function createPost(text = POST_TEXT, visibility = VISIBILITY) {
  console.log(`\n=== Create Text Post ===`);
  console.log(`  Text: "${text.substring(0, 80)}${text.length > 80 ? "…" : ""}"`);
  console.log(`  Visibility: ${visibility}`);

  // Exact payload from poster.py create_post()
  const payload = {
    visibleToConnectionsOnly: visibility !== "PUBLIC",
    externalAudienceProviderUnion: {
      externalAudienceProvider: "LINKEDIN",
    },
    commentaryV2: {
      text: text,
      attributes: [],
    },
    origin: "FEED",
    allowedCommentersScope: "ALL",
    postState: "PUBLISHED",
  };

  const resp = await liPost(CREATE_POST_URL, payload);

  if (resp.status === 429) throw new Error("Rate limited by LinkedIn — try again later");
  if (resp.status === 403) throw new Error("Forbidden — cookies may be expired, re-login required");
  if (resp.status !== 200 && resp.status !== 201) {
    const body = await resp.text();
    throw new Error(`Failed to create post: HTTP ${resp.status} — ${body.substring(0, 200)}`);
  }

  const data = await resp.json();

  // Try to get URN from response headers (may be blocked by CORS)
  let urn = extractPostUrn(data);

  // Fallback: scan the response body for any urn:li:share or urn:li:ugcPost
  if (!urn) {
    const bodyStr = JSON.stringify(data);
    const m = bodyStr.match(/"urn:li:(share|ugcPost|normShare):[^"]+"/);
    if (m) urn = m[0].replace(/"/g, "");
  }

  if (!urn) throw new Error("Post created but no URN returned in response");

  console.log(`  ✅ Post created! URN: ${urn}`);
  window._liLastPostUrn = urn;
  return urn;
}

// ─── delete_post (mirrors poster.delete_post()) ──────────────────────────────

/**
 * Delete a LinkedIn post by URN.
 * Mirrors: poster.delete_post(session, post_urn)
 *
 * Sends DELETE to /voyager/api/contentcreation/normShares/{post_urn}
 */
async function deletePost(postUrn) {
  console.log(`\n=== Delete Post ===`);
  console.log(`  URN: ${postUrn}`);

  const url = `${CREATE_POST_URL}/${encodeURIComponent(postUrn)}`;
  const resp = await liDelete(url);

  if (resp.status === 429) throw new Error("Rate limited by LinkedIn — try again later");
  if (resp.status === 403) throw new Error("Forbidden — cookies may be expired");
  if (resp.status !== 200 && resp.status !== 204) {
    const body = await resp.text();
    throw new Error(`Failed to delete post: HTTP ${resp.status} — ${body.substring(0, 200)}`);
  }

  console.log(`  ✅ Post deleted successfully`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  try {
    const urn = await createPost(POST_TEXT, VISIBILITY);

    if (AUTO_DELETE && urn) {
      console.log("\n  AUTO_DELETE is enabled — deleting post in 3s...");
      await new Promise(r => setTimeout(r, 3000));
      await deletePost(urn);
    } else if (urn) {
      console.log(`\n  ℹ️  To delete this post later, run:`);
      console.log(`  deletePost("${urn}")`);
    }
  } catch (e) {
    console.error("❌ Error:", e.message);
  }
})();
