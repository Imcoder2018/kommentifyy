// Use native fetch (available in Node 18+)

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000';

// Get credentials from environment variables
const TEST_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD;

if (!TEST_EMAIL || !TEST_PASSWORD) {
  console.error('❌ Error: TEST_USER_EMAIL and TEST_USER_PASSWORD environment variables are required');
  console.log('   Run: export TEST_USER_EMAIL=your_email TEST_USER_PASSWORD=your_password');
  process.exit(1);
}

async function testUserAI() {
  try {
    console.log('🧪 Testing Backend API with User Credentials...');

    // Step 1: Login with provided credentials
    console.log('\n1. Logging in with user credentials...');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      })
    });
    
    const loginData = await loginRes.json();
    console.log('Login Status:', loginRes.status);
    console.log('Login Response:', loginData.success ? '✅ Success' : '❌ Failed');
    
    if (!loginData.success) {
      console.log('Login Error:', loginData.error);
      return;
    }
    
    const token = loginData.token;
    console.log('✅ Auth token received');
    console.log('User data:', loginData.user);
    
    // Step 2: Test generate-topics endpoint
    console.log('\n2. Testing AI Topic Generation...');
    try {
      const topicsRes = await fetch(`${BASE_URL}/api/ai/generate-topics`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic: 'LinkedIn growth strategies',
          count: 5
        })
      });
      
      console.log('Topics Response Status:', topicsRes.status);
      console.log('Topics Response Headers:', Object.fromEntries(topicsRes.headers.entries()));
      
      const topicsText = await topicsRes.text();
      console.log('Topics Raw Response:', topicsText.substring(0, 500));
      
      let topicsData;
      try {
        topicsData = JSON.parse(topicsText);
        console.log('Topics Parsed:', topicsData);
        
        if (topicsData.success) {
          console.log('✅ Topic generation working!');
          console.log('Using fallback:', topicsData.fallback || false);
          console.log('Has OpenAI key:', topicsData.hasOpenAIKey);
          console.log('Generated topics:', topicsData.topics);
        } else {
          console.log('❌ Topic generation failed:', topicsData.error);
          console.log('Error details:', topicsData.details);
          console.log('Has OpenAI key:', topicsData.hasOpenAIKey);
        }
      } catch (parseError) {
        console.log('❌ Failed to parse JSON response');
        console.log('Parse error:', parseError.message);
      }
      
    } catch (error) {
      console.log('❌ Topics endpoint network error:', error.message);
      console.log('Full error:', error);
    }
    
    // Step 3: Test generate-post endpoint
    console.log('\n3. Testing AI Post Generation...');
    try {
      const postRes = await fetch(`${BASE_URL}/api/ai/generate-post`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic: 'AI in business',
          template: 'professional',
          tone: 'informative',
          length: 500
        })
      });
      
      console.log('Post Response Status:', postRes.status);
      const postText = await postRes.text();
      console.log('Post Raw Response:', postText.substring(0, 500));
      
      let postData;
      try {
        postData = JSON.parse(postText);
        console.log('Post Parsed:', postData);
        
        if (postData.success) {
          console.log('✅ Post generation working!');
          console.log('Generated post preview:', postData.content?.substring(0, 100));
        } else {
          console.log('❌ Post generation failed:', postData.error);
        }
      } catch (parseError) {
        console.log('❌ Failed to parse JSON response');
      }
      
    } catch (error) {
      console.log('❌ Post endpoint network error:', error.message);
      console.log('Full error:', error);
    }
    
    // Step 4: Check user plan details
    console.log('\n4. Checking User Plan Details...');
    try {
      const userRes = await fetch(`${BASE_URL}/api/auth/validate`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const userData = await userRes.json();
      console.log('User Plan Info:', userData);
      
      if (userData.user?.plan) {
        console.log('Plan Name:', userData.user.plan.name);
        console.log('Plan Price:', userData.user.plan.price);
        console.log('AI Posts Per Day:', userData.user.plan.aiPostsPerDay);
        console.log('AI Comments Per Day:', userData.user.plan.aiCommentsPerDay);
        console.log('Allow AI Post Generation:', userData.user.plan.allowAiPostGeneration);
        console.log('Allow AI Comment Generation:', userData.user.plan.allowAiCommentGeneration);
      }
      
    } catch (error) {
      console.log('❌ Failed to get user details:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testUserAI();
