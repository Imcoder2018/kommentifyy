/**
 * LINKEDIN POST WRITER MODULE
 * AI-powered post creation with templates and optimization
 */

import { appConfig } from '../utils/appConfig.js';
import { storage } from '../storage/storage.js';
import { statisticsManager } from '../storage/statistics.js';

class PostWriter {
    constructor() {
        this.templates = {
            announcement: "🎉 Exciting news! [TOPIC]\n\n[DETAILS]\n\n[CALL_TO_ACTION]\n\n[HASHTAGS]",
            insight: "💡 Here's something I learned recently about [TOPIC]:\n\n[INSIGHT]\n\nWhat's your take on this?\n\n[HASHTAGS]",
            question: "🤔 Quick question for my network:\n\n[QUESTION]\n\nI'd love to hear your thoughts!\n\n[HASHTAGS]",
            achievement: "🏆 Proud to share that [ACHIEVEMENT]\n\n[STORY]\n\nThank you to everyone who supported me!\n\n[HASHTAGS]",
            tip: "📌 Pro tip: [TIP]\n\n[EXPLANATION]\n\nHave you tried this? Let me know!\n\n[HASHTAGS]",
            story: "[HOOK]\n\n[STORY_BODY]\n\n[LESSON_LEARNED]\n\n[HASHTAGS]",
            poll: "📊 I need your opinion!\n\n[QUESTION]\n\n👉 [OPTION_1]\n👉 [OPTION_2]\n👉 [OPTION_3]\n\nVote in the comments!\n\n[HASHTAGS]",
            motivation: "💪 [MOTIVATIONAL_QUOTE]\n\n[PERSONAL_REFLECTION]\n\n[HASHTAGS]",
            industry_news: "📰 Breaking: [NEWS_HEADLINE]\n\n[SUMMARY]\n\n[YOUR_PERSPECTIVE]\n\n[HASHTAGS]",
            how_to: "🔧 How to [GOAL]:\n\n1️⃣ [STEP_1]\n2️⃣ [STEP_2]\n3️⃣ [STEP_3]\n\n[CONCLUSION]\n\n[HASHTAGS]"
        };

        this.hashtagSuggestions = {
            technology: ['#Technology', '#Innovation', '#DigitalTransformation', '#AI', '#MachineLearning', '#CloudComputing', '#Cybersecurity'],
            business: ['#Business', '#Entrepreneurship', '#Leadership', '#Management', '#Strategy', '#Growth', '#Success'],
            marketing: ['#Marketing', '#DigitalMarketing', '#ContentMarketing', '#SocialMedia', '#Branding', '#SEO', '#Analytics'],
            career: ['#Career', '#CareerDevelopment', '#JobSearch', '#Networking', '#ProfessionalDevelopment', '#WorkLife', '#CareerAdvice'],
            sales: ['#Sales', '#SalesStrategy', '#B2B', '#B2C', '#CustomerSuccess', '#Revenue', '#SalesLeadership'],
            hr: ['#HumanResources', '#Recruitment', '#TalentAcquisition', '#EmployeeEngagement', '#WorkplaceCulture', '#HR', '#Hiring'],
            finance: ['#Finance', '#Investing', '#FinTech', '#Accounting', '#Economics', '#FinancialPlanning', '#WealthManagement'],
            productivity: ['#Productivity', '#TimeManagement', '#Efficiency', '#WorkFromHome', '#RemoteWork', '#WorkLifeBalance', '#Focus'],
            leadership: ['#Leadership', '#Management', '#ExecutiveLeadership', '#TeamBuilding', '#Mentorship', '#Coaching', '#Vision'],
            personal_development: ['#PersonalDevelopment', '#SelfImprovement', '#Mindset', '#Growth', '#Learning', '#Success', '#Motivation']
        };
    }

    /**
     * Generate a LinkedIn post using AI
     */
    async generatePost(topic, tone = 'professional', length = 'medium', includeHashtags = true, template = null) {
        try {
            const profile = await storage.getObject('profile');
            const account = await storage.getObject('account');

            const payload = {
                action: 'generatePost',
                topic,
                tone,
                length,
                includeHashtags,
                template,
                userProfile: profile
            };

            // If we have axios instance, use it
            if (window.axios) {
                const response = await window.axios.post(appConfig.generateCompletionUrl, payload);
                return response.data;
            }

            // Fallback: Generate post using template
            return this.generateFromTemplate(topic, template || 'insight', includeHashtags);
        } catch (error) {
            console.error('Error generating post:', error);
            return this.generateFromTemplate(topic, template || 'insight', includeHashtags);
        }
    }

    /**
     * Generate post from template
     */
    generateFromTemplate(topic, templateName, includeHashtags = true) {
        let template = this.templates[templateName] || this.templates.insight;
        let post = template;

        // Replace placeholders with topic
        post = post.replace('[TOPIC]', topic);
        post = post.replace('[QUESTION]', `What are your thoughts on ${topic}?`);
        post = post.replace('[INSIGHT]', `${topic} is becoming increasingly important in today's landscape.`);
        post = post.replace('[DETAILS]', `I wanted to share some thoughts about ${topic}.`);
        post = post.replace('[CALL_TO_ACTION]', 'What do you think? Share your thoughts below!');

        // Add hashtags
        if (includeHashtags) {
            const hashtags = this.suggestHashtags(topic, 5);
            post = post.replace('[HASHTAGS]', hashtags.join(' '));
        } else {
            post = post.replace('[HASHTAGS]', '');
        }

        return post;
    }

    /**
     * Suggest relevant hashtags based on content
     */
    suggestHashtags(content, count = 5) {
        const contentLower = content.toLowerCase();
        let relevantHashtags = [];

        // Check which categories are relevant
        for (const [category, tags] of Object.entries(this.hashtagSuggestions)) {
            if (contentLower.includes(category) || 
                tags.some(tag => contentLower.includes(tag.toLowerCase().replace('#', '')))) {
                relevantHashtags.push(...tags);
            }
        }

        // If no specific match, use general business hashtags
        if (relevantHashtags.length === 0) {
            relevantHashtags = this.hashtagSuggestions.business;
        }

        // Remove duplicates and return requested count
        return [...new Set(relevantHashtags)].slice(0, count);
    }

    /**
     * Optimize post length for LinkedIn
     */
    optimizePostLength(content, targetLength = 'medium') {
        const lengths = {
            short: 150,    // 1-2 lines
            medium: 500,   // 3-5 lines (optimal for engagement)
            long: 1300,    // Full post
            article: 3000  // Long-form
        };

        const target = lengths[targetLength] || lengths.medium;

        if (content.length <= target) {
            return content;
        }

        // Truncate and add ellipsis
        return content.substring(0, target - 3) + '...';
    }

    /**
     * Analyze post for engagement potential
     */
    analyzePost(content) {
        const analysis = {
            score: 0,
            length: content.length,
            hasHashtags: /#\w+/.test(content),
            hasEmojis: /[\u{1F300}-\u{1F9FF}]/u.test(content),
            hasQuestion: /\?/.test(content),
            hasCallToAction: /comment|share|thoughts|opinion|let me know|what do you think/i.test(content),
            hasNumbers: /\d+/.test(content),
            hasBulletPoints: /[•\-\*]\s/.test(content),
            lineBreaks: (content.match(/\n/g) || []).length,
            recommendations: []
        };

        // Calculate score
        if (analysis.length >= 150 && analysis.length <= 1300) analysis.score += 20;
        if (analysis.hasHashtags) analysis.score += 15;
        if (analysis.hasEmojis) analysis.score += 10;
        if (analysis.hasQuestion) analysis.score += 15;
        if (analysis.hasCallToAction) analysis.score += 20;
        if (analysis.hasNumbers) analysis.score += 10;
        if (analysis.hasBulletPoints) analysis.score += 10;
        if (analysis.lineBreaks >= 2) analysis.score += 10;

        // Generate recommendations
        if (!analysis.hasHashtags) {
            analysis.recommendations.push('Add 3-5 relevant hashtags to increase discoverability');
        }
        if (!analysis.hasQuestion && !analysis.hasCallToAction) {
            analysis.recommendations.push('Add a question or call-to-action to encourage engagement');
        }
        if (analysis.length < 150) {
            analysis.recommendations.push('Post is too short. Aim for 150-1300 characters for better engagement');
        }
        if (analysis.length > 1300) {
            analysis.recommendations.push('Post is quite long. Consider breaking it into multiple posts or an article');
        }
        if (!analysis.hasEmojis) {
            analysis.recommendations.push('Consider adding 1-2 emojis to make the post more visually appealing');
        }
        if (analysis.lineBreaks < 2) {
            analysis.recommendations.push('Add line breaks to improve readability');
        }

        return analysis;
    }

    /**
     * Get all available templates
     */
    getTemplates() {
        return Object.keys(this.templates).map(key => ({
            id: key,
            name: key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' '),
            template: this.templates[key]
        }));
    }

    /**
     * Save post as draft
     */
    async saveDraft(content, metadata = {}) {
        const drafts = await storage.getArray('postDrafts', []);
        drafts.push({
            id: Date.now(),
            content,
            metadata,
            createdAt: new Date().toISOString()
        });
        await storage.setArray('postDrafts', drafts);
        return drafts[drafts.length - 1];
    }

    /**
     * Get all drafts
     */
    async getDrafts() {
        return await storage.getArray('postDrafts', []);
    }

    /**
     * Delete draft
     */
    async deleteDraft(draftId) {
        const drafts = await storage.getArray('postDrafts', []);
        const filtered = drafts.filter(d => d.id !== draftId);
        await storage.setArray('postDrafts', filtered);
    }

    /**
     * Schedule a post
     */
    async schedulePost(content, scheduledTime) {
        const scheduled = await storage.getArray('scheduledPosts', []);
        scheduled.push({
            id: Date.now(),
            content,
            scheduledTime,
            status: 'pending',
            createdAt: new Date().toISOString()
        });
        await storage.setArray('scheduledPosts', scheduled);
        return scheduled[scheduled.length - 1];
    }

    /**
     * Get scheduled posts
     */
    async getScheduledPosts() {
        return await storage.getArray('scheduledPosts', []);
    }

    /**
     * Generate post variations
     */
    async generateVariations(originalPost, count = 3) {
        const variations = [];
        const tones = ['professional', 'casual', 'enthusiastic', 'thoughtful'];
        
        for (let i = 0; i < count; i++) {
            const tone = tones[i % tones.length];
            // In a real implementation, this would call the AI API
            // For now, we'll create simple variations
            variations.push({
                tone,
                content: this.createVariation(originalPost, tone)
            });
        }
        
        return variations;
    }

    /**
     * Create a variation of the post
     */
    createVariation(post, tone) {
        const prefixes = {
            professional: '📊 ',
            casual: '👋 ',
            enthusiastic: '🎉 ',
            thoughtful: '💭 '
        };

        return (prefixes[tone] || '') + post;
    }

    /**
     * Get emoji suggestions for content
     */
    getEmojiSuggestions(content) {
        const emojiMap = {
            success: ['🎉', '🏆', '✨', '🎊', '💪'],
            thinking: ['🤔', '💭', '💡', '🧠', '📝'],
            announcement: ['📢', '🎉', '🚀', '⚡', '🔔'],
            question: ['❓', '🤔', '💬', '🗣️', '💭'],
            growth: ['📈', '🚀', '💹', '📊', '⬆️'],
            learning: ['📚', '🎓', '💡', '🧠', '📖'],
            technology: ['💻', '🖥️', '📱', '⚙️', '🔧'],
            team: ['👥', '🤝', '👫', '🙌', '💼'],
            time: ['⏰', '⏱️', '📅', '🕐', '⌚']
        };

        const suggestions = [];
        const contentLower = content.toLowerCase();

        for (const [category, emojis] of Object.entries(emojiMap)) {
            if (contentLower.includes(category)) {
                suggestions.push(...emojis);
            }
        }

        return [...new Set(suggestions)].slice(0, 5);
    }
}

export const postWriter = new PostWriter();
