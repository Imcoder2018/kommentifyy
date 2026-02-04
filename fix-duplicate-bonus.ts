import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixDuplicateBonus() {
  try {
    console.log('🔧 Fixing duplicate bonus comments...\n');

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

      // Find current month's record
      const currentMonthRecord = usageRecords.find(r => r.date >= monthStart);

      if (!currentMonthRecord) continue;

      // Find old records with bonus
      const oldRecordsWithBonus = usageRecords.filter(r => r.date < monthStart && (r.bonusAiComments || 0) > 0);

      if (oldRecordsWithBonus.length === 0) continue;

      console.log(`\n👤 User: ${user.email}`);
      console.log(`  Current month (${currentMonthRecord.date.toISOString().split('T')[0]}): bonusAiComments = ${currentMonthRecord.bonusAiComments}`);

      // Reset bonus on old records
      for (const oldRecord of oldRecordsWithBonus) {
        console.log(`  ↳ Resetting bonus on old record (${oldRecord.date.toISOString().split('T')[0]}): ${oldRecord.bonusAiComments} -> 0`);
        await prisma.apiUsage.update({
          where: { id: oldRecord.id },
          data: { bonusAiComments: 0 }
        });
      }
    }

    console.log('\n🎉 Duplicate bonus comments fixed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixDuplicateBonus();
