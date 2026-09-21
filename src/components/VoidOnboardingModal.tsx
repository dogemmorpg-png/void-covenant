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
  paragraphs: React.ReactNode[];
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
      image: '/landing_void_realm.jpg',
      paragraphs: [
        (
          <span>
            You have awakened in <strong className="text-amber-300 font-semibold">Void Covenant</strong>—a dark fantasy card RPG where tactical mastery transforms into tangible glory.
          </span>
        ),
        (
          <span>
            As a newly sworn commander, you will summon demonic legions, ascend through treacherous dungeon towers, and challenge rival summoners in competitive leagues.
          </span>
        ),
        (
          <span>
            Amass real wealth in the Abyss as you forge your sovereign legacy. Your dark journey begins now!
          </span>
        )
      ]
    },

    // ----------------------------------------------------
    // SLIDE 2: DECK & 5 BATTLE SLOTS
    // ----------------------------------------------------
    {
      id: 2,
      tag: 'CHAPTER I • THE BATTLEFIELD',
      title: 'DECK & 5 BATTLE SLOTS',
      headline: 'Command a 10-card deck across 5 mirrored combat slots.',
      image: '/landing_cards_altar.jpg',
      paragraphs: [
        (
          <span>
            Before battle, assemble your Combat Deck with exactly <strong className="text-amber-300 font-semibold">10 cards</strong> in the <strong className="text-amber-200 font-semibold">CARDS</strong> tab.
          </span>
        ),
        (
          <span>
            When combat begins, cards cost <strong className="text-cyan-300 font-semibold">Mana</strong> to summon onto <strong className="text-amber-300 font-semibold">5 mirrored frontline slots</strong>. Creatures strike straight ahead into opposing cards.
          </span>
        ),
        (
          <span>
            If an opposing slot stands empty, all attack damage <strong className="text-rose-400 font-semibold">strikes the enemy Hero directly</strong>! Reduce the rival Hero’s HP to 0 to claim victory.
          </span>
        )
      ]
    },

    // ----------------------------------------------------
    // SLIDE 3: DELAY TIMER, ARMOR & BARRIER
    // ----------------------------------------------------
    {
      id: 3,
      tag: 'CHAPTER II • TACTICAL DEFENSES',
      title: 'DELAY TIMER, ARMOR & BARRIER',
      headline: 'Patience awakens minions; armor and wards preserve them.',
      image: '/gameplay_cinematic_duel.jpg',
      paragraphs: [
        (
          <span>
            Summoned minions do not strike immediately upon placement. Each card possesses a <strong className="text-amber-300 font-semibold">Delay timer (1 to 3 turns)</strong> that counts down by 1 each round.
          </span>
        ),
        (
          <span>
            When Delay reaches 0, the minion awakens to <strong className="text-amber-200 font-semibold">attack every turn</strong>!
          </span>
        ),
        (
          <span>
            <strong className="text-sky-300 font-semibold">Armor</strong> absorbs incoming damage before health is lost, while <strong className="text-amber-300 font-semibold">Divine Barrier</strong> nullifies one entire incoming strike without taking damage.
          </span>
        )
      ]
    },

    // ----------------------------------------------------
    // SLIDE 4: DARK MAGIC & COMMANDER AURAS
    // ----------------------------------------------------
    {
      id: 4,
      tag: 'CHAPTER III • DARK SORCERY',
      title: 'MINION CURSES & STANCES',
      headline: 'Cast ancient afflictions and channel your Lord’s aura.',
      image: '/dark_heroes_lore.jpg',
      paragraphs: [
        (
          <span>
            Minions wield 4 dark curses: <strong className="text-purple-300 font-semibold">Hex</strong> (amplifies damage taken by target), <strong className="text-red-400 font-semibold">Vampirism</strong> (heals minion upon striking), <strong className="text-emerald-400 font-semibold">Plague</strong> (deals toxic damage over time), and <strong className="text-amber-400 font-semibold">Sacrifice</strong> (destroys an ally to heal your Hero and grant colossal stat buffs).
          </span>
        ),
        (
          <span>
            In addition, your Lord channels an active Stance (<strong className="text-purple-300 font-semibold">Void Strike</strong>, <strong className="text-rose-400 font-semibold">Blood Aura</strong>, or <strong className="text-amber-300 font-semibold">Warlord’s Cry</strong>) that can trigger each round.
          </span>
        ),
        (
          <span>
            Upgrade your Stances and unlock passive enhancements in the <strong className="text-amber-200 font-semibold">TALENTS</strong> tab!
          </span>
        )
      ]
    },

    // ----------------------------------------------------
    // SLIDE 5: CAMPAIGN, ENERGY & SWEEP
    // ----------------------------------------------------
    {
      id: 5,
      tag: 'CHAPTER IV • EXPEDITIONS',
      title: 'CAMPAIGN, ENERGY & SWEEPS',
      headline: 'Conquer the abyssal tower and harvest instant spoils.',
      image: '/landing_warlord_duel.jpg',
      paragraphs: [
        (
          <span>
            Venture through the Campaign floors using <strong className="text-amber-300 font-semibold">PvE Energy</strong>, which recharges automatically over time.
          </span>
        ),
        (
          <span>
            Formidable <strong className="text-rose-400 font-semibold">Bosses</strong> await every 10 floors (Floor 10, 20, 30...) offering high-value first-clear <strong className="text-amber-300 font-semibold">Blood Sovereign bounties</strong>.
          </span>
        ),
        (
          <span>
            Master any floor with a perfect 3-Star victory to unlock <strong className="text-yellow-300 font-semibold">1-click Instant Sweeps</strong>, allowing you to instantly harvest Gold and EXP without re-fighting!
          </span>
        )
      ]
    },

    // ----------------------------------------------------
    // SLIDE 6: THE ARENA & LEAGUES
    // ----------------------------------------------------
    {
      id: 6,
      tag: 'CHAPTER V • THE ARENA',
      title: 'DUELS, 12 LEAGUES & SHIELDS',
      headline: 'Duel living rivals, claim daily league cash rewards, and earn Sovereigns.',
      image: '/landing_tactical_arena.jpg',
      paragraphs: [
        (
          <span>
            Spend <strong className="text-amber-300 font-semibold">PvP Tickets</strong> to challenge rival summoners on the Arena. Pass subscribers earn real <strong className="text-red-400 font-semibold">Blood Sovereigns</strong> for every single victory!
          </span>
        ),
        (
          <span>
            Ascend through 12 competitive tiers from <strong className="text-zinc-200 font-semibold">Bronze to Divine</strong> to earn <strong className="text-amber-300 font-semibold">daily cash rewards</strong> in Blood Sovereigns based on your league leaderboard rank.
          </span>
        ),
        (
          <span>
            Before you go offline, activate <strong className="text-sky-300 font-semibold">Peace Shields</strong> (3h, 6h, 12h) to protect your rating and crowns from retaliatory enemy attacks.
          </span>
        )
      ]
    },

    // ----------------------------------------------------
    // SLIDE 7: TREASURES & CURRENCIES
    // ----------------------------------------------------
    {
      id: 7,
      tag: 'CHAPTER VI • ECONOMY',
      title: 'THE 4 REALM CURRENCIES',
      headline: 'Harness Gold, Shards, Shadow Dust, and Sovereigns.',
      image: '/landing_p2e_treasury.jpg',
      paragraphs: [
        (
          <span>
            <strong className="text-amber-300 font-semibold">Gold</strong> is won in battles to purchase card booster packs, basic equipment, and upgrades.
          </span>
        ),
        (
          <span>
            <strong className="text-purple-300 font-semibold">Dark Shards</strong> are premium gems used to buy exclusive equipment sets, summon in the Gacha Shrine, buy energy, and unlock passes.
          </span>
        ),
        (
          <span>
            <strong className="text-teal-300 font-semibold">Shadow Dust</strong> is obtained by disenchanting duplicate cards to ascend minions up to Divine tier.
          </span>
        ),
        (
          <span>
            <strong className="text-red-400 font-semibold">Blood Sovereigns</strong> are real convertible assets (<strong className="text-amber-300 font-semibold">100 SOV = $1.00 USDT</strong>) earned through combat and alliances.
          </span>
        )
      ]
    },

    // ----------------------------------------------------
    // SLIDE 8: ALLIANCE & BANK WITHDRAWALS
    // ----------------------------------------------------
    {
      id: 8,
      tag: 'CHAPTER VII • DESTINY & REWARDS',
      title: 'ALLIANCE & REAL CASHOUTS',
      headline: 'Recruit sworn allies and withdraw your earnings directly.',
      image: '/web3_treasury_vault.jpg',
      paragraphs: [
        (
          <span>
            Share your invite link to build an Alliance. Earn instant <strong className="text-amber-300 font-semibold">Pass Bounties</strong> (+300 SOV for Premium, +600 SOV for Ultra) when invited friends activate a Pass!
          </span>
        ),
        (
          <span>
            Earn a perpetual <strong className="text-emerald-400 font-semibold">15% share</strong> of all Blood Sovereigns they win in Arena battles, and unlock up to <strong className="text-amber-300 font-semibold">500,000 SOV</strong> in milestone rewards!
          </span>
        ),
        (
          <span>
            All your Sovereigns accumulate in the Bank for direct on-chain withdrawal to <strong className="text-cyan-300 font-semibold">USDT, TON, or Solana</strong> (<strong className="text-amber-300 font-semibold">100 SOV = $1.00 USDT</strong>).
          </span>
        )
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
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 select-none overflow-hidden">
      {/* 1. Rich Atmospheric Background with Cosmic Violet/Amber Nebula & Vignette */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.img
          src="/landing_void_realm.jpg"
          alt="Void Atmosphere"
          initial={{ scale: 1.05 }}
          animate={{ scale: [1.05, 1.1, 1.05] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          className="w-full h-full object-cover filter blur-xl brightness-[0.45] contrast-125 opacity-50"
        />
        {/* Layered dark fantasy gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/85" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(120,53,140,0.22)_0%,_rgba(5,4,7,0.92)_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.12)_0%,_transparent_60%)]" />
      </div>

      {/* 2. Gothic Monolithic Modal Shell */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="relative w-full max-w-md bg-gradient-to-b from-[#161019]/95 via-[#0d090f]/98 to-[#040305] border-2 border-[#d4af37]/50 rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.95),0_0_35px_rgba(212,175,55,0.22),inset_0_1px_2px_rgba(255,255,255,0.15)] backdrop-blur-2xl overflow-hidden flex flex-col h-auto max-h-[96vh]"
      >
        {/* Ornate Top Hairline Glow */}
        <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-[#ffd875] to-transparent shadow-[0_0_8px_#ffd875] pointer-events-none" />

        {/* Modal Outer Frame Corner Runes */}
        <div className="absolute top-2 left-2.5 text-[#ebd09b]/30 font-serif text-[10px] pointer-events-none select-none">⟦Ω⟧</div>
        <div className="absolute top-2 right-2.5 text-[#ebd09b]/30 font-serif text-[10px] pointer-events-none select-none">⟦Ω⟧</div>
        <div className="absolute bottom-2 left-2.5 text-[#ebd09b]/30 font-serif text-[10px] pointer-events-none select-none">⟦Ω⟧</div>
        <div className="absolute bottom-2 right-2.5 text-[#ebd09b]/30 font-serif text-[10px] pointer-events-none select-none">⟦Ω⟧</div>

        {/* Top Story Progress Bars (8 Segments) */}
        <div className="px-4 pt-3 pb-1.5 flex items-center gap-1.5 z-20 shrink-0">
          {slides.map((_, idx) => (
            <div
              key={idx}
              onClick={() => {
                setCurrentSlide(idx);
                triggerHaptic();
              }}
              className="h-1 flex-1 rounded-full overflow-hidden bg-white/10 cursor-pointer transition-all border border-white/5"
            >
              <div
                className={`h-full transition-all duration-300 ${
                  idx < currentSlide
                    ? 'w-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                    : idx === currentSlide
                    ? 'w-full bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)]'
                    : 'w-0'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Header Bar with Chapter Tag & Stylized Skip Button */}
        <div className="px-4 py-1 flex items-center justify-between z-20 shrink-0">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-amber-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-sm bg-amber-400 rotate-45 inline-block shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
            <span>{current.tag}</span>
            <span className="text-zinc-600">•</span>
            <span className="text-amber-200/90">{current.id}/8</span>
          </div>

          <button
            onClick={onClose}
            className="text-[10px] font-mono uppercase tracking-wider text-amber-300/80 hover:text-amber-100 transition-colors cursor-pointer flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-950/40 border border-amber-500/25 hover:border-amber-400/50 shadow-sm active:scale-95"
          >
            <span>Skip</span>
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Upper Half: Ornate Cinematic Keyart Frame with Corner Accents */}
        <div className="relative w-full px-3.5 pt-1 pb-1 shrink-0 flex items-center justify-center">
          <div className="relative w-full aspect-[16/9] max-h-[175px] rounded-2xl overflow-hidden border-2 border-[#d4af37]/45 shadow-[0_0_30px_rgba(0,0,0,0.9),0_0_15px_rgba(212,175,55,0.18)] bg-black">
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 pointer-events-none" />
            <div className="absolute inset-0 ring-1 ring-inset ring-[#ffd875]/25 rounded-2xl pointer-events-none" />

            {/* Corner Runes */}
            <span className="absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-400/80 pointer-events-none" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t-2 border-r-2 border-amber-400/80 pointer-events-none" />
            <span className="absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b-2 border-l-2 border-amber-400/80 pointer-events-none" />
            <span className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-400/80 pointer-events-none" />
          </div>
        </div>

        {/* Lower Half: Dark Glass Story Narrative Panel with Clean Open Paragraphs */}
        <div className="p-4 sm:p-5 bg-gradient-to-b from-[#141018] via-[#0c080e] to-black border-t border-[#d4af37]/35 shadow-[0_-2px_12px_rgba(0,0,0,0.5)] flex flex-col justify-between space-y-3 shrink-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16 }}
              className="space-y-2.5"
            >
              <div>
                <h2 className="text-base sm:text-lg font-display font-black text-[#ebd09b] tracking-wider uppercase text-shadow-sm">
                  {current.title}
                </h2>
                <p className="text-[11px] sm:text-xs font-semibold text-zinc-200 leading-snug mt-0.5">
                  {current.headline}
                </p>
              </div>

              {/* Formatted Paragraphs: Clean, elegant, unboxed layout with glowing amber pips */}
              <div className="space-y-2 pt-0.5">
                {current.paragraphs.map((para, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-left">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                    <p className="text-[11.5px] sm:text-xs leading-relaxed text-zinc-300 font-sans flex-1">
                      {para}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Action Buttons Row with Burnished Metallic Finish */}
          <div className="pt-1 flex items-center gap-2.5">
            {currentSlide > 0 && (
              <button
                onClick={handlePrev}
                className="py-3 px-3.5 rounded-xl bg-gradient-to-b from-[#251c27] via-[#1a131c] to-[#100a12] hover:from-[#2e2332] hover:to-[#18111c] text-amber-300 hover:text-amber-100 text-xs font-mono font-bold flex items-center justify-center cursor-pointer active:scale-95 transition-all border border-[#d4af37]/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_8px_rgba(0,0,0,0.6)]"
                title="Previous Slide"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex-1 py-3.5 px-4 rounded-xl font-display font-black text-xs sm:text-sm tracking-[0.22em] uppercase flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-all bg-gradient-to-r from-[#b3894a] via-[#f3d38c] to-[#b3894a] hover:from-[#c59a58] hover:via-[#fae1a2] hover:to-[#c59a58] text-[#1a0f05] border border-[#ebd09b]/80 shadow-[0_4px_25px_rgba(229,194,120,0.35),inset_0_1px_1px_rgba(255,255,255,0.7)]"
            >
              <span>{isFinalSlide ? 'SEAL THE PACT & ENTER' : 'CONTINUE'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
