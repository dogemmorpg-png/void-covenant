export interface LeagueRewardBracket {
  rankLabel: string;
  rankBadge?: string;
  sovereigns?: number;
  gold: number;
  dust: number;
  isPromotion?: boolean;
  isSafe?: boolean;
  isDemotion?: boolean;
}

export interface LeagueTierRewards {
  name: string;
  badge: string;
  icon: string;
  tierIndex: number;
  color?: string;
  accent?: string;
  border?: string;
  bgGradient?: string;
  summary?: string;
  promotionZone?: string;
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
    summary: 'The apex of realm domination. Highest tributes in Blood Sovereigns.',
    promotionZone: 'Crown Pinnacle (No Demotions)',
    brackets: [
      { rankLabel: 'Rank #1 Sovereign', rankBadge: '🥇 Supreme Champion', sovereigns: 600, gold: 7500, dust: 750 },
      { rankLabel: 'Ranks #2 – #3', rankBadge: '🥈 High Council', sovereigns: 350, gold: 4500, dust: 450 },
      { rankLabel: 'Ranks #4 – #10', rankBadge: '🥉 Void Lords', sovereigns: 180, gold: 3000, dust: 300 },
      { rankLabel: 'Ranks #11 – #20', rankBadge: '⚔️ Overlord Guard', sovereigns: 100, gold: 1500, dust: 150 },
      { rankLabel: 'Ranks #21+', rankBadge: '🛡️ Overlords Safe', sovereigns: 40, gold: 800, dust: 80, isSafe: true }
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
      { rankLabel: 'Ranks #1 – #5', rankBadge: '👑 Grand Sovereign', sovereigns: 75, gold: 2500, dust: 250, isPromotion: true },
      { rankLabel: 'Ranks #6 – #20', rankBadge: '⚔️ Imperial Master', sovereigns: 40, gold: 1500, dust: 150, isPromotion: true },
      { rankLabel: 'Ranks #21 – #100', rankBadge: '🛡️ Grandmaster Haven', sovereigns: 20, gold: 850, dust: 85, isSafe: true },
      { rankLabel: 'Ranks #101+', rankBadge: '🔻 Demotion Zone', sovereigns: 20, gold: 850, dust: 85, isDemotion: true }
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
      { rankLabel: 'Ranks #1 – #10', rankBadge: '⚔️ Master Warlord', sovereigns: 30, gold: 1800, dust: 180, isPromotion: true },
      { rankLabel: 'Ranks #11 – #20', rankBadge: '▲ Master Vanguard', sovereigns: 15, gold: 750, dust: 75, isPromotion: true },
      { rankLabel: 'Ranks #21 – #100', rankBadge: '🛡️ Master Safe Zone', sovereigns: 15, gold: 750, dust: 75, isSafe: true },
      { rankLabel: 'Ranks #101+', rankBadge: '🔻 Demotion Zone', sovereigns: 15, gold: 750, dust: 75, isDemotion: true }
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
      { rankLabel: 'Ranks #1 – #10', rankBadge: '💎 Diamond Paragon', sovereigns: 20, gold: 1200, dust: 120, isPromotion: true },
      { rankLabel: 'Ranks #11 – #20', rankBadge: '▲ Diamond Vanguard', sovereigns: 8, gold: 600, dust: 60, isPromotion: true },
      { rankLabel: 'Ranks #21 – #100', rankBadge: '🛡️ Diamond Haven', sovereigns: 8, gold: 600, dust: 60, isSafe: true },
      { rankLabel: 'Ranks #101+', rankBadge: '🔻 Demotion Zone', sovereigns: 8, gold: 600, dust: 60, isDemotion: true }
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
      { rankLabel: 'Ranks #1 – #10', rankBadge: '🩸 Crimson Lord', sovereigns: 10, gold: 900, dust: 90, isPromotion: true },
      { rankLabel: 'Ranks #11 – #20', rankBadge: '▲ Ruby Vanguard', sovereigns: 3, gold: 500, dust: 50, isPromotion: true },
      { rankLabel: 'Ranks #21 – #100', rankBadge: '🛡️ Ruby Safe Zone', sovereigns: 3, gold: 500, dust: 50, isSafe: true },
      { rankLabel: 'Ranks #101+', rankBadge: '🔻 Demotion Zone', sovereigns: 3, gold: 500, dust: 50, isDemotion: true }
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
      { rankLabel: 'Ranks #1 – #10', rankBadge: '❇️ Emerald Champion', sovereigns: 5, gold: 700, dust: 70, isPromotion: true },
      { rankLabel: 'Ranks #11 – #20', rankBadge: '▲ Emerald Vanguard', sovereigns: 2, gold: 400, dust: 40, isPromotion: true },
      { rankLabel: 'Ranks #21 – #100', rankBadge: '🛡️ Emerald Haven', sovereigns: 2, gold: 400, dust: 40, isSafe: true },
      { rankLabel: 'Ranks #101+', rankBadge: '🔻 Demotion Zone', sovereigns: 2, gold: 400, dust: 40, isDemotion: true }
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
      { rankLabel: 'Ranks #1 – #20', rankBadge: '▲ Platinum Vanguard', gold: 350, dust: 35, isPromotion: true },
      { rankLabel: 'Ranks #21 – #100', rankBadge: '🛡️ Platinum Safe Zone', gold: 350, dust: 35, isSafe: true },
      { rankLabel: 'Ranks #101+', rankBadge: '🔻 Demotion Zone', gold: 350, dust: 35, isDemotion: true }
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
      { rankLabel: 'Ranks #1 – #20', rankBadge: '▲ Gold Vanguard', gold: 250, dust: 25, isPromotion: true },
      { rankLabel: 'Ranks #21 – #100', rankBadge: '🛡️ Gold Safe Zone', gold: 250, dust: 25, isSafe: true },
      { rankLabel: 'Ranks #101+', rankBadge: '🔻 Demotion Zone', gold: 250, dust: 25, isDemotion: true }
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
      { rankLabel: 'Ranks #1 – #20', rankBadge: '▲ Silver Vanguard', gold: 175, dust: 20, isPromotion: true },
      { rankLabel: 'Ranks #21 – #100', rankBadge: '🛡️ Silver Safe Zone', gold: 175, dust: 20, isSafe: true },
      { rankLabel: 'Ranks #101+', rankBadge: '🔻 Demotion Zone', gold: 175, dust: 20, isDemotion: true }
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
      { rankLabel: 'Ranks #1 – #20', rankBadge: '▲ Bronze Vanguard', gold: 120, dust: 15, isPromotion: true },
      { rankLabel: 'Ranks #21+', rankBadge: '🛡️ Novice Arena', gold: 120, dust: 15, isSafe: true }
    ]
  }
];
