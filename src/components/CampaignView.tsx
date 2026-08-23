import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useToast } from './Toast';
import { generateCampaignStage } from '../data/cards';
import { CampaignStage } from '../types';
import { Skull, Swords, Award, ChevronLeft, ChevronRight, Crown, Star, FastForward } from 'lucide-react';

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
    <div className="max-w-5xl mx-auto p-4 flex items-center justify-center min-h-[calc(100vh-220px)]">
      
      {/* Unified Majestic Slate Panel */}
      <div className={`glass-panel rounded-3xl p-8 w-full relative overflow-hidden flex flex-col justify-between ${
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

        <div className="relative z-10 flex flex-col justify-between h-full">
          
          {/* Header Row: Title on Left, Floor Selector on Right */}
          <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-800/80 pb-6 mb-6 gap-4">
            <div className="text-center md:text-left">
              <h2 className="font-display font-black text-2xl md:text-3xl text-white tracking-widest text-shadow-gold">
                THE ENDLESS ABYSS
              </h2>
              <p className="text-xs text-gray-400 mt-1.5 max-w-md font-sans leading-relaxed">
                Descend into the infinite depths. Defeat the dark entities to claim ancient resources and rare cards.
              </p>
            </div>

            {/* Large Floor Selector */}
            <div className="flex items-center gap-5 bg-black/40 border border-gray-800/50 rounded-2xl py-2 px-4 shadow-inner">
              <button 
                onClick={handlePrev}
                disabled={viewingFloor === 1}
                className="p-2 rounded-xl bg-black/40 border border-[#ebd09b]/25 hover:border-[#ebd09b]/60 text-[#ebd09b] hover:bg-[#ebd09b]/10 disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer shadow-md"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center w-28 select-none">
                <span className={`text-[9px] font-mono tracking-widest uppercase font-bold ${isBoss ? 'text-red-500' : 'text-[#ebd09b]'}`}>
                  {isBoss ? 'Boss Floor' : 'Floor'}
                </span>
                <div className="text-4xl font-display font-black text-white text-shadow-gold leading-none my-0.5">
                  {viewingFloor}
                </div>
                {viewingFloor === maxFloor ? (
                  <span className="text-[8px] text-emerald-400 font-mono tracking-wider uppercase font-bold">Current Max</span>
                ) : (
                  <span className="text-[8px] text-amber-500 font-mono tracking-wider uppercase font-bold">Farm Mode</span>
                )}
              </div>

              <button 
                onClick={handleNext}
                disabled={viewingFloor >= maxFloor}
                className="p-2 rounded-xl bg-black/40 border border-[#ebd09b]/25 hover:border-[#ebd09b]/60 text-[#ebd09b] hover:bg-[#ebd09b]/10 disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer shadow-md"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Details Section: Encounter & Drops */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
            
            {/* Left side: Stage description & Encounter */}
            <div className="space-y-5">
              <div>
                <h3 className={`font-display font-black text-xl tracking-wider text-shadow-gold ${isBoss ? 'text-red-400' : 'text-white'}`}>
                  {selectedStage.name}
                </h3>
                <p className="text-xs text-gray-400 mt-1 font-sans leading-relaxed">{selectedStage.description}</p>
                {/* Stars display */}
                <div className="flex gap-1 mt-2.5">
                  {[1, 2, 3].map(star => (
                    <Star 
                      key={star} 
                      className={`w-5 h-5 ${star <= stageStars ? 'text-[#ebd09b] fill-[#ebd09b] drop-shadow-[0_0_8px_rgba(235,208,155,0.8)]' : 'text-gray-700'}`} 
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono text-gray-500 tracking-widest uppercase font-bold block">Encounter</span>
                <div className="bg-black/50 border border-gray-800/60 rounded-2xl p-4 flex items-center gap-4 shadow-inner">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center border shrink-0 ${isBoss ? 'bg-[#4e0707] border-[#dd2c40]/50' : 'bg-[#1f2833] border-cyan-900'} overflow-hidden`}>
                    {selectedStage.enemyHeroImage?.startsWith('/') ? (
                      <img src={selectedStage.enemyHeroImage} alt="Enemy Hero" className="w-full h-full object-cover" />
                    ) : (
                      isBoss ? <Crown className="w-8 h-8 text-purple-500 drop-shadow-[0_0_12px_rgba(168,85,247,0.8)] animate-pulse" /> : <Skull className="w-7 h-7 text-red-500/90" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-white text-base leading-none">{selectedStage.enemyHeroName}</h4>
                    <p className="text-xs font-mono text-gray-400 mt-1.5">Hero Health: <span className="text-[#dd2c40] font-bold">{selectedStage.enemyHeroHealth} HP</span></p>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">Deck Size: {selectedStage.enemyDeck.length} Cards</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Rewards info */}
            <div className="space-y-5 flex flex-col justify-between">
              
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-gray-500 tracking-widest uppercase font-bold block">Guaranteed Drops</span>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-black/50 border border-amber-500/20 p-3.5 rounded-2xl text-center shadow-inner hover:border-amber-500/40 transition-colors">
                    <span className="text-amber-400 font-bold text-base block">+{selectedStage.goldReward}</span>
                    <span className="text-[10px] text-gray-500 font-mono">Gold</span>
                  </div>
                  <div className="bg-black/50 border border-cyan-500/20 p-3.5 rounded-2xl text-center shadow-inner hover:border-cyan-500/40 transition-colors">
                    <span className="text-[#66fcf1] font-bold text-base block">+{selectedStage.dustReward}</span>
                    <span className="text-[10px] text-gray-500 font-mono">Dark Dust</span>
                  </div>
                  {selectedStage.shardsReward > 0 ? (
                    <div className="bg-black/50 border border-red-500/20 p-3.5 rounded-2xl text-center shadow-inner hover:border-red-500/40 transition-colors">
                      <span className="text-red-500 font-bold text-base block">+{selectedStage.shardsReward}</span>
                      <span className="text-[10px] text-gray-500 font-mono">Shards</span>
                    </div>
                  ) : (
                    <div className="bg-black/50 border border-emerald-500/20 p-3.5 rounded-2xl text-center shadow-inner hover:border-emerald-500/40 transition-colors">
                      <span className="text-emerald-400 font-bold text-base block">+50✨</span>
                      <span className="text-[10px] text-gray-500 font-mono">EXP</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedStage.cardReward && (
                <div className="bg-black/50 border border-emerald-500/20 p-4 rounded-2xl flex items-center justify-between shadow-inner">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-950/40 flex items-center justify-center border border-emerald-500/30 shrink-0">
                      <Award className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <span className="text-emerald-400 font-bold text-xs block leading-none">Guaranteed Card Drop</span>
                      <span className="text-[10px] text-gray-400 font-mono mt-1">{selectedStage.cardReward.name}</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-950/40 text-emerald-400 px-3 py-1 rounded-lg font-mono border border-emerald-500/20">Guaranteed</span>
                </div>
              )}
            </div>

          </div>

          {/* Action Buttons & Energy Cost */}
          <div className="pt-5 border-t border-gray-800/80 flex flex-col items-center">
            <div className="flex w-full max-w-md gap-4">
              <button
                onClick={handleStart}
                className={`flex-1 font-display font-black tracking-widest py-4 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2.5 cursor-pointer hover:scale-[1.03] active:scale-[0.97] text-xs ${
                  isBoss 
                    ? 'glass-button-crimson'
                    : 'glass-button-gold'
                }`}
              >
                <Swords className="w-5 h-5" /> BATTLE
              </button>
              
              {stageStars === 3 && (
                <button
                  onClick={handleSweep}
                  className="flex-1 font-display font-black tracking-widest py-4 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2.5 cursor-pointer hover:scale-[1.03] active:scale-[0.97] bg-gradient-to-br from-indigo-900/80 to-purple-900/80 border border-purple-500/40 hover:bg-purple-800/80 text-purple-200 text-xs"
                >
                  <FastForward className="w-5 h-5" /> SWEEP
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-2 mt-3.5 text-xs font-mono">
              <span className="text-gray-500 uppercase tracking-wide text-[10px]">Cost:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <img src="/icons/icon_energy.png" alt="Energy" className="w-4.5 h-4.5 object-contain inline-block drop-shadow-[0_0_8px_rgba(16,185,129,0.35)]" />
                {selectedStage.energyCost} Energy
              </span>
              <span className="text-gray-700 mx-2">|</span>
              <span className="text-gray-500">Your Energy: {profile.pveEnergy}/{profile.pveEnergyMax}</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
