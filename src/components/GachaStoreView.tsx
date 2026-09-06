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
  Sparkles,
  Clock
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

export type ShopCategory = 'boosters' | 'chests' | 'pantheon' | 'demiurge' | 'shields';

interface GachaStoreViewProps {
  initialTab?: 'cards' | 'equipment' | 'divine' | 'shields';
}

export const GachaStoreView: React.FC<GachaStoreViewProps> = ({ initialTab = 'cards' }) => {
  const { profile, setProfile, setIsShardsShopOpen, buyShield } = useGame();
  const toast = useToast();
  
  // Map initialTab to sidebar category
  const getCategoryFromTab = (tab?: string): ShopCategory => {
    if (tab === 'equipment') return 'chests';
    if (tab === 'divine') return 'demiurge';
    if (tab === 'shields') return 'shields';
    return 'boosters';
  };

  const [activeCategory, setActiveCategory] = useState<ShopCategory>(getCategoryFromTab(initialTab));
  const [isBuyingShield, setIsBuyingShield] = useState<string | null>(null);

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

  const [selectedDemiurgeItemName, setSelectedDemiurgeItemName] = useState<string>(demiurgeItems[0]?.name || 'Blade of the Demiurge');
  const [isBuyingSet, setIsBuyingSet] = useState(false);

  // Buy Full Demiurge Set (discounted 250 Shards instead of 300)
  const buyDivineSet = async () => {
    const bundleCost = 250;
    if ((profile.darkShards || 0) < bundleCost) {
      setIsShardsShopOpen(true);
      toast(`Insufficient Dark Shards! Bundle costs ${bundleCost} Shards. Opening Shards Shop...`, 'warning');
      return;
    }

    try {
      setIsBuyingSet(true);
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
        body: JSON.stringify({ action: 'buy_divine_set' })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.profile) {
          setProfile(data.profile);
        }
        audioSystem.playVictory();
        triggerOpeningAnimationBackend('divine_equip', [], data.newEquipments || []);
        toast('✨ All 6 pieces of the Demiurge Set have been forged!', 'success');
      } else {
        toast(data.error || 'Failed to forge complete set', 'error');
      }
    } catch (err: any) {
      console.error('Divine set purchase error:', err);
      toast('Network error during bundle purchase', 'error');
    } finally {
      setIsBuyingSet(false);
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
    <div className="max-w-7xl mx-auto px-2 sm:px-4 pt-2 sm:pt-3 pb-1">
      
      {/* MAIN STORE VIEW: SIDEBAR + MAIN SHOWCASE */}
      <div className="flex flex-col md:flex-row gap-4 lg:gap-5 items-stretch">
        
        {/* Left Sidebar Navigation (Dark Gothic RPG Store Menu) */}
        <div className="w-full md:w-64 lg:w-72 shrink-0 bg-gradient-to-b from-[#121620]/95 via-[#0c0f16]/95 to-[#08090e]/95 border border-amber-500/20 rounded-2xl p-3 flex flex-row md:flex-col gap-2.5 shadow-2xl backdrop-blur-md overflow-x-auto md:overflow-x-visible relative overflow-hidden">
          
          {/* Subtle ambient lighting */}
          <div className="absolute -top-16 -left-16 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Shop Header in Sidebar (Stylized Gothic Title Banner) */}
          <div className="hidden md:flex items-center justify-center py-3.5 px-3 border-b border-amber-500/20 mb-2 relative z-10">
            <div className="flex items-center gap-2.5">
              <span className="h-[1px] w-6 sm:w-8 bg-gradient-to-r from-transparent via-amber-500/60 to-amber-400" />
              <h2 className="font-display font-black text-lg lg:text-xl tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-200 to-amber-500 drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)] uppercase select-none">
                VOID SHOP
              </h2>
              <span className="h-[1px] w-6 sm:w-8 bg-gradient-to-l from-transparent via-amber-500/60 to-amber-400" />
            </div>
          </div>

          {/* 1. Card Boosters */}
          <button
            onClick={() => {
              audioSystem.playClick();
              setActiveCategory('boosters');
            }}
            className={`w-full text-left p-2.5 sm:p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 shrink-0 md:shrink group relative overflow-hidden ${
              activeCategory === 'boosters'
                ? 'bg-gradient-to-r from-[#0c2430] via-[#091a24] to-[#07131b] text-white border-cyan-400/80 shadow-[0_0_20px_rgba(102,252,241,0.25)] ring-1 ring-cyan-400/30'
                : 'bg-[#10141d]/60 text-gray-400 border-white/5 hover:border-cyan-500/40 hover:bg-cyan-950/20 hover:text-cyan-200'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-12 h-12 rounded-xl p-1 flex items-center justify-center border shrink-0 relative overflow-hidden transition-all group-hover:scale-105 ${
                activeCategory === 'boosters'
                  ? 'bg-gradient-to-b from-cyan-950 to-black border-cyan-400/80 shadow-[0_0_14px_rgba(102,252,241,0.4)]'
                  : 'bg-black/60 border-white/10 group-hover:border-cyan-500/40'
              }`}>
                <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(102,252,241,0.3),transparent_70%)] ${activeCategory === 'boosters' ? 'opacity-100' : 'opacity-20'}`} />
                <img
                  src="/packs/pack_obsidian.webp"
                  alt="Card Boosters"
                  className={`w-full h-full object-contain relative z-10 filter ${activeCategory === 'boosters' ? 'drop-shadow-[0_0_8px_rgba(102,252,241,0.8)]' : 'opacity-80'}`}
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-black text-xs sm:text-sm tracking-wider uppercase text-white group-hover:text-cyan-200 transition-colors">
                    Card Boosters
                  </span>
                  <span className="bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-[8px] font-mono px-1.5 py-0.2 rounded font-black tracking-wider hidden md:inline shadow-[0_0_6px_rgba(6,182,212,0.3)]">
                    3 PACKS
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 font-mono hidden md:block">
                  Packs & Summoning
                </div>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 hidden md:block transition-transform group-hover:translate-x-0.5 ${activeCategory === 'boosters' ? 'text-cyan-300' : 'text-gray-600'}`} />
          </button>

          {/* 2. Relic Chests */}
          <button
            onClick={() => {
              audioSystem.playClick();
              setActiveCategory('chests');
            }}
            className={`w-full text-left p-2.5 sm:p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 shrink-0 md:shrink group relative overflow-hidden ${
              activeCategory === 'chests'
                ? 'bg-gradient-to-r from-[#230d36] via-[#190927] to-[#11051b] text-white border-purple-400/80 shadow-[0_0_20px_rgba(168,85,247,0.25)] ring-1 ring-purple-400/30'
                : 'bg-[#10141d]/60 text-gray-400 border-white/5 hover:border-purple-500/40 hover:bg-purple-950/20 hover:text-purple-200'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-12 h-12 rounded-xl p-1 flex items-center justify-center border shrink-0 relative overflow-hidden transition-all group-hover:scale-105 ${
                activeCategory === 'chests'
                  ? 'bg-gradient-to-b from-purple-950 to-black border-purple-400/80 shadow-[0_0_14px_rgba(168,85,247,0.4)]'
                : 'bg-black/60 border-white/10 group-hover:border-purple-500/40'
              }`}>
                <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.3),transparent_70%)] ${activeCategory === 'chests' ? 'opacity-100' : 'opacity-20'}`} />
                <img
                  src="/packs/chest_premium.webp"
                  alt="Relic Chests"
                  className={`w-full h-full object-contain relative z-10 filter ${activeCategory === 'chests' ? 'drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'opacity-80'}`}
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-black text-xs sm:text-sm tracking-wider uppercase text-white group-hover:text-purple-200 transition-colors">
                    Relic Chests
                  </span>
                  <span className="bg-purple-950/80 border border-purple-500/50 text-purple-300 text-[8px] font-mono px-1.5 py-0.2 rounded font-black tracking-wider hidden md:inline shadow-[0_0_6px_rgba(168,85,247,0.3)]">
                    GEAR
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 font-mono hidden md:block">
                  Lord Armaments
                </div>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 hidden md:block transition-transform group-hover:translate-x-0.5 ${activeCategory === 'chests' ? 'text-purple-300' : 'text-gray-600'}`} />
          </button>

          {/* 3. Divine Pantheon */}
          <button
            onClick={() => {
              audioSystem.playClick();
              setActiveCategory('pantheon');
            }}
            className={`w-full text-left p-2.5 sm:p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 shrink-0 md:shrink group relative overflow-hidden ${
              activeCategory === 'pantheon'
                ? 'bg-gradient-to-r from-amber-950/90 via-[#221508] to-black text-white border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/30'
                : 'bg-[#10141d]/60 text-gray-400 border-white/5 hover:border-amber-500/40 hover:bg-amber-950/20 hover:text-amber-200'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-12 h-12 rounded-xl p-1.5 flex items-center justify-center border shrink-0 relative overflow-hidden transition-all group-hover:scale-105 ${
                activeCategory === 'pantheon'
                  ? 'bg-gradient-to-b from-amber-950 to-black border-amber-400/80 shadow-[0_0_14px_rgba(245,158,11,0.4)]'
                  : 'bg-black/60 border-white/10 group-hover:border-amber-500/40'
              }`}>
                <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.35),transparent_70%)] ${activeCategory === 'pantheon' ? 'opacity-100' : 'opacity-20'}`} />
                <img
                  src="/icons/crown.png"
                  alt="Divine Pantheon"
                  className={`w-full h-full object-contain relative z-10 filter ${activeCategory === 'pantheon' ? 'drop-shadow-[0_0_8px_rgba(245,158,11,0.85)]' : 'opacity-80'}`}
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-black text-xs sm:text-sm tracking-wider uppercase text-white group-hover:text-amber-200 transition-colors">
                    Divine Pantheon
                  </span>
                  <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-black text-[8px] font-mono px-1 py-0.2 rounded font-black tracking-wider hidden md:inline shadow-[0_0_8px_rgba(245,158,11,0.4)]">
                    EXCLUSIVE
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 font-mono hidden md:block">
                  3 Primordial Invocations
                </div>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 hidden md:block transition-transform group-hover:translate-x-0.5 ${activeCategory === 'pantheon' ? 'text-amber-300' : 'text-gray-600'}`} />
          </button>

          {/* 4. Demiurge Relics */}
          <button
            onClick={() => {
              audioSystem.playClick();
              setActiveCategory('demiurge');
            }}
            className={`w-full text-left p-2.5 sm:p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 shrink-0 md:shrink group relative overflow-hidden ${
              activeCategory === 'demiurge'
                ? 'bg-gradient-to-r from-rose-950/95 via-red-950/80 to-black text-white border-rose-400/80 shadow-[0_0_20px_rgba(244,63,94,0.35)] ring-1 ring-rose-400/30'
                : 'bg-[#10141d]/60 text-gray-400 border-white/5 hover:border-rose-500/40 hover:bg-rose-950/20 hover:text-rose-200'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-12 h-12 rounded-xl p-1.5 flex items-center justify-center border shrink-0 relative overflow-hidden transition-all group-hover:scale-105 ${
                activeCategory === 'demiurge'
                  ? 'bg-gradient-to-b from-rose-950 to-black border-rose-400/80 shadow-[0_0_14px_rgba(244,63,94,0.4)]'
                  : 'bg-black/60 border-white/10 group-hover:border-rose-500/40'
              }`}>
                <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.35),transparent_70%)] ${activeCategory === 'demiurge' ? 'opacity-100' : 'opacity-20'}`} />
                <img
                  src="/icons/equipment/demiurge_crest.png"
                  alt="Demiurge Relics"
                  className={`w-full h-full object-contain relative z-10 filter ${activeCategory === 'demiurge' ? 'drop-shadow-[0_0_8px_rgba(244,63,94,0.85)]' : 'opacity-80'}`}
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-black text-xs sm:text-sm tracking-wider uppercase text-white group-hover:text-rose-200 transition-colors">
                    Demiurge Relics
                  </span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-black tracking-wider border ${
                    ownedDemiurgeCount === 6
                      ? 'bg-emerald-950 border-emerald-500/60 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                      : 'bg-rose-950 border-rose-500/60 text-rose-300'
                  }`}>
                    {ownedDemiurgeCount}/6
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 font-mono hidden md:block">
                  6-Piece Divine Set
                </div>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 hidden md:block transition-transform group-hover:translate-x-0.5 ${activeCategory === 'demiurge' ? 'text-rose-300' : 'text-gray-600'}`} />
          </button>

          {/* 5. Peace Shields */}
          <button
            onClick={() => {
              audioSystem.playClick();
              setActiveCategory('shields');
            }}
            className={`w-full text-left p-2.5 sm:p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 shrink-0 md:shrink group relative overflow-hidden ${
              activeCategory === 'shields'
                ? 'bg-gradient-to-r from-[#0c291e] via-[#081f17] to-[#05140f] text-white border-emerald-400/80 shadow-[0_0_20px_rgba(16,185,129,0.25)] ring-1 ring-emerald-400/30'
                : 'bg-[#10141d]/60 text-gray-400 border-white/5 hover:border-emerald-500/40 hover:bg-emerald-950/20 hover:text-emerald-200'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-12 h-12 rounded-xl p-1 flex items-center justify-center border shrink-0 relative overflow-hidden transition-all group-hover:scale-105 ${
                activeCategory === 'shields'
                  ? 'bg-gradient-to-b from-emerald-950 to-black border-emerald-400/80 shadow-[0_0_14px_rgba(16,185,129,0.4)]'
                  : 'bg-black/60 border-white/10 group-hover:border-emerald-500/40'
              }`}>
                <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.3),transparent_70%)] ${activeCategory === 'shields' ? 'opacity-100' : 'opacity-20'}`} />
                <img
                  src="/icons/shield_indicator.png"
                  alt="Peace Shields"
                  className={`w-full h-full object-contain relative z-10 filter ${activeCategory === 'shields' ? 'drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'opacity-80'}`}
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-black text-xs sm:text-sm tracking-wider uppercase text-white group-hover:text-emerald-200 transition-colors">
                    Peace Shields
                  </span>
                  <span className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[8px] font-mono px-1.5 py-0.2 rounded font-black tracking-wider hidden md:inline shadow-[0_0_6px_rgba(16,185,129,0.3)]">
                    DEFENSE
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 font-mono hidden md:block">
                  Territory Wards
                </div>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 hidden md:block transition-transform group-hover:translate-x-0.5 ${activeCategory === 'shields' ? 'text-emerald-300' : 'text-gray-600'}`} />
          </button>

        </div>

        {/* Right Showcase Viewport */}
        <div className="flex-1 min-w-0 bg-[#0c0f14]/85 border border-white/10 rounded-2xl p-3 sm:p-4 shadow-2xl backdrop-blur-md flex flex-col justify-between">
          
          {/* ===================== 1. CARD BOOSTERS (PREMIUM VIEWPORT FIT) ===================== */}
          {activeCategory === 'boosters' && (
            <div className="space-y-3 sm:space-y-3.5">
              
              {/* Category Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-cyan-950/80 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="font-display font-black text-base sm:text-lg text-white tracking-widest text-shadow-gold uppercase">
                      Card Boosters
                    </h2>
                    <p className="text-[9.5px] sm:text-[10.5px] text-gray-400 font-mono leading-none">Summon ancient creatures & warlords from the Nether Realm</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-[9.5px] font-mono px-2.5 py-0.5 rounded-full font-bold shadow-sm flex items-center gap-1.5">
                    <Box className="w-3 h-3 text-cyan-400" /> 3 CARDS PER PACK
                  </span>
                </div>
              </div>

              {/* 3 Pack Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 lg:gap-4">
                
                {/* Bronze Pack */}
                <div className="bg-gradient-to-b from-[#1c150e] via-[#120e09] to-[#0a0705] border-2 border-amber-600/40 hover:border-amber-400/90 rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between shadow-xl hover:shadow-[0_0_30px_rgba(245,158,11,0.25)] transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-600/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />
                  
                  <div className="space-y-2.5 sm:space-y-3 relative z-10">
                    {/* Top Tier Tag */}
                    <div className="flex items-center justify-between text-[8.5px] font-mono font-bold tracking-wider text-amber-400/90 uppercase px-1">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        COMMON SUMMON
                      </span>
                      <span className="bg-amber-950/80 border border-amber-500/40 px-1.5 py-0.2 rounded text-[7.5px] text-amber-300">
                        TIER I
                      </span>
                    </div>

                    {/* Pack Art Box */}
                    <div className="h-38 sm:h-42 rounded-xl bg-gradient-to-b from-amber-950/40 via-black/60 to-black/80 border border-amber-600/30 flex flex-col items-center justify-center relative overflow-hidden group-hover:border-amber-400/60 transition-colors shadow-inner">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.18),transparent_70%)]" />
                      <img 
                        src="/packs/pack_bronze.webp" 
                        alt="Bronze Pack" 
                        decoding="async" 
                        className="w-32 h-32 sm:w-36 sm:h-36 object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_20px_rgba(245,158,11,0.4)]" 
                      />
                      <div className="absolute bottom-1.5 px-2.5 py-0.5 rounded-full bg-black/80 border border-amber-500/50 backdrop-blur-sm shadow-md">
                        <span className="font-display font-black text-[9px] text-amber-300 tracking-widest uppercase">
                          BRONZE PACK
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-display font-black text-sm sm:text-base text-white group-hover:text-amber-300 transition-colors">
                        Bronze Booster
                      </h4>
                      <p className="text-[9.5px] text-gray-400 font-sans mt-0.5 leading-tight">Recruit starter units & establish battlefield presence</p>
                    </div>

                    {/* Clean Drop Rates Box */}
                    <div className="bg-black/65 border border-white/10 rounded-xl p-2.5 text-[11px] font-mono space-y-1.5 shadow-inner">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                          Common (Bronze):
                        </span>
                        <span className="text-amber-400 font-bold text-xs bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-600/40">95%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          Rare (Silver):
                        </span>
                        <span className="text-slate-200 font-bold text-xs bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-500/40">5%</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-white/10 pt-1.5 text-gray-400 text-[10.5px]">
                        <span className="flex items-center gap-1 text-amber-300/80">
                          <Sparkles className="w-3 h-3 text-amber-400" /> Guaranteed:
                        </span>
                        <span className="text-white font-bold bg-white/5 px-1.5 py-0.5 rounded border border-white/10">Level 1 Card</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2.5 sm:mt-3 relative z-10">
                    <button
                      onClick={buyBronzePack}
                      className="w-full bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:from-amber-500 hover:via-yellow-400 hover:to-amber-500 text-black font-display font-black tracking-widest py-2.5 px-3 rounded-xl transition-all duration-300 shadow-[0_0_16px_rgba(245,158,11,0.35)] hover:shadow-[0_0_24px_rgba(245,158,11,0.6)] flex items-center justify-center gap-2 text-xs cursor-pointer hover:scale-[1.02] active:scale-95 select-none"
                    >
                      <img src="/icons/icon_gold.webp" alt="Gold" className="w-4 h-4 object-contain drop-shadow" />
                      <span className="drop-shadow-sm">300 GOLD</span>
                    </button>
                  </div>
                </div>

                {/* Obsidian Pack */}
                <div className="bg-gradient-to-b from-[#0a1824] via-[#06111a] to-[#030a10] border-2 border-cyan-500/40 hover:border-cyan-400/90 rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between shadow-xl hover:shadow-[0_0_30px_rgba(6,182,212,0.25)] transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-400/20 transition-all" />
                  
                  <div className="space-y-2.5 sm:space-y-3 relative z-10">
                    {/* Top Tier Tag */}
                    <div className="flex items-center justify-between text-[8.5px] font-mono font-bold tracking-wider text-cyan-400/90 uppercase px-1">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        VOID INFUSED
                      </span>
                      <span className="bg-cyan-950/80 border border-cyan-500/40 px-1.5 py-0.2 rounded text-[7.5px] text-cyan-300">
                        TIER II
                      </span>
                    </div>

                    {/* Pack Art Box */}
                    <div className="h-38 sm:h-42 rounded-xl bg-gradient-to-b from-cyan-950/40 via-black/60 to-black/80 border border-cyan-600/30 flex flex-col items-center justify-center relative overflow-hidden group-hover:border-cyan-400/60 transition-colors shadow-inner">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.18),transparent_70%)]" />
                      <img 
                        src="/packs/pack_obsidian.webp" 
                        alt="Obsidian Pack" 
                        decoding="async" 
                        className="w-32 h-32 sm:w-36 sm:h-36 object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]" 
                      />
                      <div className="absolute bottom-1.5 px-2.5 py-0.5 rounded-full bg-black/80 border border-cyan-500/50 backdrop-blur-sm shadow-md">
                        <span className="font-display font-black text-[9px] text-cyan-300 tracking-widest uppercase">
                          OBSIDIAN PACK
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-display font-black text-sm sm:text-base text-white group-hover:text-cyan-300 transition-colors">
                        Obsidian Set
                      </h4>
                      <p className="text-[9.5px] text-gray-400 font-sans mt-0.5 leading-tight">Infused with dark void mana for higher tier warriors</p>
                    </div>

                    {/* Clean Drop Rates Box */}
                    <div className="bg-black/65 border border-white/10 rounded-xl p-2.5 text-[11px] font-mono space-y-1.5 shadow-inner">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          Silver Cards:
                        </span>
                        <span className="text-cyan-300 font-bold text-xs bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/40">50%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          Gold Cards:
                        </span>
                        <span className="text-amber-400 font-bold text-xs bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/40">10%</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-white/10 pt-1.5 text-gray-400 text-[10.5px]">
                        <span className="flex items-center gap-1 text-cyan-300/80">
                          <Sparkles className="w-3 h-3 text-cyan-400" /> Level 2 Chance:
                        </span>
                        <span className="text-cyan-300 font-bold bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/40">30%</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2.5 sm:mt-3 relative z-10">
                    <button
                      onClick={buyObsidianPack}
                      className="w-full bg-gradient-to-r from-cyan-950 via-[#0a2e38] to-cyan-950 hover:from-cyan-800 hover:via-[#104b5c] hover:to-cyan-800 text-cyan-200 hover:text-white border border-cyan-400/60 hover:border-cyan-300 font-display font-black tracking-widest py-2.5 px-3 rounded-xl transition-all duration-300 shadow-[0_0_16px_rgba(6,182,212,0.3)] hover:shadow-[0_0_24px_rgba(6,182,212,0.55)] flex items-center justify-center gap-2 text-xs cursor-pointer hover:scale-[1.02] active:scale-95 select-none"
                    >
                      <img src="/icons/icon_shards.webp" alt="Shards" className="w-3.5 h-3.5 object-contain drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                      <span>30 SHARDS</span>
                    </button>
                  </div>
                </div>

                {/* Abyssal Pack */}
                <div className="bg-gradient-to-b from-[#240810] via-[#16050b] to-[#0c0205] border-2 border-rose-500/50 hover:border-rose-400/95 rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between shadow-xl hover:shadow-[0_0_35px_rgba(244,63,94,0.3)] transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/15 rounded-full blur-2xl pointer-events-none group-hover:bg-rose-500/30 transition-all" />
                  
                  <div className="space-y-2.5 sm:space-y-3 relative z-10">
                    {/* Top Tier Tag */}
                    <div className="flex items-center justify-between text-[8.5px] font-mono font-bold tracking-wider text-rose-400/90 uppercase px-1">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                        FORBIDDEN SUMMON
                      </span>
                      <span className="bg-rose-950/80 border border-rose-500/50 px-1.5 py-0.2 rounded text-[7.5px] text-rose-300">
                        TIER III
                      </span>
                    </div>

                    {/* Pack Art Box */}
                    <div className="h-38 sm:h-42 rounded-xl bg-gradient-to-b from-rose-950/40 via-black/60 to-black/80 border border-rose-600/30 flex flex-col items-center justify-center relative overflow-hidden group-hover:border-rose-400/60 transition-colors shadow-inner">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(244,63,94,0.22),transparent_70%)]" />
                      <img 
                        src="/packs/pack_abyssal.webp" 
                        alt="Abyssal Pack" 
                        decoding="async" 
                        className="w-32 h-32 sm:w-36 sm:h-36 object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_20px_rgba(244,63,94,0.45)]" 
                      />
                      <div className="absolute bottom-1.5 px-2.5 py-0.5 rounded-full bg-black/80 border border-rose-500/50 backdrop-blur-sm shadow-md">
                        <span className="font-display font-black text-[9px] text-rose-300 tracking-widest uppercase">
                          ABYSSAL PACK
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-display font-black text-sm sm:text-base text-white group-hover:text-rose-300 transition-colors">
                        Abyssal Lord Pack
                      </h4>
                      <p className="text-[9.5px] text-gray-400 font-sans mt-0.5 leading-tight">High rate for Gold & Legendary primordial entities</p>
                    </div>

                    {/* Clean Drop Rates Box */}
                    <div className="bg-black/65 border border-white/10 rounded-xl p-2.5 text-[11px] font-mono space-y-1.5 shadow-inner">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          Gold Cards:
                        </span>
                        <span className="text-amber-400 font-bold text-xs bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/40">45%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                          Legendary Cards:
                        </span>
                        <span className="text-purple-300 font-bold text-xs bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-500/40">15%</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-white/10 pt-1.5 text-gray-400 text-[10.5px]">
                        <span className="flex items-center gap-1 text-rose-300/80">
                          <Sparkles className="w-3 h-3 text-rose-400" /> Level 2 Chance:
                        </span>
                        <span className="text-rose-300 font-bold bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-500/40">40%</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2.5 sm:mt-3 relative z-10">
                    <button
                      onClick={buyAbyssalPack}
                      className="w-full bg-gradient-to-r from-rose-950 via-red-900 to-rose-950 hover:from-rose-800 hover:via-red-700 hover:to-rose-800 text-rose-100 hover:text-white border border-rose-500/60 hover:border-rose-400 font-display font-black tracking-widest py-2.5 px-3 rounded-xl transition-all duration-300 shadow-[0_0_16px_rgba(244,63,94,0.35)] hover:shadow-[0_0_24px_rgba(244,63,94,0.65)] flex items-center justify-center gap-2 text-xs cursor-pointer hover:scale-[1.02] active:scale-95 select-none"
                    >
                      <img src="/icons/icon_shards.webp" alt="Shards" className="w-3.5 h-3.5 object-contain drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                      <span>70 SHARDS</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ===================== 2. RELIC CHESTS (PREMIUM VIEWPORT FIT) ===================== */}
          {activeCategory === 'chests' && (
            <div className="space-y-3 sm:space-y-3.5">
              
              {/* Category Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-purple-950/80 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-950/60 border border-purple-500/40 flex items-center justify-center shadow-[0_0_12px_rgba(168,85,247,0.3)]">
                    <Shield className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="font-display font-black text-base sm:text-lg text-white tracking-widest text-shadow-gold uppercase">
                      Relic Chests
                    </h2>
                    <p className="text-[9.5px] sm:text-[10.5px] text-gray-400 font-mono leading-none">Unearth enchanted weapons, armor & sacred Lord relics</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-purple-950/80 border border-purple-500/50 text-purple-300 text-[9.5px] font-mono px-2.5 py-0.5 rounded-full font-bold shadow-sm flex items-center gap-1.5">
                    <Shield className="w-3 h-3 text-purple-400" /> 1 EQUIPMENT PER CHEST
                  </span>
                  <span className="text-[9.5px] font-mono text-purple-300 bg-black/60 border border-purple-500/30 px-2 py-0.5 rounded-full hidden sm:inline font-bold">
                    LORD ARMAMENTS
                  </span>
                </div>
              </div>

              {/* 3 Chest Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 lg:gap-4">
                
                {/* Basic Chest */}
                <div className="bg-gradient-to-b from-[#1c150e] via-[#120e09] to-[#0a0705] border-2 border-amber-600/40 hover:border-amber-400/90 rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between shadow-xl hover:shadow-[0_0_30px_rgba(245,158,11,0.25)] transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-600/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />
                  
                  <div className="space-y-2.5 sm:space-y-3 relative z-10">
                    {/* Top Tier Tag */}
                    <div className="flex items-center justify-between text-[8.5px] font-mono font-bold tracking-wider text-amber-400/90 uppercase px-1">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        STANDARD RELICS
                      </span>
                      <span className="bg-amber-950/80 border border-amber-500/40 px-1.5 py-0.2 rounded text-[7.5px] text-amber-300">
                        RANK I
                      </span>
                    </div>

                    {/* Chest Art Box */}
                    <div className="h-38 sm:h-42 rounded-xl bg-gradient-to-b from-amber-950/40 via-black/60 to-black/80 border border-amber-600/30 flex flex-col items-center justify-center relative overflow-hidden group-hover:border-amber-400/60 transition-colors shadow-inner">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.18),transparent_70%)]" />
                      <img 
                        src="/packs/chest_basic.webp" 
                        alt="Basic Relics" 
                        decoding="async" 
                        className="w-32 h-32 sm:w-36 sm:h-36 object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_20px_rgba(245,158,11,0.4)]" 
                      />
                      <div className="absolute bottom-1.5 px-2.5 py-0.5 rounded-full bg-black/80 border border-amber-500/50 backdrop-blur-sm shadow-md">
                        <span className="font-display font-black text-[9px] text-amber-300 tracking-widest uppercase">
                          BASIC RELICS
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-display font-black text-sm sm:text-base text-white group-hover:text-amber-300 transition-colors">
                        Basic Equipment Chest
                      </h4>
                      <p className="text-[9.5px] text-gray-400 font-sans mt-0.5 leading-tight">Forged for new lords entering the Abyssal Trials</p>
                    </div>

                    {/* Clean Drop Rates Box */}
                    <div className="bg-black/65 border border-white/10 rounded-xl p-2.5 text-[11px] font-mono space-y-1.5 shadow-inner">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                          Bronze Equipment:
                        </span>
                        <span className="text-amber-400 font-bold text-xs bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-600/40">80%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          Silver Equipment:
                        </span>
                        <span className="text-slate-200 font-bold text-xs bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-500/40">20%</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-white/10 pt-1.5 text-gray-400 text-[10.5px]">
                        <span className="flex items-center gap-1 text-amber-300/80">
                          <Shield className="w-3 h-3 text-amber-400" /> Tier Range:
                        </span>
                        <span className="text-white font-bold bg-white/5 px-1.5 py-0.5 rounded border border-white/10">Bronze – Silver</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2.5 sm:mt-3 relative z-10">
                    <button
                      onClick={buyBasicEquipmentPack}
                      className="w-full bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:from-amber-500 hover:via-yellow-400 hover:to-amber-500 text-black font-display font-black tracking-widest py-2.5 px-3 rounded-xl transition-all duration-300 shadow-[0_0_16px_rgba(245,158,11,0.35)] hover:shadow-[0_0_24px_rgba(245,158,11,0.6)] flex items-center justify-center gap-2 text-xs cursor-pointer hover:scale-[1.02] active:scale-95 select-none"
                    >
                      <img src="/icons/icon_gold.webp" alt="Gold" className="w-4 h-4 object-contain drop-shadow" />
                      <span className="drop-shadow-sm">500 GOLD</span>
                    </button>
                  </div>
                </div>

                {/* Rare Chest */}
                <div className="bg-gradient-to-b from-[#0a1824] via-[#06111a] to-[#030a10] border-2 border-cyan-500/40 hover:border-cyan-400/90 rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between shadow-xl hover:shadow-[0_0_30px_rgba(6,182,212,0.25)] transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-400/20 transition-all" />
                  
                  <div className="space-y-2.5 sm:space-y-3 relative z-10">
                    {/* Top Tier Tag */}
                    <div className="flex items-center justify-between text-[8.5px] font-mono font-bold tracking-wider text-cyan-400/90 uppercase px-1">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        ARCANE CACHE
                      </span>
                      <span className="bg-cyan-950/80 border border-cyan-500/40 px-1.5 py-0.2 rounded text-[7.5px] text-cyan-300">
                        RANK II
                      </span>
                    </div>

                    {/* Chest Art Box */}
                    <div className="h-38 sm:h-42 rounded-xl bg-gradient-to-b from-cyan-950/40 via-black/60 to-black/80 border border-cyan-600/30 flex flex-col items-center justify-center relative overflow-hidden group-hover:border-cyan-400/60 transition-colors shadow-inner">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.18),transparent_70%)]" />
                      <img 
                        src="/packs/chest_rare.webp" 
                        alt="Rare Relics" 
                        decoding="async" 
                        className="w-32 h-32 sm:w-36 sm:h-36 object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]" 
                      />
                      <div className="absolute bottom-1.5 px-2.5 py-0.5 rounded-full bg-black/80 border border-cyan-500/50 backdrop-blur-sm shadow-md">
                        <span className="font-display font-black text-[9px] text-cyan-300 tracking-widest uppercase">
                          RARE RELICS
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-display font-black text-sm sm:text-base text-white group-hover:text-cyan-300 transition-colors">
                        Rare Equipment Chest
                      </h4>
                      <p className="text-[9.5px] text-gray-400 font-sans mt-0.5 leading-tight">Enchanted armaments granting potent stat enhancements</p>
                    </div>

                    {/* Clean Drop Rates Box */}
                    <div className="bg-black/65 border border-white/10 rounded-xl p-2.5 text-[11px] font-mono space-y-1.5 shadow-inner">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                          Bronze Equipment:
                        </span>
                        <span className="text-amber-500 font-bold text-xs bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-600/40">40%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          Silver Equipment:
                        </span>
                        <span className="text-cyan-300 font-bold text-xs bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/40">50%</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-white/10 pt-1.5 text-gray-400 text-[10.5px]">
                        <span className="flex items-center gap-1 text-amber-300/80">
                          <Sparkles className="w-3 h-3 text-amber-400" /> Gold Equipment:
                        </span>
                        <span className="text-amber-300 font-bold bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/40">10%</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2.5 sm:mt-3 relative z-10">
                    <button
                      onClick={buyRareEquipmentPack}
                      className="w-full bg-gradient-to-r from-cyan-950 via-[#0a2e38] to-cyan-950 hover:from-cyan-800 hover:via-[#104b5c] hover:to-cyan-800 text-cyan-200 hover:text-white border border-cyan-400/60 hover:border-cyan-300 font-display font-black tracking-widest py-2.5 px-3 rounded-xl transition-all duration-300 shadow-[0_0_16px_rgba(6,182,212,0.3)] hover:shadow-[0_0_24px_rgba(6,182,212,0.55)] flex items-center justify-center gap-2 text-xs cursor-pointer hover:scale-[1.02] active:scale-95 select-none"
                    >
                      <img src="/icons/icon_shards.webp" alt="Shards" className="w-3.5 h-3.5 object-contain drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                      <span>30 SHARDS</span>
                    </button>
                  </div>
                </div>

                {/* Premium Chest */}
                <div className="bg-gradient-to-b from-[#21092a] via-[#14051a] to-[#0a020d] border-2 border-purple-500/50 hover:border-amber-400/90 rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between shadow-xl hover:shadow-[0_0_35px_rgba(168,85,247,0.3)] transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/15 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/30 transition-all" />
                  
                  <div className="space-y-2.5 sm:space-y-3 relative z-10">
                    {/* Top Tier Tag */}
                    <div className="flex items-center justify-between text-[8.5px] font-mono font-bold tracking-wider text-purple-400/90 uppercase px-1">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                        IMPERIAL HOARD
                      </span>
                      <span className="bg-purple-950/80 border border-purple-500/50 px-1.5 py-0.2 rounded text-[7.5px] text-purple-300">
                        RANK III
                      </span>
                    </div>

                    {/* Chest Art Box */}
                    <div className="h-38 sm:h-42 rounded-xl bg-gradient-to-b from-purple-950/40 via-black/60 to-black/80 border border-purple-600/30 flex flex-col items-center justify-center relative overflow-hidden group-hover:border-purple-400/60 transition-colors shadow-inner">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.22),transparent_70%)]" />
                      <img 
                        src="/packs/chest_premium.webp" 
                        alt="Premium Relics" 
                        decoding="async" 
                        className="w-32 h-32 sm:w-36 sm:h-36 object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_20px_rgba(168,85,247,0.45)]" 
                      />
                      <div className="absolute bottom-1.5 px-2.5 py-0.5 rounded-full bg-black/80 border border-purple-500/50 backdrop-blur-sm shadow-md">
                        <span className="font-display font-black text-[9px] text-purple-300 tracking-widest uppercase">
                          PREMIUM RELICS
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-display font-black text-sm sm:text-base text-white group-hover:text-purple-300 transition-colors">
                        Premium Equipment Chest
                      </h4>
                      <p className="text-[9.5px] text-gray-400 font-sans mt-0.5 leading-tight">Peerless relics granting extraordinary Lord power</p>
                    </div>

                    {/* Clean Drop Rates Box */}
                    <div className="bg-black/65 border border-white/10 rounded-xl p-2.5 text-[11px] font-mono space-y-1.5 shadow-inner">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          Silver Equipment:
                        </span>
                        <span className="text-cyan-300 font-bold text-xs bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/40">60%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          Gold Equipment:
                        </span>
                        <span className="text-amber-400 font-bold text-xs bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/40">35%</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-white/10 pt-1.5 text-gray-400 text-[10.5px]">
                        <span className="flex items-center gap-1 text-purple-300/80">
                          <Sparkles className="w-3 h-3 text-purple-400" /> Legendary Equipment:
                        </span>
                        <span className="text-purple-300 font-bold bg-purple-950/80 px-1.5 py-0.5 rounded border border-purple-500/40">5%</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2.5 sm:mt-3 relative z-10">
                    <button
                      onClick={buyPremiumEquipmentPack}
                      className="w-full bg-gradient-to-r from-purple-950 via-rose-950 to-purple-950 hover:from-purple-900 hover:via-rose-900 hover:to-purple-900 text-purple-100 hover:text-white border border-purple-500/60 hover:border-purple-400 font-display font-black tracking-widest py-2.5 px-3 rounded-xl transition-all duration-300 shadow-[0_0_16px_rgba(168,85,247,0.35)] hover:shadow-[0_0_24px_rgba(168,85,247,0.65)] flex items-center justify-center gap-2 text-xs cursor-pointer hover:scale-[1.02] active:scale-95 select-none"
                    >
                      <img src="/icons/icon_shards.webp" alt="Shards" className="w-3.5 h-3.5 object-contain drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                      <span>70 SHARDS</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ===================== 3. DIVINE PANTHEON (COMPACT SCREEN FIT) ===================== */}
          {activeCategory === 'pantheon' && (
            <div className="space-y-4">
              
              {/* Category Header */}
              <div className="flex items-center justify-between border-b border-rose-950/60 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <Crown className="w-5 h-5 text-rose-400" />
                  <h2 className="font-display font-black text-lg md:text-xl text-white tracking-widest text-shadow-gold uppercase">
                    Divine Pantheon
                  </h2>
                  <span className="text-xs text-gray-400 font-mono hidden sm:inline">• 3 Primordial Invocations</span>
                </div>
              </div>

              {/* 3 Divine Cards Showcase Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
                {CARD_TEMPLATES.filter(c => c.tier === 'divine').map((card) => {
                  const ownedCount = (profile.collection || []).filter(c => c.baseId === card.baseId).length;
                  const isBuyingThis = buyingCardId === card.baseId;

                  return (
                    <div 
                      key={card.baseId} 
                      className="bg-gradient-to-b from-[#1c080d] via-[#14060a] to-black border-2 border-rose-500/40 hover:border-rose-400/90 rounded-2xl p-4 flex flex-col justify-between shadow-2xl hover:shadow-[0_0_35px_rgba(244,63,94,0.35)] transition-all duration-300 group relative overflow-hidden"
                    >
                      <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/15 rounded-full blur-2xl pointer-events-none group-hover:bg-rose-500/25 transition-all" />

                      <div className="space-y-3.5 relative z-10">
                        {/* Card Portrait & Badges */}
                        <div className="relative h-52 sm:h-56 rounded-xl overflow-hidden border border-rose-400/40 shadow-lg bg-black/60">
                          <img 
                            src={card.image} 
                            alt={card.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 pointer-events-none" />

                          {/* Tier & Delay Badges Top */}
                          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                            <span className="px-2 py-0.5 rounded-lg border font-mono text-[9px] uppercase font-black tracking-wider bg-gradient-to-r from-red-950 to-rose-900 text-rose-300 border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.7)]">
                              DIVINE
                            </span>
                            <div className="flex items-center gap-1.5">
                              {renderManaIcon(getCardManaCost(card), "w-5 h-5")}
                              <div className="bg-black/80 border border-rose-400/40 rounded-lg px-2 py-0.5 text-[9px] font-mono font-bold text-blue-300 backdrop-blur-sm shadow flex items-center gap-1">
                                <span>⏳</span> {card.delay}
                              </div>
                            </div>
                          </div>

                          {/* ATK & HP Badges Bottom */}
                          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                            <div className="bg-black/85 border border-red-500/60 rounded-lg px-2.5 py-1 text-xs font-mono font-black text-red-400 flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
                              <span className="text-xs">⚔️</span> {card.attack}
                            </div>
                            <div className="bg-black/85 border border-emerald-500/60 rounded-lg px-2.5 py-1 text-xs font-mono font-black text-emerald-400 flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
                              <span className="text-xs">❤️</span> {card.health}
                            </div>
                          </div>
                        </div>

                        {/* Card Title & Lore (Full Name, No Truncation) */}
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-display font-black text-sm lg:text-base text-white group-hover:text-rose-400 transition-colors tracking-wide leading-tight">
                              {card.name}
                            </h4>
                            {ownedCount > 0 && (
                              <span className="shrink-0 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold">
                                OWNED: {ownedCount}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-400 font-sans mt-1 line-clamp-2 leading-snug">
                            {card.description}
                          </p>
                        </div>

                        {/* Skills Box (Clean multi-line) */}
                        <div className="bg-black/60 border border-white/10 rounded-xl p-2.5 space-y-1.5">
                          <div className="text-[9px] font-mono uppercase font-bold text-rose-400 tracking-wider flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-rose-400" />
                            DIVINE SKILLS:
                          </div>
                          <div className="space-y-1">
                            {card.skills.map((skill, sIdx) => (
                              <div key={sIdx} className="flex items-start gap-1.5 text-[10px] leading-snug">
                                <span className="font-mono font-bold text-rose-300 uppercase shrink-0">[{skill.type} {skill.value}]</span>
                                <span className="text-gray-300 line-clamp-2" title={skill.description}>{skill.description}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Purchase Button */}
                      <div className="mt-4">
                        <button
                          disabled={isBuyingThis}
                          onClick={() => buyDivineCard(card.baseId)}
                          className="w-full bg-gradient-to-r from-rose-600 via-red-500 to-rose-600 hover:from-rose-500 hover:to-red-400 active:scale-[0.98] text-white font-display font-black tracking-widest py-3 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(244,63,94,0.5)] hover:shadow-[0_0_25px_rgba(244,63,94,0.8)] flex items-center justify-center gap-2 text-xs uppercase cursor-pointer disabled:opacity-50"
                        >
                          <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain drop-shadow" />
                          {isBuyingThis ? 'INVOKING...' : 'SUMMON FOR 50 SHARDS'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===================== 4. DEMIURGE RELICS (INTERACTIVE FORGE ALTAR) ===================== */}
          {activeCategory === 'demiurge' && (() => {
            const currentItem = demiurgeItems.find(i => i.name === selectedDemiurgeItemName) || demiurgeItems[0];
            const isOwned = (profile.equipment || []).some(e => e.name === currentItem.name);
            const isEquipped = Object.values(profile.equipped || {}).some(id => {
              const eq = (profile.equipment || []).find(e => e.id === id);
              return eq?.name === currentItem.name;
            });
            const isForgingCurrent = buyingEquipName === currentItem.name;

            const getItemStatSummary = (item: (typeof demiurgeItems)[0]) => {
              const parts: string[] = [];
              if (item.bonusType === 'delayReduction') parts.push(`-${item.bonusValue} Delay`);
              else if (item.bonusType === 'dodge') parts.push(`+${item.bonusValue}% Dodge`);
              else if (item.bonusType === 'goldBonus') parts.push(`+${item.bonusValue}% Gold`);
              else if (item.bonusType === 'maxHealth') parts.push(`+${item.bonusValue} HP`);

              if (item.secondaryBonusType === 'dodge') parts.push(`+${item.secondaryBonusValue}% Dodge`);
              else if (item.secondaryBonusType === 'maxHealth') parts.push(`+${item.secondaryBonusValue} HP`);
              
              return parts.join(' • ');
            };

            return (
              <div className="space-y-4">
                
                {/* Category Header with Bundle Buy Action */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-rose-950/60 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <Sword className="w-5 h-5 text-rose-400" />
                    <h2 className="font-display font-black text-lg md:text-xl text-white tracking-widest text-shadow-gold uppercase">
                      Relics of the Demiurge
                    </h2>
                    <span className="text-xs text-gray-400 font-mono hidden sm:inline">• 6-Piece Divine Set</span>
                  </div>

                  {/* Buy Full Set with Discount Button */}
                  <button
                    disabled={isBuyingSet || ownedDemiurgeCount === 6}
                    onClick={buyDivineSet}
                    className={`px-4 py-2 rounded-xl font-display font-black text-xs tracking-wider transition-all flex items-center gap-2 shadow-lg cursor-pointer ${
                      ownedDemiurgeCount === 6
                        ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 cursor-default opacity-80'
                        : 'bg-gradient-to-r from-amber-600 via-rose-600 to-amber-600 hover:from-amber-500 hover:to-rose-500 text-white border border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:scale-105 active:scale-95'
                    }`}
                  >
                    <Crown className="w-4 h-4 text-amber-300" />
                    {ownedDemiurgeCount === 6 ? (
                      <span>FULL SET ASSEMBLED (6/6)</span>
                    ) : isBuyingSet ? (
                      <span>FORGING ENTIRE SET...</span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span>BUY FULL SET (6 PIECES):</span>
                        <span className="line-through text-rose-200/70 text-[10px]">300</span>
                        <span className="text-amber-300 font-mono text-sm font-black flex items-center gap-0.5">
                          <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain inline" />
                          250
                        </span>
                        <span className="bg-amber-400 text-black text-[9px] px-1 py-0.2 rounded font-black tracking-normal ml-1">
                          -17%
                        </span>
                      </div>
                    )}
                  </button>
                </div>

                {/* Main Altar Area: Left 6-Slot Grid + Right Detailed Item Forge */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                  
                  {/* Left Column: 6 Set Piece Selectors */}
                  <div className="lg:col-span-5 flex flex-col justify-between gap-2.5 bg-black/50 border border-rose-500/20 rounded-2xl p-3 shadow-xl">
                    <div className="text-[10px] font-mono text-rose-400 uppercase font-black tracking-wider px-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Sword className="w-3 h-3 text-rose-400" />
                        SELECT SET PIECE
                      </span>
                      <span className="text-gray-300 font-mono font-bold bg-white/5 px-2 py-0.5 rounded border border-white/10">
                        {ownedDemiurgeCount}/6 OWNED
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 flex-1">
                      {demiurgeItems.map((item) => {
                        const itemOwned = (profile.equipment || []).some(e => e.name === item.name);
                        const isSelected = selectedDemiurgeItemName === item.name;

                        return (
                          <button
                            key={item.name}
                            onClick={() => {
                              audioSystem.playClick();
                              setSelectedDemiurgeItemName(item.name);
                            }}
                            className={`p-2.5 rounded-2xl border-2 transition-all flex flex-col items-center justify-between cursor-pointer relative overflow-hidden group ${
                              isSelected
                                ? 'bg-gradient-to-b from-rose-950/95 via-[#230812] to-black border-rose-400 text-white shadow-[0_0_20px_rgba(244,63,94,0.45)] ring-1 ring-rose-400/40'
                                : itemOwned
                                ? 'bg-gradient-to-b from-[#180a10]/90 via-black to-black border-rose-950/60 hover:border-rose-500/50 hover:bg-rose-950/20 text-gray-300'
                                : 'bg-black/60 border-white/10 hover:border-rose-500/40 hover:bg-white/5 text-gray-400'
                            }`}
                          >
                            {/* Top row: Slot & Owned Badge */}
                            <div className="flex items-center justify-between w-full">
                              <span className="text-[10px] font-mono uppercase font-black tracking-wider text-rose-400">
                                {item.slot}
                              </span>
                              {itemOwned ? (
                                <span className="bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 text-[8px] sm:text-[9px] font-mono px-1.5 py-0.2 rounded font-black tracking-wider shadow-[0_0_8px_rgba(16,185,129,0.35)] flex items-center gap-0.5">
                                  <span>✓</span> OWNED
                                </span>
                              ) : (
                                <span className="bg-white/5 border border-white/10 text-gray-400 text-[8px] sm:text-[9px] font-mono px-1.5 py-0.2 rounded font-bold">
                                  50 🔷
                                </span>
                              )}
                            </div>

                            {/* Centered Large Icon with glowing aura */}
                            <div className={`w-14 h-14 sm:w-16 sm:h-16 my-1.5 rounded-xl p-1.5 flex items-center justify-center border shrink-0 relative overflow-hidden transition-transform group-hover:scale-105 ${
                              itemOwned 
                                ? 'bg-gradient-to-b from-rose-950 to-black border-rose-500/70 shadow-[0_0_12px_rgba(244,63,94,0.4)]' 
                                : 'bg-black/80 border-white/15'
                            }`}>
                              <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.35),transparent_70%)] ${itemOwned ? 'opacity-100' : 'opacity-20'}`} />
                              <img
                                src={getEquipmentIcon(item.name, item.slot)}
                                alt={item.name}
                                className={`w-full h-full object-contain relative z-10 filter ${
                                  itemOwned ? 'drop-shadow-[0_0_10px_rgba(244,63,94,0.85)]' : 'grayscale opacity-60'
                                }`}
                              />
                            </div>

                            {/* Bottom: Name & Centered Stat */}
                            <div className="w-full text-center">
                              <div className="font-display font-black text-xs sm:text-sm text-white truncate leading-tight group-hover:text-rose-200 transition-colors">
                                {item.name.replace(' of the Demiurge', '')}
                              </div>
                              <div className="text-[9px] sm:text-[10px] font-mono font-bold text-amber-300/90 mt-0.5 truncate">
                                {getItemStatSummary(item)}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Quick Set Progress Bar */}
                    <div className="pt-2 border-t border-white/10 px-1">
                      <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 mb-1">
                        <span>Set Assembly</span>
                        <span className="text-rose-400 font-bold">{Math.round((ownedDemiurgeCount / 6) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className="bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${(ownedDemiurgeCount / 6) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Selected Relic Showcase & Forge Action */}
                  <div className="lg:col-span-7 bg-gradient-to-b from-[#1c080d] via-[#14060a] to-black border-2 border-rose-500/40 rounded-2xl p-4 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                    <div className="space-y-3 relative z-10">
                      
                      {/* Top Slot Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg border font-mono text-[10px] uppercase font-black tracking-wider bg-rose-950/90 text-rose-300 border-rose-500/60">
                            {currentItem.slot}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-lg border font-mono text-[10px] uppercase font-black tracking-wider bg-gradient-to-r from-red-950 to-rose-900 text-rose-300 border-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.4)]">
                            DIVINE ARTIFACT
                          </span>
                        </div>
                        {isEquipped ? (
                          <span className="bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold shadow">
                            EQUIPPED
                          </span>
                        ) : isOwned ? (
                          <span className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold shadow">
                            OWNED IN INVENTORY
                          </span>
                        ) : (
                          <span className="bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold shadow">
                            NOT ACQUIRED
                          </span>
                        )}
                      </div>

                      {/* Large Center Art with Glow */}
                      <div className="relative h-44 sm:h-48 rounded-xl overflow-hidden border border-rose-400/30 bg-black/70 flex items-center justify-center p-4 shadow-inner">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(244,63,94,0.25),transparent_70%)]" />
                        <img
                          src={getEquipmentIcon(currentItem.name, currentItem.slot)}
                          alt={currentItem.name}
                          className="w-32 h-32 object-contain filter drop-shadow-[0_0_24px_rgba(244,63,94,0.7)] group-hover:scale-105 transition-transform duration-500 relative z-10"
                        />
                      </div>

                      {/* Item Title & Lore */}
                      <div>
                        <h3 className="font-display font-black text-lg text-white tracking-wide">
                          {currentItem.name}
                        </h3>
                        <p className="text-xs text-gray-300 font-sans mt-0.5 leading-snug">
                          {currentItem.description}
                        </p>
                      </div>

                      {/* Stat Bonuses Grid */}
                      <div className="grid grid-cols-2 gap-2 bg-black/60 border border-white/10 rounded-xl p-3 text-xs font-mono">
                        <div>
                          <span className="text-gray-400 text-[10px] block uppercase">Primary Power</span>
                          <span className="text-rose-300 font-black text-sm">
                            {currentItem.bonusType === 'delayReduction' ? `-${currentItem.bonusValue} Delay` :
                             currentItem.bonusType === 'dodge' ? `+${currentItem.bonusValue}% Dodge` :
                             currentItem.bonusType === 'goldBonus' ? `+${currentItem.bonusValue}% Gold` :
                             `+${currentItem.bonusValue} Max HP`}
                          </span>
                        </div>
                        {currentItem.secondaryBonusType ? (
                          <div>
                            <span className="text-gray-400 text-[10px] block uppercase">Secondary Power</span>
                            <span className="text-rose-300 font-black text-sm">
                              {currentItem.secondaryBonusType === 'dodge' ? `+${currentItem.secondaryBonusValue}% Dodge` :
                               `+${currentItem.secondaryBonusValue} Max HP`}
                            </span>
                          </div>
                        ) : (
                          <div>
                            <span className="text-gray-400 text-[10px] block uppercase">Set Affiliation</span>
                            <span className="text-amber-400 font-black text-sm">Demiurge Resonance</span>
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Action Button for Single Piece */}
                    <div className="mt-4 pt-3 border-t border-white/10 relative z-10">
                      <button
                        disabled={isForgingCurrent}
                        onClick={() => buyDivineEquipment(currentItem.name)}
                        className="w-full bg-gradient-to-r from-rose-600 via-red-500 to-rose-600 hover:from-rose-500 hover:to-red-400 active:scale-[0.98] text-white font-display font-black tracking-widest py-3 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(244,63,94,0.5)] hover:shadow-[0_0_25px_rgba(244,63,94,0.8)] flex items-center justify-center gap-2 text-xs uppercase cursor-pointer disabled:opacity-50"
                      >
                        <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain drop-shadow" />
                        {isForgingCurrent ? 'FORGING ARTIFACT...' : `FORGE PIECE (50 SHARDS)`}
                      </button>
                    </div>

                  </div>

                </div>

                {/* Bottom Set Resonance Bar */}
                <div className="bg-black/60 border border-rose-500/30 rounded-2xl p-3 md:p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                      <span className="font-display font-black text-xs md:text-sm text-white tracking-widest uppercase text-shadow-gold">
                        Demiurge Set Resonance Bonuses
                      </span>
                    </div>
                    <span className="text-[10px] md:text-xs font-mono text-rose-300 font-bold">
                      {ownedDemiurgeCount} of 6 Pieces Acquired
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    {DEMIURGE_SET.thresholds.map((threshold, tIdx) => {
                      const isAchieved = ownedDemiurgeCount >= threshold.pieces;
                      return (
                        <div 
                          key={tIdx}
                          className={`p-3 rounded-xl border-2 transition-all relative overflow-hidden flex flex-col justify-between gap-1.5 ${
                            isAchieved
                              ? 'bg-gradient-to-br from-rose-950/85 via-[#230812] to-black border-rose-400/90 text-white shadow-[0_0_18px_rgba(244,63,94,0.3)]'
                              : 'bg-black/50 border-white/10 opacity-70 text-gray-400'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-[10px] font-mono font-black tracking-wider uppercase px-2 py-0.5 rounded ${
                              isAchieved 
                                ? 'bg-rose-500/30 text-rose-200 border border-rose-400/40' 
                                : 'bg-white/5 text-gray-400 border border-white/10'
                            }`}>
                              {threshold.pieces === 6 ? '6 PIECES (FULL SET)' : `${threshold.pieces} PIECES BONUS`}
                            </span>
                            <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${
                              isAchieved 
                                ? 'bg-emerald-950 border border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.4)]' 
                                : 'text-gray-500 bg-black/60 border border-white/5'
                            }`}>
                              {isAchieved ? '⚡ ACTIVE' : `🔒 LOCKED (${ownedDemiurgeCount}/${threshold.pieces})`}
                            </span>
                          </div>

                          <div className="font-display font-black text-xs md:text-sm text-white tracking-wide mt-0.5">
                            {threshold.label}
                          </div>

                          {/* Stat description clearly displayed without truncation */}
                          {threshold.pieces === 2 && (
                            <div className="text-[11px] md:text-xs font-mono space-x-1.5 leading-snug">
                              <span className="text-emerald-300 font-black">+30 Max Hero HP</span>
                              <span className="text-gray-500">•</span>
                              <span className="text-cyan-300 font-black">+5% Dodge</span>
                            </div>
                          )}
                          {threshold.pieces === 4 && (
                            <div className="text-[11px] md:text-xs leading-snug">
                              <span className="text-amber-300 font-mono font-black">-1 Turn Delay</span>
                              <span className="text-gray-300 font-sans ml-1">on all friendly summoned cards</span>
                            </div>
                          )}
                          {threshold.pieces === 6 && (
                            <div className="text-[11px] md:text-xs font-mono leading-snug flex flex-wrap gap-x-1.5 gap-y-0.5">
                              <span className="text-purple-300 font-black">+1 Starting Mana</span>
                              <span className="text-gray-500">•</span>
                              <span className="text-emerald-300 font-black">+50 Max HP</span>
                              <span className="text-gray-500">•</span>
                              <span className="text-rose-300 font-black">+3 ATK / +8 HP to creatures</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            );
          })()}

          {/* ===================== 5. PEACE SHIELDS (AEGIS ARMORY) ===================== */}
          {activeCategory === 'shields' && (
            <div className="space-y-4 sm:space-y-5">
              
              {/* Category Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-950/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_14px_rgba(16,185,129,0.35)]">
                    <Shield className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-display font-black text-base sm:text-lg text-white tracking-widest text-shadow-gold uppercase">
                        Peace Shields & Wards
                      </h2>
                      <span className="bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 text-[8px] font-mono px-2 py-0.5 rounded font-black tracking-widest uppercase shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                        TERRITORY DEFENSE
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-300 font-sans mt-0.5">
                      Safeguard your Arena rank, crowns, and kingdom from hostile invasions while you rest.
                    </p>
                  </div>
                </div>

                {/* Shards balance */}
                <div className="flex items-center gap-2 self-start sm:self-auto bg-black/60 border border-purple-500/30 px-3 py-1.5 rounded-xl shadow-inner">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400">YOUR SHARDS:</span>
                  <div className="flex items-center gap-1 text-sm font-mono font-black text-purple-300">
                    <img src="/icons/dark_shard.webp" alt="Shards" className="w-4 h-4 object-contain drop-shadow-[0_0_6px_rgba(168,85,247,0.5)]" />
                    <span>{profile.darkShards || 0}</span>
                  </div>
                  <button
                    onClick={() => setIsShardsShopOpen(true)}
                    className="ml-1 text-[9px] font-mono font-bold text-purple-400 hover:text-white bg-purple-950/60 hover:bg-purple-900/80 px-2 py-0.5 rounded border border-purple-500/40 transition-colors cursor-pointer"
                  >
                    + GET
                  </button>
                </div>
              </div>

              {/* Shields Offer Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
                {[
                  {
                    type: '3h' as const,
                    name: '3-Hour Void Aegis',
                    subtitle: 'Minor Defense Ward',
                    durationLabel: '3 Hours Immunity',
                    cost: 8,
                    image: '/icons/shield_3h.png',
                    tag: 'STANDARD',
                    tagColor: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300',
                    borderGlow: 'border-emerald-500/30 hover:border-emerald-500/60 shadow-emerald-950/30',
                    badge: 'QUICK REST'
                  },
                  {
                    type: '6h' as const,
                    name: '6-Hour Astral Aegis',
                    subtitle: 'Greater Defense Ward',
                    durationLabel: '6 Hours Immunity',
                    cost: 15,
                    image: '/icons/shield_6h.png',
                    tag: 'MOST POPULAR',
                    tagColor: 'bg-cyan-950/90 border-cyan-500/50 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.3)]',
                    borderGlow: 'border-cyan-500/35 hover:border-cyan-400/70 shadow-cyan-950/40',
                    badge: 'NIGHT DEFENSE'
                  },
                  {
                    type: '12h' as const,
                    name: '12-Hour Supreme Aegis',
                    subtitle: 'Celestial Citadel Barrier',
                    durationLabel: '12 Hours Immunity',
                    cost: 25,
                    image: '/icons/shield_12h.png',
                    tag: 'BEST VALUE (-18%)',
                    tagColor: 'bg-purple-950/90 border-purple-500/60 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.4)]',
                    borderGlow: 'border-purple-500/40 hover:border-purple-400/80 shadow-purple-950/50',
                    badge: 'MAX PROTECTION'
                  }
                ].map((item) => {
                  const owned = profile.shieldsInventory?.[item.type] || 0;
                  const canAfford = (profile.darkShards || 0) >= item.cost;
                  const isPurchasing = isBuyingShield === item.type;

                  return (
                    <div 
                      key={item.type}
                      className={`relative bg-gradient-to-b from-[#131720] via-[#0d1017] to-[#07090d] border ${item.borderGlow} rounded-2xl p-4 flex flex-col justify-between shadow-xl transition-all duration-300 group hover:scale-[1.01]`}
                    >
                      {/* Top Header & Tag */}
                      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                        <span className={`text-[8px] font-mono font-black px-2 py-0.5 rounded border uppercase tracking-wider ${item.tagColor}`}>
                          {item.tag}
                        </span>
                        <span className="text-[10px] font-mono text-gray-400 font-bold">
                          {owned} Owned
                        </span>
                      </div>

                      {/* Shield Art Icon */}
                      <div className="flex flex-col items-center justify-center my-3 relative">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl p-1.5 flex items-center justify-center relative group-hover:scale-105 transition-transform duration-300">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]"
                          />
                        </div>
                        <span className="text-[9px] font-mono font-bold text-gray-400 mt-1 uppercase tracking-widest">
                          {item.badge}
                        </span>
                      </div>

                      {/* Description & Duration */}
                      <div className="space-y-1.5 text-center mb-3">
                        <h3 className="font-display font-black text-sm text-white group-hover:text-amber-200 transition-colors">
                          {item.name}
                        </h3>
                        <div className="inline-flex items-center gap-1 bg-black/60 border border-white/10 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold text-emerald-400">
                          <Clock className="w-3 h-3 text-emerald-400" />
                          <span>{item.durationLabel}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-sans leading-tight pt-1">
                          Protects domain from Arena attacks. Stacks if already shielded.
                        </p>
                      </div>

                      {/* Purchase Action Button */}
                      <button
                        onClick={async () => {
                          if (!canAfford) {
                            toast(`Need ${item.cost} Dark Shards. Opening shop...`, 'warning');
                            setIsShardsShopOpen(true);
                            return;
                          }
                          setIsBuyingShield(item.type);
                          try {
                            const res = await buyShield(item.type);
                            if (res.success) {
                              toast(res.message, 'success');
                              audioSystem.playVictory();
                            } else {
                              toast(res.message, 'error');
                            }
                          } catch (e: any) {
                            toast(e.message || 'Purchase failed', 'error');
                          } finally {
                            setIsBuyingShield(null);
                          }
                        }}
                        disabled={isPurchasing}
                        className={`w-full py-2.5 px-3 rounded-xl font-display font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer select-none shadow-lg ${
                          isPurchasing
                            ? 'bg-gray-700 text-gray-400 cursor-wait'
                            : canAfford
                              ? 'bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 hover:from-purple-600 hover:to-indigo-500 text-white shadow-purple-950/60 hover:scale-[1.02] active:scale-95'
                              : 'bg-purple-950/50 border border-purple-500/30 text-purple-300 hover:bg-purple-900/60'
                        }`}
                      >
                        {isPurchasing ? (
                          <span>COMMUNING...</span>
                        ) : (
                          <>
                            <span>ACQUIRE FOR</span>
                            <div className="flex items-center gap-1 font-mono font-black text-white">
                              <img src="/icons/dark_shard.webp" alt="Shards" className="w-3.5 h-3.5 object-contain" />
                              <span>{item.cost}</span>
                            </div>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Explanatory Banner & Subscription Tributes */}
              <div className="bg-gradient-to-r from-amber-950/30 via-purple-950/30 to-black/60 border border-amber-500/25 rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-display font-bold text-amber-300 block uppercase tracking-wider text-[11px]">
                      FREE DAILY SUBSCRIPTION SHIELDS
                    </span>
                    <p className="text-gray-300 text-[11px] font-sans leading-relaxed mt-0.5">
                      Lords with active passes collect free shields every day in their Pass Tributes:
                      <span className="text-amber-200 font-bold ml-1">1x 3-Hour Shield (Premium)</span> or
                      <span className="text-amber-300 font-bold ml-1">1x 6-Hour Shield (Ultra)</span>.
                    </p>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-gray-400 border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0 sm:pl-3 shrink-0">
                  <span className="block text-white font-bold">SHIELD RULES:</span>
                  <span>Immunity stops attacks & LP loss. Time stacks continuously.</span>
                </div>
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
