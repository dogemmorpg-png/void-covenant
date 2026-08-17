import { Card, BattleCardState, BattleState, CampaignStage, PlayerProfile, CardSkill } from '../types';
import { CARD_TEMPLATES } from '../data/cards';
import { getTalentStats, TalentStance } from '../data/talents';

// Convert a standard player Card to a BattleCardState
export function toBattleCard(card: Card): BattleCardState {
  return {
    id: card.id,
    baseId: card.baseId,
    name: card.name,
    attack: card.attack,
    health: card.health,
    maxHealth: card.maxHealth,
    delay: card.delay, // Initial delay before it can attack
    initialDelay: card.delay,
    skills: JSON.parse(JSON.stringify(card.skills)),
    image: card.image,
    color: card.color,
    tier: card.tier,
    level: card.level,
    hexedAmount: 0,
    isDead: false,
    armor: 0,
    ward: false,
    buffs: []
  };
}

// Initialize battle state
export function initializeBattle(playerDeck: Card[], stage: CampaignStage, playerHeroMaxHealth: number = 100, dodgeChance: number = 0, delayReduction: number = 0): BattleState {
  // Shuffle player deck
  const shuffledDeck = [...playerDeck].sort(() => Math.random() - 0.5);
  
  // Draw initial 3 cards to hand
  const playerHand = shuffledDeck.slice(0, 3);
  const remainingDeck = shuffledDeck.slice(3);
  
  // Enemy deck templates — duplicate for longer, more challenging battles
  const enemyDeckTemplates = [...stage.enemyDeck, ...stage.enemyDeck].sort(() => Math.random() - 0.5);
  
  // Create state
  return {
    playerHeroHealth: playerHeroMaxHealth,
    playerHeroMaxHealth: playerHeroMaxHealth,
    enemyHeroHealth: stage.enemyHeroHealth,
    enemyHeroMaxHealth: stage.enemyHeroHealth,
    playerBoard: Array(5).fill(null),
    enemyBoard: Array(5).fill(null),
    playerHand,
    enemyHand: enemyDeckTemplates, // acts as queue for enemy card spawns
    playerDeckSize: remainingDeck.length,
    enemyDeckSize: enemyDeckTemplates.length,
    playerDeckQueue: remainingDeck,
    turn: 1,
    phase: 'player_play',
    combatLog: ['Battle has begun! Place your cards on the battlefield.'],
    playerDodgeChance: dodgeChance,
    playerDelayReduction: delayReduction
  };
}

// Run the combat step (invoked after player plays a card and clicks "End Turn")
export function simulateCombatTurn(
  currentState: BattleState,
  playerPlayedCardId: string | null,
  playedSlotIndex: number | null,
  profile?: PlayerProfile | null
): { nextState: BattleState; animateSequence: any[] } {
  // Create a deep copy of the state
  const state = JSON.parse(JSON.stringify(currentState)) as BattleState;
  const logs: string[] = [];
  const animateSequence: any[] = []; // for step-by-step visual playback

  logs.push(`--- TURN ${state.turn} ---`);
  // --- HERO PHASE (Talents) ---
  if (profile && profile.activeStance && profile.talents) {
    const stance = profile.activeStance as TalentStance;
    const stats = getTalentStats(profile.talents, stance);
    if (stats && Math.random() * 100 < stats.triggerChance) {
      logs.push(`⚡ Commander activated ${stance.toUpperCase()} (${stats.triggerChance.toFixed(1)}% chance)!`);
      
      if (stance === 'void_strike') {
        const activeEnemies = [];
        for (let i = 0; i < 5; i++) if (state.enemyBoard[i] && !state.enemyBoard[i].isDead) activeEnemies.push(i);
        
        if (activeEnemies.length > 0) {
          const targets = [activeEnemies[Math.floor(Math.random() * activeEnemies.length)]];
          const s = stats as any;
          if (s.chainChance > 0 && Math.random() * 100 < s.chainChance && activeEnemies.length > 1) {
             const remaining = activeEnemies.filter(i => i !== targets[0]);
             targets.push(remaining[Math.floor(Math.random() * remaining.length)]);
          }
          if (s.singularity) {
             // Ultimate: hits target and adjacent enemies for 50% damage
             // Wait, for simplicity, let's just hit all active enemies for 50% if singularity is on? Or actually just adjacent.
             // adjacent to target[0]
             const mainTarget = targets[0];
             [mainTarget - 1, mainTarget + 1].forEach(adj => {
               if (activeEnemies.includes(adj) && !targets.includes(adj)) {
                 targets.push(adj);
               }
             });
          }
          
          let totalLeech = 0;
          for (const targetIdx of targets) {
             const targetCard = state.enemyBoard[targetIdx]!;
             let dmg = s.baseDamage;
             if (targetIdx !== targets[0] && s.singularity) {
               dmg = Math.max(1, Math.floor(dmg / 2)); // Adjacent take 50%
             }
             if (s.executeDamage > 0 && (targetCard.health / targetCard.maxHealth) <= 0.5) dmg += s.executeDamage;
             
             // Apply damage
             let actualDamage = dmg;
             if (!s.pierce) {
               if (targetCard.ward) {
                 actualDamage = 0;
                 targetCard.ward = false;
                 logs.push(`⚡ Void Strike's damage on ${targetCard.name} was blocked by Ward!`);
               } else if ((targetCard.armor || 0) > 0) {
                 if ((targetCard.armor || 0) >= actualDamage) {
                   targetCard.armor! -= actualDamage;
                   actualDamage = 0;
                 } else {
                   actualDamage -= targetCard.armor!;
                   targetCard.armor = 0;
                 }
               }
             } else {
               logs.push(`⚡ Void Strike Pierces through defenses!`);
             }
             
             targetCard.health -= actualDamage;
             if (actualDamage > 0) totalLeech += actualDamage;
             logs.push(`⚡ Void Strike hits ${targetCard.name} for ${actualDamage} damage!`);
             animateSequence.push({ type: 'hero_skill', stance: 'void_strike', targetSlot: targetIdx, damage: actualDamage });
             if (targetCard.health <= 0) {
               targetCard.isDead = true;
               logs.push(`💀 Enemy card ${targetCard.name} has been destroyed by Void Strike!`);
               animateSequence.push({ type: 'death', side: 'enemy', slot: targetIdx });
             }
          }
          if (s.leechPercent > 0 && totalLeech > 0) {
            const heal = Math.floor(totalLeech * (s.leechPercent / 100));
            if (heal > 0) {
              state.playerHeroHealth = Math.min(state.playerHeroMaxHealth, state.playerHeroHealth + heal);
                animateSequence.push({ type: 'hero_heal', heal: heal });
              logs.push(`⚡ Void Strike leeches ${heal} HP to the Hero!`);
            }
          }
        }
      } 
      else if (stance === 'blood_aura') {
        const activeAllies = [];
        for (let i = 0; i < 5; i++) if (state.playerBoard[i] && !state.playerBoard[i].isDead) activeAllies.push(i);
        
        if (activeAllies.length > 0) {
          const s = stats as any;
          const triggers = s.doubleTrigger ? 2 : 1;
          for (let t = 0; t < triggers; t++) {
            // find lowest health ally
            const currentActiveAllies = [];
            for (let i = 0; i < 5; i++) if (state.playerBoard[i] && !state.playerBoard[i].isDead) currentActiveAllies.push(i);
            if (currentActiveAllies.length === 0) break;

            currentActiveAllies.sort((a, b) => (state.playerBoard[a]!.health / state.playerBoard[a]!.maxHealth) - (state.playerBoard[b]!.health / state.playerBoard[b]!.maxHealth));
            const targetSlot = currentActiveAllies[0];
            const targetCard = state.playerBoard[targetSlot]!;
            const heal = s.baseHealing;
              let cleansed = false;
              if (targetCard.health >= targetCard.maxHealth && s.overflowPercent > 0) {
              const lordHeal = Math.max(1, Math.floor(heal * (s.overflowPercent / 100)));
              state.playerHeroHealth = Math.min(state.playerHeroMaxHealth, state.playerHeroHealth + lordHeal);
                animateSequence.push({ type: 'hero_heal', heal: lordHeal });
              logs.push(`🩸 Blood Aura healed Hero for ${lordHeal} HP (Overflow).`);
            } else {
              targetCard.health = Math.min(targetCard.maxHealth, targetCard.health + heal);
              logs.push(`🩸 Blood Aura healed ${targetCard.name} for ${heal} HP.`);
              
              if (s.cleanseChance > 0 && Math.random() * 100 < s.cleanseChance) {
                if (targetCard.hexedAmount > 0) {
                   targetCard.hexedAmount = 0;
                     cleansed = true;
                   logs.push(`🩸 Blood Aura cleansed Hex from ${targetCard.name}!`);
                }
              }
            }
            if (s.ward && !targetCard.ward) {
              targetCard.ward = true;
              logs.push(`🩸 Blood Aura granted Ward to ${targetCard.name}!`);
            }
            if (s.bonusMaxHp > 0) {
              targetCard.maxHealth += s.bonusMaxHp;
              targetCard.health += s.bonusMaxHp; // also heal the amount it expanded
              logs.push(`🩸 Blood Aura expanded ${targetCard.name}'s max HP by ${s.bonusMaxHp}!`);
            }
            animateSequence.push({ type: 'hero_skill', stance: 'blood_aura', targetSlot: targetSlot, heal: heal, ward: s.ward, bonusMaxHp: s.bonusMaxHp, cleanse: cleansed });
          }
        }
      }
      else if (stance === 'warlord_cry') {
        const activeAllies = [];
        for (let i = 0; i < 5; i++) if (state.playerBoard[i] && !state.playerBoard[i].isDead) activeAllies.push(i);
        
        if (activeAllies.length > 0) {
          const targetSlot = activeAllies[Math.floor(Math.random() * activeAllies.length)];
          const targetCard = state.playerBoard[targetSlot]!;
          const s = stats as any;
          
          targetCard.buffs = targetCard.buffs || [];
          
          if (s.bonusAtk > 0) {
            targetCard.attack += s.bonusAtk;
            if (!s.permanent) {
              targetCard.buffs.push({ type: 'attack', amount: s.bonusAtk, turnsRemaining: s.durationTurns });
            }
            logs.push(`🔥 Warlord's Cry boosts ${targetCard.name}'s ATK by ${s.bonusAtk}!`);
          }
          if (s.bonusArmor > 0) {
            targetCard.armor = (targetCard.armor || 0) + s.bonusArmor;
            if (!s.permanent) {
              targetCard.buffs.push({ type: 'armor', amount: s.bonusArmor, turnsRemaining: s.durationTurns });
            }
            logs.push(`🔥 Warlord's Cry grants ${targetCard.name} ${s.bonusArmor} Armor!`);
          }
          let delayReduced = false;
            if (s.momentumChance > 0 && Math.random() * 100 < s.momentumChance) {
             targetCard.delay = Math.max(0, targetCard.delay - 1);
               delayReduced = true;
             logs.push(`🔥 Warlord's Cry reduced ${targetCard.name}'s Delay by 1!`);
          }
          if (s.aoeHeal > 0) {
            targetCard.health = Math.min(targetCard.maxHealth, targetCard.health + s.aoeHeal);
            logs.push(`🔥 Warlord's Cry heals ${targetCard.name} for ${s.aoeHeal}!`);
          }
          animateSequence.push({ type: 'hero_skill', stance: 'warlord_cry', targetSlot: targetSlot, bonusAtk: s.bonusAtk, bonusArmor: s.bonusArmor, aoeHeal: s.aoeHeal, delayReduced });
        }
      }
    }
  }

  // Process expiring buffs on Player Board
  for (let i = 0; i < 5; i++) {
    const card = state.playerBoard[i];
    if (card && card.buffs && card.buffs.length > 0) {
      card.buffs = card.buffs.filter(buff => {
        buff.turnsRemaining -= 1;
        if (buff.turnsRemaining <= 0) {
          if (buff.type === 'attack') card.attack = Math.max(0, card.attack - buff.amount);
          if (buff.type === 'armor') card.armor = Math.max(0, (card.armor || 0) - buff.amount);
          logs.push(`⏳ ${card.name}'s Warlord buff (+${buff.amount} ${buff.type}) has expired.`);
          return false;
        }
        return true;
      });
    }
  }

  // 1. Process player played card if not already processed
  // (We handle the Sacrifice mechanic here when placing the card)
  if (playerPlayedCardId && playedSlotIndex !== null) {
    const cardHandIndex = state.playerHand.findIndex(c => c.id === playerPlayedCardId);
    if (cardHandIndex !== -1) {
      const card = state.playerHand[cardHandIndex];
      const battleCard = toBattleCard(card);
      
      // Handle Sacrifice skill:
      // "Sacrifice [X]: destroys a random ally on the board, healing the hero for X"
      const sacrificeSkill = battleCard.skills.find(s => s.type === 'sacrifice');
      const activeAlliesCount = state.playerBoard.filter(c => c !== null && !c.isDead).length;
      
      if (sacrificeSkill && activeAlliesCount > 0) {
        // Find all active slots on player board
        const activeSlots: number[] = [];
        state.playerBoard.forEach((c, idx) => {
          if (c && !c.isDead) activeSlots.push(idx);
        });
        
        // Pick one randomly
        const randomAllySlot = activeSlots[Math.floor(Math.random() * activeSlots.length)];
        const sacrificedCard = state.playerBoard[randomAllySlot]!;
        
        // Destroy ally
        sacrificedCard.isDead = true;
        state.playerBoard[randomAllySlot] = null;
        
        // Heal hero and buff self
        const healAmt = sacrificeSkill.value;
        const oldHealth = state.playerHeroHealth;
        state.playerHeroHealth = Math.min(state.playerHeroMaxHealth, state.playerHeroHealth + healAmt);
        
        // permanent stats buff to the card that sacrificed
        battleCard.attack += Math.round(sacrificeSkill.value / 2);
        battleCard.health += sacrificeSkill.value;
        battleCard.maxHealth += sacrificeSkill.value;
        
        logs.push(`💀 ${battleCard.name} sacrifices ${sacrificedCard.name}! Hero healed for +${state.playerHeroHealth - oldHealth} HP. ${battleCard.name} gains +${Math.round(sacrificeSkill.value / 2)} ATK / +${sacrificeSkill.value} HP.`);
        
        animateSequence.push({
          type: 'sacrifice',
          slot: playedSlotIndex,
          targetSlot: randomAllySlot,
          healAmount: healAmt,
          buffAttack: Math.round(sacrificeSkill.value / 2),
          buffHealth: sacrificeSkill.value
        });
      }

      // Apply delay reduction
      const delayReduc = state.playerDelayReduction || 0;
      if (delayReduc > 0) {
        battleCard.delay = Math.max(0, battleCard.delay - delayReduc);
        battleCard.initialDelay = Math.max(0, battleCard.initialDelay - delayReduc);
      }

      // Place the card on the board
      state.playerBoard[playedSlotIndex] = battleCard;
      state.playerHand.splice(cardHandIndex, 1);
    }
  }

  // 2. Enemy AI plays a card
  // Enemy plays a card in an available board slot. Prefer slot opposite player's card, or first available.
  if (state.enemyHand.length > 0) {
    const nextEnemyCardTemplate = state.enemyHand[0];
    
    // Find empty slots
    const emptySlots: number[] = [];
    state.enemyBoard.forEach((slot, index) => {
      if (slot === null) emptySlots.push(index);
    });
    
    if (emptySlots.length > 0) {
      // AI logic: try to block player's cards, or choose slot with player card opposite
      let chosenSlot = emptySlots[0];
      const playerOccupiedSlots: number[] = [];
      state.playerBoard.forEach((c, idx) => {
        if (c !== null && emptySlots.includes(idx)) {
          playerOccupiedSlots.push(idx);
        }
      });
      
      if (playerOccupiedSlots.length > 0) {
        // block a player card!
        chosenSlot = playerOccupiedSlots[Math.floor(Math.random() * playerOccupiedSlots.length)];
      } else {
        // random empty slot
        chosenSlot = emptySlots[Math.floor(Math.random() * emptySlots.length)];
      }
      
      // Instantiate card
      const enemyCard = toBattleCard(nextEnemyCardTemplate as Card);
      
      // Trigger enemy sacrifice if any
      const enemySacSkill = enemyCard.skills.find(s => s.type === 'sacrifice');
      const enemyAllies = state.enemyBoard.filter(c => c !== null && !c.isDead).length;
      if (enemySacSkill && enemyAllies > 0) {
        const enemyActiveSlots: number[] = [];
        state.enemyBoard.forEach((c, idx) => {
          if (c && !c.isDead) enemyActiveSlots.push(idx);
        });
        const randAllySlot = enemyActiveSlots[Math.floor(Math.random() * enemyActiveSlots.length)];
        const sacrCard = state.enemyBoard[randAllySlot]!;
        sacrCard.isDead = true;
        state.enemyBoard[randAllySlot] = null;
        
        state.enemyHeroHealth = Math.min(state.enemyHeroMaxHealth, state.enemyHeroHealth + enemySacSkill.value);
        enemyCard.attack += Math.round(enemySacSkill.value / 2);
        enemyCard.health += enemySacSkill.value;
        enemyCard.maxHealth += enemySacSkill.value;
        
        logs.push(`💀 [Enemy] ${enemyCard.name} sacrifices ${sacrCard.name}! Enemy hero healed for +${enemySacSkill.value} HP.`);
      }

      state.enemyBoard[chosenSlot] = enemyCard;
      state.enemyHand.shift();
      state.enemyDeckSize = state.enemyHand.length;
      
      logs.push(`😈 Enemy played ${enemyCard.name} in slot ${chosenSlot + 1}.`);
      animateSequence.push({
        type: 'enemy_play',
        slot: chosenSlot,
        card: enemyCard
      });
    }
  }

  // 3. Decrement all delays on the board by 1
  for (let i = 0; i < 5; i++) {
    const pCard = state.playerBoard[i];
    const eCard = state.enemyBoard[i];
    
    if (pCard && pCard.delay > 0) {
      pCard.delay = Math.max(0, pCard.delay - 1);
      if (pCard.delay === 0) {
        logs.push(`⚔️ ${pCard.name} (Player, Slot ${i+1}) is ready to attack!`);
      }
    }
    if (eCard && eCard.delay > 0) {
      eCard.delay = Math.max(0, eCard.delay - 1);
      if (eCard.delay === 0) {
        logs.push(`⚔️ ${eCard.name} (Enemy, Slot ${i+1}) is ready to attack!`);
      }
    }
  }

  // 4. Resolve Combat Duels (Linear combats, slot by slot)
  for (let i = 0; i < 5; i++) {
    const pCard = state.playerBoard[i];
    const eCard = state.enemyBoard[i];
    
    // Player Attacks: If pCard is active
    if (pCard && !pCard.isDead && pCard.delay === 0) {
      if (eCard && !eCard.isDead) {
        // Linear Duel: Player card attacks Enemy card
        let attackDmg = pCard.attack;
        
        // Apply HEX skill if active:
        const hexSkill = pCard.skills.find(s => s.type === 'hex');
        if (hexSkill) {
          eCard.hexedAmount += hexSkill.value;
          logs.push(`🔮 ${pCard.name} casts Hex on ${eCard.name} (+${hexSkill.value} damage).`);
        }
        
        // Calculate total damage with Hex
        let totalDamage = attackDmg + eCard.hexedAmount;
        
        if (eCard.ward) {
           totalDamage = 0;
           eCard.ward = false;
           logs.push(`🛡️ ${eCard.name}'s Ward blocked the attack!`);
        } else if ((eCard.armor || 0) > 0) {
           if (eCard.armor! >= totalDamage) {
             eCard.armor! -= totalDamage;
             totalDamage = 0;
           } else {
             totalDamage -= eCard.armor!;
             eCard.armor = 0;
           }
           logs.push(`🛡️ ${eCard.name}'s Armor mitigated the damage!`);
        }
        
        eCard.health -= totalDamage;
        if (totalDamage > 0) {
          logs.push(`🗡️ ${pCard.name} attacks ${eCard.name} for ${totalDamage} damage! (Enemy HP: ${eCard.health}/${eCard.maxHealth})`);
        }
        
        // Vampirism check
        const vampSkill = pCard.skills.find(s => s.type === 'vampirism');
        if (vampSkill && eCard.health < eCard.maxHealth && totalDamage > 0) {
          const healAmount = vampSkill.value;
          const oldHP = pCard.health;
          pCard.health = Math.min(pCard.maxHealth, pCard.health + healAmount);
          logs.push(`🩸 Vampirism: ${pCard.name} restores +${pCard.health - oldHP} HP.`);
        }
        
        // Reset hex
        eCard.hexedAmount = 0;
        
        animateSequence.push({
          type: 'attack',
          attacker: 'player',
          slot: i,
          targetSlot: i,
          damage: totalDamage,
          vampireHeal: (vampSkill && totalDamage > 0) ? vampSkill.value : 0
        });

        // Check death
        if (eCard.health <= 0) {
          eCard.isDead = true;
          logs.push(`💀 Enemy card ${eCard.name} has been torn to shreds!`);
          animateSequence.push({ type: 'death', side: 'enemy', slot: i });
        }
      } else {
        // Direct damage to Enemy Hero!
        const totalDamage = pCard.attack;
        state.enemyHeroHealth = Math.max(0, state.enemyHeroHealth - totalDamage);
        logs.push(`💥 ${pCard.name} deals ${totalDamage} direct damage to the Enemy Hero! (Enemy HP: ${state.enemyHeroHealth}/${state.enemyHeroMaxHealth})`);
        
        animateSequence.push({
          type: 'direct_attack',
          attacker: 'player',
          slot: i,
          damage: totalDamage
        });
      }
    }

    // Enemy Attacks: If eCard is active
    if (eCard && !eCard.isDead && eCard.delay === 0) {
      const activePCard = state.playerBoard[i];
      if (activePCard && !activePCard.isDead) {
        // Enemy card attacks Player card
        let attackDmg = eCard.attack;
        
        // Hex skill
        const hexSkill = eCard.skills.find(s => s.type === 'hex');
        if (hexSkill) {
          activePCard.hexedAmount += hexSkill.value;
          logs.push(`🔮 [Enemy] ${eCard.name} casts Hex on ${activePCard.name} (+${hexSkill.value} damage).`);
        }
        
        let totalDamage = attackDmg + activePCard.hexedAmount;
        
        if (activePCard.ward) {
           totalDamage = 0;
           activePCard.ward = false;
           logs.push(`🛡️ ${activePCard.name}'s Ward blocked the attack!`);
        } else if ((activePCard.armor || 0) > 0) {
           if (activePCard.armor! >= totalDamage) {
             activePCard.armor! -= totalDamage;
             totalDamage = 0;
           } else {
             totalDamage -= activePCard.armor!;
             activePCard.armor = 0;
           }
           logs.push(`🛡️ ${activePCard.name}'s Armor mitigated the damage!`);
        }
        
        activePCard.health -= totalDamage;
        if (totalDamage > 0) {
          logs.push(`🗡️ [Enemy] ${eCard.name} hits ${activePCard.name} for ${totalDamage} damage! (Your HP: ${activePCard.health}/${activePCard.maxHealth})`);
        }
        
        // Vampirism
        const vampSkill = eCard.skills.find(s => s.type === 'vampirism');
        if (vampSkill && totalDamage > 0) {
          const healAmount = vampSkill.value;
          eCard.health = Math.min(eCard.maxHealth, eCard.health + healAmount);
          logs.push(`🩸 [Enemy] Vampirism: ${eCard.name} heals +${healAmount} HP.`);
        }
        
        activePCard.hexedAmount = 0;
        
        animateSequence.push({
          type: 'attack',
          attacker: 'enemy',
          slot: i,
          targetSlot: i,
          damage: totalDamage,
          vampireHeal: vampSkill ? vampSkill.value : 0
        });

        // Death check
        if (activePCard.health <= 0) {
          activePCard.isDead = true;
          logs.push(`💀 Your card ${activePCard.name} has fallen in battle!`);
          animateSequence.push({ type: 'death', side: 'player', slot: i });
        }
      } else {
        // Direct damage to Player Hero!
        const dodgeChance = state.playerDodgeChance || 0;
        if (dodgeChance > 0 && Math.random() * 100 < dodgeChance) {
          logs.push(`🛡️ DODGE! Your Hero evaded the attack from ${eCard.name}!`);
          animateSequence.push({
            type: 'dodge',
            side: 'player',
            slot: i
          });
        } else {
          const totalDamage = eCard.attack;
          state.playerHeroHealth = Math.max(0, state.playerHeroHealth - totalDamage);
          logs.push(`💥 [Enemy] ${eCard.name} deals ${totalDamage} direct damage to your Hero! (Hero HP: ${state.playerHeroHealth}/${state.playerHeroMaxHealth})`);
          
          animateSequence.push({
            type: 'direct_attack',
            attacker: 'enemy',
            slot: i,
            damage: totalDamage
          });
        }
      }
    }
  }

  // 5. Trigger end-of-turn periodic skills:
  // **Plague**: "deals X damage to a random enemy card each turn"
  for (let i = 0; i < 5; i++) {
    const pCard = state.playerBoard[i];
    if (pCard && !pCard.isDead && pCard.delay === 0) {
      const plagueSkill = pCard.skills.find(s => s.type === 'plague');
      if (plagueSkill) {
        // Find active enemy cards
        const aliveEnemies: number[] = [];
        state.enemyBoard.forEach((c, idx) => {
          if (c && !c.isDead) aliveEnemies.push(idx);
        });
        
        if (aliveEnemies.length > 0) {
          const randomEnemySlot = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
          const targetEnemy = state.enemyBoard[randomEnemySlot]!;
          targetEnemy.health -= plagueSkill.value;
          logs.push(`🤢 Plague: ${pCard.name} infects ${targetEnemy.name} for -${plagueSkill.value} HP.`);
          
          animateSequence.push({
            type: 'plague',
            sourceSide: 'player',
            sourceSlot: i,
            targetSlot: randomEnemySlot,
            damage: plagueSkill.value
          });

          if (targetEnemy.health <= 0) {
            targetEnemy.isDead = true;
            logs.push(`💀 Enemy card ${targetEnemy.name} dissolved in plague slime!`);
            animateSequence.push({ type: 'death', side: 'enemy', slot: randomEnemySlot });
          }
        }
      }
    }

    const eCard = state.enemyBoard[i];
    if (eCard && !eCard.isDead && eCard.delay === 0) {
      const plagueSkill = eCard.skills.find(s => s.type === 'plague');
      if (plagueSkill) {
        // Find active player cards
        const alivePlayers: number[] = [];
        state.playerBoard.forEach((c, idx) => {
          if (c && !c.isDead) alivePlayers.push(idx);
        });
        
        if (alivePlayers.length > 0) {
          const randomPlayerSlot = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
          const targetPlayer = state.playerBoard[randomPlayerSlot]!;
          targetPlayer.health -= plagueSkill.value;
          logs.push(`🤢 [Enemy] Plague: ${eCard.name} infects ${targetPlayer.name} for -${plagueSkill.value} HP.`);
          
          animateSequence.push({
            type: 'plague',
            sourceSide: 'enemy',
            sourceSlot: i,
            targetSlot: randomPlayerSlot,
            damage: plagueSkill.value
          });

          if (targetPlayer.health <= 0) {
            targetPlayer.isDead = true;
            logs.push(`💀 Your card ${targetPlayer.name} rotted from the plague!`);
            animateSequence.push({ type: 'death', side: 'player', slot: randomPlayerSlot });
          }
        }
      }
    }
  }

  // 6. Clean up dead cards from both boards
  for (let i = 0; i < 5; i++) {
    if (state.playerBoard[i]?.isDead) {
      state.playerBoard[i] = null;
    }
    if (state.enemyBoard[i]?.isDead) {
      state.enemyBoard[i] = null;
    }
  }

  // 7. Draw cards for Player from actual deck queue
  const cardsNeeded = 3 - state.playerHand.length;
  if (cardsNeeded > 0 && state.playerDeckQueue.length > 0) {
    const drawCount = Math.min(cardsNeeded, state.playerDeckQueue.length);
    for (let d = 0; d < drawCount; d++) {
      state.playerHand.push(state.playerDeckQueue.shift()!);
    }
    state.playerDeckSize = state.playerDeckQueue.length;
    logs.push('🃏 You drew new cards from your deck.');
  }

  // 8. Check game end
  if (state.enemyHeroHealth <= 0) {
    state.phase = 'player_won';
    logs.push('🏆 VICTORY! The covenant celebrates triumph! The enemy is cast into the abyss.');
  } else if (state.playerHeroHealth <= 0) {
    state.phase = 'player_lost';
    logs.push('💀 DEFEAT. Your souls have been consumed by the Darkness...');
  } else {
    // Advance turn
    state.turn += 1;
    state.phase = 'player_play';
  }

  state.combatLog = [...currentState.combatLog, ...logs];
  return { nextState: state, animateSequence };
}
