/**
 * Fix model IDs in database from z.ai to z-ai format
 * Run with: node scripts/fix-model-ids.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixModelIds() {
  console.log('🔧 Fixing model IDs in database...\n');

  try {
    // Fix AIModel table - use raw SQL directly
    await prisma.$executeRaw`UPDATE "AIModel" SET "modelId" = REPLACE("modelId", 'z.ai/', 'z-ai/') WHERE "modelId" LIKE 'z.ai/%'`;
    console.log('✅ Updated AIModel records');

    // Fix UserAIModelSettings table - commentModelId
    await prisma.$executeRaw`UPDATE "UserAIModelSettings" SET "commentModelId" = REPLACE("commentModelId", 'z.ai/', 'z-ai/') WHERE "commentModelId" LIKE 'z.ai/%'`;
    console.log('✅ Updated UserAIModelSettings.commentModelId records');

    // Fix UserAIModelSettings table - postModelId
    await prisma.$executeRaw`UPDATE "UserAIModelSettings" SET "postModelId" = REPLACE("postModelId", 'z.ai/', 'z-ai/') WHERE "postModelId" LIKE 'z.ai/%'`;
    console.log('✅ Updated UserAIModelSettings.postModelId records');

    // Fix UserAIModelSettings table - topicModelId
    await prisma.$executeRaw`UPDATE "UserAIModelSettings" SET "topicModelId" = REPLACE("topicModelId", 'z.ai/', 'z-ai/') WHERE "topicModelId" LIKE 'z.ai/%'`;
    console.log('✅ Updated UserAIModelSettings.topicModelId records');

    // Fix UserAIModelSettings table - fallbackModelId
    await prisma.$executeRaw`UPDATE "UserAIModelSettings" SET "fallbackModelId" = REPLACE("fallbackModelId", 'z.ai/', 'z-ai/') WHERE "fallbackModelId" LIKE 'z.ai/%'`;
    console.log('✅ Updated UserAIModelSettings.fallbackModelId records');

    // Fix AIModelUsage table
    await prisma.$executeRaw`UPDATE "AIModelUsage" SET "modelId" = REPLACE("modelId", 'z.ai/', 'z-ai/') WHERE "modelId" LIKE 'z.ai/%'`;
    console.log('✅ Updated AIModelUsage records');

    console.log('\n✅ All model IDs fixed successfully!');

  } catch (error) {
    console.error('❌ Error fixing model IDs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixModelIds();
