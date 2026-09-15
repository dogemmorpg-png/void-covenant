import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { useToast } from '../components/Toast';
import { Card } from '../types';
import { getCardImageUrl } from '../utils/assetPreloader';
import { getCardManaCost } from '../data/cards';
import { getCardTierStyles } from '../utils/tierStyles';

export const MobileCollectionView: React.FC = () => {
  const { profile, toggleDeckCard } = useGame();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'sanctuary' | 'deck'>('sanctuary');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const deckCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cardId of profile.deck) {
      const card = profile.collection.find(c => c.id === cardId);
      if (card) counts[card.baseId] = (counts[card.baseId] || 0) + 1;
    }
    return counts;
  }, [profile.deck, profile.collection]);

  const handleToggleDeck = (cardId: string) => {
    const res = toggleDeckCard(cardId);
    if (!res.success) toast(res.message, 'warning');
  };

  const currentList = activeTab === 'sanctuary' 
    ? profile.collection
    : profile.deck.map(id => profile.collection.find(c => c.id === id)).filter((c): c is Card => !!c);

  const selectedCard = profile.collection.find(c => c.id === selectedCardId);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-[#0c1015] text-white">
      
      {/* Top Tabs */}
      <div className="flex h-8 bg-black/60 border-b border-gray-800 shrink-0">
        <button 
          onClick={() => setActiveTab('sanctuary')}
          className={`flex-1 text-[10px] font-display font-bold uppercase tracking-wider ${activeTab === 'sanctuary' ? 'text-[#ebd09b] border-b-2 border-[#ebd09b]' : 'text-gray-500'}`}
        >
          COLLECTION ({profile.collection.length})
        </button>
        <button 
          onClick={() => setActiveTab('deck')}
          className={`flex-1 text-[10px] font-display font-bold uppercase tracking-wider ${activeTab === 'deck' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-500'}`}
        >
          DECK ({profile.deck.length}/10)
        </button>
      </div>

      <div className="flex-1 flex min-h-0">
        
        {/* Left: Card Grid 60% */}
        <div className="w-[60%] h-full p-2 overflow-y-auto custom-scrollbar border-r border-gray-800">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 pb-10">
            {currentList.map(card => {
              const inDeck = profile.deck.includes(card.id);
              const copies = deckCounts[card.baseId] || 0;
              const maxAllowed = card.tier === 'legendary' || card.tier === 'divine' ? 1 : 2;
              
              return (
                <div 
                  key={card.id + (activeTab === 'deck' ? Math.random() : '')} 
                  onClick={() => setSelectedCardId(card.id)}
                  className={`relative aspect-[3/4.2] rounded border overflow-hidden cursor-pointer ${getCardTierStyles(card.tier, selectedCardId === card.id, true)}`}
                >
                  <img src={getCardImageUrl(card)} className="absolute inset-0 w-full h-full object-cover opacity-80" />
                  <div className="absolute top-0.5 right-0.5 bg-black/80 rounded-full w-3.5 h-3.5 flex items-center justify-center text-[7px] text-[#ebd09b] font-bold">
                    L{card.level}
                  </div>
                  
                  {activeTab === 'sanctuary' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleToggleDeck(card.id); }}
                      className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold z-10 ${
                        inDeck ? 'bg-red-900 border-red-500 text-white' : 
                        copies >= maxAllowed ? 'bg-amber-900 text-amber-300' : 'bg-emerald-900 text-emerald-300'
                      }`}
                    >
                      {inDeck ? '-' : '+'}
                    </button>
                  )}
                  
                  <div className="absolute bottom-0 w-full bg-black/60 pt-0.5 px-0.5">
                    <div className="text-[6px] font-display font-bold text-center truncate leading-none">{card.name}</div>
                    <div className="flex justify-between text-[6px] font-mono mt-0.5 pb-0.5">
                      <span className="text-red-400">{card.attack}</span>
                      <span className="text-emerald-400">{card.health}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detail View 40% */}
        <div className="w-[40%] h-full p-2 flex flex-col items-center">
          {selectedCard ? (
            <div className={`w-full max-w-[120px] aspect-[3/4.2] rounded-xl border-2 relative overflow-hidden flex flex-col ${getCardTierStyles(selectedCard.tier, false, true)}`}>
              <img src={getCardImageUrl(selectedCard)} className="absolute inset-0 w-full h-full object-cover opacity-70" />
              <div className="absolute top-1 right-1 bg-black/80 rounded-full px-1 py-0.5 text-[8px] text-[#ebd09b] border border-[#c5a880]/30 font-bold">
                L{selectedCard.level}
              </div>
              <div className="absolute top-1 left-1 bg-cyan-900/80 rounded-full px-1.5 py-0.5 text-[8px] text-cyan-300 border border-cyan-500/50 font-bold">
                {getCardManaCost(selectedCard)}
              </div>
              <div className="mt-auto relative z-10 bg-black/80 p-1.5 space-y-1">
                <div className="text-[9px] font-display font-bold text-center leading-tight">{selectedCard.name}</div>
                <div className="text-[7px] text-center text-gray-400 font-mono uppercase">{selectedCard.tier}</div>
                <div className="flex justify-between text-[8px] font-mono font-bold pt-1 border-t border-white/10">
                  <span className="text-red-400">ATK {selectedCard.attack}</span>
                  <span className="text-emerald-400">HP {selectedCard.health}</span>
                </div>
                {selectedCard.skills.map((s, i) => (
                  <div key={i} className="text-[7px] text-gray-300 leading-tight">
                    <span className="text-purple-400">{s.type}:</span> {s.description}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="m-auto text-gray-500 text-[10px] uppercase font-mono">Select a card</div>
          )}
        </div>
        
      </div>
    </div>
  );
};
