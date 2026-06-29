import React, { useState, useEffect, useRef } from 'react';
import { getCardTierStyles } from '../utils/tierStyles';
import { audioSystem } from '../utils/AudioSystem';
import { useGame } from '../context/GameContext';
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
    case 'sacrifice': return '💀';
    case 'vampirism': return '🩸';
    case 'hex': return '<img src="/icons/icon_dust.png" alt="Dust" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" />';
    case 'plague': return '🤢';
    default: return '✨';
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
  const { profile, setProfile, saveProfile, addGold, addDust, addShards, addBattlePassPoints, addCardToCollection, soundOn, toggleSound, addExp, addCampaignStars } = useGame();
  
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
    if (currentStepIndex !== -1 && currentStepIndex === animateSequence.length && animateSequence.length > 0) {
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
    const { nextState, animateSequence: steps } = simulateCombatTurn(battle, selectedHandCardId, slotIndex);
    
    setFinalBattleState(nextState);
    setSelectedHandCardId(null);
    setupPlaybackState(selectedHandCardId, slotIndex, steps);
  };

  // Handle End Turn click
  const handleEndTurnWithoutCard = () => {
    setIsSimulating(true);
    const { nextState, animateSequence: steps } = simulateCombatTurn(battle, null, null);
    
    setFinalBattleState(nextState);
    setupPlaybackState(null, null, steps);
  };

  // Rewards distribution
  const handleBattleWon = () => {
    audioSystem.playMagic();
    const goldBonus = getEquipmentBonus('goldBonus');
    const goldMultiplier = 1 + (goldBonus / 100);
    const finalGoldReward = Math.floor(stage.goldReward * goldMultiplier);
    
    addGold(finalGoldReward);
    addDust(stage.dustReward);
    addExp(50); // Base EXP reward
    if (stage.shardsReward > 0) {
      addShards(stage.shardsReward);
    }
    addBattlePassPoints(50);
    
    // Calculate Campaign Stars
    if (battleType === 'campaign') {
      const hpPercentage = battle.playerHeroHealth / battle.playerHeroMaxHealth;
      let stars = 1;
      if (hpPercentage === 1) stars = 3;
      else if (hpPercentage >= 0.5) stars = 2;
      
      addCampaignStars(stage.id.toString(), stars);
    }
    
    // Check for card reward
    if (battleType === 'campaign' && stage.cardReward) {
      // Create and add the card instance using the template
      addCardToCollection(stage.cardReward as any, 1);
    }

    if (battleType === 'pvp') {
      handlePvpWon();
    } else {
      if (stage.id === profile.pveProgress) {
        setProfile(current => {
          const updated = {
            ...current,
            pveProgress: current.pveProgress + 1
          };
          saveProfile(updated);
          return updated;
        });
      }
    }
  };

  // PVP Specific endings
  const handlePvpWon = () => {
    audioSystem.playMagic();
    const goldBonus = getEquipmentBonus('goldBonus');
    const goldMultiplier = 1 + (goldBonus / 100);
    const finalGoldReward = Math.floor(20 * goldMultiplier);

    addGold(finalGoldReward);
    addExp(80);
    setProfile(current => {
      const updated = {
        ...current,
        pvpRating: current.pvpRating + 25
      };
      saveProfile(updated);
      return updated;
    });
  };

  const handleBattleLost = () => {
    audioSystem.playError();
    addGold(20);
    if (battleType === 'pvp') {
      setProfile(current => {
        const updated = {
          ...current,
          pvpRating: Math.max(100, current.pvpRating - 15)
        };
        saveProfile(updated);
        return updated;
      });
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
    <div className="min-h-screen bg-[#06070a] text-gray-200 p-3 md:p-4 font-sans flex flex-col justify-between">
      
      {/* Header Bar */}
      <div className="bg-[#151a21] border border-[#ebd09b]/20 rounded-xl p-3 flex justify-between items-center max-w-7xl mx-auto w-full mb-4 shadow-lg">
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

        <div className="text-center font-display font-black text-xs md:text-sm tracking-widest text-shadow-gold text-white uppercase">
          {stage.name} — BATTLE TURN {visualState.turn}
        </div>

        <button
          onClick={toggleSound}
          className="text-gray-500 hover:text-white transition-all bg-black/30 p-1.5 border border-gray-800/80 rounded-lg cursor-pointer"
        >
          {soundOn ? <Volume2 className="w-4 h-4 text-[#ebd09b]" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch flex-1">
        
        {/* Battle Arena (Left 3 columns) */}
        <div className="lg:col-span-3 flex flex-col justify-between bg-gradient-to-b from-[#0b0c10] to-[#06070a] border border-[#c5a880]/15 rounded-2xl p-4 md:p-6 shadow-2xl relative">
          
          {/* ENEMY HERO ZONE */}
          <div className="flex justify-between items-center bg-black/35 border border-red-950 p-3 rounded-xl mb-4 relative overflow-hidden">
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-red-900/10 to-transparent pointer-events-none" />
            
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-full bg-[#4e0707] border border-[#dd2c40]/40 flex items-center justify-center shadow-inner relative overflow-hidden">
                {renderFloatingTextsFor('enemy-hero')}
                {stage.enemyHeroImage?.startsWith('/') ? (
                  <img src={stage.enemyHeroImage} alt="Enemy Hero" className="w-full h-full object-cover" />
                ) : (
                  <Skull className="w-5 h-5 text-[#dd2c40]" />
                )}
              </div>
              <div>
                <span className="text-[9px] font-mono font-bold text-[#dd2c40] tracking-widest uppercase block">Enemy Lord</span>
                <h4 className="font-display font-bold text-sm text-white leading-none">{stage.enemyHeroName}</h4>
              </div>
            </div>

            {/* Enemy HP Bar */}
            <div className="text-right space-y-1 font-mono w-44 md:w-64 relative z-10">
              <div className="flex justify-between text-xs font-bold text-red-400">
                <span>Health:</span>
                <span>{visualState.enemyHeroHealth} / {visualState.enemyHeroMaxHealth} HP</span>
              </div>
              <div className="w-full bg-[#4e0707]/30 h-2.5 rounded-full border border-red-900/20 overflow-hidden">
                <motion.div
                  className="bg-[#dd2c40] h-full rounded-full"
                  animate={{ width: `${Math.max(0, (visualState.enemyHeroHealth / visualState.enemyHeroMaxHealth) * 100)}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>

          {/* PLAYBACK ACTION BANNER / CONTROLLER */}
          <AnimatePresence mode="wait">
            {isAnimating && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#151a21]/95 border border-[#66fcf1]/35 rounded-xl p-3 flex flex-col md:flex-row justify-between items-center mb-4 gap-3 shadow-lg backdrop-blur-sm"
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

                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-gray-400">
                    Turn {currentStepIndex + 1} / {animateSequence.length}
                  </span>

                  {/* Playback speed selector */}
                  <div className="flex bg-black/40 p-0.5 rounded-lg border border-gray-800">
                    {[1, 2, 3].map((s) => (
                      <button
                        key={s}
                        onClick={() => setSpeedMultiplier(s)}
                        className={`px-2 py-1 text-[9px] font-mono font-black rounded-md transition-all cursor-pointer ${
                          speedMultiplier === s
                            ? 'bg-[#66fcf1] text-black shadow-lg font-bold'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>

                  {/* Pause / Resume buttons */}
                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    className="bg-black/50 hover:bg-gray-800 border border-gray-800 text-white text-[9px] font-mono font-bold py-1 px-3 rounded-lg cursor-pointer transition-all flex items-center gap-1"
                  >
                    {isPaused ? <Play className="w-2.5 h-2.5 text-emerald-400" /> : <Pause className="w-2.5 h-2.5 text-yellow-400" />}
                    {isPaused ? 'START' : 'PAUSE'}
                  </button>

                  {/* Manual trigger for next step when paused */}
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

          {/* BOARD STAGE FIELD (LINEAR DUELS) */}
          <div className="flex-1 grid grid-rows-2 gap-6 items-center my-4">
            
            {/* 1. ENEMY BOARD */}
            <div className="grid grid-cols-5 gap-2 md:gap-4 relative">
              <div className="absolute inset-x-0 -bottom-3 h-[1px] bg-red-950/25" />
              {visualState.enemyBoard.map((card, idx) => {
                const isActing = animatingSlot?.side === 'enemy' && animatingSlot?.slot === idx && animatingSlot?.type === 'strike';
                const isHit = animatingSlot?.side === 'enemy' && animatingSlot?.slot === idx && animatingSlot?.type === 'hit';
                const isDeath = animatingSlot?.side === 'enemy' && animatingSlot?.slot === idx && animatingSlot?.type === 'death';
                const isHeal = animatingSlot?.side === 'enemy' && animatingSlot?.slot === idx && animatingSlot?.type === 'heal';

                return (
                  <div key={idx} className="relative aspect-[3/4.2]">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
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
                        x: isHit ? [0, -8, 8, -6, 6, 0] : 0,
                        boxShadow: card && card.delay === 0
                          ? "0 0 12px rgba(220, 38, 64, 0.5)"
                          : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        borderColor: isHit ? "#ef4444" : card ? getTierBorderColor(card.tier) : "#151a21"
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 280,
                        damping: 14,
                        x: { duration: 0.25 }
                      }}
                      className={`w-full h-full rounded-xl border flex flex-col justify-between p-2 text-center relative overflow-hidden select-none transition-all ${
                        card
                          ? `${card.delay > 0 ? 'brightness-[0.4] saturate-[0.6]' : ''} bg-[#151a21] text-white cursor-help shadow-lg`
                          : 'bg-black/30 border-red-950/25 border-dashed flex items-center justify-center'
                      }`}
                    >
                      {card ? (
                        <>
                          <div className={`absolute inset-0 opacity-[0.06] bg-gradient-to-br ${getTierBgGradient(card.tier)}`} />
                          {card.image.startsWith('/cards/') && (
                            <>
                              <img src={card.image} alt={card.name} className="absolute inset-0 w-full h-full object-cover z-0 rounded-xl opacity-90" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10 z-0 rounded-xl pointer-events-none" />
                            </>
                          )}
                          
                          {card.delay > 0 && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] z-20 flex flex-col items-center justify-center gap-1.5 pointer-events-none rounded-xl">
                              <div className="w-10 h-10 rounded-full bg-black/80 border-2 border-red-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse">
                                <span className="text-red-400 font-mono text-base font-black tracking-tighter">⏳{card.delay}</span>
                              </div>
                              <span className="text-[8px] font-mono font-bold tracking-widest text-red-500/80 uppercase">Delay</span>
                            </div>
                          )}

                          <div className="flex justify-between items-center text-[7px] md:text-[8px] font-mono font-bold text-gray-500 z-10 relative">
                            <span className={`uppercase tracking-wider ${getTierTextColor(card.tier)}`}>
                              {card.tier}
                            </span>
                            <span>Lvl {card.level}</span>
                          </div>

                          {card.delay > 0 ? (
                            <div className="absolute -top-1.5 -right-1.5 bg-[#4e0707] border border-[#dd2c40] rounded-full px-1 py-0.5 flex items-center gap-0.5 text-[8px] font-mono font-bold text-white shadow animate-pulse z-20">
                              ⏳{card.delay}
                            </div>
                          ) : (
                            <div className="absolute -top-1.5 -right-1.5 bg-red-600 border border-white rounded-full w-4.5 h-4.5 flex items-center justify-center text-[8px] font-mono font-bold text-white shadow z-20 animate-bounce">
                              ⚔️
                            </div>
                          )}

                          <div className="mt-1 z-10 relative">
                            <span className="text-[9px] md:text-xs font-display font-black tracking-tight text-white block truncate leading-none">
                              {card.name}
                            </span>
                          </div>

                          <div className="flex flex-wrap justify-center gap-0.5 my-1 z-10 relative max-h-[16px] overflow-hidden">
                            {card.skills.map((s, sIdx) => (
                              <span
                                key={sIdx}
                                className={`text-[6.5px] px-1 py-0.2 rounded border ${getSkillBadgeStyle(s.type)}`}
                              >
                                {getSkillIcon(s.type)}{s.value}
                              </span>
                            ))}
                            {card.skills.length === 0 && (
                              <span className="text-[6.5px] font-mono text-gray-600">no skills</span>
                            )}
                          </div>

                          <div className="w-full bg-black/40 h-1 rounded-full overflow-hidden mt-1 z-10 border border-black/30 relative">
                            <motion.div
                              className="bg-red-500 h-full rounded-full"
                              animate={{ width: `${(card.health / card.maxHealth) * 100}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>

                          <div className="flex justify-between items-center text-[9px] font-mono font-black pt-1 border-t border-gray-800/80 mt-1 z-10 relative">
                            <span className="text-red-400">⚔️ {card.attack}</span>
                            <span className="text-emerald-400">❤️ {card.health}</span>
                          </div>
                        </>
                      ) : (
                        <span className="text-[8px] font-mono text-gray-700 uppercase tracking-widest">Slot {idx+1}</span>
                      )}
                    </motion.div>
                  </div>
                );
              })}
            </div>

            {/* 2. PLAYER BOARD */}
            <div className="grid grid-cols-5 gap-2 md:gap-4 relative">
              <div className="absolute inset-x-0 -top-3 h-[1px] bg-cyan-950/25" />
              {visualState.playerBoard.map((card, idx) => {
                const canPlace = selectedHandCardId && card === null && !isSimulating;
                const isActing = animatingSlot?.side === 'player' && animatingSlot?.slot === idx && animatingSlot?.type === 'strike';
                const isHit = animatingSlot?.side === 'player' && animatingSlot?.slot === idx && animatingSlot?.type === 'hit';
                const isDeath = animatingSlot?.side === 'player' && animatingSlot?.slot === idx && animatingSlot?.type === 'death';
                const isHeal = animatingSlot?.side === 'player' && animatingSlot?.slot === idx && animatingSlot?.type === 'heal';

                return (
                  <div key={idx} className="relative aspect-[3/4.2]">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      {renderFloatingTextsFor({ side: 'player', slot: idx })}
                    </div>
                    
                    <motion.div
                      onMouseEnter={() => card && setHoveredCard(card)}
                      onMouseLeave={() => setHoveredCard(null)}
                      onClick={() => canPlace && handlePlayCard(idx)}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{
                        opacity: isDeath ? 0 : 1,
                        scale: isActing ? 1.15 : isDeath ? 0.7 : isHeal ? 1.05 : canPlace ? 1.02 : 1,
                        y: isActing ? -45 : 0,
                        x: isHit ? [0, -8, 8, -6, 6, 0] : 0,
                        boxShadow: card && card.delay === 0
                          ? "0 0 12px rgba(102, 252, 241, 0.5)"
                          : canPlace
                            ? "0 0 10px rgba(16, 185, 129, 0.4)"
                            : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        borderColor: isHit ? "#ef4444" : canPlace ? "#10b981" : card ? getTierBorderColor(card.tier) : "#151a21"
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 280,
                        damping: 14,
                        x: { duration: 0.25 }
                      }}
                      className={`w-full h-full rounded-xl border flex flex-col justify-between p-2 text-center relative overflow-hidden select-none transition-all ${
                        canPlace
                          ? 'bg-emerald-950/20 border-emerald-500/50 cursor-pointer border-dashed animate-pulse'
                          : card
                            ? `${card.delay > 0 ? 'brightness-[0.4] saturate-[0.6]' : ''} bg-[#151a21] text-white cursor-help shadow-lg`
                            : 'bg-black/30 border-cyan-950/20 border-dashed flex items-center justify-center'
                      }`}
                    >
                      {card ? (
                        <>
                          <div className={`absolute inset-0 opacity-[0.06] bg-gradient-to-br ${getTierBgGradient(card.tier)}`} />
                          {card.image.startsWith('/cards/') && (
                            <>
                              <img src={card.image} alt={card.name} className="absolute inset-0 w-full h-full object-cover z-0 rounded-xl opacity-90" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10 z-0 rounded-xl pointer-events-none" />
                            </>
                          )}
                          
                          {card.delay > 0 && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-[1.5px] z-20 flex flex-col items-center justify-center gap-1.5 pointer-events-none rounded-xl">
                              <div className="w-10 h-10 rounded-full bg-black/80 border-2 border-cyan-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)] animate-pulse">
                                <span className="text-cyan-400 font-mono text-base font-black tracking-tighter">⏳{card.delay}</span>
                              </div>
                              <span className="text-[8px] font-mono font-bold tracking-widest text-cyan-400/80 uppercase">Delay</span>
                            </div>
                          )}

                          <div className="flex justify-between items-center text-[7px] md:text-[8px] font-mono font-bold text-gray-500 z-10 relative">
                            <span className={`uppercase tracking-wider ${getTierTextColor(card.tier)}`}>
                              {card.tier}
                            </span>
                            <span>Lvl {card.level}</span>
                          </div>

                          {card.delay > 0 ? (
                            <div className="absolute -top-1.5 -right-1.5 bg-[#091a2f] border border-cyan-500 rounded-full px-1 py-0.5 flex items-center gap-0.5 text-[8px] font-mono font-bold text-cyan-300 shadow z-20">
                              ⏳{card.delay}
                            </div>
                          ) : (
                            <div className="absolute -top-1.5 -right-1.5 bg-emerald-600 border border-white rounded-full w-4.5 h-4.5 flex items-center justify-center text-[8px] font-mono font-bold text-white shadow z-20 animate-bounce">
                              ⚔️
                            </div>
                          )}

                          <div className="mt-1 z-10 relative">
                            <span className="text-[9px] md:text-xs font-display font-black tracking-tight text-white block truncate leading-none">
                              {card.name}
                            </span>
                          </div>

                          <div className="flex flex-wrap justify-center gap-0.5 my-1 z-10 relative max-h-[16px] overflow-hidden">
                            {card.skills.map((s, sIdx) => (
                              <span
                                key={sIdx}
                                className={`text-[6.5px] px-1 py-0.2 rounded border ${getSkillBadgeStyle(s.type)}`}
                              >
                                {getSkillIcon(s.type)}{s.value}
                              </span>
                            ))}
                            {card.skills.length === 0 && (
                              <span className="text-[6.5px] font-mono text-gray-600">no skills</span>
                            )}
                          </div>

                          <div className="w-full bg-black/40 h-1 rounded-full overflow-hidden mt-1 z-10 border border-black/30 relative">
                            <motion.div
                              className="bg-emerald-500 h-full rounded-full"
                              animate={{ width: `${(card.health / card.maxHealth) * 100}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>

                          <div className="flex justify-between items-center text-[9px] font-mono font-black pt-1 border-t border-gray-800/80 mt-1 z-10 relative">
                            <span className="text-red-400">⚔️ {card.attack}</span>
                            <span className="text-emerald-400">❤️ {card.health}</span>
                          </div>
                        </>
                      ) : (
                        <span className="text-[8px] font-mono text-gray-700 uppercase tracking-widest">
                          {canPlace ? 'Select 📥' : `Slot ${idx+1}`}
                        </span>
                      )}
                    </motion.div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* PLAYER HERO ZONE & CONTROLS */}
          <div className="flex flex-col md:flex-row justify-between items-center bg-black/35 border border-cyan-950 p-4 rounded-xl mt-4 gap-4">
            
            {/* Player Profile Hero */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#151a21] border border-[#66fcf1]/40 flex items-center justify-center shadow-inner relative overflow-hidden">
                {renderFloatingTextsFor('player-hero')}
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Hero Avatar" className="w-full h-full object-cover" />
                ) : (
                  <Shield className="w-5 h-5 text-[#66fcf1]" />
                )}
              </div>
              <div>
                <span className="text-[9px] font-mono font-bold text-[#66fcf1] tracking-widest uppercase block">Your Hero</span>
                <h4 className="font-display font-bold text-sm text-white leading-none">{profile.username || 'Wind Summoner'}</h4>
              </div>
            </div>

            {/* End Turn / Skip buttons */}
            <div className="flex items-center gap-3">
              {!selectedHandCardId && (
                <button
                  disabled={isSimulating}
                  onClick={handleEndTurnWithoutCard}
                  className="bg-gradient-to-r from-teal-900 to-[#1f2833] hover:from-[#45a29e] hover:to-teal-900 border border-[#66fcf1]/40 text-[#66fcf1] text-xs font-display font-black py-2.5 px-6 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  ⏳ PLAY TURN WITHOUT CARD
                </button>
              )}

              {selectedHandCardId && (
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-amber-200 mt-2 bg-amber-900/40 border border-amber-500/50 rounded-lg p-2 animate-pulse shadow-neon-gold">
                📥 Select a free slot on the battlefield
              </p>
                  <button
                    onClick={() => setSelectedHandCardId(null)}
                    className="bg-[#4e0707] hover:bg-[#880d1e] border border-[#dd2c40]/40 text-[#dd2c40] text-xs font-mono font-bold py-1.5 px-4 rounded-lg transition-all cursor-pointer"
                  >
                    ✕ CANCEL
                  </button>
                </div>
              )}
            </div>

            {/* Player HP bar */}
            <div className="text-right space-y-1 font-mono w-44 md:w-64">
              <div className="flex justify-between text-xs font-bold text-[#66fcf1]">
                <span>Health:</span>
                <span>{visualState.playerHeroHealth} / {visualState.playerHeroMaxHealth} HP</span>
              </div>
              <div className="w-full bg-cyan-950/30 h-2.5 rounded-full border border-[#66fcf1]/20 overflow-hidden">
                <motion.div
                  className="bg-[#66fcf1] h-full rounded-full"
                  animate={{ width: `${Math.max(0, (visualState.playerHeroHealth / visualState.playerHeroMaxHealth) * 100)}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

          </div>

        </div>

        {/* Combat Logs & Player Hand / Codex (Right 1 column) */}
        <div className="flex flex-col gap-4">
          
          {/* PLAYER HAND ZONE */}
          <div className="bg-[#151a21] border border-[#c5a880]/15 rounded-2xl p-4 flex flex-col justify-between">
            <h4 className="font-display font-bold text-xs text-[#ebd09b] tracking-wider uppercase border-b border-gray-800 pb-2 mb-3 flex justify-between items-center">
              <span>🃏 YOUR HAND</span>
              <span className="bg-black/30 text-[10px] font-mono px-2 py-0.5 rounded border border-gray-800 text-[#ebd09b]">
                {visualState.playerHand.length}
              </span>
            </h4>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {visualState.playerHand.map((card) => {
                const isSelected = selectedHandCardId === card.id;
                return (
                  <div
                    key={card.id}
                    onClick={() => {
                      if (!isSimulating) {
                        setSelectedHandCardId(isSelected ? null : card.id);
                      }
                    }}
                    onMouseEnter={() => setHoveredCard(card as any)}
                    onMouseLeave={() => setHoveredCard(null)}
                    className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-black/90 border-[#66fcf1] scale-[1.02] shadow-[0_0_10px_rgba(102,252,241,0.25)]' 
                        : 'bg-black/45 border-gray-800/80 hover:border-gray-700'
                    }`}
                  >
                    <div>
                      <span className="font-display font-bold text-xs text-white block leading-tight">{card.name}</span>
                      <div className="flex items-center gap-2 mt-1 font-mono text-[9px] md:text-[10px]">
                        <span className="text-red-400 font-bold">⚔️{card.attack}</span>
                        <span className="text-emerald-400 font-bold">❤️{card.health}</span>
                        <span className="text-blue-400 font-bold">⏳{card.delay}</span>
                      </div>
                    </div>
                    {isSelected ? (
                      <span className="text-[9px] text-emerald-400 font-mono font-bold uppercase tracking-wider">Selected</span>
                    ) : (
                      <span className="text-[8px] text-gray-500 font-mono uppercase tracking-wider bg-black/40 px-1.5 py-0.5 rounded border border-gray-900">Deploy</span>
                    )}
                  </div>
                );
              })}
              
              {visualState.playerHand.length === 0 && (
                <div className="text-center text-[10px] text-gray-500 font-mono py-6 border border-dashed border-gray-800 rounded-xl">
                  Deck is empty.
                </div>
              )}
            </div>
          </div>

          {/* BATTLE CODEX & INTERACTIVE CARD ANALYST */}
          <div className="bg-[#151a21] border border-[#c5a880]/15 rounded-2xl p-4 flex flex-col justify-between min-h-[170px]">
            {hoveredCard ? (
              <motion.div
                key={hoveredCard.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="flex justify-between items-start border-b border-gray-800 pb-2">
                  <div>
                    <span className={`text-[8px] font-mono uppercase tracking-widest ${getTierTextColor(hoveredCard.tier)} block`}>
                      {hoveredCard.tier} • Lvl {hoveredCard.level}
                    </span>
                    <h4 className="font-display font-black text-sm text-white">{hoveredCard.name}</h4>
                  </div>
                  <div className="bg-black/40 border border-gray-800 px-2 py-0.5 rounded text-[9px] font-mono font-bold text-gray-400">
                    ⏳ {hoveredCard.delay > 0 ? `${hoveredCard.delay} turns` : 'Ready'}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-[10px]">
                  <div className="bg-black/30 p-1 rounded-lg border border-red-950/45">
                    <span className="text-gray-500 text-[8px] block">ATTACK</span>
                    <span className="text-red-400 font-bold text-xs">⚔️ {hoveredCard.attack}</span>
                  </div>
                  <div className="bg-black/30 p-1 rounded-lg border border-emerald-950/45">
                    <span className="text-gray-500 text-[8px] block">HEALTH</span>
                    <span className="text-emerald-400 font-bold text-xs">❤️ {hoveredCard.health}/{hoveredCard.maxHealth}</span>
                  </div>
                  <div className="bg-black/30 p-1 rounded-lg border border-blue-950/45">
                    <span className="text-gray-500 text-[8px] block">DELAY</span>
                    <span className="text-blue-400 font-bold text-xs">⏳ {hoveredCard.delay}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[8px] text-gray-500 font-bold tracking-wider block uppercase">ACTIVE ABILITIES</span>
                  {hoveredCard.skills.map((s, sIdx) => (
                    <div key={sIdx} className={`p-1.5 rounded-lg border text-[9px] leading-relaxed ${getSkillBadgeStyle(s.type)}`}>
                      <div className="font-bold flex items-center gap-1">
                        <span>{getSkillIcon(s.type)}</span>
                        <span>{getSkillNameEnglish(s.type)} {s.value}</span>
                      </div>
                      <p className="text-gray-300 font-sans text-[8.5px] mt-0.5">{getSkillDescEnglish(s.type, s.value)}</p>
                    </div>
                  ))}
                  {hoveredCard.skills.length === 0 && (
                    <p className="text-[9px] text-gray-500 font-mono italic">This creature has no dark abilities.</p>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="space-y-3 text-xs flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center border-b border-gray-800 pb-2 mb-2">
                    <h4 className="font-display font-bold text-[11px] text-[#ebd09b] tracking-wider uppercase flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-[#ebd09b]" /> COMBAT ANALYZER
                    </h4>
                    <button
                      onClick={() => setShowHelpModal(true)}
                      className="text-[8px] font-mono text-cyan-400 hover:underline bg-cyan-950/30 px-1.5 py-0.5 rounded border border-cyan-800/30 cursor-pointer"
                    >
                      RULES
                    </button>
                  </div>
                  <p className="text-gray-400 text-[9.5px] leading-relaxed font-sans">
                    Hover over any card on board or in hand to get full tactical info.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-1.5 font-mono text-[8px] border-t border-gray-800/40 pt-2">
                  <div className="bg-black/35 p-1 rounded border border-gray-900/50 flex items-start gap-1">
                    <span className="text-blue-400">⏳</span>
                    <div>
                      <span className="font-bold text-white block">Delay</span>
                      <span className="text-gray-500">Turns waiting to attack.</span>
                    </div>
                  </div>
                  <div className="bg-black/35 p-1 rounded border border-gray-900/50 flex items-start gap-1">
                    <span className="text-amber-500">💀</span>
                    <div>
                          <span className="font-bold text-white block">Sacrifice</span>
                      <span className="text-gray-500">Destroys an ally.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* COMBAT CHRONICLES LOG */}
          <div className="bg-[#151a21] border border-[#c5a880]/15 rounded-2xl p-4 flex-1 flex flex-col justify-between min-h-[160px]">
            <h4 className="font-display font-bold text-xs text-red-400 tracking-wider uppercase border-b border-gray-800 pb-2 mb-2">
              📜 BLOODY DUEL LOG
            </h4>

            {/* Scrollable logs */}
            <div
              id="combat-log-scroll"
              className="flex-1 max-h-[170px] overflow-y-auto font-mono text-[9px] text-gray-400 space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent"
            >
              {visualState.combatLog.map((log, index) => {
                let colorClass = 'text-gray-400';
                if (log.includes('TURN')) colorClass = 'text-cyan-400 font-bold border-t border-gray-800 pt-1.5 mt-1.5';
                else if (log.includes('VICTORY') || log.includes('healed')) colorClass = 'text-emerald-400 font-bold';
                else if (log.includes('DEFEAT') || log.includes('fell') || log.includes('Death')) colorClass = 'text-red-500 font-bold';
                else if (log.includes('Sacrifice') || log.includes('💀')) colorClass = 'text-yellow-500';
                else if (log.includes('Hex') || log.includes('<img src="/icons/icon_dust.png" alt="Dust" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" />')) colorClass = 'text-purple-400';
                else if (log.includes('Enemy') || log.includes('😈')) colorClass = 'text-rose-300';

                return (
                  <div key={index} className={`border-b border-gray-900/20 pb-0.5 leading-relaxed ${colorClass}`}>
                    {log}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* WIN POPUP MODAL */}
      {battle.phase === 'player_won' && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md">
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
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md">
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
                  <h4 className="font-display font-bold text-sm text-[#ebd09b] mb-2 uppercase"><img src="/icons/icon_dust.png" alt="Dust" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" /> Dark Creature Skills</h4>
                  <div className="space-y-2 font-sans">
                    <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-900/35">
                      <span className="font-bold text-red-400">💀 Sacrifice [X] (Sacrifice):</span>
                      <p className="text-gray-400 mt-0.5">
                        On play, destroys a random ally on your board. In return, heals your hero by X HP,
                        and creature permanently gets <strong>+(X/2) Attack</strong> and <strong>+X Health</strong>.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-900/35">
                      <span className="font-bold text-rose-300">🩸 Vampirism [X]:</span>
                      <p className="text-gray-400 mt-0.5">
                        Every time creature attacks and damages another card, it heals itself by X HP
                        (up to max HP).
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-purple-950/30 border border-purple-900/35">
                      <span className="font-bold text-purple-300"><img src="/icons/icon_dust.png" alt="Dust" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" /> Hex [X]:</span>
                      <p className="text-gray-400 mt-0.5">
                        Before dealing damage, hexes the opposite creature, increasing next incoming damage by +X.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-900/35">
                      <span className="font-bold text-emerald-300">🤢 Plague [X]:</span>
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
