import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useToast } from './Toast';
import { generateCampaignStage } from '../data/cards';
import { CampaignStage } from '../types';
import { Skull, Swords, Award, ChevronLeft, ChevronRight, Crown, Star, FastForward } from 'lucide-react';
import { assetPreloader } from '../utils/assetPreloader';

interface CampaignViewProps {
  onStartBattle: (stage: CampaignStage) => void;
}

export const CampaignView: React.FC<CampaignViewProps> = ({ onStartBattle }) => {
  const { profile, submitAction } = useGame();
  const toast = useToast();
  const [isSweeping, setIsSweeping] = useState(false);
  
  const maxFloor = profile.pveProgress || 1;
  const [viewingFloor, setViewingFloor] = useState<number>(maxFloor);
  
  // Auto-update viewing floor if player progresses
  useEffect(() => {
    if (viewingFloor < maxFloor && viewingFloor === maxFloor - 1) {
      setViewingFloor(maxFloor);
    }
  }, [maxFloor]);

  const selectedStage = generateCampaignStage(viewingFloor);

  // Preload enemy creatures for the currently viewed campaign stage
  useEffect(() => {
    if (selectedStage?.enemyDeck) {
      assetPreloader.preloadBattleCreatures(selectedStage.enemyDeck);
    }
  }, [viewingFloor]);

  const [timeUntilRegen, setTimeUntilRegen] = useState<string>('');
  useEffect(() => {
    const pveRegenTime = 1200000;
    const updateTimer = () => {
      if ((profile.pveEnergy || 0) >= (profile.pveEnergyMax || 10)) {
        setTimeUntilRegen('');
        return;
      }
      const lastPve = profile.lastPveEnergyRefill ?? profile.lastEnergyRefill ?? Date.now();
      const timePassed = Date.now() - lastPve;
      const timeLeft = Math.max(0, pveRegenTime - (timePassed % pveRegenTime));
      const minutes = Math.floor(timeLeft / 60000);
      const seconds = Math.floor((timeLeft % 60000) / 1000);
      setTimeUntilRegen(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [profile.pveEnergy, profile.pveEnergyMax, profile.lastPveEnergyRefill, profile.lastEnergyRefill]);

  const isBoss = viewingFloor % 10 === 0;
  const stageStars = profile.campaignStars?.[selectedStage.id.toString()] || 0;

  const handleStart = () => {
    if (profile.deck.length < 10) {
      toast('Your Combat Deck must have exactly 10 cards to fight! Go to CARDS tab.', 'warning');
      return;
    }
    if ((profile.pveEnergy || 0) < selectedStage.energyCost) {
      toast('Not enough PvE energy! Wait for recovery.', 'warning');
      return;
    }
    onStartBattle(selectedStage);
  };

  const handleSweep = async () => {
    if (isSweeping) return;
    if ((profile.pveEnergy || 0) < selectedStage.energyCost) {
      toast('Not enough PvE energy for a sweep!', 'warning');
      return;
    }
    setIsSweeping(true);
    try {
      const res = await submitAction('sweep_stage', { floorNum: viewingFloor });
      if (!res.success) {
        toast(res.message, 'error');
      } else {
        toast(res.message, 'success');
      }
    } finally {
      setIsSweeping(false);
    }
  };

  const handlePrev = () => {
    if (viewingFloor > 1) setViewingFloor(viewingFloor - 1);
  };

  const handleNext = () => {
    if (viewingFloor < maxFloor) setViewingFloor(viewingFloor + 1);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 flex items-center justify-center min-h-[calc(100vh-220px)] animate-fadeIn">
      
      {/* Unified Majestic Slate Panel */}
      <div className={`glass-panel rounded-3xl pt-8 px-8 pb-5 w-full relative overflow-hidden flex flex-col justify-between ${
        isBoss 
          ? 'border-red-950/60 shadow-[0_0_50px_rgba(220,38,38,0.12)]' 
          : 'border-[#ebd09b]/20 shadow-[0_0_40px_rgba(0,0,0,0.8)]'
      }`}>
        
        {/* Glow overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(235,208,155,0.02)_0%,transparent_70%)] pointer-events-none" />
        {isBoss && <div className="absolute inset-0 bg-red-950/5 pointer-events-none" />}

        {/* Decorative corner brackets */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#ebd09b]/35 pointer-events-none" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#ebd09b]/35 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#ebd09b]/35 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#ebd09b]/35 pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
          
          {/* Row 1: Title & Description Centered with Prominent Energy Badge */}
          <div className="text-center border-b border-gray-800/80 pb-4 flex flex-col items-center">
            <h2 className="font-display font-black text-2xl md:text-3xl text-white tracking-widest text-shadow-gold">
              THE ENDLESS ABYSS
            </h2>
            <p className="text-xs text-gray-400 mt-1.5 max-w-xl mx-auto font-sans leading-relaxed">
              Descend into the infinite depths. Defeat the dark entities to claim ancient resources.
            </p>

            {/* Prominent Centered Energy Badge */}
            <div className="mt-3.5 inline-flex items-center gap-2.5 bg-gradient-to-r from-[#061c12] via-black to-[#061c12] border border-emerald-500/50 hover:border-emerald-400/80 rounded-full px-4 py-1.5 shadow-[0_0_18px_rgba(16,185,129,0.25)] select-none transition-all cursor-default">
              <img src="/icons/icon_energy.webp" alt="Energy" className="w-5 h-5 object-contain drop-shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
              <div className="flex items-baseline gap-1.5 leading-none">
                <span className="font-display font-bold text-xs text-gray-300 tracking-wider">ENERGY:</span>
                <span className="font-mono text-sm font-black text-emerald-400">
                  {profile.pveEnergy || 0}
                </span>
                <span className="font-mono text-xs font-bold text-emerald-500/70">
                  / {profile.pveEnergyMax || 10}
                </span>
              </div>
              <span className="font-mono text-[11px] text-emerald-300/90 font-bold border-l border-emerald-500/30 pl-2">
                {timeUntilRegen ? `+1 in ${timeUntilRegen}` : 'Full Energy'}
              </span>
            </div>
          </div>

          {/* Row 2: Large Centered Floor Selector */}
          <div className="flex justify-center items-center py-2">
            <div className="flex items-center gap-8 bg-black/40 border border-gray-800/50 rounded-[32px] py-4.5 px-8 shadow-inner">
              <button 
                onClick={handlePrev}
                disabled={viewingFloor === 1}
                className="p-4 rounded-2xl bg-black/40 border border-[#ebd09b]/25 hover:border-[#ebd09b]/60 text-[#ebd09b] hover:bg-[#ebd09b]/10 disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer shadow-md"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>

              <div className="flex flex-col items-center w-44 select-none">
                <span className={`text-[11px] font-mono tracking-widest uppercase font-bold ${isBoss ? 'text-red-500 animate-pulse' : 'text-[#ebd09b]'}`}>
                  {isBoss ? 'Boss Floor' : 'Floor'}
                </span>
                <div className="text-6xl font-display font-black text-white text-shadow-gold leading-none my-1">
                  {viewingFloor}
                </div>
                
                {/* Stars display directly under the floor number */}
                <div className="flex justify-center gap-1.5 my-1.5">
                  {[1, 2, 3].map(star => (
                    <Star 
                      key={star} 
                      className={`w-6 h-6 ${star <= stageStars ? 'text-[#ebd09b] fill-[#ebd09b] drop-shadow-[0_0_8px_rgba(235,208,155,0.8)]' : 'text-gray-700'}`} 
                    />
                  ))}
                </div>

                {viewingFloor === maxFloor ? (
                  <span className="text-[10px] text-emerald-400 font-mono tracking-wider uppercase font-bold">Current Max</span>
                ) : (
                  <span className="text-[10px] text-amber-500 font-mono tracking-wider uppercase font-bold">Farm Mode</span>
                )}
              </div>

              <button 
                onClick={handleNext}
                disabled={viewingFloor >= maxFloor}
                className="p-4 rounded-2xl bg-black/40 border border-[#ebd09b]/25 hover:border-[#ebd09b]/60 text-[#ebd09b] hover:bg-[#ebd09b]/10 disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer shadow-md"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            </div>
          </div>

          {/* Row 3: Encounter & Drops Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-4">
            
            {/* Encounter details */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono text-gray-500 tracking-widest uppercase font-bold block">Encounter</span>
              <div className="bg-black/50 border border-gray-800/60 rounded-2xl p-5 flex items-center gap-4 shadow-inner min-h-[110px]">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center border shrink-0 ${isBoss ? 'bg-[#4e0707] border-[#dd2c40]/50' : 'bg-[#1f2833] border-cyan-900'} overflow-hidden`}>
                  {selectedStage.enemyHeroImage?.startsWith('/') ? (
                    <img src={selectedStage.enemyHeroImage} alt="Enemy Hero" className="w-full h-full object-cover animate-pulse" />
                  ) : (
                    isBoss ? <Crown className="w-8 h-8 text-purple-500 drop-shadow-[0_0_12px_rgba(168,85,247,0.8)] animate-pulse" /> : <Skull className="w-7 h-7 text-red-500/90" />
                  )}
                </div>
                <div>
                  <h4 className="font-display font-bold text-white text-lg leading-none">{selectedStage.enemyHeroName}</h4>
                  <p className="text-xs font-mono text-gray-400 mt-2.5">Hero Health: <span className="text-[#dd2c40] font-bold">{selectedStage.enemyHeroHealth} HP</span></p>
                  <p className="text-[10px] text-gray-500 font-mono mt-0.5">Deck Size: {selectedStage.enemyDeck.length} Cards</p>
                </div>
              </div>
            </div>

            {/* Guaranteed Rewards */}
            <div className="space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-xs font-display text-[#ebd09b] tracking-wider uppercase font-bold block">Rewards</span>
                <div className="grid grid-cols-3 gap-3">
                  {/* Gold Reward Card */}
                  <div className="bg-gradient-to-b from-[#1b150d] via-[#100c07] to-[#070503] border border-amber-500/25 hover:border-amber-400/50 p-3.5 rounded-2xl text-center shadow-md transition-all duration-300 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:scale-[1.03] flex flex-col items-center justify-center min-h-[96px] group cursor-default">
                    <span className="text-amber-400 font-display font-bold text-lg block flex items-center gap-1.5 justify-center text-shadow-gold">
                      +{selectedStage.goldReward}
                      <img src="/icons/icon_gold.webp" alt="Gold" className="w-7 h-7 object-contain drop-shadow-[0_0_6px_rgba(245,158,11,0.45)] group-hover:scale-110 transition-transform duration-300" />
                    </span>
                    <span className="text-[10px] text-amber-500/80 font-mono tracking-widest uppercase font-bold mt-2 group-hover:text-amber-400 transition-colors">Gold</span>
                  </div>
                  
                  {/* Dust Reward Card */}
                  <div className="bg-gradient-to-b from-[#0b1a1f] via-[#050f12] to-[#020709] border border-cyan-500/25 hover:border-cyan-400/50 p-3.5 rounded-2xl text-center shadow-md transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:scale-[1.03] flex flex-col items-center justify-center min-h-[96px] group cursor-default">
                    <span className="text-cyan-400 font-display font-bold text-lg block flex items-center gap-1.5 justify-center text-shadow-cyan">
                      +{selectedStage.dustReward}
                      <img src="/icons/icon_dust.webp" alt="Dust" className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(102,252,241,0.55)] group-hover:scale-110 transition-transform duration-300" />
                    </span>
                    <span className="text-[10px] text-cyan-400/80 font-mono tracking-widest uppercase font-bold mt-2 group-hover:text-cyan-300 transition-colors">Dust</span>
                  </div>

                  {/* Shards or EXP Reward Card */}
                  {selectedStage.shardsReward > 0 ? (
                    <div className="bg-gradient-to-b from-[#1e0b0d] via-[#120507] to-[#090203] border border-red-500/25 hover:border-red-400/50 p-3.5 rounded-2xl text-center shadow-md transition-all duration-300 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] hover:scale-[1.03] flex flex-col items-center justify-center min-h-[96px] group cursor-default">
                      <span className="text-red-500 font-display font-bold text-lg block flex items-center gap-1.5 justify-center text-shadow-crimson">
                        +{selectedStage.shardsReward}
                        <img src="/icons/icon_shards.webp" alt="Shards" className="w-7 h-7 object-contain drop-shadow-[0_0_6px_rgba(239,68,68,0.45)] group-hover:scale-110 transition-transform duration-300" />
                      </span>
                      <span className="text-[10px] text-red-500/80 font-mono tracking-widest uppercase font-bold mt-2 group-hover:text-red-450 transition-colors">Shards</span>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-b from-[#0c1a12] via-[#050f0a] to-[#020704] border border-emerald-500/25 hover:border-emerald-400/50 p-3.5 rounded-2xl text-center shadow-md transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:scale-[1.03] flex flex-col items-center justify-center min-h-[96px] group cursor-default">
                      <span className="text-emerald-400 font-display font-bold text-lg block flex items-center gap-1.5 justify-center text-shadow-emerald">
                        +50
                        <span className="text-xl drop-shadow-[0_0_6px_rgba(52,211,153,0.55)] group-hover:scale-110 transition-transform duration-300">✨</span>
                      </span>
                      <span className="text-[10px] text-emerald-400/80 font-mono tracking-widest uppercase font-bold mt-2 group-hover:text-emerald-350 transition-colors">EXP</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Card Reward Info if exists */}
          {selectedStage.cardReward && (
            <div className="bg-black/50 border border-emerald-500/20 p-4 rounded-2xl flex items-center justify-between shadow-inner mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-950/40 flex items-center justify-center border border-emerald-500/30 shrink-0">
                  <Award className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <span className="text-emerald-400 font-bold text-xs block leading-none">Guaranteed Card Drop</span>
                  <span className="text-[10px] text-gray-400 font-mono mt-1.5">{selectedStage.cardReward.name}</span>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-950/40 text-emerald-400 px-3 py-1 rounded-lg font-mono border border-emerald-500/20">Guaranteed</span>
            </div>
          )}

          {/* Action Buttons Area */}
          <div className="pt-4 border-t border-gray-800/80 flex flex-col items-center">
            <div className="flex w-full max-w-xl gap-5">
              <button
                onClick={handleStart}
                className={`flex-1 font-display font-bold tracking-widest py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-4 cursor-pointer hover:scale-[1.02] active:scale-[0.98] text-sm uppercase ${
                  isBoss 
                    ? 'bg-gradient-to-b from-[#3a0b12] via-[#200508] to-[#140204] border-2 border-red-600/50 hover:border-red-500 text-red-400 hover:text-white shadow-[0_0_15px_rgba(220,38,38,0.15)] hover:shadow-[0_0_25px_rgba(239,68,68,0.35)]'
                    : 'bg-gradient-to-b from-[#221a12] via-[#150f0a] to-[#0c0805] border-2 border-[#c5a880]/50 hover:border-[#ebd09b] text-[#ebd09b] hover:text-white shadow-[0_0_15px_rgba(197,168,128,0.15)] hover:shadow-[0_0_25px_rgba(235,208,155,0.35)]'
                }`}
              >
                <Swords className="w-5 h-5 animate-pulse" /> 
                <span className="mr-0.5">BATTLE</span>
                <span className={`flex items-center gap-1.5 bg-black/50 border rounded-full px-3 py-1 font-mono text-lg font-bold text-emerald-400 shadow-inner ${
                  isBoss ? 'border-red-500/30' : 'border-[#ebd09b]/35'
                }`}>
                  {selectedStage.energyCost}
                  <img src="/icons/icon_energy.webp" alt="Energy" className="w-7 h-7 object-contain brightness-110 drop-shadow-[0_0_6px_rgba(16,185,129,0.45)]" />
                </span>
              </button>
              
              {stageStars === 3 && (
                <button
                  onClick={handleSweep}
                  className="flex-1 font-display font-bold tracking-widest py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-4 cursor-pointer hover:scale-[1.02] active:scale-[0.98] text-sm uppercase bg-gradient-to-b from-[#1b122c] via-[#0e071a] to-[#06020c] border-2 border-purple-600/50 hover:border-purple-400 text-purple-400 hover:text-white shadow-[0_0_15px_rgba(147,51,234,0.15)] hover:shadow-[0_0_25px_rgba(168,85,247,0.35)]"
                >
                  <FastForward className="w-5 h-5" /> 
                  <span className="mr-0.5">SWEEP</span>
                  <span className="flex items-center gap-1.5 bg-black/50 border border-purple-500/30 rounded-full px-3 py-1 font-mono text-lg font-bold text-emerald-400 shadow-inner">
                    {selectedStage.energyCost}
                    <img src="/icons/icon_energy.webp" alt="Energy" className="w-7 h-7 object-contain brightness-110 drop-shadow-[0_0_6px_rgba(16,185,129,0.45)]" />
                  </span>
                </button>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
