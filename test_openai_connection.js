const fetch = require('node-fetch');

async function testOpenAIConnection() {
  try {
    console.log('🔍 Testing OpenAI Connection Diagnostics...\n');
    
    const res = await fetch('https://kommentify.com/api/ai/test-connection');
    console.log('Status:', res.status);
    
    const data = await res.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testOpenAIConnection();
