const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yetzjqqnmllwufmzopor.supabase.co';
// Using service role key to bypass RLS and perform database-wide administrative rollover
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlldHpqcXFubWxsd3VmbXpvcG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NTkwMzgsImV4cCI6MjA5ODMzNTAzOH0.Ra2mdK9QS4Aq5WZsUmULvqfdaJkdLJBcEzPch9EpwB4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runManualRollover() {
  console.log('Fetching all player profiles...');
  const { data: rows, error } = await supabase
    .from('profiles')
    .select('wallet_address, data');

  if (error) {
    console.error('Failed to query profiles:', error);
    process.exit(1);
  }

  console.log(`Found ${rows.length} profiles. Processing leagues...`);

  const players = (rows || []).map(r => ({
    walletAddress: r.wallet_address,
    profile: r.data || {},
    originalLeague: r.data?.pvpLeague || 'Bronze'
  }));

  const updates = [];
  const LEAGUES = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Void Overlord'];

  for (const league of LEAGUES) {
    const leaguePlayers = players.filter(p => p.originalLeague === league);
    
    leaguePlayers.forEach(p => {
      if (p.profile.pvpLP === undefined) p.profile.pvpLP = 0;
      if (p.profile.pvpRating === undefined) p.profile.pvpRating = 100;
    });

    // Sort by LP descending, tie breaker hidden MMR rating descending
    leaguePlayers.sort((a, b) => (b.profile.pvpLP - a.profile.pvpLP) || (b.profile.pvpRating - a.profile.pvpRating));
    const leagueIdx = LEAGUES.indexOf(league);

    console.log(`League [${league}]: ${leaguePlayers.length} players`);
    
    for (let i = 0; i < leaguePlayers.length; i++) {
      const p = leaguePlayers[i];
      const rank = i + 1;
      let modified = false;

      // Promote top 20
      if (rank <= 20 && leagueIdx < LEAGUES.length - 1) {
        const nextLeague = LEAGUES[leagueIdx + 1];
        console.log(`  Player ${p.profile.username || p.walletAddress} (Rank #${rank}) promotes: ${league} -> ${nextLeague}`);
        p.profile.pvpLeague = nextLeague;
        p.profile.pvpLP = 100;
        modified = true;
      }
      // Demote below 100
      else if (rank > 100 && leagueIdx > 0) {
        const prevLeague = LEAGUES[leagueIdx - 1];
        console.log(`  Player ${p.profile.username || p.walletAddress} (Rank #${rank}) demotes: ${league} -> ${prevLeague}`);
        p.profile.pvpLeague = prevLeague;
        p.profile.pvpLP = 100;
        modified = true;
      }

      if (modified) {
        updates.push(p);
      }
    }
  }

  console.log(`Applying updates to ${updates.length} profiles...`);
  let updatedCount = 0;
  for (const update of updates) {
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ data: update.profile, updated_at: new Date().toISOString() })
      .eq('wallet_address', update.walletAddress);

    if (updateError) {
      console.error(`Failed to update profile for ${update.walletAddress}:`, updateError);
    } else {
      updatedCount++;
    }
  }

  console.log(`Manual daily rollover complete! Successfully transitioned ${updatedCount} players.`);
  process.exit(0);
}

runManualRollover();
