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
  capacity?: number;
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
    name: 'Divine',
    badge: '✨',
    icon: '/icons/league_divine.png',
    tierIndex: 11,
    capacity: 2,
    color: 'text-amber-300',
    accent: 'text-amber-200 border-amber-400/50 bg-gradient-to-r from-amber-950/60 via-yellow-950/40 to-black',
    border: 'border-amber-400/70',
    bgGradient: 'from-amber-950/60 via-yellow-950/40 to-black',
    summary: 'The Sacred Pantheon of Immortals. 2 Apex Seats.',
    promotionZone: 'Rank #1 Retains Godhood • Rank #2 Demotes to Void Overlord',
    brackets: [
      { rankLabel: 'Rank #1', sovereigns: 1500, gold: 15000, dust: 1500, isSafe: true },
      { rankLabel: 'Rank #2', sovereigns: 800, gold: 9000, dust: 900, isDemotion: true }
    ]
  },
  {
    name: 'Void Overlord',
    badge: '👑',
    icon: '/icons/league_void_overlord.png',
    tierIndex: 10,
    capacity: 5,
    color: 'text-rose-400',
    accent: 'text-rose-400 border-rose-500/40 bg-rose-950/30',
    border: 'border-rose-500/50',
    bgGradient: 'from-red-950/40 via-purple-950/30 to-black',
    summary: 'The apex of realm domination. 5 Elite Seats.',
    promotionZone: 'Rank #1 Ascends to Divine • Ranks 2–3 Retain • Ranks 4–5 Demote to GM',
    brackets: [
      { rankLabel: 'Rank #1', sovereigns: 600, gold: 7500, dust: 750, isPromotion: true },
      { rankLabel: 'Rank #2', sovereigns: 400, gold: 5000, dust: 500, isSafe: true },
      { rankLabel: 'Rank #3', sovereigns: 300, gold: 4000, dust: 400, isSafe: true },
      { rankLabel: 'Ranks #4 – #5', sovereigns: 150, gold: 2500, dust: 250, isDemotion: true }
    ]
  },
  {
    name: 'Grandmaster',
    badge: '⚜️',
    icon: '/icons/league_grandmaster_crest.png',
    tierIndex: 9,
    capacity: 12,
    color: 'text-amber-300',
    accent: 'text-amber-200 border-amber-400/40 bg-gradient-to-r from-purple-950/40 to-amber-950/40',
    border: 'border-amber-400/50',
    bgGradient: 'from-purple-950/40 via-amber-950/30 to-black',
    summary: 'Imperial Grandmasters. 12 Seats.',
    promotionZone: 'Top 2 Ascend to Void Overlord • Ranks 3–8 Retain • Ranks 9–12 Demote to Master',
    brackets: [
      { rankLabel: 'Rank #1', sovereigns: 150, gold: 3500, dust: 350, isPromotion: true },
      { rankLabel: 'Rank #2', sovereigns: 100, gold: 3000, dust: 300, isPromotion: true },
      { rankLabel: 'Rank #3', sovereigns: 75, gold: 2500, dust: 250, isSafe: true },
      { rankLabel: 'Ranks #4 – #8', sovereigns: 40, gold: 1800, dust: 180, isSafe: true },
      { rankLabel: 'Ranks #9 – #12', sovereigns: 15, gold: 700, dust: 70, isDemotion: true }
    ]
  },
  {
    name: 'Master',
    badge: '⚔️',
    icon: '/icons/league_master_crest.png',
    tierIndex: 8,
    capacity: 20,
    color: 'text-purple-300',
    accent: 'text-purple-300 border-purple-500/40 bg-purple-950/30',
    border: 'border-purple-500/50',
    bgGradient: 'from-purple-950/40 via-indigo-950/30 to-black',
    summary: 'Master League. 20 Seats.',
    promotionZone: 'Top 4 Ascend to Grandmaster • Ranks 5–14 Retain • Ranks 15–20 Demote to Diamond',
    brackets: [
      { rankLabel: 'Rank #1', sovereigns: 60, gold: 2400, dust: 240, isPromotion: true },
      { rankLabel: 'Rank #2', sovereigns: 45, gold: 2000, dust: 200, isPromotion: true },
      { rankLabel: 'Rank #3', sovereigns: 35, gold: 1600, dust: 160, isPromotion: true },
      { rankLabel: 'Rank #4', sovereigns: 25, gold: 1300, dust: 130, isPromotion: true },
      { rankLabel: 'Ranks #5 – #14', sovereigns: 12, gold: 800, dust: 80, isSafe: true },
      { rankLabel: 'Ranks #15 – #20', sovereigns: 5, gold: 400, dust: 40, isDemotion: true }
    ]
  },
  {
    name: 'Diamond',
    badge: '💎',
    icon: '/icons/league_diamond.png',
    tierIndex: 7,
    capacity: 30,
    color: 'text-cyan-300',
    accent: 'text-cyan-300 border-cyan-500/30 bg-cyan-950/20',
    border: 'border-cyan-500/50',
    bgGradient: 'from-cyan-950/40 via-blue-950/30 to-black',
    summary: 'Diamond Tier. 30 Seats.',
    promotionZone: 'Top 6 Ascend to Master • Ranks 7–22 Retain • Ranks 23–30 Demote to Ruby',
    brackets: [
      { rankLabel: 'Rank #1', sovereigns: 35, gold: 1600, dust: 160, isPromotion: true },
      { rankLabel: 'Rank #2', sovereigns: 25, gold: 1300, dust: 130, isPromotion: true },
      { rankLabel: 'Rank #3', sovereigns: 18, gold: 1100, dust: 110, isPromotion: true },
      { rankLabel: 'Ranks #4 – #6', sovereigns: 14, gold: 900, dust: 90, isPromotion: true },
      { rankLabel: 'Ranks #7 – #22', sovereigns: 6, gold: 550, dust: 55, isSafe: true },
      { rankLabel: 'Ranks #23 – #30', sovereigns: 2, gold: 300, dust: 30, isDemotion: true }
    ]
  },
  {
    name: 'Ruby',
    badge: '🩸',
    icon: '/icons/league_ruby_crest.png',
    tierIndex: 6,
    capacity: 35,
    color: 'text-red-400',
    accent: 'text-red-400 border-red-500/30 bg-red-950/20',
    border: 'border-red-500/50',
    bgGradient: 'from-red-950/40 via-rose-950/30 to-black',
    summary: 'Crimson blood league. 35 Seats.',
    promotionZone: 'Top 8 Ascend to Diamond • Ranks 9–25 Retain • Ranks 26+ Demote to Emerald',
    brackets: [
      { rankLabel: 'Rank #1', sovereigns: 20, gold: 1200, dust: 120, isPromotion: true },
      { rankLabel: 'Rank #2', sovereigns: 14, gold: 1000, dust: 100, isPromotion: true },
      { rankLabel: 'Rank #3', sovereigns: 10, gold: 800, dust: 80, isPromotion: true },
      { rankLabel: 'Ranks #4 – #8', sovereigns: 7, gold: 700, dust: 70, isPromotion: true },
      { rankLabel: 'Ranks #9 – #25', sovereigns: 3, gold: 400, dust: 40, isSafe: true },
      { rankLabel: 'Ranks #26+', sovereigns: 1, gold: 250, dust: 25, isDemotion: true }
    ]
  },
  {
    name: 'Emerald',
    badge: '❇️',
    icon: '/icons/league_emerald_crest.png',
    tierIndex: 5,
    capacity: 40,
    color: 'text-emerald-400',
    accent: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20',
    border: 'border-emerald-500/50',
    bgGradient: 'from-emerald-950/40 via-teal-950/30 to-black',
    summary: 'Jade and emerald enchanted league. 40 Seats.',
    promotionZone: 'Top 10 Ascend to Ruby • Ranks 11–28 Retain • Ranks 29+ Demote to Sapphire',
    brackets: [
      { rankLabel: 'Rank #1', sovereigns: 10, gold: 900, dust: 90, isPromotion: true },
      { rankLabel: 'Rank #2', sovereigns: 7, gold: 750, dust: 75, isPromotion: true },
      { rankLabel: 'Rank #3', sovereigns: 5, gold: 650, dust: 65, isPromotion: true },
      { rankLabel: 'Ranks #4 – #10', sovereigns: 4, gold: 550, dust: 55, isPromotion: true },
      { rankLabel: 'Ranks #11 – #28', sovereigns: 2, gold: 350, dust: 35, isSafe: true },
      { rankLabel: 'Ranks #29+', sovereigns: 0, gold: 200, dust: 20, isDemotion: true }
    ]
  },
  {
    name: 'Sapphire',
    badge: '🔹',
    icon: '/icons/league_sapphire.png?v=2',
    tierIndex: 4,
    capacity: 45,
    color: 'text-blue-400',
    accent: 'text-blue-400 border-blue-500/30 bg-blue-950/20',
    border: 'border-blue-500/50',
    bgGradient: 'from-blue-950/40 via-sky-950/30 to-black',
    summary: 'Sapphire crystal realm. 45 Seats.',
    promotionZone: 'Top 12 Ascend to Emerald • Ranks 13–31 Retain • Ranks 32+ Demote to Platinum',
    brackets: [
      { rankLabel: 'Rank #1', sovereigns: 7, gold: 800, dust: 80, isPromotion: true },
      { rankLabel: 'Rank #2', sovereigns: 5, gold: 680, dust: 68, isPromotion: true },
      { rankLabel: 'Rank #3', sovereigns: 3, gold: 580, dust: 58, isPromotion: true },
      { rankLabel: 'Ranks #4 – #12', sovereigns: 3, gold: 480, dust: 48, isPromotion: true },
      { rankLabel: 'Ranks #13 – #31', sovereigns: 1, gold: 300, dust: 30, isSafe: true },
      { rankLabel: 'Ranks #32+', sovereigns: 0, gold: 180, dust: 18, isDemotion: true }
    ]
  },
  {
    name: 'Platinum',
    badge: '🔮',
    icon: '/icons/league_platinum.png',
    tierIndex: 3,
    capacity: 50,
    color: 'text-indigo-300',
    accent: 'text-indigo-300 border-indigo-500/30 bg-indigo-950/20',
    border: 'border-indigo-500/40',
    bgGradient: 'from-indigo-950/40 via-blue-950/30 to-black',
    summary: 'Seasoned summoners competing for glory. 50 Seats.',
    promotionZone: 'Top 14 Ascend to Sapphire • Ranks 15–34 Retain • Ranks 35+ Demote to Gold',
    brackets: [
      { rankLabel: 'Rank #1', sovereigns: 5, gold: 700, dust: 70, isPromotion: true },
      { rankLabel: 'Rank #2', sovereigns: 3, gold: 600, dust: 60, isPromotion: true },
      { rankLabel: 'Rank #3', sovereigns: 2, gold: 500, dust: 50, isPromotion: true },
      { rankLabel: 'Ranks #4 – #14', sovereigns: 2, gold: 420, dust: 42, isPromotion: true },
      { rankLabel: 'Ranks #15 – #34', sovereigns: 1, gold: 280, dust: 28, isSafe: true },
      { rankLabel: 'Ranks #35+', sovereigns: 0, gold: 150, dust: 15, isDemotion: true }
    ]
  },
  {
    name: 'Gold',
    badge: '🥇',
    icon: '/icons/league_gold.png',
    tierIndex: 2,
    capacity: 55,
    color: 'text-yellow-400',
    accent: 'text-yellow-400 border-yellow-500/30 bg-yellow-950/20',
    border: 'border-yellow-500/40',
    bgGradient: 'from-yellow-950/40 via-amber-950/30 to-black',
    summary: 'Veteran warriors in the golden halls. 55 Seats.',
    promotionZone: 'Top 16 Ascend to Platinum • Ranks 17–37 Retain • Ranks 38+ Demote to Silver',
    brackets: [
      { rankLabel: 'Rank #1', sovereigns: 3, gold: 500, dust: 50, isPromotion: true },
      { rankLabel: 'Rank #2', sovereigns: 2, gold: 420, dust: 42, isPromotion: true },
      { rankLabel: 'Rank #3', sovereigns: 2, gold: 360, dust: 36, isPromotion: true },
      { rankLabel: 'Ranks #4 – #16', sovereigns: 1, gold: 300, dust: 30, isPromotion: true },
      { rankLabel: 'Ranks #17 – #37', sovereigns: 0, gold: 200, dust: 20, isSafe: true },
      { rankLabel: 'Ranks #38+', sovereigns: 0, gold: 120, dust: 12, isDemotion: true }
    ]
  },
  {
    name: 'Silver',
    badge: '🥈',
    icon: '/icons/league_silver.png',
    tierIndex: 1,
    capacity: 60,
    color: 'text-gray-200',
    accent: 'text-gray-200 border-gray-500/30 bg-gray-900/30',
    border: 'border-gray-500/40',
    bgGradient: 'from-gray-900/40 via-slate-950/30 to-black',
    summary: 'Proven summoners advancing through competitive ranks. 60 Seats.',
    promotionZone: 'Top 18 Ascend to Gold • Ranks 19–42 Retain • Ranks 43+ Demote to Bronze',
    brackets: [
      { rankLabel: 'Rank #1', sovereigns: 2, gold: 350, dust: 35, isPromotion: true },
      { rankLabel: 'Rank #2', sovereigns: 1, gold: 300, dust: 30, isPromotion: true },
      { rankLabel: 'Rank #3', sovereigns: 1, gold: 250, dust: 25, isPromotion: true },
      { rankLabel: 'Ranks #4 – #18', sovereigns: 0, gold: 220, dust: 22, isPromotion: true },
      { rankLabel: 'Ranks #19 – #42', sovereigns: 0, gold: 150, dust: 15, isSafe: true },
      { rankLabel: 'Ranks #43+', sovereigns: 0, gold: 90, dust: 10, isDemotion: true }
    ]
  },
  {
    name: 'Bronze',
    badge: '🥉',
    icon: '/icons/league_bronze.png',
    tierIndex: 0,
    capacity: 80,
    color: 'text-amber-400',
    accent: 'text-amber-400 border-amber-600/30 bg-amber-950/20',
    border: 'border-amber-600/40',
    bgGradient: 'from-amber-950/40 via-yellow-950/20 to-black',
    summary: 'Starting proving grounds for all summoners. 80 Seats.',
    promotionZone: 'Top 20 Ascend to Silver (No Demotion)',
    brackets: [
      { rankLabel: 'Rank #1', sovereigns: 1, gold: 250, dust: 25, isPromotion: true },
      { rankLabel: 'Rank #2', sovereigns: 0, gold: 220, dust: 22, isPromotion: true },
      { rankLabel: 'Rank #3', sovereigns: 0, gold: 190, dust: 19, isPromotion: true },
      { rankLabel: 'Ranks #4 – #20', sovereigns: 0, gold: 160, dust: 16, isPromotion: true },
      { rankLabel: 'Ranks #21+', sovereigns: 0, gold: 90, dust: 10, isSafe: true }
    ]
  }
];

export const LEAGUE_PROMOTION_CONFIG: Record<string, { promoteTop: number; demoteRankAbove: number; capacity?: number }> = {
  'Divine': { promoteTop: 0, demoteRankAbove: 1, capacity: 2 },
  'Void Overlord': { promoteTop: 1, demoteRankAbove: 3, capacity: 5 },
  'Grandmaster': { promoteTop: 2, demoteRankAbove: 8, capacity: 12 },
  'Master': { promoteTop: 4, demoteRankAbove: 14, capacity: 20 },
  'Diamond': { promoteTop: 6, demoteRankAbove: 22, capacity: 30 },
  'Ruby': { promoteTop: 8, demoteRankAbove: 25, capacity: 35 },
  'Emerald': { promoteTop: 10, demoteRankAbove: 28, capacity: 40 },
  'Sapphire': { promoteTop: 12, demoteRankAbove: 31, capacity: 45 },
  'Platinum': { promoteTop: 14, demoteRankAbove: 34, capacity: 50 },
  'Gold': { promoteTop: 16, demoteRankAbove: 37, capacity: 55 },
  'Silver': { promoteTop: 18, demoteRankAbove: 42, capacity: 60 },
  'Bronze': { promoteTop: 20, demoteRankAbove: 999999, capacity: 80 }
};
