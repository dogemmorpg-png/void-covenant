const fs = require('fs');
let content = fs.readFileSync('api/action.ts', 'utf8');

// 1. Import AIRDROP_TASKS
content = content.replace(
  /import \{ CARD_TEMPLATES, createCardInstance, generateCampaignStage, BATTLE_PASS_TIERS \} from '\.\/_shared\/cards\.js';/,
  `import { CARD_TEMPLATES, createCardInstance, generateCampaignStage, BATTLE_PASS_TIERS, AIRDROP_TASKS } from './_shared/cards.js';`
);

// 2. Fix buy_shards
content = content.replace(
  /\} else if \(action === 'buy_shards'\) \{\s*const \{ solAmount \} = payload;\s*if \(!profile\.solBalance \|\| profile\.solBalance < solAmount\) \{/,
  `} else if (action === 'buy_shards') {
      const { solAmount } = payload;
      if (solAmount <= 0 || isNaN(solAmount)) return res.status(400).json({ error: 'Invalid amount' });
      if (!profile.solBalance || profile.solBalance < solAmount) {`
);

// 3. Fix airdrop_task
const oldAirdrop = `    } else if (action === 'airdrop_task') {
      const { taskId } = payload;
      profile.completedTasks = profile.completedTasks || [];
      if (profile.completedTasks.includes(taskId)) {
        return res.status(400).json({ error: 'Task already completed' });
      }
      
      // Look up task
      const task = CARD_TEMPLATES ? null : null; // We can reward directly:
      profile.completedTasks.push(taskId);
      profile.gold = (profile.gold || 0) + 200;
      profile.battlePassPoints = (profile.battlePassPoints || 0) + 30;
      successMessage = 'Airdrop task completed (+200 Gold, +30 BP)';`;

const newAirdrop = `    } else if (action === 'airdrop_task') {
      const { taskId } = payload;
      
      const task = AIRDROP_TASKS.find((t: any) => t.id === taskId);
      if (!task) {
        return res.status(400).json({ error: 'Invalid task ID' });
      }
      
      profile.completedTasks = profile.completedTasks || [];
      if (profile.completedTasks.includes(taskId)) {
        return res.status(400).json({ error: 'Task already completed' });
      }
      
      profile.completedTasks.push(taskId);
      profile.gold = (profile.gold || 0) + 200;
      profile.battlePassPoints = (profile.battlePassPoints || 0) + 30;
      successMessage = 'Airdrop task completed (+200 Gold, +30 BP)';`;

content = content.replace(oldAirdrop, newAirdrop);

fs.writeFileSync('api/action.ts', content);
console.log('Patched action.ts against exploits');
