import React, { useState, useMemo, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { 
  Landmark, 
  ArrowUpRight, 
  ArrowDownLeft,
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Wallet, 
  Coins, 
  RefreshCw, 
  TrendingUp, 
  Swords, 
  Trophy, 
  Scroll, 
  Award,
  ClipboardPaste,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Official TON vector icons
export const TonIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="14" cy="14" r="14" fill="#0098EA" />
    <path
      d="M18.7802 8.00098H9.21936C7.46145 8.00098 6.34727 9.89726 7.23164 11.4302L13.1322 21.6576C13.5173 22.3254 14.4823 22.3254 14.8673 21.6576L20.7691 11.4302C21.6523 9.89966 20.5381 8.00098 18.7814 8.00098H18.7802ZM13.1274 18.5906L11.8424 16.1035L8.74168 10.5578C8.53714 10.2029 8.78981 9.74806 9.21816 9.74806H13.1262V18.5918L13.1274 18.5906ZM19.2555 10.5566L16.156 16.1047L14.8709 18.5906V9.74685H18.779C19.2073 9.74685 19.46 10.2017 19.2555 10.5566Z"
      fill="white"
    />
  </svg>
);

export const TonSymbol: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14.1839 17.7069C13.6405 18.6507 13.3688 19.1226 13.0591 19.348C12.4278 19.8074 11.5723 19.8074 10.941 19.348C10.6312 19.1226 10.3595 18.6507 9.81613 17.7069L5.52066 10.2464C4.76864 8.94024 4.39263 8.28717 4.33762 7.75894C4.2255 6.68236 4.81894 5.65591 5.80788 5.21589C6.29309 5 7.04667 5 8.55383 5H15.4462C16.9534 5 17.7069 5 18.1922 5.21589C19.1811 5.65591 19.7745 6.68236 19.6624 7.75894C19.6074 8.28717 19.2314 8.94024 18.4794 10.2464L14.1839 17.7069ZM11.1 16.3412L6.56139 8.48002C6.31995 8.06185 6.19924 7.85276 6.18146 7.68365C6.14523 7.33896 6.33507 7.01015 6.65169 6.86919C6.80703 6.80002 7.04847 6.80002 7.53133 6.80002H7.53134L11.1 6.80002V16.3412ZM12.9 16.3412L17.4387 8.48002C17.6801 8.06185 17.8008 7.85276 17.8186 7.68365C17.8548 7.33896 17.665 7.01015 17.3484 6.86919C17.193 6.80002 16.9516 6.80002 16.4687 6.80002L12.9 6.80002V16.3412Z"
    />
  </svg>
);

export const MobileBankView: React.FC = () => {
  const { profile, requestWithdrawal } = useGame();

  const isTelegramUser = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const hasTgWebApp = Boolean((window as any).Telegram?.WebApp?.initData);
    const isTgAddress = Boolean(profile.solanaAddress?.startsWith('tg_'));
    const isTgUa = /Telegram/i.test(navigator.userAgent || '');
    return hasTgWebApp || isTgAddress || isTgUa;
  }, [profile.solanaAddress]);

  const [tonConnectUI] = useTonConnectUI();
  const tonAddress = useTonAddress();
  const [manualTonMode, setManualTonMode] = useState(false);
  const [copiedTon, setCopiedTon] = useState(false);

  const [activeTab, setActiveTab] = useState<'terminal' | 'history'>('terminal');
  const [historyTab, setHistoryTab] = useState<'incoming' | 'withdrawals'>('incoming');

  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [targetAddress, setTargetAddress] = useState<string>(() => {
    if (profile.solanaAddress && !profile.solanaAddress.startsWith('tg_')) {
      return profile.solanaAddress;
    }
    return '';
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Automatically sync connected TON wallet address for Telegram users
  useEffect(() => {
    if (isTelegramUser && tonAddress) {
      setTargetAddress(tonAddress);
    }
  }, [isTelegramUser, tonAddress]);

  const handleCopyTon = async (text: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setCopiedTon(true);
        setTimeout(() => setCopiedTon(false), 2000);
      }
    } catch {
      // Ignore clipboard write permission error
    }
  };

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

  const handlePasteClipboard = async () => {
    try {
      if (navigator?.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim().length > 0) {
          setTargetAddress(text.trim());
        }
      }
    } catch {
      // Ignore clipboard read permission failures
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
      setFeedback({ 
        type: 'error', 
        message: isTelegramUser 
          ? 'Please connect your Telegram/TON wallet or enter a valid TON address.' 
          : 'Please provide a valid Solana destination wallet address.' 
      });
      return;
    }

    if (isTelegramUser && targetAddress.startsWith('tg_')) {
      setFeedback({
        type: 'error',
        message: 'Please connect your TON wallet (Telegram Wallet, Tonkeeper, MyTonWallet, etc.) for Telegram payouts.'
      });
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

  // Compute all incoming sovereign events from PvP wins, mail rewards, and explicit logs (exact PC parity)
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

    const recordedMailIds = new Set<string>();

    // 1. Explicit sovereign transactions if present
    if (profile.sovereignTransactions && Array.isArray(profile.sovereignTransactions)) {
      profile.sovereignTransactions.forEach((tx: any) => {
        if (tx.sovereignsChange > 0) {
          const isLeague = tx.action === 'LEAGUE_ROLLOVER' || tx.description?.toLowerCase().includes('league') || tx.description?.toLowerCase().includes('pvp season');
          const isPvp = tx.action === 'PVP_VICTORY';
          const isCampaign = tx.action === 'CAMPAIGN_FIRST_CLEAR' || tx.description?.toLowerCase().includes('campaign');
          
          let txTime = typeof tx.timestamp === 'string' ? new Date(tx.timestamp).getTime() : tx.timestamp;

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
            title: isCampaign 
              ? 'Abyssal First Clear Bounty' 
              : isLeague 
                ? 'League Season Rollover Tribute' 
                : isPvp 
                  ? 'PvP Duel Victory Bounty' 
                  : 'Imperial Decree Tribute',
            description: tx.description || 'Blood Sovereigns earned and deposited',
            amount: tx.sovereignsChange,
            timestamp: txTime,
            type: isCampaign ? 'campaign' : isLeague ? 'league' : isPvp ? 'pvp' : 'mail'
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

    // 3. Mailbox messages with Blood Sovereigns rewards
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

    // 4. Campaign First-Clear fallback if not already in sovereignTransactions
    if (profile.campaignSovereignsClaimed && Array.isArray(profile.campaignSovereignsClaimed)) {
      profile.campaignSovereignsClaimed.forEach((floorNum: number) => {
        const floorStr = `Floor ${floorNum}`;
        const alreadyLogged = events.some(e => e.description?.includes(floorStr) || e.id?.includes(`camp_${floorNum}`));
        if (!alreadyLogged) {
          const sovReward = floorNum % 10 === 0 ? 50 : floorNum % 5 === 0 ? 25 : 0;
          if (sovReward > 0) {
            events.push({
              id: `camp_sov_${floorNum}`,
              title: 'Abyssal First Clear Bounty',
              description: `Campaign First Clear - Floor ${floorNum}`,
              amount: sovReward,
              timestamp: Date.now(),
              type: 'campaign'
            });
          }
        }
      });
    }

    // Deduplicate and sort descending
    const seen = new Set<string>();
    const unique = events.filter(e => {
      if (seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    });

    return unique.sort((a, b) => b.timestamp - a.timestamp);
  }, [profile.sovereignTransactions, profile.pvpHistory, profile.mailMessages, profile.campaignSovereignsClaimed, subTier]);

  // Statistics: Total incoming & Total paid out
  const totalEarned = useMemo(() => {
    return accrualEvents.reduce((acc, evt) => acc + (evt.amount || 0), 0);
  }, [accrualEvents]);
  const totalEarnedUsdt = (totalEarned * 0.01).toFixed(2);

  const totalPaidOut = useMemo(() => {
    return history
      .filter((req) => req.status === 'completed')
      .reduce((acc, req) => acc + (req.amountSovereigns || 0), 0);
  }, [history]);
  const totalPaidOutUsdt = (totalPaidOut * 0.01).toFixed(2);

  const pendingCount = useMemo(() => {
    return history.filter((req) => req.status === 'pending' || !req.status).length;
  }, [history]);

  return (
    <div className="max-w-md mx-auto p-3 sm:p-4 pb-24 space-y-4 animate-fade-in">
      
      {/* 1. Header (Exact PC wording, compact mobile layout) */}
      <div className="text-center space-y-1.5 pt-1">
        <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-950/50 via-black to-amber-950/50 border border-amber-500/40 px-3.5 py-1 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.2)]">
          <Landmark className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-display font-black text-amber-300 text-[10.5px] tracking-widest uppercase">
            ROYAL VAULT & TREASURY
          </span>
        </div>
        <h2 className="font-display font-black text-xl sm:text-2xl text-white tracking-widest text-shadow-gold flex items-center justify-center gap-2">
          <img src="/icons/icon_sovereign.webp" alt="Sovereign" className="w-6 h-6 object-contain drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
          BLOOD SOVEREIGNS
        </h2>
        <p className="text-[11px] text-gray-400 font-sans max-w-sm mx-auto leading-relaxed px-1">
          Elite reward currency of the Void. Earn Sovereigns in PvP battles and seasonal league rankings, and withdraw them as USDT at a fixed rate of <span className="text-amber-300 font-bold">100 SOV = $1.00</span>.
        </p>
      </div>

      {/* 2. Available Balance Card (Exact PC metrics: Balance, USDT Value, Min. Payout, Exchange Rate) */}
      <div className="bg-gradient-to-b from-[#1b1216] via-[#141820] to-[#0f1217] border-2 border-amber-500/30 rounded-2xl p-4 shadow-xl relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3.5">
          <div>
            <span className="text-gray-400 text-[9.5px] font-mono uppercase tracking-widest block mb-0.5">
              Available Balance
            </span>
            <div className="flex items-center gap-2.5">
              <img src="/icons/icon_sovereign.webp" alt="Sovereign" className="w-8 h-8 object-contain drop-shadow-[0_0_10px_rgba(245,158,11,0.9)] shrink-0" />
              <span className="font-mono font-black text-3xl text-amber-300 text-shadow-gold tracking-tight">
                {balance}
              </span>
              <span className="font-mono text-xs font-bold text-amber-400/80 self-end mb-0.5">SOV</span>
            </div>
          </div>

          <div className="bg-black/60 border border-amber-500/30 rounded-xl px-3 py-2 text-right shrink-0">
            <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block">Estimated Value</span>
            <span className="font-mono font-black text-base text-emerald-400">
              ${totalUsdtBalance} <span className="text-[10px] text-emerald-500/80 font-normal">USDT</span>
            </span>
          </div>
        </div>

        {/* Quick Specs: 2 Columns */}
        <div className="grid grid-cols-2 gap-2 mt-3 text-center">
          <div className="bg-black/40 p-2 rounded-xl border border-white/5">
            <span className="text-[8.5px] font-mono text-gray-400 uppercase block">Min. Payout</span>
            <span className="text-xs font-mono font-bold text-amber-300">{minWithdrawal} SOV (${minUsdt})</span>
          </div>
          <div className="bg-black/40 p-2 rounded-xl border border-white/5">
            <span className="text-[8.5px] font-mono text-gray-400 uppercase block">Exchange Rate</span>
            <span className="text-xs font-mono font-bold text-cyan-300">1 SOV = $0.01</span>
          </div>
        </div>
      </div>

      {/* 3. Primary Navigation Tabs: TERMINAL vs HISTORY */}
      <div className="sticky top-0 z-20 flex items-center bg-[#0d0e14]/95 backdrop-blur-md p-1 rounded-2xl border border-white/15 gap-1 shadow-[0_4px_20px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.08)]">
        {/* Terminal Tab */}
        <button
          type="button"
          onClick={() => setActiveTab('terminal')}
          className={`flex-1 py-2 px-2 rounded-xl text-[10.5px] font-display font-black tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'terminal'
              ? 'bg-gradient-to-b from-amber-950/90 via-yellow-950/60 to-[#140b02] border border-amber-500/70 text-amber-100 shadow-[0_0_14px_rgba(245,158,11,0.35),inset_0_1px_1px_rgba(255,255,255,0.2)]'
              : 'bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/15 text-gray-300 hover:text-white'
          }`}
        >
          <ArrowUpRight className={`w-4 h-4 transition-transform ${activeTab === 'terminal' ? 'text-amber-400 scale-110' : 'text-gray-400'}`} />
          <span className={activeTab === 'terminal' ? 'drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]' : ''}>
            TERMINAL
          </span>
        </button>

        {/* History Tab */}
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 px-2 rounded-xl text-[10.5px] font-display font-black tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'history'
              ? 'bg-gradient-to-b from-cyan-950/90 via-sky-950/60 to-[#031114] border border-cyan-500/70 text-cyan-100 shadow-[0_0_14px_rgba(6,182,212,0.35),inset_0_1px_1px_rgba(255,255,255,0.2)]'
              : 'bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/15 text-gray-300 hover:text-white'
          }`}
        >
          <Clock className={`w-4 h-4 transition-transform ${activeTab === 'history' ? 'text-cyan-400 scale-110' : 'text-gray-400'}`} />
          <span className={activeTab === 'history' ? 'drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]' : ''}>
            HISTORY
          </span>
          {(history.length > 0 || accrualEvents.length > 0) && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-white/10 text-gray-300 font-bold ml-0.5">
              {history.length + accrualEvents.length}
            </span>
          )}
        </button>
      </div>

      {/* 4. Tab Content: TERMINAL */}
      {activeTab === 'terminal' && (
        <div className="bg-[#141820] border border-amber-500/20 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-display font-bold text-sm text-white tracking-wider flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-amber-400" />
              WITHDRAWAL TERMINAL
            </h3>
            {!isTelegramUser && (
              <span className="text-[10px] font-mono text-gray-400">
                SOLANA NETWORK
              </span>
            )}
          </div>

          <form onSubmit={handleSubmitWithdrawal} className="space-y-4">
            
            {/* Amount Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="text-gray-300 font-mono text-[11px]">Amount to Withdraw</label>
                <span className="text-gray-400 font-mono text-[10.5px]">
                  Available: <strong className="text-amber-300 font-bold">{balance} SOV</strong>
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
                  className="w-full bg-black/60 border border-white/15 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm outline-none transition-colors"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-amber-400 pointer-events-none">
                  SOV
                </div>
              </div>

              {/* Quick % buttons */}
              <div className="flex gap-1.5 pt-1">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handleQuickPercent(pct)}
                    className="flex-1 bg-black/40 hover:bg-amber-950/40 border border-white/10 hover:border-amber-500/40 py-1.5 rounded-lg text-xs font-mono font-bold text-gray-300 hover:text-amber-300 transition-all cursor-pointer active:scale-95"
                  >
                    {pct === 100 ? 'MAX' : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversion preview */}
            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3 flex justify-between items-center text-xs font-mono">
              <span className="text-emerald-300/80 text-[11px]">You Will Receive:</span>
              <span className="text-sm font-black text-emerald-400">${usdtEquivalent} USDT</span>
            </div>

            {/* Destination Wallet: Telegram / TON vs Solana */}
            {isTelegramUser ? (
              <div className="space-y-2">
                {tonAddress ? (
                  /* TON Connected State */
                  <div className="bg-[#0b1420]/80 border border-[#0098ea]/30 rounded-xl p-3 space-y-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <TonIcon className="w-6 h-6 shrink-0 rounded-full shadow-sm" />
                        <div>
                          <div className="text-[11px] font-bold text-white leading-tight">Telegram Wallet Connected</div>
                          <span className="text-[9px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                            Ready for TON Payout
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await tonConnectUI.disconnect();
                            setTargetAddress('');
                          } catch (e) {
                            console.error('Failed to disconnect TON wallet:', e);
                          }
                        }}
                        className="text-[10px] font-mono text-gray-400 hover:text-red-400 transition-colors px-2 py-1 rounded bg-black/40 border border-white/10 hover:border-red-500/30 cursor-pointer"
                      >
                        Disconnect
                      </button>
                    </div>

                    <div className="flex items-center justify-between bg-black/70 border border-[#0098ea]/20 rounded-lg px-3 py-2">
                      <span className="font-mono text-xs text-sky-200 tracking-wide truncate max-w-[200px]" title={tonAddress}>
                        {tonAddress.slice(0, 8)}...{tonAddress.slice(-8)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyTon(tonAddress)}
                        className="text-[10px] font-mono text-[#0098ea] hover:text-[#38b6ff] flex items-center gap-1 px-2 py-1 rounded bg-[#0098ea]/15 hover:bg-[#0098ea]/25 border border-[#0098ea]/30 transition-all cursor-pointer shrink-0"
                      >
                        {copiedTon ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedTon ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    <p className="text-[10px] text-gray-400 font-sans leading-relaxed">
                      Withdrawals will be transferred directly to this TON address.
                    </p>
                  </div>
                ) : (
                  /* TON Disconnected State */
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => tonConnectUI.openModal()}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#0088cc] to-[#0098ea] hover:from-[#007cb8] hover:to-[#0aa4f7] text-white font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-[0_4px_16px_rgba(0,152,234,0.3)] active:scale-[0.99] transition-all cursor-pointer border border-[#0098ea]/40"
                    >
                      <TonSymbol className="w-4 h-4 text-white shrink-0" />
                      <span>Connect Telegram / TON Wallet</span>
                    </button>

                    <div className="flex items-center justify-between px-1 pt-0.5">
                      <button
                        type="button"
                        onClick={() => setManualTonMode(!manualTonMode)}
                        className="text-[10.5px] font-mono text-gray-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {manualTonMode ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        <span>{manualTonMode ? 'Hide manual address input' : 'Or paste TON address manually'}</span>
                      </button>
                    </div>

                    {manualTonMode && (
                      <div className="bg-black/50 border border-white/10 rounded-xl p-3 space-y-1.5 animate-in fade-in duration-150">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-gray-400 font-mono">TON Address (UQ... / EQ...)</span>
                          <button
                            type="button"
                            onClick={handlePasteClipboard}
                            className="inline-flex items-center gap-1 text-[10px] font-mono text-[#0098ea] hover:text-[#38b6ff] underline cursor-pointer"
                          >
                            <ClipboardPaste className="w-3 h-3" />
                            Paste
                          </button>
                        </div>
                        <input
                          type="text"
                          value={targetAddress}
                          onChange={(e) => setTargetAddress(e.target.value)}
                          placeholder="e.g. UQD... or EQD..."
                          className="w-full bg-black/70 border border-white/15 focus:border-[#0098ea] rounded-lg px-3 py-2 text-white font-mono text-xs outline-none transition-colors"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Regular Mobile Browser: Solana Wallet Address Input */
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="text-gray-300 font-mono text-[11px]">Destination Wallet (Solana)</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePasteClipboard}
                      className="inline-flex items-center gap-1 text-[10px] font-mono text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                    >
                      <ClipboardPaste className="w-3 h-3" />
                      Paste
                    </button>
                    {profile.solanaAddress && !profile.solanaAddress.startsWith('tg_') && (
                      <button
                        type="button"
                        onClick={handleUseConnectedWallet}
                        className="text-amber-400 hover:text-amber-300 text-[10px] font-mono underline cursor-pointer"
                      >
                        Use Connected
                      </button>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={targetAddress}
                    onChange={(e) => setTargetAddress(e.target.value)}
                    placeholder="Solana destination address (e.g. 7xK...)"
                    className="w-full bg-black/60 border border-white/15 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs outline-none transition-colors pr-9"
                  />
                  <Wallet className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Feedback messages */}
            {feedback && (
              <div className={`p-3 rounded-xl flex items-start gap-2 text-xs font-sans border ${
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
              className={`w-full py-3 rounded-xl font-display font-black text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
                balance >= minWithdrawal && numAmount >= minWithdrawal && numAmount <= balance && !isSubmitting
                  ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-98'
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
      )}

      {/* 5. Tab Content: HISTORY (Separated: INCOMING vs WITHDRAWALS) */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          
          {/* Sub-tab switcher: INCOMING vs WITHDRAWALS (50% / 50%, clean financial typography) */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/40 rounded-xl border border-white/5">
            <button
              type="button"
              onClick={() => setHistoryTab('incoming')}
              className={`py-2 px-2.5 rounded-lg text-[11px] font-display font-black tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                historyTab === 'incoming'
                  ? 'bg-gradient-to-r from-amber-950/90 to-yellow-950/70 text-amber-200 border border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                  : 'text-gray-400 hover:text-white bg-transparent'
              }`}
            >
              <ArrowDownLeft className={`w-3.5 h-3.5 shrink-0 ${historyTab === 'incoming' ? 'text-emerald-400' : 'text-gray-500'}`} />
              <span>INCOMING</span>
              <span className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded-full font-bold ml-0.5 ${
                historyTab === 'incoming' ? 'bg-amber-400/20 text-amber-200' : 'bg-white/5 text-gray-400'
              }`}>
                {accrualEvents.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setHistoryTab('withdrawals')}
              className={`py-2 px-2.5 rounded-lg text-[11px] font-display font-black tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                historyTab === 'withdrawals'
                  ? 'bg-gradient-to-r from-cyan-950/90 to-blue-950/70 text-cyan-200 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'text-gray-400 hover:text-white bg-transparent'
              }`}
            >
              <ArrowUpRight className={`w-3.5 h-3.5 shrink-0 ${historyTab === 'withdrawals' ? 'text-cyan-400' : 'text-gray-500'}`} />
              <span>WITHDRAWALS</span>
              <span className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded-full font-bold ml-0.5 ${
                historyTab === 'withdrawals' ? 'bg-cyan-400/20 text-cyan-200' : 'bg-white/5 text-gray-400'
              }`}>
                {history.length}
              </span>
            </button>
          </div>

          {/* VIEW 1: INCOMING STATISTICS & LIST */}
          {historyTab === 'incoming' && (
            <div className="space-y-3">
              {/* Summary Statistics Card */}
              <div className="grid grid-cols-2 gap-2 bg-gradient-to-r from-amber-950/30 via-black/50 to-amber-950/30 border border-amber-500/20 rounded-2xl p-3 text-center shadow-lg">
                <div className="border-r border-white/5 pr-2">
                  <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block mb-0.5">
                    Total Earned
                  </span>
                  <div className="flex items-center justify-center gap-1.5">
                    <img src="/icons/icon_sovereign.webp" alt="SOV" className="w-3.5 h-3.5 object-contain" />
                    <span className="font-mono font-black text-sm text-amber-300">
                      +{totalEarned}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      (${totalEarnedUsdt})
                    </span>
                  </div>
                </div>
                <div className="pl-2">
                  <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block mb-0.5">
                    Accrual Records
                  </span>
                  <span className="font-mono font-bold text-sm text-white">
                    {accrualEvents.length} <span className="text-[10px] text-gray-400 font-normal">entries</span>
                  </span>
                </div>
              </div>

              {/* Accruals List Container */}
              <div className="bg-[#141820] border border-amber-500/20 rounded-2xl p-4 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <h3 className="font-display font-bold text-xs sm:text-sm text-amber-300 tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    ACCRUAL & INCOMING HISTORY
                  </h3>
                  <span className="text-[10px] font-mono text-gray-400">
                    {accrualEvents.length} recorded
                  </span>
                </div>

                {accrualEvents.length === 0 ? (
                  <div className="py-8 flex flex-col items-center justify-center text-center space-y-1.5 text-gray-400">
                    <img src="/icons/icon_sovereign.webp" alt="SOV" className="w-8 h-8 object-contain opacity-30 mb-1" />
                    <span className="font-display font-bold text-xs text-gray-300">No Accruals Yet</span>
                    <p className="text-[10.5px] text-gray-500 max-w-xs font-sans">
                      Blood Sovereigns earned from PvP duels, League Rollovers, or Mail Tributes will be recorded here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[360px] overflow-y-auto pr-0.5">
                    {accrualEvents.map((evt) => (
                      <div key={evt.id} className="bg-black/40 border border-amber-500/15 hover:border-amber-500/30 rounded-xl p-2.5 space-y-1.5 transition-colors">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-amber-950/60 border border-amber-500/30 flex items-center justify-center shrink-0">
                              {evt.type === 'pvp' ? (
                                <Swords className="w-3.5 h-3.5 text-amber-400" />
                              ) : evt.type === 'league' ? (
                                <Trophy className="w-3.5 h-3.5 text-amber-300" />
                              ) : evt.type === 'campaign' ? (
                                <Award className="w-3.5 h-3.5 text-amber-300" />
                              ) : (
                                <Scroll className="w-3.5 h-3.5 text-amber-200" />
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-display font-bold text-[11px] text-white leading-tight">{evt.title}</span>
                              <span className="text-[9.5px] text-gray-400 font-sans leading-tight line-clamp-1">{evt.description}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <img src="/icons/icon_sovereign.webp" alt="SOV" className="w-3 h-3 object-contain" />
                            <span className="font-mono font-black text-amber-300 text-xs">
                              +{evt.amount} SOV
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-[9.5px] font-mono text-gray-500 pt-1 border-t border-white/5">
                          <span className="uppercase text-[8.5px] tracking-wider text-amber-500/80 font-bold">
                            {evt.type === 'pvp' ? 'PvP Duel Win' : evt.type === 'league' ? 'League Season Rollover' : evt.type === 'campaign' ? 'Abyssal First Clear' : 'Imperial Decree'}
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
          )}

          {/* VIEW 2: WITHDRAWALS STATISTICS & LIST */}
          {historyTab === 'withdrawals' && (
            <div className="space-y-3">
              {/* Summary Statistics Card */}
              <div className="grid grid-cols-2 gap-2 bg-gradient-to-r from-cyan-950/30 via-black/50 to-cyan-950/30 border border-cyan-500/20 rounded-2xl p-3 text-center shadow-lg">
                <div className="border-r border-white/5 pr-2">
                  <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block mb-0.5">
                    Total Paid Out
                  </span>
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="font-mono font-black text-sm text-cyan-300">
                      {totalPaidOut} SOV
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      (${totalPaidOutUsdt})
                    </span>
                  </div>
                </div>
                <div className="pl-2">
                  <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block mb-0.5">
                    Pending Requests
                  </span>
                  <span className={`font-mono font-bold text-sm ${pendingCount > 0 ? 'text-amber-300 font-black' : 'text-gray-400'}`}>
                    {pendingCount} <span className="text-[10px] text-gray-400 font-normal">in review</span>
                  </span>
                </div>
              </div>

              {/* Withdrawals List Container */}
              <div className="bg-[#141820] border border-white/10 rounded-2xl p-4 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <h3 className="font-display font-bold text-xs sm:text-sm text-white tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    WITHDRAWAL HISTORY
                  </h3>
                  <span className="text-[10px] font-mono text-gray-400">
                    {history.length} requests
                  </span>
                </div>

                {history.length === 0 ? (
                  <div className="py-8 flex flex-col items-center justify-center text-center space-y-1.5 text-gray-400">
                    <Coins className="w-8 h-8 text-gray-600 mb-1" />
                    <span className="font-display font-bold text-xs text-gray-300">No Withdrawal Requests</span>
                    <p className="text-[10.5px] text-gray-500 max-w-xs font-sans">
                      Your submitted payout requests and transaction links will be tracked here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[360px] overflow-y-auto pr-0.5">
                    {history.map((req) => (
                      <div key={req.id} className="bg-black/40 border border-white/5 rounded-xl p-2.5 space-y-1.5">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5">
                            <img src="/icons/icon_sovereign.webp" alt="SOV" className="w-3.5 h-3.5 object-contain" />
                            <span className="font-mono font-bold text-amber-300 text-xs">{req.amountSovereigns} SOV</span>
                            <span className="font-mono text-emerald-400 text-xs font-bold">(${req.amountUsdt} USDT)</span>
                          </div>
                          <span className={`text-[8.5px] font-mono font-bold px-2 py-0.5 rounded-full uppercase border ${
                            req.status === 'completed' 
                              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                              : req.status === 'rejected'
                              ? 'bg-red-950/60 border-red-500/40 text-red-300'
                              : 'bg-amber-950/60 border-amber-500/40 text-amber-300 animate-pulse'
                          }`}>
                            {req.status === 'completed' ? '✓ Completed' : req.status === 'rejected' ? '✗ Rejected' : '⏳ Pending'}
                          </span>
                        </div>

                        {(() => {
                          const isTon = Boolean(
                            req.walletAddress?.startsWith('EQ') ||
                            req.walletAddress?.startsWith('UQ') ||
                            req.walletAddress?.startsWith('0:') ||
                            req.walletAddress?.startsWith('-1:')
                          );
                          return (
                            <>
                              <div className="flex justify-between items-center text-[10px] font-mono text-gray-400">
                                <span className="truncate max-w-[170px] flex items-center gap-1">
                                  <span className={`text-[8px] font-bold px-1 py-0.2 rounded border ${
                                    isTon ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                  }`}>
                                    {isTon ? 'TON' : 'SOL'}
                                  </span>
                                  {req.walletAddress}
                                </span>
                                <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                              </div>

                              {req.txHash && (
                                <div className="pt-1 border-t border-white/5">
                                  <a 
                                    href={isTon ? `https://tonviewer.com/transaction/${req.txHash}` : `https://solscan.io/tx/${req.txHash}`} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    {isTon ? 'View Transaction on Tonviewer ↗' : 'View Transaction on Solscan ↗'}
                                  </a>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
