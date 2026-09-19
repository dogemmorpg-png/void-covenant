import React, { useState, useEffect, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
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
import { getReferralLink, getTelegramShareUrl } from '../utils/referralHelper';

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

  useEffect(() => {
    const tg = typeof window !== 'undefined' ? (window as any).Telegram?.WebApp : null;
    if (tg) {
      try {
        tg.ready?.();
        tg.setHeaderColor?.('#0c0e14');
        tg.setBackgroundColor?.('#050505');
      } catch (e) {}
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

  const isTelegramUser = useMemo(() => {
    const hasTgWebApp = Boolean((window as any).Telegram?.WebApp?.initData);
    const isTgUa = /Telegram/i.test(navigator.userAgent || '');
    const isTgAddress = Boolean(profile.solanaAddress && profile.solanaAddress.startsWith('tg_'));
    return hasTgWebApp || isTgUa || isTgAddress;
  }, [profile.solanaAddress]);

  const referralCode = profile.referralCode || profile.solanaAddress || '';

  const referralLink = useMemo(() => {
    return getReferralLink(referralCode, isTelegramUser);
  }, [referralCode, isTelegramUser]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleShareTelegram = (e: React.MouseEvent) => {
    const shareUrl = getTelegramShareUrl(referralLink);
    const tg = (window as any).Telegram?.WebApp;
    if (tg && typeof tg.openTelegramLink === 'function') {
      e.preventDefault();
      tg.openTelegramLink(shareUrl);
    }
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
          paddingTop: 'max(var(--safe-top, 0px), calc(env(safe-area-inset-top, 0px) + 6px))',
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
            <div className="relative w-7 h-7 shrink-0">
              <div className={`w-full h-full rounded-full ${ringColor} overflow-hidden bg-gray-900`}>
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-700 via-gray-800 to-black" />
                )}
              </div>
              {tier === 'ultra' && (
                <img 
                  src="/icons/badge_diamond_v1.png" 
                  alt="Ultra" 
                  className="absolute -top-1.5 -right-1 w-3.5 h-3.5 object-contain filter drop-shadow-[0_0_6px_rgba(168,85,247,0.9)] animate-pulse select-none z-10 pointer-events-none" 
                />
              )}
              {tier === 'premium' && (
                <img 
                  src="/icons/badge_fleur_v1.png" 
                  alt="Premium" 
                  className="absolute -top-1.5 -right-1 w-3.5 h-3.5 object-contain filter drop-shadow-[0_0_6px_rgba(245,158,11,0.9)] select-none z-10 pointer-events-none" 
                />
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

          {/* Right: Invite Friends, Mailbox, Admin */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Invite Friends Button matching PC aesthetic */}
            <button
              onClick={() => setIsReferralModalOpen(true)}
              className="relative h-7 px-2.5 rounded-full bg-gradient-to-r from-amber-950/40 to-[#1e1106] hover:from-amber-900/60 hover:to-[#2e1909] border border-amber-500/50 hover:border-amber-400 flex items-center gap-1.5 text-amber-300 active:scale-95 transition-all cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.2)]"
              title="Invite Friends & Earn Sovereigns"
            >
              <UserPlus className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-display text-[9.5px] sm:text-[10px] font-black tracking-wider uppercase">
                INVITE FRIENDS
              </span>
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400 shadow-[0_0_6px_rgba(250,204,21,0.9)]"></span>
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
                className="w-4 h-4 sm:w-4.5 sm:h-4.5 object-contain drop-shadow-[0_0_6px_rgba(6,182,212,0.6)] shrink-0 scale-[1.7] origin-center mx-0.5" 
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
          style={{
            paddingTop: 'max(var(--safe-top, 0px), calc(env(safe-area-inset-top, 0px) + 16px))',
            paddingBottom: 'max(var(--safe-bottom, 16px), calc(env(safe-area-inset-bottom, 0px) + 16px))',
            paddingLeft: 'max(0.75rem, env(safe-area-inset-left, 0.75rem))',
            paddingRight: 'max(0.75rem, env(safe-area-inset-right, 0.75rem))'
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsReferralModalOpen(false);
          }}
        >
          <div className="bg-gradient-to-b from-[#180d12] via-[#10070a] to-[#080204] border border-[#ebd09b]/35 rounded-3xl w-full max-w-2xl overflow-hidden shadow-[0_0_60px_rgba(245,158,11,0.25)] relative flex flex-col animate-in zoom-in-95 duration-200 max-h-full my-auto">
            
            {/* Modal Header */}
            <div className="border-b border-white/10 px-4 py-3 sm:px-6 sm:py-4 flex justify-between items-center bg-black/40">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 via-amber-600/10 to-red-950/40 border border-amber-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.25)] shrink-0 overflow-hidden">
                  <img src="/icons/referral_seal.png" alt="Covenant Seal" className="w-6 h-6 sm:w-7 sm:h-7 object-contain drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                </div>
                <div>
                  <h2 className="font-display font-black text-base sm:text-xl text-white tracking-widest text-shadow-gold">
                    IMPERIAL COVENANT
                  </h2>
                  <p className="text-[10px] sm:text-[11px] text-amber-200/60 font-sans mt-0.5">
                    Recruit allies into the Void & reap lifetime Sovereign tributes
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setIsReferralModalOpen(false)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40 text-gray-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-3.5 sm:p-6 pb-12 sm:pb-16 space-y-3.5 sm:space-y-4 overflow-y-auto max-h-[calc(100dvh-170px)] scrollbar-thin scrollbar-thumb-amber-500/20">

              {/* Personal Invitation Link Card */}
              <div className="bg-black/60 border border-white/15 rounded-2xl p-3.5 sm:p-4 space-y-2.5 shadow-md">
                <div className="flex items-center justify-between text-[11px] sm:text-xs text-white font-display font-bold tracking-wider uppercase">
                  <span>YOUR IMPERIAL INVITATION LINK</span>
                  <div className="flex items-center gap-2">
                    {profile.referralCode && (
                      <span className="text-[9.5px] font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
                        CODE: <strong className="font-bold text-white">{profile.referralCode}</strong>
                      </span>
                    )}
                    <span className="text-[11px] font-mono text-amber-300">
                      {isTelegramUser ? 'Telegram Bot Link' : 'Share to recruit'}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-2.5">
                  <div className="w-full bg-black/90 border border-white/20 rounded-xl px-3.5 py-2.5 sm:py-3 font-mono text-xs sm:text-sm text-amber-200 select-all flex items-center gap-2 min-w-0">
                    <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
                    <span className="truncate font-semibold">{referralLink}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                    <button
                      onClick={handleCopyLink}
                      className="flex-1 sm:flex-none bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-display font-bold px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase shadow-md shadow-amber-500/20 active:scale-95"
                    >
                      {copySuccess ? 'COPIED!' : <><Copy className="w-3.5 h-3.5" /> COPY</>}
                    </button>

                    <a
                      href={getTelegramShareUrl(referralLink)}
                      onClick={handleShareTelegram}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 sm:flex-none bg-[#229ED9] hover:bg-[#229ED9]/90 text-white font-mono font-bold px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[#229ED9]/20 active:scale-95"
                      title="Share to Telegram"
                    >
                      <Send className="w-3.5 h-3.5" /> Telegram
                    </a>
                  </div>
                </div>
              </div>
              
              {/* HERO FEATURE: PASS BOUNTY (MAIN REFERRAL EARNINGS) */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-amber-400/60 bg-gradient-to-b from-[#2a131b] via-[#1a0c14] to-[#12070c] p-3.5 sm:p-5 shadow-[0_0_35px_rgba(245,158,11,0.25)]">
                {/* Decorative background glows */}
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-fuchsia-600/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.4)] shrink-0">
                        <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
                      </div>
                      <div>
                        <span className="text-[10px] sm:text-xs font-mono font-black text-amber-300 uppercase tracking-widest block">
                          ⭐ PRIMARY REFERRAL REWARD
                        </span>
                        <h3 className="text-sm sm:text-lg font-display font-black text-white tracking-wider text-shadow-gold">
                          SUBSCRIPTION PASS BOUNTY
                        </h3>
                      </div>
                    </div>
                    <span className="self-start sm:self-auto text-[10px] sm:text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-200">
                      Instant Payout to Vault
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-200 font-sans mt-2.5 leading-relaxed">
                    When any friend registered through your link purchases an Imperial Pass, you immediately receive a massive one-time Blood Sovereign bounty:
                  </p>

                  {/* Two Prominent Pass Bounty Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mt-3">
                    {/* Premium Pass Card */}
                    <div className="bg-black/70 border-2 border-amber-500/50 hover:border-amber-400 rounded-xl p-3 sm:p-3.5 flex items-center justify-between shadow-lg shadow-black/70 transition-all">
                      <div>
                        <span className="text-[11px] sm:text-xs font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                          ⚜️ PREMIUM PASS
                        </span>
                        <p className="text-[11px] sm:text-xs text-gray-300 font-sans mt-0.5 sm:mt-1">
                          When your friend subscribes
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <img src="/icons/icon_sovereign.webp" alt="SOV" className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-[0_0_12px_rgba(235,208,155,0.9)]" />
                        <div className="text-right">
                          <span className="text-xl sm:text-2xl font-mono font-black text-amber-300 text-shadow-gold block leading-none">
                            +300
                          </span>
                          <span className="text-[10px] sm:text-xs font-mono font-bold text-amber-200 uppercase mt-0.5 block">
                            SOV ($3.00)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Ultra Pass Card */}
                    <div className="bg-black/70 border-2 border-fuchsia-500/60 hover:border-fuchsia-400 rounded-xl p-3 sm:p-3.5 flex items-center justify-between shadow-lg shadow-black/70 transition-all">
                      <div>
                        <span className="text-[11px] sm:text-xs font-mono font-bold text-fuchsia-300 uppercase tracking-wider flex items-center gap-1.5">
                          👑 ULTRA OVERLORD
                        </span>
                        <p className="text-[11px] sm:text-xs text-gray-300 font-sans mt-0.5 sm:mt-1">
                          When your friend subscribes
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <img src="/icons/icon_sovereign.webp" alt="SOV" className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-[0_0_12px_rgba(217,70,239,0.9)]" />
                        <div className="text-right">
                          <span className="text-xl sm:text-2xl font-mono font-black text-fuchsia-300 text-shadow-gold block leading-none">
                            +600
                          </span>
                          <span className="text-[10px] sm:text-xs font-mono font-bold text-fuchsia-200 uppercase mt-0.5 block">
                            SOV ($6.00)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Perks (Starter Gift & 15% Share) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {/* 1. Friend Starter */}
                <div className="bg-gradient-to-b from-black/80 to-black/95 border border-white/20 rounded-2xl p-3.5 sm:p-4 flex items-start gap-3 shadow-md">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center shrink-0">
                    <img src="/icons/icon_gold.webp" alt="Gold" className="w-6 h-6 sm:w-8 sm:h-8 object-contain drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base sm:text-lg font-mono font-black text-amber-300 text-shadow-gold">+1,000 GOLD</span>
                      <span className="text-[10px] font-mono font-bold text-amber-200 uppercase">GIFT</span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-gray-300 font-sans mt-0.5 sm:mt-1 leading-relaxed">
                      Every friend who registers via your link immediately receives <strong>1,000 Gold</strong> starter bonus (non-referred only get 500).
                    </p>
                  </div>
                </div>

                {/* 2. 15% Lifetime Share */}
                <div className="bg-gradient-to-b from-black/80 to-black/95 border border-white/20 rounded-2xl p-3.5 sm:p-4 flex items-start gap-3 shadow-md">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-red-500/15 border border-red-500/40 flex items-center justify-center shrink-0">
                    <img src="/icons/icon_sovereign.webp" alt="SOV" className="w-6 h-6 sm:w-8 sm:h-8 object-contain drop-shadow-[0_0_8px_rgba(235,208,155,0.7)]" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base sm:text-lg font-mono font-black text-amber-200 text-shadow-gold">15% SOVEREIGN</span>
                      <span className="text-[10px] font-mono font-bold text-amber-200 uppercase">SHARE</span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-gray-300 font-sans mt-0.5 sm:mt-1 leading-relaxed">
                      Receive <strong>15%</strong> of all Blood Sovereigns your friends earn from Arena wins and daily Leaderboards.
                    </p>
                  </div>
                </div>
              </div>

              {/* Referral Sovereign Vault (Imperial Treasury Showcase) */}
              {(() => {
                const unclaimed = profile.referralSovereignsUnclaimed || 0;
                const wholeUnits = Math.floor(unclaimed);
                return (
                  <div className="bg-gradient-to-r from-[#22100d] via-[#160a12] to-[#1c0d18] border-2 border-amber-500/50 rounded-2xl p-3.5 sm:p-5 shadow-[0_0_30px_rgba(245,158,11,0.2)] relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-500/30 to-red-950/70 border-2 border-amber-400/60 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.35)]">
                        <img 
                          src="/icons/icon_sovereign.webp" 
                          alt="SOV" 
                          className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-[0_0_12px_rgba(235,208,155,0.9)]" 
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.9)]" />
                          <span className="text-[10px] sm:text-xs font-display font-black text-amber-300 tracking-widest uppercase">
                            COVENANT TREASURY VAULT
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1.5 sm:gap-2 mt-0.5">
                          <span className="text-2xl sm:text-4xl font-mono font-black text-amber-200 text-shadow-gold tracking-tight">
                            {unclaimed.toFixed(2)}
                          </span>
                          <span className="text-xs sm:text-sm font-display font-bold text-amber-400 tracking-wider">
                            SOV
                          </span>
                        </div>
                        <div className="text-[10px] sm:text-xs text-gray-300 font-mono mt-0.5 flex items-center gap-2 flex-wrap">
                          <span>Total Earned: <strong className="text-amber-300 font-black">{(profile.referralSovereignsTotalEarned || 0).toFixed(2)} SOV</strong></span>
                          <span className="text-gray-500">•</span>
                          <span>Allies: <strong className="text-white font-black">{referralsList.length > 0 ? referralsList.length : (profile.referralsCount || 0)}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto flex flex-col items-stretch sm:items-end">
                      {wholeUnits >= 1 ? (
                        <div className="flex flex-col items-stretch sm:items-end gap-1 w-full sm:w-auto">
                          <button
                            onClick={handleClaimReferralSovereigns}
                            disabled={isClaimingSovereigns}
                            className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-200 text-black font-display font-black px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl text-xs sm:text-sm tracking-wider transition-all shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {isClaimingSovereigns ? (
                              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Sparkles className="w-4 h-4 text-black fill-black" />
                            )}
                            TRANSFER {wholeUnits} SOV TO BANK
                          </button>
                          <span className="text-[10px] text-amber-200 font-mono text-center sm:text-right font-medium">
                            Directly credited to your Imperial Bank balance
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-stretch sm:items-end gap-1 w-full sm:w-auto">
                          <div className="bg-white/10 border border-white/20 text-gray-300 font-display font-bold px-4 py-2 sm:px-6 sm:py-3 rounded-xl text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 cursor-default">
                            <span>🔒 TRANSFER TO BANK</span>
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono text-center sm:text-right font-medium">
                            Requires ≥ 1.00 SOV to transfer
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Recruited Allies Section */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between border-b border-white/15 pb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                    <span className="text-xs sm:text-sm font-display font-bold text-white tracking-wider uppercase">Your Recruited Allies</span>
                  </div>
                  <span className="text-[10px] sm:text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300">
                    {referralsList.length} Allies
                  </span>
                </div>

                {isLoadingReferrals ? (
                  <div className="text-center py-6">
                    <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span className="text-xs text-gray-300 font-mono">Summoning covenant roster...</span>
                  </div>
                ) : referralsList.length === 0 ? (
                  <div className="text-center py-6 px-4 bg-black/40 border border-white/10 rounded-2xl">
                    <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-2.5 text-gray-300">
                      <UserPlus className="w-5 h-5 text-amber-300" />
                    </div>
                    <h4 className="text-sm sm:text-base font-display font-bold text-white">No Allies Recruited Yet</h4>
                    <p className="text-xs text-gray-300 font-sans mt-1 max-w-md mx-auto leading-relaxed">
                      Share your recruitment link with friends to begin collecting +300 / +600 SOV pass bounties and 15% lifetime sovereign tributes!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 pb-2 max-h-60 overflow-y-auto">
                    {referralsList.map((ref, idx) => {
                      const isUltra = ref.subscriptionTier === 'ultra';
                      const isPremium = ref.subscriptionTier === 'premium';
                      const contributed = ref.sovereignsContributed || 0;
                      return (
                        <div 
                          key={idx} 
                          className="bg-gradient-to-r from-black/70 via-black/60 to-black/80 border border-white/15 hover:border-amber-400/50 rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all shadow-md"
                        >
                          {/* Left: Avatar & Info */}
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden shrink-0 border-2 ${
                              isUltra 
                                ? 'border-fuchsia-400 shadow-[0_0_12px_rgba(217,70,239,0.7)]' 
                                : isPremium 
                                ? 'border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.7)]' 
                                : 'border-white/30'
                            }`}>
                              {ref.avatarUrl ? (
                                <img src={ref.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-white/10 flex items-center justify-center">
                                  <User className="w-4 h-4 text-gray-300" />
                                </div>
                              )}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs sm:text-sm font-display font-bold text-white block">
                                  {ref.username}
                                </span>
                                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-white/10 text-gray-300">
                                  LVL {ref.level || 1}
                                </span>
                              </div>
                              <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3 text-gray-400" /> Joined {new Date(ref.joinedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {/* Right: Subscription Tier Badge & Money Contributed */}
                          <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 border-t sm:border-t-0 border-white/10 pt-2 sm:pt-0">
                            {/* Subscription Status */}
                            <div>
                              {isUltra ? (
                                <span className="text-[10px] font-mono font-bold text-fuchsia-200 bg-fuchsia-950/90 border border-fuchsia-400 px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-[0_0_12px_rgba(217,70,239,0.4)]">
                                  <img src="/icons/badge_diamond_v1.png" alt="Ultra" className="w-3 h-3 object-contain" /> ULTRA
                                </span>
                              ) : isPremium ? (
                                <span className="text-[10px] font-mono font-bold text-amber-200 bg-amber-950/90 border border-amber-400 px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-[0_0_12px_rgba(245,158,11,0.4)]">
                                  <img src="/icons/badge_fleur_v1.png" alt="Premium" className="w-3 h-3 object-contain" /> PREMIUM
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono font-bold text-gray-300 bg-white/10 border border-white/20 px-2.5 py-1 rounded-xl">
                                  FREE
                                </span>
                              )}
                            </div>

                            {/* Money Contributed by this referral */}
                            <div className="bg-amber-500/15 border border-amber-500/40 px-2.5 py-1 rounded-xl flex items-center gap-1 shrink-0">
                              <span className="text-[10px] font-sans text-amber-200 font-bold uppercase">Earned:</span>
                              <img src="/icons/icon_sovereign.webp" alt="SOV" className="w-3.5 h-3.5 object-contain drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                              <span className="text-xs font-mono font-black text-amber-300">
                                {contributed > 0 ? `+${contributed.toFixed(2)}` : '0.00'} SOV
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
