import React from 'react';
import { useGame } from '../context/GameContext';
import { useToast } from '../components/Toast';

export const MobileTalentsView: React.FC = () => {
  const { profile } = useGame();
  
  return (
    <div className="w-full h-full p-2 flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 mb-2 rounded-full border border-amber-500 bg-amber-950 flex items-center justify-center">
         <span className="text-xl">⚡</span>
      </div>
      <h3 className="text-sm font-display font-bold text-amber-300 mb-1">COMMANDER TALENTS</h3>
      <p className="text-[9px] text-gray-400 max-w-[200px] mb-2 font-mono">
        Skill point allocation is optimized for desktop view. View this menu on PC to unlock new combat stances and passive bonuses.
      </p>
      <div className="text-[10px] bg-black/60 border border-gray-800 rounded px-2 py-1 font-mono text-gray-300">
        Available Points: <span className="text-amber-400 font-bold">{Math.max(0, (profile?.level || 1) - 1)}</span>
      </div>
    </div>
  );
};
