import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Copy, 
  Check, 
  ArrowLeft, 
  ExternalLink, 
  Swords, 
  Send, 
  Twitter 
} from 'lucide-react';

interface TokenomicsPageProps {
  onBackToGame?: () => void;
  onPlayNow?: () => void;
}

const DUMMY_CA = 'Coming Soon';

export const TokenomicsPage: React.FC<TokenomicsPageProps> = ({ onBackToGame, onPlayNow }) => {
  const [copied, setCopied] = useState(false);
  const [selectedTier, setSelectedTier] = useState<number>(2);

  const handleCopyCA = () => {
    navigator.clipboard.writeText(DUMMY_CA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-[#040407] text-[#e2dfd9] selection:bg-purple-900/40 selection:text-purple-200 overflow-x-hidden relative font-sans">
      
      {/* Background Cinematic Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] bg-gradient-to-b from-purple-950/25 via-rose-950/10 to-transparent blur-[160px]" />
        <div className="absolute top-[35%] right-[-10%] w-[500px] h-[500px] bg-amber-950/15 blur-[180px]" />
        <div className="absolute bottom-[15%] left-[-10%] w-[600px] h-[600px] bg-purple-950/20 blur-[180px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:32px_32px] opacity-30" />
      </div>

      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#06060a]/80 border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Left: Prominent Back to Main Page + Brand */}
          <div className="flex items-center gap-3">
            {onBackToGame && (
              <button
                onClick={onBackToGame}
                className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/20 hover:border-[#ebd09b]/60 text-white hover:text-[#ebd09b] transition-all text-xs font-mono font-semibold flex items-center gap-1.5 cursor-pointer group shadow-sm active:scale-95"
                title="Return to Main Landing Page"
              >
                <ArrowLeft className="w-4 h-4 text-[#ebd09b] group-hover:-translate-x-1 transition-transform" />
                <span>Main Page</span>
              </button>
            )}

            <div 
              className="flex items-center gap-2 cursor-pointer group pl-1 border-l border-white/10" 
              onClick={onBackToGame}
              title="Return to Game"
            >
              <img 
                src="/logo.webp" 
                alt="Void Covenant" 
                className="w-7 h-7 rounded-md border border-white/10 group-hover:border-[#c5a880]/50 transition-all object-cover" 
              />
              <div className="hidden sm:flex items-baseline gap-2">
                <span className="font-display font-bold text-sm tracking-[0.18em] text-white group-hover:text-[#ebd09b] transition-colors">
                  VOID COVENANT
                </span>
                <span className="text-[11px] font-mono text-gray-400 font-medium">
                  $VOID
                </span>
              </div>
            </div>
          </div>

          {/* Right: Telegram + Twitter + Play Game */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="https://t.me/voidcovenant"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-gray-300 hover:text-white transition-all text-xs font-mono flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Telegram</span>
            </a>

            <a
              href="https://x.com/voidcovenantrpg"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-gray-300 hover:text-white transition-all text-xs font-mono flex items-center gap-1.5"
            >
              <Twitter className="w-3.5 h-3.5 text-gray-300" />
              <span className="hidden sm:inline">Twitter</span>
            </a>

            <button
              onClick={onPlayNow || onBackToGame}
              className="px-3.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/20 hover:border-white/40 text-white font-display font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              Play Game
            </button>
          </div>

        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-28 space-y-24 sm:space-y-32">
        
        {/* =========================================================================
            HERO: SLEEK, CONFIDENT, PRODUCT-FIRST
           ========================================================================= */}
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          
          {/* Main Title & Ticker */}
          <div className="space-y-2.5">
            <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl text-white tracking-tight uppercase leading-[1.04]">
              Void Covenant
            </h1>
            <div className="font-display font-bold text-xl sm:text-3xl text-[#ebd09b] tracking-[0.25em] uppercase flex items-center justify-center gap-3">
              <span className="w-8 sm:w-12 h-px bg-gradient-to-r from-transparent to-[#c5a880]/60" />
              <span>$VOID Token</span>
              <span className="w-8 sm:w-12 h-px bg-gradient-to-l from-transparent to-[#c5a880]/60" />
            </div>
          </div>
          
          {/* Atmospheric description */}
          <p className="font-sans text-gray-300/90 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Command dark forces in tactical card duels. Hold <span className="text-[#ebd09b] font-bold font-mono">$VOID</span> in your wallet to unlock daily arena privileges, access exclusive cards, and compete in championship tournaments.
          </p>

          {/* Clean Streamlined Contract Address Bar */}
          <div className="max-w-md mx-auto pt-1">
            <div className="flex items-center justify-between p-1.5 pl-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 transition-all group">
              <div className="flex items-center gap-2.5 overflow-hidden text-left">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#c5a880] shrink-0 font-bold">CA</span>
                <span className="text-white/20 select-none">|</span>
                <span className="text-xs font-mono text-gray-300 truncate select-all">{DUMMY_CA}</span>
              </div>
              <button
                onClick={handleCopyCA}
                className="px-3.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white text-xs font-mono font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-gray-400 group-hover:text-white" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action CTAs: 3 balanced, normal buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            
            {/* 1. Pump.fun */}
            <a
              href="https://pump.fun"
              target="_blank"
              rel="noopener noreferrer"
              className="h-11 px-5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/35 hover:border-emerald-400 text-emerald-300 font-display font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.12)] hover:scale-[1.02] active:scale-95"
            >
              <span>Buy on Pump.fun</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* 2. Play in Browser - Sleek dark glass, not blinding yellow */}
            <button
              onClick={onPlayNow || onBackToGame}
              className="h-11 px-5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/20 hover:border-white/40 text-white font-display font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:scale-[1.02] active:scale-95"
            >
              <Swords className="w-3.5 h-3.5 text-gray-300" />
              <span>Play in Browser</span>
            </button>

            {/* 3. Play in Telegram */}
            <a
              href="https://t.me/voidcovenantbot/voidcovenant"
              target="_blank"
              rel="noopener noreferrer"
              className="h-11 px-5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-400/35 hover:border-sky-300 text-sky-300 font-display font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(56,189,248,0.12)] hover:scale-[1.02] active:scale-95"
            >
              <Send className="w-3.5 h-3.5 text-sky-400" />
              <span>Play in Telegram</span>
            </a>

          </div>

        </section>

        {/* =========================================================================
            LIVE PRODUCT SHOWCASE: ART & GAMEPLAY PROOF
           ========================================================================= */}
        <section className="space-y-8">
          
          <div className="border-b border-white/[0.06] pb-5">
            <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#c5a880] block">
              // Ecosystem Foundation
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-wider mt-1">
              The Playable Realm
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* 1. Live Product */}
            <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-[#07080d] group">
              <div className="h-52 overflow-hidden relative">
                <img 
                  src="/landing_void_realm.webp" 
                  alt="Live and Fully Playable" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07080d] via-transparent to-transparent" />
              </div>
              <div className="p-5 space-y-1.5 -mt-4 relative z-10">
                <span className="text-[10px] font-mono text-purple-400 uppercase font-bold tracking-wider">
                  Live Product
                </span>
                <h3 className="font-display font-bold text-white text-base">Live & Fully Playable</h3>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">
                  Not a whitepaper concept or empty roadmap promise. Void Covenant is already live, polished, and cross-platform playable in Web browsers and directly inside Telegram.
                </p>
              </div>
            </div>

            {/* 2. Tactical Deckbuilding */}
            <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-[#07080d] group">
              <div className="h-52 overflow-hidden relative">
                <img 
                  src="/landing_cards_altar.webp" 
                  alt="Tactical Deckbuilding" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07080d] via-transparent to-transparent" />
              </div>
              <div className="p-5 space-y-1.5 -mt-4 relative z-10">
                <span className="text-[10px] font-mono text-[#c5a880] uppercase font-bold tracking-wider">
                  Deckbuilding
                </span>
                <h3 className="font-display font-bold text-white text-base">Tactical Deckbuilding</h3>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">
                  Collect dark minions, master forbidden curses, and construct your 10-card battle deck. Discover lethal synergies between creature abilities and hero powers to outplay every opponent.
                </p>
              </div>
            </div>

            {/* 3. Competitive Arena */}
            <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-[#07080d] group">
              <div className="h-52 overflow-hidden relative">
                <img 
                  src="/landing_divine_throne.webp" 
                  alt="12 Ranked Leagues" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07080d] via-transparent to-transparent" />
              </div>
              <div className="p-5 space-y-1.5 -mt-4 relative z-10">
                <span className="text-[10px] font-mono text-amber-400 uppercase font-bold tracking-wider">
                  Competitive Arena
                </span>
                <h3 className="font-display font-bold text-white text-base">12 Ranked Leagues</h3>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">
                  Climb through 12 competitive leagues from Bronze to the supreme Divine Pantheon. Duel commanders worldwide, earn trophies, and fight for top seasonal leaderboard positions.
                </p>
              </div>
            </div>

          </div>

        </section>

        {/* =========================================================================
            TOKEN UTILITY: STAKING, NFT CARDS (SOON), TOURNAMENTS (SOON)
           ========================================================================= */}
        <section className="space-y-8">
          
          <div className="border-b border-white/[0.06] pb-5">
            <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-purple-400 block">
              // Ecosystem Powers
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-wider mt-1">
              $VOID Token Utility
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* 1. Staking Rewards & Daily Bonuses (LIVE) */}
            <div className="rounded-2xl border border-white/[0.08] hover:border-emerald-500/40 bg-[#07080d] transition-all group overflow-hidden flex flex-col justify-between shadow-xl shadow-black/40">
              <div>
                {/* Artwork Banner */}
                <div className="h-44 overflow-hidden relative">
                  <img 
                    src="/landing_p2e_treasury.webp" 
                    alt="Daily Staking Rewards" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07080d] via-[#07080d]/40 to-transparent" />
                  
                  {/* Top Badges */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                    <span className="backdrop-blur-md bg-black/60 border border-white/10 px-2.5 py-1 rounded-lg text-[10px] font-mono tracking-widest text-[#ebd09b] uppercase font-bold">
                      // UTILITY 01
                    </span>
                    <span className="backdrop-blur-md bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Active
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6 space-y-3 -mt-3 relative z-10">
                  <h3 className="font-display font-black text-xl text-white tracking-wide">
                    Daily Staking Rewards
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed font-sans">
                    Passive ecosystem benefits credited automatically to your account based on your wallet balance.
                  </p>

                  <div className="space-y-2 pt-1 font-sans">
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span>Daily bonus PvP tickets & league multipliers</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span>Up to 25% discount in the dark shard shop</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <div className="pt-3 border-t border-white/[0.06] text-[11px] font-mono text-emerald-400/90">
                  <span>0% Deposit Risk • In Wallet</span>
                </div>
              </div>
            </div>

            {/* 2. Exclusive Limited Cards & Marketplace (SOON) */}
            <div className="rounded-2xl border border-white/[0.08] hover:border-purple-500/40 bg-[#07080d] transition-all group overflow-hidden flex flex-col justify-between shadow-xl shadow-black/40">
              <div>
                {/* Artwork Banner */}
                <div className="h-44 overflow-hidden relative">
                  <img 
                    src="/dark_heroes_lore.webp" 
                    alt="Exclusive Card Marketplace" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07080d] via-[#07080d]/40 to-transparent" />
                  
                  {/* Top Badges */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                    <span className="backdrop-blur-md bg-black/60 border border-white/10 px-2.5 py-1 rounded-lg text-[10px] font-mono tracking-widest text-[#ebd09b] uppercase font-bold">
                      // UTILITY 02
                    </span>
                    <span className="backdrop-blur-md bg-purple-950/80 border border-purple-500/40 text-purple-300 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider">
                      Soon
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6 space-y-3 -mt-3 relative z-10">
                  <h3 className="font-display font-black text-xl text-white tracking-wide">
                    Exclusive Card Marketplace
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed font-sans">
                    A limited collection of powerful, high-tier minions created for dedicated commanders.
                  </p>

                  <div className="space-y-2 pt-1 font-sans">
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                      <span>Purchasable strictly with <strong className="text-white font-mono">$VOID</strong> tokens</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                      <span>Freely tradable on the upcoming player marketplace</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <div className="pt-3 border-t border-white/[0.06] text-[11px] font-mono text-purple-400/90">
                  <span>$VOID Exclusive • Trade on Marketplace</span>
                </div>
              </div>
            </div>

            {/* 3. Tournament Arena (SOON) */}
            <div className="rounded-2xl border border-white/[0.08] hover:border-amber-500/40 bg-[#07080d] transition-all group overflow-hidden flex flex-col justify-between shadow-xl shadow-black/40">
              <div>
                {/* Artwork Banner */}
                <div className="h-44 overflow-hidden relative">
                  <img 
                    src="/landing_warlord_duel.webp" 
                    alt="Championship Tournaments" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07080d] via-[#07080d]/40 to-transparent" />
                  
                  {/* Top Badges */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                    <span className="backdrop-blur-md bg-black/60 border border-white/10 px-2.5 py-1 rounded-lg text-[10px] font-mono tracking-widest text-[#ebd09b] uppercase font-bold">
                      // UTILITY 03
                    </span>
                    <span className="backdrop-blur-md bg-amber-950/80 border border-amber-500/40 text-amber-300 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider">
                      Soon
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6 space-y-3 -mt-3 relative z-10">
                  <h3 className="font-display font-black text-xl text-white tracking-wide">
                    Championship Tournaments
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed font-sans">
                    Competitive arena brackets where top commanders clash for glory and high-yield prize pools.
                  </p>

                  <div className="space-y-2 pt-1 font-sans">
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      <span>Tournament entry fees paid in <strong className="text-white font-mono">$VOID</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      <span>Pooled token rewards for championship winners</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <div className="pt-3 border-t border-white/[0.06] text-[11px] font-mono text-amber-400/90">
                  <span>$VOID Entry & Prize Pools</span>
                </div>
              </div>
            </div>

          </div>

        </section>

        {/* =========================================================================
            SOFT STAKING: ELEGANT, NON-CUSTODIAL
           ========================================================================= */}
        <section className="space-y-8">
          
          <div className="border-b border-white/[0.06] pb-5">
            <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-emerald-400 block">
              // Proof of Balance Staking
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-wider mt-1">
              Holder Privileges
            </h2>
          </div>

          {/* 3-Step Staking Flow */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-mono text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h4 className="font-display font-bold text-white text-sm">Hold $VOID Tokens</h4>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                Keep $VOID in your wallet. Tokens never leave your wallet — zero smart-contract deposit risk, zero lockups.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#ebd09b]/20 border border-[#ebd09b]/40 text-[#ebd09b] font-mono text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h4 className="font-display font-bold text-white text-sm">Link Wallet in Game</h4>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                Connect your wallet on Web, or enter your Solana public address in your game profile inside the Telegram Mini App once.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h4 className="font-display font-bold text-white text-sm">Daily Automated Perks</h4>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                The network scans your balance in real-time. Daily Arena tickets, league rank bonuses, and shop discounts credit automatically at 00:00 UTC.
              </p>
            </div>
          </div>

          {/* 3 Luxury Tier Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* TIER 1 - VOID SENTINEL */}
            <div 
              onClick={() => setSelectedTier(1)}
              className={`p-6 sm:p-7 rounded-2xl border transition-all cursor-pointer bg-gradient-to-b from-purple-950/25 via-[#08070e] to-[#050508] relative group overflow-hidden ${
                selectedTier === 1 
                  ? 'border-purple-400 shadow-[0_0_35px_rgba(168,85,247,0.2)] ring-1 ring-purple-400/50' 
                  : 'border-white/[0.08] hover:border-purple-500/40'
              }`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl pointer-events-none" />
              
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 font-mono text-xs uppercase font-bold tracking-widest">
                    TIER I
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-white font-mono text-xs font-bold">
                    1,000,000+ $VOID
                  </span>
                </div>

                <div>
                  <h3 className="font-display font-black text-2xl text-white tracking-wide uppercase">
                    Void Sentinel
                  </h3>
                  <p className="text-[11px] font-mono text-gray-400 mt-0.5">
                    Guardian of the Outer Veil
                  </p>
                </div>

                <div className="h-px bg-white/[0.06] my-4" />

                <div className="space-y-2.5 font-sans">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      <span>Daily PvP Tickets</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-mono text-xs font-bold">
                      +4 / Day
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      <span>League Rank Rewards</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-mono text-xs font-bold">
                      +10%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* TIER 2 - DREAD ARCHON */}
            <div 
              onClick={() => setSelectedTier(2)}
              className={`p-6 sm:p-7 rounded-2xl border transition-all cursor-pointer bg-gradient-to-b from-[#18130d] via-[#0c090e] to-[#050508] relative group overflow-hidden ${
                selectedTier === 2 
                  ? 'border-[#ebd09b] shadow-[0_0_40px_rgba(235,208,155,0.2)] ring-1 ring-[#ebd09b]/50' 
                  : 'border-white/[0.08] hover:border-[#ebd09b]/50'
              }`}
            >
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#ebd09b]/15 blur-3xl pointer-events-none" />
              
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-[#ebd09b]/15 border border-[#ebd09b]/35 text-[#ebd09b] font-mono text-xs uppercase font-bold tracking-widest">
                    TIER II
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#ebd09b]/15 border border-[#ebd09b]/35 text-[#ebd09b] font-mono text-xs font-bold">
                    5,000,000+ $VOID
                  </span>
                </div>

                <div>
                  <h3 className="font-display font-black text-2xl text-white tracking-wide uppercase">
                    Dread Archon
                  </h3>
                  <p className="text-[11px] font-mono text-[#c5a880] mt-0.5">
                    High Arena Commander
                  </p>
                </div>

                <div className="h-px bg-white/[0.06] my-4" />

                <div className="space-y-2.5 font-sans">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex items-center gap-2 text-xs text-gray-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ebd09b]" />
                      <span>Daily PvP Tickets</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-[#ebd09b]/20 text-[#ebd09b] font-mono text-xs font-bold">
                      +6 / Day
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex items-center gap-2 text-xs text-gray-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ebd09b]" />
                      <span>League Rank Rewards</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-mono text-xs font-bold">
                      +15%
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex items-center gap-2 text-xs text-gray-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ebd09b]" />
                      <span>Dark Shard Shop</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-xs font-bold">
                      -10% Discount
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* TIER 3 - ABYSS SOVEREIGN */}
            <div 
              onClick={() => setSelectedTier(3)}
              className={`p-6 sm:p-7 rounded-2xl border transition-all cursor-pointer bg-gradient-to-b from-rose-950/25 via-[#0e0609] to-[#050508] relative group overflow-hidden ${
                selectedTier === 3 
                  ? 'border-rose-400 shadow-[0_0_40px_rgba(244,63,94,0.2)] ring-1 ring-rose-400/50' 
                  : 'border-white/[0.08] hover:border-rose-500/50'
              }`}
            >
              <div className="absolute top-0 right-0 w-36 h-36 bg-rose-500/15 blur-3xl pointer-events-none" />
              
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/35 text-rose-300 font-mono text-xs uppercase font-bold tracking-widest">
                    TIER III
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/35 text-rose-300 font-mono text-xs font-bold">
                    10,000,000+ $VOID
                  </span>
                </div>

                <div>
                  <h3 className="font-display font-black text-2xl text-white tracking-wide uppercase">
                    Abyss Sovereign
                  </h3>
                  <p className="text-[11px] font-mono text-rose-400/80 mt-0.5">
                    Supreme Imperial Ruler
                  </p>
                </div>

                <div className="h-px bg-white/[0.06] my-4" />

                <div className="space-y-2.5 font-sans">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      <span>Daily PvP Tickets</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-mono text-xs font-bold">
                      +10 / Day
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      <span>League Rank Rewards</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-mono text-xs font-bold">
                      +25%
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      <span>Dark Shard Shop</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-xs font-bold">
                      -25% Discount
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </section>

        {/* =========================================================================
            TOKENOMICS: SUSTAINABLE FLYWHEEL & 50/50 REVENUE BUYBACKS
           ========================================================================= */}
        <section className="space-y-6">
          
          <div className="border-b border-white/[0.06] pb-5">
            <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#ebd09b] block">
              // Ecosystem Economics
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-wider mt-1">
              Tokenomics
            </h2>
          </div>

          <div className="rounded-3xl p-7 sm:p-10 bg-gradient-to-r from-purple-950/40 via-[#0a0812] to-black border border-white/[0.08] relative overflow-hidden space-y-8">
            
            {/* Glow accent */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 blur-[120px] pointer-events-none" />

            <div className="max-w-3xl space-y-3 relative z-10">
              <h3 className="font-display font-black text-xl sm:text-2xl text-white uppercase tracking-tight">
                50% Revenue & Creator Fee Buyback Model
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 font-sans leading-relaxed">
                Void Covenant operates on a self-sustaining competitive economic loop. 
                <strong className="text-white"> 50% of all in-game revenue</strong> 
                and <strong className="text-white">50% of creator fees</strong> are systematically dedicated to open-market buybacks of <strong className="text-[#ebd09b] font-mono">$VOID</strong>.
              </p>
              <p className="text-xs sm:text-sm text-gray-400 font-sans leading-relaxed">
                All repurchased tokens are redirected back to active players — funding high-stakes tournament prize pools, rewarding winners of seasonal competitive events, and powering community contests.
              </p>
            </div>

            {/* Visual Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 relative z-10">
              
              {/* Pillar 1: 50% Game Revenue */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold">
                    Buyback Fuel
                  </span>
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-xs font-bold">
                    50%
                  </span>
                </div>
                <h4 className="font-display font-bold text-white text-base">In-Game Revenue</h4>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">
                  Battle Passes, Dark Shard packs, and in-game store purchases directly fund the $VOID buyback treasury.
                </p>
              </div>

              {/* Pillar 2: 50% Creator Fees */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#ebd09b] font-bold">
                    Buyback Fuel
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#ebd09b]/20 text-[#ebd09b] font-mono text-xs font-bold">
                    50%
                  </span>
                </div>
                <h4 className="font-display font-bold text-white text-base">Creator Fees</h4>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">
                  50% of creator fees generated from trading volume are channeled directly into continuous buybacks.
                </p>
              </div>

              {/* Pillar 3: Rewarding Players & Champions */}
              <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                    Distribution
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold">
                    100% Rewards
                  </span>
                </div>
                <h4 className="font-display font-bold text-white text-base">Tournaments & Events</h4>
                <p className="text-xs text-gray-300 leading-relaxed font-sans">
                  All repurchased tokens reward top PvP tournament winners, seasonal event champions, and community contests.
                </p>
              </div>

            </div>

          </div>

        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.06] bg-[#030305] py-10 relative z-10 text-xs text-gray-500 font-mono">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-400">
            <img src="/logo.webp" alt="Void Covenant" className="w-5 h-5 rounded" />
            <span>© {new Date().getFullYear()} Void Covenant. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            {onBackToGame && (
              <button 
                onClick={onBackToGame} 
                className="text-[#ebd09b] hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-semibold"
              >
                <span>← Main Page</span>
              </button>
            )}
            <a href="https://x.com/voidcovenantrpg" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Twitter</a>
            <a href="https://t.me/voidcovenant" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Telegram</a>
          </div>
        </div>
      </footer>

    </div>
  );
};
