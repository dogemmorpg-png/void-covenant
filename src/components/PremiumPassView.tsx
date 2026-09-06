import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useToast } from './Toast';
import { audioSystem } from '../utils/AudioSystem';
import { 
  Crown, 
  Sparkles, 
  Gift, 
  Check, 
  Flame,
  Info,
  ShieldAlert
} from 'lucide-react';

export const PremiumPassView: React.FC = () => {
  const { profile, buySubscription, claimDailySubscription, setIsShardsShopOpen } = useGame();
  const toast = useToast();

  const [durationDays, setDurationDays] = useState<30 | 90>(30);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const isSubActive = !!(profile.subscriptionExpiresAt && profile.subscriptionExpiresAt > Date.now());
  const activeTier = isSubActive ? (profile.subscriptionTier || 'free') : 'free';
  const remainingDays = isSubActive 
    ? Math.max(1, Math.ceil(((profile.subscriptionExpiresAt || 0) - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const todayUtc = new Date().toISOString().slice(0, 10);
  const isDailyClaimed = profile.lastDailySubscriptionClaim === todayUtc;

  // Prices in Dark Shards
  const PRICES = {
    premium: {
      30: 150,
      90: 400 // ~11% discount
    },
    ultra: {
      30: 350,
      90: 900 // ~14% discount
    }
  };

  const handleBuy = async (tier: 'premium' | 'ultra') => {
    audioSystem.playClick();
    const cost = PRICES[tier][durationDays];

    if ((profile.darkShards || 0) < cost) {
      toast(`Insufficient Dark Shards! Need ${cost} Shards. Opening shop...`, 'warning');
      setIsShardsShopOpen(true);
      return;
    }

    setIsProcessing(true);
    try {
      const res = await buySubscription(tier, durationDays);
      if (res.success) {
        toast(res.message, 'success');
        audioSystem.playVictory();
      } else {
        toast(res.message, 'error');
      }
    } catch (e: any) {
      toast(e.message || 'Subscription activation failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClaimDaily = async () => {
    audioSystem.playClick();
    if (!isSubActive) {
      toast('Activate Premium or Ultra to unlock daily tributes!', 'warning');
      return;
    }
    if (isDailyClaimed) {
      toast('You have already claimed today’s tribute! Resets at 00:00 UTC.', 'info');
      return;
    }

    setIsClaiming(true);
    try {
      const res = await claimDailySubscription();
      if (res.success) {
        toast(res.message, 'success');
        audioSystem.playVictory();
      } else {
        toast(res.message, 'error');
      }
    } catch (e: any) {
      toast(e.message || 'Failed to claim daily tribute', 'error');
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8 animate-fade-in text-white">
      
      {/* Header Banner */}
      <div className="text-center space-y-3 relative">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-amber-500/20 border border-amber-500/40 px-5 py-1.5 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.25)]">
          <Crown className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="font-display font-black text-amber-300 text-xs tracking-widest uppercase">
            IMPERIAL PRIVILEGES & REVENUE PASS
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-display font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-purple-300 filter drop-shadow-[0_2px_15px_rgba(245,158,11,0.4)]">
          VOID COVENANT MEMBERSHIP
        </h1>

        <p className="text-xs sm:text-sm text-gray-400 max-w-2xl mx-auto font-sans leading-relaxed">
          Unlock maximum PvP earnings, faster energy recharge, daily Peace Shields against offline attacks, and boosted Blood Sovereign rewards.
        </p>

        {/* Shards quick balance */}
        <div className="inline-flex items-center gap-2 bg-black/60 border border-purple-500/30 px-4 py-1.5 rounded-xl shadow-lg">
          <span className="text-xs text-gray-400 font-mono">Your Balance:</span>
          <img src="/icons/dark_shard.webp" alt="Shards" className="w-4 h-4 object-contain" />
          <span className="font-mono font-black text-sm text-purple-300">{profile.darkShards || 0}</span>
          <button 
            onClick={() => setIsShardsShopOpen(true)}
            className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 ml-1 underline cursor-pointer"
          >
            + Get Shards
          </button>
        </div>
      </div>

      {/* Active Subscription Status Banner */}
      <div className={`rounded-3xl p-5 sm:p-6 border relative overflow-hidden transition-all ${
        activeTier === 'ultra'
          ? 'bg-gradient-to-r from-purple-950/60 via-black to-red-950/60 border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.25)]'
          : activeTier === 'premium'
          ? 'bg-gradient-to-r from-amber-950/60 via-black to-yellow-950/60 border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.2)]'
          : 'bg-[#141820]/90 border-white/10'
      }`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
              activeTier === 'ultra'
                ? 'bg-purple-900/40 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                : activeTier === 'premium'
                ? 'bg-amber-900/40 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                : 'bg-black/50 border-white/10'
            }`}>
              {activeTier === 'ultra' ? (
                <Flame className="w-8 h-8 text-purple-400 animate-pulse" />
              ) : activeTier === 'premium' ? (
                <Crown className="w-8 h-8 text-amber-400" />
              ) : (
                <ShieldAlert className="w-8 h-8 text-gray-500" />
              )}
            </div>

            <div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="font-display font-black text-lg tracking-wider">
                  {activeTier === 'ultra' 
                    ? 'ULTRA OVERLORD STATUS ACTIVE' 
                    : activeTier === 'premium' 
                    ? 'PREMIUM SOVEREIGN STATUS ACTIVE' 
                    : 'STANDARD LORD STATUS (FREE)'}
                </span>
                {isSubActive && (
                  <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 animate-pulse">
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 font-sans mt-0.5">
                {isSubActive ? (
                  <>Expires on <span className="text-white font-mono">{new Date(profile.subscriptionExpiresAt || 0).toLocaleDateString()}</span> ({remainingDays} days remaining)</>
                ) : (
                  <>Upgrade to Premium or Ultra to unlock maximum daily earnings and protection.</>
                )}
              </p>
            </div>
          </div>

          {/* Daily Tribute Claim Button */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleClaimDaily}
              disabled={isClaiming || !isSubActive || isDailyClaimed}
              className={`w-full md:w-auto px-6 py-3 rounded-2xl font-display font-black text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isDailyClaimed
                  ? 'bg-black/60 border border-white/15 text-gray-400 cursor-default'
                  : isSubActive
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 hover:from-emerald-500 hover:to-teal-400 text-black font-black shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95'
                  : 'bg-black/40 border border-white/10 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Gift className="w-4 h-4" />
              {isDailyClaimed 
                ? '✓ TRIBUTE CLAIMED TODAY' 
                : isSubActive 
                ? (isClaiming ? 'CLAIMING...' : 'CLAIM DAILY TRIBUTE') 
                : 'CLAIM DAILY TRIBUTE (LOCKED)'}
            </button>
          </div>
        </div>

        {/* What daily tribute includes */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-gray-400">
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400 font-bold">Daily Free Perks:</span>
            <span>
              {activeTier === 'ultra' 
                ? '+3,000 Gold • +400 Dust • 1x 6h Peace Shield' 
                : activeTier === 'premium' 
                ? '+1,000 Gold • +150 Dust • 1x 3h Peace Shield' 
                : 'Free tier does not receive daily pass stipends.'}
            </span>
          </div>
          <span className="text-[11px] text-gray-500">Resets daily at 00:00 UTC</span>
        </div>
      </div>

      {/* Duration Selector Tabs */}
      <div className="flex justify-center items-center gap-3 pt-2">
        <span className="text-xs font-mono text-gray-400 uppercase tracking-wider mr-2">Billing Duration:</span>
        <button
          onClick={() => { audioSystem.playClick(); setDurationDays(30); }}
          className={`px-5 py-2 rounded-xl font-display font-bold text-xs tracking-wider transition-all cursor-pointer ${
            durationDays === 30
              ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)] font-black'
              : 'bg-[#151a21] border border-white/10 text-gray-400 hover:text-white'
          }`}
        >
          30 DAYS
        </button>

        <button
          onClick={() => { audioSystem.playClick(); setDurationDays(90); }}
          className={`relative px-5 py-2 rounded-xl font-display font-bold text-xs tracking-wider transition-all cursor-pointer ${
            durationDays === 90
              ? 'bg-gradient-to-r from-purple-500 to-amber-500 text-black shadow-[0_0_20px_rgba(168,85,247,0.5)] font-black'
              : 'bg-[#151a21] border border-white/10 text-gray-400 hover:text-white'
          }`}
        >
          90 DAYS
          <span className="absolute -top-2.5 -right-2 bg-gradient-to-r from-red-500 to-amber-500 text-white font-mono text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-md animate-bounce">
            SAVE 15%
          </span>
        </button>
      </div>

      {/* Side-by-Side Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        
        {/* PREMIUM CARD */}
        <div className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between border-2 transition-all relative overflow-hidden ${
          activeTier === 'premium'
            ? 'bg-gradient-to-b from-[#1c1813] via-[#12151c] to-[#0c0e12] border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.3)]'
            : 'bg-[#12151c] border-amber-500/30 hover:border-amber-500/60 shadow-xl'
        }`}>
          {/* Subtle Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400" />
                  <h3 className="font-display font-black text-2xl text-amber-300 tracking-wider">
                    PREMIUM PASS
                  </h3>
                </div>
                <p className="text-xs text-gray-400 font-sans mt-1">
                  The Sovereign standard. Crucial for competitive lords.
                </p>
              </div>

              {activeTier === 'premium' && (
                <span className="text-[10px] font-mono font-black px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-400 text-amber-300">
                  CURRENT TIER
                </span>
              )}
            </div>

            {/* Price Box */}
            <div className="bg-black/50 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Duration Price</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <img src="/icons/dark_shard.webp" alt="Shards" className="w-6 h-6 object-contain" />
                  <span className="font-mono font-black text-3xl text-amber-300">
                    {PRICES.premium[durationDays]}
                  </span>
                  <span className="font-mono text-xs text-amber-400/80">SHARDS</span>
                </div>
              </div>
              <span className="text-xs font-mono text-gray-400">
                {durationDays} Days Access
              </span>
            </div>

            {/* Perks List */}
            <div className="space-y-3 font-sans text-xs">
              <span className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider block border-b border-white/10 pb-2">
                Included Privileges:
              </span>

              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">8 PvP Tickets / Day</strong> (+60% more tickets to climb ranks)</span>
              </div>

              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-emerald-300">+1 Blood Sovereign / PvP Win</strong> (up to 10 SOV daily)</span>
              </div>

              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong className="text-amber-300">+15% League Rollover Sovereigns</strong> at season end</span>
              </div>

              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong className="text-cyan-300">1x 3-Hour Peace Shield</strong> granted daily (protects from attacks)</span>
              </div>

              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">10 PvE Energy</strong> (1 energy per 30 minutes)</span>
              </div>

              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                <span><strong className="text-yellow-300">+25% Gold Drop</strong> from all battles & campaign</span>
              </div>

              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Daily Stipend:</strong> +1,000 Gold & +150 Dust</span>
              </div>

              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Bank Payout Limit:</strong> Lowered to 2,500 SOV ($25)</span>
              </div>

              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong className="text-amber-300">Golden Name & ⚜️ Badge</strong> on leaderboards</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={() => handleBuy('premium')}
              disabled={isProcessing}
              className="w-full py-3.5 rounded-2xl font-display font-black text-sm tracking-wider uppercase bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:scale-[1.02] active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Crown className="w-4 h-4" />
              {activeTier === 'premium' ? `EXTEND PREMIUM (${durationDays}d)` : `ACTIVATE PREMIUM (${durationDays}d)`}
            </button>
          </div>
        </div>

        {/* ULTRA CARD */}
        <div className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between border-2 transition-all relative overflow-hidden ${
          activeTier === 'ultra'
            ? 'bg-gradient-to-b from-[#211224] via-[#15121f] to-[#0c0a14] border-purple-400 shadow-[0_0_35px_rgba(168,85,247,0.4)]'
            : 'bg-gradient-to-b from-[#1b1220] to-[#0f0e18] border-purple-500/40 hover:border-purple-400 shadow-2xl'
        }`}>
          {/* Intense Void Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Flame className="w-6 h-6 text-purple-400 animate-pulse" />
                  <h3 className="font-display font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-rose-300 to-amber-300 tracking-wider">
                    ULTRA OVERLORD
                  </h3>
                </div>
                <p className="text-xs text-gray-400 font-sans mt-1">
                  Apex dominance. Highest cashout limits & double speed.
                </p>
              </div>

              <span className="text-[10px] font-mono font-black px-2.5 py-1 rounded-full bg-purple-950/90 border border-purple-400 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                {activeTier === 'ultra' ? 'CURRENT TIER' : 'SUPREME'}
              </span>
            </div>

            {/* Price Box */}
            <div className="bg-black/60 border border-purple-500/30 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Duration Price</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <img src="/icons/dark_shard.webp" alt="Shards" className="w-6 h-6 object-contain" />
                  <span className="font-mono font-black text-3xl text-purple-300 text-shadow-glow">
                    {PRICES.ultra[durationDays]}
                  </span>
                  <span className="font-mono text-xs text-purple-400">SHARDS</span>
                </div>
              </div>
              <span className="text-xs font-mono text-gray-400">
                {durationDays} Days Supreme Access
              </span>
            </div>

            {/* Perks List */}
            <div className="space-y-3 font-sans text-xs">
              <span className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider block border-b border-white/10 pb-2">
                All Premium Perks PLUS:
              </span>

              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span><strong className="text-purple-300">12 PvP Tickets / Day</strong> (+140% tickets — maximum league LP!)</span>
              </div>

              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-emerald-300">+2 Blood Sovereigns / PvP Win</strong> (up to 24 SOV daily!)</span>
              </div>

              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong className="text-amber-300">+25% League Rollover Sovereigns</strong> (highest seasonal payout!)</span>
              </div>

              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong className="text-cyan-300">1x 6-Hour Peace Shield</strong> granted daily (long immunity!)</span>
              </div>

              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">20 PvE Energy</strong> (1 energy per 20 min — 2x faster regen!)</span>
              </div>

              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                <span><strong className="text-yellow-300">+50% Gold Drop</strong> from all battles & campaign</span>
              </div>

              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Daily Stipend:</strong> +3,000 Gold & +400 Dust</span>
              </div>

              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-emerald-300">Lowest Bank Payout Limit: 2,000 SOV</strong> ($20)</span>
              </div>

              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span><strong className="text-rose-300">Animated Void Frame & 👑 Royal Crown</strong> icon</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={() => handleBuy('ultra')}
              disabled={isProcessing}
              className="w-full py-3.5 rounded-2xl font-display font-black text-sm tracking-wider uppercase bg-gradient-to-r from-purple-600 via-rose-500 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-black shadow-[0_0_25px_rgba(168,85,247,0.5)] hover:scale-[1.02] active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Flame className="w-4 h-4" />
              {activeTier === 'ultra' ? `EXTEND ULTRA (${durationDays}d)` : `ASCEND TO ULTRA (${durationDays}d)`}
            </button>
          </div>
        </div>

      </div>

      {/* Info footer */}
      <div className="bg-[#12161f] border border-white/5 rounded-2xl p-4 flex items-center gap-3 text-xs text-gray-400 font-sans">
        <Info className="w-5 h-5 text-amber-400 shrink-0" />
        <p>
          Subscriptions stack seamlessly. Re-purchasing the same tier extends your remaining duration. Blood Sovereigns earned from PvP wins are credited directly to your bank account balance and can be withdrawn as real USDT on Solana.
        </p>
      </div>

    </div>
  );
};
