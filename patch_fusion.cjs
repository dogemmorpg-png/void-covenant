const fs = require('fs');
let content = fs.readFileSync('api/fusion.ts', 'utf8');

// 1. Add updated_at to select
content = content.replace(
  /\.select\('data'\)/,
  `.select('data, updated_at')`
);

// 2. Define oldUpdatedAt
content = content.replace(
  /let profile: PlayerProfile;[\r\n\s]*if \(!profileRow\) \{/m,
  `let profile: PlayerProfile;\n    let oldUpdatedAt = profileRow ? profileRow.updated_at : null;\n\n    if (!profileRow) {`
);

// 3. Update query and OCC check
content = content.replace(
  /const \{ error: updateError \} = await supabase[\s\S]*?\.eq\('wallet_address', walletAddress\);[\s\S]*?if \(updateError\) \{[\s\S]*?console\.error\('Fusion update error:', updateError\);[\s\S]*?return res\.status\(500\)\.json\(\{ error: 'Failed to update profile\.' \}\);[\s\S]*?\}/m,
  `const newUpdatedAt = new Date().toISOString();
    let updateQuery = supabase
      .from('profiles')
      .update({ data: profile, updated_at: newUpdatedAt })
      .eq('wallet_address', walletAddress);

    if (oldUpdatedAt) {
      updateQuery = updateQuery.eq('updated_at', oldUpdatedAt);
    }

    const { data: updateResult, error: updateError } = await updateQuery.select('wallet_address');

    if (updateError || !updateResult || updateResult.length === 0) {
      console.error('Fusion OCC conflict');
      return res.status(409).json({ error: 'Conflict: Please try again' });
    }

    if (updateError) {
      console.error('Fusion update error:', updateError);
      return res.status(500).json({ error: 'Failed to update profile.' });
    }`
);

fs.writeFileSync('api/fusion.ts', content);
console.log('Successfully patched api/fusion.ts');
