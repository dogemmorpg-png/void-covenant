const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yetzjqqnmllwufmzopor.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlldHpqcXFubWxsd3VmbXpvcG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NTkwMzgsImV4cCI6MjA5ODMzNTAzOH0.Ra2mdK9QS4Aq5WZsUmULvqfdaJkdLJBcEzPch9EpwB4';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, data, updated_at')
    .limit(1);
    
  if (data && data.length > 0) {
    const row = data[0];
    const oldVersion = row.data.version || 0;
    console.log('Old version:', oldVersion);
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({ data: { ...row.data, version: oldVersion + 1 } })
      .eq('id', row.id)
      .eq('data->>version', String(oldVersion))
      .select('id');
    
    console.log('Update result JSON eq:', updateData, updateError);
    
    const oldUpdatedAt = row.updated_at;
    console.log('Old updated_at:', oldUpdatedAt);
    if (oldUpdatedAt) {
        const { data: updateData2, error: updateError2 } = await supabase
          .from('profiles')
          .update({ data: { ...row.data, version: oldVersion + 2 } })
          .eq('id', row.id)
          .eq('updated_at', oldUpdatedAt)
          .select('id');
        console.log('Update result updated_at eq:', updateData2, updateError2);
    }
  } else {
    console.log('No data found');
  }
}
test();
