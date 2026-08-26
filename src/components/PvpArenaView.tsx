import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useToast } from './Toast';
import { CampaignStage } from '../types';
import { Swords, Award, Zap, Trophy, Shield, Search, RefreshCw, AlertTriangle, History, Crown, Timer } from 'lucide-react';

interface PvpArenaViewProps {
  onStartBattle: (stage: CampaignStage, type: 'campaign' | 'pvp', opponentPayload?: any) => Promise<boolean> | void;
  isMatching: boolean;
  setIsMatching: (val: boolean) => void;
  isModalOpen: boolean;
  setIsModalOpen: (val: boolean) => void;
}

export const PvpArenaView: React.FC<PvpArenaViewProps> = ({ 
  onStartBattle, 
  isMatching, 
  setIsMatching,
  isModalOpen,
  setIsModalOpen
}) => {
  const { profile, updateProfile, buyPvpTickets } = useGame();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'duels' | 'history'>('duels');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);
  const [matchStatus, setMatchStatus] = useState('');
  const [refreshCooldown, setRefreshCooldown] = useState(0);
  const [viewingLeague, setViewingLeague] = useState<string>(profile.pvpLeague || 'Bronze');
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isBuyTicketsModalOpen, setIsBuyTicketsModalOpen] = useState(false);



  // League calculation helper
  const getLeagueDetails = (leagueName: string) => {
    const name = leagueName || 'Bronze';
    if (name.startsWith('Bronze')) {
      return {
        name: 'Bronze',
        badge: '🥉',
        icon: '/icons/league_bronze.png',
        color: 'text-amber-600 border-amber-800 bg-amber-950/20',
        glow: 'shadow-[0_0_15px_rgba(180,83,9,0.15)]',
        accent: 'text-amber-700'
      };
    } else if (name.startsWith('Silver')) {
      return {
        name: 'Silver',
        badge: '🥈',
        icon: '/icons/league_silver.png',
        color: 'text-gray-300 border-gray-600 bg-gray-900/25',
        glow: 'shadow-[0_0_15px_rgba(209,213,219,0.15)]',
        accent: 'text-gray-400'
      };
    } else if (name.startsWith('Gold')) {
      return {
        name: 'Gold',
        badge: '🥇',
        icon: '/icons/league_gold.png',
        color: 'text-amber-400 border-amber-500/40 bg-amber-500/5',
        glow: 'shadow-[0_0_15px_rgba(245,158,11,0.2)]',
        accent: 'text-amber-500'
      };
    } else if (name.startsWith('Platinum')) {
      return {
        name: 'Platinum',
        badge: '🔮',
        icon: '/icons/league_platinum.png',
        color: 'text-indigo-400 border-indigo-500/40 bg-indigo-500/5',
        glow: 'shadow-[0_0_15px_rgba(129,140,248,0.25)]',
        accent: 'text-indigo-500'
      };
    } else if (name.startsWith('Diamond')) {
      return {
        name: 'Diamond',
        badge: '💎',
        icon: '/icons/league_diamond.png',
        color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/5',
        glow: 'shadow-[0_0_20px_rgba(34,211,238,0.3)]',
        accent: 'text-cyan-400'
      };
    } else {
      return {
        name: 'Void Overlord',
        badge: '👑',
        icon: '/icons/league_void_overlord.png',
        color: 'text-rose-500 border-rose-500/40 bg-rose-500/5',
        glow: 'shadow-[0_0_25px_rgba(244,63,94,0.4)]',
        accent: 'text-rose-500'
      };
    }
  };

  const league = getLeagueDetails(profile.pvpLeague || 'Bronze');

  const fetchLeaderboard = async (leagueName: string = profile.pvpLeague || 'Bronze', silent: boolean = false) => {
    if (!silent) setIsLoadingLeaderboard(true);
    try {
      const token = localStorage.getItem('void_covenant_token');
      if (!token) return;

      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ league: leagueName })
      });
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
      }
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  const handleFindOpponent = async (spendShards: boolean = false, spendEnergy: boolean = false) => {
    if (profile.deck.length < 10) {
      toast("Your deck is incomplete! Go to the 'CARDS' tab and select exactly 10 cards for battle.", 'warning');
      return;
    }

    if (spendEnergy) {
      if (profile.pvpEnergy < 1) {
        toast('Not enough PvP Energy!', 'warning');
        return;
      }
    }

    if (spendShards) {
      if ((profile.darkShards || 0) < 5) {
        toast('Insufficient Dark Shards for re-roll!', 'warning');
        return;
      }
    }

    setIsMatching(true);
    setMatchStatus(spendShards ? 'Deducting 5 Shards and finding new opponent...' : 'Spending 1 PvP Energy and finding opponent...');

    try {
      const token = localStorage.getItem('void_covenant_token');
      if (!token) {
        setIsMatching(false);
        return;
      }

      const res = await fetch('/api/matchmaking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ spendShards, spendEnergy })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          updateProfile(data.profile);
        }
        setIsModalOpen(true);
        if (spendShards) {
          toast('Opponent re-rolled! 5 Dark Shards deducted.', 'success');
          setRefreshCooldown(3); // 3-second cooldown on re-rolls to prevent spamming
        }
      } else {
        const data = await res.json().catch(() => ({}));
        toast(data.error || 'Failed to query matchmaking', 'error');
      }
    } catch (err) {
      console.error('Matchmaking query failed:', err);
      toast('Connection error establishing matchmaking session.', 'error');
    } finally {
      setIsMatching(false);
    }
  };

  const handleCancelMatch = async (silent: boolean = false) => {
    if (!silent) {
      setIsMatching(true);
      setMatchStatus('Forfeiting challenger connection...');
    }
    try {
      const token = localStorage.getItem('void_covenant_token');
      if (!token) return;

      const res = await fetch('/api/matchmaking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cancel: true })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          updateProfile(data.profile);
        }
        setIsModalOpen(false);
        if (!silent) {
          toast('Matchmaking canceled. PvP Energy forfeited.', 'info');
        }
      } else {
        if (!silent) toast('Failed to cancel matchmaking.', 'error');
      }
    } catch (err) {
      console.error('Matchmaking cancel failed:', err);
      if (!silent) toast('Connection error canceling matchmaking.', 'error');
    } finally {
      if (!silent) setIsMatching(false);
    }
  };

  // Cooldown countdown timer
  useEffect(() => {
    let t: NodeJS.Timeout;
    if (refreshCooldown > 0) {
      t = setTimeout(() => {
        setRefreshCooldown(c => c - 1);
      }, 1000);
    }
    return () => clearTimeout(t);
  }, [refreshCooldown]);

  // Keep leaderboard in sync when viewingLeague changes
  useEffect(() => {
    fetchLeaderboard(viewingLeague);
  }, [viewingLeague]);

  // Sync viewingLeague when player's league updates
  useEffect(() => {
    if (profile?.pvpLeague) {
      setViewingLeague(profile.pvpLeague);
    }
  }, [profile?.pvpLeague]);

  // Daily UTC midnight countdown timer
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const nextRollover = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1, // Tomorrow
        0, 0, 0, 0 // 00:00:00 UTC
      ));
      const diff = Math.max(0, Math.floor((nextRollover.getTime() - now.getTime()) / 1000));
      setTimeRemaining(diff);
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCountdown = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  // Silently clear any leftover PvP opponent when entering the Arena tab
  useEffect(() => {
    if (profile && profile.activePvpOpponent) {
      handleCancelMatch(true);
    }
  }, []);

  const cycleLeague = (dir: 'prev' | 'next') => {
    const LEAGUES = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Void Overlord'];
    const idx = LEAGUES.indexOf(viewingLeague);
    if (dir === 'prev') {
      const prevIdx = idx > 0 ? idx - 1 : LEAGUES.length - 1;
      setViewingLeague(LEAGUES[prevIdx]);
    } else {
      const nextIdx = idx < LEAGUES.length - 1 ? idx + 1 : 0;
      setViewingLeague(LEAGUES[nextIdx]);
    }
  };

  const handleFight = async (opponent: any) => {
    if (profile.deck.length < 10) {
      toast("Your deck is incomplete! Go to the 'CARDS' tab and select exactly 10 cards for battle.", 'warning');
      return;
    }

    setIsMatching(true);
    setMatchStatus(`Locking signature keys against ${opponent.name || opponent.username}...`);

    const opponentLP = opponent.lp !== undefined ? opponent.lp : (opponent.pvpLP !== undefined ? opponent.pvpLP : (opponent.rating || opponent.pvpRating || 0));

    const opponentPayload = {
      opponentWalletAddress: opponent.walletAddress,
      opponentName: opponent.name || opponent.username,
      opponentRating: opponent.rating || opponent.pvpRating,
      opponentLP: opponentLP,
      opponentDeck: opponent.deck,
      opponentStance: opponent.stance || opponent.activeStance
    };

    const pvpStage: CampaignStage = {
      id: -1, // PvP indicator
      name: `Arena: ${opponent.name || opponent.username}`,
      description: `Ranked PvP battle for Covenant glory. Opponent: ${opponent.name || opponent.username} [${opponentLP} 👑]`,
      energyCost: 1,
      goldReward: 300 + Math.floor((profile.pvpLP || 0) / 4),
      dustReward: 30 + Math.floor((profile.pvpLP || 0) / 20),
      shardsReward: 0,
      enemyHeroName: opponent.name || opponent.username,
      enemyHeroHealth: 30 + Math.min(20, Math.floor(opponentLP / 150)),
      enemyHeroImage: opponent.avatarUrl || '/avatars/knight.webp', // Pass the opponent's real avatar URL!
      enemyDeck: opponent.deck,
      enemyStance: opponent.stance || opponent.activeStance,
      enemyTalents: opponent.talents
    };

    try {
      setMatchStatus('Accessing local battlefield simulation channel...');
      const success = await onStartBattle(pvpStage, 'pvp', opponentPayload);
      setIsMatching(false); // Fix loading screen hang!
      if (success) {
        setIsModalOpen(false); // Close the modal
      }
    } catch (err) {
      setIsMatching(false);
      toast('Connection error establishing PvP session.', 'error');
    }
  };

  const getRankNumber = (walletAddr: string) => {
    const idx = leaderboard.findIndex(p => p.walletAddress === walletAddr);
    return idx !== -1 ? idx + 1 : null;
  };

  const playerRank = getRankNumber(profile.solanaAddress || '') || '?';
  const activeOpponent = profile.activePvpOpponent;

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      
      {/* Matchmaking Overlay */}
      {isMatching && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-6 space-y-6 animate-fade-in">
          <div className="w-24 h-24 rounded-full border-4 border-rose-500 border-t-transparent animate-spin flex items-center justify-center shadow-[0_0_25px_rgba(239,68,68,0.25)]">
            <Swords className="w-10 h-10 text-rose-500 animate-pulse" />
          </div>
          
          <div className="text-center space-y-2 max-w-sm">
            <h3 className="font-display font-black text-xl text-rose-500 tracking-widest uppercase animate-pulse">WAR ENCRYPTION</h3>
            <p className="text-sm font-mono text-cyan-400 font-bold">{matchStatus}</p>
          </div>
        </div>
      )}

      {/* Opponent Modal Window (Request #2) */}
      {isModalOpen && activeOpponent && (
        <div className="fixed inset-0 z-[90] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-b from-[#151a21] via-[#0b0c10] to-[#040507] border-2 border-cyan-500/35 rounded-3xl p-7 max-w-sm w-full text-center space-y-6 shadow-2xl relative overflow-hidden gothic-glow-cyan">
            
            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-500/30 pointer-events-none" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-500/30 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-500/30 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-500/30 pointer-events-none" />

            {/* Close Cross (Pre-paid loss on close) */}
            <button
              onClick={handleCancelMatch}
              className="absolute top-4 right-4 text-gray-500 hover:text-white font-sans text-lg font-black transition-colors cursor-pointer w-6 h-6 flex items-center justify-center bg-black/40 border border-white/5 rounded-full"
              title="Close and forfeit spent PvP energy"
            >
              ✕
            </button>

            <h3 className="font-display font-black text-sm text-white tracking-widest uppercase border-b border-gray-900 pb-2.5">
              CHALLENGER FOUND
            </h3>

            {/* Beautiful Opponent Card Details (Request #4) */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <img 
                  src={activeOpponent.avatarUrl || '/avatars/knight.webp'} 
                  alt="Avatar" 
                  className="w-20 h-20 rounded-full border-2 border-[#ebd09b]/50 bg-black/40 object-cover shadow-[0_0_15px_rgba(235,208,155,0.15)]" 
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center font-mono text-[9px] font-bold text-cyan-400 shadow-md">
                  Lvl{activeOpponent.level || 1}
                </div>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-white font-display font-black text-lg tracking-wide leading-none">{activeOpponent.name || activeOpponent.username}</h4>
                <span className={`px-2.5 py-0.5 border rounded-full text-[9px] font-display font-black uppercase tracking-widest leading-none inline-flex items-center gap-1 ${getLeagueDetails(activeOpponent.league || 'Bronze').color}`}>
                  <img src={getLeagueDetails(activeOpponent.league || 'Bronze').icon} alt="Crest" className="w-3 h-3 object-contain" />
                  {getLeagueDetails(activeOpponent.league || 'Bronze').name}
                </span>
              </div>

              {/* Crowns */}
              <div className="bg-black/50 border border-gray-950 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-mono font-bold text-[#ebd09b]">
                <img src="/icons/crown.png" alt="Crown" className="w-5 h-5 object-contain" />
                <span>{activeOpponent.lp !== undefined ? activeOpponent.lp : (activeOpponent.rating || 0)}</span>
              </div>

              {/* Active stance skill */}
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest font-bold block">Active Stance</span>
                <span className="px-3 py-1 bg-cyan-950/40 border border-cyan-500/20 rounded-lg text-xs font-mono font-bold text-cyan-300 uppercase tracking-wide inline-block shadow-sm">
                  {activeOpponent.stance === 'void_strike' ? 'Void Strike ⚡' : 
                   activeOpponent.stance === 'blood_aura' ? 'Blood Aura 🩸' : 
                   activeOpponent.stance === 'warlord_cry' ? "Warlord's Cry 🔊" : 'Void Strike ⚡'}
                </span>
              </div>
            </div>

            {/* Action buttons (Reroll / Fight) */}
            <div className="grid grid-cols-2 gap-3.5 pt-2 border-t border-gray-900">
              <button
                disabled={refreshCooldown > 0}
                onClick={() => handleFindOpponent(true, false)}
                className={`py-3 px-3 rounded-xl border font-display font-bold text-[10px] tracking-wider transition-all flex items-center justify-center gap-3 cursor-pointer active:scale-95 ${
                  refreshCooldown > 0
                    ? 'border-gray-850 bg-gray-900/20 text-gray-600 cursor-not-allowed'
                    : 'border-rose-950/40 bg-rose-950/10 hover:bg-rose-900/20 text-rose-300'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                <span className="mr-0.5">RE-ROLL</span>
                <span className="flex items-center gap-1 bg-black/50 border border-rose-500/25 rounded-full px-2 py-0.5 font-mono text-[11px] font-bold text-[#ebd09b] shadow-inner">
                  5
                  <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain brightness-110 drop-shadow-[0_0_4px_rgba(239,68,68,0.45)]" />
                </span>
              </button>
              
              <button
                onClick={() => handleFight(activeOpponent)}
                className="py-3 px-4 rounded-xl font-display font-black tracking-widest text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border bg-gradient-to-r from-emerald-900 to-teal-900 border-emerald-500/50 text-white hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              >
                <Swords className="w-4 h-4 shrink-0" /> FIGHT
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Main Header Banner */}
      <div className="bg-[#151a21] border border-[#c5a880]/20 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-red-950/15 via-transparent to-[#151a21] pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          
          <div className="space-y-2 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2.5">
              <Crown className="w-6 h-6 text-amber-400 animate-bounce" />
              <h2 className="font-display font-black text-xl md:text-2xl text-white tracking-widest text-shadow-gold">
                VOID ARENA
              </h2>
            </div>
            <p className="text-xs text-gray-300 font-sans max-w-xl leading-relaxed">
              Duel other summoners across the realm, climb the PvP leagues, and claim glorious victory rewards.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-3 bg-black/50 border border-[#c5a880]/20 rounded-xl p-3.5 w-full lg:w-auto shadow-lg">
            {/* Crowns */}
            <div className="text-center px-3 sm:border-r border-white/10 pb-2 sm:pb-0 min-w-[95px]">
              <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest font-bold block">CROWNS</span>
              <div className="font-mono text-xl font-black text-amber-400 flex items-center justify-center gap-1.5 mt-0.5">
                <img src="/icons/crown.png" alt="Crown" className="w-5 h-5 object-contain" />
                {profile.pvpLP || 0}
              </div>
            </div>

            {/* Arena Tickets (Prominent counter + Buy button) */}
            <div className="text-center px-3 sm:border-r border-white/10 pb-2 sm:pb-0 min-w-[125px] flex flex-col items-center">
              <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest font-bold block">ARENA TICKETS</span>
              <div className="flex items-center justify-center gap-2 mt-0.5">
                <div className="font-mono text-lg font-black text-rose-400 flex items-center gap-1.5">
                  <img src="/icons/ticket.png" alt="Ticket" className="w-5 h-5 object-contain drop-shadow-[0_0_6px_rgba(255,40,60,0.6)]" />
                  <span>{profile.pvpTickets !== undefined ? profile.pvpTickets : profile.pvpEnergy}/5</span>
                </div>
                <button
                  onClick={() => setIsBuyTicketsModalOpen(true)}
                  className="py-0.5 px-2 rounded-md bg-gradient-to-r from-amber-600/30 to-rose-600/30 hover:from-amber-600/60 hover:to-rose-600/60 border border-amber-400/40 hover:border-amber-300 text-[9px] font-display font-black uppercase text-[#ebd09b] hover:text-white cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-sm"
                  title="Buy Arena Tickets"
                >
                  + BUY
                </button>
              </div>
            </div>

            {/* League */}
            <div className="text-center px-3 sm:border-r border-white/10 pb-2 sm:pb-0 min-w-[100px]">
              <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest font-bold block mb-1">LEAGUE</span>
              <span className={`px-2.5 py-0.5 border rounded-full text-[9px] font-display font-black uppercase tracking-widest inline-flex items-center gap-1 ${league.color} ${league.glow}`}>
                <img src={league.icon} alt="Crest" className="w-3.5 h-3.5 object-contain" />
                {league.name}
              </span>
            </div>

            {/* Rank Position */}
            <div className="text-center px-3 min-w-[80px]">
              <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest font-bold block">RANK</span>
              <div className="font-mono text-lg font-black text-white mt-0.5">
                #{playerRank}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Matchmaking / History */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          
          {/* Section Selector Tabs (Prominent & styled) */}
          <div className="flex bg-black/60 p-1.5 rounded-2xl border border-white/10 gap-2 mb-2 w-full shadow-inner">
            <button
              onClick={() => setActiveTab('duels')}
              className={`flex-1 py-3 px-6 rounded-xl text-xs font-display font-black tracking-widest transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer uppercase ${
                activeTab === 'duels'
                  ? 'bg-gradient-to-r from-red-950/90 via-rose-900/70 to-red-950/90 border border-rose-500/60 text-white shadow-[0_0_20px_rgba(244,63,94,0.35)] scale-[1.01]'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <Swords className={`w-4 h-4 ${activeTab === 'duels' ? 'text-rose-400 animate-pulse' : 'text-gray-500'}`} />
              <span>ARENA DUELS</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-3 px-6 rounded-xl text-xs font-display font-black tracking-widest transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer uppercase ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-cyan-950/90 via-blue-900/70 to-cyan-950/90 border border-cyan-500/60 text-white shadow-[0_0_20px_rgba(6,182,212,0.35)] scale-[1.01]'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <History className={`w-4 h-4 ${activeTab === 'history' ? 'text-cyan-400' : 'text-gray-500'}`} />
              <span>BATTLE HISTORY</span>
            </button>
          </div>

          {/* DUELS TAB CONTENT */}
          {activeTab === 'duels' && (
            <div className="space-y-6 flex-1">
              
              {/* Deck Incomplete Alert */}
              {profile.deck.length < 10 && (
                <div className="bg-amber-950/15 border border-amber-500/35 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-display font-bold text-xs text-amber-300">DECK INCOMPLETE</h5>
                    <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                      You have selected {profile.deck.length}/10 cards for battle. Please add exactly 10 creatures to your battle deck in the <strong>CARDS</strong> tab before entering the arena.
                    </p>
                  </div>
                </div>
              )}
 
              {/* Opponent Matching Console */}
              {profile.deck.length >= 10 && (
                <div className="space-y-4">
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold block border-b border-gray-900 pb-2">CHALLENGE OPPONENT</span>

                  <div className="bg-gradient-to-b from-[#181216] via-[#120c11] to-[#0a0709] border border-[#c5a880]/25 rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-2xl relative overflow-hidden space-y-6 min-h-[380px]">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 blur-3xl pointer-events-none" />
                    
                    {/* Header with Emblem & League info */}
                    <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left relative z-10">
                      <div className="w-20 h-20 rounded-2xl bg-black/60 border border-rose-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.25)] shrink-0 overflow-hidden group">
                        <img src="/icons/arena_duel_emblem.png" alt="Arena Sigil" className="w-16 h-16 object-contain group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="font-display font-black text-lg text-white tracking-widest uppercase text-shadow-gold">
                          READY FOR RANKED DUEL
                        </h3>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">MATCHMAKING POOL:</span>
                          <span className={`px-2.5 py-0.5 border rounded-full text-[9px] font-display font-black uppercase tracking-widest inline-flex items-center gap-1 ${league.color} ${league.glow}`}>
                            <img src={league.icon} alt="Crest" className="w-3 h-3 object-contain" />
                            {league.name} Tier
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Guaranteed Victory Rewards (PvE Campaign style) */}
                    <div className="space-y-2.5 relative z-10">
                      <span className="text-xs font-display text-[#ebd09b] tracking-wider uppercase font-bold block">
                        VICTORY REWARDS
                      </span>
                      <div className="grid grid-cols-3 gap-3">
                        {/* Gold Reward Card */}
                        <div className="bg-gradient-to-b from-[#1b150d] via-[#100c07] to-[#070503] border border-amber-500/25 hover:border-amber-400/50 p-3 rounded-2xl text-center shadow-md transition-all duration-300 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] flex flex-col items-center justify-center min-h-[85px] group cursor-default">
                          <span className="text-amber-400 font-display font-bold text-base block flex items-center gap-1.5 justify-center text-shadow-gold">
                            +{300 + Math.floor((profile.pvpLP || 0) / 4)}
                            <img src="/icons/icon_gold.webp" alt="Gold" className="w-6 h-6 object-contain drop-shadow-[0_0_6px_rgba(245,158,11,0.45)] group-hover:scale-110 transition-transform duration-300" />
                          </span>
                          <span className="text-[9px] text-amber-500/80 font-mono tracking-widest uppercase font-bold mt-1.5 group-hover:text-amber-400 transition-colors">Gold</span>
                        </div>
                        
                        {/* Crowns Rating Card */}
                        <div className="bg-gradient-to-b from-[#1e1309] via-[#120b05] to-[#070402] border border-amber-400/35 hover:border-amber-300/60 p-3 rounded-2xl text-center shadow-md transition-all duration-300 hover:shadow-[0_0_20px_rgba(251,191,36,0.2)] flex flex-col items-center justify-center min-h-[85px] group cursor-default">
                          <span className="text-amber-300 font-display font-bold text-base block flex items-center gap-1.5 justify-center text-shadow-gold">
                            +25..35
                            <img src="/icons/crown.png" alt="Crowns" className="w-5 h-5 object-contain drop-shadow-[0_0_6px_rgba(251,191,36,0.5)] group-hover:scale-110 transition-transform duration-300" />
                          </span>
                          <span className="text-[9px] text-amber-400/80 font-mono tracking-widest uppercase font-bold mt-1.5 group-hover:text-amber-300 transition-colors">Crowns</span>
                        </div>

                        {/* Dust Reward Card */}
                        <div className="bg-gradient-to-b from-[#0b1a1f] via-[#050f12] to-[#020709] border border-cyan-500/25 hover:border-cyan-400/50 p-3 rounded-2xl text-center shadow-md transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] flex flex-col items-center justify-center min-h-[85px] group cursor-default">
                          <span className="text-cyan-400 font-display font-bold text-base block flex items-center gap-1.5 justify-center text-shadow-cyan">
                            +{30 + Math.floor((profile.pvpLP || 0) / 20)}
                            <img src="/icons/icon_dust.webp" alt="Dust" className="w-6 h-6 object-contain drop-shadow-[0_0_8px_rgba(102,252,241,0.55)] group-hover:scale-110 transition-transform duration-300" />
                          </span>
                          <span className="text-[9px] text-cyan-400/80 font-mono tracking-widest uppercase font-bold mt-1.5 group-hover:text-cyan-300 transition-colors">Dust</span>
                        </div>
                      </div>
                    </div>

                    {/* Battle Action Button Area (PvE Campaign Style with large ticket price) */}
                    <div className="pt-2 relative z-10 flex flex-col items-center">
                      <button
                        onClick={() => handleFindOpponent(false, true)}
                        className="w-full max-w-lg font-display font-black tracking-widest py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-4 cursor-pointer hover:scale-[1.02] active:scale-[0.98] text-sm uppercase bg-gradient-to-b from-[#2f1116] via-[#1c080b] to-[#100305] border-2 border-rose-600/50 hover:border-rose-400 text-rose-200 hover:text-white shadow-[0_0_15px_rgba(225,29,72,0.2)] hover:shadow-[0_0_25px_rgba(244,63,94,0.4)]"
                      >
                        <Swords className="w-5 h-5 animate-pulse text-rose-400 shrink-0" />
                        <span className="mr-0.5 text-sm sm:text-base tracking-wider">FIND OPPONENT</span>
                        <span className="flex items-center gap-1.5 bg-black/60 border border-rose-500/40 rounded-full px-3.5 py-1 font-mono text-base font-bold text-rose-400 shadow-inner">
                          1
                          <img src="/icons/ticket.png" alt="Ticket" className="w-6 h-6 object-contain brightness-110 drop-shadow-[0_0_6px_rgba(255,40,60,0.55)]" />
                        </span>
                      </button>
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

          {/* HISTORY TAB CONTENT */}
          {activeTab === 'history' && (
            <div className="bg-[#151a21] border border-gray-900 rounded-xl p-5 flex-1 space-y-4">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold block border-b border-gray-900 pb-2">RECENT COMBAT LOGS</span>
              
              {!profile.pvpHistory || profile.pvpHistory.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center space-y-2">
                  <History className="w-8 h-8 text-gray-600" />
                  <span className="text-xs text-gray-400 font-sans">No recent duels logged. Engage in Arena duels to earn crowns!</span>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                  {profile.pvpHistory.map((record: any) => {
                    const isWin = (record.winner === 'attacker' && !record.isDefense) || (record.winner === 'defender' && record.isDefense);
                    const lpChange = record.isDefense 
                      ? (record.defenderLPChange !== undefined ? record.defenderLPChange : record.defenderRatingChange)
                      : (record.attackerLPChange !== undefined ? record.attackerLPChange : record.attackerRatingChange);
                    const dateStr = new Date(record.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                    
                    return (
                      <div 
                        key={record.id}
                        className={`flex items-center justify-between p-3 rounded-lg border text-xs font-mono transition-all ${
                          isWin 
                            ? 'bg-emerald-950/5 border-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.02)]' 
                            : 'bg-red-950/5 border-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.02)]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                            record.isDefense 
                              ? 'bg-blue-950/30 border-blue-500/20 text-blue-400' 
                              : 'bg-amber-950/30 border-amber-500/20 text-amber-400'
                          }`} title={record.isDefense ? 'Defended while offline' : 'You initiated this duel'}>
                            {record.isDefense ? <Shield className="w-3.5 h-3.5" /> : <Swords className="w-3.5 h-3.5" />}
                          </div>

                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-xs">
                                {record.isDefense ? `Defended vs ${record.attackerName}` : `Attacked ${record.defenderName}`}
                              </span>
                              <span className="text-[9px] text-gray-500 font-sans">{dateStr}</span>
                            </div>
                            <span className={`text-[10px] uppercase font-bold ${isWin ? 'text-emerald-400' : 'text-red-400'}`}>
                              {isWin ? 'VICTORY 🎉' : 'DEFEAT 💀'}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`font-mono font-black text-sm ${lpChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {lpChange >= 0 ? `+${lpChange}` : lpChange} 👑
                          </span>
                          <span className="text-[9px] text-gray-500 block">
                            Crowns: {record.isDefense 
                              ? (record.defenderLPBefore !== undefined ? record.defenderLPBefore : record.defenderRatingBefore) 
                              : (record.attackerLPBefore !== undefined ? record.attackerLPBefore : record.attackerRatingBefore)} → {record.isDefense 
                              ? ((record.defenderLPBefore !== undefined ? record.defenderLPBefore : record.defenderRatingBefore) + lpChange) 
                              : ((record.attackerLPBefore !== undefined ? record.attackerLPBefore : record.attackerRatingBefore) + lpChange)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Side: Leaderboard */}
        <div className="bg-[#151a21] border border-[#c5a880]/15 rounded-2xl p-5 shadow-xl flex flex-col justify-between h-[540px]">
          <div className="space-y-3.5">
            <h3 className="font-display font-bold text-sm text-white tracking-widest border-b border-gray-900 pb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#ebd09b]" /> LEADERBOARD HALL
            </h3>

            {/* ROUND COUNTDOWN TIMER BANNER */}
            <div className="bg-gradient-to-r from-amber-950/40 via-red-950/25 to-black/50 border border-amber-500/35 rounded-xl p-3 flex items-center justify-between shadow-[0_0_15px_rgba(245,158,11,0.08)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-inner">
                  <Timer className="w-4 h-4 text-amber-400 animate-pulse" />
                </div>
                <div>
                  <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest block font-bold">ROUND ENDS IN</span>
                  <span className="text-[10px] text-amber-400/90 font-sans font-medium">Daily Reset: 00:00 UTC</span>
                </div>
              </div>
              <div className="font-mono text-xs sm:text-sm font-black text-amber-300 bg-black/70 border border-amber-500/40 px-2.5 py-1.5 rounded-lg shadow-inner tracking-wider">
                {formatCountdown(timeRemaining)}
              </div>
            </div>
            
            {/* LEAGUE SELECTOR/NAVIGATOR */}
            <div className="flex items-center justify-between bg-black/30 border border-white/5 rounded-xl p-2">
              <button
                onClick={() => cycleLeague('prev')}
                className="w-8 h-8 rounded-lg bg-black/30 border border-white/5 text-gray-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors active:scale-95 text-[10px]"
              >
                ◀
              </button>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-display font-black uppercase tracking-widest inline-flex items-center ${getLeagueDetails(viewingLeague).color} ${getLeagueDetails(viewingLeague).glow}`}>
                <img src={getLeagueDetails(viewingLeague).icon} alt="Crest" className="w-3.5 h-3.5 object-contain" />
                <span>{getLeagueDetails(viewingLeague).name}</span>
              </div>
              <button
                onClick={() => cycleLeague('next')}
                className="w-8 h-8 rounded-lg bg-black/30 border border-white/5 text-gray-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors active:scale-95 text-[10px]"
              >
                ▶
              </button>
            </div>

            {isLoadingLeaderboard ? (
              <div className="h-64 flex flex-col items-center justify-center space-y-2">
                <div className="w-6 h-6 rounded-full border border-cyan-500 border-t-transparent animate-spin" />
                <span className="text-[9px] font-mono text-gray-500 uppercase">Updating table...</span>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                {leaderboard.map((player, idx) => {
                  const rank = idx + 1;
                  const isSelf = player.walletAddress === (profile.solanaAddress || '');
                  return (
                    <div
                      key={player.walletAddress + idx}
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-mono transition-all ${
                        isSelf
                          ? 'bg-cyan-950/20 border-cyan-500/40 text-cyan-400 font-bold shadow-[0_0_10px_rgba(34,211,238,0.05)]'
                          : 'bg-black/35 border-gray-950 text-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-5 text-center font-bold font-mono text-[10px] ${
                          rank === 1 ? 'text-yellow-400' :
                          rank === 2 ? 'text-gray-400' :
                          rank === 3 ? 'text-amber-600' : 'text-gray-600'
                        }`}>
                          #{rank}
                        </span>
                        <span className="truncate max-w-[120px]">{player.username}</span>
                      </div>
                      <span className={`font-bold flex items-center gap-1.5 ${isSelf ? 'text-cyan-400' : 'text-amber-500'}`}>
                        {player.pvpLP !== undefined ? player.pvpLP : (player.pvpRating || 0)}
                        <img src="/icons/crown.png" alt="Crown" className="w-4.5 h-4.5 object-contain" />
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-gray-900 pt-3 mt-4 text-center">
            <span className="text-[9px] text-gray-500 font-mono flex items-center justify-center gap-1">
              <RefreshCw className="w-3 h-3 text-cyan-500 animate-spin-slow" /> Real-time database updates
            </span>
          </div>

        </div>
 
      </div>
 
      {/* Ticket Purchase Modal */}
      {isBuyTicketsModalOpen && (
        <div className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#151a21] border-2 border-[#ebd09b]/35 rounded-2xl p-6 max-w-md w-full relative shadow-2xl space-y-6">
            <button
              onClick={() => setIsBuyTicketsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white font-sans text-lg font-black transition-colors cursor-pointer w-6 h-6 flex items-center justify-center bg-black/40 border border-white/5 rounded-full"
            >
              ✕
            </button>
 
            <div className="text-center space-y-1.5">
              <div className="w-14 h-14 mx-auto rounded-xl bg-red-950/20 border border-red-500/30 flex items-center justify-center shadow-lg">
                <img src="/icons/ticket.png" alt="Ticket" className="w-9 h-9 object-contain drop-shadow-[0_0_8px_rgba(255,40,60,0.5)]" />
              </div>
              <h3 className="font-display font-black text-base text-white tracking-widest uppercase">
                ARENA TICKET OFFICE
              </h3>
              <p className="text-[10px] text-gray-400 font-sans max-w-xs mx-auto">
                Exchange Dark Shards to purchase Arena Tickets.
              </p>
            </div>

            <div className="bg-black/40 border border-white/5 rounded-xl p-3 flex items-center justify-between font-mono text-xs">
              <span className="text-gray-400">Your Shard Balance:</span>
              <span className="font-bold text-[#ebd09b] flex items-center gap-1.5">
                {(profile.darkShards || 0)}
                <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain" />
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { count: 1, cost: 12, label: 'Single Pass' },
                { count: 5, cost: 50, label: 'Challenger Pack', popular: true },
                { count: 10, cost: 90, label: 'Gladiator Bundle' }
              ].map((pack) => (
                <div
                  key={pack.count}
                  className={`relative p-3 py-4 rounded-xl border flex flex-col items-center justify-between text-center gap-3 bg-black/45 ${
                    pack.popular 
                      ? 'border-amber-500/40 shadow-lg shadow-amber-500/5' 
                      : 'border-white/5'
                  }`}
                >
                  {pack.popular && (
                    <span className="absolute -top-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-display font-black text-[7px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-md">
                      Best Value
                    </span>
                  )}
                  
                  <div className="space-y-0.5">
                    <span className="text-[8px] text-gray-500 font-mono uppercase tracking-tight block">
                      {pack.label}
                    </span>
                    <div className="flex items-center justify-center gap-1.5 pt-1">
                      <span className="font-display font-black text-base text-white">
                        +{pack.count}
                      </span>
                      <img src="/icons/ticket.png" alt="Ticket" className="w-5 h-5 object-contain drop-shadow-[0_0_6px_rgba(255,40,60,0.4)]" />
                    </div>
                  </div>
 
                  <div className="bg-black/50 border border-white/5 w-full py-1.5 rounded-lg flex items-center justify-center gap-1 font-mono text-[9px] font-bold text-amber-400">
                    <span>{pack.cost}</span>
                    <img src="/icons/icon_shards.webp" alt="Shards" className="w-3 h-3 object-contain" />
                  </div>
 
                  <button
                    onClick={async () => {
                      if ((profile.darkShards || 0) < pack.cost) {
                        toast('Insufficient Dark Shards for this package!', 'warning');
                        return;
                      }
                      const ok = await buyPvpTickets(pack.count);
                      if (ok) {
                        toast(`Successfully purchased ${pack.count} Tickets!`, 'success');
                      } else {
                        toast('Transaction failed.', 'error');
                      }
                    }}
                    className={`w-full py-1.5 rounded-lg font-display font-black tracking-wider text-[9px] cursor-pointer transition-all hover:scale-105 active:scale-95 border ${
                      pack.popular
                        ? 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 border-amber-400 text-black'
                        : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-gray-200 hover:text-white'
                    }`}
                  >
                    BUY
                  </button>
                </div>
              ))}
            </div>
 
            <button
              onClick={() => setIsBuyTicketsModalOpen(false)}
              className="w-full py-2.5 rounded-xl border border-gray-900 hover:border-gray-800 bg-black/20 hover:bg-black/40 text-gray-400 hover:text-white font-display font-bold tracking-widest text-[10px] transition-colors cursor-pointer uppercase"
            >
              Back to Arena
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
