import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Clock } from 'lucide-react';

export const AirdropHubView: React.FC = () => {
  const { profile } = useGame();

  // Countdown timer for listing
  const [timeLeft, setTimeLeft] = useState({
    days: 14,
    hours: 23,
    minutes: 59,
    seconds: 59
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);


  return (
    <div className="max-w-7xl mx-auto p-4 space-y-8 animate-fade-in">
      
      {/* Intro Header */}
      <div className="text-center space-y-2">
        <h2 className="font-display font-black text-2xl text-white tracking-widest text-shadow-gold flex items-center justify-center gap-2">
          <img src="/icons/icon_gold.webp" alt="Gold" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" /> WEB3 AIRDROP & TOKEN HUB
        </h2>
        <p className="text-xs text-gray-400 font-sans max-w-lg mx-auto">
          Official covenant token distribution portal — <span className="text-[#66fcf1] font-mono font-bold">$VOID</span> on Solana.
        </p>
      </div>

      {/* Listing Countdown Card (centered) */}
      <div className="max-w-xl mx-auto">
        <div className="bg-[#151a21] border border-[#c5a880]/20 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-display font-bold text-sm text-[#ebd09b] tracking-wider uppercase flex items-center gap-2 border-b border-gray-800 pb-2">
              <Clock className="w-4 h-4 text-[#ebd09b]" /> TOKEN LISTING $VOID
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed font-sans">
              Official launch of <span className="text-[#66fcf1] font-mono font-bold">$VOID</span> on Solana DEXes (Raydium / Orca). Your in-game activity guarantees your airdrop allocation!
            </p>

            {/* Countdown timers */}
            <div className="grid grid-cols-4 gap-2 font-mono text-center">
              <div className="bg-black/50 border border-gray-800 p-2 rounded-lg">
                <span className="text-xl font-bold text-[#66fcf1] block">{timeLeft.days}</span>
                <span className="text-[8px] text-gray-500 uppercase">Days</span>
              </div>
              <div className="bg-black/50 border border-gray-800 p-2 rounded-lg">
                <span className="text-xl font-bold text-[#66fcf1] block">{timeLeft.hours}</span>
                <span className="text-[8px] text-gray-500 uppercase">Hours</span>
              </div>
              <div className="bg-black/50 border border-gray-800 p-2 rounded-lg">
                <span className="text-xl font-bold text-[#66fcf1] block">{timeLeft.minutes}</span>
                <span className="text-[8px] text-gray-500 uppercase">Min</span>
              </div>
              <div className="bg-black/50 border border-gray-800 p-2 rounded-lg">
                <span className="text-xl font-bold text-[#66fcf1] block">{timeLeft.seconds}</span>
                <span className="text-[8px] text-gray-500 uppercase">Sec</span>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-[#0b0c10] border border-[#66fcf1]/10 p-3 rounded-xl text-center">
            <span className="text-[10px] text-gray-400 block font-mono">Current estimated allocation</span>
            <span className="font-mono text-lg font-black text-[#66fcf1]">
              {(profile.collection.length * 100 + profile.pvpRating * 5 + profile.referralsCount * 500)} $VOID
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};

