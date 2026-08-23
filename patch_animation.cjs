const fs = require('fs');
let content = fs.readFileSync('src/components/BattleFieldView.tsx', 'utf8');

const heroAnimationBlock = `        case 'hero_skill': {
          stepDescription = \`Commander uses \${step.stance.replace('_', ' ').toUpperCase()}!\`;
          if (step.stance === 'void_strike') {
            audioSystem.playAttack();
            if (step.targetSlot !== undefined) {
              const targetCard = copy.enemyBoard[step.targetSlot];
              if (targetCard) targetCard.health -= step.damage;
              setAnimatingSlot({ side: 'enemy', slot: step.targetSlot, type: 'damage' });
            }
          } else if (step.stance === 'blood_aura') {
            audioSystem.playHeal();
            if (step.targetSlot !== undefined) {
              const targetCard = copy.playerBoard[step.targetSlot];
              if (targetCard) targetCard.health = Math.min(targetCard.maxHealth, targetCard.health + step.heal);
              setAnimatingSlot({ side: 'player', slot: step.targetSlot, type: 'heal' });
            }
          } else if (step.stance === 'warlord_cry') {
            audioSystem.playHeal(); // maybe buff sound
            if (step.targetSlot !== undefined) {
              const targetCard = copy.playerBoard[step.targetSlot];
              if (targetCard) targetCard.attack += 1;
              setAnimatingSlot({ side: 'player', slot: step.targetSlot, type: 'heal' });
            }
          }
          break;
        }

        case 'sacrifice':`;

content = content.replace(/case 'sacrifice':/g, heroAnimationBlock);

fs.writeFileSync('src/components/BattleFieldView.tsx', content);
console.log('Patched BattleFieldView.tsx with hero_skill animation');
