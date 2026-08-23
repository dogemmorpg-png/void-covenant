const fs = require('fs');
let content = fs.readFileSync('src/utils/gameLogic.ts', 'utf8');

// 1. Update imports
content = content.replace(
  /import \{ CARD_TEMPLATES \} from '\.\.\/data\/cards';/,
  `import { CARD_TEMPLATES } from '../data/cards';\nimport { getTalentStats, TalentStance } from '../data/talents';`
);

// 2. Update function signature
content = content.replace(
  /export function simulateCombatTurn\(\s*currentState: BattleState,\s*playerPlayedCardId: string \| null,\s*playedSlotIndex: number \| null\s*\): \{ nextState: BattleState; animateSequence: any\[\] \} \{/,
  `export function simulateCombatTurn(
  currentState: BattleState,
  playerPlayedCardId: string | null,
  playedSlotIndex: number | null,
  profile?: PlayerProfile | null
): { nextState: BattleState; animateSequence: any[] } {`
);

// 3. Inject Hero Phase logic right after `logs.push(\`--- TURN \${state.turn} ---\`);`
const heroLogic = `  // --- HERO PHASE (Talents) ---
  if (profile && profile.activeStance && profile.talents) {
    const stance = profile.activeStance as TalentStance;
    const stats = getTalentStats(profile.talents, stance);
    if (stats && Math.random() * 100 < stats.triggerChance) {
      logs.push(\`⚡ Commander activated \${stance.toUpperCase()} (\${stats.triggerChance.toFixed(1)}% chance)!\`);
      
      if (stance === 'void_strike') {
        const activeEnemies = [];
        for (let i = 0; i < 5; i++) if (state.enemyBoard[i] && !state.enemyBoard[i].isDead) activeEnemies.push(i);
        
        if (activeEnemies.length > 0) {
          const targets = [activeEnemies[Math.floor(Math.random() * activeEnemies.length)]];
          if ((stats as any).chainChance > 0 && Math.random() * 100 < (stats as any).chainChance && activeEnemies.length > 1) {
             const remaining = activeEnemies.filter(i => i !== targets[0]);
             targets.push(remaining[Math.floor(Math.random() * remaining.length)]);
          }
          
          for (const targetIdx of targets) {
             const targetCard = state.enemyBoard[targetIdx]!;
             let dmg = (stats as any).baseDamage;
             if ((stats as any).execute && (targetCard.health / targetCard.maxHealth) <= 0.5) dmg += 1;
             
             targetCard.health -= dmg;
             logs.push(\`⚡ Void Strike hits \${targetCard.name} for \${dmg} damage!\`);
             animateSequence.push({ type: 'hero_skill', stance: 'void_strike', targetSlot: targetIdx, damage: dmg });
             if (targetCard.health <= 0) {
               targetCard.isDead = true;
               logs.push(\`💀 Enemy card \${targetCard.name} has been destroyed by Void Strike!\`);
               animateSequence.push({ type: 'death', side: 'enemy', slot: targetIdx });
             }
          }
        }
      } 
      else if (stance === 'blood_aura') {
        const activeAllies = [];
        for (let i = 0; i < 5; i++) if (state.playerBoard[i] && !state.playerBoard[i].isDead) activeAllies.push(i);
        
        if (activeAllies.length > 0) {
          // find lowest health ally
          activeAllies.sort((a, b) => (state.playerBoard[a]!.health / state.playerBoard[a]!.maxHealth) - (state.playerBoard[b]!.health / state.playerBoard[b]!.maxHealth));
          const targetSlot = activeAllies[0];
          const targetCard = state.playerBoard[targetSlot]!;
          const heal = (stats as any).baseHealing;
          
          if (targetCard.health >= targetCard.maxHealth && (stats as any).overflow) {
            state.playerHeroHealth = Math.min(state.playerHeroMaxHealth, state.playerHeroHealth + heal);
            logs.push(\`🩸 Blood Aura healed Hero for \${heal} HP (Overflow).\`);
          } else {
            targetCard.health = Math.min(targetCard.maxHealth, targetCard.health + heal);
            logs.push(\`🩸 Blood Aura healed \${targetCard.name} for \${heal} HP.\`);
            
            if ((stats as any).cleanseChance > 0 && Math.random() * 100 < (stats as any).cleanseChance) {
              if (targetCard.hexedAmount > 0) {
                 targetCard.hexedAmount = 0;
                 logs.push(\`🩸 Blood Aura cleansed Hex from \${targetCard.name}!\`);
              }
            }
          }
          animateSequence.push({ type: 'hero_skill', stance: 'blood_aura', targetSlot: targetSlot, heal: heal });
        }
      }
      else if (stance === 'warlord_cry') {
        let activeAllies = [];
        for (let i = 0; i < 5; i++) if (state.playerBoard[i] && !state.playerBoard[i].isDead) activeAllies.push(i);
        
        if (activeAllies.length > 0) {
          if ((stats as any).prioritizeActive) {
            const readyAllies = activeAllies.filter(i => state.playerBoard[i]!.delay === 0);
            if (readyAllies.length > 0) activeAllies = readyAllies;
          }
          const targetSlot = activeAllies[Math.floor(Math.random() * activeAllies.length)];
          const targetCard = state.playerBoard[targetSlot]!;
          
          targetCard.attack += 1;
          logs.push(\`🔥 Warlord's Cry boosts \${targetCard.name}'s ATK by 1!\`);
          
          if ((stats as any).delayReduceChance > 0 && Math.random() * 100 < (stats as any).delayReduceChance) {
             targetCard.delay = Math.max(0, targetCard.delay - 1);
             logs.push(\`🔥 Warlord's Cry reduced \${targetCard.name}'s Delay by 1!\`);
          }
          animateSequence.push({ type: 'hero_skill', stance: 'warlord_cry', targetSlot: targetSlot });
        }
      }
    }
  }
`;

content = content.replace(
  /logs\.push\(\`--- TURN \$\{state\.turn\} ---\`\);/,
  `logs.push(\`--- TURN \${state.turn} ---\`);\n${heroLogic}`
);

fs.writeFileSync('src/utils/gameLogic.ts', content);
console.log('Patched gameLogic.ts with Hero Phase');
