import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Twitter, 
  Send, 
  ArrowUpRight 
} from 'lucide-react';

interface LandingPageProps {
  onConnectWallet: () => void;
  isConnecting: boolean;
}

// Floating particles & rune symbols (100% identical to original Hero Section)
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

// Curated dark fantasy champions with genuine game card art
const CHAMPIONS_GALLERY = [
  {
    id: 'void_overlord',
    name: 'Void Overlord',
    title: 'Sovereign of the Nether Spire',
    faction: 'Abyssal Void',
    art: '/cards/void_overlord.webp',
    initiative: '3-Turn Countdown',
    glowColor: 'rgba(168,85,247,0.4)',
    accentBorder: 'border-purple-500/60',
    accentText: 'text-purple-300',
    accentBadge: 'bg-purple-950/80 text-purple-300 border-purple-500/50',
    lore: 'Born within the event horizon of the shattered nexus. His whispers shatter mortal sanity before his blade leaves the scabbard.',
    combatRole: 'Hex Silence & Soul Siphon',
    roleDesc: 'Silences enemy triggers and channels 50% of dealt damage directly into permanent Warlord health replenishment.',
    stats: { atk: '8 ATK', hp: '35 HP', delay: '3T' }
  },
  {
    id: 'blood_queen',
    name: 'Blood Queen',
    title: 'Matriarch of the Crimson Citadel',
    faction: 'Sanguine Court',
    art: '/cards/blood_queen.webp',
    initiative: '2-Turn Lightning Strike',
    glowColor: 'rgba(239,68,68,0.4)',
    accentBorder: 'border-red-500/60',
    accentText: 'text-red-300',
    accentBadge: 'bg-red-950/80 text-red-300 border-red-500/50',
    lore: 'Her court drinks vintage wine only when imperial blood runs dry. None who have gazed upon her veiled crown survived until the dawn.',
    combatRole: 'First Strike & Sanguine Surge',
    roleDesc: 'Attacks before standard bruisers can react, siphoning life with every blow to sustain your frontline indefinitely.',
    stats: { atk: '8 ATK', hp: '20 HP', delay: '2T' }
  },
  {
    id: 'azrael_death',
    name: 'Azrael, Death',
    title: 'Angel of the Final Harvest',
    faction: 'Reaper Host',
    art: '/cards/azrael_angel_of_death.webp',
    initiative: '4-Turn Siege Engine',
    glowColor: 'rgba(245,158,11,0.4)',
    accentBorder: 'border-amber-500/60',
    accentText: 'text-amber-300',
    accentBadge: 'bg-amber-950/80 text-amber-300 border-amber-500/50',
    lore: 'He bows to no pantheon. When the hourglass of the realm empties, Azrael walks the ash fields alone with his board-cleaving scythe.',
    combatRole: 'Colossal Cleave & Martyrdom',
    roleDesc: 'Sweeps across entire enemy ranks, and sacrifices lesser undead minions to absorb 100% of lethal blows aimed at your Warlord.',
    stats: { atk: '15 ATK', hp: '30 HP', delay: '4T' }
  },
  {
    id: 'abyssal_dragon',
    name: 'Abyssal Dragon',
    title: 'Titan of the Molten Trench',
    faction: 'Deep Trench',
    art: '/cards/abyssal_dragon.webp',
    initiative: '4-Turn Juggernaut',
    glowColor: 'rgba(6,182,212,0.4)',
    accentBorder: 'border-cyan-500/60',
    accentText: 'text-cyan-300',
    accentBadge: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50',
    lore: 'Sleeping for centuries beneath oceanic magma trenches. Its awakening causes tidal cataclysms across the surface empires.',
    combatRole: 'Void Inferno & Armor Shred',
    roleDesc: 'Breathes torrents of black flame across opposing battle ranks, inflicting permanent burn ticks that tear through heavy armor.',
    stats: { atk: '14 ATK', hp: '38 HP', delay: '4T' }
  },
  {
    id: 'dracula_first',
    name: 'Dracula, The First',
    title: 'Progenitor of the Nightborne',
    faction: 'Sanguine Court',
    art: '/cards/dracula_the_first.webp',
    initiative: '3-Turn Mastermind',
    glowColor: 'rgba(16,185,129,0.4)',
    accentBorder: 'border-emerald-500/60',
    accentText: 'text-emerald-300',
    accentBadge: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50',
    lore: 'The first mortal who dared to drink the blood of a dead god. For a thousand winters he has dictated the rise and fall of kings.',
    combatRole: 'Mind Control & Mist Evasion',
    roleDesc: 'Enthralls the highest-attack enemy creature on the field, compelling it to strike adjacent allies on its next turn.',
    stats: { atk: '11 ATK', hp: '34 HP', delay: '3T' }
  },
  {
    id: 'aurelius_demiurge',
    name: 'Aurelius',
    title: 'The Fallen Demiurge',
    faction: 'Divine Pantheon',
    art: '/cards/aurelius_the_demiurge.webp',
    initiative: '4-Turn Apex Deity',
    glowColor: 'rgba(235,208,155,0.45)',
    accentBorder: 'border-amber-300/70',
    accentText: 'text-amber-200',
    accentBadge: 'bg-yellow-950/80 text-amber-200 border-amber-400/50',
    lore: 'A disgraced architect of the cosmos who descended into the Abyss, reforging broken reality with celestial gold and void fire.',
    combatRole: 'Divine Barrier & Cataclysm',
    roleDesc: 'Manifests an indestructible golden barrier around your Warlord while shattering opposing defensive runes.',
    stats: { atk: '16 ATK', hp: '40 HP', delay: '4T' }
  },
];

// High-end Equipment Loadout with genuine item icons
const WARLORD_ARTIFACTS = [
  { slot: 'Weapon', name: 'Soulreaper Scythe', icon: '/icons/equipment/items/soulreaper_scythe.png', trait: '+18 Attack • Siphon Blade' },
  { slot: 'Armor', name: 'Mantle of the Lich King', icon: '/icons/equipment/items/mantle_of_the_lich_king.png', trait: '+35 Max HP • Armor Bulwark' },
  { slot: 'Helmet', name: 'Crown of Thorns', icon: '/icons/equipment/items/crown_of_thorns.png', trait: '-1 Turn Delay to Summons' },
  { slot: 'Ring', name: 'Ring of Infinite Ruin', icon: '/icons/equipment/items/ring_of_infinite_ruin.png', trait: '+22% Critical Spell Pierce' },
  { slot: 'Amulet', name: 'Eye of the Leviathan', icon: '/icons/equipment/items/eye_of_the_leviathan.png', trait: '+15% Dodge Chance' },
  { slot: 'Boots', name: 'Boots of the Apocalypse', icon: '/icons/equipment/items/boots_of_the_apocalypse.png', trait: '+25% Gold & Sovereign Multiplier' },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onConnectWallet, isConnecting }) => {
  const [selectedChampionIdx, setSelectedChampionIdx] = useState(0);
  const activeChampion = CHAMPIONS_GALLERY[selectedChampionIdx];

  // Active section tracking for floating navigation
  const [activeNav, setActiveNav] = useState<string>('hero');
  const [showNav, setShowNav] = useState<boolean>(false);

  // Track scroll position to update active navigation item and toggle visibility
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowNav(scrollY > 220);

      const sections = ['hero', 'lore', 'tactics', 'warlord', 'colosseum', 'treasury', 'alliance'];
      for (const id of sections.reverse()) {
        const el = document.getElementById(id);
        if (el && scrollY >= el.offsetTop - 300) {
          setActiveNav(id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 3D Card Hover Tilt state
  const [cardTilt, setCardTilt] = useState({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });
  const [isHoveringCard, setIsHoveringCard] = useState(false);

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -14;
    const rotateY = ((x - centerX) / centerX) * 14;
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    setCardTilt({ rotateX, rotateY, glareX, glareY });
  };

  const handleCardMouseLeave = () => {
    setIsHoveringCard(false);
    setCardTilt({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });
  };

  return (
    <div className="min-h-screen bg-[#050608] text-[#e8e6e3] overflow-x-hidden selection:bg-[#c5a880]/30 selection:text-[#ebd09b]">
      
      {/* =========================================================================
          FLOATING LUXURY GOTHIC NAVIGATION BAR (SHOWN ONLY ON SCROLL)
         ========================================================================= */}
      <AnimatePresence>
        {showNav && (
          <motion.nav
            initial={{ y: -60, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -60, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-[96vw] overflow-x-auto no-scrollbar"
          >
        <div className="relative px-3 sm:px-4 py-1.5 rounded-full bg-[#07080c]/90 backdrop-blur-2xl border border-[#c5a880]/35 shadow-[0_12px_40px_rgba(0,0,0,0.9),0_0_20px_rgba(197,168,128,0.12)] flex items-center gap-1 sm:gap-1.5">
          {/* Subtle gothic inner border highlight */}
          <div className="absolute inset-[1px] rounded-full border border-white/[0.04] pointer-events-none" />

          {/* Return to Top button */}
          <button
            onClick={() => scrollToSection('hero')}
            title="Home"
            className={`relative px-3 py-1.5 rounded-full text-xs font-display tracking-widest uppercase transition-all duration-300 flex items-center gap-1.5 ${
              activeNav === 'hero'
                ? 'text-[#ebd09b] bg-white/[0.08] border border-[#c5a880]/50 shadow-[0_0_12px_rgba(197,168,128,0.2)]'
                : 'text-[#8e8579] hover:text-[#ebd09b] hover:bg-white/[0.04]'
            }`}
          >
            <span className="font-display font-black text-[#c5a880] text-sm">Ω</span>
            <span className="font-bold text-[11px] hidden sm:inline">Main</span>
          </button>

          <span className="text-[#c5a880]/20 text-[10px] select-none hidden sm:inline">|</span>

          {/* Nav Items */}
          {[
            { id: 'lore', label: 'Abyss' },
            { id: 'tactics', label: 'Combat' },
            { id: 'warlord', label: 'Warlords' },
            { id: 'colosseum', label: 'Leagues' },
            { id: 'treasury', label: 'Economy' },
            { id: 'alliance', label: 'Referral system' },
          ].map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`relative px-2.5 sm:px-3 py-1.5 rounded-full font-display text-[10px] sm:text-[11px] tracking-[0.14em] uppercase whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? 'text-[#f6edd9] font-bold shadow-[0_0_16px_rgba(212,175,55,0.25)]'
                    : 'text-[#8e8579] hover:text-[#ebd09b] hover:bg-white/[0.04]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavBackground"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-[#241a12] via-[#2d2218] to-[#1c130d] border border-[#c5a880]/50 -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                {item.label}
              </button>
            );
          })}

          <div className="w-[1px] h-4 bg-gradient-to-b from-transparent via-[#c5a880]/30 to-transparent mx-1 hidden sm:block" />

          {/* CTA Play Now - Refined Dark Gothic Gold Button */}
          <button
            onClick={onConnectWallet}
            disabled={isConnecting}
            className="group relative px-4 py-1.5 rounded-full bg-gradient-to-r from-[#181a20] via-[#221c17] to-[#181a20] hover:from-[#2a221b] hover:to-[#221c17] text-[#ebd09b] hover:text-[#fff2d1] border border-[#c5a880]/60 hover:border-[#ebd09b] shadow-[0_0_15px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] hover:shadow-[0_0_20px_rgba(197,168,128,0.35)] transition-all duration-300 cursor-pointer active:scale-95 flex items-center gap-2 whitespace-nowrap"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#c5a880] group-hover:bg-[#ebd09b] shadow-[0_0_6px_rgba(197,168,128,0.8)] animate-pulse" />
            <span className="font-display font-bold text-[10px] sm:text-[11px] tracking-[0.18em] uppercase">
              {isConnecting ? 'Connecting...' : 'Play Now'}
            </span>
          </button>
        </div>
      </motion.nav>
      )}
      </AnimatePresence>

      {/* =========================================================================
          1. HERO SECTION (100% PRESERVED AS STRICTLY DIRECTED)
         ========================================================================= */}
      <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Top-Right Social Links (Twitter/X, Telegram, Discord) */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="absolute top-5 right-5 sm:top-6 sm:right-8 z-30 flex items-center gap-2 sm:gap-2.5"
        >
          {/* Twitter / X */}
          <a
            href="https://x.com/voidcovenantrpg"
            target="_blank"
            rel="noopener noreferrer"
            title="Follow us on X (Twitter)"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0b0c10]/85 hover:bg-[#151922] border border-[#c5a880]/30 hover:border-[#ebd09b] text-gray-300 hover:text-white shadow-[0_4px_16px_rgba(0,0,0,0.7)] backdrop-blur-md transition-all duration-300 group cursor-pointer active:scale-95 select-none"
          >
            <svg className="w-4 h-4 fill-current group-hover:text-[#ebd09b] transition-colors" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span className="font-display font-bold text-xs tracking-wider uppercase hidden sm:inline">
              Twitter
            </span>
          </a>

          {/* Telegram Channel */}
          <a
            href="https://t.me/voidcovenant"
            target="_blank"
            rel="noopener noreferrer"
            title="Official Telegram Channel"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0b0c10]/85 hover:bg-[#0c2233] border border-[#c5a880]/30 hover:border-cyan-400 text-gray-300 hover:text-cyan-300 shadow-[0_4px_16px_rgba(0,0,0,0.7)] backdrop-blur-md transition-all duration-300 group cursor-pointer active:scale-95 select-none"
          >
            <Send className="w-4 h-4 text-cyan-400 transform -rotate-12 translate-x-[-0.5px] group-hover:scale-110 transition-transform" />
            <span className="font-display font-bold text-xs tracking-wider uppercase hidden sm:inline text-gray-300 group-hover:text-cyan-200">
              Telegram
            </span>
          </a>

          {/* Discord Server */}
          <a
            href="https://discord.gg/cJNWwtVpKf"
            target="_blank"
            rel="noopener noreferrer"
            title="Official Discord Server"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0b0c10]/85 hover:bg-[#1a1b38] border border-[#c5a880]/30 hover:border-indigo-400 text-gray-300 hover:text-indigo-300 shadow-[0_4px_16px_rgba(0,0,0,0.7)] backdrop-blur-md transition-all duration-300 group cursor-pointer active:scale-95 select-none"
          >
            <svg className="w-4 h-4 fill-current text-indigo-400 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            <span className="font-display font-bold text-xs tracking-wider uppercase hidden sm:inline text-gray-300 group-hover:text-indigo-200">
              Discord
            </span>
          </a>
        </motion.div>

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
        <div className="relative z-10 flex flex-col items-center gap-5 sm:gap-6 px-4 w-full max-w-4xl text-center">
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
            className="font-display font-black text-3xl xs:text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white tracking-[0.14em] sm:tracking-[0.25em] select-none max-w-full"
            style={{
              textShadow:
                '0 0 30px rgba(197,168,128,0.3), 0 0 60px rgba(197,168,128,0.15), 0 2px 4px rgba(0,0,0,0.8)',
              animation: 'landingTitleGlow 4s ease-in-out infinite',
            }}
          >
            VOID COVENANT
          </motion.h1>

          {/* Subtitle / P2E Category Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#c5a880]/10 border border-[#c5a880]/30 shadow-[0_0_15px_rgba(197,168,128,0.15)]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
            <span className="font-display font-bold text-xs md:text-sm text-[#ebd09b] tracking-[0.3em] uppercase select-none">
              Play-to-Earn Dark Card RPG
            </span>
          </motion.div>

          {/* Separator */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="w-40 sm:w-56 h-px bg-gradient-to-r from-transparent via-[#c5a880]/40 to-transparent"
          />

          {/* Tagline highlighting dark fantasy & play-to-earn */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.4 }}
            className="text-xs sm:text-sm md:text-base text-gray-300/90 font-sans font-normal max-w-md md:max-w-lg leading-relaxed px-4 select-none"
          >
            Command forbidden forces, conquer high-stakes arenas, and claim real on-chain rewards for every tactical victory.
          </motion.p>

          {/* Dual Action CTA Buttons: Play in Telegram & Connect Wallet */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.8 }}
            className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-2xl px-2 select-none"
          >
            {/* Play in Telegram Button - Refined Dark Luxury Telegram Artifact */}
            <a
              href="https://t.me/voidcovenantbot"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto min-w-[260px] h-[54px] px-8 rounded-2xl bg-gradient-to-b from-[#0f2131]/95 via-[#0a1722]/95 to-[#060c12] border border-cyan-400/40 hover:border-cyan-300 text-cyan-100 hover:text-white font-display font-bold text-xs sm:text-sm tracking-[0.22em] uppercase transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.8),0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_30px_rgba(6,182,212,0.45)] active:scale-95 flex items-center justify-center gap-3 cursor-pointer group whitespace-nowrap"
            >
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-inner">
                <Send className="w-3.5 h-3.5 text-cyan-300 transform -rotate-12 translate-x-[-0.5px]" />
              </div>
              <span>PLAY IN TELEGRAM</span>
            </a>

            {/* Connect Wallet & Play Button - Refined Dark Luxury Gold Artifact */}
            <button
              onClick={onConnectWallet}
              disabled={isConnecting}
              className="w-full sm:w-auto min-w-[260px] h-[54px] px-8 rounded-2xl bg-gradient-to-b from-[#211a13]/95 via-[#18130d]/95 to-[#0e0b07] border border-[#c5a880]/50 hover:border-[#ebd09b] text-[#ebd09b] hover:text-[#fff5db] font-display font-bold text-xs sm:text-sm tracking-[0.22em] uppercase transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.8),0_0_20px_rgba(197,168,128,0.15)] hover:shadow-[0_0_30px_rgba(197,168,128,0.35)] active:scale-95 flex items-center justify-center cursor-pointer group whitespace-nowrap disabled:opacity-60 disabled:cursor-wait"
            >
              <span className={isConnecting ? 'animate-pulse' : ''}>
                {isConnecting ? 'CONNECTING...' : 'CONNECT WALLET & PLAY'}
              </span>
            </button>
          </motion.div>
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
          2. THE CORE PREMISE: A WORLD OF FALLEN GODS & DARK MAGIC
         ========================================================================= */}
      <section id="lore" className="relative py-28 px-6 border-t border-[#c5a880]/20 bg-[radial-gradient(ellipse_at_top,#14101e_0%,#050608_70%)] overflow-hidden">
        {/* Occult ambient aura */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-purple-950/20 blur-[170px] pointer-events-none" />

        <div className="max-w-6xl mx-auto space-y-20 relative z-10">
          
          {/* Section Heading */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="font-mono text-xs uppercase tracking-[0.4em] text-[#c5a880] font-bold block">
              // Enter The Covenant
            </span>
            <h2 className="font-display font-black text-4xl sm:text-6xl text-white tracking-wider uppercase leading-tight text-shadow-gold">
              In A World of Dead Gods, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ebd09b] via-[#c5a880] to-[#8c7355]">
                Power Is Seized, Not Given
              </span>
            </h2>
            <p className="text-gray-300/90 text-sm sm:text-base md:text-lg leading-relaxed font-sans max-w-2xl mx-auto">
              Void Covenant is a dark fantasy card battle RPG where you forge pacts with ancient horrors, master lethal forbidden sorceries, and challenge warlords across the world for glory and real treasure.
            </p>
          </div>

          {/* Cinematic Feature 1: The Descent into the Abyss */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-7 relative rounded-3xl overflow-hidden border border-[#c5a880]/30 shadow-[0_20px_60px_rgba(0,0,0,0.9)] group">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#ebd09b] z-20 pointer-events-none" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#ebd09b] z-20 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#ebd09b] z-20 pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#ebd09b] z-20 pointer-events-none" />

              <img
                src="/dark_heroes_lore.jpg"
                alt="Command Legions of Darkness"
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
            </div>

            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-mono uppercase tracking-[0.3em] text-[#c5a880] font-bold block">
                01 // Dark Fantasy Campaign
              </span>
              <h3 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-wide leading-tight">
                Conquer The Infinite Catacombs
              </h3>
              <p className="text-sm sm:text-base text-gray-300 font-sans leading-relaxed">
                Descend into an endless subterranean abyss ruled by colossal overlords and forgotten deities. Every floor tests the synergy of your dark deck, yielding ancient relics, forbidden cards, and mystical spoils.
              </p>
              <div className="pt-2 border-t border-white/10 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ebd09b]" />
                  <span className="text-xs font-mono uppercase tracking-wider text-gray-200">Towering Abyssal Bosses Every 10 Floors</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ebd09b]" />
                  <span className="text-xs font-mono uppercase tracking-wider text-gray-200">Harvest Rare Transmutation Dust & Artifacts</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ebd09b]" />
                  <span className="text-xs font-mono uppercase tracking-wider text-gray-200">Test Unbreakable Deck Combinations</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cinematic Feature 2: Tactical Grid Duels */}
          <div id="tactics" className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pt-8">
            <div className="lg:col-span-5 space-y-6 order-2 lg:order-1">
              <span className="text-xs font-mono uppercase tracking-[0.3em] text-purple-400 font-bold block">
                02 // Deep Tactical Combat
              </span>
              <h3 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-wide leading-tight">
                High-Stakes Magic Duels
              </h3>
              <p className="text-sm sm:text-base text-gray-300 font-sans leading-relaxed">
                No mindless autoplay or pay-to-win shortcuts. Battles in Void Covenant are a cerebral duel of timing, sacrifice, and counters.
              </p>
              <div className="pt-2 border-t border-white/10 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span className="text-xs font-mono uppercase tracking-wider text-gray-200">Master 4 Forbidden Arts: Vampirism, Hexes, Plague, & Dark Sacrifice</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span className="text-xs font-mono uppercase tracking-wider text-gray-200">Break through enemy lines to strike opposing warlords directly</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span className="text-xs font-mono uppercase tracking-wider text-gray-200">Every decision, turn delay, and trigger can reverse the match</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 relative rounded-3xl overflow-hidden border border-purple-500/40 shadow-[0_20px_60px_rgba(168,85,247,0.2)] order-1 lg:order-2 group">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-purple-400 z-20 pointer-events-none" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-purple-400 z-20 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-purple-400 z-20 pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-purple-400 z-20 pointer-events-none" />

              <img
                src="/gameplay_cinematic_duel.jpg"
                alt="High Stakes Colosseum Arena Duel"
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          3. HERO & GEAR: THE LIVING WARLORD
         ========================================================================= */}
      <section id="warlord" className="relative py-28 px-6 border-t border-[#c5a880]/20 bg-[#06080d] overflow-hidden">
        <div className="max-w-6xl mx-auto space-y-16">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="font-mono text-xs uppercase tracking-[0.35em] text-[#c5a880] block font-bold">
              // The Commander System
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-wider uppercase leading-tight text-shadow-gold">
              You Are Not Just A Spectator. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-[#ebd09b] to-amber-400">
                You Lead The Frontline.
              </span>
            </h2>
            <p className="text-gray-300/90 text-sm sm:text-base md:text-lg leading-relaxed font-sans max-w-2xl">
              Your hero enters combat alongside your creatures. Forge mythical armaments, choose your combat stance, and unleash game-changing hero abilities when all seems lost.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Feature 1: Reliquary */}
            <div className="relative rounded-3xl p-8 bg-gradient-to-b from-[#181124] via-[#0c0914] to-black border border-purple-500/40 hover:border-purple-400/80 transition-all duration-500 space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-[0.25em] text-purple-400 font-bold">
                    01 // Arsenal
                  </span>
                  <span className="px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-[10px] font-mono text-purple-300 uppercase">
                    6 Relic Sockets
                  </span>
                </div>

                <h4 className="font-display font-black text-2xl text-white uppercase tracking-wide">
                  Legendary Reliquary
                </h4>

                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans">
                  Equip weapons, heavy dreadplate armor, cursed rings, and royal crowns discovered in the catacombs to amplify hero power and passive aura bonuses.
                </p>

                {/* Real In-Game Relic Icons Gallery */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-2xl bg-black/60 border border-purple-500/30 text-center hover:border-purple-400/70 transition-all">
                    <img src="/icons/equipment/items/soulreaper_scythe.png" alt="Soulreaper Scythe" className="w-12 h-12 object-contain mx-auto mb-1 drop-shadow" />
                    <span className="text-[10px] font-mono text-purple-200 block truncate">Scythe</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-black/60 border border-purple-500/30 text-center hover:border-purple-400/70 transition-all">
                    <img src="/icons/equipment/items/mantle_of_the_lich_king.png" alt="Lich Mantle" className="w-12 h-12 object-contain mx-auto mb-1 drop-shadow" />
                    <span className="text-[10px] font-mono text-purple-200 block truncate">Mantle</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-black/60 border border-purple-500/30 text-center hover:border-purple-400/70 transition-all">
                    <img src="/icons/equipment/items/ring_of_infinite_ruin.png" alt="Ruin Ring" className="w-12 h-12 object-contain mx-auto mb-1 drop-shadow" />
                    <span className="text-[10px] font-mono text-purple-200 block truncate">Signet</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-purple-500/20 flex items-center justify-between text-xs font-mono text-purple-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  Full Hero Customization
                </span>
                <span className="text-[10px] text-gray-500 uppercase">Profile Loadout</span>
              </div>
            </div>

            {/* Feature 2: Battle Stances */}
            <div className="relative rounded-3xl p-8 bg-gradient-to-b from-[#24170d] via-[#100b06] to-black border border-amber-500/40 hover:border-amber-400/80 transition-all duration-500 space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-[0.25em] text-amber-400 font-bold">
                    02 // Tactics
                  </span>
                  <span className="px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-[10px] font-mono text-amber-300 uppercase">
                    3 Combat Trees
                  </span>
                </div>

                <h4 className="font-display font-black text-2xl text-white uppercase tracking-wide">
                  Dynamic Stances
                </h4>

                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans">
                  Switch between offensive void strikes, blood auras that heal your lines, and warlord cries that turn the tide of losing skirmishes.
                </p>

                {/* Stance cards */}
                <div className="space-y-2.5 pt-2">
                  <div className="px-4 py-2.5 rounded-xl bg-black/60 border border-purple-500/40 flex items-center justify-between">
                    <span className="font-display font-bold text-xs text-purple-300 uppercase">Void Strike</span>
                    <span className="text-[10px] font-mono text-gray-400">Burst Spell Damage</span>
                  </div>
                  <div className="px-4 py-2.5 rounded-xl bg-black/60 border border-red-500/40 flex items-center justify-between">
                    <span className="font-display font-bold text-xs text-red-300 uppercase">Blood Aura</span>
                    <span className="text-[10px] font-mono text-gray-400">Sustain & Ward</span>
                  </div>
                  <div className="px-4 py-2.5 rounded-xl bg-black/60 border border-amber-500/40 flex items-center justify-between">
                    <span className="font-display font-bold text-xs text-amber-300 uppercase">Warlord Cry</span>
                    <span className="text-[10px] font-mono text-gray-400">Rally & Buff All</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-amber-500/20 flex items-center justify-between text-xs font-mono text-amber-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Tactical Talent Stances
                </span>
                <span className="text-[10px] text-gray-500 uppercase">Active Playstyle</span>
              </div>
            </div>

            {/* Feature 3: Deck Synergy & Card Mastery */}
            <div className="relative rounded-3xl p-8 bg-gradient-to-b from-[#101924] via-[#080d14] to-black border border-cyan-500/40 hover:border-cyan-400/80 transition-all duration-500 space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-[0.25em] text-cyan-400 font-bold">
                    03 // Mastery
                  </span>
                  <span className="px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 uppercase">
                    Synergy & Tiers
                  </span>
                </div>

                <h4 className="font-display font-black text-2xl text-white uppercase tracking-wide">
                  Forbidden Card Summons
                </h4>

                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans">
                  Summon creatures across multiple rarity tiers — from relentless undead warriors to legendary abyssal dragons. Combine passive creature auras with your warlord's spells to construct an invincible combat deck.
                </p>

                {/* Booster packs preview */}
                <div className="grid grid-cols-3 gap-2.5 pt-2">
                  <div className="p-2 rounded-xl bg-black/60 border border-white/10 text-center">
                    <img src="/packs/pack_bronze.webp" alt="Bronze Pack" className="w-11 h-14 object-contain mx-auto mb-1 drop-shadow" />
                    <span className="text-[9px] font-mono text-amber-300 block uppercase font-bold">Bronze</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/60 border border-cyan-500/30 text-center">
                    <img src="/packs/pack_obsidian.webp" alt="Obsidian Pack" className="w-11 h-14 object-contain mx-auto mb-1 drop-shadow" />
                    <span className="text-[9px] font-mono text-cyan-300 block uppercase font-bold">Obsidian</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/60 border border-rose-500/40 text-center">
                    <img src="/packs/pack_abyssal.webp" alt="Abyssal Pack" className="w-11 h-14 object-contain mx-auto mb-1 drop-shadow" />
                    <span className="text-[9px] font-mono text-rose-300 block uppercase font-bold">Abyssal</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-cyan-500/20 flex items-center justify-between text-xs font-mono text-cyan-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  10-Card Battle Deck
                </span>
                <span className="text-[10px] text-gray-500 uppercase">Full Deck Synergy</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          4. THE GLOBAL ARENA: CLIMB TO GODHOOD
         ========================================================================= */}
      <section id="colosseum" className="relative py-28 px-6 border-t border-[#c5a880]/20 bg-[radial-gradient(ellipse_at_bottom,#1a110a_0%,#050608_80%)] overflow-hidden">
        <div className="max-w-6xl mx-auto space-y-16">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="font-mono text-xs uppercase tracking-[0.35em] text-amber-400 block font-bold">
              // The Global Colosseum
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-wider uppercase leading-tight text-shadow-gold">
              Climb 12 Prestigious Leagues <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-rose-400">
                To Claim The Crown of Gods
              </span>
            </h2>
            <p className="text-gray-300/90 text-sm sm:text-base md:text-lg leading-relaxed font-sans max-w-2xl">
              Compete against commanders worldwide in live ranked arena duels. Earn trophies, climb tiers, and fight for the ultimate honor: a place in the supreme Divine Pantheon.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            <div className="lg:col-span-6 relative rounded-3xl overflow-hidden border-2 border-amber-400/50 shadow-[0_20px_60px_rgba(245,158,11,0.25)] group">
              <img
                src="/landing_divine_throne.jpg"
                alt="The Throne of the Gods"
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex items-end p-8">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-amber-300 font-bold block">
                    The Ultimate Throne
                  </span>
                  <p className="font-display font-black text-2xl sm:text-3xl text-white uppercase mt-1">
                    The Divine Pantheon
                  </p>
                  <p className="text-xs text-gray-300 font-sans mt-2">
                    An ultra-exclusive realm reserved for the two most feared warlords in the entire world.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-6">
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                <div className="flex items-center gap-4">
                  <img src="/icons/league_divine.png" alt="Divine" className="w-12 h-12 object-contain" />
                  <div>
                    <h4 className="font-display font-black text-xl text-amber-300 uppercase">Daily Midnight Reset</h4>
                    <p className="text-xs text-gray-400">Ranks shift every 24 hours — the weak fall, the relentless rise.</p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                <div className="flex items-center gap-4">
                  <img src="/icons/league_void_overlord.png" alt="Void Overlord" className="w-12 h-12 object-contain" />
                  <div>
                    <h4 className="font-display font-black text-xl text-rose-300 uppercase">Daily Sovereign Dividends</h4>
                    <p className="text-xs text-gray-400">High-tier warlords receive daily treasury rewards in Blood Sovereigns based on their rank.</p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                <div className="flex items-center gap-4">
                  <img src="/icons/league_grandmaster_crest.png" alt="Grandmaster" className="w-12 h-12 object-contain" />
                  <div>
                    <h4 className="font-display font-black text-xl text-purple-300 uppercase">Strategic Defense Decks</h4>
                    <p className="text-xs text-gray-400">Formulate impregnable defense setups to guard your trophies while offline.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          5. THE ECONOMY: REAL HARD CURRENCY EARNINGS
         ========================================================================= */}
      <section id="treasury" className="relative py-28 px-6 border-t border-[#c5a880]/20 bg-[#06070a] overflow-hidden">
        <div className="max-w-6xl mx-auto space-y-16">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="font-mono text-xs uppercase tracking-[0.35em] text-emerald-400 block font-bold">
              // Sovereign Economics
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-wider uppercase leading-tight text-shadow-gold">
              Play, Conquer, and Cash Out <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
                Real USDT Value
              </span>
            </h2>
            <p className="text-gray-300/90 text-sm sm:text-base md:text-lg leading-relaxed font-sans max-w-2xl mx-auto">
              Void Covenant is built on a transparent hard currency exchange with zero token volatility. Every victory, ladder climb, and challenge directly translates into real, withdrawable value.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              
              <div className="p-8 rounded-3xl bg-gradient-to-r from-[#1c150b] via-[#10151f] to-[#0c1813] border-2 border-emerald-500/40 shadow-2xl space-y-4">
                <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-widest block">
                  Guaranteed Fixed Benchmark
                </span>
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="font-display font-black text-3xl sm:text-4xl text-white">100 Sovereigns</span>
                  <span className="font-display font-black text-3xl sm:text-4xl text-emerald-400">= $1.00 USDT</span>
                </div>
                <p className="text-sm text-gray-300 font-sans leading-relaxed">
                  No fluctuating charts or sudden devaluations. Blood Sovereigns are backed by a fixed exchange rate and can be requested for withdrawal directly to your personal Web3 wallet at any time.
                </p>
              </div>

              {/* True In-Game Ways to Earn Blood Sovereigns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2 hover:border-amber-500/40 transition-all">
                  <div className="flex items-center gap-2">
                    <img src="/icons/badge_crown_v1.png" alt="Campaign" className="w-6 h-6 object-contain" />
                    <span className="text-xs font-mono text-amber-300 font-bold uppercase">Abyssal Milestones</span>
                  </div>
                  <p className="text-xs text-gray-400 font-sans leading-relaxed">Conquer milestone floors (every 5th & 10th depth) in the Abyss to claim instant first-clear rewards of 25 to 50 Sovereigns.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2 hover:border-amber-500/40 transition-all">
                  <div className="flex items-center gap-2">
                    <img src="/icons/league_divine.png" alt="Leagues" className="w-6 h-6 object-contain" />
                    <span className="text-xs font-mono text-amber-300 font-bold uppercase">Daily League Dividends</span>
                  </div>
                  <p className="text-xs text-gray-400 font-sans leading-relaxed">Hold positions in high-tier leagues to receive daily sovereign rewards delivered directly to your mailbox at midnight.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2 hover:border-amber-500/40 transition-all">
                  <div className="flex items-center gap-2">
                    <img src="/icons/ticket_gladiator.png" alt="Arena" className="w-6 h-6 object-contain" />
                    <span className="text-xs font-mono text-amber-300 font-bold uppercase">PvP Arena Battles</span>
                  </div>
                  <p className="text-xs text-gray-400 font-sans leading-relaxed">Defeat rival warlords in ranked duels to earn daily victory sovereigns straight into your active bank balance.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2 hover:border-amber-500/40 transition-all">
                  <div className="flex items-center gap-2">
                    <img src="/icons/referral_seal.png" alt="Referrals" className="w-6 h-6 object-contain" />
                    <span className="text-xs font-mono text-amber-300 font-bold uppercase">Alliance Bounties</span>
                  </div>
                  <p className="text-xs text-gray-400 font-sans leading-relaxed">Invite other commanders to earn instant pass bounties, milestone achievements up to 500,000 SOV, and a continuous 15% share of their combat winnings.</p>
                </div>
              </div>

            </div>

            <div className="lg:col-span-6 relative rounded-3xl overflow-hidden border-2 border-emerald-500/40 shadow-[0_20px_60px_rgba(16,185,129,0.2)] group">
              <img
                src="/web3_treasury_vault.jpg"
                alt="Imperial Treasury of Blood Sovereigns"
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex items-end p-8">
                <div>
                  <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold block">
                    The Treasury Vault
                  </span>
                  <p className="font-display font-black text-2xl sm:text-3xl text-white uppercase mt-1">
                    Direct Non-Custodial Withdrawals
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          6. BROTHERHOOD: REFERRAL & ALLIANCE SYSTEM
         ========================================================================= */}
      <section id="alliance" className="relative py-28 px-6 border-t border-[#c5a880]/20 bg-[radial-gradient(ellipse_at_top,#140d18_0%,#050608_70%)] overflow-hidden">
        <div className="max-w-6xl mx-auto space-y-16">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="font-mono text-xs uppercase tracking-[0.35em] text-[#ebd09b] block font-bold">
              // The Covenant Alliance
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-wider uppercase leading-tight text-shadow-gold">
              Build Your Dark Legion, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ebd09b] via-amber-300 to-fuchsia-400">
                Earn Lifetime Bounties
              </span>
            </h2>
            <p className="text-gray-300/90 text-sm sm:text-base md:text-lg leading-relaxed font-sans max-w-2xl mx-auto">
              War is won together. Invite fellow commanders into the Abyss and earn instant sovereign bounties, tiered milestone achievements up to 500,000 SOV, and continuous dividends from their battlefield conquests.
            </p>
          </div>

          {/* 4 Pillars of Alliance Earnings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* 1. Instant Pass Bounty */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-[#1a111a] to-black border border-amber-500/40 hover:border-amber-400/80 transition-all duration-500 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-950/60 border border-amber-500/40 flex items-center justify-center">
                  <img src="/icons/referral_seal.png" alt="Alliance Bounty" className="w-8 h-8 object-contain drop-shadow" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider block">
                    Up To +600 SOV ($6.00)
                  </span>
                  <h4 className="font-display font-black text-lg text-white uppercase">
                    Instant Pass Bounty
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans">
                  Receive instant one-time Blood Sovereign payouts into your vault whenever an invited ally activates a Premium (+200 SOV) or Ultra (+600 SOV) pass.
                </p>
              </div>
            </div>

            {/* 2. Lifetime Sovereign Share */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-[#121620] to-black border border-fuchsia-500/40 hover:border-fuchsia-400/80 transition-all duration-500 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-fuchsia-950/60 border border-fuchsia-500/40 flex items-center justify-center">
                  <img src="/icons/icon_sovereign.webp" alt="Lifetime Share" className="w-8 h-8 object-contain drop-shadow" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-mono text-fuchsia-400 font-bold uppercase tracking-wider block">
                    15% Passive Revenue
                  </span>
                  <h4 className="font-display font-black text-lg text-white uppercase">
                    Lifetime Sovereign Share
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans">
                  Earn an ongoing 15% share of all Blood Sovereigns won by your allies across ranked arena battles and daily leaderboard finishes.
                </p>
              </div>
            </div>

            {/* 3. Alliance Milestones (Достижения подписчиков) */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-[#1a140d] to-black border border-yellow-500/50 hover:border-yellow-400/90 transition-all duration-500 space-y-4 shadow-xl flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-l from-amber-500/30 to-transparent text-[10px] font-mono text-amber-300 uppercase tracking-widest font-bold">
                9 Tiers
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-yellow-950/60 border border-yellow-500/40 flex items-center justify-center">
                  <img src="/icons/badge_crown_v1.png" alt="Alliance Milestones" className="w-8 h-8 object-contain drop-shadow" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-mono text-yellow-400 font-bold uppercase tracking-wider block">
                    Up To +500,000 SOV ($5,000)
                  </span>
                  <h4 className="font-display font-black text-lg text-white uppercase">
                    Alliance Milestones
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans">
                  Climb 9 progressive achievement tiers by recruiting Pass subscribers. Unlock up to 884,950 SOV in total cumulative cash bounties.
                </p>
              </div>
            </div>

            {/* 4. Welcome Gift For Allies */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-[#141510] to-black border border-emerald-500/40 hover:border-emerald-400/80 transition-all duration-500 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center">
                  <img src="/icons/icon_gold.webp" alt="Starter Bonus" className="w-8 h-8 object-contain drop-shadow" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider block">
                    +1,000 Gold Starter
                  </span>
                  <h4 className="font-display font-black text-lg text-white uppercase">
                    Welcome Gift For Allies
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans">
                  Your recruits begin their journey with a boosted starter treasury bonus, giving them immediate power to forge initial decks.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          7. GET STARTED IN SECONDS (CTA)
         ========================================================================= */}
      <section className="relative py-32 px-6 overflow-hidden border-t border-[#c5a880]/25 text-center bg-[radial-gradient(ellipse_at_center,#181022_0%,#050608_80%)]">
        <div className="max-w-3xl mx-auto relative z-10 space-y-8">
          
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-[#24170a] to-black border-2 border-[#c5a880]/70 flex items-center justify-center shadow-[0_0_40px_rgba(197,168,128,0.5)]">
            <span className="font-display font-black text-4xl text-[#c5a880]">Ω</span>
          </div>

          <div className="space-y-4">
            <h2 className="font-display font-black text-4xl sm:text-6xl text-white tracking-[0.15em] uppercase leading-tight text-shadow-gold">
              Your Throne Awaits
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-300/90 font-sans max-w-xl mx-auto leading-relaxed">
              No downloads. No endless tutorials. Connect your wallet or play in browser within seconds and begin your ascent into the Abyss.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-2xl mx-auto select-none">
            {/* Play in Telegram Button - Refined Dark Luxury Telegram Artifact */}
            <a
              href="https://t.me/voidcovenantbot"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto min-w-[260px] h-[54px] px-8 rounded-2xl bg-gradient-to-b from-[#0f2131]/95 via-[#0a1722]/95 to-[#060c12] border border-cyan-400/40 hover:border-cyan-300 text-cyan-100 hover:text-white font-display font-bold text-xs sm:text-sm tracking-[0.22em] uppercase transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.8),0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_30px_rgba(6,182,212,0.45)] active:scale-95 flex items-center justify-center gap-3 cursor-pointer group whitespace-nowrap"
            >
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-inner">
                <Send className="w-3.5 h-3.5 text-cyan-300 transform -rotate-12 translate-x-[-0.5px]" />
              </div>
              <span>PLAY IN TELEGRAM</span>
            </a>

            {/* Enter the Covenant Button - Refined Dark Luxury Gold Artifact */}
            <button
              onClick={onConnectWallet}
              disabled={isConnecting}
              className="w-full sm:w-auto min-w-[260px] h-[54px] px-8 rounded-2xl bg-gradient-to-b from-[#211a13]/95 via-[#18130d]/95 to-[#0e0b07] border border-[#c5a880]/50 hover:border-[#ebd09b] text-[#ebd09b] hover:text-[#fff5db] font-display font-bold text-xs sm:text-sm tracking-[0.22em] uppercase transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.8),0_0_20px_rgba(197,168,128,0.15)] hover:shadow-[0_0_30px_rgba(197,168,128,0.35)] active:scale-95 flex items-center justify-center cursor-pointer group whitespace-nowrap disabled:opacity-60 disabled:cursor-wait"
            >
              <span className={isConnecting ? 'animate-pulse' : ''}>
                {isConnecting ? 'CONNECTING...' : 'ENTER THE COVENANT'}
              </span>
            </button>
          </div>

          {/* Luxury Metallic Badges */}
          <div className="pt-8 flex flex-wrap justify-center items-center gap-4">
            <div className="px-5 py-2.5 rounded-full bg-[#121620]/80 border border-[#c5a880]/30 shadow-lg flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ebd09b]" />
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#ebd09b] font-bold">
                Roguelike Abyss
              </span>
            </div>

            <div className="px-5 py-2.5 rounded-full bg-[#1b140e]/80 border border-amber-500/30 shadow-lg flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-amber-300 font-bold">
                Global Ranked Arena
              </span>
            </div>

            <div className="px-5 py-2.5 rounded-full bg-[#0c1813]/80 border border-emerald-500/30 shadow-lg flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-emerald-300 font-bold">
                Direct Crypto Payouts
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          7. FOOTER
         ========================================================================= */}
      <footer className="border-t border-white/10 py-12 px-6 bg-black">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
          <div className="flex items-center gap-5 sm:gap-6">
            {/* Twitter / X */}
            <a
              href="https://x.com/voidcovenantrpg"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-white/5 border border-[#c5a880]/30 flex items-center justify-center hover:border-[#c5a880]/80 hover:bg-white/10 transition-all duration-300 text-gray-400 hover:text-amber-300 cursor-pointer"
              aria-label="Twitter / X"
              title="Official Twitter / X"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* Telegram Channel */}
            <a
              href="https://t.me/voidcovenant"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-white/5 border border-[#c5a880]/30 flex items-center justify-center hover:border-cyan-400 hover:bg-white/10 transition-all duration-300 text-gray-400 hover:text-cyan-300 cursor-pointer"
              aria-label="Telegram Channel"
              title="Official Telegram Channel"
            >
              <Send className="w-5 h-5 transform -rotate-12 translate-x-[-0.5px]" />
            </a>

            {/* Discord Server */}
            <a
              href="https://discord.gg/cJNWwtVpKf"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-white/5 border border-[#c5a880]/30 flex items-center justify-center hover:border-indigo-400 hover:bg-white/10 transition-all duration-300 text-gray-400 hover:text-indigo-300 cursor-pointer"
              aria-label="Discord Server"
              title="Official Discord Server"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            </a>
          </div>

          <p className="text-xs text-gray-500 font-display tracking-widest text-center">
            VOID COVENANT © 2024–2026
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
