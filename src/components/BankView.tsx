import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { Landmark, ArrowUpRight, Clock, ShieldCheck, CheckCircle2, AlertCircle, Wallet, Coins, RefreshCw, TrendingUp, Swords, Trophy, Mail } from 'lucide-react';

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

  const isSubActive = profile.subscriptionExpiresAt && profile.subscriptionExpiresAt > Date.now();
  const subTier = isSubActive ? (profile.subscriptionTier || 'free') : 'free';
  const minWithdrawal = subTier === 'ultra' ? 2000 : subTier === 'premium' ? 2500 : 3000;
  const minUsdt = (minWithdrawal * 0.01).toFixed(2);

  const handleQuickPercent = (pct: number) => {
    const calculated = Math.floor((balance * pct) / 100);
    setWithdrawAmount(calculated > 0 ? calculated.toString() : '');
  };

  const handleUseConnectedWallet = () => {
    if (profile.solanaAddress) {
      setTargetAddress(profile.solanaAddress);
    }
  };

  const handleSubmitWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (numAmount < minWithdrawal) {
      setFeedback({ 
        type: 'error', 
        message: `Minimum withdrawal for ${subTier.toUpperCase()} is ${minWithdrawal} Blood Sovereigns ($${minUsdt} USDT).` 
      });
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

  // Compute all incoming sovereign events from PvP wins, mail rewards, and explicit logs
  const accrualEvents = useMemo(() => {
    const events: Array<{
      id: string;
      title: string;
      description: string;
      amount: number;
      timestamp: number;
      type: 'pvp' | 'league' | 'mail';
    }> = [];

    // Helper to get true timestamp from a mail object
    const getMailTimestamp = (mail: any): number => {
      const rawTime = mail.createdAt ?? mail.date ?? mail.timestamp;
      if (typeof rawTime === 'number' && !isNaN(rawTime)) return rawTime;
      if (typeof rawTime === 'string') {
        const parsed = new Date(rawTime).getTime();
        if (!isNaN(parsed)) return parsed;
      }
      const matchTimestamp = mail.id?.match(/_(\d{10,13})/);
      if (matchTimestamp && matchTimestamp[1]) {
        const num = parseInt(matchTimestamp[1], 10);
        return num < 10000000000 ? num * 1000 : num;
      }
      return Date.now();
    };

    // Track which mail IDs are already represented by sovereign transactions
    const recordedMailIds = new Set<string>();

    // 1. Explicit sovereign transactions if present
    if (profile.sovereignTransactions && Array.isArray(profile.sovereignTransactions)) {
      profile.sovereignTransactions.forEach((tx: any) => {
        if (tx.sovereignsChange > 0) {
          const isLeague = tx.action === 'LEAGUE_ROLLOVER' || tx.description?.toLowerCase().includes('league') || tx.description?.toLowerCase().includes('pvp season');
          const isPvp = tx.action === 'PVP_VICTORY';
          
          let txTime = typeof tx.timestamp === 'string' ? new Date(tx.timestamp).getTime() : tx.timestamp;

          // If this transaction came from a mail message, look up the mail's original date
          const mailId = tx.details?.mailId;
          if (mailId) {
            recordedMailIds.add(mailId);
            const foundMail = (profile.mailMessages || []).find((m: any) => m.id === mailId);
            if (foundMail) {
              txTime = getMailTimestamp(foundMail);
            } else if (tx.details?.originalCreatedAt) {
              const origTime = typeof tx.details.originalCreatedAt === 'number' 
                ? tx.details.originalCreatedAt 
                : new Date(tx.details.originalCreatedAt).getTime();
              if (!isNaN(origTime)) txTime = origTime;
            }
          }

          events.push({
            id: tx.id || `stx_${tx.timestamp}`,
            title: isLeague ? 'League Season Rollover Tribute' : isPvp ? 'PvP Duel Victory Bounty' : 'Imperial Decree Tribute',
            description: tx.description || 'Blood Sovereigns earned and deposited',
            amount: tx.sovereignsChange,
            timestamp: txTime,
            type: isLeague ? 'league' : isPvp ? 'pvp' : 'mail'
          });
        }
      });
    }

    // 2. PvP battles fallback ONLY if profile has no formal sovereignTransactions logged
    const hasFormalSovereignTx = Boolean(profile.sovereignTransactions && profile.sovereignTransactions.length > 0);
    if (!hasFormalSovereignTx && profile.pvpHistory && Array.isArray(profile.pvpHistory)) {
      profile.pvpHistory.forEach((rec: any) => {
        const isAttackerWin = rec.winner === 'attacker' && !rec.isDefense;
        if (rec.sovereignsReward && rec.sovereignsReward > 0) {
          events.push({
            id: `pvp_sov_${rec.id}`,
            title: 'PvP Duel Victory Bounty',
            description: `Victory vs ${rec.defenderName || 'Lord'} (Subscriber Benefit)`,
            amount: rec.sovereignsReward,
            timestamp: rec.timestamp || Date.now(),
            type: 'pvp'
          });
        } else if (isAttackerWin && (subTier === 'premium' || subTier === 'ultra')) {
          // Fallback reconstruction if battle record didn't store sovereignsReward field explicitly
          const amount = subTier === 'ultra' ? 2 : 1;
          events.push({
            id: `pvp_sov_${rec.id}`,
            title: 'PvP Duel Victory Bounty',
            description: `Victory vs ${rec.defenderName || 'Lord'} (Daily PvP Quota)`,
            amount,
            timestamp: rec.timestamp || Date.now(),
            type: 'pvp'
          });
        }
      });
    }

    // 3. Mailbox messages with Blood Sovereigns rewards (only if not already logged in sovereignTransactions)
    if (profile.mailMessages && Array.isArray(profile.mailMessages)) {
      profile.mailMessages.forEach((mail: any) => {
        const sovReward = mail.rewards?.bloodSovereigns;
        if (sovReward && sovReward > 0 && !recordedMailIds.has(mail.id)) {
          const isLeague = mail.title?.toLowerCase().includes('league') || mail.title?.toLowerCase().includes('pvp season');
          const mailTimestamp = getMailTimestamp(mail);

          events.push({
            id: `mail_sov_${mail.id}`,
            title: isLeague ? 'League Season Rollover Tribute' : mail.title || 'Imperial Decree Tribute',
            description: isLeague ? `${mail.title} - Seasonal rank tribute` : (mail.sender || 'Council of the Void'),
            amount: sovReward,
            timestamp: mailTimestamp,
            type: isLeague ? 'league' : 'mail'
          });
        }
      });
    }

    // Deduplicate by ID and sort descending by timestamp
    const seen = new Set<string>();
    const unique = events.filter(e => {
      if (seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    });

    return unique.sort((a, b) => b.timestamp - a.timestamp);
  }, [profile.sovereignTransactions, profile.pvpHistory, profile.mailMessages, subTier]);

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
          Elite reward currency of the Void. Earn Sovereigns in PvP battles and seasonal league rankings, and withdraw them as USDT at a fixed rate of <span className="text-amber-300 font-bold">100 SOV = $1.00</span>.
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
            <div className="grid grid-cols-2 gap-3 mt-4 text-center">
              <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                <span className="text-[9px] font-mono text-gray-400 uppercase block">Min. Payout</span>
                <span className="text-xs font-mono font-bold text-amber-300">{minWithdrawal} SOV (${minUsdt})</span>
              </div>
              <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                <span className="text-[9px] font-mono text-gray-400 uppercase block">Exchange Rate</span>
                <span className="text-xs font-mono font-bold text-cyan-300">1 SOV = $0.01</span>
              </div>
            </div>
          </div>

          {/* Withdrawal Terminal Form */}
          <div className="bg-[#141820] border border-amber-500/20 rounded-3xl p-6 shadow-xl relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-base text-white tracking-wider flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-amber-400" />
                WITHDRAWAL TERMINAL
              </h3>
            </div>

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
                    min={minWithdrawal}
                    max={balance}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder={`Enter amount (min ${minWithdrawal})`}
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
                    placeholder="Destination Wallet Address"
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
                disabled={isSubmitting || balance < minWithdrawal || numAmount < minWithdrawal || numAmount > balance}
                className={`w-full py-3 rounded-xl font-display font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  balance >= minWithdrawal && numAmount >= minWithdrawal && numAmount <= balance && !isSubmitting
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

          {/* Sovereigns Accrual History */}
          <div className="bg-[#141820] border border-amber-500/20 rounded-3xl p-6 shadow-xl flex flex-col min-h-[300px]">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <h3 className="font-display font-bold text-base text-amber-300 tracking-wider flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                ACCRUAL & INCOMING HISTORY
              </h3>
              <span className="text-[10px] font-mono text-gray-400">
                {accrualEvents.length} recorded
              </span>
            </div>

            {accrualEvents.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-2 text-gray-400">
                <img src="/icons/icon_sovereign.webp" alt="SOV" className="w-9 h-9 object-contain opacity-30 mb-1" />
                <span className="font-display font-bold text-sm text-gray-300">No Accruals Yet</span>
                <p className="text-xs text-gray-500 max-w-xs font-sans">
                  Blood Sovereigns earned from PvP duels, League Rollovers, or Mail Tributes will be recorded here.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                {accrualEvents.map((evt) => (
                  <div key={evt.id} className="bg-black/40 border border-amber-500/15 hover:border-amber-500/30 rounded-xl p-3 space-y-1.5 transition-colors">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-amber-950/60 border border-amber-500/30 flex items-center justify-center shrink-0">
                          {evt.type === 'pvp' ? (
                            <Swords className="w-3.5 h-3.5 text-amber-400" />
                          ) : evt.type === 'league' ? (
                            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                          ) : (
                            <Mail className="w-3.5 h-3.5 text-rose-400" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-display font-bold text-xs text-white leading-tight">{evt.title}</span>
                          <span className="text-[10px] text-gray-400 font-sans leading-tight">{evt.description}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <img src="/icons/icon_sovereign.webp" alt="SOV" className="w-3.5 h-3.5 object-contain" />
                        <span className="font-mono font-black text-amber-300 text-xs">
                          +{evt.amount} SOV
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 pt-1 border-t border-white/5">
                      <span className="uppercase text-[9px] tracking-wider text-amber-500/80 font-bold">
                        {evt.type === 'pvp' ? 'PvP Duel Win' : evt.type === 'league' ? 'League Season Rollover' : 'Imperial Tribute'}
                      </span>
                      <span>
                        {new Date(evt.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};