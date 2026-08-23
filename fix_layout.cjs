const fs = require('fs');
let content = fs.readFileSync('src/components/HeroInventoryView.tsx', 'utf8');

// The replacement logic:
const newLayout = `
  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <h2 className="font-display font-black text-3xl md:text-4xl text-white tracking-widest text-shadow-gold">
          LORD PROFILE
        </h2>
        <p className="text-sm text-gray-400 font-sans max-w-xl mx-auto">
          Equip powerful relics and enhance your combat stances.
        </p>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex gap-4 justify-center max-w-md mx-auto">
        <button 
          onClick={() => setSubTab('equipment')}
          className={\`flex-1 py-3 rounded-xl font-display font-bold tracking-widest text-sm transition-all \${subTab === 'equipment' ? 'bg-purple-900/40 text-purple-300 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-black/40 text-gray-500 border border-transparent hover:bg-black/60'}\`}
        >
          EQUIPMENT
        </button>
        <button 
          onClick={() => setSubTab('talents')}
          className={\`flex-1 py-3 rounded-xl font-display font-bold tracking-widest text-sm transition-all \${subTab === 'talents' ? 'bg-amber-900/40 text-amber-400 border border-amber-500/50 shadow-[0_0_15px_rgba(251,191,36,0.2)]' : 'bg-black/40 text-gray-500 border border-transparent hover:bg-black/60'}\`}
        >
          TALENTS
        </button>
      </div>

      {subTab === 'equipment' ? (
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Left Stats Panel */}
            <div className="md:col-span-5 bg-[#151a21] border border-[#c5a880]/30 rounded-3xl p-6 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-b from-purple-900 to-black border-2 border-[#ebd09b] flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(235,208,155,0.2)]">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <UserCircle2 className="w-12 h-12 text-[#ebd09b]" />
                )}
              </div>
              
              <h3 className="font-display font-black text-2xl text-white tracking-widest mb-1 text-center">
                {profile.username || 'Abyssal Lord'}
              </h3>
              <div className="text-[#ebd09b] font-mono text-sm font-bold bg-[#ebd09b]/10 px-3 py-1 rounded-full mb-6">
                LEVEL {profile.level}
              </div>

              <div className="w-full space-y-4 font-mono text-sm">
                {/* EXP Bar */}
                <div>
                  <div className="flex justify-between text-gray-400 text-[10px] uppercase font-bold mb-1">
                    <span>EXP</span>
                    <span>{Math.floor(profile.exp)} / {reqExp}</span>
                  </div>
                  <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-white/10">
                    <div className="h-full bg-emerald-500" style={{ width: \`\${expPercent}%\` }} />
                  </div>
                </div>

                {/* Stats */}
                <div className="bg-black/50 p-4 rounded-xl border border-white/5 space-y-3 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Max Health</span>
                    <span className="text-emerald-400 font-bold">
                      {profile.heroMaxHealth} <span className="text-emerald-500/50 text-xs">+{bonusMaxHealth}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Equipment Panel */}
            <div className="md:col-span-7 bg-[#151a21] border border-purple-900/30 rounded-3xl p-6 relative overflow-hidden gothic-glow-purple">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.05),transparent_70%)] pointer-events-none" />
              
              <h3 className="font-display font-black text-xl text-purple-300 tracking-widest mb-6 text-center border-b border-purple-900/50 pb-4">
                EQUIPPED RELICS
              </h3>

              <div className="flex justify-center items-center h-64 relative">
                {/* Center Avatar silhouette or logo */}
                <div className="w-24 h-32 bg-black/40 border border-white/5 rounded-xl absolute flex items-center justify-center">
                  <UserCircle2 className="w-12 h-12 text-gray-700" />
                </div>

                {/* Equipment Grid Layout */}
                <div className="grid grid-cols-2 gap-x-28 gap-y-4 absolute z-10">
                  <div className="flex flex-col gap-4">
                    {renderEquipmentBox(eqHelmet, 'helmet')}
                    {renderEquipmentBox(eqWeapon, 'weapon')}
                    {renderEquipmentBox(eqRing, 'ring')}
                  </div>
                  <div className="flex flex-col gap-4">
                    {renderEquipmentBox(eqAmulet, 'amulet')}
                    {renderEquipmentBox(eqArmor, 'armor')}
                    {renderEquipmentBox(eqBoots, 'boots')}
                  </div>
                </div>
              </div>

              {selectedSlot && profile.equipped[selectedSlot] && (
                <div className="mt-8 flex justify-center relative z-20">
                  <button 
                    onClick={() => unequipItem(selectedSlot)}
                    className="bg-red-900/40 hover:bg-red-900/80 text-red-400 border border-red-500/30 px-6 py-2 rounded-lg font-mono text-xs uppercase tracking-widest transition-all"
                  >
                    Unequip {selectedSlot}
                  </button>
                </div>
              )}
            </div>
          </div>
          {renderInventoryList()}
        </div>
      ) : (
        <TalentsView />
      )}
    </div>
  );
};
`;

const startIndex = content.indexOf('  return (');
content = content.substring(0, startIndex) + newLayout;

fs.writeFileSync('src/components/HeroInventoryView.tsx', content);
console.log('Layout fixed successfully');
