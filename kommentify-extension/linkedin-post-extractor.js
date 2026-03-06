/**
 * LinkedIn Comment Box AI Button + Post Data Extractor
 * Run this script in browser console on LinkedIn home feed
 *
 * What it does:
 * 1. Adds a "K" button to each comment box toolbar on LinkedIn posts
 * 2. When clicked, extracts and logs post data (author, content, profile URL)
 */

(function() {
    'use strict';

    console.log('[LinkedIn Post Extractor] 🚀 Script loaded');

    // Track already-added buttons
    const addedButtons = new Set();

    // ========== POST DATA EXTRACTION ==========

    function scrapePostContent(postElement) {
        if (!postElement) return '';

        const selectors = [
            '[data-testid="expandable-text-box"]',
            '[data-view-name="feed-commentary"]',
            '.feed-shared-update-v2__description span[dir="ltr"]',
            '.update-components-text span[dir="ltr"]',
            '.feed-shared-update-v2__description',
            '.feed-shared-text',
            '.update-components-text',
            '.feed-shared-inline-show-more-text',
            '[data-test-id="main-feed-activity-card__commentary"]',
            '.break-words'
        ];

        for (const selector of selectors) {
            const element = postElement.querySelector(selector);
            if (element) {
                let text = element.innerText?.trim() || element.textContent?.trim() || '';
                text = text.replace(/…\s*more/gi, '');
                text = text.replace(/\.\.\.\s*more/gi, '');
                text = text.replace(/\.\.\.\s*see more$/i, '');
                text = text.replace(/see translation$/i, '');

                if (text && text.length > 10) {
                    return text;
                }
            }
        }

        // Fallback
        const ltrSpans = postElement.querySelectorAll('span[dir="ltr"]');
        let fallbackText = '';
        for (const span of ltrSpans) {
            if (span.closest('[data-view-name="comment-box"]') || span.closest('.comments-comment-box__form')) {
                continue;
            }
            const text = span.textContent?.trim() || '';
            if (text.length > 10) {
                fallbackText += text + ' ';
            }
        }
        return fallbackText.trim() || '';
    }

    function scrapeAuthorName(postElement) {
        if (!postElement) return 'there';

        // Strategy 1: aria-label
        const links = postElement.querySelectorAll('a[aria-label]');
        for (const link of links) {
            const rawLabel = link.getAttribute('aria-label');
            if (!rawLabel) continue;

            const patterns = [
                /^View\s+(.+?)['']s\s+profile/i,
                /^View\s+(.+?)['']s/i,
                /^(.+?)['']s\s+profile/i,
                /^View\s+profile\s+for\s+(.+)/i
            ];

            for (const pattern of patterns) {
                const match = rawLabel.match(pattern);
                if (match && match[1]) {
                    const name = match[1].trim();
                    const invalidTerms = ['comment', 'view', 'profile', 'linkedin', 'activity', 'post'];
                    const isValid = name.length > 1 &&
                                  !invalidTerms.some(term => name.toLowerCase().includes(term));
                    if (isValid) {
                        return name.split(' ')[0];
                    }
                }
            }
        }

        // Strategy 2: Direct selectors
        const directSelectors = [
            '.update-components-actor__meta a span span:nth-child(1) span span:nth-child(1)',
            '.update-components-actor__name span[aria-hidden="true"]',
            '.update-components-actor__title',
            '.feed-shared-actor__name',
            '[data-view-name="feed-header-text"] strong',
            'div[data-view-name*="feed-actor"] p',
            'a[href*="/in/"] + div p'
        ];

        for (const selector of directSelectors) {
            const element = postElement.querySelector(selector);
            if (element) {
                const text = element.textContent?.trim();
                if (text && text.length > 1 && !text.includes('\n')) {
                    return text.split(' ')[0];
                }
            }
        }

        // Strategy 3: Profile URL
        const profileLinks = postElement.querySelectorAll('a[href*="/in/"]');
        for (const link of profileLinks) {
            const href = link.getAttribute('href');
            if (href) {
                const match = href.match(/\/in\/([a-zA-Z0-9_-]+)/);
                if (match && match[1]) {
                    const slug = match[1];
                    const nameParts = slug.replace(/[0-9-]/g, ' ').trim().split(/\s+/);
                    if (nameParts.length > 0 && nameParts[0].length > 1) {
                        return nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase();
                    }
                }
            }
        }

        return 'there';
    }

    function scrapeAuthorProfileUrl(postElement) {
        if (!postElement) return '';

        const selectors = [
            '.update-components-actor__meta-link',
            '.feed-shared-actor__container-link',
            '[data-control-name="actor"]'
        ];

        for (const selector of selectors) {
            const element = postElement.querySelector(selector);
            if (element && element.href) {
                return element.href;
            }
        }
        return '';
    }

    function scrapePostData(postElement) {
        return {
            postText: scrapePostContent(postElement),
            authorName: scrapeAuthorName(postElement),
            authorProfileUrl: scrapeAuthorProfileUrl(postElement),
            timestamp: new Date().toISOString()
        };
    }

    // ========== FIND POST ELEMENT ==========

    function findPostElement(commentBox) {
        if (!commentBox) return null;

        let current = commentBox.parentElement;
        const maxLevels = 15;

        for (let i = 0; i < maxLevels && current; i++) {
            // Check for post-related attributes and classes
            if (current.classList &&
                (current.classList.contains('feed-shared-update-v2') ||
                 current.classList.contains('feed-shared-update') ||
                 current.hasAttribute('data-view-name="feed-update"') ||
                 current.hasAttribute('data-urn') ||
                 current.hasAttribute('data-id'))) {
                return current;
            }
            current = current.parentElement;
        }

        // Fallback: try to find closest article or section
        current = commentBox.parentElement;
        for (let i = 0; i < maxLevels && current; i++) {
            if (current.tagName === 'ARTICLE' || current.tagName === 'SECTION') {
                return current;
            }
            current = current.parentElement;
        }

        return null;
    }

    // ========== BUTTON CREATION ==========

    function createAIButton(postElement) {
        const btn = document.createElement('button');
        btn.className = 'ai-comment-btn comments-comment-box__detour-icons artdeco-button artdeco-button--circle artdeco-button--muted artdeco-button--2 artdeco-button--tertiary';
        btn.type = 'button';
        btn.setAttribute('aria-label', 'Extract Post Data');
        btn.title = 'Extract Post Data';

        // K logo icon
        btn.innerHTML = `
            <span class="artdeco-button__icon" style="display: flex; align-items: center; justify-content: center; background: white; border-radius: 50%; width: 24px; height: 24px; padding: 2px; box-sizing: border-box;">
                <span style="display:flex;width:16px;height:16px;background:linear-gradient(135deg, #693fe9, #7c4dff);border-radius:50%;color:white;font-size:10px;font-weight:bold;align-items:center;justify-content:center;">K</span>
            </span>
            <span class="artdeco-button__text"></span>
        `;

        btn.style.cssText = `
            width: 32px !important;
            height: 32px !important;
            min-width: 32px !important;
            border-radius: 50% !important;
            background-color: transparent !important;
            border: none !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            cursor: pointer !important;
            margin-right: 4px !important;
            transition: background-color 0.2s ease !important;
            line-height: 1 !important;
            padding: 0 !important;
            overflow: hidden !important;
        `;

        // Hover effect
        btn.addEventListener('mouseenter', () => btn.style.backgroundColor = 'rgba(0, 0, 0, 0.08)');
        btn.addEventListener('mouseleave', () => btn.style.backgroundColor = 'transparent');

        // Click handler - extract post data
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            console.log('[LinkedIn Post Extractor] 🔍 Extracting post data...');

            const postEl = findPostElement(btn);
            if (!postEl) {
                console.error('[LinkedIn Post Extractor] ❌ Could not find post element');
                return;
            }

            const postData = scrapePostData(postEl);

            console.log('═══════════════════════════════════════');
            console.log('📊 EXTRACTED POST DATA:');
            console.log('═══════════════════════════════════════');
            console.log('👤 Author:', postData.authorName);
            console.log('🔗 Profile:', postData.authorProfileUrl);
            console.log('📝 Content:', postData.postText.substring(0, 200) + (postData.postText.length > 200 ? '...' : ''));
            console.log('⏰ Timestamp:', postData.timestamp);
            console.log('═══════════════════════════════════════');

            // Visual feedback
            btn.innerHTML = '<span style="font-size:14px;">✅</span>';
            setTimeout(() => {
                btn.innerHTML = `
                    <span class="artdeco-button__icon" style="display: flex; align-items: center; justify-content: center; background: white; border-radius: 50%; width: 24px; height: 24px; padding: 2px; box-sizing: border-box;">
                        <span style="display:flex;width:16px;height:16px;background:linear-gradient(135deg, #693fe9, #7c4dff);border-radius:50%;color:white;font-size:10px;font-weight:bold;align-items:center;justify-content:center;">K</span>
                    </span>
                    <span class="artdeco-button__text"></span>
                `;
            }, 2000);

            return postData;
        });

        return btn;
    }

    // ========== FIND ICON CONTAINER ==========

    function findIconContainer(postElement) {
        if (!postElement) return null;

        // Try these selectors in order
        let iconContainer = postElement.querySelector('.comments-comment-box__detour-container');

        if (!iconContainer) {
            const emojiBtn = postElement.querySelector('button[aria-label*="emoji" i], button[aria-label*="Emoji"]');
            if (emojiBtn) iconContainer = emojiBtn.parentElement;
        }
        if (!iconContainer) {
            const photoBtn = postElement.querySelector('button[aria-label*="photo" i], button[aria-label*="image" i]');
            if (photoBtn) iconContainer = photoBtn.parentElement;
        }
        if (!iconContainer) {
            const testElement = postElement.querySelector('[data-test-id*="comment"], [data-test*="comment-box"]');
            if (testElement) {
                const btns = testElement.querySelectorAll('button');
                if (btns.length > 0) iconContainer = btns[0].parentElement;
            }
        }

        return iconContainer;
    }

    // ========== ADD BUTTON TO COMMENT BOX ==========

    function addButtonToCommentBox(postElement) {
        if (!postElement || addedButtons.has(postElement)) return;
        if (postElement === document.body) return;

        // Check if button already exists
        if (postElement.querySelector('.ai-comment-btn')) {
            addedButtons.add(postElement);
            return;
        }

        const iconContainer = findIconContainer(postElement);
        if (!iconContainer) return;

        // Ensure container is flex
        iconContainer.style.display = 'flex';
        iconContainer.style.flexDirection = 'row';
        iconContainer.style.flexWrap = 'nowrap';
        iconContainer.style.alignItems = 'center';

        // Create and add button
        const aiBtn = createAIButton(postElement);
        const firstButton = iconContainer.querySelector('button');
        if (firstButton) {
            iconContainer.insertBefore(aiBtn, firstButton);
        } else {
            iconContainer.appendChild(aiBtn);
        }

        addedButtons.add(postElement);
        console.log('[LinkedIn Post Extractor] ✅ Button added to post');
    }

    // ========== SCAN FOR POSTS ==========

    function scanAndAddButtons() {
        // Find all potential post elements
        const posts = document.querySelectorAll(
            '.feed-shared-update-v2, .feed-shared-update, [data-view-name="feed-update"], article, section'
        );

        posts.forEach(post => {
            // Only add to posts that have comment functionality
            const hasCommentBox = post.querySelector(
                '.comments-comment-box, [data-test-id*="comment"], [data-view-name="comment"], button[aria-label*="Comment"]'
            );
            if (hasCommentBox) {
                addButtonToCommentBox(post);
            }
        });
    }

    // ========== OBSERVER FOR DYNAMIC CONTENT ==========

    const observer = new MutationObserver((mutations) => {
        let shouldScan = false;
        for (const mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
                shouldScan = true;
                break;
            }
        }
        if (shouldScan) {
            // Debounce scanning
            clearTimeout(observer.scanTimeout);
            observer.scanTimeout = setTimeout(scanAndAddButtons, 500);
        }
    });

    observer.scanTimeout = null;

    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Initial scan
    setTimeout(scanAndAddButtons, 1000);

    console.log('[LinkedIn Post Extractor] 🎯 Watching for comment boxes...');
    console.log('[LinkedIn Post Extractor] Click the K button on any post to extract its data');

})();
