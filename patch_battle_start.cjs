const fs = require('fs');
let content = fs.readFileSync('api/battle-start.ts', 'utf8');

// 1. Add updated_at to select
content = content.replace(
  /\.select\('data'\)/,
  `.select('data, updated_at')`
);

// 2. Fetch oldUpdatedAt
content = content.replace(
  /const profile = profileRow\.data;[\r\n\s]*const oldVersion = profile\.version;/,
  `const profile = profileRow.data;\n    const oldUpdatedAt = profileRow.updated_at;`
);

// 3. Remove profile.version mutation
content = content.replace(
  /profile\.version = \(oldVersion \|\| 0\) \+ 1;/,
  ``
);

// 4. Update query
content = content.replace(
  /if \(oldVersion === undefined\) \{[\s\S]*?\} else \{[\s\S]*?\}/,
  `if (oldUpdatedAt) {
      updateQuery = updateQuery.eq('updated_at', oldUpdatedAt);
    }`
);

fs.writeFileSync('api/battle-start.ts', content);
console.log('Patched battle-start.ts');
