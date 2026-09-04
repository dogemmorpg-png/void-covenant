import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Equipment, EquipmentSlot, CardTier } from '../types';
import { getEquipmentIcon, calculateEquipmentSetBonuses, DEMIURGE_SET } from '../data/equipment';
import { TalentsView } from './TalentsView';
import { Shield, Sword, Heart, Sparkles, Coins, Hourglass, Wind, Zap, Activity, Flame, Check, RefreshCw, X } from 'lucide-react';
import { VoidStrikeIcon, BloodAuraIcon, WarlordCryIcon } from './SkillAndStanceIcons';

interface SlotConfig {
  slot: EquipmentSlot;
  label: string;
  iconPath: string;
}

const SLOTS_CONFIG: SlotConfig[] = [
  { slot: 'helmet', label: 'HELMET', iconPath: '/icons/equipment/slot_helmet.png' },
  { slot: 'weapon', label: 'WEAPON', iconPath: '/icons/equipment/slot_weapon.png' },
  { slot: 'ring', label: 'RING', iconPath: '/icons/equipment/slot_ring.png' },
  { slot: 'amulet', label: 'AMULET', iconPath: '/icons/equipment/slot_amulet.png' },
  { slot: 'armor', label: 'ARMOR', iconPath: '/icons/equipment/slot_armor.png' },
  { slot: 'boots', label: 'BOOTS', iconPath: '/icons/equipment/slot_boots.png' },
];

const TIER_STYLES: Record<CardTier, { border: string; bg: string; text: string; glow: string; itemGlow: string }> = {
  bronze: {
    border: 'border-amber-700/60 hover:border-amber-600',
    bg: 'from-[#221609]/90 via-[#150d05]/90 to-black',
    text: 'text-amber-500',
    glow: 'shadow-[0_0_12px_rgba(180,83,9,0.25)]',
    itemGlow: 'drop-shadow-[0_6px_12px_rgba(0,0,0,0.85)]'
  },
  silver: {
    border: 'border-slate-300/60 hover:border-slate-200',
    bg: 'from-[#1a232c]/90 via-[#0e141a]/90 to-black',
    text: 'text-slate-300',
    glow: 'shadow-[0_0_12px_rgba(203,213,225,0.25)]',
    itemGlow: 'drop-shadow-[0_6px_12px_rgba(0,0,0,0.85)]'
  },
  gold: {
    border: 'border-amber-400/80 hover:border-amber-300',
    bg: 'from-[#2e2008]/90 via-[#191103]/90 to-black',
    text: 'text-amber-300',
    glow: 'shadow-[0_0_18px_rgba(251,191,36,0.35)]',
    itemGlow: 'drop-shadow-[0_0_12px_rgba(251,191,36,0.35)]'
  },
  legendary: {
    border: 'border-purple-500/90 hover:border-purple-400',
    bg: 'from-[#280c35]/90 via-[#15041d]/90 to-black',
    text: 'text-purple-300',
    glow: 'shadow-[0_0_22px_rgba(168,85,247,0.45)]',
    itemGlow: 'drop-shadow-[0_0_16px_rgba(168,85,247,0.45)]'
  },
  divine: {
    border: 'border-rose-500/90 hover:border-rose-400',
    bg: 'from-[#350811]/90 via-[#1c0409]/90 to-black',
    text: 'text-rose-400 font-bold',
    glow: 'shadow-[0_0_24px_rgba(244,63,94,0.6)] ring-1 ring-rose-400/50',
    itemGlow: 'drop-shadow-[0_0_16px_rgba(244,63,94,0.7)]'
  }
};

const TIER_PRIORITY: Record<CardTier, number> = {
  divine: 5,
  legendary: 4,
  gold: 3,
  silver: 2,
  bronze: 1,
};

export const HeroInventoryView: React.FC = () => {
  const { profile, equipItem, unequipItem } = useGame();
  
  const [selectedSlot, setSelectedSlot] = useState<EquipmentSlot | null>(null);
  const [subTab, setSubTab] = useState<'equipment' | 'talents'>('equipment');

  // Equipped items resolution
  const eqWeapon = profile.equipment?.find(e => e.id === profile.equipped?.['weapon']) || null;
  const eqArmor = profile.equipment?.find(e => e.id === profile.equipped?.['armor']) || null;
  const eqHelmet = profile.equipment?.find(e => e.id === profile.equipped?.['helmet']) || null;
  const eqAmulet = profile.equipment?.find(e => e.id === profile.equipped?.['amulet']) || null;
  const eqRing = profile.equipment?.find(e => e.id === profile.equipped?.['ring']) || null;
  const eqBoots = profile.equipment?.find(e => e.id === profile.equipped?.['boots']) || null;

  const equippedList = [eqHelmet, eqArmor, eqWeapon, eqAmulet, eqRing, eqBoots].filter(Boolean) as Equipment[];

  // Set Bonus Calculations
  const setBonusResults = calculateEquipmentSetBonuses(equippedList);
  const demiurgeBonus = setBonusResults.find(s => s.setId === 'demiurge');

  const setBonusHealth = demiurgeBonus?.totalBonuses.maxHealth || 0;
  const setBonusDodge = demiurgeBonus?.totalBonuses.dodge || 0;
  const setBonusDelay = demiurgeBonus?.totalBonuses.delayReduction || 0;

  // Bonus Calculations
  const bonusHealth = equippedList.filter(e => e.bonusType === 'maxHealth').reduce((sum, e) => sum + e.bonusValue, 0)
    + equippedList.filter(e => e.secondaryBonusType === 'maxHealth').reduce((sum, e) => sum + (e.secondaryBonusValue || 0), 0)
    + setBonusHealth;

  const bonusDodge = equippedList.filter(e => e.bonusType === 'dodge').reduce((sum, e) => sum + e.bonusValue, 0)
    + equippedList.filter(e => e.secondaryBonusType === 'dodge').reduce((sum, e) => sum + (e.secondaryBonusValue || 0), 0)
    + setBonusDodge;

  const bonusGold = equippedList.filter(e => e.bonusType === 'goldBonus').reduce((sum, e) => sum + e.bonusValue, 0);
  const bonusDelay = equippedList.filter(e => e.bonusType === 'delayReduction').reduce((sum, e) => sum + e.bonusValue, 0)
    + setBonusDelay;

  const baseHealth = profile.heroMaxHealth || 30;
  const totalHealth = baseHealth + bonusHealth;

  // Stance Info
  const stanceIcons: Record<string, { label: string; icon: React.ReactNode; color: string; desc: string }> = {
    void_strike: { label: 'Void Strike', icon: <VoidStrikeIcon sizeClass="w-5 h-5" />, color: 'text-cyan-400', desc: '25% chance to deal 1 bonus damage' },
    blood_aura: { label: 'Blood Aura', icon: <BloodAuraIcon sizeClass="w-5 h-5" />, color: 'text-rose-400', desc: '25% chance to heal an ally for 1 HP' },
    warlord_cry: { label: "Warlord's Cry", icon: <WarlordCryIcon sizeClass="w-5 h-5" />, color: 'text-amber-400', desc: '25% chance to buff ally +1 Atk' },
  };
  const activeStance = stanceIcons[profile.activeStance || 'void_strike'] || stanceIcons.void_strike;

  // EXP & Level Calculations
  const getRequiredExpForLevel = (level: number) => Math.floor(100 * Math.pow(1.2, level - 1));
  const reqExp = getRequiredExpForLevel(profile.level);
  const expPercent = Math.min(100, Math.floor((profile.exp / reqExp) * 100));

  const formatBonusLabel = (type: string, val: number) => {
    switch (type) {
      case 'maxHealth': return `+${val} Max HP`;
      case 'dodge': return `+${val}% Dodge`;
      case 'goldBonus': return `+${val}% Gold`;
      case 'delayReduction': return `-${val} Delay`;
      default: return `+${val} ${type}`;
    }
  };

  const renderSlotBox = (slot: EquipmentSlot, label: string, defaultIconPath: string) => {
    const item = profile.equipment?.find(e => e.id === profile.equipped?.[slot]) || null;
    const isSelected = selectedSlot === slot;
    const tierStyle = item ? TIER_STYLES[item.tier] : null;
    const itemIcon = item ? getEquipmentIcon(item, slot) : defaultIconPath;

    return (
      <div
        onClick={() => setSelectedSlot(selectedSlot === slot ? null : slot)}
        className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl p-2 flex flex-col items-center justify-between cursor-pointer transition-all duration-300 relative group overflow-hidden ${
          isSelected
            ? 'border-2 border-purple-400 ring-2 ring-purple-500/40 scale-105 shadow-[0_0_20px_rgba(168,85,247,0.5)] z-20'
            : item
            ? `border-2 ${tierStyle?.border} bg-gradient-to-b ${tierStyle?.bg} ${tierStyle?.glow} hover:scale-105`
            : 'border border-white/10 hover:border-purple-500/50 bg-gradient-to-b from-[#140e18]/80 to-black/90 hover:scale-102 shadow-inner'
        }`}
      >
        {item ? (
          <>
            {/* Tier Header */}
            <div className="w-full flex items-center justify-between text-[8px] font-mono font-black uppercase tracking-wider z-10">
              <span className={tierStyle?.text}>{item.tier}</span>
              <span className="text-[7px] text-gray-400 uppercase tracking-widest">{label}</span>
            </div>

            {/* Individual Item Icon */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 my-auto flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform">
              <img src={itemIcon} alt={item.name} className={`w-full h-full object-contain ${tierStyle?.itemGlow || ''}`} />
            </div>

            {/* Item Name & Bonus Footer */}
            <div className="w-full text-center z-10 space-y-0.5">
              <div className="text-[9px] sm:text-[10px] text-white font-display font-bold truncate max-w-full leading-tight">
                {item.name}
              </div>
              <div className="text-[8px] sm:text-[9px] text-emerald-400 font-mono font-bold leading-tight">
                {formatBonusLabel(item.bonusType, item.bonusValue)}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Empty Slot Header */}
            <div className="w-full text-center text-[8px] font-mono text-gray-500 uppercase tracking-widest">
              {label}
            </div>

            {/* Faded Placeholder Icon */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 my-auto flex items-center justify-center opacity-40 group-hover:opacity-80 transition-opacity">
              <img src={defaultIconPath} alt={label} className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300" />
            </div>

            {/* Prompt */}
            <div className="text-[8px] font-mono text-gray-500 uppercase tracking-wider group-hover:text-purple-300 transition-colors">
              + EQUIP
            </div>
          </>
        )}
      </div>
    );
  };

  const renderInventoryModal = () => {
    if (!selectedSlot) return null;
    const rawItems = profile.equipment?.filter(e => e.slot === selectedSlot) || [];
    const equippedItemId = profile.equipped?.[selectedSlot];
    const inventoryItems = [...rawItems].sort((a, b) => {
      // If one is equipped, show it first
      const aEquipped = a.id === equippedItemId;
      const bEquipped = b.id === equippedItemId;
      if (aEquipped && !bEquipped) return -1;
      if (!aEquipped && bEquipped) return 1;

      // Primary sort: Tier descending (divine -> legendary -> gold -> silver -> bronze)
      const tierDiff = (TIER_PRIORITY[b.tier] || 0) - (TIER_PRIORITY[a.tier] || 0);
      if (tierDiff !== 0) return tierDiff;

      // Secondary sort: Primary bonus value descending
      const bonusDiff = (b.bonusValue || 0) - (a.bonusValue || 0);
      if (bonusDiff !== 0) return bonusDiff;

      // Tertiary sort: Name alphabetical
      return a.name.localeCompare(b.name);
    });
    const slotCfg = SLOTS_CONFIG.find(s => s.slot === selectedSlot);

    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        onClick={(e) => {
          if (e.target === e.currentTarget) setSelectedSlot(null);
        }}
      >
        <div className="bg-gradient-to-b from-[#1c1422] via-[#130d17] to-[#0a070c] border-2 border-purple-500/40 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(168,85,247,0.3)] w-full max-w-3xl max-h-[85vh] flex flex-col space-y-5 overflow-hidden animate-in zoom-in-95 duration-200">
          
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-gray-800/80 pb-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-black/70 border border-purple-500/50 flex items-center justify-center shadow-inner">
                <img src={slotCfg?.iconPath} alt={selectedSlot} className="w-8 h-8 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]" />
              </div>
              <div>
                <h4 className="font-display font-black text-white text-lg sm:text-xl tracking-widest uppercase">
                  CHOOSE {selectedSlot.toUpperCase()}
                </h4>
                <span className="text-xs font-mono text-purple-300">
                  {inventoryItems.length} owned relic{inventoryItems.length === 1 ? '' : 's'} for this slot
                </span>
              </div>
            </div>
            
            <button
              onClick={() => setSelectedSlot(null)}
              className="w-9 h-9 rounded-xl bg-black/50 hover:bg-red-950/60 border border-white/10 hover:border-red-500/40 text-gray-400 hover:text-red-300 flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content / Item Grid */}
          <div className="overflow-y-auto pr-1 flex-1 custom-scrollbar">
            {inventoryItems.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-purple-950/40 border border-purple-500/30 flex items-center justify-center mx-auto">
                  <img src={slotCfg?.iconPath} alt={selectedSlot} className="w-9 h-9 object-contain opacity-40 grayscale" />
                </div>
                <p className="text-sm text-gray-300 font-sans font-medium">No relics found for the {selectedSlot} slot.</p>
                <p className="text-xs text-gray-500 font-sans max-w-sm mx-auto">
                  Open Equipment Packs in the <strong>SHOP</strong> to discover weapons, armor, and accessories!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-2">
                {inventoryItems.map(item => {
                  const isEquipped = equippedItemId === item.id;
                  const tierStyle = TIER_STYLES[item.tier];
                  const itemIcon = getEquipmentIcon(item, selectedSlot);

                  return (
                    <div 
                      key={item.id} 
                      className={`bg-gradient-to-b ${tierStyle.bg} border-2 ${tierStyle.border} ${tierStyle.glow} p-4 rounded-3xl flex flex-col justify-between space-y-3.5 transition-all duration-300 hover:scale-[1.02] group`}
                    >
                      {/* Card Header: Tier & Equipped Badge */}
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-display font-black uppercase tracking-widest ${tierStyle.text}`}>
                          {item.tier}
                        </span>
                        {isEquipped && (
                          <span className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-400 text-[9px] font-mono font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-[0_0_12px_rgba(16,185,129,0.4)]">
                            <Check className="w-3 h-3" /> EQUIPPED
                          </span>
                        )}
                      </div>
                      
                      {/* Large Item Artwork Showcase */}
                      <div className="w-full h-36 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center p-3 relative overflow-hidden shadow-inner">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04),transparent_70%)] pointer-events-none" />
                        <img 
                          src={itemIcon} 
                          alt={item.name} 
                          className={`w-28 h-28 object-contain ${tierStyle.itemGlow} group-hover:scale-110 transition-transform duration-300`} 
                        />
                      </div>

                      {/* Item Details */}
                      <div className="text-center space-y-1.5">
                        <h5 className="font-display font-black text-sm sm:text-base text-white leading-snug tracking-wide">
                          {item.name}
                        </h5>
                        <div className="flex flex-wrap items-center justify-center gap-1.5">
                          <div className="inline-flex items-center gap-1 bg-black/60 border border-emerald-500/30 px-3 py-1 rounded-full shadow-inner">
                            <span className="text-xs text-emerald-400 font-mono font-bold">
                              {formatBonusLabel(item.bonusType, item.bonusValue)}
                            </span>
                          </div>
                          {item.secondaryBonusType && (
                            <div className="inline-flex items-center gap-1 bg-black/60 border border-rose-500/30 px-3 py-1 rounded-full shadow-inner">
                              <span className="text-xs text-rose-400 font-mono font-bold">
                                {formatBonusLabel(item.secondaryBonusType, item.secondaryBonusValue || 0)}
                              </span>
                            </div>
                          )}
                        </div>
                        {item.setId && (
                          <div className="pt-0.5">
                            <span className="text-[9px] font-mono text-rose-300 font-bold bg-rose-950/70 border border-rose-500/40 px-2 py-0.5 rounded-full shadow">
                              SET OF THE DEMIURGE
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="pt-1">
                        {isEquipped ? (
                          <button
                            onClick={() => {
                              unequipItem(selectedSlot);
                              setSelectedSlot(null);
                            }}
                            className="w-full bg-red-950/60 hover:bg-red-900 text-red-300 hover:text-white border border-red-500/50 hover:border-red-400 rounded-xl py-2.5 text-xs font-display font-black tracking-widest uppercase transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <X className="w-4 h-4" /> UNEQUIP
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              equipItem(selectedSlot, item.id);
                              setSelectedSlot(null);
                            }}
                            className="w-full bg-purple-950/70 hover:bg-purple-800 text-purple-200 hover:text-white border border-purple-500/50 hover:border-purple-300 rounded-xl py-2.5 text-xs font-display font-black tracking-widest uppercase transition-all shadow-lg shadow-purple-950/60 flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <RefreshCw className="w-4 h-4" /> {equippedItemId ? 'SWAP RELIC' : 'EQUIP RELIC'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-2 sm:px-6 space-y-5">
      
      {/* Sub-Tab Switcher at Top */}
      <div className="flex gap-3 justify-center max-w-md mx-auto">
        <button 
          onClick={() => setSubTab('equipment')}
          className={`flex-1 py-2.5 px-6 rounded-2xl font-display font-black tracking-widest text-xs sm:text-sm transition-all duration-300 uppercase flex items-center justify-center gap-2 cursor-pointer ${
            subTab === 'equipment' 
              ? 'bg-gradient-to-b from-[#3b1248] via-[#240a2c] to-[#120417] text-purple-200 border-2 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.35)]' 
              : 'bg-black/40 text-gray-500 border border-white/5 hover:border-white/20 hover:text-gray-300'
          }`}
        >
          <Sparkles className="w-4 h-4" /> RELICS & GEAR
        </button>
        <button 
          onClick={() => setSubTab('talents')}
          className={`flex-1 py-2.5 px-6 rounded-2xl font-display font-black tracking-widest text-xs sm:text-sm transition-all duration-300 uppercase flex items-center justify-center gap-2 cursor-pointer ${
            subTab === 'talents' 
              ? 'bg-gradient-to-b from-[#3a2208] via-[#241403] to-[#100801] text-amber-200 border-2 border-amber-500 shadow-[0_0_20px_rgba(251,191,36,0.35)]' 
              : 'bg-black/40 text-gray-500 border border-white/5 hover:border-white/20 hover:text-gray-300'
          }`}
        >
          <Zap className="w-4 h-4" /> TALENT TREE
        </button>
      </div>

      {subTab === 'equipment' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Column: Lord Profile & Active Attributes */}
            <div className="lg:col-span-5 bg-gradient-to-b from-[#18121a] via-[#120d15] to-[#0a070c] border border-[#c5a880]/30 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-purple-900/10 blur-3xl pointer-events-none" />
              
              <div className="flex flex-col items-center text-center space-y-2.5 relative z-10">
                {/* Circular Avatar Frame */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-b from-purple-950 to-black border-2 border-[#ebd09b] p-1 shadow-[0_0_20px_rgba(235,208,155,0.25)] flex items-center justify-center">
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <img src="/avatars/knight.webp" alt="Avatar" className="w-full h-full object-cover rounded-full" />
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="font-display font-black text-xl sm:text-2xl text-white tracking-widest uppercase text-shadow-gold">
                    {profile.username || 'Abyssal Lord'}
                  </h3>
                  <div className="inline-flex items-center gap-1.5 text-[#ebd09b] font-mono text-xs font-black bg-[#ebd09b]/10 border border-[#ebd09b]/30 px-3 py-0.5 rounded-full shadow-inner">
                    LEVEL {profile.level}
                  </div>
                </div>

                {/* Stance Banner */}
                <div className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-left">
                    <div className="w-7 h-7 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center">
                      {activeStance.icon}
                    </div>
                    <div>
                      <span className={`text-[10px] font-display font-black uppercase tracking-wider block ${activeStance.color}`}>
                        STANCE: {activeStance.label}
                      </span>
                      <span className="text-[9px] text-gray-400 font-sans block">{activeStance.desc}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* EXP Progress Bar */}
              <div className="space-y-1 relative z-10">
                <div className="flex justify-between text-gray-400 text-[10px] font-mono uppercase font-bold">
                  <span>EXPERIENCE</span>
                  <span className="text-gray-300">{Math.floor(profile.exp).toLocaleString()} / {reqExp.toLocaleString()} EXP</span>
                </div>
                <div className="w-full h-2 bg-black/80 rounded-full overflow-hidden border border-white/10 shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 via-indigo-400 to-emerald-400 transition-all duration-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" 
                    style={{ width: `${expPercent}%` }} 
                  />
                </div>
              </div>

              {/* ALL LORD CHARACTERISTICS / STATS */}
              <div className="space-y-2 relative z-10">
                <div className="flex items-center justify-between border-b border-gray-800 pb-1.5">
                  <span className="text-[11px] font-display font-black text-[#ebd09b] tracking-wider uppercase">
                    BATTLE ATTRIBUTES
                  </span>
                  <span className="text-[9px] font-mono text-purple-400 font-bold bg-purple-950/50 border border-purple-500/30 px-2 py-0.5 rounded-full">
                    {equippedList.length}/6 Relics Active
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono">
                  {/* Max Health */}
                  <div className="bg-black/60 border border-emerald-500/25 p-2.5 rounded-2xl flex flex-col justify-between shadow-sm">
                    <div className="flex items-center justify-between text-gray-400 text-[10px] uppercase font-bold">
                      <span className="flex items-center gap-1 text-emerald-400"><Heart className="w-3.5 h-3.5 text-emerald-400" /> Max Health</span>
                    </div>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-emerald-300 font-display font-black text-base sm:text-lg">{totalHealth}</span>
                      {bonusHealth > 0 && (
                        <span className="text-[10px] text-emerald-400/80 font-bold">+{bonusHealth} gear</span>
                      )}
                    </div>
                  </div>

                  {/* Dodge Chance */}
                  <div className="bg-black/60 border border-cyan-500/25 p-2.5 rounded-2xl flex flex-col justify-between shadow-sm">
                    <div className="flex items-center justify-between text-gray-400 text-[10px] uppercase font-bold">
                      <span className="flex items-center gap-1 text-cyan-400"><Wind className="w-3.5 h-3.5 text-cyan-400" /> Dodge Chance</span>
                    </div>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-cyan-300 font-display font-black text-base sm:text-lg">{bonusDodge}%</span>
                      {bonusDodge > 0 && (
                        <span className="text-[10px] text-cyan-400/80 font-bold">+{bonusDodge}% gear</span>
                      )}
                    </div>
                  </div>

                  {/* Gold Bonus */}
                  <div className="bg-black/60 border border-amber-500/25 p-2.5 rounded-2xl flex flex-col justify-between shadow-sm">
                    <div className="flex items-center justify-between text-gray-400 text-[10px] uppercase font-bold">
                      <span className="flex items-center gap-1 text-amber-400"><Coins className="w-3.5 h-3.5 text-amber-400" /> Gold Gain</span>
                    </div>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-amber-300 font-display font-black text-base sm:text-lg">+{bonusGold}%</span>
                      {bonusGold > 0 && (
                        <span className="text-[10px] text-amber-400/80 font-bold">+{bonusGold}% gear</span>
                      )}
                    </div>
                  </div>

                  {/* Delay Reduction */}
                  <div className="bg-black/60 border border-purple-500/25 p-2.5 rounded-2xl flex flex-col justify-between shadow-sm">
                    <div className="flex items-center justify-between text-gray-400 text-[10px] uppercase font-bold">
                      <span className="flex items-center gap-1 text-purple-400"><Hourglass className="w-3.5 h-3.5 text-purple-400" /> Card Delay</span>
                    </div>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-purple-300 font-display font-black text-sm sm:text-base">
                        {bonusDelay > 0 ? `-${bonusDelay} Turn` : 'Standard'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Equipped Relics Paperdoll Mannequin */}
            <div className="lg:col-span-7 bg-gradient-to-b from-[#18121a] via-[#120d15] to-[#0a070c] border border-purple-900/40 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.08),transparent_70%)] pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-purple-900/50 pb-2.5 mb-4 relative z-10">
                <h3 className="font-display font-black text-base sm:text-lg text-purple-200 tracking-widest uppercase">
                  EQUIPPED RELICS & APPAREL
                </h3>
                <span className="text-[10px] font-mono text-gray-400">
                  Click a slot to equip or manage gear
                </span>
              </div>

              {/* Paperdoll Mannequin Grid */}
              <div className="flex items-center justify-center my-auto py-2 relative z-10">
                <div className="flex items-center justify-center gap-3 sm:gap-6 w-full max-w-lg">
                  
                  {/* Left Slots Column */}
                  <div className="flex flex-col gap-3">
                    {renderSlotBox('helmet', 'HELMET', '/icons/equipment/slot_helmet.png')}
                    {renderSlotBox('weapon', 'WEAPON', '/icons/equipment/slot_weapon.png')}
                    {renderSlotBox('ring', 'RING', '/icons/equipment/slot_ring.png')}
                  </div>

                  {/* Center Gothic Mannequin Silhouette */}
                  <div className="w-24 h-56 sm:w-32 sm:h-72 relative flex items-center justify-center">
                    <div className="w-full h-full bg-black/40 border border-purple-500/20 rounded-3xl flex items-center justify-center p-2 shadow-inner overflow-hidden">
                      <img 
                        src="/icons/equipment/lord_silhouette.png" 
                        alt="Lord Silhouette" 
                        className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(168,85,247,0.35)] opacity-85 hover:opacity-100 transition-opacity" 
                      />
                    </div>
                  </div>

                  {/* Right Slots Column */}
                  <div className="flex flex-col gap-3">
                    {renderSlotBox('amulet', 'AMULET', '/icons/equipment/slot_amulet.png')}
                    {renderSlotBox('armor', 'ARMOR', '/icons/equipment/slot_armor.png')}
                    {renderSlotBox('boots', 'BOOTS', '/icons/equipment/slot_boots.png')}
                  </div>

                </div>
              </div>

              {/* Bottom Quick Help Bar */}
              <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between relative z-10 text-[11px] font-mono text-gray-400">
                <span className="flex items-center gap-1.5 text-purple-300/80">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Click any slot to view and equip matching relics
                </span>
                <span className="text-gray-500 text-[10px] hidden sm:inline">
                  Packs available in Shop
                </span>
              </div>
            </div>
          </div>

          {/* SET RESONANCE CARD */}
          <div className="bg-gradient-to-r from-[#1f0910] via-[#120509] to-[#1f0910] border-2 border-rose-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-rose-500/20 pb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-950/80 border border-rose-500/50 flex items-center justify-center shadow-md">
                  <Shield className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-display font-black text-white text-base sm:text-lg tracking-wider uppercase">
                      SET OF THE DEMIURGE
                    </h4>
                    <span className="bg-rose-500 text-white font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.7)]">
                      DIVINE SET
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-sans mt-0.5">
                    Equip matching Demiurge relics to awaken ancient cosmic properties.
                  </p>
                </div>
              </div>

              {/* Counter */}
              {(() => {
                const demiurgePieces = equippedList.filter(e => e.setId === 'demiurge').length;
                return (
                  <div className="bg-black/70 border border-rose-500/30 rounded-2xl px-4 py-2 text-center shrink-0 shadow-inner">
                    <span className="text-[9px] font-mono uppercase text-gray-400 block font-bold">Active Pieces</span>
                    <span className="font-display font-black text-xl text-rose-400">
                      {demiurgePieces} <span className="text-gray-500 text-sm">/ 6</span>
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* Thresholds Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-4 relative z-10">
              {(() => {
                const demiurgePieces = equippedList.filter(e => e.setId === 'demiurge').length;
                return DEMIURGE_SET.thresholds.map((threshold, tIdx) => {
                  const isActive = demiurgePieces >= threshold.pieces;
                  return (
                    <div
                      key={tIdx}
                      className={`rounded-2xl p-4 border transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-rose-950/90 to-[#22060e]/90 border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.4)] ring-1 ring-rose-400/50'
                          : 'bg-black/50 border-white/10 opacity-70'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className={`text-[10px] font-mono font-black uppercase tracking-wider ${isActive ? 'text-rose-300' : 'text-gray-400'}`}>
                          [{threshold.pieces} PIECES] {threshold.label}
                        </span>
                        {isActive ? (
                          <span className="text-[9px] font-mono font-black text-rose-300 bg-rose-950 border border-rose-500/70 px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.7)] flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" /> ACTIVE
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono text-gray-500 bg-black/60 px-2 py-0.5 rounded-full border border-white/5">
                            {threshold.pieces - demiurgePieces} MORE NEEDED
                          </span>
                        )}
                      </div>
                      <p className={`text-xs font-sans leading-relaxed ${isActive ? 'text-gray-100 font-medium' : 'text-gray-400'}`}>
                        {threshold.description}
                      </p>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        
          {/* Relic Selection Modal Popup */}
          {renderInventoryModal()}
        </div>
      ) : (
        <TalentsView />
      )}
    </div>
  );
};
