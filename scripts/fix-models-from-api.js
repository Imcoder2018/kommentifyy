// Fix database models based on actual OpenRouter API response
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Check if valid-models.json exists
const validModelsPath = path.join(__dirname, '..', 'valid-models.json');
if (!fs.existsSync(validModelsPath)) {
  console.error('❌ Error: valid-models.json not found!');
  console.log('   Run: node scripts/fetch-openrouter-models.js first to fetch valid models');
  process.exit(1);
}

const validModels = require(validModelsPath);

const prisma = new PrismaClient();

// Map invalid database models to valid OpenRouter models
const MODEL_REPLACEMENTS = {
  'google/gemini-3-pro': 'google/gemini-3-pro-preview',
  'z-ai/glm-4-plus': 'z-ai/glm-4.7',
  'z-ai/glm-4-flash': 'z-ai/glm-4.7-flash',
  'x-ai/grok-4.1-thinking': 'x-ai/grok-4',
  'x-ai/grok-4.1': 'x-ai/grok-4',
  'x-ai/grok-beta': 'x-ai/grok-3-beta',
  'google/gemini-2.0-flash-exp': 'google/gemini-2.5-flash',
  'perplexity/llama-3.1-sonar-large-128k-online': 'perplexity/sonar-pro',
  'mistralai/devstral-2-2512': 'mistralai/devstral-2512',
};

async function fixModels() {
  console.log('🔧 Fixing database models based on actual OpenRouter API...\n');
  console.log(`Valid models from OpenRouter: ${validModels.length}\n`);

  const dbModels = await prisma.aIModel.findMany({
    select: { modelId: true, name: true, isEnabled: true, provider: true }
  });

  console.log(`Database models: ${dbModels.length}\n`);

  // Find invalid enabled models
  const invalidModels = dbModels.filter(m => m.isEnabled && !validModels.includes(m.modelId));
  
  console.log(`❌ Invalid enabled models: ${invalidModels.length}\n`);

  if (invalidModels.length > 0) {
    console.log('Invalid models to fix:');
    for (const model of invalidModels) {
      const replacement = MODEL_REPLACEMENTS[model.modelId];
      console.log(`  ${model.modelId} -> ${replacement || 'DISABLE'}`);
    }

    console.log('\nApplying fixes...');
    
    // First, disable all invalid models
    for (const model of invalidModels) {
      await prisma.aIModel.update({
        where: { modelId: model.modelId },
        data: { isEnabled: false }
      });
      console.log(`  ✗ Disabled: ${model.modelId}`);
    }
    
    // Then, check if replacement models exist, if not create them
    for (const [invalidId, validId] of Object.entries(MODEL_REPLACEMENTS)) {
      if (!validModels.includes(validId)) continue;
      
      const existing = dbModels.find(m => m.modelId === validId);
      const invalidModel = invalidModels.find(m => m.modelId === invalidId);
      
      if (existing) {
        // Enable the existing valid model
        await prisma.aIModel.update({
          where: { modelId: validId },
          data: { isEnabled: true }
        });
        console.log(`  ✓ Enabled existing: ${validId}`);
      } else if (invalidModel) {
        // Create new model with valid ID
        await prisma.aIModel.create({
          data: {
            modelId: validId,
            name: invalidModel.name,
            provider: invalidModel.provider,
            isEnabled: true,
            isFeatured: false,
            description: `Migrated from ${invalidId}`,
            inputCostPer1M: 0,
            outputCostPer1M: 0,
            maxContextTokens: 128000,
            maxOutputTokens: 4096,
          }
        });
        console.log(`  ✓ Created: ${validId}`);
      }
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
    console.log(`  ${isValid ? '✅' : '❌'} ${model.provider}: ${model.modelId}`);
  }

  console.log(`\nTotal enabled: ${enabledModels.length}`);
  console.log(`Valid enabled: ${enabledModels.filter(m => validModels.includes(m.modelId)).length}`);
}

fixModels()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
