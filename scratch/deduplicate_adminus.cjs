const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yetzjqqnmllwufmzopor.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlldHpqcXFubWxsd3VmbXpvcG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NTkwMzgsImV4cCI6MjA5ODMzNTAzOH0.Ra2mdK9QS4Aq5WZsUmULvqfdaJkdLJBcEzPch9EpwB4';
const supabase = createClient(supabaseUrl, supabaseKey);

const originalData = JSON.parse(fs.readFileSync('scratch/adminus_data.json', 'utf8'));

async function deduplicateAndSave() {
  const collection = originalData.collection || [];
  
  // Filter out duplicates, keeping only unique cards by baseId
  const uniqueCollection = [];
  const seenIds = new Set();
  
  for (const card of collection) {
    const baseId = card.baseId || card.templateId || card.id;
    if (!seenIds.has(baseId)) {
      seenIds.add(baseId);
      uniqueCollection.push(card);
    }
  }

  const finalCollection = uniqueCollection.slice(0, 40);
  console.log(`Deduplicating cards: original ${collection.length} -> unique ${uniqueCollection.length} -> sliced to ${finalCollection.length}`);
  
  const profile = { ...originalData };
  profile.collection = finalCollection;
  profile.pvpLeague = 'Silver';
  profile.pvpLP = 100;
  profile.pvpRating = 100;

  console.log('Saving cleaned Adminus profile...');
  
  let success = false;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ data: profile, updated_at: new Date().toISOString() })
        .eq('wallet_address', 'BxxQjEStvpcbWLbSnwL19rjbGmvND1J5pEBRShWFoYNr')
        .select('wallet_address');

      if (error) throw error;
      
      console.log('Successfully saved Adminus profile! Result:', data);
      success = true;
      break;
    } catch (err) {
      console.error(`Attempt ${attempt} failed:`, err.message || err);
      if (attempt < 5) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }

  if (!success) {
    console.error('Failed to save profile after 5 attempts.');
    process.exit(1);
  }
  
  process.exit(0);
}

deduplicateAndSave();
