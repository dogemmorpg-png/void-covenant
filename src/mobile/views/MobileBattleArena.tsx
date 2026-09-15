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
  HelpCircle, 
  ArrowLeft, 
  Pause, 
  Play, 
  Scroll, 
  X,
  Droplet,
  Trophy,
  Star,
  Hourglass
} from 'lucide-react';

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

// Card tier styling helpers
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

const getSkillBadgeStyle = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'vampirism': return 'bg-red-950/90 text-red-300 border-red-500/50';
    case 'hex': return 'bg-purple-950/90 text-purple-300 border-purple-500/50';
    case 'plague': return 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50';
    case 'sacrifice': return 'bg-red-900/90 text-red-200 border-red-400/50';
    default: return 'bg-amber-950/90 text-amber-300 border-amber-500/50';
  }
};

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

const renderManaIcon = (cost: number, sizeClass: string = "w-4 h-4") => {
  return (
    <div className={`relative ${sizeClass} shrink-0 flex items-center justify-center`}>
      <svg className="absolute inset-0 w-full h-full drop-shadow-[0_0_4px_rgba(6,182,212,0.85)]" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L4 7v10l8 5 8-5V7l-8-5z" fill="url(#manaCrystalGradVertical)" stroke="#66fcf1" strokeWidth="1.5" />
        <path d="M12 2L4 7l8 5 8-5-8-5z" fill="#66fcf1" opacity="0.35" />
        <defs>
          <radialGradient id="manaCrystalGradVertical" cx="50%" cy="50%" r="50%">
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

  // Battle State Initialization (Exact matching signature)
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

  const initialBaseGold = stage.goldReward || (battleType === 'pvp' ? 50 : 50);
  const [earnedGold, setEarnedGold] = useState<number>(() => applyRewardMultiplier(initialBaseGold, battleGoldMultiplier));
  const [earnedDust, setEarnedDust] = useState<number>(() => stage.dustReward || (battleType === 'pvp' ? 25 : 25));
  const initialBaseExp = battleType === 'pvp' ? 100 : ((stage.id || 1) * 16 + 32);
  const [earnedExp, setEarnedExp] = useState<number>(() => initialBaseExp);

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

  // Combat Step Runner (60fps lightweight state machine)
  useEffect(() => {
    if (currentStepIndex === -1 || currentStepIndex >= animateSequence.length || isPaused) return;

    const step = animateSequence[currentStepIndex];
    let stepDescription = '';

    const strikeDuration = Math.round(600 / effectiveSpeed);
    const impactDelay = Math.round(280 / effectiveSpeed);
    let stepDuration = Math.round(750 / effectiveSpeed);

    if (step.type === 'enemy_play') stepDuration = Math.round(650 / effectiveSpeed);
    else if (step.type === 'death') stepDuration = Math.round(350 / effectiveSpeed);

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    switch (step.type) {
      case 'sacrifice': {
        stepDescription = '💀 Sacrifice: Ally surrendered for strength!';
        addFloatingText('💀 SACRIFICE', { side: 'player', slot: step.targetSlot }, 'text-red-500 font-black text-xs');
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
        }, Math.round(300 / effectiveSpeed));
        timeouts.push(tSacr);
        break;
      }

      case 'enemy_play': {
        stepDescription = `😈 Dark Summon: Lord summons ${step.card.name}`;
        addFloatingText('SUMMON', { side: 'enemy', slot: step.slot }, 'text-[#ebd09b] font-black text-xs');
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
        stepDescription = `💥 Direct Hit: ${attackerCard?.name || 'Creature'} deals -${step.damage} to Commander!`;
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
        stepDescription = `💚 Recovery: Commander heals +${step.heal} HP!`;
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
        stepDescription = `📣 Warlord Warcry: Squad strengthened (+${step.buffAtk} ATK / +${step.buffHp} HP)`;
        addFloatingText('WARCRY! ⚔️', step.side === 'player' ? 'player-hero' : 'enemy-hero', 'text-yellow-400 font-black text-xs');
        break;
      }

      case 'plague': {
        const defSide = step.sourceSide === 'player' ? 'enemy' : 'player';
        stepDescription = `🦠 Plague: Poison miasma strikes target (-${step.damage} HP)`;
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
        stepDescription = `🛡️ Evaded: ${isEnemy ? 'Enemy Lord' : 'Your Lord'} dodged the blow!`;
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
        }, Math.round(200 / effectiveSpeed));
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
      setIsSimulating(false);
      setIsAnimating(false);
      setCurrentStepIndex(-1);
      setActiveLogStepText('');
      setAttackerAction(null);
      setDefenderAction(null);
    }
  }, [currentStepIndex, animateSequence, finalBattleState]);

  // Handle playing card from hand
  const handlePlayCard = (slotIndex: number) => {
    if (!selectedHandCardId) return;
    if (battle.playerBoard[slotIndex] !== null) return;

    const cardToPlay = battle.playerHand.find(c => c.id === selectedHandCardId);
    if (!cardToPlay) return;

    const newBattleState = placeCardLocally(battle, selectedHandCardId, slotIndex);
    if (newBattleState !== battle) {
      addFloatingText('SUMMON', { side: 'player', slot: slotIndex }, 'text-[#ebd09b] font-black text-xs');
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

  // Victory / Defeat submission
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

  const selectedHandCard = visualState.playerHand.find(c => c.id === selectedHandCardId);

  return (
    <div className="relative w-full h-[100dvh] max-h-[100dvh] bg-[#070504] text-white flex flex-col justify-between overflow-hidden select-none font-sans">
      
      {/* =========================================================================
          1. TELEGRAM TOP SAFE HEADER (Clears Close '✕' on left and Menu '⋮' on right)
         ========================================================================= */}
      <header 
        style={{
          paddingLeft: 'max(4.75rem, env(safe-area-inset-left, 4.75rem))',
          paddingRight: 'max(4.75rem, env(safe-area-inset-right, 4.75rem))'
        }}
        className="h-[36px] bg-[#0c0e14]/95 backdrop-blur-md border-b border-[#ebd09b]/20 flex items-center justify-between px-2 shrink-0 z-40 relative"
      >
        {/* Left: Escape Button */}
        <button
          onClick={() => onExitBattle(false)}
          className="flex items-center gap-1 bg-red-950/70 hover:bg-red-900 border border-red-500/50 text-red-300 hover:text-white px-2 py-1 rounded text-[9.5px] font-mono font-bold transition-all active:scale-95 cursor-pointer shadow-sm shrink-0"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>ESCAPE</span>
        </button>

        {/* Center: Stage Name or Combat Log Step */}
        <div className="flex items-center justify-center flex-1 mx-2 overflow-hidden">
          {activeLogStepText ? (
            <div className="bg-amber-950/90 border border-amber-500/60 text-amber-200 px-3 py-0.5 rounded-full text-[10px] font-mono font-black truncate max-w-full shadow-[0_0_12px_rgba(245,158,11,0.4)] animate-pulse">
              {activeLogStepText}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-[#ebd09b] text-[11px] tracking-wider uppercase truncate drop-shadow">
                {stage.name || `ABYSS FLOOR ${stage.id}`}
              </span>
              <span className="bg-black/60 border border-[#ebd09b]/30 text-amber-300 font-mono text-[9px] px-1.5 py-0.5 rounded font-black">
                TURN {visualState.turn || 1}
              </span>
            </div>
          )}
        </div>

        {/* Right Controls: Speed, Pause, Rules, Log */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setSpeedMultiplier(prev => (prev === 1 ? 2 : prev === 2 ? 3 : 1))}
            className="bg-black/60 border border-white/15 hover:border-amber-400 text-amber-300 font-mono font-black text-[9px] px-1.5 py-1 rounded transition-all active:scale-95 cursor-pointer"
            title="Speed"
          >
            {speedMultiplier}x
          </button>

          <button
            onClick={() => setIsPaused(prev => !prev)}
            className={`p-1 rounded border transition-all active:scale-95 cursor-pointer ${
              isPaused 
                ? 'bg-amber-500/20 border-amber-500 text-amber-300' 
                : 'bg-black/60 border-white/15 text-gray-400 hover:text-white'
            }`}
            title={isPaused ? "Resume" : "Pause"}
          >
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          </button>

          <button
            onClick={() => setShowHelpModal(true)}
            className="bg-black/60 hover:bg-[#1a1f2c] border border-white/15 text-[#ebd09b] px-1.5 py-1 rounded text-[9px] font-mono font-bold transition-all active:scale-95 cursor-pointer"
            title="Rules"
          >
            <HelpCircle className="w-3 h-3" />
          </button>

          <button
            onClick={() => setShowLogDrawer(prev => !prev)}
            className="bg-black/60 hover:bg-[#1a1f2c] border border-white/15 text-zinc-300 px-1.5 py-1 rounded text-[9px] font-mono font-bold transition-all active:scale-95 cursor-pointer"
            title="Combat Log"
          >
            <Scroll className="w-3 h-3" />
          </button>
        </div>
      </header>

      {/* =========================================================================
          2. ENEMY LORD BAR (Personal HP Bar & Personal Mana, with bonuses)
         ========================================================================= */}
      <div className="bg-gradient-to-b from-[#140d18] to-[#0a080d] px-3 py-1.5 border-b border-white/5 flex items-center justify-between shrink-0 z-20 relative">
        <div className="flex items-center gap-2">
          <div className="relative w-9 h-9 rounded-full border-2 border-red-500/70 overflow-hidden bg-zinc-900 shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.4)]">
            <img 
              src={stage.enemyHeroImage || "/portraits/boss_default.webp"} 
              alt="Enemy Lord" 
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-xs text-red-400">
                {stage.enemyHeroName || 'Abyssal Lord'}
              </span>
              <span className="text-[8px] font-mono font-bold bg-red-950 text-red-300 px-1 rounded border border-red-500/30">
                ENEMY
              </span>
            </div>
            {/* HP Bar */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-28 h-2 bg-zinc-900 rounded-full overflow-hidden border border-red-950">
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
        <div className="absolute top-2 left-1/3 pointer-events-none flex flex-col items-center">
          {floatingTexts.filter(f => f.target === 'enemy-hero').map(f => (
            <span key={f.id} className={`${f.colorClass} animate-bounce font-black`}>
              {f.text}
            </span>
          ))}
        </div>

        {/* Enemy Personal Mana */}
        <div className="text-right font-mono bg-black/60 px-2 py-1 rounded-lg border border-red-500/30">
          <span className="text-[8px] text-zinc-400 block uppercase leading-none">ENEMY MANA</span>
          <span className="text-xs font-black text-cyan-300 flex items-center gap-1 justify-end leading-tight mt-0.5">
            <span>💎</span> {visualState.enemyMana} / {visualState.enemyMaxMana}
          </span>
        </div>
      </div>

      {/* =========================================================================
          3. ARENA PLAYFIELD (5 VS 5 BOARD + CENTRAL GOTHIC CLASH LANE)
         ========================================================================= */}
      <main className="flex-1 flex flex-col justify-between p-2 overflow-hidden relative min-h-0">
        
        {/* Ambient Dark Gothic Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(235,208,155,0.04)_0%,transparent_70%)] pointer-events-none" />

        {/* ROW 1: ENEMY SQUAD (5 SLOTS — Height 110px) */}
        <div>
          <div className="flex items-center justify-between px-1 mb-1 text-[8.5px] font-mono text-zinc-500 uppercase tracking-wider">
            <span>ENEMY FRONT (5 SLOTS)</span>
            <span>QUEUE: {visualState.enemyDeckSize || visualState.enemyHand.length} REMAINING</span>
          </div>

          <div className="grid grid-cols-5 gap-1.5 w-full" id="enemy-board">
            {visualState.enemyBoard.map((card, slotIndex) => {
              const isAttacking = attackerAction?.side === 'enemy' && attackerAction?.slot === slotIndex;
              const isDefending = defenderAction?.side === 'enemy' && defenderAction?.slot === slotIndex;
              const isDead = isDefending && defenderAction?.type === 'death';

              return (
                <div
                  key={`enemy-slot-${slotIndex}`}
                  onClick={() => card && setInspectCardData(card)}
                  className={`relative h-[108px] sm:h-[114px] rounded-xl border flex flex-col justify-between p-1 select-none overflow-visible transition-all cursor-pointer ${
                    card 
                      ? `${getTierBorderColor(card.tier)} bg-[#151a21]` 
                      : 'border-dashed border-zinc-800/80 bg-black/30'
                  } ${isAttacking ? 'translate-y-2 scale-105 z-30 shadow-red-500/50 shadow-lg' : ''} ${
                    isDefending && !isDead ? 'animate-shake z-20 border-red-500' : ''
                  } ${isDead ? 'opacity-20 scale-90' : ''}`}
                >
                  {/* Floating texts on this slot */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-none z-30 flex flex-col items-center">
                    {floatingTexts.filter(f => typeof f.target === 'object' && f.target.side === 'enemy' && f.target.slot === slotIndex).map(f => (
                      <span key={f.id} className={`${f.colorClass} animate-bounce font-black whitespace-nowrap`}>
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
                      </div>

                      {/* Top Row: Tier badge + Cast Delay Timer */}
                      <div className="flex justify-between items-center z-10 relative">
                        <span className={`text-[8px] font-mono font-black uppercase ${getTierTextColor(card.tier)}`}>
                          {card.tier ? card.tier.substring(0, 3) : 'BRZ'}
                        </span>
                        <div className="flex items-center gap-0.5 bg-black/85 px-1 py-0.5 rounded border border-purple-500/50 shadow">
                          <img src="/icons/gothic_hourglass.webp" alt="Timer" className="w-2.5 h-2.5 object-contain" />
                          <span className={`text-[8px] font-mono font-black ${card.delay === 0 ? 'text-emerald-400' : 'text-purple-300'}`}>
                            {card.delay}
                          </span>
                        </div>
                      </div>

                      {/* Middle: Skill chips */}
                      <div className="z-10 relative flex justify-center gap-1 mt-auto mb-1">
                        {card.skills && card.skills.length > 0 && (
                          <div className={`flex items-center gap-0.5 text-[8px] font-mono font-black px-1 rounded-full border ${getSkillBadgeStyle(card.skills[0].type)}`}>
                            {renderSkillIcon(card.skills[0].type, "w-2.5 h-2.5")}
                            <span>{card.skills[0].value}</span>
                          </div>
                        )}
                      </div>

                      {/* Bottom Badges: Gothic Attack & Health */}
                      <div className="absolute -bottom-2 -left-2 w-7 h-7 z-20 flex items-center justify-center pointer-events-none">
                        <img src="/icons/gothic_attack.webp" alt="ATK" className="absolute inset-0 w-full h-full object-cover rounded shadow" />
                        <span className="relative text-[#ff3b30] text-xs font-black font-mono leading-none z-10 text-shadow-badge">
                          {card.attack}
                        </span>
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-7 h-7 z-20 flex items-center justify-center pointer-events-none">
                        <img src="/icons/gothic_health.webp" alt="HP" className="absolute inset-0 w-full h-full object-cover rounded shadow" />
                        <span className="relative text-white text-xs font-black font-mono leading-none z-10 text-shadow-badge">
                          {card.health}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-700 font-mono text-[9px]">
                      <span>#{slotIndex + 1}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTRAL GOTHIC CLASH LANE (Informative & Atmospheric) */}
        <div className="my-1.5 py-1.5 px-3 rounded-xl bg-gradient-to-r from-black/90 via-[#18121d]/95 to-black/90 border border-[#ebd09b]/30 flex items-center justify-between shrink-0 shadow-lg relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-1 bg-amber-500" />
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/60 flex items-center justify-center text-xs text-amber-300 shrink-0">
              ⚔️
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-[11px] text-[#ebd09b] tracking-wide uppercase">
                  {visualState.phase === 'combat_simulation' ? 'COMBAT DUEL' : `TURN ${visualState.turn || 1} • DEPLOY`}
                </span>
                <span className={`text-[8px] font-mono px-1 rounded border font-bold ${
                  visualState.phase === 'combat_simulation' 
                    ? 'bg-red-950 text-red-300 border-red-500/40' 
                    : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                }`}>
                  {visualState.phase === 'combat_simulation' ? 'FIGHTING' : 'ACTIVE'}
                </span>
              </div>
              <p className="text-[9px] font-mono text-zinc-400 leading-tight truncate">
                {selectedHandCardId 
                  ? `Selected: ${selectedHandCard?.name} • Tap empty slot to deploy` 
                  : 'Tap card in hand to deploy onto battlefield'}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0 font-mono">
            <span className="text-[8px] text-zinc-500 block leading-none">DECK</span>
            <span className="text-[10px] font-bold text-gray-300">
              {visualState.playerDeckSize || visualState.playerDeckQueue?.length || 0} left
            </span>
          </div>
        </div>

        {/* ROW 2: PLAYER SQUAD (5 SLOTS — Height 110px, Glowing Playable Slots) */}
        <div>
          <div className="flex items-center justify-between px-1 mb-1 text-[8.5px] font-mono text-zinc-500 uppercase tracking-wider">
            <span>YOUR SQUAD (5 SLOTS)</span>
            <span className="text-amber-400/90 font-mono">
              {selectedHandCardId ? 'TAP GLOWING SLOT TO DEPLOY' : 'CARDS IN DEPLOYMENT'}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5 w-full" id="player-board">
            {visualState.playerBoard.map((card, slotIndex) => {
              const isAttacking = attackerAction?.side === 'player' && attackerAction?.slot === slotIndex;
              const isDefending = defenderAction?.side === 'player' && defenderAction?.slot === slotIndex;
              const isDead = isDefending && defenderAction?.type === 'death';
              const canPlayHere = selectedHandCardId && card === null && !isSimulating && !isAnimating;

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
                  className={`relative h-[108px] sm:h-[114px] rounded-xl border flex flex-col justify-between p-1 select-none overflow-visible transition-all cursor-pointer ${
                    card 
                      ? `${getTierBorderColor(card.tier)} bg-[#151a21]` 
                      : canPlayHere
                        ? 'border-[#66fcf1] bg-cyan-950/20 shadow-[0_0_15px_rgba(102,252,241,0.4)] animate-pulse'
                        : 'border-dashed border-zinc-700 bg-black/40 hover:border-amber-400/50'
                  } ${isAttacking ? '-translate-y-2 scale-105 z-30 shadow-amber-500/50 shadow-lg' : ''} ${
                    isDefending && !isDead ? 'animate-shake z-20 border-red-500' : ''
                  } ${isDead ? 'opacity-20 scale-90' : ''}`}
                >
                  {/* Floating texts on this slot */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-none z-30 flex flex-col items-center">
                    {floatingTexts.filter(f => typeof f.target === 'object' && f.target.side === 'player' && f.target.slot === slotIndex).map(f => (
                      <span key={f.id} className={`${f.colorClass} animate-bounce font-black whitespace-nowrap`}>
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
                      </div>

                      {/* Top Row: Tier badge + Cast Delay Timer */}
                      <div className="flex justify-between items-center z-10 relative">
                        <span className={`text-[8px] font-mono font-black uppercase ${getTierTextColor(card.tier)}`}>
                          {card.tier ? card.tier.substring(0, 3) : 'BRZ'}
                        </span>
                        <div className="flex items-center gap-0.5 bg-black/85 px-1 py-0.5 rounded border border-emerald-500/50 shadow">
                          <img src="/icons/gothic_hourglass.webp" alt="Timer" className="w-2.5 h-2.5 object-contain" />
                          <span className={`text-[8px] font-mono font-black ${card.delay === 0 ? 'text-emerald-400' : 'text-amber-300'}`}>
                            {card.delay}
                          </span>
                        </div>
                      </div>

                      {/* Middle: Skill chips */}
                      <div className="z-10 relative flex justify-center gap-1 mt-auto mb-1">
                        {card.skills && card.skills.length > 0 && (
                          <div className={`flex items-center gap-0.5 text-[8px] font-mono font-black px-1 rounded-full border ${getSkillBadgeStyle(card.skills[0].type)}`}>
                            {renderSkillIcon(card.skills[0].type, "w-2.5 h-2.5")}
                            <span>{card.skills[0].value}</span>
                          </div>
                        )}
                      </div>

                      {/* Bottom Badges: Gothic Attack & Health */}
                      <div className="absolute -bottom-2 -left-2 w-7 h-7 z-20 flex items-center justify-center pointer-events-none">
                        <img src="/icons/gothic_attack.webp" alt="ATK" className="absolute inset-0 w-full h-full object-cover rounded shadow" />
                        <span className="relative text-[#ff3b30] text-xs font-black font-mono leading-none z-10 text-shadow-badge">
                          {card.attack}
                        </span>
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-7 h-7 z-20 flex items-center justify-center pointer-events-none">
                        <img src="/icons/gothic_health.webp" alt="HP" className="absolute inset-0 w-full h-full object-cover rounded shadow" />
                        <span className="relative text-white text-xs font-black font-mono leading-none z-10 text-shadow-badge">
                          {card.health}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-600 font-mono text-[9px]">
                      {canPlayHere ? (
                        <span className="text-[#66fcf1] font-bold text-xs animate-bounce">+</span>
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
          4. PLAYER LORD COMMAND BAR (HP, Demiurge-bonused Mana, End Turn Button)
         ========================================================================= */}
      <div className="bg-gradient-to-t from-[#141019] to-[#0a080d] px-3 py-1.5 border-t border-amber-500/20 flex items-center justify-between shrink-0 z-20 relative">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full border-2 border-emerald-500/70 overflow-hidden bg-zinc-900 shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.4)]">
            <img 
              src={profile?.avatarUrl || "/portraits/avatar_default.webp"} 
              alt="Player Lord" 
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-xs text-amber-200 truncate max-w-[120px]">
                {profile?.username || 'Lord'}
              </span>
              <span className="text-[8px] font-mono font-bold bg-amber-950 text-amber-300 px-1 rounded border border-amber-500/30 uppercase">
                {profile?.activeStance || 'VOID STRIKE'}
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
        <div className="absolute top-2 left-1/3 pointer-events-none flex flex-col items-center">
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
            className="px-3.5 py-2 bg-gradient-to-b from-red-700 to-red-900 hover:from-red-600 text-white font-display font-black text-xs rounded-xl shadow-md border-2 border-red-500 active:scale-95 transition-all cursor-pointer"
          >
            ✕ CANCEL
          </button>
        ) : (
          <button
            disabled={isSimulating || isAnimating}
            onClick={handleEndTurnWithoutCard}
            className="px-4 py-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-400 disabled:from-zinc-800 disabled:to-zinc-900 disabled:text-zinc-600 text-black font-display font-black text-xs rounded-xl shadow-[0_0_15px_rgba(235,208,155,0.4)] active:scale-95 transition-all cursor-pointer border border-[#ebd09b]/60 disabled:border-zinc-800"
          >
            {isSimulating || isAnimating ? 'FIGHTING...' : 'END TURN ⚔️'}
          </button>
        )}
      </div>

      {/* =========================================================================
          5. PLAYER HAND (EXACTLY 3 CARDS, FULL PC PROPORTIONS 112px x 148px)
         ========================================================================= */}
      <div className="h-[175px] bg-[#050407] border-t-2 border-amber-500/30 p-2 flex flex-col justify-between shrink-0 z-30 relative">
        <div className="flex items-center justify-between px-1 text-[8.5px] font-mono text-zinc-400 uppercase font-bold tracking-wider">
          <span>YOUR HAND (3 CARDS)</span>
          <span className="text-amber-300">
            {selectedHandCardId ? 'Tap empty board slot to deploy' : 'Tap card to select'}
          </span>
        </div>

        <div className="flex gap-2.5 justify-center items-end flex-1" id="hand-cards">
          {visualState.playerHand.slice(0, 3).map((card, idx) => {
            const isSelected = selectedHandCardId === card.id;
            const canAfford = visualState.playerMana >= (card.manaCost || 1);

            return (
              <div
                key={card.id}
                onClick={() => {
                  if (isSimulating || isAnimating) return;
                  if (isSelected) {
                    setSelectedHandCardId(null);
                  } else {
                    setSelectedHandCardId(card.id);
                  }
                }}
                className={`hand-card w-[110px] sm:w-[114px] h-[146px] rounded-xl border-2 flex flex-col justify-between p-1.5 relative cursor-pointer shadow-lg overflow-visible transition-all select-none ${
                  isSelected
                    ? 'border-[#66fcf1] -translate-y-3 scale-105 shadow-[0_0_25px_rgba(102,252,241,0.8)] z-30'
                    : !canAfford
                      ? 'border-zinc-800 opacity-50 grayscale'
                      : getTierBorderColor(card.tier)
                } bg-[#151a21]`}
              >
                {/* Background Art */}
                <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none z-0">
                  <img 
                    src={card.image} 
                    alt={card.name} 
                    className={`w-full h-full object-cover ${card.delay > 0 ? 'opacity-50 filter saturate-50' : 'opacity-85'}`}
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />
                </div>

                {/* Top Row: Mana Crystal (Left) + Delay Cast Timer (Right) */}
                <div className="flex justify-between items-center z-10 relative">
                  {renderManaIcon(card.manaCost || 1, "w-5 h-5")}

                  {/* Cast Delay Timer Hourglass Badge */}
                  <div className="flex items-center gap-0.5 bg-black/90 px-1.5 py-0.5 rounded-md border border-purple-400 shadow">
                    <img src="/icons/gothic_hourglass.webp" alt="Delay" className="w-3 h-3 object-contain" />
                    <span className={`text-[9px] font-mono font-black ${card.delay === 0 ? 'text-emerald-300' : 'text-purple-300'}`}>
                      ⏳{card.delay}
                    </span>
                  </div>
                </div>

                {/* Card Name */}
                <div className="mt-0.5 z-10 relative px-1 bg-black/60 py-0.5 rounded border border-white/5 text-center">
                  <span className="text-[10px] font-display font-black text-white block truncate leading-none">
                    {card.name}
                  </span>
                </div>

                {/* Dedicated Skill Bar at bottom center */}
                <div className="w-full py-0.5 bg-black/75 border-y border-white/10 flex justify-center gap-1 z-10 relative mt-auto mb-1 flex-wrap">
                  {card.skills && card.skills.length > 0 ? (
                    card.skills.map((sk, sIdx) => (
                      <div 
                        key={sIdx}
                        className={`flex items-center gap-0.5 text-[8.5px] font-mono font-black px-1.5 rounded-full border ${getSkillBadgeStyle(sk.type)}`}
                      >
                        {renderSkillIcon(sk.type, "w-2.5 h-2.5")}
                        <span>{sk.value}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-[7.5px] font-mono text-zinc-500 uppercase">NO SKILL</span>
                  )}
                </div>

                {/* Gothic Corner Badges: Attack & Health */}
                <div className="absolute -bottom-3 -left-3 w-8 h-8 z-20 flex items-center justify-center pointer-events-none">
                  <img src="/icons/gothic_attack.webp" alt="ATK" className="absolute inset-0 w-full h-full object-cover rounded shadow-md" />
                  <span className="relative text-[#ff3b30] text-[13px] font-black font-mono leading-none z-10 text-shadow-badge">
                    {card.attack}
                  </span>
                </div>
                <div className="absolute -bottom-3 -right-3 w-8 h-8 z-20 flex items-center justify-center pointer-events-none">
                  <img src="/icons/gothic_health.webp" alt="HP" className="absolute inset-0 w-full h-full object-cover rounded shadow-md" />
                  <span className="relative text-white text-[13px] font-black font-mono leading-none z-10 text-shadow-badge">
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
          6. FULL CARD INSPECT MODAL (Pop-up on card tap with full descriptions)
         ========================================================================= */}
      {inspectCardData && (
        <div 
          onClick={() => setInspectCardData(null)}
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[300px] bg-gradient-to-b from-[#181320] via-[#0f0b15] to-[#08060b] border-2 border-[#ebd09b] rounded-2xl p-4 flex flex-col items-center shadow-[0_0_35px_rgba(235,208,155,0.4)] relative"
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
            <div className="w-full space-y-1.5 mb-3 max-h-32 overflow-y-auto">
              {inspectCardData.skills && inspectCardData.skills.length > 0 ? (
                inspectCardData.skills.map((sk: any, idx: number) => (
                  <div key={idx} className="bg-black/60 p-2 rounded-xl border border-white/10">
                    <div className="text-[11px] font-mono font-bold text-amber-300 flex items-center gap-1.5">
                      {renderSkillIcon(sk.type, "w-3 h-3")}
                      <span className="capitalize">{sk.type} ({sk.value})</span>
                    </div>
                    <p className="text-[9.5px] text-zinc-300 mt-0.5 leading-relaxed font-sans">
                      {sk.description || `Applies ${sk.type} effect in combat.`}
                    </p>
                  </div>
                ))
              ) : (
                <div className="bg-black/40 p-2 rounded-xl border border-white/5 text-center text-[10px] font-mono text-zinc-500">
                  No special passive skills.
                </div>
              )}
            </div>

            <button
              onClick={() => setInspectCardData(null)}
              className="w-full py-2 bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-zinc-700 text-white font-mono text-xs font-bold rounded-xl border border-zinc-600 cursor-pointer active:scale-95 transition-all"
            >
              ЗАКРЫТЬ
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          7. VICTORY MODAL (Rewards, Stars, Submit Result)
         ========================================================================= */}
      {visualState.phase === 'player_won' && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-200">
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
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-200">
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
          9. COMBAT LOG DRAWER (Slide-out)
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
          10. RULES CODEX MODAL
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
              <p><strong>⏳ Cast Delay (Таймер):</strong> Число ходов до первой атаки существа. 0 — атакует моментально.</p>
              <p><strong>💎 Mana (Мана):</strong> Стоимость вызова существа на поле. Восполняется каждый ход.</p>
              <p><strong>⚔️ Duels:</strong> Существа атакуют карту напротив. Если слот пуст — наносится прямой урон Лорду.</p>
              <p><strong>🩸 Vampirism:</strong> Восстанавливает % от нанесенного урона в здоровье карты и Лорда.</p>
              <p><strong>🦠 Plague:</strong> Отравляет врага токсичной миазмой каждый ход.</p>
              <p><strong>👁️ Hex:</strong> Наносит дополнительный магический урон цели.</p>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2 bg-zinc-800 text-white font-mono text-xs font-bold rounded-xl"
            >
              ПОНЯТНО
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default MobileBattleArena;
