import React, { useState, useEffect, useRef } from 'react';
import { getCardTierStyles } from '../utils/tierStyles';
import { audioSystem } from '../utils/AudioSystem';
import { useGame } from '../context/GameContext';
import { useToast } from './Toast';
import { CampaignStage, BattleState, BattleCardState } from '../types';
import { initializeBattle, simulateCombatTurn, toBattleCard } from '../utils/gameLogic';
import { 
  Swords, 
  Skull, 
  Shield, 
  Zap, 
  ChevronRight, 
  HelpCircle, 
  Flame, 
  ArrowLeft, 
  Volume2, 
  VolumeX, 
  Pause, 
  Play, 
  Activity,
  Plus,
  Star,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';


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
  switch (type?.toLowerCase()) {
  

        case 'sacrifice': return <Skull className="w-5 h-5 inline-block" />;
    case 'vampirism': return <Flame className="w-5 h-5 inline-block" />;
    case 'hex': return <Zap className="w-4 h-4 inline-block text-purple-400 mx-0.5" />;
    case 'plague': return <Activity className="w-5 h-5 inline-block" />;
    default: return <Star className="w-5 h-5 inline-block" />;
  }
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
  const { profile, setProfile, soundOn, toggleSound, submitBattleResult } = useGame();
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
    profile.collection.filter(c => profile.deck.includes(c.id)),
    stage,
    profile.heroMaxHealth + getEquipmentBonus('maxHealth'),
    getEquipmentBonus('dodge'),
    getEquipmentBonus('delayReduction')
  ));

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

  // Floating text array
  const [floatingTexts, setFloatingTexts] = useState<FloatingTextEffect[]>([]);

  // Hover analyst and modal info
  const [hoveredCard, setHoveredCard] = useState<BattleCardState | null>(null);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showLog, setShowLog] = useState(false);

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
    setFloatingTexts(prev => [...prev, { id, text, target, colorClass }]);
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
          
          stepDescription = `🗡️ Duel: ${attackerCard?.name || 'Creature'} deals -${step.damage} damage to ${defenderCard?.name || 'Target'}`;

          audioSystem.playAttack();
          // Trigger physical slide forward attack movement
          setAnimatingSlot({ side: step.attacker, slot: step.slot, type: 'strike' });

          // Delay the impact visual slightly to sync with card strike position
          setTimeout(() => {
            setAnimatingSlot({ side: step.attacker === 'player' ? 'enemy' : 'player', slot: step.targetSlot, type: 'hit' });
            
            if (defenderCard) {
              defenderCard.health = Math.max(0, defenderCard.health - step.damage);
            }
            if (attackerCard && step.vampireHeal > 0) {
              attackerCard.health = Math.min(attackerCard.maxHealth, attackerCard.health + step.vampireHeal);
              addFloatingText(`+${step.vampireHeal} 🩸`, { side: step.attacker, slot: step.slot }, 'text-emerald-400 font-extrabold text-xs');
            }

            addFloatingText(`-${step.damage}`, { side: step.attacker === 'player' ? 'enemy' : 'player', slot: step.targetSlot }, 'text-red-500 font-black text-sm scale-125 text-shadow-glow');
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
          
          stepDescription = `🤢 Plague slime: ${sourceCard?.name || 'Rot'} infects ${targetCard?.name || 'target'} for -${step.damage} HP`;

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
        }
      }

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
    
    setIsSimulating(true);
    const { nextState, animateSequence: steps } = simulateCombatTurn(battle, selectedHandCardId, slotIndex, profile);
    
    setFinalBattleState(nextState);
    setSelectedHandCardId(null);
    setupPlaybackState(selectedHandCardId, slotIndex, steps);
  };

  // Handle End Turn click
  const handleEndTurnWithoutCard = () => {
    setIsSimulating(true);
    const { nextState, animateSequence: steps } = simulateCombatTurn(battle, null, null, profile);
    
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

  // Internal helper to retrieve floating texts for specific slot
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
      .map(f => (
        <motion.div
          key={f.id}
          initial={{ opacity: 1, y: 15, scale: 0.8 }}
          animate={{ opacity: 0, y: -45, scale: 1.25 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className={`absolute z-50 pointer-events-none text-center font-mono font-black select-none text-shadow-glow ${f.colorClass}`}
        >
          {f.text}
        </motion.div>
      ));
  };



  return (
    <div className="h-screen w-screen overflow-hidden bg-[#06070a] text-gray-200 p-3 md:p-4 font-sans flex flex-col relative">
      
      {/* Header Bar */}
      <div className="bg-[#151a21] border border-[#ebd09b]/20 rounded-xl p-3 flex justify-between items-center w-full shadow-lg z-10 shrink-0">
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to escape? Energy will not be refunded.')) {
              onExitBattle(false);
            }
          }}
          className="flex items-center gap-1.5 text-xs font-mono font-bold text-gray-400 hover:text-white transition-all bg-black/40 py-1 px-3 border border-gray-800 rounded-lg cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> ESCAPE BATTLEFIELD
        </button>

        <div className="text-center font-display font-black text-xs md:text-sm tracking-widest text-shadow-gold text-white uppercase flex flex-col items-center">
          <span>{stage.name} — BATTLE TURN {visualState.turn}</span>
          <div className="flex items-center gap-6 mt-1 text-xs">
            <div className="flex flex-col items-center">
              <span className="text-red-400">ENEMY: {visualState.enemyHeroHealth} / {visualState.enemyHeroMaxHealth}</span>
              <div className="w-32 bg-[#4e0707]/30 h-1.5 rounded-full border border-red-900/20 overflow-hidden">
                <motion.div
                  className="bg-[#dd2c40] h-full rounded-full"
                  animate={{ width: `${Math.max(0, (visualState.enemyHeroHealth / visualState.enemyHeroMaxHealth) * 100)}%` }}
                />
              </div>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[#66fcf1]">PLAYER: {visualState.playerHeroHealth} / {visualState.playerHeroMaxHealth}</span>
              <div className="w-32 bg-cyan-950/30 h-1.5 rounded-full border border-[#66fcf1]/20 overflow-hidden">
                <motion.div
                  className="bg-[#66fcf1] h-full rounded-full"
                  animate={{ width: `${Math.max(0, (visualState.playerHeroHealth / visualState.playerHeroMaxHealth) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <button
            onClick={() => setShowLog(!showLog)}
            className="text-gray-500 hover:text-white transition-all bg-black/30 p-1.5 border border-gray-800/80 rounded-lg cursor-pointer flex items-center gap-1 text-xs font-mono"
          >
            LOGS
          </button>
          <button
            onClick={toggleSound}
            className="text-gray-500 hover:text-white transition-all bg-black/30 p-1.5 border border-gray-800/80 rounded-lg cursor-pointer"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-[#ebd09b]" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex-1 flex justify-center items-center relative h-full">
        {/* PLAYBACK ACTION BANNER / CONTROLLER */}
        <AnimatePresence mode="wait">
          {isAnimating && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#151a21]/95 border border-[#66fcf1]/35 rounded-xl p-3 flex items-center gap-4 shadow-2xl backdrop-blur-md"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-[#66fcf1] animate-ping" />
                <div>
                  <span className="text-[9px] font-mono font-bold text-[#66fcf1] tracking-widest uppercase block">Battle Phase</span>
                  <h5 className="font-display font-bold text-xs text-white leading-none mt-0.5">
                    {activeLogStepText || 'Starting combat duelist...'}
                  </h5>
                </div>
              </div>
              <div className="flex items-center gap-3 border-l border-gray-700 pl-4">
                <div className="flex bg-black/40 p-0.5 rounded-lg border border-gray-800">
                  {[1, 2, 3].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSpeedMultiplier(s)}
                      className={`px-2 py-1 text-[9px] font-mono font-black rounded-md transition-all cursor-pointer ${
                        speedMultiplier === s ? 'bg-[#66fcf1] text-black shadow-lg font-bold' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="bg-black/50 hover:bg-gray-800 border border-gray-800 text-white text-[9px] font-mono font-bold py-1 px-3 rounded-lg cursor-pointer transition-all flex items-center gap-1"
                >
                  {isPaused ? <Play className="w-2.5 h-2.5 text-emerald-400" /> : <Pause className="w-2.5 h-2.5 text-yellow-400" />}
                  {isPaused ? 'START' : 'PAUSE'}
                </button>
                {isPaused && (
                  <button
                    onClick={() => {
                      setAnimatingSlot(null);
                      setCurrentStepIndex(prev => Math.min(animateSequence.length, prev + 1));
                    }}
                    className="bg-cyan-950/50 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-[9px] font-mono font-bold py-1 px-2 rounded-lg cursor-pointer transition-all"
                  >
                    STEP ➡️
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BOARD STAGE FIELD */}
        <div className="w-full max-w-4xl grid grid-rows-2 gap-16 md:gap-24 items-center">
          
          {/* 1. ENEMY BOARD */}
          <div className="grid grid-cols-5 gap-4 md:gap-6 relative z-10">
            {visualState.enemyBoard.map((card, idx) => {
              const isActing = animatingSlot?.side === 'enemy' && animatingSlot?.slot === idx && animatingSlot?.type === 'strike';
              const isHit = animatingSlot?.side === 'enemy' && animatingSlot?.slot === idx && animatingSlot?.type === 'hit';
              const isDeath = animatingSlot?.side === 'enemy' && animatingSlot?.slot === idx && animatingSlot?.type === 'death';
              const isHeal = animatingSlot?.side === 'enemy' && animatingSlot?.slot === idx && animatingSlot?.type === 'heal';

              return (
                <div key={idx} className="relative aspect-square flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                    {renderFloatingTextsFor({ side: 'enemy', slot: idx })}
                  </div>
                  
                  <motion.div
                    onMouseEnter={() => card && setHoveredCard(card)}
                    onMouseLeave={() => setHoveredCard(null)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{
                      opacity: isDeath ? 0 : 1,
                      scale: isActing ? 1.15 : isDeath ? 0.7 : isHeal ? 1.05 : 1,
                      y: isActing ? 45 : 0,
                      x: isHit ? [0, -10, 10, -10, 10, 0] : 0,
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 20 }}
                    className={`w-full h-full rounded-2xl md:rounded-[32px] border-4 flex flex-col items-center justify-center relative select-none transition-all ${
                      card
                        ? `${card.delay > 0 ? 'brightness-[0.5] saturate-[0.5]' : ''} bg-[#1a1420] text-white cursor-help shadow-2xl`
                        : 'bg-black/30 border-red-950/25 border-dashed flex items-center justify-center'
                    } ${(card as any)?.ward ? 'border-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.6)]' : card ? 'border-[#2d1b2e]' : ''}`}
                  >
                    {card ? (
                      <>
                        {card.image.startsWith('/cards/') && (
                          <img src={card.image} alt={card.name} className="absolute inset-0 w-full h-full object-cover rounded-2xl md:rounded-[28px] opacity-80" />
                        )}
                        <div className="absolute inset-0 rounded-2xl md:rounded-[28px] bg-gradient-to-t from-black/80 via-transparent to-black/40" />

                        {/* Top Center: Delay */}
                        {card.delay > 0 && (
                          <div className="absolute -top-4 bg-[#4e0707] border-2 border-red-500 rounded-full w-10 h-10 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.5)] z-20">
                            <span className="text-red-400 font-mono text-xl font-black">⏳{card.delay}</span>
                          </div>
                        )}
                        {card.delay === 0 && (
                          <div className="absolute -top-4 bg-red-600 border-2 border-white rounded-full w-10 h-10 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.5)] z-20">
                            <span className="text-white text-xl">⚔️</span>
                          </div>
                        )}

                        {/* Bottom Corners: Massive Gems */}
                        <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-red-900 border-[3px] border-[#3a0b12] rounded-full flex items-center justify-center shadow-lg z-20">
                          <span className="text-white font-black text-lg text-shadow">⚔️{card.attack}</span>
                        </div>
                        <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-emerald-900 border-[3px] border-[#0a2f1b] rounded-full flex items-center justify-center shadow-lg z-20 relative">
                          <span className="text-white font-black text-lg text-shadow">❤️{card.health}</span>
                          {(card as any)?.armor > 0 && (
                            <div className="absolute -top-2 -right-2 bg-slate-400 border border-white text-black text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">🛡️</div>
                          )}
                        </div>

                      </>
                    ) : (
                      <span className="text-[10px] font-mono text-gray-700 uppercase tracking-widest opacity-50">Enemy</span>
                    )}
                  </motion.div>
                </div>
              );
            })}
          </div>

          {/* 2. PLAYER BOARD */}
          <div className="grid grid-cols-5 gap-4 md:gap-6 relative z-10">
            {visualState.playerBoard.map((card, idx) => {
              const canPlace = selectedHandCardId && card === null && !isSimulating;
              const isActing = animatingSlot?.side === 'player' && animatingSlot?.slot === idx && animatingSlot?.type === 'strike';
              const isHit = animatingSlot?.side === 'player' && animatingSlot?.slot === idx && animatingSlot?.type === 'hit';
              const isDeath = animatingSlot?.side === 'player' && animatingSlot?.slot === idx && animatingSlot?.type === 'death';
              const isHeal = animatingSlot?.side === 'player' && animatingSlot?.slot === idx && animatingSlot?.type === 'heal';

              return (
                <div key={idx} className="relative aspect-square flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                    {renderFloatingTextsFor({ side: 'player', slot: idx })}
                  </div>
                  
                  <motion.div
                    onMouseEnter={() => card && setHoveredCard(card)}
                    onMouseLeave={() => setHoveredCard(null)}
                    onClick={() => canPlace && handlePlayCard(idx)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{
                      opacity: isDeath ? 0 : 1,
                      scale: isActing ? 1.15 : isDeath ? 0.7 : isHeal ? 1.05 : canPlace ? 1.05 : 1,
                      y: isActing ? -45 : 0,
                      x: isHit ? [0, -10, 10, -10, 10, 0] : 0,
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 20 }}
                    className={`w-full h-full rounded-2xl md:rounded-[32px] border-4 flex flex-col items-center justify-center relative select-none transition-all ${
                      canPlace
                        ? 'bg-emerald-950/40 border-emerald-500/80 cursor-pointer border-dashed animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                        : card
                          ? `${card.delay > 0 ? 'brightness-[0.5] saturate-[0.5]' : ''} bg-[#111e25] text-white cursor-help shadow-2xl`
                          : 'bg-black/30 border-cyan-950/20 border-dashed flex items-center justify-center'
                    } ${(card as any)?.ward ? 'border-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.6)]' : card ? 'border-[#17303d]' : ''}`}
                  >
                    {card ? (
                      <>
                        {card.image.startsWith('/cards/') && (
                          <img src={card.image} alt={card.name} className="absolute inset-0 w-full h-full object-cover rounded-2xl md:rounded-[28px] opacity-80" />
                        )}
                        <div className="absolute inset-0 rounded-2xl md:rounded-[28px] bg-gradient-to-t from-black/80 via-transparent to-black/40" />

                        {/* Top Center: Delay */}
                        {card.delay > 0 && (
                          <div className="absolute -top-4 bg-[#091a2f] border-2 border-cyan-500 rounded-full w-10 h-10 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)] z-20">
                            <span className="text-cyan-400 font-mono text-xl font-black">⏳{card.delay}</span>
                          </div>
                        )}
                        {card.delay === 0 && (
                          <div className="absolute -top-4 bg-emerald-600 border-2 border-white rounded-full w-10 h-10 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)] z-20">
                            <span className="text-white text-xl">⚔️</span>
                          </div>
                        )}

                        {/* Bottom Corners: Massive Gems */}
                        <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-red-900 border-[3px] border-[#3a0b12] rounded-full flex items-center justify-center shadow-lg z-20">
                          <span className="text-white font-black text-lg text-shadow">⚔️{card.attack}</span>
                        </div>
                        <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-emerald-900 border-[3px] border-[#0a2f1b] rounded-full flex items-center justify-center shadow-lg z-20 relative">
                          <span className="text-white font-black text-lg text-shadow">❤️{card.health}</span>
                          {(card as any)?.armor > 0 && (
                            <div className="absolute -top-2 -right-2 bg-slate-400 border border-white text-black text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">🛡️</div>
                          )}
                        </div>

                      </>
                    ) : (
                      <span className="text-[10px] font-mono text-gray-700 uppercase tracking-widest opacity-50">
                        {canPlace ? 'Place 📥' : 'Empty'}
                      </span>
                    )}
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SIDEBAR COMBAT LOG OVERLAY */}
        <AnimatePresence>
          {showLog && (
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-32 w-80 bg-[#11141c]/95 border-l border-[#c5a880]/30 shadow-2xl backdrop-blur-md z-40 p-4 flex flex-col rounded-l-2xl"
            >
              <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
                <h4 className="font-display font-bold text-sm text-[#ebd09b] tracking-wider uppercase">📜 COMBAT LOG</h4>
                <button onClick={() => setShowLog(false)} className="text-gray-500 hover:text-white">✕</button>
              </div>
              <div
                id="combat-log-scroll"
                className="flex-1 overflow-y-auto font-mono text-[10px] text-gray-400 space-y-2 pr-2 custom-scrollbar"
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
                    <div key={index} className={`border-b border-gray-900/30 pb-1 leading-relaxed ${colorClass}`} dangerouslySetInnerHTML={{ __html: log }}></div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* PLAYER HAND AT ABSOLUTE BOTTOM FAN */}
      <div className="absolute bottom-0 left-0 right-0 h-48 md:h-56 pointer-events-none z-30">
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-end justify-center h-full pointer-events-auto">
          {visualState.playerHand.map((card, idx) => {
            const total = visualState.playerHand.length;
            const offset = idx - (total - 1) / 2;
            const isSelected = selectedHandCardId === card.id;

            return (
              <motion.div
                key={card.id}
                onClick={() => {
                  if (!isSimulating) {
                    setSelectedHandCardId(isSelected ? null : card.id);
                  }
                }}
                onMouseEnter={() => setHoveredCard(card as any)}
                onMouseLeave={() => setHoveredCard(null)}
                initial={false}
                animate={{
                  y: isSelected ? -30 : Math.abs(offset) * 8,
                  rotate: isSelected ? 0 : offset * 5,
                  scale: isSelected ? 1.15 : 1,
                  zIndex: isSelected ? 50 : 10,
                  x: offset * 25
                }}
                whileHover={{
                  y: -40,
                  rotate: 0,
                  scale: 1.2,
                  zIndex: 60,
                  transition: { duration: 0.2 }
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`absolute w-32 h-44 md:w-36 md:h-48 origin-bottom rounded-xl border-2 flex flex-col justify-between p-2 text-center cursor-pointer select-none overflow-hidden ${
                  isSelected
                    ? 'border-[#66fcf1] shadow-[0_0_20px_rgba(102,252,241,0.5)]'
                    : 'border-gray-700 shadow-xl'
                } bg-[#151a21] text-white`}
                style={{ marginLeft: idx === 0 ? 0 : -64 }}
              >
                <div className={`absolute inset-0 opacity-[0.1] bg-gradient-to-br ${getTierBgGradient(card.tier)}`} />
                {card.image.startsWith('/cards/') && (
                  <>
                    <img src={card.image} alt={card.name} className="absolute inset-0 w-full h-full object-cover z-0 rounded-xl opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10 z-0 pointer-events-none" />
                  </>
                )}

                <div className="flex justify-between items-center text-[8px] font-mono font-bold text-gray-300 z-10 relative">
                  <span className={`uppercase tracking-wider ${getTierTextColor(card.tier)}`}>{card.tier}</span>
                  <span>Lvl {card.level}</span>
                </div>

                {/* Delay badge */}
                {card.delay > 0 && (
                  <div className="absolute -top-1 -right-1 bg-[#091a2f] border border-cyan-500 rounded-full px-1.5 py-0.5 flex items-center gap-0.5 text-[9px] font-mono font-bold text-cyan-300 shadow z-20">
                    ⏳{card.delay}
                  </div>
                )}

                <div className="mt-auto z-10 relative bg-black/60 rounded p-1 mb-1 backdrop-blur-sm">
                  <span className="text-[10px] font-display font-black tracking-tight text-white block truncate leading-none mb-1">
                    {card.name}
                  </span>
                  <div className="flex justify-between items-center text-[9px] font-mono font-black border-t border-white/20 pt-1">
                    <span className="text-red-400">⚔️{card.attack}</span>
                    <span className="text-emerald-400">❤️{card.health}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* END TURN BUTTON AT BOTTOM RIGHT OR LEFT IF NEEDED, PUTTING IT BOTTOM RIGHT */}
      <div className="absolute bottom-6 right-6 z-40">
        {!selectedHandCardId && visualState.playerHand.length > 0 && (
          <button
            disabled={isSimulating}
            onClick={handleEndTurnWithoutCard}
            className="bg-gradient-to-r from-teal-900 to-[#1f2833] hover:from-[#45a29e] hover:to-teal-900 border border-[#66fcf1]/40 text-[#66fcf1] text-[10px] md:text-xs font-display font-black py-2.5 px-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer backdrop-blur-md"
          >
            ⏳ PASS TURN
          </button>
        )}
      </div>

      {/* WIN POPUP MODAL */}
      {battle.phase === 'player_won' && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-[#151a21] border border-[#ebd09b]/30 rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl gothic-glow-gold">
            <div className="w-16 h-16 bg-black/90 border border-[#c5a880] rounded-full mx-auto flex items-center justify-center">
              <Swords className="w-8 h-8 text-[#ebd09b] animate-spin-slow" />
            </div>

            <div className="space-y-2">
              <h3 className="font-display font-black text-2xl text-[#ebd09b] tracking-widest text-shadow-gold">
                {battleType === 'pvp' ? 'ARENA TRIUMPH!' : 'COVENANT VICTORY!'}
              </h3>
              <p className="text-xs text-gray-400 font-sans">
                {battleType === 'pvp' ? 'You defeated the enemy summoner and earned glory.' : 'You defeated the abyssal lord and cleansed the cursed lands.'}
              </p>
            </div>

            {/* Stars Result (Only for Campaign) */}
            {battleType === 'campaign' && (() => {
              const hpPercentage = battle.playerHeroHealth / battle.playerHeroMaxHealth;
              const earnedStars = hpPercentage === 1 ? 3 : hpPercentage >= 0.5 ? 2 : 1;
              return (
                <div className="bg-black/50 p-4 rounded-xl border border-gray-800 mt-4">
                  <span className="text-[10px] text-[#ebd09b] tracking-widest block uppercase font-bold mb-3">STAGE MASTERY</span>
                  <div className="flex justify-center gap-2 mb-4">
                    {[1, 2, 3].map(s => (
                      <Star 
                        key={s} 
                        className={`w-8 h-8 transition-all duration-500 ${s <= earnedStars ? 'text-[#ebd09b] fill-[#ebd09b] drop-shadow-[0_0_12px_rgba(235,208,155,0.8)] scale-110' : 'text-gray-800 fill-gray-900'}`} 
                      />
                    ))}
                  </div>
                  <div className="text-[10px] font-mono text-gray-400 space-y-1.5 text-left bg-black/30 p-3 rounded border border-white/5">
                    <div className="flex justify-between items-center"><span className={earnedStars >= 1 ? "text-emerald-400" : ""}>★ 1 Star:</span> <span>Clear Stage</span></div>
                    <div className="flex justify-between items-center"><span className={earnedStars >= 2 ? "text-emerald-400" : ""}>★★ 2 Stars:</span> <span>Keep Hero HP &gt; 50%</span></div>
                    <div className="flex justify-between items-center"><span className={earnedStars === 3 ? "text-emerald-400" : ""}>★★★ 3 Stars:</span> <span>Keep Hero HP 100%</span></div>
                  </div>
                </div>
              );
            })()}

            {/* Reward list */}
            <div className="bg-black/50 p-4 rounded-xl border border-gray-800 space-y-3 font-mono text-xs">
              <span className="text-[10px] text-gray-500 tracking-widest block uppercase font-bold">REWARD OBTAINED</span>
              <div className="flex justify-around items-center flex-wrap gap-2">
                <div className="text-center">
                  <span className="text-amber-500 font-bold block text-sm">+{stage.goldReward} <img src="/icons/icon_gold.png" alt="Gold" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" /></span>
                  <span className="text-[9px] text-gray-500 font-mono">Gold</span>
                </div>
                <div className="text-center">
                  <span className="text-[#66fcf1] font-bold block text-sm">+{stage.dustReward} <img src="/icons/icon_dust.png" alt="Dust" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" /></span>
                  <span className="text-[9px] text-gray-500 font-mono">Dark Dust</span>
                </div>
                {battleType === 'campaign' && (
                  <div className="text-center">
                    <span className="text-emerald-400 font-bold block text-sm">+50 ✨</span>
                    <span className="text-[9px] text-gray-500 font-mono">EXP</span>
                  </div>
                )}
                {battleType === 'pvp' ? (
                  <div className="text-center">
                    <span className="text-cyan-400 font-bold block text-sm">+25 🏆</span>
                    <span className="text-[9px] text-gray-500 font-mono">MMR Rating</span>
                  </div>
                ) : (
                  <>
                    {stage.shardsReward > 0 && (
                      <div className="text-center">
                        <span className="text-red-500 font-bold block text-sm">+{stage.shardsReward} <img src="/icons/icon_shards.png" alt="Shards" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" /></span>
                        <span className="text-[9px] text-gray-500 font-mono">Shards</span>
                      </div>
                    )}
                    {stage.cardReward && (
                      <div className="text-center">
                        <span className="text-emerald-500 font-bold block text-sm">{stage.cardReward.name} 🎴</span>
                        <span className="text-[9px] text-emerald-700 font-mono">Card Reward</span>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="border-t border-gray-900 pt-2 text-purple-400 font-bold text-[10px] uppercase flex items-center justify-center gap-1.5">
                <Award className="w-3.5 h-3.5" /> +50 Dark Pass Points (BP)
              </div>
            </div>

            <button
              onClick={() => onExitBattle(true)}
              className="w-full bg-[#ebd09b] hover:bg-[#c5a880] text-black font-display font-black tracking-widest py-3 px-6 rounded-xl transition-all shadow-lg text-xs cursor-pointer"
            >
              CLAIM LOOT AND EXIT
            </button>
          </div>
        </div>
      )}

      {/* LOST POPUP MODAL */}
      {battle.phase === 'player_lost' && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-[#151a21] border border-[#dd2c40]/30 rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl gothic-glow-crimson">
            <div className="w-16 h-16 bg-red-950/20 border border-[#dd2c40]/50 rounded-full mx-auto flex items-center justify-center">
              <Skull className="w-8 h-8 text-[#dd2c40] animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="font-display font-black text-2xl text-[#dd2c40] tracking-widest text-shadow-crimson">YOU ARE DEFEATED</h3>
              <p className="text-xs text-gray-400 font-sans">
                {battleType === 'pvp' ? 'Your opponent was stronger in this duel. Adjust your deck and take revenge!' : 'Darkness consumed your mind. Upgrade cards and try again.'}
              </p>
            </div>

            <div className="bg-black/50 p-4 rounded-xl border border-gray-800 space-y-2 font-mono text-xs">
              <span className="text-[10px] text-gray-500 block uppercase font-bold">BATTLE CONSEQUENCES</span>
              {battleType === 'pvp' ? (
                <div className="flex justify-around items-center">
                  <div className="text-center">
                    <span className="text-amber-500 font-bold block text-sm">+20 <img src="/icons/icon_gold.png" alt="Gold" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" /></span>
                    <span className="text-[9px] text-gray-500 font-mono">Gold</span>
                  </div>
                  <div className="text-center">
                    <span className="text-red-500 font-bold block text-sm">-15 💔</span>
                    <span className="text-[9px] text-gray-500 font-mono">MMR Rating</span>
                  </div>
                </div>
              ) : (
                <div className="text-amber-500 font-bold text-sm">+20 <img src="/icons/icon_gold.png" alt="Gold" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" /> Gold</div>
              )}
            </div>

            <button
              onClick={() => onExitBattle(false)}
              className="w-full bg-gradient-to-r from-red-900 to-[#4e0707] hover:from-[#dd2c40] hover:to-red-900 text-white font-display font-black tracking-widest py-3 px-6 rounded-xl transition-all shadow-lg text-xs cursor-pointer"
            >
              RETURN TO HQ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
