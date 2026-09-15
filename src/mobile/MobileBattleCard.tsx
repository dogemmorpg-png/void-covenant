import React, { useRef, useState, useEffect } from 'react';
import { BattleCardState, CardSkill } from '../types';
import { getCardTierStyles } from '../utils/tierStyles';
import { Shield, Zap } from 'lucide-react';

interface MobileBattleCardProps {
  card: BattleCardState;
  isEnemy?: boolean;
  isSelected?: boolean;
  canAttack?: boolean;
  isValidTarget?: boolean;
  isValidPlacement?: boolean;
  onClick?: () => void;
  onLongPress?: () => void;
  animClass?: string;
}

const MobileBattleCard: React.FC<MobileBattleCardProps> = ({
  card,
  isEnemy = false,
  isSelected = false,
  canAttack = false,
  isValidTarget = false,
  isValidPlacement = false,
  onClick,
  onLongPress,
  animClass = '',
}) => {
  const [touchStartId, setTouchStartId] = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const timer = setTimeout(() => {
      if (onLongPress) {
        onLongPress();
      }
    }, 300);
    setTouchStartId(timer);
  };

  const handleTouchEnd = () => {
    if (touchStartId) {
      clearTimeout(touchStartId);
      setTouchStartId(null);
    }
  };

  if (card.isDead) {
    return <div className="w-full h-full bg-transparent" />;
  }

  const renderSkillDots = () => {
    if (!card.skills || card.skills.length === 0) return null;
    return (
      <div className="absolute top-1 right-1 flex flex-col gap-0.5 z-20">
        {card.skills.map((s, i) => {
          let bg = 'bg-gray-400';
          if (s.type === 'hex') bg = 'bg-purple-500';
          if (s.type === 'vampirism') bg = 'bg-red-500';
          if (s.type === 'plague') bg = 'bg-green-500';
          if (s.type === 'sacrifice') bg = 'bg-amber-500';
          return <div key={i} className={`w-2 h-2 rounded-full ${bg} border border-black`} />;
        })}
      </div>
    );
  };

  const isLowHealth = card.health < card.maxHealth / 3;
  const tierClass = getCardTierStyles(card.tier, isSelected, false);
  const baseWrapperClass = `relative w-full h-full rounded-md overflow-hidden bg-zinc-800 ${tierClass} ${animClass}`;
  const highlightClass = canAttack ? 'ring-2 ring-amber-400 animate-pulse' : 
                         isValidTarget ? 'ring-2 ring-red-500 animate-pulse' : 
                         isValidPlacement ? 'ring-2 ring-cyan-400' : '';

  return (
    <div 
      className={`${baseWrapperClass} ${highlightClass} transition-transform duration-200 select-none`}
      onClick={onClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
    >
      {/* Background (Color + Icon/Image) */}
      <div className={`absolute inset-0 opacity-60 ${card.color || 'bg-slate-700'}`}>
         {/* Placeholder for actual image if needed */}
         <div className="w-full h-full flex items-center justify-center opacity-30 text-white font-bold text-xs uppercase tracking-widest break-all p-1 text-center">
            {card.name.substring(0, 8)}
         </div>
      </div>

      {/* Hex Overlay */}
      {card.hexedAmount > 0 && (
        <div className="absolute inset-0 bg-purple-900/40 flex items-center justify-center pointer-events-none z-10">
           <Zap className="w-6 h-6 text-purple-400 opacity-60" />
        </div>
      )}

      {/* Barrier Overlay */}
      {(card.barrier || card.ward) && (
        <div className="absolute inset-0 border-2 border-cyan-400 bg-cyan-400/20 z-10 pointer-events-none rounded-md flex items-center justify-center">
          <Shield className="w-8 h-8 text-cyan-200 opacity-70" />
        </div>
      )}

      {renderSkillDots()}

      {/* Delay Timer */}
      {card.delay > 0 && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-600 border border-orange-300 rounded-full flex items-center justify-center z-30 shadow-md">
          <span className="text-[10px] text-white font-mono font-bold leading-none">{card.delay}</span>
        </div>
      )}

      {/* ATK/HP Badges */}
      <div className="absolute bottom-0 inset-x-0 h-6 flex justify-between px-0.5 pb-0.5 pointer-events-none z-20">
        <div className="bg-red-900 border border-red-500 rounded px-1 min-w-[20px] flex items-center justify-center shadow">
          <span className="text-white text-[11px] font-mono font-bold leading-none">{card.attack}</span>
        </div>
        <div className={`border rounded px-1 min-w-[20px] flex items-center justify-center shadow ${isLowHealth ? 'bg-red-800 border-red-400 animate-pulse' : 'bg-emerald-900 border-emerald-500'}`}>
          <span className="text-white text-[11px] font-mono font-bold leading-none">{card.health}</span>
        </div>
      </div>

      {/* Armor Badge */}
      {(card.armor || 0) > 0 && (
        <div className="absolute bottom-6 left-0.5 bg-slate-600 border border-slate-400 rounded px-1 flex items-center z-20 shadow">
          <Shield className="w-2.5 h-2.5 text-slate-200 mr-0.5" />
          <span className="text-slate-100 text-[9px] font-mono font-bold">{card.armor}</span>
        </div>
      )}
    </div>
  );
};

export default MobileBattleCard;
