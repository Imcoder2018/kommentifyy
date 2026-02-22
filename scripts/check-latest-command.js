const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLatestCommand() {
  try {
    const cmd = await prisma.activity.findFirst({
      where: { type: 'extension_command_post_scheduled_content' },
      orderBy: { timestamp: 'desc' }
    });
    
    if (cmd) {
      console.log('\n=== Latest Scheduled Post Command ===');
      console.log('ID:', cmd.id);
      console.log('User:', cmd.userId);
      console.log('Type:', cmd.type);
      console.log('Created:', cmd.timestamp);
      console.log('\nMetadata:');
      const meta = typeof cmd.metadata === 'string' ? JSON.parse(cmd.metadata) : cmd.metadata;
      console.log(JSON.stringify(meta, null, 2));
    } else {
      console.log('No post_scheduled_content commands found');
    }
    
    // Also check scheduled posts
    const posts = await prisma.postDraft.findMany({
      where: { status: 'scheduled' },
      orderBy: { scheduledFor: 'asc' },
      take: 3
    });
    
    console.log('\n=== Scheduled Posts ===');
    posts.forEach(p => {
      console.log(`\nPost ${p.id}:`);
      console.log('  Content length:', p.content?.length || 0);
      console.log('  Status:', p.status);
      console.log('  Task Status:', p.taskStatus);
      console.log('  Task ID:', p.taskId);
      console.log('  Scheduled For:', p.scheduledFor);
      console.log('  User ID:', p.userId);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLatestCommand();
