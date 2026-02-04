import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function consolidateBonusComments() {
  try {
    console.log('🔧 Consolidating bonus comments to current month...\n');

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

    // Get all users
    const users = await prisma.user.findMany();

    for (const user of users) {
      // Get all usage records for this user
      const usageRecords = await prisma.apiUsage.findMany({
        where: { userId: user.id },
        orderBy: { date: 'desc' }
      });

      if (usageRecords.length === 0) continue;

      // Calculate total bonus from all records
      const totalBonus = usageRecords.reduce((sum, record) => sum + (record.bonusAiComments || 0), 0);

      if (totalBonus === 0) continue;

      // Find current month's record
      let currentMonthRecord = usageRecords.find(r => r.date >= monthStart);

      // If no current month record, create one
      if (!currentMonthRecord) {
        currentMonthRecord = await prisma.apiUsage.create({
          data: {
            userId: user.id,
            date: monthStart,
            aiComments: 0,
            bonusAiComments: totalBonus
          }
        });
        console.log(`✅ Created new record for user ${user.email} with ${totalBonus} bonus comments`);
      } else {
        // Update current month record with total bonus
        await prisma.apiUsage.update({
          where: { id: currentMonthRecord.id },
          data: { bonusAiComments: totalBonus }
        });
        console.log(`✅ Updated current month record for user ${user.email} with ${totalBonus} bonus comments`);
      }

      // Reset bonus on old records
      const oldRecords = usageRecords.filter(r => r.date < monthStart && (r.bonusAiComments || 0) > 0);
      for (const oldRecord of oldRecords) {
        await prisma.apiUsage.update({
          where: { id: oldRecord.id },
          data: { bonusAiComments: 0 }
        });
        console.log(`  ↳ Reset bonus on old record from ${oldRecord.date.toISOString().split('T')[0]}`);
      }
    }

    console.log('\n🎉 Bonus comments consolidated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

consolidateBonusComments();
