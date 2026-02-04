import { elements, state } from './state.js';
import { API_CONFIG, showToast } from './utils.js';
import { featureChecker } from '/shared/utils/featureChecker.js';
import { loadPlans } from './auth.js';

// --- POST WRITER FUNCTIONS --- //

/**
 * Check if any automation processing is currently active
 * Returns processing type if active, null if not
 */
async function checkProcessingActive() {
    try {
        const response = await chrome.runtime.sendMessage({ action: 'getProcessingState' });
        if (response && response.isProcessing) {
            return response.processingType || 'automation';
        }
        return null;
    } catch (error) {
        console.warn('Could not check processing state:', error);
        return null;
    }
}

/**
 * Show processing disclaimer message
 */
function showProcessingDisclaimer(processingType) {
    const typeNames = {
        'bulk_processing': 'Commenter Tab',
        'people_search': 'Networking Tab',
        'import': 'Import Tab',
        'automation': 'Automation'
    };
    const typeName = typeNames[processingType] || 'another tab';
    
    showToast(`⏳ Please wait - processing is running in ${typeName}. Stop it first or wait for completion.`, 'warning');
    
    // Also show a more detailed alert
    const shouldSwitch = confirm(
        `⚠️ Writer Tab Actions Blocked\n\n` +
        `Processing is currently running in ${typeName}.\n\n` +
        `To use Writer tab features, you can:\n` +
        `• Wait for the current processing to complete\n` +
        `• Switch to that tab and click Stop\n\n` +
        `Click OK to switch to Dashboard (where you can stop processing)`
    );
    
    if (shouldSwitch) {
        // Switch to dashboard tab
        const dashboardTab = document.querySelector('[data-tab="dashboard"]');
        if (dashboardTab) {
            dashboardTab.click();
        }
    }
}

export async function generatePost() {
    // Check if processing is active
    const processingType = await checkProcessingActive();
    if (processingType) {
        showProcessingDisclaimer(processingType);
        return;
    }
    
    // Check if AI post generation is allowed in user's plan
    const canUseAiPost = await featureChecker.checkFeature('aiPostGeneration');
    if (!canUseAiPost) {
        showToast('⬆️ AI Post Generation requires a paid plan. Please upgrade!', 'error');
        const planModal = document.getElementById('plan-modal');
        if (planModal) {
            planModal.style.display = 'flex';
            loadPlans();
        }
        return;
    }
    
    const topic = elements.postTopic.value.trim();
    if (!topic) {
        alert('Please enter a topic or idea for your post');
        return;
    }

    const template = elements.postTemplate.value;
    const tone = elements.postTone.value;
    const length = parseInt(elements.postLength.value) || 1500;
    const includeHashtags = elements.postIncludeHashtags.checked;
    const includeEmojis = elements.postIncludeEmojis.checked;
    const useCheapModel = state.preferences.useCheapModel || false;
    
    // Get advanced settings
    const targetAudience = elements.targetAudience?.value?.trim() || '';
    const keyMessage = elements.keyMessage?.value?.trim() || '';
    const userBackground = elements.userBackground?.value?.trim() || '';

    // Show loading state
    elements.postContent.value = '✨ Generating viral LinkedIn post with AI...\n\nThis may take a few seconds...';
    elements.generatePost.disabled = true;

    try {
        // Send message to background to generate post
        const response = await chrome.runtime.sendMessage({
            action: 'generatePost',
            topic,
            template,
            tone,
            length,
            includeHashtags,
            includeEmojis,
            useCheapModel,
            targetAudience,
            keyMessage,
            userBackground
        });

        if (response && response.content) {
            elements.postContent.value = response.content;
            updateCharacterCount(); // Update character counter after AI content is set
        } else if (response && response.error) {
            // Check if it's a limit/plan error
            const errorMsg = response.error.toLowerCase();
            if (errorMsg.includes('limit') || errorMsg.includes('plan') || errorMsg.includes('upgrade')) {
                // Show upgrade prompt
                showToast('Daily AI post limit reached. Please upgrade your plan.', 'error');
                
                // Switch to limits tab to show upgrade option
                const limitsTab = document.querySelector('[data-tab="limits"]');
                if (limitsTab) {
                    limitsTab.click();
                }
                
                // Clear the generating message
                elements.postContent.value = '';
            } else {
                // Other errors - show error and fallback
                showToast(response.error, 'error');
                elements.postContent.value = generatePostFromTemplate(topic, template, includeHashtags, includeEmojis);
                updateCharacterCount();
            }
        } else {
            // Fallback: use template
            elements.postContent.value = generatePostFromTemplate(topic, template, includeHashtags, includeEmojis);
            updateCharacterCount();
        }
    } catch (error) {
        console.error('Error generating post:', error);
        showToast('Failed to generate post', 'error');
        elements.postContent.value = generatePostFromTemplate(topic, template, includeHashtags, includeEmojis);
        updateCharacterCount();
    } finally {
        elements.generatePost.disabled = false;
    }
}

function generatePostFromTemplate(topic, template, includeHashtags = true, includeEmojis = true) {
    const emoji = includeEmojis;
    const hashtag = (tag) => includeHashtags ? `#${tag}` : '';

    const templates = {
        lead_magnet: `${emoji ? '🚀 ' : ''}R.I.P traditional ${topic}\n\nMost of them charge high fees and get you half of the "promised" results.\n\nWe've helped 50+ clients using a system most don't even know exists.\n\nThe difference?\n\nMost do outbound OR content.\n\nWe do both simultaneously (and they amplify each other).\n\nHere's what happens when they combine:\n${emoji ? '→ ' : '- '}3X higher reply rates\n${emoji ? '→ ' : '- '}Reach qualified people\n${emoji ? '→ ' : '- '}Credibility skyrockets\n${emoji ? '→ ' : '- '}Sales cycles cut in half\n\nWant to see if this fits your business?\n\n1. Connect with me\n2. DM me "INFO"\n\nI'll send you our full breakdown.\n\n${includeHashtags ? `${hashtag('LinkedIn')} ${hashtag(topic.replace(/\s+/g, ''))} ${hashtag('LeadGeneration')}` : ''}`,
        announcement: `${emoji ? '🎉 ' : ''}Exciting news!\n\nI wanted to share something about ${topic}.\n\nWhat do you think? Share your thoughts below!\n\n${includeHashtags ? `${hashtag('LinkedIn')} ${hashtag(topic.replace(/\s+/g, ''))}` : ''}`,
        insight: `${emoji ? '💡 ' : ''}Here's something I learned recently about ${topic}:\n\n${topic} is becoming increasingly important in today's landscape.\n\nWhat's your take on this?\n\n${includeHashtags ? `${hashtag('Learning')} ${hashtag(topic.replace(/\s+/g, ''))}` : ''}`,
        question: `${emoji ? '🤔 ' : ''}Quick question for my network:\n\nWhat are your thoughts on ${topic}?\n\nI'd love to hear your perspective!\n\n${includeHashtags ? `${hashtag('Discussion')} ${hashtag(topic.replace(/\s+/g, ''))}` : ''}`,
        achievement: `${emoji ? '🏆 ' : ''}Proud to share my recent work on ${topic}\n\nIt's been an incredible journey.\n\nThank you to everyone who supported me!\n\n${includeHashtags ? `${hashtag('Achievement')} ${hashtag(topic.replace(/\s+/g, ''))}` : ''}`,
        tip: `${emoji ? '📌 ' : ''}Pro tip about ${topic}:\n\nThis can really make a difference in your work.\n\nHave you tried this? Let me know!\n\n${includeHashtags ? `${hashtag('Tips')} ${hashtag(topic.replace(/\s+/g, ''))}` : ''}`,
        custom: `${topic}\n\n${includeHashtags ? `${hashtag('LinkedIn')} ${hashtag('Professional')}` : ''}`
    };

    return templates[template] || templates.custom;
}

export function analyzePost() {
    const content = elements.postContent.value.trim();
    if (!content) {
        alert('Please enter or generate post content first');
        return;
    }

    const words = content.split(/\s+/).filter(w => w.length > 0);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    const analysis = {
        score: 0,
        length: content.length,
        wordCount: words.length,
        sentenceCount: sentences.length,
        hasEmojis: /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(content),
        hasQuestion: /\?/.test(content),
        hasCallToAction: /comment|share|thoughts|opinion|let me know|what do you think|agree|disagree|reply|tell me|how do you|would you|have you|check out|click|join|follow|subscribe|dm|message/i.test(content),
        hasNumbers: /\d+/.test(content),
        hasStructure: (content.match(/\n/g) || []).length >= 1,
        hasBulletPoints: /^[\-•✓→✅❌📌🔹]/m.test(content) || /\n[\-•✓→✅❌📌🔹]/m.test(content),
        lineBreaks: (content.match(/\n/g) || []).length,
        recommendations: []
    };

    // Base score for having content (35 points)
    analysis.score += 35;
    
    // Length scoring (25 points) - more lenient
    if (analysis.length >= 100) {
        analysis.score += 25; // Good length
    } else if (analysis.length >= 50) {
        analysis.score += 20; // Acceptable length
    } else if (analysis.length >= 20) {
        analysis.score += 10; // Short but ok
    }
    
    // Emojis (15 points) - important for engagement
    if (analysis.hasEmojis) {
        analysis.score += 15;
    }
    
    // Formatting (10 points)
    if (analysis.hasStructure || analysis.lineBreaks >= 1) {
        analysis.score += 10;
    }
    
    // Engagement elements (10 points)
    if (analysis.hasQuestion || analysis.hasCallToAction) {
        analysis.score += 10;
    }
    
    // Bonus points (5 points)
    if (analysis.hasBulletPoints) analysis.score += 3;
    if (analysis.hasNumbers) analysis.score += 2;

    // Cap at 100
    analysis.score = Math.min(100, analysis.score);

    // Generate only actionable recommendations (max 2)
    if (analysis.score >= 85) {
        analysis.recommendations.push('✨ Excellent post! Ready to publish');
    } else {
        // Only show most impactful recommendations
        if (!analysis.hasEmojis && analysis.score < 90) {
            analysis.recommendations.push('😊 Add 1-2 emojis for visual appeal (+15 points)');
        }
        if (analysis.length < 100 && analysis.score < 90) {
            analysis.recommendations.push('📝 Add more content for better engagement (+25 points)');
        }
        
        // Limit to 2 recommendations max
        if (analysis.recommendations.length === 0) {
            analysis.recommendations.push('✅ Your post is good to go!');
        }
    }

    // Display analysis with color-coded score
    const scoreColor = analysis.score >= 85 ? '#28a745' : analysis.score >= 70 ? '#ffc107' : analysis.score >= 50 ? '#fd7e14' : '#dc3545';
    elements.engagementScore.textContent = analysis.score;
    elements.engagementScore.style.color = scoreColor;
    
    elements.postRecommendations.innerHTML = analysis.recommendations.length > 0
        ? '<ul style="margin: 0; padding-left: 16px; font-size: 11px;">' + analysis.recommendations.map(r => `<li style="margin-bottom: 4px;">${r}</li>`).join('') + '</ul>'
        : '<p style="color: green; margin: 0;">✓ Your post looks great!</p>';
    elements.postAnalysis.style.display = 'block';
}

export async function copyPost() {
    const content = elements.postContent.value;
    if (!content) {
        alert('No content to copy');
        return;
    }

    try {
        await navigator.clipboard.writeText(content);
        elements.copyPost.textContent = '✓ Copied!';
        setTimeout(() => {
            elements.copyPost.textContent = '📋 Copy';
        }, 2000);
    } catch (error) {
        alert('Failed to copy. Please copy manually.');
    }
}

export async function saveDraft() {
    const content = elements.postContent.value.trim();
    if (!content) {
        alert('No content to save');
        return;
    }

    const drafts = await chrome.storage.local.get('postDrafts');
    const draftsList = drafts.postDrafts || [];

    draftsList.push({
        id: Date.now(),
        content,
        createdAt: new Date().toISOString()
    });

    await chrome.storage.local.set({ postDrafts: draftsList });
    alert('Draft saved successfully!');
    loadDrafts();
}

export async function loadDrafts() {
    try {
        const drafts = await chrome.storage.local.get('postDrafts');
        const draftsList = drafts.postDrafts || [];

        if (elements.draftCount) {
            elements.draftCount.textContent = draftsList.length;
        }

        if (draftsList.length > 0 && elements.draftsList) {
            elements.draftsList.innerHTML = draftsList.map(draft => {
                const date = new Date(draft.createdAt).toLocaleString('en-US', { 
                    month: 'short', day: 'numeric', year: 'numeric', 
                    hour: '2-digit', minute: '2-digit' 
                });
                const preview = draft.content.substring(0, 100) + (draft.content.length > 100 ? '...' : '');
                return `
                    <div style="padding: 12px; margin-bottom: 10px; background: white; border: 1px solid #e0e0e0; border-radius: 8px; border-left: 4px solid #693fe9;">
                        <div style="display: flex; justify-content: space-between; align-items: start; gap: 10px;">
                            <div style="flex: 1; min-width: 0;">
                                <div style="font-size: 13px; color: #444; margin-bottom: 6px; line-height: 1.4; word-wrap: break-word;">${preview}</div>
                                <div style="font-size: 11px; color: #999;">📅 ${date}</div>
                            </div>
                            <div style="display: flex; gap: 6px; flex-shrink: 0;">
                                <button class="content-item-action" data-draft-id="${draft.id}" data-action="load" 
                                        style="padding: 6px 12px; background: #693fe9; color: white; border: none; border-radius: 5px; font-size: 11px; cursor: pointer; font-weight: 600;">
                                    Load
                                </button>
                                <button class="content-item-action" data-draft-id="${draft.id}" data-action="delete" 
                                        style="padding: 6px 12px; background: #dc3545; color: white; border: none; border-radius: 5px; font-size: 11px; cursor: pointer; font-weight: 600;">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            // Add event listeners to buttons
            elements.draftsList.querySelectorAll('.content-item-action').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = parseInt(btn.dataset.draftId);
                    const action = btn.dataset.action;

                    if (action === 'load') {
                        await loadDraft(id);
                    } else if (action === 'delete') {
                        await deleteDraft(id);
                    }
                });
            });
        } else if (elements.draftsList) {
            elements.draftsList.innerHTML = '<p class="empty-state">No saved drafts</p>';
        }
    } catch (error) {
        console.error('Error loading drafts:', error);
    }
}

async function loadDraft(id) {
    const drafts = await chrome.storage.local.get('postDrafts');
    const draftsList = drafts.postDrafts || [];
    const draft = draftsList.find(d => d.id === id);

    if (draft && elements.postContent) {
        elements.postContent.value = draft.content;
        alert('Draft loaded! You can now edit or post it.');
    }
}

async function deleteDraft(id) {
    if (!confirm('Delete this draft?')) return;

    const drafts = await chrome.storage.local.get('postDrafts');
    const draftsList = drafts.postDrafts || [];
    const updated = draftsList.filter(d => d.id !== id);
    await chrome.storage.local.set({ postDrafts: updated });
    loadDrafts();
}

export async function postToLinkedIn() {
    // Check if processing is active
    const processingType = await checkProcessingActive();
    if (processingType) {
        showProcessingDisclaimer(processingType);
        return;
    }
    
    const content = elements.postContent.value.trim();
    if (!content) {
        alert('No content to post');
        return;
    }

    // Disable button and show loading state
    elements.postToLinkedIn.disabled = true;
    elements.postToLinkedIn.textContent = '⏳ Posting...';

    try {
        // Send message to background to post
        const response = await chrome.runtime.sendMessage({
            action: 'postToLinkedIn',
            content: content
        });

        if (response && response.success) {
            alert('Post published successfully!');
            elements.postContent.value = ''; // Clear content
            if (elements.postScheduleDatetime) elements.postScheduleDatetime.value = ''; // Clear schedule
        } else {
            alert('Failed to post. Please try manually.');
        }
    } catch (error) {
        console.error('Error posting:', error);
        alert('Error posting to LinkedIn. Please try manually.');
    } finally {
        elements.postToLinkedIn.disabled = false;
        elements.postToLinkedIn.textContent = '🚀 Post to LinkedIn';
    }
}

export async function generateTopicLines() {
    // Check if processing is active
    const processingType = await checkProcessingActive();
    if (processingType) {
        showProcessingDisclaimer(processingType);
        return;
    }
    
    // Check if AI topic lines is allowed in user's plan
    const canUseAiTopics = await featureChecker.checkFeature('aiTopicLines');
    if (!canUseAiTopics) {
        showToast('⬆️ AI Topic Lines requires a paid plan. Please upgrade!', 'error');
        const planModal = document.getElementById('plan-modal');
        if (planModal) {
            planModal.style.display = 'flex';
            loadPlans();
        }
        return;
    }
    
    const topic = elements.postTopic.value.trim();
    if (!topic) {
        alert('Please enter a topic or general idea first');
        return;
    }

    // Show loading state
    elements.generateTopicLines.disabled = true;
    elements.generateTopicLines.textContent = '⏳ Generating...';
    elements.topicLinesList.innerHTML = '<p style="color: #666; padding: 10px;">AI is generating topic lines...</p>';
    elements.topicLinesContainer.style.display = 'block';

    try {
        // Send message to background to generate topic lines using AI
        const response = await chrome.runtime.sendMessage({
            action: 'generateTopicLines',
            topic
        });

        if (response.success && response.topics && response.topics.length > 0) {
            // Display AI-generated topic lines as clickable options
            elements.topicLinesList.innerHTML = '';
            response.topics.forEach((topicLine, index) => {
                const topicDiv = document.createElement('div');
                topicDiv.style.cssText = 'padding: 10px; margin: 5px 0; border: 1px solid #693fe9; border-radius: 5px; cursor: pointer; transition: all 0.2s; background-color: #FEFEFF;';
                topicDiv.innerHTML = `<strong style="color: #693fe9;">${index + 1}.</strong> ${topicLine}`;

                // Hover effect
                topicDiv.onmouseover = () => {
                    topicDiv.style.backgroundColor = '#693fe9';
                    topicDiv.style.color = '#FEFEFF';
                };
                topicDiv.onmouseout = () => {
                    topicDiv.style.backgroundColor = '#FEFEFF';
                    topicDiv.style.color = '#010100';
                };

                // Click to select
                topicDiv.onclick = () => {
                    elements.postTopic.value = topicLine;
                    elements.topicLinesContainer.style.display = 'none';
                    showToast('Topic selected! You can now generate your post.');
                };

                elements.topicLinesList.appendChild(topicDiv);
            });
        } else {
            const errorMessage = response.error || 'Failed to generate topic lines. Please try again.';
            elements.topicLinesList.innerHTML = `<p style="color: #dc3545; padding: 10px;">${errorMessage}</p>`;
        }
    } catch (error) {
        console.error('Error generating topic lines:', error);
        elements.topicLinesList.innerHTML = `
                <div style="color: #dc3545; padding: 15px; background: #ffe6e6; border-radius: 5px; border-left: 4px solid #dc3545;">
                    <strong>⚠️ Database Connection Error</strong><br>
                    <small>The backend database is currently unavailable. This is a known issue with the serverless database.</small><br>
                    <small style="margin-top: 8px; display: block;"><strong>Temporary Solution:</strong> Try again in a few minutes or contact support.</small>
                </div>
            `;
    } finally {
        elements.generateTopicLines.disabled = false;
        elements.generateTopicLines.textContent = '✨ Generate Topic Lines';
    }
}

// Character counter functionality
export function updateCharacterCount() {
    const postContent = document.getElementById('post-content');
    const charCountEl = document.getElementById('char-count');
    
    if (postContent && charCountEl) {
        const currentLength = postContent.value.length;
        const maxLength = 3000;
        charCountEl.textContent = `${currentLength} / ${maxLength} characters`;
        
        // Change color based on usage
        if (currentLength > maxLength * 0.9) {
            charCountEl.style.color = '#dc3545'; // Red when near limit
        } else if (currentLength > maxLength * 0.7) {
            charCountEl.style.color = '#ffc107'; // Yellow when getting close
        } else {
            charCountEl.style.color = '#6c757d'; // Default gray
        }
    }
}

// Initialize character counter when post writer is loaded
export function initializeCharacterCounter() {
    const postContent = document.getElementById('post-content');
    if (postContent) {
        // Update on input
        postContent.addEventListener('input', updateCharacterCount);
        postContent.addEventListener('paste', () => {
            // Update after paste event completes
            setTimeout(updateCharacterCount, 10);
        });
        
        // Initial update
        updateCharacterCount();
    }
}
