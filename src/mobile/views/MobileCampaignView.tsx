import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { useToast } from '../../components/Toast';
import { generateCampaignStage } from '../../data/cards';
import { CampaignStage } from '../../types';
import { 
  Skull, 
  Swords, 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  FastForward, 
  Plus, 
  X, 
  Award, 
  Crown,
  ShieldAlert
} from 'lucide-react';
import { assetPreloader } from '../../utils/assetPreloader';
import { getActiveSubscriptionTier, getTierLimits } from '../../utils/energyHelper';

interface MobileCampaignViewProps {
  onStartBattle: (stage: CampaignStage) => void;
}

export const MobileCampaignView: React.FC<MobileCampaignViewProps> = ({ onStartBattle }) => {
  const { profile, submitAction, buyPveEnergy, setIsShardsShopOpen } = useGame();
  const toast = useToast();
  const [isSweeping, setIsSweeping] = useState(false);
  const [isBuyEnergyModalOpen, setIsBuyEnergyModalOpen] = useState(false);
  const [isPurchasingEnergy, setIsPurchasingEnergy] = useState(false);

  const subTier = getActiveSubscriptionTier(profile);
  const tierLimits = getTierLimits(subTier);
  const pveEnergyMax = profile.pveEnergyMax || tierLimits.pveMax;
  const pveRegenInterval = tierLimits.pveRegenInterval;

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
    const limits = getTierLimits(getActiveSubscriptionTier(profile));
    const pveRegenTime = limits.pveRegenInterval;
    const maxEnergy = limits.pveMax;

    const updateTimer = () => {
      if ((profile.pveEnergy || 0) >= maxEnergy) {
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
  }, [profile.pveEnergy, profile.pveEnergyMax, profile.lastPveEnergyRefill, profile.lastEnergyRefill, profile.subscriptionTier, profile.subscriptionExpiresAt]);

  const isBoss = viewingFloor % 10 === 0;
  // Match PC star storage logic
  const stageStars = profile.campaignStars?.[selectedStage.id.toString()] || 0;
  const canSweep = stageStars === 3;

  const handlePrev = () => {
    if (viewingFloor > 1) setViewingFloor(prev => prev - 1);
  };

  const handleNext = () => {
    if (viewingFloor < maxFloor) setViewingFloor(prev => prev + 1);
  };

  const handleStart = () => {
    if ((profile.deck?.length || 0) < 10) {
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
      // Backend expects sweep_stage with floorNum
      const res = await submitAction('sweep_stage', { floorNum: viewingFloor });
      if (!res.success) {
        toast(res.message || 'Sweep battle failed', 'error');
      } else {
        toast(res.message || `Floor ${viewingFloor} Cleared!`, 'success');
      }
    } catch {
      toast('Network error during sweep battle', 'error');
    } finally {
      setIsSweeping(false);
    }
  };

  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setTouchStart({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || e.changedTouches.length === 0) return;
    const deltaX = e.changedTouches[0].clientX - touchStart.x;
    const deltaY = e.changedTouches[0].clientY - touchStart.y;
    setTouchStart(null);

    // Only switch floor on intentional horizontal swipe (>45px and 1.4x larger than vertical movement)
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
      if (deltaX < 0) {
        // Swiped left -> Next floor
        if (viewingFloor < maxFloor) {
          setViewingFloor(prev => prev + 1);
        }
      } else {
        // Swiped right -> Prev floor
        if (viewingFloor > 1) {
          setViewingFloor(prev => prev - 1);
        }
      }
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto select-none px-2 sm:px-4 pt-1 pb-24 sm:pb-28 custom-scrollbar">
      <div className="max-w-md mx-auto w-full flex flex-col justify-center gap-2">
        
        {/* Unified Majestic Slate Panel */}
        <div 
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className={`rounded-3xl p-3.5 sm:p-4.5 w-full relative overflow-hidden flex flex-col gap-3 border transition-all duration-300 my-2 sm:my-auto ${
          isBoss 
            ? 'border-red-900/80 shadow-[0_0_40px_rgba(220,38,38,0.25)] bg-gradient-to-b from-[#2a0e14]/95 via-[#18070b]/95 to-[#0f0406]' 
            : 'border-[#ebd09b]/35 shadow-[0_0_35px_rgba(0,0,0,0.85)] bg-gradient-to-b from-[#241a14]/95 via-[#160f0b]/95 to-[#0e0a07]'
        }`}>
          {/* Ambient Background Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(235,208,155,0.08)_0%,transparent_70%)] pointer-events-none" />
          {isBoss && <div className="absolute inset-0 bg-red-950/20 pointer-events-none animate-pulse" />}

          {/* Decorative Corner Brackets matching PC */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#ebd09b]/40 pointer-events-none" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#ebd09b]/40 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#ebd09b]/40 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#ebd09b]/40 pointer-events-none" />

          {/* 1. Header: Title & Energy Badge */}
          <div className="text-center border-b border-gray-800/80 pb-2.5 flex flex-col items-center relative z-10">
            <h2 className="font-display font-black text-lg sm:text-xl text-white tracking-widest text-shadow-gold">
              THE ENDLESS ABYSS
            </h2>
            <p className="text-[10.5px] sm:text-xs text-gray-400 mt-0.5 max-w-xl mx-auto font-sans leading-tight">
              Descend into the infinite depths. Defeat the dark entities to claim ancient resources.
            </p>

            {/* Prominent Centered Energy Pill with + Button */}
            <div 
              onClick={() => setIsBuyEnergyModalOpen(true)}
              className="mt-2 inline-flex items-center gap-2 bg-gradient-to-r from-[#061c12] via-black to-[#061c12] border border-emerald-500/50 hover:border-emerald-400 rounded-full py-1 pl-3 pr-1.5 shadow-[0_0_15px_rgba(16,185,129,0.25)] select-none transition-all cursor-pointer group active:scale-95"
              title="Click to Refill Energy with Dark Shards"
            >
              <img 
                src="/icons/icon_energy.webp" 
                alt="Energy" 
                className="w-4.5 h-4.5 object-contain drop-shadow-[0_0_8px_rgba(16,185,129,0.9)] group-hover:scale-110 transition-transform" 
              />
              <div className="flex items-baseline gap-1.5 leading-none">
                <span className="font-display font-bold text-[10.5px] text-gray-300 tracking-wider">ENERGY:</span>
                <span className="font-mono text-xs sm:text-sm font-black text-emerald-400">
                  {profile.pveEnergy || 0}
                </span>
                <span className="font-mono text-[10.5px] sm:text-xs font-bold text-emerald-500/70">
                  / {pveEnergyMax}
                </span>
              </div>
              <span className="font-mono text-[10px] text-emerald-300/90 font-bold border-l border-emerald-500/30 pl-2 pr-1">
                {timeUntilRegen ? `+1 in ${timeUntilRegen}` : 'Full Energy'}
              </span>
              <div className="w-4.5 h-4.5 rounded-full bg-gradient-to-b from-emerald-500 to-emerald-700 group-hover:from-emerald-400 group-hover:to-emerald-600 text-black flex items-center justify-center border border-emerald-300/50 shadow-[0_0_8px_rgba(16,185,129,0.6)] shrink-0">
                <Plus className="w-3 h-3 stroke-[3] text-black" />
              </div>
            </div>
          </div>

          {/* 2. Large Centered Floor Selector matching PC */}
          <div className="flex items-center justify-between bg-[#18120d]/85 border border-[#ebd09b]/25 rounded-2xl py-2.5 sm:py-3 px-3 sm:px-5 shadow-inner relative z-10">
            <button 
              onClick={handlePrev}
              disabled={viewingFloor === 1}
              className="p-2.5 rounded-xl bg-black/40 border border-[#ebd09b]/25 hover:border-[#ebd09b]/60 text-[#ebd09b] hover:bg-[#ebd09b]/10 disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer active:scale-90 shrink-0 shadow-md"
              title="Previous Floor"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center select-none text-center px-2">
              <span className={`text-[10.5px] font-mono tracking-widest uppercase font-bold ${isBoss ? 'text-red-500 animate-pulse' : 'text-[#ebd09b]'}`}>
                {isBoss ? 'Boss Floor' : 'Floor'}
              </span>
              <div className="text-[44px] sm:text-5xl font-display font-black text-white text-shadow-gold leading-none my-1">
                {viewingFloor}
              </div>
              
              {/* 3 Stars display directly under floor number */}
              <div className="flex justify-center gap-1.5 my-1">
                {[1, 2, 3].map(star => (
                  <Star 
                    key={star} 
                    className={`w-5 h-5 sm:w-5.5 sm:h-5.5 ${
                      star <= stageStars 
                        ? 'text-[#ebd09b] fill-[#ebd09b] drop-shadow-[0_0_8px_rgba(235,208,155,0.8)]' 
                        : 'text-gray-700'
                    }`} 
                  />
                ))}
              </div>

              <span className={`text-[10px] font-mono tracking-wider uppercase font-bold ${
                viewingFloor === maxFloor ? 'text-emerald-400' : 'text-amber-500'
              }`}>
                {viewingFloor === maxFloor ? 'Current Max' : 'Farm Mode'}
              </span>
            </div>

            <button 
              onClick={handleNext}
              disabled={viewingFloor >= maxFloor}
              className="p-2.5 rounded-xl bg-black/40 border border-[#ebd09b]/25 hover:border-[#ebd09b]/60 text-[#ebd09b] hover:bg-[#ebd09b]/10 disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer active:scale-90 shrink-0 shadow-md"
              title="Next Floor"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* 3. Encounter & Victory Rewards matching PC 1:1 */}
          <div className="flex flex-col gap-3 relative z-10">
            {/* Encounter details */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-gray-400 tracking-widest uppercase font-bold block">
                ENCOUNTER
              </span>
              <div className="bg-[#18120d]/85 border border-[#ebd09b]/25 rounded-2xl p-3 sm:p-3.5 flex items-center gap-3.5 shadow-inner">
                <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border shrink-0 ${
                  isBoss ? 'bg-[#4e0707] border-[#dd2c40]/50 shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'bg-[#1f2833] border-cyan-900'
                } overflow-hidden`}>
                  {selectedStage.enemyHeroImage?.startsWith('/') ? (
                    <img 
                      src={selectedStage.enemyHeroImage} 
                      alt="Enemy Hero" 
                      className="w-full h-full object-cover animate-pulse" 
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/avatars/knight.webp'; }}
                    />
                  ) : isBoss ? (
                    <Crown className="w-7 h-7 text-purple-500 drop-shadow-[0_0_12px_rgba(168,85,247,0.8)] animate-pulse" />
                  ) : (
                    <Skull className="w-6 h-6 text-red-500/90" />
                  )}
                </div>
                <div>
                  <h4 className="font-display font-bold text-white text-[15px] sm:text-base leading-tight">
                    {selectedStage.enemyHeroName}
                  </h4>
                  <p className="text-xs font-mono text-gray-400 mt-1">
                    Hero Health: <span className="text-[#dd2c40] font-bold">{selectedStage.enemyHeroHealth} HP</span>
                  </p>
                  <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                    Deck Size: {selectedStage.enemyDeck?.length || 10} Cards
                  </p>
                </div>
              </div>
            </div>

            {/* Victory Rewards matching PC */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-[#ebd09b]/90 tracking-widest uppercase font-bold block">
                VICTORY REWARDS
              </span>
              <div className="bg-[#18120d]/85 border border-[#ebd09b]/25 rounded-2xl p-2.5 sm:p-3 flex items-center justify-around gap-2 shadow-inner">
                {/* Gold Pill */}
                <div className="flex-1 flex flex-col items-center justify-center p-2 rounded-xl bg-white/[0.05] border border-amber-500/30 hover:border-amber-400/60 hover:bg-amber-500/[0.08] transition-all cursor-default group">
                  <div className="flex items-center gap-1.5">
                    <img src="/icons/icon_gold.webp" alt="Gold" className="w-5 h-5 sm:w-5.5 sm:h-5.5 object-contain drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] group-hover:scale-110 transition-transform" />
                    <span className="font-mono font-black text-amber-300 text-xs sm:text-sm leading-none">+{selectedStage.goldReward}</span>
                  </div>
                  <span className="text-[9px] text-amber-400/90 font-mono uppercase tracking-wider font-semibold mt-0.5">Gold</span>
                </div>

                {/* Dust Pill */}
                <div className="flex-1 flex flex-col items-center justify-center p-2 rounded-xl bg-white/[0.05] border border-cyan-500/30 hover:border-cyan-400/60 hover:bg-cyan-500/[0.08] transition-all cursor-default group">
                  <div className="flex items-center gap-1.5">
                    <img src="/icons/icon_dust.webp" alt="Dust" className="w-5 h-5 sm:w-5.5 sm:h-5.5 object-contain drop-shadow-[0_0_10px_rgba(102,252,241,0.6)] scale-[1.7] group-hover:scale-[1.85] transition-transform" />
                    <span className="font-mono font-black text-[#66fcf1] text-xs sm:text-sm leading-none">+{selectedStage.dustReward}</span>
                  </div>
                  <span className="text-[9px] text-cyan-300 font-mono uppercase tracking-wider font-semibold mt-0.5">Dust</span>
                </div>

                {/* Shards or EXP Pill */}
                {selectedStage.shardsReward > 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-2 rounded-xl bg-white/[0.05] border border-red-500/30 hover:border-red-400/60 hover:bg-red-500/[0.08] transition-all cursor-default group">
                    <div className="flex items-center gap-1.5">
                      <img src="/icons/icon_shards.webp" alt="Shards" className="w-5 h-5 sm:w-5.5 sm:h-5.5 object-contain drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] scale-110 group-hover:scale-120 transition-transform" />
                      <span className="font-mono font-black text-rose-400 text-xs sm:text-sm leading-none">+{selectedStage.shardsReward}</span>
                    </div>
                    <span className="text-[9px] text-red-300 font-mono uppercase tracking-wider font-semibold mt-0.5">Shards</span>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-2 rounded-xl bg-white/[0.05] border border-emerald-500/30 hover:border-emerald-400/60 hover:bg-emerald-500/[0.08] transition-all cursor-default group">
                    <div className="flex items-center gap-1.5">
                      <img src="/icons/icon_exp.webp" alt="EXP" className="w-5 h-5 sm:w-5.5 sm:h-5.5 object-contain drop-shadow-[0_0_8px_rgba(16,185,129,0.7)] group-hover:scale-110 transition-transform" />
                      <span className="font-mono font-black text-emerald-400 text-xs sm:text-sm leading-none">+{selectedStage.id * 16 + 32}</span>
                    </div>
                    <span className="text-[9px] text-emerald-300 font-mono uppercase tracking-wider font-semibold mt-0.5">Hero EXP</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Guaranteed Card Drop (if present) */}
          {selectedStage.cardReward && (
            <div className="bg-[#18120d]/85 border border-emerald-500/30 p-2.5 rounded-2xl flex items-center justify-between shadow-inner relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-950/40 flex items-center justify-center border border-emerald-500/30 shrink-0">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div>
                  <span className="text-emerald-400 font-bold text-[11px] block leading-tight">Guaranteed Card Drop</span>
                  <span className="text-[9.5px] text-gray-400 font-mono mt-0.5">{selectedStage.cardReward.name}</span>
                </div>
              </div>
              <span className="text-[8.5px] bg-emerald-950/40 text-emerald-400 px-2 py-0.5 rounded-md font-mono border border-emerald-500/20 font-bold">
                Guaranteed
              </span>
            </div>
          )}

          {/* 4. Action Buttons: BATTLE & SWEEP (No extra clutter under buttons, matching PC 1:1) */}
          <div className="pt-2.5 border-t border-gray-800/80 flex flex-col gap-2 relative z-10">
            <button
              onClick={handleStart}
              className={`w-full font-display font-bold tracking-widest py-3.5 sm:py-4 px-5 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer hover:scale-[1.01] active:scale-[0.98] text-sm sm:text-base uppercase ${
                isBoss 
                  ? 'bg-gradient-to-b from-[#4a0d16] via-[#2a060a] to-[#1a0305] border-2 border-red-500/70 hover:border-red-400 text-red-300 hover:text-white shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.45)]'
                  : 'bg-gradient-to-b from-[#342417] via-[#23170e] to-[#160e08] border-2 border-[#ebd09b]/70 hover:border-[#ebd09b] text-[#ebd09b] hover:text-white shadow-[0_0_20px_rgba(235,208,155,0.25)] hover:shadow-[0_0_30px_rgba(235,208,155,0.4)]'
              }`}
            >
              <Swords className="w-5 h-5 animate-pulse" /> 
              <span className="mr-0.5">BATTLE</span>
              <span className={`flex items-center gap-1 bg-black/50 border rounded-full px-2.5 py-0.5 font-mono text-xs sm:text-sm font-bold text-emerald-400 shadow-inner ${
                isBoss ? 'border-red-500/30' : 'border-[#ebd09b]/35'
              }`}>
                {selectedStage.energyCost}
                <img src="/icons/icon_energy.webp" alt="Energy" className="w-4 h-4 object-contain brightness-110 drop-shadow-[0_0_6px_rgba(16,185,129,0.45)]" />
              </span>
            </button>

            {canSweep && (
              <button
                onClick={handleSweep}
                disabled={isSweeping || (profile.pveEnergy || 0) < selectedStage.energyCost}
                className="w-full font-display font-bold tracking-widest py-3.5 sm:py-4 px-5 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer hover:scale-[1.01] active:scale-[0.98] text-sm sm:text-base uppercase bg-gradient-to-b from-[#1b122c] via-[#0e071a] to-[#06020c] border-2 border-purple-600/50 hover:border-purple-400 text-purple-400 hover:text-white shadow-[0_0_15px_rgba(147,51,234,0.2)] hover:shadow-[0_0_25px_rgba(168,85,247,0.35)] disabled:opacity-40"
              >
                <FastForward className="w-5 h-5" /> 
                <span className="mr-0.5">SWEEP</span>
                <span className="flex items-center gap-1 bg-black/50 border border-purple-500/30 rounded-full px-2.5 py-0.5 font-mono text-xs sm:text-sm font-bold text-emerald-400 shadow-inner">
                  {selectedStage.energyCost}
                  <img src="/icons/icon_energy.webp" alt="Energy" className="w-4 h-4 object-contain brightness-110 drop-shadow-[0_0_6px_rgba(16,185,129,0.45)]" />
                </span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Abyssal Energy Vault Modal (Full PC Feature Implementation) */}
      {isBuyEnergyModalOpen && (
        <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-gradient-to-b from-[#0f1f17] via-[#09140f] to-[#040906] border-2 border-emerald-500/50 rounded-3xl p-4 sm:p-6 max-w-sm w-full relative shadow-[0_0_60px_rgba(0,0,0,0.95)] space-y-3.5 overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Ambient Background Glows */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/15 blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={() => setIsBuyEnergyModalOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white w-7 h-7 flex items-center justify-center bg-black/70 border border-white/10 rounded-full z-30 transition-all cursor-pointer"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Header */}
            <div className="text-center space-y-1 relative z-10 pt-1">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-b from-emerald-950/80 to-black border-2 border-emerald-500/60 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.35)]">
                <img src="/icons/icon_energy.webp" alt="Energy" className="w-7 h-7 object-contain drop-shadow-[0_0_8px_rgba(16,185,129,0.85)]" />
              </div>
              <h3 className="font-display font-black text-base sm:text-lg text-transparent bg-clip-text bg-gradient-to-b from-emerald-100 via-emerald-300 to-teal-400 tracking-wider uppercase text-shadow-gold">
                ABYSSAL ENERGY VAULT
              </h3>
              <p className="text-[10px] text-gray-300 font-sans leading-tight max-w-xs mx-auto">
                Exchange Dark Shards for PvE Energy to descend deeper into the Abyss.
              </p>
            </div>

            {/* Status Bar: Current Energy, Regen & Shards */}
            <div className="grid grid-cols-3 gap-1.5 bg-black/60 border border-white/10 rounded-2xl p-2 relative z-10 shadow-inner text-center">
              <div className="border-r border-white/10 pr-1">
                <span className="text-[8px] font-mono text-gray-400 uppercase block font-bold">Energy</span>
                <span className="font-mono text-xs font-black text-emerald-400 flex items-center justify-center gap-0.5 mt-0.5">
                  <img src="/icons/icon_energy.webp" alt="" className="w-3 h-3 object-contain" />
                  {profile.pveEnergy || 0}/{pveEnergyMax}
                </span>
              </div>

              <div className="border-r border-white/10 px-1">
                <span className="text-[8px] font-mono text-gray-400 uppercase block font-bold">Regen</span>
                <span className="font-mono text-xs font-black text-teal-300 block mt-0.5">
                  +1/{Math.round(pveRegenInterval / 60000)}m
                </span>
              </div>

              <div className="pl-1">
                <span className="text-[8px] font-mono text-gray-400 uppercase block font-bold">Shards</span>
                <span className="font-mono text-xs font-black text-rose-300 flex items-center justify-center gap-0.5 mt-0.5">
                  <img src="/icons/icon_shards.webp" alt="" className="w-3 h-3 object-contain" />
                  {profile.darkShards || 0}
                </span>
              </div>
            </div>

            {/* 3 Energy Packages matching PC */}
            <div className="grid grid-cols-3 gap-2 relative z-10">
              {[
                { 
                  count: 3, 
                  cost: 10, 
                  label: 'Minor Vial', 
                  image: '/icons/energy_vial_small.webp',
                  theme: 'border-white/10 bg-black/70' 
                },
                { 
                  count: 10, 
                  cost: 25, 
                  label: 'Flask', 
                  image: '/icons/energy_flask_medium.webp',
                  popular: true, 
                  badge: 'POPULAR',
                  theme: 'border-emerald-500/60 bg-emerald-950/25 shadow-[0_0_12px_rgba(16,185,129,0.2)]' 
                },
                { 
                  count: 25, 
                  cost: 50, 
                  label: 'Elixir', 
                  image: '/icons/energy_elixir_large.webp',
                  badge: 'BEST',
                  theme: 'border-amber-500/60 bg-amber-950/25 shadow-[0_0_12px_rgba(245,158,11,0.2)]' 
                }
              ].map((pkg) => {
                const canAfford = (profile.darkShards || 0) >= pkg.cost;

                return (
                  <div 
                    key={pkg.count}
                    className={`relative rounded-2xl border p-2 flex flex-col items-center justify-between text-center transition-all ${pkg.theme}`}
                  >
                    {/* Badge */}
                    {pkg.badge && (
                      <div className={`absolute -top-2 px-1.5 py-0.2 rounded-full text-[7.5px] font-mono font-black uppercase border ${
                        pkg.popular 
                          ? 'bg-emerald-500 text-black border-emerald-300' 
                          : 'bg-amber-500 text-black border-amber-300'
                      }`}>
                        {pkg.badge}
                      </div>
                    )}

                    {/* Icon & Count */}
                    <div className="flex flex-col items-center mt-1 space-y-0.5">
                      <div className="w-10 h-10 rounded-xl bg-black/60 border border-white/10 p-0.5 flex items-center justify-center overflow-hidden">
                        <img src={pkg.image} alt="" className="w-full h-full object-contain" />
                      </div>
                      <span className="font-display font-black text-sm text-white">
                        +{pkg.count}
                      </span>
                      <span className="text-[8px] text-gray-400 font-sans leading-none">
                        {pkg.label}
                      </span>
                    </div>

                    {/* Price Button */}
                    <button
                      onClick={async () => {
                        if (isPurchasingEnergy) return;
                        if (!canAfford) {
                          toast(`Not enough Dark Shards! Need ${pkg.cost} Shards.`, 'warning');
                          setIsBuyEnergyModalOpen(false);
                          setIsShardsShopOpen(true);
                          return;
                        }
                        setIsPurchasingEnergy(true);
                        try {
                          const success = await buyPveEnergy(pkg.count);
                          if (success) {
                            toast(`Restored +${pkg.count} PvE Energy!`, 'success');
                          } else {
                            toast('Failed to purchase energy', 'error');
                          }
                        } finally {
                          setIsPurchasingEnergy(false);
                        }
                      }}
                      disabled={isPurchasingEnergy}
                      className={`w-full mt-2 py-1.5 rounded-xl font-mono font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        canAfford
                          ? pkg.popular
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-sm active:scale-95'
                            : 'bg-white/10 hover:bg-white/20 text-white border border-white/20 active:scale-95'
                          : 'bg-red-950/30 text-red-400 border border-red-500/30'
                      }`}
                    >
                      <span>{pkg.cost}</span>
                      <img src="/icons/icon_shards.webp" alt="" className="w-3.5 h-3.5 object-contain" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Overflow Protected Note */}
            <div className="bg-black/60 border border-white/10 rounded-xl p-2 text-center text-[10px] text-gray-300 font-sans leading-tight relative z-10 flex items-center justify-center gap-1.5">
              <span className="text-emerald-400 text-xs">💡</span>
              <span>
                <strong className="text-emerald-300">Overflow Protected:</strong> Energy purchased with Dark Shards is added above cap and never expires.
              </span>
            </div>

            {/* Back to Abyss Button */}
            <button
              onClick={() => setIsBuyEnergyModalOpen(false)}
              className="w-full py-2 rounded-xl border border-white/10 bg-black/40 text-gray-300 font-display font-bold tracking-wider text-[11px] uppercase transition-colors cursor-pointer active:scale-95 relative z-10"
            >
              Back to Abyss
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

