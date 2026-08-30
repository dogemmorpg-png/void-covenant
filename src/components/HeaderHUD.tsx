import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { LogOut, Copy, X, Trophy, User, Clock, Plus, UserPlus, Send, Mail, ShieldAlert } from 'lucide-react';
import { audioSystem } from '../utils/AudioSystem';
import { MailboxModal } from './MailboxModal';
import { AdminPanelModal } from './AdminPanelModal';

interface HeaderHUDProps {
  onNavigateTab?: (tab: string) => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({ onNavigateTab }) => {
  const { profile, logoutPlayer, isShardsShopOpen, setIsShardsShopOpen } = useGame();
  const { disconnect } = useWallet();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMailboxOpen, setIsMailboxOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [referralsList, setReferralsList] = useState<any[]>([]);
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(false);
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
            audioSystem.playClick();
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
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors cursor-default py-1 px-2.5 shadow-inner" title="Gold (For basic packs and upgrades)">
              <img src="/icons/icon_gold.webp" alt="Gold" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 object-contain" />
              <span className="font-mono font-bold text-amber-400 text-sm">{profile.gold}</span>
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
                audioSystem.playClick();
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

            <div className="flex items-center gap-2">
              {profile.avatarUrl && (
                <img src={profile.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full border border-white/20 object-cover shadow-[0_0_10px_rgba(255,255,255,0.1)]" />
              )}
              <span className="font-display font-bold text-white text-sm text-shadow-gold tracking-wide">
                {profile.username || 'Voidwalker'}
              </span>
            </div>

            {isAdmin && (
              <button
                onClick={() => {
                  audioSystem.playClick();
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
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          {/* Modal Container */}
          <div className="bg-[#141820] border border-amber-500/30 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="border-b border-white/10 p-5 flex justify-between items-center bg-black/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="font-display font-bold text-white text-base sm:text-lg tracking-wider">
                  INVITE FRIENDS
                </h3>
              </div>

              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Reward Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Friend Reward */}
                <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
                  <span className="text-[11px] font-sans text-gray-400 font-medium">Friend receives on sign up</span>
                  <div className="mt-2 flex items-center gap-2">
                    <img src="/icons/icon_gold.webp" alt="Gold" className="w-7 h-7 object-contain" />
                    <span className="text-xl font-mono font-bold text-amber-400">+200 Gold</span>
                  </div>
                </div>

                {/* You Reward */}
                <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
                  <span className="text-[11px] font-sans text-gray-400 font-medium">You receive on Level 10</span>
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <span className="text-lg font-mono font-bold text-amber-400 flex items-center gap-1">
                      <img src="/icons/icon_gold.webp" alt="Gold" className="w-5 h-5 object-contain" /> +1,000
                    </span>
                    <span className="text-gray-500 font-bold">&</span>
                    <span className="text-lg font-mono font-bold text-[#66fcf1] flex items-center gap-1">
                      <img src="/icons/icon_dust.webp" alt="Dust" className="w-5 h-5 object-contain" /> +100
                    </span>
                  </div>
                </div>
              </div>

              {/* Link Copy Box */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-gray-400 font-sans font-medium">Your Invitation Link</label>
                <div className="bg-black/60 border border-white/10 rounded-xl p-1.5 flex flex-col sm:flex-row items-center gap-2">
                  <div className="px-3 py-2 font-mono text-xs text-amber-200/90 overflow-x-auto whitespace-nowrap grow select-all w-full text-center sm:text-left">
                    {`${window.location.origin}?ref=${profile.solanaAddress || ''}`}
                  </div>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        audioSystem.playClick();
                        handleCopyLink();
                      }}
                      className="grow sm:grow-0 bg-amber-500 hover:bg-amber-400 text-black font-display font-bold px-4 py-2 rounded-lg text-xs tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase shrink-0"
                    >
                      {copySuccess ? 'COPIED!' : <><Copy className="w-3.5 h-3.5" /> COPY</>}
                    </button>

                    <a
                      href={`https://t.me/share/url?url=${encodeURIComponent(`${window.location.origin}?ref=${profile.solanaAddress || ''}`)}&text=${encodeURIComponent('Join Void Covenant! Sign up with my link to get +200 Gold starter bonus!')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-[#229ED9]/20 hover:bg-[#229ED9]/30 text-[#229ED9] hover:text-white px-3 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
                      title="Share to Telegram"
                    >
                      <Send className="w-3.5 h-3.5" /> Telegram
                    </a>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/30 border border-white/5 rounded-xl p-3 text-center">
                  <span className="text-[10px] font-sans text-gray-500 uppercase font-semibold">Friends Invited</span>
                  <span className="text-xl font-mono font-bold text-amber-400 mt-0.5 block">
                    {profile.referralsCount || 0}
                  </span>
                </div>
                <div className="bg-black/30 border border-white/5 rounded-xl p-3 text-center">
                  <span className="text-[10px] font-sans text-gray-500 uppercase font-semibold">Total Gold Earned</span>
                  <span className="text-xl font-mono font-bold text-amber-400 mt-0.5 block flex items-center justify-center gap-1">
                    <img src="/icons/icon_gold.webp" alt="Gold" className="w-5 h-5 object-contain inline-block" />
                    {((profile.referralsCount || 0) * 1000).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Friends List */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between border-b border-white/5 pb-1">
                  <span className="text-xs font-display font-bold text-gray-300">Invited Friends List</span>
                  <span className="text-[10px] text-gray-500 font-mono">{referralsList.length} Friends</span>
                </div>

                {isLoadingReferrals ? (
                  <div className="text-center py-6">
                    <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span className="text-xs text-gray-500 font-mono">Loading friends...</span>
                  </div>
                ) : referralsList.length === 0 ? (
                  <div className="text-center py-6 text-xs text-gray-500 font-sans">
                    No friends have joined using your link yet.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {referralsList.map((ref, idx) => (
                      <div 
                        key={idx} 
                        className="bg-black/40 border border-white/5 rounded-xl p-2.5 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
                            {ref.avatarUrl ? (
                              <img src={ref.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block">{ref.username}</span>
                            <span className="text-[9px] text-gray-500 font-mono flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" /> {new Date(ref.joinedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div>
                          {ref.level >= 10 ? (
                            <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                              LVL {ref.level} • REWARD CLAIMED
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded-md">
                              LVL {ref.level}/10 • IN PROGRESS
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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

