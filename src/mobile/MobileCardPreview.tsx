import React from 'react';
import { BattleCardState, Card } from '../types';
import { getCardTierStyles } from '../utils/tierStyles';

interface MobileCardPreviewProps {
  card: BattleCardState | Card;
  onClose: () => void;
}

const MobileCardPreview: React.FC<MobileCardPreviewProps> = ({ card, onClose }) => {
  const tierClass = getCardTierStyles(card.tier, false, false);
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className={`relative w-[60%] max-w-sm rounded-xl overflow-hidden shadow-2xl ${tierClass}`}
        onClick={(e) => e.stopPropagation()} // Prevent close when clicking card itself
      >
        <div className={`absolute inset-0 opacity-70 ${card.color || 'bg-slate-800'}`} />
        
        {/* Header: Mana & Delay */}
        <div className="relative z-10 flex justify-between p-3 pb-0">
          <div className="bg-cyan-900 border-2 border-cyan-400 rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
            <span className="text-white text-sm font-bold font-mono">{card.manaCost || 1}</span>
          </div>
          {card.delay > 0 && (
            <div className="bg-orange-700 border-2 border-orange-400 rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-bold font-mono">{card.delay}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center p-4">
           {/* Visual mock */}
           <div className="w-24 h-24 mb-3 border-2 border-white/20 rounded-lg flex items-center justify-center bg-black/40">
             <span className="text-4xl">⚔️</span>
           </div>
           
           <h2 className="text-white text-xl font-display font-bold text-center leading-tight mb-1">
             {card.name}
           </h2>
           <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-4">
             Level {card.level} • {card.tier}
           </p>

           {/* Skills */}
           {card.skills && card.skills.length > 0 ? (
             <div className="w-full bg-black/60 rounded p-2 mb-4">
               {card.skills.map((skill, idx) => (
                 <div key={idx} className="mb-2 last:mb-0">
                   <div className="text-sm font-bold text-white capitalize">{skill.type} {skill.value}</div>
                   <div className="text-xs text-zinc-300">{skill.description}</div>
                 </div>
               ))}
             </div>
           ) : (
             <div className="w-full h-8" />
           )}
        </div>

        {/* Footer Stats */}
        <div className="relative z-10 bg-black/80 flex justify-between p-3 border-t border-white/10">
          <div className="flex items-center gap-1 bg-red-900/90 border border-red-500 rounded px-3 py-1">
            <span className="text-red-300 text-xs font-bold uppercase">ATK</span>
            <span className="text-white text-base font-bold font-mono">{card.attack}</span>
          </div>
          <div className="flex items-center gap-1 bg-emerald-900/90 border border-emerald-500 rounded px-3 py-1">
            <span className="text-emerald-300 text-xs font-bold uppercase">HP</span>
            <span className="text-white text-base font-bold font-mono">{card.health} / {card.maxHealth}</span>
          </div>
        </div>

        {/* Buffs/Debuffs (only for BattleCardState) */}
        {'hexedAmount' in card && card.hexedAmount > 0 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-900/90 border border-purple-500 rounded px-3 py-1 text-center z-20 shadow-xl">
             <span className="text-purple-300 text-sm font-bold block">HEXED</span>
             <span className="text-white text-xs">{card.hexedAmount} stacks</span>
          </div>
        )}

      </div>
      
      {/* Close instruction */}
      <div className="absolute bottom-4 inset-x-0 text-center text-zinc-400 text-sm pointer-events-none">
        Tap anywhere to close
      </div>
    </div>
  );
};

export default MobileCardPreview;
