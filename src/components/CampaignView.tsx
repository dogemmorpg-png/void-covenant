import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useToast } from './Toast';
import { generateCampaignStage } from '../data/cards';
import { CampaignStage } from '../types';
import { Skull, Swords, Award, ChevronLeft, ChevronRight, Crown, Star, FastForward, Plus, X } from 'lucide-react';
import { assetPreloader } from '../utils/assetPreloader';

interface CampaignViewProps {
  onStartBattle: (stage: CampaignStage) => void;
}

export const CampaignView: React.FC<CampaignViewProps> = ({ onStartBattle }) => {
  const { profile, submitAction, buyPveEnergy, setIsShardsShopOpen } = useGame();
  const toast = useToast();
  const [isSweeping, setIsSweeping] = useState(false);
  const [isBuyEnergyModalOpen, setIsBuyEnergyModalOpen] = useState(false);
  const [isPurchasingEnergy, setIsPurchasingEnergy] = useState(false);
  
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
      toast('Not enough PvE energy! Opening Energy Vault...', 'warning');
      setIsBuyEnergyModalOpen(true);
      return;
    }
    onStartBattle(selectedStage);
  };

  const handleSweep = async () => {
    if (isSweeping) return;
    if ((profile.pveEnergy || 0) < selectedStage.energyCost) {
      toast('Not enough PvE energy for a sweep! Opening Energy Vault...', 'warning');
      setIsBuyEnergyModalOpen(true);
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

            {/* Prominent Centered Energy Badge with + Button */}
            <div 
              onClick={() => setIsBuyEnergyModalOpen(true)}
              className="mt-3.5 inline-flex items-center gap-2.5 bg-gradient-to-r from-[#061c12] via-black to-[#061c12] border border-emerald-500/50 hover:border-emerald-400 rounded-full py-1 pl-3 pr-1.5 shadow-[0_0_18px_rgba(16,185,129,0.25)] hover:shadow-[0_0_24px_rgba(16,185,129,0.4)] select-none transition-all cursor-pointer group hover:scale-105 active:scale-95"
              title="Click to Refill Energy with Dark Shards"
            >
              <img src="/icons/icon_energy.webp" alt="Energy" className="w-5 h-5 object-contain drop-shadow-[0_0_8px_rgba(16,185,129,0.9)] group-hover:scale-110 transition-transform" />
              <div className="flex items-baseline gap-1.5 leading-none">
                <span className="font-display font-bold text-xs text-gray-300 tracking-wider">ENERGY:</span>
                <span className="font-mono text-sm font-black text-emerald-400">
                  {profile.pveEnergy || 0}
                </span>
                <span className="font-mono text-xs font-bold text-emerald-500/70">
                  / {profile.pveEnergyMax || 10}
                </span>
              </div>
              <span className="font-mono text-[11px] text-emerald-300/90 font-bold border-l border-emerald-500/30 pl-2 pr-1">
                {timeUntilRegen ? `+1 in ${timeUntilRegen}` : 'Full Energy'}
              </span>
              <div className="w-5 h-5 rounded-full bg-gradient-to-b from-emerald-500 to-emerald-700 group-hover:from-emerald-400 group-hover:to-emerald-600 text-black flex items-center justify-center border border-emerald-300/50 shadow-[0_0_10px_rgba(16,185,129,0.6)] group-hover:scale-110 active:scale-95 transition-all">
                <Plus className="w-3.5 h-3.5 stroke-[3] text-black" />
              </div>
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
            <div className="space-y-3">
              <span className="text-[10px] font-mono text-[#ebd09b]/80 tracking-widest uppercase font-bold block">VICTORY REWARDS</span>
              <div className="bg-black/50 border border-gray-800/60 rounded-2xl p-4 flex items-center justify-around gap-2 shadow-inner min-h-[110px]">
                
                {/* Gold Pill */}
                <div className="flex-1 flex flex-col items-center justify-center p-2 rounded-xl bg-white/[0.03] border border-amber-500/20 hover:border-amber-400/50 hover:bg-amber-500/[0.06] transition-all cursor-default group">
                  <div className="flex items-center gap-1.5">
                    <img src="/icons/icon_gold.webp" alt="Gold" className="w-6 h-6 object-contain drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] group-hover:scale-110 transition-transform" />
                    <span className="font-mono font-black text-amber-300 text-base leading-none">+{selectedStage.goldReward}</span>
                  </div>
                  <span className="text-[9px] text-amber-500/70 font-mono uppercase tracking-wider font-semibold mt-1">Gold</span>
                </div>

                {/* Dust Pill */}
                <div className="flex-1 flex flex-col items-center justify-center p-2 rounded-xl bg-white/[0.03] border border-cyan-500/20 hover:border-cyan-400/50 hover:bg-cyan-500/[0.06] transition-all cursor-default group">
                  <div className="flex items-center gap-1.5">
                    <img src="/icons/icon_dust.webp" alt="Dust" className="w-8 h-8 object-contain drop-shadow-[0_0_10px_rgba(102,252,241,0.6)] scale-135 group-hover:scale-145 transition-transform" />
                    <span className="font-mono font-black text-[#66fcf1] text-base leading-none">+{selectedStage.dustReward}</span>
                  </div>
                  <span className="text-[9px] text-cyan-400/70 font-mono uppercase tracking-wider font-semibold mt-1">Dust</span>
                </div>

                {/* Shards or EXP Pill */}
                {selectedStage.shardsReward > 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-2 rounded-xl bg-white/[0.03] border border-red-500/20 hover:border-red-400/50 hover:bg-red-500/[0.06] transition-all cursor-default group">
                    <div className="flex items-center gap-1.5">
                      <img src="/icons/icon_shards.webp" alt="Shards" className="w-6 h-6 object-contain drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] scale-110 group-hover:scale-120 transition-transform" />
                      <span className="font-mono font-black text-rose-400 text-base leading-none">+{selectedStage.shardsReward}</span>
                    </div>
                    <span className="text-[9px] text-red-400/70 font-mono uppercase tracking-wider font-semibold mt-1">Shards</span>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-2 rounded-xl bg-white/[0.03] border border-emerald-500/20 hover:border-emerald-400/50 hover:bg-emerald-500/[0.06] transition-all cursor-default group">
                    <div className="flex items-center gap-1.5">
                      <img src="/icons/icon_exp.webp" alt="EXP" className="w-6 h-6 object-contain drop-shadow-[0_0_8px_rgba(16,185,129,0.7)] group-hover:scale-110 transition-transform" />
                      <span className="font-mono font-black text-emerald-400 text-base leading-none">+50</span>
                    </div>
                    <span className="text-[9px] text-emerald-400/70 font-mono uppercase tracking-wider font-semibold mt-1">Hero EXP</span>
                  </div>
                )}

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

      {/* Abyssal Energy Vault Modal */}
      {isBuyEnergyModalOpen && (
        <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-b from-[#0f1f17] via-[#09140f] to-[#040906] border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 max-w-xl w-full relative shadow-[0_0_60px_rgba(0,0,0,0.95)] space-y-6 overflow-hidden">
            
            {/* Ambient Background Flares */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-teal-500/10 blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={() => setIsBuyEnergyModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white font-sans text-base font-black transition-all cursor-pointer w-9 h-9 flex items-center justify-center bg-black/70 hover:bg-black border border-white/10 hover:border-white/30 rounded-full z-30 shadow-lg hover:scale-105 active:scale-95"
              title="Close"
            >
              ✕
            </button>

            {/* Header with Glowing Energy Emblem */}
            <div className="text-center space-y-2 relative z-10 px-10">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-b from-emerald-950/80 via-black to-black border-2 border-emerald-500/60 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.35)]">
                <img src="/icons/icon_energy.webp" alt="Energy" className="w-10 h-10 object-contain drop-shadow-[0_0_12px_rgba(16,185,129,0.85)]" />
              </div>
              <h3 className="font-display font-black text-2xl text-transparent bg-clip-text bg-gradient-to-b from-emerald-100 via-emerald-300 to-teal-400 tracking-widest uppercase text-shadow-gold">
                ABYSSAL ENERGY VAULT
              </h3>
              <p className="text-xs text-gray-300 font-sans max-w-sm mx-auto leading-relaxed">
                Exchange Dark Shards for PvE Energy to descend deeper into the Endless Abyss.
              </p>
            </div>

            {/* Status Bar: Current Energy + Regen Timer + Shards Balance */}
            <div className="grid grid-cols-3 gap-2 bg-black/60 border border-white/10 rounded-2xl p-3 relative z-10 shadow-inner">
              <div className="flex flex-col items-center justify-center border-r border-white/10 pr-1 text-center">
                <span className="text-[8.5px] font-mono text-gray-400 uppercase tracking-wider block font-bold">Current Energy</span>
                <span className="font-mono text-base font-black text-emerald-400 flex items-center gap-1 mt-0.5">
                  <img src="/icons/icon_energy.webp" alt="Energy" className="w-4 h-4 object-contain" />
                  {profile.pveEnergy || 0}/{profile.pveEnergyMax || 10}
                </span>
                <span className="text-[7.5px] text-gray-500 font-mono mt-0.5">
                  {timeUntilRegen ? `+1 in ${timeUntilRegen}` : 'Full'}
                </span>
              </div>

              <div className="flex flex-col items-center justify-center border-r border-white/10 px-1 text-center">
                <span className="text-[8.5px] font-mono text-gray-400 uppercase tracking-wider block font-bold">Passive Regen</span>
                <span className="font-mono text-base font-black text-teal-300 flex items-center gap-1 mt-0.5">
                  +1 / 20m
                </span>
                <span className="text-[7.5px] text-gray-500 font-mono mt-0.5">Automatic</span>
              </div>

              <div className="flex flex-col items-center justify-center pl-1 text-center">
                <span className="text-[8.5px] font-mono text-gray-400 uppercase tracking-wider block font-bold">Your Shards</span>
                <span className="font-mono text-base font-black text-rose-300 flex items-center gap-1 mt-0.5">
                  <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain" />
                  {profile.darkShards || 0}
                </span>
                <span className="text-[7.5px] text-gray-500 font-mono mt-0.5">Currency</span>
              </div>
            </div>

            {/* 3 Energy Packages */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 relative z-10">
              {[
                { 
                  count: 3, 
                  cost: 10, 
                  label: 'Minor Vial', 
                  sub: '+3 Abyss Energy',
                  image: '/icons/energy_vial_small.webp',
                  theme: 'border-white/10 hover:border-emerald-500/40 bg-gradient-to-b from-zinc-950 via-black to-black' 
                },
                { 
                  count: 10, 
                  cost: 25, 
                  label: 'Abyssal Flask', 
                  sub: '+10 Full Refill', 
                  image: '/icons/energy_flask_medium.webp',
                  popular: true, 
                  badge: 'MOST POPULAR',
                  theme: 'border-emerald-500/60 hover:border-emerald-400 bg-gradient-to-b from-emerald-950/30 via-black to-black shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
                },
                { 
                  count: 25, 
                  cost: 50, 
                  label: 'Grand Elixir', 
                  sub: '+25 Big Reserve', 
                  image: '/icons/energy_elixir_large.webp',
                  badge: 'SAVE 25 SHARDS',
                  theme: 'border-amber-500/60 hover:border-amber-400 bg-gradient-to-b from-amber-950/30 via-black to-black shadow-[0_0_20px_rgba(245,158,11,0.15)]' 
                }
              ].map((pkg) => {
                const canAfford = (profile.darkShards || 0) >= pkg.cost;

                return (
                  <div 
                    key={pkg.count}
                    className={`relative rounded-2xl border p-4 flex flex-col items-center justify-between text-center transition-all duration-300 ${pkg.theme}`}
                  >
                    {/* Popular / Value Badge */}
                    {pkg.badge && (
                      <div className={`absolute -top-2.5 px-2 py-0.5 rounded-full text-[8.5px] font-mono font-black tracking-wider uppercase border shadow-md ${
                        pkg.popular 
                          ? 'bg-emerald-500 text-black border-emerald-300 shadow-emerald-500/40' 
                          : 'bg-amber-500 text-black border-amber-300 shadow-amber-500/40'
                      }`}>
                        {pkg.badge}
                      </div>
                    )}

                    {/* Top: Icon + Count */}
                    <div className="space-y-1.5 mt-1 flex flex-col items-center">
                      <div className="w-16 h-16 rounded-2xl bg-black/70 border border-white/10 p-1 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform overflow-hidden">
                        <img src={pkg.image} alt={pkg.label} className="w-full h-full object-contain rounded-xl drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                      </div>
                      <div className="font-display font-black text-xl text-white">
                        +{pkg.count}
                      </div>
                      <div className="font-display font-bold text-xs text-gray-300 uppercase tracking-wide">
                        {pkg.label}
                      </div>
                      <div className="text-[10px] text-gray-400 font-sans">
                        {pkg.sub}
                      </div>
                    </div>

                    {/* Bottom: Price Button */}
                    <div className="w-full mt-4">
                      <button
                        onClick={async () => {
                          if (isPurchasingEnergy) return;
                          if (!canAfford) {
                            toast(`Not enough Dark Shards! Need ${pkg.cost} Shards.`, 'warning');
                            setIsShardsShopOpen(true);
                            return;
                          }
                          setIsPurchasingEnergy(true);
                          try {
                            const success = await buyPveEnergy(pkg.count);
                            if (success) {
                              toast(`Successfully restored +${pkg.count} PvE Energy!`, 'success');
                            } else {
                              toast('Failed to purchase energy. Please try again.', 'error');
                            }
                          } finally {
                            setIsPurchasingEnergy(false);
                          }
                        }}
                        disabled={isPurchasingEnergy}
                        className={`w-full py-2.5 rounded-xl font-display font-black tracking-wider text-xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-md ${
                          canAfford
                            ? pkg.popular
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black shadow-emerald-500/20 hover:scale-105 active:scale-95'
                              : 'bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:scale-105 active:scale-95'
                            : 'bg-red-950/30 text-red-400/80 border border-red-500/30 hover:bg-red-950/50'
                        }`}
                      >
                        {isPurchasingEnergy ? (
                          <span>Brewing...</span>
                        ) : (
                          <>
                            <span>{pkg.cost}</span>
                            <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Note */}
            <div className="bg-black/70 border border-white/10 rounded-2xl p-3 text-center text-xs text-gray-300 font-sans leading-relaxed relative z-10 shadow-inner flex items-center justify-center gap-2">
              <span className="text-emerald-400 text-sm">💡</span>
              <span>
                <strong className="text-emerald-300">Overflow Protected:</strong> Energy purchased with Dark Shards is added on top of your limit and never expires.
              </span>
            </div>

            {/* Back Button */}
            <button
              onClick={() => setIsBuyEnergyModalOpen(false)}
              className="w-full py-3 rounded-2xl border border-white/10 hover:border-white/20 bg-black/40 hover:bg-black/60 text-gray-300 hover:text-white font-display font-bold tracking-widest text-xs transition-colors cursor-pointer uppercase relative z-10"
            >
              Back to Abyss
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
