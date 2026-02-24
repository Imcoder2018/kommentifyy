/**
 * Clean LinkedIn profile URLs by removing query parameters and extra path segments
 * Examples:
 * - https://www.linkedin.com/in/ankit-k-514241215?miniProfileUrn=... -> https://www.linkedin.com/in/ankit-k-514241215
 * - linkedin.com/in/john-doe/ -> https://www.linkedin.com/in/john-doe
 */

export function cleanLinkedInProfileUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  
  // Trim whitespace
  url = url.trim();
  
  // Add https:// if missing protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  
  try {
    const urlObj = new URL(url);
    
    // Only process linkedin.com URLs
    if (!urlObj.hostname.includes('linkedin.com')) {
      return url;
    }
    
    // Extract the path and remove trailing slash
    let path = urlObj.pathname.replace(/\/$/, '');
    
    // Match /in/username or /in/username/anything-else
    const match = path.match(/^\/in\/([^\/]+)/);
    if (match) {
      // Return clean URL with just the username
      return `https://www.linkedin.com/in/${match[1]}`;
    }
    
    // If no match, return the base URL without query params
    return `${urlObj.protocol}//${urlObj.hostname}${path}`;
  } catch (e) {
    // If URL parsing fails, try simple regex extraction
    const simpleMatch = url.match(/linkedin\.com\/in\/([^\/\?&#]+)/i);
    if (simpleMatch) {
      return `https://www.linkedin.com/in/${simpleMatch[1]}`;
    }
    return url;
  }
}

/**
 * Clean multiple LinkedIn URLs from a text input (space or newline separated)
 */
export function cleanLinkedInProfileUrls(text: string): string[] {
  if (!text || typeof text !== 'string') return [];
  
  // Split by newlines and spaces
  const urls = text.split(/[\s\n]+/).filter(u => u.trim().length > 0);
  
  // Clean each URL and filter out duplicates
  const cleanedUrls = urls.map(cleanLinkedInProfileUrl).filter(u => u.length > 0);
  
  // Remove duplicates
  return Array.from(new Set(cleanedUrls));
}
