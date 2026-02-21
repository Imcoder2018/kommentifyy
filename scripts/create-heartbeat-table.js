// Create ExtensionHeartbeat table if not exists
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createExtensionHeartbeatTable() {
  console.log('🔧 Creating ExtensionHeartbeat table...\n');

  try {
    // Check if table exists
    const tableCheck = await prisma.$queryRaw`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'linkedin_automation' 
      AND table_name = 'ExtensionHeartbeat'
    `;

    if (tableCheck.length > 0) {
      console.log('✅ ExtensionHeartbeat table already exists');
      return;
    }

    // Create table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "linkedin_automation"."ExtensionHeartbeat" (
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
      CREATE INDEX IF NOT EXISTS "ExtensionHeartbeat_userId_idx" ON "linkedin_automation"."ExtensionHeartbeat"("userId")
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "ExtensionHeartbeat_lastSeen_idx" ON "linkedin_automation"."ExtensionHeartbeat"("lastSeen")
    `);

    console.log('✅ ExtensionHeartbeat table created successfully');
  } catch (error) {
    console.error('❌ Error creating table:', error);
  }
}

createExtensionHeartbeatTable()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
