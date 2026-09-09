import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { LogOut, Copy, X, Trophy, User, Clock, Plus, UserPlus, Send, Mail, ShieldAlert, Sparkles, Crown, Gift, ArrowRight } from 'lucide-react';
import { useToast } from './Toast';
import { MailboxModal } from './MailboxModal';
import { AdminPanelModal } from './AdminPanelModal';

interface HeaderHUDProps {
  onNavigateTab?: (tab: string) => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({ onNavigateTab }) => {
  const { profile, logoutPlayer, isShardsShopOpen, setIsShardsShopOpen, isGoldShopOpen, setIsGoldShopOpen, claimReferralSovereigns } = useGame();
  const { disconnect } = useWallet();
  const toast = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMailboxOpen, setIsMailboxOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [referralsList, setReferralsList] = useState<any[]>([]);
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(false);
  const [isClaimingSovereigns, setIsClaimingSovereigns] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const isAdmin = 
    profile.username?.toLowerCase() === 'adminus' || 
    profile.role === 'admin' ||
    profile.solanaAddress === 'BxxQjEStvpcbWLbSnwL19rjbGmvND1J5pEBRShWFoYNr';
  const unreadMailCount = (profile.mailMessages || []).filter(m => !m.isRead || (m.rewards && !m.isClaimed)).length;

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
    if (!isModalOpen) return;
    
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
  }, [isModalOpen]);

  return (
    <div className="sticky top-4 z-50 px-4 w-full flex justify-center">
      <div className="glass-panel rounded-3xl lg:rounded-full w-full max-w-[1200px] px-6 py-2 flex flex-col xl:flex-row items-center justify-between gap-4 shadow-neon-blue">
        
        {/* Title and Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600/20 to-black border border-red-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(221,44,64,0.4)] animate-pulse">
            <span className="font-display font-black text-[#dd2c40] text-xl">Ω</span>
          </div>
          <div>
            <h1 className="font-display font-black text-lg text-white tracking-widest text-shadow-gold flex items-center gap-2">
              VOID COVENANT
            </h1>
            <p className="text-[10px] text-gray-400 font-mono tracking-wider">DARK TACTICAL RPG</p>
          </div>
        </div>

        {/* Invite Friends Button */}
        <button
          onClick={() => {
            setIsModalOpen(true);
          }}
          className="bg-amber-950/25 hover:bg-amber-900/35 border border-amber-500/40 hover:border-amber-400/80 rounded-full px-4 py-1.5 flex items-center gap-2.5 text-xs font-display font-bold text-amber-300 hover:text-amber-200 tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.15)]"
        >
          <UserPlus className="w-5 h-5 text-amber-400" />
          <span>INVITE FRIENDS</span>
        </button>

        {/* Resources Panel */}
        <div className="flex items-center justify-center xl:justify-end gap-2 xl:gap-2.5 text-sm shrink-0 flex-nowrap">
          {/* Resources Group */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-nowrap shrink-0">
            {/* Gold */}
            <div 
              onClick={() => {
                setIsGoldShopOpen(true);
              }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-[#1c1608] to-[#120e04] hover:from-[#2a200a] hover:to-[#1a1405] border border-amber-500/40 hover:border-amber-400/80 rounded-full py-1 pl-2.5 pr-1.5 shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:shadow-[0_0_20px_rgba(245,158,11,0.35)] cursor-pointer transition-all duration-300 group select-none" 
              title="Gold (Click to Open Gold Shop)"
            >
              <img src="/icons/icon_gold.webp" alt="Gold" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 object-contain scale-105 group-hover:scale-120 transition-transform duration-300" />
              <span className="font-mono font-black text-amber-400 group-hover:text-amber-300 text-sm tracking-wide transition-colors ml-0.5">{profile.gold}</span>
              <div className="w-5 h-5 rounded-full bg-gradient-to-b from-[#d97706] via-[#b45309] to-[#78350f] group-hover:from-[#f59e0b] group-hover:to-[#92400e] text-white flex items-center justify-center border border-amber-300/40 shadow-[0_0_10px_rgba(217,119,6,0.6)] group-hover:shadow-[0_0_14px_rgba(245,158,11,0.9)] group-hover:scale-110 active:scale-95 transition-all duration-300 ml-0.5">
                <Plus className="w-3 h-3 stroke-[3] text-white drop-shadow-sm" />
              </div>
            </div>

            {/* Dust */}
            <div 
              className="flex items-center gap-1.5 bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-400/50 rounded-full py-1 px-2.5 shadow-inner transition-all duration-300 group cursor-default"
              title={`Void Dust: ${profile.dust}`}
            >
              <img 
                src="/icons/icon_dust.webp" 
                alt="Dust" 
                className="drop-shadow-[0_0_12px_rgba(6,182,212,0.7)] brightness-110 contrast-125 w-8 h-8 object-contain scale-135 group-hover:scale-145 transition-transform duration-300" 
              />
              <span className="font-mono font-black text-cyan-300 group-hover:text-cyan-200 text-sm tracking-wide transition-colors">
                {profile.dust}
              </span>
            </div> 

            {/* Shards */}
            <div 
              onClick={() => {
                setIsShardsShopOpen(true);
              }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-[#1c080d] to-[#120508] hover:from-[#2a0c13] hover:to-[#1a070c] border border-red-500/40 hover:border-red-400/80 rounded-full py-1 pl-2.5 pr-1.5 shadow-[0_0_15px_rgba(221,44,64,0.15)] hover:shadow-[0_0_20px_rgba(221,44,64,0.35)] cursor-pointer transition-all duration-300 group" 
              title="Dark Shards (Click to Open Shop)"
            >
              <img src="/icons/icon_shards.webp" alt="Shards" className="drop-shadow-[0_0_10px_rgba(239,68,68,0.7)] brightness-110 contrast-125 w-7 h-7 object-contain scale-110 group-hover:scale-125 transition-transform duration-300" />
              <span className="font-mono font-black text-rose-300 group-hover:text-white text-sm tracking-wide transition-colors ml-0.5">{profile.darkShards}</span>
              <div className="w-5 h-5 rounded-full bg-gradient-to-b from-[#e11d48] via-[#be123c] to-[#881337] group-hover:from-[#f43f5e] group-hover:to-[#9f1239] text-white flex items-center justify-center border border-rose-300/40 shadow-[0_0_10px_rgba(225,29,72,0.6)] group-hover:shadow-[0_0_14px_rgba(244,63,94,0.9)] group-hover:scale-110 active:scale-95 transition-all duration-300 ml-0.5">
                <Plus className="w-3 h-3 stroke-[3] text-white drop-shadow-sm" />
              </div>
            </div>

            {/* Blood Sovereigns (Convertible to USDT) */}
            <div 
              onClick={() => {
                if (onNavigateTab) onNavigateTab('bank');
              }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-[#240810] to-[#120308] hover:from-[#350c18] hover:to-[#220710] border border-amber-500/50 hover:border-amber-400/90 rounded-full py-1 px-2.5 shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_22px_rgba(245,158,11,0.4)] cursor-pointer transition-all duration-300 group select-none hover:scale-105"
              title={`Blood Sovereigns: ${profile.bloodSovereigns || 0} (≈ $${((profile.bloodSovereigns || 0) * 0.01).toFixed(2)} USDT) • Click to Open Bank`}
            >
              <img 
                src="/icons/icon_sovereign.webp" 
                alt="Sovereigns" 
                className="drop-shadow-[0_0_12px_rgba(245,158,11,0.8)] brightness-110 contrast-125 w-7 h-7 object-contain group-hover:scale-115 transition-transform duration-300" 
              />
              <span className="font-mono font-black text-amber-300 group-hover:text-amber-100 text-sm tracking-wide transition-colors">
                {profile.bloodSovereigns || 0}
              </span>
            </div>

          </div>

          {/* User Profile and Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3 xl:ml-1 xl:border-l border-white/10 xl:pl-3 shrink-0">
            {/* Mailbox Button */}
            <button
              onClick={() => {
                setIsMailboxOpen(true);
              }}
              className={`relative w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 cursor-pointer hover:scale-110 active:scale-95 ${
                unreadMailCount > 0
                  ? 'bg-gradient-to-br from-[#2e0d16] via-[#1a070c] to-[#0d0205] border-amber-500 hover:border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.45)]'
                  : 'bg-white/5 hover:bg-white/10 border-white/15 hover:border-amber-400/60 shadow-inner'
              }`}
              title="Void Mailbox (Decrees & Rewards)"
            >
              <Mail className={`w-5 h-5 transition-transform duration-200 ${
                unreadMailCount > 0 
                  ? 'text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse' 
                  : 'text-gray-300 hover:text-amber-200'
              }`} />
              {unreadMailCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-red-600 to-rose-600 border border-white text-white font-mono text-[9px] font-black flex items-center justify-center shadow-[0_0_10px_rgba(225,29,72,0.95)] animate-bounce">
                  {unreadMailCount}
                </span>
              )}
            </button>

            {(() => {
              const isSubActive = profile.subscriptionExpiresAt && profile.subscriptionExpiresAt > Date.now();
              const tier = isSubActive ? (profile.subscriptionTier || 'free') : 'free';
              return (
                <div 
                  onClick={() => {
                    if (onNavigateTab) onNavigateTab('premium');
                  }}
                  className="flex items-center gap-2 cursor-pointer group" 
                  title={tier === 'ultra' ? 'Ultra Overlord Pass Active' : tier === 'premium' ? 'Premium Sovereign Pass Active' : 'Click to view Pass Privileges'}
                >
                  <div className="relative">
                    {profile.avatarUrl && (
                      <img 
                        src={profile.avatarUrl} 
                        alt="Avatar" 
                        className={`w-8 h-8 rounded-full object-cover transition-all duration-300 group-hover:scale-105 ${
                          tier === 'ultra'
                            ? 'ring-2 ring-purple-500 shadow-[0_0_14px_rgba(168,85,247,0.8)] border border-rose-400'
                            : tier === 'premium'
                            ? 'ring-2 ring-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.7)] border border-yellow-200'
                            : 'border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)]'
                        }`} 
                      />
                    )}
                    {tier === 'ultra' && (
                      <span className="absolute -top-2 -right-1 text-xs select-none filter drop-shadow-[0_0_4px_rgba(168,85,247,0.9)] animate-pulse">
                        💎
                      </span>
                    )}
                    {tier === 'premium' && (
                      <span className="absolute -top-1.5 -right-1 text-[10px] select-none filter drop-shadow-[0_0_4px_rgba(245,158,11,0.9)]">
                        ⚜️
                      </span>
                    )}
                  </div>
                  <span className={`font-display text-sm tracking-wide transition-colors ${
                    tier === 'ultra'
                      ? 'font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-rose-300 to-amber-300 group-hover:brightness-125'
                      : tier === 'premium'
                      ? 'font-black text-amber-300 group-hover:text-amber-200 text-shadow-gold'
                      : 'font-bold text-white group-hover:text-amber-300 text-shadow-gold'
                  }`}>
                    {profile.username || 'Voidwalker'}
                  </span>
                </div>
              );
            })()}

            {isAdmin && (
              <button
                onClick={() => {
                  setIsAdminPanelOpen(true);
                }}
                className="px-3 py-1 rounded-full bg-gradient-to-r from-red-950 via-red-900 to-black border border-red-500/80 hover:border-red-400 text-red-400 hover:text-white font-mono text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(220,38,38,0.5)] hover:scale-105 active:scale-95 transition-all cursor-pointer animate-pulse hover:animate-none"
                title="Open Master Admin Command Panel"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                <span>ADMIN</span>
              </button>
            )}
            
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to log out?')) {
                  disconnect().catch(() => {});
                  logoutPlayer();
                }
              }}
              className="bg-black/40 hover:bg-red-950/40 border border-white/10 hover:border-red-500/40 rounded-full p-2 text-gray-400 hover:text-red-400 transition-all flex items-center justify-center ml-0.5 cursor-pointer"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Referrals & Invites Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          {/* Modal Container */}
          <div className="bg-gradient-to-b from-[#180d12] via-[#10070a] to-[#080204] border border-[#ebd09b]/35 rounded-3xl w-full max-w-2xl overflow-hidden shadow-[0_0_60px_rgba(245,158,11,0.25)] relative flex flex-col animate-in zoom-in-95 duration-200 max-h-[92vh]">
            
            {/* Header */}
            <div className="border-b border-white/10 px-6 py-4 flex justify-between items-center bg-black/40">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 via-amber-600/10 to-red-950/40 border border-amber-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.25)] shrink-0 overflow-hidden">
                  <img src="/icons/referral_seal.png" alt="Covenant Seal" className="w-7 h-7 object-contain drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                </div>
                <div>
                  <h2 className="font-display font-black text-lg sm:text-xl text-white tracking-widest text-shadow-gold">
                    IMPERIAL COVENANT
                  </h2>
                  <p className="text-[11px] text-amber-200/60 font-sans mt-0.5">
                    Recruit allies into the Void & reap lifetime Sovereign tributes
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40 text-gray-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 pb-12 sm:pb-16 space-y-4 overflow-y-auto max-h-[calc(92vh-85px)] scrollbar-thin scrollbar-thumb-amber-500/20">

              {/* Personal Invitation Link Card */}
              <div className="bg-black/60 border border-white/15 rounded-2xl p-4 space-y-2.5 shadow-md">
                <div className="flex items-center justify-between text-xs text-white font-display font-bold tracking-wider uppercase">
                  <span>YOUR IMPERIAL INVITATION LINK</span>
                  <span className="text-xs font-mono text-amber-300">Share to recruit</span>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-2.5">
                  <div className="w-full bg-black/90 border border-white/20 rounded-xl px-4 py-3 font-mono text-xs sm:text-sm text-amber-200 select-all flex items-center gap-2 min-w-0">
                    <Copy className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate font-semibold">{`${window.location.origin}?ref=${profile.solanaAddress || ''}`}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                    <button
                      onClick={() => {
                        handleCopyLink();
                      }}
                      className="grow sm:grow-0 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-display font-bold px-5 py-3 rounded-xl text-xs tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase shadow-md shadow-amber-500/20 active:scale-95"
                    >
                      {copySuccess ? 'COPIED!' : <><Copy className="w-3.5 h-3.5" /> COPY</>}
                    </button>

                    <a
                      href={`https://t.me/share/url?url=${encodeURIComponent(`${window.location.origin}?ref=${profile.solanaAddress || ''}`)}&text=${encodeURIComponent('Join Void Covenant! Sign up with my link to get +1,000 Gold starter bonus!')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="grow sm:grow-0 bg-[#229ED9] hover:bg-[#229ED9]/90 text-white font-mono font-bold px-5 py-3 rounded-xl text-xs tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[#229ED9]/20 active:scale-95"
                      title="Share to Telegram"
                    >
                      <Send className="w-3.5 h-3.5" /> Telegram
                    </a>
                  </div>
                </div>
              </div>
              
              {/* HERO FEATURE: PASS BOUNTY (MAIN REFERRAL EARNINGS) */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-amber-400/60 bg-gradient-to-b from-[#2a131b] via-[#1a0c14] to-[#12070c] p-4 sm:p-5 shadow-[0_0_35px_rgba(245,158,11,0.25)]">
                {/* Decorative background glows */}
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-fuchsia-600/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.4)] shrink-0">
                        <Crown className="w-5 h-5 text-amber-300" />
                      </div>
                      <div>
                        <span className="text-xs font-mono font-black text-amber-300 uppercase tracking-widest block">
                          ⭐ PRIMARY REFERRAL REWARD
                        </span>
                        <h3 className="text-base sm:text-lg font-display font-black text-white tracking-wider text-shadow-gold">
                          SUBSCRIPTION PASS BOUNTY
                        </h3>
                      </div>
                    </div>
                    <span className="self-start sm:self-auto text-xs font-mono font-bold px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-200">
                      Instant Payout to Vault
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-white font-sans mt-2.5 leading-relaxed">
                    When any friend registered through your link purchases an Imperial Pass, you immediately receive a massive one-time Blood Sovereign bounty:
                  </p>

                  {/* Two Prominent Pass Bounty Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    {/* Premium Pass Card */}
                    <div className="bg-black/70 border-2 border-amber-500/50 hover:border-amber-400 rounded-xl p-3.5 flex items-center justify-between shadow-lg shadow-black/70 transition-all">
                      <div>
                        <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                          ⚜️ PREMIUM PASS
                        </span>
                        <p className="text-xs text-white font-sans mt-1">
                          When your friend buys a subscription
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <img src="/icons/icon_sovereign.webp" alt="SOV" className="w-9 h-9 object-contain drop-shadow-[0_0_12px_rgba(235,208,155,0.9)]" />
                        <div className="text-right">
                          <span className="text-2xl font-mono font-black text-amber-300 text-shadow-gold block leading-none">
                            +300
                          </span>
                          <span className="text-xs sm:text-sm font-mono font-bold text-amber-200 uppercase mt-0.5 block">
                            SOV ($3.00)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Ultra Pass Card */}
                    <div className="bg-black/70 border-2 border-fuchsia-500/60 hover:border-fuchsia-400 rounded-xl p-3.5 flex items-center justify-between shadow-lg shadow-black/70 transition-all">
                      <div>
                        <span className="text-xs font-mono font-bold text-fuchsia-300 uppercase tracking-wider flex items-center gap-1.5">
                          👑 ULTRA OVERLORD
                        </span>
                        <p className="text-xs text-white font-sans mt-1">
                          When your friend buys a subscription
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <img src="/icons/icon_sovereign.webp" alt="SOV" className="w-9 h-9 object-contain drop-shadow-[0_0_12px_rgba(217,70,239,0.9)]" />
                        <div className="text-right">
                          <span className="text-2xl font-mono font-black text-fuchsia-300 text-shadow-gold block leading-none">
                            +600
                          </span>
                          <span className="text-xs sm:text-sm font-mono font-bold text-fuchsia-200 uppercase mt-0.5 block">
                            SOV ($6.00)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Perks (Starter Gift & 15% Share) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Friend Starter */}
                <div className="bg-gradient-to-b from-black/80 to-black/95 border border-white/20 rounded-2xl p-4 flex items-start gap-3.5 shadow-md">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center shrink-0">
                    <img src="/icons/icon_gold.webp" alt="Gold" className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-mono font-black text-amber-300 text-shadow-gold">+1,000 GOLD</span>
                      <span className="text-xs font-mono font-bold text-amber-200 uppercase">GIFT</span>
                    </div>
                    <p className="text-xs sm:text-sm text-white font-sans mt-1 leading-relaxed">
                      Every friend who registers via your link immediately receives <strong>1,000 Gold</strong> starter bonus (non-referred players only get 500 Gold).
                    </p>
                  </div>
                </div>

                {/* 2. 15% Lifetime Share */}
                <div className="bg-gradient-to-b from-black/80 to-black/95 border border-white/20 rounded-2xl p-4 flex items-start gap-3.5 shadow-md">
                  <div className="w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/40 flex items-center justify-center shrink-0">
                    <img src="/icons/icon_sovereign.webp" alt="SOV" className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(235,208,155,0.7)]" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-mono font-black text-amber-200 text-shadow-gold">15% SOVEREIGN</span>
                      <span className="text-xs font-mono font-bold text-amber-200 uppercase">SHARE</span>
                    </div>
                    <p className="text-xs sm:text-sm text-white font-sans mt-1 leading-relaxed">
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
                  <div className="bg-gradient-to-r from-[#22100d] via-[#160a12] to-[#1c0d18] border-2 border-amber-500/50 rounded-2xl p-4 sm:p-5 shadow-[0_0_30px_rgba(245,158,11,0.2)] relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/30 to-red-950/70 border-2 border-amber-400/60 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.35)]">
                        <img 
                          src="/icons/icon_sovereign.webp" 
                          alt="SOV" 
                          className="w-10 h-10 object-contain drop-shadow-[0_0_12px_rgba(235,208,155,0.9)]" 
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.9)]" />
                          <span className="text-xs font-display font-black text-amber-300 tracking-widest uppercase">
                            COVENANT TREASURY VAULT
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-3xl sm:text-4xl font-mono font-black text-amber-200 text-shadow-gold tracking-tight">
                            {unclaimed.toFixed(2)}
                          </span>
                          <span className="text-sm font-display font-bold text-amber-400 tracking-wider">
                            SOV
                          </span>
                        </div>
                        <div className="text-xs text-white font-mono mt-1 flex items-center gap-2 flex-wrap">
                          <span>Total Earned: <strong className="text-amber-300 font-black">{(profile.referralSovereignsTotalEarned || 0).toFixed(2)} SOV</strong></span>
                          <span className="text-gray-400">•</span>
                          <span>Allies Recruited: <strong className="text-white font-black">{referralsList.length > 0 ? referralsList.length : (profile.referralsCount || 0)}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto flex flex-col items-stretch sm:items-end">
                      {wholeUnits >= 1 ? (
                        <div className="flex flex-col items-stretch sm:items-end gap-1.5 w-full sm:w-auto">
                          <button
                            onClick={handleClaimReferralSovereigns}
                            disabled={isClaimingSovereigns}
                            className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-200 text-black font-display font-black px-6 py-3 rounded-xl text-xs sm:text-sm tracking-wider transition-all shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {isClaimingSovereigns ? (
                              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Sparkles className="w-4 h-4 text-black fill-black" />
                            )}
                            TRANSFER {wholeUnits} SOV TO BANK
                          </button>
                          <span className="text-xs text-amber-200 font-mono text-center sm:text-right font-medium">
                            Directly credited to your Imperial Bank balance
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-stretch sm:items-end gap-1.5 w-full sm:w-auto">
                          <div className="bg-white/10 border border-white/20 text-gray-200 font-display font-bold px-6 py-3 rounded-xl text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 cursor-default">
                            <span>🔒 TRANSFER TO BANK</span>
                          </div>
                          <span className="text-xs text-white font-mono text-center sm:text-right font-medium">
                            Requires ≥ 1.00 SOV to transfer (accumulating automatically)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Recruited Allies Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-amber-400" />
                    <span className="text-sm font-display font-bold text-white tracking-wider uppercase">Your Recruited Allies</span>
                  </div>
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300">
                    {referralsList.length} Allies
                  </span>
                </div>

                {isLoadingReferrals ? (
                  <div className="text-center py-8">
                    <div className="w-7 h-7 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span className="text-sm text-white font-mono">Summoning covenant roster...</span>
                  </div>
                ) : referralsList.length === 0 ? (
                  <div className="text-center py-8 px-4 bg-black/40 border border-white/10 rounded-2xl">
                    <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-3 text-gray-300">
                      <UserPlus className="w-6 h-6 text-amber-300" />
                    </div>
                    <h4 className="text-base font-display font-bold text-white">No Allies Recruited Yet</h4>
                    <p className="text-sm text-white font-sans mt-1.5 max-w-md mx-auto leading-relaxed">
                      Share your recruitment link with friends to begin collecting +300 / +600 SOV pass bounties and 15% lifetime sovereign tributes!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 pb-2">
                    {referralsList.map((ref, idx) => {
                      const isUltra = ref.subscriptionTier === 'ultra';
                      const isPremium = ref.subscriptionTier === 'premium';
                      const contributed = ref.sovereignsContributed || 0;
                      return (
                        <div 
                          key={idx} 
                          className="bg-gradient-to-r from-black/70 via-black/60 to-black/80 border border-white/15 hover:border-amber-400/50 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all shadow-md"
                        >
                          {/* Left: Avatar & Info */}
                          <div className="flex items-center gap-3.5">
                            <div className={`w-11 h-11 rounded-full overflow-hidden shrink-0 border-2 ${
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
                                  <User className="w-5 h-5 text-gray-300" />
                                </div>
                              )}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm sm:text-base font-display font-bold text-white block">
                                  {ref.username}
                                </span>
                                <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-white/10 text-gray-200">
                                  LVL {ref.level || 1}
                                </span>
                              </div>
                              <span className="text-xs text-white font-mono flex items-center gap-1.5 mt-0.5">
                                <Clock className="w-3.5 h-3.5 text-gray-300" /> Joined {new Date(ref.joinedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {/* Right: Subscription Tier Badge & Money Contributed */}
                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 border-t sm:border-t-0 border-white/10 pt-2 sm:pt-0">
                            {/* Subscription Status */}
                            <div>
                              {isUltra ? (
                                <span className="text-xs font-mono font-bold text-fuchsia-200 bg-fuchsia-950/90 border border-fuchsia-400 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-[0_0_15px_rgba(217,70,239,0.4)]">
                                  <Crown className="w-3.5 h-3.5 text-fuchsia-300" /> ULTRA OVERLORD
                                </span>
                              ) : isPremium ? (
                                <span className="text-xs font-mono font-bold text-amber-200 bg-amber-950/90 border border-amber-400 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                                  ⚜️ PREMIUM PASS
                                </span>
                              ) : (
                                <span className="text-xs font-mono font-bold text-gray-300 bg-white/10 border border-white/20 px-3 py-1.5 rounded-xl">
                                  FREE TIER
                                </span>
                              )}
                            </div>

                            {/* Money Contributed by this referral */}
                            <div className="bg-amber-500/15 border border-amber-500/40 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shrink-0">
                              <span className="text-xs font-sans text-amber-200 font-bold uppercase">Earned:</span>
                              <img src="/icons/icon_sovereign.webp" alt="SOV" className="w-4 h-4 object-contain drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                              <span className="text-sm font-mono font-black text-amber-300">
                                {contributed > 0 ? `+${contributed.toFixed(2)}` : '0.00'} SOV
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {/* Generous bottom breathing spacer so the last item is never clipped */}
                <div className="h-6 sm:h-8 shrink-0" />
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Void Mailbox Modal */}
      <MailboxModal isOpen={isMailboxOpen} onClose={() => setIsMailboxOpen(false)} />

      {/* Master Admin Panel Modal */}
      <AdminPanelModal isOpen={isAdminPanelOpen} onClose={() => setIsAdminPanelOpen(false)} />
    </div>
  );
};

