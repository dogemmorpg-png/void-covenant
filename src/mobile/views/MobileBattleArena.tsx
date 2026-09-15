import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { useToast } from '../../components/Toast';
import { CampaignStage, BattleState, BattleCardState, Equipment, Card } from '../../types';
import { initializeBattle, simulateCombatTurn, toBattleCard, placeCardLocally } from '../../utils/gameLogic';
import { calculateEquipmentSetBonuses } from '../../data/equipment';
import { 
  Swords, 
  Skull, 
  Shield, 
  Zap, 
  ArrowLeft, 
  Pause, 
  Play, 
  Scroll, 
  X, 
  Trophy, 
  Star, 
  HelpCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MobileBattleArenaProps {
  stage: CampaignStage;
  onExitBattle: (victory: boolean) => void;
  battleType?: 'campaign' | 'pvp';
}

interface FloatingTextEffect {
  id: string;
  text: string;
  target: 'player-hero' | 'enemy-hero' | { side: 'player' | 'enemy'; slot: number };
  colorClass: string;
}

// Lightweight immutable clone for BattleState
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

// Tier styling matching PC Battlefield
const getTierBorderColor = (tier: string) => {
  switch (tier?.toLowerCase()) {
    case 'bronze': return 'border-amber-700/70 shadow-[0_0_8px_rgba(245,158,11,0.2)]';
    case 'silver': return 'border-slate-400/70 shadow-[0_0_8px_rgba(148,163,184,0.2)]';
    case 'gold': return 'border-yellow-500/90 shadow-[0_0_10px_rgba(234,179,8,0.35)]';
    case 'legendary': return 'border-purple-500/90 shadow-[0_0_12px_rgba(168,85,247,0.45)]';
    case 'divine': return 'border-rose-500 shadow-[0_0_16px_rgba(244,63,94,0.85)] ring-1 ring-rose-400/60';
    default: return 'border-zinc-700/80';
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
    case 'divine': return 'text-rose-400 font-black drop-shadow-[0_0_6px_rgba(244,63,94,0.9)]';
    default: return 'text-gray-400 font-medium';
  }
};

const getSkillBadgeStyle = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'sacrifice': return 'bg-red-950/90 border-red-900/60 text-red-400';
    case 'vampirism': return 'bg-rose-950/90 border-rose-900/60 text-rose-300';
    case 'hex': return 'bg-purple-950/90 border-purple-900/60 text-purple-300';
    case 'plague': return 'bg-emerald-950/90 border-emerald-900/60 text-emerald-300';
    default: return 'bg-gray-950/90 border-gray-800 text-gray-300';
  }
};

const getSkillNameEnglish = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'sacrifice': return 'Sacrifice';
    case 'vampirism': return 'Vampirism';
    case 'hex': return 'Hex';
    case 'plague': return 'Plague';
    default: return type || 'Special';
  }
};

const getSkillDescEnglish = (type: string, value: number) => {
  switch (type?.toLowerCase()) {
    case 'sacrifice': return `Sacrifices a random ally on play: Lord gains +${value} HP; card gains +${Math.round(value / 2)} ATK & +${value} HP.`;
    case 'vampirism': return `Heals this card by +${value} HP each time it deals attack damage.`;
    case 'hex': return `Hexes opposing card, amplifying all subsequent damage received by +${value}.`;
    case 'plague': return `Spreads plague at end of turn, dealing -${value} HP to a random living enemy.`;
    default: return `Passive ability with intensity power ${value}.`;
  }
};

// 100% Authentic PC SVG Mana Crystal
const renderManaIcon = (cost: number, sizeClass: string = "w-4 h-4") => {
  return (
    <div className={`relative ${sizeClass} shrink-0 flex items-center justify-center`}>
      <svg className="absolute inset-0 w-full h-full filter drop-shadow-[0_0_5px_rgba(6,182,212,0.85)]" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L4 7v10l8 5 8-5V7l-8-5z" fill="url(#manaCrystalGradMobile)" stroke="#66fcf1" strokeWidth="1.5" />
        <path d="M12 2L4 7l8 5 8-5-8-5z" fill="#66fcf1" opacity="0.35" />
        <path d="M4 7v10l8 5V12L4 7z" fill="#00d2ff" opacity="0.55" />
        <path d="M20 7v10l8 5V12L20 7z" fill="#005299" opacity="0.75" />
        <defs>
          <radialGradient id="manaCrystalGradMobile" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00f0ff" />
            <stop offset="100%" stopColor="#0033aa" />
          </radialGradient>
        </defs>
      </svg>
      <span className="relative text-white text-[9px] font-black font-mono leading-none z-10 drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.95)]">
        {cost}
      </span>
    </div>
  );
};

// 100% Authentic PC Skill Icons
const renderSkillIcon = (type: string, sizeClass: string = "w-3.5 h-3.5") => {
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

// 100% Authentic PC Barrier Dome
const BarrierDome: React.FC = () => (
  <div className="absolute inset-0 z-25 pointer-events-none rounded-xl overflow-hidden">
    <div className="absolute inset-0 rounded-xl border-2 border-amber-400/85 shadow-[0_0_16px_rgba(251,191,36,0.65),inset_0_0_12px_rgba(251,191,36,0.3)] animate-pulse" />
    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-200/15 to-transparent pointer-events-none" />
    <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-300 shadow-[0_0_6px_rgba(251,191,36,1)]" />
    <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-amber-300 shadow-[0_0_6px_rgba(251,191,36,1)]" />
    <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-amber-300 shadow-[0_0_6px_rgba(251,191,36,1)]" />
    <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-300 shadow-[0_0_6px_rgba(251,191,36,1)]" />
    <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center">
      <div className="w-4 h-4 rounded-full bg-gradient-to-b from-amber-900 to-black border border-amber-300/90 flex items-center justify-center shadow-[0_0_10px_rgba(251,191,36,0.9)]">
        <svg className="w-2.5 h-2.5 text-amber-300 filter drop-shadow-[0_0_3px_rgba(251,191,36,0.9)]" viewBox="0 0 24 24" fill="currentColor">
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
    transition={{ duration: 0.55, ease: "easeOut" }}
    className="absolute -inset-2 z-40 flex items-center justify-center pointer-events-none rounded-xl overflow-visible"
  >
    <div className="absolute inset-0 rounded-xl border-2 border-amber-300 shadow-[0_0_25px_rgba(251,191,36,1)]" />
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

// Authentic PC Armor Badge
const ArmorBadge: React.FC<{ armor: number }> = ({ armor }) => (
  <div className="absolute -top-3 -left-3 w-7 h-7 z-20 flex items-center justify-center pointer-events-none" title={`Armor: ${armor}`}>
    <img src="/icons/gothic_armor.webp" alt="ARM" className="absolute inset-0 w-full h-full object-cover rounded-md border border-zinc-700/50 shadow-md" />
    <span 
      className="relative text-[#38bdf8] text-[12px] font-black font-mono leading-none select-none z-10" 
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
    transition={{ duration: 0.35 }}
    className="absolute inset-0 z-35 flex items-center justify-center pointer-events-none rounded-xl overflow-hidden bg-slate-300/30"
  >
    <div className="w-12 h-12 rounded-full border-4 border-slate-200 shadow-[0_0_20px_rgba(241,245,249,1)] animate-ping" />
  </motion.div>
);

const ArmorBreakOverlay: React.FC = () => (
  <motion.div
    initial={{ opacity: 1, scale: 0.9 }}
    animate={{ opacity: 0, scale: 1.3 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
    className="absolute inset-0 z-35 flex items-center justify-center pointer-events-none rounded-xl overflow-hidden bg-cyan-950/40 border-2 border-cyan-400 shadow-[0_0_20px_rgba(56,189,248,0.8)]"
  >
    <div className="w-10 h-10 rounded-full border-2 border-dashed border-cyan-300 shadow-[0_0_18px_rgba(56,189,248,1)] animate-ping" />
  </motion.div>
);

export const MobileBattleArena: React.FC<MobileBattleArenaProps> = ({ 
  stage, 
  onExitBattle, 
  battleType = 'campaign' 
}) => {
  const { profile, submitBattleResult } = useGame();
  const toast = useToast();

  // Equipment calculation
  const equippedList = Object.values(profile?.equipped || {})
    .map(eqId => profile?.equipment?.find(e => e.id === eqId))
    .filter(Boolean) as Equipment[];

  const setBonusResults = calculateEquipmentSetBonuses(equippedList);
  const demiurgeBonus = setBonusResults.find(s => s.setId === 'demiurge');

  const getEquipmentBonus = (bonusType: string) => {
    let bonus = 0;
    equippedList.forEach(eq => {
      if (eq.bonusType === bonusType) bonus += eq.bonusValue;
      if (eq.secondaryBonusType === bonusType) bonus += (eq.secondaryBonusValue || 0);
    });
    if (demiurgeBonus) {
      if (bonusType === 'maxHealth') bonus += demiurgeBonus.totalBonuses.maxHealth || 0;
      if (bonusType === 'dodge') bonus += demiurgeBonus.totalBonuses.dodge || 0;
      if (bonusType === 'delayReduction') bonus += demiurgeBonus.totalBonuses.delayReduction || 0;
    }
    return bonus;
  };

  const startingPlayerMana = 1 + (demiurgeBonus?.totalBonuses.startingMana || 0);
  const playerCreatureBuff = {
    atk: demiurgeBonus?.totalBonuses.creatureAtkBuff || 0,
    hp: demiurgeBonus?.totalBonuses.creatureHpBuff || 0,
  };

  // Enemy bonuses
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
      if (bonusType === 'maxHealth') bonus += enemyDemiurgeBonus.totalBonuses.maxHealth || 0;
      if (bonusType === 'dodge') bonus += enemyDemiurgeBonus.totalBonuses.dodge || 0;
      if (bonusType === 'delayReduction') bonus += enemyDemiurgeBonus.totalBonuses.delayReduction || 0;
    }
    return bonus;
  };

  const enemyHeroMaxHealth = stage.enemyHeroHealth > 0 
    ? stage.enemyHeroHealth 
    : (30 + ((stage.enemyLevel || 1) - 1) * 2 + getEnemyEquipmentBonus('maxHealth'));
  const enemyDodgeChance = stage.enemyDodgeChance !== undefined ? stage.enemyDodgeChance : getEnemyEquipmentBonus('dodge');
  const enemyDelayReduction = stage.enemyDelayReduction !== undefined ? stage.enemyDelayReduction : getEnemyEquipmentBonus('delayReduction');
  const enemyStartingMana = stage.enemyStartingMana !== undefined ? stage.enemyStartingMana : (1 + (enemyDemiurgeBonus?.totalBonuses.startingMana || 0));
  const enemyCreatureBuff = stage.enemyCreatureBuff || {
    atk: enemyDemiurgeBonus?.totalBonuses.creatureAtkBuff || 0,
    hp: enemyDemiurgeBonus?.totalBonuses.creatureHpBuff || 0
  };

  // Battle State Initialization
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

  const [visualState, setVisualState] = useState<BattleState>(battle);
  const [selectedHandCardId, setSelectedHandCardId] = useState<string | null>(null);
  const [inspectCardData, setInspectCardData] = useState<any | null>(null);

  // Simulation & playback state
  const [isSimulating, setIsSimulating] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animateSequence, setAnimateSequence] = useState<any[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const effectiveSpeed = speedMultiplier === 1 ? 1.0 : (speedMultiplier === 2 ? 1.55 : 2.15);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [activeLogStepText, setActiveLogStepText] = useState<string>('');

  // Combat animation action states
  const [attackerAction, setAttackerAction] = useState<{
    side: 'player' | 'enemy';
    slot: number;
    targetSlot: number;
    isDirect?: boolean;
  } | null>(null);

  const [defenderAction, setDefenderAction] = useState<{
    side: 'player' | 'enemy';
    slot: number;
    type: 'hit' | 'heal' | 'death' | 'dodge';
  } | null>(null);

  const [barrierShatterSlot, setBarrierShatterSlot] = useState<{ side: 'player' | 'enemy'; slot: number } | null>(null);
  const [armorSparkSlot, setArmorSparkSlot] = useState<{ side: 'player' | 'enemy'; slot: number } | null>(null);
  const [armorBreakSlot, setArmorBreakSlot] = useState<{ side: 'player' | 'enemy'; slot: number } | null>(null);

  const [activeSkillVfx, setActiveSkillVfx] = useState<{
    type: 'plague' | 'void_strike' | 'blood_aura' | 'warlord_cry' | 'hex' | 'sacrifice';
    side: 'player' | 'enemy';
    slot: number;
  } | null>(null);

  const [summoningCard, setSummoningCard] = useState<{ side: 'player' | 'enemy'; slot: number } | null>(null);

  const [plagueAction, setPlagueAction] = useState<{
    sourceSide: 'player' | 'enemy';
    sourceSlot: number;
    targetSide: 'player' | 'enemy';
    targetSlot: number;
  } | null>(null);

  const [floatingTexts, setFloatingTexts] = useState<FloatingTextEffect[]>([]);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showLogDrawer, setShowLogDrawer] = useState<boolean>(false);
  const [finalBattleState, setFinalBattleState] = useState<BattleState | null>(null);
  const battleResultSubmittedRef = useRef<boolean>(false);

  // Rewards calculation
  const isSubActive = profile?.subscriptionExpiresAt && Number(profile.subscriptionExpiresAt) > Date.now();
  const subTier = isSubActive ? (profile?.subscriptionTier || 'free') : 'free';
  const subGoldBonusPercent = subTier === 'ultra' ? 50 : subTier === 'premium' ? 25 : 0;
  const equipGoldBonus = getEquipmentBonus('goldBonus');
  const battleGoldMultiplier = 1 + (subGoldBonusPercent / 100) + (equipGoldBonus / 100);

  const applyRewardMultiplier = (baseVal: number, mult: number) => {
    if (mult <= 1 || baseVal <= 0) return Math.round(baseVal);
    return baseVal + Math.max(1, Math.round(baseVal * (mult - 1)));
  };

  const initialBaseGold = stage.goldReward || 50;
  const [earnedGold, setEarnedGold] = useState<number>(() => applyRewardMultiplier(initialBaseGold, battleGoldMultiplier));
  const [earnedDust, setEarnedDust] = useState<number>(() => stage.dustReward || 25);
  const initialBaseExp = battleType === 'pvp' ? 100 : ((stage.id || 1) * 16 + 32);
  const [earnedExp, setEarnedExp] = useState<number>(() => initialBaseExp);
  const [earnedSovereigns, setEarnedSovereigns] = useState<number>(0);

  // Sync visual state when idle
  useEffect(() => {
    if (!isAnimating) {
      setVisualState(battle);
    }
  }, [battle, isAnimating]);

  const addFloatingText = (
    text: string, 
    target: 'player-hero' | 'enemy-hero' | { side: 'player' | 'enemy'; slot: number }, 
    colorClass: string
  ) => {
    const id = `fl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const lifespan = Math.max(300, Math.round(650 / speedMultiplier));
    setFloatingTexts(prev => [...prev, { id, text, target, colorClass }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(f => f.id !== id));
    }, lifespan);
  };

  // Setup visual state before playing steps
  const setupPlaybackState = (steps: any[]) => {
    const playState = cloneBattleState(battle);
    for (let i = 0; i < 5; i++) {
      const pCard = playState.playerBoard[i];
      const eCard = playState.enemyBoard[i];
      if (pCard && pCard.delay > 0) pCard.delay = Math.max(0, pCard.delay - 1);
      if (eCard && eCard.delay > 0) eCard.delay = Math.max(0, eCard.delay - 1);
    }
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

    const strikeDuration = Math.round(680 / effectiveSpeed);
    const impactDelay = Math.round(310 / effectiveSpeed);
    let stepDuration = Math.round(820 / effectiveSpeed);

    if (step.type === 'enemy_play') stepDuration = Math.round(720 / effectiveSpeed);
    else if (step.type === 'hero_skill') stepDuration = Math.round(680 / effectiveSpeed);
    else if (step.type === 'plague') stepDuration = Math.round(820 / effectiveSpeed);
    else if (step.type === 'death') stepDuration = Math.round(380 / effectiveSpeed);

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    switch (step.type) {
      case 'sacrifice': {
        const placingCard = visualState.playerBoard[step.slot];
        const sacrCard = visualState.playerBoard[step.targetSlot];
        stepDescription = `💀 Sacrifice: ${placingCard?.name || 'Creature'} destroys ${sacrCard?.name || 'Ally'}!`;
        
        setActiveSkillVfx({ type: 'sacrifice', side: 'player', slot: step.targetSlot });
        const tVfx = setTimeout(() => setActiveSkillVfx(null), Math.round(650 / effectiveSpeed));
        timeouts.push(tVfx);

        addFloatingText('💀 SACRIFICE', { side: 'player', slot: step.targetSlot }, 'text-red-500 font-black text-xs');
        addFloatingText(`+${step.healAmount} HP 💚`, 'player-hero', 'text-emerald-400 font-black text-xs');
        addFloatingText(`+${step.buffAttack}⚔️ +${step.buffHealth}❤️`, { side: 'player', slot: step.slot }, 'text-yellow-400 font-black text-xs');

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
        }, Math.round(350 / effectiveSpeed));
        timeouts.push(tSacr);
        break;
      }

      case 'enemy_play': {
        stepDescription = `😈 Dark Summon: Enemy summons ${step.card.name}`;
        setSummoningCard({ side: 'enemy', slot: step.slot });
        const tSum = setTimeout(() => setSummoningCard(null), Math.round(650 / effectiveSpeed));
        timeouts.push(tSum);

        addFloatingText('SUMMON', { side: 'enemy', slot: step.slot }, 'text-[#ebd09b] font-black text-xs tracking-wider');

        setVisualState(prev => {
          const copy = cloneBattleState(prev);
          copy.enemyBoard[step.slot] = {
            ...step.card,
            skills: step.card.skills ? step.card.skills.map((s: any) => ({ ...s })) : []
          };
          if (copy.enemyHand.length > 0) copy.enemyHand.shift();
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

        stepDescription = `🗡️ Duel: ${attackerCard?.name || 'Creature'} deals -${step.damage} damage to ${defenderCard?.name || 'Opponent'}`;
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
            addFloatingText('✨ BARRIER BLOCKED!', { side: defSide, slot: step.targetSlot }, 'text-amber-300 font-black text-xs');
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
              addFloatingText('💥 ARMOR BROKEN!', { side: defSide, slot: step.targetSlot }, 'text-red-400 font-black text-xs');
            }
            if (step.damage > 0) {
              addFloatingText(`-${step.damage}`, { side: defSide, slot: step.targetSlot }, 'text-red-500 font-black text-sm');
            }
          }

          if (step.vampireHeal > 0) {
            addFloatingText(`+${step.vampireHeal} 🩸`, { side: step.attacker, slot: step.slot }, 'text-emerald-400 font-black text-xs');
          }

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

            return { ...prev, playerBoard: nextPlayerBoard, enemyBoard: nextEnemyBoard };
          });
        }, impactDelay);
        timeouts.push(tHit);
        break;
      }

      case 'direct_attack': {
        const attackerCard = step.attacker === 'player' ? visualState.playerBoard[step.slot] : visualState.enemyBoard[step.slot];
        stepDescription = `💥 Direct Strike: ${attackerCard?.name || 'Creature'} deals -${step.damage} directly to Lord!`;
        setAttackerAction({ side: step.attacker, slot: step.slot, targetSlot: -1, isDirect: true });

        const tHit = setTimeout(() => {
          const targetHeroSide = step.attacker === 'player' ? 'enemy' : 'player';
          const targetHeroLabel = step.attacker === 'player' ? 'enemy-hero' : 'player-hero';

          setDefenderAction({ side: targetHeroSide, slot: -1, type: 'hit' });
          addFloatingText(`💥 -${step.damage}`, targetHeroLabel, 'text-red-500 font-black text-sm');

          setVisualState(prev => {
            if (step.attacker === 'player') {
              const newEnemyHealth = step.enemyHeroHealth !== undefined ? step.enemyHeroHealth : Math.max(0, prev.enemyHeroHealth - step.damage);
              return { ...prev, enemyHeroHealth: newEnemyHealth };
            } else {
              const newPlayerHealth = step.playerHeroHealth !== undefined ? step.playerHeroHealth : Math.max(0, prev.playerHeroHealth - step.damage);
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
        const targetSide = isPlayerCaster ? (step.stance === 'void_strike' ? 'enemy' : 'player') : (step.stance === 'void_strike' ? 'player' : 'enemy');
        const targetHeroLabel = isPlayerCaster ? 'enemy-hero' : 'player-hero';

        if (step.stance === 'void_strike') {
          stepDescription = `⚡ Void Strike: Lord unleashes -${step.damage} pure energy!`;
          if (step.targetSlot !== undefined && step.targetSlot >= 0) {
            setActiveSkillVfx({ type: 'void_strike', side: targetSide, slot: step.targetSlot });
            const tVfx = setTimeout(() => setActiveSkillVfx(null), Math.round(650 / effectiveSpeed));
            timeouts.push(tVfx);
          }

          const tHit = setTimeout(() => {
            if (step.targetSlot === -1 || step.targetSlot === undefined) {
              setDefenderAction({ side: targetSide, slot: -1, type: 'hit' });
              addFloatingText(`⚡ -${step.damage}`, targetHeroLabel, 'text-cyan-400 font-black text-sm');
              setVisualState(prev => {
                const copy = cloneBattleState(prev);
                if (targetSide === 'player') copy.playerHeroHealth = Math.max(0, copy.playerHeroHealth - step.damage);
                else copy.enemyHeroHealth = Math.max(0, copy.enemyHeroHealth - step.damage);
                return copy;
              });
            } else {
              setDefenderAction({ side: targetSide, slot: step.targetSlot, type: 'hit' });
              addFloatingText(`⚡ -${step.damage}`, { side: targetSide, slot: step.targetSlot }, 'text-cyan-400 font-black text-xs');
              setVisualState(prev => {
                const copy = cloneBattleState(prev);
                const target = targetSide === 'player' ? copy.playerBoard[step.targetSlot] : copy.enemyBoard[step.targetSlot];
                if (target) {
                  if (step.targetHealth !== undefined) target.health = Math.max(0, step.targetHealth);
                  else target.health = Math.max(0, target.health - step.damage);
                }
                return copy;
              });
            }
          }, impactDelay);
          timeouts.push(tHit);
        } else if (step.stance === 'blood_aura') {
          stepDescription = `🩸 Blood Aura: Restores +${step.heal} HP!`;
          if (step.targetSlot !== undefined && step.targetSlot >= 0) {
            setActiveSkillVfx({ type: 'blood_aura', side: targetSide, slot: step.targetSlot });
            const tVfx = setTimeout(() => setActiveSkillVfx(null), Math.round(650 / effectiveSpeed));
            timeouts.push(tVfx);
          }

          if (step.targetSlot === -1 || step.targetSlot === undefined) {
            setDefenderAction({ side: targetSide, slot: -1, type: 'heal' });
            addFloatingText(`🩸 +${step.heal}`, targetHeroLabel, 'text-emerald-400 font-black text-xs');
            setVisualState(prev => {
              const copy = cloneBattleState(prev);
              if (targetSide === 'player') copy.playerHeroHealth = Math.min(copy.playerHeroMaxHealth, copy.playerHeroHealth + step.heal);
              else copy.enemyHeroHealth = Math.min(copy.enemyHeroMaxHealth, copy.enemyHeroHealth + step.heal);
              return copy;
            });
          } else {
            setDefenderAction({ side: targetSide, slot: step.targetSlot, type: 'heal' });
            addFloatingText(`🩸 +${step.heal}`, { side: targetSide, slot: step.targetSlot }, 'text-emerald-400 font-black text-xs');
            setVisualState(prev => {
              const copy = cloneBattleState(prev);
              const target = targetSide === 'player' ? copy.playerBoard[step.targetSlot] : copy.enemyBoard[step.targetSlot];
              if (target) {
                if (step.targetHealth !== undefined) target.health = Math.min(target.maxHealth, target.health + step.heal);
              }
              return copy;
            });
          }
        }
        break;
      }

      case 'hero_heal': {
        const side = step.side || 'player';
        stepDescription = `💚 Restoration: Lord recovers +${step.heal} HP!`;
        addFloatingText(`+${step.heal} HP`, side === 'player' ? 'player-hero' : 'enemy-hero', 'text-emerald-400 font-black text-xs');
        setVisualState(prev => {
          const copy = cloneBattleState(prev);
          if (side === 'player') copy.playerHeroHealth = Math.min(copy.playerHeroMaxHealth, copy.playerHeroHealth + step.heal);
          else copy.enemyHeroHealth = Math.min(copy.enemyHeroMaxHealth, copy.enemyHeroHealth + step.heal);
          return copy;
        });
        break;
      }

      case 'warlord_cry': {
        stepDescription = `📣 Warlord Warcry: Squad empowered (+${step.buffAtk} ATK / +${step.buffHp} HP)!`;
        addFloatingText('WARCRY! ⚔️', step.side === 'player' ? 'player-hero' : 'enemy-hero', 'text-yellow-400 font-black text-xs');
        break;
      }

      case 'plague': {
        const defSide = step.sourceSide === 'player' ? 'enemy' : 'player';
        stepDescription = `🦠 Plague Affliction: Poison strikes target slot (-${step.damage} HP)`;
        
        setPlagueAction({
          sourceSide: step.sourceSide,
          sourceSlot: step.sourceSlot,
          targetSide: defSide,
          targetSlot: step.targetSlot
        });
        const tPlagueClear = setTimeout(() => setPlagueAction(null), Math.round(650 / effectiveSpeed));
        timeouts.push(tPlagueClear);

        setActiveSkillVfx({ type: 'plague', side: defSide, slot: step.targetSlot });
        const tVfx = setTimeout(() => setActiveSkillVfx(null), Math.round(650 / effectiveSpeed));
        timeouts.push(tVfx);

        addFloatingText('🦠 PLAGUE', { side: defSide, slot: step.targetSlot }, 'text-emerald-400 font-black text-xs');
        
        const tHit = setTimeout(() => {
          setDefenderAction({ side: defSide, slot: step.targetSlot, type: 'hit' });
          setVisualState(prev => {
            const copy = cloneBattleState(prev);
            const target = step.sourceSide === 'player' ? copy.enemyBoard[step.targetSlot] : copy.playerBoard[step.targetSlot];
            if (target) {
              if (step.targetHealth !== undefined) target.health = Math.max(0, step.targetHealth);
              else target.health = Math.max(0, target.health - step.damage);
            }
            return copy;
          });
        }, impactDelay);
        timeouts.push(tHit);
        break;
      }

      case 'dodge': {
        const isEnemy = step.side === 'enemy';
        stepDescription = `🛡️ Dodge Evasion: ${isEnemy ? 'Enemy Lord' : 'Your Lord'} evaded the strike!`;
        addFloatingText('DODGE! 🛡️', isEnemy ? 'enemy-hero' : 'player-hero', 'text-cyan-300 font-black text-xs');
        break;
      }

      case 'death': {
        stepDescription = '☠️ Defeat: Creature perished in combat!';
        setDefenderAction({ side: step.side, slot: step.slot, type: 'death' });
        addFloatingText('💀 DEAD', { side: step.side, slot: step.slot }, 'text-zinc-500 font-bold text-[9px]');
        const tDeath = setTimeout(() => {
          setVisualState(prev => {
            const copy = cloneBattleState(prev);
            if (step.side === 'player') copy.playerBoard[step.slot] = null;
            else copy.enemyBoard[step.slot] = null;
            return copy;
          });
        }, Math.round(220 / effectiveSpeed));
        timeouts.push(tDeath);
        break;
      }
    }

    setActiveLogStepText(stepDescription);

    const tClearHit = setTimeout(() => setDefenderAction(null), impactDelay + Math.round(280 / effectiveSpeed));
    timeouts.push(tClearHit);

    const tClearStrike = setTimeout(() => setAttackerAction(null), strikeDuration);
    timeouts.push(tClearStrike);

    const stepTimer = setTimeout(() => {
      setAttackerAction(null);
      setDefenderAction(null);
      setCurrentStepIndex(prev => prev + 1);
    }, stepDuration);
    timeouts.push(stepTimer);

    return () => timeouts.forEach(t => clearTimeout(t));
  }, [currentStepIndex, animateSequence, isPaused, speedMultiplier]);

  // Handle sequence completion
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
      setIsAnimating(false);
      setIsSimulating(false);
      setCurrentStepIndex(-1);
      setAttackerAction(null);
      setDefenderAction(null);
      setActiveSkillVfx(null);
      setPlagueAction(null);
    }
  }, [currentStepIndex, animateSequence, finalBattleState]);

  // Handle Play Card
  const handlePlayCard = (slotIndex: number) => {
    if (!selectedHandCardId || isSimulating || isAnimating) return;
    const card = visualState.playerHand.find(c => c.id === selectedHandCardId);
    if (!card) return;

    if (visualState.playerMana < (card.manaCost || 1)) {
      toast('Not enough Mana to summon this creature!', 'error');
      return;
    }

    setIsSimulating(true);
    setSelectedHandCardId(null);

    const { nextState, animateSequence: steps } = simulateCombatTurn(
      battle,
      selectedHandCardId,
      slotIndex,
      profile,
      stage
    );

    setFinalBattleState(nextState);
    setupPlaybackState(steps);
  };

  // Handle End Turn without playing card
  const handleEndTurnWithoutCard = () => {
    if (isSimulating || isAnimating) return;
    setIsSimulating(true);
    setSelectedHandCardId(null);

    const { nextState, animateSequence: steps } = simulateCombatTurn(
      battle,
      null,
      null,
      profile,
      stage
    );

    setFinalBattleState(nextState);
    setupPlaybackState(steps);
  };

  // Victory Handler
  const handleBattleWon = async () => {
    if (battleResultSubmittedRef.current) return;
    battleResultSubmittedRef.current = true;

    if (battleType === 'pvp') {
      const res = await submitBattleResult('pvp', 'pvp', 'win');
      if (res.success) {
        if (res.rewards?.gold !== undefined) setEarnedGold(res.rewards.gold);
        else if (res.goldReward !== undefined) setEarnedGold(res.goldReward);
        if (res.rewards?.dust !== undefined) setEarnedDust(res.rewards.dust);
        else if (res.dustReward !== undefined) setEarnedDust(res.dustReward);
        if (res.rewards?.exp !== undefined) setEarnedExp(res.rewards.exp);
        else if (res.expReward !== undefined) setEarnedExp(res.expReward);
        if (res.rewards?.sovereigns !== undefined) setEarnedSovereigns(res.rewards.sovereigns);
        else if (res.sovereignsReward !== undefined) setEarnedSovereigns(res.sovereignsReward);
      }
      return;
    }

    let stars = 1;
    const hpPct = battle.playerHeroHealth / battle.playerHeroMaxHealth;
    if (hpPct === 1) stars = 3;
    else if (hpPct >= 0.5) stars = 2;

    const res = await submitBattleResult(battleType, stage.id.toString(), 'win', stars);
    if (res.success) {
      if (res.rewards?.gold !== undefined) setEarnedGold(res.rewards.gold);
      else if (res.goldReward !== undefined) setEarnedGold(res.goldReward);
      if (res.rewards?.dust !== undefined) setEarnedDust(res.rewards.dust);
      else if (res.dustReward !== undefined) setEarnedDust(res.dustReward);
      if (res.rewards?.exp !== undefined) setEarnedExp(res.rewards.exp);
      else if (res.expReward !== undefined) setEarnedExp(res.expReward);
    }
  };

  // Defeat Handler
  const handleBattleLost = async () => {
    if (battleResultSubmittedRef.current) return;
    battleResultSubmittedRef.current = true;
    await submitBattleResult(battleType, stage.id.toString(), 'loss');
  };

  const selectedHandCard = visualState.playerHand.find(c => c.id === selectedHandCardId);

  return (
    <div className="flex flex-col h-full w-full bg-[#07090e] text-white select-none overflow-hidden font-sans relative">
      
      {/* =========================================================================
          1. TOP APP BAR (Stage Name, Surrender, Codex)
         ========================================================================= */}
      <header className="h-10 px-3 flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-[#0b0f17] via-[#121927] to-[#0b0f17] shrink-0 z-30">
        <button
          onClick={() => onExitBattle(false)}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-red-950/70 hover:bg-red-900 border border-red-500/40 rounded-lg text-red-200 text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Surrender</span>
        </button>

        <div className="flex flex-col items-center">
          <span className="font-display font-black text-xs text-[#ebd09b] tracking-wider uppercase drop-shadow">
            {battleType === 'pvp' ? 'PvP Duel Arena' : `Stage ${stage.id}: ${stage.name}`}
          </span>
          <span className="text-[9px] font-mono text-zinc-400">
            Abyssal Spire • Vertical Mode
          </span>
        </div>

        <button
          onClick={() => setShowHelpModal(true)}
          className="p-1.5 rounded-lg bg-black/60 border border-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer"
          title="Battle Codex"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </header>

      {/* =========================================================================
          2. ENEMY COMMANDER HEADER HUD (Portrait, HP, Mana)
         ========================================================================= */}
      <div className="px-3 py-1.5 bg-gradient-to-b from-[#180a0a]/90 to-transparent border-b border-red-950/40 flex items-center justify-between shrink-0 relative">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-9 h-9 rounded-xl overflow-hidden border-2 border-red-500/70 shadow-md relative shrink-0 ${
            defenderAction?.side === 'enemy' && defenderAction?.slot === -1 ? 'anim-hero-recoil' : ''
          }`}>
            <img 
              src={stage.enemyAvatar || '/avatars/avatar_default.webp'} 
              alt={stage.enemyName || 'Enemy Lord'} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-xs text-red-300 truncate">
                {stage.enemyName || 'Abyssal Overlord'}
              </span>
              <span className="text-[9px] font-mono px-1 rounded bg-red-950 border border-red-800/80 text-red-400 font-bold">
                Lvl {stage.enemyLevel || 1}
              </span>
            </div>

            {/* Health Bar */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-24 h-2 bg-zinc-900 rounded-full overflow-hidden border border-red-950">
                <div 
                  className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300"
                  style={{ width: `${Math.max(0, Math.min(100, (visualState.enemyHeroHealth / visualState.enemyHeroMaxHealth) * 100))}%` }}
                />
              </div>
              <span className="text-[10px] font-mono font-black text-red-300">
                {visualState.enemyHeroHealth} / {visualState.enemyHeroMaxHealth}
              </span>
            </div>
          </div>
        </div>

        {/* Floating text on enemy hero */}
        <div className="absolute top-2 left-1/3 pointer-events-none flex flex-col items-center z-40">
          {floatingTexts.filter(f => f.target === 'enemy-hero').map(f => (
            <span key={f.id} className={`${f.colorClass} animate-bounce font-black`}>
              {f.text}
            </span>
          ))}
        </div>

        {/* Enemy Mana */}
        <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded-lg border border-red-500/30">
          <span className="text-[9px]">💎</span>
          <span className="text-xs font-mono font-black text-cyan-300">
            {visualState.enemyMana} / {visualState.enemyMaxMana}
          </span>
        </div>
      </div>

      {/* =========================================================================
          3. ARENA PLAYFIELD (5 VS 5 BOARD + CENTRAL CLASH BAR)
         ========================================================================= */}
      <main className="flex-1 flex flex-col justify-between p-2 overflow-hidden relative min-h-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(235,208,155,0.04)_0%,transparent_70%)] pointer-events-none" />

        {/* ROW 1: ENEMY SQUAD (5 SLOTS) */}
        <div>
          <div className="flex items-center justify-between px-1 mb-1 text-[8.5px] font-mono text-zinc-500 uppercase tracking-wider">
            <span>ENEMY SQUAD (5 SLOTS)</span>
            <span className="text-red-400/90 font-mono">
              HAND: {visualState.enemyHand.length} | DECK: {visualState.enemyDeckSize || visualState.enemyHand.length}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5 w-full relative" id="enemy-board">
            {visualState.enemyBoard.map((card, idx) => {
              const isActing = attackerAction?.side === 'enemy' && attackerAction?.slot === idx;
              const isTargeted = attackerAction?.side === 'player' && (attackerAction.isDirect ? false : attackerAction.targetSlot === idx);
              const isHit = defenderAction?.side === 'enemy' && defenderAction?.slot === idx && defenderAction?.type === 'hit';
              const isDeath = defenderAction?.side === 'enemy' && defenderAction?.slot === idx && defenderAction?.type === 'death';
              const isHeal = defenderAction?.side === 'enemy' && defenderAction?.slot === idx && defenderAction?.type === 'heal';
              const isSummoning = summoningCard?.side === 'enemy' && summoningCard?.slot === idx;
              const isPlagueCasting = plagueAction?.sourceSide === 'enemy' && plagueAction?.sourceSlot === idx;
              const isPlagueTargeted = plagueAction?.targetSide === 'enemy' && plagueAction?.targetSlot === idx;

              const strikeX = isActing && attackerAction ? (attackerAction.isDirect ? 0 : (attackerAction.targetSlot - idx) * 55) : 0;
              const strikeY = isActing ? (attackerAction?.isDirect ? 60 : 50) : 0;

              const borderGlowClass = isHit 
                ? "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.95)] ring-2 ring-red-500" 
                : isPlagueCasting
                  ? "border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.95)] ring-2 ring-emerald-400/80"
                  : isPlagueTargeted
                    ? "border-lime-500 shadow-[0_0_20px_rgba(132,204,22,0.9)] ring-2 ring-lime-500/80"
                    : isActing 
                      ? "border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.9)] ring-2 ring-amber-400/80"
                      : isTargeted
                        ? "border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.85)] ring-2 ring-rose-500/80"
                        : isSummoning
                          ? "border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.85)] ring-2 ring-purple-400/80"
                          : card && card.delay === 0 
                            ? "shadow-[0_0_12px_rgba(220,38,64,0.4)]" 
                            : "shadow-[0_2px_8px_rgba(0,0,0,0.4)]";

              return (
                <div
                  key={`enemy-slot-${idx}`}
                  onClick={() => { if (card) setInspectCardData(card); }}
                  style={{
                    '--strike-x': `${strikeX}px`,
                    '--strike-y': `${strikeY}px`,
                    '--strike-rot': `${strikeX > 0 ? 5 : strikeX < 0 ? -5 : 2}deg`,
                    '--anim-duration': `${Math.max(0.25, 0.68 / effectiveSpeed)}s`,
                    '--recoil-duration': `${Math.max(0.18, 0.32 / effectiveSpeed)}s`,
                  } as React.CSSProperties}
                  className={`relative h-[104px] sm:h-[110px] rounded-xl border flex flex-col justify-between p-1 select-none overflow-visible transition-all cursor-pointer ${
                    card 
                      ? `${getTierBorderColor(card.tier)} bg-[#151a21]` 
                      : 'border-dashed border-red-950/50 bg-black/30'
                  } ${borderGlowClass} ${
                    isActing
                      ? 'anim-card-strike-enemy'
                      : isHit
                        ? 'anim-card-recoil'
                        : isPlagueCasting
                          ? 'anim-plague-channel'
                          : ''
                  } ${isDeath ? 'opacity-20 scale-90' : ''}`}
                >
                  {/* Floating texts */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-none z-30 flex flex-col items-center">
                    {floatingTexts.filter(f => typeof f.target === 'object' && f.target.side === 'enemy' && f.target.slot === idx).map(f => (
                      <span key={f.id} className={`${f.colorClass} animate-bounce font-black whitespace-nowrap text-xs`}>
                        {f.text}
                      </span>
                    ))}
                  </div>

                  {card ? (
                    <>
                      {/* Card Background Art */}
                      <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none z-0">
                        <img 
                          src={card.image} 
                          alt={card.name} 
                          className={`w-full h-full object-cover ${card.delay > 0 ? 'opacity-40 filter saturate-50' : 'opacity-85'}`}
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                        {/* AUTHENTIC PC DELAY OVERLAY: ONLY SHOWN WHEN card.delay > 0 */}
                        {card.delay > 0 && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-15">
                            <div className="flex flex-col items-center justify-center relative">
                              <img 
                                src="/icons/gothic_hourglass.webp" 
                                alt="Locked" 
                                className="w-8 h-8 object-contain rounded-full border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.5)] animate-pulse" 
                              />
                              <div className="absolute -bottom-2 bg-gradient-to-b from-[#180f2b] to-[#0c051a] border border-[#a855f7]/60 rounded-full w-4.5 h-4.5 flex items-center justify-center shadow-lg">
                                <span className="text-[#c084fc] text-[9px] font-black font-mono leading-none">{card.delay}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Top Row: Tier and Level */}
                      <div className="flex justify-between items-center z-10 relative">
                        <span className={`text-[8px] font-mono font-black uppercase ${getTierTextColor(card.tier)}`}>
                          {card.tier ? card.tier.substring(0, 3) : 'BRZ'}
                        </span>
                        <span className="text-[7.5px] font-mono font-bold text-gray-400">
                          Lvl {card.level || 1}
                        </span>
                      </div>

                      {/* Card Name */}
                      <div className="z-10 relative bg-black/60 py-0.5 px-0.5 rounded border border-white/5 text-center mt-0.5">
                        <span className="text-[8.5px] font-display font-black text-white block truncate leading-none">
                          {card.name}
                        </span>
                      </div>

                      {/* Dedicated Skills Bar at Bottom Center */}
                      <div className="z-10 relative flex justify-center gap-1 mt-auto mb-1">
                        {card.skills && card.skills.length > 0 ? (
                          card.skills.map((s, sIdx) => (
                            <div 
                              key={sIdx}
                              className={`flex items-center gap-0.5 text-[7.5px] font-mono font-black px-1 rounded-full border ${getSkillBadgeStyle(s.type)}`}
                            >
                              <span>{renderSkillIcon(s.type, "w-2.5 h-2.5")}</span>
                              <span className="leading-none">{s.value}</span>
                            </div>
                          ))
                        ) : null}
                      </div>

                      {/* Overlays: Barrier Dome, Armor Badge, Break Effects */}
                      {card.barrier && <BarrierDome />}
                      {barrierShatterSlot?.side === 'enemy' && barrierShatterSlot?.slot === idx && <BarrierShatterOverlay />}
                      {card.armor > 0 && <ArmorBadge armor={card.armor} />}
                      {armorSparkSlot?.side === 'enemy' && armorSparkSlot?.slot === idx && <ArmorSparkOverlay />}
                      {armorBreakSlot?.side === 'enemy' && armorBreakSlot?.slot === idx && <ArmorBreakOverlay />}

                      {/* Active Skill VFX */}
                      {activeSkillVfx?.side === 'enemy' && activeSkillVfx?.slot === idx && (
                        <div className="absolute inset-0 bg-black/60 rounded-xl z-35 flex flex-col items-center justify-center pointer-events-none border-2 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.8)] overflow-hidden">
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
                          <span className="relative text-[8px] font-mono font-black tracking-widest uppercase bg-black/80 px-1.5 py-0.5 rounded border text-purple-300 z-10">
                            {activeSkillVfx.type.toUpperCase()}
                          </span>
                        </div>
                      )}

                      {/* Bottom Badges: Gothic Attack & Health */}
                      <div className="absolute -bottom-2 -left-2 w-7 h-7 z-20 flex items-center justify-center pointer-events-none">
                        <img src="/icons/gothic_attack.webp" alt="ATK" className="absolute inset-0 w-full h-full object-cover rounded shadow" />
                        <span 
                          className="relative text-[#ff3b30] text-xs font-black font-mono leading-none z-10"
                          style={{ textShadow: '2px 2px 2px #000, -2px -2px 2px #000, 2px -2px 2px #000, -2px 2px 2px #000, 0 0 5px #000' }}
                        >
                          {card.attack}
                        </span>
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-7 h-7 z-20 flex items-center justify-center pointer-events-none">
                        <img src="/icons/gothic_health.webp" alt="HP" className="absolute inset-0 w-full h-full object-cover rounded shadow" />
                        <span 
                          className="relative text-white text-xs font-black font-mono leading-none z-10"
                          style={{ textShadow: '2px 2px 2px #000, -2px -2px 2px #000, 2px -2px 2px #000, -2px 2px 2px #000, 0 0 5px #000' }}
                        >
                          {card.health}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-700 font-mono text-[9px]">
                      <span>#{idx + 1}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Projectile Beam Overlay during Combat Strikes */}
        {isAnimating && attackerAction !== null && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-30">
            <defs>
              <linearGradient id="strikeBeamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff4500" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.5" />
              </linearGradient>
            </defs>
            {(() => {
              const side = attackerAction.side;
              const slot = attackerAction.slot;
              const sX = `${20 * slot + 10}%`;
              const sY = side === 'player' ? '70%' : '30%';

              let eX = '50%';
              let eY = '50%';

              if (attackerAction.isDirect) {
                eX = '50%';
                eY = side === 'player' ? '12%' : '88%';
              } else {
                eX = `${20 * attackerAction.targetSlot + 10}%`;
                eY = side === 'player' ? '30%' : '70%';
              }

              return (
                <>
                  <line x1={sX} y1={sY} x2={eX} y2={eY} stroke="#ff4500" strokeWidth="4" strokeOpacity="0.3" strokeLinecap="round" />
                  <line x1={sX} y1={sY} x2={eX} y2={eY} stroke="url(#strikeBeamGrad)" strokeWidth="2" strokeLinecap="round" strokeDasharray="5 3" />
                  <circle cx={eX} cy={eY} r="6" fill="#ff4500" fillOpacity="0.4" />
                  <circle cx={eX} cy={eY} r="3" fill="#fef08a" />
                </>
              );
            })()}
          </svg>
        )}

        {/* Dynamic Plague Miasma Stream SVG Overlay */}
        {plagueAction !== null && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-30">
            {(() => {
              const sX = `${20 * plagueAction.sourceSlot + 10}%`;
              const sY = plagueAction.sourceSide === 'player' ? '70%' : '30%';
              const tX = `${20 * plagueAction.targetSlot + 10}%`;
              const tY = plagueAction.targetSide === 'player' ? '70%' : '30%';
              return (
                <>
                  <line x1={sX} y1={sY} x2={tX} y2={tY} stroke="#10b981" strokeWidth="6" strokeOpacity="0.35" strokeLinecap="round" />
                  <line x1={sX} y1={sY} x2={tX} y2={tY} stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 4" />
                  <circle cx={tX} cy={tY} r="5" fill="#10b981" />
                </>
              );
            })()}
          </svg>
        )}

        {/* =========================================================================
            CENTRAL GOTHIC CLASH BAR (Combat status, action log, speed buttons)
           ========================================================================= */}
        <div className="my-1 py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-black/90 via-[#18121d]/95 to-black/90 border border-[#ebd09b]/30 flex items-center justify-between shrink-0 shadow-lg relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-1 bg-amber-500" />
          
          <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
            <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/60 flex items-center justify-center text-[10px] text-amber-300 shrink-0">
              ⚔️
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-[10px] text-[#ebd09b] tracking-wide uppercase">
                  {visualState.phase === 'combat_simulation' ? 'COMBAT DUEL' : `TURN ${visualState.turn || 1}`}
                </span>
                <span className={`text-[7.5px] font-mono px-1 rounded border font-bold ${
                  visualState.phase === 'combat_simulation' 
                    ? 'bg-red-950 text-red-300 border-red-500/40' 
                    : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                }`}>
                  {visualState.phase === 'combat_simulation' ? 'FIGHTING' : 'DEPLOYMENT'}
                </span>
              </div>
              <p className="text-[9px] font-mono text-zinc-300 leading-tight truncate mt-0.5">
                {activeLogStepText || (selectedHandCardId ? `Deploy ${selectedHandCard?.name} -> Tap empty slot` : 'Select card in hand to deploy')}
              </p>
            </div>
          </div>

          {/* Speed Multiplier & Log History Controls */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setSpeedMultiplier(prev => prev === 1 ? 2 : prev === 2 ? 3 : 1)}
              className="px-1.5 py-0.5 rounded bg-black/80 border border-amber-500/40 text-[9px] font-mono font-bold text-amber-300 hover:bg-amber-950/50 cursor-pointer active:scale-95"
              title="Toggle Combat Animation Speed"
            >
              {speedMultiplier}x
            </button>
            <button
              onClick={() => setIsPaused(prev => !prev)}
              className="p-1 rounded bg-black/80 border border-white/20 text-zinc-300 hover:text-white cursor-pointer active:scale-95"
              title={isPaused ? 'Resume Combat' : 'Pause Combat'}
            >
              {isPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3" />}
            </button>
            <button
              onClick={() => setShowLogDrawer(true)}
              className="p-1 rounded bg-black/80 border border-white/20 text-zinc-300 hover:text-white cursor-pointer active:scale-95"
              title="View Combat History"
            >
              <Scroll className="w-3 h-3 text-[#ebd09b]" />
            </button>
          </div>
        </div>

        {/* ROW 2: PLAYER SQUAD (5 SLOTS) */}
        <div>
          <div className="flex items-center justify-between px-1 mb-1 text-[8.5px] font-mono text-zinc-500 uppercase tracking-wider">
            <span>YOUR SQUAD (5 SLOTS)</span>
            <span className="text-amber-400/90 font-mono">
              {selectedHandCardId ? 'TAP GLOWING SLOT TO DEPLOY' : 'DEPLOYED SQUAD'}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5 w-full relative" id="player-board">
            {visualState.playerBoard.map((card, slotIndex) => {
              const isActing = attackerAction?.side === 'player' && attackerAction?.slot === slotIndex;
              const isTargeted = attackerAction?.side === 'enemy' && (attackerAction.isDirect ? false : attackerAction.targetSlot === slotIndex);
              const isHit = defenderAction?.side === 'player' && defenderAction?.slot === slotIndex && defenderAction?.type === 'hit';
              const isDeath = defenderAction?.side === 'player' && defenderAction?.slot === slotIndex && defenderAction?.type === 'death';
              const isHeal = defenderAction?.side === 'player' && defenderAction?.slot === slotIndex && defenderAction?.type === 'heal';
              const isSummoning = summoningCard?.side === 'player' && summoningCard?.slot === slotIndex;
              const isPlagueCasting = plagueAction?.sourceSide === 'player' && plagueAction?.sourceSlot === slotIndex;
              const isPlagueTargeted = plagueAction?.targetSide === 'player' && plagueAction?.targetSlot === slotIndex;
              const canPlayHere = selectedHandCardId && card === null && !isSimulating && !isAnimating;

              const strikeX = isActing && attackerAction ? (attackerAction.isDirect ? 0 : (attackerAction.targetSlot - slotIndex) * 55) : 0;
              const strikeY = isActing ? (attackerAction?.isDirect ? -60 : -50) : 0;

              const borderGlowClass = isHit 
                ? "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.95)] ring-2 ring-red-500" 
                : isPlagueCasting
                  ? "border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.95)] ring-2 ring-emerald-400/80"
                  : isPlagueTargeted
                    ? "border-lime-500 shadow-[0_0_20px_rgba(132,204,22,0.9)] ring-2 ring-lime-500/80"
                    : isActing 
                      ? "border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.9)] ring-2 ring-amber-400/80"
                      : isTargeted
                        ? "border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.85)] ring-2 ring-rose-500/80"
                        : isSummoning
                          ? "border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.85)] ring-2 ring-purple-400/80"
                          : card && card.delay === 0 
                            ? "shadow-[0_0_12px_rgba(220,38,64,0.4)]" 
                            : "shadow-[0_2px_8px_rgba(0,0,0,0.4)]";

              return (
                <div
                  key={`player-slot-${slotIndex}`}
                  onClick={() => {
                    if (canPlayHere) {
                      handlePlayCard(slotIndex);
                    } else if (card) {
                      setInspectCardData(card);
                    }
                  }}
                  style={{
                    '--strike-x': `${strikeX}px`,
                    '--strike-y': `${strikeY}px`,
                    '--strike-rot': `${strikeX > 0 ? 5 : strikeX < 0 ? -5 : 2}deg`,
                    '--anim-duration': `${Math.max(0.25, 0.68 / effectiveSpeed)}s`,
                    '--recoil-duration': `${Math.max(0.18, 0.32 / effectiveSpeed)}s`,
                  } as React.CSSProperties}
                  className={`relative h-[104px] sm:h-[110px] rounded-xl border flex flex-col justify-between p-1 select-none overflow-visible transition-all cursor-pointer ${
                    card 
                      ? `${getTierBorderColor(card.tier)} bg-[#151a21]` 
                      : canPlayHere
                        ? 'border-[#66fcf1] bg-cyan-950/20 shadow-[0_0_15px_rgba(102,252,241,0.45)] animate-pulse ring-1 ring-[#66fcf1]'
                        : 'border-dashed border-zinc-700 bg-black/40 hover:border-amber-400/50'
                  } ${borderGlowClass} ${
                    isActing
                      ? 'anim-card-strike-player'
                      : isHit
                        ? 'anim-card-recoil'
                        : isPlagueCasting
                          ? 'anim-plague-channel'
                          : ''
                  } ${isDeath ? 'opacity-20 scale-90' : ''}`}
                >
                  {/* Floating texts on slot */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-none z-30 flex flex-col items-center">
                    {floatingTexts.filter(f => typeof f.target === 'object' && f.target.side === 'player' && f.target.slot === slotIndex).map(f => (
                      <span key={f.id} className={`${f.colorClass} animate-bounce font-black whitespace-nowrap text-xs`}>
                        {f.text}
                      </span>
                    ))}
                  </div>

                  {card ? (
                    <>
                      {/* Card Background Art */}
                      <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none z-0">
                        <img 
                          src={card.image} 
                          alt={card.name} 
                          className={`w-full h-full object-cover ${card.delay > 0 ? 'opacity-40 filter saturate-50' : 'opacity-85'}`}
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                        {/* AUTHENTIC PC DELAY OVERLAY: ONLY SHOWN WHEN card.delay > 0 */}
                        {card.delay > 0 && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-15">
                            <div className="flex flex-col items-center justify-center relative">
                              <img 
                                src="/icons/gothic_hourglass.webp" 
                                alt="Locked" 
                                className="w-8 h-8 object-contain rounded-full border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.5)] animate-pulse" 
                              />
                              <div className="absolute -bottom-2 bg-gradient-to-b from-[#180f2b] to-[#0c051a] border border-[#a855f7]/60 rounded-full w-4.5 h-4.5 flex items-center justify-center shadow-lg">
                                <span className="text-[#c084fc] text-[9px] font-black font-mono leading-none">{card.delay}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Top Row: Tier and Level */}
                      <div className="flex justify-between items-center z-10 relative">
                        <span className={`text-[8px] font-mono font-black uppercase ${getTierTextColor(card.tier)}`}>
                          {card.tier ? card.tier.substring(0, 3) : 'BRZ'}
                        </span>
                        <span className="text-[7.5px] font-mono font-bold text-gray-400">
                          Lvl {card.level || 1}
                        </span>
                      </div>

                      {/* Card Name */}
                      <div className="z-10 relative bg-black/60 py-0.5 px-0.5 rounded border border-white/5 text-center mt-0.5">
                        <span className="text-[8.5px] font-display font-black text-white block truncate leading-none">
                          {card.name}
                        </span>
                      </div>

                      {/* Dedicated Skills Bar at Bottom Center */}
                      <div className="z-10 relative flex justify-center gap-1 mt-auto mb-1">
                        {card.skills && card.skills.length > 0 ? (
                          card.skills.map((s, sIdx) => (
                            <div 
                              key={sIdx}
                              className={`flex items-center gap-0.5 text-[7.5px] font-mono font-black px-1 rounded-full border ${getSkillBadgeStyle(s.type)}`}
                            >
                              <span>{renderSkillIcon(s.type, "w-2.5 h-2.5")}</span>
                              <span className="leading-none">{s.value}</span>
                            </div>
                          ))
                        ) : null}
                      </div>

                      {/* Overlays: Barrier Dome, Armor Badge, Break Effects */}
                      {card.barrier && <BarrierDome />}
                      {barrierShatterSlot?.side === 'player' && barrierShatterSlot?.slot === slotIndex && <BarrierShatterOverlay />}
                      {card.armor > 0 && <ArmorBadge armor={card.armor} />}
                      {armorSparkSlot?.side === 'player' && armorSparkSlot?.slot === slotIndex && <ArmorSparkOverlay />}
                      {armorBreakSlot?.side === 'player' && armorBreakSlot?.slot === slotIndex && <ArmorBreakOverlay />}

                      {/* Active Skill VFX */}
                      {activeSkillVfx?.type === 'sacrifice' && activeSkillVfx?.side === 'player' && activeSkillVfx?.slot === slotIndex && (
                        <div className="absolute inset-0 bg-black/60 rounded-xl z-35 flex flex-col items-center justify-center pointer-events-none border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)] overflow-hidden">
                          <img src="/icons/sacrifice_fx.webp" className="absolute inset-0 w-full h-full object-cover opacity-90" />
                          <span className="relative text-[8px] font-mono font-black tracking-widest uppercase bg-black/80 px-1.5 py-0.5 rounded border text-red-400 z-10 animate-pulse">
                            SACRIFICED
                          </span>
                        </div>
                      )}
                      {activeSkillVfx?.type !== 'sacrifice' && activeSkillVfx?.side === 'player' && activeSkillVfx?.slot === slotIndex && (
                        <div className="absolute inset-0 bg-black/60 rounded-xl z-35 flex flex-col items-center justify-center pointer-events-none border-2 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.8)] overflow-hidden">
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
                          <span className="relative text-[8px] font-mono font-black tracking-widest uppercase bg-black/80 px-1.5 py-0.5 rounded border text-purple-300 z-10">
                            {activeSkillVfx.type.toUpperCase()}
                          </span>
                        </div>
                      )}

                      {/* Bottom Badges: Gothic Attack & Health */}
                      <div className="absolute -bottom-2 -left-2 w-7 h-7 z-20 flex items-center justify-center pointer-events-none">
                        <img src="/icons/gothic_attack.webp" alt="ATK" className="absolute inset-0 w-full h-full object-cover rounded shadow" />
                        <span 
                          className="relative text-[#ff3b30] text-xs font-black font-mono leading-none z-10"
                          style={{ textShadow: '2px 2px 2px #000, -2px -2px 2px #000, 2px -2px 2px #000, -2px 2px 2px #000, 0 0 5px #000' }}
                        >
                          {card.attack}
                        </span>
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-7 h-7 z-20 flex items-center justify-center pointer-events-none">
                        <img src="/icons/gothic_health.webp" alt="HP" className="absolute inset-0 w-full h-full object-cover rounded shadow" />
                        <span 
                          className="relative text-white text-xs font-black font-mono leading-none z-10"
                          style={{ textShadow: '2px 2px 2px #000, -2px -2px 2px #000, 2px -2px 2px #000, -2px 2px 2px #000, 0 0 5px #000' }}
                        >
                          {card.health}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-600 font-mono text-[9px]">
                      {canPlayHere ? (
                        <span className="text-[#66fcf1] font-bold text-[8.5px] animate-pulse">DEPLOY</span>
                      ) : (
                        <span>#{slotIndex + 1}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </main>

      {/* =========================================================================
          4. PLAYER COMMANDER BAR & TURN CONTROLS (Portrait, HP, Personal Mana, End Turn)
         ========================================================================= */}
      <div className="px-3 py-1.5 bg-gradient-to-t from-[#0e131d] to-transparent border-t border-white/10 flex items-center justify-between shrink-0 relative">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-10 h-10 rounded-xl overflow-hidden border-2 border-emerald-500/70 shadow-md relative shrink-0 ${
            defenderAction?.side === 'player' && defenderAction?.slot === -1 ? 'anim-hero-recoil' : ''
          }`}>
            <img 
              src={profile?.avatarUrl || '/avatars/avatar_1.webp'} 
              alt={profile?.username || 'Commander'} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-xs text-emerald-300 truncate">
                {profile?.username || 'Abyssal Lord'}
              </span>
              <span className="text-[9px] font-mono px-1 rounded bg-emerald-950 border border-emerald-800/80 text-emerald-400 font-bold">
                Lvl {profile?.level || 1}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              {/* HP Bar */}
              <div className="flex items-center gap-1">
                <div className="w-20 h-2 bg-zinc-900 rounded-full overflow-hidden border border-emerald-950">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-300"
                    style={{ width: `${Math.max(0, Math.min(100, (visualState.playerHeroHealth / visualState.playerHeroMaxHealth) * 100))}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono font-black text-emerald-300">
                  {visualState.playerHeroHealth} / {visualState.playerHeroMaxHealth}
                </span>
              </div>

              {/* Personal Player Mana */}
              <div className="flex items-center gap-1 bg-cyan-950/70 px-1.5 py-0.5 rounded border border-cyan-500/50">
                <span className="text-[9px]">💎</span>
                <span className="text-[10px] font-mono font-black text-cyan-300">
                  {visualState.playerMana} / {visualState.playerMaxMana}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating text on player hero */}
        <div className="absolute top-2 left-1/3 pointer-events-none flex flex-col items-center z-40">
          {floatingTexts.filter(f => f.target === 'player-hero').map(f => (
            <span key={f.id} className={`${f.colorClass} animate-bounce font-black`}>
              {f.text}
            </span>
          ))}
        </div>

        {/* Large Thumb-Friendly End Turn / Cancel Button */}
        {selectedHandCardId ? (
          <button
            onClick={() => setSelectedHandCardId(null)}
            className="px-3.5 py-2 bg-gradient-to-b from-red-700 to-red-900 hover:from-red-600 text-white font-display font-black text-xs rounded-xl shadow-md border-2 border-red-500 active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
          >
            CANCEL ✕
          </button>
        ) : (
          <button
            onClick={handleEndTurnWithoutCard}
            disabled={isSimulating || isAnimating}
            className={`px-4 py-2 font-display font-black text-xs rounded-xl shadow-lg border-2 transition-all uppercase tracking-wider ${
              isSimulating || isAnimating
                ? 'bg-zinc-800 text-zinc-500 border-zinc-700 cursor-not-allowed'
                : 'bg-gradient-to-b from-amber-500 via-amber-600 to-amber-700 text-black border-amber-300 hover:from-amber-400 active:scale-95 cursor-pointer shadow-amber-500/20'
            }`}
          >
            END TURN ⚔️
          </button>
        )}
      </div>

      {/* =========================================================================
          5. FIXED HAND OF 3 CARDS (Authentic PC Visual Style, Skills & Delay)
         ========================================================================= */}
      <div className="bg-[#090d15] border-t border-white/10 p-2 shrink-0 z-20">
        <div className="flex items-center justify-between px-1 mb-1 text-[8.5px] font-mono text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[#ebd09b] uppercase tracking-wider">COMMANDER HAND (FIXED 3)</span>
            <span className="text-[7.5px] text-zinc-500">Tap to deploy</span>
          </div>
          <span className="text-zinc-400 font-mono">
            REMAINING DECK: {visualState.playerDeckSize || visualState.playerDeckQueue?.length || 0}
          </span>
        </div>

        {/* Exactly up to 3 cards in player hand */}
        <div className="flex justify-center gap-2 max-w-md mx-auto w-full">
          {visualState.playerHand.slice(0, 3).map((card) => {
            const isSelected = selectedHandCardId === card.id;
            const canAfford = visualState.playerMana >= (card.manaCost || 1);

            return (
              <div
                key={`hand-card-${card.id}`}
                onClick={() => {
                  if (isSimulating || isAnimating) return;
                  if (!canAfford) {
                    toast('Not enough Mana to summon!', 'error');
                    return;
                  }
                  setSelectedHandCardId(prev => prev === card.id ? null : card.id);
                }}
                className={`relative flex-1 max-w-[120px] h-[146px] rounded-xl border flex flex-col justify-between p-1.5 select-none transition-all cursor-pointer overflow-visible ${
                  isSelected 
                    ? 'border-amber-400 ring-2 ring-amber-400 -translate-y-2 shadow-[0_0_20px_rgba(245,158,11,0.6)] z-30' 
                    : !canAfford
                      ? 'border-zinc-800 opacity-55 grayscale'
                      : getTierBorderColor(card.tier)
                } bg-[#151a21]`}
              >
                {/* Background Art */}
                <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none z-0">
                  <img 
                    src={card.image} 
                    alt={card.name} 
                    className={`w-full h-full object-cover ${card.delay > 0 ? 'opacity-40 filter saturate-50' : 'opacity-85'}`}
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />

                  {/* AUTHENTIC PC DELAY OVERLAY: ONLY SHOWN WHEN card.delay > 0 */}
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

                {/* Top Row: Authentic PC Mana Crystal (Left) + Tier & Level (Right) */}
                <div className="flex justify-between items-center z-10 relative">
                  <div className="flex items-center gap-1">
                    {renderManaIcon(card.manaCost || 1, "w-[18px] h-[18px]")}
                    <span className={`text-[7.5px] font-mono font-black uppercase ${getTierTextColor(card.tier)}`}>
                      {card.tier}
                    </span>
                  </div>
                  <span className="text-[7.5px] font-mono font-bold text-gray-400">
                    Lvl {card.level || 1}
                  </span>
                </div>

                {/* Card Name */}
                <div className="mt-1 z-10 relative px-1 bg-black/60 py-0.5 rounded border border-white/5 text-center">
                  <span className="text-[10px] font-display font-black text-white block truncate leading-none">
                    {card.name}
                  </span>
                </div>

                {/* Dedicated Skills Bar at Bottom Center */}
                <div className="w-full py-0.5 bg-black/75 border-y border-white/10 flex justify-center gap-1 z-10 relative mt-auto mb-1 flex-wrap">
                  {card.skills && card.skills.length > 0 ? (
                    card.skills.map((sk, sIdx) => (
                      <div 
                        key={sIdx}
                        className={`flex items-center gap-0.5 text-[8px] font-mono font-black px-1.5 py-0.5 rounded-full border ${getSkillBadgeStyle(sk.type)}`}
                      >
                        <span>{renderSkillIcon(sk.type, "w-2.5 h-2.5")}</span>
                        <span className="leading-none">{sk.value}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-[7.5px] font-mono text-zinc-500 uppercase tracking-widest leading-none py-0.5">NO SKILL</span>
                  )}
                </div>

                {/* Inspect Button in corner */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setInspectCardData(card);
                  }}
                  className="absolute top-1 right-1 p-0.5 rounded-full bg-black/80 border border-white/20 text-zinc-400 hover:text-white z-20 cursor-pointer"
                  title="Inspect Details"
                >
                  <Info className="w-3 h-3" />
                </button>

                {/* Gothic Corner Badges: Attack & Health */}
                <div className="absolute -bottom-3 -left-3 w-8 h-8 z-20 flex items-center justify-center pointer-events-none">
                  <img src="/icons/gothic_attack.webp" alt="ATK" className="absolute inset-0 w-full h-full object-cover rounded shadow-md" />
                  <span 
                    className="relative text-[#ff3b30] text-[13px] font-black font-mono leading-none z-10"
                    style={{ textShadow: '2px 2px 2px #000, -2px -2px 2px #000, 2px -2px 2px #000, -2px 2px 2px #000, 0 0 5px #000' }}
                  >
                    {card.attack}
                  </span>
                </div>
                <div className="absolute -bottom-3 -right-3 w-8 h-8 z-20 flex items-center justify-center pointer-events-none">
                  <img src="/icons/gothic_health.webp" alt="HP" className="absolute inset-0 w-full h-full object-cover rounded shadow-md" />
                  <span 
                    className="relative text-white text-[13px] font-black font-mono leading-none z-10"
                    style={{ textShadow: '2px 2px 2px #000, -2px -2px 2px #000, 2px -2px 2px #000, -2px 2px 2px #000, 0 0 5px #000' }}
                  >
                    {card.health}
                  </span>
                </div>
              </div>
            );
          })}

          {visualState.playerHand.length === 0 && (
            <div className="text-center font-mono text-xs text-zinc-500 py-6">
              Hand is empty • Draw pile depleted
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          6. FULL CARD INSPECT MODAL (100% English, Detailed Descriptions)
         ========================================================================= */}
      {inspectCardData && (
        <div 
          onClick={() => setInspectCardData(null)}
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[310px] bg-gradient-to-b from-[#181320] via-[#0f0b15] to-[#08060b] border-2 border-[#ebd09b] rounded-2xl p-4 flex flex-col items-center shadow-[0_0_35px_rgba(235,208,155,0.4)] relative"
          >
            <button
              onClick={() => setInspectCardData(null)}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Artwork */}
            <div className="w-32 h-40 rounded-xl overflow-hidden border border-white/20 mb-2 relative shadow-lg">
              <img src={inspectCardData.image} alt={inspectCardData.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            </div>

            <h3 className="font-display font-black text-base text-amber-200 text-center">
              {inspectCardData.name}
            </h3>
            <span className={`text-[10px] font-mono font-bold uppercase tracking-widest mt-0.5 ${getTierTextColor(inspectCardData.tier)}`}>
              {inspectCardData.tier} CREATURE • LVL {inspectCardData.level || 1}
            </span>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-1 w-full my-3 py-2 border-y border-white/10 text-center font-mono">
              <div>
                <div className="text-[8px] text-zinc-400">COST</div>
                <div className="text-xs font-black text-cyan-300">💎 {inspectCardData.manaCost || 1}</div>
              </div>
              <div>
                <div className="text-[8px] text-zinc-400">DELAY</div>
                <div className="text-xs font-black text-purple-300">⏳ {inspectCardData.delay}</div>
              </div>
              <div>
                <div className="text-[8px] text-zinc-400">ATTACK</div>
                <div className="text-xs font-black text-red-400">⚔️ {inspectCardData.attack}</div>
              </div>
              <div>
                <div className="text-[8px] text-zinc-400">HEALTH</div>
                <div className="text-xs font-black text-emerald-400">❤️ {inspectCardData.health}</div>
              </div>
            </div>

            {/* Skills Details */}
            <div className="w-full space-y-1.5 mb-3 max-h-36 overflow-y-auto custom-scrollbar">
              {inspectCardData.skills && inspectCardData.skills.length > 0 ? (
                inspectCardData.skills.map((sk: any, idx: number) => (
                  <div key={idx} className="bg-black/60 p-2 rounded-xl border border-white/10">
                    <div className="text-[11px] font-mono font-bold text-amber-300 flex items-center gap-1.5">
                      {renderSkillIcon(sk.type, "w-3.5 h-3.5")}
                      <span>{getSkillNameEnglish(sk.type)} ({sk.value})</span>
                    </div>
                    <p className="text-[9.5px] text-zinc-300 mt-0.5 leading-relaxed font-sans">
                      {getSkillDescEnglish(sk.type, sk.value)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="bg-black/40 p-2 rounded-xl border border-white/5 text-center text-[10px] font-mono text-zinc-500">
                  No passive abilities on this creature.
                </div>
              )}
            </div>

            <button
              onClick={() => setInspectCardData(null)}
              className="w-full py-2 bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-zinc-700 text-white font-mono text-xs font-bold rounded-xl border border-zinc-600 cursor-pointer active:scale-95 transition-all"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          7. VICTORY MODAL (Rewards, Stars, Submit Result)
         ========================================================================= */}
      {visualState.phase === 'player_won' && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-[#18140f] via-[#0d0a08] to-[#050403] border-2 border-amber-500/60 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-[0_0_50px_rgba(245,158,11,0.35)] relative">
            
            <div className="w-16 h-16 mx-auto bg-gradient-to-b from-amber-950 to-black border-2 border-amber-400 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.5)]">
              <Swords className="w-8 h-8 text-amber-300 drop-shadow" />
            </div>

            <div>
              <h3 className="font-display font-black text-2xl text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-yellow-500 uppercase tracking-wider">
                {battleType === 'pvp' ? 'ARENA VICTORY!' : 'COVENANT VICTORY!'}
              </h3>
              <p className="text-xs text-zinc-300 mt-1">
                {battleType === 'pvp' ? 'Opposing summoner vanquished!' : 'Abyssal floor conquered and cleansed!'}
              </p>
            </div>

            {/* Campaign Stars */}
            {battleType === 'campaign' && (() => {
              const hpPct = visualState.playerHeroHealth / visualState.playerHeroMaxHealth;
              const earnedStars = hpPct === 1 ? 3 : hpPct >= 0.5 ? 2 : 1;
              return (
                <div className="flex justify-center gap-3 py-1">
                  {[1, 2, 3].map(s => (
                    <Star 
                      key={s} 
                      className={`w-7 h-7 transition-all ${
                        s <= earnedStars 
                          ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.9)] scale-110' 
                          : 'text-zinc-800 fill-zinc-900'
                      }`} 
                    />
                  ))}
                </div>
              );
            })()}

            {/* Rewards */}
            <div className="bg-black/60 p-3 rounded-2xl border border-white/10 flex justify-around items-center font-mono">
              <div className="text-center">
                <span className="text-[9px] text-zinc-400 block">GOLD</span>
                <span className="text-sm font-black text-amber-400">+{earnedGold}</span>
              </div>
              <div className="text-center">
                <span className="text-[9px] text-zinc-400 block">DUST</span>
                <span className="text-sm font-black text-cyan-400">+{earnedDust}</span>
              </div>
              <div className="text-center">
                <span className="text-[9px] text-zinc-400 block">EXP</span>
                <span className="text-sm font-black text-purple-300">+{earnedExp}</span>
              </div>
              {earnedSovereigns > 0 && (
                <div className="text-center">
                  <span className="text-[9px] text-amber-300 block">SOV</span>
                  <span className="text-sm font-black text-yellow-300">+{earnedSovereigns}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => onExitBattle(true)}
              className="w-full py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-400 text-black font-display font-black text-sm rounded-xl shadow-lg active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
            >
              CLAIM SPOILS 🏆
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          8. DEFEAT MODAL
         ========================================================================= */}
      {visualState.phase === 'player_lost' && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-[#180a0a] via-[#0d0505] to-[#040101] border-2 border-red-500/60 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-[0_0_50px_rgba(239,68,68,0.35)]">
            <div className="w-16 h-16 mx-auto bg-gradient-to-b from-red-950 to-black border-2 border-red-500 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(239,68,68,0.5)]">
              <Skull className="w-8 h-8 text-red-400" />
            </div>

            <div>
              <h3 className="font-display font-black text-2xl text-red-500 uppercase tracking-wider">
                DEFEAT
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Your squad was consumed by the void. Regroup and enhance your deck.
              </p>
            </div>

            <button
              onClick={() => onExitBattle(false)}
              className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-display font-black text-sm rounded-xl border border-zinc-600 active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
            >
              RETREAT TO ALTAR
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          9. COMBAT LOG DRAWER
         ========================================================================= */}
      {showLogDrawer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-xs h-full bg-[#0d0912] border-l border-white/10 p-4 flex flex-col justify-between shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <Scroll className="w-4 h-4 text-[#ebd09b]" />
                <h4 className="font-display font-black text-xs text-[#ebd09b] uppercase tracking-wider">
                  Combat History
                </h4>
              </div>
              <button onClick={() => setShowLogDrawer(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 my-3 pr-1 text-[10px] font-mono text-zinc-300 custom-scrollbar">
              {visualState.combatLog.map((entry, idx) => (
                <div key={idx} className="bg-black/50 p-1.5 rounded border border-white/5">
                  {entry}
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowLogDrawer(false)}
              className="w-full py-2 bg-zinc-800 text-white font-mono text-xs font-bold rounded-xl"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          10. RULES CODEX MODAL (100% English)
         ========================================================================= */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#120d18] border border-[#ebd09b]/50 rounded-2xl p-4 flex flex-col space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h4 className="font-display font-black text-sm text-[#ebd09b] uppercase">Codex of War</h4>
              <button onClick={() => setShowHelpModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-[11px] font-sans text-zinc-300 space-y-2 max-h-72 overflow-y-auto">
              <p><strong>⏳ Cast Delay (Timer):</strong> Number of rounds before the creature unleashes its first strike. Delay 0 attacks immediately.</p>
              <p><strong>💎 Mana:</strong> Energy required to summon this creature to the battlefield. Refilled every round.</p>
              <p><strong>⚔️ Duels:</strong> Creatures strike the opposing card. If the slot is unoccupied, direct damage is dealt to the Lord.</p>
              <p><strong>🩸 Vampirism:</strong> Restores health to this card upon inflicting attack damage.</p>
              <p><strong>🦠 Plague:</strong> Spreads toxic miasma at the end of every round, afflicting enemy creatures.</p>
              <p><strong>👁️ Hex:</strong> Curses the opposing target, amplifying all subsequent incoming damage.</p>
              <p><strong>💀 Sacrifice:</strong> Destroys a friendly creature upon deployment to permanently bolster self and heal the Lord.</p>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2 bg-zinc-800 text-white font-mono text-xs font-bold rounded-xl"
            >
              UNDERSTOOD
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default MobileBattleArena;
