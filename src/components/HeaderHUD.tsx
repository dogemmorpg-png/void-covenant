import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { LogOut, Copy, X, Share2, Trophy, User, Clock, Plus } from 'lucide-react';
import { audioSystem } from '../utils/AudioSystem';

export const HeaderHUD: React.FC = () => {
  const { profile, logoutPlayer, isShardsShopOpen, setIsShardsShopOpen } = useGame();
  const { disconnect } = useWallet();

  const [timeUntilRegen, setTimeUntilRegen] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [referralsList, setReferralsList] = useState<any[]>([]);
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

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
        const res = await fetch('/api/referrals', {
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
  useEffect(() => {
    const pveRegenTime = 1200000;
    
    const updateTimer = () => {
      if (profile.pveEnergy >= profile.pveEnergyMax) {
        setTimeUntilRegen('');
        return;
      }
      
      const lastPve = profile.lastPveEnergyRefill ?? profile.lastEnergyRefill;
      const timePassed = Date.now() - lastPve;
      const timeLeft = Math.max(0, pveRegenTime - (timePassed % pveRegenTime));
      
      const minutes = Math.floor(timeLeft / 60000);
      const seconds = Math.floor((timeLeft % 60000) / 1000);
      setTimeUntilRegen(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [profile.pveEnergy, profile.pveEnergyMax, profile.lastPveEnergyRefill, profile.lastEnergyRefill]);

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

        {/* Dark Brotherhood Referral Button */}
        <button
          onClick={() => {
            audioSystem.playClick();
            setIsModalOpen(true);
          }}
          className="bg-gradient-to-r from-[#221811]/95 via-[#18110b]/95 to-[#0e0906]/95 hover:from-[#382618] hover:to-[#1f150d] border border-amber-500/50 hover:border-amber-400 rounded-full px-4 py-1.5 flex items-center gap-2.5 text-xs font-display font-black text-amber-200 hover:text-white tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(235,208,155,0.12)] hover:shadow-[0_0_20px_rgba(235,208,155,0.3)] group"
        >
          <img 
            src="/icons/referral_seal.png" 
            alt="Brotherhood Seal" 
            className="w-5 h-5 object-contain drop-shadow-[0_0_8px_rgba(235,208,155,0.7)] group-hover:rotate-12 transition-transform duration-300" 
          />
          <span className="text-shadow-gold uppercase tracking-wider">ALLIES PACT</span>
        </button>

        {/* Resources Panel */}
        <div className="flex flex-wrap xl:flex-nowrap items-center justify-center xl:justify-end gap-3 text-sm w-full">
          {/* Resources Group */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {/* Gold */}
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors cursor-default py-1 px-3 shadow-inner" title="Gold (For basic packs and upgrades)">
              <img src="/icons/icon_gold.webp" alt="Gold" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-8 h-8 object-contain " />
              <span className="font-mono font-bold text-amber-400">{profile.gold}</span>
            </div>

            {/* Dust */}
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors cursor-default py-1 px-3 shadow-inner" title="Dark Dust (For skill enhancement)">
              <img src="/icons/icon_dust.webp" alt="Dust" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-8 h-8 object-contain " />
              <span className="font-mono font-bold text-[#66fcf1]">{profile.dust}</span>
            </div>

            {/* Shards */}
            <div 
              onClick={() => {
                audioSystem.playClick();
                setIsShardsShopOpen(true);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-[#1c080d] to-[#120508] hover:from-[#2a0c13] hover:to-[#1a070c] border border-red-500/40 hover:border-red-400/80 rounded-full py-1 pl-2.5 pr-1.5 shadow-[0_0_15px_rgba(221,44,64,0.15)] hover:shadow-[0_0_20px_rgba(221,44,64,0.35)] cursor-pointer transition-all duration-300 group" 
              title="Dark Shards (Click to Open Shop)"
            >
              <img src="/icons/icon_shards.webp" alt="Shards" className="drop-shadow-[0_0_10px_rgba(239,68,68,0.6)] brightness-110 contrast-125 w-7 h-7 object-contain group-hover:scale-110 transition-transform duration-300" />
              <span className="font-mono font-black text-rose-300 group-hover:text-white text-sm tracking-wide transition-colors ml-0.5">{profile.darkShards}</span>
              <div className="w-6 h-6 rounded-full bg-gradient-to-b from-[#e11d48] via-[#be123c] to-[#881337] group-hover:from-[#f43f5e] group-hover:to-[#9f1239] text-white flex items-center justify-center border border-rose-300/40 shadow-[0_0_10px_rgba(225,29,72,0.6)] group-hover:shadow-[0_0_14px_rgba(244,63,94,0.9)] group-hover:scale-110 active:scale-95 transition-all duration-300 ml-1">
                <Plus className="w-3.5 h-3.5 stroke-[3] text-white drop-shadow-sm" />
              </div>
            </div>

            {/* PvE Energy (Main Energy) */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors cursor-default py-1 px-3 shadow-inner" title="Energy (Restores 1 per 20 mins)">
              <img src="/icons/icon_energy.webp" alt="Energy" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-8 h-8 object-contain " />
              <div className="flex flex-col">
                <span className="font-mono text-xs font-bold text-emerald-400">
                  Energy: {profile.pveEnergy}/{profile.pveEnergyMax}
                </span>
                {timeUntilRegen && (
                  <span className="font-mono text-[8px] text-emerald-400/80 -mt-0.5 tracking-widest text-center">
                    +1 IN {timeUntilRegen}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* User Profile and Controls */}
          <div className="flex items-center gap-2 sm:gap-3 xl:ml-2 xl:border-l border-white/10 xl:pl-4 mt-2 xl:mt-0">
            <div className="flex items-center gap-2">
              {profile.avatarUrl && (
                <img src={profile.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full border border-white/20 object-cover shadow-[0_0_10px_rgba(255,255,255,0.1)]" />
              )}
              <span className="font-display font-bold text-white text-sm text-shadow-gold tracking-wide">
                {profile.username || 'Voidwalker'}
              </span>
            </div>
            
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to log out?')) {
                  disconnect().catch(() => {});
                  logoutPlayer();
                }
              }}
              className="bg-black/40 hover:bg-red-950/40 border border-white/10 hover:border-red-500/40 rounded-full p-2 text-gray-400 hover:text-red-400 transition-all flex items-center justify-center ml-1"
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
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          {/* Modal content with ornate gothic border */}
          <div className="bg-gradient-to-b from-[#1c140e] via-[#110d0a] to-[#070504] border-2 border-amber-500/40 rounded-3xl w-full max-w-2xl overflow-hidden shadow-[0_0_70px_rgba(235,208,155,0.18)] relative flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Top decorative gradient line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-80 h-28 bg-amber-500/10 blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="border-b border-amber-500/20 p-5 flex justify-between items-center bg-black/40 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-black/70 border border-amber-500/50 flex items-center justify-center shadow-inner shrink-0">
                  <img 
                    src="/icons/referral_seal.png" 
                    alt="Brotherhood" 
                    className="w-8 h-8 object-contain drop-shadow-[0_0_10px_rgba(235,208,155,0.8)]" 
                  />
                </div>
                <div>
                  <h3 className="font-display font-black text-amber-200 text-base sm:text-lg tracking-widest uppercase text-shadow-gold flex items-center gap-2">
                    DARK BROTHERHOOD PACT
                  </h3>
                  <p className="text-[10px] text-amber-400/70 font-mono tracking-wider">
                    BIND ALLIES TO YOUR BANNER & CLAIM ANCIENT BOUNTIES
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-black/50 hover:bg-amber-950/60 border border-white/10 hover:border-amber-500/40 text-gray-400 hover:text-amber-200 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar relative z-10">
              
              {/* 2 Visual Reward Showcase Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* 1. Ally Reward Card */}
                <div className="bg-gradient-to-b from-[#251a11]/90 via-[#150f09]/95 to-black border border-amber-500/30 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-amber-500/60 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-28 h-28 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.15),transparent_70%)] pointer-events-none" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-black tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      INITIATE GIFT
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">For New Ally</span>
                  </div>

                  <div className="flex items-center gap-3.5 my-3">
                    <div className="w-14 h-14 rounded-2xl bg-black/60 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-inner">
                      <img 
                        src="/icons/icon_gold.webp" 
                        alt="Gold" 
                        className="w-10 h-10 object-contain drop-shadow-[0_0_12px_rgba(245,158,11,0.6)] group-hover:scale-110 transition-transform duration-300" 
                      />
                    </div>
                    <div>
                      <div className="text-2xl font-mono font-black text-amber-300 leading-none flex items-center gap-1.5">
                        +200 <span className="text-xs text-amber-400/80 font-sans font-bold uppercase">Gold</span>
                      </div>
                      <p className="text-[11px] text-gray-300 font-sans mt-1 leading-tight">
                        Instant starter bonus upon registering with your pact link.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Master's Bounty Card */}
                <div className="bg-gradient-to-b from-[#2a141c]/90 via-[#180a10]/95 to-black border border-rose-500/30 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-rose-500/60 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-28 h-28 bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.15),transparent_70%)] pointer-events-none" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-black tracking-wider uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      MASTER BOUNTY
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">When Ally Reaches Lvl 10</span>
                  </div>

                  <div className="flex items-center gap-3.5 my-3">
                    <div className="w-14 h-14 rounded-2xl bg-black/60 border border-rose-500/40 flex items-center justify-center shrink-0 shadow-inner">
                      <Trophy className="w-8 h-8 text-amber-300 drop-shadow-[0_0_12px_rgba(245,158,11,0.6)] group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div>
                      <div className="text-lg font-mono font-black text-amber-300 leading-none flex items-center gap-2">
                        <span>+1,000 <span className="text-xs text-amber-400/80 font-sans font-bold">Gold</span></span>
                        <span className="text-gray-500 font-normal">&</span>
                        <span className="text-[#66fcf1]">+100 <span className="text-xs text-[#66fcf1]/80 font-sans font-bold">Dust</span></span>
                      </div>
                      <p className="text-[11px] text-gray-300 font-sans mt-1 leading-tight">
                        Awarded to you automatically when your ally reaches Level 10.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Referral Link Copy Section (Ancient Sealed Parchment Plate) */}
              <div className="bg-gradient-to-r from-[#17110c] via-[#110d09] to-[#17110c] border border-amber-500/30 rounded-2xl p-3.5 sm:p-4 space-y-2.5 shadow-inner">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono font-bold text-amber-300/80 uppercase tracking-widest flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-amber-400" /> Your Covenant Invitation Link
                  </label>
                  <span className="text-[10px] text-gray-400 font-mono">1-Click Share</span>
                </div>

                <div className="bg-black/80 border border-amber-500/20 rounded-xl p-1.5 flex flex-col sm:flex-row items-center gap-2">
                  <div className="px-3 py-2 font-mono text-xs text-amber-200/90 overflow-x-auto whitespace-nowrap grow select-all w-full text-center sm:text-left scrollbar-thin">
                    {`${window.location.origin}?ref=${profile.solanaAddress || ''}`}
                  </div>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        audioSystem.playClick();
                        handleCopyLink();
                      }}
                      className="grow sm:grow-0 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-display font-black px-5 py-2 rounded-lg text-xs tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.3)] active:scale-95 cursor-pointer uppercase shrink-0"
                    >
                      {copySuccess ? (
                        'COPIED!'
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> COPY LINK
                        </>
                      )}
                    </button>

                    <a
                      href={`https://t.me/share/url?url=${encodeURIComponent(`${window.location.origin}?ref=${profile.solanaAddress || ''}`)}&text=${encodeURIComponent('Join me in Void Covenant! Sign the Dark Covenant and receive +200 Gold starter bonus!')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-[#229ED9]/20 hover:bg-[#229ED9]/40 border border-[#229ED9]/40 text-[#229ED9] hover:text-white px-3 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center shrink-0"
                      title="Share to Telegram"
                    >
                      TELEGRAM
                    </a>
                  </div>
                </div>
              </div>

              {/* Stats overview (Artifact look) */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="bg-gradient-to-b from-[#14100c] to-black border border-amber-500/20 rounded-2xl p-3.5 text-center group hover:border-amber-500/40 transition-all">
                  <span className="block text-[9px] font-mono text-gray-400 uppercase tracking-widest">Allies Recruited</span>
                  <span className="text-2xl font-display font-black text-amber-300 text-shadow-gold mt-1 block flex items-center justify-center gap-1.5">
                    👥 {profile.referralsCount || 0}
                  </span>
                </div>
                <div className="bg-gradient-to-b from-[#14100c] to-black border border-amber-500/20 rounded-2xl p-3.5 text-center group hover:border-amber-500/40 transition-all">
                  <span className="block text-[9px] font-mono text-gray-400 uppercase tracking-widest">Total Bounty Claimed</span>
                  <span className="text-2xl font-display font-black text-amber-300 text-shadow-gold mt-1 block flex items-center justify-center gap-1">
                    <img src="/icons/icon_gold.webp" alt="Gold" className="w-6 h-6 object-contain inline-block drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]" />
                    {((profile.referralsCount || 0) * 1000).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Referrals list (Immersive Card layout) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                  <h4 className="font-display font-bold text-xs text-amber-200 uppercase tracking-widest flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-400" /> Covenant Allies Ledger
                  </h4>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {referralsList.length} Active Records
                  </span>
                </div>
                
                {isLoadingReferrals ? (
                  <div className="text-center py-8 border border-amber-500/20 bg-black/40 rounded-2xl">
                    <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span className="text-xs text-gray-400 font-mono animate-pulse">Consulting the dark ledger...</span>
                  </div>
                ) : referralsList.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-amber-500/20 rounded-2xl bg-black/30 text-xs text-gray-400 font-sans px-4 leading-relaxed">
                    No summoners have pledged their allegiance yet. <br />
                    Share your invitation link to recruit allies and earn master bounties.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1 custom-scrollbar">
                    {referralsList.map((ref, idx) => (
                      <div 
                        key={idx} 
                        className="bg-gradient-to-r from-[#17120d] to-[#0c0907] border border-amber-500/20 hover:border-amber-500/40 rounded-xl p-3 flex items-center justify-between transition-all duration-200"
                      >
                        {/* Summoner Name & Join Date */}
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-b from-amber-500/20 to-black border border-amber-500/40 overflow-hidden shadow-inner shrink-0 flex items-center justify-center">
                            {ref.avatarUrl ? (
                              <img src={ref.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-4 h-4 text-amber-300" />
                            )}
                          </div>
                          <div>
                            <span className="font-display font-black text-sm text-gray-200 block tracking-wide">
                              {ref.username}
                            </span>
                            <span className="text-[9px] text-gray-400 font-mono flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-amber-400/60" /> Joined {new Date(ref.joinedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        {/* Level Badge */}
                        <div className="flex items-center gap-2">
                          {ref.level >= 10 ? (
                            <span className="font-mono text-[9px] font-black text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-lg tracking-wider uppercase shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                              LVL {ref.level} • BOUNTY CLAIMED
                            </span>
                          ) : (
                            <span className="font-mono text-[9px] font-black text-amber-300 bg-amber-950/40 border border-amber-500/30 px-2.5 py-1 rounded-lg tracking-wider uppercase">
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
    </div>
  );
};
