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
    manaCost: card.manaCost || 1,
    hexedAmount: 0,
    isDead: false,
    armor: 0,
    ward: false,
    barrier: false,
    buffs: []
  };
}

// Initialize battle state
export function initializeBattle(
  playerDeck: Card[],
  stage: CampaignStage,
  playerHeroMaxHealth: number = 100,
  dodgeChance: number = 0,
  delayReduction: number = 0,
  startingMana: number = 1,
  creatureBuff: { atk: number; hp: number } = { atk: 0, hp: 0 },
  enemyHeroMaxHealth?: number,
  enemyDodgeChance: number = 0,
  enemyDelayReduction: number = 0,
  enemyStartingMana: number = 1,
  enemyCreatureBuff: { atk: number; hp: number } = { atk: 0, hp: 0 }
): BattleState {
  // Shuffle player deck
  const shuffledDeck = [...playerDeck].sort(() => Math.random() - 0.5);
  
  // Draw initial 3 cards to hand
  const playerHand = shuffledDeck.slice(0, 3);
  const remainingDeck = shuffledDeck.slice(3);
  
  // Enemy deck templates (exactly 12 for normal stages, 14 for Bosses)
  const enemyDeckTemplates = [...stage.enemyDeck].sort(() => Math.random() - 0.5);
  
  const resolvedEnemyHp = enemyHeroMaxHealth !== undefined && enemyHeroMaxHealth > 0 ? enemyHeroMaxHealth : stage.enemyHeroHealth;

  // Create state
  return {
    playerHeroHealth: playerHeroMaxHealth,
    playerHeroMaxHealth: playerHeroMaxHealth,
    enemyHeroHealth: resolvedEnemyHp,
    enemyHeroMaxHealth: resolvedEnemyHp,
    playerMana: startingMana,
    playerMaxMana: startingMana,
    enemyMana: enemyStartingMana,
    enemyMaxMana: enemyStartingMana,
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
    playerDelayReduction: delayReduction,
    playerCreatureBuff: creatureBuff,
    enemyDodgeChance,
    enemyDelayReduction,
    enemyCreatureBuff
  };
}

// Run the combat step (invoked after player plays a card and clicks "End Turn")
export function simulateCombatTurn(
  currentState: BattleState,
  playerPlayedCardId: string | null,
  playedSlotIndex: number | null,
  profile?: PlayerProfile | null,
  stage?: CampaignStage | null
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
             let isBarrierBlocked = false;
             let armorAbsorbed = 0;
             let isArmorBroken = false;
             if (!s.pierce) {
               const hasBarrier = targetCard.barrier ?? targetCard.ward;
               if (hasBarrier) {
                 actualDamage = 0;
                 targetCard.barrier = false;
                 targetCard.ward = false;
                 isBarrierBlocked = true;
                 logs.push(`🔮 Void Strike's damage on ${targetCard.name} was absorbed by Barrier!`);
               } else if ((targetCard.armor || 0) > 0) {
                 const initialArmor = targetCard.armor!;
                 if (initialArmor >= actualDamage) {
                   targetCard.armor! -= actualDamage;
                   armorAbsorbed = actualDamage;
                   actualDamage = 0;
                   if (targetCard.armor === 0) isArmorBroken = true;
                 } else {
                   armorAbsorbed = initialArmor;
                   actualDamage -= initialArmor;
                   targetCard.armor = 0;
                   isArmorBroken = true;
                 }
                 logs.push(`🛡️ ${targetCard.name}'s Armor absorbed ${armorAbsorbed} damage!`);
               }
             } else {
               logs.push(`⚡ Void Strike Pierces through defenses!`);
             }
             
             targetCard.health -= actualDamage;
             if (actualDamage > 0) totalLeech += actualDamage;
             logs.push(`⚡ Void Strike hits ${targetCard.name} for ${actualDamage} damage!`);
             animateSequence.push({ 
               type: 'hero_skill', 
               stance: 'void_strike', 
               targetSlot: targetIdx, 
               damage: actualDamage,
               barrierBlocked: isBarrierBlocked,
               armorAbsorbed,
               armorBroken: isArmorBroken
             });
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
            if (s.ward && !targetCard.barrier && !targetCard.ward) {
              targetCard.barrier = true;
              targetCard.ward = true;
              logs.push(`🩸 Blood Aura granted Barrier to ${targetCard.name}!`);
            }
            if (s.bonusMaxHp > 0) {
              targetCard.maxHealth += s.bonusMaxHp;
              targetCard.health += s.bonusMaxHp; // also heal the amount it expanded
              logs.push(`🩸 Blood Aura expanded ${targetCard.name}'s max HP by ${s.bonusMaxHp}!`);
            }
            animateSequence.push({ type: 'hero_skill', stance: 'blood_aura', targetSlot: targetSlot, heal: heal, barrier: s.ward, ward: s.ward, bonusMaxHp: s.bonusMaxHp, cleanse: cleansed });
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
        } else {
          // Rally cards in hand if board is empty
          if (state.playerHand.length > 0) {
            state.playerHand.forEach(c => {
              if (c.delay > 0) c.delay = Math.max(0, c.delay - 1);
            });
            logs.push(`🔥 Commander roars with Warlord's Cry! Rallied forces in hand (-1 Delay)!`);
          } else {
            logs.push(`🔥 Commander roars with Warlord's Cry!`);
          }
          animateSequence.push({ 
            type: 'hero_skill', 
            stance: 'warlord_cry', 
            targetSlot: -1, 
            bonusAtk: 0, 
            bonusArmor: 0, 
            aoeHeal: 0, 
            delayReduced: true, 
            side: 'player' 
          });
        }
      }
    }
  }

  // --- ENEMY BOSS / PVP HERO PHASE ---
  if (stage && (stage.id % 5 === 0 || stage.id === -1)) {
    const isPvp = stage.id === -1;
    const enemyStance = (isPvp ? (stage.enemyStance || 'void_strike') : (stage.id % 15 === 5 ? 'warlord_cry' : (stage.id % 15 === 10 ? 'blood_aura' : 'void_strike'))) as TalentStance;
    
    // In PvP, calculate exact talent stats from the enemy commander's talent tree
    const stats = isPvp ? getTalentStats(stage.enemyTalents || {}, enemyStance) : null;
    const triggerChance = stats ? Math.max(25, stats.triggerChance) : Math.min(50, Math.max(25, 25 + Math.floor(stage.id / 5) * 1.5));
    
    if (Math.random() * 100 < triggerChance) {
      logs.push(`⚡ Enemy Commander activated ${enemyStance.toUpperCase()} (${triggerChance.toFixed(1)}% chance)!`);
      
      if (enemyStance === 'void_strike') {
        const activePlayers = [];
        for (let i = 0; i < 5; i++) if (state.playerBoard[i] && !state.playerBoard[i].isDead) activePlayers.push(i);

        if (isPvp && stats) {
          const s = stats as any;
          if (activePlayers.length > 0) {
            const targets = [activePlayers[Math.floor(Math.random() * activePlayers.length)]];
            if (s.chainChance > 0 && Math.random() * 100 < s.chainChance && activePlayers.length > 1) {
              const remaining = activePlayers.filter(i => i !== targets[0]);
              targets.push(remaining[Math.floor(Math.random() * remaining.length)]);
            }
            if (s.singularity) {
              const mainTarget = targets[0];
              [mainTarget - 1, mainTarget + 1].forEach(adj => {
                if (activePlayers.includes(adj) && !targets.includes(adj)) {
                  targets.push(adj);
                }
              });
            }

            let totalLeech = 0;
            for (const targetIdx of targets) {
              const targetCard = state.playerBoard[targetIdx]!;
              let dmg = s.baseDamage;
              if (targetIdx !== targets[0] && s.singularity) {
                dmg = Math.max(1, Math.floor(dmg / 2));
              }
              if (s.executeDamage > 0 && (targetCard.health / targetCard.maxHealth) <= 0.5) {
                dmg += s.executeDamage;
              }

              let actualDamage = dmg;
              let isBarrierBlocked = false;
              let armorAbsorbed = 0;
              let isArmorBroken = false;

              if (!s.pierce) {
                const hasBarrier = targetCard.barrier ?? targetCard.ward;
                if (hasBarrier) {
                  actualDamage = 0;
                  targetCard.barrier = false;
                  targetCard.ward = false;
                  isBarrierBlocked = true;
                  logs.push(`🔮 Enemy Void Strike on ${targetCard.name} was absorbed by Barrier!`);
                } else if ((targetCard.armor || 0) > 0) {
                  const initialArmor = targetCard.armor!;
                  if (initialArmor >= actualDamage) {
                    targetCard.armor! -= actualDamage;
                    armorAbsorbed = actualDamage;
                    actualDamage = 0;
                    if (targetCard.armor === 0) isArmorBroken = true;
                  } else {
                    armorAbsorbed = initialArmor;
                    actualDamage -= initialArmor;
                    targetCard.armor = 0;
                    isArmorBroken = true;
                  }
                  logs.push(`🛡️ ${targetCard.name}'s Armor absorbed ${armorAbsorbed} damage!`);
                }
              } else {
                logs.push(`⚡ Enemy Void Strike pierces through defenses!`);
              }

              targetCard.health -= actualDamage;
              if (actualDamage > 0) totalLeech += actualDamage;
              logs.push(`⚡ Enemy Void Strike hits ${targetCard.name} for ${actualDamage} damage!`);
              animateSequence.push({
                type: 'hero_skill',
                stance: 'void_strike',
                targetSlot: targetIdx,
                damage: actualDamage,
                barrierBlocked: isBarrierBlocked,
                armorAbsorbed,
                armorBroken: isArmorBroken,
                side: 'enemy'
              });

              if (targetCard.health <= 0) {
                targetCard.isDead = true;
                state.playerBoard[targetIdx] = null;
                logs.push(`💀 Your card ${targetCard.name} has been destroyed by Enemy Void Strike!`);
                animateSequence.push({ type: 'death', side: 'player', slot: targetIdx });
              }
            }

            if (s.leechPercent > 0 && totalLeech > 0) {
              const heal = Math.floor(totalLeech * (s.leechPercent / 100));
              if (heal > 0) {
                state.enemyHeroHealth = Math.min(state.enemyHeroMaxHealth, state.enemyHeroHealth + heal);
                animateSequence.push({ type: 'hero_heal', heal, side: 'enemy' });
                logs.push(`⚡ Enemy Void Strike leeches +${heal} HP to the Enemy Lord!`);
              }
            }
          } else {
            // Direct strike on player lord if board is empty
            const dmg = s.baseDamage;
            state.playerHeroHealth = Math.max(0, state.playerHeroHealth - dmg);
            logs.push(`⚡ Enemy Void Strike strikes your Lord directly for -${dmg} damage!`);
            animateSequence.push({
              type: 'hero_skill',
              stance: 'void_strike',
              targetSlot: -1,
              damage: dmg,
              side: 'enemy'
            });
            if (s.leechPercent > 0) {
              const heal = Math.floor(dmg * (s.leechPercent / 100));
              if (heal > 0) {
                state.enemyHeroHealth = Math.min(state.enemyHeroMaxHealth, state.enemyHeroHealth + heal);
                animateSequence.push({ type: 'hero_heal', heal, side: 'enemy' });
              }
            }
          }
        } else {
          // Campaign boss fallback
          const damage = 2 + Math.floor((stage.id - 15) / 10);
          if (activePlayers.length > 0) {
            const targetSlot = activePlayers[Math.floor(Math.random() * activePlayers.length)];
            const targetCard = state.playerBoard[targetSlot];
            if (targetCard) {
              targetCard.health = Math.max(0, targetCard.health - damage);
              logs.push(`   Boss deals -${damage} Void Strike damage to your ${targetCard.name}!`);
              animateSequence.push({ type: 'hero_skill', stance: 'void_strike', targetSlot, damage, side: 'enemy' });
              if (targetCard.health <= 0) {
                targetCard.isDead = true;
                state.playerBoard[targetSlot] = null;
                logs.push(`   💀 Your ${targetCard.name} was destroyed!`);
                animateSequence.push({ type: 'death', side: 'player', slot: targetSlot });
              }
            }
          } else {
            state.playerHeroHealth = Math.max(0, state.playerHeroHealth - damage);
            logs.push(`   Boss deals -${damage} Void Strike damage to your Lord directly!`);
            animateSequence.push({ type: 'hero_skill', stance: 'void_strike', targetSlot, damage, side: 'enemy' });
          }
        }
      } 
      else if (enemyStance === 'blood_aura') {
        const activeEnemies = [];
        for (let i = 0; i < 5; i++) if (state.enemyBoard[i] && !state.enemyBoard[i].isDead) activeEnemies.push(i);

        if (isPvp && stats) {
          const s = stats as any;
          const triggers = s.doubleTrigger ? 2 : 1;
          for (let t = 0; t < triggers; t++) {
            const currentActive = [];
            for (let i = 0; i < 5; i++) if (state.enemyBoard[i] && !state.enemyBoard[i].isDead) currentActive.push(i);
            if (currentActive.length === 0) {
              const heal = s.baseHealing;
              state.enemyHeroHealth = Math.min(state.enemyHeroMaxHealth, state.enemyHeroHealth + heal);
              logs.push(`🩸 Enemy Blood Aura healed Enemy Lord for +${heal} HP.`);
              animateSequence.push({ type: 'hero_skill', stance: 'blood_aura', targetSlot: -1, heal, side: 'enemy' });
              break;
            }

            currentActive.sort((a, b) => (state.enemyBoard[a]!.health / state.enemyBoard[a]!.maxHealth) - (state.enemyBoard[b]!.health / state.enemyBoard[b]!.maxHealth));
            const targetSlot = currentActive[0];
            const targetCard = state.enemyBoard[targetSlot]!;
            const heal = s.baseHealing;
            let cleansed = false;

            if (targetCard.health >= targetCard.maxHealth && s.overflowPercent > 0) {
              const lordHeal = Math.max(1, Math.floor(heal * (s.overflowPercent / 100)));
              state.enemyHeroHealth = Math.min(state.enemyHeroMaxHealth, state.enemyHeroHealth + lordHeal);
              animateSequence.push({ type: 'hero_heal', heal: lordHeal, side: 'enemy' });
              logs.push(`🩸 Enemy Blood Aura healed Enemy Lord for +${lordHeal} HP (Overflow).`);
            } else {
              targetCard.health = Math.min(targetCard.maxHealth, targetCard.health + heal);
              logs.push(`🩸 Enemy Blood Aura healed ${targetCard.name} for +${heal} HP.`);
              if (s.cleanseChance > 0 && Math.random() * 100 < s.cleanseChance) {
                if (targetCard.hexedAmount > 0) {
                  targetCard.hexedAmount = 0;
                  cleansed = true;
                  logs.push(`🩸 Enemy Blood Aura cleansed Hex from ${targetCard.name}!`);
                }
              }
            }

            if (s.ward && !targetCard.barrier && !targetCard.ward) {
              targetCard.barrier = true;
              targetCard.ward = true;
              logs.push(`🩸 Enemy Blood Aura granted Barrier to ${targetCard.name}!`);
            }
            if (s.bonusMaxHp > 0) {
              targetCard.maxHealth += s.bonusMaxHp;
              targetCard.health += s.bonusMaxHp;
              logs.push(`🩸 Enemy Blood Aura expanded ${targetCard.name}'s max HP by +${s.bonusMaxHp}!`);
            }
            animateSequence.push({
              type: 'hero_skill',
              stance: 'blood_aura',
              targetSlot,
              heal,
              barrier: s.ward,
              ward: s.ward,
              bonusMaxHp: s.bonusMaxHp,
              cleanse: cleansed,
              side: 'enemy'
            });
          }
        } else {
          // Campaign boss fallback
          const heal = 3 + Math.floor((stage.id - 10) / 10);
          if (activeEnemies.length > 0) {
            const targetSlot = activeEnemies[Math.floor(Math.random() * activeEnemies.length)];
            const targetCard = state.enemyBoard[targetSlot];
            if (targetCard) {
              targetCard.health = Math.min(targetCard.maxHealth, targetCard.health + heal);
              logs.push(`   Boss heals their ${targetCard.name} for +${heal} HP!`);
              animateSequence.push({ type: 'hero_skill', stance: 'blood_aura', targetSlot, heal, side: 'enemy' });
            }
          } else {
            state.enemyHeroHealth = Math.min(state.enemyHeroMaxHealth, state.enemyHeroHealth + heal);
            logs.push(`   Boss heals their Lord for +${heal} HP!`);
            animateSequence.push({ type: 'hero_skill', stance: 'blood_aura', targetSlot: -1, heal, side: 'enemy' });
          }
        }
      } 
      else if (enemyStance === 'warlord_cry') {
        const activeEnemies = [];
        for (let i = 0; i < 5; i++) if (state.enemyBoard[i] && !state.enemyBoard[i].isDead) activeEnemies.push(i);

        if (activeEnemies.length > 0) {
          if (isPvp && stats) {
            const targetSlot = activeEnemies[Math.floor(Math.random() * activeEnemies.length)];
            const targetCard = state.enemyBoard[targetSlot]!;
            const s = stats as any;

            targetCard.buffs = targetCard.buffs || [];
            if (s.bonusAtk > 0) {
              targetCard.attack += s.bonusAtk;
              if (!s.permanent) {
                targetCard.buffs.push({ type: 'attack', amount: s.bonusAtk, turnsRemaining: s.durationTurns });
              }
              logs.push(`🔥 Enemy Warlord's Cry boosts ${targetCard.name}'s ATK by +${s.bonusAtk}!`);
            }
            if (s.bonusArmor > 0) {
              targetCard.armor = (targetCard.armor || 0) + s.bonusArmor;
              if (!s.permanent) {
                targetCard.buffs.push({ type: 'armor', amount: s.bonusArmor, turnsRemaining: s.durationTurns });
              }
              logs.push(`🔥 Enemy Warlord's Cry grants ${targetCard.name} +${s.bonusArmor} Armor!`);
            }
            let delayReduced = false;
            if (s.momentumChance > 0 && Math.random() * 100 < s.momentumChance) {
              targetCard.delay = Math.max(0, targetCard.delay - 1);
              delayReduced = true;
              logs.push(`🔥 Enemy Warlord's Cry reduced ${targetCard.name}'s Delay by 1!`);
            }
            if (s.aoeHeal > 0) {
              targetCard.health = Math.min(targetCard.maxHealth, targetCard.health + s.aoeHeal);
              logs.push(`🔥 Enemy Warlord's Cry heals ${targetCard.name} for +${s.aoeHeal}!`);
            }
            animateSequence.push({
              type: 'hero_skill',
              stance: 'warlord_cry',
              targetSlot,
              bonusAtk: s.bonusAtk,
              bonusArmor: s.bonusArmor,
              aoeHeal: s.aoeHeal,
              delayReduced,
              side: 'enemy'
            });
          } else {
            // Campaign boss fallback
            const bonusAtk = 1 + Math.floor((stage.id - 5) / 15);
            const targetSlot = activeEnemies[Math.floor(Math.random() * activeEnemies.length)];
            const targetCard = state.enemyBoard[targetSlot];
            if (targetCard) {
              targetCard.attack += bonusAtk;
              logs.push(`   Boss roars! Buffs ${targetCard.name} with +${bonusAtk} Attack!`);
              animateSequence.push({ 
                type: 'hero_skill', 
                stance: 'warlord_cry', 
                targetSlot, 
                bonusAtk, 
                bonusArmor: 0, 
                aoeHeal: 0, 
                delayReduced: false, 
                side: 'enemy' 
              });
            }
          }
        } else {
          // Fallback if no creatures on board: Roar and reduce delay of cards in enemy hand
          if (state.enemyHand.length > 0) {
            state.enemyHand.forEach(c => {
              if (c.delay > 0) c.delay = Math.max(0, c.delay - 1);
            });
            logs.push(`🔥 Boss roars with Warlord's Cry! Rallied forces in hand (-1 Delay)!`);
          } else {
            logs.push(`🔥 Boss roars with Warlord's Cry!`);
          }
          animateSequence.push({ 
            type: 'hero_skill', 
            stance: 'warlord_cry', 
            targetSlot: -1, 
            bonusAtk: 0, 
            bonusArmor: 0, 
            aoeHeal: 0, 
            delayReduced: true, 
            side: 'enemy' 
          });
        }
      }
    }
  }

  // Process expiring buffs on Player and Enemy Board
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

    const enemyCard = state.enemyBoard[i];
    if (enemyCard && enemyCard.buffs && enemyCard.buffs.length > 0) {
      enemyCard.buffs = enemyCard.buffs.filter(buff => {
        buff.turnsRemaining -= 1;
        if (buff.turnsRemaining <= 0) {
          if (buff.type === 'attack') enemyCard.attack = Math.max(0, enemyCard.attack - buff.amount);
          if (buff.type === 'armor') enemyCard.armor = Math.max(0, (enemyCard.armor || 0) - buff.amount);
          logs.push(`⏳ Enemy ${enemyCard.name}'s Warlord buff (+${buff.amount} ${buff.type}) has expired.`);
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

      // Apply Set Bonus creature buff (e.g. 6-piece Demiurge Apotheosis)
      if (state.playerCreatureBuff && (state.playerCreatureBuff.atk > 0 || state.playerCreatureBuff.hp > 0)) {
        battleCard.attack += state.playerCreatureBuff.atk;
        battleCard.health += state.playerCreatureBuff.hp;
        battleCard.maxHealth += state.playerCreatureBuff.hp;
        state.combatLog.push(`⚡ Demiurge Apotheosis: ${battleCard.name} is empowered with +${state.playerCreatureBuff.atk} ATK and +${state.playerCreatureBuff.hp} HP!`);
      }

      // Place the card on the board
      state.playerBoard[playedSlotIndex] = battleCard;
      state.playerHand.splice(cardHandIndex, 1);
    }
  }

  // 2. Enemy AI plays a card
  // Enemy plays a card in an available board slot if they can afford it with their current Mana
  if (state.enemyHand.length > 0) {
    const nextEnemyCardTemplate = state.enemyHand[0];
    const enemyCard = toBattleCard(nextEnemyCardTemplate as Card);
    const cost = enemyCard.manaCost || 1;
    
    if (state.enemyMana >= cost) {
      state.enemyMana -= cost;
      
      // Find empty slots
      const emptySlots: number[] = [];
      state.enemyBoard.forEach((slot, index) => {
        if (slot === null) emptySlots.push(index);
      });
      
      if (emptySlots.length > 0) {
        let chosenSlot = emptySlots[0];
        const playerOccupiedSlots: number[] = [];
        state.playerBoard.forEach((c, idx) => {
          if (c !== null && emptySlots.includes(idx)) {
            playerOccupiedSlots.push(idx);
          }
        });
        
        if (playerOccupiedSlots.length > 0) {
          chosenSlot = playerOccupiedSlots[Math.floor(Math.random() * playerOccupiedSlots.length)];
        } else {
          chosenSlot = emptySlots[Math.floor(Math.random() * emptySlots.length)];
        }
        
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

        // Apply Enemy Delay Reduction (from Equipment / Demiurge set)
        const enemyDelayReduc = state.enemyDelayReduction || 0;
        if (enemyDelayReduc > 0) {
          enemyCard.delay = Math.max(0, enemyCard.delay - enemyDelayReduc);
          enemyCard.initialDelay = Math.max(0, enemyCard.initialDelay - enemyDelayReduc);
        }

        // Apply Enemy Creature Buff (e.g. Demiurge Apotheosis 6-pc)
        if (state.enemyCreatureBuff && (state.enemyCreatureBuff.atk > 0 || state.enemyCreatureBuff.hp > 0)) {
          enemyCard.attack += state.enemyCreatureBuff.atk;
          enemyCard.health += state.enemyCreatureBuff.hp;
          enemyCard.maxHealth += state.enemyCreatureBuff.hp;
          logs.push(`⚡ Enemy Demiurge Apotheosis: ${enemyCard.name} is empowered with +${state.enemyCreatureBuff.atk} ATK and +${state.enemyCreatureBuff.hp} HP!`);
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
    } else {
      logs.push(`😈 Enemy cannot afford to play ${enemyCard.name} (needs ${cost} Mana, has ${state.enemyMana} Mana).`);
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
    if (state.playerHeroHealth <= 0 || state.enemyHeroHealth <= 0) break;
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
        let isBarrierBlocked = false;
        let armorAbsorbed = 0;
        let isArmorBroken = false;
        
        const hasBarrier = eCard.barrier ?? eCard.ward;
        if (hasBarrier) {
           totalDamage = 0;
           eCard.barrier = false;
           eCard.ward = false;
           isBarrierBlocked = true;
           logs.push(`🔮 ${eCard.name}'s Barrier absorbed the attack!`);
        } else if ((eCard.armor || 0) > 0) {
           const initialArmor = eCard.armor!;
           if (initialArmor >= totalDamage) {
             eCard.armor! -= totalDamage;
             armorAbsorbed = totalDamage;
             totalDamage = 0;
             if (eCard.armor === 0) isArmorBroken = true;
           } else {
             armorAbsorbed = initialArmor;
             totalDamage -= initialArmor;
             eCard.armor = 0;
             isArmorBroken = true;
           }
           logs.push(`🛡️ ${eCard.name}'s Armor absorbed ${armorAbsorbed} damage!`);
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
          vampireHeal: (vampSkill && totalDamage > 0) ? vampSkill.value : 0,
          barrierBlocked: isBarrierBlocked,
          armorAbsorbed,
          armorBroken: isArmorBroken
        });

        // Check death
        if (eCard.health <= 0) {
          eCard.isDead = true;
          logs.push(`💀 Enemy card ${eCard.name} has been torn to shreds!`);
          animateSequence.push({ type: 'death', side: 'enemy', slot: i });
        }
      } else {
        // Direct damage to Enemy Hero!
        const enemyDodgeChance = state.enemyDodgeChance || 0;
        if (enemyDodgeChance > 0 && Math.random() * 100 < enemyDodgeChance) {
          logs.push(`🛡️ DODGE! Enemy Hero evaded the attack from ${pCard.name}!`);
          animateSequence.push({
            type: 'dodge',
            side: 'enemy',
            slot: i
          });
        } else {
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
    }

    if (state.playerHeroHealth <= 0 || state.enemyHeroHealth <= 0) break;

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
        let isBarrierBlocked = false;
        let armorAbsorbed = 0;
        let isArmorBroken = false;
        
        const hasBarrier = activePCard.barrier ?? activePCard.ward;
        if (hasBarrier) {
           totalDamage = 0;
           activePCard.barrier = false;
           activePCard.ward = false;
           isBarrierBlocked = true;
           logs.push(`🔮 ${activePCard.name}'s Barrier absorbed the attack!`);
        } else if ((activePCard.armor || 0) > 0) {
           const initialArmor = activePCard.armor!;
           if (initialArmor >= totalDamage) {
             activePCard.armor! -= totalDamage;
             armorAbsorbed = totalDamage;
             totalDamage = 0;
             if (activePCard.armor === 0) isArmorBroken = true;
           } else {
             armorAbsorbed = initialArmor;
             totalDamage -= initialArmor;
             activePCard.armor = 0;
             isArmorBroken = true;
           }
           logs.push(`🛡️ ${activePCard.name}'s Armor absorbed ${armorAbsorbed} damage!`);
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
          vampireHeal: vampSkill ? vampSkill.value : 0,
          barrierBlocked: isBarrierBlocked,
          armorAbsorbed,
          armorBroken: isArmorBroken
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
    if (state.playerHeroHealth <= 0 || state.enemyHeroHealth <= 0) break;
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

    if (state.playerHeroHealth <= 0 || state.enemyHeroHealth <= 0) break;

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
    
    // Increment max mana and refill
    state.playerMaxMana = Math.min(10, state.playerMaxMana + 1);
    state.playerMana = state.playerMaxMana;
    
    state.enemyMaxMana = Math.min(10, state.enemyMaxMana + 1);
    state.enemyMana = state.enemyMaxMana;
  }

  state.combatLog = [...currentState.combatLog, ...logs];
  return { nextState: state, animateSequence };
}

export function placeCardLocally(
  currentState: BattleState,
  cardId: string,
  slotIndex: number
): BattleState {
  const state = JSON.parse(JSON.stringify(currentState)) as BattleState;
  const cardHandIndex = state.playerHand.findIndex(c => c.id === cardId);
  if (cardHandIndex === -1) return state;
  
  const card = state.playerHand[cardHandIndex];
  const battleCard = toBattleCard(card);
  const cost = battleCard.manaCost || 1;
  
  if (state.playerMana < cost) return state;
  
  // Deduct mana
  state.playerMana -= cost;
  
  // Handle Sacrifice skill:
  const sacrificeSkill = battleCard.skills.find(s => s.type === 'sacrifice');
  const activeAlliesCount = state.playerBoard.filter(c => c !== null && !c.isDead).length;
  
  if (sacrificeSkill && activeAlliesCount > 0) {
    const activeSlots: number[] = [];
    state.playerBoard.forEach((c, idx) => {
      if (c && !c.isDead) activeSlots.push(idx);
    });
    
    const randomAllySlot = activeSlots[Math.floor(Math.random() * activeSlots.length)];
    const sacrificedCard = state.playerBoard[randomAllySlot]!;
    
    sacrificedCard.isDead = true;
    state.playerBoard[randomAllySlot] = null;
    
    const healAmt = sacrificeSkill.value;
    state.playerHeroHealth = Math.min(state.playerHeroMaxHealth, state.playerHeroHealth + healAmt);
    
    battleCard.attack += Math.round(sacrificeSkill.value / 2);
    battleCard.health += sacrificeSkill.value;
    battleCard.maxHealth += sacrificeSkill.value;
    
    state.combatLog.push(`💀 ${battleCard.name} sacrifices ${sacrificedCard.name}! Hero healed for +${healAmt} HP. ${battleCard.name} gains +${Math.round(sacrificeSkill.value / 2)} ATK / +${sacrificeSkill.value} HP.`);
  }
  
  // Apply delay reduction
  const delayReduc = state.playerDelayReduction || 0;
  if (delayReduc > 0) {
    battleCard.delay = Math.max(0, battleCard.delay - delayReduc);
    battleCard.initialDelay = Math.max(0, battleCard.initialDelay - delayReduc);
  }
  
  // Apply Set Bonus creature buff
  if (state.playerCreatureBuff && (state.playerCreatureBuff.atk > 0 || state.playerCreatureBuff.hp > 0)) {
    battleCard.attack += state.playerCreatureBuff.atk;
    battleCard.health += state.playerCreatureBuff.hp;
    battleCard.maxHealth += state.playerCreatureBuff.hp;
    state.combatLog.push(`⚡ Demiurge Apotheosis: ${battleCard.name} is empowered with +${state.playerCreatureBuff.atk} ATK and +${state.playerCreatureBuff.hp} HP!`);
  }
  
  state.playerBoard[slotIndex] = battleCard;
  state.playerHand.splice(cardHandIndex, 1);
  
  return state;
}
