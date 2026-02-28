const { createClient } = require('@supabase/supabase-js');

async function test() {
    // Use environment variables for Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

    if (supabaseUrl === 'https://your-project.supabase.co' || supabaseKey === 'your-anon-key') {
        console.error('❌ Error: Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    // Test 1: Auth check (simplest)
    const { data: authData, error: authError } = await supabase.auth.getSession();
    console.log('Auth Session Check:', authError ? authError : 'Success (No Session)');

    // Test 2: Public Schema Check
    // We'll try to select from a table that definitely doesn't exist to get a standard error
    const { data, error } = await supabase.from('NonExistentTable').select('*');

    if (error) {
        console.log('Public Schema Query Error:', JSON.stringify(error, null, 2));
    } else {
        console.log('Public Schema Query Success:', data);
    }
}

test();
