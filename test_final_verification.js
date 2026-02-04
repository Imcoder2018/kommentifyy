const fetch = require('node-fetch');

const BASE_URL = 'https://kommentify.com';

async function testFinalVerification() {
  try {
    console.log('🎯 FINAL LINKEDIN FORMATTING VERIFICATION\n');
    console.log('='.repeat(80));
    
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
    console.log('✅ Logged in successfully\n');
    
    // Generate post
    const postRes = await fetch(`${BASE_URL}/api/ai/generate-post`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: 'Lead generation',
        template: 'professional',
        tone: 'informative',
        length: 250,
        includeHashtags: true,
        includeEmojis: true
      })
    });
    
    const postData = await postRes.json();
    
    if (postData.success) {
      const content = postData.content;
      
      console.log('📝 GENERATED LINKEDIN POST:\n');
      console.log('┌' + '─'.repeat(78) + '┐');
      content.split('\n').forEach(line => {
        console.log('│ ' + line.padEnd(77) + '│');
      });
      console.log('└' + '─'.repeat(78) + '┘');
      
      console.log('\n✅ VERIFICATION RESULTS:\n');
      
      // 1. Line breaks check
      const lines = content.split('\n');
      
      // Find where hashtags start
      let hashtagLineIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('#')) {
          hashtagLineIndex = i;
          break;
        }
      }
      
      // Check empty lines in content (before hashtags)
      let maxConsecutiveInContent = 0;
      let consecutiveEmpty = 0;
      const contentLines = hashtagLineIndex > 0 ? lines.slice(0, hashtagLineIndex) : lines;
      for (let i = 0; i < contentLines.length; i++) {
        if (contentLines[i].trim() === '') {
          consecutiveEmpty++;
          maxConsecutiveInContent = Math.max(maxConsecutiveInContent, consecutiveEmpty);
        } else {
          consecutiveEmpty = 0;
        }
      }
      
      // Check empty lines before hashtags
      let emptyBeforeHashtags = 0;
      if (hashtagLineIndex > 0) {
        for (let i = hashtagLineIndex - 1; i >= 0; i--) {
          if (lines[i].trim() === '') {
            emptyBeforeHashtags++;
          } else {
            break;
          }
        }
      }
      
      console.log(`✅ 1. Line Breaks in Content: ${maxConsecutiveInContent <= 1 ? 'SINGLE ✓ (GOOD)' : 'DOUBLE ✗ (BAD)'}`);
      console.log(`   Max consecutive empty lines in content: ${maxConsecutiveInContent}`);
      
      // 2. Unicode bold check
      const hasBoldUnicode = content.includes('𝗔') || content.includes('𝗮') || content.includes('𝟬');
      console.log(`\n✅ 2. Bold Formatting: ${hasBoldUnicode ? 'UNICODE BOLD ✓' : 'NO BOLD'}`);
      
      // 3. Markdown check
      const hasMarkdownBold = content.includes('**');
      console.log(`   No markdown **: ${!hasMarkdownBold ? '✓ CORRECT' : '✗ FOUND (BAD)'}`);
      
      // 4. Hashtag format check
      const hasHashtagPrefix = content.includes('hashtag#');
      const hasNormalHashtags = content.includes('#');
      console.log(`\n✅ 3. Hashtag Format:`);
      console.log(`   No "hashtag#" prefix: ${!hasHashtagPrefix ? '✓ CORRECT' : '✗ FOUND (BAD)'}`);
      console.log(`   Contains "#": ${hasNormalHashtags ? '✓ CORRECT' : '✗ MISSING'}`);
      
      // 5. Hashtag position check
      const hashtagMatches = content.match(/#\w+/g);
      if (hashtagMatches) {
        const lastHashtagIndex = content.lastIndexOf(hashtagMatches[hashtagMatches.length - 1]);
        const contentLength = content.length;
        const hashtagsAtEnd = lastHashtagIndex > contentLength - 100;
        
        console.log(`\n✅ 4. Hashtag Position:`);
        console.log(`   Hashtags at end: ${hashtagsAtEnd ? '✓ CORRECT' : '✗ NOT AT END'}`);
        console.log(`   Count: ${hashtagMatches.length}`);
        console.log(`   Tags: ${hashtagMatches.join(' ')}`);
        console.log(`   Empty lines before hashtags: ${emptyBeforeHashtags} ${emptyBeforeHashtags === 2 ? '✓ CORRECT' : '(expecting 2)'}`);
      }
      
      console.log('\n' + '='.repeat(80));
      
      // Final verdict
      const allGood = maxConsecutiveInContent <= 1 && 
                      !hasMarkdownBold && 
                      !hasHashtagPrefix && 
                      hasNormalHashtags &&
                      emptyBeforeHashtags === 2;
      
      if (allGood) {
        console.log('🎉 🎉 🎉 ALL FORMATTING CHECKS PASSED! 🎉 🎉 🎉');
        console.log('\n✅ Ready for LinkedIn posting!');
      } else {
        console.log('⚠️  Some formatting issues detected');
      }
      
      console.log('='.repeat(80));
      
    } else {
      console.log('❌ Failed:', postData.error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testFinalVerification();
