/**
 * Walkthrough Module - Compact user onboarding
 * Quick tips positioned top-right, detailed guide in Settings
 */

// Compact walkthrough steps (3-4 lines max each)
const walkthroughSteps = [
    {
        id: 'welcome',
        title: '👋 Welcome!',
        content: 'This quick tour shows you the basics.<br>Detailed guides are in <strong>Settings → Help</strong>.',
        tab: null
    },
    {
        id: 'dashboard',
        title: '📊 Dashboard',
        content: 'Your stats hub. See engagements, usage limits, and quick actions.',
        tab: 'dashboard'
    },
    {
        id: 'post-writer',
        title: '✍️ AI Writer',
        content: 'Generate LinkedIn posts with AI. Enter topic → Generate → Post!',
        tab: 'post-writer'
    },
    {
        id: 'automation',
        title: '🤖 Automation',
        content: 'Auto-engage with posts. Set keywords, choose actions, and start.',
        tab: 'automation'
    },
    {
        id: 'networking',
        title: '🤝 Networking',
        content: 'Auto-connect with people. Search by role, filter, and connect.',
        tab: 'networking'
    },
    {
        id: 'import',
        title: '📥 Import',
        content: 'Import profiles from CSV to engage with specific people.',
        tab: 'import'
    },
    {
        id: 'limits',
        title: '📏 Limits',
        content: 'Set daily limits and delays. Keep your account safe!',
        tab: 'limits'
    },
    {
        id: 'settings',
        title: '⚙️ Settings',
        content: 'Manage account, preferences, and find detailed guides here.',
        tab: 'settings'
    },
    {
        id: 'complete',
        title: '🚀 Ready!',
        content: 'Tour complete! Check <strong>Settings → Help</strong> for full guides.',
        tab: 'dashboard'
    }
];

let currentStepIndex = 0;
let walkthroughOverlay = null;

/**
 * Check if walkthrough has been completed
 */
export async function hasCompletedWalkthrough() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['walkthroughCompleted'], (result) => {
            resolve(result.walkthroughCompleted === true);
        });
    });
}

/**
 * Mark walkthrough as completed
 */
async function markWalkthroughCompleted() {
    return new Promise((resolve) => {
        chrome.storage.local.set({ walkthroughCompleted: true }, resolve);
    });
}

/**
 * Reset walkthrough (for settings button)
 */
export async function resetWalkthrough() {
    return new Promise((resolve) => {
        chrome.storage.local.set({ walkthroughCompleted: false }, () => {
            resolve();
            startWalkthrough();
        });
    });
}

/**
 * Create compact walkthrough tooltip (top-right)
 */
function createWalkthroughOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'walkthrough-overlay';
    overlay.innerHTML = `
        <style>
            #walkthrough-overlay {
                position: fixed;
                top: 70px;
                right: 10px;
                z-index: 99999;
                pointer-events: none;
            }
            
            .walkthrough-tooltip {
                background: white;
                border-radius: 12px;
                width: 220px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
                animation: slideIn 0.2s ease;
                pointer-events: auto;
                border: 2px solid #693fe9;
            }
            
            @keyframes slideIn {
                from { opacity: 0; transform: translateX(20px); }
                to { opacity: 1; transform: translateX(0); }
            }
            
            .walkthrough-header {
                background: linear-gradient(135deg, #693fe9 0%, #7c4dff 100%);
                color: white;
                padding: 10px 12px;
                border-radius: 10px 10px 0 0;
            }
            
            .walkthrough-title {
                font-size: 13px;
                font-weight: 700;
                margin: 0;
            }
            
            .walkthrough-progress {
                display: flex;
                gap: 3px;
                margin-top: 6px;
            }
            
            .walkthrough-progress-dot {
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
            }
            
            .walkthrough-progress-dot.active {
                background: white;
            }
            
            .walkthrough-progress-dot.completed {
                background: #4caf50;
            }
            
            .walkthrough-content {
                padding: 10px 12px;
                font-size: 12px;
                line-height: 1.5;
                color: #333;
            }
            
            .walkthrough-footer {
                padding: 8px 12px;
                border-top: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .walkthrough-step-count {
                font-size: 10px;
                color: #999;
            }
            
            .walkthrough-buttons {
                display: flex;
                gap: 6px;
            }
            
            .walkthrough-btn {
                padding: 5px 10px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 600;
                cursor: pointer;
                border: none;
            }
            
            .walkthrough-btn-back {
                background: #f0f0f0;
                color: #666;
            }
            
            .walkthrough-btn-next {
                background: #693fe9;
                color: white;
            }
            
            .walkthrough-btn:disabled {
                opacity: 0.4;
            }
            
            .walkthrough-btn-skip {
                background: transparent;
                color: #999;
                font-size: 10px;
                padding: 4px 8px;
            }
            
            .walkthrough-btn-skip:hover {
                color: #666;
                background: #f5f5f5;
            }
            
            .walkthrough-skip-container {
                text-align: center;
                padding: 0 12px 8px;
            }
        </style>
        
        <div class="walkthrough-tooltip">
            <div class="walkthrough-header">
                <div class="walkthrough-title" id="walkthrough-title"></div>
                <div class="walkthrough-progress" id="walkthrough-progress"></div>
            </div>
            <div class="walkthrough-content" id="walkthrough-content"></div>
            <div class="walkthrough-footer">
                <span class="walkthrough-step-count" id="walkthrough-step-count"></span>
                <div class="walkthrough-buttons">
                    <button class="walkthrough-btn walkthrough-btn-back" id="walkthrough-back">←</button>
                    <button class="walkthrough-btn walkthrough-btn-next" id="walkthrough-next">Next</button>
                </div>
            </div>
            <div class="walkthrough-skip-container">
                <button class="walkthrough-btn walkthrough-btn-skip" id="walkthrough-skip">Skip Tour</button>
            </div>
        </div>
    `;
    
    return overlay;
}

/**
 * Switch tab directly without circular import
 */
function switchToTab(tabId) {
    console.log(`🎯 Walkthrough: Switching to tab: ${tabId}`);
    
    // Update tab buttons
    const allButtons = document.querySelectorAll('.tab-button');
    console.log(`🔍 Walkthrough: Found ${allButtons.length} tab buttons`);
    allButtons.forEach(t => {
        t.classList.remove('active');
        if (t.getAttribute('data-tab') === tabId) {
            t.classList.add('active');
            console.log(`✅ Walkthrough: Activated tab button: ${tabId}`);
        }
    });

    // Update tab contents - use direct style manipulation
    const allContents = document.querySelectorAll('.tab-content');
    console.log(`🔍 Walkthrough: Found ${allContents.length} tab contents`);
    let found = false;
    allContents.forEach(content => {
        const contentTabId = content.id.replace('-content', '');
        if (contentTabId === tabId) {
            content.classList.add('active');
            content.style.display = 'block';
            found = true;
            console.log(`👁️ Walkthrough: SHOWING content: ${content.id}`);
        } else {
            content.classList.remove('active');
            content.style.display = 'none';
        }
    });
    
    if (!found) {
        console.error(`❌ Walkthrough: Could not find tab content for: ${tabId}-content`);
    }
    
    console.log(`📑 Walkthrough switched to tab: ${tabId}`);
}

/**
 * Update walkthrough display for current step
 */
function updateWalkthroughStep() {
    const step = walkthroughSteps[currentStepIndex];
    
    // Update title
    document.getElementById('walkthrough-title').textContent = step.title;
    
    // Update content
    document.getElementById('walkthrough-content').innerHTML = step.content;
    
    // Update progress dots
    const progressContainer = document.getElementById('walkthrough-progress');
    progressContainer.innerHTML = walkthroughSteps.map((s, i) => {
        let className = 'walkthrough-progress-dot';
        if (i < currentStepIndex) className += ' completed';
        if (i === currentStepIndex) className += ' active';
        return `<div class="${className}"></div>`;
    }).join('');
    
    // Update step count
    document.getElementById('walkthrough-step-count').textContent = 
        `${currentStepIndex + 1}/${walkthroughSteps.length}`;
    
    // Update buttons
    const backBtn = document.getElementById('walkthrough-back');
    const nextBtn = document.getElementById('walkthrough-next');
    
    backBtn.disabled = currentStepIndex === 0;
    backBtn.style.visibility = currentStepIndex === 0 ? 'hidden' : 'visible';
    
    if (currentStepIndex === walkthroughSteps.length - 1) {
        nextBtn.textContent = 'Done!';
    } else {
        nextBtn.textContent = 'Next';
    }
    
    // Switch to corresponding tab if specified
    if (step.tab) {
        switchToTab(step.tab);
    }
}

/**
 * Start walkthrough
 */
export async function startWalkthrough() {
    currentStepIndex = 0;
    
    // Create and show overlay
    walkthroughOverlay = createWalkthroughOverlay();
    document.body.appendChild(walkthroughOverlay);
    
    // Set up button handlers
    document.getElementById('walkthrough-back').addEventListener('click', () => {
        if (currentStepIndex > 0) {
            currentStepIndex--;
            updateWalkthroughStep();
        }
    });
    
    document.getElementById('walkthrough-next').addEventListener('click', async () => {
        if (currentStepIndex < walkthroughSteps.length - 1) {
            currentStepIndex++;
            updateWalkthroughStep();
        } else {
            // Complete walkthrough
            await markWalkthroughCompleted();
            closeWalkthrough();
        }
    });
    
    // Skip button handler
    document.getElementById('walkthrough-skip').addEventListener('click', async () => {
        await markWalkthroughCompleted();
        closeWalkthrough();
        console.log('✅ Walkthrough skipped by user');
    });
    
    // Show first step
    updateWalkthroughStep();
}

/**
 * Close walkthrough overlay
 */
function closeWalkthrough() {
    if (walkthroughOverlay && walkthroughOverlay.parentNode) {
        const overlay = walkthroughOverlay;
        walkthroughOverlay = null; // Prevent double-click issues
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
            if (overlay && overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 300);
    }
}

/**
 * Initialize walkthrough for new users
 */
export async function initializeWalkthrough() {
    const completed = await hasCompletedWalkthrough();
    if (!completed) {
        // Small delay to let the UI render first
        setTimeout(() => {
            startWalkthrough();
        }, 500);
    }
}
