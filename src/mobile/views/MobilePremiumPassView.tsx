import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useToast } from '../../components/Toast';
import { 
  Crown, 
  Gift, 
  Info,
  Sparkles,
  Check
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

  const isSubActive = !!(profile.subscriptionExpiresAt && profile.subscriptionExpiresAt > Date.now());
  const activeTier = isSubActive ? (profile.subscriptionTier || 'free') : 'free';
  const remainingDays = isSubActive 
    ? Math.max(1, Math.ceil(((profile.subscriptionExpiresAt || 0) - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Selected tier tab & duration within tier
  const [selectedTier, setSelectedTier] = useState<'premium' | 'ultra'>(
    activeTier === 'ultra' ? 'ultra' : 'premium'
  );
  const [durationDays, setDurationDays] = useState<30 | 90>(30);
  const [isProcessing, setIsProcessing] = useState(false);
  const [awardedBonusItems, setAwardedBonusItems] = useState<any[] | null>(null);

  // Prices in Dark Shards (Exact PC parity)
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

  // Full 9 Perks for Premium (Exact PC parity)
  const PREMIUM_PERKS = [
    {
      icon: '/icons/ticket_variant_3_gold.png',
      title: '8 PvP Tickets / Day',
      desc: '+60% more tickets to climb arena ranks',
      color: 'text-white'
    },
    {
      icon: '/icons/icon_sovereign.webp',
      title: '+1 Blood Sovereign / PvP Win',
      desc: 'Up to 20 SOV daily bounty from arena victories',
      color: 'text-emerald-300'
    },
    {
      icon: '/icons/league_grandmaster_crest.png',
      title: '+15% Season Leaderboard Rewards',
      desc: 'Bonus Blood Sovereigns on daily & seasonal leaderboard payouts',
      color: 'text-amber-300'
    },
    {
      icon: '/icons/shield_3h.png',
      title: '1x 3-Hour Peace Shield',
      desc: 'Granted daily to protect from attacks while offline',
      color: 'text-cyan-300'
    },
    {
      icon: '/icons/icon_energy.webp',
      title: '10 PvE Energy (1 per 30 min)',
      desc: 'Doubled capacity with 25% faster recovery',
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
      desc: 'Delivered directly to your in-game Mailbox at 00:00 UTC',
      color: 'text-teal-300'
    },
    {
      icon: '/icons/icon_sovereign.webp',
      title: 'Bank Payout Limit: 2,500 SOV ($25)',
      desc: 'Reduced cashout threshold to real USDT on Solana',
      color: 'text-amber-300'
    },
    {
      icon: '/icons/crown.png',
      title: 'Golden Name & ⚜️ Badge',
      desc: 'Distinct visual flair and prestige on leaderboards',
      color: 'text-amber-300'
    }
  ];

  // Full 9 Perks for Ultra (Exact PC parity)
  const ULTRA_PERKS = [
    {
      icon: '/icons/ticket_variant_2_violet.png',
      title: '12 PvP Tickets / Day (+140%)',
      desc: 'Maximum league LP tickets to reach top ranks',
      color: 'text-purple-200'
    },
    {
      icon: '/icons/icon_sovereign.webp',
      title: '+2 Blood Sovereigns / PvP Win',
      desc: 'Up to 36 SOV daily (1.8x higher earnings than Premium)',
      color: 'text-emerald-300'
    },
    {
      icon: '/icons/league_void_overlord.png',
      title: '+25% Season Leaderboard Rewards',
      desc: 'Highest payout multiplier on daily & seasonal standings',
      color: 'text-purple-200'
    },
    {
      icon: '/icons/shield_6h.png',
      title: '1x 6-Hour Peace Shield',
      desc: 'Granted daily for extended immunity against raids',
      color: 'text-cyan-300'
    },
    {
      icon: '/icons/icon_energy.webp',
      title: '20 PvE Energy (1 per 20 min)',
      desc: 'Quadrupled capacity with 2x faster regeneration speed',
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
      desc: 'Delivered directly to your in-game Mailbox at 00:00 UTC',
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
      title: 'Animated Void Frame & 💎 Ultra Diamond',
      desc: 'Luminous cosmic aura, animated avatar frame & apex distinction',
      color: 'text-rose-300'
    }
  ];

  return (
    <div className="max-w-xl mx-auto px-2 sm:px-4 pt-3 sm:pt-5 pb-32 sm:pb-36 space-y-4 text-white font-sans">
      
      {/* 1. Atmospheric Top Hero Showcase Banner (Responsive, No Clipping) */}
      <div className="relative rounded-2xl overflow-hidden border border-[#c5a880]/30 bg-gradient-to-b from-[#1c1524] via-[#100b17] to-[#08050c] p-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.85)]">
        {/* Background glow effects */}
        <div className="absolute -top-16 -left-16 w-40 h-40 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-purple-600/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-2.5">
          {/* Top Line: Badge & Active Status Plaque */}
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/15 to-purple-500/15 border border-amber-500/35 text-amber-300 font-mono text-[10px] font-bold tracking-wider uppercase">
              <Crown className="w-3 h-3 text-amber-400 shrink-0" />
              <span>COVENANT PASS</span>
            </div>

            {isSubActive ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <img 
                  src={activeTier === 'ultra' ? '/icons/badge_diamond_v1.png' : '/icons/badge_fleur_v1.png'} 
                  alt="Tier" 
                  className="w-3.5 h-3.5 object-contain inline shrink-0" 
                />
                <span className="text-[9.5px] font-mono font-black text-emerald-300 uppercase">
                  {activeTier === 'ultra' ? 'ULTRA' : 'PREMIUM'} • {remainingDays}D LEFT
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-900/80 border border-zinc-700/60 text-zinc-400 text-[9px] font-mono font-bold">
                <span>🛡️ STANDARD LORD</span>
              </div>
            )}
          </div>

          {/* Title & Slogan */}
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 uppercase leading-tight">
              Void Covenant Pass
            </h1>
            <p className="text-[11px] text-gray-300 leading-snug font-sans mt-0.5">
              Elevate your dominion over the Abyss with expanded daily PvP tickets, guaranteed Blood Sovereigns on arena victories, daily Peace Shields, and accelerated energy recovery.
            </p>
          </div>

          {/* Value Highlights Feature Chips (Clean 3-Column Grid without horizontal clipping) */}
          <div className="grid grid-cols-3 gap-1.5 pt-1 text-[9.5px] font-mono">
            <div className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-black/60 border border-amber-500/35 text-center shadow-inner">
              <img src="/icons/league_grandmaster_crest.png" alt="Leaderboard" className="w-4 h-4 object-contain shrink-0" />
              <span className="text-amber-300 font-bold mt-1">+15% to +25%</span>
              <span className="text-[8px] text-gray-400 leading-tight">Leaderboard</span>
            </div>
            <div className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-black/60 border border-emerald-500/35 text-center shadow-inner">
              <img src="/icons/icon_sovereign.webp" alt="SOV" className="w-4 h-4 object-contain shrink-0" />
              <span className="text-emerald-300 font-bold mt-1">Up to 36 SOV</span>
              <span className="text-[8px] text-gray-400 leading-tight">Daily Wins</span>
            </div>
            <div className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-black/60 border border-cyan-500/35 text-center shadow-inner">
              <img src="/icons/shield_3h.png" alt="Shield" className="w-4 h-4 object-contain shrink-0" />
              <span className="text-cyan-300 font-bold mt-1">Daily Shield</span>
              <span className="text-[8px] text-gray-400 leading-tight">Peace Ward</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top-Level Tier Switcher (ONLY 2 TABS - Clean & Distinct) */}
      <div className="flex p-1 rounded-2xl bg-black/80 border border-amber-500/30 shadow-lg gap-2">
        {/* PREMIUM TAB */}
        <button
          onClick={() => setSelectedTier('premium')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-display font-black text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 select-none ${
            selectedTier === 'premium'
              ? 'bg-gradient-to-b from-[#3d2410] via-[#241407] to-[#120a03] border-t-2 border-t-amber-400 border-x border-amber-600/50 border-b-2 border-b-black text-amber-200 shadow-[0_0_16px_rgba(245,158,11,0.35)]'
              : 'bg-transparent text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
          }`}
        >
          <img src="/icons/badge_fleur_v1.png" alt="Premium" className="w-5 h-5 object-contain shrink-0 drop-shadow" />
          <span>PREMIUM PASS</span>
        </button>

        {/* ULTRA TAB */}
        <button
          onClick={() => setSelectedTier('ultra')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-display font-black text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 relative select-none ${
            selectedTier === 'ultra'
              ? 'bg-gradient-to-b from-[#3a154d] via-[#230b2f] to-[#100316] border-t-2 border-t-purple-400 border-x border-purple-500/50 border-b-2 border-b-black text-purple-200 shadow-[0_0_16px_rgba(168,85,247,0.35)]'
              : 'bg-transparent text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
          }`}
        >
          <img src="/icons/badge_diamond_v1.png" alt="Ultra" className="w-5 h-5 object-contain shrink-0 drop-shadow" />
          <span>ULTRA OVERLORD</span>
          <span className="absolute -top-2 -right-1 bg-gradient-to-r from-purple-500 to-rose-500 text-[8px] font-mono font-black text-white px-1.5 py-0.5 rounded-full shadow">
            APEX
          </span>
        </button>
      </div>

      {/* 3. The Full PC-Style Tier Card (Inside the Tab) */}
      {selectedTier === 'premium' ? (
        /* ===================== PREMIUM PASS CARD ===================== */
        <div className={`rounded-3xl border-2 transition-all flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-[#17141b] via-[#0f0d14] to-[#070609] ${
          activeTier === 'premium'
            ? 'border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.35)]'
            : 'border-amber-500/30 shadow-[0_8px_30px_rgba(0,0,0,0.7)]'
        }`}>
          {/* Header Banner Artwork */}
          <div className="relative h-40 sm:h-48 w-full overflow-hidden border-b border-amber-500/20">
            <img 
              src="/pass_premium_crest.jpg" 
              alt="Premium Crest" 
              className="w-full h-full object-cover object-center opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0d14] via-[#0f0d14]/40 to-transparent" />
            
            {/* Tier Badge Header Overlay */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-amber-500/40 text-amber-300 font-display font-black text-[11px] tracking-wider uppercase">
                <img src="/icons/badge_fleur_v1.png" alt="Fleur" className="w-4 h-4 object-contain shrink-0 drop-shadow" />
                <span>PREMIUM TIER</span>
              </div>
              {activeTier === 'premium' && (
                <span className="text-[9.5px] font-mono font-black px-2 py-0.5 rounded-full bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.6)]">
                  YOUR ACTIVE PLAN
                </span>
              )}
            </div>

            {/* Title & Slogan */}
            <div className="absolute bottom-2.5 left-3.5 right-3.5">
              <h2 className="font-display font-black text-xl sm:text-2xl text-amber-300 tracking-wider flex items-center gap-2">
                PREMIUM PASS
              </h2>
              <p className="text-[10.5px] text-gray-300 font-sans">
                The gold standard. Essential for competitive Arena climbers.
              </p>
            </div>
          </div>

          <div className="p-3.5 sm:p-5 space-y-4">
            
            {/* Duration Selector (Inside the Card) */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider flex items-center justify-between">
                <span>Select Access Duration:</span>
                {durationDays === 90 && (
                  <span className="text-[9.5px] font-sans font-semibold text-amber-300">
                    +1 Divine Relic Included
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {/* 30 Days Option */}
                <button
                  onClick={() => setDurationDays(30)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer select-none ${
                    durationDays === 30
                      ? 'bg-gradient-to-b from-[#2a1d10] to-[#140c04] border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                      : 'bg-black/50 border-white/10 hover:border-amber-500/40 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display font-black text-xs text-white">30 DAYS</span>
                    <span className="text-[9px] font-mono text-gray-400">Standard</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain" />
                    <span className="font-display font-black text-lg text-amber-300">{PRICES.premium[30]}</span>
                    <span className="text-[9px] font-mono text-amber-400/80">SHARDS</span>
                  </div>
                </button>

                {/* 90 Days Option */}
                <button
                  onClick={() => setDurationDays(90)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative select-none ${
                    durationDays === 90
                      ? 'bg-gradient-to-b from-[#3d1814] to-[#1f0906] border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.35)]'
                      : 'bg-black/50 border-white/10 hover:border-rose-500/40 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display font-black text-xs text-white">90 DAYS</span>
                    <span className="text-[8px] font-mono font-black text-rose-200 bg-rose-950 px-1 py-0.2 rounded border border-rose-500/40">
                      -11% OFF
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain" />
                    <span className="font-display font-black text-lg text-amber-300">{PRICES.premium[90]}</span>
                    <span className="text-[9px] font-mono text-amber-400/80">SHARDS</span>
                  </div>
                  <div className="text-[9.5px] font-sans font-semibold text-amber-300 mt-0.5">
                    +1 Divine Relic Included
                  </div>
                </button>
              </div>
            </div>

            {/* 90-Day Exclusive Covenant Bonus Banner */}
            {durationDays === 90 && (
              <div className="relative rounded-2xl bg-gradient-to-br from-[#2a1708] via-[#140b04] to-black border border-amber-500/40 p-3 shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex items-center gap-3">
                <div className="relative w-11 h-11 rounded-xl bg-black/70 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
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
                  <div className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-amber-400">
                    90-Day Covenant Bonus
                  </div>
                  <div className="font-display font-black text-white text-xs tracking-wide mt-0.5">
                    +1 Random Divine Demiurge Relic
                  </div>
                  <div className="text-[10px] text-gray-400 font-sans mt-0.5 leading-tight">
                    Forged directly into your Armory upon activation
                  </div>
                </div>
              </div>
            )}

            {/* Perks Detailed List (Full 9 Perks) */}
            <div className="space-y-2 font-sans pt-1">
              <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-widest block border-b border-amber-500/20 pb-1.5">
                Included Privileges (9 Perks):
              </span>

              <div className="grid grid-cols-1 gap-1.5">
                {PREMIUM_PERKS.map((perk, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-2 rounded-xl bg-black/40 border border-white/5 hover:border-amber-500/25 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-inner">
                      <img src={perk.icon} alt={perk.title} className="w-4.5 h-4.5 object-contain drop-shadow" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`font-bold text-xs leading-tight ${perk.color}`}>{perk.title}</div>
                      <div className="text-[10px] text-gray-300 leading-snug mt-0.5">{perk.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dark Forged Runic Metal Purchase Button */}
            <div className="pt-2">
              <button
                onClick={() => handleBuy('premium')}
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-xl font-display font-black tracking-widest text-xs uppercase cursor-pointer transition-all duration-200 select-none active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-b from-[#3d2410] via-[#241407] to-[#120a03] border-t-2 border-t-amber-400/90 border-x border-amber-600/50 border-b-2 border-b-black shadow-[0_4px_16px_rgba(0,0,0,0.8),0_0_20px_rgba(245,158,11,0.2)] flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <img src="/icons/crown.png" alt="Crown" className="w-4.5 h-4.5 object-contain brightness-110 shrink-0" />
                  <span className="text-amber-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                    {activeTier === 'premium' ? `EXTEND PREMIUM (${durationDays}D)` : `ACTIVATE PREMIUM (${durationDays}D)`}
                  </span>
                </div>
                
                {/* Recessed Currency Socket */}
                <div className="bg-black/60 border border-amber-500/40 rounded-lg px-2.5 py-1 flex items-center gap-1.5 shadow-inner shrink-0">
                  <span className="font-mono font-bold text-amber-300 text-xs">
                    {PRICES.premium[durationDays]}
                  </span>
                  <img src="/icons/icon_shards.webp" alt="Shards" className="w-3.5 h-3.5 object-contain drop-shadow" />
                </div>
              </button>
            </div>

          </div>
        </div>
      ) : (
        /* ===================== ULTRA OVERLORD PASS CARD ===================== */
        <div className={`rounded-3xl border-2 transition-all flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-[#1b1122] via-[#100a16] to-[#07040b] ${
          activeTier === 'ultra'
            ? 'border-purple-400 shadow-[0_0_40px_rgba(168,85,247,0.45)]'
            : 'border-purple-500/40 shadow-[0_8px_30px_rgba(0,0,0,0.8)]'
        }`}>
          {/* Header Banner Artwork */}
          <div className="relative h-40 sm:h-48 w-full overflow-hidden border-b border-purple-500/30">
            <img 
              src="/pass_ultra_crest.jpg" 
              alt="Ultra Crest" 
              className="w-full h-full object-cover object-center opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#100a16] via-[#100a16]/40 to-transparent" />
            
            {/* Tier Badge Header Overlay */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-purple-400/50 text-purple-300 font-display font-black text-[11px] tracking-wider uppercase shadow-[0_0_12px_rgba(168,85,247,0.5)]">
                <img src="/icons/badge_diamond_v1.png" alt="Diamond" className="w-4 h-4 object-contain shrink-0 drop-shadow" />
                <span>APEX OVERLORD TIER</span>
              </div>
              {activeTier === 'ultra' ? (
                <span className="text-[9.5px] font-mono font-black px-2 py-0.5 rounded-full bg-purple-500 text-black shadow-[0_0_15px_rgba(168,85,247,0.7)]">
                  YOUR ACTIVE PLAN
                </span>
              ) : (
                <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-rose-500 text-white shadow">
                  MAX VALUE
                </span>
              )}
            </div>

            {/* Title & Slogan */}
            <div className="absolute bottom-2.5 left-3.5 right-3.5">
              <h2 className="font-display font-black text-xl sm:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-rose-200 to-amber-200 tracking-wider flex items-center gap-2">
                ULTRA OVERLORD
              </h2>
              <p className="text-[10.5px] text-purple-200/80 font-sans">
                Apex dominance: greatest reward yields and fastest progression velocity.
              </p>
            </div>
          </div>

          <div className="p-3.5 sm:p-5 space-y-4">
            
            {/* Duration Selector (Inside the Card) */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider flex items-center justify-between">
                <span>Select Access Duration:</span>
                {durationDays === 90 && (
                  <span className="text-[9.5px] font-sans font-semibold text-purple-300">
                    +2 Divine Relics Included
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {/* 30 Days Option */}
                <button
                  onClick={() => setDurationDays(30)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer select-none ${
                    durationDays === 30
                      ? 'bg-gradient-to-b from-[#281133] to-[#120517] border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                      : 'bg-black/50 border-white/10 hover:border-purple-500/40 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display font-black text-xs text-white">30 DAYS</span>
                    <span className="text-[9px] font-mono text-gray-400">Standard</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain" />
                    <span className="font-display font-black text-lg text-purple-300">{PRICES.ultra[30]}</span>
                    <span className="text-[9px] font-mono text-purple-400">SHARDS</span>
                  </div>
                </button>

                {/* 90 Days Option */}
                <button
                  onClick={() => setDurationDays(90)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative select-none ${
                    durationDays === 90
                      ? 'bg-gradient-to-b from-[#381033] to-[#1c041a] border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.35)]'
                      : 'bg-black/50 border-white/10 hover:border-rose-500/40 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display font-black text-xs text-white">90 DAYS</span>
                    <span className="text-[8px] font-mono font-black text-rose-200 bg-rose-950 px-1 py-0.2 rounded border border-rose-500/40">
                      -14% OFF
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain" />
                    <span className="font-display font-black text-lg text-purple-300">{PRICES.ultra[90]}</span>
                    <span className="text-[9px] font-mono text-purple-400">SHARDS</span>
                  </div>
                  <div className="text-[9.5px] font-sans font-semibold text-purple-300 mt-0.5">
                    +2 Divine Relics Included
                  </div>
                </button>
              </div>
            </div>

            {/* 90-Day Supreme Covenant Bonus Banner */}
            {durationDays === 90 && (
              <div className="relative rounded-2xl bg-gradient-to-br from-[#250d2e] via-[#120517] to-black border border-purple-400/50 p-3 shadow-[0_4px_25px_rgba(0,0,0,0.5)] flex items-center gap-3">
                <div className="relative w-11 h-11 rounded-xl bg-black/70 border border-purple-400/50 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.35)]">
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
                  <div className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-purple-300">
                    90-Day Supreme Bonus
                  </div>
                  <div className="font-display font-black text-amber-300 text-xs tracking-wide mt-0.5">
                    +2 Unique Divine Demiurge Relics
                  </div>
                  <div className="text-[10px] text-gray-400 font-sans mt-0.5 leading-tight">
                    Two distinct celestial relics forged into your Armory
                  </div>
                </div>
              </div>
            )}

            {/* Perks Detailed List (Full 9 Perks) */}
            <div className="space-y-2 font-sans pt-1">
              <span className="text-[11px] font-mono font-bold text-purple-400 uppercase tracking-widest block border-b border-purple-500/25 pb-1.5">
                All Premium Perks PLUS (9 Upgraded Perks):
              </span>

              <div className="grid grid-cols-1 gap-1.5">
                {ULTRA_PERKS.map((perk, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-2 rounded-xl bg-black/40 border border-white/5 hover:border-purple-500/30 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-400/40 flex items-center justify-center shrink-0 shadow-inner">
                      <img src={perk.icon} alt={perk.title} className="w-4.5 h-4.5 object-contain drop-shadow" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`font-bold text-xs leading-tight ${perk.color}`}>{perk.title}</div>
                      <div className="text-[10px] text-gray-300 leading-snug mt-0.5">{perk.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dark Forged Runic Metal Purchase Button */}
            <div className="pt-2">
              <button
                onClick={() => handleBuy('ultra')}
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-xl font-display font-black tracking-widest text-xs uppercase cursor-pointer transition-all duration-200 select-none active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-b from-[#3a154d] via-[#230b2f] to-[#100316] border-t-2 border-t-purple-400/90 border-x border-purple-500/50 border-b-2 border-b-black shadow-[0_4px_16px_rgba(0,0,0,0.8),0_0_20px_rgba(168,85,247,0.25)] flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <img src="/icons/badge_diamond_v1.png" alt="Diamond" className="w-4.5 h-4.5 object-contain shrink-0 drop-shadow" />
                  <span className="text-purple-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                    {activeTier === 'ultra' ? `EXTEND ULTRA (${durationDays}D)` : `ASCEND TO ULTRA (${durationDays}D)`}
                  </span>
                </div>
                
                {/* Recessed Currency Socket */}
                <div className="bg-black/60 border border-purple-500/40 rounded-lg px-2.5 py-1 flex items-center gap-1.5 shadow-inner shrink-0">
                  <span className="font-mono font-bold text-purple-300 text-xs">
                    {PRICES.ultra[durationDays]}
                  </span>
                  <img src="/icons/icon_shards.webp" alt="Shards" className="w-3.5 h-3.5 object-contain drop-shadow" />
                </div>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 4. Trust & Mechanics Info Footer (Duration Stacking & Balance Security) */}
      <div className="bg-black/50 border border-white/10 rounded-2xl p-3.5 sm:p-5 flex items-start gap-3.5 text-xs text-gray-400 shadow-inner">
        <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
          <Info className="w-4.5 h-4.5 text-amber-400" />
        </div>
        <div className="space-y-1 text-left">
          <div className="font-display font-bold text-gray-300 text-xs uppercase tracking-wider">
            Duration Stacking & Balance Security
          </div>
          <p className="font-sans leading-relaxed text-[11px] text-gray-300">
            Subscriptions stack seamlessly: re-purchasing the same tier adds the full duration to your remaining days. All Blood Sovereigns earned from PvP victories are credited directly to your bank balance and can be withdrawn as real USDT on Solana.
          </p>
        </div>
      </div>

      {/* 5. 90-Day Divine Relic Celebration Modal */}
      {awardedBonusItems && awardedBonusItems.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#221020] via-[#140a13] to-black border-2 border-amber-500/60 p-5 shadow-[0_0_50px_rgba(245,158,11,0.4)] text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/15 border border-amber-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.5)]">
              <Gift className="w-7 h-7 text-amber-400 animate-bounce" />
            </div>

            <div>
              <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">
                90-Day Covenant Activated
              </div>
              <h3 className="font-display font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-100 uppercase mt-0.5">
                Demiurge Relics Forged!
              </h3>
              <p className="text-[11px] text-gray-300 font-sans mt-1">
                The Demiurge recognizes your imperial commitment. Divine artifacts have been forged into your Armory:
              </p>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
              {awardedBonusItems.map((item, idx) => {
                const statInfo = formatEquipStat(item.statType, item.statValue);
                return (
                  <div 
                    key={idx}
                    className="flex items-center gap-3 p-2.5 rounded-2xl bg-black/70 border border-amber-500/40 shadow-inner text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-black/80 border border-amber-500/50 flex items-center justify-center shrink-0">
                      <img 
                        src={item.icon || '/icons/equipment/items/blade_of_the_demiurge.png'} 
                        alt={item.name} 
                        className="w-7 h-7 object-contain drop-shadow"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-display font-bold text-white truncate">
                        {item.name}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[8.5px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-500/40">
                          {item.slot}
                        </span>
                        {statInfo && (
                          <span className={`text-[8.5px] font-mono font-bold px-1.5 py-0.2 rounded border ${statInfo.color}`}>
                            {statInfo.label}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-1">
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
