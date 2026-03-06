/**
 * LinkedIn Post Data Extractor (Code Store Method)
 * ================================================
 * Extracts post data from LinkedIn's embedded <code> elements on the page
 * Same method as the Python library (linkitin)
 *
 * Run in browser console on LinkedIn home feed
 */
(function() {
    'use strict';

    console.log('[LinkedIn Extractor] 🚀 Script loaded');
    const addedButtons = new Set();

    // ========== CODE STORE EXTRACTION (same as Python) ==========

    function extractPageEntities() {
        const codeElements = document.querySelectorAll('code[id^="bpr-guid-"]');
        const entities = [];

        for (const el of codeElements) {
            try {
                const data = JSON.parse(el.textContent);
                if (data.included && data.included.length > 0) {
                    entities.push(...data.included);
                } else if (data.data) {
                    if (Array.isArray(data.data)) {
                        entities.push(...data.data);
                    } else if (data.data.included) {
                        entities.push(...data.data.included);
                    }
                }
            } catch (_) {}
        }

        console.log('[Extractor] Found', entities.length, 'entities in page code stores');
        return entities;
    }

    function extractInnerUrn(updateUrn) {
        for (const prefix of ["urn:li:activity:", "urn:li:ugcPost:", "urn:li:share:"]) {
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

    function extractText(entity) {
        const comm = entity.commentary;
        if (comm?.text) {
            const text = typeof comm.text === "string" ? comm.text : (comm.text?.text || "");
            if (text) return text;
        }

        const sc = entity.specificContent?.["com.linkedin.ugc.ShareContent"];
        if (sc?.shareCommentary?.text) return sc.shareCommentary.text;

        if (entity.message?.text) {
            return typeof entity.message.text === "string" ? entity.message.text : (entity.message.text?.text || "");
        }

        if (entity.value?.text) return entity.value.text;

        return "";
    }

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
                firstName: p.firstName || "",
                lastName: p.lastName || "",
                headline: p.occupation || null,
                profileUrl: null,
            };
        }
        return null;
    }

    function extractSocialCounts(urn, entity, socialCounts, socialDetails) {
        let likes = 0, comments = 0, reposts = 0;

        const innerUrn = extractInnerUrn(urn);

        // From entity directly
        if (entity.socialActivityCounts) {
            likes = entity.socialActivityCounts.numLikes || 0;
            comments = entity.socialActivityCounts.numComments || 0;
            reposts = entity.socialActivityCounts.numShares || 0;
        }

        // From totalSocialActivityCounts
        if (entity.totalSocialActivityCounts) {
            likes = entity.totalSocialActivityCounts.numLikes || likes;
            comments = entity.totalSocialActivityCounts.numComments || comments;
            reposts = entity.totalSocialActivityCounts.numShares || reposts;
        }

        // From socialCounts map
        const counts = socialCounts[innerUrn] || socialCounts[urn] || {};
        if (counts) {
            likes = counts.numLikes || counts.totalSocialActivityCounts?.numLikes || likes;
            comments = counts.numComments || counts.totalSocialActivityCounts?.numComments || comments;
            reposts = counts.numShares || counts.totalSocialActivityCounts?.numShares || reposts;
        }

        return { likes, comments, reposts };
    }

    function extractCreatedAt(entity) {
        const created = entity.created;
        if (created && typeof created === "object" && created.time > 0) {
            return new Date(created.time);
        }
        const createdAt = entity.createdAt;
        if (typeof createdAt === "number" && createdAt > 0) {
            return new Date(createdAt);
        }

        // Try to extract from URN timestamp
        const urn = entity.entityUrn || entity.urn || "";
        const match = urn.match(/urn:li:activity:(\d+)/);
        if (match) {
            try {
                const id = BigInt(match[1]);
                const timestamp = Number(id >> 22n) + 1288834974657;
                return new Date(timestamp);
            } catch {}
        }

        return null;
    }

    function parseFeedResponse(entities) {
        const profiles = {};
        const socialCounts = {};
        const socialDetails = {};

        for (const entity of entities) {
            const entityType = entity.$type || "";
            const entityUrn = entity.entityUrn || entity.urn || "";

            if (entityType.includes("MiniProfile") || entityType.includes("Profile")) {
                profiles[entityUrn] = entity;
            } else if (entityType.includes("SocialActivityCounts")) {
                const inner = extractInnerUrn(entityUrn);
                if (inner) socialCounts[inner] = entity;
                socialCounts[entityUrn] = entity;
            } else if (entityType.includes("SocialDetail")) {
                const threadId = entity.threadId || entityUrn;
                socialDetails[threadId] = entity;
            }
        }

        const posts = [];

        for (const entity of entities) {
            const entityType = entity.$type || "";
            if (!entityType.includes("Update") && !entityType.includes("FeedUpdate")) continue;

            const urn = entity.entityUrn || entity.urn || "";
            if (!urn) continue;

            const text = extractText(entity);
            if (!text) continue;

            const author = extractAuthor(entity, profiles);
            const counts = extractSocialCounts(urn, entity, socialCounts, socialDetails);
            const createdAt = extractCreatedAt(entity);

            posts.push({
                urn,
                text,
                author: author ? `${author.firstName} ${author.lastName}`.trim() : "Unknown",
                authorFirstName: author?.firstName || "",
                authorLastName: author?.lastName || "",
                authorHeadline: author?.headline || "",
                authorProfileUrl: author?.profileUrl || "",
                likes: counts.likes,
                comments: counts.comments,
                reposts: counts.reposts,
                createdAt: createdAt ? createdAt.toISOString() : null,
                createdAtFriendly: createdAt ? createdAt.toLocaleDateString() : "Unknown"
            });
        }

        return posts;
    }

    // ========== FIND POST BY URN (from code stores) ==========

    function findPostByUrn(targetUrn) {
        // Try code stores first
        const entities = extractPageEntities();
        const posts = parseFeedResponse(entities);

        // Find exact match
        for (const post of posts) {
            if (post.urn.includes(targetUrn.replace('urn:li:activity:', '').replace('urn:li:ugcPost:', ''))) {
                return post;
            }
        }

        // Try partial match
        const targetId = targetUrn.split(':').pop();
        for (const post of posts) {
            if (post.urn.includes(targetId)) {
                return post;
            }
        }

        // Fallback: Extract from DOM
        console.log('[Extractor] Code stores empty, trying DOM extraction...');
        return extractPostFromDOM(targetUrn);
    }

    // ========== DOM EXTRACTION FALLBACK ==========

    function extractPostFromDOM(targetUrn) {
        // Find the post element with matching URN
        let targetPost = null;

        // Try by data-urn attribute
        const posts = document.querySelectorAll('[data-urn]');
        for (const post of posts) {
            const urn = post.getAttribute('data-urn');
            if (urn && urn.includes(targetUrn.replace('urn:li:', '').replace('activity:', '').replace('ugcPost:', ''))) {
                targetPost = post;
                break;
            }
        }

        // Try by data-id
        if (!targetPost) {
            const allElements = document.querySelectorAll('[data-id]');
            const urnId = targetUrn.replace('urn:li:activity:', '').replace('urn:li:ugcPost:', '');
            for (const el of allElements) {
                const id = el.getAttribute('data-id');
                if (id && id.includes(urnId)) {
                    targetPost = el;
                    break;
                }
            }
        }

        if (!targetPost) {
            console.warn('[Extractor] Could not find post element in DOM');
            return null;
        }

        // Extract author name from DOM
        let authorName = 'Unknown';
        let authorFirstName = '';
        let authorLastName = '';
        let authorHeadline = '';
        let authorProfileUrl = '';

        // Try to find profile link
        const profileLinks = targetPost.querySelectorAll('a[href*="/in/"]');
        for (const link of profileLinks) {
            const href = link.getAttribute('href');
            if (href && href.includes('/in/')) {
                const cleanHref = href.split('?')[0];
                const match = cleanHref.match(/\/in\/([^\/]+)/);
                if (match) {
                    const slug = match[1];
                    authorProfileUrl = `https://www.linkedin.com/in/${slug}`;
                    // Convert slug to name
                    const nameParts = slug.replace(/[0-9-]/g, ' ').trim().split(/\s+/);
                    if (nameParts.length > 0) {
                        authorFirstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase();
                        authorLastName = nameParts.slice(1).join(' ');
                        authorName = `${authorFirstName} ${authorLastName}`.trim();
                    }
                    break;
                }
            }
        }

        // Try aria-label for author name
        if (authorName === 'Unknown') {
            const authorLinks = targetPost.querySelectorAll('a[aria-label]');
            for (const link of authorLinks) {
                const label = link.getAttribute('aria-label') || '';
                const match = label.match(/View\s+(.+?)(?:\'s|\s+profile)/i);
                if (match && match[1]) {
                    authorName = match[1].trim();
                    const parts = authorName.split(' ');
                    authorFirstName = parts[0];
                    authorLastName = parts.slice(1).join(' ');
                    break;
                }
            }
        }

        // Extract post text
        let text = '';
        const textSelectors = [
            '.feed-shared-update-v2__description',
            '.feed-shared-text',
            '.update-components-text',
            '[data-view-name="feed-commentary"]',
            'span[dir="ltr"]'
        ];

        for (const selector of textSelectors) {
            const el = targetPost.querySelector(selector);
            if (el) {
                text = el.innerText?.trim() || '';
                if (text.length > 10) break;
            }
        }

        // Extract engagement counts
        let likes = 0, comments = 0, reposts = 0;

        const likeBtn = targetPost.querySelector('button[aria-label*="Like" i], button[aria-label*="reaction" i]');
        const commentBtn = targetPost.querySelector('button[aria-label*="Comment" i]');
        const repostBtn = targetPost.querySelector('button[aria-label*="Repost" i]');

        if (likeBtn) {
            const label = likeBtn.getAttribute('aria-label') || '';
            const match = label.match(/(\d+[\d,]*)/);
            if (match) likes = parseInt(match[1].replace(/,/g, ''));
        }
        if (commentBtn) {
            const label = commentBtn.getAttribute('aria-label') || '';
            const match = label.match(/(\d+[\d,]*)/);
            if (match) comments = parseInt(match[1].replace(/,/g, ''));
        }
        if (repostBtn) {
            const label = repostBtn.getAttribute('aria-label') || '';
            const match = label.match(/(\d+[\d,]*)/);
            if (match) reposts = parseInt(match[1].replace(/,/g, ''));
        }

        // Extract date
        let createdAt = null;
        let createdAtFriendly = 'Unknown';

        const timeEl = targetPost.querySelector('time[datetime]');
        if (timeEl) {
            const dt = timeEl.getAttribute('datetime');
            if (dt) {
                createdAt = new Date(dt).toISOString();
                createdAtFriendly = timeEl.innerText?.trim() || new Date(dt).toLocaleDateString();
            }
        } else {
            // Try finding date patterns
            const allSpans = targetPost.querySelectorAll('span');
            for (const span of allSpans) {
                const txt = span.innerText?.trim() || '';
                if (/^\d+[hdmwy]$/i.test(txt) || /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(txt)) {
                    createdAtFriendly = txt;
                    break;
                }
            }
        }

        return {
            urn: targetUrn,
            text,
            author: authorName,
            authorFirstName,
            authorLastName,
            authorHeadline,
            authorProfileUrl,
            likes,
            comments,
            reposts,
            createdAt,
            createdAtFriendly,
            source: 'DOM'
        };
    }

    // ========== BUTTON CREATION ==========

    function createAIButton() {
        const btn = document.createElement('button');
        btn.className = 'ai-comment-btn comments-comment-box__detour-icons artdeco-button artdeco-button--circle artdeco-button--muted artdeco-button--2 artdeco-button--tertiary';
        btn.type = 'button';
        btn.title = 'Extract Post Data';

        btn.innerHTML = `
            <span class="artdeco-button__icon" style="display: flex; align-items: center; justify-content: center; background: white; border-radius: 50%; width: 24px; height: 24px; padding: 2px; box-sizing: border-box;">
                <span style="display:flex;width:16px;height:16px;background:linear-gradient(135deg, #693fe9, #7c4dff);border-radius:50%;color:white;font-size:10px;font-weight:bold;align-items:center;justify-content:center;">K</span>
            </span>
        `;

        btn.style.cssText = `
            width: 32px !important; height: 32px !important; min-width: 32px !important;
            border-radius: 50% !important; background-color: transparent !important;
            border: none !important; display: inline-flex !important; align-items: center !important;
            justify-content: center !important; cursor: pointer !important; margin-right: 4px !important;
            transition: background-color 0.2s ease !important; padding: 0 !important;
        `;

        btn.addEventListener('mouseenter', () => btn.style.backgroundColor = 'rgba(0, 0, 0, 0.08)');
        btn.addEventListener('mouseleave', () => btn.style.backgroundColor = 'transparent');

        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            btn.innerHTML = '<span style="font-size:14px;">⏳</span>';
            btn.style.opacity = '0.7';

            console.log('[LinkedIn Extractor] 🔍 Extracting post URN...');

            let currentElement = btn.parentElement;
            let postUrn = null;

            while (currentElement && currentElement !== document.body) {
                if (currentElement.hasAttribute('data-urn')) {
                    postUrn = currentElement.getAttribute('data-urn');
                    break;
                } else if (currentElement.hasAttribute('data-id')) {
                    postUrn = currentElement.getAttribute('data-id');
                    break;
                }
                currentElement = currentElement.parentElement;
            }

            if (!postUrn) {
                console.error('[LinkedIn Extractor] ❌ Could not find post URN');
                btn.innerHTML = '<span style="font-size:14px;">❌</span>';
                setTimeout(() => { btn.innerHTML = getButtonHTML(); btn.style.opacity = '1'; }, 2000);
                return;
            }

            console.log('[LinkedIn Extractor] 📍 Found URN:', postUrn);

            try {
                const postData = findPostByUrn(postUrn);

                console.log('═══════════════════════════════════════');
                console.log('📊 EXTRACTED POST DATA:');
                console.log('═══════════════════════════════════════');

                if (postData) {
                    console.log('🔖 URN:', postData.urn);
                    console.log('👤 Author:', postData.author);
                    console.log('   First Name:', postData.authorFirstName);
                    console.log('   Last Name:', postData.authorLastName);
                    console.log('   Headline:', postData.authorHeadline || '(none)');
                    console.log('   Profile URL:', postData.authorProfileUrl || '(none)');
                    console.log('📝 Content:', postData.text);
                    console.log('❤️  Likes:', postData.likes);
                    console.log('💬 Comments:', postData.comments);
                    console.log('🔄 Reposts:', postData.reposts);
                    console.log('⏰ Date:', postData.createdAtFriendly || postData.createdAt);
                    console.log('═══════════════════════════════════════');

                    window.lastExtractedPost = postData;
                } else {
                    console.log('⚠️ Could not find post data in page');
                    console.log('📍 Raw URN:', postUrn);
                }
                console.log('═══════════════════════════════════════');

            } catch (err) {
                console.error('[LinkedIn Extractor] ❌ Error:', err.message);
            }

            btn.innerHTML = getButtonHTML();
            btn.style.opacity = '1';
        });

        return btn;
    }

    function getButtonHTML() {
        return `
            <span class="artdeco-button__icon" style="display: flex; align-items: center; justify-content: center; background: white; border-radius: 50%; width: 24px; height: 24px; padding: 2px; box-sizing: border-box;">
                <span style="display:flex;width:16px;height:16px;background:linear-gradient(135deg, #693fe9, #7c4dff);border-radius:50%;color:white;font-size:10px;font-weight:bold;align-items:center;justify-content:center;">K</span>
            </span>
        `;
    }

    // ========== FIND ICON CONTAINER ==========

    function findIconContainer(postElement) {
        if (!postElement) return null;

        let iconContainer = postElement.querySelector('.comments-comment-box__detour-container');
        if (!iconContainer) {
            const emojiBtn = postElement.querySelector('button[aria-label*="emoji" i], button[aria-label*="Emoji"]');
            if (emojiBtn) iconContainer = emojiBtn.parentElement;
        }
        if (!iconContainer) {
            const photoBtn = postElement.querySelector('button[aria-label*="photo" i], button[aria-label*="image" i]');
            if (photoBtn) iconContainer = photoBtn.parentElement;
        }
        return iconContainer;
    }

    // ========== ADD BUTTON TO COMMENT BOX ==========

    function addButtonToCommentBox(postElement) {
        if (!postElement || addedButtons.has(postElement) || postElement === document.body) return;

        if (postElement.querySelector('.ai-comment-btn')) {
            addedButtons.add(postElement);
            return;
        }

        const iconContainer = findIconContainer(postElement);
        if (!iconContainer) return;

        iconContainer.style.display = 'flex';
        iconContainer.style.alignItems = 'center';

        const aiBtn = createAIButton();
        const firstButton = iconContainer.querySelector('button');

        if (firstButton) {
            iconContainer.insertBefore(aiBtn, firstButton);
        } else {
            iconContainer.appendChild(aiBtn);
        }

        addedButtons.add(postElement);
    }

    // ========== SCAN FOR POSTS ==========

    function scanAndAddButtons() {
        const posts = document.querySelectorAll('.feed-shared-update-v2, .feed-shared-update, [data-view-name="feed-update"], article, section');

        posts.forEach(post => {
            const hasCommentBox = post.querySelector('.comments-comment-box, [data-test-id*="comment"], [data-view-name="comment"], button[aria-label*="Comment"]');
            if (hasCommentBox) {
                addButtonToCommentBox(post);
            }
        });
    }

    // ========== OBSERVER ==========

    const observer = new MutationObserver((mutations) => {
        const shouldScan = mutations.some(m => m.addedNodes.length > 0);
        if (shouldScan) {
            clearTimeout(observer.scanTimeout);
            observer.scanTimeout = setTimeout(scanAndAddButtons, 500);
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(scanAndAddButtons, 1000);

    console.log('[LinkedIn Extractor] 🎯 Watching for comment boxes...');
    console.log('[LinkedIn Extractor] Using code store extraction (same as Python library)');

})();
