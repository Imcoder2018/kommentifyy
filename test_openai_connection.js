// Use native fetch (available in Node 18+)

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000';

async function testOpenAIConnection() {
  try {
    console.log('🔍 Testing OpenAI Connection Diagnostics...\n');

    const res = await fetch(`${BASE_URL}/api/ai/test-connection`);
    console.log('Status:', res.status);
    
    const data = await res.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testOpenAIConnection();
