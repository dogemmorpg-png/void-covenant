import { Card, CardTemplate, CardTier, CampaignStage, AirdropTask, BattlePassTier } from '../types';

export const CARD_TEMPLATES: CardTemplate[] = [
  {
    baseId: 'skeleton_warrior',
    name: 'Skeleton Warrior',
    tier: 'bronze',
    attack: 2,
    health: 8,
    delay: 1,
    skills: [
      { type: 'vampirism', value: 2, description: 'Vampirism: heals self for 2 HP on attack.' }
    ],
    image: '/cards/skeleton_warrior.png',
    color: 'slate',
    description: 'A common footsoldier of the death legions, risen by the covenant\'s call.'
  },
  {
    baseId: 'plague_rat',
    name: 'Plague Rat',
    tier: 'bronze',
    attack: 1,
    health: 6,
    delay: 1,
    skills: [
      { type: 'plague', value: 1, description: 'Plague: deals 1 damage to random enemies at end of turn.' }
    ],
    image: '/cards/plague_rat.png',
    color: 'emerald',
    description: 'A carrier of the plague pens, devouring the flesh of fallen heroes.'
  },
  {
    baseId: 'cursed_witch',
    name: 'Cursed Witch',
    tier: 'bronze',
    attack: 3,
    health: 10,
    delay: 2,
    skills: [
      { type: 'hex', value: 2, description: 'Hex: increases enemy incoming damage by 2.' }
    ],
    image: '/cards/cursed_witch.png',
    color: 'purple',
    description: 'A warlock weaving webs of corruption and casting void curses.'
  },
  {
    baseId: 'dark_acolyte',
    name: 'Dark Acolyte',
    tier: 'bronze',
    attack: 2,
    health: 12,
    delay: 2,
    skills: [
      { type: 'sacrifice', value: 4, description: 'Sacrifice: destroys an ally, granting the hero +4 HP.' }
    ],
    image: '/cards/dark_acolyte.png',
    color: 'crimson',
    description: 'A fanatic willing to sacrifice another\'s soul for a dark blessing.'
  },
  {
    baseId: 'grave_ghoul',
    name: 'Grave Ghoul',
    tier: 'bronze',
    attack: 3,
    health: 9,
    delay: 1,
    skills: [
      { type: 'vampirism', value: 1, description: 'Vampirism: heals self for 1 HP on attack.' }
    ],
    image: '/cards/grave_ghoul.png',
    color: 'slate',
    description: 'A feral undead beast that hungers for fresh corpses.'
  },
  {
    baseId: 'bone_archer',
    name: 'Bone Archer',
    tier: 'bronze',
    attack: 4,
    health: 6,
    delay: 2,
    skills: [
      { type: 'hex', value: 1, description: 'Hex: increases enemy incoming damage by 1.' }
    ],
    image: '/cards/bone_archer.png',
    color: 'slate',
    description: 'Skeletal archers whose arrows are tipped with dark magic.'
  },
  {
    baseId: 'swamp_zombie',
    name: 'Swamp Zombie',
    tier: 'bronze',
    attack: 2,
    health: 14,
    delay: 2,
    skills: [
      { type: 'plague', value: 1, description: 'Plague: deals 1 damage to random enemies at end of turn.' }
    ],
    image: '/cards/swamp_zombie.png',
    color: 'emerald',
    description: 'Dripping with toxic sludge, it spreads disease just by being near.'
  },
  {
    baseId: 'blood_imp',
    name: 'Blood Imp',
    tier: 'bronze',
    attack: 2,
    health: 7,
    delay: 1,
    skills: [
      { type: 'sacrifice', value: 2, description: 'Sacrifice: destroys an ally, granting the hero +2 HP.' }
    ],
    image: '/cards/blood_imp.png',
    color: 'crimson',
    description: 'A minor demon used as fodder for greater summoning rituals.'
  },
  {
    baseId: 'shade',
    name: 'Shade',
    tier: 'bronze',
    attack: 3,
    health: 5,
    delay: 1,
    skills: [
      { type: 'hex', value: 2, description: 'Hex: increases enemy incoming damage by 2.' }
    ],
    image: '/cards/shade.png',
    color: 'violet',
    description: 'A restless spirit that drains the warmth from the living.'
  },
  {
    baseId: 'carrion_crow',
    name: 'Carrion Crow',
    tier: 'bronze',
    attack: 1,
    health: 4,
    delay: 1,
    skills: [
      { type: 'vampirism', value: 2, description: 'Vampirism: heals self for 2 HP on attack.' }
    ],
    image: '/cards/carrion_crow.png',
    color: 'slate',
    description: 'A cursed bird that feasts on the eyes of the dying.'
  },
  {
    baseId: 'rot_hound',
    name: 'Rot Hound',
    tier: 'bronze',
    attack: 4,
    health: 8,
    delay: 2,
    skills: [
      { type: 'plague', value: 2, description: 'Plague: deals 2 damage to random enemies at end of turn.' }
    ],
    image: '/cards/rot_hound.png',
    color: 'emerald',
    description: 'An undead dog, its bite infects the victim with severe rot.'
  },
  {
    baseId: 'goblin_thief',
    name: 'Goblin Thief',
    tier: 'bronze',
    attack: 3,
    health: 7,
    delay: 1,
    skills: [
      { type: 'hex', value: 1, description: 'Hex: increases enemy incoming damage by 1.' }
    ],
    image: '/cards/goblin_thief.png',
    color: 'amber',
    description: 'A sneaky creature of the dark that steals life force.'
  },
  {
    baseId: 'mud_golem',
    name: 'Mud Golem',
    tier: 'bronze',
    attack: 1,
    health: 18,
    delay: 3,
    skills: [
      { type: 'sacrifice', value: 5, description: 'Sacrifice: destroys an ally, granting the hero +5 HP.' }
    ],
    image: '/cards/mud_golem.png',
    color: 'amber',
    description: 'A slow, lumbering construct of cursed earth.'
  },
  {
    baseId: 'vampire_bat',
    name: 'Vampire Bat',
    tier: 'bronze',
    attack: 2,
    health: 5,
    delay: 1,
    skills: [
      { type: 'vampirism', value: 3, description: 'Vampirism: heals self for 3 HP on attack.' }
    ],
    image: '/cards/vampire_bat.png',
    color: 'crimson',
    description: 'A giant bat that drains the blood of the unwary.'
  },
  {
    baseId: 'lost_soul',
    name: 'Lost Soul',
    tier: 'bronze',
    attack: 1,
    health: 8,
    delay: 2,
    skills: [
      { type: 'hex', value: 3, description: 'Hex: increases enemy incoming damage by 3.' }
    ],
    image: '/cards/lost_soul.png',
    color: 'cyan',
    description: 'Wandering spirits whose wails shatter the mind.'
  },
  {
    baseId: 'cultist_brute',
    name: 'Cultist Brute',
    tier: 'bronze',
    attack: 4,
    health: 12,
    delay: 3,
    skills: [
      { type: 'sacrifice', value: 3, description: 'Sacrifice: destroys an ally, granting the hero +3 HP.' }
    ],
    image: '/cards/cultist_brute.png',
    color: 'crimson',
    description: 'A heavily muscled zealot corrupted by dark magic.'
  },
  {
    baseId: 'spore_carrier',
    name: 'Spore Carrier',
    tier: 'bronze',
    attack: 1,
    health: 10,
    delay: 2,
    skills: [
      { type: 'plague', value: 2, description: 'Plague: deals 2 damage to random enemies at end of turn.' }
    ],
    image: '/cards/spore_carrier.png',
    color: 'emerald',
    description: 'A walking fungal infection, bursting with toxic spores.'
  },
  {
    baseId: 'skeleton_guard',
    name: 'Skeleton Guard',
    tier: 'bronze',
    attack: 1,
    health: 15,
    delay: 2,
    skills: [
      { type: 'vampirism', value: 1, description: 'Vampirism: heals self for 1 HP on attack.' }
    ],
    image: '/cards/skeleton_guard.png',
    color: 'slate',
    description: 'Armored skeletons holding the line for the covenant.'
  },
  {
    baseId: 'shadow_wisp',
    name: 'Shadow Wisp',
    tier: 'bronze',
    attack: 2,
    health: 3,
    delay: 1,
    skills: [
      { type: 'hex', value: 2, description: 'Hex: increases enemy incoming damage by 2.' }
    ],
    image: '/cards/shadow_wisp.png',
    color: 'violet',
    description: 'A fleeting shadow that curses those it touches.'
  },
  {
    baseId: 'blood_thrall',
    name: 'Blood Thrall',
    tier: 'bronze',
    attack: 3,
    health: 10,
    delay: 2,
    skills: [
      { type: 'vampirism', value: 2, description: 'Vampirism: heals self for 2 HP on attack.' }
    ],
    image: '/cards/blood_thrall.png',
    color: 'crimson',
    description: 'A mind-controlled servant bound by blood magic.'
  },
  {
    baseId: 'abyss_reaper',
    name: 'Abyss Reaper',
    tier: 'silver',
    attack: 4,
    health: 14,
    delay: 2,
    skills: [
      { type: 'hex', value: 3, description: 'Hex: increases enemy incoming damage by 3.' },
      { type: 'vampirism', value: 3, description: 'Vampirism: heals self for 3 HP on attack.' }
    ],
    image: '/cards/abyss_reaper.png',
    color: 'violet',
    description: 'A merciless executioner of the Abyss, draining the life force of victims.'
  },
  {
    baseId: 'hell_rider',
    name: 'Hell Rider',
    tier: 'silver',
    attack: 3,
    health: 18,
    delay: 2,
    skills: [
      { type: 'plague', value: 2, description: 'Plague: deals 2 damage to random enemies at end of turn.' }
    ],
    image: '/cards/hell_rider.png',
    color: 'amber',
    description: 'A death knight on a spectral steed, bringing doom and decay.'
  },
  {
    baseId: 'plague_doctor',
    name: 'Plague Doctor',
    tier: 'silver',
    attack: 2,
    health: 16,
    delay: 2,
    skills: [
      { type: 'plague', value: 3, description: 'Plague: deals 3 damage to random enemies at end of turn.' }
    ],
    image: '/cards/plague_doctor.png',
    color: 'emerald',
    description: 'Spreading virulent diseases instead of curing them.'
  },
  {
    baseId: 'vampire_knight',
    name: 'Vampire Knight',
    tier: 'silver',
    attack: 5,
    health: 15,
    delay: 2,
    skills: [
      { type: 'vampirism', value: 4, description: 'Vampirism: heals self for 4 HP on attack.' }
    ],
    image: '/cards/vampire_knight.png',
    color: 'crimson',
    description: 'Aristocrats of blood who fight with elegant, deadly precision.'
  },
  {
    baseId: 'bone_golem',
    name: 'Bone Golem',
    tier: 'silver',
    attack: 4,
    health: 24,
    delay: 3,
    skills: [
      { type: 'sacrifice', value: 5, description: 'Sacrifice: destroys an ally, granting the hero +5 HP.' }
    ],
    image: '/cards/bone_golem.png',
    color: 'slate',
    description: 'A towering construct built from a thousand corpses.'
  },
  {
    baseId: 'banshee',
    name: 'Banshee',
    tier: 'silver',
    attack: 6,
    health: 10,
    delay: 2,
    skills: [
      { type: 'hex', value: 4, description: 'Hex: increases enemy incoming damage by 4.' }
    ],
    image: '/cards/banshee.png',
    color: 'cyan',
    description: 'Her scream curses the souls of those who hear it.'
  },
  {
    baseId: 'flesh_abomination',
    name: 'Flesh Abomination',
    tier: 'silver',
    attack: 5,
    health: 20,
    delay: 3,
    skills: [
      { type: 'plague', value: 2, description: 'Plague: deals 2 damage to random enemies at end of turn.' }
    ],
    image: '/cards/flesh_abomination.png',
    color: 'emerald',
    description: 'A stitched horror leaking toxic fluids.'
  },
  {
    baseId: 'dark_templar',
    name: 'Dark Templar',
    tier: 'silver',
    attack: 4,
    health: 18,
    delay: 2,
    skills: [
      { type: 'vampirism', value: 2, description: 'Vampirism: heals self for 2 HP on attack.' },
      { type: 'sacrifice', value: 3, description: 'Sacrifice: destroys an ally, granting the hero +3 HP.' }
    ],
    image: '/cards/dark_templar.png',
    color: 'purple',
    description: 'Fallen knights who have sworn allegiance to the Void.'
  },
  {
    baseId: 'phantom_assassin',
    name: 'Phantom Assassin',
    tier: 'silver',
    attack: 7,
    health: 8,
    delay: 1,
    skills: [
      { type: 'hex', value: 2, description: 'Hex: increases enemy incoming damage by 2.' }
    ],
    image: '/cards/phantom_assassin.png',
    color: 'violet',
    description: 'A ghost that strikes from the shadows, bypassing armor.'
  },
  {
    baseId: 'blood_priest',
    name: 'Blood Priest',
    tier: 'silver',
    attack: 3,
    health: 16,
    delay: 2,
    skills: [
      { type: 'sacrifice', value: 8, description: 'Sacrifice: destroys an ally, granting the hero +8 HP.' }
    ],
    image: '/cards/blood_priest.png',
    color: 'crimson',
    description: 'Masters of blood magic who channel their allies\' life force.'
  },
  {
    baseId: 'toxic_slime',
    name: 'Toxic Slime',
    tier: 'silver',
    attack: 2,
    health: 22,
    delay: 3,
    skills: [
      { type: 'plague', value: 4, description: 'Plague: deals 4 damage to random enemies at end of turn.' }
    ],
    image: '/cards/toxic_slime.png',
    color: 'emerald',
    description: 'An acidic blob that dissolves anything it touches.'
  },
  {
    baseId: 'gargoyle',
    name: 'Gargoyle',
    tier: 'silver',
    attack: 4,
    health: 18,
    delay: 2,
    skills: [
      { type: 'vampirism', value: 2, description: 'Vampirism: heals self for 2 HP on attack.' },
      { type: 'hex', value: 2, description: 'Hex: increases enemy incoming damage by 2.' }
    ],
    image: '/cards/gargoyle.png',
    color: 'slate',
    description: 'A stone statue brought to life by dark rituals.'
  },
  {
    baseId: 'void_walker',
    name: 'Void Walker',
    tier: 'silver',
    attack: 5,
    health: 14,
    delay: 2,
    skills: [
      { type: 'hex', value: 5, description: 'Hex: increases enemy incoming damage by 5.' }
    ],
    image: '/cards/void_walker.png',
    color: 'purple',
    description: 'An entity composed purely of void energy.'
  },
  {
    baseId: 'necromantic_totem',
    name: 'Necromantic Totem',
    tier: 'silver',
    attack: 0,
    health: 25,
    delay: 4,
    skills: [
      { type: 'sacrifice', value: 10, description: 'Sacrifice: destroys an ally, granting the hero +10 HP.' }
    ],
    image: '/cards/necromantic_totem.png',
    color: 'slate',
    description: 'An immobile pillar of bones that constantly fuels the hero.'
  },
  {
    baseId: 'dullahan',
    name: 'Dullahan',
    tier: 'silver',
    attack: 6,
    health: 16,
    delay: 2,
    skills: [
      { type: 'vampirism', value: 3, description: 'Vampirism: heals self for 3 HP on attack.' }
    ],
    image: '/cards/dullahan.png',
    color: 'slate',
    description: 'A headless horseman seeking to harvest souls.'
  },
  {
    baseId: 'covenant_necromancer',
    name: 'Covenant Necromancer',
    tier: 'gold',
    attack: 5,
    health: 22,
    delay: 3,
    skills: [
      { type: 'plague', value: 3, description: 'Plague: deals 3 damage to random enemies at end of turn.' },
      { type: 'sacrifice', value: 6, description: 'Sacrifice: destroys an ally, granting the hero +6 HP.' }
    ],
    image: '/cards/covenant_necromancer.png',
    color: 'cyan',
    description: 'Master of forbidden arts, controlling the boundary between life and death.'
  },
  {
    baseId: 'fallen_angel',
    name: 'Fallen Angel',
    tier: 'gold',
    attack: 6,
    health: 26,
    delay: 3,
    skills: [
      { type: 'vampirism', value: 5, description: 'Vampirism: heals self for 5 HP on attack.' },
      { type: 'hex', value: 4, description: 'Hex: increases enemy incoming damage by 4.' }
    ],
    image: '/cards/fallen_angel.png',
    color: 'rose',
    description: 'A former guardian of the heavens, cast down for pride and sworn to the Covenant.'
  },
  {
    baseId: 'lich_king',
    name: 'Lich King',
    tier: 'gold',
    attack: 7,
    health: 24,
    delay: 3,
    skills: [
      { type: 'hex', value: 6, description: 'Hex: increases enemy incoming damage by 6.' },
      { type: 'vampirism', value: 4, description: 'Vampirism: heals self for 4 HP on attack.' }
    ],
    image: '/cards/lich_king.png',
    color: 'cyan',
    description: 'An undead monarch whose frozen heart commands the undead legions.'
  },
  {
    baseId: 'blood_queen',
    name: 'Blood Queen',
    tier: 'gold',
    attack: 8,
    health: 20,
    delay: 2,
    skills: [
      { type: 'vampirism', value: 7, description: 'Vampirism: heals self for 7 HP on attack.' }
    ],
    image: '/cards/blood_queen.png',
    color: 'crimson',
    description: 'The regal matriarch of the vampire clans, unquenchable in her thirst.'
  },
  {
    baseId: 'plague_behemoth',
    name: 'Plague Behemoth',
    tier: 'gold',
    attack: 5,
    health: 35,
    delay: 4,
    skills: [
      { type: 'plague', value: 5, description: 'Plague: deals 5 damage to random enemies at end of turn.' }
    ],
    image: '/cards/plague_behemoth.png',
    color: 'emerald',
    description: 'A walking disaster that turns the land into a toxic wasteland.'
  },
  {
    baseId: 'soul_devourer',
    name: 'Soul Devourer',
    tier: 'gold',
    attack: 6,
    health: 28,
    delay: 3,
    skills: [
      { type: 'hex', value: 4, description: 'Hex: increases enemy incoming damage by 4.' },
      { type: 'sacrifice', value: 8, description: 'Sacrifice: destroys an ally, granting the hero +8 HP.' }
    ],
    image: '/cards/soul_devourer.png',
    color: 'violet',
    description: 'A demon that eats the very essence of its enemies.'
  },
  {
    baseId: 'abyssal_dragon',
    name: 'Abyssal Dragon',
    tier: 'gold',
    attack: 9,
    health: 30,
    delay: 4,
    skills: [
      { type: 'hex', value: 5, description: 'Hex: increases enemy incoming damage by 5.' }
    ],
    image: '/cards/abyssal_dragon.png',
    color: 'purple',
    description: 'A dragon corrupted by the void, breathing dark fire.'
  },
  {
    baseId: 'doom_bringer',
    name: 'Doom Bringer',
    tier: 'gold',
    attack: 10,
    health: 18,
    delay: 2,
    skills: [
      { type: 'vampirism', value: 4, description: 'Vampirism: heals self for 4 HP on attack.' }
    ],
    image: '/cards/doom_bringer.png',
    color: 'amber',
    description: 'A herald of the apocalypse, striking with immense power.'
  },
  {
    baseId: 'spider_queen',
    name: 'Spider Queen',
    tier: 'gold',
    attack: 6,
    health: 25,
    delay: 3,
    skills: [
      { type: 'plague', value: 4, description: 'Plague: deals 4 damage to random enemies at end of turn.' },
      { type: 'hex', value: 3, description: 'Hex: increases enemy incoming damage by 3.' }
    ],
    image: '/cards/spider_queen.png',
    color: 'emerald',
    description: 'Mother of the brood, her venom causes agonizing death.'
  },
  {
    baseId: 'death_knight_champion',
    name: 'Death Knight Champion',
    tier: 'gold',
    attack: 8,
    health: 32,
    delay: 3,
    skills: [
      { type: 'vampirism', value: 4, description: 'Vampirism: heals self for 4 HP on attack.' },
      { type: 'hex', value: 2, description: 'Hex: increases enemy incoming damage by 2.' }
    ],
    image: '/cards/death_knight_champion.png',
    color: 'slate',
    description: 'The most elite of the death knights, unyielding in combat.'
  },
  {
    baseId: 'void_overlord',
    name: 'Void Overlord',
    tier: 'legendary',
    attack: 8,
    health: 35,
    delay: 3,
    skills: [
      { type: 'hex', value: 5, description: 'Hex: increases enemy incoming damage by 5.' },
      { type: 'plague', value: 4, description: 'Plague: deals 4 damage to random enemies at end of turn.' },
      { type: 'vampirism', value: 4, description: 'Vampirism: heals self for 4 HP on attack.' }
    ],
    image: '/cards/void_overlord.png',
    color: 'red',
    description: 'An ancient deity of the Abyss whose very presence poisons all living things.'
  },
  {
    baseId: 'belial_lord_of_lies',
    name: 'Belial, Lord of Lies',
    tier: 'legendary',
    attack: 12,
    health: 40,
    delay: 3,
    skills: [
      { type: 'hex', value: 8, description: 'Hex: increases enemy incoming damage by 8.' },
      { type: 'sacrifice', value: 10, description: 'Sacrifice: destroys an ally, granting the hero +10 HP.' }
    ],
    image: '/cards/belial_lord_of_lies.png',
    color: 'purple',
    description: 'A prime evil whose illusions shatter reality itself.'
  },
  {
    baseId: 'dracula_the_first',
    name: 'Dracula, The First',
    tier: 'legendary',
    attack: 10,
    health: 38,
    delay: 2,
    skills: [
      { type: 'vampirism', value: 10, description: 'Vampirism: heals self for 10 HP on attack.' }
    ],
    image: '/cards/dracula_the_first.png',
    color: 'crimson',
    description: 'The progenitor of all vampires. He cannot be stopped.'
  },
  {
    baseId: 'pestilence_incarnate',
    name: 'Pestilence Incarnate',
    tier: 'legendary',
    attack: 6,
    health: 50,
    delay: 4,
    skills: [
      { type: 'plague', value: 8, description: 'Plague: deals 8 damage to random enemies at end of turn.' },
      { type: 'vampirism', value: 5, description: 'Vampirism: heals self for 5 HP on attack.' }
    ],
    image: '/cards/pestilence_incarnate.png',
    color: 'emerald',
    description: 'The living embodiment of disease and decay. It outlasts everything.'
  },
  {
    baseId: 'azrael_angel_of_death',
    name: 'Azrael, Angel of Death',
    tier: 'legendary',
    attack: 15,
    health: 30,
    delay: 4,
    skills: [
      { type: 'hex', value: 5, description: 'Hex: increases enemy incoming damage by 5.' },
      { type: 'sacrifice', value: 15, description: 'Sacrifice: destroys an ally, granting the hero +15 HP.' }
    ],
    image: '/cards/azrael_angel_of_death.png',
    color: 'slate',
    description: 'The final judge. His blade cuts through soul and flesh alike.'
  }
];

// Helper to create a unique card instance from template
export function createCardInstance(template: CardTemplate, level: number = 1): Card {
  const levelMultiplier = 1 + (level - 1) * 0.15; // +15% stats per level
  const baseAttack = template.attack;
  const baseHealth = template.health;
  
  // Calculate stats based on level
  const attack = Math.round(baseAttack * levelMultiplier);
  const health = Math.round(baseHealth * levelMultiplier);
  
  // Scale skill values slightly with level
  const scaledSkills = template.skills.map(skill => {
    const scaleFactor = 1 + Math.floor((level - 1) / 2) * 0.5; // +50% power every 2 levels
    return {
      ...skill,
      value: Math.round(skill.value * scaleFactor),
      description: skill.description.replace(/\d+/, String(Math.round(skill.value * scaleFactor)))
    };
  });

  return {
    id: `${template.baseId}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    baseId: template.baseId,
    name: template.name,
    level,
    tier: template.tier,
    attack,
    health,
    maxHealth: health,
    delay: template.delay,
    skills: scaledSkills,
    image: template.image,
    color: template.color,
    xp: 0,
    maxXp: level * 50 // 50, 100, 150, 200, 250 XP
  };
}

// Generate the initial starter deck for a new player
export function getStarterDeck(): Card[] {
  // 5 starter cards
  const templates = [
    CARD_TEMPLATES.find(c => c.baseId === 'skeleton_warrior')!,
    CARD_TEMPLATES.find(c => c.baseId === 'skeleton_warrior')!,
    CARD_TEMPLATES.find(c => c.baseId === 'plague_rat')!,
    CARD_TEMPLATES.find(c => c.baseId === 'cursed_witch')!,
    CARD_TEMPLATES.find(c => c.baseId === 'dark_acolyte')!
  ];
  
  return templates.map(t => createCardInstance(t, 1));
}


export const generateCampaignStage = (floor: number): import('../types').CampaignStage => {
  const isBoss = floor % 10 === 0;
  
  // Health scales by 5 per floor
  const enemyHeroHealth = 20 + Math.floor((floor - 1) * 5);
  
  // Rewards
  const goldReward = 100 + (floor * 15);
  const dustReward = 10 + (floor * 3);
  const shardsReward = isBoss ? 15 + Math.floor(floor / 2) : 0;
  
  // Pick permitted card tiers based on floor
  const permittedTiers = ['bronze'];
  if (floor > 5) permittedTiers.push('silver');
  if (floor > 15) permittedTiers.push('gold');
  if (floor > 30) permittedTiers.push('legendary');
  
  // Generate enemy deck (3 to 5 cards)
  const deckSize = Math.min(5, 3 + Math.floor(floor / 15));
  const enemyDeck: ReturnType<typeof createCardInstance>[] = [];
  
  const availableTemplates = CARD_TEMPLATES.filter(t => permittedTiers.includes(t.tier));
  
  for (let i = 0; i < deckSize; i++) {
    const randomTemplate = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
    // Card level scales slowly
    const cardLevel = Math.min(5, 1 + Math.floor(floor / 10));
    enemyDeck.push(createCardInstance(randomTemplate, cardLevel));
  }
  
  // Boss drop
  let cardReward = undefined;
  if (isBoss) {
    const rareTemplates = CARD_TEMPLATES.filter(t => t.tier === 'silver' || t.tier === 'gold' || t.tier === 'legendary');
    cardReward = rareTemplates[Math.floor(Math.random() * rareTemplates.length)];
  }

  return {
    id: floor,
    name: isBoss ? `Abyssal Lord - Floor ${floor}` : `The Abyss - Floor ${floor}`,
    description: isBoss 
      ? `A terrifying guardian of the Abyss blocks your path. Defeat it to earn Shards and a guaranteed rare card!` 
      : `Endless descending catacombs. Face the dark entities that lurk in the shadows.`,
    energyCost: 1, // Always 1 energy
    goldReward,
    dustReward,
    shardsReward,
    enemyHeroName: isBoss ? 'Abyssal Overlord' : 'Abyss Dweller',
    enemyHeroHealth,
    enemyHeroImage: isBoss ? '/mobs/overlord.png' : '/mobs/dweller.png',
    enemyDeck,
    cardReward
  };
};


// Battle Pass Tiers
export const BATTLE_PASS_TIERS: BattlePassTier[] = [
  {
    level: 1,
    pointsRequired: 100,
    freeRewardType: 'gold',
    freeRewardAmount: 200,
    freeRewardLabel: '200 Gold',
    premiumRewardType: 'shards',
    premiumRewardAmount: 50,
    premiumRewardLabel: '50 Dark Shards'
  },
  {
    level: 2,
    pointsRequired: 200,
    freeRewardType: 'dust',
    freeRewardAmount: 50,
    freeRewardLabel: '50 Dark Dust',
    premiumRewardType: 'dust',
    premiumRewardAmount: 150,
    premiumRewardLabel: '150 Dark Dust'
  },
  {
    level: 3,
    pointsRequired: 300,
    freeRewardType: 'dust',
    freeRewardAmount: 100,
    freeRewardLabel: '100 Dark Dust',
    premiumRewardType: 'card',
    premiumRewardAmount: 1,
    premiumRewardLabel: 'Abyss Reaper (Silver)' // we will instantiate in claimant handler
  },
  {
    level: 4,
    pointsRequired: 400,
    freeRewardType: 'gold',
    freeRewardAmount: 500,
    freeRewardLabel: '500 Gold',
    premiumRewardType: 'shards',
    premiumRewardAmount: 200,
    premiumRewardLabel: '200 Dark Shards'
  },
  {
    level: 5,
    pointsRequired: 500,
    freeRewardType: 'card',
    freeRewardAmount: 1,
    freeRewardLabel: 'Random Gold Card',
    premiumRewardType: 'legendary_pack',
    premiumRewardAmount: 1,
    premiumRewardLabel: 'Exclusive Abyss Pack'
  }
];

// Airdrop and social tasks
export const AIRDROP_TASKS: AirdropTask[] = [
  {
    id: 'tg_channel',
    title: 'Subscribe to Telegram Channel',
    description: 'Join the Dark Covenant on Telegram to follow Airdrop announcements.',
    rewardType: 'shards',
    rewardAmount: 150,
    actionUrl: 'https://t.me/void_covenant_game'
  },
  {
    id: 'refer_friend',
    title: 'Invite a Dark Brother (Referral)',
    description: 'Share your referral link. Reward for each recruited ally.',
    rewardType: 'gold',
    rewardAmount: 1000,
  },
  {
    id: 'wallet_connect',
    title: 'Connect Solana Wallet',
    description: 'Link your Solana crypto wallet to prepare for the $VOID token airdrop.',
    rewardType: 'shards',
    rewardAmount: 200,
  },
  {
    id: 'retweet_x',
    title: 'Repost on Twitter / X',
    description: 'Tell the world about the fall of the Dark Throne and the upcoming listing.',
    rewardType: 'dust',
    rewardAmount: 80,
    actionUrl: 'https://x.com/void_covenant'
  }
];
