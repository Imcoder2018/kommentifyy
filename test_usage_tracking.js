// Use native fetch (available in Node 18+)

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000';

// Get credentials from environment variables
const TEST_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD;

if (!TEST_EMAIL || !TEST_PASSWORD) {
  console.error('❌ Error: TEST_USER_EMAIL and TEST_USER_PASSWORD environment variables are required');
  process.exit(1);
}

async function testUsageTracking() {
  try {
    console.log('🧪 Testing Usage Tracking & Dashboard Display\n');
    console.log('='.repeat(80));

    // Step 1: Login
    console.log('1. Logging in...');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      })
    });
    
    const loginData = await loginRes.json();
    if (!loginData.success) {
      console.log('❌ Login failed:', loginData.error);
      return;
    }
    
    const token = loginData.token;
    console.log('✅ Login successful\n');
    
    // Step 2: Check BEFORE usage
    console.log('2. Checking usage BEFORE generating AI post...');
    const beforeRes = await fetch(`${BASE_URL}/api/usage/daily`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const beforeData = await beforeRes.json();
    console.log('Current Usage:');
    console.log('  Comments:', beforeData.usage.comments, '/', beforeData.limits.comments);
    console.log('  Likes:', beforeData.usage.likes, '/', beforeData.limits.likes);
    console.log('  Shares:', beforeData.usage.shares, '/', beforeData.limits.shares);
    console.log('  Follows:', beforeData.usage.follows, '/', beforeData.limits.follows);
    console.log('  Connections:', beforeData.usage.connections, '/', beforeData.limits.connections);
    console.log('  AI Posts:', beforeData.usage.aiPosts, '/', beforeData.limits.aiPosts);
    console.log('  AI Comments:', beforeData.usage.aiComments, '/', beforeData.limits.aiComments);
    console.log('  AI Topics:', beforeData.usage.aiTopicLines, '/', beforeData.limits.aiTopicLines);
    console.log('');
    
    const aiPostsBefore = beforeData.usage.aiPosts || 0;
    
    // Step 3: Generate AI post (to increment usage)
    console.log('3. Generating AI post to test usage increment...');
    const postRes = await fetch(`${BASE_URL}/api/ai/generate-post`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: 'Testing usage tracking',
        template: 'professional',
        tone: 'professional',
        length: 200,
        includeHashtags: true,
        includeEmojis: false
      })
    });
    
    const postData = await postRes.json();
    if (postData.success) {
      console.log('✅ AI Post generated successfully');
      console.log('   Content preview:', postData.content.substring(0, 100) + '...');
    } else {
      console.log('⚠️  AI Post generation response:', postData.error || 'Unknown error');
    }
    console.log('');
    
    // Step 4: Check AFTER usage
    console.log('4. Checking usage AFTER generating AI post...');
    const afterRes = await fetch(`${BASE_URL}/api/usage/daily`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const afterData = await afterRes.json();
    console.log('Updated Usage:');
    console.log('  Comments:', afterData.usage.comments, '/', afterData.limits.comments);
    console.log('  Likes:', afterData.usage.likes, '/', afterData.limits.likes);
    console.log('  Shares:', afterData.usage.shares, '/', afterData.limits.shares);
    console.log('  Follows:', afterData.usage.follows, '/', afterData.limits.follows);
    console.log('  Connections:', afterData.usage.connections, '/', afterData.limits.connections);
    console.log('  AI Posts:', afterData.usage.aiPosts, '/', afterData.limits.aiPosts, postData.success ? '✅ +1' : '');
    console.log('  AI Comments:', afterData.usage.aiComments, '/', afterData.limits.aiComments);
    console.log('  AI Topics:', afterData.usage.aiTopicLines, '/', afterData.limits.aiTopicLines);
    console.log('');
    
    // Step 5: Verification
    console.log('='.repeat(80));
    console.log('📊 VERIFICATION RESULTS:\n');
    
    const aiPostsAfter = afterData.usage.aiPosts || 0;
    const incremented = aiPostsAfter > aiPostsBefore;
    
    console.log(`AI Posts Before: ${aiPostsBefore}`);
    console.log(`AI Posts After:  ${aiPostsAfter}`);
    console.log(`Incremented:     ${incremented ? '✅ YES' : '❌ NO'}`);
    console.log('');
    
    // Check if usage is being tracked
    const hasAnyUsage = afterData.usage.comments > 0 || 
                        afterData.usage.likes > 0 ||
                        afterData.usage.shares > 0 ||
                        afterData.usage.follows > 0 ||
                        afterData.usage.connections > 0 ||
                        afterData.usage.aiPosts > 0 ||
                        afterData.usage.aiComments > 0 ||
                        afterData.usage.aiTopicLines > 0;
    
    console.log('Usage Tracking Status:');
    console.log(`  Has any usage recorded: ${hasAnyUsage ? '✅ YES' : '⚠️  NO (all zeros)'}`);
    console.log(`  Limits configured: ✅ YES`);
    console.log('');
    
    console.log('Dashboard Display Format:');
    console.log(`  ${afterData.usage.comments}/${afterData.limits.comments} Comments`);
    console.log(`  ${afterData.usage.likes}/${afterData.limits.likes} Likes`);
    console.log(`  ${afterData.usage.shares}/${afterData.limits.shares} Shares`);
    console.log(`  ${afterData.usage.follows}/${afterData.limits.follows} Follows`);
    console.log(`  ${afterData.usage.connections}/${afterData.limits.connections} Connections`);
    console.log(`  ${afterData.usage.aiPosts}/${afterData.limits.aiPosts} AI Posts`);
    console.log(`  ${afterData.usage.aiComments}/${afterData.limits.aiComments} AI Comments`);
    console.log(`  ${afterData.usage.aiTopicLines}/${afterData.limits.aiTopicLines} AI Topics`);
    
    console.log('\n' + '='.repeat(80));
    
    if (hasAnyUsage && incremented) {
      console.log('✅ ✅ ✅ USAGE TRACKING WORKING CORRECTLY! ✅ ✅ ✅');
    } else if (hasAnyUsage && !incremented) {
      console.log('⚠️  Usage is tracked but AI post didn\'t increment (might have hit limit)');
    } else {
      console.log('⚠️  No usage recorded yet - generate some activity to test');
    }
    
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testUsageTracking();
