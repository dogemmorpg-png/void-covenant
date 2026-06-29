import os

# 1. CollectionDeckView.tsx
file_col = r"C:\Users\vaska\Desktop\void-covenant\src\components\CollectionDeckView.tsx"
with open(file_col, "r", encoding="utf-8") as f:
    c = f.read()

# import
if "getCardTierStyles" not in c:
    c = c.replace("import { Card, CardTemplate } from '../types';", "import { Card, CardTemplate } from '../types';\nimport { getCardTierStyles } from '../utils/tierStyles';")

# Grid cards replacement
old_grid = """className={`relative aspect-[3/4.2] rounded-xl border p-2 flex flex-col justify-between cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                      selectedCardId === card.id 
                        ? 'bg-[#1f2833] border-[#66fcf1] gothic-glow-blue' 
                        : 'bg-black border-amber-500/50 shadow-neon-gold'
                    }`}"""
new_grid = """className={`relative aspect-[3/4.2] rounded-xl p-2 flex flex-col justify-between cursor-pointer border ${getCardTierStyles(card.tier, selectedCardId === card.id, true)}`}"""
c = c.replace(old_grid, new_grid)

# Also there was a different one for 'bg-[#0b0c10] border-[#c5a880]/20' if the previous patch missed something
old_grid2 = """className={`relative aspect-[3/4.2] rounded-xl border p-2 flex flex-col justify-between cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                      selectedCardId === card.id 
                        ? 'bg-[#1f2833] border-[#66fcf1] gothic-glow-blue' 
                        : 'bg-[#0b0c10] border-[#c5a880]/20'
                    }`}"""
c = c.replace(old_grid2, new_grid)

# Deck slots replacement
old_deck = """className={`relative aspect-[3/4.2] rounded-xl border p-2 flex flex-col justify-between cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                        selectedCardId === card.id 
                          ? 'bg-[#1f2833] border-[#66fcf1] gothic-glow-blue' 
                          : 'bg-black border-amber-500/50 shadow-neon-gold'
                      }`}"""
new_deck = """className={`relative aspect-[3/4.2] rounded-xl p-2 flex flex-col justify-between cursor-pointer border ${getCardTierStyles(card.tier, selectedCardId === card.id, true)}`}"""
c = c.replace(old_deck, new_deck)

old_deck2 = """className={`relative aspect-[3/4.2] rounded-xl border p-2 flex flex-col justify-between cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                        selectedCardId === card.id 
                          ? 'bg-[#1f2833] border-[#66fcf1] gothic-glow-blue' 
                          : 'bg-[#0b0c10] border-[#c5a880]/20'
                      }`}"""
c = c.replace(old_deck2, new_deck)

with open(file_col, "w", encoding="utf-8") as f:
    f.write(c)

print("CollectionDeckView patched")
