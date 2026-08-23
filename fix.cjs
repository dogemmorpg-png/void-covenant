const fs = require('fs');

const file = 'src/components/BattleFieldView.tsx';
let content = fs.readFileSync(file, 'utf8');

// Regex to match the hero_skill block
const regex = /          case 'hero_skill': \{\s*stepDescription = `Commander uses \$\{step\.stance\.replace\('_', ' '\)\.toUpperCase\(\)\}!`;\s*if \(step\.stance === 'void_strike'\) \{\s*audioSystem\.playAttack\(\);\s*if \(step\.targetSlot !== undefined\) \{\s*const targetCard = copy\.enemyBoard\[step\.targetSlot\];\s*if \(targetCard\) targetCard\.health -= step\.damage;\s*setAnimatingSlot\(\{ side: 'enemy', slot: step\.targetSlot, type: 'damage' \}\);\s*\}\s*\} else if \(step\.stance === 'blood_aura'\) \{\s*audioSystem\.playHeal\(\);\s*if \(step\.targetSlot !== undefined\) \{\s*const targetCard = copy\.playerBoard\[step\.targetSlot\];\s*if \(targetCard\) targetCard\.health = Math\.min\(targetCard\.maxHealth, targetCard\.health \+ step\.heal\);\s*setAnimatingSlot\(\{ side: 'player', slot: step\.targetSlot, type: 'heal' \}\);\s*\}\s*\} else if \(step\.stance === 'warlord_cry'\) \{\s*audioSystem\.playHeal\(\); \/\/ maybe buff sound\s*if \(step\.targetSlot !== undefined\) \{\s*const targetCard = copy\.playerBoard\[step\.targetSlot\];\s*if \(targetCard\) targetCard\.attack \+= 1;\s*setAnimatingSlot\(\{ side: 'player', slot: step\.targetSlot, type: 'heal' \}\);\s*\}\s*\}\s*break;\s*\}/g;

const occurrences = (content.match(regex) || []).length;
console.log("Found: " + occurrences);

// Replace ALL occurrences with nothing!
content = content.replace(regex, "");

// Now we need to carefully insert the CORRECT block into the switch (step.type) { inside Core Combat turn step runner
const newBlock = `          case 'hero_heal': {
            copy.playerHeroHealth = Math.min(copy.playerHeroMaxHealth, copy.playerHeroHealth + step.heal);
            stepDescription = \`Commander is healed for \${step.heal}!\`;
            audioSystem.playHeal();
            break;
          }
          case 'hero_skill': {
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
                if (targetCard) {
                  if (step.bonusMaxHp > 0) targetCard.maxHealth += step.bonusMaxHp;
                  targetCard.health = Math.min(targetCard.maxHealth, targetCard.health + (step.heal || 0));
                  if (step.ward) targetCard.ward = true;
                  if (step.cleanse) targetCard.hexedAmount = 0;
                }
                setAnimatingSlot({ side: 'player', slot: step.targetSlot, type: 'heal' });
              }
            } else if (step.stance === 'warlord_cry') {
              audioSystem.playHeal(); // maybe buff sound
              if (step.targetSlot !== undefined) {
                const targetCard = copy.playerBoard[step.targetSlot];
                if (targetCard) {
                  if (step.bonusAtk > 0) targetCard.attack += step.bonusAtk;
                  if (step.bonusArmor > 0) targetCard.armor = (targetCard.armor || 0) + step.bonusArmor;
                  if (step.delayReduced) targetCard.delay = Math.max(0, targetCard.delay - 1);
                  if (step.aoeHeal > 0) targetCard.health = Math.min(targetCard.maxHealth, targetCard.health + step.aoeHeal);
                }
                setAnimatingSlot({ side: 'player', slot: step.targetSlot, type: 'heal' });
              }
            }
            break;
          }`;

// The correct switch is here:
//         const copy = JSON.parse(JSON.stringify(prev)) as BattleState;
//         switch (step.type) {
content = content.replace(
  "        switch (step.type) {\n", 
  "        switch (step.type) {\n" + newBlock + "\n"
);

fs.writeFileSync(file, content);
console.log("Done");
