// @ts-nocheck
import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yetzjqqnmllwufmzopor.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlldHpqcXFubWxsd3VmbXpvcG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NTkwMzgsImV4cCI6MjA5ODMzNTAzOH0.Ra2mdK9QS4Aq5WZsUmULvqfdaJkdLJBcEzPch9EpwB4';
  return createClient(supabaseUrl, supabaseKey);
}

const LEAGUES = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Void Overlord'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Simple token / secret check to avoid unauthorized triggers in production
  const cronSecret = process.env.CRON_SECRET || 'void-covenant-pvp-secret-1337';
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader !== `Bearer ${cronSecret}`) {
    if (process.env.NODE_ENV === 'production') {
      return res.status(401).json({ error: 'Unauthorized cron rollover trigger' });
    }
  }

  try {
    const supabase = getSupabase();

    // Fetch all profiles
    const { data: rows, error } = await supabase
      .from('profiles')
      .select('wallet_address, data');

    if (error) {
      console.error('Failed to query profiles:', error);
      return res.status(500).json({ error: 'Database query failed' });
    }

    const players = (rows || []).map(r => ({
      walletAddress: r.wallet_address,
      profile: r.data || {}
    }));

    const updates: { walletAddress: string; profile: any }[] = [];

    // Process each league separately
    for (const league of LEAGUES) {
      const leaguePlayers = players.filter(p => (p.profile.pvpLeague || 'Bronze') === league);
      
      // Ensure all players have pvpLP initialized
      leaguePlayers.forEach(p => {
        if (p.profile.pvpLP === undefined) {
          p.profile.pvpLP = 0;
        }
        if (p.profile.pvpRating === undefined) {
          p.profile.pvpRating = 100;
        }
      });

      // Sort by LP descending (tie breaker: hidden MMR pvpRating descending)
      leaguePlayers.sort((a, b) => (b.profile.pvpLP - a.profile.pvpLP) || (b.profile.pvpRating - a.profile.pvpRating));

      const leagueIdx = LEAGUES.indexOf(league);

      for (let i = 0; i < leaguePlayers.length; i++) {
        const p = leaguePlayers[i];
        const rank = i + 1;
        let modified = false;

        // Promote top 20
        if (rank <= 20 && leagueIdx < LEAGUES.length - 1) {
          const nextLeague = LEAGUES[leagueIdx + 1];
          p.profile.pvpLeague = nextLeague;
          p.profile.pvpLP = 100; // Reset to 100 LP in the new league
          modified = true;
        }
        // Demote below 100
        else if (rank > 100 && leagueIdx > 0) {
          const prevLeague = LEAGUES[leagueIdx - 1];
          p.profile.pvpLeague = prevLeague;
          p.profile.pvpLP = 100; // Reset to 100 LP in the new league
          modified = true;
        }

        if (modified) {
          updates.push(p);
        }
      }
    }

    // Save all updates back to database
    let updatedCount = 0;
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ data: update.profile, updated_at: new Date().toISOString() })
        .eq('wallet_address', update.walletAddress);

      if (updateError) {
        console.error(`Failed to update rollover profile for ${update.walletAddress}:`, updateError);
      } else {
        updatedCount++;
      }
    }

    return res.status(200).json({
      success: true,
      message: 'PvP daily rollover complete',
      totalChecked: players.length,
      totalUpdated: updatedCount
    });

  } catch (error: any) {
    console.error('PvP Rollover API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
