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
          3. TACTICAL COMBAT MECHANICS (Turn Delays & Synergies)
         ========================================================================= */}
      <section className="relative py-28 px-6 bg-[#090b10] border-t border-b border-[#c5a880]/15 overflow-hidden">
        <div className="max-w-6xl mx-auto space-y-16 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#c5a880] font-bold block">
              — Tactical Battlefield —
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-wider uppercase leading-tight">
              Turn-Based Strategy. Depth Over Luck.
            </h2>
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed font-serif italic">
              Combat in Void Covenant unfolds on a tactical grid where every action counts. Positioning, mana management, and predicting your opponent's initiative determine the victor.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Visual Clash Banner */}
            <div className="lg:col-span-6 rounded-2xl overflow-hidden border-2 border-purple-500/30 shadow-[0_0_45px_rgba(168,85,247,0.2)] group">
              <img
                src="/landing_warlord_duel.jpg"
                alt="Warlord Duel"
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* Mechanics Explanation */}
            <div className="lg:col-span-6 space-y-6">
              
              <div className="p-5 rounded-2xl bg-black/50 border border-white/10 space-y-2">
                <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider block">
                  Core Combat Rule
                </span>
                <h3 className="font-display font-black text-xl text-white uppercase">
                  Turn Delays & Initiative
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed font-sans">
                  Creatures do not attack mindlessly. Each card possesses a Turn Delay countdown: swift skirmishers strike almost immediately, while cataclysmic titans require multiple turns to awaken. You must outplay your opponent’s countdowns and counter their board before their leviathans strike.
                </p>
              </div>

              {/* 4 Dark Creature Arts */}
              <div className="space-y-3">
                <span className="text-xs font-mono text-purple-400 font-bold uppercase tracking-wider block">
                  Four Creature Disciplines
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-red-500/30">
                    <h4 className="font-display font-bold text-sm text-red-300 uppercase">Vampirism</h4>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      Strikes drain health from enemy targets, sustaining your frontline across prolonged combat exchanges.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-purple-500/30">
                    <h4 className="font-display font-bold text-sm text-purple-300 uppercase">Hex Curses</h4>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      Afflicts priority enemy targets with dark runes, significantly amplifying all incoming battlefield damage.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-emerald-500/30">
                    <h4 className="font-display font-bold text-sm text-emerald-300 uppercase">Plague</h4>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      Spreads incurable poison that rots enemy ranks at the end of each round, eroding sturdy defenders.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-amber-500/30">
                    <h4 className="font-display font-bold text-sm text-amber-300 uppercase">Sacrifice</h4>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      Martyrs an allied minion on the altar of war to restore your warlord's health from near-fatal attacks.
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>


      {/* =========================================================================
          4. WARLORD LOADOUT & 3 COMBAT STANCES
         ========================================================================= */}
      <section className="relative py-28 px-6 bg-[#07080b]">
        <div className="max-w-6xl mx-auto space-y-16">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#c5a880] font-bold block">
              — Hero Customization —
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-wider uppercase leading-tight">
              Six Artifact Slots. Three Combat Stances.
            </h2>
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed font-serif italic">
              Your warlord is not merely a bystander. Equip ancient relics and choose talent specializations to turn your hero into a devastating battlefield force.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: 6 Equipment Slots */}
            <div className="lg:col-span-6 rounded-2xl p-7 bg-gradient-to-b from-[#18140e] via-[#0f0e0b] to-black border border-amber-500/40 shadow-xl space-y-6">
              <div>
                <span className="text-[11px] font-mono text-amber-300 font-bold uppercase tracking-wider block">
                  Relic Loadouts
                </span>
                <h3 className="font-display font-black text-2xl text-white uppercase mt-1">
                  Six Gear Slots
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 mt-2 leading-relaxed font-sans">
                  Equip your warlord with Weapons, Armor, Helmets, Rings, Amulets, and Boots discovered in the abyss. Each artifact grants critical stat bonuses:
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 bg-black/60 rounded-xl border border-white/10 text-gray-200">
                  <span className="text-cyan-300 font-bold block mb-0.5">Turn Delay Reduction</span>
                  Summons strike faster
                </div>
                <div className="p-3 bg-black/60 rounded-xl border border-white/10 text-gray-200">
                  <span className="text-blue-300 font-bold block mb-0.5">Dodge Chance %</span>
                  Evade lethal enemy blows
                </div>
                <div className="p-3 bg-black/60 rounded-xl border border-white/10 text-gray-200">
                  <span className="text-emerald-300 font-bold block mb-0.5">Bonus Maximum HP</span>
                  Outlast opponent burst
                </div>
                <div className="p-3 bg-black/60 rounded-xl border border-white/10 text-gray-200">
                  <span className="text-amber-300 font-bold block mb-0.5">Gold Multiplier</span>
                  Increased match spoils
                </div>
              </div>
            </div>

            {/* Right: 3 Combat Stances */}
            <div className="lg:col-span-6 rounded-2xl p-7 bg-gradient-to-b from-[#1a101f] via-[#100a14] to-black border border-purple-500/40 shadow-xl space-y-6">
              <div>
                <span className="text-[11px] font-mono text-purple-300 font-bold uppercase tracking-wider block">
                  Talent Trees
                </span>
                <h3 className="font-display font-black text-2xl text-white uppercase mt-1">
                  Three Combat Stances
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 mt-2 leading-relaxed font-sans">
                  Invest talent points into specialized hero branches to tailor your warlord to your playstyle:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-black/50 border border-amber-500/30">
                  <h4 className="font-display font-bold text-sm text-amber-300 uppercase">
                    Void Strike (Offensive Mastery)
                  </h4>
                  <p className="text-xs text-gray-300 mt-1 font-sans">
                    Piercing magic bursts, direct armor bypass, and chain lightning that arcs across enemy backlines.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-black/50 border border-rose-500/30">
                  <h4 className="font-display font-bold text-sm text-rose-300 uppercase">
                    Blood Aura (Defensive Mastery)
                  </h4>
                  <p className="text-xs text-gray-300 mt-1 font-sans">
                    Hero lifesteal, emergency damage absorption barriers, and vital health surges in close duels.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-black/50 border border-purple-500/30">
                  <h4 className="font-display font-bold text-sm text-purple-300 uppercase">
                    Warlord Cry (Tactical Mastery)
                  </h4>
                  <p className="text-xs text-gray-300 mt-1 font-sans">
                    Board-wide creature attack enhancements, enemy turn stuns, and cooldown acceleration.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* =========================================================================
          5. THE ALTAR OF SUMMONING & CARD FUSION
         ========================================================================= */}
      <section className="relative py-28 px-6 bg-[#090b10] border-t border-b border-[#c5a880]/15">
        <div className="max-w-6xl mx-auto space-y-16">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-purple-400 font-bold block">
              — Collection & Ascension —
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-wider uppercase leading-tight">
              The Altar of Summoning & Card Fusion
            </h2>
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed font-serif italic">
              Victory rewards you with Gold and Void Dust. Channel these spoils into the Altar to summon booster chests, fuse duplicate creatures, and ascend your deck into godlike rarities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Chest 1 */}
            <div className="rounded-2xl p-6 bg-gradient-to-b from-white/[0.04] to-black border border-white/10 hover:border-amber-500/40 transition-all text-center space-y-4">
              <img
                src="/packs/chest_basic.webp"
                alt="Basic Chest"
                className="w-20 h-20 mx-auto object-contain drop-shadow"
              />
              <div>
                <h3 className="font-display font-black text-xl text-white uppercase">Basic Chest</h3>
                <span className="text-xs font-mono text-yellow-400 font-bold">Summoned with Gold</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-sans">
                Draws frontline warriors and footsoldiers to establish your core deck foundation.
              </p>
            </div>

            {/* Chest 2 */}
            <div className="rounded-2xl p-6 bg-gradient-to-b from-white/[0.04] to-black border border-white/10 hover:border-cyan-500/40 transition-all text-center space-y-4">
              <img
                src="/packs/chest_rare.webp"
                alt="Rare Chest"
                className="w-20 h-20 mx-auto object-contain drop-shadow"
              />
              <div>
                <h3 className="font-display font-black text-xl text-cyan-300 uppercase">Rare Chest</h3>
                <span className="text-xs font-mono text-cyan-400 font-bold">Summoned with Void Dust</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-sans">
                Unlocks specialized spellweavers, vampires, and tactical support creatures.
              </p>
            </div>

            {/* Chest 3 */}
            <div className="rounded-2xl p-6 bg-gradient-to-b from-white/[0.04] to-black border border-white/10 hover:border-purple-500/40 transition-all text-center space-y-4">
              <img
                src="/packs/chest_premium.webp"
                alt="Royal Chest"
                className="w-20 h-20 mx-auto object-contain drop-shadow"
              />
              <div>
                <h3 className="font-display font-black text-xl text-purple-300 uppercase">Royal Chest</h3>
                <span className="text-xs font-mono text-purple-400 font-bold">High-Tier Vault</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-sans">
                Guaranteed high-tier pulls yielding catastrophic leviathans and legendary lords.
              </p>
            </div>

          </div>

          {/* Tier Evolution Strip */}
          <div className="p-6 rounded-2xl bg-black/60 border border-white/10 text-center space-y-3">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-widest block">
              Card Tier Ascension System
            </span>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm font-mono">
              <span className="text-amber-600 font-bold">Bronze</span>
              <span className="text-gray-600">→</span>
              <span className="text-gray-300 font-bold">Silver</span>
              <span className="text-gray-600">→</span>
              <span className="text-yellow-400 font-bold">Gold</span>
              <span className="text-gray-600">→</span>
              <span className="text-purple-400 font-bold">Legendary</span>
              <span className="text-gray-600">→</span>
              <span className="text-amber-300 font-bold">Divine Ascended</span>
            </div>
            <p className="text-xs text-gray-400 font-sans max-w-xl mx-auto pt-1">
              Fusing identical cards increases base Attack and Health while dramatically enhancing their active skill values.
            </p>
          </div>

        </div>
      </section>


      {/* =========================================================================
          6. RANKED ARENA & TACTICAL PEACE SHIELDS
         ========================================================================= */}
      <section className="relative py-28 px-6 bg-[#07080b]">
        <div className="max-w-6xl mx-auto space-y-16">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#c5a880] font-bold block">
              — Competitive Arena —
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-wider uppercase leading-tight">
              Twelve Ranked Divisions & Peace Shields
            </h2>
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed font-serif italic">
              Compete against other warlords in ranked arena duels to earn Crowns. Daily promotions and demotions maintain a living, cutthroat ladder.
            </p>
          </div>

          {/* Three Apex League Emblems */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="rounded-2xl p-6 bg-gradient-to-b from-[#221808] to-black border border-amber-500/40 text-center space-y-3">
              <img
                src="/icons/league_divine.png"
                alt="Divine League Crest"
                className="w-20 h-20 mx-auto drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]"
              />
              <h3 className="font-display font-black text-xl text-amber-300 uppercase">Divine Pantheon</h3>
              <p className="text-xs text-gray-300 leading-relaxed font-sans">
                The pinnacle of realm dominance where only the reigning immortals dwell.
              </p>
            </div>

            <div className="rounded-2xl p-6 bg-gradient-to-b from-[#220910] to-black border border-rose-500/40 text-center space-y-3">
              <img
                src="/icons/league_void_overlord.png"
                alt="Void Overlord Crest"
                className="w-20 h-20 mx-auto drop-shadow-[0_0_20px_rgba(244,63,94,0.4)]"
              />
              <h3 className="font-display font-black text-xl text-rose-300 uppercase">Void Overlord</h3>
              <p className="text-xs text-gray-300 leading-relaxed font-sans">
                High-stakes dominion division fighting for promotion to the Divine throne.
              </p>
            </div>

            <div className="rounded-2xl p-6 bg-gradient-to-b from-[#1b1226] to-black border border-purple-500/40 text-center space-y-3">
              <img
                src="/icons/league_grandmaster.png"
                alt="Grandmaster Crest"
                className="w-20 h-20 mx-auto drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]"
              />
              <h3 className="font-display font-black text-xl text-purple-300 uppercase">Grandmaster</h3>
              <p className="text-xs text-gray-300 leading-relaxed font-sans">
                Elite tacticians advancing through competitive ranks towards realm dominance.
              </p>
            </div>

          </div>

          {/* Tactical Peace Shields Showcase */}
          <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-[#0c141e] via-[#090e17] to-[#070b12] border border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                Strategic Defense
              </span>
              <h3 className="font-display font-black text-2xl text-white uppercase">
                Lock Your Crowns with Peace Shields
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans">
                Never lose your hard-earned rank while you sleep or step away. Activate 3-Hour, 6-Hour, or 12-Hour Peace Shields to make your warlord invulnerable to enemy duel challenges.
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
          7. PLAY-TO-EARN ECONOMY & THE 4 IN-GAME RESOURCES
         ========================================================================= */}
      <section className="relative py-28 px-6 bg-[#090b10] border-t border-b border-[#c5a880]/15">
        <div className="max-w-6xl mx-auto space-y-16">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-amber-400 font-bold block">
              — Play to Earn —
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-wider uppercase leading-tight">
              Real Value. Withdrawable on Demand.
            </h2>
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed font-serif italic">
              Void Covenant operates on a transparent hard currency model. Win battles, climb the leagues, and withdraw your rewards directly in USDT.
            </p>
          </div>

          {/* Central Treasury Card */}
          <div className="rounded-3xl border-2 border-amber-500/40 bg-gradient-to-r from-[#1c1308] via-[#12161f] to-[#0d1410] p-8 sm:p-12 shadow-[0_20px_70px_rgba(0,0,0,0.9)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              <div className="lg:col-span-7 space-y-6">
                <span className="font-mono text-xs text-amber-400 font-bold uppercase tracking-widest block">
                  HARD CONVERTIBLE REWARDS
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
                  Blood Sovereigns are awarded through ranked arena victories, daily competitive league standing, and covenant referral commissions. Request on-chain withdrawals directly to your Web3 wallet whenever you choose.
                </p>

                <div className="pt-2 flex flex-wrap gap-4">
                  <div className="px-4 py-2 rounded-xl bg-black/60 border border-emerald-500/40 text-xs font-mono text-emerald-300 font-bold">
                    Direct Web3 Wallet Withdrawal
                  </div>
                  <div className="px-4 py-2 rounded-xl bg-black/60 border border-amber-500/40 text-xs font-mono text-amber-300 font-bold">
                    Guaranteed $0.01 USDT Fixed Rate
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
                        Player-Owned Economy
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* The 4 Resources */}
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
                  Convertible hard currency. Won through daily league standing, arena duels, and referrals. Directly withdrawable.
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
          8. FINAL CALL TO ACTION
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
          9. CLEAN MODERN FOOTER
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
