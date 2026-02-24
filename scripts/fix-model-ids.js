/**
 * Fix model IDs in database from z.ai to z-ai format
 * Run with: node scripts/fix-model-ids.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixModelIds() {
  console.log('🔧 Fixing model IDs in database...\n');
  
  try {
    // Fix AIModel table
    const aiModelUpdates = await prisma.aIModel.updateMany({
      where: {
        modelId: { startsWith: 'z.ai/' }
      },
      data: {
        modelId: {
          // Replace z.ai/ with z-ai/
          set: prisma.raw(`REPLACE(modelId, 'z.ai/', 'z-ai/')`)
        }
      }
    });
    console.log(`✅ Updated ${aiModelUpdates.count} AIModel records`);
    
    // Fix UserAIModelSettings table - commentModelId
    const commentModelUpdates = await prisma.userAIModelSettings.updateMany({
      where: {
        commentModelId: { startsWith: 'z.ai/' }
      },
      data: {
        commentModelId: prisma.raw(`REPLACE(commentModelId, 'z.ai/', 'z-ai/')`)
      }
    });
    console.log(`✅ Updated ${commentModelUpdates.count} UserAIModelSettings.commentModelId records`);
    
    // Fix UserAIModelSettings table - postModelId
    const postModelUpdates = await prisma.userAIModelSettings.updateMany({
      where: {
        postModelId: { startsWith: 'z.ai/' }
      },
      data: {
        postModelId: prisma.raw(`REPLACE(postModelId, 'z.ai/', 'z-ai/')`)
      }
    });
    console.log(`✅ Updated ${postModelUpdates.count} UserAIModelSettings.postModelId records`);
    
    // Fix UserAIModelSettings table - topicModelId
    const topicModelUpdates = await prisma.userAIModelSettings.updateMany({
      where: {
        topicModelId: { startsWith: 'z.ai/' }
      },
      data: {
        topicModelId: prisma.raw(`REPLACE(topicModelId, 'z.ai/', 'z-ai/')`)
      }
    });
    console.log(`✅ Updated ${topicModelUpdates.count} UserAIModelSettings.topicModelId records`);
    
    // Fix UserAIModelSettings table - fallbackModelId
    const fallbackModelUpdates = await prisma.userAIModelSettings.updateMany({
      where: {
        fallbackModelId: { startsWith: 'z.ai/' }
      },
      data: {
        fallbackModelId: prisma.raw(`REPLACE(fallbackModelId, 'z.ai/', 'z-ai/')`)
      }
    });
    console.log(`✅ Updated ${fallbackModelUpdates.count} UserAIModelSettings.fallbackModelId records`);
    
    // Fix AIModelUsage table
    const usageUpdates = await prisma.aIModelUsage.updateMany({
      where: {
        modelId: { startsWith: 'z.ai/' }
      },
      data: {
        modelId: prisma.raw(`REPLACE(modelId, 'z.ai/', 'z-ai/')`)
      }
    });
    console.log(`✅ Updated ${usageUpdates.count} AIModelUsage records`);
    
    console.log('\n✅ All model IDs fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing model IDs:', error);
    
    // Fallback: Use raw SQL for databases that don't support prisma.raw in updateMany
    console.log('\nTrying raw SQL approach...');
    
    try {
      // Raw SQL for PostgreSQL
      await prisma.$executeRaw`UPDATE "AIModel" SET "modelId" = REPLACE("modelId", 'z.ai/', 'z-ai/') WHERE "modelId" LIKE 'z.ai/%'`;
      await prisma.$executeRaw`UPDATE "UserAIModelSettings" SET "commentModelId" = REPLACE("commentModelId", 'z.ai/', 'z-ai/') WHERE "commentModelId" LIKE 'z.ai/%'`;
      await prisma.$executeRaw`UPDATE "UserAIModelSettings" SET "postModelId" = REPLACE("postModelId", 'z.ai/', 'z-ai/') WHERE "postModelId" LIKE 'z.ai/%'`;
      await prisma.$executeRaw`UPDATE "UserAIModelSettings" SET "topicModelId" = REPLACE("topicModelId", 'z.ai/', 'z-ai/') WHERE "topicModelId" LIKE 'z.ai/%'`;
      await prisma.$executeRaw`UPDATE "UserAIModelSettings" SET "fallbackModelId" = REPLACE("fallbackModelId", 'z.ai/', 'z-ai/') WHERE "fallbackModelId" LIKE 'z.ai/%'`;
      await prisma.$executeRaw`UPDATE "AIModelUsage" SET "modelId" = REPLACE("modelId", 'z.ai/', 'z-ai/') WHERE "modelId" LIKE 'z.ai/%'`;
      console.log('✅ Fixed via raw SQL');
    } catch (sqlError) {
      console.error('❌ Raw SQL also failed:', sqlError);
    }
  } finally {
    await prisma.$disconnect();
  }
}

fixModelIds();
