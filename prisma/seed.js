const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Get admin credentials from environment variables or use defaults for development
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@linkedin-automation.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123456';

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
      isDefaultFreePlan: true,
      monthlyComments: 150,
      monthlyLikes: 300,
      monthlyShares: 50,
      monthlyFollows: 100,
      monthlyConnections: 50,
      aiPostsPerMonth: 20,
      aiCommentsPerMonth: 100,
      aiTopicLinesPerMonth: 30,
      allowAiPostGeneration: true,
      allowAiCommentGeneration: true,
      allowAiTopicLines: true,
      allowPostScheduling: false,
      allowAutomation: true,
      allowAutomationScheduling: false,
      allowNetworking: false,
      allowNetworkScheduling: false,
      allowCsvExport: false,
      allowImportProfiles: true,
      monthlyImportCredits: 10,
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { name: 'Pro' },
    update: {},
    create: {
      name: 'Pro',
      price: 29.99,
      monthlyComments: 1500,
      monthlyLikes: 3000,
      monthlyShares: 300,
      monthlyFollows: 1500,
      monthlyConnections: 900,
      aiPostsPerMonth: 300,
      aiCommentsPerMonth: 1500,
      aiTopicLinesPerMonth: 300,
      allowAiPostGeneration: true,
      allowAiCommentGeneration: true,
      allowAiTopicLines: true,
      allowPostScheduling: true,
      allowAutomation: true,
      allowAutomationScheduling: true,
      allowNetworking: true,
      allowNetworkScheduling: true,
      allowCsvExport: true,
      allowImportProfiles: true,
      monthlyImportCredits: 100,
    },
  });

  const enterprisePlan = await prisma.plan.upsert({
    where: { name: 'Enterprise' },
    update: {},
    create: {
      name: 'Enterprise',
      price: 99.99,
      monthlyComments: 5000,
      monthlyLikes: 10000,
      monthlyShares: 1000,
      monthlyFollows: 5000,
      monthlyConnections: 3000,
      aiPostsPerMonth: 1000,
      aiCommentsPerMonth: 5000,
      aiTopicLinesPerMonth: 1000,
      allowAiPostGeneration: true,
      allowAiCommentGeneration: true,
      allowAiTopicLines: true,
      allowPostScheduling: true,
      allowAutomation: true,
      allowAutomationScheduling: true,
      allowNetworking: true,
      allowNetworkScheduling: true,
      allowCsvExport: true,
      allowImportProfiles: true,
      monthlyImportCredits: 500,
    },
  });

  console.log('✅ Plans created:', { freePlan: freePlan.name, proPlan: proPlan.name, enterprisePlan: enterprisePlan.name });

  // Create admin user
  console.log('Creating admin user...');
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const admin = await prisma.admin.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      email: ADMIN_EMAIL,
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
    },
  });

  console.log('✅ Admin user created:', admin.email);
  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📝 Default Admin Credentials:');
  console.log(`   Email: ${ADMIN_EMAIL}`);
  console.log('   Password: (use ADMIN_PASSWORD env var or default)');
  console.log('\n⚠️  IMPORTANT: Change ADMIN_PASSWORD in production!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
