import { createClient } from '@supabase/supabase-js';

const walletAddress = 'test_wallet_2';
const supabase = createClient('https://yetzjqqnmllwufmzopor.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlldHpqcXFubWxsd3VmbXpvcG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NTkwMzgsImV4cCI6MjA5ODMzNTAzOH0.Ra2mdK9QS4Aq5WZsUmULvqfdaJkdLJBcEzPch9EpwB4');

async function run() {
    const { data: profileRows, error: fetchError } = await supabase
      .from('profiles')
      .select('data')
      .eq('wallet_address', walletAddress)
      .limit(1);

    if (fetchError) {
      console.log('fetchError:', fetchError);
      return;
    }

    const profileRow = profileRows && profileRows.length > 0 ? profileRows[0] : null;
    let currentProfile = { gold: 500, dust: 100, darkShards: 0, solanaAddress: walletAddress };

    if (!profileRow) {
      const { data: existingCheck } = await supabase.from('profiles').select('id').eq('wallet_address', walletAddress).limit(1);
      if (!existingCheck || existingCheck.length === 0) {
        const { error: insertError } = await supabase.from('profiles').insert({ wallet_address: walletAddress, data: currentProfile });
        if (insertError) {
          console.error('insertError:', insertError);
          return;
        }
      }
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ data: currentProfile, updated_at: new Date().toISOString() })
      .eq('wallet_address', walletAddress);

    if (updateError) {
      console.error('updateError:', updateError);
      return;
    }

    console.log('Success!');
}
run();
