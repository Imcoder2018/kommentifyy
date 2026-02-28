/**
 * LinkedIn Voyager API Data Fetcher — Comprehensive Edition v2
 * =============================================================
 * Extracts ALL available user profile data, posts, connections,
 * invitations, and engagement metrics via LinkedIn's internal Voyager API.
 *
 * v2 FIXES:
 *  - Experience: entries without `title` are now filtered out (were showing as duplicates)
 *  - Post text: exhaustive search of ALL included items for commentary text
 *  - Invitations: fixed endpoint and parsing
 *  - Engagement: improved social detail matching
 */

const VOYAGER_BASE = 'https://www.linkedin.com/voyager/api';

// ─── Cookie Caching (for Voyager) ───────────────────────────────────────
async function getCachedLinkedInCookies() {
    try {
        const cached = await chrome.storage.local.get('linkedInCookies');
        if (cached.linkedInCookies) {
            const { cookies, timestamp } = cached.linkedInCookies;
            const age = Date.now() - timestamp;
            // Cache valid for 6 hours
            if (age < 6 * 60 * 60 * 1000 && cookies && cookies.JSESSIONID) {
                console.log('[Voyager] Using cached cookies (age: ' + Math.round(age/1000/60) + 'min)');
                return cookies;
            }
        }
    } catch (e) {
        console.log('[Voyager] Cache read error:', e.message);
    }
    return null;
}

async function refreshLinkedInCookies() {
    console.log('[Voyager] Refreshing LinkedIn cookies...');
    try {
        const cookies = {};
        const names = ['JSESSIONID', 'li_at', 'bcookie', 'bscookie'];
        for (const name of names) {
            const cookie = await new Promise((resolve) => {
                chrome.cookies.get({ url: 'https://www.linkedin.com', name: name }, (c) => resolve(c));
            });
            if (cookie?.value) {
                cookies[name] = cookie.value;
            }
        }
        if (cookies.JSESSIONID || cookies.li_at) {
            await chrome.storage.local.set({
                linkedInCookies: { cookies, timestamp: Date.now() }
            });
            console.log('[Voyager] Cookies cached');
            return cookies;
        }
    } catch (e) {
        console.log('[Voyager] Cookie refresh error:', e.message);
    }
    return null;
}

async function getLinkedInCookiesWithCache() {
    let cookies = await getCachedLinkedInCookies();
    if (!cookies) {
        cookies = await refreshLinkedInCookies();
    }
    if (!cookies) {
        // Last resort - direct browser access
        cookies = {};
        const cookie = await new Promise((resolve) => {
            chrome.cookies.get({ url: 'https://www.linkedin.com', name: 'JSESSIONID' }, (c) => resolve(c));
        });
        if (cookie?.value) {
            cookies.JSESSIONID = cookie.value;
        }
    }
    return cookies;
}

// ─── Cookie Extraction ──────────────────────────────────────────────────
async function getLinkedInSessionCookie() {
    const cookies = await getLinkedInCookiesWithCache();
    if (!cookies?.JSESSIONID) {
        throw new Error('Not logged into LinkedIn — JSESSIONID cookie not found');
    }
    return cookies.JSESSIONID.replace(/"/g, '');
}

// ─── Helpers ─────────────────────────────────────────────────────────────
function buildHeaders(csrfToken) {
    return {
        'accept': 'application/vnd.linkedin.normalized+json+2.1',
        'csrf-token': csrfToken,
        'x-li-lang': 'en_US',
        'x-restli-protocol-version': '2.0.0',
    };
}

async function voyagerFetch(endpoint, csrfToken) {
    try {
        const url = endpoint.startsWith('http') ? endpoint : `${VOYAGER_BASE}/${endpoint}`;
        console.log(`[Voyager] Fetching: ${url}`);
        const res = await fetch(url, {
            headers: buildHeaders(csrfToken),
            credentials: 'include'
        });
        if (!res.ok) {
            console.warn(`[Voyager] ${endpoint} returned ${res.status} ${res.statusText}`);
            return null;
        }
        const json = await res.json();
        console.log(`[Voyager] ${endpoint} → ${json?.included?.length || 0} included items, data keys: ${json?.data ? Object.keys(json.data).join(',') : 'none'}`);
        return json;
    } catch (err) {
        console.warn(`[Voyager] ${endpoint} error:`, err.message);
        return null;
    }
}

/** Pick the largest profile picture URL from a VectorImage nested structure */
function pickBestPicture(pictureObj) {
    if (!pictureObj) return '';
    // Handle MiniProfile picture format: { rootUrl, artifacts }
    const rootUrl = pictureObj.rootUrl || '';
    const artifacts = pictureObj.artifacts || [];
    if (rootUrl && artifacts.length > 0) {
        const biggest = artifacts.reduce((a, b) => (b.width || 0) > (a.width || 0) ? b : a, artifacts[0]);
        return rootUrl + (biggest.fileIdentifyingUrlPathSegment || '');
    }
    // Handle dash profile picture format: { displayImageReference: { vectorImage } }
    const vecImg = pictureObj?.displayImageReference?.vectorImage;
    if (vecImg?.rootUrl && vecImg?.artifacts?.length) {
        const biggest = vecImg.artifacts.reduce((a, b) => (b.width || 0) > (a.width || 0) ? b : a, vecImg.artifacts[0]);
        return vecImg.rootUrl + (biggest.fileIdentifyingUrlPathSegment || '');
    }
    return '';
}

/** Parse a LinkedIn activity URN timestamp → ISO date string */
function activityUrnToDate(activityUrn) {
    try {
        const match = activityUrn.match(/urn:li:activity:(\d+)/);
        if (!match) return null;
        const id = BigInt(match[1]);
        const timestamp = Number(id >> 22n) + 1288834974657;
        return new Date(timestamp).toISOString();
    } catch { return null; }
}

/** Deep search an object for a text field */
function deepFindText(obj, maxDepth = 5) {
    if (!obj || maxDepth <= 0) return '';
    if (typeof obj === 'string') return obj;
    if (typeof obj !== 'object') return '';

    // Direct text fields
    if (obj.text && typeof obj.text === 'string' && obj.text.length > 10) return obj.text;
    if (obj.text?.text && typeof obj.text.text === 'string') return obj.text.text;

    // Recurse into known fields
    for (const key of ['commentary', 'commentaryText', 'header', 'annotation', 'content', 'value', 'resharedUpdate']) {
        if (obj[key]) {
            const found = deepFindText(obj[key], maxDepth - 1);
            if (found && found.length > 10) return found;
        }
    }
    return '';
}


// ═══════════════════════════════════════════════════════════════════════
// 1. GET /me — Basic profile info
// ═══════════════════════════════════════════════════════════════════════
async function fetchMyProfile(csrfToken) {
    const data = await voyagerFetch('me', csrfToken);
    if (!data) return null;

    const included = data?.included || [];
    const meData = data?.data || {};
    const mini = included.find(i => i?.$type?.includes('MiniProfile')) || included[0] || {};

    const urn = mini.dashEntityUrn || mini.entityUrn || '';
    const username = mini.publicIdentifier || '';
    const firstName = mini.firstName || '';
    const lastName = mini.lastName || '';
    const headline = mini.occupation || '';
    const profilePicture = pickBestPicture(mini.picture);
    const backgroundImage = pickBestPicture(mini.backgroundImage);
    const premiumSubscriber = meData.premiumSubscriber || false;
    const memberId = meData.plainId || null;

    return {
        firstName, lastName, urn, username, headline,
        profilePicture, backgroundImage,
        premiumSubscriber, memberId
    };
}


// ═══════════════════════════════════════════════════════════════════════
// 2. GET extended profile (TopCard) — followers, connections, summary
// ═══════════════════════════════════════════════════════════════════════
async function fetchExtendedProfile(csrfToken, username) {
    if (!username) return null;

    const endpoint = `identity/dash/profiles?q=memberIdentity&memberIdentity=${encodeURIComponent(username)}&decorationId=com.linkedin.voyager.dash.deco.identity.profile.TopCardSupplementary-85`;
    const data = await voyagerFetch(endpoint, csrfToken);
    if (!data) return null;

    const included = data?.included || [];

    // --- Follower count ---
    const followingState = included.find(i => i?.$type?.includes('FollowingState'));
    const followerCount = followingState?.followerCount ?? null;

    // --- Connection count ---
    let connectionCount = null;
    for (const item of included) {
        if (item?.paging?.total > 100 && item?.['*elements']?.some(e => e?.includes('fsd_connection'))) {
            connectionCount = item.paging.total;
            break;
        }
    }

    // --- Profile entity ---
    const profileEntity = included.find(i =>
        i?.entityUrn?.includes('fsd_profile:') &&
        (i.location || i.premiumFeatures || i['*connections'])
    );

    const location = profileEntity?.location?.countryCode || '';

    return {
        followerCount,
        connectionCount,
        location,
    };
}


// ═══════════════════════════════════════════════════════════════════════
// 3. Fetch ALL positions — FIXED: filter entries without title
// ═══════════════════════════════════════════════════════════════════════
async function fetchAllPositions(csrfToken, profileUrn) {
    if (!profileUrn) return [];

    const endpoint = `identity/dash/profilePositionGroups?q=viewee&profileUrn=${encodeURIComponent(profileUrn)}&decorationId=com.linkedin.voyager.dash.deco.identity.profile.FullProfilePositionGroup-27&count=50&start=0`;
    const data = await voyagerFetch(endpoint, csrfToken);
    if (!data) return null;

    const included = data?.included || [];

    // Collect company info for logo enrichment
    const companyMap = {};
    for (const item of included) {
        if (item?.$type?.includes('Company') && item?.entityUrn?.includes('fsd_company')) {
            companyMap[item.entityUrn] = {
                name: item.name || '',
                logo: item.logo?.vectorImage ? pickBestPicture({ rootUrl: item.logo.vectorImage.rootUrl, artifacts: item.logo.vectorImage.artifacts }) : '',
                url: item.url || '',
            };
        }
    }

    const positions = [];
    const seenKeys = new Set();

    for (const item of included) {
        // ONLY pick items with fsd_profilePosition URN
        if (!item?.entityUrn?.includes('fsd_profilePosition:')) continue;

        const title = item.title || item.multiLocaleTitle?.en_US || '';
        const companyName = item.companyName || item.multiLocaleCompanyName?.en_US || '';

        // FIX: Skip entries that have NO TITLE — these are PositionGroup-level duplicates.
        // An entry like "n8n" with no title is a company-level group, not a real position.
        if (!title) {
            console.log(`[Voyager] Skipping position without title: companyName="${companyName}" urn=${item.entityUrn}`);
            continue;
        }

        // Deduplication key: title + companyName + startYear
        const dedupKey = `${title}|${companyName}|${item.dateRange?.start?.year || ''}`;
        if (seenKeys.has(dedupKey)) {
            console.log(`[Voyager] Skipping duplicate position: "${title}" at "${companyName}"`);
            continue;
        }
        seenKeys.add(dedupKey);

        positions.push({
            companyName,
            title,
            dateRange: item.dateRange ? {
                startMonth: item.dateRange.start?.month,
                startYear: item.dateRange.start?.year,
                endMonth: item.dateRange.end?.month,
                endYear: item.dateRange.end?.year
            } : null,
            description: item.description || item.multiLocaleDescription?.en_US || '',
            location: item.locationName || item.multiLocaleLocationName?.en_US || '',
            companyUrn: item.companyUrn || null,
            companyLogo: item.companyUrn ? (companyMap[item.companyUrn]?.logo || '') : '',
        });
    }

    console.log(`[Voyager] Fetched ${positions.length} positions (deduplicated from ${included.filter(i => i?.entityUrn?.includes('fsd_profilePosition:')).length} raw)`);
    return positions;
}


// ═══════════════════════════════════════════════════════════════════════
// 4. Fetch ALL education entries
// ═══════════════════════════════════════════════════════════════════════
async function fetchAllEducation(csrfToken, profileUrn) {
    if (!profileUrn) return [];

    const endpoint = `identity/dash/profileEducations?q=viewee&profileUrn=${encodeURIComponent(profileUrn)}&decorationId=com.linkedin.voyager.dash.deco.identity.profile.FullProfileEducation-27&count=50&start=0`;
    const data = await voyagerFetch(endpoint, csrfToken);
    if (!data) return null;

    const included = data?.included || [];

    const educationList = [];
    for (const item of included) {
        if (!item?.entityUrn?.includes('fsd_profileEducation:')) continue;

        educationList.push({
            schoolName: item.schoolName || item.multiLocaleSchoolName?.en_US || '',
            fieldOfStudy: item.fieldOfStudy || item.multiLocaleFieldOfStudy?.en_US || '',
            degree: item.degreeName || item.multiLocaleDegreeName?.en_US || '',
            activities: item.activities || item.multiLocaleActivities?.en_US || '',
            grade: item.grade || '',
            description: item.description || '',
            dateRange: item.dateRange ? {
                startYear: item.dateRange.start?.year,
                endYear: item.dateRange.end?.year
            } : null,
        });
    }

    console.log(`[Voyager] Fetched ${educationList.length} education entries`);
    return educationList;
}


// ═══════════════════════════════════════════════════════════════════════
// 5. GET profile views (wvmpCards) — views count + viewer details
// ═══════════════════════════════════════════════════════════════════════
async function fetchProfileViews(csrfToken) {
    const data = await voyagerFetch('identity/wvmpCards', csrfToken);
    if (!data) return null;

    const included = data?.included || [];

    let totalViews = null;
    const viewerDetails = [];

    // Build a MiniProfile lookup
    const miniProfiles = {};
    for (const item of included) {
        if (item?.$type?.includes('MiniProfile') && item?.entityUrn) {
            miniProfiles[item.entityUrn] = {
                name: `${item.firstName || ''} ${item.lastName || ''}`.trim(),
                occupation: item.occupation || '',
                publicIdentifier: item.publicIdentifier || '',
                picture: pickBestPicture(item.picture),
            };
        }
    }

    for (const item of included) {
        // Summary card — total views
        if (item?.numViews !== undefined && !item?.entityUrn?.includes('profileViewer')) {
            totalViews = item.numViews;
        }

        // Any nested numViews in value
        if (item?.value?.numViews !== undefined) {
            totalViews = item.value.numViews;
        }

        // Individual viewer cards — look for viewedAt at any level
        const viewedAt = item?.viewedAt || item?.value?.viewedAt;
        const viewer = item?.viewer || item?.value?.viewer;

        if (viewedAt && viewer) {
            // Identified viewer
            if (viewer.profile) {
                const miniRef = viewer.profile?.['*miniProfile'] || viewer.profile?.miniProfile;
                const mp = miniRef ? miniProfiles[miniRef] : null;
                viewerDetails.push({
                    type: 'identified',
                    viewedAt,
                    name: mp?.name || 'LinkedIn Member',
                    occupation: mp?.occupation || '',
                    picture: mp?.picture || '',
                });
            }
            // Obfuscated viewer
            else if (viewer.obfuscationString) {
                viewerDetails.push({
                    type: 'obfuscated',
                    viewedAt,
                    description: viewer.obfuscationString || '',
                    companyName: viewer.occupation?.entityName || '',
                });
            }
        }
        // Anonymous viewer
        else if (viewedAt && (item?.numViewers || item?.value?.numViewers)) {
            viewerDetails.push({
                type: 'anonymous',
                viewedAt,
                count: item?.numViewers || item?.value?.numViewers || 1,
            });
        }
    }

    console.log(`[Voyager] Profile views: ${totalViews}, viewers: ${viewerDetails.length}`);
    return {
        totalViews,
        viewers: viewerDetails,
    };
}


// ═══════════════════════════════════════════════════════════════════════
// 6. GET recent posts — FIXED: exhaustive post text + engagement search
// ═══════════════════════════════════════════════════════════════════════
async function fetchRecentPosts(csrfToken, profileUrn) {
    if (!profileUrn) return [];

    const endpoint = `identity/profileUpdatesV2?count=20&includeLongTermHistory=true&moduleKey=member-shares%3Aphone&numComments=0&numLikes=0&profileUrn=${encodeURIComponent(profileUrn)}&q=memberShareFeed`;
    const data = await voyagerFetch(endpoint, csrfToken);
    if (!data) return [];

    const included = data?.included || [];

    // ──────────────────────────────────────────
    // DEBUG: Log ALL $type values and sample keys to understand structure
    // ──────────────────────────────────────────
    const typeSet = new Set();
    for (const item of included) {
        if (item?.$type) typeSet.add(item.$type);
    }
    console.log('[Voyager] Post response $types:', [...typeSet]);

    // Sample first 3 items to understand structure
    for (let i = 0; i < Math.min(3, included.length); i++) {
        const item = included[i];
        console.log(`[Voyager] included[${i}] type=${item?.$type} urn=${(item?.entityUrn || '').substring(0, 80)} keys=${Object.keys(item || {}).join(',')}`);
    }

    // ──────────────────────────────────────────
    // Build indexed maps from included array
    // ──────────────────────────────────────────

    // Map by entityUrn for fast lookup
    const byUrn = {};
    for (const item of included) {
        if (item?.entityUrn) {
            byUrn[item.entityUrn] = item;
        }
        if (item?.dashEntityUrn) {
            byUrn[item.dashEntityUrn] = item;
        }
    }

    // Elements array contains URN references to the top-level updates
    const elementUrns = data?.data?.['*elements'] || data?.data?.elements || [];
    console.log(`[Voyager] ${elementUrns.length} element URNs, first: ${elementUrns[0]?.substring?.(0, 80) || JSON.stringify(elementUrns[0])?.substring(0, 80)}`);

    // If elements are objects instead of strings, extract URNs
    const resolvedElementUrns = elementUrns.map(e => {
        if (typeof e === 'string') return e;
        return e?.entityUrn || e?.dashEntityUrn || '';
    });

    const posts = [];
    for (const elemUrn of resolvedElementUrns) {
        try {
            const activityMatch = (typeof elemUrn === 'string' ? elemUrn : '').match(/urn:li:activity:(\d+)/);
            if (!activityMatch) {
                console.log(`[Voyager] No activity URN in element: ${String(elemUrn).substring(0, 60)}`);
                continue;
            }
            const activityUrn = activityMatch[0];
            const activityId = activityMatch[1];

            // ─── Find the UpdateV2 entity for this activity ───
            // Look up by the full element URN first, then search by activity ID
            let updateEntity = byUrn[elemUrn];
            if (!updateEntity) {
                // Search all included items for one matching this activity
                updateEntity = included.find(item => {
                    const urn = item?.entityUrn || '';
                    const durn = item?.dashEntityUrn || '';
                    return (urn.includes(activityId) || durn.includes(activityId)) &&
                        !urn.includes('Actions') && !urn.includes('socialDetail') && !urn.includes('socialActivityCounts');
                });
            }

            // ─── Extract post text ───
            let text = '';

            if (updateEntity) {
                // Log what fields this entity has (first post only)
                if (posts.length === 0) {
                    console.log(`[Voyager] First UpdateV2 entity keys: ${Object.keys(updateEntity).join(', ')}`);
                    console.log(`[Voyager] First UpdateV2 commentary: ${JSON.stringify(updateEntity.commentary)?.substring(0, 200)}`);
                    console.log(`[Voyager] First UpdateV2 header: ${JSON.stringify(updateEntity.header)?.substring(0, 200)}`);
                    if (updateEntity.content) {
                        console.log(`[Voyager] First UpdateV2 content keys: ${Object.keys(updateEntity.content).join(', ')}`);
                    }
                }

                // Try multiple paths for text content
                text = updateEntity?.commentary?.text?.text               // Standard post text
                    || updateEntity?.commentary?.commentaryText?.text      // Alternative format
                    || updateEntity?.commentary?.text                      // If text is directly a string
                    || '';

                // If commentary is a string itself
                if (!text && typeof updateEntity?.commentary === 'string') {
                    text = updateEntity.commentary;
                }

                // If text is in header
                if (!text) {
                    text = updateEntity?.header?.text?.text || '';
                }

                // Deep search if still empty
                if (!text) {
                    text = deepFindText(updateEntity);
                }

                // Check if commentary reference points to another entity
                if (!text && updateEntity?.['*commentary']) {
                    const commentaryRef = updateEntity['*commentary'];
                    const commentaryEntity = byUrn[commentaryRef];
                    if (commentaryEntity) {
                        text = commentaryEntity?.text?.text || commentaryEntity?.commentaryText?.text || deepFindText(commentaryEntity);
                        if (posts.length === 0) console.log(`[Voyager] Found commentary ref entity: ${JSON.stringify(commentaryEntity)?.substring(0, 200)}`);
                    }
                }

                // Check resharedUpdate
                if (!text && updateEntity?.resharedUpdate) {
                    text = updateEntity.resharedUpdate?.commentary?.text?.text || deepFindText(updateEntity.resharedUpdate);
                }

                // Check content for article titles
                if (!text && updateEntity?.content) {
                    const content = updateEntity.content;
                    for (const key of Object.keys(content)) {
                        if (content[key]?.title?.text) {
                            text = content[key].title.text;
                            break;
                        }
                        if (content[key]?.description?.text) {
                            text = content[key].description.text;
                            break;
                        }
                    }
                }
            } else {
                console.log(`[Voyager] No UpdateV2 entity found for activity ${activityId}`);
            }

            // ─── Find engagement data ───
            let likes = 0, comments = 0, shares = 0, selfLiked = false;

            // Search for SocialDetail or SocialActivityCounts matching this activity
            for (const item of included) {
                const urn = item?.entityUrn || '';
                const type = item?.$type || '';

                if (urn.includes(activityId)) {
                    // SocialDetail — has detailed engagement
                    if (type.includes('SocialDetail') || urn.includes('socialDetail')) {
                        likes = item?.likes?.paging?.total || item?.totalLikes || likes;
                        comments = item?.comments?.paging?.total || item?.totalComments || comments;
                        shares = item?.totalShares || shares;
                        selfLiked = item?.liked || selfLiked;

                        // Check for referenced activity counts
                        const countsRef = item?.['*totalSocialActivityCounts'];
                        if (countsRef && byUrn[countsRef]) {
                            const counts = byUrn[countsRef];
                            likes = counts.numLikes ?? likes;
                            comments = counts.numComments ?? comments;
                            shares = counts.numShares ?? shares;
                        }
                    }

                    // Direct SocialActivityCounts match
                    if (type.includes('SocialActivityCounts') || urn.includes('socialActivityCounts')) {
                        likes = item.numLikes ?? likes;
                        comments = item.numComments ?? comments;
                        shares = item.numShares ?? shares;
                    }
                }
            }

            // Also check the updateEntity itself for socialDetail references
            if (updateEntity?.['*socialDetail']) {
                const sdRef = updateEntity['*socialDetail'];
                const sd = byUrn[sdRef];
                if (sd) {
                    likes = sd?.likes?.paging?.total || sd?.totalLikes || likes;
                    comments = sd?.comments?.paging?.total || sd?.totalComments || comments;
                    shares = sd?.totalShares || shares;
                    selfLiked = sd?.liked || selfLiked;

                    const countsRef = sd?.['*totalSocialActivityCounts'];
                    if (countsRef && byUrn[countsRef]) {
                        const counts = byUrn[countsRef];
                        likes = counts.numLikes ?? likes;
                        comments = counts.numComments ?? comments;
                        shares = counts.numShares ?? shares;
                    }
                }
            }

            // ─── Find post URL from UpdateActions ───
            let postUrl = '';
            for (const item of included) {
                const urn = item?.entityUrn || '';
                if (urn.includes(activityId) && (urn.includes('Actions') || item?.$type?.includes('UpdateActions'))) {
                    const actionsList = item?.actions || [];
                    for (const action of actionsList) {
                        if (action.actionType === 'SHARE_VIA' && action.url) {
                            postUrl = action.url.split('?')[0];
                            // URL slug fallback for text
                            if (!text) {
                                const urlMatch = action.url.match(/\/posts\/[^_]+_(.+?)-activity-/);
                                if (urlMatch) {
                                    text = urlMatch[1].replace(/-/g, ' ');
                                }
                            }
                            break;
                        }
                    }
                    break;
                }
            }

            const postDate = activityUrnToDate(activityUrn);

            // Log first post details for debugging
            if (posts.length === 0) {
                console.log(`[Voyager] First post: text="${(text || '').substring(0, 100)}" likes=${likes} comments=${comments} url=${postUrl?.substring(0, 60)}`);
            }

            posts.push({
                text: (text || '').substring(0, 3000),
                likes,
                comments,
                shares,
                selfLiked,
                views: null,
                urn: activityUrn,
                url: postUrl,
                date: postDate,
            });
        } catch (e) {
            console.warn('[Voyager] Error parsing post:', e.message);
        }
    }

    console.log(`[Voyager] Parsed ${posts.length} posts. Sample texts: ${posts.slice(0, 3).map(p => `"${(p.text || 'EMPTY').substring(0, 40)}"`).join(', ')}`);
    return posts;
}


// ═══════════════════════════════════════════════════════════════════════
// 7. GET connections list
// ═══════════════════════════════════════════════════════════════════════
async function fetchConnections(csrfToken) {
    const data = await voyagerFetch('relationships/connections?count=10&start=0', csrfToken);
    if (!data) return null;

    const included = data?.included || [];
    const total = data?.data?.paging?.total || data?.paging?.total || null;

    const connections = included
        .filter(i => i?.$type?.includes('MiniProfile'))
        .map(c => ({
            name: `${c.firstName || ''} ${c.lastName || ''}`.trim(),
            occupation: c.occupation || '',
            publicIdentifier: c.publicIdentifier || '',
            picture: pickBestPicture(c.picture)
        }));

    return { total, connections };
}


// ═══════════════════════════════════════════════════════════════════════
// 8. GET received invitations — FIXED: try multiple endpoint formats
// ═══════════════════════════════════════════════════════════════════════
async function fetchReceivedInvitations(csrfToken) {
    // Try the newer endpoint first, fall back to legacy
    let data = await voyagerFetch('relationships/invitationViews?q=receivedInvitation&count=20', csrfToken);

    if (!data) {
        // Fallback: try dash endpoint
        data = await voyagerFetch('relationships/dash/invitationViews?q=receivedInvitation&count=20', csrfToken);
    }

    if (!data) {
        console.warn('[Voyager] Both invitation endpoints failed');
        return null;
    }

    const included = data?.included || [];
    const elements = data?.data?.elements || data?.elements || [];
    const total = data?.data?.paging?.total ?? elements.length ?? 0;

    console.log(`[Voyager] Received invitations: total=${total}, elements=${elements.length}, included=${included.length}`);

    // Build MiniProfile lookup
    const miniProfiles = {};
    for (const item of included) {
        if (item?.$type?.includes('MiniProfile') && item?.entityUrn) {
            miniProfiles[item.entityUrn] = {
                name: `${item.firstName || ''} ${item.lastName || ''}`.trim(),
                occupation: item.occupation || '',
                publicIdentifier: item.publicIdentifier || '',
                picture: pickBestPicture(item.picture),
            };
        }
    }

    const invitations = [];

    // Parse from elements array
    if (elements.length > 0) {
        for (const elem of elements) {
            const inv = elem?.invitation || elem;
            const senderRef = inv?.['*fromMember'] || inv?.fromMember;
            const sender = senderRef ? miniProfiles[senderRef] : null;
            invitations.push({
                sentTime: inv?.sentTime || inv?.createdAt || null,
                message: inv?.message || '',
                senderName: sender?.name || inv?.genericInviter?.title || 'Unknown',
                senderOccupation: sender?.occupation || '',
                senderPicture: sender?.picture || '',
                invitationType: inv?.invitationType || 'CONNECTION',
            });
        }
    }

    // Also try parsing from included array if elements was empty
    if (invitations.length === 0) {
        for (const item of included) {
            if (item?.invitation || item?.sentTime || item?.$type?.includes('Invitation')) {
                const inv = item?.invitation || item;
                const senderRef = inv?.['*fromMember'] || inv?.fromMember;
                const sender = senderRef ? miniProfiles[senderRef] : null;
                invitations.push({
                    sentTime: inv?.sentTime || inv?.createdAt || null,
                    message: inv?.message || '',
                    senderName: sender?.name || 'Unknown',
                    senderOccupation: sender?.occupation || '',
                    senderPicture: sender?.picture || '',
                    invitationType: inv?.invitationType || 'CONNECTION',
                });
            }
        }
    }

    return { total, invitations };
}


// ═══════════════════════════════════════════════════════════════════════
// 9. GET sent invitations
// ═══════════════════════════════════════════════════════════════════════
async function fetchSentInvitations(csrfToken) {
    let data = await voyagerFetch('relationships/sentInvitationViewsV2?count=20&invitationType=CONNECTION&q=invitationType', csrfToken);

    if (!data) {
        data = await voyagerFetch('relationships/dash/sentInvitationViewsV2?count=20&invitationType=CONNECTION&q=invitationType', csrfToken);
    }

    if (!data) return null;

    const included = data?.included || [];
    const elements = data?.data?.elements || data?.elements || [];
    const total = data?.data?.paging?.total ?? elements.length ?? 0;

    console.log(`[Voyager] Sent invitations: total=${total}, elements=${elements.length}`);

    const miniProfiles = {};
    for (const item of included) {
        if (item?.$type?.includes('MiniProfile') && item?.entityUrn) {
            miniProfiles[item.entityUrn] = {
                name: `${item.firstName || ''} ${item.lastName || ''}`.trim(),
                occupation: item.occupation || '',
                publicIdentifier: item.publicIdentifier || '',
                picture: pickBestPicture(item.picture),
            };
        }
    }

    const invitations = [];
    for (const elem of elements) {
        const inv = elem?.invitation || elem;
        const recipientRef = inv?.['*toMember'] || inv?.toMember;
        const recipient = recipientRef ? miniProfiles[recipientRef] : null;
        invitations.push({
            sentTime: inv?.sentTime || inv?.createdAt || null,
            recipientName: recipient?.name || 'Unknown',
            recipientOccupation: recipient?.occupation || '',
        });
    }

    return { total, invitations };
}


// ═══════════════════════════════════════════════════════════════════════
// Main Sync Function
// ═══════════════════════════════════════════════════════════════════════
export async function syncVoyagerData() {
    console.log('[Voyager] ═══ Starting comprehensive data sync v2 ═══');

    try {
        const csrfToken = await getLinkedInSessionCookie();
        console.log('[Voyager] Got JSESSIONID cookie');

        // 1. Basic profile
        const myProfile = await fetchMyProfile(csrfToken);
        if (!myProfile || !myProfile.username) {
            console.warn('[Voyager] Could not fetch /me — aborting sync');
            return { success: false, error: 'Could not fetch LinkedIn profile' };
        }
        console.log('[Voyager] Profile:', myProfile.firstName, myProfile.lastName, `(@${myProfile.username})`);

        // 2. Extended profile
        const extended = await fetchExtendedProfile(csrfToken, myProfile.username);
        console.log('[Voyager] Extended:', extended ? `${extended.followerCount} followers, ${extended.connectionCount} connections` : 'null');

        // 3. ALL positions
        let allPositions = await fetchAllPositions(csrfToken, myProfile.urn);
        if (!allPositions || allPositions.length === 0) {
            console.log('[Voyager] Using TopCard positions fallback');
            allPositions = [];
        }

        // 4. ALL education
        let allEducation = await fetchAllEducation(csrfToken, myProfile.urn);
        if (!allEducation || allEducation.length === 0) {
            console.log('[Voyager] Using TopCard education fallback');
            allEducation = [];
        }

        // 5. Profile views + viewers
        const profileViews = await fetchProfileViews(csrfToken);

        // 6. Recent posts
        const recentPosts = await fetchRecentPosts(csrfToken, myProfile.urn);
        console.log('[Voyager] Posts fetched:', recentPosts.length, '| With text:', recentPosts.filter(p => p.text && p.text.length > 20).length);

        // 7. Connections
        const connectionsData = await fetchConnections(csrfToken);

        // 8. Invitations
        const receivedInvitations = await fetchReceivedInvitations(csrfToken);
        console.log('[Voyager] Received invitations:', receivedInvitations?.total ?? 'null');

        const sentInvitations = await fetchSentInvitations(csrfToken);
        console.log('[Voyager] Sent invitations:', sentInvitations?.total ?? 'null');

        // 9. Build payload
        const payload = {
            linkedInUrn: myProfile.urn,
            linkedInUsername: myProfile.username,
            name: `${myProfile.firstName} ${myProfile.lastName}`.trim(),
            headline: myProfile.headline || '',
            location: extended?.location || '',
            about: '',
            profileUrl: `https://www.linkedin.com/in/${myProfile.username}`,
            followerCount: extended?.followerCount ?? null,
            connectionCount: extended?.connectionCount ?? connectionsData?.total ?? null,
            profilePicture: myProfile.profilePicture || '',
            backgroundImage: myProfile.backgroundImage || '',
            premiumSubscriber: myProfile.premiumSubscriber,
            memberId: myProfile.memberId,

            experience: JSON.stringify(allPositions),
            education: JSON.stringify(allEducation),
            recentPosts: JSON.stringify(recentPosts),
            topConnections: JSON.stringify((connectionsData?.connections || []).slice(0, 10)),

            profileViewsData: JSON.stringify({
                ...(profileViews || {}),
                profilePicture: myProfile.profilePicture,
                backgroundImage: myProfile.backgroundImage,
            }),

            invitationsData: JSON.stringify({
                received: receivedInvitations || { total: 0, invitations: [] },
                sent: sentInvitations || { total: 0, invitations: [] },
            }),

            profileMetadata: JSON.stringify({
                premiumSubscriber: myProfile.premiumSubscriber,
                memberId: myProfile.memberId,
            }),
        };

        // 10. Send to backend
        const authData = await chrome.storage.local.get(['authToken', 'apiBaseUrl']);
        const token = authData.authToken;
        const serverUrl = (authData.apiBaseUrl && !authData.apiBaseUrl.includes('backend-buxx') && !authData.apiBaseUrl.includes('backend-api-orcin') && !authData.apiBaseUrl.includes('backend-4poj'))
            ? authData.apiBaseUrl
            : 'https://kommentify.com';

        if (!token) {
            console.warn('[Voyager] No auth token — cannot send to backend');
            return { success: false, error: 'Not logged into Kommentify' };
        }

        console.log('[Voyager] Sending to backend:', serverUrl);
        const res = await fetch(`${serverUrl}/api/linkedin-profile/voyager-sync`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const result = await res.json();
        if (result.success) {
            console.log('[Voyager] ✅ Data synced successfully');
            await chrome.storage.local.set({ voyagerLastSync: Date.now() });
        } else {
            console.warn('[Voyager] Backend error:', result.error);
        }

        return result;
    } catch (err) {
        console.error('[Voyager] Sync error:', err.message);
        return { success: false, error: err.message };
    }
}

// ─── Auto-sync check ────────────────────────────────────────────────────
export async function shouldAutoSync() {
    const data = await chrome.storage.local.get('voyagerLastSync');
    const lastSync = data.voyagerLastSync || 0;
    const sixHours = 6 * 60 * 60 * 1000;
    return Date.now() - lastSync > sixHours;
}
