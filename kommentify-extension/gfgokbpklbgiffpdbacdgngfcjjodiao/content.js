// content.js - Extracts LinkedIn post content and manages UI

let selectedPostText = '';
let selectedPostElement = null;
let selectedPosterName = null;
let isAuthenticated = false;
let cachedSuggestions = null; // Store the last generated suggestions
let pendingReviewCheck = false; // Track if user clicked review link
let customDomSelectors = null; // Custom selectors from Having Issues wizard

// Load custom DOM selectors from storage on init
function loadCustomSelectors() {
  chrome.storage.local.get(['customDomSelectors'], (result) => {
    if (result.customDomSelectors) {
      customDomSelectors = result.customDomSelectors;
      console.log('Loaded custom DOM selectors:', customDomSelectors);
    }
  });
}
loadCustomSelectors();

// Review request helper functions
async function getReviewStatus() {
  try {
    const result = await chrome.storage.local.get(['reviewCompleted', 'reviewLaterDate']);
    return {
      completed: result.reviewCompleted || false,
      laterDate: result.reviewLaterDate || null
    };
  } catch (error) {
    console.error('Error getting review status:', error);
    return { completed: false, laterDate: null };
  }
}

async function setReviewCompleted() {
  try {
    await chrome.storage.local.set({ reviewCompleted: true });
    console.log('Review marked as completed');
  } catch (error) {
    console.error('Error setting review completed:', error);
  }
}

async function setReviewLater() {
  try {
    // Set the "later" date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    await chrome.storage.local.set({ reviewLaterDate: tomorrow.getTime() });
    console.log('Review reminder set for tomorrow');
  } catch (error) {
    console.error('Error setting review later:', error);
  }
}

async function shouldShowReviewRequest() {
  const status = await getReviewStatus();

  // Never show if user already reviewed
  if (status.completed) {
    return false;
  }

  // If user said "later", only show after the specified date
  if (status.laterDate) {
    const now = Date.now();
    if (now < status.laterDate) {
      return false;
    }
  }

  return true;
}

// Show review confirmation modal with professional emotional hook
function showReviewConfirmModal() {
  // Remove any existing confirmation modal
  const existingModal = document.querySelector('.review-confirm-modal');
  if (existingModal) {
    existingModal.remove();
  }

  const modal = document.createElement('div');
  modal.className = 'review-confirm-modal';
  modal.innerHTML = `
    <div class="review-confirm-content">
      <div class="review-confirm-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#5170ff" stroke="#0f4d93" stroke-width="1.5"/>
        </svg>
      </div>
      <h3 class="review-confirm-title">Thank you for using Replya</h3>
      <p class="review-confirm-text">Your honest review helps us improve and helps other professionals discover this tool. It only takes 30 seconds and makes a meaningful difference.</p>
      <div class="review-confirm-buttons">
        <button class="review-confirm-btn yes">Yes, I reviewed</button>
        <button class="review-confirm-btn later">Maybe later</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Helper to hide the review section in any open suggestions modal
  const hideReviewSection = () => {
    const reviewSection = document.querySelector('#reviewRequestSection');
    if (reviewSection) {
      reviewSection.style.display = 'none';
    }
  };

  // Event listeners
  modal.querySelector('.review-confirm-btn.yes').addEventListener('click', async () => {
    await setReviewCompleted();
    hideReviewSection();
    modal.remove();
  });

  modal.querySelector('.review-confirm-btn.later').addEventListener('click', async () => {
    await setReviewLater();
    hideReviewSection();
    modal.remove();
  });

  // Close on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// Handle visibility change to detect when user returns to tab
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && pendingReviewCheck) {
    pendingReviewCheck = false;
    // Small delay to let the page stabilize
    setTimeout(() => {
      showReviewConfirmModal();
    }, 500);
  }
});

// Show login prompt modal
function showLoginPrompt() {
  const modal = document.createElement('div');
  modal.className = 'ai-comment-modal';
  modal.innerHTML = `
    <div class="ai-comment-modal-content suggestions-card" style="max-width: 400px;">
      <div class="card-header">
        <h3 class="card-title">Authentication Required</h3>
        <button class="close-btn" aria-label="Close" title="Close">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <path d="M 4.2382812 2.9882812 A 1.250125 1.250125 0 0 0 3.3671875 5.1347656 L 10.232422 12 L 3.3613281 18.869141 A 1.2512475 1.2512475 0 1 0 5.1308594 20.638672 L 12 13.767578 L 18.865234 20.632812 A 1.250125 1.250125 0 1 0 20.632812 18.865234 L 13.767578 12 L 20.625 5.1425781 A 1.250125 1.250125 0 1 0 18.857422 3.375 L 12 10.232422 L 5.1347656 3.3671875 A 1.250125 1.250125 0 0 0 4.2382812 2.9882812 z"></path>
          </svg>
        </button>
      </div>
      <div style="padding: 20px; text-align: center;">
        <p style="margin-bottom: 20px; font-size: 16px; color: var(--color-text-secondary);">
          Please log in to the extension to use AI comment suggestions.
        </p>
        <button id="login-btn" class="artdeco-button artdeco-button--2 artdeco-button--primary ember-view" style="width: 100%; justify-content: center;">
          Open Extension to Login
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Event listeners
  modal.querySelector('.close-btn').addEventListener('click', () => modal.remove());
  modal.querySelector('#login-btn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'openPopup' });
    modal.remove();
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

// Check authentication status on load
async function checkAuthStatus() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'checkAuth' });
    isAuthenticated = response?.isAuthenticated || false;
    console.log('Authentication status:', isAuthenticated);

    // Update UI based on auth status
    addButtonsToPosts();
  } catch (error) {
    console.error('Error checking auth status:', error);
    isAuthenticated = false;
    addButtonsToPosts();
  }
}

// Cache management functions
function getCachedSuggestions(postText) {
  if (!cachedSuggestions || !postText) return null;

  // Use a hash of the post text to identify the post (first 200 chars for comparison)
  const postIdentifier = postText.substring(0, 200).trim();

  if (cachedSuggestions.postIdentifier === postIdentifier) {
    return cachedSuggestions;
  }

  return null;
}

function saveCachedSuggestions(postText, suggestions, tone, length, usePersonalization, useEmojis, askQuestions) {
  if (!postText || !suggestions) return;

  const postIdentifier = postText.substring(0, 200).trim();

  cachedSuggestions = {
    postIdentifier,
    suggestions,
    tone,
    length,
    usePersonalization,
    useEmojis,
    askQuestions,
    timestamp: Date.now()
  };

  console.log('Cached suggestions for post:', postIdentifier.substring(0, 50) + '...');
}

// Remove all AI suggest buttons
function removeAllButtons() {
  document.querySelectorAll('.ai-comment-suggest-btn').forEach(btn => btn.remove());
}

// Add buttons to all visible comment boxes
function addButtonsToPosts() {
  // Try custom iconContainer selector first (from Having Issues wizard)
  if (customDomSelectors && customDomSelectors.iconContainer) {
    try {
      const customContainers = document.querySelectorAll(customDomSelectors.iconContainer);
      customContainers.forEach(iconContainer => {
        if (iconContainer.querySelector('.replya-sparkle-btn')) return;
        let postElement = iconContainer.closest('.feed-shared-update-v2') 
                       || iconContainer.closest('[data-urn^="urn:li:activity:"]')
                       || iconContainer.closest('.update-components-actor')?.closest('div');
        if (!postElement) {
          let curr = iconContainer;
          let levels = 0;
          while (curr && levels < 15) {
            if (curr.hasAttribute('data-id') || curr.tagName === 'LI') { postElement = curr; break; }
            curr = curr.parentElement;
            levels++;
          }
          if (!postElement) postElement = iconContainer.closest('div[class*="feed-shared"]') || document.body;
        }
        addSuggestButton(postElement, iconContainer);
      });
    } catch (e) { console.warn('Custom iconContainer selector failed:', e); }
  }

  const emojiBtns = document.querySelectorAll('button[aria-label*="emoji" i], button[aria-label*="Emoji"], button[aria-label*="Show Emoji Picker"]');
  
  emojiBtns.forEach(btn => {
    const iconContainer = btn.parentElement;
    
    if (iconContainer.querySelector('.replya-sparkle-btn')) {
      return;
    }

    let postElement = iconContainer.closest('.feed-shared-update-v2') 
                   || iconContainer.closest('[data-urn^="urn:li:activity:"]')
                   || iconContainer.closest('.update-components-actor')?.closest('div');
    
    if (!postElement) {
       let curr = iconContainer;
       let levels = 0;
       while (curr && levels < 15) {
         if (curr.hasAttribute('data-id') || curr.tagName === 'LI') {
            postElement = curr;
            break;
         }
         curr = curr.parentElement;
         levels++;
       }
       if (!postElement) postElement = iconContainer.closest('div[class*="feed-shared"]') || document.body;
    }

    addSuggestButton(postElement, iconContainer);
  });
}

// Extract post text from LinkedIn's DOM structure
// Extract post text from LinkedIn's DOM structure
function extractPostText(postElement, iconContainer = null) {
  let text = '';
  
  // Try custom selector first (from Having Issues wizard)
  if (customDomSelectors && customDomSelectors.postContent && postElement && postElement !== document.body) {
    try {
      const customEl = postElement.querySelector(customDomSelectors.postContent);
      if (customEl && customEl.textContent.trim().length > 0) {
        let customText = customEl.textContent.replace(/…\s*more/gi, '').replace(/\.\.\.\s*more/gi, '').trim().replaceAll('hashtag#', '#');
        if (customText.length > 0) return customText;
      }
    } catch (e) { console.warn('Custom postContent selector failed:', e); }
  }

  // Create an array of possible roots to search from
  const rootsToSearch = [];
  if (postElement && postElement !== document.body) rootsToSearch.push(postElement);
  
  // If we have an icon container, its closest post wrapper is a great place to look
  if (iconContainer) {
    const wrapper = iconContainer.closest('.feed-shared-update-v2') 
                 || iconContainer.closest('[data-urn^="urn:li:activity:"]')
                 || iconContainer.closest('[data-view-name="feed-update"]')
                 || iconContainer.closest('li')
                 || iconContainer.closest('div[data-id]');
    if (wrapper && !rootsToSearch.includes(wrapper)) {
      rootsToSearch.push(wrapper);
    }
  }

  // Fallback to body if really needed, but it's risky
  if (rootsToSearch.length === 0) return '';

  for (const root of rootsToSearch) {
    // Try to find the new commentary block first
    const newCommentaryElement = root.querySelector('[data-testid="expandable-text-box"]') || root.querySelector('[data-view-name="feed-commentary"]');
    if (newCommentaryElement && newCommentaryElement.textContent.trim().length > 0) {
      text = newCommentaryElement.textContent;
    } else {
      const traditionalElements = root.querySelectorAll('.feed-shared-update-v2__description span[dir="ltr"]');
      if (traditionalElements.length > 0) {
        traditionalElements.forEach(el => {
          text += el.textContent + ' ';
        });
      } else {
        const textWrapper = root.querySelector('.update-components-text span[dir="ltr"]') || 
                            root.querySelector('[data-update-actor-name] ~ div span[dir="ltr"]');
        if (textWrapper) {
          text = textWrapper.textContent;
        } else {
          const ltrSpans = root.querySelectorAll('span[dir="ltr"]');
          for (const span of ltrSpans) {
             if (span.textContent.trim().length > 10 && !span.closest('[data-view-name="comment-box"], .comments-comment-box__form')) {
               text += span.textContent + ' ';
             }
          }
        }
      }
    }

    if (!text.trim()) {
      const altText = root.querySelector('.break-words');
      if (altText) text = altText.textContent;
    }

    if (text.trim()) break; // We found the text!
  }

  // Clean up stray "... more" which LinkedIn includes for truncated text
  let cleanedText = text.replace(/…\s*more/gi, '');
  cleanedText = cleanedText.replace(/\.\.\.\s*more/gi, '');

  return cleanedText.trim().replaceAll("hashtag#", "#");
}

// Extract poster name from LinkedIn's DOM structure
function extractPosterName(postElement) {
  if (!postElement || postElement === document.body) return null;
  try {
    // Try custom selector first (from Having Issues wizard)
    if (customDomSelectors && customDomSelectors.authorName) {
      try {
        const customEl = postElement.querySelector(customDomSelectors.authorName);
        if (customEl) {
          let name = customEl.textContent?.trim().replace(/<!---->/g, '').trim();
          if (name && name.length > 0) return name;
        }
      } catch (e) { console.warn('Custom authorName selector failed:', e); }
    }

    const nameSelectors = [
      '.update-components-actor__single-line-truncate span[dir="ltr"] span[aria-hidden="true"]',
      '.update-components-actor__name span[aria-hidden="true"]',
      '.update-components-actor__name',
      '.feed-shared-actor__name span[aria-hidden="true"]',
      '.feed-shared-actor__name',
      '.feed-shared-actor__title',
      '[data-test-update-actor-title]'
    ];
    for (const selector of nameSelectors) {
      const nameElement = postElement.querySelector(selector);
      if (nameElement) {
        let name = nameElement.textContent?.trim() || '';
        name = name.replace(/<!---->/g, '').trim();
        if (name && name.length > 0) return name;
      }
    }
    return null;
  } catch (error) {
    console.error('Error extracting poster name:', error);
    return null;
  }
}

// Extract existing comment text from the comment field
function extractExistingCommentText(postElement, iconContainer = null) {
  try {
    let containerForSearch = postElement;
    if (iconContainer) {
       let wrapper = iconContainer.closest('.comments-comment-box__form') || 
                     iconContainer.closest('form') ||
                     iconContainer.parentElement;
       if (wrapper) containerForSearch = wrapper;
    }

    if (!containerForSearch || containerForSearch === document.body) return null;

    let prosemirrorEditor = containerForSearch.querySelector('.ProseMirror, [contenteditable="true"]');
    if (!prosemirrorEditor) {
        let curr = containerForSearch;
        let levels = 0;
        while (!prosemirrorEditor && curr && levels < 5) {
            curr = curr.parentElement;
            if (curr) prosemirrorEditor = curr.querySelector('.ProseMirror, [contenteditable="true"]');
            levels++;
        }
    }
    if (prosemirrorEditor) {
       const text = prosemirrorEditor.textContent?.trim();
       if (text && text.length > 0 && !text.toLowerCase().includes('add a comment') && !text.toLowerCase().includes('aggiungi un commento') && !text.toLowerCase().includes('ajouter un commentaire')) {
         return text;
       }
    }

    const commentEditorSelectors = [
      '.comments-comment-box__form .ql-editor',
      '.comments-comment-box-comment__text-editor .ql-editor',
      '.comments-comment-texteditor .ql-editor'
    ];

    let commentEditor = null;
    for (const selector of commentEditorSelectors) {
      commentEditor = containerForSearch.querySelector(selector);
      if (commentEditor) break;
    }
    if (!commentEditor) return null;

    const text = commentEditor.textContent?.trim();
    if (text && text.length > 0 && !text.toLowerCase().includes('add a comment')) {
      return text;
    }
    return null;
  } catch (error) {
    console.error('Error extracting existing comment text:', error);
    return null;
  }
}

function addSuggestButton(postElement, providedIconContainer = null) {
  if (providedIconContainer && providedIconContainer.querySelector('.replya-sparkle-btn')) {
    return;
  }

  if (!providedIconContainer && postElement && postElement !== document.body && postElement.querySelector('.replya-sparkle-btn')) {
    return;
  }

  let iconContainer = providedIconContainer;

  if (!iconContainer && postElement && postElement !== document.body) {
    iconContainer = postElement.querySelector('.comments-comment-box__detour-container');
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
  }

  if (!iconContainer) return;

  // Ensure iconContainer doesn't wrap and elements stay in a single row
  iconContainer.style.display = 'flex';
  iconContainer.style.flexDirection = 'row';
  iconContainer.style.flexWrap = 'nowrap';
  iconContainer.style.alignItems = 'center';

  const button = document.createElement('button');
  button.className = 'ai-comment-suggest-btn comments-comment-box__detour-icons artdeco-button artdeco-button--circle artdeco-button--muted artdeco-button--2 artdeco-button--tertiary replya-sparkle-btn';
  button.type = 'button';
  button.setAttribute('aria-label', 'Get AI comment suggestions from Replya');
  button.title = 'Replya - AI Comment Suggestions';

  button.innerHTML = `<span class="artdeco-button__icon replya-icon" style="display: flex; align-items: center; justify-content: center;">
    <svg width="16" height="16" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 0 C42.24 0 84.48 0 128 0 C128 42.24 128 84.48 128 128 C85.76 128 43.52 128 0 128 C0 85.76 0 43.52 0 0 Z " fill="#FBFCFE" transform="translate(0,0)"/>
      <path d="M0 0 C42.24 0 84.48 0 128 0 C128 42.24 128 84.48 128 128 C85.76 128 43.52 128 0 128 C0 85.76 0 43.52 0 0 Z M29 21 C27.948125 21.763125 26.89625 22.52625 25.8125 23.3125 C16.93756571 31.79299277 9.25672102 44.72847464 8.69921875 57.19921875 C8.67968737 58.6951901 8.67629478 60.19144311 8.6875 61.6875 C8.69313965 62.47914551 8.6987793 63.27079102 8.70458984 64.08642578 C9.02007368 79.45142565 14.62674122 92.45096664 25.3046875 103.52734375 C29.53773831 107.41070775 33.91776736 110.34149516 39 113 C39.928125 113.50660156 40.85625 114.01320313 41.8125 114.53515625 C53.93823157 120.20330421 69.56026319 120.14381888 82.1875 115.9375 C96.94624383 110.11509447 108.19933013 100.65176536 114.81640625 86.01171875 C120.42197571 71.748042 121.40885038 56.44404173 115.55859375 42.125 C113.17503411 37.34593305 110.31914458 33.17020729 107 29 C106.236875 27.948125 105.47375 26.89625 104.6875 25.8125 C94.99415727 15.66830412 80.45508496 8.93782255 66.39038086 8.56860352 C51.84641766 8.53146746 40.54124151 11.65812715 29 21 Z " fill="#5170FF" transform="translate(0,0)"/>
      <path d="M0 0 C12.4678125 -0.0928125 12.4678125 -0.0928125 25.1875 -0.1875 C27.80453857 -0.21481201 30.42157715 -0.24212402 33.11791992 -0.27026367 C35.19709817 -0.27902725 37.27628157 -0.28667149 39.35546875 -0.29296875 C40.43107056 -0.30831665 41.50667236 -0.32366455 42.61486816 -0.33947754 C52.21697598 -0.34284158 52.21697598 -0.34284158 56 3 C60.08759512 7.33047796 59.51551908 11.71053462 59.5 17.375 C59.52835938 18.30828125 59.55671875 19.2415625 59.5859375 20.203125 C59.59851513 24.64302965 59.54468221 27.9698061 56.71875 31.5390625 C52.35145977 35.49221314 49.61893889 36.24224312 43.75 36.625 C42.13351563 36.73714844 42.13351563 36.73714844 40.484375 36.8515625 C39.66453125 36.90054688 38.8446875 36.94953125 38 37 C43.08312285 43.40569884 43.08312285 43.40569884 50.26953125 46.8203125 C53.17246322 47.03381402 56.0894197 47.03345495 59 47 C59 50.96 59 54.92 59 59 C53.16680349 60.53179431 47.73860033 61.22568456 42 59 C36.60561412 54.92285868 32.10493548 49.98405243 27.66552734 44.91357422 C27.21612289 44.41034134 26.76671844 43.90710846 26.30369568 43.3886261 C25.06622373 41.98945031 23.86099344 40.56195055 22.65795898 39.13305664 C19.51564588 36.22943638 19.51564588 36.22943638 12 36 C12 43.92 12 51.84 12 60 C8.04 60 4.08 60 0 60 C0 40.2 0 20.4 0 0 Z " fill="#5179FE" transform="translate(35,34)"/>
      <path d="M0 0 C11.55 0 23.1 0 35 0 C35 3.63 35 7.26 35 11 C23.45 11 11.9 11 0 11 C0 7.37 0 3.74 0 0 Z " fill="#FEFEFF" transform="translate(47,46)"/>
    </svg>
  </span>
  <span class="artdeco-button__text"></span>`;

  button.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showLoginPrompt();
      return;
    }

    const postText = extractPostText(postElement, iconContainer);
    const posterName = extractPosterName(postElement);
    const existingCommentText = extractExistingCommentText(postElement, iconContainer);

    if (postText || existingCommentText) {
      selectedPostText = postText || '[No specific post text detected]';
      selectedPostElement = iconContainer.closest('.feed-shared-update-v2') || iconContainer.closest('div') || postElement;
      
      window.currentReplyaIconContainer = iconContainer;
      
      selectedPosterName = posterName;

      const cachedData = getCachedSuggestions(selectedPostText);
      if (cachedData) {
        showSuggestionsModal(cachedData.suggestions, cachedData.tone, cachedData.length, cachedData.usePersonalization, cachedData.useEmojis, cachedData.askQuestions);
        return;
      }

      chrome.runtime.sendMessage({
        action: 'suggestComments',
        postText: selectedPostText,
        posterName: posterName,
        existingCommentText: existingCommentText
      });

      showLoadingModal(selectedPostElement);
    } else {
      showErrorModal('Could not extract post context. Please try again.');
    }
  });

  const firstButton = iconContainer.querySelector('button');
  if (firstButton) {
    iconContainer.insertBefore(button, firstButton);
  } else {
    iconContainer.appendChild(button);
  }

}

// Global constants
const LOADING_TIPS = [
  "Did you know? 92% of hiring managers say body language matters as much as your answers. PrePaired AI's video mode helps you practice both - so you show up confident and camera-ready.",
  "The average interviewer decides within the first 7 minutes whether you're a fit. Make those minutes count - PrePaired AI helps you nail your opening pitch every time.",
  "Candidates who practice mock interviews are 3x more likely to receive job offers. With PrePaired AI, you can practice unlimited times until you're interview-perfect.",
  "60% of candidates forget to prepare questions for the interviewer. PrePaired AI's feedback system reminds you what strong candidates always do - ask smart questions back.",
  "Nervous about technical rounds? Practicing out loud reduces interview anxiety by 40%. PrePaired AI's audio mode lets you rehearse anywhere - even on your commute.",
  "Top performers review their mistakes. PrePaired AI gives you instant feedback and analytics so you know exactly where to improve before the real thing.",
  "Tailoring your answers to the job description increases your chances by 50%. PrePaired AI generates personalized questions based on your resume and target role - so every practice feels real.",
  "Consistency beats cramming. Just 15 minutes of daily practice can transform your interview skills. With PrePaired AI, you can train anytime, anywhere - no scheduling needed."
];

// Helper function to show tips in the suggestions area
function showTipsInSuggestions(modal) {
  const suggestionsContainer = modal.querySelector('.suggestions-list-scroll');
  const headerMeta = modal.querySelector('.suggestions-header-meta');

  if (headerMeta) {
    headerMeta.textContent = 'Loading...';
  }

  if (suggestionsContainer) {
    // Clear current content
    suggestionsContainer.innerHTML = `
      <div class="loading-tips-container" style="padding: 16px 24px; background: rgba(20, 100, 192, 0.02); height: 100%; display: flex; flex-direction: column; justify-content: center;">
        <div class="loading-tip-content" style="min-height: 80px; display: flex; flex-direction: column; justify-content: center;">
          <p class="loading-tip-text" style="margin: 0; font-size: 14px; color: #5170ff; line-height: 1.6; font-style: italic; text-align: center; transition: opacity 0.5s ease;"></p>
        </div>
        <div style="text-align: center; margin-top: 20px;">
          <a href="https://prepaired.app" target="_blank" style="font-size: 12px; color: #5170ff; text-decoration: none; opacity: 0.8; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
            Powered by PrePaired AI
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
          </a>
        </div>
      </div>
    `;

    // Initialize tips logic
    const tipElement = suggestionsContainer.querySelector('.loading-tip-text');
    let currentTipIndex = 0;

    function showTip(index) {
      if (!tipElement) return;
      tipElement.style.opacity = '0';
      setTimeout(() => {
        tipElement.textContent = LOADING_TIPS[index];
        tipElement.style.opacity = '1';
      }, 500);
    }

    // Show first tip immediately
    tipElement.textContent = LOADING_TIPS[0];

    // Rotate tips
    const tipInterval = setInterval(() => {
      currentTipIndex = (currentTipIndex + 1) % LOADING_TIPS.length;
      showTip(currentTipIndex);
    }, 5000);

    // Store interval ID on the modal element
    modal.dataset.suggestionTipInterval = tipInterval;
  }
}

// Show loading modal with skeleton
function showLoadingModal(element) {
  const modal = document.createElement('div');
  modal.className = 'ai-comment-modal';
  modal.innerHTML = `
    <div class="ai-comment-modal-content suggestions-card">
      <!-- Card Header -->
      <div class="card-header">
        <h3 class="card-title">
          <div class="loader"></div>
        </h3>
        <div class="card-header-actions">
          <button class="cancel-loader-btn close-btn" aria-label="Close" title="Cancel">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M 4.2382812 2.9882812 A 1.250125 1.250125 0 0 0 3.3671875 5.1347656 L 10.232422 12 L 3.3613281 18.869141 A 1.2512475 1.2512475 0 1 0 5.1308594 20.638672 L 12 13.767578 L 18.865234 20.632812 A 1.250125 1.250125 0 1 0 20.632812 18.865234 L 13.767578 12 L 20.625 5.1425781 A 1.250125 1.250125 0 1 0 18.857422 3.375 L 12 10.232422 L 5.1347656 3.3671875 A 1.250125 1.250125 0 0 0 4.2382812 2.9882812 z"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Loading Tips Section -->
      <div class="loading-tips-container" style="padding: 32px 24px; background: rgba(20, 100, 192, 0.02);">
        <div class="loading-tip-content" style="min-height: 80px; display: flex; flex-direction: column; justify-content: center;">
          <p class="loading-tip-text" style="margin: 0; font-size: 14px; color: #5170ff; line-height: 1.6; font-style: italic; text-align: center; transition: opacity 0.5s ease;"></p>
        </div>
        <div style="text-align: center; margin-top: 20px;">
          <a href="https://prepaired.app" target="_blank" style="font-size: 12px; color: #5170ff; text-decoration: none; opacity: 0.8; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
            Powered by PrePaired AI
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
          </a>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Tips data
  // Using global LOADING_TIPS constant

  // Initialize tips
  const tipElement = modal.querySelector('.loading-tip-text');
  let currentTipIndex = 0;

  function showTip(index) {
    if (!tipElement) return;
    tipElement.style.opacity = '0';
    setTimeout(() => {
      tipElement.textContent = LOADING_TIPS[index];
      tipElement.style.opacity = '1';
    }, 500);
  }

  // Show first tip immediately
  tipElement.textContent = LOADING_TIPS[0];

  // Rotate tips
  const tipInterval = setInterval(() => {
    currentTipIndex = (currentTipIndex + 1) % LOADING_TIPS.length;
    showTip(currentTipIndex);
  }, 5000);

  // Add cancel button handler
  modal.querySelector('.cancel-loader-btn').addEventListener('click', () => {
    // Add visual feedback
    const cancelBtn = modal.querySelector('.cancel-loader-btn');
    cancelBtn.style.opacity = '0.5';
    cancelBtn.disabled = true;

    // Send cancel message to background script
    chrome.runtime.sendMessage({ action: 'cancelRequest' });

    // Clear interval and remove modal after a short delay for feedback
    setTimeout(() => {
      clearInterval(tipInterval);
      modal.remove();
    }, 200);
  });

  // Store interval ID on the modal element so we can clear it if the modal is removed externally
  modal.dataset.tipInterval = tipInterval;
}

// Show suggestions modal
function showSuggestionsModal(suggestions, currentTone = 'professional', currentLength = 'medium', usePersonalization = true, useEmojis = false, askQuestions = false) {

  // Check if modal already exists (for updates)
  let existingModal = document.querySelector('.ai-comment-modal');
  let isUpdate = !!existingModal;

  // Map filter values to display names
  const toneNames = {
    'professional': 'Professional',
    'enthusiastic': 'Enthusiastic',
    'friendly': 'Friendly',
    'thoughtful': 'Thoughtful'
  };

  const lengthNames = {
    'short': 'Short',
    'medium': 'Medium',
    'long': 'Long'
  };

  // If modal exists, check if it has filter controls
  if (isUpdate) {
    const hasFilters = existingModal.querySelector('.filter-controls:not(.skeleton-view)');

    if (hasFilters) {
      // Modal has filters, just update the suggestions list
      const suggestionsContainer = existingModal.querySelector('.suggestions-list-scroll');
      if (suggestionsContainer) {
        // Clear any existing tip interval
        if (existingModal.dataset.suggestionTipInterval) {
          const intervalId = parseInt(existingModal.dataset.suggestionTipInterval);
          if (!isNaN(intervalId)) {
            clearInterval(intervalId);
          }
          delete existingModal.dataset.suggestionTipInterval;
        }

        // Check if we need to restore the list (if tips were showing)
        let suggestionsList = suggestionsContainer.querySelector('.suggestions-list-items');
        if (!suggestionsList) {
          suggestionsContainer.innerHTML = '<ul class="suggestions-list-items"></ul>';
          suggestionsList = suggestionsContainer.querySelector('.suggestions-list-items');
        }

        // Update the suggestions list with smooth transition
        suggestionsList.style.opacity = '0';
        suggestionsList.style.transform = 'translateY(10px)';

        setTimeout(() => {
          suggestionsList.innerHTML = suggestions.map((comment, idx) => `
            <li class="suggestion-list-item">
              <p class="suggestion-text">${comment}</p>
              <div class="suggestion-actions">
                <button class="apply-btn" data-comment="${idx}" aria-label="Apply suggestion" title="Apply to comment field">
                  Apply
                </button>
                <button class="copy-icon-btn" data-comment="${idx}" aria-label="Copy suggestion" title="Copy to clipboard">
                  <svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </button>
              </div>
            </li>
            `).join('');

          // Update header meta
          const headerMeta = existingModal.querySelector('.suggestions-header-meta');
          if (headerMeta) {
            headerMeta.textContent = `${toneNames[currentTone]} · ${lengthNames[currentLength]} `;
          }

          // Update filter active states
          existingModal.querySelectorAll('[data-filter="tone"]').forEach(btn => {
            if (btn.getAttribute('data-value') === currentTone) {
              btn.classList.add('active');
              btn.setAttribute('aria-pressed', 'true');
            } else {
              btn.classList.remove('active');
              btn.setAttribute('aria-pressed', 'false');
            }
          });

          existingModal.querySelectorAll('[data-filter="length"]').forEach(btn => {
            if (btn.getAttribute('data-value') === currentLength) {
              btn.classList.add('active');
              btn.setAttribute('aria-pressed', 'true');
            } else {
              btn.classList.remove('active');
              btn.setAttribute('aria-pressed', 'false');
            }
          });

          // Update checkbox states
          const personalizationCheckbox = existingModal.querySelector('#usePersonalization');
          const emojisCheckbox = existingModal.querySelector('#useEmojis');
          const questionsCheckbox = existingModal.querySelector('#askQuestions');
          if (personalizationCheckbox) personalizationCheckbox.checked = usePersonalization;
          if (emojisCheckbox) emojisCheckbox.checked = useEmojis;
          if (questionsCheckbox) questionsCheckbox.checked = askQuestions;

          // Re-enable all controls after loading
          existingModal.querySelectorAll('.filter-pill, .modal-checkbox').forEach(el => {
            el.disabled = false;
            el.style.opacity = '1';
            el.style.cursor = 'pointer';
          });

          // Re-enable and restore refresh button
          const refreshBtn = existingModal.querySelector('.refresh-btn');
          if (refreshBtn) {
            refreshBtn.disabled = false;
            refreshBtn.style.opacity = '1';
            refreshBtn.style.cursor = 'pointer';
            refreshBtn.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
              </svg>
            `;
          }

          // Reattach event listeners for new buttons
          attachSuggestionEventListeners(existingModal, suggestions);

          // Fade in with animation
          suggestionsList.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          suggestionsList.style.opacity = '1';
          suggestionsList.style.transform = 'translateY(0)';
        }, 150);
      }

      // Successfully updated existing modal, no need to create new one
      return;
    }
  }

  // No existing modal or existing modal doesn't have filters - create new modal

  // Remove existing modal (e.g. loading modal) if it exists but we're creating a new one
  if (existingModal) {
    if (existingModal.dataset.tipInterval) {
      clearInterval(parseInt(existingModal.dataset.tipInterval));
    }
    if (existingModal.dataset.suggestionTipInterval) {
      clearInterval(parseInt(existingModal.dataset.suggestionTipInterval));
    }
    existingModal.remove();
  }

  const modal = document.createElement('div');
  modal.className = 'ai-comment-modal';
  modal.innerHTML = `
    <div class="ai-comment-modal-content suggestions-card">
      <!-- Card Header -->
      <div class="card-header">
        <h3 class="card-title">Comment suggestions</h3>
        <div class="card-header-actions">
          <button class="settings-btn" aria-label="Open settings" title="Settings">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 50 50" fill="currentColor">
              <path d="M 22.205078 2 A 1.0001 1.0001 0 0 0 21.21875 2.8378906 L 20.246094 8.7929688 C 19.076509 9.1331971 17.961243 9.5922728 16.910156 10.164062 L 11.996094 6.6542969 A 1.0001 1.0001 0 0 0 10.708984 6.7597656 L 6.8183594 10.646484 A 1.0001 1.0001 0 0 0 6.7070312 11.927734 L 10.164062 16.873047 C 9.583454 17.930271 9.1142098 19.051824 8.765625 20.232422 L 2.8359375 21.21875 A 1.0001 1.0001 0 0 0 2.0019531 22.205078 L 2.0019531 27.705078 A 1.0001 1.0001 0 0 0 2.8261719 28.691406 L 8.7597656 29.742188 C 9.1064607 30.920739 9.5727226 32.043065 10.154297 33.101562 L 6.6542969 37.998047 A 1.0001 1.0001 0 0 0 6.7597656 39.285156 L 10.648438 43.175781 A 1.0001 1.0001 0 0 0 11.927734 43.289062 L 16.882812 39.820312 C 17.936999 40.39548 19.054994 40.857928 20.228516 41.201172 L 21.21875 47.164062 A 1.0001 1.0001 0 0 0 22.205078 48 L 27.705078 48 A 1.0001 1.0001 0 0 0 28.691406 47.173828 L 29.751953 41.1875 C 30.920633 40.838997 32.033372 40.369697 33.082031 39.791016 L 38.070312 43.291016 A 1.0001 1.0001 0 0 0 39.351562 43.179688 L 43.240234 39.287109 A 1.0001 1.0001 0 0 0 43.34375 37.996094 L 39.787109 33.058594 C 40.355783 32.014958 40.813915 30.908875 41.154297 29.748047 L 47.171875 28.693359 A 1.0001 1.0001 0 0 0 47.998047 27.707031 L 47.998047 22.207031 A 1.0001 1.0001 0 0 0 47.160156 21.220703 L 41.152344 20.238281 C 40.80968 19.078827 40.350281 17.974723 39.78125 16.931641 L 43.289062 11.933594 A 1.0001 1.0001 0 0 0 43.177734 10.652344 L 39.287109 6.7636719 A 1.0001 1.0001 0 0 0 37.996094 6.6601562 L 33.072266 10.201172 C 32.023186 9.6248101 30.909713 9.1579916 29.738281 8.8125 L 28.691406 2.828125 A 1.0001 1.0001 0 0 0 27.705078 2 L 22.205078 2 z M 23.056641 4 L 26.865234 4 L 27.861328 9.6855469 A 1.0001 1.0001 0 0 0 28.603516 10.484375 C 30.066026 10.848832 31.439607 11.426549 32.693359 12.185547 A 1.0001 1.0001 0 0 0 33.794922 12.142578 L 38.474609 8.7792969 L 41.167969 11.472656 L 37.835938 16.220703 A 1.0001 1.0001 0 0 0 37.796875 17.310547 C 38.548366 18.561471 39.118333 19.926379 39.482422 21.380859 A 1.0001 1.0001 0 0 0 40.291016 22.125 L 45.998047 23.058594 L 45.998047 26.867188 L 40.279297 27.871094 A 1.0001 1.0001 0 0 0 39.482422 28.617188 C 39.122545 30.069817 38.552234 31.434687 37.800781 32.685547 A 1.0001 1.0001 0 0 0 37.845703 33.785156 L 41.224609 38.474609 L 38.53125 41.169922 L 33.791016 37.84375 A 1.0001 1.0001 0 0 0 32.697266 37.808594 C 31.44975 38.567585 30.074755 39.148028 28.617188 39.517578 A 1.0001 1.0001 0 0 0 27.876953 40.3125 L 26.867188 46 L 23.052734 46 L 22.111328 40.337891 A 1.0001 1.0001 0 0 0 21.365234 39.53125 C 19.90185 39.170557 18.522094 38.59371 17.259766 37.835938 A 1.0001 1.0001 0 0 0 16.171875 37.875 L 11.46875 41.169922 L 8.7734375 38.470703 L 12.097656 33.824219 A 1.0001 1.0001 0 0 0 12.138672 32.724609 C 11.372652 31.458855 10.793319 30.079213 10.427734 28.609375 A 1.0001 1.0001 0 0 0 9.6328125 27.867188 L 4.0019531 26.867188 L 4.0019531 23.052734 L 9.6289062 22.117188 A 1.0001 1.0001 0 0 0 10.435547 21.373047 C 10.804273 19.898143 11.383325 18.518729 12.146484 17.255859 A 1.0001 1.0001 0 0 0 12.111328 16.164062 L 8.8261719 11.46875 L 11.523438 8.7734375 L 16.185547 12.105469 A 1.0001 1.0001 0 0 0 17.28125 12.148438 C 18.536908 11.394293 19.919867 10.822081 21.384766 10.462891 A 1.0001 1.0001 0 0 0 22.132812 9.6523438 L 23.056641 4 z M 25 17 C 20.593567 17 17 20.593567 17 25 C 17 29.406433 20.593567 33 25 33 C 29.406433 33 33 29.406433 33 25 C 33 20.593567 29.406433 17 25 17 z M 25 19 C 28.325553 19 31 21.674447 31 25 C 31 28.325553 28.325553 31 25 31 C 21.674447 31 19 28.325553 19 25 C 19 21.674447 21.674447 19 25 19 z"></path>
            </svg>
          </button>
          <button class="close-btn" aria-label="Close" title="Close">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M 4.2382812 2.9882812 A 1.250125 1.250125 0 0 0 3.3671875 5.1347656 L 10.232422 12 L 3.3613281 18.869141 A 1.2512475 1.2512475 0 1 0 5.1308594 20.638672 L 12 13.767578 L 18.865234 20.632812 A 1.250125 1.250125 0 1 0 20.632812 18.865234 L 13.767578 12 L 20.625 5.1425781 A 1.250125 1.250125 0 1 0 18.857422 3.375 L 12 10.232422 L 5.1347656 3.3671875 A 1.250125 1.250125 0 0 0 4.2382812 2.9882812 z"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Filter Controls -->
      <div class="filter-controls">
        <!-- Tone Section -->
        <div class="filter-group">
          <div class="filter-label">Tone</div>
          <div class="filter-buttons" role="group" aria-label="Select tone">
            <button class="filter-pill ${currentTone === 'professional' ? 'active' : ''}" data-filter="tone" data-value="professional" aria-pressed="${currentTone === 'professional'}" title="Use professional tone">
              Professional
            </button>
            <button class="filter-pill ${currentTone === 'enthusiastic' ? 'active' : ''}" data-filter="tone" data-value="enthusiastic" aria-pressed="${currentTone === 'enthusiastic'}" title="Use enthusiastic tone">
              Enthusiastic
            </button>
            <button class="filter-pill ${currentTone === 'friendly' ? 'active' : ''}" data-filter="tone" data-value="friendly" aria-pressed="${currentTone === 'friendly'}" title="Use friendly tone">
              Friendly
            </button>
            <button class="filter-pill ${currentTone === 'thoughtful' ? 'active' : ''}" data-filter="tone" data-value="thoughtful" aria-pressed="${currentTone === 'thoughtful'}" title="Use thoughtful tone">
              Thoughtful
            </button>
          </div>
        </div>
        
        <!-- Length Section -->
        <div class="filter-group">
          <div class="filter-label">Length</div>
          <div class="filter-buttons" role="group" aria-label="Select length">
            <button class="filter-pill ${currentLength === 'short' ? 'active' : ''}" data-filter="length" data-value="short" aria-pressed="${currentLength === 'short'}" title="Short comments (5-15 words)">
              Short
            </button>
            <button class="filter-pill ${currentLength === 'medium' ? 'active' : ''}" data-filter="length" data-value="medium" aria-pressed="${currentLength === 'medium'}" title="Medium comments (20-35 words)">
              Medium
            </button>
            <button class="filter-pill ${currentLength === 'long' ? 'active' : ''}" data-filter="length" data-value="long" aria-pressed="${currentLength === 'long'}" title="Long comments (50-60 words)">
              Long
            </button>
          </div>
        </div>
        
        <!-- Options Section -->
        <div class="filter-group">
          <div class="filter-label">Options</div>
          <div class="filter-options" role="group" aria-label="Select options">
            <label class="option-checkbox" title="Use OP's name in comments">
              <input type="checkbox" class="modal-checkbox" id="usePersonalization" ${usePersonalization ? 'checked' : ''}>
              <span>Use personalization</span>
            </label>
            <label class="option-checkbox" title="Add relevant emojis to comments">
              <input type="checkbox" class="modal-checkbox" id="useEmojis" ${useEmojis ? 'checked' : ''}>
              <span>Include emojis</span>
            </label>
            <label class="option-checkbox" title="End comments with engaging questions">
              <input type="checkbox" class="modal-checkbox" id="askQuestions" ${askQuestions ? 'checked' : ''}>
              <span>Ask questions</span>
            </label>
          </div>
        </div>
      </div>
      
      <!-- Suggestions Container -->
          <div class="suggestions-container">
            <div class="suggestions-header">
              <div class="suggestions-header-title">Suggestions</div>
              <div class="suggestions-header-right">
                <div class="suggestions-header-meta">${toneNames[currentTone]} · ${lengthNames[currentLength]}</div>
                <button class="refresh-btn" aria-label="Refresh suggestions" title="Regenerate with current settings">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                  </svg>
                </button>
              </div>
            </div>
            <div class="suggestions-list-scroll">
              <ul class="suggestions-list-items">
                ${suggestions.map((comment, idx) => `
              <li class="suggestion-list-item">
                <p class="suggestion-text">${comment}</p>
                <div class="suggestion-actions">
                  <button class="apply-btn" data-comment="${idx}" aria-label="Apply suggestion" title="Apply to comment field">
                    Apply
                  </button>
                  <button class="copy-icon-btn" data-comment="${idx}" aria-label="Copy suggestion" title="Copy to clipboard">
                    <svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </button>
                </div>
              </li>
            `).join('')}
            </ul>
            </div>
          </div>
          
      <!-- Review Request Section (conditionally shown) -->
      <div class="review-request-section" id="reviewRequestSection" style="display: none;">
        <div class="review-request-text">
          <span class="review-request-title">Loving Replya?</span>
          <span class="review-request-divider"></span>
          <span class="review-request-subtitle">Help others discover it too</span>
        </div>
        <a href="https://chromewebstore.google.com/detail/gfgokbpklbgiffpdbacdgngfcjjodiao/reviews?utm_source=review-bottom-btn" target="_blank" class="review-request-link" id="reviewLink">
          <span class="review-link-text">Leave a review</span>
          <svg width="14" height="14" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="7 17 17 7"></polyline>
            <polyline points="7 7 17 7 17 17"></polyline>
          </svg>
        </a>
      </div>
    </div >
            `;

  document.body.appendChild(modal);

  // Add focus trap for accessibility
  const modalContent = modal.querySelector('.ai-comment-modal-content');
  if (modalContent) {
    // Get all focusable elements
    const focusableElements = modalContent.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    // Focus first element
    setTimeout(() => firstFocusable?.focus(), 100);

    // Trap focus within modal
    modalContent.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable?.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable?.focus();
          }
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cleanupAndRemove();
      }
    });
  }

  // Attach event listeners to the modal
  attachModalEventListeners(modal, currentTone, currentLength, usePersonalization, useEmojis, askQuestions);

  // Check if review section should be shown and display it
  shouldShowReviewRequest().then(shouldShow => {
    const reviewSection = modal.querySelector('#reviewRequestSection');
    if (reviewSection && shouldShow) {
      reviewSection.style.display = 'flex';

      // Add click listener to the review link
      const reviewLink = modal.querySelector('#reviewLink');
      if (reviewLink) {
        reviewLink.addEventListener('click', () => {
          // Set flag to check when user returns to this tab
          pendingReviewCheck = true;
          console.log('Review link clicked, will check when user returns');
        });
      }
    }
  });

  // Attach suggestion-specific event listeners
  attachSuggestionEventListeners(modal, suggestions);
}

// Helper function to attach event listeners to suggestion items
function attachSuggestionEventListeners(modal, suggestions) {
  modal.querySelectorAll('.apply-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = btn.getAttribute('data-comment');
      const comment = suggestions[idx];

      // Apply comment to the comment field
      if (applyCommentToField(comment)) {
        // Show success feedback
        btn.textContent = 'Applied!';
        btn.style.backgroundColor = '#10b981';

        // Close modal after a short delay
        setTimeout(() => {
          modal.remove();
        }, 800);
      } else {
        // Show error feedback
        btn.textContent = 'Error';
        btn.style.backgroundColor = '#ef4444';

        setTimeout(() => {
          btn.textContent = 'Apply';
          btn.style.backgroundColor = '';
        }, 2000);
      }
    });
  });

  modal.querySelectorAll('.copy-icon-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const idx = btn.getAttribute('data-comment');
      const success = await copyToClipboard(suggestions[idx]);

      if (success) {
        // Show check icon on success
        btn.innerHTML = `
        <svg class="check-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;

        setTimeout(() => {
          btn.innerHTML = `
          <svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        `;
        }, 2000);
      } else {
        // Show error feedback
        btn.innerHTML = `
        <svg class="error-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      `;

        setTimeout(() => {
          btn.innerHTML = `
          <svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        `;
        }, 2000);
      }
    });
  });
}

// Helper function to attach main modal event listeners
function attachModalEventListeners(modal, currentTone, currentLength, usePersonalization, useEmojis, askQuestions) {
  // Store current filters and options
  let selectedTone = currentTone;
  let selectedLength = currentLength;
  let selectedPersonalization = usePersonalization;
  let selectedEmojis = useEmojis;
  let selectedQuestions = askQuestions;

  // Map filter values to display names
  const toneNames = {
    'professional': 'Professional',
    'enthusiastic': 'Enthusiastic',
    'friendly': 'Friendly',
    'thoughtful': 'Thoughtful'
  };

  const lengthNames = {
    'short': 'Short',
    'medium': 'Medium',
    'long': 'Long'
  };

  // Helper function to clean up and remove modal
  const cleanupAndRemove = () => {
    // Clear any tip intervals
    if (modal.dataset.tipInterval) {
      const intervalId = parseInt(modal.dataset.tipInterval);
      if (!isNaN(intervalId)) {
        clearInterval(intervalId);
      }
    }
    if (modal.dataset.suggestionTipInterval) {
      const intervalId = parseInt(modal.dataset.suggestionTipInterval);
      if (!isNaN(intervalId)) {
        clearInterval(intervalId);
      }
    }
    modal.remove();
  };

  // Add event listeners
  modal.querySelector('.close-btn').addEventListener('click', cleanupAndRemove);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) cleanupAndRemove();
  });

  // Settings button handler
  const settingsBtn = modal.querySelector('.settings-btn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      // Close the modal before opening settings
      cleanupAndRemove();
      // Open settings page in a new tab
      chrome.runtime.sendMessage({ action: 'openSettings' });
    });
  }

  // Filter button handlers
  modal.querySelectorAll('.filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const filterType = btn.getAttribute('data-filter');
      const filterValue = btn.getAttribute('data-value');

      // Update selected filter
      if (filterType === 'tone') {
        selectedTone = filterValue;
        // Update active state for tone buttons
        modal.querySelectorAll('[data-filter="tone"]').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
      } else if (filterType === 'length') {
        selectedLength = filterValue;
        // Update active state for length buttons
        modal.querySelectorAll('[data-filter="length"]').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
      }

      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      // Update header meta to show current selections
      const headerMeta = modal.querySelector('.suggestions-header-meta');
      if (headerMeta) {
        headerMeta.textContent = `${toneNames[selectedTone]} · ${lengthNames[selectedLength]} `;
      }
    });

    // Add keyboard navigation support
    btn.addEventListener('keydown', (e) => {
      const filterType = btn.getAttribute('data-filter');
      const filterButtons = Array.from(modal.querySelectorAll(`[data-filter="${filterType}"]`));
      const currentIndex = filterButtons.indexOf(btn);

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % filterButtons.length;
        filterButtons[nextIndex].focus();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + filterButtons.length) % filterButtons.length;
        filterButtons[prevIndex].focus();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });

  // Checkbox handlers
  const personalizationCheckbox = modal.querySelector('#usePersonalization');
  const emojisCheckbox = modal.querySelector('#useEmojis');
  const questionsCheckbox = modal.querySelector('#askQuestions');

  personalizationCheckbox.addEventListener('change', (e) => {
    selectedPersonalization = e.target.checked;
  });

  emojisCheckbox.addEventListener('change', (e) => {
    selectedEmojis = e.target.checked;
  });

  questionsCheckbox.addEventListener('change', (e) => {
    selectedQuestions = e.target.checked;
  });

  // Refresh button handler
  const refreshBtn = modal.querySelector('.refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      // Disable refresh button and show spinner
      refreshBtn.disabled = true;
      refreshBtn.style.opacity = '0.5';
      refreshBtn.style.cursor = 'not-allowed';
      refreshBtn.innerHTML = `
        <svg class="refresh-spinner" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;">
          <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
        </svg>
      `;

      // Disable all filter controls during loading
      modal.querySelectorAll('.filter-pill, .modal-checkbox').forEach(el => {
        el.disabled = true;
        el.style.opacity = '0.5';
        el.style.cursor = 'not-allowed';
      });

      // Show tips in suggestions area
      showTipsInSuggestions(modal);

      // Update header meta
      const headerMeta = modal.querySelector('.suggestions-header-meta');
      if (headerMeta) {
        headerMeta.textContent = 'Loading...';
      }

      // Regenerate suggestions with all current selections
      regenerateSuggestions(selectedTone, selectedLength, selectedPersonalization, selectedEmojis, selectedQuestions);
    });
  }
}

// Helper function to show skeleton loading in the suggestions area only
function showSkeletonInSuggestions(modal) {
  const suggestionsList = modal.querySelector('.suggestions-list-items');
  const headerMeta = modal.querySelector('.suggestions-header-meta');

  if (headerMeta) {
    headerMeta.textContent = 'Loading...';
  }

  if (suggestionsList) {
    suggestionsList.innerHTML = `
      <li class="suggestion-list-item skeleton-item">
        <div class="skeleton-text">
          <div class="skeleton skeleton-line"></div>
          <div class="skeleton skeleton-line" style="width: 90%;"></div>
          <div class="skeleton skeleton-line" style="width: 70%;"></div>
        </div>
        <div class="suggestion-actions">
          <div class="skeleton skeleton-button"></div>
          <div class="skeleton skeleton-icon"></div>
        </div>
      </li>
      <li class="suggestion-list-item skeleton-item">
        <div class="skeleton-text">
          <div class="skeleton skeleton-line"></div>
          <div class="skeleton skeleton-line" style="width: 85%;"></div>
          <div class="skeleton skeleton-line" style="width: 75%;"></div>
        </div>
        <div class="suggestion-actions">
          <div class="skeleton skeleton-button"></div>
          <div class="skeleton skeleton-icon"></div>
        </div>
      </li>
      <li class="suggestion-list-item skeleton-item">
        <div class="skeleton-text">
          <div class="skeleton skeleton-line"></div>
          <div class="skeleton skeleton-line" style="width: 95%;"></div>
          <div class="skeleton skeleton-line" style="width: 80%;"></div>
        </div>
        <div class="suggestion-actions">
          <div class="skeleton skeleton-button"></div>
          <div class="skeleton skeleton-icon"></div>
        </div>
      </li>
  `;
  }
}

// Regenerate suggestions with new filters
function regenerateSuggestions(tone, length, usePersonalization, useEmojis, askQuestions) {
  if (!selectedPostText) {
    console.error('No post text available');
    return;
  }

  console.log('Regenerating with tone:', tone, 'length:', length, 'personalization:', usePersonalization, 'emojis:', useEmojis, 'questions:', askQuestions);

  // Extract existing comment text from the selected post
  const existingCommentText = selectedPostElement ? extractExistingCommentText(selectedPostElement) : null;
  if (existingCommentText) {
    console.log('Using existing comment as context:', existingCommentText);
  }

  // Don't remove the modal - just show skeleton in suggestions area
  // The modal will be updated when new suggestions arrive

  // Send message to background script with new parameters
  chrome.runtime.sendMessage({
    action: 'suggestComments',
    postText: selectedPostText,
    tone: tone,
    length: length,
    usePersonalization: usePersonalization,
    useEmojis: useEmojis,
    askQuestions: askQuestions,
    posterName: selectedPosterName,
    existingCommentText: existingCommentText
  });
}

// Copy to clipboard
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    // Fallback method for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    } catch (fallbackError) {
      console.error('Fallback copy failed:', fallbackError);
      return false;
    }
  }
}

// Apply comment to LinkedIn's comment field
function applyCommentToField(commentText) {
  try {
    let commentEditor = null;
    let iconContainer = window.currentReplyaIconContainer;
    
    if (iconContainer) {
      let wrapper = iconContainer.closest('.comments-comment-box__form') || 
                    iconContainer.closest('form') ||
                    iconContainer.parentElement;
      if (wrapper) {
        commentEditor = wrapper.querySelector('.ProseMirror, .ql-editor, [contenteditable="true"]');
        // Handle deeply nested structures where parentElement wasn't high enough
        let curr = wrapper;
        let levels = 0;
        while (!commentEditor && curr && levels < 5) {
            curr = curr.parentElement;
            if (curr) commentEditor = curr.querySelector('.ProseMirror, .ql-editor, [contenteditable="true"]');
            levels++;
        }
      }
    }
    
    if (!commentEditor && selectedPostElement) {
      const commentEditorSelectors = [
        '.comments-comment-box__form .ql-editor',
        '.comments-comment-box-comment__text-editor .ql-editor',
        '.comments-comment-texteditor .ql-editor',
        '.ProseMirror',
        '[contenteditable="true"]'
      ];
      for (const selector of commentEditorSelectors) {
        commentEditor = selectedPostElement.querySelector(selector);
        if (commentEditor) break;
      }
    }

    if (!commentEditor) {
      console.error('Could not find comment editor');
      return false;
    }

    commentEditor.innerHTML = '';
    const paragraph = document.createElement('p');
    paragraph.textContent = commentText;
    commentEditor.appendChild(paragraph);

    const inputEvent = new Event('input', { bubbles: true, cancelable: true });
    commentEditor.dispatchEvent(inputEvent);

    const changeEvent = new Event('change', { bubbles: true, cancelable: true });
    commentEditor.dispatchEvent(changeEvent);

    commentEditor.focus();
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(commentEditor);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);

    console.log('Comment applied successfully');
    return true;
  } catch (error) {
    console.error('Error applying comment:', error);
    return false;
  }
}

// Show error modal
function showErrorModal(error) {
  // Remove all existing modals (loading or suggestions)
  const existingModals = document.querySelectorAll('.ai-comment-modal');
  existingModals.forEach(modal => {
    if (modal.dataset.tipInterval) {
      clearInterval(parseInt(modal.dataset.tipInterval));
    }
    modal.remove();
  });

  const modal = document.createElement('div');
  modal.className = 'ai-comment-modal';
  modal.innerHTML = `
    <div class="ai-comment-modal-content error">
      <h3>⚠️ Error</h3>
      <p>${error}</p>
      <div style="display: flex; gap: 8px; margin-top: 16px;">
        <button class="retry-btn-error" title="Try generating suggestions again" style="flex: 1; background: #5170ff; color: white; border: none; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-weight: 600;">
          Retry
        </button>
        <button class="close-btn-error" title="Close error message" style="flex: 1; background: #e5e7eb; color: #374151; border: none; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-weight: 600;">
          Close
        </button>
      </div>
      <button class="replya-having-issues-error-btn" title="Manually configure element detection" style="margin-top: 12px; width: 100%; background: transparent; color: #5170ff; border: 1.5px solid rgba(81, 112, 255, 0.3); padding: 10px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s ease;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
        Having Issues? Fix Detection
      </button>
    </div>
  `;

  document.body.appendChild(modal);

  // Add retry handler
  modal.querySelector('.retry-btn-error').addEventListener('click', () => {
    modal.remove();
    // Retry the last request if we have the post text
    if (selectedPostText && selectedPostElement) {
      const existingCommentText = extractExistingCommentText(selectedPostElement);
      chrome.runtime.sendMessage({
        action: 'suggestComments',
        postText: selectedPostText,
        posterName: selectedPosterName,
        existingCommentText: existingCommentText
      });
      showLoadingModal(selectedPostElement);
    }
  });

  modal.querySelector('.close-btn-error').addEventListener('click', () => modal.remove());

  // Having Issues handler — launches wizard
  modal.querySelector('.replya-having-issues-error-btn').addEventListener('click', () => {
    modal.remove();
    startDomSelectorWizard();
  });

  // Close on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message from background:', message);

  if (message.action === 'showSuggestions') {
    if (message.suggestions && Array.isArray(message.suggestions) && message.suggestions.length > 0) {
      // Cache the suggestions with the current post text
      const tone = message.tone || 'professional';
      const length = message.length || 'medium';
      const usePersonalization = message.usePersonalization !== undefined ? message.usePersonalization : true;
      const useEmojis = message.useEmojis !== undefined ? message.useEmojis : false;
      const askQuestions = message.askQuestions !== undefined ? message.askQuestions : false;

      saveCachedSuggestions(
        selectedPostText,
        message.suggestions,
        tone,
        length,
        usePersonalization,
        useEmojis,
        askQuestions
      );

      // Pass tone, length, and user preferences from message to maintain state
      showSuggestionsModal(
        message.suggestions,
        tone,
        length,
        usePersonalization,
        useEmojis,
        askQuestions
      );
    } else {
      showErrorModal('No suggestions were generated. Please try again.');
    }
  } else if (message.action === 'showError') {
    showErrorModal(message.error);
  } else if (message.action === 'authStateChanged') {
    // Update authentication state when user logs in/out
    isAuthenticated = message.isAuthenticated;
    console.log('Auth state changed in content script:', isAuthenticated);

    addButtonsToPosts();
  } else if (message.action === 'startSelectorWizard') {
    // Triggered from popup's "Having Issues?" button
    console.log('Starting selector wizard from popup trigger');
    startDomSelectorWizard();
    sendResponse({ success: true });
  } else if (message.action === 'customSelectorsUpdated') {
    // Reload selectors from storage
    loadCustomSelectors();
  }
});

// Observe DOM for new posts and comment boxes
const observer = new MutationObserver((mutations) => {
  let shouldUpdate = false;
  for (const m of mutations) {
    if (m.addedNodes.length > 0) {
      shouldUpdate = true;
      break;
    }
  }
  
  if (shouldUpdate) {
    addButtonsToPosts();
  }
});

// Start observing
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Check authentication and initialize
checkAuthStatus();

// Initial scan after auth check
setTimeout(() => {
  addButtonsToPosts();
}, 2000);

// Additional scan when user interacts with posts (comment boxes appear)
document.addEventListener('click', (e) => {
  if (e.target.closest('.social-details-social-activity') ||
      e.target.closest('.comments-comment-box-comment__text-editor') ||
      e.target.closest('button[aria-label*="comment" i]')) {
    setTimeout(() => {
      addButtonsToPosts();
    }, 500);
  }
}, true);

// ═══════════════════════════════════════════
// Having Issues? — DOM Selector Wizard
// ═══════════════════════════════════════════

// Generate a robust CSS selector path for a clicked element
function generateSelectorPath(element) {
  if (!element || element === document.body || element === document.documentElement) return '';
  const parts = [];
  let current = element;
  let depth = 0;
  const MAX_DEPTH = 8;

  while (current && current !== document.body && current !== document.documentElement && depth < MAX_DEPTH) {
    let selector = current.tagName.toLowerCase();

    // Prefer id (it's unique)
    if (current.id) {
      parts.unshift('#' + CSS.escape(current.id));
      break;
    }

    // Use meaningful class names (skip generic ones)
    const classes = Array.from(current.classList || []).filter(c =>
      !c.startsWith('ember') && !c.startsWith('artdeco') && c.length > 2 && c.length < 60
    );
    if (classes.length > 0) {
      selector += '.' + classes.slice(0, 2).map(c => CSS.escape(c)).join('.');
    }

    // Add data attributes if present
    for (const attr of ['data-testid', 'data-view-name', 'data-urn', 'role']) {
      if (current.hasAttribute(attr)) {
        const val = current.getAttribute(attr);
        if (val && val.length < 80) {
          selector += `[${attr}="${CSS.escape(val)}"]`;
          break;
        }
      }
    }

    // Add nth-child for disambiguation if parent has multiple same-tag children
    const parent = current.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(c => c.tagName === current.tagName);
      if (siblings.length > 1) {
        const idx = siblings.indexOf(current) + 1;
        selector += `:nth-child(${idx})`;
      }
    }

    parts.unshift(selector);
    current = current.parentElement;
    depth++;
  }

  return parts.join(' > ');
}

// Start the interactive DOM selector wizard
function startDomSelectorWizard(targetPost = null) {
  // Remove any existing wizard
  document.querySelectorAll('.replya-selector-overlay, .replya-wizard-banner, .replya-wizard-confirm-modal').forEach(el => el.remove());
  document.querySelectorAll('.replya-selector-highlight, .replya-selector-selected, .replya-wizard-post-border').forEach(el => {
    el.classList.remove('replya-selector-highlight', 'replya-selector-selected', 'replya-wizard-post-border');
  });

  // Show pre-wizard instruction modal
  const preModal = document.createElement('div');
  preModal.className = 'replya-wizard-confirm-modal';
  preModal.innerHTML = `
    <div class="replya-wizard-confirm-content">
      <h3 class="replya-wizard-confirm-title">Before We Start</h3>
      <p class="replya-wizard-confirm-subtitle">Please <strong>open a comment box</strong> on any post before proceeding. The mapping process will need you to select the emoji/icon area inside an open comment box.</p>
      <p style="font-size: 13px !important; color: #9ca3af !important; margin: 0 0 20px 0 !important;">Once the wizard starts, you won't be able to click other buttons on the page.</p>
      <div class="replya-wizard-confirm-buttons">
        <button class="replya-wizard-save-btn" id="replya-prewiz-yes">Yes, I've opened it</button>
        <button class="replya-wizard-retry-btn" id="replya-prewiz-no">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(preModal);

  preModal.querySelector('#replya-prewiz-no').addEventListener('click', () => preModal.remove());
  preModal.addEventListener('click', (e) => { if (e.target === preModal) preModal.remove(); });
  preModal.querySelector('#replya-prewiz-yes').addEventListener('click', () => {
    preModal.remove();
    _runSelectorWizard(targetPost);
  });
}

// Internal: actual wizard logic (called after pre-wizard confirmation)
function _runSelectorWizard(targetPost = null) {

  const STEPS = [
    { key: 'authorName', label: 'Author Name', instruction: 'Click on the post author\'s name' },
    { key: 'postContent', label: 'Post Content', instruction: 'Click on the main post text/content area' },
    { key: 'iconContainer', label: 'Comment Box Icons', instruction: 'Open a comment box first, then click on the emoji/icon area near it' },
  ];

  let currentStep = 0;
  const collectedSelectors = {};
  const selectedElements = [];
  let lastHighlighted = null;

  // Find target post context
  let postElement = targetPost;
  if (!postElement) {
    // Find the first visible post on the feed
    postElement = document.querySelector('.feed-shared-update-v2') || 
                  document.querySelector('[data-urn^="urn:li:activity:"]') ||
                  document.querySelector('div[data-id]');
  }
  if (postElement) {
    postElement.classList.add('replya-wizard-post-border');
    postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Create overlay — pointer-events:none so clicks pass through to actual page elements
  const overlay = document.createElement('div');
  overlay.className = 'replya-selector-overlay';
  document.body.appendChild(overlay);

  // Create banner — pointer-events:auto so cancel button is clickable
  const banner = document.createElement('div');
  banner.className = 'replya-wizard-banner';
  function updateBanner() {
    const step = STEPS[currentStep];
    banner.innerHTML = `
      <div class="replya-wizard-banner-left">
        <span class="replya-wizard-step-badge">STEP ${currentStep + 1}/${STEPS.length}</span>
        <span class="replya-wizard-instruction">${step.instruction}</span>
      </div>
      <button class="replya-wizard-cancel-btn">Cancel</button>
    `;
    banner.querySelector('.replya-wizard-cancel-btn').addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      cleanup();
    });
  }
  updateBanner();
  document.body.appendChild(banner);

  // Helper: check if an element is part of the wizard UI
  function isWizardUI(el) {
    if (!el) return false;
    return el === overlay || el === banner || banner.contains(el) ||
           el.classList.contains('replya-selector-overlay') ||
           el.classList.contains('replya-wizard-banner') ||
           el.closest('.replya-wizard-banner');
  }

  // Hover handler
  function onMouseOver(e) {
    const target = e.target;
    if (!target || isWizardUI(target)) return;
    if (target.classList.contains('replya-selector-selected')) return;

    // Remove previous highlight
    if (lastHighlighted && lastHighlighted !== target) {
      lastHighlighted.classList.remove('replya-selector-highlight');
    }
    target.classList.add('replya-selector-highlight');
    lastHighlighted = target;
  }

  function onMouseOut(e) {
    if (e.target && e.target.classList && !isWizardUI(e.target)) {
      e.target.classList.remove('replya-selector-highlight');
    }
  }

  // Click handler
  function onClick(e) {
    const target = e.target;
    // Let banner/cancel button clicks through to their own handlers
    if (!target || isWizardUI(target)) return;

    e.preventDefault();
    e.stopPropagation();

    // Remove highlight, add selected
    target.classList.remove('replya-selector-highlight');
    target.classList.add('replya-selector-selected');
    selectedElements.push(target);

    // Generate selector
    const selector = generateSelectorPath(target);
    collectedSelectors[STEPS[currentStep].key] = selector;
    console.log(`Step ${currentStep + 1} (${STEPS[currentStep].key}):`, selector);

    currentStep++;

    if (currentStep < STEPS.length) {
      // Move to next step
      updateBanner();
    } else {
      // All steps done — show confirmation
      removeListeners();
      overlay.remove();
      banner.remove();
      showWizardConfirmation(collectedSelectors, selectedElements, postElement);
    }
  }

  // Attach listeners with capture so we intercept before LinkedIn's own handlers
  document.addEventListener('mouseover', onMouseOver, true);
  document.addEventListener('mouseout', onMouseOut, true);
  document.addEventListener('click', onClick, true);

  function removeListeners() {
    document.removeEventListener('mouseover', onMouseOver, true);
    document.removeEventListener('mouseout', onMouseOut, true);
    document.removeEventListener('click', onClick, true);
  }

  function cleanup() {
    removeListeners();
    overlay.remove();
    banner.remove();
    if (lastHighlighted) lastHighlighted.classList.remove('replya-selector-highlight');
    selectedElements.forEach(el => el.classList.remove('replya-selector-selected'));
    if (postElement) postElement.classList.remove('replya-wizard-post-border');
    document.querySelectorAll('.replya-wizard-confirm-modal').forEach(el => el.remove());
  }
}

// Show confirmation modal after all wizard steps
function showWizardConfirmation(selectors, selectedElements, postElement) {
  const modal = document.createElement('div');
  modal.className = 'replya-wizard-confirm-modal';
  modal.innerHTML = `
    <div class="replya-wizard-confirm-content">
      <h3 class="replya-wizard-confirm-title">✅ Elements Captured</h3>
      <p class="replya-wizard-confirm-subtitle">We've recorded the DOM structure. Save to apply this configuration?</p>
      <ul class="replya-wizard-confirm-items">
        <li class="replya-wizard-confirm-item">
          <span class="replya-wizard-confirm-item-icon">✓</span>
          <span class="replya-wizard-confirm-item-label">Author Name</span>
          <span class="replya-wizard-confirm-item-value" title="${selectors.authorName}">${selectors.authorName}</span>
        </li>
        <li class="replya-wizard-confirm-item">
          <span class="replya-wizard-confirm-item-icon">✓</span>
          <span class="replya-wizard-confirm-item-label">Post Content</span>
          <span class="replya-wizard-confirm-item-value" title="${selectors.postContent}">${selectors.postContent}</span>
        </li>
        <li class="replya-wizard-confirm-item">
          <span class="replya-wizard-confirm-item-icon">✓</span>
          <span class="replya-wizard-confirm-item-label">Comment Icons</span>
          <span class="replya-wizard-confirm-item-value" title="${selectors.iconContainer}">${selectors.iconContainer}</span>
        </li>
      </ul>
      <div class="replya-wizard-confirm-buttons">
        <button class="replya-wizard-save-btn">Save & Apply</button>
        <button class="replya-wizard-retry-btn">Try Again</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Save handler
  modal.querySelector('.replya-wizard-save-btn').addEventListener('click', () => {
    // Save to local storage
    chrome.storage.local.set({ customDomSelectors: selectors }, () => {
      customDomSelectors = selectors;
      console.log('Custom DOM selectors saved:', selectors);
    });

    // Save to backend via background script
    chrome.runtime.sendMessage({
      action: 'saveDomStructure',
      selectors: selectors
    });

    // Cleanup UI
    modal.remove();
    selectedElements.forEach(el => el.classList.remove('replya-selector-selected'));
    if (postElement) postElement.classList.remove('replya-wizard-post-border');

    // Re-scan posts with new selectors
    removeAllButtons();
    setTimeout(() => addButtonsToPosts(), 500);
  });

  // Retry handler
  modal.querySelector('.replya-wizard-retry-btn').addEventListener('click', () => {
    modal.remove();
    selectedElements.forEach(el => el.classList.remove('replya-selector-selected'));
    if (postElement) postElement.classList.remove('replya-wizard-post-border');
    startDomSelectorWizard();
  });

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
      selectedElements.forEach(el => el.classList.remove('replya-selector-selected'));
      if (postElement) postElement.classList.remove('replya-wizard-post-border');
    }
  });
}

console.log('Replya - LinkedIn AI Assistant content script loaded');