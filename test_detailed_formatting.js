const fetch = require('node-fetch');

const BASE_URL = 'https://kommentify.com';

async function testDetailedFormatting() {
  try {
    console.log('🧪 Detailed LinkedIn Formatting Test...\n');
    
    // Login
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'mwaqarsikandar@gmail.com',
        password: 'grow/9876'
      })
    });
    
    const loginData = await loginRes.json();
    const token = loginData.token;
    
    // Generate post
    const postRes = await fetch(`${BASE_URL}/api/ai/generate-post`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: 'Lead generation strategies',
        template: 'professional',
        tone: 'informative',
        length: 300,
        includeHashtags: true,
        includeEmojis: true
      })
    });
    
    const postData = await postRes.json();
    
    if (postData.success) {
      const content = postData.content;
      
      console.log('=' .repeat(80));
      console.log('GENERATED POST (RAW OUTPUT):');
      console.log('='.repeat(80));
      console.log(content);
      console.log('='.repeat(80));
      
      console.log('\n📊 DETAILED ANALYSIS:\n');
      
      // Check for consecutive line breaks
      const lines = content.split('\n');
      console.log(`Total lines: ${lines.length}`);
      console.log(`Empty lines: ${lines.filter(l => l.trim() === '').length}`);
      
      // Check line break patterns
      let consecutiveEmpty = 0;
      let maxConsecutiveEmpty = 0;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim() === '') {
          consecutiveEmpty++;
          maxConsecutiveEmpty = Math.max(maxConsecutiveEmpty, consecutiveEmpty);
        } else {
          consecutiveEmpty = 0;
        }
      }
      console.log(`Max consecutive empty lines: ${maxConsecutiveEmpty}`);
      
      // Check for Unicode bold
      const hasBoldUnicode = content.includes('𝗔') || content.includes('𝗮') || content.includes('𝟬');
      console.log(`Contains Unicode bold: ${hasBoldUnicode ? '✅ YES' : '❌ NO'}`);
      
      // Check for markdown bold
      const hasMarkdownBold = content.includes('**');
      console.log(`Contains markdown **: ${hasMarkdownBold ? '❌ YES (BAD)' : '✅ NO (GOOD)'}`);
      
      // Check hashtag position
      const lastHashtagIndex = content.lastIndexOf('#');
      const contentLength = content.length;
      const hashtagNearEnd = lastHashtagIndex > contentLength * 0.8;
      console.log(`Hashtags at end: ${hashtagNearEnd ? '✅ YES' : '❌ NO'}`);
      
      // Show line break structure
      console.log('\n📝 LINE STRUCTURE:');
      lines.forEach((line, i) => {
        const preview = line.trim().substring(0, 60);
        if (preview) {
          console.log(`Line ${i + 1}: ${preview}${line.length > 60 ? '...' : ''}`);
        } else {
          console.log(`Line ${i + 1}: [EMPTY LINE]`);
        }
      });
      
      console.log('\n' + '='.repeat(80));
      console.log('✅ FORMATTING TEST COMPLETE');
      console.log('='.repeat(80));
      
    } else {
      console.log('❌ Failed:', postData.error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testDetailedFormatting();
