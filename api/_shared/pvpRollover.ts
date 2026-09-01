// @ts-nocheck
import { SupabaseClient } from '@supabase/supabase-js';

export const PVP_LEAGUES = [
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

export const DEFAULT_LEAGUE_REWARDS = [
  {
    name: 'Void Overlord',
    badge: '👑',
    icon: '/icons/league_void_overlord.png',
    tierIndex: 9,
    brackets: [
      { rankLabel: 'Rank #1 Sovereign', sovereigns: 600, gold: 7500, dust: 750 },
      { rankLabel: 'Ranks #2 – #3', sovereigns: 350, gold: 4500, dust: 450 },
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
    brackets: [
      { rankLabel: 'Ranks #1 – #5', sovereigns: 75, gold: 2500, dust: 250, isPromotion: true },
      { rankLabel: 'Ranks #6 – #20', sovereigns: 40, gold: 1500, dust: 150, isPromotion: true },
      { rankLabel: 'Ranks #21 – #100', sovereigns: 20, gold: 850, dust: 85, isSafe: true },
      { rankLabel: 'Ranks #101+', sovereigns: 20, gold: 850, dust: 85, isDemotion: true }
    ]
  },
  {
    name: 'Master',
    badge: '⚔️',
    icon: '/icons/league_master_crest.png',
    tierIndex: 7,
    brackets: [
      { rankLabel: 'Ranks #1 – #10', sovereigns: 30, gold: 1800, dust: 180, isPromotion: true },
      { rankLabel: 'Ranks #11 – #20', sovereigns: 15, gold: 750, dust: 75, isPromotion: true },
      { rankLabel: 'Ranks #21 – #100', sovereigns: 15, gold: 750, dust: 75, isSafe: true },
      { rankLabel: 'Ranks #101+', sovereigns: 15, gold: 750, dust: 75, isDemotion: true }
    ]
  },
  {
    name: 'Diamond',
    badge: '💎',
    icon: '/icons/league_diamond.png',
    tierIndex: 6,
    brackets: [
      { rankLabel: 'Ranks #1 – #10', sovereigns: 20, gold: 1200, dust: 120, isPromotion: true },
      { rankLabel: 'Ranks #11 – #20', sovereigns: 8, gold: 600, dust: 60, isPromotion: true },
      { rankLabel: 'Ranks #21 – #100', sovereigns: 8, gold: 600, dust: 60, isSafe: true },
      { rankLabel: 'Ranks #101+', sovereigns: 8, gold: 600, dust: 60, isDemotion: true }
    ]
  },
  {
    name: 'Ruby',
    badge: '🩸',
    icon: '/icons/league_ruby_crest.png',
    tierIndex: 5,
    brackets: [
      { rankLabel: 'Ranks #1 – #10', sovereigns: 10, gold: 900, dust: 90, isPromotion: true },
      { rankLabel: 'Ranks #11 – #20', sovereigns: 3, gold: 500, dust: 50, isPromotion: true },
      { rankLabel: 'Ranks #21 – #100', sovereigns: 3, gold: 500, dust: 50, isSafe: true },
      { rankLabel: 'Ranks #101+', sovereigns: 3, gold: 500, dust: 50, isDemotion: true }
    ]
  },
  {
    name: 'Emerald',
    badge: '❇️',
    icon: '/icons/league_emerald_crest.png',
    tierIndex: 4,
    brackets: [
      { rankLabel: 'Ranks #1 – #10', sovereigns: 5, gold: 700, dust: 70, isPromotion: true },
      { rankLabel: 'Ranks #11 – #20', sovereigns: 2, gold: 400, dust: 40, isPromotion: true },
      { rankLabel: 'Ranks #21 – #100', sovereigns: 2, gold: 400, dust: 40, isSafe: true },
      { rankLabel: 'Ranks #101+', sovereigns: 2, gold: 400, dust: 40, isDemotion: true }
    ]
  },
  {
    name: 'Platinum',
    badge: '🔮',
    icon: '/icons/league_platinum.png',
    tierIndex: 3,
    brackets: [
      { rankLabel: 'Ranks #1 – #20', gold: 350, dust: 35, isPromotion: true },
      { rankLabel: 'Ranks #21 – #100', gold: 350, dust: 35, isSafe: true },
      { rankLabel: 'Ranks #101+', gold: 350, dust: 35, isDemotion: true }
    ]
  },
  {
    name: 'Gold',
    badge: '🥇',
    icon: '/icons/league_gold.png',
    tierIndex: 2,
    brackets: [
      { rankLabel: 'Ranks #1 – #20', gold: 250, dust: 25, isPromotion: true },
      { rankLabel: 'Ranks #21 – #100', gold: 250, dust: 25, isSafe: true },
      { rankLabel: 'Ranks #101+', gold: 250, dust: 25, isDemotion: true }
    ]
  },
  {
    name: 'Silver',
    badge: '🥈',
    icon: '/icons/league_silver.png',
    tierIndex: 1,
    brackets: [
      { rankLabel: 'Ranks #1 – #20', gold: 175, dust: 20, isPromotion: true },
      { rankLabel: 'Ranks #21 – #100', gold: 175, dust: 20, isSafe: true },
      { rankLabel: 'Ranks #101+', gold: 175, dust: 20, isDemotion: true }
    ]
  },
  {
    name: 'Bronze',
    badge: '🥉',
    icon: '/icons/league_bronze.png',
    tierIndex: 0,
    brackets: [
      { rankLabel: 'Ranks #1 – #20', gold: 120, dust: 15, isPromotion: true },
      { rankLabel: 'Ranks #21+', gold: 120, dust: 15, isSafe: true }
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
    const label = b.rankLabel || '';
    if (label.includes('#1 Sovereign') || label === 'Rank #1') {
      if (rank === 1) return { gold: Number(b.gold) || 0, dust: Number(b.dust) || 0, sovereigns: Number(b.sovereigns) || 0 };
    } else if (label.includes('#2 – #3') || label.includes('#2 - #3')) {
      if (rank >= 2 && rank <= 3) return { gold: Number(b.gold) || 0, dust: Number(b.dust) || 0, sovereigns: Number(b.sovereigns) || 0 };
    } else if (label.includes('#4 – #10') || label.includes('#4 - #10')) {
      if (rank >= 4 && rank <= 10) return { gold: Number(b.gold) || 0, dust: Number(b.dust) || 0, sovereigns: Number(b.sovereigns) || 0 };
    } else if (label.includes('#1 – #5') || label.includes('#1 - #5')) {
      if (rank >= 1 && rank <= 5) return { gold: Number(b.gold) || 0, dust: Number(b.dust) || 0, sovereigns: Number(b.sovereigns) || 0 };
    } else if (label.includes('#6 – #20') || label.includes('#6 - #20')) {
      if (rank >= 6 && rank <= 20) return { gold: Number(b.gold) || 0, dust: Number(b.dust) || 0, sovereigns: Number(b.sovereigns) || 0 };
    } else if (label.includes('#1 – #10') || label.includes('#1 - #10')) {
      if (rank >= 1 && rank <= 10) return { gold: Number(b.gold) || 0, dust: Number(b.dust) || 0, sovereigns: Number(b.sovereigns) || 0 };
    } else if (label.includes('#11 – #20') || label.includes('#11 - #20')) {
      if (rank >= 11 && rank <= 20) return { gold: Number(b.gold) || 0, dust: Number(b.dust) || 0, sovereigns: Number(b.sovereigns) || 0 };
    } else if (label.includes('#1 – #20') || label.includes('#1 - #20')) {
      if (rank >= 1 && rank <= 20) return { gold: Number(b.gold) || 0, dust: Number(b.dust) || 0, sovereigns: Number(b.sovereigns) || 0 };
    } else if (label.includes('#21 – #100') || label.includes('#21 - #100')) {
      if (rank >= 21 && rank <= 100) return { gold: Number(b.gold) || 0, dust: Number(b.dust) || 0, sovereigns: Number(b.sovereigns) || 0 };
    } else if (label.includes('#101+') || label.includes('#21+')) {
      if (rank >= 21) return { gold: Number(b.gold) || 0, dust: Number(b.dust) || 0, sovereigns: Number(b.sovereigns) || 0 };
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
    const { data: stateRows } = await supabase
      .from('profiles')
      .select('data')
      .eq('wallet_address', 'system_pvp_state')
      .limit(1);

    const systemState = (stateRows && stateRows.length > 0) ? stateRows[0].data : null;
    const lastRolloverDate = systemState?.lastRolloverDate;

    if (!force && lastRolloverDate && lastRolloverDate >= todayUtc) {
      cachedRolloverDate = todayUtc;
      return { rolledOver: false, reason: 'already_completed_today', roundDate: lastRolloverDate };
    }

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

    // 4. Reset daily tickets to 5 for all players, keeping bonus tickets intact
    players.forEach(p => {
      p.profile.pvpEnergy = 5;
      p.profile.pvpEnergyMax = 5;
      p.profile.pvpBonusTickets = p.profile.pvpBonusTickets || 0;
      p.profile.pvpTickets = 5 + p.profile.pvpBonusTickets;
    });

    let totalPromoted = 0;
    let totalDemoted = 0;

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

      for (let i = 0; i < count; i++) {
        const p = leaguePlayers[i];
        const rank = i + 1;
        let promoStatus = '';

        // Top 20 players promote to next league (if not in top league)
        if (rank <= 20 && leagueIdx < PVP_LEAGUES.length - 1) {
          const nextLeague = PVP_LEAGUES[leagueIdx + 1];
          p.profile.pvpLeague = nextLeague;
          p.profile.pvpLP = 100;
          totalPromoted++;
          promoStatus = `⚔️ PROMOTION! You have ascended to the ${nextLeague} League!`;
        }
        // Players below rank 100 demote to previous league (if not in Bronze)
        else if (rank > 100 && leagueIdx > 0) {
          const prevLeague = PVP_LEAGUES[leagueIdx - 1];
          p.profile.pvpLeague = prevLeague;
          p.profile.pvpLP = 100;
          totalDemoted++;
          promoStatus = `🔻 DEMOTION: You have fallen to the ${prevLeague} League. Reclaim your honor!`;
        }
        // Rank 21-100 (or at boundaries): retain in current league with fresh round LP
        else {
          p.profile.pvpLP = 100;
          promoStatus = `🛡️ RETAINED: You maintain your standing in the ${leagueName} League.`;
        }

        // Calculate Rewards dynamically based on config & Rank
        const calculated = calculateLeagueRewards(customLeagueConfig, leagueName, rank);
        const goldReward = calculated.gold;
        const dustReward = calculated.dust;
        const sovereignsReward = calculated.sovereigns;

        // Generate Mail Message for Player Inbox
        const mailMessage = {
          id: `mail_pvp_${todayUtc}_${p.walletAddress.slice(-4)}_${rank}`,
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

        p.profile.mailMessages = [mailMessage, ...(p.profile.mailMessages || [])].slice(0, 50);
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
