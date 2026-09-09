import React, { useState, useEffect, useRef } from 'react';
import { getCardTierStyles } from '../utils/tierStyles';
import { useGame } from '../context/GameContext';
import { useToast } from './Toast';
import { CampaignStage, BattleState, BattleCardState, Equipment } from '../types';
import { initializeBattle, simulateCombatTurn, toBattleCard, placeCardLocally } from '../utils/gameLogic';
import { calculateEquipmentSetBonuses } from '../data/equipment';
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

// Lightweight immutable clone for BattleState without JSON.stringify overhead
const cloneBattleState = (state: BattleState): BattleState => {
  return {
    ...state,
    playerBoard: state.playerBoard.map(c => c ? { ...c, skills: [...c.skills] } : null),
    enemyBoard: state.enemyBoard.map(c => c ? { ...c, skills: [...c.skills] } : null),
    playerHand: state.playerHand.map(c => ({ ...c, skills: [...c.skills] })),
    enemyHand: state.enemyHand.map(c => ({ ...c, skills: [...c.skills] })),
    playerDeckQueue: state.playerDeckQueue ? [...state.playerDeckQueue] : [],
    combatLog: [...state.combatLog]
  };
};

// Card tier helper functions for pristine styling
const getTierBorderColor = (tier: string) => {
  switch (tier?.toLowerCase()) {
    case 'bronze': return 'border-amber-700/60 shadow-[0_0_8px_rgba(245,158,11,0.15)]';
    case 'silver': return 'border-slate-400/60 shadow-[0_0_8px_rgba(148,163,184,0.15)]';
    case 'gold': return 'border-yellow-500/80 shadow-[0_0_10px_rgba(234,179,8,0.25)]';
    case 'legendary': return 'border-purple-500/80 shadow-[0_0_12px_rgba(168,85,247,0.35)]';
    case 'divine': return 'border-rose-500 shadow-[0_0_18px_rgba(244,63,94,0.85)] ring-1 ring-rose-400/60';
    default: return 'border-gray-800 hover:border-gray-600';
  }
};

const getTierBgGradient = (tier: string) => {
  switch (tier?.toLowerCase()) {
    case 'bronze': return 'from-amber-950/40 via-[#151a21] to-[#0d1117]';
    case 'silver': return 'from-slate-900/40 via-[#151a21] to-[#0d1117]';
    case 'gold': return 'from-yellow-950/30 via-[#151a21] to-[#0d1117]';
    case 'legendary': return 'from-purple-950/40 via-[#180f2b] to-[#0d1117]';
    case 'divine': return 'from-rose-950/60 via-[#26050d] to-[#0d1117]';
    default: return 'from-gray-900 via-[#151a21] to-[#0d1117]';
  }
};

const getTierTextColor = (tier: string) => {
  switch (tier?.toLowerCase()) {
    case 'bronze': return 'text-amber-500 font-bold';
    case 'silver': return 'text-slate-300 font-bold';
    case 'gold': return 'text-yellow-400 font-bold';
    case 'legendary': return 'text-purple-400 font-bold';
    case 'divine': return 'text-rose-500 font-black drop-shadow-[0_0_10px_rgba(244,63,94,0.95)]';
    default: return 'text-gray-400 font-medium';
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
  
  // Calculate total bonuses from equipped items and active sets
  const equippedList = Object.values(profile.equipped || {})
    .map(eqId => profile.equipment?.find(e => e.id === eqId))
    .filter(Boolean) as Equipment[];

  const setBonusResults = calculateEquipmentSetBonuses(equippedList);
  const demiurgeBonus = setBonusResults.find(s => s.setId === 'demiurge');

  const getEquipmentBonus = (bonusType: string) => {
    let bonus = 0;
    equippedList.forEach(eq => {
      if (eq.bonusType === bonusType) {
        bonus += eq.bonusValue;
      }
      if (eq.secondaryBonusType === bonusType) {
        bonus += (eq.secondaryBonusValue || 0);
      }
    });
    if (demiurgeBonus) {
      if (bonusType === 'maxHealth') bonus += demiurgeBonus.totalBonuses.maxHealth;
      if (bonusType === 'dodge') bonus += demiurgeBonus.totalBonuses.dodge;
      if (bonusType === 'delayReduction') bonus += demiurgeBonus.totalBonuses.delayReduction;
    }
    return bonus;
  };

  const startingPlayerMana = 1 + (demiurgeBonus?.totalBonuses.startingMana || 0);
  const playerCreatureBuff = {
    atk: demiurgeBonus?.totalBonuses.creatureAtkBuff || 0,
    hp: demiurgeBonus?.totalBonuses.creatureHpBuff || 0,
  };

  // Calculate total bonuses for Enemy from stage (PvP or custom encounters)
  const enemyEquippedList = stage.enemyEquipped 
    ? Object.values(stage.enemyEquipped)
        .map(eqId => stage.enemyEquipment?.find(e => e.id === eqId))
        .filter(Boolean) as Equipment[]
    : (stage.enemyEquipment || []);

  const enemySetBonusResults = calculateEquipmentSetBonuses(enemyEquippedList);
  const enemyDemiurgeBonus = enemySetBonusResults.find(s => s.setId === 'demiurge');

  const getEnemyEquipmentBonus = (bonusType: string) => {
    let bonus = 0;
    enemyEquippedList.forEach(eq => {
      if (eq.bonusType === bonusType) bonus += eq.bonusValue;
      if (eq.secondaryBonusType === bonusType) bonus += (eq.secondaryBonusValue || 0);
    });
    if (enemyDemiurgeBonus) {
      if (bonusType === 'maxHealth') bonus += enemyDemiurgeBonus.totalBonuses.maxHealth;
      if (bonusType === 'dodge') bonus += enemyDemiurgeBonus.totalBonuses.dodge;
      if (bonusType === 'delayReduction') bonus += enemyDemiurgeBonus.totalBonuses.delayReduction;
    }
    return bonus;
  };

  const enemyHeroMaxHealth = stage.enemyHeroHealth > 0 ? stage.enemyHeroHealth : (30 + ((stage.enemyLevel || 1) - 1) * 2 + getEnemyEquipmentBonus('maxHealth'));
  const enemyDodgeChance = stage.enemyDodgeChance !== undefined ? stage.enemyDodgeChance : getEnemyEquipmentBonus('dodge');
  const enemyDelayReduction = stage.enemyDelayReduction !== undefined ? stage.enemyDelayReduction : getEnemyEquipmentBonus('delayReduction');
  const enemyStartingMana = stage.enemyStartingMana !== undefined ? stage.enemyStartingMana : (1 + (enemyDemiurgeBonus?.totalBonuses.startingMana || 0));
  const enemyCreatureBuff = stage.enemyCreatureBuff || {
    atk: enemyDemiurgeBonus?.totalBonuses.creatureAtkBuff || 0,
    hp: enemyDemiurgeBonus?.totalBonuses.creatureHpBuff || 0
  };

  const [battle, setBattle] = useState<BattleState>(() => initializeBattle(
    (profile?.collection || []).filter(c => (profile?.deck || []).includes(c.id)),
    stage,
    (profile?.heroMaxHealth || 30) + getEquipmentBonus('maxHealth'),
    getEquipmentBonus('dodge'),
    getEquipmentBonus('delayReduction'),
    startingPlayerMana,
    playerCreatureBuff,
    enemyHeroMaxHealth,
    enemyDodgeChance,
    enemyDelayReduction,
    enemyStartingMana,
    enemyCreatureBuff
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
  // Calibrated speed factor for fluid 60fps pacing across 1x, 2x, 3x
  const effectiveSpeed = speedMultiplier === 1 ? 1.0 : (speedMultiplier === 2 ? 1.55 : 2.15);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [activeLogStepText, setActiveLogStepText] = useState<string>('');

  // Independent animation targets: attacker (lunge) and defender/target (hit/heal/death)
  const [attackerAction, setAttackerAction] = useState<{
    side: 'player' | 'enemy';
    slot: number;
    targetSlot: number;
    isDirect?: boolean;
  } | null>(null);

  const [defenderAction, setDefenderAction] = useState<{
    side: 'player' | 'enemy';
    slot: number; // -1 for hero
    type: 'hit' | 'heal' | 'death' | 'dodge';
  } | null>(null);

  // Dedicated Plague casting state (spores / miasma channel without melee lunge)
  const [plagueAction, setPlagueAction] = useState<{
    sourceSide: 'player' | 'enemy';
    sourceSlot: number;
    targetSide: 'player' | 'enemy';
    targetSlot: number;
  } | null>(null);

  // Dedicated Skill Visual Effect lifecycle (ensures VFX play full duration without getting cut off)
  const [activeSkillVfx, setActiveSkillVfx] = useState<{
    type: 'void_strike' | 'blood_aura' | 'warlord_cry' | 'plague' | 'sacrifice' | 'hex';
    side: 'player' | 'enemy';
    slot: number; // -1 for hero
  } | null>(null);

  // Summoning entrance animation state
  const [summoningCard, setSummoningCard] = useState<{ side: 'player' | 'enemy'; slot: number } | null>(null);

  // Barrier and Armor visual effect states
  const [barrierShatterSlot, setBarrierShatterSlot] = useState<{ side: 'player' | 'enemy'; slot: number } | null>(null);
  const [armorSparkSlot, setArmorSparkSlot] = useState<{ side: 'player' | 'enemy'; slot: number } | null>(null);
  const [armorBreakSlot, setArmorBreakSlot] = useState<{ side: 'player' | 'enemy'; slot: number } | null>(null);

  // Floating text array
  const [floatingTexts, setFloatingTexts] = useState<FloatingTextEffect[]>([]);

  // Hover analyst and modal info
  const [hoveredCard, setHoveredCard] = useState<BattleCardState | null>(null);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [helpTab, setHelpTab] = useState<'basics' | 'skills' | 'defense'>('basics');
  const [showLogDrawer, setShowLogDrawer] = useState<boolean>(false);
  const [logFilter, setLogFilter] = useState<'all' | 'damage' | 'skills' | 'deaths'>('all');
  const [hoveredHandCardIndex, setHoveredHandCardIndex] = useState<number | null>(null);

  // Track the final target battle state once the calculation resolves
  const [finalBattleState, setFinalBattleState] = useState<BattleState | null>(null);
  const battleResultSubmittedRef = useRef<boolean>(false);

  // Calculate subscriber & equipment bonuses for battle rewards
  const isSubActive = profile.subscriptionExpiresAt && Number(profile.subscriptionExpiresAt) > Date.now();
  const subTier = isSubActive ? (profile.subscriptionTier || 'free') : 'free';
  const subGoldBonusPercent = subTier === 'ultra' ? 50 : subTier === 'premium' ? 25 : 0;
  const equipGoldBonus = getEquipmentBonus('goldBonus');
  let battleGoldMultiplier = 1 + (subGoldBonusPercent / 100) + (equipGoldBonus / 100);

  const applyRewardMultiplier = (baseVal: number, mult: number) => {
    if (mult <= 1 || baseVal <= 0) return Math.round(baseVal);
    return baseVal + Math.max(1, Math.round(baseVal * (mult - 1)));
  };

  const initialBaseGold = stage.goldReward || (battleType === 'pvp' ? 50 : 50);
  const [earnedGold, setEarnedGold] = useState<number>(() => applyRewardMultiplier(initialBaseGold, battleGoldMultiplier));
  const [earnedDust, setEarnedDust] = useState<number>(() => stage.dustReward || (battleType === 'pvp' ? 25 : 25));
  const initialBaseExp = battleType === 'pvp' ? 100 : ((stage.id || 1) * 16 + 32);
  const [earnedExp, setEarnedExp] = useState<number>(() => initialBaseExp);

  // Consolation gold on defeat (base 20 + bonuses from subscription & gear)
  const lossBaseGold = 20;
  const [lossEarnedGold, setLossEarnedGold] = useState<number>(() => applyRewardMultiplier(lossBaseGold, battleGoldMultiplier));

  // Sovereigns earned in this battle (for PvP victory screen)
  const [earnedSovereigns, setEarnedSovereigns] = useState<number>(() => {
    if (battleType !== 'pvp') return 0;
    const todayUtc = new Date().toISOString().slice(0, 10);
    const currentWonToday = profile.lastSovereignsWonDate === todayUtc ? (profile.dailySovereignsWonToday || 0) : 0;
    const cap = subTier === 'ultra' ? 24 : subTier === 'premium' ? 10 : 0;
    const perWin = subTier === 'ultra' ? 2 : subTier === 'premium' ? 1 : 0;
    return Math.max(0, Math.min(perWin, cap - currentWonToday));
  });

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
      requestAnimationFrame(() => {
        logContainer.scrollTop = logContainer.scrollHeight;
      });
    }
  }, [battle.combatLog.length, visualState.combatLog.length]);

  // Method to easily spawn floating numbers/texts (optimized with speed scaling and garbage control)
  const addFloatingText = (
    text: string, 
    target: 'player-hero' | 'enemy-hero' | { side: 'player' | 'enemy'; slot: number }, 
    colorClass: string
  ) => {
    const id = `float_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const xOffset = (Math.random() - 0.5) * 40; // Random horizontal bounce direction
    const lifespan = Math.max(300, Math.round(650 / speedMultiplier));
    
    setFloatingTexts(prev => {
      // Keep at most 6 floating texts active at any time to avoid DOM buildup on mobile and high speeds
      const trimmed = prev.length >= 6 ? prev.slice(prev.length - 5) : prev;
      return [...trimmed, { id, text, target, colorClass, xOffset }];
    });
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(f => f.id !== id));
    }, lifespan);
  };


  // Setup the visual starting state before playing steps
  const setupPlaybackState = (playedCardId: string | null, playedSlotIndex: number | null, steps: any[]) => {
    const playState = cloneBattleState(battle);

    // 1. Decrement Delays visually for creatures currently on the board
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

    // Gentle, natural speed scaling:
    // 1x -> 1.0 (clear, cinematic, readable 60fps)
    // 2x -> 1.55 (fast but fully discernible, no micro-jitter)
    // 3x -> 2.15 (turbo, maintains 25+ frames per action)
    const effectiveSpeed = speedMultiplier === 1 ? 1.0 : (speedMultiplier === 2 ? 1.55 : 2.15);

    // Step-specific calibrated timings (impact exactly matches 46% strike keyframe at 330ms)
    let strikeDuration = Math.round(720 / effectiveSpeed);
    let impactDelay = Math.round(330 / effectiveSpeed);
    let stepDuration = Math.round(860 / effectiveSpeed);

    if (step.type === 'enemy_play') {
      stepDuration = Math.round(800 / effectiveSpeed);
    } else if (step.type === 'hero_skill') {
      impactDelay = Math.round(330 / effectiveSpeed);
      stepDuration = Math.round(920 / effectiveSpeed);
    } else if (step.type === 'plague') {
      impactDelay = Math.round(340 / effectiveSpeed);
      stepDuration = Math.round(880 / effectiveSpeed);
    } else if (step.type === 'sacrifice') {
      stepDuration = Math.round(850 / effectiveSpeed);
    } else if (step.type === 'death') {
      stepDuration = Math.round(440 / effectiveSpeed);
    } else if (step.type === 'dodge') {
      impactDelay = Math.round(330 / effectiveSpeed);
      stepDuration = Math.round(860 / effectiveSpeed);
    } else if (step.type === 'hero_heal') {
      stepDuration = Math.round(750 / effectiveSpeed);
    }

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    switch (step.type) {
      case 'sacrifice': {
        const placingCard = visualState.playerBoard[step.slot];
        const sacrCard = visualState.playerBoard[step.targetSlot];
        
        stepDescription = `💀 Sacrifice: ${placingCard?.name || 'Card'} destroys ${sacrCard?.name || 'ally'}`;
        
        setActiveSkillVfx({ type: 'sacrifice', side: 'player', slot: step.targetSlot });
        const tVfx = setTimeout(() => setActiveSkillVfx(null), Math.round(650 / effectiveSpeed));
        timeouts.push(tVfx);

        addFloatingText('💀 SACRIFICE', { side: 'player', slot: step.targetSlot }, 'text-red-500 font-bold scale-110');
        addFloatingText(`+${step.healAmount} HP 💚`, 'player-hero', 'text-emerald-400 font-black text-sm');
        addFloatingText(`+${step.buffAttack}⚔️ +${step.buffHealth}❤️`, { side: 'player', slot: step.slot }, 'text-yellow-400 font-bold');

        // Allow sacrifice effect to play on target card before removing it
        const tSacr = setTimeout(() => {
          setVisualState(prev => {
            const copy = cloneBattleState(prev);
            copy.playerBoard[step.targetSlot] = null;
            const card = copy.playerBoard[step.slot];
            if (card) {
              card.attack += step.buffAttack;
              card.health += step.buffHealth;
              card.maxHealth += step.buffHealth;
            }
            copy.playerHeroHealth = Math.min(copy.playerHeroMaxHealth, copy.playerHeroHealth + step.healAmount);
            return copy;
          });
        }, Math.round(380 / effectiveSpeed));
        timeouts.push(tSacr);
        break;
      }

      case 'enemy_play': {
        stepDescription = `😈 Dark Summon: Lord summons ${step.card.name}`;
        
        setSummoningCard({ side: 'enemy', slot: step.slot });
        const tSummon = setTimeout(() => setSummoningCard(null), Math.round(680 / effectiveSpeed));
        timeouts.push(tSummon);

        addFloatingText('SUMMON', { side: 'enemy', slot: step.slot }, 'text-[#ebd09b] font-bold tracking-widest');

        setVisualState(prev => {
          const copy = cloneBattleState(prev);
          copy.enemyBoard[step.slot] = {
            ...step.card,
            skills: step.card.skills ? step.card.skills.map((s: any) => ({ ...s })) : []
          };
          if (copy.enemyHand.length > 0) {
            copy.enemyHand.shift();
          }
          copy.enemyDeckSize = copy.enemyHand.length;
          return copy;
        });
        break;
      }

      case 'attack': {
        const attackerCard = step.attacker === 'player' ? visualState.playerBoard[step.slot] : visualState.enemyBoard[step.slot];
        const defenderCard = step.attacker === 'player' ? visualState.enemyBoard[step.targetSlot] : visualState.playerBoard[step.targetSlot];
        const defSide = step.attacker === 'player' ? 'enemy' : 'player';
        const hasHex = attackerCard?.skills?.some(s => s.type === 'hex');
        
        stepDescription = `🗡️ Duel: ${attackerCard?.name || 'Creature'} deals -${step.damage} damage to ${defenderCard?.name || 'Target'}`;

        setAttackerAction({ side: step.attacker, slot: step.slot, targetSlot: step.targetSlot });

        const tHit = setTimeout(() => {
          setDefenderAction({ side: defSide, slot: step.targetSlot, type: 'hit' });

          if (hasHex) {
            setActiveSkillVfx({ type: 'hex', side: defSide, slot: step.targetSlot });
            const tHex = setTimeout(() => setActiveSkillVfx(null), Math.round(650 / effectiveSpeed));
            timeouts.push(tHex);
          }

          if (step.barrierBlocked) {
            setBarrierShatterSlot({ side: defSide, slot: step.targetSlot });
            const tBar = setTimeout(() => setBarrierShatterSlot(null), Math.round(500 / effectiveSpeed));
            timeouts.push(tBar);
            addFloatingText('✨ BARRIER BLOCKED!', { side: defSide, slot: step.targetSlot }, 'text-amber-300 font-black text-xs scale-125 text-shadow-glow');
          } else {
            if (step.armorAbsorbed > 0) {
              setArmorSparkSlot({ side: defSide, slot: step.targetSlot });
              const tArm = setTimeout(() => setArmorSparkSlot(null), Math.round(350 / effectiveSpeed));
              timeouts.push(tArm);
              addFloatingText(`🛡️ -${step.armorAbsorbed} ARMOR`, { side: defSide, slot: step.targetSlot }, 'text-cyan-300 font-black text-xs');
            }
            if (step.armorBroken) {
              setArmorBreakSlot({ side: defSide, slot: step.targetSlot });
              const tBrk = setTimeout(() => setArmorBreakSlot(null), Math.round(500 / effectiveSpeed));
              timeouts.push(tBrk);
              addFloatingText('💥 ARMOR BROKEN!', { side: defSide, slot: step.targetSlot }, 'text-red-400 font-black text-xs scale-110');
            }
            if (step.damage > 0) {
              addFloatingText(`-${step.damage}`, { side: defSide, slot: step.targetSlot }, 'text-red-500 font-black text-sm scale-125 text-shadow-glow');
            }
          }

          if (step.vampireHeal > 0) {
            addFloatingText(`+${step.vampireHeal} 🩸`, { side: step.attacker, slot: step.slot }, 'text-emerald-400 font-extrabold text-xs');
          }

          // Apply state update deterministically on impact with targeted reference preservation
          setVisualState(prev => {
            const isPlayerAttacking = step.attacker === 'player';
            const targetBoardKey = isPlayerAttacking ? 'enemyBoard' : 'playerBoard';
            const attackerBoardKey = isPlayerAttacking ? 'playerBoard' : 'enemyBoard';

            const prevTarget = prev[targetBoardKey][step.targetSlot];
            const prevAttacker = prev[attackerBoardKey][step.slot];

            let nextTarget = prevTarget;
            if (prevTarget) {
              nextTarget = { ...prevTarget, skills: prevTarget.skills };
              if (step.barrierBlocked) {
                nextTarget.barrier = false;
                nextTarget.ward = false;
              } else {
                if (step.armorBroken) {
                  nextTarget.armor = 0;
                } else if (step.armorAbsorbed > 0) {
                  nextTarget.armor = Math.max(0, (nextTarget.armor || 0) - step.armorAbsorbed);
                }
                if (step.targetHealth !== undefined) {
                  nextTarget.health = Math.max(0, step.targetHealth);
                } else if (step.damage > 0) {
                  nextTarget.health = Math.max(0, nextTarget.health - step.damage);
                }
                if (step.targetArmor !== undefined) {
                  nextTarget.armor = step.targetArmor;
                }
              }
            }

            let nextAttacker = prevAttacker;
            if (prevAttacker && (step.attackerHealth !== undefined || step.vampireHeal > 0)) {
              nextAttacker = { ...prevAttacker, skills: prevAttacker.skills };
              if (step.attackerHealth !== undefined) {
                nextAttacker.health = Math.min(nextAttacker.maxHealth, step.attackerHealth);
              } else if (step.vampireHeal > 0) {
                nextAttacker.health = Math.min(nextAttacker.maxHealth, nextAttacker.health + step.vampireHeal);
              }
            }

            const nextPlayerBoard = [...prev.playerBoard];
            const nextEnemyBoard = [...prev.enemyBoard];

            if (isPlayerAttacking) {
              nextEnemyBoard[step.targetSlot] = nextTarget;
              nextPlayerBoard[step.slot] = nextAttacker;
            } else {
              nextPlayerBoard[step.targetSlot] = nextTarget;
              nextEnemyBoard[step.slot] = nextAttacker;
            }

            return {
              ...prev,
              playerBoard: nextPlayerBoard,
              enemyBoard: nextEnemyBoard
            };
          });
        }, impactDelay);
        timeouts.push(tHit);
        break;
      }

      case 'direct_attack': {
        const attackerCard = step.attacker === 'player' ? visualState.playerBoard[step.slot] : visualState.enemyBoard[step.slot];
        stepDescription = `💥 Breakthrough: ${attackerCard?.name || 'Creature'} deals -${step.damage} direct damage to Lord!`;

        setAttackerAction({ side: step.attacker, slot: step.slot, targetSlot: -1, isDirect: true });

        const tHit = setTimeout(() => {
          const targetHeroSide = step.attacker === 'player' ? 'enemy' : 'player';
          const targetHeroLabel = step.attacker === 'player' ? 'enemy-hero' : 'player-hero';

          setDefenderAction({ side: targetHeroSide, slot: -1, type: 'hit' });
          addFloatingText('BREAKTHROUGH! ⚡', { side: step.attacker, slot: step.slot }, 'text-amber-300 font-black text-xs scale-110');
          addFloatingText(`💥 -${step.damage}`, targetHeroLabel, 'text-red-500 font-black text-xl scale-125 text-shadow-glow');

          setVisualState(prev => {
            if (step.attacker === 'player') {
              const newEnemyHealth = step.enemyHeroHealth !== undefined 
                ? step.enemyHeroHealth 
                : Math.max(0, prev.enemyHeroHealth - step.damage);
              return { ...prev, enemyHeroHealth: newEnemyHealth };
            } else {
              const newPlayerHealth = step.playerHeroHealth !== undefined 
                ? step.playerHeroHealth 
                : Math.max(0, prev.playerHeroHealth - step.damage);
              return { ...prev, playerHeroHealth: newPlayerHealth };
            }
          });
        }, impactDelay);
        timeouts.push(tHit);
        break;
      }

      case 'hero_skill': {
        const casterSide = step.side || 'player';
        const isPlayerCaster = casterSide === 'player';
        const targetSide = isPlayerCaster
          ? (step.stance === 'void_strike' ? 'enemy' : 'player')
          : (step.stance === 'void_strike' ? 'player' : 'enemy');
          
        const targetBoard = targetSide === 'player' ? visualState.playerBoard : visualState.enemyBoard;
        const cardName = targetBoard[step.targetSlot]?.name;
        const casterHeroLabel = isPlayerCaster ? 'player-hero' : 'enemy-hero';
        const targetHeroLabel = isPlayerCaster ? 'enemy-hero' : 'player-hero';

        if (step.stance === 'void_strike') {
          if (step.targetSlot === -1) {
            stepDescription = `⚡ Void Strike: ${isPlayerCaster ? 'Lord' : 'Enemy Commander'} deals -${step.damage} damage to ${isPlayerCaster ? 'Enemy' : 'Player'} Lord directly!`;
            const tHit = setTimeout(() => {
              setDefenderAction({ side: targetSide, slot: -1, type: 'hit' });
              addFloatingText(`⚡ -${step.damage}`, targetHeroLabel, 'text-cyan-400 font-black text-lg scale-125 text-shadow-glow');
              addFloatingText('VOID STRIKE ⚡', casterHeroLabel, 'text-cyan-400 font-bold text-xs');
              
              setVisualState(prev => {
                const copy = cloneBattleState(prev);
                if (targetSide === 'player') {
                  copy.playerHeroHealth = Math.max(0, copy.playerHeroHealth - step.damage);
                } else {
                  copy.enemyHeroHealth = Math.max(0, copy.enemyHeroHealth - step.damage);
                }
                return copy;
              });
            }, impactDelay);
            timeouts.push(tHit);
          } else {
            stepDescription = `⚡ Void Strike: ${isPlayerCaster ? 'Lord' : 'Enemy Commander'} deals -${step.damage} damage to ${cardName || 'target'}`;
            const tHit = setTimeout(() => {
              setDefenderAction({ side: targetSide, slot: step.targetSlot, type: 'hit' });
              setActiveSkillVfx({ type: 'void_strike', side: targetSide, slot: step.targetSlot });
              const tVfx = setTimeout(() => setActiveSkillVfx(null), Math.round(650 / effectiveSpeed));
              timeouts.push(tVfx);
              
              if (step.barrierBlocked) {
                setBarrierShatterSlot({ side: targetSide, slot: step.targetSlot });
                const tBar = setTimeout(() => setBarrierShatterSlot(null), Math.round(500 / effectiveSpeed));
                timeouts.push(tBar);
                addFloatingText('✨ BARRIER BLOCKED!', { side: targetSide, slot: step.targetSlot }, 'text-amber-300 font-black text-xs scale-125 text-shadow-glow');
              } else {
                if (step.armorAbsorbed > 0) {
                  setArmorSparkSlot({ side: targetSide, slot: step.targetSlot });
                  const tArm = setTimeout(() => setArmorSparkSlot(null), Math.round(350 / effectiveSpeed));
                  timeouts.push(tArm);
                  addFloatingText(`🛡️ -${step.armorAbsorbed} ARMOR`, { side: targetSide, slot: step.targetSlot }, 'text-cyan-300 font-black text-xs');
                }
                if (step.armorBroken) {
                  setArmorBreakSlot({ side: targetSide, slot: step.targetSlot });
                  const tBrk = setTimeout(() => setArmorBreakSlot(null), Math.round(500 / effectiveSpeed));
                  timeouts.push(tBrk);
                  addFloatingText('💥 ARMOR BROKEN!', { side: targetSide, slot: step.targetSlot }, 'text-red-400 font-black text-xs');
                }
                if (step.damage > 0) {
                  addFloatingText(`⚡ -${step.damage}`, { side: targetSide, slot: step.targetSlot }, 'text-cyan-400 font-black text-sm scale-125');
                }
              }
              addFloatingText('VOID STRIKE ⚡', casterHeroLabel, 'text-cyan-400 font-bold text-xs');

              setVisualState(prev => {
                const copy = cloneBattleState(prev);
                const target = targetSide === 'player' ? copy.playerBoard[step.targetSlot] : copy.enemyBoard[step.targetSlot];
                if (target) {
                  if (step.barrierBlocked) {
                    target.barrier = false;
                    target.ward = false;
                  } else {
                    if (step.armorBroken) target.armor = 0;
                    else if (step.armorAbsorbed > 0) target.armor = Math.max(0, (target.armor || 0) - step.armorAbsorbed);
                    if (step.targetHealth !== undefined) target.health = Math.max(0, step.targetHealth);
                    else target.health = Math.max(0, target.health - step.damage);
                  }
                }
                return copy;
              });
            }, impactDelay);
            timeouts.push(tHit);
          }
        } else if (step.stance === 'blood_aura') {
          if (step.targetSlot === -1) {
            stepDescription = `🩸 Blood Aura: ${isPlayerCaster ? 'Lord' : 'Enemy Commander'} heals directly for +${step.heal} HP`;
            setDefenderAction({ side: targetSide, slot: -1, type: 'heal' });
            addFloatingText(`🩸 +${step.heal}`, targetHeroLabel, 'text-emerald-400 font-bold');
            addFloatingText('BLOOD AURA 🩸', casterHeroLabel, 'text-rose-400 font-bold text-xs');
            
            setVisualState(prev => {
              const copy = cloneBattleState(prev);
              if (targetSide === 'player') {
                copy.playerHeroHealth = Math.min(copy.playerHeroMaxHealth, copy.playerHeroHealth + step.heal);
              } else {
                copy.enemyHeroHealth = Math.min(copy.enemyHeroMaxHealth, copy.enemyHeroHealth + step.heal);
              }
              return copy;
            });
          } else {
            stepDescription = `🩸 Blood Aura: ${isPlayerCaster ? 'Lord' : 'Enemy Commander'} heals ${cardName || 'ally'} for +${step.heal} HP`;
            setDefenderAction({ side: targetSide, slot: step.targetSlot, type: 'heal' });
            setActiveSkillVfx({ type: 'blood_aura', side: targetSide, slot: step.targetSlot });
            const tVfx = setTimeout(() => setActiveSkillVfx(null), Math.round(650 / effectiveSpeed));
            timeouts.push(tVfx);

            addFloatingText(`🩸 +${step.heal}`, { side: targetSide, slot: step.targetSlot }, 'text-emerald-400 font-bold');
            addFloatingText('BLOOD AURA 🩸', casterHeroLabel, 'text-rose-400 font-bold text-xs');

            setVisualState(prev => {
              const copy = cloneBattleState(prev);
              const target = targetSide === 'player' ? copy.playerBoard[step.targetSlot] : copy.enemyBoard[step.targetSlot];
              if (target) {
                if (step.targetHealth !== undefined) target.health = step.targetHealth;
                else target.health = Math.min(target.maxHealth, target.health + step.heal);
                if (step.barrier || step.ward) {
                  target.barrier = true;
                  target.ward = true;
                }
                if (step.bonusMaxHp > 0) {
                  target.maxHealth += step.bonusMaxHp;
                }
              }
              return copy;
            });
          }
        } else if (step.stance === 'warlord_cry') {
          if (step.targetSlot === -1) {
            stepDescription = `🔥 Warlord's Cry: ${isPlayerCaster ? 'Lord' : 'Enemy Commander'} roars, rallying forces!`;
            setDefenderAction({ side: targetSide, slot: -1, type: 'heal' });
            addFloatingText('🔥 BATTLE ROAR!', casterHeroLabel, 'text-yellow-400 font-black text-sm scale-110');
            addFloatingText("WARLORD'S CRY 🔥", casterHeroLabel, 'text-yellow-400 font-bold text-xs');
          } else {
            stepDescription = `🔥 Warlord's Cry: Boosts ${cardName || 'ally'} stats!`;
            setDefenderAction({ side: targetSide, slot: step.targetSlot, type: 'heal' });
            setActiveSkillVfx({ type: 'warlord_cry', side: targetSide, slot: step.targetSlot });
            const tVfx = setTimeout(() => setActiveSkillVfx(null), Math.round(650 / effectiveSpeed));
            timeouts.push(tVfx);

            addFloatingText('🔥 BUFF', { side: targetSide, slot: step.targetSlot }, 'text-yellow-400 font-bold');
            addFloatingText("WARLORD'S CRY 🔥", casterHeroLabel, 'text-yellow-400 font-bold text-xs');

            setVisualState(prev => {
              const copy = cloneBattleState(prev);
              const target = targetSide === 'player' ? copy.playerBoard[step.targetSlot] : copy.enemyBoard[step.targetSlot];
              if (target) {
                if (step.bonusAtk > 0) target.attack += step.bonusAtk;
                if (step.bonusArmor > 0) target.armor = (target.armor || 0) + step.bonusArmor;
                if (step.aoeHeal > 0) target.health = Math.min(target.maxHealth, target.health + step.aoeHeal);
              }
              return copy;
            });
          }
        }
        break;
      }

      case 'hero_heal': {
        const isEnemy = step.side === 'enemy';
        stepDescription = `💚 ${isEnemy ? 'Enemy Commander' : 'Commander'} heals for +${step.heal} HP`;
        setDefenderAction({ side: isEnemy ? 'enemy' : 'player', slot: -1, type: 'heal' });
        if (isEnemy) {
          addFloatingText(`+${step.heal} HP 💚`, 'enemy-hero', 'text-emerald-400 font-black text-sm');
        } else {
          addFloatingText(`+${step.heal} HP 💚`, 'player-hero', 'text-emerald-400 font-black text-sm');
        }
        setVisualState(prev => {
          const copy = cloneBattleState(prev);
          if (isEnemy) {
            copy.enemyHeroHealth = Math.min(copy.enemyHeroMaxHealth, copy.enemyHeroHealth + step.heal);
          } else {
            copy.playerHeroHealth = Math.min(copy.playerHeroMaxHealth, copy.playerHeroHealth + step.heal);
          }
          return copy;
        });
        break;
      }

      case 'dodge': {
        const isEnemy = step.side === 'enemy';
        const attackerSide = step.attacker || (isEnemy ? 'player' : 'enemy');
        const attackerCard = attackerSide === 'player' ? visualState.playerBoard[step.slot] : visualState.enemyBoard[step.slot];
        
        stepDescription = `🛡️ Evaded! ${isEnemy ? 'The Enemy Commander' : 'Your Lord'} dodged direct attack from ${attackerCard?.name || 'Creature'}!`;

        setAttackerAction({ side: attackerSide, slot: step.slot, targetSlot: -1, isDirect: true });

        const tHit = setTimeout(() => {
          setDefenderAction({ side: step.side, slot: -1, type: 'dodge' });
          addFloatingText('DODGE! 🛡️', isEnemy ? 'enemy-hero' : 'player-hero', 'text-cyan-400 font-black text-lg scale-125 text-shadow-glow');
        }, impactDelay);
        timeouts.push(tHit);
        break;
      }

      case 'plague': {
        const sourceCard = step.sourceSide === 'player' ? visualState.playerBoard[step.sourceSlot] : visualState.enemyBoard[step.sourceSlot];
        const targetCard = step.sourceSide === 'player' ? visualState.enemyBoard[step.targetSlot] : visualState.playerBoard[step.targetSlot];
        const defSide = step.sourceSide === 'player' ? 'enemy' : 'player';
        
        stepDescription = `🦠 Plague: ${sourceCard?.name || 'Carrier'} infests ${targetCard?.name || 'target'} with toxic miasma (-${step.damage} HP)`;

        setPlagueAction({
          sourceSide: step.sourceSide,
          sourceSlot: step.sourceSlot,
          targetSide: defSide,
          targetSlot: step.targetSlot
        });

        addFloatingText('🦠 MIASMA', { side: step.sourceSide, slot: step.sourceSlot }, 'text-emerald-400 font-black text-[11px] scale-110 tracking-widest');

        const tHit = setTimeout(() => {
          setDefenderAction({ side: defSide, slot: step.targetSlot, type: 'hit' });
          setActiveSkillVfx({ type: 'plague', side: defSide, slot: step.targetSlot });
          const tVfx = setTimeout(() => setActiveSkillVfx(null), Math.round(650 / effectiveSpeed));
          timeouts.push(tVfx);
          // Trigger hit reaction and dedicated visual plague effect
          // (dedicated PLAGUE INFECT banner and green miasma already render cleanly without floating emoji)
          setVisualState(prev => {
            const copy = cloneBattleState(prev);
            const target = step.sourceSide === 'player' ? copy.enemyBoard[step.targetSlot] : copy.playerBoard[step.targetSlot];
            if (target) {
              if (step.targetHealth !== undefined) {
                target.health = Math.max(0, step.targetHealth);
              } else {
                target.health = Math.max(0, target.health - step.damage);
              }
            }
            return copy;
          });
        }, impactDelay);
        timeouts.push(tHit);

        const tPlagueEnd = setTimeout(() => {
          setPlagueAction(null);
        }, Math.round(750 / effectiveSpeed));
        timeouts.push(tPlagueEnd);
        break;
      }

      case 'death': {
        const deadCardName = step.cardName || (step.side === 'player' ? visualState.playerBoard[step.slot]?.name : visualState.enemyBoard[step.slot]?.name);
        stepDescription = `☠️ Destruction: ${deadCardName || 'Creature'} turns to dust!`;

        setDefenderAction({ side: step.side, slot: step.slot, type: 'death' });
        addFloatingText('💀 DESTROYED', { side: step.side, slot: step.slot }, 'text-gray-500 font-bold tracking-widest text-[10px]');
        
        const tDeath = setTimeout(() => {
          setVisualState(prev => {
            const copy = cloneBattleState(prev);
            if (step.side === 'player') {
              copy.playerBoard[step.slot] = null;
            } else {
              copy.enemyBoard[step.slot] = null;
            }
            return copy;
          });
        }, Math.round(240 / effectiveSpeed));
        timeouts.push(tDeath);
        break;
      }
    }

    setActiveLogStepText(stepDescription);

    // Clear defender shake smoothly after impact reaction concludes fully
    const hitReactionDuration = Math.round(360 / effectiveSpeed);
    const tClearHit = setTimeout(() => {
      setDefenderAction(null);
    }, impactDelay + hitReactionDuration);
    timeouts.push(tClearHit);

    // Clear attacker lunge action when returning to slot finishes
    const tClearStrike = setTimeout(() => {
      setAttackerAction(null);
    }, strikeDuration);
    timeouts.push(tClearStrike);

    // Complete the step and seamlessly advance
    const stepTimer = setTimeout(() => {
      setAttackerAction(null);
      setDefenderAction(null);
      setActiveSkillVfx(null);
      setSummoningCard(null);
      setPlagueAction(null);
      setCurrentStepIndex(prev => prev + 1);
    }, stepDuration);
    timeouts.push(stepTimer);

    return () => {
      timeouts.forEach(t => clearTimeout(t));
    };
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
      setAttackerAction(null);
      setDefenderAction(null);
      setActiveSkillVfx(null);
      setSummoningCard(null);
      setPlagueAction(null);
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
      // 1. Play Sacrifice effects if triggered
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
      
      setSummoningCard({ side: 'player', slot: slotIndex });
      setTimeout(() => setSummoningCard(null), 600);

      setBattle(newBattleState);
      setVisualState(newBattleState); // Update visualState immediately!
    }
    
    setSelectedHandCardId(null);
  };

  // Handle End Turn click
  const handleEndTurnWithoutCard = () => {
    setIsSimulating(true);
    const { nextState, animateSequence: steps } = simulateCombatTurn(battle, null, null, profile, stage);
    
    setFinalBattleState(nextState);
    setupPlaybackState(null, null, steps);
  };

  // Rewards distribution
  const handleBattleWon = async () => {
    if (battleResultSubmittedRef.current) return;
    battleResultSubmittedRef.current = true;
    
    if (battleType === 'pvp') {
      await handlePvpWon();
      return;
    }

    let stars = 1;
    const hpPercentage = battle.playerHeroHealth / battle.playerHeroMaxHealth;
    if (hpPercentage === 1) stars = 3;
    else if (hpPercentage >= 0.5) stars = 2;

    const res = await submitBattleResult(battleType, stage.id.toString(), 'win', stars);
    if (res.success) {
      if (res.rewards?.gold !== undefined) {
        setEarnedGold(res.rewards.gold);
      } else if (res.goldReward !== undefined) {
        setEarnedGold(res.goldReward);
      }
      if (res.rewards?.dust !== undefined) {
        setEarnedDust(res.rewards.dust);
      } else if (res.dustReward !== undefined) {
        setEarnedDust(res.dustReward);
      }
      if (res.rewards?.exp !== undefined) {
        setEarnedExp(res.rewards.exp);
      } else if (res.expReward !== undefined) {
        setEarnedExp(res.expReward);
      }
    } else {
      console.error('Failed to save battle result:', res.message);
      toast(res.message, 'error');
    }
  };

  // PVP Specific endings
  const handlePvpWon = async () => {
    const res = await submitBattleResult('pvp', 'pvp', 'win');
    if (res.success) {
      if (res.rewards?.gold !== undefined) {
        setEarnedGold(res.rewards.gold);
      } else if (res.goldReward !== undefined) {
        setEarnedGold(res.goldReward);
      }
      if (res.rewards?.dust !== undefined) {
        setEarnedDust(res.rewards.dust);
      } else if (res.dustReward !== undefined) {
        setEarnedDust(res.dustReward);
      }
      if (res.rewards?.exp !== undefined) {
        setEarnedExp(res.rewards.exp);
      } else if (res.expReward !== undefined) {
        setEarnedExp(res.expReward);
      }
      if (res.sovereignsReward !== undefined) {
        setEarnedSovereigns(res.sovereignsReward);
      } else if (res.rewards?.sovereigns !== undefined) {
        setEarnedSovereigns(res.rewards.sovereigns);
      }
    } else {
      console.error('Failed to save PVP result:', res.message);
      toast(res.message, 'error');
    }
  };

  const handleBattleLost = async () => {
    if (battleResultSubmittedRef.current) return;
    battleResultSubmittedRef.current = true;
    const res = await submitBattleResult(battleType, stage.id.toString(), 'loss');
    if (res.success) {
      if (res.rewards?.gold !== undefined) {
        setLossEarnedGold(res.rewards.gold);
      } else if (res.goldReward !== undefined) {
        setLossEarnedGold(res.goldReward);
      }
    } else {
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
            transition={{ duration: Math.max(0.25, 0.55 / effectiveSpeed), ease: "easeOut" }}
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.95), 0 0 6px rgba(0,0,0,0.9)' }}
            className={`absolute z-50 pointer-events-none text-center font-mono font-black select-none transform-gpu will-change-transform ${f.colorClass}`}
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
    <div className="h-screen max-h-screen overflow-hidden bg-[#090705] text-gray-200 p-2 md:p-3 font-sans flex flex-col justify-between select-none relative">
      
      {/* Header Bar */}
      <div className="bg-[#120d0a]/95 border border-[#ebd09b]/15 rounded-lg p-1.5 px-3 flex justify-between items-center max-w-7xl mx-auto w-full mb-2 shadow-md h-[40px] shrink-0 z-20">
        <button
          onClick={() => {
            const confirmMsg = battleType === 'pvp'
              ? 'Are you sure you want to surrender? You will lose crowns.'
              : 'Are you sure you want to escape? Energy will not be refunded.';
            if (window.confirm(confirmMsg)) {
              if (battleType === 'pvp') {
                submitBattleResult('pvp', 'pvp', 'loss').catch(() => {});
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
          {isAnimating && currentStep && currentStep.type === 'hero_skill' && (
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
                const casterSide = currentStep.side || 'player';
                const isPlayerCaster = casterSide === 'player';
                
                // Which side is being targeted?
                const targetSide = isPlayerCaster
                  ? (stance === 'void_strike' ? 'enemy' : 'player')
                  : (stance === 'void_strike' ? 'player' : 'enemy');

                // Casting Lord coordinates (Top-Left or Bottom-Left avatar positions)
                const startX = '56px';
                const startY = isPlayerCaster ? 'calc(100% - 52px)' : '52px';

                // Target coordinates
                let endX = '56px';
                let endY = '52px';

                if (slot !== undefined && slot >= 0) {
                  endX = `${20 * slot + 10}%`;
                  endY = targetSide === 'enemy' ? '30%' : '70%';
                } else {
                  // Direct target on Hero portrait
                  endX = '56px';
                  endY = targetSide === 'enemy' ? '52px' : 'calc(100% - 52px)';
                }
                
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
                    {/* Hardware accelerated dual vector glow */}
                    <line
                      x1={startX}
                      y1={startY}
                      x2={endX}
                      y2={endY}
                      stroke={stance === 'void_strike' ? '#06b6d4' : (stance === 'blood_aura' ? '#ef4444' : '#f59e0b')}
                      strokeWidth="10"
                      strokeOpacity="0.3"
                      strokeLinecap="round"
                    />
                    <line
                      x1={startX}
                      y1={startY}
                      x2={endX}
                      y2={endY}
                      stroke={strokeColor}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <circle
                      cx={endX}
                      cy={endY}
                      r="12"
                      fill={stance === 'void_strike' ? '#06b6d4' : (stance === 'blood_aura' ? '#ef4444' : '#f59e0b')}
                      fillOpacity="0.35"
                    />
                    <circle
                      cx={endX}
                      cy={endY}
                      r="5"
                      fill="#ffffff"
                    />
                  </>
                );
              })()}
            </svg>
          )}

          {/* Glowing Targeting Arrow Overlay during combat strikes & direct dodge attempts */}
          {isAnimating && currentStep && (currentStep.type === 'attack' || currentStep.type === 'direct_attack' || currentStep.type === 'dodge') && attackerAction !== null && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-25">
              <defs>
                <linearGradient id="glowingArrowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff4500" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              {(() => {
                const side = currentStep.attacker || (currentStep.side === 'enemy' ? 'player' : 'enemy');
                const slot = currentStep.slot;
                
                // Attacker slot positions X/Y percentages
                const startX = `${20 * slot + 10}%`;
                const startY = side === 'player' ? '70%' : '30%';
                
                let endX = '50%';
                let endY = '50%';
                
                if (currentStep.type === 'direct_attack' || currentStep.type === 'dodge') {
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
                      stroke="#ff4500"
                      strokeWidth="5"
                      strokeOpacity="0.25"
                      strokeLinecap="round"
                    />
                    <line
                      x1={startX}
                      y1={startY}
                      x2={endX}
                      y2={endY}
                      stroke="url(#glowingArrowGrad)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray="6 4"
                    />
                    <circle
                      cx={endX}
                      cy={endY}
                      r="8"
                      fill="#ff4500"
                      fillOpacity="0.3"
                    />
                    <circle
                      cx={endX}
                      cy={endY}
                      r="3.5"
                      fill="#fef08a"
                    />
                  </>
                );
              })()}
            </svg>
          )}

          {/* Dedicated Plague Miasma Stream Overlay (End-of-Turn Affliction) */}
          {plagueAction !== null && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-25">
              <defs>
                <linearGradient id="plagueMiasmaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.95" />
                  <stop offset="50%" stopColor="#4ade80" stopOpacity="1" />
                  <stop offset="100%" stopColor="#84cc16" stopOpacity="0.9" />
                </linearGradient>
                <filter id="plagueHazeGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#10b981" />
                </filter>
              </defs>
              {(() => {
                const sX = `${20 * plagueAction.sourceSlot + 10}%`;
                const sY = plagueAction.sourceSide === 'player' ? '70%' : '30%';
                const tX = `${20 * plagueAction.targetSlot + 10}%`;
                const tY = plagueAction.targetSide === 'player' ? '70%' : '30%';
                return (
                  <g>
                    {/* Outer toxic haze */}
                    <line
                      x1={sX}
                      y1={sY}
                      x2={tX}
                      y2={tY}
                      stroke="#10b981"
                      strokeWidth="7"
                      strokeOpacity="0.35"
                      strokeLinecap="round"
                    />
                    {/* Streaming toxic vein */}
                    <line
                      x1={sX}
                      y1={sY}
                      x2={tX}
                      y2={tY}
                      stroke="url(#plagueMiasmaGrad)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeDasharray="8 5"
                    />
                    {/* Infected Target focal glow */}
                    <circle
                      cx={tX}
                      cy={tY}
                      r="10"
                      fill="#10b981"
                      fillOpacity="0.75"
                      filter="url(#plagueHazeGlow)"
                    />
                  </g>
                );
              })()}
            </svg>
          )}

          {/* 1. ENEMY HERO PORTRAIT (Top-Left corner - large format) */}
          {(() => {
            const isEnemyCasting = currentStep?.type === 'hero_skill' && currentStep.side === 'enemy';
            const isEnemyHit = defenderAction?.side === 'enemy' && defenderAction?.slot === -1 && defenderAction?.type === 'hit';
            const isEnemyDodge = defenderAction?.side === 'enemy' && defenderAction?.slot === -1 && defenderAction?.type === 'dodge';
            const heroAnimClass = isEnemyDodge ? 'anim-hero-dodge' : isEnemyHit ? 'anim-hero-recoil' : isEnemyCasting ? 'anim-hero-cast' : '';
            return (
              <div 
                style={{
                  '--recoil-duration': `${Math.max(0.2, 0.32 / effectiveSpeed)}s`,
                  '--dodge-duration': `${Math.max(0.2, 0.35 / effectiveSpeed)}s`,
                  '--cast-duration': `${Math.max(0.3, 0.6 / effectiveSpeed)}s`,
                } as React.CSSProperties}
                className={`absolute top-4 left-4 flex items-center gap-3 z-30 bg-[#100b08]/95 p-2 rounded-2xl border will-change-transform ${heroAnimClass} ${
                  isEnemyDodge
                    ? 'border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.95)]'
                    : isEnemyHit 
                      ? 'border-red-500 shadow-[0_0_35px_rgba(239,68,68,0.95)]' 
                      : isEnemyCasting 
                        ? 'border-red-500/80 shadow-[0_0_30px_rgba(239,68,68,0.6)]' 
                        : 'border-red-950/30 shadow-md'
                }`}
              >
                <div className="relative">
                  <div className="w-18 h-18 rounded-full border-4 border-red-700/80 bg-[#1c0808] overflow-hidden shadow-[0_5px_15px_rgba(0,0,0,0.8)] flex items-center justify-center">
                    {renderFloatingTextsFor('enemy-hero')}
                    {stage.enemyHeroImage && (stage.enemyHeroImage.startsWith('/') || stage.enemyHeroImage.startsWith('http')) ? (
                      <img 
                        src={stage.enemyHeroImage.includes('mage') ? '/avatars/vampire.webp' : (stage.enemyHeroImage.includes('thief') ? '/avatars/rogue.webp' : stage.enemyHeroImage)} 
                        alt="Enemy Hero" 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/avatars/knight.webp';
                        }}
                      />
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
              </div>
            );
          })()}

          {/* 2. PLAYER HERO PORTRAIT (Bottom-Left corner - large format) */}
          {(() => {
            const isPlayerCasting = currentStep?.type === 'hero_skill' && (!currentStep.side || currentStep.side === 'player');
            const isPlayerHit = defenderAction?.side === 'player' && defenderAction?.slot === -1 && defenderAction?.type === 'hit';
            const isPlayerDodge = defenderAction?.side === 'player' && defenderAction?.slot === -1 && defenderAction?.type === 'dodge';
            const heroAnimClass = isPlayerDodge ? 'anim-hero-dodge' : isPlayerHit ? 'anim-hero-recoil' : isPlayerCasting ? 'anim-hero-cast' : '';
            return (
              <div 
                style={{
                  '--recoil-duration': `${Math.max(0.2, 0.32 / effectiveSpeed)}s`,
                  '--dodge-duration': `${Math.max(0.2, 0.35 / effectiveSpeed)}s`,
                  '--cast-duration': `${Math.max(0.3, 0.6 / effectiveSpeed)}s`,
                } as React.CSSProperties}
                className={`absolute bottom-4 left-4 flex items-center gap-3 z-30 bg-[#100b08]/95 p-2 rounded-2xl border will-change-transform ${heroAnimClass} ${
                  isPlayerDodge
                    ? 'border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.95)]'
                    : isPlayerHit 
                      ? 'border-red-500 shadow-[0_0_35px_rgba(239,68,68,0.95)]' 
                      : isPlayerCasting 
                        ? 'border-cyan-500/80 shadow-[0_0_30px_rgba(6,182,212,0.6)]' 
                        : 'border-cyan-950/30 shadow-md'
                }`}
              >
                <div className="relative">
                  <div className="w-18 h-18 rounded-full border-4 border-cyan-600/80 bg-[#0d161d] overflow-hidden shadow-[0_5px_15px_rgba(0,0,0,0.8)] flex items-center justify-center">
                    {renderFloatingTextsFor('player-hero')}
                    {profile.avatarUrl ? (
                      <img 
                        src={profile.avatarUrl} 
                        alt="Hero Avatar" 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/avatars/knight.webp';
                        }}
                      />
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
              </div>
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
                className="absolute top-3 left-1/2 -translate-x-1/2 bg-gradient-to-b from-[#1c140e] to-[#0d0906] border-2 border-[#ebd09b]/35 rounded-xl p-2 px-4 flex justify-between items-center gap-4 shadow-[0_8px_30px_rgba(0,0,0,0.9),_0_0_15px_rgba(235,208,155,0.1)] h-[54px] w-[95%] max-w-[560px] shrink-0 z-35"
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
                        setAttackerAction(null);
                        setDefenderAction(null);
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

          {/* BOARD STAGE FIELD (LINEAR DUELS) - centered board */}
          <div className="flex-1 flex flex-col justify-center gap-8 md:gap-10 my-2 min-h-0 relative py-14">
            
            {/* 1. ENEMY BOARD */}
            <div className="grid grid-cols-5 gap-3 relative">
              <div className="absolute inset-x-0 -bottom-4 h-[1px] bg-red-950/15" />
              {visualState.enemyBoard.map((card, idx) => {
                const isActing = attackerAction?.side === 'enemy' && attackerAction?.slot === idx;
                const isTargeted = attackerAction?.side === 'player' && (attackerAction.isDirect ? false : attackerAction.targetSlot === idx);
                const isHit = defenderAction?.side === 'enemy' && defenderAction?.slot === idx && defenderAction?.type === 'hit';
                const isDeath = defenderAction?.side === 'enemy' && defenderAction?.slot === idx && defenderAction?.type === 'death';
                const isHeal = defenderAction?.side === 'enemy' && defenderAction?.slot === idx && defenderAction?.type === 'heal';
                const isSummoning = summoningCard?.side === 'enemy' && summoningCard?.slot === idx;
                const isPlagueCasting = plagueAction?.sourceSide === 'enemy' && plagueAction?.sourceSlot === idx;
                const isPlagueTargeted = plagueAction?.targetSide === 'enemy' && plagueAction?.targetSlot === idx;
                const side = 'enemy';

                // Calculate strike displacement towards target cleanly
                const strikeX = isActing && attackerAction ? (attackerAction.isDirect ? 0 : (attackerAction.targetSlot - idx) * 88) : 0;
                const strikeY = isActing ? (attackerAction?.isDirect ? 75 : 60) : 0;

                const borderGlowClass = isHit 
                  ? "border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.95)] ring-2 ring-red-500" 
                  : isPlagueCasting
                    ? "border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.95)] ring-2 ring-emerald-400/80"
                    : isPlagueTargeted
                      ? "border-lime-500 shadow-[0_0_25px_rgba(132,204,22,0.9)] ring-2 ring-lime-500/80"
                      : isActing 
                        ? "border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.9)] ring-2 ring-amber-400/80"
                        : isTargeted
                          ? "border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.85)] ring-2 ring-rose-500/80"
                          : isSummoning
                            ? "border-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.85)] ring-2 ring-purple-400/80"
                            : card && card.delay === 0 
                              ? "shadow-[0_0_15px_rgba(220,38,64,0.4)]" 
                              : "shadow-[0_4px_10px_rgba(0,0,0,0.4)]";

                return (
                  <div key={idx} className="relative aspect-[13/18] max-h-[190px] max-w-[140px] mx-auto w-full shrink-0">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      {renderFloatingTextsFor({ side: 'enemy', slot: idx })}
                    </div>
                    
                    <AnimatePresence>
                      {card ? (
                        <motion.div
                          key={`enemy-card-${card.id}-${idx}`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: isDeath ? 0 : 1, scale: isDeath ? 0.4 : 1 }}
                          exit={{ opacity: 0, scale: 0.5, transition: { duration: Math.max(0.12, 0.2 / effectiveSpeed) } }}
                          transition={{ duration: isDeath ? Math.max(0.12, 0.24 / effectiveSpeed) : 0.2 }}
                          className="w-full h-full relative"
                        >
                          <div
                            onMouseEnter={() => card && setHoveredCard(card)}
                            onMouseLeave={() => setHoveredCard(null)}
                            style={{
                              borderColor: isHit ? '#ef4444' : (isPlagueCasting ? '#10b981' : (isPlagueTargeted ? '#84cc16' : (isActing ? '#f59e0b' : (isTargeted ? '#f43f5e' : getTierBorderColor(card.tier))))),
                              '--strike-x': `${strikeX}px`,
                              '--strike-y': `${strikeY}px`,
                              '--strike-rot': `${strikeX > 0 ? 5 : strikeX < 0 ? -5 : 2}deg`,
                              '--anim-duration': `${Math.max(0.25, 0.72 / effectiveSpeed)}s`,
                              '--recoil-duration': `${Math.max(0.18, 0.32 / effectiveSpeed)}s`,
                            } as React.CSSProperties}
                            className={`w-full h-full rounded-xl border flex flex-col justify-between p-1.5 pb-2 text-center relative overflow-visible select-none transform-gpu bg-[#151a21] text-white cursor-help ${borderGlowClass} ${
                              isActing
                                ? 'anim-card-strike-enemy'
                                : isHit
                                  ? 'anim-card-recoil'
                                  : isPlagueCasting
                                    ? 'anim-plague-channel'
                                    : ''
                            }`}
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
                                  className={`absolute inset-0 w-full h-full object-cover ${card.delay > 0 ? 'opacity-40' : 'opacity-85'}`} 
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
                              className="bg-red-500 h-full w-full rounded-full origin-left transform-gpu will-change-transform"
                              animate={{ scaleX: Math.max(0, card.health / card.maxHealth) }}
                              transition={{ duration: Math.max(0.12, 0.28 / effectiveSpeed), ease: "easeOut" }}
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
                        </div>
                      </motion.div>
                      ) : (
                        // Empty Recessed Slot
                        <div key={`empty-slot-${idx}`} className="w-full h-full rounded-xl border border-amber-950/20 bg-black/45 flex flex-col items-center justify-center relative shadow-[inset_0_4px_10px_rgba(0,0,0,0.8)] group hover:border-[#ebd09b]/15 transition-all duration-300">
                          <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />
                          <Swords className="w-5 h-5 text-amber-950/30 group-hover:text-amber-950/50 transition-colors" />
                          <span className="text-[7px] font-mono font-bold text-amber-950/25 uppercase tracking-widest mt-1">Empty Slot</span>
                        </div>
                      )}
                    </AnimatePresence>

                    {/* Skill Overlay Animations with Dedicated Lifecycles */}
                    {/* Consolidated Overlay Layer for High Performance */}
                    <AnimatePresence>
                      {barrierShatterSlot?.side === side && barrierShatterSlot?.slot === idx && (
                        <BarrierShatterOverlay key="barrier" />
                      )}
                      {armorSparkSlot?.side === side && armorSparkSlot?.slot === idx && (
                        <ArmorSparkOverlay key="armor-spark" />
                      )}
                      {armorBreakSlot?.side === side && armorBreakSlot?.slot === idx && (
                        <ArmorBreakOverlay key="armor-break" />
                      )}
                      {isHit && (
                        <motion.div
                          key="hit-flash"
                          initial={{ opacity: 0.8 }}
                          animate={{ opacity: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: Math.max(0.15, 0.32 / effectiveSpeed) }}
                          className="absolute inset-0 bg-red-600/40 z-30 pointer-events-none rounded-xl"
                        />
                      )}
                      {isHeal && (
                        <motion.div
                          key="heal-flash"
                          initial={{ opacity: 0.8 }}
                          animate={{ opacity: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: Math.max(0.18, 0.42 / effectiveSpeed) }}
                          className="absolute inset-0 bg-emerald-500/35 z-30 pointer-events-none rounded-xl"
                        />
                      )}
                      {activeSkillVfx?.side === side && activeSkillVfx?.slot === idx && (
                        <motion.div
                          key={`skill-vfx-${activeSkillVfx.type}`}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: [0, 1, 1, 0], scale: [0.85, 1.03, 1.03, 0.9] }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: Math.max(0.35, 0.65 / effectiveSpeed) }}
                          className={`absolute inset-0 bg-black/55 border-2 rounded-xl z-35 flex flex-col items-center justify-center pointer-events-none overflow-hidden ${
                            activeSkillVfx.type === 'plague' ? 'border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.85)]' :
                            activeSkillVfx.type === 'void_strike' ? 'border-cyan-500 shadow-[0_0_25px_rgba(6,182,212,0.85)]' :
                            activeSkillVfx.type === 'blood_aura' ? 'border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.85)]' :
                            activeSkillVfx.type === 'warlord_cry' ? 'border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.85)]' :
                            'border-purple-500 shadow-[0_0_25px_rgba(168,85,247,0.85)]'
                          }`}
                        >
                          <img 
                            src={
                              activeSkillVfx.type === 'plague' ? '/icons/plague_fx.webp' :
                              activeSkillVfx.type === 'void_strike' ? '/icons/void_strike_fx.webp' :
                              activeSkillVfx.type === 'blood_aura' ? '/icons/blood_aura_fx.webp' :
                              activeSkillVfx.type === 'warlord_cry' ? '/icons/warlord_cry_fx.webp' :
                              '/icons/hex_fx.webp'
                            } 
                            className="absolute inset-0 w-full h-full object-cover opacity-90" 
                          />
                          <span className={`relative text-[9px] font-mono font-black tracking-widest uppercase leading-none bg-black/80 px-2 py-0.5 rounded border z-10 ${
                            activeSkillVfx.type === 'plague' ? 'text-emerald-400 border-emerald-500/40' :
                            activeSkillVfx.type === 'void_strike' ? 'text-cyan-300 border-cyan-500/40' :
                            activeSkillVfx.type === 'blood_aura' ? 'text-red-300 border-red-500/40' :
                            activeSkillVfx.type === 'warlord_cry' ? 'text-amber-300 border-amber-500/40' :
                            'text-purple-300 border-purple-500/40'
                          }`}>
                            {activeSkillVfx.type === 'plague' ? 'PLAGUE INFECT' :
                             activeSkillVfx.type === 'void_strike' ? 'VOID STRIKE' :
                             activeSkillVfx.type === 'blood_aura' ? 'BLOOD AURA' :
                             activeSkillVfx.type === 'warlord_cry' ? 'WARLORD CRY' :
                             'HEX CURSED'}
                          </span>
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
                const isActing = attackerAction?.side === 'player' && attackerAction?.slot === idx;
                const isTargeted = attackerAction?.side === 'enemy' && (attackerAction.isDirect ? false : attackerAction.targetSlot === idx);
                const isHit = defenderAction?.side === 'player' && defenderAction?.slot === idx && defenderAction?.type === 'hit';
                const isDeath = defenderAction?.side === 'player' && defenderAction?.slot === idx && defenderAction?.type === 'death';
                const isHeal = defenderAction?.side === 'player' && defenderAction?.slot === idx && defenderAction?.type === 'heal';
                const isSummoning = summoningCard?.side === 'player' && summoningCard?.slot === idx;
                const isPlagueCasting = plagueAction?.sourceSide === 'player' && plagueAction?.sourceSlot === idx;
                const isPlagueTargeted = plagueAction?.targetSide === 'player' && plagueAction?.targetSlot === idx;
                const side = 'player';

                // Calculate strike displacement towards target cleanly
                const strikeX = isActing && attackerAction ? (attackerAction.isDirect ? 0 : (attackerAction.targetSlot - idx) * 88) : 0;
                const strikeY = isActing ? (attackerAction?.isDirect ? -75 : -60) : 0;

                const borderGlowClass = isHit 
                  ? "border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.95)] ring-2 ring-red-500" 
                  : isPlagueCasting
                    ? "border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.95)] ring-2 ring-emerald-400/80"
                    : isPlagueTargeted
                      ? "border-lime-500 shadow-[0_0_25px_rgba(132,204,22,0.9)] ring-2 ring-lime-500/80"
                      : isActing 
                        ? "border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.9)] ring-2 ring-amber-400/80"
                        : isTargeted
                          ? "border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.85)] ring-2 ring-rose-500/80"
                          : isSummoning
                            ? "border-cyan-400 shadow-[0_0_25px_rgba(102,252,241,0.85)] ring-2 ring-cyan-400/80"
                            : card && card.delay === 0 
                              ? "shadow-[0_0_15px_rgba(102,252,241,0.4)]" 
                              : "shadow-[0_4px_10px_rgba(0,0,0,0.4)]";

                return (
                  <div key={idx} className="relative aspect-[13/18] max-h-[190px] max-w-[140px] mx-auto w-full shrink-0">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      {renderFloatingTextsFor({ side: 'player', slot: idx })}
                    </div>
                    
                    <AnimatePresence>
                      {card ? (
                        <motion.div
                          key={`player-card-${card.id}-${idx}`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: isDeath ? 0 : 1, scale: isDeath ? 0.4 : 1 }}
                          exit={{ opacity: 0, scale: 0.5, transition: { duration: Math.max(0.12, 0.2 / effectiveSpeed) } }}
                          transition={{ duration: isDeath ? Math.max(0.12, 0.24 / effectiveSpeed) : 0.2 }}
                          className="w-full h-full relative"
                        >
                          <div
                            onMouseEnter={() => card && setHoveredCard(card)}
                            onMouseLeave={() => setHoveredCard(null)}
                            style={{
                              borderColor: isHit ? '#ef4444' : (isPlagueCasting ? '#10b981' : (isPlagueTargeted ? '#84cc16' : (isActing ? '#f59e0b' : (isTargeted ? '#f43f5e' : getTierBorderColor(card.tier))))),
                              '--strike-x': `${strikeX}px`,
                              '--strike-y': `${strikeY}px`,
                              '--strike-rot': `${strikeX > 0 ? -5 : strikeX < 0 ? 5 : -2}deg`,
                              '--anim-duration': `${Math.max(0.25, 0.72 / effectiveSpeed)}s`,
                              '--recoil-duration': `${Math.max(0.18, 0.32 / effectiveSpeed)}s`,
                            } as React.CSSProperties}
                            className={`w-full h-full rounded-xl border flex flex-col justify-between p-1.5 pb-2 text-center relative overflow-visible select-none transform-gpu bg-[#151a21] text-white cursor-help ${borderGlowClass} ${
                              isActing
                                ? 'anim-card-strike-player'
                                : isHit
                                  ? 'anim-card-recoil'
                                  : isPlagueCasting
                                    ? 'anim-plague-channel'
                                    : ''
                            }`}
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
                                  className={`absolute inset-0 w-full h-full object-cover ${card.delay > 0 ? 'opacity-40' : 'opacity-85'}`} 
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
                              className="bg-emerald-500 h-full w-full rounded-full origin-left transform-gpu will-change-transform"
                              animate={{ scaleX: Math.max(0, card.health / card.maxHealth) }}
                              transition={{ duration: Math.max(0.12, 0.28 / effectiveSpeed), ease: "easeOut" }}
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
                        </div>
                      </motion.div>
                      ) : (
                        // Empty Recessed Slot
                        <div 
                          key={`player-empty-${idx}`}
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
                    </AnimatePresence>

                    {/* Consolidated Overlay Layer for High Performance */}
                    <AnimatePresence>
                      {barrierShatterSlot?.side === side && barrierShatterSlot?.slot === idx && (
                        <BarrierShatterOverlay key="barrier" />
                      )}
                      {armorSparkSlot?.side === side && armorSparkSlot?.slot === idx && (
                        <ArmorSparkOverlay key="armor-spark" />
                      )}
                      {armorBreakSlot?.side === side && armorBreakSlot?.slot === idx && (
                        <ArmorBreakOverlay key="armor-break" />
                      )}
                      {isHit && (
                        <motion.div
                          key="hit-flash"
                          initial={{ opacity: 0.8 }}
                          animate={{ opacity: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: Math.max(0.15, 0.32 / effectiveSpeed) }}
                          className="absolute inset-0 bg-red-600/40 z-30 pointer-events-none rounded-xl"
                        />
                      )}
                      {isHeal && (
                        <motion.div
                          key="heal-flash"
                          initial={{ opacity: 0.8 }}
                          animate={{ opacity: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: Math.max(0.18, 0.42 / effectiveSpeed) }}
                          className="absolute inset-0 bg-emerald-500/35 z-30 pointer-events-none rounded-xl"
                        />
                      )}
                      {activeSkillVfx?.type === 'sacrifice' && activeSkillVfx?.side === 'player' && activeSkillVfx?.slot === idx && (
                        <motion.div
                          key="skill-vfx-sacrifice"
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: [0, 1, 1, 0], scale: [0.85, 1.05, 1.05, 0.9] }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: Math.max(0.35, 0.65 / effectiveSpeed) }}
                          className="absolute inset-0 bg-black/55 border-2 border-red-500 rounded-xl z-35 flex flex-col items-center justify-center pointer-events-none shadow-[0_0_25px_rgba(239,68,68,0.85)] overflow-hidden"
                        >
                          <img src="/icons/sacrifice_fx.webp" className="absolute inset-0 w-full h-full object-cover opacity-90" />
                          <span className="relative text-[8.5px] font-mono font-black text-red-400 tracking-widest uppercase leading-none bg-black/80 px-2 py-0.5 rounded border border-red-500/40 z-10 animate-pulse">SACRIFICED</span>
                        </motion.div>
                      )}
                      {activeSkillVfx?.type !== 'sacrifice' && activeSkillVfx?.side === side && activeSkillVfx?.slot === idx && (
                        <motion.div
                          key={`skill-vfx-${activeSkillVfx.type}`}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: [0, 1, 1, 0], scale: [0.85, 1.03, 1.03, 0.9] }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: Math.max(0.35, 0.65 / effectiveSpeed) }}
                          className={`absolute inset-0 bg-black/55 border-2 rounded-xl z-35 flex flex-col items-center justify-center pointer-events-none overflow-hidden ${
                            activeSkillVfx.type === 'plague' ? 'border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.85)]' :
                            activeSkillVfx.type === 'void_strike' ? 'border-cyan-500 shadow-[0_0_25px_rgba(6,182,212,0.85)]' :
                            activeSkillVfx.type === 'blood_aura' ? 'border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.85)]' :
                            activeSkillVfx.type === 'warlord_cry' ? 'border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.85)]' :
                            'border-purple-500 shadow-[0_0_25px_rgba(168,85,247,0.85)]'
                          }`}
                        >
                          <img 
                            src={
                              activeSkillVfx.type === 'plague' ? '/icons/plague_fx.webp' :
                              activeSkillVfx.type === 'void_strike' ? '/icons/void_strike_fx.webp' :
                              activeSkillVfx.type === 'blood_aura' ? '/icons/blood_aura_fx.webp' :
                              activeSkillVfx.type === 'warlord_cry' ? '/icons/warlord_cry_fx.webp' :
                              '/icons/hex_fx.webp'
                            } 
                            className="absolute inset-0 w-full h-full object-cover opacity-90" 
                          />
                          <span className={`relative text-[9px] font-mono font-black tracking-widest uppercase leading-none bg-black/80 px-2 py-0.5 rounded border z-10 ${
                            activeSkillVfx.type === 'plague' ? 'text-emerald-400 border-emerald-500/40' :
                            activeSkillVfx.type === 'void_strike' ? 'text-cyan-300 border-cyan-500/40' :
                            activeSkillVfx.type === 'blood_aura' ? 'text-red-300 border-red-500/40' :
                            activeSkillVfx.type === 'warlord_cry' ? 'text-amber-300 border-amber-500/40' :
                            'text-purple-300 border-purple-500/40'
                          }`}>
                            {activeSkillVfx.type === 'plague' ? 'PLAGUE INFECT' :
                             activeSkillVfx.type === 'void_strike' ? 'VOID STRIKE' :
                             activeSkillVfx.type === 'blood_aura' ? 'BLOOD AURA' :
                             activeSkillVfx.type === 'warlord_cry' ? 'WARLORD CRY' :
                             'HEX CURSED'}
                          </span>
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

        {/* Combat Log Drawer Overlay (REDESIGNED AAA CHRONICLE) */}
        <AnimatePresence>
          {showLogDrawer && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowLogDrawer(false)}
                className="fixed inset-0 bg-black/85 z-45"
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="fixed right-0 top-0 bottom-0 w-88 sm:w-[420px] bg-gradient-to-b from-[#131822] via-[#0d1017] to-[#0a0d13] border-l border-[#ebd09b]/35 z-50 p-4 sm:p-5 flex flex-col justify-between shadow-[-10px_0_40px_rgba(0,0,0,0.85)]"
              >
                {/* Header */}
                <div className="border-b border-gray-800 pb-3 mb-2 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-red-950/60 border border-red-500/40 flex items-center justify-center">
                        <Scroll className="w-4 h-4 text-red-400" />
                      </div>
                      <div>
                        <h4 className="font-display font-black text-xs sm:text-sm text-[#ebd09b] tracking-wider uppercase">
                          Battle Chronicle
                        </h4>
                        <span className="text-[10px] font-mono text-gray-400 block -mt-0.5">Live Duel Combat Logs</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowLogDrawer(false)}
                      className="text-gray-400 hover:text-white transition-all cursor-pointer p-1.5 rounded-lg border border-gray-800 hover:border-gray-600 bg-black/40"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Category Filter Tabs */}
                  <div className="grid grid-cols-4 gap-1 p-1 bg-black/60 rounded-xl border border-gray-800 text-[10px] font-mono font-bold text-center">
                    <button
                      onClick={() => setLogFilter('all')}
                      className={`py-1 rounded-lg transition-all cursor-pointer ${
                        logFilter === 'all'
                          ? 'bg-[#ebd09b] text-black font-black shadow'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      ALL
                    </button>
                    <button
                      onClick={() => setLogFilter('damage')}
                      className={`py-1 rounded-lg transition-all cursor-pointer ${
                        logFilter === 'damage'
                          ? 'bg-red-600 text-white font-black shadow'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      ⚔️ ATK
                    </button>
                    <button
                      onClick={() => setLogFilter('skills')}
                      className={`py-1 rounded-lg transition-all cursor-pointer ${
                        logFilter === 'skills'
                          ? 'bg-purple-600 text-white font-black shadow'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      🔮 SKILL
                    </button>
                    <button
                      onClick={() => setLogFilter('deaths')}
                      className={`py-1 rounded-lg transition-all cursor-pointer ${
                        logFilter === 'deaths'
                          ? 'bg-zinc-700 text-white font-black shadow'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      💀 DEAD
                    </button>
                  </div>
                </div>

                {/* Log List with Styled Event Cards */}
                <div
                  id="combat-log-scroll"
                  className="flex-1 overflow-y-auto text-xs space-y-2 pr-1 custom-scrollbar"
                >
                  {visualState.combatLog
                    .filter(log => {
                      if (logFilter === 'all') return true;
                      if (logFilter === 'damage') return log.includes('damage') || log.includes('deals') || log.includes('Breakthrough') || log.includes('hits') || log.includes('--- TURN') || log.includes('--- Turn');
                      if (logFilter === 'skills') return log.includes('Vampirism') || log.includes('Hex') || log.includes('Plague') || log.includes('Sacrifice') || log.includes('healed') || log.includes('Barrier') || log.includes('Armor') || log.includes('⚡') || log.includes('--- TURN') || log.includes('--- Turn');
                      if (logFilter === 'deaths') return log.includes('destroyed') || log.includes('turns to dust') || log.includes('fell') || log.includes('Death') || log.includes('💀') || log.includes('VICTORY') || log.includes('DEFEAT') || log.includes('--- TURN') || log.includes('--- Turn');
                      return true;
                    })
                    .map((log, index) => {
                      // 1. Turn Divider
                      if (log.includes('--- TURN') || log.includes('--- Turn')) {
                        const turnNum = log.replace(/[^0-9]/g, '') || '?';
                        return (
                          <div key={index} className="flex items-center gap-2 my-2 py-1 px-3 rounded-lg bg-gradient-to-r from-amber-950/70 via-black/60 to-transparent border-l-2 border-[#ebd09b]">
                            <Swords className="w-3.5 h-3.5 text-[#ebd09b]" />
                            <span className="font-display font-black text-xs text-[#ebd09b] tracking-wider uppercase">
                              TURN {turnNum}
                            </span>
                          </div>
                        );
                      }

                      // 2. Battle Start
                      if (log.includes('Battle has begun')) {
                        return (
                          <div key={index} className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-gray-300 text-[11px] sm:text-xs flex items-center gap-2.5">
                            <span className="text-base shrink-0">⚔️</span>
                            <span className="font-sans leading-relaxed">{log}</span>
                          </div>
                        );
                      }

                      // 3. Breakthrough (Direct Face Damage)
                      if (log.includes('Breakthrough') || log.includes('direct damage')) {
                        return (
                          <div key={index} className="p-2.5 rounded-xl bg-gradient-to-r from-red-950/40 to-black/50 border border-red-800/40 text-[11px] sm:text-xs flex items-start gap-2.5 shadow-sm">
                            <span className="text-base shrink-0">🎯</span>
                            <div className="flex-1 leading-relaxed text-gray-200 font-sans">
                              <span dangerouslySetInnerHTML={{ __html: log }} />
                            </div>
                          </div>
                        );
                      }

                      // 4. Destruction / Death
                      if (log.includes('destroyed') || log.includes('turns to dust') || log.includes('fell') || log.includes('Death') || log.includes('DEFEAT')) {
                        return (
                          <div key={index} className="p-2.5 rounded-xl bg-black/70 border border-red-950/80 text-[11px] sm:text-xs flex items-start gap-2.5 shadow-inner">
                            <span className="text-base shrink-0">💀</span>
                            <div className="flex-1 text-red-300/95 leading-relaxed font-sans font-medium">
                              <span dangerouslySetInnerHTML={{ __html: log }} />
                            </div>
                          </div>
                        );
                      }

                      // 5. Sacrifice
                      if (log.includes('Sacrifice') || log.includes('💀 Sacrifice')) {
                        return (
                          <div key={index} className="p-2.5 rounded-xl bg-gradient-to-r from-amber-950/35 to-black/50 border border-amber-800/40 text-[11px] sm:text-xs flex items-start gap-2.5">
                            <span className="text-base shrink-0">💀</span>
                            <div className="flex-1 text-amber-200 leading-relaxed font-sans">
                              <span dangerouslySetInnerHTML={{ __html: log }} />
                            </div>
                          </div>
                        );
                      }

                      // 6. Healing / Vampirism
                      if (log.includes('healed') || log.includes('Vampirism') || log.includes('🩸')) {
                        return (
                          <div key={index} className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/35 to-black/50 border border-emerald-800/40 text-[11px] sm:text-xs flex items-start gap-2.5">
                            <span className="text-base shrink-0">🩸</span>
                            <div className="flex-1 text-emerald-200 leading-relaxed font-sans">
                              <span dangerouslySetInnerHTML={{ __html: log }} />
                            </div>
                          </div>
                        );
                      }

                      // 7. Hex / Curses
                      if (log.includes('Hex') || log.includes('hexes') || log.includes('🔮')) {
                        return (
                          <div key={index} className="p-2.5 rounded-xl bg-gradient-to-r from-purple-950/35 to-black/50 border border-purple-800/40 text-[11px] sm:text-xs flex items-start gap-2.5">
                            <span className="text-base shrink-0">🔮</span>
                            <div className="flex-1 text-purple-200 leading-relaxed font-sans">
                              <span dangerouslySetInnerHTML={{ __html: log }} />
                            </div>
                          </div>
                        );
                      }

                      // 8. Plague
                      if (log.includes('Plague') || log.includes('poisonous spores') || log.includes('🧪')) {
                        return (
                          <div key={index} className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/35 to-black/50 border border-emerald-800/40 text-[11px] sm:text-xs flex items-start gap-2.5">
                            <span className="text-base shrink-0">🧪</span>
                            <div className="flex-1 text-emerald-300 leading-relaxed font-sans">
                              <span dangerouslySetInnerHTML={{ __html: log }} />
                            </div>
                          </div>
                        );
                      }

                      // 9. Barrier & Armor
                      if (log.includes('Barrier') || log.includes('Armor') || log.includes('🛡️')) {
                        return (
                          <div key={index} className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-950/35 to-black/50 border border-cyan-800/40 text-[11px] sm:text-xs flex items-start gap-2.5">
                            <span className="text-base shrink-0">🛡️</span>
                            <div className="flex-1 text-cyan-200 leading-relaxed font-sans">
                              <span dangerouslySetInnerHTML={{ __html: log }} />
                            </div>
                          </div>
                        );
                      }

                      // 10. Hero Skills & Commander Stance
                      if (log.includes('⚡') || log.includes('Commander') || log.includes('Void Strike')) {
                        return (
                          <div key={index} className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-950/40 to-black/50 border border-indigo-700/50 text-[11px] sm:text-xs flex items-start gap-2.5 shadow-sm">
                            <span className="text-base shrink-0">⚡</span>
                            <div className="flex-1 text-indigo-200 leading-relaxed font-sans font-medium">
                              <span dangerouslySetInnerHTML={{ __html: log }} />
                            </div>
                          </div>
                        );
                      }

                      // Default Attack/Clash Event Card
                      return (
                        <div key={index} className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] sm:text-xs text-gray-300 flex items-start gap-2.5 leading-relaxed font-sans">
                          <span className="text-base shrink-0 opacity-70">🗡️</span>
                          <div className="flex-1">
                            <span dangerouslySetInnerHTML={{ __html: log }} />
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-800 pt-3 mt-2">
                  <button
                    onClick={() => setShowLogDrawer(false)}
                    className="w-full bg-black/50 hover:bg-black/80 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white py-2.5 rounded-xl text-xs font-mono font-bold cursor-pointer transition-all tracking-wider uppercase"
                  >
                    CLOSE CHRONICLE
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
              className="absolute bottom-[175px] left-6 w-[350px] bg-[#0d1117]/98 border-2 border-[#ebd09b]/35 rounded-2xl p-4 z-45 shadow-[0_10px_35px_rgba(0,0,0,0.85)] pointer-events-none text-left flex gap-3.5"
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
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex justify-center items-end h-[170px] z-40 select-none pointer-events-none w-full max-w-[560px] px-2">
          <div className="flex justify-center items-end relative w-full h-full pointer-events-auto">
            {visualState.playerHand.map((card, idx) => {
              const isSelected = selectedHandCardId === card.id;
              
              // Spacing spread calculations
              const totalHand = visualState.playerHand.length;
              const middle = (totalHand - 1) / 2;
              const offset = idx - middle;
              const rotate = offset * 5; 
              
              // Dynamic card step based on screen width
              const stepX = typeof window !== 'undefined' && window.innerWidth < 640 ? 38 : 52;
              let translateX = offset * stepX;
              // Push cards slightly down when not hovered, but raise them so they are readable
              let translateY = Math.abs(offset) * 5 + (isSelected ? -25 : 35);
              let scale = 1.0;
              let zIndex = 10 + idx;

              // If a card is hovered, slide other cards aside (Hearthstone style)
              if (hoveredHandCardIndex !== null) {
                if (hoveredHandCardIndex === idx) {
                  translateY = -75;
                  scale = 1.45;
                  zIndex = 100;
                } else if (idx < hoveredHandCardIndex) {
                  translateX -= 35; // Slide left
                } else if (idx > hoveredHandCardIndex) {
                  translateX += 35; // Slide right
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
                        : getTierBorderColor(card.tier)
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
                            decoding="async"
                            loading="eager"
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
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-gradient-to-b from-[#18140f] via-[#0d0a08] to-[#050403] border-2 border-amber-500/50 rounded-3xl p-5 sm:p-7 max-w-md w-full max-h-[92vh] overflow-y-auto custom-scrollbar text-center space-y-4 sm:space-y-6 shadow-[0_0_50px_rgba(245,158,11,0.25)] relative">
            
            {/* Ambient Background Flare */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-yellow-500/10 blur-3xl pointer-events-none" />

            {/* Glowing Victory Crest */}
            <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
              <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-md animate-pulse" />
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-b from-amber-950 via-black to-black border-2 border-amber-400 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.4)] relative z-10">
                <Swords className="w-8 h-8 sm:w-10 sm:h-10 text-amber-300 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
              </div>
            </div>

            <div className="space-y-1 relative z-10">
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
                <div className="bg-black/60 p-3.5 sm:p-4 rounded-2xl border border-amber-500/20 relative z-10">
                  <span className="text-[10px] font-display text-amber-400 tracking-widest block uppercase font-bold mb-2">STAGE MASTERY</span>
                  <div className="flex justify-center gap-3 mb-2.5">
                    {[1, 2, 3].map(s => (
                      <Star 
                        key={s} 
                        className={`w-7 h-7 sm:w-8 sm:h-8 transition-all duration-500 ${s <= earnedStars ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.9)] scale-110' : 'text-gray-800 fill-gray-900'}`} 
                      />
                    ))}
                  </div>
                  
                  <div className="text-[11px] font-sans text-gray-300 space-y-1.5 bg-black/50 p-2.5 sm:p-3 rounded-xl border border-white/5 text-left">
                    <div className="flex justify-between items-center py-0.5">
                      <span className="flex items-center gap-1.5">
                        <Star className={`w-3.5 h-3.5 ${earnedStars >= 1 ? 'text-amber-400 fill-amber-400' : 'text-gray-700'}`} />
                        <span className={earnedStars >= 1 ? "text-emerald-400 font-bold" : "text-gray-500"}>1 Star Challenge</span>
                      </span>
                      <span className={earnedStars >= 1 ? "text-emerald-400/90" : "text-gray-500"}>Clear Stage</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-white/5 pt-1 py-0.5">
                      <span className="flex items-center gap-1.5">
                        <Star className={`w-3.5 h-3.5 ${earnedStars >= 2 ? 'text-amber-400 fill-amber-400' : 'text-gray-700'}`} />
                        <span className={earnedStars >= 2 ? "text-emerald-400 font-bold" : "text-gray-500"}>2 Star Challenge</span>
                      </span>
                      <span className={earnedStars >= 2 ? "text-emerald-400/90" : "text-gray-500"}>Keep HP &gt; 50%</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-white/5 pt-1 py-0.5">
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
              <div className={`grid gap-2.5 ${battleType === 'pvp' ? (earnedSovereigns > 0 ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-2 sm:grid-cols-4') : (stage.shardsReward > 0 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3')}`}>
                {/* Gold */}
                <div className="bg-gradient-to-b from-amber-950/40 via-black to-black border border-amber-500/30 p-2.5 rounded-xl text-center shadow-inner flex flex-col items-center justify-center">
                  <span className="text-amber-300 font-display font-black text-base flex items-center gap-1 text-shadow-gold">
                    +{earnedGold}
                    <img src="/icons/icon_gold.webp" alt="Gold" className="w-5 h-5 object-contain drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
                  </span>
                  <span className="text-[9px] text-amber-400/70 font-mono uppercase tracking-wider mt-0.5 font-bold">Gold</span>
                </div>
                
                {/* Dust */}
                <div className="bg-gradient-to-b from-cyan-950/40 via-black to-black border border-cyan-500/30 p-2.5 rounded-xl text-center shadow-inner flex flex-col items-center justify-center">
                  <span className="text-cyan-300 font-display font-black text-base flex items-center gap-1 text-shadow-cyan">
                    +{earnedDust}
                    <img src="/icons/icon_dust.webp" alt="Dust" className="w-7 h-7 object-contain drop-shadow-[0_0_8px_rgba(102,252,241,0.6)] scale-125" />
                  </span>
                  <span className="text-[9px] text-cyan-400/70 font-mono uppercase tracking-wider mt-1 font-bold">Dust</span>
                </div>

                {/* EXP (Both PvE and PvP) */}
                <div className="bg-gradient-to-b from-emerald-950/40 via-black to-black border border-emerald-500/30 p-2.5 rounded-xl text-center shadow-inner flex flex-col items-center justify-center">
                  <span className="text-emerald-300 font-display font-black text-base flex items-center gap-1 text-shadow-emerald">
                    +{earnedExp}
                    <img src="/icons/icon_exp.webp" alt="EXP" className="w-6 h-6 object-contain drop-shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
                  </span>
                  <span className="text-[9px] text-emerald-400/70 font-mono uppercase tracking-wider mt-1 font-bold">EXP</span>
                </div>
                
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

                {/* Blood Sovereigns (PvP Only - Subscriber Bounty when > 0) */}
                {battleType === 'pvp' && earnedSovereigns > 0 && (
                  <div className="bg-gradient-to-b from-amber-950/50 via-black to-black border border-amber-500/50 p-2.5 rounded-xl text-center shadow-inner flex flex-col items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                    <span className="text-amber-400 font-display font-black text-base flex items-center gap-1 text-shadow-gold">
                      +{earnedSovereigns}
                      <img src="/icons/icon_sovereign.webp" alt="SOV" className="w-5 h-5 object-contain drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
                    </span>
                    <span className="text-[9px] text-amber-300 font-mono uppercase tracking-wider mt-1 font-bold">Sovereigns</span>
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

              {/* Gold Bonus Breakdown Info Strip */}
              {(subGoldBonusPercent > 0 || equipGoldBonus > 0) && (
                <div className="flex items-center justify-center gap-1.5 flex-wrap bg-amber-950/20 border border-amber-500/20 rounded-xl px-3 py-1.5 text-[10.5px]">
                  <span className="text-amber-400/80 font-mono flex items-center gap-1">
                    <span className="font-bold text-amber-300">Gold Bonus:</span>
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {subGoldBonusPercent > 0 && (
                      <span className="inline-flex items-center gap-1 font-black text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md">
                        <span>{subTier === 'ultra' ? '👑' : '⚜️'}</span>
                        <span>+{subGoldBonusPercent}% {subTier === 'ultra' ? 'Ultra' : 'VIP'}</span>
                      </span>
                    )}
                    {subGoldBonusPercent > 0 && equipGoldBonus > 0 && (
                      <span className="text-gray-500 font-bold">+</span>
                    )}
                    {equipGoldBonus > 0 && (
                      <span className="inline-flex items-center gap-1 font-black text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded-md">
                        <span>🛡️</span>
                        <span>+{equipGoldBonus}% Gear</span>
                      </span>
                    )}
                    <span className="text-gray-400 text-[10px] ml-0.5 font-mono">
                      (Total +{subGoldBonusPercent + equipGoldBonus}%)
                    </span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => onExitBattle(true)}
              className="w-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:to-yellow-400 text-black font-display font-black tracking-widest py-3.5 sm:py-4 px-6 rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:shadow-[0_0_35px_rgba(245,158,11,0.7)] text-xs uppercase transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer relative z-10"
            >
              CLAIM LOOT AND EXIT
            </button>
          </div>
        </div>
      )}

      {/* LOST POPUP MODAL */}
      {battle.phase === 'player_lost' && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-gradient-to-b from-[#1c080a] via-[#0e0304] to-[#050102] border-2 border-rose-600/50 rounded-3xl p-5 sm:p-7 max-w-md w-full max-h-[92vh] overflow-y-auto custom-scrollbar text-center space-y-4 sm:space-y-6 shadow-[0_0_50px_rgba(225,29,72,0.25)] relative">
            
            {/* Ambient Background Flare */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-rose-600/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-600/10 blur-3xl pointer-events-none" />

            {/* Glowing Defeat Skull */}
            <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
              <div className="absolute inset-0 bg-rose-600/20 rounded-full blur-md animate-pulse" />
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-b from-red-950 via-black to-black border-2 border-rose-500 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(225,29,72,0.4)] relative z-10">
                <Skull className="w-8 h-8 sm:w-10 sm:h-10 text-rose-500 drop-shadow-[0_0_10px_rgba(225,29,72,0.8)] animate-pulse" />
              </div>
            </div>

            <div className="space-y-1 relative z-10">
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
                    +{lossEarnedGold}
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

              {/* Gold Bonus Breakdown Info Strip on Defeat */}
              {(subGoldBonusPercent > 0 || equipGoldBonus > 0) && (
                <div className="flex items-center justify-center gap-1.5 flex-wrap bg-amber-950/20 border border-amber-500/20 rounded-xl px-3 py-1.5 text-[10.5px]">
                  <span className="text-amber-400/80 font-mono flex items-center gap-1">
                    <span className="font-bold text-amber-300">Gold Bonus:</span>
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {subGoldBonusPercent > 0 && (
                      <span className="inline-flex items-center gap-1 font-black text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md">
                        <span>{subTier === 'ultra' ? '👑' : '⚜️'}</span>
                        <span>+{subGoldBonusPercent}% {subTier === 'ultra' ? 'Ultra' : 'VIP'}</span>
                      </span>
                    )}
                    {subGoldBonusPercent > 0 && equipGoldBonus > 0 && (
                      <span className="text-gray-500 font-bold">+</span>
                    )}
                    {equipGoldBonus > 0 && (
                      <span className="inline-flex items-center gap-1 font-black text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded-md">
                        <span>🛡️</span>
                        <span>+{equipGoldBonus}% Gear</span>
                      </span>
                    )}
                    <span className="text-gray-400 text-[10px] ml-0.5 font-mono">
                      (Total +{subGoldBonusPercent + equipGoldBonus}%)
                    </span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => onExitBattle(false)}
              className="w-full bg-gradient-to-r from-red-950 via-rose-900 to-red-950 border-2 border-rose-600/70 hover:border-rose-400 text-white font-display font-black tracking-widest py-3.5 sm:py-4 px-6 rounded-2xl shadow-[0_0_20px_rgba(225,29,72,0.3)] hover:shadow-[0_0_30px_rgba(225,29,72,0.5)] text-xs uppercase transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer relative z-10"
            >
              {battleType === 'pvp' ? 'RETURN TO ARENA' : 'RETURN TO CAMPAIGN'}
            </button>
          </div>
        </div>
      )}

      {/* DETAILED HELP MODAL (FULL RICH TEXT - EXPANDED ZERO-SCROLL AAA GUIDE) */}
      <AnimatePresence>
        {showHelpModal && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-2.5 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="bg-[#12161f] border border-[#ebd09b]/50 rounded-2xl max-w-2xl sm:max-w-3xl w-full shadow-[0_0_60px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center px-4 sm:px-6 py-3 bg-gradient-to-r from-black/85 via-[#1a1f2c] to-black/85 border-b border-[#ebd09b]/25">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-[#ebd09b]/25 to-purple-950/70 border border-[#ebd09b]/50 flex items-center justify-center shadow-md">
                    <Swords className="w-4 h-4 sm:w-5 sm:h-5 text-[#ebd09b]" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-sm sm:text-base text-[#ebd09b] tracking-wider uppercase leading-tight">
                      Combat Tactics Guide
                    </h3>
                    <span className="text-[10px] sm:text-xs font-mono text-gray-400 block -mt-0.5">Rules & Codex of Void Covenant</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="text-gray-400 hover:text-white font-mono font-bold text-xs bg-black/50 hover:bg-black/80 border border-gray-700 hover:border-gray-400 rounded-lg p-1.5 sm:px-2.5 sm:py-1.5 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="grid grid-cols-3 gap-1.5 p-2 sm:p-2.5 bg-black/70 border-b border-gray-800 text-center font-display text-[11px] sm:text-xs font-bold">
                <button
                  onClick={() => setHelpTab('basics')}
                  className={`py-2 px-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    helpTab === 'basics'
                      ? 'bg-gradient-to-r from-amber-950/90 to-purple-950/90 border border-[#ebd09b] text-[#ebd09b] shadow-[0_0_12px_rgba(235,208,155,0.25)]'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Swords className="w-3.5 h-3.5 shrink-0" />
                  <span>DUEL BASICS</span>
                </button>
                <button
                  onClick={() => setHelpTab('skills')}
                  className={`py-2 px-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    helpTab === 'skills'
                      ? 'bg-gradient-to-r from-purple-950/90 to-indigo-950/90 border border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 shrink-0 text-purple-400" />
                  <span>DARK SKILLS</span>
                </button>
                <button
                  onClick={() => setHelpTab('defense')}
                  className={`py-2 px-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    helpTab === 'defense'
                      ? 'bg-gradient-to-r from-cyan-950/90 to-blue-950/90 border border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                  <span>DEFENSE & TIPS</span>
                </button>
              </div>

              {/* Full Rich Body Content with Distinct Standalone Cards */}
              <div className="p-3 sm:p-4 text-xs sm:text-[13px] text-gray-300">
                {helpTab === 'basics' && (
                  <motion.div initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                    {/* 1. Combat System (Linear Duels) */}
                    <div className="p-2.5 sm:p-3 rounded-xl bg-black/45 border border-white/10 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                          🗡️ Combat System (Linear Duels)
                        </h4>
                        <span className="text-[10px] font-mono text-amber-300/80">5-Slot Board</span>
                      </div>
                      <p className="text-gray-300 text-xs sm:text-[13px] leading-relaxed">
                        Combat is 1v1 on a linear 5-slot board. Cards attack <strong className="text-white">strictly opposite themselves</strong>. If the slot opposite is empty, all damage goes directly to enemy hero (Lord). Goal is to bring enemy health to zero.
                      </p>
                      <div className="grid grid-cols-2 gap-2 pt-0.5 font-mono text-xs">
                        <div className="p-1.5 sm:p-2 rounded-lg bg-purple-950/30 border border-purple-800/40 text-center">
                          <span className="text-purple-300 font-bold block text-[11px] sm:text-xs">⚔️ Creature Clash</span>
                          <span className="text-gray-400 text-[10px] sm:text-[11px]">Slot occupied ➔ cards duel each other</span>
                        </div>
                        <div className="p-1.5 sm:p-2 rounded-lg bg-red-950/30 border border-red-800/40 text-center">
                          <span className="text-red-300 font-bold block text-[11px] sm:text-xs">🎯 Direct Damage</span>
                          <span className="text-gray-400 text-[10px] sm:text-[11px]">Slot empty ➔ full damage hits Enemy Lord!</span>
                        </div>
                      </div>
                    </div>

                    {/* 2. Turn Delay */}
                    <div className="p-2.5 sm:p-3 rounded-xl bg-black/45 border border-white/10 space-y-1.5">
                      <h4 className="font-display font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                        ⏳ Delay Mechanics (Delay)
                      </h4>
                      <p className="text-gray-300 text-[11px] sm:text-xs leading-relaxed">
                        When placed on board, card has a delay indicator (e.g. 1, 2 or 3 turns). It cannot attack immediately. Each turn timer decreases by 1. Reaching <strong className="text-emerald-300">0</strong> makes card active ⚔️ and attacks at the end of each your turn.
                      </p>
                    </div>

                    {/* 3 & 4. Mana Crystals & Victory Goal (SEPARATE STANDALONE CARDS) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="p-2.5 sm:p-3 rounded-xl bg-black/45 border border-white/10 space-y-1">
                        <h4 className="font-display font-bold text-xs sm:text-sm text-cyan-300 flex items-center gap-1.5">
                          🔮 Mana Crystals
                        </h4>
                        <p className="text-gray-300 text-[11px] sm:text-xs leading-relaxed">
                          Mana refills and grows each round (1 ➔ 10). Each card costs Mana indicated on its crystal badge.
                        </p>
                      </div>

                      <div className="p-2.5 sm:p-3 rounded-xl bg-black/45 border border-white/10 space-y-1">
                        <h4 className="font-display font-bold text-xs sm:text-sm text-[#ebd09b] flex items-center gap-1.5">
                          👑 Victory Goal
                        </h4>
                        <p className="text-gray-300 text-[11px] sm:text-xs leading-relaxed">
                          Destroy the enemy Lord by reducing their Health to <strong className="text-red-400">0 HP</strong> before they destroy yours.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {helpTab === 'skills' && (
                  <motion.div initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                    {/* Vampirism */}
                    <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-rose-950/40 to-black/60 border border-rose-900/50 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {renderSkillIcon("vampirism", "w-5 h-5")}
                          <span className="font-display font-bold text-xs sm:text-sm text-rose-300">Vampirism [X]</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-rose-950 border border-rose-700/60 font-mono text-[9px] font-bold text-rose-300 uppercase">
                          On Attack
                        </span>
                      </div>
                      <p className="text-gray-300 text-[11px] sm:text-xs leading-relaxed">
                        Every time creature attacks and damages another card, it heals itself by <strong className="text-emerald-400">+X HP</strong> (up to max HP).
                      </p>
                    </div>

                    {/* Hex */}
                    <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-purple-950/40 to-black/60 border border-purple-900/50 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {renderSkillIcon("hex", "w-5 h-5")}
                          <span className="font-display font-bold text-xs sm:text-sm text-purple-300">Hex [X]</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-700/60 font-mono text-[9px] font-bold text-purple-300 uppercase">
                          Before Strike
                        </span>
                      </div>
                      <p className="text-gray-300 text-[11px] sm:text-xs leading-relaxed">
                        Before dealing damage, hexes the opposite creature, increasing next incoming damage by <strong className="text-purple-300">+X</strong>.
                      </p>
                    </div>

                    {/* Plague */}
                    <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-emerald-950/40 to-black/60 border border-emerald-900/50 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {renderSkillIcon("plague", "w-5 h-5")}
                          <span className="font-display font-bold text-xs sm:text-sm text-emerald-300">Plague [X]</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700/60 font-mono text-[9px] font-bold text-emerald-300 uppercase">
                          End of Turn
                        </span>
                      </div>
                      <p className="text-gray-300 text-[11px] sm:text-xs leading-relaxed">
                        At the end of each turn, emits poisonous spores dealing <strong className="text-emerald-400">X pure damage</strong> to a random living enemy on board.
                      </p>
                    </div>

                    {/* Sacrifice */}
                    <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-red-950/50 to-black/60 border border-red-900/60 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {renderSkillIcon("sacrifice", "w-5 h-5")}
                          <span className="font-display font-bold text-xs sm:text-sm text-red-300">Sacrifice [X]</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-red-950 border border-red-700/60 font-mono text-[9px] font-bold text-red-300 uppercase">
                          On Play
                        </span>
                      </div>
                      <p className="text-gray-300 text-[11px] sm:text-xs leading-relaxed">
                        On play, destroys a random ally on your board. In return, <strong className="text-emerald-400">heals your hero by +X HP</strong>, and creature permanently gets <strong className="text-red-400">+(X/2) Attack</strong> and <strong className="text-emerald-400">+X Health</strong>.
                      </p>
                    </div>
                  </motion.div>
                )}

                {helpTab === 'defense' && (
                  <motion.div initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                    {/* 1 & 2. Barrier & Armor Plates (SEPARATE STANDALONE CARDS) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="p-2.5 sm:p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 space-y-1">
                        <span className="font-display font-bold text-xs sm:text-sm text-cyan-300 flex items-center gap-1.5">
                          🛡️ Barrier / Ward
                        </span>
                        <p className="text-gray-300 text-[11px] sm:text-xs leading-relaxed">
                          A magical shield that completely absorbs <strong className="text-cyan-200">100% of the first incoming attack</strong>, regardless of its damage power. Shatters upon hit.
                        </p>
                      </div>

                      <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/50 border border-slate-700/50 space-y-1">
                        <span className="font-display font-bold text-xs sm:text-sm text-slate-300 flex items-center gap-1.5">
                          🔰 Armor Plates
                        </span>
                        <p className="text-gray-300 text-[11px] sm:text-xs leading-relaxed">
                          Armor points absorb damage first before the creature's core Health is touched. Breaks once exhausted.
                        </p>
                      </div>
                    </div>

                    {/* 3. Hero Evade / Dodge (SEPARATE STANDALONE CARD) */}
                    <div className="p-2.5 sm:p-3 rounded-xl bg-black/45 border border-white/10 flex items-center gap-2.5">
                      <span className="text-xl">💨</span>
                      <div className="text-[11px] sm:text-xs leading-relaxed">
                        <strong className="text-white block font-display text-xs sm:text-sm mb-0.5">Hero Evade / Dodge</strong>
                        <span className="text-gray-300">Equipped boots and agility talents give your Hero a chance to completely dodge direct attacks!</span>
                      </div>
                    </div>

                    {/* 4. Master Pro-Tips (SEPARATE STANDALONE CARD) */}
                    <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-purple-950/30 via-black/40 to-amber-950/30 border border-[#ebd09b]/30 space-y-1">
                      <span className="text-xs sm:text-sm font-display font-bold text-[#ebd09b] flex items-center gap-1.5">
                        💡 Tactical Pro-Tips:
                      </span>
                      <ul className="space-y-0.5 text-[11px] sm:text-xs text-gray-300 list-disc pl-5 font-sans">
                        <li><strong className="text-white">Sacrifice strategy:</strong> Sacrifice weak or wounded cards for explosive buffs to your key creatures!</li>
                        <li><strong className="text-white">Empty lane rush:</strong> Place low-delay attackers (Delay 1) directly opposite empty slots to burn the enemy Lord.</li>
                        <li><strong className="text-white">Break shields first:</strong> Pop enemy Barrier charges with minor attacks or Plague spores before heavy strikes.</li>
                      </ul>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-3 sm:p-3.5 bg-black/85 border-t border-gray-800">
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="w-full bg-gradient-to-r from-[#c5a880] to-[#ebd09b] hover:from-[#ebd09b] hover:to-[#fff] text-black font-display font-black py-2.5 sm:py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(235,208,155,0.3)] text-xs sm:text-sm tracking-widest cursor-pointer active:scale-98"
                >
                  ⚔️ UNDERSTOOD, TO BATTLE!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
