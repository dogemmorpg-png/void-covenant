import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useToast } from './Toast';
import { generateCampaignStage } from '../data/cards';
import { CampaignStage } from '../types';
import { Skull, Swords, Award, Lock, ChevronLeft, ChevronRight, Crown, Star, FastForward } from 'lucide-react';

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
    <div className="max-w-5xl mx-auto p-4 flex flex-col lg:flex-row gap-6 items-stretch justify-center h-full">
      
      {/* Left Column: Floor Selector */}
      <div className="glass-panel rounded-3xl p-6 lg:w-2/5 flex flex-col justify-center relative overflow-hidden shrink-0 min-h-[220px]">
        {isBoss && <div className="absolute inset-0 bg-red-900/10 gothic-glow-crimson pointer-events-none" />}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(235,208,155,0.02)_0%,transparent_70%)] pointer-events-none" />

        {/* Decorative corner brackets */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#ebd09b]/35 pointer-events-none" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#ebd09b]/35 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#ebd09b]/35 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#ebd09b]/35 pointer-events-none" />

        <div className="space-y-4 my-auto relative z-10 flex flex-col items-center">
          <h2 className="font-display font-black text-xl md:text-2xl text-white tracking-widest text-shadow-gold text-center">
            THE ENDLESS ABYSS
          </h2>
          <p className="text-[11px] text-gray-400 max-w-xs text-center leading-relaxed font-sans">
            Descend into the infinite depths. Defeat the dark entities to claim ancient resources and rare cards.
          </p>

          <div className="flex items-center gap-6 mt-2">
            <button 
              onClick={handlePrev}
              disabled={viewingFloor === 1}
              className="p-2 rounded-full bg-black/40 border border-[#ebd09b]/25 hover:border-[#ebd09b]/60 text-[#ebd09b] hover:bg-[#ebd09b]/10 disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer shadow-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center w-28">
              <span className={`text-[9px] font-mono tracking-widest uppercase font-bold ${isBoss ? 'text-red-500' : 'text-[#ebd09b]'}`}>
                {isBoss ? 'Boss Floor' : 'Floor'}
              </span>
              <div className="text-5xl font-display font-black text-white text-shadow-gold leading-none my-1">
                {viewingFloor}
              </div>
              {viewingFloor === maxFloor ? (
                <span className="text-[9px] text-emerald-400 font-mono tracking-wide">Current Max</span>
              ) : (
                <span className="text-[9px] text-amber-500 font-mono tracking-wide">Farm Mode</span>
              )}
            </div>

            <button 
              onClick={handleNext}
              disabled={viewingFloor >= maxFloor}
              className="p-2 rounded-full bg-black/40 border border-[#ebd09b]/25 hover:border-[#ebd09b]/60 text-[#ebd09b] hover:bg-[#ebd09b]/10 disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer shadow-md"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Stage Details */}
      <div className={`glass-panel rounded-3xl p-6 lg:w-3/5 flex-1 relative overflow-hidden flex flex-col justify-between min-h-[300px] ${isBoss ? 'border-red-900/50 shadow-[0_0_30px_rgba(221,44,64,0.15)]' : ''}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(235,208,155,0.02)_0%,transparent_70%)] pointer-events-none" />

        {/* Decorative corner brackets */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#ebd09b]/35 pointer-events-none" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#ebd09b]/35 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#ebd09b]/35 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#ebd09b]/35 pointer-events-none" />

        <div className="space-y-4 relative z-10 flex flex-col h-full justify-between">
          
          {/* Header: Stage Name & Description */}
          <div className="text-center border-b border-gray-800/80 pb-3 relative">
            <h3 className={`font-display font-black text-lg tracking-wider text-shadow-gold leading-tight ${isBoss ? 'text-red-400' : 'text-white'}`}>
              {selectedStage.name}
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">{selectedStage.description}</p>
            {/* Stars display */}
            <div className="flex justify-center gap-1 mt-2">
              {[1, 2, 3].map(star => (
                <Star 
                  key={star} 
                  className={`w-4 h-4 ${star <= stageStars ? 'text-[#ebd09b] fill-[#ebd09b] drop-shadow-[0_0_8px_rgba(235,208,155,0.8)]' : 'text-gray-700'}`} 
                />
              ))}
            </div>
          </div>

          {/* Details Row: Encounter & Drops */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Enemy Info */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono text-gray-500 tracking-widest uppercase font-bold block">Encounter</span>
              <div className="bg-black/55 border border-gray-800/50 rounded-xl p-3 flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center border shrink-0 ${isBoss ? 'bg-[#4e0707] border-[#dd2c40]/50' : 'bg-[#1f2833] border-cyan-900'} overflow-hidden`}>
                  {selectedStage.enemyHeroImage?.startsWith('/') ? (
                    <img src={selectedStage.enemyHeroImage} alt="Enemy Hero" className="w-full h-full object-cover" />
                  ) : (
                    isBoss ? <Crown className="w-6 h-6 text-purple-500 drop-shadow-[0_0_12px_rgba(168,85,247,0.8)] animate-pulse" /> : <Skull className="w-5 h-5 text-red-500/90" />
                  )}
                </div>
                <div>
                  <h4 className="font-display font-bold text-white text-sm leading-none">{selectedStage.enemyHeroName}</h4>
                  <p className="text-[10px] font-mono text-gray-400 mt-1">Health: <span className="text-[#dd2c40] font-bold">{selectedStage.enemyHeroHealth} HP</span></p>
                  <p className="text-[9px] text-gray-500 font-mono mt-0.5">Deck: {selectedStage.enemyDeck.length} Cards</p>
                </div>
              </div>
            </div>

            {/* Guaranteed Rewards */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono text-gray-500 tracking-widest uppercase font-bold block">Guaranteed Drops</span>
              <div className="grid grid-cols-3 gap-1.5">
                <div className="bg-black/55 border border-amber-500/10 p-2 rounded-xl text-center flex flex-col justify-center items-center">
                  <span className="text-amber-500 font-bold text-xs block">+{selectedStage.goldReward}</span>
                  <span className="text-[8px] text-gray-500 font-mono">Gold</span>
                </div>
                <div className="bg-black/55 border border-cyan-500/10 p-2 rounded-xl text-center flex flex-col justify-center items-center">
                  <span className="text-[#66fcf1] font-bold text-xs block">+{selectedStage.dustReward}</span>
                  <span className="text-[8px] text-gray-500 font-mono">Dust</span>
                </div>
                {selectedStage.shardsReward > 0 ? (
                  <div className="bg-black/55 border border-red-500/10 p-2 rounded-xl text-center flex flex-col justify-center items-center">
                    <span className="text-red-500 font-bold text-xs block">+{selectedStage.shardsReward}</span>
                    <span className="text-[8px] text-gray-500 font-mono">Shards</span>
                  </div>
                ) : (
                  <div className="bg-black/55 border border-emerald-500/10 p-2 rounded-xl text-center flex flex-col justify-center items-center">
                    <span className="text-emerald-400 font-bold text-xs block">+50✨</span>
                    <span className="text-[8px] text-gray-500 font-mono">EXP</span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Card Reward Info if exists */}
          {selectedStage.cardReward && (
            <div className="bg-black/55 border border-emerald-500/15 p-2 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-950/40 flex items-center justify-center border border-emerald-500/20 shrink-0">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div>
                  <span className="text-emerald-400 font-bold text-[10px] block leading-none">Guaranteed Card Drop</span>
                  <span className="text-[9px] text-gray-400 font-mono mt-0.5">{selectedStage.cardReward.name}</span>
                </div>
              </div>
            </div>
          )}

          {/* Battle / Sweep Actions Area */}
          <div className="pt-3 border-t border-gray-800/80 flex flex-col items-center">
            <div className="flex w-full max-w-md gap-3">
              <button
                onClick={handleStart}
                className={`flex-1 font-display font-black tracking-widest py-3 px-5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.03] active:scale-[0.97] text-xs ${
                  isBoss 
                    ? 'glass-button-crimson'
                    : 'glass-button-gold'
                }`}
              >
                <Swords className="w-4 h-4" /> BATTLE
              </button>
              
              {stageStars === 3 && (
                <button
                  onClick={handleSweep}
                  className="flex-1 font-display font-black tracking-widest py-3 px-5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.03] active:scale-[0.97] bg-gradient-to-br from-indigo-900/80 to-purple-900/80 border border-purple-500/40 hover:bg-purple-800/80 text-purple-200 text-xs"
                >
                  <FastForward className="w-4 h-4" /> SWEEP
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-1.5 mt-2.5 text-[10px] font-mono">
              <span className="text-gray-500">Cost:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <img src="/icons/icon_energy.png" alt="Energy" className="w-4 h-4 object-contain inline-block drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                {selectedStage.energyCost} Energy
              </span>
              <span className="text-gray-700 mx-1.5">|</span>
              <span className="text-gray-500">Your Energy: {profile.pveEnergy}/{profile.pveEnergyMax}</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
