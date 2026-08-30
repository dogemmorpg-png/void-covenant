const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yetzjqqnmllwufmzopor.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlldHpqcXFubWxsd3VmbXpvcG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NTkwMzgsImV4cCI6MjA5ODMzNTAzOH0.Ra2mdK9QS4Aq5WZsUmULvqfdaJkdLJBcEzPch9EpwB4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixLeagues() {
  console.log('Fetching all player profiles...');
  const { data: rows, error } = await supabase
    .from('profiles')
    .select('wallet_address, data');

  if (error) {
    console.error('Failed to query profiles:', error);
    process.exit(1);
  }

  console.log(`Resetting ${rows.length} players to Silver league with 100 crowns...`);
  
  for (const row of rows) {
    const profile = row.data || {};
    profile.pvpLeague = 'Silver';
    profile.pvpLP = 100;
    profile.pvpRating = 100; // Reset hidden Elo to standard base

    let success = false;
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ data: profile, updated_at: new Date().toISOString() })
          .eq('wallet_address', row.wallet_address);

        if (updateError) {
          throw updateError;
        }

        console.log(`  Reset ${profile.username || row.wallet_address} successfully (Attempt ${attempt}).`);
        success = true;
        break;
      } catch (err) {
        console.warn(`  Attempt ${attempt} failed for ${profile.username || row.wallet_address}:`, err.message || err);
        if (attempt < 5) {
          await new Promise(r => setTimeout(r, 1000)); // 1s delay before retry
        }
      }
    }

    if (!success) {
      console.error(`🔴 Critical: Failed to reset profile for ${row.wallet_address} after 5 attempts.`);
    }
  }

  console.log('League resetting complete!');
  process.exit(0);
}

fixLeagues();
