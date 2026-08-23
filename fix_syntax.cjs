const fs = require('fs');
let content = fs.readFileSync('src/components/TalentsView.tsx', 'utf8');

content = content.replace(/'Warlord\\'s Cry'/g, \`"Warlord's Cry"\`);

fs.writeFileSync('src/components/TalentsView.tsx', content);
console.log('Fixed syntax error in TalentsView.tsx');
