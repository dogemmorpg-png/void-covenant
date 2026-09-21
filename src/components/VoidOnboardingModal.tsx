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
      headline: 'Enter the dark realm of tactical card duels and real rewards.',
      description: 'You have awakened in Void Covenant—a dark fantasy card RPG where tactical mastery transforms into tangible glory. As a newly sworn commander, you will summon demonic legions, ascend through treacherous dungeon towers, challenge rival summoners in competitive leagues, and amass real wealth in the Abyss. Your journey begins now!',
      image: '/landing_void_realm.jpg'
    },

    // ----------------------------------------------------
    // SLIDE 2: DECK & 5 BATTLE SLOTS
    // ----------------------------------------------------
    {
      id: 2,
      tag: 'CHAPTER I • THE BATTLEFIELD',
      title: 'DECK & 5 BATTLE SLOTS',
      headline: 'Command a 10-card deck across 5 mirrored combat slots.',
      description: 'Before battle, assemble your Combat Deck with exactly 10 cards in the CARDS tab. When combat begins, cards cost Mana to summon onto 5 mirrored frontline slots. Creatures strike straight ahead into opposing cards. If an opposing slot stands empty, all attack damage strikes the enemy Hero directly! Reduce the rival Hero’s HP to 0 to claim victory.',
      image: '/landing_cards_altar.jpg'
    },

    // ----------------------------------------------------
    // SLIDE 3: DELAY TIMER, ARMOR & BARRIER
    // ----------------------------------------------------
    {
      id: 3,
      tag: 'CHAPTER II • TACTICAL DEFENSES',
      title: 'DELAY TIMER, ARMOR & BARRIER',
      headline: 'Patience awakens minions; armor and wards preserve them.',
      description: 'Summoned minions do not strike immediately upon placement. Each card possesses a Delay timer (1 to 3 turns) that counts down by 1 each round. When Delay reaches 0, the minion attacks every turn! Armor absorbs incoming damage before health is lost, while Divine Barrier nullifies one entire incoming strike without taking damage.',
      image: '/gameplay_cinematic_duel.jpg'
    },

    // ----------------------------------------------------
    // SLIDE 4: DARK MAGIC & COMMANDER AURAS
    // ----------------------------------------------------
    {
      id: 4,
      tag: 'CHAPTER III • DARK SORCERY',
      title: 'MINION CURSES & STANCES',
      headline: 'Cast ancient afflictions and channel your Lord’s aura.',
      description: 'Minions wield 4 dark curses: Hex (amplifies damage taken by the target), Vampirism (heals the minion upon striking), Plague (deals toxic damage over time), and Sacrifice (destroys an ally to heal your Hero and grant colossal stat buffs). In addition, your Lord channels an active Stance (Void Strike, Blood Aura, or Warlord’s Cry) that can trigger each round. Upgrade them in the TALENTS tab!',
      image: '/dark_heroes_lore.jpg'
    },

    // ----------------------------------------------------
    // SLIDE 5: CAMPAIGN, ENERGY & SWEEP
    // ----------------------------------------------------
    {
      id: 5,
      tag: 'CHAPTER IV • EXPEDITIONS',
      title: 'CAMPAIGN, ENERGY & SWEEPS',
      headline: 'Conquer the abyssal tower and harvest instant spoils.',
      description: 'Venture through the Campaign floors using PvE Energy, which recharges over time. Formidable Bosses await every 10 floors (Floor 10, 20, 30...) offering high-value first-clear bounties and rare card packs. Master any floor with a perfect 3-Star victory to unlock 1-click Instant Sweeps, allowing you to instantly harvest Gold and EXP without re-fighting!',
      image: '/landing_warlord_duel.jpg'
    },

    // ----------------------------------------------------
    // SLIDE 6: THE ARENA & LEAGUES
    // ----------------------------------------------------
    {
      id: 6,
      tag: 'CHAPTER V • THE ARENA',
      title: 'DUELS, 12 LEAGUES & SHIELDS',
      headline: 'Duel living rivals, ascend leagues, and claim Sovereigns.',
      description: 'Spend PvP Tickets to challenge rival summoners on the Arena. Pass subscribers earn real Blood Sovereigns for every single victory! Accumulate Crowns to climb through 12 competitive tiers from Bronze to Divine. Before you go offline, activate Peace Shields (3h, 6h, 12h) to protect your rating and crowns from retaliatory enemy attacks.',
      image: '/landing_tactical_arena.jpg'
    },

    // ----------------------------------------------------
    // SLIDE 7: TREASURES & CURRENCIES
    // ----------------------------------------------------
    {
      id: 7,
      tag: 'CHAPTER VI • ECONOMY',
      title: 'THE 4 REALM CURRENCIES',
      headline: 'Harness Gold, Shards, Shadow Dust, and Sovereigns.',
      description: 'Gold is won in battles to purchase card booster packs. Dark Shards are premium gems used to summon in the Gacha Shrine, buy energy, and unlock passes. Shadow Dust is obtained by disenchanting duplicate cards to ascend your minions up to Divine tier. Blood Sovereigns are real convertible assets (100 SOV = $1.00 USDT) earned through combat and alliances.',
      image: '/landing_p2e_treasury.jpg'
    },

    // ----------------------------------------------------
    // SLIDE 8: ALLIANCE & BANK WITHDRAWALS
    // ----------------------------------------------------
    {
      id: 8,
      tag: 'CHAPTER VII • DESTINY & REWARDS',
      title: 'ALLIANCE & REAL CASHOUTS',
      headline: 'Recruit sworn allies and withdraw your earnings directly.',
      description: 'Share your invite link to build an Alliance. Earn instant Pass Bounties (+300 to +800 SOV) when invited friends activate a Pass, plus a perpetual 15% share of all Blood Sovereigns they win in Arena battles! Unlock up to 500,000 SOV in milestone rewards. All your Sovereigns accumulate in the Bank for direct on-chain withdrawal to USDT, TON, or Solana (100 SOV = $1.00 USDT).',
      image: '/web3_treasury_vault.jpg'
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
          <div className="relative w-full aspect-[16/9] max-h-[190px] rounded-2xl overflow-hidden border border-[#d4af37]/30 shadow-[0_0_20px_rgba(0,0,0,0.8)] bg-black">
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

        {/* Lower Half: Dark Glass Story Narrative Panel */}
        <div className="p-4 sm:p-5 bg-gradient-to-b from-[#141113] via-[#0c090a] to-black border-t border-white/10 flex flex-col justify-between space-y-3 shrink-0">
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
