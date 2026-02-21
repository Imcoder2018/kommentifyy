// Script to check and fix invalid AI model IDs in the database
// Run with: npx ts-node scripts/fix-ai-models.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapping of invalid model IDs to valid OpenRouter model IDs
const MODEL_FIXES: Record<string, string> = {
  'z.ai/glm-4.7': 'google/gemini-2.0-flash-exp',
  'google/gemini-3-pro': 'google/gemini-2.5-pro',
  'google/gemini-3-pro-preview': 'google/gemini-2.5-pro',
  'google/gemini-3-flash': 'google/gemini-2.0-flash',
  'x-ai/grok-4.1-thinking': 'x-ai/grok-4',
  'x-ai/grok-4.1-fast': 'x-ai/grok-4-fast',
};

// Valid prefixes for OpenRouter models
const VALID_PREFIXES = [
  'openai/', 'anthropic/', 'google/', 'meta-llama/', 'mistralai/',
  'deepseek/', 'qwen/', 'microsoft/', 'nousresearch/', 'cognitivecomputations/',
  'perplexity/', 'x-ai/', '01-ai/', 'cohere/', 'nvidia/', 'adept/', 'fireworks/',
  'anyscale/', 'leptonai/', 'sglang/', 'hyper/', 'togetherai/', 'replicate/',
  'ai21/', 'voyage/', 'jamba/', 'minimax/', 'abacusai/', 'lightonai/',
  'volcengine/', 'baichuan/', 'yi/', 'infinite/', 'openchat/', 'lmsys/',
  'mlc-ai/', 'samba-', 'starling/', 'teknium/', 'upstage/', 'vllm/',
  'yandex/', 'zhipuai/', 'z-ai/'
];

function isValidModelId(modelId: string): boolean {
  if (!modelId.includes('/')) return false;
  const prefix = modelId.toLowerCase().split('/')[0] + '/';
  return VALID_PREFIXES.some(p => prefix.startsWith(p));
}

async function fixModels() {
  console.log('🔍 Checking all AI models in database...\n');

  const models = await prisma.aIModel.findMany({
    select: { modelId: true, name: true, isEnabled: true, provider: true }
  });

  console.log(`Found ${models.length} models in database\n`);

  const invalidModels: typeof models = [];
  const validModels: typeof models = [];

  // Categorize models
  for (const model of models) {
    if (isValidModelId(model.modelId)) {
      validModels.push(model);
    } else {
      invalidModels.push(model);
    }
  }

  console.log(`✅ Valid models: ${validModels.length}`);
  console.log(`❌ Invalid models: ${invalidModels.length}\n`);

  // Show invalid models
  if (invalidModels.length > 0) {
    console.log('Invalid model IDs:');
    for (const model of invalidModels) {
      console.log(`  - ${model.modelId} (${model.name}) - Enabled: ${model.isEnabled}`);
    }
    console.log('');

    // Apply fixes
    console.log('Applying fixes...');
    for (const model of invalidModels) {
      const fixedModelId = MODEL_FIXES[model.modelId];
      
      if (fixedModelId) {
        // Check if the fixed model exists in the database
        const fixedExists = models.find(m => m.modelId === fixedModelId);
        
        if (fixedExists) {
          // Disable the invalid model
          await prisma.aIModel.update({
            where: { modelId: model.modelId },
            data: { isEnabled: false }
          });
          console.log(`  ✓ Disabled invalid: ${model.modelId} -> will use: ${fixedModelId}`);
        } else {
          // Update to the fixed model ID
          await prisma.aIModel.update({
            where: { modelId: model.modelId },
            data: { modelId: fixedModelId, isEnabled: true }
          });
          console.log(`  ✓ Fixed: ${model.modelId} -> ${fixedModelId}`);
        }
      } else {
        // Just disable invalid models without fixes
        await prisma.aIModel.update({
          where: { modelId: model.modelId },
          data: { isEnabled: false }
        });
        console.log(`  ⚠️ Disabled (no fix available): ${model.modelId}`);
      }
    }
  }

  // Show enabled models for verification
  console.log('\n📋 Currently enabled models:');
  const enabledModels = await prisma.aIModel.findMany({
    where: { isEnabled: true },
    select: { modelId: true, name: true, provider: true },
    orderBy: { provider: 'asc' }
  });

  for (const model of enabledModels) {
    console.log(`  ${model.provider}: ${model.modelId}`);
  }

  console.log(`\nTotal enabled: ${enabledModels.length}`);
}

fixModels()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
