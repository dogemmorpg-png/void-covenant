import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { useToast } from '../../components/Toast';
import { CampaignStage } from '../../types';
import { Swords, Trophy, Shield, ShieldCheck, RefreshCw, Crown, History, Award, Plus, X } from 'lucide-react';
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
    hasNewDefenseAttacks,
    markDefenseHistoryAsViewed,
    setIsShardsShopOpen
  } = useGame();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'duels' | 'rewards' | 'history'>('duels');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [isBuyTicketsModalOpen, setIsBuyTicketsModalOpen] = useState(false);
  const [isBuyingTickets, setIsBuyingTickets] = useState(false);
  const [myOwnLeagueRank, setMyOwnLeagueRank] = useState<number | null>(null);

  const myLeague = profile.pvpLeague || 'Bronze';
  const myTickets = (profile.pvpEnergy !== undefined ? profile.pvpEnergy : 5) + (profile.pvpBonusTickets || 0);
  const isShieldActive = profile.pvpShieldExpiresAt && profile.pvpShieldExpiresAt > Date.now();

  // Fetch leaderboard
  const fetchLeaderboard = async (leagueName: string = myLeague) => {
    setIsLoadingLeaderboard(true);
    try {
      const token = localStorage.getItem('void_covenant_token');
      if (!token) return;

      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ league: leagueName })
      });
      if (res.ok) {
        const data = await res.json();
        const list = data.leaderboard || [];
        setLeaderboard(list);
        if (data.myRank !== undefined && data.myRank !== null) {
          setMyOwnLeagueRank(data.myRank);
        }
      }
    } catch (err) {
      console.error('Leaderboard error:', err);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(myLeague);
  }, [myLeague]);

  useEffect(() => {
    if (activeTab === 'history') {
      markDefenseHistoryAsViewed();
    }
  }, [activeTab, markDefenseHistoryAsViewed]);

  const handleStartDuelWithOpponent = async (opponent: any) => {
    if (profile.deck.length < 10) {
      toast("Deck incomplete! Select at least 10 cards in CARDS tab.", 'warning');
      return;
    }

    if (myTickets < 1) {
      toast("No Arena Tickets! Buy more or wait for daily reset.", 'warning');
      setIsBuyTicketsModalOpen(true);
      return;
    }

    setIsMatching(true);

    const opponentLP = opponent.lp !== undefined ? opponent.lp : (opponent.pvpLP !== undefined ? opponent.pvpLP : (opponent.rating || opponent.pvpRating || 0));
    const opponentEquippedList = opponent.equippedList || [];
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
    const totalOpponentHealth = (opponent.heroMaxHealth || (30 + (opponentLevel - 1) * 2)) + opponentEquipHealth;

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
      description: `Ranked PvP battle against ${opponent.name || opponent.username}`,
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
      enemyStartingMana: 1 + (opponentDemiurge?.totalBonuses.startingMana || 0),
      enemyCreatureBuff: {
        atk: opponentDemiurge?.totalBonuses.creatureAtkBuff || 0,
        hp: opponentDemiurge?.totalBonuses.creatureHpBuff || 0
      }
    };

    try {
      await onStartBattle(pvpStage, 'pvp', opponentPayload);
    } catch {
      toast('Connection error establishing PvP battle', 'error');
    } finally {
      setIsMatching(false);
    }
  };

  // Quick Matchmaking via server API
  const handleRandomMatchmaking = async () => {
    if (profile.deck.length < 10) {
      toast("Deck incomplete! Select at least 10 cards in CARDS tab.", 'warning');
      return;
    }

    if (myTickets < 1) {
      toast("No Arena Tickets! Buy more or wait for daily reset.", 'warning');
      setIsBuyTicketsModalOpen(true);
      return;
    }

    setIsMatching(true);
    try {
      const token = localStorage.getItem('void_covenant_token');
      if (!token) return;

      const res = await fetch('/api/matchmaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ spendShards: false, spendEnergy: true })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.opponent) {
          await handleStartDuelWithOpponent(data.opponent);
        } else {
          toast('No matched challenger found. Try again shortly.', 'warning');
        }
      } else {
        const err = await res.json().catch(() => ({}));
        toast(err.error || 'Matchmaking error', 'error');
      }
    } catch {
      toast('Connection error querying matchmaking', 'error');
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col p-1.5 sm:p-2 select-none overflow-hidden">
      {/* TOP STATUS STRIP (Compact single-line header) */}
      <div className="h-[36px] bg-[#11141a]/95 border border-white/10 rounded-xl px-2.5 flex items-center justify-between shadow-lg shrink-0 mb-1.5">
        {/* Crowns */}
        <div className="flex items-center gap-1">
          <img src="/icons/crown.png" alt="👑" className="w-4 h-4 object-contain brightness-110" />
          <span className="font-mono text-xs font-black text-amber-400 leading-none">
            {profile.pvpLP || 0}
          </span>
          <span className="text-[8px] font-mono text-gray-400 font-bold uppercase">CROWNS</span>
        </div>

        {/* Arena Tickets */}
        <div 
          onClick={() => setIsBuyTicketsModalOpen(true)}
          className="flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded-lg border border-red-500/30 cursor-pointer hover:border-red-400 transition-all active:scale-95"
        >
          <span className="text-[9px] font-mono text-gray-300 font-bold">TICKETS:</span>
          <span className="font-mono text-xs font-black text-red-400 leading-none">{myTickets}/5</span>
          <div className="w-3.5 h-3.5 rounded bg-red-600/80 text-white flex items-center justify-center text-[10px] font-bold">
            +
          </div>
        </div>

        {/* League & Rank */}
        <div className="flex items-center gap-1.5">
          <span className="font-display text-[10px] font-black text-amber-300 uppercase tracking-wide">
            {myLeague}
          </span>
          <span className="text-[9px] font-mono bg-white/10 px-1 rounded text-gray-300 font-bold">
            #{myOwnLeagueRank || 1}
          </span>
        </div>

        {/* Shield Status */}
        <div 
          onClick={() => onNavigateToShop?.('shields')}
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold cursor-pointer transition-all ${
            isShieldActive 
              ? 'bg-cyan-950/60 border border-cyan-500/50 text-cyan-300' 
              : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
          }`}
        >
          {isShieldActive ? <ShieldCheck className="w-3 h-3 text-cyan-400" /> : <Shield className="w-3 h-3" />}
          <span>{isShieldActive ? 'SHIELDED' : 'GET SHIELD'}</span>
        </div>
      </div>

      {/* NAVIGATION TABS (DUELS / REWARDS / HISTORY) */}
      <div className="flex items-center gap-1 mb-1.5 shrink-0">
        <button
          onClick={() => setActiveTab('duels')}
          className={`flex-1 py-1 rounded-lg font-display text-[10px] font-black tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'duels'
              ? 'bg-rose-950/80 border border-rose-500 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
              : 'bg-black/40 border border-white/5 text-gray-400 hover:text-white'
          }`}
        >
          <Swords className="w-3.5 h-3.5" />
          <span>DUELS</span>
        </button>

        <button
          onClick={() => setActiveTab('rewards')}
          className={`flex-1 py-1 rounded-lg font-display text-[10px] font-black tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'rewards'
              ? 'bg-amber-950/80 border border-amber-500 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
              : 'bg-black/40 border border-white/5 text-gray-400 hover:text-white'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>LEAGUE REWARDS</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`relative flex-1 py-1 rounded-lg font-display text-[10px] font-black tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'history'
              ? 'bg-purple-950/80 border border-purple-500 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
              : 'bg-black/40 border border-white/5 text-gray-400 hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>DEFENSE LOG</span>
          {hasNewDefenseAttacks && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute top-1 right-2" />
          )}
        </button>
      </div>

      {/* TAB CONTENT (Fills remaining height) */}
      <div className="flex-1 min-h-0 relative">
        {/* 1. DUELS TAB: Matchmaking & Challengers */}
        {activeTab === 'duels' && (
          <div className="h-full w-full flex flex-col justify-between gap-1.5">
            {/* Quick Matchmaking Big Button */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleRandomMatchmaking}
                disabled={isMatching}
                className="flex-1 py-2 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:brightness-110 text-white font-display font-black text-xs uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(225,29,72,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
              >
                <Swords className="w-4 h-4" />
                <span>{isMatching ? 'SEARCHING REALM...' : 'FIND MATCH (⚡ 1 TICKET)'}</span>
              </button>
              <button
                onClick={() => fetchLeaderboard(myLeague)}
                disabled={isLoadingLeaderboard}
                className="px-3 py-2 bg-black/60 border border-white/10 hover:border-white/30 rounded-xl text-gray-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1 cursor-pointer transition-all"
                title="Refresh Opponents"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLeaderboard ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Challengers Cards Grid (3 cards horizontally) */}
            <div className="flex-1 grid grid-cols-3 gap-2 min-h-0 overflow-y-auto no-scrollbar">
              {leaderboard.length === 0 ? (
                <div className="col-span-3 flex flex-col items-center justify-center h-full text-center bg-black/30 border border-white/5 rounded-xl p-4">
                  <Trophy className="w-8 h-8 text-amber-500/40 mb-1" />
                  <span className="font-display font-bold text-xs text-gray-400 uppercase tracking-wider">No challengers currently in queue</span>
                  <span className="font-mono text-[9px] text-gray-500 mt-0.5">Tap FIND MATCH above to duel against realm guardians!</span>
                </div>
              ) : (
                leaderboard.slice(0, 3).map((opp, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-b from-[#181116]/90 via-[#0d0a0d]/95 to-black border border-rose-500/25 rounded-xl p-2 flex flex-col justify-between shadow-md relative overflow-hidden"
                  >
                    {/* Top: Avatar & Name */}
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full border border-amber-400/60 overflow-hidden bg-black shrink-0">
                        <img 
                          src={getSafeAvatarUrl(opp.avatarUrl)} 
                          alt="" 
                          className="w-full h-full object-cover" 
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/avatars/knight.webp'; }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-display font-black text-xs text-white truncate leading-tight">
                          {opp.name || opp.username || 'Challenger'}
                        </h4>
                        <div className="flex items-center gap-1 text-[8.5px] font-mono text-amber-400">
                          <img src="/icons/crown.png" alt="" className="w-2.5 h-2.5 object-contain" />
                          <span>{opp.lp || opp.rating || 100} 👑</span>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Rank & Deck preview */}
                    <div className="my-1 py-1 border-y border-white/5 flex items-center justify-between text-[8px] font-mono text-gray-400">
                      <span>Rank #{idx + 1}</span>
                      <span className="text-rose-400 font-bold">{opp.deck?.length || 10} Cards</span>
                    </div>

                    {/* Bottom: Attack Button */}
                    <button
                      onClick={() => handleStartDuelWithOpponent(opp)}
                      disabled={isMatching}
                      className="w-full py-1 bg-gradient-to-r from-rose-600 to-red-700 hover:brightness-110 text-white font-display font-black text-[9px] tracking-wider uppercase rounded-lg shadow-sm flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                    >
                      <Swords className="w-3 h-3" />
                      <span>DUEL NOW</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 2. REWARDS TAB: League Hierarchy & Daily Payouts */}
        {activeTab === 'rewards' && (
          <div className="h-full w-full overflow-y-auto no-scrollbar bg-black/40 border border-white/10 rounded-xl p-2 space-y-1.5">
            <div className="flex items-center justify-between pb-1 border-b border-white/10">
              <span className="font-display font-bold text-xs text-amber-300 uppercase">Season League Rewards</span>
              <span className="font-mono text-[9px] text-gray-400">Resets daily at 00:00 UTC</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {ALL_LEAGUE_REWARDS.map((l) => (
                <div 
                  key={l.leagueName}
                  className={`p-1.5 rounded-lg border flex flex-col justify-between ${
                    l.leagueName === myLeague 
                      ? 'bg-amber-950/40 border-amber-400/80 shadow-[0_0_10px_rgba(245,158,11,0.2)]' 
                      : 'bg-black/50 border-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-[10px] text-white uppercase">{l.leagueName}</span>
                    {l.leagueName === myLeague && (
                      <span className="text-[7.5px] font-mono bg-amber-500 text-black font-black px-1 rounded">YOU</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1 font-mono text-[9px] text-amber-400 font-bold">
                    <img src="/icons/icon_sovereign.webp" alt="" className="w-3 h-3 object-contain" />
                    <span>+{l.rewardBrackets?.[0]?.sovereignsReward || 0} SOV/day</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. DEFENSE LOG TAB */}
        {activeTab === 'history' && (
          <div className="h-full w-full overflow-y-auto no-scrollbar bg-black/40 border border-white/10 rounded-xl p-2 space-y-1.5">
            <span className="font-display font-bold text-xs text-purple-300 uppercase block pb-1 border-b border-white/10">
              Recent Defense Battles
            </span>
            {(profile.pvpHistory || []).length === 0 ? (
              <div className="text-center py-6 text-gray-500 font-mono text-[10px]">
                No defense battles recorded yet.
              </div>
            ) : (
              (profile.pvpHistory || []).slice(0, 8).map((h, i) => {
                const isVictory = h.result === 'victory';
                return (
                  <div 
                    key={i}
                    className={`p-1.5 rounded-lg border flex items-center justify-between text-xs ${
                      isVictory ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' : 'bg-red-950/20 border-red-500/30 text-red-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{isVictory ? '🛡️ WIN' : '💀 LOSS'}</span>
                      <div>
                        <span className="font-display font-bold text-white text-[11px] block leading-none">
                          vs {h.attackerName || 'Unknown Duelist'}
                        </span>
                        <span className="text-[8px] font-mono text-gray-400">
                          {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <div className="font-mono text-[10px] font-bold">
                      {isVictory ? `+${h.lpDelta || 10} 👑` : `-${h.lpDelta || 10} 👑`}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Buy Tickets Modal */}
      {isBuyTicketsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-[#0f0b08] border-2 border-red-500/50 rounded-2xl max-w-sm w-full p-4 space-y-3 text-center shadow-2xl relative">
            <button 
              onClick={() => setIsBuyTicketsModalOpen(false)}
              className="absolute top-2.5 right-2.5 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-10 h-10 rounded-full bg-red-950/60 border border-red-500 flex items-center justify-center mx-auto shadow-lg">
              <Swords className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">Replenish Arena Tickets</h3>
              <p className="font-sans text-[10px] text-gray-400 mt-0.5">
                Restore 5 Arena Tickets for 10 Dark Shards to continue ranking up.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 bg-black/50 py-1.5 rounded-lg font-mono text-xs text-rose-300">
              <img src="/icons/icon_shards.webp" alt="" className="w-4 h-4 object-contain" />
              <span>Cost: 10 Dark Shards (Have: {profile.darkShards || 0})</span>
            </div>
            <button
              onClick={async () => {
                if ((profile.darkShards || 0) < 10) {
                  setIsBuyTicketsModalOpen(false);
                  setIsShardsShopOpen(true);
                  toast('Insufficient Dark Shards! Opening Shop...', 'warning');
                  return;
                }
                setIsBuyingTickets(true);
                const success = await buyPvpTickets();
                setIsBuyingTickets(false);
                if (success) {
                  toast('Arena Tickets restored (+5)!', 'success');
                  setIsBuyTicketsModalOpen(false);
                } else {
                  toast('Failed to buy tickets', 'error');
                }
              }}
              disabled={isBuyingTickets}
              className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-display font-black text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer"
            >
              {isBuyingTickets ? 'Purchasing...' : 'Confirm Refill (+5 Tickets)'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
