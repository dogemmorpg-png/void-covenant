const fs = require('fs');

// 1. Patch GameContext.tsx
let gameCtx = fs.readFileSync('src/context/GameContext.tsx', 'utf8');

// Fix setInterval energy spam
gameCtx = gameCtx.replace(
  /if \(\s*updated\.pveEnergy !== current\.pveEnergy \|\|\s*updated\.pvpEnergy !== current\.pvpEnergy\s*\) \{\s*saveProfile\(updated\);\s*return updated;\s*\}/,
  `if (\n            updated.pveEnergy !== current.pveEnergy || \n            updated.pvpEnergy !== current.pvpEnergy\n          ) {\n            // Do not call saveProfile here to avoid server spam and OCC conflicts\n            return updated;\n          }`
);

// Fix useEffect collection sync spam
gameCtx = gameCtx.replace(
  /if \(updated\) \{\s*const updatedProfile = \{ \.\.\.profile, collection: newCollection \};\s*setProfile\(updatedProfile\);\s*saveProfile\(updatedProfile\);\s*\}/,
  `if (updated) {\n        const updatedProfile = { ...profile, collection: newCollection };\n        setProfile(updatedProfile);\n        // Do not call saveProfile here to avoid OCC conflicts right after gacha\n      }`
);

// Fix local fallback sweep_stage energy deduction
gameCtx = gameCtx.replace(
  /updated\.gold = \(updated\.gold \|\| 0\) \+ goldReward;/,
  `updated.pveEnergy = Math.max(0, (updated.pveEnergy || 0) - (payload?.energyCost || 3));\n        updated.gold = (updated.gold || 0) + goldReward;`
);

fs.writeFileSync('src/context/GameContext.tsx', gameCtx);

// 2. Patch api/sync.ts for OCC
let syncApi = fs.readFileSync('api/sync.ts', 'utf8');
syncApi = syncApi.replace(
  /const \{ data: profileRows, error: fetchError \} = await supabase\s*\n\s*\.from\('profiles'\)\s*\n\s*\.select\('data'\)/,
  `const { data: profileRows, error: fetchError } = await supabase\n      .from('profiles')\n      .select('data, updated_at')`
);
syncApi = syncApi.replace(
  /let currentProfile: any;/,
  `let currentProfile: any;\n    let oldUpdatedAt = profileRow ? profileRow.updated_at : null;`
);
syncApi = syncApi.replace(
  /const \{ error: updateError \} = await supabase\s*\n\s*\.from\('profiles'\)\s*\n\s*\.update\(\{ data: currentProfile, updated_at: new Date\(\)\.toISOString\(\) \}\)\s*\n\s*\.eq\('wallet_address', walletAddress\);/,
  `const newUpdatedAt = new Date().toISOString();\n    let updateQuery = supabase\n      .from('profiles')\n      .update({ data: currentProfile, updated_at: newUpdatedAt })\n      .eq('wallet_address', walletAddress);\n    if (oldUpdatedAt) {\n      updateQuery = updateQuery.eq('updated_at', oldUpdatedAt);\n    }\n    const { data: updateResult, error: updateError } = await updateQuery.select('id');\n    if (updateError || !updateResult || updateResult.length === 0) {\n      console.error('Sync API OCC conflict');\n      return res.status(409).json({ error: 'Conflict: Please try again' });\n    }`
);
fs.writeFileSync('api/sync.ts', syncApi);

// 3. Patch api/action.ts for OCC
let actionApi = fs.readFileSync('api/action.ts', 'utf8');
actionApi = actionApi.replace(
  /const \{ data: profileRows, error: fetchError \} = await supabase\s*\n\s*\.from\('profiles'\)\s*\n\s*\.select\('data'\)/,
  `const { data: profileRows, error: fetchError } = await supabase\n      .from('profiles')\n      .select('data, updated_at')`
);
actionApi = actionApi.replace(
  /let profile: PlayerProfile;/,
  `let profile: PlayerProfile;\n    let oldUpdatedAt = profileRow ? profileRow.updated_at : null;`
);
actionApi = actionApi.replace(
  /const \{ error: updateError \} = await supabase\s*\n\s*\.from\('profiles'\)\s*\n\s*\.update\(\{ data: profile, updated_at: new Date\(\)\.toISOString\(\) \}\)\s*\n\s*\.eq\('wallet_address', walletAddress\);/,
  `const newUpdatedAt = new Date().toISOString();\n    let updateQuery = supabase\n      .from('profiles')\n      .update({ data: profile, updated_at: newUpdatedAt })\n      .eq('wallet_address', walletAddress);\n    if (oldUpdatedAt) {\n      updateQuery = updateQuery.eq('updated_at', oldUpdatedAt);\n    }\n    const { data: updateResult, error: updateError } = await updateQuery.select('id');\n    if (updateError || !updateResult || updateResult.length === 0) {\n      return res.status(409).json({ error: 'Conflict: Please try again' });\n    }`
);
fs.writeFileSync('api/action.ts', actionApi);

console.log('Patch complete.');
