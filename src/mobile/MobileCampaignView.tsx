import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useToast } from '../components/Toast';
import { generateCampaignStage } from '../data/cards';
import { CampaignStage } from '../types';
import { Skull, Swords, Crown, Star, FastForward, Plus, ChevronLeft, ChevronRight, Award } from 'lucide-react';
import { getActiveSubscriptionTier, getTierLimits } from '../utils/energyHelper';

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
  const stageStars = profile.campaignStars?.[selectedStage.id.toString()] || 0;

  const handleStart = () => {
    if (profile.deck.length < 10) {
      toast('Deck must have 10 cards.', 'warning');
      return;
    }
    if ((profile.pveEnergy || 0) < selectedStage.energyCost) {
      setIsBuyEnergyModalOpen(true);
      return;
    }
    onStartBattle(selectedStage);
  };

  const handleSweep = async () => {
    if (isSweeping) return;
    if ((profile.pveEnergy || 0) < selectedStage.energyCost) {
      setIsBuyEnergyModalOpen(true);
      return;
    }
    setIsSweeping(true);
    try {
      const res = await submitAction('sweep_stage', { floorNum: viewingFloor });
      if (!res.success) toast(res.message, 'error');
      else toast(res.message, 'success');
    } finally {
      setIsSweeping(false);
    }
  };

  return (
    <div className="w-full h-full flex overflow-hidden animate-fadeIn text-white font-sans">
      
      {/* Left Column 40% */}
      <div className="w-[40%] h-full flex flex-col p-2 border-r border-[#ebd09b]/20 bg-black/40">
        
        {/* Floor Selector */}
        <div className="flex items-center justify-between bg-black/60 border border-gray-800/50 rounded-xl p-1 mb-2">
          <button 
            onClick={() => setViewingFloor(f => Math.max(1, f - 1))}
            disabled={viewingFloor === 1}
            className="p-1 rounded bg-black/40 text-[#ebd09b] hover:bg-[#ebd09b]/10 disabled:opacity-20"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex flex-col items-center">
            <span className={`text-[9px] font-mono tracking-widest uppercase font-bold ${isBoss ? 'text-red-500' : 'text-[#ebd09b]'}`}>
              {isBoss ? 'BOSS' : 'FLOOR'}
            </span>
            <div className="text-2xl font-display font-black leading-none text-shadow-gold my-0.5">
              {viewingFloor}
            </div>
            <div className="flex justify-center gap-0.5">
              {[1, 2, 3].map(star => (
                <Star key={star} className={`w-3 h-3 ${star <= stageStars ? 'text-[#ebd09b] fill-[#ebd09b]' : 'text-gray-700'}`} />
              ))}
            </div>
          </div>
          
          <button 
            onClick={() => setViewingFloor(f => Math.min(maxFloor, f + 1))}
            disabled={viewingFloor >= maxFloor}
            className="p-1 rounded bg-black/40 text-[#ebd09b] hover:bg-[#ebd09b]/10 disabled:opacity-20"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Boss Portrait & Details */}
        <div className="flex-1 flex flex-col items-center justify-center bg-black/50 border border-gray-800/60 rounded-xl p-2 relative">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center border mb-2 ${isBoss ? 'bg-[#4e0707] border-[#dd2c40]/50' : 'bg-[#1f2833] border-cyan-900'} overflow-hidden`}>
            {selectedStage.enemyHeroImage?.startsWith('/') ? (
              <img src={selectedStage.enemyHeroImage} alt="Enemy" className="w-full h-full object-cover" />
            ) : (
              isBoss ? <Crown className="w-6 h-6 text-purple-500" /> : <Skull className="w-6 h-6 text-red-500/90" />
            )}
          </div>
          <h4 className="font-display font-bold text-sm text-center leading-none">{selectedStage.enemyHeroName}</h4>
          <p className="text-[10px] font-mono text-[#dd2c40] font-bold mt-1">{selectedStage.enemyHeroHealth} HP</p>
          <p className="text-[9px] text-gray-500 font-mono mt-0.5">Deck: {selectedStage.enemyDeck.length}</p>
        </div>
      </div>

      {/* Right Column 60% */}
      <div className="w-[60%] h-full flex flex-col p-2 space-y-2">
        
        {/* Energy Bar Header */}
        <div 
          onClick={() => setIsBuyEnergyModalOpen(true)}
          className="bg-gradient-to-r from-[#061c12] via-black to-[#061c12] border border-emerald-500/50 rounded-xl py-1.5 px-2 flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <img src="/icons/icon_energy.webp" alt="Energy" className="w-4 h-4 object-contain" />
            <span className="font-display font-bold text-[10px] text-gray-300">ENERGY:</span>
            <span className="font-mono text-xs font-black text-emerald-400">{profile.pveEnergy || 0}/{pveEnergyMax}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] text-emerald-300/90 font-bold">
              {timeUntilRegen ? `+1 in ${timeUntilRegen}` : 'FULL'}
            </span>
            <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
              <Plus className="w-3 h-3 text-black font-bold" />
            </div>
          </div>
        </div>

        {/* Rewards Preview */}
        <div className="flex-1 bg-black/50 border border-gray-800/60 rounded-xl p-2 flex flex-col">
          <span className="text-[9px] font-mono text-[#ebd09b]/80 tracking-widest uppercase font-bold block mb-1.5">Rewards</span>
          <div className="flex justify-around items-center flex-1">
            <div className="flex flex-col items-center">
              <img src="/icons/icon_gold.webp" className="w-6 h-6 object-contain" />
              <span className="font-mono font-black text-amber-300 text-[10px] mt-0.5">+{selectedStage.goldReward}</span>
            </div>
            <div className="flex flex-col items-center">
              <img src="/icons/icon_dust.webp" className="w-6 h-6 object-contain" />
              <span className="font-mono font-black text-cyan-300 text-[10px] mt-0.5">+{selectedStage.dustReward}</span>
            </div>
            {selectedStage.shardsReward > 0 ? (
              <div className="flex flex-col items-center">
                <img src="/icons/icon_shards.webp" className="w-6 h-6 object-contain" />
                <span className="font-mono font-black text-rose-400 text-[10px] mt-0.5">+{selectedStage.shardsReward}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <img src="/icons/icon_exp.webp" className="w-6 h-6 object-contain" />
                <span className="font-mono font-black text-emerald-400 text-[10px] mt-0.5">+{selectedStage.id * 16 + 32}</span>
              </div>
            )}
          </div>
          {selectedStage.cardReward && (
             <div className="mt-1 flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-500/20 rounded p-1">
               <Award className="w-3 h-3 text-emerald-400" />
               <span className="text-[9px] text-emerald-400 truncate">{selectedStage.cardReward.name}</span>
             </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleStart}
            className={`flex-1 font-display font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs uppercase ${
              isBoss 
                ? 'bg-gradient-to-b from-[#3a0b12] to-[#140204] border border-red-600/50 text-red-400'
                : 'bg-gradient-to-b from-[#221a12] to-[#0c0805] border border-[#c5a880]/50 text-[#ebd09b]'
            }`}
          >
            <Swords className="w-3.5 h-3.5" /> 
            BATTLE
            <span className="flex items-center gap-0.5 font-mono">
              {selectedStage.energyCost}
              <img src="/icons/icon_energy.webp" className="w-3 h-3" />
            </span>
          </button>
          
          {stageStars === 3 && (
            <button
              onClick={handleSweep}
              className="flex-1 font-display font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs uppercase bg-gradient-to-b from-[#1b122c] to-[#06020c] border border-purple-600/50 text-purple-400"
            >
              <FastForward className="w-3.5 h-3.5" /> 
              SWEEP
              <span className="flex items-center gap-0.5 font-mono">
                {selectedStage.energyCost}
                <img src="/icons/icon_energy.webp" className="w-3 h-3" />
              </span>
            </button>
          )}
        </div>
        
      </div>

      {/* Buy Energy Modal */}
      {isBuyEnergyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-2">
          <div className="bg-[#0f1f17] border border-emerald-500/50 rounded-2xl p-4 w-full max-w-sm">
            <h3 className="font-display font-black text-lg text-emerald-400 text-center mb-3">ENERGY VAULT</h3>
            
            <div className="flex gap-2 mb-4">
              {[
                { count: 3, cost: 10, img: '/icons/energy_vial_small.webp' },
                { count: 10, cost: 25, img: '/icons/energy_flask_medium.webp' },
                { count: 25, cost: 50, img: '/icons/energy_elixir_large.webp' }
              ].map(pkg => (
                <div key={pkg.count} className="flex-1 border border-white/10 rounded-xl p-2 flex flex-col items-center">
                  <img src={pkg.img} className="w-8 h-8 object-contain mb-1" />
                  <span className="text-white font-bold text-[10px]">+{pkg.count}</span>
                  <button 
                    onClick={async () => {
                      if ((profile.darkShards || 0) < pkg.cost) {
                        toast('Not enough Dark Shards!', 'warning');
                        setIsShardsShopOpen(true);
                        return;
                      }
                      if (isPurchasingEnergy) return;
                      setIsPurchasingEnergy(true);
                      await buyPveEnergy(pkg.count);
                      setIsPurchasingEnergy(false);
                    }}
                    className="w-full mt-2 bg-emerald-500/20 border border-emerald-500/50 rounded text-emerald-300 text-[9px] py-1 flex items-center justify-center gap-1"
                  >
                    {pkg.cost} <img src="/icons/icon_shards.webp" className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => setIsBuyEnergyModalOpen(false)}
              className="w-full bg-black/40 border border-white/20 text-gray-300 py-2 rounded-xl text-xs uppercase font-bold"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
