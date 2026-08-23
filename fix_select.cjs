const fs = require('fs');

const files = ['api/gacha.ts', 'api/battle.ts', 'api/action.ts', 'api/sync.ts'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\.select\('id'\)/g, `.select('wallet_address')`);
  // Also check if I used select('id') anywhere else for profiles
  content = content.replace(/\.select\('id'\)\.eq\('wallet_address'/g, `.select('wallet_address').eq('wallet_address'`);
  fs.writeFileSync(file, content);
}
console.log('Fixed select calls');
