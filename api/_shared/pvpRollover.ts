// @ts-nocheck
import { SupabaseClient } from '@supabase/supabase-js';

export const PVP_LEAGUES = [
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
  'Divine'
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

export const DEFAULT_LEAGUE_REWARDS = [
  {
    name: 'Divine',
    badge: '✨',
    icon: '/icons/league_divine.png',
    tierIndex: 11,
    capacity: 2,
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
    brackets: [
      { rankLabel: 'Rank #1', sovereigns: 1, gold: 250, dust: 85, isPromotion: true },
      { rankLabel: 'Rank #2', sovereigns: 0, gold: 220, dust: 75, isPromotion: true },
      { rankLabel: 'Rank #3', sovereigns: 0, gold: 190, dust: 65, isPromotion: true },
      { rankLabel: 'Ranks #4 – #6', sovereigns: 0, gold: 160, dust: 55, isPromotion: true },
      { rankLabel: 'Ranks #7+', sovereigns: 0, gold: 90, dust: 30, isSafe: true }
    ]
  }
];

export function calculateLeagueRewards(customConfig: any, leagueName: string, rank: number) {
  const configList = Array.isArray(customConfig) && customConfig.length > 0 ? customConfig : DEFAULT_LEAGUE_REWARDS;
  const leagueData = configList.find((l: any) => l.name.toLowerCase() === leagueName.toLowerCase());
  
  if (!leagueData || !leagueData.brackets || leagueData.brackets.length === 0) {
    return { gold: 120, dust: 15, sovereigns: 0 };
  }

  for (const b of leagueData.brackets) {
    const label = (b.rankLabel || '').trim();
    // 1. Check range like "Ranks #4 – #8", "#4 - #8", "#9 – #12"
    const matchRange = label.match(/#?(\d+)\s*[–-]\s*#?(\d+)/);
    if (matchRange) {
      const min = parseInt(matchRange[1], 10);
      const max = parseInt(matchRange[2], 10);
      if (rank >= min && rank <= max) {
        return { gold: Number(b.gold) || 0, dust: Number(b.dust) || 0, sovereigns: Number(b.sovereigns) || 0 };
      }
    }
    // 2. Check plus like "Ranks #26+", "#21+"
    const matchPlus = label.match(/#?(\d+)\+/);
    if (matchPlus) {
      const min = parseInt(matchPlus[1], 10);
      if (rank >= min) {
        return { gold: Number(b.gold) || 0, dust: Number(b.dust) || 0, sovereigns: Number(b.sovereigns) || 0 };
      }
    }
    // 3. Check single rank like "Rank #1", "Rank #2", "Rank #3", "#1 Sovereign"
    const matchSingle = label.match(/#(\d+)/);
    if (matchSingle) {
      const single = parseInt(matchSingle[1], 10);
      if (rank === single) {
        return { gold: Number(b.gold) || 0, dust: Number(b.dust) || 0, sovereigns: Number(b.sovereigns) || 0 };
      }
    }
  }

  const lastBracket = leagueData.brackets[leagueData.brackets.length - 1];
  return {
    gold: Number(lastBracket?.gold) || 120,
    dust: Number(lastBracket?.dust) || 15,
    sovereigns: Number(lastBracket?.sovereigns) || 0
  };
}

export interface RolloverResult {
  rolledOver: boolean;
  reason?: string;
  roundDate?: string;
  totalPlayers?: number;
  promotedCount?: number;
  demotedCount?: number;
}

let cachedRolloverDate: string | null = null;
let lastRolloverCheckTime = 0;

/**
 * Checks if midnight UTC has passed since the last PvP round rollover,
 * and if so, automatically performs league promotions, demotions, daily ticket refills, and LP resets.
 */
export async function checkAndPerformPvpRollover(
  supabase: SupabaseClient,
  force: boolean = false
): Promise<RolloverResult> {
  try {
    const todayUtc = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'

    // Fast-path: In-memory cache for 60s
    if (!force && cachedRolloverDate === todayUtc && (Date.now() - lastRolloverCheckTime < 60000)) {
      return { rolledOver: false, reason: 'cached_already_completed', roundDate: todayUtc };
    }

    lastRolloverCheckTime = Date.now();

    // 1. Fetch system state
    const { data: stateRows, error: stateError } = await supabase
      .from('profiles')
      .select('data')
      .eq('wallet_address', 'system_pvp_state')
      .limit(1);

    if (stateError) {
      console.error('[PVP ROLLOVER] Database error fetching system_pvp_state, aborting to prevent duplicate runs:', stateError);
      return { rolledOver: false, reason: 'db_state_fetch_error' };
    }

    const systemState = (stateRows && stateRows.length > 0) ? stateRows[0].data : null;
    const lastRolloverDate = systemState?.lastRolloverDate;

    if (!force && lastRolloverDate && lastRolloverDate >= todayUtc) {
      cachedRolloverDate = todayUtc;
      return { rolledOver: false, reason: 'already_completed_today', roundDate: lastRolloverDate };
    }

    // Set lock immediately to block concurrent calls within the same process
    cachedRolloverDate = todayUtc;

    // 2. Fetch custom rewards configuration if set by admin
    const { data: configRows } = await supabase
      .from('profiles')
      .select('data')
      .eq('wallet_address', '__SYSTEM_CONFIG_LEAGUE_REWARDS__')
      .limit(1);

    const customLeagueConfig = configRows && configRows.length > 0 && configRows[0].data?.config 
      ? configRows[0].data.config 
      : null;

    // 3. Fetch all real player profiles
    const { data: profileRows, error: fetchError } = await supabase
      .from('profiles')
      .select('wallet_address, data')
      .not('wallet_address', 'like', '__SYSTEM_CONFIG%')
      .neq('wallet_address', 'system_pvp_state');

    if (fetchError || !profileRows) {
      console.error('Failed to fetch player profiles for rollover:', fetchError);
      return { rolledOver: false, reason: 'fetch_error' };
    }

    const players = profileRows.map(r => ({
      walletAddress: r.wallet_address,
      profile: r.data || {},
      originalLeague: r.data?.pvpLeague || 'Bronze'
    }));

    // 4. Reset daily tickets based on subscription tier (Free: 5, Premium: 8, Ultra: 12), keeping bonus tickets intact, and deliver daily subscription tribute mail
    players.forEach(p => {
      const isSubActive = p.profile.subscriptionExpiresAt && p.profile.subscriptionExpiresAt > Date.now();
      const tier = isSubActive ? (p.profile.subscriptionTier || 'free') : 'free';
      const pvpMax = tier === 'ultra' ? 12 : tier === 'premium' ? 8 : 5;
      p.profile.pvpEnergy = pvpMax;
      p.profile.pvpEnergyMax = pvpMax;
      p.profile.pvpBonusTickets = p.profile.pvpBonusTickets || 0;
      p.profile.pvpTickets = pvpMax + p.profile.pvpBonusTickets;

      // Deliver daily tribute mail if subscription is active
      if (isSubActive && (p.profile.lastDailySubscriptionMail !== todayUtc || force)) {
        const isUltra = tier === 'ultra';
        const gold = isUltra ? 3000 : 1000;
        const dust = isUltra ? 400 : 150;
        const shieldType = isUltra ? '6h' : '3h';
        const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const dailyMail = {
          id: `mail_sub_${todayUtc}_${p.walletAddress.slice(-4)}_${uniqueSuffix}`,
          title: isUltra ? '💎 Daily Ultra Overlord Tribute' : '⚜️ Daily Premium Tribute',
          sender: 'Imperial Treasury',
          body: `Hail, Lord ${p.profile.username || 'Voidwalker'}!\n\nYour imperial covenant tribute for ${todayUtc} has arrived at your dominion:\n• +${gold.toLocaleString()} Gold\n• +${dust} Dark Dust\n• 1x ${shieldType} Void Aegis Shield\n\nClaim these resources to fortify your rank in the Abyss!`,
          rewards: {
            gold,
            dust,
            shieldType,
            shieldCount: 1
          },
          isClaimed: false,
          isRead: false,
          createdAt: Date.now()
        };
        p.profile.mailMessages = [dailyMail, ...(p.profile.mailMessages || [])].slice(0, 50);
        p.profile.lastDailySubscriptionMail = todayUtc;
      }
    });

    let totalPromoted = 0;
    let totalDemoted = 0;
    const referrerCommissions = new Map<string, { totalComm: number; byReferral: Record<string, number> }>();

    // 5. Process each league
    for (let leagueIdx = 0; leagueIdx < PVP_LEAGUES.length; leagueIdx++) {
      const leagueName = PVP_LEAGUES[leagueIdx];
      const leaguePlayers = players.filter(p => p.originalLeague === leagueName);

      if (leaguePlayers.length === 0) continue;

      // Ensure LP & rating are defined numbers
      leaguePlayers.forEach(p => {
        if (p.profile.pvpLP === undefined || p.profile.pvpLP === null) {
          p.profile.pvpLP = 100;
        }
        if (p.profile.pvpRating === undefined || p.profile.pvpRating === null) {
          p.profile.pvpRating = 100;
        }
      });

      // Sort by LP descending, then rating descending
      leaguePlayers.sort((a, b) => (b.profile.pvpLP - a.profile.pvpLP) || (b.profile.pvpRating - a.profile.pvpRating));

      const count = leaguePlayers.length;
      const promoConfig = LEAGUE_PROMOTION_CONFIG[leagueName] || { promoteTop: 20, demoteRankAbove: 999999, capacity: 80 };
      const promoteTop = promoConfig.promoteTop;
      const demoteRankAbove = promoConfig.demoteRankAbove;

      for (let i = 0; i < count; i++) {
        const p = leaguePlayers[i];
        const rank = i + 1;
        let promoStatus = '';

        // Top players promote to next league (if not in top league)
        if (promoteTop > 0 && rank <= promoteTop && leagueIdx < PVP_LEAGUES.length - 1) {
          const nextLeague = PVP_LEAGUES[leagueIdx + 1];
          p.profile.pvpLeague = nextLeague;
          p.profile.pvpLP = 100;
          totalPromoted++;
          promoStatus = `⚔️ PROMOTION! You placed at Rank #${rank} (Top ${promoteTop}) and ascended to the ${nextLeague} League!`;
        }
        // Players below demote threshold demote to previous league (if not in Bronze)
        else if (rank > demoteRankAbove && leagueIdx > 0) {
          const prevLeague = PVP_LEAGUES[leagueIdx - 1];
          p.profile.pvpLeague = prevLeague;
          p.profile.pvpLP = 100;
          totalDemoted++;
          promoStatus = `🔻 DEMOTION: You placed at Rank #${rank} (below safe Rank #${demoteRankAbove}) and have fallen to the ${prevLeague} League. Reclaim your honor!`;
        }
        // Retain in current league with fresh round LP
        else {
          p.profile.pvpLP = 100;
          promoStatus = `🛡️ RETAINED: You maintain your standing in the ${leagueName} League.`;
        }

        // Calculate Rewards dynamically based on config & Rank
        const calculated = calculateLeagueRewards(customLeagueConfig, leagueName, rank);
        const goldReward = calculated.gold;
        const dustReward = calculated.dust;
        let sovereignsReward = calculated.sovereigns;

        // Subscription bonus: +15% for Premium, +25% for Ultra
        const isSubActive = p.profile.subscriptionExpiresAt && p.profile.subscriptionExpiresAt > Date.now();
        const tier = isSubActive ? (p.profile.subscriptionTier || 'free') : 'free';
        if (sovereignsReward > 0) {
          if (tier === 'ultra') {
            sovereignsReward = Math.round(sovereignsReward * 1.25);
          } else if (tier === 'premium') {
            sovereignsReward = Math.round(sovereignsReward * 1.15);
          }
        }

        // 15% Referral Sovereign Commission (System-funded)
        if (p.profile.referredBy && sovereignsReward > 0) {
          const comm = Number((sovereignsReward * 0.15).toFixed(2));
          if (comm > 0) {
            const existing = referrerCommissions.get(p.profile.referredBy) || { totalComm: 0, byReferral: {} };
            existing.totalComm = Number((existing.totalComm + comm).toFixed(2));
            existing.byReferral[p.walletAddress] = Number(((existing.byReferral[p.walletAddress] || 0) + comm).toFixed(2));
            referrerCommissions.set(p.profile.referredBy, existing);
          }
        }

        // Generate Mail Message for Player Inbox
        const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const mailMessage = {
          id: `mail_pvp_${todayUtc}_${p.walletAddress.slice(-4)}_${rank}_${uniqueSuffix}`,
          title: `PvP Season Report: ${leagueName} (Rank #${rank})`,
          sender: 'Council of the Void',
          body: `Greetings, Lord ${p.profile.username || 'Voidwalker'}.\n\nThe PvP Arena round for ${todayUtc} has concluded.\nYou finished at Rank #${rank} in the ${leagueName} League.\n\n${promoStatus}\n\nYour imperial tributes and rewards have been attached to this decree.`,
          rewards: {
            gold: goldReward,
            dust: dustReward,
            bloodSovereigns: sovereignsReward > 0 ? sovereignsReward : undefined
          },
          isClaimed: false,
          isRead: false,
          createdAt: Date.now()
        };

        // Idempotency: prevent duplicate mail/rewards if player already received rollover decree for todayUtc (unless manually forced by admin)
        const alreadyReceivedToday = !force && ((p.profile.mailMessages || []).some((m: any) =>
          m.id && m.id.startsWith(`mail_pvp_${todayUtc}_`)
        ) || p.profile.lastPvpRolloverDate === todayUtc);

        if (!alreadyReceivedToday) {
          p.profile.mailMessages = [mailMessage, ...(p.profile.mailMessages || [])].slice(0, 50);
          p.profile.lastPvpRolloverDate = todayUtc;
        } else {
          console.log(`[PVP ROLLOVER] Player ${p.walletAddress} already received rollover decree for ${todayUtc}, skipping duplicate mail.`);
        }
      }
    }

    // 4.5. Credit Referrer Commissions (15% system sovereign commission)
    for (const [refWallet, commData] of referrerCommissions.entries()) {
      if (commData.totalComm <= 0) continue;
      const activePlayer = players.find(pl => pl.walletAddress === refWallet);
      if (activePlayer) {
        activePlayer.profile.referralSovereignsUnclaimed = Number(
          ((activePlayer.profile.referralSovereignsUnclaimed || 0) + commData.totalComm).toFixed(2)
        );
        activePlayer.profile.referralSovereignsTotalEarned = Number(
          ((activePlayer.profile.referralSovereignsTotalEarned || 0) + commData.totalComm).toFixed(2)
        );
        activePlayer.profile.referralContributions = activePlayer.profile.referralContributions || {};
        for (const [referredWallet, amount] of Object.entries(commData.byReferral)) {
          activePlayer.profile.referralContributions[referredWallet] = Number(
            ((activePlayer.profile.referralContributions[referredWallet] || 0) + amount).toFixed(2)
          );
        }
      } else {
        try {
          const { data: refRows } = await supabase
            .from('profiles')
            .select('data')
            .eq('wallet_address', refWallet)
            .limit(1);
          if (refRows && refRows.length > 0) {
            const refData = refRows[0].data || {};
            refData.referralSovereignsUnclaimed = Number(
              ((refData.referralSovereignsUnclaimed || 0) + commData.totalComm).toFixed(2)
            );
            refData.referralSovereignsTotalEarned = Number(
              ((refData.referralSovereignsTotalEarned || 0) + commData.totalComm).toFixed(2)
            );
            refData.referralContributions = refData.referralContributions || {};
            for (const [referredWallet, amount] of Object.entries(commData.byReferral)) {
              refData.referralContributions[referredWallet] = Number(
                ((refData.referralContributions[referredWallet] || 0) + amount).toFixed(2)
              );
            }
            await supabase
              .from('profiles')
              .update({ data: refData, updated_at: new Date().toISOString() })
              .eq('wallet_address', refWallet);
          }
        } catch (refErr) {
          console.error(`[PVP ROLLOVER] Failed to credit referrer commission to ${refWallet}:`, refErr);
        }
      }
    }

    // 5. Batch update all player profiles
    for (const p of players) {
      await supabase
        .from('profiles')
        .update({ data: p.profile, updated_at: new Date().toISOString() })
        .eq('wallet_address', p.walletAddress);
    }

    // 6. Update system state with today's completed rollover date
    const updatedState = {
      lastRolloverDate: todayUtc,
      lastRolloverTimestamp: Date.now(),
      totalPlayers: players.length,
      promoted: totalPromoted,
      demoted: totalDemoted
    };

    const { data: checkState } = await supabase
      .from('profiles')
      .select('wallet_address')
      .eq('wallet_address', 'system_pvp_state')
      .limit(1);

    if (checkState && checkState.length > 0) {
      await supabase
        .from('profiles')
        .update({ data: updatedState, updated_at: new Date().toISOString() })
        .eq('wallet_address', 'system_pvp_state');
    } else {
      await supabase
        .from('profiles')
        .insert({ wallet_address: 'system_pvp_state', data: updatedState });
    }

    console.log(`[PVP ROLLOVER] Successfully completed for date ${todayUtc}. Promoted: ${totalPromoted}, Demoted: ${totalDemoted}`);
    return {
      rolledOver: true,
      roundDate: todayUtc,
      totalPlayers: players.length,
      promotedCount: totalPromoted,
      demotedCount: totalDemoted
    };

  } catch (err: any) {
    console.error('Error during pvp rollover execution:', err);
    return { rolledOver: false, reason: err.message };
  }
}
