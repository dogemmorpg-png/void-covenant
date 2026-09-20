import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCw, Maximize, Sparkles } from 'lucide-react';

interface MobileOrientationGuardProps {
  isMobile: boolean;
  isPortrait: boolean;
  disableRotatePrompt?: boolean;
  children: React.ReactNode;
}

export const MobileOrientationGuard: React.FC<MobileOrientationGuardProps> = ({
  isMobile,
  isPortrait,
  disableRotatePrompt = false,
  children,
}) => {
  const [hasRequestedFullscreen, setHasRequestedFullscreen] = useState(false);

  // Initialize Telegram WebApp fullscreen ONLY for mobile devices
  useEffect(() => {
    if (isMobile) {
      document.body.classList.add('mobile-locked');
    } else {
      document.body.classList.remove('mobile-locked');
    }

    if (!isMobile) return; // NEVER run on desktop PC — prevents consuming user gesture for wallet extensions

    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      try {
        tg.ready();
        tg.expand();
        if (typeof tg.disableVerticalSwipes === 'function') {
          tg.disableVerticalSwipes();
        }
      } catch (e) {
        console.warn('Telegram WebApp setup error:', e);
      }
    }

    return () => {
      document.body.classList.remove('mobile-locked');
    };
  }, [isMobile]);

  const requestLandscapeAndFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        setHasRequestedFullscreen(true);
      }
    } catch {
      // Fullscreen not permitted without direct click or on iOS
    }

    try {
      if (window.screen?.orientation && 'lock' in window.screen.orientation) {
        await (window.screen.orientation as any).lock('landscape');
      }
    } catch {
      // Screen orientation lock not supported on this browser
    }
  };

  // Show prompt if on mobile device AND in portrait orientation AND not disabled
  const showRotatePrompt = !disableRotatePrompt && isMobile && isPortrait;

  return (
    <>
      <AnimatePresence>
        {showRotatePrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-[#07080c] flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden"
          >
            {/* Ambient occult glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(221,44,64,0.15)_0%,transparent_70%)] pointer-events-none" />
            <div className="absolute w-72 h-72 rounded-full bg-purple-900/20 blur-3xl pointer-events-none" />

            {/* Rotating phone visual illustration */}
            <div className="relative mb-8 flex items-center justify-center">
              <motion.div
                animate={{
                  rotate: [0, 0, -90, -90, 0],
                  scale: [1, 1, 1.08, 1.08, 1],
                }}
                transition={{
                  duration: 3.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="w-24 h-40 rounded-2xl border-2 border-[#ebd09b] bg-[#141019] shadow-[0_0_35px_rgba(235,208,155,0.4)] flex flex-col items-center justify-between p-2 relative"
              >
                {/* Speaker pill */}
                <div className="w-8 h-1 rounded-full bg-[#ebd09b]/40" />
                {/* Screen content animation */}
                <div className="w-full h-24 rounded-lg bg-black/60 border border-white/10 flex flex-col items-center justify-center gap-1">
                  <span className="text-[#ebd09b] text-xl font-display font-black">Ω</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-4 rounded bg-amber-500/30 border border-amber-500/50" />
                    <div className="w-3 h-4 rounded bg-purple-500/30 border border-purple-500/50" />
                    <div className="w-3 h-4 rounded bg-cyan-500/30 border border-cyan-500/50" />
                  </div>
                </div>
                {/* Home bar */}
                <div className="w-6 h-1 rounded-full bg-white/30" />
              </motion.div>

              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-[#c5a880]/20 border border-[#c5a880]/50 flex items-center justify-center text-[#ebd09b] shadow-[0_0_15px_rgba(235,208,155,0.3)]"
              >
                <RotateCw className="w-5 h-5 text-amber-300" />
              </motion.div>
            </div>

            {/* Typography */}
            <div className="max-w-sm space-y-3 relative z-10">
              <div className="flex items-center justify-center gap-2 text-xs font-mono tracking-widest text-[#c5a880] uppercase">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Mobile Battlefield Mode</span>
              </div>
              <h2 className="font-display font-black text-2xl text-white tracking-wider uppercase leading-tight">
                Rotate Device <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ebd09b] via-[#c5a880] to-[#997d5a]">
                  to Landscape
                </span>
              </h2>
              <p className="font-serif italic text-xs text-gray-400 leading-relaxed">
                Enable auto-rotate in your phone settings and turn your device horizontally to enter the Battlefield.
              </p>
            </div>

            {/* Fullscreen button */}
            <button
              onClick={requestLandscapeAndFullscreen}
              className="mt-6 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#221c17] via-[#2f241a] to-[#221c17] border border-[#c5a880]/50 hover:border-[#ebd09b] text-[#ebd09b] font-display text-xs tracking-widest uppercase shadow-[0_0_20px_rgba(0,0,0,0.8)] active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Maximize className="w-3.5 h-3.5 text-amber-400" />
              <span>Enter Fullscreen</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Render children game content directly */}
      <div className={showRotatePrompt ? 'hidden' : 'w-full min-h-full flex-1 flex flex-col'}>
        {children}
      </div>
    </>
  );
};
