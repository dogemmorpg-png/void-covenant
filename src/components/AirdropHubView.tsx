import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { useToast } from './Toast';
import { AIRDROP_TASKS } from '../data/cards';
import { SOLANA_PACKAGES, SolanaPackage, TREASURY_WALLET_ADDRESS } from '../data/solanaConfig';
import { Wallet, Share2, ExternalLink, CheckCircle, Clock, RefreshCw, Sparkles, Check, AlertCircle, ShieldCheck } from 'lucide-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL, ComputeBudgetProgram } from '@solana/web3.js';

export const AirdropHubView: React.FC = () => {
  const { profile, completeAirdropTask, addReferral, verifySolanaPayment, addShards, addDust, saveProfile } = useGame();
  const toast = useToast();
  const { setVisible } = useWalletModal();
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();

  const [realSolBalance, setRealSolBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState<boolean>(false);
  const [isCompletingTask, setIsCompletingTask] = useState<string | null>(null);

  // Payment processing state modal
  const [paymentState, setPaymentState] = useState<{
    status: 'idle' | 'signing' | 'verifying' | 'pending' | 'success' | 'error';
    message: string;
    txSignature?: string;
    selectedPkg?: SolanaPackage;
  }>({ status: 'idle', message: '' });

  // Fetch real on-chain balance
  const refreshBalance = useCallback(async () => {
    if (!publicKey) return;
    try {
      setIsLoadingBalance(true);
      const lamports = await connection.getBalance(publicKey, 'confirmed');
      setRealSolBalance(Number((lamports / LAMPORTS_PER_SOL).toFixed(4)));
    } catch (e) {
      console.error('Failed to fetch SOL balance:', e);
    } finally {
      setIsLoadingBalance(false);
    }
  }, [connection, publicKey]);

  useEffect(() => {
    if (connected && publicKey) {
      refreshBalance();
    } else {
      setRealSolBalance(null);
    }
  }, [connected, publicKey, refreshBalance]);

  // Direct On-Chain Verification Fallback (100% Fail-Safe)
  const verifyOnChainDirect = async (signature: string, pkg: SolanaPackage): Promise<boolean> => {
    const HELIUS_RPC_URL = 'https://mainnet.helius-rpc.com/?api-key=a53833dc-25c4-42e3-bdef-26901e8e84e9';
    const expectedLamports = Math.floor(pkg.solCost * LAMPORTS_PER_SOL);

    const checkEndpoint = async (rpcUrl: string) => {
      const res = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTransaction',
          params: [
            signature,
            { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0, commitment: 'confirmed' }
          ]
        })
      });
      const json = await res.json();
      return json.result;
    };

    try {
      let tx = await checkEndpoint(HELIUS_RPC_URL);
      if (!tx) {
        tx = await checkEndpoint('https://solana-rpc.publicnode.com');
      }

      if (!tx || tx.meta?.err) return false;

      // Balance Delta Check
      if (tx.meta?.preBalances && tx.meta?.postBalances) {
        const accountKeys = tx.transaction?.message?.accountKeys || [];
        const treasuryIndex = accountKeys.findIndex((k: any) => {
          const pubkeyStr = typeof k === 'string' ? k : (k.pubkey ? k.pubkey.toString() : String(k));
          return pubkeyStr === TREASURY_WALLET_ADDRESS;
        });

        if (treasuryIndex !== -1) {
          const gained = (tx.meta.postBalances[treasuryIndex] || 0) - (tx.meta.preBalances[treasuryIndex] || 0);
          if (gained >= expectedLamports - 10000) return true;
        }
      }

      // Parsed Instruction Check
      const instructions = tx.transaction?.message?.instructions || [];
      for (const ix of instructions) {
        if (ix.program === 'system' && ix.parsed?.type === 'transfer') {
          const info = ix.parsed.info || {};
          if (info.destination === TREASURY_WALLET_ADDRESS && info.lamports >= expectedLamports - 10000) {
            return true;
          }
        }
      }
    } catch (e) {
      console.warn('Direct on-chain check error:', e);
    }
    return false;
  };

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

  const handleCompleteTask = (taskId: string) => {
    if (taskId === 'wallet_connect' && !profile.solanaAddress) {
      setVisible(true);
      return;
    }
    
    const task = AIRDROP_TASKS.find(t => t.id === taskId);
    if (task?.actionUrl) {
      window.open(task.actionUrl, '_blank');
      setIsCompletingTask(taskId);
    }

    setTimeout(async () => {
      const res = await completeAirdropTask(taskId);
      if (res.success) {
        toast(res.message, 'success');
      } else {
        toast(res.message, 'error');
      }
      setIsCompletingTask(null);
    }, 1000);
  };

  // Blazing fast purchase handler with automatic dual verification
  const handlePurchasePackage = async (pkg: SolanaPackage) => {
    if (!connected || !publicKey || !sendTransaction) {
      toast('Please connect your Solana wallet first!', 'warning');
      setVisible(true);
      return;
    }

    if (realSolBalance !== null && realSolBalance < pkg.solCost) {
      toast(`Insufficient SOL balance! You have ${realSolBalance} SOL, need ${pkg.solCost} SOL`, 'warning');
      return;
    }

    try {
      setPaymentState({
        status: 'signing',
        message: 'Please approve the transaction in your Solana wallet (Phantom / Solflare)...',
        selectedPkg: pkg
      });

      const lamports = Math.floor(pkg.solCost * LAMPORTS_PER_SOL);
      const transaction = new Transaction();

      // Priority fee for < 1s validator inclusion
      transaction.add(
        ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 100000 })
      );

      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(TREASURY_WALLET_ADDRESS),
          lamports
        })
      );

      const { blockhash } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Broadcast transaction instantly
      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: false,
        preflightCommitment: 'confirmed'
      });

      setPaymentState({
        status: 'verifying',
        message: 'Transaction broadcasted to Solana Mainnet! Verifying with Helius...',
        txSignature: signature,
        selectedPkg: pkg
      });

      // 1. Attempt Server Verification first
      let verifySuccess = false;
      for (let attempt = 1; attempt <= 4; attempt++) {
        setPaymentState(prev => ({
          ...prev,
          message: `Verifying on-chain transaction with Helius (Attempt ${attempt}/4)...`
        }));

        const res = await verifySolanaPayment(signature, pkg.id);
        if (res && res.success) {
          verifySuccess = true;
          break;
        }
        if (attempt < 4) {
          await new Promise(r => setTimeout(r, 1000));
        }
      }

      // 2. Direct On-Chain Fallback if server returned error or was indexing
      if (!verifySuccess) {
        setPaymentState(prev => ({
          ...prev,
          message: 'Performing direct on-chain verification with Helius RPC...'
        }));

        const directVerified = await verifyOnChainDirect(signature, pkg);
        if (directVerified) {
          verifySuccess = true;
          // Credit directly on client
          const updated = { ...profile };
          if (pkg.shardsReward > 0) updated.darkShards = (updated.darkShards || 0) + pkg.shardsReward;
          if (pkg.dustBonus > 0) updated.dust = (updated.dust || 0) + pkg.dustBonus;
          if (pkg.isBattlePass) updated.hasPremiumBp = true;
          updated.processedTransactions = [...(updated.processedTransactions || []), signature];
          saveProfile(updated);
        }
      }

      if (!verifySuccess) {
        setPaymentState(prev => ({
          ...prev,
          status: 'pending',
          message: 'Transaction sent to Solana! On-chain indexing in progress. Click RETRY VERIFICATION below.'
        }));
        toast('Transaction submitted. Click Retry Verification to claim.', 'info');
        return;
      }

      setPaymentState(prev => ({
        ...prev,
        status: 'success',
        message: `Success! +${pkg.shardsReward} Dark Shards${pkg.dustBonus ? ` & +${pkg.dustBonus} Dust` : ''} added to your account!`
      }));

      refreshBalance();
      toast(`Payment confirmed! +${pkg.shardsReward} Dark Shards added!`, 'success');

    } catch (err: any) {
      console.error('Solana purchase error:', err);
      const isUserReject = err.message?.includes('User rejected') || err.message?.includes('cancelled');
      setPaymentState(prev => ({
        ...prev,
        status: 'error',
        message: isUserReject ? 'Transaction was cancelled by user.' : (err.message || 'Payment failed.')
      }));
      toast(isUserReject ? 'Transaction cancelled' : (err.message || 'Payment failed'), isUserReject ? 'info' : 'error');
    }
  };

  const handleRetryVerification = async () => {
    if (!paymentState.txSignature || !paymentState.selectedPkg) return;
    const sig = paymentState.txSignature;
    const pkg = paymentState.selectedPkg;

    try {
      setPaymentState(prev => ({
        ...prev,
        status: 'verifying',
        message: 'Re-verifying transaction on Solana blockchain...'
      }));

      // Server check
      const res = await verifySolanaPayment(sig, pkg.id);
      if (res.success) {
        setPaymentState(prev => ({
          ...prev,
          status: 'success',
          message: res.message
        }));
        refreshBalance();
        toast('Transaction verified! Shards credited!', 'success');
        return;
      }

      // Direct Client On-Chain Check
      const directOk = await verifyOnChainDirect(sig, pkg);
      if (directOk) {
        const updated = { ...profile };
        if (pkg.shardsReward > 0) updated.darkShards = (updated.darkShards || 0) + pkg.shardsReward;
        if (pkg.dustBonus > 0) updated.dust = (updated.dust || 0) + pkg.dustBonus;
        if (pkg.isBattlePass) updated.hasPremiumBp = true;
        updated.processedTransactions = [...(updated.processedTransactions || []), sig];
        saveProfile(updated);

        setPaymentState(prev => ({
          ...prev,
          status: 'success',
          message: `Payment confirmed on-chain! +${pkg.shardsReward} Dark Shards added!`
        }));
        refreshBalance();
        toast('Transaction verified on-chain! Shards credited!', 'success');
        return;
      }

      setPaymentState(prev => ({
        ...prev,
        status: 'pending',
        message: 'Verification in progress on Solana network. Click RETRY VERIFICATION in 2 seconds.'
      }));
      toast('Verification pending on-chain...', 'info');

    } catch (e: any) {
      toast(e.message || 'Error re-verifying transaction', 'error');
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
          Official covenant token distribution portal — <span className="text-[#66fcf1] font-mono font-bold">$VOID</span> on Solana.
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

        {/* Real SOL On-Chain Checkout Shop */}
        <div className="bg-[#151a21] border border-indigo-950 rounded-2xl p-6 shadow-xl flex flex-col justify-between gothic-glow-blue relative">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <h3 className="font-display font-bold text-sm text-[#66fcf1] tracking-wider uppercase flex items-center gap-2">
                <Wallet className="w-4 h-4 text-[#66fcf1]" /> SOLANA PAY STORE
              </h3>
              <span className="text-[9px] bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono uppercase">
                Mainnet Live
              </span>
            </div>
            
            <p className="text-xs text-gray-300 font-sans leading-relaxed">
              Purchase Dark Shards on Solana. Shards allow you to summon legendary entities and open Obsidian packs.
            </p>

            {connected && publicKey ? (
              <div className="space-y-3 font-mono text-xs">
                <div className="bg-black/60 border border-[#66fcf1]/20 p-2.5 rounded-lg flex justify-between items-center">
                  <span className="text-gray-400">On-Chain Balance:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#66fcf1]">
                      {realSolBalance !== null ? `${realSolBalance} SOL` : 'Loading...'}
                    </span>
                    <button 
                      onClick={refreshBalance} 
                      disabled={isLoadingBalance}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white"
                      title="Refresh Balance"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoadingBalance ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
                
                {/* Store Packages */}
                <div className="space-y-2 pt-1 max-h-60 overflow-y-auto pr-1">
                  {SOLANA_PACKAGES.map(pkg => (
                    <button
                      key={pkg.id}
                      onClick={() => handlePurchasePackage(pkg)}
                      disabled={paymentState.status !== 'idle' && paymentState.status !== 'success' && paymentState.status !== 'error' && paymentState.status !== 'pending'}
                      className="w-full bg-[#1f2833]/80 hover:bg-[#1f2833] border border-[#66fcf1]/20 hover:border-[#66fcf1]/50 rounded-xl p-2.5 flex items-center justify-between text-left transition-all group cursor-pointer disabled:opacity-50"
                    >
                      <div className="flex-1 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-sans font-bold text-xs group-hover:text-[#66fcf1] transition-colors">
                            {pkg.name}
                          </span>
                          {pkg.badge && (
                            <span className="text-[8px] bg-[#66fcf1]/20 text-[#66fcf1] px-1.5 py-0.5 rounded font-mono font-bold">
                              {pkg.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 block mt-0.5 flex items-center">
                          +{pkg.shardsReward} Dark Shards <img src="/icons/icon_shards.png" alt="Shards" className="w-3.5 h-3.5 inline ml-1" />
                          {pkg.dustBonus > 0 && <span className="text-cyan-400 ml-1.5">+{pkg.dustBonus} Dust</span>}
                        </span>
                      </div>
                      <div className="bg-[#66fcf1]/10 border border-[#66fcf1]/30 group-hover:bg-[#66fcf1] group-hover:text-black text-[#66fcf1] font-bold text-xs py-1.5 px-3 rounded-lg transition-all font-mono whitespace-nowrap">
                        {pkg.solCost} SOL
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <button
                  onClick={() => setVisible(true)}
                  className="bg-gradient-to-r from-teal-900 to-[#1f2833] hover:from-teal-600 hover:to-indigo-900 border border-[#66fcf1]/50 text-[#66fcf1] font-display font-bold py-2.5 px-6 rounded-xl text-xs tracking-wider transition-all cursor-pointer shadow-lg"
                >
                  CONNECT SOLANA WALLET
                </button>
                <p className="text-[9px] text-gray-500 font-sans mt-2">Connect Phantom or Solflare to checkout</p>
              </div>
            )}
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-800/80 flex items-center justify-between text-[9px] text-gray-500 font-mono">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified On-Chain</span>
            <span className="truncate max-w-[140px] text-gray-600" title={TREASURY_WALLET_ADDRESS}>
              To: {TREASURY_WALLET_ADDRESS.slice(0, 4)}...{TREASURY_WALLET_ADDRESS.slice(-4)}
            </span>
          </div>
        </div>

        {/* Referrals & Invites */}
        <div className="bg-[#151a21] border border-[#c5a880]/20 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-display font-bold text-sm text-[#ebd09b] tracking-wider uppercase flex items-center gap-2 border-b border-gray-800 pb-2">
              <Share2 className="w-4 h-4 text-[#ebd09b]" /> DARK BROTHERHOOD ORDER
            </h3>
            <p className="text-xs text-gray-300 font-sans leading-relaxed">
              Invite other summoners and share the loot. Receive <span className="text-amber-500 font-bold">1,000<img src="/icons/icon_gold.png" alt="Gold" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" /> Gold</span> and battle pass points for each invitee!
            </p>

            <div className="bg-black/50 border border-gray-800 p-3 rounded-xl font-mono text-xs flex justify-between items-center">
              <span className="text-gray-400">Allies invited:</span>
              <span className="text-amber-400 font-bold">{profile.referralsCount}</span>
            </div>
          </div>

          <div className="space-y-2 mt-6">
            <button
              onClick={() => {
                addReferral();
                toast('Ally invited! Reward: +1000 Gold and +80 Battle Pass points!', 'success');
              }}
              className="w-full bg-[#ebd09b] hover:bg-[#c5a880] text-black font-display font-black py-2.5 px-4 rounded-xl text-xs transition-all tracking-wider cursor-pointer"
            >
              👥 SIMULATE INVITE
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`https://voidcovenant.com?ref=${profile.solanaAddress || 'ref'}`);
                toast('Referral link copied to clipboard!', 'info');
              }}
              className="w-full bg-[#1f2833] hover:bg-[#151a21] border border-[#c5a880]/20 text-gray-300 font-mono text-xs py-2 rounded-lg transition-all cursor-pointer"
            >
              Copy link
            </button>
          </div>
        </div>

      </div>

      {/* Social & Airdrop Tasks Section */}
      <div className="bg-[#151a21] border border-gray-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
        <div className="border-b border-gray-800 pb-4">
          <h3 className="font-display font-black text-lg text-white tracking-widest text-shadow-gold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#ebd09b]" /> COVENANT AIRDROP TASKS
          </h3>
          <p className="text-xs text-gray-400 font-sans mt-1">
            Complete tasks to accumulate early rewards, gold, and seasonal battle pass experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AIRDROP_TASKS.map(task => {
            const isCompleted = profile.completedTasks?.includes(task.id);
            return (
              <div 
                key={task.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  isCompleted 
                    ? 'bg-black/30 border-emerald-900/30 opacity-70' 
                    : 'bg-black/50 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-sm text-white">{task.title}</span>
                    {isCompleted && (
                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/50 text-[9px] px-1.5 py-0.2 rounded flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5" /> Done
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{task.description}</p>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-amber-400 pt-1">
                    <span>Reward: +{task.rewardAmount} {task.rewardType.toUpperCase()}</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-purple-400">+30 BP</span>
                  </div>
                </div>

                <div>
                  {isCompleted ? (
                    <div className="w-8 h-8 rounded-full bg-emerald-900/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Check className="w-4 h-4" />
                    </div>
                  ) : (
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      disabled={isCompletingTask === task.id}
                      className="bg-[#ebd09b] hover:bg-[#c5a880] text-black font-display font-bold text-xs py-2 px-4 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      {isCompletingTask === task.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>Complete <ExternalLink className="w-3 h-3" /></>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Processing Modal */}
      {paymentState.status !== 'idle' && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#151a21] border border-gray-700 max-w-md w-full rounded-3xl p-6 space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] text-center relative overflow-hidden">
            
            {/* Top decorative glow */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${
              paymentState.status === 'success' ? 'bg-emerald-500' :
              paymentState.status === 'pending' ? 'bg-amber-500' :
              paymentState.status === 'error' ? 'bg-red-500' :
              'bg-[#66fcf1] animate-pulse'
            }`} />

            <div className="flex justify-center pt-2">
              {paymentState.status === 'signing' && (
                <div className="w-16 h-16 rounded-full bg-indigo-950/50 border-2 border-[#66fcf1] flex items-center justify-center animate-bounce shadow-[0_0_20px_rgba(102,252,241,0.4)]">
                  <Wallet className="w-8 h-8 text-[#66fcf1]" />
                </div>
              )}
              {paymentState.status === 'verifying' && (
                <div className="w-16 h-16 rounded-full border-4 border-indigo-900 border-t-[#66fcf1] animate-spin" />
              )}
              {paymentState.status === 'pending' && (
                <div className="w-16 h-16 rounded-full bg-amber-950/50 border-2 border-amber-500 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                  <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
                </div>
              )}
              {paymentState.status === 'success' && (
                <div className="w-16 h-16 rounded-full bg-emerald-950/50 border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.4)]">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
              )}
              {paymentState.status === 'error' && (
                <div className="w-16 h-16 rounded-full bg-red-950/50 border-2 border-red-500 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="font-display font-bold text-lg text-white">
                {paymentState.status === 'signing' && 'Approve in Wallet'}
                {paymentState.status === 'verifying' && 'Verifying with Helius...'}
                {paymentState.status === 'pending' && 'Verification Pending'}
                {paymentState.status === 'success' && 'Payment Complete! 🎉'}
                {paymentState.status === 'error' && 'Transaction Error'}
              </h3>
              <p className="text-xs text-gray-300 font-sans leading-relaxed">
                {paymentState.message}
              </p>
            </div>

            {paymentState.txSignature && (
              <div className="bg-black/60 border border-gray-800 p-3 rounded-xl text-left space-y-1">
                <span className="text-[10px] text-gray-500 font-mono block uppercase">Transaction Signature</span>
                <a 
                  href={`https://solscan.io/tx/${paymentState.txSignature}`}
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs text-[#66fcf1] font-mono hover:underline flex items-center gap-1 truncate"
                >
                  <span className="truncate">{paymentState.txSignature}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
            )}

            {(paymentState.status === 'success' || paymentState.status === 'pending' || paymentState.status === 'error') && (
              <div className="pt-2 space-y-2">
                {(paymentState.status === 'pending' || paymentState.status === 'error') && paymentState.txSignature && (
                  <button
                    onClick={handleRetryVerification}
                    className="w-full bg-[#66fcf1] hover:bg-[#45a29e] text-black font-display font-black py-3 px-6 rounded-xl text-xs tracking-wider transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" /> RETRY VERIFICATION
                  </button>
                )}
                <button
                  onClick={() => setPaymentState({ status: 'idle', message: '' })}
                  className="w-full bg-[#ebd09b] hover:bg-[#c5a880] text-black font-display font-black py-3 px-6 rounded-xl text-xs tracking-wider transition-all cursor-pointer shadow-lg"
                >
                  CLOSE
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
