# Project Codebase: lib

## 1. Project Structure

```text
.
├── adminAuth.ts
├── ai-service.ts
├── auth.ts
    ├── ghl-service.ts
    ├── index.ts
    ├── scheduler.ts
    ├── templates.ts
├── email-service.ts
├── email-templates-library.ts
├── html-email-templates.ts
    ├── I18nProvider.tsx
    ├── index.ts
        ├── ar.ts
        ├── de.ts
        ├── en.ts
        ├── es.ts
        ├── fr.ts
        ├── hi.ts
        ├── pt.ts
        ├── tr.ts
        ├── ur.ts
        ├── zh.ts
├── kommentify-email-html.ts
├── limit-service.ts
├── linkedin-formatter.ts
├── linkedin-service.ts
├── linkedin-url-cleaner.ts
├── openai-config.ts
├── openai-service.ts
├── openrouter-service.ts
├── prisma.ts
├── referral-utils.ts
├── user-service.ts
```

## 2. File Contents

### adminAuth.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractToken } from './auth'; // #9: Import from auth.ts instead of duplicating

// Re-export extractToken for backward compatibility
export { extractToken };

/**
 * Verify admin authentication
 * Returns admin data if valid, throws error if not
 */
export function verifyAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = extractToken(authHeader);

  if (!token) {
    throw new Error('No authentication token provided');
  }

  try {
    const payload = verifyToken(token);

    // Check if user has admin role
    if (payload.role !== 'admin') {
      throw new Error('Insufficient permissions');
    }

    return payload;
  } catch (error: any) {
    if (error.message === 'Insufficient permissions') {
      throw error; // Re-throw permission errors as-is
    }
    throw new Error(`Invalid or expired token: ${error.message}`);
  }
}

// #10: Proper handler type instead of generic Function
type AdminRouteHandler = (request: NextRequest, ...args: any[]) => Promise<NextResponse>;

/**
 * Middleware wrapper for admin-only routes
 * #11: Returns 401 for auth failures, 403 for insufficient permissions
 */
export function requireAdmin(handler: AdminRouteHandler) {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      const admin = verifyAdminAuth(request);

      // Add admin data to request for use in handler
      (request as any).admin = admin;

      return await handler(request, ...args);
    } catch (error: any) {
      console.error('Admin auth error:', error.message);

      // #11: Distinguish between 401 (no/invalid token) and 403 (insufficient permissions)
      const isPermissionError = error.message === 'Insufficient permissions';
      return NextResponse.json(
        {
          success: false,
          error: isPermissionError ? 'Insufficient permissions' : 'Unauthorized access'
        },
        { status: isPermissionError ? 403 : 401 }
      );
    }
  };
}

```

---

### ai-service.ts

```typescript
/**
 * Unified AI Service
 * Routes AI calls to the appropriate provider:
 * - OpenAI models (gpt-*, o1-*, o3-*) -> Official OpenAI API
 * - All other models -> OpenRouter API
 */

import { getOpenAIService } from './openai-service';
import { getOpenRouterService } from './openrouter-service';
import { prisma } from './prisma';

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

  // #12: Fallback model extracted to constant — change in one place if model is deprecated
  const DEFAULT_FALLBACK_MODEL = 'anthropic/claude-sonnet-4.5';
  const fallbackModel = settings?.fallbackModelId || DEFAULT_FALLBACK_MODEL;
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

  // Hard fallback to Claude Sonnet 4.5 (always valid via OpenRouter)
  console.log(`⚠️ No valid models in database, using hardcoded fallback: anthropic/claude-sonnet-4.5`);
  return 'anthropic/claude-sonnet-4.5';
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
      // Ultimate fallback to Claude Sonnet 4.5
      console.log(`⚠️ No models in database, using hardcoded fallback: anthropic/claude-sonnet-4.5`);
      modelConfig = {
        modelId: 'anthropic/claude-sonnet-4.5',
        provider: 'Anthropic',
        apiSource: 'openrouter',
        inputCostPer1M: 3.00,
        outputCostPer1M: 15.00,
        maxContextTokens: 200000,
        maxOutputTokens: 8192
      };
      params.model = 'anthropic/claude-sonnet-4.5';
    }
  }

  let result: { content: string; usage: { promptTokens: number; completionTokens: number; totalTokens: number } };

  // Route to appropriate provider
  // Strip openai/ prefix if present for OpenAI API calls
  const actualModelId = params.model.startsWith('openai/') ? params.model.replace('openai/', '') : params.model;

  const OPENAI_FALLBACK_MODEL = 'gpt-4o';

  try {
    if (modelConfig.apiSource === 'openai' || isOpenAIModel(params.model)) {
      const openai = getOpenAIService();
      result = await openai.generateContent({
        model: actualModelId,
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
  } catch (primaryError: any) {
    // Automatic fallback to OpenAI gpt-4o if primary model fails
    console.error(`⚠️ Primary model ${params.model} failed: ${primaryError.message}. Falling back to ${OPENAI_FALLBACK_MODEL}...`);
    
    // Don't retry if the primary model was already gpt-4o
    if (actualModelId === OPENAI_FALLBACK_MODEL) {
      throw primaryError;
    }

    try {
      const openai = getOpenAIService();
      result = await openai.generateContent({
        model: OPENAI_FALLBACK_MODEL,
        systemPrompt: params.systemPrompt,
        userPrompt: params.userPrompt,
        maxTokens: params.maxTokens || 4096,
        temperature: params.temperature
      });
      // Update model info for tracking
      params.model = OPENAI_FALLBACK_MODEL;
      modelConfig = {
        modelId: OPENAI_FALLBACK_MODEL,
        provider: 'OpenAI',
        apiSource: 'openai',
        inputCostPer1M: 2.50,
        outputCostPer1M: 10.00,
        maxContextTokens: 128000,
        maxOutputTokens: 16384
      };
      console.log(`✅ Fallback to ${OPENAI_FALLBACK_MODEL} succeeded`);
    } catch (fallbackError: any) {
      console.error(`❌ Fallback model ${OPENAI_FALLBACK_MODEL} also failed: ${fallbackError.message}`);
      throw new Error(`AI generation failed with both ${actualModelId} and fallback ${OPENAI_FALLBACK_MODEL}: ${primaryError.message}`);
    }
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
  let modelConfig = await getModelConfig(params.model);

  if (!modelConfig) {
    // Try fallback instead of throwing
    console.warn(`⚠️ Model ${params.model} not found, trying gpt-4o fallback`);
    params.model = 'gpt-4o';
    modelConfig = await getModelConfig('gpt-4o') || {
      modelId: 'gpt-4o', provider: 'OpenAI', apiSource: 'openai' as const,
      inputCostPer1M: 2.50, outputCostPer1M: 10.00, maxContextTokens: 128000, maxOutputTokens: 16384
    };
  }

  let result: { post: string; usage: any };

  try {
    if (modelConfig.apiSource === 'openai' || isOpenAIModel(params.model)) {
      const openai = getOpenAIService();
      result = await openai.generateLinkedInPost(params);
    } else {
      const openrouter = getOpenRouterService();
      result = await openrouter.generateLinkedInPost(params);
    }
  } catch (primaryError: any) {
    if (params.model === 'gpt-4o') throw primaryError;
    console.error(`⚠️ Post generation with ${params.model} failed, falling back to gpt-4o: ${primaryError.message}`);
    const openai = getOpenAIService();
    params.model = 'gpt-4o';
    result = await openai.generateLinkedInPost({ ...params, model: 'gpt-4o' });
    modelConfig = { modelId: 'gpt-4o', provider: 'OpenAI', apiSource: 'openai', inputCostPer1M: 2.50, outputCostPer1M: 10.00, maxContextTokens: 128000, maxOutputTokens: 16384 };
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
  let modelConfig = await getModelConfig(params.model);

  if (!modelConfig) {
    console.warn(`⚠️ Model ${params.model} not found, trying gpt-4o fallback`);
    params.model = 'gpt-4o';
    modelConfig = await getModelConfig('gpt-4o') || {
      modelId: 'gpt-4o', provider: 'OpenAI', apiSource: 'openai' as const,
      inputCostPer1M: 2.50, outputCostPer1M: 10.00, maxContextTokens: 128000, maxOutputTokens: 16384
    };
  }

  let result: { comment: string; usage: any };

  try {
    if (modelConfig.apiSource === 'openai' || isOpenAIModel(params.model)) {
      const openai = getOpenAIService();
      result = await openai.generateLinkedInComment(params);
    } else {
      const openrouter = getOpenRouterService();
      result = await openrouter.generateLinkedInComment(params);
    }
  } catch (primaryError: any) {
    if (params.model === 'gpt-4o') throw primaryError;
    console.error(`⚠️ Comment generation with ${params.model} failed, falling back to gpt-4o: ${primaryError.message}`);
    const openai = getOpenAIService();
    params.model = 'gpt-4o';
    result = await openai.generateLinkedInComment({ ...params, model: 'gpt-4o' });
    modelConfig = { modelId: 'gpt-4o', provider: 'OpenAI', apiSource: 'openai', inputCostPer1M: 2.50, outputCostPer1M: 10.00, maxContextTokens: 128000, maxOutputTokens: 16384 };
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

```

---

### auth.ts

```typescript
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Lazy initialization — avoid top-level throws that crash the app at import time (#8)
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('CRITICAL: JWT_SECRET environment variable is not set');
  }
  return secret;
}

function getJwtRefreshSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error('CRITICAL: JWT_REFRESH_SECRET environment variable is not set');
  }
  return secret;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role?: string; // Optional role for admin users
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, getJwtRefreshSecret(), { expiresIn: '90d' });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, getJwtSecret()) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, getJwtRefreshSecret()) as TokenPayload;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function extractToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

```

---

### email-automation\ghl-service.ts

```typescript
// GoHighLevel Email Service

const GHL_API_KEY = process.env.GHL_API_KEY || '';
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID || '';
const GHL_BASE_URL = 'https://services.leadconnectorhq.com';

interface GHLContact {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  tags?: string[];
}

interface SendEmailParams {
  contactId: string;
  subject: string;
  body: string;
  fromEmail?: string;
  fromName?: string;
}

// Create or update contact in GHL
export async function upsertGHLContact(contact: GHLContact): Promise<string | null> {
  if (!GHL_API_KEY || !GHL_LOCATION_ID) {
    console.warn('GHL API not configured, skipping contact upsert');
    return null;
  }

  try {
    // First, try to find existing contact by email
    const searchResponse = await fetch(
      `${GHL_BASE_URL}/contacts/search/duplicate?locationId=${GHL_LOCATION_ID}&email=${encodeURIComponent(contact.email)}`,
      {
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Version': '2021-07-28'
        }
      }
    );

    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      if (searchData.contact?.id) {
        // Update existing contact
        const updateResponse = await fetch(
          `${GHL_BASE_URL}/contacts/${searchData.contact.id}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${GHL_API_KEY}`,
              'Content-Type': 'application/json',
              'Version': '2021-07-28'
            },
            body: JSON.stringify({
              firstName: contact.firstName,
              lastName: contact.lastName,
              phone: contact.phone,
              tags: contact.tags
            })
          }
        );
        
        if (updateResponse.ok) {
          console.log(`✅ Updated GHL contact: ${contact.email}`);
          return searchData.contact.id;
        }
      }
    }

    // Create new contact
    const createResponse = await fetch(
      `${GHL_BASE_URL}/contacts/`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        },
        body: JSON.stringify({
          locationId: GHL_LOCATION_ID,
          email: contact.email,
          firstName: contact.firstName || '',
          lastName: contact.lastName || '',
          phone: contact.phone || '',
          tags: contact.tags || []
        })
      }
    );

    if (createResponse.ok) {
      const createData = await createResponse.json();
      console.log(`✅ Created GHL contact: ${contact.email}`);
      return createData.contact?.id || null;
    }

    console.error('Failed to create GHL contact:', await createResponse.text());
    return null;
  } catch (error) {
    console.error('GHL contact upsert error:', error);
    return null;
  }
}

// Add tag to contact
export async function addTagToContact(contactId: string, tag: string): Promise<boolean> {
  if (!GHL_API_KEY) {
    console.warn('GHL API not configured');
    return false;
  }

  try {
    const response = await fetch(
      `${GHL_BASE_URL}/contacts/${contactId}/tags`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        },
        body: JSON.stringify({ tags: [tag] })
      }
    );

    return response.ok;
  } catch (error) {
    console.error('GHL add tag error:', error);
    return false;
  }
}

// Remove tag from contact
export async function removeTagFromContact(contactId: string, tag: string): Promise<boolean> {
  if (!GHL_API_KEY) {
    console.warn('GHL API not configured');
    return false;
  }

  try {
    const response = await fetch(
      `${GHL_BASE_URL}/contacts/${contactId}/tags`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        },
        body: JSON.stringify({ tags: [tag] })
      }
    );

    return response.ok;
  } catch (error) {
    console.error('GHL remove tag error:', error);
    return false;
  }
}

// Send email via GHL
export async function sendEmailViaGHL(params: SendEmailParams): Promise<boolean> {
  if (!GHL_API_KEY) {
    console.warn('GHL API not configured, skipping email send');
    return false;
  }

  const fromEmail = params.fromEmail || process.env.GHL_EMAIL_FROM || 'kommentify@arwebcraftszone.com';
  const fromName = params.fromName || 'Kommentify';

  try {
    const response = await fetch(
      `${GHL_BASE_URL}/conversations/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        },
        body: JSON.stringify({
          type: 'Email',
          contactId: params.contactId,
          subject: params.subject,
          // Only replace newlines with <br> if body is plain text (not HTML)
          html: params.body.includes('<!DOCTYPE') || params.body.includes('<table') || params.body.includes('<html') 
            ? params.body 
            : params.body.replace(/\n/g, '<br>'),
          emailFrom: fromEmail,
          emailFromName: fromName
        })
      }
    );

    if (response.ok) {
      console.log(`✅ Email sent to contact ${params.contactId}`);
      return true;
    }

    console.error('Failed to send email:', await response.text());
    return false;
  } catch (error) {
    console.error('GHL email send error:', error);
    return false;
  }
}

// Alternative: Send email directly without GHL contact (using SMTP-like endpoint)
export async function sendDirectEmail(
  toEmail: string,
  subject: string,
  body: string
): Promise<boolean> {
  if (!GHL_API_KEY || !GHL_LOCATION_ID) {
    console.warn('GHL API not configured - email cannot be sent');
    // For development/testing, log the email but return false so queue can retry when provider is configured
    console.log('📧 [DEV] Would send email:');
    console.log(`   To: ${toEmail}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Body preview: ${body.substring(0, 100)}...`);
    return false; // Return false to indicate email not actually sent
  }

  try {
    // First ensure contact exists
    const contactId = await upsertGHLContact({ email: toEmail });
    
    if (!contactId) {
      console.error('Could not create/find contact for email');
      return false;
    }

    return await sendEmailViaGHL({
      contactId,
      subject,
      body
    });
  } catch (error) {
    console.error('Direct email send error:', error);
    return false;
  }
}

// GHL Tags for sequences
export const GHL_TAGS = {
  TRIAL_USER: 'trial_user',
  PAID_CUSTOMER: 'paid_customer',
  EXPIRED_TRIAL: 'expired_trial',
  LIFETIME_CUSTOMER: 'lifetime_customer',
  ENGAGED_USER: 'engaged_user',
  INACTIVE_USER: 'inactive_user',
  ONBOARDING_COMPLETE: 'onboarding_complete',
  VIP: 'vip'
};

```

---

### email-automation\index.ts

```typescript
// Email Automation Module - Main Export

export * from './templates';
export * from './ghl-service';
export * from './scheduler';

```

---

### email-automation\scheduler.ts

```typescript
// Email Scheduler - Manages email queue and scheduling

import { prisma } from '@/lib/prisma';
import { EMAIL_SEQUENCES, replaceVariables, LIFETIME_DEAL_EMAIL, FEATURE_ANNOUNCEMENT_EMAIL } from './templates';
import { sendDirectEmail, upsertGHLContact, addTagToContact, GHL_TAGS } from './ghl-service';

// Schedule onboarding sequence for a new user
export async function scheduleOnboardingSequence(userId: string, userEmail: string, userName: string): Promise<void> {
  try {
    // Check if sequence already started
    const existingState = await prisma.userEmailState.findUnique({
      where: { userId }
    });

    if (existingState?.onboardingStarted) {
      console.log(`Onboarding already started for user ${userId}`);
      return;
    }

    // Create or update email state
    await prisma.userEmailState.upsert({
      where: { userId },
      create: {
        userId,
        onboardingStarted: new Date()
      },
      update: {
        onboardingStarted: new Date()
      }
    });

    // Sync to GHL with trial_user tag
    await upsertGHLContact({
      email: userEmail,
      firstName: userName?.split(' ')[0] || '',
      lastName: userName?.split(' ').slice(1).join(' ') || '',
      tags: [GHL_TAGS.TRIAL_USER]
    });

    // Schedule all onboarding emails
    const sequence = EMAIL_SEQUENCES.onboarding;
    const now = new Date();
    let cumulativeHours = 0;

    for (const email of sequence.emails) {
      cumulativeHours += email.delayHours;
      const scheduledFor = new Date(now.getTime() + cumulativeHours * 60 * 60 * 1000);

      await prisma.emailQueue.create({
        data: {
          userId,
          sequenceType: 'onboarding',
          emailNumber: sequence.emails.indexOf(email) + 1,
          templateId: email.id,
          scheduledFor,
          status: 'pending',
          metadata: JSON.stringify({
            firstName: userName?.split(' ')[0] || 'there',
            email: userEmail
          })
        }
      });
    }

    console.log(`✅ Scheduled ${sequence.emails.length} onboarding emails for user ${userId}`);
  } catch (error) {
    console.error('Error scheduling onboarding sequence:', error);
  }
}

// Schedule expired trial sequence
export async function scheduleExpiredTrialSequence(userId: string, userEmail: string, userName: string): Promise<void> {
  try {
    // Cancel any pending onboarding emails first
    await prisma.emailQueue.updateMany({
      where: {
        userId,
        sequenceType: 'onboarding',
        status: 'pending'
      },
      data: { status: 'cancelled' }
    });

    // Check if expired trial sequence already started
    const existingState = await prisma.userEmailState.findUnique({
      where: { userId }
    });

    if (existingState?.expiredTrialStarted) {
      console.log(`Expired trial sequence already started for user ${userId}`);
      return;
    }

    // Update email state
    await prisma.userEmailState.upsert({
      where: { userId },
      create: {
        userId,
        expiredTrialStarted: new Date(),
        onboardingCompleted: true
      },
      update: {
        expiredTrialStarted: new Date(),
        onboardingCompleted: true
      }
    });

    // Update GHL tags
    await upsertGHLContact({
      email: userEmail,
      firstName: userName?.split(' ')[0] || '',
      tags: [GHL_TAGS.EXPIRED_TRIAL]
    });

    // Schedule expired trial emails
    const sequence = EMAIL_SEQUENCES.expired_trial;
    const now = new Date();
    let cumulativeHours = 0;

    for (const email of sequence.emails) {
      cumulativeHours += email.delayHours;
      const scheduledFor = new Date(now.getTime() + cumulativeHours * 60 * 60 * 1000);

      await prisma.emailQueue.create({
        data: {
          userId,
          sequenceType: 'expired_trial',
          emailNumber: sequence.emails.indexOf(email) + 1,
          templateId: email.id,
          scheduledFor,
          status: 'pending',
          metadata: JSON.stringify({
            firstName: userName?.split(' ')[0] || 'there',
            email: userEmail
          })
        }
      });
    }

    console.log(`✅ Scheduled ${sequence.emails.length} expired trial emails for user ${userId}`);
  } catch (error) {
    console.error('Error scheduling expired trial sequence:', error);
  }
}

// Schedule paid customer sequence
export async function schedulePaidCustomerSequence(
  userId: string, 
  userEmail: string, 
  userName: string,
  planName: string,
  billingType: string
): Promise<void> {
  try {
    // Cancel any pending trial/expired emails
    await prisma.emailQueue.updateMany({
      where: {
        userId,
        status: 'pending',
        sequenceType: { in: ['onboarding', 'expired_trial'] }
      },
      data: { status: 'cancelled' }
    });

    // Check if paid sequence already started
    const existingState = await prisma.userEmailState.findUnique({
      where: { userId }
    });

    if (existingState?.paidSequenceStarted) {
      console.log(`Paid sequence already started for user ${userId}`);
      return;
    }

    // Update email state
    await prisma.userEmailState.upsert({
      where: { userId },
      create: {
        userId,
        paidSequenceStarted: new Date(),
        onboardingCompleted: true,
        expiredTrialCompleted: true
      },
      update: {
        paidSequenceStarted: new Date(),
        onboardingCompleted: true,
        expiredTrialCompleted: true
      }
    });

    // Update GHL tags
    const isLifetime = billingType.toLowerCase().includes('lifetime');
    await upsertGHLContact({
      email: userEmail,
      firstName: userName?.split(' ')[0] || '',
      tags: isLifetime 
        ? [GHL_TAGS.PAID_CUSTOMER, GHL_TAGS.LIFETIME_CUSTOMER, GHL_TAGS.VIP]
        : [GHL_TAGS.PAID_CUSTOMER]
    });

    // Schedule paid customer emails
    const sequence = EMAIL_SEQUENCES.paid_customer;
    const now = new Date();
    let cumulativeHours = 0;

    for (const email of sequence.emails) {
      cumulativeHours += email.delayHours;
      const scheduledFor = new Date(now.getTime() + cumulativeHours * 60 * 60 * 1000);

      await prisma.emailQueue.create({
        data: {
          userId,
          sequenceType: 'paid_customer',
          emailNumber: sequence.emails.indexOf(email) + 1,
          templateId: email.id,
          scheduledFor,
          status: 'pending',
          metadata: JSON.stringify({
            firstName: userName?.split(' ')[0] || 'there',
            email: userEmail,
            planName,
            billingType
          })
        }
      });
    }

    console.log(`✅ Scheduled ${sequence.emails.length} paid customer emails for user ${userId}`);
  } catch (error) {
    console.error('Error scheduling paid customer sequence:', error);
  }
}

// Process pending emails (called by cron)
export async function processEmailQueue(batchSize: number = 10): Promise<{ processed: number; failed: number }> {
  const now = new Date();
  let processed = 0;
  let failed = 0;

  try {
    // Get pending emails that are due
    const pendingEmails = await prisma.emailQueue.findMany({
      where: {
        status: 'pending',
        scheduledFor: { lte: now }
      },
      orderBy: { scheduledFor: 'asc' },
      take: batchSize
    });

    console.log(`📧 Processing ${pendingEmails.length} pending emails...`);

    for (const emailItem of pendingEmails) {
      try {
        // Check if user is unsubscribed
        const emailState = await prisma.userEmailState.findUnique({
          where: { userId: emailItem.userId }
        });

        if (emailState?.unsubscribed) {
          await prisma.emailQueue.update({
            where: { id: emailItem.id },
            data: { status: 'cancelled', error: 'User unsubscribed' }
          });
          continue;
        }

        // Check if user became paid (cancel trial/expired sequences)
        if (emailItem.sequenceType !== 'paid_customer' && emailState?.paidSequenceStarted) {
          await prisma.emailQueue.update({
            where: { id: emailItem.id },
            data: { status: 'cancelled', error: 'User converted to paid' }
          });
          continue;
        }

        // Try to get template from database first
        let subject = '';
        let body = '';
        let isHTML = false;
        
        // First, try database sequence with exact type match
        let dbSequence = await prisma.emailSequence.findFirst({
          where: { type: emailItem.sequenceType, isActive: true },
          include: { emails: { where: { isActive: true }, orderBy: { position: 'asc' } } }
        });
        
        // If not found, try without isActive filter (in case sequence was marked inactive but has valid templates)
        if (!dbSequence || dbSequence.emails.length === 0) {
          dbSequence = await prisma.emailSequence.findFirst({
            where: { type: emailItem.sequenceType },
            include: { emails: { orderBy: { position: 'asc' } } }
          });
        }
        
        // Also try matching by similar types (e.g., 'onboarding' might be stored as 'New User Onboarding')
        if (!dbSequence || dbSequence.emails.length === 0) {
          const allSequences = await prisma.emailSequence.findMany({
            include: { emails: { orderBy: { position: 'asc' } } }
          });
          
          // Try to find a matching sequence by type or name containing the sequence type
          dbSequence = allSequences.find(seq => 
            seq.type === emailItem.sequenceType ||
            seq.type.toLowerCase().includes(emailItem.sequenceType.toLowerCase()) ||
            seq.name.toLowerCase().includes(emailItem.sequenceType.toLowerCase())
          ) || null;
        }
        
        if (dbSequence && dbSequence.emails && dbSequence.emails.length > 0) {
          // Find the email by position (emailNumber is 1-indexed)
          const dbTemplate = dbSequence.emails[emailItem.emailNumber - 1];
          if (dbTemplate) {
            subject = dbTemplate.subject;
            body = dbTemplate.body;
            // Check if body contains HTML - more comprehensive check
            isHTML = body.includes('<!DOCTYPE') || 
                     body.includes('<table') || 
                     body.includes('<html') || 
                     body.includes('<div style') ||
                     body.includes('<td') ||
                     body.includes('background:') ||
                     body.includes('font-family:');
            console.log(`📧 Using database HTML template for ${emailItem.sequenceType} email #${emailItem.emailNumber} (isHTML: ${isHTML})`);
            console.log(`📧 Template subject: ${subject}`);
            console.log(`📧 Template body length: ${body.length} chars, preview: ${body.substring(0, 100)}...`);
          } else {
            console.log(`⚠️ No email found at position ${emailItem.emailNumber - 1} for sequence ${emailItem.sequenceType} (has ${dbSequence.emails.length} emails)`);
          }
        } else {
          console.log(`⚠️ No database sequence found for type: ${emailItem.sequenceType}`);
        }
        
        // Fallback to hardcoded templates if database template not found
        if (!subject || !body) {
          console.log(`📧 Falling back to hardcoded templates for ${emailItem.sequenceType}`);
          const sequence = EMAIL_SEQUENCES[emailItem.sequenceType as keyof typeof EMAIL_SEQUENCES];
          const template = sequence?.emails.find(e => e.id === emailItem.templateId);
          
          if (!template) {
            // Also try finding by email number
            const templateByNumber = sequence?.emails[emailItem.emailNumber - 1];
            if (templateByNumber) {
              subject = templateByNumber.subject;
              body = templateByNumber.body;
              console.log(`📧 Using fallback template by position for ${emailItem.sequenceType} email #${emailItem.emailNumber}`);
            } else {
              await prisma.emailQueue.update({
                where: { id: emailItem.id },
                data: { status: 'failed', error: `Template not found in database or fallback. Sequence: ${emailItem.sequenceType}, EmailNum: ${emailItem.emailNumber}, TemplateId: ${emailItem.templateId}` }
              });
              failed++;
              continue;
            }
          } else {
            subject = template.subject;
            body = template.body;
            console.log(`📧 Using fallback template for ${emailItem.sequenceType} email #${emailItem.emailNumber}`);
          }
        }

        // Parse metadata
        const metadata = emailItem.metadata ? JSON.parse(emailItem.metadata) : {};

        // Replace variables in template
        subject = replaceVariables(subject, metadata);
        body = replaceVariables(body, metadata);

        // Convert to HTML if it's not already HTML
        if (!isHTML && !body.includes('<!DOCTYPE') && !body.includes('<table') && !body.includes('<html')) {
          // Convert plain text to basic HTML
          body = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    h1 { color: #2563eb; }
    a { color: #2563eb; text-decoration: none; }
    .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; }
  </style>
</head>
<body>
  ${body.replace(/\n/g, '<br>')}
</body>
</html>`;
          isHTML = true;
        }

        // Send email
        const success = await sendDirectEmail(metadata.email, subject, body);

        if (success) {
          await prisma.emailQueue.update({
            where: { id: emailItem.id },
            data: { status: 'sent', sentAt: new Date() }
          });

          // Update last email sent
          await prisma.userEmailState.update({
            where: { userId: emailItem.userId },
            data: { lastEmailSent: new Date() }
          });

          processed++;
          console.log(`✅ Sent email ${emailItem.templateId} to user ${emailItem.userId}`);
        } else {
          await prisma.emailQueue.update({
            where: { id: emailItem.id },
            data: { status: 'failed', error: 'Send failed' }
          });
          failed++;
        }
      } catch (error) {
        console.error(`Error processing email ${emailItem.id}:`, error);
        await prisma.emailQueue.update({
          where: { id: emailItem.id },
          data: { 
            status: 'failed', 
            error: error instanceof Error ? error.message : 'Unknown error' 
          }
        });
        failed++;
      }
    }

    return { processed, failed };
  } catch (error) {
    console.error('Error in processEmailQueue:', error);
    return { processed, failed };
  }
}

// Send special campaign email to all eligible users
export async function sendSpecialCampaign(
  campaignType: 'lifetime_deal' | 'feature_announcement',
  userFilter?: { hasPaid?: boolean; isActive?: boolean }
): Promise<{ scheduled: number }> {
  try {
    // Get template
    const template = campaignType === 'lifetime_deal' 
      ? LIFETIME_DEAL_EMAIL 
      : FEATURE_ANNOUNCEMENT_EMAIL;

    // Get eligible users and filter unsubscribed separately (no direct relation)
    const allUsers = await prisma.user.findMany({
      where: userFilter || {},
      select: {
        id: true,
        email: true,
        name: true
      }
    });

    // Filter out unsubscribed users in single query
    const unsubscribedUserIds = await prisma.userEmailState.findMany({
      where: { unsubscribed: true },
      select: { userId: true }
    }).then(states => states.map(s => s.userId));

    const users = allUsers.filter(u => !unsubscribedUserIds.includes(u.id));

    // Revert to simpler approach with proper filter
    const finalUsers = await prisma.user.findMany({
      where: {
        ...(userFilter || {}),
        id: { notIn: unsubscribedUserIds }
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    });

    const eligibleUsers = users;

    // Schedule campaign emails
    const now = new Date();
    for (const user of eligibleUsers) {
      await prisma.emailQueue.create({
        data: {
          userId: user.id,
          sequenceType: 'special',
          emailNumber: 1,
          templateId: template.id,
          scheduledFor: now,
          status: 'pending',
          metadata: JSON.stringify({
            firstName: user.name?.split(' ')[0] || 'there',
            email: user.email
          })
        }
      });
    }

    console.log(`✅ Scheduled ${eligibleUsers.length} campaign emails`);
    return { scheduled: eligibleUsers.length };
  } catch (error) {
    console.error('Error sending special campaign:', error);
    return { scheduled: 0 };
  }
}

// Cancel all pending emails for a user
export async function cancelUserEmails(userId: string): Promise<void> {
  await prisma.emailQueue.updateMany({
    where: {
      userId,
      status: 'pending'
    },
    data: { status: 'cancelled' }
  });
}

// Unsubscribe user from all emails
export async function unsubscribeUser(userId: string): Promise<void> {
  await prisma.userEmailState.upsert({
    where: { userId },
    create: { userId, unsubscribed: true },
    update: { unsubscribed: true }
  });

  await cancelUserEmails(userId);
}

```

---

### email-automation\templates.ts

```typescript
// Email Templates for GoHighLevel Automation

export interface EmailTemplate {
  id: string;
  subject: string;
  body: string;
  delayHours: number; // Delay from previous email in sequence
}

export interface EmailSequence {
  type: string;
  emails: EmailTemplate[];
}

// Helper to replace variables in templates
export function replaceVariables(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
  }
  return result;
}

// SEQUENCE 1: NEW USER ONBOARDING
export const ONBOARDING_SEQUENCE: EmailSequence = {
  type: 'onboarding',
  emails: [
    {
      id: 'onboarding_1',
      delayHours: 0, // Immediate
      subject: 'Welcome to Kommentify! Your LinkedIn growth starts now 🚀',
      body: `Hi {{firstName}},

Welcome to Kommentify! 🎉

Your 3-day free trial is now active, and you're about to save 20+ hours every week on LinkedIn.

Here's how to get started in 2 minutes:

1. Install the Chrome Extension: https://chromewebstore.google.com/detail/kommentify-linkedin-auto/laeckkpjacbodjglcnenggpdpehkacei
2. Connect your LinkedIn account
3. Set your daily limits (we recommend starting slow)
4. Add keywords for your industry
5. Watch Kommentify work its magic!

Quick Start Video (2 min): https://www.loom.com/share/0f5fd7b490e840609f

Your trial includes FULL access to:
✅ AI Comment Generation
✅ Smart Connection Requests
✅ Post Scheduling
✅ CSV Import & Bulk Actions
✅ Advanced Analytics

Need help? Just reply to this email or WhatsApp us: +92 300 1234567

Let's grow your LinkedIn!

Team Kommentify`
    },
    {
      id: 'onboarding_2',
      delayHours: 2, // After 2 hours
      subject: '{{firstName}}, let me help you set up Kommentify in 5 minutes',
      body: `Hi {{firstName}},

I noticed you just joined Kommentify! Let's make sure you're getting maximum value from Day 1.

Here's your personalized setup checklist:

📌 Step 1: Safety First
Set conservative daily limits:
- Comments: 10-20/day
- Connections: 10-15/day
- Likes: 20-30/day
(You can increase these after 1 week)

📌 Step 2: Target Your Audience
Add 3-5 keywords like:
- Your industry (e.g., "SaaS", "Real Estate")
- Your target role (e.g., "CEO", "Founder")
- Your location (e.g., "Mumbai", "Karachi")

📌 Step 3: Import Your Prospects
Have a list of ideal connections?
Upload CSV → Kommentify will engage with each profile automatically

Watch this 3-minute setup tutorial: https://kommentify.com/tutorials

💡 Pro Tip: Start with commenting only for first 2 days. It's the safest way to test and see immediate engagement!

Questions? Just hit reply!

Happy automating,
Team Kommentify`
    },
    {
      id: 'onboarding_3',
      delayHours: 22, // Day 2 (24 hours from start - 2 hours already passed)
      subject: "{{firstName}}, you're missing 80% of Kommentify's power",
      body: `Hi {{firstName}},

Day 2 with Kommentify! Here are insider tips our power users swear by:

🎯 The "Influence Targeting" Strategy
Instead of random connections, target:
1. People who comment on influencer posts
2. Active members in your industry groups
3. Second-degree connections of your ideal clients

💡 AI Comment Settings That Work
- Turn ON "Contextual Comments"
- Set comment length to "Medium"
- Enable "Question Mode" for 30% of comments
- This gets 3x more replies!

📈 The CSV Import Secret
Upload your Sales Navigator exports directly!
Kommentify will:
- Visit each profile
- Read their recent posts
- Like, comment, and connect
- All with natural delays

⚡ Quick Win for Today:
Import 50 target profiles and let Kommentify engage with them throughout the day.

See the full strategy guide: https://kommentify.com/strategies

Your trial ends tomorrow - ready to continue growing?

Best,
Team Kommentify`
    },
    {
      id: 'onboarding_4',
      delayHours: 24, // Day 3 Morning
      subject: '⏰ {{firstName}}, your trial ends in 12 hours',
      body: `Hi {{firstName}},

Your Kommentify trial ends tonight at midnight.

During your trial, you've had access to powerful automation that saves 20+ hours weekly.

Don't lose momentum! 

Choose your plan:
- Starter ($4.99/mo) - Perfect for individuals
- Pro ($9.99/mo) - For serious networkers
- Scale ($19.99/mo) - For agencies & teams

💰 Launch Week Special:
Get LIFETIME access (no monthly fees ever!)
- Starter Lifetime: $39 (save $60/year)
- Pro Lifetime: $79 (save $120/year)
- Scale Lifetime: $139 (save $240/year)

👉 UPGRADE NOW: https://kommentify.com/lifetime-deal

Questions? Reply to this email or WhatsApp: +92 300 1234567

Don't let your LinkedIn growth stop,
Team Kommentify`
    },
    {
      id: 'onboarding_5',
      delayHours: 10, // Day 3 Evening
      subject: 'Last chance, {{firstName}} (trial ends in 2 hours)',
      body: `{{firstName}},

Quick reminder - your Kommentify trial expires in 2 hours.

After that:
❌ Automation stops
❌ You're back to manual work
❌ 3+ hours daily on LinkedIn

Continue your growth for less than a coffee/day:
👉 ACTIVATE SUBSCRIPTION: https://kommentify.com/plans

Or grab lifetime access (ending soon):
👉 GET LIFETIME DEAL: https://kommentify.com/lifetime-deal

This is your last reminder.

Team Kommentify

P.S. Join 100+ professionals already growing with Kommentify`
    }
  ]
};

// SEQUENCE 2: EXPIRED TRIAL (NON-BUYERS)
export const EXPIRED_TRIAL_SEQUENCE: EmailSequence = {
  type: 'expired_trial',
  emails: [
    {
      id: 'expired_1',
      delayHours: 24, // Day 1 after expiry
      subject: '{{firstName}}, your LinkedIn automation has stopped',
      body: `Hi {{firstName}},

Your Kommentify trial ended yesterday, and your automation has paused.

We understand monthly subscriptions can add up. That's why we created something special...

🎁 One-Time Offer (24 hours only):
Get 50% OFF your first month
Use code: COMEBACK50

👉 CLAIM YOUR DISCOUNT: https://kommentify.com/plans?code=COMEBACK50

Or go lifetime and never pay monthly:
- Lifetime access from just $39
- No recurring fees ever
- All future updates included

👉 VIEW LIFETIME OPTIONS: https://kommentify.com/lifetime-deal

Your LinkedIn growth shouldn't stop here.

Best,
Team Kommentify`
    },
    {
      id: 'expired_2',
      delayHours: 48, // Day 3 after expiry
      subject: 'How Raj got 47 clients using Kommentify',
      body: `{{firstName}},

Quick story:

Raj from Mumbai was spending 3 hours daily on LinkedIn.
Zero results.

Then he tried Kommentify:
- Week 1: 200 targeted comments
- Week 2: 50 quality connections
- Week 3: 12 inbound inquiries
- Week 4: 3 new clients

Investment: $79 lifetime
Return: $4,000 in new business

Ready to write your success story?

👉 START AGAIN WITH 30% OFF: https://kommentify.com/plans?code=SUCCESS30

Limited time offer ends tomorrow.

Team Kommentify`
    },
    {
      id: 'expired_3',
      delayHours: 168, // Week 2 (7 days later)
      subject: 'The feature you missed that could 10x your LinkedIn',
      body: `Hi {{firstName}},

Did you know Kommentify's CSV Import feature is basically like hiring a VA for $39?

Here's what you missed:
1. Upload any LinkedIn profile list
2. Kommentify visits each profile
3. Reads their recent content
4. Engages intelligently
5. Builds relationships on autopilot

Our users call this the "Secret Weapon" feature.

Want to try it again?

Special offer: Lifetime access $39 (usually $79)

👉 GRAB LIFETIME DEAL: https://kommentify.com/lifetime-deal?code=SECRET39

Offer expires in 48 hours.

Best,
Team Kommentify`
    },
    {
      id: 'expired_4',
      delayHours: 168, // Week 3 (another 7 days)
      subject: "{{firstName}}, we're removing you from Kommentify",
      body: `Hi {{firstName}},

This is our final email.

We're cleaning up inactive accounts next week.

Before we remove your account, here's one last offer:

Lifetime Access: Just $29 (lowest ever)
Valid for next 24 hours only.

👉 ACTIVATE LIFETIME - $29: https://kommentify.com/lifetime-deal?code=FINAL29

After this, you'll need to sign up again at regular prices.

If LinkedIn growth isn't your priority right now, we understand.

Wishing you success,
Team Kommentify

P.S. This truly is the last email. We won't bother you again.`
    }
  ]
};

// SEQUENCE 3: NEW CUSTOMER (PAID)
export const PAID_CUSTOMER_SEQUENCE: EmailSequence = {
  type: 'paid_customer',
  emails: [
    {
      id: 'paid_1',
      delayHours: 0, // Immediate
      subject: "Welcome to Kommentify Pro! Here's your VIP onboarding",
      body: `{{firstName}}, you're in! 🎉

Welcome to the Kommentify family!

Your {{planName}} is now active.

VIP Resources for You:
📹 Advanced Strategies Masterclass: https://kommentify.com/masterclass
📚 LinkedIn Growth Playbook (PDF): https://kommentify.com/playbook
💬 Private Telegram Community: https://t.me/kommentify
📞 Priority WhatsApp Support: +92 300 1234567

Your Account Details:
- Plan: {{planName}}
- Status: Active
- Billing: {{billingType}}

Quick Start Actions:
1. Join our Telegram community (500+ members)
2. Watch the Advanced Strategies video
3. Set up your first campaign
4. Introduce yourself in the community!

Need anything? Just reply to this email for priority support.

Let's grow together!
Team Kommentify`
    },
    {
      id: 'paid_2',
      delayHours: 168, // Day 7
      subject: "{{firstName}}, how's your first week going?",
      body: `Hi {{firstName}},

You've been using Kommentify for a week now!

Quick check-in:
✓ Is automation running smoothly?
✓ Any features you need help with?
✓ Getting good engagement?

Pro Tips for Week 2:
- Increase daily limits by 20%
- Try the CSV import feature
- Test different comment styles
- Join our weekly growth workshop (Thursdays 3 PM IST)

If you haven't already, join our community:
👉 Telegram Group: https://t.me/kommentify

500+ members sharing strategies daily!

Happy growing,
Team Kommentify`
    },
    {
      id: 'paid_3',
      delayHours: 672, // Month 1 (30 days - 7 already passed)
      subject: 'Your monthly LinkedIn growth report + tips',
      body: `Hi {{firstName}},

Monthly Kommentify Update!

New Features This Month:
- Advanced boolean search
- Emoji support in comments
- Bulk message templates

Top Strategy This Month:
"The Conference Attendee Hack"
1. Find recent conference in your industry
2. Search attendee list on LinkedIn
3. Import to Kommentify
4. Engage with personalized comments about the event
5. 70% connection acceptance rate!

Upcoming:
- Live Workshop: Thursday 3 PM IST
- New feature launch next week

Keep growing!
Team Kommentify`
    }
  ]
};

// SEQUENCE 4: SPECIAL CAMPAIGNS
export const LIFETIME_DEAL_EMAIL: EmailTemplate = {
  id: 'lifetime_promo',
  delayHours: 0,
  subject: '🔥 48-Hour Flash Sale: Lifetime Deal Returns!',
  body: `{{firstName}},

By popular demand, lifetime deals are BACK!

But only for 48 hours.

Regular Price → Flash Sale:
- Starter: $79 → $39 (save $40)
- Pro: $159 → $79 (save $80)
- Scale: $279 → $139 (save $140)

Why lifetime?
✓ Never pay monthly again
✓ All future updates included
✓ Grandfather pricing forever
✓ Transfer to team members

👉 GRAB LIFETIME ACCESS: https://kommentify.com/lifetime-deal

Timer: 47:59:58 remaining

Don't miss out again!
Team Kommentify`
};

export const FEATURE_ANNOUNCEMENT_EMAIL: EmailTemplate = {
  id: 'feature_announcement',
  delayHours: 0,
  subject: 'NEW: AI Post Writer is here!',
  body: `Hi {{firstName}},

Big update for you!

Kommentify now writes viral LinkedIn posts!

How it works:
1. Enter a topic
2. Choose tone (Professional/Story/Educational)
3. Get 10 variations instantly
4. Schedule or post immediately

This feature alone is worth $50/month elsewhere.
You get it FREE with your plan!

Try it now: https://kommentify.com/dashboard

What's next:
- Voice message automation
- InMail templates
- Analytics dashboard v2

Your feedback shapes Kommentify!

Best,
Team Kommentify`
};

// Special campaign sequence for one-off emails
export const SPECIAL_SEQUENCE: EmailSequence = {
  type: 'special',
  emails: [
    LIFETIME_DEAL_EMAIL,
    FEATURE_ANNOUNCEMENT_EMAIL
  ]
};

// Get all sequences
export const EMAIL_SEQUENCES: Record<string, EmailSequence> = {
  onboarding: ONBOARDING_SEQUENCE,
  expired_trial: EXPIRED_TRIAL_SEQUENCE,
  paid_customer: PAID_CUSTOMER_SEQUENCE,
  special: SPECIAL_SEQUENCE
};

```

---

### email-service.ts

```typescript

```

---

### email-templates-library.ts

```typescript
// Pre-designed Email Templates
export const emailTemplates = [
  {
    id: 'modern_welcome',
    name: 'Modern Welcome Email',
    category: 'Onboarding',
    subject: 'Welcome to {{productName}}! 🎉 Let\'s get started',
    body: 'Hi {{firstName}},\n\nWelcome to {{productName}}! We\'re thrilled to have you join our community.\n\nHere\'s what you can do right now:\n\n✅ **Complete your profile** - Add your details and preferences\n✅ **Explore key features** - Discover what makes us special\n✅ **Get instant support** - We\'re here 24/7 to help\n\n🚀 **Quick Start Guide**: {{dashboardUrl}}\n\nQuestions? Just reply to this email - we read every message!\n\nTo your success,\n{{productName}} Team\n\nP.S. Check out our onboarding video: {{onboardingUrl}}',
    variables: ['firstName', 'productName', 'dashboardUrl', 'onboardingUrl']
  },
  {
    id: 'trial_ending',
    name: 'Trial Ending Urgency',
    category: 'Trial',
    subject: '⏰ Only {{hoursLeft}} hours left in your trial!',
    body: `Hi {{firstName}},\n\nYour {{productName}} trial ends in just {{hoursLeft}} hours.\n\nDon't lose access to:\n✅ **All your data and progress**\n✅ **Premium features you love**\n✅ **Priority 24/7 support**\n✅ **Advanced integrations**\n\n🎯 **Upgrade now and save 20%**: {{upgradeUrl}}\nUse code: TRIAL20\n\nQuestions? We're here to help!\n\nBest,\n{{productName}} Team`,
  },
  {
    id: 'thank_you',
    name: 'Thank You for Subscribing',
    category: 'Success',
    subject: '🎉 Welcome to {{planName}} - You\'re all set!',
    body: `Hi {{firstName}},\n\nThank you for choosing {{productName}} {{planName}}! 🎉\n\nYou now have full access to:\n\n✅ **All premium features**\n✅ **Priority support**\n✅ **Advanced analytics**\n✅ **Unlimited usage**\n\n🚀 **Get started**: {{dashboardUrl}}\n\nNeed help? Our team is standing by:\n📧 Email: {{supportEmail}}\n💬 Live chat: {{chatUrl}}\n\nTo your success,\n{{productName}} Team\n\nP.S. Your invoice and receipt: {{invoiceUrl}}`,
  },
  {
    id: 'tips_email',
    name: '5 Power User Tips',
    category: 'Engagement',
    subject: '💡 5 tips to master {{productName}} (2 min read)',
    body: `Hi {{firstName}},\n\nHere are 5 quick tips to get 10x more value from {{productName}}:\n\n1. **Complete your profile** - Unlock personalized recommendations\n2. **Connect integrations** - Sync with your favorite tools\n3. **Set up automation** - Save hours every week\n4. **Use templates** - Get started faster\n5. **Join our community** - Learn from 10,000+ users\n\n📚 **Full guide**: {{helpUrl}}\n🎥 **Video tutorials**: {{tutorialsUrl}}\n\nQuestions? Hit reply!\n\nCheers,\n{{productName}} Team`,
  },
  {
    id: 'feature_announcement',
    name: 'New Feature Launch',
    category: 'Engagement',
    subject: '🚀 NEW: {{featureName}} is here!',
    body: `Hi {{firstName}},\n\nExciting news! We just launched **{{featureName}}** - our most requested feature.\n\n✨ **What it does**:\n{{featureDescription}}\n\n💪 **Why you'll love it**:\n• Saves you time\n• More powerful\n• Easy to use\n\n🎯 **Try it now**: {{learnMoreUrl}}\n📹 **Watch demo**: {{demoUrl}}\n\nThis is available on your {{planName}} plan right now!\n\nHappy building,\n{{productName}} Team`,
  },
  {
    id: 're_engagement',
    name: 'We Miss You - Win Back',
    category: 'Win-back',
    subject: 'We miss you, {{firstName}} 💙 (Special offer inside)',
    body: `Hi {{firstName}},\n\nWe noticed you haven't logged into {{productName}} lately.\n\nWe miss you! ❤️\n\n**Come back and get 30% off** with code: **WELCOME30**\n\n✨ **What's new since you left**:\n✅ {{feature1}} - Game changer!\n✅ {{feature2}} - Much faster\n✅ {{feature3}} - More integrations\n\n🎁 **Special offer**: Use code WELCOME30 for 30% off any plan\n⏰ **Expires**: {{expiryDate}}\n\n👉 **Reactivate now**: {{dashboardUrl}}\n\nWe'd love to have you back!\n\n{{productName}} Team`,
  },
  {
    id: 'feedback_request',
    name: 'Feedback & Survey Request',
    category: 'Engagement',
    subject: 'Quick question: How are we doing? (2 min)',
    body: `Hi {{firstName}},\n\nYour opinion matters to us! 🙏\n\nWould you take 2 minutes to share your thoughts?\n\n**We want to know**:\n• What you love about {{productName}}\n• What we can improve\n• Feature requests\n• Overall experience (1-10)\n\n📋 **Take survey**: {{surveyUrl}}\n\n🎁 **Thank you gift**: Complete the survey and get a free month! (We'll email you the code)\n\nEvery response helps us serve you better.\n\nThanks in advance!\n{{productName}} Team`,
  },
  {
    id: 'milestone',
    name: 'Milestone Celebration',
    category: 'Success',
    subject: '🎊 Congratulations! You hit {{milestone}}!',
    body: `🎉 **Amazing work**, {{firstName}}!\n\nYou just reached **{{milestone}}** - that's incredible!\n\n🏆 **Your achievements**:\n• Total: {{totalCount}}\n• Completed: {{completedCount}}\n• Success rate: {{successRate}}%\n\n📈 **Keep the momentum going**:\n{{nextGoalUrl}}\n\n📣 **Share your success**:\nProud of this achievement? Share it with your team!\n{{shareUrl}}\n\nYou're crushing it! 💪\n\n{{productName}} Team`,
  },
  {
    id: 'weekly_digest',
    name: 'Weekly Activity Summary',
    category: 'Engagement',
    subject: '📊 Your {{productName}} week in review',
    body: `Hi {{firstName}},\n\nHere's your activity for the week:\n\n📊 **This Week's Stats**:\n• Total items: {{totalCount}}\n• Completed: {{completedCount}} ✅\n• In progress: {{activeCount}} ⏳\n• Pending: {{pendingCount}}\n\n📈 **Compared to last week**: {{trend}}\n\n🌟 **Highlights**:\n• {{highlight1}}\n• {{highlight2}}\n• {{highlight3}}\n\n👉 **View full report**: {{dashboardUrl}}\n\nHave a productive week ahead!\n\n{{productName}} Team`,
  },
  {
    id: 'upgrade_offer',
    name: 'Limited Time Upgrade Offer',
    category: 'Conversion',
    subject: '⚡ FLASH SALE: 40% off {{planName}} (48 hours only!)',
    body: `Hi {{firstName}},

🔥 **FLASH SALE - 40% OFF!**
⏰ **Expires in 48 hours**

Upgrade to **{{planName}}** and unlock:

✅ **{{feature1}}** - Save hours every week
✅ **{{feature2}}** - 10x more power
✅ **{{feature3}}** - Priority support
✅ **{{feature4}}** - Advanced analytics

💰 **Your special price**:
Regular: $99/month → Sale: $59/month

🎯 **Use code**: FLASH40

👉 **Upgrade now**: {{upgradeUrl}}

This offer expires {{expiryDate}} at midnight.

Best regards,
{{productName}} Team`,
  },
];

```

---

### html-email-templates.ts

```typescript
// HTML Email Design Templates with Customizable Sections

export interface EmailSection {
  id: string;
  type: 'header' | 'hero' | 'text' | 'button' | 'image' | 'footer' | 'divider' | '2-column' | 'feature-list';
  content: {
    [key: string]: string;
  };
  editable: boolean;
}

export interface HTMLEmailTemplate {
  id: string;
  name: string;
  thumbnail: string;
  category: string;
  sections: EmailSection[];
}

export const htmlEmailTemplates: HTMLEmailTemplate[] = [
  {
    id: 'modern_professional',
    name: 'Modern Professional',
    category: 'Business',
    thumbnail: '📊',
    sections: [
      {
        id: 'header_1',
        type: 'header',
        editable: true,
        content: {
          logoText: '{{productName}}',
          backgroundColor: '#ffffff',
          textColor: '#1f2937'
        }
      },
      {
        id: 'hero_1',
        type: 'hero',
        editable: true,
        content: {
          title: 'Welcome to Our Platform',
          subtitle: 'Get started with {{productName}} today',
          backgroundColor: '#3b82f6',
          textColor: '#ffffff'
        }
      },
      {
        id: 'text_1',
        type: 'text',
        editable: true,
        content: {
          text: 'Hi {{firstName}},\n\nWe\'re excited to have you on board! Here\'s everything you need to know to get started.'
        }
      },
      {
        id: 'button_1',
        type: 'button',
        editable: true,
        content: {
          text: 'Get Started',
          url: '{{dashboardUrl}}',
          backgroundColor: '#10b981',
          textColor: '#ffffff'
        }
      },
      {
        id: 'footer_1',
        type: 'footer',
        editable: true,
        content: {
          text: '© 2024 {{productName}}. All rights reserved.',
          backgroundColor: '#f3f4f6',
          textColor: '#6b7280'
        }
      }
    ]
  },

  {
    id: 'minimalist_clean',
    name: 'Minimalist Clean',
    category: 'Simple',
    thumbnail: '⚪',
    sections: [
      {
        id: 'text_1',
        type: 'text',
        editable: true,
        content: {
          text: 'Hi {{firstName}} 👋'
        }
      },
      {
        id: 'divider_1',
        type: 'divider',
        editable: false,
        content: {
          color: '#e5e7eb'
        }
      },
      {
        id: 'text_2',
        type: 'text',
        editable: true,
        content: {
          text: 'Your message goes here. Keep it simple and focused.'
        }
      },
      {
        id: 'button_1',
        type: 'button',
        editable: true,
        content: {
          text: 'Take Action',
          url: '{{actionUrl}}',
          backgroundColor: '#000000',
          textColor: '#ffffff'
        }
      },
      {
        id: 'divider_2',
        type: 'divider',
        editable: false,
        content: {
          color: '#e5e7eb'
        }
      },
      {
        id: 'text_3',
        type: 'text',
        editable: true,
        content: {
          text: 'Questions? Just reply to this email.'
        }
      }
    ]
  },

  {
    id: 'bold_gradient',
    name: 'Bold Gradient',
    category: 'Eye-Catching',
    thumbnail: '🌈',
    sections: [
      {
        id: 'hero_1',
        type: 'hero',
        editable: true,
        content: {
          title: '{{title}}',
          subtitle: '{{subtitle}}',
          backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          textColor: '#ffffff'
        }
      },
      {
        id: 'text_1',
        type: 'text',
        editable: true,
        content: {
          text: 'Hi {{firstName}},\n\n{{message}}'
        }
      },
      {
        id: 'button_1',
        type: 'button',
        editable: true,
        content: {
          text: '{{buttonText}}',
          url: '{{buttonUrl}}',
          backgroundColor: '#667eea',
          textColor: '#ffffff'
        }
      }
    ]
  },

  {
    id: 'feature_showcase',
    name: 'Feature Showcase',
    category: 'Product',
    thumbnail: '✨',
    sections: [
      {
        id: 'header_1',
        type: 'header',
        editable: true,
        content: {
          logoText: '{{productName}}',
          backgroundColor: '#ffffff',
          textColor: '#1f2937'
        }
      },
      {
        id: 'text_1',
        type: 'text',
        editable: true,
        content: {
          text: 'Introducing Our Latest Features'
        }
      },
      {
        id: 'features_1',
        type: 'feature-list',
        editable: true,
        content: {
          feature1Title: 'Feature One',
          feature1Text: 'Description of feature one',
          feature2Title: 'Feature Two',
          feature2Text: 'Description of feature two',
          feature3Title: 'Feature Three',
          feature3Text: 'Description of feature three'
        }
      },
      {
        id: 'button_1',
        type: 'button',
        editable: true,
        content: {
          text: 'Learn More',
          url: '{{learnMoreUrl}}',
          backgroundColor: '#3b82f6',
          textColor: '#ffffff'
        }
      }
    ]
  },

  {
    id: 'newsletter_style',
    name: 'Newsletter Style',
    category: 'Content',
    thumbnail: '📰',
    sections: [
      {
        id: 'header_1',
        type: 'header',
        editable: true,
        content: {
          logoText: '{{newsletterName}}',
          backgroundColor: '#1f2937',
          textColor: '#ffffff'
        }
      },
      {
        id: 'image_1',
        type: 'image',
        editable: true,
        content: {
          url: '{{heroImageUrl}}',
          alt: 'Feature image'
        }
      },
      {
        id: 'text_1',
        type: 'text',
        editable: true,
        content: {
          text: '## This Week\'s Highlights\n\n{{content}}'
        }
      },
      {
        id: 'divider_1',
        type: 'divider',
        editable: false,
        content: {
          color: '#e5e7eb'
        }
      },
      {
        id: '2col_1',
        type: '2-column',
        editable: true,
        content: {
          leftTitle: 'Article One',
          leftText: 'Preview of article one...',
          leftUrl: '{{article1Url}}',
          rightTitle: 'Article Two',
          rightText: 'Preview of article two...',
          rightUrl: '{{article2Url}}'
        }
      }
    ]
  },

  {
    id: 'ecommerce_promo',
    name: 'E-commerce Promo',
    category: 'Sales',
    thumbnail: '🛍️',
    sections: [
      {
        id: 'hero_1',
        type: 'hero',
        editable: true,
        content: {
          title: '{{promoTitle}}',
          subtitle: '{{promoSubtitle}}',
          backgroundColor: '#ef4444',
          textColor: '#ffffff'
        }
      },
      {
        id: 'text_1',
        type: 'text',
        editable: true,
        content: {
          text: 'Use code: **{{promoCode}}** at checkout'
        }
      },
      {
        id: 'button_1',
        type: 'button',
        editable: true,
        content: {
          text: 'Shop Now',
          url: '{{shopUrl}}',
          backgroundColor: '#000000',
          textColor: '#ffffff'
        }
      },
      {
        id: 'text_2',
        type: 'text',
        editable: true,
        content: {
          text: '*Offer valid until {{expiryDate}}'
        }
      }
    ]
  },

  {
    id: 'event_invitation',
    name: 'Event Invitation',
    category: 'Event',
    thumbnail: '📅',
    sections: [
      {
        id: 'hero_1',
        type: 'hero',
        editable: true,
        content: {
          title: 'You\'re Invited!',
          subtitle: '{{eventName}}',
          backgroundColor: '#8b5cf6',
          textColor: '#ffffff'
        }
      },
      {
        id: 'text_1',
        type: 'text',
        editable: true,
        content: {
          text: '📅 **When:** {{eventDate}}\n📍 **Where:** {{eventLocation}}\n🕒 **Time:** {{eventTime}}'
        }
      },
      {
        id: 'button_1',
        type: 'button',
        editable: true,
        content: {
          text: 'RSVP Now',
          url: '{{rsvpUrl}}',
          backgroundColor: '#8b5cf6',
          textColor: '#ffffff'
        }
      },
      {
        id: 'text_2',
        type: 'text',
        editable: true,
        content: {
          text: 'We hope to see you there!\n\n{{additionalDetails}}'
        }
      }
    ]
  },

  {
    id: 'welcome_onboarding',
    name: 'Welcome & Onboarding',
    category: 'Onboarding',
    thumbnail: '👋',
    sections: [
      {
        id: 'header_1',
        type: 'header',
        editable: true,
        content: {
          logoText: '{{productName}}',
          backgroundColor: '#ffffff',
          textColor: '#1f2937'
        }
      },
      {
        id: 'text_1',
        type: 'text',
        editable: true,
        content: {
          text: 'Welcome {{firstName}}! 🎉\n\nLet\'s get you started with {{productName}}.'
        }
      },
      {
        id: 'features_1',
        type: 'feature-list',
        editable: true,
        content: {
          feature1Title: '1. Complete Your Profile',
          feature1Text: 'Add your details to personalize your experience',
          feature2Title: '2. Explore Features',
          feature2Text: 'Discover what you can do with {{productName}}',
          feature3Title: '3. Get Support',
          feature3Text: 'Our team is here to help 24/7'
        }
      },
      {
        id: 'button_1',
        type: 'button',
        editable: true,
        content: {
          text: 'Start Your Journey',
          url: '{{dashboardUrl}}',
          backgroundColor: '#10b981',
          textColor: '#ffffff'
        }
      }
    ]
  },

  {
    id: 'feedback_survey',
    name: 'Feedback & Survey',
    category: 'Engagement',
    thumbnail: '📋',
    sections: [
      {
        id: 'text_1',
        type: 'text',
        editable: true,
        content: {
          text: 'Hi {{firstName}},\n\nWe value your opinion!'
        }
      },
      {
        id: 'text_2',
        type: 'text',
        editable: true,
        content: {
          text: '{{questionText}}'
        }
      },
      {
        id: 'button_1',
        type: 'button',
        editable: true,
        content: {
          text: 'Take Survey (2 min)',
          url: '{{surveyUrl}}',
          backgroundColor: '#3b82f6',
          textColor: '#ffffff'
        }
      },
      {
        id: 'text_3',
        type: 'text',
        editable: true,
        content: {
          text: 'Thank you for helping us improve!\n\nYour feedback means everything to us.'
        }
      }
    ]
  },

  {
    id: 'urgent_alert',
    name: 'Urgent Alert',
    category: 'Transactional',
    thumbnail: '⚠️',
    sections: [
      {
        id: 'hero_1',
        type: 'hero',
        editable: true,
        content: {
          title: '⚠️ {{alertTitle}}',
          subtitle: '{{alertSubtitle}}',
          backgroundColor: '#fef3c7',
          textColor: '#92400e'
        }
      },
      {
        id: 'text_1',
        type: 'text',
        editable: true,
        content: {
          text: '{{alertMessage}}'
        }
      },
      {
        id: 'button_1',
        type: 'button',
        editable: true,
        content: {
          text: '{{actionButtonText}}',
          url: '{{actionUrl}}',
          backgroundColor: '#f59e0b',
          textColor: '#000000'
        }
      },
      {
        id: 'text_2',
        type: 'text',
        editable: true,
        content: {
          text: 'If you have questions, contact us at {{supportEmail}}'
        }
      }
    ]
  }
];

// Function to render section to HTML
export function renderSectionToHTML(section: EmailSection): string {
  const { type, content } = section;

  switch (type) {
    case 'header':
      return `
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${content.backgroundColor};">
          <tr>
            <td align="center" style="padding: 20px;">
              <h1 style="margin: 0; color: ${content.textColor}; font-size: 24px;">${content.logoText}</h1>
            </td>
          </tr>
        </table>`;

    case 'hero':
      return `
        <table width="100%" cellpadding="0" cellspacing="0" style="background: ${content.backgroundColor};">
          <tr>
            <td align="center" style="padding: 60px 20px;">
              <h1 style="margin: 0 0 15px 0; color: ${content.textColor}; font-size: 36px; font-weight: bold;">${content.title}</h1>
              <p style="margin: 0; color: ${content.textColor}; font-size: 18px;">${content.subtitle}</p>
            </td>
          </tr>
        </table>`;

    case 'text':
      return `
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 20px; color: #1f2937; font-size: 16px; line-height: 1.6;">
              ${content.text.replace(/\n/g, '<br>')}
            </td>
          </tr>
        </table>`;

    case 'button':
      return `
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding: 30px 20px;">
              <a href="${content.url}" style="display: inline-block; padding: 14px 32px; background-color: ${content.backgroundColor}; color: ${content.textColor}; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">
                ${content.text}
              </a>
            </td>
          </tr>
        </table>`;

    case 'image':
      return `
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding: 20px;">
              <img src="${content.url}" alt="${content.alt}" style="max-width: 100%; height: auto; display: block;" />
            </td>
          </tr>
        </table>`;

    case 'divider':
      return `
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 20px 0;">
              <div style="border-top: 1px solid ${content.color};"></div>
            </td>
          </tr>
        </table>`;

    case 'footer':
      return `
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${content.backgroundColor};">
          <tr>
            <td align="center" style="padding: 30px 20px; color: ${content.textColor}; font-size: 14px;">
              ${content.text}
            </td>
          </tr>
        </table>`;

    case 'feature-list':
      return `
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 20px;">
              <div style="margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 18px;">${content.feature1Title}</h3>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">${content.feature1Text}</p>
              </div>
              <div style="margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 18px;">${content.feature2Title}</h3>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">${content.feature2Text}</p>
              </div>
              <div>
                <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 18px;">${content.feature3Title}</h3>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">${content.feature3Text}</p>
              </div>
            </td>
          </tr>
        </table>`;

    case '2-column':
      return `
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="50%" style="padding: 20px; vertical-align: top;">
              <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 18px;">${content.leftTitle}</h3>
              <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 14px;">${content.leftText}</p>
              <a href="${content.leftUrl}" style="color: #3b82f6; text-decoration: none; font-size: 14px;">Read more →</a>
            </td>
            <td width="50%" style="padding: 20px; vertical-align: top;">
              <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 18px;">${content.rightTitle}</h3>
              <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 14px;">${content.rightText}</p>
              <a href="${content.rightUrl}" style="color: #3b82f6; text-decoration: none; font-size: 14px;">Read more →</a>
            </td>
          </tr>
        </table>`;

    default:
      return '';
  }
}

// Function to generate complete email HTML
export function generateCompleteEmail(template: HTMLEmailTemplate): string {
  const sectionsHTML = template.sections.map(section => renderSectionToHTML(section)).join('\n');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          ${sectionsHTML}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

```

---

### i18n\I18nProvider.tsx

```
'use client';

import { I18nextProvider } from 'react-i18next';
import i18n from './index';

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

```

---

### i18n\index.ts

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en';
import ur from './locales/ur';
import ar from './locales/ar';
import es from './locales/es';
import fr from './locales/fr';
import de from './locales/de';
import hi from './locales/hi';
import pt from './locales/pt';
import zh from './locales/zh';
import tr from './locales/tr';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', dir: 'rtl' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', dir: 'ltr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', dir: 'ltr' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', dir: 'ltr' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', dir: 'ltr' },
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]['code'];

const resources = {
  en: { translation: en },
  ur: { translation: ur },
  ar: { translation: ar },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de },
  hi: { translation: hi },
  pt: { translation: pt },
  zh: { translation: zh },
  tr: { translation: tr },
};

// Get saved language from localStorage (client-side only)
const getSavedLanguage = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('dashboard-language') || 'en';
  }
  return 'en';
};

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: getSavedLanguage(),
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false, // React already handles escaping
      },
      react: {
        useSuspense: false,
      },
    });
}

export const getLanguageDir = (lang: string): 'ltr' | 'rtl' => {
  const found = SUPPORTED_LANGUAGES.find(l => l.code === lang);
  return (found?.dir as 'ltr' | 'rtl') || 'ltr';
};

export default i18n;

```

---

### i18n\locales\ar.ts

```typescript
const ar = {
  sidebar: {
    dashboard: 'لوحة التحكم',
    posts: 'المنشورات',
    comments: 'التعليقات',
    management: 'الإدارة',
    account: 'الحساب',
    settings: 'الإعدادات',
  },
  nav: {
    overview: 'نظرة عامة',
    viralPostsWriter: 'كاتب المنشورات الفيروسية',
    personalizedPostWriter: 'كاتب المنشورات المخصصة',
    autoCommenter: 'المعلق التلقائي',
    commentsSettings: 'إعدادات التعليقات',
    importProfiles: 'استيراد الملفات الشخصية',
    limitsDelays: 'الحدود والتأخيرات',
    tasks: 'المهام',
    activityLogs: 'سجلات النشاط',
    history: 'السجل',
    analytics: 'التحليلات',
    usageLimits: 'الاستخدام والحدود',
    referrals: 'الإحالات',
    extension: 'الإضافة',
    account: 'الحساب',
    billing: 'الفواتير',
  },
  headers: {
    overview: 'نظرة عامة',
    writer: 'كاتب المنشورات المخصصة',
    comments: 'إعدادات التعليقات',
    'trending-posts': 'كاتب المنشورات الفيروسية',
    tasks: 'المهام',
    history: 'السجل',
    limits: 'الحدود والتأخيرات',
    commenter: 'المعلق التلقائي',
    import: 'استيراد الملفات الشخصية',
    analytics: 'التحليلات',
    usage: 'الاستخدام والحدود',
    referrals: 'برنامج الإحالة',
    extension: 'إضافة كروم',
    account: 'إعدادات الحساب',
    activity: 'سجلات النشاط',
  },
  descriptions: {
    overview: 'ما يحدث مع أتمتة لينكد إن الخاصة بك',
    writer: 'إنشاء منشورات AI مخصصة تتوافق مع صوتك وأسلوبك الفريد',
    'trending-posts': 'إنشاء منشورات فيروسية مستوحاة من أفضل محتوى لينكد إن أداءً',
    comments: 'تكوين أسلوب تعليق AI والنبرة والهدف وملفات الصوت',
    tasks: 'عرض وإدارة مهام الإضافة',
    history: 'تصفح سجل الإنشاء والنشر',
    limits: 'حدود الأتمتة الآمنة وضوابط التوقيت في لينكد إن',
    commenter: 'التعليق الجماعي بالذكاء الاصطناعي والمشاركة الآلية',
    import: 'استيراد ملفات لينكد إن الشخصية للمشاركة الآلية',
    analytics: 'تتبع مقاييس المشاركة وسجل الأتمتة وجلسات التواصل وأنشطة الاستيراد',
    usage: 'مراقبة استخدامك اليومي وحدود الخطة',
    referrals: 'اكسب عمولة 30% على كل إحالة مدفوعة',
    extension: 'قم بتثبيت إضافة كروم للبدء',
    account: 'إدارة إعدادات حسابك وتفضيلات اللغة',
    activity: 'سجلات النشاط في الوقت الفعلي من الإضافة',
  },
  accountTab: {
    fullName: 'الاسم الكامل',
    emailAddress: 'عنوان البريد الإلكتروني',
    currentPlan: 'الخطة الحالية',
    memberSince: 'عضو منذ',
    changePlan: 'تغيير الخطة',
    language: 'لغة لوحة التحكم',
    selectLanguage: 'اختر لغتك المفضلة',
    languageChanged: 'تم تغيير اللغة بنجاح',
    na: 'غير متوفر',
  },
  overviewTab: {
    currentPlan: 'الخطة الحالية',
    activePlan: 'خطة نشطة',
    referralEarnings: 'أرباح الإحالة',
    paidUsers: 'مستخدمين مدفوعين',
    totalReferrals: 'إجمالي الإحالات',
    usersJoined: 'مستخدمين انضموا',
    memberSince: 'عضو منذ',
    todaysUsage: 'استخدام اليوم',
    likes: 'إعجابات',
    aiPosts: 'منشورات AI',
    aiComments: 'تعليقات AI',
    follows: 'متابعات',
    getChromeExtension: 'احصل على إضافة كروم',
    installExtension: 'قم بتثبيت الإضافة لبدء الأتمتة',
    inviteFriends: 'ادعُ أصدقاءك',
    earnCommission: 'اكسب عمولة 30% على كل إحالة مدفوعة',
  },
  extensionStatus: {
    connected: 'الإضافة متصلة',
    offline: 'الإضافة غير متصلة',
    lastSeen: 'آخر ظهور',
    retry: 'إعادة المحاولة',
    getExtension: 'احصل على الإضافة',
  },
  theme: { current: 'الحالي', light: 'فاتح', dark: 'داكن' },
  common: {
    loading: 'جاري تحميل لوحة التحكم...',
    loggingOut: 'جاري تسجيل الخروج...',
    logout: 'تسجيل الخروج',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    search: 'بحث',
    close: 'إغلاق',
    copy: 'نسخ',
    copied: 'تم النسخ!',
    generate: 'إنشاء',
    generating: 'جاري الإنشاء...',
    post: 'نشر',
    schedule: 'جدولة',
    preview: 'معاينة',
    refresh: 'تحديث',
    noData: 'لا توجد بيانات',
    confirm: 'تأكيد',
    back: 'رجوع',
    next: 'التالي',
    free: 'مجاني',
    active: 'نشط',
    inactive: 'غير نشط',
    enabled: 'مفعل',
    disabled: 'معطل',
    success: 'نجاح',
    error: 'خطأ',
    warning: 'تحذير',
    info: 'معلومات',
    pending: 'معلق',
    inProgress: 'قيد التنفيذ',
    completed: 'مكتمل',
    failed: 'فشل',
    today: 'اليوم',
    yesterday: 'أمس',
    ago: 'مضت',
    sAgo: 'ث مضت',
    mAgo: 'د مضت',
    hAgo: 'س مضت',
    dAgo: 'ي مضت',
  },
  writerTab: {
    topic: 'الموضوع',
    topicPlaceholder: 'أدخل موضوعاً لمنشور لينكد إن...',
    template: 'القالب',
    tone: 'النبرة',
    length: 'الطول',
    hashtags: 'تضمين الهاشتاغات',
    emojis: 'تضمين الرموز التعبيرية',
    language: 'اللغة',
    targetAudience: 'الجمهور المستهدف',
    keyMessage: 'الرسالة الرئيسية',
    background: 'السياق',
    model: 'نموذج AI',
    advanced: 'خيارات متقدمة',
    generatePost: 'إنشاء منشور',
    generatingPost: 'جاري الإنشاء...',
    inspirationSources: 'المصادر المضافة',
    noSources: 'لا توجد مصادر — أضف ملفات شخصية لمحاكاة أسلوب الكتابة',
    scanProfile: 'فحص الملف الشخصي',
    useInAI: 'استخدم في AI',
    topics: 'المواضيع',
    data: 'البيانات',
    scheduledPosts: 'المنشورات المجدولة',
    drafts: 'المسودات',
    saveDraft: 'حفظ المسودة',
    postToLinkedIn: 'نشر على لينكد إن',
    schedulePost: 'جدولة المنشور',
    copyToClipboard: 'نسخ إلى الحافظة',
  },
  trendingTab: {
    savedPosts: 'المنشورات المحفوظة',
    sharedPosts: 'المنشورات المشتركة',
    feedSchedule: 'جدول التغذية',
    generateFromTrending: 'إنشاء من الرائج',
    period: 'الفترة',
    all: 'كل الأوقات',
    selectPosts: 'اختر المنشورات',
    customPrompt: 'أمر مخصص',
    includeHashtags: 'تضمين الهاشتاغات',
    language: 'اللغة',
    model: 'نموذج AI',
    generate: 'إنشاء',
    preview: 'معاينة المُنشأ',
    noSavedPosts: 'لا توجد منشورات محفوظة بعد',
    noPosts: 'لم يتم العثور على منشورات',
  },
  commentsTab: {
    commentStyle: 'أسلوب التعليق',
    voiceProfiles: 'ملفات الصوت',
    sharedProfiles: 'الملفات المشتركة',
    commentSettings: 'إعدادات التعليقات',
    addProfile: 'إضافة ملف شخصي',
    tone: 'النبرة',
    goal: 'الهدف',
    style: 'الأسلوب',
  },
  commenterTab: {
    autoCommenter: 'المعلق التلقائي',
    bulkComment: 'تعليق جماعي',
    configuration: 'الإعدادات',
    startCommenting: 'بدء التعليق',
    stopCommenting: 'إيقاف التعليق',
  },
  importTab: {
    importProfiles: 'استيراد الملفات الشخصية',
    configuration: 'الإعدادات',
    startImport: 'بدء الاستيراد',
    stopImport: 'إيقاف الاستيراد',
  },
  tasksTab: {
    viewTasks: 'عرض المهام',
    stopAll: 'إيقاف جميع المهام',
    noTasks: 'لم يتم العثور على مهام',
    taskStatus: 'حالة المهمة',
  },
  limitsTab: {
    presets: 'الإعدادات المسبقة',
    delayMode: 'وضع التأخير',
    fixed: 'ثابت',
    random: 'عشوائي',
    betweenActions: 'التأخير بين الإجراءات',
    perAction: 'التأخير لكل إجراء',
    postWriter: 'تأخيرات كاتب المنشورات',
    warmup: 'تأخير الإحماء',
    humanSimulation: 'محاكاة بشرية',
    safetyCritical: 'حرج للسلامة',
    liveActivity: 'الجدول الزمني للنشاط المباشر',
  },
  historyTab: {
    generationHistory: 'سجل الإنشاء',
    noHistory: 'لم يتم العثور على سجل',
  },
  analyticsTab: {
    engagementMetrics: 'مقاييس المشاركة',
    automationHistory: 'سجل الأتمتة',
    networkingSessions: 'جلسات التواصل',
    importActivities: 'أنشطة الاستيراد',
  },
  referralsTab: {
    referralProgram: 'برنامج الإحالة',
    yourReferralLink: 'رابط الإحالة الخاص بك',
    copyLink: 'نسخ الرابط',
    totalReferrals: 'إجمالي الإحالات',
    paidReferrals: 'الإحالات المدفوعة',
    totalEarnings: 'إجمالي الأرباح',
    commissionRate: 'معدل العمولة',
    minPayout: 'الحد الأدنى للدفع',
    requestPayout: 'طلب الدفع',
  },
  usageTab: {
    dailyUsage: 'الاستخدام اليومي',
    planLimits: 'حدود الخطة',
    used: 'مستخدم',
    limit: 'الحد',
    remaining: 'المتبقي',
  },
  languages: {
    en: 'English',
    ur: 'اردو (Urdu)',
    ar: 'العربية (Arabic)',
    es: 'Español (Spanish)',
    fr: 'Français (French)',
    de: 'Deutsch (German)',
    hi: 'हिन्दी (Hindi)',
    pt: 'Português (Portuguese)',
    zh: '中文 (Chinese)',
    tr: 'Türkçe (Turkish)',
    ja: '日本語 (Japanese)',
    ko: '한국어 (Korean)',
    it: 'Italiano (Italian)',
    ru: 'Русский (Russian)',
  },
};

export default ar;

```

---

### i18n\locales\de.ts

```typescript
const de = {
  sidebar: { dashboard: 'Dashboard', posts: 'Beiträge', comments: 'Kommentare', management: 'Verwaltung', account: 'Konto', settings: 'Einstellungen' },
  nav: { overview: 'Übersicht', viralPostsWriter: 'Viraler Post-Schreiber', personalizedPostWriter: 'Personalisierter Post-Schreiber', autoCommenter: 'Auto-Kommentierer', commentsSettings: 'Kommentar-Einstellungen', importProfiles: 'Profile Importieren', limitsDelays: 'Limits & Verzögerungen', tasks: 'Aufgaben', activityLogs: 'Aktivitätsprotokolle', history: 'Verlauf', analytics: 'Analysen', usageLimits: 'Nutzung & Limits', referrals: 'Empfehlungen', extension: 'Erweiterung', account: 'Konto', billing: 'Abrechnung' },
  headers: { overview: 'Übersicht', writer: 'Personalisierter Post-Schreiber', comments: 'Kommentar-Einstellungen', 'trending-posts': 'Viraler Post-Schreiber', tasks: 'Aufgaben', history: 'Verlauf', limits: 'Limits & Verzögerungen', commenter: 'Auto-Kommentierer', import: 'Profile Importieren', analytics: 'Analysen', usage: 'Nutzung & Limits', referrals: 'Empfehlungsprogramm', extension: 'Chrome-Erweiterung', account: 'Kontoeinstellungen', activity: 'Aktivitätsprotokolle' },
  descriptions: { overview: 'Das passiert mit Ihrer LinkedIn-Automatisierung', writer: 'Erstellen Sie personalisierte AI-Posts, die Ihrer einzigartigen Stimme und Ihrem Stil entsprechen', 'trending-posts': 'Generieren Sie virale Posts, inspiriert von den erfolgreichsten LinkedIn-Inhalten', comments: 'Konfigurieren Sie AI-Kommentarstil, Ton, Ziel und Stimmprofile', tasks: 'Erweiterungsaufgaben anzeigen und verwalten', history: 'Durchsuchen Sie Ihren Generierungs- und Veröffentlichungsverlauf', limits: 'LinkedIn-sichere Automatisierungslimits und Zeitsteuerungen', commenter: 'AI-gestützte Massenkommentierung und automatisiertes Engagement', import: 'LinkedIn-Profile für automatisiertes Engagement importieren', analytics: 'Verfolgen Sie Engagement-Metriken, Automatisierungsverlauf, Netzwerksitzungen und Importaktivitäten', usage: 'Überwachen Sie Ihre tägliche Nutzung und Planlimits', referrals: 'Verdienen Sie 30% Provision bei jeder bezahlten Empfehlung', extension: 'Installieren Sie die Chrome-Erweiterung, um loszulegen', account: 'Verwalten Sie Ihre Kontoeinstellungen und Sprachpräferenzen', activity: 'Echtzeit-Aktivitätsprotokolle von Ihrer Erweiterung' },
  accountTab: { fullName: 'Vollständiger Name', emailAddress: 'E-Mail-Adresse', currentPlan: 'Aktueller Plan', memberSince: 'Mitglied Seit', changePlan: 'Plan Ändern', language: 'Dashboard-Sprache', selectLanguage: 'Wählen Sie Ihre bevorzugte Sprache', languageChanged: 'Sprache erfolgreich geändert', na: 'K.A.' },
  overviewTab: { currentPlan: 'Aktueller Plan', activePlan: 'Aktiver Plan', referralEarnings: 'Empfehlungseinnahmen', paidUsers: 'zahlende Nutzer', totalReferrals: 'Gesamtempfehlungen', usersJoined: 'Nutzer beigetreten', memberSince: 'Mitglied Seit', todaysUsage: 'Heutige Nutzung', likes: 'Likes', aiPosts: 'AI-Beiträge', aiComments: 'AI-Kommentare', follows: 'Folgen', getChromeExtension: 'Chrome-Erweiterung Holen', installExtension: 'Installieren Sie unsere Erweiterung, um mit der Automatisierung zu beginnen', inviteFriends: 'Freunde Einladen', earnCommission: 'Verdienen Sie 30% Provision bei jeder bezahlten Empfehlung' },
  extensionStatus: { connected: 'Erweiterung Verbunden', offline: 'Erweiterung Offline', lastSeen: 'zuletzt gesehen', retry: 'Wiederholen', getExtension: 'Erweiterung Holen' },
  theme: { current: 'Aktuell', light: 'Hell', dark: 'Dunkel' },
  common: { loading: 'Ihr Dashboard wird geladen...', loggingOut: 'Abmeldung...', logout: 'Abmelden', save: 'Speichern', cancel: 'Abbrechen', delete: 'Löschen', edit: 'Bearbeiten', search: 'Suchen', close: 'Schließen', copy: 'Kopieren', copied: 'Kopiert!', generate: 'Generieren', generating: 'Generierung...', post: 'Veröffentlichen', schedule: 'Planen', preview: 'Vorschau', refresh: 'Aktualisieren', noData: 'Keine Daten verfügbar', confirm: 'Bestätigen', back: 'Zurück', next: 'Weiter', free: 'Kostenlos', active: 'Aktiv', inactive: 'Inaktiv', enabled: 'Aktiviert', disabled: 'Deaktiviert', success: 'Erfolg', error: 'Fehler', warning: 'Warnung', info: 'Info', pending: 'Ausstehend', inProgress: 'In Bearbeitung', completed: 'Abgeschlossen', failed: 'Fehlgeschlagen', today: 'Heute', yesterday: 'Gestern', ago: 'vor', sAgo: 's', mAgo: 'Min.', hAgo: 'Std.', dAgo: 'T.' },
  writerTab: { topic: 'Thema', topicPlaceholder: 'Geben Sie ein Thema für Ihren LinkedIn-Beitrag ein...', template: 'Vorlage', tone: 'Ton', length: 'Länge', hashtags: 'Hashtags Einfügen', emojis: 'Emojis Einfügen', language: 'Sprache', targetAudience: 'Zielgruppe', keyMessage: 'Kernbotschaft', background: 'Hintergrundkontext', model: 'AI-Modell', advanced: 'Erweiterte Optionen', generatePost: 'Beitrag Generieren', generatingPost: 'Generierung...', inspirationSources: 'Hinzugefügte Quellen', noSources: 'Keine Quellen — fügen Sie Profile hinzu, um den Schreibstil nachzuahmen', scanProfile: 'Profil Scannen', useInAI: 'In AI Verwenden', topics: 'Themen', data: 'Daten', scheduledPosts: 'Geplante Beiträge', drafts: 'Entwürfe', saveDraft: 'Entwurf Speichern', postToLinkedIn: 'Auf LinkedIn Posten', schedulePost: 'Beitrag Planen', copyToClipboard: 'In Zwischenablage Kopieren' },
  trendingTab: { savedPosts: 'Gespeicherte Beiträge', sharedPosts: 'Geteilte Beiträge', feedSchedule: 'Feed-Planung', generateFromTrending: 'Aus Trends Generieren', period: 'Zeitraum', all: 'Gesamte Zeit', selectPosts: 'Beiträge Auswählen', customPrompt: 'Benutzerdefinierter Prompt', includeHashtags: 'Hashtags Einfügen', language: 'Sprache', model: 'AI-Modell', generate: 'Generieren', preview: 'Generierte Vorschau', noSavedPosts: 'Noch keine gespeicherten Beiträge', noPosts: 'Keine Beiträge gefunden' },
  commentsTab: { commentStyle: 'Kommentarstil', voiceProfiles: 'Stimmprofile', sharedProfiles: 'Geteilte Profile', commentSettings: 'Kommentar-Einstellungen', addProfile: 'Profil Hinzufügen', tone: 'Ton', goal: 'Ziel', style: 'Stil' },
  commenterTab: { autoCommenter: 'Auto-Kommentierer', bulkComment: 'Massenkommentar', configuration: 'Konfiguration', startCommenting: 'Kommentierung Starten', stopCommenting: 'Kommentierung Stoppen' },
  importTab: { importProfiles: 'Profile Importieren', configuration: 'Konfiguration', startImport: 'Import Starten', stopImport: 'Import Stoppen' },
  tasksTab: { viewTasks: 'Aufgaben Anzeigen', stopAll: 'Alle Aufgaben Stoppen', noTasks: 'Keine Aufgaben gefunden', taskStatus: 'Aufgabenstatus' },
  limitsTab: { presets: 'Voreinstellungen', delayMode: 'Verzögerungsmodus', fixed: 'Fest', random: 'Zufällig', betweenActions: 'Verzögerung Zwischen Aktionen', perAction: 'Verzögerung Pro Aktion', postWriter: 'Schreiber-Verzögerungen', warmup: 'Aufwärmverzögerung', humanSimulation: 'Menschliche Simulation', safetyCritical: 'SICHERHEITSKRITISCH', liveActivity: 'Live-Aktivitätszeitlinie' },
  historyTab: { generationHistory: 'Generierungsverlauf', noHistory: 'Kein Verlauf gefunden' },
  analyticsTab: { engagementMetrics: 'Engagement-Metriken', automationHistory: 'Automatisierungsverlauf', networkingSessions: 'Netzwerksitzungen', importActivities: 'Importaktivitäten' },
  referralsTab: { referralProgram: 'Empfehlungsprogramm', yourReferralLink: 'Ihr Empfehlungslink', copyLink: 'Link Kopieren', totalReferrals: 'Gesamtempfehlungen', paidReferrals: 'Bezahlte Empfehlungen', totalEarnings: 'Gesamteinnahmen', commissionRate: 'Provisionssatz', minPayout: 'Mindestauszahlung', requestPayout: 'Auszahlung Anfordern' },
  usageTab: { dailyUsage: 'Tägliche Nutzung', planLimits: 'Planlimits', used: 'Verwendet', limit: 'Limit', remaining: 'Verbleibend' },
  languages: { en: 'English', ur: 'اردو (Urdu)', ar: 'العربية (Arabic)', es: 'Español (Spanish)', fr: 'Français (French)', de: 'Deutsch (German)', hi: 'हिन्दी (Hindi)', pt: 'Português (Portuguese)', zh: '中文 (Chinese)', tr: 'Türkçe (Turkish)', ja: '日本語 (Japanese)', ko: '한국어 (Korean)', it: 'Italiano (Italian)', ru: 'Русский (Russian)' },
};
export default de;

```

---

### i18n\locales\en.ts

```typescript
const en = {
  // Sidebar section headers
  sidebar: {
    dashboard: 'Dashboard',
    posts: 'Posts',
    comments: 'Comments',
    outreach: 'Outreach',
    management: 'Management',
    account: 'Account',
    settings: 'Settings',
  },

  // Navigation items
  nav: {
    overview: 'Overview',
    viralPostsWriter: 'Viral Posts Writer',
    personalizedPostWriter: 'Personalized Post Writer',
    autoCommenter: 'Auto Commenter',
    commentsSettings: 'Comments Settings',
    leadWarmer: 'Lead Warmer',
    limitsDelays: 'Limits & Delays',
    tasks: 'Tasks',
    activityLogs: 'Activity Logs',
    history: 'History',
    analytics: 'Analytics',
    usageLimits: 'Usage & Limits',
    referrals: 'Referrals',
    extension: 'Extension',
    account: 'Account',
    billing: 'Billing',
  },

  // Page headers
  headers: {
    overview: 'Overview',
    writer: 'Personalized Post Writer',
    comments: 'Comments Settings',
    'trending-posts': 'Viral Posts Writer',
    tasks: 'Tasks',
    history: 'History',
    limits: 'Limits & Delays',
    commenter: 'Auto Commenter',
    import: 'Lead Warmer',
    analytics: 'Analytics',
    usage: 'Usage & Limits',
    referrals: 'Referral Program',
    extension: 'Chrome Extension',
    account: 'Account Settings',
    activity: 'Activity Logs',
  },

  // Page descriptions
  descriptions: {
    overview: "Here's what's happening with your LinkedIn automation",
    writer: 'Create personalized AI posts that match your unique voice and style',
    'trending-posts': 'Generate viral posts inspired by top-performing LinkedIn content',
    comments: 'Configure AI comment style, tone, goal, and voice profiles',
    tasks: 'View and manage extension tasks',
    history: 'Browse your generation and publishing history',
    limits: 'LinkedIn-safe automation limits and timing controls',
    commenter: 'AI-powered bulk commenting and automated engagement',
    import: 'Turn cold prospects into warm leads with automated multi-touch sequences',
    analytics: 'Track engagement metrics, automation history, networking sessions, and import activities',
    usage: 'Monitor your daily usage and plan limits',
    referrals: 'Earn 30% commission on every paid referral',
    extension: 'Install the Chrome extension to get started',
    account: 'Manage your account settings and language preferences',
    activity: 'Real-time activity logs from your extension',
  },

  // Account tab
  accountTab: {
    fullName: 'Full Name',
    emailAddress: 'Email Address',
    currentPlan: 'Current Plan',
    memberSince: 'Member Since',
    changePlan: 'Change Plan',
    language: 'Dashboard Language',
    selectLanguage: 'Select your preferred language',
    languageChanged: 'Language changed successfully',
    na: 'N/A',
  },

  // Overview tab
  overviewTab: {
    currentPlan: 'Current Plan',
    activePlan: 'Active Plan',
    referralEarnings: 'Referral Earnings',
    paidUsers: 'paid users',
    totalReferrals: 'Total Referrals',
    usersJoined: 'users joined',
    memberSince: 'Member Since',
    todaysUsage: "Today's Usage",
    likes: 'Likes',
    aiPosts: 'AI Posts',
    aiComments: 'AI Comments',
    follows: 'Follows',
    getChromeExtension: 'Get Chrome Extension',
    installExtension: 'Install our extension to start automating',
    inviteFriends: 'Invite Friends',
    earnCommission: 'Earn 30% commission on every paid referral',
  },

  // Extension status
  extensionStatus: {
    connected: 'Extension Connected',
    offline: 'Extension Offline',
    lastSeen: 'last seen',
    retry: 'Retry',
    getExtension: 'Get Extension',
  },

  // Theme
  theme: {
    current: 'Current',
    light: 'Light',
    dark: 'Dark',
  },

  // Common
  common: {
    loading: 'Loading your dashboard...',
    loggingOut: 'Logging out...',
    logout: 'Logout',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    search: 'Search',
    close: 'Close',
    copy: 'Copy',
    copied: 'Copied!',
    generate: 'Generate',
    generating: 'Generating...',
    post: 'Post',
    schedule: 'Schedule',
    preview: 'Preview',
    refresh: 'Refresh',
    noData: 'No data available',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    free: 'Free',
    active: 'Active',
    inactive: 'Inactive',
    enabled: 'Enabled',
    disabled: 'Disabled',
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Info',
    pending: 'Pending',
    inProgress: 'In Progress',
    completed: 'Completed',
    failed: 'Failed',
    today: 'Today',
    yesterday: 'Yesterday',
    ago: 'ago',
    sAgo: 's ago',
    mAgo: 'm ago',
    hAgo: 'h ago',
    dAgo: 'd ago',
  },

  // Writer tab
  writerTab: {
    topic: 'Topic',
    topicPlaceholder: 'Enter a topic for your LinkedIn post...',
    template: 'Template',
    tone: 'Tone',
    length: 'Length',
    hashtags: 'Include Hashtags',
    emojis: 'Include Emojis',
    language: 'Language',
    targetAudience: 'Target Audience',
    keyMessage: 'Key Message',
    background: 'Background Context',
    model: 'AI Model',
    advanced: 'Advanced Options',
    generatePost: 'Generate Post',
    generatingPost: 'Generating...',
    inspirationSources: 'Added Sources',
    noSources: 'No sources — add profiles below to mimic writing style',
    scanProfile: 'Scan Profile',
    useInAI: 'Use in AI',
    topics: 'Topics',
    data: 'Data',
    scheduledPosts: 'Scheduled Posts',
    drafts: 'Drafts',
    saveDraft: 'Save Draft',
    postToLinkedIn: 'Post to LinkedIn',
    schedulePost: 'Schedule Post',
    copyToClipboard: 'Copy to Clipboard',
  },

  // Trending posts tab
  trendingTab: {
    savedPosts: 'Saved Posts',
    sharedPosts: 'Shared Posts',
    feedSchedule: 'Feed Schedule',
    generateFromTrending: 'Generate from Trending',
    period: 'Period',
    all: 'All Time',
    selectPosts: 'Select Posts',
    customPrompt: 'Custom Prompt',
    includeHashtags: 'Include Hashtags',
    language: 'Language',
    model: 'AI Model',
    generate: 'Generate',
    preview: 'Preview Generated',
    noSavedPosts: 'No saved posts yet',
    noPosts: 'No posts found',
  },

  // Comments tab
  commentsTab: {
    commentStyle: 'Comment Style',
    voiceProfiles: 'Voice Profiles',
    sharedProfiles: 'Shared Profiles',
    commentSettings: 'Comment Settings',
    addProfile: 'Add Profile',
    tone: 'Tone',
    goal: 'Goal',
    style: 'Style',
  },

  // Commenter tab
  commenterTab: {
    autoCommenter: 'Auto Commenter',
    bulkComment: 'Bulk Comment',
    configuration: 'Configuration',
    startCommenting: 'Start Commenting',
    stopCommenting: 'Stop Commenting',
  },

  // Import tab
  importTab: {
    importProfiles: 'Import Profiles',
    configuration: 'Configuration',
    startImport: 'Start Import',
    stopImport: 'Stop Import',
  },

  // Tasks tab
  tasksTab: {
    viewTasks: 'View Tasks',
    stopAll: 'Stop All Tasks',
    noTasks: 'No tasks found',
    taskStatus: 'Task Status',
  },

  // Limits tab
  limitsTab: {
    presets: 'Presets',
    delayMode: 'Delay Mode',
    fixed: 'Fixed',
    random: 'Random',
    betweenActions: 'Between Action Delays',
    perAction: 'Per Action Delays',
    postWriter: 'Post Writer Delays',
    warmup: 'Warmup Delay',
    humanSimulation: 'Human Simulation',
    safetyCritical: 'SAFETY CRITICAL',
    liveActivity: 'Live Activity Timeline',
  },

  // History tab
  historyTab: {
    generationHistory: 'Generation History',
    noHistory: 'No history found',
  },

  // Analytics tab
  analyticsTab: {
    engagementMetrics: 'Engagement Metrics',
    automationHistory: 'Automation History',
    networkingSessions: 'Networking Sessions',
    importActivities: 'Import Activities',
  },

  // Referrals tab
  referralsTab: {
    referralProgram: 'Referral Program',
    yourReferralLink: 'Your Referral Link',
    copyLink: 'Copy Link',
    totalReferrals: 'Total Referrals',
    paidReferrals: 'Paid Referrals',
    totalEarnings: 'Total Earnings',
    commissionRate: 'Commission Rate',
    minPayout: 'Min Payout',
    requestPayout: 'Request Payout',
  },

  // Usage tab
  usageTab: {
    dailyUsage: 'Daily Usage',
    planLimits: 'Plan Limits',
    used: 'Used',
    limit: 'Limit',
    remaining: 'Remaining',
  },

  // Languages list (for the selector)
  languages: {
    en: 'English',
    ur: 'اردو (Urdu)',
    ar: 'العربية (Arabic)',
    es: 'Español (Spanish)',
    fr: 'Français (French)',
    de: 'Deutsch (German)',
    hi: 'हिन्दी (Hindi)',
    pt: 'Português (Portuguese)',
    zh: '中文 (Chinese)',
    tr: 'Türkçe (Turkish)',
    ja: '日本語 (Japanese)',
    ko: '한국어 (Korean)',
    it: 'Italiano (Italian)',
    ru: 'Русский (Russian)',
  },
};

export default en;
export type TranslationKeys = typeof en;

```

---

### i18n\locales\es.ts

```typescript
const es = {
  sidebar: { dashboard: 'Panel', posts: 'Publicaciones', comments: 'Comentarios', management: 'Gestión', account: 'Cuenta', settings: 'Configuración' },
  nav: { overview: 'Resumen', viralPostsWriter: 'Escritor de Posts Virales', personalizedPostWriter: 'Escritor de Posts Personalizados', autoCommenter: 'Comentarista Automático', commentsSettings: 'Configuración de Comentarios', importProfiles: 'Importar Perfiles', limitsDelays: 'Límites y Retrasos', tasks: 'Tareas', activityLogs: 'Registros de Actividad', history: 'Historial', analytics: 'Analíticas', usageLimits: 'Uso y Límites', referrals: 'Referidos', extension: 'Extensión', account: 'Cuenta', billing: 'Facturación' },
  headers: { overview: 'Resumen', writer: 'Escritor de Posts Personalizados', comments: 'Configuración de Comentarios', 'trending-posts': 'Escritor de Posts Virales', tasks: 'Tareas', history: 'Historial', limits: 'Límites y Retrasos', commenter: 'Comentarista Automático', import: 'Importar Perfiles', analytics: 'Analíticas', usage: 'Uso y Límites', referrals: 'Programa de Referidos', extension: 'Extensión de Chrome', account: 'Configuración de Cuenta', activity: 'Registros de Actividad' },
  descriptions: { overview: 'Esto es lo que está pasando con tu automatización de LinkedIn', writer: 'Crea publicaciones AI personalizadas que coincidan con tu voz y estilo únicos', 'trending-posts': 'Genera publicaciones virales inspiradas en el contenido más exitoso de LinkedIn', comments: 'Configura el estilo, tono, objetivo y perfiles de voz de comentarios AI', tasks: 'Ver y gestionar tareas de la extensión', history: 'Explora tu historial de generación y publicación', limits: 'Límites de automatización seguros para LinkedIn y controles de tiempo', commenter: 'Comentarios masivos con AI y participación automatizada', import: 'Importa perfiles de LinkedIn para participación automatizada', analytics: 'Rastrea métricas de participación, historial de automatización, sesiones de networking y actividades de importación', usage: 'Monitorea tu uso diario y límites del plan', referrals: 'Gana 30% de comisión en cada referido pagado', extension: 'Instala la extensión de Chrome para comenzar', account: 'Gestiona la configuración de tu cuenta y preferencias de idioma', activity: 'Registros de actividad en tiempo real de tu extensión' },
  accountTab: { fullName: 'Nombre Completo', emailAddress: 'Correo Electrónico', currentPlan: 'Plan Actual', memberSince: 'Miembro Desde', changePlan: 'Cambiar Plan', language: 'Idioma del Panel', selectLanguage: 'Selecciona tu idioma preferido', languageChanged: 'Idioma cambiado exitosamente', na: 'N/D' },
  overviewTab: { currentPlan: 'Plan Actual', activePlan: 'Plan Activo', referralEarnings: 'Ganancias por Referidos', paidUsers: 'usuarios pagados', totalReferrals: 'Total de Referidos', usersJoined: 'usuarios unidos', memberSince: 'Miembro Desde', todaysUsage: 'Uso de Hoy', likes: 'Me Gusta', aiPosts: 'Posts AI', aiComments: 'Comentarios AI', follows: 'Seguidos', getChromeExtension: 'Obtener Extensión de Chrome', installExtension: 'Instala nuestra extensión para comenzar a automatizar', inviteFriends: 'Invitar Amigos', earnCommission: 'Gana 30% de comisión en cada referido pagado' },
  extensionStatus: { connected: 'Extensión Conectada', offline: 'Extensión Desconectada', lastSeen: 'visto por última vez', retry: 'Reintentar', getExtension: 'Obtener Extensión' },
  theme: { current: 'Actual', light: 'Claro', dark: 'Oscuro' },
  common: { loading: 'Cargando tu panel...', loggingOut: 'Cerrando sesión...', logout: 'Cerrar Sesión', save: 'Guardar', cancel: 'Cancelar', delete: 'Eliminar', edit: 'Editar', search: 'Buscar', close: 'Cerrar', copy: 'Copiar', copied: '¡Copiado!', generate: 'Generar', generating: 'Generando...', post: 'Publicar', schedule: 'Programar', preview: 'Vista Previa', refresh: 'Actualizar', noData: 'Sin datos disponibles', confirm: 'Confirmar', back: 'Atrás', next: 'Siguiente', free: 'Gratis', active: 'Activo', inactive: 'Inactivo', enabled: 'Habilitado', disabled: 'Deshabilitado', success: 'Éxito', error: 'Error', warning: 'Advertencia', info: 'Info', pending: 'Pendiente', inProgress: 'En Progreso', completed: 'Completado', failed: 'Fallido', today: 'Hoy', yesterday: 'Ayer', ago: 'atrás', sAgo: 's atrás', mAgo: 'm atrás', hAgo: 'h atrás', dAgo: 'd atrás' },
  writerTab: { topic: 'Tema', topicPlaceholder: 'Ingresa un tema para tu publicación de LinkedIn...', template: 'Plantilla', tone: 'Tono', length: 'Longitud', hashtags: 'Incluir Hashtags', emojis: 'Incluir Emojis', language: 'Idioma', targetAudience: 'Audiencia Objetivo', keyMessage: 'Mensaje Clave', background: 'Contexto', model: 'Modelo AI', advanced: 'Opciones Avanzadas', generatePost: 'Generar Publicación', generatingPost: 'Generando...', inspirationSources: 'Fuentes Añadidas', noSources: 'Sin fuentes — añade perfiles para imitar estilo de escritura', scanProfile: 'Escanear Perfil', useInAI: 'Usar en AI', topics: 'Temas', data: 'Datos', scheduledPosts: 'Posts Programados', drafts: 'Borradores', saveDraft: 'Guardar Borrador', postToLinkedIn: 'Publicar en LinkedIn', schedulePost: 'Programar Publicación', copyToClipboard: 'Copiar al Portapapeles' },
  trendingTab: { savedPosts: 'Posts Guardados', sharedPosts: 'Posts Compartidos', feedSchedule: 'Programación de Feed', generateFromTrending: 'Generar desde Tendencias', period: 'Período', all: 'Todo el Tiempo', selectPosts: 'Seleccionar Posts', customPrompt: 'Prompt Personalizado', includeHashtags: 'Incluir Hashtags', language: 'Idioma', model: 'Modelo AI', generate: 'Generar', preview: 'Vista Previa Generada', noSavedPosts: 'Aún no hay posts guardados', noPosts: 'No se encontraron posts' },
  commentsTab: { commentStyle: 'Estilo de Comentario', voiceProfiles: 'Perfiles de Voz', sharedProfiles: 'Perfiles Compartidos', commentSettings: 'Configuración de Comentarios', addProfile: 'Añadir Perfil', tone: 'Tono', goal: 'Objetivo', style: 'Estilo' },
  commenterTab: { autoCommenter: 'Comentarista Automático', bulkComment: 'Comentario Masivo', configuration: 'Configuración', startCommenting: 'Iniciar Comentarios', stopCommenting: 'Detener Comentarios' },
  importTab: { importProfiles: 'Importar Perfiles', configuration: 'Configuración', startImport: 'Iniciar Importación', stopImport: 'Detener Importación' },
  tasksTab: { viewTasks: 'Ver Tareas', stopAll: 'Detener Todas las Tareas', noTasks: 'No se encontraron tareas', taskStatus: 'Estado de Tarea' },
  limitsTab: { presets: 'Preajustes', delayMode: 'Modo de Retraso', fixed: 'Fijo', random: 'Aleatorio', betweenActions: 'Retraso Entre Acciones', perAction: 'Retraso Por Acción', postWriter: 'Retrasos del Escritor', warmup: 'Retraso de Calentamiento', humanSimulation: 'Simulación Humana', safetyCritical: 'CRÍTICO DE SEGURIDAD', liveActivity: 'Línea de Tiempo de Actividad' },
  historyTab: { generationHistory: 'Historial de Generación', noHistory: 'No se encontró historial' },
  analyticsTab: { engagementMetrics: 'Métricas de Participación', automationHistory: 'Historial de Automatización', networkingSessions: 'Sesiones de Networking', importActivities: 'Actividades de Importación' },
  referralsTab: { referralProgram: 'Programa de Referidos', yourReferralLink: 'Tu Enlace de Referido', copyLink: 'Copiar Enlace', totalReferrals: 'Total de Referidos', paidReferrals: 'Referidos Pagados', totalEarnings: 'Ganancias Totales', commissionRate: 'Tasa de Comisión', minPayout: 'Pago Mínimo', requestPayout: 'Solicitar Pago' },
  usageTab: { dailyUsage: 'Uso Diario', planLimits: 'Límites del Plan', used: 'Usado', limit: 'Límite', remaining: 'Restante' },
  languages: { en: 'English', ur: 'اردو (Urdu)', ar: 'العربية (Arabic)', es: 'Español (Spanish)', fr: 'Français (French)', de: 'Deutsch (German)', hi: 'हिन्दी (Hindi)', pt: 'Português (Portuguese)', zh: '中文 (Chinese)', tr: 'Türkçe (Turkish)', ja: '日本語 (Japanese)', ko: '한국어 (Korean)', it: 'Italiano (Italian)', ru: 'Русский (Russian)' },
};
export default es;

```

---

### i18n\locales\fr.ts

```typescript
const fr = {
  sidebar: { dashboard: 'Tableau de Bord', posts: 'Publications', comments: 'Commentaires', management: 'Gestion', account: 'Compte', settings: 'Paramètres' },
  nav: { overview: 'Aperçu', viralPostsWriter: 'Rédacteur de Posts Viraux', personalizedPostWriter: 'Rédacteur de Posts Personnalisés', autoCommenter: 'Commentateur Auto', commentsSettings: 'Paramètres des Commentaires', importProfiles: 'Importer des Profils', limitsDelays: 'Limites et Délais', tasks: 'Tâches', activityLogs: "Journaux d'Activité", history: 'Historique', analytics: 'Analytiques', usageLimits: 'Utilisation et Limites', referrals: 'Parrainages', extension: 'Extension', account: 'Compte', billing: 'Facturation' },
  headers: { overview: 'Aperçu', writer: 'Rédacteur de Posts Personnalisés', comments: 'Paramètres des Commentaires', 'trending-posts': 'Rédacteur de Posts Viraux', tasks: 'Tâches', history: 'Historique', limits: 'Limites et Délais', commenter: 'Commentateur Auto', import: 'Importer des Profils', analytics: 'Analytiques', usage: 'Utilisation et Limites', referrals: 'Programme de Parrainage', extension: 'Extension Chrome', account: 'Paramètres du Compte', activity: "Journaux d'Activité" },
  descriptions: { overview: "Voici ce qui se passe avec votre automatisation LinkedIn", writer: 'Créez des posts AI personnalisés qui correspondent à votre voix et style uniques', 'trending-posts': 'Générez des posts viraux inspirés du contenu LinkedIn le plus performant', comments: "Configurez le style, le ton, l'objectif et les profils vocaux des commentaires AI", tasks: "Voir et gérer les tâches de l'extension", history: 'Parcourez votre historique de génération et de publication', limits: "Limites d'automatisation sûres pour LinkedIn et contrôles de timing", commenter: 'Commentaires en masse par AI et engagement automatisé', import: "Importez des profils LinkedIn pour l'engagement automatisé", analytics: "Suivez les métriques d'engagement, l'historique d'automatisation, les sessions de réseautage et les activités d'importation", usage: 'Surveillez votre utilisation quotidienne et les limites du plan', referrals: 'Gagnez 30% de commission sur chaque parrainage payant', extension: "Installez l'extension Chrome pour commencer", account: 'Gérez les paramètres de votre compte et vos préférences linguistiques', activity: "Journaux d'activité en temps réel de votre extension" },
  accountTab: { fullName: 'Nom Complet', emailAddress: 'Adresse E-mail', currentPlan: 'Plan Actuel', memberSince: 'Membre Depuis', changePlan: 'Changer de Plan', language: 'Langue du Tableau de Bord', selectLanguage: 'Sélectionnez votre langue préférée', languageChanged: 'Langue changée avec succès', na: 'N/D' },
  overviewTab: { currentPlan: 'Plan Actuel', activePlan: 'Plan Actif', referralEarnings: 'Gains de Parrainage', paidUsers: 'utilisateurs payants', totalReferrals: 'Total des Parrainages', usersJoined: 'utilisateurs inscrits', memberSince: 'Membre Depuis', todaysUsage: "Utilisation d'Aujourd'hui", likes: "J'aime", aiPosts: 'Posts AI', aiComments: 'Commentaires AI', follows: 'Abonnements', getChromeExtension: 'Obtenir Extension Chrome', installExtension: "Installez notre extension pour commencer l'automatisation", inviteFriends: 'Inviter des Amis', earnCommission: 'Gagnez 30% de commission sur chaque parrainage payant' },
  extensionStatus: { connected: 'Extension Connectée', offline: 'Extension Hors Ligne', lastSeen: 'vu pour la dernière fois', retry: 'Réessayer', getExtension: 'Obtenir Extension' },
  theme: { current: 'Actuel', light: 'Clair', dark: 'Sombre' },
  common: { loading: 'Chargement de votre tableau de bord...', loggingOut: 'Déconnexion...', logout: 'Déconnexion', save: 'Enregistrer', cancel: 'Annuler', delete: 'Supprimer', edit: 'Modifier', search: 'Rechercher', close: 'Fermer', copy: 'Copier', copied: 'Copié !', generate: 'Générer', generating: 'Génération...', post: 'Publier', schedule: 'Planifier', preview: 'Aperçu', refresh: 'Actualiser', noData: 'Aucune donnée disponible', confirm: 'Confirmer', back: 'Retour', next: 'Suivant', free: 'Gratuit', active: 'Actif', inactive: 'Inactif', enabled: 'Activé', disabled: 'Désactivé', success: 'Succès', error: 'Erreur', warning: 'Avertissement', info: 'Info', pending: 'En Attente', inProgress: 'En Cours', completed: 'Terminé', failed: 'Échoué', today: "Aujourd'hui", yesterday: 'Hier', ago: 'il y a', sAgo: 's', mAgo: 'min', hAgo: 'h', dAgo: 'j' },
  writerTab: { topic: 'Sujet', topicPlaceholder: 'Entrez un sujet pour votre publication LinkedIn...', template: 'Modèle', tone: 'Ton', length: 'Longueur', hashtags: 'Inclure les Hashtags', emojis: 'Inclure les Emojis', language: 'Langue', targetAudience: 'Public Cible', keyMessage: 'Message Clé', background: 'Contexte', model: 'Modèle AI', advanced: 'Options Avancées', generatePost: 'Générer un Post', generatingPost: 'Génération...', inspirationSources: 'Sources Ajoutées', noSources: "Aucune source — ajoutez des profils pour imiter le style d'écriture", scanProfile: 'Scanner le Profil', useInAI: 'Utiliser dans AI', topics: 'Sujets', data: 'Données', scheduledPosts: 'Posts Planifiés', drafts: 'Brouillons', saveDraft: 'Sauvegarder le Brouillon', postToLinkedIn: 'Publier sur LinkedIn', schedulePost: 'Planifier le Post', copyToClipboard: 'Copier dans le Presse-papiers' },
  trendingTab: { savedPosts: 'Posts Sauvegardés', sharedPosts: 'Posts Partagés', feedSchedule: 'Planification du Flux', generateFromTrending: 'Générer depuis les Tendances', period: 'Période', all: 'Tout le Temps', selectPosts: 'Sélectionner les Posts', customPrompt: 'Prompt Personnalisé', includeHashtags: 'Inclure les Hashtags', language: 'Langue', model: 'Modèle AI', generate: 'Générer', preview: 'Aperçu Généré', noSavedPosts: 'Aucun post sauvegardé', noPosts: 'Aucun post trouvé' },
  commentsTab: { commentStyle: 'Style de Commentaire', voiceProfiles: 'Profils Vocaux', sharedProfiles: 'Profils Partagés', commentSettings: 'Paramètres des Commentaires', addProfile: 'Ajouter un Profil', tone: 'Ton', goal: 'Objectif', style: 'Style' },
  commenterTab: { autoCommenter: 'Commentateur Auto', bulkComment: 'Commentaire en Masse', configuration: 'Configuration', startCommenting: 'Démarrer les Commentaires', stopCommenting: 'Arrêter les Commentaires' },
  importTab: { importProfiles: 'Importer des Profils', configuration: 'Configuration', startImport: "Démarrer l'Importation", stopImport: "Arrêter l'Importation" },
  tasksTab: { viewTasks: 'Voir les Tâches', stopAll: 'Arrêter Toutes les Tâches', noTasks: 'Aucune tâche trouvée', taskStatus: 'Statut de la Tâche' },
  limitsTab: { presets: 'Préréglages', delayMode: 'Mode de Délai', fixed: 'Fixe', random: 'Aléatoire', betweenActions: 'Délai Entre Actions', perAction: 'Délai Par Action', postWriter: 'Délais du Rédacteur', warmup: "Délai d'Échauffement", humanSimulation: 'Simulation Humaine', safetyCritical: 'CRITIQUE DE SÉCURITÉ', liveActivity: "Chronologie d'Activité en Direct" },
  historyTab: { generationHistory: 'Historique de Génération', noHistory: 'Aucun historique trouvé' },
  analyticsTab: { engagementMetrics: "Métriques d'Engagement", automationHistory: "Historique d'Automatisation", networkingSessions: 'Sessions de Réseautage', importActivities: "Activités d'Importation" },
  referralsTab: { referralProgram: 'Programme de Parrainage', yourReferralLink: 'Votre Lien de Parrainage', copyLink: 'Copier le Lien', totalReferrals: 'Total des Parrainages', paidReferrals: 'Parrainages Payants', totalEarnings: 'Gains Totaux', commissionRate: 'Taux de Commission', minPayout: 'Paiement Minimum', requestPayout: 'Demander le Paiement' },
  usageTab: { dailyUsage: 'Utilisation Quotidienne', planLimits: 'Limites du Plan', used: 'Utilisé', limit: 'Limite', remaining: 'Restant' },
  languages: { en: 'English', ur: 'اردو (Urdu)', ar: 'العربية (Arabic)', es: 'Español (Spanish)', fr: 'Français (French)', de: 'Deutsch (German)', hi: 'हिन्दी (Hindi)', pt: 'Português (Portuguese)', zh: '中文 (Chinese)', tr: 'Türkçe (Turkish)', ja: '日本語 (Japanese)', ko: '한국어 (Korean)', it: 'Italiano (Italian)', ru: 'Русский (Russian)' },
};
export default fr;

```

---

### i18n\locales\hi.ts

```typescript
const hi = {
  sidebar: { dashboard: 'डैशबोर्ड', posts: 'पोस्ट', comments: 'टिप्पणियाँ', management: 'प्रबंधन', account: 'खाता', settings: 'सेटिंग्स' },
  nav: { overview: 'अवलोकन', viralPostsWriter: 'वायरल पोस्ट राइटर', personalizedPostWriter: 'व्यक्तिगत पोस्ट राइटर', autoCommenter: 'ऑटो कमेंटर', commentsSettings: 'टिप्पणी सेटिंग्स', importProfiles: 'प्रोफाइल आयात करें', limitsDelays: 'सीमाएँ और विलंब', tasks: 'कार्य', activityLogs: 'गतिविधि लॉग', history: 'इतिहास', analytics: 'विश्लेषण', usageLimits: 'उपयोग और सीमाएँ', referrals: 'रेफरल', extension: 'एक्सटेंशन', account: 'खाता', billing: 'बिलिंग' },
  headers: { overview: 'अवलोकन', writer: 'व्यक्तिगत पोस्ट राइटर', comments: 'टिप्पणी सेटिंग्स', 'trending-posts': 'वायरल पोस्ट राइटर', tasks: 'कार्य', history: 'इतिहास', limits: 'सीमाएँ और विलंब', commenter: 'ऑटो कमेंटर', import: 'प्रोफाइल आयात करें', analytics: 'विश्लेषण', usage: 'उपयोग और सीमाएँ', referrals: 'रेफरल कार्यक्रम', extension: 'क्रोम एक्सटेंशन', account: 'खाता सेटिंग्स', activity: 'गतिविधि लॉग' },
  descriptions: { overview: 'आपकी LinkedIn ऑटोमेशन की स्थिति', writer: 'अपनी अनूठी आवाज़ और शैली से मेल खाते AI पोस्ट बनाएँ', 'trending-posts': 'LinkedIn पर सबसे अच्छा प्रदर्शन करने वाली सामग्री से प्रेरित वायरल पोस्ट बनाएँ', comments: 'AI टिप्पणी शैली, स्वर, लक्ष्य और आवाज प्रोफाइल कॉन्फ़िगर करें', tasks: 'एक्सटेंशन कार्य देखें और प्रबंधित करें', history: 'अपना निर्माण और प्रकाशन इतिहास देखें', limits: 'LinkedIn-सुरक्षित ऑटोमेशन सीमाएँ और समय नियंत्रण', commenter: 'AI-संचालित बल्क टिप्पणी और स्वचालित जुड़ाव', import: 'स्वचालित जुड़ाव के लिए LinkedIn प्रोफाइल आयात करें', analytics: 'जुड़ाव मेट्रिक्स, ऑटोमेशन इतिहास, नेटवर्किंग सत्र और आयात गतिविधियाँ ट्रैक करें', usage: 'अपने दैनिक उपयोग और योजना सीमाओं की निगरानी करें', referrals: 'हर भुगतान किए गए रेफरल पर 30% कमीशन कमाएँ', extension: 'शुरू करने के लिए क्रोम एक्सटेंशन इंस्टॉल करें', account: 'अपनी खाता सेटिंग्स और भाषा प्राथमिकताएँ प्रबंधित करें', activity: 'आपके एक्सटेंशन से रीयल-टाइम गतिविधि लॉग' },
  accountTab: { fullName: 'पूरा नाम', emailAddress: 'ईमेल पता', currentPlan: 'वर्तमान योजना', memberSince: 'सदस्य तब से', changePlan: 'योजना बदलें', language: 'डैशबोर्ड भाषा', selectLanguage: 'अपनी पसंदीदा भाषा चुनें', languageChanged: 'भाषा सफलतापूर्वक बदल दी गई', na: 'उपलब्ध नहीं' },
  overviewTab: { currentPlan: 'वर्तमान योजना', activePlan: 'सक्रिय योजना', referralEarnings: 'रेफरल आय', paidUsers: 'भुगतान करने वाले उपयोगकर्ता', totalReferrals: 'कुल रेफरल', usersJoined: 'उपयोगकर्ता शामिल हुए', memberSince: 'सदस्य तब से', todaysUsage: 'आज का उपयोग', likes: 'लाइक्स', aiPosts: 'AI पोस्ट', aiComments: 'AI टिप्पणियाँ', follows: 'फॉलो', getChromeExtension: 'क्रोम एक्सटेंशन प्राप्त करें', installExtension: 'ऑटोमेशन शुरू करने के लिए एक्सटेंशन इंस्टॉल करें', inviteFriends: 'दोस्तों को आमंत्रित करें', earnCommission: 'हर भुगतान किए गए रेफरल पर 30% कमीशन कमाएँ' },
  extensionStatus: { connected: 'एक्सटेंशन कनेक्टेड', offline: 'एक्सटेंशन ऑफलाइन', lastSeen: 'अंतिम बार देखा गया', retry: 'पुनः प्रयास', getExtension: 'एक्सटेंशन प्राप्त करें' },
  theme: { current: 'वर्तमान', light: 'हल्का', dark: 'गहरा' },
  common: { loading: 'आपका डैशबोर्ड लोड हो रहा है...', loggingOut: 'लॉग आउट हो रहा है...', logout: 'लॉग आउट', save: 'सहेजें', cancel: 'रद्द करें', delete: 'हटाएँ', edit: 'संपादित करें', search: 'खोजें', close: 'बंद करें', copy: 'कॉपी', copied: 'कॉपी हो गया!', generate: 'बनाएँ', generating: 'बन रहा है...', post: 'पोस्ट', schedule: 'शेड्यूल', preview: 'पूर्वावलोकन', refresh: 'रीफ्रेश', noData: 'कोई डेटा उपलब्ध नहीं', confirm: 'पुष्टि करें', back: 'वापस', next: 'अगला', free: 'मुफ़्त', active: 'सक्रिय', inactive: 'निष्क्रिय', enabled: 'सक्षम', disabled: 'अक्षम', success: 'सफल', error: 'त्रुटि', warning: 'चेतावनी', info: 'जानकारी', pending: 'लंबित', inProgress: 'प्रगति में', completed: 'पूर्ण', failed: 'विफल', today: 'आज', yesterday: 'कल', ago: 'पहले', sAgo: 'सेकंड पहले', mAgo: 'मिनट पहले', hAgo: 'घंटे पहले', dAgo: 'दिन पहले' },
  writerTab: { topic: 'विषय', topicPlaceholder: 'अपनी LinkedIn पोस्ट के लिए विषय दर्ज करें...', template: 'टेम्पलेट', tone: 'स्वर', length: 'लंबाई', hashtags: 'हैशटैग शामिल करें', emojis: 'इमोजी शामिल करें', language: 'भाषा', targetAudience: 'लक्षित दर्शक', keyMessage: 'मुख्य संदेश', background: 'पृष्ठभूमि', model: 'AI मॉडल', advanced: 'उन्नत विकल्प', generatePost: 'पोस्ट बनाएँ', generatingPost: 'बन रही है...', inspirationSources: 'जोड़े गए स्रोत', noSources: 'कोई स्रोत नहीं — लेखन शैली की नकल करने के लिए प्रोफाइल जोड़ें', scanProfile: 'प्रोफाइल स्कैन करें', useInAI: 'AI में उपयोग करें', topics: 'विषय', data: 'डेटा', scheduledPosts: 'शेड्यूल्ड पोस्ट', drafts: 'ड्राफ्ट', saveDraft: 'ड्राफ्ट सहेजें', postToLinkedIn: 'LinkedIn पर पोस्ट करें', schedulePost: 'पोस्ट शेड्यूल करें', copyToClipboard: 'क्लिपबोर्ड पर कॉपी करें' },
  trendingTab: { savedPosts: 'सहेजी गई पोस्ट', sharedPosts: 'साझा की गई पोस्ट', feedSchedule: 'फीड शेड्यूल', generateFromTrending: 'ट्रेंडिंग से बनाएँ', period: 'अवधि', all: 'सभी समय', selectPosts: 'पोस्ट चुनें', customPrompt: 'कस्टम प्रॉम्प्ट', includeHashtags: 'हैशटैग शामिल करें', language: 'भाषा', model: 'AI मॉडल', generate: 'बनाएँ', preview: 'बनाई गई पूर्वावलोकन', noSavedPosts: 'अभी तक कोई सहेजी गई पोस्ट नहीं', noPosts: 'कोई पोस्ट नहीं मिली' },
  commentsTab: { commentStyle: 'टिप्पणी शैली', voiceProfiles: 'आवाज प्रोफाइल', sharedProfiles: 'साझा प्रोफाइल', commentSettings: 'टिप्पणी सेटिंग्स', addProfile: 'प्रोफाइल जोड़ें', tone: 'स्वर', goal: 'लक्ष्य', style: 'शैली' },
  commenterTab: { autoCommenter: 'ऑटो कमेंटर', bulkComment: 'बल्क टिप्पणी', configuration: 'कॉन्फ़िगरेशन', startCommenting: 'टिप्पणी शुरू करें', stopCommenting: 'टिप्पणी रोकें' },
  importTab: { importProfiles: 'प्रोफाइल आयात करें', configuration: 'कॉन्फ़िगरेशन', startImport: 'आयात शुरू करें', stopImport: 'आयात रोकें' },
  tasksTab: { viewTasks: 'कार्य देखें', stopAll: 'सभी कार्य रोकें', noTasks: 'कोई कार्य नहीं मिले', taskStatus: 'कार्य स्थिति' },
  limitsTab: { presets: 'प्रीसेट', delayMode: 'विलंब मोड', fixed: 'स्थिर', random: 'यादृच्छिक', betweenActions: 'क्रियाओं के बीच विलंब', perAction: 'प्रति क्रिया विलंब', postWriter: 'पोस्ट राइटर विलंब', warmup: 'वार्म-अप विलंब', humanSimulation: 'मानव अनुकरण', safetyCritical: 'सुरक्षा महत्वपूर्ण', liveActivity: 'लाइव गतिविधि टाइमलाइन' },
  historyTab: { generationHistory: 'निर्माण इतिहास', noHistory: 'कोई इतिहास नहीं मिला' },
  analyticsTab: { engagementMetrics: 'जुड़ाव मेट्रिक्स', automationHistory: 'ऑटोमेशन इतिहास', networkingSessions: 'नेटवर्किंग सत्र', importActivities: 'आयात गतिविधियाँ' },
  referralsTab: { referralProgram: 'रेफरल कार्यक्रम', yourReferralLink: 'आपका रेफरल लिंक', copyLink: 'लिंक कॉपी करें', totalReferrals: 'कुल रेफरल', paidReferrals: 'भुगतान किए गए रेफरल', totalEarnings: 'कुल आय', commissionRate: 'कमीशन दर', minPayout: 'न्यूनतम भुगतान', requestPayout: 'भुगतान का अनुरोध करें' },
  usageTab: { dailyUsage: 'दैनिक उपयोग', planLimits: 'योजना सीमाएँ', used: 'उपयोग किया', limit: 'सीमा', remaining: 'शेष' },
  languages: { en: 'English', ur: 'اردو (Urdu)', ar: 'العربية (Arabic)', es: 'Español (Spanish)', fr: 'Français (French)', de: 'Deutsch (German)', hi: 'हिन्दी (Hindi)', pt: 'Português (Portuguese)', zh: '中文 (Chinese)', tr: 'Türkçe (Turkish)', ja: '日本語 (Japanese)', ko: '한국어 (Korean)', it: 'Italiano (Italian)', ru: 'Русский (Russian)' },
};
export default hi;

```

---

### i18n\locales\pt.ts

```typescript
const pt = {
  sidebar: { dashboard: 'Painel', posts: 'Publicações', comments: 'Comentários', management: 'Gestão', account: 'Conta', settings: 'Configurações' },
  nav: { overview: 'Visão Geral', viralPostsWriter: 'Escritor de Posts Virais', personalizedPostWriter: 'Escritor de Posts Personalizados', autoCommenter: 'Comentador Automático', commentsSettings: 'Configurações de Comentários', importProfiles: 'Importar Perfis', limitsDelays: 'Limites e Atrasos', tasks: 'Tarefas', activityLogs: 'Registros de Atividade', history: 'Histórico', analytics: 'Análises', usageLimits: 'Uso e Limites', referrals: 'Indicações', extension: 'Extensão', account: 'Conta', billing: 'Faturamento' },
  headers: { overview: 'Visão Geral', writer: 'Escritor de Posts Personalizados', comments: 'Configurações de Comentários', 'trending-posts': 'Escritor de Posts Virais', tasks: 'Tarefas', history: 'Histórico', limits: 'Limites e Atrasos', commenter: 'Comentador Automático', import: 'Importar Perfis', analytics: 'Análises', usage: 'Uso e Limites', referrals: 'Programa de Indicações', extension: 'Extensão Chrome', account: 'Configurações da Conta', activity: 'Registros de Atividade' },
  descriptions: { overview: 'Veja o que está acontecendo com sua automação do LinkedIn', writer: 'Crie posts AI personalizados que combinem com sua voz e estilo únicos', 'trending-posts': 'Gere posts virais inspirados no conteúdo mais bem-sucedido do LinkedIn', comments: 'Configure estilo, tom, objetivo e perfis de voz de comentários AI', tasks: 'Visualizar e gerenciar tarefas da extensão', history: 'Navegue pelo histórico de geração e publicação', limits: 'Limites de automação seguros para LinkedIn e controles de tempo', commenter: 'Comentários em massa por AI e engajamento automatizado', import: 'Importe perfis do LinkedIn para engajamento automatizado', analytics: 'Acompanhe métricas de engajamento, histórico de automação, sessões de networking e atividades de importação', usage: 'Monitore seu uso diário e limites do plano', referrals: 'Ganhe 30% de comissão em cada indicação paga', extension: 'Instale a extensão Chrome para começar', account: 'Gerencie as configurações da sua conta e preferências de idioma', activity: 'Registros de atividade em tempo real da sua extensão' },
  accountTab: { fullName: 'Nome Completo', emailAddress: 'Endereço de E-mail', currentPlan: 'Plano Atual', memberSince: 'Membro Desde', changePlan: 'Alterar Plano', language: 'Idioma do Painel', selectLanguage: 'Selecione seu idioma preferido', languageChanged: 'Idioma alterado com sucesso', na: 'N/D' },
  overviewTab: { currentPlan: 'Plano Atual', activePlan: 'Plano Ativo', referralEarnings: 'Ganhos de Indicação', paidUsers: 'usuários pagos', totalReferrals: 'Total de Indicações', usersJoined: 'usuários inscritos', memberSince: 'Membro Desde', todaysUsage: 'Uso de Hoje', likes: 'Curtidas', aiPosts: 'Posts AI', aiComments: 'Comentários AI', follows: 'Seguindo', getChromeExtension: 'Obter Extensão Chrome', installExtension: 'Instale nossa extensão para começar a automatizar', inviteFriends: 'Convidar Amigos', earnCommission: 'Ganhe 30% de comissão em cada indicação paga' },
  extensionStatus: { connected: 'Extensão Conectada', offline: 'Extensão Offline', lastSeen: 'visto por último', retry: 'Tentar Novamente', getExtension: 'Obter Extensão' },
  theme: { current: 'Atual', light: 'Claro', dark: 'Escuro' },
  common: { loading: 'Carregando seu painel...', loggingOut: 'Saindo...', logout: 'Sair', save: 'Salvar', cancel: 'Cancelar', delete: 'Excluir', edit: 'Editar', search: 'Pesquisar', close: 'Fechar', copy: 'Copiar', copied: 'Copiado!', generate: 'Gerar', generating: 'Gerando...', post: 'Publicar', schedule: 'Agendar', preview: 'Visualizar', refresh: 'Atualizar', noData: 'Nenhum dado disponível', confirm: 'Confirmar', back: 'Voltar', next: 'Próximo', free: 'Gratuito', active: 'Ativo', inactive: 'Inativo', enabled: 'Habilitado', disabled: 'Desabilitado', success: 'Sucesso', error: 'Erro', warning: 'Aviso', info: 'Info', pending: 'Pendente', inProgress: 'Em Progresso', completed: 'Concluído', failed: 'Falhou', today: 'Hoje', yesterday: 'Ontem', ago: 'atrás', sAgo: 's atrás', mAgo: 'min atrás', hAgo: 'h atrás', dAgo: 'd atrás' },
  writerTab: { topic: 'Tópico', topicPlaceholder: 'Digite um tópico para sua publicação no LinkedIn...', template: 'Modelo', tone: 'Tom', length: 'Comprimento', hashtags: 'Incluir Hashtags', emojis: 'Incluir Emojis', language: 'Idioma', targetAudience: 'Público-Alvo', keyMessage: 'Mensagem Principal', background: 'Contexto', model: 'Modelo AI', advanced: 'Opções Avançadas', generatePost: 'Gerar Post', generatingPost: 'Gerando...', inspirationSources: 'Fontes Adicionadas', noSources: 'Sem fontes — adicione perfis para imitar estilo de escrita', scanProfile: 'Escanear Perfil', useInAI: 'Usar em AI', topics: 'Tópicos', data: 'Dados', scheduledPosts: 'Posts Agendados', drafts: 'Rascunhos', saveDraft: 'Salvar Rascunho', postToLinkedIn: 'Publicar no LinkedIn', schedulePost: 'Agendar Post', copyToClipboard: 'Copiar para Área de Transferência' },
  trendingTab: { savedPosts: 'Posts Salvos', sharedPosts: 'Posts Compartilhados', feedSchedule: 'Agenda do Feed', generateFromTrending: 'Gerar dos Trending', period: 'Período', all: 'Todo o Tempo', selectPosts: 'Selecionar Posts', customPrompt: 'Prompt Personalizado', includeHashtags: 'Incluir Hashtags', language: 'Idioma', model: 'Modelo AI', generate: 'Gerar', preview: 'Visualização Gerada', noSavedPosts: 'Nenhum post salvo ainda', noPosts: 'Nenhum post encontrado' },
  commentsTab: { commentStyle: 'Estilo de Comentário', voiceProfiles: 'Perfis de Voz', sharedProfiles: 'Perfis Compartilhados', commentSettings: 'Configurações de Comentários', addProfile: 'Adicionar Perfil', tone: 'Tom', goal: 'Objetivo', style: 'Estilo' },
  commenterTab: { autoCommenter: 'Comentador Automático', bulkComment: 'Comentário em Massa', configuration: 'Configuração', startCommenting: 'Iniciar Comentários', stopCommenting: 'Parar Comentários' },
  importTab: { importProfiles: 'Importar Perfis', configuration: 'Configuração', startImport: 'Iniciar Importação', stopImport: 'Parar Importação' },
  tasksTab: { viewTasks: 'Ver Tarefas', stopAll: 'Parar Todas as Tarefas', noTasks: 'Nenhuma tarefa encontrada', taskStatus: 'Status da Tarefa' },
  limitsTab: { presets: 'Predefinições', delayMode: 'Modo de Atraso', fixed: 'Fixo', random: 'Aleatório', betweenActions: 'Atraso Entre Ações', perAction: 'Atraso Por Ação', postWriter: 'Atrasos do Escritor', warmup: 'Atraso de Aquecimento', humanSimulation: 'Simulação Humana', safetyCritical: 'CRÍTICO DE SEGURANÇA', liveActivity: 'Linha do Tempo de Atividade' },
  historyTab: { generationHistory: 'Histórico de Geração', noHistory: 'Nenhum histórico encontrado' },
  analyticsTab: { engagementMetrics: 'Métricas de Engajamento', automationHistory: 'Histórico de Automação', networkingSessions: 'Sessões de Networking', importActivities: 'Atividades de Importação' },
  referralsTab: { referralProgram: 'Programa de Indicações', yourReferralLink: 'Seu Link de Indicação', copyLink: 'Copiar Link', totalReferrals: 'Total de Indicações', paidReferrals: 'Indicações Pagas', totalEarnings: 'Ganhos Totais', commissionRate: 'Taxa de Comissão', minPayout: 'Pagamento Mínimo', requestPayout: 'Solicitar Pagamento' },
  usageTab: { dailyUsage: 'Uso Diário', planLimits: 'Limites do Plano', used: 'Usado', limit: 'Limite', remaining: 'Restante' },
  languages: { en: 'English', ur: 'اردو (Urdu)', ar: 'العربية (Arabic)', es: 'Español (Spanish)', fr: 'Français (French)', de: 'Deutsch (German)', hi: 'हिन्दी (Hindi)', pt: 'Português (Portuguese)', zh: '中文 (Chinese)', tr: 'Türkçe (Turkish)', ja: '日本語 (Japanese)', ko: '한국어 (Korean)', it: 'Italiano (Italian)', ru: 'Русский (Russian)' },
};
export default pt;

```

---

### i18n\locales\tr.ts

```typescript
const tr = {
  sidebar: { dashboard: 'Kontrol Paneli', posts: 'Gönderiler', comments: 'Yorumlar', management: 'Yönetim', account: 'Hesap', settings: 'Ayarlar' },
  nav: { overview: 'Genel Bakış', viralPostsWriter: 'Viral Gönderi Yazarı', personalizedPostWriter: 'Kişisel Gönderi Yazarı', autoCommenter: 'Otomatik Yorumcu', commentsSettings: 'Yorum Ayarları', importProfiles: 'Profil İçe Aktar', limitsDelays: 'Limitler ve Gecikmeler', tasks: 'Görevler', activityLogs: 'Aktivite Kayıtları', history: 'Geçmiş', analytics: 'Analizler', usageLimits: 'Kullanım ve Limitler', referrals: 'Referanslar', extension: 'Eklenti', account: 'Hesap', billing: 'Faturalandırma' },
  headers: { overview: 'Genel Bakış', writer: 'Kişisel Gönderi Yazarı', comments: 'Yorum Ayarları', 'trending-posts': 'Viral Gönderi Yazarı', tasks: 'Görevler', history: 'Geçmiş', limits: 'Limitler ve Gecikmeler', commenter: 'Otomatik Yorumcu', import: 'Profil İçe Aktar', analytics: 'Analizler', usage: 'Kullanım ve Limitler', referrals: 'Referans Programı', extension: 'Chrome Eklentisi', account: 'Hesap Ayarları', activity: 'Aktivite Kayıtları' },
  descriptions: { overview: 'LinkedIn otomasyonunuzla ilgili neler oluyor', writer: 'Benzersiz sesinize ve tarzınıza uyan kişiselleştirilmiş AI gönderileri oluşturun', 'trending-posts': 'LinkedIn\'in en başarılı içeriklerinden ilham alan viral gönderiler oluşturun', comments: 'AI yorum stili, ton, hedef ve ses profillerini yapılandırın', tasks: 'Eklenti görevlerini görüntüleyin ve yönetin', history: 'Oluşturma ve yayınlama geçmişinizi inceleyin', limits: 'LinkedIn güvenli otomasyon limitleri ve zamanlama kontrolleri', commenter: 'AI destekli toplu yorum ve otomatik etkileşim', import: 'Otomatik etkileşim için LinkedIn profillerini içe aktarın', analytics: 'Etkileşim metriklerini, otomasyon geçmişini, ağ oluşturma oturumlarını ve içe aktarma faaliyetlerini izleyin', usage: 'Günlük kullanımınızı ve plan limitlerinizi izleyin', referrals: 'Her ücretli referansta %30 komisyon kazanın', extension: 'Başlamak için Chrome eklentisini yükleyin', account: 'Hesap ayarlarınızı ve dil tercihlerinizi yönetin', activity: 'Eklentinizden gerçek zamanlı aktivite kayıtları' },
  accountTab: { fullName: 'Ad Soyad', emailAddress: 'E-posta Adresi', currentPlan: 'Mevcut Plan', memberSince: 'Üyelik Tarihi', changePlan: 'Plan Değiştir', language: 'Panel Dili', selectLanguage: 'Tercih ettiğiniz dili seçin', languageChanged: 'Dil başarıyla değiştirildi', na: 'Mevcut Değil' },
  overviewTab: { currentPlan: 'Mevcut Plan', activePlan: 'Aktif Plan', referralEarnings: 'Referans Kazançları', paidUsers: 'ücretli kullanıcı', totalReferrals: 'Toplam Referanslar', usersJoined: 'kullanıcı katıldı', memberSince: 'Üyelik Tarihi', todaysUsage: 'Bugünkü Kullanım', likes: 'Beğeniler', aiPosts: 'AI Gönderileri', aiComments: 'AI Yorumları', follows: 'Takipler', getChromeExtension: 'Chrome Eklentisini Al', installExtension: 'Otomasyona başlamak için eklentimizi yükleyin', inviteFriends: 'Arkadaşları Davet Et', earnCommission: 'Her ücretli referansta %30 komisyon kazanın' },
  extensionStatus: { connected: 'Eklenti Bağlı', offline: 'Eklenti Çevrimdışı', lastSeen: 'son görülme', retry: 'Tekrar Dene', getExtension: 'Eklentiyi Al' },
  theme: { current: 'Mevcut', light: 'Açık', dark: 'Koyu' },
  common: { loading: 'Paneliniz yükleniyor...', loggingOut: 'Çıkış yapılıyor...', logout: 'Çıkış Yap', save: 'Kaydet', cancel: 'İptal', delete: 'Sil', edit: 'Düzenle', search: 'Ara', close: 'Kapat', copy: 'Kopyala', copied: 'Kopyalandı!', generate: 'Oluştur', generating: 'Oluşturuluyor...', post: 'Gönder', schedule: 'Planla', preview: 'Önizleme', refresh: 'Yenile', noData: 'Veri bulunamadı', confirm: 'Onayla', back: 'Geri', next: 'İleri', free: 'Ücretsiz', active: 'Aktif', inactive: 'Pasif', enabled: 'Etkin', disabled: 'Devre Dışı', success: 'Başarılı', error: 'Hata', warning: 'Uyarı', info: 'Bilgi', pending: 'Beklemede', inProgress: 'Devam Ediyor', completed: 'Tamamlandı', failed: 'Başarısız', today: 'Bugün', yesterday: 'Dün', ago: 'önce', sAgo: 'sn önce', mAgo: 'dk önce', hAgo: 'sa önce', dAgo: 'gn önce' },
  writerTab: { topic: 'Konu', topicPlaceholder: 'LinkedIn gönderiniz için bir konu girin...', template: 'Şablon', tone: 'Ton', length: 'Uzunluk', hashtags: 'Hashtag Ekle', emojis: 'Emoji Ekle', language: 'Dil', targetAudience: 'Hedef Kitle', keyMessage: 'Ana Mesaj', background: 'Arka Plan', model: 'AI Modeli', advanced: 'Gelişmiş Seçenekler', generatePost: 'Gönderi Oluştur', generatingPost: 'Oluşturuluyor...', inspirationSources: 'Eklenen Kaynaklar', noSources: 'Kaynak yok — yazı stilini taklit etmek için profil ekleyin', scanProfile: 'Profil Tara', useInAI: 'AI\'da Kullan', topics: 'Konular', data: 'Veri', scheduledPosts: 'Planlanan Gönderiler', drafts: 'Taslaklar', saveDraft: 'Taslak Kaydet', postToLinkedIn: 'LinkedIn\'e Gönder', schedulePost: 'Gönderi Planla', copyToClipboard: 'Panoya Kopyala' },
  trendingTab: { savedPosts: 'Kaydedilen Gönderiler', sharedPosts: 'Paylaşılan Gönderiler', feedSchedule: 'Akış Planı', generateFromTrending: 'Trendlerden Oluştur', period: 'Dönem', all: 'Tüm Zamanlar', selectPosts: 'Gönderi Seç', customPrompt: 'Özel İstem', includeHashtags: 'Hashtag Ekle', language: 'Dil', model: 'AI Modeli', generate: 'Oluştur', preview: 'Oluşturulan Önizleme', noSavedPosts: 'Henüz kayıtlı gönderi yok', noPosts: 'Gönderi bulunamadı' },
  commentsTab: { commentStyle: 'Yorum Stili', voiceProfiles: 'Ses Profilleri', sharedProfiles: 'Paylaşılan Profiller', commentSettings: 'Yorum Ayarları', addProfile: 'Profil Ekle', tone: 'Ton', goal: 'Hedef', style: 'Stil' },
  commenterTab: { autoCommenter: 'Otomatik Yorumcu', bulkComment: 'Toplu Yorum', configuration: 'Yapılandırma', startCommenting: 'Yorum Başlat', stopCommenting: 'Yorum Durdur' },
  importTab: { importProfiles: 'Profil İçe Aktar', configuration: 'Yapılandırma', startImport: 'İçe Aktarmayı Başlat', stopImport: 'İçe Aktarmayı Durdur' },
  tasksTab: { viewTasks: 'Görevleri Görüntüle', stopAll: 'Tüm Görevleri Durdur', noTasks: 'Görev bulunamadı', taskStatus: 'Görev Durumu' },
  limitsTab: { presets: 'Ön Ayarlar', delayMode: 'Gecikme Modu', fixed: 'Sabit', random: 'Rastgele', betweenActions: 'Eylemler Arası Gecikme', perAction: 'Eylem Başına Gecikme', postWriter: 'Yazar Gecikmeleri', warmup: 'Isınma Gecikmesi', humanSimulation: 'İnsan Simülasyonu', safetyCritical: 'GÜVENLİK KRİTİK', liveActivity: 'Canlı Aktivite Zaman Çizelgesi' },
  historyTab: { generationHistory: 'Oluşturma Geçmişi', noHistory: 'Geçmiş bulunamadı' },
  analyticsTab: { engagementMetrics: 'Etkileşim Metrikleri', automationHistory: 'Otomasyon Geçmişi', networkingSessions: 'Ağ Oluşturma Oturumları', importActivities: 'İçe Aktarma Faaliyetleri' },
  referralsTab: { referralProgram: 'Referans Programı', yourReferralLink: 'Referans Linkiniz', copyLink: 'Linki Kopyala', totalReferrals: 'Toplam Referanslar', paidReferrals: 'Ücretli Referanslar', totalEarnings: 'Toplam Kazanç', commissionRate: 'Komisyon Oranı', minPayout: 'Minimum Ödeme', requestPayout: 'Ödeme Talep Et' },
  usageTab: { dailyUsage: 'Günlük Kullanım', planLimits: 'Plan Limitleri', used: 'Kullanılan', limit: 'Limit', remaining: 'Kalan' },
  languages: { en: 'English', ur: 'اردو (Urdu)', ar: 'العربية (Arabic)', es: 'Español (Spanish)', fr: 'Français (French)', de: 'Deutsch (German)', hi: 'हिन्दी (Hindi)', pt: 'Português (Portuguese)', zh: '中文 (Chinese)', tr: 'Türkçe (Turkish)', ja: '日本語 (Japanese)', ko: '한국어 (Korean)', it: 'Italiano (Italian)', ru: 'Русский (Russian)' },
};
export default tr;

```

---

### i18n\locales\ur.ts

```typescript
const ur = {
  sidebar: {
    dashboard: 'ڈیش بورڈ',
    posts: 'پوسٹس',
    comments: 'تبصرے',
    management: 'انتظام',
    account: 'اکاؤنٹ',
    settings: 'ترتیبات',
  },
  nav: {
    overview: 'جائزہ',
    viralPostsWriter: 'وائرل پوسٹ رائٹر',
    personalizedPostWriter: 'ذاتی پوسٹ رائٹر',
    autoCommenter: 'آٹو کمنٹر',
    commentsSettings: 'تبصرے کی ترتیبات',
    importProfiles: 'پروفائلز درآمد کریں',
    limitsDelays: 'حدود اور تاخیر',
    tasks: 'ٹاسکس',
    activityLogs: 'سرگرمی لاگز',
    history: 'تاریخ',
    analytics: 'تجزیات',
    usageLimits: 'استعمال اور حدود',
    referrals: 'ریفرلز',
    extension: 'ایکسٹینشن',
    account: 'اکاؤنٹ',
    billing: 'بلنگ',
  },
  headers: {
    overview: 'جائزہ',
    writer: 'ذاتی پوسٹ رائٹر',
    comments: 'تبصرے کی ترتیبات',
    'trending-posts': 'وائرل پوسٹ رائٹر',
    tasks: 'ٹاسکس',
    history: 'تاریخ',
    limits: 'حدود اور تاخیر',
    commenter: 'آٹو کمنٹر',
    import: 'پروفائلز درآمد کریں',
    analytics: 'تجزیات',
    usage: 'استعمال اور حدود',
    referrals: 'ریفرل پروگرام',
    extension: 'کروم ایکسٹینشن',
    account: 'اکاؤنٹ کی ترتیبات',
    activity: 'سرگرمی لاگز',
  },
  descriptions: {
    overview: 'آپ کی لنکڈان آٹومیشن کا جائزہ',
    writer: 'اپنی منفرد آواز اور انداز سے مماثل AI پوسٹس بنائیں',
    'trending-posts': 'سب سے زیادہ مقبول لنکڈان مواد سے متاثر وائرل پوسٹس بنائیں',
    comments: 'AI تبصرے کا انداز، لہجہ، مقصد اور آواز پروفائلز ترتیب دیں',
    tasks: 'ایکسٹینشن ٹاسکس دیکھیں اور منظم کریں',
    history: 'اپنی تخلیق اور اشاعت کی تاریخ دیکھیں',
    limits: 'لنکڈان محفوظ آٹومیشن حدود اور وقت کے کنٹرولز',
    commenter: 'AI سے چلنے والی بلک تبصرہ نگاری اور خودکار مصروفیت',
    import: 'خودکار مصروفیت کے لیے لنکڈان پروفائلز درآمد کریں',
    analytics: 'مصروفیت کے میٹرکس، آٹومیشن تاریخ، نیٹ ورکنگ سیشنز اور درآمد سرگرمیاں ٹریک کریں',
    usage: 'اپنے یومیہ استعمال اور پلان کی حدود مانیٹر کریں',
    referrals: 'ہر ادا شدہ ریفرل پر 30% کمیشن کمائیں',
    extension: 'شروع کرنے کے لیے کروم ایکسٹینشن انسٹال کریں',
    account: 'اپنے اکاؤنٹ کی ترتیبات اور زبان کی ترجیحات منظم کریں',
    activity: 'آپ کی ایکسٹینشن سے ریئل ٹائم سرگرمی لاگز',
  },
  accountTab: {
    fullName: 'پورا نام',
    emailAddress: 'ای میل ایڈریس',
    currentPlan: 'موجودہ پلان',
    memberSince: 'رکنیت کی تاریخ',
    changePlan: 'پلان تبدیل کریں',
    language: 'ڈیش بورڈ کی زبان',
    selectLanguage: 'اپنی پسندیدہ زبان منتخب کریں',
    languageChanged: 'زبان کامیابی سے تبدیل ہو گئی',
    na: 'دستیاب نہیں',
  },
  overviewTab: {
    currentPlan: 'موجودہ پلان',
    activePlan: 'فعال پلان',
    referralEarnings: 'ریفرل کی آمدنی',
    paidUsers: 'ادا شدہ صارفین',
    totalReferrals: 'کل ریفرلز',
    usersJoined: 'صارفین شامل ہوئے',
    memberSince: 'رکنیت کی تاریخ',
    todaysUsage: 'آج کا استعمال',
    likes: 'لائکس',
    aiPosts: 'AI پوسٹس',
    aiComments: 'AI تبصرے',
    follows: 'فالوز',
    getChromeExtension: 'کروم ایکسٹینشن حاصل کریں',
    installExtension: 'آٹومیشن شروع کرنے کے لیے ایکسٹینشن انسٹال کریں',
    inviteFriends: 'دوستوں کو مدعو کریں',
    earnCommission: 'ہر ادا شدہ ریفرل پر 30% کمیشن کمائیں',
  },
  extensionStatus: {
    connected: 'ایکسٹینشن منسلک ہے',
    offline: 'ایکسٹینشن آف لائن',
    lastSeen: 'آخری بار دیکھا گیا',
    retry: 'دوبارہ کوشش',
    getExtension: 'ایکسٹینشن حاصل کریں',
  },
  theme: {
    current: 'موجودہ',
    light: 'ہلکا',
    dark: 'گہرا',
  },
  common: {
    loading: 'آپ کا ڈیش بورڈ لوڈ ہو رہا ہے...',
    loggingOut: 'لاگ آؤٹ ہو رہا ہے...',
    logout: 'لاگ آؤٹ',
    save: 'محفوظ کریں',
    cancel: 'منسوخ',
    delete: 'حذف کریں',
    edit: 'ترمیم',
    search: 'تلاش',
    close: 'بند کریں',
    copy: 'کاپی',
    copied: 'کاپی ہو گیا!',
    generate: 'تخلیق کریں',
    generating: 'تخلیق ہو رہی ہے...',
    post: 'پوسٹ',
    schedule: 'شیڈول',
    preview: 'پیش نظارہ',
    refresh: 'ریفریش',
    noData: 'کوئی ڈیٹا دستیاب نہیں',
    confirm: 'تصدیق',
    back: 'واپس',
    next: 'اگلا',
    free: 'مفت',
    active: 'فعال',
    inactive: 'غیر فعال',
    enabled: 'فعال',
    disabled: 'غیر فعال',
    success: 'کامیاب',
    error: 'خرابی',
    warning: 'انتباہ',
    info: 'معلومات',
    pending: 'زیر التوا',
    inProgress: 'جاری ہے',
    completed: 'مکمل',
    failed: 'ناکام',
    today: 'آج',
    yesterday: 'کل',
    ago: 'پہلے',
    sAgo: 'سیکنڈ پہلے',
    mAgo: 'منٹ پہلے',
    hAgo: 'گھنٹے پہلے',
    dAgo: 'دن پہلے',
  },
  writerTab: {
    topic: 'موضوع',
    topicPlaceholder: 'اپنی لنکڈان پوسٹ کے لیے موضوع درج کریں...',
    template: 'ٹیمپلیٹ',
    tone: 'لہجہ',
    length: 'لمبائی',
    hashtags: 'ہیش ٹیگز شامل کریں',
    emojis: 'ایموجیز شامل کریں',
    language: 'زبان',
    targetAudience: 'ہدف سامعین',
    keyMessage: 'کلیدی پیغام',
    background: 'پس منظر',
    model: 'AI ماڈل',
    advanced: 'اعلی ترتیبات',
    generatePost: 'پوسٹ تخلیق کریں',
    generatingPost: 'تخلیق ہو رہی ہے...',
    inspirationSources: 'شامل ذرائع',
    noSources: 'کوئی ذرائع نہیں — تحریری انداز نقل کرنے کے لیے پروفائلز شامل کریں',
    scanProfile: 'پروفائل اسکین کریں',
    useInAI: 'AI میں استعمال کریں',
    topics: 'موضوعات',
    data: 'ڈیٹا',
    scheduledPosts: 'شیڈول شدہ پوسٹس',
    drafts: 'ڈرافٹس',
    saveDraft: 'ڈرافٹ محفوظ کریں',
    postToLinkedIn: 'لنکڈان پر پوسٹ کریں',
    schedulePost: 'پوسٹ شیڈول کریں',
    copyToClipboard: 'کلپ بورڈ پر کاپی کریں',
  },
  trendingTab: {
    savedPosts: 'محفوظ پوسٹس',
    sharedPosts: 'مشترکہ پوسٹس',
    feedSchedule: 'فیڈ شیڈول',
    generateFromTrending: 'ٹرینڈنگ سے تخلیق کریں',
    period: 'مدت',
    all: 'تمام وقت',
    selectPosts: 'پوسٹس منتخب کریں',
    customPrompt: 'اپنی مرضی کا پرامپٹ',
    includeHashtags: 'ہیش ٹیگز شامل کریں',
    language: 'زبان',
    model: 'AI ماڈل',
    generate: 'تخلیق کریں',
    preview: 'تخلیق شدہ پیش نظارہ',
    noSavedPosts: 'ابھی تک کوئی محفوظ پوسٹس نہیں',
    noPosts: 'کوئی پوسٹس نہیں ملیں',
  },
  commentsTab: {
    commentStyle: 'تبصرے کا انداز',
    voiceProfiles: 'آواز پروفائلز',
    sharedProfiles: 'مشترکہ پروفائلز',
    commentSettings: 'تبصرے کی ترتیبات',
    addProfile: 'پروفائل شامل کریں',
    tone: 'لہجہ',
    goal: 'مقصد',
    style: 'انداز',
  },
  commenterTab: {
    autoCommenter: 'آٹو کمنٹر',
    bulkComment: 'بلک تبصرہ',
    configuration: 'ترتیب',
    startCommenting: 'تبصرہ شروع کریں',
    stopCommenting: 'تبصرہ بند کریں',
  },
  importTab: {
    importProfiles: 'پروفائلز درآمد کریں',
    configuration: 'ترتیب',
    startImport: 'درآمد شروع کریں',
    stopImport: 'درآمد بند کریں',
  },
  tasksTab: {
    viewTasks: 'ٹاسکس دیکھیں',
    stopAll: 'تمام ٹاسکس بند کریں',
    noTasks: 'کوئی ٹاسکس نہیں ملے',
    taskStatus: 'ٹاسک کی حالت',
  },
  limitsTab: {
    presets: 'پری سیٹس',
    delayMode: 'تاخیر کا طریقہ',
    fixed: 'مقررہ',
    random: 'بے ترتیب',
    betweenActions: 'عمل کے درمیان تاخیر',
    perAction: 'فی عمل تاخیر',
    postWriter: 'پوسٹ رائٹر تاخیر',
    warmup: 'وارم اپ تاخیر',
    humanSimulation: 'انسانی مشابہت',
    safetyCritical: 'حفاظتی اہم',
    liveActivity: 'لائیو سرگرمی ٹائم لائن',
  },
  historyTab: {
    generationHistory: 'تخلیق کی تاریخ',
    noHistory: 'کوئی تاریخ نہیں ملی',
  },
  analyticsTab: {
    engagementMetrics: 'مصروفیت کے میٹرکس',
    automationHistory: 'آٹومیشن تاریخ',
    networkingSessions: 'نیٹ ورکنگ سیشنز',
    importActivities: 'درآمد سرگرمیاں',
  },
  referralsTab: {
    referralProgram: 'ریفرل پروگرام',
    yourReferralLink: 'آپ کا ریفرل لنک',
    copyLink: 'لنک کاپی کریں',
    totalReferrals: 'کل ریفرلز',
    paidReferrals: 'ادا شدہ ریفرلز',
    totalEarnings: 'کل آمدنی',
    commissionRate: 'کمیشن کی شرح',
    minPayout: 'کم از کم ادائیگی',
    requestPayout: 'ادائیگی کی درخواست',
  },
  usageTab: {
    dailyUsage: 'یومیہ استعمال',
    planLimits: 'پلان کی حدود',
    used: 'استعمال شدہ',
    limit: 'حد',
    remaining: 'باقی',
  },
  languages: {
    en: 'English',
    ur: 'اردو (Urdu)',
    ar: 'العربية (Arabic)',
    es: 'Español (Spanish)',
    fr: 'Français (French)',
    de: 'Deutsch (German)',
    hi: 'हिन्दी (Hindi)',
    pt: 'Português (Portuguese)',
    zh: '中文 (Chinese)',
    tr: 'Türkçe (Turkish)',
    ja: '日本語 (Japanese)',
    ko: '한국어 (Korean)',
    it: 'Italiano (Italian)',
    ru: 'Русский (Russian)',
  },
};

export default ur;

```

---

### i18n\locales\zh.ts

```typescript
const zh = {
  sidebar: { dashboard: '仪表盘', posts: '帖子', comments: '评论', management: '管理', account: '账户', settings: '设置' },
  nav: { overview: '概览', viralPostsWriter: '病毒帖子写手', personalizedPostWriter: '个性化帖子写手', autoCommenter: '自动评论', commentsSettings: '评论设置', importProfiles: '导入档案', limitsDelays: '限制与延迟', tasks: '任务', activityLogs: '活动日志', history: '历史', analytics: '分析', usageLimits: '使用与限制', referrals: '推荐', extension: '扩展', account: '账户', billing: '账单' },
  headers: { overview: '概览', writer: '个性化帖子写手', comments: '评论设置', 'trending-posts': '病毒帖子写手', tasks: '任务', history: '历史', limits: '限制与延迟', commenter: '自动评论', import: '导入档案', analytics: '分析', usage: '使用与限制', referrals: '推荐计划', extension: 'Chrome扩展', account: '账户设置', activity: '活动日志' },
  descriptions: { overview: '您的LinkedIn自动化概况', writer: '创建与您独特声音和风格匹配的AI个性化帖子', 'trending-posts': '生成受LinkedIn热门内容启发的病毒帖子', comments: '配置AI评论风格、语气、目标和语音配置', tasks: '查看和管理扩展任务', history: '浏览您的生成和发布历史', limits: 'LinkedIn安全自动化限制和时间控制', commenter: 'AI驱动的批量评论和自动参与', import: '导入LinkedIn档案进行自动参与', analytics: '跟踪参与指标、自动化历史、网络会话和导入活动', usage: '监控您的每日使用和计划限制', referrals: '每次付费推荐赚取30%佣金', extension: '安装Chrome扩展开始使用', account: '管理您的账户设置和语言偏好', activity: '来自扩展的实时活动日志' },
  accountTab: { fullName: '全名', emailAddress: '电子邮件地址', currentPlan: '当前计划', memberSince: '会员起始日', changePlan: '更改计划', language: '仪表盘语言', selectLanguage: '选择您的首选语言', languageChanged: '语言更改成功', na: '不可用' },
  overviewTab: { currentPlan: '当前计划', activePlan: '活跃计划', referralEarnings: '推荐收入', paidUsers: '付费用户', totalReferrals: '总推荐数', usersJoined: '用户已加入', memberSince: '会员起始日', todaysUsage: '今日使用', likes: '点赞', aiPosts: 'AI帖子', aiComments: 'AI评论', follows: '关注', getChromeExtension: '获取Chrome扩展', installExtension: '安装我们的扩展开始自动化', inviteFriends: '邀请朋友', earnCommission: '每次付费推荐赚取30%佣金' },
  extensionStatus: { connected: '扩展已连接', offline: '扩展离线', lastSeen: '最后在线', retry: '重试', getExtension: '获取扩展' },
  theme: { current: '当前', light: '浅色', dark: '深色' },
  common: { loading: '正在加载您的仪表盘...', loggingOut: '正在退出...', logout: '退出', save: '保存', cancel: '取消', delete: '删除', edit: '编辑', search: '搜索', close: '关闭', copy: '复制', copied: '已复制！', generate: '生成', generating: '生成中...', post: '发布', schedule: '安排', preview: '预览', refresh: '刷新', noData: '暂无数据', confirm: '确认', back: '返回', next: '下一步', free: '免费', active: '活跃', inactive: '非活跃', enabled: '已启用', disabled: '已禁用', success: '成功', error: '错误', warning: '警告', info: '信息', pending: '待处理', inProgress: '进行中', completed: '已完成', failed: '失败', today: '今天', yesterday: '昨天', ago: '前', sAgo: '秒前', mAgo: '分钟前', hAgo: '小时前', dAgo: '天前' },
  writerTab: { topic: '主题', topicPlaceholder: '输入LinkedIn帖子的主题...', template: '模板', tone: '语气', length: '长度', hashtags: '包含标签', emojis: '包含表情', language: '语言', targetAudience: '目标受众', keyMessage: '关键信息', background: '背景', model: 'AI模型', advanced: '高级选项', generatePost: '生成帖子', generatingPost: '生成中...', inspirationSources: '已添加来源', noSources: '无来源——添加档案以模仿写作风格', scanProfile: '扫描档案', useInAI: '在AI中使用', topics: '主题', data: '数据', scheduledPosts: '已安排的帖子', drafts: '草稿', saveDraft: '保存草稿', postToLinkedIn: '发布到LinkedIn', schedulePost: '安排帖子', copyToClipboard: '复制到剪贴板' },
  trendingTab: { savedPosts: '已保存的帖子', sharedPosts: '已分享的帖子', feedSchedule: '动态安排', generateFromTrending: '从热门生成', period: '时期', all: '所有时间', selectPosts: '选择帖子', customPrompt: '自定义提示', includeHashtags: '包含标签', language: '语言', model: 'AI模型', generate: '生成', preview: '生成预览', noSavedPosts: '暂无保存的帖子', noPosts: '未找到帖子' },
  commentsTab: { commentStyle: '评论风格', voiceProfiles: '语音配置', sharedProfiles: '共享配置', commentSettings: '评论设置', addProfile: '添加配置', tone: '语气', goal: '目标', style: '风格' },
  commenterTab: { autoCommenter: '自动评论', bulkComment: '批量评论', configuration: '配置', startCommenting: '开始评论', stopCommenting: '停止评论' },
  importTab: { importProfiles: '导入档案', configuration: '配置', startImport: '开始导入', stopImport: '停止导入' },
  tasksTab: { viewTasks: '查看任务', stopAll: '停止所有任务', noTasks: '未找到任务', taskStatus: '任务状态' },
  limitsTab: { presets: '预设', delayMode: '延迟模式', fixed: '固定', random: '随机', betweenActions: '操作间延迟', perAction: '每操作延迟', postWriter: '写手延迟', warmup: '预热延迟', humanSimulation: '人类模拟', safetyCritical: '安全关键', liveActivity: '实时活动时间线' },
  historyTab: { generationHistory: '生成历史', noHistory: '未找到历史' },
  analyticsTab: { engagementMetrics: '参与指标', automationHistory: '自动化历史', networkingSessions: '网络会话', importActivities: '导入活动' },
  referralsTab: { referralProgram: '推荐计划', yourReferralLink: '您的推荐链接', copyLink: '复制链接', totalReferrals: '总推荐数', paidReferrals: '付费推荐', totalEarnings: '总收入', commissionRate: '佣金率', minPayout: '最低付款', requestPayout: '请求付款' },
  usageTab: { dailyUsage: '每日使用', planLimits: '计划限制', used: '已使用', limit: '限制', remaining: '剩余' },
  languages: { en: 'English', ur: 'اردو (Urdu)', ar: 'العربية (Arabic)', es: 'Español (Spanish)', fr: 'Français (French)', de: 'Deutsch (German)', hi: 'हिन्दी (Hindi)', pt: 'Português (Portuguese)', zh: '中文 (Chinese)', tr: 'Türkçe (Turkish)', ja: '日本語 (Japanese)', ko: '한국어 (Korean)', it: 'Italiano (Italian)', ru: 'Русский (Russian)' },
};
export default zh;

```

---

### kommentify-email-html.ts

```typescript
// Kommentify HTML Email Template Builder
// Professional email designs matching Kommentify branding

export function createKommentifyEmail(content: string, preheader?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kommentify</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f7fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  ${preheader ? `<div style="display: none; max-height: 0; overflow: hidden;">${preheader}</div>` : ''}
  
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f7fa; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Kommentify</h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">LinkedIn Growth on Autopilot</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px 40px; border-top: 1px solid #e9ecef;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: center; padding-bottom: 15px;">
                    <p style="margin: 0; color: #6c757d; font-size: 13px; line-height: 1.6;">
                      <strong style="color: #495057;">Team Kommentify</strong><br>
                      Making LinkedIn networking effortless
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center; padding-top: 15px; border-top: 1px solid #dee2e6;">
                    <p style="margin: 0; color: #868e96; font-size: 12px;">
                      © 2024 Kommentify. All rights reserved.<br>
                      <a href="{{unsubscribeUrl}}" style="color: #667eea; text-decoration: none;">Unsubscribe</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function createButton(text: string, url: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin: 25px 0;">
    <tr>
      <td align="center" style="border-radius: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <a href="${url}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
          ${text}
        </a>
      </td>
    </tr>
  </table>`;
}

export function createCheckList(items: string[]): string {
  return `<table cellpadding="0" cellspacing="0" style="margin: 20px 0;">
    ${items.map(item => `
      <tr>
        <td style="padding: 8px 0;">
          <span style="display: inline-block; width: 24px; height: 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; text-align: center; line-height: 24px; color: white; font-weight: bold; margin-right: 12px;">✓</span>
          <span style="color: #495057; font-size: 15px;">${item}</span>
        </td>
      </tr>
    `).join('')}
  </table>`;
}

export function createNumberList(items: string[]): string {
  return `<table cellpadding="0" cellspacing="0" style="margin: 20px 0;">
    ${items.map((item, i) => `
      <tr>
        <td style="padding: 10px 0;">
          <span style="display: inline-block; width: 28px; height: 28px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; text-align: center; line-height: 28px; color: white; font-size: 14px; font-weight: bold; margin-right: 12px;">${i + 1}</span>
          <span style="color: #495057; font-size: 15px;">${item}</span>
        </td>
      </tr>
    `).join('')}
  </table>`;
}

export function createHighlight(content: string, bgColor = '#f8f9fa', borderColor = '#667eea'): string {
  return `<div style="background: ${bgColor}; border-left: 4px solid ${borderColor}; padding: 20px; margin: 20px 0; border-radius: 8px;">
    <p style="margin: 0; color: #495057; font-size: 14px; line-height: 1.6;">${content}</p>
  </div>`;
}

export function createAlert(content: string, type: 'success' | 'warning' | 'info' = 'info'): string {
  const colors = {
    success: { bg: '#d4edda', border: '#28a745', text: '#155724' },
    warning: { bg: '#fff3cd', border: '#ffc107', text: '#856404' },
    info: { bg: '#d1ecf1', border: '#17a2b8', text: '#0c5460' }
  };
  const c = colors[type];
  return `<div style="background: ${c.bg}; border: 2px dashed ${c.border}; padding: 20px; border-radius: 12px; margin: 25px 0;">
    <p style="margin: 0; color: ${c.text}; font-size: 14px; font-weight: 600; text-align: center;">${content}</p>
  </div>`;
}

```

---

### limit-service.ts

```typescript
import { prisma } from '@/lib/prisma';

export type LimitType =
    | 'comments'
    | 'likes'
    | 'shares'
    | 'follows'
    | 'connections'
    | 'aiPosts'
    | 'aiComments'
    | 'aiTopicLines'
    | 'importProfiles';

export class LimitService {

    /**
     * Get start of current month for monthly tracking
     */
    private getMonthStart(): Date {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    }

    /**
     * Get today's date at midnight for daily record tracking
     */
    private getToday(): Date {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    }

    /**
     * Check if a user has reached their MONTHLY limit for a specific action
     */
    async checkLimit(userId: string, type: LimitType): Promise<{ allowed: boolean; limit: number; usage: number }> {
        try {
            // Get user's plan
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { plan: true }
            });

            if (!user || !user.plan) {
                // Default strict limits if no plan found
                return { allowed: false, limit: 0, usage: 0 };
            }

            // Determine limit based on plan (MONTHLY limits)
            let limit = 0;
            const plan = user.plan as any;
            switch (type) {
                case 'comments': limit = plan.monthlyComments; break;
                case 'likes': limit = plan.monthlyLikes; break;
                case 'shares': limit = plan.monthlyShares; break;
                case 'follows': limit = plan.monthlyFollows; break;
                case 'connections': limit = plan.monthlyConnections; break;
                case 'aiPosts': limit = plan.aiPostsPerMonth; break;
                case 'aiComments': limit = plan.aiCommentsPerMonth; break;
                case 'aiTopicLines': limit = plan.aiTopicLinesPerMonth; break;
                case 'importProfiles': limit = plan.monthlyImportCredits; break;
            }

            // Get MONTHLY usage (aggregate all daily records for current month)
            const monthStart = this.getMonthStart();
            const usageRecords = await prisma.apiUsage.findMany({
                where: {
                    userId,
                    date: {
                        gte: monthStart
                    }
                }
            });

            // Sum up all usage for the month
            // #25: Type-safe column mapping instead of dynamic property access
            const typeToColumn: Record<LimitType, string> = {
                comments: 'comments',
                likes: 'likes',
                shares: 'shares',
                follows: 'follows',
                connections: 'connections',
                aiPosts: 'aiPosts',
                aiComments: 'aiComments',
                aiTopicLines: 'aiTopicLines',
                importProfiles: 'importProfiles',
            };
            const column = typeToColumn[type];
            const usage = usageRecords.reduce((sum, record) => {
                return sum + (Number((record as any)[column]) || 0);
            }, 0);

            return {
                allowed: usage < limit,
                limit,
                usage
            };

        } catch (error) {
            console.error('Error checking limit:', error);
            return { allowed: false, limit: 0, usage: 0 };
        }
    }

    /**
     * Increment usage for a specific action (stores in daily record, but limits are monthly)
     */
    async incrementUsage(userId: string, type: LimitType, amount: number = 1): Promise<void> {
        try {
            const today = this.getToday();

            await prisma.apiUsage.upsert({
                where: {
                    userId_date: {
                        userId,
                        date: today
                    }
                },
                update: {
                    [type]: { increment: amount }
                },
                create: {
                    userId,
                    date: today,
                    [type]: amount
                }
            });
        } catch (error) {
            console.error('Error incrementing usage:', error);
        }
    }

    /**
     * Get current MONTHLY usage stats for a user
     */
    async getUsageStats(userId: string) {
        try {
            const monthStart = this.getMonthStart();

            // Get all usage records for current month
            const usageRecords = await prisma.apiUsage.findMany({
                where: {
                    userId,
                    date: {
                        gte: monthStart
                    }
                }
            });

            // Aggregate monthly usage
            const monthlyUsage = {
                comments: 0,
                likes: 0,
                shares: 0,
                follows: 0,
                connections: 0,
                importProfiles: 0,
                aiPosts: 0,
                aiComments: 0,
                bonusAiComments: 0,
                aiTopicLines: 0
            };

            usageRecords.forEach((record: any) => {
                monthlyUsage.comments += record.comments || 0;
                monthlyUsage.likes += record.likes || 0;
                monthlyUsage.shares += record.shares || 0;
                monthlyUsage.follows += record.follows || 0;
                monthlyUsage.connections += record.connections || 0;
                monthlyUsage.importProfiles += record.importProfiles || 0;
                monthlyUsage.aiPosts += record.aiPosts || 0;
                monthlyUsage.aiComments += record.aiComments || 0;
                monthlyUsage.bonusAiComments += record.bonusAiComments || 0;
                monthlyUsage.aiTopicLines += record.aiTopicLines || 0;
            });

            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { plan: true }
            });

            return {
                usage: monthlyUsage,
                limits: user?.plan || {}
            };
        } catch (error) {
            console.error('Error getting usage stats:', error);
            return null;
        }
    }

    /**
     * Get monthly usage for admin display (for a specific user)
     */
    async getMonthlyUsageForUser(userId: string) {
        try {
            const monthStart = this.getMonthStart();

            const usageRecords = await prisma.apiUsage.findMany({
                where: {
                    userId,
                    date: {
                        gte: monthStart
                    }
                }
            });

            const monthlyUsage = {
                comments: 0,
                likes: 0,
                shares: 0,
                follows: 0,
                connections: 0,
                importProfiles: 0,
                aiPosts: 0,
                aiComments: 0,
                bonusAiComments: 0,
                aiTopicLines: 0
            };

            usageRecords.forEach((record: any) => {
                monthlyUsage.comments += record.comments || 0;
                monthlyUsage.likes += record.likes || 0;
                monthlyUsage.shares += record.shares || 0;
                monthlyUsage.follows += record.follows || 0;
                monthlyUsage.connections += record.connections || 0;
                monthlyUsage.importProfiles += record.importProfiles || 0;
                monthlyUsage.aiPosts += record.aiPosts || 0;
                monthlyUsage.aiComments += record.aiComments || 0;
                monthlyUsage.bonusAiComments += record.bonusAiComments || 0;
                monthlyUsage.aiTopicLines += record.aiTopicLines || 0;
            });

            return monthlyUsage;
        } catch (error) {
            console.error('Error getting monthly usage for user:', error);
            return null;
        }
    }

    /**
     * Get monthly usage for multiple users at once (optimized for admin)
     * Returns a Map of userId -> usage data
     */
    async getMonthlyUsageForUsers(userIds: string[]): Promise<Map<string, any>> {
        const usageMap = new Map<string, any>();

        if (userIds.length === 0) {
            return usageMap;
        }

        try {
            const monthStart = this.getMonthStart();

            // Single query to get all usage records for all users
            const usageRecords = await prisma.apiUsage.findMany({
                where: {
                    userId: { in: userIds },
                    date: { gte: monthStart }
                }
            });

            // Initialize empty usage for all users
            userIds.forEach(userId => {
                usageMap.set(userId, {
                    comments: 0,
                    likes: 0,
                    shares: 0,
                    follows: 0,
                    connections: 0,
                    importProfiles: 0,
                    aiPosts: 0,
                    aiComments: 0,
                    bonusAiComments: 0,
                    aiTopicLines: 0
                });
            });

            // Aggregate usage by user
            usageRecords.forEach((record: any) => {
                const existing = usageMap.get(record.userId);
                if (existing) {
                    existing.comments += record.comments || 0;
                    existing.likes += record.likes || 0;
                    existing.shares += record.shares || 0;
                    existing.follows += record.follows || 0;
                    existing.connections += record.connections || 0;
                    existing.importProfiles += record.importProfiles || 0;
                    existing.aiPosts += record.aiPosts || 0;
                    existing.aiComments += record.aiComments || 0;
                    existing.bonusAiComments += record.bonusAiComments || 0;
                    existing.aiTopicLines += record.aiTopicLines || 0;
                }
            });

            return usageMap;
        } catch (error) {
            console.error('Error getting monthly usage for users:', error);
            return usageMap;
        }
    }
}

export const limitService = new LimitService();

```

---

### linkedin-formatter.ts

```typescript
/**
 * LinkedIn Content Formatter
 * Converts AI-generated markdown content to LinkedIn-friendly format
 */

/**
 * Convert regular text to Unicode bold for LinkedIn
 */
function toBoldUnicode(text: string): string {
  const boldMap: { [key: string]: string } = {
    'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚', 'H': '𝗛', 'I': '𝗜', 'J': '𝗝',
    'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡', 'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥', 'S': '𝗦', 'T': '𝗧',
    'U': '𝗨', 'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭',
    'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴', 'h': '𝗵', 'i': '𝗶', 'j': '𝗷',
    'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻', 'o': '𝗼', 'p': '𝗽', 'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁',
    'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',
    '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰', '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵'
  };

  return text.split('').map(char => boldMap[char] || char).join('');
}

export function formatForLinkedIn(content: string): string {
  if (!content) return '';

  let formatted = content;

  // 1. Fix hashtag format: "hashtag#SEO" -> "#SEO"
  formatted = formatted.replace(/hashtag#/g, '#');

  // 2. Convert markdown bold (**text**) to Unicode bold for LinkedIn
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, (match, text) => {
    return toBoldUnicode(text);
  });

  // 3. Extract hashtags from the content (#28: Only match proper hashtags, not #1, #2, etc.)
  const hashtagMatches = formatted.match(/#[A-Za-z]\w*/g) || [];

  // Remove proper hashtags from content temporarily (leave #1, #2, etc. alone)
  let contentWithoutHashtags = formatted.replace(/#[A-Za-z]\w*/g, '').trim();

  // 4. Convert double line breaks to single line breaks
  contentWithoutHashtags = contentWithoutHashtags.replace(/\n\n+/g, '\n\n');

  // 5. Remove trailing empty lines
  contentWithoutHashtags = contentWithoutHashtags.replace(/\n+$/g, '');

  // 6. If there are hashtags, add them at the end with two line breaks (3 newlines = 2 empty lines)
  if (hashtagMatches.length > 0) {
    formatted = contentWithoutHashtags + '\n\n\n' + hashtagMatches.join(' ');
  } else {
    formatted = contentWithoutHashtags;
  }

  // 7. Remove any markdown code blocks if present
  formatted = formatted.replace(/```[\s\S]*?```/g, '');

  // 8. Clean up emoji spacing (but keep single spaces)
  formatted = formatted.replace(/\s{2,}([\u{1F300}-\u{1F9FF}])/gu, ' $1');

  // 9. Trim final whitespace
  formatted = formatted.trim();

  return formatted;
}

/**
 * Formats topic lines for LinkedIn
 */
export function formatTopicsForLinkedIn(topics: string[]): string[] {
  return topics.map(topic => {
    let formatted = topic.trim();

    // Remove any markdown formatting from topics
    formatted = formatted.replace(/\*\*/g, '');
    formatted = formatted.replace(/\*/g, '');

    // Ensure proper capitalization
    if (formatted.length > 0) {
      formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }

    return formatted;
  });
}

/**
 * Formats comments for LinkedIn
 */
export function formatCommentForLinkedIn(comment: string): string {
  if (!comment) return '';

  let formatted = comment;

  // Remove any markdown formatting that doesn't work well in comments
  formatted = formatted.replace(/#{1,6}\s/g, ''); // Remove header markers

  // Fix hashtags
  formatted = formatted.replace(/hashtag#/g, '#');

  // Replace em dashes and en dashes with regular dashes or commas
  formatted = formatted.replace(/—/g, ' - '); // em dash to regular dash with spaces
  formatted = formatted.replace(/–/g, '-'); // en dash to regular dash

  // Remove overused words like "curious" variations
  formatted = formatted.replace(/\bcurious\b/gi, 'wondering');
  formatted = formatted.replace(/\bcuriosity\b/gi, 'interest');

  // Remove ALL emojis - comprehensive emoji regex pattern
  formatted = formatted.replace(/[\u{1F600}-\u{1F64F}]/gu, ''); // Emoticons
  formatted = formatted.replace(/[\u{1F300}-\u{1F5FF}]/gu, ''); // Misc Symbols and Pictographs
  formatted = formatted.replace(/[\u{1F680}-\u{1F6FF}]/gu, ''); // Transport and Map
  formatted = formatted.replace(/[\u{1F1E0}-\u{1F1FF}]/gu, ''); // Flags
  formatted = formatted.replace(/[\u{2600}-\u{26FF}]/gu, ''); // Misc symbols
  formatted = formatted.replace(/[\u{2700}-\u{27BF}]/gu, ''); // Dingbats
  formatted = formatted.replace(/[\u{FE00}-\u{FE0F}]/gu, ''); // Variation Selectors
  formatted = formatted.replace(/[\u{1F900}-\u{1F9FF}]/gu, ''); // Supplemental Symbols and Pictographs
  formatted = formatted.replace(/[\u{1FA00}-\u{1FA6F}]/gu, ''); // Chess Symbols
  formatted = formatted.replace(/[\u{1FA70}-\u{1FAFF}]/gu, ''); // Symbols and Pictographs Extended-A
  formatted = formatted.replace(/[\u{231A}-\u{231B}]/gu, ''); // Watch, Hourglass
  formatted = formatted.replace(/[\u{23E9}-\u{23F3}]/gu, ''); // Various symbols
  formatted = formatted.replace(/[\u{23F8}-\u{23FA}]/gu, ''); // Various symbols
  formatted = formatted.replace(/[\u{25AA}-\u{25AB}]/gu, ''); // Squares
  formatted = formatted.replace(/[\u{25B6}]/gu, ''); // Play button
  formatted = formatted.replace(/[\u{25C0}]/gu, ''); // Reverse button
  formatted = formatted.replace(/[\u{25FB}-\u{25FE}]/gu, ''); // Squares
  formatted = formatted.replace(/[\u{2614}-\u{2615}]/gu, ''); // Umbrella, Hot beverage
  formatted = formatted.replace(/[\u{2648}-\u{2653}]/gu, ''); // Zodiac
  formatted = formatted.replace(/[\u{267F}]/gu, ''); // Wheelchair
  formatted = formatted.replace(/[\u{2693}]/gu, ''); // Anchor
  formatted = formatted.replace(/[\u{26A1}]/gu, ''); // High voltage
  formatted = formatted.replace(/[\u{26AA}-\u{26AB}]/gu, ''); // Circles
  formatted = formatted.replace(/[\u{26BD}-\u{26BE}]/gu, ''); // Soccer, Baseball
  formatted = formatted.replace(/[\u{26C4}-\u{26C5}]/gu, ''); // Snowman, Sun
  formatted = formatted.replace(/[\u{26CE}]/gu, ''); // Ophiuchus
  formatted = formatted.replace(/[\u{26D4}]/gu, ''); // No entry
  formatted = formatted.replace(/[\u{26EA}]/gu, ''); // Church
  formatted = formatted.replace(/[\u{26F2}-\u{26F3}]/gu, ''); // Fountain, Golf
  formatted = formatted.replace(/[\u{26F5}]/gu, ''); // Sailboat
  formatted = formatted.replace(/[\u{26FA}]/gu, ''); // Tent
  formatted = formatted.replace(/[\u{26FD}]/gu, ''); // Fuel pump
  formatted = formatted.replace(/[\u{2702}]/gu, ''); // Scissors
  formatted = formatted.replace(/[\u{2705}]/gu, ''); // Check mark
  formatted = formatted.replace(/[\u{2708}-\u{270D}]/gu, ''); // Airplane to Writing hand
  formatted = formatted.replace(/[\u{270F}]/gu, ''); // Pencil
  formatted = formatted.replace(/[\u{2712}]/gu, ''); // Black nib
  formatted = formatted.replace(/[\u{2714}]/gu, ''); // Check mark
  formatted = formatted.replace(/[\u{2716}]/gu, ''); // X mark
  formatted = formatted.replace(/[\u{271D}]/gu, ''); // Latin cross
  formatted = formatted.replace(/[\u{2721}]/gu, ''); // Star of David
  formatted = formatted.replace(/[\u{2728}]/gu, ''); // Sparkles
  formatted = formatted.replace(/[\u{2733}-\u{2734}]/gu, ''); // Eight spoked asterisk
  formatted = formatted.replace(/[\u{2744}]/gu, ''); // Snowflake
  formatted = formatted.replace(/[\u{2747}]/gu, ''); // Sparkle
  formatted = formatted.replace(/[\u{274C}]/gu, ''); // Cross mark
  formatted = formatted.replace(/[\u{274E}]/gu, ''); // Cross mark
  formatted = formatted.replace(/[\u{2753}-\u{2755}]/gu, ''); // Question marks
  formatted = formatted.replace(/[\u{2757}]/gu, ''); // Exclamation mark
  formatted = formatted.replace(/[\u{2763}-\u{2764}]/gu, ''); // Heart exclamation, Heart
  formatted = formatted.replace(/[\u{2795}-\u{2797}]/gu, ''); // Plus, Minus, Division
  formatted = formatted.replace(/[\u{27A1}]/gu, ''); // Right arrow
  formatted = formatted.replace(/[\u{27B0}]/gu, ''); // Curly loop
  formatted = formatted.replace(/[\u{27BF}]/gu, ''); // Double curly loop
  formatted = formatted.replace(/[\u{2934}-\u{2935}]/gu, ''); // Arrows
  formatted = formatted.replace(/[\u{2B05}-\u{2B07}]/gu, ''); // Arrows
  formatted = formatted.replace(/[\u{2B1B}-\u{2B1C}]/gu, ''); // Squares
  formatted = formatted.replace(/[\u{2B50}]/gu, ''); // Star
  formatted = formatted.replace(/[\u{2B55}]/gu, ''); // Circle
  formatted = formatted.replace(/[\u{3030}]/gu, ''); // Wavy dash
  formatted = formatted.replace(/[\u{303D}]/gu, ''); // Part alternation mark
  formatted = formatted.replace(/[\u{3297}]/gu, ''); // Circled Ideograph Congratulation
  formatted = formatted.replace(/[\u{3299}]/gu, ''); // Circled Ideograph Secret

  // Clean up double spaces
  formatted = formatted.replace(/\s{2,}/g, ' ');

  // Clean up spacing
  formatted = formatted.trim();

  return formatted;
}

```

---

### linkedin-service.ts

```typescript
/**
 * LinkedIn API Service for server-side posting
 * Uses LinkedIn OAuth2 with UGC Posts API
 */

// Lazy initialization — avoid top-level throws that crash the app at import time (#17)
function getLinkedInConfig() {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI;
  if (!clientId) throw new Error('CRITICAL: LINKEDIN_CLIENT_ID environment variable is not set');
  if (!clientSecret) throw new Error('CRITICAL: LINKEDIN_CLIENT_SECRET environment variable is not set');
  if (!redirectUri) throw new Error('CRITICAL: LINKEDIN_REDIRECT_URI environment variable is not set');
  return { clientId, clientSecret, redirectUri };
}

export interface LinkedInTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

export interface LinkedInProfile {
  sub: string; // LinkedIn member ID
  name: string;
  email?: string;
  picture?: string;
}

/**
 * Generate LinkedIn OAuth authorization URL
 */
export function getLinkedInAuthUrl(state: string): string {
  const { clientId, redirectUri } = getLinkedInConfig();
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope: 'openid profile email w_member_social',
  });
  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code: string): Promise<LinkedInTokenResponse> {
  const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: getLinkedInConfig().clientId,
      client_secret: getLinkedInConfig().clientSecret,
      redirect_uri: getLinkedInConfig().redirectUri,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`LinkedIn token exchange failed: ${error}`);
  }

  return res.json();
}

/**
 * Fetch LinkedIn user profile using OpenID Connect
 */
export async function getLinkedInProfile(accessToken: string): Promise<LinkedInProfile> {
  const res = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`LinkedIn profile fetch failed: ${res.status}`);
  }

  return res.json();
}

/**
 * Post text-only content to LinkedIn
 */
export async function postToLinkedIn(
  accessToken: string,
  linkedinId: string,
  content: string
): Promise<{ id: string }> {
  const body = {
    author: `urn:li:person:${linkedinId}`,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text: content },
        shareMediaCategory: 'NONE',
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  };

  const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`LinkedIn post failed (${res.status}): ${error}`);
  }

  return res.json();
}

/**
 * Post content with an image to LinkedIn (3-step process)
 */
export async function postWithImageToLinkedIn(
  accessToken: string,
  linkedinId: string,
  content: string,
  imageUrl: string
): Promise<{ id: string }> {
  // Step 1: Register image upload
  const registerRes = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      registerUploadRequest: {
        recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
        owner: `urn:li:person:${linkedinId}`,
        serviceRelationships: [{
          relationshipType: 'OWNER',
          identifier: 'urn:li:userGeneratedContent',
        }],
      },
    }),
  });

  if (!registerRes.ok) {
    throw new Error(`LinkedIn image register failed: ${registerRes.status}`);
  }

  const registerData = await registerRes.json();
  const uploadUrl = registerData.value.uploadMechanism[
    'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'
  ].uploadUrl;
  const assetId = registerData.value.asset;

  // Step 2: Download image and upload to LinkedIn
  const imageRes = await fetch(imageUrl);
  const imageBuffer = await imageRes.arrayBuffer();
  const contentType = imageRes.headers.get('content-type') || 'image/jpeg';

  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': contentType,
    },
    body: Buffer.from(imageBuffer),
  });

  if (!uploadRes.ok) {
    throw new Error(`LinkedIn image upload failed (${uploadRes.status}): ${await uploadRes.text()}`);
  }

  // Step 3: Create post with image
  const postBody = {
    author: `urn:li:person:${linkedinId}`,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text: content },
        shareMediaCategory: 'IMAGE',
        media: [{
          status: 'READY',
          description: { text: '' },
          media: assetId,
          title: { text: '' },
        }],
      },
    },
    visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
  };

  const postRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(postBody),
  });

  if (!postRes.ok) {
    const error = await postRes.text();
    throw new Error(`LinkedIn image post failed (${postRes.status}): ${error}`);
  }

  return postRes.json();
}

/**
 * Post content with a video to LinkedIn (3-step process)
 */
export async function postWithVideoToLinkedIn(
  accessToken: string,
  linkedinId: string,
  content: string,
  videoUrl: string
): Promise<{ id: string }> {
  // Step 1: Register video upload
  const registerRes = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      registerUploadRequest: {
        recipes: ['urn:li:digitalmediaRecipe:feedshare-video'],
        owner: `urn:li:person:${linkedinId}`,
        serviceRelationships: [{
          relationshipType: 'OWNER',
          identifier: 'urn:li:userGeneratedContent',
        }],
      },
    }),
  });

  if (!registerRes.ok) {
    throw new Error(`LinkedIn video register failed: ${registerRes.status}`);
  }

  const registerData = await registerRes.json();
  const uploadUrl = registerData.value.uploadMechanism[
    'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'
  ].uploadUrl;
  const assetId = registerData.value.asset;

  // Step 2: Download video and upload to LinkedIn
  const videoRes = await fetch(videoUrl);
  const videoBuffer = await videoRes.arrayBuffer();

  // Detect content type from URL extension (#19)
  const videoExtension = videoUrl.split('.').pop()?.toLowerCase().split('?')[0] || 'mp4';
  const videoContentTypeMap: Record<string, string> = {
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'mov': 'video/quicktime',
    'avi': 'video/x-msvideo',
  };
  const videoContentType = videoContentTypeMap[videoExtension] || videoRes.headers.get('content-type') || 'video/mp4';

  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': videoContentType,
    },
    body: Buffer.from(videoBuffer),
  });

  if (!uploadRes.ok) {
    throw new Error(`LinkedIn video upload failed (${uploadRes.status}): ${await uploadRes.text()}`);
  }

  // Step 3: Create post with video
  const postBody = {
    author: `urn:li:person:${linkedinId}`,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text: content },
        shareMediaCategory: 'VIDEO',
        media: [{
          status: 'READY',
          description: { text: '' },
          media: assetId,
          title: { text: '' },
        }],
      },
    },
    visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
  };

  const postRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(postBody),
  });

  if (!postRes.ok) {
    const error = await postRes.text();
    throw new Error(`LinkedIn video post failed (${postRes.status}): ${error}`);
  }

  return postRes.json();
}

```

---

### linkedin-url-cleaner.ts

```typescript
/**
 * Clean LinkedIn profile URLs by removing query parameters and extra path segments
 * Examples:
 * - https://www.linkedin.com/in/ankit-k-514241215?miniProfileUrn=... -> https://www.linkedin.com/in/ankit-k-514241215
 * - linkedin.com/in/john-doe/ -> https://www.linkedin.com/in/john-doe
 */

export function cleanLinkedInProfileUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  
  // Trim whitespace
  url = url.trim();
  
  // Add https:// if missing protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  
  try {
    const urlObj = new URL(url);
    
    // Only process linkedin.com URLs
    if (!urlObj.hostname.includes('linkedin.com')) {
      return url;
    }
    
    // Extract the path and remove trailing slash
    let path = urlObj.pathname.replace(/\/$/, '');
    
    // Match /in/username or /in/username/anything-else
    const match = path.match(/^\/in\/([^\/]+)/);
    if (match) {
      // Return clean URL with just the username
      return `https://www.linkedin.com/in/${match[1]}`;
    }
    
    // If no match, return the base URL without query params
    return `${urlObj.protocol}//${urlObj.hostname}${path}`;
  } catch (e) {
    // If URL parsing fails, try simple regex extraction
    const simpleMatch = url.match(/linkedin\.com\/in\/([^\/\?&#]+)/i);
    if (simpleMatch) {
      return `https://www.linkedin.com/in/${simpleMatch[1]}`;
    }
    return url;
  }
}

/**
 * Clean multiple LinkedIn URLs from a text input (space or newline separated)
 */
export function cleanLinkedInProfileUrls(text: string): string[] {
  if (!text || typeof text !== 'string') return [];
  
  // Split by newlines and spaces
  const urls = text.split(/[\s\n]+/).filter(u => u.trim().length > 0);
  
  // Clean each URL and filter out duplicates
  const cleanedUrls = urls.map(cleanLinkedInProfileUrl).filter(u => u.length > 0);
  
  // Remove duplicates
  return Array.from(new Set(cleanedUrls));
}

```

---

### openai-config.ts

```typescript
/**
 * OPENAI CONFIGURATION
 * Configuration for OpenAI API integration
 */

export const OpenAIConfig = {
    // API Key should be loaded from environment variables in backend
    apiKey: (process.env.OPENAI_API_KEY || '').trim(),
    apiUrl: 'https://api.openai.com/v1/chat/completions',

    // Models based on preferences
    models: {
        // For different tones and lengths
        'Supportive': {
            'SuperShort': 'gpt-4o-mini',
            'Brief': 'gpt-4o-mini',
            'Concise': 'gpt-4o'
        },
        'Gracious': {
            'SuperShort': 'gpt-4o-mini',
            'Brief': 'gpt-4o-mini',
            'Concise': 'gpt-4o'
        },
        'Polite': {
            'SuperShort': 'gpt-4o-mini',
            'Brief': 'gpt-4o-mini',
            'Concise': 'gpt-4o'
        },
        'Witty': {
            'SuperShort': 'gpt-4o-mini',
            'Brief': 'gpt-4o',
            'Concise': 'gpt-4o'
        },
        'Excited': {
            'SuperShort': 'gpt-4o-mini',
            'Brief': 'gpt-4o-mini',
            'Concise': 'gpt-4o'
        },
        'RespectfullyOpposed': {
            'SuperShort': 'gpt-4o-mini',
            'Brief': 'gpt-4o',
            'Concise': 'gpt-4o'
        }
    } as Record<string, Record<string, string>>,

    // Cheaper model option
    cheapModel: 'gpt-4o-mini',

    // Default model
    defaultModel: 'gpt-4o-mini',

    // Premium model for best quality
    premiumModel: 'gpt-4o'
};

/**
 * Get appropriate model based on settings
 */
export function getModelForSettings(tone: string, length: string, useCheapModel: boolean = false): string {
    if (useCheapModel) {
        return OpenAIConfig.cheapModel;
    }

    if (OpenAIConfig.models[tone] && OpenAIConfig.models[tone][length]) {
        return OpenAIConfig.models[tone][length];
    }

    return OpenAIConfig.defaultModel;
}

/**
 * Generate high-quality comment prompt for LinkedIn engagement
 * Strictly enforces the user's selected Comment Style, Comment Goal, and Tone of Voice
 */
export function generateCommentPrompt(
    postText: string,
    tone: string,
    goal: string,
    commentLength: string = 'Short',
    userExpertise: string = '',
    userBackground: string = '',
    authorName: string = 'there',
    commentStyle: string = 'direct',
    styleExamples: string[] = []
): string {
    // ── STYLE: detailed structural instructions per style ──
    const styleInstructions: Record<string, string> = {
        'direct': `STYLE = "Direct & Concise"
STRUCTURE: Write the ENTIRE comment as a SINGLE paragraph. No line breaks. Straight to the point.
EXAMPLE SHAPE: "[Name], [specific reference to their point]. [Your added value in 1-2 sentences]. [Optional short closer]."
DO NOT split into multiple paragraphs. One flowing block of text.`,

        'structured': `STYLE = "Structured"
STRUCTURE: Write EXACTLY 2-3 short paragraphs. MANDATORY: separate each paragraph with a blank line.
Paragraph 1 (required): Acknowledge a specific point from their post. 1-2 sentences.
Paragraph 2 (required): Add your insight, data, or experience. 1-2 sentences.
Paragraph 3 (optional): A question or forward-looking statement. 1 sentence.

OUTPUT MUST LOOK LIKE THIS (blank line between every paragraph):
[First paragraph sentence(s).]

[Second paragraph sentence(s).]

[Optional third paragraph sentence.]

DO NOT merge into one paragraph. If you do not include blank lines, you have failed.`,

        'storyteller': `STYLE = "Storyteller"
STRUCTURE: LEAD with a brief personal anecdote (1-2 sentences). Then connect it back to their post's point.
Opening sentence MUST start with a personal experience: "Last month I...", "A few years ago...", "I remember when...", "Early in my career..."
The story must be specific (names, numbers, timeframes) and directly relevant.
End by tying your story back to the author's message.`,

        'challenger': `STYLE = "Challenger"
STRUCTURE: Respectfully offer a DIFFERENT perspective. You are NOT agreeing - you are adding productive tension.
Opening: Acknowledge their point briefly, then pivot with "However...", "One thing I'd push back on...", "The counterargument worth considering...", "I see this differently because..."
Body: Present your alternative view with specific evidence or reasoning.
Tone: Respectful but firm. You have a clear position.`,

        'supporter': `STYLE = "Supporter"
STRUCTURE: Strongly VALIDATE their message with concrete evidence from your own experience.
Opening: Affirm their specific point (not generic praise).
Body: Back it up with YOUR data, results, or concrete example that proves they're right.
Pattern: "You're spot on about X. In my experience with [specific], I saw [specific result]. This is exactly why..."`,

        'expert': `STYLE = "Expert"
STRUCTURE: Reference data, research, or deep domain experience. Use industry terminology naturally.
Opening: Reference a specific claim from their post.
Body: Add expert-level context - cite a study, share a metric, reference a framework, or provide insider knowledge.
Language: Use precise domain vocabulary. Show you live and breathe this topic.
Pattern: "The data backs this up - [specific stat/study]. In [X] years working in [domain], the pattern I keep seeing is..."`,

        'conversational': `STYLE = "Conversational"
STRUCTURE: Write like you're talking to a colleague over coffee. Casual, warm, human.
Use contractions (I've, don't, it's). Use informal transitions ("honestly", "the thing is", "here's what gets me").
Can include a light rhetorical question. Keep it flowing and natural.
Pattern: "Honestly [Name], this hits home. I've been thinking about [topic] a lot lately and [casual observation]. What's been your take on [specific aspect]?"`
    };

    // ── GOAL: specific behavioral instructions per goal ──
    const goalInstructions: Record<string, string> = {
        'AddValue': `GOAL = "Add Value"
YOUR MISSION: Contribute something genuinely USEFUL that wasn't in the original post. Zero self-promotion.
You must add ONE of: a complementary data point, a tactical tip, an alternative framework, a relevant resource, or an insight from adjacent experience.
The reader should think "That's a great point I hadn't considered."
DO NOT mention yourself, your company, or anything self-serving.`,

        'ShareExperience': `GOAL = "Share Experience"
YOUR MISSION: Tell a brief, specific personal story that adds perspective to their point.
Your story MUST include at least 2 of: a specific timeframe, a named company/person/event, a measurable outcome, a concrete lesson learned.
Pattern: "When I [specific experience], I learned that [specific insight]. The result was [specific outcome]."
The story must DIRECTLY relate to the post's topic.`,

        'AskQuestion': `GOAL = "Ask Question"
YOUR MISSION: Deepen the discussion by asking a genuinely thought-provoking question the author hasn't addressed.
Your question should make the author AND other readers stop and think. It should NOT be answerable with yes/no.
Pattern: Briefly reference what they said, then ask something that extends the conversation into new territory.
The question should reveal YOUR expertise through what you choose to ask about.`,

        'DifferentPerspective': `GOAL = "Different Perspective"
YOUR MISSION: Respectfully challenge or add important nuance. You are NOT here to agree.
Present a specific counterpoint backed by evidence or reasoning. Be constructive, not combative.
Pattern: "I'd add one nuance here - [your counterpoint]. In [context], I've seen [different outcome] because [reasoning]."
Make the reader think "That's a fair point" even if they initially disagreed.`,

        'BuildRelationship': `GOAL = "Build Relationship"
YOUR MISSION: Warm, supportive engagement that makes the author feel seen and valued.
Reference something SPECIFIC about their journey, growth, or perspective that shows you pay attention.
Pattern: "[Name], the way you framed [specific point] really captures something most people miss. [Add personal connection or genuine observation]."
Feel like a trusted peer, not a fan.`,

        'SubtlePitch': `GOAL = "Subtle Pitch"
YOUR MISSION: Position yourself strategically with a soft CTA. No hard selling.
Lead with genuine value first (80% of the comment). Then naturally mention your relevant expertise.
Pattern: "[Value-adding observation]. This is something I work on with [audience] - [soft CTA like 'happy to share the framework' or 'wrote about this recently']."
The value must stand alone even without the CTA.`
    };

    // ── TONE: voice and personality instructions per tone ──
    const toneInstructions: Record<string, string> = {
        'Professional': `TONE = "Professional"
VOICE: Polished, formal, business-appropriate. Like a senior executive writing to peers.
Vocabulary: precise, measured, authoritative. No slang, no casual phrases.
Sentence structure: well-constructed, grammatically impeccable.
Energy: calm confidence, not enthusiastic. Statements over exclamations.`,

        'Friendly': `TONE = "Friendly"
VOICE: Warm, conversational, approachable. Like a helpful colleague.
Use contractions naturally (I've, don't, that's). Occasional exclamation is OK.
Energy: genuinely warm but not over-the-top. Supportive without being sycophantic.
Feel: "This person seems really nice and smart."`,

        'ThoughtProvoking': `TONE = "Thought Provoking"
VOICE: Intellectual, contemplative, philosophical. Makes people pause and reflect.
Use conditional language: "What if...", "Consider that...", "The interesting tension here is..."
Energy: measured, deliberate. Every word chosen carefully.
Feel: "This person thinks deeply about things."`,

        'Supportive': `TONE = "Supportive"
VOICE: Encouraging, validating, positive. Champion the author's message.
Acknowledge their effort/insight specifically. Amplify what they said well.
Energy: warm enthusiasm but backed with substance (not just "great post!").
Feel: "This person genuinely cares and also knows their stuff."`,

        'Contrarian': `TONE = "Contrarian"
VOICE: Respectfully challenging, intellectually provocative, constructive disagreement.
Use "devil's advocate" framing. Push back with evidence, not attitude.
Energy: confident but not aggressive. Firm but fair.
Feel: "This person disagrees but makes a compelling case."`,

        'Humorous': `TONE = "Humorous"
VOICE: Light, witty, entertaining. Smart humor, not forced jokes.
Use observational humor, gentle irony, or clever wordplay related to the topic.
Energy: playful but still substantive underneath. The humor serves the point.
Feel: "This person is funny AND insightful."
IMPORTANT: Humor must fit the post's topic. Never joke about serious/sensitive topics.`
    };

    const selectedStyleInstr = styleInstructions[commentStyle] || styleInstructions['direct'];
    const selectedGoalInstr = goalInstructions[goal] || goalInstructions['AddValue'];
    const selectedToneInstr = toneInstructions[tone] || toneInstructions['Professional'];

    // Character limits
    const charLimits: Record<string, { max: number; target: string; words: string }> = {
        'Brief': { max: 100, target: '80-100', words: '15-20' },
        'Short': { max: 300, target: '250-300', words: '50-60' },
        'Mid': { max: 600, target: '500-600', words: '100-120' },
        'Long': { max: 900, target: '800-900', words: '150-180' }
    };
    const limit = charLimits[commentLength] || charLimits['Short'];

    // Build style training section if examples are provided
    let styleTrainingSection = '';
    if (styleExamples.length > 0) {
        styleTrainingSection = `
── VOICE REFERENCE EXAMPLES (VOICE ONLY - DO NOT copy their structure/format) ──
⚠️ IMPORTANT: These examples inform VOCABULARY, PERSONALITY, and WORD CHOICE only.
⚠️ The STYLE setting in the MANDATORY SETTINGS section below ALWAYS governs structure/format.
⚠️ If the examples are single paragraphs but STYLE = "Structured", you MUST still write 2-3 paragraphs with blank lines.

${styleExamples.map((ex, i) => `Example ${i + 1}: "${ex}"`).join('\n\n')}

Use their voice patterns (phrasing, energy, vocabulary) but follow the STYLE FORMAT exactly as instructed below.
`;
    }

    return `You are a LinkedIn comment ghostwriter. Write ONE comment on the post below.

── POST TO COMMENT ON ──
Author: ${authorName}
Content: ${postText}

── COMMENTER PROFILE ──
Expertise: ${userExpertise || 'General professional'}
Background: ${userBackground || 'Not specified'}
${styleTrainingSection}
══════════════════════════════════════════════════
PRE-ANALYSIS (Do this internally before writing)
══════════════════════════════════════════════════

Before writing, briefly analyze:
1. What is the MAIN POINT of this post? (1 sentence)
2. What SPECIFIC sentence, stat, or idea can I reference to prove I read it?
3. What UNIQUE angle can I add based on my expertise/background that isn't already in the post?

══════════════════════════════════════════════════
MANDATORY SETTINGS - FOLLOW EACH ONE EXACTLY
══════════════════════════════════════════════════

${selectedStyleInstr}

${selectedGoalInstr}

${selectedToneInstr}

── LENGTH ──
HARD MAXIMUM: ${limit.max} characters (${commentLength})
Target: ${limit.target} characters (~${limit.words} words)
${commentLength === 'Brief' ? 'Be extremely concise - one impactful sentence only.' : ''}

══════════════════════════════════════════════════
ENGAGEMENT RULES (NON-NEGOTIABLE)
══════════════════════════════════════════════════

1. REFERENCE RULE: Explicitly reference a specific sentence, stat, or idea from the post. The reader must SEE that you actually read the post. Quote or paraphrase a specific point.

2. VALUE RULE: Add something NEW - an insight, data point, experience, or question not already in the post. The reader should think "good point, I hadn't considered that."

3. HUMAN VOICE: Write like a real person, not a chatbot. Vary sentence lengths dramatically. Use natural phrasing and contractions.

4. NO EMOJIS: Zero emojis. None.

5. NO BANNED WORDS: Never use "curious", "intrigued", "fascinating", "insightful", "resonates", "love this", "game-changer", "deep dive", "unpack", "delve", "harness", "foster".

6. NO BANNED PUNCTUATION: No em dashes "—" or en dashes "–". Use commas, periods, or hyphens "-" instead.

7. NO GENERIC OPENERS: Never start with "Great post", "Thanks for sharing", "I agree", "Well said", "This is so true", "Love this". Start with substance.

8. AUTHOR NAME: Use ${authorName}'s first name naturally ONCE (not forced into every sentence).

9. LANGUAGE: Write in the SAME language as the original post. Non-negotiable.

10. PROSPECT RULE: For professional contexts, subtly demonstrate expertise through your added value. No hard selling. No "DM me". No "happy to chat".

══════════════════════════════════════════════════

Output ONLY the comment text. No labels, no quotes, no explanation.`;
}

/**
 * Generate prompt for post generation - Elite LinkedIn Content Strategy
 */
export function generatePostPrompt(
    topic: string,
    template: string,
    tone: string,
    length: string,
    includeHashtags: boolean,
    includeEmojis: boolean,
    targetAudience: string = '',
    keyMessage: string = '',
    userBackground: string = '',
    language: string = ''
): string {
    const postTypeMap: Record<string, string> = {
        'lead_magnet': 'Lead Magnet - Offer valuable free resource/download to capture leads',
        'thought_leadership': 'Thought Leadership - Share unique industry opinion, prediction, or controversial take',
        'personal_story': 'Personal Story - Vulnerable narrative with transformation and lesson learned',
        'question': 'Question/Poll - Spark discussion, debate, and diverse perspectives',
        'advice': 'Advice/Tips - Actionable list of insights, frameworks, or strategies',
        'insight': 'Industry Insight - News analysis, trend breakdown, or market commentary',
        'controversial': 'Controversial Opinion - Challenge widely-accepted beliefs or practices',
        'case_study': 'Case Study - Detailed results, transformation story, before/after',
        'announcement': 'Announcement - Share news, launch, or milestone',
        'achievement': 'Achievement - Share success or milestone with lessons',
        'tip': 'Pro Tip - Single actionable insight',
        'story': 'Story - Compelling narrative with lesson',
        'poll': 'Poll - Create engagement with options',
        'motivation': 'Motivation - Inspiring and empowering message',
        'how_to': 'How-To Guide - Step-by-step tutorial'
    };

    const toneMap: Record<string, string> = {
        'professional': 'Professional - Formal, polished, corporate-appropriate, authoritative',
        'friendly': 'Friendly - Warm, approachable, conversational, like talking to a colleague',
        'inspirational': 'Inspirational - Motivational, uplifting, encouraging, empowering',
        'bold': 'Bold/Provocative - Challenging, edgy, pushes boundaries, contrarian',
        'educational': 'Educational - Teaching-focused, informative, professor-like, methodical',
        'conversational': 'Conversational - Casual, relatable, everyday language, authentic',
        'authoritative': 'Authoritative - Expert, credible, backed by data and experience, confident',
        'humorous': 'Humorous - Light-hearted, entertaining, witty, uses tasteful humor',
        'casual': 'Casual - Relaxed and informal',
        'enthusiastic': 'Enthusiastic - Energetic and excited',
        'thoughtful': 'Thoughtful - Deep and reflective'
    };

    const postType = postTypeMap[template] || postTypeMap['advice'];
    const toneStyle = toneMap[tone] || toneMap['professional'];

    return `You are a LinkedIn ghostwriter optimized for the Q1 2026 LinkedIn algorithm. Write ONE post about the topic below.

══════════════════════════════════════════════════
🎯 LINKEDIN ALGORITHM Q1 2026 - KEY SIGNALS
══════════════════════════════════════════════════

The algorithm prioritizes these signals (in order of importance):
1. DWELL TIME - Keep readers engaged. Write content that rewards reading to the end.
2. SAVES/BOOKMARKS - Create "save-worthy" content: frameworks, checklists, insights people want to return to.
3. MEANINGFUL COMMENTS - End with questions that spark 15+ word responses, not "Great post!"
4. EARLY ENGAGEMENT - First hour performance is critical. Hook must stop the scroll.
5. NATIVE CONTENT - No external links in post body (kills reach by 50%+). Links go in comments.

⚠️ ANTI-GAMING DETECTION: LinkedIn's LLM actively suppresses AI-generated/generic content.

══════════════════════════════════════════════════
USER INPUTS
══════════════════════════════════════════════════

POST TYPE: ${postType}
TONE: ${toneStyle}
TOPIC: ${topic}
TARGET AUDIENCE: ${targetAudience || 'Professionals and business leaders'}
KEY MESSAGE/CTA: ${keyMessage || 'Engage with the content and share thoughts'}
AUTHOR BACKGROUND: ${userBackground || 'Not specified'}

══════════════════════════════════════════════════
POST STRUCTURE (Optimized for Dwell Time)
══════════════════════════════════════════════════

1. HOOK (first line): 4-8 words. Pattern-interrupt that forces "see more" click.
   - Use: bold claim, specific number, counterintuitive statement, or personal confession
   - AVOID: questions (save for CTA), generic statements, clickbait without payoff
   - Goal: Create curiosity gap in under 10 words

2. OPENING (lines 2-4): Bridge to body. Specific context before the fold (~150 chars).
   - Include: timeframe, situation, problem, or stakes
   - This determines if they keep reading after "see more"

3. BODY: Deliver substance that justifies the hook.
   - SHORT paragraphs (1-2 sentences max) - mobile optimization is critical
   - Blank line between EVERY paragraph
   - Include 2-3 SPECIFIC details: real numbers, names, dates, companies
   - For stories: concrete sensory details, not abstractions
   - For advice: actionable frameworks with numbered steps
   - For insights: cite specific data points or trends
   - Add "save-worthy" elements: frameworks, checklists, templates

4. CLOSING: One memorable takeaway line. Quotable. Screenshot-worthy.
   - This is what people save/bookmark

5. CTA: Ask a THOUGHT-PROVOKING question that requires genuine reflection.
   - GOOD: "What's one belief about [topic] you've had to unlearn?"
   - BAD: "Agree?" or "Thoughts?" or "What do you think?"
   - Goal: Generate 15+ word comments (algorithm loves these)

══════════════════════════════════════════════════
FORMATTING (Mobile-First)
══════════════════════════════════════════════════

CHARACTER COUNT: ⚠️ CRITICAL - Post MUST be ${Math.max(100, (parseInt(length) || 1200) - 200)}-${parseInt(length) || 1200} characters.
- Target: ${parseInt(length) || 1200} chars (~${Math.round((parseInt(length) || 1200) / 5)} words)
- Optimal for dwell time: 800-1500 chars
LINE BREAKS: One sentence per paragraph, blank line between each (crucial for mobile)
EMOJIS: ${includeEmojis ? 'Use 2-4 strategically. Never in hook. Use as visual anchors for scannability.' : 'NO emojis - zero allowed'}
HASHTAGS: ${includeHashtags ? 'Add 3-5 relevant hashtags at the VERY END after a blank line' : 'NO hashtags'}
LINKS: NEVER include URLs in the post body. They kill reach. Mention "link in comments" if needed.

══════════════════════════════════════════════════
AUTHENTICITY RULES (AI Detection Avoidance)
══════════════════════════════════════════════════

1. SPECIFICITY: Replace every vague claim with specifics.
   - NOT "many companies" → "3 of the 5 SaaS companies I've advised"
   - NOT "recently" → "last Tuesday at 3pm"
   - NOT "significant growth" → "47% increase in 6 weeks"

2. HUMAN VOICE: Write like texting a smart colleague, not a press release.
   - Vary sentence lengths dramatically (3 words. Then maybe twenty-five.)
   - Use contractions: I've, don't, it's, here's
   - Start sentences with "And" or "But" naturally
   - Include verbal tics: "honestly", "look", "here's the thing"

3. BANNED WORDS (instant AI detection flags):
   - "game-changer", "game changing", "unlock", "unlocking"
   - "leverage", "leveraging", "paradigm shift", "deep dive"
   - "resonate", "resonates", "navigate", "navigating"
   - "landscape", "realm", "embark", "tapestry", "synergy"
   - "utilize" (use "use"), "delve", "cutting-edge", "revolutionize"
   - "harness", "foster", "spearhead", "drive" (as verb for progress)

4. BANNED PUNCTUATION: No em dashes "—" or en dashes "–". Use commas, periods, or hyphens "-".

5. NO GENERIC STATEMENTS: Every sentence must pass: "Could someone who knows nothing about this topic write this?" If yes, rewrite with insider knowledge.

6. PERSONAL ANGLE: Include at least one first-person observation or experience.
   - "I noticed this when...", "In my experience...", "Last month I..."
   - Makes content feel authentic, not templated

${language ? `\n══════════════════════════════════════════════════\nLANGUAGE: Write the ENTIRE post in ${language}. Non-negotiable.\n══════════════════════════════════════════════════\n` : ''}
Output ONLY the post content. No labels, no explanation, no meta-commentary.`;
}

/**
 * Build profile context from LinkedIn profile data with token optimization
 * Limits the amount of data included to save tokens while preserving key information
 */
export function buildProfileContext(profileData: {
    name?: string | null;
    headline?: string | null;
    about?: string | null;
    posts?: string[];
    experience?: string[];
    education?: string[];
    skills?: string[];
    language?: string | null;
}, options: {
    maxPostsChars?: number;
    maxExperienceItems?: number;
    includeSkills?: boolean;
} = {}): string {
    const {
        maxPostsChars = 3000,
        maxExperienceItems = 3,
        includeSkills = true
    } = options;

    let context = '';

    // Basic profile info (always include - minimal tokens)
    if (profileData.name || profileData.headline) {
        context += `\n══════════════════════════════════════════════════\nAUTHOR PROFILE (for authentic voice matching)\n══════════════════════════════════════════════════\n`;
        if (profileData.name) {
            context += `Name: ${profileData.name}\n`;
        }
        if (profileData.headline) {
            context += `Headline: ${profileData.headline}\n`;
        }
    }

    // About section (token-limited)
    if (profileData.about && profileData.about.length > 0) {
        const aboutLimit = 500; // Limit about section to 500 chars
        const truncatedAbout = profileData.about.length > aboutLimit
            ? profileData.about.substring(0, aboutLimit) + '...'
            : profileData.about;
        context += `\nAbout: ${truncatedAbout}\n`;
    }

    // Experience (limited items, truncated content)
    if (profileData.experience && profileData.experience.length > 0) {
        const limitedExp = profileData.experience.slice(0, maxExperienceItems);
        context += `\nExperience:\n`;
        limitedExp.forEach((exp, i) => {
            const expLimit = 200;
            const truncatedExp = exp.length > expLimit ? exp.substring(0, expLimit) + '...' : exp;
            context += `  ${i + 1}. ${truncatedExp}\n`;
        });
    }

    // Skills (if enabled)
    if (includeSkills && profileData.skills && profileData.skills.length > 0) {
        const skillsLimit = 10;
        const limitedSkills = profileData.skills.slice(0, skillsLimit);
        context += `\nSkills: ${limitedSkills.join(', ')}\n`;
    }

    // Posts (token-limited - most important for voice matching)
    if (profileData.posts && profileData.posts.length > 0) {
        let postsContent = '';
        let currentChars = 0;

        // Take posts in order (most recent first), stop when we hit the limit
        for (const post of profileData.posts) {
            if (currentChars + post.length > maxPostsChars) {
                // If we can't fit the full post, add a truncated version
                const remaining = maxPostsChars - currentChars;
                if (remaining > 100) {
                    postsContent += post.substring(0, remaining) + '...\n';
                }
                break;
            }
            postsContent += post + '\n';
            currentChars += post.length + 1;
        }

        if (postsContent) {
            context += `\n══════════════════════════════════════════════════\nPOSTS BY THIS AUTHOR (for voice/style reference)\n══════════════════════════════════════════════════\n`;
            context += postsContent;
        }
    }

    return context;
}

/**
 * Generate post prompt with LinkedIn profile data integrated
 */
export function generatePostPromptWithProfile(
    topic: string,
    template: string,
    tone: string,
    length: string,
    includeHashtags: boolean,
    includeEmojis: boolean,
    targetAudience: string = '',
    keyMessage: string = '',
    userBackground: string = '',
    language: string = '',
    profileData: {
        name?: string | null;
        headline?: string | null;
        about?: string | null;
        posts?: string[];
        experience?: string[];
        education?: string[];
        skills?: string[];
        language?: string | null;
    } | null = null
): string {
    // Generate base prompt
    const basePrompt = generatePostPrompt(
        topic, template, tone, length, includeHashtags, includeEmojis,
        targetAudience, keyMessage, userBackground, language
    );

    // Add profile context if available
    if (profileData) {
        const profileContext = buildProfileContext(profileData, {
            maxPostsChars: 3000,
            maxExperienceItems: 3,
            includeSkills: true
        });

        // Insert profile context before the structure section
        const insertPoint = basePrompt.indexOf('══════════════════════════════════════════════════\nPOST STRUCTURE');

        if (insertPoint > -1) {
            return basePrompt.substring(0, insertPoint) +
                profileContext +
                basePrompt.substring(insertPoint);
        }
    }

    return basePrompt;
}

/**
 * Fallback comments when AI fails
 */
export function getFallbackComment(tone: string): string {
    const fallbacks: Record<string, string> = {
        'Supportive': 'Great insights! Thanks for sharing this.',
        'Gracious': 'Thank you for sharing this valuable perspective!',
        'Polite': 'This is very interesting. Thank you for posting.',
        'Witty': 'Love this! Great point.',
        'Excited': 'This is amazing! Thanks for sharing!',
        'RespectfullyOpposed': 'Interesting perspective. I see it slightly differently, but appreciate the discussion.'
    };

    return fallbacks[tone] || 'Thanks for sharing this!';
}

```

---

### openai-service.ts

```typescript
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

```

---

### openrouter-service.ts

```typescript
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
      console.warn(`⚠️ Model ID ${modelId} does not match known provider patterns`);
    }
    return isValid;
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

```

---

### prisma.ts

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

```

---

### referral-utils.ts

```typescript
import crypto from 'crypto';

/**
 * Generate a unique, crypto-safe referral code (#34, #35)
 * Shared utility used by both registration and Clerk webhook flows
 */
export function generateReferralCode(userId: string): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(crypto.randomInt(chars.length));
    }
    return code + userId.slice(-4).toUpperCase();
}

```

---

### user-service.ts

```typescript
import { hashPassword, comparePassword } from './auth';
import { prisma } from '@/lib/prisma';

// #21: User interface now matches Prisma schema field names (monthly* instead of daily*)
export interface User {
  id: string;
  email: string;
  name: string | null;
  password: string;
  createdAt: Date;
  plan: {
    id: string;
    name: string;
    price: number;
    monthlyComments: number;
    monthlyLikes: number;
    monthlyShares: number;
    monthlyFollows: number;
    monthlyConnections: number;
    aiPostsPerMonth: number;
    aiCommentsPerMonth: number;
    aiTopicLinesPerMonth: number;
    allowAiPostGeneration: boolean;
    allowAiCommentGeneration: boolean;
    allowAiTopicLines: boolean;
    allowPostScheduling: boolean;
    allowAutomation: boolean;
    allowAutomationScheduling: boolean;
    allowNetworking: boolean;
    allowNetworkScheduling: boolean;
    allowCsvExport: boolean;
    allowImportProfiles: boolean;
    monthlyImportCredits: number;
  } | null;
}

// #24: User without password — for API responses
export type UserWithoutPassword = Omit<User, 'password'>;

export class UserService {

  async getAllUsers(): Promise<UserWithoutPassword[]> {
    try {
      const dbUsers = await prisma.user.findMany({
        include: { plan: true },
        orderBy: { createdAt: 'desc' },
      });
      // #24: Strip passwords before returning
      return dbUsers.map(({ password, ...user }) => user) as unknown as UserWithoutPassword[];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: { plan: true },
      });
      return user as unknown as User;
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }

  async createUser(
    email: string,
    password: string,
    name: string,
    options?: { referralCode?: string; referredById?: string | null }
  ): Promise<User> {
    const hashedPassword = await hashPassword(password);
    // #23: Replace deprecated substr() with substring()
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    try {
      // First, check if there's a trial plan available
      const trialPlan = await prisma.plan.findFirst({
        where: { isTrialPlan: true }
      });

      let planData: any;
      let trialEndsAt: Date | null = null;

      if (trialPlan) {
        // Assign trial plan with expiry date
        trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + trialPlan.trialDurationDays);

        planData = {
          connect: { id: trialPlan.id }
        };
      } else {
        // Fallback to Free plan if no trial plan exists
        planData = {
          connectOrCreate: {
            where: { name: 'Free' },
            create: {
              name: 'Free',
              price: 0,
              isDefaultFreePlan: true,
              monthlyComments: 300,
              monthlyLikes: 600,
              monthlyShares: 150,
              monthlyFollows: 300,
              monthlyConnections: 150,
              aiPostsPerMonth: 60,
              aiCommentsPerMonth: 300,
              aiTopicLinesPerMonth: 60,
              monthlyImportCredits: 50,
              allowAiTopicLines: true,
              allowAiPostGeneration: true,
              allowAiCommentGeneration: true,
              allowPostScheduling: false,
              allowAutomation: true,
              allowAutomationScheduling: false,
              allowNetworking: false,
              allowNetworkScheduling: false,
              allowCsvExport: false,
              allowImportProfiles: false,
            } as any
          }
        };
      }

      const dbUser = await prisma.user.create({
        data: {
          id: userId,
          email,
          name,
          password: hashedPassword,
          trialEndsAt,
          plan: planData,
          referralCode: options?.referralCode,
          referredById: options?.referredById
        } as any,
        include: { plan: true },
      });

      return dbUser as unknown as User;
    } catch (error) {
      console.error('Database error during user creation:', error);
      throw new Error('Failed to create user in database: ' + (error as Error).message);
    }
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findUserByEmail(email);
    if (!user) return null;

    const isValid = await comparePassword(password, user.password);
    if (!isValid) return null;

    return user;
  }
}

export const userService = new UserService();

```

---

