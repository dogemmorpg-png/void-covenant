import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface GameLoadingScreenProps {
  statusText?: string;
  progress?: number;
}

const LORE_TIPS = [
  {
    category: "TACTICAL DOCTRINE",
    tip: "Positioning dictates linear clash priority. Vanguard creatures absorb the brunt of the assault."
  },
  {
    category: "SACRED WARDS",
    tip: "Barrier wards negate 100% of damage from the next incoming attack, preserving critical guardians."
  },
  {
    category: "ABYSSAL RELICS",
    tip: "Consecrate Relics of the Demiurge to awaken devastating set bonuses and passive mastery."
  },
  {
    category: "COVENANT RITUAL",
    tip: "Vampiric entities siphon blood essence, restoring your Lord's health on every strike."
  },
  {
    category: "BLOOD SACRIFICE",
    tip: "Sacrificing wounded allies channels raw essence directly to your Lord, turning defeat into triumph."
  },
  {
    category: "ARENA OF SOVEREIGNS",
    tip: "Victory in the PvP Arena awards Crowns and Sovereign dividends to strengthen your permanent vault."
  }
];

export const GameLoadingScreen: React.FC<GameLoadingScreenProps> = ({
  statusText = 'Entering the Void...'
}) => {
  const [tipIndex, setTipIndex] = useState(0);

  // Cycle lore tips smoothly
  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex(prev => (prev + 1) % LORE_TIPS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const currentTip = LORE_TIPS[tipIndex];

  return (
    <div className="fixed inset-0 z-[99999] w-full h-[100dvh] bg-[#040508] text-white flex flex-col justify-between items-center select-none overflow-hidden p-4 sm:p-8 safe-area-padding">
      
      {/* 1. Cinematic Background Artwork with Slow Breathing Pan */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.img
          src="/landing_void_realm.jpg"
          alt="Void Realm"
          initial={{ scale: 1.02 }}
          animate={{ scale: [1.02, 1.07, 1.02] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          className="w-full h-full object-cover filter blur-[1.5px]"
        />
        {/* Layered dark fantasy atmospheric gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#040508] via-[#05070c]/70 to-[#040508]/85" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_15%,rgba(3,4,7,0.88)_75%)]" />
        <div className="absolute inset-0 bg-noise opacity-[0.035] pointer-events-none" />
      </div>

      {/* 2. Ornate Gothic Corner Filigrees */}
      <svg className="absolute top-3 left-3 w-10 h-10 pointer-events-none text-[#c5a880]/50 z-20 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" viewBox="0 0 48 48" fill="none" stroke="currentColor">
        <path d="M4 24V8a4 4 0 0 1 4-4h16" strokeWidth="2" />
        <path d="M8 20V8h12" strokeWidth="1" opacity="0.6" />
        <circle cx="8" cy="8" r="2.5" fill="#e6aa45" />
        <path d="M4 14c4 0 6-2 6-6" strokeWidth="1.2" />
        <path d="M14 4c0 4 2 6 6 6" strokeWidth="1.2" />
      </svg>
      <svg className="absolute top-3 right-3 w-10 h-10 pointer-events-none text-[#c5a880]/50 z-20 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" viewBox="0 0 48 48" fill="none" stroke="currentColor">
        <path d="M44 24V8a4 4 0 0 0-4-4H24" strokeWidth="2" />
        <path d="M40 20V8H28" strokeWidth="1" opacity="0.6" />
        <circle cx="40" cy="8" r="2.5" fill="#e6aa45" />
        <path d="M44 14c-4 0-6-2-6-6" strokeWidth="1.2" />
        <path d="M34 4c0 4-2 6-6 6" strokeWidth="1.2" />
      </svg>
      <svg className="absolute bottom-3 left-3 w-10 h-10 pointer-events-none text-[#c5a880]/50 z-20 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" viewBox="0 0 48 48" fill="none" stroke="currentColor">
        <path d="M4 24v16a4 4 0 0 0 4 4h16" strokeWidth="2" />
        <path d="M8 28v12h12" strokeWidth="1" opacity="0.6" />
        <circle cx="8" cy="40" r="2.5" fill="#e6aa45" />
        <path d="M4 34c4 0 6 2 6 6" strokeWidth="1.2" />
        <path d="M14 44c0-4 2-6 6-6" strokeWidth="1.2" />
      </svg>
      <svg className="absolute bottom-3 right-3 w-10 h-10 pointer-events-none text-[#c5a880]/50 z-20 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" viewBox="0 0 48 48" fill="none" stroke="currentColor">
        <path d="M44 24v16a4 4 0 0 1-4 4H24" strokeWidth="2" />
        <path d="M40 28v12H28" strokeWidth="1" opacity="0.6" />
        <circle cx="40" cy="40" r="2.5" fill="#e6aa45" />
        <path d="M44 34c-4 0-6 2-6 6" strokeWidth="1.2" />
        <path d="M34 44c0-4-2-6-6-6" strokeWidth="1.2" />
      </svg>

      {/* 3. Top System Initialization Badge */}
      <div className="relative z-10 pt-2 flex flex-col items-center">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-[#c5a880]/30 backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span className="text-[9px] font-mono text-[#ebd09b] tracking-widest uppercase font-bold">
            VOID COVENANT • THE ABYSSAL ODYSSEY
          </span>
        </div>
      </div>

      {/* 4. Centerpiece: Demiurge Relic Emblem & Title */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto py-4">
        
        {/* Sacred Runic Halo and Winged Eye Emblem */}
        <div className="relative w-44 h-44 sm:w-56 sm:h-56 flex items-center justify-center mb-3">
          
          {/* Ambient Crimson / Void Flare */}
          <div className="absolute inset-0 bg-rose-600/20 rounded-full blur-2xl animate-pulse pointer-events-none" />
          <div className="absolute w-32 h-32 rounded-full bg-amber-500/15 blur-xl pointer-events-none" />

          {/* Rotating Sacred Runic Halo SVG */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 pointer-events-none opacity-40"
          >
            <svg className="w-full h-full text-[#c5a880]" viewBox="0 0 200 200" fill="none" stroke="currentColor">
              <circle cx="100" cy="100" r="92" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx="100" cy="100" r="84" strokeWidth="1.5" />
              <circle cx="100" cy="100" r="74" strokeWidth="0.8" opacity="0.6" />
              <polygon points="100,20 120,80 180,100 120,120 100,180 80,120 20,100 80,80" strokeWidth="0.8" opacity="0.3" />
            </svg>
          </motion.div>

          {/* Majestic Demiurge Crest Emblem */}
          <motion.img
            src="/icons/equipment/demiurge_crest.png"
            alt="Demiurge Crest"
            animate={{ scale: [0.97, 1.03, 0.97] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-36 h-36 sm:w-48 sm:h-48 object-contain filter drop-shadow-[0_0_30px_rgba(225,29,72,0.7)] drop-shadow-[0_0_10px_rgba(235,208,155,0.4)] relative z-10 select-none pointer-events-none"
          />
        </div>

        {/* Sculpted Title Block */}
        <div className="text-center space-y-1.5 relative z-10 px-4">
          <h1 className="font-display font-black text-2xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-b from-[#fff6e0] via-[#ebd09b] to-[#b88c4a] tracking-[0.28em] drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] uppercase">
            VOID COVENANT
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className="w-6 h-[1px] bg-gradient-to-r from-transparent to-[#c5a880]/60" />
            <p className="text-[9px] sm:text-[11px] text-[#ebd09b]/85 font-mono tracking-[0.35em] uppercase font-semibold">
              DARK FANTASY TACTICAL CARD RPG
            </p>
            <span className="w-6 h-[1px] bg-gradient-to-l from-transparent to-[#c5a880]/60" />
          </div>
        </div>

      </div>

      {/* 5. Bottom Section: Relic Progress Bar & Lore Tip Card */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center space-y-3 pb-3 sm:pb-5">
        
        {/* Dynamic Gothic Progress Bar */}
        <div className="w-64 sm:w-80 relative">
          <div className="h-3 sm:h-3.5 w-full rounded-full border border-[#c5a880]/50 bg-black/90 p-[2px] shadow-[0_4px_20px_rgba(0,0,0,0.95),inset_0_2px_5px_rgba(0,0,0,0.9)] overflow-hidden relative">
            {/* Background glowing track */}
            <div className="w-full h-full rounded-full bg-gradient-to-r from-red-950 via-amber-950 to-red-950 relative overflow-hidden">
              {/* Pulsing Traversing Light Beam */}
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                className="w-1/2 h-full bg-gradient-to-r from-transparent via-[#f5ba54] to-transparent shadow-[0_0_15px_rgba(245,158,11,0.9)]"
              />
            </div>
          </div>
        </div>

        {/* Live Technical Status Text */}
        <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono tracking-widest uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          <span className="text-amber-200/90 font-bold drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
            {statusText}
          </span>
        </div>

        {/* Rotating Lore Tip Card */}
        <div className="w-full bg-[#0a0e16]/85 border border-[#c5a880]/25 rounded-xl p-2.5 sm:p-3 shadow-[0_4px_20px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-md min-h-[64px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={tipIndex}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.35 }}
              className="text-center space-y-1"
            >
              <span className="text-[8px] sm:text-[8.5px] font-mono font-bold text-amber-400/90 tracking-widest uppercase block">
                ✦ {currentTip.category} ✦
              </span>
              <p className="text-[10px] sm:text-[11px] font-sans text-gray-300 leading-snug px-2">
                "{currentTip.tip}"
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
};
