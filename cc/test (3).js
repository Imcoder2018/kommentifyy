/**
 * LinkedIn Browser Script: Profile Actions + Lead Tracking
 * =========================================================
 * VERSION: 5.0 — Jun 2025
 * CHANGES from v4:
 *   - Fix rscHasError(): errors:[] (empty array) is SUCCESS, not an error.
 *     Was checking `parsed?.errors` which is truthy for [] in JS. Now checks .length > 0.
 *   - Fix sendConnectionRequest(): MAJOR architecture fix based on network capture analysis.
 *     The ConnectDrawer POST IS the invite trigger — LinkedIn executes the invitation
 *     server-side inside the RSC response. There is NO separate Voyager invitation API call
 *     in the real LinkedIn "Send without a note" flow.
 *     Removed all Step B fallback attempts (voyagerRelationshipsDash/invitations 404,
 *     normInvitations 301, etc.) — they were all wrong/dead endpoints.
 *     ConnectDrawer HTTP 200 + no RSC error = invitation sent ✅
 *   - Add customMessage support in ConnectDrawer value payload for "Send with note" flow
 *
 * FEATURES:
 *   ✅ Get my profile URN
 *   ✅ Get target profile URN
 *   ✅ Get most recent post (with ugcPost URN extraction)
 *   ✅ Follow the lead
 *   ✅ Send connection request WITH a note
 *   ✅ Check if lead replied to YOUR previous comment on their recent post
 *   ✅ Auto-reply to people who replied to your comments (lead + others)
 *   ⏸  Like post          → disabled (set ENABLE_LIKE = true to re-enable)
 *   ⏸  Comment on post    → disabled (set ENABLE_COMMENT = true to re-enable)
 *
 * HOW TO USE:
 *   1. Open https://www.linkedin.com/feed/ — make sure you are LOGGED IN.
 *   2. Open DevTools (F12) → Console tab.
 *   3. Paste this entire script and press Enter.
 */

// ═══════════════════════════════════════════════════════════
//  CONFIGURATION — edit these before running
// ═══════════════════════════════════════════════════════════

const TARGET_VANITY_ID   = "saadat-hussain-8548ab1a1";            // LinkedIn vanity URL slug
const CONNECTION_NOTE    = "Hi, I came across your profile and would love to connect!";
const COMMENT_TEXT       = "Great post! Really insightful, thanks for sharing 🙌"; // used only if ENABLE_COMMENT = true

// Feature flags
const ENABLE_FOLLOW      = true;   // Follow the lead
const ENABLE_CONNECT     = true;   // Send connection request with note
const ENABLE_CHECK_REPLY = true;   // Check if lead replied to your comment
const ENABLE_AUTO_REPLY  = true;   // Auto-reply to people who replied to your comments
const ENABLE_LIKE        = false;  // Like their most recent post
const ENABLE_COMMENT     = false;  // Comment on their most recent post


// ═══════════════════════════════════════════════════════════
//  AUTH HELPERS
// ═══════════════════════════════════════════════════════════

function getCsrf() {
  for (const c of document.cookie.split("; "))
    if (c.startsWith("JSESSIONID=")) return c.substring(11).replace(/"/g, "");
  return null;
}

function hdrs(extra = {}) {
  const csrf = getCsrf();
  if (!csrf) throw new Error("JSESSIONID not found — are you logged in?");
  return {
    "accept": "application/vnd.linkedin.normalized+json+2.1",
    "accept-language": "en-US,en;q=0.9",
    "content-type": "application/json",
    "csrf-token": csrf,
    "origin": "https://www.linkedin.com",
    "referer": `https://www.linkedin.com/in/${TARGET_VANITY_ID}/`,
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "user-agent": navigator.userAgent,
    "x-li-lang": "en_US",
    "x-li-page-instance": `urn:li:page:d_flagship3_profile_view_base;${generateTrackingId()}`,
    "x-restli-protocol-version": "2.0.0",
    "x-li-track": JSON.stringify({
      clientVersion: "1.13.42530", mpVersion: "1.13.42530", osName: "web",
      timezoneOffset: -(new Date().getTimezoneOffset() / 60),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      deviceFormFactor: "DESKTOP", mpName: "voyager-web",
      displayDensity: window.devicePixelRatio || 2,
      displayWidth: window.screen.width, displayHeight: window.screen.height,
    }),
    ...extra,
  };
}

/** Headers for SDUI (flagship-web) endpoints — different accept type */
function sduiHdrs(extra = {}) {
  const csrf = getCsrf();
  if (!csrf) throw new Error("JSESSIONID not found — are you logged in?");
  const trackingId = generateTrackingId();
  return {
    "content-type": "application/json",
    "csrf-token": csrf,
    "origin": "https://www.linkedin.com",
    "referer": `https://www.linkedin.com/in/${TARGET_VANITY_ID}/`,
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "user-agent": navigator.userAgent,
    "x-li-anchor-page-key": "d_flagship3_profile_view_base",
    "x-li-page-instance": `urn:li:page:d_flagship3_profile_view_base;${trackingId}`,
    "x-li-page-instance-tracking-id": trackingId,
    "x-li-rsc-stream": "true",
    "x-li-application-instance": generateTrackingId(),
    "x-li-application-version": "0.2.4114",
    ...extra,
  };
}

async function liGet(url, params = {}) {
  const qs = new URLSearchParams(params).toString();
  return fetch(qs ? `${url}?${qs}` : url, { headers: hdrs(), credentials: "include" });
}

async function liPost(url, body, extra = {}) {
  return fetch(url, {
    method: "POST",
    headers: hdrs(extra),
    credentials: "include",
    body: JSON.stringify(body),
  });
}

const wait = ms => new Promise(r => setTimeout(r, ms));

/** Generates a random base64-style tracking ID (mimics LinkedIn's client-side ID) */
function generateTrackingId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  return Array.from({ length: 24 }, () => chars[Math.floor(Math.random() * chars.length)]).join("") + "==";
}

/**
 * Parse RSC (React Server Component) streaming response to check for errors.
 * LinkedIn's flagship-web endpoints return a streaming format like:
 *   0:{"response":...}
 *   1:I["module",[]]
 * We only care about line 0 (the JSON response line).
 */
function rscHasError(txt) {
  try {
    const firstLine = txt.split("\n")[0];
    // Lines starting with digits followed by colon are RSC chunks
    const jsonMatch = firstLine.match(/^\d+:(.*)/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1]);
      // IMPORTANT: errors:[] is SUCCESS (empty array = no errors).
      // Must check .length > 0, not just truthiness (arrays are always truthy in JS).
      if (parsed?.error) return true;
      if (Array.isArray(parsed?.errors) && parsed.errors.length > 0) return true;
      if (!Array.isArray(parsed?.errors) && parsed?.errors) return true;
      if (parsed?.response?.error) return true;
      if (Array.isArray(parsed?.response?.errors) && parsed.response.errors.length > 0) return true;
    }
  } catch (_) { /* ignore parse errors */ }
  // Hard failure strings (not just RSC module chunk noise)
  if (txt.includes('"Failed to create') || txt.includes('"FAILED"')) return true;
  return false;
}


// ═══════════════════════════════════════════════════════════
//  STEP 0: Get MY profile URN
// ═══════════════════════════════════════════════════════════

async function getMyUrn() {
  console.log("[0] Fetching my URN...");
  const r = await liGet("https://www.linkedin.com/voyager/api/me");
  if (!r.ok) throw new Error(`/me HTTP ${r.status}`);
  const json = await r.json();
  const str  = JSON.stringify(json);

  // fsd_profile preferred (needed by most newer APIs)
  const m1 = str.match(/"(urn:li:fsd_profile:[A-Za-z0-9_-]+)"/);
  if (m1) { console.log("[0] ✅ My URN:", m1[1]); return m1[1]; }

  // Fallback: fs_miniProfile → convert prefix
  const m2 = str.match(/"(urn:li:fs_miniProfile:[A-Za-z0-9_-]+)"/);
  if (m2) {
    const converted = m2[1].replace("urn:li:fs_miniProfile:", "urn:li:fsd_profile:");
    console.log("[0] ✅ My URN (converted):", converted);
    return converted;
  }
  throw new Error("Could not find my URN in /me response");
}


// ═══════════════════════════════════════════════════════════
//  STEP 1: Get TARGET profile URN + member ID
// ═══════════════════════════════════════════════════════════

async function getProfile(vanityId) {
  console.log(`\n[1] Looking up profile: /in/${vanityId}`);
  const r = await liGet("https://www.linkedin.com/voyager/api/identity/dash/profiles", {
    q: "memberIdentity",
    memberIdentity: vanityId,
  });
  if (!r.ok) throw new Error(`dash/profiles HTTP ${r.status}`);
  const json = await r.json();
  const all  = [...(json.included || []), ...(json.data?.elements || []), ...(json.elements || [])];
  const p    = all.find(e => (e.$type || "").toLowerCase().includes("profile") && (e.firstName || e.lastName));
  if (!p) throw new Error(`No profile found for: ${vanityId}`);

  const urn = p.entityUrn || p.urn || "";

  // Extract raw member/profile ID from URN for invite APIs
  const profileIdMatch = urn.match(/fsd_profile:([A-Za-z0-9_-]+)/) ||
                         urn.match(/fs_miniProfile:([A-Za-z0-9_-]+)/);
  const profileId = profileIdMatch ? profileIdMatch[1] : null;

  // Try to extract numeric memberId from profile data
  let numericMemberId = null;

  if (p.publicId && /^\d+$/.test(p.publicId)) {
    numericMemberId = p.publicId;
  } else if (p.memberUrn) {
    const memberMatch = p.memberUrn.match(/member:(\d+)/);
    if (memberMatch) numericMemberId = memberMatch[1];
  } else if (p.id && /^\d+$/.test(p.id)) {
    numericMemberId = p.id;
  } else if (p.objectUrn) {
    const objectMatch = p.objectUrn.match(/member:(\d+)/);
    if (objectMatch) numericMemberId = objectMatch[1];
  }

  // Also scan included array for any member URN
  if (!numericMemberId && json.included) {
    for (const item of json.included) {
      if (item.entityUrn && item.entityUrn.includes("urn:li:member:")) {
        const mm = item.entityUrn.match(/member:(\d+)/);
        if (mm) { numericMemberId = mm[1]; break; }
      }
      // objectUrn can also carry numeric member ID
      if (item.objectUrn) {
        const mm = item.objectUrn.match(/member:(\d+)/);
        if (mm) { numericMemberId = mm[1]; break; }
      }
    }
  }

  console.log(`[1] ✅ Profile: ${p.firstName || ""} ${p.lastName || ""}`);
  console.log(`     URN       : ${urn}`);
  console.log(`     profileId : ${profileId}`);
  console.log(`     memberId  : ${numericMemberId || "(not found — will try fallback)"}`);

  return {
    urn,
    profileId,
    memberId: numericMemberId,   // may be null — followLead() handles that
    firstName: p.firstName || "",
    lastName:  p.lastName  || "",
    vanityId,
    profileUrl: `https://www.linkedin.com/in/${vanityId}`,
  };
}


// ═══════════════════════════════════════════════════════════
//  STEP 2: Get most recent post (actUrn + ugcPostUrn)
// ═══════════════════════════════════════════════════════════

async function getMostRecentPost(profileUrn, vanityId) {
  console.log(`\n[2] Fetching most recent post for: ${profileUrn}`);

  const r = await liGet("https://www.linkedin.com/voyager/api/identity/profileUpdatesV2", {
    q: "memberShareFeed",
    moduleKey: "member-shares:phone",
    count: "10",
    start: "0",
    profileUrn: profileUrn,
  });
  if (!r.ok) throw new Error(`profileUpdatesV2 HTTP ${r.status}`);
  const json = await r.json();

  const UPDATE_TYPES = [
    "com.linkedin.voyager.feed.render.UpdateV2",
    "com.linkedin.voyager.feed.Update",
    "com.linkedin.voyager.dash.feed.Update",
    "com.linkedin.voyager.identity.profile.ProfileUpdate",
  ];
  const included   = json.included || [];
  let   postEntity = null;
  for (const e of included) {
    const t = e.$type || "";
    if (!UPDATE_TYPES.some(pt => t.includes(pt))) continue;
    if (!(e.entityUrn || e.urn)) continue;
    postEntity = e;
    break;
  }
  if (!postEntity) throw new Error("No post entities in profileUpdatesV2 response");

  const postUrn = postEntity.entityUrn || postEntity.urn;
  const actM    = postUrn.match(/urn:li:activity:(\d+)/);
  const actUrn  = actM ? `urn:li:activity:${actM[1]}` : postUrn;

  let text = "";
  const comm = postEntity.commentary;
  if (comm?.text) text = typeof comm.text === "string" ? comm.text : (comm.text?.text || "");
  if (!text) {
    const sc = postEntity.specificContent?.["com.linkedin.ugc.ShareContent"];
    text = sc?.shareCommentary?.text || "(no text)";
  }

  // Fetch ugcPost URN from post HTML (needed for comment API)
  console.log(`[2] Fetching post HTML to extract ugcPost URN...`);
  let ugcPostUrn = null;
  try {
    const pageR = await fetch(
      `https://www.linkedin.com/feed/update/${encodeURIComponent(actUrn)}/`,
      { headers: { accept: "text/html,application/xhtml+xml" }, credentials: "include" }
    );
    if (pageR.ok) {
      const html = await pageR.text();
      // Try multiple patterns to extract ugcPost URN
      const patterns = [
        /urn:li:ugcPost:(\d+)/,
        /"urn:li:ugcPost:(\d+)"/,
        /ugcPost%3A(\d+)/,
        /"ugcPostUrn":"urn:li:ugcPost:(\d+)"/
      ];
      for (const pat of patterns) {
        const m = html.match(pat);
        if (m) {
          ugcPostUrn = `urn:li:ugcPost:${m[1]}`;
          console.log(`[2] ✅ ugcPost URN: ${ugcPostUrn}`);
          break;
        }
      }
      if (!ugcPostUrn) {
        console.warn("[2] ugcPost URN not found in post page HTML - will use actUrn for comments");
      }
    }
  } catch (e) { console.warn("[2] Post page fetch error:", e.message); }

  console.log(`[2] ✅ Post fetched`);
  console.log(`     actUrn     : ${actUrn}`);
  console.log(`     ugcPostUrn : ${ugcPostUrn || "(none)"}`);
  console.log(`     text       : "${text.substring(0, 100)}"`);

  return { postUrn, actUrn, ugcPostUrn, text };
}


// ═══════════════════════════════════════════════════════════
//  STEP 3: Follow the lead
// ═══════════════════════════════════════════════════════════
//
//  REAL LINKEDIN FLOW (from captured network traffic):
//  Step A → POST /flagship-web/rsc-action/actions/server-request
//           ?sduiid=com.linkedin.sdui.impl.mynetwork.infra.components.relationshipbuildingdrawer
//           Body: RelationshipBuildingDrawerVariant.FollowDrawer  (opens the drawer UI)
//
//  Step B → POST /flagship-web/rsc-action/actions/server-request
//           ?sduiid=com.linkedin.sdui.requests.mynetwork.addaUpdateFollowState
//           Body: followStateType + memberUrn.memberId (numeric)  ← ACTUAL follow action
//
//  NOTE: The SDUI response is RSC streaming format (0:{...}\n1:I[...]\n...)
//        HTTP 200 + no explicit error in line-0 JSON = success.

async function followLead(profileUrn, profileId, memberId, vanityId) {
  console.log(`\n[3] Following lead: ${profileUrn}`);

  const targetProfileId = profileId || profileUrn.match(/fsd_profile:([A-Za-z0-9_-]+)/)?.[1];
  if (!targetProfileId) throw new Error("Cannot extract profileId for follow");

  // Resolve numeric memberId — required by addaUpdateFollowState
  let targetMemberId = (memberId && /^\d+$/.test(String(memberId))) ? String(memberId) : null;

  if (!targetMemberId) {
    console.log("[3] No numeric memberId in profile data — scraping from profile page...");
    try {
      const pageR = await fetch(`https://www.linkedin.com/in/${vanityId || TARGET_VANITY_ID}`, {
        headers: { accept: "text/html" },
        credentials: "include",
      });
      if (pageR.ok) {
        const html = await pageR.text();
        // LinkedIn embeds memberId in several places in the HTML
        const patterns = [
          /"memberId":"(\d+)"/,
          /"objectUrn":"urn:li:member:(\d+)"/,
          /urn:li:member:(\d+)/,
          /"memberUrn":"urn:li:member:(\d+)"/,
        ];
        for (const pat of patterns) {
          const m = html.match(pat);
          if (m) { targetMemberId = m[1]; break; }
        }
        if (targetMemberId) {
          console.log(`[3] Extracted memberId from profile page: ${targetMemberId}`);
        }
      }
    } catch (e) {
      console.warn("[3] Profile page scrape failed:", e.message);
    }
  }

  if (!targetMemberId) {
    console.error("[3] ❌ Could not resolve numeric memberId. Cannot follow via SDUI.");
    return false;
  }

  console.log(`[3] profileId : ${targetProfileId}`);
  console.log(`[3] memberId  : ${targetMemberId}`);

  // ── Step A: Open FollowDrawer (mimics UI button click) ───────────────────
  console.log("[3] Step A: Opening FollowDrawer...");
  const parentSpanIdA = generateTrackingId();
  const drawerEndpoint = `https://www.linkedin.com/flagship-web/rsc-action/actions/server-request?sduiid=com.linkedin.sdui.impl.mynetwork.infra.components.relationshipbuildingdrawer&parentSpanId=${encodeURIComponent(parentSpanIdA)}`;

  const drawerBody = {
    requestId: "com.linkedin.sdui.impl.mynetwork.infra.components.relationshipbuildingdrawer",
    serverRequest: {
      $type: "proto.sdui.actions.core.ServerRequest",
      requestId: "com.linkedin.sdui.impl.mynetwork.infra.components.relationshipbuildingdrawer",
      requestedArguments: {
        $type: "proto.sdui.actions.requests.RequestedArguments",
        payload: {
          properties: {
            componentRef: `ProfilePostConnectDrawer_${vanityId || TARGET_VANITY_ID}`,
            drawerType: {
              type: "RelationshipBuildingDrawerVariant.FollowDrawer",
              value: {
                profileUrn: { profileId: targetProfileId },
              },
            },
            style: 0,
          },
        },
        requestedStateKeys: [],
        requestMetadata: { $type: "proto.sdui.common.RequestMetadata" },
      },
      isStreaming: false,
      rumPageKey: "",
      isApfcEnabled: false,
    },
    states: [],
    requestedArguments: {
      $type: "proto.sdui.actions.requests.RequestedArguments",
      payload: {
        properties: {
          componentRef: `ProfilePostConnectDrawer_${vanityId || TARGET_VANITY_ID}`,
          drawerType: {
            type: "RelationshipBuildingDrawerVariant.FollowDrawer",
            value: {
              profileUrn: { profileId: targetProfileId },
            },
          },
          style: 0,
        },
      },
      requestedStateKeys: [],
      requestMetadata: { $type: "proto.sdui.common.RequestMetadata" },
      states: [],
      screenId: "com.linkedin.sdui.flagshipnav.profile.Profile",
    },
  };

  try {
    const rA = await fetch(drawerEndpoint, {
      method: "POST",
      headers: sduiHdrs(),
      credentials: "include",
      body: JSON.stringify(drawerBody),
    });
    const txtA = await rA.text().catch(() => "");
    console.log(`[3] Step A HTTP ${rA.status} | ${txtA.substring(0, 100)}`);
    if (rA.status !== 200 && rA.status !== 201) {
      console.warn(`[3] Step A (drawer open) returned ${rA.status} — continuing to Step B anyway`);
    }
  } catch (e) {
    console.warn("[3] Step A error (non-fatal):", e.message);
  }

  await wait(400);

  // ── Step B: Send the actual follow action ─────────────────────────────────
  console.log("[3] Step B: Sending follow action (addaUpdateFollowState)...");
  const parentSpanIdB = generateTrackingId();
  const followEndpoint = `https://www.linkedin.com/flagship-web/rsc-action/actions/server-request?sduiid=com.linkedin.sdui.requests.mynetwork.addaUpdateFollowState&parentSpanId=${encodeURIComponent(parentSpanIdB)}`;

  const followBody = {
    requestId: "com.linkedin.sdui.requests.mynetwork.addaUpdateFollowState",
    serverRequest: {
      $type: "proto.sdui.actions.core.ServerRequest",
      requestId: "com.linkedin.sdui.requests.mynetwork.addaUpdateFollowState",
      requestedArguments: {
        $type: "proto.sdui.actions.requests.RequestedArguments",
        payload: {
          followStateType: "FollowStateType_FOLLOW_ACTIVE",
          memberUrn: { memberId: targetMemberId },
          postActionSentConfigs: [
            {
              type: "VerificationNbaArgs",
              value: {
                entryPoint: 66,
                redirectUri: `https://www.linkedin.com/in/${vanityId || TARGET_VANITY_ID}`,
              },
            },
            {
              type: "ProfileReplaceableSectionArgs",
              value: {
                data: {
                  profileId: targetProfileId,
                  vanityName: vanityId || TARGET_VANITY_ID,
                },
              },
            },
            {
              type: "ProfileDiscoveryDrawerArgs",
              value: {
                data: {
                  vanityName: vanityId || TARGET_VANITY_ID,
                  nonIterableProfileId: targetProfileId,
                },
              },
            },
          ],
        },
        requestedStateKeys: [],
        requestMetadata: { $type: "proto.sdui.common.RequestMetadata" },
      },
      isStreaming: false,
      rumPageKey: "",
      isApfcEnabled: false,
      onClientRequestFailureAction: {
        actions: [
          {
            $type: "proto.sdui.actions.core.SetState",
            value: {
              $type: "proto.sdui.actions.core.SetState",
              stateKey: "",
              stateValue: "",
              state: {
                $type: "proto.sdui.State",
                stateKey: "",
                key: {
                  $type: "proto.sdui.StateKey",
                  value: `urn:li:fsd_followingState:urn:li:member:${targetMemberId}`,
                  key: {
                    $type: "proto.sdui.Key",
                    value: {
                      $case: "id",
                      id: `urn:li:fsd_followingState:urn:li:member:${targetMemberId}`,
                    },
                  },
                  namespace: "",
                  isEncrypted: false,
                },
                value: { $case: "stringValue", stringValue: "Follow" },
                isOptimistic: false,
              },
              isOptimistic: false,
            },
          },
        ],
      },
    },
    states: [],
    requestedArguments: {
      $type: "proto.sdui.actions.requests.RequestedArguments",
      payload: {
        followStateType: "FollowStateType_FOLLOW_ACTIVE",
        memberUrn: { memberId: targetMemberId },
        postActionSentConfigs: [
          {
            type: "VerificationNbaArgs",
            value: {
              entryPoint: 66,
              redirectUri: `https://www.linkedin.com/in/${vanityId || TARGET_VANITY_ID}`,
            },
          },
          {
            type: "ProfileReplaceableSectionArgs",
            value: {
              data: {
                profileId: targetProfileId,
                vanityName: vanityId || TARGET_VANITY_ID,
              },
            },
          },
          {
            type: "ProfileDiscoveryDrawerArgs",
            value: {
              data: {
                vanityName: vanityId || TARGET_VANITY_ID,
                nonIterableProfileId: targetProfileId,
              },
            },
          },
        ],
      },
      requestedStateKeys: [],
      requestMetadata: { $type: "proto.sdui.common.RequestMetadata" },
      states: [],
      screenId: "com.linkedin.sdui.flagshipnav.profile.Profile",
    },
  };

  try {
    const rB = await fetch(followEndpoint, {
      method: "POST",
      headers: sduiHdrs(),
      credentials: "include",
      body: JSON.stringify(followBody),
    });
    const txtB = await rB.text().catch(() => "");
    console.log(`[3] Step B HTTP ${rB.status} | ${txtB.substring(0, 200)}`);

    if (rB.status === 200 || rB.status === 201) {
      // Use targeted RSC error detection — NOT broad string search
      if (rscHasError(txtB)) {
        console.warn("[3] ⚠️ Follow action returned HTTP 200 but response contains an error.");
        return false;
      }
      console.log(`[3] ✅ Follow successful! (memberId: ${targetMemberId})`);
      return true;
    }

    console.warn(`[3] Follow returned HTTP ${rB.status}`);
    return false;
  } catch (e) {
    console.warn("[3] Follow error:", e.message);
    return false;
  }
}


// ═══════════════════════════════════════════════════════════
//  STEP 4: Send connection request (with optional note)
// ═══════════════════════════════════════════════════════════
//
//  REAL LINKEDIN FLOW (confirmed by network capture — Feb 2025):
//
//  ┌─────────────────────────────────────────────────────────┐
//  │  Step A  POST relationshipbuildingdrawer                │
//  │          Body: ConnectDrawer variant                    │
//  │          → Opens the connection drawer UI               │
//  │          → HTTP 200 = drawer opened ✅                   │
//  ├─────────────────────────────────────────────────────────┤
//  │  Step B  POST handlePostInteropConnection               │
//  │          Body: profileId, vanityName, firstName,        │
//  │                lastName, success: true                  │
//  │          → THIS IS THE ACTUAL INVITE SENDER ✅          │
//  │          → HTTP 200 = invitation sent successfully      │
//  └─────────────────────────────────────────────────────────┘
//
//  KEY FINDING from captured logs (request #5):
//    handlePostInteropConnection with success:true IS the actual connection
//    request sender. The drawer just opens the UI, but Step B sends the invite.
//
//  NOTE ON customMessage / note:
//    The "Send without a note" flow sends success:true without customMessage.
//    For "Send with a note" include customMessage in Step B payload.

async function sendConnectionRequest(profile, note) {
  console.log(`\n[4] Sending connection request to: ${profile.firstName} ${profile.lastName}`);
  if (note) console.log(`    Note: "${note}"`);

  // Try direct Voyager invitation API first
  console.log("[4] Attempting direct Voyager invitation API...");
  try {
    const inviteEndpoint = "https://www.linkedin.com/voyager/api/growth/normInvitations";
    const inviteBody = {
      invitee: {
        "com.linkedin.voyager.growth.invitation.InviteeProfile": {
          profileId: profile.profileId
        }
      },
      trackingId: generateTrackingId()
    };
    
    if (note) {
      inviteBody.message = note;
    }
    
    console.log("[4] Voyager payload:", JSON.stringify(inviteBody, null, 2));
    
    const r = await liPost(inviteEndpoint, inviteBody, {
      "x-restli-method": "CREATE"
    });
    
    const txt = await r.text().catch(() => "");
    console.log(`[4] Voyager HTTP ${r.status} | ${txt.substring(0, 200)}`);
    
    if (r.status === 201 || r.status === 200) {
      console.log("[4] ✅ Connection request sent via Voyager API!");
      return true;
    }
    
    if (r.status === 422) {
      console.log("[4] ✅ HTTP 422 = already connected or invitation pending");
      return true;
    }
    
    console.warn(`[4] Voyager API returned HTTP ${r.status}, trying SDUI flow...`);
  } catch (e) {
    console.warn("[4] Voyager API error:", e.message, "- trying SDUI flow...");
  }

  // Fallback to SDUI flow
  const componentRef = `ProfilePostConnectDrawer_${profile.vanityId || TARGET_VANITY_ID}`;
  
  // Build the ConnectDrawer value - add customMessage here if note is provided
  const drawerValue = {
    profileUrn: { profileId: profile.profileId },
    origin: 16,
  };
  
  // CRITICAL: Add customMessage to drawerValue if note is provided
  if (note) {
    drawerValue.customMessage = note;
  }

  const connectBody = {
    requestId: "com.linkedin.sdui.impl.mynetwork.infra.components.relationshipbuildingdrawer",
    serverRequest: {
      $type: "proto.sdui.actions.core.ServerRequest",
      requestId: "com.linkedin.sdui.impl.mynetwork.infra.components.relationshipbuildingdrawer",
      requestedArguments: {
        $type: "proto.sdui.actions.requests.RequestedArguments",
        payload: {
          properties: {
            componentRef,
            drawerType: {
              type: "RelationshipBuildingDrawerVariant.ConnectDrawer",
              value: drawerValue,
            },
            style: 0,
          },
        },
        requestedStateKeys: [],
        requestMetadata: { $type: "proto.sdui.common.RequestMetadata" },
      },
      isStreaming: false,
      rumPageKey: "",
      isApfcEnabled: false,
    },
    states: [],
    requestedArguments: {
      $type: "proto.sdui.actions.requests.RequestedArguments",
      payload: {
        properties: {
          componentRef,
          drawerType: {
            type: "RelationshipBuildingDrawerVariant.ConnectDrawer",
            value: drawerValue,
          },
          style: 0,
        },
      },
      requestedStateKeys: [],
      requestMetadata: { $type: "proto.sdui.common.RequestMetadata" },
      states: [],
      screenId: "com.linkedin.sdui.flagshipnav.profile.Profile",
    },
  };

  // ── Step A: POST ConnectDrawer — opens the drawer UI ──────────────────────
  console.log("[4] Step A: Opening ConnectDrawer...");
  try {
    const parentSpanIdA = generateTrackingId();
    const drawerEndpoint = `https://www.linkedin.com/flagship-web/rsc-action/actions/server-request?sduiid=com.linkedin.sdui.impl.mynetwork.infra.components.relationshipbuildingdrawer&parentSpanId=${encodeURIComponent(parentSpanIdA)}`;
    
    const rA = await fetch(drawerEndpoint, {
      method: "POST",
      headers: sduiHdrs(),
      credentials: "include",
      body: JSON.stringify(connectBody),
    });
    const txtA = await rA.text().catch(() => "");
    console.log(`[4] Step A HTTP ${rA.status} | ${txtA.substring(0, 200)}`);

    if (rA.status !== 200 && rA.status !== 201) {
      console.warn(`[4] ⚠️ ConnectDrawer returned HTTP ${rA.status}`);
      console.warn(`[4]    Response: ${txtA.substring(0, 300)}`);
      return false;
    }
    
    if (rscHasError(txtA)) {
      console.warn("[4] ⚠️ ConnectDrawer returned HTTP 200 but RSC response contains an error.");
      return false;
    }
    
    console.log("[4] ✅ ConnectDrawer opened successfully!");
    await wait(100); // Minimal delay - LinkedIn sends Step B almost immediately

    // ── Step B: Send actual connection request (handlePostInteropConnection) ──
    console.log("[4] Step B: Sending actual connection request (THIS IS THE INVITE)...");
    const parentSpanIdB = generateTrackingId();
    const inviteEndpoint = `https://www.linkedin.com/flagship-web/rsc-action/actions/server-request?sduiid=com.linkedin.sdui.requests.mynetwork.handlePostInteropConnection&parentSpanId=${encodeURIComponent(parentSpanIdB)}`;
    
    // Build payload - EXACT structure from captured "Send without a note" request
    const invitePayload = {
      profileId: profile.profileId,
      vanityName: profile.vanityId || TARGET_VANITY_ID,
      firstName: profile.firstName,
      lastName: profile.lastName,
      success: true,
      errorType: "",
      showVerificationPostConnectNBA: true
    };
    
    // Add customMessage ONLY if note is provided (for "Send with a note" flow)
    if (note) {
      invitePayload.customMessage = note;
    }
    
    console.log("[4] Step B payload:", JSON.stringify(invitePayload, null, 2));
    
    const inviteBody = {
      requestId: "com.linkedin.sdui.requests.mynetwork.handlePostInteropConnection",
      serverRequest: {
        $type: "proto.sdui.actions.core.ServerRequest",
        requestId: "com.linkedin.sdui.requests.mynetwork.handlePostInteropConnection",
        requestedArguments: {
          $type: "proto.sdui.actions.requests.RequestedArguments",
          payload: invitePayload,
          requestedStateKeys: [],
        },
        isStreaming: false,
        isApfcEnabled: false,
        rumPageKey: "",
      },
      states: [],
      requestedArguments: {
        $type: "proto.sdui.actions.requests.RequestedArguments",
        payload: invitePayload,
        requestedStateKeys: [],
        states: [],
        screenId: "",
      },
    };
    
    const rB = await fetch(inviteEndpoint, {
      method: "POST",
      headers: sduiHdrs(),
      credentials: "include",
      body: JSON.stringify(inviteBody),
    });
    const txtB = await rB.text().catch(() => "");
    console.log(`[4] Step B HTTP ${rB.status} | ${txtB.substring(0, 200)}`);

    if (rB.status === 200 || rB.status === 201) {
      if (rscHasError(txtB)) {
        console.warn("[4] ⚠️ Connection request returned HTTP 200 but RSC response contains an error.");
        console.warn("[4]    Full response:", txtB.substring(0, 500));
        return false;
      }
      console.log(`[4] ✅ Connection request sent successfully! (handlePostInteropConnection HTTP ${rB.status})`);
      return true;
    }

    if (rB.status === 422) {
      console.log("[4] ✅ HTTP 422 = already connected or invitation already pending.");
      return true;
    }

    console.warn(`[4] ⚠️ Connection request returned HTTP ${rB.status}`);
    console.warn(`[4]    Response: ${txtB.substring(0, 300)}`);
    return false;

  } catch (e) {
    console.error("[4] ❌ Connection request threw:", e.message);
    return false;
  }
}

/**
 * DEPRECATED: This interceptor is no longer needed.
 * The correct flow is now implemented in sendConnectionRequest():
 *   Step A: Open drawer (relationshipbuildingdrawer)
 *   Step B: Send invite (handlePostInteropConnection with success:true)
 */
function installInviteInterceptor() {
  console.warn("[interceptor] DEPRECATED: This function is no longer needed.");
  console.warn("[interceptor] The correct connection flow is now built into sendConnectionRequest().");
  console.warn("[interceptor] Just run the main script — it will work automatically.");
  return;
  
  // OLD CODE (kept for reference):
  if (window._liInterceptorActive) {
    console.log("[interceptor] Already active — just go click Connect on any profile.");
    return;
  }
  const _origFetch = window.fetch;
  window.fetch = function(...args) {
    const [url, opts] = args;
    const urlStr = typeof url === "string" ? url : (url?.url || "");
    const method  = (opts?.method || "GET").toUpperCase();

    if (method === "POST" && typeof urlStr === "string" && (
      urlStr.includes("invitation") ||
      urlStr.includes("Invitation") ||
      urlStr.includes("invite") ||
      urlStr.includes("normInvitation")
    )) {
      let parsedBody = null;
      try { parsedBody = JSON.parse(opts?.body || "{}"); } catch (_) {}

      // Skip SDUI/NBA handlers — we only want the actual invite POST
      const isDrawer = urlStr.includes("relationshipbuildingdrawer");
      const isNba    = urlStr.includes("handlePostInteropConnection");
      if (!isDrawer && !isNba && parsedBody) {
        console.log("🎯 [interceptor] INVITE REQUEST CAPTURED!");
        console.log("   URL :", urlStr);
        console.log("   Body:", JSON.stringify(parsedBody, null, 2));
        // Store for next script run
        window._liCapturedInvite = {
          url: urlStr.startsWith("http") ? urlStr : `https://www.linkedin.com${urlStr}`,
          body: parsedBody,
          extra: {
            "x-restli-method": opts?.headers?.["x-restli-method"] || "create",
            "x-restli-protocol-version": "2.0.0",
          },
        };
        console.log("✅ [interceptor] Saved to window._liCapturedInvite — re-run the script now!");
        // Restore original fetch after capture
        window.fetch = _origFetch;
        window._liInterceptorActive = false;
      }
    }

    return _origFetch.apply(this, args);
  };
  window._liInterceptorActive = true;
  console.log("✅ [interceptor] Listening for invite requests...");
  console.log("   Go to any LinkedIn profile → Click Connect → Add a note → Send");
  console.log("   The real endpoint will be captured automatically.");
}

/**
 * DEPRECATED: This function is no longer needed.
 * handlePostInteropConnection with success:true IS the actual invite sender.
 * It's now called directly in sendConnectionRequest() as Step B.
 */
async function firePostConnectNba(profile) {
  console.warn("[4-nba] DEPRECATED: firePostConnectNba() is no longer used.");
  console.warn("[4-nba] handlePostInteropConnection is now the main invite sender (Step B).");
  return;
}


// ═══════════════════════════════════════════════════════════
//  STEP 5: Check if lead replied to YOUR previous comment
// ═══════════════════════════════════════════════════════════

async function checkLeadReplied(ugcPostUrn, actUrn, myUrn, leadUrn) {
  console.log(`\n[5] Checking comments and replies...`);
  console.log(`    Post (ugc): ${ugcPostUrn || "(none)"}`);
  console.log(`    Post (act): ${actUrn}`);
  console.log(`    My URN    : ${myUrn}`);
  console.log(`    Lead URN  : ${leadUrn}`);

  // Try both URN formats for fetching comments
  const threadUrns = [ugcPostUrn, actUrn].filter(Boolean);
  let allComments = [];

  // ── 5-A: Fetch comments using multiple endpoints ──────────────────────────
  for (const threadUrn of threadUrns) {
    console.log(`[5] Trying to fetch comments with threadUrn: ${threadUrn}`);
    try {
      for (let start = 0; start < 100; start += 20) {
        const r = await liGet(
          "https://www.linkedin.com/voyager/api/voyagerSocialDashNormComments",
          { threadUrn, count: "20", start: String(start), q: "comments", sortOrder: "RELEVANCE" }
        );
        if (!r.ok) { 
          console.warn(`[5] Comments HTTP ${r.status} at start=${start} for ${threadUrn}`);
          break;
        }
        const json     = await r.json();
        const elements = json.elements || json.data?.elements || [];
        const included = json.included || [];
        const all      = [...elements, ...included];
        if (all.length === 0) break;
        allComments.push(...all);
        if (elements.length < 20) break;
        await wait(400);
      }
      if (allComments.length > 0) {
        console.log(`[5] ✅ Successfully fetched comments using ${threadUrn}`);
        break; // Stop trying other URNs if we got comments
      }
    } catch (e) {
      console.warn(`[5] Error fetching comments with ${threadUrn}:`, e.message);
    }
  }

  console.log(`[5] Fetched ${allComments.length} comment entities total.`);

  if (allComments.length === 0) {
    console.warn("[5] ⚠️  Could not fetch any comments. The post may have no comments or the API endpoint changed.");
    return { replied: false, replyText: null, replyUrn: null, reason: "no_comments_fetched" };
  }

  // ── 5-B: Find YOUR comments ───────────────────────────────────────────────
  const myCommentUrns = new Set();
  const myCommentDetails = [];
  const normalizedMe  = myUrn.replace("urn:li:fs_miniProfile:", "urn:li:fsd_profile:");

  for (const c of allComments) {
    const authorUrn = (
      c.commenter?.["com.linkedin.voyager.identity.shared.MiniProfile"]?.entityUrn
      || c.commenter?.entityUrn
      || c.author?.entityUrn
      || c.authorUrn
      || ""
    ).replace("urn:li:fs_miniProfile:", "urn:li:fsd_profile:");

    if (authorUrn && authorUrn === normalizedMe) {
      const urn = c.entityUrn || c.urn;
      const text = c.commentV2?.text || c.comment?.text || c.commentary?.text || "(no text)";
      if (urn) {
        myCommentUrns.add(urn);
        myCommentDetails.push({ urn, text: String(text).substring(0, 100) });
      }
    }
  }
  
  console.log(`[5] Found ${myCommentUrns.size} of YOUR comments on this post:`);
  for (const detail of myCommentDetails) {
    console.log(`     - "${detail.text}"`);
  }

  if (myCommentUrns.size === 0) {
    console.log("[5] ℹ️  You haven't commented on this post yet — nothing to check.");
    return { replied: false, replyText: null, replyUrn: null, reason: "no_my_comments", allReplies: [] };
  }

  // ── 5-C: Check for ALL replies (lead + others) ────────────────────────────
  const normalizedLead = leadUrn.replace("urn:li:fs_miniProfile:", "urn:li:fsd_profile:");
  const allReplies = [];
  let leadReplied = false;
  let leadReplyText = null;
  let leadReplyUrn = null;

  // (a) Scan already-fetched comments for replies to your comments
  for (const c of allComments) {
    const authorUrn = (
      c.commenter?.["com.linkedin.voyager.identity.shared.MiniProfile"]?.entityUrn
      || c.commenter?.entityUrn
      || c.author?.entityUrn
      || c.authorUrn
      || ""
    ).replace("urn:li:fs_miniProfile:", "urn:li:fsd_profile:");

    const parentUrn = c.parentCommentUrn || c.parentUrn || "";
    const replyUrn  = c.entityUrn || c.urn || "";

    if (myCommentUrns.has(parentUrn)) {
      const replyText = c.commentV2?.text || c.comment?.text || c.commentary?.text || "(text unavailable)";
      const authorName = c.commenter?.["com.linkedin.voyager.identity.shared.MiniProfile"]?.firstName || "Unknown";
      const isLead = authorUrn === normalizedLead;
      
      allReplies.push({
        authorUrn,
        authorName,
        isLead,
        replyUrn,
        replyText: String(replyText),
        parentCommentUrn: parentUrn
      });

      if (isLead) {
        leadReplied = true;
        leadReplyText = String(replyText);
        leadReplyUrn = replyUrn;
        console.log(`[5] ✅ LEAD REPLIED to your comment!`);
        console.log(`     Reply URN  : ${replyUrn}`);
        console.log(`     Reply text : "${String(replyText).substring(0, 120)}"`);
      }
    }
  }

  // (b) Fetch nested replies for each of your comment threads
  console.log(`[5] Fetching nested replies on your ${myCommentUrns.size} comment(s)...`);
  for (const myCommentUrn of myCommentUrns) {
    try {
      // Try all threadUrns for nested replies
      for (const threadUrn of threadUrns) {
        const r = await liGet(
          "https://www.linkedin.com/voyager/api/voyagerSocialDashNormComments",
          { parentCommentUrn: myCommentUrn, threadUrn, count: "20", start: "0", q: "comments" }
        );
        if (!r.ok) continue;
        const json    = await r.json();
        const replies = [...(json.elements || []), ...(json.data?.elements || []), ...(json.included || [])];

        for (const rep of replies) {
          const repAuthor = (
            rep.commenter?.["com.linkedin.voyager.identity.shared.MiniProfile"]?.entityUrn
            || rep.commenter?.entityUrn
            || rep.author?.entityUrn
            || rep.authorUrn
            || ""
          ).replace("urn:li:fs_miniProfile:", "urn:li:fsd_profile:");

          const replyText = rep.commentV2?.text || rep.comment?.text || rep.commentary?.text || "(text unavailable)";
          const replyUrn  = rep.entityUrn || rep.urn || "";
          const authorName = rep.commenter?.["com.linkedin.voyager.identity.shared.MiniProfile"]?.firstName || "Unknown";
          const isLead = repAuthor === normalizedLead;

          allReplies.push({
            authorUrn: repAuthor,
            authorName,
            isLead,
            replyUrn,
            replyText: String(replyText),
            parentCommentUrn: myCommentUrn
          });

          if (isLead && !leadReplied) {
            leadReplied = true;
            leadReplyText = String(replyText);
            leadReplyUrn = replyUrn;
            console.log(`[5] ✅ LEAD REPLIED to your comment (nested)!`);
            console.log(`     Your comment : ${myCommentUrn}`);
            console.log(`     Reply URN    : ${replyUrn}`);
            console.log(`     Reply text   : "${String(replyText).substring(0, 120)}"`);
          }
        }
        if (replies.length > 0) break; // Stop trying other threadUrns if we got replies
      }
      await wait(300);
    } catch (e) {
      console.warn(`[5] Error fetching replies for ${myCommentUrn}:`, e.message);
    }
  }

  // Summary
  console.log(`\n[5] 📊 Reply Summary:`);
  console.log(`     Total replies to your comments: ${allReplies.length}`);
  console.log(`     Lead replied: ${leadReplied ? "YES" : "NO"}`);
  console.log(`     Others replied: ${allReplies.filter(r => !r.isLead).length}`);
  
  if (allReplies.length > 0) {
    console.log(`\n[5] All replies:`);
    for (const reply of allReplies) {
      const label = reply.isLead ? "🎯 LEAD" : "👤 OTHER";
      console.log(`     ${label} (${reply.authorName}): "${reply.replyText.substring(0, 80)}"`);
    }
  }

  if (!leadReplied && allReplies.length === 0) {
    console.log("[5] ℹ️  No one has replied to your comments yet.");
  }

  return { 
    replied: leadReplied, 
    replyText: leadReplyText, 
    replyUrn: leadReplyUrn, 
    reason: leadReplied ? "lead_replied" : (allReplies.length > 0 ? "others_replied" : "no_replies"),
    allReplies,
    myComments: Array.from(myCommentUrns)
  };
}


// ═══════════════════════════════════════════════════════════
//  STEP 6: Like post  (disabled by default)
// ═══════════════════════════════════════════════════════════

async function likePost(actUrn) {
  console.log(`\n[6] Liking: ${actUrn}`);
  const r = await liPost(
    "https://www.linkedin.com/voyager/api/voyagerSocialDashReactions",
    { reactionType: "LIKE", entityUrn: actUrn }
  );
  const txt = await r.text().catch(() => "");
  console.log(`[6] HTTP ${r.status} | ${txt.substring(0, 150)}`);
  if (r.status === 201 || r.status === 200) { console.log("[6] ✅ Post liked!"); return true; }
  if (r.status === 422) { console.log("[6] ✅ Already liked."); return true; }
  throw new Error(`Like failed HTTP ${r.status}`);
}


// ═══════════════════════════════════════════════════════════
//  STEP 7: Comment on post  (disabled by default)
// ═══════════════════════════════════════════════════════════

async function sendCommentSignal(actUrn) {
  const endpoint = "https://www.linkedin.com/voyager/api/graphql?action=execute&queryId=inSessionRelevanceVoyagerFeedDashClientSignal.c1c9c08097afa4e02954945e9df54091";
  try {
    const r = await liPost(endpoint, {
      variables: { backendUpdateUrn: actUrn, actionType: "submitComment" },
      queryId: "inSessionRelevanceVoyagerFeedDashClientSignal.c1c9c08097afa4e02954945e9df54091",
      includeWebMetadata: true,
    });
    console.log(`[pre-comment signal] HTTP ${r.status}`);
    return r.ok;
  } catch (e) {
    console.warn("[pre-comment signal] Non-critical error:", e.message);
    return false;
  }
}

async function commentPost(actUrn, ugcPostUrn, text) {
  console.log(`\n[7] Commenting: "${text}"`);
  await sendCommentSignal(actUrn);

  const endpoint = "https://www.linkedin.com/voyager/api/voyagerSocialDashNormComments?decorationId=com.linkedin.voyager.dash.deco.social.NormComment-43";
  const threadUrns = [ugcPostUrn, actUrn].filter(Boolean);

  for (const threadUrn of threadUrns) {
    console.log(`[7] Trying threadUrn: ${threadUrn}`);
    try {
      const r = await liPost(endpoint, {
        commentary: {
          text: text,
          attributesV2: [],
          "$type": "com.linkedin.voyager.dash.common.text.TextViewModel",
        },
        threadUrn: threadUrn,
      });
      const txt = await r.text().catch(() => "");
      console.log(`[7] HTTP ${r.status} | ${txt.substring(0, 200)}`);
      if (r.status === 201 || r.status === 200) {
        let parsed = null;
        try { parsed = JSON.parse(txt); } catch (_) {}
        const commentUrn = parsed?.data?.entityUrn || parsed?.entityUrn || "(no URN)";
        console.log("[7] ✅ Comment posted! URN:", commentUrn);
        return commentUrn;
      }
    } catch (e) {
      console.warn(`[7] Error with threadUrn ${threadUrn}:`, e.message);
    }
  }
  throw new Error("Comment failed with all threadUrn formats");
}


// ═══════════════════════════════════════════════════════════
//  STEP 8: Reply to comments (NEW)
// ═══════════════════════════════════════════════════════════

async function replyToComment(parentCommentUrn, threadUrn, replyText) {
  console.log(`\n[8] Replying to comment: ${parentCommentUrn}`);
  console.log(`    Reply text: "${replyText}"`);

  const endpoint = "https://www.linkedin.com/voyager/api/voyagerSocialDashNormComments?decorationId=com.linkedin.voyager.dash.deco.social.NormComment-43";

  try {
    const r = await liPost(endpoint, {
      commentary: {
        text: replyText,
        attributesV2: [],
        "$type": "com.linkedin.voyager.dash.common.text.TextViewModel",
      },
      threadUrn: threadUrn,
      parentCommentUrn: parentCommentUrn,
    });
    const txt = await r.text().catch(() => "");
    console.log(`[8] HTTP ${r.status} | ${txt.substring(0, 200)}`);
    if (r.status === 201 || r.status === 200) {
      let parsed = null;
      try { parsed = JSON.parse(txt); } catch (_) {}
      const replyUrn = parsed?.data?.entityUrn || parsed?.entityUrn || "(no URN)";
      console.log("[8] ✅ Reply posted! URN:", replyUrn);
      return { success: true, replyUrn };
    }
    console.warn(`[8] ⚠️ Reply failed with HTTP ${r.status}`);
    return { success: false, error: `HTTP ${r.status}` };
  } catch (e) {
    console.error(`[8] ❌ Reply error:`, e.message);
    return { success: false, error: e.message };
  }
}

async function sendAutoReplies(replyCheck, actUrn, ugcPostUrn) {
  if (!replyCheck.allReplies || replyCheck.allReplies.length === 0) {
    console.log("\n[8] No replies to respond to.");
    return [];
  }

  console.log(`\n[8] Auto-replying to ${replyCheck.allReplies.length} comment(s)...`);
  const results = [];
  const threadUrn = ugcPostUrn || actUrn;

  for (const reply of replyCheck.allReplies) {
    // Generate contextual reply based on who replied
    let replyText;
    if (reply.isLead) {
      replyText = `Thank you for your response! I really appreciate your insights. Would love to connect and discuss this further.`;
    } else {
      replyText = `Thanks for your comment! I appreciate you taking the time to engage.`;
    }

    console.log(`\n[8] Replying to ${reply.isLead ? "🎯 LEAD" : "👤 OTHER"} (${reply.authorName})...`);
    const result = await replyToComment(reply.replyUrn, threadUrn, replyText);
    results.push({
      targetAuthor: reply.authorName,
      isLead: reply.isLead,
      originalReply: reply.replyText.substring(0, 80),
      ...result
    });

    await wait(2000 + Math.random() * 1000); // Longer delay between replies to avoid rate limits
  }

  return results;
}


// ═══════════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════════

(async () => {
  console.log("═".repeat(65));
  console.log(`  LinkedIn Lead Automation  →  /in/${TARGET_VANITY_ID}`);
  console.log("═".repeat(65));
  console.log(`  Follow        : ${ENABLE_FOLLOW}`);
  console.log(`  Connect+Note  : ${ENABLE_CONNECT}`);
  console.log(`  Check Reply   : ${ENABLE_CHECK_REPLY}`);
  console.log(`  Auto Reply    : ${ENABLE_AUTO_REPLY}`);
  console.log(`  Like Post     : ${ENABLE_LIKE}`);
  console.log(`  Comment Post  : ${ENABLE_COMMENT}`);
  console.log("─".repeat(65));

  const results = {};

  try {
    if (!window.location.href.includes("linkedin.com"))
      throw new Error("Run this on a linkedin.com page.");
    if (!getCsrf())
      throw new Error("JSESSIONID not found — please log in to LinkedIn.");

    // ── 0. Get my URN ─────────────────────────────────────
    const myUrn = await getMyUrn();
    await wait(500);

    // ── 1. Get target profile ─────────────────────────────
    const profile = await getProfile(TARGET_VANITY_ID);
    results.profile = profile;
    await wait(800);

    // ── 2. Get most recent post ───────────────────────────
    const post = await getMostRecentPost(profile.urn, TARGET_VANITY_ID);
    results.post = post;
    await wait(800);

    // ── 3. Follow ─────────────────────────────────────────
    if (ENABLE_FOLLOW) {
      results.followed = await followLead(profile.urn, profile.profileId, profile.memberId, profile.vanityId);
      await wait(1000 + Math.random() * 500);
    }

    // ── 4. Connect with note ──────────────────────────────
    if (ENABLE_CONNECT) {
      results.connectionSent = await sendConnectionRequest(profile, CONNECTION_NOTE);
      await wait(1200 + Math.random() * 600);
    }

    // ── 5. Check if lead replied to your previous comment ─
    if (ENABLE_CHECK_REPLY) {
      results.replyCheck = await checkLeadReplied(
        post.ugcPostUrn, post.actUrn, myUrn, profile.urn
      );
      await wait(500);
    }

    // ── 6. Auto-reply to comments (NEW) ───────────────────
    if (ENABLE_AUTO_REPLY && results.replyCheck?.allReplies?.length > 0) {
      results.autoReplies = await sendAutoReplies(
        results.replyCheck, post.actUrn, post.ugcPostUrn
      );
      await wait(1000);
    }

    // ── 7. Like post (optional) ───────────────────────────
    if (ENABLE_LIKE) {
      results.liked = await likePost(post.actUrn);
      await wait(1200 + Math.random() * 600);
    }

    // ── 8. Comment (optional) ─────────────────────────────
    if (ENABLE_COMMENT) {
      results.commentUrn = await commentPost(post.actUrn, post.ugcPostUrn, COMMENT_TEXT);
    }

    // ── Summary ───────────────────────────────────────────
    console.log("\n" + "═".repeat(65));
    console.log("  ✅  COMPLETE!");
    console.log(`  Profile       : https://www.linkedin.com/in/${TARGET_VANITY_ID}`);
    if (ENABLE_FOLLOW)        console.log(`  Followed      : ${results.followed ? "✅" : "⚠️ check logs"}`);
    if (ENABLE_CONNECT)       console.log(`  Connected     : ${results.connectionSent ? "✅" : "⚠️ check logs"}`);
    if (ENABLE_CHECK_REPLY) {
      const rc = results.replyCheck;
      if (rc?.replied) {
        console.log(`  Lead Reply    : ✅ YES — "${String(rc.replyText).substring(0, 80)}"`);
      } else if (rc?.myComments?.length > 0) {
        console.log(`  Lead Reply    : ❌ No — (found ${rc.myComments.length} of your comments, no lead reply)`);
      } else {
        const reason = rc?.reason === "no_my_comments"
          ? "you haven't commented on this post yet"
          : rc?.reason === "no_comments_fetched"
          ? "could not fetch comments from post"
          : "no reply found";
        console.log(`  Lead Reply    : ❌ No — (${reason})`);
      }
      if (rc?.allReplies?.length > 0) {
        console.log(`  Other Replies : ${rc.allReplies.filter(r => !r.isLead).length} other(s) replied`);
      }
    }
    if (ENABLE_AUTO_REPLY && results.autoReplies) {
      const successCount = results.autoReplies.filter(r => r.success).length;
      console.log(`  Auto Replies  : ${successCount}/${results.autoReplies.length} sent`);
    }
    if (ENABLE_LIKE)    console.log(`  Liked         : ${results.liked ? "✅" : "⚠️"}`);
    if (ENABLE_COMMENT) console.log(`  Comment URN   : ${results.commentUrn || "⚠️"}`);
    console.log("═".repeat(65));

    window._liResult = { ...results, myUrn, ts: new Date().toISOString() };
    console.log("  Saved to → window._liResult");

  } catch (e) {
    console.error("\n❌ FATAL ERROR:", e.message);
    console.error("  → Make sure you are logged in at https://www.linkedin.com/feed/");
    console.error("  → Hard-refresh (Ctrl+Shift+R) if you get 403 errors.");
    window._liError = { message: e.message, ts: new Date().toISOString() };
  }
})();

/*
 * ═══════════════════════════════════════════════════════════
 *  TROUBLESHOOTING
 * ═══════════════════════════════════════════════════════════
 *
 *  If follow fails (⚠️ check logs):
 *    - The memberId extraction may have failed (check "[3] memberId" in logs)
 *    - Open the target's profile page, right-click → View Source
 *    - Search for "memberId" or "urn:li:member:" to find the numeric ID
 *    - Hardcode it temporarily: profile.memberId = "123456789"
 *
 *  If connect fails (⚠️ check logs):
 *    - Check "[4] Step A HTTP ..." for the status code
 *    - HTTP 200 + RSC error in response → check the full response text logged
 *    - HTTP 403 → CSRF token issue, hard-refresh LinkedIn (Ctrl+Shift+R) and retry
 *    - HTTP 429 → Rate limited. Wait a few minutes before retrying.
 *    - If the ConnectDrawer body format changed, LinkedIn may have updated their
 *      SDUI protocol. Run capture.js to re-capture the real endpoint structure.
 *
 *  How capture.js works (to re-capture if needed):
 *    1. Paste capture.js in the console
 *    2. Manually click Connect → "Send without a note" on any profile
 *    3. Look for capture #5 (the ConnectDrawer POST) in the logs
 *    4. Compare its body with the drawerBody in sendConnectionRequest()
 *    5. Update the script to match
 *
 *  If you get 429 (rate limit):
 *    - Increase wait() times in MAIN section
 *    - LinkedIn rate-limits invite sends — don't run more than ~10x/day
 *
 *  Response format notes:
 *    - SDUI (flagship-web) endpoints return RSC streaming format:
 *        0:{"response":{...}}      ← actual response (line 0 only)
 *        1:I["module",[]]          ← React module chunks (noise — NOT errors)
 *    - HTTP 200 + errors:[] in line-0 = SUCCESS (empty array means no errors)
 *    - HTTP 200 + errors:[{...}]   = FAILURE (non-empty errors array)
 *    - HTTP 422 = already connected/following (counts as success)
 *
 *  Architecture notes (v5.1 — Feb 2025):
 *    - CORRECTED based on captured network logs:
 *    - Step A (relationshipbuildingdrawer) opens the drawer UI
 *    - Step B (handlePostInteropConnection with success:true) IS the actual invite sender
 *    - This matches the real LinkedIn flow captured in request #2 and #5
 *    - There is NO separate Voyager invitation API call in LinkedIn's 2025 connect flow.
 * ═══════════════════════════════════════════════════════════
 */
