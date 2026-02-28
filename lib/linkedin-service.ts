/**
 * LinkedIn API Service for server-side posting
 * Uses LinkedIn OAuth2 with UGC Posts API
 */

// Lazy initialization — avoid top-level throws that crash the app at import time (#17)
export function isLinkedInConfigured(): boolean {
  return !!(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET && process.env.LINKEDIN_REDIRECT_URI);
}

function getLinkedInConfig() {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI;
  if (!clientId) throw new Error('CRITICAL: LINKEDIN_CLIENT_ID environment variable is not set');
  if (!clientSecret) throw new Error('CRITICAL: LINKEDIN_CLIENT_SECRET environment variable is not set');
  if (!redirectUri) throw new Error('CRITICAL: LINKEDIN_REDIRECT_URI environment variable is not set');
  return { clientId, clientSecret, redirectUri };
}

export interface LinkedInTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

export interface LinkedInProfile {
  sub: string; // LinkedIn member ID
  name: string;
  email?: string;
  picture?: string;
}

/**
 * Generate LinkedIn OAuth authorization URL
 */
export function getLinkedInAuthUrl(state: string): string {
  const { clientId, redirectUri } = getLinkedInConfig();
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope: 'openid profile email w_member_social',
  });
  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code: string): Promise<LinkedInTokenResponse> {
  const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: getLinkedInConfig().clientId,
      client_secret: getLinkedInConfig().clientSecret,
      redirect_uri: getLinkedInConfig().redirectUri,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`LinkedIn token exchange failed: ${error}`);
  }

  return res.json();
}

/**
 * Fetch LinkedIn user profile using OpenID Connect
 */
export async function getLinkedInProfile(accessToken: string): Promise<LinkedInProfile> {
  const res = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`LinkedIn profile fetch failed: ${res.status}`);
  }

  return res.json();
}

/**
 * Post text-only content to LinkedIn
 */
export async function postToLinkedIn(
  accessToken: string,
  linkedinId: string,
  content: string
): Promise<{ id: string }> {
  const body = {
    author: `urn:li:person:${linkedinId}`,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text: content },
        shareMediaCategory: 'NONE',
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  };

  const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`LinkedIn post failed (${res.status}): ${error}`);
  }

  return res.json();
}

/**
 * Post content with an image to LinkedIn (3-step process)
 */
export async function postWithImageToLinkedIn(
  accessToken: string,
  linkedinId: string,
  content: string,
  imageUrl: string
): Promise<{ id: string }> {
  // Step 1: Register image upload
  const registerRes = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      registerUploadRequest: {
        recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
        owner: `urn:li:person:${linkedinId}`,
        serviceRelationships: [{
          relationshipType: 'OWNER',
          identifier: 'urn:li:userGeneratedContent',
        }],
      },
    }),
  });

  if (!registerRes.ok) {
    throw new Error(`LinkedIn image register failed: ${registerRes.status}`);
  }

  const registerData = await registerRes.json();
  const uploadUrl = registerData.value.uploadMechanism[
    'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'
  ].uploadUrl;
  const assetId = registerData.value.asset;

  // Step 2: Download image and upload to LinkedIn
  const imageRes = await fetch(imageUrl);
  const imageBuffer = await imageRes.arrayBuffer();
  const contentType = imageRes.headers.get('content-type') || 'image/jpeg';

  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': contentType,
    },
    body: Buffer.from(imageBuffer),
  });

  if (!uploadRes.ok) {
    throw new Error(`LinkedIn image upload failed (${uploadRes.status}): ${await uploadRes.text()}`);
  }

  // Step 3: Create post with image
  const postBody = {
    author: `urn:li:person:${linkedinId}`,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text: content },
        shareMediaCategory: 'IMAGE',
        media: [{
          status: 'READY',
          description: { text: '' },
          media: assetId,
          title: { text: '' },
        }],
      },
    },
    visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
  };

  const postRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(postBody),
  });

  if (!postRes.ok) {
    const error = await postRes.text();
    throw new Error(`LinkedIn image post failed (${postRes.status}): ${error}`);
  }

  return postRes.json();
}

/**
 * Post content with a video to LinkedIn (3-step process)
 */
export async function postWithVideoToLinkedIn(
  accessToken: string,
  linkedinId: string,
  content: string,
  videoUrl: string
): Promise<{ id: string }> {
  // Step 1: Register video upload
  const registerRes = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      registerUploadRequest: {
        recipes: ['urn:li:digitalmediaRecipe:feedshare-video'],
        owner: `urn:li:person:${linkedinId}`,
        serviceRelationships: [{
          relationshipType: 'OWNER',
          identifier: 'urn:li:userGeneratedContent',
        }],
      },
    }),
  });

  if (!registerRes.ok) {
    throw new Error(`LinkedIn video register failed: ${registerRes.status}`);
  }

  const registerData = await registerRes.json();
  const uploadUrl = registerData.value.uploadMechanism[
    'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'
  ].uploadUrl;
  const assetId = registerData.value.asset;

  // Step 2: Download video and upload to LinkedIn
  const videoRes = await fetch(videoUrl);
  const videoBuffer = await videoRes.arrayBuffer();

  // Detect content type from URL extension (#19)
  const videoExtension = videoUrl.split('.').pop()?.toLowerCase().split('?')[0] || 'mp4';
  const videoContentTypeMap: Record<string, string> = {
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'mov': 'video/quicktime',
    'avi': 'video/x-msvideo',
  };
  const videoContentType = videoContentTypeMap[videoExtension] || videoRes.headers.get('content-type') || 'video/mp4';

  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': videoContentType,
    },
    body: Buffer.from(videoBuffer),
  });

  if (!uploadRes.ok) {
    throw new Error(`LinkedIn video upload failed (${uploadRes.status}): ${await uploadRes.text()}`);
  }

  // Step 3: Create post with video
  const postBody = {
    author: `urn:li:person:${linkedinId}`,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text: content },
        shareMediaCategory: 'VIDEO',
        media: [{
          status: 'READY',
          description: { text: '' },
          media: assetId,
          title: { text: '' },
        }],
      },
    },
    visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
  };

  const postRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(postBody),
  });

  if (!postRes.ok) {
    const error = await postRes.text();
    throw new Error(`LinkedIn video post failed (${postRes.status}): ${error}`);
  }

  return postRes.json();
}
