import React, { useState } from 'react';
import { getCardTierStyles } from '../utils/tierStyles';
import { audioSystem } from '../utils/AudioSystem';
import { useGame } from '../context/GameContext';
import { useToast } from './Toast';
import { Card, CardTier } from '../types';
import { CARD_TEMPLATES } from '../data/cards';
import { Swords, Star, Plus, Minus, ArrowRight, Skull, Shield, Zap, Sparkles, AlertCircle, Crown, ShieldAlert, Bug, Flame } from 'lucide-react';

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
  
  // Filter/Sort
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'level' | 'attack' | 'health' | 'name'>('level');

  // Currently selected card object
  const selectedCard = profile.collection.find(c => c.id === selectedCardId) || null;

  // Filtered & sorted collection
  const filteredCollection = profile.collection
    .filter(card => {
      if (tierFilter === 'all') return true;
      return card.tier === tierFilter;
    })
    .sort((a, b) => {
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

  // Select card 2 for fusion
  const selectFuseCard2 = (cardId: string) => {
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
  };

  // Execute fusion
  const executeFusionRitual = () => {
    if (!fuseCardId1 || !fuseCardId2) return;
    
    const card1 = profile.collection.find(c => c.id === fuseCardId1);
    const card2 = profile.collection.find(c => c.id === fuseCardId2);
    if (!card1 || !card2) return;

    const isLevelUpgrade = card1.level < 5;
    const goldCost = isLevelUpgrade ? card1.level * 150 : 500;
    const dustCost = isLevelUpgrade ? card1.level * 20 : 100;

    const confirmMsg = isLevelUpgrade
      ? `Are you sure you want to fuse two copies of ${card1.name} L${card1.level} to create an L${card1.level + 1} card for ${goldCost}<img src="/icons/icon_gold.png" alt="Gold" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" /> and ${dustCost}<img src="/icons/icon_dust.png" alt="Dust" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" />?`
      : `Are you sure you want to sacrifice both L5 ${card1.name} cards to create a new higher tier card for ${goldCost}<img src="/icons/icon_gold.png" alt="Gold" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" /> and ${dustCost}<img src="/icons/icon_dust.png" alt="Dust" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" />?`;

    if (window.confirm(confirmMsg)) {
      const res = fuseCards(fuseCardId1, fuseCardId2);
      if (res.success) {
        audioSystem.playMagic();
        setIsFusingMode(false);
        setFuseCardId1(null);
        setFuseCardId2(null);
        if (res.newCard) {
          setSelectedCardId(res.newCard.id);
        }
        toast(isLevelUpgrade 
          ? `Fusion complete! Your card ${card1.name} leveled up to L${card1.level + 1}!` 
          : 'Dark Fusion Ritual complete! Your card has been reborn in a new tier with a reduced attack timer!'
        , 'success');
      } else {
        toast(`Ritual error: ${res.message}`, 'warning');
      }
    }
  };

  // Get color styles based on tier
  const getTierBadgeStyles = (tier: CardTier) => {
    switch (tier) {
      case 'bronze': return 'bg-amber-900/40 text-amber-500 border-amber-900/50';
      case 'silver': return 'bg-slate-700/40 text-slate-300 border-slate-700/50';
      case 'gold': return 'bg-[#c5a880]/20 text-[#ebd09b] border-[#c5a880]/30';
      case 'legendary': return 'bg-purple-950/40 text-purple-400 border-purple-500/30 gothic-glow-purple animate-pulse';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* LEFT PANEL: Collection & Deck (7 Cols) */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Active Combat Deck banner */}
        <div className="bg-[#151a21] border border-[#c5a880]/25 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-black text-white text-base tracking-widest text-shadow-gold flex items-center gap-2">
                ⚔️ COMBAT DECK ({profile.deck.length}/5)
              </h3>
              <p className="text-[10px] text-gray-400 font-sans mt-0.5">Cards that will fight in the campaign and arena.</p>
            </div>
            {profile.deck.length < 5 && (
              <span className="text-[10px] bg-[#4e0707] text-[#dd2c40] font-mono font-bold py-1 px-2.5 rounded-full border border-[#dd2c40]/30 animate-pulse">
                NOT ENOUGH CARDS! ADD UP TO 5
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-5 gap-2.5">
            {Array.from({ length: 5 }).map((_, idx) => {
              const cardId = profile.deck[idx];
              const card = cardId ? profile.collection.find(c => c.id === cardId) : null;
              
              if (card) {
                return (
                  <div
                    key={card.id}
                    onClick={() => {
                      setSelectedCardId(card.id);
                      setIsFusingMode(false);
                    }}
                    className={`relative aspect-[3/4.2] rounded-xl p-2 flex flex-col justify-between cursor-pointer overflow-hidden group border ${getCardTierStyles(card.tier, selectedCardId === card.id, true)}`}
                  >
                    {card.image.startsWith('/cards/') && (
                      <>
                        <img src={card.image} alt={card.name} className="absolute inset-0 w-full h-full object-cover z-0 opacity-60 group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20 z-0 pointer-events-none" />
                      </>
                    )}

                    {/* Level badge */}
                    <div className="absolute top-1 right-1 z-10 bg-black/60 border border-[#c5a880]/40 rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-mono font-bold text-[#ebd09b]">
                      L{card.level}
                    </div>

                    <div className="text-center mt-2 relative z-10">
                      <span className="text-[9px] font-display font-bold text-white block truncate leading-none text-shadow-gold">
                        {card.name}
                      </span>
                      <span className="text-[7px] text-[#ebd09b] uppercase font-mono tracking-wider drop-shadow-md">{card.tier}</span>
                    </div>

                    {/* Stats */}
                    <div className="relative z-10 flex justify-between items-center text-[9px] font-mono font-bold pt-1.5 border-t border-white/10 mt-auto">
                      <span className="text-red-400 drop-shadow-md">⚔️{card.attack}</span>
                      <span className="text-emerald-400 drop-shadow-md">❤️{card.health}</span>
                      <span className="text-blue-400 drop-shadow-md" title="Turn Delay">⏳{card.delay}</span>
                    </div>

                    {/* Quick remove */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleDeck(card.id);
                      }}
                      className="absolute -bottom-1 -right-1 bg-[#4e0707] hover:bg-[#880d1e] border border-[#dd2c40]/50 rounded-full w-4 h-4 flex items-center justify-center text-white"
                      title="Remove from deck"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                  </div>
                );
              } else {
                return (
                  <div
                    key={idx}
                    className="aspect-[3/4.2] rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center text-gray-600 bg-black/10"
                  >
                    <Swords className="w-5 h-5 opacity-35" />
                    <span className="text-[8px] font-mono mt-1">EMPTY</span>
                  </div>
                );
              }
            })}
          </div>
        </div>

        {/* Collection Section */}
        <div className="bg-[#151a21] border border-[#c5a880]/25 rounded-2xl p-5 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-white/10">
            <div>
              <h3 className="font-display font-black text-white text-base tracking-widest text-shadow-gold">
                💀 CREATURE SANCTUARY ({profile.collection.length})
              </h3>
              <p className="text-[10px] text-gray-400 font-sans">All your dark entities are stored here.</p>
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
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
                  <p className="font-semibold">FUSION MODE:</p>
                  <p>Select a second identical card of the same level and tier to fuse it with the first.</p>
                  <button
                    onClick={() => setIsFusingMode(false)}
                    className="text-[#66fcf1] underline text-[10px] font-mono mt-1 font-bold tracking-wide uppercase"
                  >
                    Cancel fusion
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[350px] overflow-y-auto pr-1">
                {profile.collection
                  .filter(c => {
                    const card1 = profile.collection.find(x => x.id === fuseCardId1);
                    if (!card1) return false;
                    return c.baseId === card1.baseId && c.id !== fuseCardId1 && c.level === card1.level && c.tier === card1.tier;
                  })
                  .map(card => {
                    const isSelected = fuseCardId2 === card.id;
                    return (
                      <div
                        key={card.id}
                        onClick={() => selectFuseCard2(card.id)}
                        className={`relative aspect-[3/4.2] rounded-xl p-2 flex flex-col justify-between cursor-pointer border ${getCardTierStyles(card.tier, isSelected, true)}`}
                      >
                        <div className="absolute top-1 right-1 bg-black/70 border border-purple-500/30 rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-mono font-bold text-purple-400">
                          L{card.level}
                        </div>
                        <div className="text-center mt-2">
                          <span className="text-[9px] font-display font-bold text-white block truncate leading-none">{card.name}</span>
                          <span className="text-[7px] text-purple-400 uppercase font-mono tracking-wider">{card.tier}</span>
                        </div>
                        <div className="flex justify-between items-center text-[9px] font-mono font-bold pt-1.5 border-t border-white/10">
                          <span className="text-red-400">⚔️{card.attack}</span>
                          <span className="text-emerald-400">❤️{card.health}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
              
              {profile.collection.filter(c => {
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
                const isInDeck = profile.deck.includes(card.id);
                
                return (
                  <div
                    key={card.id}
                    onClick={() => setSelectedCardId(card.id)}
                    className={`relative aspect-[3/4.2] rounded-xl p-2 flex flex-col justify-between cursor-pointer overflow-hidden group border ${getCardTierStyles(card.tier, isSelected, true)}`}
                  >
                    {card.image.startsWith('/cards/') ? (
                      <>
                        <img src={card.image} alt={card.name} className="absolute inset-0 w-full h-full object-cover z-0 opacity-80 group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10 z-0 pointer-events-none" />
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-[#0b0c10] z-0" />
                    )}

                    {/* Level Badge */}
                    <div className="absolute top-1.5 right-1.5 z-10 bg-black/70 border border-[#c5a880]/30 rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-mono font-bold text-[#ebd09b]">
                      L{card.level}
                    </div>

                    {/* Deck indicator icon */}
                    {isInDeck && (
                      <div className="absolute top-1.5 left-1.5 z-10 bg-[#880d1e] text-white rounded-full p-0.5 shadow-md border border-[#dd2c40]/30" title="In deck">
                        <Swords className="w-2.5 h-2.5" />
                      </div>
                    )}

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
        <div className="bg-[#151a21] border border-[#c5a880]/30 rounded-2xl p-6 shadow-2xl h-full flex flex-col justify-between">
          
          {isFusingMode ? (
            /* RITUAL FUSION LAB UI */
            <div className="space-y-6 flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="text-center border-b border-purple-500/20 pb-3">
                  <span className="text-xs font-mono text-purple-400 font-bold tracking-widest uppercase">DARK FUSION ALTAR</span>
                  <h3 className="font-display font-black text-xl text-white tracking-wide mt-1 text-shadow-gold">FUSION RITUAL</h3>
                </div>

                <div className="flex items-center justify-around bg-[#0b0c10] border border-purple-500/20 rounded-xl p-4">
                  {/* Card 1 */}
                  <div className="text-center">
                    <div className="w-16 h-20 bg-purple-950/20 border border-purple-500/50 rounded-lg flex flex-col justify-center items-center text-xs text-white">
                      <span className="font-display font-bold text-[10px] block truncate max-w-[55px]">
                        {profile.collection.find(c => c.id === fuseCardId1)?.name}
                      </span>
                      <span className="text-[8px] text-purple-400 font-mono mt-1 font-bold">
                        L{profile.collection.find(c => c.id === fuseCardId1)?.level}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1 block">Base</span>
                  </div>

                  <ArrowRight className="w-5 h-5 text-purple-400 animate-pulse" />

                  {/* Card 2 */}
                  <div className="text-center">
                    {fuseCardId2 ? (
                      <div className="w-16 h-20 bg-purple-950/20 border border-purple-500/50 rounded-lg flex flex-col justify-center items-center text-xs text-white relative">
                        <span className="font-display font-bold text-[10px] block truncate max-w-[55px]">
                          {profile.collection.find(c => c.id === fuseCardId2)?.name}
                        </span>
                        <span className="text-[8px] text-purple-400 font-mono mt-1 font-bold">
                          L{profile.collection.find(c => c.id === fuseCardId2)?.level}
                        </span>
                        <button
                          onClick={() => setFuseCardId2(null)}
                          className="absolute -top-1 -right-1 bg-black text-red-500 rounded-full w-3.5 h-3.5 flex items-center justify-center text-[8px]"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-20 border border-dashed border-purple-900/40 rounded-lg flex flex-col justify-center items-center text-[10px] text-purple-900 bg-black/10">
                        <span>Second copy</span>
                      </div>
                    )}
                    <span className="text-[10px] text-gray-500 mt-1 block">Sacrifice</span>
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
                            <img src="/icons/icon_energy.png" alt="Energy" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" /> <span className="font-sans">Enhances the creature's base stats and skills!</span>
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
                          <li className="text-[10px] text-purple-300 border-t border-purple-950 pt-1.5 mt-1">
                            <img src="/icons/icon_dust.png" alt="Dust" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" /> <span className="font-sans">Unlocks new improved skills of tier {nextT}!</span>
                          </li>
                        </ul>
                      );
                    }
                  })() : null}
                </div>

                {/* Costs */}
                {fuseCardId1 ? (() => {
                  const c1 = profile.collection.find(c => c.id === fuseCardId1)!;
                  const isLevelUpgrade = c1.level < 5;
                  const goldCost = isLevelUpgrade ? c1.level * 150 : 500;
                  const dustCost = isLevelUpgrade ? c1.level * 20 : 100;
                  
                  return (
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="bg-black/45 border border-purple-950 p-2 rounded-lg">
                        <span className="text-[10px] text-gray-500 block font-mono">Gold Required</span>
                        <span className={`font-mono text-xs font-bold ${profile.gold >= goldCost ? 'text-amber-500' : 'text-red-500'}`}>
                          {goldCost} / {profile.gold}<img src="/icons/icon_gold.png" alt="Gold" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" />
                        </span>
                      </div>
                      <div className="bg-black/45 border border-purple-950 p-2 rounded-lg">
                        <span className="text-[10px] text-gray-500 block font-mono">Dust Required</span>
                        <span className={`font-mono text-xs font-bold ${profile.dust >= dustCost ? 'text-[#66fcf1]' : 'text-red-500'}`}>
                          {dustCost} / {profile.dust}<img src="/icons/icon_dust.png" alt="Dust" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" />
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
                    const isLevelUpgrade = c1.level < 5;
                    const goldCost = isLevelUpgrade ? c1.level * 150 : 500;
                    const dustCost = isLevelUpgrade ? c1.level * 20 : 100;
                    return profile.gold < goldCost || profile.dust < dustCost;
                  })()}
                  className="w-full bg-gradient-to-r from-purple-900 to-[#4e0707] hover:from-purple-600 hover:to-red-700 disabled:opacity-40 disabled:cursor-not-allowed border border-purple-500/50 text-white font-display font-black tracking-widest py-3 px-4 rounded-xl transition-all shadow-lg text-xs"
                >
                  🕯️ PERFORM FUSION RITUAL
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
            <div className="space-y-5 flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="text-center border-b border-white/10 pb-3">
                  <div className="inline-block px-3 py-1 rounded-full text-[9px] font-mono font-bold uppercase border mb-1.5 shadow-sm bg-black/40 border-white/10">
                    <span className={getTierBadgeStyles(selectedCard.tier)}>{selectedCard.tier}</span>
                  </div>
                  <h3 className="font-display font-black text-xl text-white tracking-widest text-shadow-gold">{selectedCard.name}</h3>
                  <span className="text-[10px] font-mono text-[#c5a880]">Level {selectedCard.level} / 5</span>
                </div>

                {/* High Fidelity Visual Card Illustration Representation */}
                <div className="aspect-[3/4.2] w-full max-w-[240px] mx-auto bg-[#0b0c10] border border-[#c5a880]/30 rounded-2xl p-4 flex flex-col justify-between relative shadow-inner overflow-hidden group">
                  {/* Card Background Image */}
                  <div className={`absolute inset-0 opacity-10 bg-gradient-to-br z-0`} />
                  {selectedCard.image.startsWith('/cards/') && (
                    <>
                      <img src={selectedCard.image} alt={selectedCard.name} className="absolute inset-0 w-full h-full object-cover z-0 opacity-90 transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10 z-0 pointer-events-none" />
                    </>
                  )}

                  {/* Top: Tier & Level */}
                  <div className="relative z-10 flex justify-between items-start">
                    <span className={getTierBadgeStyles(selectedCard.tier)}>{selectedCard.tier}</span>
                    <div className="bg-black/70 border border-[#c5a880]/40 rounded-full px-2 py-0.5 text-[9px] font-mono font-bold text-[#ebd09b] shadow">
                      L{selectedCard.level}
                    </div>
                  </div>

                  {/* Middle: Icon fallback if no image */}
                  {!selectedCard.image.startsWith('/cards/') && (
                    <div className="flex-1 flex items-center justify-center relative z-10">
                      <div className="w-16 h-16 rounded-full bg-[#151a21]/80 border border-white/10 flex items-center justify-center text-shadow-gold backdrop-blur-sm">
                        {renderCardIcon(selectedCard.image, `w-8 h-8 ${getCardIconColor(selectedCard.color)} animate-pulse`)}
                      </div>
                    </div>
                  )}
                  {selectedCard.image.startsWith('/cards/') && <div className="flex-1" />}

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
                            {skill.type === 'hex' && '<img src="/icons/icon_dust.png" alt="Dust" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" /> Hex'}
                            {skill.type === 'vampirism' && '🩸 Vampirism'}
                            {skill.type === 'plague' && '🤢 Plague'}
                            {skill.type === 'sacrifice' && '💀 Sacrifice'}
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

              {/* Interaction Buttons (Fusion / Level Up, Add to Deck) */}
              <div className="space-y-3 mt-6 border-t border-white/10/40 pt-4">
                
                {selectedCard.level === 5 && selectedCard.tier === 'legendary' ? (
                  <div className="bg-purple-950/20 border border-purple-500/30 rounded-xl p-3 text-center">
                    <p className="text-xs font-bold text-purple-400">🔥 ABSOLUTE POWER!</p>
                    <p className="text-[10px] text-gray-400 font-sans mt-0.5">This legendary entity has reached the peak of its power.</p>
                  </div>
                ) : (() => {
                  const hasDuplicate = profile.collection.filter(c => c.baseId === selectedCard.baseId && c.level === selectedCard.level && c.tier === selectedCard.tier).length >= 2;
                  return (
                    <div className="bg-purple-950/20 border border-purple-500/30 rounded-xl p-3 text-center space-y-2">
                      <p className={`text-xs font-bold ${hasDuplicate ? 'text-purple-400' : 'text-gray-500'}`}>
                        {hasDuplicate ? '🧬 FUSION AVAILABLE!' : '🧬 REQUIRES DUPLICATE'}
                      </p>
                      <p className="text-[10px] text-gray-400 font-sans leading-relaxed text-left">
                        {selectedCard.level < 5 
                          ? `Fuse this card with another identical card of level L${selectedCard.level} tier ${selectedCard.tier} to reach level L${selectedCard.level + 1}!`
                          : `Fuse this card with another identical card of level L5 tier ${selectedCard.tier} to perform the Tier Ascension Ritual!`
                        }
                      </p>
                      <button
                        onClick={() => startFusing(selectedCard)}
                        className={`w-full text-xs font-mono font-bold py-2 px-4 rounded-xl tracking-wider transition-all cursor-pointer ${
                          hasDuplicate 
                            ? 'bg-[#151a21] hover:bg-[#1f2833] border border-purple-500/40 text-purple-200' 
                            : 'bg-black/50 border border-gray-800 text-gray-600 hover:text-gray-400'
                        }`}
                      >
                        🧬 OPEN FUSION ALTAR
                      </button>
                    </div>
                  );
                })()}

                {/* Add to / Remove from Deck Button */}
                <button
                  onClick={() => handleToggleDeck(selectedCard.id)}
                  className={`w-full font-display font-black tracking-widest py-2.5 px-4 rounded-xl transition-all text-xs border cursor-pointer ${
                    profile.deck.includes(selectedCard.id)
                      ? 'bg-gradient-to-r from-[#4e0707] to-black hover:from-[#dd2c40]/20 hover:to-[#4e0707] border-[#dd2c40]/30 text-[#dd2c40]'
                      : 'bg-gradient-to-r from-[#1f2833] to-[#151a21] hover:from-[#45a29e]/20 hover:to-[#1f2833] border-[#66fcf1]/30 text-[#66fcf1]'
                  }`}
                >
                  {profile.deck.includes(selectedCard.id) ? '⚔️ REMOVE FROM COMBAT DECK' : '⚔️ ADD TO COMBAT DECK'}
                </button>
              </div>
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
  );
};
