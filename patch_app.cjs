const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add import
content = content.replace(
  /import \{ HeroInventoryView \} from '.\/components\/HeroInventoryView';/,
  `import { HeroInventoryView } from './components/HeroInventoryView';\nimport { TalentsView } from './components/TalentsView';`
);

// 2. Add 'talents' to activeTab state
content = content.replace(
  /useState<'campaign' \| 'pvp' \| 'collection' \| 'hero' \| 'altar' \| 'airdrop' \| 'battlepass'>/,
  `useState<'campaign' | 'pvp' | 'collection' | 'hero' | 'talents' | 'altar' | 'airdrop' | 'battlepass'>`
);

// 3. Add the view rendering
content = content.replace(
  /\{activeTab === 'hero' && <HeroInventoryView \/>\}/,
  `{activeTab === 'hero' && <HeroInventoryView />}\n          {activeTab === 'talents' && <TalentsView />}`
);

// 4. Add the Navigation button next to Hero Tab
content = content.replace(
  /\{activeTab === 'hero'[\s\S]*?<\/span>\n\s*<\/button>/,
  `{activeTab === 'hero'
                ? 'text-[#ebd09b] bg-black/40 border border-[#c5a880]/30 shadow-md'
                : 'text-gray-400 hover:text-white'
            }\`}
          >
            <UserCircle2 className="w-5 h-5" />
            <span className="text-[10px] font-display font-bold tracking-wider">LORD</span>
          </button>

          {/* Talents Tab */}
          <button onMouseEnter={() => audioSystem.playHover()} onClick={() => { audioSystem.playClick(); setActiveTab('talents'); }}
            className={\`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer \${
              activeTab === 'talents'
                ? 'text-[#ebd09b] bg-black/40 border border-[#c5a880]/30 shadow-md'
                : 'text-gray-400 hover:text-white'
            }\`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] font-display font-bold tracking-wider">TALENTS</span>
          </button>`
);

fs.writeFileSync('src/App.tsx', content);
console.log('Patched App.tsx');
