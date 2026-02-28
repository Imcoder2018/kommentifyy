// Check actual table names in database
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get schema name from environment or use default
const SCHEMA = process.env.DATABASE_SCHEMA || 'linkedin_automation';

async function checkTableNames() {
  console.log('🔍 Checking table names...\n');

  try {
    // Get all table names
    const tables = await prisma.$queryRawUnsafe(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = '${SCHEMA}'
      ORDER BY table_name
    `);

    console.log('Available tables:');
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });

    // Check specifically for PostDraft variations
    const postDraftTables = tables.filter(t => 
      t.table_name.toLowerCase().includes('postdraft')
    );
    
    console.log('\nPostDraft-related tables:');
    if (postDraftTables.length > 0) {
      postDraftTables.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    } else {
      console.log('  No PostDraft tables found');
    }

  } catch (error) {
    console.error('❌ Error checking tables:', error);
  }
}

checkTableNames()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
