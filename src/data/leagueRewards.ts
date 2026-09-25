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
      { rankLabel: 'Rank #1', sovereigns: 1500, gold: 15000, dust: 5000, isSafe: true },
      { rankLabel: 'Rank #2', sovereigns: 800, gold: 9000, dust: 3000, isDemotion: true }
    ]
  },
  {
    name: 'Void Overlord',
    badge: '👑',
    icon: '/icons/league_void_overlord.png',
    tierIndex: 10,
    capacity: 3,
    color: 'text-rose-400',
    accent: 'text-rose-400 border-rose-500/40 bg-rose-950/30',
    border: 'border-rose-500/50',
    bgGradient: 'from-red-950/40 via-purple-950/30 to-black',
    summary: 'The apex of realm domination. 3 Elite Seats.',
    promotionZone: 'Rank #1 Ascends to Divine • Rank #2 Retains • Rank #3 Demotes to Grandmaster',
    brackets: [
      { rankLabel: 'Rank #1', sovereigns: 600, gold: 7500, dust: 2500, isPromotion: true },
      { rankLabel: 'Rank #2', sovereigns: 350, gold: 4500, dust: 1500, isSafe: true },
      { rankLabel: 'Rank #3', sovereigns: 150, gold: 2500, dust: 850, isDemotion: true }
    ]
  },
  {
    name: 'Grandmaster',
    badge: '⚜️',
    icon: '/icons/league_grandmaster_crest.png',
    tierIndex: 9,
    capacity: 5,
    color: 'text-amber-300',
    accent: 'text-amber-200 border-amber-400/40 bg-gradient-to-r from-purple-950/40 to-amber-950/40',
    border: 'border-amber-400/50',
    bgGradient: 'from-purple-950/40 via-amber-950/30 to-black',
    summary: 'Imperial Grandmasters. 5 Seats.',
    promotionZone: 'Rank #1 Ascends to Void Overlord • Ranks 2–3 Retain • Ranks 4–5 Demote to Master',
    brackets: [
      { rankLabel: 'Rank #1', sovereigns: 150, gold: 3500, dust: 1200, isPromotion: true },
      { rankLabel: 'Rank #2', sovereigns: 85, gold: 2700, dust: 900, isSafe: true },
      { rankLabel: 'Rank #3', sovereigns: 50, gold: 2000, dust: 700, isSafe: true },
      { rankLabel: 'Ranks #4 – #5', sovereigns: 15, gold: 700, dust: 240, isDemotion: true }
    ]
  },
  {
    name: 'Master',
    badge: '⚔️',
    icon: '/icons/league_master_crest.png',
    tierIndex: 8,
    capacity: 7,
    color: 'text-purple-300',
    accent: 'text-purple-300 border-purple-500/40 bg-purple-950/30',
    border: 'border-purple-500/50',
    bgGradient: 'from-purple-950/40 via-indigo-950/30 to-black',
    summary: 'Master League. 7 Seats.',
    promotionZone: 'Top 2 Ascend to Grandmaster • Ranks 3–5 Retain • Ranks 6–7 Demote to Diamond',
    brackets: [
      { rankLabel: 'Rank #1', sovereigns: 60, gold: 2400, dust: 800, isPromotion: true },
      { rankLabel: 'Rank #2', sovereigns: 40, gold: 1800, dust: 600, isPromotion: true },
      { rankLabel: 'Rank #3', sovereigns: 25, gold: 1300, dust: 450, isSafe: true },
      { rankLabel: 'Ranks #4 – #5', sovereigns: 12, gold: 800, dust: 270, isSafe: true },
      { rankLabel: 'Ranks #6 – #7', sovereigns: 5, gold: 400, dust: 140, isDemotion: true }
    ]
  },
  {
    name: 'Diamond',
    badge: '💎',
    icon: '/icons/league_diamond.png',
    tierIndex: 7,
    capacity: 9,
    color: 'text-cyan-300',
    accent: 'text-cyan-300 border-cyan-500/30 bg-cyan-950/20',
    border: 'border-cyan-500/50',
    bgGradient: 'from-cyan-950/40 via-blue-950/30 to-black',
    summary: 'Diamond Tier. 9 Seats.',
    promotionZone: 'Top 2 Ascend to Master • Ranks 3–6 Retain • Ranks 7–9 Demote to Ruby',
    brackets: [
      { rankLabel: 'Rank #1', sovereigns: 35, gold: 1600, dust: 550, isPromotion: true },
      { rankLabel: 'Rank #2', sovereigns: 22, gold: 1200, dust: 400, isPromotion: true },
      { rankLabel: 'Rank #3', sovereigns: 15, gold: 950, dust: 320, isSafe: true },
      { rankLabel: 'Ranks #4 – #6', sovereigns: 8, gold: 650, dust: 220, isSafe: true },
      { rankLabel: 'Ranks #7 – #9', sovereigns: 2, gold: 300, dust: 100, isDemotion: true }
    ]
  },
  {
    name: 'Ruby',
    badge: '🩸',
    icon: '/icons/league_ruby_crest.png',
    tierIndex: 6,
    capacity: 11,
    color: 'text-red-400',
    accent: 'text-red-400 border-red-500/30 bg-red-950/20',
    border: 'border-red-500/50',
    bgGradient: 'from-red-950/40 via-rose-950/30 to-black',
    summary: 'Crimson blood league. 11 Seats.',
    promotionZone: 'Top 3 Ascend to Diamond • Ranks 4–8 Retain • Ranks 9–11 Demote to Emerald',
    brackets: [
      { rankLabel: 'Rank #1', sovereigns: 20, gold: 1200, dust: 400, isPromotion: true },
      { rankLabel: 'Rank #2', sovereigns: 14, gold: 1000, dust: 340, isPromotion: true },
      { rankLabel: 'Rank #3', sovereigns: 10, gold: 800, dust: 270, isPromotion: true },
      { rankLabel: 'Ranks #4 – #8', sovereigns: 4, gold: 500, dust: 170, isSafe: true },
      { rankLabel: 'Ranks #9 – #11', sovereigns: 1, gold: 250, dust: 85, isDemotion: true }
    ]
  },
  {
    name: 'Emerald',
    badge: '❇️',
    icon: '/icons/league_emerald_crest.png',
    tierIndex: 5,
    capacity: 13,
    color: 'text-emerald-400',
    accent: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20',
    border: 'border-emerald-500/50',
    bgGradient: 'from-emerald-950/40 via-teal-950/30 to-black',
    summary: 'Jade and emerald enchanted league. 13 Seats.',
    promotionZone: 'Top 3 Ascend to Ruby • Ranks 4–9 Retain • Ranks 10–13 Demote to Sapphire',
    brackets: [
      { rankLabel: 'Rank #1', sovereigns: 10, gold: 900, dust: 300, isPromotion: true },
      { rankLabel: 'Rank #2', sovereigns: 7, gold: 750, dust: 250, isPromotion: true },
      { rankLabel: 'Rank #3', sovereigns: 5, gold: 650, dust: 220, isPromotion: true },
      { rankLabel: 'Ranks #4 – #9', sovereigns: 3, gold: 450, dust: 150, isSafe: true },
      { rankLabel: 'Ranks #10 – #13', sovereigns: 0, gold: 200, dust: 70, isDemotion: true }
    ]
  },
  {
    name: 'Sapphire',
    badge: '🔹',
    icon: '/icons/league_sapphire.png?v=2',
    tierIndex: 4,
    capacity: 15,
    color: 'text-blue-400',
    accent: 'text-blue-400 border-blue-500/30 bg-blue-950/20',
    border: 'border-blue-500/50',
    bgGradient: 'from-blue-950/40 via-sky-950/30 to-black',
    summary: 'Sapphire crystal realm. 15 Seats.',
    promotionZone: 'Top 4 Ascend to Emerald • Ranks 5–11 Retain • Ranks 12–15 Demote to Platinum',
    brackets: [
      { rankLabel: 'Rank #1', sovereigns: 7, gold: 800, dust: 270, isPromotion: true },
      { rankLabel: 'Rank #2', sovereigns: 5, gold: 680, dust: 230, isPromotion: true },
      { rankLabel: 'Rank #3', sovereigns: 3, gold: 580, dust: 195, isPromotion: true },
      { rankLabel: 'Rank #4', sovereigns: 3, gold: 480, dust: 160, isPromotion: true },
      { rankLabel: 'Ranks #5 – #11', sovereigns: 1, gold: 320, dust: 110, isSafe: true },
      { rankLabel: 'Ranks #12 – #15', sovereigns: 0, gold: 180, dust: 60, isDemotion: true }
    ]
  },
  {
    name: 'Platinum',
    badge: '🔮',
    icon: '/icons/league_platinum.png',
    tierIndex: 3,
    capacity: 17,
    color: 'text-indigo-300',
    accent: 'text-indigo-300 border-indigo-500/30 bg-indigo-950/20',
    border: 'border-indigo-500/40',
    bgGradient: 'from-indigo-950/40 via-blue-950/30 to-black',
    summary: 'Seasoned summoners competing for glory. 17 Seats.',
    promotionZone: 'Top 4 Ascend to Sapphire • Ranks 5–12 Retain • Ranks 13–17 Demote to Gold',
    brackets: [
      { rankLabel: 'Rank #1', sovereigns: 5, gold: 700, dust: 240, isPromotion: true },
      { rankLabel: 'Rank #2', sovereigns: 3, gold: 600, dust: 200, isPromotion: true },
      { rankLabel: 'Rank #3', sovereigns: 2, gold: 500, dust: 170, isPromotion: true },
      { rankLabel: 'Rank #4', sovereigns: 2, gold: 420, dust: 140, isPromotion: true },
      { rankLabel: 'Ranks #5 – #12', sovereigns: 1, gold: 280, dust: 95, isSafe: true },
      { rankLabel: 'Ranks #13 – #17', sovereigns: 0, gold: 150, dust: 50, isDemotion: true }
    ]
  },
  {
    name: 'Gold',
    badge: '🥇',
    icon: '/icons/league_gold.png',
    tierIndex: 2,
    capacity: 19,
    color: 'text-yellow-400',
    accent: 'text-yellow-400 border-yellow-500/30 bg-yellow-950/20',
    border: 'border-yellow-500/40',
    bgGradient: 'from-yellow-950/40 via-amber-950/30 to-black',
    summary: 'Veteran warriors in the golden halls. 19 Seats.',
    promotionZone: 'Top 5 Ascend to Platinum • Ranks 6–14 Retain • Ranks 15–19 Demote to Silver',
    brackets: [
      { rankLabel: 'Rank #1', sovereigns: 3, gold: 500, dust: 170, isPromotion: true },
      { rankLabel: 'Rank #2', sovereigns: 2, gold: 420, dust: 140, isPromotion: true },
      { rankLabel: 'Rank #3', sovereigns: 2, gold: 360, dust: 120, isPromotion: true },
      { rankLabel: 'Ranks #4 – #5', sovereigns: 1, gold: 300, dust: 100, isPromotion: true },
      { rankLabel: 'Ranks #6 – #14', sovereigns: 0, gold: 200, dust: 70, isSafe: true },
      { rankLabel: 'Ranks #15 – #19', sovereigns: 0, gold: 120, dust: 40, isDemotion: true }
    ]
  },
  {
    name: 'Silver',
    badge: '🥈',
    icon: '/icons/league_silver.png',
    tierIndex: 1,
    capacity: 21,
    color: 'text-gray-200',
    accent: 'text-gray-200 border-gray-500/30 bg-gray-900/30',
    border: 'border-gray-500/40',
    bgGradient: 'from-gray-900/40 via-slate-950/30 to-black',
    summary: 'Proven summoners advancing through competitive ranks. 21 Seats.',
    promotionZone: 'Top 5 Ascend to Gold • Ranks 6–15 Retain • Ranks 16–21 Demote to Bronze',
    brackets: [
      { rankLabel: 'Rank #1', sovereigns: 2, gold: 350, dust: 120, isPromotion: true },
      { rankLabel: 'Rank #2', sovereigns: 1, gold: 300, dust: 100, isPromotion: true },
      { rankLabel: 'Rank #3', sovereigns: 1, gold: 250, dust: 85, isPromotion: true },
      { rankLabel: 'Ranks #4 – #5', sovereigns: 0, gold: 220, dust: 75, isPromotion: true },
      { rankLabel: 'Ranks #6 – #15', sovereigns: 0, gold: 150, dust: 50, isSafe: true },
      { rankLabel: 'Ranks #16 – #21', sovereigns: 0, gold: 90, dust: 30, isDemotion: true }
    ]
  },
  {
    name: 'Bronze',
    badge: '🥉',
    icon: '/icons/league_bronze.png',
    tierIndex: 0,
    capacity: 25,
    color: 'text-amber-400',
    accent: 'text-amber-400 border-amber-600/30 bg-amber-950/20',
    border: 'border-amber-600/40',
    bgGradient: 'from-amber-950/40 via-yellow-950/20 to-black',
    summary: 'Starting proving grounds for all summoners. 25 Seats.',
    promotionZone: 'Top 6 Ascend to Silver (No Demotion)',
    brackets: [
      { rankLabel: 'Rank #1', sovereigns: 1, gold: 250, dust: 85, isPromotion: true },
      { rankLabel: 'Rank #2', sovereigns: 0, gold: 220, dust: 75, isPromotion: true },
      { rankLabel: 'Rank #3', sovereigns: 0, gold: 190, dust: 65, isPromotion: true },
      { rankLabel: 'Ranks #4 – #6', sovereigns: 0, gold: 160, dust: 55, isPromotion: true },
      { rankLabel: 'Ranks #7+', sovereigns: 0, gold: 90, dust: 30, isSafe: true }
    ]
  }
];

export const LEAGUE_PROMOTION_CONFIG: Record<string, { promoteTop: number; demoteRankAbove: number; capacity?: number }> = {
  'Divine': { promoteTop: 0, demoteRankAbove: 1, capacity: 2 },
  'Void Overlord': { promoteTop: 1, demoteRankAbove: 2, capacity: 3 },
  'Grandmaster': { promoteTop: 1, demoteRankAbove: 3, capacity: 5 },
  'Master': { promoteTop: 2, demoteRankAbove: 5, capacity: 7 },
  'Diamond': { promoteTop: 2, demoteRankAbove: 6, capacity: 9 },
  'Ruby': { promoteTop: 3, demoteRankAbove: 8, capacity: 11 },
  'Emerald': { promoteTop: 3, demoteRankAbove: 9, capacity: 13 },
  'Sapphire': { promoteTop: 4, demoteRankAbove: 11, capacity: 15 },
  'Platinum': { promoteTop: 4, demoteRankAbove: 12, capacity: 17 },
  'Gold': { promoteTop: 5, demoteRankAbove: 14, capacity: 19 },
  'Silver': { promoteTop: 5, demoteRankAbove: 15, capacity: 21 },
  'Bronze': { promoteTop: 6, demoteRankAbove: 999999, capacity: 25 }
};
