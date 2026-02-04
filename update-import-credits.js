const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateImportCredits() {
  try {
    console.log('Updating existing plans with import credits...');
    
    // Update plans with import credits based on plan type
    const plans = await prisma.plan.findMany();
    
    for (const plan of plans) {
      let importCredits = 100; // Default
      
      // Assign based on plan name or price
      if (plan.name.toLowerCase().includes('free')) {
        importCredits = 50;
      } else if (plan.name.toLowerCase().includes('pro')) {
        importCredits = 200;
      } else if (plan.name.toLowerCase().includes('business') || plan.name.toLowerCase().includes('premium')) {
        importCredits = 500;
      } else if (plan.name.toLowerCase().includes('enterprise')) {
        importCredits = 1000;
      }
      
      await prisma.plan.update({
        where: { id: plan.id },
        data: { monthlyImportCredits: importCredits }
      });
      
      console.log(`Updated ${plan.name}: ${importCredits} import credits`);
    }
    
    console.log('✅ All plans updated successfully');
  } catch (error) {
    console.error('❌ Error updating plans:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateImportCredits();
