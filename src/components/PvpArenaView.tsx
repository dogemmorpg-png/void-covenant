import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useToast } from './Toast';
import { CampaignStage } from '../types';
import { Swords, Award, Zap, Trophy, Shield, Search, RefreshCw, AlertTriangle, History, Crown, Timer, ChevronLeft, ChevronRight, User } from 'lucide-react';

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
  const [myOwnLeagueRank, setMyOwnLeagueRank] = useState<number | string>(1);

  // League calculation helper
  const getLeagueDetails = (leagueName: string) => {
    const name = leagueName || 'Bronze';
    if (name.startsWith('Bronze')) {
      return {
        name: 'Bronze',
        badge: '🥉',
        icon: '/icons/league_bronze.png',
        color: 'text-amber-400 border-amber-600/30 bg-amber-950/20',
        glow: '',
        accent: 'text-amber-400'
      };
    } else if (name.startsWith('Silver')) {
      return {
        name: 'Silver',
        badge: '🥈',
        icon: '/icons/league_silver.png',
        color: 'text-gray-200 border-gray-500/30 bg-gray-900/30',
        glow: '',
        accent: 'text-gray-300'
      };
    } else if (name.startsWith('Gold')) {
      return {
        name: 'Gold',
        badge: '🥇',
        icon: '/icons/league_gold.png',
        color: 'text-yellow-400 border-yellow-500/30 bg-yellow-950/20',
        glow: '',
        accent: 'text-yellow-400'
      };
    } else if (name.startsWith('Platinum')) {
      return {
        name: 'Platinum',
        badge: '🔮',
        icon: '/icons/league_platinum.png',
        color: 'text-indigo-300 border-indigo-500/30 bg-indigo-950/20',
        glow: '',
        accent: 'text-indigo-400'
      };
    } else if (name.startsWith('Diamond')) {
      return {
        name: 'Diamond',
        badge: '💎',
        icon: '/icons/league_diamond.png',
        color: 'text-cyan-300 border-cyan-500/30 bg-cyan-950/20',
        glow: '',
        accent: 'text-cyan-400'
      };
    } else {
      return {
        name: 'Void Overlord',
        badge: '👑',
        icon: '/icons/league_void_overlord.png',
        color: 'text-rose-400 border-rose-500/30 bg-rose-950/20',
        glow: '',
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
        const list = data.leaderboard || [];
        setLeaderboard(list);

        // If inspecting own league, update personal league rank
        if (leagueName === (profile.pvpLeague || 'Bronze')) {
          const myIdx = list.findIndex((p: any) => p.walletAddress === profile.solanaAddress);
          if (myIdx !== -1) {
            setMyOwnLeagueRank(myIdx + 1);
          }
        }
      }
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  // Always fetch and maintain player's rank in their own league
  useEffect(() => {
    const fetchOwnLeagueRank = async () => {
      try {
        const token = localStorage.getItem('void_covenant_token');
        if (!token) return;
        const res = await fetch('/api/leaderboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ league: profile.pvpLeague || 'Bronze' })
        });
        if (res.ok) {
          const data = await res.json();
          const list = data.leaderboard || [];
          const myIdx = list.findIndex((p: any) => p.walletAddress === profile.solanaAddress);
          if (myIdx !== -1) {
            setMyOwnLeagueRank(myIdx + 1);
          }
        }
      } catch (e) {
        console.warn('Error fetching own league rank:', e);
      }
    };
    fetchOwnLeagueRank();
  }, [profile.pvpLeague, profile.solanaAddress, profile.pvpLP]);

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
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-3 bg-[#11141a] border border-white/10 rounded-2xl p-3 sm:p-3.5 w-full lg:w-auto shadow-xl">
            {/* Crowns */}
            <div className="text-center px-3 sm:border-r border-white/10 pb-2 sm:pb-0 min-w-[95px]">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold block">CROWNS</span>
              <div className="font-mono text-xl sm:text-2xl font-black text-amber-400 flex items-center justify-center gap-1.5 mt-0.5">
                <img src="/icons/crown.png" alt="Crown" className="w-6 h-6 object-contain brightness-110 contrast-125" />
                {profile.pvpLP || 0}
              </div>
            </div>

            {/* Arena Tickets (Prominent counter + Buy button) */}
            <div className="text-center px-3 sm:border-r border-white/10 pb-2 sm:pb-0 min-w-[130px] flex flex-col items-center">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold block">ARENA TICKETS</span>
              <div className="flex items-center justify-center gap-2 mt-0.5">
                <div className="font-mono text-lg sm:text-xl font-black text-rose-400 flex items-center gap-1.5">
                  <img src="/icons/ticket.png" alt="Ticket" className="w-5 h-5 object-contain" />
                  <span>{profile.pvpTickets !== undefined ? profile.pvpTickets : profile.pvpEnergy}/5</span>
                </div>
                <button
                  onClick={() => setIsBuyTicketsModalOpen(true)}
                  className="py-1 px-2.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-white font-display font-bold text-[10px] uppercase transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  title="Buy Arena Tickets"
                >
                  + BUY
                </button>
              </div>
            </div>

            {/* League with Large Crest */}
            <div className="text-center px-4 sm:border-r border-white/10 pb-2 sm:pb-0 min-w-[140px] flex flex-col items-center">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold block mb-0.5">MY LEAGUE</span>
              <div className="flex items-center gap-2.5">
                <img 
                  src={league.icon} 
                  alt={league.name} 
                  className="w-9 h-9 object-contain transition-transform hover:scale-105" 
                />
                <span className={`font-display font-bold text-sm sm:text-base tracking-wider uppercase ${league.accent}`}>
                  {league.name}
                </span>
              </div>
            </div>

            {/* Rank Position */}
            <div className="text-center px-4 min-w-[85px]">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold block">MY RANK</span>
              <div className="font-mono text-xl sm:text-2xl font-black text-white mt-0.5">
                #{myOwnLeagueRank}
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
                <div className="bg-gradient-to-b from-[#181216] via-[#120c11] to-[#0a0709] border border-[#c5a880]/25 rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-2xl relative overflow-hidden space-y-6 min-h-[380px]">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 blur-3xl pointer-events-none" />
                  
                  {/* Clean Header with Shield Sigil */}
                  <div className="flex items-center gap-4 text-left relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-black/60 border border-rose-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.25)] shrink-0 overflow-hidden group">
                      <img src="/icons/arena_duel_emblem.png" alt="Arena Sigil" className="w-13 h-13 object-contain group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div>
                      <h3 className="font-display font-black text-xl text-white tracking-widest uppercase text-shadow-gold">
                        READY FOR RANKED DUEL
                      </h3>
                    </div>
                  </div>

                  {/* Victory & Defeat Rewards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 relative z-10">
                    {/* Victory Rewards Card */}
                    <div className="bg-gradient-to-b from-[#181a10]/90 via-[#0e1208]/90 to-[#060804]/90 border border-emerald-500/30 rounded-2xl p-3.5 space-y-2.5 shadow-lg shadow-emerald-950/20">
                      <div className="flex items-center justify-between border-b border-emerald-500/20 pb-1.5">
                        <span className="text-[11px] font-display text-emerald-400 uppercase font-black tracking-wider flex items-center gap-1.5">
                          <Trophy className="w-3.5 h-3.5 text-emerald-400" /> VICTORY REWARDS
                        </span>
                        <span className="text-[8px] font-mono text-emerald-400 font-bold tracking-widest bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">WIN</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        {/* Gold */}
                        <div className="bg-black/50 border border-amber-500/20 p-2 rounded-xl text-center flex flex-col items-center justify-center">
                          <span className="text-amber-400 font-display font-bold text-sm block flex items-center gap-1 text-shadow-gold">
                            +{300 + Math.floor((profile.pvpLP || 0) / 4)}
                            <img src="/icons/icon_gold.webp" alt="Gold" className="w-4 h-4 object-contain drop-shadow-[0_0_4px_rgba(245,158,11,0.5)]" />
                          </span>
                          <span className="text-[8px] text-amber-500/80 font-mono tracking-wider uppercase font-bold mt-0.5">Gold</span>
                        </div>

                        {/* Dust */}
                        <div className="bg-black/50 border border-cyan-500/20 p-2 rounded-xl text-center flex flex-col items-center justify-center">
                          <span className="text-cyan-400 font-display font-bold text-sm block flex items-center gap-1 text-shadow-cyan">
                            +{30 + Math.floor((profile.pvpLP || 0) / 20)}
                            <img src="/icons/icon_dust.webp" alt="Dust" className="w-4 h-4 object-contain drop-shadow-[0_0_4px_rgba(6,182,212,0.5)]" />
                          </span>
                          <span className="text-[8px] text-cyan-400/80 font-mono tracking-wider uppercase font-bold mt-0.5">Dust</span>
                        </div>

                        {/* Crowns (Clean Card without bright yellow box/glow) */}
                        <div className="bg-black/50 border border-amber-500/20 p-2 rounded-xl text-center flex flex-col items-center justify-center">
                          <span className="text-amber-400 font-display font-bold text-sm block flex items-center gap-1">
                            +20
                            <img src="/icons/crown.png" alt="Crowns" className="w-4 h-4 object-contain" />
                          </span>
                          <span className="text-[8px] text-amber-500/80 font-mono tracking-wider uppercase font-bold mt-0.5">Crowns</span>
                        </div>
                      </div>
                    </div>

                    {/* Defeat Penalty Card */}
                    <div className="bg-gradient-to-b from-[#1a0c0e]/90 via-[#120608]/90 to-[#080304]/90 border border-rose-500/25 rounded-2xl p-3.5 space-y-2.5 shadow-lg shadow-rose-950/20">
                      <div className="flex items-center justify-between border-b border-rose-500/20 pb-1.5">
                        <span className="text-[11px] font-display text-rose-400 uppercase font-black tracking-wider flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-rose-400" /> DEFEAT PENALTY
                        </span>
                        <span className="text-[8px] font-mono text-rose-400 font-bold tracking-widest bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/30">LOSS</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {/* Crown Loss */}
                        <div className="bg-black/50 border border-rose-500/20 p-2 rounded-xl text-center flex flex-col items-center justify-center">
                          <span className="text-rose-400 font-display font-bold text-sm block flex items-center gap-1">
                            -15
                            <img src="/icons/crown.png" alt="Crowns" className="w-4 h-4 object-contain" />
                          </span>
                          <span className="text-[8px] text-rose-400/90 font-mono tracking-wider uppercase font-bold mt-0.5">Crowns Lost</span>
                        </div>

                        {/* Consolation Gold */}
                        <div className="bg-black/50 border border-white/5 p-2 rounded-xl text-center flex flex-col items-center justify-center">
                          <span className="text-gray-300 font-display font-bold text-sm block flex items-center gap-1">
                            +20
                            <img src="/icons/icon_gold.webp" alt="Gold" className="w-4 h-4 object-contain opacity-75" />
                          </span>
                          <span className="text-[8px] text-gray-400 font-mono tracking-wider uppercase font-bold mt-0.5">Consolation</span>
                        </div>
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
              )}

            </div>
          )}

          {/* HISTORY TAB CONTENT (Redesigned RPG Combat Log) */}
          {activeTab === 'history' && (
            <div className="bg-gradient-to-b from-[#181216] via-[#120c11] to-[#0a0709] border border-[#c5a880]/25 rounded-2xl p-5 sm:p-6 flex-1 space-y-4 shadow-2xl relative overflow-hidden min-h-[480px]">
              <div className="flex items-center justify-between border-b border-gray-900 pb-3">
                <span className="text-[11px] font-mono text-gray-400 uppercase tracking-widest font-bold flex items-center gap-2">
                  <History className="w-4 h-4 text-cyan-400" /> RECENT COMBAT LOGS
                </span>
                <span className="text-[9px] font-mono text-gray-500 bg-black/40 border border-white/5 px-2.5 py-1 rounded-full">
                  {profile.pvpHistory?.length || 0} Recorded
                </span>
              </div>
              
              {!profile.pvpHistory || profile.pvpHistory.length === 0 ? (
                <div className="h-72 flex flex-col items-center justify-center text-center space-y-3 p-6">
                  <div className="w-16 h-16 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-center shadow-inner">
                    <History className="w-8 h-8 text-gray-600 animate-pulse" />
                  </div>
                  <h4 className="font-display font-bold text-sm text-gray-300 uppercase tracking-wider">No Combat Records</h4>
                  <p className="text-xs text-gray-500 font-sans max-w-xs leading-relaxed">
                    You haven't fought any arena duels yet. Step into the arena and fight for crowns!
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                  {profile.pvpHistory.map((record: any) => {
                    const isWin = (record.winner === 'attacker' && !record.isDefense) || (record.winner === 'defender' && record.isDefense);
                    const lpChange = record.isDefense 
                      ? (record.defenderLPChange !== undefined ? record.defenderLPChange : record.defenderRatingChange)
                      : (record.attackerLPChange !== undefined ? record.attackerLPChange : record.attackerRatingChange);
                    const dateStr = new Date(record.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                    
                    const beforeLP = record.isDefense 
                      ? (record.defenderLPBefore !== undefined ? record.defenderLPBefore : record.defenderRatingBefore) 
                      : (record.attackerLPBefore !== undefined ? record.attackerLPBefore : record.attackerRatingBefore);
                    const afterLP = beforeLP + lpChange;

                    return (
                      <div 
                        key={record.id}
                        className={`group flex items-center justify-between p-3.5 sm:p-4 rounded-xl border transition-all duration-200 hover:scale-[1.01] ${
                          isWin 
                            ? 'bg-gradient-to-r from-emerald-950/20 via-[#101914]/40 to-black/50 border-emerald-500/25 hover:border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.04)]' 
                            : 'bg-gradient-to-r from-rose-950/20 via-[#191012]/40 to-black/50 border-rose-500/25 hover:border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.04)]'
                        }`}
                      >
                        {/* Left side: Mode Icon + Target details */}
                        <div className="flex items-center gap-3.5">
                          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-md ${
                            record.isDefense 
                              ? 'bg-gradient-to-b from-blue-950/60 to-indigo-950/60 border-blue-500/40 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.15)]' 
                              : 'bg-gradient-to-b from-rose-950/60 to-red-950/60 border-rose-500/40 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.15)]'
                          }`} title={record.isDefense ? 'Defended while offline' : 'You initiated this duel'}>
                            {record.isDefense ? <Shield className="w-4 h-4" /> : <Swords className="w-4 h-4" />}
                          </div>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded border ${
                                record.isDefense 
                                  ? 'bg-blue-950/40 text-cyan-400 border-blue-500/30' 
                                  : 'bg-rose-950/40 text-rose-400 border-rose-500/30'
                              }`}>
                                {record.isDefense ? 'DEFENSE' : 'OFFENSE'}
                              </span>
                              <span className="font-display font-black text-sm text-white tracking-wide">
                                {record.isDefense ? `vs ${record.attackerName}` : `vs ${record.defenderName}`}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-display font-black tracking-wider uppercase px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                                isWin 
                                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.25)]' 
                                  : 'bg-rose-950/60 border-rose-500/40 text-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.25)]'
                              }`}>
                                {isWin ? 'VICTORY' : 'DEFEAT'}
                              </span>
                              <span className="text-[10px] text-gray-500 font-sans">{dateStr}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right side: Crowns Change & Range Pill */}
                        <div className="text-right space-y-1">
                          <div className={`font-display font-bold text-base sm:text-lg flex items-center justify-end gap-1.5 ${
                            lpChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            <span>{lpChange >= 0 ? `+${lpChange}` : lpChange}</span>
                            <img 
                              src="/icons/crown.png" 
                              alt="Crown" 
                              className="w-4.5 h-4.5 object-contain"
                            />
                          </div>

                          <div className="bg-black/60 border border-white/10 px-2.5 py-0.5 rounded-lg font-mono text-[10px] text-gray-400 inline-flex items-center gap-1.5 shadow-inner">
                            <span>{beforeLP}</span>
                            <span className="text-gray-600">→</span>
                            <span className={lpChange >= 0 ? 'text-amber-400 font-bold' : 'text-rose-400 font-bold'}>{afterLP}</span>
                          </div>
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
        <div className="bg-[#12151c] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col justify-between min-h-[580px]">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <h3 className="font-display font-bold text-sm text-white tracking-widest uppercase">
                  LEADERBOARD HALL
                </h3>
              </div>
              <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                TOP 20 ADVANCE
              </span>
            </div>

            {/* ROUND COUNTDOWN TIMER BANNER */}
            <div className="bg-gradient-to-r from-amber-950/30 via-[#16120e] to-black/40 border border-white/10 rounded-xl p-2.5 flex items-center justify-between shadow-inner">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                  <Timer className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                </div>
                <div>
                  <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block font-bold">ROUND RESET</span>
                  <span className="text-[10px] text-amber-400/80 font-sans font-medium">Daily at 00:00 UTC</span>
                </div>
              </div>
              <div className="font-mono text-xs font-bold text-amber-300 bg-black/60 border border-white/10 px-2.5 py-1 rounded-lg shadow-inner">
                {formatCountdown(timeRemaining)}
              </div>
            </div>
            
            {/* LEAGUE SELECTOR/NAVIGATOR */}
            <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-2xl p-2 px-3">
              <button
                onClick={() => cycleLeague('prev')}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white flex items-center justify-center cursor-pointer transition-all active:scale-95"
                title="Previous League"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <img 
                  src={getLeagueDetails(viewingLeague).icon} 
                  alt="Crest" 
                  className="w-8 h-8 sm:w-9 sm:h-9 object-contain transition-transform hover:scale-110" 
                />
                <div className="text-center">
                  <span className={`font-display font-black text-sm uppercase tracking-wider block ${getLeagueDetails(viewingLeague).accent}`}>
                    {getLeagueDetails(viewingLeague).name} LEAGUE
                  </span>
                  <span className="text-[9px] text-gray-500 font-mono tracking-tight block">
                    {viewingLeague === (profile.pvpLeague || 'Bronze') ? '• YOUR ACTIVE LEAGUE •' : 'VIEWING ARCHIVE'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => cycleLeague('next')}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white flex items-center justify-center cursor-pointer transition-all active:scale-95"
                title="Next League"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {isLoadingLeaderboard ? (
              <div className="h-64 flex flex-col items-center justify-center space-y-2">
                <div className="w-6 h-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                <span className="text-[10px] font-mono text-gray-500 uppercase">Consulting hall records...</span>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[310px] overflow-y-auto pr-1">
                {Array.from({ length: Math.max(10, leaderboard.length) }).map((_, idx) => {
                  const rank = idx + 1;
                  const player = leaderboard[idx];
                  const isSelf = player && player.walletAddress === (profile.solanaAddress || '');

                  if (player) {
                    return (
                      <div
                        key={player.walletAddress + idx}
                        className={`flex items-center justify-between p-2 px-3 rounded-xl border text-xs transition-all ${
                          isSelf
                            ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-300 font-bold shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                            : rank === 1
                            ? 'bg-amber-950/20 border-amber-500/30 text-gray-200'
                            : rank === 2
                            ? 'bg-slate-900/30 border-slate-700/30 text-gray-200'
                            : rank === 3
                            ? 'bg-amber-950/10 border-amber-700/20 text-gray-200'
                            : 'bg-black/40 border-white/5 text-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Rank badge */}
                          <span className={`w-5 text-center font-bold font-mono text-[11px] shrink-0 ${
                            rank === 1 ? 'text-amber-300 font-black' :
                            rank === 2 ? 'text-gray-300 font-bold' :
                            rank === 3 ? 'text-amber-500 font-bold' : 'text-gray-500'
                          }`}>
                            {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                          </span>

                          {/* Avatar */}
                          <div className="w-6 h-6 rounded-full bg-black/50 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                            {player.avatarUrl ? (
                              <img src={player.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-3.5 h-3.5 text-gray-500" />
                            )}
                          </div>

                          {/* Username */}
                          <span className="truncate font-sans font-bold text-xs text-white max-w-[110px]">
                            {player.username}
                          </span>

                          {isSelf && (
                            <span className="text-[8px] font-mono font-black text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 px-1.5 py-0.2 rounded shrink-0">
                              YOU
                            </span>
                          )}
                        </div>

                        {/* Crowns Score */}
                        <div className="flex items-center gap-1.5 font-mono font-bold text-xs text-amber-300 shrink-0">
                          <span>{player.pvpLP !== undefined ? player.pvpLP : (player.pvpRating || 0)}</span>
                          <img src="/icons/crown.png" alt="Crown" className="w-4 h-4 object-contain brightness-110 contrast-125" />
                        </div>
                      </div>
                    );
                  } else {
                    // Placeholder row for empty seats
                    return (
                      <div
                        key={`empty-${idx}`}
                        className="flex items-center justify-between p-2 px-3 rounded-xl border border-dashed border-white/5 bg-black/20 text-xs opacity-45"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 text-center font-mono text-[10px] text-gray-600">
                            #{rank}
                          </span>
                          <div className="w-6 h-6 rounded-full border border-dashed border-white/10 flex items-center justify-center">
                            <User className="w-3 h-3 text-gray-700" />
                          </div>
                          <span className="font-sans text-xs text-gray-600 italic">
                            Unclaimed Seat
                          </span>
                        </div>
                        <span className="font-mono text-xs text-gray-700 font-bold">—</span>
                      </div>
                    );
                  }
                })}
              </div>
            )}
          </div>

          <div className="border-t border-white/5 pt-2.5 mt-2 flex items-center justify-between text-[9px] text-gray-500 font-mono">
            <span className="flex items-center gap-1">
              <RefreshCw className="w-3 h-3 text-cyan-400/80 animate-spin-slow" /> Live Database
            </span>
            <span className="text-gray-400">Top 20 Advance Daily</span>
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
