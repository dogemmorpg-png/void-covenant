import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useToast } from './Toast';
import { BATTLE_PASS_TIERS } from '../data/cards';
import { Award, Lock, CheckCircle2, ChevronRight, Gem, AlertCircle } from 'lucide-react';

export const BattlePassView: React.FC = () => {
  const { profile, setProfile, claimBattlePassReward, saveProfile, addBattlePassPoints } = useGame();
  const toast = useToast();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // local premium check (we can simulate or save in profile)
  // Let's store premium battle pass status in player profile by extending/simulating it.
  // We can add a simple check in GameContext, but to avoid making custom database migrations, we can store it directly in a state inside context or add a local state in profile.
  // Wait, let's look at GameContext: we did not add `isPremiumBattlePass` to PlayerProfile type to avoid clutter.
  // But wait! We can easily check if they unlocked premium using localstorage or we can just mock a toggle, or save it in profile anyway!
  // Let's look at `/src/types.ts` player profile, it does not have `isPremium` field, but we can access it if we add it, or save a state in this component or simulate it!
  // To keep it clean and robust, let's assume `profile` can have an optional `isPremiumBP` field. Since it is Javascript/Typescript, we can safely write to it!
  const isPremiumUnlocked = (profile as any).isPremiumBP || false;

  const handleBuyPremium = () => {
    if (isPremiumUnlocked) {
      toast('Dark Pass is already activated!', 'info');
      return;
    }

    if (profile.darkShards < 40) {
      toast('Not enough Dark Shards! Dark Pass costs 40 Dark Shards.', 'warning');
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmPurchase = () => {
    const updated = {
      ...profile,
      darkShards: profile.darkShards - 40,
      isPremiumBP: true
    };
    setProfile(updated as any);
    saveProfile(updated as any);
    setShowConfirmModal(false);
    toast('Dark Pass successfully activated! The Blood Moon welcomes you.', 'reward');
  };

  const handleClaimReward = (tierIndex: number, isPremium: boolean) => {
    const res = claimBattlePassReward(tierIndex, isPremium);
    if (res.success) {
      // update list
    } else {
      toast(res.message, 'warning');
    }
  };

  const handleSimulatePoints = () => {
    addBattlePassPoints(80);
    toast('Granted +80 pass points for completing daily dark quests!', 'reward');
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-8">
      
      {/* Header and banner */}
      <div className="bg-gradient-to-r from-purple-950/40 via-black to-red-950/40 border border-purple-500/20 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-[10px] bg-purple-950 text-purple-400 font-mono font-bold py-1 px-3 rounded-full border border-purple-500/30">
            SEASON 1: ABYSS ASCENDS
          </span>
          <h2 className="font-display font-black text-2xl text-white tracking-widest text-shadow-gold">
            BATTLE PASS — DARK PASS
          </h2>
          <p className="text-xs text-gray-300 font-sans max-w-xl">
            Conquer campaign stages and arenas, accumulate soul experience and claim exclusive rewards: gold, dark dust, and legendary packs.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 shrink-0">
          {isPremiumUnlocked ? (
            <div className="bg-purple-950/40 border border-purple-500 text-purple-400 text-xs font-display font-bold py-3 px-6 rounded-xl gothic-glow-purple flex items-center gap-2">
              <Award className="w-5 h-5" /> DARK PASS ACTIVE
            </div>
          ) : (
            <button
              onClick={handleBuyPremium}
              className="bg-gradient-to-r from-purple-800 to-red-900 hover:from-purple-600 hover:to-red-700 border border-purple-500/40 text-white font-display font-black text-xs tracking-widest py-3.5 px-6 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg gothic-glow-purple"
            >
              👑 ACTIVATE FOR 40 <img src="/icons/icon_shards.png" alt="Shards" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" />
            </button>
          )}
          <button
            onClick={handleSimulatePoints}
            className="text-[10px] text-gray-500 hover:text-white font-mono uppercase tracking-wider underline transition-all"
          >
            Simulate quests (+80 XP)
          </button>
        </div>
      </div>

      {/* Progress scale */}
      <div className="bg-[#151a21] border border-[#c5a880]/15 rounded-xl p-5 shadow-xl max-w-3xl mx-auto space-y-3">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-gray-400">Your current pass experience:</span>
          <span className="text-[#ebd09b] font-bold">{profile.battlePassPoints} XP</span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-[#0b0c10] border border-gray-800 rounded-full h-3.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-600 to-red-600 h-full rounded-full transition-all"
            style={{ width: `${Math.min(100, (profile.battlePassPoints / 500) * 100)}%` }}
          />
        </div>
        
        <div className="flex justify-between text-[10px] font-mono text-gray-500">
          <span>0 XP (Lvl 1)</span>
          <span>100 XP (Lvl 2)</span>
          <span>200 XP (Lvl 3)</span>
          <span>300 XP (Lvl 4)</span>
          <span>400 XP (Lvl 5)</span>
        </div>
      </div>

      {/* Tiers List Rows */}
      <div className="max-w-4xl mx-auto space-y-4">
        
        {/* Row Header Labels */}
        <div className="hidden sm:grid grid-cols-12 gap-4 px-4 text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500 text-center">
          <div className="col-span-2 text-left">Level</div>
          <div className="col-span-5 bg-black/10 py-1.5 rounded border border-gray-900">FREE REWARDS</div>
          <div className="col-span-5 bg-purple-950/10 py-1.5 rounded border border-purple-950/30">DARK PASS (PREMIUM)</div>
        </div>

        {BATTLE_PASS_TIERS.map((tier, idx) => {
          const isUnlocked = profile.battlePassPoints >= tier.pointsRequired;
          const freeClaimId = idx * 2;
          const premiumClaimId = idx * 2 + 1;
          
          const isFreeClaimed = profile.battlePassClaimed.includes(freeClaimId);
          const isPremiumClaimed = profile.battlePassClaimed.includes(premiumClaimId);

          return (
            <div
              key={tier.level}
              className={`grid grid-cols-1 sm:grid-cols-12 gap-4 items-center p-4 rounded-xl border ${
                isUnlocked 
                  ? 'bg-[#151a21]/80 border-[#c5a880]/15 shadow-md' 
                  : 'bg-black/10 border-gray-900 opacity-60'
              }`}
            >
              {/* Level Circle info */}
              <div className="sm:col-span-2 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-black text-base border ${
                  isUnlocked 
                    ? 'bg-gradient-to-b from-[#ebd09b] to-[#c5a880] text-black border-[#c5a880]' 
                    : 'bg-[#0b0c10] text-gray-600 border-gray-800'
                }`}>
                  {tier.level}
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-white block">STAGE {tier.level}</span>
                  <span className="text-[10px] font-mono text-gray-400">{tier.pointsRequired} XP</span>
                </div>
              </div>

              {/* Free Reward Block */}
              <div className="sm:col-span-5 bg-black/40 border border-gray-800/60 rounded-xl p-3 flex justify-between items-center">
                <div>
                  <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block font-bold">Free reward</span>
                  <span className="font-display font-bold text-xs text-white">{tier.freeRewardLabel}</span>
                </div>

                {isUnlocked ? (
                  isFreeClaimed ? (
                    <span className="text-[10px] text-emerald-500 font-mono font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> CLAIMED
                    </span>
                  ) : (
                    <button
                      onClick={() => handleClaimReward(idx, false)}
                      className="bg-[#c5a880] hover:bg-[#ebd09b] text-black font-mono font-bold text-[10px] py-1.5 px-4 rounded-lg tracking-wider"
                    >
                      CLAIM
                    </button>
                  )
                ) : (
                  <span className="text-[9px] text-gray-500 font-mono flex items-center gap-0.5">
                    <Lock className="w-3.5 h-3.5" /> LOCKED
                  </span>
                )}
              </div>

              {/* Premium Reward Block */}
              <div className={`sm:col-span-5 border rounded-xl p-3 flex justify-between items-center ${
                isPremiumUnlocked 
                  ? 'bg-purple-950/20 border-purple-500/30' 
                  : 'bg-[#0b0c10] border-gray-900'
              }`}>
                <div>
                  <span className="text-[9px] font-mono text-purple-400 uppercase tracking-widest block font-bold">Premium reward</span>
                  <span className="font-display font-bold text-xs text-[#ebd09b]">{tier.premiumRewardLabel}</span>
                </div>

                {!isPremiumUnlocked ? (
                  <span className="text-[9px] text-purple-400 font-mono flex items-center gap-0.5">
                    <Lock className="w-3.5 h-3.5" /> BP REQUIRED
                  </span>
                ) : isUnlocked ? (
                  isPremiumClaimed ? (
                    <span className="text-[10px] text-purple-400 font-mono font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> CLAIMED
                    </span>
                  ) : (
                    <button
                      onClick={() => handleClaimReward(idx, true)}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-[10px] py-1.5 px-4 rounded-lg tracking-wider"
                    >
                      CLAIM
                    </button>
                  )
                ) : (
                  <span className="text-[9px] text-gray-500 font-mono flex items-center gap-0.5">
                    <Lock className="w-3.5 h-3.5" /> LOCKED
                  </span>
                )}
              </div>

            </div>
          );
        })}

      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#151a21] border border-purple-500/50 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-900 via-red-900 to-purple-900" />
            
            <div className="p-6">
              <div className="text-center relative z-10">
                <Gem className="w-12 h-12 text-purple-400 mx-auto mb-4 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                <h2 className="text-xl font-display font-black text-white uppercase tracking-widest mb-2 text-shadow-gold">Unlock Dark Pass</h2>
                
                <p className="text-gray-300 font-sans text-sm mb-6 leading-relaxed">
                  Do you really want to purchase Premium Battle Pass: Dark Pass for 40 <img src="/icons/icon_shards.png" alt="Shards" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-5 h-5 inline-block align-text-bottom mx-1" />? You will instantly unlock legendary rewards!
                </p>

                <div className="flex gap-3">
                  <button onClick={() => setShowConfirmModal(false)} className="flex-1 bg-[#0b0c10] hover:bg-gray-800 border border-gray-700/50 text-gray-400 font-mono text-xs py-3 rounded-xl transition-all">
                    CANCEL
                  </button>
                  <button onClick={confirmPurchase} className="flex-1 bg-gradient-to-r from-purple-900 to-[#4e0707] hover:from-purple-600 hover:to-red-700 border border-purple-500/50 text-white font-display font-black tracking-widest py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                    CONFIRM
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
