import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useGame } from '../../context/GameContext';
import { useToast } from '../../components/Toast';
import { Card, Equipment } from '../../types';
import { CARD_TEMPLATES, getCardManaCost } from '../../data/cards';
import { getEquipmentIcon, EQUIPMENT_TEMPLATES, DEMIURGE_SET } from '../../data/equipment';
import { getCardTierStyles } from '../../utils/tierStyles';
import { assetPreloader, getCardImageUrl } from '../../utils/assetPreloader';
import {
  Sparkles,
  Shield,
  Crown,
  Sword,
  Clock,
  Box,
  Check,
  Zap,
  ChevronRight,
  ChevronLeft,
  Flame,
  Skull,
  Award
} from 'lucide-react';

export type MobileShopCategory = 'boosters' | 'chests' | 'pantheon' | 'demiurge' | 'shields' | 'level_boost';

interface MobileShopViewProps {
  initialTab?: 'cards' | 'equipment' | 'divine' | 'shields' | 'level_boost';
}

const renderManaIcon = (cost: number, sizeClass: string = "w-4 h-4") => {
  return (
    <div className={`relative ${sizeClass} shrink-0 flex items-center justify-center`}>
      <svg className="absolute inset-0 w-full h-full filter drop-shadow-[0_0_5px_rgba(6,182,212,0.85)]" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L4 7v10l8 5 8-5V7l-8-5z" fill="url(#manaCrystalGradShopV3)" stroke="#66fcf1" strokeWidth="1.5" />
        <path d="M12 2L4 7l8 5 8-5-8-5z" fill="#66fcf1" opacity="0.35" />
        <path d="M4 7v10l8 5V12L4 7z" fill="#00d2ff" opacity="0.55" />
        <path d="M20 7v10l8 5V12L20 7z" fill="#005299" opacity="0.75" />
        <defs>
          <radialGradient id="manaCrystalGradShopV3" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00f0ff" />
            <stop offset="100%" stopColor="#0033aa" />
          </radialGradient>
        </defs>
      </svg>
      <span className="relative text-white text-[9.5px] font-black font-mono leading-none z-10 drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.95)]">
        {cost}
      </span>
    </div>
  );
};

export const MobileShopView: React.FC<MobileShopViewProps> = ({ initialTab = 'cards' }) => {
  const {
    profile,
    setProfile,
    setIsShardsShopOpen,
    buyShield,
    buyLevelBoost,
  } = useGame();
  const toast = useToast();

  const getCategoryFromTab = (tab?: string): MobileShopCategory => {
    if (tab === 'equipment') return 'chests';
    if (tab === 'divine') return 'demiurge';
    if (tab === 'shields') return 'shields';
    if (tab === 'level_boost') return 'level_boost';
    return 'boosters';
  };

  const [activeCategory, setActiveCategory] = useState<MobileShopCategory>(getCategoryFromTab(initialTab));
  const [isBuyingShield, setIsBuyingShield] = useState<string | null>(null);
  const [isBuyingLevelBoost, setIsBuyingLevelBoost] = useState<number | null>(null);
  const [buyingCardId, setBuyingCardId] = useState<string | null>(null);
  const [buyingEquipName, setBuyingEquipName] = useState<string | null>(null);
  const [isBuyingSet, setIsBuyingSet] = useState(false);

  // Opening / Reward reveal modal state
  const [openingPack, setOpeningPack] = useState<string | null>(null);
  const [revealedCards, setRevealedCards] = useState<Card[]>([]);
  const [revealedEquipment, setRevealedEquipment] = useState<Equipment[]>([]);
  const [isRevealed, setIsRevealed] = useState(false);

  // Pantheon active deity selection
  const divineCards = CARD_TEMPLATES.filter(c => c.tier === 'divine');
  const [selectedDeityId, setSelectedDeityId] = useState<string>(divineCards[0]?.baseId || 'void_sovereign');

  // Sync initialTab when changed from external deep-links (e.g. from Hero or PvP)
  useEffect(() => {
    if (initialTab) {
      setActiveCategory(getCategoryFromTab(initialTab));
    }
  }, [initialTab]);

  // Demiurge equipment data
  const demiurgeItems = EQUIPMENT_TEMPLATES.filter(e => e.setId === 'demiurge');
  const ownedDemiurgeCount = demiurgeItems.filter(t => (profile.equipment || []).some(e => e.name === t.name)).length;
  const [selectedDemiurgeItemName, setSelectedDemiurgeItemName] = useState<string>(demiurgeItems[0]?.name || 'Blade of the Demiurge');

  // Pack animation trigger
  const triggerOpeningAnimationBackend = (packType: string, newCards: any[], newEquipment: any[]) => {
    setOpeningPack(packType);
    setRevealedCards(newCards);
    setRevealedEquipment(newEquipment);
    setIsRevealed(false);

    if (newCards && newCards.length > 0) {
      assetPreloader.preloadBattleCreatures(newCards);
    }

    setTimeout(() => setIsRevealed(true), 1500);
  };

  // Buy Booster Pack or Chest
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
    } else if (packType === 'bronze' && (profile.gold || 0) < 1000) {
      toast('Insufficient Gold!', 'warning');
      return;
    } else if (packType === 'eq_basic' && (profile.gold || 0) < 700) {
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

  // Buy Divine Card (50 Shards)
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

  // Buy Divine Equipment piece (50 Shards)
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

  // Buy Full Demiurge Set (250 Shards)
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

  // Handle Level Boost (50 or 100)
  const handleBuyLevelBoost = async (targetLevel: 50 | 100) => {
    const cost = targetLevel === 50 ? 250 : 700;
    if ((profile.darkShards || 0) < cost) {
      toast(`Insufficient Dark Shards! Need ${cost} Shards. Opening shop...`, 'warning');
      setIsShardsShopOpen(true);
      return;
    }

    if ((profile.level || 1) >= targetLevel) {
      toast(`Your hero is already level ${profile.level || 1}!`, 'info');
      return;
    }

    setIsBuyingLevelBoost(targetLevel);
    try {
      const res = await buyLevelBoost(targetLevel);
      if (res.success) {
        toast(res.message, 'success');
      } else {
        toast(res.message, 'error');
      }
    } catch (e: any) {
      toast(e.message || 'Ascension boost failed', 'error');
    } finally {
      setIsBuyingLevelBoost(null);
    }
  };

  // Close reveal dialog
  const closeReveal = () => {
    setOpeningPack(null);
    setRevealedCards([]);
    setRevealedEquipment([]);
    setIsRevealed(false);
  };

  // 6 Categories in a sleek 3x2 grid with zero text cut-off
  const CATEGORIES: {
    id: MobileShopCategory;
    name: string;
    icon: string;
    activeBg: string;
    activeBorder: string;
    badge?: string;
  }[] = [
    {
      id: 'boosters',
      name: 'BOOSTERS',
      icon: '/packs/pack_obsidian.webp',
      activeBg: 'from-[#0d2a3a] to-[#06161f]',
      activeBorder: 'border-cyan-400 text-cyan-200 shadow-[0_0_14px_rgba(6,182,212,0.4)]',
    },
    {
      id: 'chests',
      name: 'CHESTS',
      icon: '/packs/chest_premium.webp',
      activeBg: 'from-[#2a1040] to-[#140620]',
      activeBorder: 'border-purple-400 text-purple-200 shadow-[0_0_14px_rgba(168,85,247,0.4)]',
    },
    {
      id: 'pantheon',
      name: 'PANTHEON',
      icon: '/icons/crown.png',
      activeBg: 'from-[#2e1909] to-[#170a03]',
      activeBorder: 'border-amber-400 text-amber-200 shadow-[0_0_14px_rgba(245,158,11,0.4)]',
    },
    {
      id: 'demiurge',
      name: 'DEMIURGE',
      icon: '/icons/equipment/demiurge_crest.png',
      activeBg: 'from-[#300a16] to-[#180309]',
      activeBorder: 'border-rose-400 text-rose-200 shadow-[0_0_14px_rgba(244,63,94,0.4)]',
      badge: `${ownedDemiurgeCount}/6`
    },
    {
      id: 'shields',
      name: 'SHIELDS',
      icon: '/icons/shield_indicator.png',
      activeBg: 'from-[#0d2c20] to-[#061811]',
      activeBorder: 'border-emerald-400 text-emerald-200 shadow-[0_0_14px_rgba(16,185,129,0.4)]',
    },
    {
      id: 'level_boost',
      name: 'BOOST',
      icon: '/shop/ascension_sigil.png',
      activeBg: 'from-[#2d1808] to-[#160a03]',
      activeBorder: 'border-amber-400 text-yellow-200 shadow-[0_0_14px_rgba(245,158,11,0.45)]',
      badge: 'VIP'
    },
  ];

  return (
    <div className="h-full w-full flex flex-col bg-[#07090e] text-gray-200 select-none overflow-y-auto no-scrollbar font-sans pb-36">
      
      {/* 1. STICKY TOP 3x2 CATEGORY MATRIX (ZERO HORIZONTAL SCROLL, ZERO TEXT TRUNCATION) */}
      <div className="sticky top-0 z-30 bg-[#07090e]/95 backdrop-blur-md border-b border-white/10 p-2 shrink-0">
        <div className="grid grid-cols-3 gap-1.5">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`h-9 min-[380px]:h-10 px-1.5 rounded-xl border transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer relative overflow-hidden ${
                  isActive
                    ? `bg-gradient-to-r ${cat.activeBg} ${cat.activeBorder} font-black scale-[1.02] z-10`
                    : 'bg-black/60 border-white/10 text-gray-400 hover:text-gray-200 hover:bg-white/5 active:scale-95'
                }`}
              >
                <img
                  src={cat.icon}
                  alt={cat.name}
                  className={`w-4 h-4 object-contain shrink-0 ${isActive ? 'drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]' : 'opacity-70'}`}
                />
                <span className="font-display text-[9.5px] min-[370px]:text-[10px] min-[400px]:text-[11px] tracking-wider uppercase">
                  {cat.name}
                </span>
                {cat.badge && (
                  <span className={`text-[7px] min-[380px]:text-[7.5px] font-mono px-1 py-0.2 rounded font-bold shrink-0 ${
                    isActive ? 'bg-black/70 border border-white/30 text-white' : 'bg-white/10 text-gray-400'
                  }`}>
                    {cat.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. MAIN CATEGORY SHOWCASE */}
      <div className="p-2.5 min-[380px]:p-3 space-y-3">
        
        {/* ===================== 1. BOOSTERS (FULL AAA SHOWCASE CARDS) ===================== */}
        {activeCategory === 'boosters' && (
          <div className="space-y-3">
            
            {/* 1. Bronze Booster */}
            <div className="bg-gradient-to-b from-[#1c130a] via-[#100b05] to-[#080502] border-2 border-amber-600/60 rounded-2xl p-3 shadow-xl relative overflow-hidden space-y-2.5">
              {/* Top Meta Line */}
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  COMMON SUMMON
                </span>
                <span className="bg-amber-950/90 border border-amber-600/50 px-2 py-0.5 rounded text-[8px] font-mono text-amber-300 font-bold">
                  TIER I
                </span>
              </div>

              {/* Middle Section: Large 3D Art + Detailed Stats */}
              <div className="flex items-center gap-3">
                {/* 3D Pack Art Box */}
                <div className="w-24 h-24 min-[380px]:w-26 min-[380px]:h-26 rounded-xl bg-gradient-to-b from-amber-950/40 via-black/60 to-black border border-amber-600/40 flex flex-col items-center justify-center p-1 relative shrink-0 shadow-inner">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.25),transparent_70%)]" />
                  <img src="/packs/pack_bronze.webp" alt="Bronze Pack" className="w-20 h-20 min-[380px]:w-22 min-[380px]:h-22 object-contain relative z-10 drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]" />
                  <span className="absolute bottom-1 px-1.5 py-0.2 rounded-full bg-black/80 border border-amber-500/50 text-[7px] font-display font-black text-amber-300 uppercase tracking-wider z-20">
                    BRONZE PACK
                  </span>
                </div>

                {/* Info & Rarity Table */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div>
                    <h3 className="font-display font-black text-sm min-[380px]:text-base text-white uppercase leading-tight">
                      Bronze Booster
                    </h3>
                    <p className="text-[10px] text-gray-400 font-sans leading-tight mt-0.5">
                      Recruit starter units & build battle presence.
                    </p>
                  </div>

                  {/* Clean Drop Rates Box */}
                  <div className="bg-black/65 border border-white/10 rounded-xl p-2 text-[10px] font-mono space-y-1">
                    <div className="flex justify-between items-center text-gray-300">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                        Common (Bronze):
                      </span>
                      <span className="text-amber-400 font-bold bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-600/40">90%</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-300">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        Rare (Silver):
                      </span>
                      <span className="text-slate-300 font-bold bg-slate-900/60 px-1.5 py-0.2 rounded border border-slate-600/40">10%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Big Solid Tactile Buy Button */}
              <button
                onClick={() => buyPackBackend('bronze')}
                className="w-full h-11 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:brightness-110 active:scale-[0.98] text-black font-display font-black text-xs tracking-widest uppercase rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.35)] flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <img src="/icons/icon_gold.webp" alt="Gold" className="w-4 h-4 object-contain drop-shadow" />
                <span>SUMMON • 1,000 GOLD</span>
              </button>
            </div>

            {/* 2. Obsidian Booster */}
            <div className="bg-gradient-to-b from-[#0a1e2b] via-[#051119] to-[#02070b] border-2 border-cyan-500/60 rounded-2xl p-3 shadow-xl relative overflow-hidden space-y-2.5">
              {/* Top Meta Line */}
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  ELITE SUMMON
                </span>
                <span className="bg-cyan-950/90 border border-cyan-500/50 px-2 py-0.5 rounded text-[8px] font-mono text-cyan-300 font-bold">
                  TIER II
                </span>
              </div>

              {/* Middle Section: Large 3D Art + Detailed Stats */}
              <div className="flex items-center gap-3">
                {/* 3D Pack Art Box */}
                <div className="w-24 h-24 min-[380px]:w-26 min-[380px]:h-26 rounded-xl bg-gradient-to-b from-cyan-950/40 via-black/60 to-black border border-cyan-500/40 flex flex-col items-center justify-center p-1 relative shrink-0 shadow-inner">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.25),transparent_70%)]" />
                  <img src="/packs/pack_obsidian.webp" alt="Obsidian Pack" className="w-20 h-20 min-[380px]:w-22 min-[380px]:h-22 object-contain relative z-10 drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]" />
                  <span className="absolute bottom-1 px-1.5 py-0.2 rounded-full bg-black/80 border border-cyan-400/50 text-[7px] font-display font-black text-cyan-300 uppercase tracking-wider z-20">
                    OBSIDIAN PACK
                  </span>
                </div>

                {/* Info & Rarity Table */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div>
                    <h3 className="font-display font-black text-sm min-[380px]:text-base text-white uppercase leading-tight">
                      Obsidian Booster
                    </h3>
                    <p className="text-[10px] text-gray-400 font-sans leading-tight mt-0.5">
                      Infused with void energy. High rare fighter rate.
                    </p>
                  </div>

                  {/* Clean Drop Rates Box */}
                  <div className="bg-black/65 border border-white/10 rounded-xl p-2 text-[10px] font-mono space-y-1">
                    <div className="flex justify-between items-center text-gray-300">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        Silver: 70%
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        Gold: 30%
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-white/10 text-cyan-300 font-bold">
                      <span>Level 2 Chance:</span>
                      <span className="bg-cyan-950/80 px-1.5 py-0.2 rounded border border-cyan-400/40">25%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Big Solid Tactile Buy Button */}
              <button
                onClick={() => buyPackBackend('obsidian')}
                className="w-full h-11 bg-gradient-to-r from-cyan-950 via-[#0a3545] to-cyan-950 hover:brightness-125 active:scale-[0.98] text-cyan-200 border border-cyan-400/80 font-display font-black text-xs tracking-widest uppercase rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.35)] flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain" />
                <span>SUMMON • 30 SHARDS</span>
              </button>
            </div>

            {/* 3. Abyssal Lord Pack */}
            <div className="bg-gradient-to-b from-[#260711] via-[#150309] to-[#090104] border-2 border-rose-500/70 rounded-2xl p-3 shadow-xl relative overflow-hidden space-y-2.5">
              {/* Top Meta Line */}
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                  FORBIDDEN SUMMON
                </span>
                <span className="bg-rose-950/90 border border-rose-500/50 px-2 py-0.5 rounded text-[8px] font-mono text-rose-300 font-bold">
                  TIER III
                </span>
              </div>

              {/* Middle Section: Large 3D Art + Detailed Stats */}
              <div className="flex items-center gap-3">
                {/* 3D Pack Art Box */}
                <div className="w-24 h-24 min-[380px]:w-26 min-[380px]:h-26 rounded-xl bg-gradient-to-b from-rose-950/40 via-black/60 to-black border border-rose-500/40 flex flex-col items-center justify-center p-1 relative shrink-0 shadow-inner">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.3),transparent_70%)]" />
                  <img src="/packs/pack_abyssal.webp" alt="Abyssal Pack" className="w-20 h-20 min-[380px]:w-22 min-[380px]:h-22 object-contain relative z-10 drop-shadow-[0_0_14px_rgba(244,63,94,0.7)]" />
                  <span className="absolute bottom-1 px-1.5 py-0.2 rounded-full bg-black/80 border border-rose-500/50 text-[7px] font-display font-black text-rose-300 uppercase tracking-wider z-20">
                    ABYSSAL PACK
                  </span>
                </div>

                {/* Info & Rarity Table */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div>
                    <h3 className="font-display font-black text-sm min-[380px]:text-base text-white uppercase leading-tight">
                      Abyssal Lord Pack
                    </h3>
                    <p className="text-[10px] text-gray-400 font-sans leading-tight mt-0.5">
                      Primordial summon. Elite Gold & Legendary cards.
                    </p>
                  </div>

                  {/* Clean Drop Rates Box */}
                  <div className="bg-black/65 border border-white/10 rounded-xl p-2 text-[10px] font-mono space-y-1">
                    <div className="flex justify-between items-center text-gray-300 text-[9.5px]">
                      <span>Silver: 30%</span>
                      <span className="text-amber-400">Gold: 55%</span>
                      <span className="text-purple-300 font-bold">Leg: 15%</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-white/10 text-rose-300 font-bold">
                      <span>Level 2 Chance:</span>
                      <span className="bg-rose-950/80 px-1.5 py-0.2 rounded border border-rose-500/40">30%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Big Solid Tactile Buy Button */}
              <button
                onClick={() => buyPackBackend('abyssal')}
                className="w-full h-11 bg-gradient-to-r from-rose-950 via-red-900 to-rose-950 hover:brightness-125 active:scale-[0.98] text-white border border-rose-500/80 font-display font-black text-xs tracking-widest uppercase rounded-xl shadow-[0_0_18px_rgba(244,63,94,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain" />
                <span>SUMMON • 70 SHARDS</span>
              </button>
            </div>

          </div>
        )}

        {/* ===================== 2. CHESTS (FULL AAA SHOWCASE CARDS) ===================== */}
        {activeCategory === 'chests' && (
          <div className="space-y-3">
            
            {/* 1. Basic Chest */}
            <div className="bg-gradient-to-b from-[#1c130a] via-[#100b05] to-[#080502] border-2 border-amber-600/60 rounded-2xl p-3 shadow-xl relative overflow-hidden space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  STANDARD RELICS
                </span>
                <span className="bg-amber-950/90 border border-amber-600/50 px-2 py-0.5 rounded text-[8px] font-mono text-amber-300 font-bold">
                  RANK I
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-24 h-24 min-[380px]:w-26 min-[380px]:h-26 rounded-xl bg-gradient-to-b from-amber-950/40 via-black/60 to-black border border-amber-600/40 flex flex-col items-center justify-center p-1 relative shrink-0 shadow-inner">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.25),transparent_70%)]" />
                  <img src="/packs/chest_basic.webp" alt="Basic Chest" className="w-20 h-20 min-[380px]:w-22 min-[380px]:h-22 object-contain relative z-10 drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]" />
                  <span className="absolute bottom-1 px-1.5 py-0.2 rounded-full bg-black/80 border border-amber-500/50 text-[7px] font-display font-black text-amber-300 uppercase tracking-wider z-20">
                    BASIC RELICS
                  </span>
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div>
                    <h3 className="font-display font-black text-sm min-[380px]:text-base text-white uppercase leading-tight">
                      Basic Equipment Chest
                    </h3>
                    <p className="text-[10px] text-gray-400 font-sans leading-tight mt-0.5">
                      1 Lord Relic • Essential starting equipment.
                    </p>
                  </div>

                  <div className="bg-black/65 border border-white/10 rounded-xl p-2 text-[10px] font-mono space-y-1">
                    <div className="flex justify-between items-center text-gray-300">
                      <span>Bronze Equipment:</span>
                      <span className="text-amber-400 font-bold bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-600/40">80%</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-300">
                      <span>Silver Equipment:</span>
                      <span className="text-slate-300 font-bold bg-slate-900/60 px-1.5 py-0.2 rounded border border-slate-600/40">20%</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => buyPackBackend('eq_basic', true)}
                className="w-full h-11 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:brightness-110 active:scale-[0.98] text-black font-display font-black text-xs tracking-widest uppercase rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.35)] flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <img src="/icons/icon_gold.webp" alt="Gold" className="w-4 h-4 object-contain drop-shadow" />
                <span>FORGE RELIC • 700 GOLD</span>
              </button>
            </div>

            {/* 2. Rare Chest */}
            <div className="bg-gradient-to-b from-[#0a1e2b] via-[#051119] to-[#02070b] border-2 border-cyan-500/60 rounded-2xl p-3 shadow-xl relative overflow-hidden space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  ARCANE CACHE
                </span>
                <span className="bg-cyan-950/90 border border-cyan-500/50 px-2 py-0.5 rounded text-[8px] font-mono text-cyan-300 font-bold">
                  RANK II
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-24 h-24 min-[380px]:w-26 min-[380px]:h-26 rounded-xl bg-gradient-to-b from-cyan-950/40 via-black/60 to-black border border-cyan-500/40 flex flex-col items-center justify-center p-1 relative shrink-0 shadow-inner">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.25),transparent_70%)]" />
                  <img src="/packs/chest_rare.webp" alt="Rare Chest" className="w-20 h-20 min-[380px]:w-22 min-[380px]:h-22 object-contain relative z-10 drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]" />
                  <span className="absolute bottom-1 px-1.5 py-0.2 rounded-full bg-black/80 border border-cyan-400/50 text-[7px] font-display font-black text-cyan-300 uppercase tracking-wider z-20">
                    RARE RELICS
                  </span>
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div>
                    <h3 className="font-display font-black text-sm min-[380px]:text-base text-white uppercase leading-tight">
                      Rare Equipment Chest
                    </h3>
                    <p className="text-[10px] text-gray-400 font-sans leading-tight mt-0.5">
                      1 Lord Relic • Enchanted Silver & Gold gear.
                    </p>
                  </div>

                  <div className="bg-black/65 border border-white/10 rounded-xl p-2 text-[10px] font-mono space-y-1">
                    <div className="flex justify-between items-center text-gray-300">
                      <span>Bronze: 40%</span>
                      <span className="text-cyan-300 font-bold">Silver: 50%</span>
                      <span className="text-amber-400 font-bold">Gold: 10%</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => buyPackBackend('eq_rare', true)}
                className="w-full h-11 bg-gradient-to-r from-cyan-950 via-[#0a3545] to-cyan-950 hover:brightness-125 active:scale-[0.98] text-cyan-200 border border-cyan-400/80 font-display font-black text-xs tracking-widest uppercase rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.35)] flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain" />
                <span>FORGE RELIC • 30 SHARDS</span>
              </button>
            </div>

            {/* 3. Premium Chest */}
            <div className="bg-gradient-to-b from-[#260711] via-[#150309] to-[#090104] border-2 border-purple-500/70 rounded-2xl p-3 shadow-xl relative overflow-hidden space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                  IMPERIAL HOARD
                </span>
                <span className="bg-purple-950/90 border border-purple-500/50 px-2 py-0.5 rounded text-[8px] font-mono text-purple-300 font-bold">
                  RANK III
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-24 h-24 min-[380px]:w-26 min-[380px]:h-26 rounded-xl bg-gradient-to-b from-purple-950/40 via-black/60 to-black border border-purple-500/40 flex flex-col items-center justify-center p-1 relative shrink-0 shadow-inner">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.3),transparent_70%)]" />
                  <img src="/packs/chest_premium.webp" alt="Premium Chest" className="w-20 h-20 min-[380px]:w-22 min-[380px]:h-22 object-contain relative z-10 drop-shadow-[0_0_14px_rgba(168,85,247,0.7)]" />
                  <span className="absolute bottom-1 px-1.5 py-0.2 rounded-full bg-black/80 border border-purple-500/50 text-[7px] font-display font-black text-purple-300 uppercase tracking-wider z-20">
                    PREMIUM RELICS
                  </span>
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div>
                    <h3 className="font-display font-black text-sm min-[380px]:text-base text-white uppercase leading-tight">
                      Premium Equipment Chest
                    </h3>
                    <p className="text-[10px] text-gray-400 font-sans leading-tight mt-0.5">
                      1 Lord Relic • Epic & Legendary tier gear.
                    </p>
                  </div>

                  <div className="bg-black/65 border border-white/10 rounded-xl p-2 text-[10px] font-mono space-y-1">
                    <div className="flex justify-between items-center text-gray-300">
                      <span>Silver: 60%</span>
                      <span className="text-amber-400 font-bold">Gold: 35%</span>
                      <span className="text-purple-300 font-bold">Leg: 5%</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => buyPackBackend('eq_premium', true)}
                className="w-full h-11 bg-gradient-to-r from-purple-950 via-rose-950 to-purple-950 hover:brightness-125 active:scale-[0.98] text-white border border-purple-500/80 font-display font-black text-xs tracking-widest uppercase rounded-xl shadow-[0_0_18px_rgba(168,85,247,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain" />
                <span>FORGE RELIC • 70 SHARDS</span>
              </button>
            </div>

          </div>
        )}

        {/* ===================== 3. PANTHEON (LUXURIOUS DEITY SHOWCASE) ===================== */}
        {activeCategory === 'pantheon' && (() => {
          const currentDeity = divineCards.find(c => c.baseId === selectedDeityId) || divineCards[0];
          const ownedCount = (profile.collection || []).filter(c => c.baseId === currentDeity.baseId).length;
          const isBuyingThis = buyingCardId === currentDeity.baseId;

          // Short, sound names without ellipsis cut-off
          const DEITY_NAMES: Record<string, string> = {
            void_sovereign: 'Aurelius',
            blood_empress: 'Nyx',
            void_reaper: 'Seraph',
          };

          const currentIndex = divineCards.findIndex(c => c.baseId === currentDeity.baseId);
          const handlePrevDeity = () => {
            const prevIdx = (currentIndex - 1 + divineCards.length) % divineCards.length;
            setSelectedDeityId(divineCards[prevIdx].baseId);
          };
          const handleNextDeity = () => {
            const nextIdx = (currentIndex + 1) % divineCards.length;
            setSelectedDeityId(divineCards[nextIdx].baseId);
          };

          return (
            <div className="space-y-2.5">
              
              {/* 3 Deity Switcher Chips (Clean, zero truncation) */}
              <div className="grid grid-cols-3 gap-1.5">
                {divineCards.map((card) => {
                  const isSelected = card.baseId === currentDeity.baseId;
                  const isOwned = (profile.collection || []).some(c => c.baseId === card.baseId);
                  const shortName = DEITY_NAMES[card.baseId] || card.name.split(',')[0].split(' ')[0];

                  return (
                    <button
                      key={card.baseId}
                      onClick={() => setSelectedDeityId(card.baseId)}
                      className={`h-8 min-[380px]:h-8.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-rose-950 via-[#26050d] to-rose-950 border-rose-400 text-white shadow-[0_0_12px_rgba(244,63,94,0.45)] scale-[1.02]'
                          : 'bg-black/60 border-white/10 text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <Crown className={`w-3 h-3 shrink-0 ${isSelected ? 'text-amber-400' : 'text-gray-500'}`} />
                      <span className="font-display font-black text-[11px] uppercase tracking-wider">
                        {shortName}
                      </span>
                      {isOwned && (
                        <span className="text-emerald-400 text-[9px] font-mono font-bold">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Majestic Divine Altar Card Frame */}
              <div className="bg-gradient-to-b from-[#220912] via-[#14050a] to-black border-2 border-rose-500/60 rounded-2xl p-3 shadow-2xl space-y-2.5 relative overflow-hidden">
                
                {/* Top Split: Authentic CCG Playing Card (Left) + Detailed Codex & Skills (Right) */}
                <div className="flex gap-2.5 min-[380px]:gap-3 items-stretch">
                  
                  {/* 1. AUTHENTIC COLLECTIBLE TRADING CARD (PROPER 3:4.2 VERTICAL PROPORTIONS) */}
                  <div className="w-[142px] min-[380px]:w-[156px] shrink-0 aspect-[3/4.2] rounded-2xl p-2 flex flex-col justify-between relative shadow-[0_0_22px_rgba(244,63,94,0.5)] overflow-hidden border-2 border-rose-500/80 ring-1 ring-rose-400/50 bg-black group select-none">
                    {/* Full-bleed Portrait Artwork in authentic vertical aspect ratio (NO CROPPING) */}
                    <img
                      src={currentDeity.image}
                      alt={currentDeity.name}
                      className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Ambient Card Vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-black/70 pointer-events-none z-0" />

                    {/* Top Card Badges: Tier & Mana/Delay */}
                    <div className="relative z-10 flex justify-between items-start">
                      <span className="px-1.5 py-0.5 rounded font-mono text-[7.5px] uppercase font-black tracking-wider bg-gradient-to-r from-red-950 to-rose-900 border border-rose-400 text-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.8)]">
                        DIVINE
                      </span>
                      <div className="flex items-center gap-1">
                        {renderManaIcon(getCardManaCost(currentDeity), "w-4 h-4")}
                        <div className="bg-black/85 border border-rose-400/50 rounded px-1 py-0.2 text-[8px] font-mono font-bold text-blue-300 shadow flex items-center gap-0.5">
                          <span>⏳</span>{currentDeity.delay}
                        </div>
                      </div>
                    </div>

                    {/* Empty Center Space showing glorious uncropped artwork */}
                    <div className="flex-1" />

                    {/* Bottom Card Badges: Name Banner + ATK & HP Gems */}
                    <div className="relative z-10 space-y-1">
                      <div className="bg-black/80 backdrop-blur-sm border border-white/10 rounded py-0.5 px-1 text-center shadow-md">
                        <span className="text-[9px] font-display font-black text-white block truncate leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
                          {currentDeity.name}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[8.5px] font-mono font-black pt-1 border-t border-rose-500/40 bg-black/85 backdrop-blur-sm rounded-lg px-2 py-0.5 shadow-md">
                        <span className="text-red-400 flex items-center gap-0.5">
                          <span className="text-[8px]">⚔️</span> {currentDeity.attack}
                        </span>
                        <span className="text-emerald-400 flex items-center gap-0.5">
                          <span className="text-[8px]">❤️</span> {currentDeity.health}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2. CARD DOSSIER & DIVINE SKILLS */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between space-y-1.5">
                    
                    {/* Header: Title, Category & Ownership */}
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <span className="text-[8px] font-mono uppercase font-black tracking-widest text-rose-400 block">
                            PRIMORDIAL CARD
                          </span>
                          <h3 className="font-display font-black text-xs min-[380px]:text-sm text-white leading-tight">
                            {currentDeity.name}
                          </h3>
                        </div>
                        {ownedCount > 0 && (
                          <span className="bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-[8px] font-mono px-1.5 py-0.2 rounded font-bold shrink-0 shadow">
                            OWNED: {ownedCount}
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] text-gray-300 font-sans leading-snug line-clamp-2 italic">
                        {currentDeity.description}
                      </p>
                    </div>

                    {/* Divine Skills Box */}
                    <div className="bg-black/70 border border-rose-500/30 rounded-xl p-2 space-y-1">
                      <div className="text-[8px] font-mono uppercase font-bold text-rose-400 tracking-wider flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-rose-400" /> DIVINE SKILLS
                      </div>
                      <div className="space-y-1">
                        {currentDeity.skills.map((skill, sIdx) => (
                          <div key={sIdx} className="text-[9px] leading-tight">
                            <span className="font-mono font-bold text-rose-300 uppercase block">[{skill.type} {skill.value}]</span>
                            <span className="text-gray-300 line-clamp-2">{skill.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

                {/* 3. WIDE SUMMON BUTTON (100% VISIBLE, TACTILE) */}
                <button
                  disabled={isBuyingThis}
                  onClick={() => buyDivineCard(currentDeity.baseId)}
                  className="w-full h-10 min-[380px]:h-11 bg-gradient-to-r from-rose-600 via-red-500 to-rose-600 hover:brightness-110 active:scale-[0.98] text-white font-display font-black tracking-wider text-xs uppercase rounded-xl shadow-[0_0_20px_rgba(244,63,94,0.5)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                >
                  <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain drop-shadow" />
                  <span>{isBuyingThis ? 'INVOKING DIVINE POWER...' : 'SUMMON ENTITY • 50 SHARDS'}</span>
                </button>

              </div>

            </div>
          );
        })()}

        {/* ===================== 4. DEMIURGE (ALTAR OF THE DEMIURGE) ===================== */}
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
            <div className="space-y-3">
              
              {/* Grand Bundle Banner */}
              <div className="bg-gradient-to-b from-[#2a0c16] via-[#1a060d] to-black border-2 border-rose-500/60 rounded-2xl p-3 shadow-2xl space-y-2.5 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span className="font-display font-black text-xs text-white uppercase tracking-wider">
                      SET OF THE DEMIURGE
                    </span>
                    <span className="bg-amber-400 text-black text-[8px] px-1 py-0.2 rounded font-black tracking-normal">
                      -17% OFF
                    </span>
                  </div>
                  <span className="bg-rose-950 border border-rose-500/60 text-rose-300 text-[9px] font-mono px-2 py-0.5 rounded font-black">
                    {ownedDemiurgeCount}/6 OWNED
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-b from-rose-950 to-black border border-rose-500/60 p-1 flex items-center justify-center shrink-0 shadow-lg">
                    <img src="/icons/equipment/demiurge_crest.png" alt="Demiurge Crest" className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display font-black text-xs sm:text-sm text-amber-300 uppercase">
                      6-Piece Divine Bundle
                    </h4>
                    <p className="text-[10px] text-gray-300 font-sans leading-tight mt-0.5">
                      Forge all 6 pieces at once and unlock complete primordial power.
                    </p>
                  </div>
                </div>

                <button
                  disabled={isBuyingSet || ownedDemiurgeCount === 6}
                  onClick={buyDivineSet}
                  className={`w-full h-11 rounded-xl font-display font-black text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-[0.98] ${
                    ownedDemiurgeCount === 6
                      ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 cursor-default opacity-80'
                      : 'bg-gradient-to-r from-amber-600 via-rose-600 to-amber-600 hover:brightness-110 text-white border border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                  }`}
                >
                  <Crown className="w-4 h-4 text-amber-300" />
                  {ownedDemiurgeCount === 6 ? (
                    <span>FULL SET ASSEMBLED (6/6)</span>
                  ) : isBuyingSet ? (
                    <span>FORGING FULL SET...</span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span>FORGE ALL 6 PIECES:</span>
                      <span className="line-through text-rose-200/70 text-[10px]">300</span>
                      <span className="text-amber-300 font-mono text-sm font-black flex items-center gap-0.5">
                        <img src="/icons/icon_shards.webp" alt="Shards" className="w-3.5 h-3.5 object-contain inline" />
                        250
                      </span>
                    </div>
                  )}
                </button>
              </div>

              {/* 6-Piece Slot Selector Grid (High-Res Icons, Divine Border Aura) */}
              <div className="space-y-1.5">
                <div className="text-[9px] font-mono text-rose-400 uppercase font-black tracking-wider px-1 flex items-center gap-1.5">
                  <Sword className="w-3 h-3 text-rose-400" /> SELECT ARTIFACT TO INSPECT OR FORGE
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {demiurgeItems.map((item) => {
                    const itemOwned = (profile.equipment || []).some(e => e.name === item.name);
                    const isSelected = selectedDemiurgeItemName === item.name;

                    return (
                      <button
                        key={item.name}
                        onClick={() => setSelectedDemiurgeItemName(item.name)}
                        className={`p-2 rounded-xl border-2 transition-all flex flex-col items-center justify-between cursor-pointer relative overflow-hidden ${
                          isSelected
                            ? 'bg-gradient-to-b from-rose-950 via-[#26050d] to-black border-rose-400 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)] ring-1 ring-rose-400/60 scale-[1.02]'
                            : itemOwned
                            ? 'bg-gradient-to-b from-[#180a10] to-black border-rose-950/80 text-gray-200 hover:border-rose-500/50'
                            : 'bg-black/70 border-white/10 text-gray-400 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full text-[8px] font-mono uppercase font-bold">
                          <span className="text-rose-400">{item.slot}</span>
                          {itemOwned ? (
                            <span className="bg-emerald-950 border border-emerald-500/60 text-emerald-400 px-1 rounded text-[7.5px] font-black">✓</span>
                          ) : (
                            <div className="flex items-center gap-0.5 text-rose-300 font-mono font-bold text-[8px] bg-black/70 border border-rose-500/40 px-1.5 py-0.2 rounded">
                              <img src="/icons/icon_shards.webp" alt="Shards" className="w-2.5 h-2.5 object-contain inline" />
                              <span>50</span>
                            </div>
                          )}
                        </div>

                        {/* High-res Equipment Icon with glowing drop-shadow */}
                        <div className="w-11 h-11 my-1 rounded-xl p-1 flex items-center justify-center relative">
                          <img
                            src={getEquipmentIcon(item.name, item.slot)}
                            alt={item.name}
                            className={`w-full h-full object-contain ${
                              itemOwned ? 'drop-shadow-[0_0_10px_rgba(244,63,94,0.9)]' : 'drop-shadow-[0_0_4px_rgba(255,255,255,0.4)] opacity-80'
                            }`}
                          />
                        </div>

                        <div className="text-[9px] min-[380px]:text-[10px] font-display font-black text-white truncate w-full text-center leading-none">
                          {item.name.replace(' of the Demiurge', '')}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Relic Inspector & Forge Box */}
              <div className="bg-gradient-to-b from-[#1c080d] via-[#120508] to-black border-2 border-rose-500/50 rounded-2xl p-3 shadow-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded font-mono text-[8px] uppercase font-black bg-rose-950 text-rose-300 border border-rose-500/60">
                      {currentItem.slot}
                    </span>
                    <span className="px-2 py-0.5 rounded font-mono text-[8px] uppercase font-black bg-gradient-to-r from-red-950 to-rose-900 text-rose-300 border border-rose-400">
                      DIVINE
                    </span>
                  </div>
                  {isEquipped ? (
                    <span className="text-[8px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/50 px-2 py-0.5 rounded-full font-bold">
                      EQUIPPED
                    </span>
                  ) : isOwned ? (
                    <span className="text-[8px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/50 px-2 py-0.5 rounded-full font-bold">
                      OWNED
                    </span>
                  ) : (
                    <span className="text-[8px] font-mono bg-amber-950 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                      NOT ACQUIRED
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-black/80 border border-rose-400/40 p-1 flex items-center justify-center shrink-0 shadow-inner">
                    <img
                      src={getEquipmentIcon(currentItem.name, currentItem.slot)}
                      alt={currentItem.name}
                      className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(244,63,94,0.9)]"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display font-black text-sm text-white truncate">
                      {currentItem.name}
                    </h4>
                    <p className="text-[10.5px] text-gray-300 font-sans leading-tight mt-0.5 line-clamp-1">
                      {currentItem.description}
                    </p>
                    <div className="text-[10px] font-mono text-amber-300 font-bold mt-1">
                      {getItemStatSummary(currentItem)}
                    </div>
                  </div>
                </div>

                <button
                  disabled={isForgingCurrent}
                  onClick={() => buyDivineEquipment(currentItem.name)}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-rose-600 via-red-500 to-rose-600 hover:brightness-110 active:scale-[0.98] text-white font-display font-black text-xs uppercase flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50 transition-all"
                >
                  <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain" />
                  <span>{isForgingCurrent ? 'FORGING ARTIFACT...' : 'FORGE PIECE • 50 SHARDS'}</span>
                </button>
              </div>

              {/* Resonance Bonuses (Full-Width Milestone Cards with 100% Data Parity) */}
              <div className="bg-gradient-to-b from-[#1c080e] via-[#100408] to-black border-2 border-rose-500/40 rounded-2xl p-3 shadow-xl space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-rose-500/20">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-display font-black text-xs text-white uppercase tracking-wider">
                      SET RESONANCE BONUSES
                    </span>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-rose-300 bg-rose-950 border border-rose-500/50 px-2 py-0.5 rounded-full">
                    {ownedDemiurgeCount}/6 Owned
                  </span>
                </div>

                {/* 6 Pieces progress bar dots */}
                <div className="flex items-center gap-1.5 py-0.5">
                  {[1, 2, 3, 4, 5, 6].map((step) => (
                    <div
                      key={step}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        ownedDemiurgeCount >= step
                          ? 'bg-gradient-to-r from-rose-500 to-amber-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                          : 'bg-black/60 border border-white/10'
                      }`}
                    />
                  ))}
                </div>

                {/* 3 Milestone Threshold Cards */}
                <div className="space-y-1.5 pt-1">
                  {DEMIURGE_SET.thresholds.map((threshold, tIdx) => {
                    const isActive = ownedDemiurgeCount >= threshold.pieces;
                    return (
                      <div
                        key={tIdx}
                        className={`rounded-xl p-2.5 border transition-all duration-300 ${
                          isActive
                            ? 'bg-gradient-to-r from-rose-950/90 via-[#270710]/90 to-rose-950/80 border-rose-400/90 shadow-[0_0_12px_rgba(244,63,94,0.35)] ring-1 ring-rose-400/40'
                            : 'bg-black/50 border-white/10 opacity-70'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-4 h-4 rounded text-[8.5px] font-mono font-black flex items-center justify-center ${
                                isActive ? 'bg-gradient-to-br from-rose-500 to-amber-500 text-black font-bold shadow' : 'bg-white/10 text-gray-400'
                              }`}
                            >
                              {threshold.pieces}
                            </span>
                            <span
                              className={`text-[9.5px] font-mono font-black uppercase tracking-wider ${
                                isActive ? 'text-rose-200' : 'text-gray-400'
                              }`}
                            >
                              {threshold.label} {threshold.pieces === 6 ? '(FULL SET)' : ''}
                            </span>
                          </div>

                          {isActive ? (
                            <span className="text-[7.5px] font-mono font-black text-rose-300 bg-rose-950 border border-rose-500/70 px-1.5 py-0.2 rounded-full flex items-center gap-1 shadow-[0_0_6px_rgba(244,63,94,0.6)]">
                              <Check className="w-2.5 h-2.5 text-emerald-400" /> ACTIVE
                            </span>
                          ) : (
                            <span className="text-[7.5px] font-mono text-rose-300/70 bg-black/50 border border-white/10 px-1.5 py-0.2 rounded-full">
                              {threshold.pieces - ownedDemiurgeCount} more needed
                            </span>
                          )}
                        </div>

                        <p className={`text-[10px] font-sans leading-snug ${isActive ? 'text-rose-100 font-medium' : 'text-gray-400'}`}>
                          {threshold.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          );
        })()}

        {/* ===================== 5. SHIELDS (AEGIS SHOWCASE) ===================== */}
        {activeCategory === 'shields' && (
          <div className="space-y-2.5">
            {[
              {
                type: '3h' as const,
                name: '3-Hour Void Aegis',
                durationLabel: '3 Hours Immunity',
                desc: 'Minor defense ward protecting Arena Crowns.',
                cost: 8,
                image: '/icons/shield_3h.png',
                tag: 'STANDARD',
                border: 'border-emerald-500/50 hover:border-emerald-400',
              },
              {
                type: '6h' as const,
                name: '6-Hour Astral Aegis',
                durationLabel: '6 Hours Immunity',
                desc: 'Greater defense ward for overnight protection.',
                cost: 15,
                image: '/icons/shield_6h.png',
                tag: 'POPULAR',
                border: 'border-cyan-500/60 hover:border-cyan-400',
              },
              {
                type: '12h' as const,
                name: '12-Hour Supreme Aegis',
                durationLabel: '12 Hours Immunity',
                desc: 'Celestial citadel barrier for maximum safety.',
                cost: 25,
                image: '/icons/shield_12h.png',
                tag: 'BEST VALUE (-18%)',
                border: 'border-purple-500/60 hover:border-purple-400',
              },
            ].map((item) => {
              const owned = profile.shieldsInventory?.[item.type] || 0;
              const canAfford = (profile.darkShards || 0) >= item.cost;
              const isPurchasing = isBuyingShield === item.type;

              return (
                <div
                  key={item.type}
                  className={`bg-gradient-to-b from-[#111724] via-[#0b0f17] to-black border-2 ${item.border} rounded-2xl p-3 shadow-xl space-y-2.5`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-mono font-bold bg-white/10 px-2 py-0.5 rounded text-amber-300 uppercase tracking-wider">
                      {item.tag}
                    </span>
                    <span className="text-[9px] font-mono text-gray-400 font-bold">
                      Vault: {owned} Owned
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl bg-black/60 border border-white/10 p-1 flex items-center justify-center shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display font-black text-sm text-white truncate">
                        {item.name}
                      </h4>
                      <div className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold mt-0.5">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        <span>{item.durationLabel}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-sans leading-tight mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <button
                    disabled={isPurchasing}
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
                        } else {
                          toast(res.message, 'error');
                        }
                      } catch (e: any) {
                        toast(e.message || 'Purchase failed', 'error');
                      } finally {
                        setIsBuyingShield(null);
                      }
                    }}
                    className={`w-full h-10 rounded-xl font-display font-black text-xs uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.98] shadow-md ${
                      isPurchasing
                        ? 'bg-gray-700 text-gray-400 cursor-wait'
                        : canAfford
                        ? 'bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 hover:brightness-110 text-white shadow-purple-950/60'
                        : 'bg-purple-950/60 border border-purple-500/40 text-purple-300'
                    }`}
                  >
                    {isPurchasing ? (
                      <span>ACQUIRING...</span>
                    ) : (
                      <>
                        <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain" />
                        <span>ACQUIRE FOR {item.cost} SHARDS</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}

            {/* Daily Subscription info banner */}
            <div className="bg-gradient-to-r from-amber-950/25 to-purple-950/25 border border-amber-500/20 rounded-xl p-2.5 flex items-start gap-2 text-xs">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-gray-300 text-[10px] font-sans leading-relaxed">
                <span className="text-amber-300 font-bold uppercase mr-1">Daily Pass Shields:</span>
                Premium Lords collect <strong className="text-amber-200">1x 3h Shield</strong> daily. Ultra Overlords collect <strong className="text-amber-300">1x 6h Shield</strong> daily in Pass Tributes.
              </p>
            </div>
          </div>
        )}

        {/* ===================== 6. LEVEL BOOST (TRANSCENDENCE CARDS) ===================== */}
        {activeCategory === 'level_boost' && (
          <div className="space-y-3">
            
            {/* Header Hero Level */}
            <div className="flex items-center justify-between bg-black/60 border border-amber-500/30 rounded-xl px-3 py-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] font-mono text-gray-300 uppercase font-bold">CURRENT HERO LEVEL:</span>
              </div>
              <span className="text-amber-300 font-display font-black text-sm drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]">
                LVL {profile.level || 1}
              </span>
            </div>

            {/* Level 50 Card */}
            {(() => {
              const currentLvl = profile.level || 1;
              const isAlreadyReached = currentLvl >= 50;
              const cost = 250;
              const canAfford = (profile.darkShards || 0) >= cost;
              const isProcessing = isBuyingLevelBoost === 50;

              return (
                <div className={`rounded-2xl border-2 p-3 space-y-2.5 shadow-xl relative overflow-hidden transition-all ${
                  isAlreadyReached
                    ? 'bg-[#0d0f14]/80 border-white/10 opacity-70'
                    : 'bg-gradient-to-b from-[#1c1208] via-[#120b05] to-black border-amber-500/60'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      ASCENDANT CHAMPION
                    </span>
                    <span className="bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 rounded text-[8px] font-mono text-amber-300 font-bold">
                      STAGE I
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 min-[380px]:w-18 min-[380px]:h-18 rounded-xl bg-amber-500/10 border border-amber-400/50 p-1 flex items-center justify-center shrink-0 shadow-lg">
                      <img src="/shop/level_50_sigil.png" alt="Level 50 Sigil" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-display font-black text-sm min-[380px]:text-base text-white uppercase">
                        Instant Level 50
                      </h4>
                      <p className="text-[10px] text-gray-300 font-sans leading-tight mt-0.5">
                        Surge directly into mid-game content and mastery.
                      </p>
                    </div>
                  </div>

                  <div className="bg-black/65 border border-white/10 rounded-xl p-2.5 text-[11px] font-mono space-y-1">
                    <div className="flex justify-between text-gray-300">
                      <span>Hero Level:</span>
                      <span className="text-white font-bold">Level 50</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Talent Points:</span>
                      <span className="text-amber-300 font-bold">+49 Points</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Base Health:</span>
                      <span className="text-emerald-300 font-bold">128 HP</span>
                    </div>
                  </div>

                  {isAlreadyReached ? (
                    <div className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 font-display font-black text-xs uppercase tracking-widest text-center">
                      ✓ ALREADY REACHED LEVEL 50+
                    </div>
                  ) : (
                    <button
                      disabled={isProcessing}
                      onClick={() => handleBuyLevelBoost(50)}
                      className={`w-full h-11 rounded-xl font-display font-black text-xs uppercase flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98] shadow-md ${
                        isProcessing
                          ? 'bg-gray-700 text-gray-400 cursor-wait'
                          : canAfford
                          ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:brightness-110 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                          : 'bg-amber-950/60 border border-amber-500/40 text-amber-300'
                      }`}
                    >
                      {isProcessing ? 'ASCENDING...' : (
                        <>
                          <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain" />
                          <span>ASCEND TO LEVEL 50 • {cost} SHARDS</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })()}

            {/* Level 100 Card */}
            {(() => {
              const currentLvl = profile.level || 1;
              const isMaxLevel = currentLvl >= 100;
              const cost = 700;
              const canAfford = (profile.darkShards || 0) >= cost;
              const isProcessing = isBuyingLevelBoost === 100;

              return (
                <div className={`rounded-2xl border-2 p-3 space-y-2.5 shadow-xl relative overflow-hidden transition-all ${
                  isMaxLevel
                    ? 'bg-[#0d0f14]/80 border-white/10 opacity-70'
                    : 'bg-gradient-to-b from-[#240b15] via-[#15070d] to-black border-rose-500/60'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                      SUPREME GODHOOD
                    </span>
                    <span className="bg-rose-950/80 border border-rose-500/40 px-2 py-0.5 rounded text-[8px] font-mono text-rose-300 font-bold">
                      MAXIMUM APEX
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 min-[380px]:w-18 min-[380px]:h-18 rounded-xl bg-rose-500/10 border border-rose-400/60 p-1 flex items-center justify-center shrink-0 shadow-lg">
                      <img src="/shop/level_100_sigil.png" alt="Level 100 Sigil" className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(244,63,94,0.85)]" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-display font-black text-sm min-[380px]:text-base text-white uppercase">
                        Instant Level 100
                      </h4>
                      <p className="text-[10px] text-gray-300 font-sans leading-tight mt-0.5">
                        Attain total mastery over the Abyss from day one.
                      </p>
                    </div>
                  </div>

                  <div className="bg-black/65 border border-white/10 rounded-xl p-2.5 text-[11px] font-mono space-y-1">
                    <div className="flex justify-between text-gray-300">
                      <span>Hero Level:</span>
                      <span className="text-white font-bold">Level 100 (MAX)</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Talent Points:</span>
                      <span className="text-amber-300 font-bold">+99 Points (Full Trees)</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Base Health:</span>
                      <span className="text-emerald-300 font-bold">228 HP</span>
                    </div>
                  </div>

                  {isMaxLevel ? (
                    <div className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 font-display font-black text-xs uppercase tracking-widest text-center">
                      ✓ MAXIMUM LEVEL REACHED (100)
                    </div>
                  ) : (
                    <button
                      disabled={isProcessing}
                      onClick={() => handleBuyLevelBoost(100)}
                      className={`w-full h-11 rounded-xl font-display font-black text-xs uppercase flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98] shadow-md ${
                        isProcessing
                          ? 'bg-gray-700 text-gray-400 cursor-wait'
                          : canAfford
                          ? 'bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 hover:brightness-110 text-white shadow-[0_0_18px_rgba(244,63,94,0.5)]'
                          : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
                      }`}
                    >
                      {isProcessing ? 'ASCENDING...' : (
                        <>
                          <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain" />
                          <span>ASCEND TO LEVEL 100 • {cost} SHARDS</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })()}

            {/* Sanctum Notice */}
            <div className="bg-black/60 border border-amber-500/20 rounded-xl p-2.5 flex items-start gap-2 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 shrink-0" />
              <p className="font-mono text-[10px] text-gray-300 leading-relaxed">
                After ascending, visit the <strong>LORD</strong> tab to allocate your unassigned skill points across combat stances.
              </p>
            </div>

          </div>
        )}

      </div>

      {/* 3. REWARD REVEAL ANIMATION MODAL */}
      {openingPack && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto">
          <div className="max-w-md w-full text-center space-y-5 my-auto">
            
            {!isRevealed ? (
              /* Phase 1: Portal / Summoning buildup */
              <div className="space-y-3 py-6">
                <div className="w-24 h-24 mx-auto rounded-full bg-black border border-[#c5a880]/30 flex items-center justify-center relative shadow-2xl animate-bounce">
                  <div className="absolute inset-0 rounded-full border-t-2 border-b-2 border-t-[#66fcf1] border-b-[#dd2c40] animate-spin" />
                  <Sparkles className="w-8 h-8 text-[#ebd09b] animate-pulse" />
                </div>
                <h3 className="font-display font-black text-base text-white tracking-widest uppercase animate-pulse">
                  SUMMONING ENTITIES FROM ALTAR...
                </h3>
                <p className="text-[11px] text-gray-500 font-mono">Dark forces intertwine the edges of worlds...</p>
              </div>
            ) : (
              /* Phase 2: Revealed Cards / Equipment */
              <div className="space-y-4 py-3">
                <div className="space-y-0.5">
                  <h3 className="font-display font-black text-xl text-[#ebd09b] tracking-widest text-shadow-gold uppercase">
                    {revealedCards.length > 0 ? 'ENTITIES SUMMONED!' : 'RELICS DISCOVERED!'}
                  </h3>
                  <p className="text-[11px] text-gray-400 font-sans">
                    {revealedCards.length > 0 ? 'These dark forces have joined your collection.' : 'The abyss grants you this power.'}
                  </p>
                </div>

                {/* Cards Grid */}
                {revealedCards.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2.5">
                    {revealedCards.map((card, idx) => {
                      const skill = card.skills[0];
                      return (
                        <motion.div
                          key={card.id || idx}
                          initial={{ opacity: 0, y: 20, scale: 0.8 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.4, delay: idx * 0.15 }}
                        >
                          <div
                            className={`w-32 min-[380px]:w-36 aspect-[3/4.2] rounded-2xl p-2 flex flex-col justify-between relative shadow-2xl overflow-hidden border ${getCardTierStyles(card.tier, false, true)}`}
                          >
                            <img
                              src={getCardImageUrl(card)}
                              alt={card.name}
                              className="absolute inset-0 w-full h-full object-cover z-0 opacity-90"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10 z-0 pointer-events-none" />

                            <div className="relative z-10 flex justify-between items-start">
                              <div className="text-center bg-black/70 backdrop-blur-sm px-1.5 py-0.2 rounded border border-[#c5a880]/30 shadow-md">
                                <span className="text-[7.5px] text-[#ebd09b] uppercase font-mono font-bold tracking-wider">{card.tier}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                {renderManaIcon(getCardManaCost(card), "w-4 h-4")}
                                <div className="bg-black/80 border border-[#c5a880]/50 rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-mono font-black text-[#ebd09b] shadow">
                                  L{card.level}
                                </div>
                              </div>
                            </div>

                            <div className="relative z-10 space-y-0.5 mt-auto">
                              <span className="text-[11px] font-display font-black text-white block truncate leading-none text-shadow-gold">
                                {card.name}
                              </span>

                              {skill && (
                                <div className="bg-black/70 backdrop-blur-sm border border-gray-900/50 p-0.5 rounded text-[7.5px] text-gray-300 text-center leading-tight">
                                  <span className="font-semibold block text-[#c5a880] uppercase text-[7px]">{skill.type}</span>
                                  <span className="line-clamp-1">{skill.description}</span>
                                </div>
                              )}

                              <div className="flex justify-between items-center text-[8px] font-mono font-bold pt-0.5 border-t border-gray-800/80 bg-black/50 backdrop-blur-sm rounded px-1 py-0.5">
                                <span className="text-red-400">⚔️{card.attack}</span>
                                <span className="text-emerald-400">❤️{card.health}</span>
                                <span className="text-blue-400">⏳{card.delay}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {/* Equipment Grid */}
                {revealedEquipment.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2.5">
                    {revealedEquipment.map((eq, idx) => (
                      <motion.div
                        key={eq.id || idx}
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: idx * 0.15 }}
                        className={`relative w-32 min-[380px]:w-36 h-48 rounded-2xl flex flex-col items-center justify-between border-2 shadow-2xl overflow-hidden p-2.5 ${
                          eq.tier === 'divine' ? 'bg-gradient-to-br from-rose-950 via-[#26050d] to-black border-rose-500' :
                          eq.tier === 'legendary' ? 'bg-gradient-to-br from-purple-950 via-[#180424] to-black border-purple-500' :
                          eq.tier === 'gold' ? 'bg-gradient-to-br from-yellow-950 via-[#1f1404] to-black border-yellow-500' :
                          eq.tier === 'silver' ? 'bg-gradient-to-br from-slate-900 via-[#101720] to-black border-slate-400' :
                          'bg-gradient-to-br from-stone-900 via-[#191410] to-black border-amber-700/60'
                        }`}
                      >
                        <div className="w-full flex items-center justify-between z-10">
                          <span className="text-[8px] font-mono uppercase text-gray-400">{eq.slot}</span>
                          <span className="px-1.5 py-0.2 rounded bg-black/80 text-[7.5px] font-display font-black tracking-widest uppercase border border-white/20 text-white">
                            {eq.tier}
                          </span>
                        </div>

                        <div className="w-14 h-14 rounded-xl bg-black/60 border border-white/15 flex items-center justify-center p-1 my-auto shadow-inner">
                          <img
                            src={getEquipmentIcon(eq)}
                            alt={eq.name}
                            className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                          />
                        </div>

                        <div className="w-full text-center space-y-0.5 z-10">
                          <h4 className="font-display font-bold text-center text-[11px] text-white truncate leading-tight">{eq.name}</h4>
                          <div className="bg-black/60 w-full py-0.5 rounded-lg text-center text-[9px] font-mono border border-white/10 text-emerald-400 font-bold">
                            +{eq.bonusValue} {eq.bonusType}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={closeReveal}
                    className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-95 text-black font-display font-black tracking-widest py-2.5 px-6 rounded-xl shadow-lg text-xs cursor-pointer uppercase transition-all"
                  >
                    CLAIM REWARDS
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
