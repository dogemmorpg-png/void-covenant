import React, { useState } from 'react';
import { getCardTierStyles } from '../utils/tierStyles';
import { motion } from 'motion/react';
import { audioSystem } from '../utils/AudioSystem';
import { useGame } from '../context/GameContext';
import { useToast } from './Toast';
import { CARD_TEMPLATES, createCardInstance, getCardManaCost } from '../data/cards';
import { Card, CardTier, Equipment } from '../types';
import { getRandomEquipmentByTier, generateEquipmentInstance, getEquipmentIcon, EQUIPMENT_TEMPLATES, DEMIURGE_SET } from '../data/equipment';
import { Gem, Coins, Sparkles, Box, Trash2, Shield, Flame, Skull, Sword, Store, Crown, Zap } from 'lucide-react';
import { assetPreloader, getCardImageUrl } from '../utils/assetPreloader';

const renderManaIcon = (cost: number, sizeClass: string = "w-5 h-5") => {
  return (
    <div className={`relative ${sizeClass} shrink-0 flex items-center justify-center`}>
      <svg className="absolute inset-0 w-full h-full filter drop-shadow-[0_0_5px_rgba(6,182,212,0.85)]" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L4 7v10l8 5 8-5V7l-8-5z" fill="url(#manaCrystalGradGacha)" stroke="#66fcf1" strokeWidth="1.5" />
        <path d="M12 2L4 7l8 5 8-5-8-5z" fill="#66fcf1" opacity="0.35" />
        <path d="M4 7v10l8 5V12L4 7z" fill="#00d2ff" opacity="0.55" />
        <path d="M20 7v10l8 5V12L20 7z" fill="#005299" opacity="0.75" />
        <defs>
          <radialGradient id="manaCrystalGradGacha" cx="50%" cy="50%" r="50%">
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

export const GachaStoreView: React.FC = () => {
  const { profile, spendGold, spendShards, addCardToCollection, addEquipment, setProfile, setIsShardsShopOpen } = useGame();
  const toast = useToast();
  
  const [activeTab, setActiveTab] = useState<'cards' | 'equipment' | 'divine'>('cards');
  const [buyingCardId, setBuyingCardId] = useState<string | null>(null);
  
  // Animation/Opening state
  const [openingPack, setOpeningPack] = useState<string | null>(null); // 'bronze' | 'obsidian' | 'abyssal' | 'eq_basic' | 'eq_premium' | null
  const [revealedCards, setRevealedCards] = useState<Card[]>([]);
  const [revealedEquipment, setRevealedEquipment] = useState<Equipment[]>([]);
  const [isRevealed, setIsRevealed] = useState(false);

  // Buy Divine Card (costs 50 Shards)
  const buyDivineCard = async (baseId: string) => {
    const cardCost = 50;
    if ((profile.darkShards || 0) < cardCost) {
      setIsShardsShopOpen(true);
      toast('Insufficient Dark Shards! Opening Shards Shop...', 'warning');
      return;
    }

    try {
      setBuyingCardId(baseId);
      const token = localStorage.getItem('void_covenant_token');
      if (!token) {
        toast('You must be logged in to purchase', 'error');
        return;
      }

      const res = await fetch('/api/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'buy_divine_card', payload: { baseId } })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.profile) {
          setProfile(data.profile);
        }
        audioSystem.playVictory();
        triggerOpeningAnimationBackend('divine_card', [data.newCard], []);
        toast(`✨ Divine entity invoked: ${data.newCard.name}!`, 'success');
      } else {
        toast(data.error || 'Failed to summon divine entity', 'error');
      }
    } catch (err: any) {
      console.error('Divine purchase error:', err);
      toast('Network error during purchase', 'error');
    } finally {
      setBuyingCardId(null);
    }
  };

  const [buyingEquipName, setBuyingEquipName] = useState<string | null>(null);

  const buyDivineEquipment = async (itemName: string) => {
    const equipCost = 50;
    if ((profile.darkShards || 0) < equipCost) {
      setIsShardsShopOpen(true);
      toast('Insufficient Dark Shards! Opening Shards Shop...', 'warning');
      return;
    }

    try {
      setBuyingEquipName(itemName);
      const token = localStorage.getItem('void_covenant_token');
      if (!token) {
        toast('You must be logged in to purchase', 'error');
        return;
      }

      const res = await fetch('/api/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'buy_divine_equipment', payload: { itemName } })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.profile) {
          setProfile(data.profile);
        }
        audioSystem.playVictory();
        triggerOpeningAnimationBackend('divine_equip', [], [data.newEquipment]);
        toast(`🛡️ Divine artifact forged: ${data.newEquipment.name}!`, 'success');
      } else {
        toast(data.error || 'Failed to forge divine artifact', 'error');
      }
    } catch (err: any) {
      console.error('Divine equipment purchase error:', err);
      toast('Network error during purchase', 'error');
    } finally {
      setBuyingEquipName(null);
    }
  };

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

    // Preload summoned cards immediately during the 1.5s portal animation
    if (newCards && newCards.length > 0) {
      assetPreloader.preloadBattleCreatures(newCards);
    }

    setTimeout(() => setIsRevealed(true), 1500);
  };

  const buyPackBackend = async (packType: string, isEquipment: boolean = false) => {
    // Check local shards / gold balances first before requesting backend
    if (packType === 'obsidian' || packType === 'eq_rare') {
      if (profile.darkShards < 30) {
        setIsShardsShopOpen(true);
        toast('Insufficient Dark Shards! Opening Abyssal Shop...', 'warning');
        return;
      }
    } else if (packType === 'abyssal' || packType === 'eq_premium') {
      if (profile.darkShards < 70) {
        setIsShardsShopOpen(true);
        toast('Insufficient Dark Shards! Opening Abyssal Shop...', 'warning');
        return;
      }
    } else if (packType === 'bronze' && profile.gold < 300) {
      toast('Insufficient Gold!', 'warning');
      return;
    } else if (packType === 'eq_basic' && profile.gold < 500) {
      toast('Insufficient Gold!', 'warning');
      return;
    }

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
        } else {
            const errData = await res.json();
            toast(errData.error || 'Failed to purchase pack', 'error');
        }
      } else {
          toast('You must be logged in to purchase', 'error');
      }
    } catch (err: any) {
      console.warn('Server gacha failed', err);
      toast('Network error connecting to server', 'error');
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
      
      {/* Intro header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-950/40 via-black to-amber-950/40 border border-amber-500/40 px-5 py-1.5 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.2)] mb-2">
          <Store className="w-5 h-5 text-amber-400" />
          <span className="font-display font-black text-amber-300 text-xs tracking-widest uppercase">
            ABYSSAL EMPORIUM & ALTAR
          </span>
        </div>
        <h2 className="font-display font-black text-3xl md:text-4xl text-white tracking-widest text-shadow-gold">
          VOID SHOP
        </h2>
        <p className="text-sm text-gray-400 font-sans max-w-xl mx-auto leading-relaxed">
          Offer your accumulated gold and dark shards to acquire booster packs, legendary relics, or invoke forbidden Divine beings directly into your ranks.
        </p>

        {/* Tabs */}
        <div className="flex justify-center gap-3 mt-6 flex-wrap">
          <button onMouseEnter={() => audioSystem.playHover()} onClick={() => { audioSystem.playClick(); setActiveTab('cards'); }}
            className={`px-5 py-2.5 font-display font-black tracking-widest transition-all rounded-xl border flex items-center gap-2 cursor-pointer ${
              activeTab === 'cards' 
                ? 'bg-[#c5a880] text-black border-[#ebd09b] shadow-[0_0_15px_rgba(235,208,155,0.4)]' 
                : 'bg-black/50 text-gray-400 border-gray-800 hover:text-[#ebd09b] hover:border-gray-700'
            }`}
          >
            <Box className="w-4 h-4" />
            <span>CARD PACKS</span>
          </button>
          <button onMouseEnter={() => audioSystem.playHover()} onClick={() => { audioSystem.playClick(); setActiveTab('equipment'); }}
            className={`px-5 py-2.5 font-display font-black tracking-widest transition-all rounded-xl border flex items-center gap-2 cursor-pointer ${
              activeTab === 'equipment' 
                ? 'bg-purple-900 text-white border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                : 'bg-black/50 text-gray-400 border-gray-800 hover:text-purple-400 hover:border-gray-700'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>RELIC CHESTS</span>
          </button>
          <button onMouseEnter={() => audioSystem.playHover()} onClick={() => { audioSystem.playClick(); setActiveTab('divine'); }}
            className={`px-5 py-2.5 font-display font-black tracking-widest transition-all rounded-xl border flex items-center gap-2 cursor-pointer relative ${
              activeTab === 'divine' 
                ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white border-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.7)]' 
                : 'bg-rose-950/30 text-rose-300 border-rose-800/60 hover:border-rose-400 hover:shadow-[0_0_15px_rgba(244,63,94,0.3)]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-rose-400 animate-pulse" />
            <span>DIVINE ALTAR</span>
            <span className="bg-amber-400 text-black text-[8px] font-mono px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wider ml-1">
              EXCLUSIVE
            </span>
          </button>
        </div>
      </div>

      {activeTab === 'cards' && (
        /* Packs Grid */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          
          {/* Bronze Pack */}
          <div className="bg-[#151a21] border border-amber-900/30 rounded-2xl p-5 flex flex-col justify-between hover:-translate-y-1 transition-all shadow-xl">
            <div className="space-y-4">
              <div className="h-44 rounded-xl bg-gradient-to-b from-amber-950/20 to-black/50 border border-amber-900/10 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(197,168,128,0.1),transparent_70%)]" />
                <img src="/packs/pack_bronze.webp" alt="Bronze Pack" decoding="async" className="w-32 h-32 object-contain hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(197,168,128,0.4)]" />
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
                <img src="/icons/icon_gold.webp" alt="Gold" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-8 h-8 object-contain " /> BUY FOR 300 <img src="/icons/icon_gold.webp" alt="Gold" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" />
              </button>
            </div>
          </div>

          {/* Obsidian Pack */}
          <div className="bg-[#151a21] border border-indigo-950 rounded-2xl p-5 flex flex-col justify-between hover:-translate-y-1 transition-all shadow-xl gothic-glow-blue">
            <div className="space-y-4">
              <div className="h-44 rounded-xl bg-gradient-to-b from-indigo-950/20 to-black/50 border border-indigo-900/10 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(102,252,241,0.15),transparent_70%)]" />
                <img src="/packs/pack_obsidian.webp" alt="Obsidian Pack" decoding="async" className="w-32 h-32 object-contain hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(102,252,241,0.4)]" />
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
                <img src="/icons/icon_shards.webp" alt="Shards" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-8 h-8 object-contain " /> SUMMON FOR 30 <img src="/icons/icon_shards.webp" alt="Shards" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" />
              </button>
            </div>
          </div>

          {/* Abyssal Pack */}
          <div className="bg-[#151a21] border border-red-950 rounded-2xl p-5 flex flex-col justify-between hover:-translate-y-1 transition-all shadow-xl gothic-glow-purple">
            <div className="space-y-4">
              <div className="h-44 rounded-xl bg-gradient-to-b from-red-950/20 to-black/50 border border-red-900/10 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(221,44,64,0.15),transparent_70%)]" />
                <img src="/packs/pack_abyssal.webp" alt="Abyssal Pack" decoding="async" className="w-32 h-32 object-contain hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(221,44,64,0.4)]" />
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
                <img src="/icons/icon_shards.webp" alt="Shards" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-8 h-8 object-contain " /> SUMMON FOR 70 <img src="/icons/icon_shards.webp" alt="Shards" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" />
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'equipment' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Basic Equipment Pack */}
          <div className="bg-[#151a21] border border-[#c5a880]/30 rounded-2xl p-5 flex flex-col justify-between hover:-translate-y-1 transition-all shadow-xl">
            <div className="space-y-4">
              <div className="h-44 rounded-xl bg-gradient-to-b from-[#4a3f35] to-black/50 border border-[#c5a880]/10 flex flex-col items-center justify-center relative overflow-hidden">
                <img src="/packs/chest_basic.webp" alt="Basic Relics" decoding="async" className="w-32 h-32 object-contain hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(197,168,128,0.4)]" />
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
                <img src="/icons/icon_gold.webp" alt="Gold" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-8 h-8 object-contain " /> OPEN FOR 500 <img src="/icons/icon_gold.webp" alt="Gold" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" />
              </button>
            </div>
          </div>

          {/* Rare Equipment Pack */}
          <div className="bg-[#151a21] border border-indigo-950 rounded-2xl p-5 flex flex-col justify-between hover:-translate-y-1 transition-all shadow-xl gothic-glow-blue">
            <div className="space-y-4">
              <div className="h-44 rounded-xl bg-gradient-to-b from-indigo-950/20 to-black/50 border border-indigo-900/10 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(102,252,241,0.15),transparent_70%)]" />
                <img src="/packs/chest_rare.webp" alt="Rare Relics" decoding="async" className="w-32 h-32 object-contain hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(102,252,241,0.4)]" />
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
                <img src="/icons/icon_shards.webp" alt="Shards" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-8 h-8 object-contain " /> OPEN FOR 30 <img src="/icons/icon_shards.webp" alt="Shards" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" />
              </button>
            </div>
          </div>

          {/* Premium Equipment Pack */}
          <div className="bg-[#151a21] border border-red-950 rounded-2xl p-5 flex flex-col justify-between hover:-translate-y-1 transition-all shadow-xl gothic-glow-purple">
            <div className="space-y-4">
              <div className="h-44 rounded-xl bg-gradient-to-b from-red-950/40 to-black/50 border border-red-500/20 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(221,44,64,0.15),transparent_70%)]" />
                <img src="/packs/chest_premium.webp" alt="Premium Relics" decoding="async" className="w-32 h-32 object-contain hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(221,44,64,0.4)]" />
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
                <img src="/icons/icon_shards.webp" alt="Shards" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-8 h-8 object-contain " /> OPEN FOR 70 <img src="/icons/icon_shards.webp" alt="Shards" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" />
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'divine' && (
        <div className="space-y-8 max-w-6xl mx-auto">
          {/* Banner */}
          <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-black border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.15)] overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/40 px-3 py-1 rounded-full text-amber-300 text-xs font-mono font-bold tracking-widest uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  EXCLUSIVE CELESTIAL BEINGS
                </div>
                <h3 className="text-2xl sm:text-3xl font-display font-black text-white tracking-widest text-shadow-gold">
                  ALTAR OF THE DEMIURGE
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 font-sans max-w-2xl leading-relaxed">
                  The most formidable primordial entities in the multiverse. Possessing unmatched stats and devastating skills, they <span className="text-amber-300 font-semibold">cannot be obtained from packs</span> or ascended via standard evolution.
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-3 bg-black/60 border border-amber-500/40 px-5 py-3 rounded-2xl shadow-inner">
                <img src="/icons/icon_shards.webp" alt="Shards" className="w-9 h-9 object-contain drop-shadow-[0_0_8px_rgba(102,252,241,0.6)]" />
                <div className="text-left">
                  <div className="text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider">Your Balance</div>
                  <div className="text-xl font-display font-black text-[#66fcf1] leading-none">{profile.darkShards || 0} <span className="text-xs text-gray-400">SHARDS</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Cards Showcase Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CARD_TEMPLATES.filter(c => c.tier === 'divine').map((card) => {
              const ownedCount = (profile.collection || []).filter(c => c.baseId === card.baseId).length;
              const isBuyingThis = buyingCardId === card.baseId;

              return (
                <div 
                  key={card.baseId} 
                  className="bg-gradient-to-b from-[#1c080d] via-[#14060a] to-black border-2 border-rose-500/50 hover:border-rose-400/90 rounded-3xl p-5 flex flex-col justify-between shadow-2xl hover:shadow-[0_0_35px_rgba(244,63,94,0.4)] transition-all duration-300 group relative overflow-hidden"
                >
                  {/* Subtle top glow */}
                  <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/15 rounded-full blur-2xl pointer-events-none group-hover:bg-rose-500/25 transition-all" />

                  <div className="space-y-4 relative z-10">
                    {/* Card Portrait & Badges */}
                    <div className="relative aspect-[3/3.8] rounded-2xl overflow-hidden border border-rose-400/40 shadow-lg bg-black/60">
                      <img 
                        src={card.image} 
                        alt={card.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30 pointer-events-none" />

                      {/* Tier & Delay Badges Top */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                        <span className="px-2 py-0.5 rounded-lg border font-mono text-[9px] uppercase font-black tracking-wider bg-gradient-to-r from-red-950 to-rose-900 text-rose-300 border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.7)]">
                          DIVINE
                        </span>
                        <div className="flex items-center gap-1.5">
                          {renderManaIcon(getCardManaCost(card), "w-6 h-6")}
                          <div className="bg-black/80 border border-rose-400/40 rounded-lg px-2 py-0.5 text-[9px] font-mono font-bold text-blue-300 backdrop-blur-sm shadow flex items-center gap-1">
                            <span>⏳</span> {card.delay}
                          </div>
                        </div>
                      </div>

                      {/* ATK & HP Badges Bottom */}
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                        <div className="bg-black/85 border border-red-500/60 rounded-xl px-2.5 py-1 text-xs font-mono font-black text-red-400 flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
                          <span className="text-sm">⚔️</span> {card.attack}
                        </div>
                        <div className="bg-black/85 border border-emerald-500/60 rounded-xl px-2.5 py-1 text-xs font-mono font-black text-emerald-400 flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
                          <span className="text-sm">❤️</span> {card.health}
                        </div>
                      </div>
                    </div>

                    {/* Card Title & Owned Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-display font-black text-lg text-white group-hover:text-rose-400 transition-colors tracking-wide leading-tight">
                          {card.name}
                        </h4>
                        <p className="text-[11px] text-gray-400 font-sans mt-1 line-clamp-2 leading-relaxed">
                          {card.description}
                        </p>
                      </div>
                      {ownedCount > 0 && (
                        <span className="shrink-0 bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                          OWNED: {ownedCount}
                        </span>
                      )}
                    </div>

                    {/* Skills Box */}
                    <div className="bg-black/60 border border-white/10 rounded-xl p-2.5 space-y-2">
                      <div className="text-[10px] font-mono uppercase font-bold text-rose-400 tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-rose-400" />
                        DIVINE SKILLS:
                      </div>
                      <div className="space-y-1.5">
                        {card.skills.map((skill, sIdx) => (
                          <div key={sIdx} className="flex items-start gap-1.5 text-[10px]">
                            <span className="font-bold text-rose-300 uppercase shrink-0">[{skill.type} {skill.value}]</span>
                            <span className="text-gray-300 leading-snug">{skill.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Purchase Button */}
                  <div className="mt-5 pt-3 border-t border-white/10 relative z-10">
                    <button
                      disabled={isBuyingThis}
                      onClick={() => buyDivineCard(card.baseId)}
                      className="w-full bg-gradient-to-r from-rose-600 via-red-500 to-rose-600 hover:from-rose-500 hover:to-red-400 active:scale-[0.98] text-white font-display font-black tracking-widest py-3 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(244,63,94,0.5)] hover:shadow-[0_0_25px_rgba(244,63,94,0.8)] flex items-center justify-center gap-2 text-xs uppercase cursor-pointer disabled:opacity-50"
                    >
                      <img src="/icons/icon_shards.webp" alt="Shards" className="w-6 h-6 object-contain drop-shadow" />
                      {isBuyingThis ? 'INVOKING...' : 'SUMMON FOR 50 SHARDS'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* DIVINE EQUIPMENT SET: RELICS OF THE DEMIURGE */}
          <div className="mt-16 pt-10 border-t border-rose-950/70 space-y-8">
            {/* Section Header with Set Bonus Tracker */}
            <div className="bg-gradient-to-r from-[#20080f] via-[#14050a] to-[#20080f] border-2 border-rose-500/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="bg-rose-500 text-white font-mono text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.7)]">
                      DIVINE ARTIFACT SET
                    </span>
                    <span className="text-gray-400 font-mono text-xs">
                      • {DEMIURGE_SET.thresholds.length} SET BONUSES
                    </span>
                  </div>
                  <h3 className="font-display font-black text-2xl md:text-3xl text-white tracking-wider flex items-center gap-2.5">
                    <Shield className="w-6 h-6 text-rose-400 shrink-0" />
                    <span>RELICS OF THE DEMIURGE</span>
                  </h3>
                  <p className="text-xs text-gray-300 font-sans leading-relaxed">
                    Forge and assemble the 6 sacred pieces of the Primordial Creator to awaken devastating cosmic set resonance.
                  </p>
                </div>

                {/* Equipped / Owned Counter */}
                {(() => {
                  const demiurgeItems = EQUIPMENT_TEMPLATES.filter(e => e.setId === 'demiurge');
                  const ownedCount = demiurgeItems.filter(t => (profile.equipment || []).some(e => e.name === t.name)).length;
                  return (
                    <div className="bg-black/75 border border-rose-500/30 rounded-2xl px-5 py-3 text-center shrink-0 shadow-lg backdrop-blur-sm">
                      <span className="text-[10px] font-mono uppercase font-bold text-gray-400 block tracking-wider">Set Progress</span>
                      <div className="font-display font-black text-2xl text-rose-400">
                        {ownedCount} <span className="text-gray-500 text-base">/ 6</span>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-rose-300/80">COLLECTED</span>
                    </div>
                  );
                })()}
              </div>

              {/* Set Bonus Milestones Banner */}
              <div className="mt-6 pt-5 border-t border-rose-500/20 grid grid-cols-1 md:grid-cols-3 gap-3 relative z-10">
                {(() => {
                  const demiurgeItems = EQUIPMENT_TEMPLATES.filter(e => e.setId === 'demiurge');
                  const ownedCount = demiurgeItems.filter(t => (profile.equipment || []).some(e => e.name === t.name)).length;
                  return DEMIURGE_SET.thresholds.map((threshold, tIdx) => {
                    const isAchieved = ownedCount >= threshold.pieces;
                    return (
                      <div 
                        key={tIdx}
                        className={`rounded-xl p-3 border transition-all ${
                          isAchieved
                            ? 'bg-gradient-to-r from-rose-950/90 to-red-950/70 border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                            : 'bg-black/50 border-white/10 opacity-75'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className={`text-[10px] font-mono font-black uppercase tracking-wider ${isAchieved ? 'text-rose-300' : 'text-gray-400'}`}>
                            [{threshold.pieces} PIECES] {threshold.label}
                          </span>
                          {isAchieved ? (
                            <span className="text-[9px] font-mono font-black text-rose-400 bg-rose-950/80 border border-rose-500/50 px-1.5 py-0.5 rounded shadow">ACTIVE</span>
                          ) : (
                            <span className="text-[9px] font-mono text-gray-500">LOCKED</span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-300 font-sans leading-snug">
                          {threshold.description}
                        </p>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* 6 Equipment Pieces Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {EQUIPMENT_TEMPLATES.filter(e => e.setId === 'demiurge').map((item) => {
                const isOwned = (profile.equipment || []).some(e => e.name === item.name);
                const isEquipped = Object.values(profile.equipped || {}).some(id => {
                  const eq = (profile.equipment || []).find(e => e.id === id);
                  return eq?.name === item.name;
                });
                const isForging = buyingEquipName === item.name;

                return (
                  <div
                    key={item.name}
                    className="bg-gradient-to-b from-[#1c080d] via-[#14060a] to-black border-2 border-rose-500/40 hover:border-rose-400/90 rounded-3xl p-5 flex flex-col justify-between shadow-2xl hover:shadow-[0_0_35px_rgba(244,63,94,0.35)] transition-all duration-300 group relative overflow-hidden"
                  >
                    {/* Ambient corner glow */}
                    <div className="absolute -top-20 -left-20 w-40 h-40 bg-rose-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-rose-500/20 transition-all" />

                    <div className="space-y-4 relative z-10">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-lg border font-mono text-[9px] uppercase font-black tracking-wider bg-rose-950/80 text-rose-300 border-rose-500/50 shadow">
                          {item.slot}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg border font-mono text-[9px] uppercase font-black tracking-wider bg-gradient-to-r from-red-950 to-rose-900 text-rose-300 border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.7)]">
                          DIVINE SET
                        </span>
                      </div>

                      {/* Item Icon Box */}
                      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-rose-400/30 shadow-lg bg-black/60 flex items-center justify-center p-6 group-hover:border-rose-400/60 transition-colors">
                        <img
                          src={getEquipmentIcon(item.name, item.slot)}
                          alt={item.name}
                          className="w-24 h-24 object-contain filter drop-shadow-[0_0_16px_rgba(244,63,94,0.6)] group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>

                      {/* Title & Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-display font-black text-base text-white group-hover:text-rose-400 transition-colors tracking-wide leading-tight">
                            {item.name}
                          </h4>
                          <p className="text-[11px] text-gray-400 font-sans mt-1 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                        {isEquipped ? (
                          <span className="shrink-0 bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold shadow">
                            EQUIPPED
                          </span>
                        ) : isOwned ? (
                          <span className="shrink-0 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold shadow">
                            OWNED
                          </span>
                        ) : null}
                      </div>

                      {/* Stat Bonuses */}
                      <div className="bg-black/60 border border-white/10 rounded-xl p-2.5 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-gray-400">Primary Power:</span>
                          <span className="text-rose-300 font-black">
                            {item.bonusType === 'delayReduction' ? `-${item.bonusValue} Delay` :
                             item.bonusType === 'dodge' ? `+${item.bonusValue}% Dodge` :
                             item.bonusType === 'goldBonus' ? `+${item.bonusValue}% Gold` :
                             `+${item.bonusValue} Max HP`}
                          </span>
                        </div>
                        {item.secondaryBonusType && (
                          <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-white/5">
                            <span className="text-gray-400">Secondary Power:</span>
                            <span className="text-rose-300 font-black">
                              {item.secondaryBonusType === 'dodge' ? `+${item.secondaryBonusValue}% Dodge` :
                               `+${item.secondaryBonusValue} Max HP`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Forge Button */}
                    <div className="mt-5 pt-3 border-t border-white/10 relative z-10">
                      <button
                        disabled={isForging}
                        onClick={() => buyDivineEquipment(item.name)}
                        className="w-full bg-gradient-to-r from-rose-600 via-red-500 to-rose-600 hover:from-rose-500 hover:to-red-400 active:scale-[0.98] text-white font-display font-black tracking-widest py-2.5 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(244,63,94,0.5)] hover:shadow-[0_0_25px_rgba(244,63,94,0.8)] flex items-center justify-center gap-2 text-xs uppercase cursor-pointer disabled:opacity-50"
                      >
                        <img src="/icons/icon_shards.webp" alt="Shards" className="w-5 h-5 object-contain drop-shadow" />
                        {isForging ? 'FORGING...' : 'FORGE FOR 50 SHARDS'}
                      </button>
                    </div>
                  </div>
                );
              })}
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
                          <img 
                            src={getCardImageUrl(card)} 
                            alt={card.name} 
                            className="absolute inset-0 w-full h-full object-cover z-0 opacity-90" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10 z-0 pointer-events-none" />

                          <div className="relative z-10 flex justify-between items-start">
                            <div className="text-center bg-black/70 backdrop-blur-sm px-2.5 py-0.5 rounded-lg border border-[#c5a880]/30 shadow-md">
                              <span className="text-[9px] text-[#ebd09b] uppercase font-mono font-bold tracking-wider">{card.tier}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {renderManaIcon(getCardManaCost(card), "w-6 h-6")}
                              <div className="bg-black/80 border border-[#c5a880]/50 rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-mono font-black text-[#ebd09b] shadow">
                                L{card.level}
                              </div>
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
                      className={`relative w-48 h-64 rounded-2xl flex flex-col items-center justify-between border-2 shadow-2xl overflow-hidden p-4 ${
                        eq.tier === 'divine' ? 'bg-gradient-to-br from-rose-950 via-[#26050d] to-black border-rose-500 shadow-[0_0_35px_rgba(244,63,94,0.7)] ring-1 ring-rose-400/60' :
                        eq.tier === 'legendary' ? 'bg-gradient-to-br from-purple-950 via-[#180424] to-black border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.5)]' :
                        eq.tier === 'gold' ? 'bg-gradient-to-br from-yellow-950 via-[#1f1404] to-black border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.35)]' :
                        eq.tier === 'silver' ? 'bg-gradient-to-br from-slate-900 via-[#101720] to-black border-slate-400' :
                        'bg-gradient-to-br from-stone-900 via-[#191410] to-black border-amber-700/60'
                      }`}
                    >
                      <div className="w-full flex items-center justify-between z-10">
                        <span className="text-[10px] font-mono uppercase text-gray-400">{eq.slot}</span>
                        <span className="px-2 py-0.5 rounded bg-black/80 text-[10px] font-display font-black tracking-widest uppercase border border-white/20 text-white">
                          {eq.tier}
                        </span>
                      </div>

                      <div className="w-20 h-20 rounded-2xl bg-black/60 border border-white/15 flex items-center justify-center p-2 my-auto shadow-inner">
                        <img 
                          src={getEquipmentIcon(eq)} 
                          alt={eq.name} 
                          className={`w-full h-full object-contain ${
                            eq.tier === 'legendary' ? 'drop-shadow-[0_0_12px_rgba(168,85,247,0.45)]' :
                            eq.tier === 'gold' ? 'drop-shadow-[0_0_10px_rgba(234,179,8,0.35)]' :
                            'drop-shadow-[0_4px_10px_rgba(0,0,0,0.85)]'
                          }`} 
                        />
                      </div>

                      <div className="w-full text-center space-y-1 z-10">
                        <h4 className="font-display font-bold text-center text-sm text-white leading-tight">{eq.name}</h4>
                        <div className="bg-black/60 w-full py-1.5 rounded-xl text-center text-xs font-mono border border-white/10">
                          <span className="text-emerald-400 font-bold">+{eq.bonusValue} {eq.bonusType}</span>
                        </div>
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

