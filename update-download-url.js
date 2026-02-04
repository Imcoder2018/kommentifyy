const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateDownloadUrl() {
  // Update the download URL for version 1.3.4
  const version = await prisma.extensionVersion.update({
    where: { version: '1.3.4' },
    data: {
      download_url: 'https://backend-232l1dgb7-arwebcrafts-projects-eca5234b.vercel.app/extension-download'
    }
  });

  console.log('Updated version:', version);
}

updateDownloadUrl()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
