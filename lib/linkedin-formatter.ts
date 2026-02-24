/**
 * LinkedIn Content Formatter
 * Converts AI-generated markdown content to LinkedIn-friendly format
 */

/**
 * Convert regular text to Unicode bold for LinkedIn
 */
function toBoldUnicode(text: string): string {
  const boldMap: { [key: string]: string } = {
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

export function formatForLinkedIn(content: string): string {
  if (!content) return '';

  let formatted = content;

  // 1. Fix hashtag format: "hashtag#SEO" -> "#SEO"
  formatted = formatted.replace(/hashtag#/g, '#');

  // 2. Convert markdown bold (**text**) to Unicode bold for LinkedIn
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, (match, text) => {
    return toBoldUnicode(text);
  });

  // 3. Extract hashtags from the content (#28: Only match proper hashtags, not #1, #2, etc.)
  const hashtagMatches = formatted.match(/#[A-Za-z]\w*/g) || [];

  // Remove proper hashtags from content temporarily (leave #1, #2, etc. alone)
  let contentWithoutHashtags = formatted.replace(/#[A-Za-z]\w*/g, '').trim();

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

/**
 * Formats topic lines for LinkedIn
 */
export function formatTopicsForLinkedIn(topics: string[]): string[] {
  return topics.map(topic => {
    let formatted = topic.trim();

    // Remove any markdown formatting from topics
    formatted = formatted.replace(/\*\*/g, '');
    formatted = formatted.replace(/\*/g, '');

    // Ensure proper capitalization
    if (formatted.length > 0) {
      formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }

    return formatted;
  });
}

/**
 * Formats comments for LinkedIn
 */
export function formatCommentForLinkedIn(comment: string): string {
  if (!comment) return '';

  let formatted = comment;

  // Remove any markdown formatting that doesn't work well in comments
  formatted = formatted.replace(/#{1,6}\s/g, ''); // Remove header markers

  // Fix hashtags
  formatted = formatted.replace(/hashtag#/g, '#');

  // Replace em dashes and en dashes with regular dashes or commas
  formatted = formatted.replace(/—/g, ' - '); // em dash to regular dash with spaces
  formatted = formatted.replace(/–/g, '-'); // en dash to regular dash

  // Remove overused words like "curious" variations
  formatted = formatted.replace(/\bcurious\b/gi, 'wondering');
  formatted = formatted.replace(/\bcuriosity\b/gi, 'interest');

  // Remove ALL emojis - comprehensive emoji regex pattern
  formatted = formatted.replace(/[\u{1F600}-\u{1F64F}]/gu, ''); // Emoticons
  formatted = formatted.replace(/[\u{1F300}-\u{1F5FF}]/gu, ''); // Misc Symbols and Pictographs
  formatted = formatted.replace(/[\u{1F680}-\u{1F6FF}]/gu, ''); // Transport and Map
  formatted = formatted.replace(/[\u{1F1E0}-\u{1F1FF}]/gu, ''); // Flags
  formatted = formatted.replace(/[\u{2600}-\u{26FF}]/gu, ''); // Misc symbols
  formatted = formatted.replace(/[\u{2700}-\u{27BF}]/gu, ''); // Dingbats
  formatted = formatted.replace(/[\u{FE00}-\u{FE0F}]/gu, ''); // Variation Selectors
  formatted = formatted.replace(/[\u{1F900}-\u{1F9FF}]/gu, ''); // Supplemental Symbols and Pictographs
  formatted = formatted.replace(/[\u{1FA00}-\u{1FA6F}]/gu, ''); // Chess Symbols
  formatted = formatted.replace(/[\u{1FA70}-\u{1FAFF}]/gu, ''); // Symbols and Pictographs Extended-A
  formatted = formatted.replace(/[\u{231A}-\u{231B}]/gu, ''); // Watch, Hourglass
  formatted = formatted.replace(/[\u{23E9}-\u{23F3}]/gu, ''); // Various symbols
  formatted = formatted.replace(/[\u{23F8}-\u{23FA}]/gu, ''); // Various symbols
  formatted = formatted.replace(/[\u{25AA}-\u{25AB}]/gu, ''); // Squares
  formatted = formatted.replace(/[\u{25B6}]/gu, ''); // Play button
  formatted = formatted.replace(/[\u{25C0}]/gu, ''); // Reverse button
  formatted = formatted.replace(/[\u{25FB}-\u{25FE}]/gu, ''); // Squares
  formatted = formatted.replace(/[\u{2614}-\u{2615}]/gu, ''); // Umbrella, Hot beverage
  formatted = formatted.replace(/[\u{2648}-\u{2653}]/gu, ''); // Zodiac
  formatted = formatted.replace(/[\u{267F}]/gu, ''); // Wheelchair
  formatted = formatted.replace(/[\u{2693}]/gu, ''); // Anchor
  formatted = formatted.replace(/[\u{26A1}]/gu, ''); // High voltage
  formatted = formatted.replace(/[\u{26AA}-\u{26AB}]/gu, ''); // Circles
  formatted = formatted.replace(/[\u{26BD}-\u{26BE}]/gu, ''); // Soccer, Baseball
  formatted = formatted.replace(/[\u{26C4}-\u{26C5}]/gu, ''); // Snowman, Sun
  formatted = formatted.replace(/[\u{26CE}]/gu, ''); // Ophiuchus
  formatted = formatted.replace(/[\u{26D4}]/gu, ''); // No entry
  formatted = formatted.replace(/[\u{26EA}]/gu, ''); // Church
  formatted = formatted.replace(/[\u{26F2}-\u{26F3}]/gu, ''); // Fountain, Golf
  formatted = formatted.replace(/[\u{26F5}]/gu, ''); // Sailboat
  formatted = formatted.replace(/[\u{26FA}]/gu, ''); // Tent
  formatted = formatted.replace(/[\u{26FD}]/gu, ''); // Fuel pump
  formatted = formatted.replace(/[\u{2702}]/gu, ''); // Scissors
  formatted = formatted.replace(/[\u{2705}]/gu, ''); // Check mark
  formatted = formatted.replace(/[\u{2708}-\u{270D}]/gu, ''); // Airplane to Writing hand
  formatted = formatted.replace(/[\u{270F}]/gu, ''); // Pencil
  formatted = formatted.replace(/[\u{2712}]/gu, ''); // Black nib
  formatted = formatted.replace(/[\u{2714}]/gu, ''); // Check mark
  formatted = formatted.replace(/[\u{2716}]/gu, ''); // X mark
  formatted = formatted.replace(/[\u{271D}]/gu, ''); // Latin cross
  formatted = formatted.replace(/[\u{2721}]/gu, ''); // Star of David
  formatted = formatted.replace(/[\u{2728}]/gu, ''); // Sparkles
  formatted = formatted.replace(/[\u{2733}-\u{2734}]/gu, ''); // Eight spoked asterisk
  formatted = formatted.replace(/[\u{2744}]/gu, ''); // Snowflake
  formatted = formatted.replace(/[\u{2747}]/gu, ''); // Sparkle
  formatted = formatted.replace(/[\u{274C}]/gu, ''); // Cross mark
  formatted = formatted.replace(/[\u{274E}]/gu, ''); // Cross mark
  formatted = formatted.replace(/[\u{2753}-\u{2755}]/gu, ''); // Question marks
  formatted = formatted.replace(/[\u{2757}]/gu, ''); // Exclamation mark
  formatted = formatted.replace(/[\u{2763}-\u{2764}]/gu, ''); // Heart exclamation, Heart
  formatted = formatted.replace(/[\u{2795}-\u{2797}]/gu, ''); // Plus, Minus, Division
  formatted = formatted.replace(/[\u{27A1}]/gu, ''); // Right arrow
  formatted = formatted.replace(/[\u{27B0}]/gu, ''); // Curly loop
  formatted = formatted.replace(/[\u{27BF}]/gu, ''); // Double curly loop
  formatted = formatted.replace(/[\u{2934}-\u{2935}]/gu, ''); // Arrows
  formatted = formatted.replace(/[\u{2B05}-\u{2B07}]/gu, ''); // Arrows
  formatted = formatted.replace(/[\u{2B1B}-\u{2B1C}]/gu, ''); // Squares
  formatted = formatted.replace(/[\u{2B50}]/gu, ''); // Star
  formatted = formatted.replace(/[\u{2B55}]/gu, ''); // Circle
  formatted = formatted.replace(/[\u{3030}]/gu, ''); // Wavy dash
  formatted = formatted.replace(/[\u{303D}]/gu, ''); // Part alternation mark
  formatted = formatted.replace(/[\u{3297}]/gu, ''); // Circled Ideograph Congratulation
  formatted = formatted.replace(/[\u{3299}]/gu, ''); // Circled Ideograph Secret

  // Clean up double spaces
  formatted = formatted.replace(/\s{2,}/g, ' ');

  // Clean up spacing
  formatted = formatted.trim();

  return formatted;
}
