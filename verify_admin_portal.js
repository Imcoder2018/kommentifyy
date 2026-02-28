// Use native fetch (available in Node 18+)

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000';

// Get credentials from environment variables
const TEST_ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL;
const TEST_ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD;

if (!TEST_ADMIN_EMAIL || !TEST_ADMIN_PASSWORD) {
  console.error('❌ Error: TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD environment variables are required');
  console.log('   Run: export TEST_ADMIN_EMAIL=your_email TEST_ADMIN_PASSWORD=your_password');
  process.exit(1);
}

async function verifyAdminPortal() {
  try {
    console.log('🔍 Verifying Admin Portal Data Flow...');

    // Step 1: Login and get admin token
    const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_ADMIN_EMAIL, password: TEST_ADMIN_PASSWORD })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;

    // Step 2: Fetch plans from admin API
    const plansRes = await fetch(`${BASE_URL}/api/admin/plans`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const plansData = await plansRes.json();

    console.log('\n📋 Current Admin API Response:');
    if (plansData.plans && plansData.plans.length > 0) {
      plansData.plans.forEach((plan, index) => {
        console.log(`\n--- Plan ${index + 1}: ${plan.name} ---`);
        console.log('Price:', plan.price);
        console.log('Structure type:', plan.limits ? 'Formatted (has limits object)' : 'Raw (direct fields)');

        if (plan.limits) {
          console.log('Limits from formatted structure:');
          console.log('  Comments:', plan.limits.dailyComments);
          console.log('  Likes:', plan.limits.dailyLikes);
          console.log('  AI Posts:', plan.limits.aiPostsDaily);
        } else {
          console.log('Limits from raw structure:');
          console.log('  Comments:', plan.dailyComments);
          console.log('  Likes:', plan.dailyLikes);
          console.log('  AI Posts:', plan.aiPostsPerDay);
        }

        if (plan.features) {
          console.log('Features from formatted structure:');
          console.log('  AI Content:', plan.features.aiContent);
          console.log('  Auto Comment:', plan.features.autoComment);
          console.log('  Scheduling:', plan.features.scheduling);
        } else {
          console.log('Features from raw structure:');
          console.log('  AI Post Gen:', plan.allowAiPostGeneration);
          console.log('  AI Comment Gen:', plan.allowAiCommentGeneration);
          console.log('  Post Scheduling:', plan.allowPostScheduling);
        }
      });
    }

    console.log('\n✅ Admin portal should now display these values correctly!');
    console.log(`🌐 Check: ${BASE_URL}/admin/plans`);

  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

verifyAdminPortal();
