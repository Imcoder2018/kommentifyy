/**
 * OpenRouter API Service
 * Handles all AI model calls through OpenRouter for non-OpenAI models
 * Documentation: https://openrouter.ai/docs
 */

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
  stop?: string[];
  frequency_penalty?: number;
  presence_penalty?: number;
}

interface OpenRouterResponse {
  id: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

export class OpenRouterService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';
  private siteUrl: string;
  private siteName: string;

  constructor(apiKey?: string) {
    // Clean the API key - remove any whitespace/newlines
    this.apiKey = (apiKey || process.env.OPENROUTER_API_KEY || '').trim();
    this.siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kommentify.com';
    this.siteName = 'Kommentify';
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey.trim();
  }

  // Validate model ID format - log warning but don't block (let OpenRouter return actual error)
  private validateModelId(modelId: string): boolean {
    // Common valid patterns: provider/model-name
    const validPatterns = [
      /^openai\//i,
      /^anthropic\//i,
      /^google\//i,
      /^meta-llama\//i,
      /^mistralai\//i,
      /^deepseek\//i,
      /^qwen\//i,
      /^microsoft\//i,
      /^nousresearch\//i,
      /^cognitivecomputations\//i,
      /^perplexity\//i,
      /^x-ai\//i,
      /^01-ai\//i,
      /^cohere\//i,
      /^nvidia\//i,
      /^adept\//i,
      /^fireworks\//i,
      /^anyscale\//i,
      /^leptonai\//i,
      /^sglang\//i,
      /^hyper\//i,
      /^togetherai\//i,
      /^replicate\//i,
      /^ai21\//i,
      /^voyage\//i,
      /^jamba\//i,
      /^minimax\//i,
      /^abacusai\//i,
      /^lightonai\//i,
      /^volcengine\//i,
      /^baichuan\//i,
      /^yi\//i,
      /^infinite\//i,
      /^openchat\//i,
      /^lmsys\//i,
      /^mlc-ai\//i,
      /^samba-\//i,
      /^starling\//i,
      /^teknium\//i,
      /^upstage\//i,
      /^vllm\//i,
      /^yandex\//i,
      /^zhipuai\//i,
      /^z-ai\//i,  // Added for z.ai models
    ];
    const isValid = validPatterns.some(p => p.test(modelId));
    if (!isValid) {
      console.warn(`⚠️ Model ID ${modelId} may not be valid - letting OpenRouter handle it`);
    }
    return true; // Always return true to let OpenRouter return actual error
  }

  async chat(request: OpenRouterRequest): Promise<OpenRouterResponse> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    // Validate model ID - log warning but don't block
    this.validateModelId(request.model);

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': this.siteUrl,
        'X-Title': this.siteName
      },
      body: JSON.stringify({
        ...request,
        stream: false
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async generateContent(params: {
    model: string;
    systemPrompt: string;
    userPrompt: string;
    maxTokens?: number;
    temperature?: number;
  }): Promise<{ content: string; usage: { promptTokens: number; completionTokens: number; totalTokens: number } }> {
    const response = await this.chat({
      model: params.model,
      messages: [
        { role: 'system', content: params.systemPrompt },
        { role: 'user', content: params.userPrompt }
      ],
      max_tokens: params.maxTokens || 4096,
      temperature: params.temperature ?? 0.7
    });

    return {
      content: response.choices[0]?.message?.content || '',
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0
      }
    };
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
  }): Promise<{ post: string; usage: any }> {
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
  }): Promise<{ comment: string; usage: any }> {
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
  }): Promise<{ topics: string[]; usage: any }> {
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

  // Get available models from OpenRouter
  async getAvailableModels(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/models`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch models from OpenRouter');
    }

    const data = await response.json();
    return data.data || [];
  }
}

// Singleton instance
let openRouterInstance: OpenRouterService | null = null;

export function getOpenRouterService(apiKey?: string): OpenRouterService {
  if (!openRouterInstance) {
    openRouterInstance = new OpenRouterService(apiKey);
  } else if (apiKey) {
    openRouterInstance.setApiKey(apiKey);
  }
  return openRouterInstance;
}

export default OpenRouterService;
