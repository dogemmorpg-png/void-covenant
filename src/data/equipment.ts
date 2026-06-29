import { Equipment, EquipmentSlot, CardTier } from '../types';

export const EQUIPMENT_TEMPLATES: Omit<Equipment, 'id'>[] = [
  // BRONZE TIER
  { name: 'Rusted Iron Sword', slot: 'weapon', tier: 'bronze', bonusType: 'maxHealth', bonusValue: 1 },
  { name: 'Torn Leather Tunic', slot: 'armor', tier: 'bronze', bonusType: 'maxHealth', bonusValue: 2 },
  { name: 'Cracked Skullcap', slot: 'helmet', tier: 'bronze', bonusType: 'maxHealth', bonusValue: 1 },
  { name: 'Tarnished Copper Ring', slot: 'ring', tier: 'bronze', bonusType: 'goldBonus', bonusValue: 1 },
  { name: 'Faded Bone Charm', slot: 'amulet', tier: 'bronze', bonusType: 'dodge', bonusValue: 1 },
  { name: 'Worn Peasant Boots', slot: 'boots', tier: 'bronze', bonusType: 'maxHealth', bonusValue: 1 },

  // SILVER TIER
  { name: 'Steel Longsword', slot: 'weapon', tier: 'silver', bonusType: 'maxHealth', bonusValue: 3 },
  { name: 'Chainmail Hauberk', slot: 'armor', tier: 'silver', bonusType: 'maxHealth', bonusValue: 5 },
  { name: 'Knight\'s Visor', slot: 'helmet', tier: 'silver', bonusType: 'maxHealth', bonusValue: 3 },
  { name: 'Silver Signet', slot: 'ring', tier: 'silver', bonusType: 'goldBonus', bonusValue: 3 },
  { name: 'Blood Ruby Pendant', slot: 'amulet', tier: 'silver', bonusType: 'dodge', bonusValue: 2 },
  { name: 'Reinforced Greaves', slot: 'boots', tier: 'silver', bonusType: 'maxHealth', bonusValue: 3 },

  // GOLD TIER
  { name: 'Abyssal Blade', slot: 'weapon', tier: 'gold', bonusType: 'maxHealth', bonusValue: 7 },
  { name: 'Voidplate Armor', slot: 'armor', tier: 'gold', bonusType: 'maxHealth', bonusValue: 10 },
  { name: 'Crown of Thorns', slot: 'helmet', tier: 'gold', bonusType: 'maxHealth', bonusValue: 7 },
  { name: 'Ring of the Sovereign', slot: 'ring', tier: 'gold', bonusType: 'goldBonus', bonusValue: 5 },
  { name: 'Eye of the Leviathan', slot: 'amulet', tier: 'gold', bonusType: 'dodge', bonusValue: 4 },
  { name: 'Shadowstriders', slot: 'boots', tier: 'gold', bonusType: 'dodge', bonusValue: 2 },

  // LEGENDARY TIER
  { name: 'Soulreaper Scythe', slot: 'weapon', tier: 'legendary', bonusType: 'delayReduction', bonusValue: 1 },
  { name: 'Mantle of the Lich King', slot: 'armor', tier: 'legendary', bonusType: 'maxHealth', bonusValue: 20 },
  { name: 'Halo of the Fallen', slot: 'helmet', tier: 'legendary', bonusType: 'dodge', bonusValue: 5 },
  { name: 'Eternity Band', slot: 'ring', tier: 'legendary', bonusType: 'goldBonus', bonusValue: 10 },
  { name: 'Heart of the Void', slot: 'amulet', tier: 'legendary', bonusType: 'maxHealth', bonusValue: 15 },
  { name: 'Boots of the Apocalypse', slot: 'boots', tier: 'legendary', bonusType: 'dodge', bonusValue: 3 }
];

export const generateEquipmentInstance = (template: Omit<Equipment, 'id'>): Equipment => {
  return {
    ...template,
    id: `eq_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  };
};

export const getRandomEquipmentByTier = (tier: CardTier | 'random'): Omit<Equipment, 'id'> => {
  let pool = EQUIPMENT_TEMPLATES;
  if (tier !== 'random') {
    pool = pool.filter(e => e.tier === tier);
  }
  return pool[Math.floor(Math.random() * pool.length)];
};
