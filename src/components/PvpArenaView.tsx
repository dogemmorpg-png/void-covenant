import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useToast } from './Toast';
import { CampaignStage } from '../types';
import { Swords, Award, Zap, Trophy, Shield, Search, RefreshCw, AlertTriangle, History, Crown, Timer, ChevronLeft, ChevronRight, User, Info, Gift, Sparkles, CheckCircle2, Coins } from 'lucide-react';
import { renderStanceIcon } from './SkillAndStanceIcons';
import { assetPreloader } from '../utils/assetPreloader';

export interface LeagueRewardBracket {
  rankLabel: string;
  rankBadge: string;
  sovereigns?: number;
  gold: number;
  dust: number;
  darkShards?: number;
  isPromotion?: boolean;
  isSafe?: boolean;
  isDemotion?: boolean;
}

export interface LeagueTierRewards {
  name: string;
  badge: string;
  icon: string;
  tierIndex: number;
  color: string;
  accent: string;
  border: string;
  bgGradient: string;
  summary: string;
  promotionZone: string;
  brackets: LeagueRewardBracket[];
}

export const ALL_LEAGUE_REWARDS: LeagueTierRewards[] = [
  {
    name: 'Void Overlord',
    badge: '👑',
    icon: '/icons/league_void_overlord.png',
    tierIndex: 9,
    color: 'text-rose-400',
    accent: 'text-rose-400 border-rose-500/40 bg-rose-950/30',
    border: 'border-rose-500/50',
    bgGradient: 'from-red-950/40 via-purple-950/30 to-black',
    summary: 'The apex of realm domination. Highest tributes in Blood Sovereigns & Dark Shards.',
    promotionZone: 'Crown Pinnacle (No Demotions)',
    brackets: [
      { rankLabel: 'Rank #1 Sovereign', rankBadge: '🥇 Supreme Champion', sovereigns: 500, gold: 5000, dust: 500, darkShards: 100 },
      { rankLabel: 'Ranks #2 – #3', rankBadge: '🥈 High Council', sovereigns: 300, gold: 3000, dust: 300, darkShards: 50 },
      { rankLabel: 'Ranks #4 – #10', rankBadge: '🥉 Void Lords', sovereigns: 150, gold: 2000, dust: 200, darkShards: 30 },
      { rankLabel: 'Ranks #11 – #20', rankBadge: '⚔️ Overlord Guard', sovereigns: 80, gold: 1000, dust: 100, darkShards: 20 },
      { rankLabel: 'Ranks #21+', rankBadge: '🛡️ Overlords Safe', sovereigns: 30, gold: 600, dust: 60, isSafe: true }
    ]
  },
  {
    name: 'Grandmaster',
    badge: '⚜️',
    icon: '/icons/league_grandmaster_crest.png',
    tierIndex: 8,
    color: 'text-amber-300',
    accent: 'text-amber-200 border-amber-400/40 bg-gradient-to-r from-purple-950/40 to-amber-950/40',
    border: 'border-amber-400/50',
    bgGradient: 'from-purple-950/40 via-amber-950/30 to-black',
    summary: 'Imperial Grandmasters. Top 20 summoners ascend to the Void Overlord throne.',
    promotionZone: 'Top 20 Ascend to Void Overlord',
    brackets: [
      { rankLabel: 'Ranks #1 – #5', rankBadge: '👑 Grand Sovereign', sovereigns: 60, gold: 2000, dust: 200, darkShards: 25, isPromotion: true },
      { rankLabel: 'Ranks #6 – #20', rankBadge: '⚔️ Imperial Master', sovereigns: 30, gold: 1200, dust: 120, darkShards: 15, isPromotion: true },
      { rankLabel: 'Ranks #21 – #100', rankBadge: '🛡️ Grandmaster Haven', sovereigns: 15, gold: 700, dust: 70, isSafe: true },
      { rankLabel: 'Ranks #101+', rankBadge: '🔻 Demotion Zone', sovereigns: 15, gold: 700, dust: 70, isDemotion: true }
    ]
  },
  {
    name: 'Master',
    badge: '⚔️',
    icon: '/icons/league_master_crest.png',
    tierIndex: 7,
    color: 'text-purple-300',
    accent: 'text-purple-300 border-purple-500/40 bg-purple-950/30',
    border: 'border-purple-500/50',
    bgGradient: 'from-purple-950/40 via-indigo-950/30 to-black',
    summary: 'Elite Master summoners wielding runic blades and void power.',
    promotionZone: 'Top 20 Ascend to Grandmaster',
    brackets: [
      { rankLabel: 'Ranks #1 – #10', rankBadge: '⚔️ Master Warlord', sovereigns: 25, gold: 1500, dust: 150, darkShards: 15, isPromotion: true },
      { rankLabel: 'Ranks #11 – #20', rankBadge: '▲ Master Vanguard', sovereigns: 10, gold: 600, dust: 60, isPromotion: true },
      { rankLabel: 'Ranks #21 – #100', rankBadge: '🛡️ Master Safe Zone', sovereigns: 10, gold: 600, dust: 60, isSafe: true },
      { rankLabel: 'Ranks #101+', rankBadge: '🔻 Demotion Zone', sovereigns: 10, gold: 600, dust: 60, isDemotion: true }
    ]
  },
  {
    name: 'Diamond',
    badge: '💎',
    icon: '/icons/league_diamond.png',
    tierIndex: 6,
    color: 'text-cyan-300',
    accent: 'text-cyan-300 border-cyan-500/30 bg-cyan-950/20',
    border: 'border-cyan-500/50',
    bgGradient: 'from-cyan-950/40 via-blue-950/30 to-black',
    summary: 'Crystal Diamond tier summoners of proven battle prowess.',
    promotionZone: 'Top 20 Ascend to Master',
    brackets: [
      { rankLabel: 'Ranks #1 – #10', rankBadge: '💎 Diamond Paragon', sovereigns: 15, gold: 1000, dust: 100, darkShards: 10, isPromotion: true },
      { rankLabel: 'Ranks #11 – #20', rankBadge: '▲ Diamond Vanguard', sovereigns: 5, gold: 500, dust: 50, isPromotion: true },
      { rankLabel: 'Ranks #21 – #100', rankBadge: '🛡️ Diamond Haven', sovereigns: 5, gold: 500, dust: 50, isSafe: true },
      { rankLabel: 'Ranks #101+', rankBadge: '🔻 Demotion Zone', sovereigns: 5, gold: 500, dust: 50, isDemotion: true }
    ]
  },
  {
    name: 'Ruby',
    badge: '🩸',
    icon: '/icons/league_ruby_crest.png',
    tierIndex: 5,
    color: 'text-red-400',
    accent: 'text-red-400 border-red-500/30 bg-red-950/20',
    border: 'border-red-500/50',
    bgGradient: 'from-red-950/40 via-rose-950/30 to-black',
    summary: 'Crimson blood league. Introduction of daily Blood Sovereigns tributes.',
    promotionZone: 'Top 20 Ascend to Diamond',
    brackets: [
      { rankLabel: 'Ranks #1 – #10', rankBadge: '🩸 Crimson Lord', sovereigns: 8, gold: 800, dust: 80, isPromotion: true },
      { rankLabel: 'Ranks #11 – #20', rankBadge: '▲ Ruby Vanguard', sovereigns: 2, gold: 450, dust: 45, isPromotion: true },
      { rankLabel: 'Ranks #21 – #100', rankBadge: '🛡️ Ruby Safe Zone', sovereigns: 2, gold: 450, dust: 45, isSafe: true },
      { rankLabel: 'Ranks #101+', rankBadge: '🔻 Demotion Zone', sovereigns: 2, gold: 450, dust: 45, isDemotion: true }
    ]
  },
  {
    name: 'Emerald',
    badge: '❇️',
    icon: '/icons/league_emerald_crest.png',
    tierIndex: 4,
    color: 'text-emerald-400',
    accent: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20',
    border: 'border-emerald-500/50',
    bgGradient: 'from-emerald-950/40 via-teal-950/30 to-black',
    summary: 'Jade and emerald enchanted league with daily Blood Sovereigns rewards.',
    promotionZone: 'Top 20 Ascend to Ruby',
    brackets: [
      { rankLabel: 'Ranks #1 – #10', rankBadge: '❇️ Emerald Champion', sovereigns: 4, gold: 600, dust: 60, isPromotion: true },
      { rankLabel: 'Ranks #11 – #20', rankBadge: '▲ Emerald Vanguard', sovereigns: 1, gold: 350, dust: 35, isPromotion: true },
      { rankLabel: 'Ranks #21 – #100', rankBadge: '🛡️ Emerald Haven', sovereigns: 1, gold: 350, dust: 35, isSafe: true },
      { rankLabel: 'Ranks #101+', rankBadge: '🔻 Demotion Zone', sovereigns: 1, gold: 350, dust: 35, isDemotion: true }
    ]
  },
  {
    name: 'Platinum',
    badge: '🔮',
    icon: '/icons/league_platinum.png',
    tierIndex: 3,
    color: 'text-indigo-300',
    accent: 'text-indigo-300 border-indigo-500/30 bg-indigo-950/20',
    border: 'border-indigo-500/40',
    bgGradient: 'from-indigo-950/40 via-blue-950/30 to-black',
    summary: 'Seasoned summoners competing for ascension into the jewel leagues.',
    promotionZone: 'Top 20 Ascend to Emerald',
    brackets: [
      { rankLabel: 'Ranks #1 – #20', rankBadge: '▲ Platinum Vanguard', gold: 300, dust: 30, isPromotion: true },
      { rankLabel: 'Ranks #21 – #100', rankBadge: '🛡️ Platinum Safe Zone', gold: 300, dust: 30, isSafe: true },
      { rankLabel: 'Ranks #101+', rankBadge: '🔻 Demotion Zone', gold: 300, dust: 30, isDemotion: true }
    ]
  },
  {
    name: 'Gold',
    badge: '🥇',
    icon: '/icons/league_gold.png',
    tierIndex: 2,
    color: 'text-yellow-400',
    accent: 'text-yellow-400 border-yellow-500/30 bg-yellow-950/20',
    border: 'border-yellow-500/40',
    bgGradient: 'from-yellow-950/40 via-amber-950/30 to-black',
    summary: 'Veteran warriors striving for glory in the golden halls.',
    promotionZone: 'Top 20 Ascend to Platinum',
    brackets: [
      { rankLabel: 'Ranks #1 – #20', rankBadge: '▲ Gold Vanguard', gold: 225, dust: 25, isPromotion: true },
      { rankLabel: 'Ranks #21 – #100', rankBadge: '🛡️ Gold Safe Zone', gold: 225, dust: 25, isSafe: true },
      { rankLabel: 'Ranks #101+', rankBadge: '🔻 Demotion Zone', gold: 225, dust: 25, isDemotion: true }
    ]
  },
  {
    name: 'Silver',
    badge: '🥈',
    icon: '/icons/league_silver.png',
    tierIndex: 1,
    color: 'text-gray-200',
    accent: 'text-gray-200 border-gray-500/30 bg-gray-900/30',
    border: 'border-gray-500/40',
    bgGradient: 'from-gray-900/40 via-slate-950/30 to-black',
    summary: 'Proven summoners advancing through the competitive ranks.',
    promotionZone: 'Top 20 Ascend to Gold',
    brackets: [
      { rankLabel: 'Ranks #1 – #20', rankBadge: '▲ Silver Vanguard', gold: 150, dust: 15, isPromotion: true },
      { rankLabel: 'Ranks #21 – #100', rankBadge: '🛡️ Silver Safe Zone', gold: 150, dust: 15, isSafe: true },
      { rankLabel: 'Ranks #101+', rankBadge: '🔻 Demotion Zone', gold: 150, dust: 15, isDemotion: true }
    ]
  },
  {
    name: 'Bronze',
    badge: '🥉',
    icon: '/icons/league_bronze.png',
    tierIndex: 0,
    color: 'text-amber-400',
    accent: 'text-amber-400 border-amber-600/30 bg-amber-950/20',
    border: 'border-amber-600/40',
    bgGradient: 'from-amber-950/40 via-yellow-950/20 to-black',
    summary: 'Starting proving grounds for all aspiring summoners.',
    promotionZone: 'Top 20 Ascend to Silver (No Demotion)',
    brackets: [
      { rankLabel: 'Ranks #1 – #20', rankBadge: '▲ Bronze Vanguard', gold: 100, dust: 10, isPromotion: true },
      { rankLabel: 'Ranks #21+', rankBadge: '🛡️ Novice Arena', gold: 100, dust: 10, isSafe: true }
    ]
  }
];

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

  const [activeTab, setActiveTab] = useState<'duels' | 'rewards' | 'history'>('duels');
  const [selectedRewardLeague, setSelectedRewardLeague] = useState<string>(profile.pvpLeague || 'Void Overlord');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);
  const [matchStatus, setMatchStatus] = useState('');
  const [refreshCooldown, setRefreshCooldown] = useState(0);
  const [viewingLeague, setViewingLeague] = useState<string>(profile.pvpLeague || 'Bronze');
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isBuyTicketsModalOpen, setIsBuyTicketsModalOpen] = useState(false);
  const [isLeagueRulesModalOpen, setIsLeagueRulesModalOpen] = useState(false);
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
    } else if (name.startsWith('Emerald')) {
      return {
        name: 'Emerald',
        badge: '❇️',
        icon: '/icons/league_emerald_crest.png',
        color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20',
        glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]',
        accent: 'text-emerald-400'
      };
    } else if (name.startsWith('Ruby')) {
      return {
        name: 'Ruby',
        badge: '🩸',
        icon: '/icons/league_ruby_crest.png',
        color: 'text-red-400 border-red-500/30 bg-red-950/20',
        glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]',
        accent: 'text-red-400'
      };
    } else if (name.startsWith('Diamond')) {
      return {
        name: 'Diamond',
        badge: '💎',
        icon: '/icons/league_diamond.png',
        color: 'text-cyan-300 border-cyan-500/30 bg-cyan-950/20',
        glow: 'shadow-[0_0_15px_rgba(6,182,212,0.3)]',
        accent: 'text-cyan-400'
      };
    } else if (name.startsWith('Master')) {
      return {
        name: 'Master',
        badge: '⚔️',
        icon: '/icons/league_master_crest.png',
        color: 'text-purple-300 border-purple-500/40 bg-purple-950/30',
        glow: 'shadow-[0_0_18px_rgba(168,85,247,0.35)]',
        accent: 'text-purple-400'
      };
    } else if (name.startsWith('Grandmaster')) {
      return {
        name: 'Grandmaster',
        badge: '⚜️',
        icon: '/icons/league_grandmaster_crest.png',
        color: 'text-amber-200 border-amber-400/40 bg-gradient-to-r from-purple-950/40 to-amber-950/40',
        glow: 'shadow-[0_0_20px_rgba(245,158,11,0.35)]',
        accent: 'text-amber-300'
      };
    } else {
      return {
        name: 'Void Overlord',
        badge: '👑',
        icon: '/icons/league_void_overlord.png',
        color: 'text-rose-400 border-rose-500/40 bg-rose-950/30',
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
        const list = data.leaderboard || [];
        setLeaderboard(list);

        // If inspecting own league, update personal league rank
        if (leagueName === (profile.pvpLeague || 'Bronze')) {
          if (data.myRank !== undefined && data.myRank !== null) {
            setMyOwnLeagueRank(data.myRank);
          } else {
            const myIdx = list.findIndex((p: any) => p.walletAddress === profile.solanaAddress);
            if (myIdx !== -1) {
              setMyOwnLeagueRank(myIdx + 1);
            }
          }
        }
      }
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  // Fetch leaderboard & own league rank
  useEffect(() => {
    fetchLeaderboard(viewingLeague);
  }, [viewingLeague]);

  // If viewing another league, also ensure own league rank is fetched
  useEffect(() => {
    if (viewingLeague === (profile.pvpLeague || 'Bronze')) return;
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
          if (data.myRank !== undefined && data.myRank !== null) {
            setMyOwnLeagueRank(data.myRank);
          } else {
            const list = data.leaderboard || [];
            const myIdx = list.findIndex((p: any) => p.walletAddress === profile.solanaAddress);
            if (myIdx !== -1) {
              setMyOwnLeagueRank(myIdx + 1);
            }
          }
        }
      } catch (e) {
        console.warn('Error fetching own league rank:', e);
      }
    };
    fetchOwnLeagueRank();
  }, [profile.pvpLeague, profile.solanaAddress, profile.pvpLP, viewingLeague]);

  const handleFindOpponent = async (spendShards: boolean = false, spendEnergy: boolean = false) => {
    if (profile.deck.length < 10) {
      toast("Your deck is incomplete! Go to the 'CARDS' tab and select exactly 10 cards for battle.", 'warning');
      return;
    }

    if (spendEnergy) {
      const totalTickets = (profile.pvpEnergy !== undefined ? profile.pvpEnergy : 5) + (profile.pvpBonusTickets || 0);
      if (totalTickets < 1) {
        toast('Not enough Arena Tickets! Purchase more in the Ticket Vault or wait for daily reset.', 'warning');
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
    setMatchStatus(spendShards ? 'Summoning a new challenger...' : 'Searching for an opponent...');

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
          if (data.profile.activePvpOpponent?.deck) {
            assetPreloader.preloadBattleCreatures(data.profile.activePvpOpponent.deck);
          }
        }
        setIsModalOpen(true);
        if (spendShards) {
          toast('Opponent re-rolled! 5 Dark Shards deducted.', 'success');
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
      setMatchStatus('Leaving matchmaking...');
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
    const LEAGUES = [
      'Bronze',
      'Silver',
      'Gold',
      'Platinum',
      'Emerald',
      'Ruby',
      'Diamond',
      'Master',
      'Grandmaster',
      'Void Overlord'
    ];
    const idx = LEAGUES.indexOf(viewingLeague);
    if (dir === 'prev') {
      const prevIdx = idx > 0 ? idx - 1 : LEAGUES.length - 1;
      setViewingLeague(LEAGUES[prevIdx]);
    } else {
      const nextIdx = idx < LEAGUES.length - 1 ? idx + 1 : 0;
      setViewingLeague(LEAGUES[nextIdx]);
    }
  };

  const cycleRewardLeague = (dir: 'prev' | 'next') => {
    const LEAGUES = [
      'Bronze',
      'Silver',
      'Gold',
      'Platinum',
      'Emerald',
      'Ruby',
      'Diamond',
      'Master',
      'Grandmaster',
      'Void Overlord'
    ];
    const idx = LEAGUES.indexOf(selectedRewardLeague);
    if (dir === 'prev') {
      const prevIdx = idx > 0 ? idx - 1 : LEAGUES.length - 1;
      setSelectedRewardLeague(LEAGUES[prevIdx]);
    } else {
      const nextIdx = idx < LEAGUES.length - 1 ? idx + 1 : 0;
      setSelectedRewardLeague(LEAGUES[nextIdx]);
    }
  };

  const handleFight = async (opponent: any) => {
    if (profile.deck.length < 10) {
      toast("Your deck is incomplete! Go to the 'CARDS' tab and select exactly 10 cards for battle.", 'warning');
      return;
    }

    setIsMatching(true);
    setMatchStatus('Entering the Arena...');

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
      setMatchStatus('Entering the Arena...');
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
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 space-y-5 animate-fade-in">
          <div className="w-20 h-20 rounded-full border-4 border-rose-500 border-t-transparent animate-spin flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.3)]">
            <Swords className="w-8 h-8 text-rose-400 animate-pulse" />
          </div>
          
          <div className="text-center space-y-1.5 max-w-sm">
            <h3 className="font-display font-black text-lg text-white tracking-widest uppercase">
              MATCHMAKING
            </h3>
            <p className="text-xs font-mono text-gray-400">{matchStatus}</p>
          </div>
        </div>
      )}

      {/* Opponent Modal Window */}
      {isModalOpen && activeOpponent && (
        <div className="fixed inset-0 z-[90] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-b from-[#1a141b] via-[#100b11] to-[#080509] border-2 border-amber-500/40 rounded-3xl p-6 max-w-sm w-full text-center space-y-5 shadow-[0_0_40px_rgba(0,0,0,0.9)] relative overflow-hidden">
            
            {/* Ambient Background Flare */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-rose-500/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/10 blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={handleCancelMatch}
              className="absolute top-4 right-4 text-gray-400 hover:text-white font-sans text-base font-black transition-all cursor-pointer w-8 h-8 flex items-center justify-center bg-black/70 hover:bg-black border border-white/10 hover:border-white/30 rounded-full z-30 shadow-lg hover:scale-105 active:scale-95"
              title="Close and cancel match"
            >
              ✕
            </button>

            {/* Header Title with Swords Emblem */}
            <div className="flex items-center justify-center gap-2 border-b border-white/10 pb-3 px-8 relative z-10">
              <Swords className="w-4 h-4 text-rose-400" />
              <h3 className="font-display font-black text-sm text-white tracking-widest uppercase">
                CHALLENGER FOUND
              </h3>
            </div>

            {/* Opponent Identity & Portrait */}
            <div className="flex flex-col items-center space-y-3.5 relative z-10">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl border-2 border-amber-400/60 p-0.5 bg-black/60 shadow-[0_0_20px_rgba(245,158,11,0.25)] overflow-hidden">
                  <img 
                    src={activeOpponent.avatarUrl || '/avatars/knight.webp'} 
                    alt="Avatar" 
                    className="w-full h-full rounded-xl object-cover" 
                  />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-600 to-yellow-600 border border-amber-300 text-black px-2.5 py-0.5 rounded-full font-mono text-[9px] font-black uppercase tracking-wider shadow-md">
                  LVL {activeOpponent.level || 1}
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <h4 className="text-white font-display font-black text-xl tracking-wide leading-tight">
                  {activeOpponent.name || activeOpponent.username}
                </h4>
                
                <div className="flex items-center justify-center gap-2 pt-0.5">
                  <span className={`px-2.5 py-0.5 border rounded-full text-[10px] font-display font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${getLeagueDetails(activeOpponent.league || 'Bronze').color}`}>
                    <img src={getLeagueDetails(activeOpponent.league || 'Bronze').icon} alt="Crest" className="w-3.5 h-3.5 object-contain" />
                    {getLeagueDetails(activeOpponent.league || 'Bronze').name}
                  </span>

                  <div className="bg-black/60 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 text-xs font-mono font-bold text-amber-300 shadow-inner">
                    <img src="/icons/crown.png" alt="Crown" className="w-4 h-4 object-contain brightness-110 contrast-125" />
                    <span>{activeOpponent.lp !== undefined ? activeOpponent.lp : (activeOpponent.rating || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Combat Stance / Speciality */}
              <div className="w-full bg-gradient-to-r from-[#14121d] via-[#101018] to-[#14121d] border border-white/10 rounded-xl py-2 px-3 flex items-center justify-center gap-2.5 shadow-inner">
                <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 font-bold">STANCE:</span>
                <span className="font-display font-black text-xs uppercase tracking-wider text-white flex items-center gap-2">
                  {renderStanceIcon(activeOpponent.stance || 'void_strike', 'w-4.5 h-4.5')}
                  <span>
                    {activeOpponent.stance === 'blood_aura' ? 'Blood Aura' : 
                     activeOpponent.stance === 'warlord_cry' ? "Warlord's Cry" : 'Void Strike'}
                  </span>
                </span>
              </div>
            </div>

            {/* Action Buttons (Re-roll & Fight) */}
            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-white/10 relative z-10">
              <button
                disabled={isMatching || (profile.darkShards || 0) < 5}
                onClick={() => handleFindOpponent(true, false)}
                className={`py-3.5 px-3 rounded-2xl border-2 font-display font-black text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 ${
                  (profile.darkShards || 0) < 5
                    ? 'border-zinc-850 bg-zinc-900/40 text-zinc-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-950/90 via-[#260c12] to-red-950/90 border-rose-600/60 hover:border-rose-400 text-rose-100 hover:text-white hover:scale-[1.02]'
                }`}
              >
                <RefreshCw className={`w-4 h-4 shrink-0 ${isMatching ? 'animate-spin' : ''}`} />
                <span>RE-ROLL</span>
                <span className="flex items-center gap-1 bg-black/70 border border-rose-500/50 rounded-full px-2.5 py-1 font-mono text-sm font-black text-[#ebd09b] shadow-inner ml-0.5">
                  5
                  <img src="/icons/icon_shards.webp" alt="Shards" className="w-5 h-5 object-contain drop-shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
                </span>
              </button>
              
              <button
                onClick={() => handleFight(activeOpponent)}
                className="py-3.5 px-4 rounded-2xl font-display font-black tracking-widest text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border-2 bg-gradient-to-r from-emerald-950 via-emerald-800 to-teal-950 border-emerald-500/70 hover:border-emerald-400 text-white hover:scale-[1.02] active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]"
              >
                <Swords className="w-4 h-4 shrink-0 text-emerald-300 animate-pulse" /> FIGHT
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

            {/* Arena Tickets (Prominent counter + Reserve badge + Buy button) */}
            <div className="text-center px-3 sm:border-r border-white/10 pb-2 sm:pb-0 min-w-[145px] flex flex-col items-center">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold block">ARENA TICKETS</span>
              <div className="flex items-center justify-center gap-2 mt-0.5">
                <div className="font-mono text-lg sm:text-xl font-black text-rose-400 flex items-center gap-1.5">
                  <img src="/icons/ticket.png" alt="Ticket" className="w-5 h-5 object-contain" />
                  <span>{profile.pvpEnergy !== undefined ? profile.pvpEnergy : 5}/5</span>
                  {(profile.pvpBonusTickets || 0) > 0 && (
                    <span className="text-[10px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-500/50 px-1.5 py-0.5 rounded-md shadow-sm ml-0.5" title="Purchased tickets reserve">
                      +{profile.pvpBonusTickets}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsBuyTicketsModalOpen(true)}
                  className="py-1 px-3 rounded-lg bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 border border-amber-400/50 text-white font-display font-black text-[10px] uppercase transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_8px_rgba(245,158,11,0.35)]"
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
              className={`flex-1 py-3 px-2 sm:px-4 rounded-xl text-[11px] sm:text-xs font-display font-black tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer uppercase ${
                activeTab === 'duels'
                  ? 'bg-gradient-to-r from-red-950/90 via-rose-900/70 to-red-950/90 border border-rose-500/60 text-white shadow-[0_0_20px_rgba(244,63,94,0.35)] scale-[1.01]'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <Swords className={`w-4 h-4 ${activeTab === 'duels' ? 'text-rose-400 animate-pulse' : 'text-gray-500'}`} />
              <span>DUELS</span>
            </button>
            <button
              onClick={() => setActiveTab('rewards')}
              className={`flex-1 py-3 px-2 sm:px-4 rounded-xl text-[11px] sm:text-xs font-display font-black tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer uppercase ${
                activeTab === 'rewards'
                  ? 'bg-gradient-to-r from-amber-950/90 via-yellow-900/70 to-amber-950/90 border border-amber-500/60 text-white shadow-[0_0_20px_rgba(245,158,11,0.35)] scale-[1.01]'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <Trophy className={`w-4 h-4 ${activeTab === 'rewards' ? 'text-amber-400 animate-pulse' : 'text-gray-500'}`} />
              <span>LEAGUE REWARDS</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-3 px-2 sm:px-4 rounded-xl text-[11px] sm:text-xs font-display font-black tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer uppercase ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-cyan-950/90 via-blue-900/70 to-cyan-950/90 border border-cyan-500/60 text-white shadow-[0_0_20px_rgba(6,182,212,0.35)] scale-[1.01]'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <History className={`w-4 h-4 ${activeTab === 'history' ? 'text-cyan-400' : 'text-gray-500'}`} />
              <span>HISTORY</span>
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
                            <img src="/icons/icon_dust.webp" alt="Dust" className="w-5.5 h-5.5 object-contain drop-shadow-[0_0_6px_rgba(6,182,212,0.6)] scale-135" />
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

          {/* LEAGUE REWARDS TAB CONTENT */}
          {activeTab === 'rewards' && (
            <div className="space-y-6 flex-1 animate-fade-in">
              
              {/* Header Banner */}
              <div className="bg-gradient-to-b from-[#1c140f] via-[#120d09] to-[#0a0705] border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden space-y-4">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 blur-3xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-400" />
                      <h3 className="font-display font-black text-lg text-white tracking-widest uppercase">
                        DAILY LEAGUE TRIBUTES
                      </h3>
                    </div>
                    <p className="text-xs text-gray-300 font-sans leading-relaxed max-w-xl">
                      Each day at <strong className="text-amber-400 font-mono">00:00 UTC</strong>, the realm decrees daily rewards based on your final season standing. Rewards are attached to official decrees in your <strong>Mailbox</strong>.
                    </p>
                  </div>

                  {/* Reset Timer Pill */}
                  <div className="flex items-center gap-2 bg-black/60 border border-amber-500/30 px-3.5 py-2 rounded-xl shrink-0 shadow-inner">
                    <Timer className="w-4 h-4 text-amber-400 animate-pulse" />
                    <div>
                      <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block font-bold">NEXT DECREE IN</span>
                      <span className="font-mono text-xs font-bold text-amber-300">{formatCountdown(timeRemaining)}</span>
                    </div>
                  </div>
                </div>

                {/* Player Current Standing Highlight */}
                <div className="bg-black/50 border border-white/10 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 relative z-10">
                  <div className="flex items-center gap-3">
                    <img 
                      src={league.icon} 
                      alt={league.name} 
                      className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]" 
                    />
                    <div>
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">YOUR CURRENT STANDING</span>
                      <span className="font-display font-black text-sm text-white">
                        <span className={league.accent}>{league.name} League</span> • Rank #{myOwnLeagueRank} ({profile.pvpLP || 0} Crowns)
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedRewardLeague(profile.pvpLeague || 'Bronze')}
                    className="text-xs font-mono font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                  >
                    View My League Rewards →
                  </button>
                </div>
              </div>

              {/* LEAGUE SELECTOR/NAVIGATOR (Same sleek style as Leaderboard Hall) */}
              <div className="flex items-center justify-between bg-black/60 border border-white/10 rounded-2xl p-3 px-4 shadow-xl">
                <button
                  onClick={() => cycleRewardLeague('prev')}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-sm"
                  title="Previous League"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3.5">
                  <img 
                    src={getLeagueDetails(selectedRewardLeague).icon} 
                    alt="Crest" 
                    className="w-10 h-10 sm:w-11 sm:h-11 object-contain transition-transform hover:scale-110 drop-shadow-md" 
                  />
                  <div className="text-center sm:text-left">
                    <span className={`font-display font-black text-base sm:text-lg uppercase tracking-wider block ${getLeagueDetails(selectedRewardLeague).accent}`}>
                      {getLeagueDetails(selectedRewardLeague).name} LEAGUE
                    </span>
                    {(profile.pvpLeague || 'Bronze').toLowerCase() === selectedRewardLeague.toLowerCase() && (
                      <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center justify-center sm:justify-start gap-1">
                        ⭐ Your Active League
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => cycleRewardLeague('next')}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-sm"
                  title="Next League"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Detailed Breakdown for Selected League */}
              {(() => {
                const currentTier = ALL_LEAGUE_REWARDS.find(t => t.name.toLowerCase() === selectedRewardLeague.toLowerCase()) || ALL_LEAGUE_REWARDS[0];
                const isMyLeague = (profile.pvpLeague || 'Bronze').toLowerCase() === currentTier.name.toLowerCase();

                return (
                  <div className={`bg-gradient-to-b ${currentTier.bgGradient} border-2 ${currentTier.border} rounded-3xl p-5 sm:p-7 space-y-6 shadow-2xl relative overflow-hidden`}>
                    
                    {/* Ambient Glow */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 blur-3xl pointer-events-none" />

                    {/* League Card Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5 relative z-10">
                      <div className="flex items-center gap-4">
                        <img 
                          src={currentTier.icon} 
                          alt={currentTier.name} 
                          className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-transform hover:scale-105" 
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h4 className="font-display font-black text-xl sm:text-2xl text-white tracking-widest uppercase">
                              {currentTier.name} LEAGUE
                            </h4>
                            {isMyLeague && (
                              <span className="font-mono text-[10px] font-black uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.4)]">
                                ⭐ Your Active League
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-300 font-sans max-w-md">
                            {currentTier.summary}
                          </p>
                        </div>
                      </div>

                      {/* Promotion Zone Rule Badge */}
                      <div className="bg-black/60 border border-white/15 rounded-2xl p-3 text-center sm:text-right shrink-0 w-full sm:w-auto">
                        <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest block font-bold">LADDER RESOLUTION</span>
                        <span className="font-display font-bold text-xs text-emerald-400 mt-0.5 block">
                          {currentTier.promotionZone}
                        </span>
                      </div>
                    </div>

                    {/* Rank Brackets Table / Grid */}
                    <div className="space-y-3 relative z-10">
                      <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 uppercase tracking-widest px-2 font-bold">
                        <span>Rank Standing</span>
                        <span>Daily Decreed Rewards (Attached to Mail)</span>
                      </div>

                      <div className="space-y-2.5">
                        {currentTier.brackets.map((bracket, bIdx) => {
                          return (
                            <div 
                              key={bIdx}
                              className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                                bracket.isPromotion 
                                  ? 'bg-gradient-to-r from-emerald-950/30 via-black/60 to-black/60 border-emerald-500/40 shadow-sm'
                                  : bracket.isDemotion
                                  ? 'bg-gradient-to-r from-rose-950/30 via-black/60 to-black/60 border-rose-500/30'
                                  : 'bg-black/50 border-white/10 hover:border-white/20'
                              }`}
                            >
                              {/* Left: Rank Label & Status Badge */}
                              <div className="flex items-center gap-3">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-display font-black text-sm sm:text-base text-white tracking-wide">
                                      {bracket.rankLabel}
                                    </span>
                                    <span className="text-[10px] font-mono font-bold bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-gray-300">
                                      {bracket.rankBadge}
                                    </span>
                                    {bracket.isPromotion && (
                                      <span className="text-[9px] font-mono font-black uppercase text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded">
                                        ▲ PROMOTES
                                      </span>
                                    )}
                                    {bracket.isDemotion && (
                                      <span className="text-[9px] font-mono font-black uppercase text-rose-400 bg-rose-950/60 border border-rose-500/40 px-2 py-0.5 rounded">
                                        ▼ DEMOTES
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Right: Reward Badges */}
                              <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
                                {/* Blood Sovereigns */}
                                {bracket.sovereigns !== undefined && bracket.sovereigns > 0 && (
                                  <div className="bg-gradient-to-b from-amber-950/60 via-black to-black border border-amber-400/60 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                                    <Crown className="w-4 h-4 text-amber-400" />
                                    <span className="font-display font-black text-xs sm:text-sm text-amber-300">
                                      +{bracket.sovereigns}
                                    </span>
                                    <span className="text-[9px] font-mono uppercase text-amber-400/80 font-bold hidden sm:inline">SOV</span>
                                  </div>
                                )}

                                {/* Dark Shards */}
                                {bracket.darkShards !== undefined && bracket.darkShards > 0 && (
                                  <div className="bg-gradient-to-b from-rose-950/60 via-black to-black border border-rose-500/40 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                                    <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain" />
                                    <span className="font-display font-black text-xs sm:text-sm text-rose-400">
                                      +{bracket.darkShards}
                                    </span>
                                    <span className="text-[9px] font-mono uppercase text-rose-400/80 font-bold hidden sm:inline">Shards</span>
                                  </div>
                                )}

                                {/* Gold */}
                                <div className="bg-gradient-to-b from-yellow-950/40 via-black to-black border border-yellow-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-inner">
                                  <img src="/icons/icon_gold.webp" alt="Gold" className="w-4 h-4 object-contain" />
                                  <span className="font-display font-black text-xs sm:text-sm text-amber-300">
                                    +{bracket.gold}
                                  </span>
                                  <span className="text-[9px] font-mono uppercase text-amber-400/70 font-bold hidden sm:inline">Gold</span>
                                </div>

                                {/* Void Dust */}
                                <div className="bg-gradient-to-b from-cyan-950/40 via-black to-black border border-cyan-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-inner">
                                  <img src="/icons/icon_dust.webp" alt="Dust" className="w-4 h-4 object-contain" />
                                  <span className="font-display font-black text-xs sm:text-sm text-[#66fcf1]">
                                    +{bracket.dust}
                                  </span>
                                  <span className="text-[9px] font-mono uppercase text-cyan-400/70 font-bold hidden sm:inline">Dust</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quick navigation to other leagues */}
                    <div className="flex items-center justify-between border-t border-white/10 pt-4 relative z-10">
                      <button
                        onClick={() => cycleRewardLeague('prev')}
                        className="text-xs font-mono text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        ← Previous League
                      </button>

                      <button
                        onClick={() => cycleRewardLeague('next')}
                        className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors font-bold"
                      >
                        Next League →
                      </button>
                    </div>

                  </div>
                );
              })()}

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
              <button
                onClick={() => setIsLeagueRulesModalOpen(true)}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-950/60 via-black to-amber-950/60 hover:from-amber-900/60 hover:to-amber-900/60 border border-amber-500/50 hover:border-amber-400 text-amber-300 hover:text-white font-display font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(245,158,11,0.2)] hover:shadow-[0_0_18px_rgba(245,158,11,0.4)] hover:scale-105 active:scale-95 cursor-pointer"
                title="View League Promotion & Demotion Rules"
              >
                <Info className="w-4 h-4 text-amber-400" />
                <span>RULES</span>
              </button>
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

            {/* PROMOTION / DEMOTION QUICK LEGEND BAR */}
            <div 
              onClick={() => setIsLeagueRulesModalOpen(true)}
              className="bg-black/60 border border-white/10 hover:border-amber-500/40 rounded-xl py-2 px-3.5 flex items-center justify-between text-xs font-mono shadow-inner cursor-pointer transition-all hover:bg-black/80 group"
              title="Click to view full League rules"
            >
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <span className="text-sm leading-none">▲</span> Top 20: Promote
              </span>
              <span className="text-gray-600 font-bold">•</span>
              <span className="text-gray-300 font-medium">21–100: Safe</span>
              <span className="text-gray-600 font-bold">•</span>
              <span className="flex items-center gap-1 text-rose-400 font-bold">
                <span className="text-sm leading-none">▼</span> 101+: Demote
              </span>
            </div>
            
            {/* LEAGUE SELECTOR/NAVIGATOR */}
            <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-2xl p-2.5 px-3">
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
                <span className={`font-display font-black text-sm sm:text-base uppercase tracking-wider block ${getLeagueDetails(viewingLeague).accent}`}>
                  {getLeagueDetails(viewingLeague).name} LEAGUE
                </span>
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
                <span className="text-[10px] font-mono text-gray-500 uppercase">Loading Leaderboard...</span>
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
                        <div className="flex items-center gap-2 min-w-0">
                          {/* Clean Rank Number with Zone Marker */}
                          <div className="flex items-center gap-0.5 shrink-0">
                            <span className={`w-6 text-center font-bold font-mono text-xs ${
                              rank === 1 ? 'text-amber-400 font-black' :
                              rank === 2 ? 'text-slate-300 font-bold' :
                              rank === 3 ? 'text-amber-600 font-bold' : 
                              rank <= 20 ? 'text-emerald-400 font-bold' : 'text-gray-500'
                            }`}>
                              #{rank}
                            </span>
                            {rank <= 20 && (
                              <span className="text-[8px] text-emerald-400/80 font-black" title="Promotion Zone">▲</span>
                            )}
                          </div>

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
                    // Placeholder row for empty slots
                    return (
                      <div
                        key={`empty-${idx}`}
                        className="flex items-center justify-between p-2 px-3 rounded-xl border border-white/5 bg-black/20 text-xs opacity-35"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 text-center font-mono text-xs text-gray-600">
                            #{rank}
                          </span>
                          <span className="font-mono text-xs text-gray-600">
                            —
                          </span>
                        </div>
                        <span className="font-mono text-xs text-gray-700 font-bold">—</span>
                      </div>
                    );
                  }
                })}
              </div>
            )}

            {/* Pinned My Rank Row (ONLY if viewing own league AND player is not in visible top 20 list) */}
            {viewingLeague === (profile.pvpLeague || 'Bronze') && !leaderboard.some(p => p.walletAddress === profile.solanaAddress) && (
              <div className="pt-2 border-t border-cyan-500/30">
                <div className="flex items-center justify-between p-2 px-3 rounded-xl border bg-cyan-950/40 border-cyan-500/50 text-xs text-cyan-300 font-bold shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 text-center font-bold font-mono text-xs text-cyan-300">
                      #{myOwnLeagueRank}
                    </span>
                    <div className="w-6 h-6 rounded-full bg-black/50 border border-cyan-400/50 overflow-hidden shrink-0 flex items-center justify-center">
                      {profile.avatarUrl ? (
                        <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-3.5 h-3.5 text-cyan-300" />
                      )}
                    </div>
                    <span className="truncate font-sans font-bold text-xs text-white max-w-[110px]">
                      {profile.username || 'You'}
                    </span>
                    <span className="text-[8px] font-mono font-black text-cyan-300 bg-cyan-950/80 border border-cyan-500/60 px-1.5 py-0.2 rounded shrink-0">
                      YOU
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-xs text-amber-300 shrink-0">
                    <span>{profile.pvpLP || 0}</span>
                    <img src="/icons/crown.png" alt="Crown" className="w-4 h-4 object-contain brightness-110 contrast-125" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-white/5 pt-2.5 mt-2 flex items-center justify-center text-[9px] text-gray-500 font-mono">
            <span className="flex items-center gap-1">
              <RefreshCw className="w-3 h-3 text-cyan-400/80 animate-spin-slow" /> Real-time database updates
            </span>
          </div>

        </div>
 
      </div>
 
      {/* Ticket Purchase Modal */}
      {isBuyTicketsModalOpen && (
        <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-b from-[#1c141e] via-[#110d14] to-[#09060b] border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 max-w-xl w-full relative shadow-[0_0_60px_rgba(0,0,0,0.95)] space-y-6 overflow-hidden">
            
            {/* Ambient Background Flares */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-rose-500/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/10 blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={() => setIsBuyTicketsModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white font-sans text-base font-black transition-all cursor-pointer w-9 h-9 flex items-center justify-center bg-black/70 hover:bg-black border border-white/10 hover:border-white/30 rounded-full z-30 shadow-lg hover:scale-105 active:scale-95"
              title="Close"
            >
              ✕
            </button>
 
            {/* Header with Glowing Ticket Emblem */}
            <div className="text-center space-y-2 relative z-10 px-10">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-b from-rose-950/80 via-black to-black border-2 border-rose-500/60 flex items-center justify-center shadow-[0_0_25px_rgba(244,63,94,0.35)]">
                <img src="/icons/ticket.png" alt="Ticket" className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(244,63,94,0.75)]" />
              </div>
              <h3 className="font-display font-black text-2xl text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-yellow-500 tracking-widest uppercase text-shadow-gold">
                ARENA TICKET VAULT
              </h3>
              <p className="text-xs text-gray-300 font-sans max-w-sm mx-auto leading-relaxed">
                Exchange Dark Shards for Arena Tickets to battle rival summoners and climb the Leagues.
              </p>
            </div>

            {/* Status Bar: Daily Tickets + Reserve Tickets + Shards Balance */}
            <div className="grid grid-cols-3 gap-2 bg-black/60 border border-white/10 rounded-2xl p-3 relative z-10 shadow-inner">
              <div className="flex flex-col items-center justify-center border-r border-white/10 pr-1 text-center">
                <span className="text-[8.5px] font-mono text-gray-400 uppercase tracking-wider block font-bold">Daily Free</span>
                <span className="font-mono text-base font-black text-rose-300 flex items-center gap-1 mt-0.5">
                  <img src="/icons/ticket.png" alt="Ticket" className="w-4 h-4 object-contain" />
                  {profile.pvpEnergy !== undefined ? profile.pvpEnergy : 5}/5
                </span>
                <span className="text-[7.5px] text-gray-500 font-mono mt-0.5">Refills 00:00 UTC</span>
              </div>

              <div className="flex flex-col items-center justify-center border-r border-white/10 px-1 text-center">
                <span className="text-[8.5px] font-mono text-gray-400 uppercase tracking-wider block font-bold">Reserve</span>
                <span className="font-mono text-base font-black text-amber-300 flex items-center gap-1 mt-0.5">
                  <img src="/icons/ticket.png" alt="Ticket" className="w-4 h-4 object-contain brightness-125" />
                  +{profile.pvpBonusTickets || 0}
                </span>
                <span className="text-[7.5px] text-gray-500 font-mono mt-0.5">Never Expires</span>
              </div>

              <div className="flex flex-col items-center justify-center pl-1 text-center">
                <span className="text-[8.5px] font-mono text-gray-400 uppercase tracking-wider block font-bold">Your Shards</span>
                <span className="font-mono text-base font-black text-amber-400 flex items-center gap-1 mt-0.5">
                  <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain" />
                  {profile.darkShards || 0}
                </span>
                <span className="text-[7.5px] text-gray-500 font-mono mt-0.5">Currency</span>
              </div>
            </div>

            {/* 3 Ticket Bundles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 relative z-10">
              {[
                { 
                  count: 1, 
                  cost: 12, 
                  label: 'Single Pass', 
                  sub: '1 Duel Entry',
                  theme: 'border-white/10 hover:border-white/20 bg-gradient-to-b from-zinc-950 via-black to-black' 
                },
                { 
                  count: 5, 
                  cost: 50, 
                  label: 'Gladiator Pack', 
                  sub: '5 Duel Entries', 
                  popular: true, 
                  badge: 'MOST POPULAR',
                  theme: 'border-amber-500/60 hover:border-amber-400 bg-gradient-to-b from-amber-950/30 via-black to-black shadow-[0_0_20px_rgba(245,158,11,0.15)]' 
                },
                { 
                  count: 10, 
                  cost: 90, 
                  label: 'Warlord Bundle', 
                  sub: '10 Duel Entries', 
                  badge: 'SAVE 30 SHARDS',
                  theme: 'border-purple-500/50 hover:border-purple-400 bg-gradient-to-b from-purple-950/30 via-black to-black shadow-[0_0_20px_rgba(168,85,247,0.15)]' 
                }
              ].map((pack) => {
                const canAfford = (profile.darkShards || 0) >= pack.cost;
                return (
                  <div
                    key={pack.count}
                    className={`relative p-4 rounded-2xl border flex flex-col items-center justify-between text-center gap-4 transition-all duration-300 hover:scale-[1.02] ${pack.theme}`}
                  >
                    {pack.badge && (
                      <span className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full font-display font-black text-[8px] uppercase tracking-wider shadow-md whitespace-nowrap ${
                        pack.popular 
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black border border-amber-300' 
                          : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border border-purple-400'
                      }`}>
                        {pack.badge}
                      </span>
                    )}
                    
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] text-gray-400 font-display font-black uppercase tracking-wider block">
                        {pack.label}
                      </span>
                      <span className="text-[9px] text-gray-500 font-mono block">
                        {pack.sub}
                      </span>
                      
                      <div className="flex items-center justify-center gap-2 pt-2">
                        <span className="font-display font-black text-2xl text-white">
                          +{pack.count}
                        </span>
                        <img src="/icons/ticket.png" alt="Ticket" className="w-7 h-7 object-contain drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                      </div>
                    </div>
   
                    {/* Cost pill */}
                    <div className="bg-black/70 border border-white/10 w-full py-2 rounded-xl flex items-center justify-center gap-2 font-mono text-sm font-black text-amber-300 shadow-inner">
                      <span>{pack.cost}</span>
                      <img src="/icons/icon_shards.webp" alt="Shards" className="w-5 h-5 object-contain drop-shadow-[0_0_6px_rgba(239,68,68,0.7)]" />
                    </div>
   
                    <button
                      onClick={async () => {
                        if (!canAfford) {
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
                      className={`w-full py-2.5 rounded-xl font-display font-black tracking-wider text-xs uppercase cursor-pointer transition-all duration-300 shadow-md ${
                        !canAfford
                          ? 'bg-zinc-900 border border-zinc-800 text-zinc-600 cursor-not-allowed opacity-60'
                          : pack.popular
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black border border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95'
                          : 'bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 border border-zinc-600 hover:border-amber-400/60 text-white hover:scale-105 active:scale-95'
                      }`}
                    >
                      {canAfford ? 'BUY' : 'NEED SHARDS'}
                    </button>
                  </div>
                );
              })}
            </div>
   
            <button
              onClick={() => setIsBuyTicketsModalOpen(false)}
              className="w-full py-3.5 rounded-2xl border border-white/10 hover:border-white/20 bg-black/40 hover:bg-black/60 text-gray-300 hover:text-white font-display font-bold tracking-widest text-xs transition-colors cursor-pointer uppercase relative z-10"
            >
              Back to Arena
            </button>
          </div>
        </div>
      )}

      {/* League Rules Modal */}
      {isLeagueRulesModalOpen && (
        <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-b from-[#1c141e] via-[#110d14] to-[#09060b] border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 max-w-xl w-full relative shadow-[0_0_60px_rgba(0,0,0,0.95)] space-y-6 overflow-hidden">
            
            {/* Ambient Background Flare */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 bg-amber-500/15 blur-3xl pointer-events-none" />
            
            {/* Close Button */}
            <button
              onClick={() => setIsLeagueRulesModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white font-sans text-base font-black transition-all cursor-pointer w-9 h-9 flex items-center justify-center bg-black/70 hover:bg-black border border-white/10 hover:border-white/30 rounded-full z-30 shadow-lg hover:scale-105 active:scale-95"
              title="Close"
            >
              ✕
            </button>

            {/* Header with Glowing Trophy */}
            <div className="text-center space-y-2 relative z-10 px-10">
              <div className="w-18 h-18 mx-auto rounded-2xl bg-gradient-to-b from-amber-950/80 via-black to-black border-2 border-amber-500/60 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.35)]">
                <Trophy className="w-10 h-10 text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]" />
              </div>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-yellow-500 tracking-widest uppercase text-shadow-gold">
                LEAGUE RULES & RESET
              </h3>
              <p className="text-xs sm:text-sm text-gray-200 font-sans max-w-md mx-auto leading-relaxed">
                The Arena ladder resolves daily at <strong className="text-amber-400 font-mono text-sm">00:00 UTC</strong>. Here is how summoner ranks are promoted or demoted:
              </p>
            </div>

            {/* 3 Zone Explanations */}
            <div className="space-y-3.5 relative z-10">
              {/* Promotion Zone */}
              <div className="bg-gradient-to-r from-emerald-950/50 via-black/70 to-emerald-950/30 border border-emerald-500/50 rounded-2xl p-4 flex items-start gap-4 shadow-lg shadow-emerald-950/20">
                <div className="w-11 h-11 rounded-xl bg-emerald-950/90 border border-emerald-500/70 flex items-center justify-center text-emerald-300 font-black text-xl shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.4)]">
                  ▲
                </div>
                <div className="space-y-1 text-left flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-display font-black text-sm sm:text-base text-emerald-300 uppercase tracking-wider">
                      PROMOTION ZONE
                    </span>
                    <span className="text-xs font-mono bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 px-2.5 py-0.5 rounded-md font-black shadow-sm">
                      Top 20 (#1 – #20)
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-200 font-sans leading-relaxed">
                    Summoners finishing in the Top 20 ascend to the next higher League tier with greater battle rewards and glory.
                  </p>
                </div>
              </div>

              {/* Safe Zone */}
              <div className="bg-gradient-to-r from-zinc-900/60 via-black/70 to-zinc-900/40 border border-white/15 rounded-2xl p-4 flex items-start gap-4 shadow-md">
                <div className="w-11 h-11 rounded-xl bg-zinc-900/90 border border-white/20 flex items-center justify-center text-gray-300 font-black text-base shrink-0">
                  ■
                </div>
                <div className="space-y-1 text-left flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-display font-black text-sm sm:text-base text-gray-200 uppercase tracking-wider">
                      SAFE HAVEN
                    </span>
                    <span className="text-xs font-mono bg-black/80 text-gray-300 border border-white/15 px-2.5 py-0.5 rounded-md font-bold">
                      Ranks #21 – #100
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-200 font-sans leading-relaxed">
                    Summoners safely maintain their standing and remain in the current League tier for the upcoming round.
                  </p>
                </div>
              </div>

              {/* Demotion Zone */}
              <div className="bg-gradient-to-r from-rose-950/50 via-black/70 to-rose-950/30 border border-rose-500/50 rounded-2xl p-4 flex items-start gap-4 shadow-lg shadow-rose-950/20">
                <div className="w-11 h-11 rounded-xl bg-rose-950/90 border border-rose-500/70 flex items-center justify-center text-rose-300 font-black text-xl shrink-0 shadow-[0_0_12px_rgba(244,63,94,0.4)]">
                  ▼
                </div>
                <div className="space-y-1 text-left flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-display font-black text-sm sm:text-base text-rose-300 uppercase tracking-wider">
                      DEMOTION ZONE
                    </span>
                    <span className="text-xs font-mono bg-rose-950/90 text-rose-300 border border-rose-500/50 px-2.5 py-0.5 rounded-md font-black shadow-sm">
                      Ranks #101+
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-200 font-sans leading-relaxed">
                    Summoners ranked below 100 drop down to the previous lower League (excluding Bronze League).
                  </p>
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="bg-black/70 border border-white/10 rounded-2xl p-3.5 text-center text-xs sm:text-sm text-gray-200 font-sans leading-relaxed relative z-10 shadow-inner">
              💡 <span className="text-amber-300 font-bold">Daily Refill:</span> Free tickets reset to <strong className="text-rose-400 font-mono">5/5</strong> daily at 00:00 UTC. Purchased tickets in your Reserve never expire.
            </div>

            <button
              onClick={() => setIsLeagueRulesModalOpen(false)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-display font-black tracking-widest text-xs sm:text-sm transition-all duration-300 cursor-pointer uppercase relative z-10 shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:scale-[1.02] active:scale-[0.98]"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
