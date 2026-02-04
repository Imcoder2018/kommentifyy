import { prisma } from './lib/prisma.js';

async function fixNegativeAiComments() {
  try {
    console.log('🔧 Fixing negative AI comments values...');

    // Get all ApiUsage records with negative aiComments
    const negativeRecords = await prisma.apiUsage.findMany({
      where: {
        aiComments: {
          lt: 0
        }
      }
    });

    console.log(`📊 Found ${negativeRecords.length} records with negative aiComments`);

    // Reset negative values to 0 and add to bonusAiComments
    for (const record of negativeRecords) {
      const negativeAmount = Math.abs(record.aiComments);

      await prisma.apiUsage.update({
        where: { id: record.id },
        data: {
          aiComments: 0,
          bonusAiComments: (record.bonusAiComments || 0) + negativeAmount
        }
      });

      console.log(`✅ Fixed record for user ${record.userId}: Reset aiComments from ${record.aiComments} to 0, added ${negativeAmount} to bonusAiComments`);
    }

    console.log('🎉 All negative AI comments values have been fixed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing negative AI comments:', error);
    process.exit(1);
  }
}

fixNegativeAiComments();
