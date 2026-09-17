import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { useToast } from '../../components/Toast';
import { CampaignStage } from '../../types';
import { 
  Swords, 
  Award, 
  Zap, 
  Trophy, 
  Shield, 
  ShieldCheck, 
  Search, 
  RefreshCw, 
  AlertTriangle, 
  History, 
  Crown, 
  Timer, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Info, 
  Gift, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  Plus, 
  Clock, 
  ShoppingBag, 
  ArrowRight,
  X 
} from 'lucide-react';
import { renderStanceIcon } from '../../components/SkillAndStanceIcons';
import { assetPreloader } from '../../utils/assetPreloader';
import { calculateEquipmentSetBonuses } from '../../data/equipment';
import { ALL_LEAGUE_REWARDS, LEAGUE_PROMOTION_CONFIG } from '../../data/leagueRewards';

interface MobilePvpViewProps {
  onStartBattle: (stage: CampaignStage, type: 'campaign' | 'pvp', opponentPayload?: any) => Promise<boolean> | void;
  isMatching: boolean;
  setIsMatching: (val: boolean) => void;
  isModalOpen: boolean;
  setIsModalOpen: (val: boolean) => void;
  onNavigateToShop?: (tab?: 'cards' | 'equipment' | 'divine' | 'shields') => void;
}

const LEAGUES = [
  'Bronze',
  'Silver',
  'Gold',
  'Platinum',
  'Sapphire',
  'Emerald',
  'Ruby',
  'Diamond',
  'Master',
  'Grandmaster',
  'Void Overlord',
  'Divine',
  'More Leagues Soon'
];

const LEAGUE_QUICK_RULES: Record<string, { promo: string; safe: string; demo: string }> = {
  'Divine': { promo: '#1: Retains Godhood', safe: '', demo: '#2: Demote' },
  'Void Overlord': { promo: 'Top 1: Promote', safe: '2–7: Safe', demo: '8–10: Demote' },
  'Grandmaster': { promo: 'Top 3: Promote', safe: '4–20: Safe', demo: '21–30: Demote' },
  'Master': { promo: 'Top 7: Promote', safe: '8–30: Safe', demo: '31–50: Demote' },
  'Diamond': { promo: 'Top 15: Promote', safe: '16–80: Safe', demo: '81–150: Demote' },
  'Ruby': { promo: 'Top 20: Promote', safe: '21–100: Safe', demo: '101+: Demote' },
  'Emerald': { promo: 'Top 25: Promote', safe: '26–100: Safe', demo: '101+: Demote' },
  'Sapphire': { promo: 'Top 25: Promote', safe: '26–100: Safe', demo: '101+: Demote' },
  'Platinum': { promo: 'Top 30: Promote', safe: '31–100: Safe', demo: '101+: Demote' },
  'Gold': { promo: 'Top 40: Promote', safe: '41–120: Safe', demo: '121+: Demote' },
  'Silver': { promo: 'Top 50: Promote', safe: '51–150: Safe', demo: '151+: Demote' },
  'Bronze': { promo: 'Top 60: Promote', safe: '61+: Safe', demo: 'No Demote' },
  'More Leagues Soon': { promo: 'Expansion', safe: 'Higher Realms', demo: 'Coming Soon' }
};

const LEAGUE_TABLE_DATA = [
  { name: 'Divine', icon: '/icons/league_divine.png', capacity: '2 Seats', color: 'text-amber-300', promo: '', safe: 'Rank #1 (Godhood)', demo: 'Rank #2' },
  { name: 'Void Overlord', icon: '/icons/league_void_overlord.png', capacity: '10 Seats', color: 'text-rose-400', promo: 'Rank #1', safe: 'Ranks #2 – #7', demo: 'Ranks #8 – #10' },
  { name: 'Grandmaster', icon: '/icons/league_grandmaster_crest.png', capacity: '30 Seats', color: 'text-amber-300', promo: 'Top 3 (#1–#3)', safe: 'Ranks #4 – #20', demo: 'Ranks #21 – #30' },
  { name: 'Master', icon: '/icons/league_master_crest.png', capacity: '50 Seats', color: 'text-purple-300', promo: 'Top 7 (#1–#7)', safe: 'Ranks #8 – #30', demo: 'Ranks #31 – #50' },
  { name: 'Diamond', icon: '/icons/league_diamond.png', capacity: '150 Seats', color: 'text-cyan-300', promo: 'Top 15 (#1–#15)', safe: 'Ranks #16 – #80', demo: 'Ranks #81 – #150' },
  { name: 'Ruby', icon: '/icons/league_ruby_crest.png', capacity: '~250 Seats', color: 'text-red-400', promo: 'Top 20 (#1–#20)', safe: 'Ranks #21 – #100', demo: 'Ranks #101+' },
  { name: 'Emerald', icon: '/icons/league_emerald_crest.png', capacity: '~350 Seats', color: 'text-emerald-400', promo: 'Top 25 (#1–#25)', safe: 'Ranks #26 – #100', demo: 'Ranks #101+' },
  { name: 'Sapphire', icon: '/icons/league_sapphire.png?v=2', capacity: '~400 Seats', color: 'text-blue-400', promo: 'Top 25 (#1–#25)', safe: 'Ranks #26 – #100', demo: 'Ranks #101+' },
  { name: 'Platinum', icon: '/icons/league_platinum.png', capacity: '~500 Seats', color: 'text-indigo-300', promo: 'Top 30 (#1–#30)', safe: 'Ranks #31 – #100', demo: 'Ranks #101+' },
  { name: 'Gold', icon: '/icons/league_gold.png', capacity: 'Open Tier', color: 'text-yellow-400', promo: 'Top 40 (#1–#40)', safe: 'Ranks #41 – #120', demo: 'Ranks #121+' },
  { name: 'Silver', icon: '/icons/league_silver.png', capacity: 'Open Tier', color: 'text-gray-300', promo: 'Top 50 (#1–#50)', safe: 'Ranks #51 – #150', demo: 'Ranks #151+' },
  { name: 'Bronze', icon: '/icons/league_bronze.png', capacity: 'Open Tier', color: 'text-amber-400', promo: 'Top 60 (#1–#60)', safe: 'Ranks #61+', demo: '' }
];

const getSafeAvatarUrl = (url?: string) => {
  if (!url) return '/avatars/knight.webp';
  if (url.includes('mage')) return '/avatars/vampire.webp';
  if (url.includes('thief')) return '/avatars/rogue.webp';
  return url;
};

export const MobilePvpView: React.FC<MobilePvpViewProps> = ({
  onStartBattle,
  isMatching,
  setIsMatching,
  isModalOpen,
  setIsModalOpen,
  onNavigateToShop
}) => {
  const {
    profile,
    updateProfile,
    buyPvpTickets,
    leagueRewardsConfig,
    hasNewDefenseAttacks,
    markDefenseHistoryAsViewed,
    activateShield,
    setIsShardsShopOpen
  } = useGame();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'duels' | 'ladder' | 'rewards' | 'history'>('duels');
  const [selectedRewardLeague, setSelectedRewardLeague] = useState<string>(profile.pvpLeague || 'Bronze');
  const [viewingLeague, setViewingLeague] = useState<string>(profile.pvpLeague || 'Bronze');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [matchStatus, setMatchStatus] = useState('');
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [myOwnLeagueRank, setMyOwnLeagueRank] = useState<number | string>(1);

  // Modals
  const [isBuyTicketsModalOpen, setIsBuyTicketsModalOpen] = useState(false);
  const [isBuyingTickets, setIsBuyingTickets] = useState(false);
  const [isShieldModalOpen, setIsShieldModalOpen] = useState(false);
  const [isActivatingShield, setIsActivatingShield] = useState(false);
  const [shieldTimeLeft, setShieldTimeLeft] = useState<string | null>(null);
  const [isLeagueRulesModalOpen, setIsLeagueRulesModalOpen] = useState(false);

  const myLeague = profile.pvpLeague || 'Bronze';
  const myTickets = (profile.pvpEnergy !== undefined ? profile.pvpEnergy : 5) + (profile.pvpBonusTickets || 0);
  const pvpEnergyMax = profile.pvpEnergyMax || 5;

  const isMySubActive = Boolean(profile.subscriptionExpiresAt && Number(profile.subscriptionExpiresAt) > Date.now());
  const mySubTier = isMySubActive ? (profile.subscriptionTier || 'free') : 'free';

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
    } else if (name.startsWith('Sapphire')) {
      return {
        name: 'Sapphire',
        badge: '🔹',
        icon: '/icons/league_sapphire.png?v=2',
        color: 'text-blue-400 border-blue-500/30 bg-blue-950/20',
        glow: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]',
        accent: 'text-blue-400'
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
    } else if (name.startsWith('Void Overlord')) {
      return {
        name: 'Void Overlord',
        badge: '👑',
        icon: '/icons/league_void_overlord.png',
        color: 'text-rose-400 border-rose-500/40 bg-rose-950/30',
        glow: 'shadow-[0_0_25px_rgba(244,63,94,0.4)]',
        accent: 'text-rose-500'
      };
    } else if (name.startsWith('Divine')) {
      return {
        name: 'Divine',
        badge: '✨',
        icon: '/icons/league_divine.png',
        color: 'text-amber-200 border-amber-400/50 bg-gradient-to-r from-amber-950/60 via-yellow-950/40 to-black',
        glow: 'shadow-[0_0_30px_rgba(245,158,11,0.5)]',
        accent: 'text-amber-300'
      };
    } else {
      return {
        name: 'More Leagues Soon',
        badge: '🔒',
        icon: '',
        color: 'text-purple-300 border-purple-500/40 bg-purple-950/30',
        glow: 'shadow-[0_0_25px_rgba(168,85,247,0.4)]',
        accent: 'text-purple-300'
      };
    }
  };

  const league = getLeagueDetails(profile.pvpLeague || 'Bronze');

  // Shield countdown ticker
  useEffect(() => {
    const updateShieldTimer = () => {
      const until = profile.activeShieldUntil || profile.pvpShieldExpiresAt || 0;
      const diff = until - Date.now();
      if (diff <= 0) {
        setShieldTimeLeft(null);
      } else {
        const totalSec = Math.floor(diff / 1000);
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        setShieldTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      }
    };
    updateShieldTimer();
    const interval = setInterval(updateShieldTimer, 1000);
    return () => clearInterval(interval);
  }, [profile.activeShieldUntil, profile.pvpShieldExpiresAt]);

  // Daily UTC midnight countdown timer
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const nextRollover = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1,
        0, 0, 0, 0
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

  // Leaderboard fetcher
  const fetchLeaderboard = async (leagueName: string = viewingLeague, silent: boolean = false) => {
    if (leagueName === 'More Leagues Soon') {
      setIsLoadingLeaderboard(false);
      setLeaderboard([]);
      return;
    }
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

        if (leagueName === (profile.pvpLeague || 'Bronze')) {
          if (data.myRank !== undefined && data.myRank !== null) {
            setMyOwnLeagueRank(data.myRank);
          } else {
            const myIdx = list.findIndex((p: any) => 
              (profile.solanaAddress && p.walletAddress && p.walletAddress.toLowerCase() === profile.solanaAddress.toLowerCase()) ||
              (profile.username && p.username && p.username.trim().toLowerCase() === profile.username.trim().toLowerCase())
            );
            if (myIdx !== -1) {
              setMyOwnLeagueRank(myIdx + 1);
            }
          }
        }
      }
    } catch (err) {
      console.error('Leaderboard error:', err);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(viewingLeague);
  }, [viewingLeague]);

  useEffect(() => {
    if (activeTab === 'history') {
      markDefenseHistoryAsViewed();
    }
  }, [activeTab, markDefenseHistoryAsViewed]);

  const cycleLeague = (dir: 'prev' | 'next') => {
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
    const idx = LEAGUES.indexOf(selectedRewardLeague);
    if (dir === 'prev') {
      const prevIdx = idx > 0 ? idx - 1 : LEAGUES.length - 1;
      setSelectedRewardLeague(LEAGUES[prevIdx]);
    } else {
      const nextIdx = idx < LEAGUES.length - 1 ? idx + 1 : 0;
      setSelectedRewardLeague(LEAGUES[nextIdx]);
    }
  };

  // Prepare and start battle with an opponent
  const handleFight = async (opponent: any) => {
    if (profile.deck.length < 10) {
      toast("Your deck is incomplete! Select 10 cards in CARDS tab.", 'warning');
      return;
    }

    setIsMatching(true);
    setMatchStatus('Entering the Arena...');

    const opponentLP = opponent.lp !== undefined ? opponent.lp : (opponent.pvpLP !== undefined ? opponent.pvpLP : (opponent.rating || opponent.pvpRating || 0));

    const opponentEquippedList = (opponent.equippedList && opponent.equippedList.length > 0)
      ? opponent.equippedList
      : (opponent.equipped 
          ? Object.values(opponent.equipped).map((eqId: any) => (opponent.equipment || []).find((e: any) => e.id === eqId)).filter(Boolean)
          : (opponent.equipment || []));

    const opponentSetBonuses = calculateEquipmentSetBonuses(opponentEquippedList);
    const opponentDemiurge = opponentSetBonuses.find(s => s.setId === 'demiurge');

    let opponentEquipHealth = 0;
    let opponentDodge = 0;
    let opponentDelayReduction = 0;

    opponentEquippedList.forEach((eq: any) => {
      if (eq.bonusType === 'maxHealth') opponentEquipHealth += eq.bonusValue;
      if (eq.bonusType === 'dodge') opponentDodge += eq.bonusValue;
      if (eq.bonusType === 'delayReduction') opponentDelayReduction += eq.bonusValue;
      if (eq.secondaryBonusType === 'maxHealth') opponentEquipHealth += (eq.secondaryBonusValue || 0);
      if (eq.secondaryBonusType === 'dodge') opponentDodge += (eq.secondaryBonusValue || 0);
      if (eq.secondaryBonusType === 'delayReduction') opponentDelayReduction += (eq.secondaryBonusValue || 0);
    });

    if (opponentDemiurge) {
      opponentEquipHealth += opponentDemiurge.totalBonuses.maxHealth;
      opponentDodge += opponentDemiurge.totalBonuses.dodge;
      opponentDelayReduction += opponentDemiurge.totalBonuses.delayReduction;
    }

    const opponentLevel = opponent.level || 1;
    const opponentBaseHealth = opponent.heroMaxHealth || (30 + (opponentLevel - 1) * 2);
    const totalOpponentHealth = opponentBaseHealth + opponentEquipHealth;
    const opponentStartingMana = 1 + (opponentDemiurge?.totalBonuses.startingMana || 0);
    const opponentCreatureBuff = {
      atk: opponentDemiurge?.totalBonuses.creatureAtkBuff || 0,
      hp: opponentDemiurge?.totalBonuses.creatureHpBuff || 0
    };

    const opponentPayload = {
      opponentWalletAddress: opponent.walletAddress,
      opponentName: opponent.name || opponent.username,
      opponentRating: opponent.rating || opponent.pvpRating,
      opponentLP: opponentLP,
      opponentDeck: opponent.deck,
      opponentStance: opponent.stance || opponent.activeStance
    };

    const pvpStage: CampaignStage = {
      id: -1,
      name: `Arena: ${opponent.name || opponent.username}`,
      description: `Ranked PvP battle against ${opponent.name || opponent.username} [${opponentLP} 👑]`,
      energyCost: 1,
      goldReward: 50,
      dustReward: 25,
      shardsReward: 0,
      enemyHeroName: opponent.name || opponent.username,
      enemyHeroHealth: totalOpponentHealth,
      enemyHeroImage: getSafeAvatarUrl(opponent.avatarUrl),
      enemyDeck: opponent.deck || [],
      enemyStance: opponent.stance || opponent.activeStance,
      enemyTalents: opponent.talents,
      enemyLevel: opponentLevel,
      enemyEquipment: opponent.equipment || [],
      enemyEquipped: opponent.equipped || {},
      enemyDodgeChance: opponentDodge,
      enemyDelayReduction: opponentDelayReduction,
      enemyStartingMana: opponentStartingMana,
      enemyCreatureBuff: opponentCreatureBuff
    };

    try {
      setMatchStatus('Entering the Arena...');
      const success = await onStartBattle(pvpStage, 'pvp', opponentPayload);
      setIsMatching(false);
      if (success) {
        setIsModalOpen(false);
      }
    } catch {
      setIsMatching(false);
      toast('Connection error establishing PvP battle', 'error');
    }
  };

  // Quick matchmaking search
  const handleFindOpponent = async (spendShards: boolean = false, spendEnergy: boolean = false) => {
    if (profile.deck.length < 10) {
      toast("Your deck is incomplete! Select 10 cards in CARDS tab.", 'warning');
      return;
    }

    if (spendEnergy) {
      if (myTickets < 1) {
        toast('Not enough Arena Tickets! Purchase more in the Vault.', 'warning');
        setIsBuyTicketsModalOpen(true);
        return;
      }
    }

    if (spendShards) {
      if ((profile.darkShards || 0) < 5) {
        toast('Insufficient Dark Shards for re-roll!', 'warning');
        setIsShardsShopOpen?.(true);
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
        toast(data.error || 'Matchmaking error', 'error');
      }
    } catch {
      toast('Connection error establishing matchmaking session.', 'error');
    } finally {
      setIsMatching(false);
    }
  };

  // Cancel matchmaking
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
          toast('Matchmaking canceled. PvP Ticket refunded.', 'info');
        }
      }
    } catch {
      if (!silent) toast('Connection error canceling match.', 'error');
    } finally {
      if (!silent) setIsMatching(false);
    }
  };

  const activeOpponent = profile.activePvpOpponent;

  // Daily Sovereign won progress
  const todayUtc = new Date().toISOString().slice(0, 10);
  const wonToday = profile.lastSovereignsWonDate === todayUtc ? (profile.dailySovereignsWonToday || 0) : 0;
  const sovCap = mySubTier === 'ultra' ? 24 : 10;

  return (
    <div className="h-full w-full flex flex-col p-2 sm:p-3 select-none overflow-hidden pb-24">
      {/* 1. TOP HEADER HUD */}
      <div className="bg-[#131720]/95 border border-[#c5a880]/25 rounded-2xl p-2 sm:p-2.5 shadow-xl shrink-0 mb-2 space-y-1.5">
        {/* Row 1: Title, Peace Shield Status, Rules Button */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-amber-400" />
            <h2 className="font-display font-black text-xs sm:text-sm text-white tracking-widest uppercase text-shadow-gold">
              VOID ARENA
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Peace Shield Pill */}
            <div
              onClick={() => setIsShieldModalOpen(true)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[9px] font-mono font-bold cursor-pointer transition-all active:scale-95 ${
                shieldTimeLeft
                  ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                  : 'bg-black/50 border-white/10 text-gray-400 hover:text-white hover:border-purple-500/50'
              }`}
              title="Peace Shield Immunity Status"
            >
              {shieldTimeLeft ? (
                <>
                  <ShieldCheck className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span>{shieldTimeLeft}</span>
                </>
              ) : (
                <>
                  <Shield className="w-3 h-3 text-purple-400" />
                  <span className="text-purple-300">SHIELD OFF</span>
                </>
              )}
            </div>

            {/* Rules Button */}
            <button
              onClick={() => setIsLeagueRulesModalOpen(true)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-950/50 hover:bg-amber-900/50 border border-amber-500/40 text-amber-300 font-display font-black text-[9px] tracking-wider uppercase transition-all active:scale-95 cursor-pointer"
            >
              <Info className="w-3 h-3 text-amber-400" />
              <span>RULES</span>
            </button>
          </div>
        </div>

        {/* Row 2: 4 Jewel Stat Pills */}
        <div className="grid grid-cols-4 gap-1 sm:gap-1.5">
          {/* Crowns */}
          <div className="bg-black/60 border border-amber-500/30 rounded-xl p-1 text-center flex flex-col items-center justify-center">
            <span className="text-[7.5px] font-mono text-gray-400 uppercase font-bold leading-none">CROWNS</span>
            <div className="font-mono text-xs font-black text-amber-400 flex items-center justify-center gap-0.5 mt-0.5">
              <img src="/icons/crown.png" alt="" className="w-3.5 h-3.5 object-contain" />
              <span>{profile.pvpLP || 0}</span>
            </div>
          </div>

          {/* Tickets */}
          <div 
            onClick={() => setIsBuyTicketsModalOpen(true)}
            className="bg-black/60 border border-rose-500/35 hover:border-rose-400 rounded-xl p-1 text-center flex flex-col items-center justify-center cursor-pointer transition-all active:scale-95"
            title="Replenish Arena Tickets"
          >
            <span className="text-[7.5px] font-mono text-gray-400 uppercase font-bold leading-none">TICKETS</span>
            <div className="font-mono text-xs font-black text-rose-400 flex items-center justify-center gap-0.5 mt-0.5">
              <img src="/icons/ticket.png" alt="" className="w-3.5 h-3.5 object-contain" />
              <span>{myTickets}/{pvpEnergyMax}</span>
              <div className="w-3 h-3 rounded bg-rose-600 text-white flex items-center justify-center text-[9px] font-bold ml-0.5">
                +
              </div>
            </div>
          </div>

          {/* Daily SOV */}
          <div className="bg-black/60 border border-amber-500/25 rounded-xl p-1 text-center flex flex-col items-center justify-center">
            <span className="text-[7.5px] font-mono text-amber-400/90 uppercase font-bold leading-none">DAILY SOV</span>
            <div className="font-mono text-xs font-black text-amber-300 flex items-center justify-center gap-0.5 mt-0.5">
              <img src="/icons/icon_sovereign.webp" alt="" className="w-3.5 h-3.5 object-contain" />
              <span>{wonToday}/{sovCap}</span>
            </div>
          </div>

          {/* My League & Rank */}
          <div className={`bg-black/60 border rounded-xl p-1 text-center flex flex-col items-center justify-center ${
            mySubTier === 'ultra' ? 'border-purple-500/60 shadow-[0_0_8px_rgba(168,85,247,0.3)]' :
            mySubTier === 'premium' ? 'border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.3)]' :
            'border-white/10'
          }`}>
            <span className="text-[7.5px] font-mono text-gray-400 uppercase font-bold leading-none flex items-center gap-0.5">
              <span>RANK</span>
              {mySubTier === 'ultra' && <span>💎</span>}
              {mySubTier === 'premium' && <span>⚜️</span>}
            </span>
            <div className="font-mono text-xs font-black text-white flex items-center justify-center gap-1 mt-0.5 truncate">
              <img src={league.icon} alt="" className="w-3.5 h-3.5 object-contain shrink-0" />
              <span className={league.accent}>#{myOwnLeagueRank || 1}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION TABS (DUELS / LADDER / REWARDS / HISTORY) */}
      <div className="flex items-center gap-1 mb-2 shrink-0">
        <button
          onClick={() => setActiveTab('duels')}
          className={`flex-1 py-2 rounded-xl font-display text-[10px] font-black tracking-wider uppercase transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 ${
            activeTab === 'duels'
              ? 'bg-rose-950/90 border border-rose-500 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.35)]'
              : 'bg-black/50 border border-white/5 text-gray-400 hover:text-white'
          }`}
        >
          <Swords className="w-3.5 h-3.5 text-rose-400" />
          <span>DUELS</span>
        </button>

        <button
          onClick={() => setActiveTab('ladder')}
          className={`flex-1 py-2 rounded-xl font-display text-[10px] font-black tracking-wider uppercase transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 ${
            activeTab === 'ladder'
              ? 'bg-cyan-950/90 border border-cyan-500 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
              : 'bg-black/50 border border-white/5 text-gray-400 hover:text-white'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-cyan-400" />
          <span>LADDER</span>
        </button>

        <button
          onClick={() => setActiveTab('rewards')}
          className={`flex-1 py-2 rounded-xl font-display text-[10px] font-black tracking-wider uppercase transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 ${
            activeTab === 'rewards'
              ? 'bg-amber-950/90 border border-amber-500 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.35)]'
              : 'bg-black/50 border border-white/5 text-gray-400 hover:text-white'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>REWARDS</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('history');
            markDefenseHistoryAsViewed();
          }}
          className={`relative flex-1 py-2 rounded-xl font-display text-[10px] font-black tracking-wider uppercase transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 ${
            activeTab === 'history'
              ? 'bg-purple-950/90 border border-purple-500 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.35)]'
              : 'bg-black/50 border border-white/5 text-gray-400 hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5 text-purple-400" />
          <span>LOG</span>
          {hasNewDefenseAttacks && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute top-1 right-1.5" />
          )}
        </button>
      </div>

      {/* 3. TAB CONTENT */}
      <div className="flex-1 min-h-0 relative overflow-y-auto no-scrollbar">

        {/* TAB 1: DUELS */}
        {activeTab === 'duels' && (
          <div className="space-y-2.5">
            {/* Deck warning */}
            {profile.deck.length < 10 && (
              <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-2.5 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <p className="text-[10px] text-amber-200 leading-tight">
                  Deck incomplete ({profile.deck.length}/10). Select 10 cards in CARDS tab.
                </p>
              </div>
            )}

            {/* Duel Console Card */}
            <div className="bg-gradient-to-b from-[#181116] via-[#100b11] to-[#080509] border border-[#c5a880]/30 rounded-2xl p-3 shadow-xl relative overflow-hidden space-y-2.5">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-black/60 border border-rose-500/40 flex items-center justify-center p-1 shrink-0">
                    <img src="/icons/arena_duel_emblem.png" alt="" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-xs text-white uppercase tracking-wider text-shadow-gold">
                      RANKED DUEL ARENA
                    </h3>
                    <span className="text-[9px] font-mono text-gray-400 block">Season 1 Ladder</span>
                  </div>
                </div>

                {/* Peace Shield status */}
                <div 
                  onClick={() => setIsShieldModalOpen(true)}
                  className="flex items-center gap-1 bg-black/60 border border-white/10 px-2 py-1 rounded-lg cursor-pointer hover:border-purple-400/50"
                >
                  <img src="/icons/shield_indicator.png" alt="" className="w-3.5 h-3.5 object-contain" />
                  <span className="text-[9px] font-mono font-bold text-gray-300">
                    {shieldTimeLeft ? shieldTimeLeft : 'NO SHIELD'}
                  </span>
                </div>
              </div>

              {/* Victory vs Defeat Rewards Preview */}
              <div className="grid grid-cols-2 gap-2">
                {/* Win Spoils */}
                <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-2 space-y-1">
                  <span className="text-[8px] font-mono text-emerald-400 font-bold uppercase block tracking-wider">
                    VICTORY SPOILS (WIN)
                  </span>
                  <div className="grid grid-cols-2 gap-1 text-[9px] font-mono text-white">
                    <span className="flex items-center gap-0.5 text-amber-400">
                      +50 <img src="/icons/icon_gold.webp" alt="" className="w-2.5 h-2.5" />
                    </span>
                    <span className="flex items-center gap-0.5 text-cyan-400">
                      +25 <img src="/icons/icon_dust.webp" alt="" className="w-3 h-3" />
                    </span>
                    <span className="flex items-center gap-0.5 text-emerald-400">
                      +100 EXP
                    </span>
                    <span className="flex items-center gap-0.5 text-amber-300 font-bold">
                      +20 👑
                    </span>
                  </div>
                </div>

                {/* Loss Penalty */}
                <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-2 space-y-1">
                  <span className="text-[8px] font-mono text-rose-400 font-bold uppercase block tracking-wider">
                    DEFEAT PENALTY (LOSS)
                  </span>
                  <div className="grid grid-cols-2 gap-1 text-[9px] font-mono text-white">
                    <span className="flex items-center gap-0.5 text-rose-400 font-bold">
                      -15 👑
                    </span>
                    <span className="flex items-center gap-0.5 text-gray-400">
                      +20 <img src="/icons/icon_gold.webp" alt="" className="w-2.5 h-2.5 opacity-70" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Primary Action Button: FIND OPPONENT */}
              <button
                onClick={() => handleFindOpponent(false, true)}
                disabled={isMatching}
                className="w-full py-3 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:brightness-110 active:scale-98 rounded-xl font-display font-black text-xs text-white uppercase tracking-widest shadow-[0_0_20px_rgba(225,29,72,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-all border border-rose-400/50"
              >
                <Swords className="w-4 h-4 animate-pulse" />
                <span>FIND OPPONENT</span>
                <span className="flex items-center gap-1 bg-black/60 border border-rose-400/60 rounded-full px-2 py-0.5 font-mono text-xs text-rose-300 font-bold">
                  1 <img src="/icons/ticket.png" alt="" className="w-3.5 h-3.5 object-contain" />
                </span>
              </button>
            </div>

            {/* Featured Realm Rivals from League */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <span className="font-display font-bold text-[10px] text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-400" />
                  REALM RIVALS ({myLeague})
                </span>
                <button
                  onClick={() => fetchLeaderboard(myLeague)}
                  className="text-[9px] font-mono text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-2.5 h-2.5 ${isLoadingLeaderboard ? 'animate-spin' : ''}`} />
                  <span>REFRESH</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {leaderboard.length === 0 ? (
                  <div className="col-span-3 text-center py-4 bg-black/30 rounded-xl border border-white/5 text-[9px] font-mono text-gray-500">
                    No active challengers in queue. Tap FIND OPPONENT above!
                  </div>
                ) : (
                  leaderboard.slice(0, 3).map((opp, idx) => (
                    <div
                      key={idx}
                      className="bg-gradient-to-b from-[#181216] to-[#0a0709] border border-rose-500/25 rounded-xl p-2 flex flex-col justify-between shadow-md"
                    >
                      <div className="flex items-center gap-1.5">
                        <div className="w-7 h-7 rounded-full border border-amber-400/60 overflow-hidden bg-black shrink-0">
                          <img 
                            src={getSafeAvatarUrl(opp.avatarUrl)} 
                            alt="" 
                            className="w-full h-full object-cover" 
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/avatars/knight.webp'; }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-display font-bold text-[10px] text-white truncate leading-none">
                            {opp.name || opp.username || 'Summoner'}
                          </h4>
                          <span className="text-[8px] font-mono text-amber-400 block mt-0.5">
                            {opp.lp || opp.rating || 100} 👑
                          </span>
                        </div>
                      </div>

                      <div className="my-1.5 py-0.5 border-y border-white/5 flex items-center justify-between text-[8px] font-mono text-gray-400">
                        <span>Rank #{idx + 1}</span>
                        <span className="text-rose-300">{opp.deck?.length || 10} Cards</span>
                      </div>

                      <button
                        onClick={() => handleFight(opp)}
                        disabled={isMatching}
                        className="w-full py-1 bg-rose-600/80 hover:bg-rose-500 active:scale-95 text-white font-display font-black text-[8.5px] uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                      >
                        DUEL NOW
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LADDER (LEADERBOARD HALL) */}
        {activeTab === 'ladder' && (
          <div className="space-y-2">
            {/* League Navigator Carousel */}
            <div className="flex items-center justify-between bg-black/60 border border-white/10 rounded-2xl p-2 px-3 shadow-md">
              <button
                onClick={() => cycleLeague('prev')}
                className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-gray-300 flex items-center justify-center active:scale-95 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                <img 
                  src={getLeagueDetails(viewingLeague).icon} 
                  alt="" 
                  className="w-7 h-7 object-contain"
                />
                <div className="text-center">
                  <span className={`font-display font-black text-xs uppercase tracking-wider block ${getLeagueDetails(viewingLeague).accent}`}>
                    {viewingLeague === 'More Leagues Soon' ? 'EXPANSION' : `${getLeagueDetails(viewingLeague).name} LEAGUE`}
                  </span>
                  {(profile.pvpLeague || 'Bronze').toLowerCase() === viewingLeague.toLowerCase() && (
                    <span className="text-[8px] font-mono text-emerald-400 font-bold">
                      ⭐ Your League
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => cycleLeague('next')}
                className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-gray-300 flex items-center justify-center active:scale-95 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Rules Legend */}
            <div className="bg-black/40 border border-white/5 rounded-xl p-1.5 flex items-center justify-between text-[9px] font-mono text-gray-400">
              <span className="text-emerald-400 font-bold">
                ▲ {LEAGUE_QUICK_RULES[viewingLeague]?.promo || 'Promote'}
              </span>
              <span>
                🛡️ {LEAGUE_QUICK_RULES[viewingLeague]?.safe || 'Safe'}
              </span>
              <span className="text-rose-400 font-bold">
                ▼ {LEAGUE_QUICK_RULES[viewingLeague]?.demo || 'Demote'}
              </span>
            </div>

            {/* Leaderboard Table List */}
            <div className="space-y-1">
              {leaderboard.length === 0 ? (
                <div className="text-center py-8 text-gray-500 font-mono text-[10px]">
                  No summoners recorded in this league yet.
                </div>
              ) : (
                leaderboard.map((player, idx) => {
                  const rank = idx + 1;
                  const isSelf = (profile.solanaAddress && player.walletAddress && player.walletAddress.toLowerCase() === profile.solanaAddress.toLowerCase()) ||
                    (profile.username && player.username && player.username.trim().toLowerCase() === profile.username.trim().toLowerCase());
                  const subTier = player.subscriptionTier || 'free';

                  return (
                    <div
                      key={idx}
                      className={`p-2 rounded-xl border flex items-center justify-between transition-all ${
                        isSelf
                          ? 'bg-cyan-950/40 border-cyan-400/80 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                          : rank === 1
                          ? 'bg-amber-950/25 border-amber-500/40'
                          : 'bg-black/50 border-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-5 text-center font-mono font-bold text-xs ${
                          rank === 1 ? 'text-amber-400 font-black' :
                          rank === 2 ? 'text-gray-300 font-bold' :
                          rank === 3 ? 'text-amber-600 font-bold' :
                          'text-gray-500'
                        }`}>
                          #{rank}
                        </span>

                        <div className={`w-6 h-6 rounded-full overflow-hidden shrink-0 border ${
                          subTier === 'ultra' ? 'border-purple-400 ring-1 ring-purple-400' :
                          subTier === 'premium' ? 'border-amber-400 ring-1 ring-amber-400' :
                          'border-white/10'
                        }`}>
                          <img 
                            src={getSafeAvatarUrl(player.avatarUrl)} 
                            alt="" 
                            className="w-full h-full object-cover" 
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/avatars/knight.webp'; }}
                          />
                        </div>

                        <div className="min-w-0 flex items-center gap-1">
                          <span className={`font-display font-bold text-xs truncate max-w-[110px] ${
                            isSelf ? 'text-cyan-300 font-black' :
                            subTier === 'ultra' ? 'text-purple-300 font-black' :
                            subTier === 'premium' ? 'text-amber-300 font-black' :
                            'text-white'
                          }`}>
                            {player.username}
                          </span>
                          {subTier === 'ultra' && <span className="text-[9px]">💎</span>}
                          {subTier === 'premium' && <span className="text-[9px]">⚜️</span>}
                          {isSelf && (
                            <span className="text-[7.5px] font-mono bg-cyan-950 text-cyan-300 font-bold px-1 rounded border border-cyan-500/40">
                              YOU
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 font-mono text-xs font-bold text-amber-400 shrink-0">
                        <span>{player.pvpLP !== undefined ? player.pvpLP : (player.pvpRating || 0)}</span>
                        <img src="/icons/crown.png" alt="" className="w-3.5 h-3.5 object-contain" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 3: REWARDS (LEAGUE TRIBUTES) */}
        {activeTab === 'rewards' && (
          <div className="space-y-2">
            {/* Header Standing Banner */}
            <div className="bg-gradient-to-b from-[#1c140f] to-[#0a0705] border border-amber-500/30 rounded-2xl p-2.5 shadow-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={league.icon} alt="" className="w-8 h-8 object-contain" />
                <div>
                  <span className="text-[8px] font-mono text-gray-400 uppercase tracking-wider block">YOUR LEAGUE TRIBUTE</span>
                  <span className="font-display font-bold text-xs text-white">
                    {league.name} League • #{myOwnLeagueRank}
                  </span>
                </div>
              </div>

              <div className="text-right font-mono">
                <span className="text-[8px] text-gray-400 block uppercase">RESET IN</span>
                <span className="text-[10px] text-amber-300 font-bold">{formatCountdown(timeRemaining)}</span>
              </div>
            </div>

            {/* League Selector Carousel */}
            <div className="flex items-center justify-between bg-black/60 border border-white/10 rounded-2xl p-2 px-3 shadow-md">
              <button
                onClick={() => cycleRewardLeague('prev')}
                className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-gray-300 flex items-center justify-center active:scale-95 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                <img 
                  src={getLeagueDetails(selectedRewardLeague).icon} 
                  alt="" 
                  className="w-7 h-7 object-contain" 
                />
                <span className={`font-display font-black text-xs uppercase tracking-wider ${getLeagueDetails(selectedRewardLeague).accent}`}>
                  {selectedRewardLeague === 'More Leagues Soon' ? 'EXPANSION' : `${getLeagueDetails(selectedRewardLeague).name} LEAGUE`}
                </span>
              </div>

              <button
                onClick={() => cycleRewardLeague('next')}
                className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-gray-300 flex items-center justify-center active:scale-95 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Tier Brackets List */}
            {(() => {
              const rewardsList = leagueRewardsConfig && leagueRewardsConfig.length > 0 ? leagueRewardsConfig : ALL_LEAGUE_REWARDS;
              const currentTier = rewardsList.find((t: any) => t.name.toLowerCase() === selectedRewardLeague.toLowerCase()) || rewardsList[0];

              return (
                <div className="space-y-1.5">
                  {currentTier.brackets.map((bracket, bIdx) => (
                    <div
                      key={bIdx}
                      className={`p-2 rounded-xl border flex items-center justify-between ${
                        bracket.isPromotion ? 'bg-emerald-950/25 border-emerald-500/40' :
                        bracket.isDemotion ? 'bg-rose-950/25 border-rose-500/30' :
                        'bg-black/50 border-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="font-display font-bold text-xs text-white">
                          {bracket.rankLabel}
                        </span>
                        {bracket.isPromotion && (
                          <span className="text-[7.5px] font-mono font-black text-emerald-400 bg-emerald-950 px-1 rounded border border-emerald-500/30">
                            ▲ PROMOTES
                          </span>
                        )}
                        {bracket.isDemotion && (
                          <span className="text-[7.5px] font-mono font-black text-rose-400 bg-rose-950 px-1 rounded border border-rose-500/30">
                            ▼ DEMOTES
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold">
                        {bracket.sovereigns !== undefined && bracket.sovereigns > 0 && (
                          <div className="flex items-center gap-0.5 text-amber-300 bg-amber-950/60 border border-amber-500/30 px-1.5 py-0.5 rounded">
                            <img src="/icons/icon_sovereign.webp" alt="" className="w-3 h-3 object-contain" />
                            <span>+{bracket.sovereigns}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-0.5 text-amber-400">
                          <img src="/icons/icon_gold.webp" alt="" className="w-3 h-3 object-contain" />
                          <span>+{bracket.gold}</span>
                        </div>
                        <div className="flex items-center gap-0.5 text-cyan-300">
                          <img src="/icons/icon_dust.webp" alt="" className="w-3 h-3 object-contain" />
                          <span>+{bracket.dust}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 4: HISTORY (DEFENSE LOG) */}
        {activeTab === 'history' && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between pb-1 border-b border-white/10 px-1">
              <span className="font-display font-bold text-[10px] text-gray-400 uppercase">RECENT COMBAT LOGS</span>
              <span className="font-mono text-[9px] text-gray-500">
                {(profile.pvpHistory || []).length} Recorded
              </span>
            </div>

            {(profile.pvpHistory || []).length === 0 ? (
              <div className="text-center py-8 text-gray-500 font-mono text-[10px]">
                No combat records yet. Duel challengers to climb the ladder!
              </div>
            ) : (
              profile.pvpHistory.map((record: any, idx: number) => {
                const isWin = (record.winner === 'attacker' && !record.isDefense) || (record.winner === 'defender' && record.isDefense);
                const lpChange = record.isDefense 
                  ? (record.defenderLPChange !== undefined ? record.defenderLPChange : record.defenderRatingChange)
                  : (record.attackerLPChange !== undefined ? record.attackerLPChange : record.attackerRatingChange);
                const dateStr = new Date(record.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

                return (
                  <div
                    key={record.id || idx}
                    className={`p-2 rounded-xl border flex items-center justify-between ${
                      isWin ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-rose-950/20 border-rose-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${
                        record.isDefense ? 'bg-blue-950/60 border-blue-500/40 text-cyan-400' : 'bg-rose-950/60 border-rose-500/40 text-rose-400'
                      }`}>
                        {record.isDefense ? <Shield className="w-3.5 h-3.5" /> : <Swords className="w-3.5 h-3.5" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[7.5px] font-mono font-bold px-1 rounded uppercase ${
                            record.isDefense ? 'bg-blue-950 text-cyan-300' : 'bg-rose-950 text-rose-300'
                          }`}>
                            {record.isDefense ? 'DEFENSE' : 'OFFENSE'}
                          </span>
                          <span className="font-display font-bold text-xs text-white leading-tight">
                            vs {record.isDefense ? record.attackerName : record.defenderName}
                          </span>
                        </div>
                        <span className="text-[8px] font-mono text-gray-400 block mt-0.5">{dateStr}</span>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <span className={`text-xs font-black block ${lpChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {lpChange >= 0 ? `+${lpChange}` : lpChange} 👑
                      </span>
                      <span className={`text-[8px] font-display font-bold uppercase ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isWin ? 'VICTORY' : 'DEFEAT'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* 4. MODALS */}

      {/* Modal 1: Matchmaking Progress Overlay */}
      {isMatching && (
        <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 space-y-4 animate-fade-in">
          <div className="w-16 h-16 rounded-full border-4 border-rose-500 border-t-transparent animate-spin flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.4)]">
            <Swords className="w-7 h-7 text-rose-400 animate-pulse" />
          </div>
          <div className="text-center space-y-1 max-w-xs">
            <h3 className="font-display font-black text-base text-white tracking-widest uppercase">
              MATCHMAKING
            </h3>
            <p className="text-xs font-mono text-gray-400">{matchStatus || 'Searching realm challengers...'}</p>
          </div>
        </div>
      )}

      {/* Modal 2: Challenger Found Modal */}
      {isModalOpen && activeOpponent && (
        <div className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-b from-[#1a141b] via-[#100b11] to-[#080509] border-2 border-amber-500/40 rounded-3xl p-5 max-w-sm w-full text-center space-y-4 shadow-[0_0_40px_rgba(0,0,0,0.9)] relative overflow-hidden">
            <button
              onClick={() => handleCancelMatch()}
              className="absolute top-3 right-3 text-gray-400 hover:text-white w-7 h-7 flex items-center justify-center bg-black/70 rounded-full border border-white/10 cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center justify-center gap-1.5 border-b border-white/10 pb-2">
              <Swords className="w-4 h-4 text-rose-400" />
              <h3 className="font-display font-black text-xs text-white tracking-widest uppercase">
                CHALLENGER FOUND
              </h3>
            </div>

            <div className="flex flex-col items-center space-y-2.5">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl border-2 border-amber-400/60 p-0.5 bg-black/60 shadow-[0_0_20px_rgba(245,158,11,0.25)] overflow-hidden">
                  <img 
                    src={getSafeAvatarUrl(activeOpponent.avatarUrl)} 
                    alt="" 
                    className="w-full h-full rounded-xl object-cover" 
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/avatars/knight.webp'; }}
                  />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-500 text-black px-2 py-0.2 rounded-full font-mono text-[8px] font-black uppercase">
                  LVL {activeOpponent.level || 1}
                </div>
              </div>

              <div>
                <h4 className="font-display font-black text-base text-white">
                  {activeOpponent.name || activeOpponent.username}
                </h4>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-display font-bold uppercase border ${getLeagueDetails(activeOpponent.league || 'Bronze').color}`}>
                    {getLeagueDetails(activeOpponent.league || 'Bronze').name}
                  </span>
                  <span className="font-mono text-xs text-amber-300 font-bold bg-black/60 px-2 py-0.5 rounded-full border border-amber-500/30">
                    {activeOpponent.lp !== undefined ? activeOpponent.lp : (activeOpponent.rating || 0)} 👑
                  </span>
                </div>
              </div>

              {/* Combat Stance */}
              <div className="w-full bg-black/50 border border-white/10 rounded-xl py-1 px-2 flex items-center justify-center gap-2">
                <span className="text-[9px] font-mono text-gray-400 uppercase font-bold">STANCE:</span>
                <span className="font-display font-bold text-xs text-white flex items-center gap-1">
                  {renderStanceIcon(activeOpponent.stance || 'void_strike', 'w-3.5 h-3.5')}
                  <span>
                    {activeOpponent.stance === 'blood_aura' ? 'Blood Aura' : 
                     activeOpponent.stance === 'warlord_cry' ? "Warlord's Cry" : 'Void Strike'}
                  </span>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
              <button
                disabled={isMatching || (profile.darkShards || 0) < 5}
                onClick={() => handleFindOpponent(true, false)}
                className={`py-2.5 rounded-xl border font-display font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer active:scale-95 ${
                  (profile.darkShards || 0) < 5
                    ? 'border-zinc-800 bg-zinc-900/40 text-zinc-600'
                    : 'bg-red-950/80 border-rose-600/60 text-rose-100 hover:text-white'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>RE-ROLL</span>
                <span className="text-amber-400 font-mono text-xs">(5💎)</span>
              </button>

              <button
                onClick={() => handleFight(activeOpponent)}
                className="py-2.5 rounded-xl border-2 bg-gradient-to-r from-emerald-800 to-teal-800 border-emerald-400 text-white font-display font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                <Swords className="w-3.5 h-3.5" />
                <span>FIGHT</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Ticket Vault Modal */}
      {isBuyTicketsModalOpen && (
        <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 animate-fade-in">
          <div className="bg-[#120e14] border-2 border-amber-500/50 rounded-2xl max-w-sm w-full p-4 space-y-3 text-center shadow-2xl relative">
            <button 
              onClick={() => setIsBuyTicketsModalOpen(false)}
              className="absolute top-2.5 right-2.5 text-gray-400 hover:text-white w-7 h-7 flex items-center justify-center bg-black/70 rounded-full border border-white/10"
            >
              ✕
            </button>

            <div className="w-12 h-12 rounded-xl bg-rose-950/80 border border-rose-500 flex items-center justify-center mx-auto shadow-lg">
              <img src="/icons/ticket.png" alt="" className="w-8 h-8 object-contain" />
            </div>

            <div>
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
                ARENA TICKET VAULT
              </h3>
              <p className="font-sans text-[10px] text-gray-400 mt-0.5">
                Replenish Arena Tickets with Dark Shards to continue dueling.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-1 bg-black/60 border border-white/10 rounded-xl p-2 font-mono text-[9px] text-gray-300">
              <div>
                <span className="block text-gray-500">FREE</span>
                <span className="font-black text-rose-400">{profile.pvpEnergy !== undefined ? profile.pvpEnergy : 5}/5</span>
              </div>
              <div>
                <span className="block text-gray-500">RESERVE</span>
                <span className="font-black text-amber-300">+{profile.pvpBonusTickets || 0}</span>
              </div>
              <div>
                <span className="block text-gray-500">SHARDS</span>
                <span className="font-black text-amber-400">{profile.darkShards || 0}</span>
              </div>
            </div>

            {/* 3 Bundles */}
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { count: 1, cost: 12, label: 'Single', img: '/icons/arena_ticket_single.webp' },
                { count: 5, cost: 50, label: 'Gladiator', popular: true, img: '/icons/arena_ticket_stack.webp' },
                { count: 10, cost: 90, label: 'Warlord', img: '/icons/arena_ticket_deck_v2.webp' }
              ].map((pack) => (
                <div
                  key={pack.count}
                  className={`bg-black/50 border rounded-xl p-2 flex flex-col justify-between text-center relative ${
                    pack.popular ? 'border-amber-500/70 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'border-white/10'
                  }`}
                >
                  {pack.popular && (
                    <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[6.5px] font-mono font-black bg-amber-500 text-black px-1 rounded-full whitespace-nowrap">
                      POPULAR
                    </span>
                  )}
                  <div className="w-10 h-10 mx-auto mb-1">
                    <img src={pack.img} alt="" className="w-full h-full object-contain" />
                  </div>
                  <span className="font-display font-black text-xs text-white">+{pack.count}</span>
                  <button
                    onClick={async () => {
                      if ((profile.darkShards || 0) < pack.cost) {
                        setIsBuyTicketsModalOpen(false);
                        setIsShardsShopOpen?.(true);
                        toast('Insufficient Dark Shards! Opening Shop...', 'warning');
                        return;
                      }
                      setIsBuyingTickets(true);
                      const ok = await buyPvpTickets(pack.count);
                      setIsBuyingTickets(false);
                      if (ok) {
                        toast(`Arena Tickets (+${pack.count}) replenished!`, 'success');
                        setIsBuyTicketsModalOpen(false);
                      }
                    }}
                    disabled={isBuyingTickets}
                    className="mt-1.5 py-1 bg-amber-500 hover:bg-amber-400 text-black font-display font-black text-[9px] uppercase tracking-wider rounded-lg active:scale-95 cursor-pointer"
                  >
                    {pack.cost} 💎
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Peace Shield Chamber Modal */}
      {isShieldModalOpen && (
        <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 animate-fade-in">
          <div className="bg-gradient-to-b from-[#141822] to-[#07080d] border-2 border-emerald-500/40 rounded-3xl p-4 max-w-sm w-full space-y-3 shadow-2xl relative">
            <button 
              onClick={() => setIsShieldModalOpen(false)}
              className="absolute top-2.5 right-2.5 text-gray-400 hover:text-white w-7 h-7 flex items-center justify-center bg-black/70 rounded-full border border-white/10"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
              <img src="/icons/shield_indicator.png" alt="" className="w-6 h-6 object-contain" />
              <div>
                <h3 className="font-display font-bold text-xs text-white uppercase tracking-wider">
                  PEACE SHIELD CHAMBER
                </h3>
                <span className="text-[9px] font-mono text-emerald-400 font-bold block">
                  {shieldTimeLeft ? `Immunity Active: ${shieldTimeLeft}` : 'No Active Ward'}
                </span>
              </div>
            </div>

            {/* Inventory Shields */}
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { type: '3h' as const, name: '3-Hour', icon: '/icons/shield_3h.png' },
                { type: '6h' as const, name: '6-Hour', icon: '/icons/shield_6h.png' },
                { type: '12h' as const, name: '12-Hour', icon: '/icons/shield_12h.png' }
              ].map((item) => {
                const count = profile.shieldsInventory?.[item.type] || 0;
                const canActivate = count > 0 && !shieldTimeLeft && !isActivatingShield;

                return (
                  <div 
                    key={item.type}
                    className="bg-black/50 border border-white/10 rounded-xl p-2 flex flex-col items-center justify-between text-center"
                  >
                    <img src={item.icon} alt="" className="w-10 h-10 object-contain mb-1" />
                    <span className="font-display font-bold text-[10px] text-white block">{item.name}</span>
                    <span className="font-mono text-[9px] text-amber-300 block mb-1.5">{count} in Vault</span>
                    <button
                      onClick={async () => {
                        if (shieldTimeLeft) {
                          toast('A Peace Shield is already active!', 'warning');
                          return;
                        }
                        setIsActivatingShield(true);
                        try {
                          const res = await activateShield(item.type);
                          if (res.success) {
                            toast(res.message, 'success');
                          } else {
                            toast(res.message, 'error');
                          }
                        } catch {
                          toast('Activation failed', 'error');
                        } finally {
                          setIsActivatingShield(false);
                        }
                      }}
                      disabled={!canActivate}
                      className={`w-full py-1 rounded-lg font-display font-black text-[8.5px] uppercase tracking-wider transition-all ${
                        canActivate 
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-black active:scale-95 cursor-pointer' 
                          : 'bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed'
                      }`}
                    >
                      {isActivatingShield ? '...' : canActivate ? 'ACTIVATE' : 'NONE'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Buy in Shop Banner */}
            <div 
              onClick={() => {
                setIsShieldModalOpen(false);
                onNavigateToShop?.('shields');
              }}
              className="bg-purple-950/40 border border-purple-500/40 rounded-xl p-2.5 flex items-center justify-between cursor-pointer hover:border-purple-400 transition-all active:scale-98"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-purple-400" />
                <div className="text-left">
                  <span className="font-display font-black text-[10px] text-white uppercase block">
                    NEED MORE SHIELDS?
                  </span>
                  <span className="text-[8px] font-sans text-gray-400 block">
                    Purchase Aegis Wards with Dark Shards in Shop
                  </span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: League Hierarchy & Reset Rules Modal */}
      {isLeagueRulesModalOpen && (
        <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 animate-fade-in">
          <div className="bg-gradient-to-b from-[#1c1410] via-[#100c0a] to-[#080605] border-2 border-amber-500/50 rounded-2xl max-w-sm w-full p-4 space-y-3 shadow-2xl relative">
            <button 
              onClick={() => setIsLeagueRulesModalOpen(false)}
              className="absolute top-2.5 right-2.5 text-gray-400 hover:text-white w-7 h-7 flex items-center justify-center bg-black/70 rounded-full border border-white/10"
            >
              ✕
            </button>

            <div className="text-center space-y-1">
              <Trophy className="w-6 h-6 text-amber-400 mx-auto" />
              <h3 className="font-display font-black text-xs text-amber-300 uppercase tracking-wider">
                LEAGUE HIERARCHY & RESET RULES
              </h3>
              <p className="text-[9px] font-sans text-gray-300">
                Ladder resets daily at <strong className="text-amber-400 font-mono">00:00 UTC</strong>. Daily tributes delivered to Mailbox.
              </p>
            </div>

            <div className="divide-y divide-white/5 max-h-56 overflow-y-auto pr-0.5 border border-white/10 rounded-xl bg-black/50">
              {LEAGUE_TABLE_DATA.map((row) => (
                <div key={row.name} className="py-1.5 px-2 flex items-center justify-between text-[9px] font-mono">
                  <div className="flex items-center gap-1.5">
                    <img src={row.icon} alt="" className="w-4 h-4 object-contain" />
                    <span className={`font-display font-bold uppercase ${row.color}`}>
                      {row.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {row.promo && <span className="text-emerald-400 font-bold">▲ {row.promo}</span>}
                    {row.demo && <span className="text-rose-400 font-bold ml-1">▼ {row.demo}</span>}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsLeagueRulesModalOpen(false)}
              className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-display font-black text-xs uppercase tracking-wider active:scale-95 cursor-pointer"
            >
              UNDERSTOOD
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
