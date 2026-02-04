/**
 * AI CONFIGURATION
 * Configuration for AI API integration via Backend
 * 
 * NOTE: All AI calls are now routed through the backend API for security.
 * The backend handles OpenAI API keys securely via environment variables.
 */

// Backend API URL - change this in production
const BACKEND_API_URL = 'https://kommentify.com';

/**
 * Get stored auth token for API calls
 */
async function getAuthToken() {
    try {
        const result = await chrome.storage.local.get('authToken');
        return result.authToken || null;
    } catch (error) {
        console.error('Failed to get auth token:', error);
        return null;
    }
}

/**
 * Generate comment using Backend AI API
 * All AI processing is handled securely on the backend
 */
export async function generateCommentWithOpenAI(postText, tone, length, useCheapModel = false) {
    // Map length to backend expected format
    const lengthMap = {
        'SuperShort': 'Short',
        'Brief': 'Short',
        'Concise': 'Mid'
    };

    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            console.warn('No auth token - using fallback comment');
            return getFallbackComment(tone);
        }

        const response = await fetch(`${BACKEND_API_URL}/api/ai/generate-comment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                postText: postText,
                tone: tone || 'Professional',
                goal: 'AddValue',
                commentLength: lengthMap[length] || 'Short',
                commentStyle: 'direct',
                userExpertise: '',
                userBackground: '',
                authorName: ''
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Backend API error:', response.status, errorData);
            throw new Error(errorData.error || `API error: ${response.status}`);
        }

        const data = await response.json();
        if (data.success && data.content) {
            return data.content;
        } else {
            throw new Error(data.error || 'Failed to generate comment');
        }
    } catch (error) {
        console.error('Error generating comment via backend:', error);
        // Fallback comment
        return getFallbackComment(tone);
    }
}

/**
 * Generate post using Backend AI API
 * All AI processing is handled securely on the backend
 */
export async function generatePostWithOpenAI(topic, template, tone, useCheapModel = false) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            throw new Error('Authentication required to generate posts');
        }

        const response = await fetch(`${BACKEND_API_URL}/api/ai/generate-post`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                topic: topic,
                template: template || 'general',
                tone: tone || 'professional',
                includeHashtags: true,
                includeEmojis: true,
                length: 'medium'
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Backend API error:', response.status, errorData);
            throw new Error(errorData.error || `API error: ${response.status}`);
        }

        const data = await response.json();
        if (data.success && data.content) {
            return data.content;
        } else {
            throw new Error(data.error || 'Failed to generate post');
        }
    } catch (error) {
        console.error('Error generating post via backend:', error);
        throw error;
    }
}

/**
 * Fallback comments when AI fails
 */
function getFallbackComment(tone) {
    const fallbacks = {
        'Supportive': 'Great insights! Thanks for sharing this.',
        'Gracious': 'Thank you for sharing this valuable perspective!',
        'Polite': 'This is very interesting. Thank you for posting.',
        'Witty': 'Love this! Great point.',
        'Excited': 'This is amazing! Thanks for sharing!',
        'RespectfullyOpposed': 'Interesting perspective. I see it slightly differently, but appreciate the discussion.'
    };

    return fallbacks[tone] || 'Thanks for sharing this!';
}

/**
 * Generic AI completion function for custom prompts
 * Used for keyword generation and other custom AI tasks
 * Uses the comment generation endpoint with postText field
 */
export async function generateWithAI(prompt, maxTokens = 500, temperature = 0.7) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            throw new Error('Authentication required. Please log in first.');
        }

        // Use the comment generation endpoint - requires postText field
        const response = await fetch(`${BACKEND_API_URL}/api/ai/generate-comment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                postText: prompt, // Backend requires 'postText' not 'postContent'
                tone: 'Professional',
                goal: 'AddValue',
                commentLength: 'Long'
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Backend API error:', response.status, errorData);
            
            // More specific error messages
            if (response.status === 401) {
                throw new Error('Authentication expired. Please log in again.');
            } else if (response.status === 403) {
                throw new Error('Access denied. Please check your subscription.');
            } else if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please try again later.');
            }
            throw new Error(errorData.error || `API error: ${response.status}`);
        }

        const data = await response.json();
        if (data.success && data.content) {
            return data.content;
        } else if (data.comment) {
            return data.comment;
        } else if (data.keywords) {
            return JSON.stringify({ keywords: data.keywords });
        } else {
            throw new Error(data.error || 'Failed to generate content');
        }
    } catch (error) {
        console.error('Error generating with AI:', error);
        throw error;
    }
}
