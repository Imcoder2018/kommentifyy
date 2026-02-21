/**
 * Unified AI Service
 * Routes AI calls to the appropriate provider:
 * - OpenAI models (gpt-*, o1-*, o3-*) -> Official OpenAI API
 * - All other models -> OpenRouter API
 */

import { getOpenAIService } from './openai-service';
import { getOpenRouterService } from './openrouter-service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AIModelConfig {
  modelId: string;
  provider: string;
  apiSource: 'openai' | 'openrouter';
  inputCostPer1M: number;
  outputCostPer1M: number;
  maxContextTokens: number;
  maxOutputTokens: number;
}

export interface AIGenerationResult {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  provider: string;
  cost: number;
}

// Determine if a model should use OpenAI API directly
function isOpenAIModel(modelId: string): boolean {
  return modelId.startsWith('gpt-') || 
         modelId.startsWith('o1') || 
         modelId.startsWith('o3') ||
         modelId.startsWith('chatgpt');
}

// Calculate cost based on token usage
function calculateCost(
  inputTokens: number,
  outputTokens: number,
  inputCostPer1M: number,
  outputCostPer1M: number
): number {
  return (inputTokens / 1_000_000) * inputCostPer1M + 
         (outputTokens / 1_000_000) * outputCostPer1M;
}

// Get model configuration from database
export async function getModelConfig(modelId: string): Promise<AIModelConfig | null> {
  const model = await prisma.aIModel.findUnique({
    where: { modelId },
    select: {
      modelId: true,
      provider: true,
      apiSource: true,
      inputCostPer1M: true,
      outputCostPer1M: true,
      maxContextTokens: true,
      maxOutputTokens: true
    }
  });

  if (!model) return null;

  return {
    modelId: model.modelId,
    provider: model.provider,
    apiSource: model.apiSource as 'openai' | 'openrouter',
    inputCostPer1M: model.inputCostPer1M,
    outputCostPer1M: model.outputCostPer1M,
    maxContextTokens: model.maxContextTokens,
    maxOutputTokens: model.maxOutputTokens
  };
}

// Valid OpenRouter model ID prefixes
const VALID_OPENROUTER_PREFIXES = [
  'openai/', 'anthropic/', 'google/', 'meta-llama/', 'mistralai/',
  'deepseek/', 'qwen/', 'microsoft/', 'nousresearch/', 'cognitivecomputations/',
  'perplexity/', 'x-ai/', '01-ai/', 'cohere/', 'nvidia/', 'adept/', 'fireworks/',
  'anyscale/', 'leptonai/', 'sglang/', 'hyper/', 'togetherai/', 'replicate/', 'together/',
  'ai21/', 'cohere-', 'voyage/', 'jamba/', 'minimax/', 'abacusai/', 'lightonai/',
  'volcengine/', 'baichuan/', 'yi/', 'infinite/', 'openchat/', 'lmsys/', 'mlc-ai/',
  'samba-', 'starling/', 'teknium/', 'upstage/', 'vllm/', 'x/', 'yandex/', 'zhipuai/',
  'z-ai/', 'moonshot/', 'bytedance/', 'xiaomi/', 'allenai/', 'stability-ai/', 'aether/',
  'intel/', 'togethercomputer/', 'undi95/', 'databricks/', 'sao10k/', 'inflection/',
  'huggingfaceh4/', 'neversleep/', 'gryphe/', 'pygmalion-ai/', 'snowflake/', 'tiiuae/',
  'huggingface/'
];

function isValidOpenRouterModel(modelId: string): boolean {
  // OpenAI direct models (gpt-*, o1-*, o3-*) are valid even without slash - they use OpenAI API
  if (modelId.startsWith('gpt-') || modelId.startsWith('o1') || modelId.startsWith('o3')) {
    return true;
  }
  // Must contain a slash and start with a valid provider prefix
  if (!modelId.includes('/')) return false;
  const prefix = modelId.toLowerCase().split('/')[0] + '/';
  return VALID_OPENROUTER_PREFIXES.some(p => prefix.startsWith(p));
}

// Get user's preferred model for a content type
export async function getUserModel(userId: string, contentType: 'post' | 'comment' | 'topic'): Promise<string> {
  const settings = await prisma.userAIModelSettings.findUnique({
    where: { userId }
  });

  const modelField = {
    post: 'postModelId',
    comment: 'commentModelId',
    topic: 'topicModelId'
  }[contentType] as keyof typeof settings;

  const selectedModel = settings?.[modelField];
  
  if (selectedModel) {
    // Verify model is still enabled, valid, and has correct format
    const model = await prisma.aIModel.findFirst({
      where: { modelId: selectedModel, isEnabled: true }
    });
    
    // Check if model ID format is valid for OpenRouter
    const isValidFormat = isValidOpenRouterModel(selectedModel);
    
    if (model && isValidFormat) {
      console.log(`✅ Using user-selected model: ${selectedModel} for ${contentType}`);
      return selectedModel;
    } else {
      if (!isValidFormat) {
        console.warn(`⚠️ Model ${selectedModel} has invalid format, falling back`);
      } else {
        console.warn(`⚠️ Model ${selectedModel} not found or disabled, falling back`);
      }
    }
  }

  // Fallback to default model - verify it exists and has valid format
  const fallbackModel = settings?.fallbackModelId || 'openai/gpt-4o-mini';
  const fallbackExists = await prisma.aIModel.findFirst({
    where: { modelId: fallbackModel, isEnabled: true }
  });
  
  if (fallbackExists && isValidOpenRouterModel(fallbackModel)) {
    console.log(`✅ Using fallback model: ${fallbackModel} for ${contentType}`);
    return fallbackModel;
  }
  
  // Ultimate fallback - find any enabled model with valid format
  const anyModel = await prisma.aIModel.findFirst({
    where: { isEnabled: true },
    orderBy: { isFeatured: 'desc' }
  });
  
  if (anyModel && isValidOpenRouterModel(anyModel.modelId)) {
    console.log(`✅ Using any available model: ${anyModel.modelId} for ${contentType}`);
    return anyModel.modelId;
  }
  
  // Hard fallback to OpenAI (always valid)
  console.log(`⚠️ No valid models in database, using hardcoded fallback: openai/gpt-4o-mini`);
  return 'openai/gpt-4o-mini';
}

// Track usage
export async function trackUsage(
  userId: string,
  modelId: string,
  inputTokens: number,
  outputTokens: number,
  cost: number
): Promise<void> {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);

  await prisma.aIModelUsage.upsert({
    where: {
      userId_modelId_periodStart: {
        userId,
        modelId,
        periodStart
      }
    },
    create: {
      userId,
      modelId,
      totalRequests: 1,
      totalInputTokens: inputTokens,
      totalOutputTokens: outputTokens,
      totalCost: cost,
      periodStart
    },
    update: {
      totalRequests: { increment: 1 },
      totalInputTokens: { increment: inputTokens },
      totalOutputTokens: { increment: outputTokens },
      totalCost: { increment: cost }
    }
  });
}

// Main generation function - routes to appropriate provider
export async function generateContent(params: {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
  userId?: string;
  trackUsage?: boolean;
}): Promise<AIGenerationResult> {
  let modelConfig = await getModelConfig(params.model);
   
  // If model not found in database, try to find a fallback
  if (!modelConfig) {
    console.warn(`⚠️ Model ${params.model} not found in database, finding fallback...`);
    
    // Find any enabled model
    const fallbackModel = await prisma.aIModel.findFirst({
      where: { isEnabled: true },
      orderBy: { isFeatured: 'desc' }
    });
    
    if (fallbackModel) {
      console.log(`✅ Using fallback model: ${fallbackModel.modelId}`);
      modelConfig = {
        modelId: fallbackModel.modelId,
        provider: fallbackModel.provider,
        apiSource: fallbackModel.apiSource as 'openai' | 'openrouter',
        inputCostPer1M: fallbackModel.inputCostPer1M,
        outputCostPer1M: fallbackModel.outputCostPer1M,
        maxContextTokens: fallbackModel.maxContextTokens,
        maxOutputTokens: fallbackModel.maxOutputTokens
      };
      params.model = fallbackModel.modelId; // Update model to fallback
    } else {
      // Ultimate fallback to OpenAI GPT-4o-mini
      console.log(`⚠️ No models in database, using hardcoded fallback: openai/gpt-4o-mini`);
      modelConfig = {
        modelId: 'openai/gpt-4o-mini',
        provider: 'OpenAI',
        apiSource: 'openai',
        inputCostPer1M: 0.15,
        outputCostPer1M: 0.60,
        maxContextTokens: 128000,
        maxOutputTokens: 16384
      };
      params.model = 'openai/gpt-4o-mini';
    }
  }

  let result: { content: string; usage: { promptTokens: number; completionTokens: number; totalTokens: number } };

  // Route to appropriate provider
  if (modelConfig.apiSource === 'openai' || isOpenAIModel(params.model)) {
    const openai = getOpenAIService();
    result = await openai.generateContent({
      model: params.model,
      systemPrompt: params.systemPrompt,
      userPrompt: params.userPrompt,
      maxTokens: params.maxTokens || modelConfig.maxOutputTokens,
      temperature: params.temperature
    });
  } else {
    const openrouter = getOpenRouterService();
    result = await openrouter.generateContent({
      model: params.model,
      systemPrompt: params.systemPrompt,
      userPrompt: params.userPrompt,
      maxTokens: params.maxTokens || modelConfig.maxOutputTokens,
      temperature: params.temperature
    });
  }

  // Calculate cost
  const cost = calculateCost(
    result.usage.promptTokens,
    result.usage.completionTokens,
    modelConfig.inputCostPer1M,
    modelConfig.outputCostPer1M
  );

  // Track usage if userId provided
  if (params.userId && params.trackUsage !== false) {
    await trackUsage(
      params.userId,
      params.model,
      result.usage.promptTokens,
      result.usage.completionTokens,
      cost
    );
  }

  return {
    content: result.content,
    usage: result.usage,
    model: params.model,
    provider: modelConfig.provider,
    cost
  };
}

// Generate LinkedIn post
export async function generateLinkedInPost(params: {
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
  userId?: string;
}): Promise<AIGenerationResult> {
  const modelConfig = await getModelConfig(params.model);
  
  if (!modelConfig) {
    throw new Error(`Model not found: ${params.model}`);
  }

  let result: { post: string; usage: any };

  if (modelConfig.apiSource === 'openai' || isOpenAIModel(params.model)) {
    const openai = getOpenAIService();
    result = await openai.generateLinkedInPost(params);
  } else {
    const openrouter = getOpenRouterService();
    result = await openrouter.generateLinkedInPost(params);
  }

  const cost = calculateCost(
    result.usage.promptTokens,
    result.usage.completionTokens,
    modelConfig.inputCostPer1M,
    modelConfig.outputCostPer1M
  );

  if (params.userId) {
    await trackUsage(params.userId, params.model, result.usage.promptTokens, result.usage.completionTokens, cost);
  }

  return {
    content: result.post,
    usage: result.usage,
    model: params.model,
    provider: modelConfig.provider,
    cost
  };
}

// Generate LinkedIn comment
export async function generateLinkedInComment(params: {
  model: string;
  postContent: string;
  goal: string;
  tone: string;
  length: string;
  style: string;
  userProfile?: string;
  userExpertise?: string;
  userBackground?: string;
  userId?: string;
}): Promise<AIGenerationResult> {
  const modelConfig = await getModelConfig(params.model);
  
  if (!modelConfig) {
    throw new Error(`Model not found: ${params.model}`);
  }

  let result: { comment: string; usage: any };

  if (modelConfig.apiSource === 'openai' || isOpenAIModel(params.model)) {
    const openai = getOpenAIService();
    result = await openai.generateLinkedInComment(params);
  } else {
    const openrouter = getOpenRouterService();
    result = await openrouter.generateLinkedInComment(params);
  }

  const cost = calculateCost(
    result.usage.promptTokens,
    result.usage.completionTokens,
    modelConfig.inputCostPer1M,
    modelConfig.outputCostPer1M
  );

  if (params.userId) {
    await trackUsage(params.userId, params.model, result.usage.promptTokens, result.usage.completionTokens, cost);
  }

  return {
    content: result.comment,
    usage: result.usage,
    model: params.model,
    provider: modelConfig.provider,
    cost
  };
}

// Generate topic ideas
export async function generateTopicIdeas(params: {
  model: string;
  industry: string;
  role: string;
  interests: string[];
  count: number;
  userProfile?: string;
  userId?: string;
}): Promise<{ topics: string[]; usage: any; model: string; provider: string; cost: number }> {
  const modelConfig = await getModelConfig(params.model);
  
  if (!modelConfig) {
    throw new Error(`Model not found: ${params.model}`);
  }

  let result: { topics: string[]; usage: any };

  if (modelConfig.apiSource === 'openai' || isOpenAIModel(params.model)) {
    const openai = getOpenAIService();
    result = await openai.generateTopicIdeas(params);
  } else {
    const openrouter = getOpenRouterService();
    result = await openrouter.generateTopicIdeas(params);
  }

  const cost = calculateCost(
    result.usage.promptTokens,
    result.usage.completionTokens,
    modelConfig.inputCostPer1M,
    modelConfig.outputCostPer1M
  );

  if (params.userId) {
    await trackUsage(params.userId, params.model, result.usage.promptTokens, result.usage.completionTokens, cost);
  }

  return {
    topics: result.topics,
    usage: result.usage,
    model: params.model,
    provider: modelConfig.provider,
    cost
  };
}

export default {
  generateContent,
  generateLinkedInPost,
  generateLinkedInComment,
  generateTopicIdeas,
  getModelConfig,
  getUserModel,
  trackUsage
};
