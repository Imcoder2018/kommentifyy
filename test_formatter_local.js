// Local test of the LinkedIn formatter logic

function toBoldUnicode(text) {
  const boldMap = {
    'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚', 'H': '𝗛', 'I': '𝗜', 'J': '𝗝',
    'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡', 'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥', 'S': '𝗦', 'T': '𝗧',
    'U': '𝗨', 'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭',
    'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴', 'h': '𝗵', 'i': '𝗶', 'j': '𝗷',
    'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻', 'o': '𝗼', 'p': '𝗽', 'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁',
    'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',
    '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰', '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵'
  };
  
  return text.split('').map(char => boldMap[char] || char).join('');
}

function formatForLinkedIn(content) {
  if (!content) return '';
  
  let formatted = content;
  
  // 1. Fix hashtag format: "hashtag#SEO" -> "#SEO"
  formatted = formatted.replace(/hashtag#/g, '#');
  
  // 2. Convert markdown bold (**text**) to Unicode bold for LinkedIn
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, (match, text) => {
    return toBoldUnicode(text);
  });
  
  // 3. Extract hashtags from the content
  const hashtagMatches = formatted.match(/#\w+/g) || [];
  
  // Remove hashtags from content temporarily
  let contentWithoutHashtags = formatted.replace(/#\w+/g, '').trim();
  
  // 4. Convert double line breaks to single line breaks
  contentWithoutHashtags = contentWithoutHashtags.replace(/\n\n+/g, '\n\n');
  
  // 5. Remove trailing empty lines
  contentWithoutHashtags = contentWithoutHashtags.replace(/\n+$/g, '');
  
  // 6. If there are hashtags, add them at the end with two line breaks (3 newlines = 2 empty lines)
  if (hashtagMatches.length > 0) {
    formatted = contentWithoutHashtags + '\n\n\n' + hashtagMatches.join(' ');
  } else {
    formatted = contentWithoutHashtags;
  }
  
  // 7. Remove any markdown code blocks if present
  formatted = formatted.replace(/```[\s\S]*?```/g, '');
  
  // 8. Clean up emoji spacing (but keep single spaces)
  formatted = formatted.replace(/\s{2,}([\u{1F300}-\u{1F9FF}])/gu, ' $1');
  
  // 9. Trim final whitespace
  formatted = formatted.trim();
  
  return formatted;
}

// Test with the example from user
const testInput = `🚀 Lead generation is the backbone of sustainable business growth. 


Understanding your target audience and providing value is key. 


Are you utilizing the right strategies to attract and engage potential clients? 


Let's share insights! 💡 hashtag#LeadGen hashtag#BusinessGrowth hashtag#MarketingStrategy hashtag#Networking hashtag#SalesTips`;

console.log('🧪 Testing LinkedIn Formatter\n');
console.log('=' .repeat(80));
console.log('INPUT (with issues):');
console.log('='.repeat(80));
console.log(testInput);
console.log('\n' + '='.repeat(80));
console.log('OUTPUT (formatted):');
console.log('='.repeat(80));

const formatted = formatForLinkedIn(testInput);
console.log(formatted);

console.log('\n' + '='.repeat(80));
console.log('ANALYSIS:');
console.log('='.repeat(80));

const lines = formatted.split('\n');
console.log(`Total lines: ${lines.length}`);

// Check for consecutive empty lines in content
let emptyCount = 0;
let maxConsecutive = 0;
let consecutiveEmpty = 0;
let hashtagLineIndex = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('#')) {
    hashtagLineIndex = i;
    break;
  }
  if (lines[i].trim() === '') {
    emptyCount++;
    consecutiveEmpty++;
    maxConsecutive = Math.max(maxConsecutive, consecutiveEmpty);
  } else {
    consecutiveEmpty = 0;
  }
}

// Count empty lines before hashtags
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

console.log(`\n✅ Line Breaks in Content: ${maxConsecutive <= 1 ? 'SINGLE ✓' : 'MULTIPLE ✗'}`);
console.log(`   Max consecutive in content: ${maxConsecutive}`);
console.log(`\n✅ Empty Lines Before Hashtags: ${emptyBeforeHashtags} ${emptyBeforeHashtags === 2 ? '✓ CORRECT' : '✗ (should be 2)'}`);

const hasHashtagPrefix = formatted.includes('hashtag#');
console.log(`\n✅ Hashtag Format: ${!hasHashtagPrefix ? '✓ Correct (#Word)' : '✗ Still has "hashtag#"'}`);

const hasBold = formatted.includes('𝗮') || formatted.includes('𝗔');
console.log(`✅ Unicode Bold: ${hasBold ? '✓ Present' : 'Not used in this example'}`);

console.log('\n' + '='.repeat(80));

// Show visual line structure
console.log('LINE STRUCTURE:\n');
lines.forEach((line, i) => {
  if (line.trim() === '') {
    console.log(`${(i+1).toString().padStart(2)}. [EMPTY LINE]`);
  } else {
    const preview = line.substring(0, 70);
    console.log(`${(i+1).toString().padStart(2)}. ${preview}${line.length > 70 ? '...' : ''}`);
  }
});

console.log('\n' + '='.repeat(80));
if (maxConsecutive <= 1 && emptyBeforeHashtags === 2 && !hasHashtagPrefix) {
  console.log('✅ ✅ ✅ ALL FORMATTING CORRECT! ✅ ✅ ✅');
} else {
  console.log('⚠️  Some issues found');
}
console.log('='.repeat(80));
