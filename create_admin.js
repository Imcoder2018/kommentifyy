const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
    try {
        const email = 'admin@example.com';
        const password = 'adminpassword123';
        const hashedPassword = await hash(password, 10);

        const admin = await prisma.admin.upsert({
            where: { email },
            update: {},
            create: {
                email,
                password: hashedPassword,
                name: 'Super Admin',
                role: 'admin'
            }
        });

        console.log('✅ Admin user created/verified:', admin);

    } catch (error) {
        console.error('❌ Error creating admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
