const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const user = await prisma.user.findFirst({ where: { id: 'user_1770223918257_cqudq9n2w' }, select: { id: true, email: true, clerkUserId: true, authProvider: true, name: true } });
    console.log('USER BY ID:', JSON.stringify(user, null, 2));
    
    if (user) {
      const allUsers = await prisma.user.findMany({ where: { email: user.email }, select: { id: true, email: true, clerkUserId: true, authProvider: true } });
      console.log('ALL USERS WITH EMAIL:', JSON.stringify(allUsers, null, 2));
      
      const userIds = allUsers.map(u => u.id);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const commands = await prisma.activity.findMany({
        where: { userId: { in: userIds }, type: { startsWith: 'extension_command_' }, timestamp: { gte: oneDayAgo } },
        orderBy: { timestamp: 'desc' },
        take: 10,
        select: { id: true, userId: true, type: true, timestamp: true, metadata: true }
      });
      console.log('RECENT COMMANDS (all userIds):', JSON.stringify(commands, null, 2));
    }
    
    const anyCommands = await prisma.activity.findMany({
      where: { type: { startsWith: 'extension_command_' }, timestamp: { gte: new Date(Date.now() - 2 * 60 * 60 * 1000) } },
      orderBy: { timestamp: 'desc' },
      take: 10,
      select: { id: true, userId: true, type: true, timestamp: true, metadata: true }
    });
    console.log('ANY RECENT COMMANDS (last 2h, all users):', JSON.stringify(anyCommands, null, 2));
  } catch(e) { console.error(e); }
  finally { await prisma.$disconnect(); }
})();
