import React, { useRef } from 'react';
import { Card } from '../types';
import { getCardTierStyles } from '../utils/tierStyles';

interface MobileBattleHandProps {
  hand: Card[];
  playerMana: number;
  selectedCardId: string | null;
  onSelectCard: (cardId: string) => void;
  isSimulating: boolean;
}

const MobileBattleHand: React.FC<MobileBattleHandProps> = ({
  hand,
  playerMana,
  selectedCardId,
  onSelectCard,
  isSimulating
}) => {
  const [expanded, setExpanded] = React.useState(false);
  const startY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (startY.current === null) return;
    const endY = e.changedTouches[0].clientY;
    const delta = endY - startY.current;
    
    // swipe up to expand, swipe down to collapse
    if (delta < -30 && !expanded) {
      setExpanded(true);
    } else if (delta > 30 && expanded) {
      setExpanded(false);
    }
    startY.current = null;
  };

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-700 transition-all duration-300 z-40 rounded-t-xl flex flex-col`}
      style={{ height: expanded ? '45vh' : '32px' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Handle/Tray Header */}
      <div 
        className="h-8 flex items-center justify-center bg-zinc-800/80 cursor-pointer rounded-t-xl shrink-0 border-b border-zinc-700/50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-12 h-1 bg-zinc-500 rounded-full mb-1 absolute top-1" />
        <span className="text-zinc-300 text-xs font-display tracking-widest mt-2 uppercase">
          Hand ({hand.length} Cards) {expanded ? '▼' : '▲'}
        </span>
      </div>

      {/* Expanded Content */}
      <div className={`flex-1 overflow-x-auto overflow-y-hidden flex items-center gap-3 px-4 py-2 ${!expanded ? 'hidden' : ''}`}>
        {hand.map(card => {
          const canAfford = playerMana >= (card.manaCost || 1);
          const isSelected = selectedCardId === card.id;
          const tierClass = getCardTierStyles(card.tier, isSelected, false);
          
          return (
            <div
              key={card.id}
              onClick={() => {
                if (isSimulating || !canAfford) return;
                onSelectCard(card.id);
                setExpanded(false);
              }}
              className={`relative w-28 h-40 shrink-0 rounded-lg overflow-hidden transition-all duration-200 ${
                !canAfford || isSimulating ? 'opacity-50 grayscale' : 'cursor-pointer hover:-translate-y-2'
              } ${isSelected ? 'ring-2 ring-amber-400 -translate-y-2' : ''} ${tierClass}`}
            >
              {/* Bg */}
              <div className={`absolute inset-0 opacity-80 ${card.color || 'bg-slate-700'}`} />
              
              {/* Mana Cost */}
              <div className="absolute top-1 left-1 bg-cyan-900 border border-cyan-400 rounded-full w-6 h-6 flex items-center justify-center shadow-lg z-10">
                <span className="text-white text-xs font-bold font-mono">{card.manaCost || 1}</span>
              </div>
              
              {/* Delay */}
              {card.delay > 0 && (
                <div className="absolute top-1 right-1 bg-orange-700 border border-orange-400 rounded-full w-5 h-5 flex items-center justify-center shadow-lg z-10">
                  <span className="text-white text-[10px] font-bold font-mono">{card.delay}</span>
                </div>
              )}

              {/* Name */}
              <div className="absolute top-8 inset-x-0 text-center px-1">
                <span className="text-white text-xs font-bold leading-tight drop-shadow-md truncate block">
                  {card.name}
                </span>
              </div>

              {/* Stats */}
              <div className="absolute bottom-1 inset-x-1 flex justify-between">
                <div className="bg-red-900/90 border border-red-500 rounded px-1.5 py-0.5">
                  <span className="text-white text-xs font-bold font-mono">{card.attack}</span>
                </div>
                <div className="bg-emerald-900/90 border border-emerald-500 rounded px-1.5 py-0.5">
                  <span className="text-white text-xs font-bold font-mono">{card.health}</span>
                </div>
              </div>
            </div>
          );
        })}
        {hand.length === 0 && (
          <div className="w-full text-center text-zinc-500 text-sm font-display italic">
            Hand is empty
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileBattleHand;
