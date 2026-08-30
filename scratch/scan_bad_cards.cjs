const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yetzjqqnmllwufmzopor.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlldHpqcXFubWxsd3VmbXpvcG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NTkwMzgsImV4cCI6MjA5ODMzNTAzOH0.Ra2mdK9QS4Aq5WZsUmULvqfdaJkdLJBcEzPch9EpwB4';
const supabase = createClient(supabaseUrl, supabaseKey);

const originalData = JSON.parse(fs.readFileSync('scratch/adminus_data.json', 'utf8'));
const fullCollection = originalData.collection || [];

async function testSubset(cards) {
  const profile = { ...originalData };
  profile.collection = cards;
  profile.pvpLeague = 'Silver';
  profile.pvpLP = 100;
  profile.pvpRating = 100;

  try {
    const { error } = await supabase
      .from('profiles')
      .update({ data: profile, updated_at: new Date().toISOString() })
      .eq('wallet_address', 'BxxQjEStvpcbWLbSnwL19rjbGmvND1J5pEBRShWFoYNr')
      .select('wallet_address');
      
    if (error) {
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err };
  }
}

async function findBadCards() {
  console.log(`Starting binary search on ${fullCollection.length} cards...`);
  
  // Test individual cards or run binary check
  let badIndices = [];
  
  for (let i = 0; i < fullCollection.length; i++) {
    process.stdout.write(`Testing card #${i} (${fullCollection[i].name})... `);
    const res = await testSubset([fullCollection[i]]);
    if (res.success) {
      console.log('OK');
    } else {
      console.log('🔴 FAILED!');
      badIndices.push(i);
    }
    // Delay to prevent spamming
    await new Promise(r => setTimeout(r, 200));
  }
  
  console.log('Search complete! Bad card indices:', badIndices);
  badIndices.forEach(idx => {
    console.log(`- Card #${idx}:`, JSON.stringify(fullCollection[idx], null, 2));
  });
}

findBadCards();
