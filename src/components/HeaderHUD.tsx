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

        {/* Invite Friends Button (Middle empty space) */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-amber-600/10 to-amber-900/10 hover:from-amber-600/20 hover:to-amber-900/20 border border-amber-500/40 hover:border-amber-400 rounded-full px-4 py-1.5 flex items-center gap-2 text-xs font-display font-black text-[#ebd09b] tracking-wider transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] cursor-pointer shadow-[0_0_10px_rgba(197,168,128,0.1)] hover:shadow-[0_0_15px_rgba(197,168,128,0.25)]"
        >
          <span className="animate-pulse">👥</span> INVITE FRIENDS
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          {/* Modal content with ornate gothic border */}
          <div className="bg-gradient-to-b from-[#1a1f26] via-[#10141a] to-[#090b0e] border-2 border-[#ebd09b]/35 rounded-2xl w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(235,208,155,0.15)] relative flex flex-col">
            
            {/* Glow overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(235,208,155,0.03)_0%,transparent_70%)] pointer-events-none" />

            {/* Corner Decorative Brackets */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#ebd09b]/60 pointer-events-none" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#ebd09b]/60 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#ebd09b]/60 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#ebd09b]/60 pointer-events-none" />

            {/* Header */}
            <div className="border-b border-[#ebd09b]/15 p-5 flex justify-between items-center bg-black/40 relative z-10">
              <h3 className="font-display font-black text-[#ebd09b] text-base tracking-widest flex items-center gap-2.5 text-shadow-gold">
                <Share2 className="w-5 h-5 text-[#ebd09b]" /> DARK BROTHERHOOD ORDER
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-[#ebd09b] transition-colors p-1.5 rounded-full hover:bg-[#ebd09b]/5 cursor-pointer border border-transparent hover:border-[#ebd09b]/25"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar relative z-10">
              
              {/* Rewards info (Ancient Scroll theme) */}
              <div className="bg-gradient-to-br from-[#1c1712] to-[#120f0c] border border-[#ebd09b]/20 rounded-xl p-5 shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[url('/icons/icon_gold.webp')] bg-contain bg-no-repeat opacity-5 pointer-events-none -mr-4 -mt-4" />
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#ebd09b]/10 border border-[#ebd09b]/30 flex items-center justify-center shrink-0 shadow-lg">
                    <Trophy className="w-5 h-5 text-[#ebd09b]" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-display font-black text-xs text-[#ebd09b] uppercase tracking-widest">Recruitment Bounty</h4>
                    <p className="text-xs text-gray-300 leading-relaxed font-sans">
                      Expand the influence of the Dark Covenant by inviting fellow summoners. When they sign the pact using your link:
                    </p>
                    <div className="space-y-2 mt-3 pt-3 border-t border-[#ebd09b]/10">
                      <div className="flex items-center gap-2 text-[11px] text-gray-300">
                        <span className="text-[#ebd09b] text-[9px] shrink-0">◆</span>
                        <span>
                          They receive: <strong className="text-amber-400 font-mono">200 Gold</strong> starter bonus immediately
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-gray-300">
                        <span className="text-[#ebd09b] text-[9px] shrink-0">◆</span>
                        <span>
                          You receive: <strong className="text-amber-400 font-mono">1,000 Gold</strong> & <strong className="text-[#66fcf1] font-mono">100 Dust</strong> once they reach <strong className="text-emerald-400">Level 10</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Runic Separator */}
              <div className="flex items-center justify-center my-4">
                <div className="h-[1px] bg-gradient-to-r from-transparent via-[#ebd09b]/25 to-transparent w-full" />
                <div className="w-1.5 h-1.5 rotate-45 border border-[#ebd09b] bg-black mx-3 shrink-0" />
                <div className="h-[1px] bg-gradient-to-r from-transparent via-[#ebd09b]/25 to-transparent w-full" />
              </div>

              {/* Referral Link Copy Section (Dark Metal Plate theme) */}
              <div className="space-y-2.5">
                <label className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">
                  Your Unique Invitation Link
                </label>
                <div className="bg-black/85 border border-[#ebd09b]/15 rounded-xl p-1.5 flex flex-col sm:flex-row items-center gap-2 shadow-inner">
                  <div className="px-3 py-2 font-mono text-xs text-[#ebd09b]/80 overflow-x-auto whitespace-nowrap grow select-all w-full text-center sm:text-left scrollbar-thin">
                    {`${window.location.origin}?ref=${profile.solanaAddress || ''}`}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="w-full sm:w-auto bg-gradient-to-b from-[#ebd09b] to-[#c5a880] hover:from-[#f3ddb3] hover:to-[#ebd09b] text-black font-display font-black px-6 py-2.5 rounded-lg text-xs tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer border-t border-white/20 uppercase"
                  >
                    {copySuccess ? (
                      'COPIED!'
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> COPY LINK
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Stats overview (Artifact look) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-b from-[#0f1318] to-[#07090c] border border-gray-800/80 rounded-xl p-4 text-center relative group hover:border-[#ebd09b]/25 transition-all">
                  <span className="block text-[9px] font-mono text-gray-500 uppercase tracking-widest">Allies Recruited</span>
                  <span className="text-2xl font-display font-black text-amber-400 text-shadow-gold mt-1.5 block flex items-center justify-center gap-1.5">
                    👥 {profile.referralsCount || 0}
                  </span>
                </div>
                <div className="bg-gradient-to-b from-[#0f1318] to-[#07090c] border border-gray-800/80 rounded-xl p-4 text-center relative group hover:border-[#ebd09b]/25 transition-all">
                  <span className="block text-[9px] font-mono text-gray-500 uppercase tracking-widest">Bounty Earned</span>
                  <span className="text-2xl font-display font-black text-amber-400 text-shadow-gold mt-1 block flex items-center justify-center gap-1">
                    <img src="/icons/icon_gold.webp" alt="Gold" className="w-7 h-7 object-contain inline-block drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]" />
                    {((profile.referralsCount || 0) * 1000).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Referrals list (Immersive Card layout instead of generic table) */}
              <div className="space-y-3.5">
                <h4 className="font-display font-bold text-xs text-[#ebd09b] uppercase tracking-widest flex items-center gap-2">
                  <User className="w-4 h-4 text-[#ebd09b]" /> Referred Allies List
                </h4>
                
                {isLoadingReferrals ? (
                  <div className="text-center py-10 border border-gray-850 bg-black/10 rounded-xl">
                    <div className="w-6 h-6 border-2 border-[#ebd09b] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <span className="text-xs text-gray-400 font-mono animate-pulse">Consulting the dark ledger...</span>
                  </div>
                ) : referralsList.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-[#ebd09b]/15 rounded-xl bg-black/10 text-xs text-gray-500 font-sans px-4 leading-relaxed">
                    No summoners have pledged their allegiance yet. <br />
                    Share your invitation link to recruit brothers into the Order.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                    {referralsList.map((ref, idx) => (
                      <div 
                        key={idx} 
                        className="bg-gradient-to-r from-[#14181f] to-[#0d1014] border border-gray-850/80 hover:border-[#ebd09b]/25 rounded-xl p-3 flex items-center justify-between transition-all duration-200"
                      >
                        {/* Summoner Name & Join Date */}
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-b from-[#ebd09b]/20 to-black border border-[#ebd09b]/40 overflow-hidden shadow-inner shrink-0 flex items-center justify-center">
                            {ref.avatarUrl ? (
                              <img src={ref.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-3.5 h-3.5 text-[#ebd09b]" />
                            )}
                          </div>
                          <div>
                            <span className="font-display font-black text-sm text-gray-200 block tracking-wide">
                              {ref.username}
                            </span>
                            <span className="text-[9px] text-gray-500 font-mono flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" /> Joined {new Date(ref.joinedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        {/* Level Badge */}
                        <div className="flex items-center gap-2">
                          {ref.level >= 10 ? (
                            <span className="font-mono text-[9px] font-black text-emerald-400 bg-emerald-950/40 border border-emerald-500/35 px-2.5 py-1 rounded-md tracking-wider uppercase">
                              LVL {ref.level} • COMPLETED
                            </span>
                          ) : (
                            <span className="font-mono text-[9px] font-black text-amber-500 bg-amber-950/20 border border-amber-500/25 px-2.5 py-1 rounded-md tracking-wider uppercase">
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
