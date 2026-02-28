// Use native fetch (available in Node 18+)

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000';

// Get credentials from environment variables
const TEST_EMAIL = process.env.TEST_ADMIN_EMAIL;
const TEST_PASSWORD = process.env.TEST_ADMIN_PASSWORD;

if (!TEST_EMAIL || !TEST_PASSWORD) {
  console.error('❌ Error: TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD environment variables are required');
  console.log('   Run: export TEST_ADMIN_EMAIL=your_email TEST_ADMIN_PASSWORD=your_password');
  process.exit(1);
}

async function testAdminAPI() {
  try {
    console.log('Testing admin API...');

    const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
    });
    const loginData = await loginRes.json();

    if (!loginData.success) {
      throw new Error('Login failed');
    }

    const token = loginData.token;

    const plansRes = await fetch(`${BASE_URL}/api/admin/plans`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const plansData = await plansRes.json();

    console.log('Admin API Response Structure:');
    if (plansData.plans && plansData.plans.length > 0) {
      const firstPlan = plansData.plans[0];
      console.log('First plan keys:', Object.keys(firstPlan));
      console.log('Has dailyComments directly?', 'dailyComments' in firstPlan);
      console.log('Has limits object?', 'limits' in firstPlan);
      console.log('Sample plan:', JSON.stringify(firstPlan, null, 2));
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

testAdminAPI();
