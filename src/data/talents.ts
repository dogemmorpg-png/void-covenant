export type TalentStance = 'void_strike' | 'blood_aura' | 'warlord_cry';

export interface TalentNode {
  id: string;
  stance: TalentStance;
  branch: 'a' | 'b' | 'c';
  row: number; // For layout positioning
  name: string;
  description: (level: number) => string;
  maxLevel: number;
  cost: number;
  requires?: string[]; // IDs of nodes that must have at least 1 point to unlock
}

export const TALENT_TREES: TalentNode[] = [
  // --- VOID STRIKE ---
  {
    id: 'void_base',
    stance: 'void_strike',
    branch: 'a',
    row: 0,
    name: 'Void Attunement',
    description: (lvl) => `+${lvl * 1.5}% chance to trigger Void Strike (Base: 10%).`,
    maxLevel: 20,
    cost: 1,
  },
  {
    id: 'void_chain',
    stance: 'void_strike',
    branch: 'b',
    row: 1,
    name: 'Chain Lightning',
    description: (lvl) => `If Void Strike triggers, ${lvl * 5}% chance to hit a second target.`,
    maxLevel: 5,
    cost: 1,
    requires: ['void_base']
  },
  {
    id: 'void_pierce',
    stance: 'void_strike',
    branch: 'c',
    row: 2,
    name: 'Armor Piercing',
    description: (lvl) => `Void Strike damage ignores enemy Ward and Armor.`,
    maxLevel: 1,
    cost: 3,
    requires: ['void_chain']
  },
  {
    id: 'void_execute',
    stance: 'void_strike',
    branch: 'c',
    row: 3,
    name: 'Execute',
    description: (lvl) => `Deals +1 bonus damage if the target is below 50% HP.`,
    maxLevel: 1,
    cost: 4,
    requires: ['void_pierce']
  },
  {
    id: 'void_lethality',
    stance: 'void_strike',
    branch: 'c',
    row: 4,
    name: 'Lethality',
    description: (lvl) => `Base damage increased by 1 (Total: 2).`,
    maxLevel: 1,
    cost: 5,
    requires: ['void_execute']
  },

  // --- BLOOD AURA ---
  {
    id: 'blood_base',
    stance: 'blood_aura',
    branch: 'a',
    row: 0,
    name: 'Blood Attunement',
    description: (lvl) => `+${lvl * 2}% chance to trigger Blood Aura (Base: 15%).`,
    maxLevel: 20,
    cost: 1,
  },
  {
    id: 'blood_purity',
    stance: 'blood_aura',
    branch: 'b',
    row: 1,
    name: 'Purity',
    description: (lvl) => `${lvl * 20}% chance to cleanse Poison or Hex from the target when healing.`,
    maxLevel: 5,
    cost: 1,
    requires: ['blood_base']
  },
  {
    id: 'blood_overflow',
    stance: 'blood_aura',
    branch: 'c',
    row: 2,
    name: 'Overflow',
    description: (lvl) => `If the card is already at full HP, the Hero receives the healing instead.`,
    maxLevel: 1,
    cost: 3,
    requires: ['blood_purity']
  },
  {
    id: 'blood_ward',
    stance: 'blood_aura',
    branch: 'c',
    row: 3,
    name: 'Blood Ward',
    description: (lvl) => `The healed card also gains Ward 1 (Shields against the next hit).`,
    maxLevel: 1,
    cost: 4,
    requires: ['blood_overflow']
  },
  {
    id: 'blood_vitality',
    stance: 'blood_aura',
    branch: 'c',
    row: 4,
    name: 'Vitality',
    description: (lvl) => `Base healing increased by 1 (Total: 2).`,
    maxLevel: 1,
    cost: 5,
    requires: ['blood_ward']
  },

  // --- WARLORD'S CRY ---
  {
    id: 'war_base',
    stance: 'warlord_cry',
    branch: 'a',
    row: 0,
    name: 'Warlord Attunement',
    description: (lvl) => `+${lvl * 1.5}% chance to trigger Warlord's Cry (Base: 10%).`,
    maxLevel: 20,
    cost: 1,
  },
  {
    id: 'war_momentum',
    stance: 'warlord_cry',
    branch: 'b',
    row: 1,
    name: 'Momentum',
    description: (lvl) => `The target card has a ${lvl * 10}% chance to have its Delay reduced by 1.`,
    maxLevel: 5,
    cost: 1,
    requires: ['war_base']
  },
  {
    id: 'war_duration',
    stance: 'warlord_cry',
    branch: 'c',
    row: 2,
    name: 'Lasting Inspiration',
    description: (lvl) => `The +1 Attack buff lasts for 2 turns instead of 1.`,
    maxLevel: 1,
    cost: 3,
    requires: ['war_momentum']
  },
  {
    id: 'war_priority',
    stance: 'warlord_cry',
    branch: 'c',
    row: 3,
    name: 'Tactical Priority',
    description: (lvl) => `Prioritizes cards that are ready to attack (Delay 0).`,
    maxLevel: 1,
    cost: 4,
    requires: ['war_duration']
  },
  {
    id: 'war_permanent',
    stance: 'warlord_cry',
    branch: 'c',
    row: 4,
    name: 'Unstoppable Force',
    description: (lvl) => `The +1 Attack buff becomes permanent for the rest of the battle.`,
    maxLevel: 1,
    cost: 5,
    requires: ['war_priority']
  }
];

// Helper to get stats from user's talents
export function getTalentStats(talents: Record<string, number> = {}, stance: TalentStance) {
  const getLvl = (id: string) => talents[id] || 0;
  
  if (stance === 'void_strike') {
    return {
      triggerChance: 10 + (getLvl('void_base') * 1.5),
      chainChance: getLvl('void_chain') * 5,
      pierce: getLvl('void_pierce') > 0,
      execute: getLvl('void_execute') > 0,
      baseDamage: 1 + (getLvl('void_lethality') > 0 ? 1 : 0),
    };
  }
  if (stance === 'blood_aura') {
    return {
      triggerChance: 15 + (getLvl('blood_base') * 2),
      cleanseChance: getLvl('blood_purity') * 20,
      overflow: getLvl('blood_overflow') > 0,
      ward: getLvl('blood_ward') > 0,
      baseHealing: 1 + (getLvl('blood_vitality') > 0 ? 1 : 0),
    };
  }
  if (stance === 'warlord_cry') {
    return {
      triggerChance: 10 + (getLvl('war_base') * 1.5),
      delayReduceChance: getLvl('war_momentum') * 10,
      durationTurns: getLvl('war_duration') > 0 ? 2 : 1,
      prioritizeActive: getLvl('war_priority') > 0,
      permanent: getLvl('war_permanent') > 0,
    };
  }
  return null;
}
