const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add import if not present
if (!content.includes("import { TalentsView }")) {
  content = content.replace(
    /import \{ HeroInventoryView \} from '.\/components\/HeroInventoryView';/,
    \`import { HeroInventoryView } from './components/HeroInventoryView';\nimport { TalentsView } from './components/TalentsView';\`
  );
}

// Add state if not present
if (!content.includes("'talents' | 'altar'")) {
  content = content.replace(
    /useState<'campaign' \| 'pvp' \| 'collection' \| 'hero' \| 'altar'/,
    \`useState<'campaign' | 'pvp' | 'collection' | 'hero' | 'talents' | 'altar'\`
  );
}

// Add render block if not present
if (!content.includes("{activeTab === 'talents' && <TalentsView />}")) {
  content = content.replace(
    /\{activeTab === 'hero' && <HeroInventoryView \/>\}/,
    \`{activeTab === 'hero' && <HeroInventoryView />}\n          {activeTab === 'talents' && <TalentsView />}\`
  );
}

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx patched for talents tab state');
