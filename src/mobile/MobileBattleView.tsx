import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { CampaignStage, BattleState, BattleCardState, Card } from '../types';
import { initializeBattle, simulateCombatTurn, placeCardLocally } from '../utils/gameLogic';
import MobileBattleCard from './MobileBattleCard';
import MobileBattleHand from './MobileBattleHand';
import MobileCardPreview from './MobileCardPreview';
import { ChevronRight, Zap, Settings, SkipForward } from 'lucide-react';

interface MobileBattleViewProps {
  stage: CampaignStage;
  onExitBattle: (victory: boolean) => void;
  battleType?: 'campaign' | 'pvp';
}

const MobileBattleView: React.FC<MobileBattleViewProps> = ({ stage, onExitBattle, battleType = 'campaign' }) => {
  const { profile, submitBattleResult } = useGame();
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [visualState, setVisualState] = useState<BattleState | null>(null);
  const [selectedHandCardId, setSelectedHandCardId] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [previewCard, setPreviewCard] = useState<BattleCardState | Card | null>(null);
  
  // Simulation queues
  const [animateSequence, setAnimateSequence] = useState<any[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  const [autoPlay, setAutoPlay] = useState(false);

  // Initialize
  useEffect(() => {
    if (!profile) return;
    const dodgeChance = profile.equipment?.reduce((acc, eq) => eq.bonusType === 'dodge' ? acc + eq.bonusValue : acc, 0) || 0;
    const delayReduc = profile.equipment?.reduce((acc, eq) => eq.bonusType === 'delayReduction' ? acc + eq.bonusValue : acc, 0) || 0;
    
    // Setup sets/talents if needed (simplified for mobile example, we pass basics)
    const initialState = initializeBattle(
      profile.collection.filter(c => profile.deck.includes(c.id)),
      stage,
      profile.heroMaxHealth,
      dodgeChance,
      delayReduc,
      1,
      { atk: 0, hp: 0 },
      stage.enemyHeroHealth,
      stage.enemyDodgeChance || 0,
      stage.enemyDelayReduction || 0,
      stage.enemyStartingMana || 1,
      stage.enemyCreatureBuff || { atk: 0, hp: 0 }
    );
    
    setBattle(initialState);
    setVisualState(initialState);
  }, [profile, stage]);

  // Sequencer for animations
  useEffect(() => {
    if (!isSimulating || !visualState) return;

    if (currentStepIndex < animateSequence.length) {
      const step = animateSequence[currentStepIndex];
      const timer = setTimeout(() => {
        // Apply visual updates based on step (simplified version of the 3000-line logic)
        setVisualState(prev => {
          if (!prev) return prev;
          const next = JSON.parse(JSON.stringify(prev)) as BattleState;
          
          if (step.type === 'attack') {
            const isPlayer = step.side === 'player';
            const board = isPlayer ? next.playerBoard : next.enemyBoard;
            const targetBoard = isPlayer ? next.enemyBoard : next.playerBoard;
            
            const attacker = board[step.slot];
            if (attacker) attacker.attackFlash = true;
            
            if (step.targetSlot === -1) {
              if (isPlayer) next.enemyHeroHealth = Math.max(0, next.enemyHeroHealth - step.damage);
              else next.playerHeroHealth = Math.max(0, next.playerHeroHealth - step.damage);
            } else {
              const target = targetBoard[step.targetSlot];
              if (target) {
                target.damageTakenFlash = true;
                target.health = Math.max(0, target.health - step.damage);
                if (step.armorAbsorbed) target.armor = Math.max(0, (target.armor || 0) - step.armorAbsorbed);
                if (step.barrierBlocked) {
                  target.barrier = false;
                  target.ward = false;
                }
              }
            }
          }
          else if (step.type === 'death') {
            const board = step.side === 'player' ? next.playerBoard : next.enemyBoard;
            if (board[step.slot]) {
              board[step.slot]!.isDead = true;
            }
          }
          // Handle other basic steps or rely on final state sync...
          
          return next;
        });
        
        setCurrentStepIndex(currentStepIndex + 1);
      }, autoPlay ? 150 : 400); // Faster simulation on mobile

      return () => clearTimeout(timer);
    } else {
      // Sync final state once sequence completes
      setVisualState(battle);
      setIsSimulating(false);
      setCurrentStepIndex(0);
      
      if (battle?.phase === 'player_won') {
        handleEndGame(true);
      } else if (battle?.phase === 'player_lost') {
        handleEndGame(false);
      } else if (autoPlay && battle?.phase === 'player_play') {
        setTimeout(() => handleEndTurn(), 1000);
      }
    }
  }, [isSimulating, currentStepIndex, animateSequence, visualState, battle, autoPlay]);

  const handleEndGame = async (victory: boolean) => {
    // Basic completion callback
    await submitBattleResult(stage.id, victory, battleType);
    onExitBattle(victory);
  };

  const handleEndTurn = () => {
    if (!battle || isSimulating) return;
    
    // Fast forward logic
    setIsSimulating(true);
    setCurrentStepIndex(0);
    
    const { nextState, animateSequence: seq } = simulateCombatTurn(
      battle, 
      null, // If they placed a card, it's already in battle state (handled by local place)
      null, 
      profile, 
      stage
    );
    
    setBattle(nextState);
    setAnimateSequence(seq);
  };

  const handleSlotClick = (slotIdx: number) => {
    if (!battle || isSimulating || !selectedHandCardId) return;
    
    const handCard = battle.playerHand.find(c => c.id === selectedHandCardId);
    if (!handCard) return;
    if (battle.playerMana < (handCard.manaCost || 1)) return;
    if (battle.playerBoard[slotIdx] !== null && !battle.playerBoard[slotIdx]!.isDead) return;

    // Locally place card
    const tempState = JSON.parse(JSON.stringify(battle));
    const nextTempState = placeCardLocally(tempState, selectedHandCardId, slotIdx);
    
    setBattle(nextTempState);
    setVisualState(nextTempState);
    setSelectedHandCardId(null);
  };

  if (!visualState || !battle) {
    return <div className="fixed inset-0 bg-black flex items-center justify-center text-white">Loading Battle...</div>;
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col text-white font-sans overflow-hidden select-none landscape-only">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-black z-0" />

      {/* Top HUD */}
      <div className="relative z-10 h-[34px] flex items-center justify-between px-3 bg-black/60 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => onExitBattle(false)} className="text-zinc-400 p-1">
            <span className="text-xl">←</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-display text-zinc-300 uppercase">Turn {visualState.turn}</span>
            <div className="flex items-center gap-1 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-mono font-bold text-cyan-100">{visualState.playerMana} / {visualState.playerMaxMana}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            className={`px-2 py-0.5 text-xs font-bold rounded uppercase ${autoPlay ? 'bg-amber-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}
            onClick={() => setAutoPlay(!autoPlay)}
          >
            Auto
          </button>
          <Settings className="w-4 h-4 text-zinc-400" />
        </div>
      </div>

      {/* Battlefield */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-4 py-2 gap-2 pb-[40px]">
        {/* Enemy Row */}
        <div className="flex items-center gap-3 w-full max-w-[700px] mx-auto">
          {/* Enemy Hero */}
          <div className="w-12 h-12 rounded-full border-2 border-red-500 bg-zinc-800 flex flex-col items-center justify-center shrink-0">
             <span className="text-[10px] text-zinc-400 font-display">Enemy</span>
             <span className="text-xs font-mono font-bold text-red-400">{visualState.enemyHeroHealth}</span>
          </div>
          {/* Enemy Slots */}
          <div className="flex-1 flex gap-2 h-[18vw] min-h-[64px] max-h-[100px]">
            {visualState.enemyBoard.map((c, i) => (
              <div key={i} className="flex-1 border border-zinc-800/50 rounded-md bg-black/20 flex items-center justify-center">
                {c && !c.isDead && (
                  <MobileBattleCard 
                    card={c} 
                    isEnemy 
                    onLongPress={() => setPreviewCard(c)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="w-full max-w-[700px] mx-auto h-px bg-zinc-800 relative flex justify-center">
          <div className="absolute -top-3 bg-black px-2 text-zinc-600">
            <span className="text-lg">⚔️</span>
          </div>
        </div>

        {/* Player Row */}
        <div className="flex items-center gap-3 w-full max-w-[700px] mx-auto">
          {/* Player Hero */}
          <div className="w-12 h-12 rounded-full border-2 border-emerald-500 bg-zinc-800 flex flex-col items-center justify-center shrink-0">
             <span className="text-[10px] text-zinc-400 font-display">Hero</span>
             <span className="text-xs font-mono font-bold text-emerald-400">{visualState.playerHeroHealth}</span>
          </div>
          {/* Player Slots */}
          <div className="flex-1 flex gap-2 h-[18vw] min-h-[64px] max-h-[100px]">
            {visualState.playerBoard.map((c, i) => {
              const isEmpty = !c || c.isDead;
              const isSelectedHand = !!selectedHandCardId;
              const isValidPlacement = isEmpty && isSelectedHand && !isSimulating;
              
              return (
                <div 
                  key={i} 
                  className={`flex-1 rounded-md bg-black/20 flex items-center justify-center transition-colors ${
                    isValidPlacement ? 'border-2 border-dashed border-cyan-500 bg-cyan-900/20 cursor-pointer' : 'border border-zinc-800/50'
                  }`}
                  onClick={() => handleSlotClick(i)}
                >
                  {c && !c.isDead && (
                    <MobileBattleCard 
                      card={c} 
                      onLongPress={() => setPreviewCard(c)}
                    />
                  )}
                  {isValidPlacement && (
                    <span className="text-cyan-500 font-bold text-xl animate-pulse">+</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Action Button for End Turn (Desktop puts this in hand tray, we'll put it here above the tray) */}
      <button
        className={`fixed right-4 bottom-10 z-30 px-6 py-2 rounded-full font-display font-bold text-sm tracking-widest shadow-xl transition-all ${
          isSimulating 
            ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-red-800 to-red-900 text-white border border-red-500 hover:scale-105 active:scale-95'
        }`}
        onClick={handleEndTurn}
        disabled={isSimulating}
      >
        {isSimulating ? 'Combat...' : 'End Turn'}
      </button>

      {/* Hand Tray */}
      <MobileBattleHand
        hand={visualState.playerHand}
        playerMana={visualState.playerMana}
        selectedCardId={selectedHandCardId}
        onSelectCard={(id) => setSelectedHandCardId(id === selectedHandCardId ? null : id)}
        isSimulating={isSimulating}
      />

      {/* Previews & Modals */}
      {previewCard && (
        <MobileCardPreview card={previewCard} onClose={() => setPreviewCard(null)} />
      )}
      
      {/* End Game Overlay */}
      {(battle.phase === 'player_won' || battle.phase === 'player_lost') && !isSimulating && (
        <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-6 backdrop-blur-sm">
           <h1 className={`text-4xl font-display font-bold mb-4 uppercase ${battle.phase === 'player_won' ? 'text-amber-400' : 'text-red-600'}`}>
             {battle.phase === 'player_won' ? 'Victory' : 'Defeat'}
           </h1>
           <button 
             className="px-8 py-3 bg-zinc-800 border border-zinc-600 rounded text-white font-bold font-display uppercase tracking-widest"
             onClick={() => onExitBattle(battle.phase === 'player_won')}
           >
             Continue
           </button>
        </div>
      )}
    </div>
  );
};

export default MobileBattleView;
