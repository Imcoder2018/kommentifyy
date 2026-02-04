const fetch = require('node-fetch');

const BASE_URL = 'https://kommentify.com';

async function testLinkedInFormatting() {
  try {
    console.log('🧪 Testing LinkedIn Formatting...\n');
    
    // Step 1: Login
    console.log('1. Logging in...');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'mwaqarsikandar@gmail.com',
        password: 'grow/9876'
      })
    });
    
    const loginData = await loginRes.json();
    if (!loginData.success) {
      console.log('❌ Login failed:', loginData.error);
      return;
    }
    
    const token = loginData.token;
    console.log('✅ Login successful\n');
    
    // Step 2: Generate a post with formatting and hashtags
    console.log('2. Testing AI Post Generation with Formatting...');
    const postRes = await fetch(`${BASE_URL}/api/ai/generate-post`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: 'SEO strategies for business growth',
        template: 'professional',
        tone: 'informative',
        length: 800,
        includeHashtags: true,
        includeEmojis: true
      })
    });
    
    const postData = await postRes.json();
    
    if (postData.success) {
      console.log('✅ Post generated successfully!\n');
      console.log('=' .repeat(80));
      console.log('GENERATED POST:');
      console.log('='.repeat(80));
      console.log(postData.content);
      console.log('='.repeat(80));
      
      // Check for formatting issues
      console.log('\n📊 Formatting Checks:');
      
      // Check 1: No "hashtag#" should exist
      const hasHashtagPrefix = postData.content.includes('hashtag#');
      console.log(`❌ Contains "hashtag#": ${hasHashtagPrefix ? 'YES (BAD)' : 'NO (GOOD)'}`);
      
      // Check 2: Should have normal hashtags
      const hasNormalHashtags = postData.content.includes('#');
      console.log(`✅ Contains "#" hashtags: ${hasNormalHashtags ? 'YES (GOOD)' : 'NO (BAD)'}`);
      
      // Check 3: Count hashtags
      const hashtagMatches = postData.content.match(/#\w+/g);
      console.log(`📝 Number of hashtags: ${hashtagMatches ? hashtagMatches.length : 0}`);
      if (hashtagMatches) {
        console.log(`📌 Hashtags found: ${hashtagMatches.join(', ')}`);
      }
      
      // Check 4: Check for bold formatting
      const hasBoldText = postData.content.includes('**');
      console.log(`🔤 Contains bold (**): ${hasBoldText ? 'YES' : 'NO'}`);
      
      // Check 5: Check line breaks
      const lineBreakCount = (postData.content.match(/\n\n/g) || []).length;
      console.log(`📄 Double line breaks: ${lineBreakCount}`);
      
      console.log('\n' + '='.repeat(80));
      
      if (!hasHashtagPrefix && hasNormalHashtags) {
        console.log('✅ ✅ ✅ FORMATTING IS CORRECT! ✅ ✅ ✅');
      } else {
        console.log('❌ ❌ ❌ FORMATTING HAS ISSUES! ❌ ❌ ❌');
      }
      console.log('='.repeat(80));
      
    } else {
      console.log('❌ Post generation failed:', postData.error);
    }
    
    // Step 3: Test topic generation
    console.log('\n3. Testing AI Topic Generation Formatting...');
    const topicsRes = await fetch(`${BASE_URL}/api/ai/generate-topics`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: 'Digital marketing trends',
        count: 3
      })
    });
    
    const topicsData = await topicsRes.json();
    
    if (topicsData.success) {
      console.log('✅ Topics generated:\n');
      topicsData.topics.forEach((topic, i) => {
        console.log(`   ${i + 1}. ${topic}`);
      });
    } else {
      console.log('❌ Topics generation failed:', topicsData.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testLinkedInFormatting();
