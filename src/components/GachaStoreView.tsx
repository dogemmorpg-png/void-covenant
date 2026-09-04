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
  Flame, 
  Skull, 
  Sword, 
  Store, 
  Crown, 
  Plus, 
  Check, 
  Lock, 
  ChevronRight,
  Sparkles,
  Gem,
  Info
} from 'lucide-react';
import { assetPreloader, getCardImageUrl } from '../utils/assetPreloader';

const renderManaIcon = (cost: number, sizeClass: string = "w-4 h-4 sm:w-5 sm:h-5") => {
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
      <span className="relative text-white text-[9px] sm:text-[10px] font-black font-mono leading-none z-10 drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.95)]">
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

  // Selected item for split-view Demiurge Forge
  const [selectedDemiurgeItem, setSelectedDemiurgeItem] = useState<typeof demiurgeItems[0]>(() => {
    // Default to first unowned item, or the first item
    const unowned = demiurgeItems.find(t => !(profile.equipment || []).some(e => e.name === t.name));
    return unowned || demiurgeItems[0];
  });

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
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 space-y-4">
      
      {/* 1. TOP HEADER & LIVE BALANCE BAR (Compact Height ~52px) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-black/90 via-[#15101b]/80 to-black/90 border border-white/10 rounded-xl px-5 py-2.5 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 via-rose-500/20 to-black border border-amber-400/40 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.25)]">
            <Store className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono font-bold tracking-widest text-amber-400/90 uppercase">
                EMPORIUM
              </span>
              <span className="w-1 h-1 rounded-full bg-rose-500 animate-ping" />
            </div>
            <h1 className="font-display font-black text-xl text-white tracking-widest text-shadow-gold leading-none">
              VOID SHOP
            </h1>
          </div>
        </div>

        {/* Currency Badges */}
        <div className="flex items-center gap-2.5">
          {/* Gold Balance */}
          <div className="flex items-center gap-2 bg-black/70 border border-amber-500/30 hover:border-amber-400/60 transition-colors px-3 py-1 rounded-lg shadow-inner">
            <img 
              src="/icons/icon_gold.webp" 
              alt="Gold" 
              className="w-5 h-5 object-contain drop-shadow-[0_0_6px_rgba(245,158,11,0.5)] brightness-110" 
            />
            <div className="text-left leading-tight">
              <span className="text-[8px] text-gray-400 font-mono block uppercase">Gold</span>
              <span className="font-display font-black text-xs text-[#ebd09b]">
                {(profile.gold || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Dark Shards Balance with Quick Top-Up */}
          <div className="flex items-center gap-2 bg-black/70 border border-cyan-500/40 hover:border-cyan-400/80 transition-colors pl-3 pr-1.5 py-1 rounded-lg shadow-inner group">
            <img 
              src="/icons/icon_shards.webp" 
              alt="Dark Shards" 
              className="w-5 h-5 object-contain drop-shadow-[0_0_6px_rgba(102,252,241,0.6)] group-hover:rotate-12 transition-transform duration-300" 
            />
            <div className="text-left leading-tight pr-1.5">
              <span className="text-[8px] text-gray-400 font-mono block uppercase">Shards</span>
              <span className="font-display font-black text-xs text-[#66fcf1]">
                {(profile.darkShards || 0).toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => {
                audioSystem.playClick();
                setIsShardsShopOpen(true);
              }}
              title="Recharge Dark Shards"
              className="w-6 h-6 rounded bg-cyan-950/80 hover:bg-cyan-800 text-cyan-300 border border-cyan-400/50 flex items-center justify-center transition-all shadow-[0_0_8px_rgba(6,182,212,0.4)] cursor-pointer active:scale-90"
            >
              <Plus className="w-3.5 h-3.5 font-bold" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN STORE VIEW: SIDEBAR + ZERO-SCROLL VIEWPORT */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch">
        
        {/* Left Sidebar Navigation */}
        <div className="w-full md:w-56 lg:w-60 shrink-0 bg-[#0c0f14]/90 border border-white/10 rounded-xl p-2.5 flex flex-row md:flex-col gap-1.5 shadow-2xl backdrop-blur-md overflow-x-auto md:overflow-x-visible">
          
          <div className="hidden md:block px-2 py-1 text-[9px] font-mono uppercase tracking-widest text-gray-500 font-bold border-b border-white/5 mb-0.5">
            CATEGORIES
          </div>

          {/* 1. Card Boosters */}
          <button
            onClick={() => {
              audioSystem.playClick();
              setActiveCategory('boosters');
            }}
            className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2.5 shrink-0 md:shrink ${
              activeCategory === 'boosters'
                ? 'bg-gradient-to-r from-amber-950/80 to-[#1c140a] text-white border-amber-500/80 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'bg-black/40 text-gray-400 border-white/5 hover:border-amber-500/40 hover:bg-white/5 hover:text-amber-200'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                activeCategory === 'boosters' ? 'bg-amber-500/20 border-amber-400/60 text-amber-300' : 'bg-black/50 border-white/10 text-gray-400'
              }`}>
                <Box className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-display font-bold text-xs tracking-wider uppercase truncate">
                  Card Boosters
                </div>
                <div className="text-[9px] text-gray-400 font-mono truncate hidden md:block">
                  Packs & Summoning
                </div>
              </div>
            </div>
            <ChevronRight className={`w-3.5 h-3.5 hidden md:block ${activeCategory === 'boosters' ? 'text-amber-400' : 'text-gray-600'}`} />
          </button>

          {/* 2. Relic Chests */}
          <button
            onClick={() => {
              audioSystem.playClick();
              setActiveCategory('chests');
            }}
            className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2.5 shrink-0 md:shrink ${
              activeCategory === 'chests'
                ? 'bg-gradient-to-r from-purple-950/80 to-[#180b22] text-white border-purple-500/80 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                : 'bg-black/40 text-gray-400 border-white/5 hover:border-purple-500/40 hover:bg-white/5 hover:text-purple-200'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                activeCategory === 'chests' ? 'bg-purple-500/20 border-purple-400/60 text-purple-300' : 'bg-black/50 border-white/10 text-gray-400'
              }`}>
                <Shield className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-display font-bold text-xs tracking-wider uppercase truncate">
                  Relic Chests
                </div>
                <div className="text-[9px] text-gray-400 font-mono truncate hidden md:block">
                  Lord Armaments
                </div>
              </div>
            </div>
            <ChevronRight className={`w-3.5 h-3.5 hidden md:block ${activeCategory === 'chests' ? 'text-purple-400' : 'text-gray-600'}`} />
          </button>

          {/* 3. Divine Pantheon */}
          <button
            onClick={() => {
              audioSystem.playClick();
              setActiveCategory('pantheon');
            }}
            className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2.5 shrink-0 md:shrink ${
              activeCategory === 'pantheon'
                ? 'bg-gradient-to-r from-rose-950/90 to-[#220710] text-white border-rose-500/80 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                : 'bg-black/40 text-gray-400 border-white/5 hover:border-rose-500/40 hover:bg-white/5 hover:text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                activeCategory === 'pantheon' ? 'bg-rose-500/20 border-rose-400/60 text-rose-300' : 'bg-black/50 border-white/10 text-gray-400'
              }`}>
                <Crown className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-display font-bold text-xs tracking-wider uppercase truncate">
                    Divine Gods
                  </span>
                  <span className="bg-amber-400 text-black text-[7px] font-mono px-1 rounded font-black tracking-wider hidden md:inline">
                    EXCLUSIVE
                  </span>
                </div>
                <div className="text-[9px] text-gray-400 font-mono truncate hidden md:block">
                  3 Invocations
                </div>
              </div>
            </div>
            <ChevronRight className={`w-3.5 h-3.5 hidden md:block ${activeCategory === 'pantheon' ? 'text-rose-400' : 'text-gray-600'}`} />
          </button>

          {/* 4. Demiurge Relics */}
          <button
            onClick={() => {
              audioSystem.playClick();
              setActiveCategory('demiurge');
            }}
            className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2.5 shrink-0 md:shrink ${
              activeCategory === 'demiurge'
                ? 'bg-gradient-to-r from-rose-950/90 via-red-950/80 to-black text-white border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.35)]'
                : 'bg-black/40 text-gray-400 border-white/5 hover:border-rose-500/40 hover:bg-white/5 hover:text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                activeCategory === 'demiurge' ? 'bg-rose-500/20 border-rose-400/60 text-rose-300' : 'bg-black/50 border-white/10 text-gray-400'
              }`}>
                <Sword className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-display font-bold text-xs tracking-wider uppercase truncate">
                    Demiurge Set
                  </span>
                  <span className="bg-rose-950 border border-rose-500/60 text-rose-300 text-[8px] font-mono px-1 rounded font-black">
                    {ownedDemiurgeCount}/6
                  </span>
                </div>
                <div className="text-[9px] text-gray-400 font-mono truncate hidden md:block">
                  6-Piece Forge
                </div>
              </div>
            </div>
            <ChevronRight className={`w-3.5 h-3.5 hidden md:block ${activeCategory === 'demiurge' ? 'text-rose-400' : 'text-gray-600'}`} />
          </button>

          {/* 5. Dark Shards Quick Action */}
          <div className="mt-auto pt-1.5 border-t border-white/5 hidden md:block">
            <button
              onClick={() => {
                audioSystem.playClick();
                setIsShardsShopOpen(true);
              }}
              className="w-full text-left p-2 rounded-lg border border-cyan-500/30 bg-cyan-950/30 hover:bg-cyan-900/40 hover:border-cyan-400/60 transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Gem className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-display font-bold text-[11px] text-cyan-300 uppercase tracking-wider">
                  Recharge Shards
                </span>
              </div>
              <Plus className="w-3 h-3 text-cyan-300" />
            </button>
          </div>

        </div>

        {/* Right Showcase Viewport (Strictly Single Screen Height) */}
        <div className="flex-1 min-w-0 bg-[#0c0f14]/85 border border-white/10 rounded-xl p-4 sm:p-5 shadow-2xl backdrop-blur-md flex flex-col justify-between">
          
          {/* ===================== 1. CARD BOOSTERS (NO-SCROLL COMPACT) ===================== */}
          {activeCategory === 'boosters' && (
            <div className="space-y-4">
              
              {/* Compact Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <Box className="w-4 h-4 text-amber-400" />
                  <h2 className="font-display font-black text-lg text-white tracking-widest text-shadow-gold uppercase">
                    Card Boosters
                  </h2>
                  <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">• 3 Cards Per Pack</span>
                </div>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-950/50 border border-amber-500/30 px-2 py-0.5 rounded">
                  GUARANTEED SUMMONS
                </span>
              </div>

              {/* 3 Compact Pack Cards Grid (Height ~360px) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Bronze Pack */}
                <div className="bg-[#141820] border border-amber-900/40 rounded-xl p-3.5 flex flex-col justify-between hover:border-amber-500/50 transition-all shadow-lg group">
                  <div className="space-y-2.5">
                    <div className="h-32 rounded-lg bg-gradient-to-b from-amber-950/20 to-black/60 border border-amber-900/20 flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(197,168,128,0.15),transparent_70%)]" />
                      <img src="/packs/pack_bronze.webp" alt="Bronze Pack" decoding="async" className="w-24 h-24 object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_12px_rgba(197,168,128,0.35)]" />
                      <span className="absolute bottom-1 font-display font-black text-[10px] text-amber-500 tracking-widest uppercase">BRONZE</span>
                    </div>

                    <div>
                      <h4 className="font-display font-bold text-xs text-white">Bronze Booster</h4>
                      <p className="text-[10px] text-gray-400 leading-tight mt-0.5 line-clamp-1">
                        Collect basic duplicates for creature fusion.
                      </p>
                    </div>

                    {/* Compact Rates Badges */}
                    <div className="bg-black/50 border border-white/5 rounded-lg p-2 text-[9px] font-mono space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Common (Bronze):</span>
                        <span className="text-amber-400 font-bold">95%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Rare (Silver):</span>
                        <span className="text-gray-300 font-bold">5%</span>
                      </div>
                      <div className="flex justify-between border-t border-white/5 pt-0.5 text-gray-400">
                        <span>Guaranteed:</span>
                        <span className="text-white font-semibold">Level 1</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <button
                      onClick={buyBronzePack}
                      className="w-full bg-[#c5a880] hover:bg-[#ebd09b] text-black font-display font-black tracking-widest py-2 px-3 rounded-lg transition-all shadow flex items-center justify-center gap-1.5 text-xs cursor-pointer active:scale-95"
                    >
                      <img src="/icons/icon_gold.webp" alt="Gold" className="w-4 h-4 object-contain" />
                      300 GOLD
                    </button>
                  </div>
                </div>

                {/* Obsidian Pack */}
                <div className="bg-[#141820] border border-indigo-950/80 rounded-xl p-3.5 flex flex-col justify-between hover:border-cyan-400/50 transition-all shadow-lg gothic-glow-blue group">
                  <div className="space-y-2.5">
                    <div className="h-32 rounded-lg bg-gradient-to-b from-indigo-950/30 to-black/60 border border-indigo-900/20 flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(102,252,241,0.15),transparent_70%)]" />
                      <img src="/packs/pack_obsidian.webp" alt="Obsidian Pack" decoding="async" className="w-24 h-24 object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_12px_rgba(102,252,241,0.35)]" />
                      <span className="absolute bottom-1 font-display font-black text-[10px] text-[#66fcf1] tracking-widest uppercase text-shadow-gold">OBSIDIAN</span>
                    </div>

                    <div>
                      <h4 className="font-display font-bold text-xs text-white">Obsidian Set</h4>
                      <p className="text-[10px] text-gray-400 leading-tight mt-0.5 line-clamp-1">
                        High tier silver and gold entities.
                      </p>
                    </div>

                    {/* Compact Rates Badges */}
                    <div className="bg-black/50 border border-white/5 rounded-lg p-2 text-[9px] font-mono space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Silver:</span>
                        <span className="text-[#66fcf1] font-bold">50%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Gold:</span>
                        <span className="text-amber-400 font-bold">10%</span>
                      </div>
                      <div className="flex justify-between border-t border-white/5 pt-0.5 text-gray-400">
                        <span>Level 2 Chance:</span>
                        <span className="text-cyan-300 font-semibold">30%</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <button
                      onClick={buyObsidianPack}
                      className="w-full bg-gradient-to-r from-indigo-900 to-[#1f2833] hover:from-[#45a29e] hover:to-indigo-900 text-[#66fcf1] border border-[#66fcf1]/30 font-display font-black tracking-widest py-2 px-3 rounded-lg transition-all shadow flex items-center justify-center gap-1.5 text-xs cursor-pointer active:scale-95"
                    >
                      <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain" />
                      30 SHARDS
                    </button>
                  </div>
                </div>

                {/* Abyssal Pack */}
                <div className="bg-[#141820] border border-red-950/80 rounded-xl p-3.5 flex flex-col justify-between hover:border-red-500/50 transition-all shadow-lg gothic-glow-purple group">
                  <div className="space-y-2.5">
                    <div className="h-32 rounded-lg bg-gradient-to-b from-red-950/30 to-black/60 border border-red-900/20 flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(221,44,64,0.18),transparent_70%)]" />
                      <img src="/packs/pack_abyssal.webp" alt="Abyssal Pack" decoding="async" className="w-24 h-24 object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_12px_rgba(221,44,64,0.35)]" />
                      <span className="absolute bottom-1 font-display font-black text-[10px] text-[#dd2c40] tracking-widest uppercase text-shadow-crimson">ABYSSAL</span>
                    </div>

                    <div>
                      <h4 className="font-display font-bold text-xs text-white">Abyssal Lord Pack</h4>
                      <p className="text-[10px] text-gray-400 leading-tight mt-0.5 line-clamp-1">
                        Supreme summons: Gold and Legendary.
                      </p>
                    </div>

                    {/* Compact Rates Badges */}
                    <div className="bg-black/50 border border-white/5 rounded-lg p-2 text-[9px] font-mono space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Gold:</span>
                        <span className="text-amber-400 font-bold">45%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Legendary:</span>
                        <span className="text-purple-400 font-bold">15%</span>
                      </div>
                      <div className="flex justify-between border-t border-white/5 pt-0.5 text-gray-400">
                        <span>Level 2 Chance:</span>
                        <span className="text-rose-400 font-semibold">40%</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <button
                      onClick={buyAbyssalPack}
                      className="w-full bg-gradient-to-r from-[#880d1e] to-[#4e0707] hover:from-[#dd2c40] hover:to-[#880d1e] text-white border border-[#dd2c40]/30 font-display font-black tracking-widest py-2 px-3 rounded-lg transition-all shadow flex items-center justify-center gap-1.5 text-xs cursor-pointer active:scale-95"
                    >
                      <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain" />
                      70 SHARDS
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ===================== 2. RELIC CHESTS (NO-SCROLL COMPACT) ===================== */}
          {activeCategory === 'chests' && (
            <div className="space-y-4">
              
              {/* Compact Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-400" />
                  <h2 className="font-display font-black text-lg text-white tracking-widest text-shadow-gold uppercase">
                    Relic Chests
                  </h2>
                  <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">• 1 Relic Per Chest</span>
                </div>
                <span className="text-[10px] font-mono text-purple-400 bg-purple-950/50 border border-purple-500/30 px-2 py-0.5 rounded">
                  LORD EQUIPMENT
                </span>
              </div>

              {/* 3 Compact Chest Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Basic Chest */}
                <div className="bg-[#141820] border border-[#c5a880]/30 rounded-xl p-3.5 flex flex-col justify-between hover:border-[#ebd09b]/50 transition-all shadow-lg group">
                  <div className="space-y-2.5">
                    <div className="h-32 rounded-lg bg-gradient-to-b from-[#4a3f35]/40 to-black/60 border border-[#c5a880]/15 flex flex-col items-center justify-center relative overflow-hidden">
                      <img src="/packs/chest_basic.webp" alt="Basic Relics" decoding="async" className="w-24 h-24 object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_12px_rgba(197,168,128,0.35)]" />
                      <span className="absolute bottom-1 font-display font-black text-[10px] text-[#ebd09b] tracking-widest uppercase">BASIC</span>
                    </div>

                    <div>
                      <h4 className="font-display font-bold text-xs text-white">Basic Equipment</h4>
                      <p className="text-[10px] text-gray-400 leading-tight mt-0.5 line-clamp-1">
                        Starter armaments for your Lord.
                      </p>
                    </div>

                    <div className="bg-black/50 border border-white/5 rounded-lg p-2 text-[9px] font-mono space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Bronze Equipment:</span>
                        <span className="text-amber-400 font-bold">80%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Silver Equipment:</span>
                        <span className="text-gray-300 font-bold">20%</span>
                      </div>
                      <div className="flex justify-between border-t border-white/5 pt-0.5 text-gray-400">
                        <span>Tier Range:</span>
                        <span className="text-white font-semibold">Bronze - Silver</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <button
                      onClick={buyBasicEquipmentPack}
                      className="w-full bg-[#1f2833] hover:bg-[#2b3746] text-[#ebd09b] border border-[#c5a880]/30 font-display font-black tracking-widest py-2 px-3 rounded-lg transition-all shadow flex items-center justify-center gap-1.5 text-xs cursor-pointer active:scale-95"
                    >
                      <img src="/icons/icon_gold.webp" alt="Gold" className="w-4 h-4 object-contain" />
                      500 GOLD
                    </button>
                  </div>
                </div>

                {/* Rare Chest */}
                <div className="bg-[#141820] border border-indigo-950/80 rounded-xl p-3.5 flex flex-col justify-between hover:border-cyan-400/50 transition-all shadow-lg gothic-glow-blue group">
                  <div className="space-y-2.5">
                    <div className="h-32 rounded-lg bg-gradient-to-b from-indigo-950/30 to-black/60 border border-indigo-900/20 flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(102,252,241,0.15),transparent_70%)]" />
                      <img src="/packs/chest_rare.webp" alt="Rare Relics" decoding="async" className="w-24 h-24 object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_12px_rgba(102,252,241,0.35)]" />
                      <span className="absolute bottom-1 font-display font-black text-[10px] text-[#66fcf1] tracking-widest uppercase text-shadow-gold">RARE</span>
                    </div>

                    <div>
                      <h4 className="font-display font-bold text-xs text-white">Rare Chest</h4>
                      <p className="text-[10px] text-gray-400 leading-tight mt-0.5 line-clamp-1">
                        Superior odds for enchanted gear.
                      </p>
                    </div>

                    <div className="bg-black/50 border border-white/5 rounded-lg p-2 text-[9px] font-mono space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Bronze:</span>
                        <span className="text-amber-500 font-bold">40%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Silver:</span>
                        <span className="text-cyan-300 font-bold">50%</span>
                      </div>
                      <div className="flex justify-between border-t border-white/5 pt-0.5 text-gray-400">
                        <span>Gold Equipment:</span>
                        <span className="text-amber-400 font-semibold">10%</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <button
                      onClick={buyRareEquipmentPack}
                      className="w-full bg-gradient-to-r from-indigo-900 to-[#1f2833] hover:from-[#45a29e] hover:to-indigo-900 text-[#66fcf1] border border-[#66fcf1]/30 font-display font-black tracking-widest py-2 px-3 rounded-lg transition-all shadow flex items-center justify-center gap-1.5 text-xs cursor-pointer active:scale-95"
                    >
                      <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain" />
                      30 SHARDS
                    </button>
                  </div>
                </div>

                {/* Premium Chest */}
                <div className="bg-[#141820] border border-red-950/80 rounded-xl p-3.5 flex flex-col justify-between hover:border-red-500/50 transition-all shadow-lg gothic-glow-purple group">
                  <div className="space-y-2.5">
                    <div className="h-32 rounded-lg bg-gradient-to-b from-red-950/30 to-black/60 border border-red-500/20 flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(221,44,64,0.18),transparent_70%)]" />
                      <img src="/packs/chest_premium.webp" alt="Premium Relics" decoding="async" className="w-24 h-24 object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_12px_rgba(221,44,64,0.35)]" />
                      <span className="absolute bottom-1 font-display font-black text-[10px] text-[#dd2c40] tracking-widest uppercase text-shadow-crimson">PREMIUM</span>
                    </div>

                    <div>
                      <h4 className="font-display font-bold text-xs text-white">Premium Relics</h4>
                      <p className="text-[10px] text-gray-400 leading-tight mt-0.5 line-clamp-1">
                        High tier relics including Legendary.
                      </p>
                    </div>

                    <div className="bg-black/50 border border-white/5 rounded-lg p-2 text-[9px] font-mono space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Silver:</span>
                        <span className="text-gray-300 font-bold">40%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Gold:</span>
                        <span className="text-amber-400 font-bold">45%</span>
                      </div>
                      <div className="flex justify-between border-t border-white/5 pt-0.5 text-gray-400">
                        <span>Legendary:</span>
                        <span className="text-purple-400 font-semibold">15%</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <button
                      onClick={buyPremiumEquipmentPack}
                      className="w-full bg-gradient-to-r from-[#880d1e] to-[#4e0707] hover:from-[#dd2c40] hover:to-[#880d1e] text-white border border-[#dd2c40]/30 font-display font-black tracking-widest py-2 px-3 rounded-lg transition-all shadow flex items-center justify-center gap-1.5 text-xs cursor-pointer active:scale-95"
                    >
                      <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain" />
                      70 SHARDS
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ===================== 3. DIVINE PANTHEON (NO-SCROLL COMPACT) ===================== */}
          {activeCategory === 'pantheon' && (
            <div className="space-y-4">
              
              {/* Compact Header */}
              <div className="flex items-center justify-between border-b border-rose-950/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-rose-400" />
                  <h2 className="font-display font-black text-lg text-white tracking-widest text-shadow-gold uppercase">
                    Divine Pantheon
                  </h2>
                  <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">• Primordial Invocations</span>
                </div>
                <span className="text-[10px] font-mono text-rose-300 bg-rose-950/50 border border-rose-500/40 px-2 py-0.5 rounded">
                  Price: <span className="font-bold text-amber-400">50 Shards</span>
                </span>
              </div>

              {/* 3 Compact Divine Cards Grid (Height ~370px) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {CARD_TEMPLATES.filter(c => c.tier === 'divine').map((card) => {
                  const ownedCount = (profile.collection || []).filter(c => c.baseId === card.baseId).length;
                  const isBuyingThis = buyingCardId === card.baseId;

                  return (
                    <div 
                      key={card.baseId} 
                      className="bg-gradient-to-b from-[#1c080d] via-[#14060a] to-black border border-rose-500/40 hover:border-rose-400/90 rounded-xl p-3 flex flex-col justify-between shadow-xl transition-all duration-300 group"
                    >
                      <div className="space-y-2">
                        {/* Compact Card Portrait with Inset Stats */}
                        <div className="relative aspect-[3/2.8] rounded-lg overflow-hidden border border-rose-400/40 bg-black/60 shadow">
                          <img 
                            src={card.image} 
                            alt={card.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30 pointer-events-none" />

                          {/* Top Badges */}
                          <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between">
                            <span className="px-1.5 py-0.2 rounded font-mono text-[8px] uppercase font-black tracking-wider bg-rose-950 text-rose-300 border border-rose-400">
                              DIVINE
                            </span>
                            <div className="flex items-center gap-1">
                              {renderManaIcon(getCardManaCost(card), "w-4 h-4")}
                              <div className="bg-black/80 border border-rose-400/40 rounded px-1.5 py-0.2 text-[8px] font-mono font-bold text-blue-300">
                                ⏳ {card.delay}
                              </div>
                            </div>
                          </div>

                          {/* Bottom Stats */}
                          <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between">
                            <div className="bg-black/85 border border-red-500/60 rounded px-2 py-0.5 text-[10px] font-mono font-black text-red-400">
                              ⚔️ {card.attack}
                            </div>
                            <div className="bg-black/85 border border-emerald-500/60 rounded px-2 py-0.5 text-[10px] font-mono font-black text-emerald-400">
                              ❤️ {card.health}
                            </div>
                          </div>
                        </div>

                        {/* Title & Owned Badge */}
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-display font-black text-xs text-white group-hover:text-rose-400 transition-colors truncate">
                            {card.name}
                          </h4>
                          {ownedCount > 0 && (
                            <span className="shrink-0 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[8px] font-mono px-1.5 py-0.2 rounded font-bold">
                              OWNED: {ownedCount}
                            </span>
                          )}
                        </div>

                        {/* Inline Skills Pills with hover info */}
                        <div className="space-y-1">
                          {card.skills.map((skill, sIdx) => (
                            <div 
                              key={sIdx} 
                              title={skill.description}
                              className="bg-black/60 border border-white/10 rounded px-2 py-1 text-[9px] flex items-center justify-between gap-1 cursor-help hover:border-rose-400/40"
                            >
                              <span className="font-bold text-rose-300 uppercase shrink-0">
                                [{skill.type} {skill.value}]
                              </span>
                              <span className="text-gray-400 truncate text-[8px]">
                                {skill.description}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Buy Button */}
                      <div className="mt-3 pt-2 border-t border-white/10">
                        <button
                          disabled={isBuyingThis}
                          onClick={() => buyDivineCard(card.baseId)}
                          className="w-full bg-gradient-to-r from-rose-600 via-red-500 to-rose-600 hover:from-rose-500 hover:to-red-400 text-white font-display font-black tracking-widest py-2 px-2.5 rounded-lg transition-all shadow flex items-center justify-center gap-1.5 text-xs uppercase cursor-pointer disabled:opacity-50 active:scale-95"
                        >
                          <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain" />
                          {isBuyingThis ? 'INVOKING...' : 'SUMMON 50 SHARDS'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===================== 4. DEMIURGE RELICS (SPLIT-VIEW NO-SCROLL) ===================== */}
          {activeCategory === 'demiurge' && (
            <div className="space-y-3.5">
              
              {/* Compact Header */}
              <div className="flex items-center justify-between border-b border-rose-950/60 pb-2">
                <div className="flex items-center gap-2">
                  <Sword className="w-4 h-4 text-rose-400" />
                  <h2 className="font-display font-black text-lg text-white tracking-widest text-shadow-gold uppercase">
                    Relics of the Demiurge
                  </h2>
                  <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">• 6-Piece Divine Set</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-rose-300 bg-rose-950/60 border border-rose-500/40 px-2.5 py-0.5 rounded font-bold">
                    ASSEMBLED: <span className="text-amber-400">{ownedDemiurgeCount} / 6</span>
                  </span>
                </div>
              </div>

              {/* Zero-Scroll Split Layout: Left Selector + Right Focus Showcase */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                
                {/* Left: 6-Slot Grid + Set Milestones (7 Columns) */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-3 bg-black/40 border border-white/5 rounded-xl p-3">
                  
                  {/* 6 Clickable Relic Tiles */}
                  <div>
                    <div className="text-[9px] font-mono text-gray-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>SELECT ARTIFACT TO FORGE:</span>
                      <span className="text-[8px] text-gray-500">Click to preview</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {demiurgeItems.map((item) => {
                        const isOwned = (profile.equipment || []).some(e => e.name === item.name);
                        const isEquipped = Object.values(profile.equipped || {}).some(id => {
                          const eq = (profile.equipment || []).find(e => e.id === id);
                          return eq?.name === item.name;
                        });
                        const isSelected = selectedDemiurgeItem.name === item.name;

                        return (
                          <button
                            key={item.name}
                            onClick={() => {
                              audioSystem.playClick();
                              setSelectedDemiurgeItem(item);
                            }}
                            className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex items-center gap-2 relative ${
                              isSelected
                                ? 'bg-gradient-to-r from-rose-950 to-red-950/80 border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                                : isEquipped
                                ? 'bg-cyan-950/30 border-cyan-500/40 hover:border-cyan-400'
                                : isOwned
                                ? 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-400'
                                : 'bg-black/60 border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img 
                              src={getEquipmentIcon(item.name, item.slot)} 
                              alt={item.name} 
                              className="w-8 h-8 object-contain shrink-0 drop-shadow" 
                            />
                            <div className="min-w-0 flex-1">
                              <span className="text-[8px] font-mono text-gray-400 block uppercase truncate leading-none">
                                {item.slot}
                              </span>
                              <span className={`text-[10px] font-display font-bold block truncate mt-0.5 ${
                                isSelected ? 'text-white' : isEquipped ? 'text-cyan-300' : isOwned ? 'text-emerald-300' : 'text-gray-300'
                              }`}>
                                {item.name.replace(' of the Demiurge', '')}
                              </span>
                            </div>

                            {/* Status Icon */}
                            {isEquipped ? (
                              <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 shadow-[0_0_6px_rgba(6,182,212,0.8)]" title="Equipped" />
                            ) : isOwned ? (
                              <Check className="w-3 h-3 text-emerald-400 shrink-0" title="Owned" />
                            ) : (
                              <Lock className="w-2.5 h-2.5 text-gray-600 shrink-0" title="Unforged" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3 Set Milestones Badges (Horizontal Stack) */}
                  <div className="space-y-1.5 pt-1.5 border-t border-white/5">
                    <div className="text-[9px] font-mono text-rose-400 uppercase tracking-wider font-bold">
                      SET RESONANCE SYNERGY:
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {DEMIURGE_SET.thresholds.map((threshold, tIdx) => {
                        const isAchieved = ownedDemiurgeCount >= threshold.pieces;
                        return (
                          <div 
                            key={tIdx}
                            className={`p-1.5 rounded-lg border text-[9px] font-mono transition-all ${
                              isAchieved
                                ? 'bg-rose-950/80 border-rose-400 text-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                                : 'bg-black/50 border-white/10 text-gray-500 opacity-60'
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold mb-0.5">
                              <span>[{threshold.pieces} PC]</span>
                              <span className={`text-[7px] px-1 rounded font-black ${isAchieved ? 'bg-rose-500/40 text-rose-200' : 'text-gray-600'}`}>
                                {isAchieved ? 'ACTIVE' : 'LOCKED'}
                              </span>
                            </div>
                            <div className="text-[8px] font-sans text-gray-300 leading-tight line-clamp-2">
                              {threshold.description}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Right: Selected Relic Focus Showcase (5 Columns) */}
                {(() => {
                  const item = selectedDemiurgeItem;
                  const isOwned = (profile.equipment || []).some(e => e.name === item.name);
                  const isEquipped = Object.values(profile.equipped || {}).some(id => {
                    const eq = (profile.equipment || []).find(e => e.id === id);
                    return eq?.name === item.name;
                  });
                  const isForging = buyingEquipName === item.name;

                  return (
                    <div className="lg:col-span-5 bg-gradient-to-b from-[#1c080d] via-[#14060a] to-black border-2 border-rose-500/50 rounded-xl p-3.5 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                      
                      <div className="space-y-3">
                        {/* Header tag */}
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded font-mono text-[9px] uppercase font-black tracking-wider bg-rose-950/80 text-rose-300 border border-rose-500/50">
                            {item.slot}
                          </span>
                          {isEquipped ? (
                            <span className="bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-[8px] font-mono px-2 py-0.5 rounded-full font-bold">
                              EQUIPPED
                            </span>
                          ) : isOwned ? (
                            <span className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[8px] font-mono px-2 py-0.5 rounded-full font-bold">
                              OWNED
                            </span>
                          ) : (
                            <span className="bg-rose-950/80 border border-rose-500/40 text-rose-300 text-[8px] font-mono px-2 py-0.5 rounded-full font-bold">
                              AVAILABLE TO FORGE
                            </span>
                          )}
                        </div>

                        {/* Center Icon Box */}
                        <div className="aspect-[4/2.6] rounded-xl bg-black/60 border border-rose-400/30 flex items-center justify-center p-3 shadow-inner">
                          <img 
                            src={getEquipmentIcon(item.name, item.slot)} 
                            alt={item.name} 
                            className="w-24 h-24 object-contain filter drop-shadow-[0_0_16px_rgba(244,63,94,0.7)] hover:scale-105 transition-transform" 
                          />
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h3 className="font-display font-black text-sm text-white leading-tight">
                            {item.name}
                          </h3>
                          <p className="text-[10px] text-gray-400 font-sans mt-0.5 leading-snug line-clamp-2">
                            {item.description}
                          </p>
                        </div>

                        {/* Stats Box */}
                        <div className="bg-black/60 border border-white/10 rounded-lg p-2 text-[10px] font-mono space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Primary Power:</span>
                            <span className="text-rose-300 font-black">
                              {item.bonusType === 'delayReduction' ? `-${item.bonusValue} Delay` :
                               item.bonusType === 'dodge' ? `+${item.bonusValue}% Dodge` :
                               item.bonusType === 'goldBonus' ? `+${item.bonusValue}% Gold` :
                               `+${item.bonusValue} Max HP`}
                            </span>
                          </div>
                          {item.secondaryBonusType && (
                            <div className="flex items-center justify-between border-t border-white/5 pt-0.5">
                              <span className="text-gray-400">Secondary Power:</span>
                              <span className="text-rose-300 font-black">
                                {item.secondaryBonusType === 'dodge' ? `+${item.secondaryBonusValue}% Dodge` :
                                 `+${item.secondaryBonusValue} Max HP`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Forge Action Button */}
                      <div className="mt-3 pt-2 border-t border-white/10">
                        <button
                          disabled={isForging}
                          onClick={() => buyDivineEquipment(item.name)}
                          className="w-full bg-gradient-to-r from-rose-600 via-red-500 to-rose-600 hover:from-rose-500 hover:to-red-400 text-white font-display font-black tracking-widest py-2.5 px-3 rounded-lg transition-all shadow-[0_0_15px_rgba(244,63,94,0.4)] flex items-center justify-center gap-1.5 text-xs uppercase cursor-pointer disabled:opacity-50 active:scale-95"
                        >
                          <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain" />
                          {isForging ? 'FORGING...' : isOwned ? 'FORGE DUPLICATE (50 SHARDS)' : 'FORGE FOR 50 SHARDS'}
                        </button>
                      </div>

                    </div>
                  );
                })()}

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
