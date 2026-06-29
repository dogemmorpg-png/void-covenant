import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useToast } from './Toast';
import { CARD_TEMPLATES } from '../data/cards';
import { CampaignStage } from '../types';
import { Swords, Award, Zap, Trophy, Shield, Search, RefreshCw, AlertTriangle, Droplet } from 'lucide-react';

interface PvpArenaViewProps {
  onStartBattle: (stage: CampaignStage, type: 'campaign' | 'pvp') => void;
}

interface LeaderboardEntry {
  name: string;
  rating: number;
  isPlayer?: boolean;
}

const STATIC_LEADERBOARD: LeaderboardEntry[] = [
  { name: 'Spectre_Lord', rating: 3120 },
  { name: 'Archon_Dark', rating: 2850 },
  { name: 'VoidReaper', rating: 2620 },
  { name: 'DoomBringer', rating: 2480 },
  { name: 'HexMage', rating: 2250 },
  { name: 'Cultist_Master', rating: 1950 },
  { name: 'Blood_Torn', rating: 1550 },
  { name: 'Shadow_Whisper', rating: 1200 },
  { name: 'GloomWielder', rating: 850 },
  { name: 'Apprentice_V', rating: 450 },
];

export const PvpArenaView: React.FC<PvpArenaViewProps> = ({ onStartBattle }) => {
  const { profile, usePvpEnergy } = useGame();
  const toast = useToast();
  const [isMatching, setIsMatching] = useState(false);
  const [matchStatus, setMatchStatus] = useState('');
  const [searchTimer, setSearchTimer] = useState(0);

  // League calculation helper
  const getLeagueDetails = (rating: number) => {
    if (rating < 200) {
      return {
        name: 'Recruit League',
        color: 'text-gray-400 border-gray-700 bg-gray-950/40',
        glow: 'shadow-[0_0_15px_rgba(156,163,175,0.15)]',
        accent: 'text-gray-500'
      };
    } else if (rating < 500) {
      return {
        name: 'Shadow League',
        color: 'text-indigo-400 border-indigo-900/50 bg-indigo-950/25',
        glow: 'shadow-[0_0_15px_rgba(129,140,248,0.25)]',
        accent: 'text-indigo-500'
      };
    } else if (rating < 1000) {
      return {
        name: 'Blood League',
        color: 'text-rose-400 border-rose-950/50 bg-rose-950/25',
        glow: 'shadow-[0_0_15px_rgba(244,63,94,0.25)]',
        accent: 'text-rose-500'
      };
    } else if (rating < 2000) {
      return {
        name: 'Covenant League',
        color: 'text-[#ebd09b] border-[#c5a880]/30 bg-[#ebd09b]/5',
        glow: 'shadow-[0_0_15px_rgba(235,208,155,0.25)]',
        accent: 'text-[#c5a880]'
      };
    } else {
      return {
        name: 'Void Magister',
        color: 'text-cyan-400 border-cyan-900 bg-cyan-950/25',
        glow: 'shadow-[0_0_20px_rgba(34,211,238,0.35)]',
        accent: 'text-cyan-400'
      };
    }
  };

  const league = getLeagueDetails(profile.pvpRating);

  // Dynamic Leaderboard sorting
  const getSortedLeaderboard = (): (LeaderboardEntry & { rank: number })[] => {
    const list: LeaderboardEntry[] = [
      ...STATIC_LEADERBOARD,
      { name: 'You (Covenant Summoner)', rating: profile.pvpRating, isPlayer: true }
    ];
    return list
      .sort((a, b) => b.rating - a.rating)
      .map((entry, idx) => ({ ...entry, rank: idx + 1 }));
  };

  const sortedLeaderboard = getSortedLeaderboard();
  const playerRank = sortedLeaderboard.find(e => e.isPlayer)?.rank || 11;

  // Search logic simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isMatching) {
      interval = setInterval(() => {
        setSearchTimer(t => t + 1);
      }, 1000);
    } else {
      setSearchTimer(0);
    }
    return () => clearInterval(interval);
  }, [isMatching]);

  useEffect(() => {
    if (!isMatching) return;

    if (searchTimer === 0) {
      setMatchStatus('Initializing combat encryption...');
    } else if (searchTimer === 1) {
      setMatchStatus('Searching for summoner in range ' + (profile.pvpRating - 100) + '..' + (profile.pvpRating + 100) + ' MMR...');
    } else if (searchTimer === 2) {
      setMatchStatus('Establishing stable astral connection...');
    } else if (searchTimer >= 3) {
      // Find opponent & launch
      setIsMatching(false);
      launchPvpBattle();
    }
  }, [searchTimer, isMatching]);

  const handleStartMatchmaking = () => {
    if (profile.deck.length < 5) {
      toast("Your deck is incomplete! Go to the 'SANCTUARY' tab and select exactly 5 cards for battle.", 'warning');
      return;
    }

    if (profile.pvpEnergy < 1) {
      toast('Not enough PvP Energy! It restores automatically (1 per 15 mins).', 'warning');
      return;
    }

    setIsMatching(true);
  };

  const launchPvpBattle = () => {
    // Consume 1 energy
    if (!usePvpEnergy(1)) return;

    // Names for simulated PvP enemies
    const enemyNames = [
      'Lilith_Gloom', 'Warlock_Eldritch', 'Covenant_Slayer', 'Spectre_X',
      'Blood_Priestess', 'Void_Stalker', 'Acheron_Cultist', 'Shadow_Phantom',
      'Demon_Aura', 'Soul_Weaver'
    ];
    const enemyName = enemyNames[Math.floor(Math.random() * enemyNames.length)];

    // Opponent rating near player's rating
    const variance = Math.floor(Math.random() * 61) - 30; // -30 to +30
    const enemyRating = Math.max(100, profile.pvpRating + variance);

    // Generate opponent deck (5 random card templates scaled up slightly if high MMR)
    const enemyDeck = Array.from({ length: 5 }, () => {
      const randomTemplate = CARD_TEMPLATES[Math.floor(Math.random() * CARD_TEMPLATES.length)];
      
      // Scale attributes with rating
      const mmrMultiplier = 1 + (enemyRating - 100) * 0.0003;
      const scaledHealth = Math.round(randomTemplate.health * mmrMultiplier);
      return {
        baseId: randomTemplate.baseId,
        name: randomTemplate.name,
        tier: randomTemplate.tier,
        attack: Math.round(randomTemplate.attack * mmrMultiplier),
        health: scaledHealth,
        maxHealth: scaledHealth,
        delay: randomTemplate.delay,
        skills: JSON.parse(JSON.stringify(randomTemplate.skills)),
        image: randomTemplate.image,
        color: randomTemplate.color,
        xp: 0,
        maxXp: 100,
        level: 1 + Math.min(4, Math.floor(enemyRating / 400))
      };
    });

    // Create a special PvP stage
    const pvpStage: CampaignStage = {
      id: -1, // PvP Special indicator
      name: `Arena: ${enemyName}`,
      description: `Ranked PvP battle for Covenant glory and rewards. Opponent: ${enemyName} [${enemyRating} MMR]`,
      energyCost: 1,
      goldReward: 300 + Math.floor(profile.pvpRating / 4),
      dustReward: 30 + Math.floor(profile.pvpRating / 20),
      shardsReward: Math.random() < 0.35 ? 3 : 0, // 35% chance to win dark shards
      enemyHeroName: enemyName,
      enemyHeroHealth: 30 + Math.floor(enemyRating / 80),
      enemyHeroImage: 'swords',
      enemyDeck: enemyDeck
    };

    // Launch battle
    onStartBattle(pvpStage, 'pvp');
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      
      {/* Search HUD / Matchmaking screen */}
      {isMatching && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-6 space-y-6">
          <div className="w-24 h-24 rounded-full border-4 border-[#ebd09b] border-t-transparent animate-spin flex items-center justify-center shadow-[0_0_25px_rgba(235,208,155,0.2)]">
            <Swords className="w-10 h-10 text-[#ebd09b] animate-pulse" />
          </div>
          
          <div className="text-center space-y-2 max-w-sm">
            <h3 className="font-display font-black text-xl text-[#ebd09b] tracking-widest uppercase animate-pulse">MATCHMAKING</h3>
            <p className="text-sm font-mono text-cyan-400 font-bold">{matchStatus}</p>
            <p className="text-[10px] font-mono text-gray-500">Elapsed seconds: {searchTimer}s</p>
          </div>

          <button
            onClick={() => setIsMatching(false)}
            className="border border-[#dd2c40]/40 text-[#dd2c40] bg-[#4e0707]/20 hover:bg-[#dd2c40]/10 font-mono text-xs font-bold py-2 px-6 rounded-lg transition-all tracking-widest uppercase cursor-pointer"
          >
            CANCEL SEARCH
          </button>
        </div>
      )}

      {/* Main Header */}
      <div className="bg-[#151a21] border border-[#c5a880]/20 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/10 via-transparent to-[#151a21] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          
          {/* Title & League Description */}
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <Trophy className="w-6 h-6 text-[#ebd09b] animate-bounce" />
              <h2 className="font-display font-black text-xl md:text-2xl text-white tracking-widest text-shadow-gold">
                VOID ARENA
              </h2>
            </div>
            <p className="text-xs text-gray-400 font-sans max-w-xl">
              Battle other dark summoners for a place at the top of the Void. Each victory increases your MMR rating and brings you closer to legendary status.
            </p>
          </div>

          {/* Player stats box */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-black/40 border border-[#c5a880]/10 rounded-xl p-4 w-full md:w-auto">
            {/* Rating display */}
            <div className="text-center px-4">
              <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest font-bold">YOUR RATING</span>
              <div className="font-mono text-2xl font-black text-[#ebd09b] flex items-center justify-center gap-1.5 mt-0.5">
                <Award className="w-5 h-5 text-[#ebd09b]" />
                {profile.pvpRating} <span className="text-xs text-gray-500">MMR</span>
              </div>
            </div>

            {/* League Badge */}
            <div className={`px-4 py-2 border rounded-xl text-center font-display font-bold text-xs uppercase tracking-widest ${league.color} ${league.glow}`}>
              {league.name}
            </div>

            {/* Global Position */}
            <div className="text-center px-4">
              <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest font-bold">TOP RANK</span>
              <div className="font-mono text-lg font-black text-white mt-0.5">
                #{playerRank}
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Play Panel */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Queue Card */}
          <div className="bg-[#151a21] border border-cyan-900/35 rounded-2xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl pointer-events-none" />
            
            <div className="space-y-6">
              <h3 className="font-display font-bold text-base text-white tracking-widest border-b border-gray-900 pb-3 flex items-center gap-2">
                <Search className="w-4 h-4 text-cyan-400" /> RANKED QUEUE
              </h3>

              {/* Energy display */}
              <div className="grid grid-cols-1 gap-4">
                
                <div className="bg-[#0b0c10] border border-cyan-950/50 p-4 rounded-xl flex items-center gap-4 shadow-inner">
                  <div className="w-10 h-10 rounded-full bg-cyan-950/40 border border-cyan-500/35 flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_8px_rgba(16,185,129,0.4)]"><img src="/icons/icon_energy.png" alt="Energy" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-8 h-8 object-contain " /></div>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block font-bold">PvP Energy</span>
                    <span className="font-mono font-bold text-cyan-400 text-lg">
                      {profile.pvpEnergy}/{profile.pvpEnergyMax}
                    </span>
                    <span className="text-[9px] text-gray-400 block font-mono mt-0.5">
                      1 pt restores every 15 mins
                    </span>
                  </div>
                </div>

              </div>

              {/* Deck quality check */}
              {profile.deck.length < 5 ? (
                <div className="bg-amber-950/15 border border-amber-500/35 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-display font-bold text-xs text-amber-300">DECK NOT READY</h5>
                    <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                      You have {profile.deck.length}/5 cards in your battle deck. Please assemble a full deck of 5 creatures in the <strong>SANCTUARY</strong> tab before entering the Void Arena.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-950/15 border border-emerald-500/35 rounded-xl p-4 flex items-start gap-3">
                  <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-display font-bold text-xs text-emerald-300">BATTLE DECK READY</h5>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Your squad is fully assembled (5/5 cards) and ready for battle. All fusion skills and stats will be active in the arena!
                    </p>
                  </div>
                </div>
              )}

              {/* Reward Preview */}
              <div className="bg-black/35 rounded-xl p-4 border border-gray-900 space-y-2">
                <span className="text-[10px] font-mono text-gray-500 tracking-widest uppercase font-bold block">EXPECTED VICTORY REWARDS</span>
                <div className="flex flex-wrap gap-4 font-mono text-xs">
                  <div className="bg-black/60 px-3 py-1.5 rounded-lg border border-yellow-950/50">
                    <span className="text-yellow-500 font-bold">+{300 + Math.floor(profile.pvpRating / 4)}<img src="/icons/icon_gold.png" alt="Gold" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" /></span> <span className="text-gray-500 text-[10px]">Gold</span>
                  </div>
                  <div className="bg-black/60 px-3 py-1.5 rounded-lg border border-cyan-950/50">
                    <span className="text-cyan-400 font-bold">+{30 + Math.floor(profile.pvpRating / 20)}<img src="/icons/icon_dust.png" alt="Dust" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" /></span> <span className="text-gray-500 text-[10px]">Dark Dust</span>
                  </div>
                  <div className="bg-black/60 px-3 py-1.5 rounded-lg border border-purple-950/50">
                    <span className="text-purple-400 font-bold">+50 BP <img src="/icons/icon_pass.png" alt="Pass" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1" /></span> <span className="text-gray-500 text-[10px]">Dark Pass</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Launch Matchmaker Button */}
            <div className="mt-8 pt-4 border-t border-gray-900">
              <button
                disabled={profile.deck.length < 5 || profile.pvpEnergy < 1}
                onClick={handleStartMatchmaking}
                className={`w-full py-4.5 px-6 rounded-xl font-display font-black tracking-widest flex items-center justify-center gap-2.5 shadow-lg text-sm transition-all relative group cursor-pointer ${
                  profile.deck.length < 5 || profile.pvpEnergy < 1
                    ? 'bg-gray-800/40 text-gray-500 border border-gray-800/55 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-900 to-indigo-900 hover:from-cyan-800 hover:to-indigo-800 border border-cyan-500/50 text-white hover:scale-[1.01] active:scale-[0.99] shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:shadow-[0_0_25px_rgba(6,182,212,0.3)]'
                }`}
              >
                <Swords className={`w-5 h-5 ${profile.deck.length < 5 || profile.pvpEnergy < 1 ? '' : 'group-hover:animate-spin-slow'}`} />
                MATCHMAKING
              </button>
              <p className="text-gray-400 text-sm max-w-sm mt-4 text-center">
                Entry cost: <span className="text-cyan-400 font-bold">1 PvP Energy</span>. 
                Defeat penalty: <span className="text-red-400 font-bold">-15 MMR</span>.
              </p>
            </div>

          </div>

        </div>

        {/* Dynamic Leaderboard Sidebar */}
        <div className="bg-[#151a21] border border-[#c5a880]/15 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-display font-bold text-sm text-white tracking-widest border-b border-gray-900 pb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#ebd09b]" /> HALL OF FAME
            </h3>
            
            <p className="text-xs text-gray-400 mt-2">
              Rankings of the top Void Covenant summoners. Win in PvP to climb the ladder!
            </p>

            <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
              {sortedLeaderboard.map((player) => (
                <div
                  key={player.name}
                  className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-mono transition-all ${
                    player.isPlayer
                      ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-400 font-bold shadow-[0_0_10px_rgba(34,211,238,0.1)]'
                      : 'bg-black/30 border-gray-950 text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-5 text-center font-bold font-mono text-[10px] ${
                      player.rank === 1 ? 'text-yellow-400' :
                      player.rank === 2 ? 'text-gray-400' :
                      player.rank === 3 ? 'text-amber-600' : 'text-gray-600'
                    }`}>
                      #{player.rank}
                    </span>
                    <span className="truncate max-w-[120px] md:max-w-[140px]">{player.name}</span>
                  </div>
                  <span className={`font-bold ${player.isPlayer ? 'text-cyan-400' : 'text-[#ebd09b]'}`}>
                    {player.rating} MMR
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-900 pt-3 mt-4 text-center">
            <span className="text-[9px] text-gray-500 font-mono flex items-center justify-center gap-1">
              <RefreshCw className="w-3 h-3 text-cyan-500 animate-spin-slow" /> Updated in real-time
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};
