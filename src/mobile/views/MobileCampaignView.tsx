import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { useToast } from '../../components/Toast';
import { generateCampaignStage } from '../../data/cards';
import { CampaignStage } from '../../types';
import { Skull, Swords, ChevronLeft, ChevronRight, Star, FastForward, Plus, X } from 'lucide-react';
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

  useEffect(() => {
    if (viewingFloor < maxFloor && viewingFloor === maxFloor - 1) {
      setViewingFloor(maxFloor);
    }
  }, [maxFloor]);

  const selectedStage = generateCampaignStage(viewingFloor);

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
      setTimeUntilRegen(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [profile.lastPveEnergyRefill, profile.pveEnergy]);

  const isBoss = selectedStage.isBoss;
  const stageStars = profile.pveStageStars?.[viewingFloor] || 0;
  const canSweep = stageStars === 3;

  const handlePrev = () => {
    if (viewingFloor > 1) setViewingFloor(prev => prev - 1);
  };

  const handleNext = () => {
    if (viewingFloor < maxFloor) setViewingFloor(prev => prev + 1);
  };

  const handleSweep = async () => {
    if ((profile.pveEnergy || 0) < selectedStage.energyCost) {
      toast(`Insufficient Energy (${selectedStage.energyCost} required)`, 'warning');
      setIsBuyEnergyModalOpen(true);
      return;
    }
    try {
      setIsSweeping(true);
      const res = await submitAction('sweep_campaign_stage', { stageId: viewingFloor });
      if (res.success) {
        toast(`Floor ${viewingFloor} Cleared! +${res.rewards?.gold || 0} Gold, +${res.rewards?.dust || 0} Dust`, 'success');
      } else {
        toast(res.error || 'Auto-battle failed', 'error');
      }
    } catch {
      toast('Network error during auto-battle', 'error');
    } finally {
      setIsSweeping(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col p-1.5 sm:p-2 select-none overflow-hidden">
      {/* 2-Column Landscape Console Layout */}
      <div className="flex-1 flex gap-2 min-h-0">
        {/* LEFT COLUMN: Floor Navigation & Energy (38% width) */}
        <div className="w-[38%] max-w-[320px] bg-gradient-to-b from-[#140e0c]/90 via-[#0a0705]/95 to-[#050403] border border-[#ebd09b]/25 rounded-xl p-2 flex flex-col justify-between shadow-xl relative overflow-hidden">
          {/* Subtle glow */}
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top: Energy Pill */}
          <div 
            onClick={() => setIsBuyEnergyModalOpen(true)}
            className="flex items-center justify-between bg-black/60 border border-emerald-500/40 hover:border-emerald-400 rounded-lg px-2 py-1 shadow-inner cursor-pointer transition-all active:scale-98"
          >
            <div className="flex items-center gap-1.5">
              <img src="/icons/icon_energy.webp" alt="⚡" className="w-4 h-4 object-contain drop-shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
              <span className="font-display text-[10px] text-gray-300 font-bold">ENERGY:</span>
              <span className="font-mono text-xs font-black text-emerald-400 leading-none">
                {profile.pveEnergy || 0}
                <span className="text-[9px] text-emerald-600 font-normal">/{pveEnergyMax}</span>
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-mono font-bold text-emerald-300/80">
                {timeUntilRegen ? timeUntilRegen : 'FULL'}
              </span>
              <div className="w-4 h-4 rounded bg-emerald-600 text-black flex items-center justify-center font-black">
                <Plus className="w-3 h-3 stroke-[3]" />
              </div>
            </div>
          </div>

          {/* Center: Big Floor Carousel Card */}
          <div className="flex-1 flex items-center justify-between my-1 bg-black/40 border border-white/5 rounded-xl px-2 py-1 relative">
            <button
              onClick={handlePrev}
              disabled={viewingFloor === 1}
              className="w-8 h-8 rounded-lg bg-black/60 border border-[#ebd09b]/30 text-[#ebd09b] flex items-center justify-center disabled:opacity-20 active:scale-90 transition-all cursor-pointer shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center select-none text-center">
              <span className={`text-[9px] font-mono tracking-widest uppercase font-black ${isBoss ? 'text-red-400 animate-pulse' : 'text-[#ebd09b]'}`}>
                {isBoss ? '🔥 BOSS FLOOR' : 'THE ABYSS'}
              </span>
              <div className="font-display font-black text-3xl sm:text-4xl text-white text-shadow-gold leading-none my-0.5">
                {viewingFloor}
              </div>
              {/* Stars */}
              <div className="flex gap-1">
                {[1, 2, 3].map(s => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${s <= stageStars ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]' : 'text-gray-700'}`}
                  />
                ))}
              </div>
              <span className={`text-[8px] font-mono uppercase font-bold mt-0.5 ${viewingFloor === maxFloor ? 'text-emerald-400' : 'text-amber-400/80'}`}>
                {viewingFloor === maxFloor ? 'Current Stage' : 'Farm Cleared'}
              </span>
            </div>

            <button
              onClick={handleNext}
              disabled={viewingFloor === maxFloor}
              className="w-8 h-8 rounded-lg bg-black/60 border border-[#ebd09b]/30 text-[#ebd09b] flex items-center justify-center disabled:opacity-20 active:scale-90 transition-all cursor-pointer shrink-0"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Bottom Left: Sweep or Mode */}
          {canSweep ? (
            <button
              onClick={handleSweep}
              disabled={isSweeping || (profile.pveEnergy || 0) < selectedStage.energyCost}
              className="w-full py-1.5 bg-gradient-to-r from-amber-600/30 to-amber-900/30 hover:from-amber-600/50 hover:to-amber-900/50 border border-amber-500/50 rounded-lg flex items-center justify-center gap-1.5 text-amber-300 font-display text-[10px] font-bold tracking-wider uppercase transition-all active:scale-95 cursor-pointer disabled:opacity-40"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>{isSweeping ? 'Sweeping...' : 'Quick Sweep (⚡1)'}</span>
            </button>
          ) : (
            <div className="text-center py-1 text-[9px] font-mono text-gray-500">
              {stageStars === 0 ? 'Not completed yet' : `${stageStars}/3 Stars — 3★ unlocks Sweep`}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Boss Info, Deck, Rewards & BIG FIGHT BUTTON (62% width) */}
        <div className="flex-1 bg-gradient-to-b from-[#140e0c]/90 via-[#0a0705]/95 to-[#050403] border border-[#ebd09b]/25 rounded-xl p-2.5 flex flex-col justify-between shadow-xl relative overflow-hidden">
          {/* Subtle boss glow */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top: Boss Banner */}
          <div className="flex items-center gap-2.5 bg-black/40 border border-white/10 rounded-xl p-2">
            <div className="w-12 h-12 rounded-xl border-2 border-red-600/60 bg-red-950/40 overflow-hidden flex items-center justify-center shadow-md shrink-0">
              {selectedStage.enemyHeroImage ? (
                <img 
                  src={selectedStage.enemyHeroImage} 
                  alt="" 
                  className="w-full h-full object-cover" 
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/avatars/knight.webp'; }}
                />
              ) : (
                <Skull className="w-6 h-6 text-red-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-sm text-white truncate tracking-wide text-shadow-gold">
                  {selectedStage.name}
                </h3>
                <span className="font-mono text-[9px] bg-red-950/80 border border-red-500/40 px-1.5 py-0.2 rounded text-red-300 shrink-0 font-bold">
                  Lv.{selectedStage.enemyLevel || viewingFloor}
                </span>
              </div>
              <p className="font-sans text-[10px] text-gray-400 line-clamp-1 mt-0.5">
                {selectedStage.description || 'Defeat the guardian of the abyss to open the descent.'}
              </p>
              <div className="flex items-center gap-2 mt-1 font-mono text-[9px] text-gray-400">
                <span className="text-red-400 font-bold">❤️ HP: {selectedStage.enemyHeroHealth || (30 + viewingFloor * 2)}</span>
                <span>•</span>
                <span className="text-cyan-400 font-bold">🎴 Deck: {selectedStage.enemyDeck?.length || 10} creatures</span>
              </div>
            </div>
          </div>

          {/* Center: Enemy Deck Miniature Preview + Rewards */}
          <div className="flex items-center gap-2 my-1.5 min-h-0">
            {/* Enemy Deck Miniatures */}
            <div className="flex-1 bg-black/40 border border-white/5 rounded-xl p-1.5">
              <span className="text-[8px] font-mono text-gray-400 uppercase font-bold block mb-1">Guarding Creatures</span>
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                {(selectedStage.enemyDeck || []).slice(0, 7).map((c, i) => (
                  <div 
                    key={i} 
                    className="w-8 h-11 rounded border border-white/15 bg-gray-900 overflow-hidden shrink-0 relative flex flex-col justify-end"
                    title={c.name}
                  >
                    {c.image && <img src={c.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    <div className="relative z-10 flex justify-between px-0.5 text-[7px] font-mono font-black text-white leading-none pb-0.5">
                      <span className="text-red-400">{c.attack}</span>
                      <span className="text-emerald-400">{c.health}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stage Victory Rewards */}
            <div className="w-[42%] bg-black/40 border border-white/5 rounded-xl p-1.5 shrink-0">
              <span className="text-[8px] font-mono text-amber-400 uppercase font-bold block mb-1">Clear Rewards</span>
              <div className="grid grid-cols-2 gap-1 font-mono text-[9px] font-bold">
                <div className="flex items-center gap-1 bg-black/50 px-1.5 py-0.5 rounded border border-amber-950/40 text-amber-400">
                  <img src="/icons/icon_gold.webp" alt="" className="w-3.5 h-3.5 object-contain" />
                  <span>+{selectedStage.goldReward}</span>
                </div>
                <div className="flex items-center gap-1 bg-black/50 px-1.5 py-0.5 rounded border border-cyan-950/40 text-cyan-400">
                  <img src="/icons/icon_dust.webp" alt="" className="w-3.5 h-3.5 object-contain" />
                  <span>+{selectedStage.dustReward}</span>
                </div>
                <div className="flex items-center gap-1 bg-black/50 px-1.5 py-0.5 rounded border border-emerald-950/40 text-emerald-400">
                  <img src="/icons/icon_exp.webp" alt="" className="w-3.5 h-3.5 object-contain" />
                  <span>+{selectedStage.expReward}</span>
                </div>
                {selectedStage.shardsReward > 0 && (
                  <div className="flex items-center gap-1 bg-black/50 px-1.5 py-0.5 rounded border border-rose-950/40 text-rose-400">
                    <img src="/icons/icon_shards.webp" alt="" className="w-3.5 h-3.5 object-contain" />
                    <span>+{selectedStage.shardsReward}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Action: BIG TACTILE FIGHT BUTTON */}
          <button
            onClick={() => {
              if ((profile.pveEnergy || 0) < selectedStage.energyCost) {
                toast(`Insufficient Energy (${selectedStage.energyCost} required)`, 'warning');
                setIsBuyEnergyModalOpen(true);
                return;
              }
              onStartBattle(selectedStage);
            }}
            className="w-full py-2.5 bg-gradient-to-r from-[#ebd09b] via-[#f59e0b] to-[#ebd09b] hover:brightness-110 text-black font-display font-black text-sm tracking-widest uppercase rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
          >
            <Swords className="w-4 h-4 stroke-[2.5]" />
            <span>ENTER BATTLE</span>
            <span className="font-mono text-xs font-bold bg-black/20 px-1.5 py-0.5 rounded">
              ⚡ {selectedStage.energyCost} Energy
            </span>
          </button>
        </div>
      </div>

      {/* Energy Refill Modal */}
      {isBuyEnergyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-[#0f0b08] border-2 border-emerald-500/50 rounded-2xl max-w-sm w-full p-4 space-y-3 text-center shadow-2xl relative">
            <button 
              onClick={() => setIsBuyEnergyModalOpen(false)}
              className="absolute top-2.5 right-2.5 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-10 h-10 rounded-full bg-emerald-950/60 border border-emerald-500 flex items-center justify-center mx-auto shadow-lg">
              <img src="/icons/icon_energy.webp" alt="" className="w-6 h-6 object-contain" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">Replenish Energy</h3>
              <p className="font-sans text-[10px] text-gray-400 mt-0.5">
                Instantly restore 5 Campaign Energy for 10 Dark Shards.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 bg-black/50 py-1.5 rounded-lg font-mono text-xs text-rose-300">
              <img src="/icons/icon_shards.webp" alt="" className="w-4 h-4 object-contain" />
              <span>Cost: 10 Dark Shards (Have: {profile.darkShards || 0})</span>
            </div>
            <button
              onClick={async () => {
                if ((profile.darkShards || 0) < 10) {
                  setIsBuyEnergyModalOpen(false);
                  setIsShardsShopOpen(true);
                  toast('Insufficient Dark Shards! Opening Shop...', 'warning');
                  return;
                }
                setIsPurchasingEnergy(true);
                const success = await buyPveEnergy();
                setIsPurchasingEnergy(false);
                if (success) {
                  toast('Energy restored by +5!', 'success');
                  setIsBuyEnergyModalOpen(false);
                } else {
                  toast('Failed to restore energy', 'error');
                }
              }}
              disabled={isPurchasingEnergy}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-black font-display font-black text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer"
            >
              {isPurchasingEnergy ? 'Restoring...' : 'Confirm Refill (+5 Energy)'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
