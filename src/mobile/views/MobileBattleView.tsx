import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { useToast } from '../../components/Toast';
import { CampaignStage, BattleState, BattleCardState } from '../../types';
import { initializeBattle, simulateCombatTurn, placeCardLocally } from '../../utils/gameLogic';
import { calculateEquipmentSetBonuses } from '../../data/equipment';
import { Swords, Skull, Shield, ArrowLeft, Scroll, Star, HelpCircle, X, Info, Zap } from 'lucide-react';
import { assetPreloader } from '../../utils/assetPreloader';

interface MobileBattleViewProps {
  stage: CampaignStage;
  onExitBattle: (isVictory: boolean) => void;
  battleType?: 'campaign' | 'pvp';
}

const getTierBorder = (tier: string) => {
  switch (tier?.toLowerCase()) {
    case 'divine': return 'border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]';
    case 'legendary': return 'border-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]';
    case 'gold': return 'border-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.5)]';
    case 'silver': return 'border-slate-300 shadow-[0_0_4px_rgba(203,213,225,0.4)]';
    default: return 'border-amber-700/60';
  }
};

export const MobileBattleView: React.FC<MobileBattleViewProps> = ({
  stage,
  onExitBattle,
  battleType = 'campaign'
}) => {
  const { profile, submitBattleResult } = useGame();
  const toast = useToast();

  // Calculate equipment bonuses
  const equippedList = Object.values(profile.equipped || {})
    .map(eqId => profile.equipment?.find(e => e.id === eqId))
    .filter(Boolean) as any[];

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
    hp: demiurgeBonus?.totalBonuses.creatureHpBuff || 0
  };

  const enemyDemiurgeBonus = stage.enemyEquipment && stage.enemyEquipment.length > 0
    ? calculateEquipmentSetBonuses(stage.enemyEquipment).find(s => s.setId === 'demiurge')
    : undefined;

  const enemyHeroMaxHealth = stage.enemyHeroHealth > 0 ? stage.enemyHeroHealth : (30 + ((stage.enemyLevel || 1) - 1) * 2);

  // Initialize Battle
  const [battle, setBattle] = useState<BattleState>(() => initializeBattle(
    (profile?.collection || []).filter(c => (profile?.deck || []).includes(c.id)),
    stage,
    (profile?.heroMaxHealth || 30) + getEquipmentBonus('maxHealth'),
    getEquipmentBonus('dodge'),
    getEquipmentBonus('delayReduction'),
    startingPlayerMana,
    playerCreatureBuff,
    enemyHeroMaxHealth,
    stage.enemyDodgeChance || 0,
    stage.enemyDelayReduction || 0,
    stage.enemyStartingMana || 1,
    stage.enemyCreatureBuff || { atk: 0, hp: 0 }
  ));

  const [visualState, setVisualState] = useState<BattleState>(battle);
  const [selectedHandCardId, setSelectedHandCardId] = useState<string | null>(null);
  const [inspectCard, setInspectCard] = useState<any | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showLogDrawer, setShowLogDrawer] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [speed, setSpeed] = useState<1 | 2>(1);

  // Preload cards
  useEffect(() => {
    if (stage?.enemyDeck) assetPreloader.preloadBattleCreatures(stage.enemyDeck);
    const playerDeck = (profile?.collection || []).filter(c => (profile?.deck || []).includes(c.id));
    assetPreloader.preloadBattleCreatures(playerDeck);
  }, [stage, profile?.deck]);

  // Handle Play Card onto slot
  const handlePlayCard = (slotIndex: number) => {
    if (!selectedHandCardId || isSimulating) return;
    const card = battle.playerHand.find(c => c.id === selectedHandCardId);
    if (!card) return;

    const cost = card.manaCost || 1;
    if (battle.playerMana < cost) {
      toast("Not enough Mana crystals!", 'warning');
      return;
    }

    const nextState = placeCardLocally(battle, selectedHandCardId, slotIndex);
    setBattle(nextState);
    setVisualState(nextState);
    setSelectedHandCardId(null);
  };

  // Turn Execution Sequence
  const handleEndTurn = async () => {
    if (isSimulating) return;
    setIsSimulating(true);

    try {
      // Simulate combat turn via game logic engine
      const stepSequence: any[] = [];
      const nextBattleState = simulateCombatTurn(battle, stepSequence);

      // Play through simulation
      setVisualState(nextBattleState);
      setBattle(nextBattleState);

      // Check battle end
      if (nextBattleState.phase === 'player_won' || nextBattleState.phase === 'enemy_won') {
        const isVictory = nextBattleState.phase === 'player_won';
        if (battleType === 'campaign') {
          submitBattleResult('campaign', stage.id.toString(), isVictory ? 'victory' : 'loss').catch(() => {});
        } else {
          submitBattleResult('pvp', 'pvp', isVictory ? 'victory' : 'loss').catch(() => {});
        }
      }
    } catch (e) {
      console.error('Turn simulation error:', e);
    } finally {
      setIsSimulating(false);
    }
  };

  const isPlayerWon = battle.phase === 'player_won';
  const isEnemyWon = battle.phase === 'enemy_won';
  const isGameOver = isPlayerWon || isEnemyWon;

  // Selected card reference
  const selectedHandCard = selectedHandCardId ? battle.playerHand.find(c => c.id === selectedHandCardId) : null;

  return (
    <div className="h-full w-full bg-[#070504] text-white flex flex-col justify-between select-none relative overflow-hidden font-sans">
      {/* 1. TOP HEADER BAR (Telegram-safe insets) */}
      <div 
        style={{
          paddingLeft: 'max(4.5rem, env(safe-area-inset-left, 4.5rem))',
          paddingRight: 'max(4.75rem, env(safe-area-inset-right, 4.75rem))'
        }}
        className="h-[32px] bg-[#120d0a]/95 border-b border-[#ebd09b]/15 flex items-center justify-between px-2 shrink-0 z-30"
      >
        {/* Escape Button */}
        <button
          onClick={() => {
            if (window.confirm(battleType === 'pvp' ? 'Surrender duel and lose crowns?' : 'Escape battle? Energy will not be refunded.')) {
              onExitBattle(false);
            }
          }}
          className="flex items-center gap-1 text-[9px] font-mono font-bold text-amber-400 bg-black/60 hover:bg-black/90 px-2 py-0.5 rounded border border-amber-950/40 cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-3 h-3" /> ESCAPE
        </button>

        {/* Turn Indicator */}
        <div className="flex items-center gap-2 font-display font-black text-xs tracking-wider uppercase text-white">
          <span className="text-amber-200">{stage.name}</span>
          <span className="text-gray-600">•</span>
          <span className="text-amber-400 font-mono">TURN {visualState.turn}</span>
        </div>

        {/* Rules & Log buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSpeed(s => s === 1 ? 2 : 1)}
            className="text-[8.5px] font-mono font-bold text-gray-300 bg-black/60 px-1.5 py-0.5 rounded border border-white/10 hover:text-white"
          >
            {speed}X
          </button>
          <button
            onClick={() => setShowLogDrawer(true)}
            className="flex items-center gap-1 text-[8.5px] font-display font-bold text-[#ebd09b] bg-black/60 px-2 py-0.5 rounded border border-[#ebd09b]/30 cursor-pointer"
          >
            <Scroll className="w-3 h-3" /> LOG
          </button>
        </div>
      </div>

      {/* 2. THE 5v5 BATTLEFIELD ARENA TABLE */}
      <div className="flex-1 relative flex flex-col justify-center px-2 py-1 min-h-0">
        
        {/* Enemy Hero HUD (Top-Left corner) */}
        <div 
          style={{ left: 'max(1rem, env(safe-area-inset-left, 1rem))' }}
          className="absolute top-1 flex items-center gap-1.5 z-20 bg-black/70 border border-red-500/30 rounded-full py-0.5 pl-0.5 pr-2"
        >
          <div className="w-8 h-8 rounded-full border-2 border-red-500 bg-red-950 overflow-hidden shrink-0 flex items-center justify-center">
            {stage.enemyHeroImage ? (
              <img src={stage.enemyHeroImage} alt="" className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/avatars/knight.webp'; }} />
            ) : (
              <Skull className="w-4 h-4 text-red-500" />
            )}
          </div>
          <div className="leading-tight">
            <span className="text-[8px] font-display font-bold text-gray-300 block truncate max-w-[65px] leading-none">
              {stage.enemyHeroName || stage.name}
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[10px] font-mono font-black text-red-400 leading-none">
                ❤️ {visualState.enemyHeroHealth}
              </span>
            </div>
          </div>
        </div>

        {/* Player Hero HUD (Bottom-Left corner) */}
        <div 
          style={{ left: 'max(1rem, env(safe-area-inset-left, 1rem))' }}
          className="absolute bottom-1 flex items-center gap-1.5 z-20 bg-black/70 border border-cyan-500/30 rounded-full py-0.5 pl-0.5 pr-2"
        >
          <div className="w-8 h-8 rounded-full border-2 border-cyan-400 bg-cyan-950 overflow-hidden shrink-0 flex items-center justify-center">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/avatars/knight.webp'; }} />
            ) : (
              <Shield className="w-4 h-4 text-cyan-400" />
            )}
          </div>
          <div className="leading-tight">
            <span className="text-[8px] font-display font-bold text-gray-300 block truncate max-w-[65px] leading-none">
              {profile.username || 'Lord'}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-mono font-black text-cyan-400 leading-none">
                ❤️ {visualState.playerHeroHealth}
              </span>
              <span className="text-[9px] font-mono font-black text-amber-300 leading-none">
                💎 {visualState.playerMana}/{visualState.playerMaxMana}
              </span>
            </div>
          </div>
        </div>

        {/* Right Thumb Zone: END TURN / CANCEL Button */}
        <div 
          style={{ right: 'max(1rem, env(safe-area-inset-right, 1rem))' }}
          className="absolute top-1/2 -translate-y-1/2 z-30"
        >
          {selectedHandCardId ? (
            <button
              onClick={() => setSelectedHandCardId(null)}
              className="w-20 h-10 bg-gradient-to-b from-red-600 to-red-900 border-2 border-red-400 text-white font-display font-black text-[10px] tracking-wider uppercase rounded-xl shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center leading-none"
            >
              ✕ CANCEL
            </button>
          ) : (
            <button
              disabled={isSimulating}
              onClick={handleEndTurn}
              className="w-22 h-11 bg-gradient-to-b from-amber-400 via-amber-500 to-yellow-600 hover:brightness-110 disabled:opacity-40 border-2 border-[#ebd09b] text-black font-display font-black text-[11px] tracking-wider uppercase rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.4)] active:scale-95 transition-all cursor-pointer flex items-center justify-center leading-none"
            >
              {isSimulating ? 'COMBAT...' : 'END TURN'}
            </button>
          )}
        </div>

        {/* Board Center Table (5 vs 5 Slots) */}
        <div className="max-w-[580px] mx-auto w-full flex flex-col justify-center gap-2 my-auto">
          {/* Row 1: ENEMY BOARD (5 slots) */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {visualState.enemyBoard.map((card, idx) => (
              <div 
                key={`enemy-slot-${idx}`}
                className="aspect-[13/18] max-h-[88px] rounded-lg border border-red-950/40 bg-black/50 relative overflow-hidden flex flex-col justify-between p-0.5 shadow-inner"
              >
                {card ? (
                  <div 
                    onClick={() => setInspectCard(card)}
                    className={`w-full h-full relative rounded flex flex-col justify-between border ${getTierBorder(card.tier)} cursor-pointer`}
                  >
                    {card.image && <img src={card.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-85" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    
                    {/* Top stats: Tier & Delay */}
                    <div className="relative z-10 flex justify-between items-center px-0.5 text-[7px] font-mono text-gray-300">
                      <span className="truncate max-w-[36px] font-bold">{card.name}</span>
                      {card.delay > 0 && (
                        <span className="bg-purple-950/90 text-purple-300 px-1 rounded font-black">
                          ⏳{card.delay}
                        </span>
                      )}
                    </div>

                    {/* Bottom: ATK & HP Badges */}
                    <div className="relative z-10 flex justify-between px-0.5 pb-0.5 text-[9px] font-mono font-black text-white leading-none">
                      <span className="text-red-400 bg-black/70 px-1 py-0.2 rounded">{card.attack}</span>
                      <span className="text-emerald-400 bg-black/70 px-1 py-0.2 rounded">{card.health}</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[7.5px] font-mono text-gray-700">
                    EMPTY
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Center Divider with Clash Line */}
          <div className="h-[1px] bg-gradient-to-r from-transparent via-[#ebd09b]/25 to-transparent relative my-0.5" />

          {/* Row 2: PLAYER BOARD (5 slots) */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {visualState.playerBoard.map((card, idx) => {
              const canPlace = selectedHandCard && !card && !isSimulating && battle.playerMana >= (selectedHandCard.manaCost || 1);
              return (
                <div 
                  key={`player-slot-${idx}`}
                  onClick={() => canPlace && handlePlayCard(idx)}
                  className={`aspect-[13/18] max-h-[88px] rounded-lg border relative overflow-hidden flex flex-col justify-between p-0.5 transition-all duration-200 ${
                    canPlace 
                      ? 'border-emerald-400 bg-emerald-950/40 shadow-[0_0_12px_rgba(16,185,129,0.4)] cursor-pointer animate-pulse' 
                      : 'border-cyan-950/40 bg-black/50'
                  }`}
                >
                  {card ? (
                    <div 
                      onClick={() => setInspectCard(card)}
                      className={`w-full h-full relative rounded flex flex-col justify-between border ${getTierBorder(card.tier)} cursor-pointer`}
                    >
                      {card.image && <img src={card.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-85" />}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                      
                      {/* Top stats: Name & Delay */}
                      <div className="relative z-10 flex justify-between items-center px-0.5 text-[7px] font-mono text-gray-300">
                        <span className="truncate max-w-[36px] font-bold">{card.name}</span>
                        {card.delay > 0 && (
                          <span className="bg-purple-950/90 text-purple-300 px-1 rounded font-black">
                            ⏳{card.delay}
                          </span>
                        )}
                      </div>

                      {/* Bottom: ATK & HP Badges */}
                      <div className="relative z-10 flex justify-between px-0.5 pb-0.5 text-[9px] font-mono font-black text-white leading-none">
                        <span className="text-red-400 bg-black/70 px-1 py-0.2 rounded">{card.attack}</span>
                        <span className="text-emerald-400 bg-black/70 px-1 py-0.2 rounded">{card.health}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[7.5px] font-mono">
                      {canPlace ? (
                        <span className="text-emerald-300 font-bold uppercase tracking-wider">TAP HERE</span>
                      ) : (
                        <span className="text-gray-700">EMPTY</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* 3. DEDICATED MOBILE HAND DOCK (Bottom dock, does NOT overlap the board!) */}
      <div className="h-[76px] bg-[#0c0907]/95 border-t border-[#ebd09b]/15 px-3 py-1 flex items-center justify-center shrink-0 z-30">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-[560px]">
          {visualState.playerHand.map((card) => {
            const isSelected = selectedHandCardId === card.id;
            const canAfford = battle.playerMana >= (card.manaCost || 1);
            return (
              <div
                key={card.id}
                onClick={() => {
                  if (isSimulating) return;
                  setSelectedHandCardId(prev => prev === card.id ? null : card.id);
                }}
                className={`w-[52px] h-[68px] rounded-lg border bg-gray-950 relative overflow-hidden shrink-0 flex flex-col justify-between p-0.5 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'ring-2 ring-cyan-400 -translate-y-1 shadow-[0_0_15px_rgba(6,182,212,0.8)] border-cyan-300'
                    : canAfford 
                      ? `${getTierBorder(card.tier)} hover:border-amber-400` 
                      : 'opacity-50 border-gray-800'
                }`}
              >
                {/* Art */}
                {card.image && <img src={card.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                {/* Top: Mana Cost Crystal & Inspect icon */}
                <div className="relative z-10 flex justify-between items-center">
                  <div className="w-3.5 h-3.5 rounded-full bg-cyan-600 border border-cyan-300 flex items-center justify-center text-[7.5px] font-mono font-black text-black">
                    {card.manaCost || 1}
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setInspectCard(card); }}
                    className="text-gray-400 hover:text-white p-0.5"
                  >
                    <Info className="w-2.5 h-2.5" />
                  </button>
                </div>

                {/* Bottom: ATK & HP Badges */}
                <div className="relative z-10 flex justify-between text-[8px] font-mono font-black text-white leading-none pb-0.5 px-0.5">
                  <span className="text-red-400 bg-black/80 px-0.5 rounded">{card.attack}</span>
                  <span className="text-emerald-400 bg-black/80 px-0.5 rounded">{card.health}</span>
                </div>
              </div>
            );
          })}

          {visualState.playerHand.length === 0 && (
            <div className="text-[9px] font-mono text-gray-500 py-2">
              No cards in hand. Draw on next turn.
            </div>
          )}
        </div>
      </div>

      {/* 4. CARD INSPECT MODAL (Only when explicitly tapped, with clear close button!) */}
      {inspectCard && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-[#120e0b] border-2 border-amber-500/50 rounded-2xl max-w-xs w-full p-3.5 space-y-2.5 shadow-2xl relative">
            <button 
              onClick={() => setInspectCard(null)}
              className="absolute top-2.5 right-2.5 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-12 h-16 rounded-lg border border-amber-400 overflow-hidden shrink-0 bg-black relative">
                {inspectCard.image && <img src={inspectCard.image} alt="" className="w-full h-full object-cover" />}
              </div>
              <div>
                <h4 className="font-display font-black text-sm text-white">{inspectCard.name}</h4>
                <div className="flex items-center gap-1.5 text-[9px] font-mono text-amber-300 mt-0.5">
                  <span className="uppercase">{inspectCard.tier}</span>
                  <span>•</span>
                  <span>Lv.{inspectCard.level || 1}</span>
                  <span>•</span>
                  <span>💎 {inspectCard.manaCost || 1} Mana</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono font-bold mt-1">
                  <span className="text-red-400">⚔️ {inspectCard.attack} ATK</span>
                  <span className="text-emerald-400">❤️ {inspectCard.health} HP</span>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-black/50 p-2 rounded-lg border border-white/5 space-y-1">
              <span className="text-[8px] font-mono text-gray-400 uppercase font-bold block">Abilities</span>
              {(inspectCard.skills || []).length === 0 ? (
                <span className="text-[9px] font-mono text-gray-500 italic">No special abilities</span>
              ) : (
                (inspectCard.skills || []).map((s: any, idx: number) => (
                  <div key={idx} className="text-[9px] font-mono text-amber-200">
                    <span className="font-black uppercase">{s.type} {s.value}:</span> {s.type === 'vampirism' ? 'Heals on attack' : (s.type === 'plague' ? 'Spreads poison every turn' : 'Special skill')}
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setInspectCard(null)}
              className="w-full py-1.5 bg-white/10 hover:bg-white/20 text-white font-display font-bold text-[10px] uppercase rounded-lg transition-all"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* 5. VICTORY / DEFEAT MODAL */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3">
          <div className="bg-[#120e0b] border-2 border-amber-500/60 rounded-2xl max-w-sm w-full p-4 text-center space-y-3 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center border-2 ${
              isPlayerWon ? 'border-amber-400 bg-amber-950/60 shadow-[0_0_20px_rgba(245,158,11,0.5)]' : 'border-red-500 bg-red-950/60 shadow-[0_0_20px_rgba(239,68,68,0.5)]'
            }`}>
              {isPlayerWon ? <Trophy className="w-6 h-6 text-amber-300" /> : <Skull className="w-6 h-6 text-red-400" />}
            </div>

            <div>
              <h3 className={`font-display font-black text-xl tracking-wider uppercase ${isPlayerWon ? 'text-amber-300 text-shadow-gold' : 'text-red-500'}`}>
                {isPlayerWon ? (battleType === 'pvp' ? 'ARENA VICTORY!' : 'STAGE CLEARED!') : 'DEFEAT'}
              </h3>
              <p className="font-sans text-[10px] text-gray-400 mt-0.5">
                {isPlayerWon 
                  ? (battleType === 'pvp' ? 'You vanquished the enemy summoner and gained crowns.' : 'The guardian has fallen before your covenant.')
                  : 'Your forces were overwhelmed. Strengthen your deck and return.'}
              </p>
            </div>

            {isPlayerWon && (
              <div className="flex items-center justify-center gap-2 font-mono text-xs font-bold text-amber-300 bg-black/50 py-1.5 rounded-lg border border-amber-950/40">
                <span>+{stage.goldReward || 50} Gold</span>
                <span>•</span>
                <span>+{stage.dustReward || 25} Dust</span>
                {battleType === 'pvp' && <span>• +20 👑</span>}
              </div>
            )}

            <button
              onClick={() => onExitBattle(isPlayerWon)}
              className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:brightness-110 text-black font-display font-black text-xs uppercase tracking-wider rounded-xl shadow-lg cursor-pointer active:scale-95 transition-all"
            >
              CONTINUE
            </button>
          </div>
        </div>
      )}

      {/* 6. DUEL LOG DRAWER */}
      {showLogDrawer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
          <div className="w-72 bg-[#0e0a08] border-l border-[#ebd09b]/30 h-full p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="font-display font-bold text-xs text-amber-300 uppercase">Combat Chronicle</span>
              <button onClick={() => setShowLogDrawer(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-1 my-2 text-[9px] font-mono text-gray-300">
              {visualState.combatLog.map((log, idx) => (
                <div key={idx} className="bg-black/40 p-1.5 rounded border border-white/5">
                  <span dangerouslySetInnerHTML={{ __html: log }} />
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowLogDrawer(false)}
              className="w-full py-1.5 bg-white/10 hover:bg-white/20 text-white font-display font-bold text-[10px] uppercase rounded-lg"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
