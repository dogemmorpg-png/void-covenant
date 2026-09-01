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

    // 2. Fetch all real player profiles
    const { data: profileRows, error: fetchError } = await supabase
      .from('profiles')
      .select('wallet_address, data')
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

    // 3. Reset daily tickets to 5 for all players, keeping bonus tickets intact
    players.forEach(p => {
      p.profile.pvpEnergy = 5;
      p.profile.pvpEnergyMax = 5;
      p.profile.pvpBonusTickets = p.profile.pvpBonusTickets || 0;
      p.profile.pvpTickets = 5 + p.profile.pvpBonusTickets;
    });

    let totalPromoted = 0;
    let totalDemoted = 0;

    // 4. Process each league
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

        // Calculate Rewards based on League & Rank
        // Calculate Rewards based on League & Rank (No dark shards - rebalanced to Sovereigns, Gold & Dust)
        let goldReward = 120;
        let dustReward = 15;
        let sovereignsReward = 0;

        if (leagueName === 'Void Overlord') {
          if (rank === 1) { sovereignsReward = 600; goldReward = 7500; dustReward = 750; }
          else if (rank <= 3) { sovereignsReward = 350; goldReward = 4500; dustReward = 450; }
          else if (rank <= 10) { sovereignsReward = 180; goldReward = 3000; dustReward = 300; }
          else if (rank <= 20) { sovereignsReward = 100; goldReward = 1500; dustReward = 150; }
          else { sovereignsReward = 40; goldReward = 800; dustReward = 80; }
        } else if (leagueName === 'Grandmaster') {
          if (rank <= 5) { sovereignsReward = 75; goldReward = 2500; dustReward = 250; }
          else if (rank <= 20) { sovereignsReward = 40; goldReward = 1500; dustReward = 150; }
          else { sovereignsReward = 20; goldReward = 850; dustReward = 85; }
        } else if (leagueName === 'Master') {
          if (rank <= 10) { sovereignsReward = 30; goldReward = 1800; dustReward = 180; }
          else { sovereignsReward = 15; goldReward = 750; dustReward = 75; }
        } else if (leagueName === 'Diamond') {
          if (rank <= 10) { sovereignsReward = 20; goldReward = 1200; dustReward = 120; }
          else { sovereignsReward = 8; goldReward = 600; dustReward = 60; }
        } else if (leagueName === 'Ruby') {
          if (rank <= 10) { sovereignsReward = 10; goldReward = 900; dustReward = 90; }
          else { sovereignsReward = 3; goldReward = 500; dustReward = 50; }
        } else if (leagueName === 'Emerald') {
          if (rank <= 10) { sovereignsReward = 5; goldReward = 700; dustReward = 70; }
          else { sovereignsReward = 2; goldReward = 400; dustReward = 40; }
        } else if (leagueName === 'Platinum') {
          goldReward = 350; dustReward = 35;
        } else if (leagueName === 'Gold') {
          goldReward = 250; dustReward = 25;
        } else if (leagueName === 'Silver') {
          goldReward = 175; dustReward = 20;
        } else {
          goldReward = 120; dustReward = 15;
        }

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
