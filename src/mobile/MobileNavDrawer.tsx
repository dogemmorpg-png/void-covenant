import React, { useState, useEffect } from 'react';
import { 
  Swords, 
  Trophy, 
  FolderGit, 
  UserCircle2, 
  Store, 
  Crown, 
  Landmark 
} from 'lucide-react';

export type MobileTab = 'campaign' | 'pvp' | 'collection' | 'hero' | 'altar' | 'bank' | 'premium';

interface MobileNavDrawerProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  hasNewDefenseAttacks?: boolean;
  deckCount?: number;
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({
  activeTab,
  onTabChange,
  hasNewDefenseAttacks,
  deckCount = 10,
}) => {
  const menuItems = [
    {
      id: 'campaign' as MobileTab,
      label: 'CAMPAIGN',
      icon: Swords,
      color: 'text-emerald-400',
      activeColor: 'text-emerald-300',
      inactiveColor: 'text-emerald-400',
      inactiveLabel: 'text-emerald-300',
      border: 'border-emerald-500/40',
      bg: 'from-emerald-950/40 via-black/60 to-black/80',
      shadow: 'shadow-[0_0_12px_rgba(16,185,129,0.25)]',
      badge: null,
      badgeColor: '',
    },
    {
      id: 'pvp' as MobileTab,
      label: 'ARENA',
      icon: Trophy,
      color: 'text-rose-400',
      activeColor: 'text-rose-300',
      inactiveColor: 'text-rose-400',
      inactiveLabel: 'text-rose-300',
      border: 'border-rose-500/40',
      bg: 'from-rose-950/40 via-black/60 to-black/80',
      shadow: 'shadow-[0_0_12px_rgba(244,63,94,0.25)]',
      badge: null,
      badgeColor: '',
    },
    {
      id: 'collection' as MobileTab,
      label: 'CARDS',
      icon: FolderGit,
      color: 'text-[#ebd09b]',
      activeColor: 'text-[#ebd09b]',
      inactiveColor: 'text-gray-400',
      inactiveLabel: 'text-gray-400',
      border: 'border-[#c5a880]/40',
      bg: 'from-[#221a12]/60 via-black/60 to-black/80',
      shadow: 'shadow-[0_0_12px_rgba(197,168,128,0.25)]',
      badge: null,
      badgeColor: '',
    },
    {
      id: 'hero' as MobileTab,
      label: 'LORD',
      icon: UserCircle2,
      color: 'text-[#ebd09b]',
      activeColor: 'text-[#ebd09b]',
      inactiveColor: 'text-gray-400',
      inactiveLabel: 'text-gray-400',
      border: 'border-[#c5a880]/40',
      bg: 'from-[#221a12]/60 via-black/60 to-black/80',
      shadow: 'shadow-[0_0_12px_rgba(197,168,128,0.25)]',
      badge: null,
      badgeColor: '',
    },
    {
      id: 'altar' as MobileTab,
      label: 'SHOP',
      icon: Store,
      color: 'text-purple-400',
      activeColor: 'text-purple-300',
      inactiveColor: 'text-purple-400',
      inactiveLabel: 'text-purple-300',
      border: 'border-purple-500/40',
      bg: 'from-purple-950/40 via-black/60 to-black/80',
      shadow: 'shadow-[0_0_12px_rgba(168,85,247,0.25)]',
      badge: null,
      badgeColor: '',
    },
    {
      id: 'premium' as MobileTab,
      label: 'PREMIUM',
      icon: Crown,
      color: 'text-yellow-300',
      activeColor: 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-400 font-black',
      inactiveColor: 'text-yellow-300',
      inactiveLabel: 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-400 font-black',
      border: 'border-yellow-400/60',
      bg: 'from-amber-500/20 via-yellow-500/10 to-black/70',
      shadow: 'shadow-[0_0_16px_rgba(250,204,21,0.4)]',
      badge: null,
      badgeColor: '',
    },
    {
      id: 'bank' as MobileTab,
      label: 'BANK',
      icon: Landmark,
      color: 'text-amber-400',
      activeColor: 'text-amber-300',
      inactiveColor: 'text-amber-400',
      inactiveLabel: 'text-amber-300',
      border: 'border-amber-500/40',
      bg: 'from-amber-950/40 via-black/60 to-black/80',
      shadow: 'shadow-[0_0_12px_rgba(245,158,11,0.25)]',
      badge: null,
      badgeColor: '',
    },
  ];

  const isTelegramUser = typeof window !== 'undefined' && Boolean(
    (window as any).Telegram?.WebApp?.initData ||
    /Telegram/i.test(navigator.userAgent || '')
  );

  return (
    <nav 
      style={{
        paddingBottom: isTelegramUser ? 'max(var(--safe-bottom, 0px), 4px)' : '4px'
      }}
      className="shrink-0 w-full z-40 bg-[#151a21]/98 backdrop-blur-md border-t border-[#c5a880]/25 select-none shadow-[0_-8px_30px_rgba(0,0,0,0.95)]"
    >
      <div className="max-w-md mx-auto grid grid-cols-7 px-1 pt-1 pb-0.5">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          const isArena = item.id === 'pvp';
          const isPremium = item.id === 'premium';
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer active:scale-95 relative min-w-0 ${
                isActive
                  ? `bg-black/50 bg-gradient-to-b ${item.bg} border ${item.border} ${item.shadow} opacity-100`
                  : 'hover:opacity-100 opacity-80 border border-transparent'
              }`}
            >
              <div className="relative">
                <Icon 
                  className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-all ${
                    isActive 
                      ? `${item.color} ${isPremium ? 'drop-shadow-[0_0_8px_rgba(250,204,21,0.7)] animate-pulse' : 'drop-shadow-[0_0_6px_currentColor]'}` 
                      : `${item.inactiveColor} ${isPremium ? 'drop-shadow-[0_0_6px_rgba(250,204,21,0.5)] animate-pulse' : ''}`
                  }`} 
                />
                
                {/* PC-matching Arena Defense Attacks Ping Badge */}
                {isArena && hasNewDefenseAttacks && (
                  <span className="absolute -top-1 -right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.9)]"></span>
                  </span>
                )}

                {/* PC-matching Premium VIP Pulse Badge */}
                {isPremium && (
                  <span className="absolute -top-1 -right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400 shadow-[0_0_6px_rgba(250,204,21,0.9)]"></span>
                  </span>
                )}

                {/* Deck Card Count Pill Badge */}
                {item.badge && (
                  <span className={`absolute -top-1.5 -right-2 text-[7px] font-mono font-black px-1 rounded-full ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </div>

              <span className={`font-display font-bold text-[7px] min-[360px]:text-[7.5px] sm:text-[8.5px] tracking-tight uppercase mt-0.5 whitespace-nowrap leading-tight ${
                isActive ? item.activeColor : item.inactiveLabel
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavDrawer;


