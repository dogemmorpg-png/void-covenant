import React, { useState, useEffect } from 'react';
import { getCardTierStyles } from '../utils/tierStyles';
import { audioSystem } from '../utils/AudioSystem';
import { useGame } from '../context/GameContext';
import { useToast } from './Toast';
import { Card, CardTier } from '../types';
import { CARD_TEMPLATES, getCardManaCost } from '../data/cards';
import { Swords, Star, Plus, Minus, ArrowRight, Skull, Shield, Zap, Sparkles, AlertCircle, Crown, ShieldAlert, Bug, Flame, Droplet } from 'lucide-react';
import { assetPreloader, getCardImageUrl } from '../utils/assetPreloader';
import { SanctuaryEmblem, FusionAltarEmblem, BaseCardSlotEmblem, SacrificeSlotEmblem } from './CardsViewCustomIcons';

const getCardIconColor = (color: string) => {
  const colorMap: Record<string, string> = {
    'slate': 'text-slate-400',
    'emerald': 'text-emerald-400',
    'purple': 'text-purple-400',
    'crimson': 'text-red-400',
    'violet': 'text-violet-400',
    'amber': 'text-amber-400',
    'cyan': 'text-cyan-400',
    'rose': 'text-rose-400',
    'red': 'text-red-500',
  };
  return colorMap[color] || 'text-gray-400';
};

const renderCardIcon = (imageName: string, className: string) => {
  if (imageName.startsWith('/cards/')) {
    return <img src={imageName} alt="card icon" className={`object-cover rounded-full ${className.replace('text-slate-400','').replace('text-emerald-400','').replace('text-purple-400','').replace('text-red-400','').replace('text-violet-400','').replace('text-amber-400','').replace('text-cyan-400','').replace('text-rose-400','').replace('text-red-500','')} bg-black/50 p-0.5 border border-white/10`} />;
  }
  switch(imageName) {
    case 'Skull': return <Skull className={className} />;
    case 'Flame': return <Flame className={className} />;
    case 'Sparkles': return <Sparkles className={className} />;
    case 'Wand': return <Sparkles className={className} />;
    case 'Swords': return <Swords className={className} />;
    case 'Crown': return <Crown className={className} />;
    case 'ShieldAlert': return <ShieldAlert className={className} />;
    case 'Rat': return <Bug className={className} />;
    default: return <Swords className={className} />;
  }
};


const renderManaIcon = (cost: number, sizeClass: string = "w-5 h-5") => {
  return (
    <div className={`relative ${sizeClass} shrink-0 flex items-center justify-center`}>
      <svg className="absolute inset-0 w-full h-full filter drop-shadow-[0_0_5px_rgba(6,182,212,0.85)]" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L4 7v10l8 5 8-5V7l-8-5z" fill="url(#manaCrystalGradDeck)" stroke="#66fcf1" strokeWidth="1.5" />
        <path d="M12 2L4 7l8 5 8-5-8-5z" fill="#66fcf1" opacity="0.35" />
        <path d="M4 7v10l8 5V12L4 7z" fill="#00d2ff" opacity="0.55" />
        <path d="M20 7v10l8 5V12L20 7z" fill="#005299" opacity="0.75" />
        <defs>
          <radialGradient id="manaCrystalGradDeck" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00f0ff" />
            <stop offset="100%" stopColor="#0033aa" />
          </radialGradient>
        </defs>
      </svg>
      <span className="relative text-white text-[10px] md:text-[11px] font-black font-mono leading-none z-10 drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.95)]">
        {cost}
      </span>
    </div>
  );
};


const renderSkillIcon = (type: string, sizeClass: string = "w-4 h-4") => {
  const normType = type?.toLowerCase();
  switch (normType) {
    case 'vampirism':
      return (
        <div className={`relative ${sizeClass} shrink-0 flex items-center justify-center`}>
          <svg className="w-full h-full filter drop-shadow-[0_0_3px_rgba(239,68,68,0.7)]" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C12 2 4 10 4 15C4 19.4 7.6 23 12 23C16.4 23 20 19.4 20 15C20 10 12 2 12 2Z" fill="#ef4444" stroke="#fca5a5" strokeWidth="1" />
            <path d="M9 14.5C9 12 11.5 10 11.5 10" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
          </svg>
        </div>
      );
    case 'plague':
      return (
        <div className={`relative ${sizeClass} shrink-0 flex items-center justify-center`}>
          <svg className="w-full h-full filter drop-shadow-[0_0_3px_rgba(16,185,129,0.7)]" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="5" fill="#10b981" stroke="#a7f3d0" strokeWidth="1" />
            <circle cx="12" cy="4.5" r="2.1" fill="#10b981" />
            <circle cx="12" cy="19.5" r="2.1" fill="#10b981" />
            <circle cx="4.5" cy="12" r="2.1" fill="#10b981" />
            <circle cx="19.5" cy="12" r="2.1" fill="#10b981" />
            <circle cx="6.5" cy="6.5" r="1.8" fill="#10b981" />
            <circle cx="17.5" cy="17.5" r="1.8" fill="#10b981" />
            <circle cx="6.5" cy="17.5" r="1.8" fill="#10b981" />
            <circle cx="17.5" cy="6.5" r="1.8" fill="#10b981" />
            <path d="M12 4.5V19.5M4.5 12H19.5" stroke="#10b981" strokeWidth="1.5" />
          </svg>
        </div>
      );
    case 'hex':
      return (
        <div className={`relative ${sizeClass} shrink-0 flex items-center justify-center`}>
          <svg className="w-full h-full filter drop-shadow-[0_0_3px_rgba(168,85,247,0.7)]" viewBox="0 0 24 24" fill="none">
            <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="#c084fc" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="4.5" fill="#a855f7" stroke="#e9d5ff" strokeWidth="1" />
            <circle cx="12" cy="12" r="1.8" fill="#1e1b4b" />
          </svg>
        </div>
      );
    case 'sacrifice':
      return (
        <div className={`relative ${sizeClass} shrink-0 flex items-center justify-center`}>
          <svg className="w-full h-full filter drop-shadow-[0_0_3px_rgba(239,68,68,0.8)]" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C7.5 2 4 5.5 4 10C4 12.9 5.5 15.5 8 16.8V20.5C8 21.3 8.7 22 9.5 22H14.5C15.3 22 16 21.3 16 20.5V16.8C18.5 15.5 20 12.9 20 10C20 5.5 16.5 2 12 2Z" fill="#ef4444" stroke="#fca5a5" strokeWidth="1" />
            <circle cx="9" cy="10" r="1.8" fill="#1a0202" />
            <circle cx="15" cy="10" r="1.8" fill="#1a0202" />
            <path d="M12 12.5L10.5 14.5H13.5L12 12.5Z" fill="#1a0202" />
            <path d="M9.5 18H14.5M10.5 16v4M12.5 16v4" stroke="#1a0202" strokeWidth="1" />
          </svg>
        </div>
      );
    default:
      return null;
  }
};

export const CollectionDeckView: React.FC = () => {
  const { profile, fuseCards, toggleDeckCard } = useGame();
  const toast = useToast();
  
  // States
  const [selectedCardId, setSelectedCardId] = useState<string | null>(
    profile.collection.length > 0 ? profile.collection[0].id : null
  );
  
  // Fusing lab states
  const [isFusingMode, setIsFusingMode] = useState(false);
  const [fuseCardId1, setFuseCardId1] = useState<string | null>(null);
  const [fuseCardId2, setFuseCardId2] = useState<string | null>(null);
  const [fusionConfirmData, setFusionConfirmData] = useState<{card1: Card, card2: Card} | null>(null);
  
  // Filter/Sort
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'level' | 'attack' | 'health' | 'name'>('level');
  const [showFusableOnly, setShowFusableOnly] = useState(false);

  // Currently selected card object
  const selectedCard = profile.collection.find(c => c.id === selectedCardId) || null;

  // Preload full player collection immediately
  useEffect(() => {
    if (profile?.collection && profile.collection.length > 0) {
      assetPreloader.preloadBattleCreatures(profile.collection);
    }
  }, [profile?.collection]);

  // Filtered & sorted collection
  const tierWeight = { legendary: 4, gold: 3, silver: 2, bronze: 1 };
  const filteredCollection = profile.collection
    .filter(card => {
      if (tierFilter !== 'all' && card.tier !== tierFilter) return false;
      
      if (showFusableOnly) {
        // Cannot fuse L5 Legendary
        if (card.level === 5 && card.tier === 'legendary') return false;
        
        // Must have at least one identical clone
        const hasDuplicate = profile.collection.some(c => 
          c.id !== card.id && 
          c.baseId === card.baseId && 
          c.level === card.level && 
          c.tier === card.tier
        );
        if (!hasDuplicate) return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      const tierDiff = (tierWeight[b.tier as keyof typeof tierWeight] || 0) - (tierWeight[a.tier as keyof typeof tierWeight] || 0);
      if (tierDiff !== 0) return tierDiff;

      if (sortBy === 'level') return b.level - a.level;
      if (sortBy === 'attack') return b.attack - a.attack;
      if (sortBy === 'health') return b.health - a.health;
      return a.name.localeCompare(b.name);
    });

  // Deck Toggle Handler
  const handleToggleDeck = (cardId: string) => {
    const res = toggleDeckCard(cardId);
    if (!res.success) {
      toast(res.message, 'warning');
    }
  };

  // Start Fusing Wizard
  const startFusing = (card: Card) => {
    if (card.level === 5 && card.tier === 'legendary') {
      toast('Level 5 legendary cards have already reached the absolute limit of power!', 'warning');
      return;
    }
    setIsFusingMode(true);
    setFuseCardId1(card.id);
    setFuseCardId2(null);
  };

  // Handle card clicks when Fusion Altar mode is active
  const handleCardClickInFusion = (cardId: string) => {
    if (!fuseCardId1) {
      const card = profile.collection.find(c => c.id === cardId);
      if (card && card.level === 5 && card.tier === 'legendary') {
        toast('Level 5 legendary cards have already reached the absolute limit of power!', 'warning');
        return;
      }
      setFuseCardId1(cardId);
      setFuseCardId2(null);
    } else {
      if (cardId === fuseCardId1) {
        toast('You cannot fuse a card with itself!', 'warning');
        return;
      }
      const card2 = profile.collection.find(c => c.id === cardId);
      const card1 = profile.collection.find(c => c.id === fuseCardId1);
      
      if (!card1 || !card2) return;
      
      if (card2.baseId !== card1.baseId) {
        toast('Fusion cards must be identical entities (e.g. two Skeleton Warriors)!', 'warning');
        return;
      }
      if (card2.tier !== card1.tier) {
        toast('Fusion cards must be of the same tier!', 'warning');
        return;
      }
      if (card2.level !== card1.level) {
        toast('The second card must be of the same level!', 'warning');
        return;
      }
      
      setFuseCardId2(cardId);
    }
  };

  const getFusionCosts = (card: Card | null | undefined) => {
    if (!card) return { goldCost: 0, dustCost: 0, shardsCost: 0, isLevelUpgrade: true };
    const isLevelUpgrade = card.level < 5;
    if (isLevelUpgrade) {
      return {
        goldCost: card.level * 150,
        dustCost: card.level * 20,
        shardsCost: 0,
        isLevelUpgrade: true
      };
    }
    let goldCost = 500;
    let dustCost = 100;
    let shardsCost = 5;
    if (card.tier === 'silver') {
      goldCost = 1000;
      dustCost = 200;
      shardsCost = 15;
    } else if (card.tier === 'gold') {
      goldCost = 2000;
      dustCost = 400;
      shardsCost = 30;
    }
    return { goldCost, dustCost, shardsCost, isLevelUpgrade: false };
  };

  // Execute fusion
  const executeFusionRitual = () => {
    if (!fuseCardId1 || !fuseCardId2) return;
    
    const card1 = profile.collection.find(c => c.id === fuseCardId1);
    const card2 = profile.collection.find(c => c.id === fuseCardId2);
    if (!card1 || !card2) return;

    setFusionConfirmData({ card1, card2 });
  };

  const confirmFusionRitual = async () => {
    if (!fusionConfirmData) return;
    const res = await fuseCards(fusionConfirmData.card1.id, fusionConfirmData.card2.id);
    if (res.success) {
      audioSystem.playMagic();
      // Keep isFusingMode(true) open so players can do consecutive fusions!
      setFuseCardId1(null);
      setFuseCardId2(null);
      setFusionConfirmData(null);
      setSelectedCardId(null);
      const isLevelUpgrade = fusionConfirmData.card1.level < 5;
      toast(isLevelUpgrade 
        ? `Fusion complete! Your card ${fusionConfirmData.card1.name} leveled up to L${fusionConfirmData.card1.level + 1}!` 
        : 'Dark Fusion Ritual complete! Your card has been reborn in a new tier with a reduced attack timer!'
      , 'success');
    } else {
      toast(`Ritual error: ${res.message}`, 'warning');
      setFusionConfirmData(null);
    }
  };

  // Get color styles based on tier
  const getTierBadgeStyles = (tier: CardTier) => {
    const base = "px-2.5 py-0.5 rounded-lg border font-mono text-[9px] uppercase font-bold tracking-wider backdrop-blur-sm shadow-md";
    switch (tier) {
      case 'bronze': return `${base} bg-amber-950/70 text-amber-400 border-amber-800/60 shadow-[0_0_10px_rgba(245,158,11,0.2)]`;
      case 'silver': return `${base} bg-slate-900/80 text-slate-300 border-slate-600/60 shadow-[0_0_10px_rgba(148,163,184,0.2)]`;
      case 'gold': return `${base} bg-[#c5a880]/30 text-[#ebd09b] border-[#c5a880]/50 shadow-[0_0_10px_rgba(235,208,155,0.3)]`;
      case 'legendary': return `${base} bg-purple-950/70 text-purple-300 border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.4)] animate-pulse`;
      default: return `${base} bg-black/60 text-gray-400 border-gray-700`;
    }
  };

  // Render a large card slot thumbnail in the Altar
  const renderAltarCardSlot = (cardId: string | null, label: string, onClear: () => void) => {
    const card = profile.collection.find(c => c.id === cardId);
    if (!card) {
      const isBase = label.toLowerCase().includes('base');
      return (
        <div className="w-24 h-32 border-2 border-dashed border-purple-900/40 bg-black/35 rounded-xl flex flex-col items-center justify-center text-center p-2 text-purple-400/50 shadow-inner group">
          {isBase ? (
            <BaseCardSlotEmblem className="w-8 h-10 mb-1" />
          ) : (
            <SacrificeSlotEmblem className="w-8 h-10 mb-1" />
          )}
          <span className="text-[9px] font-mono uppercase tracking-wider font-bold text-gray-400 mt-1">{label}</span>
        </div>
      );
    }
    return (
      <div className={`relative w-24 h-32 rounded-xl p-1.5 flex flex-col justify-between cursor-default border overflow-hidden ${getCardTierStyles(card.tier, false, true)} shadow-lg`}>
        {/* Card Image */}
        <img 
          src={getCardImageUrl(card)} 
          alt={card.name} 
          decoding="async" 
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-80" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10 z-0 pointer-events-none" />
        
        {/* Mana cost */}
        <div className="absolute top-1 right-1 z-10 scale-90">
          {renderManaIcon(getCardManaCost(card), "w-3.5 h-3.5")}
        </div>

        <div className="text-center mt-1 relative z-10 drop-shadow-md">
          <span className="text-[8px] font-display font-bold text-white block truncate leading-none max-w-[76px] mx-auto">{card.name}</span>
          <span className="text-[7px] text-purple-400 font-mono font-bold tracking-wider">L{card.level}</span>
        </div>

        <div className="flex justify-between items-center text-[8px] font-mono font-bold pt-1 border-t border-white/10 relative z-10 drop-shadow-md">
          <span className="text-red-400">⚔️{card.attack}</span>
          <span className="text-emerald-400">❤️{card.health}</span>
        </div>

        {/* LARGE CLOSE BUTTON */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          className="absolute -top-1.5 -right-1.5 bg-black hover:bg-red-950 border border-red-500/50 text-red-500 hover:text-red-300 rounded-full w-6 h-6 flex items-center justify-center text-[10px] z-20 cursor-pointer shadow-md font-bold transition-all hover:scale-110 active:scale-90"
          title="Remove from Altar"
        >
          ✕
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* GOTHIC SUB-TABS */}
      <div className="flex gap-2 border-b border-white/10 pb-px mb-2">
        <button
          onClick={() => {
            setIsFusingMode(false);
            setFuseCardId1(null);
            setFuseCardId2(null);
          }}
          className={`flex items-center gap-2 py-3 px-6 rounded-t-xl font-display font-black text-xs tracking-widest transition-all cursor-pointer border-t border-x ${
            !isFusingMode
              ? 'bg-[#151a21] border-t-2 border-x border-[#ebd09b] border-x-white/10 text-[#ebd09b] shadow-[0_-4px_15px_rgba(197,168,128,0.15)] z-10 translate-y-[2px] border-b-[#151a21]'
              : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <SanctuaryEmblem className="w-4 h-4 shrink-0" />
          <span>CREATURE SANCTUARY</span>
        </button>
        <button
          onClick={() => {
            setIsFusingMode(true);
            setFuseCardId1(null);
            setFuseCardId2(null);
            setSelectedCardId(null);
          }}
          className={`flex items-center gap-2 py-3 px-6 rounded-t-xl font-display font-black text-xs tracking-widest transition-all cursor-pointer border-t border-x ${
            isFusingMode
              ? 'bg-[#151a21] border-t-2 border-x border-purple-500 border-x-white/10 text-purple-300 shadow-[0_-4px_15px_rgba(168,85,247,0.25)] z-10 translate-y-[2px] border-b-[#151a21]'
              : 'border-transparent text-gray-400 hover:text-purple-400 hover:bg-purple-950/10'
          }`}
        >
          <FusionAltarEmblem className="w-4 h-4 shrink-0" />
          <span>FUSION ALTAR</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* LEFT PANEL: Collection & Deck (7 Cols) */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Active Combat Deck banner */}
        <div className="bg-[#151a21] border border-[#c5a880]/25 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-black text-white text-base tracking-widest text-shadow-gold flex items-center gap-2">
                ⚔️ COMBAT DECK ({profile.deck.length}/10)
              </h3>
              <p className="text-[10px] text-gray-400 font-sans mt-0.5">Cards that will fight in the campaign and arena.</p>
            </div>
            {profile.deck.length < 10 && (
              <span className="text-[10px] bg-[#4e0707] text-[#dd2c40] font-mono font-bold py-1 px-2.5 rounded-full border border-[#dd2c40]/30 animate-pulse">
                NOT ENOUGH CARDS! ADD UP TO 10
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(() => {
              const deckCards = profile.deck
                .map(id => profile.collection.find(c => c.id === id))
                .filter((c): c is Card => !!c)
                .sort((a, b) => {
                  const tierDiff = (tierWeight[b.tier as keyof typeof tierWeight] || 0) - (tierWeight[a.tier as keyof typeof tierWeight] || 0);
                  if (tierDiff !== 0) return tierDiff;
                  return b.level - a.level || a.name.localeCompare(b.name);
                });
              const paddedDeck = [...deckCards, ...Array(10 - deckCards.length).fill(null)];
              
              // Rearrange into column-major order to flow top-to-bottom then left-to-right
              const columnMajorDeck: (Card | null)[] = [];
              for (let r = 0; r < 5; r++) {
                columnMajorDeck.push(paddedDeck[r]);     // Left column item
                columnMajorDeck.push(paddedDeck[r + 5]); // Right column item
              }

              return columnMajorDeck.map((card, idx) => {
                if (card) {
                  const borderGlow = selectedCardId === card.id ? 'border-[#66fcf1] ring-1 ring-[#66fcf1]/30 bg-[#16202b]/95' : 'border-gray-800/80 hover:border-gray-700 bg-[#11161d]/90 hover:bg-[#151d27]/95';
                  return (
                    <div
                      key={card.id}
                      onClick={() => {
                        setSelectedCardId(card.id);
                        setIsFusingMode(false);
                      }}
                      className={`relative flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all duration-350 overflow-hidden group ${borderGlow} h-[52px]`}
                    >
                      {/* Hearthstone-style cropped card background art (increased opacity/scale) */}
                      <div className="absolute inset-y-0 right-0 w-2/3 overflow-hidden rounded-r-xl opacity-[0.55] pointer-events-none group-hover:opacity-[0.70] transition-opacity">
                        <img src={getCardImageUrl(card)} alt="" decoding="async" className="w-full h-full object-cover object-right scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#11161d]/75 to-[#11161d]" />
                      </div>

                      <div className="flex items-center gap-2.5 z-10 min-w-0">
                        {/* Mana Badge (larger) */}
                        {renderManaIcon(getCardManaCost(card), "w-6 h-6")}

                        {/* Name & Tier info (larger text) */}
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs md:text-[13px] font-display font-black text-white leading-none tracking-wide truncate group-hover:text-cyan-200 transition-colors">
                            {card.name}
                          </span>
                          <span className="text-[9px] text-gray-400 font-mono leading-none mt-1 uppercase font-bold tracking-wider">
                            L{card.level} • {card.tier}
                          </span>
                        </div>
                      </div>

                      {/* Stats & Actions (larger text) */}
                      <div className="flex items-center gap-3 z-10 shrink-0">
                        <div className="flex items-center gap-2 font-mono text-[11.5px] font-black">
                          <span className="text-red-400 filter drop-shadow">⚔️{card.attack}</span>
                          <span className="text-emerald-400 filter drop-shadow">❤️{card.health}</span>
                          <span className="text-blue-400 filter drop-shadow" title="Delay">⏳{card.delay}</span>
                        </div>

                        {/* Remove Button (bright and distinct) */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleDeck(card.id);
                          }}
                          className="bg-[#4e0707] hover:bg-[#880d1e] border border-[#dd2c40]/60 rounded-lg p-1.5 text-white transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center"
                          title="Remove from deck"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-3 rounded-xl border border-dashed border-white/5 bg-black/10 text-gray-600 h-[52px]"
                    >
                      <div className="flex items-center gap-2">
                        <Swords className="w-4 h-4 opacity-25" />
                        <span className="text-[9px] font-mono tracking-wider font-bold opacity-35">EMPTY SLOT</span>
                      </div>
                    </div>
                  );
                }
              });
            })()}
          </div>
        </div>

        {/* Collection Section */}
        <div className="bg-[#151a21] border border-[#c5a880]/25 rounded-2xl p-5 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-white/10">
            <div>
              <h3 className="font-display font-black text-white text-base tracking-widest text-shadow-gold flex items-center gap-2">
                <SanctuaryEmblem className="w-4 h-4 shrink-0" />
                <span>CREATURE SANCTUARY ({profile.collection.length})</span>
              </h3>
              <p className="text-[10px] text-gray-400 font-sans">All your dark entities are stored here.</p>
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowFusableOnly(!showFusableOnly)}
                className={`flex items-center gap-2 py-1 px-2.5 rounded-lg border text-xs font-mono transition-all select-none cursor-pointer ${
                  showFusableOnly
                    ? 'bg-purple-950/40 border-purple-500 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.35)]'
                    : 'bg-[#0b0c10] border-[#c5a880]/30 text-gray-500 hover:text-[#ebd09b] hover:border-[#c5a880]/50'
                }`}
              >
                {/* Custom checkbox box */}
                <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-all ${
                  showFusableOnly
                    ? 'border-purple-400 bg-purple-500/20 text-purple-300'
                    : 'border-[#c5a880]/40 bg-black/40'
                }`}>
                  {showFusableOnly && (
                    <svg className="w-2.5 h-2.5 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <span>Fusable Only</span>
              </button>

              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="bg-[#0b0c10] border border-[#c5a880]/30 rounded-lg py-1 px-2.5 text-xs text-[#ebd09b] font-mono outline-none"
              >
                <option value="all">All tiers</option>
                <option value="bronze">Bronze</option>
                <option value="silver">Silver</option>
                <option value="gold">Gold</option>
                <option value="legendary">Legendary</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#0b0c10] border border-[#c5a880]/30 rounded-lg py-1 px-2.5 text-xs text-[#ebd09b] font-mono outline-none"
              >
                <option value="level">Level</option>
                <option value="attack">Attack</option>
                <option value="health">Health</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          {isFusingMode ? (
            /* Fusion Selector mode */
            <div className="space-y-4">
              <div className="bg-purple-950/20 border border-purple-500/30 rounded-xl p-3 flex items-start gap-2 text-xs text-purple-300">
                <AlertCircle className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">FUSION ALTAR ACTIVE:</p>
                  <p>
                    {!fuseCardId1 
                      ? 'Select the first copy (Base card) from the collection below.' 
                      : 'Select the second identical card of the same level and tier to fuse it with the first.'}
                  </p>
                  <button
                    onClick={() => {
                      setIsFusingMode(false);
                      setFuseCardId1(null);
                      setFuseCardId2(null);
                    }}
                    className="text-[#66fcf1] underline text-[10px] font-mono mt-1 font-bold tracking-wide uppercase cursor-pointer"
                  >
                    Cancel and exit Altar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[350px] overflow-y-auto pr-1">
                {(fuseCardId1
                  ? profile.collection.filter(c => {
                      const card1 = profile.collection.find(x => x.id === fuseCardId1);
                      if (!card1) return false;
                      return c.baseId === card1.baseId && c.id !== fuseCardId1 && c.level === card1.level && c.tier === card1.tier;
                    })
                  : filteredCollection.filter(card => {
                      if (card.level === 5 && card.tier === 'legendary') return false;
                      const hasDuplicate = profile.collection.some(c => 
                        c.id !== card.id && 
                        c.baseId === card.baseId && 
                        c.level === card.level && 
                        c.tier === card.tier
                      );
                      return hasDuplicate;
                    })
                ).map(card => {
                  const isSelected = fuseCardId1 === card.id || fuseCardId2 === card.id;
                  return (
                    <div
                      key={card.id}
                      onClick={() => handleCardClickInFusion(card.id)}
                      className={`relative aspect-[3/4.2] rounded-xl p-2 flex flex-col justify-between cursor-pointer border overflow-hidden group transform-gpu ${getCardTierStyles(card.tier, isSelected, true)}`}
                    >
                      {/* Mana Badge */}
                      <div className="absolute top-1.5 right-1.5 z-10">
                        {renderManaIcon(getCardManaCost(card), "w-[16px] h-[16px]")}
                      </div>

                      <img 
                        src={getCardImageUrl(card)} 
                        alt={card.name} 
                        className="absolute inset-0 w-full h-full object-cover z-0 opacity-85 group-hover:scale-105 transition-transform duration-200" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20 z-0 pointer-events-none" />
                      
                      <div className="text-center mt-2 relative z-10 drop-shadow-md">
                        <span className="text-[9px] font-display font-bold text-white block truncate leading-none">{card.name}</span>
                        <span className="text-[7px] text-purple-400 uppercase font-mono tracking-wider">{card.tier}</span>
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-mono font-bold pt-1.5 border-t border-white/10">
                        <span className="text-red-400">⚔️{card.attack}</span>
                        <span className="text-blue-400" title="Turn Delay">⏳{card.delay}</span>
                        <span className="text-emerald-400">❤️{card.health}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {fuseCardId1 && profile.collection.filter(c => {
                const card1 = profile.collection.find(x => x.id === fuseCardId1);
                if (!card1) return false;
                return c.baseId === card1.baseId && c.id !== fuseCardId1 && c.level === card1.level && c.tier === card1.tier;
              }).length === 0 && (
                <div className="text-center py-6 text-gray-500 text-xs">
                  😭 You do not have other identical cards of the same level (L{profile.collection.find(x => x.id === fuseCardId1)?.level}) and tier for fusion.
                  <p className="mt-1">You need a copy of this creature with identical stats!</p>
                </div>
              )}
            </div>
          ) : (
            /* Normal grid mode */
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[350px] overflow-y-auto pr-1">
              {filteredCollection.map(card => {
                const isSelected = selectedCardId === card.id;
                const isInDeck = (profile?.deck || []).includes(card.id);
                
                return (
                  <div
                    key={card.id}
                    onClick={() => setSelectedCardId(card.id)}
                    className={`relative aspect-[3/4.2] rounded-xl p-2 flex flex-col justify-between cursor-pointer overflow-hidden group border ${getCardTierStyles(card.tier, isSelected, true)}`}
                  >
                    <img 
                      src={getCardImageUrl(card)} 
                      alt={card.name} 
                      className="absolute inset-0 w-full h-full object-cover z-0 opacity-85 group-hover:scale-105 transition-transform duration-200" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10 z-0 pointer-events-none" />

                    {/* Level & Mana Badges */}
                    <div className="absolute top-1.5 right-1.5 z-10 bg-black/70 border border-[#c5a880]/30 rounded-full w-[18px] h-[18px] flex items-center justify-center text-[8px] font-mono font-bold text-[#ebd09b]">
                      L{card.level}
                    </div>
                    <div className="absolute top-1.5 right-[26px] z-10">
                      {renderManaIcon(getCardManaCost(card), "w-[18px] h-[18px]")}
                    </div>

                    {/* Quick add/remove toggle button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleDeck(card.id);
                      }}
                      className={`absolute top-1.5 left-1.5 z-20 rounded-full w-[18px] h-[18px] flex items-center justify-center border shadow-md transition-all hover:scale-110 active:scale-95 cursor-pointer ${
                        isInDeck
                          ? 'bg-[#4e0707] hover:bg-[#880d1e] border-[#dd2c40]/60 text-white'
                          : 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-500/60 text-emerald-400'
                      }`}
                      title={isInDeck ? "Remove from deck" : "Add to deck"}
                    >
                      {isInDeck ? (
                        <Minus className="w-2.5 h-2.5" />
                      ) : (
                        <Plus className="w-2.5 h-2.5" />
                      )}
                    </button>

                    <div className="text-center mt-4 relative z-10">
                      {!card.image.startsWith('/cards/') && (
                        <div className="flex justify-center mb-1">
                          {renderCardIcon(card.image, `w-4 h-4 ${getCardIconColor(card.color)} opacity-60`)}
                        </div>
                      )}
                      <span className="text-[10px] font-display font-bold text-white block truncate leading-none text-shadow-gold drop-shadow-md">
                        {card.name}
                      </span>
                      <span className="text-[7px] text-[#ebd09b] uppercase font-mono tracking-wider drop-shadow-md">{card.tier}</span>
                    </div>

                    <div className="relative z-10 mt-auto">
                      {/* Card Skills Indicator */}
                      <div className="flex justify-center gap-1 my-1">
                        {card.skills.map((s, idx) => (
                          <div 
                            key={idx} 
                            className={`w-1.5 h-1.5 rounded-full border border-black shadow-sm ${
                              s.type === 'hex' ? 'bg-purple-500' :
                              s.type === 'vampirism' ? 'bg-red-500' :
                              s.type === 'plague' ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            title={s.description}
                          />
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="flex justify-between items-center text-[9px] font-mono font-bold pt-1 border-t border-white/10/80 bg-black/50 backdrop-blur-sm rounded px-1 -mx-1">
                        <span className="text-red-400">⚔️{card.attack}</span>
                        <span className="text-blue-400" title="Turn Delay">⏳{card.delay}</span>
                        <span className="text-emerald-400">❤️{card.health}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Ritual Lab / Details (5 Cols) */}
      <div className="lg:col-span-5">
        <div className={`bg-[#151a21] border border-[#c5a880]/30 rounded-2xl p-6 shadow-2xl ${isFusingMode ? 'h-full flex flex-col justify-between' : 'h-fit'}`}>
          
          {isFusingMode ? (
            /* RITUAL FUSION LAB UI */
            <div className="space-y-6 flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="text-center border-b border-purple-500/20 pb-3">
                  <span className="text-xs font-mono text-purple-400 font-bold tracking-widest uppercase">DARK FUSION ALTAR</span>
                  <h3 className="font-display font-black text-xl text-white tracking-wide mt-1 text-shadow-gold">FUSION RITUAL</h3>
                </div>

                <div className="flex items-center justify-around bg-[#0b0c10]/60 border border-purple-500/25 rounded-2xl p-5 shadow-inner">
                  {/* Card 1 */}
                  <div className="text-center">
                    {renderAltarCardSlot(fuseCardId1, "Base Card", () => {
                      setFuseCardId1(null);
                      setFuseCardId2(null);
                    })}
                    <span className="text-[10px] font-mono text-gray-500 mt-2 block uppercase tracking-wider font-bold">Base</span>
                  </div>

                  <ArrowRight className="w-5 h-5 text-purple-400 animate-pulse shrink-0" />

                  {/* Card 2 */}
                  <div className="text-center">
                    {renderAltarCardSlot(fuseCardId2, "Sacrifice", () => {
                      setFuseCardId2(null);
                    })}
                    <span className="text-[10px] font-mono text-gray-500 mt-2 block uppercase tracking-wider font-bold">Sacrifice</span>
                  </div>
                </div>

                {/* Ritual requirements & preview */}
                <div className="bg-black/35 rounded-xl p-4 border border-purple-950 text-xs space-y-3 font-mono">
                  <h4 className="text-[#c5a880] font-display font-semibold text-center text-xs">FUSION RESULT</h4>
                  
                  {fuseCardId1 ? (() => {
                    const c1 = profile.collection.find(c => c.id === fuseCardId1)!;
                    const isLevelUpgrade = c1.level < 5;

                    if (isLevelUpgrade) {
                      const nextL = c1.level + 1;
                      const nextAttack = Math.round(c1.attack * 1.15);
                      const nextHealth = Math.round(c1.health * 1.15);
                      return (
                        <ul className="space-y-1.5 text-gray-300">
                          <li className="flex justify-between">
                            <span>Fusion type:</span>
                            <span className="text-amber-500 font-bold">LEVEL UP</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Level:</span>
                            <span className="text-white font-bold">L{c1.level} ➔ L{nextL}</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Tier:</span>
                            <span className="text-gray-400 font-bold uppercase">{c1.tier}</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Attack:</span>
                            <span className="text-red-400 font-bold">⚔️ {c1.attack} ➔ {nextAttack} (+15%)</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Health:</span>
                            <span className="text-emerald-400 font-bold">❤️ {c1.health} ➔ {nextHealth} (+15%)</span>
                          </li>
                          <li className="text-[10px] text-amber-300 border-t border-purple-950/50 pt-1.5 mt-1">
                            <img src="/icons/icon_energy.webp" alt="Energy" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" /> <span className="font-sans">Enhances the creature's base stats and skills!</span>
                          </li>
                        </ul>
                      );
                    } else {
                      let nextT = 'silver';
                      if (c1.tier === 'bronze') nextT = 'silver';
                      else if (c1.tier === 'silver') nextT = 'gold';
                      else if (c1.tier === 'gold') nextT = 'legendary';

                      const nextAttack = Math.round(c1.attack * 1.15);
                      const nextHealth = Math.round(c1.health * 1.15);
                      const nextDelay = Math.max(1, c1.delay - 1);

                      return (
                        <ul className="space-y-1.5 text-gray-300">
                          <li className="flex justify-between">
                            <span>Fusion type:</span>
                            <span className="text-purple-400 font-bold">TIER ASCENSION</span>
                          </li>
                          <li className="flex justify-between">
                            <span>New Tier:</span>
                            <span className="text-purple-400 font-bold uppercase">{nextT} (L1)</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Attack:</span>
                            <span className="text-red-400 font-bold">⚔️ {nextAttack} (+15% dmg!)</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Health:</span>
                            <span className="text-emerald-400 font-bold">❤️ {nextHealth}</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Turn Delay:</span>
                            <span className="text-blue-400 font-bold">⏳ {nextDelay} turns (Reduced!)</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Dark Shards:</span>
                            <span className="text-purple-300 font-bold font-mono">💎 {getFusionCosts(c1).shardsCost} Shards</span>
                          </li>
                          <li className="text-[10px] text-purple-300 border-t border-purple-950 pt-1.5 mt-1">
                            <img src="/icons/icon_dust.webp" alt="Dust" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" /> <span className="font-sans">Unlocks new improved skills of tier {nextT}!</span>
                          </li>
                        </ul>
                      );
                    }
                  })() : (
                    <div className="text-center py-6 text-gray-500 text-xs italic">
                      Select first card to see preview...
                    </div>
                  )}
                </div>

                {/* Costs */}
                {fuseCardId1 ? (() => {
                  const c1 = profile.collection.find(c => c.id === fuseCardId1)!;
                  const { goldCost, dustCost, shardsCost } = getFusionCosts(c1);
                  
                  if (shardsCost > 0) {
                    return (
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-black/45 border border-purple-950 p-2 rounded-lg">
                          <span className="text-[9px] text-gray-500 block font-mono">Gold</span>
                          <span className={`font-mono text-xs font-bold ${profile.gold >= goldCost ? 'text-amber-500' : 'text-red-500'}`}>
                            {goldCost} / {profile.gold}<img src="/icons/icon_gold.webp" alt="Gold" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-5 h-5 inline-block align-text-bottom ml-1" />
                          </span>
                        </div>
                        <div className="bg-black/45 border border-purple-950 p-2 rounded-lg">
                          <span className="text-[9px] text-gray-500 block font-mono">Dust</span>
                          <span className={`font-mono text-xs font-bold ${profile.dust >= dustCost ? 'text-[#66fcf1]' : 'text-red-500'}`}>
                            {dustCost} / {profile.dust}<img src="/icons/icon_dust.webp" alt="Dust" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-5 h-5 inline-block align-text-bottom ml-1" />
                          </span>
                        </div>
                        <div className="bg-black/45 border border-purple-950 p-2 rounded-lg">
                          <span className="text-[9px] text-gray-500 block font-mono">Shards</span>
                          <span className={`font-mono text-xs font-bold ${(profile.darkShards || 0) >= shardsCost ? 'text-purple-400' : 'text-red-500'}`}>
                            {shardsCost} / {profile.darkShards || 0}<img src="/icons/icon_shards.webp" alt="Shards" className="drop-shadow-[0_0_12px_rgba(168,85,247,0.6)] brightness-110 contrast-125 w-5 h-5 inline-block align-text-bottom ml-1" />
                          </span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="bg-black/45 border border-purple-950 p-2 rounded-lg">
                        <span className="text-[10px] text-gray-500 block font-mono">Gold Required</span>
                        <span className={`font-mono text-xs font-bold ${profile.gold >= goldCost ? 'text-amber-500' : 'text-red-500'}`}>
                          {goldCost} / {profile.gold}<img src="/icons/icon_gold.webp" alt="Gold" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" />
                        </span>
                      </div>
                      <div className="bg-black/45 border border-purple-950 p-2 rounded-lg">
                        <span className="text-[10px] text-gray-500 block font-mono">Dust Required</span>
                        <span className={`font-mono text-xs font-bold ${profile.dust >= dustCost ? 'text-[#66fcf1]' : 'text-red-500'}`}>
                          {dustCost} / {profile.dust}<img src="/icons/icon_dust.webp" alt="Dust" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" />
                        </span>
                      </div>
                    </div>
                  );
                })() : (
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-black/45 border border-purple-950 p-2 rounded-lg">
                      <span className="text-[10px] text-gray-500 block font-mono">Gold Required</span>
                      <span className="font-mono text-xs font-bold text-amber-500">-</span>
                    </div>
                    <div className="bg-black/45 border border-purple-950 p-2 rounded-lg">
                      <span className="text-[10px] text-gray-500 block font-mono">Dust Required</span>
                      <span className="font-mono text-xs font-bold text-[#66fcf1]">-</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2 mt-4">
                <button
                  onClick={executeFusionRitual}
                  disabled={(() => {
                    if (!fuseCardId1 || !fuseCardId2) return true;
                    const c1 = profile.collection.find(c => c.id === fuseCardId1);
                    if (!c1) return true;
                    const { goldCost, dustCost, shardsCost } = getFusionCosts(c1);
                    return profile.gold < goldCost || profile.dust < dustCost || (shardsCost > 0 && (profile.darkShards || 0) < shardsCost);
                  })()}
                  className="w-full bg-gradient-to-r from-purple-900 to-[#4e0707] hover:from-purple-600 hover:to-red-700 disabled:opacity-40 disabled:cursor-not-allowed border border-purple-500/50 text-white font-display font-black tracking-widest py-3 px-4 rounded-xl transition-all shadow-lg text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <FusionAltarEmblem className="w-4 h-4 shrink-0 animate-pulse" />
                  <span>PERFORM FUSION RITUAL</span>
                </button>
                <button
                  onClick={() => setIsFusingMode(false)}
                  className="w-full bg-[#0b0c10] hover:bg-gray-800 border border-gray-700/30 text-gray-400 font-mono text-xs py-2 rounded-lg transition-all"
                >
                  Return to Laboratory
                </button>
              </div>
            </div>
          ) : selectedCard ? (
            /* NORMAL CARD DETAIL / STATS UPGRADE UI */
            <div className="space-y-4">
                <div className="text-center border-b border-white/10 pb-2">
                  <span className="text-xs font-mono font-bold text-[#c5a880] uppercase tracking-widest">Level {selectedCard.level} / 5</span>
                </div>

                {/* High Fidelity Visual Card Illustration Representation */}
                <div className="aspect-[3/4.2] w-full max-w-[240px] mx-auto bg-[#0b0c10] border border-[#c5a880]/30 rounded-2xl p-4 flex flex-col justify-between relative shadow-inner overflow-hidden group">
                  {/* Card Background Image */}
                  <div className={`absolute inset-0 opacity-10 bg-gradient-to-br z-0`} />
                  <img 
                    src={getCardImageUrl(selectedCard)} 
                    alt={selectedCard.name} 
                    decoding="async" 
                    className="absolute inset-0 w-full h-full object-cover z-0 opacity-90 transition-transform duration-500 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10 z-0 pointer-events-none" />

                  {/* Top: Tier & Mana/Level Badges */}
                  <div className="relative z-10 flex justify-between items-start">
                    <span className={getTierBadgeStyles(selectedCard.tier)}>{selectedCard.tier}</span>
                    <div className="flex items-center gap-1.5">
                      {renderManaIcon(getCardManaCost(selectedCard), "w-6 h-6")}
                      <div className="bg-black/80 border border-[#c5a880]/50 rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-mono font-black text-[#ebd09b] shadow">
                        L{selectedCard.level}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1" />

                  {/* Bottom: Name & Stats */}
                  <div className="relative z-10">
                    <h3 className="font-display font-black text-xl text-white tracking-widest text-shadow-gold mb-2 text-center drop-shadow-md">{selectedCard.name}</h3>
                    <div className="grid grid-cols-3 gap-1 font-mono text-[10px] font-bold text-center border-t border-white/10/60 pt-2 bg-black/40 backdrop-blur-sm rounded-lg p-1.5">
                      <div className="bg-red-950/40 p-1 rounded">
                        <span className="text-red-400 block text-[8px] opacity-80">ATK</span>
                        <span className="text-red-400 text-sm">⚔️{selectedCard.attack}</span>
                      </div>
                      <div className="bg-emerald-950/40 p-1 rounded">
                        <span className="text-emerald-400 block text-[8px] opacity-80">HP</span>
                        <span className="text-emerald-400 text-sm">❤️{selectedCard.health}</span>
                      </div>
                      <div className="bg-blue-950/40 p-1 rounded">
                        <span className="text-blue-400 block text-[8px] opacity-80">DELAY</span>
                        <span className="text-blue-400 text-sm">⏳{selectedCard.delay}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills descriptions */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block font-bold">Dark Skills</span>
                  <div className="space-y-1.5">
                    {selectedCard.skills.length > 0 ? (
                      selectedCard.skills.map((skill, idx) => (
                        <div key={idx} className="bg-black/30 border border-white/10/40 p-2.5 rounded-lg text-xs">
                          <span className="font-display font-semibold text-[#ebd09b] block uppercase">
                            {skill.type === 'hex' && <span className="flex items-center gap-1.5">{renderSkillIcon("hex", "w-5 h-5")} Hex</span>}
                            {skill.type === 'vampirism' && <span className="flex items-center gap-1.5">{renderSkillIcon("vampirism", "w-5 h-5")} Vampirism</span>}
                            {skill.type === 'plague' && <span className="flex items-center gap-1.5">{renderSkillIcon("plague", "w-5 h-5")} Plague</span>}
                            {skill.type === 'sacrifice' && <span className="flex items-center gap-1.5">{renderSkillIcon("sacrifice", "w-5 h-5")} Sacrifice</span>}
                          </span>
                          <p className="text-gray-400 font-sans mt-0.5 leading-relaxed text-[10px]">{skill.description}</p>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500 font-sans italic">This creature has no special skills. Fuse it to unlock hidden power!</span>
                    )}
                  </div>
                </div>

                {/* Lore description */}
                <p className="text-[11px] text-gray-400 italic font-sans leading-relaxed border-l-2 border-[#c5a880]/30 pl-3">
                  {CARD_TEMPLATES.find(t => t.baseId === selectedCard.baseId)?.description}
                </p>
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500 flex flex-col items-center justify-center">
              <Swords className="w-12 h-12 opacity-25" />
              <p className="font-display font-semibold mt-3 text-sm">Select a card from the Sanctuary</p>
              <p className="text-xs font-sans mt-1">to view its stats, apply hexes, or perform the fusion sacrament.</p>
            </div>
          )}
          
        </div>
      </div>

      </div>

      {/* Fusion Confirm Modal */}
      {fusionConfirmData && (() => {
        const c1 = fusionConfirmData.card1;
        const { goldCost, dustCost, shardsCost, isLevelUpgrade } = getFusionCosts(c1);
        return (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-[#151a21] border border-purple-500/50 rounded-2xl p-6 max-w-sm w-full shadow-[0_0_50px_rgba(168,85,247,0.15)] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent pointer-events-none" />
              
              <div className="text-center relative z-10">
                <Skull className="w-12 h-12 text-purple-400 mx-auto mb-4 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                <h2 className="text-xl font-display font-black text-white uppercase tracking-widest mb-2 text-shadow-gold">Confirm Ritual</h2>
                
                <p className="text-gray-300 font-sans text-sm mb-6 leading-relaxed">
                  {isLevelUpgrade 
                    ? `Fuse two copies of ${c1.name} L${c1.level} to create a powerful L${c1.level + 1} creature?`
                    : `Sacrifice both L5 ${c1.name} cards to evolve into a new higher tier entity?`
                  }
                </p>

                <div className="flex justify-center gap-4 mb-6 bg-black/40 py-3 px-2 rounded-xl border border-white/5">
                  <div className="flex items-center gap-1.5">
                    <span className={`font-bold font-mono text-xs ${profile.gold >= goldCost ? 'text-amber-500' : 'text-red-500'}`}>{goldCost}</span>
                    <img src="/icons/icon_gold.webp" alt="Gold" className="w-5 h-5 drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`font-bold font-mono text-xs ${profile.dust >= dustCost ? 'text-[#66fcf1]' : 'text-red-500'}`}>{dustCost}</span>
                    <img src="/icons/icon_dust.webp" alt="Dust" className="w-5 h-5 drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125" />
                  </div>
                  {shardsCost > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className={`font-bold font-mono text-xs ${(profile.darkShards || 0) >= shardsCost ? 'text-purple-400' : 'text-red-500'}`}>{shardsCost}</span>
                      <img src="/icons/icon_shards.webp" alt="Shards" className="w-5 h-5 drop-shadow-[0_0_12px_rgba(168,85,247,0.6)] brightness-110 contrast-125" />
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setFusionConfirmData(null)} className="flex-1 bg-[#0b0c10] hover:bg-gray-800 border border-gray-700/50 text-gray-400 font-mono text-xs py-3 rounded-xl transition-all cursor-pointer">
                    CANCEL
                  </button>
                  <button onClick={confirmFusionRitual} className="flex-1 bg-gradient-to-r from-purple-900 to-[#4e0707] hover:from-purple-600 hover:to-red-700 border border-purple-500/50 text-white font-display font-black tracking-widest py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)] cursor-pointer active:scale-98">
                    CONFIRM
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
};
