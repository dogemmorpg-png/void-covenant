import React, { useState, useEffect } from 'react';
import { 
  Swords, 
  Trophy, 
  FolderGit, 
  UserCircle2, 
  Store, 
  Crown, 
  Landmark, 
  Menu, 
  X, 
  Compass,
  ChevronRight,
  Sparkles
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
  const [isOpen, setIsOpen] = useState(false);

  // Dynamic bottom inset detection for Telegram WebApp and Android navigation buttons
  const [bottomInset, setBottomInset] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const tg = (window as any).Telegram?.WebApp;
        if (tg) {
          const inset = tg.safeAreaInset?.bottom ?? tg.contentSafeAreaInset?.bottom;
          if (typeof inset === 'number' && inset > 0) return Math.max(26, inset + 8);
        }
      } catch {}
    }
    return 26; // Safe clearance above Android 3-button navigation bar
  });

  useEffect(() => {
    const tg = typeof window !== 'undefined' ? (window as any).Telegram?.WebApp : null;
    if (tg) {
      const checkInset = () => {
        try {
          const inset = tg.safeAreaInset?.bottom ?? tg.contentSafeAreaInset?.bottom;
          if (typeof inset === 'number' && inset > 0) {
            setBottomInset(Math.max(26, inset + 8));
          } else {
            setBottomInset(26);
          }
        } catch {}
      };
      checkInset();
      try {
        tg.onEvent?.('viewportChanged', checkInset);
      } catch {}
      return () => {
        try {
          tg.offEvent?.('viewportChanged', checkInset);
        } catch {}
      };
    }
  }, []);

  const menuItems = [
    {
      id: 'campaign' as MobileTab,
      label: 'Campaign',
      icon: Swords,
      color: 'text-emerald-400',
      activeColor: 'text-emerald-300',
      border: 'border-emerald-500/50',
      bg: 'from-emerald-950/50 to-black/80',
      shadow: 'shadow-[0_0_10px_rgba(16,185,129,0.3)]',
      badge: null,
      badgeColor: '',
    },
    {
      id: 'pvp' as MobileTab,
      label: 'Arena',
      icon: Trophy,
      color: 'text-rose-400',
      activeColor: 'text-rose-300',
      border: 'border-rose-500/50',
      bg: 'from-rose-950/50 to-black/80',
      shadow: 'shadow-[0_0_10px_rgba(244,63,94,0.3)]',
      badge: hasNewDefenseAttacks ? '!' : null,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'collection' as MobileTab,
      label: 'Cards',
      icon: FolderGit,
      color: 'text-amber-400',
      activeColor: 'text-amber-300',
      border: 'border-amber-500/50',
      bg: 'from-amber-950/50 to-black/80',
      shadow: 'shadow-[0_0_10px_rgba(245,158,11,0.3)]',
      badge: deckCount !== undefined ? `${deckCount}` : null,
      badgeColor: 'bg-amber-500/30 text-amber-300 border border-amber-500/40',
    },
    {
      id: 'hero' as MobileTab,
      label: 'Lord',
      icon: UserCircle2,
      color: 'text-yellow-400',
      activeColor: 'text-yellow-300',
      border: 'border-yellow-500/50',
      bg: 'from-yellow-950/50 to-black/80',
      shadow: 'shadow-[0_0_10px_rgba(234,179,8,0.3)]',
      badge: null,
      badgeColor: '',
    },
    {
      id: 'altar' as MobileTab,
      label: 'Altar',
      icon: Store,
      color: 'text-purple-400',
      activeColor: 'text-purple-300',
      border: 'border-purple-500/50',
      bg: 'from-purple-950/50 to-black/80',
      shadow: 'shadow-[0_0_10px_rgba(168,85,247,0.3)]',
      badge: null,
      badgeColor: '',
    },
    {
      id: 'premium' as MobileTab,
      label: 'Pass',
      icon: Crown,
      color: 'text-yellow-300',
      activeColor: 'text-yellow-200',
      border: 'border-yellow-400/50',
      bg: 'from-yellow-950/50 to-black/80',
      shadow: 'shadow-[0_0_10px_rgba(250,204,21,0.3)]',
      badge: null,
      badgeColor: '',
    },
    {
      id: 'bank' as MobileTab,
      label: 'Bank',
      icon: Landmark,
      color: 'text-cyan-400',
      activeColor: 'text-cyan-300',
      border: 'border-cyan-500/50',
      bg: 'from-cyan-950/50 to-black/80',
      shadow: 'shadow-[0_0_10px_rgba(6,182,212,0.3)]',
      badge: null,
      badgeColor: '',
    },
  ];

  return (
    <nav 
      style={{
        paddingBottom: `max(${bottomInset}px, calc(env(safe-area-inset-bottom, 0px) + 12px))`
      }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#0c0e14]/98 backdrop-blur-lg border-t border-white/10 select-none shadow-[0_-8px_30px_rgba(0,0,0,0.9)]"
    >
      <div className="max-w-md mx-auto grid grid-cols-7 px-1 pt-1 pb-0.5">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer active:scale-95 relative min-w-0 ${
                isActive
                  ? `bg-gradient-to-b ${item.bg} border ${item.border} ${item.shadow} ${item.activeColor}`
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isActive ? `${item.color} drop-shadow-[0_0_6px_currentColor]` : ''}`} />
                {item.badge && (
                  <span className={`absolute -top-1.5 -right-2 text-[7px] font-mono font-black px-0.5 rounded-full ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`font-display font-bold text-[7.5px] sm:text-[8.5px] tracking-tight uppercase mt-0.5 truncate max-w-full ${
                isActive ? item.activeColor : 'text-zinc-400'
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

