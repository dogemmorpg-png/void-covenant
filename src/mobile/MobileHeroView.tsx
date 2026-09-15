import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { EquipmentSlot } from '../types';
import { getEquipmentIcon } from '../data/equipment';
import { MobileTalentsView } from './MobileTalentsView';
import { Shield, Sword, Heart, Wind, Zap } from 'lucide-react';

interface MobileHeroViewProps {
  onNavigateToShop?: () => void;
}

export const MobileHeroView: React.FC<MobileHeroViewProps> = ({ onNavigateToShop }) => {
  const { profile, equipItem, unequipItem } = useGame();
  const [subTab, setSubTab] = useState<'equipment' | 'talents'>('equipment');
  const [selectedSlot, setSelectedSlot] = useState<EquipmentSlot | null>(null);

  const renderSlot = (slot: EquipmentSlot, label: string) => {
    const equippedId = profile.equipped?.[slot];
    const item = profile.equipment?.find(e => e.id === equippedId);
    
    return (
      <div 
        onClick={() => setSelectedSlot(slot)}
        className="w-14 h-14 rounded-xl border border-gray-700 bg-black/60 flex flex-col items-center justify-center p-1 cursor-pointer relative"
      >
        {item ? (
          <>
            <img src={getEquipmentIcon(item, slot)} className="w-8 h-8 object-contain" />
            <div className="text-[6px] font-mono text-center truncate w-full text-emerald-400 mt-0.5">+{item.bonusValue}</div>
          </>
        ) : (
          <div className="text-[8px] text-gray-500 uppercase">{label}</div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0c1015] text-white overflow-hidden relative">
      <div className="flex h-7 bg-black/40 border-b border-gray-800 shrink-0">
        <button onClick={() => setSubTab('equipment')} className={`flex-1 text-[9px] font-display font-bold uppercase tracking-wider ${subTab === 'equipment' ? 'bg-purple-950 border border-purple-500 text-purple-300' : 'text-gray-500'}`}>Relics</button>
        <button onClick={() => setSubTab('talents')} className={`flex-1 text-[9px] font-display font-bold uppercase tracking-wider ${subTab === 'talents' ? 'bg-amber-950 border border-amber-500 text-amber-300' : 'text-gray-500'}`}>Talents</button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {subTab === 'equipment' ? (
          <div className="w-full h-full flex">
            {/* Left: Paperdoll 40% */}
            <div className="w-[40%] h-full flex items-center justify-center p-2 relative bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.1),transparent_70%)] border-r border-gray-800">
               <div className="grid grid-cols-2 gap-2 relative z-10">
                 {renderSlot('helmet', 'HELM')}
                 {renderSlot('amulet', 'AMULET')}
                 {renderSlot('weapon', 'WEAPON')}
                 {renderSlot('armor', 'ARMOR')}
                 {renderSlot('ring', 'RING')}
                 {renderSlot('boots', 'BOOTS')}
               </div>
               <img src="/icons/equipment/lord_silhouette.png" className="absolute w-24 opacity-30 pointer-events-none" />
            </div>

            {/* Right: Stats or Inventory 60% */}
            <div className="w-[60%] h-full p-2 overflow-y-auto">
              {!selectedSlot ? (
                <div className="flex flex-col h-full bg-black/40 border border-gray-800 rounded-xl p-2">
                  <div className="text-[10px] font-display font-bold text-amber-300 mb-2 border-b border-gray-800 pb-1">BATTLE STATS</div>
                  <div className="space-y-1.5 font-mono text-[9px]">
                    <div className="flex justify-between"><span className="text-gray-400">Max HP</span><span className="text-emerald-400">{profile.heroMaxHealth || 30}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Exp</span><span className="text-purple-400">{profile.level}</span></div>
                  </div>
                  <div className="mt-auto text-[8px] text-gray-500 text-center uppercase">Select a slot to equip relics</div>
                </div>
              ) : (
                <div className="flex flex-col h-full bg-black/40 border border-purple-500/30 rounded-xl p-2">
                  <div className="flex justify-between items-center mb-2 border-b border-gray-800 pb-1">
                    <span className="text-[10px] font-display font-bold uppercase text-purple-300">{selectedSlot} INVENTORY</span>
                    <button onClick={() => setSelectedSlot(null)} className="text-[8px] bg-gray-800 px-1.5 py-0.5 rounded">BACK</button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 overflow-y-auto pb-4">
                    {(profile.equipment?.filter(e => e.slot === selectedSlot) || []).map(item => (
                      <div key={item.id} className="bg-black border border-gray-700 rounded p-1 flex flex-col items-center">
                        <img src={getEquipmentIcon(item, selectedSlot)} className="w-8 h-8 object-contain" />
                        <span className="text-[7px] text-center w-full truncate mt-0.5 text-gray-300">{item.name}</span>
                        {profile.equipped?.[selectedSlot] === item.id ? (
                          <button onClick={() => unequipItem(selectedSlot)} className="mt-1 w-full bg-red-900 text-white text-[7px] py-0.5 rounded">UNEQUIP</button>
                        ) : (
                          <button onClick={() => equipItem(selectedSlot, item.id)} className="mt-1 w-full bg-purple-900 text-white text-[7px] py-0.5 rounded">EQUIP</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <MobileTalentsView />
        )}
      </div>
    </div>
  );
};
