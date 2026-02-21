const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
  try {
    // Delete all pending post_scheduled_content commands
    const result = await prisma.activity.deleteMany({
      where: {
        type: 'extension_command_post_scheduled_content'
      }
    });
    console.log('Deleted commands:', result.count);
    
    // Also delete any old post_scheduled_draft commands
    const result2 = await prisma.activity.deleteMany({
      where: {
        type: 'extension_command_post_scheduled_draft'
      }
    });
    console.log('Deleted old draft commands:', result2.count);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
