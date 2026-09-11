import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useToast } from './Toast';
import { 
  Crown, 
  Gift, 
  Flame, 
  Shield, 
  Info,
  Sparkles,
  Zap
} from 'lucide-react';

export const PremiumPassView: React.FC = () => {
  const { profile, buySubscription, setIsShardsShopOpen } = useGame();
  const toast = useToast();

  const [durationDays, setDurationDays] = useState<30 | 90>(30);
  const [isProcessing, setIsProcessing] = useState(false);
  const [awardedBonusItems, setAwardedBonusItems] = useState<any[] | null>(null);

  const isSubActive = !!(profile.subscriptionExpiresAt && profile.subscriptionExpiresAt > Date.now());
  const activeTier = isSubActive ? (profile.subscriptionTier || 'free') : 'free';
  const remainingDays = isSubActive 
    ? Math.max(1, Math.ceil(((profile.subscriptionExpiresAt || 0) - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

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
    const cost = PRICES[tier][durationDays];

    if ((profile.darkShards || 0) < cost) {
      toast(`Insufficient Dark Shards! Need ${cost} Shards. Opening shop...`, 'warning');
      setIsShardsShopOpen(true);
      return;
    }

    setIsProcessing(true);
    try {
      const res = await buySubscription(tier, durationDays) as any;
      if (res.success) {
        toast(res.message, 'success');
        if (res.bonusEquipments && res.bonusEquipments.length > 0) {
          setAwardedBonusItems(res.bonusEquipments);
        }
      } else {
        toast(res.message, 'error');
      }
    } catch (e: any) {
      toast(e.message || 'Subscription activation failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8 animate-fade-in text-white font-sans">
      
      {/* Top Hero Showcase Banner */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-[#c5a880]/30 bg-gradient-to-b from-[#1c1524] via-[#100b17] to-[#08050c] p-6 sm:p-9 shadow-[0_12px_45px_rgba(0,0,0,0.85)]">
        {/* Background Atmospheric Glows & Vignette */}
        <div className="absolute -top-28 -left-24 w-[28rem] h-[28rem] bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-28 -right-24 w-[28rem] h-[28rem] bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.7)_100%)] pointer-events-none" />
        
        {/* Ornate Gold Border Accent Lines */}
        <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-4 max-w-2xl text-left">
            {/* Badge Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/15 to-purple-500/15 border border-amber-500/35 text-amber-300 font-mono text-[11px] font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(245,158,11,0.15)]">
              <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Imperial Privileges & Covenant Pass</span>
            </div>
            
            {/* Title with Grand Gothic typography */}
            <div className="space-y-1.5">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 drop-shadow-[0_2px_14px_rgba(245,158,11,0.4)] uppercase">
                Void Covenant Pass
              </h1>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans max-w-xl">
                Elevate your dominion over the Abyss with expanded daily PvP tickets, guaranteed Blood Sovereigns on arena victories, daily Peace Shields, and accelerated energy recovery.
              </p>
            </div>

            {/* Value Highlights Feature Chips */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/60 border border-amber-500/35 text-xs sm:text-[13px] font-mono font-bold text-amber-300 shadow-inner">
                <img src="/icons/league_grandmaster_crest.png" alt="Leaderboard" className="w-5 h-5 object-contain drop-shadow-[0_0_6px_rgba(245,158,11,0.8)] shrink-0" />
                <span>+15% to +25% Leaderboard Rewards</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/60 border border-emerald-500/35 text-xs sm:text-[13px] font-mono font-bold text-emerald-300 shadow-inner">
                <img src="/icons/icon_sovereign.webp" alt="SOV" className="w-4.5 h-4.5 object-contain drop-shadow-[0_0_6px_rgba(239,68,68,0.7)] shrink-0" />
                <span>Up to 24 SOV/Day on Arena Wins</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/60 border border-cyan-500/35 text-xs sm:text-[13px] font-mono font-bold text-cyan-300 shadow-inner">
                <img src="/icons/shield_3h.png" alt="Peace Shield" className="w-5 h-5 object-contain drop-shadow-[0_0_6px_rgba(6,182,212,0.8)] shrink-0" />
                <span>Daily Peace Shield</span>
              </div>
            </div>
          </div>

          {/* Active / Inactive Subscription Status Plaque */}
          {isSubActive ? (
            <div className="shrink-0 flex flex-col items-start lg:items-end justify-center gap-2 p-4 rounded-2xl bg-gradient-to-b from-[#1f1627] to-[#0c0812] border-2 border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.2)] backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="text-xl">{activeTier === 'ultra' ? '💎' : '⚜️'}</span>
                <span className="font-display font-black text-sm sm:text-base tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400">
                  {activeTier === 'ultra' ? 'Ultra Overlord' : 'Premium Pass'}
                </span>
                <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/60 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]">
                  ACTIVE
                </span>
              </div>
              <div className="text-xs font-mono text-gray-300 flex items-center gap-1.5">
                <span className="text-amber-400 font-bold">{remainingDays} days remaining</span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-400">until {new Date(profile.subscriptionExpiresAt || 0).toLocaleDateString()}</span>
              </div>
            </div>
          ) : (
            <div className="shrink-0 flex flex-col items-start lg:items-end justify-center gap-1.5 p-4 rounded-2xl bg-gradient-to-b from-[#16121a]/90 to-[#0a070e]/90 border border-white/10 shadow-lg backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="text-base text-gray-400">🛡️</span>
                <span className="font-display font-bold text-xs sm:text-sm tracking-wider uppercase text-gray-300">
                  Standard Lord
                </span>
                <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-zinc-850/80 border border-zinc-700 text-zinc-400">
                  INACTIVE
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-sans max-w-[220px] text-left lg:text-right leading-tight">
                Select a tier below to activate imperial privileges & bonuses
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Duration Selector Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Access Duration:</span>
        <div className="flex items-center p-1 rounded-2xl bg-black/60 border border-white/10">
          <button
            onClick={() => setDurationDays(30)}
            className={`px-6 py-2 rounded-xl font-display font-bold text-xs tracking-wider transition-all cursor-pointer ${
              durationDays === 30
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)] font-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            30 DAYS
          </button>

          <button
            onClick={() => setDurationDays(90)}
            className={`relative px-6 py-2 rounded-xl font-display font-bold text-xs tracking-wider transition-all cursor-pointer ${
              durationDays === 90
                ? 'bg-gradient-to-r from-purple-500 to-amber-500 text-black shadow-[0_0_20px_rgba(168,85,247,0.4)] font-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            90 DAYS
            <span className="absolute -top-2.5 -right-2 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-mono text-[9px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
              <span>-15% OFF</span>
              <span>•</span>
              <span>👑 DIVINE BONUS</span>
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
                <span>PREMIUM TIER</span>
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
                The gold standard. Essential for competitive Arena climbers.
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
                  <span className="font-mono text-xs text-amber-400/80 font-bold">DARK SHARDS</span>
                </div>
              </div>
            </div>

            {/* 90-Day Exclusive Covenant Bonus Banner */}
            {durationDays === 90 && (
              <div className="relative overflow-hidden p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/80 via-[#241306] to-black border-2 border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.25)] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center shrink-0 text-xl shadow-[0_0_12px_rgba(245,158,11,0.4)]">
                  🎁
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider text-amber-400">
                      90-Day Covenant Bonus
                    </span>
                    <span className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded bg-rose-500/30 text-rose-300 border border-rose-500/50">
                      DIVINE
                    </span>
                  </div>
                  <div className="text-xs font-display font-black text-white mt-0.5 truncate">
                    +1 Random Divine Demiurge Relic
                  </div>
                  <div className="text-[10px] text-amber-200/70 font-sans">
                    Forged directly into your Armory upon activation
                  </div>
                </div>
              </div>
            )}

            {/* Perks Detailed Grid */}
            <div className="space-y-3 font-sans">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block border-b border-amber-500/20 pb-2">
                Included Privileges (9 Perks):
              </span>

              {/* 1. PvP Tickets */}
              <div className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-white/[0.03] transition-colors">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                  <img src="/icons/ticket_variant_3_gold.png" alt="PvP Tickets" className="w-5 h-5 object-contain drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm sm:text-[15px] leading-snug">8 PvP Tickets / Day</div>
                  <div className="text-xs text-gray-300 mt-0.5">+60% more tickets to climb ranks</div>
                </div>
              </div>

              {/* 2. Blood Sovereigns */}
              <div className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-white/[0.03] transition-colors">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                  <img src="/icons/icon_sovereign.webp" alt="Blood Sovereign" className="w-5 h-5 object-contain drop-shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
                </div>
                <div>
                  <div className="font-bold text-emerald-300 text-sm sm:text-[15px] leading-snug">+1 Blood Sovereign / PvP Win</div>
                  <div className="text-xs text-gray-300 mt-0.5">Up to 10 SOV daily bounty from arena victories</div>
                </div>
              </div>

              {/* 3. Seasonal Leaderboard Bonus */}
              <div className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-white/[0.03] transition-colors">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                  <img src="/icons/league_grandmaster_crest.png" alt="Seasonal Rewards" className="w-5 h-5 object-contain drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
                </div>
                <div>
                  <div className="font-bold text-amber-300 text-sm sm:text-[15px] leading-snug">+15% Season Leaderboard Rewards</div>
                  <div className="text-xs text-gray-300 mt-0.5">Bonus Blood Sovereigns on daily & seasonal leaderboard payouts</div>
                </div>
              </div>

              {/* 4. Peace Shield */}
              <div className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-white/[0.03] transition-colors">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                  <img src="/icons/shield_3h.png" alt="Peace Shield" className="w-5 h-5 object-contain drop-shadow-[0_0_6px_rgba(6,182,212,0.6)]" />
                </div>
                <div>
                  <div className="font-bold text-cyan-300 text-sm sm:text-[15px] leading-snug">1x 3-Hour Peace Shield</div>
                  <div className="text-xs text-gray-300 mt-0.5">Granted daily to protect from attacks while offline</div>
                </div>
              </div>

              {/* 5. Energy */}
              <div className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-white/[0.03] transition-colors">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                  <img src="/icons/icon_energy.webp" alt="Energy" className="w-5 h-5 object-contain drop-shadow-[0_0_6px_rgba(168,85,247,0.6)]" />
                </div>
                <div>
                  <div className="font-bold text-purple-200 text-sm sm:text-[15px] leading-snug">10 PvE Energy (1 per 30 minutes)</div>
                  <div className="text-xs text-gray-300 mt-0.5">Doubled maximum energy capacity with 25% faster regeneration</div>
                </div>
              </div>

              {/* 6. Gold Boost */}
              <div className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-white/[0.03] transition-colors">
                <div className="w-9 h-9 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                  <img src="/icons/icon_gold.webp" alt="Gold Drop" className="w-5 h-5 object-contain drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
                </div>
                <div>
                  <div className="font-bold text-yellow-300 text-sm sm:text-[15px] leading-snug">+25% Gold Drop</div>
                  <div className="text-xs text-gray-300 mt-0.5">From all battles, campaign floors & encounters</div>
                </div>
              </div>

              {/* 7. Daily Stipend */}
              <div className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-white/[0.03] transition-colors">
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                  <img src="/icons/icon_dust.webp" alt="Daily Stipend" className="w-5 h-5 object-contain drop-shadow-[0_0_6px_rgba(20,184,166,0.6)]" />
                </div>
                <div>
                  <div className="font-bold text-teal-300 text-sm sm:text-[15px] leading-snug">Daily Stipend: +1,000 Gold & +150 Dust</div>
                  <div className="text-xs text-gray-300 mt-0.5">Delivered directly to your in-game Mailbox every day at 00:00 UTC</div>
                </div>
              </div>

              {/* 8. Bank Payout Limit */}
              <div className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-white/[0.03] transition-colors">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                  <img src="/icons/icon_sovereign.webp" alt="Bank Cashout" className="w-5 h-5 object-contain drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
                </div>
                <div>
                  <div className="font-bold text-amber-300 text-sm sm:text-[15px] leading-snug">Bank Payout Limit: Lowered to 2,500 SOV ($25)</div>
                  <div className="text-xs text-gray-300 mt-0.5">Reduced cashout threshold to real USDT on Solana</div>
                </div>
              </div>

              {/* 9. Visual Prestige */}
              <div className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-white/[0.03] transition-colors">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                  <img src="/icons/crown.png" alt="Prestige" className="w-5 h-5 object-contain drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
                </div>
                <div>
                  <div className="font-bold text-amber-300 text-sm sm:text-[15px] leading-snug">Golden Name & ⚜️ Badge</div>
                  <div className="text-xs text-gray-300 mt-0.5">Distinct visual flair and prestige on leaderboards</div>
                </div>
              </div>
            </div>

            {/* Buy / Extend CTA Button */}
            <div className="pt-2">
              <button
                onClick={() => handleBuy('premium')}
                disabled={isProcessing}
                className="w-full font-display font-black tracking-widest py-3.5 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-b from-[#261c10] via-[#150f08] to-[#090603] border-2 border-amber-500/50 hover:border-amber-400 text-amber-300 hover:text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:shadow-[0_0_25px_rgba(245,158,11,0.35)] select-none"
              >
                <img src="/icons/crown.png" alt="Crown" className="w-5 h-5 object-contain brightness-110 drop-shadow-[0_0_6px_rgba(245,158,11,0.7)] shrink-0" />
                <span className="text-xs sm:text-sm uppercase tracking-[0.14em] drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                  {activeTier === 'premium' ? `EXTEND PREMIUM (${durationDays}D)` : `ACTIVATE PREMIUM (${durationDays}D)`}
                </span>
                <span className="flex items-center gap-1.5 bg-black/60 border border-amber-500/40 rounded-full px-3 py-1 font-mono text-xs font-bold text-amber-300 shadow-inner ml-auto shrink-0">
                  <span>{PRICES.premium[durationDays]}</span>
                  <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain drop-shadow-[0_0_4px_rgba(245,158,11,0.6)]" />
                </span>
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
                Apex dominance: greatest reward yields and fastest progression velocity.
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
                  <span className="font-mono text-xs text-purple-400 font-bold">DARK SHARDS</span>
                </div>
              </div>
            </div>

            {/* 90-Day Supreme Covenant Bonus Banner */}
            {durationDays === 90 && (
              <div className="relative overflow-hidden p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/90 via-[#260f33] to-black border-2 border-purple-400/70 shadow-[0_0_25px_rgba(168,85,247,0.3)] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/25 border border-purple-300 flex items-center justify-center shrink-0 text-xl shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                  👑
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider text-purple-300">
                      90-Day Supreme Bonus
                    </span>
                    <span className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded bg-gradient-to-r from-rose-500/40 to-purple-500/40 text-rose-200 border border-rose-400/60">
                      2x DIVINE
                    </span>
                  </div>
                  <div className="text-xs font-display font-black text-amber-300 mt-0.5 truncate">
                    +2 Unique Divine Demiurge Relics
                  </div>
                  <div className="text-[10px] text-purple-200/70 font-sans">
                    Two distinct celestial relics forged into your Armory
                  </div>
                </div>
              </div>
            )}

            {/* Perks Detailed Grid */}
            <div className="space-y-3 font-sans">
              <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest block border-b border-purple-500/25 pb-2">
                All Premium Perks PLUS (9 Upgraded Perks):
              </span>

              {/* 1. PvP Tickets */}
              <div className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-white/[0.03] transition-colors">
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-400/40 flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                  <img src="/icons/ticket_variant_2_violet.png" alt="PvP Tickets" className="w-5 h-5 object-contain drop-shadow-[0_0_8px_rgba(168,85,247,0.7)]" />
                </div>
                <div>
                  <div className="font-bold text-purple-200 text-sm sm:text-[15px] leading-snug">12 PvP Tickets / Day</div>
                  <div className="text-xs text-gray-300 mt-0.5">+140% tickets — maximum league LP to reach top ranks</div>
                </div>
              </div>

              {/* 2. Blood Sovereigns */}
              <div className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-white/[0.03] transition-colors">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                  <img src="/icons/icon_sovereign.webp" alt="Blood Sovereign" className="w-5 h-5 object-contain drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
                </div>
                <div>
                  <div className="font-bold text-emerald-300 text-sm sm:text-[15px] leading-snug">+2 Blood Sovereigns / PvP Win</div>
                  <div className="text-xs text-gray-300 mt-0.5">Up to 24 SOV daily (2.4x higher earnings than Premium)</div>
                </div>
              </div>

              {/* 3. Seasonal Leaderboard Bonus */}
              <div className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-white/[0.03] transition-colors">
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-400/40 flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                  <img src="/icons/league_void_overlord.png" alt="Seasonal Rewards" className="w-5 h-5 object-contain drop-shadow-[0_0_8px_rgba(168,85,247,0.7)]" />
                </div>
                <div>
                  <div className="font-bold text-purple-200 text-sm sm:text-[15px] leading-snug">+25% Season Leaderboard Rewards</div>
                  <div className="text-xs text-gray-300 mt-0.5">Highest payout multiplier on daily & seasonal leaderboard standings</div>
                </div>
              </div>

              {/* 4. Peace Shield */}
              <div className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-white/[0.03] transition-colors">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                  <img src="/icons/shield_6h.png" alt="Peace Shield" className="w-5 h-5 object-contain drop-shadow-[0_0_8px_rgba(6,182,212,0.7)]" />
                </div>
                <div>
                  <div className="font-bold text-cyan-300 text-sm sm:text-[15px] leading-snug">1x 6-Hour Peace Shield</div>
                  <div className="text-xs text-gray-300 mt-0.5">Granted daily for extended immunity against raids</div>
                </div>
              </div>

              {/* 5. Energy */}
              <div className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-white/[0.03] transition-colors">
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-400/40 flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                  <img src="/icons/icon_energy.webp" alt="Energy" className="w-5 h-5 object-contain drop-shadow-[0_0_8px_rgba(168,85,247,0.7)]" />
                </div>
                <div>
                  <div className="font-bold text-purple-200 text-sm sm:text-[15px] leading-snug">20 PvE Energy (1 per 20 min)</div>
                  <div className="text-xs text-gray-300 mt-0.5">Quadrupled capacity with 2x faster regeneration speed</div>
                </div>
              </div>

              {/* 6. Gold Boost */}
              <div className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-white/[0.03] transition-colors">
                <div className="w-9 h-9 rounded-xl bg-yellow-500/15 border border-yellow-400/40 flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                  <img src="/icons/icon_gold.webp" alt="Gold Drop" className="w-5 h-5 object-contain drop-shadow-[0_0_8px_rgba(245,158,11,0.7)]" />
                </div>
                <div>
                  <div className="font-bold text-yellow-300 text-sm sm:text-[15px] leading-snug">+50% Gold Drop</div>
                  <div className="text-xs text-gray-300 mt-0.5">Supreme gold multiplication from all battles & campaign</div>
                </div>
              </div>

              {/* 7. Daily Stipend */}
              <div className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-white/[0.03] transition-colors">
                <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-400/40 flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                  <img src="/icons/icon_dust.webp" alt="Daily Stipend" className="w-5 h-5 object-contain drop-shadow-[0_0_8px_rgba(20,184,166,0.7)]" />
                </div>
                <div>
                  <div className="font-bold text-teal-300 text-sm sm:text-[15px] leading-snug">Daily Stipend: +3,000 Gold & +400 Dust</div>
                  <div className="text-xs text-gray-300 mt-0.5">Delivered directly to your in-game Mailbox every day at 00:00 UTC</div>
                </div>
              </div>

              {/* 8. Bank Payout Limit */}
              <div className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-white/[0.03] transition-colors">
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-400/40 flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                  <img src="/icons/icon_sovereign.webp" alt="Bank Cashout" className="w-5 h-5 object-contain drop-shadow-[0_0_8px_rgba(168,85,247,0.7)]" />
                </div>
                <div>
                  <div className="font-bold text-purple-200 text-sm sm:text-[15px] leading-snug">Lowest Bank Payout Limit: 2,000 SOV ($20)</div>
                  <div className="text-xs text-gray-300 mt-0.5">Lowest cashout barrier on the platform for instant withdrawals</div>
                </div>
              </div>

              {/* 9. Visual Prestige */}
              <div className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-white/[0.03] transition-colors">
                <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-400/40 flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                  <img src="/icons/referral_seal.png" alt="Ultra Diamond" className="w-5 h-5 object-contain drop-shadow-[0_0_10px_rgba(217,70,239,0.8)]" />
                </div>
                <div>
                  <div className="font-bold text-rose-300 text-sm sm:text-[15px] leading-snug">Animated Void Frame & 💎 Ultra Diamond</div>
                  <div className="text-xs text-gray-300 mt-0.5">Luminous cosmic aura, animated avatar frame & apex distinction</div>
                </div>
              </div>
            </div>

            {/* Buy / Extend CTA Button */}
            <div className="pt-2">
              <button
                onClick={() => handleBuy('ultra')}
                disabled={isProcessing}
                className="w-full font-display font-black tracking-widest py-3.5 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-b from-[#221029] via-[#130718] to-[#08020b] border-2 border-purple-500/60 hover:border-purple-400 text-purple-200 hover:text-white shadow-[0_0_18px_rgba(168,85,247,0.2)] hover:shadow-[0_0_28px_rgba(168,85,247,0.4)] select-none"
              >
                <span className="text-base drop-shadow-[0_0_6px_rgba(168,85,247,0.8)] shrink-0">💎</span>
                <span className="text-xs sm:text-sm uppercase tracking-[0.14em] drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-rose-200 to-amber-200">
                  {activeTier === 'ultra' ? `EXTEND ULTRA (${durationDays}D)` : `ASCEND TO ULTRA (${durationDays}D)`}
                </span>
                <span className="flex items-center gap-1.5 bg-black/60 border border-purple-500/40 rounded-full px-3 py-1 font-mono text-xs font-bold text-purple-300 shadow-inner ml-auto shrink-0">
                  <span>{PRICES.ultra[durationDays]}</span>
                  <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain drop-shadow-[0_0_4px_rgba(168,85,247,0.7)]" />
                </span>
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

      {/* 90-Day Divine Relic Celebration Modal */}
      {awardedBonusItems && awardedBonusItems.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#1c1228] via-[#120a1c] to-[#0a0510] border-2 border-amber-500/60 p-6 sm:p-8 shadow-[0_0_60px_rgba(245,158,11,0.35)] text-center space-y-6">
            {/* Radiant aura */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-2 relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 text-xs font-mono font-black uppercase tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                <span>👑</span>
                <span>COSMIC FORGE BLESSING</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 tracking-wider">
                Divine Relics Bestowed!
              </h3>
              <p className="text-xs text-gray-300 font-sans">
                For pledging to a 90-day covenant, ancient cosmic entities have forged celestial relic(s) directly into your Armory!
              </p>
            </div>

            {/* Relics Showcase */}
            <div className={`grid gap-3 relative z-10 ${awardedBonusItems.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
              {awardedBonusItems.map((item, idx) => (
                <div key={item.id || idx} className="rounded-2xl bg-black/60 border border-rose-500/40 p-4 flex flex-col items-center text-center space-y-3 shadow-[0_0_20px_rgba(225,29,72,0.2)]">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-rose-500/20 to-purple-900/40 border border-rose-400/80 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.4)]">
                    {item.icon ? (
                      <img src={item.icon} alt={item.name} className="w-12 h-12 object-contain drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]" />
                    ) : (
                      <span className="text-2xl">👑</span>
                    )}
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold">
                      {item.slot} • DIVINE
                    </div>
                    <div className="font-display font-black text-sm text-white mt-0.5">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-amber-300/90 font-mono mt-1">
                      {item.bonusType}: +{item.bonusValue}{item.bonusType === 'delayReduction' ? ' turn' : item.bonusType === 'dodge' ? '%' : ''}
                      {item.secondaryBonusType && (
                        <span className="text-teal-300"> • {item.secondaryBonusType}: +{item.secondaryBonusValue}{item.secondaryBonusType === 'dodge' ? '%' : ''}</span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-purple-300/80 mt-1">
                      Set of the Demiurge
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 relative z-10">
              <button
                onClick={() => setAwardedBonusItems(null)}
                className="w-full py-3.5 px-6 rounded-2xl font-display font-black text-sm tracking-wider uppercase bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:shadow-[0_0_35px_rgba(245,158,11,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                CLAIM TO ARMORY
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};


