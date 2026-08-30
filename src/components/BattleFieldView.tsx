import React, { useState, useEffect, useRef } from 'react';
import { getCardTierStyles } from '../utils/tierStyles';
import { audioSystem } from '../utils/AudioSystem';
import { useGame } from '../context/GameContext';
import { useToast } from './Toast';
import { CampaignStage, BattleState, BattleCardState } from '../types';
import { initializeBattle, simulateCombatTurn, toBattleCard, placeCardLocally } from '../utils/gameLogic';
import { 
  Swords, 
  Skull, 
  Shield, 
  Zap, 
  ChevronRight, 
  HelpCircle, 
  ArrowLeft, 
  Pause, 
  Play, 
  Activity,
  Plus,
  Star,
  Award,
  Scroll,
  X,
  Droplet,
  Bug
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { assetPreloader } from '../utils/assetPreloader';



const renderManaIcon = (cost: number, sizeClass: string = "w-5 h-5") => {
  return (
    <div className={`relative ${sizeClass} shrink-0 flex items-center justify-center`}>
      <svg className="absolute inset-0 w-full h-full filter drop-shadow-[0_0_5px_rgba(6,182,212,0.85)]" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L4 7v10l8 5 8-5V7l-8-5z" fill="url(#manaCrystalGradField)" stroke="#66fcf1" strokeWidth="1.5" />
        <path d="M12 2L4 7l8 5 8-5-8-5z" fill="#66fcf1" opacity="0.35" />
        <path d="M4 7v10l8 5V12L4 7z" fill="#00d2ff" opacity="0.55" />
        <path d="M20 7v10l8 5V12L20 7z" fill="#005299" opacity="0.75" />
        <defs>
          <radialGradient id="manaCrystalGradField" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00f0ff" />
            <stop offset="100%" stopColor="#0033aa" />
          </radialGradient>
        </defs>
      </svg>
      <span className="relative text-white text-[10px] md:text-[11px] font-black font-mono leading-none z-10 drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.95)]">
        {cost}
      </span>
    </div>
  );
};


const renderSkillIcon = (type: string, sizeClass: string = "w-4 h-4") => {
  const normType = type?.toLowerCase();
  switch (normType) {
    case 'vampirism':
      return (
        <div className={`relative ${sizeClass} shrink-0 flex items-center justify-center`}>
          <svg className="w-full h-full filter drop-shadow-[0_0_3px_rgba(239,68,68,0.7)]" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C12 2 4 10 4 15C4 19.4 7.6 23 12 23C16.4 23 20 19.4 20 15C20 10 12 2 12 2Z" fill="#ef4444" stroke="#fca5a5" strokeWidth="1" />
            <path d="M9 14.5C9 12 11.5 10 11.5 10" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
          </svg>
        </div>
      );
    case 'plague':
      return (
        <div className={`relative ${sizeClass} shrink-0 flex items-center justify-center`}>
          <svg className="w-full h-full filter drop-shadow-[0_0_3px_rgba(16,185,129,0.7)]" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="5" fill="#10b981" stroke="#a7f3d0" strokeWidth="1" />
            <circle cx="12" cy="4.5" r="2.1" fill="#10b981" />
            <circle cx="12" cy="19.5" r="2.1" fill="#10b981" />
            <circle cx="4.5" cy="12" r="2.1" fill="#10b981" />
            <circle cx="19.5" cy="12" r="2.1" fill="#10b981" />
            <circle cx="6.5" cy="6.5" r="1.8" fill="#10b981" />
            <circle cx="17.5" cy="17.5" r="1.8" fill="#10b981" />
            <circle cx="6.5" cy="17.5" r="1.8" fill="#10b981" />
            <circle cx="17.5" cy="6.5" r="1.8" fill="#10b981" />
            <path d="M12 4.5V19.5M4.5 12H19.5" stroke="#10b981" strokeWidth="1.5" />
          </svg>
        </div>
      );
    case 'hex':
      return (
        <div className={`relative ${sizeClass} shrink-0 flex items-center justify-center`}>
          <svg className="w-full h-full filter drop-shadow-[0_0_3px_rgba(168,85,247,0.7)]" viewBox="0 0 24 24" fill="none">
            <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="#c084fc" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="4.5" fill="#a855f7" stroke="#e9d5ff" strokeWidth="1" />
            <circle cx="12" cy="12" r="1.8" fill="#1e1b4b" />
          </svg>
        </div>
      );
    case 'sacrifice':
      return (
        <div className={`relative ${sizeClass} shrink-0 flex items-center justify-center`}>
          <svg className="w-full h-full filter drop-shadow-[0_0_3px_rgba(239,68,68,0.8)]" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C7.5 2 4 5.5 4 10C4 12.9 5.5 15.5 8 16.8V20.5C8 21.3 8.7 22 9.5 22H14.5C15.3 22 16 21.3 16 20.5V16.8C18.5 15.5 20 12.9 20 10C20 5.5 16.5 2 12 2Z" fill="#ef4444" stroke="#fca5a5" strokeWidth="1" />
            <circle cx="9" cy="10" r="1.8" fill="#1a0202" />
            <circle cx="15" cy="10" r="1.8" fill="#1a0202" />
            <path d="M12 12.5L10.5 14.5H13.5L12 12.5Z" fill="#1a0202" />
            <path d="M9.5 18H14.5M10.5 16v4M12.5 16v4" stroke="#1a0202" strokeWidth="1" />
          </svg>
        </div>
      );
    default:
      return null;
  }
};

const BarrierDome: React.FC = () => (
  <div className="absolute inset-0 z-25 pointer-events-none rounded-xl overflow-hidden">
    {/* Ethereal Glowing Golden Divine Shield Frame */}
    <div className="absolute inset-0 rounded-xl border-2 border-amber-400/85 shadow-[0_0_16px_rgba(251,191,36,0.65),inset_0_0_12px_rgba(251,191,36,0.3)] animate-pulse" />
    
    {/* Soft Radiant Light Sweep Overlay */}
    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-200/15 to-transparent pointer-events-none" />

    {/* Radiant Ornate Shield Corners */}
    <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-300 shadow-[0_0_6px_rgba(251,191,36,1)]" />
    <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-amber-300 shadow-[0_0_6px_rgba(251,191,36,1)]" />
    <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-amber-300 shadow-[0_0_6px_rgba(251,191,36,1)]" />
    <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-300 shadow-[0_0_6px_rgba(251,191,36,1)]" />

    {/* Elegant Glowing Divine Crest at Top Center */}
    <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center">
      <div className="w-5 h-5 rounded-full bg-gradient-to-b from-amber-900 to-black border border-amber-300/90 flex items-center justify-center shadow-[0_0_10px_rgba(251,191,36,0.9)]">
        <svg className="w-3.5 h-3.5 text-amber-300 filter drop-shadow-[0_0_3px_rgba(251,191,36,0.9)]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L4 5V11C4 16.55 7.4 21.74 12 23C16.6 21.74 20 16.55 20 11V5L12 2Z" />
        </svg>
      </div>
    </div>
  </div>
);

const BarrierShatterOverlay: React.FC = () => (
  <motion.div
    initial={{ opacity: 1, scale: 0.95 }}
    animate={{ opacity: 0, scale: 1.35 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className="absolute -inset-2 z-40 flex items-center justify-center pointer-events-none rounded-xl overflow-visible"
  >
    {/* Golden Shockwave Expanding */}
    <div className="absolute inset-0 rounded-xl border-2 border-amber-300 shadow-[0_0_30px_rgba(251,191,36,1)]" />
    
    {/* Radial Divine Shards */}
    <svg className="w-full h-full filter drop-shadow-[0_0_10px_rgba(251,191,36,1)] animate-spin" style={{ animationDuration: '0.6s' }} viewBox="0 0 100 100" fill="none">
      <polygon points="50,15 54,28 46,28" fill="#fde68a" />
      <polygon points="85,50 72,54 72,46" fill="#f59e0b" />
      <polygon points="50,85 46,72 54,72" fill="#fde68a" />
      <polygon points="15,50 28,46 28,54" fill="#fbbf24" />
      <polygon points="75,25 66,33 62,25" fill="#f59e0b" />
      <polygon points="25,75 34,67 25,63" fill="#fde68a" />
      <polygon points="75,75 66,67 74,62" fill="#fbbf24" />
      <polygon points="25,25 34,33 25,37" fill="#f59e0b" />
    </svg>
  </motion.div>
);

const ArmorBadge: React.FC<{ armor: number }> = ({ armor }) => (
  <div className="absolute -top-3.5 -left-3.5 w-9 h-9 z-20 flex items-center justify-center pointer-events-none" title={`Armor: ${armor}`}>
    <img src="/icons/gothic_armor.webp" alt="ARM" className="absolute inset-0 w-full h-full object-cover rounded-lg border border-zinc-700/50 shadow-md" />
    <span 
      className="relative text-[#38bdf8] text-[15px] font-black font-mono leading-none select-none z-10" 
      style={{ textShadow: '2px 2px 2px #000, -2px -2px 2px #000, 2px -2px 2px #000, -2px 2px 2px #000, 0 0 5px #000' }}
    >
      {armor}
    </span>
  </div>
);

const ArmorSparkOverlay: React.FC = () => (
  <motion.div
    initial={{ opacity: 1, scale: 0.8 }}
    animate={{ opacity: 0, scale: 1.25 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.4 }}
    className="absolute inset-0 z-35 flex items-center justify-center pointer-events-none rounded-xl overflow-hidden bg-slate-300/30"
  >
    <div className="w-16 h-16 rounded-full border-4 border-slate-200 shadow-[0_0_25px_rgba(241,245,249,1)] animate-ping" />
  </motion.div>
);

const ArmorBreakOverlay: React.FC = () => (
  <motion.div
    initial={{ opacity: 1, scale: 0.9 }}
    animate={{ opacity: 0, scale: 1.3 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.55 }}
    className="absolute inset-0 z-35 flex items-center justify-center pointer-events-none rounded-xl overflow-hidden bg-cyan-950/40 border-2 border-cyan-400 shadow-[0_0_20px_rgba(56,189,248,0.8)]"
  >
    <div className="w-12 h-12 rounded-full border-2 border-dashed border-cyan-300 shadow-[0_0_20px_rgba(56,189,248,1)] animate-ping" />
  </motion.div>
);

interface BattleFieldViewProps {
  stage: CampaignStage;
  onExitBattle: (victory: boolean) => void;
  battleType?: 'campaign' | 'pvp';
}

// Visual text floating effects
interface FloatingTextEffect {
  id: string;
  text: string;
  target: 'player-hero' | 'enemy-hero' | { side: 'player' | 'enemy'; slot: number };
  colorClass: string;
  xOffset?: number;
}

// Card tier helper functions for pristine styling
const getTierBorderColor = (tier: string) => {
  switch (tier?.toLowerCase()) {
    case 'bronze': return 'border-amber-700/60';
    case 'silver': return 'border-slate-400/60';
    case 'gold': return 'border-yellow-500/80';
    case 'obsidian': return 'border-purple-500/80';
    default: return 'border-amber-500/30';
  }
};

const getTierBgGradient = (tier: string) => {
  switch (tier?.toLowerCase()) {
    case 'bronze': return 'from-amber-950/40 via-[#151a21] to-[#0d1117]';
    case 'silver': return 'from-slate-900/40 via-[#151a21] to-[#0d1117]';
    case 'gold': return 'from-yellow-950/30 via-[#151a21] to-[#0d1117]';
    case 'obsidian': return 'from-purple-950/30 via-[#151a21] to-[#0d1117]';
    default: return 'from-gray-900 via-[#151a21] to-[#0d1117]';
  }
};

const getTierTextColor = (tier: string) => {
  switch (tier?.toLowerCase()) {
    case 'bronze': return 'text-amber-500';
    case 'silver': return 'text-slate-300';
    case 'gold': return 'text-yellow-400 font-bold';
    case 'obsidian': return 'text-purple-400 font-bold';
    default: return 'text-gray-400';
  }
};

const getSkillBadgeStyle = (type: string) => {
  switch (type?.toLowerCase()) {
  

        case 'sacrifice': return 'bg-red-950/50 border-red-900/50 text-red-400';
    case 'vampirism': return 'bg-rose-950/50 border-rose-900/50 text-rose-300';
    case 'hex': return 'bg-purple-950/50 border-purple-900/50 text-purple-300';
    case 'plague': return 'bg-emerald-950/50 border-emerald-900/50 text-emerald-300';
    default: return 'bg-gray-950/50 border-gray-800 text-gray-300';
  }
};

const getSkillIcon = (type: string) => {
  return renderSkillIcon(type, "w-3.5 h-3.5");
};

const getSkillNameEnglish = (type: string) => {
  switch (type?.toLowerCase()) {
  

        case 'sacrifice': return 'Sacrifice';
    case 'vampirism': return 'Vampirism';
    case 'hex': return 'Hex';
    case 'plague': return 'Plague';
    default: return type;
  }
};

const getSkillDescEnglish = (type: string, value: number) => {
  switch (type?.toLowerCase()) {
  

        case 'sacrifice': return `Ally sacrifice: destroys a random friendly creature on play, healing your Lord by +${value} HP and permanently buffing stats by +${Math.round(value/2)} ATK and +${value} HP.`;
    case 'vampirism': return `Heals this card by +${value} HP every time it deals damage to the enemy opposite.`;
    case 'hex': return `Hexes the opposite card, increasing all next incoming damage by +${value}.`;
    case 'plague': return `Spreads plague at the end of each turn, dealing -${value} HP to a random living enemy card.`;
    default: return `Special ability of power ${value}.`;
  }
};

export const BattleFieldView: React.FC<BattleFieldViewProps> = ({ stage, onExitBattle, battleType = 'campaign' }) => {
  const { profile, setProfile, submitBattleResult } = useGame();
  const toast = useToast();
  
  // Calculate total bonuses from equipped items by type
  const getEquipmentBonus = (bonusType: string) => {
    let bonus = 0;
    Object.values(profile.equipped).forEach(eqId => {
      const eq = profile.equipment.find(e => e.id === eqId);
      if (eq && eq.bonusType === bonusType) {
        bonus += eq.bonusValue;
      }
    });
    return bonus;
  };

  const [battle, setBattle] = useState<BattleState>(() => initializeBattle(
    (profile?.collection || []).filter(c => (profile?.deck || []).includes(c.id)),
    stage,
    (profile?.heroMaxHealth || 30) + getEquipmentBonus('maxHealth'),
    getEquipmentBonus('dodge'),
    getEquipmentBonus('delayReduction')
  ));

  // Preload battle creature assets immediately
  useEffect(() => {
    if (stage?.enemyDeck) {
      assetPreloader.preloadBattleCreatures(stage.enemyDeck);
    }
    const playerDeck = (profile?.collection || []).filter(c => (profile?.deck || []).includes(c.id));
    assetPreloader.preloadBattleCreatures(playerDeck);
  }, [stage, profile?.deck]);

  // Visual/Animate battle state (used to update UI step-by-step)
  const [visualState, setVisualState] = useState<BattleState>(battle);

  // Hand selection and simulators
  const [selectedHandCardId, setSelectedHandCardId] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Sequencer Playback state
  const [isAnimating, setIsAnimating] = useState(false);
  const [animateSequence, setAnimateSequence] = useState<any[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [activeLogStepText, setActiveLogStepText] = useState<string>('');

  // Active animation targets for cards movement and effects
  const [animatingSlot, setAnimatingSlot] = useState<{
    side: 'player' | 'enemy';
    slot: number;
    type: 'strike' | 'hit' | 'death' | 'heal';
  } | null>(null);

  // Armor and Barrier VFX slot states
  const [barrierShatterSlot, setBarrierShatterSlot] = useState<{ side: 'player' | 'enemy'; slot: number } | null>(null);
  const [armorSparkSlot, setArmorSparkSlot] = useState<{ side: 'player' | 'enemy'; slot: number } | null>(null);
  const [armorBreakSlot, setArmorBreakSlot] = useState<{ side: 'player' | 'enemy'; slot: number } | null>(null);

  // Floating text array
  const [floatingTexts, setFloatingTexts] = useState<FloatingTextEffect[]>([]);

  // Hover analyst and modal info
  const [hoveredCard, setHoveredCard] = useState<BattleCardState | null>(null);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showLogDrawer, setShowLogDrawer] = useState<boolean>(false);
  const [hoveredHandCardIndex, setHoveredHandCardIndex] = useState<number | null>(null);

  // Track the final target battle state once the calculation resolves
  const [finalBattleState, setFinalBattleState] = useState<BattleState | null>(null);

  // Automatically sync visualState with battle when not actively animating combat steps
  useEffect(() => {
    if (!isAnimating) {
      setVisualState(battle);
    }
  }, [battle, isAnimating]);

  // Scroll to bottom of logs on new changes
  useEffect(() => {
    const logContainer = document.getElementById('combat-log-scroll');
    if (logContainer) {
      logContainer.scrollTop = logContainer.scrollHeight;
    }
  }, [battle.combatLog, visualState.combatLog]);

  // Method to easily spawn floating numbers/texts
  const addFloatingText = (
    text: string, 
    target: 'player-hero' | 'enemy-hero' | { side: 'player' | 'enemy'; slot: number }, 
    colorClass: string
  ) => {
    const id = `float_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const xOffset = (Math.random() - 0.5) * 50; // Random horizontal bounce direction
    setFloatingTexts(prev => [...prev, { id, text, target, colorClass, xOffset }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(f => f.id !== id));
    }, 1000);
  };


  // Setup the visual starting state before playing steps
  const setupPlaybackState = (playedCardId: string | null, playedSlotIndex: number | null, steps: any[]) => {
    const playState = JSON.parse(JSON.stringify(battle)) as BattleState;

    // 1. Player play card logic with Sacrifice visual sync
    if (playedCardId && playedSlotIndex !== null) {
      const cardIndex = playState.playerHand.findIndex(c => c.id === playedCardId);
      if (cardIndex !== -1) {
        const card = playState.playerHand[cardIndex];
        const bCard = toBattleCard(card);
        
        const sacrificeSkill = bCard.skills.find(s => s.type === 'sacrifice');
        const activeAlliesCount = playState.playerBoard.filter(c => c !== null && !c.isDead).length;
        
        if (sacrificeSkill && activeAlliesCount > 0) {
          const sacStep = steps.find(s => s.type === 'sacrifice');
          if (sacStep) {
            const targetSlot = sacStep.targetSlot;
            const sacrificedCard = playState.playerBoard[targetSlot];
            if (sacrificedCard) {
              sacrificedCard.isDead = true;
              playState.playerBoard[targetSlot] = null;
            }
            playState.playerHeroHealth = Math.min(playState.playerHeroMaxHealth, playState.playerHeroHealth + sacrificeSkill.value);
            bCard.attack += Math.round(sacrificeSkill.value / 2);
            bCard.health += sacrificeSkill.value;
            bCard.maxHealth += sacrificeSkill.value;
          }
        }
        
        playState.playerBoard[playedSlotIndex] = bCard;
        playState.playerHand.splice(cardIndex, 1);
      }
    }

    // 2. Enemy plays card logic
    const enemyPlayStep = steps.find(s => s.type === 'enemy_play');
    if (enemyPlayStep) {
      const enemyCard = JSON.parse(JSON.stringify(enemyPlayStep.card)) as BattleCardState;
      
      const enemySacSkill = enemyCard.skills.find(s => s.type === 'sacrifice');
      const enemyAlliesCount = playState.enemyBoard.filter(c => c !== null && !c.isDead).length;
      if (enemySacSkill && enemyAlliesCount > 0) {
        const enemyActiveSlots: number[] = [];
        playState.enemyBoard.forEach((c, idx) => {
          if (c && !c.isDead) enemyActiveSlots.push(idx);
        });
        if (enemyActiveSlots.length > 0) {
          const randSlot = enemyActiveSlots[0];
          const sacrCard = playState.enemyBoard[randSlot];
          if (sacrCard) {
            sacrCard.isDead = true;
            playState.enemyBoard[randSlot] = null;
          }
          playState.enemyHeroHealth = Math.min(playState.enemyHeroMaxHealth, playState.enemyHeroHealth + enemySacSkill.value);
          enemyCard.attack += Math.round(enemySacSkill.value / 2);
          enemyCard.health += enemySacSkill.value;
          enemyCard.maxHealth += enemySacSkill.value;
        }
      }
      
      playState.enemyBoard[enemyPlayStep.slot] = enemyCard;
      playState.enemyHand.shift();
      playState.enemyDeckSize = playState.enemyHand.length;
    }

    // 3. Decrement Delays visually
    for (let i = 0; i < 5; i++) {
      const pCard = playState.playerBoard[i];
      const eCard = playState.enemyBoard[i];
      if (pCard && pCard.delay > 0) {
        pCard.delay = Math.max(0, pCard.delay - 1);
      }
      if (eCard && eCard.delay > 0) {
        eCard.delay = Math.max(0, eCard.delay - 1);
      }
    }

    // Initialize visual state
    setVisualState(playState);
    setAnimateSequence(steps);
    setCurrentStepIndex(0);
    setIsAnimating(true);
  };

  // Core Combat turn step runner
  useEffect(() => {
    if (currentStepIndex === -1 || currentStepIndex >= animateSequence.length || isPaused) return;

    const step = animateSequence[currentStepIndex];
    let stepDescription = '';

    const stepDuration = 1100 / speedMultiplier;

    setVisualState(prev => {
      const copy = JSON.parse(JSON.stringify(prev)) as BattleState;
      
      switch (step.type) {
        case 'sacrifice': {
          const placingCard = copy.playerBoard[step.slot];
          const sacrCard = copy.playerBoard[step.targetSlot];
          
          stepDescription = `💀 Sacrifice: ${placingCard?.name || 'Card'} destroys ${sacrCard?.name || 'ally'}`;
          
          copy.playerBoard[step.targetSlot] = null;
          if (placingCard) {
            placingCard.attack += step.buffAttack;
            placingCard.health += step.buffHealth;
            placingCard.maxHealth += step.buffHealth;
          }
          copy.playerHeroHealth = Math.min(copy.playerHeroMaxHealth, copy.playerHeroHealth + step.healAmount);

          audioSystem.playHeal();
          setAnimatingSlot({ side: 'player', slot: step.slot, type: 'heal' });
          addFloatingText('💀 SACRIFICE', { side: 'player', slot: step.targetSlot }, 'text-red-500 font-bold scale-110');
          addFloatingText(`+${step.healAmount} HP 💚`, 'player-hero', 'text-emerald-400 font-black text-sm');
          addFloatingText(`+${step.buffAttack}⚔️ +${step.buffHealth}❤️`, { side: 'player', slot: step.slot }, 'text-yellow-400 font-bold');
          break;
        }

        case 'enemy_play': {
          stepDescription = `😈 Dark Summon: Lord summons ${step.card.name}`;
          copy.enemyBoard[step.slot] = step.card;

          audioSystem.playPlace();
          setAnimatingSlot({ side: 'enemy', slot: step.slot, type: 'heal' });
          addFloatingText('SUMMON', { side: 'enemy', slot: step.slot }, 'text-[#ebd09b] font-bold tracking-widest');
          break;
        }

        case 'attack': {
          const attackerCard = step.attacker === 'player' ? copy.playerBoard[step.slot] : copy.enemyBoard[step.slot];
          const defenderCard = step.attacker === 'player' ? copy.enemyBoard[step.targetSlot] : copy.playerBoard[step.targetSlot];
          const defSide = step.attacker === 'player' ? 'enemy' : 'player';
          
          stepDescription = `🗡️ Duel: ${attackerCard?.name || 'Creature'} deals -${step.damage} damage to ${defenderCard?.name || 'Target'}`;

          audioSystem.playAttack();
          setAnimatingSlot({ side: step.attacker, slot: step.slot, type: 'strike' });

          setTimeout(() => {
            setAnimatingSlot({ side: defSide, slot: step.targetSlot, type: 'hit' });
            
            if (defenderCard) {
              if (step.barrierBlocked) {
                defenderCard.barrier = false;
                defenderCard.ward = false;
                setBarrierShatterSlot({ side: defSide, slot: step.targetSlot });
                setTimeout(() => setBarrierShatterSlot(null), 850 / speedMultiplier);
                addFloatingText('✨ BARRIER BLOCKED!', { side: defSide, slot: step.targetSlot }, 'text-amber-300 font-black text-xs scale-125 text-shadow-glow');
              } else {
                if (step.armorAbsorbed > 0) {
                  defenderCard.armor = Math.max(0, (defenderCard.armor || 0) - step.armorAbsorbed);
                  setArmorSparkSlot({ side: defSide, slot: step.targetSlot });
                  setTimeout(() => setArmorSparkSlot(null), 500 / speedMultiplier);
                  addFloatingText(`🛡️ -${step.armorAbsorbed} ARMOR`, { side: defSide, slot: step.targetSlot }, 'text-cyan-300 font-black text-xs');
                }
                if (step.armorBroken) {
                  defenderCard.armor = 0;
                  setArmorBreakSlot({ side: defSide, slot: step.targetSlot });
                  setTimeout(() => setArmorBreakSlot(null), 850 / speedMultiplier);
                  addFloatingText('💥 ARMOR BROKEN!', { side: defSide, slot: step.targetSlot }, 'text-red-400 font-black text-xs scale-110');
                }
                if (step.damage > 0) {
                  defenderCard.health = Math.max(0, defenderCard.health - step.damage);
                  addFloatingText(`-${step.damage}`, { side: defSide, slot: step.targetSlot }, 'text-red-500 font-black text-sm scale-125 text-shadow-glow');
                }
              }
            }
            if (attackerCard && step.vampireHeal > 0) {
              attackerCard.health = Math.min(attackerCard.maxHealth, attackerCard.health + step.vampireHeal);
              addFloatingText(`+${step.vampireHeal} 🩸`, { side: step.attacker, slot: step.slot }, 'text-emerald-400 font-extrabold text-xs');
            }
          }, 180 / speedMultiplier);
          break;
        }

        case 'direct_attack': {
          const attackerCard = step.attacker === 'player' ? copy.playerBoard[step.slot] : copy.enemyBoard[step.slot];
          stepDescription = `💥 Breakthrough: ${attackerCard?.name || 'Creature'} deals -${step.damage} direct damage to Lord!`;

          setAnimatingSlot({ side: step.attacker, slot: step.slot, type: 'strike' });

          setTimeout(() => {
            if (step.attacker === 'player') {
              copy.enemyHeroHealth = Math.max(0, copy.enemyHeroHealth - step.damage);
              addFloatingText(`-${step.damage} 💥`, 'enemy-hero', 'text-red-500 font-black text-xl scale-125 text-shadow-glow');
            } else {
              copy.playerHeroHealth = Math.max(0, copy.playerHeroHealth - step.damage);
              addFloatingText(`-${step.damage} 💥`, 'player-hero', 'text-red-500 font-black text-xl scale-125 text-shadow-glow');
            }
          }, 180 / speedMultiplier);
          break;
        }

        case 'hero_skill': {
          const casterSide = step.side || 'player';
          const isPlayerCaster = casterSide === 'player';
          const targetSide = isPlayerCaster
            ? (step.stance === 'void_strike' ? 'enemy' : 'player')
            : (step.stance === 'void_strike' ? 'player' : 'enemy');
            
          const targetBoard = targetSide === 'player' ? copy.playerBoard : copy.enemyBoard;
          const cardName = targetBoard[step.targetSlot]?.name;
          const casterHeroLabel = isPlayerCaster ? 'player-hero' : 'enemy-hero';
          const targetHeroLabel = isPlayerCaster ? 'enemy-hero' : 'player-hero';
          
          if (step.stance === 'void_strike') {
            if (step.targetSlot === -1) {
              stepDescription = `⚡ Void Strike: ${isPlayerCaster ? 'Lord' : 'Boss'} deals -${step.damage} damage to ${isPlayerCaster ? 'Enemy' : 'Player'} Lord directly!`;
              audioSystem.playAttack();
              if (targetSide === 'player') {
                copy.playerHeroHealth = Math.max(0, copy.playerHeroHealth - step.damage);
              } else {
                copy.enemyHeroHealth = Math.max(0, copy.enemyHeroHealth - step.damage);
              }
              addFloatingText(`⚡ -${step.damage}`, targetHeroLabel, 'text-cyan-400 font-black text-lg scale-125 text-shadow-glow');
              addFloatingText('VOID STRIKE ⚡', casterHeroLabel, 'text-cyan-400 font-bold text-xs');
            } else {
              stepDescription = `⚡ Void Strike: ${isPlayerCaster ? 'Lord' : 'Boss'} deals -${step.damage} damage to ${cardName || 'target'}`;
              audioSystem.playAttack();
              setAnimatingSlot({ side: targetSide, slot: step.targetSlot, type: 'hit' });
              const target = targetBoard[step.targetSlot];
              if (target) {
                if (step.barrierBlocked) {
                  target.barrier = false;
                  target.ward = false;
                  setBarrierShatterSlot({ side: targetSide, slot: step.targetSlot });
                  setTimeout(() => setBarrierShatterSlot(null), 850 / speedMultiplier);
                  addFloatingText('✨ BARRIER BLOCKED!', { side: targetSide, slot: step.targetSlot }, 'text-amber-300 font-black text-xs scale-125 text-shadow-glow');
                } else {
                  if (step.armorAbsorbed > 0) {
                    target.armor = Math.max(0, (target.armor || 0) - step.armorAbsorbed);
                    setArmorSparkSlot({ side: targetSide, slot: step.targetSlot });
                    setTimeout(() => setArmorSparkSlot(null), 500 / speedMultiplier);
                    addFloatingText(`🛡️ -${step.armorAbsorbed} ARMOR`, { side: targetSide, slot: step.targetSlot }, 'text-cyan-300 font-black text-xs');
                  }
                  if (step.armorBroken) {
                    target.armor = 0;
                    setArmorBreakSlot({ side: targetSide, slot: step.targetSlot });
                    setTimeout(() => setArmorBreakSlot(null), 850 / speedMultiplier);
                    addFloatingText('💥 ARMOR BROKEN!', { side: targetSide, slot: step.targetSlot }, 'text-red-400 font-black text-xs');
                  }
                  target.health = Math.max(0, target.health - step.damage);
                  if (step.damage > 0) {
                    addFloatingText(`⚡ -${step.damage}`, { side: targetSide, slot: step.targetSlot }, 'text-cyan-400 font-black text-sm scale-125');
                  }
                }
              }
              addFloatingText('VOID STRIKE ⚡', casterHeroLabel, 'text-cyan-400 font-bold text-xs');
            }
          } else if (step.stance === 'blood_aura') {
            if (step.targetSlot === -1) {
              stepDescription = `🩸 Blood Aura: ${isPlayerCaster ? 'Lord' : 'Boss'} heals directly for +${step.heal} HP`;
              audioSystem.playHeal();
              if (targetSide === 'player') {
                copy.playerHeroHealth = Math.min(copy.playerHeroMaxHealth, copy.playerHeroHealth + step.heal);
              } else {
                copy.enemyHeroHealth = Math.min(copy.enemyHeroMaxHealth, copy.enemyHeroHealth + step.heal);
              }
              addFloatingText(`🩸 +${step.heal}`, targetHeroLabel, 'text-emerald-400 font-bold');
              addFloatingText('BLOOD AURA 🩸', casterHeroLabel, 'text-rose-400 font-bold text-xs');
            } else {
              stepDescription = `🩸 Blood Aura: ${isPlayerCaster ? 'Lord' : 'Boss'} heals ${cardName || 'ally'} for +${step.heal} HP`;
              audioSystem.playHeal();
              setAnimatingSlot({ side: targetSide, slot: step.targetSlot, type: 'heal' });
              const target = targetBoard[step.targetSlot];
              if (target) {
                target.health = Math.min(target.maxHealth, target.health + step.heal);
                if (isPlayerCaster) {
                  if (step.barrier || step.ward) {
                    target.barrier = true;
                    target.ward = true;
                  }
                  if (step.bonusMaxHp > 0) {
                    target.maxHealth += step.bonusMaxHp;
                    target.health += step.bonusMaxHp;
                  }
                }
              }
              addFloatingText(`🩸 +${step.heal}`, { side: targetSide, slot: step.targetSlot }, 'text-emerald-400 font-bold');
              addFloatingText('BLOOD AURA 🩸', casterHeroLabel, 'text-rose-400 font-bold text-xs');
            }
          } else if (step.stance === 'warlord_cry') {
            stepDescription = `🔥 Warlord's Cry: Boosts ${cardName || 'ally'} stats!`;
            audioSystem.playPlace();
            setAnimatingSlot({ side: targetSide, slot: step.targetSlot, type: 'heal' });
            const target = targetBoard[step.targetSlot];
            if (target) {
              if (step.bonusAtk > 0) target.attack += step.bonusAtk;
              if (isPlayerCaster) {
                if (step.bonusArmor > 0) target.armor = (target.armor || 0) + step.bonusArmor;
                if (step.aoeHeal > 0) target.health = Math.min(target.maxHealth, target.health + step.aoeHeal);
              }
            }
            addFloatingText('🔥 BUFF', { side: targetSide, slot: step.targetSlot }, 'text-yellow-400 font-bold');
            addFloatingText("WARLORD'S CRY 🔥", casterHeroLabel, 'text-yellow-400 font-bold text-xs');
          }
          break;
        }

        case 'hero_heal': {
          stepDescription = `💚 Commander heals for +${step.heal} HP`;
          audioSystem.playHeal();
          copy.playerHeroHealth = Math.min(copy.playerHeroMaxHealth, copy.playerHeroHealth + step.heal);
          addFloatingText(`+${step.heal} HP 💚`, 'player-hero', 'text-emerald-400 font-black text-sm');
          break;
        }

        case 'dodge': {
          stepDescription = `🛡️ Evaded! The Lord dodged the attack!`;
          setTimeout(() => {
            addFloatingText('DODGE!', 'player-hero', 'text-blue-400 font-black text-lg scale-125 text-shadow-glow');
          }, 100 / speedMultiplier);
          break;
        }

        case 'plague': {
          const sourceCard = step.sourceSide === 'player' ? copy.playerBoard[step.sourceSlot] : copy.enemyBoard[step.sourceSlot];
          const targetCard = step.sourceSide === 'player' ? copy.enemyBoard[step.targetSlot] : copy.playerBoard[step.targetSlot];
          
          stepDescription = `🦠 Plague slime: ${sourceCard?.name || 'Rot'} infects ${targetCard?.name || 'target'} for -${step.damage} HP`;

          audioSystem.playError();
          setAnimatingSlot({ side: step.sourceSide, slot: step.sourceSlot, type: 'heal' });

          setTimeout(() => {
            setAnimatingSlot({ side: step.sourceSide === 'player' ? 'enemy' : 'player', slot: step.targetSlot, type: 'hit' });
            if (targetCard) {
              targetCard.health = Math.max(0, targetCard.health - step.damage);
            }
            addFloatingText(`🤢 -${step.damage}`, { side: step.sourceSide === 'player' ? 'enemy' : 'player', slot: step.targetSlot }, 'text-emerald-400 font-black text-xs scale-110');
          }, 180 / speedMultiplier);
          break;
        }

        case 'death': {
          const deadCardName = step.side === 'player' ? copy.playerBoard[step.slot]?.name : copy.enemyBoard[step.slot]?.name;
          stepDescription = `☠️ Destruction: ${deadCardName || 'Creature'} turns to dust!`;

          audioSystem.playDeath();
          setAnimatingSlot({ side: step.side, slot: step.slot, type: 'death' });
          addFloatingText('💀 DESTROYED', { side: step.side, slot: step.slot }, 'text-gray-500 font-bold tracking-widest text-[10px]');
          
          if (step.side === 'player') {
            copy.playerBoard[step.slot] = null;
          } else {
            copy.enemyBoard[step.slot] = null;
          }
          break;
        }      }

      return copy;
    });

    setActiveLogStepText(stepDescription);

    const timer = setTimeout(() => {
      setAnimatingSlot(null);
      setCurrentStepIndex(prev => prev + 1);
    }, stepDuration);

    return () => clearTimeout(timer);
  }, [currentStepIndex, animateSequence, isPaused, speedMultiplier]);

  // Handle visualizer completion and game-state synchronization
  useEffect(() => {
    if (currentStepIndex !== -1 && currentStepIndex === animateSequence.length) {
      if (finalBattleState) {
        setBattle(finalBattleState);
        setVisualState(finalBattleState);

        if (finalBattleState.phase === 'player_won') {
          handleBattleWon();
        } else if (finalBattleState.phase === 'player_lost') {
          handleBattleLost();
        }
      }
      setIsSimulating(false);
      setIsAnimating(false);
      setCurrentStepIndex(-1);
      setActiveLogStepText('');
      setAnimatingSlot(null);
    }
  }, [currentStepIndex, animateSequence, finalBattleState]);

  // Handle play action
  const handlePlayCard = (slotIndex: number) => {
    if (!selectedHandCardId) return;
    if (battle.playerBoard[slotIndex] !== null) return; 
    
    const cardToPlay = battle.playerHand.find(c => c.id === selectedHandCardId);
    if (!cardToPlay) return;
    
    const cost = cardToPlay.manaCost || 1;
    const newBattleState = placeCardLocally(battle, selectedHandCardId, slotIndex);
    
    // Check if placeCardLocally did something (mana deducted, card placed)
    if (newBattleState !== battle) {
      // 1. Play place sound
      audioSystem.playClick();
      
      // 2. Play Sacrifice effects if triggered
      const oldAlliesCount = battle.playerBoard.filter(c => c !== null && !c.isDead).length;
      const newAlliesCount = newBattleState.playerBoard.filter(c => c !== null && !c.isDead).length;
      
      if (newAlliesCount < oldAlliesCount) {
        // Find which ally slot was sacrificed
        let sacrificedSlot = -1;
        for (let i = 0; i < 5; i++) {
          if (battle.playerBoard[i] && !newBattleState.playerBoard[i]) {
            sacrificedSlot = i;
            break;
          }
        }
        
        if (sacrificedSlot !== -1) {
          addFloatingText('💀 SACRIFICE', { side: 'player', slot: sacrificedSlot }, 'text-red-500 font-bold scale-110');
          audioSystem.playEerieClick();
        }
        
        // Sacrifice heal hero and buff stats
        const sacrificeSkill = cardToPlay.skills.find(s => s.type === 'sacrifice');
        if (sacrificeSkill) {
          addFloatingText(`+${sacrificeSkill.value} HP 💚`, 'player-hero', 'text-emerald-400 font-black text-sm');
          addFloatingText(`+${Math.round(sacrificeSkill.value / 2)}⚔️ +${sacrificeSkill.value}❤️`, { side: 'player', slot: slotIndex }, 'text-yellow-400 font-bold');
        }
      } else {
        // Normal play
        addFloatingText('SUMMON', { side: 'player', slot: slotIndex }, 'text-[#ebd09b] font-bold tracking-widest');
      }
      
      setBattle(newBattleState);
      setVisualState(newBattleState); // Update visualState immediately!
    }
    
    setSelectedHandCardId(null);
  };

  // Handle End Turn click
  const handleEndTurnWithoutCard = () => {
    setIsSimulating(true);
    const { nextState, animateSequence: steps } = simulateCombatTurn(battle, null, null, profile, battleType === 'campaign' ? stage : null);
    
    setFinalBattleState(nextState);
    setupPlaybackState(null, null, steps);
  };

  // Rewards distribution
  const handleBattleWon = async () => {
    audioSystem.playMagic();
    
    if (battleType === 'pvp') {
      await handlePvpWon();
      return;
    }

    let stars = 1;
    const hpPercentage = battle.playerHeroHealth / battle.playerHeroMaxHealth;
    if (hpPercentage === 1) stars = 3;
    else if (hpPercentage >= 0.5) stars = 2;

    const res = await submitBattleResult(battleType, stage.id.toString(), 'win', stars);
    if (!res.success) {
      console.error('Failed to save battle result:', res.message);
      toast(res.message, 'error');
    }
  };

  // PVP Specific endings
  const handlePvpWon = async () => {
    audioSystem.playMagic();
    const res = await submitBattleResult('pvp', 'pvp', 'win');
    if (!res.success) {
      console.error('Failed to save PVP result:', res.message);
      toast(res.message, 'error');
    }
  };

  const handleBattleLost = async () => {
    audioSystem.playError();
    const res = await submitBattleResult(battleType, stage.id.toString(), 'loss');
    if (!res.success) {
      console.error('Failed to save loss result:', res.message);
      toast(res.message, 'error');
    }
  };

  // Internal helper to retrieve floating texts for specific slot (RPG fountain bounce)
  const renderFloatingTextsFor = (targetKey: string | { side: 'player' | 'enemy'; slot: number }) => {
    return floatingTexts
      .filter(f => {
        if (typeof targetKey === 'string') {
          return f.target === targetKey;
        } else {
          return (
            f.target &&
            typeof f.target === 'object' &&
            f.target.side === targetKey.side &&
            f.target.slot === targetKey.slot
          );
        }
      })
      .map(f => {
        const xOffset = f.xOffset || 0;
        return (
          <motion.div
            key={f.id}
            initial={{ opacity: 1, y: 15, x: 0, scale: 0.7 }}
            animate={{ 
              opacity: [1, 1, 0], 
              y: [15, -30, -55], 
              x: [0, xOffset, xOffset * 1.3], 
              scale: [0.7, 1.45, 1.1] 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: "easeOut" }}
            className={`absolute z-50 pointer-events-none text-center font-mono font-black select-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] ${f.colorClass}`}
          >
            {f.text}
          </motion.div>
        );
      });
  };



  const currentStep = currentStepIndex !== -1 && currentStepIndex < animateSequence.length
    ? animateSequence[currentStepIndex]
    : null;

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-[#090705]
      [--dash-offset:16]
      [&_line]:[stroke-dashoffset:var(--dash-offset)]
     text-gray-200 p-2 md:p-3 font-sans flex flex-col justify-between select-none relative">
      
      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -40;
          }
        }
      `}</style>
      
      {/* Header Bar */}
      <div className="bg-[#120d0a]/95 border border-[#ebd09b]/15 rounded-lg p-1.5 px-3 flex justify-between items-center max-w-7xl mx-auto w-full mb-2 shadow-md h-[40px] shrink-0 z-20">
        <button
          onClick={async () => {
            const confirmMsg = battleType === 'pvp'
              ? 'Are you sure you want to surrender? You will lose crowns.'
              : 'Are you sure you want to escape? Energy will not be refunded.';
            if (window.confirm(confirmMsg)) {
              if (battleType === 'pvp') {
                await submitBattleResult('pvp', 'pvp', 'loss');
              }
              onExitBattle(false);
            }
          }}
          className="flex items-center gap-1 text-[10px] font-mono font-bold text-amber-500 hover:text-white transition-all bg-black/60 py-1 px-2 border border-amber-950/40 rounded cursor-pointer"
        >
          <ArrowLeft className="w-3 h-3" /> ESCAPE
        </button>

        <div className="text-center font-display font-black text-sm tracking-widest text-shadow-gold text-white uppercase flex items-center gap-3">
          <span>{stage.name}</span>
          <span className="text-amber-950">•</span>
          <span className="text-amber-500 font-mono text-xs font-bold">TURN {visualState.turn}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHelpModal(true)}
            className="text-[10px] font-mono text-[#ebd09b] hover:text-white bg-black/60 py-1 px-2 border border-[#ebd09b]/25 rounded cursor-pointer transition-all"
          >
            RULES
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col justify-between relative min-h-0 pb-16">
        
        {/* Battle Arena - Medieval Fantasy Table */}
        <div 
          className="flex-1 flex flex-col justify-center border-[6px] border-[#251a14] bg-[#120d0a] rounded-2xl p-4 shadow-[inset_0_0_60px_rgba(0,0,0,0.95),_0_10px_30px_rgba(0,0,0,0.85)] relative min-h-0 overflow-hidden will-change-transform"
        >
          {/* Wooden Table Board Divider */}
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ebd09b]/15 to-transparent -translate-y-1/2 pointer-events-none z-10" />

          {/* Glowing Lord casting lasers / energy beams */}
          {isAnimating && currentStep && currentStep.type === 'hero_skill' && animatingSlot !== null && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-25">
              <defs>
                <linearGradient id="voidStrikeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#0891b2" stopOpacity="0.3" />
                </linearGradient>
                <linearGradient id="bloodAuraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#b91c1c" stopOpacity="0.3" />
                </linearGradient>
                <linearGradient id="warlordCryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#d97706" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              {(() => {
                const stance = currentStep.stance;
                const slot = currentStep.targetSlot;
                
                // Casting Lord coordinates (Top-Left or Bottom-Left avatar positions)
                let startX = '55px';
                let startY = '46px'; // Enemy Lord Y
                
                if (stance === 'blood_aura' || stance === 'warlord_cry') {
                  startY = 'calc(100% - 46px)'; // Player Lord Y
                }
                
                // Target card coordinates
                const endX = `${20 * slot + 10}%`;
                const endY = (stance === 'blood_aura' || stance === 'warlord_cry') ? '70%' : '30%';
                
                let strokeColor = 'url(#voidStrikeGrad)';
                let glowColor = 'rgba(6, 182, 212, 0.95)';
                
                if (stance === 'blood_aura') {
                  strokeColor = 'url(#bloodAuraGrad)';
                  glowColor = 'rgba(239, 68, 68, 0.95)';
                } else if (stance === 'warlord_cry') {
                  strokeColor = 'url(#warlordCryGrad)';
                  glowColor = 'rgba(245, 158, 11, 0.95)';
                }
                
                return (
                  <>
                    <line
                      x1={startX}
                      y1={startY}
                      x2={endX}
                      y2={endY}
                      stroke={strokeColor}
                      strokeWidth="4"
                      strokeLinecap="round"
                      className="animate-pulse"
                      style={{ filter: `drop-shadow(0 0 10px ${glowColor})` }}
                    />
                    <circle
                      cx={endX}
                      cy={endY}
                      r="6.5"
                      fill={stance === 'void_strike' ? '#06b6d4' : (stance === 'blood_aura' ? '#ef4444' : '#f59e0b')}
                      className="animate-ping"
                      style={{ filter: `drop-shadow(0 0 12px ${glowColor})` }}
                    />
                  </>
                );
              })()}
            </svg>
          )}

          {/* Glowing Targeting Arrow Overlay during combat strikes */}
          {isAnimating && currentStep && (currentStep.type === 'attack' || currentStep.type === 'direct_attack') && animatingSlot?.type === 'strike' && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-25">
              <defs>
                <linearGradient id="glowingArrowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff4500" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.25" />
                </linearGradient>
              </defs>
              {(() => {
                const side = currentStep.attacker;
                const slot = currentStep.slot;
                
                // Attacker slot positions X/Y percentages
                const startX = `${20 * slot + 10}%`;
                const startY = side === 'player' ? '70%' : '30%';
                
                let endX = '50%';
                let endY = '50%';
                
                if (currentStep.type === 'direct_attack') {
                  // Targeted Hero Portrait in the left-hand panel
                  endX = '55px'; 
                  endY = side === 'player' ? '46px' : 'calc(100% - 46px)';
                } else {
                  endX = `${20 * currentStep.targetSlot + 10}%`;
                  endY = side === 'player' ? '30%' : '70%';
                }
                
                return (
                  <>
                    <line
                      x1={startX}
                      y1={startY}
                      x2={endX}
                      y2={endY}
                      stroke="url(#glowingArrowGrad)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray="4 4"
                      className="animate-[dash_1.5s_linear_infinite]"
                      style={{ filter: 'drop-shadow(0 0 5px rgba(255, 69, 0, 0.75))' }}
                    />
                    <circle
                      cx={endX}
                      cy={endY}
                      r="4.5"
                      fill="#ff4500"
                      className="animate-ping"
                      style={{ filter: 'drop-shadow(0 0 8px rgba(255, 69, 0, 1))' }}
                    />
                  </>
                );
              })()}
            </svg>
          )}

          {/* 1. ENEMY HERO PORTRAIT (Top-Left corner - large format) */}
          {(() => {
            const isEnemyCasting = currentStep?.type === 'hero_skill' && currentStep.stance === 'void_strike' && animatingSlot !== null;
            return (
              <motion.div 
                animate={{
                  scale: isEnemyCasting ? [1, 1.12, 1.12, 1] : 1,
                  rotate: isEnemyCasting ? [0, 4, -4, 4, -4, 0] : 0,
                  boxShadow: isEnemyCasting 
                    ? "0 0 25px rgba(6, 182, 212, 0.8)" 
                    : "0 4px 6px rgba(0, 0, 0, 0.3)"
                }}
                transition={{ duration: 0.65 }}
                className="absolute top-4 left-4 flex items-center gap-3 z-30 bg-black/50 p-2 rounded-2xl border border-red-950/30 backdrop-blur-sm shadow-md"
              >
                <div className="relative">
                  <div className="w-18 h-18 rounded-full border-4 border-red-700/80 bg-[#1c0808] overflow-hidden shadow-[0_5px_15px_rgba(0,0,0,0.8)] flex items-center justify-center">
                    {renderFloatingTextsFor('enemy-hero')}
                    {stage.enemyHeroImage && (stage.enemyHeroImage.startsWith('/') || stage.enemyHeroImage.startsWith('http')) ? (
                      <img src={stage.enemyHeroImage} alt="Enemy Hero" className="w-full h-full object-cover" />
                    ) : (
                      <Skull className="w-7 h-7 text-[#dd2c40]" />
                    )}
                  </div>
                  {/* Health Shield */}
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-800 border-2 border-red-300 flex items-center justify-center shadow-lg z-30">
                    <span className="text-white text-xs font-black font-mono leading-none select-none">{visualState.enemyHeroHealth}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[8px] font-mono font-bold text-red-500/70 tracking-wider uppercase block leading-none">Enemy Lord</span>
                  <h4 className="font-display font-black text-xs text-white mt-1 leading-none">{stage.enemyHeroName}</h4>
                  <div className="flex items-center gap-1 mt-1 bg-black/40 px-1.5 py-0.5 rounded border border-red-950/20">
                    {renderManaIcon(visualState.enemyMana || 0, "w-5 h-5")}
                    <span className="text-[10px] font-mono font-bold text-cyan-400 leading-none pl-0.5">
                      / {visualState.enemyMaxMana || 0}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })()}

          {/* 2. PLAYER HERO PORTRAIT (Bottom-Left corner - large format) */}
          {(() => {
            const isPlayerCasting = currentStep?.type === 'hero_skill' && 
              (currentStep.stance === 'blood_aura' || currentStep.stance === 'warlord_cry') && 
              animatingSlot !== null;
            const glowColor = currentStep?.stance === 'blood_aura' ? 'rgba(239, 68, 68, 0.8)' : 'rgba(245, 158, 11, 0.8)';
            return (
              <motion.div 
                animate={{
                  scale: isPlayerCasting ? [1, 1.12, 1.12, 1] : 1,
                  rotate: isPlayerCasting ? [0, 4, -4, 4, -4, 0] : 0,
                  boxShadow: isPlayerCasting 
                    ? `0 0 25px ${glowColor}` 
                    : "0 4px 6px rgba(0, 0, 0, 0.3)"
                }}
                transition={{ duration: 0.65 }}
                className="absolute bottom-4 left-4 flex items-center gap-3 z-30 bg-black/50 p-2 rounded-2xl border border-cyan-950/30 backdrop-blur-sm shadow-md"
              >
                <div className="relative">
                  <div className="w-18 h-18 rounded-full border-4 border-cyan-600/80 bg-[#0d161d] overflow-hidden shadow-[0_5px_15px_rgba(0,0,0,0.8)] flex items-center justify-center">
                    {renderFloatingTextsFor('player-hero')}
                    {profile.avatarUrl ? (
                      <img src={profile.avatarUrl} alt="Hero Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <Shield className="w-7 h-7 text-[#66fcf1]" />
                    )}
                  </div>
                  {/* Health Shield */}
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-800 border-2 border-red-300 flex items-center justify-center shadow-lg z-30">
                    <span className="text-white text-xs font-black font-mono leading-none select-none">{visualState.playerHeroHealth}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[8px] font-mono font-bold text-cyan-400/70 tracking-wider uppercase block leading-none">Your Hero</span>
                  <h4 className="font-display font-black text-xs text-white mt-1 leading-none">{profile.username || 'Summoner'}</h4>
                  <div className="flex items-center gap-1 mt-1 bg-black/40 px-1.5 py-0.5 rounded border border-cyan-950/20">
                    {renderManaIcon(visualState.playerMana || 0, "w-5 h-5")}
                    <span className="text-[10px] font-mono font-bold text-cyan-400 leading-none pl-0.5">
                      / {visualState.playerMaxMana || 0}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })()}

          {/* Hearthstone Style Flip End Turn Button (Right center) */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-35">
            {!selectedHandCardId ? (
              <button
                disabled={isSimulating}
                onClick={handleEndTurnWithoutCard}
                className={`w-[86px] h-[36px] bg-gradient-to-b from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 disabled:from-gray-800 disabled:to-gray-900 border-2 border-[#ebd09b]/80 disabled:border-gray-800 text-black disabled:text-gray-600 font-display font-black text-[10px] uppercase tracking-wider rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.6),_0_0_8px_rgba(235,208,155,0.15)] hover:shadow-[0_4px_15px_rgba(235,208,155,0.35),_0_0_12px_rgba(235,208,155,0.25)] transition-all active:scale-95 cursor-pointer flex items-center justify-center leading-none`}
              >
                {isSimulating ? 'PLAYING' : 'END TURN'}
              </button>
            ) : (
              <button
                onClick={() => setSelectedHandCardId(null)}
                className="w-[86px] h-[36px] bg-gradient-to-b from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 border-2 border-red-500 text-white font-display font-black text-[9px] uppercase tracking-wider rounded-md shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center leading-none"
              >
                ✕ CANCEL
              </button>
            )}
          </div>

          {/* PLAYBACK ACTION BANNER / CONTROLLER */}
          <AnimatePresence mode="wait">
            {isAnimating && (
              <motion.div
                initial={{ opacity: 0, y: -15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.95 }}
                className="absolute top-3 left-1/2 -translate-x-1/2 bg-gradient-to-b from-[#1c140e] to-[#0d0906] border-2 border-[#ebd09b]/35 rounded-xl p-2 px-4 flex justify-between items-center gap-4 shadow-[0_8px_30px_rgba(0,0,0,0.9),_0_0_15px_rgba(235,208,155,0.1)] backdrop-blur-md h-[54px] w-[560px] shrink-0 z-35"
              >
                {/* Combat Message Announcer */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[7.5px] font-mono font-bold text-amber-500/80 uppercase tracking-widest block leading-none">Combat Log Step</span>
                    <h5 className="font-display font-black text-[11.5px] text-white tracking-wide truncate mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                      {activeLogStepText || 'Starting combat duelist...'}
                    </h5>
                  </div>
                </div>

                {/* Announcer Controls */}
                <div className="flex items-center gap-3 shrink-0">
                  {/* Step indicator */}
                  <div className="text-right font-mono text-[9.5px] text-gray-400 leading-none">
                    <div>STEP</div>
                    <div className="font-bold text-white mt-0.5">{currentStepIndex + 1}/{animateSequence.length}</div>
                  </div>

                  {/* Speed Buttons */}
                  <div className="flex bg-black/60 p-0.5 rounded-lg border border-amber-950/40 h-7 items-center">
                    {[1, 2, 3].map((s) => (
                      <button
                        key={s}
                        onClick={() => setSpeedMultiplier(s)}
                        className={`w-6 h-6 flex items-center justify-center text-[9.5px] font-mono font-black rounded-md transition-all cursor-pointer ${
                          speedMultiplier === s
                            ? 'bg-gradient-to-b from-amber-400 to-yellow-600 text-black font-bold shadow-md'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>

                  {/* Play / Pause */}
                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    className="bg-black/60 hover:bg-amber-950/30 border border-amber-900/40 text-white text-[9px] font-mono font-bold h-7 px-2.5 rounded-md cursor-pointer transition-all flex items-center gap-1 shadow-sm active:scale-95"
                  >
                    {isPaused ? <Play className="w-2.5 h-2.5 text-emerald-400 fill-emerald-400" /> : <Pause className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />}
                    <span>{isPaused ? 'RESUME' : 'PAUSE'}</span>
                  </button>

                  {/* Manual Step */}
                  {isPaused && (
                    <button
                      onClick={() => {
                        setAnimatingSlot(null);
                        setCurrentStepIndex(prev => Math.min(animateSequence.length, prev + 1));
                      }}
                      className="bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 text-[9px] font-mono font-bold h-7 px-2.5 rounded-md cursor-pointer transition-all active:scale-95 shadow-sm"
                    >
                      NEXT ➡️
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dynamic attack target coordinates for 3-phase Framer keyframes */}
          {(() => {
            // Calculated once per render for slot movements
            window.activeStrikeX_player = 0;
            window.activeStrikeY_player = -45;
            window.activeStrikeX_enemy = 0;
            window.activeStrikeY_enemy = 45;

            if (isAnimating && currentStep) {
              if (currentStep.type === 'attack') {
                const diff = (currentStep.targetSlot - currentStep.slot) * 92;
                if (currentStep.attacker === 'player') {
                  window.activeStrikeX_player = diff;
                  window.activeStrikeY_player = -50;
                } else {
                  window.activeStrikeX_enemy = diff;
                  window.activeStrikeY_enemy = 50;
                }
              } else if (currentStep.type === 'direct_attack') {
                // Heroes are absolute positioned at left:16px (X: ~40px). Slots start X: ~200px.
                // So a direct attack moves the card far left and up/down.
                const diffX = -130 - (currentStep.slot * 92);
                if (currentStep.attacker === 'player') {
                  window.activeStrikeX_player = diffX;
                  window.activeStrikeY_player = -170;
                } else {
                  window.activeStrikeX_enemy = diffX;
                  window.activeStrikeY_enemy = 170;
                }
              }
            }
          })()}

          {/* BOARD STAGE FIELD (LINEAR DUELS) - centered board */}
          <div className="flex-1 flex flex-col justify-center gap-8 md:gap-10 my-2 min-h-0 relative py-14">
            
            {/* 1. ENEMY BOARD */}
            <div className="grid grid-cols-5 gap-3 relative">
              <div className="absolute inset-x-0 -bottom-4 h-[1px] bg-red-950/15" />
              {visualState.enemyBoard.map((card, idx) => {
                const isActing = animatingSlot?.side === 'enemy' && animatingSlot?.slot === idx && animatingSlot?.type === 'strike';
                const isHit = animatingSlot?.side === 'enemy' && animatingSlot?.slot === idx && animatingSlot?.type === 'hit';
                const isDeath = animatingSlot?.side === 'enemy' && animatingSlot?.slot === idx && animatingSlot?.type === 'death';
                const isHeal = animatingSlot?.side === 'enemy' && animatingSlot?.slot === idx && animatingSlot?.type === 'heal';
                const side = 'enemy';

                return (
                  <div key={idx} className="relative aspect-[13/18] max-h-[190px] max-w-[140px] mx-auto w-full shrink-0">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      {renderFloatingTextsFor({ side: 'enemy', slot: idx })}
                    </div>
                    
                    {card ? (
                      <motion.div
                        onMouseEnter={() => card && setHoveredCard(card)}
                        onMouseLeave={() => setHoveredCard(null)}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{
                          opacity: isDeath ? 0 : 1,
                          scale: isActing ? [1, 1.05, 1.15, 1] : isDeath ? 0.2 : isHeal ? 1.05 : 1,
                          y: isActing ? [0, -12, window.activeStrikeY_enemy || 45, 0] : 0,
                          x: isActing ? [0, 0, window.activeStrikeX_enemy || 0, 0] : (isHit ? [0, -6, 6, -4, 4, 0] : 0),
                          rotate: isActing ? [0, 2, -3, 0] : (isDeath ? 12 : 0),
                          boxShadow: card.delay === 0
                            ? "0 0 15px rgba(220, 38, 64, 0.45)"
                            : "0 4px 10px rgba(0, 0, 0, 0.4)",
                          borderColor: isHit ? "#ef4444" : getTierBorderColor(card.tier)
                        }}
                        transition={{
                          y: isActing ? { times: [0, 0.2, 0.45, 1], duration: 0.7 } : { type: "spring", stiffness: 350, damping: 12 },
                          x: isActing ? { times: [0, 0.2, 0.45, 1], duration: 0.7 } : (isHit ? { duration: 0.25 } : { type: "spring", stiffness: 350, damping: 12 }),
                          scale: isActing ? { times: [0, 0.2, 0.45, 1], duration: 0.7 } : { duration: 0.2 },
                          rotate: isActing ? { times: [0, 0.2, 0.45, 1], duration: 0.7 } : { duration: 0.2 }
                        }}
                        className={`w-full h-full rounded-xl border flex flex-col justify-between p-1.5 pb-2 text-center relative overflow-visible select-none transition-all bg-[#151a21] text-white cursor-help shadow-lg`}
                      >
                        {/* Card Background & Artwork inside wrapper for rounded overflow-hidden */}
                        <div className="absolute inset-0 rounded-xl overflow-hidden z-0 pointer-events-none">
                          <div className={`absolute inset-0 opacity-[0.06] bg-gradient-to-br ${getTierBgGradient(card.tier)}`} />
                          {card.image.startsWith('/cards/') && (
                            <>
                              <img 
                                src={card.image} 
                                alt={card.name} 
                                decoding="async"
                                className={`absolute inset-0 w-full h-full object-cover transition-all ${card.delay > 0 ? 'opacity-40 filter saturate-50 brightness-75' : 'opacity-85'}`} 
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/10" />
                            </>
                          )}
                          {card.delay > 0 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-15">
                              <div className="flex flex-col items-center justify-center relative">
                                <img 
                                  src="/icons/gothic_hourglass.webp" 
                                  alt="Locked" 
                                  className="w-10 h-10 object-contain rounded-full border border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.5)]" 
                                />
                                <div className="absolute -bottom-2.5 bg-gradient-to-b from-[#180f2b] to-[#0c051a] border border-[#a855f7]/60 rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                                  <span className="text-[#c084fc] text-[10px] font-black font-mono leading-none">{card.delay}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-center text-[7px] md:text-[8px] font-mono font-black text-gray-400 z-10 relative px-1">
                          <span className={`uppercase tracking-wider ${getTierTextColor(card.tier)}`}>
                            {card.tier}
                          </span>
                          <span>Lvl {card.level}</span>
                        </div>

                        <div className="mt-1 z-10 relative px-1 bg-black/45 py-0.5 rounded border border-white/5">
                          <span className="text-[10px] md:text-[11px] font-display font-black tracking-tight text-white block truncate leading-none">
                            {card.name}
                          </span>
                        </div>

                        {/* Dedicated skills bar at the bottom center */}
                        <div className="w-full py-1 bg-black/60 border-y border-white/5 flex justify-center gap-1 z-10 relative flex-wrap max-h-[30px] overflow-visible mt-auto mb-1">
                          {card.skills.map((s, sIdx) => (
                            <div 
                              key={sIdx}
                              className={`flex items-center gap-0.5 text-[9px] font-mono font-black px-1.5 py-0.5 rounded-full border ${getSkillBadgeStyle(s.type)}`}
                            >
                              <span>{getSkillIcon(s.type)}</span>
                              <span className="leading-none">{s.value}</span>
                            </div>
                          ))}
                          {card.skills.length === 0 && (
                            <span className="text-[7.5px] font-mono font-bold text-gray-500 uppercase tracking-widest leading-none my-0.5">No Skills</span>
                          )}
                        </div>

                        <div className="w-full bg-black/50 h-1 rounded-full overflow-hidden z-10 border border-black/30 relative mb-1.5 shrink-0">
                          <motion.div
                            className="bg-red-500 h-full rounded-full"
                            animate={{ width: `${(card.health / card.maxHealth) * 100}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>

                        {/* Gothic style corner badges (NO emojis) */}
                        <div className="absolute -bottom-3.5 -left-3.5 w-9 h-9 z-20 flex items-center justify-center">
                          <img src="/icons/gothic_attack.webp" alt="ATK" className="absolute inset-0 w-full h-full object-cover rounded-lg border border-zinc-700/50 shadow-md" />
                          <span className="relative text-[#ff3b30] text-[15px] font-black font-mono leading-none select-none z-10" style={{ textShadow: '2px 2px 2px #000, -2px -2px 2px #000, 2px -2px 2px #000, -2px 2px 2px #000, 0 0 5px #000' }}>{card.attack}</span>
                        </div>
                        <div className="absolute -bottom-3.5 -right-3.5 w-9 h-9 z-20 flex items-center justify-center">
                          <img src="/icons/gothic_health.webp" alt="HP" className="absolute inset-0 w-full h-full object-cover rounded-lg border border-zinc-700/50 shadow-md" />
                          <span className="relative text-[#ffffff] text-[15px] font-black font-mono leading-none select-none z-10" style={{ textShadow: '2px 2px 2px #000, -2px -2px 2px #000, 2px -2px 2px #000, -2px 2px 2px #000, 0 0 5px #000' }}>{card.health}</span>
                        </div>

                        {/* Persistent Armor Badge */}
                        {(card.armor || 0) > 0 && <ArmorBadge armor={card.armor!} />}

                        {/* Persistent Barrier Dome */}
                        {Boolean(card.barrier ?? card.ward) && <BarrierDome />}
                      </motion.div>
                    ) : (
                      // Empty Recessed Slot
                      <div className="w-full h-full rounded-xl border border-amber-950/20 bg-black/45 flex flex-col items-center justify-center relative shadow-[inset_0_4px_10px_rgba(0,0,0,0.8)] group hover:border-[#ebd09b]/15 transition-all duration-300">
                        <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />
                        <Swords className="w-5 h-5 text-amber-950/30 group-hover:text-amber-950/50 transition-colors" />
                        <span className="text-[7px] font-mono font-bold text-amber-950/25 uppercase tracking-widest mt-1">Empty Slot</span>
                      </div>
                    )}

                    {/* Skill Overlay Animations */}
                    <AnimatePresence>
                      {barrierShatterSlot?.side === side && barrierShatterSlot?.slot === idx && (
                        <BarrierShatterOverlay />
                      )}
                    </AnimatePresence>
                    <AnimatePresence>
                      {armorSparkSlot?.side === side && armorSparkSlot?.slot === idx && (
                        <ArmorSparkOverlay />
                      )}
                    </AnimatePresence>
                    <AnimatePresence>
                      {armorBreakSlot?.side === side && armorBreakSlot?.slot === idx && (
                        <ArmorBreakOverlay />
                      )}
                    </AnimatePresence>
                    <AnimatePresence>
                      {isHit && (
                        <motion.div
                          initial={{ opacity: 0.8 }}
                          animate={{ opacity: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="absolute inset-0 bg-red-600/40 z-30 pointer-events-none rounded-xl"
                        />
                      )}
                    </AnimatePresence>
                    <AnimatePresence>
                      {isHeal && (
                        <motion.div
                          initial={{ opacity: 0.8 }}
                          animate={{ opacity: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.4 }}
                          className="absolute inset-0 bg-emerald-500/35 z-30 pointer-events-none rounded-xl"
                        />
                      )}
                    </AnimatePresence>
                    <AnimatePresence>
                      {currentStep?.type === 'plague' && 
                       ((currentStep.sourceSide === 'player' ? 'enemy' : 'player') === side) && 
                       currentStep.targetSlot === idx && 
                       isHit && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: [0, 0.95, 0.95, 0], scale: [0.9, 1.02, 1.02, 0.9] }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.85 }}
                          className="absolute inset-0 bg-black/45 border-2 border-emerald-500 rounded-xl z-35 flex flex-col items-center justify-center pointer-events-none shadow-[0_0_20px_rgba(16,185,129,0.7)] overflow-hidden"
                        >
                          <img src="/icons/plague_fx.webp" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                          <span className="relative text-[8.5px] font-mono font-black text-emerald-400 tracking-widest uppercase leading-none bg-black/75 px-1.5 py-0.5 rounded border border-emerald-500/30 z-10 animate-pulse">PLAGUE INFECT</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <AnimatePresence>
                      {currentStep?.type === 'hero_skill' && 
                       currentStep.stance === 'void_strike' && 
                       currentStep.targetSlot === idx && 
                       animatingSlot?.type === 'hit' && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: [0, 0.95, 0.95, 0], scale: [0.9, 1.02, 1.02, 0.9] }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.85 }}
                          className="absolute inset-0 bg-black/45 border-2 border-cyan-500 rounded-xl z-35 flex flex-col items-center justify-center pointer-events-none shadow-[0_0_20px_rgba(6,182,212,0.7)] overflow-hidden"
                        >
                          <img src="/icons/void_strike_fx.webp" className="absolute inset-0 w-full h-full object-cover opacity-85" />
                          <span className="relative text-[9px] font-mono font-black text-cyan-300 tracking-widest uppercase leading-none bg-black/75 px-1.5 py-0.5 rounded border border-cyan-500/30 z-10 animate-pulse">VOID STRIKE</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <AnimatePresence>
                      {currentStep?.type === 'hero_skill' && 
                       currentStep.stance === 'blood_aura' && 
                       currentStep.targetSlot === idx && 
                       animatingSlot?.type === 'heal' && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: [0, 0.95, 0.95, 0], scale: [0.9, 1.02, 1.02, 0.9] }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.85 }}
                          className="absolute inset-0 bg-black/45 border-2 border-red-500 rounded-xl z-35 flex flex-col items-center justify-center pointer-events-none shadow-[0_0_20px_rgba(239,68,68,0.7)] overflow-hidden"
                        >
                          <img src="/icons/blood_aura_fx.webp" className="absolute inset-0 w-full h-full object-cover opacity-85" />
                          <span className="relative text-[9px] font-mono font-black text-red-300 tracking-widest uppercase leading-none bg-black/75 px-1.5 py-0.5 rounded border border-red-500/30 z-10 animate-pulse">BLOOD AURA</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <AnimatePresence>
                      {currentStep?.type === 'hero_skill' && 
                       currentStep.stance === 'warlord_cry' && 
                       currentStep.targetSlot === idx && 
                       animatingSlot?.type === 'heal' && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: [0, 0.95, 0.95, 0], scale: [0.9, 1.02, 1.02, 0.9] }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.85 }}
                          className="absolute inset-0 bg-black/45 border-2 border-amber-500 rounded-xl z-35 flex flex-col items-center justify-center pointer-events-none shadow-[0_0_20px_rgba(245,158,11,0.7)] overflow-hidden"
                        >
                          <img src="/icons/warlord_cry_fx.webp" className="absolute inset-0 w-full h-full object-cover opacity-85" />
                          <span className="relative text-[9px] font-mono font-black text-amber-300 tracking-widest uppercase leading-none bg-black/75 px-1.5 py-0.5 rounded border border-amber-500/30 z-10 animate-pulse">WARLORD CRY</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <AnimatePresence>
                      {currentStep?.type === 'attack' && 
                       (currentStep.attacker === 'player' ? 'enemy' : 'player') === side && 
                       currentStep.targetSlot === idx && 
                       currentStepIndex !== -1 && 
                       (currentStep.attacker === 'player' 
                         ? visualState.playerBoard[currentStep.slot]?.skills?.some(s => s.type === 'hex')
                         : visualState.enemyBoard[currentStep.slot]?.skills?.some(s => s.type === 'hex')
                       ) && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: [0, 0.95, 0.95, 0], scale: [0.9, 1.02, 1.02, 0.9] }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.85 }}
                          className="absolute inset-0 bg-black/45 border-2 border-purple-500 rounded-xl z-35 flex flex-col items-center justify-center pointer-events-none shadow-[0_0_20px_rgba(168,85,247,0.7)] overflow-hidden"
                        >
                          <img src="/icons/hex_fx.webp" className="absolute inset-0 w-full h-full object-cover opacity-85" />
                          <span className="relative text-[9px] font-mono font-black text-purple-300 tracking-widest uppercase leading-none bg-black/75 px-1.5 py-0.5 rounded border border-purple-500/30 z-10 animate-pulse">HEX CURSED</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* 2. PLAYER BOARD */}
            <div className="grid grid-cols-5 gap-3 relative">
              <div className="absolute inset-x-0 -top-4 h-[1px] bg-cyan-950/15" />
              {visualState.playerBoard.map((card, idx) => {
                const selectedHandCard = selectedHandCardId
                  ? battle.playerHand.find(c => c.id === selectedHandCardId)
                  : null;
                const cardCost = selectedHandCard ? (selectedHandCard.manaCost || 1) : 1;
                const canAfford = battle.playerMana >= cardCost;
                const canPlace = selectedHandCardId && card === null && !isSimulating && canAfford;
                const isActing = animatingSlot?.side === 'player' && animatingSlot?.slot === idx && animatingSlot?.type === 'strike';
                const isHit = animatingSlot?.side === 'player' && animatingSlot?.slot === idx && animatingSlot?.type === 'hit';
                const isDeath = animatingSlot?.side === 'player' && animatingSlot?.slot === idx && animatingSlot?.type === 'death';
                const isHeal = animatingSlot?.side === 'player' && animatingSlot?.slot === idx && animatingSlot?.type === 'heal';
                const side = 'player';

                return (
                  <div key={idx} className="relative aspect-[13/18] max-h-[190px] max-w-[140px] mx-auto w-full shrink-0">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      {renderFloatingTextsFor({ side: 'player', slot: idx })}
                    </div>
                    
                    {card ? (
                      <motion.div
                        onMouseEnter={() => card && setHoveredCard(card)}
                        onMouseLeave={() => setHoveredCard(null)}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{
                          opacity: isDeath ? 0 : 1,
                          scale: isActing ? [1, 1.05, 1.15, 1] : isDeath ? 0.2 : isHeal ? 1.05 : 1,
                          y: isActing ? [0, 12, window.activeStrikeY_player || -45, 0] : 0,
                          x: isActing ? [0, 0, window.activeStrikeX_player || 0, 0] : (isHit ? [0, -6, 6, -4, 4, 0] : 0),
                          rotate: isActing ? [0, -2, 3, 0] : (isDeath ? 12 : 0),
                          boxShadow: card.delay === 0
                            ? "0 0 15px rgba(102, 252, 241, 0.45)"
                            : "0 4px 10px rgba(0, 0, 0, 0.4)",
                          borderColor: isHit ? "#ef4444" : getTierBorderColor(card.tier)
                        }}
                        transition={{
                          y: isActing ? { times: [0, 0.2, 0.45, 1], duration: 0.7 } : { type: "spring", stiffness: 350, damping: 12 },
                          x: isActing ? { times: [0, 0.2, 0.45, 1], duration: 0.7 } : (isHit ? { duration: 0.25 } : { type: "spring", stiffness: 350, damping: 12 }),
                          scale: isActing ? { times: [0, 0.2, 0.45, 1], duration: 0.7 } : { duration: 0.2 },
                          rotate: isActing ? { times: [0, 0.2, 0.45, 1], duration: 0.7 } : { duration: 0.2 }
                        }}
                        className={`w-full h-full rounded-xl border flex flex-col justify-between p-1.5 pb-2 text-center relative overflow-visible select-none transition-all bg-[#151a21] text-white cursor-help shadow-lg`}
                      >
                        {/* Card Background & Artwork */}
                        <div className="absolute inset-0 rounded-xl overflow-hidden z-0 pointer-events-none">
                          <div className={`absolute inset-0 opacity-[0.06] bg-gradient-to-br ${getTierBgGradient(card.tier)}`} />
                          {card.image.startsWith('/cards/') && (
                            <>
                              <img 
                                src={card.image} 
                                alt={card.name} 
                                decoding="async"
                                className={`absolute inset-0 w-full h-full object-cover transition-all ${card.delay > 0 ? 'opacity-40 filter saturate-50 brightness-75' : 'opacity-85'}`} 
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/10" />
                            </>
                          )}
                          {card.delay > 0 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-15">
                              <div className="flex flex-col items-center justify-center relative">
                                <img 
                                  src="/icons/gothic_hourglass.webp" 
                                  alt="Locked" 
                                  className="w-10 h-10 object-contain rounded-full border border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.5)]" 
                                />
                                <div className="absolute -bottom-2.5 bg-gradient-to-b from-[#180f2b] to-[#0c051a] border border-[#a855f7]/60 rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                                  <span className="text-[#c084fc] text-[10px] font-black font-mono leading-none">{card.delay}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-center text-[7px] md:text-[8px] font-mono font-black text-gray-400 z-10 relative px-1">
                          <span className={`uppercase tracking-wider ${getTierTextColor(card.tier)}`}>
                            {card.tier}
                          </span>
                          <span>Lvl {card.level}</span>
                        </div>

                        <div className="mt-1 z-10 relative px-1 bg-black/45 py-0.5 rounded border border-white/5">
                          <span className="text-[10px] md:text-[11px] font-display font-black tracking-tight text-white block truncate leading-none">
                            {card.name}
                          </span>
                        </div>

                        {/* Dedicated skills bar at the bottom center */}
                        <div className="w-full py-1 bg-black/60 border-y border-white/5 flex justify-center gap-1 z-10 relative flex-wrap max-h-[30px] overflow-visible mt-auto mb-1">
                          {card.skills.map((s, sIdx) => (
                            <div 
                              key={sIdx}
                              className={`flex items-center gap-0.5 text-[9px] font-mono font-black px-1.5 py-0.5 rounded-full border ${getSkillBadgeStyle(s.type)}`}
                            >
                              <span>{getSkillIcon(s.type)}</span>
                              <span className="leading-none">{s.value}</span>
                            </div>
                          ))}
                          {card.skills.length === 0 && (
                            <span className="text-[7.5px] font-mono font-bold text-gray-500 uppercase tracking-widest leading-none my-0.5">No Skills</span>
                          )}
                        </div>

                        <div className="w-full bg-black/50 h-1 rounded-full overflow-hidden z-10 border border-black/30 relative mb-1.5 shrink-0">
                          <motion.div
                            className="bg-emerald-500 h-full rounded-full"
                            animate={{ width: `${(card.health / card.maxHealth) * 100}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>

                        {/* Gothic style corner badges (NO emojis) */}
                        <div className="absolute -bottom-3.5 -left-3.5 w-9 h-9 z-20 flex items-center justify-center">
                          <img src="/icons/gothic_attack.webp" alt="ATK" className="absolute inset-0 w-full h-full object-cover rounded-lg border border-zinc-700/50 shadow-md" />
                          <span className="relative text-[#ff3b30] text-[15px] font-black font-mono leading-none select-none z-10" style={{ textShadow: '2px 2px 2px #000, -2px -2px 2px #000, 2px -2px 2px #000, -2px 2px 2px #000, 0 0 5px #000' }}>{card.attack}</span>
                        </div>
                        <div className="absolute -bottom-3.5 -right-3.5 w-9 h-9 z-20 flex items-center justify-center">
                          <img src="/icons/gothic_health.webp" alt="HP" className="absolute inset-0 w-full h-full object-cover rounded-lg border border-zinc-700/50 shadow-md" />
                          <span className="relative text-[#ffffff] text-[15px] font-black font-mono leading-none select-none z-10" style={{ textShadow: '2px 2px 2px #000, -2px -2px 2px #000, 2px -2px 2px #000, -2px 2px 2px #000, 0 0 5px #000' }}>{card.health}</span>
                        </div>

                        {/* Persistent Armor Badge */}
                        {(card.armor || 0) > 0 && <ArmorBadge armor={card.armor!} />}

                        {/* Persistent Barrier Dome */}
                        {Boolean(card.barrier ?? card.ward) && <BarrierDome />}
                      </motion.div>
                    ) : (
                      // Empty Recessed Slot
                      <div 
                        onClick={() => canPlace && handlePlayCard(idx)}
                        className={`w-full h-full rounded-xl border flex flex-col items-center justify-center relative shadow-[inset_0_4px_10px_rgba(0,0,0,0.8)] group transition-all duration-300 ${
                          canPlace
                            ? 'bg-emerald-950/20 border-emerald-500/50 cursor-pointer border-dashed animate-pulse'
                            : 'bg-black/30 border-amber-950/10 border-dashed'
                        }`}
                      >
                        <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />
                        <Swords className={`w-5 h-5 transition-colors ${canPlace ? 'text-emerald-400' : 'text-amber-950/30 group-hover:text-amber-950/50'}`} />
                        <span className={`text-[7px] font-mono font-bold uppercase tracking-widest mt-1 ${canPlace ? 'text-emerald-400' : 'text-amber-950/25'}`}>
                          {canPlace ? 'Place Here' : 'Empty Slot'}
                        </span>
                      </div>
                    )}

                    {/* Skill Overlay Animations */}
                    <AnimatePresence>
                      {barrierShatterSlot?.side === side && barrierShatterSlot?.slot === idx && (
                        <BarrierShatterOverlay />
                      )}
                    </AnimatePresence>
                    <AnimatePresence>
                      {armorSparkSlot?.side === side && armorSparkSlot?.slot === idx && (
                        <ArmorSparkOverlay />
                      )}
                    </AnimatePresence>
                    <AnimatePresence>
                      {armorBreakSlot?.side === side && armorBreakSlot?.slot === idx && (
                        <ArmorBreakOverlay />
                      )}
                    </AnimatePresence>
                    <AnimatePresence>
                      {isHit && (
                        <motion.div
                          initial={{ opacity: 0.8 }}
                          animate={{ opacity: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="absolute inset-0 bg-red-600/40 z-30 pointer-events-none rounded-xl"
                        />
                      )}
                    </AnimatePresence>
                    <AnimatePresence>
                      {isHeal && (
                        <motion.div
                          initial={{ opacity: 0.8 }}
                          animate={{ opacity: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.4 }}
                          className="absolute inset-0 bg-emerald-500/35 z-30 pointer-events-none rounded-xl"
                        />
                      )}
                    </AnimatePresence>
                    <AnimatePresence>
                      {currentStep?.type === 'plague' && 
                       ((currentStep.sourceSide === 'player' ? 'enemy' : 'player') === side) && 
                       currentStep.targetSlot === idx && 
                       isHit && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: [0, 0.95, 0.95, 0], scale: [0.9, 1.02, 1.02, 0.9] }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.85 }}
                          className="absolute inset-0 bg-black/45 border-2 border-emerald-500 rounded-xl z-35 flex flex-col items-center justify-center pointer-events-none shadow-[0_0_20px_rgba(16,185,129,0.7)] overflow-hidden"
                        >
                          <img src="/icons/plague_fx.webp" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                          <span className="relative text-[8.5px] font-mono font-black text-emerald-400 tracking-widest uppercase leading-none bg-black/75 px-1.5 py-0.5 rounded border border-emerald-500/30 z-10 animate-pulse">PLAGUE INFECT</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <AnimatePresence>
                      {currentStep?.type === 'sacrifice' && 
                       side === 'player' && 
                       currentStep.targetSlot === idx && (
                        <motion.div
                          initial={{ opacity: 1, scale: 1 }}
                          animate={{ opacity: 0, scale: 1.35 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.85 }}
                          className="absolute inset-0 bg-black/45 border-2 border-red-500 rounded-xl z-35 flex flex-col items-center justify-center pointer-events-none shadow-[0_0_20px_rgba(239,68,68,0.7)] overflow-hidden"
                        >
                          <img src="/icons/sacrifice_fx.webp" className="absolute inset-0 w-full h-full object-cover opacity-85" />
                          <span className="relative text-[8.5px] font-mono font-black text-red-500 tracking-widest uppercase leading-none bg-black/75 px-1.5 py-0.5 rounded border border-red-500/30 z-10 animate-pulse">SACRIFICED</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <AnimatePresence>
                      {currentStep?.type === 'hero_skill' && 
                       currentStep.stance === 'void_strike' && 
                       currentStep.targetSlot === idx && 
                       animatingSlot?.type === 'hit' && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: [0, 0.95, 0.95, 0], scale: [0.9, 1.02, 1.02, 0.9] }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.85 }}
                          className="absolute inset-0 bg-black/45 border-2 border-cyan-500 rounded-xl z-35 flex flex-col items-center justify-center pointer-events-none shadow-[0_0_20px_rgba(6,182,212,0.7)] overflow-hidden"
                        >
                          <img src="/icons/void_strike_fx.webp" className="absolute inset-0 w-full h-full object-cover opacity-85" />
                          <span className="relative text-[9px] font-mono font-black text-cyan-300 tracking-widest uppercase leading-none bg-black/75 px-1.5 py-0.5 rounded border border-cyan-500/30 z-10 animate-pulse">VOID STRIKE</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <AnimatePresence>
                      {currentStep?.type === 'hero_skill' && 
                       currentStep.stance === 'blood_aura' && 
                       currentStep.targetSlot === idx && 
                       animatingSlot?.type === 'heal' && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: [0, 0.95, 0.95, 0], scale: [0.9, 1.02, 1.02, 0.9] }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.85 }}
                          className="absolute inset-0 bg-black/45 border-2 border-red-500 rounded-xl z-35 flex flex-col items-center justify-center pointer-events-none shadow-[0_0_20px_rgba(239,68,68,0.7)] overflow-hidden"
                        >
                          <img src="/icons/blood_aura_fx.webp" className="absolute inset-0 w-full h-full object-cover opacity-85" />
                          <span className="relative text-[9px] font-mono font-black text-red-300 tracking-widest uppercase leading-none bg-black/75 px-1.5 py-0.5 rounded border border-red-500/30 z-10 animate-pulse">BLOOD AURA</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <AnimatePresence>
                      {currentStep?.type === 'hero_skill' && 
                       currentStep.stance === 'warlord_cry' && 
                       currentStep.targetSlot === idx && 
                       animatingSlot?.type === 'heal' && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: [0, 0.95, 0.95, 0], scale: [0.9, 1.02, 1.02, 0.9] }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.85 }}
                          className="absolute inset-0 bg-black/45 border-2 border-amber-500 rounded-xl z-35 flex flex-col items-center justify-center pointer-events-none shadow-[0_0_20px_rgba(245,158,11,0.7)] overflow-hidden"
                        >
                          <img src="/icons/warlord_cry_fx.webp" className="absolute inset-0 w-full h-full object-cover opacity-85" />
                          <span className="relative text-[9px] font-mono font-black text-amber-300 tracking-widest uppercase leading-none bg-black/75 px-1.5 py-0.5 rounded border border-amber-500/30 z-10 animate-pulse">WARLORD CRY</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <AnimatePresence>
                      {currentStep?.type === 'attack' && 
                       (currentStep.attacker === 'player' ? 'enemy' : 'player') === side && 
                       currentStep.targetSlot === idx && 
                       currentStepIndex !== -1 && 
                       (currentStep.attacker === 'player' 
                         ? visualState.playerBoard[currentStep.slot]?.skills?.some(s => s.type === 'hex')
                         : visualState.enemyBoard[currentStep.slot]?.skills?.some(s => s.type === 'hex')
                       ) && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: [0, 0.95, 0.95, 0], scale: [0.9, 1.02, 1.02, 0.9] }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.85 }}
                          className="absolute inset-0 bg-black/45 border-2 border-purple-500 rounded-xl z-35 flex flex-col items-center justify-center pointer-events-none shadow-[0_0_20px_rgba(168,85,247,0.7)] overflow-hidden"
                        >
                          <img src="/icons/hex_fx.webp" className="absolute inset-0 w-full h-full object-cover opacity-85" />
                          <span className="relative text-[9px] font-mono font-black text-purple-300 tracking-widest uppercase leading-none bg-black/75 px-1.5 py-0.5 rounded border border-purple-500/30 z-10 animate-pulse">HEX CURSED</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

        {/* Selected Card Deploy Prompt Overlay */}
        <AnimatePresence>
          {selectedHandCardId && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute bottom-[24%] left-1/2 -translate-x-1/2 bg-amber-950/90 border border-amber-500/50 rounded-xl px-4 py-2 text-xs font-bold text-amber-200 shadow-[0_0_20px_rgba(235,208,155,0.4)] z-30 animate-pulse pointer-events-none flex items-center gap-2"
            >
              <span>📥</span> Select an empty slot on the board to deploy card
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsible log button */}
        <button
          onClick={() => setShowLogDrawer(true)}
          className="absolute top-14 right-4 bg-[#120d0a]/95 border border-[#ebd09b]/25 hover:border-amber-500 text-[#ebd09b] hover:text-white px-3 py-1.5 rounded-lg cursor-pointer shadow-lg transition-all z-35 flex items-center gap-1.5 font-display font-black text-[10px] uppercase tracking-wider group"
        >
          <Scroll className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          <span>DUEL LOG</span>
          {visualState.combatLog.length > 1 && (
            <span className="bg-red-600 text-white font-mono text-[8px] font-black px-1.5 py-0.2 rounded-full border border-black animate-pulse leading-none">
              {visualState.combatLog.length - 1}
            </span>
          )}
        </button>

        {/* Combat Log Drawer Overlay */}
        <AnimatePresence>
          {showLogDrawer && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowLogDrawer(false)}
                className="fixed inset-0 bg-black z-45"
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 bottom-0 w-80 bg-[#0d1117]/95 border-l border-[#ebd09b]/25 z-50 p-4 flex flex-col justify-between shadow-2xl backdrop-blur-md"
              >
                <div className="flex justify-between items-center border-b border-gray-800 pb-3 mb-3">
                  <h4 className="font-display font-bold text-xs text-red-400 tracking-wider uppercase flex items-center gap-1.5">
                    <Scroll className="w-4 h-4 text-red-400" /> BLOODY DUEL LOG
                  </h4>
                  <button
                    onClick={() => setShowLogDrawer(false)}
                    className="text-gray-500 hover:text-white transition-all cursor-pointer p-1 rounded-lg border border-gray-800/80 hover:border-gray-700 bg-black/40"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div
                  id="combat-log-scroll"
                  className="flex-1 overflow-y-auto font-mono text-[9px] text-gray-400 space-y-2 pr-1 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent"
                >
                  {visualState.combatLog.map((log, index) => {
                    let colorClass = 'text-gray-400';
                    if (log.includes('TURN')) colorClass = 'text-cyan-400 font-bold border-t border-gray-800 pt-2 mt-2';
                    else if (log.includes('VICTORY') || log.includes('healed')) colorClass = 'text-emerald-400 font-bold';
                    else if (log.includes('DEFEAT') || log.includes('fell') || log.includes('Death')) colorClass = 'text-red-500 font-bold';
                    else if (log.includes('Sacrifice') || log.includes('💀')) colorClass = 'text-yellow-500';
                    else if (log.includes('Hex')) colorClass = 'text-purple-400';
                    else if (log.includes('Enemy') || log.includes('😈')) colorClass = 'text-rose-300';

                    return (
                      <div key={index} className="border-b border-gray-900/30 pb-1 leading-relaxed" dangerouslySetInnerHTML={{ __html: log }} />
                    );
                  })}
                </div>

                <div className="border-t border-gray-800 pt-3 mt-3">
                  <button
                    onClick={() => setShowLogDrawer(false)}
                    className="w-full bg-black/40 hover:bg-black/60 border border-gray-800 text-gray-400 hover:text-white py-2 rounded-xl text-xs font-mono font-bold cursor-pointer transition-all"
                  >
                    CLOSE LOG
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Floating Card Analyzer Tooltip - Large and readable details */}
        <AnimatePresence>
          {hoveredCard && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute bottom-[175px] left-6 w-[350px] bg-[#0d1117]/98 border-2 border-[#ebd09b]/35 rounded-2xl p-4 z-45 shadow-[0_10px_35px_rgba(0,0,0,0.85)] backdrop-blur-md pointer-events-none text-left flex gap-3.5"
            >
              {/* Card visual representation inside analyzer */}
              <div 
                className="w-[110px] h-[155px] rounded-xl border flex flex-col justify-between p-1.5 pb-2 text-center relative overflow-visible bg-[#151a21] text-white shadow-md shrink-0"
                style={{ borderColor: getTierBorderColor(hoveredCard.tier) }}
              >
                {/* Background art */}
                <div className="absolute inset-0 rounded-xl overflow-hidden z-0 pointer-events-none">
                  <div className={`absolute inset-0 opacity-[0.05] bg-gradient-to-br ${getTierBgGradient(hoveredCard.tier)}`} />
                  {hoveredCard.image.startsWith('/cards/') && (
                    <>
                      <img src={hoveredCard.image} alt={hoveredCard.name} className="absolute inset-0 w-full h-full object-cover opacity-85" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/10" />
                    </>
                  )}
                  {hoveredCard.delay > 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-15">
                      <div className="flex flex-col items-center justify-center relative">
                        <img 
                          src="/icons/gothic_hourglass.webp" 
                          alt="Locked" 
                          className="w-9 h-9 object-contain rounded-full border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.5)]" 
                        />
                        <div className="absolute -bottom-2 bg-gradient-to-b from-[#180f2b] to-[#0c051a] border border-[#a855f7]/60 rounded-full w-4.5 h-4.5 flex items-center justify-center shadow-lg">
                          <span className="text-[#c084fc] text-[9px] font-black font-mono leading-none">{hoveredCard.delay}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center text-[7px] font-mono font-bold text-gray-500 z-10 relative">
                  <span className={`uppercase tracking-wider ${getTierTextColor(hoveredCard.tier)}`}>{hoveredCard.tier}</span>
                  <span>Lvl {hoveredCard.level}</span>
                </div>

                <div className="mt-1 z-10 relative bg-black/45 py-0.5 rounded border border-white/5">
                  <span className="text-[10px] font-display font-black tracking-tight text-white block truncate leading-none">
                    {hoveredCard.name}
                  </span>
                </div>

                {/* Dedicated skills bar at the bottom center */}
                <div className="w-full py-0.5 bg-black/60 border-y border-white/5 flex justify-center gap-1 z-10 relative flex-wrap max-h-[30px] overflow-visible mt-auto mb-1">
                  {hoveredCard.skills.map((s, sIdx) => (
                    <div 
                      key={sIdx}
                      className={`flex items-center gap-0.5 text-[8px] font-mono font-black px-1.5 py-0.2 rounded-full border ${getSkillBadgeStyle(s.type)}`}
                    >
                      <span>{getSkillIcon(s.type)}</span>
                      <span className="leading-none">{s.value}</span>
                    </div>
                  ))}
                </div>

                <div className="h-0.5 shrink-0" />

                {/* Gothic style corner badges (NO emojis) */}
                <div className="absolute -bottom-3 -left-3 w-8 h-8 z-20 flex items-center justify-center">
                  <img src="/icons/gothic_attack.webp" alt="ATK" className="absolute inset-0 w-full h-full object-cover rounded-lg border border-zinc-700/50 shadow-md" />
                  <span className="relative text-[#ff3b30] text-[13.5px] font-black font-mono leading-none z-10" style={{ textShadow: '2px 2px 2px #000, -2px -2px 2px #000, 2px -2px 2px #000, -2px 2px 2px #000, 0 0 5px #000' }}>{hoveredCard.attack}</span>
                </div>
                <div className="absolute -bottom-3 -right-3 w-8 h-8 z-20 flex items-center justify-center">
                  <img src="/icons/gothic_health.webp" alt="HP" className="absolute inset-0 w-full h-full object-cover rounded-lg border border-zinc-700/50 shadow-md" />
                  <span className="relative text-[#ffffff] text-[12.5px] font-black font-mono leading-none z-10" style={{ textShadow: '2px 2px 2px #000, -2px -2px 2px #000, 2px -2px 2px #000, -2px 2px 2px #000, 0 0 5px #000' }}>{hoveredCard.health}</span>
                </div>

                {/* Persistent Armor Badge */}
                {(hoveredCard.armor || 0) > 0 && <ArmorBadge armor={hoveredCard.armor!} />}

                {/* Persistent Barrier Dome */}
                {Boolean(hoveredCard.barrier ?? hoveredCard.ward) && <BarrierDome />}
              </div>

              {/* Descriptions & specs */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <h4 className="font-display font-black text-sm text-white leading-none mb-1">{hoveredCard.name}</h4>
                  <div className="flex gap-2 text-[9px] font-mono text-gray-400 border-b border-gray-800 pb-1.5 mb-1.5">
                    <span className="text-[#ebd09b] font-bold">{hoveredCard.tier.toUpperCase()}</span>
                    <span>•</span>
                    <span>Level {hoveredCard.level}</span>
                  </div>
                  
                  <div className="space-y-2 pr-1">
                    {hoveredCard.skills.map((s, sIdx) => (
                      <div key={sIdx} className="space-y-0.5">
                        <div className="font-mono font-black text-[10px] flex items-center gap-1 text-white">
                          <span>{getSkillIcon(s.type)}</span>
                          <span className="uppercase tracking-wider">{getSkillNameEnglish(s.type)} {s.value}</span>
                        </div>
                        <p className="text-gray-400 font-sans text-[9.5px] leading-relaxed pl-4">{getSkillDescEnglish(s.type, s.value)}</p>
                      </div>
                    ))}
                    {hoveredCard.skills.length === 0 && (
                      <p className="text-[9.5px] text-gray-500 font-mono italic">No special abilities.</p>
                    )}
                  </div>
                </div>

                <div className="bg-black/45 p-1.5 rounded-lg border border-gray-800/60 grid grid-cols-2 gap-1 text-center font-mono text-[9px] mt-1.5">
                  <div className="bg-slate-900/50 p-1 rounded border border-slate-700/40">
                    <span className="text-slate-400 text-[7px] block font-bold uppercase tracking-wider">ARMOR</span>
                    <span className="text-cyan-300 font-bold">🛡️ {hoveredCard.armor || 0}</span>
                  </div>
                  <div className="bg-amber-950/40 p-1 rounded border border-amber-700/40">
                    <span className="text-amber-400 text-[7px] block font-bold uppercase tracking-wider">BARRIER</span>
                    <span className="text-amber-300 font-bold">{(hoveredCard.barrier ?? hoveredCard.ward) ? '✨ ACTIVE' : 'NONE'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PLAYER HAND FAN ZONE - animated interactively using state-driven slide-aside positioning */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex justify-center items-end h-[170px] z-40 select-none pointer-events-none w-[560px]">
          <div className="flex justify-center items-end relative w-full h-full pointer-events-auto">
            {visualState.playerHand.map((card, idx) => {
              const isSelected = selectedHandCardId === card.id;
              
              // Spacing spread calculations
              const totalHand = visualState.playerHand.length;
              const middle = (totalHand - 1) / 2;
              const offset = idx - middle;
              const rotate = offset * 5; 
              
              let translateX = offset * 52;
              // Push cards slightly down when not hovered, but raise them so they are readable
              let translateY = Math.abs(offset) * 5 + (isSelected ? -25 : 35);
              let scale = 1.0;
              let zIndex = 10 + idx;

              // If a card is hovered, slide other cards aside (Hearthstone style)
              if (hoveredHandCardIndex !== null) {
                if (hoveredHandCardIndex === idx) {
                  translateY = -75;
                  scale = 1.5;
                  zIndex = 100;
                } else if (idx < hoveredHandCardIndex) {
                  translateX -= 40; // Slide left
                } else if (idx > hoveredHandCardIndex) {
                  translateX += 40; // Slide right
                }
              }

              return (
                <motion.div
                  key={card.id}
                  animate={{
                    x: translateX,
                    y: translateY,
                    scale: scale,
                    rotate: hoveredHandCardIndex === idx ? 0 : rotate,
                    zIndex: zIndex
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 22
                  }}
                  onClick={() => {
                    if (!isSimulating) {
                      setSelectedHandCardId(isSelected ? null : card.id);
                    }
                  }}
                  onMouseEnter={() => {
                    setHoveredHandCardIndex(idx);
                    setHoveredCard(card as any);
                  }}
                  onMouseLeave={() => {
                    setHoveredHandCardIndex(null);
                    setHoveredCard(null);
                  }}
                  className={`absolute bottom-[0px] left-[calc(50%-55px)] w-[110px] h-[155px] origin-bottom rounded-xl border flex flex-col justify-between p-1.5 pb-2 text-center cursor-pointer transition-shadow bg-[#151a21] text-white select-none overflow-visible shadow-lg ${
                    isSelected 
                      ? 'border-[#66fcf1] shadow-[0_0_15px_rgba(102,252,241,0.6)]' 
                      : (visualState.playerMana || 0) < (card.manaCost || 1)
                        ? 'border-red-950/20 opacity-40 brightness-75 grayscale'
                        : 'border-gray-800 hover:border-gray-600'
                  }`}
                >
                  <>
                    {/* Card background/image wrapper to prevent bleeding */}
                    <div className="absolute inset-0 rounded-xl overflow-hidden z-0 pointer-events-none">
                      <div className={`absolute inset-0 opacity-[0.05] bg-gradient-to-br ${getTierBgGradient(card.tier)}`} />
                      {card.image.startsWith('/cards/') && (
                        <>
                          <img 
                            src={card.image} 
                            alt={card.name} 
                            className={`absolute inset-0 w-full h-full object-cover transition-all ${card.delay > 0 ? 'opacity-40 filter saturate-50 brightness-75' : 'opacity-85'}`} 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/10" />
                        </>
                      )}
                      {card.delay > 0 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-15">
                          <div className="flex flex-col items-center justify-center relative">
                            <img 
                              src="/icons/gothic_hourglass.webp" 
                              alt="Locked" 
                              className="w-10 h-10 object-contain rounded-full border border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.5)] animate-pulse" 
                            />
                            <div className="absolute -bottom-2.5 bg-gradient-to-b from-[#180f2b] to-[#0c051a] border border-[#a855f7]/60 rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                              <span className="text-[#c084fc] text-[10px] font-black font-mono leading-none">{card.delay}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center z-10 relative px-0.5 mt-0.5">
                      <div className="flex items-center gap-1">
                        {renderManaIcon(card.manaCost || 1, "w-[18px] h-[18px]")}
                        <span className={`text-[7px] md:text-[8px] font-mono font-black ${getTierTextColor(card.tier)}`}>{card.tier}</span>
                      </div>
                      <span className="text-[7px] md:text-[8px] font-mono font-black text-gray-400">Lvl {card.level}</span>
                    </div>

                    <div className="mt-1 z-10 relative px-1 bg-black/45 py-0.5 rounded border border-white/5">
                      <span className="text-[10px] md:text-[11px] font-display font-black tracking-tight text-white block truncate leading-none">
                        {card.name}
                      </span>
                    </div>

                    {/* Dedicated skills bar at the bottom center */}
                    <div className="w-full py-1 bg-black/60 border-y border-white/5 flex justify-center gap-1 z-10 relative flex-wrap max-h-[30px] overflow-visible mt-auto mb-1">
                      {card.skills.map((s, sIdx) => (
                        <div 
                          key={sIdx}
                          className={`flex items-center gap-0.5 text-[9px] font-mono font-black px-1.5 py-0.5 rounded-full border ${getSkillBadgeStyle(s.type)}`}
                        >
                          <span>{getSkillIcon(s.type)}</span>
                          <span className="leading-none">{s.value}</span>
                        </div>
                      ))}
                      {card.skills.length === 0 && (
                        <span className="text-[7.5px] font-mono font-bold text-gray-500 uppercase tracking-widest leading-none my-0.5">No Skills</span>
                      )}
                    </div>

                    <div className="h-1 shrink-0" />

                    {/* Gothic style corner badges (NO emojis) */}
                    <div className="absolute -bottom-3.5 -left-3.5 w-9 h-9 z-20 flex items-center justify-center">
                      <img src="/icons/gothic_attack.webp" alt="ATK" className="absolute inset-0 w-full h-full object-cover rounded-lg border border-zinc-700/50 shadow-md" />
                      <span className="relative text-[#ff3b30] text-[15px] font-black font-mono leading-none select-none z-10" style={{ textShadow: '2px 2px 2px #000, -2px -2px 2px #000, 2px -2px 2px #000, -2px 2px 2px #000, 0 0 5px #000' }}>{card.attack}</span>
                    </div>
                    <div className="absolute -bottom-3.5 -right-3.5 w-9 h-9 z-20 flex items-center justify-center">
                      <img src="/icons/gothic_health.webp" alt="HP" className="absolute inset-0 w-full h-full object-cover rounded-lg border border-zinc-700/50 shadow-md" />
                      <span className="relative text-[#ffffff] text-[15px] font-black font-mono leading-none select-none z-10" style={{ textShadow: '2px 2px 2px #000, -2px -2px 2px #000, 2px -2px 2px #000, -2px 2px 2px #000, 0 0 5px #000' }}>{card.health}</span>
                    </div>
                  </>
                </motion.div>
              );
            })}
            
            {visualState.playerHand.length === 0 && (
              <div className="absolute bottom-[30px] left-1/2 -translate-x-1/2 text-center text-[8px] text-gray-500 font-mono py-2 px-4 border border-dashed border-gray-800 rounded-lg bg-black/40">
                Deck empty.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* VICTORY POPUP MODAL */}
      {battle.phase === 'player_won' && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
          <div className="bg-gradient-to-b from-[#18140f] via-[#0d0a08] to-[#050403] border-2 border-amber-500/50 rounded-3xl p-7 max-w-md w-full text-center space-y-6 shadow-[0_0_50px_rgba(245,158,11,0.25)] relative overflow-hidden">
            
            {/* Ambient Background Flare */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-yellow-500/10 blur-3xl pointer-events-none" />

            {/* Glowing Victory Crest */}
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-md animate-pulse" />
              <div className="w-20 h-20 bg-gradient-to-b from-amber-950 via-black to-black border-2 border-amber-400 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.4)] relative z-10">
                <Swords className="w-10 h-10 text-amber-300 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
              </div>
            </div>

            <div className="space-y-1.5 relative z-10">
              <h3 className="font-display font-black text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-yellow-500 tracking-widest uppercase text-shadow-gold">
                {battleType === 'pvp' ? 'ARENA TRIUMPH!' : 'COVENANT VICTORY!'}
              </h3>
              <p className="text-xs text-gray-300 font-sans leading-relaxed px-4">
                {battleType === 'pvp' ? 'You vanquished the opposing summoner and claimed arena crowns.' : 'You defeated the abyssal lord and cleansed the cursed lands.'}
              </p>
            </div>

            {/* Stars Result (Only for Campaign) */}
            {battleType === 'campaign' && (() => {
              const hpPercentage = battle.playerHeroHealth / battle.playerHeroMaxHealth;
              const earnedStars = hpPercentage === 1 ? 3 : hpPercentage >= 0.5 ? 2 : 1;
              return (
                <div className="bg-black/60 p-4 rounded-2xl border border-amber-500/20 relative z-10">
                  <span className="text-[10px] font-display text-amber-400 tracking-widest block uppercase font-bold mb-2.5">STAGE MASTERY</span>
                  <div className="flex justify-center gap-3 mb-3">
                    {[1, 2, 3].map(s => (
                      <Star 
                        key={s} 
                        className={`w-8 h-8 transition-all duration-500 ${s <= earnedStars ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.9)] scale-110' : 'text-gray-800 fill-gray-900'}`} 
                      />
                    ))}
                  </div>
                  
                  <div className="text-[11px] font-sans text-gray-300 space-y-2 bg-black/50 p-3 rounded-xl border border-white/5 text-left">
                    <div className="flex justify-between items-center py-0.5">
                      <span className="flex items-center gap-1.5">
                        <Star className={`w-3.5 h-3.5 ${earnedStars >= 1 ? 'text-amber-400 fill-amber-400' : 'text-gray-700'}`} />
                        <span className={earnedStars >= 1 ? "text-emerald-400 font-bold" : "text-gray-500"}>1 Star Challenge</span>
                      </span>
                      <span className={earnedStars >= 1 ? "text-emerald-400/90" : "text-gray-500"}>Clear Stage</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-white/5 pt-1.5 py-0.5">
                      <span className="flex items-center gap-1.5">
                        <Star className={`w-3.5 h-3.5 ${earnedStars >= 2 ? 'text-amber-400 fill-amber-400' : 'text-gray-700'}`} />
                        <span className={earnedStars >= 2 ? "text-emerald-400 font-bold" : "text-gray-500"}>2 Star Challenge</span>
                      </span>
                      <span className={earnedStars >= 2 ? "text-emerald-400/90" : "text-gray-500"}>Keep HP &gt; 50%</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-white/5 pt-1.5 py-0.5">
                      <span className="flex items-center gap-1.5">
                        <Star className={`w-3.5 h-3.5 ${earnedStars === 3 ? 'text-amber-400 fill-amber-400' : 'text-gray-700'}`} />
                        <span className={earnedStars === 3 ? "text-emerald-400 font-bold" : "text-gray-500"}>3 Star Challenge</span>
                      </span>
                      <span className={earnedStars === 3 ? "text-emerald-400/90" : "text-gray-500"}>Keep HP 100%</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Rewards Card */}
            <div className="bg-black/60 p-4 rounded-2xl border border-amber-500/25 space-y-3 relative z-10">
              <span className="text-[10px] font-display text-amber-400/90 tracking-widest block uppercase font-bold">REWARD OBTAINED</span>
              <div className="grid grid-cols-3 gap-2.5">
                {/* Gold */}
                <div className="bg-gradient-to-b from-amber-950/40 via-black to-black border border-amber-500/30 p-2.5 rounded-xl text-center shadow-inner flex flex-col items-center justify-center">
                  <span className="text-amber-300 font-display font-black text-base flex items-center gap-1 text-shadow-gold">
                    +{stage.goldReward}
                    <img src="/icons/icon_gold.webp" alt="Gold" className="w-5 h-5 object-contain drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
                  </span>
                  <span className="text-[9px] text-amber-400/70 font-mono uppercase tracking-wider mt-1 font-bold">Gold</span>
                </div>
                
                {/* Dust */}
                <div className="bg-gradient-to-b from-cyan-950/40 via-black to-black border border-cyan-500/30 p-2.5 rounded-xl text-center shadow-inner flex flex-col items-center justify-center">
                  <span className="text-cyan-300 font-display font-black text-base flex items-center gap-1 text-shadow-cyan">
                    +{stage.dustReward}
                    <img src="/icons/icon_dust.webp" alt="Dust" className="w-7 h-7 object-contain drop-shadow-[0_0_8px_rgba(102,252,241,0.6)] scale-125" />
                  </span>
                  <span className="text-[9px] text-cyan-400/70 font-mono uppercase tracking-wider mt-1 font-bold">Dust</span>
                </div>

                {/* EXP (Strictly PvE Campaign Exclusive) */}
                {battleType === 'campaign' && (
                  <div className="bg-gradient-to-b from-emerald-950/40 via-black to-black border border-emerald-500/30 p-2.5 rounded-xl text-center shadow-inner flex flex-col items-center justify-center">
                    <span className="text-emerald-300 font-display font-black text-base flex items-center gap-1 text-shadow-emerald">
                      +50
                      <img src="/icons/icon_exp.webp" alt="EXP" className="w-6 h-6 object-contain drop-shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
                    </span>
                    <span className="text-[9px] text-emerald-400/70 font-mono uppercase tracking-wider mt-1 font-bold">EXP</span>
                  </div>
                )}
                
                {/* Crowns (PvP Only) */}
                {battleType === 'pvp' && (
                  <div className="bg-gradient-to-b from-amber-950/40 via-black to-black border border-amber-500/40 p-2.5 rounded-xl text-center shadow-inner flex flex-col items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                    <span className="text-amber-300 font-display font-black text-base flex items-center gap-1.5 text-shadow-gold">
                      +20
                      <img src="/icons/crown.png" alt="Crown" className="w-5 h-5 object-contain brightness-110 contrast-125" />
                    </span>
                    <span className="text-[9px] text-amber-400/80 font-mono uppercase tracking-wider mt-1 font-bold">Crowns</span>
                  </div>
                )}

                {battleType === 'campaign' && stage.shardsReward > 0 && (
                  <div className="bg-gradient-to-b from-rose-950/40 via-black to-black border border-rose-500/30 p-2.5 rounded-xl text-center shadow-inner flex flex-col items-center justify-center">
                    <span className="text-rose-400 font-display font-black text-base flex items-center gap-1 text-shadow-crimson">
                      +{stage.shardsReward}
                      <img src="/icons/icon_shards.webp" alt="Shards" className="w-5 h-5 object-contain drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
                    </span>
                    <span className="text-[9px] text-rose-400/70 font-mono uppercase tracking-wider mt-1 font-bold">Shards</span>
                  </div>
                )}

                {battleType === 'campaign' && stage.cardReward && (
                  <div className="bg-gradient-to-b from-emerald-950/40 via-black to-black border border-emerald-500/30 px-4 py-2 rounded-xl text-center shadow-inner flex flex-col items-center justify-center w-full col-span-3 mt-1">
                    <span className="text-emerald-300 font-display font-black text-sm flex items-center gap-1.5 text-shadow-emerald">
                      {stage.cardReward.name}
                      <span className="text-sm drop-shadow-[0_0_6px_rgba(52,211,153,0.6)]">🎴</span>
                    </span>
                    <span className="text-[9px] text-emerald-400/70 font-mono uppercase tracking-wider mt-0.5 font-bold">Guaranteed Card</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => onExitBattle(true)}
              className="w-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:to-yellow-400 text-black font-display font-black tracking-widest py-4 px-6 rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:shadow-[0_0_35px_rgba(245,158,11,0.7)] text-xs uppercase transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer relative z-10"
            >
              CLAIM LOOT AND EXIT
            </button>
          </div>
        </div>
      )}

      {/* LOST POPUP MODAL */}
      {battle.phase === 'player_lost' && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
          <div className="bg-gradient-to-b from-[#1c080a] via-[#0e0304] to-[#050102] border-2 border-rose-600/50 rounded-3xl p-7 max-w-md w-full text-center space-y-6 shadow-[0_0_50px_rgba(225,29,72,0.25)] relative overflow-hidden">
            
            {/* Ambient Background Flare */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-rose-600/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-600/10 blur-3xl pointer-events-none" />

            {/* Glowing Defeat Skull */}
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 bg-rose-600/20 rounded-full blur-md animate-pulse" />
              <div className="w-20 h-20 bg-gradient-to-b from-red-950 via-black to-black border-2 border-rose-500 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(225,29,72,0.4)] relative z-10">
                <Skull className="w-10 h-10 text-rose-500 drop-shadow-[0_0_10px_rgba(225,29,72,0.8)] animate-pulse" />
              </div>
            </div>

            <div className="space-y-1.5 relative z-10">
              <h3 className="font-display font-black text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-b from-rose-100 via-rose-500 to-red-600 tracking-widest uppercase text-shadow-crimson">
                {battleType === 'pvp' ? 'DEFEATED IN DUEL' : 'YOU ARE DEFEATED'}
              </h3>
              <p className="text-xs text-gray-300 font-sans leading-relaxed px-4">
                {battleType === 'pvp' ? 'Your opponent proved stronger in this clash. Refine your deck tactics and take revenge!' : 'Darkness consumed your mind. Upgrade cards and try again.'}
              </p>
            </div>

            <div className="bg-black/60 p-4 rounded-2xl border border-rose-500/25 space-y-3 relative z-10">
              <span className="text-[10px] font-display text-rose-400/90 tracking-widest block uppercase font-bold">BATTLE CONSEQUENCES</span>
              <div className="flex justify-center items-center gap-3">
                <div className="bg-gradient-to-b from-amber-950/30 via-black to-black border border-amber-500/30 px-4 py-2.5 rounded-xl text-center shadow-inner flex flex-col items-center justify-center min-w-[90px]">
                  <span className="text-amber-400 font-display font-black text-base flex items-center gap-1 text-shadow-gold">
                    +20
                    <img src="/icons/icon_gold.webp" alt="Gold" className="w-5 h-5 object-contain drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]" />
                  </span>
                  <span className="text-[9px] text-amber-400/70 font-mono uppercase tracking-wider mt-1 font-bold">Consolation</span>
                </div>
                
                {battleType === 'pvp' && (
                  <div className="bg-gradient-to-b from-rose-950/40 via-black to-black border border-rose-500/40 px-4 py-2.5 rounded-xl text-center shadow-inner flex flex-col items-center justify-center min-w-[90px]">
                    <span className="text-rose-400 font-display font-black text-base flex items-center gap-1.5 text-shadow-crimson">
                      -15
                      <img src="/icons/crown.png" alt="Crown" className="w-5 h-5 object-contain brightness-110 contrast-125" />
                    </span>
                    <span className="text-[9px] text-rose-400/70 font-mono uppercase tracking-wider mt-1 font-bold">Crowns</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => onExitBattle(false)}
              className="w-full bg-gradient-to-r from-red-950 via-rose-900 to-red-950 border-2 border-rose-600/70 hover:border-rose-400 text-white font-display font-black tracking-widest py-4 px-6 rounded-2xl shadow-[0_0_20px_rgba(225,29,72,0.3)] hover:shadow-[0_0_30px_rgba(225,29,72,0.5)] text-xs uppercase transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer relative z-10"
            >
              {battleType === 'pvp' ? 'RETURN TO ARENA' : 'RETURN TO CAMPAIGN'}
            </button>
          </div>
        </div>
      )}

      {/* DETAILED HELP MODAL */}
      <AnimatePresence>
        {showHelpModal && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#151a21] border border-[#ebd09b]/30 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                <h3 className="font-display font-black text-base md:text-lg text-[#ebd09b] tracking-wider uppercase flex items-center gap-1.5">
                  <HelpCircle className="w-5 h-5 text-[#ebd09b]" /> COMBAT TACTICS GUIDE
                </h3>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="text-gray-500 hover:text-white font-mono font-bold text-xs bg-black/30 border border-gray-800 rounded px-2.5 py-1 cursor-pointer"
                >
                  CLOSE
                </button>
              </div>

              <div className="space-y-4 text-xs leading-relaxed text-gray-300">
                <div>
                  <h4 className="font-display font-bold text-sm text-white mb-1.5">🗡️ Combat System (Linear Duels)</h4>
                  <p className="font-sans text-gray-400">
                    Combat is 1v1 on a linear 5-slot board. Cards attack <strong>strictly opposite themselves</strong>.
                    If the slot opposite is empty, all damage goes directly to enemy hero (Lord). Goal is to bring enemy health to zero.
                  </p>
                </div>

                <div>
                  <h4 className="font-display font-bold text-sm text-white mb-1.5">⏳ Delay Mechanics (Delay)</h4>
                  <p className="font-sans text-gray-400">
                    When placed on board, card has a delay indicator (e.g. 1, 2 or 3 turns). It cannot attack
                    immediately. Each turn timer decreases by 1. Reaching 0 makes card active ⚔️ and attacks at the end of each your turn.
                  </p>
                </div>

                <div>
                  <h4 className="font-display font-bold text-sm text-[#ebd09b] mb-2 uppercase"><img src="/icons/icon_dust.webp" alt="Dust" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" /> Dark Creature Skills</h4>
                  <div className="space-y-2 font-sans">
                    <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-900/35">
                      <span className="font-bold text-red-400 flex items-center gap-1.5">{renderSkillIcon("sacrifice", "w-5 h-5")} Sacrifice [X]:</span>
                      <p className="text-gray-400 mt-0.5">
                        On play, destroys a random ally on your board. In return, heals your hero by X HP,
                        and creature permanently gets <strong>+(X/2) Attack</strong> and <strong>+X Health</strong>.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-900/35">
                      <span className="font-bold text-rose-300 flex items-center gap-1.5">{renderSkillIcon("vampirism", "w-5 h-5")} Vampirism [X]:</span>
                      <p className="text-gray-400 mt-0.5">
                        Every time creature attacks and damages another card, it heals itself by X HP
                        (up to max HP).
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-purple-950/30 border border-purple-900/35">
                      <span className="font-bold text-purple-300 flex items-center gap-1.5">{renderSkillIcon("hex", "w-5 h-5")} Hex [X]:</span>
                      <p className="text-gray-400 mt-0.5">
                        Before dealing damage, hexes the opposite creature, increasing next incoming damage by +X.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-900/35">
                      <span className="font-bold text-emerald-300 flex items-center gap-1.5">{renderSkillIcon("plague", "w-5 h-5")} Plague [X]:</span>
                      <p className="text-gray-400 mt-0.5">
                        At the end of each turn, emits poisonous spores dealing X pure damage to a random living enemy on board.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-black/40 p-3 rounded-xl border border-gray-800 text-center text-[10px] font-mono text-[#66fcf1]">
                  💡 Tip: Sacrifice weak or wounded cards for explosive buffs to your key creatures!
                </div>
              </div>

              <button
                onClick={() => setShowHelpModal(false)}
                className="w-full bg-[#ebd09b] hover:bg-[#c5a880] text-black font-display font-black py-2.5 rounded-xl transition-all shadow-lg text-xs tracking-wider cursor-pointer"
              >
                UNDERSTOOD, TO BATTLE!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
