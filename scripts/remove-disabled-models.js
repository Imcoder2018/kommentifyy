// Remove all disabled models from database
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function removeDisabledModels() {
  console.log('🗑️ Removing all disabled models from database...\n');

  // Get all disabled models
  const disabledModels = await prisma.aIModel.findMany({
    where: { isEnabled: false },
    select: { id: true, name: true, modelId: true }
  });

  console.log(`Found ${disabledModels.length} disabled models to remove\n`);

  if (disabledModels.length === 0) {
    console.log('✅ No disabled models found');
    return;
  }

  // Delete all disabled models
  for (const model of disabledModels) {
    await prisma.aIModel.delete({
      where: { id: model.id }
    });
    console.log(`  🗑️ Deleted: ${model.name} (${model.modelId})`);
  }

  // Show final count
  const remainingModels = await prisma.aIModel.findMany();
  const enabledModels = remainingModels.filter(m => m.isEnabled);

  console.log(`\n📊 Summary:`);
  console.log(`   Deleted: ${disabledModels.length}`);
  console.log(`   Remaining: ${remainingModels.length}`);
  console.log(`   Enabled: ${enabledModels.length}`);

  console.log('\n📋 Remaining enabled models:');
  for (const model of enabledModels) {
    console.log(`  ✅ ${model.provider}: ${model.name} (${model.modelId})`);
  }
}

removeDisabledModels()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
