const { createClient } = require('@supabase/supabase-js');

async function test() {
    const supabaseUrl = 'https://fvoruwepflhyvwxoitov.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2b3J1d2VwZmxoeXZ3eG9pdG92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4ODU0NzIsImV4cCI6MjA3ODQ2MTQ3Mn0.NlqFXwKyLHrHPGWEZ_Jxvf62siq8lcYKw0wMfi5WRfU';
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
