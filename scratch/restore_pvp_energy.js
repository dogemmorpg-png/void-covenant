const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yetzjqqnmllwufmzopor.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlldHpqcXFubWxsd3VmbXpvcG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NTkwMzgsImV4cCI6MjA5ODMzNTAzOH0.Ra2mdK9QS4Aq5WZsUmULvqfdaJkdLJBcEzPch9EpwB4';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Searching for user "adminus"...');
  const { data: rows, error } = await supabase
    .from('profiles')
    .select('id, wallet_address, data');

  if (error) {
    console.error('Failed to query profiles:', error);
    return;
  }

  const target = rows.find(r => r.data && r.data.username && r.data.username.toLowerCase() === 'adminus');
  if (target) {
    console.log(`Found user: ${target.data.username} (Wallet: ${target.wallet_address})`);
    const updatedData = {
      ...target.data,
      pvpEnergy: target.data.pvpEnergyMax || 5,
      lastPvpEnergyRefill: Date.now()
    };

    const { data: updateRes, error: updateErr } = await supabase
      .from('profiles')
      .update({ data: updatedData, updated_at: new Date().toISOString() })
      .eq('wallet_address', target.wallet_address)
      .select('wallet_address');

    if (updateErr) {
      console.error('Failed to update energy:', updateErr);
    } else {
      console.log(`Successfully restored PvP energy to ${updatedData.pvpEnergy} for ${target.data.username}!`);
    }
  } else {
    console.log('User "adminus" not found. Registered usernames list:');
    rows.forEach(r => {
      if (r.data && r.data.username) {
        console.log(`- ${r.data.username} (${r.wallet_address})`);
      }
    });
  }
}
run();
