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
      { rankLabel: 'Rank #1 Sovereign', sovereigns: 600, gold: 7500, dust: 750 },
      { rankLabel: 'Rank #2', sovereigns: 400, gold: 5000, dust: 500 },
      { rankLabel: 'Rank #3', sovereigns: 300, gold: 4000, dust: 400 },
      { rankLabel: 'Ranks #4 – #10', sovereigns: 180, gold: 3000, dust: 300 },
      { rankLabel: 'Ranks #11 – #20', sovereigns: 100, gold: 1500, dust: 150 },
      { rankLabel: 'Ranks #21+', sovereigns: 40, gold: 800, dust: 80, isSafe: true }
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
      { rankLabel: 'Rank #1', sovereigns: 150, gold: 3500, dust: 350, isPromotion: true },
      { rankLabel: 'Rank #2', sovereigns: 100, gold: 3000, dust: 300, isPromotion: true },
      { rankLabel: 'Rank #3', sovereigns: 75, gold: 2500, dust: 250, isPromotion: true },
      { rankLabel: 'Ranks #4 – #10', sovereigns: 50, gold: 2000, dust: 200, isPromotion: true },
      { rankLabel: 'Ranks #11 – #20', sovereigns: 30, gold: 1200, dust: 120, isPromotion: true },
      { rankLabel: 'Ranks #21 – #100', sovereigns: 15, gold: 700, dust: 70, isSafe: true },
      { rankLabel: 'Ranks #101+', sovereigns: 10, gold: 500, dust: 50, isDemotion: true }
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
      { rankLabel: 'Rank #1', sovereigns: 60, gold: 2400, dust: 240, isPromotion: true },
      { rankLabel: 'Rank #2', sovereigns: 45, gold: 2000, dust: 200, isPromotion: true },
      { rankLabel: 'Rank #3', sovereigns: 35, gold: 1600, dust: 160, isPromotion: true },
      { rankLabel: 'Ranks #4 – #10', sovereigns: 25, gold: 1300, dust: 130, isPromotion: true },
      { rankLabel: 'Ranks #11 – #20', sovereigns: 15, gold: 900, dust: 90, isPromotion: true },
      { rankLabel: 'Ranks #21 – #100', sovereigns: 8, gold: 550, dust: 55, isSafe: true },
      { rankLabel: 'Ranks #101+', sovereigns: 5, gold: 400, dust: 40, isDemotion: true }
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
      { rankLabel: 'Rank #1', sovereigns: 35, gold: 1600, dust: 160, isPromotion: true },
      { rankLabel: 'Rank #2', sovereigns: 25, gold: 1300, dust: 130, isPromotion: true },
      { rankLabel: 'Rank #3', sovereigns: 18, gold: 1100, dust: 110, isPromotion: true },
      { rankLabel: 'Ranks #4 – #10', sovereigns: 14, gold: 900, dust: 90, isPromotion: true },
      { rankLabel: 'Ranks #11 – #20', sovereigns: 8, gold: 650, dust: 65, isPromotion: true },
      { rankLabel: 'Ranks #21 – #100', sovereigns: 4, gold: 450, dust: 45, isSafe: true },
      { rankLabel: 'Ranks #101+', sovereigns: 2, gold: 300, dust: 30, isDemotion: true }
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
      { rankLabel: 'Rank #1', sovereigns: 20, gold: 1200, dust: 120, isPromotion: true },
      { rankLabel: 'Rank #2', sovereigns: 14, gold: 1000, dust: 100, isPromotion: true },
      { rankLabel: 'Rank #3', sovereigns: 10, gold: 800, dust: 80, isPromotion: true },
      { rankLabel: 'Ranks #4 – #10', sovereigns: 7, gold: 700, dust: 70, isPromotion: true },
      { rankLabel: 'Ranks #11 – #20', sovereigns: 4, gold: 500, dust: 50, isPromotion: true },
      { rankLabel: 'Ranks #21 – #100', sovereigns: 2, gold: 350, dust: 35, isSafe: true },
      { rankLabel: 'Ranks #101+', sovereigns: 1, gold: 250, dust: 25, isDemotion: true }
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
      { rankLabel: 'Rank #1', sovereigns: 10, gold: 900, dust: 90, isPromotion: true },
      { rankLabel: 'Rank #2', sovereigns: 7, gold: 750, dust: 75, isPromotion: true },
      { rankLabel: 'Rank #3', sovereigns: 5, gold: 650, dust: 65, isPromotion: true },
      { rankLabel: 'Ranks #4 – #10', sovereigns: 4, gold: 550, dust: 55, isPromotion: true },
      { rankLabel: 'Ranks #11 – #20', sovereigns: 2, gold: 400, dust: 40, isPromotion: true },
      { rankLabel: 'Ranks #21 – #100', sovereigns: 1, gold: 280, dust: 28, isSafe: true },
      { rankLabel: 'Ranks #101+', sovereigns: 0, gold: 200, dust: 20, isDemotion: true }
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
      { rankLabel: 'Rank #1', sovereigns: 5, gold: 700, dust: 70, isPromotion: true },
      { rankLabel: 'Rank #2', sovereigns: 3, gold: 600, dust: 60, isPromotion: true },
      { rankLabel: 'Rank #3', sovereigns: 2, gold: 500, dust: 50, isPromotion: true },
      { rankLabel: 'Ranks #4 – #10', sovereigns: 2, gold: 420, dust: 42, isPromotion: true },
      { rankLabel: 'Ranks #11 – #20', sovereigns: 1, gold: 320, dust: 32, isPromotion: true },
      { rankLabel: 'Ranks #21 – #100', sovereigns: 0, gold: 220, dust: 22, isSafe: true },
      { rankLabel: 'Ranks #101+', sovereigns: 0, gold: 150, dust: 15, isDemotion: true }
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
      { rankLabel: 'Rank #1', sovereigns: 3, gold: 500, dust: 50, isPromotion: true },
      { rankLabel: 'Rank #2', sovereigns: 2, gold: 420, dust: 42, isPromotion: true },
      { rankLabel: 'Rank #3', sovereigns: 2, gold: 360, dust: 36, isPromotion: true },
      { rankLabel: 'Ranks #4 – #10', sovereigns: 1, gold: 300, dust: 30, isPromotion: true },
      { rankLabel: 'Ranks #11 – #20', sovereigns: 0, gold: 220, dust: 22, isPromotion: true },
      { rankLabel: 'Ranks #21 – #100', sovereigns: 0, gold: 160, dust: 16, isSafe: true },
      { rankLabel: 'Ranks #101+', sovereigns: 0, gold: 120, dust: 12, isDemotion: true }
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
      { rankLabel: 'Rank #1', sovereigns: 2, gold: 350, dust: 35, isPromotion: true },
      { rankLabel: 'Rank #2', sovereigns: 1, gold: 300, dust: 30, isPromotion: true },
      { rankLabel: 'Rank #3', sovereigns: 1, gold: 250, dust: 25, isPromotion: true },
      { rankLabel: 'Ranks #4 – #10', sovereigns: 0, gold: 220, dust: 22, isPromotion: true },
      { rankLabel: 'Ranks #11 – #20', sovereigns: 0, gold: 170, dust: 17, isPromotion: true },
      { rankLabel: 'Ranks #21 – #100', sovereigns: 0, gold: 120, dust: 12, isSafe: true },
      { rankLabel: 'Ranks #101+', sovereigns: 0, gold: 90, dust: 10, isDemotion: true }
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
      { rankLabel: 'Rank #1', sovereigns: 1, gold: 250, dust: 25, isPromotion: true },
      { rankLabel: 'Rank #2', sovereigns: 0, gold: 220, dust: 22, isPromotion: true },
      { rankLabel: 'Rank #3', sovereigns: 0, gold: 190, dust: 19, isPromotion: true },
      { rankLabel: 'Ranks #4 – #10', sovereigns: 0, gold: 160, dust: 16, isPromotion: true },
      { rankLabel: 'Ranks #11 – #20', sovereigns: 0, gold: 130, dust: 13, isPromotion: true },
      { rankLabel: 'Ranks #21+', sovereigns: 0, gold: 90, dust: 10, isSafe: true }
    ]
  }
];
