// Visual test showing exact line breaks

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
  formatted = formatted.replace(/hashtag#/g, '#');
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, (match, text) => toBoldUnicode(text));
  
  const hashtagMatches = formatted.match(/#\w+/g) || [];
  let contentWithoutHashtags = formatted.replace(/#\w+/g, '').trim();
  contentWithoutHashtags = contentWithoutHashtags.replace(/\n\n+/g, '\n\n');
  contentWithoutHashtags = contentWithoutHashtags.replace(/\n+$/g, '');
  
  if (hashtagMatches.length > 0) {
    formatted = contentWithoutHashtags + '\n\n\n' + hashtagMatches.join(' ');
  } else {
    formatted = contentWithoutHashtags;
  }
  
  formatted = formatted.replace(/```[\s\S]*?```/g, '');
  formatted = formatted.replace(/\s{2,}([\u{1F300}-\u{1F9FF}])/gu, ' $1');
  formatted = formatted.trim();
  
  return formatted;
}

// Test with markdown bold headers
const testWithBold = `**Unlocking the Power of SEO**

In today's digital landscape, SEO has evolved from a niche tactic.


**Key Elements:**

**1. Keyword Research**: Understanding what your audience searches.

**2. Quality Content**: Content is king!


**3. Link Building**: Cultivating high-quality backlinks.

hashtag#SEO hashtag#DigitalMarketing hashtag#BusinessGrowth`;

console.log('🎯 FINAL FORMATTING TEST\n');
console.log('='.repeat(80));

const formatted = formatForLinkedIn(testWithBold);

console.log('FORMATTED OUTPUT FOR LINKEDIN:\n');
console.log('┌─────────────────────────────────────────────────────────────────────────┐');
formatted.split('\n').forEach((line, i) => {
  const displayLine = line || '[EMPTY]';
  console.log(`│ ${displayLine.padEnd(75)}│`);
});
console.log('└─────────────────────────────────────────────────────────────────────────┘');

console.log('\n📊 VERIFICATION:\n');

const lines = formatted.split('\n');
let hashtagLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('#')) {
    hashtagLine = i;
    break;
  }
}

// Count empty lines BETWEEN content paragraphs (excluding the 2 before hashtags)
// Find the last non-empty line before hashtags
let lastContentLine = hashtagLine - 1;
while (lastContentLine >= 0 && lines[lastContentLine].trim() === '') {
  lastContentLine--;
}

const contentLines = lines.slice(0, lastContentLine + 1);
let maxConsecutiveInParagraphs = 0;
let consecutive = 0;
for (let i = 0; i < contentLines.length - 1; i++) {
  if (contentLines[i].trim() === '' && contentLines[i+1].trim() === '') {
    consecutive++;
    maxConsecutiveInParagraphs = Math.max(maxConsecutiveInParagraphs, consecutive + 1);
  } else if (contentLines[i].trim() !== '') {
    consecutive = 0;
  }
}

// Count empty before hashtags
let emptyBeforeHashtags = 0;
if (hashtagLine > 0) {
  for (let i = hashtagLine - 1; i >= 0 && lines[i].trim() === ''; i--) {
    emptyBeforeHashtags++;
  }
}

console.log(`✅ 1. No "hashtag#" prefix: ${!formatted.includes('hashtag#') ? '✓ PASS' : '✗ FAIL'}`);
console.log(`✅ 2. Unicode bold used: ${formatted.includes('𝗔') || formatted.includes('𝗮') ? '✓ PASS' : '- N/A'}`);
console.log(`✅ 3. No markdown "**": ${!formatted.includes('**') ? '✓ PASS' : '✗ FAIL'}`);
console.log(`✅ 4. Single empty lines in paragraphs: ${maxConsecutiveInParagraphs === 0 ? '✓ PASS' : '✗ FAIL'}`);
console.log(`✅ 5. Two empty lines before hashtags: ${emptyBeforeHashtags === 2 ? '✓ PASS' : `✗ FAIL (found ${emptyBeforeHashtags})`}`);
console.log(`✅ 6. Hashtags at end: ${hashtagLine > 0 ? '✓ PASS' : '✗ FAIL'}`);

console.log('\n' + '='.repeat(80));

const allPassed = !formatted.includes('hashtag#') && 
                  !formatted.includes('**') &&
                  maxConsecutiveInParagraphs === 0 &&
                  emptyBeforeHashtags === 2;

if (allPassed) {
  console.log('🎉 🎉 🎉 ALL CHECKS PASSED - READY FOR LINKEDIN! 🎉 🎉 🎉');
} else {
  console.log('⚠️  Some checks failed');
}
console.log('='.repeat(80));
