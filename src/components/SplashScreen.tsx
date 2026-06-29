import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SplashScreenProps {
  onEnter: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onEnter }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleEnter = () => {
    setIsExiting(true);
    setTimeout(() => {
      onEnter();
    }, 800);
  };

  // Generate particle positions deterministically
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: `${(i * 37 + 13) % 100}%`,
    top: `${(i * 53 + 7) % 100}%`,
    size: 2 + (i % 3),
    delay: (i * 0.4) % 6,
    duration: 4 + (i % 5),
    symbol: i % 7 === 0, // Some particles are rune-like symbols
  }));

  const runeSymbols = ['ᚱ', 'ᛉ', 'ᛟ', 'ᚦ', 'ᛊ'];

  return (
    <AnimatePresence>
      {!isExiting ? (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: 'linear-gradient(180deg, #06070a 0%, #0b0c10 40%, #151a21 100%)' }}
        >
          {/* Radial vignette overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#06070a_100%)]" />

          {/* Floating particles / runes */}
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute pointer-events-none"
              style={{
                left: p.left,
                top: p.top,
                animation: `splashFloat ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
              }}
            >
              {p.symbol ? (
                <span
                  className="text-[#c5a880]/20 font-display select-none"
                  style={{
                    fontSize: `${10 + (p.id % 8)}px`,
                    animation: `splashPulse ${3 + (p.id % 3)}s ease-in-out ${p.delay}s infinite`,
                  }}
                >
                  {runeSymbols[p.id % runeSymbols.length]}
                </span>
              ) : (
                <div
                  className="rounded-full bg-[#c5a880]/15"
                  style={{
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    animation: `splashPulse ${2 + (p.id % 4)}s ease-in-out ${p.delay}s infinite`,
                  }}
                />
              )}
            </div>
          ))}

          {/* Central content */}
          <div className="relative z-10 flex flex-col items-center gap-6 px-4">
            {/* Pulsing Omega symbol */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.3, type: 'spring', stiffness: 100 }}
              className="relative"
            >
              <span
                className="text-6xl md:text-7xl font-display text-[#c5a880] select-none block"
                style={{
                  textShadow: '0 0 20px rgba(197,168,128,0.4), 0 0 40px rgba(197,168,128,0.2), 0 0 80px rgba(197,168,128,0.1)',
                  animation: 'splashOmegaPulse 3s ease-in-out infinite',
                }}
              >
                Ω
              </span>
              {/* Glow ring behind omega */}
              <div
                className="absolute inset-0 -m-6 rounded-full border border-[#c5a880]/10"
                style={{ animation: 'splashRingPulse 4s ease-in-out infinite' }}
              />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.6 }}
              className="font-display font-black text-4xl md:text-6xl text-white tracking-[0.25em] text-center select-none"
              style={{
                textShadow: '0 0 30px rgba(197,168,128,0.3), 0 0 60px rgba(197,168,128,0.15), 0 2px 4px rgba(0,0,0,0.8)',
                animation: 'splashTitleGlow 4s ease-in-out infinite',
              }}
            >
              VOID COVENANT
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.0 }}
              className="font-display text-sm md:text-base text-[#c5a880]/70 tracking-[0.4em] uppercase select-none"
            >
              Тёмная Карточная RPG
            </motion.p>

            {/* Decorative separator */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 1.3 }}
              className="w-48 h-px bg-gradient-to-r from-transparent via-[#c5a880]/40 to-transparent"
            />

            {/* Lore quote */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.5 }}
              className="text-xs md:text-sm text-gray-500 italic font-sans max-w-md text-center leading-relaxed select-none"
            >
              «From the abyss rises the one who seals the covenant...»
            </motion.p>

            {/* Enter button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.0 }}
              onClick={handleEnter}
              className="
                mt-6 px-10 py-3.5 
                bg-gradient-to-r from-[#151a21] to-[#0b0c10]
                border border-[#c5a880]/30
                hover:border-[#c5a880]/60
                hover:shadow-[0_0_25px_rgba(197,168,128,0.15)]
                rounded-xl
                font-display font-black text-sm text-[#ebd09b]
                tracking-[0.3em] uppercase
                transition-all duration-300
                cursor-pointer
                active:scale-95
                relative overflow-hidden
                group
              "
            >
              {/* Hover shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#c5a880]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative z-10">ENTER THE ABYSS</span>
            </motion.button>
          </div>

          {/* CSS Keyframes */}
          <style>{`
            @keyframes splashFloat {
              0% { transform: translateY(0px) translateX(0px); }
              100% { transform: translateY(-20px) translateX(10px); }
            }
            @keyframes splashPulse {
              0%, 100% { opacity: 0.2; }
              50% { opacity: 0.6; }
            }
            @keyframes splashOmegaPulse {
              0%, 100% { 
                transform: scale(1);
                text-shadow: 0 0 20px rgba(197,168,128,0.4), 0 0 40px rgba(197,168,128,0.2), 0 0 80px rgba(197,168,128,0.1);
              }
              50% { 
                transform: scale(1.05);
                text-shadow: 0 0 30px rgba(197,168,128,0.6), 0 0 60px rgba(197,168,128,0.3), 0 0 100px rgba(197,168,128,0.15);
              }
            }
            @keyframes splashRingPulse {
              0%, 100% { 
                transform: scale(1);
                opacity: 0.3;
              }
              50% { 
                transform: scale(1.15);
                opacity: 0.1;
              }
            }
            @keyframes splashTitleGlow {
              0%, 100% {
                text-shadow: 0 0 30px rgba(197,168,128,0.3), 0 0 60px rgba(197,168,128,0.15), 0 2px 4px rgba(0,0,0,0.8);
              }
              50% {
                text-shadow: 0 0 40px rgba(197,168,128,0.5), 0 0 80px rgba(197,168,128,0.25), 0 2px 4px rgba(0,0,0,0.8);
              }
            }
          `}</style>
        </motion.div>
      ) : (
        /* Fade-out overlay when exiting */
        <motion.div
          key="splash-exit"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-[10000] bg-[#06070a]"
        />
      )}
    </AnimatePresence>
  );
};
