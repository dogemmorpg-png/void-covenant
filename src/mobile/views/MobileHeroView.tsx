import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Equipment, EquipmentSlot, CardTier } from '../../types';
import { getEquipmentIcon, calculateEquipmentSetBonuses } from '../../data/equipment';
import { TalentsView } from '../../components/TalentsView';
import { Shield, Sparkles, Check, X, ArrowRight } from 'lucide-react';
import { VoidStrikeIcon, BloodAuraIcon, WarlordCryIcon } from '../../components/SkillAndStanceIcons';

const SLOTS_CONFIG: { slot: EquipmentSlot; label: string; iconPath: string }[] = [
  { slot: 'helmet', label: 'HELMET', iconPath: '/icons/equipment/slot_helmet.png' },
  { slot: 'weapon', label: 'WEAPON', iconPath: '/icons/equipment/slot_weapon.png' },
  { slot: 'armor', label: 'ARMOR', iconPath: '/icons/equipment/slot_armor.png' },
  { slot: 'boots', label: 'BOOTS', iconPath: '/icons/equipment/slot_boots.png' },
  { slot: 'ring', label: 'RING', iconPath: '/icons/equipment/slot_ring.png' },
  { slot: 'amulet', label: 'AMULET', iconPath: '/icons/equipment/slot_amulet.png' },
];

const TIER_BORDER: Record<CardTier, string> = {
  bronze: 'border-amber-700/60',
  silver: 'border-slate-400/60',
  gold: 'border-amber-400',
  legendary: 'border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]',
  divine: 'border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]'
};

interface MobileHeroViewProps {
  onNavigateToShop?: (tab?: 'cards' | 'equipment' | 'divine') => void;
}

export const MobileHeroView: React.FC<MobileHeroViewProps> = ({ onNavigateToShop }) => {
  const { profile, equipItem, unequipItem, updateProfile } = useGame();
  const [activeSubTab, setActiveSubTab] = useState<'equipment' | 'talents'>('equipment');
  const [selectedSlot, setSelectedSlot] = useState<EquipmentSlot | null>(null);

  // Equipped list
  const equippedList = Object.values(profile.equipped || {})
    .map(eqId => profile.equipment?.find(e => e.id === eqId))
    .filter(Boolean) as Equipment[];

  const setBonuses = calculateEquipmentSetBonuses(equippedList);
  const demiurgeSet = setBonuses.find(s => s.setId === 'demiurge');

  const stanceOptions = [
    { id: 'void_strike', label: 'Void Strike', icon: <VoidStrikeIcon sizeClass="w-4 h-4" />, color: 'text-cyan-400' },
    { id: 'blood_aura', label: 'Blood Aura', icon: <BloodAuraIcon sizeClass="w-4 h-4" />, color: 'text-rose-400' },
    { id: 'warlord_cry', label: "Warlord's Cry", icon: <WarlordCryIcon sizeClass="w-4 h-4" />, color: 'text-amber-400' },
  ];

  // Inventory items for selected slot (or all)
  const inventoryItems = (profile.equipment || []).filter(e => {
    if (selectedSlot) return e.slot === selectedSlot;
    return true;
  });

  return (
    <div className="h-full w-full flex p-1.5 sm:p-2 gap-2 select-none overflow-hidden font-sans">
      {/* LEFT PANEL: LORD PAPERDOLL & STANCES (44% width) */}
      <div className="w-[44%] max-w-[360px] bg-gradient-to-b from-[#140e0c]/90 via-[#0a0705]/95 to-[#050403] border border-[#ebd09b]/25 rounded-xl p-2 flex flex-col justify-between shadow-xl shrink-0">
        {/* Lord Header: Avatar + Level */}
        <div className="flex items-center gap-2 pb-1.5 border-b border-white/10 shrink-0">
          <div className="w-10 h-10 rounded-full border-2 border-amber-400/80 bg-black overflow-hidden shrink-0">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <Shield className="w-5 h-5 text-amber-400 m-auto mt-2" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="font-display font-black text-xs text-white truncate">{profile.username || 'Lord'}</h3>
              <span className="text-[8px] font-mono bg-amber-500/20 border border-amber-500/40 text-amber-300 px-1 rounded font-bold">
                Lv.{profile.level || 1}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[8px] font-mono text-gray-400 mt-0.5">
              <span className="text-emerald-400 font-bold">❤️ HP: {profile.heroMaxHealth || 30}</span>
              {demiurgeSet && (
                <span className="text-purple-400 font-bold">👑 Demiurge ({demiurgeSet.piecesCount}/4)</span>
              )}
            </div>
          </div>
        </div>

        {/* 6 Equipment Slots Grid */}
        <div className="grid grid-cols-3 gap-1.5 my-1">
          {SLOTS_CONFIG.map(({ slot, label, iconPath }) => {
            const equippedId = profile.equipped?.[slot];
            const item = profile.equipment?.find(e => e.id === equippedId);
            const isSelected = selectedSlot === slot;
            return (
              <div
                key={slot}
                onClick={() => setSelectedSlot(isSelected ? null : slot)}
                className={`h-14 rounded-lg border bg-black/60 p-1 flex flex-col items-center justify-between cursor-pointer transition-all ${
                  isSelected
                    ? 'border-cyan-400 ring-2 ring-cyan-400/50 bg-cyan-950/30'
                    : item 
                      ? `${TIER_BORDER[item.tier]} bg-white/5` 
                      : 'border-white/10 hover:border-white/30'
                }`}
              >
                <div className="w-full flex justify-between text-[7px] font-mono text-gray-400 leading-none">
                  <span className="font-bold uppercase">{label}</span>
                  {item && <span className="text-amber-400 font-bold">{item.tier[0].toUpperCase()}</span>}
                </div>
                <div className="w-6 h-6 flex items-center justify-center">
                  <img src={item ? getEquipmentIcon(item, slot) : iconPath} alt="" className="w-full h-full object-contain" />
                </div>
                <div className="text-[7px] font-mono text-emerald-400 truncate w-full text-center leading-none">
                  {item ? `+${item.bonusValue} ${item.bonusType.slice(0, 4)}` : 'Empty'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Stance Selector */}
        <div className="pt-1.5 border-t border-white/10 shrink-0">
          <span className="text-[8px] font-mono text-gray-400 uppercase font-bold block mb-1">Combat Stance</span>
          <div className="grid grid-cols-3 gap-1">
            {stanceOptions.map(st => {
              const isActive = (profile.activeStance || 'void_strike') === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => updateProfile({ ...profile, activeStance: st.id as any })}
                  className={`py-1 px-1 rounded-lg border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm' 
                      : 'bg-black/40 border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  {st.icon}
                  <span className="text-[8px] font-display font-bold uppercase truncate">{st.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: INVENTORY ITEMS / TALENTS (56% width) */}
      <div className="flex-1 bg-gradient-to-b from-[#140e0c]/90 via-[#0a0705]/95 to-[#050403] border border-[#ebd09b]/25 rounded-xl p-2 flex flex-col justify-between shadow-xl min-w-0">
        {/* Mode Switch Header */}
        <div className="flex items-center justify-between pb-1.5 border-b border-white/10 shrink-0">
          <div className="flex bg-black/60 p-0.5 rounded-lg border border-white/10">
            <button
              onClick={() => setActiveSubTab('equipment')}
              className={`px-3 py-0.5 rounded text-[9px] font-display font-bold uppercase transition-all cursor-pointer ${
                activeSubTab === 'equipment' ? 'bg-[#ebd09b] text-black shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              INVENTORY {selectedSlot && `(${selectedSlot.toUpperCase()})`}
            </button>
            <button
              onClick={() => setActiveSubTab('talents')}
              className={`px-3 py-0.5 rounded text-[9px] font-display font-bold uppercase transition-all cursor-pointer ${
                activeSubTab === 'talents' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              TALENT TREE
            </button>
          </div>

          {selectedSlot && activeSubTab === 'equipment' && (
            <button
              onClick={() => setSelectedSlot(null)}
              className="text-[8px] font-mono text-gray-400 hover:text-white flex items-center gap-0.5 cursor-pointer"
            >
              <X className="w-2.5 h-2.5" /> SHOW ALL
            </button>
          )}
        </div>

        {/* SubTab Content */}
        {activeSubTab === 'equipment' ? (
          <div className="flex-1 overflow-y-auto no-scrollbar py-1">
            {inventoryItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4 text-gray-500 font-mono text-[9px]">
                <span>No equipment found {selectedSlot && `for ${selectedSlot}`}.</span>
                <button
                  onClick={() => onNavigateToShop?.('equipment')}
                  className="mt-2 px-3 py-1 bg-amber-500/20 border border-amber-400 text-amber-300 rounded font-display font-bold text-[9px] uppercase cursor-pointer"
                >
                  Open Chests in Shop
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {inventoryItems.map((item) => {
                  const isEquipped = profile.equipped?.[item.slot] === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`p-1.5 rounded-lg border bg-black/60 flex flex-col justify-between ${
                        isEquipped ? 'border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : TIER_BORDER[item.tier]
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <div className="w-7 h-7 rounded border border-white/10 bg-gray-900 p-0.5 shrink-0 flex items-center justify-center">
                          <img src={getEquipmentIcon(item, item.slot)} alt="" className="w-full h-full object-contain" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-display font-bold text-[9.5px] text-white truncate leading-none">
                            {item.name}
                          </h4>
                          <span className="text-[8px] font-mono text-amber-400 uppercase font-bold">
                            {item.tier} {item.slot}
                          </span>
                        </div>
                      </div>

                      <div className="my-1 text-[8.5px] font-mono text-emerald-300 font-bold leading-tight">
                        +{item.bonusValue} {item.bonusType}
                        {item.secondaryBonusValue && ` | +${item.secondaryBonusValue} ${item.secondaryBonusType}`}
                      </div>

                      <button
                        onClick={() => isEquipped ? unequipItem(item.slot) : equipItem(item.id)}
                        className={`w-full py-0.5 rounded font-display font-black text-[8px] uppercase tracking-wider transition-all cursor-pointer ${
                          isEquipped
                            ? 'bg-red-950/60 border border-red-500/50 text-red-300 hover:bg-red-900/60'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-black'
                        }`}
                      >
                        {isEquipped ? 'UNEQUIP' : 'EQUIP'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* TALENTS TAB */
          <div className="flex-1 overflow-y-auto no-scrollbar py-1">
            <TalentsView />
          </div>
        )}
      </div>
    </div>
  );
};
