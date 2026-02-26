/**
 * LinkedIn Browser Script: Upload Image + Create Image Post
 * ===========================================================
 * Mirrors: linkitin/media.py → upload_image()
 *                            → _extract_upload_url()
 *                            → _extract_media_urn()
 *                            → _guess_content_type()
 *          linkitin/poster.py → create_post_with_media()
 *          linkitin/client.py → create_post_with_image()
 *
 * PURPOSE:
 *   Two-step image post workflow:
 *     1. Register upload with voyagerMediaUploadMetadata → get upload URL + media URN
 *     2. PUT binary image to upload URL
 *     3. Create post with media URN attached
 *
 * HOW TO USE:
 *   Option A — Use a URL image:
 *     Set IMAGE_URL below and run.
 *   Option B — Use a File input:
 *     Set USE_FILE_INPUT = true and run. A file picker will appear.
 *   Option C — Generate a test PNG (no external assets needed):
 *     Set USE_TEST_PNG = true and run.
 *
 * RETURNS:
 *   Created post URN stored in window._liLastPostUrn
 */

// ─── Config ───────────────────────────────────────────────────────────────────
const POST_TEXT     = "Check out this image! (browser script test)";
const VISIBILITY    = "PUBLIC";      // "PUBLIC" or "CONNECTIONS"
const IMAGE_URL     = "";            // Optional: URL of an image to fetch and upload
const USE_TEST_PNG  = true;          // Generate a 100x100 red test PNG (no file needed)
const USE_FILE_INPUT = false;        // Show a file picker (overrides IMAGE_URL and USE_TEST_PNG)
const AUTO_DELETE   = false;         // Delete after creating (for testing)

// ─── Endpoints ────────────────────────────────────────────────────────────────
const CREATE_POST_URL         = "https://www.linkedin.com/voyager/api/contentcreation/normShares";
const MEDIA_UPLOAD_METADATA_URL = "https://www.linkedin.com/voyager/api/voyagerMediaUploadMetadata";

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
async function liDelete(url) {
  return fetch(url, { method: "DELETE", headers: buildHeaders(), credentials: "include" });
}

// ─── Test PNG generator (mirrors scripts/test_post.py _make_test_png) ─────────

/**
 * Generates a minimal 100×100 red PNG in memory.
 * Mirrors: test_post.py _make_test_png() — identical algorithm.
 */
function makeTestPng() {
  const width = 100, height = 100;
  // Each row: filter byte (0) + 3 bytes (R=255, G=0, B=0) per pixel
  const rawRow = new Uint8Array(1 + width * 3);
  rawRow[0] = 0; // filter byte
  for (let x = 0; x < width; x++) {
    rawRow[1 + x * 3] = 255; // R
    rawRow[2 + x * 3] = 0;   // G
    rawRow[3 + x * 3] = 0;   // B
  }
  const rawData = new Uint8Array(height * rawRow.length);
  for (let y = 0; y < height; y++) rawData.set(rawRow, y * rawRow.length);

  // Deflate-compress using CompressionStream (modern browsers)
  return compressData(rawData).then(compressed => {
    return buildPng(width, height, compressed);
  });
}

async function compressData(data) {
  if (typeof CompressionStream !== "undefined") {
    const cs = new CompressionStream("deflate");
    const writer = cs.writable.getWriter();
    writer.write(data);
    writer.close();
    const chunks = [];
    const reader = cs.readable.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    const totalLength = chunks.reduce((s, c) => s + c.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.length; }
    return result;
  }
  // Fallback: use a simple uncompressed DEFLATE block (zlib store mode)
  return deflateStore(data);
}

function deflateStore(data) {
  // zlib header (CM=8, CINFO=7 → 0x78, FLEVEL=1 → 0x9C)
  const ZLIB_HEADER = new Uint8Array([0x78, 0x9C]);
  // DEFLATE stored block (BFINAL=1, BTYPE=00)
  const blocks = [];
  let offset = 0;
  while (offset < data.length) {
    const blockData = data.subarray(offset, offset + 65535);
    const isLast = offset + blockData.length >= data.length;
    const blockHeader = new Uint8Array(5);
    blockHeader[0] = isLast ? 0x01 : 0x00;
    blockHeader[1] = blockData.length & 0xFF;
    blockHeader[2] = (blockData.length >> 8) & 0xFF;
    blockHeader[3] = ~blockHeader[1] & 0xFF;
    blockHeader[4] = ~blockHeader[2] & 0xFF;
    blocks.push(blockHeader, blockData);
    offset += blockData.length;
  }
  // Adler-32 checksum
  let s1 = 1, s2 = 0;
  for (const b of data) { s1 = (s1 + b) % 65521; s2 = (s2 + s1) % 65521; }
  const adler = new Uint8Array(4);
  const adlerVal = (s2 << 16) | s1;
  adler[0] = (adlerVal >> 24) & 0xFF; adler[1] = (adlerVal >> 16) & 0xFF;
  adler[2] = (adlerVal >> 8) & 0xFF;  adler[3] = adlerVal & 0xFF;

  const totalLen = ZLIB_HEADER.length + blocks.reduce((s, b) => s + b.length, 0) + adler.length;
  const result = new Uint8Array(totalLen);
  let pos = 0;
  result.set(ZLIB_HEADER, pos); pos += ZLIB_HEADER.length;
  for (const b of blocks) { result.set(b, pos); pos += b.length; }
  result.set(adler, pos);
  return result;
}

function buildPng(width, height, idat) {
  function uint32BE(n) {
    return new Uint8Array([(n>>24)&0xFF,(n>>16)&0xFF,(n>>8)&0xFF,n&0xFF]);
  }
  function crc32(buf) {
    let crc = 0xFFFFFFFF;
    const table = crc32Table();
    for (const b of buf) crc = (crc >>> 8) ^ table[(crc ^ b) & 0xFF];
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }
  function crc32Table() {
    if (crc32Table._t) return crc32Table._t;
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[i] = c;
    }
    crc32Table._t = t;
    return t;
  }
  function chunk(type, data) {
    const typeBytes = new TextEncoder().encode(type);
    const chunkData = new Uint8Array(typeBytes.length + data.length);
    chunkData.set(typeBytes); chunkData.set(data, typeBytes.length);
    const lenBytes = uint32BE(data.length);
    const crcVal = uint32BE(crc32(chunkData));
    const out = new Uint8Array(4 + chunkData.length + 4);
    out.set(lenBytes); out.set(chunkData, 4); out.set(crcVal, 4 + chunkData.length);
    return out;
  }

  const sig = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  // IHDR: width(4) height(4) bitDepth(1) colorType(2=RGB)(1) compression(1) filter(1) interlace(1)
  const ihdrData = new Uint8Array([
    ...uint32BE(width), ...uint32BE(height),
    8, 2, 0, 0, 0
  ]);
  const ihdr = chunk("IHDR", ihdrData);
  const idatChunk = chunk("IDAT", idat);
  const iend = chunk("IEND", new Uint8Array(0));

  const total = sig.length + ihdr.length + idatChunk.length + iend.length;
  const png = new Uint8Array(total);
  let p = 0;
  png.set(sig, p); p += sig.length;
  png.set(ihdr, p); p += ihdr.length;
  png.set(idatChunk, p); p += idatChunk.length;
  png.set(iend, p);
  return png;
}

// ─── Content type detection (mirrors media._guess_content_type) ────────────────
function guessContentType(filename) {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".webp")) return "image/webp";
  return "application/octet-stream";
}

// ─── URL extraction from upload metadata (mirrors media._extract_upload_url) ──
function extractUploadUrl(data) {
  const value = data.value || data;
  const um = value.uploadMechanism;
  if (um && typeof um === "object") {
    const http = um["com.linkedin.voyager.common.MediaUploadHttpRequest"];
    if (http && http.uploadUrl) return http.uploadUrl;
    const single = um.singleUpload;
    if (single && single.uploadUrl) return single.uploadUrl;
  }
  return value.uploadUrl || value.singleUploadUrl || "";
}

// ─── Media URN extraction (mirrors media._extract_media_urn) ──────────────────
function extractMediaUrn(data) {
  const value = data.value || data;
  return value.urn || value.mediaUrn || value.mediaArtifact || "";
}

// ─── Post URN extraction (mirrors poster._extract_post_urn) ───────────────────
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

// ─── upload_image (mirrors media.upload_image()) ──────────────────────────────

/**
 * Two-step image upload:
 * Step 1 — POST to voyagerMediaUploadMetadata?action=upload to register
 * Step 2 — PUT binary data to the returned upload URL
 * Mirrors: media.upload_image(session, image_data, filename)
 */
async function uploadImage(imageData, filename) {
  console.log(`  [upload] Registering upload for "${filename}" (${imageData.byteLength} bytes)...`);

  // Step 1: Register upload
  const registerPayload = {
    mediaUploadType: "IMAGE_SHARING",
    fileSize: imageData.byteLength,
    filename: filename,
  };

  const regResp = await liPost(`${MEDIA_UPLOAD_METADATA_URL}?action=upload`, registerPayload);
  if (regResp.status === 429) throw new Error("Rate limited by LinkedIn");
  if (regResp.status === 403) throw new Error("Forbidden — cookies may be expired");
  if (regResp.status !== 200 && regResp.status !== 201) {
    const body = await regResp.text();
    throw new Error(`Failed to register image upload: HTTP ${regResp.status} — ${body.substring(0, 200)}`);
  }

  const regData = await regResp.json();
  const inner = (regData.data && typeof regData.data === "object") ? regData.data : null;
  const uploadData = inner || regData;

  const uploadUrl = extractUploadUrl(uploadData);
  const mediaUrn = extractMediaUrn(uploadData);

  if (!uploadUrl) throw new Error("Upload registration succeeded but no upload URL returned");
  if (!mediaUrn) throw new Error("Upload registration succeeded but no media URN returned");

  console.log(`  [upload] Upload URL obtained. Media URN: ${mediaUrn}`);

  // Step 2: PUT binary image data to upload URL
  // NOTE: The upload URL is pre-authenticated (token in URL) — no session cookies needed
  const contentType = guessContentType(filename);
  const uploadResp = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: imageData,
  });

  if (uploadResp.status === 429) throw new Error("Rate limited during image upload");
  if (uploadResp.status !== 200 && uploadResp.status !== 201) {
    throw new Error(`Failed to upload image data: HTTP ${uploadResp.status}`);
  }

  console.log(`  [upload] ✅ Image uploaded successfully. Media URN: ${mediaUrn}`);
  return mediaUrn;
}

// ─── create_post_with_media (mirrors poster.create_post_with_media()) ─────────

/**
 * Create a LinkedIn post with an attached image.
 * Mirrors: poster.create_post_with_media(session, text, media_urn, visibility)
 */
async function createPostWithMedia(text, mediaUrn, visibility = "PUBLIC") {
  console.log(`  [post] Creating post with image...`);

  const payload = {
    visibleToConnectionsOnly: visibility !== "PUBLIC",
    externalAudienceProviderUnion: { externalAudienceProvider: "LINKEDIN" },
    commentaryV2: { text, attributes: [] },
    origin: "FEED",
    allowedCommentersScope: "ALL",
    postState: "PUBLISHED",
    mediaCategory: "IMAGE",
    media: [{ category: "IMAGE", mediaUrn: mediaUrn }],
  };

  const resp = await liPost(CREATE_POST_URL, payload);
  if (resp.status === 429) throw new Error("Rate limited by LinkedIn");
  if (resp.status === 403) throw new Error("Forbidden — cookies may be expired");
  if (resp.status !== 200 && resp.status !== 201) {
    const body = await resp.text();
    throw new Error(`Failed to create post with media: HTTP ${resp.status} — ${body.substring(0, 200)}`);
  }

  const data = await resp.json();
  const urn = extractPostUrn(data);
  if (!urn) throw new Error("Post with media created but no URN returned");
  return urn;
}

// ─── Delete post ──────────────────────────────────────────────────────────────
async function deletePost(postUrn) {
  const url = `${CREATE_POST_URL}/${encodeURIComponent(postUrn)}`;
  const resp = await liDelete(url);
  if (resp.status !== 200 && resp.status !== 204) throw new Error(`Delete failed: HTTP ${resp.status}`);
  console.log(`  ✅ Post deleted: ${postUrn}`);
}

// ─── File picker helper ───────────────────────────────────────────────────────
function pickFile() {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.display = "none";
    document.body.appendChild(input);
    input.onchange = () => {
      const file = input.files[0];
      if (!file) { resolve(null); return; }
      const reader = new FileReader();
      reader.onload = e => {
        resolve({ data: new Uint8Array(e.target.result), filename: file.name });
        document.body.removeChild(input);
      };
      reader.readAsArrayBuffer(file);
    };
    input.click();
  });
}

// ─── Fetch image from URL ─────────────────────────────────────────────────────
async function fetchImageFromUrl(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Failed to fetch image from URL: HTTP ${resp.status}`);
  const buf = await resp.arrayBuffer();
  const filename = url.split("/").pop().split("?")[0] || "image.jpg";
  return { data: new Uint8Array(buf), filename };
}

// ─── Main: create_post_with_image() (mirrors client.create_post_with_image()) ──
(async () => {
  console.log("\n=== Create Image Post ===");
  try {
    let imageData, filename;

    if (USE_FILE_INPUT) {
      console.log("  Opening file picker...");
      const result = await pickFile();
      if (!result) { console.log("  No file selected."); return; }
      imageData = result.data;
      filename = result.filename;
    } else if (IMAGE_URL) {
      console.log(`  Fetching image from URL: ${IMAGE_URL}`);
      const result = await fetchImageFromUrl(IMAGE_URL);
      imageData = result.data;
      filename = result.filename;
    } else if (USE_TEST_PNG) {
      console.log("  Generating test 100×100 red PNG...");
      imageData = await makeTestPng();
      filename = "test_red_square.png";
      console.log(`  Generated PNG: ${imageData.byteLength} bytes`);
    } else {
      throw new Error("No image source configured — set IMAGE_URL, USE_FILE_INPUT, or USE_TEST_PNG");
    }

    // Step 1: Upload image (mirrors client.upload_image())
    const mediaUrn = await uploadImage(imageData, filename);

    // Step 2: Create post with image (mirrors client.create_post_with_image())
    const postUrn = await createPostWithMedia(POST_TEXT, mediaUrn, VISIBILITY);
    console.log(`\n  ✅ Image post created! URN: ${postUrn}`);
    window._liLastPostUrn = postUrn;

    if (AUTO_DELETE && postUrn) {
      console.log("  AUTO_DELETE enabled — deleting in 3s...");
      await new Promise(r => setTimeout(r, 3000));
      await deletePost(postUrn);
    } else {
      console.log(`\n  ℹ️  To delete: deletePost("${postUrn}")`);
    }
  } catch (e) {
    console.error("❌ Error:", e.message);
  }
})();
