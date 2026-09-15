import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface GameLoadingScreenProps {
  statusText?: string;
}

export const GameLoadingScreen: React.FC<GameLoadingScreenProps> = ({
  statusText = 'INITIALIZING TELEGRAM SESSION...'
}) => {
  return (
    <div className="fixed inset-0 w-full h-full bg-[#07080c] flex flex-col items-center justify-center select-none overflow-hidden z-50 p-6">
      {/* Occult atmospheric background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(221,44,64,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute w-96 h-96 rounded-full bg-amber-600/10 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(197,168,128,0.08)_0%,transparent_60%)] pointer-events-none" />

      {/* Center Medallion */}
      <div className="relative mb-6 flex items-center justify-center">
        {/* Outer pulsing ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          className="w-24 h-24 rounded-full border border-[#ebd09b]/30 border-dashed"
        />

        {/* Inner glowing medallion */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-16 h-16 rounded-full bg-gradient-to-br from-[#2a0c10] via-[#150608] to-black border-2 border-[#dd2c40]/80 flex items-center justify-center shadow-[0_0_30px_rgba(221,44,64,0.5)]"
        >
          <span className="font-display font-black text-2xl text-[#dd2c40] drop-shadow-[0_0_12px_rgba(221,44,64,0.9)]">
            Ω
          </span>
        </motion.div>
      </div>

      {/* Game Branding */}
      <div className="text-center space-y-2 relative z-10">
        <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-[0.25em] text-shadow-gold">
          VOID COVENANT
        </h1>
        <p className="text-[10px] sm:text-xs text-[#ebd09b]/70 font-mono tracking-[0.3em] uppercase">
          DARK TACTICAL RPG
        </p>
      </div>

      {/* Shimmering Progress Bar */}
      <div className="mt-8 w-56 sm:w-64 relative">
        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden relative">
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1/2 h-full bg-gradient-to-r from-transparent via-[#ebd09b] to-transparent shadow-[0_0_10px_rgba(235,208,155,0.8)]"
          />
        </div>
      </div>

      {/* Status Text */}
      <div className="mt-4 flex items-center gap-2 text-xs font-mono text-gray-400 tracking-wider">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span className="text-amber-200/90 text-[11px] animate-pulse">
          {statusText}
        </span>
      </div>
    </div>
  );
};
