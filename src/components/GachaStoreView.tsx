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
  const { profile, spendGold, spendShards, addCardToCollection, addEquipment } = useGame();
  const toast = useToast();
  
  const [activeTab, setActiveTab] = useState<'cards' | 'equipment'>('cards');
  
  // Animation/Opening state
  const [openingPack, setOpeningPack] = useState<string | null>(null); // 'bronze' | 'obsidian' | 'abyssal' | 'eq_basic' | 'eq_premium' | null
  const [revealedCards, setRevealedCards] = useState<Card[]>([]);
  const [revealedEquipment, setRevealedEquipment] = useState<Equipment[]>([]);
  const [isRevealed, setIsRevealed] = useState(false);

  // Buy Bronze Pack (costs 300 Gold)
  const buyBronzePack = () => {
    if (spendGold(300)) {
      triggerOpeningAnimation('bronze', 3);
    } else {
      toast('Not enough gold! Complete Campaign missions or exchange shards.', 'warning');
    }
  };

  // Buy Obsidian Pack (costs 30 Shards)
  const buyObsidianPack = () => {
    if (spendShards(30)) {
      triggerOpeningAnimation('obsidian', 3);
    } else {
      toast('Not enough Dark Shards! Connect Solana wallet, complete airdrop tasks, or buy shards.', 'warning');
    }
  };

  // Buy Abyssal Pack (costs 70 Shards)
  const buyAbyssalPack = () => {
    if (spendShards(70)) {
      triggerOpeningAnimation('abyssal', 3);
    } else {
      toast('Not enough Dark Shards! Top up Solana balance and make a purchase.', 'warning');
    }
  };

  // Run pack animation
  const triggerOpeningAnimation = (packType: 'bronze' | 'obsidian' | 'abyssal', numCards: number) => {
    audioSystem.playMagic();
    setOpeningPack(packType);
    setRevealedCards([]);
    setIsRevealed(false);

    // Pick random cards based on pool
    const pool = CARD_TEMPLATES;
    let selectedTemplates: any[] = [];

    for (let i = 0; i < numCards; i++) {
      let rand = Math.random() * 100;
      let cardTemplate;

      if (packType === 'bronze') {
        // 95% Bronze, 5% Silver
        if (rand < 95) {
          const bronzePool = pool.filter(c => c.tier === 'bronze');
          cardTemplate = bronzePool[Math.floor(Math.random() * bronzePool.length)];
        } else {
          const silverPool = pool.filter(c => c.tier === 'silver');
          cardTemplate = silverPool[Math.floor(Math.random() * silverPool.length)];
        }
      } else if (packType === 'obsidian') {
        // 40% Bronze (L2-3), 50% Silver, 10% Gold
        if (rand < 40) {
          const bronzePool = pool.filter(c => c.tier === 'bronze');
          cardTemplate = bronzePool[Math.floor(Math.random() * bronzePool.length)];
        } else if (rand < 90) {
          const silverPool = pool.filter(c => c.tier === 'silver');
          cardTemplate = silverPool[Math.floor(Math.random() * silverPool.length)];
        } else {
          const goldPool = pool.filter(c => c.tier === 'gold');
          cardTemplate = goldPool[Math.floor(Math.random() * goldPool.length)];
        }
      } else {
        // Abyssal: 40% Silver, 45% Gold, 15% Legendary
        if (rand < 40) {
          const silverPool = pool.filter(c => c.tier === 'silver');
          cardTemplate = silverPool[Math.floor(Math.random() * silverPool.length)];
        } else if (rand < 85) {
          const goldPool = pool.filter(c => c.tier === 'gold');
          cardTemplate = goldPool[Math.floor(Math.random() * goldPool.length)];
        } else {
          const legendaryPool = pool.filter(c => c.tier === 'legendary');
          cardTemplate = legendaryPool[Math.floor(Math.random() * legendaryPool.length)];
        }
      }

      // Roll level (bronze pack has level 1, obsidian/abyssal can roll level 1 to 2)
      let rollLevel = 1;
      if (packType === 'obsidian' && Math.random() < 0.3) rollLevel = 2;
      if (packType === 'abyssal' && Math.random() < 0.4) rollLevel = 2;

      // Add to collection in context and save in state
      const newCardInstance = addCardToCollection(cardTemplate, rollLevel);
      selectedTemplates.push(newCardInstance);
    }

    setRevealedCards(selectedTemplates);

    // Delay visual reveal steps
    setTimeout(() => {
      setIsRevealed(true);
    }, 1500);
  };

  // Equipment Packs
  const buyBasicEquipmentPack = () => {
    if (spendGold(500)) {
      triggerEquipmentOpening('eq_basic');
    } else {
      toast('Not enough gold for a Basic Equipment Chest.', 'warning');
    }
  };

  const buyRareEquipmentPack = () => {
    if (spendShards(30)) {
      triggerEquipmentOpening('eq_rare');
    } else {
      toast('Not enough Dark Shards for a Rare Equipment Chest.', 'warning');
    }
  };

  const buyPremiumEquipmentPack = () => {
    if (spendShards(70)) {
      triggerEquipmentOpening('eq_premium');
    } else {
      toast('Not enough Dark Shards for a Premium Equipment Chest.', 'warning');
    }
  };

  const triggerEquipmentOpening = (packType: 'eq_basic' | 'eq_rare' | 'eq_premium') => {
    audioSystem.playMagic();
    setOpeningPack(packType);
    setRevealedCards([]);
    setRevealedEquipment([]);
    setIsRevealed(false);

    let tier: CardTier = 'bronze';
    const rand = Math.random() * 100;
    
    if (packType === 'eq_basic') {
      // 80% Bronze, 20% Silver
      tier = rand < 80 ? 'bronze' : 'silver';
    } else if (packType === 'eq_rare') {
      // 40% Bronze, 50% Silver, 10% Gold
      if (rand < 40) tier = 'bronze';
      else if (rand < 90) tier = 'silver';
      else tier = 'gold';
    } else {
      // Premium: 40% Silver, 45% Gold, 15% Legendary
      if (rand < 40) tier = 'silver';
      else if (rand < 85) tier = 'gold';
      else tier = 'legendary';
    }

    const template = getRandomEquipmentByTier(tier);
    const instance = generateEquipmentInstance(template);
    addEquipment(instance);
    setRevealedEquipment([instance]);

    setTimeout(() => {
      setIsRevealed(true);
    }, 1500);
  };

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
      
      {/* Intro header */}
      <div className="text-center space-y-4">
        <h2 className="font-display font-black text-3xl md:text-4xl text-white tracking-widest text-shadow-gold">
          SUMMONING PORTAL
        </h2>
        <p className="text-sm text-gray-400 font-sans max-w-xl mx-auto">
          Offer your accumulated gold and dark shards to the ancient altars. 
          The abyss will answer with new entities for your army or powerful relics for your lord.
        </p>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mt-6">
          <button onMouseEnter={() => audioSystem.playHover()} onClick={() => { audioSystem.playClick(); setActiveTab('cards'); }}
            className={`px-6 py-2 font-display font-black tracking-widest transition-all rounded-xl border ${
              activeTab === 'cards' 
                ? 'bg-[#c5a880] text-black border-[#ebd09b] shadow-[0_0_15px_rgba(235,208,155,0.4)]' 
                : 'bg-black/50 text-gray-500 border-gray-800 hover:text-[#ebd09b]'
            }`}
          >
            CARDS
          </button>
          <button onMouseEnter={() => audioSystem.playHover()} onClick={() => { audioSystem.playClick(); setActiveTab('equipment'); }}
            className={`px-6 py-2 font-display font-black tracking-widest transition-all rounded-xl border ${
              activeTab === 'equipment' 
                ? 'bg-purple-900 text-white border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                : 'bg-black/50 text-gray-500 border-gray-800 hover:text-purple-400'
            }`}
          >
            EQUIPMENT
          </button>
        </div>
      </div>

      {activeTab === 'cards' ? (
        /* Packs Grid */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          
          {/* Bronze Pack */}
          <div className="bg-[#151a21] border border-amber-900/30 rounded-2xl p-5 flex flex-col justify-between hover:-translate-y-1 transition-all shadow-xl">
            <div className="space-y-4">
              <div className="h-44 rounded-xl bg-gradient-to-b from-amber-950/20 to-black/50 border border-amber-900/10 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(197,168,128,0.1),transparent_70%)]" />
                <img src="/packs/pack_bronze.png" alt="Bronze Pack" className="w-32 h-32 object-contain hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(197,168,128,0.4)]" />
                <span className="font-display font-black text-sm text-amber-500 mt-2 tracking-widest uppercase">BRONZE PACK</span>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-display font-bold text-sm text-white">Bronze Booster</h4>
                <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                  Great way to collect basic duplicates for fusion. Contains 3 random cards.
                </p>
                <ul className="text-[10px] font-mono text-gray-500 space-y-1">
                  <li>• Chance of common cards (Bronze): 95%</li>
                  <li>• Chance of rare cards (Silver): 5%</li>
                  <li>• Card level: 1 Lvl guaranteed</li>
                </ul>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={buyBronzePack}
                className="w-full bg-[#c5a880] hover:bg-[#ebd09b] text-black font-display font-black tracking-widest py-2.5 px-4 rounded-xl transition-all shadow flex items-center justify-center gap-2 text-xs"
              >
                <img src="/icons/icon_gold.png" alt="Gold" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-8 h-8 object-contain " /> BUY FOR 300 <img src="/icons/icon_gold.png" alt="Gold" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" />
              </button>
            </div>
          </div>

          {/* Obsidian Pack */}
          <div className="bg-[#151a21] border border-indigo-950 rounded-2xl p-5 flex flex-col justify-between hover:-translate-y-1 transition-all shadow-xl gothic-glow-blue">
            <div className="space-y-4">
              <div className="h-44 rounded-xl bg-gradient-to-b from-indigo-950/20 to-black/50 border border-indigo-900/10 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(102,252,241,0.15),transparent_70%)]" />
                <img src="/packs/pack_obsidian.png" alt="Obsidian Pack" className="w-32 h-32 object-contain hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(102,252,241,0.4)]" />
                <span className="font-display font-black text-sm text-[#66fcf1] mt-2 tracking-widest uppercase text-shadow-gold">OBSIDIAN PACK</span>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-display font-bold text-sm text-white">Obsidian Set</h4>
                <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                  Rare abyss blessings. Increased chances of finding level 2 silver and gold entities.
                </p>
                <ul className="text-[10px] font-mono text-gray-500 space-y-1">
                  <li>• Chance of silver cards (Silver): 50%</li>
                  <li>• Chance of gold cards (Gold): 10%</li>
                  <li>• Card level: chance to get 2 Lvl card (30%)</li>
                </ul>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={buyObsidianPack}
                className="w-full bg-gradient-to-r from-indigo-900 to-[#1f2833] hover:from-[#45a29e] hover:to-indigo-900 text-[#66fcf1] border border-[#66fcf1]/30 font-display font-black tracking-widest py-2.5 px-4 rounded-xl transition-all shadow flex items-center justify-center gap-2 text-xs"
              >
                <img src="/icons/icon_shards.png" alt="Shards" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-8 h-8 object-contain " /> SUMMON FOR 30 <img src="/icons/icon_shards.png" alt="Shards" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" />
              </button>
            </div>
          </div>

          {/* Abyssal Pack */}
          <div className="bg-[#151a21] border border-red-950 rounded-2xl p-5 flex flex-col justify-between hover:-translate-y-1 transition-all shadow-xl gothic-glow-purple">
            <div className="space-y-4">
              <div className="h-44 rounded-xl bg-gradient-to-b from-red-950/20 to-black/50 border border-red-900/10 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(221,44,64,0.15),transparent_70%)]" />
                <img src="/packs/pack_abyssal.png" alt="Abyssal Pack" className="w-32 h-32 object-contain hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(221,44,64,0.4)]" />
                <span className="font-display font-black text-sm text-[#dd2c40] mt-2 tracking-widest uppercase text-shadow-crimson">ABYSSAL PACK</span>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-display font-bold text-sm text-white">Abyssal Lord Pack</h4>
                <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                  Supreme worship of Darkness. Guaranteed to drop only rare, gold, and legendary entities.
                </p>
                <ul className="text-[10px] font-mono text-gray-500 space-y-1">
                  <li>• Chance of gold cards (Gold): 45%</li>
                  <li>• Chance of LEGENDARY cards: 15%</li>
                  <li>• Card level: chance to get 2 Lvl card (40%)</li>
                </ul>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={buyAbyssalPack}
                className="w-full bg-gradient-to-r from-[#880d1e] to-[#4e0707] hover:from-[#dd2c40] hover:to-[#880d1e] text-white border border-[#dd2c40]/30 font-display font-black tracking-widest py-2.5 px-4 rounded-xl transition-all shadow flex items-center justify-center gap-2 text-xs"
              >
                <img src="/icons/icon_shards.png" alt="Shards" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-8 h-8 object-contain " /> SUMMON FOR 70 <img src="/icons/icon_shards.png" alt="Shards" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Basic Equipment Pack */}
          <div className="bg-[#151a21] border border-[#c5a880]/30 rounded-2xl p-5 flex flex-col justify-between hover:-translate-y-1 transition-all shadow-xl">
            <div className="space-y-4">
              <div className="h-44 rounded-xl bg-gradient-to-b from-[#4a3f35] to-black/50 border border-[#c5a880]/10 flex flex-col items-center justify-center relative overflow-hidden">
                <img src="/packs/chest_basic.png" alt="Basic Relics" className="w-32 h-32 object-contain hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(197,168,128,0.4)]" />
                <span className="font-display font-black text-sm text-[#ebd09b] mt-2 tracking-widest uppercase">BASIC RELICS</span>
              </div>
              <div className="space-y-2">
                <h4 className="font-display font-bold text-sm text-white">Basic Equipment Chest</h4>
                <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                  Basic items for your lord. Grants 1 random piece of equipment.
                </p>
                <ul className="text-[10px] font-mono text-gray-500 space-y-1">
                  <li>• Bronze Equipment: 80%</li>
                  <li>• Silver Equipment: 20%</li>
                </ul>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={buyBasicEquipmentPack}
                className="w-full bg-[#1f2833] hover:bg-[#2b3746] text-[#ebd09b] border border-[#c5a880]/30 font-display font-black tracking-widest py-2.5 px-4 rounded-xl transition-all shadow flex items-center justify-center gap-2 text-xs"
              >
                <img src="/icons/icon_gold.png" alt="Gold" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-8 h-8 object-contain " /> OPEN FOR 500 <img src="/icons/icon_gold.png" alt="Gold" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" />
              </button>
            </div>
          </div>

          {/* Rare Equipment Pack */}
          <div className="bg-[#151a21] border border-indigo-950 rounded-2xl p-5 flex flex-col justify-between hover:-translate-y-1 transition-all shadow-xl gothic-glow-blue">
            <div className="space-y-4">
              <div className="h-44 rounded-xl bg-gradient-to-b from-indigo-950/20 to-black/50 border border-indigo-900/10 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(102,252,241,0.15),transparent_70%)]" />
                <img src="/packs/chest_rare.png" alt="Rare Relics" className="w-32 h-32 object-contain hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(102,252,241,0.4)]" />
                <span className="font-display font-black text-sm text-[#66fcf1] mt-2 tracking-widest uppercase text-shadow-gold">RARE RELICS</span>
              </div>
              <div className="space-y-2">
                <h4 className="font-display font-bold text-sm text-white">Rare Equipment Chest</h4>
                <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                  Better chance for stronger relics. Grants 1 rare piece of equipment.
                </p>
                <ul className="text-[10px] font-mono text-gray-500 space-y-1">
                  <li>• Bronze Equipment: 40%</li>
                  <li>• Silver Equipment: 50%</li>
                  <li>• Gold Equipment: 10%</li>
                </ul>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={buyRareEquipmentPack}
                className="w-full bg-gradient-to-r from-indigo-900 to-[#1f2833] hover:from-[#45a29e] hover:to-indigo-900 text-[#66fcf1] border border-[#66fcf1]/30 font-display font-black tracking-widest py-2.5 px-4 rounded-xl transition-all shadow flex items-center justify-center gap-2 text-xs"
              >
                <img src="/icons/icon_shards.png" alt="Shards" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-8 h-8 object-contain " /> OPEN FOR 30 <img src="/icons/icon_shards.png" alt="Shards" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" />
              </button>
            </div>
          </div>

          {/* Premium Equipment Pack */}
          <div className="bg-[#151a21] border border-red-950 rounded-2xl p-5 flex flex-col justify-between hover:-translate-y-1 transition-all shadow-xl gothic-glow-purple">
            <div className="space-y-4">
              <div className="h-44 rounded-xl bg-gradient-to-b from-red-950/40 to-black/50 border border-red-500/20 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(221,44,64,0.15),transparent_70%)]" />
                <img src="/packs/chest_premium.png" alt="Premium Relics" className="w-32 h-32 object-contain hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(221,44,64,0.4)]" />
                <span className="font-display font-black text-sm text-[#dd2c40] mt-2 tracking-widest uppercase text-shadow-crimson">PREMIUM RELICS</span>
              </div>
              <div className="space-y-2">
                <h4 className="font-display font-bold text-sm text-white">Premium Equipment Chest</h4>
                <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                  Contains ancient artifacts of immense power. Grants 1 high-tier equipment.
                </p>
                <ul className="text-[10px] font-mono text-gray-500 space-y-1">
                  <li>• Silver Equipment: 40%</li>
                  <li>• Gold Equipment: 45%</li>
                  <li>• Legendary Equipment: 15%</li>
                </ul>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={buyPremiumEquipmentPack}
                className="w-full bg-gradient-to-r from-[#880d1e] to-[#4e0707] hover:from-[#dd2c40] hover:to-[#880d1e] text-white border border-[#dd2c40]/30 font-display font-black tracking-widest py-2.5 px-4 rounded-xl transition-all shadow flex items-center justify-center gap-2 text-xs"
              >
                <img src="/icons/icon_shards.png" alt="Shards" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-8 h-8 object-contain " /> OPEN FOR 70 <img src="/icons/icon_shards.png" alt="Shards" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Opening Reveal Animation Overlay */}
      {openingPack && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="max-w-3xl w-full text-center space-y-8">
            
            {!isRevealed ? (
              /* Phase 1: Shaking Box/Altar Portal Summoning animation */
              <div className="space-y-4">
                <div className="w-32 h-32 mx-auto rounded-full bg-black border border-[#c5a880]/30 flex items-center justify-center relative shadow-2xl animate-bounce">
                  <div className="absolute inset-0 rounded-full border-t border-b border-t-[#66fcf1] border-b-[#dd2c40] animate-spin" />
                  <Sparkles className="w-12 h-12 text-[#ebd09b] animate-pulse" />
                </div>
                <h3 className="font-display font-black text-xl text-white tracking-widest uppercase animate-pulse">
                  SUMMONING ENTITIES FROM ALTAR...
                </h3>
                <p className="text-xs text-gray-500 font-mono">Dark forces intertwine the edges of worlds...</p>
              </div>
            ) : (
              /* Phase 2: Card/Equipment Reveals */
              <div className="space-y-8">
                <div className="space-y-2">
                  <h3 className="font-display font-black text-3xl text-[#ebd09b] tracking-widest text-shadow-gold uppercase">
                    {revealedCards.length > 0 ? 'Entities Summoned!' : 'Relics Discovered!'}
                  </h3>
                  <p className="text-xs text-gray-400 font-sans">
                    {revealedCards.length > 0 ? 'These dark forces have joined your collection.' : 'The abyss grants you this power.'}
                  </p>
                </div>
                
                <div className="flex flex-wrap justify-center gap-6">
                  {/* Render Cards if any */}
                  {revealedCards.map((card, idx) => {
                    const skill = card.skills[0];
                    return (
                      <motion.div
                        key={card.id}
                        initial={{ opacity: 0, y: 40, rotateY: 180, scale: 0.7 }}
                        animate={{ opacity: 1, y: 0, rotateY: 0, scale: 1 }}
                        transition={{ duration: 0.6, delay: idx * 0.3, type: 'spring', stiffness: 200 }}
                      >
                        <div
                          className={`w-48 aspect-[3/4.2] rounded-2xl p-4 flex flex-col justify-between relative shadow-2xl transition-all overflow-hidden border ${getCardTierStyles(card.tier, false, true)}`}
                        >
                          {card.image.startsWith('/cards/') && (
                            <>
                              <img src={card.image} alt={card.name} className="absolute inset-0 w-full h-full object-cover z-0 opacity-90" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10 z-0 pointer-events-none" />
                            </>
                          )}

                          <div className="relative z-10 flex justify-between items-start">
                            <div className="text-center bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded border border-[#c5a880]/20">
                              <span className="text-[8px] text-[#ebd09b] uppercase font-mono tracking-wider">{card.tier}</span>
                            </div>
                            <div className="bg-black border border-[#c5a880]/40 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-mono font-bold text-[#ebd09b]">
                              {card.level}
                            </div>
                          </div>

                          <div className="flex-1 flex items-center justify-center my-2 relative z-10">
                            {!card.image.startsWith('/cards/') && (
                              <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-amber-700/20 to-black">
                                {card.image === 'Skull' && <Skull className="w-8 h-8 text-[#dd2c40]" />}
                                {card.image === 'Flame' && <Flame className="w-8 h-8 text-amber-500" />}
                                {card.image === 'Sparkles' && <Sparkles className="w-8 h-8 text-purple-400" />}
                                {card.image === 'Wand' && <Sparkles className="w-8 h-8 text-cyan-400" />}
                                {card.image !== 'Skull' && card.image !== 'Flame' && card.image !== 'Sparkles' && card.image !== 'Wand' && (
                                  <Skull className="w-8 h-8 text-gray-500" />
                                )}
                              </div>
                            )}
                          </div>

                          <div className="relative z-10 space-y-1.5 mt-auto">
                            <div className="text-center">
                              <span className="text-sm font-display font-black text-white block truncate leading-none text-shadow-gold drop-shadow-md">
                                {card.name}
                              </span>
                            </div>

                            {/* Skill preview */}
                            {skill && (
                              <div className="bg-black/60 backdrop-blur-sm border border-gray-900/50 p-1.5 rounded-lg text-[9px] text-gray-300 text-center leading-tight">
                                <span className="font-semibold block text-[#c5a880] uppercase text-[8px]">{skill.type}</span>
                                <span className="line-clamp-1">{skill.description}</span>
                              </div>
                            )}

                            <div className="flex justify-between items-center text-[10px] font-mono font-bold pt-1.5 border-t border-gray-800/80 bg-black/40 backdrop-blur-sm rounded px-1.5 py-1">
                              <span className="text-red-400">⚔️ {card.attack}</span>
                              <span className="text-emerald-400">❤️ {card.health}</span>
                              <span className="text-blue-400">⏳ {card.delay}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Render Equipment if any */}
                  {revealedEquipment.map((eq, idx) => (
                    <motion.div
                      key={eq.id}
                      initial={{ opacity: 0, y: 50, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: idx * 0.2, type: 'spring' }}
                      className={`relative w-48 h-64 rounded-2xl flex flex-col items-center justify-center border-2 shadow-2xl overflow-hidden p-4 ${
                        eq.tier === 'legendary' ? 'bg-gradient-to-br from-red-950 to-orange-900 border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.4)]' :
                        eq.tier === 'gold' ? 'bg-gradient-to-br from-yellow-900/80 to-amber-900/50 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.3)]' :
                        eq.tier === 'silver' ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-400' :
                        'bg-gradient-to-br from-stone-800 to-stone-900 border-stone-600'
                      }`}
                    >
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-bold tracking-widest uppercase border border-white/20">
                        {eq.tier}
                      </div>
                      <div className="w-16 h-16 rounded-full bg-black/50 border border-white/20 flex items-center justify-center mb-4">
                        {eq.slot === 'weapon' && <Sword className="w-8 h-8 text-gray-300" />}
                        {eq.slot === 'armor' && <Shield className="w-8 h-8 text-gray-300" />}
                        {eq.slot === 'helmet' && <Skull className="w-8 h-8 text-gray-300" />}
                        {(eq.slot === 'ring' || eq.slot === 'amulet') && <Gem className="w-8 h-8 text-gray-300" />}
                        {eq.slot === 'boots' && <Flame className="w-8 h-8 text-gray-300" />}
                      </div>
                      <h4 className="font-display font-bold text-center text-sm text-white mb-2">{eq.name}</h4>
                      <p className="text-xs text-center text-gray-400 font-mono capitalize">{eq.slot}</p>
                      <div className="mt-auto bg-black/60 w-full py-2 rounded text-center text-[10px] font-mono border border-white/10">
                        <span className="text-emerald-400">+{eq.bonusValue} {eq.bonusType}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="pt-6">
                  <button
                    onClick={closeReveal}
                    className="bg-[#c5a880] hover:bg-[#ebd09b] text-black font-display font-black tracking-widest py-3 px-8 rounded-xl transition-all shadow-lg text-xs"
                  >
                    CLAIM CARDS TO SANCTUARY
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
