const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yetzjqqnmllwufmzopor.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlldHpqcXFubWxsd3VmbXpvcG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NTkwMzgsImV4cCI6MjA5ODMzNTAzOH0.Ra2mdK9QS4Aq5WZsUmULvqfdaJkdLJBcEzPch9EpwB4';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const testWallet = 'TestWallet123';
  await supabase.from('profiles').delete().eq('wallet_address', testWallet);
  
  const { data: insertData, error: e0 } = await supabase.from('profiles').insert({ wallet_address: testWallet, data: { test: true } }).select('wallet_address, updated_at');
  console.log("Insert:", insertData, e0);
  
  if (!insertData || insertData.length === 0) return;
  const row = insertData[0];
  
  const newDate = new Date().toISOString();
  let updateQuery = supabase
    .from('profiles')
    .update({ data: { test: false }, updated_at: newDate })
    .eq('wallet_address', testWallet);
    
  if (row.updated_at) {
    updateQuery = updateQuery.eq('updated_at', row.updated_at);
  }
  
  const { data: updateResult, error: e1 } = await updateQuery.select('wallet_address, updated_at');
  console.log("OCC Update:", updateResult, e1);
  
  if (updateResult && updateResult.length > 0) {
    console.log("OCC SUCCESS!");
  } else {
    console.log("OCC FAILED! Conflict or precision issue.");
  }
}
run();
