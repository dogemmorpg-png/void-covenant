import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { 
  ShieldAlert, 
  X, 
  BarChart3, 
  Coins, 
  Mail, 
  Users, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink, 
  Copy, 
  Check, 
  Send, 
  Sparkles, 
  Search, 
  Crown, 
  Zap, 
  TrendingUp, 
  Landmark 
} from 'lucide-react';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const getNormalizedLeague = (leagueRaw: any): string => {
  if (!leagueRaw || typeof leagueRaw !== 'string') return 'Bronze';
  const l = leagueRaw.trim();
  if (!l) return 'Bronze';
  if (/overlord|void|grandmaster|gm/i.test(l)) return 'Void Overlord';
  if (/diamond/i.test(l)) return 'Diamond';
  if (/platinum/i.test(l)) return 'Platinum';
  if (/gold/i.test(l)) return 'Gold';
  if (/silver/i.test(l)) return 'Silver';
  if (/bronze/i.test(l)) return 'Bronze';
  return l;
};

export const getLeagueBadgeStyle = (leagueRaw: any) => {
  const norm = getNormalizedLeague(leagueRaw);
  switch (norm) {
    case 'Void Overlord':
      return {
        badge: '👑 VOID OVERLORD',
        className: 'bg-gradient-to-r from-red-950/90 via-purple-950/90 to-red-950/90 border border-red-500/70 text-red-300 shadow-[0_0_15px_rgba(220,38,38,0.5)]'
      };
    case 'Diamond':
      return {
        badge: '💎 DIAMOND',
        className: 'bg-cyan-950/70 border border-cyan-400/60 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.35)]'
      };
    case 'Platinum':
      return {
        badge: '🔮 PLATINUM',
        className: 'bg-indigo-950/70 border border-indigo-400/60 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.35)]'
      };
    case 'Gold':
      return {
        badge: '🥇 GOLD',
        className: 'bg-yellow-950/70 border border-yellow-500/60 text-yellow-300 shadow-[0_0_10px_rgba(234,179,8,0.35)]'
      };
    case 'Silver':
      return {
        badge: '🥈 SILVER',
        className: 'bg-gray-800/70 border border-gray-400/60 text-gray-200 shadow-sm'
      };
    default:
      return {
        badge: '🥉 BRONZE',
        className: 'bg-amber-950/50 border border-amber-600/50 text-amber-300'
      };
  }
};

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({ isOpen, onClose }) => {
  const { 
    fetchAdminOverview, 
    fetchAdminWithdrawals, 
    processAdminWithdrawal, 
    broadcastAdminMail, 
    searchAdminPlayer, 
    modifyAdminPlayer, 
    triggerAdminRollover 
  } = useGame();

  const [activeTab, setActiveTab] = useState<'overview' | 'withdrawals' | 'broadcast' | 'players' | 'maintenance'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [overview, setOverview] = useState<any>(null);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [withdrawalFilter, setWithdrawalFilter] = useState<'all' | 'pending' | 'completed' | 'rejected'>('all');
  const [withdrawalSearch, setWithdrawalSearch] = useState('');
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Approval / Rejection Modal State
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [txidInput, setTxidInput] = useState('');
  const [rejectReasonInput, setRejectReasonInput] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Broadcast State
  const [broadcastTarget, setBroadcastTarget] = useState<'all' | 'league' | 'player'>('all');
  const [broadcastTargetValue, setBroadcastTargetValue] = useState('');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [rewardGold, setRewardGold] = useState<number>(0);
  const [rewardDust, setRewardDust] = useState<number>(0);
  const [rewardShards, setRewardShards] = useState<number>(0);
  const [rewardSovereigns, setRewardSovereigns] = useState<number>(0);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<string | null>(null);

  // Player Inspector State
  const [searchQuery, setSearchQuery] = useState('');
  const [allPlayers, setAllPlayers] = useState<any[]>([]);
  const [playerLeagueFilter, setPlayerLeagueFilter] = useState<string>('all');
  const [playerSortBy, setPlayerSortBy] = useState<'active' | 'level' | 'sovereigns' | 'gold' | 'lp'>('active');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [editGold, setEditGold] = useState<number>(0);
  const [editDust, setEditDust] = useState<number>(0);
  const [editShards, setEditShards] = useState<number>(0);
  const [editSovereigns, setEditSovereigns] = useState<number>(0);
  const [editLeague, setEditLeague] = useState<string>('Bronze');
  const [editLP, setEditLP] = useState<number>(0);
  const [isModifyingPlayer, setIsModifyingPlayer] = useState(false);
  const [playerModifyFeedback, setPlayerModifyFeedback] = useState<string | null>(null);

  // Rollover Trigger State
  const [isTriggeringRollover, setIsTriggeringRollover] = useState(false);
  const [rolloverFeedback, setRolloverFeedback] = useState<string | null>(null);

  // Load Overview
  const loadOverview = async () => {
    setIsLoading(true);
    try {
      const res = await fetchAdminOverview();
      const ov = res.overview || res.data?.overview;
      if (ov) {
        setOverview(ov);
      } else if (!res.success) {
        console.error('Failed to load overview:', res.message || res.error);
      }
    } catch (e: any) {
      console.error('Failed to load admin overview:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Load Withdrawals
  const loadWithdrawals = async () => {
    setIsLoading(true);
    try {
      const res = await fetchAdminWithdrawals();
      const reqs = res.requests || res.data?.requests;
      if (reqs) {
        setWithdrawals(reqs);
      } else if (!res.success) {
        console.error('Failed to load withdrawals:', res.message || res.error);
      }
    } catch (e: any) {
      console.error('Failed to load withdrawals:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Load All Players
  const loadAllPlayers = async (query = '') => {
    setIsLoading(true);
    try {
      const res = await searchAdminPlayer(query);
      const list = res.matches || res.players || res.data?.matches || res.data?.players || [];
      setAllPlayers(list);
      setSearchResults(list);
    } catch (e: any) {
      console.error('Failed to load all players:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'overview') loadOverview();
      if (activeTab === 'withdrawals') loadWithdrawals();
      if (activeTab === 'players') loadAllPlayers(searchQuery);
    }
  }, [isOpen, activeTab]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(text);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const handleApprove = async () => {
    if (!selectedReq) return;
    setIsProcessingAction(true);
    setActionFeedback(null);
    try {
      const res = await processAdminWithdrawal(
        selectedReq.id, 
        selectedReq.userWallet, 
        'approve', 
        txidInput.trim()
      );
      if (res.success) {
        setActionFeedback({ type: 'success', message: res.message });
        setTimeout(() => {
          setSelectedReq(null);
          setTxidInput('');
          loadWithdrawals();
        }, 1200);
      } else {
        setActionFeedback({ type: 'error', message: res.message || 'Approval failed' });
      }
    } catch (e: any) {
      setActionFeedback({ type: 'error', message: e.message || 'Error executing payout' });
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleReject = async () => {
    if (!selectedReq) return;
    setIsProcessingAction(true);
    setActionFeedback(null);
    try {
      const res = await processAdminWithdrawal(
        selectedReq.id, 
        selectedReq.userWallet, 
        'reject', 
        undefined, 
        rejectReasonInput.trim()
      );
      if (res.success) {
        setActionFeedback({ type: 'success', message: res.message });
        setTimeout(() => {
          setSelectedReq(null);
          setRejectReasonInput('');
          loadWithdrawals();
        }, 1200);
      } else {
        setActionFeedback({ type: 'error', message: res.message || 'Rejection failed' });
      }
    } catch (e: any) {
      setActionFeedback({ type: 'error', message: e.message || 'Error rejecting withdrawal' });
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastContent) return;
    setIsBroadcasting(true);
    setBroadcastResult(null);

    const rewards: any = {};
    if (rewardGold > 0) rewards.gold = rewardGold;
    if (rewardDust > 0) rewards.dust = rewardDust;
    if (rewardShards > 0) rewards.darkShards = rewardShards;
    if (rewardSovereigns > 0) rewards.bloodSovereigns = rewardSovereigns;

    try {
      const res = await broadcastAdminMail(
        broadcastTarget,
        broadcastTargetValue,
        broadcastTitle,
        broadcastContent,
        Object.keys(rewards).length > 0 ? rewards : undefined
      );

      if (res.success) {
        setBroadcastResult(`✅ ${res.message || 'Decree successfully broadcasted!'}`);
        setBroadcastTitle('');
        setBroadcastContent('');
        setRewardGold(0);
        setRewardDust(0);
        setRewardShards(0);
        setRewardSovereigns(0);
      } else {
        setBroadcastResult(`❌ ${res.message || 'Broadcast failed'}`);
      }
    } catch (e: any) {
      setBroadcastResult(`❌ ${e.message || 'Error sending decree'}`);
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleSearchPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    loadAllPlayers(searchQuery.trim());
  };

  const selectPlayerForEdit = (match: any) => {
    setSelectedPlayer(match);
    const p = match.profile || {};
    setEditGold(p.gold || 0);
    setEditDust(p.dust || 0);
    setEditShards(p.darkShards || 0);
    setEditSovereigns(p.bloodSovereigns || 0);
    setEditLeague(getNormalizedLeague(p.pvpLeague || p.league || 'Bronze'));
    setEditLP(p.pvpLP !== undefined ? p.pvpLP : 0);
    setPlayerModifyFeedback(null);
  };

  const handleSavePlayerModifications = async () => {
    if (!selectedPlayer) return;
    setIsModifyingPlayer(true);
    setPlayerModifyFeedback(null);
    try {
      const res = await modifyAdminPlayer(selectedPlayer.walletAddress, {
        gold: editGold,
        dust: editDust,
        darkShards: editShards,
        bloodSovereigns: editSovereigns,
        pvpLeague: editLeague,
        pvpLP: editLP
      });

      if (res.success) {
        setPlayerModifyFeedback('✅ Player resources & league updated in database!');
        setSelectedPlayer({
          ...selectedPlayer,
          profile: res.profile
        });
        // Also update in allPlayers list
        setAllPlayers(prev => prev.map(pl => pl.walletAddress === selectedPlayer.walletAddress ? { ...pl, profile: res.profile } : pl));
      } else {
        setPlayerModifyFeedback(`❌ ${res.message || 'Update failed'}`);
      }
    } catch (e: any) {
      setPlayerModifyFeedback(`❌ ${e.message || 'Error updating player'}`);
    } finally {
      setIsModifyingPlayer(false);
    }
  };

  const handleTriggerRollover = async () => {
    if (!window.confirm('Are you sure you want to force-run the daily PvP season rollover right now? This will promote/demote players and send reward decrees.')) {
      return;
    }
    setIsTriggeringRollover(true);
    setRolloverFeedback(null);
    try {
      const res = await triggerAdminRollover();
      if (res.success) {
        setRolloverFeedback(`✅ ${res.message || 'Rollover executed successfully!'}`);
      } else {
        setRolloverFeedback(`❌ ${res.message || 'Rollover failed'}`);
      }
    } catch (e: any) {
      setRolloverFeedback(`❌ ${e.message || 'Error executing rollover'}`);
    } finally {
      setIsTriggeringRollover(false);
    }
  };

  if (!isOpen) return null;

  const filteredWithdrawals = withdrawals.filter(r => {
    if (withdrawalFilter !== 'all' && r.status !== withdrawalFilter) return false;
    if (withdrawalSearch) {
      const s = withdrawalSearch.toLowerCase();
      const matchWallet = (r.walletAddress || '').toLowerCase().includes(s);
      const matchUser = (r.username || r.userProfileName || '').toLowerCase().includes(s);
      const matchId = (r.id || '').toLowerCase().includes(s);
      return matchWallet || matchUser || matchId;
    }
    return true;
  });

  return (
    <div 
      className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-6xl bg-gradient-to-b from-[#140810] via-[#0d0408] to-[#080204] border-2 border-red-500/40 rounded-3xl shadow-[0_0_60px_rgba(220,38,38,0.3)] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-red-900/40 bg-black/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600/30 to-amber-500/20 border border-red-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.4)]">
              <ShieldAlert className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-black text-xl text-white tracking-widest text-shadow-crimson">
                  VOID COMMAND • ADMIN PANEL
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-red-950/80 border border-red-500/60 text-red-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                  MASTER ACCESS
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-mono">Real-time economy oversight, treasury payouts & player governance</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (activeTab === 'overview') loadOverview();
                if (activeTab === 'withdrawals') loadWithdrawals();
              }}
              disabled={isLoading}
              className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-black/40 border-b border-white/5 overflow-x-auto select-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-display font-bold text-xs tracking-wider transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-red-900/60 to-amber-900/40 text-amber-300 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>OVERVIEW & ECONOMY</span>
          </button>

          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-display font-bold text-xs tracking-wider transition-all cursor-pointer relative ${
              activeTab === 'withdrawals'
                ? 'bg-gradient-to-r from-red-900/60 to-amber-900/40 text-amber-300 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span>USDT WITHDRAWALS</span>
            {overview?.pendingWithdrawalsCount > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white font-mono text-[9px] font-black flex items-center justify-center animate-pulse">
                {overview.pendingWithdrawalsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('broadcast')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-display font-bold text-xs tracking-wider transition-all cursor-pointer ${
              activeTab === 'broadcast'
                ? 'bg-gradient-to-r from-red-900/60 to-amber-900/40 text-amber-300 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>MAIL BROADCASTER</span>
          </button>

          <button
            onClick={() => setActiveTab('players')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-display font-bold text-xs tracking-wider transition-all cursor-pointer ${
              activeTab === 'players'
                ? 'bg-gradient-to-r from-red-900/60 to-amber-900/40 text-amber-300 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>PLAYER INSPECTOR</span>
          </button>

          <button
            onClick={() => setActiveTab('maintenance')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-display font-bold text-xs tracking-wider transition-all cursor-pointer ${
              activeTab === 'maintenance'
                ? 'bg-gradient-to-r from-red-900/60 to-amber-900/40 text-amber-300 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>MAINTENANCE</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: OVERVIEW & ECONOMY */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Card 1: Total Players */}
                <div className="bg-gradient-to-b from-white/5 to-black/60 border border-white/10 p-4 rounded-2xl relative overflow-hidden">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 block mb-1">Total Registered</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-mono font-black text-white">{overview?.totalPlayers || 0}</span>
                    <Users className="w-6 h-6 text-gray-500" />
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-[11px] font-mono text-gray-400 border-t border-white/5 pt-2">
                    <span className="text-emerald-400 font-bold">{overview?.active24h || 0} active 24h</span>
                    <span>•</span>
                    <span>{overview?.active7d || 0} active 7d</span>
                  </div>
                </div>

                {/* Card 2: Sovereigns Circulation & USDT Reserve */}
                <div className="bg-gradient-to-b from-amber-950/30 to-black/60 border border-amber-500/30 p-4 rounded-2xl relative overflow-hidden">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400/90 block mb-1">Sovereigns in Circulation</span>
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-center gap-2">
                      <img src="/icons/icon_sovereign.webp" alt="SOV" className="w-6 h-6 object-contain" />
                      <span className="text-3xl font-mono font-black text-amber-300">{overview?.totalSovereigns || 0}</span>
                    </div>
                    <Crown className="w-6 h-6 text-amber-500/50" />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] font-mono border-t border-amber-500/20 pt-2">
                    <span className="text-gray-400">Reserve Needed:</span>
                    <span className="text-emerald-400 font-black">${overview?.usdtObligations || '0.00'} USDT</span>
                  </div>
                </div>

                {/* Card 3: Pending Withdrawals */}
                <div className="bg-gradient-to-b from-rose-950/30 to-black/60 border border-rose-500/30 p-4 rounded-2xl relative overflow-hidden">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400/90 block mb-1">Pending Payouts</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-mono font-black text-rose-400">{overview?.pendingWithdrawalsCount || 0}</span>
                    <Clock className="w-6 h-6 text-rose-500/50" />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] font-mono border-t border-rose-500/20 pt-2">
                    <span className="text-gray-400">Total Pending:</span>
                    <span className="text-rose-300 font-black">${overview?.pendingWithdrawalsUsdt || '0.00'} USDT</span>
                  </div>
                </div>

                {/* Card 4: Total Completed Payouts */}
                <div className="bg-gradient-to-b from-emerald-950/30 to-black/60 border border-emerald-500/30 p-4 rounded-2xl relative overflow-hidden">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400/90 block mb-1">Completed Payouts</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-mono font-black text-emerald-400">{overview?.completedWithdrawalsCount || 0}</span>
                    <CheckCircle2 className="w-6 h-6 text-emerald-500/50" />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] font-mono border-t border-emerald-500/20 pt-2">
                    <span className="text-gray-400">Total Paid:</span>
                    <span className="text-emerald-300 font-black">${overview?.completedWithdrawalsUsdt || '0.00'} USDT</span>
                  </div>
                </div>

              </div>

              {/* Economy Reserves & Currencies Bar */}
              <div className="bg-black/50 border border-white/10 rounded-3xl p-6 space-y-4">
                <h3 className="font-display font-bold text-white text-base tracking-wider uppercase flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-400" />
                  TOTAL CURRENCY SUPPLY IN REALMS
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Gold */}
                  <div className="bg-white/5 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-3">
                    <img src="/icons/icon_gold.webp" alt="Gold" className="w-8 h-8 object-contain" />
                    <div>
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">Total Gold</span>
                      <span className="font-mono font-black text-xl text-amber-300">{overview?.totalGold?.toLocaleString() || 0}</span>
                    </div>
                  </div>

                  {/* Dust */}
                  <div className="bg-white/5 border border-cyan-500/20 p-4 rounded-2xl flex items-center gap-3">
                    <img src="/icons/icon_dust.webp" alt="Dust" className="w-8 h-8 object-contain" />
                    <div>
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">Total Void Dust</span>
                      <span className="font-mono font-black text-xl text-[#66fcf1]">{overview?.totalDust?.toLocaleString() || 0}</span>
                    </div>
                  </div>

                  {/* Shards */}
                  <div className="bg-white/5 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3">
                    <img src="/icons/icon_shards.webp" alt="Shards" className="w-8 h-8 object-contain" />
                    <div>
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">Total Dark Shards</span>
                      <span className="font-mono font-black text-xl text-rose-400">{overview?.totalShards?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PvP League Distribution */}
              <div className="bg-black/50 border border-white/10 rounded-3xl p-6 space-y-4">
                <h3 className="font-display font-bold text-white text-base tracking-wider uppercase flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  PVP LEAGUE POPULATION DISTRIBUTION
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Void Overlord'].map(league => {
                    const count = overview?.leagueDistribution?.[league] || 0;
                    const total = overview?.totalPlayers || 1;
                    const pct = Math.round((count / total) * 100);

                    return (
                      <div key={league} className="bg-white/5 border border-white/10 p-3 rounded-2xl text-center space-y-1">
                        <span className="font-display font-bold text-xs text-amber-200/90 tracking-wide uppercase block">
                          {league}
                        </span>
                        <span className="font-mono font-black text-xl text-white block">
                          {count}
                        </span>
                        <div className="w-full bg-black/60 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-amber-400 h-full rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[10px] font-mono text-gray-400 block">{pct}% of realm</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USDT WITHDRAWALS MANAGEMENT */}
          {activeTab === 'withdrawals' && (
            <div className="space-y-4">
              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  {(['all', 'pending', 'completed', 'rejected'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setWithdrawalFilter(f)}
                      className={`px-3.5 py-1.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                        withdrawalFilter === f
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                          : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      {f} ({withdrawals.filter(r => f === 'all' ? true : r.status === f).length})
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={withdrawalSearch}
                    onChange={(e) => setWithdrawalSearch(e.target.value)}
                    placeholder="Search by wallet, name, ID..."
                    className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Withdrawals Table */}
              <div className="bg-black/50 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-white/5 border-b border-white/10 text-gray-400 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-4">Request / Player</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Destination Wallet</th>
                        <th className="p-4">Created Date</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredWithdrawals.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-gray-500 font-mono">
                            No withdrawal requests found for the selected filter.
                          </td>
                        </tr>
                      ) : (
                        filteredWithdrawals.map(r => (
                          <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-white text-xs">{r.username || r.userProfileName || 'Voidwalker'}</span>
                                <span className="text-[10px] text-gray-500 font-mono">ID: {r.id}</span>
                              </div>
                            </td>

                            <td className="p-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-emerald-400 text-sm">${r.amountUsdt} USDT</span>
                                <span className="text-[10px] text-amber-300 font-mono">({r.amountSovereigns} SOV)</span>
                              </div>
                            </td>

                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-300 font-mono text-xs">{r.walletAddress?.slice(0, 6)}...{r.walletAddress?.slice(-6)}</span>
                                <button
                                  onClick={() => handleCopy(r.walletAddress)}
                                  className="p-1 text-gray-500 hover:text-white rounded transition-colors"
                                  title="Copy Solana Address"
                                >
                                  {copiedAddress === r.walletAddress ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <a
                                  href={`https://solscan.io/account/${r.walletAddress}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1 text-gray-500 hover:text-cyan-400 rounded transition-colors"
                                  title="View on Solscan"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </td>

                            <td className="p-4 text-gray-400">
                              {new Date(r.createdAt || Date.now()).toLocaleString()}
                            </td>

                            <td className="p-4">
                              {r.status === 'pending' && (
                                <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold text-[10px] uppercase">
                                  ⏳ Pending
                                </span>
                              )}
                              {r.status === 'completed' && (
                                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-bold text-[10px] uppercase">
                                  ✅ Paid
                                </span>
                              )}
                              {r.status === 'rejected' && (
                                <span className="px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/50 text-red-400 font-bold text-[10px] uppercase">
                                  ❌ Declined
                                </span>
                              )}
                            </td>

                            <td className="p-4 text-right">
                              {r.status === 'pending' ? (
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => {
                                      setSelectedReq({ ...r, actionType: 'approve' });
                                      setTxidInput('');
                                      setActionFeedback(null);
                                    }}
                                    className="px-3 py-1 bg-emerald-600/80 hover:bg-emerald-500 text-white font-display font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                                  >
                                    Approve & Pay
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedReq({ ...r, actionType: 'reject' });
                                      setRejectReasonInput('');
                                      setActionFeedback(null);
                                    }}
                                    className="px-3 py-1 bg-red-600/80 hover:bg-red-500 text-white font-display font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                                  >
                                    Decline
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[10px] text-gray-500 font-mono">Processed</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MAIL & REWARDS BROADCASTER */}
          {activeTab === 'broadcast' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="text-center space-y-1">
                <h3 className="font-display font-black text-xl text-white tracking-widest text-shadow-gold flex items-center justify-center gap-2">
                  <Mail className="w-6 h-6 text-amber-400" />
                  HIGH VOID IMPERIAL DECREE
                </h3>
                <p className="text-xs text-gray-400 font-mono">Send official announcements and attach in-game rewards directly to player mailboxes</p>
              </div>

              {broadcastResult && (
                <div className="p-4 rounded-2xl bg-black/60 border border-white/20 text-center font-mono text-sm font-bold">
                  {broadcastResult}
                </div>
              )}

              <form onSubmit={handleSendBroadcast} className="bg-black/50 border border-white/10 rounded-3xl p-6 space-y-5 shadow-2xl">
                
                {/* Target Audience */}
                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider block">
                    1. Target Audience
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'all', label: 'All Players' },
                      { id: 'league', label: 'Specific League' },
                      { id: 'player', label: 'Single Player' }
                    ].map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setBroadcastTarget(t.id as any)}
                        className={`p-3 rounded-2xl font-display font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                          broadcastTarget === t.id
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                            : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {broadcastTarget === 'league' && (
                    <select
                      value={broadcastTargetValue}
                      onChange={(e) => setBroadcastTargetValue(e.target.value)}
                      className="w-full bg-black/70 border border-white/15 rounded-xl px-4 py-2.5 text-xs font-mono text-white mt-2"
                    >
                      <option value="">Select Target League...</option>
                      <option value="Bronze">Bronze League</option>
                      <option value="Silver">Silver League</option>
                      <option value="Gold">Gold League</option>
                      <option value="Platinum">Platinum League</option>
                      <option value="Diamond">Diamond League</option>
                      <option value="Void Overlord">Void Overlord League (Grandmaster)</option>
                    </select>
                  )}

                  {broadcastTarget === 'player' && (
                    <input
                      type="text"
                      value={broadcastTargetValue}
                      onChange={(e) => setBroadcastTargetValue(e.target.value)}
                      placeholder="Enter target Username or Solana Wallet Address..."
                      className="w-full bg-black/70 border border-white/15 rounded-xl px-4 py-2.5 text-xs font-mono text-white mt-2 placeholder-gray-500"
                    />
                  )}
                </div>

                {/* Decree Content */}
                <div className="space-y-3 border-t border-white/10 pt-4">
                  <label className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider block">
                    2. Message Content
                  </label>
                  
                  <input
                    type="text"
                    required
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    placeholder="Decree Title (e.g. 'Server Maintenance Gift' or 'Season 1 Grand Payout')"
                    className="w-full bg-black/70 border border-white/15 rounded-xl px-4 py-2.5 text-sm font-display font-bold text-white placeholder-gray-500"
                  />

                  <textarea
                    required
                    rows={4}
                    value={broadcastContent}
                    onChange={(e) => setBroadcastContent(e.target.value)}
                    placeholder="Write the decree message body here..."
                    className="w-full bg-black/70 border border-white/15 rounded-xl p-4 text-xs font-sans text-gray-200 placeholder-gray-500 leading-relaxed"
                  />
                </div>

                {/* Attached Tributes & Rewards */}
                <div className="space-y-3 border-t border-white/10 pt-4">
                  <label className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    3. Attach Rewards (Optional)
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Gold */}
                    <div className="bg-white/5 border border-amber-500/20 p-3 rounded-2xl space-y-1">
                      <div className="flex items-center gap-1.5">
                        <img src="/icons/icon_gold.webp" alt="Gold" className="w-5 h-5 object-contain" />
                        <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">Gold</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={rewardGold || ''}
                        onChange={(e) => setRewardGold(parseInt(e.target.value, 10) || 0)}
                        placeholder="0"
                        className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-sm font-mono font-bold text-amber-300"
                      />
                    </div>

                    {/* Dust */}
                    <div className="bg-white/5 border border-cyan-500/20 p-3 rounded-2xl space-y-1">
                      <div className="flex items-center gap-1.5">
                        <img src="/icons/icon_dust.webp" alt="Dust" className="w-5 h-5 object-contain" />
                        <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">Dust</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={rewardDust || ''}
                        onChange={(e) => setRewardDust(parseInt(e.target.value, 10) || 0)}
                        placeholder="0"
                        className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-sm font-mono font-bold text-[#66fcf1]"
                      />
                    </div>

                    {/* Shards */}
                    <div className="bg-white/5 border border-red-500/20 p-3 rounded-2xl space-y-1">
                      <div className="flex items-center gap-1.5">
                        <img src="/icons/icon_shards.webp" alt="Shards" className="w-5 h-5 object-contain" />
                        <span className="text-[10px] font-mono text-red-400 font-bold uppercase">Shards</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={rewardShards || ''}
                        onChange={(e) => setRewardShards(parseInt(e.target.value, 10) || 0)}
                        placeholder="0"
                        className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-sm font-mono font-bold text-rose-400"
                      />
                    </div>

                    {/* Sovereigns */}
                    <div className="bg-white/5 border border-amber-500/40 p-3 rounded-2xl space-y-1">
                      <div className="flex items-center gap-1.5">
                        <img src="/icons/icon_sovereign.webp" alt="SOV" className="w-5 h-5 object-contain" />
                        <span className="text-[10px] font-mono text-amber-300 font-bold uppercase">Sovereigns</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={rewardSovereigns || ''}
                        onChange={(e) => setRewardSovereigns(parseInt(e.target.value, 10) || 0)}
                        placeholder="0"
                        className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-sm font-mono font-bold text-amber-200"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isBroadcasting}
                    className="w-full py-4 bg-gradient-to-r from-red-600 via-amber-600 to-red-600 hover:from-red-500 hover:to-amber-500 text-white font-display font-black text-sm tracking-widest uppercase rounded-2xl shadow-[0_0_25px_rgba(220,38,38,0.4)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                    <span>{isBroadcasting ? 'TRANSMITTING DECREE...' : 'DISPATCH IMPERIAL DECREE'}</span>
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* TAB 4: PLAYER INSPECTOR */}
          {activeTab === 'players' && (
            <div className="space-y-6">
              
              {!selectedPlayer ? (
                <div className="space-y-4">
                  {/* Search, Filter, and Sort Controls */}
                  <div className="flex flex-col lg:flex-row items-center justify-between gap-3 bg-black/40 p-4 rounded-3xl border border-white/10">
                    
                    {/* Search Input */}
                    <form onSubmit={handleSearchPlayer} className="relative w-full lg:w-80">
                      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by username or wallet..."
                        className="w-full bg-black/60 border border-white/15 rounded-2xl pl-10 pr-10 py-2.5 text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/60"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            loadAllPlayers('');
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </form>

                    {/* League Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 select-none">
                      {['all', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Void Overlord'].map(l => (
                        <button
                          key={l}
                          onClick={() => setPlayerLeagueFilter(l)}
                          className={`px-3 py-1.5 rounded-xl font-display font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                            playerLeagueFilter === l
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                              : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
                          }`}
                        >
                          {l === 'all' ? 'All Leagues' : l}
                        </button>
                      ))}
                    </div>

                    {/* Sorting Selector */}
                    <div className="flex items-center gap-2 w-full lg:w-auto">
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest whitespace-nowrap">Sort by:</span>
                      <select
                        value={playerSortBy}
                        onChange={(e) => setPlayerSortBy(e.target.value as any)}
                        className="bg-black/70 border border-white/15 rounded-xl px-3 py-2 text-xs font-mono text-amber-300 font-bold focus:outline-none focus:border-amber-500"
                      >
                        <option value="active">Last Active</option>
                        <option value="level">Highest Level</option>
                        <option value="sovereigns">Most Sovereigns</option>
                        <option value="gold">Most Gold</option>
                        <option value="lp">Highest PvP LP</option>
                      </select>
                    </div>

                  </div>

                  {/* Players Directory Table */}
                  <div className="bg-black/50 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="px-6 py-3 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase tracking-widest text-gray-400 font-bold">
                        Registered Players Directory ({allPlayers.filter(p => {
                          const l = getNormalizedLeague(p.profile?.pvpLeague || p.profile?.league);
                          if (playerLeagueFilter !== 'all' && l.toLowerCase() !== getNormalizedLeague(playerLeagueFilter).toLowerCase()) return false;
                          if (searchQuery.trim()) {
                            const s = searchQuery.trim().toLowerCase();
                            const w = (p.walletAddress || '').toLowerCase();
                            const u = (p.profile?.username || '').toLowerCase();
                            return w.includes(s) || u.includes(s);
                          }
                          return true;
                        }).length})
                      </span>
                      <button
                        onClick={() => loadAllPlayers(searchQuery)}
                        disabled={isLoading}
                        className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                        <span>Refresh List</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-white/5 border-b border-white/10 text-gray-400 uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="p-4">Player / Account</th>
                            <th className="p-4">Level & Progress</th>
                            <th className="p-4">PvP League</th>
                            <th className="p-4">Vault Balances</th>
                            <th className="p-4">Last Activity</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {allPlayers.filter(p => {
                            const l = getNormalizedLeague(p.profile?.pvpLeague || p.profile?.league);
                            if (playerLeagueFilter !== 'all' && l.toLowerCase() !== getNormalizedLeague(playerLeagueFilter).toLowerCase()) return false;
                            if (searchQuery.trim()) {
                              const s = searchQuery.trim().toLowerCase();
                              const w = (p.walletAddress || '').toLowerCase();
                              const u = (p.profile?.username || '').toLowerCase();
                              return w.includes(s) || u.includes(s);
                            }
                            return true;
                          }).length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-gray-500 font-mono">
                                No players found matching your criteria.
                              </td>
                            </tr>
                          ) : (
                            allPlayers
                              .filter(p => {
                                const l = getNormalizedLeague(p.profile?.pvpLeague || p.profile?.league);
                                if (playerLeagueFilter !== 'all' && l.toLowerCase() !== getNormalizedLeague(playerLeagueFilter).toLowerCase()) return false;
                                if (searchQuery.trim()) {
                                  const s = searchQuery.trim().toLowerCase();
                                  const w = (p.walletAddress || '').toLowerCase();
                                  const u = (p.profile?.username || '').toLowerCase();
                                  return w.includes(s) || u.includes(s);
                                }
                                return true;
                              })
                              .sort((a, b) => {
                                const pa = a.profile || {};
                                const pb = b.profile || {};
                                if (playerSortBy === 'level') return (pb.level || 1) - (pa.level || 1);
                                if (playerSortBy === 'sovereigns') return (pb.bloodSovereigns || 0) - (pa.bloodSovereigns || 0);
                                if (playerSortBy === 'gold') return (pb.gold || 0) - (pa.gold || 0);
                                if (playerSortBy === 'lp') return (pb.pvpLP || 0) - (pa.pvpLP || 0);
                                const timeA = pa.lastLogin || (a.updatedAt ? new Date(a.updatedAt).getTime() : 0);
                                const timeB = pb.lastLogin || (b.updatedAt ? new Date(b.updatedAt).getTime() : 0);
                                return timeB - timeA;
                              })
                              .map((p) => {
                                const prof = p.profile || {};
                                const isUserAdmin = prof.username?.toLowerCase() === 'adminus' || prof.role === 'admin';
                                const lastAct = prof.lastLogin || (p.updatedAt ? new Date(p.updatedAt).getTime() : 0);
                                const leagueStyle = getLeagueBadgeStyle(prof.pvpLeague || prof.league);

                                return (
                                  <tr key={p.walletAddress} className="hover:bg-white/[0.02] transition-colors">
                                    {/* Player */}
                                    <td className="p-4">
                                      <div className="flex items-center gap-3">
                                        <div className="relative">
                                          {prof.avatarUrl ? (
                                            <img src={prof.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full border border-white/20 object-cover shadow-sm" />
                                          ) : (
                                            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-display font-black text-amber-300">
                                              {(prof.username || 'V')[0].toUpperCase()}
                                            </div>
                                          )}
                                          {isUserAdmin && (
                                            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center text-[8px] font-black text-white" title="Administrator">
                                              ★
                                            </span>
                                          )}
                                        </div>

                                        <div>
                                          <div className="flex items-center gap-2">
                                            <span className="font-display font-bold text-white text-sm">
                                              {prof.username || 'Voidwalker'}
                                            </span>
                                            {isUserAdmin && (
                                              <span className="px-1.5 py-0.2 rounded bg-red-950/80 border border-red-500/60 text-red-400 font-mono text-[9px] font-bold">
                                                ADMIN
                                              </span>
                                            )}
                                          </div>
                                          
                                          <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-[10px] text-gray-500 font-mono">
                                              {p.walletAddress?.slice(0, 6)}...{p.walletAddress?.slice(-6)}
                                            </span>
                                            <button
                                              onClick={() => handleCopy(p.walletAddress)}
                                              className="p-0.5 text-gray-500 hover:text-white rounded"
                                              title="Copy Address"
                                            >
                                              {copiedAddress === p.walletAddress ? (
                                                <Check className="w-3 h-3 text-emerald-400" />
                                              ) : (
                                                <Copy className="w-3 h-3" />
                                              )}
                                            </button>
                                            <a
                                              href={`https://solscan.io/account/${p.walletAddress}`}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="p-0.5 text-gray-500 hover:text-cyan-400 rounded"
                                              title="View on Solscan"
                                            >
                                              <ExternalLink className="w-3 h-3" />
                                            </a>
                                          </div>
                                        </div>
                                      </div>
                                    </td>

                                    {/* Level & Progress */}
                                    <td className="p-4">
                                      <div className="flex flex-col gap-0.5">
                                        <span className="font-mono font-bold text-amber-300 text-xs">
                                          LVL {prof.level || 1}
                                        </span>
                                        <span className="text-[10px] text-gray-500">
                                          EXP: {prof.exp || 0}
                                        </span>
                                      </div>
                                    </td>

                                    {/* PvP League */}
                                    <td className="p-4">
                                      <div className="flex items-center gap-1.5">
                                        <span className={`px-2.5 py-1 rounded-lg font-display font-bold text-[11px] uppercase tracking-wider ${leagueStyle.className}`}>
                                          {leagueStyle.badge}
                                        </span>
                                        <span className="text-[10px] text-cyan-400 font-mono font-bold">
                                          {prof.pvpLP || 0} LP
                                        </span>
                                      </div>
                                    </td>

                                    {/* Vault Balances */}
                                    <td className="p-4">
                                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs font-mono">
                                        <div className="flex items-center gap-1">
                                          <img src="/icons/icon_gold.webp" alt="Gold" className="w-4 h-4 object-contain" />
                                          <span className="text-amber-400 font-bold">{(prof.gold || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <img src="/icons/icon_dust.webp" alt="Dust" className="w-4 h-4 object-contain" />
                                          <span className="text-[#66fcf1] font-bold">{(prof.dust || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain" />
                                          <span className="text-rose-400 font-bold">{(prof.darkShards || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <img src="/icons/icon_sovereign.webp" alt="SOV" className="w-4 h-4 object-contain" />
                                          <span className="text-amber-300 font-black">{(prof.bloodSovereigns || 0).toLocaleString()}</span>
                                        </div>
                                      </div>
                                    </td>

                                    {/* Last Activity */}
                                    <td className="p-4">
                                      <span className="text-[10px] text-gray-400 block font-mono">
                                        {lastAct > 0 ? new Date(lastAct).toLocaleString() : 'N/A'}
                                      </span>
                                    </td>

                                    {/* Actions */}
                                    <td className="p-4 text-right">
                                      <button
                                        onClick={() => selectPlayerForEdit(p)}
                                        className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-display font-black text-[11px] uppercase tracking-wider rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.25)]"
                                      >
                                        INSPECT
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                /* Selected Player Detailed Editor */
                <div className="bg-black/50 border border-white/10 rounded-3xl p-6 space-y-6 max-w-3xl mx-auto shadow-2xl">
                  <div className="flex items-start justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-4">
                      {selectedPlayer.profile?.avatarUrl ? (
                        <img src={selectedPlayer.profile.avatarUrl} alt="Avatar" className="w-14 h-14 rounded-full border-2 border-amber-500/50 object-cover shadow-[0_0_15px_rgba(245,158,11,0.3)]" />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-white/5 border-2 border-amber-500/50 flex items-center justify-center font-display font-black text-amber-300 text-xl">
                          {(selectedPlayer.profile?.username || 'V')[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="font-display font-black text-xl text-white tracking-wide">{selectedPlayer.profile?.username || 'Voidwalker'}</h3>
                        <p className="font-mono text-xs text-gray-400 break-all mt-0.5">{selectedPlayer.walletAddress}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs font-mono text-gray-300">
                          <span>Level: <strong className="text-amber-400">{selectedPlayer.profile?.level || 1}</strong></span>
                          <span>•</span>
                          <span>League: <strong className="text-emerald-400">{getNormalizedLeague(selectedPlayer.profile?.pvpLeague || selectedPlayer.profile?.league)}</strong></span>
                          <span>•</span>
                          <span>LP: <strong className="text-cyan-400">{selectedPlayer.profile?.pvpLP || 0}</strong></span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedPlayer(null)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-display font-bold text-xs rounded-xl cursor-pointer transition-all"
                    >
                      ← Back to Player List
                    </button>
                  </div>

                  {playerModifyFeedback && (
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 font-mono text-xs text-center font-bold">
                      {playerModifyFeedback}
                    </div>
                  )}

                  {/* Resource Modification Controls */}
                  <div className="space-y-4">
                    <h4 className="font-display font-bold text-xs text-amber-300 uppercase tracking-wider">
                      MODIFY VAULT & CURRENCY BALANCES
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-amber-400 uppercase font-bold">Gold</label>
                        <input
                          type="number"
                          value={editGold}
                          onChange={(e) => setEditGold(parseInt(e.target.value, 10) || 0)}
                          className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-sm font-mono font-bold text-amber-300"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-cyan-400 uppercase font-bold">Void Dust</label>
                        <input
                          type="number"
                          value={editDust}
                          onChange={(e) => setEditDust(parseInt(e.target.value, 10) || 0)}
                          className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-sm font-mono font-bold text-[#66fcf1]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-red-400 uppercase font-bold">Dark Shards</label>
                        <input
                          type="number"
                          value={editShards}
                          onChange={(e) => setEditShards(parseInt(e.target.value, 10) || 0)}
                          className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-sm font-mono font-bold text-rose-400"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-amber-300 uppercase font-bold">Sovereigns</label>
                        <input
                          type="number"
                          value={editSovereigns}
                          onChange={(e) => setEditSovereigns(parseInt(e.target.value, 10) || 0)}
                          className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-sm font-mono font-bold text-amber-200"
                        />
                      </div>
                    </div>

                    {/* PvP League & LP Adjustments */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/10 pt-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-purple-400 uppercase font-bold">PvP League Tier</label>
                        <select
                          value={editLeague}
                          onChange={(e) => setEditLeague(e.target.value)}
                          className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-sm font-mono font-bold text-purple-300"
                        >
                          <option value="Bronze">🥉 Bronze League</option>
                          <option value="Silver">🥈 Silver League</option>
                          <option value="Gold">🥇 Gold League</option>
                          <option value="Platinum">🔮 Platinum League</option>
                          <option value="Diamond">💎 Diamond League</option>
                          <option value="Void Overlord">👑 Void Overlord League</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-cyan-400 uppercase font-bold">League Points (LP)</label>
                        <input
                          type="number"
                          value={editLP}
                          onChange={(e) => setEditLP(parseInt(e.target.value, 10) || 0)}
                          className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-sm font-mono font-bold text-cyan-300"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={handleSavePlayerModifications}
                        disabled={isModifyingPlayer}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-black font-display font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
                      >
                        {isModifyingPlayer ? 'SAVING...' : 'SAVE MODIFICATIONS'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 5: MAINTENANCE */}
          {activeTab === 'maintenance' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-black/50 border border-white/10 rounded-3xl p-6 space-y-4">
                <h3 className="font-display font-bold text-white text-base tracking-wider uppercase flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  PVP SEASON ROLLOVER TRIGGER
                </h3>
                <p className="text-xs text-gray-400 font-sans leading-relaxed">
                  Forces an immediate execution of the daily PvP league rollover. Computes top/bottom player standings, executes promotions and demotions, and sends reward letters with Blood Sovereigns and Gold to all participants.
                </p>

                {rolloverFeedback && (
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 font-mono text-xs font-bold text-center">
                    {rolloverFeedback}
                  </div>
                )}

                <button
                  onClick={handleTriggerRollover}
                  disabled={isTriggeringRollover}
                  className="px-6 py-3.5 bg-gradient-to-r from-red-700 via-rose-600 to-red-700 hover:from-red-600 hover:to-rose-500 text-white font-display font-black text-xs tracking-widest uppercase rounded-xl transition-all cursor-pointer shadow-[0_0_20px_rgba(220,38,38,0.4)] disabled:opacity-50"
                >
                  {isTriggeringRollover ? 'EXECUTING ROLLOVER...' : '⚡ FORCE PVP SEASON ROLLOVER NOW'}
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* APPROVAL / REJECTION ACTION DIALOG */}
      {selectedReq && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#180a10] border-2 border-amber-500/50 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="font-display font-black text-base text-white tracking-wider">
                {selectedReq.actionType === 'approve' ? 'APPROVE USDT PAYOUT' : 'REJECT & REFUND REQUEST'}
              </h4>
              <button onClick={() => setSelectedReq(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-black/50 p-3.5 rounded-2xl space-y-1.5 font-mono text-xs border border-white/5">
              <div className="flex justify-between">
                <span className="text-gray-400">Player:</span>
                <span className="text-white font-bold">{selectedReq.username || selectedReq.userProfileName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Payout Amount:</span>
                <span className="text-emerald-400 font-bold">${selectedReq.amountUsdt} USDT ({selectedReq.amountSovereigns} SOV)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Destination Wallet:</span>
                <span className="text-amber-300 font-bold break-all">{selectedReq.walletAddress}</span>
              </div>
            </div>

            {actionFeedback && (
              <div className={`p-3 rounded-xl font-mono text-xs text-center font-bold ${actionFeedback.type === 'success' ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-300' : 'bg-rose-950/60 border border-rose-500/50 text-rose-300'}`}>
                {actionFeedback.message}
              </div>
            )}

            {selectedReq.actionType === 'approve' ? (
              <div className="space-y-3">
                <label className="text-xs font-mono text-gray-300 uppercase font-bold block">
                  Solana On-Chain Transaction Hash (TXID):
                </label>
                <input
                  type="text"
                  value={txidInput}
                  onChange={(e) => setTxidInput(e.target.value)}
                  placeholder="Paste Solscan tx hash or manual confirmation note..."
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleApprove}
                  disabled={isProcessingAction}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-black font-display font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.4)] disabled:opacity-50"
                >
                  {isProcessingAction ? 'PROCESSING...' : 'CONFIRM PAYOUT & NOTIFY USER'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="text-xs font-mono text-gray-300 uppercase font-bold block">
                  Reason for Rejection (Visible to Player):
                </label>
                <textarea
                  rows={3}
                  value={rejectReasonInput}
                  onChange={(e) => setRejectReasonInput(e.target.value)}
                  placeholder="e.g. Invalid Solana wallet address / Suspicious activity..."
                  className="w-full bg-black/60 border border-white/15 rounded-xl p-3 text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
                />
                <button
                  onClick={handleReject}
                  disabled={isProcessingAction}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-display font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(225,29,72,0.4)] disabled:opacity-50"
                >
                  {isProcessingAction ? 'REFUNDING...' : 'REJECT & REFUND SOVEREIGNS'}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
