const fs = require('fs');
let content = fs.readFileSync('api/sync.ts', 'utf8');

content = content.replace(
  /if \(safeProfileData\.avatarUrl\) currentProfile\.avatarUrl = safeProfileData\.avatarUrl;/,
  `if (safeProfileData.avatarUrl) currentProfile.avatarUrl = safeProfileData.avatarUrl;
      if (safeProfileData.talents) currentProfile.talents = safeProfileData.talents;
      if (safeProfileData.activeStance) currentProfile.activeStance = safeProfileData.activeStance;`
);

fs.writeFileSync('api/sync.ts', content);
console.log('Patched sync.ts');
