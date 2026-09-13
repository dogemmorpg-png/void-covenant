import React from 'react';
import { motion } from 'motion/react';
import { 
  ChevronDown, 
  Twitter, 
  Send, 
  Shield, 
  Sparkles, 
  Coins, 
  Trophy, 
  Users, 
  Zap, 
  Flame, 
  Swords, 
  Wallet,
  CheckCircle2
} from 'lucide-react';

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
          2. GAME OVERVIEW / WHAT IS VOID COVENANT
         ========================================================================= */}
      <section className="relative py-20 px-6 border-t border-[#c5a880]/15 bg-gradient-to-b from-[#07080b] via-[#0d1017] to-[#07080b]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Real Strategy • Real Earnings</span>
              </div>

              <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-wide uppercase leading-tight">
                Dark Tactical Card RPG Meets Web3 Economy
              </h2>

              <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                Void Covenant delivers deep turn-based tactical battles directly in your browser or Telegram. Assemble customized decks, equip your warlord with artifact sets, and dominate 12 competitive leagues where your tactical supremacy generates daily withdrawable cash rewards.
              </p>

              {/* 3 Key Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-amber-500/30 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 mb-3">
                    <Zap className="w-4 h-4" />
                  </div>
                  <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">Instant Access</h4>
                  <p className="text-xs text-gray-400 mt-1">Play directly in browser or Telegram. One-click Web3 login with zero installations.</p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-purple-500/30 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 mb-3">
                    <Swords className="w-4 h-4" />
                  </div>
                  <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">Tactical Depth</h4>
                  <p className="text-xs text-gray-400 mt-1">99 unique creatures, turn delay timers, 4 skill effects, and 3 hero combat stances.</p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/30 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-3">
                    <Coins className="w-4 h-4" />
                  </div>
                  <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">Real Payouts</h4>
                  <p className="text-xs text-gray-400 mt-1">Convert Blood Sovereigns directly to USDT and withdraw straight to your wallet.</p>
                </div>
              </div>
            </motion.div>

            {/* Visual banner */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative rounded-2xl overflow-hidden border border-[#c5a880]/30 shadow-[0_15px_50px_rgba(0,0,0,0.8)] group">
                <img 
                  src="/landing_void_realm.jpg" 
                  alt="Void Covenant Realm" 
                  className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07080b] via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-4 left-4 right-4 p-3 bg-black/60 backdrop-blur-md rounded-xl border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-[#c5a880] uppercase tracking-wider">Current Season</span>
                      <p className="text-xs font-bold text-white uppercase">The Abyssal Awakening</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">12 Leagues Active</span>
                      <p className="text-xs font-mono font-bold text-amber-300">Daily Dividends</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>


      {/* =========================================================================
          3. PLAY-TO-EARN CORE (The Blood Sovereign Economy & Real Earnings)
         ========================================================================= */}
      <section className="relative py-28 px-6 bg-[#090c12] border-t border-b border-[#c5a880]/15 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 space-y-16">
          
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto space-y-3"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-950/70 border border-amber-500/40 text-amber-300 font-mono text-xs font-black tracking-widest uppercase shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <img src="/icons/icon_sovereign.webp" alt="Sovereigns" className="w-4 h-4 inline-block" />
              PLAY TO EARN ECONOMY
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-wide uppercase leading-tight">
              Real Value. Transparent Payouts.
            </h2>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              Unlike speculative reward models, Void Covenant features a hard currency called <strong className="text-amber-300">Blood Sovereigns</strong> with a guaranteed exchange rate. You earn through proven gameplay skill and ecosystem contribution.
            </p>
          </motion.div>

          {/* Central Exchange Rate Spotlight Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="rounded-3xl border-2 border-amber-500/30 bg-gradient-to-r from-[#17120a] via-[#11161d] to-[#0d1612] p-6 sm:p-10 shadow-[0_15px_60px_rgba(0,0,0,0.85)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              
              <div className="md:col-span-7 space-y-4">
                <span className="font-mono text-xs text-amber-400 font-bold uppercase tracking-wider block">
                  HARD CONVERTIBLE CURRENCY
                </span>
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="font-display font-black text-3xl sm:text-5xl text-white tracking-wider">
                    100 SOVEREIGNS
                  </span>
                  <span className="font-display font-bold text-2xl sm:text-4xl text-emerald-400">
                    = $1.00 USDT
                  </span>
                </div>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                  Earn Blood Sovereigns directly through competitive PvP arena play, daily league rollover dividends, and referral commissions. Request on-chain withdrawals to your Web3 wallet anytime with zero hidden conversions.
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <div className="flex items-center gap-2 text-xs font-mono text-gray-300 bg-black/50 px-3 py-1.5 rounded-lg border border-white/10">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Direct Wallet Withdrawal</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-gray-300 bg-black/50 px-3 py-1.5 rounded-lg border border-white/10">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span>Fixed $0.01 USDT Rate</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-5 flex justify-center">
                <div className="relative rounded-2xl overflow-hidden border border-amber-500/40 shadow-2xl max-w-xs w-full">
                  <img 
                    src="/landing_p2e_treasury.jpg" 
                    alt="Treasury Vault" 
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                    <div className="flex items-center gap-2">
                      <img src="/icons/icon_sovereign.webp" alt="Sovereigns" className="w-6 h-6" />
                      <div>
                        <p className="text-[10px] font-mono text-amber-300 uppercase">The Imperial Bank</p>
                        <p className="text-xs font-bold text-white uppercase">Guaranteed In-Game Liquidity</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>

          {/* 3 Concrete Ways to Earn */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Earning Pillar 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gradient-to-b from-[#1c1409] to-[#0c0d12] border border-amber-500/30 hover:border-amber-400/60 rounded-2xl p-6 flex flex-col justify-between shadow-xl transition-all group"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-amber-400 text-xl shadow-[0_0_15px_rgba(245,158,11,0.2)] group-hover:scale-105 transition-transform">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wider block">1. Competitive Ladder</span>
                  <h3 className="font-display font-black text-xl text-white uppercase mt-1">
                    Daily League Dividends
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  Climb across 12 competitive PvP leagues (Bronze up to Divine). Every 24 hours, the season pool delivers automated Blood Sovereign payouts straight to your mailbox:
                </p>
                <div className="bg-black/60 rounded-xl p-3 border border-white/10 space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between items-center text-amber-300">
                    <span>👑 Divine Rank #1:</span>
                    <strong className="font-bold">1,500 Sov ($15.00/day)</strong>
                  </div>
                  <div className="flex justify-between items-center text-rose-300">
                    <span>⚔️ Overlord Rank #1:</span>
                    <strong>600 Sov ($6.00/day)</strong>
                  </div>
                  <div className="flex justify-between items-center text-gray-300">
                    <span>💎 Diamond – Master:</span>
                    <span>Daily Sov + Gold + Dust</span>
                  </div>
                </div>
              </div>
              <div className="mt-5 pt-3 border-t border-white/10 flex items-center text-[11px] font-mono text-amber-400 font-bold gap-1.5">
                <span>⚡ Automated 24h Rollover Dividends</span>
              </div>
            </motion.div>

            {/* Earning Pillar 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gradient-to-b from-[#1a0f1c] to-[#0c0d12] border border-purple-500/30 hover:border-purple-400/60 rounded-2xl p-6 flex flex-col justify-between shadow-xl transition-all group"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-500/50 flex items-center justify-center text-purple-400 text-xl shadow-[0_0_15px_rgba(168,85,247,0.2)] group-hover:scale-105 transition-transform">
                  <Swords className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-mono text-purple-400 font-bold uppercase tracking-wider block">2. Arena Duels</span>
                  <h3 className="font-display font-black text-xl text-white uppercase mt-1">
                    PvP Victory Bounties
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  Put your battle deck to the test against real players in ranked duels. Pass holders earn direct Blood Sovereigns on top of Gold and Crowns for every victory:
                </p>
                <div className="bg-black/60 rounded-xl p-3 border border-white/10 space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between items-center text-purple-300">
                    <span>⚡ Ultra Pass:</span>
                    <strong>+2 Sov/win (up to 24/day)</strong>
                  </div>
                  <div className="flex justify-between items-center text-purple-300">
                    <span>⚡ Premium Pass:</span>
                    <strong>+1 Sov/win (up to 10/day)</strong>
                  </div>
                  <div className="flex justify-between items-center text-gray-300">
                    <span>🛡️ Protection:</span>
                    <span>Free Daily Arena Shields</span>
                  </div>
                </div>
              </div>
              <div className="mt-5 pt-3 border-t border-white/10 flex items-center text-[11px] font-mono text-purple-300 font-bold gap-1.5">
                <span>⚡ Direct Rewards For Arena Mastery</span>
              </div>
            </motion.div>

            {/* Earning Pillar 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gradient-to-b from-[#091b16] to-[#0c0d12] border border-emerald-500/30 hover:border-emerald-400/60 rounded-2xl p-6 flex flex-col justify-between shadow-xl transition-all group"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400 text-xl shadow-[0_0_15px_rgba(16,185,129,0.2)] group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">3. Referral Network</span>
                  <h3 className="font-display font-black text-xl text-white uppercase mt-1">
                    Affiliate Commissions
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  Expand your covenant by inviting fellow tacticians with your unique referral link. Earn passive Sovereign shares from your recruits' in-game progress:
                </p>
                <div className="bg-black/60 rounded-xl p-3 border border-white/10 space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between items-center text-emerald-300">
                    <span>🤝 Pass Purchases:</span>
                    <strong>Instant Sovereign Bonus</strong>
                  </div>
                  <div className="flex justify-between items-center text-emerald-300">
                    <span>📈 Lifetime Share:</span>
                    <strong>Passive Revenue Share</strong>
                  </div>
                  <div className="flex justify-between items-center text-gray-300">
                    <span>🎁 Recruits Gain:</span>
                    <span>Bonus Starter Gold & Cards</span>
                  </div>
                </div>
              </div>
              <div className="mt-5 pt-3 border-t border-white/10 flex items-center text-[11px] font-mono text-emerald-400 font-bold gap-1.5">
                <span>⚡ Lifetime Passive Sovereign Yield</span>
              </div>
            </motion.div>

          </div>
        </div>
      </section>


      {/* =========================================================================
          4. CORE GAMEPLAY MECHANICS (Honest, In-Depth, No AI Slop)
         ========================================================================= */}
      <section className="relative py-28 px-6 bg-[#07080b]">
        <div className="max-w-6xl mx-auto space-y-28">

          {/* Section Heading */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-purple-400 font-mono text-xs font-black tracking-widest uppercase block">
              CORE GAMEPLAY SYSTEMS
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-wide uppercase leading-tight">
              Tactical Warfare In Every Turn
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              Master deep turn-based mechanics where calculated positioning and card synergies triumph over blind luck.
            </p>
          </div>

          {/* Feature 1: Turn-Based Combat & Delay Timers */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6 space-y-5"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono text-xs font-bold uppercase">
                <Swords className="w-3.5 h-3.5" />
                <span>Turn Timers & Positioning</span>
              </div>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-wider">
                99 Unique Cards & Turn Delay Mechanics
              </h3>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                Every unit in your deck has a specific <strong className="text-amber-300">Turn Delay</strong> (1, 2, or 3 turns) before attacking. Powerful creatures require patience to awaken, while nimble skirmishers strike immediately. You must anticipate your opponent’s countdowns and counter their board before their leviathans unleash destruction.
              </p>

              {/* 4 Skill Badges */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/10 rounded-xl">
                  <img src="/icons/icon_vampirism.webp" alt="Vampirism" className="w-8 h-8 rounded-lg" />
                  <div>
                    <h5 className="font-display font-bold text-xs text-white uppercase">Vampirism</h5>
                    <p className="text-[11px] text-gray-400">Heals creature on attack</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/10 rounded-xl">
                  <img src="/icons/icon_hex.webp" alt="Hex" className="w-8 h-8 rounded-lg" />
                  <div>
                    <h5 className="font-display font-bold text-xs text-white uppercase">Hex</h5>
                    <p className="text-[11px] text-gray-400">Amplifies enemy incoming damage</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/10 rounded-xl">
                  <img src="/icons/icon_plague.webp" alt="Plague" className="w-8 h-8 rounded-lg" />
                  <div>
                    <h5 className="font-display font-bold text-xs text-white uppercase">Plague</h5>
                    <p className="text-[11px] text-gray-400">Deals poison damage every turn</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/10 rounded-xl">
                  <img src="/icons/icon_sacrifice.webp" alt="Sacrifice" className="w-8 h-8 rounded-lg" />
                  <div>
                    <h5 className="font-display font-bold text-xs text-white uppercase">Sacrifice</h5>
                    <p className="text-[11px] text-gray-400">Martyrs allies to heal hero</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6 rounded-2xl overflow-hidden border border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.25)]"
            >
              <img
                src="/landing_warlord_duel.jpg"
                alt="Tactical Card Duel"
                className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
              />
            </motion.div>
          </div>

          {/* Feature 2: 12 PvP Leagues & Strategic Peace Shields */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center lg:flex-row-reverse">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6 space-y-5 lg:order-2"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold uppercase">
                <Trophy className="w-3.5 h-3.5" />
                <span>Competitive Hierarchy</span>
              </div>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-wider">
                12 Ranked Leagues & Peace Shields
              </h3>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                Climb from Bronze all the way to the apex <strong className="text-amber-300">Divine League</strong> (only 2 immortal seats in the entire realm). Daily promotions and demotions ensure fierce competition for high-tier dividend brackets.
              </p>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                Defend your hard-earned rank while resting! Activate <strong className="text-cyan-300">Peace Shields (3h, 6h, 12h)</strong> to make your profile unassailable by rival summoners, securing your crowns and daily sovereign dividend qualification.
              </p>

              {/* League Badge Chips */}
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-2.5 py-1 rounded bg-amber-950/60 border border-amber-500/40 text-[11px] font-mono text-amber-300 font-bold flex items-center gap-1">
                  ✨ Divine (Top 2)
                </span>
                <span className="px-2.5 py-1 rounded bg-rose-950/60 border border-rose-500/40 text-[11px] font-mono text-rose-300 font-bold flex items-center gap-1">
                  👑 Overlord (Top 10)
                </span>
                <span className="px-2.5 py-1 rounded bg-purple-950/60 border border-purple-500/40 text-[11px] font-mono text-purple-300 font-bold flex items-center gap-1">
                  ⚜️ Grandmaster (Top 30)
                </span>
                <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[11px] font-mono text-gray-300">
                  Master • Diamond • Ruby • Emerald • Sapphire • Platinum • Gold • Silver • Bronze
                </span>
              </div>
            </motion.div>

            {/* Visual Shields & Arena UI Graphic */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-[#18110a] via-[#10131b] to-black p-6 sm:p-8 shadow-2xl lg:order-1"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <img src="/icons/league_divine.png" alt="Divine League" className="w-12 h-12 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                    <div>
                      <h4 className="font-display font-black text-lg text-amber-300 uppercase">Divine Pantheon</h4>
                      <p className="text-xs text-gray-400 font-mono">Apex Tier • 1,500 Sov/Day</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-bold">
                    2 Seats Only
                  </span>
                </div>

                {/* Tactical Shields Showcase */}
                <div>
                  <h5 className="font-mono text-xs text-cyan-300 font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    Tactical Peace Shields
                  </h5>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-black/50 border border-cyan-500/30 rounded-xl p-3 text-center">
                      <img src="/icons/shield_3h.png" alt="3h Shield" className="w-8 h-8 mx-auto mb-1" />
                      <span className="font-mono text-xs font-bold text-white block">3 Hours</span>
                      <span className="text-[10px] text-gray-400">Quick Rest</span>
                    </div>
                    <div className="bg-black/50 border border-cyan-500/30 rounded-xl p-3 text-center">
                      <img src="/icons/shield_6h.png" alt="6h Shield" className="w-8 h-8 mx-auto mb-1" />
                      <span className="font-mono text-xs font-bold text-white block">6 Hours</span>
                      <span className="text-[10px] text-gray-400">Night Guard</span>
                    </div>
                    <div className="bg-black/50 border border-cyan-500/30 rounded-xl p-3 text-center">
                      <img src="/icons/shield_12h.png" alt="12h Shield" className="w-8 h-8 mx-auto mb-1" />
                      <span className="font-mono text-xs font-bold text-white block">12 Hours</span>
                      <span className="text-[10px] text-gray-400">Full Fortress</span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-gray-400 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/5">
                  💡 <strong className="text-gray-200">Pro-Tip:</strong> Equip shields before daily rollover cutoffs to ensure rival warlords cannot steal your crowns and knock you out of the top dividend tier.
                </div>
              </div>
            </motion.div>
          </div>

          {/* Feature 3: Hero Equipment & 3 Combat Stances */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6 space-y-5"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 font-mono text-xs font-bold uppercase">
                <Flame className="w-3.5 h-3.5" />
                <span>Hero Customization</span>
              </div>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-wider">
                6 Equipment Slots & 3 Combat Stances
              </h3>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                Beyond card decks, your Hero warlord directly enters the fight. Equip gear across 6 distinct slots: <strong className="text-white">Weapon, Armor, Helmet, Ring, Amulet, and Boots</strong>. Items provide game-changing stats including Turn Delay Reduction, Dodge Chance, Max HP, and Gold multipliers.
              </p>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                Switch between 3 distinct combat specializations in the talent tree to complement your playstyle:
              </p>

              <div className="space-y-2.5 pt-1">
                <div className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/10 rounded-xl">
                  <img src="/icons/void_strike_fx.webp" alt="Void Strike" className="w-8 h-8 rounded-lg" />
                  <div>
                    <h5 className="font-display font-bold text-xs text-amber-300 uppercase">Void Strike (Offensive)</h5>
                    <p className="text-[11px] text-gray-400">Devastating magic bursts, armor piercing, and chain lightning.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/10 rounded-xl">
                  <img src="/icons/blood_aura_fx.webp" alt="Blood Aura" className="w-8 h-8 rounded-lg" />
                  <div>
                    <h5 className="font-display font-bold text-xs text-rose-300 uppercase">Blood Aura (Defensive)</h5>
                    <p className="text-[11px] text-gray-400">Hero life leech, damage mitigation shields, and survival surge.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/10 rounded-xl">
                  <img src="/icons/warlord_cry_fx.webp" alt="Warlord Cry" className="w-8 h-8 rounded-lg" />
                  <div>
                    <h5 className="font-display font-bold text-xs text-purple-300 uppercase">Warlord Cry (Strategic)</h5>
                    <p className="text-[11px] text-gray-400">Global creature attack buffs, stun control, and cooldown acceleration.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Feature 3 Graphic: The Altar of Summoning */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6 rounded-2xl border border-rose-500/30 bg-gradient-to-br from-[#1c0c12] via-[#120f18] to-black p-6 sm:p-8 shadow-2xl space-y-6"
            >
              <div>
                <span className="font-mono text-xs text-rose-400 font-bold uppercase tracking-wider block mb-1">
                  Card Progression & Altar Packs
                </span>
                <h4 className="font-display font-black text-xl text-white uppercase">
                  Summon, Fuse & Ascend Card Tiers
                </h4>
                <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                  Earn Gold and Void Dust in campaign battles to unlock booster packs at the Altar. Fuse duplicate cards to ascend their tier from Bronze up to Divine, expanding their stats and unlocking advanced combat skills.
                </p>
              </div>

              {/* 3 Pack Chests from the game */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-black/60 border border-white/10 rounded-xl p-3 text-center hover:border-amber-500/40 transition-colors">
                  <img src="/packs/chest_basic.webp" alt="Basic Chest" className="w-14 h-14 mx-auto object-contain mb-2" />
                  <span className="font-display font-bold text-xs text-white uppercase block">Basic Chest</span>
                  <span className="text-[10px] text-gray-400 font-mono">Gold Cost</span>
                </div>

                <div className="bg-black/60 border border-white/10 rounded-xl p-3 text-center hover:border-cyan-500/40 transition-colors">
                  <img src="/packs/chest_rare.webp" alt="Rare Chest" className="w-14 h-14 mx-auto object-contain mb-2" />
                  <span className="font-display font-bold text-xs text-cyan-300 uppercase block">Rare Chest</span>
                  <span className="text-[10px] text-gray-400 font-mono">Void Dust</span>
                </div>

                <div className="bg-black/60 border border-white/10 rounded-xl p-3 text-center hover:border-purple-500/40 transition-colors">
                  <img src="/packs/chest_premium.webp" alt="Premium Chest" className="w-14 h-14 mx-auto object-contain mb-2" />
                  <span className="font-display font-bold text-xs text-purple-300 uppercase block">Royal Chest</span>
                  <span className="text-[10px] text-gray-400 font-mono">Guaranteed Epic</span>
                </div>
              </div>

              {/* Card Tiers Progression */}
              <div className="p-3.5 bg-black/40 rounded-xl border border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="text-amber-600 font-bold">Bronze</span>
                <span className="text-gray-500">→</span>
                <span className="text-gray-300 font-bold">Silver</span>
                <span className="text-gray-500">→</span>
                <span className="text-yellow-400 font-bold">Gold</span>
                <span className="text-gray-500">→</span>
                <span className="text-purple-400 font-bold">Legendary</span>
                <span className="text-gray-500">→</span>
                <span className="text-amber-300 font-bold">✨ Divine</span>
              </div>
            </motion.div>
          </div>

        </div>
      </section>


      {/* =========================================================================
          5. THE 4 IN-GAME CURRENCIES (Transparent Breakdown)
         ========================================================================= */}
      <section className="relative py-24 px-6 bg-[#0a0d14] border-t border-b border-white/5">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
              IN-GAME CURRENCIES & RESOURCES
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-wide">
              Understand the Economy
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Every resource in Void Covenant has a transparent, well-defined utility in the ecosystem:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Currency 1: Gold */}
            <div className="bg-gradient-to-b from-white/[0.04] to-black border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                  <img src="/icons/icon_gold.webp" alt="Gold" className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-white uppercase">Gold</h3>
                  <span className="text-[11px] font-mono text-yellow-400 font-bold">Primary Game Currency</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed font-sans">
                  Earned from Campaign battles and PvP duels. Used to purchase basic gear, open Bronze card packs at the Altar, and pay for card fusion fees.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-gray-400">
                Sources: PvE Floors, Daily PvP
              </div>
            </div>

            {/* Currency 2: Void Dust */}
            <div className="bg-gradient-to-b from-white/[0.04] to-black border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                  <img src="/icons/icon_dust.webp" alt="Void Dust" className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-white uppercase">Void Dust</h3>
                  <span className="text-[11px] font-mono text-cyan-400 font-bold">Arcane Crafting Powder</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed font-sans">
                  Obtained by defeating campaign bosses and disenchanting duplicate cards. Used to summon Rare booster packs and upgrade card levels.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-gray-400">
                Sources: Boss Stages, League Chests
              </div>
            </div>

            {/* Currency 3: Dark Shards */}
            <div className="bg-gradient-to-b from-white/[0.04] to-black border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                  <img src="/icons/icon_shards.webp" alt="Dark Shards" className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-white uppercase">Dark Shards</h3>
                  <span className="text-[11px] font-mono text-purple-400 font-bold">Premium Crystals</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed font-sans">
                  Premium utility crystals. Used to activate 30/90 day VIP Passes, purchase tactical Peace Shields, and refill battle energy.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-gray-400">
                Sources: Store, Pass Milestones
              </div>
            </div>

            {/* Currency 4: Blood Sovereigns */}
            <div className="bg-gradient-to-b from-amber-950/40 via-black to-black border border-amber-500/50 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.3)]">
                  <img src="/icons/icon_sovereign.webp" alt="Blood Sovereigns" className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-amber-300 uppercase">Blood Sovereigns</h3>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">100 = $1.00 USDT</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed font-sans">
                  Convertible hard P2E currency. Earned through daily PvP league rankings, arena duels, and referrals. Directly withdrawable in USDT to your wallet.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-amber-500/30 text-[11px] font-mono text-amber-400 font-bold">
                Sources: 12 Leagues, Duels, Referrals
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* =========================================================================
          6. HOW TO START PLAYING IN 3 EASY STEPS
         ========================================================================= */}
      <section className="relative py-28 px-6 bg-[#07080b]">
        <div className="max-w-5xl mx-auto space-y-16">
          
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="text-[#c5a880] font-mono text-xs font-bold uppercase tracking-widest block">
              QUICK ONBOARDING
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-wide">
              How to Start Playing
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Jump into the Abyss in less than 60 seconds with zero friction:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            
            {/* Step 1 */}
            <div className="bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10 hover:border-amber-400/50 rounded-2xl p-6 space-y-4 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-display font-black text-xl text-amber-300 group-hover:scale-110 transition-transform">
                1
              </div>
              <h3 className="font-display font-bold text-lg text-white uppercase tracking-wider">
                Connect Web3 Wallet
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                Connect any compatible Web3 wallet with one click. Instant cryptographic login — zero registration forms, email verification, or passwords.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10 hover:border-purple-400/50 rounded-2xl p-6 space-y-4 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center font-display font-black text-xl text-purple-300 group-hover:scale-110 transition-transform">
                2
              </div>
              <h3 className="font-display font-bold text-lg text-white uppercase tracking-wider">
                Claim Starter Deck
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                Receive your free starter deck right away. Battle through initial Campaign floors to earn Gold, unlock Void Dust, and level up your squad.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10 hover:border-emerald-400/50 rounded-2xl p-6 space-y-4 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-display font-black text-xl text-emerald-300 group-hover:scale-110 transition-transform">
                3
              </div>
              <h3 className="font-display font-bold text-lg text-white uppercase tracking-wider">
                Climb & Earn Payouts
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                Enter the ranked Arena, climb the 12 competitive leagues, collect daily Sovereign dividends, and withdraw USDT straight to your wallet.
              </p>
            </div>

          </div>

          <div className="text-center pt-4">
            <button
              onClick={onConnectWallet}
              disabled={isConnecting}
              className="px-10 py-3.5 bg-[#151a21] border border-[#c5a880]/50 hover:border-[#c5a880] text-[#ebd09b] font-display font-black text-xs sm:text-sm tracking-[0.25em] uppercase rounded-xl transition-all shadow-lg hover:shadow-[0_0_25px_rgba(197,168,128,0.2)] cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-60"
            >
              {isConnecting ? 'CONNECTING...' : 'START PLAYING NOW'}
            </button>
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
              Build your battle deck. Command dark legions. Claim your daily share of the Abyssal treasury.
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
