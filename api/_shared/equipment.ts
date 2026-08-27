// @ts-nocheck
import { Equipment, EquipmentSlot, CardTier } from './types.js';

export const EQUIPMENT_TEMPLATES: Omit<Equipment, 'id'>[] = [
  // BRONZE TIER (12 items)
  { name: 'Rusted Iron Sword', slot: 'weapon', tier: 'bronze', bonusType: 'maxHealth', bonusValue: 1, icon: '/icons/equipment/items/rusted_iron_sword.png' },
  { name: 'Bone Dagger', slot: 'weapon', tier: 'bronze', bonusType: 'dodge', bonusValue: 1, icon: '/icons/equipment/items/bone_dagger.png' },
  { name: 'Torn Leather Tunic', slot: 'armor', tier: 'bronze', bonusType: 'maxHealth', bonusValue: 2, icon: '/icons/equipment/items/torn_leather_tunic.png' },
  { name: 'Ragged Cultist Robe', slot: 'armor', tier: 'bronze', bonusType: 'dodge', bonusValue: 1, icon: '/icons/equipment/items/ragged_cultist_robe.png' },
  { name: 'Cracked Skullcap', slot: 'helmet', tier: 'bronze', bonusType: 'maxHealth', bonusValue: 1, icon: '/icons/equipment/items/cracked_skullcap.png' },
  { name: 'Straw Scarecrow Mask', slot: 'helmet', tier: 'bronze', bonusType: 'dodge', bonusValue: 1, icon: '/icons/equipment/items/straw_scarecrow_mask.png' },
  { name: 'Tarnished Copper Ring', slot: 'ring', tier: 'bronze', bonusType: 'goldBonus', bonusValue: 1, icon: '/icons/equipment/items/tarnished_copper_ring.png' },
  { name: 'Rustbound Band', slot: 'ring', tier: 'bronze', bonusType: 'maxHealth', bonusValue: 2, icon: '/icons/equipment/items/rustbound_band.png' },
  { name: 'Faded Bone Charm', slot: 'amulet', tier: 'bronze', bonusType: 'dodge', bonusValue: 1, icon: '/icons/equipment/items/faded_bone_charm.png' },
  { name: 'Twisted Willow Token', slot: 'amulet', tier: 'bronze', bonusType: 'goldBonus', bonusValue: 1, icon: '/icons/equipment/items/twisted_willow_token.png' },
  { name: 'Worn Peasant Boots', slot: 'boots', tier: 'bronze', bonusType: 'maxHealth', bonusValue: 1, icon: '/icons/equipment/items/worn_peasant_boots.png' },
  { name: 'Burlap Footwraps', slot: 'boots', tier: 'bronze', bonusType: 'dodge', bonusValue: 1, icon: '/icons/equipment/items/burlap_footwraps.png' },

  // SILVER TIER (12 items)
  { name: 'Steel Longsword', slot: 'weapon', tier: 'silver', bonusType: 'maxHealth', bonusValue: 3, icon: '/icons/equipment/items/steel_longsword.png' },
  { name: "Executioner's Axe", slot: 'weapon', tier: 'silver', bonusType: 'maxHealth', bonusValue: 4, icon: '/icons/equipment/items/executioners_axe.png' },
  { name: 'Chainmail Hauberk', slot: 'armor', tier: 'silver', bonusType: 'maxHealth', bonusValue: 5, icon: '/icons/equipment/items/chainmail_hauberk.png' },
  { name: 'Reinforced Scale Vest', slot: 'armor', tier: 'silver', bonusType: 'dodge', bonusValue: 3, icon: '/icons/equipment/items/reinforced_scale_vest.png' },
  { name: 'Knight\'s Visor', slot: 'helmet', tier: 'silver', bonusType: 'maxHealth', bonusValue: 3, icon: '/icons/equipment/items/knights_visor.png' },
  { name: 'Shadowstalker Hood', slot: 'helmet', tier: 'silver', bonusType: 'dodge', bonusValue: 3, icon: '/icons/equipment/items/shadowstalker_hood.png' },
  { name: 'Silver Signet', slot: 'ring', tier: 'silver', bonusType: 'goldBonus', bonusValue: 3, icon: '/icons/equipment/items/silver_signet.png' },
  { name: 'Moonstone Loop', slot: 'ring', tier: 'silver', bonusType: 'maxHealth', bonusValue: 4, icon: '/icons/equipment/items/moonstone_loop.png' },
  { name: 'Blood Ruby Pendant', slot: 'amulet', tier: 'silver', bonusType: 'dodge', bonusValue: 2, icon: '/icons/equipment/items/blood_ruby_pendant.png' },
  { name: 'Raven Feather Choker', slot: 'amulet', tier: 'silver', bonusType: 'goldBonus', bonusValue: 4, icon: '/icons/equipment/items/raven_feather_choker.png' },
  { name: 'Reinforced Greaves', slot: 'boots', tier: 'silver', bonusType: 'maxHealth', bonusValue: 3, icon: '/icons/equipment/items/reinforced_greaves.png' },
  { name: 'Plated Tabi', slot: 'boots', tier: 'silver', bonusType: 'dodge', bonusValue: 3, icon: '/icons/equipment/items/plated_tabi.png' },

  // GOLD TIER (12 items)
  { name: 'Abyssal Blade', slot: 'weapon', tier: 'gold', bonusType: 'maxHealth', bonusValue: 7, icon: '/icons/equipment/items/abyssal_blade.png' },
  { name: 'Sunfire Rapier', slot: 'weapon', tier: 'gold', bonusType: 'delayReduction', bonusValue: 1, icon: '/icons/equipment/items/sunfire_rapier.png' },
  { name: 'Voidplate Armor', slot: 'armor', tier: 'gold', bonusType: 'maxHealth', bonusValue: 10, icon: '/icons/equipment/items/voidplate_armor.png' },
  { name: 'Dreadplate Cuirass', slot: 'armor', tier: 'gold', bonusType: 'maxHealth', bonusValue: 12, icon: '/icons/equipment/items/dreadplate_cuirass.png' },
  { name: 'Crown of Thorns', slot: 'helmet', tier: 'gold', bonusType: 'maxHealth', bonusValue: 7, icon: '/icons/equipment/items/crown_of_thorns.png' },
  { name: 'Diadem of Whispers', slot: 'helmet', tier: 'gold', bonusType: 'dodge', bonusValue: 5, icon: '/icons/equipment/items/diadem_of_whispers.png' },
  { name: 'Ring of the Sovereign', slot: 'ring', tier: 'gold', bonusType: 'goldBonus', bonusValue: 5, icon: '/icons/equipment/items/ring_of_the_sovereign.png' },
  { name: 'Band of the Eclipse', slot: 'ring', tier: 'gold', bonusType: 'maxHealth', bonusValue: 8, icon: '/icons/equipment/items/band_of_the_eclipse.png' },
  { name: 'Eye of the Leviathan', slot: 'amulet', tier: 'gold', bonusType: 'dodge', bonusValue: 4, icon: '/icons/equipment/items/eye_of_the_leviathan.png' },
  { name: 'Solar Core Medallion', slot: 'amulet', tier: 'gold', bonusType: 'goldBonus', bonusValue: 7, icon: '/icons/equipment/items/solar_core_medallion.png' },
  { name: 'Shadowstriders', slot: 'boots', tier: 'gold', bonusType: 'dodge', bonusValue: 2, icon: '/icons/equipment/items/shadowstriders.png' },
  { name: 'Cinder Treads', slot: 'boots', tier: 'gold', bonusType: 'maxHealth', bonusValue: 8, icon: '/icons/equipment/items/cinder_treads.png' },

  // LEGENDARY TIER (12 items)
  { name: 'Soulreaper Scythe', slot: 'weapon', tier: 'legendary', bonusType: 'delayReduction', bonusValue: 1, icon: '/icons/equipment/items/soulreaper_scythe.png' },
  { name: 'Doomcaller Greatsword', slot: 'weapon', tier: 'legendary', bonusType: 'maxHealth', bonusValue: 25, icon: '/icons/equipment/items/doomcaller_greatsword.png' },
  { name: 'Mantle of the Lich King', slot: 'armor', tier: 'legendary', bonusType: 'maxHealth', bonusValue: 20, icon: '/icons/equipment/items/mantle_of_the_lich_king.png' },
  { name: 'Chronos Aegis', slot: 'armor', tier: 'legendary', bonusType: 'delayReduction', bonusValue: 1, icon: '/icons/equipment/items/chronos_aegis.png' },
  { name: 'Halo of the Fallen', slot: 'helmet', tier: 'legendary', bonusType: 'dodge', bonusValue: 5, icon: '/icons/equipment/items/halo_of_the_fallen.png' },
  { name: 'Gaze of the Voidgod', slot: 'helmet', tier: 'legendary', bonusType: 'maxHealth', bonusValue: 20, icon: '/icons/equipment/items/gaze_of_the_voidgod.png' },
  { name: 'Eternity Band', slot: 'ring', tier: 'legendary', bonusType: 'goldBonus', bonusValue: 10, icon: '/icons/equipment/items/eternity_band.png' },
  { name: 'Ring of Infinite Ruin', slot: 'ring', tier: 'legendary', bonusType: 'dodge', bonusValue: 6, icon: '/icons/equipment/items/ring_of_infinite_ruin.png' },
  { name: 'Heart of the Void', slot: 'amulet', tier: 'legendary', bonusType: 'maxHealth', bonusValue: 15, icon: '/icons/equipment/items/heart_of_the_void.png' },
  { name: 'Singularity Core', slot: 'amulet', tier: 'legendary', bonusType: 'delayReduction', bonusValue: 1, icon: '/icons/equipment/items/singularity_core.png' },
  { name: 'Boots of the Apocalypse', slot: 'boots', tier: 'legendary', bonusType: 'dodge', bonusValue: 3, icon: '/icons/equipment/items/boots_of_the_apocalypse.png' },
  { name: 'Voidwalker Striders', slot: 'boots', tier: 'legendary', bonusType: 'goldBonus', bonusValue: 15, icon: '/icons/equipment/items/voidwalker_striders.png' },
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
