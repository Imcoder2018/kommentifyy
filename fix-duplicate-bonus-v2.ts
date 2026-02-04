import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixDuplicateBonus() {
  try {
    console.log('🔧 Fixing duplicate bonus comments...\n');

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Get all users
    const users = await prisma.user.findMany();

    for (const user of users) {
      // Get all usage records for this user
      const usageRecords = await prisma.apiUsage.findMany({
        where: { userId: user.id },
        orderBy: { date: 'desc' }
      });

      if (usageRecords.length === 0) continue;

      // Find current month's record (same month and year)
      const currentMonthRecord = usageRecords.find(r => {
        const recordDate = new Date(r.date);
        return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
      });

      if (!currentMonthRecord) continue;

      // Find old records with bonus (different month or year)
      const oldRecordsWithBonus = usageRecords.filter(r => {
        const recordDate = new Date(r.date);
        const isOldMonth = recordDate.getMonth() !== currentMonth || recordDate.getFullYear() !== currentYear;
        return isOldMonth && (r.bonusAiComments || 0) > 0;
      });

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
