// Create ExtensionHeartbeat table if not exists
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get schema name from environment or use default
const SCHEMA = process.env.DATABASE_SCHEMA || 'linkedin_automation';

async function createExtensionHeartbeatTable() {
  console.log('🔧 Creating ExtensionHeartbeat table...\n');

  try {
    // Check if table exists
    const tableCheck = await prisma.$queryRaw`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = ${SCHEMA}
      AND table_name = 'ExtensionHeartbeat'
    `;

    if (tableCheck.length > 0) {
      console.log('✅ ExtensionHeartbeat table already exists');
      return;
    }

    // Create table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "${SCHEMA}"."ExtensionHeartbeat" (
        "id" TEXT NOT NULL PRIMARY KEY DEFAULT replace(gen_random_uuid()::text, '-', ''),
        "userId" TEXT NOT NULL UNIQUE,
        "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "version" TEXT,
        "status" TEXT NOT NULL DEFAULT 'online',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "ExtensionHeartbeat_userId_idx" ON "${SCHEMA}"."ExtensionHeartbeat"("userId")
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "ExtensionHeartbeat_lastSeen_idx" ON "${SCHEMA}"."ExtensionHeartbeat"("lastSeen")
    `);

    console.log('✅ ExtensionHeartbeat table created successfully');
  } catch (error) {
    console.error('❌ Error creating table:', error);
  }
}

createExtensionHeartbeatTable()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
