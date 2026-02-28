// Add PostDraft-User relation to database
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get schema name from environment or use default
const SCHEMA = process.env.DATABASE_SCHEMA || 'linkedin_automation';

async function addPostDraftUserRelation() {
  console.log('🔧 Adding PostDraft-User relation...\n');

  try {
    // Add foreign key constraint
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "${SCHEMA}"."PostDraft"
      ADD CONSTRAINT "PostDraft_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "${SCHEMA}"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE
    `);

    console.log('✅ PostDraft-User relation added successfully');
  } catch (error) {
    // P2003 = foreign key constraint error (constraint doesn't exist or failed)
    // P2002 = unique constraint violation
    if (error.code === 'P2003' || error.message.includes('already exists')) {
      console.log('✅ PostDraft-User relation already exists');
    } else {
      console.error('❌ Error adding relation:', error);
    }
  }
}

addPostDraftUserRelation()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
