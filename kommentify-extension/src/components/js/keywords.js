import { elements } from './state.js';

// --- AI KEYWORD GENERATION --- //
export async function generateKeywords() {
    const intent = elements.keywordIntent.value.trim();
    const keywordCount = parseInt(elements.keywordCountSlider.value, 10);

    if (!intent) {
        alert('Please describe your intent, niche, or target audience first');
        return;
    }

    elements.generateKeywords.disabled = true;
    elements.generateKeywords.textContent = '⏳ Generating...';

    try {
        console.log('POPUP: Sending keyword generation request...');
        
        // Use dedicated keyword generation endpoint
        const response = await chrome.runtime.sendMessage({
            action: 'generateKeywords',
            intent: intent,
            keywordCount: keywordCount
        });

        console.log('POPUP: Received response:', response);

        if (response && response.success) {
            let keywords = response.keywords || [];

            // If backend returned raw content, try to parse it
            if (keywords.length === 0 && response.rawContent) {
                keywords = parseKeywordsFromContent(response.rawContent, keywordCount);
            }

            // Validate and add keywords
            if (keywords.length > 0) {
                keywords = keywords.slice(0, keywordCount);
                const keywordText = keywords.join('\n');

                // Add to existing keywords if any
                const existingKeywords = elements.bulkUrls.value.trim();
                const finalKeywords = existingKeywords
                    ? existingKeywords + '\n' + keywordText
                    : keywordText;

                elements.bulkUrls.value = finalKeywords;

                // Save keywords to persistent storage
                await saveKeywords(finalKeywords);

                alert(`✅ Generated ${keywords.length} keywords successfully!\n\nKeywords added to your list.`);
            } else {
                throw new Error('No keywords generated. Please try again with a different intent.');
            }
        } else {
            throw new Error(response?.error || 'Failed to generate keywords');
        }
    } catch (error) {
        console.error('Keyword generation error:', error);
        alert(`❌ Failed to generate keywords: ${error.message}`);
    } finally {
        elements.generateKeywords.disabled = false;
        elements.generateKeywords.textContent = '🤖 Generate Keywords';
    }
}

// Helper function to parse keywords from raw content
function parseKeywordsFromContent(content, maxCount) {
    let keywords = [];

    try {
        // Clean up content
        content = content.trim().replace(/```json\s*/g, '').replace(/```\s*/g, '');

        // Strategy 1: Try JSON parse
        try {
            const result = JSON.parse(content);
            if (result.keywords && Array.isArray(result.keywords)) {
                keywords = result.keywords;
            } else if (Array.isArray(result)) {
                keywords = result;
            }
        } catch (e) {
            // Not JSON, continue
        }

        // Strategy 2: Extract array from content
        if (keywords.length === 0) {
            const arrayMatch = content.match(/\[([\s\S]*?)\]/);
            if (arrayMatch) {
                keywords = arrayMatch[1]
                    .split(',')
                    .map(k => k.trim().replace(/^["']|["']$/g, ''))
                    .filter(k => k.length > 0 && k.length < 50);
            }
        }

        // Strategy 3: Extract from plain text (line by line)
        if (keywords.length === 0) {
            keywords = content
                .split('\n')
                .map(line => line.trim())
                .filter(line =>
                    line &&
                    line.length > 0 &&
                    line.length < 50 &&
                    !line.includes('{') &&
                    !line.includes('}')
                )
                .map(line => line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, ''))
                .filter(k => k.length > 0);
        }
    } catch (e) {
        console.error('Failed to parse keywords from content:', e);
    }

    return keywords.slice(0, maxCount);
}

export async function clearKeywords() {
    if (confirm('Are you sure you want to clear all keywords?')) {
        elements.bulkUrls.value = '';
        elements.keywordIntent.value = '';
        await saveKeywords('');
    }
}

export async function saveKeywords(keywords) {
    try {
        await chrome.storage.local.set({
            savedKeywords: keywords,
            keywordsSavedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Failed to save keywords:', error);
    }
}

export async function loadSavedKeywords() {
    try {
        const result = await chrome.storage.local.get(['savedKeywords']);
        if (result.savedKeywords && elements.bulkUrls) {
            elements.bulkUrls.value = result.savedKeywords;
        }
    } catch (error) {
        console.error('Failed to load saved keywords:', error);
    }
}

export function updateKeywordCountDisplay() {
    if (elements.keywordCountDisplay && elements.keywordCountSlider) {
        elements.keywordCountDisplay.textContent = elements.keywordCountSlider.value;
    }
}

// Auto-save keywords when user types
export async function onKeywordsChange() {
    const keywords = elements.bulkUrls.value;
    await saveKeywords(keywords);
}
