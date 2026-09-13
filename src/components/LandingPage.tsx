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
    icon: <img src="/icons/icon_dust.webp" alt="Dust" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" />,
    title: 'Dark Summoning Altar',
    desc: 'Open booster packs to summon powerful entities from Bronze to Legendary tier.',
  },
  {
    icon: '🏆',
    title: 'PvP Arena',
    desc: 'Challenge other players in ranked matches. Climb the leagues from Recruit to Abyss Master.',
  },
  {
    icon: <img src="/icons/icon_shards.webp" alt="Shards" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" />,
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

      {/* ============ PROLOGUE / LORE INTRO ============ */}
      <section className="relative py-28 px-6 overflow-hidden border-t border-[#c5a880]/15">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(197,168,128,0.04),transparent_70%)] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8 }}
          >
            <span className="font-mono text-xs uppercase tracking-[0.35em] text-[#c5a880]/80 block mb-2">
              — The Ancient Prophecy —
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-[0.2em] uppercase">
              The Abyss Awakens
            </h2>
          </motion.div>

          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-32 h-px bg-gradient-to-r from-transparent via-[#c5a880]/50 to-transparent mx-auto"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-base sm:text-lg md:text-xl text-gray-300 font-serif italic leading-relaxed max-w-3xl mx-auto"
          >
            “Beyond the dying stars of the mortal spheres lies the Nether Realm — an eternal abyss where fallen kings, forgotten gods, and ancient eldritch nightmares lie slumbering in iron seals.”
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-sm sm:text-base text-gray-400 font-sans leading-relaxed max-w-2xl mx-auto pt-2"
          >
            You are an exiled warlord called to forge a blood covenant. Through the ritual altar, you bind shadows to your will, wield devastating relics of forgotten eras, and clash against rival summoners in ruthless tactical supremacy.
          </motion.p>
        </div>

        {/* Panoramic Concept Artwork Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1 }}
          className="max-w-5xl mx-auto mt-16 relative rounded-3xl overflow-hidden border border-[#c5a880]/25 shadow-[0_20px_80px_rgba(0,0,0,0.9)] group"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-transparent to-transparent z-10 pointer-events-none opacity-80" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,#0b0c10_95%)] z-10 pointer-events-none" />
          
          <img
            src="/landing_void_realm.jpg"
            alt="The Nether Realm of the Void"
            className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-1000"
          />

          <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10 z-20 max-w-md">
            <span className="font-mono text-[11px] text-[#c5a880] tracking-widest uppercase block mb-1">Sanctuary of the Void</span>
            <h3 className="font-display font-black text-xl sm:text-2xl text-white tracking-wider uppercase drop-shadow-md">
              A Shattered Cosmic Nether
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 mt-1 font-sans leading-snug drop-shadow">
              Endless citadel spires adrift in cosmic storms, where every step demands sacrifice and tactical mastery.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ============ THE THREE PILLARS (GAMEPLAY HOOKS) ============ */}
      <section className="relative py-28 px-6 bg-gradient-to-b from-[#0b0c10] via-[#0e1017] to-[#0b0c10] border-t border-b border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <span className="font-mono text-xs uppercase tracking-[0.35em] text-[#c5a880]/80 block mb-2">
              — The Laws of the Covenant —
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-[0.2em] uppercase">
              Three Pillars of Sovereignty
            </h2>
            <div className="w-32 h-px bg-gradient-to-r from-transparent via-[#c5a880]/40 to-transparent mx-auto mt-4" />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Pillar 1: Tactical Depth */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="bg-gradient-to-b from-black/80 via-[#10131b]/60 to-black/90 border border-[#c5a880]/20 hover:border-[#c5a880]/60 rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group transition-all duration-500 hover:-translate-y-2"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/20 transition-colors" />

              <div className="space-y-5 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-950 via-black to-black border border-purple-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.35)] group-hover:scale-110 transition-transform">
                  <span className="text-2xl">⚔️</span>
                </div>

                <div>
                  <span className="font-mono text-[10px] text-purple-400 font-bold uppercase tracking-widest block mb-1">Pillar I</span>
                  <h3 className="font-display font-black text-2xl text-white tracking-wide uppercase group-hover:text-[#ebd09b] transition-colors">
                    Dark Tactical Sorcery
                  </h3>
                </div>

                <p className="text-sm text-gray-300 font-sans leading-relaxed">
                  No mindless brawling. Every duel is a deadly game of chess where positioning, mana management, turn delays, and creature sacrifices decide the fate of kingdoms.
                </p>

                <div className="pt-2 border-t border-white/10 space-y-2 text-xs font-mono text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    <span>Dynamic Stances: Aggressive, Defensive, Strategic</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    <span>Calculated turn delays and ritual spells</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-white/5 font-mono text-[11px] text-[#c5a880]/70 uppercase tracking-wider">
                Turn-Based Mind Games
              </div>
            </motion.div>

            {/* Pillar 2: High-Stakes PvP */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="bg-gradient-to-b from-black/80 via-[#180f12]/60 to-black/90 border border-rose-500/30 hover:border-rose-500/70 rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group transition-all duration-500 hover:-translate-y-2"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-rose-500/20 transition-colors" />

              <div className="space-y-5 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-950 via-black to-black border border-rose-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.35)] group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🏆</span>
                </div>

                <div>
                  <span className="font-mono text-[10px] text-rose-400 font-bold uppercase tracking-widest block mb-1">Pillar II</span>
                  <h3 className="font-display font-black text-2xl text-white tracking-wide uppercase group-hover:text-rose-200 transition-colors">
                    The Colosseum of Gods
                  </h3>
                </div>

                <p className="text-sm text-gray-300 font-sans leading-relaxed">
                  Fight your way through seven ruthless ranked leagues. From bloodied Initiates to the Void Overlords and the two-seat apex of the Divine League, where only the strongest survive the daily culling.
                </p>

                <div className="pt-2 border-t border-white/10 space-y-2 text-xs font-mono text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    <span>Real-time ranking ladder with daily promotions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    <span>Aegis Peace Shields to guard hard-won Crowns</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-white/5 font-mono text-[11px] text-rose-300/80 uppercase tracking-wider">
                Unforgiving Arena Ladder
              </div>
            </motion.div>

            {/* Pillar 3: Web3 Sovereignty */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="bg-gradient-to-b from-black/80 via-[#18130a]/60 to-black/90 border border-amber-500/30 hover:border-amber-400/70 rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group transition-all duration-500 hover:-translate-y-2"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/20 transition-colors" />

              <div className="space-y-5 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-950 via-black to-black border border-amber-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.35)] group-hover:scale-110 transition-transform">
                  <span className="text-2xl">⚜️</span>
                </div>

                <div>
                  <span className="font-mono text-[10px] text-amber-400 font-bold uppercase tracking-widest block mb-1">Pillar III</span>
                  <h3 className="font-display font-black text-2xl text-white tracking-wide uppercase group-hover:text-amber-200 transition-colors">
                    Sovereign Domination
                  </h3>
                </div>

                <p className="text-sm text-gray-300 font-sans leading-relaxed">
                  Your triumphs echo into eternity. Rulers of the highest arena divisions harvest daily Sovereign tribute dividends directly to their Solana wallets. Power in the Void yields tangible supremacy.
                </p>

                <div className="pt-2 border-t border-white/10 space-y-2 text-xs font-mono text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>Daily Sovereign dividends for elite conquerors</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>Gasless, instant Solana wallet authentication</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-white/5 font-mono text-[11px] text-amber-300/80 uppercase tracking-wider">
                True Spoils of War
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ============ ATMOSPHERIC DUAL SHOWCASE (CINEMATIC WORLD) ============ */}
      <section className="relative py-28 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto space-y-24">
          
          {/* Feature 1: The Clash of Wills */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-6 space-y-6"
            >
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-purple-400 font-bold block">
                — Clash of Shadows —
              </span>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-white tracking-wide uppercase leading-tight">
                Every Card is an Oath Bound in Blood
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-sans">
                You do not simply play spells. You forge unholy pacts with ancient Horrors, Death Knights, Seraphs of the Apocalypse, and Primordial Dragons. Sacrifice footmen to empower dreadlords, trigger turn-reversal counters, and turn absolute defeat into overwhelming victory.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-black/50 border border-white/10 rounded-2xl p-4">
                  <span className="font-display font-black text-2xl text-purple-300 block">100+</span>
                  <span className="text-xs text-gray-400 font-mono">Dark Fantasy Entities</span>
                </div>
                <div className="bg-black/50 border border-white/10 rounded-2xl p-4">
                  <span className="font-display font-black text-2xl text-amber-300 block">6</span>
                  <span className="text-xs text-gray-400 font-mono">Creature Factions</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-6 relative rounded-3xl overflow-hidden border-2 border-purple-500/30 shadow-[0_10px_50px_rgba(168,85,247,0.2)] group"
            >
              <img
                src="/landing_warlord_duel.jpg"
                alt="Clash of Dark Fantasy Warlords"
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
            </motion.div>
          </div>

          {/* Feature 2: The Altar of the Nether */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center lg:flex-row-reverse">
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-6 space-y-6 lg:order-2"
            >
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-amber-400 font-bold block">
                — Primordial Awakening —
              </span>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-white tracking-wide uppercase leading-tight">
                Summon From the Nether Altar
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-sans">
                Burn Void Dust and offerings to manifest sealed booster tomes and ancient relics. Assemble the fabled 6-piece Demiurge Relic set, awaken dormant socket runes, and customize your combat stance to outmaneuver any challenger.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-black/50 border border-white/10 rounded-2xl p-4">
                  <span className="font-display font-black text-2xl text-rose-400 block">Demiurge</span>
                  <span className="text-xs text-gray-400 font-mono">Sacred Equipment Set</span>
                </div>
                <div className="bg-black/50 border border-white/10 rounded-2xl p-4">
                  <span className="font-display font-black text-2xl text-emerald-400 block">3 Trees</span>
                  <span className="text-xs text-gray-400 font-mono">Hero Combat Talents</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-6 relative rounded-3xl overflow-hidden border-2 border-amber-500/30 shadow-[0_10px_50px_rgba(245,158,11,0.2)] group lg:order-1"
            >
              <img
                src="/landing_cards_altar.jpg"
                alt="Ancient Dark Altar of Summoning"
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
            </motion.div>
          </div>

        </div>
      </section>

      {/* ============ HOW TO BEGIN (THE PATH OF THE INITIATE) ============ */}
      <section className="relative py-28 px-6 bg-[#080a0e] border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <span className="font-mono text-xs uppercase tracking-[0.35em] text-[#c5a880]/80 block mb-2">
              — The Ritual of Descent —
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-[0.2em] uppercase">
              How to Enter the Abyss
            </h2>
            <div className="w-32 h-px bg-gradient-to-r from-transparent via-[#c5a880]/40 to-transparent mx-auto mt-4" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-black/60 border border-white/10 rounded-2xl p-8 text-center relative flex flex-col items-center group hover:border-[#c5a880]/50 transition-colors"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-[#1c1208] to-black border border-amber-500/40 flex items-center justify-center font-display font-black text-2xl text-[#ebd09b] mb-6 shadow-[0_0_15px_rgba(245,158,11,0.2)] group-hover:scale-110 transition-transform">
                I
              </div>
              <h3 className="font-display font-black text-lg text-white uppercase tracking-wider mb-2">
                Connect Wallet
              </h3>
              <p className="text-sm text-gray-400 font-sans leading-relaxed">
                Connect your Solana wallet in one click. Instant cryptographic login, zero friction, and secure decentralized identity.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="bg-black/60 border border-white/10 rounded-2xl p-8 text-center relative flex flex-col items-center group hover:border-purple-500/50 transition-colors"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-[#180824] to-black border border-purple-500/40 flex items-center justify-center font-display font-black text-2xl text-purple-300 mb-6 shadow-[0_0_15px_rgba(168,85,247,0.2)] group-hover:scale-110 transition-transform">
                II
              </div>
              <h3 className="font-display font-black text-lg text-white uppercase tracking-wider mb-2">
                Awaken Your Army
              </h3>
              <p className="text-sm text-gray-400 font-sans leading-relaxed">
                Receive starter battle cards, open booster packs at the Altar, and configure your hero's combat stance for battle.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-black/60 border border-white/10 rounded-2xl p-8 text-center relative flex flex-col items-center group hover:border-rose-500/50 transition-colors"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-[#24080e] to-black border border-rose-500/40 flex items-center justify-center font-display font-black text-2xl text-rose-300 mb-6 shadow-[0_0_15px_rgba(244,63,94,0.2)] group-hover:scale-110 transition-transform">
                III
              </div>
              <h3 className="font-display font-black text-lg text-white uppercase tracking-wider mb-2">
                Conquer the Leagues
              </h3>
              <p className="text-sm text-gray-400 font-sans leading-relaxed">
                Defeat abyss commanders in the campaign or enter the Arena to challenge real players and claim daily Sovereign spoils.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ FINAL EPIC CALL TO ACTION ============ */}
      <section className="relative py-32 px-6 overflow-hidden border-t border-[#c5a880]/20 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,168,128,0.08),transparent_70%)] pointer-events-none" />

        <div className="max-w-3xl mx-auto relative z-10 space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#1c1208] to-black border-2 border-[#c5a880]/60 flex items-center justify-center shadow-[0_0_25px_rgba(197,168,128,0.4)]"
          >
            <span className="font-display font-black text-2xl text-[#c5a880]">Ω</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="space-y-3"
          >
            <h2 className="font-display font-black text-3xl sm:text-5xl md:text-6xl text-white tracking-[0.2em] uppercase leading-tight">
              The Covenant Awaits
            </h2>
            <p className="text-base sm:text-lg text-gray-400 font-serif italic max-w-xl mx-auto">
              Darkness will claim the hesitant. Step through the void gate and claim your rightful throne.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="pt-4"
          >
            <button
              onClick={onConnectWallet}
              disabled={isConnecting}
              className="px-12 py-4 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:from-amber-500 hover:via-yellow-400 hover:to-amber-500 text-black font-display font-black text-sm sm:text-base tracking-[0.3em] uppercase rounded-xl transition-all duration-300 shadow-[0_0_35px_rgba(245,158,11,0.4)] hover:shadow-[0_0_50px_rgba(245,158,11,0.7)] cursor-pointer hover:scale-105 active:scale-95"
            >
              {isConnecting ? 'CONNECTING...' : 'ENTER THE VOID'}
            </button>
          </motion.div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-white/10 py-12 px-6 bg-black/80">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
          {/* Social Links */}
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-white/5 border border-[#c5a880]/20 flex items-center justify-center hover:border-[#c5a880]/60 hover:bg-white/10 transition-all duration-300"
              aria-label="Twitter / X"
            >
              <Twitter className="w-4 h-4 text-gray-400 hover:text-amber-300 transition-colors" />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-white/5 border border-[#c5a880]/20 flex items-center justify-center hover:border-[#c5a880]/60 hover:bg-white/10 transition-all duration-300"
              aria-label="Telegram"
            >
              <Send className="w-4 h-4 text-gray-400 hover:text-amber-300 transition-colors" />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-white/5 border border-[#c5a880]/20 flex items-center justify-center hover:border-[#c5a880]/60 hover:bg-white/10 transition-all duration-300"
              aria-label="Discord"
            >
              <MessageCircle className="w-4 h-4 text-gray-400 hover:text-amber-300 transition-colors" />
            </a>
          </div>

          <p className="text-xs text-gray-500 font-mono tracking-widest uppercase">
            Powered by Solana Blockchain • Instant On-Chain Verification
          </p>

          <p className="text-xs text-gray-600 font-display tracking-widest">
            VOID COVENANT © 2024–2026 • DARK TACTICAL TCG
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
