// Replace all authToken uses with getFreshToken() calls in background/index.js
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../kommentify-extension/src/background/index.js');
let content = fs.readFileSync(filePath, 'utf8');

// Replace all authToken uses in Authorization headers with getFreshToken()
// Pattern: Authorization: `Bearer ${authToken}`
content = content.replace(
  /Authorization: `Bearer \${authToken}`/g,
  'Authorization: `Bearer ${await getFreshToken()}`'
);

// Replace all other authToken uses with getFreshToken()
content = content.replace(
  /const \{ authToken, apiBaseUrl \} = await chrome\.storage\.local\.get\(\['authToken', 'apiBaseUrl'\]\);/g,
  'const { apiBaseUrl } = await chrome.storage.local.get([\'apiBaseUrl\']);'
);

// Remove the authToken variable declaration since we're using getFreshToken()
content = content.replace(
  /const authToken = await getFreshToken\(\);/g,
  '// authToken now fetched via getFreshToken()'
);

// Remove the authToken check since getFreshToken() handles it
content = content.replace(
  /if \(!authToken\) \{ globalThis\._pollCommandsRunning = false; return; \}/g,
  'if (!(await getFreshToken())) { globalThis._pollCommandsRunning = false; return; }'
);

fs.writeFileSync(filePath, content);
console.log('✅ Replaced all authToken uses with getFreshToken() calls');
