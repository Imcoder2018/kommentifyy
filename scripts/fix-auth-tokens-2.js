// Replace all authToken uses in template strings with getFreshToken() calls
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../kommentify-extension/src/background/index.js');
let content = fs.readFileSync(filePath, 'utf8');

// Replace all Authorization headers in template strings
content = content.replace(/Authorization: `Bearer \${authToken}`/g, 
  'Authorization: `Bearer ${await getFreshToken()}`');

// Replace all other authToken variable references with getFreshToken() calls
// This handles cases where authToken is used as a standalone variable
content = content.replace(/\$\{authToken\}/g, '${await getFreshToken()}');

fs.writeFileSync(filePath, content);
console.log('✅ Replaced all authToken in template strings with getFreshToken() calls');
