import React from 'react';
import { motion } from 'motion/react';
import { ChevronDown, Twitter, Send } from 'lucide-react';

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
      {/* =========================================================================
          2. FEATURED CARDS SHOWCASE (Real Game Art, Zero Generic Icons)
         ========================================================================= */}
      <section className="relative py-24 px-6 border-t border-[#c5a880]/20 bg-gradient-to-b from-[#07080b] via-[#0d1017] to-[#07080b]">
        <div className="max-w-6xl mx-auto space-y-16">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#c5a880] block font-bold">
              — The Armies of the Nether —
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-wider uppercase leading-tight">
              Command 99 Creatures of Darkness
            </h2>
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed font-serif italic">
              Every battle is a psychological war. Build lethal decks of vampires, undead horrors, and ancient void entities where strategic positioning and calculated timing outplay raw power.
            </p>
          </div>

          {/* 3 Real Interactive Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
            
            {/* Card 1: Void Overlord */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative rounded-2xl p-5 bg-gradient-to-b from-[#1c1226] via-[#100b17] to-[#08050e] border-2 border-purple-500/50 shadow-[0_0_35px_rgba(168,85,247,0.25)] hover:shadow-[0_0_50px_rgba(168,85,247,0.45)] hover:border-purple-400 transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-purple-500/30 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-purple-300 font-bold uppercase tracking-widest block">Legendary Tier</span>
                    <h3 className="font-display font-black text-xl text-white uppercase tracking-wide">Void Overlord</h3>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-purple-950/80 border border-purple-400/60 flex items-center justify-center font-mono font-black text-sm text-purple-200">
                    3T
                  </div>
                </div>

                {/* Card Artwork */}
                <div className="relative rounded-xl overflow-hidden aspect-[4/5] border border-purple-500/40 shadow-inner group-hover:border-purple-400 transition-colors">
                  <img
                    src="/cards/void_overlord.webp"
                    alt="Void Overlord"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80" />
                  
                  {/* Stats Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
                    <div className="px-3 py-1 rounded-lg bg-red-950/90 border border-red-500/60 text-red-300 font-display font-black text-sm shadow-md">
                      8 ATK
                    </div>
                    <div className="px-3 py-1 rounded-lg bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 font-display font-black text-sm shadow-md">
                      35 HP
                    </div>
                  </div>
                </div>

                {/* Card Lore & Traits */}
                <p className="text-xs text-gray-300 leading-relaxed font-sans italic">
                  “The apex monarch of the void spires. Siphons life with each strike while spreading incurable pestilence through enemy battle lines.”
                </p>

                {/* Trait Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-[11px] font-mono text-purple-300">
                    Hex
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[11px] font-mono text-emerald-300">
                    Plague
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-[11px] font-mono text-red-300">
                    Vampirism
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Card 2: Blood Queen */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative rounded-2xl p-5 bg-gradient-to-b from-[#240e14] via-[#14080c] to-[#0a0406] border-2 border-red-500/50 shadow-[0_0_35px_rgba(239,68,68,0.25)] hover:shadow-[0_0_50px_rgba(239,68,68,0.45)] hover:border-red-400 transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-red-500/30 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-red-300 font-bold uppercase tracking-widest block">Gold Tier</span>
                    <h3 className="font-display font-black text-xl text-white uppercase tracking-wide">Blood Queen</h3>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-red-950/80 border border-red-400/60 flex items-center justify-center font-mono font-black text-sm text-red-200">
                    2T
                  </div>
                </div>

                {/* Card Artwork */}
                <div className="relative rounded-xl overflow-hidden aspect-[4/5] border border-red-500/40 shadow-inner group-hover:border-red-400 transition-colors">
                  <img
                    src="/cards/blood_queen.webp"
                    alt="Blood Queen"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80" />
                  
                  {/* Stats Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
                    <div className="px-3 py-1 rounded-lg bg-red-950/90 border border-red-500/60 text-red-300 font-display font-black text-sm shadow-md">
                      8 ATK
                    </div>
                    <div className="px-3 py-1 rounded-lg bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 font-display font-black text-sm shadow-md">
                      20 HP
                    </div>
                  </div>
                </div>

                {/* Card Lore & Traits */}
                <p className="text-xs text-gray-300 leading-relaxed font-sans italic">
                  “Matriarch of the Crimson Citadel. Striking with terrifying speed, every drop of blood she draws directly heals her corrupted essence.”
                </p>

                {/* Trait Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-[11px] font-mono text-red-300">
                    High Vampirism (+7 HP)
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[11px] font-mono text-amber-300">
                    Fast Striker
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Card 3: Azrael, Angel of Death */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative rounded-2xl p-5 bg-gradient-to-b from-[#1f1910] via-[#120f09] to-[#080704] border-2 border-amber-500/50 shadow-[0_0_35px_rgba(245,158,11,0.25)] hover:shadow-[0_0_50px_rgba(245,158,11,0.45)] hover:border-amber-400 transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-amber-300 font-bold uppercase tracking-widest block">Legendary Tier</span>
                    <h3 className="font-display font-black text-xl text-white uppercase tracking-wide">Azrael, Death</h3>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-amber-950/80 border border-amber-400/60 flex items-center justify-center font-mono font-black text-sm text-amber-200">
                    4T
                  </div>
                </div>

                {/* Card Artwork */}
                <div className="relative rounded-xl overflow-hidden aspect-[4/5] border border-amber-500/40 shadow-inner group-hover:border-amber-400 transition-colors">
                  <img
                    src="/cards/azrael_angel_of_death.webp"
                    alt="Azrael, Angel of Death"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80" />
                  
                  {/* Stats Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
                    <div className="px-3 py-1 rounded-lg bg-red-950/90 border border-red-500/60 text-red-300 font-display font-black text-sm shadow-md">
                      15 ATK
                    </div>
                    <div className="px-3 py-1 rounded-lg bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 font-display font-black text-sm shadow-md">
                      30 HP
                    </div>
                  </div>
                </div>

                {/* Card Lore & Traits */}
                <p className="text-xs text-gray-300 leading-relaxed font-sans italic">
                  “The grim herald of the end times. He commands devastating collateral ruin, sacrificing lesser minions to shield your warlord from death.”
                </p>

                {/* Trait Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[11px] font-mono text-amber-300">
                    Hex Aura
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-[11px] font-mono text-rose-300">
                    Sacrifice (+15 HP)
                  </span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>


      {/* =========================================================================
          3. PLAY-TO-EARN RECKONING (Clear, High-Stakes, Attractive)
         ========================================================================= */}
      <section className="relative py-28 px-6 bg-[#090b10] border-t border-b border-[#c5a880]/15 overflow-hidden">
        <div className="max-w-6xl mx-auto space-y-16 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-amber-400 font-bold block">
              — The Sovereign Treasury —
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-wider uppercase leading-tight">
              Where Battle Mastery Pays in Real Cash
            </h2>
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed font-serif italic">
              No speculative tokens. No locked promises. Void Covenant features a hard currency called Blood Sovereigns with guaranteed in-game value and direct Web3 wallet withdrawals.
            </p>
          </div>

          {/* Central Exchange Rate Showcase */}
          <div className="rounded-3xl border-2 border-amber-500/40 bg-gradient-to-r from-[#1c1308] via-[#12161f] to-[#0d1410] p-8 sm:p-12 shadow-[0_20px_70px_rgba(0,0,0,0.9)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              <div className="lg:col-span-7 space-y-6">
                <span className="font-mono text-xs text-amber-400 font-bold uppercase tracking-widest block">
                  CONVERTIBLE HARD CURRENCY
                </span>
                
                <div className="flex flex-wrap items-baseline gap-4">
                  <span className="font-display font-black text-4xl sm:text-6xl text-white tracking-wider">
                    100 SOVEREIGNS
                  </span>
                  <span className="font-display font-black text-3xl sm:text-5xl text-emerald-400 tracking-wide">
                    = $1.00 USDT
                  </span>
                </div>

                <p className="text-gray-300 text-base leading-relaxed font-sans">
                  Climb the competitive ladder, conquer opponents in ranked arena duels, and recruit warriors into your covenant. When you are ready, withdraw your Blood Sovereigns directly as USDT straight to your connected Web3 wallet.
                </p>

                <div className="pt-2 flex flex-wrap gap-4">
                  <div className="px-4 py-2 rounded-xl bg-black/60 border border-emerald-500/40 text-xs font-mono text-emerald-300 font-bold">
                    ⚡ Instant On-Chain Withdrawal
                  </div>
                  <div className="px-4 py-2 rounded-xl bg-black/60 border border-amber-500/40 text-xs font-mono text-amber-300 font-bold">
                    ⚡ Guaranteed $0.01 USDT Fixed Rate
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 flex justify-center">
                <div className="relative rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-2xl max-w-sm w-full group">
                  <img
                    src="/landing_p2e_treasury.jpg"
                    alt="Imperial Treasury Vault"
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex items-end p-5">
                    <div>
                      <span className="text-[10px] font-mono text-amber-300 uppercase tracking-widest block">The Imperial Vault</span>
                      <p className="text-sm font-display font-bold text-white uppercase tracking-wider">
                        Automated Daily Payouts
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* 3 Paths to Real Profits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Stream 1 */}
            <div className="rounded-2xl p-7 bg-gradient-to-b from-[#1c1409] to-[#0c0d12] border border-amber-500/30 hover:border-amber-400/60 shadow-xl transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="text-3xl">👑</div>
                <div>
                  <span className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wider block">Ranked Season Pool</span>
                  <h3 className="font-display font-black text-xl text-white uppercase mt-1">
                    Daily League Dividends
                  </h3>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed font-sans">
                  The highest seats of the 12 leagues divide the treasury every 24 hours automatically delivered to your Mailbox:
                </p>
                <div className="bg-black/60 rounded-xl p-3.5 border border-white/10 space-y-2 font-mono text-xs">
                  <div className="flex justify-between items-center text-amber-300">
                    <span>Divine Rank #1:</span>
                    <strong className="font-bold">1,500 Sov ($15.00/day)</strong>
                  </div>
                  <div className="flex justify-between items-center text-rose-300">
                    <span>Overlord Rank #1:</span>
                    <strong>600 Sov ($6.00/day)</strong>
                  </div>
                  <div className="flex justify-between items-center text-gray-400">
                    <span>Diamond – Master:</span>
                    <span>Daily Sovereigns + Dust</span>
                  </div>
                </div>
              </div>
              <span className="mt-6 pt-3 border-t border-white/10 text-xs font-mono text-amber-400 font-bold block">
                Automatic 24-Hour Payouts
              </span>
            </div>

            {/* Stream 2 */}
            <div className="rounded-2xl p-7 bg-gradient-to-b from-[#1a0f1c] to-[#0c0d12] border border-purple-500/30 hover:border-purple-400/60 shadow-xl transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="text-3xl">⚔️</div>
                <div>
                  <span className="text-[11px] font-mono text-purple-400 font-bold uppercase tracking-wider block">Ranked Arena</span>
                  <h3 className="font-display font-black text-xl text-white uppercase mt-1">
                    Duel Victory Bounties
                  </h3>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed font-sans">
                  Put your battle deck on the line. Warlords holding subscriber passes earn direct Sovereigns on every single arena win:
                </p>
                <div className="bg-black/60 rounded-xl p-3.5 border border-white/10 space-y-2 font-mono text-xs">
                  <div className="flex justify-between items-center text-purple-300">
                    <span>Ultra Pass:</span>
                    <strong>+2 Sov / Win (up to 24/day)</strong>
                  </div>
                  <div className="flex justify-between items-center text-purple-300">
                    <span>Premium Pass:</span>
                    <strong>+1 Sov / Win (up to 10/day)</strong>
                  </div>
                  <div className="flex justify-between items-center text-gray-400">
                    <span>Bonus:</span>
                    <span>Rank Crowns & Gold</span>
                  </div>
                </div>
              </div>
              <span className="mt-6 pt-3 border-t border-white/10 text-xs font-mono text-purple-300 font-bold block">
                Instant Rewards for Skill
              </span>
            </div>

            {/* Stream 3 */}
            <div className="rounded-2xl p-7 bg-gradient-to-b from-[#091b16] to-[#0c0d12] border border-emerald-500/30 hover:border-emerald-400/60 shadow-xl transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="text-3xl">🤝</div>
                <div>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">Covenant Seal</span>
                  <h3 className="font-display font-black text-xl text-white uppercase mt-1">
                    Affiliate Royalties
                  </h3>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed font-sans">
                  Recruit warlords with your personal covenant link. Earn permanent passive shares in Blood Sovereigns from their progression:
                </p>
                <div className="bg-black/60 rounded-xl p-3.5 border border-white/10 space-y-2 font-mono text-xs">
                  <div className="flex justify-between items-center text-emerald-300">
                    <span>Pass Purchases:</span>
                    <strong>Instant Sovereign Bounties</strong>
                  </div>
                  <div className="flex justify-between items-center text-emerald-300">
                    <span>Ecosystem Share:</span>
                    <strong>Permanent Revenue Split</strong>
                  </div>
                  <div className="flex justify-between items-center text-gray-400">
                    <span>New Recruits:</span>
                    <span>Free Starter Boosters</span>
                  </div>
                </div>
              </div>
              <span className="mt-6 pt-3 border-t border-white/10 text-xs font-mono text-emerald-400 font-bold block">
                Lifetime Passive Yield
              </span>
            </div>

          </div>
        </div>
      </section>


      {/* =========================================================================
          4. THE 12 DIVISIONS OF GLORY (The Colosseum & Real Crests)
         ========================================================================= */}
      <section className="relative py-28 px-6 bg-[#07080b]">
        <div className="max-w-6xl mx-auto space-y-16">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#c5a880] font-bold block">
              — The Colosseum of Immortals —
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-wider uppercase leading-tight">
              12 Ranked Competitive Divisions
            </h2>
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed font-serif italic">
              From the proving grounds of Bronze to the sacred apex Divine Pantheon, every victory earns Crowns. Daily promotions and demotions guarantee fierce competition for top dividend brackets.
            </p>
          </div>

          {/* Top Leagues Visual Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Divine League */}
            <div className="rounded-2xl p-6 bg-gradient-to-b from-[#221808] via-[#150f05] to-black border-2 border-amber-400/60 shadow-[0_0_35px_rgba(245,158,11,0.3)] text-center space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold px-3 py-1 rounded-bl-xl border-l border-b border-amber-500/40">
                2 SEATS ONLY
              </div>
              <img
                src="/icons/league_divine.png"
                alt="Divine League"
                className="w-20 h-20 mx-auto drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]"
              />
              <div>
                <h3 className="font-display font-black text-2xl text-amber-300 uppercase tracking-wider">
                  Divine Pantheon
                </h3>
                <span className="text-xs font-mono text-gray-300 block mt-1">Apex Immortal Tier</span>
              </div>
              <div className="p-3 bg-black/60 rounded-xl border border-amber-500/30 text-xs font-mono text-amber-200">
                Rank #1: <strong>1,500 Sovereigns ($15.00/day)</strong><br />
                Rank #2: <strong>800 Sovereigns ($8.00/day)</strong>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                Rank #1 retains godhood. Rank #2 faces demotion back into Void Overlord.
              </p>
            </div>

            {/* Void Overlord */}
            <div className="rounded-2xl p-6 bg-gradient-to-b from-[#220910] via-[#14060b] to-black border-2 border-rose-500/50 shadow-[0_0_35px_rgba(244,63,94,0.25)] text-center space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold px-3 py-1 rounded-bl-xl border-l border-b border-rose-500/40">
                10 SEATS ONLY
              </div>
              <img
                src="/icons/league_void_overlord.png"
                alt="Void Overlord League"
                className="w-20 h-20 mx-auto drop-shadow-[0_0_20px_rgba(244,63,94,0.5)]"
              />
              <div>
                <h3 className="font-display font-black text-2xl text-rose-300 uppercase tracking-wider">
                  Void Overlord
                </h3>
                <span className="text-xs font-mono text-gray-300 block mt-1">Dominion Tier</span>
              </div>
              <div className="p-3 bg-black/60 rounded-xl border border-rose-500/30 text-xs font-mono text-rose-200">
                Rank #1: <strong>600 Sovereigns ($6.00/day)</strong><br />
                Ranks #2–7: <strong>180–400 Sovereigns/day</strong>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                Top warlord ascends to Divine. Bottom 3 demote to Grandmaster.
              </p>
            </div>

            {/* Grandmaster */}
            <div className="rounded-2xl p-6 bg-gradient-to-b from-[#1b1226] via-[#100b17] to-black border-2 border-purple-500/50 shadow-[0_0_35px_rgba(168,85,247,0.25)] text-center space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold px-3 py-1 rounded-bl-xl border-l border-b border-purple-500/40">
                30 SEATS ONLY
              </div>
              <img
                src="/icons/league_grandmaster.png"
                alt="Grandmaster League"
                className="w-20 h-20 mx-auto drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]"
              />
              <div>
                <h3 className="font-display font-black text-2xl text-purple-300 uppercase tracking-wider">
                  Grandmaster
                </h3>
                <span className="text-xs font-mono text-gray-300 block mt-1">Elite Warlord Tier</span>
              </div>
              <div className="p-3 bg-black/60 rounded-xl border border-purple-500/30 text-xs font-mono text-purple-200">
                Rank #1: <strong>150 Sovereigns ($1.50/day)</strong><br />
                Top 3 Ascend to Void Overlord
              </div>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                Proven summoners battling for ascension to the high throne.
              </p>
            </div>

          </div>

          {/* Full Ladder Progression Strip */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-black via-white/[0.02] to-black border border-white/10">
            <span className="text-[11px] font-mono text-gray-400 uppercase tracking-widest block text-center mb-4">
              Complete 12-League Hierarchy
            </span>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
              <span className="px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-700/40 text-amber-500">Bronze</span>
              <span className="text-gray-600">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-600/40 text-slate-300">Silver</span>
              <span className="text-gray-600">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-yellow-950/40 border border-yellow-500/40 text-yellow-400">Gold</span>
              <span className="text-gray-600">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-indigo-950/40 border border-indigo-500/40 text-indigo-300">Platinum</span>
              <span className="text-gray-600">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-blue-950/40 border border-blue-500/40 text-blue-400">Sapphire</span>
              <span className="text-gray-600">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-400">Emerald</span>
              <span className="text-gray-600">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-500/40 text-red-400">Ruby</span>
              <span className="text-gray-600">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/40 text-cyan-300">Diamond</span>
              <span className="text-gray-600">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-purple-950/40 border border-purple-500/40 text-purple-300">Master</span>
              <span className="text-gray-600">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-purple-950/60 border border-purple-400/50 text-purple-200">Grandmaster</span>
              <span className="text-gray-600">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-rose-950/60 border border-rose-500/50 text-rose-300">Void Overlord</span>
              <span className="text-gray-600">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-amber-950/80 border border-amber-400/60 text-amber-300 font-bold">Divine</span>
            </div>
          </div>

          {/* Tactical Peace Shields Showcase */}
          <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-[#0c141e] via-[#090e17] to-[#070b12] border border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                STRATEGIC DEFENSE MECHANISM
              </span>
              <h3 className="font-display font-black text-2xl text-white uppercase">
                Lock Your Crowns with Peace Shields
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans">
                Never lose your qualifying dividend rank while you sleep. Activate 3-Hour, 6-Hour, or 12-Hour Peace Shields to make your warlord invulnerable against rival attackers before daily rollover deadlines.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center p-3 rounded-xl bg-black/50 border border-cyan-500/30">
                <img src="/icons/shield_3h.png" alt="3h Shield" className="w-10 h-10 mx-auto mb-1" />
                <span className="font-mono text-xs font-bold text-white block">3 Hours</span>
              </div>
              <div className="text-center p-3 rounded-xl bg-black/50 border border-cyan-500/30">
                <img src="/icons/shield_6h.png" alt="6h Shield" className="w-10 h-10 mx-auto mb-1" />
                <span className="font-mono text-xs font-bold text-white block">6 Hours</span>
              </div>
              <div className="text-center p-3 rounded-xl bg-black/50 border border-cyan-500/30">
                <img src="/icons/shield_12h.png" alt="12h Shield" className="w-10 h-10 mx-auto mb-1" />
                <span className="font-mono text-xs font-bold text-white block">12 Hours</span>
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* =========================================================================
          5. THE ALTAR & HERO ARMORY (Progression & Evolution)
         ========================================================================= */}
      <section className="relative py-28 px-6 bg-[#090c12] border-t border-b border-[#c5a880]/15">
        <div className="max-w-6xl mx-auto space-y-16">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-purple-400 font-bold block">
              — Progression & Evolution —
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-wider uppercase leading-tight">
              Equip Your Warlord. Awaken the Altar.
            </h2>
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed font-serif italic">
              Victory rewards you with Gold and Void Dust. Unlock booster chests at the Altar, fuse duplicates to ascend card tiers, and equip artifact relics to forge an unstoppable warlord.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: The Ritual Altar Packs */}
            <div className="lg:col-span-6 rounded-2xl p-7 bg-gradient-to-b from-[#181122] via-[#0f0b17] to-black border border-purple-500/40 shadow-xl space-y-6">
              <div>
                <span className="text-[11px] font-mono text-purple-300 font-bold uppercase tracking-wider block">
                  Card Summoning
                </span>
                <h3 className="font-display font-black text-2xl text-white uppercase mt-1">
                  The Altar of Summoning
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 mt-2 leading-relaxed font-sans">
                  Spend Gold and Void Dust harvested from campaign battles. Pull high-tier creature packs and fuse identical cards to upgrade them from Bronze footmen all the way into Divine horrors.
                </p>
              </div>

              {/* 3 Real Packs from the Game */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-black/60 rounded-xl border border-white/10 text-center hover:border-amber-500/40 transition-colors">
                  <img src="/packs/chest_basic.webp" alt="Basic Chest" className="w-14 h-14 mx-auto object-contain mb-2" />
                  <span className="font-display font-bold text-xs text-white uppercase block">Basic Chest</span>
                  <span className="text-[10px] text-gray-400 font-mono">Gold Cost</span>
                </div>
                <div className="p-3 bg-black/60 rounded-xl border border-white/10 text-center hover:border-cyan-500/40 transition-colors">
                  <img src="/packs/chest_rare.webp" alt="Rare Chest" className="w-14 h-14 mx-auto object-contain mb-2" />
                  <span className="font-display font-bold text-xs text-cyan-300 uppercase block">Rare Chest</span>
                  <span className="text-[10px] text-gray-400 font-mono">Void Dust</span>
                </div>
                <div className="p-3 bg-black/60 rounded-xl border border-white/10 text-center hover:border-purple-500/40 transition-colors">
                  <img src="/packs/chest_premium.webp" alt="Royal Chest" className="w-14 h-14 mx-auto object-contain mb-2" />
                  <span className="font-display font-bold text-xs text-purple-300 uppercase block">Royal Chest</span>
                  <span className="text-[10px] text-gray-400 font-mono">High Rarity</span>
                </div>
              </div>

              {/* Tier Evolution Strip */}
              <div className="p-3 bg-black/40 rounded-xl border border-white/10 flex items-center justify-between text-xs font-mono text-center">
                <span className="text-amber-600 font-bold">Bronze</span>
                <span className="text-gray-600">→</span>
                <span className="text-gray-300 font-bold">Silver</span>
                <span className="text-gray-600">→</span>
                <span className="text-yellow-400 font-bold">Gold</span>
                <span className="text-gray-600">→</span>
                <span className="text-purple-400 font-bold">Legendary</span>
                <span className="text-gray-600">→</span>
                <span className="text-amber-300 font-bold">Divine</span>
              </div>
            </div>

            {/* Right: The Warlord's Armory */}
            <div className="lg:col-span-6 rounded-2xl p-7 bg-gradient-to-b from-[#1f150c] via-[#120e08] to-black border border-amber-500/40 shadow-xl space-y-6">
              <div>
                <span className="text-[11px] font-mono text-amber-300 font-bold uppercase tracking-wider block">
                  Hero Customization
                </span>
                <h3 className="font-display font-black text-2xl text-white uppercase mt-1">
                  6 Equipment Slots & 3 Combat Stances
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 mt-2 leading-relaxed font-sans">
                  Equip Weapons, Armor, Helmets, Rings, Amulets, and Boots to grant your hero Turn Delay Reduction, Dodge %, bonus Health, and Gold multipliers in every battle.
                </p>
              </div>

              {/* 3 Combat Stances */}
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-black/50 border border-amber-500/30">
                  <h4 className="font-display font-bold text-xs text-amber-300 uppercase">
                    Void Strike (Damage Specialization)
                  </h4>
                  <p className="text-[11px] text-gray-300 mt-0.5 font-sans">
                    Explosive magical bursts, armor-piercing strikes, and chain lightning that rips through backline foes.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-black/50 border border-rose-500/30">
                  <h4 className="font-display font-bold text-xs text-rose-300 uppercase">
                    Blood Aura (Defensive Specialization)
                  </h4>
                  <p className="text-[11px] text-gray-300 mt-0.5 font-sans">
                    Hero lifesteal, emergency damage absorption barriers, and vital health surges in close duels.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-black/50 border border-purple-500/30">
                  <h4 className="font-display font-bold text-xs text-purple-300 uppercase">
                    Warlord Cry (Tactical Specialization)
                  </h4>
                  <p className="text-[11px] text-gray-300 mt-0.5 font-sans">
                    Universal attack buffs across all summoned minions, enemy stuns, and accelerated skill cooldowns.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* =========================================================================
          6. THE 4 IN-GAME CURRENCIES (Transparent Economic Breakdown)
         ========================================================================= */}
      <section className="relative py-24 px-6 bg-[#07080b]">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="font-mono text-xs uppercase tracking-widest text-[#c5a880] block font-bold">
              — The Abyssal Treasury —
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-wider">
              Four Core In-Game Resources
            </h2>
            <p className="text-gray-400 text-sm font-serif italic">
              Every token and crystal has clear, direct utility with zero speculative inflation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Gold */}
            <div className="rounded-2xl p-6 bg-gradient-to-b from-white/[0.04] to-black border border-white/10 flex flex-col justify-between">
              <div className="space-y-4">
                <img src="/icons/icon_gold.webp" alt="Gold" className="w-12 h-12 drop-shadow" />
                <div>
                  <h3 className="font-display font-bold text-lg text-white uppercase">Gold</h3>
                  <span className="text-[11px] font-mono text-yellow-400 font-bold">Battle Currency</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed font-sans">
                  Earned across Campaign floors and PvP wins. Used for card fusing, shop items, and basic booster packs.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-gray-400">
                Earned in: Campaign & PvP
              </div>
            </div>

            {/* Void Dust */}
            <div className="rounded-2xl p-6 bg-gradient-to-b from-white/[0.04] to-black border border-white/10 flex flex-col justify-between">
              <div className="space-y-4">
                <img src="/icons/icon_dust.webp" alt="Void Dust" className="w-12 h-12 drop-shadow" />
                <div>
                  <h3 className="font-display font-bold text-lg text-white uppercase">Void Dust</h3>
                  <span className="text-[11px] font-mono text-cyan-400 font-bold">Crafting Powder</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed font-sans">
                  Harvested from boss victories and disenchanting duplicates. Used for Altar card packs and card leveling.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-gray-400">
                Earned in: Boss Trials & Disenchanting
              </div>
            </div>

            {/* Dark Shards */}
            <div className="rounded-2xl p-6 bg-gradient-to-b from-white/[0.04] to-black border border-white/10 flex flex-col justify-between">
              <div className="space-y-4">
                <img src="/icons/icon_shards.webp" alt="Dark Shards" className="w-12 h-12 drop-shadow" />
                <div>
                  <h3 className="font-display font-bold text-lg text-white uppercase">Dark Shards</h3>
                  <span className="text-[11px] font-mono text-purple-400 font-bold">Premium Crystals</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed font-sans">
                  Acquired in store or pass milestones. Used for VIP passes, tactical Peace Shields, and energy refills.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-gray-400">
                Used for: VIP Passes & Shields
              </div>
            </div>

            {/* Blood Sovereigns */}
            <div className="rounded-2xl p-6 bg-gradient-to-b from-amber-950/40 via-black to-black border-2 border-amber-500/50 shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                <img src="/icons/icon_sovereign.webp" alt="Blood Sovereigns" className="w-12 h-12 drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]" />
                <div>
                  <h3 className="font-display font-bold text-lg text-amber-300 uppercase">Blood Sovereigns</h3>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">100 = $1.00 USDT</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed font-sans">
                  Convertible hard currency. Won through daily league payouts, arena duels, and referrals. Directly withdrawable.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-amber-500/40 text-[11px] font-mono text-amber-300 font-bold">
                Withdrawable to Web3 Wallet
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* =========================================================================
          7. FINAL EPIC CALL TO ACTION
         ========================================================================= */}
      <section className="relative py-28 px-6 overflow-hidden border-t border-[#c5a880]/20 text-center bg-gradient-to-b from-[#07080b] via-[#100e17] to-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,168,128,0.08),transparent_70%)] pointer-events-none" />

        <div className="max-w-3xl mx-auto relative z-10 space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#1c1208] to-black border-2 border-[#c5a880]/60 flex items-center justify-center shadow-[0_0_25px_rgba(197,168,128,0.4)]">
            <span className="font-display font-black text-2xl text-[#c5a880]">Ω</span>
          </div>

          <div className="space-y-3">
            <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-[0.2em] uppercase leading-tight">
              The Covenant Awaits
            </h2>
            <p className="text-sm sm:text-base text-gray-400 font-serif italic max-w-lg mx-auto">
              Play directly in browser or Telegram. Instant Web3 connection with zero forms or downloads.
            </p>
          </div>

          <div className="pt-4">
            <button
              onClick={onConnectWallet}
              disabled={isConnecting}
              className="px-12 py-4 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:from-amber-500 hover:via-yellow-400 hover:to-amber-500 text-black font-display font-black text-sm sm:text-base tracking-[0.3em] uppercase rounded-xl transition-all duration-300 shadow-[0_0_35px_rgba(245,158,11,0.4)] hover:shadow-[0_0_50px_rgba(245,158,11,0.7)] cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-60"
            >
              {isConnecting ? 'CONNECTING...' : 'ENTER THE VOID'}
            </button>
          </div>
        </div>
      </section>


      {/* =========================================================================
          8. CLEAN MODERN FOOTER
         ========================================================================= */}
      <footer className="border-t border-white/10 py-10 px-6 bg-black">
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
          </div>

          <p className="text-xs text-gray-500 font-display tracking-widest text-center">
            VOID COVENANT © 2024–2026 • DARK TACTICAL CARD RPG • PLAY TO EARN
          </p>
        </div>
      </footer>


      {/* =========================================================================
          ANIMATIONS
         ========================================================================= */}
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
