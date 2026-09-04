import React, { useState, useEffect } from 'react';
import { getCardTierStyles } from '../utils/tierStyles';
import { motion } from 'motion/react';
import { audioSystem } from '../utils/AudioSystem';
import { useGame } from '../context/GameContext';
import { useToast } from './Toast';
import { CARD_TEMPLATES, getCardManaCost } from '../data/cards';
import { Card, Equipment } from '../types';
import { getEquipmentIcon, EQUIPMENT_TEMPLATES, DEMIURGE_SET } from '../data/equipment';
import { 
  Box, 
  Shield, 
  Sword, 
  Store, 
  Crown, 
  ChevronRight,
  Skull,
  Flame,
  Sparkles
} from 'lucide-react';
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

export type ShopCategory = 'boosters' | 'chests' | 'pantheon' | 'demiurge';

interface GachaStoreViewProps {
  initialTab?: 'cards' | 'equipment' | 'divine';
}

export const GachaStoreView: React.FC<GachaStoreViewProps> = ({ initialTab = 'cards' }) => {
  const { profile, setProfile, setIsShardsShopOpen } = useGame();
  const toast = useToast();
  
  // Map initialTab to sidebar category
  const getCategoryFromTab = (tab?: string): ShopCategory => {
    if (tab === 'equipment') return 'chests';
    if (tab === 'divine') return 'demiurge';
    return 'boosters';
  };

  const [activeCategory, setActiveCategory] = useState<ShopCategory>(getCategoryFromTab(initialTab));

  useEffect(() => {
    if (initialTab) {
      setActiveCategory(getCategoryFromTab(initialTab));
    }
  }, [initialTab]);

  const [buyingCardId, setBuyingCardId] = useState<string | null>(null);
  const [buyingEquipName, setBuyingEquipName] = useState<string | null>(null);
  
  // Demiurge equipment items calculation
  const demiurgeItems = EQUIPMENT_TEMPLATES.filter(e => e.setId === 'demiurge');
  const ownedDemiurgeCount = demiurgeItems.filter(t => (profile.equipment || []).some(e => e.name === t.name)).length;

  // Animation/Opening state
  const [openingPack, setOpeningPack] = useState<string | null>(null);
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

  // Buy Divine Equipment (costs 50 Shards)
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

  // Booster & Chest purchases
  const buyBronzePack = () => buyPackBackend('bronze');
  const buyObsidianPack = () => buyPackBackend('obsidian');
  const buyAbyssalPack = () => buyPackBackend('abyssal');
  const buyBasicEquipmentPack = () => buyPackBackend('eq_basic', true);
  const buyRareEquipmentPack = () => buyPackBackend('eq_rare', true);
  const buyPremiumEquipmentPack = () => buyPackBackend('eq_premium', true);

  // Run pack animation
  const triggerOpeningAnimationBackend = (packType: string, newCards: any[], newEquipment: any[]) => {
    audioSystem.playMagic();
    setOpeningPack(packType);
    setRevealedCards(newCards);
    setRevealedEquipment(newEquipment);
    setIsRevealed(false);

    if (newCards && newCards.length > 0) {
      assetPreloader.preloadBattleCreatures(newCards);
    }

    setTimeout(() => setIsRevealed(true), 1500);
  };

  const buyPackBackend = async (packType: string, isEquipment: boolean = false) => {
    if (packType === 'obsidian' || packType === 'eq_rare') {
      if ((profile.darkShards || 0) < 30) {
        setIsShardsShopOpen(true);
        toast('Insufficient Dark Shards! Opening Abyssal Shop...', 'warning');
        return;
      }
    } else if (packType === 'abyssal' || packType === 'eq_premium') {
      if ((profile.darkShards || 0) < 70) {
        setIsShardsShopOpen(true);
        toast('Insufficient Dark Shards! Opening Abyssal Shop...', 'warning');
        return;
      }
    } else if (packType === 'bronze' && (profile.gold || 0) < 300) {
      toast('Insufficient Gold!', 'warning');
      return;
    } else if (packType === 'eq_basic' && (profile.gold || 0) < 500) {
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

  // Close reveal dialog
  const closeReveal = () => {
    setOpeningPack(null);
    setRevealedCards([]);
    setRevealedEquipment([]);
    setIsRevealed(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-0 sm:py-1">
      
      {/* MAIN STORE VIEW: SIDEBAR + MAIN SHOWCASE */}
      <div className="flex flex-col md:flex-row gap-4 lg:gap-5 items-stretch">
        
        {/* Left Sidebar Navigation (Wide, clean, full titles) */}
        <div className="w-full md:w-64 lg:w-72 shrink-0 bg-[#0c0f14]/90 border border-white/10 rounded-2xl p-3 flex flex-row md:flex-col gap-2 shadow-2xl backdrop-blur-md overflow-x-auto md:overflow-x-visible">
          
          {/* Shop Header in Sidebar */}
          <div className="hidden md:flex items-center gap-2.5 px-3 py-2 border-b border-white/10 mb-1">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500/20 via-rose-500/20 to-black border border-amber-400/40 flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.25)]">
              <Store className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div>
              <div className="text-[8px] font-mono font-bold tracking-widest text-amber-400/90 uppercase">
                EMPORIUM
              </div>
              <h2 className="font-display font-black text-sm text-white tracking-wider text-shadow-gold leading-none">
                VOID SHOP
              </h2>
            </div>
          </div>

          {/* 1. Card Boosters */}
          <button
            onClick={() => {
              audioSystem.playClick();
              setActiveCategory('boosters');
            }}
            className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 shrink-0 md:shrink ${
              activeCategory === 'boosters'
                ? 'bg-gradient-to-r from-amber-950/80 to-[#1c140a] text-white border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                : 'bg-black/40 text-gray-400 border-white/5 hover:border-amber-500/40 hover:bg-white/5 hover:text-amber-200'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                activeCategory === 'boosters' ? 'bg-amber-500/20 border-amber-400/60 text-amber-300' : 'bg-black/50 border-white/10 text-gray-400'
              }`}>
                <Box className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-display font-bold text-xs tracking-wider uppercase">
                  Card Boosters
                </div>
                <div className="text-[10px] text-gray-400 font-mono hidden md:block">
                  Packs & Summoning
                </div>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 hidden md:block ${activeCategory === 'boosters' ? 'text-amber-400' : 'text-gray-600'}`} />
          </button>

          {/* 2. Relic Chests */}
          <button
            onClick={() => {
              audioSystem.playClick();
              setActiveCategory('chests');
            }}
            className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 shrink-0 md:shrink ${
              activeCategory === 'chests'
                ? 'bg-gradient-to-r from-purple-950/80 to-[#180b22] text-white border-purple-500/80 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                : 'bg-black/40 text-gray-400 border-white/5 hover:border-purple-500/40 hover:bg-white/5 hover:text-purple-200'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                activeCategory === 'chests' ? 'bg-purple-500/20 border-purple-400/60 text-purple-300' : 'bg-black/50 border-white/10 text-gray-400'
              }`}>
                <Shield className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-display font-bold text-xs tracking-wider uppercase">
                  Relic Chests
                </div>
                <div className="text-[10px] text-gray-400 font-mono hidden md:block">
                  Lord Armaments
                </div>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 hidden md:block ${activeCategory === 'chests' ? 'text-purple-400' : 'text-gray-600'}`} />
          </button>

          {/* 3. Divine Pantheon */}
          <button
            onClick={() => {
              audioSystem.playClick();
              setActiveCategory('pantheon');
            }}
            className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 shrink-0 md:shrink ${
              activeCategory === 'pantheon'
                ? 'bg-gradient-to-r from-rose-950/90 to-[#220710] text-white border-rose-500/80 shadow-[0_0_18px_rgba(244,63,94,0.3)]'
                : 'bg-black/40 text-gray-400 border-white/5 hover:border-rose-500/40 hover:bg-white/5 hover:text-rose-200'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                activeCategory === 'pantheon' ? 'bg-rose-500/20 border-rose-400/60 text-rose-300' : 'bg-black/50 border-white/10 text-gray-400'
              }`}>
                <Crown className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-bold text-xs tracking-wider uppercase">
                    Divine Pantheon
                  </span>
                  <span className="bg-amber-400 text-black text-[8px] font-mono px-1 py-0.2 rounded font-black tracking-wider hidden md:inline">
                    EXCLUSIVE
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 font-mono hidden md:block">
                  3 Primordial Invocations
                </div>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 hidden md:block ${activeCategory === 'pantheon' ? 'text-rose-400' : 'text-gray-600'}`} />
          </button>

          {/* 4. Demiurge Relics */}
          <button
            onClick={() => {
              audioSystem.playClick();
              setActiveCategory('demiurge');
            }}
            className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 shrink-0 md:shrink ${
              activeCategory === 'demiurge'
                ? 'bg-gradient-to-r from-rose-950/90 via-red-950/80 to-black text-white border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.35)]'
                : 'bg-black/40 text-gray-400 border-white/5 hover:border-rose-500/40 hover:bg-white/5 hover:text-rose-200'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                activeCategory === 'demiurge' ? 'bg-rose-500/20 border-rose-400/60 text-rose-300' : 'bg-black/50 border-white/10 text-gray-400'
              }`}>
                <Sword className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-bold text-xs tracking-wider uppercase">
                    Demiurge Relics
                  </span>
                  <span className="bg-rose-950 border border-rose-500/60 text-rose-300 text-[8px] font-mono px-1.5 py-0.2 rounded font-black">
                    {ownedDemiurgeCount}/6
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 font-mono hidden md:block">
                  6-Piece Divine Set
                </div>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 hidden md:block ${activeCategory === 'demiurge' ? 'text-rose-400' : 'text-gray-600'}`} />
          </button>

        </div>

        {/* Right Showcase Viewport */}
        <div className="flex-1 min-w-0 bg-[#0c0f14]/85 border border-white/10 rounded-2xl p-4 md:p-5 shadow-2xl backdrop-blur-md flex flex-col justify-between">
          
          {/* ===================== 1. CARD BOOSTERS (PERFECT VIEWPORT FIT) ===================== */}
          {activeCategory === 'boosters' && (
            <div className="space-y-4">
              
              {/* Category Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <Box className="w-5 h-5 text-amber-400" />
                  <h2 className="font-display font-black text-lg md:text-xl text-white tracking-widest text-shadow-gold uppercase">
                    Card Boosters
                  </h2>
                  <span className="text-xs text-gray-400 font-mono hidden sm:inline">• 3 Cards Per Pack</span>
                </div>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2.5 py-0.5 rounded-md">
                  GUARANTEED SUMMONS
                </span>
              </div>

              {/* 3 Pack Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
                
                {/* Bronze Pack */}
                <div className="bg-[#141820] border border-amber-900/40 rounded-2xl p-4 flex flex-col justify-between hover:border-amber-500/60 transition-all shadow-xl hover:shadow-[0_0_25px_rgba(245,158,11,0.2)] group">
                  <div className="space-y-3.5">
                    {/* Pack Art Box */}
                    <div className="h-50 sm:h-52 rounded-xl bg-gradient-to-b from-amber-950/30 to-black/70 border border-amber-900/20 flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(197,168,128,0.2),transparent_70%)]" />
                      <img 
                        src="/packs/pack_bronze.webp" 
                        alt="Bronze Pack" 
                        decoding="async" 
                        className="w-40 h-40 sm:w-44 sm:h-44 object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_22px_rgba(197,168,128,0.5)]" 
                      />
                      <span className="absolute bottom-2 font-display font-black text-xs text-amber-500 tracking-widest uppercase">
                        BRONZE PACK
                      </span>
                    </div>

                    <div>
                      <h4 className="font-display font-black text-base sm:text-lg text-white">
                        Bronze Booster
                      </h4>
                    </div>

                    {/* Clean Drop Rates Box */}
                    <div className="bg-black/60 border border-white/10 rounded-xl p-3 text-xs font-mono space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Common (Bronze):</span>
                        <span className="text-amber-400 font-bold text-sm">95%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Rare (Silver):</span>
                        <span className="text-gray-200 font-bold text-sm">5%</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-white/5 pt-1.5 text-gray-400">
                        <span>Guaranteed:</span>
                        <span className="text-white font-semibold">Level 1 Card</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={buyBronzePack}
                      className="w-full bg-[#c5a880] hover:bg-[#ebd09b] text-black font-display font-black tracking-widest py-3 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer active:scale-95"
                    >
                      <img src="/icons/icon_gold.webp" alt="Gold" className="w-4 h-4 object-contain" />
                      300 GOLD
                    </button>
                  </div>
                </div>

                {/* Obsidian Pack */}
                <div className="bg-[#141820] border border-indigo-950 rounded-2xl p-4 flex flex-col justify-between hover:border-cyan-400/60 transition-all shadow-xl gothic-glow-blue group">
                  <div className="space-y-3.5">
                    {/* Pack Art Box */}
                    <div className="h-50 sm:h-52 rounded-xl bg-gradient-to-b from-indigo-950/40 to-black/70 border border-indigo-900/20 flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(102,252,241,0.2),transparent_70%)]" />
                      <img 
                        src="/packs/pack_obsidian.webp" 
                        alt="Obsidian Pack" 
                        decoding="async" 
                        className="w-40 h-40 sm:w-44 sm:h-44 object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_22px_rgba(102,252,241,0.5)]" 
                      />
                      <span className="absolute bottom-2 font-display font-black text-xs text-[#66fcf1] tracking-widest uppercase text-shadow-gold">
                        OBSIDIAN PACK
                      </span>
                    </div>

                    <div>
                      <h4 className="font-display font-black text-base sm:text-lg text-white">
                        Obsidian Set
                      </h4>
                    </div>

                    {/* Clean Drop Rates Box */}
                    <div className="bg-black/60 border border-white/10 rounded-xl p-3 text-xs font-mono space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Silver Cards:</span>
                        <span className="text-[#66fcf1] font-bold text-sm">50%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Gold Cards:</span>
                        <span className="text-amber-400 font-bold text-sm">10%</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-white/5 pt-1.5 text-gray-400">
                        <span>Level 2 Chance:</span>
                        <span className="text-cyan-300 font-semibold">30%</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={buyObsidianPack}
                      className="w-full bg-gradient-to-r from-indigo-900 to-[#1f2833] hover:from-[#45a29e] hover:to-indigo-900 text-[#66fcf1] border border-[#66fcf1]/30 font-display font-black tracking-widest py-3 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer active:scale-95"
                    >
                      <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain" />
                      30 SHARDS
                    </button>
                  </div>
                </div>

                {/* Abyssal Pack */}
                <div className="bg-[#141820] border border-red-950 rounded-2xl p-4 flex flex-col justify-between hover:border-red-500/60 transition-all shadow-xl gothic-glow-purple group">
                  <div className="space-y-3.5">
                    {/* Pack Art Box */}
                    <div className="h-50 sm:h-52 rounded-xl bg-gradient-to-b from-red-950/40 to-black/70 border border-red-900/20 flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(221,44,64,0.22),transparent_70%)]" />
                      <img 
                        src="/packs/pack_abyssal.webp" 
                        alt="Abyssal Pack" 
                        decoding="async" 
                        className="w-40 h-40 sm:w-44 sm:h-44 object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_22px_rgba(221,44,64,0.5)]" 
                      />
                      <span className="absolute bottom-2 font-display font-black text-xs text-[#dd2c40] tracking-widest uppercase text-shadow-crimson">
                        ABYSSAL PACK
                      </span>
                    </div>

                    <div>
                      <h4 className="font-display font-black text-base sm:text-lg text-white">
                        Abyssal Lord Pack
                      </h4>
                    </div>

                    {/* Clean Drop Rates Box */}
                    <div className="bg-black/60 border border-white/10 rounded-xl p-3 text-xs font-mono space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Gold Cards:</span>
                        <span className="text-amber-400 font-bold text-sm">45%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Legendary Cards:</span>
                        <span className="text-purple-400 font-bold text-sm">15%</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-white/5 pt-1.5 text-gray-400">
                        <span>Level 2 Chance:</span>
                        <span className="text-rose-400 font-semibold">40%</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={buyAbyssalPack}
                      className="w-full bg-gradient-to-r from-[#880d1e] to-[#4e0707] hover:from-[#dd2c40] hover:to-[#880d1e] text-white border border-[#dd2c40]/30 font-display font-black tracking-widest py-3 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer active:scale-95"
                    >
                      <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain" />
                      70 SHARDS
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ===================== 2. RELIC CHESTS (PERFECT VIEWPORT FIT) ===================== */}
          {activeCategory === 'chests' && (
            <div className="space-y-4">
              
              {/* Category Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-5 h-5 text-purple-400" />
                  <h2 className="font-display font-black text-lg md:text-xl text-white tracking-widest text-shadow-gold uppercase">
                    Relic Chests
                  </h2>
                  <span className="text-xs text-gray-400 font-mono hidden sm:inline">• 1 Equipment Per Chest</span>
                </div>
                <span className="text-[10px] font-mono text-purple-400 bg-purple-950/60 border border-purple-500/40 px-2.5 py-0.5 rounded-md">
                  LORD EQUIPMENT
                </span>
              </div>

              {/* 3 Chest Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
                
                {/* Basic Chest */}
                <div className="bg-[#141820] border border-[#c5a880]/40 rounded-2xl p-4 flex flex-col justify-between hover:border-[#ebd09b]/60 transition-all shadow-xl group">
                  <div className="space-y-3.5">
                    {/* Chest Art Box */}
                    <div className="h-50 sm:h-52 rounded-xl bg-gradient-to-b from-[#4a3f35]/50 to-black/70 border border-[#c5a880]/20 flex flex-col items-center justify-center relative overflow-hidden">
                      <img 
                        src="/packs/chest_basic.webp" 
                        alt="Basic Relics" 
                        decoding="async" 
                        className="w-40 h-40 sm:w-44 sm:h-44 object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_22px_rgba(197,168,128,0.5)]" 
                      />
                      <span className="absolute bottom-2 font-display font-black text-xs text-[#ebd09b] tracking-widest uppercase">
                        BASIC RELICS
                      </span>
                    </div>

                    <div>
                      <h4 className="font-display font-black text-base sm:text-lg text-white">
                        Basic Equipment Chest
                      </h4>
                    </div>

                    {/* Clean Drop Rates Box */}
                    <div className="bg-black/60 border border-white/10 rounded-xl p-3 text-xs font-mono space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Bronze Equipment:</span>
                        <span className="text-amber-400 font-bold text-sm">80%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Silver Equipment:</span>
                        <span className="text-gray-200 font-bold text-sm">20%</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-white/5 pt-1.5 text-gray-400">
                        <span>Tier Range:</span>
                        <span className="text-white font-semibold">Bronze - Silver</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={buyBasicEquipmentPack}
                      className="w-full bg-[#1f2833] hover:bg-[#2b3746] text-[#ebd09b] border border-[#c5a880]/40 font-display font-black tracking-widest py-3 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer active:scale-95"
                    >
                      <img src="/icons/icon_gold.webp" alt="Gold" className="w-4 h-4 object-contain" />
                      500 GOLD
                    </button>
                  </div>
                </div>

                {/* Rare Chest */}
                <div className="bg-[#141820] border border-indigo-950 rounded-2xl p-4 flex flex-col justify-between hover:border-cyan-400/60 transition-all shadow-xl gothic-glow-blue group">
                  <div className="space-y-3.5">
                    {/* Chest Art Box */}
                    <div className="h-50 sm:h-52 rounded-xl bg-gradient-to-b from-indigo-950/40 to-black/70 border border-indigo-900/20 flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(102,252,241,0.2),transparent_70%)]" />
                      <img 
                        src="/packs/chest_rare.webp" 
                        alt="Rare Relics" 
                        decoding="async" 
                        className="w-40 h-40 sm:w-44 sm:h-44 object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_22px_rgba(102,252,241,0.5)]" 
                      />
                      <span className="absolute bottom-2 font-display font-black text-xs text-[#66fcf1] tracking-widest uppercase text-shadow-gold">
                        RARE RELICS
                      </span>
                    </div>

                    <div>
                      <h4 className="font-display font-black text-base sm:text-lg text-white">
                        Rare Equipment Chest
                      </h4>
                    </div>

                    {/* Clean Drop Rates Box */}
                    <div className="bg-black/60 border border-white/10 rounded-xl p-3 text-xs font-mono space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Bronze Equipment:</span>
                        <span className="text-amber-500 font-bold text-sm">40%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Silver Equipment:</span>
                        <span className="text-cyan-300 font-bold text-sm">50%</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-white/5 pt-1.5 text-gray-400">
                        <span>Gold Equipment:</span>
                        <span className="text-amber-400 font-semibold">10%</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={buyRareEquipmentPack}
                      className="w-full bg-gradient-to-r from-indigo-900 to-[#1f2833] hover:from-[#45a29e] hover:to-indigo-900 text-[#66fcf1] border border-[#66fcf1]/30 font-display font-black tracking-widest py-3 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer active:scale-95"
                    >
                      <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain" />
                      30 SHARDS
                    </button>
                  </div>
                </div>

                {/* Premium Chest */}
                <div className="bg-[#141820] border border-red-950 rounded-2xl p-4 flex flex-col justify-between hover:border-red-500/60 transition-all shadow-xl gothic-glow-purple group">
                  <div className="space-y-3.5">
                    {/* Chest Art Box */}
                    <div className="h-50 sm:h-52 rounded-xl bg-gradient-to-b from-red-950/40 to-black/70 border border-red-500/20 flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(221,44,64,0.22),transparent_70%)]" />
                      <img 
                        src="/packs/chest_premium.webp" 
                        alt="Premium Relics" 
                        decoding="async" 
                        className="w-40 h-40 sm:w-44 sm:h-44 object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_22px_rgba(221,44,64,0.5)]" 
                      />
                      <span className="absolute bottom-2 font-display font-black text-xs text-[#dd2c40] tracking-widest uppercase text-shadow-crimson">
                        PREMIUM RELICS
                      </span>
                    </div>

                    <div>
                      <h4 className="font-display font-black text-base sm:text-lg text-white">
                        Premium Equipment Chest
                      </h4>
                    </div>

                    {/* Clean Drop Rates Box */}
                    <div className="bg-black/60 border border-white/10 rounded-xl p-3 text-xs font-mono space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Silver Equipment:</span>
                        <span className="text-cyan-300 font-bold text-sm">60%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Gold Equipment:</span>
                        <span className="text-amber-400 font-bold text-sm">35%</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-white/5 pt-1.5 text-gray-400">
                        <span>Legendary Equipment:</span>
                        <span className="text-purple-400 font-semibold">5%</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={buyPremiumEquipmentPack}
                      className="w-full bg-gradient-to-r from-[#880d1e] to-[#4e0707] hover:from-[#dd2c40] hover:to-[#880d1e] text-white border border-[#dd2c40]/30 font-display font-black tracking-widest py-3 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer active:scale-95"
                    >
                      <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain" />
                      70 SHARDS
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ===================== 3. DIVINE PANTHEON (RESTORED FULL DESIGN) ===================== */}
          {activeCategory === 'pantheon' && (
            <div className="space-y-6">
              
              {/* Category Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-rose-950/60 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-rose-400" />
                    <h2 className="font-display font-black text-xl md:text-2xl text-white tracking-widest text-shadow-gold uppercase">
                      Divine Pantheon
                    </h2>
                  </div>
                  <p className="text-xs text-gray-400 font-sans">
                    The primordial architects of reality. Cannot be acquired via boosters or standard evolution.
                  </p>
                </div>
                <div className="bg-black/60 border border-rose-500/40 rounded-xl px-3.5 py-1.5 text-xs font-mono text-rose-300">
                  Fixed Price: <span className="font-bold text-amber-400">50 Dark Shards</span>
                </div>
              </div>

              {/* 3 Divine Cards Showcase Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {CARD_TEMPLATES.filter(c => c.tier === 'divine').map((card) => {
                  const ownedCount = (profile.collection || []).filter(c => c.baseId === card.baseId).length;
                  const isBuyingThis = buyingCardId === card.baseId;

                  return (
                    <div 
                      key={card.baseId} 
                      className="bg-gradient-to-b from-[#1c080d] via-[#14060a] to-black border-2 border-rose-500/40 hover:border-rose-400/90 rounded-3xl p-5 flex flex-col justify-between shadow-2xl hover:shadow-[0_0_35px_rgba(244,63,94,0.35)] transition-all duration-300 group relative overflow-hidden"
                    >
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
                            <h4 className="font-display font-black text-base text-white group-hover:text-rose-400 transition-colors tracking-wide leading-tight">
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
                          className="w-full bg-gradient-to-r from-rose-600 via-red-500 to-rose-600 hover:from-rose-500 hover:to-red-400 active:scale-[0.98] text-white font-display font-black tracking-widest py-2.5 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(244,63,94,0.5)] hover:shadow-[0_0_25px_rgba(244,63,94,0.8)] flex items-center justify-center gap-2 text-xs uppercase cursor-pointer disabled:opacity-50"
                        >
                          <img src="/icons/icon_shards.webp" alt="Shards" className="w-5 h-5 object-contain drop-shadow" />
                          {isBuyingThis ? 'INVOKING...' : 'SUMMON FOR 50 SHARDS'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===================== 4. DEMIURGE RELICS (RESTORED FULL DESIGN) ===================== */}
          {activeCategory === 'demiurge' && (
            <div className="space-y-6">
              
              {/* Category Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-rose-950/60 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sword className="w-5 h-5 text-rose-400" />
                    <h2 className="font-display font-black text-xl md:text-2xl text-white tracking-widest text-shadow-gold uppercase">
                      Relics of the Demiurge
                    </h2>
                  </div>
                  <p className="text-xs text-gray-400 font-sans">
                    Forge individual divine set pieces to unlock massive lord bonuses and cosmic delay reduction.
                  </p>
                </div>
                <div className="bg-black/60 border border-rose-500/40 rounded-xl px-3.5 py-1.5 text-xs font-mono text-rose-300">
                  Fixed Price: <span className="font-bold text-amber-400">50 Dark Shards</span> per piece
                </div>
              </div>

              {/* Set Resonance Monolith Header Box */}
              <div className="bg-gradient-to-r from-[#20080f] via-[#14050a] to-[#20080f] border border-rose-500/40 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono text-rose-400 uppercase font-black tracking-widest">
                      SET RESONANCE STATUS
                    </span>
                    <h3 className="font-display font-black text-lg text-white">
                      Cosmic Sovereign Synergy
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 bg-black/60 border border-rose-500/30 rounded-xl px-4 py-2">
                    <div className="text-left">
                      <span className="text-[9px] font-mono text-gray-400 uppercase block">Assembled</span>
                      <span className="font-display font-black text-lg text-rose-400 leading-none">
                        {ownedDemiurgeCount} <span className="text-gray-500 text-xs">/ 6</span>
                      </span>
                    </div>
                    <div className="w-24 bg-gray-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(ownedDemiurgeCount / 6) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* 3 Milestone Badges */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2 border-t border-rose-500/20">
                  {DEMIURGE_SET.thresholds.map((threshold, tIdx) => {
                    const isAchieved = ownedDemiurgeCount >= threshold.pieces;
                    return (
                      <div 
                        key={tIdx}
                        className={`p-2.5 rounded-xl border transition-all ${
                          isAchieved
                            ? 'bg-rose-950/80 border-rose-400 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                            : 'bg-black/50 border-white/10 opacity-70 text-gray-400'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono font-bold mb-1">
                          <span>[{threshold.pieces} PC] {threshold.label}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-black ${
                            isAchieved ? 'bg-rose-500/40 text-rose-300' : 'text-gray-600'
                          }`}>
                            {isAchieved ? 'ACTIVE' : 'LOCKED'}
                          </span>
                        </div>
                        <div className="text-[11px] font-sans text-gray-300">
                          {threshold.description}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 6 Equipment Pieces Showcase Grid (Full 3x2 Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {demiurgeItems.map((item) => {
                  const isOwned = (profile.equipment || []).some(e => e.name === item.name);
                  const isEquipped = Object.values(profile.equipped || {}).some(id => {
                    const eq = (profile.equipment || []).find(e => e.id === id);
                    return eq?.name === item.name;
                  });
                  const isForging = buyingEquipName === item.name;

                  return (
                    <div
                      key={item.name}
                      className="bg-gradient-to-b from-[#1c080d] via-[#14060a] to-black border-2 border-rose-500/40 hover:border-rose-400/90 rounded-2xl p-4 flex flex-col justify-between shadow-xl hover:shadow-[0_0_30px_rgba(244,63,94,0.3)] transition-all duration-300 group relative overflow-hidden"
                    >
                      <div className="space-y-3 relative z-10">
                        {/* Top Badges */}
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-lg border font-mono text-[9px] uppercase font-black tracking-wider bg-rose-950/80 text-rose-300 border-rose-500/50">
                            {item.slot}
                          </span>
                          <span className="px-2 py-0.5 rounded-lg border font-mono text-[9px] uppercase font-black tracking-wider bg-gradient-to-r from-red-950 to-rose-900 text-rose-300 border-rose-400">
                            DIVINE SET
                          </span>
                        </div>

                        {/* Item Icon Box */}
                        <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-rose-400/30 shadow-lg bg-black/60 flex items-center justify-center p-4 group-hover:border-rose-400/60 transition-colors">
                          <img
                            src={getEquipmentIcon(item.name, item.slot)}
                            alt={item.name}
                            className="w-20 h-20 object-contain filter drop-shadow-[0_0_14px_rgba(244,63,94,0.6)] group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>

                        {/* Title & Status */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-display font-black text-sm text-white group-hover:text-rose-400 transition-colors tracking-wide leading-tight">
                              {item.name}
                            </h4>
                            <p className="text-[10px] text-gray-400 font-sans mt-1 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                          {isEquipped ? (
                            <span className="shrink-0 bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-[8px] font-mono px-1.5 py-0.5 rounded-full font-bold shadow">
                              EQUIPPED
                            </span>
                          ) : isOwned ? (
                            <span className="shrink-0 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[8px] font-mono px-1.5 py-0.5 rounded-full font-bold shadow">
                              OWNED
                            </span>
                          ) : null}
                        </div>

                        {/* Stat Bonuses */}
                        <div className="bg-black/60 border border-white/10 rounded-xl p-2.5 space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="text-gray-400">Primary Power:</span>
                            <span className="text-rose-300 font-black">
                              {item.bonusType === 'delayReduction' ? `-${item.bonusValue} Delay` :
                               item.bonusType === 'dodge' ? `+${item.bonusValue}% Dodge` :
                               item.bonusType === 'goldBonus' ? `+${item.bonusValue}% Gold` :
                               `+${item.bonusValue} Max HP`}
                            </span>
                          </div>
                          {item.secondaryBonusType && (
                            <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-white/5">
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
                      <div className="mt-4 pt-2.5 border-t border-white/10 relative z-10">
                        <button
                          disabled={isForging}
                          onClick={() => buyDivineEquipment(item.name)}
                          className="w-full bg-gradient-to-r from-rose-600 via-red-500 to-rose-600 hover:from-rose-500 hover:to-red-400 active:scale-[0.98] text-white font-display font-black tracking-widest py-2 px-3 rounded-xl transition-all shadow-[0_0_15px_rgba(244,63,94,0.4)] hover:shadow-[0_0_20px_rgba(244,63,94,0.7)] flex items-center justify-center gap-2 text-xs uppercase cursor-pointer disabled:opacity-50"
                        >
                          <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain drop-shadow" />
                          {isForging ? 'FORGING...' : 'FORGE FOR 50 SHARDS'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* 3. OPENING REVEAL ANIMATION OVERLAY */}
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
                            eq.tier === 'divine' ? 'drop-shadow-[0_0_16px_rgba(244,63,94,0.8)]' :
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
                    className="bg-[#c5a880] hover:bg-[#ebd09b] text-black font-display font-black tracking-widest py-3 px-8 rounded-xl transition-all shadow-lg text-xs cursor-pointer active:scale-95"
                  >
                    CLAIM REWARDS TO SANCTUARY
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
