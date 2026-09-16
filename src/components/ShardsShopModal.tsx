import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useToast } from './Toast';
import { SOLANA_PACKAGES, SolanaPackage, TREASURY_WALLET_ADDRESS } from '../data/solanaConfig';
import { X, Wallet, ExternalLink, CheckCircle, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL, ComputeBudgetProgram } from '@solana/web3.js';

interface ShardsShopModalProps {
  onClose: () => void;
}

export const ShardsShopModal: React.FC<ShardsShopModalProps> = ({ onClose }) => {
  const { profile, verifySolanaPayment, saveProfile } = useGame();
  const toast = useToast();
  const { setVisible } = useWalletModal();
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected, disconnect } = useWallet();

  // Payment processing state modal
  const [paymentState, setPaymentState] = useState<{
    status: 'idle' | 'signing' | 'verifying' | 'pending' | 'success' | 'error';
    message: string;
    txSignature?: string;
    selectedPkg?: SolanaPackage;
  }>({ status: 'idle', message: '' });

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

  // Blazing fast purchase handler with automatic dual verification
  const handlePurchasePackage = async (pkg: SolanaPackage) => {
    if (!connected || !publicKey || !sendTransaction) {
      toast('Please connect your Solana wallet first!', 'warning');
      setVisible(true);
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
          if ((pkg as any).isBattlePass) updated.hasPremiumBp = true;
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
        message: `Success! +${pkg.shardsReward} Dark Shards added to your account!`
      }));

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
        toast('Transaction verified! Shards credited!', 'success');
        return;
      }

      // Direct Client On-Chain Check
      const directOk = await verifyOnChainDirect(sig, pkg);
      if (directOk) {
        const updated = { ...profile };
        if (pkg.shardsReward > 0) updated.darkShards = (updated.darkShards || 0) + pkg.shardsReward;
        if (pkg.dustBonus > 0) updated.dust = (updated.dust || 0) + pkg.dustBonus;
        if ((pkg as any).isBattlePass) updated.hasPremiumBp = true;
        updated.processedTransactions = [...(updated.processedTransactions || []), sig];
        saveProfile(updated);

        setPaymentState(prev => ({
          ...prev,
          status: 'success',
          message: `Payment confirmed on-chain! +${pkg.shardsReward} Dark Shards added!`
        }));
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

  const getBadgeStyle = (badge?: string) => {
    switch (badge) {
      case 'POPULAR':
        return 'bg-gradient-to-r from-purple-950 to-purple-800 text-purple-200 border-purple-400/50 shadow-[0_0_10px_rgba(168,85,247,0.3)]';
      case 'BEST VALUE':
        return 'bg-gradient-to-r from-amber-950 to-amber-800 text-amber-200 border-amber-400/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]';
      case 'SUPREME':
        return 'bg-gradient-to-r from-rose-950 to-red-800 text-rose-100 border-rose-400/60 shadow-[0_0_12px_rgba(244,63,94,0.4)]';
      default:
        return 'bg-black/60 text-gray-300 border-white/20';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      
      {/* Modal Container */}
      <div className="bg-gradient-to-b from-[#18111e] via-[#100a15] to-[#08050a] border-2 border-red-500/30 max-w-xl w-full rounded-3xl p-3 sm:p-5 shadow-[0_0_60px_rgba(221,44,64,0.18)] relative overflow-hidden flex flex-col space-y-2.5 sm:space-y-4 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto custom-scrollbar">
        
        {/* Top decorative gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-700 via-purple-600 to-rose-600" />
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-24 bg-red-600/15 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/10 pb-2 sm:pb-3 shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-black/70 border border-red-500/50 flex items-center justify-center shadow-inner shrink-0">
              <img 
                src="/icons/icon_shards.webp" 
                alt="Dark Shards" 
                className="w-6 h-6 sm:w-7 sm:h-7 object-contain drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" 
              />
            </div>
            <div>
              <h3 className="font-display font-black text-white text-xs sm:text-base tracking-widest uppercase text-shadow-gold leading-none">
                DARK SHARDS SHOP
              </h3>
              <p className="text-[9px] sm:text-[10px] text-rose-300/80 font-mono mt-0.5">
                Acquire shards on Solana Mainnet
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {connected && publicKey ? (
              <div 
                onClick={() => disconnect()}
                title="Click to disconnect"
                className="flex items-center gap-1 bg-black/60 hover:bg-red-950/40 border border-emerald-500/40 hover:border-red-500/40 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono text-emerald-400 hover:text-red-300 transition-all cursor-pointer"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}</span>
              </div>
            ) : (
              <button
                onClick={() => setVisible(true)}
                className="flex items-center gap-1 bg-gradient-to-r from-purple-900/60 to-[#1f2833] hover:from-purple-700 hover:to-indigo-900 border border-purple-500/40 text-purple-300 px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-bold tracking-wider transition-all cursor-pointer"
              >
                <Wallet className="w-2.5 h-2.5" /> CONNECT
              </button>
            )}

            <button 
              onClick={onClose}
              className="w-7 h-7 rounded-xl bg-black/50 hover:bg-red-950/60 border border-white/10 hover:border-red-500/40 text-gray-400 hover:text-red-300 flex items-center justify-center transition-all cursor-pointer ml-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        {paymentState.status === 'idle' || paymentState.status === 'success' || paymentState.status === 'error' || paymentState.status === 'pending' ? (
          <div className="space-y-2.5 sm:space-y-4">
            
            {/* Packages 2x2 Grid on ALL screens */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {SOLANA_PACKAGES.map(pkg => {
                const isPopular = pkg.popular;
                return (
                  <div
                    key={pkg.id}
                    className={`relative rounded-2xl p-2 sm:p-3 flex flex-col justify-between border transition-all duration-200 group hover:scale-[1.02] ${
                      isPopular 
                        ? 'bg-gradient-to-b from-[#211229]/90 via-[#140b1a]/95 to-black border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.2)]' 
                        : 'bg-gradient-to-b from-[#1b121e]/80 via-[#100a14]/90 to-black border-white/10 hover:border-red-500/40'
                    }`}
                  >
                    {/* Badge */}
                    {pkg.badge && (
                      <span className={`absolute top-1.5 right-1.5 text-[7px] sm:text-[8px] px-1.5 py-0.2 rounded-full font-mono font-black tracking-wider border uppercase z-10 ${getBadgeStyle(pkg.badge)}`}>
                        {pkg.badge}
                      </span>
                    )}

                    {/* Image Showcase */}
                    <div className="w-full flex items-center justify-center py-0.5 sm:py-1 relative">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.12),transparent_70%)] pointer-events-none" />
                      {pkg.image && (
                        <img 
                          src={pkg.image} 
                          alt={pkg.name} 
                          className="w-14 h-14 sm:w-20 sm:h-20 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)] group-hover:scale-105 transition-transform duration-300 rounded-xl" 
                        />
                      )}
                    </div>

                    {/* Title */}
                    <div className="text-center mt-0.5">
                      <span className="text-white font-display font-bold text-[10px] sm:text-xs tracking-wide block truncate">
                        {pkg.name}
                      </span>
                    </div>

                    {/* Reward Amount */}
                    <div className="flex items-center justify-center gap-1 my-1">
                      <img 
                        src="/icons/icon_shards.webp" 
                        alt="Shards" 
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain drop-shadow-[0_0_6px_rgba(239,68,68,0.7)] shrink-0" 
                      />
                      <span className="text-xs sm:text-sm font-black text-white font-mono leading-none tracking-tight">
                        +{pkg.shardsReward}
                      </span>
                    </div>

                    {/* Price Button */}
                    <button
                      onClick={() => handlePurchasePackage(pkg)}
                      disabled={paymentState.status === 'signing' || paymentState.status === 'verifying'}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-[10px] sm:text-xs font-black py-1.5 sm:py-2 px-1 rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-[0_0_10px_rgba(168,85,247,0.3)] hover:scale-102 flex items-center justify-center gap-1 active:scale-95"
                    >
                      <span>{pkg.solCost}</span>
                      <span className="text-[7.5px] sm:text-[9px] text-purple-200 font-bold">SOL</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Transaction Overlays */}
        {paymentState.status !== 'idle' && paymentState.status !== 'success' && paymentState.status !== 'error' && paymentState.status !== 'pending' ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-6 text-center animate-in fade-in duration-200">
            <div className="relative">
              {paymentState.status === 'signing' && (
                <div className="w-16 h-16 rounded-2xl bg-red-950/50 border-2 border-red-500 flex items-center justify-center animate-bounce shadow-[0_0_20px_rgba(221,44,64,0.4)]">
                  <Wallet className="w-8 h-8 text-red-400" />
                </div>
              )}
              {paymentState.status === 'verifying' && (
                <div className="w-16 h-16 rounded-full border-4 border-red-900/30 border-t-red-500 animate-spin" />
              )}
            </div>
            <div className="space-y-2">
              <h4 className="text-white font-display font-bold text-sm tracking-wider uppercase">
                {paymentState.status === 'signing' && 'Confirm in Wallet'}
                {paymentState.status === 'verifying' && 'Verifying on Solana...'}
              </h4>
              <p className="text-xs text-gray-400 font-sans max-w-xs mx-auto leading-relaxed">
                {paymentState.message}
              </p>
            </div>
          </div>
        ) : null}

        {/* Success / Error / Pending Status Boxes */}
        {paymentState.status === 'success' || paymentState.status === 'error' || paymentState.status === 'pending' ? (
          <div className="border-t border-white/10 pt-4 space-y-4 animate-in fade-in duration-200">
            {paymentState.status === 'success' && (
              <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-3.5 flex items-start gap-3 text-left shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-white block">Payment Confirmed!</span>
                  <span className="text-[11px] text-emerald-300 font-sans mt-0.5 block leading-normal">{paymentState.message}</span>
                </div>
              </div>
            )}
            {paymentState.status === 'error' && (
              <div className="bg-red-950/40 border border-red-500/40 rounded-2xl p-3.5 flex items-start gap-3 text-left">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-white block">Transaction Failed</span>
                  <span className="text-[11px] text-red-300 font-sans mt-0.5 block leading-normal">{paymentState.message}</span>
                </div>
              </div>
            )}
            {paymentState.status === 'pending' && (
              <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-3.5 flex items-start gap-3 text-left">
                <RefreshCw className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-spin" />
                <div>
                  <span className="text-xs font-bold text-white block">Indexing on Solana...</span>
                  <span className="text-[11px] text-amber-300 font-sans mt-0.5 block leading-normal">{paymentState.message}</span>
                </div>
              </div>
            )}

            {paymentState.txSignature && (
              <div className="bg-black/50 border border-white/10 p-3 rounded-xl text-left space-y-1">
                <span className="text-[9px] text-gray-400 font-mono block uppercase">Solana Tx Signature</span>
                <a 
                  href={`https://solscan.io/tx/${paymentState.txSignature}`}
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[11px] text-[#66fcf1] font-mono hover:underline flex items-center gap-1 truncate"
                >
                  <span className="truncate">{paymentState.txSignature}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
            )}

            <div className="flex gap-2">
              {(paymentState.status === 'pending' || paymentState.status === 'error') && paymentState.txSignature && (
                <button
                  onClick={handleRetryVerification}
                  className="flex-1 bg-red-950/60 hover:bg-red-900/60 border border-red-500/40 text-red-200 font-display font-black py-2.5 px-4 rounded-xl text-xs tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> RETRY VERIFY
                </button>
              )}
              <button
                onClick={() => setPaymentState({ status: 'idle', message: '' })}
                className="flex-1 bg-[#1f2833] hover:bg-[#2b3a4a] text-white font-display font-bold py-2.5 px-4 rounded-xl text-xs tracking-wider transition-all cursor-pointer"
              >
                BACK TO SHOP
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

