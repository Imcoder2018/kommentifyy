const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres:8q0xoxpz8DJqJReL@db.fvoruwepflhyvwxoitov.supabase.co:5432/postgres?schema=linkedin_automation"
        }
    }
});

async function simulateRegistration() {
    const email = `sim_reg_${Date.now()}@example.com`;
    const name = 'Simulation User';
    const password = 'hashed_password_placeholder';

    console.log('Simulating registration for:', email);

    try {
        // 1. Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            console.log('User already exists');
            return;
        }

        // 2. Create User with Plan connection
        console.log('Creating user...');
        const user = await prisma.user.create({
            data: {
                email,
                password,
                name,
                plan: {
                    connectOrCreate: {
                        where: { name: 'Free' },
                        create: {
                            name: 'Free',
                            price: 0,
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
                            allowCsvExport: true
                        }
                    }
                },
                apiUsage: {
                    create: {
                        date: new Date(),
                        comments: 0,
                        likes: 0,
                        shares: 0,
                        follows: 0,
                        connections: 0,
                        aiPosts: 0,
                        aiComments: 0
                    }
                }
            },
            include: {
                plan: true
            }
        });

        console.log('✅ User created successfully:', user.id);
        console.log('Plan:', user.plan.name);

    } catch (error) {
        console.error('❌ Simulation failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

simulateRegistration();
