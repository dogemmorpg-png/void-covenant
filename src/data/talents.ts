export type TalentStance = 'void_strike' | 'blood_aura' | 'warlord_cry';

export interface TalentNode {
  id: string;
  stance: TalentStance;
  tier: 1 | 2 | 3 | 4 | 5; 
  col: 0 | -1 | 1;         
  name: string;
  icon: string; // Lucide icon name (e.g. 'Zap', 'Shield')
  description: (level: number) => string;
  maxLevel: number;
  cost: number;
  requires?: string[]; 
  requireMax?: boolean; 
}

export const TALENT_TREES: TalentNode[] = [
  // ==============================
  // --- VOID STRIKE (Damage) ---
  // ==============================
  {
    id: 'void_base', stance: 'void_strike', tier: 1, col: 0,
    name: 'Void Attunement', icon: 'Zap',
    description: (lvl) => `+${lvl * 1.5}% chance to trigger Void Strike (Base: 25%).`,
    maxLevel: 20, cost: 1
  },
  {
    id: 'void_dmg', stance: 'void_strike', tier: 2, col: -1,
    name: 'Dark Matter', icon: 'Swords',
    description: (lvl) => `Void Strike base damage increased by +${lvl}.`,
    maxLevel: 10, cost: 1, requires: ['void_base']
  },
  {
    id: 'void_chain', stance: 'void_strike', tier: 2, col: 1,
    name: 'Chain Lightning', icon: 'GitMerge',
    description: (lvl) => `${lvl * 3}% chance to hit a second random target.`,
    maxLevel: 10, cost: 1, requires: ['void_base']
  },
  {
    id: 'void_pierce', stance: 'void_strike', tier: 3, col: 0,
    name: 'Armor Piercing', icon: 'Crosshair',
    description: () => `Void Strike damage ignores enemy Barrier and Armor entirely.`,
    maxLevel: 1, cost: 5, requires: ['void_dmg', 'void_chain'], requireMax: true
  },
  {
    id: 'void_execute', stance: 'void_strike', tier: 4, col: -1,
    name: 'Execute', icon: 'Skull',
    description: (lvl) => `Deals +${lvl * 2} bonus damage if the target is below 50% HP.`,
    maxLevel: 3, cost: 5, requires: ['void_pierce']
  },
  {
    id: 'void_leech', stance: 'void_strike', tier: 4, col: 1,
    name: 'Void Siphon', icon: 'Droplet',
    description: (lvl) => `Heals the Hero for ${lvl * 15}% of the Void Strike damage dealt.`,
    maxLevel: 3, cost: 5, requires: ['void_pierce']
  },
  {
    id: 'void_ultimate', stance: 'void_strike', tier: 5, col: 0,
    name: 'Singularity', icon: 'Eclipse',
    description: () => `Void Strike affects ALL enemies on the board.`,
    maxLevel: 1, cost: 10, requires: ['void_base', 'void_dmg', 'void_chain', 'void_pierce', 'void_execute', 'void_leech'], requireMax: true
  },

  // ==============================
  // --- BLOOD AURA (Healing) ---
  // ==============================
  {
    id: 'blood_base', stance: 'blood_aura', tier: 1, col: 0,
    name: 'Blood Attunement', icon: 'Activity',
    description: (lvl) => `+${lvl * 1.5}% chance to trigger Blood Aura (Base: 25%).`,
    maxLevel: 20, cost: 1
  },
  {
    id: 'blood_heal', stance: 'blood_aura', tier: 2, col: -1,
    name: 'Vitality', icon: 'Heart',
    description: (lvl) => `Base healing amount increased by +${lvl}.`,
    maxLevel: 10, cost: 1, requires: ['blood_base']
  },
  {
    id: 'blood_cleanse', stance: 'blood_aura', tier: 2, col: 1,
    name: 'Purity', icon: 'Sparkles',
    description: (lvl) => `${lvl * 3}% chance to cleanse Poison/Hex from the target.`,
    maxLevel: 10, cost: 1, requires: ['blood_base']
  },
  {
    id: 'blood_ward', stance: 'blood_aura', tier: 3, col: 0,
    name: 'Blood Barrier', icon: 'ShieldPlus',
    description: () => `The healed target also gains Barrier (Completely blocks the next hit).`,
    maxLevel: 1, cost: 5, requires: ['blood_heal', 'blood_cleanse'], requireMax: true
  },
  {
    id: 'blood_overflow', stance: 'blood_aura', tier: 4, col: -1,
    name: 'Overflow', icon: 'Waves',
    description: (lvl) => `If target is full HP, heals the Hero for ${lvl * 33}% of the amount instead.`,
    maxLevel: 3, cost: 5, requires: ['blood_ward']
  },
  {
    id: 'blood_shield', stance: 'blood_aura', tier: 4, col: 1,
    name: 'Coagulation', icon: 'Syringe',
    description: (lvl) => `The healed target gains +${lvl} Max HP for the duration of the battle.`,
    maxLevel: 3, cost: 5, requires: ['blood_ward']
  },
  {
    id: 'blood_ultimate', stance: 'blood_aura', tier: 5, col: 0,
    name: 'Crimson Pact', icon: 'Infinity',
    description: () => `Blood Aura triggers twice, healing two targets simultaneously.`,
    maxLevel: 1, cost: 10, requires: ['blood_base', 'blood_heal', 'blood_cleanse', 'blood_ward', 'blood_overflow', 'blood_shield'], requireMax: true
  },

  // ==============================
  // --- WARLORD'S CRY (Single Buff) ---
  // ==============================
  {
    id: 'war_base', stance: 'warlord_cry', tier: 1, col: 0,
    name: 'Warlord Attunement', icon: 'Flame',
    description: (lvl) => `+${lvl * 1.5}% chance to trigger Warlord's Cry (Base: 25%).`,
    maxLevel: 20, cost: 1
  },
  {
    id: 'war_atk', stance: 'warlord_cry', tier: 2, col: -1,
    name: 'Battle Fervor', icon: 'Axe',
    description: (lvl) => `The Attack buff is increased by +${lvl}.`,
    maxLevel: 10, cost: 1, requires: ['war_base']
  },
  {
    id: 'war_armor', stance: 'warlord_cry', tier: 2, col: 1,
    name: 'Phalanx', icon: 'Shield',
    description: (lvl) => `Also grants the target +${lvl} Armor.`,
    maxLevel: 10, cost: 1, requires: ['war_base']
  },
  {
    id: 'war_duration', stance: 'warlord_cry', tier: 3, col: 0,
    name: 'Lasting Inspiration', icon: 'Hourglass',
    description: () => `The Attack and Armor buffs last for 2 turns instead of 1.`,
    maxLevel: 1, cost: 5, requires: ['war_atk', 'war_armor'], requireMax: true
  },
  {
    id: 'war_momentum', stance: 'warlord_cry', tier: 4, col: -1,
    name: 'Momentum', icon: 'Wind',
    description: (lvl) => `${lvl * 33}% chance to also reduce the target's Delay by 1.`,
    maxLevel: 3, cost: 5, requires: ['war_duration']
  },
  {
    id: 'war_heal', stance: 'warlord_cry', tier: 4, col: 1,
    name: 'Rallying Cry', icon: 'Stethoscope',
    description: (lvl) => `Heals the target for ${lvl} HP when triggered.`,
    maxLevel: 3, cost: 5, requires: ['war_duration']
  },
  {
    id: 'war_ultimate', stance: 'warlord_cry', tier: 5, col: 0,
    name: 'Unstoppable Force', icon: 'Mountain',
    description: () => `The Attack and Armor buffs become permanent for the rest of the battle.`,
    maxLevel: 1, cost: 10, requires: ['war_base', 'war_atk', 'war_armor', 'war_duration', 'war_momentum', 'war_heal'], requireMax: true
  }
];

export function getTalentStats(talents: Record<string, number> = {}, stance: TalentStance) {
  const getLvl = (id: string) => talents[id] || 0;
  
  if (stance === 'void_strike') {
    return {
      triggerChance: 25 + (getLvl('void_base') * 1.5),
      baseDamage: 1 + getLvl('void_dmg'),
      chainChance: getLvl('void_chain') * 3,
      pierce: getLvl('void_pierce') > 0,
      executeDamage: getLvl('void_execute') * 2,
      leechPercent: getLvl('void_leech') * 15,
      singularity: getLvl('void_ultimate') > 0,
    };
  }
  if (stance === 'blood_aura') {
    return {
      triggerChance: 25 + (getLvl('blood_base') * 1.5),
      baseHealing: 1 + getLvl('blood_heal'),
      cleanseChance: getLvl('blood_cleanse') * 3,
      ward: getLvl('blood_ward') > 0,
      overflowPercent: getLvl('blood_overflow') * 33,
      bonusMaxHp: getLvl('blood_shield'),
      doubleTrigger: getLvl('blood_ultimate') > 0,
    };
  }
  if (stance === 'warlord_cry') {
    return {
      triggerChance: 25 + (getLvl('war_base') * 1.5),
      bonusAtk: 1 + getLvl('war_atk'),
      bonusArmor: getLvl('war_armor'),
      durationTurns: getLvl('war_duration') > 0 ? 2 : 1,
      momentumChance: getLvl('war_momentum') * 33,
      aoeHeal: getLvl('war_heal'),
      permanent: getLvl('war_ultimate') > 0,
    };
  }
  return null;
}

