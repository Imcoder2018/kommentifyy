// Use native fetch (available in Node 18+)

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000';

async function debugAIIssue() {
  try {
    console.log('🔍 Debugging AI Connection Issue...');

    // Test the public plans API to see current plan structure
    console.log('1. Checking current plan structure...');
    const plansRes = await fetch(`${BASE_URL}/api/plans`);
    const plansData = await plansRes.json();
    
    if (plansData.success) {
      console.log('✅ Plans API working');
      console.log('Number of plans:', plansData.plans.length);
      
      plansData.plans.forEach((plan, index) => {
        console.log(`\nPlan ${index + 1}: ${plan.name}`);
        console.log('- Price:', plan.price);
        console.log('- Features:', Object.keys(plan.features || {}));
        console.log('- Has aiTopicLines feature:', !!(plan.features?.aiTopicLines));
        console.log('- Limits:', Object.keys(plan.limits || {}));
      });
    } else {
      console.log('❌ Plans API failed:', plansData.error);
    }
    
    // Test direct endpoint access (should fail with 401)
    console.log('\n2. Testing AI endpoint without auth (should get 401)...');
    try {
      const aiRes = await fetch(`${BASE_URL}/api/ai/generate-topics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: 'test', count: 3 })
      });
      
      console.log('AI endpoint status:', aiRes.status);
      const aiData = await aiRes.json();
      console.log('AI endpoint response:', aiData);
      
    } catch (error) {
      console.log('❌ AI endpoint connection error:', error.message);
    }
    
    // Check if the issue is with OPENAI_API_KEY
    console.log('\n3. Checking if this is an OpenAI API key issue...');
    console.log('The AI endpoints require OPENAI_API_KEY environment variable');
    console.log('If the backend is deployed without this key, AI features will fail');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugAIIssue();
