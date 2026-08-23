const fs = require('fs');
let content = fs.readFileSync('src/components/BattleFieldView.tsx', 'utf8');

// Replace the two occurrences of simulateCombatTurn
content = content.replace(
  /simulateCombatTurn\(battle, selectedHandCardId, slotIndex\)/g,
  `simulateCombatTurn(battle, selectedHandCardId, slotIndex, profile)`
);

content = content.replace(
  /simulateCombatTurn\(battle, null, null\)/g,
  `simulateCombatTurn(battle, null, null, profile)`
);

fs.writeFileSync('src/components/BattleFieldView.tsx', content);
console.log('Patched BattleFieldView.tsx calls');
