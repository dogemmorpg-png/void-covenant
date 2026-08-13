export type CardTier = 'bronze' | 'silver' | 'gold' | 'legendary';

export type EquipmentSlot = 'weapon' | 'armor' | 'helmet' | 'ring' | 'amulet' | 'boots';

export interface Equipment {
  id: string;
  slot: EquipmentSlot;
  tier: CardTier;
  name: string;
  bonusType: 'maxHealth' | 'dodge' | 'goldBonus' | 'delayReduction';
  bonusValue: number;
}

export type SkillType = 'hex' | 'vampirism' | 'plague' | 'sacrifice';

export interface CardSkill {
  type: SkillType;
  value: number; // e.g. amount of extra damage for Hex, percent for Vampirism, ticks for Plague
  description: string;
}

export interface Card {
  id: string; // unique instance id (e.g. "uuid" or timestamp-random)
  baseId: string; // references the original template card (e.g. "skeleton_warrior")
  name: string;
  level: number; // Current level (1 to 5)
  tier: CardTier; // Fusing tier
  attack: number;
  health: number;
  maxHealth: number;
  delay: number; // Turn timer delay (e.g., 1, 2, 3)
  skills: CardSkill[];
  image: string; // name of a lucide icon or a descriptive string for visual background
  color: string; // color scheme for the card (e.g., violet, red, green)
  xp: number;
  maxXp: number;
  isFavorite?: boolean;
}

export interface CardTemplate {
  baseId: string;
  name: string;
  tier: CardTier;
  attack: number;
  health: number;
  delay: number;
  skills: CardSkill[];
  image: string;
  color: string;
  description: string;
}

export interface PlayerProfile {
  gold: number;
  dust: number;
  darkShards: number;
  pveEnergy: number;
  pveEnergyMax: number;
  pvpEnergy: number;
  pvpEnergyMax: number;
  lastEnergyRefill: number; // timestamp
  lastPveEnergyRefill?: number;
  lastPvpEnergyRefill?: number;
  deck: string[]; // card instance ids
  collection: Card[]; // list of owned card instances
  pveProgress: number; // stage index unlocked
  pvpRating: number; // rating points (MMR)
  battlePassPoints: number; // xp towards seasonal pass
  battlePassClaimed: number[]; // list of indices of claimed tiers
  referralsCount: number;
  completedTasks: string[]; // completed social airdrop tasks
  solanaAddress: string | null;
  solBalance: number | null;
  heroMaxHealth: number;
  level: number;
  exp: number;
  campaignStars: Record<string, number>; // stageId -> stars
  equipment: Equipment[];
  equipped: Partial<Record<EquipmentSlot, string>>; // slot -> equipment id
  isPremiumBP?: boolean;
  username?: string;
  avatarUrl?: string;
  isRegistered?: boolean;
}

export interface CampaignStage {
  id: number;
  name: string;
  description: string;
  energyCost: number;
  goldReward: number;
  dustReward: number;
  shardsReward: number;
  enemyHeroName: string;
  enemyHeroHealth: number;
  enemyHeroImage: string;
  enemyDeck: Omit<Card, 'id'>[]; // templates of enemy cards
  cardReward?: Omit<Card, 'id'>; // guaranteed card template drop on boss levels
}

export interface BattleCardState {
  id: string;
  baseId: string;
  name: string;
  attack: number;
  health: number;
  maxHealth: number;
  delay: number; // turns left before attack (decrements each turn)
  initialDelay: number; // original delay
  skills: CardSkill[];
  image: string;
  color: string;
  tier: CardTier;
  level: number;
  hexedAmount: number; // active Hex stack on this card
  isDead: boolean;
  attackFlash?: boolean; // animation flags
  damageTakenFlash?: boolean;
  healedFlash?: boolean;
}

export interface BattleState {
  playerHeroHealth: number;
  playerHeroMaxHealth: number;
  enemyHeroHealth: number;
  enemyHeroMaxHealth: number;
  playerBoard: (BattleCardState | null)[]; // length 5 slots
  enemyBoard: (BattleCardState | null)[]; // length 5 slots
  playerHand: Card[]; // cards remaining in hand
  enemyHand: Omit<Card, 'id'>[]; // enemy card queue
  playerDeckSize: number;
  enemyDeckSize: number;
  playerDeckQueue: Card[];
  turn: number; // current turn number
  phase: 'player_play' | 'combat_simulation' | 'player_won' | 'player_lost';
  combatLog: string[];
  playerDodgeChance?: number;
  playerDelayReduction?: number;
}

export interface AirdropTask {
  id: string;
  title: string;
  description: string;
  rewardType: 'shards' | 'gold' | 'dust';
  rewardAmount: number;
  actionUrl?: string;
}

export interface BattlePassTier {
  level: number;
  pointsRequired: number;
  freeRewardType: 'gold' | 'dust' | 'card';
  freeRewardAmount: number;
  freeRewardLabel: string;
  premiumRewardType: 'shards' | 'dust' | 'card' | 'legendary_pack';
  premiumRewardAmount: number;
  premiumRewardLabel: string;
  isPremium?: boolean;
}
