import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, X, ArrowRight, Sparkles } from 'lucide-react';

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
    // SLIDE 1: WELCOME TO THE VOID COVENANT
    // ----------------------------------------------------
    {
      id: 1,
      tag: 'PROLOGUE',
      title: 'WELCOME TO THE VOID',
      headline: 'Awaken, Initiate. Your dark conquest begins.',
      description: 'You have sealed the pact and awakened in Void Covenant—a dark fantasy card RPG where tactical prowess meets real-world wealth. Build a formidable legion of minions, conquer towering dungeons, duel summoners across the realm, and forge your sovereign legacy in the Abyss!',
      visual: (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-2">
          <div className="relative w-36 sm:w-40 aspect-[4/5] rounded-2xl border-2 border-amber-400/70 overflow-hidden shadow-[0_0_30px_rgba(245,158,11,0.35)] bg-black">
            <img 
              src="/cards/aurelius_the_demiurge.webp" 
              alt="Void Sovereign" 
              className="w-full h-full object-cover brightness-110"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/avatars/knight.webp';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <div className="absolute bottom-2 inset-x-2 text-center">
              <span className="text-[9px] font-mono font-bold text-amber-300 uppercase tracking-widest block">
                TACTICAL CARD RPG
              </span>
              <span className="text-xs font-display font-black text-white tracking-wider uppercase">
                VOID COVENANT
              </span>
            </div>
          </div>
        </div>
      )
    },

    // ----------------------------------------------------
    // SLIDE 2: DECK & 5 BATTLE SLOTS
    // ----------------------------------------------------
    {
      id: 2,
      tag: 'CHAPTER I • COMBAT BASICS',
      title: 'DECK & 5 BATTLE SLOTS',
      headline: 'Assemble 10 cards. Minions clash straight ahead.',
      description: 'Before stepping into combat, build your Combat Deck with exactly 10 cards in the CARDS tab. On the battlefield, you command 5 combat slots. Minions strike directly straight ahead into the opposing card. If an enemy slot is empty, all damage strikes the opposing Hero directly! Reduce enemy HP to 0 to claim victory.',
      visual: (
        <div className="w-full max-w-[310px] space-y-1.5 py-1">
          {/* Enemy Row */}
          <div className="w-full">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-rose-400 px-1 mb-0.5">
              <span>ENEMY FRONTLINE</span>
              <span className="text-zinc-400">HERO HP: 100</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 w-full">
              {[1, 2, 3, 4, 5].map((slot) => (
                <div
                  key={slot}
                  className={`aspect-[3/4] rounded-lg border flex flex-col items-center justify-between p-1 transition-all ${
                    slot === 3
                      ? 'border-rose-500 bg-rose-950/60 shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                      : 'border-zinc-800 bg-black/60'
                  }`}
                >
                  <span className="text-[8px] font-mono text-zinc-400 font-bold">#{slot}</span>
                  <div className="w-6 h-6 rounded-md overflow-hidden bg-black/80 border border-zinc-700 flex items-center justify-center">
                    <img 
                      src={slot === 3 ? '/cards/banshee.webp' : '/cards/blood_imp.webp'} 
                      alt="Enemy Card" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/avatars/lich.webp';
                      }}
                    />
                  </div>
                  <span className="text-[7.5px] font-mono text-rose-300 font-bold">{slot === 3 ? '12 ATK' : 'EMPTY'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Clash Direction Indicator */}
          <div className="flex items-center justify-center gap-2 py-0.5 w-full">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
            <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-950/90 border border-amber-500/50 text-amber-300 font-mono text-[9px] font-bold shadow-sm">
              <img src="/icons/gothic_attack.webp" alt="Attack" className="w-3 h-3 object-contain" />
              <span>DIRECT OPPOSITE DUEL</span>
              <img src="/icons/gothic_attack.webp" alt="Attack" className="w-3 h-3 object-contain" />
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
          </div>

          {/* Player Row */}
          <div className="w-full">
            <div className="grid grid-cols-5 gap-1.5 w-full">
              {[1, 2, 3, 4, 5].map((slot) => (
                <div
                  key={slot}
                  className={`aspect-[3/4] rounded-lg border flex flex-col items-center justify-between p-1 transition-all ${
                    slot === 3
                      ? 'border-cyan-400 bg-cyan-950/60 shadow-[0_0_12px_rgba(34,211,238,0.5)] ring-1 ring-cyan-400/50'
                      : 'border-cyan-900/40 bg-cyan-950/20'
                  }`}
                >
                  <span className="text-[8px] font-mono text-cyan-300 font-bold">#{slot}</span>
                  <div className="w-6 h-6 rounded-md overflow-hidden bg-black/80 border border-cyan-500/50 flex items-center justify-center">
                    <img 
                      src={slot === 3 ? '/cards/avatar_knight.webp' : '/cards/covenant_initiate.webp'} 
                      alt="Allied Card" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/avatars/knight.webp';
                      }}
                    />
                  </div>
                  <span className="text-[7.5px] font-mono text-cyan-300 font-bold">{slot === 3 ? '14 ATK' : 'READY'}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-cyan-400 px-1 mt-0.5">
              <span>YOUR BATTLE LINE</span>
              <span className="text-zinc-400">10 CARDS IN DECK</span>
            </div>
          </div>
        </div>
      )
    },

    // ----------------------------------------------------
    // SLIDE 3: DELAY TIMER, ARMOR & BARRIER
    // ----------------------------------------------------
    {
      id: 3,
      tag: 'CHAPTER II • DEFENSIVE RITES',
      title: 'DELAY TIMER & DEFENSES',
      headline: 'Cards awaken over time. Defenses mitigate damage.',
      description: 'Summoned creatures do not attack right away. Each card has a Delay timer (1–3 turns) that counts down by 1 every round. When Delay reaches 0, the card attacks every turn! Armor absorbs incoming damage before health is lost, and Divine Barrier nullifies 1 full incoming strike.',
      visual: (
        <div className="flex items-center justify-center gap-4 py-1">
          {/* Card Presentation with Crisp Stat Badges */}
          <div className="relative w-36 sm:w-40 aspect-[5/7] rounded-xl border-2 border-amber-500/80 bg-gradient-to-b from-[#1c1427] via-[#100c18] to-black p-2 flex flex-col justify-between shadow-[0_0_25px_rgba(168,85,247,0.4)]">
            <div className="flex items-center justify-between">
              <div className="w-5 h-5 rounded-md bg-cyan-950 border border-cyan-400 flex items-center justify-center shadow-sm">
                <span className="text-white text-[10px] font-black font-mono">2</span>
              </div>
              <span className="text-[9.5px] font-display font-black text-amber-200 tracking-wider uppercase truncate max-w-[90px]">
                ABYSS REAPER
              </span>
              <span className="text-[8.5px] font-mono text-purple-300 font-bold">GOLD</span>
            </div>

            <div className="relative flex-1 my-1.5 rounded-lg overflow-hidden border border-purple-500/40 bg-black/70 flex items-center justify-center">
              <img 
                src="/cards/abyss_reaper.webp" 
                alt="Reaper" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/avatars/knight.webp';
                }}
              />
            </div>

            {/* Attack, Delay, Health Tokens */}
            <div className="grid grid-cols-3 gap-1">
              <div className="flex items-center justify-center gap-1 py-1 rounded bg-red-950 border border-red-500/60" title="Attack Power">
                <img src="/icons/gothic_attack.webp" alt="ATK" className="w-3.5 h-3.5 object-contain" />
                <span className="text-white text-[11px] font-black font-mono">14</span>
              </div>

              <div className="flex items-center justify-center gap-1 py-1 rounded bg-amber-950 border border-amber-400/80 shadow-[0_0_8px_rgba(245,158,11,0.5)]" title="Turn Delay">
                <img src="/icons/gothic_hourglass.webp" alt="Delay" className="w-3.5 h-3.5 object-contain" />
                <span className="text-amber-300 text-[11px] font-black font-mono">1</span>
              </div>

              <div className="flex items-center justify-center gap-1 py-1 rounded bg-emerald-950 border border-emerald-500/60" title="Health Points">
                <img src="/icons/gothic_health.webp" alt="HP" className="w-3.5 h-3.5 object-contain" />
                <span className="text-white text-[11px] font-black font-mono">22</span>
              </div>
            </div>
          </div>

          {/* Defenses Showcase */}
          <div className="flex flex-col gap-2.5">
            <div className="p-2.5 rounded-xl bg-sky-950/60 border border-sky-500/50 flex items-center gap-3 w-40">
              <img src="/icons/gothic_armor.webp" alt="Armor" className="w-8 h-8 object-contain shrink-0 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
              <div>
                <span className="text-xs font-mono font-bold text-sky-300 block">ARMOR</span>
                <span className="text-[10px] font-mono text-zinc-300 block">Absorbs incoming hits</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/50 flex items-center gap-3 w-40">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-amber-600 to-amber-900 border border-amber-300 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(251,191,36,0.6)]">
                <img src="/icons/gothic_armor.webp" alt="Barrier" className="w-5 h-5 object-contain brightness-200 contrast-200" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-amber-300 block">DIVINE BARRIER</span>
                <span className="text-[10px] font-mono text-zinc-300 block">Blocks 1 full strike</span>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // ----------------------------------------------------
    // SLIDE 4: DARK MAGIC & COMMANDER AURAS
    // ----------------------------------------------------
    {
      id: 4,
      tag: 'CHAPTER III • SORCERY & AURAS',
      title: 'MINION SKILLS & STANCES',
      headline: 'Weave ancient curses and unleash commander powers.',
      description: 'Minions wield 4 ancient curses: Hex (amplifies damage on target), Vampirism (heals your Hero), Plague (toxic damage over time), and Sacrifice (devours an ally for colossal buffs). Furthermore, your Lord’s active Stance (Void Strike, Blood Aura, or Warlord’s Cry) has a chance to trigger each round. Upgrade them in the TALENTS tab!',
      visual: (
        <div className="w-full max-w-[320px] space-y-2 py-1">
          {/* Minion Skills Row */}
          <div className="grid grid-cols-4 gap-1.5">
            <div className="p-1.5 rounded-xl bg-purple-950/50 border border-purple-500/40 flex flex-col items-center text-center">
              <img src="/icons/icon_hex.webp" alt="Hex" className="w-6 h-6 object-contain mb-0.5" />
              <span className="text-[9px] font-mono font-bold text-purple-300">HEX</span>
            </div>
            <div className="p-1.5 rounded-xl bg-red-950/50 border border-red-500/40 flex flex-col items-center text-center">
              <img src="/icons/icon_vampirism.webp" alt="Vampirism" className="w-6 h-6 object-contain mb-0.5" />
              <span className="text-[9px] font-mono font-bold text-red-300">VAMPIRISM</span>
            </div>
            <div className="p-1.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 flex flex-col items-center text-center">
              <img src="/icons/icon_plague.webp" alt="Plague" className="w-6 h-6 object-contain mb-0.5" />
              <span className="text-[9px] font-mono font-bold text-emerald-300">PLAGUE</span>
            </div>
            <div className="p-1.5 rounded-xl bg-amber-950/50 border border-amber-500/40 flex flex-col items-center text-center">
              <img src="/icons/icon_sacrifice.webp" alt="Sacrifice" className="w-6 h-6 object-contain mb-0.5" />
              <span className="text-[9px] font-mono font-bold text-amber-300">SACRIFICE</span>
            </div>
          </div>

          {/* Stances Row */}
          <div className="grid grid-cols-3 gap-2 pt-0.5">
            <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-500/30 flex flex-col items-center text-center">
              <img src="/icons/void_strike_fx.webp" alt="Void Strike" className="w-9 h-9 object-contain rounded-lg mb-1" />
              <span className="text-[10px] font-mono font-bold text-purple-300">VOID STRIKE</span>
              <span className="text-[8.5px] font-mono text-zinc-300">Damage & Leech</span>
            </div>

            <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-500/30 flex flex-col items-center text-center">
              <img src="/icons/blood_aura_fx.webp" alt="Blood Aura" className="w-9 h-9 object-contain rounded-lg mb-1" />
              <span className="text-[10px] font-mono font-bold text-rose-300">BLOOD AURA</span>
              <span className="text-[8.5px] font-mono text-zinc-300">Heal & Cleanse</span>
            </div>

            <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/30 flex flex-col items-center text-center">
              <img src="/icons/warlord_cry_fx.webp" alt="Warlord Cry" className="w-9 h-9 object-contain rounded-lg mb-1" />
              <span className="text-[10px] font-mono font-bold text-amber-300">WARLORD</span>
              <span className="text-[8.5px] font-mono text-zinc-300">ATK & Armor</span>
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
      tag: 'CHAPTER IV • EXPEDITIONS',
      title: 'THE CAMPAIGN & SWEEPS',
      headline: 'Descend into the Abyss, slay bosses, harvest loot.',
      description: 'Venture through the campaign tower using PvE Energy, which recharges over time. Fearsome Bosses await every 10 floors (Floor 10, 20, 30...) carrying first-clear Blood Sovereign bounties and rare card packs. Master any floor with a 3-Star rating to unlock 1-click Instant Sweeps for fast Gold and EXP without re-fighting!',
      visual: (
        <div className="w-full max-w-[320px] flex items-center justify-between gap-2.5 py-1">
          {/* Boss Encounter */}
          <div className="flex-1 p-2.5 rounded-xl bg-red-950/60 border border-red-500/60 flex flex-col items-center text-center">
            <div className="w-11 h-11 rounded-lg overflow-hidden border border-red-400 bg-black mb-1">
              <img src="/cards/beelzebub_lord_of_flies.webp" alt="Boss" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/avatars/lich.webp'; }} />
            </div>
            <span className="text-[10.5px] font-mono font-bold text-red-400 block">FLOORS 10, 20...</span>
            <span className="text-[9px] font-mono text-zinc-300">Boss Bounties</span>
          </div>

          {/* PvE Energy */}
          <div className="flex-1 p-2.5 rounded-xl bg-amber-950/50 border border-amber-500/50 flex flex-col items-center text-center">
            <img src="/icons/icon_energy.webp" alt="Energy" className="w-11 h-11 object-contain drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] mb-1" />
            <span className="text-[10.5px] font-mono font-bold text-amber-300 block">PvE ENERGY</span>
            <span className="text-[9px] font-mono text-zinc-300">Recharges over time</span>
          </div>

          {/* 3-Star Sweep */}
          <div className="flex-1 p-2.5 rounded-xl bg-yellow-950/50 border border-yellow-500/50 flex flex-col items-center text-center">
            <div className="w-11 h-11 flex items-center justify-center gap-0.5 text-amber-400 text-sm mb-1">
              <span>⭐</span><span>⭐</span><span>⭐</span>
            </div>
            <span className="text-[10.5px] font-mono font-bold text-yellow-300 block">3-STAR SWEEP</span>
            <span className="text-[9px] font-mono text-zinc-300">1-click instant loot</span>
          </div>
        </div>
      )
    },

    // ----------------------------------------------------
    // SLIDE 6: THE ARENA & LEAGUES
    // ----------------------------------------------------
    {
      id: 6,
      tag: 'CHAPTER V • THE ARENA',
      title: 'DUELS, LEAGUES & BOUNTIES',
      headline: 'Climb 12 competitive leagues and earn Sovereigns per win.',
      description: 'Enter the Arena using PvP Tickets to duel living summoners. Pass subscribers earn real Blood Sovereigns for every single victory! Accumulate Crowns to ascend through 12 competitive tiers from Bronze to Divine. Before you log off, activate Peace Shields (3h, 6h, 12h) to lock your rating from rival attacks.',
      visual: (
        <div className="w-full max-w-[320px] flex items-center justify-between gap-2.5 py-1">
          {/* League Crowns */}
          <div className="flex-1 p-2.5 rounded-xl bg-amber-950/50 border border-amber-500/50 flex flex-col items-center text-center">
            <img src="/icons/crown.png" alt="Crowns" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] mb-1" />
            <span className="text-[10.5px] font-mono font-bold text-amber-300 block">12 LEAGUES</span>
            <span className="text-[9px] font-mono text-zinc-300">Bronze to Divine</span>
          </div>

          {/* Per-Win Bounty */}
          <div className="flex-1 p-2.5 rounded-xl bg-red-950/50 border border-red-500/50 flex flex-col items-center text-center">
            <img src="/icons/icon_sovereign.webp" alt="SOV" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(239,68,68,0.7)] mb-1" />
            <span className="text-[10.5px] font-mono font-bold text-red-300 block">+1 TO +2 SOV</span>
            <span className="text-[9px] font-mono text-zinc-300">Paid Every Win</span>
          </div>

          {/* Peace Shields */}
          <div className="flex-1 p-2.5 rounded-xl bg-sky-950/50 border border-sky-500/50 flex flex-col items-center text-center">
            <img src="/icons/gothic_armor.webp" alt="Armor" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(56,189,248,0.5)] mb-1" />
            <span className="text-[10.5px] font-mono font-bold text-sky-300 block">PEACE SHIELDS</span>
            <span className="text-[9px] font-mono text-zinc-300">3h, 6h, 12h Offline</span>
          </div>
        </div>
      )
    },

    // ----------------------------------------------------
    // SLIDE 7: TREASURES & CURRENCIES
    // ----------------------------------------------------
    {
      id: 7,
      tag: 'CHAPTER VI • ECONOMY',
      title: 'TREASURES & PROGRESSION',
      headline: 'Master the four currencies that fuel your supremacy.',
      description: 'Gold: won in battles to buy card booster packs. Dark Shards: premium gems to summon in the Gacha Shrine, buy energy & passes. Shadow Dust: obtained by disenchanting duplicate cards to ascend your minions up to Divine Tier. Blood Sovereigns: convertible hard currency (100 SOV = $1.00 USDT) earned in battle and alliances.',
      visual: (
        <div className="w-full max-w-[320px] grid grid-cols-2 gap-2 py-1">
          <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center gap-2.5">
            <img src="/icons/icon_gold.webp" alt="Gold" className="w-8 h-8 object-contain shrink-0" />
            <div>
              <span className="text-xs font-mono font-bold text-amber-300 block">GOLD</span>
              <span className="text-[10px] font-mono text-zinc-300 leading-tight block">Card Booster Packs</span>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-500/40 flex items-center gap-2.5">
            <img src="/icons/icon_shards.webp" alt="Dark Shards" className="w-8 h-8 object-contain shrink-0" />
            <div>
              <span className="text-xs font-mono font-bold text-purple-300 block">DARK SHARDS</span>
              <span className="text-[10px] font-mono text-zinc-300 leading-tight block">Gacha & Energy</span>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-teal-950/40 border border-teal-500/40 flex items-center gap-2.5">
            <img src="/icons/icon_dust.webp" alt="Shadow Dust" className="w-8 h-8 object-contain shrink-0" />
            <div>
              <span className="text-xs font-mono font-bold text-teal-300 block">SHADOW DUST</span>
              <span className="text-[10px] font-mono text-zinc-300 leading-tight block">Tier Ascension</span>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-red-950/50 border border-red-500/60 flex items-center gap-2.5 shadow-[0_0_12px_rgba(239,68,68,0.3)]">
            <img src="/icons/icon_sovereign.webp" alt="Blood Sovereigns" className="w-8 h-8 object-contain shrink-0" />
            <div>
              <span className="text-xs font-mono font-bold text-red-300 block">SOVEREIGNS</span>
              <span className="text-[10px] font-mono text-zinc-200 leading-tight block">100 SOV = $1.00</span>
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
      tag: 'CHAPTER VII • DESTINY & CASHOUT',
      title: 'ALLIANCE & REAL CASHOUTS',
      headline: 'Recruit allies for lifetime bounties and withdraw your riches.',
      description: 'Share your personal invite link to build an Alliance. Instantly earn +300 to +800 SOV whenever an invited friend buys a Pass, plus a perpetual 15% share of all Blood Sovereigns they win in Arena battles! Unlock up to 500,000 SOV in milestone rewards. All your Sovereigns accumulate in the Bank for direct on-chain withdrawal to USDT, TON, or Solana (100 SOV = $1.00 USDT).',
      visual: (
        <div className="w-full max-w-[320px] flex items-center justify-between gap-2.5 py-1">
          {/* Pass Bounty */}
          <div className="flex-1 p-2.5 rounded-xl bg-amber-950/50 border border-amber-500/50 flex flex-col items-center text-center">
            <img src="/icons/icon_pass.webp" alt="Pass Bounty" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] mb-1" />
            <span className="text-[10.5px] font-mono font-bold text-amber-300 block">PASS BOUNTY</span>
            <span className="text-[9px] font-mono text-zinc-300">+300 / +800 SOV</span>
          </div>

          {/* 15% Battle Share */}
          <div className="flex-1 p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-500/50 flex flex-col items-center text-center">
            <img src="/icons/referral_seal.png" alt="Alliance Share" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(16,185,129,0.6)] mb-1" />
            <span className="text-[10.5px] font-mono font-bold text-emerald-300 block">15% SHARE</span>
            <span className="text-[9px] font-mono text-zinc-300">Arena & League Wins</span>
          </div>

          {/* Real On-Chain Withdrawal */}
          <div className="flex-1 p-2.5 rounded-xl bg-cyan-950/50 border border-cyan-500/50 flex flex-col items-center text-center">
            <img src="/icons/icon_sovereign.webp" alt="Withdrawal" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] mb-1" />
            <span className="text-[10.5px] font-mono font-bold text-cyan-300 block">WITHDRAW</span>
            <span className="text-[9px] font-mono text-zinc-300">USDT / TON / SOL</span>
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
        className="relative w-full max-w-md bg-[#0a0808] border border-[#d4af37]/40 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_30px_rgba(212,175,55,0.2)] overflow-hidden flex flex-col h-auto max-h-[95vh]"
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

        {/* Upper Half: Visual Graphic Showcase (Optimized height, zero clipping) */}
        <div className="relative flex-1 min-h-[160px] max-h-[200px] w-full overflow-hidden shrink-0 flex items-center justify-center px-3">
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

        {/* Lower Half: Dark Glass Description Panel (Clean story narrative) */}
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
              <span>{isFinalSlide ? 'SEAL THE PACT & ENTER' : 'CONTINUE'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
