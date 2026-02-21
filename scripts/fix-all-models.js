// Comprehensive fix for all AI model IDs in database
// Uses actual valid model IDs from OpenRouter API
const { PrismaClient } = require('@prisma/client');
const validModels = require('../valid-models.json');

const prisma = new PrismaClient();

// Mapping of database names to correct OpenRouter model IDs
const CORRECT_MODEL_IDS = {
  // GLM models - zhipu provider
  'GLM 4.7': 'z-ai/glm-4.7',
  'GLM 4 Plus': 'z-ai/glm-4.5',
  'GLM 4 Flash': 'z-ai/glm-4.5-air:free',
  
  // Google models
  'Gemini 3 Pro': 'google/gemini-3-pro-preview',
  'Gemini 3 Flash Preview': 'google/gemini-3-flash-preview',
  'Gemini 2.5 Pro': 'google/gemini-2.5-pro',
  'Gemini 2.5 Flash': 'google/gemini-2.5-flash',
  'Gemma 2 27B IT': 'google/gemma-2-27b-it',
  'Gemma 2 9B IT': 'google/gemma-2-9b-it',
  
  // OpenAI models - use openai/ prefix for OpenRouter
  'GPT-4o Mini': 'openai/gpt-4o-mini',
  'GPT-4o': 'openai/gpt-4o',
  'GPT-4 Turbo': 'openai/gpt-4-turbo',
  'GPT-3.5 Turbo': 'openai/gpt-3.5-turbo',
  'GPT-5.2': 'openai/gpt-5.2',
  'GPT-5.2 Pro': 'openai/gpt-5.2-pro',
  'GPT-5.3 Codex': 'openai/gpt-5.3-codex',
  'o1': 'openai/o1',
  'o1-mini': 'openai/o1-mini',
  
  // Anthropic models
  'Claude Opus 4.6': 'anthropic/claude-opus-4.6',
  'Claude Opus 4.5': 'anthropic/claude-opus-4.5',
  'Claude Sonnet 4.5': 'anthropic/claude-sonnet-4.5',
  'Claude Sonnet 4': 'anthropic/claude-sonnet-4',
  'Claude 3.5 Sonnet': 'anthropic/claude-3.5-sonnet',
  'Claude 3 Sonnet': 'anthropic/claude-3-sonnet',
  'Claude 3 Haiku': 'anthropic/claude-3-haiku',
  'Claude 3 Opus': 'anthropic/claude-3-opus',
  
  // xAI models
  'Grok 4.1': 'x-ai/grok-4',
  'Grok 4.1 Thinking': 'x-ai/grok-4',
  'Grok Beta': 'x-ai/grok-3-beta',
  
  // Meta models
  'Llama 3.3 70B Instruct': 'meta-llama/llama-3.3-70b-instruct',
  'Llama 3.1 70B Instruct': 'meta-llama/llama-3.1-70b-instruct',
  'Llama 3.1 8B Instruct': 'meta-llama/llama-3.1-8b-instruct',
  'Llama 3.1 405B Instruct': 'meta-llama/llama-3.1-405b-instruct',
  'Llama 3.2 11B Vision': 'meta-llama/llama-3.2-11b-vision-instruct',
  'Llama 3.2 90B Vision': 'meta-llama/llama-3.2-90b-vision-instruct',
  
  // DeepSeek models
  'DeepSeek V3.2': 'deepseek/deepseek-v3.2',
  'DeepSeek V3': 'deepseek/deepseek-v3',
  'DeepSeek R1': 'deepseek/deepseek-r1',
  'DeepSeek Coder V2': 'deepseek/deepseek-coder-v2',
  'DeepSeek V3.1 Nex-N1': 'deepseek/deepseek-v3.1-nex-n1',
  
  // Perplexity models
  'Sonar Pro': 'perplexity/sonar-pro',
  'Sonar': 'perplexity/sonar',
  'Llama 3.1 Sonar Large Online': 'perplexity/sonar-pro',
  
  // Mistral models
  'Devstral 2 2512': 'mistralai/devstral-2512',
  'Mistral Small': 'mistralai/mistral-small-3.1-24b-instruct',
  'Mixtral 8x7B Instruct': 'mistralai/mixtral-8x7b-instruct',
  'Mixtral 8x22B Instruct': 'mistralai/mixtral-8x22b-instruct',
  'Mistral Large 2': 'mistralai/mistral-large',
  'Mistral Medium': 'mistralai/mistral-medium-3',
  
  // Cohere models
  'Command': 'cohere/command-a',
  'Command R': 'cohere/command-r-08-2024',
  'Command R Plus': 'cohere/command-r-plus-08-2024',
  
  // Qwen models
  'Qwen 2.5 72B Instruct': 'qwen/qwen-2.5-72b-instruct',
  'Qwen 2.5 7B Instruct': 'qwen/qwen-2.5-7b-instruct',
  'Qwen 3 Coder': 'qwen/qwen-3-coder',
  'QwQ 32B Preview': 'qwen/qwq-32b-preview',
  
  // Microsoft models
  'Phi-4': 'microsoft/phi-4',
  'Phi-3.5 Mini 128K': 'microsoft/phi-3.5-mini-128k-instruct',
  'WizardLM 2 8x22B': 'microsoft/wizardlm-2-8x22b',
  'WizardLM 2 7B': 'microsoft/wizardlm-2-7b',
  
  // Other models
  'Hermes 3 Llama 70B': 'nousresearch/hermes-3-llama-3.1-70b',
  'Hermes 3 Llama 405B': 'nousresearch/hermes-3-llama-3.1-405b',
  'Dolphin Mixtral 8x7B': 'cognitivecomputations/dolphin-mixtral-8x7b',
  'Yi Large': '01-ai/yi-large',
  'Yi 34B Chat': '01-ai/yi-34b-chat',
  'Solar 10.7B Instruct': 'upstage/solar-10.7b-instruct',
  'Nemotron 3 Nano': 'nvidia/nemotron-3-nano',
  'Nemotron 4 340B Instruct': 'nvidia/nemotron-4-340b-instruct',
  'OpenChat 7B': 'openchat/openchat-7b',
  'OpenHermes 2.5 Mistral 7B': 'teknium/openhermes-2.5-mistral-7b',
  'MiniMax M2.1': 'minimax/minimax-m2.1',
};

// Models to disable (not in OpenRouter or invalid)
const MODELS_TO_DISABLE = [
  'MiMo-V2-Flash', 'Kimi K2.5 Agent', 'Kimi Dev 72B', 'Seed 1.6',
  'Arctic Instruct', 'Pi', 'Mythalion 13B', 'MythoMax L2 13B',
  'Noromaid Mixtral 8x7B', 'OLMo 2 32B Instruct', 'OLMo 3.1 32B Think',
  'Fimbulvetr 11B V2', 'StripedHyena Nous 7B', 'Toppy M 7B',
  'Zephyr 7B Beta', 'Dolly V2 12B', 'Falcon 7B Instruct',
  'Falcon 180B Chat', 'Neural Chat 7B', 'Persimmon 8B Chat',
  'Aether 1B', 'SDXL Turbo', 'GPT-5.3 Codex', 'o1-mini',
  'Llama 3.2 90B Vision', 'DeepSeek V3', 'o1 (Reasoning)'
];

async function fixAllModels() {
  console.log('🔧 Comprehensive AI Model Fix\n');
  console.log(`Valid models from OpenRouter: ${validModels.length}\n`);

  const dbModels = await prisma.aIModel.findMany();
  console.log(`Database models: ${dbModels.length}\n`);

  // Step 1: Disable invalid models
  console.log('Step 1: Disabling invalid models...');
  for (const model of dbModels) {
    if (MODELS_TO_DISABLE.includes(model.name)) {
      await prisma.aIModel.update({
        where: { id: model.id },
        data: { isEnabled: false }
      });
      console.log(`  ❌ Disabled: ${model.name}`);
    }
  }

  // Step 2: Fix model IDs - handle duplicates
  console.log('\nStep 2: Fixing model IDs...');
  const processedIds = new Set();
  
  for (const model of dbModels) {
    const correctId = CORRECT_MODEL_IDS[model.name];
    
    if (!correctId) continue;
    if (model.modelId === correctId) {
      processedIds.add(correctId);
      continue;
    }
    if (!validModels.includes(correctId)) {
      console.log(`  ⚠️ Skip ${model.name}: ${correctId} not in OpenRouter`);
      continue;
    }
    
    // Check if we already processed this target modelId
    if (processedIds.has(correctId)) {
      // Disable duplicate
      await prisma.aIModel.update({
        where: { id: model.id },
        data: { isEnabled: false }
      });
      console.log(`  🔄 Disabled duplicate: ${model.name} (already have ${correctId})`);
      continue;
    }
    
    // Check if target modelId already exists in another record
    const existing = dbModels.find(m => m.modelId === correctId && m.id !== model.id);
    
    if (existing) {
      // Disable current model, enable existing one
      await prisma.aIModel.update({
        where: { id: model.id },
        data: { isEnabled: false }
      });
      await prisma.aIModel.update({
        where: { id: existing.id },
        data: { isEnabled: true }
      });
      console.log(`  🔄 Merged: ${model.name} -> using existing ${correctId}`);
    } else {
      // Update modelId
      await prisma.aIModel.update({
        where: { id: model.id },
        data: { modelId: correctId }
      });
      console.log(`  ✅ Fixed: ${model.name} -> ${correctId}`);
    }
    processedIds.add(correctId);
  }

  // Step 3: Disable models with invalid modelIds that weren't fixed
  console.log('\nStep 3: Disabling remaining invalid modelIds...');
  const updatedModels = await prisma.aIModel.findMany();
  for (const model of updatedModels) {
    if (!validModels.includes(model.modelId) && model.isEnabled) {
      await prisma.aIModel.update({
        where: { id: model.id },
        data: { isEnabled: false }
      });
      console.log(`  ❌ Disabled invalid: ${model.name} (${model.modelId})`);
    }
  }

  // Show final enabled models
  console.log('\n📋 Final enabled models:');
  const enabledModels = await prisma.aIModel.findMany({
    where: { isEnabled: true },
    select: { modelId: true, name: true, provider: true },
    orderBy: { provider: 'asc' }
  });

  for (const model of enabledModels) {
    const isValid = validModels.includes(model.modelId);
    console.log(`  ${isValid ? '✅' : '❌'} ${model.provider}: ${model.name} (${model.modelId})`);
  }

  console.log(`\n📊 Total enabled: ${enabledModels.length}`);
  console.log(`📊 Valid enabled: ${enabledModels.filter(m => validModels.includes(m.modelId)).length}`);
}

fixAllModels()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
