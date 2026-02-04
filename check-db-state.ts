import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCurrentState() {
  try {
    console.log('🔍 Checking current database state...\n');

    // Get all ApiUsage records
    const usageRecords = await prisma.apiUsage.findMany({
      orderBy: { date: 'desc' },
      take: 10
    });

    console.log('📊 Recent ApiUsage records:');
    usageRecords.forEach(record => {
      console.log(`\nUser: ${record.userId}`);
      console.log(`  Date: ${record.date.toISOString()}`);
      console.log(`  aiComments: ${record.aiComments}`);
      console.log(`  bonusAiComments: ${record.bonusAiComments}`);
      console.log(`  aiPosts: ${record.aiPosts}`);
    });

    // Get user with plan
    const user = await prisma.user.findFirst({
      where: {
        email: { contains: 'mwaqar' }
      },
      include: { plan: true }
    });

    if (user) {
      console.log(`\n👤 User: ${user.email}`);
      console.log(`  Plan: ${user.plan?.name || 'None'}`);
      console.log(`  AI Comments Limit: ${user.plan?.aiCommentsPerMonth || 0}`);
      
      // Get monthly usage
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const monthlyUsage = await prisma.apiUsage.findMany({
        where: {
          userId: user.id,
          date: { gte: monthStart }
        }
      });

      const totalAiComments = monthlyUsage.reduce((sum, r) => sum + (r.aiComments || 0), 0);
      const totalBonusAiComments = monthlyUsage.reduce((sum, r) => sum + (r.bonusAiComments || 0), 0);

      console.log(`\n📈 Monthly Usage:`);
      console.log(`  Total aiComments: ${totalAiComments}`);
      console.log(`  Total bonusAiComments: ${totalBonusAiComments}`);
      console.log(`  Available: ${(user.plan?.aiCommentsPerMonth || 0) - totalAiComments + totalBonusAiComments}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkCurrentState();
