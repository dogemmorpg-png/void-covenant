
const SUPABASE_URL = 'https://yetzjqqnmllwufmzopor.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlldHpqcXFubWxsd3VmbXpvcG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NTkwMzgsImV4cCI6MjA5ODMzNTAzOH0.Ra2mdK9QS4Aq5WZsUmULvqfdaJkdLJBcEzPch9EpwB4';
async function test() {
  const profileRes = await fetch(SUPABASE_URL + '/rest/v1/profiles', {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY
      }
  });
  const json = await profileRes.json();
  console.log(JSON.stringify(json.map(r => ({ id: r.id, wallet_address: r.wallet_address, shards: r.data?.darkShards, pveProgress: r.data?.pveProgress, gold: r.data?.gold })), null, 2));
}
test();

