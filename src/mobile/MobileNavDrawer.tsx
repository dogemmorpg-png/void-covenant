import React, { useState } from 'react';
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

  const menuItems = [
    {
      id: 'campaign' as MobileTab,
      label: 'Campaign',
      sublabel: 'Abyssal Spire & Floors',
      icon: Swords,
      color: 'text-emerald-400',
      border: 'border-emerald-500/40',
      bg: 'from-emerald-950/40 to-black/80',
      badge: null,
    },
    {
      id: 'pvp' as MobileTab,
      label: 'PvP Arena',
      sublabel: 'Ranked Duels & Crowns',
      icon: Trophy,
      color: 'text-rose-400',
      border: 'border-rose-500/40',
      bg: 'from-rose-950/40 to-black/80',
      badge: hasNewDefenseAttacks ? 'NEW DUEL' : null,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'collection' as MobileTab,
      label: 'Cards & Deck',
      sublabel: 'Collection & Fusion',
      icon: FolderGit,
      color: 'text-amber-400',
      border: 'border-amber-500/40',
      bg: 'from-amber-950/40 to-black/80',
      badge: `${deckCount}/10`,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
    },
    {
      id: 'hero' as MobileTab,
      label: 'Lord & Gear',
      sublabel: 'Talents & Equipment',
      icon: UserCircle2,
      color: 'text-yellow-400',
      border: 'border-yellow-500/40',
      bg: 'from-yellow-950/40 to-black/80',
      badge: null,
    },
    {
      id: 'altar' as MobileTab,
      label: 'Altar & Shop',
      sublabel: 'Summon & Dark Shards',
      icon: Store,
      color: 'text-purple-400',
      border: 'border-purple-500/40',
      bg: 'from-purple-950/40 to-black/80',
      badge: null,
    },
    {
      id: 'premium' as MobileTab,
      label: 'Battle Pass',
      sublabel: 'Seasonal Pass Spoils',
      icon: Crown,
      color: 'text-yellow-300',
      border: 'border-yellow-400/50',
      bg: 'from-yellow-950/50 to-black/80',
      badge: 'PRO',
      badgeColor: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black',
    },
    {
      id: 'bank' as MobileTab,
      label: 'Bank & Treasury',
      sublabel: 'Sovereigns & Dividends',
      icon: Landmark,
      color: 'text-cyan-400',
      border: 'border-cyan-500/40',
      bg: 'from-cyan-950/40 to-black/80',
      badge: null,
    },
  ];

  const [bottomInset, setBottomInset] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        const inset = tg.safeAreaInset?.bottom ?? tg.contentSafeAreaInset?.bottom;
        if (typeof inset === 'number' && inset > 0) return inset + 2;
        return 14; // Standard Android system navigation buttons clearance
      }
    }
    return 8;
  });

  useEffect(() => {
    const tg = typeof window !== 'undefined' ? (window as any).Telegram?.WebApp : null;
    if (tg) {
      const checkInset = () => {
        const inset = tg.safeAreaInset?.bottom ?? tg.contentSafeAreaInset?.bottom;
        if (typeof inset === 'number' && inset > 0) {
          setBottomInset(inset + 2);
        } else {
          setBottomInset(14);
        }
      };
      checkInset();
      tg.onEvent?.('viewportChanged', checkInset);
      return () => {
        tg.offEvent?.('viewportChanged', checkInset);
      };
    }
  }, []);

  const currentItem = menuItems.find(i => i.id === activeTab) || menuItems[0];

  const handleSelect = (tab: MobileTab) => {
    onTabChange(tab);
    setIsOpen(false);
  };

  return (
    <>
      {/* =========================================================================
          1. DOCKED MOBILE BOTTOM NAVIGATION BAR (Safe from phone Back button)
         ========================================================================= */}
      <nav 
        style={{
          paddingBottom: `max(${bottomInset}px, env(safe-area-inset-bottom, ${bottomInset}px))`
        }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#0c0e14]/98 backdrop-blur-lg border-t border-white/10 select-none shadow-[0_-8px_30px_rgba(0,0,0,0.9)]"
      >
        <div className="max-w-md mx-auto grid grid-cols-5 px-1 pt-1 pb-0.5">
          {/* Tab 1: Campaign */}
          <button
            onClick={() => onTabChange('campaign')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
              activeTab === 'campaign'
                ? 'bg-emerald-950/40 border border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.25)] text-emerald-300'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Swords className={`w-4 h-4 ${activeTab === 'campaign' ? 'text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.8)]' : ''}`} />
            <span className="font-display font-bold text-[9px] tracking-wider uppercase mt-1">
              Campaign
            </span>
          </button>

          {/* Tab 2: Arena */}
          <button
            onClick={() => onTabChange('pvp')}
            className={`relative flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
              activeTab === 'pvp'
                ? 'bg-rose-950/40 border border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.25)] text-rose-300'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="relative">
              <Trophy className={`w-4 h-4 ${activeTab === 'pvp' ? 'text-rose-400 drop-shadow-[0_0_6px_rgba(244,63,94,0.8)]' : ''}`} />
              {hasNewDefenseAttacks && (
                <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
            </div>
            <span className="font-display font-bold text-[9px] tracking-wider uppercase mt-1">
              Arena
            </span>
          </button>

          {/* Tab 3: Cards */}
          <button
            onClick={() => onTabChange('collection')}
            className={`relative flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
              activeTab === 'collection'
                ? 'bg-amber-950/40 border border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.25)] text-amber-300'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="relative">
              <FolderGit className={`w-4 h-4 ${activeTab === 'collection' ? 'text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]' : ''}`} />
              {deckCount !== undefined && (
                <span className="absolute -top-1.5 -right-3 text-[7.5px] font-mono font-black px-1 rounded-full bg-amber-500/30 text-amber-300 border border-amber-500/40">
                  {deckCount}
                </span>
              )}
            </div>
            <span className="font-display font-bold text-[9px] tracking-wider uppercase mt-1">
              Cards
            </span>
          </button>

          {/* Tab 4: Lord */}
          <button
            onClick={() => onTabChange('hero')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
              activeTab === 'hero'
                ? 'bg-yellow-950/40 border border-yellow-500/50 shadow-[0_0_12px_rgba(234,179,8,0.25)] text-yellow-300'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <UserCircle2 className={`w-4 h-4 ${activeTab === 'hero' ? 'text-yellow-400 drop-shadow-[0_0_6px_rgba(234,179,8,0.8)]' : ''}`} />
            <span className="font-display font-bold text-[9px] tracking-wider uppercase mt-1">
              Lord
            </span>
          </button>

          {/* Tab 5: Menu / Drawer */}
          <button
            onClick={() => setIsOpen(true)}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
              ['altar', 'bank', 'premium'].includes(activeTab)
                ? 'bg-[#1b1424] border border-[#ebd09b]/60 shadow-[0_0_12px_rgba(235,208,155,0.25)] text-[#ebd09b]'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Compass className={`w-4 h-4 ${['altar', 'bank', 'premium'].includes(activeTab) ? 'text-[#ebd09b] drop-shadow-[0_0_6px_rgba(235,208,155,0.8)]' : ''}`} />
            <span className="font-display font-bold text-[9px] tracking-wider uppercase mt-1 truncate max-w-full">
              {['altar', 'bank', 'premium'].includes(activeTab) ? currentItem.label.split(' ')[0] : 'Menu'}
            </span>
          </button>
        </div>
      </nav>

      {/* =========================================================================
          2. SLIDE-UP NAVIGATION DRAWER (Atmospheric Gothic Modal)
         ========================================================================= */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-end animate-in fade-in duration-200 select-none">
          
          {/* Backdrop dismiss */}
          <div className="flex-1 w-full" onClick={() => setIsOpen(false)} />

          {/* Drawer Panel */}
          <div className="w-full bg-gradient-to-b from-[#140f1a] via-[#0d0912] to-[#060408] border-t-2 border-[#ebd09b]/50 rounded-t-3xl p-4 pb-6 shadow-[0_-10px_40px_rgba(0,0,0,0.9)] flex flex-col max-h-[85vh] overflow-hidden relative animate-in slide-in-from-bottom duration-250">
            
            {/* Top Handle & Close Header */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#ebd09b]/10 border border-[#ebd09b]/40 flex items-center justify-center">
                  <Compass className="w-4 h-4 text-[#ebd09b]" />
                </div>
                <div>
                  <h3 className="font-cinzel font-black text-sm text-[#ebd09b] tracking-wider uppercase">
                    Abyssal Navigation
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-400">Select Realm Destination</span>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-black/60 border border-white/15 flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/40 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Menu Items List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {menuItems.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left cursor-pointer group ${
                      isActive
                        ? `bg-gradient-to-r ${item.bg} ${item.border} shadow-[0_0_15px_rgba(235,208,155,0.25)] ring-1 ring-white/20`
                        : 'bg-black/50 hover:bg-white/5 border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        isActive 
                          ? `${item.border} bg-black/60 shadow`
                          : 'border-white/10 bg-black/40 group-hover:border-white/20'
                      }`}>
                        <Icon className={`w-5 h-5 ${isActive ? item.color : 'text-zinc-400 group-hover:text-zinc-200'}`} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-cinzel font-black text-xs tracking-wider uppercase truncate ${
                            isActive ? 'text-white' : 'text-zinc-300 group-hover:text-white'
                          }`}>
                            {item.label}
                          </span>
                          {item.badge && (
                            <span className={`text-[8.5px] font-mono font-bold px-1.5 py-0.2 rounded-full ${item.badgeColor || 'bg-zinc-800 text-zinc-300'}`}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500 block truncate mt-0.5">
                          {item.sublabel}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-[#ebd09b] animate-pulse" />
                      )}
                      <ChevronRight className={`w-4 h-4 ${isActive ? 'text-[#ebd09b]' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Footer Note */}
            <div className="pt-3 mt-2 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-zinc-500 shrink-0">
              <span>VOID COVENANT • TELEGRAM</span>
              <span className="text-amber-500/80 font-bold">DARK FANTASY CARD RPG</span>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
