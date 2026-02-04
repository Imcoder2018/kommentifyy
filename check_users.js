const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
    try {
        console.log('Checking users in database...');
        const users = await prisma.user.findMany();
        console.log(`Found ${users.length} users:`);
        console.log(JSON.stringify(users, null, 2));

        const plans = await prisma.plan.findMany();
        console.log(`Found ${plans.length} plans:`);
        console.log(JSON.stringify(plans, null, 2));

        const admins = await prisma.admin.findMany();
        console.log(`Found ${admins.length} admins:`);
        console.log(JSON.stringify(admins, null, 2));

    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsers();
