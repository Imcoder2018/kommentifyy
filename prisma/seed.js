const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default plans
  console.log('Creating plans...');
  
  const freePlan = await prisma.plan.upsert({
    where: { name: 'Free' },
    update: {},
    create: {
      name: 'Free',
      price: 0,
      dailyComments: 10,
      dailyLikes: 20,
      dailyShares: 5,
      dailyFollows: 10,
      dailyConnections: 5,
      aiPostsPerDay: 2,
      aiCommentsPerDay: 10,
      allowAiPostGeneration: true,
      allowAiCommentGeneration: true,
      allowPostScheduling: false,
      allowAutomation: true,
      allowAutomationScheduling: false,
      allowNetworking: false,
      allowNetworkScheduling: false,
      allowCsvExport: false,
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { name: 'Pro' },
    update: {},
    create: {
      name: 'Pro',
      price: 29.99,
      dailyComments: 50,
      dailyLikes: 100,
      dailyShares: 20,
      dailyFollows: 50,
      dailyConnections: 30,
      aiPostsPerDay: 10,
      aiCommentsPerDay: 50,
      allowAiPostGeneration: true,
      allowAiCommentGeneration: true,
      allowPostScheduling: true,
      allowAutomation: true,
      allowAutomationScheduling: true,
      allowNetworking: true,
      allowNetworkScheduling: true,
      allowCsvExport: true,
    },
  });

  const enterprisePlan = await prisma.plan.upsert({
    where: { name: 'Enterprise' },
    update: {},
    create: {
      name: 'Enterprise',
      price: 99.99,
      dailyComments: 200,
      dailyLikes: 500,
      dailyShares: 100,
      dailyFollows: 200,
      dailyConnections: 100,
      aiPostsPerDay: 50,
      aiCommentsPerDay: 200,
      allowAiPostGeneration: true,
      allowAiCommentGeneration: true,
      allowPostScheduling: true,
      allowAutomation: true,
      allowAutomationScheduling: true,
      allowNetworking: true,
      allowNetworkScheduling: true,
      allowCsvExport: true,
    },
  });

  console.log('✅ Plans created:', { freePlan: freePlan.name, proPlan: proPlan.name, enterprisePlan: enterprisePlan.name });

  // Create admin user
  console.log('Creating admin user...');
  const hashedPassword = await bcrypt.hash('Admin@123456', 10);
  
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@linkedin-automation.com' },
    update: {},
    create: {
      email: 'admin@linkedin-automation.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
    },
  });

  console.log('✅ Admin user created:', admin.email);
  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📝 Default Admin Credentials:');
  console.log('   Email: admin@linkedin-automation.com');
  console.log('   Password: Admin@123456');
  console.log('\n⚠️  IMPORTANT: Change these credentials in production!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
