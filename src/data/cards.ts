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
    image: '/cards/skeleton_warrior.webp',
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
    image: '/cards/plague_rat.webp',
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
    image: '/cards/cursed_witch.webp',
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
    image: '/cards/dark_acolyte.webp',
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
    image: '/cards/grave_ghoul.webp',
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
    image: '/cards/bone_archer.webp',
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
    image: '/cards/swamp_zombie.webp',
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
    image: '/cards/blood_imp.webp',
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
    image: '/cards/shade.webp',
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
    image: '/cards/carrion_crow.webp',
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
    image: '/cards/rot_hound.webp',
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
    image: '/cards/goblin_thief.webp',
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
    image: '/cards/mud_golem.webp',
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
    image: '/cards/vampire_bat.webp',
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
    image: '/cards/lost_soul.webp',
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
    image: '/cards/cultist_brute.webp',
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
    image: '/cards/spore_carrier.webp',
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
    image: '/cards/skeleton_guard.webp',
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
    image: '/cards/shadow_wisp.webp',
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
    image: '/cards/blood_thrall.webp',
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
    image: '/cards/abyss_reaper.webp',
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
    image: '/cards/hell_rider.webp',
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
    image: '/cards/plague_doctor.webp',
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
    image: '/cards/vampire_knight.webp',
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
    image: '/cards/bone_golem.webp',
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
    image: '/cards/banshee.webp',
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
    image: '/cards/flesh_abomination.webp',
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
    image: '/cards/dark_templar.webp',
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
    image: '/cards/phantom_assassin.webp',
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
    image: '/cards/blood_priest.webp',
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
    image: '/cards/toxic_slime.webp',
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
    image: '/cards/gargoyle.webp',
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
    image: '/cards/void_walker.webp',
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
    image: '/cards/necromantic_totem.webp',
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
    image: '/cards/dullahan.webp',
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
    image: '/cards/covenant_necromancer.webp',
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
    image: '/cards/fallen_angel.webp',
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
    image: '/cards/lich_king.webp',
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
    image: '/cards/blood_queen.webp',
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
    image: '/cards/plague_behemoth.webp',
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
    image: '/cards/soul_devourer.webp',
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
    image: '/cards/abyssal_dragon.webp',
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
    image: '/cards/doom_bringer.webp',
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
    image: '/cards/spider_queen.webp',
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
    image: '/cards/death_knight_champion.webp',
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
    image: '/cards/void_overlord.webp',
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
    image: '/cards/belial_lord_of_lies.webp',
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
    image: '/cards/dracula_the_first.webp',
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
    image: '/cards/pestilence_incarnate.webp',
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
    image: '/cards/azrael_angel_of_death.webp',
    color: 'slate',
    description: 'The final judge. His blade cuts through soul and flesh alike.'
  },
  {
    baseId: 'grave_digger',
    name: 'Grave Digger',
    tier: 'bronze',
    attack: 3,
    health: 8,
    delay: 1,
    skills: [],
    image: '/cards/grave_digger.webp',
    color: 'slate',
    description: 'A creepy mortal undertaker carrying a lantern and a dirt-caked shovel.'
  },
  {
    baseId: 'spitfire_toad',
    name: 'Spitfire Toad',
    tier: 'bronze',
    attack: 2,
    health: 14,
    delay: 2,
    skills: [],
    image: '/cards/spitfire_toad.webp',
    color: 'emerald',
    description: 'A bloated swamp toad covered in pustules, spitting toxic acid.'
  },
  {
    baseId: 'possessed_cleaver',
    name: 'Possessed Cleaver',
    tier: 'bronze',
    attack: 4,
    health: 6,
    delay: 1,
    skills: [],
    image: '/cards/possessed_cleaver.webp',
    color: 'crimson',
    description: 'A floating, blood-stained iron executioner axe bound by spectral chains.'
  },
  {
    baseId: 'petrified_basilisk',
    name: 'Petrified Basilisk',
    tier: 'bronze',
    attack: 3,
    health: 15,
    delay: 2,
    skills: [],
    image: '/cards/petrified_basilisk.webp',
    color: 'amber',
    description: 'A lizard-like beast half-turned to stone, possessing immense physical weight.'
  },
  {
    baseId: 'gothic_harpy',
    name: 'Gothic Harpy',
    tier: 'bronze',
    attack: 4,
    health: 8,
    delay: 1,
    skills: [],
    image: '/cards/gothic_harpy.webp',
    color: 'slate',
    description: 'A half-woman, half-bird monster with black feathers perched on a cathedral belfry.'
  },
  {
    baseId: 'crypt_wisp',
    name: 'Crypt Wisp',
    tier: 'bronze',
    attack: 3,
    health: 10,
    delay: 1,
    skills: [],
    image: '/cards/crypt_wisp.webp',
    color: 'cyan',
    description: 'A floating sphere of cold, blue graveyard fire that lights up ancient tombstones.'
  },
  {
    baseId: 'chasm_worm',
    name: 'Chasm Worm',
    tier: 'bronze',
    attack: 5,
    health: 18,
    delay: 3,
    skills: [],
    image: '/cards/chasm_worm.webp',
    color: 'emerald',
    description: 'A giant subterranean worm with rings of teeth emerging from a rocky fissure.'
  },
  {
    baseId: 'fallen_inquisitor',
    name: 'Fallen Inquisitor',
    tier: 'silver',
    attack: 5,
    health: 20,
    delay: 2,
    skills: [],
    image: '/cards/fallen_inquisitor.webp',
    color: 'violet',
    description: 'A sinister priest in an iron mask holding a cursed, burning scripture book.'
  },
  {
    baseId: 'stitched_chimera',
    name: 'Stitched Chimera',
    tier: 'silver',
    attack: 6,
    health: 24,
    delay: 3,
    skills: [],
    image: '/cards/stitched_chimera.webp',
    color: 'crimson',
    description: 'A grotesque lion-goat-snake hybrid stitched from various crypt monsters.'
  },
  {
    baseId: 'iron_maiden_golem',
    name: 'Iron Maiden Golem',
    tier: 'silver',
    attack: 4,
    health: 22,
    delay: 2,
    skills: [],
    image: '/cards/iron_maiden_golem.webp',
    color: 'slate',
    description: 'A living metal torture cage spiked with iron needles, walking on heavy iron gears.'
  },
  {
    baseId: 'tomb_weaver',
    name: 'Tomb Weaver',
    tier: 'silver',
    attack: 5,
    health: 18,
    delay: 2,
    skills: [],
    image: '/cards/tomb_weaver.webp',
    color: 'amber',
    description: 'A giant arachnid that weaves sticky, dark webbing around stone sarcophagi.'
  },
  {
    baseId: 'belfry_colossus',
    name: 'Belfry Colossus',
    tier: 'gold',
    attack: 8,
    health: 35,
    delay: 3,
    skills: [],
    image: '/cards/belfry_colossus.webp',
    color: 'slate',
    description: 'A massive stone giant carrying a giant heavy bronze cathedral bell on its back.'
  },
  {
    baseId: 'abyssal_leviathan',
    name: 'Abyssal Leviathan',
    tier: 'gold',
    attack: 10,
    health: 42,
    delay: 4,
    skills: [],
    image: '/cards/abyssal_leviathan.webp',
    color: 'violet',
    description: 'A giant prehistoric void sea leviathan with glowing violet scales and tentacles.'
  },
  {
    baseId: 'pharaoh_of_the_void',
    name: 'Pharaoh of the Void',
    tier: 'gold',
    attack: 7,
    health: 34,
    delay: 2,
    skills: [],
    image: '/cards/pharaoh_of_the_void.webp',
    color: 'amber',
    description: 'An ancient embalmed king in a gold funerary mask, wrapped in cursed void shrouds.'
  },
  {
    baseId: 'the_faceless_lord',
    name: 'The Faceless Lord',
    tier: 'legendary',
    attack: 11,
    health: 52,
    delay: 4,
    skills: [],
    image: '/cards/the_faceless_lord.webp',
    color: 'cyan',
    description: 'A tall humanoid in a grand gothic throne room, wearing a crown but having a hollow void face.'
  },
  {
    baseId: 'carrion_beetle',
    name: 'Carrion Beetle',
    tier: 'bronze',
    attack: 2,
    health: 8,
    delay: 1,
    skills: [
      { type: 'vampirism', value: 2, description: 'Vampirism: heals self for 2 HP on attack.' }
    ],
    image: '/cards/carrion_beetle.webp',
    color: 'emerald',
    description: 'A small flesh-eating beetle that nests inside rotting ribcages.'
  },
  {
    baseId: 'covenant_initiate',
    name: 'Covenant Initiate',
    tier: 'bronze',
    attack: 3,
    health: 10,
    delay: 2,
    skills: [
      { type: 'sacrifice', value: 3, description: 'Sacrifice: destroys an ally, granting the hero +3 HP.' }
    ],
    image: '/cards/covenant_initiate.webp',
    color: 'crimson',
    description: 'An aspiring dark acolyte willing to offer anything for forbidden secrets.'
  },
  {
    baseId: 'ghostly_specter',
    name: 'Ghostly Specter',
    tier: 'bronze',
    attack: 3,
    health: 7,
    delay: 1,
    skills: [
      { type: 'hex', value: 1, description: 'Hex: increases enemy incoming damage by 1.' }
    ],
    image: '/cards/ghostly_specter.webp',
    color: 'cyan',
    description: 'A shivering ghost that haunts dark corridors, chilling its victims to the bone.'
  },
  {
    baseId: 'sewage_rat',
    name: 'Sewage Rat',
    tier: 'bronze',
    attack: 1,
    health: 7,
    delay: 1,
    skills: [
      { type: 'plague', value: 1, description: 'Plague: deals 1 damage to random enemies at end of turn.' }
    ],
    image: '/cards/sewage_rat.webp',
    color: 'emerald',
    description: 'A vile sewer dweller carrying a highly contagious disease.'
  },
  {
    baseId: 'rotting_golem',
    name: 'Rotting Golem',
    tier: 'bronze',
    attack: 2,
    health: 14,
    delay: 2,
    skills: [
      { type: 'plague', value: 1, description: 'Plague: deals 1 damage to random enemies at end of turn.' }
    ],
    image: '/cards/rotting_golem.webp',
    color: 'slate',
    description: 'A clay golem stuffed with decaying flesh, leaking poisonous swamp gas.'
  },
  {
    baseId: 'shadow_stalker',
    name: 'Shadow Stalker',
    tier: 'silver',
    attack: 4,
    health: 16,
    delay: 2,
    skills: [
      { type: 'hex', value: 2, description: 'Hex: increases enemy incoming damage by 2.' }
    ],
    image: '/cards/shadow_stalker.webp',
    color: 'purple',
    description: 'A hunter born of the void, stalking prey from the dark shadows.'
  },
  {
    baseId: 'blood_fiend',
    name: 'Blood Fiend',
    tier: 'silver',
    attack: 4,
    health: 18,
    delay: 2,
    skills: [
      { type: 'vampirism', value: 3, description: 'Vampirism: heals self for 3 HP on attack.' }
    ],
    image: '/cards/blood_fiend.webp',
    color: 'rose',
    description: 'A horrific demon constructed from pure coagulated blood.'
  },
  {
    baseId: 'plague_spreader',
    name: 'Plague Spreader',
    tier: 'silver',
    attack: 3,
    health: 20,
    delay: 3,
    skills: [
      { type: 'plague', value: 2, description: 'Plague: deals 2 damage to random enemies at end of turn.' }
    ],
    image: '/cards/plague_spreader.webp',
    color: 'emerald',
    description: 'A fanatic tasked with spreading the plague across mortal lands.'
  },
  {
    baseId: 'dark_summoner',
    name: 'Dark Summoner',
    tier: 'silver',
    attack: 3,
    health: 16,
    delay: 2,
    skills: [
      { type: 'sacrifice', value: 6, description: 'Sacrifice: destroys an ally, granting the hero +6 HP.' }
    ],
    image: '/cards/dark_summoner.webp',
    color: 'crimson',
    description: 'Summons dark power by offering the blood of their servants.'
  },
  {
    baseId: 'void_reaver',
    name: 'Void Reaver',
    tier: 'gold',
    attack: 6,
    health: 26,
    delay: 2,
    skills: [
      { type: 'hex', value: 3, description: 'Hex: increases enemy incoming damage by 3.' }
    ],
    image: '/cards/void_reaver.webp',
    color: 'violet',
    description: 'A merciless warrior of the dark void, tearing holes in reality.'
  },
  {
    baseId: 'abyssal_monstrosity',
    name: 'Abyssal Monstrosity',
    tier: 'gold',
    attack: 7,
    health: 32,
    delay: 3,
    skills: [
      { type: 'vampirism', value: 4, description: 'Vampirism: heals self for 4 HP on attack.' }
    ],
    image: '/cards/abyssal_monstrosity.webp',
    color: 'slate',
    description: 'A colossal beast from the bottomless deeps of the void.'
  },
  {
    baseId: 'covenant_inquisitor',
    name: 'Covenant Inquisitor',
    tier: 'gold',
    attack: 6,
    health: 28,
    delay: 2,
    skills: [
      { type: 'sacrifice', value: 8, description: 'Sacrifice: destroys an ally, granting the hero +8 HP.' }
    ],
    image: '/cards/covenant_inquisitor.webp',
    color: 'crimson',
    description: 'A high-ranking inquisitor who enforces the dark laws through holy sacrifices.'
  },
  {
    baseId: 'plague_bringer',
    name: 'Plague Bringer',
    tier: 'gold',
    attack: 5,
    health: 30,
    delay: 3,
    skills: [
      { type: 'plague', value: 3, description: 'Plague: deals 3 damage to random enemies at end of turn.' }
    ],
    image: '/cards/plague_bringer.webp',
    color: 'emerald',
    description: 'A herald of pestilence, carrying rotting spores wherever he walks.'
  },
  {
    baseId: 'lilith_queen_of_vampires',
    name: 'Lilith, Queen of Vampires',
    tier: 'legendary',
    attack: 10,
    health: 38,
    delay: 3,
    skills: [
      { type: 'vampirism', value: 6, description: 'Vampirism: heals self for 6 HP on attack.' },
      { type: 'hex', value: 3, description: 'Hex: increases enemy incoming damage by 3.' }
    ],
    image: '/cards/lilith_queen_of_vampires.webp',
    color: 'rose',
    description: 'The mother of all vampires. Her gaze seduces, and her kiss drains the soul.'
  },
  {
    baseId: 'beelzebub_lord_of_flies',
    name: 'Beelzebub, Lord of Flies',
    tier: 'legendary',
    attack: 8,
    health: 45,
    delay: 4,
    skills: [
      { type: 'plague', value: 5, description: 'Plague: deals 5 damage to random enemies at end of turn.' },
      { type: 'sacrifice', value: 10, description: 'Sacrifice: destroys an ally, granting the hero +10 HP.' }
    ],
    image: '/cards/beelzebub_lord_of_flies.webp',
    color: 'emerald',
    description: 'The prince of demons. A swarm of flesh-eating flies follows his command.'
  },
  {
    baseId: 'crypt_bat',
    name: 'Crypt Bat',
    tier: 'bronze',
    attack: 2,
    health: 6,
    delay: 1,
    skills: [
      { type: 'vampirism', value: 1, description: 'Vampirism: heals self for 1 HP on attack.' }
    ],
    image: '/cards/crypt_bat.webp',
    color: 'rose',
    description: 'A red-eyed bat feeding on the blood of intruders in ancient crypts.'
  },
  {
    baseId: 'graveyard_ghoul',
    name: 'Graveyard Ghoul',
    tier: 'bronze',
    attack: 3,
    health: 9,
    delay: 2,
    skills: [
      { type: 'vampirism', value: 2, description: 'Vampirism: heals self for 2 HP on attack.' }
    ],
    image: '/cards/graveyard_ghoul.webp',
    color: 'emerald',
    description: 'A feral ghoul that digs up fresh graves to feast on decaying remains.'
  },
  {
    baseId: 'plague_beetle',
    name: 'Plague Beetle',
    tier: 'bronze',
    attack: 2,
    health: 12,
    delay: 2,
    skills: [
      { type: 'plague', value: 1, description: 'Plague: deals 1 damage to random enemies at end of turn.' }
    ],
    image: '/cards/plague_beetle.webp',
    color: 'emerald',
    description: 'A chitinous beetle that spreads pestilence from the rotting swamps.'
  },
  {
    baseId: 'spectral_stalker',
    name: 'Spectral Stalker',
    tier: 'bronze',
    attack: 3,
    health: 6,
    delay: 1,
    skills: [
      { type: 'hex', value: 1, description: 'Hex: increases enemy incoming damage by 1.' }
    ],
    image: '/cards/spectral_stalker.webp',
    color: 'cyan',
    description: 'A fleeting ghostly assassin whose touch weakens the target\'s resolve.'
  },
  {
    baseId: 'covenant_zealot',
    name: 'Covenant Zealot',
    tier: 'bronze',
    attack: 4,
    health: 8,
    delay: 2,
    skills: [
      { type: 'sacrifice', value: 4, description: 'Sacrifice: destroys an ally, granting the hero +4 HP.' }
    ],
    image: '/cards/covenant_zealot.webp',
    color: 'crimson',
    description: 'Driven by absolute faith, he eagerly offers himself to the void.'
  },
  {
    baseId: 'banshee_screamer',
    name: 'Banshee Screamer',
    tier: 'silver',
    attack: 4,
    health: 15,
    delay: 2,
    skills: [
      { type: 'hex', value: 2, description: 'Hex: increases enemy incoming damage by 2.' }
    ],
    image: '/cards/banshee_screamer.webp',
    color: 'purple',
    description: 'A tragic spirit whose piercing scream shatters the defense of any foe.'
  },
  {
    baseId: 'vampiric_mist',
    name: 'Vampiric Mist',
    tier: 'silver',
    attack: 3,
    health: 18,
    delay: 2,
    skills: [
      { type: 'vampirism', value: 3, description: 'Vampirism: heals self for 3 HP on attack.' }
    ],
    image: '/cards/vampiric_mist.webp',
    color: 'rose',
    description: 'A sentient crimson cloud that drains blood through the pores of its victims.'
  },
  {
    baseId: 'plague_aberration',
    name: 'Plague Aberration',
    tier: 'silver',
    attack: 4,
    health: 16,
    delay: 2,
    skills: [
      { type: 'plague', value: 2, description: 'Plague: deals 2 damage to random enemies at end of turn.' }
    ],
    image: '/cards/plague_aberration.webp',
    color: 'emerald',
    description: 'A grotesque blob of mutated tissue dripping with infectious slime.'
  },
  {
    baseId: 'blood_cult_priest',
    name: 'Blood Cult Priest',
    tier: 'silver',
    attack: 3,
    health: 17,
    delay: 2,
    skills: [
      { type: 'sacrifice', value: 7, description: 'Sacrifice: destroys an ally, granting the hero +7 HP.' }
    ],
    image: '/cards/blood_cult_priest.webp',
    color: 'crimson',
    description: 'He channels the life force of lesser souls to mend the wounds of his masters.'
  },
  {
    baseId: 'void_tormenter',
    name: 'Void Tormenter',
    tier: 'gold',
    attack: 6,
    health: 25,
    delay: 2,
    skills: [
      { type: 'hex', value: 3, description: 'Hex: increases enemy incoming damage by 3.' }
    ],
    image: '/cards/void_tormenter.webp',
    color: 'violet',
    description: 'A terrifying shadow lord that feeds on the pain and despair of mortals.'
  },
  {
    baseId: 'abyssal_devourer',
    name: 'Abyssal Devourer',
    tier: 'gold',
    attack: 5,
    health: 32,
    delay: 3,
    skills: [
      { type: 'vampirism', value: 5, description: 'Vampirism: heals self for 5 HP on attack.' }
    ],
    image: '/cards/abyssal_devourer.webp',
    color: 'slate',
    description: 'A bottomless gullet of teeth and void energy that absorbs life directly.'
  },
  {
    baseId: 'covenant_archon',
    name: 'Covenant Archon',
    tier: 'gold',
    attack: 7,
    health: 24,
    delay: 2,
    skills: [
      { type: 'sacrifice', value: 9, description: 'Sacrifice: destroys an ally, granting the hero +9 HP.' }
    ],
    image: '/cards/covenant_archon.webp',
    color: 'crimson',
    description: 'A divine executioner who leads the covenant sacrifices under the solar eclipse.'
  },
  {
    baseId: 'elizabeth_bathory',
    name: 'Elizabeth Bathory',
    tier: 'legendary',
    attack: 9,
    health: 40,
    delay: 3,
    skills: [
      { type: 'vampirism', value: 5, description: 'Vampirism: heals self for 5 HP on attack.' },
      { type: 'sacrifice', value: 8, description: 'Sacrifice: destroys an ally, granting the hero +8 HP.' }
    ],
    image: '/cards/elizabeth_bathory.webp',
    color: 'rose',
    description: 'The blood countess. She bathes in the blood of her maidens to preserve her eternal youth.'
  },
  {
    baseId: 'mephistopheles',
    name: 'Mephistopheles',
    tier: 'legendary',
    attack: 8,
    health: 42,
    delay: 3,
    skills: [
      { type: 'hex', value: 4, description: 'Hex: increases enemy incoming damage by 4.' },
      { type: 'plague', value: 4, description: 'Plague: deals 4 damage to random enemies at end of turn.' }
    ],
    image: '/cards/mephistopheles.webp',
    color: 'violet',
    description: 'A cunning archdevil who seals soul bargains in crimson ink.'
  }
];

// Helper to get true mana cost for any card instance or template
export function getCardManaCost(card: Partial<Card> | Partial<CardTemplate> | null | undefined): number {
  if (!card) return 1;
  const template = CARD_TEMPLATES.find(t => t.baseId === (card as any).baseId || t.name === (card as any).name);
  if (template && typeof template.manaCost === 'number' && template.manaCost > 0) {
    return template.manaCost;
  }
  const tier = (card.tier || template?.tier || 'bronze').toLowerCase();
  const delay = card.delay ?? template?.delay ?? 1;

  if (typeof card.manaCost === 'number' && card.manaCost > 0) {
    // If the tier is silver/gold/legendary and manaCost is 1, it's a corrupted default value, recalculate:
    if (card.manaCost === 1) {
      if (tier === 'silver') return 2;
      if (tier === 'gold') return 3;
      if (tier === 'legendary') return 4;
      if (delay > 1) return 2;
    }
    return card.manaCost;
  }

  if (tier === 'legendary') return 4;
  if (tier === 'gold') return 3;
  if (tier === 'silver') return 2;
  if (delay > 1) return 2;
  return 1;
}

// Smart tier evolution skill picker avoiding duplicates
export function getEvolutionBonusSkill(existingSkills: CardSkill[], nextTier: CardTier): CardSkill | null {
  const existingTypes = new Set((existingSkills || []).map(s => s.type));

  if (nextTier === 'silver') {
    // Silver priority: vampirism -> shield -> plague -> hex
    if (!existingTypes.has('vampirism')) {
      return {
        type: 'vampirism',
        value: 2,
        description: 'Silver Vampirism: heals self for 2 HP on attack.'
      };
    }
    if (!existingTypes.has('shield')) {
      return {
        type: 'shield',
        value: 1,
        description: 'Silver Ward: enters battle protected with 1 Barrier charge.'
      };
    }
    if (!existingTypes.has('plague')) {
      return {
        type: 'plague',
        value: 1,
        description: 'Silver Plague: deals 1 damage to a random enemy.'
      };
    }
    if (!existingTypes.has('hex')) {
      return {
        type: 'hex',
        value: 2,
        description: 'Silver Hex: +2 to enemy incoming damage.'
      };
    }
  } else if (nextTier === 'gold') {
    // Gold priority: plague -> hex -> shield -> vampirism
    if (!existingTypes.has('plague')) {
      return {
        type: 'plague',
        value: 2,
        description: 'Golden Plague: deals 2 damage to a random enemy.'
      };
    }
    if (!existingTypes.has('hex')) {
      return {
        type: 'hex',
        value: 2,
        description: 'Golden Hex: +2 to enemy incoming damage.'
      };
    }
    if (!existingTypes.has('shield')) {
      return {
        type: 'shield',
        value: 1,
        description: 'Golden Ward: enters battle protected with 1 Barrier charge.'
      };
    }
    if (!existingTypes.has('vampirism')) {
      return {
        type: 'vampirism',
        value: 3,
        description: 'Golden Vampirism: heals self for 3 HP on attack.'
      };
    }
  } else if (nextTier === 'legendary') {
    // Legendary priority: hex -> plague -> vampirism -> sacrifice
    if (!existingTypes.has('hex')) {
      return {
        type: 'hex',
        value: 3,
        description: 'Legendary Hex: +3 to enemy incoming damage.'
      };
    }
    if (!existingTypes.has('plague')) {
      return {
        type: 'plague',
        value: 3,
        description: 'Legendary Plague: deals 3 damage to a random enemy.'
      };
    }
    if (!existingTypes.has('vampirism')) {
      return {
        type: 'vampirism',
        value: 4,
        description: 'Legendary Vampirism: heals self for 4 HP on attack.'
      };
    }
    if (!existingTypes.has('sacrifice')) {
      return {
        type: 'sacrifice',
        value: 4,
        description: 'Legendary Sacrament: sacrifices ally on play, healing Hero for 4 HP.'
      };
    }
  }
  return null;
}

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

  const manaCost = getCardManaCost({ ...template, tier: template.tier, delay: template.delay });

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
    manaCost,
    skills: scaledSkills,
    image: template.image,
    color: template.color,
    xp: 0,
    maxXp: level * 50 // 50, 100, 150, 200, 250 XP
  };
}

// Generate the initial starter deck for a new player
export function getStarterDeck(): Card[] {
  // 10 starter cards
  const templates = [
    CARD_TEMPLATES.find(c => c.baseId === 'skeleton_warrior')!,
    CARD_TEMPLATES.find(c => c.baseId === 'skeleton_warrior')!,
    CARD_TEMPLATES.find(c => c.baseId === 'skeleton_warrior')!,
    CARD_TEMPLATES.find(c => c.baseId === 'plague_rat')!,
    CARD_TEMPLATES.find(c => c.baseId === 'plague_rat')!,
    CARD_TEMPLATES.find(c => c.baseId === 'plague_rat')!,
    CARD_TEMPLATES.find(c => c.baseId === 'cursed_witch')!,
    CARD_TEMPLATES.find(c => c.baseId === 'cursed_witch')!,
    CARD_TEMPLATES.find(c => c.baseId === 'dark_acolyte')!,
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
  const shardsReward = 0;
  
  // Pick permitted card tiers based on floor
  const permittedTiers = ['bronze'];
  if (floor > 5) permittedTiers.push('silver');
  if (floor > 15) permittedTiers.push('gold');
  if (floor > 30) permittedTiers.push('legendary');
  
  // Generate enemy deck (12 for normal stages, 14 for Bosses)
  const deckSize = isBoss ? 14 : 12;
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

  return {
    id: floor,
    name: isBoss ? `Abyssal Lord - Floor ${floor}` : `The Abyss - Floor ${floor}`,
    description: isBoss 
      ? `A terrifying guardian of the Abyss blocks your path. Defeat it to claim victory and descend deeper!` 
      : `Endless descending catacombs. Face the dark entities that lurk in the shadows.`,
    energyCost: 1, // Always 1 energy
    goldReward,
    dustReward,
    shardsReward,
    enemyHeroName: isBoss ? 'Abyssal Overlord' : 'Abyss Dweller',
    enemyHeroHealth,
    enemyHeroImage: isBoss ? '/mobs/overlord.webp' : '/mobs/dweller.webp',
    enemyDeck,
    cardReward
  };
};




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
