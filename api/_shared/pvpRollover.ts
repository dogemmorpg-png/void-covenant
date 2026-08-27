// @ts-nocheck
import { SupabaseClient } from '@supabase/supabase-js';

export const PVP_LEAGUES = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Void Overlord'];

export interface RolloverResult {
  rolledOver: boolean;
  reason?: string;
  roundDate?: string;
  totalPlayers?: number;
  promotedCount?: number;
  demotedCount?: number;
}

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

    // 1. Fetch system state
    const { data: stateRows } = await supabase
      .from('profiles')
      .select('data')
      .eq('wallet_address', 'system_pvp_state')
      .limit(1);

    const systemState = (stateRows && stateRows.length > 0) ? stateRows[0].data : null;
    const lastRolloverDate = systemState?.lastRolloverDate;

    if (!force && lastRolloverDate && lastRolloverDate >= todayUtc) {
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

    // 3. Reset daily tickets to 5 for all players
    players.forEach(p => {
      p.profile.pvpTickets = 5;
      p.profile.pvpEnergy = 5;
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

        // Top 20 players promote to next league (if not in top league)
        if (rank <= 20 && leagueIdx < PVP_LEAGUES.length - 1) {
          const nextLeague = PVP_LEAGUES[leagueIdx + 1];
          p.profile.pvpLeague = nextLeague;
          p.profile.pvpLP = 100;
          totalPromoted++;
        }
        // Players below rank 100 demote to previous league (if not in Bronze)
        else if (rank > 100 && leagueIdx > 0) {
          const prevLeague = PVP_LEAGUES[leagueIdx - 1];
          p.profile.pvpLeague = prevLeague;
          p.profile.pvpLP = 100;
          totalDemoted++;
        }
        // Rank 21-100 (or at boundaries): retain in current league with fresh round LP
        else {
          p.profile.pvpLP = 100;
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
