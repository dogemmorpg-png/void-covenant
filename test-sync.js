
const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://yetzjqqnmllwufmzopor.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlldHpqcXFubWxsd3VmbXpvcG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NTkwMzgsImV4cCI6MjA5ODMzNTAzOH0.Ra2mdK9QS4Aq5WZsUmULvqfdaJkdLJBcEzPch9EpwB4';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  const { data, error } = await supabase
      .from('profiles')
      .select('id, data')
      .eq('wallet_address', '8kG7uAhM9tF9hM4d76B55aWn52R5o22u4tYw1sV1Q6hR')
      .single();
  console.log('single():', data, error);
}
test();

