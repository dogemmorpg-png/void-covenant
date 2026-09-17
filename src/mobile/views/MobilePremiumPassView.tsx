import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useToast } from '../../components/Toast';
import { 
  Crown, 
  Gift, 
  Flame, 
  Shield, 
  Info,
  Sparkles,
  Zap,
  Check,
  ChevronRight,
  Columns
} from 'lucide-react';

const formatEquipStat = (type?: string, value?: number) => {
  if (!type || value === undefined) return null;
  switch (type) {
    case 'delayReduction':
      return { label: `-${value} Turn Delay`, color: 'text-cyan-300 bg-cyan-950/50 border-cyan-500/40' };
    case 'dodge':
      return { label: `+${value}% Dodge`, color: 'text-blue-300 bg-blue-950/50 border-blue-500/40' };
    case 'goldBonus':
      return { label: `+${value}% Gold Bonus`, color: 'text-amber-300 bg-amber-950/50 border-amber-500/40' };
    case 'maxHealth':
      return { label: `+${value} Max HP`, color: 'text-emerald-300 bg-emerald-950/50 border-emerald-500/40' };
    default:
      return { label: `+${value} ${type}`, color: 'text-purple-300 bg-purple-950/50 border-purple-500/40' };
  }
};

export const MobilePremiumPassView: React.FC = () => {
  const { profile, buySubscription, setIsShardsShopOpen } = useGame();
  const toast = useToast();

  const [durationDays, setDurationDays] = useState<30 | 90>(30);
  const [selectedTier, setSelectedTier] = useState<'premium' | 'ultra'>('premium');
  const [showComparison, setShowComparison] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [awardedBonusItems, setAwardedBonusItems] = useState<any[] | null>(null);

  const isSubActive = !!(profile.subscriptionExpiresAt && profile.subscriptionExpiresAt > Date.now());
  const activeTier = isSubActive ? (profile.subscriptionTier || 'free') : 'free';
  const remainingDays = isSubActive 
    ? Math.max(1, Math.ceil(((profile.subscriptionExpiresAt || 0) - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Prices in Dark Shards (Exact same parity as PC)
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
      toast(`Need ${cost} Dark Shards. Opening shop...`, 'warning');
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

  // 9 Perks for Premium
  const PREMIUM_PERKS = [
    {
      icon: '/icons/ticket_variant_3_gold.png',
      title: '8 PvP Tickets / Day',
      desc: '+60% more tickets to climb arena ranks',
      color: 'text-amber-300'
    },
    {
      icon: '/icons/icon_sovereign.webp',
      title: '+1 Blood Sovereign / PvP Win',
      desc: 'Up to 10 SOV daily bounty from arena victories',
      color: 'text-emerald-300'
    },
    {
      icon: '/icons/league_grandmaster_crest.png',
      title: '+15% Season Leaderboard Rewards',
      desc: 'Bonus Blood Sovereigns on daily & season payouts',
      color: 'text-amber-300'
    },
    {
      icon: '/icons/shield_3h.png',
      title: '1x 3-Hour Peace Shield Daily',
      desc: 'Sent directly to in-game Mailbox at 00:00 UTC',
      color: 'text-cyan-300'
    },
    {
      icon: '/icons/icon_energy.webp',
      title: '10 PvE Energy (1 per 30 min)',
      desc: 'Doubled capacity with 25% faster regeneration',
      color: 'text-purple-200'
    },
    {
      icon: '/icons/icon_gold.webp',
      title: '+25% Gold Drop',
      desc: 'From all battles, campaign floors & encounters',
      color: 'text-yellow-300'
    },
    {
      icon: '/icons/icon_dust.webp',
      title: 'Daily Stipend: +1,000 Gold & +150 Dust',
      desc: 'Delivered directly to your in-game Mailbox',
      color: 'text-teal-300'
    },
    {
      icon: '/icons/icon_sovereign.webp',
      title: 'Bank Payout Limit: 2,500 SOV ($25)',
      desc: 'Lowered cashout threshold to real USDT on Solana',
      color: 'text-amber-300'
    },
    {
      icon: '/icons/crown.png',
      title: 'Golden Name & ⚜️ Prestige Badge',
      desc: 'Distinct visual flair and prestige on leaderboards',
      color: 'text-amber-300'
    }
  ];

  // 9 Perks for Ultra Overlord
  const ULTRA_PERKS = [
    {
      icon: '/icons/ticket_variant_2_violet.png',
      title: '12 PvP Tickets / Day',
      desc: '+140% tickets — maximum LP velocity to reach top ranks',
      color: 'text-purple-200'
    },
    {
      icon: '/icons/icon_sovereign.webp',
      title: '+2 Blood Sovereigns / PvP Win',
      desc: 'Up to 24 SOV daily (2.4x higher earnings than Premium)',
      color: 'text-emerald-300'
    },
    {
      icon: '/icons/league_void_overlord.png',
      title: '+25% Season Leaderboard Rewards',
      desc: 'Highest payout multiplier on leaderboard standings',
      color: 'text-purple-200'
    },
    {
      icon: '/icons/shield_6h.png',
      title: '1x 6-Hour Peace Shield Daily',
      desc: 'Sent directly to in-game Mailbox at 00:00 UTC',
      color: 'text-cyan-300'
    },
    {
      icon: '/icons/icon_energy.webp',
      title: '20 PvE Energy (1 per 20 min)',
      desc: 'Quadrupled capacity with 2x faster regeneration',
      color: 'text-purple-200'
    },
    {
      icon: '/icons/icon_gold.webp',
      title: '+50% Gold Drop',
      desc: 'Supreme gold multiplication from all battles & campaign',
      color: 'text-yellow-300'
    },
    {
      icon: '/icons/icon_dust.webp',
      title: 'Daily Stipend: +3,000 Gold & +400 Dust',
      desc: 'Delivered directly to your in-game Mailbox',
      color: 'text-teal-300'
    },
    {
      icon: '/icons/icon_sovereign.webp',
      title: 'Lowest Bank Payout Limit: 2,000 SOV ($20)',
      desc: 'Lowest cashout barrier on the platform for withdrawals',
      color: 'text-purple-200'
    },
    {
      icon: '/icons/referral_seal.png',
      title: 'Animated Void Frame & 💎 Diamond',
      desc: 'Luminous cosmic aura, animated avatar frame & apex distinction',
      color: 'text-rose-300'
    }
  ];

  // Quick Comparison Matrix Rows
  const COMPARISON_ROWS = [
    { label: 'PvP Tickets / Day', premium: '8 Tickets (+60%)', ultra: '12 Tickets (+140%)' },
    { label: 'SOV / PvP Win', premium: '+1 SOV (Max 10/day)', ultra: '+2 SOV (Max 24/day)' },
    { label: 'Leaderboard Bonus', premium: '+15% Seasonal', ultra: '+25% Seasonal' },
    { label: 'Daily Peace Shield', premium: '1x 3-Hour Shield', ultra: '1x 6-Hour Shield' },
    { label: 'PvE Energy Pool', premium: '10 Max (1/30 min)', ultra: '20 Max (1/20 min)' },
    { label: 'Gold Battles Drop', premium: '+25% Gold', ultra: '+50% Gold' },
    { label: 'Daily Mail Stipend', premium: '+1,000 G • +150 Dust', ultra: '+3,000 G • +400 Dust' },
    { label: 'Bank Cashout Limit', premium: '2,500 SOV ($25)', ultra: '2,000 SOV ($20)' },
    { label: 'Prestige Distinction', premium: 'Gold Name & ⚜️', ultra: 'Void Frame & 💎' },
    { label: '90-Day Relic Bonus', premium: '+1 Divine Demiurge', ultra: '+2 Divine Demiurge' }
  ];

  return (
    <div className="w-full pb-20 space-y-3.5 text-white font-sans">
      
      {/* 1. Header Hero Showcase Banner (Mobile-Optimized) */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-amber-500/30 bg-gradient-to-b from-[#1c1524] via-[#100b17] to-[#08050c] p-3.5 shadow-xl">
        <div className="absolute -top-16 -left-16 w-36 h-36 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-purple-600/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-2.5">
          {/* Top Badge & Status Plaque */}
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/15 to-purple-500/15 border border-amber-500/35 text-amber-300 font-mono text-[9px] font-bold tracking-wider uppercase">
              <Crown className="w-3 h-3 text-amber-400 shrink-0" />
              <span>COVENANT PASS</span>
            </div>

            {/* Active / Inactive Status Plaque */}
            {isSubActive ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] font-mono font-black text-emerald-300 uppercase">
                  {activeTier === 'ultra' ? '💎 ULTRA' : '⚜️ PREMIUM'} • {remainingDays}D LEFT
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-900/80 border border-zinc-700/60 text-zinc-400 text-[9px] font-mono font-bold">
                <span>🛡️ STANDARD LORD</span>
              </div>
            )}
          </div>

          {/* Title and Short Description */}
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 uppercase leading-tight">
              Void Covenant Pass
            </h1>
            <p className="text-[10px] sm:text-[11px] text-gray-300 leading-snug font-sans mt-0.5">
              Daily PvP tickets, guaranteed Blood Sovereigns on wins, daily Peace Shields, and mailbox tributes.
            </p>
          </div>

          {/* Value Highlights Feature Chips (Scrollable row) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-[10px] font-mono">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/60 border border-amber-500/35 text-amber-300 shrink-0 shadow-inner">
              <img src="/icons/league_grandmaster_crest.png" alt="Leaderboard" className="w-3.5 h-3.5 object-contain shrink-0" />
              <span>+15% to +25% Leaderboard</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/60 border border-emerald-500/35 text-emerald-300 shrink-0 shadow-inner">
              <img src="/icons/icon_sovereign.webp" alt="SOV" className="w-3.5 h-3.5 object-contain shrink-0" />
              <span>Up to 24 SOV/Day</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/60 border border-cyan-500/35 text-cyan-300 shrink-0 shadow-inner">
              <img src="/icons/shield_3h.png" alt="Shield" className="w-3.5 h-3.5 object-contain shrink-0" />
              <span>Daily Shield</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Duration Selector Tabs (30 Days vs 90 Days) */}
      <div className="flex items-center justify-between bg-black/60 border border-amber-500/25 rounded-2xl p-1.5 shadow-inner">
        {/* 30 Days Tab */}
        <button
          onClick={() => setDurationDays(30)}
          className={`flex-1 py-2 px-3 rounded-xl transition-all duration-200 text-center cursor-pointer select-none ${
            durationDays === 30
              ? 'bg-gradient-to-b from-[#2a1d35] via-[#1a1122] to-[#0f0915] border border-amber-400/80 shadow-[0_0_12px_rgba(245,158,11,0.3)] text-white'
              : 'bg-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <div className="font-display font-black text-xs tracking-wider">
            30 DAYS
          </div>
          <div className="text-[9px] font-mono text-gray-400 mt-0.5">
            Standard Term
          </div>
        </button>

        {/* 90 Days Tab (-15% + Divine Bonus) */}
        <button
          onClick={() => setDurationDays(90)}
          className={`flex-1 py-2 px-3 rounded-xl transition-all duration-200 text-center cursor-pointer select-none relative ${
            durationDays === 90
              ? 'bg-gradient-to-b from-[#3a1332] via-[#240b1f] to-[#120510] border-2 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)] text-white'
              : 'bg-rose-950/20 border border-rose-500/30 text-rose-300/80'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <span className="font-display font-black text-xs tracking-wider">
              90 DAYS
            </span>
            <span className="text-[8px] font-mono font-black text-rose-200 bg-rose-950 px-1 rounded shadow">
              -15%
            </span>
          </div>
          <div className="flex items-center justify-center gap-1 text-[9px] font-mono font-bold text-amber-300 mt-0.5">
            <Sparkles className="w-2.5 h-2.5 text-amber-400 shrink-0 animate-pulse" />
            <span>+ DIVINE RELIC</span>
          </div>
        </button>
      </div>

      {/* 3. Tier Segmented Switcher & Quick Compare Toggle */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          {/* Segmented Tier Tabs */}
          <div className="flex-1 flex p-1 rounded-xl bg-black/80 border border-white/10 shadow-sm gap-1.5">
            <button
              onClick={() => {
                setSelectedTier('premium');
                setShowComparison(false);
              }}
              className={`flex-1 py-2 px-2.5 rounded-lg font-display font-black text-xs tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                !showComparison && selectedTier === 'premium'
                  ? 'bg-gradient-to-b from-[#3d2410] via-[#241407] to-[#120a03] border-t-2 border-t-amber-400 border-x border-amber-600/50 border-b-2 border-b-black text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <span>⚜️</span>
              <span>PREMIUM</span>
            </button>

            <button
              onClick={() => {
                setSelectedTier('ultra');
                setShowComparison(false);
              }}
              className={`flex-1 py-2 px-2.5 rounded-lg font-display font-black text-xs tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 relative ${
                !showComparison && selectedTier === 'ultra'
                  ? 'bg-gradient-to-b from-[#3a154d] via-[#230b2f] to-[#100316] border-t-2 border-t-purple-400 border-x border-purple-500/50 border-b-2 border-b-black text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <span>💎</span>
              <span>ULTRA</span>
              <span className="absolute -top-1.5 -right-1 bg-gradient-to-r from-purple-500 to-rose-500 text-[7.5px] font-mono font-black text-white px-1 rounded-full shadow">
                APEX
              </span>
            </button>
          </div>

          {/* Compare Toggle Button */}
          <button
            onClick={() => setShowComparison(!showComparison)}
            className={`py-2 px-3 rounded-xl border text-[10px] font-mono font-black tracking-wider uppercase transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              showComparison
                ? 'bg-amber-400 text-black border-yellow-200 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                : 'bg-black/60 border-white/15 text-gray-300 hover:border-amber-400/50'
            }`}
          >
            <Columns className="w-3 h-3" />
            <span>{showComparison ? 'CLOSE' : 'COMPARE'}</span>
          </button>
        </div>
      </div>

      {/* ===================== VIEW A: QUICK COMPARISON MATRIX ===================== */}
      {showComparison ? (
        <div className="bg-gradient-to-b from-[#140e1b] via-[#0b0810] to-black border-2 border-amber-500/40 rounded-2xl p-3 shadow-2xl space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-1.5">
              <Columns className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-display font-black text-xs text-white uppercase tracking-wider">
                TIER COMPARISON MATRIX
              </span>
            </div>
            <span className="text-[9px] font-mono text-gray-400">
              {durationDays} Days Duration
            </span>
          </div>

          {/* Side by Side Cost Header */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-2 text-center space-y-1">
              <div className="text-[9px] font-mono text-amber-400 font-bold uppercase">⚜️ PREMIUM PASS</div>
              <div className="flex items-center justify-center gap-1">
                <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain" />
                <span className="font-display font-black text-base text-amber-300">{PRICES.premium[durationDays]}</span>
                <span className="text-[9px] font-mono text-gray-400">SHARDS</span>
              </div>
            </div>

            <div className="bg-purple-950/30 border border-purple-500/40 rounded-xl p-2 text-center space-y-1">
              <div className="text-[9px] font-mono text-purple-300 font-bold uppercase">💎 ULTRA OVERLORD</div>
              <div className="flex items-center justify-center gap-1">
                <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain" />
                <span className="font-display font-black text-base text-purple-200">{PRICES.ultra[durationDays]}</span>
                <span className="text-[9px] font-mono text-gray-400">SHARDS</span>
              </div>
            </div>
          </div>

          {/* Matrix Rows */}
          <div className="space-y-1 text-xs">
            {COMPARISON_ROWS.map((row, idx) => (
              <div 
                key={idx}
                className="bg-black/50 border border-white/5 rounded-xl p-2 space-y-1"
              >
                <div className="text-[9.5px] font-mono uppercase font-bold text-gray-400">
                  {row.label}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="text-amber-300/90 font-bold bg-amber-950/20 px-2 py-0.5 rounded border border-amber-500/20">
                    {row.premium}
                  </div>
                  <div className="text-purple-200 font-bold bg-purple-950/20 px-2 py-0.5 rounded border border-purple-500/20">
                    {row.ultra}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => handleBuy('premium')}
              disabled={isProcessing}
              className="w-full relative overflow-hidden bg-gradient-to-b from-[#3d2410] via-[#241407] to-[#120a03] hover:from-[#4d2d14] hover:via-[#2e1909] hover:to-[#170c04] border-t-2 border-t-amber-400/90 border-x border-amber-600/50 border-b-2 border-b-black font-display font-black tracking-widest py-2 px-2 rounded-xl text-center text-xs text-amber-200 cursor-pointer active:scale-95 transition-all"
            >
              {activeTier === 'premium' ? 'EXTEND PREMIUM' : 'BUY PREMIUM'}
            </button>

            <button
              onClick={() => handleBuy('ultra')}
              disabled={isProcessing}
              className="w-full relative overflow-hidden bg-gradient-to-b from-[#3a154d] via-[#230b2f] to-[#100316] hover:from-[#491b61] hover:via-[#2d0e3c] hover:to-[#15041c] border-t-2 border-t-purple-400/90 border-x border-purple-500/50 border-b-2 border-b-black font-display font-black tracking-widest py-2 px-2 rounded-xl text-center text-xs text-purple-200 cursor-pointer active:scale-95 transition-all"
            >
              {activeTier === 'ultra' ? 'EXTEND ULTRA' : 'BUY ULTRA'}
            </button>
          </div>
        </div>
      ) : (
        /* ===================== VIEW B: DETAILED SELECTED TIER CARD ===================== */
        <div className="space-y-3">
          
          {selectedTier === 'premium' ? (
            /* PREMIUM PASS CARD */
            <div className={`rounded-2xl border-2 transition-all relative overflow-hidden bg-gradient-to-b from-[#17141b] via-[#0f0d14] to-[#070609] p-3 shadow-xl space-y-3 ${
              activeTier === 'premium'
                ? 'border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.25)]'
                : 'border-amber-500/40 shadow-lg'
            }`}>
              {/* Header Visual Banner */}
              <div className="relative h-32 w-full rounded-xl overflow-hidden border border-amber-500/30">
                <img 
                  src="/pass_premium_crest.jpg" 
                  alt="Premium Crest" 
                  className="w-full h-full object-cover object-center opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0d14] via-[#0f0d14]/40 to-transparent" />
                
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-amber-500/40 text-amber-300 font-display font-black text-[10px] tracking-wider uppercase">
                    <span>⚜️</span>
                    <span>PREMIUM TIER</span>
                  </div>
                  {activeTier === 'premium' && (
                    <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded-full bg-amber-500 text-black shadow">
                      ACTIVE PLAN
                    </span>
                  )}
                </div>

                <div className="absolute bottom-2 left-3 right-3">
                  <h2 className="font-display font-black text-lg text-amber-300 tracking-wider">
                    PREMIUM PASS
                  </h2>
                  <p className="text-[10px] text-gray-300 font-sans leading-tight">
                    The gold standard. Essential for competitive Arena climbers.
                  </p>
                </div>
              </div>

              {/* Price Socket Row */}
              <div className="bg-black/60 border border-amber-500/25 rounded-xl p-2.5 flex items-center justify-between shadow-inner">
                <div>
                  <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block">Duration: {durationDays} Days</span>
                  <div className="font-display font-bold text-xs text-amber-200">
                    {durationDays === 90 ? 'Quarterly Season Pass' : 'Monthly Standard Pass'}
                  </div>
                </div>
                <div className="bg-black/70 border border-amber-500/40 rounded-lg px-2.5 py-1 flex items-center gap-1.5 shadow-inner">
                  <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain filter drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                  <span className="font-mono font-black text-amber-300 text-sm">{PRICES.premium[durationDays]} SHARDS</span>
                </div>
              </div>

              {/* 90-Day Exclusive Covenant Bonus Banner */}
              {durationDays === 90 && (
                <div className="rounded-xl bg-gradient-to-r from-[#2a1708] via-[#150b04] to-black border border-amber-500/40 p-2.5 flex items-center gap-3 shadow-md">
                  <div className="relative w-11 h-11 rounded-lg bg-black/80 border border-amber-500/40 flex items-center justify-center shrink-0">
                    <img 
                      src="/icons/equipment/items/blade_of_the_demiurge.png" 
                      alt="Demiurge Relic" 
                      className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" 
                    />
                    <span className="absolute -bottom-1 -right-1 bg-gradient-to-r from-rose-600 to-amber-600 text-white font-mono text-[7px] font-black px-1 rounded shadow">
                      DIVINE
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-400">
                      90-Day Covenant Bonus
                    </div>
                    <div className="font-display font-black text-white text-xs tracking-wide">
                      +1 Random Divine Demiurge Relic
                    </div>
                    <div className="text-[9.5px] text-gray-400 font-sans leading-none mt-0.5">
                      Forged directly into your Armory upon activation
                    </div>
                  </div>
                </div>
              )}

              {/* Perks List (9 Perks) */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider pb-1 border-b border-amber-500/20">
                  Included Privileges (9 Perks):
                </div>

                <div className="space-y-1">
                  {PREMIUM_PERKS.map((perk, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center gap-2.5 p-2 rounded-xl bg-black/40 border border-white/5 hover:border-amber-500/30 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-sm">
                        <img src={perk.icon} alt="Perk" className="w-4 h-4 object-contain shrink-0" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={`font-bold text-xs leading-tight ${perk.color}`}>
                          {perk.title}
                        </div>
                        <div className="text-[10px] text-gray-300 font-sans leading-tight mt-0.5">
                          {perk.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Purchase Button: Dark Forged Runic Metal */}
              <div className="pt-2">
                <button
                  onClick={() => handleBuy('premium')}
                  disabled={isProcessing}
                  className="w-full relative overflow-hidden bg-gradient-to-b from-[#3d2410] via-[#241407] to-[#120a03] hover:from-[#4d2d14] hover:via-[#2e1909] hover:to-[#170c04] border-t-2 border-t-amber-400/90 border-x border-amber-600/50 border-b-2 border-b-black font-display font-black tracking-widest py-2.5 px-3 rounded-xl transition-all duration-200 shadow-[0_4px_12px_rgba(0,0,0,0.8),0_0_12px_rgba(245,158,11,0.2)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.9),0_0_18px_rgba(245,158,11,0.35)] flex items-center justify-between text-xs cursor-pointer hover:scale-[1.01] active:scale-[0.98] select-none group disabled:opacity-50"
                >
                  <span className="font-display font-black tracking-widest text-amber-200 group-hover:text-amber-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] uppercase">
                    {isProcessing 
                      ? 'ACTIVATING...' 
                      : activeTier === 'premium' 
                      ? `EXTEND PREMIUM (${durationDays}D)` 
                      : `ACTIVATE PREMIUM (${durationDays}D)`}
                  </span>
                  <div className="bg-black/60 border border-amber-500/40 rounded-lg px-2.5 py-1 flex items-center gap-1.5 shadow-inner">
                    <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain filter drop-shadow-[0_0_6px_rgba(245,158,11,0.9)]" />
                    <span className="font-mono font-bold text-amber-300 text-xs tracking-normal">{PRICES.premium[durationDays]} SHARDS</span>
                  </div>
                </button>
              </div>

            </div>
          ) : (
            /* ULTRA OVERLORD CARD */
            <div className={`rounded-2xl border-2 transition-all relative overflow-hidden bg-gradient-to-b from-[#1b1122] via-[#100a16] to-[#07040b] p-3 shadow-xl space-y-3 ${
              activeTier === 'ultra'
                ? 'border-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.35)]'
                : 'border-purple-500/40 shadow-lg'
            }`}>
              {/* Header Visual Banner */}
              <div className="relative h-32 w-full rounded-xl overflow-hidden border border-purple-500/30">
                <img 
                  src="/pass_ultra_crest.jpg" 
                  alt="Ultra Crest" 
                  className="w-full h-full object-cover object-center opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#100a16] via-[#100a16]/40 to-transparent" />
                
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-purple-400/50 text-purple-300 font-display font-black text-[10px] tracking-wider uppercase shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                    <span>💎</span>
                    <span>APEX OVERLORD TIER</span>
                  </div>
                  {activeTier === 'ultra' ? (
                    <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded-full bg-purple-500 text-black shadow">
                      ACTIVE PLAN
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-rose-500 text-white shadow">
                      MAX VALUE
                    </span>
                  )}
                </div>

                <div className="absolute bottom-2 left-3 right-3">
                  <h2 className="font-display font-black text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-rose-200 to-amber-200 tracking-wider">
                    ULTRA OVERLORD
                  </h2>
                  <p className="text-[10px] text-purple-200/80 font-sans leading-tight">
                    Apex dominance: greatest reward yields and fastest progression.
                  </p>
                </div>
              </div>

              {/* Price Socket Row */}
              <div className="bg-black/60 border border-purple-500/25 rounded-xl p-2.5 flex items-center justify-between shadow-inner">
                <div>
                  <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block">Duration: {durationDays} Days</span>
                  <div className="font-display font-bold text-xs text-purple-200">
                    {durationDays === 90 ? 'Quarterly Apex Pass' : 'Monthly Apex Pass'}
                  </div>
                </div>
                <div className="bg-black/70 border border-purple-500/40 rounded-lg px-2.5 py-1 flex items-center gap-1.5 shadow-inner">
                  <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain filter drop-shadow-[0_0_6px_rgba(168,85,247,0.8)]" />
                  <span className="font-mono font-black text-purple-200 text-sm">{PRICES.ultra[durationDays]} SHARDS</span>
                </div>
              </div>

              {/* 90-Day Exclusive Covenant Bonus Banner */}
              {durationDays === 90 && (
                <div className="rounded-xl bg-gradient-to-r from-[#250d2e] via-[#120517] to-black border border-purple-400/50 p-2.5 flex items-center gap-3 shadow-md">
                  <div className="relative w-11 h-11 rounded-lg bg-black/80 border border-purple-400/50 flex items-center justify-center shrink-0">
                    <img 
                      src="/icons/equipment/items/crown_of_the_demiurge.png" 
                      alt="Demiurge Relic" 
                      className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(168,85,247,0.7)]" 
                    />
                    <span className="absolute -bottom-1 -right-1 bg-gradient-to-r from-rose-600 to-purple-600 text-white font-mono text-[7px] font-black px-1 rounded shadow">
                      2x DIVINE
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-purple-300">
                      90-Day Supreme Bonus
                    </div>
                    <div className="font-display font-black text-amber-300 text-xs tracking-wide">
                      +2 Unique Divine Demiurge Relics
                    </div>
                    <div className="text-[9.5px] text-gray-400 font-sans leading-none mt-0.5">
                      Two distinct celestial relics forged into your Armory
                    </div>
                  </div>
                </div>
              )}

              {/* Perks List (9 Perks) */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider pb-1 border-b border-purple-500/20">
                  All Premium Perks PLUS (9 Upgraded Perks):
                </div>

                <div className="space-y-1">
                  {ULTRA_PERKS.map((perk, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center gap-2.5 p-2 rounded-xl bg-black/40 border border-white/5 hover:border-purple-500/30 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-400/40 flex items-center justify-center shrink-0 shadow-sm">
                        <img src={perk.icon} alt="Perk" className="w-4 h-4 object-contain shrink-0" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={`font-bold text-xs leading-tight ${perk.color}`}>
                          {perk.title}
                        </div>
                        <div className="text-[10px] text-gray-300 font-sans leading-tight mt-0.5">
                          {perk.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Purchase Button: Dark Forged Runic Metal */}
              <div className="pt-2">
                <button
                  onClick={() => handleBuy('ultra')}
                  disabled={isProcessing}
                  className="w-full relative overflow-hidden bg-gradient-to-b from-[#3a154d] via-[#230b2f] to-[#100316] hover:from-[#491b61] hover:via-[#2d0e3c] hover:to-[#15041c] border-t-2 border-t-purple-400/90 border-x border-purple-500/50 border-b-2 border-b-black font-display font-black tracking-widest py-2.5 px-3 rounded-xl transition-all duration-200 shadow-[0_4px_12px_rgba(0,0,0,0.8),0_0_12px_rgba(168,85,247,0.2)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.9),0_0_18px_rgba(168,85,247,0.35)] flex items-center justify-between text-xs cursor-pointer hover:scale-[1.01] active:scale-[0.98] select-none group disabled:opacity-50"
                >
                  <span className="font-display font-black tracking-widest text-purple-200 group-hover:text-purple-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] uppercase">
                    {isProcessing 
                      ? 'ASCENDING...' 
                      : activeTier === 'ultra' 
                      ? `EXTEND ULTRA (${durationDays}D)` 
                      : `ASCEND TO ULTRA (${durationDays}D)`}
                  </span>
                  <div className="bg-black/60 border border-purple-500/40 rounded-lg px-2.5 py-1 flex items-center gap-1.5 shadow-inner">
                    <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain filter drop-shadow-[0_0_6px_rgba(168,85,247,0.9)]" />
                    <span className="font-mono font-bold text-purple-200 text-xs tracking-normal">{PRICES.ultra[durationDays]} SHARDS</span>
                  </div>
                </button>
              </div>

            </div>
          )}

        </div>
      )}

      {/* 4. Trust & Mechanics Footer (Exact match with PC) */}
      <div className="bg-black/50 border border-white/10 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-gray-400">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <div className="font-display font-bold text-gray-300 text-[11px] uppercase tracking-wider">
            Duration Stacking & Balance Security
          </div>
          <p className="font-sans leading-relaxed text-[10px] text-gray-400">
            Subscriptions stack seamlessly: re-purchasing the same tier adds full duration to your remaining days. Blood Sovereigns earned from victories are credited directly to your bank balance and can be withdrawn as real USDT on Solana.
          </p>
        </div>
      </div>

      {/* 5. 90-Day Divine Relic Celebration Modal (100% PC Parity) */}
      {awardedBonusItems && awardedBonusItems.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#180e22] via-[#0f0817] to-[#08040d] border border-[#c5a880]/40 p-5 shadow-[0_0_60px_rgba(0,0,0,0.9)] text-center space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="space-y-1 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#c5a880]/10 border border-[#c5a880]/30 text-[#ebd09b] text-[9px] font-mono font-black tracking-widest uppercase shadow-sm">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>90-DAY COVENANT PRIVILEGE</span>
              </div>
              <h3 className="text-xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-[#ebd09b] via-[#c5a880] to-[#8c6d48] tracking-wider uppercase">
                Divine Relics Unlocked
              </h3>
              <p className="text-[11px] text-gray-400 font-sans">
                Celestial relics from the Set of the Demiurge have been forged and granted to your Armory.
              </p>
            </div>

            <div className="space-y-2.5 relative z-10">
              {awardedBonusItems.map((item, idx) => {
                const stat1 = formatEquipStat(item.bonusType, item.bonusValue);
                const stat2 = formatEquipStat(item.secondaryBonusType, item.secondaryBonusValue);

                return (
                  <div 
                    key={item.id || idx} 
                    className="rounded-2xl bg-black/60 border border-rose-500/30 p-3 flex flex-col items-center text-center space-y-2 shadow-md relative overflow-hidden"
                  >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-b from-rose-950/40 via-black to-black border border-rose-500/50 flex items-center justify-center shadow-[0_0_12px_rgba(244,63,94,0.3)]">
                      {item.icon ? (
                        <img src={item.icon} alt={item.name} className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(244,63,94,0.7)]" />
                      ) : (
                        <Sparkles className="w-6 h-6 text-rose-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-[9px] font-mono uppercase tracking-widest text-rose-400 font-bold">
                        {item.slot} • DIVINE
                      </div>
                      <div className="font-display font-black text-xs text-white mt-0.5 tracking-wide">
                        {item.name}
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-1 mt-1.5">
                        {stat1 && (
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${stat1.color}`}>
                            {stat1.label}
                          </span>
                        )}
                        {stat2 && (
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${stat2.color}`}>
                            {stat2.label}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-1 relative z-10">
              <button
                onClick={() => setAwardedBonusItems(null)}
                className="w-full py-2.5 px-4 rounded-xl font-display font-black text-xs tracking-widest uppercase bg-gradient-to-r from-amber-600 via-[#e5c158] to-amber-600 text-black shadow-lg cursor-pointer border border-amber-300/60 active:scale-95"
              >
                EQUIP IN ARMORY
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
