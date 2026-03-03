const jwt = require('jsonwebtoken');
const fs = require('fs');
const envContent = fs.readFileSync('.env', 'utf8');
const envProd = fs.readFileSync('.env.production.local', 'utf8');
const match = envProd.match(/JWT_SECRET="([^"]+?)"/);
const JWT_SECRET = match ? match[1].trim() : null;
if (!JWT_SECRET) { console.error('No JWT_SECRET found'); process.exit(1); }

const token = jwt.sign({ userId: 'user_1770223918257_cqudq9n2w', email: 'arman@arwebcraftslive.com' }, JWT_SECRET, { expiresIn: '1h' });

console.log('Generated test token for user_1770223918257_cqudq9n2w');
console.log('Calling https://kommentify.com/api/extension/command ...');

fetch('https://kommentify.com/api/extension/command?_t=' + Date.now(), {
  method: 'GET',
  headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' }
}).then(r => r.json()).then(data => {
  console.log('RESPONSE:', JSON.stringify(data, null, 2));
}).catch(e => console.error('ERROR:', e));
