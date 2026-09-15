import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useToast } from '../components/Toast';
import { Sparkles, Crown, Shield } from 'lucide-react';

export const MobileGachaView: React.FC = () => {
  const { profile, setIsShardsShopOpen } = useGame();
  const toast = useToast();
  
  const [activeCat, setActiveCat] = useState<'boosters'|'shields'|'level_boost'>('boosters');
  const [opening, setOpening] = useState(false);

  const buyPack = async (type: string, costStr: string) => {
    // simplified for mobile mock
    toast(`Opening ${type}...`, 'info');
    setOpening(true);
    setTimeout(() => {
      setOpening(false);
      toast(`Received items from ${type}!`, 'success');
    }, 1500);
  };

  return (
    <div className="w-full h-full flex bg-[#0c0f16] text-white">
      {/* Left Menu 25% */}
      <div className="w-[25%] h-full border-r border-white/10 flex flex-col p-1 gap-1 overflow-y-auto">
        <div className="text-[8px] font-display text-center text-amber-500 uppercase tracking-widest my-1">Shop</div>
        <button 
          onClick={() => setActiveCat('boosters')} 
          className={`p-1.5 rounded flex items-center justify-center flex-col gap-0.5 ${activeCat === 'boosters' ? 'bg-cyan-950 border border-cyan-500' : 'bg-black/40'}`}
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-[7px] font-bold uppercase">Boosters</span>
        </button>
        <button 
          onClick={() => setActiveCat('shields')} 
          className={`p-1.5 rounded flex items-center justify-center flex-col gap-0.5 ${activeCat === 'shields' ? 'bg-emerald-950 border border-emerald-500' : 'bg-black/40'}`}
        >
          <Shield className="w-4 h-4 text-emerald-400" />
          <span className="text-[7px] font-bold uppercase">Shields</span>
        </button>
        <button 
          onClick={() => setActiveCat('level_boost')} 
          className={`p-1.5 rounded flex items-center justify-center flex-col gap-0.5 ${activeCat === 'level_boost' ? 'bg-amber-950 border border-amber-500' : 'bg-black/40'}`}
        >
          <Crown className="w-4 h-4 text-amber-400" />
          <span className="text-[7px] font-bold uppercase">Ascension</span>
        </button>
      </div>

      {/* Right Content 75% */}
      <div className="w-[75%] h-full p-2 overflow-y-auto relative">
        {opening && (
          <div className="absolute inset-0 z-50 bg-black/90 flex items-center justify-center flex-col">
             <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
             <div className="text-[10px] font-display mt-2 text-cyan-400 tracking-widest">SUMMONING...</div>
          </div>
        )}

        {activeCat === 'boosters' && (
          <div className="grid grid-cols-2 gap-2 pb-10">
            <div className="bg-[#120e09] border border-amber-600/50 rounded-xl p-2 flex flex-col items-center">
              <img src="/packs/pack_bronze.webp" className="w-12 h-12 object-contain" />
              <div className="text-[9px] font-display font-bold mt-1 text-amber-300">BRONZE PACK</div>
              <button onClick={() => buyPack('Bronze', '1000 Gold')} className="mt-2 bg-amber-600 text-black text-[9px] font-bold py-1 px-3 rounded w-full">1000 GOLD</button>
            </div>
            <div className="bg-[#06111a] border border-cyan-500/50 rounded-xl p-2 flex flex-col items-center">
              <img src="/packs/pack_obsidian.webp" className="w-12 h-12 object-contain" />
              <div className="text-[9px] font-display font-bold mt-1 text-cyan-300">OBSIDIAN PACK</div>
              <button onClick={() => buyPack('Obsidian', '30 Shards')} className="mt-2 bg-cyan-600 text-black text-[9px] font-bold py-1 px-3 rounded w-full">30 SHARDS</button>
            </div>
          </div>
        )}
        
        {activeCat === 'shields' && (
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#05140f] border border-emerald-500/50 rounded-xl p-2 flex flex-col items-center">
              <img src="/icons/shield_3h.png" className="w-10 h-10 object-contain" />
              <div className="text-[9px] font-display font-bold mt-1 text-emerald-300">3H SHIELD</div>
              <button className="mt-2 bg-emerald-600 text-black text-[9px] font-bold py-1 px-3 rounded w-full">50 SHARDS</button>
            </div>
          </div>
        )}

        {activeCat === 'level_boost' && (
          <div className="grid grid-cols-1 gap-2">
             <div className="bg-[#200e06] border border-amber-500/50 rounded-xl p-3 flex flex-col items-center">
              <img src="/shop/ascension_sigil.png" className="w-12 h-12 object-contain" />
              <div className="text-[10px] font-display font-bold mt-1 text-amber-300">INSTANT LEVEL 50</div>
              <button className="mt-2 bg-amber-600 text-black text-[10px] font-bold py-1.5 px-4 rounded w-full">250 SHARDS</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
