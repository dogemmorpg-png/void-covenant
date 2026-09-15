import React from 'react';
import { Swords, Trophy, FolderGit, UserCircle2, Store, Crown, Landmark } from 'lucide-react';

interface MobileNavBarProps {
  activeTab: 'campaign' | 'pvp' | 'collection' | 'hero' | 'altar' | 'premium' | 'bank';
  onTabChange: (tab: string) => void;
  hasNewDefenseAttacks?: boolean;
}

export const MobileNavBar: React.FC<MobileNavBarProps> = ({ activeTab, onTabChange, hasNewDefenseAttacks }) => {
  const tabs = [
    { id: 'campaign', label: 'CAMPAIGN', icon: Swords, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400' },
    { id: 'pvp', label: 'ARENA', icon: Trophy, color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400' },
    { id: 'collection', label: 'CARDS', icon: FolderGit, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400' },
    { id: 'hero', label: 'LORD', icon: UserCircle2, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400' },
    { id: 'altar', label: 'SHOP', icon: Store, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400' },
    { id: 'premium', label: 'PREMIUM', icon: Crown, color: 'text-yellow-300', bg: 'bg-yellow-300/10', border: 'border-yellow-300' },
    { id: 'bank', label: 'BANK', icon: Landmark, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400' },
  ] as const;

  return (
    <div className="h-[44px] bg-[#0c0e14]/95 border-t border-[#c5a880]/20 backdrop-blur-md flex items-center justify-between sticky bottom-0">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const isArena = tab.id === 'pvp';
        const isPremium = tab.id === 'premium';

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center min-w-[44px] min-h-[44px] h-full relative transition-colors duration-200
              ${isActive ? `${tab.bg} border-t-2 ${tab.border}` : 'text-gray-400 hover:bg-white/5 border-t-2 border-transparent'}`}
          >
            <div className="relative mb-0.5">
              <tab.icon className={`w-[18px] h-[18px] ${isActive ? tab.color : 'text-gray-400'}`} />
              
              {isArena && hasNewDefenseAttacks && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-[#0c0e14]" />
              )}
              
              {isPremium && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500 border border-[#0c0e14]"></span>
                </span>
              )}
            </div>
            
            <span className={`text-[8px] font-display font-bold tracking-wider uppercase ${isActive ? tab.color : 'text-gray-500'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
