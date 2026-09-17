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
  Plus,
  Flame,
  Skull,
  ShieldCheck,
  Award
} from 'lucide-react';

export type MobileShopCategory = 'boosters' | 'chests' | 'pantheon' | 'demiurge' | 'shields' | 'level_boost';

interface MobileShopViewProps {
  initialTab?: 'cards' | 'equipment' | 'divine' | 'shields' | 'level_boost';
}

const renderManaIcon = (cost: number, sizeClass: string = "w-5 h-5") => {
  return (
    <div className={`relative ${sizeClass} shrink-0 flex items-center justify-center`}>
      <svg className="absolute inset-0 w-full h-full filter drop-shadow-[0_0_5px_rgba(6,182,212,0.85)]" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L4 7v10l8 5 8-5V7l-8-5z" fill="url(#manaCrystalGradMobileShop)" stroke="#66fcf1" strokeWidth="1.5" />
        <path d="M12 2L4 7l8 5 8-5-8-5z" fill="#66fcf1" opacity="0.35" />
        <path d="M4 7v10l8 5V12L4 7z" fill="#00d2ff" opacity="0.55" />
        <path d="M20 7v10l8 5V12L20 7z" fill="#005299" opacity="0.75" />
        <defs>
          <radialGradient id="manaCrystalGradMobileShop" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00f0ff" />
            <stop offset="100%" stopColor="#0033aa" />
          </radialGradient>
        </defs>
      </svg>
      <span className="relative text-white text-[10px] font-black font-mono leading-none z-10 drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.95)]">
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
    setIsGoldShopOpen,
    setIsDustShopOpen,
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

  // Sync initialTab when changed from external deep-links (e.g. from Hero or PvP)
  useEffect(() => {
    if (initialTab) {
      setActiveCategory(getCategoryFromTab(initialTab));
    }
  }, [initialTab]);

  // Shield countdown timer
  const [shieldTimeLeft, setShieldTimeLeft] = useState<string | null>(null);
  useEffect(() => {
    const updateShieldTimer = () => {
      const until = profile.activeShieldUntil || profile.pvpShieldExpiresAt || 0;
      const now = Date.now();
      if (until <= now) {
        setShieldTimeLeft(null);
      } else {
        const diffSec = Math.floor((until - now) / 1000);
        const h = Math.floor(diffSec / 3600);
        const m = Math.floor((diffSec % 3600) / 60);
        const s = diffSec % 60;
        setShieldTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      }
    };
    updateShieldTimer();
    const interval = setInterval(updateShieldTimer, 1000);
    return () => clearInterval(interval);
  }, [profile.activeShieldUntil, profile.pvpShieldExpiresAt]);

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

  // Category navigation tabs list
  const CATEGORIES: {
    id: MobileShopCategory;
    name: string;
    badge?: string;
    icon: string;
    color: string;
    activeBg: string;
    activeBorder: string;
  }[] = [
    {
      id: 'boosters',
      name: 'BOOSTERS',
      badge: '3 PACKS',
      icon: '/packs/pack_obsidian.webp',
      color: 'text-cyan-300',
      activeBg: 'from-[#0a2330] via-[#071924] to-[#040e14]',
      activeBorder: 'border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.35)]',
    },
    {
      id: 'chests',
      name: 'CHESTS',
      badge: 'GEAR',
      icon: '/packs/chest_premium.webp',
      color: 'text-purple-300',
      activeBg: 'from-[#230d36] via-[#160723] to-[#0a0210]',
      activeBorder: 'border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.35)]',
    },
    {
      id: 'pantheon',
      name: 'PANTHEON',
      badge: '3 GODS',
      icon: '/icons/crown.png',
      color: 'text-amber-300',
      activeBg: 'from-[#2a1708] via-[#1a0e04] to-[#0a0501]',
      activeBorder: 'border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.35)]',
    },
    {
      id: 'demiurge',
      name: 'DEMIURGE',
      badge: `${ownedDemiurgeCount}/6`,
      icon: '/icons/equipment/demiurge_crest.png',
      color: 'text-rose-300',
      activeBg: 'from-[#290812] via-[#19040a] to-[#0a0104]',
      activeBorder: 'border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.35)]',
    },
    {
      id: 'shields',
      name: 'SHIELDS',
      badge: shieldTimeLeft ? 'ACTIVE' : 'OFF',
      icon: '/icons/shield_indicator.png',
      color: 'text-emerald-300',
      activeBg: 'from-[#0b241a] via-[#061811] to-[#030d09]',
      activeBorder: 'border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.35)]',
    },
    {
      id: 'level_boost',
      name: 'BOOST',
      badge: 'VIP',
      icon: '/shop/ascension_sigil.png',
      color: 'text-yellow-300',
      activeBg: 'from-[#2b1708] via-[#1a0c03] to-[#0c0501]',
      activeBorder: 'border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]',
    },
  ];

  return (
    <div className="h-full w-full flex flex-col bg-[#07090e] text-gray-200 select-none overflow-y-auto no-scrollbar font-sans pb-28">
      
      {/* 1. STICKY TOP SHOP HEADER & CATEGORY NAVIGATION BAR */}
      <div className="sticky top-0 z-30 bg-[#07090e]/95 backdrop-blur-md border-b border-[#c5a880]/20 px-2 py-2 shrink-0 space-y-2">
        
        {/* Title and Quick Resource Balances */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="h-[1px] w-4 bg-gradient-to-r from-transparent to-amber-500" />
            <h1 className="font-display font-black text-sm tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-200 to-amber-500 drop-shadow-[0_2px_8px_rgba(245,158,11,0.5)] uppercase">
              VOID SHOP
            </h1>
            <span className="h-[1px] w-4 bg-gradient-to-l from-transparent to-amber-500" />
          </div>

          {/* Quick Balance Pills inside Shop */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            {/* Gold */}
            <button
              onClick={() => setIsGoldShopOpen(true)}
              className="flex items-center gap-1 bg-black/60 border border-amber-500/40 hover:border-amber-400 px-2 py-0.5 rounded-full cursor-pointer active:scale-95 transition-transform"
            >
              <img src="/icons/icon_gold.webp" alt="Gold" className="w-3.5 h-3.5 object-contain" />
              <span className="text-amber-400 font-bold text-[10.5px]">{(profile.gold || 0).toLocaleString()}</span>
              <Plus className="w-2.5 h-2.5 text-amber-300" />
            </button>

            {/* Dust (+70% scaled) */}
            <button
              onClick={() => setIsDustShopOpen(true)}
              className="flex items-center gap-1 bg-black/60 border border-cyan-500/40 hover:border-cyan-400 px-2 py-0.5 rounded-full cursor-pointer active:scale-95 transition-transform"
            >
              <img src="/icons/icon_dust.webp" alt="Dust" className="w-3.5 h-3.5 object-contain scale-[1.7] origin-center mx-0.5" />
              <span className="text-cyan-300 font-bold text-[10.5px]">{(profile.dust || 0).toLocaleString()}</span>
              <Plus className="w-2.5 h-2.5 text-cyan-300" />
            </button>

            {/* Shards */}
            <button
              onClick={() => setIsShardsShopOpen(true)}
              className="flex items-center gap-1 bg-black/60 border border-rose-500/40 hover:border-rose-400 px-2 py-0.5 rounded-full cursor-pointer active:scale-95 transition-transform"
            >
              <img src="/icons/icon_shards.webp" alt="Shards" className="w-3.5 h-3.5 object-contain" />
              <span className="text-rose-300 font-bold text-[10.5px]">{(profile.darkShards || 0).toLocaleString()}</span>
              <Plus className="w-2.5 h-2.5 text-rose-300" />
            </button>
          </div>
        </div>

        {/* Horizontal Category Switcher Bar */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-0.5">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                  isActive
                    ? `bg-gradient-to-r ${cat.activeBg} ${cat.activeBorder} text-white font-black scale-[1.02]`
                    : 'bg-black/50 border-white/10 text-gray-400 hover:text-gray-200 hover:border-white/20'
                }`}
              >
                <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 overflow-hidden">
                  <img src={cat.icon} alt={cat.name} className="w-full h-full object-contain" />
                </div>
                <span className="font-display text-[10.5px] tracking-wider uppercase">
                  {cat.name}
                </span>
                {cat.badge && (
                  <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                    isActive ? 'bg-black/60 border border-white/20 text-white' : 'bg-white/5 text-gray-400'
                  }`}>
                    {cat.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>

      {/* 2. MAIN CATEGORY CONTENT AREA */}
      <div className="p-3 sm:p-4 space-y-4">
        
        {/* ===================== 1. BOOSTERS (CARD PACKS) ===================== */}
        {activeCategory === 'boosters' && (
          <div className="space-y-3.5">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-cyan-900/50 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                <h2 className="font-display font-black text-sm tracking-widest text-cyan-200 uppercase">
                  CARD BOOSTERS
                </h2>
              </div>
              <span className="text-[9px] font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Box className="w-2.5 h-2.5 text-cyan-400" /> 3 CARDS PER PACK
              </span>
            </div>

            {/* 3 Pack Cards */}
            <div className="grid grid-cols-1 gap-3.5">
              
              {/* Bronze Booster */}
              <div className="bg-gradient-to-b from-[#1a130c] via-[#110d08] to-[#070503] border-2 border-amber-700/60 rounded-2xl p-3.5 shadow-xl relative overflow-hidden flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    COMMON SUMMON
                  </span>
                  <span className="bg-amber-950/80 border border-amber-600/40 px-2 py-0.2 rounded text-[8px] font-mono text-amber-300 font-bold">
                    TIER I
                  </span>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-24 h-24 rounded-xl bg-gradient-to-b from-amber-950/40 to-black border border-amber-600/30 flex items-center justify-center p-1 relative overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.2),transparent_70%)]" />
                    <img src="/packs/pack_bronze.webp" alt="Bronze Pack" className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-black text-base text-white">Bronze Booster</h3>
                    <p className="text-[11px] text-gray-400 font-sans mt-0.5 leading-snug">
                      Recruit starter units & establish battlefield presence.
                    </p>
                    <div className="mt-2 bg-black/60 border border-white/10 rounded-lg p-2 text-[10px] font-mono space-y-1">
                      <div className="flex justify-between text-gray-300">
                        <span>Bronze (Common):</span>
                        <span className="text-amber-400 font-bold">90%</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Silver (Rare):</span>
                        <span className="text-slate-300 font-bold">10%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => buyPackBackend('bronze')}
                  className="w-full bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:brightness-110 active:scale-95 text-black font-display font-black text-xs tracking-widest uppercase py-2.5 px-4 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.35)] flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <img src="/icons/icon_gold.webp" alt="Gold" className="w-4 h-4 object-contain" />
                  <span>1,000 GOLD</span>
                </button>
              </div>

              {/* Obsidian Booster */}
              <div className="bg-gradient-to-b from-[#091b26] via-[#06121a] to-[#03090e] border-2 border-cyan-500/60 rounded-2xl p-3.5 shadow-xl relative overflow-hidden flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    ELITE SUMMON
                  </span>
                  <span className="bg-cyan-950/80 border border-cyan-500/40 px-2 py-0.2 rounded text-[8px] font-mono text-cyan-300 font-bold">
                    TIER II
                  </span>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-24 h-24 rounded-xl bg-gradient-to-b from-cyan-950/40 to-black border border-cyan-500/30 flex items-center justify-center p-1 relative overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.2),transparent_70%)]" />
                    <img src="/packs/pack_obsidian.webp" alt="Obsidian Pack" className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_12px_rgba(6,182,212,0.5)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-black text-base text-white">Obsidian Booster</h3>
                    <p className="text-[11px] text-gray-400 font-sans mt-0.5 leading-snug">
                      Infused with obsidian essence. High chance of rare fighters.
                    </p>
                    <div className="mt-2 bg-black/60 border border-white/10 rounded-lg p-2 text-[10px] font-mono space-y-1">
                      <div className="flex justify-between text-gray-300">
                        <span>Silver (Rare):</span>
                        <span className="text-slate-300 font-bold">70%</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Gold (Epic):</span>
                        <span className="text-amber-400 font-bold">30%</span>
                      </div>
                      <div className="flex justify-between text-cyan-300 pt-0.5 border-t border-white/10 font-bold">
                        <span>Level 2 Chance:</span>
                        <span>25%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => buyPackBackend('obsidian')}
                  className="w-full bg-gradient-to-r from-cyan-950 via-[#0a303d] to-cyan-950 hover:brightness-125 active:scale-95 text-cyan-200 border border-cyan-400/60 font-display font-black text-xs tracking-widest uppercase py-2.5 px-4 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain" />
                  <span>30 SHARDS</span>
                </button>
              </div>

              {/* Abyssal Lord Pack */}
              <div className="bg-gradient-to-b from-[#240810] via-[#16050b] to-[#0b0205] border-2 border-rose-500/60 rounded-2xl p-3.5 shadow-xl relative overflow-hidden flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                    FORBIDDEN SUMMON
                  </span>
                  <span className="bg-rose-950/80 border border-rose-500/50 px-2 py-0.2 rounded text-[8px] font-mono text-rose-300 font-bold">
                    TIER III
                  </span>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-24 h-24 rounded-xl bg-gradient-to-b from-rose-950/40 to-black border border-rose-500/30 flex items-center justify-center p-1 relative overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.25),transparent_70%)]" />
                    <img src="/packs/pack_abyssal.webp" alt="Abyssal Pack" className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_14px_rgba(244,63,94,0.6)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-black text-base text-white">Abyssal Lord Pack</h3>
                    <p className="text-[11px] text-gray-400 font-sans mt-0.5 leading-snug">
                      High rate for Gold & Legendary primordial entities.
                    </p>
                    <div className="mt-2 bg-black/60 border border-white/10 rounded-lg p-2 text-[10px] font-mono space-y-1">
                      <div className="flex justify-between text-gray-300">
                        <span>Silver: 30%</span>
                        <span className="text-amber-400">Gold: 55%</span>
                        <span className="text-purple-300 font-bold">Leg: 15%</span>
                      </div>
                      <div className="flex justify-between text-rose-300 pt-0.5 border-t border-white/10 font-bold">
                        <span>Level 2 Chance:</span>
                        <span>30%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => buyPackBackend('abyssal')}
                  className="w-full bg-gradient-to-r from-rose-950 via-red-900 to-rose-950 hover:brightness-125 active:scale-95 text-white border border-rose-500/60 font-display font-black text-xs tracking-widest uppercase py-2.5 px-4 rounded-xl shadow-[0_0_18px_rgba(244,63,94,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain" />
                  <span>70 SHARDS</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ===================== 2. CHESTS (RELIC EQUIPMENT) ===================== */}
        {activeCategory === 'chests' && (
          <div className="space-y-3.5">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-purple-900/50 pb-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400 animate-pulse" />
                <h2 className="font-display font-black text-sm tracking-widest text-purple-200 uppercase">
                  RELIC CHESTS
                </h2>
              </div>
              <span className="text-[9px] font-mono text-purple-300 bg-purple-950/80 border border-purple-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Shield className="w-2.5 h-2.5 text-purple-400" /> 1 RELIC PER CHEST
              </span>
            </div>

            {/* 3 Chest Cards */}
            <div className="grid grid-cols-1 gap-3.5">
              
              {/* Basic Chest */}
              <div className="bg-gradient-to-b from-[#1a130c] via-[#110d08] to-[#070503] border-2 border-amber-700/60 rounded-2xl p-3.5 shadow-xl relative overflow-hidden flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    STANDARD RELICS
                  </span>
                  <span className="bg-amber-950/80 border border-amber-600/40 px-2 py-0.2 rounded text-[8px] font-mono text-amber-300 font-bold">
                    RANK I
                  </span>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-24 h-24 rounded-xl bg-gradient-to-b from-amber-950/40 to-black border border-amber-600/30 flex items-center justify-center p-1 relative overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.2),transparent_70%)]" />
                    <img src="/packs/chest_basic.webp" alt="Basic Chest" className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-black text-base text-white">Basic Equipment Chest</h3>
                    <p className="text-[11px] text-gray-400 font-sans mt-0.5 leading-snug">
                      Forged for new lords entering the Abyssal Trials.
                    </p>
                    <div className="mt-2 bg-black/60 border border-white/10 rounded-lg p-2 text-[10px] font-mono space-y-1">
                      <div className="flex justify-between text-gray-300">
                        <span>Bronze Equipment:</span>
                        <span className="text-amber-400 font-bold">80%</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Silver Equipment:</span>
                        <span className="text-slate-300 font-bold">20%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => buyPackBackend('eq_basic', true)}
                  className="w-full bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:brightness-110 active:scale-95 text-black font-display font-black text-xs tracking-widest uppercase py-2.5 px-4 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.35)] flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <img src="/icons/icon_gold.webp" alt="Gold" className="w-4 h-4 object-contain" />
                  <span>700 GOLD</span>
                </button>
              </div>

              {/* Rare Chest */}
              <div className="bg-gradient-to-b from-[#091824] via-[#061019] to-[#03080d] border-2 border-cyan-500/60 rounded-2xl p-3.5 shadow-xl relative overflow-hidden flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    ARCANE CACHE
                  </span>
                  <span className="bg-cyan-950/80 border border-cyan-500/40 px-2 py-0.2 rounded text-[8px] font-mono text-cyan-300 font-bold">
                    RANK II
                  </span>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-24 h-24 rounded-xl bg-gradient-to-b from-cyan-950/40 to-black border border-cyan-500/30 flex items-center justify-center p-1 relative overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.2),transparent_70%)]" />
                    <img src="/packs/chest_rare.webp" alt="Rare Chest" className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_12px_rgba(6,182,212,0.5)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-black text-base text-white">Rare Equipment Chest</h3>
                    <p className="text-[11px] text-gray-400 font-sans mt-0.5 leading-snug">
                      Enchanted armaments granting potent stat enhancements.
                    </p>
                    <div className="mt-2 bg-black/60 border border-white/10 rounded-lg p-2 text-[10px] font-mono space-y-1">
                      <div className="flex justify-between text-gray-300">
                        <span>Bronze: 40%</span>
                        <span className="text-cyan-300 font-bold">Silver: 50%</span>
                        <span className="text-amber-400 font-bold">Gold: 10%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => buyPackBackend('eq_rare', true)}
                  className="w-full bg-gradient-to-r from-cyan-950 via-[#0a303d] to-cyan-950 hover:brightness-125 active:scale-95 text-cyan-200 border border-cyan-400/60 font-display font-black text-xs tracking-widest uppercase py-2.5 px-4 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain" />
                  <span>30 SHARDS</span>
                </button>
              </div>

              {/* Premium Chest */}
              <div className="bg-gradient-to-b from-[#21092a] via-[#14051a] to-[#0a020d] border-2 border-purple-500/60 rounded-2xl p-3.5 shadow-xl relative overflow-hidden flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                    IMPERIAL HOARD
                  </span>
                  <span className="bg-purple-950/80 border border-purple-500/50 px-2 py-0.2 rounded text-[8px] font-mono text-purple-300 font-bold">
                    RANK III
                  </span>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-24 h-24 rounded-xl bg-gradient-to-b from-purple-950/40 to-black border border-purple-500/30 flex items-center justify-center p-1 relative overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.25),transparent_70%)]" />
                    <img src="/packs/chest_premium.webp" alt="Premium Chest" className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_14px_rgba(168,85,247,0.6)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-black text-base text-white">Premium Equipment Chest</h3>
                    <p className="text-[11px] text-gray-400 font-sans mt-0.5 leading-snug">
                      Peerless relics granting extraordinary Lord power.
                    </p>
                    <div className="mt-2 bg-black/60 border border-white/10 rounded-lg p-2 text-[10px] font-mono space-y-1">
                      <div className="flex justify-between text-gray-300">
                        <span>Silver: 60%</span>
                        <span className="text-amber-400 font-bold">Gold: 35%</span>
                        <span className="text-purple-300 font-bold">Leg: 5%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => buyPackBackend('eq_premium', true)}
                  className="w-full bg-gradient-to-r from-purple-950 via-rose-950 to-purple-950 hover:brightness-125 active:scale-95 text-white border border-purple-500/60 font-display font-black text-xs tracking-widest uppercase py-2.5 px-4 rounded-xl shadow-[0_0_18px_rgba(168,85,247,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain" />
                  <span>70 SHARDS</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ===================== 3. PANTHEON (DIVINE CARDS) ===================== */}
        {activeCategory === 'pantheon' && (
          <div className="space-y-4">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-rose-900/50 pb-2">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-rose-400 animate-pulse" />
                <h2 className="font-display font-black text-sm tracking-widest text-rose-200 uppercase">
                  DIVINE PANTHEON
                </h2>
              </div>
              <span className="text-[9px] font-mono text-rose-300 bg-rose-950/80 border border-rose-500/40 px-2 py-0.5 rounded-full font-bold">
                DIRECT SUMMON
              </span>
            </div>

            {/* Divine Cards List */}
            <div className="space-y-4">
              {CARD_TEMPLATES.filter(c => c.tier === 'divine').map((card) => {
                const ownedCount = (profile.collection || []).filter(c => c.baseId === card.baseId).length;
                const isBuyingThis = buyingCardId === card.baseId;

                return (
                  <div
                    key={card.baseId}
                    className="bg-gradient-to-b from-[#1c080d] via-[#14060a] to-black border-2 border-rose-500/50 rounded-2xl p-3.5 shadow-2xl space-y-3 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded font-mono text-[9px] uppercase font-black tracking-wider bg-rose-950 border border-rose-400 text-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.5)]">
                        DIVINE ENTITY
                      </span>
                      {ownedCount > 0 ? (
                        <span className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold">
                          OWNED: {ownedCount}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-[9px] font-mono">UNACQUIRED</span>
                      )}
                    </div>

                    {/* Card Portrait & Stats */}
                    <div className="relative h-44 rounded-xl overflow-hidden border border-rose-400/40 bg-black/60 shadow-inner">
                      <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 pointer-events-none" />

                      {/* Top Badges */}
                      <div className="absolute top-2 left-2 right-2 flex justify-between items-center z-10">
                        {renderManaIcon(getCardManaCost(card), "w-6 h-6")}
                        <div className="bg-black/80 border border-rose-400/40 rounded-lg px-2 py-0.5 text-[9px] font-mono font-bold text-blue-300 backdrop-blur-sm shadow flex items-center gap-1">
                          <span>⏳</span> {card.delay}
                        </div>
                      </div>

                      {/* Bottom ATK/HP */}
                      <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center z-10">
                        <div className="bg-black/85 border border-red-500/60 rounded-lg px-2 py-0.5 text-xs font-mono font-black text-red-400 shadow backdrop-blur-sm">
                          ⚔️ {card.attack}
                        </div>
                        <div className="bg-black/85 border border-emerald-500/60 rounded-lg px-2 py-0.5 text-xs font-mono font-black text-emerald-400 shadow backdrop-blur-sm">
                          ❤️ {card.health}
                        </div>
                      </div>
                    </div>

                    {/* Card Name & Lore */}
                    <div>
                      <h3 className="font-display font-black text-base text-white leading-tight">
                        {card.name}
                      </h3>
                      <p className="text-[11px] text-gray-300 font-sans mt-0.5 leading-snug">
                        {card.description}
                      </p>
                    </div>

                    {/* Skills */}
                    <div className="bg-black/60 border border-white/10 rounded-xl p-2.5 space-y-1.5">
                      <div className="text-[9px] font-mono uppercase font-bold text-rose-400 tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-rose-400" /> DIVINE SKILLS
                      </div>
                      <div className="space-y-1">
                        {card.skills.map((skill, sIdx) => (
                          <div key={sIdx} className="text-[10px] leading-snug">
                            <span className="font-mono font-bold text-rose-300 uppercase mr-1">[{skill.type} {skill.value}]</span>
                            <span className="text-gray-300">{skill.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Summon Button */}
                    <button
                      disabled={isBuyingThis}
                      onClick={() => buyDivineCard(card.baseId)}
                      className="w-full bg-gradient-to-r from-rose-600 via-red-500 to-rose-600 hover:brightness-110 active:scale-95 text-white font-display font-black tracking-widest py-3 px-4 rounded-xl shadow-[0_0_20px_rgba(244,63,94,0.5)] flex items-center justify-center gap-2 text-xs uppercase cursor-pointer disabled:opacity-50 transition-all"
                    >
                      <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain" />
                      <span>{isBuyingThis ? 'INVOKING...' : 'SUMMON FOR 50 SHARDS'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===================== 4. DEMIURGE (RELICS OF THE DEMIURGE SET) ===================== */}
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
              
              {/* Full Bundle Banner */}
              <div className="bg-gradient-to-b from-[#2a0c16] via-[#1a060d] to-black border-2 border-rose-500/60 rounded-2xl p-3.5 shadow-2xl space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span className="font-display font-black text-xs text-amber-300 uppercase tracking-wider">
                      COMPLETE 6-PIECE SET
                    </span>
                  </div>
                  <span className="bg-rose-950 border border-rose-500/60 text-rose-300 text-[9px] font-mono px-2 py-0.5 rounded font-black">
                    {ownedDemiurgeCount}/6 OWNED
                  </span>
                </div>

                <div>
                  <h3 className="font-display font-black text-base text-white">Relics of the Demiurge</h3>
                  <p className="text-[11px] text-gray-300 font-sans mt-0.5 leading-snug">
                    Forge all 6 divine armaments together and unlock supreme transcendence with an exclusive bundle discount.
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-gray-400">
                    <span>Set Completion</span>
                    <span className="text-rose-400 font-bold">{Math.round((ownedDemiurgeCount / 6) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(ownedDemiurgeCount / 6) * 100}%` }}
                    />
                  </div>
                </div>

                <button
                  disabled={isBuyingSet || ownedDemiurgeCount === 6}
                  onClick={buyDivineSet}
                  className={`w-full py-3 px-4 rounded-xl font-display font-black text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-95 ${
                    ownedDemiurgeCount === 6
                      ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 cursor-default opacity-80'
                      : 'bg-gradient-to-r from-amber-600 via-rose-600 to-amber-600 hover:brightness-110 text-white border border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                  }`}
                >
                  <Crown className="w-4 h-4 text-amber-300" />
                  {ownedDemiurgeCount === 6 ? (
                    <span>FULL SET ASSEMBLED (6/6)</span>
                  ) : isBuyingSet ? (
                    <span>FORGING ENTIRE SET...</span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span>BUY ALL 6 PIECES:</span>
                      <span className="line-through text-rose-200/70 text-[10px]">300</span>
                      <span className="text-amber-300 font-mono text-sm font-black flex items-center gap-0.5">
                        <img src="/icons/icon_shards.webp" alt="Shards" className="w-3.5 h-3.5 object-contain inline" />
                        250
                      </span>
                      <span className="bg-amber-400 text-black text-[9px] px-1 py-0.2 rounded font-black tracking-normal ml-0.5">
                        -17%
                      </span>
                    </div>
                  )}
                </button>
              </div>

              {/* 6-Piece Slot Selector Grid */}
              <div className="space-y-2">
                <div className="text-[10px] font-mono text-rose-400 uppercase font-black tracking-wider px-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sword className="w-3 h-3 text-rose-400" /> SELECT PIECE TO INSPECT / FORGE
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {demiurgeItems.map((item) => {
                    const itemOwned = (profile.equipment || []).some(e => e.name === item.name);
                    const isSelected = selectedDemiurgeItemName === item.name;

                    return (
                      <button
                        key={item.name}
                        onClick={() => setSelectedDemiurgeItemName(item.name)}
                        className={`p-2 rounded-xl border transition-all flex flex-col items-center justify-between cursor-pointer relative overflow-hidden ${
                          isSelected
                            ? 'bg-gradient-to-b from-rose-950 via-[#230812] to-black border-rose-400 text-white shadow-[0_0_15px_rgba(244,63,94,0.45)] ring-1 ring-rose-400/50'
                            : itemOwned
                            ? 'bg-gradient-to-b from-[#180a10] to-black border-rose-950/80 text-gray-300'
                            : 'bg-black/60 border-white/10 text-gray-400'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full text-[8px] font-mono uppercase font-bold">
                          <span className="text-rose-400">{item.slot}</span>
                          {itemOwned ? (
                            <span className="text-emerald-400">✓</span>
                          ) : (
                            <span className="text-gray-500">50🔷</span>
                          )}
                        </div>

                        <div className="w-10 h-10 my-1 rounded-lg p-1 flex items-center justify-center relative">
                          <img
                            src={getEquipmentIcon(item.name, item.slot)}
                            alt={item.name}
                            className={`w-full h-full object-contain ${itemOwned ? 'drop-shadow-[0_0_6px_rgba(244,63,94,0.8)]' : 'grayscale opacity-60'}`}
                          />
                        </div>

                        <div className="text-[9.5px] font-display font-black text-white truncate w-full text-center leading-tight">
                          {item.name.replace(' of the Demiurge', '')}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Piece Showcase & Single Forge */}
              <div className="bg-gradient-to-b from-[#1c080d] via-[#14060a] to-black border-2 border-rose-500/50 rounded-2xl p-3.5 shadow-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded font-mono text-[9px] uppercase font-black bg-rose-950 text-rose-300 border border-rose-500/60">
                      {currentItem.slot}
                    </span>
                    <span className="px-2 py-0.5 rounded font-mono text-[9px] uppercase font-black bg-gradient-to-r from-red-950 to-rose-900 text-rose-300 border border-rose-400">
                      DIVINE
                    </span>
                  </div>
                  {isEquipped ? (
                    <span className="bg-cyan-950 border border-cyan-500/50 text-cyan-300 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold">
                      EQUIPPED
                    </span>
                  ) : isOwned ? (
                    <span className="bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold">
                      OWNED
                    </span>
                  ) : (
                    <span className="bg-amber-950 border border-amber-500/40 text-amber-300 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold">
                      NOT ACQUIRED
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-20 h-20 rounded-xl bg-black/70 border border-rose-400/30 flex items-center justify-center p-2 relative shrink-0 shadow-inner">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(244,63,94,0.3),transparent_70%)]" />
                    <img
                      src={getEquipmentIcon(currentItem.name, currentItem.slot)}
                      alt={currentItem.name}
                      className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_12px_rgba(244,63,94,0.8)]"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-black text-sm text-white leading-tight">
                      {currentItem.name}
                    </h3>
                    <p className="text-[10.5px] text-gray-300 font-sans mt-0.5 leading-snug">
                      {currentItem.description}
                    </p>
                    <div className="mt-1.5 text-[10px] font-mono text-amber-300 font-bold">
                      {getItemStatSummary(currentItem)}
                    </div>
                  </div>
                </div>

                <button
                  disabled={isForgingCurrent}
                  onClick={() => buyDivineEquipment(currentItem.name)}
                  className="w-full bg-gradient-to-r from-rose-600 via-red-500 to-rose-600 hover:brightness-110 active:scale-95 text-white font-display font-black tracking-widest py-3 px-4 rounded-xl shadow-[0_0_20px_rgba(244,63,94,0.5)] flex items-center justify-center gap-2 text-xs uppercase cursor-pointer disabled:opacity-50 transition-all"
                >
                  <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain" />
                  <span>{isForgingCurrent ? 'FORGING ARTIFACT...' : `FORGE PIECE (50 SHARDS)`}</span>
                </button>
              </div>

              {/* Demiurge Set Resonance Thresholds */}
              <div className="bg-black/60 border border-rose-500/30 rounded-2xl p-3 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="font-display font-black text-xs text-white uppercase tracking-wider text-shadow-gold">
                    Set Resonance Bonuses
                  </span>
                  <span className="text-rose-300 font-bold">{ownedDemiurgeCount}/6 Pieces</span>
                </div>

                <div className="space-y-2">
                  {DEMIURGE_SET.thresholds.map((threshold, tIdx) => {
                    const isAchieved = ownedDemiurgeCount >= threshold.pieces;
                    return (
                      <div
                        key={tIdx}
                        className={`p-2.5 rounded-xl border transition-all flex flex-col gap-1 ${
                          isAchieved
                            ? 'bg-gradient-to-r from-rose-950/80 to-black border-rose-400/80 text-white shadow-[0_0_10px_rgba(244,63,94,0.25)]'
                            : 'bg-black/40 border-white/10 opacity-70 text-gray-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-mono font-black uppercase px-1.5 py-0.2 rounded ${
                            isAchieved ? 'bg-rose-500/30 text-rose-200' : 'bg-white/5 text-gray-400'
                          }`}>
                            {threshold.pieces} PIECES: {threshold.label}
                          </span>
                          <span className={`text-[8.5px] font-mono font-black px-1.5 py-0.2 rounded-full ${
                            isAchieved ? 'bg-emerald-950 text-emerald-300 border border-emerald-400' : 'text-gray-500'
                          }`}>
                            {isAchieved ? '⚡ ACTIVE' : `🔒 (${ownedDemiurgeCount}/${threshold.pieces})`}
                          </span>
                        </div>

                        {threshold.pieces === 2 && (
                          <div className="text-[10.5px] font-mono text-emerald-300">
                            +30 Max Hero HP • +5% Dodge
                          </div>
                        )}
                        {threshold.pieces === 4 && (
                          <div className="text-[10.5px] font-mono text-amber-300">
                            -1 Turn Delay on all friendly cards
                          </div>
                        )}
                        {threshold.pieces === 6 && (
                          <div className="text-[10.5px] font-mono text-purple-300">
                            +1 Starting Mana • +50 HP • +3 ATK/+8 HP Creatures
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

        {/* ===================== 5. SHIELDS (PVP AEGIS PROTECTION) ===================== */}
        {activeCategory === 'shields' && (
          <div className="space-y-4">
            
            {/* Active Shield Status Banner */}
            <div className={`rounded-2xl border-2 p-3.5 flex items-center justify-between shadow-xl ${
              shieldTimeLeft
                ? 'bg-gradient-to-r from-[#0d2a1b] via-[#071d12] to-black border-emerald-400/80 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                : 'bg-gradient-to-r from-[#240c11] via-[#160609] to-black border-rose-500/50'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center p-1.5 border shrink-0 ${
                  shieldTimeLeft
                    ? 'bg-emerald-950/80 border-emerald-400 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                    : 'bg-rose-950/80 border-rose-500 text-rose-400'
                }`}>
                  {shieldTimeLeft ? (
                    <ShieldCheck className="w-6 h-6 animate-pulse" />
                  ) : (
                    <Shield className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-400">
                    PROTECTION STATUS
                  </div>
                  <div className="font-display font-black text-sm text-white flex items-center gap-1.5">
                    <span className={shieldTimeLeft ? 'text-emerald-300' : 'text-rose-400'}>
                      {shieldTimeLeft ? 'SHIELD ACTIVE' : 'VULNERABLE'}
                    </span>
                    {shieldTimeLeft && (
                      <span className="font-mono text-xs text-emerald-400 font-bold">({shieldTimeLeft})</span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 font-sans leading-tight mt-0.5">
                    {shieldTimeLeft ? 'Immune to PvP Arena attacks and Crowns loss.' : 'Arena duels can be challenged against your defense.'}
                  </p>
                </div>
              </div>
            </div>

            {/* 3 Shield Cards */}
            <div className="space-y-3">
              {[
                {
                  type: '3h' as const,
                  name: '3-Hour Void Aegis',
                  durationLabel: '3 Hours Immunity',
                  cost: 8,
                  image: '/icons/shield_3h.png',
                  tag: 'STANDARD',
                  badge: 'QUICK REST',
                  border: 'border-emerald-500/40 hover:border-emerald-400',
                },
                {
                  type: '6h' as const,
                  name: '6-Hour Astral Aegis',
                  durationLabel: '6 Hours Immunity',
                  cost: 15,
                  image: '/icons/shield_6h.png',
                  tag: 'MOST POPULAR',
                  badge: 'NIGHT DEFENSE',
                  border: 'border-cyan-500/50 hover:border-cyan-400',
                },
                {
                  type: '12h' as const,
                  name: '12-Hour Supreme Aegis',
                  durationLabel: '12 Hours Immunity',
                  cost: 25,
                  image: '/icons/shield_12h.png',
                  tag: 'BEST VALUE (-18%)',
                  badge: 'MAX PROTECTION',
                  border: 'border-purple-500/50 hover:border-purple-400',
                },
              ].map((item) => {
                const owned = profile.shieldsInventory?.[item.type] || 0;
                const canAfford = (profile.darkShards || 0) >= item.cost;
                const isPurchasing = isBuyingShield === item.type;

                return (
                  <div
                    key={item.type}
                    className={`bg-gradient-to-b from-[#131720] via-[#0d1017] to-[#07090d] border-2 ${item.border} rounded-2xl p-3.5 shadow-xl flex items-center justify-between gap-3`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-14 h-14 rounded-xl bg-black/60 border border-white/10 p-1 flex items-center justify-center shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] font-mono font-bold bg-white/10 px-1.5 py-0.2 rounded text-amber-300 uppercase">
                            {item.tag}
                          </span>
                          <span className="text-[9px] font-mono text-gray-400 font-bold">
                            Vault: {owned}
                          </span>
                        </div>
                        <h4 className="font-display font-black text-xs sm:text-sm text-white truncate mt-0.5">
                          {item.name}
                        </h4>
                        <div className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold">
                          <Clock className="w-3 h-3 text-emerald-400" />
                          <span>{item.durationLabel}</span>
                        </div>
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
                      className={`shrink-0 py-2 px-3 rounded-xl font-display font-black text-xs tracking-wider uppercase flex items-center gap-1.5 transition-all cursor-pointer select-none active:scale-95 shadow-md ${
                        isPurchasing
                          ? 'bg-gray-700 text-gray-400 cursor-wait'
                          : canAfford
                          ? 'bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 hover:brightness-110 text-white'
                          : 'bg-purple-950/60 border border-purple-500/40 text-purple-300'
                      }`}
                    >
                      {isPurchasing ? (
                        <span>...</span>
                      ) : (
                        <>
                          <img src="/icons/icon_shards.webp" alt="Shards" className="w-3.5 h-3.5 object-contain" />
                          <span>{item.cost}</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Daily Subscription info banner */}
            <div className="bg-gradient-to-r from-amber-950/30 to-purple-950/30 border border-amber-500/25 rounded-2xl p-3 flex items-start gap-2.5 text-xs">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-display font-bold text-amber-300 block uppercase tracking-wider text-[10.5px]">
                  FREE DAILY SUBSCRIPTION SHIELDS
                </span>
                <p className="text-gray-300 text-[10.5px] font-sans leading-relaxed mt-0.5">
                  Lords with active passes collect free shields every day in Pass Tributes:
                  <span className="text-amber-200 font-bold ml-1">1x 3h Shield (Premium)</span> or
                  <span className="text-amber-300 font-bold ml-1">1x 6h Shield (Ultra)</span>.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* ===================== 6. LEVEL BOOST (INSTANT ASCENSION) ===================== */}
        {activeCategory === 'level_boost' && (
          <div className="space-y-4">
            
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
                <h2 className="font-display font-black text-sm tracking-widest text-amber-200 uppercase">
                  INSTANT ASCENSION
                </h2>
              </div>
              <div className="flex items-center gap-1 bg-black/60 border border-amber-500/40 px-2 py-0.5 rounded-full text-[10px] font-mono text-amber-300 font-bold">
                <span>LVL</span>
                <span>{profile.level || 1}</span>
              </div>
            </div>

            {/* 2 Boost Cards */}
            <div className="space-y-4">
              
              {/* Level 50 Card */}
              {(() => {
                const currentLvl = profile.level || 1;
                const isAlreadyReached = currentLvl >= 50;
                const cost = 250;
                const canAfford = (profile.darkShards || 0) >= cost;
                const isProcessing = isBuyingLevelBoost === 50;

                return (
                  <div className={`rounded-2xl border-2 p-3.5 space-y-3 relative overflow-hidden transition-all ${
                    isAlreadyReached
                      ? 'bg-[#0d0f14]/80 border-white/10 opacity-70'
                      : 'bg-gradient-to-b from-[#1c1208] via-[#120b05] to-[#0a0603] border-amber-500/60 shadow-xl'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        ASCENDANT CHAMPION
                      </span>
                      <span className="bg-amber-950/80 border border-amber-500/40 px-2 py-0.2 rounded text-[8px] font-mono text-amber-300 font-bold">
                        STAGE I
                      </span>
                    </div>

                    <div className="flex items-center gap-3.5">
                      <div className="w-20 h-20 rounded-xl bg-gradient-to-b from-amber-500/20 to-black border border-amber-400/60 p-1 flex items-center justify-center shrink-0">
                        <img src="/shop/level_50_sigil.png" alt="Level 50 Sigil" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-black text-base text-white uppercase">Instant Level 50</h3>
                        <p className="text-[11px] text-gray-300 font-sans mt-0.5 leading-snug">
                          Skip early progression and surge directly into mid-game power.
                        </p>
                      </div>
                    </div>

                    <div className="bg-black/60 border border-white/10 rounded-xl p-2.5 text-[11px] font-mono space-y-1">
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
                        ✓ ALREADY LEVEL 50+
                      </div>
                    ) : (
                      <button
                        disabled={isProcessing}
                        onClick={() => handleBuyLevelBoost(50)}
                        className={`w-full py-3 px-4 rounded-xl font-display font-black text-xs tracking-widest uppercase flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-lg ${
                          isProcessing
                            ? 'bg-gray-700 text-gray-400 cursor-wait'
                            : canAfford
                            ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:brightness-110 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                            : 'bg-gradient-to-r from-amber-950/80 to-black border border-amber-500/40 text-amber-300'
                        }`}
                      >
                        {isProcessing ? (
                          <span>ASCENDING...</span>
                        ) : (
                          <>
                            <span>ASCEND TO LEVEL 50 FOR</span>
                            <div className="flex items-center gap-1 font-mono font-black text-sm">
                              <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain" />
                              <span>{cost}</span>
                            </div>
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
                  <div className={`rounded-2xl border-2 p-3.5 space-y-3 relative overflow-hidden transition-all ${
                    isMaxLevel
                      ? 'bg-[#0d0f14]/80 border-white/10 opacity-70'
                      : 'bg-gradient-to-b from-[#240b15] via-[#15070d] to-[#0b0307] border-rose-500/60 shadow-xl'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                        SUPREME GODHOOD
                      </span>
                      <span className="bg-rose-950/80 border border-rose-500/40 px-2 py-0.2 rounded text-[8px] font-mono text-rose-300 font-bold">
                        MAXIMUM APEX
                      </span>
                    </div>

                    <div className="flex items-center gap-3.5">
                      <div className="w-20 h-20 rounded-xl bg-gradient-to-b from-rose-900/40 via-purple-950/60 to-black border border-rose-400/80 p-1 flex items-center justify-center shrink-0">
                        <img src="/shop/level_100_sigil.png" alt="Level 100 Sigil" className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(244,63,94,0.85)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-black text-base text-white uppercase">Instant Level 100</h3>
                        <p className="text-[11px] text-gray-300 font-sans mt-0.5 leading-snug">
                          Attain maximum power and total mastery over the Abyss from day one.
                        </p>
                      </div>
                    </div>

                    <div className="bg-black/60 border border-white/10 rounded-xl p-2.5 text-[11px] font-mono space-y-1">
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
                        ✓ MAX LEVEL REACHED (100)
                      </div>
                    ) : (
                      <button
                        disabled={isProcessing}
                        onClick={() => handleBuyLevelBoost(100)}
                        className={`w-full py-3 px-4 rounded-xl font-display font-black text-xs tracking-widest uppercase flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-lg ${
                          isProcessing
                            ? 'bg-gray-700 text-gray-400 cursor-wait'
                            : canAfford
                            ? 'bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 hover:brightness-110 text-white shadow-[0_0_18px_rgba(244,63,94,0.5)]'
                            : 'bg-gradient-to-r from-rose-950/80 to-black border border-rose-500/40 text-rose-300'
                        }`}
                      >
                        {isProcessing ? (
                          <span>ASCENDING...</span>
                        ) : (
                          <>
                            <span>ASCEND TO LEVEL 100 FOR</span>
                            <div className="flex items-center gap-1 font-mono font-black text-sm">
                              <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain" />
                              <span>{cost}</span>
                            </div>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })()}

            </div>

            {/* Sanctum Notice */}
            <div className="bg-black/60 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse mt-1 shrink-0" />
              <p className="font-mono text-[11px] text-gray-300 leading-normal">
                <span className="text-amber-400 font-bold uppercase tracking-wider mr-1">SANCTUM NOTICE:</span>
                After ascending, visit the <strong>LORD</strong> tab to allocate your unassigned skill points across combat stances.
              </p>
            </div>

          </div>
        )}

      </div>

      {/* 3. REWARD REVEAL ANIMATION MODAL */}
      {openingPack && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto">
          <div className="max-w-md w-full text-center space-y-6 my-auto">
            
            {!isRevealed ? (
              /* Phase 1: Portal / Summoning buildup */
              <div className="space-y-4 py-8">
                <div className="w-28 h-28 mx-auto rounded-full bg-black border border-[#c5a880]/30 flex items-center justify-center relative shadow-2xl animate-bounce">
                  <div className="absolute inset-0 rounded-full border-t-2 border-b-2 border-t-[#66fcf1] border-b-[#dd2c40] animate-spin" />
                  <Sparkles className="w-10 h-10 text-[#ebd09b] animate-pulse" />
                </div>
                <h3 className="font-display font-black text-lg text-white tracking-widest uppercase animate-pulse">
                  SUMMONING ENTITIES FROM ALTAR...
                </h3>
                <p className="text-xs text-gray-500 font-mono">Dark forces intertwine the edges of worlds...</p>
              </div>
            ) : (
              /* Phase 2: Revealed Cards / Equipment */
              <div className="space-y-6 py-4">
                <div className="space-y-1">
                  <h3 className="font-display font-black text-2xl text-[#ebd09b] tracking-widest text-shadow-gold uppercase">
                    {revealedCards.length > 0 ? 'ENTITIES SUMMONED!' : 'RELICS DISCOVERED!'}
                  </h3>
                  <p className="text-xs text-gray-400 font-sans">
                    {revealedCards.length > 0 ? 'These dark forces have joined your collection.' : 'The abyss grants you this power.'}
                  </p>
                </div>

                {/* Cards Grid */}
                {revealedCards.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-3">
                    {revealedCards.map((card, idx) => {
                      const skill = card.skills[0];
                      return (
                        <motion.div
                          key={card.id || idx}
                          initial={{ opacity: 0, y: 30, scale: 0.8 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.5, delay: idx * 0.2 }}
                        >
                          <div
                            className={`w-36 sm:w-40 aspect-[3/4.2] rounded-2xl p-2.5 flex flex-col justify-between relative shadow-2xl overflow-hidden border ${getCardTierStyles(card.tier, false, true)}`}
                          >
                            <img
                              src={getCardImageUrl(card)}
                              alt={card.name}
                              className="absolute inset-0 w-full h-full object-cover z-0 opacity-90"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10 z-0 pointer-events-none" />

                            <div className="relative z-10 flex justify-between items-start">
                              <div className="text-center bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded border border-[#c5a880]/30 shadow-md">
                                <span className="text-[8px] text-[#ebd09b] uppercase font-mono font-bold tracking-wider">{card.tier}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                {renderManaIcon(getCardManaCost(card), "w-5 h-5")}
                                <div className="bg-black/80 border border-[#c5a880]/50 rounded-full w-5 h-5 flex items-center justify-center text-[9px] font-mono font-black text-[#ebd09b] shadow">
                                  L{card.level}
                                </div>
                              </div>
                            </div>

                            <div className="relative z-10 space-y-1 mt-auto">
                              <span className="text-xs font-display font-black text-white block truncate leading-none text-shadow-gold">
                                {card.name}
                              </span>

                              {skill && (
                                <div className="bg-black/70 backdrop-blur-sm border border-gray-900/50 p-1 rounded text-[8px] text-gray-300 text-center leading-tight">
                                  <span className="font-semibold block text-[#c5a880] uppercase text-[7.5px]">{skill.type}</span>
                                  <span className="line-clamp-1">{skill.description}</span>
                                </div>
                              )}

                              <div className="flex justify-between items-center text-[9px] font-mono font-bold pt-1 border-t border-gray-800/80 bg-black/50 backdrop-blur-sm rounded px-1 py-0.5">
                                <span className="text-red-400">⚔️ {card.attack}</span>
                                <span className="text-emerald-400">❤️ {card.health}</span>
                                <span className="text-blue-400">⏳ {card.delay}</span>
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
                  <div className="flex flex-wrap justify-center gap-3">
                    {revealedEquipment.map((eq, idx) => (
                      <motion.div
                        key={eq.id || idx}
                        initial={{ opacity: 0, y: 30, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: idx * 0.2 }}
                        className={`relative w-36 sm:w-40 h-52 rounded-2xl flex flex-col items-center justify-between border-2 shadow-2xl overflow-hidden p-3 ${
                          eq.tier === 'divine' ? 'bg-gradient-to-br from-rose-950 via-[#26050d] to-black border-rose-500' :
                          eq.tier === 'legendary' ? 'bg-gradient-to-br from-purple-950 via-[#180424] to-black border-purple-500' :
                          eq.tier === 'gold' ? 'bg-gradient-to-br from-yellow-950 via-[#1f1404] to-black border-yellow-500' :
                          eq.tier === 'silver' ? 'bg-gradient-to-br from-slate-900 via-[#101720] to-black border-slate-400' :
                          'bg-gradient-to-br from-stone-900 via-[#191410] to-black border-amber-700/60'
                        }`}
                      >
                        <div className="w-full flex items-center justify-between z-10">
                          <span className="text-[9px] font-mono uppercase text-gray-400">{eq.slot}</span>
                          <span className="px-1.5 py-0.2 rounded bg-black/80 text-[8px] font-display font-black tracking-widest uppercase border border-white/20 text-white">
                            {eq.tier}
                          </span>
                        </div>

                        <div className="w-16 h-16 rounded-xl bg-black/60 border border-white/15 flex items-center justify-center p-1.5 my-auto shadow-inner">
                          <img
                            src={getEquipmentIcon(eq)}
                            alt={eq.name}
                            className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]"
                          />
                        </div>

                        <div className="w-full text-center space-y-1 z-10">
                          <h4 className="font-display font-bold text-center text-xs text-white truncate leading-tight">{eq.name}</h4>
                          <div className="bg-black/60 w-full py-1 rounded-lg text-center text-[10px] font-mono border border-white/10 text-emerald-400 font-bold">
                            +{eq.bonusValue} {eq.bonusType}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                <div className="pt-4">
                  <button
                    onClick={closeReveal}
                    className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-95 text-black font-display font-black tracking-widest py-3 px-8 rounded-xl shadow-lg text-xs cursor-pointer uppercase transition-all"
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
