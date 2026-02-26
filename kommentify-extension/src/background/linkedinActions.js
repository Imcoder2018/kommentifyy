// LinkedIn Browser API Actions Module
// These functions are executed via chrome.scripting.executeScript in LinkedIn tabs
// They use LinkedIn's internal Voyager APIs and require the user to be logged into LinkedIn

/**
 * Get CSRF token from LinkedIn cookies
 */
function getLinkedInCsrf() {
    return ('; ' + document.cookie).split('; JSESSIONID=').pop().split(';')[0].replace(/"/g, '');
}

/**
 * Post text content to LinkedIn via normShares API
 * @param {string} content - Post text content
 * @returns {Promise<{success: boolean, urn?: string, error?: string}>}
 */
async function linkedinPostText(content) {
    try {
        const csrf = getLinkedInCsrf();
        const body = {
            visibleToConnectionsOnly: false,
            externalAudienceProviders: [],
            commentaryV2: { text: content, attributesV2: [] },
            origin: "FEED",
            allowedCommentersScope: "ALL",
            postState: "PUBLISHED",
            mediaCategory: "NONE",
            distribution: {
                feedDistribution: "MAIN_FEED",
                thirdPartyDistributionChannels: [],
                distributionTargetingEntities: []
            }
        };
        const res = await fetch('https://www.linkedin.com/voyager/api/contentcreation/normShares', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                'csrf-token': csrf,
                'x-restli-protocol-version': '2.0.0'
            },
            body: JSON.stringify(body)
        });
        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Post failed (${res.status}): ${errText}`);
        }
        const data = await res.json();
        return { success: true, urn: data?.value?.urn || data?.urn || null };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

/**
 * Post with image to LinkedIn
 * @param {string} content - Post text
 * @param {string} imageUrl - Image URL to upload
 * @returns {Promise<{success: boolean, urn?: string, error?: string}>}
 */
async function linkedinPostWithImage(content, imageUrl) {
    try {
        const csrf = getLinkedInCsrf();
        
        // Download image
        const imgRes = await fetch(imageUrl);
        const imgBlob = await imgRes.blob();
        const imgBuf = await imgBlob.arrayBuffer();
        
        // Register upload
        const regRes = await fetch('https://www.linkedin.com/voyager/api/voyagerMediaUploadMetadata?action=upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                'csrf-token': csrf,
                'x-restli-protocol-version': '2.0.0'
            },
            body: JSON.stringify({
                fileUploadType: 'IMAGE',
                imageUploadContext: {
                    processedImageTarget: 'FEED_SHARE',
                    uploadMechanism: { 'com.linkedin.voyager.image.upload.MediaUploadHttpRequest': {} }
                }
            })
        });
        if (!regRes.ok) throw new Error('Image register failed: ' + regRes.status);
        const regData = await regRes.json();
        const uploadUrl = regData?.value?.singleUploadUrl;
        const imageUrn = regData?.value?.urn;
        if (!uploadUrl || !imageUrn) throw new Error('No upload URL/URN');
        
        // Upload image
        const upRes = await fetch(uploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': imgBlob.type || 'image/jpeg' },
            body: imgBuf
        });
        if (!upRes.ok) throw new Error('Image upload failed: ' + upRes.status);
        
        // Create post with image
        const postBody = {
            visibleToConnectionsOnly: false,
            externalAudienceProviders: [],
            commentaryV2: { text: content, attributesV2: [] },
            origin: 'FEED',
            allowedCommentersScope: 'ALL',
            postState: 'PUBLISHED',
            mediaCategory: 'IMAGE',
            media: [{ altText: '', id: imageUrn }],
            distribution: {
                feedDistribution: 'MAIN_FEED',
                thirdPartyDistributionChannels: [],
                distributionTargetingEntities: []
            }
        };
        const postRes = await fetch('https://www.linkedin.com/voyager/api/contentcreation/normShares', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                'csrf-token': csrf,
                'x-restli-protocol-version': '2.0.0'
            },
            body: JSON.stringify(postBody)
        });
        if (!postRes.ok) {
            const errText = await postRes.text();
            throw new Error(`Post failed (${postRes.status}): ${errText}`);
        }
        const data = await postRes.json();
        return { success: true, urn: data?.value?.urn || data?.urn || null };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

/**
 * Schedule a LinkedIn post
 * @param {string} content - Post content
 * @param {string} scheduledTime - ISO 8601 timestamp
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
async function linkedinSchedulePost(content, scheduledTime) {
    try {
        const csrf = getLinkedInCsrf();
        const scheduleTs = new Date(scheduledTime).getTime();
        const variables = {
            createShareInput: {
                allowedCommentersScope: 'ALL',
                commentaryV2: { text: content, attributesV2: [] },
                visibility: { visibleToConnectionsOnly: false },
                origin: 'FEED',
                distribution: { feedDistribution: 'MAIN_FEED', thirdPartyDistributionChannels: [] },
                lifecycleState: 'DRAFT',
                scheduledDistributionTime: scheduleTs
            }
        };
        const res = await fetch('https://www.linkedin.com/voyager/api/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                'csrf-token': csrf,
                'x-li-graphql-pegasus-client': 'true'
            },
            body: JSON.stringify({
                queryId: 'voyagerContentcreationDashShares.86b7e94fdb94ac5e39e79bac82e3f97c',
                variables: JSON.stringify(variables)
            })
        });
        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Schedule failed (${res.status}): ${errText}`);
        }
        const data = await res.json();
        return { success: true, data };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

/**
 * Delete a LinkedIn post
 * @param {string} activityUrn - Activity URN
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function linkedinDeletePost(activityUrn) {
    try {
        const csrf = getLinkedInCsrf();
        const encodedUrn = encodeURIComponent(activityUrn);
        const res = await fetch(`https://www.linkedin.com/voyager/api/contentcreation/normShares/${encodedUrn}`, {
            method: 'DELETE',
            headers: {
                'csrf-token': csrf,
                'x-restli-protocol-version': '2.0.0'
            }
        });
        if (!res.ok && res.status !== 204) {
            const errText = await res.text();
            throw new Error(`Delete failed (${res.status}): ${errText}`);
        }
        return { success: true };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

/**
 * Get LinkedIn home feed posts
 * @param {number} count - Number of posts to fetch
 * @returns {Promise<Array>}
 */
async function linkedinGetFeed(count = 20) {
    try {
        const csrf = getLinkedInCsrf();
        const res = await fetch(`https://www.linkedin.com/voyager/api/feed/updatesV2?count=${count}&q=FEED_TYPE&moduleKey=creator_home&paginationToken=`, {
            headers: {
                'csrf-token': csrf,
                'x-restli-protocol-version': '2.0.0'
            }
        });
        if (!res.ok) throw new Error('Feed fetch failed: ' + res.status);
        const data = await res.json();
        const posts = [];
        const elements = data?.elements || [];
        const included = data?.included || [];
        
        for (const el of elements) {
            try {
                let postText = el?.commentary?.text?.text || '';
                if (!postText) {
                    for (const inc of included) {
                        if (inc?.entityUrn === el?.entityUrn && inc?.commentary?.text?.text) {
                            postText = inc.commentary.text.text;
                            break;
                        }
                    }
                }
                if (!postText || postText.length < 20) continue;
                
                let authorName = 'Unknown';
                const actorUrn = el?.actor?.urn;
                if (el?.actor?.name?.text) authorName = el.actor.name.text;
                else {
                    for (const inc of included) {
                        if (inc?.urn === actorUrn && inc?.name?.text) {
                            authorName = inc.name.text;
                            break;
                        }
                    }
                }
                
                const sc = el?.socialDetail?.totalSocialActivityCounts;
                const likes = sc?.numLikes || 0;
                const comments = sc?.numComments || 0;
                const shares = sc?.numShares || 0;
                
                const activityMatch = (el?.entityUrn || '').match(/activity:(\d+)/);
                const postUrl = activityMatch ? `https://www.linkedin.com/feed/update/urn:li:activity:${activityMatch[1]}/` : '';
                
                let authorUrl = '';
                if (el?.actor?.navigationContext?.actionTarget) authorUrl = el.actor.navigationContext.actionTarget;
                
                posts.push({
                    postContent: postText.substring(0, 5000),
                    authorName,
                    authorUrl,
                    likes,
                    comments,
                    shares,
                    postUrl,
                    urn: el?.entityUrn || ''
                });
            } catch (e) { }
        }
        return posts;
    } catch (e) {
        return [];
    }
}

/**
 * Search LinkedIn posts by keyword
 * @param {string} keyword - Search keyword
 * @param {number} count - Max results
 * @returns {Promise<Array>}
 */
async function linkedinSearchPosts(keyword, count = 20) {
    try {
        const csrf = getLinkedInCsrf();
        const encodedKw = encodeURIComponent(keyword);
        const url = `https://www.linkedin.com/voyager/api/graphql?variables=(start:0,origin:SWITCH_TAB_ALL,query:(keywords:${encodedKw},flagshipSearchIntent:SEARCH_SRP,queryParameters:List((key:resultType,value:List(CONTENT))),includeFiltersInResponse:false))&queryId=voyagerSearchDashClusters.66109b4d93ab08e24c4dc08e77d5d699`;
        const res = await fetch(url, {
            headers: {
                'csrf-token': csrf,
                'x-li-graphql-pegasus-client': 'true'
            }
        });
        if (!res.ok) throw new Error('Search failed: ' + res.status);
        const data = await res.json();
        const posts = [];
        const included = data?.included || [];
        
        for (const item of included) {
            try {
                const text = item?.commentary?.text?.text || '';
                if (!text || text.length < 20) continue;
                const sc = item?.socialDetail?.totalSocialActivityCounts;
                const likes = sc?.numLikes || 0;
                const comments = sc?.numComments || 0;
                const activityMatch = (item?.entityUrn || item?.updateUrn || '').match(/activity:(\d+)/);
                posts.push({
                    postContent: text.substring(0, 5000),
                    authorName: item?.actor?.name?.text || 'Unknown',
                    likes,
                    comments,
                    shares: sc?.numShares || 0,
                    postUrl: activityMatch ? `https://www.linkedin.com/feed/update/urn:li:activity:${activityMatch[1]}/` : '',
                    urn: item?.entityUrn || ''
                });
            } catch (e) { }
        }
        return posts.slice(0, count);
    } catch (e) {
        return [];
    }
}

/**
 * Follow a LinkedIn profile
 * @param {string} profileUrn - Profile entity URN
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function linkedinFollowProfile(profileUrn) {
    try {
        const csrf = getLinkedInCsrf();
        const res = await fetch('https://www.linkedin.com/voyager/api/voyagerRelationshipsDashMemberRelationships?action=follow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                'csrf-token': csrf,
                'x-restli-protocol-version': '2.0.0'
            },
            body: JSON.stringify({ followerUrn: profileUrn })
        });
        if (!res.ok) {
            // Fallback to feed/follows
            const fallbackRes = await fetch('https://www.linkedin.com/voyager/api/feed/follows', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8',
                    'csrf-token': csrf,
                    'x-restli-protocol-version': '2.0.0'
                },
                body: JSON.stringify({ followerUrn: profileUrn })
            });
            if (!fallbackRes.ok) throw new Error('Follow failed: ' + fallbackRes.status);
        }
        return { success: true };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

/**
 * Like a LinkedIn post
 * @param {string} activityUrn - Activity URN
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function linkedinLikePost(activityUrn) {
    try {
        const csrf = getLinkedInCsrf();
        const threadUrn = encodeURIComponent(activityUrn);
        const res = await fetch(`https://www.linkedin.com/voyager/api/voyagerSocialDashReactions?threadUrn=${threadUrn}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                'csrf-token': csrf,
                'x-restli-protocol-version': '2.0.0'
            },
            body: JSON.stringify({ reactionType: 'LIKE' })
        });
        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Like failed (${res.status}): ${errText}`);
        }
        return { success: true };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

/**
 * Comment on a LinkedIn post
 * @param {string} activityUrn - Activity URN
 * @param {string} commentText - Comment text
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function linkedinCommentOnPost(activityUrn, commentText) {
    try {
        const csrf = getLinkedInCsrf();
        const res = await fetch('https://www.linkedin.com/voyager/api/feed/comments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                'csrf-token': csrf,
                'x-restli-protocol-version': '2.0.0'
            },
            body: JSON.stringify({
                threadUrn: activityUrn,
                commentaryV2: { text: commentText, attributesV2: [] }
            })
        });
        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Comment failed (${res.status}): ${errText}`);
        }
        return { success: true };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

/**
 * Get profile URN from vanity name
 * @param {string} vanityName - LinkedIn vanity name (from URL)
 * @returns {Promise<{entityUrn?: string, firstName?: string, lastName?: string, error?: string}>}
 */
async function linkedinGetProfileUrn(vanityName) {
    try {
        const csrf = getLinkedInCsrf();
        const res = await fetch(`https://www.linkedin.com/voyager/api/identity/profiles/${vanityName}`, {
            headers: {
                'csrf-token': csrf,
                'x-restli-protocol-version': '2.0.0'
            }
        });
        if (!res.ok) throw new Error('Profile fetch failed: ' + res.status);
        const data = await res.json();
        return {
            entityUrn: data?.entityUrn || data?.miniProfile?.entityUrn || null,
            memberUrn: data?.memberUrn || null,
            firstName: data?.firstName || '',
            lastName: data?.lastName || '',
            headline: data?.headline || '',
            profilePicture: data?.profilePictureDisplayImage?.rootUrl || null
        };
    } catch (e) {
        return { error: e.message };
    }
}

/**
 * Get recent posts from a profile
 * @param {string} profileUrn - Profile entity URN
 * @returns {Promise<Array>}
 */
async function linkedinGetRecentPosts(profileUrn) {
    try {
        const csrf = getLinkedInCsrf();
        const encodedUrn = encodeURIComponent(profileUrn);
        const res = await fetch(`https://www.linkedin.com/voyager/api/feed/updatesV2?profileUrn=${encodedUrn}&q=FEED_TYPE&moduleKey=creator_profile&count=5`, {
            headers: {
                'csrf-token': csrf,
                'x-restli-protocol-version': '2.0.0'
            }
        });
        if (!res.ok) throw new Error('Recent posts fetch failed: ' + res.status);
        const data = await res.json();
        const elements = data?.elements || [];
        const posts = [];
        for (const el of elements) {
            const text = el?.commentary?.text?.text || '';
            const counts = el?.socialDetail?.totalSocialActivityCounts;
            const activityMatch = (el?.entityUrn || '').match(/activity:(\d+)/);
            if (text) {
                posts.push({
                    text: text.substring(0, 5000),
                    likes: counts?.numLikes || 0,
                    comments: counts?.numComments || 0,
                    shares: counts?.numShares || 0,
                    urn: el?.entityUrn || '',
                    postUrl: activityMatch ? `https://www.linkedin.com/feed/update/urn:li:activity:${activityMatch[1]}/` : ''
                });
            }
        }
        return posts;
    } catch (e) {
        return [];
    }
}

// Export functions (if using as module)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getLinkedInCsrf,
        linkedinPostText,
        linkedinPostWithImage,
        linkedinSchedulePost,
        linkedinDeletePost,
        linkedinGetFeed,
        linkedinSearchPosts,
        linkedinFollowProfile,
        linkedinLikePost,
        linkedinCommentOnPost,
        linkedinGetProfileUrn,
        linkedinGetRecentPosts
    };
}
