const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yetzjqqnmllwufmzopor.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlldHpqcXFubWxsd3VmbXpvcG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NTkwMzgsImV4cCI6MjA5ODMzNTAzOH0.Ra2mdK9QS4Aq5WZsUmULvqfdaJkdLJBcEzPch9EpwB4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function shrinkAdminus() {
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
  console.log('Original collection size:', profile.collection ? profile.collection.length : 0);
  
  if (profile.collection && profile.collection.length > 25) {
    console.log('Shrinking collection to 25 cards...');
    profile.collection = profile.collection.slice(0, 25);
  }

  profile.pvpLeague = 'Silver';
  profile.pvpLP = 100;
  profile.pvpRating = 100;

  console.log('Saving shrunk profile...');
  const { data: updateData, error: updateError } = await supabase
    .from('profiles')
    .update({ data: profile, updated_at: new Date().toISOString() })
    .eq('wallet_address', 'BxxQjEStvpcbWLbSnwL19rjbGmvND1J5pEBRShWFoYNr')
    .select('wallet_address');

  if (updateError) {
    console.error('Save failed:', updateError);
  } else {
    console.log('Adminus profile successfully shrunk and updated! Result:', updateData);
  }
  process.exit(0);
}

shrinkAdminus();
