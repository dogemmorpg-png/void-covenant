import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  LogOut, 
  Mail, 
  ShieldAlert, 
  UserPlus, 
  Plus, 
  X, 
  Copy, 
  Send, 
  Crown, 
  Sparkles, 
  User, 
  Clock 
} from 'lucide-react';
import { useToast } from '../components/Toast';
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
    claimReferralSovereigns,
  } = useGame();
  const { disconnect } = useWallet();
  const toast = useToast();

  const [isMailboxOpen, setIsMailboxOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [referralsList, setReferralsList] = useState<any[]>([]);
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(false);
  const [isClaimingSovereigns, setIsClaimingSovereigns] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const [topInset, setTopInset] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        const inset = tg.safeAreaInset?.top ?? tg.contentSafeAreaInset?.top;
        if (typeof inset === 'number' && inset > 0) return inset + 6;
        return 50; // Standard Telegram mobile top clearance (status bar + tg close header)
      }
    }
    return 8; // Standard browser clearance
  });

  useEffect(() => {
    const tg = typeof window !== 'undefined' ? (window as any).Telegram?.WebApp : null;
    if (tg) {
      try {
        tg.ready?.();
        tg.setHeaderColor?.('#0c0e14');
        tg.setBackgroundColor?.('#050505');
      } catch (e) {}

      const checkInset = () => {
        const inset = tg.safeAreaInset?.top ?? tg.contentSafeAreaInset?.top;
        if (typeof inset === 'number' && inset > 0) {
          setTopInset(inset + 6);
        } else {
          setTopInset(50);
        }
      };
      checkInset();
      tg.onEvent?.('viewportChanged', checkInset);
      return () => {
        tg.offEvent?.('viewportChanged', checkInset);
      };
    }
  }, []);

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
      ? 'ring-2 ring-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.7)]'
      : tier === 'premium'
      ? 'ring-2 ring-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.6)]'
      : 'ring-1 ring-white/25';

  const handleCopyLink = () => {
    const link = `${window.location.origin}?ref=${profile.solanaAddress || ''}`;
    navigator.clipboard.writeText(link);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleClaimReferralSovereigns = async () => {
    if (isClaimingSovereigns) return;
    const unclaimed = profile.referralSovereignsUnclaimed || 0;
    const wholeUnits = Math.floor(unclaimed);
    if (wholeUnits < 1) {
      toast('You need at least 1 whole Blood Sovereign to transfer to your Bank.', 'info');
      return;
    }

    setIsClaimingSovereigns(true);
    try {
      const res = await claimReferralSovereigns();
      if (res.success) {
        toast(res.message || `Transferred ${wholeUnits} Blood Sovereigns to Bank!`, 'success');
      } else {
        toast(res.message || 'Failed to transfer sovereigns', 'error');
      }
    } catch (e: any) {
      toast(e.message || 'Transfer failed', 'error');
    } finally {
      setIsClaimingSovereigns(false);
    }
  };

  useEffect(() => {
    if (!isReferralModalOpen) return;
    
    const fetchReferrals = async () => {
      const token = localStorage.getItem('void_covenant_token');
      if (!token) return;
      
      setIsLoadingReferrals(true);
      try {
        const res = await fetch('/api/action?action=referrals', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setReferralsList(data.referrals || []);
        }
      } catch (e) {
        console.error('Failed to fetch referrals:', e);
      } finally {
        setIsLoadingReferrals(false);
      }
    };
    
    fetchReferrals();
  }, [isReferralModalOpen]);

  // Format resource numbers for compact mobile readability
  const formatVal = (val: number | undefined) => {
    if (typeof val !== 'number') return '0';
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 10000) return `${(val / 1000).toFixed(1)}k`;
    return val.toLocaleString();
  };

  return (
    <>
      <header 
        style={{
          paddingTop: `max(${topInset}px, env(safe-area-inset-top, ${topInset}px))`,
          paddingLeft: 'max(0.6rem, env(safe-area-inset-left, 0.6rem))',
          paddingRight: 'max(0.6rem, env(safe-area-inset-right, 0.6rem))'
        }}
        className="w-full bg-[#0c0e14]/98 backdrop-blur-md border-b border-white/10 sticky top-0 z-40 pb-1.5 flex flex-col gap-1 select-none shadow-lg"
      >
        {/* ROW 1: Player Profile & Quick Utility Controls */}
        <div className="flex items-center justify-between h-7 w-full">
          {/* Left: Player Avatar, Name & Level */}
          <div 
            onClick={() => onNavigateTab?.('premium')}
            className="flex items-center gap-2 cursor-pointer group active:scale-95 transition-transform"
            title="View Imperial Pass Privileges"
          >
            <div className={`relative w-7 h-7 rounded-full ${ringColor} overflow-hidden bg-gray-900 shrink-0`}>
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-700 via-gray-800 to-black" />
              )}
              {tier === 'ultra' && (
                <span className="absolute -top-1 -right-0.5 text-[8px] filter drop-shadow-[0_0_4px_rgba(168,85,247,0.9)] animate-pulse">
                  💎
                </span>
              )}
              {tier === 'premium' && (
                <span className="absolute -top-1 -right-0.5 text-[8px] filter drop-shadow-[0_0_4px_rgba(245,158,11,0.9)]">
                  ⚜️
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-display font-bold text-xs text-gray-100 truncate max-w-[100px] sm:max-w-[150px] group-hover:text-amber-300 transition-colors">
                {profile.username || 'Voidwalker'}
              </span>
              <span className="font-mono text-[9px] font-bold bg-white/10 px-1.5 py-0.2 rounded text-gray-300 shrink-0">
                Lv.{profile.level || 1}
              </span>
            </div>
          </div>

          {/* Right: Invite Friends, Mailbox, Admin & Logout */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Invite Friends Button */}
            <button
              onClick={() => setIsReferralModalOpen(true)}
              className="relative h-7 px-2 rounded-full bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/50 flex items-center gap-1 text-amber-300 active:scale-95 transition-all cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.2)]"
              title="Invite Friends & Earn Sovereigns"
            >
              <UserPlus className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-display text-[9px] font-black tracking-wider uppercase hidden xs:inline">
                INVITE
              </span>
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
              </span>
            </button>

            {/* Mailbox Button */}
            <button
              onClick={() => setIsMailboxOpen(true)}
              className={`relative w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                unreadMailCount > 0
                  ? 'bg-amber-500/20 border border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  : 'bg-white/5 border border-white/10'
              }`}
              title="Decrees & Rewards Mailbox"
            >
              <Mail className={`w-3.5 h-3.5 ${unreadMailCount > 0 ? 'text-amber-300' : 'text-gray-400'}`} />
              {unreadMailCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 rounded-full bg-red-500 text-white font-mono text-[7px] font-black flex items-center justify-center border border-[#0c0e14] shadow-sm">
                  {unreadMailCount}
                </span>
              )}
            </button>

            {/* Admin Command Panel */}
            {isAdmin && (
              <button
                onClick={() => setIsAdminPanelOpen(true)}
                className="w-7 h-7 rounded-full bg-red-950/60 border border-red-500/60 flex items-center justify-center text-red-400 cursor-pointer active:scale-90 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                title="Master Admin Panel"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Logout Button */}
            <button
              onClick={() => {
                if (window.confirm('Log out from Void Covenant?')) {
                  disconnect().catch(() => {});
                  logoutPlayer();
                }
              }}
              className="w-7 h-7 rounded-full bg-white/5 border border-white/10 hover:border-red-500/50 flex items-center justify-center text-gray-400 hover:text-red-400 transition-all cursor-pointer active:scale-90"
              title="Log Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ROW 2: Balanced PC-Style Jewel Resource Pills */}
        <div className="grid grid-cols-4 gap-1.5 w-full pt-0.5">
          {/* 1. GOLD PILL */}
          <div
            onClick={() => setIsGoldShopOpen(true)}
            className="flex items-center justify-between bg-gradient-to-r from-[#1c1608] to-[#120e04] hover:from-[#2a200a] hover:to-[#1a1405] border border-amber-500/40 hover:border-amber-400/80 rounded-full py-1 pl-1.5 pr-1 shadow-[0_0_10px_rgba(245,158,11,0.15)] cursor-pointer transition-all duration-200 active:scale-95 group select-none min-w-0"
            title="Imperial Gold (Tap to open Gold Repository)"
          >
            <div className="flex items-center gap-1 min-w-0">
              <img 
                src="/icons/icon_gold.webp" 
                alt="Gold" 
                className="w-4 h-4 sm:w-4.5 sm:h-4.5 object-contain drop-shadow-[0_0_6px_rgba(245,158,11,0.6)] shrink-0" 
              />
              <span className="font-mono font-black text-amber-400 text-[11px] sm:text-xs leading-none truncate">
                {formatVal(profile.gold)}
              </span>
            </div>
            <div className="w-4 h-4 rounded-full bg-gradient-to-b from-amber-500 to-amber-700 text-white flex items-center justify-center border border-amber-300/40 shadow-sm shrink-0 ml-0.5 group-hover:scale-110 transition-transform">
              <Plus className="w-2.5 h-2.5 stroke-[3]" />
            </div>
          </div>

          {/* 2. DUST PILL */}
          <div
            onClick={() => setIsDustShopOpen(true)}
            className="flex items-center justify-between bg-gradient-to-r from-[#081822] to-[#040d13] hover:from-[#0c2433] hover:to-[#06141e] border border-cyan-500/40 hover:border-cyan-400/80 rounded-full py-1 pl-1.5 pr-1 shadow-[0_0_10px_rgba(6,182,212,0.15)] cursor-pointer transition-all duration-200 active:scale-95 group select-none min-w-0"
            title="Void Dust (Tap to open Dust Sanctum)"
          >
            <div className="flex items-center gap-1 min-w-0">
              <img 
                src="/icons/icon_dust.webp" 
                alt="Dust" 
                className="w-4 h-4 sm:w-4.5 sm:h-4.5 object-contain drop-shadow-[0_0_6px_rgba(6,182,212,0.6)] shrink-0" 
              />
              <span className="font-mono font-black text-cyan-300 text-[11px] sm:text-xs leading-none truncate">
                {formatVal(profile.dust)}
              </span>
            </div>
            <div className="w-4 h-4 rounded-full bg-gradient-to-b from-cyan-500 to-cyan-700 text-white flex items-center justify-center border border-cyan-300/40 shadow-sm shrink-0 ml-0.5 group-hover:scale-110 transition-transform">
              <Plus className="w-2.5 h-2.5 stroke-[3]" />
            </div>
          </div>

          {/* 3. SHARDS PILL */}
          <div
            onClick={() => setIsShardsShopOpen(true)}
            className="flex items-center justify-between bg-gradient-to-r from-[#1c080d] to-[#120508] hover:from-[#2a0c13] hover:to-[#1a070c] border border-red-500/40 hover:border-red-400/80 rounded-full py-1 pl-1.5 pr-1 shadow-[0_0_10px_rgba(221,44,64,0.15)] cursor-pointer transition-all duration-200 active:scale-95 group select-none min-w-0"
            title="Dark Shards (Tap to open Shards Shop)"
          >
            <div className="flex items-center gap-1 min-w-0">
              <img 
                src="/icons/icon_shards.webp" 
                alt="Shards" 
                className="w-4 h-4 sm:w-4.5 sm:h-4.5 object-contain drop-shadow-[0_0_6px_rgba(239,68,68,0.7)] shrink-0" 
              />
              <span className="font-mono font-black text-rose-300 text-[11px] sm:text-xs leading-none truncate">
                {formatVal(profile.darkShards)}
              </span>
            </div>
            <div className="w-4 h-4 rounded-full bg-gradient-to-b from-rose-500 to-rose-700 text-white flex items-center justify-center border border-rose-300/40 shadow-sm shrink-0 ml-0.5 group-hover:scale-110 transition-transform">
              <Plus className="w-2.5 h-2.5 stroke-[3]" />
            </div>
          </div>

          {/* 4. SOVEREIGNS PILL */}
          <div
            onClick={() => onNavigateTab?.('bank')}
            className="flex items-center justify-center gap-1 bg-gradient-to-r from-[#240810] to-[#120308] hover:from-[#350c18] hover:to-[#220710] border border-amber-500/50 hover:border-amber-400/90 rounded-full py-1 px-1.5 shadow-[0_0_12px_rgba(245,158,11,0.2)] cursor-pointer transition-all duration-200 active:scale-95 group select-none min-w-0"
            title="Blood Sovereigns (Tap to open Imperial Bank)"
          >
            <img 
              src="/icons/icon_sovereign.webp" 
              alt="Sovereigns" 
              className="w-4 h-4 sm:w-4.5 sm:h-4.5 object-contain drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] shrink-0" 
            />
            <span className="font-mono font-black text-amber-300 text-[11px] sm:text-xs leading-none truncate">
              {profile.bloodSovereigns || 0}
            </span>
          </div>
        </div>
      </header>

      {/* Referrals & Invites Modal */}
      {isReferralModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsReferralModalOpen(false);
          }}
        >
          <div className="bg-gradient-to-b from-[#180d12] via-[#10070a] to-[#080204] border border-[#ebd09b]/35 rounded-3xl w-full max-w-xl overflow-hidden shadow-[0_0_60px_rgba(245,158,11,0.25)] relative flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh]">
            {/* Modal Header */}
            <div className="border-b border-white/10 px-4 py-3 sm:px-5 sm:py-3.5 flex justify-between items-center bg-black/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-red-950/40 border border-amber-500/40 flex items-center justify-center shrink-0">
                  <img src="/icons/referral_seal.png" alt="Seal" className="w-6 h-6 object-contain drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                </div>
                <div>
                  <h2 className="font-display font-black text-base text-white tracking-widest text-shadow-gold">
                    IMPERIAL COVENANT
                  </h2>
                  <p className="text-[10px] text-amber-200/60 font-sans">
                    Recruit allies into the Void & earn Sovereigns
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setIsReferralModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-3.5 overflow-y-auto max-h-[calc(90vh-75px)] custom-scrollbar">
              {/* Personal Invitation Link Card */}
              <div className="bg-black/60 border border-white/15 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-white font-display font-bold uppercase">
                  <span>YOUR INVITATION LINK</span>
                  <span className="font-mono text-amber-300">Share to recruit</span>
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="w-full bg-black/90 border border-white/20 rounded-xl px-3 py-2 font-mono text-xs text-amber-200 truncate select-all flex items-center gap-2">
                    <Copy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{`${window.location.origin}?ref=${profile.solanaAddress || ''}`}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyLink}
                      className="flex-1 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-display font-bold py-2 rounded-xl text-xs tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase active:scale-95"
                    >
                      {copySuccess ? 'COPIED!' : <><Copy className="w-3.5 h-3.5" /> COPY LINK</>}
                    </button>

                    <a
                      href={`https://t.me/share/url?url=${encodeURIComponent(`${window.location.origin}?ref=${profile.solanaAddress || ''}`)}&text=${encodeURIComponent('Join Void Covenant! Sign up with my link to get +1,000 Gold starter bonus!')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 bg-[#229ED9] hover:bg-[#229ED9]/90 text-white font-mono font-bold py-2 rounded-xl text-xs tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" /> Telegram
                    </a>
                  </div>
                </div>
              </div>

              {/* Pass Bounty Banner */}
              <div className="rounded-2xl border border-amber-400/50 bg-gradient-to-b from-[#2a131b] via-[#1a0c14] to-[#12070c] p-3.5 shadow-md">
                <div className="flex items-center gap-2 border-b border-amber-500/20 pb-2 mb-2">
                  <Crown className="w-4 h-4 text-amber-300 shrink-0" />
                  <span className="text-[10px] font-mono font-black text-amber-300 uppercase tracking-wider">
                    PASS BOUNTY: +300 / +600 SOV PER REFERRAL
                  </span>
                </div>
                <p className="text-[11px] text-gray-300 font-sans leading-relaxed">
                  When a recruited friend buys a Premium Pass, you receive <strong className="text-amber-300">+300 SOV ($3.00)</strong>. For an Ultra Pass, you receive <strong className="text-fuchsia-300">+600 SOV ($6.00)</strong> directly into your treasury!
                </p>
              </div>

              {/* Treasury Vault Claim Banner */}
              {(() => {
                const unclaimed = profile.referralSovereignsUnclaimed || 0;
                const wholeUnits = Math.floor(unclaimed);
                return (
                  <div className="bg-gradient-to-r from-[#22100d] to-[#160a12] border border-amber-500/40 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[9px] font-mono text-amber-300 uppercase tracking-widest block font-bold">
                        UNCLAIMED TRIBUTES
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-2xl font-mono font-black text-amber-200">
                          {unclaimed.toFixed(2)}
                        </span>
                        <span className="text-xs font-display font-bold text-amber-400">
                          SOV
                        </span>
                      </div>
                    </div>

                    {wholeUnits >= 1 ? (
                      <button
                        onClick={handleClaimReferralSovereigns}
                        disabled={isClaimingSovereigns}
                        className="bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-black font-display font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider cursor-pointer active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {isClaimingSovereigns ? (
                          <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )}
                        TRANSFER {wholeUnits} SOV
                      </button>
                    ) : (
                      <span className="text-[10px] text-gray-400 font-mono text-right">
                        Accumulating... (≥ 1 SOV to transfer)
                      </span>
                    )}
                  </div>
                );
              })()}

              {/* Recruited Allies Mini List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                  <span className="text-xs font-display font-bold text-white uppercase">Recruited Allies</span>
                  <span className="text-[10px] font-mono text-amber-300">{referralsList.length} Allies</span>
                </div>

                {isLoadingReferrals ? (
                  <div className="text-center py-4 text-xs font-mono text-gray-400">Loading roster...</div>
                ) : referralsList.length === 0 ? (
                  <div className="text-center py-4 text-xs font-sans text-gray-400 bg-black/40 rounded-xl p-3">
                    No allies recruited yet. Share your recruitment link above!
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {referralsList.map((ref, idx) => (
                      <div key={idx} className="bg-black/50 border border-white/10 rounded-xl p-2 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-display font-bold text-white">{ref.username}</span>
                          <span className="font-mono text-[9px] text-gray-400">Lv.{ref.level || 1}</span>
                        </div>
                        <span className="font-mono text-amber-300 font-bold">
                          +{Number(ref.sovereignsContributed || 0).toFixed(2)} SOV
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Modals */}
      <MailboxModal isOpen={isMailboxOpen} onClose={() => setIsMailboxOpen(false)} />
      <AdminPanelModal isOpen={isAdminPanelOpen} onClose={() => setIsAdminPanelOpen(false)} />
    </>
  );
};
