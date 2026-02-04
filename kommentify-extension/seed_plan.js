const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://postgres:8q0xoxpz8DJqJReL@db.fvoruwepflhyvwxoitov.supabase.co:5432/postgres?schema=linkedin_automation",
    ssl: {
        rejectUnauthorized: false
    }
});

async function seedPlan() {
    try {
        await client.connect();
        console.log('Connected successfully');

        console.log('Seeding Free Plan...');

        const query = `
            INSERT INTO "linkedin_automation"."Plan" (
                id, name, price, 
                "dailyComments", "dailyLikes", "dailyShares", "dailyFollows", "dailyConnections", 
                "aiPostsPerDay", "aiCommentsPerDay", 
                "allowAiPostGeneration", "allowAiCommentGeneration", 
                "allowPostScheduling", "allowAutomation", "allowAutomationScheduling", 
                "allowNetworking", "allowNetworkScheduling", "allowCsvExport", 
                "updatedAt"
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW())
            ON CONFLICT (name) DO NOTHING
            RETURNING id;
        `;

        const values = [
            'plan_free', 'Free', 0,
            50, 100, 20, 50, 30,
            10, 50,
            true, true,
            true, true, true,
            true, true, true
        ];

        const res = await client.query(query, values);

        if (res.rows.length > 0) {
            console.log('✅ Free Plan created successfully with ID:', res.rows[0].id);
        } else {
            console.log('ℹ️ Free Plan already exists.');
        }

    } catch (e) {
        console.error('❌ Database error:', e);
    } finally {
        await client.end();
    }
}

seedPlan();
