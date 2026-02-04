const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://postgres:8q0xoxpz8DJqJReL@db.fvoruwepflhyvwxoitov.supabase.co:5432/postgres",
    ssl: {
        rejectUnauthorized: false
    }
});

async function checkContent() {
    try {
        await client.connect();
        console.log('Connected successfully');

        // List all tables
        console.log('Listing tables in linkedin_automation schema...');
        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'linkedin_automation'
        `);
        console.log('Tables found:', res.rows.map(r => r.table_name));

        // If User table exists, check its columns
        const userTable = res.rows.find(r => r.table_name === 'User');
        if (userTable) {
            console.log(`Checking ${userTable.table_name} table columns...`);
            const columns = await client.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = $1 AND table_schema = 'linkedin_automation'
            `, [userTable.table_name]);
            console.log('Columns:', columns.rows.map(c => `${c.column_name} (${c.data_type})`));
        }

        // Check for Plans
        console.log('Checking Plan table content...');
        const plans = await client.query('SELECT * FROM "linkedin_automation"."Plan"');
        console.log('Plans found:', plans.rows);

    } catch (e) {
        console.error('Database error:', e);
    } finally {
        await client.end();
    }
}

checkContent();
