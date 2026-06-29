import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Equipment, EquipmentSlot } from '../types';
import { Shield, Sword, Skull, Gem, Flame, UserCircle2 } from 'lucide-react';

export const HeroInventoryView: React.FC = () => {
  const { profile, equipItem, unequipItem } = useGame();
  
  const [selectedSlot, setSelectedSlot] = useState<EquipmentSlot | null>(null);

  const getSlotIcon = (slot: EquipmentSlot) => {
    switch(slot) {
      case 'weapon': return <Sword className="w-5 h-5 text-gray-400" />;
      case 'armor': return <Shield className="w-5 h-5 text-gray-400" />;
      case 'helmet': return <Skull className="w-5 h-5 text-gray-400" />;
      case 'amulet': return <Gem className="w-5 h-5 text-gray-400" />;
      case 'ring': return <Gem className="w-5 h-5 text-gray-400" />;
      case 'boots': return <Flame className="w-5 h-5 text-gray-400" />;
    }
  };

  const renderEquipmentBox = (item: Equipment | null, slot: EquipmentSlot) => {
    return (
      <div 
        onClick={() => setSelectedSlot(selectedSlot === slot ? null : slot)}
        className={`w-20 h-20 bg-black/60 border rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
          selectedSlot === slot ? 'border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' :
          item ? 'border-[#ebd09b]/40 hover:border-[#ebd09b]' : 'border-white/10 hover:border-white/30'
        }`}
      >
        {item ? (
          <>
            <div className={`text-[9px] font-bold uppercase tracking-wider mb-1 ${
              item.tier === 'legendary' ? 'text-orange-500' :
              item.tier === 'gold' ? 'text-yellow-400' :
              item.tier === 'silver' ? 'text-slate-300' : 'text-stone-400'
            }`}>
              {item.tier}
            </div>
            {getSlotIcon(slot)}
            <div className="text-[8px] text-gray-300 font-mono mt-1 text-center px-1 truncate w-full">
              {item.name}
            </div>
          </>
        ) : (
          <>
            {getSlotIcon(slot)}
            <span className="text-[9px] font-mono text-gray-500 mt-2 uppercase">{slot}</span>
          </>
        )}
      </div>
    );
  };

  const renderInventoryList = () => {
    if (!selectedSlot) return null;
    const inventoryItems = profile.equipment.filter(e => e.slot === selectedSlot && profile.equipped[selectedSlot] !== e.id);

    return (
      <div className="mt-8 bg-black/40 border border-white/5 rounded-2xl p-6">
        <h4 className="font-display font-bold text-white text-lg mb-4 flex items-center gap-2">
          {getSlotIcon(selectedSlot)} AVAILABLE {selectedSlot.toUpperCase()}
        </h4>
        {inventoryItems.length === 0 ? (
          <p className="text-sm text-gray-500 font-mono text-center py-4">No available equipment for this slot.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {inventoryItems.map(item => (
              <div key={item.id} className="bg-[#151a21] border border-white/10 p-3 rounded-xl flex flex-col justify-between">
                <div>
                  <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
                    item.tier === 'legendary' ? 'text-orange-500' :
                    item.tier === 'gold' ? 'text-yellow-400' :
                    item.tier === 'silver' ? 'text-slate-300' : 'text-stone-400'
                  }`}>
                    {item.tier}
                  </div>
                  <h5 className="font-display font-bold text-sm text-white mb-1">{item.name}</h5>
                  <p className="text-xs text-emerald-400 font-mono">+{item.bonusValue} {item.bonusType}</p>
                </div>
                <button
                  onClick={() => equipItem(selectedSlot, item.id)}
                  className="mt-3 bg-purple-900/50 hover:bg-purple-900 text-purple-200 border border-purple-500/50 rounded py-1 text-xs font-bold font-mono transition-all"
                >
                  EQUIP
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Calculate current required exp
  const getRequiredExpForLevel = (level: number) => Math.floor(100 * Math.pow(1.2, level - 1));
  const reqExp = getRequiredExpForLevel(profile.level);
  const expPercent = Math.min(100, Math.floor((profile.exp / reqExp) * 100));

  // Get equipped items
  const eqWeapon = profile.equipment.find(e => e.id === profile.equipped['weapon']) || null;
  const eqArmor = profile.equipment.find(e => e.id === profile.equipped['armor']) || null;
  const eqHelmet = profile.equipment.find(e => e.id === profile.equipped['helmet']) || null;
  const eqAmulet = profile.equipment.find(e => e.id === profile.equipped['amulet']) || null;
  const eqRing = profile.equipment.find(e => e.id === profile.equipped['ring']) || null;
  const eqBoots = profile.equipment.find(e => e.id === profile.equipped['boots']) || null;

  // Calculate total bonuses
  let bonusMaxHealth = 0;
  [eqWeapon, eqArmor, eqHelmet, eqAmulet, eqRing, eqBoots].forEach(item => {
    if (item && item.bonusType === 'maxHealth') bonusMaxHealth += item.bonusValue;
  });

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <h2 className="font-display font-black text-3xl md:text-4xl text-white tracking-widest text-shadow-gold">
          LORD PROFILE
        </h2>
        <p className="text-sm text-gray-400 font-sans max-w-xl mx-auto">
          Equip powerful relics and inspect your combat prowess.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Stats Panel */}
        <div className="md:col-span-5 bg-[#151a21] border border-[#c5a880]/30 rounded-3xl p-6 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-b from-purple-900 to-black border-2 border-[#ebd09b] flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(235,208,155,0.2)]">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
            ) : (
              <UserCircle2 className="w-12 h-12 text-[#ebd09b]" />
            )}
          </div>
          
          <h3 className="font-display font-black text-2xl text-white tracking-widest mb-1 text-center">
            {profile.username || 'Abyssal Lord'}
          </h3>
          <div className="text-[#ebd09b] font-mono text-sm font-bold bg-[#ebd09b]/10 px-3 py-1 rounded-full mb-6">
            LEVEL {profile.level}
          </div>

          <div className="w-full space-y-4 font-mono text-sm">
            {/* EXP Bar */}
            <div>
              <div className="flex justify-between text-gray-400 text-[10px] uppercase font-bold mb-1">
                <span>EXP</span>
                <span>{Math.floor(profile.exp)} / {reqExp}</span>
              </div>
              <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-white/10">
                <div className="h-full bg-emerald-500" style={{ width: `${expPercent}%` }} />
              </div>
            </div>

            {/* Stats */}
            <div className="bg-black/50 p-4 rounded-xl border border-white/5 space-y-3 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Max Health</span>
                <span className="text-emerald-400 font-bold">
                  {profile.heroMaxHealth} <span className="text-emerald-500/50 text-xs">+{bonusMaxHealth}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Equipment Panel */}
        <div className="md:col-span-7 bg-[#151a21] border border-purple-900/30 rounded-3xl p-6 relative overflow-hidden gothic-glow-purple">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.05),transparent_70%)] pointer-events-none" />
          
          <h3 className="font-display font-black text-xl text-purple-300 tracking-widest mb-6 text-center border-b border-purple-900/50 pb-4">
            EQUIPPED RELICS
          </h3>

          <div className="flex justify-center items-center h-64 relative">
            {/* Center Avatar silhouette or logo */}
            <div className="w-24 h-32 bg-black/40 border border-white/5 rounded-xl absolute flex items-center justify-center">
              <UserCircle2 className="w-12 h-12 text-gray-700" />
            </div>

            {/* Equipment Grid Layout */}
            <div className="grid grid-cols-2 gap-x-28 gap-y-4 absolute z-10">
              <div className="flex flex-col gap-4">
                {renderEquipmentBox(eqHelmet, 'helmet')}
                {renderEquipmentBox(eqWeapon, 'weapon')}
                {renderEquipmentBox(eqRing, 'ring')}
              </div>
              <div className="flex flex-col gap-4">
                {renderEquipmentBox(eqAmulet, 'amulet')}
                {renderEquipmentBox(eqArmor, 'armor')}
                {renderEquipmentBox(eqBoots, 'boots')}
              </div>
            </div>
          </div>

          {selectedSlot && profile.equipped[selectedSlot] && (
            <div className="mt-8 flex justify-center">
              <button 
                onClick={() => unequipItem(selectedSlot)}
                className="bg-red-900/40 hover:bg-red-900/80 text-red-400 border border-red-500/30 px-6 py-2 rounded-lg font-mono text-xs uppercase tracking-widest transition-all"
              >
                Unequip {selectedSlot}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Inventory Panel */}
      {renderInventoryList()}

    </div>
  );
};
