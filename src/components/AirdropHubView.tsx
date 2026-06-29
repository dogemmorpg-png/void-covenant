import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useToast } from './Toast';
import { AIRDROP_TASKS } from '../data/cards';
import { Wallet, Share2, Gem, Coins, ExternalLink, CheckCircle, Clock } from 'lucide-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

export const AirdropHubView: React.FC = () => {
  const { profile, connectSolanaWallet, completeAirdropTask, addReferral, buyDarkShardsWithSOL } = useGame();
  const toast = useToast();
  const { setVisible } = useWalletModal();
  
  // Simulated countdown for token listing
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

  const handleCompleteTask = (taskId: string) => {
    if (taskId === 'wallet_connect' && !profile.solanaAddress) {
      setVisible(true);
      return;
    }
    
    // Simulating redirect and verification
    const task = AIRDROP_TASKS.find(t => t.id === taskId);
    if (task?.actionUrl) {
      window.open(task.actionUrl, '_blank');
    }

    setTimeout(() => {
      const res = completeAirdropTask(taskId);
      if (res.success) {
        toast(res.message, 'success');
      }
    }, 1000);
  };

  const handleBuyShards = (solCost: number) => {
    if (!profile.solanaAddress) {
      toast('First, connect your Solana wallet!', 'warning');
      return;
    }
    if ((profile.solBalance || 0) < solCost) {
      toast('Not enough SOL balance to exchange!', 'warning');
      return;
    }

    if (window.confirm(`Do you confirm the smart contract transaction in your wallet to buy Dark Shards for ${solCost} SOL?`)) {
      if (buyDarkShardsWithSOL(solCost)) {
        toast(`Solana blockchain transaction confirmed! Added +${solCost * 50} Dark Shards`, 'reward');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-8">
      
      {/* Intro Header */}
      <div className="text-center space-y-2">
        <h2 className="font-display font-black text-2xl text-white tracking-widest text-shadow-gold flex items-center justify-center gap-2">
          <img src="/icons/icon_gold.png" alt="Gold" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" /> WEB3 AIRDROP & TOKEN HUB
        </h2>
        <p className="text-xs text-gray-400 font-sans max-w-lg mx-auto">
          Official covenant token distribution portal — <span className="text-[#66fcf1] font-mono font-bold">$VOID</span>. Complete social tasks and invite allies.
        </p>
      </div>

      {/* Grid of Token details, wallet connection and purchase */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Listing Countdown */}
        <div className="bg-[#151a21] border border-[#c5a880]/20 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-display font-bold text-sm text-[#ebd09b] tracking-wider uppercase flex items-center gap-2 border-b border-gray-800 pb-2">
              <Clock className="w-4 h-4 text-[#ebd09b]" /> TOKEN LISTING $VOID
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed font-sans">
              Official launch of the covenant token <span className="text-[#66fcf1] font-mono font-bold">$VOID</span> on Solana DEXes (Raydium / Orca). Your activity guarantees the airdrop volume!
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
            <span className="text-[10px] text-gray-400 block font-mono">Current allocation</span>
            <span className="font-mono text-lg font-black text-[#66fcf1]">
              {(profile.collection.length * 100 + profile.pvpRating * 5 + profile.referralsCount * 500)} $VOID
            </span>
          </div>
        </div>

        {/* SOL Checkout Shop Sandbox */}
        <div className="bg-[#151a21] border border-indigo-950 rounded-2xl p-6 shadow-xl flex flex-col justify-between gothic-glow-blue">
          <div className="space-y-4">
            <h3 className="font-display font-bold text-sm text-[#66fcf1] tracking-wider uppercase flex items-center gap-2 border-b border-gray-800 pb-2">
              <Wallet className="w-4 h-4 text-[#66fcf1]" /> SOLANA CRYPTO INTEGRATION
            </h3>
            <p className="text-xs text-gray-300 font-sans leading-relaxed">
              Buy Dark Shards directly via your Solana wallet. Shards are required to open premium Obsidian and Abyssal summon packs.
            </p>

            {profile.solanaAddress ? (
              <div className="space-y-3 font-mono text-xs">
                <div className="bg-black/40 border border-[#66fcf1]/10 p-2.5 rounded-lg flex justify-between items-center">
                  <span className="text-gray-400">SOL Balance:</span>
                  <span className="font-bold text-[#66fcf1]">{profile.solBalance} SOL</span>
                </div>
                
                {/* Store Packs using SOL */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => handleBuyShards(0.1)}
                    className="w-full bg-[#1f2833] hover:bg-[#45a29e]/20 border border-[#66fcf1]/30 rounded-xl p-2.5 flex items-center justify-between text-left transition-all"
                  >
                    <div>
                      <span className="text-white block font-sans font-bold text-xs">Micro-Shards</span>
                      <span className="text-[10px] text-gray-400">Summon: 5 Dark Shards <img src="/icons/icon_shards.png" alt="Shards" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" /></span>
                    </div>
                    <span className="text-[#66fcf1] font-bold text-xs">0.1 SOL</span>
                  </button>
                  <button
                    onClick={() => handleBuyShards(1.0)}
                    className="w-full bg-[#1f2833] hover:bg-[#45a29e]/20 border border-[#66fcf1]/30 rounded-xl p-2.5 flex items-center justify-between text-left transition-all"
                  >
                    <div>
                      <span className="text-white block font-sans font-bold text-xs">Dark Pouch</span>
                      <span className="text-[10px] text-gray-400">Summon: 50 Dark Shards <img src="/icons/icon_shards.png" alt="Shards" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" /></span>
                    </div>
                    <span className="text-[#66fcf1] font-bold text-xs">1.0 SOL</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <button
                  onClick={() => setVisible(true)}
                  className="bg-gradient-to-r from-teal-900 to-[#1f2833] hover:from-teal-600 hover:to-indigo-900 border border-[#66fcf1]/50 text-[#66fcf1] font-display font-bold py-2 px-6 rounded-xl text-xs tracking-wider transition-all"
                >
                  CONNECT WALLET
                </button>
                <p className="text-[9px] text-gray-500 font-sans mt-2">Connecting will initialize your web3 profile.</p>
              </div>
            )}
          </div>
          
          <p className="text-[9px] text-gray-500 font-mono text-center mt-4 uppercase tracking-widest">
            SOLANA NETWORK INTEGRATION • DEV SANDBOX
          </p>
        </div>

        {/* Referrals & Invites */}
        <div className="bg-[#151a21] border border-[#c5a880]/20 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-display font-bold text-sm text-[#ebd09b] tracking-wider uppercase flex items-center gap-2 border-b border-gray-800 pb-2">
              <Share2 className="w-4 h-4 text-[#ebd09b]" /> DARK BROTHERHOOD ORDER
            </h3>
            <p className="text-xs text-gray-300 font-sans leading-relaxed">
              Invite other allies and share the loot. Receive <span className="text-amber-500 font-bold">1,000<img src="/icons/icon_gold.png" alt="Gold" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" /> Gold</span> and battle pass points for each invitee!
            </p>

            <div className="bg-black/50 border border-gray-800 p-3 rounded-xl font-mono text-xs flex justify-between items-center">
              <span className="text-gray-400">Friends invited:</span>
              <span className="text-amber-400 font-bold">{profile.referralsCount}</span>
            </div>
          </div>

          <div className="space-y-2 mt-6">
            <button
              onClick={() => {
                addReferral();
                toast('Ally invited! Reward: +1000 Gold and +80 Battle Pass points!', 'success');
              }}
              className="w-full bg-[#ebd09b] hover:bg-[#c5a880] text-black font-display font-black py-2.5 px-4 rounded-xl text-xs transition-all tracking-wider"
            >
              👥 SIMULATE INVITE
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`https://t.me/void_covenant_bot?start=${profile.solanaAddress || 'ref'}`);
                toast('Referral link copied to clipboard!', 'info');
              }}
              className="w-full bg-[#1f2833] hover:bg-[#151a21] border border-[#c5a880]/20 text-gray-300 font-mono text-xs py-2 rounded-lg transition-all"
            >
              Copy link
            </button>
          </div>
        </div>

      </div>

      {/* Social and Web3 Airdrop Tasks list */}
      <div className="bg-[#151a21] border border-[#c5a880]/15 rounded-2xl p-6 shadow-xl max-w-4xl mx-auto">
        <h3 className="font-display font-black text-white text-base tracking-widest text-shadow-gold mb-4 border-b border-gray-800 pb-3">
          📝 AIRDROP ALLOCATION TASKS
        </h3>
        
        <div className="space-y-3">
          {AIRDROP_TASKS.map(task => {
            const isCompleted = profile.completedTasks.includes(task.id) || (task.id === 'wallet_connect' && profile.solanaAddress);
            
            return (
              <div key={task.id} className="bg-[#0b0c10] border border-gray-800/40 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-xs md:text-sm text-white">{task.title}</span>
                    {isCompleted && (
                      <span className="text-[9px] bg-emerald-950 text-emerald-400 font-mono font-bold py-0.5 px-2 rounded-full border border-emerald-900/30">
                        COMPLETED
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 font-sans max-w-xl">{task.description}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center font-mono">
                  {/* Reward label */}
                  <span className="text-xs font-bold text-[#ebd09b]">
                    +{task.rewardAmount} {task.rewardType === 'shards' ? '<img src="/icons/icon_shards.png" alt="Shards" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" />' : task.rewardType === 'gold' ? '<img src="/icons/icon_gold.png" alt="Gold" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" />' : '<img src="/icons/icon_dust.png" alt="Dust" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" />'}
                  </span>

                  {isCompleted ? (
                    <button disabled className="text-emerald-500 p-1.5 border border-emerald-900/30 rounded-lg bg-emerald-950/20 cursor-not-allowed">
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      className="bg-[#1f2833] hover:bg-[#45a29e]/20 border border-[#c5a880]/30 rounded-lg p-1.5 text-xs text-[#ebd09b] font-bold flex items-center gap-1 transition-all"
                    >
                      <span>Execute</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
