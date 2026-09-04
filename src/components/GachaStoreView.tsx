import React, { useState, useEffect, useRef } from 'react';
import { getCardTierStyles } from '../utils/tierStyles';
import { motion, AnimatePresence } from 'motion/react';
import { audioSystem } from '../utils/AudioSystem';
import { useGame } from '../context/GameContext';
import { useToast } from './Toast';
import { CARD_TEMPLATES, getCardManaCost } from '../data/cards';
import { Card, Equipment } from '../types';
import { getEquipmentIcon, EQUIPMENT_TEMPLATES, DEMIURGE_SET } from '../data/equipment';
import { 
  Sparkles, 
  Box, 
  Shield, 
  Flame, 
  Skull, 
  Sword, 
  Store, 
  Crown, 
  Zap, 
  Plus, 
  ArrowRight, 
  Check, 
  Lock, 
  ChevronRight,
  Info,
  Layers,
  Sparkle
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

interface GachaStoreViewProps {
  initialTab?: 'cards' | 'equipment' | 'divine';
}

export const GachaStoreView: React.FC<GachaStoreViewProps> = ({ initialTab = 'cards' }) => {
  const { profile, setProfile, setIsShardsShopOpen } = useGame();
  const toast = useToast();
  
  const [activeTab, setActiveTab] = useState<'cards' | 'equipment' | 'divine'>(initialTab);
  const [divineFilter, setDivineFilter] = useState<'all' | 'cards' | 'equipment'>('all');

  const entitiesRef = useRef<HTMLDivElement>(null);
  const relicsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [buyingCardId, setBuyingCardId] = useState<string | null>(null);
  const [buyingEquipName, setBuyingEquipName] = useState<string | null>(null);
  
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

  // Demiurge equipment items calculation
  const demiurgeItems = EQUIPMENT_TEMPLATES.filter(e => e.setId === 'demiurge');
  const ownedDemiurgeCount = demiurgeItems.filter(t => (profile.equipment || []).some(e => e.name === t.name)).length;

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (activeTab !== 'divine') {
      setActiveTab('divine');
      setTimeout(() => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      
      {/* 1. TOP HEADER & CURRENCY BAR (Genshin Style) */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-r from-black/80 via-[#140810]/90 to-black/80 border border-amber-500/20 rounded-2xl px-6 py-4 backdrop-blur-md shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 via-rose-500/20 to-black border border-amber-400/30 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Store className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400/90 uppercase">
                CELESTIAL ARCHIVES
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            </div>
            <h1 className="font-display font-black text-2xl md:text-3xl text-white tracking-widest text-shadow-gold leading-none">
              VOID EMPORIUM
            </h1>
          </div>
        </div>

        {/* Currency Badges */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-end flex-wrap">
          {/* Gold Balance */}
          <div className="flex items-center gap-2.5 bg-black/60 border border-amber-500/30 hover:border-amber-400/60 transition-colors px-3.5 py-1.5 rounded-xl shadow-inner">
            <img 
              src="/icons/icon_gold.webp" 
              alt="Gold" 
              className="w-7 h-7 object-contain drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] brightness-110" 
            />
            <div className="text-left leading-tight">
              <span className="text-[9px] text-gray-400 font-mono block uppercase">Gold</span>
              <span className="font-display font-black text-sm text-[#ebd09b]">
                {(profile.gold || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Dark Shards Balance with Quick Top-Up */}
          <div className="flex items-center gap-2 bg-black/60 border border-cyan-500/40 hover:border-cyan-400/80 transition-colors pl-3.5 pr-1.5 py-1.5 rounded-xl shadow-inner group">
            <img 
              src="/icons/icon_shards.webp" 
              alt="Dark Shards" 
              className="w-7 h-7 object-contain drop-shadow-[0_0_8px_rgba(102,252,241,0.6)] group-hover:rotate-12 transition-transform duration-300" 
            />
            <div className="text-left leading-tight pr-2">
              <span className="text-[9px] text-gray-400 font-mono block uppercase">Shards</span>
              <span className="font-display font-black text-sm text-[#66fcf1]">
                {(profile.darkShards || 0).toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => {
                audioSystem.playClick();
                setIsShardsShopOpen(true);
              }}
              title="Get Dark Shards"
              className="w-7 h-7 rounded-lg bg-cyan-950/80 hover:bg-cyan-800 text-cyan-300 border border-cyan-400/50 flex items-center justify-center transition-all shadow-[0_0_10px_rgba(6,182,212,0.4)] cursor-pointer active:scale-90"
            >
              <Plus className="w-4 h-4 font-bold" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. FEATURED HERO SHOWCASE BANNER (Genshin Wish Banner Style) */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/40 bg-gradient-to-r from-[#18070d] via-[#100511] to-[#080208] shadow-[0_0_40px_rgba(244,63,94,0.2)]">
        {/* Background Ambient Glows & Cosmic Rings */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(244,63,94,0.15),transparent_70%)] pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Banner Left Info */}
          <div className="space-y-4 max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-950/80 via-red-950/80 to-black border border-rose-400/50 px-3.5 py-1 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.4)]">
              <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span className="font-mono text-[10px] font-black tracking-widest text-rose-300 uppercase">
                FEATURED SHOWCASE • DEMIURGE ASCENSION
              </span>
            </div>

            <div className="space-y-1.5">
              <h2 className="font-display font-black text-3xl sm:text-4xl text-white tracking-widest text-shadow-gold">
                ALTAR OF THE DEMIURGE
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 font-sans leading-relaxed">
                Invoke cosmic architects beyond mortal comprehension. Assemble the sacred 6-piece Demiurge Relic set to unlock devastating set synergies and passive delay reduction.
              </p>
            </div>

            {/* Set Synergy Quick Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1">
              <span className="bg-black/60 border border-rose-500/30 text-rose-300 text-[10px] font-mono px-2.5 py-1 rounded-lg">
                <span className="text-amber-400 font-bold">2-Pc:</span> +200 Max HP
              </span>
              <span className="bg-black/60 border border-rose-500/30 text-rose-300 text-[10px] font-mono px-2.5 py-1 rounded-lg">
                <span className="text-amber-400 font-bold">4-Pc:</span> +15% Dodge
              </span>
              <span className="bg-gradient-to-r from-rose-950 to-amber-950 border border-rose-400/60 text-amber-300 text-[10px] font-mono font-bold px-3 py-1 rounded-lg shadow-[0_0_12px_rgba(245,158,11,0.3)]">
                <span className="text-rose-400 font-black">6-Pc:</span> -1 Deck Delay!
              </span>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="flex items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={() => {
                  audioSystem.playClick();
                  scrollToSection(entitiesRef);
                }}
                className="bg-gradient-to-r from-rose-600 via-red-600 to-rose-600 hover:from-rose-500 hover:to-red-500 text-white font-display font-black text-xs tracking-widest px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(244,63,94,0.5)] flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <Crown className="w-4 h-4" />
                <span>INVOKE CELESTIALS</span>
              </button>

              <button
                onClick={() => {
                  audioSystem.playClick();
                  scrollToSection(relicsRef);
                }}
                className="bg-black/60 hover:bg-black/90 text-amber-300 border border-amber-500/40 hover:border-amber-400 font-display font-black text-xs tracking-widest px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer active:scale-95 transition-all shadow"
              >
                <Shield className="w-4 h-4 text-amber-400" />
                <span>FORGE RELICS ({ownedDemiurgeCount}/6)</span>
              </button>
            </div>
          </div>

          {/* Banner Right Visual Artwork Showcase */}
          <div className="relative shrink-0 flex items-center justify-center">
            {/* Ambient Backing Aura */}
            <div className="w-64 sm:w-72 aspect-[3/4] relative flex items-center justify-center">
              
              {/* Secondary Relics Floating Badges */}
              <motion.div 
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -left-6 top-8 z-20 bg-black/80 border border-rose-500/60 rounded-2xl p-2 shadow-2xl backdrop-blur-md flex items-center gap-2"
              >
                <img 
                  src="/icons/equipment/items/blade_of_the_demiurge.png" 
                  alt="Blade" 
                  className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]" 
                />
                <div className="text-left pr-2">
                  <div className="text-[8px] font-mono text-gray-400 uppercase">Divine Weapon</div>
                  <div className="text-[10px] font-display font-black text-rose-300">Blade of Demiurge</div>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute -right-4 bottom-8 z-20 bg-black/80 border border-amber-500/60 rounded-2xl p-2 shadow-2xl backdrop-blur-md flex items-center gap-2"
              >
                <img 
                  src="/icons/equipment/items/crown_of_the_demiurge.png" 
                  alt="Crown" 
                  className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" 
                />
                <div className="text-left pr-2">
                  <div className="text-[8px] font-mono text-gray-400 uppercase">Divine Diadem</div>
                  <div className="text-[10px] font-display font-black text-amber-300">Crown of Demiurge</div>
                </div>
              </motion.div>

              {/* Central Card Portrait */}
              <div className="w-52 sm:w-56 aspect-[3/4.2] rounded-2xl overflow-hidden border-2 border-rose-400/80 shadow-[0_0_30px_rgba(244,63,94,0.5)] relative group cursor-pointer"
                onClick={() => scrollToSection(entitiesRef)}
              >
                <img 
                  src="/cards/aurelius_the_demiurge.webp" 
                  alt="Aurelius The Demiurge" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
                <div className="absolute top-2.5 left-2.5 bg-black/80 border border-rose-400/60 px-2 py-0.5 rounded text-[8px] font-mono font-black text-rose-300 tracking-wider">
                  DIVINE LORD
                </div>
                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-center">
                  <span className="font-display font-black text-xs text-white block text-shadow-gold">
                    Aurelius, The Demiurge
                  </span>
                  <span className="text-[9px] font-mono text-rose-400">Exclusive 50 Shards</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* 3. CATEGORY SHOWCASE NAVIGATION BAR (Genshin Emporium Tabs) */}
      <div className="sticky top-2 z-30 flex justify-center">
        <div className="bg-black/90 border border-white/15 backdrop-blur-xl p-1.5 rounded-2xl flex items-center gap-2 shadow-2xl flex-wrap justify-center">
          
          {/* Tab 1: Divine Altar */}
          <button 
            onMouseEnter={() => audioSystem.playHover()} 
            onClick={() => { audioSystem.playClick(); setActiveTab('divine'); }}
            className={`px-5 py-2.5 font-display font-black text-xs tracking-widest transition-all rounded-xl border flex items-center gap-2 cursor-pointer relative ${
              activeTab === 'divine' 
                ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white border-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.7)]' 
                : 'bg-black/40 text-rose-300 border-rose-900/40 hover:border-rose-400/70 hover:bg-rose-950/20'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${activeTab === 'divine' ? 'text-white animate-spin' : 'text-rose-400 animate-pulse'}`} />
            <span>DIVINE ALTAR</span>
            <span className="bg-amber-400 text-black text-[8px] font-mono px-1.5 py-0.5 rounded-full uppercase font-black tracking-wider">
              EXCLUSIVE
            </span>
          </button>

          {/* Tab 2: Card Boosters */}
          <button 
            onMouseEnter={() => audioSystem.playHover()} 
            onClick={() => { audioSystem.playClick(); setActiveTab('cards'); }}
            className={`px-5 py-2.5 font-display font-black text-xs tracking-widest transition-all rounded-xl border flex items-center gap-2 cursor-pointer ${
              activeTab === 'cards' 
                ? 'bg-[#c5a880] text-black border-[#ebd09b] shadow-[0_0_18px_rgba(235,208,155,0.5)]' 
                : 'bg-black/40 text-gray-400 border-gray-800 hover:text-[#ebd09b] hover:border-gray-700 hover:bg-white/5'
            }`}
          >
            <Box className="w-4 h-4" />
            <span>CARD BOOSTERS</span>
          </button>

          {/* Tab 3: Relic Chests */}
          <button 
            onMouseEnter={() => audioSystem.playHover()} 
            onClick={() => { audioSystem.playClick(); setActiveTab('equipment'); }}
            className={`px-5 py-2.5 font-display font-black text-xs tracking-widest transition-all rounded-xl border flex items-center gap-2 cursor-pointer ${
              activeTab === 'equipment' 
                ? 'bg-purple-900 text-white border-purple-400 shadow-[0_0_18px_rgba(168,85,247,0.5)]' 
                : 'bg-black/40 text-gray-400 border-gray-800 hover:text-purple-400 hover:border-gray-700 hover:bg-white/5'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>RELIC CHESTS</span>
          </button>

          {/* Tab 4: Top Up Shards */}
          <button
            onMouseEnter={() => audioSystem.playHover()}
            onClick={() => {
              audioSystem.playClick();
              setIsShardsShopOpen(true);
            }}
            className="px-4 py-2.5 font-display font-black text-xs tracking-widest transition-all rounded-xl border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/60 hover:border-cyan-400 flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.25)]"
          >
            <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain" />
            <span>GET SHARDS</span>
          </button>

        </div>
      </div>

      {/* 4. TAB CONTENT: DIVINE ALTAR (Cards & Demiurge Relic Set) */}
      {activeTab === 'divine' && (
        <div className="space-y-12 animate-fadeIn">
          
          {/* Sub-filter bar */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => { audioSystem.playClick(); setDivineFilter('all'); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider transition-all cursor-pointer ${
                divineFilter === 'all'
                  ? 'bg-rose-500/30 text-rose-300 border border-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                  : 'bg-black/40 text-gray-400 border border-white/10 hover:text-white'
              }`}
            >
              ALL EXCLUSIVES
            </button>
            <button
              onClick={() => { audioSystem.playClick(); setDivineFilter('cards'); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider transition-all cursor-pointer ${
                divineFilter === 'cards'
                  ? 'bg-rose-500/30 text-rose-300 border border-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                  : 'bg-black/40 text-gray-400 border border-white/10 hover:text-white'
              }`}
            >
              CELESTIAL BEINGS (3)
            </button>
            <button
              onClick={() => { audioSystem.playClick(); setDivineFilter('equipment'); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider transition-all cursor-pointer ${
                divineFilter === 'equipment'
                  ? 'bg-rose-500/30 text-rose-300 border border-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                  : 'bg-black/40 text-gray-400 border border-white/10 hover:text-white'
              }`}
            >
              DEMIURGE RELICS (6)
            </button>
          </div>

          {/* Section 4A: Celestial Beings Cards */}
          {(divineFilter === 'all' || divineFilter === 'cards') && (
            <div ref={entitiesRef} className="space-y-6 scroll-mt-24">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-rose-950/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-400">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-xl md:text-2xl text-white tracking-widest text-shadow-gold">
                      PRIMORDIAL CELESTIAL BEINGS
                    </h3>
                    <p className="text-xs text-gray-400 font-sans">
                      Divine beings cannot be ascended through evolution or acquired from standard card packs.
                    </p>
                  </div>
                </div>

                <div className="bg-black/60 border border-rose-500/30 rounded-xl px-3.5 py-1 text-xs font-mono text-rose-300">
                  Fixed Price: <span className="font-bold text-amber-400">50 Dark Shards</span> each
                </div>
              </div>

              {/* 3 Divine Cards Showcase Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {CARD_TEMPLATES.filter(c => c.tier === 'divine').map((card) => {
                  const ownedCount = (profile.collection || []).filter(c => c.baseId === card.baseId).length;
                  const isBuyingThis = buyingCardId === card.baseId;

                  return (
                    <div 
                      key={card.baseId} 
                      className="bg-gradient-to-b from-[#1c080d] via-[#14060a] to-black border-2 border-rose-500/40 hover:border-rose-400/90 rounded-3xl p-5 flex flex-col justify-between shadow-2xl hover:shadow-[0_0_35px_rgba(244,63,94,0.35)] transition-all duration-300 group relative overflow-hidden"
                    >
                      {/* Ambient Glow */}
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
            </div>
          )}

          {/* Section 4B: Relics of the Demiurge Showcase */}
          {(divineFilter === 'all' || divineFilter === 'equipment') && (
            <div ref={relicsRef} className="space-y-8 scroll-mt-24">
              
              {/* Set Resonance Monolith Tracker (Genshin Style) */}
              <div className="bg-gradient-to-r from-[#20080f] via-[#14050a] to-[#20080f] border-2 border-rose-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="bg-rose-500 text-white font-mono text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.7)]">
                        DIVINE ARTIFACT SET
                      </span>
                      <span className="text-gray-400 font-mono text-xs">
                        • 6 SACRED PIECES
                      </span>
                    </div>
                    <h3 className="font-display font-black text-2xl md:text-3xl text-white tracking-wider flex items-center gap-2.5">
                      <Shield className="w-6 h-6 text-rose-400 shrink-0" />
                      <span>RELICS OF THE DEMIURGE</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-300 font-sans leading-relaxed">
                      Forge individual pieces to awaken the Demiurge set resonance. Equipping pieces bestows unmatched Lord durability and passive combat supremacy.
                    </p>
                  </div>

                  {/* Equipped / Owned Counter Widget */}
                  <div className="bg-black/80 border border-rose-500/40 rounded-2xl px-6 py-4 text-center shrink-0 shadow-xl backdrop-blur-md">
                    <span className="text-[10px] font-mono uppercase font-bold text-gray-400 block tracking-wider">Set Assembly</span>
                    <div className="font-display font-black text-3xl text-rose-400">
                      {ownedDemiurgeCount} <span className="text-gray-500 text-lg">/ 6</span>
                    </div>
                    <div className="w-full bg-gray-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${(ownedDemiurgeCount / 6) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* 6 Miniature Slot Hex Visualizer */}
                <div className="mt-6 pt-5 border-t border-rose-500/20 relative z-10">
                  <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-3">
                    ARTIFACT CONSTELLATION STATUS:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {demiurgeItems.map((item) => {
                      const isOwned = (profile.equipment || []).some(e => e.name === item.name);
                      const isEquipped = Object.values(profile.equipped || {}).some(id => {
                        const eq = (profile.equipment || []).find(e => e.id === id);
                        return eq?.name === item.name;
                      });

                      return (
                        <div 
                          key={item.name}
                          className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                            isEquipped
                              ? 'bg-cyan-950/40 border-cyan-400/80 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                              : isOwned
                              ? 'bg-rose-950/40 border-rose-400/60 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                              : 'bg-black/50 border-white/10 opacity-60'
                          }`}
                        >
                          <img 
                            src={getEquipmentIcon(item.name, item.slot)} 
                            alt={item.name} 
                            className="w-8 h-8 object-contain shrink-0" 
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-[9px] font-mono text-gray-400 block uppercase truncate">{item.slot}</span>
                            <span className={`text-[10px] font-display font-bold block truncate ${isEquipped ? 'text-cyan-300' : isOwned ? 'text-rose-300' : 'text-gray-400'}`}>
                              {item.name.replace(' of the Demiurge', '')}
                            </span>
                          </div>
                          {isEquipped ? (
                            <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 shadow-[0_0_6px_rgba(6,182,212,0.8)]" title="Equipped" />
                          ) : isOwned ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" title="Owned" />
                          ) : (
                            <Lock className="w-3 h-3 text-gray-600 shrink-0" title="Unforged" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Set Bonus Milestones */}
                <div className="mt-5 pt-4 border-t border-rose-500/20 grid grid-cols-1 md:grid-cols-3 gap-3 relative z-10">
                  {DEMIURGE_SET.thresholds.map((threshold, tIdx) => {
                    const isAchieved = ownedDemiurgeCount >= threshold.pieces;
                    return (
                      <div 
                        key={tIdx}
                        className={`rounded-xl p-3 border transition-all ${
                          isAchieved
                            ? 'bg-gradient-to-r from-rose-950/90 to-red-950/70 border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                            : 'bg-black/50 border-white/10 opacity-70'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className={`text-[10px] font-mono font-black uppercase tracking-wider ${isAchieved ? 'text-rose-300' : 'text-gray-400'}`}>
                            [{threshold.pieces} PIECES] {threshold.label}
                          </span>
                          {isAchieved ? (
                            <span className="text-[9px] font-mono font-black text-rose-400 bg-rose-950/80 border border-rose-500/50 px-1.5 py-0.5 rounded shadow">
                              ACTIVE
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono text-gray-500">
                              LOCKED
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-300 font-sans leading-snug">
                          {threshold.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 6 Equipment Pieces Showcase Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      className="bg-gradient-to-b from-[#1c080d] via-[#14060a] to-black border-2 border-rose-500/40 hover:border-rose-400/90 rounded-3xl p-5 flex flex-col justify-between shadow-2xl hover:shadow-[0_0_35px_rgba(244,63,94,0.35)] transition-all duration-300 group relative overflow-hidden"
                    >
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
                            <span className="text-gray-400">Primary Stat:</span>
                            <span className="text-rose-300 font-black">
                              {item.bonusType === 'delayReduction' ? `-${item.bonusValue} Delay` :
                               item.bonusType === 'dodge' ? `+${item.bonusValue}% Dodge` :
                               item.bonusType === 'goldBonus' ? `+${item.bonusValue}% Gold` :
                               `+${item.bonusValue} Max HP`}
                            </span>
                          </div>
                          {item.secondaryBonusType && (
                            <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-white/5">
                              <span className="text-gray-400">Secondary Stat:</span>
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
          )}

        </div>
      )}

      {/* 5. TAB CONTENT: CARD BOOSTERS (Packs Grid) */}
      {activeTab === 'cards' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="text-center space-y-1">
            <h3 className="font-display font-black text-2xl text-white tracking-widest text-shadow-gold uppercase">
              ABYSSAL BOOSTER ARCHIVES
            </h3>
            <p className="text-xs text-gray-400 font-sans max-w-lg mx-auto">
              Tear open forbidden booster seals to summon new creatures and acquire duplicates for creature fusion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            
            {/* Bronze Pack */}
            <div className="bg-[#151a21] border border-amber-900/40 rounded-3xl p-5 flex flex-col justify-between hover:-translate-y-1 transition-all shadow-xl hover:shadow-[0_0_25px_rgba(197,168,128,0.2)]">
              <div className="space-y-4">
                <div className="h-48 rounded-2xl bg-gradient-to-b from-amber-950/30 to-black/60 border border-amber-900/20 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(197,168,128,0.15),transparent_70%)]" />
                  <img 
                    src="/packs/pack_bronze.webp" 
                    alt="Bronze Pack" 
                    decoding="async" 
                    className="w-36 h-36 object-contain hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_20px_rgba(197,168,128,0.4)]" 
                  />
                  <span className="font-display font-black text-sm text-amber-500 mt-2 tracking-widest uppercase">
                    BRONZE PACK
                  </span>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-display font-bold text-base text-white">Bronze Booster</h4>
                  <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                    Great way to collect basic duplicates for fusion. Contains 3 random cards.
                  </p>
                  <div className="bg-black/50 border border-amber-900/20 rounded-xl p-2.5 text-[10px] font-mono text-gray-400 space-y-1">
                    <div className="flex justify-between">
                      <span>• Common (Bronze):</span>
                      <span className="text-amber-400 font-bold">95%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Rare (Silver):</span>
                      <span className="text-gray-300 font-bold">5%</span>
                    </div>
                    <div className="flex justify-between border-t border-white/5 pt-1 text-gray-400">
                      <span>• Guaranteed:</span>
                      <span className="text-white font-bold">Level 1 Card</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={buyBronzePack}
                  className="w-full bg-[#c5a880] hover:bg-[#ebd09b] text-black font-display font-black tracking-widest py-3 px-4 rounded-xl transition-all shadow flex items-center justify-center gap-2 text-xs cursor-pointer active:scale-95"
                >
                  <img src="/icons/icon_gold.webp" alt="Gold" className="w-6 h-6 object-contain" />
                  BUY FOR 300 GOLD
                </button>
              </div>
            </div>

            {/* Obsidian Pack */}
            <div className="bg-[#151a21] border border-indigo-950 rounded-3xl p-5 flex flex-col justify-between hover:-translate-y-1 transition-all shadow-xl gothic-glow-blue">
              <div className="space-y-4">
                <div className="h-48 rounded-2xl bg-gradient-to-b from-indigo-950/30 to-black/60 border border-indigo-900/20 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(102,252,241,0.15),transparent_70%)]" />
                  <img 
                    src="/packs/pack_obsidian.webp" 
                    alt="Obsidian Pack" 
                    decoding="async" 
                    className="w-36 h-36 object-contain hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_20px_rgba(102,252,241,0.4)]" 
                  />
                  <span className="font-display font-black text-sm text-[#66fcf1] mt-2 tracking-widest uppercase text-shadow-gold">
                    OBSIDIAN PACK
                  </span>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-display font-bold text-base text-white">Obsidian Set</h4>
                  <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                    Rare abyss blessings. Increased chances of finding level 2 silver and gold entities.
                  </p>
                  <div className="bg-black/50 border border-indigo-900/20 rounded-xl p-2.5 text-[10px] font-mono text-gray-400 space-y-1">
                    <div className="flex justify-between">
                      <span>• Silver Cards:</span>
                      <span className="text-[#66fcf1] font-bold">50%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Gold Cards:</span>
                      <span className="text-amber-400 font-bold">10%</span>
                    </div>
                    <div className="flex justify-between border-t border-white/5 pt-1 text-gray-400">
                      <span>• Lvl 2 Bonus Chance:</span>
                      <span className="text-cyan-300 font-bold">30%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={buyObsidianPack}
                  className="w-full bg-gradient-to-r from-indigo-900 to-[#1f2833] hover:from-[#45a29e] hover:to-indigo-900 text-[#66fcf1] border border-[#66fcf1]/30 font-display font-black tracking-widest py-3 px-4 rounded-xl transition-all shadow flex items-center justify-center gap-2 text-xs cursor-pointer active:scale-95"
                >
                  <img src="/icons/icon_shards.webp" alt="Shards" className="w-6 h-6 object-contain" />
                  SUMMON FOR 30 SHARDS
                </button>
              </div>
            </div>

            {/* Abyssal Pack */}
            <div className="bg-[#151a21] border border-red-950 rounded-3xl p-5 flex flex-col justify-between hover:-translate-y-1 transition-all shadow-xl gothic-glow-purple">
              <div className="space-y-4">
                <div className="h-48 rounded-2xl bg-gradient-to-b from-red-950/30 to-black/60 border border-red-900/20 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(221,44,64,0.2),transparent_70%)]" />
                  <img 
                    src="/packs/pack_abyssal.webp" 
                    alt="Abyssal Pack" 
                    decoding="async" 
                    className="w-36 h-36 object-contain hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_20px_rgba(221,44,64,0.4)]" 
                  />
                  <span className="font-display font-black text-sm text-[#dd2c40] mt-2 tracking-widest uppercase text-shadow-crimson">
                    ABYSSAL PACK
                  </span>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-display font-bold text-base text-white">Abyssal Lord Pack</h4>
                  <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                    Supreme worship of Darkness. Guaranteed to drop only rare, gold, and legendary entities.
                  </p>
                  <div className="bg-black/50 border border-red-900/20 rounded-xl p-2.5 text-[10px] font-mono text-gray-400 space-y-1">
                    <div className="flex justify-between">
                      <span>• Gold Cards:</span>
                      <span className="text-amber-400 font-bold">45%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Legendary Cards:</span>
                      <span className="text-purple-400 font-bold">15%</span>
                    </div>
                    <div className="flex justify-between border-t border-white/5 pt-1 text-gray-400">
                      <span>• Lvl 2 Bonus Chance:</span>
                      <span className="text-rose-400 font-bold">40%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={buyAbyssalPack}
                  className="w-full bg-gradient-to-r from-[#880d1e] to-[#4e0707] hover:from-[#dd2c40] hover:to-[#880d1e] text-white border border-[#dd2c40]/40 font-display font-black tracking-widest py-3 px-4 rounded-xl transition-all shadow flex items-center justify-center gap-2 text-xs cursor-pointer active:scale-95"
                >
                  <img src="/icons/icon_shards.webp" alt="Shards" className="w-6 h-6 object-contain" />
                  SUMMON FOR 70 SHARDS
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 6. TAB CONTENT: RELIC CHESTS (Equipment Grid) */}
      {activeTab === 'equipment' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="text-center space-y-1">
            <h3 className="font-display font-black text-2xl text-white tracking-widest text-shadow-gold uppercase">
              FORBIDDEN RELIC CHESTS
            </h3>
            <p className="text-xs text-gray-400 font-sans max-w-lg mx-auto">
              Unearth ancient armaments and relics from forgotten crypts to fortify your Lord's attributes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Basic Equipment Chest */}
            <div className="bg-[#151a21] border border-[#c5a880]/40 rounded-3xl p-5 flex flex-col justify-between hover:-translate-y-1 transition-all shadow-xl hover:shadow-[0_0_25px_rgba(197,168,128,0.2)]">
              <div className="space-y-4">
                <div className="h-48 rounded-2xl bg-gradient-to-b from-[#4a3f35]/50 to-black/60 border border-[#c5a880]/20 flex flex-col items-center justify-center relative overflow-hidden">
                  <img 
                    src="/packs/chest_basic.webp" 
                    alt="Basic Relics" 
                    decoding="async" 
                    className="w-36 h-36 object-contain hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_20px_rgba(197,168,128,0.4)]" 
                  />
                  <span className="font-display font-black text-sm text-[#ebd09b] mt-2 tracking-widest uppercase">
                    BASIC RELICS
                  </span>
                </div>
                <div className="space-y-2">
                  <h4 className="font-display font-bold text-base text-white">Basic Equipment Chest</h4>
                  <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                    Basic items for your lord. Grants 1 random piece of equipment.
                  </p>
                  <div className="bg-black/50 border border-white/5 rounded-xl p-2.5 text-[10px] font-mono text-gray-400 space-y-1">
                    <div className="flex justify-between">
                      <span>• Bronze Equipment:</span>
                      <span className="text-amber-400 font-bold">80%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Silver Equipment:</span>
                      <span className="text-gray-300 font-bold">20%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={buyBasicEquipmentPack}
                  className="w-full bg-[#1f2833] hover:bg-[#2b3746] text-[#ebd09b] border border-[#c5a880]/40 font-display font-black tracking-widest py-3 px-4 rounded-xl transition-all shadow flex items-center justify-center gap-2 text-xs cursor-pointer active:scale-95"
                >
                  <img src="/icons/icon_gold.webp" alt="Gold" className="w-6 h-6 object-contain" />
                  OPEN FOR 500 GOLD
                </button>
              </div>
            </div>

            {/* Rare Equipment Chest */}
            <div className="bg-[#151a21] border border-indigo-950 rounded-3xl p-5 flex flex-col justify-between hover:-translate-y-1 transition-all shadow-xl gothic-glow-blue">
              <div className="space-y-4">
                <div className="h-48 rounded-2xl bg-gradient-to-b from-indigo-950/30 to-black/60 border border-indigo-900/20 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(102,252,241,0.15),transparent_70%)]" />
                  <img 
                    src="/packs/chest_rare.webp" 
                    alt="Rare Relics" 
                    decoding="async" 
                    className="w-36 h-36 object-contain hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_20px_rgba(102,252,241,0.4)]" 
                  />
                  <span className="font-display font-black text-sm text-[#66fcf1] mt-2 tracking-widest uppercase text-shadow-gold">
                    RARE RELICS
                  </span>
                </div>
                <div className="space-y-2">
                  <h4 className="font-display font-bold text-base text-white">Rare Equipment Chest</h4>
                  <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                    Better chance for stronger relics. Grants 1 rare piece of equipment.
                  </p>
                  <div className="bg-black/50 border border-white/5 rounded-xl p-2.5 text-[10px] font-mono text-gray-400 space-y-1">
                    <div className="flex justify-between">
                      <span>• Bronze Equipment:</span>
                      <span className="text-amber-600 font-bold">40%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Silver Equipment:</span>
                      <span className="text-cyan-300 font-bold">50%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Gold Equipment:</span>
                      <span className="text-amber-400 font-bold">10%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={buyRareEquipmentPack}
                  className="w-full bg-gradient-to-r from-indigo-900 to-[#1f2833] hover:from-[#45a29e] hover:to-indigo-900 text-[#66fcf1] border border-[#66fcf1]/30 font-display font-black tracking-widest py-3 px-4 rounded-xl transition-all shadow flex items-center justify-center gap-2 text-xs cursor-pointer active:scale-95"
                >
                  <img src="/icons/icon_shards.webp" alt="Shards" className="w-6 h-6 object-contain" />
                  OPEN FOR 30 SHARDS
                </button>
              </div>
            </div>

            {/* Premium Equipment Chest */}
            <div className="bg-[#151a21] border border-red-950 rounded-3xl p-5 flex flex-col justify-between hover:-translate-y-1 transition-all shadow-xl gothic-glow-purple">
              <div className="space-y-4">
                <div className="h-48 rounded-2xl bg-gradient-to-b from-red-950/40 to-black/60 border border-red-500/20 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(221,44,64,0.2),transparent_70%)]" />
                  <img 
                    src="/packs/chest_premium.webp" 
                    alt="Premium Relics" 
                    decoding="async" 
                    className="w-36 h-36 object-contain hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_20px_rgba(221,44,64,0.4)]" 
                  />
                  <span className="font-display font-black text-sm text-[#dd2c40] mt-2 tracking-widest uppercase text-shadow-crimson">
                    PREMIUM RELICS
                  </span>
                </div>
                <div className="space-y-2">
                  <h4 className="font-display font-bold text-base text-white">Premium Equipment Chest</h4>
                  <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                    Contains ancient artifacts of immense power. Grants 1 high-tier equipment.
                  </p>
                  <div className="bg-black/50 border border-white/5 rounded-xl p-2.5 text-[10px] font-mono text-gray-400 space-y-1">
                    <div className="flex justify-between">
                      <span>• Silver Equipment:</span>
                      <span className="text-gray-300 font-bold">40%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Gold Equipment:</span>
                      <span className="text-amber-400 font-bold">45%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Legendary Equipment:</span>
                      <span className="text-purple-400 font-bold">15%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={buyPremiumEquipmentPack}
                  className="w-full bg-gradient-to-r from-[#880d1e] to-[#4e0707] hover:from-[#dd2c40] hover:to-[#880d1e] text-white border border-[#dd2c40]/40 font-display font-black tracking-widest py-3 px-4 rounded-xl transition-all shadow flex items-center justify-center gap-2 text-xs cursor-pointer active:scale-95"
                >
                  <img src="/icons/icon_shards.webp" alt="Shards" className="w-6 h-6 object-contain" />
                  OPEN FOR 70 SHARDS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. OPENING REVEAL ANIMATION OVERLAY */}
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
