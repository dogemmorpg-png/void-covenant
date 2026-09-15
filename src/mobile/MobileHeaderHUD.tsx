import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { LogOut, Mail, ShieldAlert } from 'lucide-react';
import { MailboxModal } from '../components/MailboxModal';
import { AdminPanelModal } from '../components/AdminPanelModal';

interface MobileHeaderHUDProps {
  onNavigateTab?: (tab: string) => void;
}

export const MobileHeaderHUD: React.FC<MobileHeaderHUDProps> = ({ onNavigateTab }) => {
  const {
    profile,
    logoutPlayer,
    setIsShardsShopOpen,
    setIsGoldShopOpen,
    setIsDustShopOpen,
  } = useGame();
  const { disconnect } = useWallet();

  const [isMailboxOpen, setIsMailboxOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  const isAdmin =
    profile?.username?.toLowerCase() === 'adminus' ||
    (profile as any)?.role === 'admin' ||
    profile?.solanaAddress === 'BxxQjEStvpcbWLbSnwL19rjbGmvND1J5pEBRShWFoYNr';

  const unreadMailCount = (profile.mailMessages || []).filter(
    (m) => !m.isRead || (m.rewards && !m.isClaimed)
  ).length;

  // Subscription tier ring color for avatar
  const isSubActive = profile.subscriptionExpiresAt && profile.subscriptionExpiresAt > Date.now();
  const tier = isSubActive ? (profile.subscriptionTier || 'free') : 'free';
  const ringColor =
    tier === 'ultra'
      ? 'ring-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]'
      : tier === 'premium'
      ? 'ring-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
      : 'ring-white/20';

  const resources = [
    { key: 'gold', icon: '/icons/icon_gold.webp', value: profile.gold, color: 'text-amber-400', bg: 'bg-amber-500/10', onClick: () => setIsGoldShopOpen(true) },
    { key: 'dust', icon: '/icons/icon_dust.webp', value: profile.dust, color: 'text-cyan-400', bg: 'bg-cyan-500/10', onClick: () => setIsDustShopOpen(true) },
    { key: 'shards', icon: '/icons/icon_shards.webp', value: profile.darkShards, color: 'text-rose-300', bg: 'bg-rose-500/10', onClick: () => setIsShardsShopOpen(true) },
    { key: 'sov', icon: '/icons/icon_sovereign.webp', value: profile.bloodSovereigns || 0, color: 'text-amber-300', bg: 'bg-amber-600/10', onClick: () => onNavigateTab?.('bank') },
  ];

  return (
    <>
      <div 
        style={{
          paddingLeft: 'max(4.5rem, env(safe-area-inset-left, 4.5rem))',
          paddingRight: 'max(4.75rem, env(safe-area-inset-right, 4.75rem))'
        }}
        className="h-[36px] bg-[#0c0e14]/95 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-2 w-full sticky top-0 z-50"
      >
        {/* Left: Avatar & Info */}
        <div className="flex items-center gap-1.5 shrink-0"
          onClick={() => onNavigateTab?.('premium')}
        >
          <div className={`w-6 h-6 rounded-full ring-[1.5px] ${ringColor} overflow-hidden bg-gray-800 shrink-0 cursor-pointer`}>
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900" />
            )}
          </div>
          <div className="flex flex-col justify-center cursor-pointer">
            <span className="font-display text-[10px] text-gray-200 leading-none truncate max-w-[70px]">
              {profile.username || 'Voidwalker'}
            </span>
            <span className="font-mono text-[8px] bg-white/10 px-1 rounded text-gray-400 w-fit leading-tight">
              Lv.{profile.level || 1}
            </span>
          </div>
        </div>

        {/* Center: Resources */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar mx-1.5 flex-1 justify-center">
          {resources.map((r) => (
            <button
              key={r.key}
              onClick={r.onClick}
              className={`flex items-center ${r.bg} hover:brightness-125 rounded-full pr-1.5 pl-0.5 py-0.5 min-h-[22px] transition-all active:scale-95 cursor-pointer shrink-0`}
            >
              <img src={r.icon} alt={r.key} className="w-[18px] h-[18px] object-contain drop-shadow-[0_0_6px_rgba(255,255,255,0.3)]" />
              <span className={`font-mono font-bold text-[10px] ${r.color} ml-0.5`}>
                {typeof r.value === 'number' && r.value >= 10000
                  ? `${(r.value / 1000).toFixed(1)}k`
                  : r.value}
              </span>
            </button>
          ))}
        </div>

        {/* Right: Mail + Admin + Logout */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Mail */}
          <button
            onClick={() => setIsMailboxOpen(true)}
            className={`relative w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
              unreadMailCount > 0
                ? 'bg-amber-500/15 border border-amber-500/40'
                : 'bg-white/5 border border-white/10'
            }`}
          >
            <Mail className={`w-3.5 h-3.5 ${unreadMailCount > 0 ? 'text-amber-300' : 'text-gray-400'}`} />
            {unreadMailCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 rounded-full bg-red-500 text-white font-mono text-[7px] font-bold flex items-center justify-center border border-[#0c0e14]">
                {unreadMailCount}
              </span>
            )}
          </button>

          {/* Admin */}
          {isAdmin && (
            <button
              onClick={() => setIsAdminPanelOpen(true)}
              className="w-7 h-7 rounded-full bg-red-950/60 border border-red-500/50 flex items-center justify-center text-red-400 cursor-pointer active:scale-90"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Logout */}
          <button
            onClick={() => {
              if (window.confirm('Log out?')) {
                disconnect().catch(() => {});
                logoutPlayer();
              }
            }}
            className="w-7 h-7 rounded-full bg-white/5 border border-white/10 hover:border-red-500/40 flex items-center justify-center text-gray-500 hover:text-red-400 transition-all cursor-pointer active:scale-90"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Modals */}
      <MailboxModal isOpen={isMailboxOpen} onClose={() => setIsMailboxOpen(false)} />
      <AdminPanelModal isOpen={isAdminPanelOpen} onClose={() => setIsAdminPanelOpen(false)} />
    </>
  );
};
