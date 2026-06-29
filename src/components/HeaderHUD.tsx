import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { Coins, Database, Gem, Zap, LogOut, Volume2, VolumeX } from 'lucide-react';
import { audioSystem } from '../utils/AudioSystem';

export const HeaderHUD: React.FC = () => {
  const { profile, logoutPlayer, soundOn, toggleSound } = useGame();
  const { disconnect } = useWallet();

  const [timeUntilRegen, setTimeUntilRegen] = useState<string>('');

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

          {/* User Profile */}
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
    </div>
  );
};
