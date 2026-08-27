import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Equipment, EquipmentSlot, CardTier } from '../types';
import { TalentsView } from './TalentsView';
import { Shield, Sword, Heart, Sparkles, Coins, Hourglass, Wind, Zap, Activity, Flame, Check, RefreshCw, X } from 'lucide-react';

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

const TIER_STYLES: Record<CardTier, { border: string; bg: string; text: string; glow: string }> = {
  bronze: {
    border: 'border-amber-700/60 hover:border-amber-600',
    bg: 'from-[#221609]/90 via-[#150d05]/90 to-black',
    text: 'text-amber-500',
    glow: 'shadow-[0_0_12px_rgba(180,83,9,0.25)]'
  },
  silver: {
    border: 'border-slate-300/60 hover:border-slate-200',
    bg: 'from-[#1a232c]/90 via-[#0e141a]/90 to-black',
    text: 'text-slate-300',
    glow: 'shadow-[0_0_12px_rgba(203,213,225,0.25)]'
  },
  gold: {
    border: 'border-amber-400/80 hover:border-amber-300',
    bg: 'from-[#2e2008]/90 via-[#191103]/90 to-black',
    text: 'text-amber-300',
    glow: 'shadow-[0_0_18px_rgba(251,191,36,0.35)]'
  },
  legendary: {
    border: 'border-purple-500/90 hover:border-purple-400',
    bg: 'from-[#280c35]/90 via-[#15041d]/90 to-black',
    text: 'text-purple-300',
    glow: 'shadow-[0_0_22px_rgba(168,85,247,0.45)]'
  }
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

  // Bonus Calculations
  const bonusHealth = equippedList.filter(e => e.bonusType === 'maxHealth').reduce((sum, e) => sum + e.bonusValue, 0);
  const bonusDodge = equippedList.filter(e => e.bonusType === 'dodge').reduce((sum, e) => sum + e.bonusValue, 0);
  const bonusGold = equippedList.filter(e => e.bonusType === 'goldBonus').reduce((sum, e) => sum + e.bonusValue, 0);
  const bonusDelay = equippedList.filter(e => e.bonusType === 'delayReduction').reduce((sum, e) => sum + e.bonusValue, 0);

  const baseHealth = profile.heroMaxHealth || 30;
  const totalHealth = baseHealth + bonusHealth;

  // Stance Info
  const stanceIcons: Record<string, { label: string; icon: React.ReactNode; color: string; desc: string }> = {
    void_strike: { label: 'Void Strike', icon: <Zap className="w-4 h-4 text-purple-400" />, color: 'text-purple-400', desc: '25% chance to deal 1 bonus damage' },
    blood_aura: { label: 'Blood Aura', icon: <Activity className="w-4 h-4 text-red-400" />, color: 'text-red-400', desc: '25% chance to heal an ally for 1 HP' },
    warlord_cry: { label: "Warlord's Cry", icon: <Flame className="w-4 h-4 text-amber-500" />, color: 'text-amber-500', desc: '25% chance to buff ally +1 Atk' },
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

  const renderSlotBox = (slot: EquipmentSlot, label: string, iconPath: string) => {
    const item = profile.equipment?.find(e => e.id === profile.equipped?.[slot]) || null;
    const isSelected = selectedSlot === slot;
    const tierStyle = item ? TIER_STYLES[item.tier] : null;

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

            {/* Custom Glowing Slot Icon */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 my-auto flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform">
              <img src={iconPath} alt={label} className="w-full h-full object-contain drop-shadow-[0_0_6px_rgba(255,215,110,0.6)]" />
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

            {/* Faded Slot Icon */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 my-auto flex items-center justify-center opacity-40 group-hover:opacity-80 transition-opacity">
              <img src={iconPath} alt={label} className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300" />
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

  const renderInventoryList = () => {
    if (!selectedSlot) return null;
    const inventoryItems = profile.equipment?.filter(e => e.slot === selectedSlot) || [];
    const equippedItemId = profile.equipped?.[selectedSlot];
    const slotCfg = SLOTS_CONFIG.find(s => s.slot === selectedSlot);

    return (
      <div className="bg-gradient-to-b from-[#18121a] via-[#120d15] to-[#0a070c] border border-purple-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in duration-300">
        <div className="flex items-center justify-between border-b border-gray-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black/60 border border-purple-500/40 flex items-center justify-center shadow-inner">
              <img src={slotCfg?.iconPath} alt={selectedSlot} className="w-7 h-7 object-contain drop-shadow-[0_0_6px_rgba(235,208,155,0.6)]" />
            </div>
            <div>
              <h4 className="font-display font-black text-white text-base sm:text-lg tracking-widest uppercase">
                AVAILABLE {selectedSlot.toUpperCase()} RELICS
              </h4>
              <span className="text-[10px] font-mono text-gray-400 tracking-wider">
                {inventoryItems.length} items owned for this slot
              </span>
            </div>
          </div>
          
          <button
            onClick={() => setSelectedSlot(null)}
            className="w-8 h-8 rounded-xl bg-black/40 hover:bg-black/80 border border-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {inventoryItems.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <p className="text-sm text-gray-400 font-sans font-medium">No relics found for the {selectedSlot} slot.</p>
            <p className="text-xs text-gray-600 font-sans">Open Equipment Packs in the <strong>SHOP</strong> to discover powerful gear!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {inventoryItems.map(item => {
              const isEquipped = equippedItemId === item.id;
              const tierStyle = TIER_STYLES[item.tier];

              return (
                <div 
                  key={item.id} 
                  className={`bg-gradient-to-b ${tierStyle.bg} border-2 ${tierStyle.border} ${tierStyle.glow} p-4 rounded-2xl flex flex-col justify-between space-y-3 transition-all duration-200 hover:scale-[1.02]`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-display font-black uppercase tracking-widest ${tierStyle.text}`}>
                        {item.tier}
                      </span>
                      {isEquipped && (
                        <span className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[8px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                          <Check className="w-2.5 h-2.5" /> EQUIPPED
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center shrink-0">
                        <img src={slotCfg?.iconPath} alt={item.name} className="w-7 h-7 object-contain drop-shadow-[0_0_6px_rgba(255,215,110,0.5)]" />
                      </div>
                      <div>
                        <h5 className="font-display font-black text-sm text-white leading-tight">{item.name}</h5>
                        <p className="text-xs text-emerald-400 font-mono font-bold mt-0.5">
                          {formatBonusLabel(item.bonusType, item.bonusValue)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    {isEquipped ? (
                      <button
                        onClick={() => unequipItem(selectedSlot)}
                        className="w-full bg-red-950/40 hover:bg-red-900/80 text-red-300 border border-red-500/40 hover:border-red-400 rounded-xl py-2 text-xs font-display font-bold tracking-wider uppercase transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" /> UNEQUIP
                      </button>
                    ) : (
                      <button
                        onClick={() => equipItem(selectedSlot, item.id)}
                        className="w-full bg-purple-950/50 hover:bg-purple-900/90 text-purple-200 hover:text-white border border-purple-500/50 hover:border-purple-300 rounded-xl py-2 text-xs font-display font-black tracking-widest uppercase transition-all shadow-md shadow-purple-950/40 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> {equippedItemId ? 'SWAP RELIC' : 'EQUIP RELIC'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <h2 className="font-display font-black text-3xl md:text-4xl text-white tracking-widest text-shadow-gold uppercase">
          LORD SANCTUARY
        </h2>
        <p className="text-xs sm:text-sm text-gray-400 font-sans max-w-xl mx-auto">
          Equip mythical relics, review battle attributes, and customize your lord combat stances.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-3 justify-center max-w-md mx-auto">
        <button 
          onClick={() => setSubTab('equipment')}
          className={`flex-1 py-3 px-6 rounded-2xl font-display font-black tracking-widest text-xs sm:text-sm transition-all duration-300 uppercase flex items-center justify-center gap-2 cursor-pointer ${
            subTab === 'equipment' 
              ? 'bg-gradient-to-b from-[#3b1248] via-[#240a2c] to-[#120417] text-purple-200 border-2 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.35)]' 
              : 'bg-black/40 text-gray-500 border border-white/5 hover:border-white/20 hover:text-gray-300'
          }`}
        >
          <Sparkles className="w-4 h-4" /> RELICS & GEAR
        </button>
        <button 
          onClick={() => setSubTab('talents')}
          className={`flex-1 py-3 px-6 rounded-2xl font-display font-black tracking-widest text-xs sm:text-sm transition-all duration-300 uppercase flex items-center justify-center gap-2 cursor-pointer ${
            subTab === 'talents' 
              ? 'bg-gradient-to-b from-[#3a2208] via-[#241403] to-[#100801] text-amber-200 border-2 border-amber-500 shadow-[0_0_20px_rgba(251,191,36,0.35)]' 
              : 'bg-black/40 text-gray-500 border border-white/5 hover:border-white/20 hover:text-gray-300'
          }`}
        >
          <Zap className="w-4 h-4" /> TALENT TREE
        </button>
      </div>

      {subTab === 'equipment' ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Lord Profile & Active Attributes */}
            <div className="lg:col-span-5 bg-gradient-to-b from-[#18121a] via-[#120d15] to-[#0a070c] border border-[#c5a880]/30 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-purple-900/10 blur-3xl pointer-events-none" />
              
              <div className="flex flex-col items-center text-center space-y-3 relative z-10">
                {/* Circular Avatar Frame */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-b from-purple-950 to-black border-2 border-[#ebd09b] p-1 shadow-[0_0_25px_rgba(235,208,155,0.25)] flex items-center justify-center">
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <img src="/avatars/knight.webp" alt="Avatar" className="w-full h-full object-cover rounded-full" />
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="font-display font-black text-2xl text-white tracking-widest uppercase text-shadow-gold">
                    {profile.username || 'Abyssal Lord'}
                  </h3>
                  <div className="inline-flex items-center gap-1.5 text-[#ebd09b] font-mono text-xs font-black bg-[#ebd09b]/10 border border-[#ebd09b]/30 px-3 py-1 rounded-full shadow-inner">
                    LEVEL {profile.level}
                  </div>
                </div>

                {/* Stance Banner */}
                <div className="w-full bg-black/50 border border-white/10 rounded-xl p-3 flex items-center justify-between">
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
              <div className="space-y-1.5 relative z-10">
                <div className="flex justify-between text-gray-400 text-[10px] font-mono uppercase font-bold">
                  <span>EXPERIENCE</span>
                  <span className="text-gray-300">{Math.floor(profile.exp).toLocaleString()} / {reqExp.toLocaleString()} EXP</span>
                </div>
                <div className="w-full h-2.5 bg-black/80 rounded-full overflow-hidden border border-white/10 shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 via-indigo-400 to-emerald-400 transition-all duration-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" 
                    style={{ width: `${expPercent}%` }} 
                  />
                </div>
              </div>

              {/* ALL LORD CHARACTERISTICS / STATS */}
              <div className="space-y-2.5 relative z-10">
                <div className="flex items-center justify-between border-b border-gray-800 pb-1.5">
                  <span className="text-[11px] font-display font-black text-[#ebd09b] tracking-wider uppercase">
                    BATTLE ATTRIBUTES
                  </span>
                  <span className="text-[9px] font-mono text-purple-400 font-bold bg-purple-950/50 border border-purple-500/30 px-2 py-0.5 rounded-full">
                    {equippedList.length}/6 Relics Active
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 font-mono">
                  {/* Max Health */}
                  <div className="bg-black/60 border border-emerald-500/25 p-3 rounded-2xl flex flex-col justify-between shadow-sm">
                    <div className="flex items-center justify-between text-gray-400 text-[10px] uppercase font-bold">
                      <span className="flex items-center gap-1 text-emerald-400"><Heart className="w-3.5 h-3.5 text-emerald-400" /> Max Health</span>
                    </div>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-emerald-300 font-display font-black text-lg">{totalHealth}</span>
                      {bonusHealth > 0 && (
                        <span className="text-[10px] text-emerald-400/80 font-bold">+{bonusHealth} gear</span>
                      )}
                    </div>
                  </div>

                  {/* Dodge Chance */}
                  <div className="bg-black/60 border border-cyan-500/25 p-3 rounded-2xl flex flex-col justify-between shadow-sm">
                    <div className="flex items-center justify-between text-gray-400 text-[10px] uppercase font-bold">
                      <span className="flex items-center gap-1 text-cyan-400"><Wind className="w-3.5 h-3.5 text-cyan-400" /> Dodge Chance</span>
                    </div>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-cyan-300 font-display font-black text-lg">{bonusDodge}%</span>
                      {bonusDodge > 0 && (
                        <span className="text-[10px] text-cyan-400/80 font-bold">+{bonusDodge}% gear</span>
                      )}
                    </div>
                  </div>

                  {/* Gold Bonus */}
                  <div className="bg-black/60 border border-amber-500/25 p-3 rounded-2xl flex flex-col justify-between shadow-sm">
                    <div className="flex items-center justify-between text-gray-400 text-[10px] uppercase font-bold">
                      <span className="flex items-center gap-1 text-amber-400"><Coins className="w-3.5 h-3.5 text-amber-400" /> Gold Gain</span>
                    </div>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-amber-300 font-display font-black text-lg">+{bonusGold}%</span>
                      {bonusGold > 0 && (
                        <span className="text-[10px] text-amber-400/80 font-bold">+{bonusGold}% gear</span>
                      )}
                    </div>
                  </div>

                  {/* Delay Reduction */}
                  <div className="bg-black/60 border border-purple-500/25 p-3 rounded-2xl flex flex-col justify-between shadow-sm">
                    <div className="flex items-center justify-between text-gray-400 text-[10px] uppercase font-bold">
                      <span className="flex items-center gap-1 text-purple-400"><Hourglass className="w-3.5 h-3.5 text-purple-400" /> Card Delay</span>
                    </div>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-purple-300 font-display font-black text-base">
                        {bonusDelay > 0 ? `-${bonusDelay} Turn` : 'Standard'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Equipped Relics Paperdoll Mannequin */}
            <div className="lg:col-span-7 bg-gradient-to-b from-[#18121a] via-[#120d15] to-[#0a070c] border border-purple-900/40 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.08),transparent_70%)] pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-purple-900/50 pb-3 mb-6 relative z-10">
                <h3 className="font-display font-black text-lg sm:text-xl text-purple-200 tracking-widest uppercase">
                  EQUIPPED RELICS & APPAREL
                </h3>
                <span className="text-[10px] font-mono text-gray-400">
                  Click a slot to equip or manage gear
                </span>
              </div>

              {/* Paperdoll Mannequin Grid */}
              <div className="flex items-center justify-center my-auto py-4 relative z-10">
                <div className="flex items-center justify-center gap-4 sm:gap-8 w-full max-w-lg">
                  
                  {/* Left Slots Column */}
                  <div className="flex flex-col gap-4">
                    {renderSlotBox('helmet', 'HELMET', '/icons/equipment/slot_helmet.png')}
                    {renderSlotBox('weapon', 'WEAPON', '/icons/equipment/slot_weapon.png')}
                    {renderSlotBox('ring', 'RING', '/icons/equipment/slot_ring.png')}
                  </div>

                  {/* Center Gothic Mannequin Silhouette */}
                  <div className="w-28 h-64 sm:w-36 sm:h-80 relative flex items-center justify-center">
                    <div className="w-full h-full bg-black/40 border border-purple-500/20 rounded-3xl flex items-center justify-center p-2 shadow-inner overflow-hidden">
                      <img 
                        src="/icons/equipment/lord_silhouette.png" 
                        alt="Lord Silhouette" 
                        className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(168,85,247,0.35)] opacity-85 hover:opacity-100 transition-opacity" 
                      />
                    </div>
                  </div>

                  {/* Right Slots Column */}
                  <div className="flex flex-col gap-4">
                    {renderSlotBox('amulet', 'AMULET', '/icons/equipment/slot_amulet.png')}
                    {renderSlotBox('armor', 'ARMOR', '/icons/equipment/slot_armor.png')}
                    {renderSlotBox('boots', 'BOOTS', '/icons/equipment/slot_boots.png')}
                  </div>

                </div>
              </div>

              {/* Active Selection / Quick Action Bar */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between relative z-10 text-xs font-mono">
                {selectedSlot ? (
                  <span className="text-purple-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Managing slot: <strong>{selectedSlot.toUpperCase()}</strong>
                  </span>
                ) : (
                  <span className="text-gray-500">Select any gear slot above to inspect and equip relics</span>
                )}

                {selectedSlot && profile.equipped?.[selectedSlot] && (
                  <button 
                    onClick={() => unequipItem(selectedSlot)}
                    className="bg-red-950/50 hover:bg-red-900/80 text-red-300 border border-red-500/40 px-4 py-1.5 rounded-xl font-display text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Unequip {selectedSlot}
                  </button>
                )}
              </div>
            </div>
          </div>
        
          {/* Inventory Item Selection Panel */}
          {renderInventoryList()}
        </div>
      ) : (
        <TalentsView />
      )}
    </div>
  );
};
