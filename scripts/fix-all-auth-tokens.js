// Comprehensive fix: Replace ALL authToken uses with getFreshToken() calls
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../kommentify-extension/src/background/index.js');
let content = fs.readFileSync(filePath, 'utf8');

// Add getFreshToken helper at the top if not exists
if (!content.includes('const getFreshToken = async () => {')) {
  content = `// Global helper to get fresh token from storage
const getFreshToken = async () => {
  const storage = await chrome.storage.local.get(['authToken']);
  return storage.authToken;
};

` + content;
}

// Replace all Authorization headers with getFreshToken()
content = content.replace(/Authorization: `Bearer \${authToken}`/g, 
  'Authorization: `Bearer ${await getFreshToken()}`');
content = content.replace(/Authorization: `Bearer \${token}`/g, 
  'Authorization: `Bearer ${await getFreshToken()}`');

// Replace standalone authToken checks
content = content.replace(/if \(!authToken\) \{/g, 'if (!(await getFreshToken())) {');
content = content.replace(/if \(!authToken\) return/g, 'if (!(await getFreshToken())) return');

// Replace authToken variable declarations that shadow getFreshToken
content = content.replace(/const \{ authToken, apiBaseUrl \} = await chrome\.storage\.local\.get\(\['authToken', 'apiBaseUrl'\]\);/g, 
  'const { apiBaseUrl } = await chrome.storage.local.get([\'apiBaseUrl\']);');
content = content.replace(/const \{ authToken, apiBaseUrl, commentSettings \} = await chrome\.storage\.local\.get\(\['authToken', 'apiBaseUrl', 'commentSettings'\]\);/g, 
  'const { apiBaseUrl, commentSettings } = await chrome.storage.local.get([\'apiBaseUrl\', \'commentSettings\']);');

// Replace token variable declarations
content = content.replace(/const token = storage\.authToken;/g, 'const token = await getFreshToken();');

// Replace standalone authToken checks
content = content.replace(/if \(!authToken\) \{/g, 'if (!(await getFreshToken())) {');
content = content.replace(/if \(!authToken\) return/g, 'if (!(await getFreshToken())) return');

// Fix the specific case where authToken is used directly
content = content.replace(/if \(!authToken\) return \{ success: false, error: 'Not authenticated\.\' \};/g, 
  'if (!(await getFreshToken())) return { success: false, error: \'Not authenticated.\' };');

fs.writeFileSync(filePath, content);
console.log('✅ Replaced ALL authToken uses with getFreshToken() calls');
