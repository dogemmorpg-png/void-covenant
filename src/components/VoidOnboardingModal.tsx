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
      description: 'The battlefield features 5 mirror slots on each side. Your minion attacks the enemy card directly opposite in the same slot. If that slot is vacant, all attack damage strikes the opposing Hero directly! Reduce enemy HP to 0 to claim victory.',
      highlightText: 'Empty Opposite Slot = Direct Hero Damage',
      visual: (
        <div className="w-full max-w-[320px] space-y-2 relative z-10 py-1">
          {/* Enemy Frontline */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-rose-400 px-1">
              <span>ENEMY FRONTLINE</span>
              <span className="text-zinc-300">HP: 100</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map((slot) => (
                <div
                  key={slot}
                  className={`aspect-[3/4] rounded-xl border flex flex-col items-center justify-center relative transition-all ${
                    slot === 3
                      ? 'border-rose-500/90 bg-rose-950/50 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                      : 'border-zinc-800 bg-black/60'
                  }`}
                >
                  <span className="text-[9px] font-mono text-zinc-400 font-bold">#{slot}</span>
                  <div className="w-6 h-6 rounded-lg bg-black/70 border border-rose-500/40 flex items-center justify-center mt-0.5 overflow-hidden p-0.5">
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
            <div className="flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 font-mono text-[9px] font-bold shadow-sm">
              <img src="/icons/gothic_attack.webp" alt="Attack" className="w-3 h-3 object-contain" />
              <span>MIRROR DUEL (OPPOSITE SLOT)</span>
              <img src="/icons/gothic_attack.webp" alt="Attack" className="w-3 h-3 object-contain" />
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
          </div>

          {/* Player Frontline */}
          <div className="space-y-1">
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map((slot) => (
                <div
                  key={slot}
                  className={`aspect-[3/4] rounded-xl border flex flex-col items-center justify-center relative transition-all ${
                    slot === 3
                      ? 'border-cyan-400 bg-cyan-950/50 shadow-[0_0_12px_rgba(34,211,238,0.5)] ring-1 ring-cyan-400/60'
                      : 'border-cyan-900/50 bg-cyan-950/20'
                  }`}
                >
                  <div className="w-6 h-6 rounded-lg bg-black/70 border border-cyan-400/40 flex items-center justify-center mb-0.5 overflow-hidden p-0.5">
                    <img src="/avatars/knight.webp" alt="Hero minion" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-[9px] font-mono text-cyan-300 font-bold">#{slot}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-cyan-400 px-1">
              <span>YOUR BATTLE LINE</span>
              <span className="text-zinc-300">MANA EXPANDS EACH TURN</span>
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
        <div className="flex items-center justify-center gap-4 py-1">
          {/* Card Presentation */}
          <div className="relative w-36 sm:w-40 aspect-[5/7] rounded-2xl border-2 border-amber-500/80 bg-gradient-to-b from-[#1c1427] via-[#100c18] to-black p-2 flex flex-col justify-between shadow-[0_0_25px_rgba(168,85,247,0.4)]">
            <div className="flex items-center justify-between">
              <div className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-400 flex items-center justify-center shadow-sm">
                <span className="text-white text-[10px] font-black font-mono">2</span>
              </div>
              <span className="text-[10px] font-display font-black text-amber-200 tracking-wider uppercase">
                ABYSSAL REAPER
              </span>
              <span className="text-[9px] font-mono text-purple-300 font-bold">GOLD</span>
            </div>

            <div className="relative flex-1 my-1.5 rounded-xl overflow-hidden border border-purple-500/40 bg-black/70 flex items-center justify-center">
              <img 
                src="/cards/abyss_reaper.webp" 
                alt="Reaper" 
                className="w-full h-full object-cover brightness-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/avatars/knight.webp';
                }}
              />
            </div>

            {/* Attack, Delay, Health Tokens */}
            <div className="grid grid-cols-3 gap-1 pt-0.5">
              <div className="flex items-center justify-center gap-1 py-1 rounded-lg bg-red-950/90 border border-red-500/50">
                <img src="/icons/gothic_attack.webp" alt="Attack" className="w-3.5 h-3.5 object-contain" />
                <span className="text-white text-xs font-black font-mono">14</span>
              </div>

              <div className="flex items-center justify-center gap-1 py-1 rounded-lg bg-amber-950 border border-amber-400/80 shadow-[0_0_8px_rgba(245,158,11,0.6)]">
                <img src="/icons/gothic_hourglass.webp" alt="Delay" className="w-3.5 h-3.5 object-contain" />
                <span className="text-amber-300 text-xs font-black font-mono">1</span>
              </div>

              <div className="flex items-center justify-center gap-1 py-1 rounded-lg bg-emerald-950/90 border border-emerald-500/50">
                <img src="/icons/gothic_health.webp" alt="Health" className="w-3.5 h-3.5 object-contain" />
                <span className="text-white text-xs font-black font-mono">22</span>
              </div>
            </div>
          </div>

          {/* Defense Badges Column */}
          <div className="flex flex-col gap-2">
            <div className="p-2.5 rounded-xl bg-sky-950/50 border border-sky-500/40 flex items-center gap-2.5 max-w-[150px]">
              <img src="/icons/gothic_armor.webp" alt="Armor" className="w-7 h-7 object-contain shrink-0" />
              <div>
                <span className="text-xs font-mono font-bold text-sky-300 block">ARMOR</span>
                <span className="text-[10px] font-mono text-zinc-300 block">Absorbs hits</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-950/50 border border-amber-500/40 flex items-center gap-2.5 max-w-[150px]">
              <div className="w-7 h-7 rounded-lg bg-amber-900/60 border border-amber-400/60 flex items-center justify-center shrink-0">
                <span className="text-amber-300 text-xs font-bold font-mono">100%</span>
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-amber-300 block">BARRIER</span>
                <span className="text-[10px] font-mono text-zinc-300 block">Negates 1 hit</span>
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
        <div className="w-full max-w-[320px] grid grid-cols-2 gap-2.5 py-1">
          <div className="p-2.5 rounded-2xl bg-purple-950/50 border border-purple-500/40 flex items-center gap-2.5">
            <img src="/icons/icon_hex.webp" alt="Hex" className="w-8 h-8 object-contain shrink-0 drop-shadow-[0_0_8px_rgba(168,85,247,0.7)]" />
            <div>
              <span className="text-xs font-mono font-bold text-purple-300 block">HEX</span>
              <span className="text-[10px] font-mono text-zinc-200 block mt-0.5">Amps damage</span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-red-950/50 border border-red-500/40 flex items-center gap-2.5">
            <img src="/icons/icon_vampirism.webp" alt="Vampirism" className="w-8 h-8 object-contain shrink-0 drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
            <div>
              <span className="text-xs font-mono font-bold text-red-300 block">VAMPIRISM</span>
              <span className="text-[10px] font-mono text-zinc-200 block mt-0.5">Heals Hero</span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 flex items-center gap-2.5">
            <img src="/icons/icon_plague.webp" alt="Plague" className="w-8 h-8 object-contain shrink-0 drop-shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
            <div>
              <span className="text-xs font-mono font-bold text-emerald-300 block">PLAGUE</span>
              <span className="text-[10px] font-mono text-zinc-200 block mt-0.5">Poison damage</span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-amber-950/50 border border-amber-500/40 flex items-center gap-2.5">
            <img src="/icons/icon_sacrifice.webp" alt="Sacrifice" className="w-8 h-8 object-contain shrink-0 drop-shadow-[0_0_8px_rgba(245,158,11,0.7)]" />
            <div>
              <span className="text-xs font-mono font-bold text-amber-300 block">SACRIFICE</span>
              <span className="text-[10px] font-mono text-zinc-200 block mt-0.5">Devours ally</span>
            </div>
          </div>
        </div>
      )
    },

    // ----------------------------------------------------
    // SLIDE 4: HERO STANCES & TALENTS
    // ----------------------------------------------------
    {
      id: 4,
      tag: 'COMMANDER ARTS',
      title: 'STANCES & TALENTS',
      headline: 'Your Lord’s stance has a chance to trigger each round.',
      description: 'In combat, your Lord commands an active Stance with a chance to trigger each turn: Void Strike unleashes direct damage and siphon; Blood Aura heals the lowest-HP minion and purges Hex; Warlord’s Cry grants Attack and Armor. Allocate Talent Points in the TALENTS tab to empower them!',
      highlightText: 'Void Strike • Blood Aura • Warlord’s Cry',
      visual: (
        <div className="w-full max-w-[320px] flex items-center justify-between gap-2 py-1">
          {/* Void Strike */}
          <div className="flex-1 p-2 rounded-2xl bg-purple-950/40 border border-purple-500/40 flex flex-col items-center text-center">
            <img src="/icons/void_strike_fx.webp" alt="Void Strike" className="w-12 h-12 object-contain rounded-xl drop-shadow-[0_0_10px_rgba(168,85,247,0.7)] mb-1" />
            <span className="text-[11px] font-mono font-bold text-purple-300 block">VOID STRIKE</span>
            <span className="text-[9.5px] font-mono text-zinc-300 mt-0.5">Damage & Leech</span>
          </div>

          {/* Blood Aura */}
          <div className="flex-1 p-2 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex flex-col items-center text-center">
            <img src="/icons/blood_aura_fx.webp" alt="Blood Aura" className="w-12 h-12 object-contain rounded-xl drop-shadow-[0_0_10px_rgba(244,63,94,0.7)] mb-1" />
            <span className="text-[11px] font-mono font-bold text-rose-300 block">BLOOD AURA</span>
            <span className="text-[9.5px] font-mono text-zinc-300 mt-0.5">Heal & Cleanse</span>
          </div>

          {/* Warlord's Cry */}
          <div className="flex-1 p-2 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex flex-col items-center text-center">
            <img src="/icons/warlord_cry_fx.webp" alt="Warlord Cry" className="w-12 h-12 object-contain rounded-xl drop-shadow-[0_0_10px_rgba(245,158,11,0.7)] mb-1" />
            <span className="text-[11px] font-mono font-bold text-amber-300 block">WARLORD</span>
            <span className="text-[9.5px] font-mono text-zinc-300 mt-0.5">ATK & Armor</span>
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
      title: 'THE CAMPAIGN & SWEEP',
      headline: '10 cards in deck. Bosses every 10 floors.',
      description: 'Your Combat Deck must hold exactly 10 cards to fight. Battles consume PvE Energy, which recharges over time. Bosses await every 10 floors with first-clear bounties! Clear any floor with 3 Stars to unlock 1-click Instant Sweeps.',
      highlightText: '10 Cards in Deck • Bosses on Floor 10, 20, 30... • Instant Sweep',
      visual: (
        <div className="w-full max-w-[320px] flex items-center justify-between gap-2.5 py-1">
          {/* Boss Encounter */}
          <div className="flex-1 p-2.5 rounded-2xl bg-red-950/50 border border-red-500/50 flex flex-col items-center text-center">
            <img src="/icons/icon_boss.webp" alt="Boss" className="w-12 h-12 object-contain drop-shadow-[0_0_10px_rgba(239,68,68,0.7)] mb-1" />
            <span className="text-[11px] font-mono font-bold text-red-400 block">FLOOR 10 • 20 • 30</span>
            <span className="text-[9.5px] font-mono text-zinc-200 mt-0.5">Boss Bounties</span>
          </div>

          {/* PvE Energy */}
          <div className="flex-1 p-2.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex flex-col items-center text-center">
            <img src="/icons/icon_energy.webp" alt="Energy" className="w-12 h-12 object-contain drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] mb-1" />
            <span className="text-[11px] font-mono font-bold text-amber-300 block">PvE ENERGY</span>
            <span className="text-[9.5px] font-mono text-zinc-200 mt-0.5">Recharges over time</span>
          </div>

          {/* 3-Star Sweep */}
          <div className="flex-1 p-2.5 rounded-2xl bg-yellow-950/40 border border-yellow-500/40 flex flex-col items-center text-center">
            <img src="/icons/icon_exp.webp" alt="Sweep" className="w-12 h-12 object-contain drop-shadow-[0_0_8px_rgba(234,179,8,0.5)] mb-1" />
            <span className="text-[11px] font-mono font-bold text-yellow-300 block">3-STAR SWEEP</span>
            <span className="text-[9.5px] font-mono text-zinc-200 mt-0.5">Instant 1-click loot</span>
          </div>
        </div>
      )
    },

    // ----------------------------------------------------
    // SLIDE 6: THE ARENA & LEAGUES
    // ----------------------------------------------------
    {
      id: 6,
      tag: 'GLADIATORIAL COMBAT',
      title: 'THE PVP ARENA & LEAGUES',
      headline: 'Duel summoners, climb 12 Leagues, and earn Sovereigns.',
      description: 'Spend Arena Tickets to battle real summoners. Pass holders earn Blood Sovereigns for every win! Earn Crowns to climb from Bronze up through Master and Void Overlord to Divine. Peace Shields (3h, 6h, 12h) protect your rating from attacks while offline.',
      highlightText: 'Sovereigns Paid Per Win • 12 Leagues • Peace Shields',
      visual: (
        <div className="w-full max-w-[320px] flex items-center justify-between gap-2.5 py-1">
          {/* League Crowns */}
          <div className="flex-1 p-2.5 rounded-2xl bg-amber-950/40 border border-amber-500/50 flex flex-col items-center text-center">
            <img src="/icons/crown.png" alt="Crowns" className="w-11 h-11 object-contain drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] mb-1" />
            <span className="text-[11px] font-mono font-bold text-amber-300 block">12 LEAGUES</span>
            <span className="text-[9.5px] font-mono text-zinc-200 mt-0.5">Bronze to Divine</span>
          </div>

          {/* Per-Win Bounty */}
          <div className="flex-1 p-2.5 rounded-2xl bg-red-950/40 border border-red-500/50 flex flex-col items-center text-center">
            <img src="/icons/icon_sovereign.webp" alt="SOV" className="w-11 h-11 object-contain drop-shadow-[0_0_8px_rgba(239,68,68,0.7)] mb-1" />
            <span className="text-[11px] font-mono font-bold text-red-300 block">+1 TO +2 SOV</span>
            <span className="text-[9.5px] font-mono text-zinc-200 mt-0.5">Paid Every Win</span>
          </div>

          {/* Peace Shields */}
          <div className="flex-1 p-2.5 rounded-2xl bg-sky-950/40 border border-sky-500/40 flex flex-col items-center text-center">
            <img src="/icons/gothic_armor.webp" alt="Armor" className="w-11 h-11 object-contain drop-shadow-[0_0_8px_rgba(56,189,248,0.5)] mb-1" />
            <span className="text-[11px] font-mono font-bold text-sky-300 block">PEACE SHIELDS</span>
            <span className="text-[9.5px] font-mono text-zinc-200 mt-0.5">3h, 6h, 12h Offline</span>
          </div>
        </div>
      )
    },

    // ----------------------------------------------------
    // SLIDE 7: 4 REALM CURRENCIES
    // ----------------------------------------------------
    {
      id: 7,
      tag: 'TREASURY ASSETS',
      title: '4 REALM CURRENCIES',
      headline: 'Gold, Shards, Shadow Dust & Blood Sovereigns.',
      description: 'Gold: earned in battles, buys card booster packs in the shop. Dark Shards: premium crystals for Gacha summons, energy refills, & passes. Shadow Dust: disenchant duplicate cards to ascend cards up to Divine Tier! Blood Sovereigns: convertible cryptocurrency (100 SOV = $1.00 USDT).',
      highlightText: 'Gold • Dark Shards • Shadow Dust • Blood Sovereigns',
      visual: (
        <div className="w-full max-w-[320px] grid grid-cols-2 gap-2.5 py-1">
          <div className="p-2.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center gap-2.5">
            <img src="/icons/icon_gold.webp" alt="Gold" className="w-8 h-8 object-contain shrink-0" />
            <div>
              <span className="text-xs font-mono font-bold text-amber-300 block">GOLD</span>
              <span className="text-[10px] font-mono text-zinc-200 block mt-0.5">Card Booster Packs</span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-purple-950/40 border border-purple-500/40 flex items-center gap-2.5">
            <img src="/icons/icon_shards.webp" alt="Dark Shards" className="w-8 h-8 object-contain shrink-0" />
            <div>
              <span className="text-xs font-mono font-bold text-purple-300 block">DARK SHARDS</span>
              <span className="text-[10px] font-mono text-zinc-200 block mt-0.5">Gacha & Energy</span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-teal-950/40 border border-teal-500/40 flex items-center gap-2.5">
            <img src="/icons/icon_dust.webp" alt="Shadow Dust" className="w-8 h-8 object-contain shrink-0" />
            <div>
              <span className="text-xs font-mono font-bold text-teal-300 block">SHADOW DUST</span>
              <span className="text-[10px] font-mono text-zinc-200 block mt-0.5">Tier Ascension</span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-red-950/50 border border-red-500/60 flex items-center gap-2.5 shadow-[0_0_12px_rgba(239,68,68,0.3)]">
            <img src="/icons/icon_sovereign.webp" alt="Blood Sovereigns" className="w-8 h-8 object-contain shrink-0" />
            <div>
              <span className="text-xs font-mono font-bold text-red-300 block">SOVEREIGNS</span>
              <span className="text-[10px] font-mono text-zinc-100 block mt-0.5">100 SOV = $1.00</span>
            </div>
          </div>
        </div>
      )
    },

    // ----------------------------------------------------
    // SLIDE 8: ALLIANCE & BANK WITHDRAWALS
    // ----------------------------------------------------
    {
      id: 8,
      tag: 'ALLIANCE & WITHDRAWALS',
      title: 'ALLIANCE & WITHDRAWALS',
      headline: 'Earn 15% from allies’ battle wins. Withdraw to wallet.',
      description: 'Share your invite link to build an Alliance. Receive an instant bounty (+300 to +800 SOV) whenever an ally activates a Pass, plus 15% of all Blood Sovereigns they win in Arena and League! Reach milestone goals for up to 500,000 SOV. Withdraw your earnings anytime in the Bank.',
      highlightText: '+300 / +800 SOV Pass Bounty • 15% Battle Share • On-Chain Payouts',
      visual: (
        <div className="w-full max-w-[320px] flex items-center justify-between gap-2.5 py-1">
          {/* Pass Bounty */}
          <div className="flex-1 p-2.5 rounded-2xl bg-amber-950/40 border border-amber-500/50 flex flex-col items-center text-center">
            <img src="/icons/icon_pass.webp" alt="Pass Bounty" className="w-11 h-11 object-contain drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] mb-1" />
            <span className="text-[11px] font-mono font-bold text-amber-300 block">PASS BOUNTY</span>
            <span className="text-[9.5px] font-mono text-zinc-200 mt-0.5">+300 / +800 SOV</span>
          </div>

          {/* 15% Battle Share */}
          <div className="flex-1 p-2.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 flex flex-col items-center text-center">
            <img src="/icons/referral_seal.png" alt="Alliance Share" className="w-11 h-11 object-contain drop-shadow-[0_0_8px_rgba(16,185,129,0.6)] mb-1" />
            <span className="text-[11px] font-mono font-bold text-emerald-300 block">15% SHARE</span>
            <span className="text-[9.5px] font-mono text-zinc-200 mt-0.5">Arena & League Wins</span>
          </div>

          {/* Real On-Chain Withdrawal */}
          <div className="flex-1 p-2.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/50 flex flex-col items-center text-center">
            <img src="/icons/icon_sovereign.webp" alt="Withdrawal" className="w-11 h-11 object-contain drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] mb-1" />
            <span className="text-[11px] font-mono font-bold text-cyan-300 block">WITHDRAW</span>
            <span className="text-[9.5px] font-mono text-zinc-200 mt-0.5">USDT/TON/SOL</span>
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
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-xl select-none overflow-hidden">
      {/* Monolithic Cinematic Card Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative w-full max-w-md bg-[#0a0808] border border-[#d4af37]/40 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_30px_rgba(212,175,55,0.2)] overflow-hidden flex flex-col h-auto max-h-[94vh]"
      >
        {/* Top Story Progress Bars (8 Segments) */}
        <div className="px-4 pt-3 pb-1 flex items-center gap-1 z-20 shrink-0">
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
        <div className="px-4 py-1 flex items-center justify-between z-20 shrink-0">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-400/90 font-bold">
            {current.tag} • {current.id}/8
          </span>
          <button
            onClick={onClose}
            className="text-xs font-mono uppercase text-zinc-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 px-2.5 py-0.5 rounded-full hover:bg-white/10"
          >
            <span>Skip</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Upper Half: Visual Graphic Showcase (Height-constrained, zero overflow) */}
        <div className="relative flex-1 min-h-[170px] max-h-[220px] w-full overflow-hidden shrink-0 flex items-center justify-center px-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              className="w-full flex items-center justify-center"
            >
              {current.visual}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Lower Half: Dark Glass Description Panel */}
        <div className="p-4 sm:p-5 bg-gradient-to-b from-[#141113] via-[#0d0a0b] to-black border-t border-white/10 flex flex-col justify-between space-y-3 shrink-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16 }}
              className="space-y-1.5"
            >
              <h2 className="text-lg sm:text-xl font-display font-black text-[#ebd09b] tracking-wider uppercase text-shadow-sm">
                {current.title}
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-zinc-100 leading-snug">
                {current.headline}
              </p>
              <p className="text-[11.5px] sm:text-xs text-zinc-300 font-sans leading-relaxed">
                {current.description}
              </p>

              {current.highlightText && (
                <div className="pt-0.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold">
                    <img src="/icons/gothic_attack.webp" alt="Highlight" className="w-3 h-3 object-contain" />
                    <span>{current.highlightText}</span>
                  </span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Action Buttons Row */}
          <div className="pt-1 flex items-center gap-2.5">
            {currentSlide > 0 && (
              <button
                onClick={handlePrev}
                className="py-3 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-200 text-xs font-mono font-bold flex items-center justify-center cursor-pointer active:scale-95 transition-all border border-white/10"
                title="Previous Slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleNext}
              className={`flex-1 py-3.5 px-4 rounded-xl font-display font-black text-xs sm:text-sm tracking-[0.2em] uppercase flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-all shadow-lg border ${
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
