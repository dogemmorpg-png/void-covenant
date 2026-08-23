import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { Coins, Database, Gem, Zap, LogOut, Volume2, VolumeX, Copy, X, Share2, Trophy, ExternalLink, User, Clock } from 'lucide-react';
import { audioSystem } from '../utils/AudioSystem';

export const HeaderHUD: React.FC = () => {
  const { profile, logoutPlayer, soundOn, toggleSound } = useGame();
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
    audioSystem.setEnabled(soundOn);
  }, [soundOn]);

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
              <img src="/icons/icon_gold.png" alt="Gold" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-8 h-8 object-contain " />
              <span className="font-mono font-bold text-amber-400">{profile.gold}</span>
            </div>

            {/* Dust */}
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors cursor-default py-1 px-3 shadow-inner" title="Dark Dust (For skill enhancement)">
              <img src="/icons/icon_dust.png" alt="Dust" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-8 h-8 object-contain " />
              <span className="font-mono font-bold text-[#66fcf1]">{profile.dust}</span>
            </div>

            {/* Shards */}
            <div className="flex items-center gap-1.5 bg-red-500/5 border border-red-500/20 rounded-full hover:bg-red-500/10 transition-colors cursor-default py-1 px-3 shadow-inner" title="Dark Shards (Premium currency)">
              <img src="/icons/icon_shards.png" alt="Shards" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-8 h-8 object-contain " />
              <span className="font-mono font-bold text-[#dd2c40]">{profile.darkShards}</span>
            </div>

            {/* PvE Energy (Main Energy) */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors cursor-default py-1 px-3 shadow-inner" title="Energy (Restores 1 per 20 mins)">
              <img src="/icons/icon_energy.png" alt="Energy" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-8 h-8 object-contain " />
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
            {/* Sound Toggle */}
            <button 
              onClick={toggleSound}
              className="bg-black/40 hover:bg-gray-800 border border-white/10 hover:border-gray-500/40 rounded-full p-2 text-gray-400 hover:text-white transition-all flex items-center justify-center"
              title="Toggle Audio"
            >
              {soundOn ? <Volume2 className="w-4 h-4 text-[#ebd09b]" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
            </button>

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          {/* Modal content */}
          <div className="bg-[#151a21] border border-[#c5a880]/30 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col gothic-glow">
            
            {/* Header */}
            <div className="border-b border-[#c5a880]/15 p-4 flex justify-between items-center bg-black/30">
              <h3 className="font-display font-black text-[#ebd09b] text-base tracking-widest flex items-center gap-2">
                <Share2 className="w-5 h-5 text-[#ebd09b]" /> DARK BROTHERHOOD ORDER
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              
              {/* Rewards info */}
              <div className="bg-amber-600/5 border border-[#c5a880]/20 rounded-xl p-4 flex items-start gap-3">
                <Trophy className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-display font-bold text-xs text-white uppercase tracking-wider">Recruitment Bounty</h4>
                  <p className="text-xs text-gray-300 leading-relaxed font-sans">
                    Invite new summoners to join the Covenant. When they sign the pact:
                  </p>
                  <ul className="list-disc list-inside text-xs text-gray-400 space-y-1 font-sans mt-2">
                    <li>You receive <span className="text-amber-400 font-bold">1,000 Gold</span> & <span className="text-cyan-400 font-bold">100 Dust</span></li>
                    <li>They receive a starter bonus of <span className="text-amber-400 font-bold">200 Gold</span></li>
                  </ul>
                </div>
              </div>

              {/* Referral Link Copy Section */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">
                  Your Invitation Link
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="bg-black/60 border border-gray-800 rounded-xl px-4 py-3 font-mono text-xs text-[#ebd09b] overflow-x-auto whitespace-nowrap grow select-all">
                    {`${window.location.origin}?ref=${profile.solanaAddress || ''}`}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="bg-[#ebd09b] hover:bg-[#c5a880] text-black font-display font-black px-6 py-3 rounded-xl text-xs tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0"
                  >
                    {copySuccess ? 'COPIED!' : (
                      <>
                        <Copy className="w-4 h-4" /> COPY
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Stats overview */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 border border-gray-800 rounded-xl p-3 text-center">
                  <span className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider">Total Recruits</span>
                  <span className="text-xl font-display font-black text-amber-400">{profile.referralsCount || 0}</span>
                </div>
                <div className="bg-black/40 border border-gray-800 rounded-xl p-3 text-center">
                  <span className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider">Active Bonuses</span>
                  <span className="text-xl font-display font-black text-cyan-400">{(profile.referralsCount || 0) * 1000} Gold</span>
                </div>
              </div>

              {/* Referrals table */}
              <div className="space-y-3">
                <h4 className="font-display font-bold text-xs text-white uppercase tracking-wider">Referred Allies List</h4>
                
                {isLoadingReferrals ? (
                  <div className="text-center py-6 text-xs text-gray-400 font-mono animate-pulse">
                    Retrieving brotherhood records...
                  </div>
                ) : referralsList.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-gray-800 rounded-xl text-xs text-gray-500 font-sans">
                    No allies have joined your cause yet. Share your invitation link to expand your influence!
                  </div>
                ) : (
                  <div className="border border-gray-800 rounded-xl overflow-hidden bg-black/20">
                    <table className="w-full border-collapse font-sans text-xs">
                      <thead>
                        <tr className="bg-black/50 text-gray-400 border-b border-gray-800 font-mono text-[10px] uppercase tracking-wider">
                          <th className="px-4 py-2.5 text-left font-bold">Summoner</th>
                          <th className="px-4 py-2.5 text-center font-bold">Level</th>
                          <th className="px-4 py-2.5 text-right font-bold">Joined At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/50">
                        {referralsList.map((ref, idx) => (
                          <tr key={idx} className="hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3 flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                                <User className="w-3 h-3 text-amber-400" />
                              </div>
                              <span className="font-bold text-gray-200">{ref.username}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono font-bold px-2 py-0.5 rounded-full">
                                LVL {ref.level}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right text-gray-400 font-mono text-[10px]">
                              {new Date(ref.joinedAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
