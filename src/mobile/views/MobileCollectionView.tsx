import React, { useState, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { useToast } from '../../components/Toast';
import { Card, CardTier } from '../../types';
import { getCardManaCost, getFusionCosts } from '../../data/cards';
import { FolderGit, Plus, X, Sparkles, Star, Info, Trash2, ArrowRight } from 'lucide-react';

const getTierColor = (tier: string) => {
  switch (tier?.toLowerCase()) {
    case 'divine': return 'text-rose-400 border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]';
    case 'legendary': return 'text-purple-300 border-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]';
    case 'gold': return 'text-amber-300 border-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.4)]';
    case 'silver': return 'text-slate-300 border-slate-400';
    default: return 'text-amber-500 border-amber-700/60';
  }
};

export const MobileCollectionView: React.FC = () => {
  const { profile, toggleDeckCard, evolveCard, updateProfile } = useGame();
  const toast = useToast();

  const [mode, setMode] = useState<'deck' | 'fusion'>('deck');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [inspectCard, setInspectCard] = useState<Card | null>(null);

  // Fusion state
  const [fuseCard1, setFuseCard1] = useState<Card | null>(null);
  const [fuseCard2, setFuseCard2] = useState<Card | null>(null);
  const [isFusing, setIsFusing] = useState(false);

  // Deck cards list
  const deckCards = useMemo(() => {
    return (profile.deck || [])
      .map(id => profile.collection.find(c => c.id === id))
      .filter(Boolean) as Card[];
  }, [profile.deck, profile.collection]);

  // Filtered collection
  const filteredCards = useMemo(() => {
    return profile.collection.filter(c => {
      if (tierFilter !== 'all' && c.tier !== tierFilter) return false;
      return true;
    });
  }, [profile.collection, tierFilter]);

  // Deck statistics
  const totalDeckAtk = deckCards.reduce((sum, c) => sum + c.attack, 0);
  const totalDeckHp = deckCards.reduce((sum, c) => sum + c.health, 0);
  const avgMana = deckCards.length > 0
    ? (deckCards.reduce((sum, c) => sum + (c.manaCost || 1), 0) / deckCards.length).toFixed(1)
    : '0';

  const handleToggle = (cardId: string) => {
    const res = toggleDeckCard(cardId);
    if (!res.success) {
      toast(res.message, 'warning');
    }
  };

  const handleClearDeck = () => {
    if (window.confirm("Clear all cards from your active deck?")) {
      updateProfile({ ...profile, deck: [] });
      toast("Deck cleared", "info");
    }
  };

  // Execute fusion
  const handleExecuteFusion = async () => {
    if (!fuseCard1 || !fuseCard2) return;
    setIsFusing(true);
    try {
      const res = await evolveCard(fuseCard1.id, fuseCard2.id);
      if (res.success) {
        toast(`Fusion Successful! Upgraded to Level ${fuseCard1.level + 1}!`, 'success');
        setFuseCard1(null);
        setFuseCard2(null);
      } else {
        toast(res.message || 'Fusion failed', 'error');
      }
    } catch {
      toast('Network error during fusion', 'error');
    } finally {
      setIsFusing(false);
    }
  };

  return (
    <div className="h-full w-full flex p-1.5 sm:p-2 gap-2 select-none overflow-hidden font-sans">
      {/* LEFT PANEL: ACTIVE DECK (36% width) */}
      <div className="w-[36%] max-w-[300px] bg-gradient-to-b from-[#140e0c]/90 via-[#0a0705]/95 to-[#050403] border border-[#ebd09b]/25 rounded-xl p-2 flex flex-col justify-between shadow-xl shrink-0">
        {/* Header */}
        <div className="flex items-center justify-between pb-1 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-1.5">
            <FolderGit className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-display font-black text-xs text-white uppercase tracking-wider">
              DECK ({deckCards.length}/10)
            </span>
          </div>
          {deckCards.length > 0 && (
            <button
              onClick={handleClearDeck}
              className="text-[8px] font-mono text-gray-400 hover:text-red-400 flex items-center gap-0.5 cursor-pointer"
              title="Clear Deck"
            >
              <Trash2 className="w-2.5 h-2.5" /> CLEAR
            </button>
          )}
        </div>

        {/* Deck Cards Scrollable List */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-1 my-1 pr-0.5">
          {deckCards.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-2 text-gray-500 font-mono text-[9px]">
              <span>Deck is empty.</span>
              <span className="text-[8px] text-gray-600 mt-0.5">Tap cards on the right to add them to your battle deck.</span>
            </div>
          ) : (
            deckCards.map((c) => (
              <div
                key={c.id}
                onClick={() => handleToggle(c.id)}
                className="flex items-center justify-between bg-black/60 hover:bg-red-950/40 border border-white/5 hover:border-red-500/40 rounded-lg p-1 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-3.5 h-3.5 rounded-full bg-cyan-600 border border-cyan-300 flex items-center justify-center text-[7.5px] font-mono font-black text-black shrink-0">
                    {c.manaCost || 1}
                  </div>
                  <span className={`text-[9.5px] font-display font-black truncate ${getTierColor(c.tier).split(' ')[0]}`}>
                    {c.name}
                  </span>
                  <span className="text-[8px] font-mono text-gray-500 shrink-0">Lv.{c.level}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[8.5px] shrink-0 font-bold">
                  <span className="text-red-400">{c.attack}</span>
                  <span className="text-gray-600">/</span>
                  <span className="text-emerald-400">{c.health}</span>
                  <X className="w-3 h-3 text-gray-500 group-hover:text-red-400 ml-1" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Deck Stats Footer */}
        <div className="pt-1 border-t border-white/10 flex items-center justify-between font-mono text-[8.5px] text-gray-400 shrink-0">
          <span>Avg Mana: <strong className="text-cyan-300">{avgMana}</strong></span>
          <span>ATK: <strong className="text-red-400">{totalDeckAtk}</strong></span>
          <span>HP: <strong className="text-emerald-400">{totalDeckHp}</strong></span>
        </div>
      </div>

      {/* RIGHT PANEL: CARD VAULT / FUSION ALTAR (64% width) */}
      <div className="flex-1 bg-gradient-to-b from-[#140e0c]/90 via-[#0a0705]/95 to-[#050403] border border-[#ebd09b]/25 rounded-xl p-2 flex flex-col justify-between shadow-xl min-w-0">
        {/* Top Control Bar: Mode Tabs + Filter Chips */}
        <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-white/10 shrink-0">
          {/* Modes: Deck Builder vs Fusion */}
          <div className="flex bg-black/60 p-0.5 rounded-lg border border-white/10">
            <button
              onClick={() => setMode('deck')}
              className={`px-2 py-0.5 rounded text-[9px] font-display font-bold uppercase transition-all cursor-pointer ${
                mode === 'deck' ? 'bg-[#ebd09b] text-black shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              COLLECTION
            </button>
            <button
              onClick={() => setMode('fusion')}
              className={`px-2 py-0.5 rounded text-[9px] font-display font-bold uppercase transition-all cursor-pointer ${
                mode === 'fusion' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              FUSION ALTAR
            </button>
          </div>

          {/* Tier Filters */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {['all', 'bronze', 'silver', 'gold', 'legendary', 'divine'].map(t => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={`px-1.5 py-0.5 rounded font-mono text-[8px] font-bold uppercase transition-all cursor-pointer ${
                  tierFilter === t 
                    ? 'bg-amber-500/30 border border-amber-400 text-amber-300' 
                    : 'bg-white/5 border border-white/5 text-gray-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area: Collection Browser vs Fusion Altar */}
        {mode === 'deck' ? (
          <div className="flex-1 overflow-y-auto no-scrollbar py-1">
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-1.5">
              {filteredCards.map((card) => {
                const isInDeck = (profile.deck || []).includes(card.id);
                return (
                  <div
                    key={card.id}
                    onClick={() => handleToggle(card.id)}
                    className={`aspect-[13/18] rounded-lg border bg-gray-950 relative overflow-hidden flex flex-col justify-between p-1 cursor-pointer transition-all active:scale-95 shadow-md ${
                      isInDeck 
                        ? 'ring-2 ring-emerald-400 border-emerald-400' 
                        : getTierColor(card.tier)
                    }`}
                  >
                    {/* Art */}
                    {card.image && (
                      <img src={card.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                    {/* Top: Mana + Info */}
                    <div className="relative z-10 flex justify-between items-center">
                      <div className="w-3.5 h-3.5 rounded-full bg-cyan-600 border border-cyan-300 flex items-center justify-center text-[7.5px] font-mono font-black text-black">
                        {card.manaCost || 1}
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setInspectCard(card); }}
                        className="text-gray-400 hover:text-white p-0.5"
                      >
                        <Info className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    {/* In Deck Badge */}
                    {isInDeck && (
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-emerald-600/90 text-black font-mono text-[7px] font-black text-center py-0.5 uppercase tracking-wider z-15">
                        IN DECK
                      </div>
                    )}

                    {/* Bottom: Name & Badges */}
                    <div className="relative z-10">
                      <span className="text-[7.5px] font-display font-black text-white truncate block leading-none mb-0.5">
                        {card.name}
                      </span>
                      <div className="flex justify-between text-[8px] font-mono font-black text-white leading-none">
                        <span className="text-red-400 bg-black/80 px-0.5 rounded">{card.attack}</span>
                        <span className="text-emerald-400 bg-black/80 px-0.5 rounded">{card.health}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* FUSION ALTAR MODE */
          <div className="flex-1 flex flex-col justify-between py-1">
            {/* 2 Fusion Slots */}
            <div className="flex items-center justify-center gap-4 my-auto">
              {/* Slot 1: Base Card */}
              <div 
                onClick={() => setFuseCard1(null)}
                className="w-20 h-28 rounded-xl border-2 border-dashed border-purple-500/50 bg-black/40 flex flex-col items-center justify-center p-1 relative cursor-pointer"
              >
                {fuseCard1 ? (
                  <div className="w-full h-full rounded-lg overflow-hidden relative flex flex-col justify-between p-1 border border-purple-400">
                    {fuseCard1.image && <img src={fuseCard1.image} alt="" className="absolute inset-0 w-full h-full object-cover" />}
                    <span className="relative z-10 text-[8px] font-display font-bold text-white truncate">{fuseCard1.name}</span>
                    <span className="relative z-10 text-[8px] font-mono text-purple-300 font-bold">Lv.{fuseCard1.level}</span>
                  </div>
                ) : (
                  <span className="text-[8px] font-mono text-purple-400 text-center uppercase font-bold">
                    Select Base Card
                  </span>
                )}
              </div>

              <div className="text-purple-400 font-black text-lg">+</div>

              {/* Slot 2: Sacrifice Card */}
              <div 
                onClick={() => setFuseCard2(null)}
                className="w-20 h-28 rounded-xl border-2 border-dashed border-purple-500/50 bg-black/40 flex flex-col items-center justify-center p-1 relative cursor-pointer"
              >
                {fuseCard2 ? (
                  <div className="w-full h-full rounded-lg overflow-hidden relative flex flex-col justify-between p-1 border border-purple-400">
                    {fuseCard2.image && <img src={fuseCard2.image} alt="" className="absolute inset-0 w-full h-full object-cover" />}
                    <span className="relative z-10 text-[8px] font-display font-bold text-white truncate">{fuseCard2.name}</span>
                    <span className="relative z-10 text-[8px] font-mono text-purple-300 font-bold">Lv.{fuseCard2.level}</span>
                  </div>
                ) : (
                  <span className="text-[8px] font-mono text-purple-400 text-center uppercase font-bold">
                    Select Duplicate
                  </span>
                )}
              </div>
            </div>

            {/* Fusion Action Button */}
            <div className="flex items-center justify-between bg-black/60 p-2 rounded-xl border border-white/10 shrink-0">
              <span className="text-[9px] font-mono text-gray-400">
                Fuse identical cards to increase level and stats!
              </span>
              <button
                onClick={handleExecuteFusion}
                disabled={!fuseCard1 || !fuseCard2 || isFusing}
                className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 disabled:opacity-40 text-white font-display font-black text-[10px] uppercase tracking-wider rounded-lg shadow-md cursor-pointer transition-all active:scale-95"
              >
                {isFusing ? 'FUSING...' : 'EVOLVE CARD'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Card Inspector Modal */}
      {inspectCard && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-[#120e0b] border-2 border-amber-500/50 rounded-2xl max-w-xs w-full p-3.5 space-y-2.5 shadow-2xl relative">
            <button onClick={() => setInspectCard(null)} className="absolute top-2.5 right-2.5 text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-12 h-16 rounded-lg border border-amber-400 overflow-hidden shrink-0 bg-black relative">
                {inspectCard.image && <img src={inspectCard.image} alt="" className="w-full h-full object-cover" />}
              </div>
              <div>
                <h4 className="font-display font-black text-sm text-white">{inspectCard.name}</h4>
                <div className="flex items-center gap-1 text-[9px] font-mono text-amber-300 mt-0.5">
                  <span className="uppercase">{inspectCard.tier}</span>
                  <span>•</span>
                  <span>Lv.{inspectCard.level}</span>
                  <span>•</span>
                  <span>💎 {inspectCard.manaCost || 1} Mana</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono font-bold mt-1">
                  <span className="text-red-400">⚔️ {inspectCard.attack} ATK</span>
                  <span className="text-emerald-400">❤️ {inspectCard.health} HP</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setInspectCard(null)}
              className="w-full py-1.5 bg-white/10 hover:bg-white/20 text-white font-display font-bold text-[10px] uppercase rounded-lg"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
