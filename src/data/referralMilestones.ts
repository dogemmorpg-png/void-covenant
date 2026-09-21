export interface ReferralMilestone {
  id: string;
  requiredSubscribers: number;
  rewardSovereigns: number;
  title: string;
  badgeIcon: string;
  borderTheme: string;
  glowTheme: string;
  badgeBg: string;
}

export const REFERRAL_MILESTONES: ReferralMilestone[] = [
  {
    id: 'ref_sub_1',
    requiredSubscribers: 1,
    rewardSovereigns: 150,
    title: 'Initiate Patron',
    badgeIcon: '/icons/league_bronze.png',
    borderTheme: 'border-amber-700/50 hover:border-amber-600',
    glowTheme: 'shadow-[0_0_20px_rgba(180,83,9,0.2)]',
    badgeBg: 'bg-amber-950/60 border-amber-700/40'
  },
  {
    id: 'ref_sub_5',
    requiredSubscribers: 5,
    rewardSovereigns: 800,
    title: 'Vanguard Sponsor',
    badgeIcon: '/icons/league_silver.png',
    borderTheme: 'border-slate-400/50 hover:border-slate-300',
    glowTheme: 'shadow-[0_0_20px_rgba(148,163,184,0.25)]',
    badgeBg: 'bg-slate-900/60 border-slate-400/40'
  },
  {
    id: 'ref_sub_10',
    requiredSubscribers: 10,
    rewardSovereigns: 2500,
    title: 'Legion Commander',
    badgeIcon: '/icons/league_gold.png',
    borderTheme: 'border-yellow-500/50 hover:border-yellow-400',
    glowTheme: 'shadow-[0_0_20px_rgba(234,179,8,0.25)]',
    badgeBg: 'bg-yellow-950/60 border-yellow-500/40'
  },
  {
    id: 'ref_sub_25',
    requiredSubscribers: 25,
    rewardSovereigns: 6500,
    title: 'Baron of the Void',
    badgeIcon: '/icons/league_platinum.png',
    borderTheme: 'border-cyan-400/50 hover:border-cyan-300',
    glowTheme: 'shadow-[0_0_20px_rgba(34,211,238,0.25)]',
    badgeBg: 'bg-cyan-950/60 border-cyan-400/40'
  },
  {
    id: 'ref_sub_50',
    requiredSubscribers: 50,
    rewardSovereigns: 15000,
    title: 'Archon Recruiter',
    badgeIcon: '/icons/league_diamond.png',
    borderTheme: 'border-blue-400/50 hover:border-blue-300',
    glowTheme: 'shadow-[0_0_25px_rgba(96,165,250,0.3)]',
    badgeBg: 'bg-blue-950/60 border-blue-400/40'
  },
  {
    id: 'ref_sub_100',
    requiredSubscribers: 100,
    rewardSovereigns: 40000,
    title: 'Imperial Grandmaster',
    badgeIcon: '/icons/badge_crown_v1.png',
    borderTheme: 'border-purple-400/60 hover:border-purple-300',
    glowTheme: 'shadow-[0_0_30px_rgba(192,132,252,0.35)]',
    badgeBg: 'bg-purple-950/60 border-purple-400/50'
  },
  {
    id: 'ref_sub_200',
    requiredSubscribers: 200,
    rewardSovereigns: 90000,
    title: 'Shadow Sovereign',
    badgeIcon: '/icons/league_master.png',
    borderTheme: 'border-rose-500/60 hover:border-rose-400',
    glowTheme: 'shadow-[0_0_30px_rgba(244,63,94,0.35)]',
    badgeBg: 'bg-rose-950/60 border-rose-500/50'
  },
  {
    id: 'ref_sub_500',
    requiredSubscribers: 500,
    rewardSovereigns: 230000,
    title: 'Covenant Highlord',
    badgeIcon: '/icons/league_grandmaster.png',
    borderTheme: 'border-red-500/70 hover:border-red-400',
    glowTheme: 'shadow-[0_0_35px_rgba(239,68,68,0.4)]',
    badgeBg: 'bg-red-950/70 border-red-500/60'
  },
  {
    id: 'ref_sub_1000',
    requiredSubscribers: 1000,
    rewardSovereigns: 500000,
    title: 'Demiurge of the Void',
    badgeIcon: '/icons/league_void_overlord.png',
    borderTheme: 'border-amber-400 hover:border-yellow-300',
    glowTheme: 'shadow-[0_0_40px_rgba(245,158,11,0.5)] animate-pulse',
    badgeBg: 'bg-gradient-to-br from-amber-950 via-black to-red-950 border-amber-400/70'
  }
];
