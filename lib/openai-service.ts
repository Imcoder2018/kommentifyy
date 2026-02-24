/**
 * OpenAI API Service
 * Handles all ChatGPT model calls through official OpenAI API
 * Only used for OpenAI models (gpt-*)
 */

import OpenAI from 'openai';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export class OpenAIService {
  private client: OpenAI | null = null;
  private apiKey: string;

  constructor(apiKey?: string) {
    // Clean the API key - remove any whitespace/newlines that could cause header issues
    this.apiKey = (apiKey || process.env.OPENAI_API_KEY || '').trim();
    this.initClient();
  }

  private initClient() {
    if (this.apiKey && this.apiKey.length > 0) {
      try {
        this.client = new OpenAI({
          apiKey: this.apiKey
        });
      } catch (e) {
        console.error('Failed to initialize OpenAI client:', e);
      }
    }
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    this.initClient();
  }

  async chat(params: {
    model: string;
    messages: OpenAIMessage[];
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    stop?: string[];
  }): Promise<{ content: string; usage: OpenAIUsage }> {
    if (!this.client) {
      throw new Error('OpenAI API key not configured');
    }

    // Strip openai/ prefix if present
    let actualModel = params.model;
    if (actualModel.startsWith('openai/')) {
      actualModel = actualModel.replace('openai/', '');
    }

    // Validate model is an OpenAI model (after stripping prefix)
    if (!actualModel.startsWith('gpt-') && !actualModel.startsWith('o1') && !actualModel.startsWith('o3') && !actualModel.startsWith('chatgpt')) {
      throw new Error(`Invalid OpenAI model: ${params.model}. This service only handles OpenAI models.`);
    }

    const response = await this.client.chat.completions.create({
      model: actualModel,
      messages: params.messages as any,
      max_tokens: params.maxTokens,
      temperature: params.temperature ?? 0.7,
      top_p: params.topP,
      stop: params.stop as any
    });

    const choice = response.choices[0];
    
    return {
      content: choice?.message?.content || '',
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0
      }
    };
  }

  async generateContent(params: {
    model: string;
    systemPrompt: string;
    userPrompt: string;
    maxTokens?: number;
    temperature?: number;
  }): Promise<{ content: string; usage: OpenAIUsage }> {
    return this.chat({
      model: params.model,
      messages: [
        { role: 'system', content: params.systemPrompt },
        { role: 'user', content: params.userPrompt }
      ],
      maxTokens: params.maxTokens || 4096,
      temperature: params.temperature ?? 0.7
    });
  }

  // Generate LinkedIn post
  async generateLinkedInPost(params: {
    model: string;
    topic: string;
    tone: string;
    length: number;
    template: string;
    userProfile?: string;
    inspirationPosts?: string[];
    includeHashtags?: boolean;
    includeEmojis?: boolean;
    language?: string;
    targetAudience?: string;
    keyMessage?: string;
    background?: string;
  }): Promise<{ post: string; usage: OpenAIUsage }> {
    const systemPrompt = `You are an expert LinkedIn content writer. Create engaging, professional posts that drive engagement and establish thought leadership.

Guidelines:
- Write in ${params.tone} tone
- Target length: ${params.length} characters
- Use the "${params.template}" template style
- ${params.includeHashtags ? 'Include 3-5 relevant hashtags at the end' : 'Do not include hashtags'}
- ${params.includeEmojis ? 'Use emojis sparingly and professionally' : 'Do not use emojis'}
${params.language ? `- Write in ${params.language} language` : ''}
${params.targetAudience ? `- Target audience: ${params.targetAudience}` : ''}
${params.keyMessage ? `- Key message to convey: ${params.keyMessage}` : ''}

${params.userProfile ? `User's LinkedIn profile context:\n${params.userProfile}` : ''}

${params.inspirationPosts?.length ? `Inspiration posts for style reference:\n${params.inspirationPosts.join('\n\n---\n\n')}` : ''}`;

    const userPrompt = `Write a LinkedIn post about: ${params.topic}

${params.background ? `Additional context: ${params.background}` : ''}

Create a compelling, engaging post that will resonate with the audience and drive meaningful interactions.`;

    const result = await this.generateContent({
      model: params.model,
      systemPrompt,
      userPrompt,
      maxTokens: Math.min(4096, Math.ceil(params.length * 2)),
      temperature: 0.8
    });

    return { post: result.content, usage: result.usage };
  }

  // Generate LinkedIn comment
  async generateLinkedInComment(params: {
    model: string;
    postContent: string;
    goal: string;
    tone: string;
    length: string;
    style: string;
    userProfile?: string;
    userExpertise?: string;
    userBackground?: string;
  }): Promise<{ comment: string; usage: OpenAIUsage }> {
    const lengthGuide: Record<string, string> = {
      'Short': '1-2 sentences, 50-100 characters',
      'Medium': '2-4 sentences, 100-200 characters',
      'Long': '4-6 sentences, 200-400 characters'
    };

    const systemPrompt = `You are an expert at writing engaging LinkedIn comments that add value and spark conversations.

Guidelines:
- Goal: ${params.goal} (Add value, ask thoughtful questions, share insights)
- Tone: ${params.tone}
- Length: ${lengthGuide[params.length] || params.length}
- Style: ${params.style} (direct, conversational, professional)
- Be authentic and avoid generic responses like "Great post!" or "Thanks for sharing!"

${params.userProfile ? `User's LinkedIn profile context:\n${params.userProfile}` : ''}
${params.userExpertise ? `User's expertise: ${params.userExpertise}` : ''}
${params.userBackground ? `User's background: ${params.userBackground}` : ''}`;

    const userPrompt = `Write a LinkedIn comment for this post:

"${params.postContent}"

Create a ${params.goal.toLowerCase()} comment that is ${params.tone.toLowerCase()} and ${params.length.toLowerCase()} in length.`;

    const result = await this.generateContent({
      model: params.model,
      systemPrompt,
      userPrompt,
      maxTokens: 500,
      temperature: 0.7
    });

    return { comment: result.content, usage: result.usage };
  }

  // Generate topic ideas
  async generateTopicIdeas(params: {
    model: string;
    industry: string;
    role: string;
    interests: string[];
    count: number;
    userProfile?: string;
  }): Promise<{ topics: string[]; usage: OpenAIUsage }> {
    const systemPrompt = `You are a LinkedIn content strategist. Generate compelling topic ideas that will resonate with the target audience and establish thought leadership.

Topics should be:
- Relevant to the industry and role
- Engaging and thought-provoking
- Suitable for professional LinkedIn content
- Varied in angle and perspective

${params.userProfile ? `User's LinkedIn profile context:\n${params.userProfile}` : ''}`;

    const userPrompt = `Generate ${params.count} LinkedIn post topic ideas for:

Industry: ${params.industry}
Role: ${params.role}
Interests: ${params.interests.join(', ')}

Return as a numbered list, each topic should be a clear, actionable post idea.`;

    const result = await this.generateContent({
      model: params.model,
      systemPrompt,
      userPrompt,
      maxTokens: 2000,
      temperature: 0.9
    });

    // Parse topics from response
    const topics = result.content
      .split('\n')
      .filter(line => line.match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(Boolean);

    return { topics, usage: result.usage };
  }
}

// Singleton instance
let openAIInstance: OpenAIService | null = null;

export function getOpenAIService(apiKey?: string): OpenAIService {
  if (!openAIInstance) {
    openAIInstance = new OpenAIService(apiKey);
  } else if (apiKey) {
    openAIInstance.setApiKey(apiKey);
  }
  return openAIInstance;
}

export default OpenAIService;
