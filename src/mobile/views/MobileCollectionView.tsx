import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { getCardTierStyles } from '../../utils/tierStyles';
import { useGame } from '../../context/GameContext';
import { useToast } from '../../components/Toast';
import { Card, CardTier } from '../../types';
import { 
  CARD_TEMPLATES, 
  getCardManaCost, 
  getEvolutionBonusSkill, 
  getFusionCosts, 
  getMaxAllowedDeckCopies 
} from '../../data/cards';
import { 
  Swords, 
  Plus, 
  Minus, 
  ArrowRight, 
  Skull, 
  Sparkles, 
  AlertCircle, 
  AlertTriangle, 
  Crown, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Info, 
  Trash2, 
  Search, 
  ChevronDown, 
  ChevronUp,
  Flame,
  Bug,
  ShieldAlert
} from 'lucide-react';
import { getCardImageUrl } from '../../utils/assetPreloader';
import { 
  SanctuaryEmblem, 
  FusionAltarEmblem, 
  BaseCardSlotEmblem, 
  SacrificeSlotEmblem 
} from '../../components/CardsViewCustomIcons';

// --- HELPER RENDERERS ---

const renderManaIcon = (cost: number, sizeClass: string = "w-4 h-4") => {
  return (
    <div className={`relative ${sizeClass} shrink-0 flex items-center justify-center`}>
      <svg className="absolute inset-0 w-full h-full filter drop-shadow-[0_0_5px_rgba(6,182,212,0.85)]" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L4 7v10l8 5 8-5V7l-8-5z" fill="url(#manaCrystalGradMobile)" stroke="#66fcf1" strokeWidth="1.5" />
        <path d="M12 2L4 7l8 5 8-5-8-5z" fill="#66fcf1" opacity="0.35" />
        <path d="M4 7v10l8 5V12L4 7z" fill="#00d2ff" opacity="0.55" />
        <path d="M20 7v10l8 5V12L20 7z" fill="#005299" opacity="0.75" />
        <defs>
          <radialGradient id="manaCrystalGradMobile" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00f0ff" />
            <stop offset="100%" stopColor="#0033aa" />
          </radialGradient>
        </defs>
      </svg>
      <span className="relative text-white text-[9px] font-black font-mono leading-none z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
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

const getTierBadgeStyles = (tier: CardTier) => {
  const base = "px-2 py-0.5 rounded-lg border font-mono text-[8.5px] uppercase font-bold tracking-wider backdrop-blur-sm shadow-md";
  switch (tier) {
    case 'bronze': return `${base} bg-amber-950/70 text-amber-400 border-amber-800/60 shadow-[0_0_10px_rgba(245,158,11,0.2)]`;
    case 'silver': return `${base} bg-slate-900/80 text-slate-300 border-slate-600/60 shadow-[0_0_10px_rgba(148,163,184,0.2)]`;
    case 'gold': return `${base} bg-[#c5a880]/30 text-[#ebd09b] border-[#c5a880]/50 shadow-[0_0_10px_rgba(235,208,155,0.3)]`;
    case 'legendary': return `${base} bg-purple-950/70 text-purple-300 border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.4)] animate-pulse`;
    case 'divine': return `${base} bg-gradient-to-r from-rose-950 via-[#26050d] to-red-950 text-rose-300 border-rose-500 shadow-[0_0_16px_rgba(244,63,94,0.7)] ring-1 ring-rose-400/60 animate-pulse`;
    default: return `${base} bg-black/60 text-gray-400 border-gray-700`;
  }
};

const getDeckTierTextColor = (tier: string) => {
  switch (tier?.toLowerCase()) {
    case 'bronze': return 'text-amber-500 font-bold';
    case 'silver': return 'text-slate-300 font-bold';
    case 'gold': return 'text-yellow-400 font-bold';
    case 'legendary': return 'text-purple-400 font-bold';
    case 'divine': return 'text-rose-500 font-black drop-shadow-[0_0_6px_rgba(244,63,94,0.9)]';
    default: return 'text-gray-400';
  }
};

const getDismantleDustYield = (tier: CardTier): number => {
  switch (tier) {
    case 'bronze': return 100;
    case 'silver': return 200;
    case 'gold': return 500;
    case 'legendary': return 1000;
    default: return 0;
  }
};

// --- CARD ITEM COMPONENT ---

interface CollectionCardProps {
  card: Card;
  isSelected: boolean;
  isInDeck?: boolean;
  isFusionMode?: boolean;
  deckCopiesCount?: number;
  maxDeckCopies?: number;
  onSelect: (card: Card) => void;
  onToggleDeck?: (cardId: string) => void;
}

const MobileCardItem: React.FC<CollectionCardProps> = React.memo(({
  card,
  isSelected,
  isInDeck = false,
  isFusionMode = false,
  deckCopiesCount = 0,
  maxDeckCopies = 2,
  onSelect,
  onToggleDeck
}) => {
  const isLimitReached = !isInDeck && deckCopiesCount >= maxDeckCopies;

  return (
    <div
      onClick={() => onSelect(card)}
      className={`relative aspect-[3/4.2] rounded-xl p-1.5 sm:p-2 flex flex-col justify-between cursor-pointer overflow-hidden border select-none transition-all active:scale-[0.98] ${getCardTierStyles(card.tier, isSelected, true)}`}
    >
      {/* Background artwork */}
      <img 
        src={getCardImageUrl(card)} 
        alt={card.name} 
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-85" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10 z-0 pointer-events-none" />

      {/* Top Bar: Quick Add/Remove (Left) & Mana/Level (Right) */}
      <div className="relative z-10 flex items-center justify-between pointer-events-none">
        {/* Quick Toggle Button (Sanctuary mode only) */}
        {!isFusionMode && onToggleDeck ? (
          <div className="flex items-center gap-1 pointer-events-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleDeck(card.id);
              }}
              className={`rounded-full w-5 h-5 flex items-center justify-center border shadow-md transition-all active:scale-90 cursor-pointer ${
                isInDeck
                  ? 'bg-[#4e0707] hover:bg-[#880d1e] border-[#dd2c40]/70 text-white'
                  : isLimitReached
                  ? 'bg-[#2a1708]/95 border-amber-600/70 text-amber-400 opacity-90'
                  : 'bg-emerald-950/90 hover:bg-emerald-900 border-emerald-500/70 text-emerald-400'
              }`}
              title={isInDeck ? "Remove" : isLimitReached ? "Limit reached" : "Add to deck"}
            >
              {isInDeck ? (
                <Minus className="w-3 h-3" />
              ) : isLimitReached ? (
                <AlertCircle className="w-3 h-3 text-amber-400" />
              ) : (
                <Plus className="w-3 h-3" />
              )}
            </button>

            {/* Deck status tag */}
            {deckCopiesCount > 0 && (
              <span className={`text-[7px] font-mono font-black px-1 py-0.5 rounded leading-none shadow border ${
                isInDeck 
                  ? 'bg-red-950/85 border-red-500/50 text-red-300' 
                  : isLimitReached 
                  ? 'bg-amber-950/90 border-amber-500/60 text-amber-300' 
                  : 'bg-black/80 border-stone-600 text-stone-300'
              }`}>
                {isInDeck ? 'DECK' : isLimitReached ? 'MAX' : '1/2'}
              </span>
            )}
          </div>
        ) : (
          <div />
        )}

        {/* Level & Mana Badges */}
        <div className="flex items-center gap-1">
          {renderManaIcon(getCardManaCost(card), "w-4 h-4")}
          <div className="bg-black/80 border border-[#c5a880]/40 rounded-full w-4 h-4 flex items-center justify-center text-[7.5px] font-mono font-bold text-[#ebd09b] shadow">
            L{card.level}
          </div>
        </div>
      </div>

      {/* Center Name & Tier */}
      <div className="text-center my-auto relative z-10 drop-shadow-md">
        <span className="text-[9.5px] sm:text-[10px] font-display font-black text-white block truncate leading-none text-shadow-gold">
          {card.name}
        </span>
        <span className={`text-[7px] uppercase font-mono font-bold tracking-wider ${getDeckTierTextColor(card.tier)}`}>
          {card.tier}
        </span>
      </div>

      {/* Bottom Area: Skill Dots & Stats */}
      <div className="relative z-10 mt-auto">
        {/* Skill indicator dots */}
        {card.skills && card.skills.length > 0 && (
          <div className="flex justify-center gap-1 mb-1">
            {card.skills.map((s, idx) => (
              <div 
                key={idx} 
                className={`w-1.5 h-1.5 rounded-full border border-black shadow-sm ${
                  s.type === 'hex' ? 'bg-purple-500 shadow-[0_0_4px_#c084fc]' :
                  s.type === 'vampirism' ? 'bg-red-500 shadow-[0_0_4px_#ef4444]' :
                  s.type === 'plague' ? 'bg-green-500 shadow-[0_0_4px_#10b981]' : 'bg-blue-500 shadow-[0_0_4px_#3b82f6]'
                }`}
                title={s.description}
              />
            ))}
          </div>
        )}

        {/* Combat Stats Footer */}
        <div className="flex justify-between items-center text-[8.5px] font-mono font-black pt-0.5 border-t border-white/15 bg-black/80 rounded px-1 -mx-0.5">
          <span className="text-red-400">⚔️{card.attack}</span>
          <span className="text-blue-400" title="Turn Delay">⏳{card.delay}</span>
          <span className="text-emerald-400">❤️{card.health}</span>
        </div>
      </div>
    </div>
  );
});

// --- MAIN MOBILE COLLECTION VIEW ---

export const MobileCollectionView: React.FC = () => {
  const { profile, fuseCards, dismantleCard, toggleDeckCard } = useGame();
  const toast = useToast();

  // Mode: Sanctuary (Deck + Collection) vs Fusion Altar
  const [isFusingMode, setIsFusingMode] = useState(false);

  // Card Inspector
  const [inspectCard, setInspectCard] = useState<Card | null>(null);

  // Dismantle Modal
  const [dismantleConfirmCard, setDismantleConfirmCard] = useState<Card | null>(null);
  const [isDismantling, setIsDismantling] = useState(false);

  // Fusion Slots
  const [fuseCardId1, setFuseCardId1] = useState<string | null>(null);
  const [fuseCardId2, setFuseCardId2] = useState<string | null>(null);
  const [fusionConfirmData, setFusionConfirmData] = useState<{ card1: Card; card2: Card } | null>(null);
  const [isPerformingFusion, setIsPerformingFusion] = useState(false);

  // Deck Drawer state
  const [isDeckExpanded, setIsDeckExpanded] = useState(true);

  // Filter & Sort state
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'level' | 'attack' | 'health' | 'name'>('level');
  const [showFusableOnly, setShowFusableOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state
  const [page, setPage] = useState(1);
  const CARDS_PER_PAGE = 30; // Optimal for smooth mobile performance
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Memoized deck copies count per baseId
  const deckBaseCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cardId of (profile?.deck || [])) {
      const card = profile?.collection.find(c => c.id === cardId);
      if (card) {
        counts[card.baseId] = (counts[card.baseId] || 0) + 1;
      }
    }
    return counts;
  }, [profile?.deck, profile?.collection]);

  // Deck cards list
  const deckCards = useMemo(() => {
    return (profile?.deck || [])
      .map(id => profile?.collection.find(c => c.id === id))
      .filter((c): c is Card => !!c);
  }, [profile?.deck, profile?.collection]);


  // Fast duplicate lookup map
  const duplicateKeysSet = useMemo(() => {
    const counts = new Map<string, number>();
    for (const card of profile.collection) {
      const key = `${card.baseId}_${card.level}_${card.tier}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    const dupes = new Set<string>();
    counts.forEach((count, key) => {
      if (count > 1) dupes.add(key);
    });
    return dupes;
  }, [profile.collection]);

  const tierWeight = useMemo(() => ({ divine: 5, legendary: 4, gold: 3, silver: 2, bronze: 1 }), []);

  // Filtered & sorted collection
  const filteredCollection = useMemo(() => {
    return profile.collection
      .filter(card => {
        if (searchQuery.trim() && !card.name.toLowerCase().includes(searchQuery.toLowerCase().trim())) {
          return false;
        }
        if (tierFilter !== 'all' && card.tier !== tierFilter) {
          return false;
        }
        if (showFusableOnly) {
          if (card.level === 5 && (card.tier === 'legendary' || card.tier === 'divine')) return false;
          const key = `${card.baseId}_${card.level}_${card.tier}`;
          if (!duplicateKeysSet.has(key)) return false;
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
  }, [profile.collection, searchQuery, tierFilter, showFusableOnly, sortBy, duplicateKeysSet, tierWeight]);

  // Fusion candidate cards
  const fusionCandidates = useMemo(() => {
    if (!isFusingMode) return [];
    if (fuseCardId1) {
      const card1 = profile.collection.find(x => x.id === fuseCardId1);
      if (!card1) return [];
      return profile.collection.filter(c => 
        c.baseId === card1.baseId && 
        c.id !== fuseCardId1 && 
        c.level === card1.level && 
        c.tier === card1.tier
      );
    }
    return filteredCollection.filter(card => {
      if (card.level === 5 && (card.tier === 'legendary' || card.tier === 'divine')) return false;
      const key = `${card.baseId}_${card.level}_${card.tier}`;
      return duplicateKeysSet.has(key);
    });
  }, [isFusingMode, fuseCardId1, profile.collection, filteredCollection, duplicateKeysSet]);

  const currentCardList = isFusingMode ? fusionCandidates : filteredCollection;
  const totalPages = Math.max(1, Math.ceil(currentCardList.length / CARDS_PER_PAGE));
  const safePage = Math.min(page, totalPages);

  const paginatedCards = useMemo(() => {
    const startIndex = (safePage - 1) * CARDS_PER_PAGE;
    return currentCardList.slice(startIndex, startIndex + CARDS_PER_PAGE);
  }, [currentCardList, safePage]);

  // Reset page on filter or sort change
  useEffect(() => {
    setPage(1);
  }, [tierFilter, sortBy, showFusableOnly, searchQuery, isFusingMode, fuseCardId1]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  // Deck Toggle Handler
  const handleToggleDeck = useCallback((cardId: string) => {
    const res = toggleDeckCard(cardId);
    if (!res.success) {
      toast(res.message, 'warning');
    }
  }, [toggleDeckCard, toast]);

  // Select card in Sanctuary mode
  const handleSelectCardSanctuary = useCallback((card: Card) => {
    setInspectCard(card);
  }, []);

  // Select card in Fusion mode
  const handleSelectCardInFusion = useCallback((card: Card) => {
    if (!fuseCardId1) {
      if (card.level === 5 && card.tier === 'legendary') {
        toast('Level 5 legendary cards have already reached the absolute limit of power!', 'warning');
        return;
      }
      if (card.level === 5 && card.tier === 'divine') {
        toast('Level 5 divine cards have already attained maximum godhood!', 'warning');
        return;
      }
      setFuseCardId1(card.id);
      setFuseCardId2(null);
    } else {
      if (card.id === fuseCardId1) {
        toast('You cannot fuse a card with itself!', 'warning');
        return;
      }
      const card1 = profile.collection.find(c => c.id === fuseCardId1);
      if (!card1) return;

      if (card.baseId !== card1.baseId) {
        toast('Fusion cards must be identical entities (e.g. two Skeleton Warriors)!', 'warning');
        return;
      }
      if (card.tier !== card1.tier) {
        toast('Fusion cards must be of the same tier!', 'warning');
        return;
      }
      if (card.level !== card1.level) {
        toast('The sacrifice card must be of the same level!', 'warning');
        return;
      }
      setFuseCardId2(card.id);
    }
  }, [fuseCardId1, profile.collection, toast]);

  // Navigate directly from Card Inspector to Fusion Altar
  const handleInspectEvolve = (card: Card) => {
    if (card.level === 5 && (card.tier === 'legendary' || card.tier === 'divine')) {
      toast('This card has already reached maximum power limit!', 'warning');
      return;
    }
    setInspectCard(null);
    setIsFusingMode(true);
    setFuseCardId1(card.id);
    setFuseCardId2(null);
  };

  // Dismantle actions
  const handleStartDismantle = (card: Card) => {
    if (card.tier === 'divine') {
      toast('Divine cards are primordial gods and cannot be dismantled!', 'warning');
      return;
    }
    setDismantleConfirmCard(card);
  };

  const confirmDismantle = async () => {
    if (!dismantleConfirmCard) return;
    setIsDismantling(true);
    try {
      const cardToDismantle = dismantleConfirmCard;
      const res = await dismantleCard(cardToDismantle.id);
      if (res.success) {
        toast(`✨ Dismantled ${cardToDismantle.name} into +${res.dustAwarded || getDismantleDustYield(cardToDismantle.tier)} Void Dust!`, 'success');
        setDismantleConfirmCard(null);
        setInspectCard(null);
      } else {
        toast(res.message || 'Failed to dismantle card.', 'error');
      }
    } catch (err: any) {
      toast(err.message || 'Error occurred while dismantling card.', 'error');
    } finally {
      setIsDismantling(false);
    }
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
    setIsPerformingFusion(true);
    try {
      const res = await fuseCards(fusionConfirmData.card1.id, fusionConfirmData.card2.id);
      if (res.success) {
        const isLevelUpgrade = fusionConfirmData.card1.level < 5;
        toast(isLevelUpgrade 
          ? `Fusion complete! ${fusionConfirmData.card1.name} leveled up to L${fusionConfirmData.card1.level + 1}!` 
          : 'Dark Fusion Ritual complete! Your card has evolved to a higher tier with reduced delay!'
        , 'success');
        setFuseCardId1(null);
        setFuseCardId2(null);
        setFusionConfirmData(null);
      } else {
        toast(`Ritual error: ${res.message}`, 'warning');
        setFusionConfirmData(null);
      }
    } catch {
      toast('Error executing fusion ritual.', 'error');
      setFusionConfirmData(null);
    } finally {
      setIsPerformingFusion(false);
    }
  };

  // Render an altar card slot
  const renderAltarCardSlot = (cardId: string | null, label: string, onClear: () => void) => {
    const card = profile.collection.find(c => c.id === cardId);
    if (!card) {
      const isBase = label.toLowerCase().includes('base');
      return (
        <div className="w-24 h-32 border-2 border-dashed border-purple-900/50 bg-black/40 rounded-xl flex flex-col items-center justify-center text-center p-2 text-purple-400/60 shadow-inner group">
          {isBase ? (
            <BaseCardSlotEmblem className="w-8 h-10 mb-1" />
          ) : (
            <SacrificeSlotEmblem className="w-8 h-10 mb-1" />
          )}
          <span className="text-[8.5px] font-mono uppercase tracking-wider font-bold text-gray-400 mt-1">{label}</span>
        </div>
      );
    }
    return (
      <div 
        onClick={onClear}
        className={`relative w-24 h-32 rounded-xl p-1.5 flex flex-col justify-between cursor-pointer border overflow-hidden ${getCardTierStyles(card.tier, false, true)} shadow-lg group select-none active:scale-95`}
        title="Tap to remove card"
      >
        <img 
          src={getCardImageUrl(card)} 
          alt={card.name} 
          decoding="async" 
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-80" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10 z-0 pointer-events-none" />
        
        {/* Mana and Level Badges */}
        <div className="absolute top-1 right-1 z-10 flex items-center gap-1">
          {renderManaIcon(getCardManaCost(card), "w-4 h-4")}
          <div className="bg-black/80 border border-[#c5a880]/40 rounded-full w-[17px] h-[17px] flex items-center justify-center text-[8px] font-mono font-bold text-[#ebd09b] shadow">
            L{card.level}
          </div>
        </div>

        <div className="text-center mt-1 relative z-10 drop-shadow-md">
          <span className="text-[8.5px] font-display font-bold text-white block truncate leading-none max-w-[76px] mx-auto">{card.name}</span>
          <span className={`text-[7px] uppercase font-mono font-bold tracking-wider ${getDeckTierTextColor(card.tier)}`}>
            {card.tier}
          </span>
        </div>

        <div className="flex justify-between items-center text-[8px] font-mono font-bold pt-1 border-t border-white/10 relative z-10 drop-shadow-md">
          <span className="text-red-400">⚔️{card.attack}</span>
          <span className="text-emerald-400">❤️{card.health}</span>
        </div>

        {/* Remove Pill */}
        <div className="absolute top-1 left-1 z-30 bg-red-700/90 text-white rounded-full p-1 shadow">
          <X className="w-2.5 h-2.5" />
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full overflow-y-auto select-none px-2 sm:px-3 pt-2 pb-24 sm:pb-28 custom-scrollbar">

      {/* 1. GOTHIC DUAL SECTION SWITCHER */}
      <div className="bg-[#0c1015] border border-[#c5a880]/25 rounded-2xl p-1.5 shadow-2xl mb-2.5">
        <div className="grid grid-cols-2 gap-1.5">
          {/* Sanctuary Tab */}
          <button
            onClick={() => {
              setIsFusingMode(false);
              setFuseCardId1(null);
              setFuseCardId2(null);
            }}
            className={`relative flex items-center gap-2 p-2.5 rounded-xl font-display transition-all cursor-pointer overflow-hidden select-none ${
              !isFusingMode
                ? 'bg-gradient-to-r from-[#2a2013] via-[#3d2e1b] to-[#1f170d] text-[#ebd09b] border-2 border-[#c5a880] shadow-[0_0_20px_rgba(197,168,128,0.25)]'
                : 'bg-[#121720]/80 hover:bg-[#18202c] text-gray-400 border border-white/5'
            }`}
          >
            <div className={`p-1.5 rounded-lg border shrink-0 ${
              !isFusingMode 
                ? 'bg-black/60 border-[#c5a880]/60 text-[#ebd09b]' 
                : 'bg-black/40 border-white/5 text-gray-500'
            }`}>
              <SanctuaryEmblem className="w-4 h-4" />
            </div>
            <div className="text-left min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-black tracking-wide leading-none truncate ${!isFusingMode ? 'text-white' : 'text-gray-300'}`}>
                  SANCTUARY
                </span>
                {!isFusingMode && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ebd09b] shadow-[0_0_6px_#ebd09b] animate-pulse shrink-0" />
                )}
              </div>
              <span className="text-[8.5px] font-mono text-gray-400 block mt-0.5 truncate">
                Deck ({profile.deck.length}/10) · {profile.collection.length}
              </span>
            </div>
          </button>

          {/* Fusion Altar Tab */}
          <button
            onClick={() => {
              setIsFusingMode(true);
              setFuseCardId1(null);
              setFuseCardId2(null);
              setInspectCard(null);
            }}
            className={`relative flex items-center gap-2 p-2.5 rounded-xl font-display transition-all cursor-pointer overflow-hidden select-none ${
              isFusingMode
                ? 'bg-gradient-to-r from-[#2c123b] via-[#3f1655] to-[#1e0a29] text-purple-200 border-2 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                : 'bg-[#121720]/80 hover:bg-[#1b1526] text-gray-400 border border-white/5'
            }`}
          >
            <div className={`p-1.5 rounded-lg border shrink-0 ${
              isFusingMode 
                ? 'bg-black/60 border-purple-500/60 text-purple-300' 
                : 'bg-black/40 border-white/5 text-gray-500'
            }`}>
              <FusionAltarEmblem className="w-4 h-4" />
            </div>
            <div className="text-left min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-black tracking-wide leading-none truncate ${isFusingMode ? 'text-white' : 'text-gray-300'}`}>
                  FUSION ALTAR
                </span>
                {isFusingMode && (
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_6px_#c084fc] animate-pulse shrink-0" />
                )}
              </div>
              <span className="text-[8.5px] font-mono text-gray-400 block mt-0.5 truncate">
                Evolve identical cards
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* 2. SANCTUARY MODE */}
      {!isFusingMode && (
        <div className="space-y-2.5">
          {/* COMBAT DECK TRAY */}
          <div className="bg-[#151a21] border border-[#c5a880]/25 rounded-2xl p-2.5 sm:p-3 shadow-xl">
            {/* Tray Header & Controls */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-xs sm:text-sm text-white tracking-wider flex items-center gap-1.5 text-shadow-gold">
                  <span>⚔️ COMBAT DECK</span>
                  <span className="text-[#ebd09b]">({deckCards.length}/10)</span>
                </h3>
              </div>

              {/* Toggle drawer */}
              <button
                onClick={() => setIsDeckExpanded(!isDeckExpanded)}
                className="p-1 rounded-lg bg-black/40 hover:bg-black/60 text-gray-400 hover:text-white border border-white/10 cursor-pointer"
                title={isDeckExpanded ? "Collapse deck" : "Expand deck"}
              >
                {isDeckExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Incomplete deck warning */}
            {deckCards.length < 10 && (
              <div className="mt-2 py-1 px-2 rounded-lg bg-[#4e0707]/80 border border-[#dd2c40]/40 text-[#dd2c40] font-mono text-[9px] font-bold text-center flex items-center justify-center gap-1.5 animate-pulse">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>NOT ENOUGH CARDS! ADD UP TO 10 CARDS FOR BATTLE</span>
              </div>
            )}

            {/* Expanded 10-Slot Deck Grid */}
            {isDeckExpanded && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 mt-2.5">
                {(() => {
                  const sortedDeck = [...deckCards].sort((a, b) => {
                    const tierDiff = (tierWeight[b.tier as keyof typeof tierWeight] || 0) - (tierWeight[a.tier as keyof typeof tierWeight] || 0);
                    if (tierDiff !== 0) return tierDiff;
                    return b.level - a.level || a.name.localeCompare(b.name);
                  });
                  const paddedDeck = [...sortedDeck, ...Array(10 - sortedDeck.length).fill(null)];

                  return paddedDeck.map((card, idx) => {
                    if (card) {
                      return (
                        <div
                          key={card.id}
                          onClick={() => setInspectCard(card)}
                          className="relative flex items-center justify-between p-1.5 rounded-xl border border-gray-800/80 hover:border-gray-700 bg-[#11161d]/90 cursor-pointer transition-all overflow-hidden h-[50px] group active:scale-95"
                        >
                          {/* Cropped card background art */}
                          <div className="absolute inset-y-0 right-0 w-2/3 overflow-hidden rounded-r-xl opacity-40 pointer-events-none">
                            <img src={getCardImageUrl(card)} alt="" decoding="async" className="w-full h-full object-cover object-right" />
                            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#11161d]/85 to-[#11161d]" />
                          </div>

                          {/* Left: Mana & Info */}
                          <div className="flex items-center gap-1.5 z-10 min-w-0 flex-1 mr-1.5">
                            {renderManaIcon(getCardManaCost(card), "w-5 h-5")}
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-[10px] sm:text-[10.5px] font-display font-black text-white leading-tight truncate group-hover:text-cyan-200">
                                {card.name}
                              </span>
                              <div className="flex items-center gap-1 mt-0.5 text-[7.5px] font-mono leading-none">
                                <span className="text-gray-400">L{card.level}</span>
                                <span className="text-gray-600">•</span>
                                <span className={getDeckTierTextColor(card.tier)}>{card.tier}</span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Stats (2 rows) & Remove */}
                          <div className="flex items-center gap-1.5 z-10 shrink-0">
                            <div className="flex flex-col items-end justify-center font-mono leading-none text-right">
                              <div className="flex items-center gap-1 text-[8.5px] font-bold">
                                <span className="text-red-400">⚔️{card.attack}</span>
                                <span className="text-emerald-400">❤️{card.health}</span>
                              </div>
                              <span className="text-blue-400 text-[8px] font-bold mt-1" title="Turn Delay">
                                ⏳{card.delay}
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleDeck(card.id);
                              }}
                              className="bg-[#4e0707] hover:bg-[#880d1e] border border-[#dd2c40]/60 rounded p-1 text-white cursor-pointer active:scale-90 shrink-0"
                              title="Remove from deck"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-center rounded-xl border border-dashed border-white/5 bg-black/20 text-gray-600 h-[50px]"
                        >
                          <span className="text-[8px] font-mono tracking-wider font-bold opacity-40">EMPTY SLOT</span>
                        </div>
                      );
                    }
                  });
                })()}
              </div>
            )}
          </div>

          {/* COLLECTION VAULT CONTAINER */}
          <div className="bg-[#151a21] border border-[#c5a880]/25 rounded-2xl p-2.5 sm:p-3 shadow-xl">
            {/* Header, Search & Filter Console */}
            <div className="space-y-2 pb-2.5 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-black text-xs sm:text-sm text-white tracking-wider flex items-center gap-1.5 text-shadow-gold">
                  <SanctuaryEmblem className="w-3.5 h-3.5 text-[#ebd09b]" />
                  <span>COLLECTION VAULT</span>
                  <span className="text-gray-400 text-xs font-mono font-normal">({profile.collection.length})</span>
                </h3>

                {/* Fusable Only Switcher */}
                <button
                  onClick={() => setShowFusableOnly(!showFusableOnly)}
                  className={`flex items-center gap-1.5 py-1 px-2 rounded-lg border text-[9px] font-mono transition-all cursor-pointer ${
                    showFusableOnly
                      ? 'bg-purple-950/60 border-purple-500 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.35)]'
                      : 'bg-[#0b0c10] border-[#c5a880]/30 text-gray-400 hover:text-white'
                  }`}
                >
                  <div className={`w-3 h-3 rounded border flex items-center justify-center shrink-0 ${
                    showFusableOnly ? 'border-purple-400 bg-purple-500/30' : 'border-[#c5a880]/40 bg-black/40'
                  }`}>
                    {showFusableOnly && <Sparkles className="w-2 h-2 text-purple-300" />}
                  </div>
                  <span>Fusable Only</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search creature by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0b0c10] border border-[#c5a880]/20 rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#ebd09b] placeholder-gray-600 font-sans outline-none focus:border-[#c5a880]/50 transition-colors"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Tier Filter & Sort Dropdowns */}
              <div className="flex items-center gap-2 pt-0.5">
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="flex-1 bg-[#0b0c10] border border-[#c5a880]/30 rounded-xl py-1.5 px-2.5 text-[10px] sm:text-xs text-[#ebd09b] font-mono outline-none cursor-pointer"
                >
                  <option value="all">All tiers</option>
                  <option value="divine">Divine</option>
                  <option value="legendary">Legendary</option>
                  <option value="gold">Gold</option>
                  <option value="silver">Silver</option>
                  <option value="bronze">Bronze</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="flex-1 bg-[#0b0c10] border border-[#c5a880]/30 rounded-xl py-1.5 px-2.5 text-[10px] sm:text-xs text-[#ebd09b] font-mono outline-none cursor-pointer"
                >
                  <option value="level">Sort: Level</option>
                  <option value="attack">Sort: ATK</option>
                  <option value="health">Sort: HP</option>
                  <option value="name">Sort: Name</option>
                </select>
              </div>
            </div>

            {/* 3-Column Collection Cards Grid */}
            <div ref={gridContainerRef} className="pt-2.5">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {paginatedCards.map(card => {
                  const isInDeck = (profile.deck || []).includes(card.id);
                  const baseIdCopiesInDeck = deckBaseCounts[card.baseId] || 0;
                  const maxAllowed = getMaxAllowedDeckCopies(card.tier);

                  return (
                    <MobileCardItem
                      key={card.id}
                      card={card}
                      isSelected={false}
                      isInDeck={isInDeck}
                      isFusionMode={false}
                      deckCopiesCount={baseIdCopiesInDeck}
                      maxDeckCopies={maxAllowed}
                      onSelect={handleSelectCardSanctuary}
                      onToggleDeck={handleToggleDeck}
                    />
                  );
                })}
              </div>

              {filteredCollection.length === 0 && (
                <div className="text-center py-12 text-gray-500 text-xs font-mono">
                  No creatures found matching your filter criteria.
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-3 mt-2.5 border-t border-[#c5a880]/15 text-xs text-stone-400 select-none">
              <span className="font-mono text-[9px] sm:text-[10px] text-gray-400">
                {currentCardList.length === 0
                  ? '0 cards'
                  : `${(safePage - 1) * CARDS_PER_PAGE + 1}–${Math.min(currentCardList.length, safePage * CARDS_PER_PAGE)} of ${currentCardList.length}`}
              </span>
              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={safePage <= 1}
                    className="px-2 py-0.5 rounded bg-[#0b0c10] border border-[#c5a880]/30 text-[#ebd09b] disabled:opacity-25 disabled:cursor-not-allowed hover:bg-[#ebd09b]/10 transition-colors flex items-center gap-0.5 font-mono text-[10px] cursor-pointer"
                  >
                    <ChevronLeft className="w-3 h-3" />
                    <span>Prev</span>
                  </button>
                  <span className="font-mono text-[10px] px-1.5 text-[#ebd09b] font-bold">
                    {safePage}/{totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={safePage >= totalPages}
                    className="px-2 py-0.5 rounded bg-[#0b0c10] border border-[#c5a880]/30 text-[#ebd09b] disabled:opacity-25 disabled:cursor-not-allowed hover:bg-[#ebd09b]/10 transition-colors flex items-center gap-0.5 font-mono text-[10px] cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. FUSION ALTAR MODE */}
      {isFusingMode && (
        <div className="space-y-3">
          {/* ALTAR PEDESTAL CONSOLE */}
          <div className="bg-[#151a21] border border-purple-500/30 rounded-2xl p-3 sm:p-4 shadow-2xl">
            {/* Header */}
            <div className="text-center border-b border-purple-500/20 pb-2 mb-3">
              <span className="text-[9px] font-mono text-purple-400 font-bold tracking-widest uppercase">DARK TRANSMUTATION</span>
              <h3 className="font-display font-black text-base sm:text-lg text-white tracking-wide text-shadow-gold">
                FUSION RITUAL
              </h3>
              <p className="text-[9px] text-gray-400 font-sans mt-0.5">
                {!fuseCardId1
                  ? "Select the Base Card from the collection below"
                  : !fuseCardId2
                  ? "Select an identical duplicate copy to sacrifice"
                  : "Both cards placed. Review outcome & perform ritual"}
              </p>
            </div>

            {/* 2 Altar Slots */}
            <div className="flex items-center justify-around bg-[#0b0c10]/70 border border-purple-500/25 rounded-2xl p-3 sm:p-4 shadow-inner mb-3">
              {/* Slot 1: Base */}
              <div className="text-center">
                {renderAltarCardSlot(fuseCardId1, "Base Card", () => {
                  setFuseCardId1(null);
                  setFuseCardId2(null);
                })}
                <span className="text-[9px] font-mono text-purple-300/80 mt-1 block uppercase tracking-wider font-bold">Base</span>
              </div>

              <div className="flex flex-col items-center justify-center px-1">
                <ArrowRight className="w-5 h-5 text-purple-400 animate-pulse" />
                <span className="text-[7.5px] font-mono text-purple-400 mt-1 uppercase font-bold">MERGE</span>
              </div>

              {/* Slot 2: Sacrifice */}
              <div className="text-center">
                {renderAltarCardSlot(fuseCardId2, "Sacrifice", () => {
                  setFuseCardId2(null);
                })}
                <span className="text-[9px] font-mono text-purple-300/80 mt-1 block uppercase tracking-wider font-bold">Sacrifice</span>
              </div>
            </div>

            {/* Fusion Result Preview */}
            <div className="bg-black/40 rounded-xl p-3 border border-purple-950 text-xs font-mono mb-3">
              <h4 className="text-[#c5a880] font-display font-semibold text-center text-[11px] mb-2 uppercase tracking-wide">
                FUSION OUTCOME PREVIEW
              </h4>
              
              {fuseCardId1 ? (() => {
                const c1 = profile.collection.find(c => c.id === fuseCardId1)!;
                const isLevelUpgrade = c1.level < 5;

                if (isLevelUpgrade) {
                  const nextL = c1.level + 1;
                  const nextAttack = Math.round(c1.attack * 1.15);
                  const nextHealth = Math.round(c1.health * 1.15);
                  return (
                    <ul className="space-y-1 text-[10px] text-gray-300">
                      <li className="flex justify-between">
                        <span>Ritual Type:</span>
                        <span className="text-amber-400 font-bold">LEVEL UP</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Level:</span>
                        <span className="text-white font-bold">L{c1.level} ➔ L{nextL}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Attack:</span>
                        <span className="text-red-400 font-bold">⚔️ {c1.attack} ➔ {nextAttack} (+15%)</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Health:</span>
                        <span className="text-emerald-400 font-bold">❤️ {c1.health} ➔ {nextHealth} (+15%)</span>
                      </li>
                      <li className="text-[9px] text-amber-300/90 border-t border-purple-950/60 pt-1.5 mt-1 font-sans">
                        ✦ Enhances creature base statistics and combat potential.
                      </li>
                    </ul>
                  );
                } else {
                  let nextT: CardTier = 'silver';
                  if (c1.tier === 'bronze') nextT = 'silver';
                  else if (c1.tier === 'silver') nextT = 'gold';
                  else if (c1.tier === 'gold') nextT = 'legendary';

                  const nextAttack = Math.round(c1.attack * 1.25);
                  const nextHealth = Math.round(c1.health * 1.25);
                  const nextDelay = Math.max(1, c1.delay - 1);
                  const bonusSkill = getEvolutionBonusSkill(c1.skills || [], nextT);

                  return (
                    <ul className="space-y-1 text-[10px] text-gray-300">
                      <li className="flex justify-between">
                        <span>Ritual Type:</span>
                        <span className="text-purple-400 font-bold">TIER ASCENSION</span>
                      </li>
                      <li className="flex justify-between">
                        <span>New Tier:</span>
                        <span className="text-purple-300 font-bold uppercase">{nextT} (L1)</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Attack:</span>
                        <span className="text-red-400 font-bold">⚔️ {c1.attack} ➔ {nextAttack} (+25%)</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Health:</span>
                        <span className="text-emerald-400 font-bold">❤️ {c1.health} ➔ {nextHealth} (+25%)</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Turn Delay:</span>
                        <span className="text-blue-400 font-bold">⏳ {nextDelay} turns (Reduced!)</span>
                      </li>
                      {bonusSkill && (
                        <li className="flex justify-between items-center pt-0.5">
                          <span>New Bonus Skill:</span>
                          <span className="text-cyan-300 font-bold capitalize flex items-center gap-1">
                            {renderSkillIcon(bonusSkill.type, "w-3.5 h-3.5")}
                            {bonusSkill.type}
                          </span>
                        </li>
                      )}
                      <li className="text-[9px] text-purple-300/90 border-t border-purple-950/60 pt-1.5 mt-1 font-sans">
                        ✦ {bonusSkill ? bonusSkill.description : `Awakens powerful new traits of tier ${nextT}!`}
                      </li>
                    </ul>
                  );
                }
              })() : (
                <div className="text-center py-4 text-gray-500 text-[10px] italic">
                  Select a Base Card to inspect fusion results...
                </div>
              )}
            </div>

            {/* Currency Costs */}
            {fuseCardId1 ? (() => {
              const c1 = profile.collection.find(c => c.id === fuseCardId1)!;
              const { goldCost, dustCost, shardsCost } = getFusionCosts(c1);

              return (
                <div className={`grid ${shardsCost > 0 ? 'grid-cols-3' : 'grid-cols-2'} gap-2 text-center mb-3`}>
                  <div className="bg-black/50 border border-purple-950 p-2 rounded-xl">
                    <span className="text-[8.5px] text-gray-500 block font-mono">Gold Cost</span>
                    <div className="flex items-center justify-center gap-1 font-mono text-[11.5px] font-bold mt-0.5">
                      <span className={profile.gold >= goldCost ? 'text-amber-400' : 'text-red-500'}>
                        {goldCost} / {profile.gold}
                      </span>
                      <img 
                        src="/icons/icon_gold.webp" 
                        alt="Gold" 
                        className="w-4 h-4 object-contain drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" 
                      />
                    </div>
                  </div>
                  <div className="bg-black/50 border border-purple-950 p-2 rounded-xl">
                    <span className="text-[8.5px] text-gray-500 block font-mono">Dust Cost</span>
                    <div className="flex items-center justify-center gap-1 font-mono text-[11.5px] font-bold mt-0.5">
                      <span className={profile.dust >= dustCost ? 'text-cyan-300' : 'text-red-500'}>
                        {dustCost} / {profile.dust}
                      </span>
                      <img 
                        src="/icons/icon_dust.webp" 
                        alt="Dust" 
                        className="w-4 h-4 object-contain drop-shadow-[0_0_8px_rgba(6,182,212,0.6)] scale-[1.7] ml-0.5" 
                      />
                    </div>
                  </div>
                  {shardsCost > 0 && (
                    <div className="bg-black/50 border border-purple-950 p-2 rounded-xl">
                      <span className="text-[8.5px] text-gray-500 block font-mono">Shards</span>
                      <div className="flex items-center justify-center gap-1 font-mono text-[11.5px] font-bold mt-0.5">
                        <span className={(profile.darkShards || 0) >= shardsCost ? 'text-purple-400' : 'text-red-500'}>
                          {shardsCost} / {profile.darkShards || 0}
                        </span>
                        <img 
                          src="/icons/icon_shards.webp" 
                          alt="Shards" 
                          className="w-4 h-4 object-contain drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]" 
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })() : (
              <div className="grid grid-cols-2 gap-2 text-center mb-3">
                <div className="bg-black/50 border border-purple-950 p-2 rounded-xl">
                  <span className="text-[8.5px] text-gray-500 block font-mono">Gold Cost</span>
                  <div className="flex items-center justify-center gap-1 font-mono text-[11.5px] font-bold text-amber-400 mt-0.5">
                    <span>-</span>
                    <img src="/icons/icon_gold.webp" alt="Gold" className="w-4 h-4 object-contain opacity-60" />
                  </div>
                </div>
                <div className="bg-black/50 border border-purple-950 p-2 rounded-xl">
                  <span className="text-[8.5px] text-gray-500 block font-mono">Dust Cost</span>
                  <div className="flex items-center justify-center gap-1 font-mono text-[11.5px] font-bold text-cyan-300 mt-0.5">
                    <span>-</span>
                    <img src="/icons/icon_dust.webp" alt="Dust" className="w-4 h-4 object-contain opacity-60 scale-[1.7] ml-0.5" />
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-1.5">
              <button
                onClick={executeFusionRitual}
                disabled={(() => {
                  if (!fuseCardId1 || !fuseCardId2 || isPerformingFusion) return true;
                  const c1 = profile.collection.find(c => c.id === fuseCardId1);
                  if (!c1) return true;
                  const { goldCost, dustCost, shardsCost } = getFusionCosts(c1);
                  return profile.gold < goldCost || profile.dust < dustCost || (shardsCost > 0 && (profile.darkShards || 0) < shardsCost);
                })()}
                className="w-full bg-gradient-to-r from-purple-900 to-[#4e0707] hover:from-purple-700 hover:to-red-700 disabled:opacity-40 disabled:cursor-not-allowed border border-purple-500/50 text-white font-display font-black tracking-wider py-2.5 px-3 rounded-xl transition-all shadow-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
              >
                <FusionAltarEmblem className="w-4 h-4 shrink-0" />
                <span>PERFORM FUSION RITUAL</span>
              </button>
            </div>
          </div>

          {/* CANDIDATE CARDS PICKER GRID */}
          <div className="bg-[#151a21] border border-[#c5a880]/25 rounded-2xl p-2.5 sm:p-3 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2.5">
              <h4 className="font-display font-black text-xs text-white tracking-wider text-shadow-gold">
                {!fuseCardId1 ? '1. SELECT BASE CREATURE' : '2. SELECT SACRIFICE DUPLICATE'}
              </h4>
              <span className="text-[9px] font-mono text-purple-400">
                {currentCardList.length} candidate{currentCardList.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {paginatedCards.map(card => {
                const isSelected = fuseCardId1 === card.id || fuseCardId2 === card.id;
                return (
                  <MobileCardItem
                    key={card.id}
                    card={card}
                    isSelected={isSelected}
                    isFusionMode={true}
                    onSelect={handleSelectCardInFusion}
                  />
                );
              })}
            </div>

            {fuseCardId1 && fusionCandidates.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-[11px] font-mono">
                😭 No identical duplicate card of the same level and tier found.
                <p className="text-[9px] text-gray-600 mt-1">Summon cards in the Shop to acquire duplicates for fusion!</p>
              </div>
            )}

            {!fuseCardId1 && fusionCandidates.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-[11px] font-mono">
                No duplicate creatures available for fusion in your collection.
              </div>
            )}

            {/* Pagination Controls in Altar */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-[#c5a880]/15 text-xs text-stone-400 select-none">
                <span className="font-mono text-[9px] text-gray-400">
                  Page {safePage} / {totalPages}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={safePage <= 1}
                    className="px-2 py-0.5 rounded bg-[#0b0c10] border border-[#c5a880]/30 text-[#ebd09b] disabled:opacity-25 disabled:cursor-not-allowed hover:bg-[#ebd09b]/10 font-mono text-[10px]"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={safePage >= totalPages}
                    className="px-2 py-0.5 rounded bg-[#0b0c10] border border-[#c5a880]/30 text-[#ebd09b] disabled:opacity-25 disabled:cursor-not-allowed hover:bg-[#ebd09b]/10 font-mono text-[10px]"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. CARD INSPECTOR MODAL / BOTTOM SHEET */}
      {inspectCard && (
        <div 
          onClick={() => setInspectCard(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#120e0b] border-2 border-[#c5a880]/50 rounded-2xl max-w-sm w-full p-4 space-y-3 shadow-2xl relative max-h-[92vh] overflow-y-auto custom-scrollbar cursor-default"
          >
            {/* Close Button */}
            <button
              onClick={() => setInspectCard(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white p-1 rounded-lg bg-black/60 border border-white/10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header / Level */}
            <div className="text-center border-b border-white/10 pb-2 pr-6">
              <span className="text-[10px] font-mono font-bold text-[#c5a880] uppercase tracking-widest">
                Level {inspectCard.level} / 5
              </span>
            </div>

            {/* High Fidelity Visual Card Illustration */}
            <div className={`aspect-[3/4.2] w-full max-w-[210px] mx-auto bg-[#0b0c10] rounded-2xl p-3 flex flex-col justify-between relative shadow-inner overflow-hidden border ${getCardTierStyles(inspectCard.tier, false, true)}`}>
              <img 
                src={getCardImageUrl(inspectCard)} 
                alt={inspectCard.name} 
                decoding="async" 
                className="absolute inset-0 w-full h-full object-cover z-0 opacity-90" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10 z-0 pointer-events-none" />

              {/* Top: Tier badge & Mana/Level */}
              <div className="relative z-10 flex justify-between items-start">
                <span className={getTierBadgeStyles(inspectCard.tier)}>{inspectCard.tier}</span>
                <div className="flex items-center gap-1.5">
                  {renderManaIcon(getCardManaCost(inspectCard), "w-5 h-5")}
                  <div className="bg-black/80 border border-[#c5a880]/50 rounded-full w-5 h-5 flex items-center justify-center text-[9px] font-mono font-black text-[#ebd09b] shadow">
                    L{inspectCard.level}
                  </div>
                </div>
              </div>

              <div className="flex-1" />

              {/* Bottom: Name & Stat pills */}
              <div className="relative z-10">
                <h3 className="font-display font-black text-lg text-white tracking-wider text-shadow-gold mb-1.5 text-center drop-shadow-md">
                  {inspectCard.name}
                </h3>
                <div className="grid grid-cols-3 gap-1 font-mono text-[9px] font-bold text-center border-t border-white/20 pt-1.5 bg-black/50 backdrop-blur-sm rounded-lg p-1">
                  <div className="bg-red-950/50 p-1 rounded">
                    <span className="text-red-400 block text-[7px] opacity-80">ATK</span>
                    <span className="text-red-400 text-xs">⚔️{inspectCard.attack}</span>
                  </div>
                  <div className="bg-emerald-950/50 p-1 rounded">
                    <span className="text-emerald-400 block text-[7px] opacity-80">HP</span>
                    <span className="text-emerald-400 text-xs">❤️{inspectCard.health}</span>
                  </div>
                  <div className="bg-blue-950/50 p-1 rounded">
                    <span className="text-blue-400 block text-[7px] opacity-80">DELAY</span>
                    <span className="text-blue-400 text-xs">⏳{inspectCard.delay}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dark Skills */}
            <div className="space-y-1.5">
              <span className="text-[9.5px] font-mono text-gray-400 uppercase tracking-wider block font-bold">Dark Skills</span>
              {inspectCard.skills && inspectCard.skills.length > 0 ? (
                inspectCard.skills.map((skill, idx) => (
                  <div key={idx} className="bg-black/40 border border-white/10 p-2 rounded-xl text-xs">
                    <span className="font-display font-semibold text-[#ebd09b] block uppercase text-[10px]">
                      {skill.type === 'hex' && <span className="flex items-center gap-1">{renderSkillIcon("hex", "w-4 h-4")} Hex</span>}
                      {skill.type === 'vampirism' && <span className="flex items-center gap-1">{renderSkillIcon("vampirism", "w-4 h-4")} Vampirism</span>}
                      {skill.type === 'plague' && <span className="flex items-center gap-1">{renderSkillIcon("plague", "w-4 h-4")} Plague</span>}
                      {skill.type === 'sacrifice' && <span className="flex items-center gap-1">{renderSkillIcon("sacrifice", "w-4 h-4")} Sacrifice</span>}
                    </span>
                    <p className="text-gray-300 font-sans mt-0.5 leading-tight text-[9.5px]">{skill.description}</p>
                  </div>
                ))
              ) : (
                <span className="text-[10px] text-gray-500 font-sans italic block">
                  This creature has no special skills. Fuse it to unlock hidden power!
                </span>
              )}
            </div>

            {/* Lore description */}
            <p className="text-[10px] text-gray-400 italic font-sans leading-relaxed border-l-2 border-[#c5a880]/30 pl-2.5">
              {CARD_TEMPLATES.find(t => t.baseId === inspectCard.baseId)?.description}
            </p>

            {/* Action 1: Add/Remove from Combat Deck */}
            {(() => {
              const isInDeck = (profile.deck || []).includes(inspectCard.id);
              const baseIdCopiesInDeck = deckBaseCounts[inspectCard.baseId] || 0;
              const maxAllowed = getMaxAllowedDeckCopies(inspectCard.tier);
              const isLimitReached = !isInDeck && baseIdCopiesInDeck >= maxAllowed;
              const isDeckFull = !isInDeck && (profile.deck || []).length >= 10;

              return (
                <div className="space-y-1 pt-1 border-t border-[#c5a880]/15">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-gray-400">Combat Deck:</span>
                    <span className={`font-bold ${
                      isInDeck ? 'text-emerald-400' : isLimitReached ? 'text-amber-400' : 'text-[#ebd09b]'
                    }`}>
                      {isInDeck ? `In Deck (${baseIdCopiesInDeck}/${maxAllowed})` : `${baseIdCopiesInDeck}/${maxAllowed} in deck`}
                    </span>
                  </div>

                  {isInDeck ? (
                    <button
                      onClick={() => handleToggleDeck(inspectCard.id)}
                      className="w-full bg-[#4e0707] hover:bg-[#880d1e] border border-[#dd2c40]/60 text-white font-display font-black text-[10px] py-2 px-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                    >
                      <Minus className="w-3.5 h-3.5" />
                      <span>REMOVE FROM COMBAT DECK</span>
                    </button>
                  ) : isLimitReached ? (
                    <button
                      disabled
                      className="w-full bg-[#2a1708] border border-amber-600/50 text-amber-300 font-display font-black text-[10px] py-2 px-3 rounded-xl opacity-85 flex items-center justify-center gap-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>DECK LIMIT REACHED ({baseIdCopiesInDeck}/{maxAllowed})</span>
                    </button>
                  ) : isDeckFull ? (
                    <button
                      disabled
                      className="w-full bg-stone-900 border border-stone-700/60 text-stone-400 font-display font-black text-[10px] py-2 px-3 rounded-xl opacity-85 flex items-center justify-center gap-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>COMBAT DECK FULL (10/10)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleDeck(inspectCard.id)}
                      className="w-full bg-gradient-to-r from-emerald-950 to-[#122e20] hover:from-emerald-900 hover:to-[#1a442e] border border-emerald-500/60 text-emerald-300 font-display font-black text-[10px] py-2 px-3 rounded-xl transition-all shadow-[0_0_12px_rgba(16,185,129,0.2)] flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>ADD TO COMBAT DECK</span>
                    </button>
                  )}
                </div>
              );
            })()}

            {/* Action 2: Fusion Altar Shortcut */}
            <button
              onClick={() => handleInspectEvolve(inspectCard)}
              className="w-full bg-gradient-to-r from-purple-950 to-indigo-950 hover:from-purple-900 hover:to-indigo-900 border border-purple-500/50 text-purple-200 font-display font-black text-[10px] py-2 px-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
            >
              <FusionAltarEmblem className="w-3.5 h-3.5" />
              <span>EVOLVE IN FUSION ALTAR</span>
            </button>

            {/* Action 3: Dismantle Card */}
            {inspectCard.tier === 'divine' ? (
              <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl py-1.5 px-2.5 text-center">
                <span className="text-[9.5px] font-mono text-rose-400/90 font-bold flex items-center justify-center gap-1">
                  <Crown className="w-3 h-3 text-rose-400" />
                  <span>DIVINE ENTITY · CANNOT BE DISMANTLED</span>
                </span>
              </div>
            ) : (
              <button
                onClick={() => handleStartDismantle(inspectCard)}
                className="w-full bg-gradient-to-r from-[#1b1526] via-[#28153c] to-[#1b1526] hover:from-[#2e1742] hover:via-[#3d1a5c] border border-cyan-500/40 text-cyan-200 font-display font-black py-1.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
              >
                <span className="text-[10px] tracking-wider uppercase">DESTROY</span>
                <span className="text-xs font-mono font-black text-cyan-300">+{getDismantleDustYield(inspectCard.tier)}</span>
                <img 
                  src="/icons/icon_dust.webp" 
                  alt="Void Dust" 
                  className="w-5 h-5 object-contain scale-[1.7] ml-1" 
                />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 5. FUSION CONFIRMATION MODAL */}
      {fusionConfirmData && (() => {
        const c1 = fusionConfirmData.card1;
        const { goldCost, dustCost, shardsCost, isLevelUpgrade } = getFusionCosts(c1);

        return (
          <div 
            onClick={() => setFusionConfirmData(null)}
            className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-150 cursor-pointer"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-[#151a21] border border-purple-500/50 rounded-2xl p-5 max-w-sm w-full shadow-[0_0_40px_rgba(168,85,247,0.2)] text-center relative overflow-hidden cursor-default"
            >
              <Skull className="w-10 h-10 text-purple-400 mx-auto mb-2 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
              <h2 className="text-lg font-display font-black text-white uppercase tracking-widest mb-1.5 text-shadow-gold">
                Confirm Ritual
              </h2>

              <p className="text-gray-300 font-sans text-xs mb-4 leading-relaxed">
                {isLevelUpgrade 
                  ? `Fuse two copies of ${c1.name} (L${c1.level}) to create a powerful L${c1.level + 1} creature?`
                  : `Sacrifice both L5 ${c1.name} cards to evolve into a higher tier entity?`
                }
              </p>

              {/* Cost Summary Box */}
              <div className="flex justify-center gap-3 mb-4 bg-black/50 py-2 px-3 rounded-xl border border-white/10 text-xs font-mono">
                <div className="flex items-center gap-1">
                  <span className={`font-bold ${profile.gold >= goldCost ? 'text-amber-400' : 'text-red-400'}`}>{goldCost}</span>
                  <img src="/icons/icon_gold.webp" alt="Gold" className="w-4 h-4 object-contain" />
                </div>
                <div className="flex items-center gap-1">
                  <span className={`font-bold ${profile.dust >= dustCost ? 'text-cyan-300' : 'text-red-400'}`}>{dustCost}</span>
                  <img src="/icons/icon_dust.webp" alt="Dust" className="w-4 h-4 object-contain scale-[1.7] ml-0.5" />
                </div>
                {shardsCost > 0 && (
                  <div className="flex items-center gap-1">
                    <span className={`font-bold ${(profile.darkShards || 0) >= shardsCost ? 'text-purple-400' : 'text-red-400'}`}>{shardsCost}</span>
                    <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain" />
                  </div>
                )}
              </div>

              <div className="flex gap-2.5">
                <button 
                  onClick={() => setFusionConfirmData(null)} 
                  disabled={isPerformingFusion}
                  className="flex-1 bg-black/50 hover:bg-black/80 border border-gray-700 text-gray-400 font-mono text-xs py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  CANCEL
                </button>
                <button 
                  onClick={confirmFusionRitual} 
                  disabled={isPerformingFusion}
                  className="flex-1 bg-gradient-to-r from-purple-900 to-[#4e0707] hover:from-purple-700 hover:to-red-700 border border-purple-500/50 text-white font-display font-black text-xs py-2.5 rounded-xl transition-all shadow-md cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  {isPerformingFusion ? 'TRANSMUTING...' : 'CONFIRM'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 6. DISMANTLE CONFIRMATION MODAL */}
      {dismantleConfirmCard && (() => {
        const c = dismantleConfirmCard;
        const dustYield = getDismantleDustYield(c.tier);
        const isInDeck = (profile.deck || []).includes(c.id);

        return (
          <div 
            onClick={() => setDismantleConfirmCard(null)}
            className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-150 cursor-pointer"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-[#12161f] border-2 border-cyan-500/50 rounded-2xl p-5 max-w-sm w-full shadow-[0_0_40px_rgba(6,182,212,0.25)] text-center relative overflow-hidden cursor-default"
            >
              <div className="relative inline-block mb-2">
                <img 
                  src="/icons/icon_dust.webp" 
                  alt="Void Dust" 
                  className="w-12 h-12 object-contain mx-auto drop-shadow-[0_0_15px_rgba(6,182,212,0.8)] scale-[1.7]" 
                />
              </div>

              <h2 className="text-base font-display font-black text-white uppercase tracking-widest mb-1 text-shadow-gold">
                Dismantle Creature
              </h2>

              <p className="text-gray-300 font-sans text-xs mb-3 leading-relaxed">
                Sacrifice <span className="text-white font-bold">{c.name}</span> (Level {c.level}) back into the ether? The card will be permanently destroyed.
              </p>

              {/* Essence Yield Box */}
              <div className="bg-black/60 rounded-xl p-2.5 border border-cyan-500/30 mb-3 text-center">
                <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block mb-1">
                  Essence Reclaimed
                </span>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono text-xl font-black text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.7)]">
                    +{dustYield}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-gray-300">VOID DUST</span>
                  <img src="/icons/icon_dust.webp" alt="Void Dust" className="w-6 h-6 object-contain scale-[1.7] ml-1" />
                </div>
              </div>

              {isInDeck && (
                <div className="mb-3 bg-amber-950/40 border border-amber-600/40 rounded-xl p-2 flex items-center gap-2 text-left">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-[9.5px] font-sans text-amber-200 leading-tight">
                    This card is currently in your combat deck. Dismantling will remove it from battle roster.
                  </span>
                </div>
              )}

              <div className="flex gap-2.5">
                <button 
                  onClick={() => setDismantleConfirmCard(null)} 
                  disabled={isDismantling}
                  className="flex-1 bg-black/50 hover:bg-black/80 border border-gray-700 text-gray-400 font-mono text-xs py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  CANCEL
                </button>
                <button 
                  onClick={confirmDismantle} 
                  disabled={isDismantling}
                  className="flex-1 bg-gradient-to-r from-cyan-950 via-[#0a2e38] to-cyan-900 hover:from-cyan-800 border border-cyan-400/60 text-cyan-200 hover:text-white font-display font-black text-xs py-2.5 rounded-xl transition-all shadow-md cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  {isDismantling ? 'DESTROYING...' : 'DISMANTLE'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
};
