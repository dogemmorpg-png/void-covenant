import React from 'react';
import { motion } from 'motion/react';
import { ChevronDown, Swords, Sparkles, Trophy, Gem, Twitter, MessageCircle, Send } from 'lucide-react';

interface LandingPageProps {
  onConnectWallet: () => void;
  isConnecting: boolean;
}

// Floating particles (same approach as SplashScreen)
const particles = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  left: `${(i * 37 + 13) % 100}%`,
  top: `${(i * 53 + 7) % 100}%`,
  size: 2 + (i % 4),
  delay: (i * 0.4) % 8,
  duration: 5 + (i % 6),
  symbol: i % 6 === 0,
}));

const runeSymbols = ['ᚱ', 'ᛉ', 'ᛟ', 'ᚦ', 'ᛊ', 'ᚨ', 'ᛗ'];

const features = [
  {
    icon: '⚔️',
    title: 'Strategic Card Combat',
    desc: 'Deploy dark creatures, unleash devastating skills, and crush your enemies in tactical turn-based battles.',
  },
  {
    icon: <img src="/icons/icon_dust.png" alt="Dust" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" />,
    title: 'Dark Summoning Altar',
    desc: 'Open booster packs to summon powerful entities from Bronze to Legendary tier.',
  },
  {
    icon: '🏆',
    title: 'PvP Arena',
    desc: 'Challenge other players in ranked matches. Climb the leagues from Recruit to Abyss Master.',
  },
  {
    icon: <img src="/icons/icon_shards.png" alt="Shards" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" />,
    title: 'Blockchain Airdrop',
    desc: 'Connect your Solana wallet, complete quests, and earn $VOID tokens before the listing.',
  },
];

const steps = [
  {
    num: 1,
    title: 'Connect Wallet',
    desc: 'Link your Solana wallet to create your dark covenant.',
  },
  {
    num: 2,
    title: 'Build Your Deck',
    desc: 'Collect, fuse, and upgrade cards to forge an unstoppable army.',
  },
  {
    num: 3,
    title: 'Conquer the Abyss',
    desc: 'Battle through campaigns, dominate the arena, and claim legendary rewards.',
  },
];

const tokenStats = [
  { label: 'Total Supply', value: '1,000,000,000' },
  { label: 'Airdrop Allocation', value: '15%' },
  { label: 'Listing', value: 'Coming Soon' },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onConnectWallet, isConnecting }) => {
  return (
    <div className="min-h-screen bg-[#0b0c10] text-white overflow-x-hidden">
      {/* ============ HERO SECTION ============ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, #06070a 0%, #0b0c10 40%, #151a21 80%, #0b0c10 100%)' }}
        />

        {/* Radial vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#06070a_100%)]" />

        {/* Floating particles / runes */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute pointer-events-none"
            style={{
              left: p.left,
              top: p.top,
              animation: `landingFloat ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
            }}
          >
            {p.symbol ? (
              <span
                className="text-[#c5a880]/20 font-display select-none"
                style={{
                  fontSize: `${12 + (p.id % 10)}px`,
                  animation: `landingPulse ${3 + (p.id % 3)}s ease-in-out ${p.delay}s infinite`,
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
                  animation: `landingPulse ${2 + (p.id % 4)}s ease-in-out ${p.delay}s infinite`,
                }}
              />
            )}
          </div>
        ))}

        {/* Central content */}
        <div className="relative z-10 flex flex-col items-center gap-6 px-4 text-center">
          {/* Omega symbol */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2, type: 'spring', stiffness: 80 }}
            className="relative"
          >
            <span
              className="text-7xl md:text-9xl font-display text-[#c5a880] select-none block"
              style={{
                textShadow:
                  '0 0 20px rgba(197,168,128,0.4), 0 0 40px rgba(197,168,128,0.2), 0 0 80px rgba(197,168,128,0.1)',
                animation: 'landingOmegaPulse 3s ease-in-out infinite',
              }}
            >
              Ω
            </span>
            <div
              className="absolute inset-0 -m-8 rounded-full border border-[#c5a880]/10"
              style={{ animation: 'landingRingPulse 4s ease-in-out infinite' }}
            />
            <div
              className="absolute inset-0 -m-14 rounded-full border border-[#c5a880]/5"
              style={{ animation: 'landingRingPulse 5s ease-in-out 1s infinite' }}
            />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5 }}
            className="font-display font-black text-5xl md:text-7xl lg:text-8xl text-white tracking-[0.25em] select-none"
            style={{
              textShadow:
                '0 0 30px rgba(197,168,128,0.3), 0 0 60px rgba(197,168,128,0.15), 0 2px 4px rgba(0,0,0,0.8)',
              animation: 'landingTitleGlow 4s ease-in-out infinite',
            }}
          >
            VOID COVENANT
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="font-display text-sm md:text-base text-[#c5a880]/70 tracking-[0.4em] uppercase select-none"
          >
            Dark Card RPG
          </motion.p>

          {/* Separator */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="w-56 h-px bg-gradient-to-r from-transparent via-[#c5a880]/40 to-transparent"
          />

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.4 }}
            className="text-sm md:text-base text-gray-400 italic font-sans max-w-lg leading-relaxed select-none"
          >
            Command the darkness. Forge your covenant. Conquer the Abyss.
          </motion.p>

          {/* CTA Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.8 }}
            onClick={onConnectWallet}
            disabled={isConnecting}
            className={`
              mt-6 px-12 py-4
              bg-gradient-to-r from-[#151a21] to-[#0b0c10]
              border border-[#c5a880]/40
              hover:border-[#c5a880]/80
              hover:shadow-[0_0_30px_rgba(197,168,128,0.2)]
              rounded-xl
              font-display font-black text-sm md:text-base text-[#ebd09b]
              tracking-[0.3em] uppercase
              transition-all duration-300
              cursor-pointer
              active:scale-95
              relative overflow-hidden
              group
              disabled:opacity-60 disabled:cursor-wait
            `}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#c5a880]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span className={`relative z-10 ${isConnecting ? 'animate-pulse' : ''}`}>
              {isConnecting ? 'CONNECTING...' : 'CONNECT WALLET & PLAY'}
            </span>
          </motion.button>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
          className="absolute bottom-8 z-10 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] text-gray-600 font-mono tracking-widest uppercase">Scroll</span>
          <ChevronDown
            className="w-5 h-5 text-[#c5a880]/40"
            style={{ animation: 'landingChevronBounce 2s ease-in-out infinite' }}
          />
        </motion.div>
      </section>

      {/* ============ FEATURES SECTION ============ */}
      <section className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-display font-black text-3xl md:text-5xl text-white tracking-[0.2em] mb-4">
              FORGED IN DARKNESS
            </h2>
            <div className="w-32 h-px bg-gradient-to-r from-transparent via-[#c5a880]/40 to-transparent mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="bg-white/5 backdrop-blur-sm border border-[#c5a880]/10 rounded-2xl p-6 hover:border-[#c5a880]/30 hover:bg-white/[0.07] transition-all duration-300 group"
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-display font-bold text-lg text-[#ebd09b] mb-3 tracking-wide">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW TO PLAY SECTION ============ */}
      <section className="relative py-24 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0d0e14] to-transparent" />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-display font-black text-3xl md:text-5xl text-white tracking-[0.2em] mb-4">
              PATH TO POWER
            </h2>
            <div className="w-32 h-px bg-gradient-to-r from-transparent via-[#c5a880]/40 to-transparent mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-px bg-gradient-to-r from-[#c5a880]/20 via-[#c5a880]/30 to-[#c5a880]/20" />

            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-24 h-24 rounded-full border-2 border-[#c5a880]/40 bg-[#0b0c10] flex items-center justify-center mb-6 relative">
                  <span className="font-display font-black text-3xl text-[#ebd09b]">{s.num}</span>
                  <div
                    className="absolute inset-0 -m-1 rounded-full border border-[#c5a880]/10"
                    style={{ animation: 'landingRingPulse 4s ease-in-out infinite' }}
                  />
                </div>
                <h3 className="font-display font-bold text-xl text-[#ebd09b] mb-3 tracking-wider">{s.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed max-w-xs">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TOKENOMICS SECTION ============ */}
      <section className="relative py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="font-display font-black text-3xl md:text-5xl text-white tracking-[0.2em] mb-4">
              $VOID TOKEN
            </h2>
            <div className="w-32 h-px bg-gradient-to-r from-transparent via-[#c5a880]/40 to-transparent mx-auto mb-6" />
            <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
              The lifeblood of the covenant. Earn through gameplay, stake for rewards, trade on DEX.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6"
          >
            {tokenStats.map((s, i) => (
              <div
                key={i}
                className="relative rounded-2xl p-6 text-center bg-[#0b0c10] overflow-hidden group"
              >
                {/* Gradient border effect */}
                <div className="absolute inset-0 rounded-2xl border border-transparent bg-clip-border"
                  style={{
                    background: 'linear-gradient(135deg, rgba(78,7,7,0.4), rgba(197,168,128,0.2), rgba(78,7,7,0.4))',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                    padding: '1px',
                  }}
                />
                <p className="text-xs text-gray-500 font-mono tracking-widest uppercase mb-2">{s.label}</p>
                <p className="font-display font-black text-2xl md:text-3xl text-[#ebd09b]">{s.value}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-[#c5a880]/10 py-12 px-6">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
          {/* Social Links */}
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-white/5 border border-[#c5a880]/10 flex items-center justify-center hover:border-[#c5a880]/40 hover:bg-white/10 transition-all duration-300"
              aria-label="Twitter / X"
            >
              <Twitter className="w-4 h-4 text-gray-400" />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-white/5 border border-[#c5a880]/10 flex items-center justify-center hover:border-[#c5a880]/40 hover:bg-white/10 transition-all duration-300"
              aria-label="Telegram"
            >
              <Send className="w-4 h-4 text-gray-400" />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-white/5 border border-[#c5a880]/10 flex items-center justify-center hover:border-[#c5a880]/40 hover:bg-white/10 transition-all duration-300"
              aria-label="Discord"
            >
              <MessageCircle className="w-4 h-4 text-gray-400" />
            </a>
          </div>

          <p className="text-xs text-gray-600 font-mono tracking-wider">Built on Solana</p>

          <p className="text-xs text-gray-600 font-display tracking-widest">
            VOID COVENANT © 2024–2025
          </p>
        </div>
      </footer>

      {/* ============ CSS KEYFRAMES ============ */}
      <style>{`
        @keyframes landingFloat {
          0% { transform: translateY(0px) translateX(0px); }
          100% { transform: translateY(-25px) translateX(12px); }
        }
        @keyframes landingPulse {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.55; }
        }
        @keyframes landingOmegaPulse {
          0%, 100% {
            transform: scale(1);
            text-shadow: 0 0 20px rgba(197,168,128,0.4), 0 0 40px rgba(197,168,128,0.2), 0 0 80px rgba(197,168,128,0.1);
          }
          50% {
            transform: scale(1.05);
            text-shadow: 0 0 30px rgba(197,168,128,0.6), 0 0 60px rgba(197,168,128,0.3), 0 0 100px rgba(197,168,128,0.15);
          }
        }
        @keyframes landingRingPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.12);
            opacity: 0.08;
          }
        }
        @keyframes landingTitleGlow {
          0%, 100% {
            text-shadow: 0 0 30px rgba(197,168,128,0.3), 0 0 60px rgba(197,168,128,0.15), 0 2px 4px rgba(0,0,0,0.8);
          }
          50% {
            text-shadow: 0 0 40px rgba(197,168,128,0.5), 0 0 80px rgba(197,168,128,0.25), 0 2px 4px rgba(0,0,0,0.8);
          }
        }
        @keyframes landingChevronBounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(8px); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};
