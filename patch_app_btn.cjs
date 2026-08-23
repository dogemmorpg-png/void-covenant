const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const heroButtonRegex = /(<button [^>]*onClick=\{\(\) => \{ audioSystem\.playClick\(\); setActiveTab\('hero'\); \}\}[\s\S]*?<\/button>)/;

const newButton = `

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
          </button>`;

if (heroButtonRegex.test(content)) {
  content = content.replace(heroButtonRegex, \`$1\${newButton}\`);
  fs.writeFileSync('src/App.tsx', content);
  console.log('Successfully injected Talents button');
} else {
  console.log('Failed to find hero button');
}
