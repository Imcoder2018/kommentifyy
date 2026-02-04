const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial extension version...');
  
  // Add initial version
  const version = await prisma.extensionVersion.upsert({
    where: { version: '1.3.4' },
    update: {},
    create: {
      version: '1.3.4',
      features: [
        'AI-powered comment generation',
        'Scheduled post automation',
        'Network growth tools',
        'Business hours scheduling',
        'Live import history updates',
        'Profile URL persistence',
        'Dashboard scheduled posts display'
      ],
      bug_fixes: [
        'Fixed scheduled posts reliability',
        'Improved tab switching for posting',
        'Fixed import tab live updates',
        'Enhanced dashboard visibility'
      ],
      download_url: '',
      release_notes: 'Current stable release with all core features and improvements',
      is_active: true
    }
  });

  console.log('Created/updated version:', version);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
