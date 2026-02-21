// Add PostDraft-User relation to database
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addPostDraftUserRelation() {
  console.log('🔧 Adding PostDraft-User relation...\n');

  try {
    // Add foreign key constraint
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "linkedin_automation"."PostDraft" 
      ADD CONSTRAINT "PostDraft_userId_fkey" 
      FOREIGN KEY ("userId") REFERENCES "linkedin_automation"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE
    `);

    console.log('✅ PostDraft-User relation added successfully');
  } catch (error) {
    if (error.code === 'P2002' || error.message.includes('already exists')) {
      console.log('✅ PostDraft-User relation already exists');
    } else {
      console.error('❌ Error adding relation:', error);
    }
  }
}

addPostDraftUserRelation()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
