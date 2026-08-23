const fs = require('fs');
let content = fs.readFileSync('api/action.ts', 'utf8');

const oldCheck = `      const floorNum = parseInt(payload.floorNum);
      if (isNaN(floorNum)) return res.status(400).json({ error: 'Invalid floor number' });`;

const newCheck = `      const floorNum = parseInt(payload.floorNum);
      if (isNaN(floorNum) || floorNum <= 0) return res.status(400).json({ error: 'Invalid floor number' });
      
      // Anti-cheat: prevent sweeping locked levels
      if (floorNum > (profile.pveProgress || 1)) {
        return res.status(400).json({ error: 'This stage is locked!' });
      }`;

content = content.replace(oldCheck, newCheck);
fs.writeFileSync('api/action.ts', content);
console.log('Patched action.ts');
