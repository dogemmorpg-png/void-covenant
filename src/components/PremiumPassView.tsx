import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useToast } from './Toast';
import { audioSystem } from '../utils/AudioSystem';
import { 
  Crown, 
  Sparkles, 
  Gift, 
  Flame, 
  Shield, 
  Zap, 
  Coins, 
  Clock,
  Swords,
  Gem,
  Award,
  Info
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8 animate-fade-in text-white font-sans">
      
      {/* Top Hero Showcase Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-[#c5a880]/25 bg-gradient-to-b from-[#18131e] via-[#0d0a14] to-[#060408] p-6 sm:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
        {/* Background Atmosphere Lights */}
        <div className="absolute -top-24 -left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-20 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />

        <div className="relative z-10 text-center sm:text-left space-y-2.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[11px] font-bold tracking-widest uppercase">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            Imperial Privileges & Pass
          </div>
          
          <h1 className="text-2xl sm:text-4xl font-display font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 drop-shadow-[0_2px_12px_rgba(245,158,11,0.3)] uppercase">
            Void Covenant Pass
          </h1>
          
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-sans">
            Elevate your dominion over the Abyss: amplified PvP ticket pools, guaranteed Blood Sovereigns on battle wins, doubled energy regeneration rates, and daily Peace Shields.
          </p>
        </div>

        {/* Current Active Subscription Status / Daily Tribute Claim */}
        <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
          <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            activeTier === 'ultra'
              ? 'bg-gradient-to-r from-purple-950/70 via-black/80 to-purple-950/70 border-purple-400/50 shadow-[0_0_25px_rgba(168,85,247,0.2)]'
              : activeTier === 'premium'
              ? 'bg-gradient-to-r from-amber-950/70 via-black/80 to-amber-950/70 border-amber-400/50 shadow-[0_0_25px_rgba(245,158,11,0.2)]'
              : 'bg-black/50 border-white/10'
          }`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 text-center md:text-left">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                  activeTier === 'ultra'
                    ? 'bg-purple-900/60 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                    : activeTier === 'premium'
                    ? 'bg-amber-900/60 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                    : 'bg-white/5 border-white/10'
                }`}>
                  {activeTier === 'ultra' ? (
                    <span className="text-xl">💎</span>
                  ) : activeTier === 'premium' ? (
                    <span className="text-xl">⚜️</span>
                  ) : (
                    <Shield className="w-5 h-5 text-gray-500" />
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <span className="font-display font-black text-sm sm:text-base tracking-wider uppercase">
                      {activeTier === 'ultra' 
                        ? 'Ultra Overlord Pass' 
                        : activeTier === 'premium' 
                        ? 'Premium Sovereign Pass' 
                        : 'Standard Lord (Free Tier)'}
                    </span>
                    {isSubActive ? (
                      <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/60 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-gray-500 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                        INACTIVE
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 font-sans mt-0.5">
                    {isSubActive ? (
                      <span>Valid until <strong className="text-gray-200 font-mono">{new Date(profile.subscriptionExpiresAt || 0).toLocaleDateString()}</strong> ({remainingDays} days remaining)</span>
                    ) : (
                      <span>Activate Premium or Ultra to maximize battle revenue and protection</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Daily Claim Button & Stipend */}
              <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full md:w-auto">
                {isSubActive && (
                  <div className="text-center md:text-right text-[11px] font-mono text-gray-300">
                    <span className="text-amber-400 font-bold block mb-1">Daily Tribute:</span>
                    <div className="inline-flex items-center gap-2 bg-black/50 px-2.5 py-1 rounded-lg border border-white/10">
                      {/* Gold */}
                      <span className="inline-flex items-center gap-1 font-bold text-amber-300">
                        +{activeTier === 'ultra' ? '3,000' : '1,000'}
                        <img src="/icons/icon_gold.webp" alt="Gold" className="w-3.5 h-3.5 object-contain" />
                      </span>
                      <span className="text-gray-600">•</span>
                      {/* Dust */}
                      <span className="inline-flex items-center gap-1 font-bold text-cyan-300">
                        +{activeTier === 'ultra' ? '400' : '150'}
                        <img src="/icons/icon_dust.webp" alt="Dust" className="w-4 h-4 object-contain" />
                      </span>
                      <span className="text-gray-600">•</span>
                      {/* Shield */}
                      <span className="inline-flex items-center gap-1 font-bold text-gray-200">
                        1x {activeTier === 'ultra' ? '6h' : '3h'}
                        <img 
                          src={activeTier === 'ultra' ? '/icons/shield_6h.png' : '/icons/shield_3h.png'} 
                          alt="Shield" 
                          className="w-3.5 h-3.5 object-contain drop-shadow-[0_0_4px_rgba(6,182,212,0.6)]" 
                        />
                      </span>
                    </div>
                  </div>
                )}
                <button
                  onClick={handleClaimDaily}
                  disabled={isClaiming || !isSubActive || isDailyClaimed}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isDailyClaimed
                      ? 'bg-black/60 border border-white/10 text-gray-500 cursor-default'
                      : isSubActive
                      ? 'bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 hover:from-emerald-500 hover:to-teal-400 text-black font-black shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95'
                      : 'bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Gift className="w-4 h-4" />
                  {isDailyClaimed 
                    ? '✓ Tribute Claimed' 
                    : isSubActive 
                    ? (isClaiming ? 'Claiming...' : 'Claim Tribute') 
                    : 'Tribute Locked'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Duration Selector Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Access Duration:</span>
        <div className="flex items-center p-1 rounded-2xl bg-black/60 border border-white/10">
          <button
            onClick={() => { audioSystem.playClick(); setDurationDays(30); }}
            className={`px-6 py-2 rounded-xl font-display font-bold text-xs tracking-wider transition-all cursor-pointer ${
              durationDays === 30
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)] font-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            30 DAYS
          </button>

          <button
            onClick={() => { audioSystem.playClick(); setDurationDays(90); }}
            className={`relative px-6 py-2 rounded-xl font-display font-bold text-xs tracking-wider transition-all cursor-pointer ${
              durationDays === 90
                ? 'bg-gradient-to-r from-purple-500 to-amber-500 text-black shadow-[0_0_20px_rgba(168,85,247,0.4)] font-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            90 DAYS
            <span className="absolute -top-2.5 -right-2 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-mono text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-md">
              -15% OFF
            </span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Premium & Ultra Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 pt-2">
        
        {/* PREMIUM PASS CARD */}
        <div className={`rounded-3xl border-2 transition-all flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-[#17141b] via-[#0f0d14] to-[#070609] ${
          activeTier === 'premium'
            ? 'border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.35)]'
            : 'border-amber-500/30 hover:border-amber-500/60 shadow-[0_8px_30px_rgba(0,0,0,0.7)]'
        }`}>
          {/* Header Banner Artwork */}
          <div className="relative h-44 w-full overflow-hidden border-b border-amber-500/20">
            <img 
              src="/pass_premium_crest.jpg" 
              alt="Premium Crest" 
              className="w-full h-full object-cover object-center opacity-85 transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0d14] via-[#0f0d14]/40 to-transparent" />
            
            {/* Tier Badge Header Overlay */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-amber-500/40 text-amber-300 font-display font-black text-xs tracking-wider uppercase">
                <span>⚜️</span>
                <span>SOVEREIGN TIER</span>
              </div>
              {activeTier === 'premium' && (
                <span className="text-[10px] font-mono font-black px-2.5 py-1 rounded-full bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.6)]">
                  YOUR ACTIVE PLAN
                </span>
              )}
            </div>

            {/* Title & Slogan */}
            <div className="absolute bottom-3 left-5 right-5">
              <h2 className="font-display font-black text-2xl sm:text-3xl text-amber-300 tracking-wider flex items-center gap-2">
                PREMIUM PASS
              </h2>
              <p className="text-[11px] text-gray-300 font-sans">
                The Sovereign standard. Essential for competitive Arena climbers.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-6">
            
            {/* Price Box */}
            <div className="bg-black/60 border border-amber-500/25 rounded-2xl p-4 flex items-center justify-between shadow-inner">
              <div>
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Access Cost ({durationDays} Days)</span>
                <div className="flex items-center gap-2 mt-1">
                  <img src="/icons/icon_shards.webp" alt="Shards" className="w-6 h-6 object-contain drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
                  <span className="font-display font-black text-3xl text-amber-300">
                    {PRICES.premium[durationDays]}
                  </span>
                  <span className="font-mono text-xs text-amber-400/80 font-bold">SHARDS</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-mono text-gray-400 block">
                  {durationDays === 30 ? '5 Shards / day' : '4.4 Shards / day'}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                  {durationDays === 90 ? 'Save 50 Shards' : 'Standard Rate'}
                </span>
              </div>
            </div>

            {/* Perks Detailed Grid */}
            <div className="space-y-3 font-sans text-xs">
              <span className="text-[11px] font-mono font-bold text-amber-400/80 uppercase tracking-widest block border-b border-amber-500/20 pb-2">
                Included Privileges:
              </span>

              {/* PvP Tickets */}
              <div className="flex items-start gap-3 p-2 rounded-xl hover:bg-white/[0.02] transition-colors">
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Swords className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs">8 Daily PvP Tickets</div>
                  <div className="text-[11px] text-gray-400">+60% more tickets (up from 5) to accelerate league ranking points</div>
                </div>
              </div>

              {/* Blood Sovereigns */}
              <div className="flex items-start gap-3 p-2 rounded-xl hover:bg-white/[0.02] transition-colors">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Coins className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div>
                  <div className="font-bold text-emerald-300 text-xs">+1 Blood Sovereign per PvP Win</div>
                  <div className="text-[11px] text-gray-400">Claim up to 10 SOV bounty daily from victorious arena battles</div>
                </div>
              </div>

              {/* Gold Boost */}
              <div className="flex items-start gap-3 p-2 rounded-xl hover:bg-white/[0.02] transition-colors">
                <div className="w-7 h-7 rounded-lg bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                </div>
                <div>
                  <div className="font-bold text-yellow-300 text-xs">+25% Gold Drop from All Battles</div>
                  <div className="text-[11px] text-gray-400">Permanent bonus gold awarded across Campaign floors and PvP encounters</div>
                </div>
              </div>

              {/* Energy */}
              <div className="flex items-start gap-3 p-2 rounded-xl hover:bg-white/[0.02] transition-colors">
                <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <div>
                  <div className="font-bold text-purple-200 text-xs">10 Max Energy (1 per 30 min)</div>
                  <div className="text-[11px] text-gray-400">Doubled maximum energy capacity with 25% faster regeneration rate</div>
                </div>
              </div>

              {/* Peace Shield */}
              <div className="flex items-start gap-3 p-2 rounded-xl hover:bg-white/[0.02] transition-colors">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div>
                  <div className="font-bold text-cyan-300 text-xs">Daily 3-Hour Peace Shield</div>
                  <div className="text-[11px] text-gray-400">Complimentary Aegis shield to protect rank rating against offline raids</div>
                </div>
              </div>

              {/* Bank limit & Badge */}
              <div className="flex items-start gap-3 p-2 rounded-xl hover:bg-white/[0.02] transition-colors">
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div>
                  <div className="font-bold text-amber-300 text-xs">Golden Name, ⚜️ Crest & 2,500 SOV Payout</div>
                  <div className="text-[11px] text-gray-400">Reduced cashout threshold ($25) and distinct leaderboard prestige</div>
                </div>
              </div>
            </div>

            {/* Buy / Extend CTA Button */}
            <div className="pt-2">
              <button
                onClick={() => handleBuy('premium')}
                disabled={isProcessing}
                className="w-full py-4 rounded-2xl font-display font-black text-sm tracking-widest uppercase bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-black shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:shadow-[0_0_35px_rgba(245,158,11,0.6)] hover:scale-[1.02] active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Crown className="w-4 h-4" />
                {activeTier === 'premium' ? `EXTEND PREMIUM (${durationDays}d)` : `ACTIVATE PREMIUM (${durationDays}d)`}
              </button>
            </div>

          </div>
        </div>

        {/* ULTRA OVERLORD PASS CARD */}
        <div className={`rounded-3xl border-2 transition-all flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-[#1b1122] via-[#100a16] to-[#07040b] ${
          activeTier === 'ultra'
            ? 'border-purple-400 shadow-[0_0_40px_rgba(168,85,247,0.45)]'
            : 'border-purple-500/40 hover:border-purple-400 shadow-[0_8px_30px_rgba(0,0,0,0.8)]'
        }`}>
          {/* Header Banner Artwork */}
          <div className="relative h-44 w-full overflow-hidden border-b border-purple-500/30">
            <img 
              src="/pass_ultra_crest.jpg" 
              alt="Ultra Crest" 
              className="w-full h-full object-cover object-center opacity-85 transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#100a16] via-[#100a16]/40 to-transparent" />
            
            {/* Tier Badge Header Overlay */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-purple-400/50 text-purple-300 font-display font-black text-xs tracking-wider uppercase shadow-[0_0_12px_rgba(168,85,247,0.5)]">
                <span>💎</span>
                <span>APEX OVERLORD TIER</span>
              </div>
              {activeTier === 'ultra' ? (
                <span className="text-[10px] font-mono font-black px-2.5 py-1 rounded-full bg-purple-500 text-black shadow-[0_0_15px_rgba(168,85,247,0.7)]">
                  YOUR ACTIVE PLAN
                </span>
              ) : (
                <span className="text-[10px] font-mono font-black px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-500 to-rose-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]">
                  MAX VALUE
                </span>
              )}
            </div>

            {/* Title & Slogan */}
            <div className="absolute bottom-3 left-5 right-5">
              <h2 className="font-display font-black text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-rose-200 to-amber-200 tracking-wider flex items-center gap-2">
                ULTRA OVERLORD
              </h2>
              <p className="text-[11px] text-purple-200/80 font-sans">
                Apex dominance: greatest Sovereign harvest and fastest progression velocity.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-6">
            
            {/* Price Box */}
            <div className="bg-black/60 border border-purple-500/30 rounded-2xl p-4 flex items-center justify-between shadow-inner">
              <div>
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Access Cost ({durationDays} Days)</span>
                <div className="flex items-center gap-2 mt-1">
                  <img src="/icons/icon_shards.webp" alt="Shards" className="w-6 h-6 object-contain drop-shadow-[0_0_8px_rgba(168,85,247,0.7)]" />
                  <span className="font-display font-black text-3xl text-purple-300">
                    {PRICES.ultra[durationDays]}
                  </span>
                  <span className="font-mono text-xs text-purple-400 font-bold">SHARDS</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-mono text-gray-400 block">
                  {durationDays === 30 ? '11.6 Shards / day' : '10 Shards / day'}
                </span>
                <span className="text-[10px] font-mono text-purple-300 font-bold">
                  {durationDays === 90 ? 'Save 150 Shards' : 'Supreme Status'}
                </span>
              </div>
            </div>

            {/* Perks Detailed Grid */}
            <div className="space-y-3 font-sans text-xs">
              <span className="text-[11px] font-mono font-bold text-purple-400/90 uppercase tracking-widest block border-b border-purple-500/25 pb-2">
                All Premium Privileges PLUS:
              </span>

              {/* PvP Tickets */}
              <div className="flex items-start gap-3 p-2 rounded-xl hover:bg-white/[0.02] transition-colors">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-400/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Swords className="w-3.5 h-3.5 text-purple-300" />
                </div>
                <div>
                  <div className="font-bold text-purple-200 text-xs">12 Daily PvP Tickets</div>
                  <div className="text-[11px] text-gray-400">+140% tickets (up from 5) — commanding reach for top seasonal brackets</div>
                </div>
              </div>

              {/* Blood Sovereigns */}
              <div className="flex items-start gap-3 p-2 rounded-xl hover:bg-white/[0.02] transition-colors">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Coins className="w-3.5 h-3.5 text-emerald-300" />
                </div>
                <div>
                  <div className="font-bold text-emerald-300 text-xs">+2 Blood Sovereigns per PvP Win</div>
                  <div className="text-[11px] text-gray-400">Maximum daily cap of 24 SOV (2.4x higher earnings than Premium)</div>
                </div>
              </div>

              {/* Gold Boost */}
              <div className="flex items-start gap-3 p-2 rounded-xl hover:bg-white/[0.02] transition-colors">
                <div className="w-7 h-7 rounded-lg bg-yellow-500/20 border border-yellow-400/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="w-3.5 h-3.5 text-yellow-300" />
                </div>
                <div>
                  <div className="font-bold text-yellow-300 text-xs">+50% Gold Drop from All Battles</div>
                  <div className="text-[11px] text-gray-400">Supreme gold multiplication multiplier across Campaign and Arena</div>
                </div>
              </div>

              {/* Energy */}
              <div className="flex items-start gap-3 p-2 rounded-xl hover:bg-white/[0.02] transition-colors">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-400/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-purple-300" />
                </div>
                <div>
                  <div className="font-bold text-purple-200 text-xs">20 Max Energy (1 per 20 min)</div>
                  <div className="text-[11px] text-gray-400">Quadrupled capacity with 2x faster regeneration speed</div>
                </div>
              </div>

              {/* Peace Shield */}
              <div className="flex items-start gap-3 p-2 rounded-xl hover:bg-white/[0.02] transition-colors">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Shield className="w-3.5 h-3.5 text-cyan-300" />
                </div>
                <div>
                  <div className="font-bold text-cyan-300 text-xs">Daily 6-Hour Peace Shield</div>
                  <div className="text-[11px] text-gray-400">Fortified immunity against ladder attacks while resting</div>
                </div>
              </div>

              {/* Bank limit & Badge */}
              <div className="flex items-start gap-3 p-2 rounded-xl hover:bg-white/[0.02] transition-colors">
                <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-400/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Gem className="w-3.5 h-3.5 text-rose-300" />
                </div>
                <div>
                  <div className="font-bold text-rose-300 text-xs">Purple Glow, 💎 Crystal & 2,000 SOV Payout</div>
                  <div className="text-[11px] text-gray-400">Lowest payout limit ($20) and prominent Apex Overlord distinction</div>
                </div>
              </div>
            </div>

            {/* Buy / Extend CTA Button */}
            <div className="pt-2">
              <button
                onClick={() => handleBuy('ultra')}
                disabled={isProcessing}
                className="w-full py-4 rounded-2xl font-display font-black text-sm tracking-widest uppercase bg-gradient-to-r from-purple-600 via-rose-500 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-black shadow-[0_0_25px_rgba(168,85,247,0.45)] hover:shadow-[0_0_35px_rgba(168,85,247,0.7)] hover:scale-[1.02] active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Flame className="w-4 h-4" />
                {activeTier === 'ultra' ? `EXTEND ULTRA (${durationDays}d)` : `ASCEND TO ULTRA (${durationDays}d)`}
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Trust & Mechanics Footer */}
      <div className="bg-black/50 border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 text-xs text-gray-400">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
          <Info className="w-5 h-5 text-amber-400" />
        </div>
        <div className="space-y-1 text-center sm:text-left">
          <div className="font-display font-bold text-gray-300 text-xs uppercase tracking-wider">
            Duration Stacking & Balance Security
          </div>
          <p className="font-sans leading-relaxed text-[11px]">
            Subscriptions stack seamlessly: re-purchasing the same tier adds the full duration to your remaining days. All Blood Sovereigns earned from PvP victories are credited directly to your bank balance and can be withdrawn as real USDT on Solana.
          </p>
        </div>
      </div>

    </div>
  );
};


