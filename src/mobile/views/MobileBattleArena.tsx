import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { useToast } from '../../components/Toast';
import { CampaignStage, BattleState, BattleCardState, Equipment } from '../../types';
import { initializeBattle, simulateCombatTurn, toBattleCard, placeCardLocally } from '../../utils/gameLogic';
import { calculateEquipmentSetBonuses } from '../../data/equipment';
import { 
  Swords, 
  Skull, 
  Shield, 
  Zap, 
  HelpCircle, 
  ArrowLeft, 
  Pause, 
  Play, 
  Activity,
  Scroll, 
  X,
  Droplet,
  ChevronUp,
  Trophy
} from 'lucide-react';

interface MobileBattleArenaProps {
  stage: CampaignStage;
  onExitBattle: (victory: boolean) => void;
  battleType?: 'campaign' | 'pvp';
}

// Visual floating text effects
interface FloatingTextEffect {
  id: string;
  text: string;
  target: 'player-hero' | 'enemy-hero' | { side: 'player' | 'enemy'; slot: number };
  colorClass: string;
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

// Card tier helper functions for gothic styling
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
    case 'bronze': return 'from-amber-950/50 via-[#151a21] to-[#0d1117]';
    case 'silver': return 'from-slate-900/50 via-[#151a21] to-[#0d1117]';
    case 'gold': return 'from-yellow-950/40 via-[#151a21] to-[#0d1117]';
    case 'legendary': return 'from-purple-950/50 via-[#180f2b] to-[#0d1117]';
    case 'divine': return 'from-rose-950/70 via-[#26050d] to-[#0d1117]';
    default: return 'from-zinc-900 via-[#151a21] to-[#0d1117]';
  }
};

const getTierTextColor = (tier: string) => {
  switch (tier?.toLowerCase()) {
    case 'bronze': return 'text-amber-500';
    case 'silver': return 'text-slate-300';
    case 'gold': return 'text-yellow-400';
    case 'legendary': return 'text-purple-400';
    case 'divine': return 'text-rose-400 font-black';
    default: return 'text-gray-400';
  }
};

// Mana Icon renderer
const renderManaIcon = (cost: number, sizeClass: string = "w-4 h-4") => {
  return (
    <div className={`relative ${sizeClass} shrink-0 flex items-center justify-center`}>
      <svg className="absolute inset-0 w-full h-full drop-shadow-[0_0_4px_rgba(6,182,212,0.85)]" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L4 7v10l8 5 8-5V7l-8-5z" fill="url(#manaCrystalGradMobile)" stroke="#66fcf1" strokeWidth="1.5" />
        <path d="M12 2L4 7l8 5 8-5-8-5z" fill="#66fcf1" opacity="0.35" />
        <defs>
          <radialGradient id="manaCrystalGradMobile" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00f0ff" />
            <stop offset="100%" stopColor="#0033aa" />
          </radialGradient>
        </defs>
      </svg>
      <span className="relative text-white text-[9px] font-black font-mono leading-none z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
        {cost}
      </span>
    </div>
  );
};

// Skill Icon renderer
const renderSkillIcon = (type: string, sizeClass: string = "w-3 h-3") => {
  const normType = type?.toLowerCase();
  switch (normType) {
    case 'vampirism':
      return (
        <div className={`relative ${sizeClass} shrink-0 flex items-center justify-center`} title="Vampirism">
          <svg className="w-full h-full drop-shadow-[0_0_3px_rgba(239,68,68,0.7)]" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C12 2 4 10 4 15C4 19.4 7.6 23 12 23C16.4 23 20 19.4 20 15C20 10 12 2 12 2Z" fill="#ef4444" stroke="#fca5a5" strokeWidth="1" />
          </svg>
        </div>
      );
    case 'plague':
      return (
        <div className={`relative ${sizeClass} shrink-0 flex items-center justify-center`} title="Plague">
          <svg className="w-full h-full drop-shadow-[0_0_3px_rgba(16,185,129,0.7)]" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="5" fill="#10b981" stroke="#a7f3d0" strokeWidth="1" />
            <path d="M12 4.5V19.5M4.5 12H19.5" stroke="#10b981" strokeWidth="1.5" />
          </svg>
        </div>
      );
    case 'hex':
      return (
        <div className={`relative ${sizeClass} shrink-0 flex items-center justify-center`} title="Hex">
          <svg className="w-full h-full drop-shadow-[0_0_3px_rgba(168,85,247,0.7)]" viewBox="0 0 24 24" fill="none">
            <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="4" fill="#a855f7" />
          </svg>
        </div>
      );
    case 'sacrifice':
      return (
        <div className={`relative ${sizeClass} shrink-0 flex items-center justify-center`} title="Sacrifice">
          <svg className="w-full h-full drop-shadow-[0_0_3px_rgba(239,68,68,0.8)]" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C7.5 2 4 5.5 4 10C4 12.9 5.5 15.5 8 16.8V20.5C8 21.3 8.7 22 9.5 22H14.5C15.3 22 16 21.3 16 20.5V16.8C18.5 15.5 20 12.9 20 10C20 5.5 16.5 2 12 2Z" fill="#ef4444" stroke="#fca5a5" strokeWidth="1" />
          </svg>
        </div>
      );
    default:
      return <Zap className={`${sizeClass} text-yellow-400`} />;
  }
};

export const MobileBattleArena: React.FC<MobileBattleArenaProps> = ({ 
  stage, 
  onExitBattle, 
  battleType = 'campaign' 
}) => {
  const { profile, submitBattleResult } = useGame();
  const toast = useToast();

  // Equipment calculation
  const equippedList = Object.values(profile.equipped || {})
    .map(eqId => profile.equipment?.find(e => e.id === eqId))
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

  // Battle State Initialization
  const [battle, setBattle] = useState<BattleState>(() => initializeBattle(
    (profile?.collection || []).filter(c => (profile?.deck || []).includes(c.id)),
    stage,
    startingPlayerMana,
    playerCreatureBuff,
    enemyStartingMana,
    enemyCreatureBuff,
    enemyHeroMaxHealth,
    enemyDodgeChance,
    enemyDelayReduction
  ));

  const [visualState, setVisualState] = useState<BattleState>(battle);
  const [selectedHandCardId, setSelectedHandCardId] = useState<string | null>(null);
  const [isHandOpen, setIsHandOpen] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animateSequence, setAnimateSequence] = useState<any[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const effectiveSpeed = speedMultiplier === 1 ? 1.0 : (speedMultiplier === 2 ? 1.55 : 2.15);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [activeLogStepText, setActiveLogStepText] = useState<string>('');

  // Action states for animations
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

  const [floatingTexts, setFloatingTexts] = useState<FloatingTextEffect[]>([]);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [helpTab, setHelpTab] = useState<'basics' | 'skills' | 'defense'>('basics');
  const [showLogDrawer, setShowLogDrawer] = useState<boolean>(false);
  const [finalBattleState, setFinalBattleState] = useState<BattleState | null>(null);
  const battleResultSubmittedRef = useRef<boolean>(false);

  // Rewards
  const isSubActive = profile.subscriptionExpiresAt && Number(profile.subscriptionExpiresAt) > Date.now();
  const subTier = isSubActive ? (profile.subscriptionTier || 'free') : 'free';
  const subGoldBonusPercent = subTier === 'ultra' ? 50 : subTier === 'premium' ? 25 : 0;
  const equipGoldBonus = getEquipmentBonus('goldBonus');
  const battleGoldMultiplier = 1 + (subGoldBonusPercent / 100) + (equipGoldBonus / 100);

  const applyRewardMultiplier = (baseVal: number, mult: number) => {
    if (mult <= 1 || baseVal <= 0) return Math.round(baseVal);
    return baseVal + Math.max(1, Math.round(baseVal * (mult - 1)));
  };

  const initialBaseGold = stage.goldReward || (battleType === 'pvp' ? 50 : 50);
  const [earnedGold, setEarnedGold] = useState<number>(() => applyRewardMultiplier(initialBaseGold, battleGoldMultiplier));
  const [earnedDust, setEarnedDust] = useState<number>(() => stage.dustReward || (battleType === 'pvp' ? 25 : 25));
  const initialBaseExp = battleType === 'pvp' ? 100 : ((stage.id || 1) * 16 + 32);
  const [earnedExp, setEarnedExp] = useState<number>(() => initialBaseExp);

  // Sync visualState when idle
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
    const id = `float_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const lifespan = Math.max(300, Math.round(650 / speedMultiplier));
    setFloatingTexts(prev => [...prev, { id, text, target, colorClass }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(f => f.id !== id));
    }, lifespan);
  };

  // Setup visual starting state before playing steps
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

  // Combat step runner (Lightweight, 60fps CSS transitions, zero Framer Motion lag)
  useEffect(() => {
    if (currentStepIndex === -1 || currentStepIndex >= animateSequence.length || isPaused) return;

    const step = animateSequence[currentStepIndex];
    let stepDescription = '';

    const strikeDuration = Math.round(680 / effectiveSpeed);
    const impactDelay = Math.round(300 / effectiveSpeed);
    let stepDuration = Math.round(800 / effectiveSpeed);

    if (step.type === 'enemy_play') stepDuration = Math.round(700 / effectiveSpeed);
    else if (step.type === 'death') stepDuration = Math.round(380 / effectiveSpeed);

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    switch (step.type) {
      case 'sacrifice': {
        stepDescription = '💀 Sacrifice: Ally surrendered for strength!';
        addFloatingText('💀 SACRIFICE', { side: 'player', slot: step.targetSlot }, 'text-red-500 font-bold text-xs');
        addFloatingText(`+${step.healAmount} HP`, 'player-hero', 'text-emerald-400 font-black text-xs');
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
        stepDescription = `😈 Dark Summon: Lord summons ${step.card.name}`;
        addFloatingText('SUMMON', { side: 'enemy', slot: step.slot }, 'text-[#ebd09b] font-bold text-xs');
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
        
        stepDescription = `🗡️ Duel: ${attackerCard?.name || 'Creature'} strikes ${defenderCard?.name || 'Target'} (-${step.damage})`;
        setAttackerAction({ side: step.attacker, slot: step.slot, targetSlot: step.targetSlot });

        const tHit = setTimeout(() => {
          setDefenderAction({ side: defSide, slot: step.targetSlot, type: 'hit' });
          if (step.barrierBlocked) {
            addFloatingText('✨ BARRIER', { side: defSide, slot: step.targetSlot }, 'text-amber-300 font-black text-xs');
          } else {
            if (step.armorAbsorbed > 0) {
              addFloatingText(`🛡️ -${step.armorAbsorbed}`, { side: defSide, slot: step.targetSlot }, 'text-cyan-300 font-black text-xs');
            }
            if (step.damage > 0) {
              addFloatingText(`-${step.damage}`, { side: defSide, slot: step.targetSlot }, 'text-red-500 font-black text-sm');
            }
          }

          if (step.vampireHeal > 0) {
            addFloatingText(`+${step.vampireHeal} 🩸`, { side: step.attacker, slot: step.slot }, 'text-emerald-400 font-extrabold text-xs');
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
                if (step.armorBroken) nextTarget.armor = 0;
                else if (step.armorAbsorbed > 0) nextTarget.armor = Math.max(0, (nextTarget.armor || 0) - step.armorAbsorbed);
                if (step.targetHealth !== undefined) nextTarget.health = Math.max(0, step.targetHealth);
                else if (step.damage > 0) nextTarget.health = Math.max(0, nextTarget.health - step.damage);
              }
            }

            let nextAttacker = prevAttacker;
            if (prevAttacker && (step.attackerHealth !== undefined || step.vampireHeal > 0)) {
              nextAttacker = { ...prevAttacker, skills: prevAttacker.skills };
              if (step.attackerHealth !== undefined) nextAttacker.health = Math.min(nextAttacker.maxHealth, step.attackerHealth);
              else if (step.vampireHeal > 0) nextAttacker.health = Math.min(nextAttacker.maxHealth, nextAttacker.health + step.vampireHeal);
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
        stepDescription = `💥 Breakthrough: ${attackerCard?.name || 'Creature'} deals -${step.damage} to Commander!`;
        setAttackerAction({ side: step.attacker, slot: step.slot, targetSlot: -1, isDirect: true });

        const tHit = setTimeout(() => {
          const targetHeroSide = step.attacker === 'player' ? 'enemy' : 'player';
          const targetHeroLabel = step.attacker === 'player' ? 'enemy-hero' : 'player-hero';

          setDefenderAction({ side: targetHeroSide, slot: -1, type: 'hit' });
          addFloatingText(`💥 -${step.damage}`, targetHeroLabel, 'text-red-500 font-black text-base');

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
          stepDescription = `⚡ Void Strike: Deals -${step.damage} damage!`;
          const tHit = setTimeout(() => {
            if (step.targetSlot === -1) {
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
          stepDescription = `🩸 Blood Aura: Heals +${step.heal} HP!`;
          if (step.targetSlot === -1) {
            setDefenderAction({ side: targetSide, slot: -1, type: 'heal' });
            addFloatingText(`🩸 +${step.heal}`, targetHeroLabel, 'text-emerald-400 font-bold text-xs');
            setVisualState(prev => {
              const copy = cloneBattleState(prev);
              if (targetSide === 'player') copy.playerHeroHealth = Math.min(copy.playerHeroMaxHealth, copy.playerHeroHealth + step.heal);
              else copy.enemyHeroHealth = Math.min(copy.enemyHeroMaxHealth, copy.enemyHeroHealth + step.heal);
              return copy;
            });
          } else {
            setDefenderAction({ side: targetSide, slot: step.targetSlot, type: 'heal' });
            addFloatingText(`🩸 +${step.heal}`, { side: targetSide, slot: step.targetSlot }, 'text-emerald-400 font-bold text-xs');
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

      case 'plague': {
        const defSide = step.sourceSide === 'player' ? 'enemy' : 'player';
        stepDescription = `🦠 Plague: Toxic miasma infests target (-${step.damage} HP)`;
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
        stepDescription = `🛡️ Evaded: ${isEnemy ? 'Enemy Commander' : 'Your Lord'} dodged attack!`;
        addFloatingText('DODGE! 🛡️', isEnemy ? 'enemy-hero' : 'player-hero', 'text-cyan-400 font-black text-xs');
        break;
      }

      case 'death': {
        stepDescription = '☠️ Death: Creature destroyed!';
        setDefenderAction({ side: step.side, slot: step.slot, type: 'death' });
        addFloatingText('💀 DEAD', { side: step.side, slot: step.slot }, 'text-gray-500 font-bold text-[9px]');
        const tDeath = setTimeout(() => {
          setVisualState(prev => {
            const copy = cloneBattleState(prev);
            if (step.side === 'player') copy.playerBoard[step.slot] = null;
            else copy.enemyBoard[step.slot] = null;
            return copy;
          });
        }, Math.round(200 / effectiveSpeed));
        timeouts.push(tDeath);
        break;
      }
    }

    setActiveLogStepText(stepDescription);

    const tClearHit = setTimeout(() => setDefenderAction(null), impactDelay + Math.round(300 / effectiveSpeed));
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

  // Handle visualizer completion
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
    }
  }, [currentStepIndex, animateSequence, finalBattleState]);

  // Handle Play Card
  const handlePlayCard = (slotIndex: number) => {
    if (!selectedHandCardId) return;
    if (battle.playerBoard[slotIndex] !== null) return;

    const cardToPlay = battle.playerHand.find(c => c.id === selectedHandCardId);
    if (!cardToPlay) return;

    const newBattleState = placeCardLocally(battle, selectedHandCardId, slotIndex);
    if (newBattleState !== battle) {
      addFloatingText('SUMMON', { side: 'player', slot: slotIndex }, 'text-[#ebd09b] font-bold text-xs');
      setBattle(newBattleState);
      setVisualState(newBattleState);
    }

    setSelectedHandCardId(null);
  };

  // Handle End Turn
  const handleEndTurnWithoutCard = () => {
    if (isSimulating || isAnimating) return;
    setIsSimulating(true);
    const { nextState, animateSequence: steps } = simulateCombatTurn(battle, null, null, profile, stage);
    setFinalBattleState(nextState);
    setupPlaybackState(steps);
  };

  // Victory / Defeat handling
  const handleBattleWon = async () => {
    if (battleResultSubmittedRef.current) return;
    battleResultSubmittedRef.current = true;

    let stars = 1;
    const hpPercentage = battle.playerHeroHealth / battle.playerHeroMaxHealth;
    if (hpPercentage === 1) stars = 3;
    else if (hpPercentage >= 0.5) stars = 2;

    const res = await submitBattleResult(battleType, stage.id.toString(), 'win', stars);
    if (res.success) {
      if (res.rewards?.gold !== undefined) setEarnedGold(res.rewards.gold);
      if (res.rewards?.dust !== undefined) setEarnedDust(res.rewards.dust);
      if (res.rewards?.exp !== undefined) setEarnedExp(res.rewards.exp);
    }
  };

  const handleBattleLost = async () => {
    if (battleResultSubmittedRef.current) return;
    battleResultSubmittedRef.current = true;
    await submitBattleResult(battleType, stage.id.toString(), 'loss');
  };

  const selectedHandCard = battle.playerHand.find(c => c.id === selectedHandCardId);

  return (
    <div className="relative w-full h-[100dvh] max-h-[100dvh] bg-[#070504] text-white flex flex-col overflow-hidden select-none font-sans">
      
      {/* =========================================================================
          1. TOP BAR — FITS EXACTLY IN TELEGRAM TOP INSET GAP
          Left margin clears Telegram Close, Right margin clears Telegram Dots
         ========================================================================= */}
      <header 
        style={{
          paddingLeft: 'max(4.75rem, env(safe-area-inset-left, 4.75rem))',
          paddingRight: 'max(4.75rem, env(safe-area-inset-right, 4.75rem))'
        }}
        className="h-[36px] bg-[#0c0e14]/95 backdrop-blur-md border-b border-[#ebd09b]/20 flex items-center justify-between px-2 shrink-0 z-40 relative"
      >
        {/* Left: Escape Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onExitBattle(false)}
            className="flex items-center gap-1 bg-red-950/60 hover:bg-red-900 border border-red-500/50 text-red-300 hover:text-white px-2 py-1 rounded-md text-[10px] font-mono font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>ESCAPE</span>
          </button>
        </div>

        {/* Center: Stage/Turn or Real-Time Action Ticker */}
        <div className="flex items-center justify-center flex-1 mx-2 overflow-hidden">
          {activeLogStepText ? (
            <div className="bg-amber-950/80 border border-amber-500/50 text-amber-200 px-3 py-0.5 rounded-full text-[10px] font-mono font-bold truncate max-w-full shadow-[0_0_12px_rgba(245,158,11,0.3)] animate-pulse">
              {activeLogStepText}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-[#ebd09b] text-[11px] tracking-wider uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                {stage.name || `THE ABYSS - FLOOR ${stage.id}`}
              </span>
              <span className="bg-black/60 border border-[#ebd09b]/30 text-amber-400 font-mono text-[9px] px-1.5 py-0.5 rounded font-bold">
                TURN {visualState.turn || 1}
              </span>
            </div>
          )}
        </div>

        {/* Right: Controls & Guides */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Speed Multiplier */}
          <button
            onClick={() => setSpeedMultiplier(prev => (prev === 1 ? 2 : prev === 2 ? 3 : 1))}
            className="bg-black/60 border border-white/10 hover:border-amber-400 text-amber-300 font-mono font-bold text-[9px] px-1.5 py-1 rounded transition-all active:scale-95"
            title="Combat Speed"
          >
            {speedMultiplier}x
          </button>

          {/* Pause */}
          <button
            onClick={() => setIsPaused(prev => !prev)}
            className={`p-1 rounded border transition-all active:scale-95 ${
              isPaused 
                ? 'bg-amber-500/20 border-amber-500 text-amber-300' 
                : 'bg-black/60 border-white/10 text-gray-400 hover:text-white'
            }`}
            title={isPaused ? "Resume" : "Pause"}
          >
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          </button>

          {/* Rules Codex */}
          <button
            onClick={() => setShowHelpModal(true)}
            className="flex items-center gap-0.5 bg-black/60 hover:bg-[#1a1f2c] border border-[#ebd09b]/40 text-[#ebd09b] hover:text-white px-1.5 py-1 rounded text-[9px] font-mono font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
          >
            <HelpCircle className="w-3 h-3" />
            <span className="hidden sm:inline">RULES</span>
          </button>

          {/* Log Drawer */}
          <button
            onClick={() => setShowLogDrawer(prev => !prev)}
            className="flex items-center gap-0.5 bg-black/60 hover:bg-[#1a1f2c] border border-white/15 text-gray-300 hover:text-white px-1.5 py-1 rounded text-[9px] font-mono font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
          >
            <Scroll className="w-3 h-3" />
            <span className="hidden sm:inline">LOG</span>
          </button>
        </div>
      </header>

      {/* =========================================================================
          2. COMBAT ARENA — 5V5 BOARD + COMPACT HERO TOKENS (ZERO SLOT OVERLAP)
         ========================================================================= */}
      <main className="flex-1 relative flex flex-col justify-between px-2 sm:px-4 py-1 overflow-hidden min-h-0">
        
        {/* Ambient Dark Gothic Background */}
        <div className="absolute inset-0 bg-radial from-[#13111c] via-[#07060a] to-[#020203] pointer-events-none" />

        {/* ----------------- LEFT HERO COLUMN (TOKENS) ----------------- */}
        {/* Enemy Commander Token */}
        <div className="absolute top-2 left-2 z-20 flex flex-col items-center bg-black/70 border border-red-500/40 rounded-lg p-1 w-[46px] shadow-lg">
          <div className="w-7 h-7 rounded-full overflow-hidden border border-red-500/60 bg-zinc-900 shrink-0">
            <img 
              src={stage.enemyAvatar || "/portraits/boss_default.webp"} 
              alt="Enemy" 
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
          </div>
          <span className="text-[7px] font-mono font-bold text-red-400 mt-0.5 truncate max-w-full">
            ENEMY
          </span>
          {/* HP Bar */}
          <div className="w-full bg-zinc-800 rounded-full h-1 mt-0.5 overflow-hidden">
            <div 
              className="bg-red-500 h-full transition-all duration-300"
              style={{ width: `${Math.max(0, Math.min(100, (visualState.enemyHeroHealth / visualState.enemyHeroMaxHealth) * 100))}%` }}
            />
          </div>
          <span className="text-[8px] font-mono font-bold text-gray-200 leading-tight">
            {visualState.enemyHeroHealth}
          </span>
          {/* Floating text on enemy hero */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center">
            {floatingTexts.filter(f => f.target === 'enemy-hero').map(f => (
              <span key={f.id} className={`${f.colorClass} animate-bounce whitespace-nowrap`}>
                {f.text}
              </span>
            ))}
          </div>
        </div>

        {/* Player Lord Token */}
        <div className="absolute bottom-14 left-2 z-20 flex flex-col items-center bg-black/70 border border-amber-500/40 rounded-lg p-1 w-[46px] shadow-lg">
          <div className="w-7 h-7 rounded-full overflow-hidden border border-amber-500/60 bg-zinc-900 shrink-0">
            <img 
              src={profile.avatarUrl || "/portraits/avatar_default.webp"} 
              alt="Player" 
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
          </div>
          <span className="text-[7px] font-mono font-bold text-amber-400 mt-0.5 truncate max-w-full">
            LORD
          </span>
          {/* HP Bar */}
          <div className="w-full bg-zinc-800 rounded-full h-1 mt-0.5 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${Math.max(0, Math.min(100, (visualState.playerHeroHealth / visualState.playerHeroMaxHealth) * 100))}%` }}
            />
          </div>
          <span className="text-[8px] font-mono font-bold text-gray-200 leading-tight">
            {visualState.playerHeroHealth}
          </span>
          {/* Mana Counter */}
          <div className="flex items-center gap-0.5 mt-0.5">
            <Droplet className="w-2.5 h-2.5 text-cyan-400 fill-cyan-400" />
            <span className="text-[8px] font-mono font-bold text-cyan-300">
              {visualState.playerMana}
            </span>
          </div>
          {/* Floating text on player hero */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center">
            {floatingTexts.filter(f => f.target === 'player-hero').map(f => (
              <span key={f.id} className={`${f.colorClass} animate-bounce whitespace-nowrap`}>
                {f.text}
              </span>
            ))}
          </div>
        </div>

        {/* ----------------- 5 SLOTS VS 5 SLOTS CENTER BOARD ----------------- */}
        <div className="flex-1 flex flex-col justify-center items-center gap-1.5 w-full max-w-2xl mx-auto z-10">
          
          {/* ROW 1: ENEMY SQUAD (SLOTS 0..4) */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2 w-full max-w-[480px]">
            {visualState.enemyBoard.map((card, slotIndex) => {
              const isAttacking = attackerAction?.side === 'enemy' && attackerAction?.slot === slotIndex;
              const isDefending = defenderAction?.side === 'enemy' && defenderAction?.slot === slotIndex;
              const isDead = isDefending && defenderAction?.type === 'death';

              return (
                <div
                  key={`enemy-slot-${slotIndex}`}
                  className={`relative aspect-[13/18] max-h-[105px] sm:max-h-[114px] rounded-lg border flex flex-col items-center justify-between p-1 transition-all select-none overflow-hidden ${
                    card 
                      ? `${getTierBorderColor(card.tier || 'bronze')} bg-gradient-to-b ${getTierBgGradient(card.tier || 'bronze')}` 
                      : 'border-white/10 bg-black/40'
                  } ${isAttacking ? 'translate-y-2 scale-105 z-30 shadow-red-500/50 shadow-lg' : ''} ${
                    isDefending && !isDead ? 'animate-shake z-20' : ''
                  } ${isDead ? 'opacity-20 scale-90' : ''}`}
                >
                  {card ? (
                    <>
                      {/* Top Badges: Mana (Left) & Delay Hourglass (Right) */}
                      <div className="w-full flex items-center justify-between z-10 shrink-0">
                        {renderManaIcon(card.manaCost || 1, "w-3.5 h-3.5")}
                        <div className="flex items-center gap-0.5 bg-black/75 px-1 py-0.5 rounded border border-amber-500/40 shadow-sm">
                          <img src="/icons/gothic_hourglass.webp" alt="Delay" className="w-2.5 h-2.5 object-contain" />
                          <span className={`text-[8px] font-mono font-black leading-none ${card.delay === 0 ? 'text-emerald-400' : 'text-amber-300'}`}>
                            {card.delay}
                          </span>
                        </div>
                      </div>

                      {/* Card Image */}
                      <div className="absolute inset-0 w-full h-full opacity-60 z-0 overflow-hidden">
                        <img 
                          src={card.image} 
                          alt={card.name} 
                          className="w-full h-full object-cover" 
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                      </div>

                      {/* Card Name & Skills */}
                      <div className="relative z-10 w-full flex flex-col items-center text-center mt-auto mb-0.5">
                        <span className={`text-[8px] font-mono font-bold leading-tight truncate max-w-full ${getTierTextColor(card.tier || 'bronze')} drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]`}>
                          {card.name}
                        </span>
                        {card.skills && card.skills.length > 0 && (
                          <div className="flex items-center gap-0.5 mt-0.5">
                            {card.skills.slice(0, 2).map((sk, idx) => (
                              <span key={idx}>{renderSkillIcon(sk.type, "w-2.5 h-2.5")}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Bottom Badges: Attack (Left) & Health (Right) */}
                      <div className="w-full flex items-center justify-between z-10 shrink-0">
                        {/* ATK */}
                        <div className="flex items-center gap-0.5 bg-black/80 px-1 py-0.5 rounded border border-red-500/50 shadow-sm">
                          <img src="/icons/gothic_attack.webp" alt="ATK" className="w-2.5 h-2.5 object-contain" />
                          <span className="text-[9px] font-mono font-black text-red-400 leading-none">{card.attack}</span>
                        </div>
                        {/* HP */}
                        <div className="flex items-center gap-0.5 bg-black/80 px-1 py-0.5 rounded border border-emerald-500/50 shadow-sm">
                          <img src="/icons/gothic_health.webp" alt="HP" className="w-2.5 h-2.5 object-contain" />
                          <span className="text-[9px] font-mono font-black text-white leading-none">{card.health}</span>
                        </div>
                      </div>

                      {/* Floating Text */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                        {floatingTexts.filter(f => typeof f.target === 'object' && f.target.side === 'enemy' && f.target.slot === slotIndex).map(f => (
                          <span key={f.id} className={`${f.colorClass} animate-bounce text-[10px] font-black bg-black/80 px-1 rounded`}>
                            {f.text}
                          </span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-25">
                      <span className="text-[9px] font-mono text-gray-500">#{slotIndex + 1}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* DIVIDER: COMBAT CLASH LINE */}
          <div className="w-full max-w-[480px] flex items-center justify-between px-4 py-0.5 opacity-40">
            <div className="h-px bg-gradient-to-r from-transparent via-[#ebd09b] to-transparent flex-1" />
            <Swords className="w-3.5 h-3.5 text-[#ebd09b] mx-2 shrink-0" />
            <div className="h-px bg-gradient-to-r from-transparent via-[#ebd09b] to-transparent flex-1" />
          </div>

          {/* ROW 2: PLAYER SQUAD (SLOTS 0..4) */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2 w-full max-w-[480px]">
            {visualState.playerBoard.map((card, slotIndex) => {
              const isAttacking = attackerAction?.side === 'player' && attackerAction?.slot === slotIndex;
              const isDefending = defenderAction?.side === 'player' && defenderAction?.slot === slotIndex;
              const isDead = isDefending && defenderAction?.type === 'death';
              const canPlaceHere = Boolean(selectedHandCardId && !card && !isSimulating);

              return (
                <div
                  key={`player-slot-${slotIndex}`}
                  onClick={() => {
                    if (canPlaceHere) handlePlayCard(slotIndex);
                  }}
                  className={`relative aspect-[13/18] max-h-[105px] sm:max-h-[114px] rounded-lg border flex flex-col items-center justify-between p-1 transition-all select-none overflow-hidden ${
                    canPlaceHere
                      ? 'border-emerald-400/90 bg-emerald-950/40 shadow-[0_0_15px_rgba(52,211,153,0.5)] cursor-pointer animate-pulse scale-[1.02] z-30'
                      : card 
                        ? `${getTierBorderColor(card.tier || 'bronze')} bg-gradient-to-b ${getTierBgGradient(card.tier || 'bronze')}` 
                        : 'border-white/10 bg-black/40'
                  } ${isAttacking ? '-translate-y-2 scale-105 z-30 shadow-amber-500/50 shadow-lg' : ''} ${
                    isDefending && !isDead ? 'animate-shake z-20' : ''
                  } ${isDead ? 'opacity-20 scale-90' : ''}`}
                >
                  {card ? (
                    <>
                      {/* Top Badges: Mana (Left) & Delay Hourglass (Right) */}
                      <div className="w-full flex items-center justify-between z-10 shrink-0">
                        {renderManaIcon(card.manaCost || 1, "w-3.5 h-3.5")}
                        <div className="flex items-center gap-0.5 bg-black/75 px-1 py-0.5 rounded border border-amber-500/40 shadow-sm">
                          <img src="/icons/gothic_hourglass.webp" alt="Delay" className="w-2.5 h-2.5 object-contain" />
                          <span className={`text-[8px] font-mono font-black leading-none ${card.delay === 0 ? 'text-emerald-400' : 'text-amber-300'}`}>
                            {card.delay}
                          </span>
                        </div>
                      </div>

                      {/* Card Image */}
                      <div className="absolute inset-0 w-full h-full opacity-60 z-0 overflow-hidden">
                        <img 
                          src={card.image} 
                          alt={card.name} 
                          className="w-full h-full object-cover" 
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                      </div>

                      {/* Card Name & Skills */}
                      <div className="relative z-10 w-full flex flex-col items-center text-center mt-auto mb-0.5">
                        <span className={`text-[8px] font-mono font-bold leading-tight truncate max-w-full ${getTierTextColor(card.tier || 'bronze')} drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]`}>
                          {card.name}
                        </span>
                        {card.skills && card.skills.length > 0 && (
                          <div className="flex items-center gap-0.5 mt-0.5">
                            {card.skills.slice(0, 2).map((sk, idx) => (
                              <span key={idx}>{renderSkillIcon(sk.type, "w-2.5 h-2.5")}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Bottom Badges: Attack (Left) & Health (Right) */}
                      <div className="w-full flex items-center justify-between z-10 shrink-0">
                        {/* ATK */}
                        <div className="flex items-center gap-0.5 bg-black/80 px-1 py-0.5 rounded border border-red-500/50 shadow-sm">
                          <img src="/icons/gothic_attack.webp" alt="ATK" className="w-2.5 h-2.5 object-contain" />
                          <span className="text-[9px] font-mono font-black text-red-400 leading-none">{card.attack}</span>
                        </div>
                        {/* HP */}
                        <div className="flex items-center gap-0.5 bg-black/80 px-1 py-0.5 rounded border border-emerald-500/50 shadow-sm">
                          <img src="/icons/gothic_health.webp" alt="HP" className="w-2.5 h-2.5 object-contain" />
                          <span className="text-[9px] font-mono font-black text-white leading-none">{card.health}</span>
                        </div>
                      </div>

                      {/* Floating Text */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                        {floatingTexts.filter(f => typeof f.target === 'object' && f.target.side === 'player' && f.target.slot === slotIndex).map(f => (
                          <span key={f.id} className={`${f.colorClass} animate-bounce text-[10px] font-black bg-black/80 px-1 rounded`}>
                            {f.text}
                          </span>
                        ))}
                      </div>
                    </>
                  ) : canPlaceHere ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                      <span className="text-[8px] font-mono font-bold text-emerald-300 leading-tight">
                        TAP TO PLACE
                      </span>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-25">
                      <span className="text-[9px] font-mono text-gray-500">#{slotIndex + 1}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

        {/* ----------------- BOTTOM BAR: HEARTHSTONE STYLE DOCK ----------------- */}
        <div className="w-full flex items-center justify-between z-30 px-2 py-1 shrink-0 bg-gradient-to-t from-black via-black/80 to-transparent">
          
          {/* Deck Count */}
          <div className="flex items-center gap-1 bg-black/60 border border-white/10 px-2 py-1 rounded text-[9px] font-mono text-gray-400">
            <span>DECK:</span>
            <span className="text-white font-bold">{battle.playerDeckQueue?.length || 0}</span>
          </div>

          {/* Hearthstone Hand Tray Drawer Launcher or Placement Banner */}
          {selectedHandCard ? (
            /* PLACEMENT ACTIVE BANNER — ALL 5 SLOTS ARE TOTALLY UNOBSTRUCTED */
            <div className="flex items-center gap-2 bg-gradient-to-r from-amber-950/90 via-black to-amber-950/90 border border-amber-500/60 px-3 py-1 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <span className="text-[10px] font-mono text-amber-300 font-bold">
                Placing: <span className="text-white">{selectedHandCard.name}</span> ({selectedHandCard.manaCost || 1}💧)
              </span>
              <button
                onClick={() => setSelectedHandCardId(null)}
                className="bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-300 hover:text-white px-2 py-0.5 rounded-full text-[9px] font-mono font-bold transition-all active:scale-95 cursor-pointer ml-1"
              >
                ✕ Cancel
              </button>
            </div>
          ) : (
            /* COLLAPSED HAND TRAY BUTTON */
            <button
              onClick={() => setIsHandOpen(true)}
              disabled={isSimulating}
              className={`flex items-center gap-2 bg-gradient-to-r from-black/90 via-[#151a24] to-black/90 border border-[#ebd09b]/50 hover:border-[#ebd09b] px-3.5 py-1.5 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.8)] transition-all cursor-pointer active:scale-95 ${
                isSimulating ? 'opacity-40 pointer-events-none' : ''
              }`}
            >
              <div className="flex items-center gap-1 text-[#ebd09b] font-display font-bold text-[10px] tracking-wider">
                <span>🎴 HAND ({battle.playerHand.length})</span>
              </div>
              <div className="h-3 w-px bg-white/20" />
              <div className="flex items-center gap-1 text-cyan-300 font-mono text-[10px] font-bold">
                <Droplet className="w-2.5 h-2.5 fill-cyan-400" />
                <span>{battle.playerMana}/{battle.playerMaxMana}</span>
              </div>
              <ChevronUp className="w-3 h-3 text-amber-400" />
            </button>
          )}

          {/* End Turn Button */}
          <button
            onClick={handleEndTurnWithoutCard}
            disabled={isSimulating || isAnimating}
            className={`px-3 py-1.5 rounded-xl font-display font-black text-[10px] sm:text-[11px] tracking-wider transition-all shadow-lg active:scale-95 cursor-pointer ${
              isSimulating || isAnimating
                ? 'bg-zinc-800 text-gray-500 border border-zinc-700 pointer-events-none'
                : 'bg-gradient-to-r from-[#c5a880] to-[#ebd09b] hover:from-[#ebd09b] hover:to-white text-black border border-[#ebd09b] shadow-[0_0_15px_rgba(235,208,155,0.4)] animate-pulse'
            }`}
          >
            {isSimulating || isAnimating ? 'BATTLING...' : 'END TURN ⚔️'}
          </button>
        </div>

      </main>

      {/* =========================================================================
          3. HEARTHSTONE STYLE EXPANDABLE HAND DRAWER
          Cards are shown large, clear, with full stats & skills. Tapping selects a card and closes drawer.
         ========================================================================= */}
      {isHandOpen && (
        <div 
          onClick={() => setIsHandOpen(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex flex-col justify-end p-2 sm:p-4 animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl mx-auto bg-gradient-to-t from-[#0a0d14] via-[#121622] to-[#0a0d14] border-t border-[#ebd09b]/50 rounded-t-2xl p-3 flex flex-col shadow-[0_-10px_30px_rgba(0,0,0,0.9)] max-h-[75vh]"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-xs text-[#ebd09b] tracking-wider uppercase">
                  Your Hand ({battle.playerHand.length} Cards)
                </span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800 px-2 py-0.5 rounded-full">
                  💧 Mana: {battle.playerMana}/{battle.playerMaxMana}
                </span>
              </div>
              <button
                onClick={() => setIsHandOpen(false)}
                className="text-gray-400 hover:text-white bg-white/10 hover:bg-white/20 p-1 rounded-full text-xs transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Hand Cards Fan / Carousel */}
            {battle.playerHand.length === 0 ? (
              <div className="py-8 text-center text-gray-500 font-mono text-xs">
                No cards in hand. End turn to draw cards from your deck!
              </div>
            ) : (
              <div className="flex items-center gap-2 overflow-x-auto py-2 px-1 custom-scrollbar">
                {battle.playerHand.map((card) => {
                  const cost = card.manaCost || 1;
                  const canAfford = battle.playerMana >= cost;

                  return (
                    <div
                      key={card.id}
                      onClick={() => {
                        if (!canAfford) {
                          toast(`Not enough mana! Needs ${cost}💧`, 'error');
                          return;
                        }
                        setSelectedHandCardId(card.id);
                        setIsHandOpen(false); // Close drawer immediately so the full board is visible to place!
                      }}
                      className={`relative shrink-0 w-[100px] h-[146px] rounded-xl border flex flex-col justify-between p-1.5 transition-all select-none cursor-pointer overflow-hidden ${
                        getTierBorderColor(card.tier || 'bronze')
                      } bg-gradient-to-b ${getTierBgGradient(card.tier || 'bronze')} ${
                        canAfford 
                          ? 'hover:scale-105 hover:-translate-y-1 shadow-[0_0_12px_rgba(235,208,155,0.4)]' 
                          : 'opacity-50 grayscale'
                      }`}
                    >
                      {/* Top Row: Mana & Delay */}
                      <div className="w-full flex items-center justify-between z-10 shrink-0">
                        {renderManaIcon(cost, "w-4 h-4")}
                        <div className="flex items-center gap-0.5 bg-black/80 px-1.5 py-0.5 rounded border border-amber-500/50">
                          <img src="/icons/gothic_hourglass.webp" alt="Delay" className="w-3 h-3 object-contain" />
                          <span className={`text-[9px] font-mono font-black ${card.delay === 0 ? 'text-emerald-400' : 'text-amber-300'}`}>
                            {card.delay}
                          </span>
                        </div>
                      </div>

                      {/* Card Image */}
                      <div className="absolute inset-0 w-full h-full opacity-50 z-0">
                        <img 
                          src={card.image} 
                          alt={card.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                      </div>

                      {/* Card Info */}
                      <div className="relative z-10 w-full flex flex-col items-center text-center mt-auto mb-1">
                        <span className={`text-[9px] font-mono font-bold leading-tight truncate max-w-full ${getTierTextColor(card.tier || 'bronze')} drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]`}>
                          {card.name}
                        </span>
                        {card.skills && card.skills.length > 0 && (
                          <div className="flex items-center gap-1 mt-0.5">
                            {card.skills.map((sk, idx) => (
                              <span key={idx} className="flex items-center gap-0.5 text-[7px] font-mono bg-black/80 px-1 rounded text-gray-300">
                                {renderSkillIcon(sk.type, "w-2.5 h-2.5")}
                                {sk.value}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Bottom Badges: ATK & HP */}
                      <div className="w-full flex items-center justify-between z-10 shrink-0">
                        <div className="flex items-center gap-0.5 bg-black/90 px-1 py-0.5 rounded border border-red-500/60">
                          <img src="/icons/gothic_attack.webp" alt="ATK" className="w-3 h-3 object-contain" />
                          <span className="text-[10px] font-mono font-black text-red-400 leading-none">{card.attack}</span>
                        </div>
                        <div className="flex items-center gap-0.5 bg-black/90 px-1 py-0.5 rounded border border-emerald-500/60">
                          <img src="/icons/gothic_health.webp" alt="HP" className="w-3 h-3 object-contain" />
                          <span className="text-[10px] font-mono font-black text-white leading-none">{card.health}</span>
                        </div>
                      </div>

                      {/* Prompt */}
                      <div className="absolute inset-x-0 bottom-0 py-0.5 bg-amber-500/90 text-black text-[8px] font-mono font-bold text-center z-20">
                        {canAfford ? 'TAP TO CHOOSE' : 'NEED MANA'}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Instruction */}
            <div className="pt-2 text-center text-[10px] font-mono text-gray-400">
              💡 Tapping a card closes this tray and lets you place it freely on any empty board slot.
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          4. RULES CODEX MODAL — HIGH CONTRAST & EASY TO CLOSE
         ========================================================================= */}
      {showHelpModal && (
        <div 
          onClick={() => setShowHelpModal(false)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-3 animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#12161f] border border-[#ebd09b]/50 rounded-2xl max-w-xl w-full shadow-[0_0_50px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-2.5 bg-gradient-to-r from-black/85 via-[#1a1f2c] to-black/85 border-b border-[#ebd09b]/25 shrink-0">
              <div className="flex items-center gap-2">
                <Swords className="w-4 h-4 text-[#ebd09b]" />
                <h3 className="font-display font-black text-xs sm:text-sm text-[#ebd09b] tracking-wider uppercase">
                  Combat Rules & Tactics
                </h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-white bg-red-950/90 hover:bg-red-900 border border-red-500 rounded-lg w-7 h-7 flex items-center justify-center transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-800 bg-black/50 shrink-0 text-xs font-mono">
              {[
                { id: 'basics', label: '1. Basics & Delays' },
                { id: 'skills', label: '2. Skills Codex' },
                { id: 'defense', label: '3. Shields & Mana' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setHelpTab(tab.id as any)}
                  className={`flex-1 py-2 text-center transition-all cursor-pointer font-bold ${
                    helpTab === tab.id 
                      ? 'border-b-2 border-[#ebd09b] text-[#ebd09b] bg-[#ebd09b]/10' 
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Scrollable Content */}
            <div className="p-3 text-xs text-gray-300 overflow-y-auto custom-scrollbar flex-1 space-y-2">
              {helpTab === 'basics' && (
                <>
                  <div className="p-2 rounded bg-black/40 border border-gray-800">
                    <span className="font-bold text-[#ebd09b] block mb-1">⏳ Delays & Attack Order</span>
                    <p className="text-gray-400 text-[11px] leading-relaxed">
                      Creatures do not attack on the turn they are summoned if their delay is &gt; 0. At the start of each turn, delays decrement by 1. Once a delay hits 0, the creature strikes the opponent slot directly across from it!
                    </p>
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-gray-800">
                    <span className="font-bold text-[#ebd09b] block mb-1">⚡ Breakthrough Damage</span>
                    <p className="text-gray-400 text-[11px] leading-relaxed">
                      If an attacking creature faces an empty opposing slot, it attacks the enemy Commander directly, reducing their HP!
                    </p>
                  </div>
                </>
              )}

              {helpTab === 'skills' && (
                <>
                  <div className="p-2 rounded bg-black/40 border border-gray-800 flex items-start gap-2">
                    {renderSkillIcon('vampirism', 'w-4 h-4')}
                    <div>
                      <span className="font-bold text-rose-400 text-[11px] block">Vampirism</span>
                      <p className="text-gray-400 text-[10px]">Heals the creature for a percentage of damage dealt upon striking.</p>
                    </div>
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-gray-800 flex items-start gap-2">
                    {renderSkillIcon('plague', 'w-4 h-4')}
                    <div>
                      <span className="font-bold text-emerald-400 text-[11px] block">Plague</span>
                      <p className="text-gray-400 text-[10px]">Infects opposing target each turn with toxic miasma ignoring standard defense.</p>
                    </div>
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-gray-800 flex items-start gap-2">
                    {renderSkillIcon('sacrifice', 'w-4 h-4')}
                    <div>
                      <span className="font-bold text-red-400 text-[11px] block">Sacrifice</span>
                      <p className="text-gray-400 text-[10px]">Destroys a random ally on placement, healing the Commander and boosting attack.</p>
                    </div>
                  </div>
                </>
              )}

              {helpTab === 'defense' && (
                <>
                  <div className="p-2 rounded bg-black/40 border border-gray-800">
                    <span className="font-bold text-cyan-400 block mb-1">🛡️ Armor & Barriers</span>
                    <p className="text-gray-400 text-[11px] leading-relaxed">
                      Armor absorbs incoming physical damage point-by-point. Barriers completely nullify the next instance of attack damage.
                    </p>
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-gray-800">
                    <span className="font-bold text-cyan-400 block mb-1">💧 Mana Crystal Economy</span>
                    <p className="text-gray-400 text-[11px] leading-relaxed">
                      You start with 1 Mana Crystal and gain +1 max crystal each round (up to 10). Strategically save mana for legendary and divine cards!
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-2.5 bg-black/85 border-t border-gray-800 shrink-0">
              <button
                onClick={() => setShowHelpModal(false)}
                className="w-full bg-gradient-to-r from-[#c5a880] to-[#ebd09b] text-black font-display font-black py-2 rounded-xl text-xs tracking-widest cursor-pointer active:scale-98"
              >
                ⚔️ UNDERSTOOD, TO BATTLE!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. COMBAT LOG DRAWER
         ========================================================================= */}
      {showLogDrawer && (
        <div 
          onClick={() => setShowLogDrawer(false)}
          className="fixed inset-0 z-50 bg-black/80 flex justify-end animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm h-full bg-[#0d1017] border-l border-[#ebd09b]/30 p-3 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
              <span className="font-display font-black text-xs text-[#ebd09b]">COMBAT LOG</span>
              <button onClick={() => setShowLogDrawer(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar text-[10px] font-mono text-gray-300">
              {visualState.combatLog.length === 0 ? (
                <div className="text-gray-500 text-center py-6">No battle events yet.</div>
              ) : (
                visualState.combatLog.map((line, idx) => (
                  <div key={idx} className="p-1.5 rounded bg-black/40 border border-white/5">
                    {line}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          6. VICTORY / DEFEAT MODAL
         ========================================================================= */}
      {(battle.phase === 'player_won' || battle.phase === 'player_lost') && !isAnimating && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
          <div className="bg-[#12161f] border border-[#ebd09b]/60 rounded-2xl max-w-sm w-full p-5 text-center shadow-[0_0_60px_rgba(0,0,0,0.95)] flex flex-col items-center">
            {battle.phase === 'player_won' ? (
              <>
                <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                  <Trophy className="w-8 h-8 text-amber-400" />
                </div>
                <h2 className="font-display font-black text-xl text-[#ebd09b] uppercase tracking-wider mb-1">
                  VICTORY ACHIEVED!
                </h2>
                <p className="text-xs text-gray-400 font-mono mb-4">
                  The darkness retreats before your might.
                </p>

                {/* Rewards Grid */}
                <div className="grid grid-cols-3 gap-2 w-full mb-4 bg-black/50 p-2.5 rounded-xl border border-white/10">
                  <div className="flex flex-col items-center">
                    <img src="/icons/icon_gold.webp" alt="Gold" className="w-5 h-5 mb-0.5 object-contain" />
                    <span className="text-xs font-mono font-bold text-amber-400">+{earnedGold}</span>
                    <span className="text-[8px] font-mono text-gray-500">GOLD</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <img src="/icons/icon_dust.webp" alt="Dust" className="w-5 h-5 mb-0.5 object-contain" />
                    <span className="text-xs font-mono font-bold text-cyan-400">+{earnedDust}</span>
                    <span className="text-[8px] font-mono text-gray-500">DUST</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Zap className="w-5 h-5 text-purple-400 mb-0.5" />
                    <span className="text-xs font-mono font-bold text-purple-300">+{earnedExp}</span>
                    <span className="text-[8px] font-mono text-gray-500">EXP</span>
                  </div>
                </div>

                <button
                  onClick={() => onExitBattle(true)}
                  className="w-full bg-gradient-to-r from-[#c5a880] to-[#ebd09b] hover:from-[#ebd09b] hover:to-white text-black font-display font-black py-2.5 rounded-xl text-xs tracking-widest transition-all shadow-[0_0_20px_rgba(235,208,155,0.4)] cursor-pointer active:scale-98"
                >
                  CLAIM REWARDS & CONTINUE
                </button>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                  <Skull className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="font-display font-black text-xl text-red-500 uppercase tracking-wider mb-1">
                  DEFEAT
                </h2>
                <p className="text-xs text-gray-400 font-mono mb-4">
                  Your forces were consumed by the Void.
                </p>

                <button
                  onClick={() => onExitBattle(false)}
                  className="w-full bg-red-950 hover:bg-red-900 border border-red-500/60 text-white font-display font-black py-2.5 rounded-xl text-xs tracking-widest transition-all cursor-pointer active:scale-98"
                >
                  RETURN TO ARENA
                </button>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
