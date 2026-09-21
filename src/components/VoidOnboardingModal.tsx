import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, X, ArrowRight } from 'lucide-react';

interface VoidOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface OnboardingPoint {
  icon: string;
  label: string;
  desc: string;
}

interface OnboardingSlide {
  id: number;
  tag: string;
  title: string;
  headline: string;
  points: OnboardingPoint[];
  image: string;
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
    // SLIDE 1: WELCOME TO VOID COVENANT
    // ----------------------------------------------------
    {
      id: 1,
      tag: 'PROLOGUE',
      title: 'WELCOME TO VOID COVENANT',
      headline: 'Awaken, Commander. Your dark conquest begins.',
      image: '/landing_void_realm.jpg',
      points: [
        {
          icon: '⚔️',
          label: 'Tactical Card RPG',
          desc: 'Build a formidable legion where strategic mastery yields real wealth and glory.'
        },
        {
          icon: '🏰',
          label: 'Abyssal Ascent',
          desc: 'Vanquish dungeon bosses, conquer competitive leagues, and forge your legacy.'
        },
        {
          icon: '💰',
          label: 'Real Treasury',
          desc: 'Amass convertible Blood Sovereigns and withdraw your treasury on-chain.'
        }
      ]
    },

    // ----------------------------------------------------
    // SLIDE 2: DECK & 5 BATTLE SLOTS
    // ----------------------------------------------------
    {
      id: 2,
      tag: 'CHAPTER I • THE BATTLEFIELD',
      title: 'DECK & 5 BATTLE SLOTS',
      headline: 'Command 10 cards across 5 mirrored combat slots.',
      image: '/landing_cards_altar.jpg',
      points: [
        {
          icon: '🎴',
          label: '10-Card Deck',
          desc: 'Assemble and customize your battle-ready deck in the CARDS tab.'
        },
        {
          icon: '⚡',
          label: '5 Frontline Slots',
          desc: 'Spend Mana to summon minions; they strike straight ahead into opposing cards.'
        },
        {
          icon: '💥',
          label: 'Direct Hero Damage',
          desc: 'If an opposing slot stands vacant, all damage strikes the rival Hero directly!'
        }
      ]
    },

    // ----------------------------------------------------
    // SLIDE 3: DELAY TIMER, ARMOR & BARRIER
    // ----------------------------------------------------
    {
      id: 3,
      tag: 'CHAPTER II • TACTICAL DEFENSES',
      title: 'DELAY TIMER & DEFENSES',
      headline: 'Timing awakens minions; wards shield them from harm.',
      image: '/gameplay_cinematic_duel.jpg',
      points: [
        {
          icon: '⏳',
          label: 'Delay Timer (1–3)',
          desc: 'Minions count down 1 delay per turn; once at 0, they attack every round.'
        },
        {
          icon: '🛡️',
          label: 'Armor Absorption',
          desc: 'Absorbs incoming damage before the minion’s health pool is touched.'
        },
        {
          icon: '🔮',
          label: 'Divine Barrier',
          desc: 'Completely blocks 1 full incoming strike without taking any damage.'
        }
      ]
    },

    // ----------------------------------------------------
    // SLIDE 4: DARK MAGIC & COMMANDER AURAS
    // ----------------------------------------------------
    {
      id: 4,
      tag: 'CHAPTER III • DARK SORCERY',
      title: 'MINION CURSES & STANCES',
      headline: 'Weave ancient afflictions and channel your Lord’s aura.',
      image: '/dark_heroes_lore.jpg',
      points: [
        {
          icon: '🩸',
          label: '4 Minion Curses',
          desc: 'Hex (amps damage), Vampirism (heals on hit), Plague (DoT poison), Sacrifice (eats ally for buffs).'
        },
        {
          icon: '⚡',
          label: '3 Lord Stances',
          desc: 'Void Strike (damage/leech), Blood Aura (heal/cleanse), and Warlord’s Cry (buffs).'
        },
        {
          icon: '📜',
          label: 'Talents Tab',
          desc: 'Allocate talent points to unlock powerful passive commander enhancements.'
        }
      ]
    },

    // ----------------------------------------------------
    // SLIDE 5: CAMPAIGN, ENERGY & SWEEP
    // ----------------------------------------------------
    {
      id: 5,
      tag: 'CHAPTER IV • EXPEDITIONS',
      title: 'CAMPAIGN & SWEEPS',
      headline: 'Conquer the abyssal tower and harvest instant spoils.',
      image: '/landing_warlord_duel.jpg',
      points: [
        {
          icon: '⚡',
          label: 'PvE Energy',
          desc: 'Expeditions consume energy, which automatically recharges over time.'
        },
        {
          icon: '👑',
          label: 'Boss Floors (10, 20...)',
          desc: 'Slay dungeon bosses to claim massive first-clear Blood Sovereign bounties.'
        },
        {
          icon: '⭐',
          label: '3-Star Sweep',
          desc: 'Master floors with 3 stars to collect instant Gold and EXP in 1 click without re-fighting.'
        }
      ]
    },

    // ----------------------------------------------------
    // SLIDE 6: THE ARENA & LEAGUES
    // ----------------------------------------------------
    {
      id: 6,
      tag: 'CHAPTER V • THE ARENA',
      title: 'DUELS & LEAGUES',
      headline: 'Duel living rivals, ascend leagues, and claim daily cash.',
      image: '/landing_tactical_arena.jpg',
      points: [
        {
          icon: '🎟️',
          label: 'PvP Tickets',
          desc: 'Spend daily or bonus tickets to challenge rival summoners in ranked duels.'
        },
        {
          icon: '💰',
          label: 'Daily League Cash',
          desc: 'Climb 12 tiers (Bronze to Divine) for daily leaderboard payouts in Blood Sovereigns.'
        },
        {
          icon: '🛡️',
          label: 'Per-Win SOV & Shields',
          desc: 'Pass holders earn SOV per victory. Activate Peace Shields (3h, 6h, 12h) to lock rating offline.'
        }
      ]
    },

    // ----------------------------------------------------
    // SLIDE 7: TREASURES & CURRENCIES
    // ----------------------------------------------------
    {
      id: 7,
      tag: 'CHAPTER VI • ECONOMY',
      title: 'REALM CURRENCIES',
      headline: 'Four distinct treasures fuel your supremacy.',
      image: '/landing_p2e_treasury.jpg',
      points: [
        {
          icon: '🟡',
          label: 'Gold',
          desc: 'Won in battles; buys card booster packs, basic equipment, and upgrades.'
        },
        {
          icon: '💠',
          label: 'Dark Shards',
          desc: 'Premium gems for Gacha summons, energy refills, passes, and exclusive gear sets.'
        },
        {
          icon: '✨',
          label: 'Dust & Sovereigns',
          desc: 'Dust fuses cards up to Divine tier. Sovereigns are real cash (100 SOV = $1.00 USDT).'
        }
      ]
    },

    // ----------------------------------------------------
    // SLIDE 8: ALLIANCE & BANK WITHDRAWALS
    // ----------------------------------------------------
    {
      id: 8,
      tag: 'CHAPTER VII • DESTINY & REWARDS',
      title: 'ALLIANCE & CASHOUTS',
      headline: 'Recruit sworn allies and withdraw your earnings directly.',
      image: '/web3_treasury_vault.jpg',
      points: [
        {
          icon: '🎁',
          label: 'Pass Bounties',
          desc: 'Instantly receive +300 SOV for Premium or +600 SOV for Ultra pass referrals.'
        },
        {
          icon: '⚔️',
          label: '15% Battle Share',
          desc: 'Earn a perpetual 15% share of all Sovereigns your allies win in Arena duels.'
        },
        {
          icon: '🏦',
          label: 'On-Chain Bank',
          desc: 'Withdraw your accumulated Blood Sovereigns directly to USDT, TON, or Solana.'
        }
      ]
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
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="relative w-full max-w-md bg-[#0d0a0b] border border-[#d4af37]/40 rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.95),0_0_30px_rgba(212,175,55,0.2)] overflow-hidden flex flex-col h-auto max-h-[95vh]"
      >
        {/* Top Story Progress Bars (8 Segments) */}
        <div className="px-4 pt-3 pb-1.5 flex items-center gap-1 z-20 shrink-0">
          {slides.map((_, idx) => (
            <div
              key={idx}
              onClick={() => {
                setCurrentSlide(idx);
                triggerHaptic();
              }}
              className="h-1 flex-1 rounded-full overflow-hidden bg-white/15 cursor-pointer transition-all"
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

        {/* Header Bar with Chapter Tag & Skip Button */}
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

        {/* Upper Half: Full Cinematic Keyart Frame (Zero clipping, glorious artwork) */}
        <div className="relative w-full px-3.5 pt-1 pb-1 shrink-0 flex items-center justify-center">
          <div className="relative w-full aspect-[16/9] max-h-[175px] rounded-2xl overflow-hidden border border-[#d4af37]/30 shadow-[0_0_20px_rgba(0,0,0,0.8)] bg-black">
            <AnimatePresence mode="wait">
              <motion.img
                key={current.image}
                src={current.image}
                alt={current.title}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="w-full h-full object-cover object-center brightness-105 contrast-[1.05]"
              />
            </AnimatePresence>
            {/* Cinematic dark vignettes */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl pointer-events-none" />
          </div>
        </div>

        {/* Lower Half: Dark Glass Story Narrative Panel with Bullet Features */}
        <div className="p-4 sm:p-5 bg-gradient-to-b from-[#141113] via-[#0c090a] to-black border-t border-white/10 flex flex-col justify-between space-y-3 shrink-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16 }}
              className="space-y-2"
            >
              <div>
                <h2 className="text-base sm:text-lg font-display font-black text-[#ebd09b] tracking-wider uppercase text-shadow-sm">
                  {current.title}
                </h2>
                <p className="text-[11px] sm:text-xs font-semibold text-zinc-300 leading-snug mt-0.5">
                  {current.headline}
                </p>
              </div>

              {/* Scannable Feature Bullets (No dense text walls) */}
              <div className="space-y-1.5 pt-0.5">
                {current.points.map((pt, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-left bg-white/[0.03] border border-white/5 rounded-lg p-1.5 px-2">
                    <span className="text-xs shrink-0 mt-0.5 select-none">{pt.icon}</span>
                    <div className="text-[10.5px] sm:text-[11px] leading-tight flex-1">
                      <span className="text-amber-300 font-mono font-bold uppercase tracking-wider mr-1.5">
                        {pt.label}:
                      </span>
                      <span className="text-zinc-300 font-sans">
                        {pt.desc}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
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
              className={`flex-1 py-3 px-4 rounded-xl font-display font-black text-xs sm:text-sm tracking-[0.2em] uppercase flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-all shadow-lg border ${
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
