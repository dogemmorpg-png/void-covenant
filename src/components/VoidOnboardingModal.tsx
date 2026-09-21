import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, X, ArrowRight } from 'lucide-react';

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
        setCurrentSlide(prev => Math.min(7, prev + 1));
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
    // SLIDE 1: 5 LINEAR SLOTS
    // ----------------------------------------------------
    {
      id: 1,
      tag: 'BATTLEFIELD ARCHITECTURE',
      title: '5 LINEAR SLOTS',
      headline: 'Creatures strike strictly straight ahead.',
      description: 'The board has 5 mirror slots on each side. Your minion attacks the enemy card directly opposite in the same slot. If that slot is vacant, all attack damage strikes the opposing Hero directly! Reduce enemy HP to 0 to claim victory.',
      highlightText: 'Empty Opposite Slot = Direct Hero Damage',
      visual: (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-3">
          <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none" />

          <div className="w-full max-w-[340px] space-y-3 relative z-10">
            {/* Enemy Frontline */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-rose-400 px-1">
                <span>ENEMY FRONTLINE</span>
                <span className="text-zinc-300">HP: 100</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((slot) => (
                  <div
                    key={slot}
                    className={`aspect-[3/4] rounded-xl border flex flex-col items-center justify-center relative transition-all ${
                      slot === 3
                        ? 'border-rose-500/90 bg-rose-950/50 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                        : 'border-zinc-800 bg-black/60'
                    }`}
                  >
                    <span className="text-[10px] font-mono text-zinc-400 font-bold">#{slot}</span>
                    <div className="w-7 h-7 rounded-lg bg-black/70 border border-rose-500/40 flex items-center justify-center mt-1 overflow-hidden p-0.5">
                      <img 
                        src={slot === 3 ? '/icons/icon_boss.webp' : '/icons/icon_mob.webp'} 
                        alt="Enemy" 
                        className="w-full h-full object-contain" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Clash Direction Indicator */}
            <div className="flex items-center justify-center gap-2 py-0.5">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
              <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 font-mono text-[10px] font-bold shadow-md">
                <img src="/icons/gothic_attack.webp" alt="Attack" className="w-3.5 h-3.5 object-contain" />
                <span>MIRROR DUEL (OPPOSITE SLOT)</span>
                <img src="/icons/gothic_attack.webp" alt="Attack" className="w-3.5 h-3.5 object-contain" />
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
            </div>

            {/* Player Frontline */}
            <div className="space-y-1.5">
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((slot) => (
                  <div
                    key={slot}
                    className={`aspect-[3/4] rounded-xl border flex flex-col items-center justify-center relative transition-all ${
                      slot === 3
                        ? 'border-cyan-400 bg-cyan-950/50 shadow-[0_0_15px_rgba(34,211,238,0.5)] ring-1 ring-cyan-400/60'
                        : 'border-cyan-900/50 bg-cyan-950/20'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-black/70 border border-cyan-400/40 flex items-center justify-center mb-1 overflow-hidden p-0.5">
                      <img src="/avatars/knight.webp" alt="Hero minion" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[10px] font-mono text-cyan-300 font-bold">#{slot}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs font-mono font-bold text-cyan-400 px-1">
                <span>YOUR BATTLE LINE</span>
                <span className="text-zinc-300">MANA EXPANDS EACH TURN</span>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // ----------------------------------------------------
    // SLIDE 2: DELAY & DEFENSE
    // ----------------------------------------------------
    {
      id: 2,
      tag: 'COMBAT MECHANICS',
      title: 'DELAY & DEFENSE',
      headline: 'Cards awaken over time. Defenses mitigate damage.',
      description: 'Cards do not attack immediately upon summon. Each card has a Delay timer (1–3 turns) that drops by 1 every round. When Delay reaches 0, the card attacks every turn! Armor absorbs incoming damage, while Divine Barrier completely negates 1 full strike.',
      highlightText: 'Delay counts down to 0 • Armor absorbs • Barrier negates 1 hit',
      visual: (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-3">
          <div className="absolute inset-0 bg-radial from-purple-500/10 via-transparent to-transparent pointer-events-none" />

          {/* Large Card with Stat Badges */}
          <div className="relative w-48 sm:w-52 aspect-[5/7] rounded-2xl border-2 border-amber-500/80 bg-gradient-to-b from-[#1c1427] via-[#100c18] to-black p-2.5 flex flex-col justify-between shadow-[0_0_30px_rgba(168,85,247,0.4)]">
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-400 flex items-center justify-center shadow-[0_0_10px_rgba(34,211,238,0.6)]">
                <span className="text-white text-xs font-black font-mono">2</span>
              </div>
              <span className="text-xs font-display font-black text-amber-200 tracking-wider uppercase">
                ABYSSAL REAPER
              </span>
              <span className="text-[10px] font-mono text-purple-300 font-bold">GOLD</span>
            </div>

            <div className="relative flex-1 my-2 rounded-xl overflow-hidden border border-purple-500/40 bg-black/70 flex items-center justify-center">
              <img 
                src="/cards/abyss_reaper.webp" 
                alt="Reaper" 
                className="w-full h-full object-cover brightness-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/avatars/knight.webp';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            </div>

            {/* Attack, Delay, Health Tokens */}
            <div className="grid grid-cols-3 gap-1.5 pt-0.5">
              <div className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-red-950/90 border border-red-500/50 shadow-sm">
                <img src="/icons/gothic_attack.webp" alt="Attack" className="w-4 h-4 object-contain" />
                <span className="text-white text-xs font-black font-mono">14</span>
              </div>

              <div className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-amber-950 border border-amber-400/80 shadow-[0_0_10px_rgba(245,158,11,0.6)]">
                <img src="/icons/gothic_hourglass.webp" alt="Delay" className="w-4 h-4 object-contain" />
                <span className="text-amber-300 text-xs font-black font-mono">1</span>
              </div>

              <div className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-emerald-950/90 border border-emerald-500/50 shadow-sm">
                <img src="/icons/gothic_health.webp" alt="Health" className="w-4 h-4 object-contain" />
                <span className="text-white text-xs font-black font-mono">22</span>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // ----------------------------------------------------
    // SLIDE 3: DARK ARTS (CREATURE SKILLS)
    // ----------------------------------------------------
    {
      id: 3,
      tag: 'CREATURE ABILITIES',
      title: 'DARK ARTS (SKILLS)',
      headline: '4 Curses govern the battlefield.',
      description: 'Hex amps all incoming damage on the target. Vampirism heals your Hero for a portion of damage dealt. Plague inflicts toxic damage at the end of every turn. Sacrifice devours an allied minion on entry to grant massive ATK/HP buffs!',
      highlightText: 'Hex • Vampirism • Plague • Sacrifice',
      visual: (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-3">
          <div className="absolute inset-0 bg-radial from-purple-500/10 via-transparent to-transparent pointer-events-none" />

          <div className="w-full max-w-[340px] grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-purple-950/50 border border-purple-500/40 flex items-center gap-3">
              <img src="/icons/icon_hex.webp" alt="Hex" className="w-9 h-9 object-contain shrink-0 drop-shadow-[0_0_8px_rgba(168,85,247,0.7)]" />
              <div>
                <span className="text-xs font-mono font-bold text-purple-300 block">HEX</span>
                <span className="text-[10px] font-mono text-zinc-200 leading-tight block mt-0.5">Amps incoming damage</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-red-950/50 border border-red-500/40 flex items-center gap-3">
              <img src="/icons/icon_vampirism.webp" alt="Vampirism" className="w-9 h-9 object-contain shrink-0 drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
              <div>
                <span className="text-xs font-mono font-bold text-red-300 block">VAMPIRISM</span>
                <span className="text-[10px] font-mono text-zinc-200 leading-tight block mt-0.5">Heals Hero on attack</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 flex items-center gap-3">
              <img src="/icons/icon_plague.webp" alt="Plague" className="w-9 h-9 object-contain shrink-0 drop-shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
              <div>
                <span className="text-xs font-mono font-bold text-emerald-300 block">PLAGUE</span>
                <span className="text-[10px] font-mono text-zinc-200 leading-tight block mt-0.5">Periodic poison each turn</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-amber-950/50 border border-amber-500/40 flex items-center gap-3">
              <img src="/icons/icon_sacrifice.webp" alt="Sacrifice" className="w-9 h-9 object-contain shrink-0 drop-shadow-[0_0_8px_rgba(245,158,11,0.7)]" />
              <div>
                <span className="text-xs font-mono font-bold text-amber-300 block">SACRIFICE</span>
                <span className="text-[10px] font-mono text-zinc-200 leading-tight block mt-0.5">Devours ally for buffs</span>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // ----------------------------------------------------
    // SLIDE 4: HERO STANCES & TALENT TREES
    // ----------------------------------------------------
    {
      id: 4,
      tag: 'COMMANDER ARTS',
      title: 'STANCES & TALENTS',
      headline: 'Your Lord actively unleashes powers every round.',
      description: 'Your chosen Stance casts at the start of each round: Void Strike unleashes dark magic with life leech; Blood Aura cleanses Hex and heals wounded minions; Warlord’s Cry boosts attack and accelerates hand delays. Allocate Talents to upgrade them!',
      highlightText: 'Void Strike • Blood Aura • Warlord’s Cry',
      visual: (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-3">
          <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none" />

          <div className="w-full max-w-[340px] space-y-2.5">
            <div className="p-2.5 rounded-2xl bg-purple-950/40 border border-purple-500/40 flex items-center gap-3">
              <img src="/icons/void_strike_fx.webp" alt="Void Strike" className="w-9 h-9 object-contain shrink-0 rounded-lg drop-shadow-[0_0_8px_rgba(168,85,247,0.7)]" />
              <div>
                <span className="text-xs font-mono font-bold text-purple-300 block">VOID STRIKE</span>
                <span className="text-[10px] font-mono text-zinc-200 block mt-0.5">Dark lightning strike with life leech to Hero.</span>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex items-center gap-3">
              <img src="/icons/blood_aura_fx.webp" alt="Blood Aura" className="w-9 h-9 object-contain shrink-0 rounded-lg drop-shadow-[0_0_8px_rgba(244,63,94,0.7)]" />
              <div>
                <span className="text-xs font-mono font-bold text-rose-300 block">BLOOD AURA</span>
                <span className="text-[10px] font-mono text-zinc-200 block mt-0.5">Heals lowest HP ally every round & purges Hex.</span>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center gap-3">
              <img src="/icons/warlord_cry_fx.webp" alt="Warlords Cry" className="w-9 h-9 object-contain shrink-0 rounded-lg drop-shadow-[0_0_8px_rgba(245,158,11,0.7)]" />
              <div>
                <span className="text-xs font-mono font-bold text-amber-300 block">WARLORD’S CRY</span>
                <span className="text-[10px] font-mono text-zinc-200 block mt-0.5">Empowers minion ATK & accelerates hand delays.</span>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // ----------------------------------------------------
    // SLIDE 5: CAMPAIGN, ENERGY & SWEEP
    // ----------------------------------------------------
    {
      id: 5,
      tag: 'TOWER EXPEDITIONS',
      title: 'CAMPAIGN & SWEEP',
      headline: '10 cards in deck. Bosses every 10 floors.',
      description: 'Your Combat Deck must hold exactly 10 cards to fight. Battles consume PvE Energy, which recharges over time. Formidable Bosses guard floors 10, 20, 30... yielding first-clear bounties! Clear a floor with 3 Stars to unlock 1-click Instant Sweep.',
      highlightText: 'Exactly 10 cards in Deck • Bosses every 10 floors • Instant Sweep',
      visual: (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-3">
          <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none" />

          <div className="w-full max-w-[340px] space-y-2.5">
            {/* Boss Banner */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-red-950/90 via-black to-red-950/90 border border-red-500/60 flex items-center justify-between shadow-[0_0_20px_rgba(220,38,38,0.3)]">
              <div className="flex items-center gap-3">
                <img src="/icons/icon_boss.webp" alt="Boss" className="w-10 h-10 object-contain shrink-0 drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
                <div>
                  <span className="text-xs font-mono text-red-400 font-bold block">FLOOR 10 • 20 • 30</span>
                  <span className="text-sm font-display font-black text-white tracking-wide">BOSS ENCOUNTERS</span>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-red-500/20 text-red-300 border border-red-500/40 px-2.5 py-1 rounded-full font-bold">
                +SOV BOUNTY
              </span>
            </div>

            {/* PvE Energy & Sweep */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-2xl bg-zinc-900/90 border border-white/15 flex items-center gap-2.5">
                <img src="/icons/icon_energy.webp" alt="Energy" className="w-7 h-7 object-contain shrink-0" />
                <div>
                  <span className="text-[11px] font-mono font-bold text-amber-300 block">PvE ENERGY</span>
                  <span className="text-[10px] font-mono text-zinc-300 block">Recharges over time</span>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-zinc-900/90 border border-white/15 flex items-center gap-2.5">
                <img src="/icons/icon_exp.webp" alt="Sweep" className="w-7 h-7 object-contain shrink-0" />
                <div>
                  <span className="text-[11px] font-mono font-bold text-yellow-300 block">3-STAR SWEEP</span>
                  <span className="text-[10px] font-mono text-zinc-300 block">1-click instant loot</span>
                </div>
              </div>
            </div>

            {/* Deck Requirement */}
            <div className="p-2.5 rounded-2xl bg-black/70 border border-amber-500/40 text-center">
              <span className="text-[11px] font-mono text-amber-200">
                Assemble your 10-card deck inside the <strong className="text-white">CARDS</strong> tab!
              </span>
            </div>
          </div>
        </div>
      )
    },

    // ----------------------------------------------------
    // SLIDE 6: ARENA, PER-ROUND BOUNTIES & SHIELDS
    // ----------------------------------------------------
    {
      id: 6,
      tag: 'GLADIATORIAL COMBAT',
      title: 'ARENA & BOUNTIES',
      headline: 'Earn Sovereigns for every single won duel.',
      description: 'Spend PvP Tickets to duel real players. Pass holders earn Blood Sovereigns for every victory! Climb Leagues for season rewards. Activate Peace Shields (3h, 6h, 12h) to lock your rank from attacks while offline.',
      highlightText: 'Sovereigns Paid Per Win • Peace Shields protect offline',
      visual: (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-3">
          <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none" />

          <div className="w-full max-w-[340px] space-y-2.5">
            {/* Arena Header */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/90 via-black to-amber-950/90 border border-amber-500/60 flex items-center justify-between shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <div className="flex items-center gap-3">
                <img src="/icons/crown.png" alt="Crown" className="w-9 h-9 object-contain shrink-0 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                <div>
                  <span className="text-xs font-mono text-amber-400 font-bold block">LEAGUE RANKINGS</span>
                  <span className="text-sm font-display font-black text-white tracking-wide">BRONZE TO DIVINE</span>
                </div>
              </div>
              <img src="/icons/league_divine.png" alt="Divine" className="w-9 h-9 object-contain shrink-0" />
            </div>

            {/* Per-win Sovereign Bounty */}
            <div className="p-2.5 rounded-2xl bg-gradient-to-r from-red-950/80 to-black border border-red-500/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img src="/icons/icon_sovereign.webp" alt="SOV" className="w-7 h-7 object-contain" />
                <span className="text-[11px] font-mono text-zinc-100 font-bold">
                  Per-Win Bounty: <strong className="text-amber-300">+1 to +2 SOV</strong>
                </span>
              </div>
              <span className="text-[10px] font-mono text-zinc-300">Paid Every Win</span>
            </div>

            {/* Peace Shield */}
            <div className="p-2.5 rounded-2xl bg-sky-950/50 border border-sky-500/50 flex items-center gap-2.5">
              <img src="/icons/gothic_armor.webp" alt="Armor" className="w-6 h-6 object-contain shrink-0" />
              <span className="text-[10.5px] font-mono text-sky-200">
                <strong className="text-white">Peace Shields (3h, 6h, 12h)</strong> protect crowns while offline.
              </span>
            </div>
          </div>
        </div>
      )
    },

    // ----------------------------------------------------
    // SLIDE 7: TREASURES & CURRENCIES
    // ----------------------------------------------------
    {
      id: 7,
      tag: 'TREASURY ASSETS',
      title: '4 REALM CURRENCIES',
      headline: 'Gold, Shards, Shadow Dust & Sovereigns.',
      description: 'Gold buys card packs & basic upgrades. Dark Shards summon Gacha chests and refill energy. Shadow Dust disenchanted from duplicate cards ascends cards up to Divine Tier! Blood Sovereigns are real convertible value (100 SOV = $1.00 USDT).',
      highlightText: '100 Blood Sovereigns = $1.00 USDT',
      visual: (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-3">
          <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none" />

          <div className="w-full max-w-[340px] space-y-2">
            <div className="p-2.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center gap-3">
              <img src="/icons/icon_gold.webp" alt="Gold" className="w-8 h-8 object-contain shrink-0" />
              <div>
                <span className="text-xs font-mono font-bold text-amber-300 block">GOLD</span>
                <span className="text-[10.5px] font-mono text-zinc-200 leading-tight block mt-0.5">From battles; buys card packs & upgrades.</span>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-purple-950/40 border border-purple-500/40 flex items-center gap-3">
              <img src="/icons/icon_shards.webp" alt="Dark Shards" className="w-8 h-8 object-contain shrink-0" />
              <div>
                <span className="text-xs font-mono font-bold text-purple-300 block">DARK SHARDS</span>
                <span className="text-[10.5px] font-mono text-zinc-200 leading-tight block mt-0.5">Gacha summons, energy refills, & passes.</span>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-teal-950/40 border border-teal-500/40 flex items-center gap-3">
              <img src="/icons/icon_dust.webp" alt="Shadow Dust" className="w-8 h-8 object-contain shrink-0" />
              <div>
                <span className="text-xs font-mono font-bold text-teal-300 block">SHADOW DUST</span>
                <span className="text-[10.5px] font-mono text-zinc-200 leading-tight block mt-0.5">Disenchant duplicates to ascend cards to Divine!</span>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-red-950/50 border border-red-500/60 flex items-center gap-3 shadow-[0_0_15px_rgba(239,68,68,0.25)]">
              <img src="/icons/icon_sovereign.webp" alt="Blood Sovereigns" className="w-8 h-8 object-contain shrink-0" />
              <div>
                <span className="text-xs font-mono font-bold text-red-300 block">BLOOD SOVEREIGNS (100 = $1 USDT)</span>
                <span className="text-[10.5px] font-mono text-zinc-100 leading-tight block mt-0.5">Real convertible currency earned in PvP & Alliance.</span>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // ----------------------------------------------------
    // SLIDE 8: ALLIANCE, BANK & REAL WITHDRAWALS
    // ----------------------------------------------------
    {
      id: 8,
      tag: 'ALLIANCE & WITHDRAWALS',
      title: 'ALLIANCE & BANK',
      headline: 'Earn 15% from allies’ battle wins. Withdraw to wallet.',
      description: 'Receive 15% lifetime commissions on all Blood Sovereigns your recruited allies win in the Arena and League (no cuts from purchases), plus up to 500,000 SOV milestone bounties! All earnings store in the Bank for direct withdrawal to USDT, TON, or Solana.',
      highlightText: '15% Share on battle wins • Direct on-chain withdrawal',
      visual: (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-3">
          <div className="absolute inset-0 bg-radial from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

          <div className="w-full max-w-[340px] space-y-2.5">
            {/* 15% Battle Share Banner */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/90 via-black to-emerald-950/90 border border-amber-500/50 text-center space-y-1 shadow-lg">
              <div className="flex items-center justify-center gap-2">
                <img src="/icons/icon_pass.webp" alt="Alliance Pass" className="w-5 h-5 object-contain" />
                <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-widest">
                  15% BATTLE SHARE & BANK
                </span>
              </div>
              <div className="text-2xl font-display font-black text-white tracking-wider text-emerald-300">
                100 SOV = $1.00 USDT
              </div>
              <span className="text-[10.5px] font-mono text-zinc-200 block">
                15% from allies' Arena & League wins • Withdrawable
              </span>
            </div>

            {/* Milestones & Payout Networks */}
            <div className="p-2.5 rounded-2xl bg-zinc-900/90 border border-white/15 space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-zinc-300">Alliance Milestones</span>
                <span className="text-amber-300 font-bold">150 to 500,000 SOV</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-300">Supported Networks</span>
                <span className="text-emerald-400 font-bold">USDT / TON / Solana</span>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-black/70 border border-emerald-500/40 text-center">
              <span className="text-[11px] font-mono text-emerald-200">
                Withdraw anytime inside the <strong className="text-white">BANK</strong> tab!
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
        {/* Top Story Progress Bars (8 Segments) */}
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
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-400/90 font-bold">
            {current.tag} • {current.id}/8
          </span>
          <button
            onClick={onClose}
            className="text-xs font-mono uppercase text-zinc-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 px-2.5 py-1 rounded-full hover:bg-white/10"
          >
            <span>Skip</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Upper Half: Visual Cinematic Display */}
        <div className="relative h-[230px] sm:h-[260px] w-full overflow-hidden shrink-0 flex items-center justify-center">
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
        <div className="flex-1 p-5 sm:p-6 bg-gradient-to-b from-[#141113] via-[#0d0a0b] to-black border-t border-white/10 flex flex-col justify-between space-y-4">
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
              <p className="text-xs sm:text-sm font-semibold text-zinc-100 leading-snug">
                {current.headline}
              </p>
              <p className="text-[11.5px] sm:text-xs text-zinc-300 font-sans leading-relaxed">
                {current.description}
              </p>

              {current.highlightText && (
                <div className="pt-1">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-300 font-mono text-[10.5px] font-bold">
                    <img src="/icons/gothic_attack.webp" alt="Highlight" className="w-3.5 h-3.5 object-contain" />
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
                className="py-3.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-200 text-xs font-mono font-bold flex items-center justify-center cursor-pointer active:scale-95 transition-all border border-white/10"
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
