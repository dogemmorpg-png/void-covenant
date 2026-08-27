import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Landmark, ArrowUpRight, Clock, ShieldCheck, CheckCircle2, AlertCircle, Wallet, Coins, RefreshCw } from 'lucide-react';
import { audioSystem } from '../utils/AudioSystem';

export const BankView: React.FC = () => {
  const { profile, requestWithdrawal } = useGame();

  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [targetAddress, setTargetAddress] = useState<string>(profile.solanaAddress || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const balance = profile.bloodSovereigns || 0;
  const numAmount = parseInt(withdrawAmount, 10) || 0;
  const usdtEquivalent = (numAmount * 0.01).toFixed(2);
  const totalUsdtBalance = (balance * 0.01).toFixed(2);

  const handleQuickPercent = (pct: number) => {
    audioSystem.playClick();
    const calculated = Math.floor((balance * pct) / 100);
    setWithdrawAmount(calculated > 0 ? calculated.toString() : '');
  };

  const handleUseConnectedWallet = () => {
    audioSystem.playClick();
    if (profile.solanaAddress) {
      setTargetAddress(profile.solanaAddress);
    }
  };

  const handleSubmitWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    audioSystem.playClick();
    setFeedback(null);

    if (numAmount < 100) {
      setFeedback({ type: 'error', message: 'Minimum withdrawal is 100 Blood Sovereigns ($1.00 USDT).' });
      return;
    }

    if (numAmount > balance) {
      setFeedback({ type: 'error', message: 'Withdrawal amount exceeds your current balance.' });
      return;
    }

    if (!targetAddress || targetAddress.trim().length < 24) {
      setFeedback({ type: 'error', message: 'Please provide a valid destination wallet address.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await requestWithdrawal(numAmount, targetAddress.trim());
      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        setWithdrawAmount('');
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'An unexpected error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const history = profile.withdrawalRequests || [];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-950/40 via-black to-amber-950/40 border border-amber-500/40 px-5 py-1.5 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.2)] mb-2">
          <Landmark className="w-5 h-5 text-amber-400" />
          <span className="font-display font-black text-amber-300 text-sm tracking-widest uppercase">
            ROYAL VAULT & TREASURY
          </span>
        </div>
        <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-widest text-shadow-gold flex items-center justify-center gap-3">
          <img src="/icons/icon_sovereign.webp" alt="Sovereign" className="w-8 h-8 object-contain drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
          BLOOD SOVEREIGNS
        </h2>
        <p className="text-xs sm:text-sm text-gray-400 font-sans max-w-xl mx-auto leading-relaxed">
          The sovereign hard currency of Void Covenant. Earned by elite lords in high PvP Leagues and convertible to <span className="text-amber-300 font-bold">real USDT</span> at a fixed rate of <span className="text-emerald-400 font-mono font-bold">100 SOV = 1.00 USDT</span>.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Balance & Terminal (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Balance Card */}
          <div className="bg-gradient-to-b from-[#1b1216] via-[#141820] to-[#0f1217] border-2 border-amber-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <span className="text-gray-400 text-xs font-mono uppercase tracking-widest block mb-1">
                  Available Balance
                </span>
                <div className="flex items-center gap-3">
                  <img src="/icons/icon_sovereign.webp" alt="Sovereign" className="w-10 h-10 object-contain drop-shadow-[0_0_12px_rgba(245,158,11,0.9)]" />
                  <span className="font-mono font-black text-4xl text-amber-300 text-shadow-gold">
                    {balance}
                  </span>
                  <span className="font-mono text-sm font-bold text-amber-400/80 self-end mb-1">SOV</span>
                </div>
              </div>

              <div className="bg-black/50 border border-amber-500/30 rounded-2xl px-4 py-2.5 text-right sm:text-right w-full sm:w-auto">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Estimated Value</span>
                <span className="font-mono font-black text-xl text-emerald-400">
                  ${totalUsdtBalance} <span className="text-xs text-emerald-500/80 font-normal">USDT</span>
                </span>
              </div>
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                <span className="text-[9px] font-mono text-gray-400 uppercase block">Min. Payout</span>
                <span className="text-xs font-mono font-bold text-amber-300">100 SOV ($1)</span>
              </div>
              <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                <span className="text-[9px] font-mono text-gray-400 uppercase block">Exchange Rate</span>
                <span className="text-xs font-mono font-bold text-cyan-300">1 SOV = $0.01</span>
              </div>
              <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                <span className="text-[9px] font-mono text-gray-400 uppercase block">Network</span>
                <span className="text-xs font-mono font-bold text-emerald-300">USDT (Solana)</span>
              </div>
            </div>
          </div>

          {/* Withdrawal Terminal Form */}
          <div className="bg-[#141820] border border-amber-500/20 rounded-3xl p-6 shadow-xl relative">
            <h3 className="font-display font-bold text-base text-white tracking-wider flex items-center gap-2 mb-4">
              <ArrowUpRight className="w-5 h-5 text-amber-400" />
              WITHDRAWAL TERMINAL
            </h3>

            <form onSubmit={handleSubmitWithdrawal} className="space-y-4">
              
              {/* Amount Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="text-gray-300 font-mono">Amount to Withdraw (SOV)</label>
                  <span className="text-gray-400 font-mono text-[11px]">
                    Available: <strong className="text-amber-300">{balance} SOV</strong>
                  </span>
                </div>
                
                <div className="relative">
                  <input
                    type="number"
                    min="100"
                    max={balance}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount (min 100)"
                    className="w-full bg-black/60 border border-white/15 focus:border-amber-500 rounded-xl px-4 py-3 text-white font-mono text-base outline-none transition-colors"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-amber-400">
                    SOV
                  </div>
                </div>

                {/* Quick % buttons */}
                <div className="flex gap-2 pt-1">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handleQuickPercent(pct)}
                      className="flex-1 bg-black/40 hover:bg-amber-950/40 border border-white/10 hover:border-amber-500/40 py-1 rounded-lg text-xs font-mono font-bold text-gray-300 hover:text-amber-300 transition-all cursor-pointer"
                    >
                      {pct === 100 ? 'MAX' : `${pct}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conversion preview */}
              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3 flex justify-between items-center text-xs font-mono">
                <span className="text-emerald-300/80">You Will Receive:</span>
                <span className="text-sm font-black text-emerald-400">${usdtEquivalent} USDT</span>
              </div>

              {/* Wallet Address Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="text-gray-300 font-mono">Destination Wallet Address</label>
                  {profile.solanaAddress && (
                    <button
                      type="button"
                      onClick={handleUseConnectedWallet}
                      className="text-amber-400 hover:text-amber-300 text-[10px] font-mono underline cursor-pointer"
                    >
                      Use Connected Wallet
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={targetAddress}
                    onChange={(e) => setTargetAddress(e.target.value)}
                    placeholder="Solana / EVM Wallet Address"
                    className="w-full bg-black/60 border border-white/15 focus:border-amber-500 rounded-xl px-4 py-3 text-white font-mono text-xs outline-none transition-colors"
                  />
                  <Wallet className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                </div>
              </div>

              {/* Feedback messages */}
              {feedback && (
                <div className={`p-3 rounded-xl flex items-start gap-2.5 text-xs font-sans border ${
                  feedback.type === 'success' 
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' 
                    : 'bg-red-950/40 border-red-500/40 text-red-200'
                }`}>
                  {feedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <span>{feedback.message}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || balance < 100 || numAmount < 100 || numAmount > balance}
                className={`w-full py-3 rounded-xl font-display font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  balance >= 100 && numAmount >= 100 && numAmount <= balance && !isSubmitting
                    ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:scale-[1.02] active:scale-98'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700/50'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    PROCESSING REQUEST...
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="w-4 h-4" />
                    SUBMIT WITHDRAWAL REQUEST
                  </>
                )}
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: History & Security (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* History */}
          <div className="bg-[#141820] border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col min-h-[300px]">
            <h3 className="font-display font-bold text-base text-white tracking-wider flex items-center gap-2 mb-4 border-b border-white/10 pb-3">
              <Clock className="w-5 h-5 text-gray-400" />
              WITHDRAWAL HISTORY
            </h3>

            {history.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-2 text-gray-400">
                <Coins className="w-10 h-10 text-gray-600 mb-1" />
                <span className="font-display font-bold text-sm text-gray-300">No Withdrawal Requests</span>
                <p className="text-xs text-gray-500 max-w-xs font-sans">
                  Your submitted payout requests and transaction links will be tracked here.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                {history.map((req) => (
                  <div key={req.id} className="bg-black/40 border border-white/5 rounded-xl p-3 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <img src="/icons/icon_sovereign.webp" alt="SOV" className="w-4 h-4 object-contain" />
                        <span className="font-mono font-bold text-amber-300 text-xs">{req.amountSovereigns} SOV</span>
                        <span className="font-mono text-emerald-400 text-xs font-bold">(${req.amountUsdt} USDT)</span>
                      </div>
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase border ${
                        req.status === 'completed' 
                          ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                          : req.status === 'rejected'
                          ? 'bg-red-950/60 border-red-500/40 text-red-300'
                          : 'bg-amber-950/60 border-amber-500/40 text-amber-300 animate-pulse'
                      }`}>
                        {req.status === 'completed' ? '✓ Completed' : req.status === 'rejected' ? '✗ Rejected' : '⏳ Pending'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-mono text-gray-400">
                      <span className="truncate max-w-[150px]">{req.walletAddress}</span>
                      <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>

                    {req.txHash && (
                      <div className="pt-1 border-t border-white/5">
                        <a 
                          href={`https://solscan.io/tx/${req.txHash}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                        >
                          View Transaction ↗
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Security & Rules Guide */}
          <div className="bg-gradient-to-b from-[#161b24] to-[#10141a] border border-amber-500/20 rounded-3xl p-6 space-y-3">
            <h4 className="font-display font-bold text-sm text-amber-300 tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              TREASURY RULES & PROTOCOLS
            </h4>
            <div className="space-y-2 text-xs text-gray-300 font-sans leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <p><strong className="text-white">League Rollover Rewards:</strong> Blood Sovereigns are granted at the end of each PvP season to top-standing lords in Gold, Diamond, Master, and Champion leagues.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <p><strong className="text-white">Guaranteed Liquidity:</strong> Payouts are executed in USDT on Solana or EVM networks directly to your specified address.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <p><strong className="text-white">Fair-Play Anti-Cheat:</strong> All high-tier leaderboard victories undergo server replay verification prior to payout processing.</p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};