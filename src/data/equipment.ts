import { Equipment, EquipmentSlot, CardTier, EquipmentSetDefinition } from '../types';

export const EQUIPMENT_ICONS: Record<string, string> = {
  // BRONZE
  'Rusted Iron Sword': '/icons/equipment/items/rusted_iron_sword.png',
  'Torn Leather Tunic': '/icons/equipment/items/torn_leather_tunic.png',
  'Cracked Skullcap': '/icons/equipment/items/cracked_skullcap.png',
  'Tarnished Copper Ring': '/icons/equipment/items/tarnished_copper_ring.png',
  'Faded Bone Charm': '/icons/equipment/items/faded_bone_charm.png',
  'Worn Peasant Boots': '/icons/equipment/items/worn_peasant_boots.png',
  'Bone Dagger': '/icons/equipment/items/bone_dagger.png',
  'Ragged Cultist Robe': '/icons/equipment/items/ragged_cultist_robe.png',
  'Straw Scarecrow Mask': '/icons/equipment/items/straw_scarecrow_mask.png',
  'Rustbound Band': '/icons/equipment/items/rustbound_band.png',
  'Twisted Willow Token': '/icons/equipment/items/twisted_willow_token.png',
  'Burlap Footwraps': '/icons/equipment/items/burlap_footwraps.png',

  // SILVER
  'Steel Longsword': '/icons/equipment/items/steel_longsword.png',
  'Chainmail Hauberk': '/icons/equipment/items/chainmail_hauberk.png',
  "Knight's Visor": '/icons/equipment/items/knights_visor.png',
  'Silver Signet': '/icons/equipment/items/silver_signet.png',
  'Blood Ruby Pendant': '/icons/equipment/items/blood_ruby_pendant.png',
  'Reinforced Greaves': '/icons/equipment/items/reinforced_greaves.png',
  "Executioner's Axe": '/icons/equipment/items/executioners_axe.png',
  'Reinforced Scale Vest': '/icons/equipment/items/reinforced_scale_vest.png',
  'Shadowstalker Hood': '/icons/equipment/items/shadowstalker_hood.png',
  'Moonstone Loop': '/icons/equipment/items/moonstone_loop.png',
  'Raven Feather Choker': '/icons/equipment/items/raven_feather_choker.png',
  'Plated Tabi': '/icons/equipment/items/plated_tabi.png',

  // GOLD
  'Abyssal Blade': '/icons/equipment/items/abyssal_blade.png',
  'Voidplate Armor': '/icons/equipment/items/voidplate_armor.png',
  'Crown of Thorns': '/icons/equipment/items/crown_of_thorns.png',
  'Ring of the Sovereign': '/icons/equipment/items/ring_of_the_sovereign.png',
  'Eye of the Leviathan': '/icons/equipment/items/eye_of_the_leviathan.png',
  'Shadowstriders': '/icons/equipment/items/shadowstriders.png',
  'Sunfire Rapier': '/icons/equipment/items/sunfire_rapier.png',
  'Dreadplate Cuirass': '/icons/equipment/items/dreadplate_cuirass.png',
  'Diadem of Whispers': '/icons/equipment/items/diadem_of_whispers.png',
  'Band of the Eclipse': '/icons/equipment/items/band_of_the_eclipse.png',
  'Solar Core Medallion': '/icons/equipment/items/solar_core_medallion.png',
  'Cinder Treads': '/icons/equipment/items/cinder_treads.png',

  // LEGENDARY
  'Soulreaper Scythe': '/icons/equipment/items/soulreaper_scythe.png',
  'Mantle of the Lich King': '/icons/equipment/items/mantle_of_the_lich_king.png',
  'Halo of the Fallen': '/icons/equipment/items/halo_of_the_fallen.png',
  'Eternity Band': '/icons/equipment/items/eternity_band.png',
  'Heart of the Void': '/icons/equipment/items/heart_of_the_void.png',
  'Boots of the Apocalypse': '/icons/equipment/items/boots_of_the_apocalypse.png',
  'Doomcaller Greatsword': '/icons/equipment/items/doomcaller_greatsword.png',
  'Chronos Aegis': '/icons/equipment/items/chronos_aegis.png',
  'Gaze of the Voidgod': '/icons/equipment/items/gaze_of_the_voidgod.png',
  'Ring of Infinite Ruin': '/icons/equipment/items/ring_of_infinite_ruin.png',
  'Voidwalker Striders': '/icons/equipment/items/voidwalker_striders.png',

  // DIVINE - SET OF THE DEMIURGE
  'Blade of the Demiurge': '/icons/equipment/items/abyssal_blade.png',
  'Carapace of the Demiurge': '/icons/equipment/items/voidplate_armor.png',
  'Crown of the Demiurge': '/icons/equipment/items/crown_of_thorns.png',
  'Striders of the Demiurge': '/icons/equipment/items/voidwalker_striders.png',
  'Seal of the Demiurge': '/icons/equipment/items/ring_of_infinite_ruin.png',
  'Heart of the Demiurge': '/icons/equipment/items/singularity_core.png',
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

  // DIVINE TIER - SET OF THE DEMIURGE (6 items)
  {
    name: 'Blade of the Demiurge',
    slot: 'weapon',
    tier: 'divine',
    bonusType: 'delayReduction',
    bonusValue: 1,
    secondaryBonusType: 'maxHealth',
    secondaryBonusValue: 15,
    setId: 'demiurge',
    description: 'Древний клинок, рассекающий ткань пространства и ускоряющий призыв союзных сущностей.',
    icon: '/icons/equipment/items/abyssal_blade.png'
  },
  {
    name: 'Carapace of the Demiurge',
    slot: 'armor',
    tier: 'divine',
    bonusType: 'maxHealth',
    bonusValue: 35,
    setId: 'demiurge',
    description: 'Непробиваемый панцирь, выкованный из осколков угасших сверхновых.',
    icon: '/icons/equipment/items/voidplate_armor.png'
  },
  {
    name: 'Crown of the Demiurge',
    slot: 'helmet',
    tier: 'divine',
    bonusType: 'maxHealth',
    bonusValue: 25,
    secondaryBonusType: 'dodge',
    secondaryBonusValue: 4,
    setId: 'demiurge',
    description: 'Венец абсолютного владычества, дарующий прозрение и защиту от ударов.',
    icon: '/icons/equipment/items/crown_of_thorns.png'
  },
  {
    name: 'Striders of the Demiurge',
    slot: 'boots',
    tier: 'divine',
    bonusType: 'dodge',
    bonusValue: 7,
    secondaryBonusType: 'maxHealth',
    secondaryBonusValue: 15,
    setId: 'demiurge',
    description: 'Поступь творца, позволяющая ускользать от сокрушительных выпадов Бездны.',
    icon: '/icons/equipment/items/voidwalker_striders.png'
  },
  {
    name: 'Seal of the Demiurge',
    slot: 'ring',
    tier: 'divine',
    bonusType: 'goldBonus',
    bonusValue: 25,
    secondaryBonusType: 'maxHealth',
    secondaryBonusValue: 20,
    setId: 'demiurge',
    description: 'Перстень с печатью Первородного, приумножающий добываемые сокровища.',
    icon: '/icons/equipment/items/ring_of_infinite_ruin.png'
  },
  {
    name: 'Heart of the Demiurge',
    slot: 'amulet',
    tier: 'divine',
    bonusType: 'maxHealth',
    bonusValue: 30,
    secondaryBonusType: 'dodge',
    secondaryBonusValue: 5,
    setId: 'demiurge',
    description: 'Пульсирующее ядро созидания, поддерживающее непрекращающуюся жизнь владельца.',
    icon: '/icons/equipment/items/singularity_core.png'
  },
];

export const DEMIURGE_SET: EquipmentSetDefinition = {
  setId: 'demiurge',
  name: 'Set of the Demiurge',
  description: 'Ancient relics forged from primordial void and stellar flame.',
  color: 'text-rose-500',
  thresholds: [
    {
      pieces: 2,
      label: "Demiurge's Vitality",
      description: '+30 Max Hero HP, +5% Dodge',
      bonus: { maxHealth: 30, dodge: 5 }
    },
    {
      pieces: 4,
      label: 'Temporal Warp',
      description: '-1 Turn Delay on all friendly cards',
      bonus: { delayReduction: 1 }
    },
    {
      pieces: 6,
      label: 'Cosmic Apotheosis',
      description: '+1 Starting Mana, +50 Max Hero HP, +3 ATK / +8 HP to summoned creatures',
      bonus: { startingMana: 1, maxHealth: 50, creatureAtkBuff: 3, creatureHpBuff: 8 }
    }
  ]
};

export const ALL_EQUIPMENT_SETS: Record<string, EquipmentSetDefinition> = {
  demiurge: DEMIURGE_SET
};

export interface ActiveSetBonusResult {
  setId: string;
  setName: string;
  piecesEquipped: number;
  totalPieces: number;
  thresholds: {
    pieces: number;
    label: string;
    description: string;
    isActive: boolean;
  }[];
  totalBonuses: {
    maxHealth: number;
    dodge: number;
    delayReduction: number;
    startingMana: number;
    creatureAtkBuff: number;
    creatureHpBuff: number;
  };
}

export const calculateEquipmentSetBonuses = (equippedItems: (Equipment | null | undefined)[]): ActiveSetBonusResult[] => {
  const results: ActiveSetBonusResult[] = [];
  
  // Group equipped items by setId
  const setCounts: Record<string, number> = {};
  equippedItems.forEach(item => {
    if (item && item.setId) {
      setCounts[item.setId] = (setCounts[item.setId] || 0) + 1;
    }
  });

  Object.entries(setCounts).forEach(([setId, count]) => {
    const setDef = ALL_EQUIPMENT_SETS[setId];
    if (!setDef) return;

    const totalBonuses = {
      maxHealth: 0,
      dodge: 0,
      delayReduction: 0,
      startingMana: 0,
      creatureAtkBuff: 0,
      creatureHpBuff: 0,
    };

    const thresholds = setDef.thresholds.map(t => {
      const isActive = count >= t.pieces;
      if (isActive) {
        if (t.bonus.maxHealth) totalBonuses.maxHealth += t.bonus.maxHealth;
        if (t.bonus.dodge) totalBonuses.dodge += t.bonus.dodge;
        if (t.bonus.delayReduction) totalBonuses.delayReduction += t.bonus.delayReduction;
        if (t.bonus.startingMana) totalBonuses.startingMana += t.bonus.startingMana;
        if (t.bonus.creatureAtkBuff) totalBonuses.creatureAtkBuff += t.bonus.creatureAtkBuff;
        if (t.bonus.creatureHpBuff) totalBonuses.creatureHpBuff += t.bonus.creatureHpBuff;
      }
      return {
        pieces: t.pieces,
        label: t.label,
        description: t.description,
        isActive
      };
    });

    results.push({
      setId,
      setName: setDef.name,
      piecesEquipped: count,
      totalPieces: 6,
      thresholds,
      totalBonuses
    });
  });

  return results;
};

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
  } else {
    // Divine equipment never drops from random chests
    pool = pool.filter(e => e.tier !== 'divine');
  }
  return pool[Math.floor(Math.random() * pool.length)];
};
