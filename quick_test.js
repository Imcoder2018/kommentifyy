const fetch = require('node-fetch');

async function testAdminAPI() {
  try {
    console.log('Testing admin API...');
    
    const loginRes = await fetch('https://kommentify.com/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'adminpassword123' })
    });
    const loginData = await loginRes.json();
    
    if (!loginData.success) {
      throw new Error('Login failed');
    }
    
    const token = loginData.token;
    
    const plansRes = await fetch('https://kommentify.com/api/admin/plans', {
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
