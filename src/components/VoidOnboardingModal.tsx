import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Swords, 
  Shield, 
  Clock, 
  Crown, 
  Coins, 
  Users, 
  Sparkles, 
  Zap, 
  CheckCircle2,
  Lock,
  Landmark,
  ArrowRight
} from 'lucide-react';

interface VoidOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface OnboardingSlide {
  id: number;
  tag: string;
  title: string;
  headline: string;
  description: string;
  highlightText?: string;
  visual: React.ReactNode;
}

export const VoidOnboardingModal: React.FC<VoidOnboardingModalProps> = ({ isOpen, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const triggerHaptic = useCallback(() => {
    try {
      if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.HapticFeedback) {
        (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('light');
      } else if (navigator.vibrate) {
        navigator.vibrate(15);
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        setCurrentSlide(prev => Math.min(5, prev + 1));
        triggerHaptic();
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide(prev => Math.max(0, prev - 1));
        triggerHaptic();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, triggerHaptic]);

  if (!isOpen) return null;

  const slides: OnboardingSlide[] = [
    // ----------------------------------------------------
    // SLIDE 1: 5 BATTLE SLOTS & LINEAR DUELS
    // ----------------------------------------------------
    {
      id: 1,
      tag: 'BATTLEFIELD ARCHITECTURE',
      title: '5 LINEAR SLOTS',
      headline: 'Creatures strike strictly straight ahead.',
      description: 'Deploy cards into 5 board slots. Each minion duels the opposing card in the mirror slot. If the opposite slot is empty, all damage hits the enemy Lord directly!',
      highlightText: 'Empty Slot = Direct Damage to Enemy Hero',
      visual: (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-3">
          {/* Subtle Ambient Backlight */}
          <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none" />

          <div className="w-full max-w-[320px] space-y-3 relative z-10">
            {/* Enemy Slots Row */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[9px] font-mono text-rose-400 px-1">
                <span>ENEMY FRONTLINE</span>
                <span className="text-zinc-500">HP: 100</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((slot) => (
                  <div
                    key={slot}
                    className={`aspect-[3/4] rounded-xl border flex flex-col items-center justify-center relative transition-all ${
                      slot === 3
                        ? 'border-rose-500/80 bg-rose-950/40 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                        : 'border-zinc-800 bg-black/40'
                    }`}
                  >
                    <span className="text-[8px] font-mono text-zinc-500">#{slot}</span>
                    <div className="w-6 h-6 rounded-full bg-rose-950/60 border border-rose-500/40 flex items-center justify-center mt-1">
                      <span className="text-xs">{slot === 3 ? '💀' : '⚔️'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Attack Direction Arrows Indicator */}
            <div className="flex items-center justify-center gap-2 py-0.5">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 font-mono text-[9px] font-bold shadow-sm">
                <span>▲</span>
                <span>DIRECT DUEL</span>
                <span>▼</span>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
            </div>

            {/* Player Slots Row */}
            <div className="space-y-1">
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((slot) => (
                  <div
                    key={slot}
                    className={`aspect-[3/4] rounded-xl border flex flex-col items-center justify-center relative transition-all ${
                      slot === 3
                        ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_12px_rgba(34,211,238,0.4)] ring-1 ring-cyan-400/50'
                        : 'border-cyan-900/40 bg-cyan-950/20'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-cyan-900/60 border border-cyan-400/40 flex items-center justify-center mb-1">
                      <span className="text-xs">⚔️</span>
                    </div>
                    <span className="text-[8px] font-mono text-cyan-400 font-bold">#{slot}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-[9px] font-mono text-cyan-400 px-1">
                <span>YOUR BATTLE LINE</span>
                <span className="text-zinc-500">MANA: +1/TURN</span>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // ----------------------------------------------------
    // SLIDE 2: DELAY TIMER, ARMOR & BARRIER
    // ----------------------------------------------------
    {
      id: 2,
      tag: 'COMBAT DYNAMICS',
      title: 'DELAY & DEFENSE',
      headline: 'Minions need time to awaken.',
      description: 'Every creature has an activation Delay (1–3 turns). Each round, all Delay timers decrease by 1. When a card reaches 0, it attacks every turn! Armor absorbs incoming hits, and Barriers fully negate 1 strike.',
      highlightText: 'Delay ticks down each turn until 0 (Ready to attack)',
      visual: (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-3">
          <div className="absolute inset-0 bg-radial from-purple-500/10 via-transparent to-transparent pointer-events-none" />

          {/* Stylized Center Card with Stat Badges */}
          <div className="relative w-44 sm:w-48 aspect-[5/7] rounded-2xl border-2 border-amber-500/70 bg-gradient-to-b from-[#1c1427] via-[#100c18] to-black p-2 flex flex-col justify-between shadow-[0_0_25px_rgba(168,85,247,0.35)]">
            {/* Top Bar: Mana & Card Name */}
            <div className="flex items-center justify-between">
              <div className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-400 flex items-center justify-center shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                <span className="text-white text-[10px] font-black font-mono">2</span>
              </div>
              <span className="text-[10px] font-display font-black text-amber-200 tracking-wider uppercase">
                ABYSSAL REAPER
              </span>
              <span className="text-[9px] font-mono text-purple-300">GOLD</span>
            </div>

            {/* Central Card Illustration Frame */}
            <div className="relative flex-1 my-1.5 rounded-xl overflow-hidden border border-purple-500/30 bg-black/60 flex items-center justify-center">
              <img 
                src="/cards/abyss_reaper.webp" 
                alt="Reaper" 
                className="w-full h-full object-cover brightness-105"
                onError={(e) => {
                  // Fallback to avatar if specific card asset isn't loaded
                  (e.target as HTMLImageElement).src = '/avatars/knight.webp';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            </div>

            {/* Bottom 3 Stat Tokens */}
            <div className="grid grid-cols-3 gap-1 pt-0.5">
              {/* Attack */}
              <div className="flex items-center justify-center gap-1 py-1 rounded-lg bg-red-950/80 border border-red-500/40">
                <img src="/icons/gothic_attack.webp" alt="ATK" className="w-3.5 h-3.5 object-contain" />
                <span className="text-white text-xs font-black font-mono">14</span>
              </div>

              {/* Delay Timer (Hourglass) */}
              <div className="flex items-center justify-center gap-1 py-1 rounded-lg bg-amber-950/90 border border-amber-400/60 shadow-[0_0_8px_rgba(245,158,11,0.4)]">
                <img src="/icons/gothic_hourglass.webp" alt="Delay" className="w-3.5 h-3.5 object-contain" />
                <span className="text-amber-300 text-xs font-black font-mono">1⏳</span>
              </div>

              {/* Health */}
              <div className="flex items-center justify-center gap-1 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40">
                <img src="/icons/gothic_health.webp" alt="HP" className="w-3.5 h-3.5 object-contain" />
                <span className="text-white text-xs font-black font-mono">22</span>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // ----------------------------------------------------
    // SLIDE 3: CAMPAIGN & BOSSES
    // ----------------------------------------------------
    {
      id: 3,
      tag: 'TOWER EXPEDITIONS',
      title: 'THE CAMPAIGN',
      headline: 'Conquer spires & crush towering bosses.',
      description: 'Your Combat Deck must hold exactly 10 cards. Consume PvE Energy to ascend floors. Bosses await every 10 floors with first-clear bounties! Earn 3 Stars to unlock 1-click Instant Sweeps.',
      highlightText: 'Exactly 10 cards in Deck • Bosses every 10 floors',
      visual: (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-3">
          <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none" />

          <div className="w-full max-w-[300px] space-y-2.5">
            {/* Boss Floor Banner */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-red-950/80 via-black to-red-950/80 border border-red-500/50 flex items-center justify-between shadow-[0_0_20px_rgba(220,38,38,0.25)]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-red-900/50 border border-red-400 flex items-center justify-center text-xl shadow-inner">
                  👑
                </div>
                <div>
                  <span className="text-[10px] font-mono text-red-400 font-bold block">FLOOR 10 • 20 • 30</span>
                  <span className="text-xs font-display font-black text-white tracking-wide">ANCIENT BOSS LAIR</span>
                </div>
              </div>
              <span className="text-[9px] font-mono bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full font-bold">
                +SOV LOOT
              </span>
            </div>

            {/* Features Row */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-white/10 flex items-center gap-2">
                <img src="/icons/icon_energy.webp" alt="Energy" className="w-6 h-6 object-contain shrink-0" />
                <div>
                  <span className="text-[9px] font-mono font-bold text-amber-300 block">PvE ENERGY</span>
                  <span className="text-[8px] font-mono text-zinc-400 block">Recharges over time</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-white/10 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-yellow-950 border border-yellow-500/50 flex items-center justify-center text-xs">
                  ⚡
                </div>
                <div>
                  <span className="text-[9px] font-mono font-bold text-yellow-300 block">3-STAR SWEEP</span>
                  <span className="text-[8px] font-mono text-zinc-400 block">1-click instant loot</span>
                </div>
              </div>
            </div>

            {/* 10 Cards rule reminder */}
            <div className="p-2 rounded-xl bg-black/60 border border-amber-500/30 text-center">
              <span className="text-[9.5px] font-mono text-amber-200">
                🃏 Set your 10-card deck in the <strong className="text-white">CARDS</strong> tab!
              </span>
            </div>
          </div>
        </div>
      )
    },

    // ----------------------------------------------------
    // SLIDE 4: THE ARENA & VICTORY BOUNTIES
    // ----------------------------------------------------
    {
      id: 4,
      tag: 'GLADIATORIAL COMBAT',
      title: 'THE PVP ARENA',
      headline: 'Earn Sovereigns for every victorious duel.',
      description: 'Spend Arena Tickets to battle real summoners. Pass subscribers earn real Blood Sovereigns for every single win! Climb leagues from Bronze to Divine, and activate Peace Shields to stay safe while offline.',
      highlightText: 'Daily Tickets + Sovereigns Paid Per Win',
      visual: (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-3">
          <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none" />

          <div className="w-full max-w-[300px] space-y-2.5">
            {/* Arena Header Badge */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/80 via-black to-amber-950/80 border border-amber-500/50 flex items-center justify-between shadow-[0_0_20px_rgba(245,158,11,0.25)]">
              <div className="flex items-center gap-2.5">
                <img src="/icons/crown.png" alt="Crown" className="w-9 h-9 object-contain shrink-0 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                <div>
                  <span className="text-[10px] font-mono text-amber-400 font-bold block">LEAGUE RANKINGS</span>
                  <span className="text-xs font-display font-black text-white tracking-wide">BRONZE TO DIVINE</span>
                </div>
              </div>
              <img src="/icons/league_divine.png" alt="Divine" className="w-8 h-8 object-contain shrink-0" />
            </div>

            {/* Per-win SOV callout */}
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-red-950/60 to-black border border-red-500/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/icons/icon_sovereign.webp" alt="SOV" className="w-6 h-6 object-contain" />
                <span className="text-[9.5px] font-mono text-zinc-200">
                  Per-Win Bounty: <strong className="text-amber-300">+1 to +2 SOV</strong>
                </span>
              </div>
              <span className="text-[8.5px] font-mono text-zinc-400">Paid Every Win</span>
            </div>

            {/* Peace Shield Callout */}
            <div className="p-2 rounded-xl bg-sky-950/40 border border-sky-500/40 flex items-center gap-2">
              <Shield className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="text-[9px] font-mono text-sky-200">
                <strong className="text-white">Peace Shields (3h, 6h, 12h)</strong> lock your crowns from offline attacks.
              </span>
            </div>
          </div>
        </div>
      )
    },

    // ----------------------------------------------------
    // SLIDE 5: BLOOD SOVEREIGNS & BANK WITHDRAWALS
    // ----------------------------------------------------
    {
      id: 5,
      tag: 'REAL CRYPTO ASSET',
      title: 'SOVEREIGNS & BANK',
      headline: 'Convertible cryptocurrency pegged 100:1 to USD.',
      description: 'Blood Sovereigns are the supreme prize of Void Covenant. 100 SOV = $1.00 USDT. All earnings accumulate in your Royal Bank, where you can withdraw on-chain directly to USDT, TON, or Solana.',
      highlightText: '100 SOV = $1.00 USDT • Direct On-Chain Withdrawal',
      visual: (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-3">
          <div className="absolute inset-0 bg-radial from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

          {/* Central Shining Sovereign Coin */}
          <div className="relative flex flex-col items-center space-y-3">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 via-amber-600 to-red-950 p-1 shadow-[0_0_35px_rgba(245,158,11,0.5)] animate-pulse">
                <div className="w-full h-full rounded-full bg-black/80 flex items-center justify-center border-2 border-amber-300">
                  <img src="/icons/icon_sovereign.webp" alt="SOV" className="w-16 h-16 object-contain drop-shadow-[0_0_12px_rgba(239,68,68,0.7)]" />
                </div>
              </div>
            </div>

            {/* Exchange Rate Card */}
            <div className="p-2.5 rounded-xl bg-black/80 border border-emerald-500/50 text-center space-y-0.5 shadow-lg">
              <div className="text-base font-mono font-black text-white flex items-center justify-center gap-1.5">
                <span className="text-amber-300">100 SOV</span>
                <span className="text-zinc-400">=</span>
                <span className="text-emerald-400">$1.00 USDT</span>
              </div>
              <span className="text-[8.5px] font-mono text-zinc-400 block">
                Instant withdrawal inside the BANK tab
              </span>
            </div>

            {/* Supported Networks */}
            <div className="flex items-center gap-2 text-[8.5px] font-mono text-zinc-400">
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">USDT (TON)</span>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">USDT (BEP-20)</span>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">SOLANA</span>
            </div>
          </div>
        </div>
      )
    },

    // ----------------------------------------------------
    // SLIDE 6: THE ALLIANCE & REFERRALS
    // ----------------------------------------------------
    {
      id: 6,
      tag: 'SYNDICATE REVENUE',
      title: 'THE ALLIANCE',
      headline: 'Earn 15% of all battle winnings from your allies.',
      description: 'Share your personal invitation link. Receive 15% lifetime commissions on all Blood Sovereigns your allies win on the Arena and League, plus colossal milestone bounties from 150 to 500,000 SOV!',
      highlightText: '15% Lifetime Battle Share • 500,000 SOV Milestones',
      visual: (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-3">
          <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none" />

          <div className="w-full max-w-[300px] space-y-2.5">
            {/* 15% Share Banner */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/70 via-black to-amber-950/70 border border-amber-500/50 text-center space-y-1 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block">
                PERPETUAL ALLIANCE SHARE
              </span>
              <div className="text-3xl font-display font-black text-white tracking-wider text-amber-300">
                15% SHARE
              </div>
              <span className="text-[8.5px] font-mono text-zinc-300 block">
                Of all Arena & League SOV won by your recruits
              </span>
            </div>

            {/* Milestones Card */}
            <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-white/10 space-y-1">
              <div className="flex items-center justify-between text-[9px] font-mono">
                <span className="text-zinc-300">🎁 Pass Activation Bounty</span>
                <span className="text-amber-300 font-bold">+SOV Instantly</span>
              </div>
              <div className="flex items-center justify-between text-[9px] font-mono">
                <span className="text-zinc-300">🏆 9 Alliance Milestones</span>
                <span className="text-amber-300 font-bold">Up to 500,000 SOV</span>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-black/60 border border-amber-500/30 text-center">
              <span className="text-[9px] font-mono text-amber-200">
                Get your invite link in <strong className="text-white">INVITE FRIENDS</strong>!
              </span>
            </div>
          </div>
        </div>
      )
    }
  ];

  const current = slides[currentSlide];
  const isFinalSlide = currentSlide === slides.length - 1;

  const handleNext = () => {
    triggerHaptic();
    if (isFinalSlide) {
      onClose();
    } else {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    triggerHaptic();
    setCurrentSlide(prev => Math.max(0, prev - 1));
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/90 backdrop-blur-xl select-none overflow-y-auto">
      {/* Monolithic Cinematic Card Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="relative w-full max-w-md bg-[#0a0808] border border-[#d4af37]/40 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_30px_rgba(212,175,55,0.2)] overflow-hidden flex flex-col my-auto max-h-[92vh]"
      >
        {/* Top Story Progress Bars (6 Segments) */}
        <div className="px-4 pt-4 pb-2 flex items-center gap-1.5 z-20 shrink-0">
          {slides.map((_, idx) => (
            <div
              key={idx}
              onClick={() => {
                setCurrentSlide(idx);
                triggerHaptic();
              }}
              className="h-1 flex-1 rounded-full overflow-hidden bg-white/10 cursor-pointer transition-all"
            >
              <div
                className={`h-full transition-all duration-300 ${
                  idx < currentSlide
                    ? 'w-full bg-amber-400'
                    : idx === currentSlide
                    ? 'w-full bg-gradient-to-r from-amber-400 to-amber-200 shadow-[0_0_8px_rgba(251,191,36,0.9)]'
                    : 'w-0'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Header Bar with Step Tag & Skip Button */}
        <div className="px-5 py-1 flex items-center justify-between z-20 shrink-0">
          <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-amber-400/90 font-bold">
            {current.tag} • {current.id}/6
          </span>
          <button
            onClick={onClose}
            className="text-[10px] font-mono uppercase text-zinc-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 px-2 py-0.5 rounded-full hover:bg-white/10"
          >
            <span>Skip</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Upper Half: Visual Cinematic Display */}
        <div className="relative h-[220px] sm:h-[250px] w-full overflow-hidden shrink-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full"
            >
              {current.visual}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Lower Half: Dark Glass Description Panel */}
        <div className="flex-1 p-5 sm:p-6 bg-gradient-to-b from-[#141113] via-[#0d0a0b] to-black border-t border-white/5 flex flex-col justify-between space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-2"
            >
              <h2 className="text-xl sm:text-2xl font-display font-black text-[#ebd09b] tracking-wider uppercase text-shadow-sm">
                {current.title}
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-zinc-200 leading-snug">
                {current.headline}
              </p>
              <p className="text-[11px] sm:text-xs text-zinc-400 font-sans leading-relaxed">
                {current.description}
              </p>

              {current.highlightText && (
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 font-mono text-[9.5px] font-bold">
                    <span>⚡</span>
                    <span>{current.highlightText}</span>
                  </span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Action Buttons Row */}
          <div className="pt-2 flex items-center gap-3">
            {currentSlide > 0 && (
              <button
                onClick={handlePrev}
                className="py-3.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-mono font-bold flex items-center justify-center cursor-pointer active:scale-95 transition-all border border-white/10"
                title="Previous Slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleNext}
              className={`flex-1 py-3.5 sm:py-4 px-4 rounded-xl font-display font-black text-xs sm:text-sm tracking-[0.2em] uppercase flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-all shadow-lg border ${
                isFinalSlide
                  ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black border-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.5)]'
                  : 'bg-gradient-to-r from-[#b3894a] via-[#f3d38c] to-[#b3894a] hover:from-[#c59a58] hover:via-[#fae1a2] hover:to-[#c59a58] text-[#1a0f05] border-[#ebd09b]/70 shadow-[0_0_20px_rgba(212,175,55,0.3)]'
              }`}
            >
              <span>{isFinalSlide ? 'ENTER THE VOID' : 'CONTINUE'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
