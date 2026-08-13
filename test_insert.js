import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://yetzjqqnmllwufmzopor.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlldHpqcXFubWxsd3VmbXpvcG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NTkwMzgsImV4cCI6MjA5ODMzNTAzOH0.Ra2mdK9QS4Aq5WZsUmULvqfdaJkdLJBcEzPch9EpwB4');
async function run() {
  const { data, error } = await supabase.from('profiles').insert({ wallet_address: 'test_wallet', data: { gold: 1000 } });
  console.log('Error:', error);
  console.log('Data:', data);
}
run();
