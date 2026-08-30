const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yetzjqqnmllwufmzopor.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlldHpqcXFubWxsd3VmbXpvcG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NTkwMzgsImV4cCI6MjA5ODMzNTAzOH0.Ra2mdK9QS4Aq5WZsUmULvqfdaJkdLJBcEzPch9EpwB4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectAndClean() {
  console.log('Fetching Adminus profile...');
  const { data: row, error } = await supabase
    .from('profiles')
    .select('data')
    .eq('wallet_address', 'BxxQjEStvpcbWLbSnwL19rjbGmvND1J5pEBRShWFoYNr')
    .single();

  if (error) {
    console.error('Error fetching:', error);
    process.exit(1);
  }

  const profile = row.data || {};
  console.log('Profile username:', profile.username);
  console.log('pvpHistory count:', profile.pvpHistory ? profile.pvpHistory.length : 0);
  
  if (profile.pvpHistory && profile.pvpHistory.length > 50) {
    console.log('Truncating pvpHistory to the last 20 records to save database space...');
    profile.pvpHistory = profile.pvpHistory.slice(-20);
  }
  
  profile.pvpLeague = 'Silver';
  profile.pvpLP = 100;
  profile.pvpRating = 100;

  console.log('Saving updated profile...');
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ data: profile, updated_at: new Date().toISOString() })
    .eq('wallet_address', 'BxxQjEStvpcbWLbSnwL19rjbGmvND1J5pEBRShWFoYNr');

  if (updateError) {
    console.error('Save failed:', updateError);
  } else {
    console.log('Adminus profile successfully cleaned up and reset to Silver!');
  }
  process.exit(0);
}

inspectAndClean();
