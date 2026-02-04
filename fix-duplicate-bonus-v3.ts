import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixDuplicateBonus() {
  try {
    console.log('🔧 Fixing duplicate bonus comments...\n');

    // Get all users
    const users = await prisma.user.findMany();

    for (const user of users) {
      // Get all usage records for this user, ordered by date (newest first)
      const usageRecords = await prisma.apiUsage.findMany({
        where: { userId: user.id },
        orderBy: { date: 'desc' }
      });

      if (usageRecords.length === 0) continue;

      // The first record is the most recent one - keep its bonus
      const mostRecentRecord = usageRecords[0];
      const otherRecords = usageRecords.slice(1);

      // Find other records with bonus
      const otherRecordsWithBonus = otherRecords.filter(r => (r.bonusAiComments || 0) > 0);

      if (otherRecordsWithBonus.length === 0) continue;

      console.log(`\n👤 User: ${user.email}`);
      console.log(`  Most recent record (${mostRecentRecord.date.toISOString().split('T')[0]}): bonusAiComments = ${mostRecentRecord.bonusAiComments}`);

      // Reset bonus on other records
      for (const otherRecord of otherRecordsWithBonus) {
        console.log(`  ↳ Resetting bonus on older record (${otherRecord.date.toISOString().split('T')[0]}): ${otherRecord.bonusAiComments} -> 0`);
        await prisma.apiUsage.update({
          where: { id: otherRecord.id },
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
