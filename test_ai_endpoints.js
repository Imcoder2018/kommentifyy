const fetch = require('node-fetch');

const BASE_URL = 'https://kommentify.com';

async function testAIEndpoints() {
  try {
    console.log('🧪 Testing AI Endpoints...');
    
    // First login to get a token
    console.log('1. Logging in to get auth token...');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com', // Use test user from earlier logs
        password: 'password123'
      })
    });
    
    const loginData = await loginRes.json();
    console.log('Login response:', loginData.success ? '✅ Success' : '❌ Failed');
    
    if (!loginData.success) {
      console.log('❌ Cannot test AI endpoints without valid token');
      console.log('Login error:', loginData.error);
      return;
    }
    
    const token = loginData.token;
    console.log('✅ Got auth token');
    
    // Test generate-topics endpoint
    console.log('\n2. Testing generate-topics endpoint...');
    try {
      const topicsRes = await fetch(`${BASE_URL}/api/ai/generate-topics`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          industry: 'Technology',
          count: 5
        })
      });
      
      console.log('Topics response status:', topicsRes.status);
      const topicsData = await topicsRes.json();
      console.log('Topics response:', topicsData.success ? '✅ Success' : '❌ Failed');
      if (!topicsData.success) {
        console.log('Topics error:', topicsData.error);
      } else {
        console.log('Generated topics count:', topicsData.topics?.length || 0);
      }
    } catch (error) {
      console.log('❌ Topics endpoint error:', error.message);
    }
    
    // Test generate-post endpoint
    console.log('\n3. Testing generate-post endpoint...');
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
      
      console.log('Post response status:', postRes.status);
      const postData = await postRes.json();
      console.log('Post response:', postData.success ? '✅ Success' : '❌ Failed');
      if (!postData.success) {
        console.log('Post error:', postData.error);
      } else {
        console.log('Generated post length:', postData.content?.length || 0);
      }
    } catch (error) {
      console.log('❌ Post endpoint error:', error.message);
    }
    
    // Test generate-comment endpoint
    console.log('\n4. Testing generate-comment endpoint...');
    try {
      const commentRes = await fetch(`${BASE_URL}/api/ai/generate-comment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          postText: 'Great insights about AI technology!',
          tone: 'professional',
          length: 'short'
        })
      });
      
      console.log('Comment response status:', commentRes.status);
      const commentData = await commentRes.json();
      console.log('Comment response:', commentData.success ? '✅ Success' : '❌ Failed');
      if (!commentData.success) {
        console.log('Comment error:', commentData.error);
      } else {
        console.log('Generated comment length:', commentData.content?.length || 0);
      }
    } catch (error) {
      console.log('❌ Comment endpoint error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAIEndpoints();
