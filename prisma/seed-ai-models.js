/**
 * Seed file for AI Models - Best models for LinkedIn content generation
 * Updated: February 2026
 * 
 * Categories:
 * - premium: Top-tier models with best quality ($10+/1M output)
 * - standard: Good balance of quality and cost ($1-10/1M output)
 * - budget: Cost-effective models ($0.1-1/1M output)
 * - free: Free or nearly free models (<$0.1/1M output)
 * 
 * API Sources:
 * - openai: Official OpenAI API (for ChatGPT models only)
 * - openrouter: OpenRouter API (for all other models)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const AI_MODELS = [
  // ==================== PREMIUM MODELS ====================
  // OpenAI GPT-5 Series (via OpenAI API)
  {
    modelId: 'gpt-5.2',
    name: 'GPT-5.2',
    provider: 'openai',
    apiSource: 'openai',
    inputCostPer1M: 5.00,
    outputCostPer1M: 15.00,
    maxContextTokens: 400000,
    maxOutputTokens: 16384,
    reasoningScore: 9,
    writingScore: 10,
    codingScore: 9,
    speedScore: 7,
    category: 'premium',
    isReasoningModel: true,
    isFeatured: true,
    description: 'Latest GPT-5 with 400K context, adaptive reasoning, best for complex content'
  },
  {
    modelId: 'gpt-5.2-pro',
    name: 'GPT-5.2 Pro',
    provider: 'openai',
    apiSource: 'openai',
    inputCostPer1M: 10.00,
    outputCostPer1M: 30.00,
    maxContextTokens: 400000,
    maxOutputTokens: 16384,
    reasoningScore: 10,
    writingScore: 10,
    codingScore: 10,
    speedScore: 6,
    category: 'premium',
    isReasoningModel: true,
    isFeatured: true,
    description: 'Most advanced GPT-5 with extended thinking, reduced hallucination'
  },
  {
    modelId: 'gpt-5.3-codex',
    name: 'GPT-5.3 Codex',
    provider: 'openai',
    apiSource: 'openai',
    inputCostPer1M: 8.00,
    outputCostPer1M: 24.00,
    maxContextTokens: 200000,
    maxOutputTokens: 16384,
    reasoningScore: 9,
    writingScore: 9,
    codingScore: 10,
    speedScore: 8,
    category: 'premium',
    isReasoningModel: true,
    isFeatured: true,
    description: 'Self-improving model, 25% faster than 5.2-Codex, best for technical content'
  },
  {
    modelId: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    apiSource: 'openai',
    inputCostPer1M: 2.50,
    outputCostPer1M: 10.00,
    maxContextTokens: 128000,
    maxOutputTokens: 16384,
    reasoningScore: 9,
    writingScore: 9,
    codingScore: 9,
    speedScore: 8,
    category: 'premium',
    isMultimodal: true,
    isFeatured: true,
    description: 'Best all-around model, excellent for LinkedIn posts and comments'
  },
  {
    modelId: 'o1',
    name: 'o1 (Reasoning)',
    provider: 'openai',
    apiSource: 'openai',
    inputCostPer1M: 15.00,
    outputCostPer1M: 60.00,
    maxContextTokens: 200000,
    maxOutputTokens: 100000,
    reasoningScore: 10,
    writingScore: 8,
    codingScore: 10,
    speedScore: 4,
    category: 'premium',
    isReasoningModel: true,
    isFeatured: true,
    description: 'Deep reasoning model, best for complex analysis and thought leadership content'
  },
  {
    modelId: 'o1-mini',
    name: 'o1-mini',
    provider: 'openai',
    apiSource: 'openai',
    inputCostPer1M: 3.00,
    outputCostPer1M: 12.00,
    maxContextTokens: 128000,
    maxOutputTokens: 65536,
    reasoningScore: 8,
    writingScore: 7,
    codingScore: 8,
    speedScore: 6,
    category: 'premium',
    isReasoningModel: true,
    description: 'Fast reasoning model, good balance of speed and quality'
  },

  // Anthropic Claude 4.x Series (via OpenRouter)
  {
    modelId: 'anthropic/claude-opus-4.6',
    name: 'Claude Opus 4.6',
    provider: 'anthropic',
    apiSource: 'openrouter',
    inputCostPer1M: 15.00,
    outputCostPer1M: 75.00,
    maxContextTokens: 200000,
    maxOutputTokens: 16384,
    reasoningScore: 10,
    writingScore: 10,
    codingScore: 10,
    speedScore: 5,
    category: 'premium',
    isReasoningModel: true,
    isFeatured: true,
    description: 'Latest Anthropic flagship, maximum intelligence, best for premium content'
  },
  {
    modelId: 'anthropic/claude-opus-4.5',
    name: 'Claude Opus 4.5',
    provider: 'anthropic',
    apiSource: 'openrouter',
    inputCostPer1M: 15.00,
    outputCostPer1M: 75.00,
    maxContextTokens: 200000,
    maxOutputTokens: 16384,
    reasoningScore: 10,
    writingScore: 10,
    codingScore: 10,
    speedScore: 5,
    category: 'premium',
    isReasoningModel: true,
    description: 'Top-tier reasoning, excellent for complex thought leadership'
  },
  {
    modelId: 'anthropic/claude-sonnet-4.5',
    name: 'Claude Sonnet 4.5',
    provider: 'anthropic',
    apiSource: 'openrouter',
    inputCostPer1M: 3.00,
    outputCostPer1M: 15.00,
    maxContextTokens: 200000,
    maxOutputTokens: 16384,
    reasoningScore: 9,
    writingScore: 9,
    codingScore: 9,
    speedScore: 7,
    category: 'premium',
    isMultimodal: true,
    isFeatured: true,
    description: 'Excellent balance of speed and quality, great for LinkedIn content'
  },
  {
    modelId: 'anthropic/claude-sonnet-4',
    name: 'Claude Sonnet 4',
    provider: 'anthropic',
    apiSource: 'openrouter',
    inputCostPer1M: 3.00,
    outputCostPer1M: 15.00,
    maxContextTokens: 200000,
    maxOutputTokens: 8192,
    reasoningScore: 8,
    writingScore: 9,
    codingScore: 8,
    speedScore: 8,
    category: 'standard',
    isMultimodal: true,
    description: 'Balanced performance, excellent instruction following'
  },
  {
    modelId: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    apiSource: 'openrouter',
    inputCostPer1M: 3.00,
    outputCostPer1M: 15.00,
    maxContextTokens: 200000,
    maxOutputTokens: 8192,
    reasoningScore: 8,
    writingScore: 9,
    codingScore: 8,
    speedScore: 8,
    category: 'standard',
    isMultimodal: true,
    description: 'Proven performer, great for professional content'
  },

  // Google Gemini 3.x Series (via OpenRouter)
  {
    modelId: 'google/gemini-3-pro',
    name: 'Gemini 3 Pro',
    provider: 'google',
    apiSource: 'openrouter',
    inputCostPer1M: 1.25,
    outputCostPer1M: 10.00,
    maxContextTokens: 1000000,
    maxOutputTokens: 65536,
    reasoningScore: 10,
    writingScore: 10,
    codingScore: 9,
    speedScore: 7,
    category: 'premium',
    isMultimodal: true,
    isFeatured: true,
    description: 'LM Arena #1, 1M context, best for long-form content and research'
  },
  {
    modelId: 'google/gemini-3-flash-preview',
    name: 'Gemini 3 Flash Preview',
    provider: 'google',
    apiSource: 'openrouter',
    inputCostPer1M: 0.075,
    outputCostPer1M: 0.30,
    maxContextTokens: 1000000,
    maxOutputTokens: 65536,
    reasoningScore: 9,
    writingScore: 9,
    codingScore: 8,
    speedScore: 9,
    category: 'standard',
    isMultimodal: true,
    isFeatured: true,
    description: 'Near-Pro quality at Flash prices, 1M context, excellent value'
  },
  {
    modelId: 'google/gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'google',
    apiSource: 'openrouter',
    inputCostPer1M: 1.25,
    outputCostPer1M: 10.00,
    maxContextTokens: 2000000,
    maxOutputTokens: 65536,
    reasoningScore: 9,
    writingScore: 9,
    codingScore: 9,
    speedScore: 7,
    category: 'premium',
    isMultimodal: true,
    description: '2M context, excellent for processing large documents'
  },
  {
    modelId: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'google',
    apiSource: 'openrouter',
    inputCostPer1M: 0.075,
    outputCostPer1M: 0.30,
    maxContextTokens: 1000000,
    maxOutputTokens: 65536,
    reasoningScore: 8,
    writingScore: 8,
    codingScore: 7,
    speedScore: 9,
    category: 'standard',
    isMultimodal: true,
    description: 'Fast and affordable, great for high-volume content'
  },

  // xAI Grok Series (via OpenRouter)
  {
    modelId: 'x-ai/grok-4.1',
    name: 'Grok 4.1',
    provider: 'xai',
    apiSource: 'openrouter',
    inputCostPer1M: 2.00,
    outputCostPer1M: 10.00,
    maxContextTokens: 131072,
    maxOutputTokens: 8192,
    reasoningScore: 9,
    writingScore: 9,
    codingScore: 8,
    speedScore: 8,
    category: 'premium',
    isFeatured: true,
    description: 'Real-time web integration via X, great for trending topics'
  },
  {
    modelId: 'x-ai/grok-4.1-thinking',
    name: 'Grok 4.1 Thinking',
    provider: 'xai',
    apiSource: 'openrouter',
    inputCostPer1M: 3.00,
    outputCostPer1M: 15.00,
    maxContextTokens: 131072,
    maxOutputTokens: 16384,
    reasoningScore: 10,
    writingScore: 9,
    codingScore: 9,
    speedScore: 6,
    category: 'premium',
    isReasoningModel: true,
    description: 'Extended reasoning mode, LM Arena #2'
  },
  {
    modelId: 'x-ai/grok-beta',
    name: 'Grok Beta',
    provider: 'xai',
    apiSource: 'openrouter',
    inputCostPer1M: 1.00,
    outputCostPer1M: 5.00,
    maxContextTokens: 131072,
    maxOutputTokens: 8192,
    reasoningScore: 8,
    writingScore: 8,
    codingScore: 7,
    speedScore: 8,
    category: 'standard',
    description: 'Access to real-time X data, good for current events content'
  },

  // ==================== STANDARD MODELS ====================
  // DeepSeek Series (via OpenRouter)
  {
    modelId: 'deepseek/deepseek-v3.2',
    name: 'DeepSeek V3.2',
    provider: 'deepseek',
    apiSource: 'openrouter',
    inputCostPer1M: 0.27,
    outputCostPer1M: 1.10,
    maxContextTokens: 64000,
    maxOutputTokens: 8192,
    reasoningScore: 9,
    writingScore: 8,
    codingScore: 9,
    speedScore: 8,
    category: 'standard',
    isFeatured: true,
    description: 'Best value champion, matches GPT-4o at 1/40th cost'
  },
  {
    modelId: 'deepseek/deepseek-v3',
    name: 'DeepSeek V3',
    provider: 'deepseek',
    apiSource: 'openrouter',
    inputCostPer1M: 0.27,
    outputCostPer1M: 1.10,
    maxContextTokens: 64000,
    maxOutputTokens: 8192,
    reasoningScore: 8,
    writingScore: 8,
    codingScore: 9,
    speedScore: 8,
    category: 'standard',
    description: 'Excellent reasoning and tool use, very cost-effective'
  },
  {
    modelId: 'deepseek/deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'deepseek',
    apiSource: 'openrouter',
    inputCostPer1M: 0.55,
    outputCostPer1M: 2.19,
    maxContextTokens: 64000,
    maxOutputTokens: 8192,
    reasoningScore: 9,
    writingScore: 8,
    codingScore: 9,
    speedScore: 6,
    category: 'standard',
    isReasoningModel: true,
    description: 'Open-source reasoning model, excellent for analysis'
  },
  {
    modelId: 'deepseek/deepseek-coder-v2',
    name: 'DeepSeek Coder V2',
    provider: 'deepseek',
    apiSource: 'openrouter',
    inputCostPer1M: 0.14,
    outputCostPer1M: 0.28,
    maxContextTokens: 128000,
    maxOutputTokens: 4096,
    reasoningScore: 7,
    writingScore: 6,
    codingScore: 9,
    speedScore: 9,
    category: 'budget',
    description: 'Best for technical LinkedIn content and code explanations'
  },

  // Perplexity Series (via OpenRouter)
  {
    modelId: 'perplexity/sonar-pro',
    name: 'Sonar Pro',
    provider: 'perplexity',
    apiSource: 'openrouter',
    inputCostPer1M: 3.00,
    outputCostPer1M: 15.00,
    maxContextTokens: 200000,
    maxOutputTokens: 8192,
    reasoningScore: 8,
    writingScore: 8,
    codingScore: 7,
    speedScore: 8,
    category: 'standard',
    isFeatured: true,
    description: 'Real-time web search, great for research-backed content'
  },
  {
    modelId: 'perplexity/sonar',
    name: 'Sonar',
    provider: 'perplexity',
    apiSource: 'openrouter',
    inputCostPer1M: 1.00,
    outputCostPer1M: 1.00,
    maxContextTokens: 127000,
    maxOutputTokens: 4096,
    reasoningScore: 7,
    writingScore: 7,
    codingScore: 6,
    speedScore: 9,
    category: 'budget',
    description: 'Affordable with web search, good for current events'
  },
  {
    modelId: 'perplexity/llama-3.1-sonar-large-128k-online',
    name: 'Llama 3.1 Sonar Large Online',
    provider: 'perplexity',
    apiSource: 'openrouter',
    inputCostPer1M: 1.00,
    outputCostPer1M: 1.00,
    maxContextTokens: 128000,
    maxOutputTokens: 4096,
    reasoningScore: 7,
    writingScore: 7,
    codingScore: 6,
    speedScore: 9,
    category: 'budget',
    description: 'Online search with Llama 3.1, great for trending topics'
  },

  // Meta Llama Series (via OpenRouter)
  {
    modelId: 'meta-llama/llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B Instruct',
    provider: 'meta',
    apiSource: 'openrouter',
    inputCostPer1M: 0.35,
    outputCostPer1M: 0.40,
    maxContextTokens: 131072,
    maxOutputTokens: 8192,
    reasoningScore: 8,
    writingScore: 8,
    codingScore: 7,
    speedScore: 9,
    category: 'budget',
    isFeatured: true,
    description: 'Best open-source model, excellent value for money'
  },
  {
    modelId: 'meta-llama/llama-3.2-90b-vision-instruct',
    name: 'Llama 3.2 90B Vision',
    provider: 'meta',
    apiSource: 'openrouter',
    inputCostPer1M: 0.90,
    outputCostPer1M: 0.90,
    maxContextTokens: 131072,
    maxOutputTokens: 8192,
    reasoningScore: 8,
    writingScore: 8,
    codingScore: 7,
    speedScore: 8,
    category: 'standard',
    isMultimodal: true,
    description: 'Multimodal Llama, great for image + text content'
  },
  {
    modelId: 'meta-llama/llama-3.2-11b-vision-instruct',
    name: 'Llama 3.2 11B Vision',
    provider: 'meta',
    apiSource: 'openrouter',
    inputCostPer1M: 0.055,
    outputCostPer1M: 0.055,
    maxContextTokens: 131072,
    maxOutputTokens: 8192,
    reasoningScore: 6,
    writingScore: 7,
    codingScore: 5,
    speedScore: 10,
    category: 'free',
    isMultimodal: true,
    description: 'Lightweight multimodal, very affordable'
  },
  {
    modelId: 'meta-llama/llama-3.1-405b-instruct',
    name: 'Llama 3.1 405B Instruct',
    provider: 'meta',
    apiSource: 'openrouter',
    inputCostPer1M: 2.70,
    outputCostPer1M: 2.70,
    maxContextTokens: 131072,
    maxOutputTokens: 8192,
    reasoningScore: 9,
    writingScore: 9,
    codingScore: 8,
    speedScore: 6,
    category: 'standard',
    description: 'Largest Llama model, near-frontier performance'
  },
  {
    modelId: 'meta-llama/llama-3.1-70b-instruct',
    name: 'Llama 3.1 70B Instruct',
    provider: 'meta',
    apiSource: 'openrouter',
    inputCostPer1M: 0.35,
    outputCostPer1M: 0.40,
    maxContextTokens: 131072,
    maxOutputTokens: 8192,
    reasoningScore: 8,
    writingScore: 8,
    codingScore: 7,
    speedScore: 9,
    category: 'budget',
    description: 'Great balance of quality and speed'
  },
  {
    modelId: 'meta-llama/llama-3.1-8b-instruct',
    name: 'Llama 3.1 8B Instruct',
    provider: 'meta',
    apiSource: 'openrouter',
    inputCostPer1M: 0.055,
    outputCostPer1M: 0.055,
    maxContextTokens: 131072,
    maxOutputTokens: 8192,
    reasoningScore: 6,
    writingScore: 6,
    codingScore: 5,
    speedScore: 10,
    category: 'free',
    description: 'Fast and cheap, good for simple content'
  },

  // Mistral Series (via OpenRouter)
  {
    modelId: 'mistralai/devstral-2-2512',
    name: 'Devstral 2 2512',
    provider: 'mistral',
    apiSource: 'openrouter',
    inputCostPer1M: 0.35,
    outputCostPer1M: 0.39,
    maxContextTokens: 256000,
    maxOutputTokens: 8192,
    reasoningScore: 8,
    writingScore: 7,
    codingScore: 9,
    speedScore: 8,
    category: 'budget',
    isFeatured: true,
    description: '123B agentic coding model, MIT license, enterprise-ready'
  },
  {
    modelId: 'mistralai/mistral-large-2',
    name: 'Mistral Large 2',
    provider: 'mistral',
    apiSource: 'openrouter',
    inputCostPer1M: 2.00,
    outputCostPer1M: 6.00,
    maxContextTokens: 128000,
    maxOutputTokens: 8192,
    reasoningScore: 8,
    writingScore: 8,
    codingScore: 8,
    speedScore: 8,
    category: 'standard',
    description: 'Mistral flagship, great multilingual support'
  },
  {
    modelId: 'mistralai/mistral-medium',
    name: 'Mistral Medium',
    provider: 'mistral',
    apiSource: 'openrouter',
    inputCostPer1M: 1.00,
    outputCostPer1M: 3.00,
    maxContextTokens: 32000,
    maxOutputTokens: 8192,
    reasoningScore: 7,
    writingScore: 8,
    codingScore: 7,
    speedScore: 9,
    category: 'standard',
    description: 'Good balance model, efficient for content generation'
  },
  {
    modelId: 'mistralai/mistral-small',
    name: 'Mistral Small',
    provider: 'mistral',
    apiSource: 'openrouter',
    inputCostPer1M: 0.20,
    outputCostPer1M: 0.60,
    maxContextTokens: 32000,
    maxOutputTokens: 8192,
    reasoningScore: 6,
    writingScore: 7,
    codingScore: 6,
    speedScore: 10,
    category: 'budget',
    description: 'Fast and affordable, good for high-volume tasks'
  },
  {
    modelId: 'mistralai/mixtral-8x22b-instruct',
    name: 'Mixtral 8x22B Instruct',
    provider: 'mistral',
    apiSource: 'openrouter',
    inputCostPer1M: 0.65,
    outputCostPer1M: 0.65,
    maxContextTokens: 65536,
    maxOutputTokens: 4096,
    reasoningScore: 7,
    writingScore: 8,
    codingScore: 7,
    speedScore: 8,
    category: 'budget',
    description: 'MoE architecture, efficient and capable'
  },
  {
    modelId: 'mistralai/mixtral-8x7b-instruct',
    name: 'Mixtral 8x7B Instruct',
    provider: 'mistral',
    apiSource: 'openrouter',
    inputCostPer1M: 0.24,
    outputCostPer1M: 0.24,
    maxContextTokens: 32768,
    maxOutputTokens: 4096,
    reasoningScore: 6,
    writingScore: 7,
    codingScore: 6,
    speedScore: 9,
    category: 'budget',
    description: 'Original MoE, still great value'
  },

  // ==================== BUDGET MODELS ====================
  // GLM Series (via OpenRouter)
  {
    modelId: 'z.ai/glm-4.7',
    name: 'GLM 4.7',
    provider: 'zhipu',
    apiSource: 'openrouter',
    inputCostPer1M: 0.35,
    outputCostPer1M: 0.39,
    maxContextTokens: 131072,
    maxOutputTokens: 8192,
    reasoningScore: 8,
    writingScore: 8,
    codingScore: 8,
    speedScore: 8,
    category: 'budget',
    isFeatured: true,
    description: 'Enhanced programming, stable multi-step reasoning, great UI'
  },
  {
    modelId: 'z.ai/glm-4-plus',
    name: 'GLM 4 Plus',
    provider: 'zhipu',
    apiSource: 'openrouter',
    inputCostPer1M: 0.50,
    outputCostPer1M: 0.50,
    maxContextTokens: 128000,
    maxOutputTokens: 8192,
    reasoningScore: 7,
    writingScore: 8,
    codingScore: 7,
    speedScore: 8,
    category: 'budget',
    description: 'Chinese frontier model, strong multilingual'
  },
  {
    modelId: 'z.ai/glm-4-flash',
    name: 'GLM 4 Flash',
    provider: 'zhipu',
    apiSource: 'openrouter',
    inputCostPer1M: 0.014,
    outputCostPer1M: 0.014,
    maxContextTokens: 128000,
    maxOutputTokens: 8192,
    reasoningScore: 6,
    writingScore: 6,
    codingScore: 5,
    speedScore: 10,
    category: 'free',
    description: 'Ultra-fast and cheap, good for simple tasks'
  },

  // Qwen Series (via OpenRouter)
  {
    modelId: 'qwen/qwen-3-coder',
    name: 'Qwen 3 Coder',
    provider: 'alibaba',
    apiSource: 'openrouter',
    inputCostPer1M: 0.07,
    outputCostPer1M: 1.10,
    maxContextTokens: 131072,
    maxOutputTokens: 8192,
    reasoningScore: 7,
    writingScore: 6,
    codingScore: 9,
    speedScore: 9,
    category: 'budget',
    description: 'Best budget coding model, great for technical content'
  },
  {
    modelId: 'qwen/qwen-2.5-72b-instruct',
    name: 'Qwen 2.5 72B Instruct',
    provider: 'alibaba',
    apiSource: 'openrouter',
    inputCostPer1M: 0.35,
    outputCostPer1M: 0.40,
    maxContextTokens: 131072,
    maxOutputTokens: 8192,
    reasoningScore: 8,
    writingScore: 8,
    codingScore: 8,
    speedScore: 8,
    category: 'budget',
    description: 'Strong all-around model, great value'
  },
  {
    modelId: 'qwen/qwen-2.5-7b-instruct',
    name: 'Qwen 2.5 7B Instruct',
    provider: 'alibaba',
    apiSource: 'openrouter',
    inputCostPer1M: 0.015,
    outputCostPer1M: 0.015,
    maxContextTokens: 32768,
    maxOutputTokens: 4096,
    reasoningScore: 5,
    writingScore: 6,
    codingScore: 5,
    speedScore: 10,
    category: 'free',
    description: 'Very cheap, good for simple content'
  },
  {
    modelId: 'qwen/qwq-32b-preview',
    name: 'QwQ 32B Preview',
    provider: 'alibaba',
    apiSource: 'openrouter',
    inputCostPer1M: 0.12,
    outputCostPer1M: 0.18,
    maxContextTokens: 32768,
    maxOutputTokens: 16384,
    reasoningScore: 8,
    writingScore: 7,
    codingScore: 8,
    speedScore: 7,
    category: 'budget',
    isReasoningModel: true,
    description: 'Open-source reasoning model, good for analysis'
  },

  // MiniMax Series (via OpenRouter)
  {
    modelId: 'minimax/minimax-m2.1',
    name: 'MiniMax M2.1',
    provider: 'minimax',
    apiSource: 'openrouter',
    inputCostPer1M: 0.20,
    outputCostPer1M: 0.20,
    maxContextTokens: 65536,
    maxOutputTokens: 8192,
    reasoningScore: 8,
    writingScore: 8,
    codingScore: 9,
    speedScore: 8,
    category: 'budget',
    description: '10B activated params, 72.5% SWE-Bench, ultra-low cost'
  },

  // ByteDance Seed Series (via OpenRouter)
  {
    modelId: 'bytedance/seed-1.6',
    name: 'Seed 1.6',
    provider: 'bytedance',
    apiSource: 'openrouter',
    inputCostPer1M: 0.80,
    outputCostPer1M: 2.40,
    maxContextTokens: 256000,
    maxOutputTokens: 16384,
    reasoningScore: 8,
    writingScore: 8,
    codingScore: 7,
    speedScore: 7,
    category: 'standard',
    isReasoningModel: true,
    isMultimodal: true,
    description: 'Adaptive deep thinking, video understanding'
  },

  // NVIDIA Nemotron Series (via OpenRouter)
  {
    modelId: 'nvidia/nemotron-3-nano',
    name: 'Nemotron 3 Nano',
    provider: 'nvidia',
    apiSource: 'openrouter',
    inputCostPer1M: 0.02,
    outputCostPer1M: 0.02,
    maxContextTokens: 256000,
    maxOutputTokens: 4096,
    reasoningScore: 5,
    writingScore: 6,
    codingScore: 5,
    speedScore: 10,
    category: 'free',
    description: '30B MoE for agentic AI, fully open, 256K context'
  },
  {
    modelId: 'nvidia/nemotron-4-340b-instruct',
    name: 'Nemotron 4 340B Instruct',
    provider: 'nvidia',
    apiSource: 'openrouter',
    inputCostPer1M: 0.80,
    outputCostPer1M: 0.80,
    maxContextTokens: 4096,
    maxOutputTokens: 4096,
    reasoningScore: 8,
    writingScore: 8,
    codingScore: 7,
    speedScore: 7,
    category: 'standard',
    description: 'NVIDIA flagship, great for enterprise content'
  },

  // ==================== FREE MODELS ====================
  // Xiaomi MiMo Series
  {
    modelId: 'xiaomi/mimo-v2-flash',
    name: 'MiMo-V2-Flash',
    provider: 'xiaomi',
    apiSource: 'openrouter',
    inputCostPer1M: 0.035,
    outputCostPer1M: 0.035,
    maxContextTokens: 256000,
    maxOutputTokens: 8192,
    reasoningScore: 8,
    writingScore: 8,
    codingScore: 8,
    speedScore: 9,
    category: 'free',
    isFeatured: true,
    description: '309B MoE, matches Claude Sonnet 4.5 at 3.5% cost, 256K context'
  },

  // AllenAI OLMo Series
  {
    modelId: 'allenai/olmo-3.1-32b-think',
    name: 'OLMo 3.1 32B Think',
    provider: 'allenai',
    apiSource: 'openrouter',
    inputCostPer1M: 0.10,
    outputCostPer1M: 0.15,
    maxContextTokens: 131072,
    maxOutputTokens: 16384,
    reasoningScore: 7,
    writingScore: 7,
    codingScore: 6,
    speedScore: 8,
    category: 'budget',
    isReasoningModel: true,
    description: 'Open-source reasoning, Apache 2.0, full transparency'
  },
  {
    modelId: 'allenai/olmo-2-32b-instruct',
    name: 'OLMo 2 32B Instruct',
    provider: 'allenai',
    apiSource: 'openrouter',
    inputCostPer1M: 0.08,
    outputCostPer1M: 0.08,
    maxContextTokens: 131072,
    maxOutputTokens: 4096,
    reasoningScore: 7,
    writingScore: 7,
    codingScore: 6,
    speedScore: 9,
    category: 'budget',
    description: 'Fully open-source, great for transparency'
  },

  // DeepSeek Nex Series
  {
    modelId: 'deepseek/deepseek-v3.1-nex-n1',
    name: 'DeepSeek V3.1 Nex-N1',
    provider: 'deepseek',
    apiSource: 'openrouter',
    inputCostPer1M: 0.03,
    outputCostPer1M: 0.05,
    maxContextTokens: 64000,
    maxOutputTokens: 8192,
    reasoningScore: 7,
    writingScore: 7,
    codingScore: 8,
    speedScore: 9,
    category: 'free',
    description: 'Post-trained for agent autonomy, strong coding'
  },

  // Yi Series (01.AI)
  {
    modelId: '01-ai/yi-large',
    name: 'Yi Large',
    provider: '01ai',
    apiSource: 'openrouter',
    inputCostPer1M: 0.70,
    outputCostPer1M: 0.80,
    maxContextTokens: 32768,
    maxOutputTokens: 4096,
    reasoningScore: 7,
    writingScore: 8,
    codingScore: 6,
    speedScore: 9,
    category: 'budget',
    description: 'Strong bilingual (EN/CN), good for international content'
  },
  {
    modelId: '01-ai/yi-34b-chat',
    name: 'Yi 34B Chat',
    provider: '01ai',
    apiSource: 'openrouter',
    inputCostPer1M: 0.19,
    outputCostPer1M: 0.19,
    maxContextTokens: 4096,
    maxOutputTokens: 4096,
    reasoningScore: 6,
    writingScore: 7,
    codingScore: 5,
    speedScore: 9,
    category: 'budget',
    description: 'Affordable bilingual model'
  },

  // Command R Series (Cohere)
  {
    modelId: 'cohere/command-r-plus',
    name: 'Command R Plus',
    provider: 'cohere',
    apiSource: 'openrouter',
    inputCostPer1M: 2.50,
    outputCostPer1M: 10.00,
    maxContextTokens: 128000,
    maxOutputTokens: 4096,
    reasoningScore: 8,
    writingScore: 8,
    codingScore: 6,
    speedScore: 8,
    category: 'standard',
    supportsTools: true,
    description: 'Best for RAG and tool use, great for research-backed content'
  },
  {
    modelId: 'cohere/command-r',
    name: 'Command R',
    provider: 'cohere',
    apiSource: 'openrouter',
    inputCostPer1M: 0.50,
    outputCostPer1M: 1.50,
    maxContextTokens: 128000,
    maxOutputTokens: 4096,
    reasoningScore: 7,
    writingScore: 7,
    codingScore: 5,
    speedScore: 9,
    category: 'budget',
    supportsTools: true,
    description: 'Affordable RAG model with tool support'
  },
  {
    modelId: 'cohere/command',
    name: 'Command',
    provider: 'cohere',
    apiSource: 'openrouter',
    inputCostPer1M: 1.00,
    outputCostPer1M: 2.00,
    maxContextTokens: 4096,
    maxOutputTokens: 4096,
    reasoningScore: 6,
    writingScore: 8,
    codingScore: 4,
    speedScore: 9,
    category: 'budget',
    description: 'Cohere flagship, great for business writing'
  },

  // Phi Series (Microsoft)
  {
    modelId: 'microsoft/phi-4',
    name: 'Phi-4',
    provider: 'microsoft',
    apiSource: 'openrouter',
    inputCostPer1M: 0.14,
    outputCostPer1M: 0.28,
    maxContextTokens: 16384,
    maxOutputTokens: 4096,
    reasoningScore: 7,
    writingScore: 7,
    codingScore: 7,
    speedScore: 10,
    category: 'budget',
    description: '14B params, punches above weight, great for concise content'
  },
  {
    modelId: 'microsoft/phi-3.5-mini-128k-instruct',
    name: 'Phi-3.5 Mini 128K',
    provider: 'microsoft',
    apiSource: 'openrouter',
    inputCostPer1M: 0.10,
    outputCostPer1M: 0.10,
    maxContextTokens: 128000,
    maxOutputTokens: 4096,
    reasoningScore: 6,
    writingScore: 6,
    codingScore: 5,
    speedScore: 10,
    category: 'budget',
    description: 'Tiny but mighty, 128K context'
  },

  // Gemma Series (Google)
  {
    modelId: 'google/gemma-2-27b-it',
    name: 'Gemma 2 27B IT',
    provider: 'google',
    apiSource: 'openrouter',
    inputCostPer1M: 0.07,
    outputCostPer1M: 0.07,
    maxContextTokens: 8192,
    maxOutputTokens: 4096,
    reasoningScore: 6,
    writingScore: 7,
    codingScore: 6,
    speedScore: 10,
    category: 'budget',
    description: 'Open Google model, efficient and capable'
  },
  {
    modelId: 'google/gemma-2-9b-it',
    name: 'Gemma 2 9B IT',
    provider: 'google',
    apiSource: 'openrouter',
    inputCostPer1M: 0.03,
    outputCostPer1M: 0.03,
    maxContextTokens: 8192,
    maxOutputTokens: 4096,
    reasoningScore: 5,
    writingScore: 6,
    codingScore: 5,
    speedScore: 10,
    category: 'free',
    description: 'Small but efficient, very affordable'
  },

  // ==================== SPECIALIZED MODELS ====================
  // Hermes Series (Nous Research)
  {
    modelId: 'nousresearch/hermes-3-llama-3.1-405b',
    name: 'Hermes 3 Llama 405B',
    provider: 'nous',
    apiSource: 'openrouter',
    inputCostPer1M: 2.00,
    outputCostPer1M: 2.00,
    maxContextTokens: 131072,
    maxOutputTokens: 8192,
    reasoningScore: 9,
    writingScore: 9,
    codingScore: 8,
    speedScore: 6,
    category: 'standard',
    description: 'Fine-tuned Llama 405B, excellent for creative writing'
  },
  {
    modelId: 'nousresearch/hermes-3-llama-3.1-70b',
    name: 'Hermes 3 Llama 70B',
    provider: 'nous',
    apiSource: 'openrouter',
    inputCostPer1M: 0.35,
    outputCostPer1M: 0.40,
    maxContextTokens: 131072,
    maxOutputTokens: 8192,
    reasoningScore: 8,
    writingScore: 9,
    codingScore: 7,
    speedScore: 8,
    category: 'budget',
    description: 'Fine-tuned for creative and professional writing'
  },

  // Solar Series (Upstage)
  {
    modelId: 'upstage/solar-10.7b-instruct',
    name: 'Solar 10.7B Instruct',
    provider: 'upstage',
    apiSource: 'openrouter',
    inputCostPer1M: 0.10,
    outputCostPer1M: 0.10,
    maxContextTokens: 4096,
    maxOutputTokens: 4096,
    reasoningScore: 6,
    writingScore: 7,
    codingScore: 5,
    speedScore: 10,
    category: 'budget',
    description: 'Korean model, great for concise content'
  },

  // Kimi Series (Moonshot)
  {
    modelId: 'moonshot/kimi-2.5-agent',
    name: 'Kimi K2.5 Agent',
    provider: 'moonshot',
    apiSource: 'openrouter',
    inputCostPer1M: 0.60,
    outputCostPer1M: 1.20,
    maxContextTokens: 131072,
    maxOutputTokens: 8192,
    reasoningScore: 8,
    writingScore: 8,
    codingScore: 7,
    speedScore: 8,
    category: 'standard',
    description: 'Agent swarm capabilities, great for complex tasks'
  },
  {
    modelId: 'moonshot/kimi-dev-72b',
    name: 'Kimi Dev 72B',
    provider: 'moonshot',
    apiSource: 'openrouter',
    inputCostPer1M: 0.35,
    outputCostPer1M: 0.40,
    maxContextTokens: 128000,
    maxOutputTokens: 8192,
    reasoningScore: 7,
    writingScore: 7,
    codingScore: 8,
    speedScore: 8,
    category: 'budget',
    description: 'Developer-focused, great for technical content'
  },

  // Aether Series
  {
    modelId: 'aether/aether-1b',
    name: 'Aether 1B',
    provider: 'aether',
    apiSource: 'openrouter',
    inputCostPer1M: 0.001,
    outputCostPer1M: 0.001,
    maxContextTokens: 2048,
    maxOutputTokens: 1024,
    reasoningScore: 3,
    writingScore: 4,
    codingScore: 2,
    speedScore: 10,
    category: 'free',
    description: 'Ultra-light, nearly free, for simplest tasks'
  },

  // GPT-4o Mini (OpenAI)
  {
    modelId: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    apiSource: 'openai',
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.60,
    maxContextTokens: 128000,
    maxOutputTokens: 16384,
    reasoningScore: 7,
    writingScore: 8,
    codingScore: 7,
    speedScore: 10,
    category: 'budget',
    isFeatured: true,
    description: 'Best budget OpenAI model, fast and capable'
  },
  {
    modelId: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    apiSource: 'openai',
    inputCostPer1M: 10.00,
    outputCostPer1M: 30.00,
    maxContextTokens: 128000,
    maxOutputTokens: 4096,
    reasoningScore: 8,
    writingScore: 9,
    codingScore: 8,
    speedScore: 7,
    category: 'premium',
    description: 'Previous generation flagship, still excellent'
  },
  {
    modelId: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    apiSource: 'openai',
    inputCostPer1M: 0.50,
    outputCostPer1M: 1.50,
    maxContextTokens: 16384,
    maxOutputTokens: 4096,
    reasoningScore: 5,
    writingScore: 6,
    codingScore: 5,
    speedScore: 10,
    category: 'budget',
    description: 'Classic budget model, fast and reliable'
  },

  // WizardLM Series
  {
    modelId: 'microsoft/wizardlm-2-8x22b',
    name: 'WizardLM 2 8x22B',
    provider: 'microsoft',
    apiSource: 'openrouter',
    inputCostPer1M: 0.55,
    outputCostPer1M: 0.55,
    maxContextTokens: 65536,
    maxOutputTokens: 4096,
    reasoningScore: 7,
    writingScore: 8,
    codingScore: 7,
    speedScore: 8,
    category: 'budget',
    description: 'MoE architecture, good for diverse content'
  },
  {
    modelId: 'microsoft/wizardlm-2-7b',
    name: 'WizardLM 2 7B',
    provider: 'microsoft',
    apiSource: 'openrouter',
    inputCostPer1M: 0.035,
    outputCostPer1M: 0.035,
    maxContextTokens: 4096,
    maxOutputTokens: 4096,
    reasoningScore: 5,
    writingScore: 6,
    codingScore: 5,
    speedScore: 10,
    category: 'free',
    description: 'Small WizardLM, very affordable'
  },

  // OpenChat Series
  {
    modelId: 'openchat/openchat-7b',
    name: 'OpenChat 7B',
    provider: 'openchat',
    apiSource: 'openrouter',
    inputCostPer1M: 0.03,
    outputCostPer1M: 0.03,
    maxContextTokens: 8192,
    maxOutputTokens: 4096,
    reasoningScore: 5,
    writingScore: 6,
    codingScore: 4,
    speedScore: 10,
    category: 'free',
    description: 'Open-source chat model, good for basic content'
  },

  // Pygmalion Series
  {
    modelId: 'pygmalion-ai/mythalion-13b',
    name: 'Mythalion 13B',
    provider: 'pygmalion',
    apiSource: 'openrouter',
    inputCostPer1M: 0.07,
    outputCostPer1M: 0.07,
    maxContextTokens: 8192,
    maxOutputTokens: 4096,
    reasoningScore: 5,
    writingScore: 7,
    codingScore: 3,
    speedScore: 9,
    category: 'budget',
    description: 'Creative writing focused, good for storytelling'
  },

  // Hugging Face Zephyr
  {
    modelId: 'huggingfaceh4/zephyr-7b-beta',
    name: 'Zephyr 7B Beta',
    provider: 'huggingface',
    apiSource: 'openrouter',
    inputCostPer1M: 0.035,
    outputCostPer1M: 0.035,
    maxContextTokens: 4096,
    maxOutputTokens: 4096,
    reasoningScore: 5,
    writingScore: 6,
    codingScore: 4,
    speedScore: 10,
    category: 'free',
    description: 'HuggingFace alignment, good for conversational content'
  },

  // Teknium OpenHermes
  {
    modelId: 'teknium/openhermes-2.5-mistral-7b',
    name: 'OpenHermes 2.5 Mistral 7B',
    provider: 'teknium',
    apiSource: 'openrouter',
    inputCostPer1M: 0.016,
    outputCostPer1M: 0.016,
    maxContextTokens: 4096,
    maxOutputTokens: 4096,
    reasoningScore: 5,
    writingScore: 6,
    codingScore: 4,
    speedScore: 10,
    category: 'free',
    description: 'Fine-tuned Mistral, good for general content'
  },

  // Intel Neural Chat
  {
    modelId: 'intel/neural-chat-7b',
    name: 'Neural Chat 7B',
    provider: 'intel',
    apiSource: 'openrouter',
    inputCostPer1M: 0.02,
    outputCostPer1M: 0.02,
    maxContextTokens: 4096,
    maxOutputTokens: 4096,
    reasoningScore: 4,
    writingScore: 5,
    codingScore: 3,
    speedScore: 10,
    category: 'free',
    description: 'Intel optimized, efficient inference'
  },

  // Cognitive Computations Dolphin
  {
    modelId: 'cognitivecomputations/dolphin-mixtral-8x7b',
    name: 'Dolphin Mixtral 8x7B',
    provider: 'cognitive',
    apiSource: 'openrouter',
    inputCostPer1M: 0.24,
    outputCostPer1M: 0.24,
    maxContextTokens: 32768,
    maxOutputTokens: 4096,
    reasoningScore: 6,
    writingScore: 7,
    codingScore: 6,
    speedScore: 9,
    category: 'budget',
    description: 'Uncensored Mixtral, good for unrestricted content'
  },

  // Sao10K Series
  {
    modelId: 'sao10k/fimbulvetr-11b-v2',
    name: 'Fimbulvetr 11B V2',
    provider: 'sao10k',
    apiSource: 'openrouter',
    inputCostPer1M: 0.055,
    outputCostPer1M: 0.055,
    maxContextTokens: 8192,
    maxOutputTokens: 4096,
    reasoningScore: 5,
    writingScore: 6,
    codingScore: 4,
    speedScore: 10,
    category: 'free',
    description: 'Roleplay focused, creative writing'
  },

  // Undi95 Series
  {
    modelId: 'undi95/toppy-m-7b',
    name: 'Toppy M 7B',
    provider: 'undi95',
    apiSource: 'openrouter',
    inputCostPer1M: 0.03,
    outputCostPer1M: 0.03,
    maxContextTokens: 4096,
    maxOutputTokens: 4096,
    reasoningScore: 4,
    writingScore: 6,
    codingScore: 3,
    speedScore: 10,
    category: 'free',
    description: 'Creative writing focused'
  },

  // Gryphe Mythomax
  {
    modelId: 'gryphe/mythomax-l2-13b',
    name: 'MythoMax L2 13B',
    provider: 'gryphe',
    apiSource: 'openrouter',
    inputCostPer1M: 0.07,
    outputCostPer1M: 0.07,
    maxContextTokens: 4096,
    maxOutputTokens: 4096,
    reasoningScore: 5,
    writingScore: 7,
    codingScore: 3,
    speedScore: 9,
    category: 'budget',
    description: 'Storytelling focused, good for narrative content'
  },

  // Neversleep Series
  {
    modelId: 'neversleep/noromaid-mixtral-8x7b-instruct',
    name: 'Noromaid Mixtral 8x7B',
    provider: 'neversleep',
    apiSource: 'openrouter',
    inputCostPer1M: 0.24,
    outputCostPer1M: 0.24,
    maxContextTokens: 8000,
    maxOutputTokens: 4096,
    reasoningScore: 6,
    writingScore: 7,
    codingScore: 5,
    speedScore: 9,
    category: 'budget',
    description: 'Uncensored, good for unrestricted content'
  },

  // Snowflake Arctic
  {
    modelId: 'snowflake/arctic-instruct',
    name: 'Arctic Instruct',
    provider: 'snowflake',
    apiSource: 'openrouter',
    inputCostPer1M: 0.28,
    outputCostPer1M: 0.28,
    maxContextTokens: 4096,
    maxOutputTokens: 4096,
    reasoningScore: 7,
    writingScore: 7,
    codingScore: 6,
    speedScore: 9,
    category: 'budget',
    description: 'Enterprise-focused, good for business content'
  },

  // Inflection Pi
  {
    modelId: 'inflection/pi',
    name: 'Pi',
    provider: 'inflection',
    apiSource: 'openrouter',
    inputCostPer1M: 0.50,
    outputCostPer1M: 0.50,
    maxContextTokens: 8000,
    maxOutputTokens: 4096,
    reasoningScore: 6,
    writingScore: 8,
    codingScore: 4,
    speedScore: 9,
    category: 'budget',
    description: 'Emotionally intelligent, great for empathetic content'
  },

  // Adept Persimmon
  {
    modelId: 'adept/persimmon-8b-chat',
    name: 'Persimmon 8B Chat',
    provider: 'adept',
    apiSource: 'openrouter',
    inputCostPer1M: 0.03,
    outputCostPer1M: 0.03,
    maxContextTokens: 4096,
    maxOutputTokens: 4096,
    reasoningScore: 4,
    writingScore: 5,
    codingScore: 3,
    speedScore: 10,
    category: 'free',
    description: 'Adept AI model, efficient'
  },

  // Together Computer
  {
    modelId: 'togethercomputer/stripedhyena-nous-7b',
    name: 'StripedHyena Nous 7B',
    provider: 'together',
    apiSource: 'openrouter',
    inputCostPer1M: 0.03,
    outputCostPer1M: 0.03,
    maxContextTokens: 32768,
    maxOutputTokens: 4096,
    reasoningScore: 5,
    writingScore: 6,
    codingScore: 4,
    speedScore: 10,
    category: 'free',
    description: 'Alternative architecture, long context'
  },

  // Databricks Dolly
  {
    modelId: 'databricks/dolly-v2-12b',
    name: 'Dolly V2 12B',
    provider: 'databricks',
    apiSource: 'openrouter',
    inputCostPer1M: 0.05,
    outputCostPer1M: 0.05,
    maxContextTokens: 2048,
    maxOutputTokens: 1024,
    reasoningScore: 4,
    writingScore: 5,
    codingScore: 3,
    speedScore: 10,
    category: 'free',
    description: 'Instruction following, open-source'
  },

  // TII Falcon
  {
    modelId: 'tiiuae/falcon-180b-chat',
    name: 'Falcon 180B Chat',
    provider: 'tii',
    apiSource: 'openrouter',
    inputCostPer1M: 0.90,
    outputCostPer1M: 0.90,
    maxContextTokens: 2048,
    maxOutputTokens: 1024,
    reasoningScore: 7,
    writingScore: 7,
    codingScore: 6,
    speedScore: 7,
    category: 'standard',
    description: 'Large open model, good for research'
  },
  {
    modelId: 'tiiuae/falcon-7b-instruct',
    name: 'Falcon 7B Instruct',
    provider: 'tii',
    apiSource: 'openrouter',
    inputCostPer1M: 0.02,
    outputCostPer1M: 0.02,
    maxContextTokens: 2048,
    maxOutputTokens: 1024,
    reasoningScore: 4,
    writingScore: 5,
    codingScore: 3,
    speedScore: 10,
    category: 'free',
    description: 'Lightweight Falcon, very affordable'
  },

  // Stability AI
  {
    modelId: 'stability-ai/sdxl-turbo',
    name: 'SDXL Turbo',
    provider: 'stability',
    apiSource: 'openrouter',
    inputCostPer1M: 0.05,
    outputCostPer1M: 0.05,
    maxContextTokens: 2048,
    maxOutputTokens: 1024,
    reasoningScore: 3,
    writingScore: 4,
    codingScore: 2,
    speedScore: 10,
    category: 'free',
    description: 'Image generation focused, text capabilities limited'
  },

  // Additional Premium Models
  {
    modelId: 'anthropic/claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    apiSource: 'openrouter',
    inputCostPer1M: 15.00,
    outputCostPer1M: 75.00,
    maxContextTokens: 200000,
    maxOutputTokens: 4096,
    reasoningScore: 9,
    writingScore: 10,
    codingScore: 9,
    speedScore: 5,
    category: 'premium',
    isMultimodal: true,
    description: 'Previous Anthropic flagship, still excellent for writing'
  },
  {
    modelId: 'anthropic/claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'anthropic',
    apiSource: 'openrouter',
    inputCostPer1M: 3.00,
    outputCostPer1M: 15.00,
    maxContextTokens: 200000,
    maxOutputTokens: 4096,
    reasoningScore: 8,
    writingScore: 9,
    codingScore: 8,
    speedScore: 8,
    category: 'standard',
    isMultimodal: true,
    description: 'Balanced Claude 3, great for professional content'
  },
  {
    modelId: 'anthropic/claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'anthropic',
    apiSource: 'openrouter',
    inputCostPer1M: 0.25,
    outputCostPer1M: 1.25,
    maxContextTokens: 200000,
    maxOutputTokens: 4096,
    reasoningScore: 6,
    writingScore: 7,
    codingScore: 6,
    speedScore: 10,
    category: 'budget',
    isMultimodal: true,
    description: 'Fast Claude, great for high-volume content'
  },
];

async function main() {
  console.log('Seeding AI models...');
  
  let created = 0;
  let updated = 0;
  
  for (const model of AI_MODELS) {
    try {
      const existing = await prisma.aIModel.findUnique({
        where: { modelId: model.modelId }
      });
      
      if (existing) {
        await prisma.aIModel.update({
          where: { modelId: model.modelId },
          data: {
            ...model,
            lastUpdated: new Date()
          }
        });
        updated++;
      } else {
        await prisma.aIModel.create({
          data: model
        });
        created++;
      }
    } catch (error) {
      console.error(`Error seeding model ${model.modelId}:`, error.message);
    }
  }
  
  console.log(`Seeding complete! Created: ${created}, Updated: ${updated}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
