const fs = require('fs');
let content = fs.readFileSync('api/battle.ts', 'utf8');

const oldCheck = `      if (battleType === 'campaign') {
        const floorNum = parseInt(stageId);
        if (isNaN(floorNum)) return res.status(400).json({ error: 'Invalid campaign stage' });`;

const newCheck = `      if (battleType === 'campaign') {
        const floorNum = parseInt(stageId);
        if (isNaN(floorNum) || floorNum <= 0) return res.status(400).json({ error: 'Invalid campaign stage' });
        
        // Anti-cheat: prevent skipping levels
        if (floorNum > (profile.pveProgress || 1)) {
          return res.status(400).json({ error: 'This stage is locked!' });
        }`;

content = content.replace(oldCheck, newCheck);
fs.writeFileSync('api/battle.ts', content);
console.log('Patched battle.ts');
