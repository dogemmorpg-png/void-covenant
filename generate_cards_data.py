import json

# 50 cards total. We categorize them by Tier.
# Bronze: 20
# Silver: 15
# Gold: 10
# Legendary: 5

cards = [
    # --- BRONZE (20) ---
    {"baseId": "skeleton_warrior", "name": "Skeleton Warrior", "tier": "bronze", "attack": 2, "health": 8, "delay": 1, "skills": [{"type": "vampirism", "value": 2}], "color": "slate", "desc": "A common footsoldier of the death legions, risen by the covenant's call.", "prompt": "Dark fantasy RPG card art of a classic undead skeleton warrior holding a rusty sword, glowing blue eyes, dark cemetery background, detailed."},
    {"baseId": "plague_rat", "name": "Plague Rat", "tier": "bronze", "attack": 1, "health": 6, "delay": 1, "skills": [{"type": "plague", "value": 1}], "color": "emerald", "desc": "A carrier of the plague pens, devouring the flesh of fallen heroes.", "prompt": "Dark fantasy RPG card art of a giant mutated plague rat with glowing green toxic eyes and festering boils, dark sewer background."},
    {"baseId": "cursed_witch", "name": "Cursed Witch", "tier": "bronze", "attack": 3, "health": 10, "delay": 2, "skills": [{"type": "hex", "value": 2}], "color": "purple", "desc": "A warlock weaving webs of corruption and casting void curses.", "prompt": "Dark fantasy RPG card art of a wicked old witch casting a purple hex spell, dark ragged robes, deep forest background."},
    {"baseId": "dark_acolyte", "name": "Dark Acolyte", "tier": "bronze", "attack": 2, "health": 12, "delay": 2, "skills": [{"type": "sacrifice", "value": 4}], "color": "crimson", "desc": "A fanatic willing to sacrifice another's soul for a dark blessing.", "prompt": "Dark fantasy RPG card art of a cultist acolyte in crimson robes holding a sacrificial dagger, bloody altar background."},
    
    {"baseId": "grave_ghoul", "name": "Grave Ghoul", "tier": "bronze", "attack": 3, "health": 9, "delay": 1, "skills": [{"type": "vampirism", "value": 1}], "color": "slate", "desc": "A feral undead beast that hungers for fresh corpses.", "prompt": "Dark fantasy RPG card art of a terrifying hunched ghoul with long claws tearing through dirt in a graveyard, glowing pale eyes."},
    {"baseId": "bone_archer", "name": "Bone Archer", "tier": "bronze", "attack": 4, "health": 6, "delay": 2, "skills": [{"type": "hex", "value": 1}], "color": "slate", "desc": "Skeletal archers whose arrows are tipped with dark magic.", "prompt": "Dark fantasy RPG card art of a skeleton archer drawing a bow with a glowing purple magic arrow, dark ruins background."},
    {"baseId": "swamp_zombie", "name": "Swamp Zombie", "tier": "bronze", "attack": 2, "health": 14, "delay": 2, "skills": [{"type": "plague", "value": 1}], "color": "emerald", "desc": "Dripping with toxic sludge, it spreads disease just by being near.", "prompt": "Dark fantasy RPG card art of a bloated zombie emerging from a glowing green toxic swamp, dripping with slime."},
    {"baseId": "blood_imp", "name": "Blood Imp", "tier": "bronze", "attack": 2, "health": 7, "delay": 1, "skills": [{"type": "sacrifice", "value": 2}], "color": "crimson", "desc": "A minor demon used as fodder for greater summoning rituals.", "prompt": "Dark fantasy RPG card art of a small, vicious red imp with bat wings grinning maliciously, fiery background."},
    {"baseId": "shade", "name": "Shade", "tier": "bronze", "attack": 3, "health": 5, "delay": 1, "skills": [{"type": "hex", "value": 2}], "color": "violet", "desc": "A restless spirit that drains the warmth from the living.", "prompt": "Dark fantasy RPG card art of a floating dark purple ghostly shade with hollow eyes, ethereal mist background."},
    {"baseId": "carrion_crow", "name": "Carrion Crow", "tier": "bronze", "attack": 1, "health": 4, "delay": 1, "skills": [{"type": "vampirism", "value": 2}], "color": "slate", "desc": "A cursed bird that feasts on the eyes of the dying.", "prompt": "Dark fantasy RPG card art of a giant terrifying black crow with glowing red eyes, sitting on a tombstone."},
    {"baseId": "rot_hound", "name": "Rot Hound", "tier": "bronze", "attack": 4, "health": 8, "delay": 2, "skills": [{"type": "plague", "value": 2}], "color": "emerald", "desc": "An undead dog, its bite infects the victim with severe rot.", "prompt": "Dark fantasy RPG card art of an undead zombie hound dog with exposed ribs and glowing green saliva, snarling."},
    {"baseId": "goblin_thief", "name": "Goblin Thief", "tier": "bronze", "attack": 3, "health": 7, "delay": 1, "skills": [{"type": "hex", "value": 1}], "color": "amber", "desc": "A sneaky creature of the dark that steals life force.", "prompt": "Dark fantasy RPG card art of a sinister goblin thief holding a poisoned dagger in a dark alleyway."},
    {"baseId": "mud_golem", "name": "Mud Golem", "tier": "bronze", "attack": 1, "health": 18, "delay": 3, "skills": [{"type": "sacrifice", "value": 5}], "color": "amber", "desc": "A slow, lumbering construct of cursed earth.", "prompt": "Dark fantasy RPG card art of a massive golem made of dark cursed mud and glowing runes, lumbering forward."},
    {"baseId": "vampire_bat", "name": "Vampire Bat", "tier": "bronze", "attack": 2, "health": 5, "delay": 1, "skills": [{"type": "vampirism", "value": 3}], "color": "crimson", "desc": "A giant bat that drains the blood of the unwary.", "prompt": "Dark fantasy RPG card art of a giant terrifying vampire bat swooping down in the moonlight, fangs bared."},
    {"baseId": "lost_soul", "name": "Lost Soul", "tier": "bronze", "attack": 1, "health": 8, "delay": 2, "skills": [{"type": "hex", "value": 3}], "color": "cyan", "desc": "Wandering spirits whose wails shatter the mind.", "prompt": "Dark fantasy RPG card art of a glowing pale blue ethereal lost soul, a tormented face in mist."},
    {"baseId": "cultist_brute", "name": "Cultist Brute", "tier": "bronze", "attack": 4, "health": 12, "delay": 3, "skills": [{"type": "sacrifice", "value": 3}], "color": "crimson", "desc": "A heavily muscled zealot corrupted by dark magic.", "prompt": "Dark fantasy RPG card art of a massive muscular cultist wearing an iron executioner mask, wielding a heavy mace."},
    {"baseId": "spore_carrier", "name": "Spore Carrier", "tier": "bronze", "attack": 1, "health": 10, "delay": 2, "skills": [{"type": "plague", "value": 2}], "color": "emerald", "desc": "A walking fungal infection, bursting with toxic spores.", "prompt": "Dark fantasy RPG card art of an undead creature covered in glowing green fungal growths and releasing toxic spores."},
    {"baseId": "skeleton_guard", "name": "Skeleton Guard", "tier": "bronze", "attack": 1, "health": 15, "delay": 2, "skills": [{"type": "vampirism", "value": 1}], "color": "slate", "desc": "Armored skeletons holding the line for the covenant.", "prompt": "Dark fantasy RPG card art of a heavily armored skeleton guard holding a large tower shield, dark castle walls."},
    {"baseId": "shadow_wisp", "name": "Shadow Wisp", "tier": "bronze", "attack": 2, "health": 3, "delay": 1, "skills": [{"type": "hex", "value": 2}], "color": "violet", "desc": "A fleeting shadow that curses those it touches.", "prompt": "Dark fantasy RPG card art of a small floating ball of dark purple shadow fire, eerie lighting."},
    {"baseId": "blood_thrall", "name": "Blood Thrall", "tier": "bronze", "attack": 3, "health": 10, "delay": 2, "skills": [{"type": "vampirism", "value": 2}], "color": "crimson", "desc": "A mind-controlled servant bound by blood magic.", "prompt": "Dark fantasy RPG card art of a pale thrall with glowing red veins visible on their skin, staring blankly."},

    # --- SILVER (15) ---
    {"baseId": "abyss_reaper", "name": "Abyss Reaper", "tier": "silver", "attack": 4, "health": 14, "delay": 2, "skills": [{"type": "hex", "value": 3}, {"type": "vampirism", "value": 3}], "color": "violet", "desc": "A merciless executioner of the Abyss, draining the life force of victims.", "prompt": "Dark fantasy RPG card art of a terrifying grim reaper floating in the abyss, wielding a glowing scythe."},
    {"baseId": "hell_rider", "name": "Hell Rider", "tier": "silver", "attack": 3, "health": 18, "delay": 2, "skills": [{"type": "plague", "value": 2}], "color": "amber", "desc": "A death knight on a spectral steed, bringing doom and decay.", "prompt": "Dark fantasy RPG card art of a death knight riding a flaming skeletal horse, fiery hellscape background."},
    {"baseId": "plague_doctor", "name": "Plague Doctor", "tier": "silver", "attack": 2, "health": 16, "delay": 2, "skills": [{"type": "plague", "value": 3}], "color": "emerald", "desc": "Spreading virulent diseases instead of curing them.", "prompt": "Dark fantasy RPG card art of a sinister plague doctor with a raven mask and glowing green vials, dark alley."},
    {"baseId": "vampire_knight", "name": "Vampire Knight", "tier": "silver", "attack": 5, "health": 15, "delay": 2, "skills": [{"type": "vampirism", "value": 4}], "color": "crimson", "desc": "Aristocrats of blood who fight with elegant, deadly precision.", "prompt": "Dark fantasy RPG card art of an elegant vampire knight in ornate crimson armor wielding a rapier, blood magic."},
    {"baseId": "bone_golem", "name": "Bone Golem", "tier": "silver", "attack": 4, "health": 24, "delay": 3, "skills": [{"type": "sacrifice", "value": 5}], "color": "slate", "desc": "A towering construct built from a thousand corpses.", "prompt": "Dark fantasy RPG card art of a gigantic terrifying golem made entirely of human bones and skulls, glowing blue eyes."},
    {"baseId": "banshee", "name": "Banshee", "tier": "silver", "attack": 6, "health": 10, "delay": 2, "skills": [{"type": "hex", "value": 4}], "color": "cyan", "desc": "Her scream curses the souls of those who hear it.", "prompt": "Dark fantasy RPG card art of a screaming ethereal banshee, ghostly pale blue and white, terrifying face."},
    {"baseId": "flesh_abomination", "name": "Flesh Abomination", "tier": "silver", "attack": 5, "health": 20, "delay": 3, "skills": [{"type": "plague", "value": 2}], "color": "emerald", "desc": "A stitched horror leaking toxic fluids.", "prompt": "Dark fantasy RPG card art of a grotesque stitched flesh golem Frankenstein monster leaking green acid."},
    {"baseId": "dark_templar", "name": "Dark Templar", "tier": "silver", "attack": 4, "health": 18, "delay": 2, "skills": [{"type": "vampirism", "value": 2}, {"type": "sacrifice", "value": 3}], "color": "purple", "desc": "Fallen knights who have sworn allegiance to the Void.", "prompt": "Dark fantasy RPG card art of a fallen dark templar knight in corrupted purple armor, wielding a dark greatsword."},
    {"baseId": "phantom_assassin", "name": "Phantom Assassin", "tier": "silver", "attack": 7, "health": 8, "delay": 1, "skills": [{"type": "hex", "value": 2}], "color": "violet", "desc": "A ghost that strikes from the shadows, bypassing armor.", "prompt": "Dark fantasy RPG card art of a ghostly shadow assassin holding spectral daggers, disappearing into smoke."},
    {"baseId": "blood_priest", "name": "Blood Priest", "tier": "silver", "attack": 3, "health": 16, "delay": 2, "skills": [{"type": "sacrifice", "value": 8}], "color": "crimson", "desc": "Masters of blood magic who channel their allies' life force.", "prompt": "Dark fantasy RPG card art of a sinister priest in blood-soaked robes holding a glowing red artifact."},
    {"baseId": "toxic_slime", "name": "Toxic Slime", "tier": "silver", "attack": 2, "health": 22, "delay": 3, "skills": [{"type": "plague", "value": 4}], "color": "emerald", "desc": "An acidic blob that dissolves anything it touches.", "prompt": "Dark fantasy RPG card art of a massive bubbling green toxic slime monster dissolving a skeleton."},
    {"baseId": "gargoyle", "name": "Gargoyle", "tier": "silver", "attack": 4, "health": 18, "delay": 2, "skills": [{"type": "vampirism", "value": 2}, {"type": "hex", "value": 2}], "color": "slate", "desc": "A stone statue brought to life by dark rituals.", "prompt": "Dark fantasy RPG card art of a demonic stone gargoyle coming to life with glowing red eyes, stormy sky."},
    {"baseId": "void_walker", "name": "Void Walker", "tier": "silver", "attack": 5, "health": 14, "delay": 2, "skills": [{"type": "hex", "value": 5}], "color": "purple", "desc": "An entity composed purely of void energy.", "prompt": "Dark fantasy RPG card art of a humanoid figure made entirely of swirling purple and black void galaxies."},
    {"baseId": "necromantic_totem", "name": "Necromantic Totem", "tier": "silver", "attack": 0, "health": 25, "delay": 4, "skills": [{"type": "sacrifice", "value": 10}], "color": "slate", "desc": "An immobile pillar of bones that constantly fuels the hero.", "prompt": "Dark fantasy RPG card art of a creepy totem pole made of human skulls and spines glowing with dark magic."},
    {"baseId": "dullahan", "name": "Dullahan", "tier": "silver", "attack": 6, "health": 16, "delay": 2, "skills": [{"type": "vampirism", "value": 3}], "color": "slate", "desc": "A headless horseman seeking to harvest souls.", "prompt": "Dark fantasy RPG card art of a headless horseman dullahan holding his own flaming head, dark forest."},

    # --- GOLD (10) ---
    {"baseId": "covenant_necromancer", "name": "Covenant Necromancer", "tier": "gold", "attack": 5, "health": 22, "delay": 3, "skills": [{"type": "plague", "value": 3}, {"type": "sacrifice", "value": 6}], "color": "cyan", "desc": "Master of forbidden arts, controlling the boundary between life and death.", "prompt": "Dark fantasy RPG card art of a master necromancer raising an army of the dead, glowing blue magic, epic."},
    {"baseId": "fallen_angel", "name": "Fallen Angel", "tier": "gold", "attack": 6, "health": 26, "delay": 3, "skills": [{"type": "vampirism", "value": 5}, {"type": "hex", "value": 4}], "color": "rose", "desc": "A former guardian of the heavens, cast down for pride and sworn to the Covenant.", "prompt": "Dark fantasy RPG card art of a beautiful but corrupted fallen angel with black feathered wings and a flaming sword."},
    {"baseId": "lich_king", "name": "Lich King", "tier": "gold", "attack": 7, "health": 24, "delay": 3, "skills": [{"type": "hex", "value": 6}, {"type": "vampirism", "value": 4}], "color": "cyan", "desc": "An undead monarch whose frozen heart commands the undead legions.", "prompt": "Dark fantasy RPG card art of an imposing skeletal Lich King wearing a frozen crown on a throne of ice and bones."},
    {"baseId": "blood_queen", "name": "Blood Queen", "tier": "gold", "attack": 8, "health": 20, "delay": 2, "skills": [{"type": "vampirism", "value": 7}], "color": "crimson", "desc": "The regal matriarch of the vampire clans, unquenchable in her thirst.", "prompt": "Dark fantasy RPG card art of a terrifying and elegant vampire queen sitting on a throne of blood, drinking from a chalice."},
    {"baseId": "plague_behemoth", "name": "Plague Behemoth", "tier": "gold", "attack": 5, "health": 35, "delay": 4, "skills": [{"type": "plague", "value": 5}], "color": "emerald", "desc": "A walking disaster that turns the land into a toxic wasteland.", "prompt": "Dark fantasy RPG card art of a gargantuan diseased behemoth monster crushing a village, green toxic clouds."},
    {"baseId": "soul_devourer", "name": "Soul Devourer", "tier": "gold", "attack": 6, "health": 28, "delay": 3, "skills": [{"type": "hex", "value": 4}, {"type": "sacrifice", "value": 8}], "color": "violet", "desc": "A demon that eats the very essence of its enemies.", "prompt": "Dark fantasy RPG card art of a terrifying shadow demon inhaling glowing souls into its massive maw."},
    {"baseId": "abyssal_dragon", "name": "Abyssal Dragon", "tier": "gold", "attack": 9, "health": 30, "delay": 4, "skills": [{"type": "hex", "value": 5}], "color": "purple", "desc": "A dragon corrupted by the void, breathing dark fire.", "prompt": "Dark fantasy RPG card art of a massive dark purple void dragon breathing black fire, epic fantasy scale."},
    {"baseId": "doom_bringer", "name": "Doom Bringer", "tier": "gold", "attack": 10, "health": 18, "delay": 2, "skills": [{"type": "vampirism", "value": 4}], "color": "amber", "desc": "A herald of the apocalypse, striking with immense power.", "prompt": "Dark fantasy RPG card art of a gigantic armored fiery demon wielding a massive fiery greatsword, bringing doom."},
    {"baseId": "spider_queen", "name": "Spider Queen", "tier": "gold", "attack": 6, "health": 25, "delay": 3, "skills": [{"type": "plague", "value": 4}, {"type": "hex", "value": 3}], "color": "emerald", "desc": "Mother of the brood, her venom causes agonizing death.", "prompt": "Dark fantasy RPG card art of a horrifying giant spider queen with glowing green venom dripping from her fangs, in a webbed cave."},
    {"baseId": "death_knight_champion", "name": "Death Knight Champion", "tier": "gold", "attack": 8, "health": 32, "delay": 3, "skills": [{"type": "vampirism", "value": 4}, {"type": "hex", "value": 2}], "color": "slate", "desc": "The most elite of the death knights, unyielding in combat.", "prompt": "Dark fantasy RPG card art of an imposing elite death knight champion in heavy gothic black armor with a glowing runesword."},

    # --- LEGENDARY (5) ---
    {"baseId": "void_overlord", "name": "Void Overlord", "tier": "legendary", "attack": 8, "health": 35, "delay": 3, "skills": [{"type": "hex", "value": 5}, {"type": "plague", "value": 4}, {"type": "vampirism", "value": 4}], "color": "red", "desc": "An ancient deity of the Abyss whose very presence poisons all living things.", "prompt": "Dark fantasy RPG card art of an ancient cosmic horror void overlord, thousands of eyes, dark red and black galaxy."},
    {"baseId": "belial_lord_of_lies", "name": "Belial, Lord of Lies", "tier": "legendary", "attack": 12, "health": 40, "delay": 3, "skills": [{"type": "hex", "value": 8}, {"type": "sacrifice", "value": 10}], "color": "purple", "desc": "A prime evil whose illusions shatter reality itself.", "prompt": "Dark fantasy RPG card art of Belial the Lord of Lies, a massive majestic but terrifying demonic entity with illusions swirling."},
    {"baseId": "dracula_the_first", "name": "Dracula, The First", "tier": "legendary", "attack": 10, "health": 38, "delay": 2, "skills": [{"type": "vampirism", "value": 10}], "color": "crimson", "desc": "The progenitor of all vampires. He cannot be stopped.", "prompt": "Dark fantasy RPG card art of Dracula the first vampire, an incredibly regal and terrifying vampire lord, blood moon background."},
    {"baseId": "pestilence_incarnate", "name": "Pestilence Incarnate", "tier": "legendary", "attack": 6, "health": 50, "delay": 4, "skills": [{"type": "plague", "value": 8}, {"type": "vampirism", "value": 5}], "color": "emerald", "desc": "The living embodiment of disease and decay. It outlasts everything.", "prompt": "Dark fantasy RPG card art of Pestilence Incarnate, a horrifying massive deity of rot and disease, green toxic aura."},
    {"baseId": "azrael_angel_of_death", "name": "Azrael, Angel of Death", "tier": "legendary", "attack": 15, "health": 30, "delay": 4, "skills": [{"type": "hex", "value": 5}, {"type": "sacrifice", "value": 15}], "color": "slate", "desc": "The final judge. His blade cuts through soul and flesh alike.", "prompt": "Dark fantasy RPG card art of Azrael the Angel of Death, six black wings, wielding a massive scythe of pure dark energy."}
]

# We want to format this into the cards.ts string.
def skill_str(skills):
    parts = []
    for s in skills:
        t = s['type']
        v = s['value']
        if t == 'sacrifice':
            desc = f"Sacrifice: destroys an ally, granting the hero +{v} HP."
        elif t == 'vampirism':
            desc = f"Vampirism: heals self for {v} HP on attack."
        elif t == 'hex':
            desc = f"Hex: increases enemy incoming damage by {v}."
        elif t == 'plague':
            desc = f"Plague: deals {v} damage to random enemies at end of turn."
        parts.append(f"{{ type: '{t}', value: {v}, description: '{desc}' }}")
    return ",\n      ".join(parts)

out_str = "export const CARD_TEMPLATES: CardTemplate[] = [\n"
for i, c in enumerate(cards):
    s_str = skill_str(c['skills'])
    # image string is the path to the card image
    img_path = f"/cards/{c['baseId']}.png"
    out_str += f"""  {{
    baseId: '{c['baseId']}',
    name: '{c['name']}',
    tier: '{c['tier']}',
    attack: {c['attack']},
    health: {c['health']},
    delay: {c['delay']},
    skills: [
      {s_str}
    ],
    image: '{img_path}',
    color: '{c['color']}',
    description: '{c['desc'].replace("'", "\\'")}'
  }}"""
    if i < len(cards) - 1:
        out_str += ",\n"
out_str += "\n];"

with open("cards_array.txt", "w", encoding="utf-8") as f:
    f.write(out_str)

import json
with open("prompts.json", "w", encoding="utf-8") as f:
    json.dump([{"id": c["baseId"], "prompt": c["prompt"]} for c in cards], f, indent=2)
