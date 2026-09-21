import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Swords, 
  Shield, 
  Zap, 
  Sparkles, 
  Coins, 
  Trophy, 
  Users, 
  Landmark, 
  CheckCircle2,
  Clock,
  Flame
} from 'lucide-react';

interface VoidGrimoireModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GrimoireChapter {
  id: number;
  romanNumeral: string;
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ReactNode;
  leftPageVisual: React.ReactNode;
  loreQuote: string;
  sections: Array<{
    heading: string;
    description: string;
    tag?: string;
    iconSrc?: string;
  }>;
}

export const VoidGrimoireModal: React.FC<VoidGrimoireModalProps> = ({ isOpen, onClose }) => {
  const [currentChapter, setCurrentChapter] = useState(0);

  // Trigger haptic feedback if running in Telegram Mini App or Web Vibration API
  const triggerHaptic = useCallback(() => {
    try {
      if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.HapticFeedback) {
        (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('light');
      } else if (navigator.vibrate) {
        navigator.vibrate(15);
      }
    } catch (_) {}
  }, []);

  // Keyboard navigation (Left / Right arrow keys, Escape to close)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        setCurrentChapter(prev => Math.min(8, prev + 1));
        triggerHaptic();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setCurrentChapter(prev => Math.max(0, prev - 1));
        triggerHaptic();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, triggerHaptic]);

  if (!isOpen) return null;

  const chapters: GrimoireChapter[] = [
    // ----------------------------------------------------
    // CHAPTER I: THE BATTLEFIELD & LINEAR DUELS
    // ----------------------------------------------------
    {
      id: 1,
      romanNumeral: 'I',
      title: 'The Battlefield & Linear Duels',
      subtitle: 'Board Architecture & Slot Targeting',
      badge: 'COMBAT BASICS',
      icon: <Swords className="w-5 h-5 text-amber-400" />,
      loreQuote: '“The Abyssal Table mirrors the souls of its combatants. Every entity stands face to face with its destiny.”',
      leftPageVisual: (
        <div className="flex flex-col items-center justify-center p-3 sm:p-5 bg-black/50 border border-amber-500/20 rounded-2xl h-full space-y-4">
          <div className="text-[11px] font-mono font-bold text-amber-300 uppercase tracking-widest flex items-center gap-2">
            <Swords className="w-4 h-4 text-amber-400" />
            5 Linear Combat Slots
          </div>

          {/* Opponent Slots */}
          <div className="w-full space-y-1">
            <span className="text-[9px] font-mono text-rose-400 uppercase tracking-wider block text-center">Enemy Frontline</span>
            <div className="grid grid-cols-5 gap-1.5 w-full">
              {[1, 2, 3, 4, 5].map(slot => (
                <div key={slot} className="aspect-[3/4] rounded-lg border border-rose-900/60 bg-rose-950/20 flex flex-col items-center justify-center p-1 relative group">
                  <span className="text-[8px] font-mono text-rose-400/80">Slot {slot}</span>
                  <div className="w-5 h-5 rounded-full bg-rose-900/40 border border-rose-500/30 flex items-center justify-center mt-1">
                    <span className="text-[9px]">💀</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clash Direction Indicator */}
          <div className="flex items-center justify-center gap-2 text-amber-400/80 text-[10px] font-mono py-0.5">
            <span>▲</span>
            <span className="tracking-widest uppercase text-[9px] text-zinc-400">Mirror Duels (Opposite Slot)</span>
            <span>▼</span>
          </div>

          {/* Player Slots */}
          <div className="w-full space-y-1">
            <div className="grid grid-cols-5 gap-1.5 w-full">
              {[1, 2, 3, 4, 5].map(slot => (
                <div key={slot} className="aspect-[3/4] rounded-lg border border-cyan-800/60 bg-cyan-950/20 flex flex-col items-center justify-center p-1 relative">
                  <div className="w-5 h-5 rounded-full bg-cyan-900/40 border border-cyan-500/30 flex items-center justify-center mb-1">
                    <span className="text-[9px]">⚔️</span>
                  </div>
                  <span className="text-[8px] font-mono text-cyan-400/80">Slot {slot}</span>
                </div>
              ))}
            </div>
            <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider block text-center">Your Battle Line</span>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 w-full text-center">
            <p className="text-[10px] text-amber-200/90 font-mono">
              ⚡ Empty opposite slot = <strong className="text-amber-300">Direct Hero Damage</strong>!
            </p>
          </div>
        </div>
      ),
      sections: [
        {
          heading: '5 Mirror Slots',
          description: 'Both summoners command exactly 5 battle slots. When you place a creature, it occupies a designated slot and locks eyes with whatever stands directly across.'
        },
        {
          heading: 'Linear Clash Priority',
          description: 'Creatures strike strictly straight ahead into the opposing card. If the slot opposite your creature is vacant, all of its attack damage is dealt directly to the enemy Lord’s Health.'
        },
        {
          heading: 'Mana Progression',
          description: 'Each turn, your Mana capacity expands and replenishes. Deploying cards from your 3-card active hand consumes Mana indicated on the card crystal.'
        },
        {
          heading: 'Objective of Conquest',
          description: 'Shatter through opposing defenses and deplete the enemy Hero’s Health to 0 to claim absolute victory.'
        }
      ]
    },

    // ----------------------------------------------------
    // CHAPTER II: DELAY TIMER & DEFENSES
    // ----------------------------------------------------
    {
      id: 2,
      romanNumeral: 'II',
      title: 'The Delay Timer & Defenses',
      subtitle: 'Activation Delays, Armor & Divine Wards',
      badge: 'TACTICAL DEFENSE',
      icon: <Shield className="w-5 h-5 text-sky-400" />,
      loreQuote: '“Ancient abominations do not stir in an instant. Time is the currency of cataclysm.”',
      leftPageVisual: (
        <div className="flex flex-col items-center justify-center p-3 sm:p-5 bg-black/50 border border-sky-500/20 rounded-2xl h-full space-y-4">
          <div className="text-[11px] font-mono font-bold text-sky-300 uppercase tracking-widest flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" />
            Defense & Activation Anatomy
          </div>

          <div className="grid grid-cols-3 gap-2.5 w-full">
            {/* Delay Icon */}
            <div className="flex flex-col items-center p-2.5 rounded-xl bg-zinc-900/80 border border-amber-500/30 text-center">
              <img src="/icons/gothic_hourglass.webp" alt="Delay" className="w-10 h-10 object-contain mb-1 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              <span className="text-[10px] font-mono font-bold text-amber-300">DELAY</span>
              <span className="text-[8.5px] font-mono text-zinc-400 mt-0.5">Turns until ready to attack</span>
            </div>

            {/* Armor Icon */}
            <div className="flex flex-col items-center p-2.5 rounded-xl bg-zinc-900/80 border border-sky-500/30 text-center">
              <img src="/icons/gothic_armor.webp" alt="Armor" className="w-10 h-10 object-contain mb-1 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
              <span className="text-[10px] font-mono font-bold text-sky-300">ARMOR</span>
              <span className="text-[8.5px] font-mono text-zinc-400 mt-0.5">Absorbs physical strike damage</span>
            </div>

            {/* Divine Barrier */}
            <div className="flex flex-col items-center p-2.5 rounded-xl bg-zinc-900/80 border border-yellow-400/40 text-center">
              <div className="w-10 h-10 rounded-lg bg-amber-950/60 border border-amber-400 flex items-center justify-center mb-1 shadow-[0_0_12px_rgba(251,191,36,0.5)]">
                <span className="text-xl">🛡️</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-yellow-300">BARRIER</span>
              <span className="text-[8.5px] font-mono text-zinc-400 mt-0.5">Blocks 1 entire incoming hit</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-500/30 w-full text-center space-y-1">
            <p className="text-[10px] text-sky-200 font-mono">
              ⏳ Each round, all Delay counters drop by <strong className="text-white">1</strong>.
            </p>
            <p className="text-[9px] text-zinc-400 font-mono">
              When Delay reaches <strong className="text-amber-400">0</strong>, the creature awakens and strikes every subsequent round!
            </p>
          </div>
        </div>
      ),
      sections: [
        {
          heading: 'The Delay Mechanic (⏳)',
          description: 'Cards do not attack on the turn they are summoned. The hourglass counter represents the turns required for awakening. When Delay reaches 0, the card initiates combat every turn thereafter.'
        },
        {
          heading: 'Armor Plating (🛡️)',
          description: 'Armor directly absorbs incoming damage before creature Health is harmed. Once depleted, the armor shatters and subsequent blows hit Health directly.'
        },
        {
          heading: 'Divine Barrier / Ward (✨)',
          description: 'An ethereal protective seal. Regardless of how massive an incoming strike is, a Barrier completely nullifies that entire first attack and then dissipates.'
        },
        {
          heading: 'Delay Reduction Modifiers',
          description: 'High-tier equipment, specialized set bonuses (such as the Demiurge Set), and Warlord hero cries can shave rounds off card delays, launching lethal surprise assaults.'
        }
      ]
    },

    // ----------------------------------------------------
    // CHAPTER III: DARK ARTS (CREATURE SKILLS)
    // ----------------------------------------------------
    {
      id: 3,
      romanNumeral: 'III',
      title: 'Dark Arts of Creatures',
      subtitle: 'Hex, Vampirism, Plague & Sacrifice',
      badge: 'CREATURE TALENTS',
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      loreQuote: '“Raw steel is brittle. True supremacy in the Covenant lies in the dark curses woven into your minions.”',
      leftPageVisual: (
        <div className="flex flex-col items-center justify-center p-3 sm:p-5 bg-black/50 border border-purple-500/20 rounded-2xl h-full space-y-3">
          <div className="text-[11px] font-mono font-bold text-purple-300 uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            The 4 Abyssal Afflictions
          </div>

          <div className="grid grid-cols-2 gap-2 w-full">
            <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center gap-2.5">
              <img src="/icons/icon_hex.webp" alt="Hex" className="w-8 h-8 object-contain shrink-0 drop-shadow-[0_0_6px_rgba(168,85,247,0.7)]" />
              <div>
                <span className="text-[10px] font-mono font-bold text-purple-300 block">HEX (Сглаз)</span>
                <span className="text-[8px] font-mono text-zinc-400 leading-tight block">Amps all incoming damage</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center gap-2.5">
              <img src="/icons/icon_vampirism.webp" alt="Vampirism" className="w-8 h-8 object-contain shrink-0 drop-shadow-[0_0_6px_rgba(239,68,68,0.7)]" />
              <div>
                <span className="text-[10px] font-mono font-bold text-red-300 block">VAMPIRISM</span>
                <span className="text-[8px] font-mono text-zinc-400 leading-tight block">Leeches dealt dmg to Hero</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-2.5">
              <img src="/icons/icon_plague.webp" alt="Plague" className="w-8 h-8 object-contain shrink-0 drop-shadow-[0_0_6px_rgba(16,185,129,0.7)]" />
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-300 block">PLAGUE (Чума)</span>
                <span className="text-[8px] font-mono text-zinc-400 leading-tight block">Periodic poison each round</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-center gap-2.5">
              <img src="/icons/icon_sacrifice.webp" alt="Sacrifice" className="w-8 h-8 object-contain shrink-0 drop-shadow-[0_0_6px_rgba(245,158,11,0.7)]" />
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-300 block">SACRIFICE</span>
                <span className="text-[8px] font-mono text-zinc-400 leading-tight block">Eats ally for massive buffs</span>
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-white/10 w-full text-center">
            <p className="text-[9.5px] font-mono text-zinc-300">
              Combine <strong className="text-purple-300">Hex</strong> with multi-strike attacks to execute colossal burst damage!
            </p>
          </div>
        </div>
      ),
      sections: [
        {
          heading: '🔮 Hex (Сглаз)',
          description: 'Casts a curse upon the target. Any damage the cursed target suffers from that moment forward is increased by the Hex potency value.'
        },
        {
          heading: '🩸 Vampirism (Вампиризм)',
          description: 'Siphons life directly from flesh. A percentage of the damage this creature inflicts is immediately channeled to heal your Lord’s Health.'
        },
        {
          heading: '☠️ Plague (Чума)',
          description: 'Infects the enemy with virulent spores. At the conclusion of every turn, plagued units suffer persistent toxic damage until they decay.'
        },
        {
          heading: '💀 Sacrifice (Жертва)',
          description: 'Upon entering the battlefield, the minion devours a random allied creature, immediately healing your Hero and permanently gaining massive Attack and Health bonuses!'
        }
      ]
    },

    // ----------------------------------------------------
    // CHAPTER IV: HERO STANCES & TALENT TREES
    // ----------------------------------------------------
    {
      id: 4,
      romanNumeral: 'IV',
      title: 'Hero Stances & Talents',
      subtitle: 'The Lord’s Intervention in Combat',
      badge: 'COMMANDER ARTS',
      icon: <Flame className="w-5 h-5 text-amber-400" />,
      loreQuote: '“A true Sovereign does not idly observe from the dais. The Lord’s aura shapes the tide of war.”',
      leftPageVisual: (
        <div className="flex flex-col items-center justify-center p-3 sm:p-5 bg-black/50 border border-amber-500/20 rounded-2xl h-full space-y-3.5">
          <div className="text-[11px] font-mono font-bold text-amber-300 uppercase tracking-widest flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            3 Active Commander Stances
          </div>

          <div className="w-full space-y-2">
            <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-start gap-3">
              <span className="text-xl">⚡</span>
              <div>
                <span className="text-[10px] font-mono font-bold text-purple-300 block">VOID STRIKE</span>
                <span className="text-[8.5px] font-mono text-zinc-300 block">Hurls lightning each round at enemy units or hero with life leech.</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30 flex items-start gap-3">
              <span className="text-xl">🩸</span>
              <div>
                <span className="text-[10px] font-mono font-bold text-rose-300 block">BLOOD AURA</span>
                <span className="text-[8.5px] font-mono text-zinc-300 block">Regenerates your lowest-HP creature each round and cleanses Hex curses.</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-3">
              <span className="text-xl">🔥</span>
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-300 block">WARLORD’S CRY</span>
                <span className="text-[8.5px] font-mono text-zinc-300 block">Battle roar that empowers all allies with Attack or shaves -1 Delay from cards in hand.</span>
              </div>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-zinc-900/80 border border-white/10 w-full text-center">
            <p className="text-[9px] font-mono text-zinc-400">
              Unlock and allocate <strong className="text-amber-300">Talent Points</strong> in the TALENTS tab to amplify your chosen stance.
            </p>
          </div>
        </div>
      ),
      sections: [
        {
          heading: 'Active Hero Stance',
          description: 'Your Lord commands an active Stance that automatically casts its potent ability at the beginning of each combat round before creatures engage.'
        },
        {
          heading: 'Void Strike (Offense)',
          description: 'Strikes enemy creatures or the opposing hero directly, piercing barriers at higher ranks and leeching stolen vitality back to your health bar.'
        },
        {
          heading: 'Blood Aura (Sustain)',
          description: 'Focuses restorative dark magic onto your most wounded minion, purifying debilitating hexes and preserving your defensive frontline.'
        },
        {
          heading: 'Warlord’s Cry (Tempo & Buffs)',
          description: 'Infuses your minions with aggressive fervor, increasing their Attack damage and accelerating card countdown delays in your active hand.'
        }
      ]
    },

    // ----------------------------------------------------
    // CHAPTER V: CAMPAIGN, ENERGY & SWEEP
    // ----------------------------------------------------
    {
      id: 5,
      romanNumeral: 'V',
      title: 'Campaign, Energy & Sweep',
      subtitle: 'Tower Floors, PvE Energy & Quick Sweep',
      badge: 'EXPEDITIONS',
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      loreQuote: '“Delve into the subterranean spires of the Void. Slay the gatekeepers to unearth lost relics.”',
      leftPageVisual: (
        <div className="flex flex-col items-center justify-center p-3 sm:p-5 bg-black/50 border border-amber-500/20 rounded-2xl h-full space-y-3.5">
          <div className="text-[11px] font-mono font-bold text-amber-300 uppercase tracking-widest flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            Expedition Mechanics
          </div>

          <div className="grid grid-cols-2 gap-2.5 w-full">
            <div className="p-3 rounded-xl bg-zinc-900/90 border border-amber-500/30 flex flex-col items-center text-center">
              <img src="/icons/icon_energy.webp" alt="Energy" className="w-9 h-9 object-contain mb-1" />
              <span className="text-[10px] font-mono font-bold text-amber-300">PvE ENERGY</span>
              <span className="text-[8px] font-mono text-zinc-400 mt-0.5">Required for dungeon runs. Regenerates over time.</span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/90 border border-yellow-500/30 flex flex-col items-center text-center">
              <span className="text-3xl mb-1">⚡⏩</span>
              <span className="text-[10px] font-mono font-bold text-yellow-300">INSTANT SWEEP</span>
              <span className="text-[8px] font-mono text-zinc-400 mt-0.5">3-Star cleared floors can be swept in 1 click!</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30 w-full text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-rose-300 text-[10px] font-mono font-bold">
              <span>👑</span>
              <span>BOSS FLOORS (Every 10 Floors)</span>
            </div>
            <p className="text-[8.5px] font-mono text-zinc-400">
              Floor 10, 20, 30... harbor terrifying Bosses that yield first-clear Blood Sovereigns and rare card chests.
            </p>
          </div>

          <div className="p-2 rounded-xl bg-black/60 border border-white/10 w-full text-center">
            <span className="text-[9px] font-mono text-zinc-400">
              ⚠️ Combat Deck Rule: Exactly <strong className="text-white">10 cards</strong> required in deck.
            </span>
          </div>
        </div>
      ),
      sections: [
        {
          heading: '10-Card Combat Deck',
          description: 'To venture into campaign battles, your Combat Deck must contain exactly 10 cards. Assemble your synergy in the CARDS tab before entering.'
        },
        {
          heading: 'PvE Energy System',
          description: 'Each expedition stage consumes PvE Energy. Energy recharges automatically over time (or instantly via Energy Vault with Dark Shards). Subscription passes provide higher energy caps and faster regen!'
        },
        {
          heading: 'Boss Encounters & First-Clear Bounties',
          description: 'Every 10th floor is guarded by a formidable realm Boss. Defeating milestone bosses yields prestigious first-clear rewards directly in Blood Sovereigns, Gold, and rare equipment.'
        },
        {
          heading: '3-Star Instant Sweep',
          description: 'Master a floor with clean performance to achieve a 3-Star rating. Once perfected, you can instantly Sweep the floor to harvest Gold and Hero EXP without fighting again.'
        }
      ]
    },

    // ----------------------------------------------------
    // CHAPTER VI: THE ARENA & ROUND BOUNTIES
    // ----------------------------------------------------
    {
      id: 6,
      romanNumeral: 'VI',
      title: 'The Arena, Bounties & Shields',
      subtitle: 'PvP Duels, Per-Round Sovereigns & Peace Shields',
      badge: 'GLADIATOR REALM',
      icon: <Trophy className="w-5 h-5 text-amber-400" />,
      loreQuote: '“Test your steel against living summoners. Gold is for peasants; the blood of rivals earns Sovereigns.”',
      leftPageVisual: (
        <div className="flex flex-col items-center justify-center p-3 sm:p-5 bg-black/50 border border-amber-500/20 rounded-2xl h-full space-y-3">
          <div className="text-[11px] font-mono font-bold text-amber-300 uppercase tracking-widest flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            Gladiatorial Economics
          </div>

          <div className="grid grid-cols-2 gap-2 w-full">
            {/* Arena Ticket */}
            <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center gap-2">
              <img src="/icons/ticket.png" alt="Ticket" className="w-8 h-8 object-contain shrink-0" />
              <div>
                <span className="text-[10px] font-mono font-bold text-rose-300 block">ARENA TICKETS</span>
                <span className="text-[8px] font-mono text-zinc-400 leading-tight block">Daily energy + bonus reserve tickets</span>
              </div>
            </div>

            {/* Crowns / LP */}
            <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-center gap-2">
              <img src="/icons/crown.png" alt="Crown" className="w-8 h-8 object-contain shrink-0" />
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-300 block">CROWNS (LP)</span>
                <span className="text-[8px] font-mono text-zinc-400 leading-tight block">Climb from Bronze to Divine Tier</span>
              </div>
            </div>
          </div>

          {/* Per-win Sovereigns Banner */}
          <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-950/60 to-red-950/60 border border-amber-500/40 w-full text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-amber-300 text-[10px] font-mono font-bold">
              <img src="/icons/icon_sovereign.webp" alt="SOV" className="w-4 h-4 object-contain" />
              <span>PER-WIN SOVEREIGN REWARDS</span>
            </div>
            <p className="text-[8.5px] font-mono text-zinc-300">
              Each PvP victory awards real Blood Sovereigns for pass holders (up to 24 SOV daily on Ultra, 10 on Premium).
            </p>
          </div>

          {/* Peace Shield */}
          <div className="p-2 rounded-xl bg-sky-950/40 border border-sky-500/30 w-full text-center flex items-center justify-center gap-2">
            <span className="text-base">🛡️</span>
            <span className="text-[9px] font-mono text-sky-200">
              <strong className="text-white">Peace Shields (3h, 6h, 12h)</strong> protect your rank while offline!
            </span>
          </div>
        </div>
      ),
      sections: [
        {
          heading: 'Arena Tickets & Reserve',
          description: 'Each duel costs 1 Ticket. Your ticket pool consists of daily regenerating tickets plus stacked Bonus Reserve Tickets from mail, battle pass, or shop that never expire.'
        },
        {
          heading: 'Instant Blood Sovereigns per Victory',
          description: 'You do not have to wait for the season to end to get paid! Each winning round in the Arena awards immediate Blood Sovereigns directly into your treasury for active pass subscribers.'
        },
        {
          heading: 'Crowns (LP) & League Tiers',
          description: 'Accumulate Crowns through triumphs to ascend from Bronze into Silver, Gold, Platinum, Diamond, Grandmaster, Void Overlord, and the apex Divine Pantheon.'
        },
        {
          heading: 'Peace Shields (3h / 6h / 12h)',
          description: 'Guard your hard-earned rating! Activate a Peace Shield before logging off to prevent other summoners from attacking your defense line and docking your Crowns.'
        }
      ]
    },

    // ----------------------------------------------------
    // CHAPTER VII: TREASURES & CURRENCIES
    // ----------------------------------------------------
    {
      id: 7,
      romanNumeral: 'VII',
      title: 'Treasures & Currencies of the Void',
      subtitle: 'Gold, Dark Shards, Shadow Dust & Sovereigns',
      badge: 'TREASURY',
      icon: <Coins className="w-5 h-5 text-amber-400" />,
      loreQuote: '“Distinguish between worldly dust and the blood coin of the Void. True power demands both.”',
      leftPageVisual: (
        <div className="flex flex-col items-center justify-center p-3 sm:p-5 bg-black/50 border border-amber-500/20 rounded-2xl h-full space-y-3">
          <div className="text-[11px] font-mono font-bold text-amber-300 uppercase tracking-widest flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            The 4 Realms of Currency
          </div>

          <div className="w-full space-y-2">
            <div className="p-2 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-center gap-3">
              <img src="/icons/icon_gold.webp" alt="Gold" className="w-8 h-8 object-contain shrink-0" />
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-300 block">GOLD (Золото)</span>
                <span className="text-[8px] font-mono text-zinc-400 leading-tight block">Earned from all fights. Buys card packs and upgrades.</span>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-center gap-3">
              <img src="/icons/icon_shards.webp" alt="Shards" className="w-8 h-8 object-contain shrink-0" />
              <div>
                <span className="text-[10px] font-mono font-bold text-purple-300 block">DARK SHARDS (Осколки)</span>
                <span className="text-[8px] font-mono text-zinc-400 leading-tight block">Premium crystals for Gacha summons, energy refills, & passes.</span>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-teal-950/30 border border-teal-500/30 flex items-center gap-3">
              <img src="/icons/icon_dust.webp" alt="Dust" className="w-8 h-8 object-contain shrink-0" />
              <div>
                <span className="text-[10px] font-mono font-bold text-teal-300 block">SHADOW DUST (Пыль)</span>
                <span className="text-[8px] font-mono text-zinc-400 leading-tight block">Disenchant duplicates to ascend card tiers to Divine!</span>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-red-950/40 border border-red-500/50 flex items-center gap-3 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <img src="/icons/icon_sovereign.webp" alt="SOV" className="w-8 h-8 object-contain shrink-0 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
              <div>
                <span className="text-[10px] font-mono font-bold text-red-300 block">BLOOD SOVEREIGNS (100 = $1 USDT)</span>
                <span className="text-[8px] font-mono text-zinc-300 leading-tight block">Convertible cryptocurrency earned in PvP, Campaign & Alliance.</span>
              </div>
            </div>
          </div>
        </div>
      ),
      sections: [
        {
          heading: '🟡 Gold (Soft Currency)',
          description: 'The everyday currency minted through campaign encounters and Arena duels. Used for purchasing card boosters in the shop and upgrading cards.'
        },
        {
          heading: '💠 Dark Shards (Premium Currency)',
          description: 'Luminous void gems used to summon legendary card chests in the Gacha Shrine, instantly replenish PvE energy, and acquire high-tier gear.'
        },
        {
          heading: '✨ Shadow Dust (Crafting & Ascension)',
          description: 'Obtained by disenchanting surplus card duplicates. Fuel for Tier Ascension: elevate your cards from Bronze to Silver, Gold, Legendary, and Divine.'
        },
        {
          heading: '🩸 Blood Sovereigns (Hard Crypto Asset)',
          description: 'The apex prize of Void Covenant with a pegged value of 100 SOV = $1.00 USD. Earned through glorious combat and fully withdrawable.'
        }
      ]
    },

    // ----------------------------------------------------
    // CHAPTER VIII: ALLIANCE & BROTHERHOOD
    // ----------------------------------------------------
    {
      id: 8,
      romanNumeral: 'VIII',
      title: 'The Alliance & Brotherhood',
      subtitle: 'Referral Link, 15% Battle Share & Milestones',
      badge: 'ALLIANCE NETWORK',
      icon: <Users className="w-5 h-5 text-amber-400" />,
      loreQuote: '“A solitary blade is easily shattered. A dark covenant of sworn allies conquers kingdoms.”',
      leftPageVisual: (
        <div className="flex flex-col items-center justify-center p-3 sm:p-5 bg-black/50 border border-amber-500/20 rounded-2xl h-full space-y-3">
          <div className="text-[11px] font-mono font-bold text-amber-300 uppercase tracking-widest flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            Syndicate Revenue Architecture
          </div>

          <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/40 to-black border border-amber-500/30 w-full text-center space-y-1">
            <span className="text-xl font-display font-black text-amber-300 tracking-wider">15% LIFETIME SHARE</span>
            <p className="text-[8.5px] font-mono text-zinc-300">
              Receive 15% of all Blood Sovereigns won in the Arena and League by your recruited allies!
            </p>
          </div>

          <div className="w-full space-y-1.5">
            <div className="p-2 rounded-lg bg-zinc-900/80 border border-white/10 flex items-center justify-between text-[9px] font-mono">
              <span className="text-zinc-300">🎁 Pass Activation Bounty</span>
              <span className="text-amber-300 font-bold">+SOV Bounty Per Pass</span>
            </div>
            <div className="p-2 rounded-lg bg-zinc-900/80 border border-white/10 flex items-center justify-between text-[9px] font-mono">
              <span className="text-zinc-300">🏆 9 Alliance Milestones</span>
              <span className="text-amber-300 font-bold">150 to 500,000 SOV</span>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-black/60 border border-amber-500/30 w-full text-center">
            <p className="text-[9px] font-mono text-amber-200/90">
              Share your personal link to forge an army and generate passive daily Sovereign yields.
            </p>
          </div>
        </div>
      ),
      sections: [
        {
          heading: 'Personal Recruitment Link',
          description: 'Share your unique invite link with companions across Telegram or the web. Every warrior who enters the Void through your link is permanently bound to your Alliance.'
        },
        {
          heading: '15% Arena & League Battle Share',
          description: 'Whenever your sworn allies duel on the Arena or receive seasonal League payouts, 15% of their won Blood Sovereigns is automatically credited to your treasury.'
        },
        {
          heading: 'Instant Pass Bounties',
          description: 'Receive an immediate Blood Sovereign bounty when any ally activates a Premium Pass or Ultra Pass.'
        },
        {
          heading: '9-Tier Alliance Milestone Ladder',
          description: 'Climb the Alliance ladder as your circle grows: unlocking milestones for 1, 5, 10, up to 1,000 pass-holding allies awards colossal bounties ranging from 150 up to 500,000 Blood Sovereigns!'
        }
      ]
    },

    // ----------------------------------------------------
    // CHAPTER IX: THE ROYAL BANK & WITHDRAWALS
    // ----------------------------------------------------
    {
      id: 9,
      romanNumeral: 'IX',
      title: 'The Royal Bank & Withdrawals',
      subtitle: 'Treasury Vault, 100 SOV = $1 USDT & On-Chain Payouts',
      badge: 'ABYSSAL BANK',
      icon: <Landmark className="w-5 h-5 text-emerald-400" />,
      loreQuote: '“Blood spilled in the Void materializes into real world wealth. The Royal Vault honors every covenant.”',
      leftPageVisual: (
        <div className="flex flex-col items-center justify-center p-3 sm:p-5 bg-black/50 border border-emerald-500/20 rounded-2xl h-full space-y-3.5">
          <div className="text-[11px] font-mono font-bold text-emerald-300 uppercase tracking-widest flex items-center gap-2">
            <Landmark className="w-4 h-4 text-emerald-400" />
            The Royal Treasury Vault
          </div>

          <div className="p-3.5 rounded-2xl bg-gradient-to-b from-emerald-950/60 to-black border border-emerald-500/40 w-full text-center space-y-1 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block font-bold">EXCHANGE RATE</span>
            <div className="text-2xl font-mono font-black text-white flex items-center justify-center gap-2">
              <img src="/icons/icon_sovereign.webp" alt="SOV" className="w-6 h-6 object-contain" />
              <span>100 SOV = $1.00 USDT</span>
            </div>
            <span className="text-[8.5px] font-mono text-zinc-400 block">Rigid 100:1 conversion pegged to USD</span>
          </div>

          <div className="w-full space-y-1.5 text-[9px] font-mono">
            <div className="p-2 rounded-lg bg-zinc-900/80 border border-white/10 flex items-center justify-between">
              <span className="text-zinc-400">Supported Networks</span>
              <span className="text-emerald-300 font-bold">USDT / TON / Solana</span>
            </div>
            <div className="p-2 rounded-lg bg-zinc-900/80 border border-white/10 flex items-center justify-between">
              <span className="text-zinc-400">Min. Withdrawal</span>
              <span className="text-emerald-300 font-bold">2000 – 3000 SOV ($20 – $30)</span>
            </div>
            <div className="p-2 rounded-lg bg-zinc-900/80 border border-white/10 flex items-center justify-between">
              <span className="text-zinc-400">Audit Status</span>
              <span className="text-emerald-300 font-bold">Pending ➔ Completed</span>
            </div>
          </div>
        </div>
      ),
      sections: [
        {
          heading: 'Centralized Sovereign Treasury',
          description: 'Every sovereign won across the Arena, extracted from campaign dungeons, or generated through Alliance revenue streams converges safely in your BANK tab.'
        },
        {
          heading: 'Guaranteed 100:1 Peg',
          description: 'The rate of exchange never fluctuates: 100 Blood Sovereigns equals exactly $1.00 USD, providing absolute transparency to your battle earnings.'
        },
        {
          heading: 'Direct On-Chain Withdrawals',
          description: 'Request withdrawals anytime inside the Bank. Enter your external crypto address (USDT, TON, or Solana) and submit your desired amount.'
        },
        {
          heading: 'Transparent Status Tracking',
          description: 'Your request is recorded with on-chain tracking from Pending to Completed. The Abyssal Bank stands as a testament to your conquest!'
        }
      ]
    }
  ];

  const current = chapters[currentChapter];
  const isFinalChapter = currentChapter === chapters.length - 1;

  const handleNext = () => {
    triggerHaptic();
    if (isFinalChapter) {
      onClose();
    } else {
      setCurrentChapter(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    triggerHaptic();
    setCurrentChapter(prev => Math.max(0, prev - 1));
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md select-none overflow-y-auto">
      {/* Grimoire Container Frame */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative w-full max-w-5xl bg-[#0e0c0a] border-2 border-[#8a6b32]/80 rounded-2xl sm:rounded-3xl shadow-[0_0_60px_rgba(180,130,50,0.35)] overflow-hidden flex flex-col my-auto max-h-[96vh]"
      >
        {/* Ornate Gold Filigree Corners */}
        <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[#f3d38c]/70 pointer-events-none z-30" />
        <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[#f3d38c]/70 pointer-events-none z-30" />
        <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[#f3d38c]/70 pointer-events-none z-30" />
        <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[#f3d38c]/70 pointer-events-none z-30" />

        {/* Top Header Bar */}
        <header className="relative z-20 flex items-center justify-between px-3 sm:px-6 py-3 border-b border-[#8a6b32]/40 bg-gradient-to-r from-[#18130e] via-[#241a10] to-[#18130e] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-[#ebd09b]/50 flex items-center justify-center shadow-inner">
              <BookOpen className="w-4 h-4 text-[#ebd09b]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-black text-xs sm:text-sm text-[#ebd09b] tracking-[0.2em] uppercase">
                  THE VOID GRIMOIRE
                </h1>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  CHAPTER {current.romanNumeral}
                </span>
              </div>
              <p className="text-[9px] font-mono text-zinc-400 hidden sm:block">
                Ancient Tome of Abyssal Strategy & Sovereignty
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              title="Skip and close tutorial"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-1 text-xs font-mono"
            >
              <span className="hidden sm:inline text-[10px] uppercase text-zinc-400">Skip</span>
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Chapter Quick Bookmarks (Pill Bar) */}
        <div className="px-3 sm:px-6 py-2 border-b border-white/5 bg-black/40 overflow-x-auto scrollbar-none flex items-center gap-1.5 shrink-0">
          {chapters.map((ch, idx) => (
            <button
              key={ch.id}
              onClick={() => {
                setCurrentChapter(idx);
                triggerHaptic();
              }}
              className={`px-2.5 py-1 rounded-md text-[9px] font-mono font-bold uppercase transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                idx === currentChapter
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-amber-100 shadow-[0_0_10px_rgba(245,158,11,0.3)] border border-amber-400/60 scale-105'
                  : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200 border border-white/5'
              }`}
            >
              <span>{ch.romanNumeral}.</span>
              <span className="truncate max-w-[90px] sm:max-w-none">{ch.title.split('&')[0].trim()}</span>
            </button>
          ))}
        </div>

        {/* Book Body: Responsive Split Spread */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 bg-[radial-gradient(ellipse_at_top,#1f170f_0%,#0c0a08_100%)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentChapter}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 min-h-[360px]"
            >
              {/* LEFT PAGE: Interactive Schematic / Visuals */}
              <div className="flex flex-col justify-between rounded-xl bg-gradient-to-b from-[#14100c] to-[#0a0806] border border-[#ebd09b]/20 p-3.5 sm:p-5 relative overflow-hidden shadow-inner">
                {/* Subtle parchment watermark */}
                <div className="absolute top-2 right-2 text-6xl font-display font-black text-amber-500/5 select-none pointer-events-none">
                  {current.romanNumeral}
                </div>

                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold tracking-widest text-amber-400/80 uppercase px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30">
                      {current.badge}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      Folio {current.id} / 9
                    </span>
                  </div>

                  <div>
                    <h2 className="text-base sm:text-lg font-display font-black text-[#ebd09b] tracking-wide">
                      {current.title}
                    </h2>
                    <p className="text-[10px] font-mono text-amber-200/60">
                      {current.subtitle}
                    </p>
                  </div>

                  {/* Visual Render Component */}
                  <div className="pt-1">
                    {current.leftPageVisual}
                  </div>
                </div>

                {/* Atmospheric Lore Quote */}
                <div className="pt-3 border-t border-white/5 mt-3">
                  <p className="text-[9.5px] font-serif italic text-zinc-400 text-center leading-relaxed">
                    {current.loreQuote}
                  </p>
                </div>
              </div>

              {/* RIGHT PAGE: Structured Rules & Lore Text */}
              <div className="flex flex-col justify-between rounded-xl bg-gradient-to-b from-[#14100c] to-[#0a0806] border border-[#ebd09b]/20 p-3.5 sm:p-5 relative shadow-inner">
                <div className="space-y-3">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block border-b border-white/5 pb-1">
                    Core Covenant Tenets
                  </span>

                  <div className="space-y-2.5">
                    {current.sections.map((sec, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-black/40 border border-white/5 space-y-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                            <span className="text-amber-500">❖</span>
                            {sec.heading}
                          </h3>
                        </div>
                        <p className="text-[10.5px] font-sans text-zinc-300 leading-relaxed pl-3.5">
                          {sec.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom page guide */}
                <div className="pt-3 border-t border-white/5 mt-3 flex items-center justify-between text-[9px] font-mono text-zinc-500">
                  <span>Void Covenant • Codex</span>
                  <span>Turn page with ◄ / ►</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation Bar */}
        <footer className="relative z-20 flex items-center justify-between px-3 sm:px-6 py-3 border-t border-[#8a6b32]/40 bg-gradient-to-r from-[#18130e] via-[#241a10] to-[#18130e] shrink-0">
          <button
            onClick={handlePrev}
            disabled={currentChapter === 0}
            className="py-2 px-3 sm:px-4 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 disabled:opacity-25 disabled:cursor-not-allowed text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all border border-white/10"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">PREVIOUS CHAPTER</span>
          </button>

          {/* Center Page Progress Indicator */}
          <div className="flex items-center gap-1.5">
            {chapters.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentChapter(idx);
                  triggerHaptic();
                }}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentChapter ? 'w-5 bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'bg-zinc-600 hover:bg-zinc-400'
                }`}
                title={`Chapter ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className={`py-2 px-3 sm:px-5 rounded-xl font-display font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer active:scale-95 transition-all shadow-lg border ${
              isFinalChapter
                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                : 'bg-gradient-to-r from-[#b3894a] via-[#f3d38c] to-[#b3894a] hover:from-[#c59a58] hover:via-[#fae1a2] hover:to-[#c59a58] text-[#1a0f05] border-[#ebd09b]/60'
            }`}
          >
            <span>{isFinalChapter ? 'SEAL GRIMOIRE & ENTER THE VOID' : 'NEXT CHAPTER'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </footer>
      </motion.div>
    </div>
  );
};
