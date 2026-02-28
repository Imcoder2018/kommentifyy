// Fetch valid models from OpenRouter API
const https = require('https');

// Get API key from environment variable
const API_KEY = process.env.OPENROUTER_API_KEY;

if (!API_KEY) {
  console.error('❌ Error: OPENROUTER_API_KEY environment variable is not set');
  console.log('   Run: export OPENROUTER_API_KEY=your_key_here');
  process.exit(1);
}

const options = {
  hostname: 'openrouter.ai',
  path: '/api/v1/models',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${API_KEY}`
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      // Check for HTTP errors
      if (res.statusCode !== 200) {
        console.error(`❌ API request failed with status code: ${res.statusCode}`);
        console.error(`   Response: ${data.substring(0, 500)}`);
        process.exit(1);
      }

      const json = JSON.parse(data);

      // Check for API errors
      if (json.error) {
        console.error(`❌ API error: ${json.error.message || JSON.stringify(json.error)}`);
        process.exit(1);
      }

      const models = json.data || [];
      console.log(`Total models available: ${models.length}\n`);
      
      // Get all model IDs
      const allIds = models.map(m => m.id).sort();
      
      // Find specific prefixes
      const googleModels = allIds.filter(id => id.startsWith('google/'));
      const xaiModels = allIds.filter(id => id.startsWith('x-ai/'));
      const zaiModels = allIds.filter(id => id.startsWith('z-ai/') || id.startsWith('z.ai/'));
      const openaiModels = allIds.filter(id => id.startsWith('openai/'));
      const anthropicModels = allIds.filter(id => id.startsWith('anthropic/'));
      const deepseekModels = allIds.filter(id => id.startsWith('deepseek/'));
      const metaModels = allIds.filter(id => id.startsWith('meta-'));
      const mistralModels = allIds.filter(id => id.startsWith('mistral'));
      const perplexityModels = allIds.filter(id => id.startsWith('perplexity/'));
      const cohereModels = allIds.filter(id => id.startsWith('cohere/'));
      
      console.log('=== GOOGLE MODELS ===');
      googleModels.forEach(id => console.log(`  ${id}`));
      
      console.log('\n=== X-AI MODELS ===');
      xaiModels.forEach(id => console.log(`  ${id}`));
      
      console.log('\n=== Z-AI MODELS ===');
      zaiModels.forEach(id => console.log(`  ${id}`));
      
      console.log('\n=== OPENAI MODELS ===');
      openaiModels.forEach(id => console.log(`  ${id}`));
      
      console.log('\n=== ANTHROPIC MODELS ===');
      anthropicModels.forEach(id => console.log(`  ${id}`));
      
      console.log('\n=== DEEPSEEK MODELS ===');
      deepseekModels.forEach(id => console.log(`  ${id}`));
      
      console.log('\n=== META MODELS ===');
      metaModels.forEach(id => console.log(`  ${id}`));
      
      console.log('\n=== MISTRAL MODELS ===');
      mistralModels.forEach(id => console.log(`  ${id}`));
      
      console.log('\n=== PERPLEXITY MODELS ===');
      perplexityModels.forEach(id => console.log(`  ${id}`));
      
      console.log('\n=== COHERE MODELS ===');
      cohereModels.forEach(id => console.log(`  ${id}`));
      
      // Write all valid IDs to file
      const fs = require('fs');
      fs.writeFileSync('valid-models.json', JSON.stringify(allIds, null, 2));
      console.log(`\nAll ${allIds.length} valid model IDs written to valid-models.json`);
      
    } catch (e) {
      console.error('Parse error:', e.message);
      console.log('Raw data:', data.substring(0, 500));
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.end();
