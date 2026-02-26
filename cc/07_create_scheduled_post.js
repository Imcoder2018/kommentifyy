/**
 * LinkedIn Browser Script: Create Scheduled Post (Text + Image)
 * ==============================================================
 * Mirrors: linkitin/poster.py → create_scheduled_post()
 *                             → create_scheduled_post_with_media()
 *                             → _snap_to_quarter_hour_ms()
 *                             → _extract_graphql_share_urn()
 *          linkitin/media.py  → upload_image()
 *          linkitin/endpoints.py → GRAPHQL, RESHARE_QUERY_ID
 *
 * PURPOSE:
 *   Schedules a LinkedIn post for a future time using the GraphQL
 *   voyagerContentcreationDashShares endpoint — the same endpoint
 *   LinkedIn's web composer uses when you click "Schedule".
 *
 *   Key details (all match poster.py exactly):
 *   - Timestamp is rounded UP to the next 15-minute boundary
 *   - Uses intendedShareLifeCycleState: "SCHEDULED"
 *   - Uses visibilityType "ANYONE" (PUBLIC) or "CONNECTIONS_ONLY"
 *
 * HOW TO USE:
 *   1. Open any LinkedIn page in your browser (logged in).
 *   2. Open DevTools Console (F12).
 *   3. Configure the settings below.
 *   4. Paste and run.
 *   5. Verify/cancel at: https://www.linkedin.com/share/management
 *
 * RETURNS:
 *   Scheduled post URN stored in window._liLastScheduledUrn
 */

// ─── Config ───────────────────────────────────────────────────────────────────
const SCHEDULED_TEXT     = "Scheduled post — hello future! (browser script test)";
const SCHEDULE_IN_HOURS  = 2;       // Schedule this many hours from now
const VISIBILITY         = "PUBLIC"; // "PUBLIC" or "CONNECTIONS"
const INCLUDE_IMAGE      = false;   // Set true to also schedule with an image
const AUTO_DELETE        = false;   // Not available for scheduled posts via API

// ─── Endpoints ────────────────────────────────────────────────────────────────
const GRAPHQL_URL          = "https://www.linkedin.com/voyager/api/graphql";
const RESHARE_QUERY_ID     = "voyagerContentcreationDashShares.279996efa5064c01775d5aff003d9377";
const MEDIA_UPLOAD_URL     = "https://www.linkedin.com/voyager/api/voyagerMediaUploadMetadata";

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
  return fetch(url, { method: "POST", headers: buildHeaders(), credentials: "include", body: JSON.stringify(body) });
}

// ─── _snap_to_quarter_hour_ms (mirrors poster._snap_to_quarter_hour_ms) ───────

/**
 * Round a Date UP to the next 15-minute boundary, return epoch ms as string.
 * LinkedIn's scheduling UI only allows 15-minute slots.
 * Mirrors: poster._snap_to_quarter_hour_ms(dt)
 *
 * Python: math.ceil(epoch / 900) * 900
 * JS equivalent: Math.ceil(epochSec / 900) * 900
 */
function snapToQuarterHourMs(date) {
  const epochSec = date.getTime() / 1000;
  const rounded = Math.ceil(epochSec / 900) * 900;
  return String(Math.round(rounded * 1000));
}

// ─── GraphQL share URN extraction (mirrors poster._extract_graphql_share_urn) ──

/**
 * Extract share URN from a GraphQL createContentcreationDashShares response.
 * mirrors: poster._extract_graphql_share_urn(data)
 */
function extractGraphqlShareUrn(data) {
  let inner = data.data || {};
  if (typeof inner === "object") inner = inner.data || inner;
  const result = inner.createContentcreationDashShares;
  if (result && typeof result === "object") {
    return result.resourceKey || result.shareUrn || result["*entity"] || result.entity || "";
  }
  return "";
}

/** Also tries direct urn fields — mirrors poster._extract_post_urn() */
function extractPostUrn(data) {
  const inner = (data.data && typeof data.data === "object") ? data.data : {};
  for (const src of [data, inner, data.value || {}]) {
    if (src.urn) return src.urn;
  }
  const bodyStr = JSON.stringify(data);
  const m = bodyStr.match(/"urn:li:(share|ugcPost|normShare):[^"]+"/);
  if (m) return m[0].replace(/"/g, "");
  return "";
}

// ─── create_scheduled_post (mirrors poster.create_scheduled_post()) ───────────

/**
 * Create a text post scheduled for a future time.
 * Mirrors: poster.create_scheduled_post(session, text, scheduled_at, visibility)
 *
 * Uses GraphQL endpoint with queryId=RESHARE_QUERY_ID and
 * intendedShareLifeCycleState: "SCHEDULED".
 */
async function createScheduledPost(text, scheduledAt, visibility = "PUBLIC") {
  if (!(scheduledAt instanceof Date) || isNaN(scheduledAt)) {
    throw new Error("scheduledAt must be a valid Date object");
  }
  if (scheduledAt <= new Date()) {
    throw new Error("scheduledAt must be in the future");
  }

  const url = `${GRAPHQL_URL}?action=execute&queryId=${RESHARE_QUERY_ID}`;
  const visibilityType = visibility === "PUBLIC" ? "ANYONE" : "CONNECTIONS_ONLY";
  const scheduledAtMs = snapToQuarterHourMs(scheduledAt);

  console.log(`  Scheduling for: ${new Date(parseInt(scheduledAtMs)).toISOString()}`);
  console.log(`  Epoch ms: ${scheduledAtMs}`);

  // Exact payload structure from poster.py create_scheduled_post()
  const payload = {
    variables: {
      post: {
        allowedCommentersScope: "ALL",
        commentary: {
          text: text,
          attributesV2: [],
        },
        intendedShareLifeCycleState: "SCHEDULED",
        origin: "FEED",
        scheduledAt: scheduledAtMs,
        visibilityDataUnion: {
          visibilityType: visibilityType,
        },
      },
    },
    queryId: RESHARE_QUERY_ID,
    includeWebMetadata: true,
  };

  const resp = await liPost(url, payload);
  if (resp.status === 429) throw new Error("Rate limited by LinkedIn");
  if (resp.status === 403) throw new Error("Forbidden — cookies may be expired");
  if (resp.status !== 200 && resp.status !== 201) {
    const body = await resp.text();
    throw new Error(`Failed to create scheduled post: HTTP ${resp.status} — ${body.substring(0, 200)}`);
  }

  const data = await resp.json();
  let urn = extractGraphqlShareUrn(data);
  if (!urn) urn = extractPostUrn(data);
  if (!urn) throw new Error("Scheduled post created but no URN returned");
  return urn;
}

// ─── create_scheduled_post_with_media (mirrors poster.create_scheduled_post_with_media) ──

/**
 * Create a post with an attached image, scheduled for a future time.
 * Mirrors: poster.create_scheduled_post_with_media(session, text, media_urn, scheduled_at, visibility)
 */
async function createScheduledPostWithMedia(text, mediaUrn, scheduledAt, visibility = "PUBLIC") {
  if (!(scheduledAt instanceof Date) || isNaN(scheduledAt)) throw new Error("scheduledAt must be a valid Date");
  if (scheduledAt <= new Date()) throw new Error("scheduledAt must be in the future");

  const url = `${GRAPHQL_URL}?action=execute&queryId=${RESHARE_QUERY_ID}`;
  const visibilityType = visibility === "PUBLIC" ? "ANYONE" : "CONNECTIONS_ONLY";
  const scheduledAtMs = snapToQuarterHourMs(scheduledAt);

  const payload = {
    variables: {
      post: {
        allowedCommentersScope: "ALL",
        commentary: {
          text: text,
          attributesV2: [],
        },
        intendedShareLifeCycleState: "SCHEDULED",
        origin: "FEED",
        scheduledAt: scheduledAtMs,
        visibilityDataUnion: { visibilityType: visibilityType },
        media: {
          category: "IMAGE",
          mediaUrn: mediaUrn,
          tapTargets: [],
          altText: "",
        },
      },
    },
    queryId: RESHARE_QUERY_ID,
    includeWebMetadata: true,
  };

  const resp = await liPost(url, payload);
  if (resp.status === 429) throw new Error("Rate limited by LinkedIn");
  if (resp.status === 403) throw new Error("Forbidden — cookies may be expired");
  if (resp.status !== 200 && resp.status !== 201) {
    const body = await resp.text();
    throw new Error(`Failed to create scheduled post with media: HTTP ${resp.status} — ${body.substring(0, 200)}`);
  }

  const data = await resp.json();
  let urn = extractGraphqlShareUrn(data);
  if (!urn) urn = extractPostUrn(data);
  if (!urn) throw new Error("Scheduled image post created but no URN returned");
  return urn;
}

// ─── Image upload (same as 06_create_post_with_image.js) ────────────────────
async function makeTestPng() {
  const width = 100, height = 100;
  const rawRow = new Uint8Array(1 + width * 3);
  rawRow[0] = 0;
  for (let x = 0; x < width; x++) { rawRow[1+x*3]=255; rawRow[2+x*3]=0; rawRow[3+x*3]=0; }
  const rawData = new Uint8Array(height * rawRow.length);
  for (let y = 0; y < height; y++) rawData.set(rawRow, y * rawRow.length);
  // Simple uncompressed zlib
  function deflateStore(d) {
    const header = new Uint8Array([0x78, 0x9C]);
    const block = new Uint8Array(5 + d.length);
    block[0]=0x01; block[1]=d.length&0xFF; block[2]=(d.length>>8)&0xFF; block[3]=~block[1]&0xFF; block[4]=~block[2]&0xFF;
    block.set(d, 5);
    let s1=1,s2=0; for(const b of d){s1=(s1+b)%65521;s2=(s2+s1)%65521;}
    const av = (s2<<16)|s1;
    const adler = new Uint8Array([av>>24&0xFF,av>>16&0xFF,av>>8&0xFF,av&0xFF]);
    const out = new Uint8Array(header.length+block.length+adler.length);
    out.set(header); out.set(block,header.length); out.set(adler,header.length+block.length);
    return out;
  }
  const idat = deflateStore(rawData);
  function u32(n){return new Uint8Array([(n>>24)&0xFF,(n>>16)&0xFF,(n>>8)&0xFF,n&0xFF]);}
  function crc(buf){let c=0xFFFFFFFF,t=crc._t||(()=>{const t=new Uint32Array(256);for(let i=0;i<256;i++){let x=i;for(let k=0;k<8;k++)x=(x&1)?(0xEDB88320^(x>>>1)):(x>>>1);t[i]=x;}crc._t=t;return t;})();for(const b of buf)c=(c>>>8)^t[(c^b)&0xFF];return(c^0xFFFFFFFF)>>>0;}
  function chunk(t,d){const tb=new TextEncoder().encode(t),cd=new Uint8Array(tb.length+d.length);cd.set(tb);cd.set(d,tb.length);const cv=u32(crc(cd)),len=u32(d.length),out=new Uint8Array(4+cd.length+4);out.set(len);out.set(cd,4);out.set(cv,4+cd.length);return out;}
  const sig=new Uint8Array([137,80,78,71,13,10,26,10]);
  const ihdr=chunk("IHDR",new Uint8Array([...u32(width),...u32(height),8,2,0,0,0]));
  const idatC=chunk("IDAT",idat), iend=chunk("IEND",new Uint8Array(0));
  const png=new Uint8Array(sig.length+ihdr.length+idatC.length+iend.length);
  let p=0; png.set(sig,p);p+=sig.length; png.set(ihdr,p);p+=ihdr.length; png.set(idatC,p);p+=idatC.length; png.set(iend,p);
  return png;
}

async function uploadImage(imageData, filename) {
  const regResp = await liPost(`${MEDIA_UPLOAD_URL}?action=upload`, { mediaUploadType: "IMAGE_SHARING", fileSize: imageData.byteLength, filename });
  if (!regResp.ok) { const t = await regResp.text(); throw new Error(`Upload registration failed: HTTP ${regResp.status} — ${t.substring(0,200)}`); }
  const regData = await regResp.json();
  const d = (regData.data && typeof regData.data === "object") ? regData.data : regData;
  const value = d.value || d;
  const uploadUrl = (value.uploadMechanism?.["com.linkedin.voyager.common.MediaUploadHttpRequest"]?.uploadUrl) || value.uploadUrl || value.singleUploadUrl;
  const mediaUrn = value.urn || value.mediaUrn || value.mediaArtifact;
  if (!uploadUrl || !mediaUrn) throw new Error("Missing uploadUrl or mediaUrn from registration");
  await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": "image/png" }, body: imageData });
  return mediaUrn;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  console.log("\n=== Create Scheduled Post ===");
  try {
    // mirrors: datetime.now(timezone.utc) + timedelta(hours=N)
    const rawTime = new Date(Date.now() + SCHEDULE_IN_HOURS * 60 * 60 * 1000);
    const scheduledAt = new Date(parseInt(snapToQuarterHourMs(rawTime)));

    console.log(`  Text: "${SCHEDULED_TEXT.substring(0, 80)}..."`);
    console.log(`  Visibility: ${VISIBILITY}`);
    console.log(`  Requested time: ${rawTime.toISOString()}`);
    console.log(`  Rounded to 15-min slot: ${scheduledAt.toISOString()}`);

    let urn;

    if (INCLUDE_IMAGE) {
      console.log("\n  Uploading test image first...");
      const imageData = await makeTestPng();
      const mediaUrn = await uploadImage(imageData, "test_red_square.png");
      console.log(`  Media URN: ${mediaUrn}`);
      urn = await createScheduledPostWithMedia(SCHEDULED_TEXT, mediaUrn, scheduledAt, VISIBILITY);
    } else {
      urn = await createScheduledPost(SCHEDULED_TEXT, scheduledAt, VISIBILITY);
    }

    console.log(`\n  ✅ Scheduled post created! URN: ${urn}`);
    console.log(`  📅 Will publish at: ${scheduledAt.toISOString()}`);
    console.log(`  🔗 Manage at: https://www.linkedin.com/share/management`);
    window._liLastScheduledUrn = urn;
  } catch (e) {
    console.error("❌ Error:", e.message);
  }
})();
