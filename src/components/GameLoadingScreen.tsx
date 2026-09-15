import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface GameLoadingScreenProps {
  statusText?: string;
}

export const GameLoadingScreen: React.FC<GameLoadingScreenProps> = ({
  statusText = 'Loading...'
}) => {
  return (
    <div className="fixed inset-0 z-[99999] w-full h-[100dvh] bg-[#07080c] text-white flex flex-col items-center justify-center select-none overflow-hidden p-4">
      {/* Occult atmospheric background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(221,44,64,0.18)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute w-80 h-80 rounded-full bg-amber-600/10 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(197,168,128,0.08)_0%,transparent_60%)] pointer-events-none" />

      {/* Decorative occult corner runes */}
      <div className="absolute top-3 left-3 text-[#ebd09b]/30 font-serif text-xs pointer-events-none">⟦Ω⟧</div>
      <div className="absolute top-3 right-3 text-[#ebd09b]/30 font-serif text-xs pointer-events-none">⟦Ω⟧</div>
      <div className="absolute bottom-3 left-3 text-[#ebd09b]/30 font-serif text-xs pointer-events-none">⟦Ω⟧</div>
      <div className="absolute bottom-3 right-3 text-[#ebd09b]/30 font-serif text-xs pointer-events-none">⟦Ω⟧</div>

      {/* Center Medallion */}
      <div className="relative mb-4 flex items-center justify-center">
        {/* Outer pulsing ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="w-20 h-20 rounded-full border border-[#ebd09b]/40 border-dashed"
        />

        {/* Inner glowing medallion */}
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-14 h-14 rounded-full bg-gradient-to-br from-[#2a0c10] via-[#150608] to-black border-2 border-[#dd2c40] flex items-center justify-center shadow-[0_0_25px_rgba(221,44,64,0.6)]"
        >
          <span className="font-display font-black text-xl text-[#dd2c40] drop-shadow-[0_0_10px_rgba(221,44,64,0.9)]">
            Ω
          </span>
        </motion.div>
      </div>

      {/* Game Branding */}
      <div className="text-center space-y-1 relative z-10">
        <h1 className="font-display font-black text-xl sm:text-2xl text-white tracking-[0.25em] text-shadow-gold">
          VOID COVENANT
        </h1>
        <p className="text-[9px] sm:text-[10px] text-[#ebd09b]/80 font-mono tracking-[0.3em] uppercase">
          DARK TACTICAL CARD RPG
        </p>
      </div>

      {/* Shimmering Progress Bar */}
      <div className="mt-5 w-48 sm:w-56 relative">
        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden relative">
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1/2 h-full bg-gradient-to-r from-transparent via-[#ebd09b] to-transparent shadow-[0_0_12px_rgba(235,208,155,0.9)]"
          />
        </div>
      </div>

      {/* Status Text */}
      <div className="mt-3 flex items-center gap-1.5 text-[11px] font-mono text-gray-400 tracking-wider">
        <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
        <span className="text-amber-200/90 animate-pulse">
          {statusText}
        </span>
      </div>
    </div>
  );
};
