const fs = require('fs');

let content = fs.readFileSync('src/components/CollectionDeckView.tsx', 'utf8');

// 1. Add Zap icon to CollectionDeckView
content = content.replace(
    "{skill.type === 'hex' && <><img src=\"/icons/icon_dust.png\" alt=\"Dust\" className=\"drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1\" /> Hex</>}",
    "{skill.type === 'hex' && <><Zap className=\"w-4 h-4 inline-block text-purple-400\" /> Hex</>}"
);

// 2. State for Fusion Confirm Modal
content = content.replace(
    "const [justFusedCardId, setJustFusedCardId] = useState<string | null>(null);",
    "const [justFusedCardId, setJustFusedCardId] = useState<string | null>(null);\n  const [fusionConfirmData, setFusionConfirmData] = useState<{card1: Card, card2: Card} | null>(null);"
);

// 3. Update executeFusionRitual
const oldExecute = `  const executeFusionRitual = () => {
    if (!fuseCardId1 || !fuseCardId2) return;
    
    const card1 = profile.collection.find(c => c.id === fuseCardId1);
    const card2 = profile.collection.find(c => c.id === fuseCardId2);
    if (!card1 || !card2) return;

    const isLevelUpgrade = card1.level < 5;
    const goldCost = isLevelUpgrade ? card1.level * 150 : 500;
    const dustCost = isLevelUpgrade ? card1.level * 20 : 100;

    const confirmMsg = isLevelUpgrade
      ? \`Are you sure you want to fuse two copies of \${card1.name} L\${card1.level} to create an L\${card1.level + 1} card for \${goldCost}<img src="/icons/icon_gold.png" alt="Gold" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" /> and \${dustCost}<img src="/icons/icon_dust.png" alt="Dust" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" />?\`
      : \`Are you sure you want to sacrifice both L5 \${card1.name} cards to create a new higher tier card for \${goldCost}<img src="/icons/icon_gold.png" alt="Gold" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" /> and \${dustCost}<img src="/icons/icon_dust.png" alt="Dust" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" />?\`;

    if (window.confirm(confirmMsg)) {
      const res = fuseCards(fuseCardId1, fuseCardId2);
      if (res.success) {
        audioSystem.playMagic();
        setIsFusingMode(false);
        setFuseCardId1(null);
        setFuseCardId2(null);
        toast(res.message, 'success');
        
        if (res.newCard) {
          setJustFusedCardId(res.newCard.id);
          setTimeout(() => setJustFusedCardId(null), 3000);
        }
      } else {
        toast(res.message, 'error');
      }
    }
  };`;

const newExecute = `  const executeFusionRitual = () => {
    if (!fuseCardId1 || !fuseCardId2) return;
    
    const card1 = profile.collection.find(c => c.id === fuseCardId1);
    const card2 = profile.collection.find(c => c.id === fuseCardId2);
    if (!card1 || !card2) return;

    setFusionConfirmData({ card1, card2 });
  };

  const confirmFusionRitual = () => {
    if (!fusionConfirmData) return;
    const res = fuseCards(fusionConfirmData.card1.id, fusionConfirmData.card2.id);
    if (res.success) {
      audioSystem.playMagic();
      setIsFusingMode(false);
      setFuseCardId1(null);
      setFuseCardId2(null);
      setFusionConfirmData(null);
      toast(res.message, 'success');
      
      if (res.newCard) {
        setJustFusedCardId(res.newCard.id);
        setTimeout(() => setJustFusedCardId(null), 3000);
      }
    } else {
      toast(res.message, 'error');
      setFusionConfirmData(null);
    }
  };`;

content = content.replace(oldExecute, newExecute);

// 4. Render modal at the bottom of the component
const modalJSX = `
      {/* Fusion Confirm Modal */}
      {fusionConfirmData && (() => {
        const c1 = fusionConfirmData.card1;
        const isLevelUpgrade = c1.level < 5;
        const goldCost = isLevelUpgrade ? c1.level * 150 : 500;
        const dustCost = isLevelUpgrade ? c1.level * 20 : 100;
        return (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-[#151a21] border border-purple-500/50 rounded-2xl p-6 max-w-sm w-full shadow-[0_0_50px_rgba(168,85,247,0.15)] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent pointer-events-none" />
              
              <div className="text-center relative z-10">
                <Skull className="w-12 h-12 text-purple-400 mx-auto mb-4 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                <h2 className="text-xl font-display font-black text-white uppercase tracking-widest mb-2 text-shadow-gold">Confirm Ritual</h2>
                
                <p className="text-gray-300 font-sans text-sm mb-6 leading-relaxed">
                  {isLevelUpgrade 
                    ? \`Fuse two copies of \${c1.name} L\${c1.level} to create a powerful L\${c1.level + 1} creature?\`
                    : \`Sacrifice both L5 \${c1.name} cards to create a new higher tier entity?\`
                  }
                </p>

                <div className="flex justify-center gap-6 mb-6 bg-black/40 py-3 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500 font-bold font-mono">{goldCost}</span>
                    <img src="/icons/icon_gold.png" alt="Gold" className="w-5 h-5 drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#66fcf1] font-bold font-mono">{dustCost}</span>
                    <img src="/icons/icon_dust.png" alt="Dust" className="w-5 h-5 drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125" />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setFusionConfirmData(null)} className="flex-1 bg-[#0b0c10] hover:bg-gray-800 border border-gray-700/50 text-gray-400 font-mono text-xs py-3 rounded-xl transition-all">
                    CANCEL
                  </button>
                  <button onClick={confirmFusionRitual} className="flex-1 bg-gradient-to-r from-purple-900 to-[#4e0707] hover:from-purple-600 hover:to-red-700 border border-purple-500/50 text-white font-display font-black tracking-widest py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                    CONFIRM
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
`;

content = content.replace("</div>\n    </div>\n  );\n};", `${modalJSX}    </div>\n    </div>\n  );\n};`);

// 5. Add images to the Card1 and Card2 slots in the Fusion Menu
const card1SlotOld = `<div className="w-16 h-20 bg-purple-950/20 border border-purple-500/50 rounded-lg flex flex-col justify-center items-center text-xs text-white">
                      <span className="font-display font-bold text-[10px] block truncate max-w-[55px]">
                        {profile.collection.find(c => c.id === fuseCardId1)?.name}
                      </span>`;
const card1SlotNew = `<div className="w-16 h-20 bg-purple-950/20 border border-purple-500/50 rounded-lg flex flex-col justify-center items-center text-xs text-white relative overflow-hidden">
                      {profile.collection.find(c => c.id === fuseCardId1)?.image?.startsWith('/') && (
                        <img src={profile.collection.find(c => c.id === fuseCardId1)?.image} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                      )}
                      <span className="font-display font-bold text-[10px] block truncate max-w-[55px] relative z-10 drop-shadow-[0_2px_2px_rgba(0,0,0,1)] px-1 text-center leading-tight">
                        {profile.collection.find(c => c.id === fuseCardId1)?.name}
                      </span>`;

const card2SlotOld = `<div className="w-16 h-20 bg-purple-950/20 border border-purple-500/50 rounded-lg flex flex-col justify-center items-center text-xs text-white">
                      <span className="font-display font-bold text-[10px] block truncate max-w-[55px]">
                        {profile.collection.find(c => c.id === fuseCardId2)?.name}
                      </span>`;
const card2SlotNew = `<div className="w-16 h-20 bg-purple-950/20 border border-purple-500/50 rounded-lg flex flex-col justify-center items-center text-xs text-white relative overflow-hidden">
                      {profile.collection.find(c => c.id === fuseCardId2)?.image?.startsWith('/') && (
                        <img src={profile.collection.find(c => c.id === fuseCardId2)?.image} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                      )}
                      <span className="font-display font-bold text-[10px] block truncate max-w-[55px] relative z-10 drop-shadow-[0_2px_2px_rgba(0,0,0,1)] px-1 text-center leading-tight">
                        {profile.collection.find(c => c.id === fuseCardId2)?.name}
                      </span>`;

content = content.replace(card1SlotOld, card1SlotNew);
content = content.replace(card2SlotOld, card2SlotNew);

fs.writeFileSync('src/components/CollectionDeckView.tsx', content);

// 6. Fix BattleFieldView getSkillIcon
let battleContent = fs.readFileSync('src/components/BattleFieldView.tsx', 'utf8');
battleContent = battleContent.replace(
    "case 'hex': return <img src=\"/icons/icon_dust.png\" alt=\"Dust\" className=\"drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-5 h-5 inline-block align-text-bottom mx-1\" />;",
    "case 'hex': return <Zap className=\"w-4 h-4 inline-block text-purple-400 mx-0.5\" />;"
);
fs.writeFileSync('src/components/BattleFieldView.tsx', battleContent);

console.log("Done");
