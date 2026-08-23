const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove button
content = content.replace(
  /\{\/\* Talents Tab \*\/\}\s*<button[\s\S]*?<\/button>\s*/,
  ``
);

// 2. Remove render block
content = content.replace(
  /\{activeTab === 'talents' && <TalentsView \/>\}\n\s*/,
  ``
);

// 3. We can leave the import and state alone, they won't hurt, but let's clean them up.
content = content.replace(
  /import \{ TalentsView \} from '\.\/components\/TalentsView';\n/,
  ``
);

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx cleaned');
