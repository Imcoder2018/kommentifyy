// Script to check and fix invalid AI model IDs in the database
// Run with: node scripts/fix-ai-models.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Mapping of invalid model IDs to valid OpenRouter model IDs
const MODEL_FIXES = {
  'z.ai/glm-4.7': 'z-ai/glm-4-flash',  // Use z-ai prefix
  'google/gemini-3-pro': 'google/gemini-2.5-pro',
  'google/gemini-3-pro-preview': 'google/gemini-2.5-pro',
  'google/gemini-3-flash': 'google/gemini-2.0-flash',
  'x-ai/grok-4.1-thinking': 'x-ai/grok-4',
  'x-ai/grok-4.1-fast': 'x-ai/grok-4-fast',
  // Moonshot models
  'moonshot/kimi-2.5-agent': 'moonshot/kimi-2.5-flash',
  'moonshot/kimi-dev-72b': 'moonshot/kimi-2.5-flash',
  // Xiaomi
  'xiaomi/mimo-v2-flash': 'xiaomi/xiaomi-mimo-2-flash',
  // ByteDance
  'bytedance/seed-1.6': 'bytedance/seed-1.6-flash',
  // AllenAI
  'allenai/olmo-3.1-32b-think': 'deepseek/deepseek-chat',
  'allenai/olmo-2-32b-instruct': 'deepseek/deepseek-chat',
  // Z-ai models
  'z.ai/glm-4-flash': 'z-ai/glm-4-flash',
  'z.ai/glm-4-plus': 'z-ai/glm-4-plus',
  // Stability AI
  'stability-ai/sdxl-turbo': 'stability-ai/stable-diffusion-3-medium',
  // Intel
  'intel/neural-chat-7b': 'intel/intel-neural-chat-7b',
  // Together models
  'togethercomputer/stripedhyena-nous-7b': 'togethercomputer/stripedhyena-7b',
  // Undi95
  'undi95/toppy-m-7b': 'undi95/toppy-m-7b',
  // Databricks
  'databricks/dolly-v2-12b': 'databricks/dolly-v2-12b',
  // Sao10k
  'sao10k/fimbulvetr-11b-v2': 'sao10k/fimbulvetr-11b',
  // Inflection
  'inflection/pi': 'inflection/inflection-3',
  // HuggingFace
  'huggingfaceh4/zephyr-7b-beta': 'huggingface/zephyr-7b-beta',
  // NeverSleep
  'neversleep/noromaid-mixtral-8x7b-instruct': 'neversleep/noromaid-8x7b',
  // Gryphe
  'gryphe/mythomax-l2-13b': 'gryphe/mythomax-13b',
  // Pygmalion
  'pygmalion-ai/mythalion-13b': 'pygmalionai/mythalion-13b',
  // Snowflake
  'snowflake/arctic-instruct': 'snowflake/snowflake-arctic-instruct',
  // Falcon
  'tiiuae/falcon-180b-chat': 'tiiuae/falcon-180b',
  'tiiuae/falcon-7b-instruct': 'tiiuae/falcon-7b',
  // Aether
  'aether/aether-1b': 'aether/aether-1b',
};

// Models that should use OpenAI API directly (not OpenRouter)
const OPENAI_DIRECT_MODELS = [
  'gpt-5.2', 'gpt-5.3-codex', 'gpt-5.2-pro', 'gpt-4o', 'gpt-4o-mini',
  'gpt-3.5-turbo', 'gpt-4-turbo', 'o1', 'o1-mini'
];

// Valid prefixes for OpenRouter models (including less common ones)
const VALID_PREFIXES = [
  'openai/', 'anthropic/', 'google/', 'meta-llama/', 'mistralai/',
  'deepseek/', 'qwen/', 'microsoft/', 'nousresearch/', 'cognitivecomputations/',
  'perplexity/', 'x-ai/', '01-ai/', 'cohere/', 'nvidia/', 'adept/', 'fireworks/',
  'anyscale/', 'leptonai/', 'sglang/', 'hyper/', 'togetherai/', 'replicate/',
  'ai21/', 'voyage/', 'jamba/', 'minimax/', 'abacusai/', 'lightonai/',
  'volcengine/', 'baichuan/', 'yi/', 'infinite/', 'openchat/', 'lmsys/',
  'mlc-ai/', 'samba-', 'starling/', 'teknium/', 'upstage/', 'vllm/',
  'yandex/', 'zhipuai/', 'z-ai/', 'moonshot/', 'bytedance/', 'xiaomi/',
  'allenai/', 'stability-ai/', 'aether/', 'intel/', 'togethercomputer/',
  'undi95/', 'databricks/', 'sao10k/', 'inflection/', 'huggingfaceh4/',
  'neversleep/', 'gryphe/', 'pygmalion-ai/', 'snowflake/', 'tiiuae/', 'huggingface/'
];

function isValidModelId(modelId) {
  // OpenAI direct models (gpt-*, o1-*, o3-*) are valid even without slash
  if (modelId.startsWith('gpt-') || modelId.startsWith('o1') || modelId.startsWith('o3')) {
    return true;
  }
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

  const invalidModels = [];
  const validModels = [];

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
