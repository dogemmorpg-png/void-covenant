import os
import re

filepath = r"C:\Users\vaska\Desktop\void-covenant\src\data\cards.ts"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# We want to remove CAMPAIGN_STAGES and replace it with generateCampaignStage

replacement = """
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
    enemyHeroImage: isBoss ? 'Crown' : 'Skull',
    enemyDeck,
    cardReward
  };
};
"""

# Find where CAMPAIGN_STAGES begins
pattern = re.compile(r'// Campaign stages\nexport const CAMPAIGN_STAGES: CampaignStage\[\] = \[.*?\];', re.DOTALL)

if pattern.search(content):
    new_content = pattern.sub(replacement, content)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("cards.ts patched to use generateCampaignStage")
else:
    print("CAMPAIGN_STAGES not found. Maybe already patched?")
