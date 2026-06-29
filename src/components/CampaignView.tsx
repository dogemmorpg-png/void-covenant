import React, { useState, useEffect } from 'react';
import { audioSystem } from '../utils/AudioSystem';
import { useGame } from '../context/GameContext';
import { useToast } from './Toast';
import { generateCampaignStage } from '../data/cards';
import { CampaignStage } from '../types';
import { Skull, Swords, Zap, Award, Gem, Lock, ChevronLeft, ChevronRight, Crown, Star, FastForward } from 'lucide-react';

interface CampaignViewProps {
  onStartBattle: (stage: CampaignStage) => void;
}

export const CampaignView: React.FC<CampaignViewProps> = ({ onStartBattle }) => {
  const { profile, usePveEnergy, addGold, addDust, addShards, addExp } = useGame();
  const toast = useToast();
  
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
    if (profile.pveEnergy < selectedStage.energyCost) {
      toast('Not enough PvE energy! Wait for recovery.', 'warning');
      return;
    }
    
    if (usePveEnergy(selectedStage.energyCost)) {
      onStartBattle(selectedStage);
    }
  };

  const handleSweep = () => {
    if (profile.pveEnergy < selectedStage.energyCost) {
      toast('Not enough PvE energy for a sweep!', 'warning');
      return;
    }
    if (usePveEnergy(selectedStage.energyCost)) {
      addGold(selectedStage.goldReward);
      addDust(selectedStage.dustReward);
      addExp(50);
      if (selectedStage.shardsReward > 0) addShards(selectedStage.shardsReward);
      toast(`Sweep Success! +${selectedStage.goldReward} Gold, +${selectedStage.dustReward} Dust, +50 EXP`, 'success');
    }
  };

  const handlePrev = () => {
    if (viewingFloor > 1) setViewingFloor(viewingFloor - 1);
  };

  const handleNext = () => {
    if (viewingFloor < maxFloor) setViewingFloor(viewingFloor + 1);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      
      {/* Title & Floor Selector */}
      <div className="glass-panel rounded-3xl p-8 flex flex-col items-center relative overflow-hidden">
        {isBoss && <div className="absolute inset-0 bg-red-900/10 gothic-glow-crimson pointer-events-none" />}
        
        <h2 className="font-display font-black text-2xl md:text-3xl text-white tracking-widest text-shadow-gold text-center relative z-10">
          THE ENDLESS ABYSS
        </h2>
        <p className="text-xs text-gray-400 mt-2 max-w-md text-center relative z-10">
          Descend into the infinite depths. Defeat the dark entities to claim ancient resources and rare cards.
        </p>

        <div className="flex items-center gap-6 mt-8 relative z-10">
          <button 
            onClick={handlePrev}
            disabled={viewingFloor === 1}
            className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-[#c5a880] hover:bg-[#1f2833] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex flex-col items-center w-32">
            <span className={`text-[10px] font-mono tracking-widest uppercase font-bold ${isBoss ? 'text-red-500' : 'text-[#c5a880]'}`}>
              {isBoss ? 'Boss Floor' : 'Floor'}
            </span>
            <div className="text-5xl font-display font-black text-white text-shadow-gold">
              {viewingFloor}
            </div>
            {viewingFloor === maxFloor ? (
              <span className="text-[9px] text-emerald-400 font-mono mt-1">Current Max</span>
            ) : (
              <span className="text-[9px] text-gray-500 font-mono mt-1">Farm Mode</span>
            )}
          </div>

          <button 
            onClick={handleNext}
            disabled={viewingFloor >= maxFloor}
            className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-[#c5a880] hover:bg-[#1f2833] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Stage Details */}
      <div className={`glass-panel rounded-3xl p-8 relative overflow-hidden ${isBoss ? 'border-red-900/50 shadow-[0_0_30px_rgba(221,44,64,0.15)]' : ''}`}>
        <div className="space-y-6 relative z-10">
          <div className="text-center border-b border-gray-800 pb-4 relative">
            <h3 className={`font-display font-black text-xl tracking-wider text-shadow-gold ${isBoss ? 'text-red-400' : 'text-white'}`}>
              {selectedStage.name}
            </h3>
            <p className="text-xs text-gray-400 mt-2">{selectedStage.description}</p>
            {/* Stars display */}
            <div className="flex justify-center gap-1 mt-3">
              {[1, 2, 3].map(star => (
                <Star 
                  key={star} 
                  className={`w-5 h-5 ${star <= stageStars ? 'text-[#ebd09b] fill-[#ebd09b] drop-shadow-[0_0_8px_rgba(235,208,155,0.8)]' : 'text-gray-700'}`} 
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Enemy Info */}
            <div className="space-y-4">
              <span className="text-[10px] font-mono text-gray-500 tracking-widest uppercase font-bold block">Encounter</span>
              <div className="bg-black/50 border border-white/5 rounded-xl p-4 flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center border ${isBoss ? 'bg-[#4e0707] border-[#dd2c40]/50' : 'bg-[#1f2833] border-cyan-900'} overflow-hidden`}>
                  {selectedStage.enemyHeroImage?.startsWith('/') ? (
                    <img src={selectedStage.enemyHeroImage} alt="Enemy Hero" className="w-full h-full object-cover" />
                  ) : (
                    isBoss ? <Crown className="w-8 h-8 text-purple-500 drop-shadow-[0_0_12px_rgba(168,85,247,0.8)] animate-pulse" /> : <Skull className="w-6 h-6 text-red-500/90 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] hover:scale-110 transition-transform" />
                  )}
                </div>
                <div>
                  <h4 className="font-display font-bold text-white text-lg">{selectedStage.enemyHeroName}</h4>
                  <p className="text-xs font-mono text-gray-400">Hero Health: <span className="text-[#dd2c40] font-bold">{selectedStage.enemyHeroHealth} HP</span></p>
                  <p className="text-[10px] text-gray-500 font-mono mt-1">Deck Size: {selectedStage.enemyDeck.length} Cards</p>
                </div>
              </div>
            </div>

            {/* Right: Rewards Info */}
            <div className="space-y-4">
              <span className="text-[10px] font-mono text-gray-500 tracking-widest uppercase font-bold block">Guaranteed Drops</span>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-black/50 border border-amber-500/20 p-3 rounded-xl text-center">
                  <span className="text-amber-500 font-bold text-sm block">+{selectedStage.goldReward}<img src="/icons/icon_gold.png" alt="Gold" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" /></span>
                  <span className="text-[9px] text-gray-500 font-mono">Gold</span>
                </div>
                <div className="bg-black/50 border border-cyan-500/20 p-3 rounded-xl text-center">
                  <span className="text-[#66fcf1] font-bold text-sm block">+{selectedStage.dustReward}<img src="/icons/icon_dust.png" alt="Dust" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" /></span>
                  <span className="text-[9px] text-gray-500 font-mono">Dark Dust</span>
                </div>
                {selectedStage.shardsReward > 0 ? (
                  <div className="bg-black/50 border border-red-500/20 p-3 rounded-xl text-center">
                    <span className="text-red-500 font-bold text-sm block">+{selectedStage.shardsReward}<img src="/icons/icon_shards.png" alt="Shards" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" /></span>
                    <span className="text-[9px] text-gray-500 font-mono">Shards</span>
                  </div>
                ) : (
                  <div className="bg-black/50 border border-emerald-500/20 p-3 rounded-xl text-center">
                    <span className="text-emerald-400 font-bold text-sm block">+50✨</span>
                    <span className="text-[9px] text-gray-500 font-mono">EXP</span>
                  </div>
                )}
              </div>
              {selectedStage.cardReward && (
                <div className="bg-black/50 border border-emerald-500/20 p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-900/20 flex items-center justify-center border border-emerald-500/30">
                      <Award className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <span className="text-emerald-400 font-bold text-xs block">Card Drop!</span>
                      <span className="text-[9px] text-gray-400 font-mono">{selectedStage.cardReward.name}</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-900/40 text-emerald-400 px-2 py-1 rounded font-mono border border-emerald-500/20">Guaranteed</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Area */}
          <div className="pt-6 mt-6 border-t border-gray-800 flex flex-col items-center">
            <div className="flex w-full max-w-md gap-3">
              <button
                onClick={handleStart}
                className={`flex-1 font-display font-black tracking-widest py-4 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-3 cursor-pointer hover:scale-105 active:scale-95 ${
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
                  className="flex-1 font-display font-black tracking-widest py-4 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-3 cursor-pointer hover:scale-105 active:scale-95 bg-gradient-to-br from-indigo-900/80 to-purple-900/80 border border-purple-500/50 hover:bg-purple-800/80 text-purple-200"
                >
                  <FastForward className="w-5 h-5" /> SWEEP
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-3 text-xs font-mono">
              <span className="text-gray-400">Cost:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1"><div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_8px_rgba(16,185,129,0.4)]"><img src="/icons/icon_energy.png" alt="Energy" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-8 h-8 object-contain " /></div> {selectedStage.energyCost} Energy</span>
              <span className="text-gray-600 mx-2">|</span>
              <span className="text-gray-400">Your Energy: {profile.pveEnergy}/{profile.pveEnergyMax}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
