import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useToast } from './Toast';
import { SOLANA_PACKAGES, SolanaPackage, TREASURY_WALLET_ADDRESS } from '../data/solanaConfig';
import { X, Wallet, ExternalLink, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';
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
  const { publicKey, sendTransaction, connected } = useWallet();

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
          if (pkg.dustBonus > 0) updated.dust = (updated.dust || 0) + pkg.dustBonus;
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
        message: `Success! +${pkg.shardsReward} Dark Shards${pkg.dustBonus ? ` & +${pkg.dustBonus} Dust` : ''} added to your account!`
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

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
      
      {/* Modal Container */}
      <div className="bg-[#151a21] border border-red-950/40 max-w-lg w-full rounded-3xl p-6 space-y-6 shadow-[0_0_50px_rgba(221,44,64,0.1)] relative overflow-hidden flex flex-col justify-between gothic-glow-red">
        {/* Top decorative glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-800 to-rose-600" />

        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <h3 className="font-display font-black text-white text-base tracking-widest text-shadow-gold flex items-center gap-2">
            🧬 ABYSSAL SHARDS SHOP
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 hover:bg-white/5 rounded-full transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content */}
        {paymentState.status === 'idle' || paymentState.status === 'success' || paymentState.status === 'error' || paymentState.status === 'pending' ? (
          <div className="space-y-4">
            <p className="text-xs text-gray-300 font-sans leading-relaxed">
              Purchase Dark Shards on Solana Mainnet. Shards allow you to summon legendary entities and open Obsidian card packs.
            </p>

            {/* Wallet connection banner if not connected */}
            {!connected && (
              <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-4 text-center space-y-2">
                <p className="text-xs text-amber-300 font-sans">
                  Please connect your Solana wallet first to complete purchases.
                </p>
                <button
                  onClick={() => setVisible(true)}
                  className="bg-gradient-to-r from-teal-900 to-[#1f2833] hover:from-teal-600 hover:to-indigo-900 border border-[#66fcf1]/50 text-[#66fcf1] font-display font-bold py-2 px-5 rounded-lg text-xs tracking-wider transition-all cursor-pointer shadow-lg"
                >
                  CONNECT SOLANA WALLET
                </button>
              </div>
            )}

            {/* Packages Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[440px] overflow-y-auto pr-1">
              {SOLANA_PACKAGES.map(pkg => {
                const isPopular = pkg.popular;
                return (
                  <div
                    key={pkg.id}
                    className={`relative rounded-2xl p-4 flex flex-col justify-between border transition-all ${
                      isPopular 
                        ? 'bg-purple-950/15 border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.1)]' 
                        : 'bg-black/40 border-white/5 hover:border-white/10'
                    }`}
                  >
                    {pkg.badge && (
                      <span className={`absolute top-2 right-2 text-[8px] px-1.5 py-0.5 rounded font-mono font-bold ${
                        isPopular ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}>
                        {pkg.badge}
                      </span>
                    )}

                    <div className="space-y-1">
                      {pkg.image && (
                        <div className="w-full flex items-center justify-center py-2.5 shrink-0">
                          <img 
                            src={pkg.image} 
                            alt={pkg.name} 
                            className="w-16 h-16 object-contain drop-shadow-[0_0_8px_rgba(239,68,68,0.35)]" 
                          />
                        </div>
                      )}
                      <span className="text-white font-sans font-bold text-xs block text-center">
                        {pkg.name}
                      </span>
                      <p className="text-[10px] text-gray-500 font-sans leading-tight text-center">
                        {pkg.description}
                      </p>
                    </div>

                    <div className="mt-4 flex items-end justify-between">
                      <div className="flex flex-col">
                        <span className="text-lg font-black text-rose-400 font-mono flex items-center gap-1.5 leading-none">
                          {pkg.shardsReward} 
                          <img src="/icons/icon_shards.webp" alt="Shards" className="w-5 h-5 object-contain" />
                        </span>
                        {pkg.dustBonus > 0 && (
                          <span className="text-[9px] text-[#66fcf1] font-mono mt-0.5">
                            +{pkg.dustBonus} Bonus Dust
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handlePurchasePackage(pkg)}
                        disabled={paymentState.status === 'signing' || paymentState.status === 'verifying'}
                        className={`font-mono text-xs font-bold py-1.5 px-3 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                          isPopular 
                            ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]' 
                            : 'bg-[#1f2833] hover:bg-[#2b3a4a] text-rose-300 border border-rose-500/20'
                        }`}
                      >
                        {pkg.solCost} SOL
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Transaction Overlays */}
        {paymentState.status !== 'idle' && paymentState.status !== 'success' && paymentState.status !== 'error' && paymentState.status !== 'pending' ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-6 text-center animate-fade-in">
            <div className="relative">
              {paymentState.status === 'signing' && (
                <div className="w-16 h-16 rounded-full bg-red-950/50 border-2 border-red-500 flex items-center justify-center animate-bounce shadow-[0_0_20px_rgba(221,44,64,0.4)]">
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
          <div className="border-t border-white/5 pt-4 space-y-4 animate-fade-in">
            {paymentState.status === 'success' && (
              <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3 flex items-start gap-2.5 text-left">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-white block">Payment Confirmed!</span>
                  <span className="text-[10px] text-emerald-300 font-sans mt-0.5 block leading-normal">{paymentState.message}</span>
                </div>
              </div>
            )}
            {paymentState.status === 'error' && (
              <div className="bg-red-950/20 border border-red-500/20 rounded-xl p-3 flex items-start gap-2.5 text-left">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-white block">Transaction Failed</span>
                  <span className="text-[10px] text-red-300 font-sans mt-0.5 block leading-normal">{paymentState.message}</span>
                </div>
              </div>
            )}
            {paymentState.status === 'pending' && (
              <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2.5 text-left">
                <RefreshCw className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-spin" />
                <div>
                  <span className="text-xs font-bold text-white block">Indexing on Solana...</span>
                  <span className="text-[10px] text-amber-300 font-sans mt-0.5 block leading-normal">{paymentState.message}</span>
                </div>
              </div>
            )}

            {paymentState.txSignature && (
              <div className="bg-black/40 border border-white/5 p-3 rounded-xl text-left space-y-1">
                <span className="text-[9px] text-gray-500 font-mono block uppercase">Solana Tx Signature</span>
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
                  className="flex-1 bg-red-950/40 hover:bg-red-900/40 border border-red-500/40 text-red-200 font-display font-black py-2.5 px-4 rounded-xl text-xs tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
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
