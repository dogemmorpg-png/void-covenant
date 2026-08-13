import React, { useState } from 'react';
import { getCardTierStyles } from '../utils/tierStyles';
import { motion } from 'motion/react';
import { audioSystem } from '../utils/AudioSystem';
import { useGame } from '../context/GameContext';
import { useToast } from './Toast';
import { CARD_TEMPLATES, createCardInstance } from '../data/cards';
import { Card, CardTier, Equipment } from '../types';
import { getRandomEquipmentByTier, generateEquipmentInstance } from '../data/equipment';
import { Gem, Coins, Sparkles, Box, Trash2, Shield, Flame, Skull, Sword } from 'lucide-react';

export const GachaStoreView: React.FC = () => {
  const { profile, spendGold, spendShards, addCardToCollection, addEquipment, setProfile } = useGame();
  const toast = useToast();
  
  const [activeTab, setActiveTab] = useState<'cards' | 'equipment'>('cards');
  
  // Animation/Opening state
  const [openingPack, setOpeningPack] = useState<string | null>(null);
  const [revealedCards, setRevealedCards] = useState<Card[]>([]);
  const [revealedEquipment, setRevealedEquipment] = useState<Equipment[]>([]);
  const [isRevealed, setIsRevealed] = useState(false);

  // Buy Bronze Pack (costs 300 Gold)
  const buyBronzePack = () => buyPackBackend('bronze');

  // Buy Obsidian Pack (costs 30 Shards)
  const buyObsidianPack = () => buyPackBackend('obsidian');

  // Buy Abyssal Pack (costs 70 Shards)
  const buyAbyssalPack = () => buyPackBackend('abyssal');

  // Run pack animation
  const triggerOpeningAnimationBackend = (packType: string, newCards: any[], newEquipment: any[]) => {
    audioSystem.playMagic();
    setOpeningPack(packType as any);
    setRevealedCards(newCards);
    setRevealedEquipment(newEquipment);
    setIsRevealed(false);
    setTimeout(() => setIsRevealed(true), 1500);
  };

  const buyPackBackend = async (packType: string, isEquipment: boolean = false) => {
    try {
      const token = localStorage.getItem('void_covenant_token');
      if (token) {
        const res = await fetch('/api/gacha', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ packType, numCards: 3 })
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.profile) setProfile(data.profile);
          if (isEquipment) {
            triggerOpeningAnimationBackend(packType, [], data.newItems || []);
          } else {
            triggerOpeningAnimationBackend(packType, data.newItems || [], []);
          }
          return;
        }
      }
    } catch (err: any) {
      console.warn('Server gacha failed, using local purchase fallback', err);
    }

    // Local Gacha Purchase Fallback (100% Guaranteed)
    if (packType === 'bronze') {
      if (!spendGold(300)) {
        toast('Not enough Gold (300 needed)', 'warning');
        return;
      }
      const newCards = [
        addCardToCollection(CARD_TEMPLATES[Math.floor(Math.random() * CARD_TEMPLATES.length)]),
        addCardToCollection(CARD_TEMPLATES[Math.floor(Math.random() * CARD_TEMPLATES.length)]),
        addCardToCollection(CARD_TEMPLATES[Math.floor(Math.random() * CARD_TEMPLATES.length)])
      ];
      triggerOpeningAnimationBackend(packType, newCards, []);
    } else if (packType === 'obsidian') {
      if (!spendShards(30)) {
        toast('Not enough Dark Shards (30 needed)', 'warning');
        return;
      }
      const newCards = [
        addCardToCollection(CARD_TEMPLATES[Math.floor(Math.random() * CARD_TEMPLATES.length)], 2),
        addCardToCollection(CARD_TEMPLATES[Math.floor(Math.random() * CARD_TEMPLATES.length)]),
        addCardToCollection(CARD_TEMPLATES[Math.floor(Math.random() * CARD_TEMPLATES.length)])
      ];
      triggerOpeningAnimationBackend(packType, newCards, []);
    } else if (packType === 'abyssal') {
      if (!spendShards(70)) {
        toast('Not enough Dark Shards (70 needed)', 'warning');
        return;
      }
      const newCards = [
        addCardToCollection(CARD_TEMPLATES[Math.floor(Math.random() * CARD_TEMPLATES.length)], 2),
        addCardToCollection(CARD_TEMPLATES[Math.floor(Math.random() * CARD_TEMPLATES.length)], 2),
        addCardToCollection(CARD_TEMPLATES[Math.floor(Math.random() * CARD_TEMPLATES.length)])
      ];
      triggerOpeningAnimationBackend(packType, newCards, []);
    } else if (packType === 'eq_basic') {
      if (!spendGold(500)) {
        toast('Not enough Gold (500 needed)', 'warning');
        return;
      }
      const eq = generateEquipmentInstance(getRandomEquipmentByTier('Common'));
      addEquipment(eq);
      triggerOpeningAnimationBackend(packType, [], [eq]);
    } else if (packType === 'eq_rare') {
      if (!spendShards(25)) {
        toast('Not enough Dark Shards (25 needed)', 'warning');
        return;
      }
      const eq = generateEquipmentInstance(getRandomEquipmentByTier('Rare'));
      addEquipment(eq);
      triggerOpeningAnimationBackend(packType, [], [eq]);
    } else if (packType === 'eq_premium') {
      if (!spendShards(60)) {
        toast('Not enough Dark Shards (60 needed)', 'warning');
        return;
      }
      const eq = generateEquipmentInstance(getRandomEquipmentByTier('Epic'));
      addEquipment(eq);
      triggerOpeningAnimationBackend(packType, [], [eq]);
    }
  };

  // Equipment Packs
  const buyBasicEquipmentPack = () => buyPackBackend('eq_basic', true);
  const buyRareEquipmentPack = () => buyPackBackend('eq_rare', true);
  const buyPremiumEquipmentPack = () => buyPackBackend('eq_premium', true);

  // Close reveal dialog
  const closeReveal = () => {
    setOpeningPack(null);
    setRevealedCards([]);
    setRevealedEquipment([]);
    setIsRevealed(false);
  };

  const getPackHeaderStyles = (type: string) => {
    if (type === 'bronze') return 'from-amber-950 to-amber-900 border-amber-800';
    if (type === 'obsidian') return 'from-slate-900 to-indigo-950 border-indigo-900 gothic-glow-blue';
    return 'from-purple-950 to-[#4e0707] border-red-900 gothic-glow-purple';
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-8">
      
      {/* Intro Header */}
      <div className="text-center space-y-2">
        <h2 className="font-display font-black text-2xl text-white tracking-widest text-shadow-gold flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-[#ebd09b] animate-pulse" /> SUMMONING ALTAR & VAULT
        </h2>
        <p className="text-xs text-gray-400 font-sans max-w-lg mx-auto">
          Offer dark shards and gold to summon abyss entities or craft legendary artifacts for your Lord.
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex justify-center">
        <div className="bg-[#151a21] border border-gray-800 p-1 rounded-2xl flex gap-1 shadow-lg">
          <button
            onClick={() => {
              audioSystem.playClick();
              setActiveTab('cards');
            }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-display text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'cards'
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-black shadow-md'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Sparkles className="w-4 h-4" /> ENTITY CARDS
          </button>
          <button
            onClick={() => {
              audioSystem.playClick();
              setActiveTab('equipment');
            }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-display text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'equipment'
                ? 'bg-gradient-to-r from-[#66fcf1] to-teal-400 text-black shadow-md'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Shield className="w-4 h-4" /> ARTIFACT EQUIPMENT
          </button>
        </div>
      </div>

      {/* Cards Tab */}
      {activeTab === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Bronze Pack */}
          <div className="bg-[#151a21] border border-[#c5a880]/30 rounded-3xl p-6 flex flex-col justify-between shadow-xl hover:border-[#c5a880]/60 transition-all group relative overflow-hidden">
            <div className="space-y-4">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-amber-900/50 bg-black/60 relative flex items-center justify-center p-4">
                <img 
                  src="/packs/pack_bronze.png" 
                  alt="Bronze Pack" 
                  className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(245,158,11,0.3)] group-hover:scale-105 transition-transform" 
                />
              </div>
              
              <div>
                <span className="text-[10px] text-amber-500 font-mono font-bold uppercase tracking-wider block">Standard Summon</span>
                <h3 className="font-display font-bold text-lg text-white">BRONZE COVENANT PACK</h3>
                <p className="text-xs text-gray-400 font-sans mt-1">
                  Contains 3 cards with high chance for Common & Silver entities.
                </p>
              </div>

              <div className="space-y-1 font-mono text-[10px] text-gray-400 border-t border-gray-800/80 pt-3">
                <div className="flex justify-between"><span>Common Tier:</span> <span className="text-gray-200 font-bold">75%</span></div>
                <div className="flex justify-between"><span>Silver Tier:</span> <span className="text-amber-400 font-bold">20%</span></div>
                <div className="flex justify-between"><span>Gold Tier:</span> <span className="text-[#66fcf1] font-bold">5%</span></div>
              </div>
            </div>

            <button
              onClick={buyBronzePack}
              className="mt-6 w-full bg-[#ebd09b] hover:bg-[#c5a880] text-black font-display font-black py-3 rounded-xl text-xs tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              SUMMON (300 <img src="/icons/icon_gold.png" alt="Gold" className="w-5 h-5 inline" />)
            </button>
          </div>

          {/* Obsidian Pack */}
          <div className="bg-[#151a21] border border-indigo-900/50 rounded-3xl p-6 flex flex-col justify-between shadow-xl hover:border-indigo-500/60 transition-all group relative overflow-hidden gothic-glow-blue">
            <div className="space-y-4">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-indigo-900/50 bg-black/60 relative flex items-center justify-center p-4">
                <img 
                  src="/packs/pack_obsidian.png" 
                  alt="Obsidian Pack" 
                  className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(99,102,241,0.4)] group-hover:scale-105 transition-transform" 
                />
              </div>

              <div>
                <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-wider block">Rare Vault</span>
                <h3 className="font-display font-bold text-lg text-white">OBSIDIAN COVENANT PACK</h3>
                <p className="text-xs text-gray-400 font-sans mt-1">
                  Guarantees at least 1 Silver or Gold entity card. 30% chance for Level 2 card!
                </p>
              </div>

              <div className="space-y-1 font-mono text-[10px] text-gray-400 border-t border-gray-800/80 pt-3">
                <div className="flex justify-between"><span>Silver Tier:</span> <span className="text-amber-400 font-bold">60%</span></div>
                <div className="flex justify-between"><span>Gold Tier:</span> <span className="text-[#66fcf1] font-bold">35%</span></div>
                <div className="flex justify-between"><span>Legendary Tier:</span> <span className="text-purple-400 font-bold">5%</span></div>
              </div>
            </div>

            <button
              onClick={buyObsidianPack}
              className="mt-6 w-full bg-gradient-to-r from-indigo-900 to-slate-900 hover:from-indigo-700 hover:to-slate-800 text-[#66fcf1] border border-[#66fcf1]/40 font-display font-black py-3 rounded-xl text-xs tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              SUMMON (30 <img src="/icons/icon_shards.png" alt="Shards" className="w-4 h-4 inline ml-1" />)
            </button>
          </div>

          {/* Abyssal Pack */}
          <div className="bg-[#151a21] border border-purple-900/50 rounded-3xl p-6 flex flex-col justify-between shadow-xl hover:border-purple-500/60 transition-all group relative overflow-hidden gothic-glow-purple">
            <div className="space-y-4">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-purple-900/50 bg-black/60 relative flex items-center justify-center p-4">
                <img 
                  src="/packs/pack_abyssal.png" 
                  alt="Abyssal Pack" 
                  className="w-full h-full object-contain drop-shadow-[0_0_25px_rgba(168,85,247,0.5)] group-hover:scale-105 transition-transform" 
                />
              </div>

              <div>
                <span className="text-[10px] text-purple-400 font-mono font-bold uppercase tracking-wider block">Legendary Relic</span>
                <h3 className="font-display font-bold text-lg text-white">ABYSSAL COVENANT PACK</h3>
                <p className="text-xs text-gray-400 font-sans mt-1">
                  High rate for Legendary & Gold entities. Guaranteed Level 2 card chance!
                </p>
              </div>

              <div className="space-y-1 font-mono text-[10px] text-gray-400 border-t border-gray-800/80 pt-3">
                <div className="flex justify-between"><span>Silver Tier:</span> <span className="text-amber-400 font-bold">40%</span></div>
                <div className="flex justify-between"><span>Gold Tier:</span> <span className="text-[#66fcf1] font-bold">45%</span></div>
                <div className="flex justify-between"><span>Legendary Tier:</span> <span className="text-purple-400 font-bold">15%</span></div>
              </div>
            </div>

            <button
              onClick={buyAbyssalPack}
              className="mt-6 w-full bg-gradient-to-r from-purple-900 to-indigo-950 hover:from-purple-700 hover:to-indigo-800 text-purple-200 border border-purple-400/40 font-display font-black py-3 rounded-xl text-xs tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              SUMMON (70 <img src="/icons/icon_shards.png" alt="Shards" className="w-4 h-4 inline ml-1" />)
            </button>
          </div>

        </div>
      )}

      {/* Equipment Tab */}
      {activeTab === 'equipment' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Basic Chest */}
          <div className="bg-[#151a21] border border-gray-800 rounded-3xl p-6 flex flex-col justify-between shadow-xl hover:border-gray-700 transition-all group">
            <div className="space-y-4">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-gray-800 bg-black/60 relative flex items-center justify-center p-4">
                <img 
                  src="/packs/chest_basic.png" 
                  alt="Basic Chest" 
                  className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover:scale-105 transition-transform" 
                />
              </div>

              <div>
                <span className="text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider block font-bold">Common Chest</span>
                <h3 className="font-display font-bold text-lg text-white">IRON ARTIFACT CHEST</h3>
                <p className="text-xs text-gray-400 font-sans mt-1">
                  Crafts 1 Common equipment piece (Weapons, Helmets, Armor, Rings).
                </p>
              </div>
            </div>

            <button
              onClick={buyBasicEquipmentPack}
              className="mt-6 w-full bg-gray-800 hover:bg-gray-700 text-gray-200 font-display font-black py-3 rounded-xl text-xs tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              OPEN (500 <img src="/icons/icon_gold.png" alt="Gold" className="w-5 h-5 inline" />)
            </button>
          </div>

          {/* Rare Chest */}
          <div className="bg-[#151a21] border border-cyan-900/50 rounded-3xl p-6 flex flex-col justify-between shadow-xl hover:border-cyan-500/60 transition-all group gothic-glow-blue">
            <div className="space-y-4">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-cyan-900/50 bg-black/60 relative flex items-center justify-center p-4">
                <img 
                  src="/packs/chest_rare.png" 
                  alt="Rare Chest" 
                  className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:scale-105 transition-transform" 
                />
              </div>

              <div>
                <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase tracking-wider block font-bold">Rare Chest</span>
                <h3 className="font-display font-bold text-lg text-white">RUNIC ARTIFACT CHEST</h3>
                <p className="text-xs text-gray-400 font-sans mt-1">
                  Crafts 1 Rare equipment piece with enhanced Lord stat bonuses.
                </p>
              </div>
            </div>

            <button
              onClick={buyRareEquipmentPack}
              className="mt-6 w-full bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 font-display font-black py-3 rounded-xl text-xs tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              OPEN (25 <img src="/icons/icon_shards.png" alt="Shards" className="w-4 h-4 inline ml-1" />)
            </button>
          </div>

          {/* Premium Chest */}
          <div className="bg-[#151a21] border border-amber-900/50 rounded-3xl p-6 flex flex-col justify-between shadow-xl hover:border-amber-500/60 transition-all group gothic-glow-purple">
            <div className="space-y-4">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-amber-900/50 bg-black/60 relative flex items-center justify-center p-4">
                <img 
                  src="/packs/chest_premium.png" 
                  alt="Premium Chest" 
                  className="w-full h-full object-contain drop-shadow-[0_0_25px_rgba(245,158,11,0.5)] group-hover:scale-105 transition-transform" 
                />
              </div>

              <div>
                <span className="text-[10px] text-amber-400 font-mono font-bold uppercase tracking-wider block font-bold">Epic Vault</span>
                <h3 className="font-display font-bold text-lg text-white">DRAGON ARTIFACT CHEST</h3>
                <p className="text-xs text-gray-400 font-sans mt-1">
                  Crafts 1 Epic equipment piece with massive Hero HP, Mana & Stat bonuses.
                </p>
              </div>
            </div>

            <button
              onClick={buyPremiumEquipmentPack}
              className="mt-6 w-full bg-gradient-to-r from-amber-950 to-amber-900 hover:from-amber-800 hover:to-amber-700 text-amber-200 border border-amber-500/40 font-display font-black py-3 rounded-xl text-xs tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              OPEN (60 <img src="/icons/icon_shards.png" alt="Shards" className="w-4 h-4 inline ml-1" />)
            </button>
          </div>

        </div>
      )}

      {/* Pack Reveal Overlay Dialog */}
      {openingPack && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-50 p-4">
          <div className="max-w-3xl w-full text-center space-y-6">
            
            {!isRevealed ? (
              <div className="flex flex-col items-center gap-6 py-12">
                <div className="w-24 h-24 rounded-full border-4 border-amber-500 border-t-transparent animate-spin flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.5)]">
                  <Sparkles className="w-10 h-10 text-amber-400 animate-pulse" />
                </div>
                <h3 className="font-display font-black text-xl text-white tracking-widest animate-pulse">
                  SUMMONING ENTITIES FROM THE VOID...
                </h3>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <h3 className="font-display font-black text-2xl text-white tracking-widest text-shadow-gold">
                  SUMMON REVEALED!
                </h3>

                {/* Cards Reveal */}
                {revealedCards.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {revealedCards.map((card, idx) => {
                      const tierStyles = getCardTierStyles(card.tier);
                      return (
                        <motion.div
                          key={card.id || idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.2 }}
                          className={`bg-[#151a21] border ${tierStyles.border} rounded-2xl p-4 space-y-3 relative overflow-hidden ${tierStyles.glow}`}
                        >
                          <div className="aspect-[4/3] rounded-xl overflow-hidden bg-black/60 relative">
                            <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
                            <div className="absolute top-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-amber-400 border border-amber-500/30">
                              Lvl {card.level || 1}
                            </div>
                          </div>

                          <div className="text-left">
                            <span className={`text-[9px] font-mono font-bold uppercase tracking-wider block ${tierStyles.text}`}>
                              {card.tier} Tier
                            </span>
                            <h4 className="font-display font-bold text-sm text-white truncate">{card.name}</h4>
                            <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 mt-1">
                              <span className="text-red-400 flex items-center gap-0.5"><Sword className="w-3 h-3" /> {card.attack} ATK</span>
                              <span className="text-emerald-400 flex items-center gap-0.5"><Flame className="w-3 h-3" /> {card.health} HP</span>
                              <span className="text-cyan-400 flex items-center gap-0.5"><Gem className="w-3 h-3" /> {card.manaCost} MANA</span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {/* Equipment Reveal */}
                {revealedEquipment.length > 0 && (
                  <div className="flex justify-center">
                    {revealedEquipment.map((item, idx) => (
                      <motion.div
                        key={item.id || idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#151a21] border border-cyan-500/50 rounded-2xl p-6 space-y-3 max-w-sm w-full gothic-glow-blue"
                      >
                        <div className="w-20 h-20 mx-auto rounded-xl bg-black/60 border border-cyan-500/30 p-2 flex items-center justify-center">
                          <img src={item.icon} alt={item.name} className="w-full h-full object-contain" />
                        </div>

                        <div className="text-center space-y-1">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 block">
                            {item.rarity} {item.slot.toUpperCase()}
                          </span>
                          <h4 className="font-display font-bold text-lg text-white">{item.name}</h4>
                          <p className="text-xs text-emerald-400 font-mono font-bold">
                            +{item.bonusValue}% {item.bonusType.replace(/([AZ])/g, ' $1').toUpperCase()}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                <button
                  onClick={closeReveal}
                  className="bg-[#ebd09b] hover:bg-[#c5a880] text-black font-display font-black py-3 px-8 rounded-xl text-xs tracking-wider transition-all cursor-pointer shadow-lg"
                >
                  CLAIM ALL REWARDS
                </button>
              </motion.div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
