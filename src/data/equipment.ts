import { Equipment, EquipmentSlot, CardTier } from '../types';

export const EQUIPMENT_ICONS: Record<string, string> = {
  // BRONZE
  'Rusted Iron Sword': '/icons/equipment/items/rusted_iron_sword.png',
  'Torn Leather Tunic': '/icons/equipment/items/torn_leather_tunic.png',
  'Cracked Skullcap': '/icons/equipment/items/cracked_skullcap.png',
  'Tarnished Copper Ring': '/icons/equipment/items/tarnished_copper_ring.png',
  'Faded Bone Charm': '/icons/equipment/items/faded_bone_charm.png',
  'Worn Peasant Boots': '/icons/equipment/items/worn_peasant_boots.png',

  // SILVER
  'Steel Longsword': '/icons/equipment/items/steel_longsword.png',
  'Chainmail Hauberk': '/icons/equipment/items/chainmail_hauberk.png',
  "Knight's Visor": '/icons/equipment/items/knights_visor.png',
  'Silver Signet': '/icons/equipment/items/silver_signet.png',
  'Blood Ruby Pendant': '/icons/equipment/items/blood_ruby_pendant.png',
  'Reinforced Greaves': '/icons/equipment/items/reinforced_greaves.png',

  // GOLD
  'Abyssal Blade': '/icons/equipment/items/abyssal_blade.png',
  'Voidplate Armor': '/icons/equipment/items/voidplate_armor.png',
  'Crown of Thorns': '/icons/equipment/items/crown_of_thorns.png',
  'Ring of the Sovereign': '/icons/equipment/items/ring_of_the_sovereign.png',
  'Eye of the Leviathan': '/icons/equipment/items/eye_of_the_leviathan.png',
  'Shadowstriders': '/icons/equipment/items/shadowstriders.png',

  // LEGENDARY
  'Soulreaper Scythe': '/icons/equipment/items/soulreaper_scythe.png',
  'Mantle of the Lich King': '/icons/equipment/items/mantle_of_the_lich_king.png',
  'Halo of the Fallen': '/icons/equipment/items/halo_of_the_fallen.png',
  'Eternity Band': '/icons/equipment/items/eternity_band.png',
  'Heart of the Void': '/icons/equipment/items/heart_of_the_void.png',
  'Boots of the Apocalypse': '/icons/equipment/items/boots_of_the_apocalypse.png',
};

export const getEquipmentIcon = (nameOrItem?: string | Equipment | null, fallbackSlot?: EquipmentSlot): string => {
  if (!nameOrItem) {
    return fallbackSlot ? `/icons/equipment/slot_${fallbackSlot}.png` : '/icons/equipment/slot_weapon.png';
  }
  const name = typeof nameOrItem === 'string' ? nameOrItem : nameOrItem.name;
  if (EQUIPMENT_ICONS[name]) return EQUIPMENT_ICONS[name];
  if (typeof nameOrItem !== 'string' && nameOrItem.icon) return nameOrItem.icon;
  if (typeof nameOrItem !== 'string' && nameOrItem.slot) {
    return `/icons/equipment/slot_${nameOrItem.slot}.png`;
  }
  return fallbackSlot ? `/icons/equipment/slot_${fallbackSlot}.png` : '/icons/equipment/slot_weapon.png';
};

export const EQUIPMENT_TEMPLATES: Omit<Equipment, 'id'>[] = [
  // BRONZE TIER
  { name: 'Rusted Iron Sword', slot: 'weapon', tier: 'bronze', bonusType: 'maxHealth', bonusValue: 1, icon: '/icons/equipment/items/rusted_iron_sword.png' },
  { name: 'Torn Leather Tunic', slot: 'armor', tier: 'bronze', bonusType: 'maxHealth', bonusValue: 2, icon: '/icons/equipment/items/torn_leather_tunic.png' },
  { name: 'Cracked Skullcap', slot: 'helmet', tier: 'bronze', bonusType: 'maxHealth', bonusValue: 1, icon: '/icons/equipment/items/cracked_skullcap.png' },
  { name: 'Tarnished Copper Ring', slot: 'ring', tier: 'bronze', bonusType: 'goldBonus', bonusValue: 1, icon: '/icons/equipment/items/tarnished_copper_ring.png' },
  { name: 'Faded Bone Charm', slot: 'amulet', tier: 'bronze', bonusType: 'dodge', bonusValue: 1, icon: '/icons/equipment/items/faded_bone_charm.png' },
  { name: 'Worn Peasant Boots', slot: 'boots', tier: 'bronze', bonusType: 'maxHealth', bonusValue: 1, icon: '/icons/equipment/items/worn_peasant_boots.png' },

  // SILVER TIER
  { name: 'Steel Longsword', slot: 'weapon', tier: 'silver', bonusType: 'maxHealth', bonusValue: 3, icon: '/icons/equipment/items/steel_longsword.png' },
  { name: 'Chainmail Hauberk', slot: 'armor', tier: 'silver', bonusType: 'maxHealth', bonusValue: 5, icon: '/icons/equipment/items/chainmail_hauberk.png' },
  { name: 'Knight\'s Visor', slot: 'helmet', tier: 'silver', bonusType: 'maxHealth', bonusValue: 3, icon: '/icons/equipment/items/knights_visor.png' },
  { name: 'Silver Signet', slot: 'ring', tier: 'silver', bonusType: 'goldBonus', bonusValue: 3, icon: '/icons/equipment/items/silver_signet.png' },
  { name: 'Blood Ruby Pendant', slot: 'amulet', tier: 'silver', bonusType: 'dodge', bonusValue: 2, icon: '/icons/equipment/items/blood_ruby_pendant.png' },
  { name: 'Reinforced Greaves', slot: 'boots', tier: 'silver', bonusType: 'maxHealth', bonusValue: 3, icon: '/icons/equipment/items/reinforced_greaves.png' },

  // GOLD TIER
  { name: 'Abyssal Blade', slot: 'weapon', tier: 'gold', bonusType: 'maxHealth', bonusValue: 7, icon: '/icons/equipment/items/abyssal_blade.png' },
  { name: 'Voidplate Armor', slot: 'armor', tier: 'gold', bonusType: 'maxHealth', bonusValue: 10, icon: '/icons/equipment/items/voidplate_armor.png' },
  { name: 'Crown of Thorns', slot: 'helmet', tier: 'gold', bonusType: 'maxHealth', bonusValue: 7, icon: '/icons/equipment/items/crown_of_thorns.png' },
  { name: 'Ring of the Sovereign', slot: 'ring', tier: 'gold', bonusType: 'goldBonus', bonusValue: 5, icon: '/icons/equipment/items/ring_of_the_sovereign.png' },
  { name: 'Eye of the Leviathan', slot: 'amulet', tier: 'gold', bonusType: 'dodge', bonusValue: 4, icon: '/icons/equipment/items/eye_of_the_leviathan.png' },
  { name: 'Shadowstriders', slot: 'boots', tier: 'gold', bonusType: 'dodge', bonusValue: 2, icon: '/icons/equipment/items/shadowstriders.png' },

  // LEGENDARY TIER
  { name: 'Soulreaper Scythe', slot: 'weapon', tier: 'legendary', bonusType: 'delayReduction', bonusValue: 1, icon: '/icons/equipment/items/soulreaper_scythe.png' },
  { name: 'Mantle of the Lich King', slot: 'armor', tier: 'legendary', bonusType: 'maxHealth', bonusValue: 20, icon: '/icons/equipment/items/mantle_of_the_lich_king.png' },
  { name: 'Halo of the Fallen', slot: 'helmet', tier: 'legendary', bonusType: 'dodge', bonusValue: 5, icon: '/icons/equipment/items/halo_of_the_fallen.png' },
  { name: 'Eternity Band', slot: 'ring', tier: 'legendary', bonusType: 'goldBonus', bonusValue: 10, icon: '/icons/equipment/items/eternity_band.png' },
  { name: 'Heart of the Void', slot: 'amulet', tier: 'legendary', bonusType: 'maxHealth', bonusValue: 15, icon: '/icons/equipment/items/heart_of_the_void.png' },
  { name: 'Boots of the Apocalypse', slot: 'boots', tier: 'legendary', bonusType: 'dodge', bonusValue: 3, icon: '/icons/equipment/items/boots_of_the_apocalypse.png' }
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
